/**
 * QA-owned probe: the three dev-only surfaces must still work under `npm run dev`.
 * Usage: node reports/qa/tools/phase-01-dev-routes-probe.mjs <devBaseURL>
 */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:8099";
const candidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter((c) => c && existsSync(c));
const launch = candidates.length ? { executablePath: candidates[0] } : {};

const browser = await chromium.launch(launch);
const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await c.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));

const out = { base: BASE, routes: {} };
for (const r of ["/technical-preview", "/legacy-landing", "/test"]) {
  consoleErrors.length = 0;
  await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  out.routes[r] = await page.evaluate(() => ({
    is404: /404/.test(document.body.innerText),
    hasLfRoot: !!document.querySelector(".lf-root"),
    hasTechnicalLandingRoot: !!document.querySelector('[data-testid="technical-landing-root"]'),
    landingVersionRoot: !!document.querySelector('[data-testid="landing-version-root"]'),
    mainTextLength: (document.querySelector("main") || document.body).innerText.length,
    firstHeading: (document.querySelector("h1, h2") || {}).textContent || null,
    topAnchor: document.querySelectorAll("#top").length,
    path: location.pathname,
  }));
  out.routes[r].pageErrors = [...consoleErrors];
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
