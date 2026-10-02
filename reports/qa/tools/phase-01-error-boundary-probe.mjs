/**
 * QA-owned probe for scrutiny point S3: does the root ErrorBoundary actually
 * render the branded fallback (rather than a white screen) when a lazily
 * imported chunk throws at module scope?
 *
 * Exercised against a SCRATCH build only (gitignored outDir), produced with a
 * deliberately empty VITE_SUPABASE_URL. The real .env is never touched.
 *
 * Usage: node reports/qa/tools/phase-01-error-boundary-probe.mjs <baseURL> <route...>
 */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4175";
const ROUTES = process.argv.slice(3);
const routes = ROUTES.length ? ROUTES : ["/teklif-al", "/giris", "/musteri-paneli", "/"];

const candidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter((c) => c && existsSync(c));

const browser = await chromium.launch(candidates.length ? { executablePath: candidates[0] } : {});
const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await c.newPage();
const out = { base: BASE, routes: {} };

for (const r of routes) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  out.routes[r] = await page.evaluate(() => {
    const fallback = document.querySelector('[data-testid="app-error-fallback"]');
    const home = document.querySelector('[data-testid="app-error-home"]');
    const root = document.getElementById("root");
    const bg = getComputedStyle(document.body).backgroundColor;
    return {
      fallbackRendered: !!fallback,
      fallbackHeading: fallback ? (fallback.querySelector("h1") || {}).textContent : null,
      recoveryLinkHref: home ? home.getAttribute("href") : null,
      recoveryLinkVisible: home ? home.getBoundingClientRect().height > 0 : false,
      rootTextLength: root ? root.innerText.trim().length : 0,
      whiteScreen: !!root && root.innerText.trim().length === 0,
      bodyBackground: bg,
      heroShellStillPresent: document.getElementById("hero-shell") !== null,
    };
  });
  // Do not echo any configuration value; only the error class/shape.
  out.routes[r].pageErrorShapes = errors.map((m) => m.split(".")[0].slice(0, 60));
  page.removeAllListeners("pageerror");
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
