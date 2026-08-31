/**
 * Phase 00 — throwaway visual baseline capture.
 *
 * NOT production tooling. Lives under reports/baseline/tools/ deliberately so it
 * never pollutes scripts/ and can be deleted once the baseline is archived.
 *
 * What it does:
 *   1. `npm run build` (unless --skip-build)
 *   2. starts `npm run preview -- --port <port> --strictPort` itself
 *   3. captures full-page screenshots of the routes listed in TARGETS
 *   4. stops the preview server
 *   5. writes reports/baseline/visual/manifest.json
 *
 * Determinism:
 *   - `prefers-reduced-motion: reduce` is emulated for every capture. The site
 *     honours it (tl-root[data-motion="reduced"]), so scroll/marquee motion is
 *     parked instead of being frozen mid-flight. This is a deliberate,
 *     recorded trade-off: the baseline shows the reduced-motion rendering, not
 *     the full-motion rendering.
 *   - an extra CSS override kills animation/transition/scroll-behaviour for any
 *     element that ignores the media query.
 *   - `waitUntil: networkidle` plus a fixed settle delay, plus a scripted scroll
 *     to the bottom and back to force every `loading="lazy"` image to resolve.
 *
 * Size discipline: any PNG over MAX_PNG_BYTES is re-captured as JPEG q80.
 *
 * Browser: this host's installed Playwright browser revisions do not match the
 * revision bundled with @playwright/test, so — exactly like playwright.config.ts
 * — we drive the locally installed Chrome/Edge binary.
 *
 * Usage:
 *   node reports/baseline/tools/capture-baseline.mjs [--skip-build] [--port 4173]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..", "..");
const OUT_DIR = resolve(HERE, "..", "visual");

const args = process.argv.slice(2);
const SKIP_BUILD = args.includes("--skip-build");
const PORT = Number(args[args.indexOf("--port") + 1]) || 4173;
const BASE_URL = `http://localhost:${PORT}`;

const MAX_PNG_BYTES = 8 * 1024 * 1024;
const SETTLE_MS = 1200;

/** width x route matrix. `note` is a capture-time hint only; INDEX.md carries the real findings. */
const TARGETS = [
  { route: "/", width: 375, height: 812, name: "landing-375" },
  { route: "/", width: 768, height: 1024, name: "landing-768" },
  { route: "/", width: 1280, height: 800, name: "landing-1280" },
  { route: "/", width: 1440, height: 900, name: "landing-1440" },
  { route: "/", width: 1600, height: 900, name: "landing-1600" },
  { route: "/hakkimizda", width: 1440, height: 900, name: "hakkimizda-1440" },
  { route: "/iletisim", width: 1440, height: 900, name: "iletisim-1440" },
  { route: "/teklif-al", width: 1440, height: 900, name: "teklif-al-1440" },
  { route: "/blog", width: 1440, height: 900, name: "blog-1440" },
  { route: "/sss", width: 1440, height: 900, name: "sss-1440" },
  { route: "/bu-sayfa-yok-404-baseline", width: 1440, height: 900, name: "notfound-1440" },
];

const FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
  html { scroll-behavior: auto !important; }
`;

function run(command, commandArgs, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, commandArgs, { cwd: REPO_ROOT, shell: true, stdio: "inherit", ...options });
    child.on("error", rejectRun);
    child.on("exit", (code) => (code === 0 ? resolveRun() : rejectRun(new Error(`${command} exited ${code}`))));
  });
}

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`preview server did not answer on ${url}`);
}

function resolveExecutablePath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
    process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
    "/usr/bin/chromium",
    "/bin/chromium",
  ];
  return candidates.find((candidate) => !!candidate && existsSync(candidate));
}

/** Scrolls the whole document so lazy images decode, then returns to the top. */
async function forceLazyLoad(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await page.evaluate(() => Promise.all(
    [...document.images].filter((img) => !img.complete).map((img) => img.decode().catch(() => undefined)),
  ));
}

async function main() {
  if (!SKIP_BUILD) {
    console.log("[capture] npm run build");
    await run("npm", ["run", "build"]);
  } else {
    console.log("[capture] --skip-build: reusing existing dist/");
  }

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[capture] starting preview on ${BASE_URL}`);
  const preview = spawn("npm", ["run", "preview", "--", "--port", String(PORT), "--strictPort"], {
    cwd: REPO_ROOT, shell: true, stdio: "ignore", detached: false,
  });

  const manifest = [];
  let browser;
  try {
    await waitForServer(BASE_URL);

    const executablePath = resolveExecutablePath();
    console.log(`[capture] chromium executable: ${executablePath ?? "(playwright bundled)"}`);
    browser = await chromium.launch(executablePath ? { executablePath } : {});

    for (const target of TARGETS) {
      const context = await browser.newContext({
        viewport: { width: target.width, height: target.height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        locale: "tr-TR",
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("pageerror", (e) => consoleErrors.push(String(e.message)));
      page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

      const url = `${BASE_URL}${target.route}`;
      let status = null;
      let error = null;
      let file = null;
      try {
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
        status = response?.status() ?? null;
        await page.addStyleTag({ content: FREEZE_CSS });
        await page.waitForTimeout(SETTLE_MS);
        await forceLazyLoad(page);
        await page.waitForTimeout(SETTLE_MS);

        file = `${target.name}.png`;
        let path = join(OUT_DIR, file);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });

        if (statSync(path).size > MAX_PNG_BYTES) {
          console.log(`[capture] ${file} over ${MAX_PNG_BYTES} bytes -> re-capturing as JPEG q80`);
          rmSync(path);
          file = `${target.name}.jpg`;
          path = join(OUT_DIR, file);
          await page.screenshot({ path, fullPage: true, animations: "disabled", type: "jpeg", quality: 80 });
        }
      } catch (e) {
        error = String(e && e.message ? e.message : e);
        file = null;
        console.error(`[capture] FAILED ${target.name}: ${error}`);
      }

      const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => null);
      const horizontalOverflow = await page
        .evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
        .catch(() => null);

      manifest.push({
        name: target.name,
        route: target.route,
        viewport: `${target.width}x${target.height}`,
        file,
        bytes: file ? statSync(join(OUT_DIR, file)).size : null,
        httpStatus: status,
        documentHeight,
        horizontalOverflow,
        consoleErrors: [...new Set(consoleErrors)].slice(0, 10),
        error,
      });
      console.log(`[capture] ${target.name} -> ${file ?? "FAILED"}`);
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    console.log("[capture] stopping preview server");
    preview.kill("SIGTERM");
    // Windows: npm spawns a child shell; make sure the port is actually freed.
    if (process.platform === "win32" && preview.pid) {
      try { spawn("taskkill", ["/pid", String(preview.pid), "/t", "/f"], { stdio: "ignore", shell: true }); } catch { /* ignore */ }
    }
  }

  writeFileSync(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const total = manifest.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0);
  console.log(`[capture] done. ${manifest.filter((m) => m.file).length}/${TARGETS.length} captured, ${(total / 1024 / 1024).toFixed(1)} MB total`);
}

await main();
