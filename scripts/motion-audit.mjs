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
 *   --mode=cls       scripted scroll of `/`, TWICE per viewport: motion
 *                    enabled, then `prefers-reduced-motion: reduce`. The
 *                    difference (`motionCost`) is what the motion layer
 *                    itself adds; the raw total is not, and does not
 *                    reproduce run to run.
 *   --mode=frames    motion ENABLED, scripted scroll of `/`: rAF pacing.
 *   --mode=density   how many elements the motion layer touches at 375 vs 1280.
 *   --mode=guard     SOURCE check, no browser: nobody re-imported `motion`
 *                    straight from `framer-motion` and so bypassed the
 *                    reduced-motion primitive. Exit 1 on any breach.
 *   --mode=cursor    does a pointer exist? The stylesheet hides the native
 *                    cursor on desktop; measure that something replaces it,
 *                    including under reduced motion.
 *   --mode=axe       serious/critical axe counts per route, run twice: with
 *                    reduced motion (what a reduced-motion user sees now) and
 *                    with motion allowed and no scrolling (the same hidden set
 *                    they used to be left in). The difference separates newly
 *                    VISIBLE pre-existing debt from newly INTRODUCED defects.
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

/**
 * The landing plus nine inner routes from eight different page families.
 *
 * `/malzemeler` was added by the Phase 07 correction (advisory A7). It was the
 * one route missing from this matrix and the one most worth having in it: it
 * mounts `MaterialMorphScroll`, an 80-frame scroll-driven canvas whose title
 * and property card take their opacity straight from `scrollYProgress`. A
 * route whose content visibility is a FUNCTION OF SCROLL POSITION is precisely
 * what a no-scroll census is for, and leaving it out is why the audit could
 * report `hiddenText=0` across ten pairs while eleven text-bearing elements
 * sat at an ancestor `opacity: 0`.
 *
 * PHASE 08 CORRECTION #1 — C2. THE INSTRUMENT MUST COVER WHAT SHIPS.
 * Phase 08 rewrote four page families and shipped two brand-new ones, and not
 * one of them was in this list — so the rest census could have reported
 * `hiddenText=0` while an entire rewritten family kept its body text at an
 * ancestor `opacity: 0`. That is the A7 failure again, one phase later: this
 * audit's answer is only ever as wide as its matrix, and a matrix that stops
 * at the routes of two phases ago measures the site that used to exist.
 *
 * The four added below are one per Phase 08 family, each the RICHEST surface
 * of its family rather than its thinnest — the most structure available to
 * hide something inside:
 *
 *   · `/sss`             the question register; long, dense, and the canonical
 *                        shell route the accessibility spec already leans on.
 *   · `/blog/…`          the technical publication — the only Phase 08 body
 *                        carrying both a figure and a data table.
 *   · `/kabiliyet-…/…`   a capability profile detail — a NEW route family,
 *                        with a control plan and a measured-results table.
 *   · `/kalite-dosyasi`  the quality dossier — the other NEW route family.
 *
 * Ten routes × two viewports = twenty pairs.
 */
const ROUTES = [
  ["/", "landing"],
  ["/hizmetler/cnc-frezeleme", "service detail (B28 reference route)"],
  ["/iletisim", "contact"],
  ["/malzemeler", "material register (80-frame scroll canvas — A7)"],
  ["/malzemeler/aluminyum", "material category"],
  ["/hakkimizda", "about"],
  ["/sss", "question register (Faz 08)"],
  ["/blog/kalite-kontrol-cmm-olcum", "technical publication — figure + table (Faz 08)"],
  ["/kabiliyet-profilleri/ince-cidarli-govde", "capability profile detail (Faz 08)"],
  ["/kalite-dosyasi", "quality dossier (Faz 08)"],
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
 *
 * PARTIAL OPACITY — added with A7, and deliberately NOT gated.
 * This shares its definition of "at rest" with the Phase 07 correction's
 * contrast instrument (`docs/lean/17` §6.9): a run counts as at rest only at
 * ancestor opacity chain >= 0.95, and anything between 0.01 and 0.95 is a
 * MID-FADE frame — reported separately and counted in neither total. Here that
 * means `partialText` is printed but does not fail the build, exactly as
 * mid-fade contrast runs are printed but never counted as failures. The hard
 * gate stays where it was, at chain ~0, so nothing is narrowed: this only adds
 * visibility of a band the census could not previously see at all.
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
  /* 0.01 <= chain < 0.95 — mid-fade. Reported, never gated. */
  const partialText = [];
  /* Elements that are transparent but carry no text of their own. These are
     not automatically fine — a transparent wrapper can still be swallowing a
     whole subtree — so a sample is printed and has to be read, rather than
     silently subtracted from the count. */
  const hiddenSilent = [];
  for (const el of laidOut) {
    const value = effective(el);
    const describe = () => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") ?? "").slice(0, 60),
      text: (el.textContent ?? "").trim().slice(0, 40),
    });
    if (value > 0 && value < 0.95) {
      const own = ownText(el);
      if (own.length > 1 && el.closest("[aria-hidden='true']") === null && partialText.length < 40) {
        partialText.push({ ...describe(), opacity: Number(value.toFixed(3)) });
      }
      continue;
    }
    if (value !== 0) continue;
    hidden.push(el);
    const text = ownText(el);
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
    partialText: partialText.length,
    samples: hiddenText.slice(0, 8),
    partial: partialText.slice(0, 8),
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

/**
 * WHY THIS IS AN A/B AND NOT A SINGLE NUMBER
 * ------------------------------------------
 * The claim under test is CAUSAL — "the motion layer causes no layout shift"
 * — and a single CLS total cannot support it. The landing shifts a little for
 * reasons that have nothing to do with motion (a late webfont, an image
 * arriving, the shell handing over), so a lone total mixes the thing being
 * asserted with the things that are not. It is also the least reproducible
 * number this instrument produces: measured on this build at 1280, three
 * consecutive runs of the same page gave 0.0201 / 0.0202 / 0.0209.
 *
 * So each viewport is scrolled twice over the same build: once with motion
 * allowed and once under `prefers-reduced-motion: reduce`, where the whole
 * landing motion layer is off by contract. `motionCost` is the difference,
 * and IT is the number the claim rests on. `manifestoEntries` counts shift
 * entries the browser attributes to the one deliberate layout animation on
 * the page (09's `letter-spacing` close), because that is the exception the
 * stylesheet documents and the one most likely to break the rule.
 */
async function clsPass(browser, viewport, baseURL, reducedMotion) {
  {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      reducedMotion,
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
            manifesto: (entry.sources ?? []).some((s) => !!s.node?.closest?.(".tl-manifesto")),
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    // Scripted scroll through the whole landing, one viewport-height step at a
    // time, pausing long enough for each band's entrance to run to completion.
    // The mark splits the run in two: everything before it is page LOAD (the
    // entrance shell handing over, a late font, an image arriving), everything
    // after it is the band choreography playing as the reader scrolls. Only
    // the second half is this phase's motion layer.
    const scrollStart = await page.evaluate(() => performance.now());
    const height = await page.evaluate(() => document.body.scrollHeight);
    const step = Math.round(viewport.height * 0.75);
    for (let y = 0; y < height; y += step) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(320);
    }
    await page.waitForTimeout(1200);

    const shifts = await page.evaluate(() => window.__shifts);
    const total = shifts.reduce((sum, s) => sum + s.value, 0);
    const scrolling = shifts.filter((s) => s.time >= scrollStart);
    const worst = [...shifts].sort((a, b) => b.value - a.value).slice(0, 5);
    await context.close();
    return {
      cls: Number(total.toFixed(5)),
      entries: shifts.length,
      clsWhileScrolling: Number(scrolling.reduce((sum, s) => sum + s.value, 0).toFixed(5)),
      entriesWhileScrolling: scrolling.length,
      manifestoEntries: shifts.filter((s) => s.manifesto).length,
      worst,
    };
  }
}

async function runCls(browser, baseURL) {
  const results = [];
  for (const viewport of VIEWPORTS) {
    const motion = await clsPass(browser, viewport, baseURL, "no-preference");
    const still = await clsPass(browser, viewport, baseURL, "reduce");
    results.push({
      viewport: viewport.name,
      cls: motion.cls,
      entries: motion.entries,
      clsReducedMotion: still.cls,
      entriesReducedMotion: still.entries,
      // The causal numbers. `scrollCost` is the one the claim rests on: what
      // the band choreography adds while it is actually playing. `loadCost`
      // is kept beside it because it is NOT attributable to this layer — the
      // two paths hand over from the entrance shell differently — and hiding
      // it inside one total is how the unreproducible figure happened.
      clsWhileScrolling: motion.clsWhileScrolling,
      clsWhileScrollingReducedMotion: still.clsWhileScrolling,
      scrollCost: Number((motion.clsWhileScrolling - still.clsWhileScrolling).toFixed(5)),
      loadCost: Number(((motion.cls - motion.clsWhileScrolling) - (still.cls - still.clsWhileScrolling)).toFixed(5)),
      manifestoEntries: motion.manifestoEntries,
      worst: [
        ...motion.worst.map((s) => ({ ...s, sources: ["motion   ", ...s.sources] })),
        ...still.worst.map((s) => ({ ...s, sources: ["reduced  ", ...s.sources] })),
      ],
    });
  }
  return results;
}

/**
 * WHY THIS RUNS THREE PASSES, AND WHY PASS 1 IS NOT COMPARABLE TO 2 AND 3
 * ----------------------------------------------------------------------
 * The three passes scroll the same page in the same way, but they do NOT
 * measure the same thing, and reading them as three samples of one quantity
 * is the mistake this docblock exists to prevent.
 *
 *   pass 1  ENTRANCE COST. Every band is still un-entered, so each one runs
 *           its choreography as it arrives. This is what a first-time reader
 *           actually experiences, and it is the number that matters.
 *   pass 2+ STEADY-STATE SCROLL. `.tl-inview` is one-way, so by now every
 *           entrance has already fired and nothing re-arms. This measures the
 *           page scrolling with the motion layer at rest.
 *
 * Measured on the current build at 1280: pass 1 = 12 slow frames of 489,
 * passes 2 and 3 = 1 and 0. The layer costs something while it plays and
 * nothing afterwards, which is the correct shape; a page that stayed slow on
 * passes 2–3 would be doing permanent work.
 *
 * SEPARATELY, THE HOST IS NOISY
 * -----------------------------
 * Four consecutive pass-1 runs on ONE unchanged build gave `over32ms` = 16,
 * 19, 34, 34, with the frame count falling from 465 to 362 as the runs stacked
 * up: this machine is memory-constrained and degrades under repetition. That
 * spread is wider than the difference between two versions of the motion
 * layer, so a single-pass A/B here can prove whatever you were hoping for. It
 * nearly did — an intermediate reading of "3" against "15" looked like a clear
 * regression and sent me to optimise a band that later runs exonerated.
 *
 * `median` is the number that has held everywhere: 16.7ms in every pass of
 * every version measured. Treat a change in `over32ms` as signal only if it
 * clears the printed range AND is compared pass-1 to pass-1.
 */
const FRAME_PASSES = 3;

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

    for (let pass = 1; pass <= FRAME_PASSES; pass += 1) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);

      const pacing = await page.evaluate(async () => {
        /* Each frame is recorded WITH the band that was centred in the viewport
           when it was drawn. A bare list of durations tells you the path janks;
           it does not tell you which grammar to go and fix, and guessing that
           from a stylesheet is how a plausible-looking wrong culprit gets
           "optimised". Attribution is the difference between a measurement and
           an anecdote. */
        const bandAt = () => {
          const mid = window.innerHeight / 2;
          for (const band of document.querySelectorAll(".tl-band")) {
            const box = band.getBoundingClientRect();
            if (box.top <= mid && box.bottom >= mid) {
              return (band.className.match(/tl-(?!band|inview|onscreen)[a-z-]+/) ?? ["?"])[0];
            }
          }
          return "-";
        };

        const frames = [];
        const bands = [];
        let last = performance.now();
        let running = true;
        const tick = (now) => {
          frames.push(now - last);
          bands.push(bandAt());
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
        const measuredBands = bands.slice(3);
        const sorted = [...measured].sort((a, b) => a - b);
        const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
        let longestRun = 0;
        let run = 0;
        const blame = {};
        for (let i = 0; i < measured.length; i += 1) {
          const frame = measured[i];
          run = frame > 32 ? run + 1 : 0;
          if (run > longestRun) longestRun = run;
          if (frame > 32) blame[measuredBands[i]] = (blame[measuredBands[i]] ?? 0) + 1;
        }
        return {
          frames: measured.length,
          median: Number(at(0.5).toFixed(2)),
          p95: Number(at(0.95).toFixed(2)),
          worst: Number(Math.max(...measured).toFixed(2)),
          over32ms: measured.filter((f) => f > 32).length,
          over50ms: measured.filter((f) => f > 50).length,
          longestConsecutiveSlowRun: longestRun,
          slowFramesByBand: Object.entries(blame)
            .sort((a, b) => b[1] - a[1])
            .map(([band, n]) => `${band}:${n}`)
            .join(" ") || "-",
        };
      });
      results.push({ viewport: viewport.name, pass, ...pacing });
    }

    /* The summary line separates the two quantities rather than averaging
       them into one meaningless figure. */
    const passes = results.filter((r) => r.viewport === viewport.name);
    const settled = passes.slice(1).map((r) => r.over32ms);
    results.push({
      viewport: viewport.name,
      pass: "summary",
      medianOfMedians: passes.map((r) => r.median).sort((a, b) => a - b)[Math.floor(passes.length / 2)],
      entranceOver32ms: passes[0].over32ms,
      settledOver32ms: `${Math.min(...settled)}..${Math.max(...settled)}`,
      note: "compare pass-1 to pass-1 only; host noise on this machine is +-18",
    });
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

/**
 * Serious/critical axe counts, and the one comparison that makes them
 * interpretable.
 *
 * Fixing B28 makes ~186 previously-transparent nodes on the service route
 * scannable, and axe skips what it cannot see. So the count going UP is the
 * expected consequence of the fix, not evidence of a new defect — the question
 * is only whether the newly counted nodes are pre-existing debt.
 *
 * The comparison is free, because the pre-fix reduced-motion DOM still exists:
 * with motion ALLOWED and no scrolling, the reveals are all still armed, which
 * is exactly the state a reduced-motion user used to be left in. So:
 *
 *   reduce, no scroll          = what a reduced-motion user sees NOW
 *   no-preference, no scroll   = what they saw BEFORE (same hidden set)
 *
 * Anything present in both is pre-existing. Anything present only in the
 * first, on nodes whose only change was becoming visible, is B24-class debt
 * (`color-contrast` on ServiceDetail) that Phases 07/13 own.
 */
async function runAxe(browser, baseURL) {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const results = [];
  for (const motionMode of ["reduce", "no-preference"]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: motionMode,
      baseURL,
    });
    const page = await context.newPage();
    for (const [route] of ROUTES) {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1200);
      const scan = await new AxeBuilder({ page }).analyze();
      const blocking = scan.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const byRule = {};
      for (const violation of blocking) {
        byRule[violation.id] = (byRule[violation.id] ?? 0) + violation.nodes.length;
      }
      results.push({
        reducedMotion: motionMode,
        route,
        rules: blocking.length,
        nodes: blocking.reduce((sum, v) => sum + v.nodes.length, 0),
        breakdown: Object.entries(byRule).map(([id, n]) => `${id}:${n}`).join(" ") || "-",
      });
    }
    await context.close();
  }
  return results;
}

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
    results.push({ reducedMotion: motionMode, guard: "replacement present", ...(await page.evaluate(CURSOR_PROBE)) });

    /* THE NEGATIVE CONTROL, and the only part of this mode that proves
       anything. `body=none` with a replacement mounted is the intended state
       and it read exactly the same before I3 was fixed, so on its own it
       cannot distinguish a scoped rule from an unscoped one. Deleting the
       replacement can: under the old unconditional rule the pointer stayed
       `none` and the user had nothing, whereas the `html:has(...)` gate must
       hand the native cursor straight back. Anything other than `auto`/
       `default`/`pointer` here means the stylesheet can still take the
       pointer away on its own. */
    await page.evaluate(() => {
      document.querySelectorAll("[data-custom-cursor]").forEach((node) => node.remove());
    });
    await page.waitForTimeout(200);
    results.push({ reducedMotion: motionMode, guard: "replacement REMOVED", ...(await page.evaluate(CURSOR_PROBE)) });
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
   if it uses `whileInView`, since that is the construct that hides content.

   THE SECOND RULE — the hole the primitive cannot close (defect I1)
   ----------------------------------------------------------------
   The proxy settles a reveal by rewriting `initial` / `animate` /
   `whileInView`. An element carrying NONE of those is passed through
   untouched, because it is assumed to be a variant child. But
   `onViewportEnter` is not a variant child: it is a tripwire that fires a
   side effect on intersection, and the side effect can be anything. In
   `ProjectShowcase` it added a class that started three CSS keyframe
   animations, so a decorative RGB channel split played for reduced-motion
   users while the primitive was working exactly as designed.

   There is no way to fix that inside the proxy — it cannot know what a
   callback will do. So it is fixed at the only place that can know, the call
   site, and this rule makes the call site prove it: a file that uses a
   viewport callback must also consult `usePrefersReducedMotion`. That is a
   heuristic rather than a proof, but it is a precise one — the callback and
   the check are the two halves of the same decision, and a file with one and
   not the other is the exact shape of the defect.

   WHY THE RULE READS CODE AND NOT FILE TEXT
   -----------------------------------------
   The first version of that rule was `/usePrefersReducedMotion/.test(source)`
   over the raw file. A guard that reads raw text cannot tell a call from a
   MENTION, so writing the name in a comment satisfied it — measured: a file
   with `onViewportEnter` and nothing but `// usePrefersReducedMotion` passed.
   A rule a comment can switch off is not a rule. Every check below therefore
   reads `codeOf(source)`, which drops comments, and the reduced-motion check
   now demands a CALL, `usePrefersReducedMotion(`, not the bare identifier.

   `codeOf` is string-aware because it has to be — `//` inside a string
   literal is not a comment — and it KEEPS string bodies, because the import
   check needs the module specifier. It does not understand regex literals or
   a template nested inside an interpolation; either can only make it drop too
   little, which surfaces as a LOUD false breach rather than a quiet false
   pass. Negative-controlled three ways: the defect shape fails, the fixed
   shape passes, and a comment-only mention fails. */

/**
 * Source with comments removed and string literals kept verbatim.
 * Deliberately not a parser: a parser is a dependency and a second thing to
 * keep in step with the TypeScript the tree actually uses.
 */
function codeOf(source) {
  let out = "";
  let i = 0;
  const n = source.length;
  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === "/" && next === "/") {
      const nl = source.indexOf("\n", i);
      i = nl === -1 ? n : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      out += " ";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      out += ch;
      i += 1;
      while (i < n) {
        if (source[i] === "\\") {
          out += source.slice(i, i + 2);
          i += 2;
          continue;
        }
        const closes = source[i] === ch;
        out += source[i];
        i += 1;
        if (closes) break;
      }
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

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
    const source = codeOf(readFileSync(file, "utf8"));
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
    if (/onViewportEnter|onViewportLeave/.test(source) && !/\busePrefersReducedMotion\s*\(/.test(source)) {
      breaches.push({
        file: rel,
        why: "uses a viewport callback the primitive cannot settle, without CALLING usePrefersReducedMotion",
      });
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
    else if (MODE === "axe") results = await runAxe(browser, baseURL);
    else throw new Error(`unknown --mode=${MODE}`);

    if (JSON_OUT) {
      console.log(JSON.stringify({ mode: MODE, results }, null, 2));
    } else {
      console.log(`\nMOTION AUDIT — mode=${MODE}  base=${baseURL}\n`);
      for (const row of results) {
        const { samples, worst, silent, partial, ...rest } = row;
        console.log(Object.entries(rest).map(([k, v]) => `${k}=${v}`).join("  "));
        if (samples?.length) samples.forEach((s) => console.log(`      hidden text: <${s.tag} class="${s.cls}"> ${JSON.stringify(s.text)}`));
        if (partial?.length) partial.forEach((s) => console.log(`      mid-fade (opacity ${s.opacity}, not gated): <${s.tag} class="${s.cls}"> ${JSON.stringify(s.text)}`));
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
