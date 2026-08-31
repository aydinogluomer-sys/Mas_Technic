/**
 * QA-owned independent connector probe (Phase 02 re-verification, R1/R4).
 * Reads `getComputedStyle(li, "::after")` for every `.tl-process li` at a
 * sweep of widths, against whatever base URL is passed. Deliberately does NOT
 * import anything from `e2e/` so it cannot inherit the spec's assumptions.
 *
 * Usage: node connector-probe.mjs <baseUrl> [screenshotDir]
 */
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4519";
const SHOT_DIR = process.argv[3] ?? null;
const WIDTHS = [320, 375, 390, 767, 768, 900, 1180, 1181, 1280, 1440];
const EXE = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));

const browser = await chromium.launch({ executablePath: EXE });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await context.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector(".tl-process li", { state: "attached" });

const rows = [];
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
  await page.waitForTimeout(350);
  const data = await page.evaluate(() => {
    const steps = [...document.querySelectorAll(".tl-process li")];
    return {
      count: steps.length,
      cells: steps.map((s) => {
        const a = getComputedStyle(s, "::after");
        const r = s.getBoundingClientRect();
        return {
          label: (s.querySelector("span")?.textContent ?? "").trim(),
          display: a.display,
          glyph: a.content.replace(/^["']|["']$/g, ""),
          top: Math.round(r.top * 100) / 100,
          left: Math.round(r.left * 100) / 100,
          w: Math.round(r.width * 100) / 100,
          h: Math.round(r.height * 100) / 100,
        };
      }),
      rail: (() => {
        const band = document.querySelector(".tl-process");
        if (!band) return null;
        const cs = getComputedStyle(band).getPropertyValue("--tl-rail");
        return cs.trim();
      })(),
    };
  });
  rows.push({ width, ...data });
  if (SHOT_DIR && (width === 320 || width === 375 || width === 768 || width === 1280)) {
    mkdirSync(SHOT_DIR, { recursive: true });
    const ol = page.locator(".tl-process ol");
    await ol.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await ol.screenshot({ path: `${SHOT_DIR}/process-ol-${width}.png` });
  }
}

console.log(JSON.stringify({ base: BASE, rows }, null, 2));
await browser.close();
