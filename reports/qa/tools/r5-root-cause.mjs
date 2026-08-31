#!/usr/bin/env node
/**
 * QA PHASE 02 RE-VERIFICATION — R5 root-cause probe.
 *
 * The diagnostic showed the Footer scroll-top gate evaluating TRUE while the
 * button is absent from the DOM. This narrows down why: it re-reads the gate
 * and the button after a programmatic scroll, after a synthetic scroll event,
 * and after a real wheel gesture, so the failing link in the chain is named.
 *
 *   node r5-root-cause.mjs <baseUrl> [label]
 */
import { chromium, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4519";
const LABEL = process.argv[3] ?? BASE;
const EXE = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));

const browser = await chromium.launch({ executablePath: EXE });
const context = await browser.newContext({
  ...devices["Desktop Chrome"],
  viewport: { width: 320, height: 568 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const btn = page.getByRole("button", { name: "Yukarı çık" });
const snapshot = async (stage) => ({
  stage,
  ...(await page.evaluate(() => {
    const root = document.documentElement;
    const f = document.querySelector("footer");
    const top = f ? f.getBoundingClientRect().top : Infinity;
    const max = root.scrollHeight - window.innerHeight;
    return {
      scrollY: Math.round(window.scrollY),
      scrollHeight: root.scrollHeight,
      gate: max > 0 && window.scrollY > max * 0.3 && top > window.innerHeight,
      buttonsInBody: document.querySelectorAll(".floating-scroll-top").length,
    };
  })),
  count: await btn.count(),
});

await page.goto(`${BASE}/sss`, { waitUntil: "domcontentloaded" });
await page.locator("#root").waitFor({ state: "visible" });
await page.waitForTimeout(1500);

const log = [await snapshot("loaded")];

// 1. exactly what the spec does
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
await page.waitForTimeout(1500);
log.push(await snapshot("after window.scrollTo(40%)"));

// 2. a synthetic scroll event on top of the same position
await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
await page.waitForTimeout(800);
log.push(await snapshot("after synthetic scroll event"));

// 3. a real gesture
await page.mouse.wheel(0, 40);
await page.waitForTimeout(1200);
log.push(await snapshot("after real wheel +40"));

// 4. and back near the same offset
await page.mouse.wheel(0, -40);
await page.waitForTimeout(1200);
log.push(await snapshot("after real wheel -40"));

// 5. the spec's own sequence in reverse order: End first, then 40%
await page.keyboard.press("End");
await page.waitForTimeout(1200);
log.push(await snapshot("after End"));
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
await page.waitForTimeout(1500);
log.push(await snapshot("after End then window.scrollTo(40%)"));

console.log(JSON.stringify({ label: LABEL, base: BASE, log }, null, 2));
await browser.close();
