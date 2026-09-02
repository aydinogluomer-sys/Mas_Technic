#!/usr/bin/env node
/**
 * MOTION AUDIT — Phase 05 measurement instrument.
 *
 * WHY THIS EXISTS
 * ---------------
 * Phase 05's acceptance criteria are all *numbers*: at-rest hidden-content
 * counts under reduced motion (defect B28), cumulative layout shift caused by
 * the entrance choreography, frame pacing through the core scroll path, and
 * the density difference between the mobile and desktop motion layers. None of
 * those can be judged from a screenshot or asserted from a diff, so they are
 * measured here and the raw numbers are printed.
 *
 * The script never asserts a target on its own except in `rest` mode, which is
 * a genuine gate: content that a sighted user with `prefers-reduced-motion:
 * reduce` cannot see WITHOUT SCROLLING is broken content, not a style choice.
 *
 * MODES
 * -----
 *   --mode=rest      reduced motion, no scrolling: how much content is hidden
 *                    behind an un-triggered reveal, per route, per viewport.
 *                    Exit 1 if any route hides text-bearing content.
 *   --mode=enabled   the counter-proof to `rest`: motion ALLOWED, per route,
 *                    how much is still armed before scrolling and how much is
 *                    left hidden after. Fixing `rest` must not turn the
 *                    choreography off for everyone.
 *   --mode=cls       motion ENABLED, scripted scroll of `/`: layout-shift
 *                    entries reported by the browser itself.
 *   --mode=frames    motion ENABLED, scripted scroll of `/`: rAF pacing.
 *   --mode=density   how many elements the motion layer touches at 375 vs 1280.
 *   --mode=guard     SOURCE check, no browser: nobody re-imported `motion`
 *                    straight from `framer-motion` and so bypassed the
 *                    reduced-motion primitive. Exit 1 on any breach.
 *   --mode=cursor    does a pointer exist? The stylesheet hides the native
 *                    cursor on desktop; measure that something replaces it,
 *                    including under reduced motion.
 *
 * USAGE
 *   node scripts/motion-audit.mjs --mode=rest
 *   MOTION_AUDIT_BASE_URL=http://localhost:4188 node scripts/motion-audit.mjs --mode=cls
 *
 * `dist/` must already be built unless a base URL is supplied.
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MODE = (process.argv.find((a) => a.startsWith("--mode=")) ?? "--mode=rest").slice(7);
const JSON_OUT = process.argv.includes("--json");
const PORT = Number(process.env.MOTION_AUDIT_PORT ?? 4188);
const EXTERNAL_BASE = process.env.MOTION_AUDIT_BASE_URL;

/** The landing plus four inner routes from three different page families. */
const ROUTES = [
  ["/", "landing"],
  ["/hizmetler/cnc-frezeleme", "service detail (B28 reference route)"],
  ["/iletisim", "contact"],
  ["/malzemeler/aluminyum", "material category"],
  ["/hakkimizda", "about"],
];

const VIEWPORTS = [
  { name: "desktop-1280", width: 1280, height: 900, mobile: false },
  { name: "mobile-375", width: 375, height: 812, mobile: true },
];

/* ── Chromium resolution — same constraint as `scripts/grid-axis-probe.mjs`:
   the pinned revision is not installed on this machine (known blocker B08), so
   an installed Chrome/Edge is used rather than installing anything. ───────── */
function resolveChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "/bin/chromium",
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (found) return found;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
    ?? (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "ms-playwright") : undefined);
  if (!root || !existsSync(root)) return undefined;
  return readdirSync(root)
    .filter((entry) => entry.startsWith("chromium-"))
    .map((entry) => join(root, entry, "chrome-win", "chrome.exe"))
    .find((candidate) => existsSync(candidate));
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch { /* not up yet */ }
    if (Date.now() > deadline) throw new Error(`server did not answer at ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

function startPreview(port) {
  const vite = join("node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [vite, "preview", "--port", String(port), "--strictPort"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

/* ══ IN-PAGE PROBES ═══════════════════════════════════════════════════════ */

/**
 * At-rest visibility census.
 *
 * `opacity` is multiplied down the ancestor chain because the reveal pattern
 * this measures almost always hides a CONTAINER, not the text node. Counting
 * only an element's own `opacity` reads 1 on every paragraph inside a
 * transparent section and reports a clean page that nobody can read.
 *
 * Two counts are produced deliberately:
 *   `elements`  — every laid-out element, the same population QA sampled;
 *   `textNodes` — elements that carry their own visible text. That is the
 *                 gate: a decorative transparent wrapper is not a defect, a
 *                 transparent paragraph is.
 */
const REST_PROBE = () => {
  const all = [...document.querySelectorAll("body *")];
  const laidOut = all.filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  });

  const effective = (el) => {
    let node = el;
    let opacity = 1;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none") return -1;
      opacity *= Number.parseFloat(style.opacity);
      if (opacity < 0.01) return 0;
      node = node.parentElement;
    }
    return opacity;
  };

  const ownText = (el) => [...el.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent.trim())
    .join(" ")
    .trim();

  const hidden = [];
  const hiddenText = [];
  /* Elements that are transparent but carry no text of their own. These are
     not automatically fine — a transparent wrapper can still be swallowing a
     whole subtree — so a sample is printed and has to be read, rather than
     silently subtracted from the count. */
  const hiddenSilent = [];
  for (const el of laidOut) {
    const value = effective(el);
    if (value !== 0) continue;
    hidden.push(el);
    const text = ownText(el);
    const describe = () => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") ?? "").slice(0, 60),
      text: (el.textContent ?? "").trim().slice(0, 40),
    });
    if (text.length > 1 && el.closest("[aria-hidden='true']") === null) {
      hiddenText.push({ ...describe(), text: text.slice(0, 60) });
    } else if (hiddenSilent.length < 20) {
      hiddenSilent.push(describe());
    }
  }

  return {
    elements: laidOut.length,
    hidden: hidden.length,
    hiddenText: hiddenText.length,
    samples: hiddenText.slice(0, 8),
    silent: hiddenSilent,
  };
};

/**
 * Motion-layer density: how many laid-out elements the stylesheet actually
 * arms with a transition or an animation. Measured immediately after load,
 * BEFORE reveals settle, because a `transition` declaration survives the
 * reveal while an `animation` may not.
 */
const DENSITY_PROBE = () => {
  const nodes = [...document.querySelectorAll(".tl-root *")].filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  });
  let transitioned = 0;
  let animated = 0;
  let delayed = 0;
  let transformed = 0;
  for (const el of nodes) {
    const style = getComputedStyle(el);
    const durations = style.transitionDuration.split(",").map((v) => Number.parseFloat(v) || 0);
    const delays = style.transitionDelay.split(",").map((v) => Number.parseFloat(v) || 0);
    if (durations.some((d) => d > 0)) transitioned += 1;
    if (delays.some((d) => d > 0)) delayed += 1;
    if (style.animationName !== "none") animated += 1;
    if (style.transform !== "none") transformed += 1;
  }
  return { elements: nodes.length, transitioned, animated, delayed, transformed };
};

/* ══ MODES ════════════════════════════════════════════════════════════════ */

async function runRest(browser, baseURL) {
  const results = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      baseURL,
    });
    const page = await context.newPage();
    for (const [route, label] of ROUTES) {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForLoadState("networkidle").catch(() => {});
      // No scrolling. That is the whole point of the measurement.
      await page.waitForTimeout(1200);
      const census = await page.evaluate(REST_PROBE);
      results.push({ viewport: viewport.name, route, label, ...census });
    }
    await context.close();
  }
  return results;
}

/**
 * The counter-proof to `--mode=rest`.
 *
 * Fixing B28 must not degenerate into "reveals are off for everybody". With
 * motion ALLOWED, a scroll-triggered reveal has to still be armed before the
 * user reaches it and resolved after. So this measures the same at-rest hidden
 * count twice: once on load without scrolling, once after scrolling the route
 * end to end and back to the top.
 *
 * Read it as: `armed` should be clearly > 0 (the choreography is alive) and
 * `afterScroll` should be ~0 (it completes and nothing is stranded).
 */
async function runEnabled(browser, baseURL) {
  const results = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
      baseURL,
    });
    const page = await context.newPage();
    for (const [route, label] of ROUTES) {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1200);
      const armed = await page.evaluate(REST_PROBE);

      const height = await page.evaluate(() => document.body.scrollHeight);
      const step = Math.round(viewport.height * 0.6);
      for (let y = 0; y < height; y += step) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(220);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1200);
      const after = await page.evaluate(REST_PROBE);

      results.push({
        viewport: viewport.name,
        route,
        label,
        elements: armed.elements,
        armed: armed.hidden,
        armedText: armed.hiddenText,
        afterScroll: after.hidden,
        afterScrollText: after.hiddenText,
        // Anything still hidden AFTER the whole route has been scrolled is a
        // reveal that never fired, not a reveal that is waiting.
        samples: after.samples,
      });
    }
    await context.close();
  }
  return results;
}

async function runCls(browser, baseURL) {
  const results = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      baseURL,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__shifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__shifts.push({
            value: entry.value,
            time: Math.round(entry.startTime),
            sources: (entry.sources ?? []).map((s) => {
              const node = s.node;
              if (!node || !node.tagName) return "?";
              return `${node.tagName.toLowerCase()}.${(node.getAttribute?.("class") ?? "").split(" ")[0]}`;
            }),
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    // Scripted scroll through the whole landing, one viewport-height step at a
    // time, pausing long enough for each band's entrance to run to completion.
    const height = await page.evaluate(() => document.body.scrollHeight);
    const step = Math.round(viewport.height * 0.75);
    for (let y = 0; y < height; y += step) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(320);
    }
    await page.waitForTimeout(1200);

    const shifts = await page.evaluate(() => window.__shifts);
    const total = shifts.reduce((sum, s) => sum + s.value, 0);
    const worst = [...shifts].sort((a, b) => b.value - a.value).slice(0, 5);
    results.push({ viewport: viewport.name, cls: Number(total.toFixed(5)), entries: shifts.length, worst });
    await context.close();
  }
  return results;
}

async function runFrames(browser, baseURL) {
  const results = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      baseURL,
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1200);

    const pacing = await page.evaluate(async () => {
      const frames = [];
      let last = performance.now();
      let running = true;
      const tick = (now) => {
        frames.push(now - last);
        last = now;
        if (running) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      // Continuous scroll, ~14px per frame for ~9 s of the core path.
      const total = document.body.scrollHeight - window.innerHeight;
      const startedAt = performance.now();
      await new Promise((resolve) => {
        const drive = () => {
          const elapsed = (performance.now() - startedAt) / 9000;
          window.scrollTo(0, Math.min(total, total * elapsed));
          if (elapsed >= 1) return resolve();
          requestAnimationFrame(drive);
        };
        requestAnimationFrame(drive);
      });
      running = false;

      const measured = frames.slice(3);
      const sorted = [...measured].sort((a, b) => a - b);
      const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
      let longestRun = 0;
      let run = 0;
      for (const frame of measured) {
        run = frame > 32 ? run + 1 : 0;
        if (run > longestRun) longestRun = run;
      }
      return {
        frames: measured.length,
        median: Number(at(0.5).toFixed(2)),
        p95: Number(at(0.95).toFixed(2)),
        worst: Number(Math.max(...measured).toFixed(2)),
        over32ms: measured.filter((f) => f > 32).length,
        over50ms: measured.filter((f) => f > 50).length,
        longestConsecutiveSlowRun: longestRun,
      };
    });
    results.push({ viewport: viewport.name, ...pacing });
    await context.close();
  }
  return results;
}

async function runDensity(browser, baseURL) {
  const results = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      baseURL,
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(900);
    const census = await page.evaluate(DENSITY_PROBE);
    results.push({ viewport: viewport.name, ...census });
    await context.close();
  }
  return results;
}

/**
 * Is there a pointer?
 *
 * `src/index.css` sets `cursor: none !important` on html/body/a/button inside
 * `@media (min-width: 901px) and (pointer: fine)` — unconditionally, with no
 * reduced-motion escape and no dependency on the replacement mounting. So the
 * question "should the custom cursor stay?" is not only aesthetic: if it ever
 * declines to render, a desktop user is left with no pointer at all. This
 * reports the computed `cursor` on the elements that rule names, plus whether
 * a replacement is in the DOM, with motion both allowed and reduced.
 */
const CURSOR_PROBE = () => {
  const read = (selector) => {
    const el = document.querySelector(selector);
    return el ? getComputedStyle(el).cursor : "n/a";
  };
  return {
    body: getComputedStyle(document.body).cursor,
    link: read("a[href]"),
    button: read("button"),
    replacementNodes: document.querySelectorAll("[data-custom-cursor]").length,
  };
};

async function runCursor(browser, baseURL) {
  const results = [];
  for (const motionMode of ["no-preference", "reduce"]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: motionMode,
      baseURL,
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    await page.mouse.move(640, 450);
    await page.waitForTimeout(400);
    results.push({ reducedMotion: motionMode, ...(await page.evaluate(CURSOR_PROBE)) });
    await context.close();
  }
  return results;
}

/* ══ SOURCE GUARD ═════════════════════════════════════════════════════════
   Defect B28's repair is only durable if it cannot be routed around. Every
   public component reaches Framer through `@/components/shell/motion`, which
   resolves a reveal to its finished state under `prefers-reduced-motion`. The
   one way to lose that is to import `motion` from `framer-motion` again, so
   that is what this refuses.

   Four files are exempt because this phase's packet forbids editing them
   (`Header.tsx`, `navigation/**`) or they are out of the public surface
   (`admin/**`). Exemption is not a free pass: an exempt file is still failed
   if it uses `whileInView`, since that is the construct that hides content. */
const GUARD_PRIMITIVE = "src/components/shell/motion.tsx";
const GUARD_EXEMPT = new Set([
  "src/components/Header.tsx",
  "src/components/navigation/NavCategoryPanel.tsx",
  "src/components/navigation/NavFamilyRail.tsx",
  "src/components/navigation/NavTrigger.tsx",
  "src/components/admin/DashboardHome.tsx",
]);

function sourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.(tsx|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

function runGuard() {
  const breaches = [];
  for (const file of sourceFiles("src")) {
    const rel = file.split(/[\\/]/).join("/");
    if (rel === GUARD_PRIMITIVE) continue; // the primitive is the one legal importer
    const source = readFileSync(file, "utf8");
    const imports = source.match(/import\s*(?:type\s*)?\{[^}]*\}\s*from\s*["']framer-motion["']/g) ?? [];
    const importsMotion = imports.some((line) =>
      line
        .replace(/^import\s*(?:type\s*)?\{|\}\s*from[\s\S]*$/g, "")
        .split(",")
        .map((s) => s.trim())
        .includes("motion"),
    );

    if (GUARD_EXEMPT.has(rel)) {
      if (/whileInView/.test(source)) {
        breaches.push({ file: rel, why: "exempt file uses whileInView — it cannot reach the primitive" });
      }
      continue;
    }
    if (importsMotion) {
      breaches.push({ file: rel, why: 'imports `motion` from "framer-motion" instead of "@/components/shell/motion"' });
    }
  }
  return breaches;
}

/* ══ DRIVER ═══════════════════════════════════════════════════════════════ */

async function main() {
  // Static mode: no build, no server, no browser — it reads the source tree.
  if (MODE === "guard") {
    const breaches = runGuard();
    if (JSON_OUT) console.log(JSON.stringify({ mode: MODE, results: breaches }, null, 2));
    else {
      console.log("\nMOTION AUDIT — mode=guard (source)\n");
      breaches.forEach((b) => console.log(`  ${b.file}\n      ${b.why}`));
      console.log(breaches.length
        ? `\nFAIL — ${breaches.length} file(s) bypass the reduced-motion primitive.`
        : "\nPASS — every motion call site goes through @/components/shell/motion.");
    }
    process.exit(breaches.length ? 1 : 0);
  }

  const baseURL = EXTERNAL_BASE ?? `http://localhost:${PORT}`;
  let server;
  if (!EXTERNAL_BASE) {
    if (!existsSync("dist/index.html")) {
      console.error("dist/ is missing — run `npm run build` first.");
      process.exit(2);
    }
    server = startPreview(PORT);
  }
  const executablePath = resolveChromium();
  let browser;
  let failed = false;
  try {
    await waitForServer(baseURL, 90_000);
    browser = await chromium.launch(executablePath ? { executablePath } : {});

    let results;
    if (MODE === "rest") results = await runRest(browser, baseURL);
    else if (MODE === "cls") results = await runCls(browser, baseURL);
    else if (MODE === "frames") results = await runFrames(browser, baseURL);
    else if (MODE === "density") results = await runDensity(browser, baseURL);
    else if (MODE === "cursor") results = await runCursor(browser, baseURL);
    else if (MODE === "enabled") results = await runEnabled(browser, baseURL);
    else throw new Error(`unknown --mode=${MODE}`);

    if (JSON_OUT) {
      console.log(JSON.stringify({ mode: MODE, results }, null, 2));
    } else {
      console.log(`\nMOTION AUDIT — mode=${MODE}  base=${baseURL}\n`);
      for (const row of results) {
        const { samples, worst, silent, ...rest } = row;
        console.log(Object.entries(rest).map(([k, v]) => `${k}=${v}`).join("  "));
        if (samples?.length) samples.forEach((s) => console.log(`      hidden text: <${s.tag} class="${s.cls}"> ${JSON.stringify(s.text)}`));
        if (silent?.length) silent.forEach((s) => console.log(`      hidden, no own text: <${s.tag} class="${s.cls}"> ${JSON.stringify(s.text)}`));
        if (worst?.length) worst.forEach((s) => console.log(`      shift ${s.value.toFixed(5)} @${s.time}ms  ${s.sources.join(", ")}`));
      }
      console.log("");
    }

    if (MODE === "rest") {
      const broken = results.filter((r) => r.hiddenText > 0);
      failed = broken.length > 0;
      console.log(failed
        ? `FAIL — ${broken.length} route/viewport pair(s) hide text at rest under reduced motion.`
        : "PASS — no route hides text-bearing content at rest under reduced motion.");
    }
  } finally {
    await browser?.close();
    server?.kill();
  }
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
