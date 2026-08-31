#!/usr/bin/env node
/**
 * QA PHASE 02 RE-VERIFICATION — R5 diagnostic.
 *
 * `e2e/shared-shell-accessibility.spec.ts:595` fails in `mobile-320`. The
 * question is whether Phase 02 caused it. The spec itself is byte-identical at
 * `9133415` and at `45f3577`, so the only way it could be a regression is if
 * production behaviour changed.
 *
 * This script replays the spec's own sequence against an arbitrary base URL and
 * reports EVERY step's measurement instead of stopping at the first failed
 * assertion — including the exact gate terms behind `Footer.tsx`'s scroll-top
 * button (`scrolled > max*0.3 && footerIsBelowViewport`). Run it against two
 * builds and diff the numbers.
 *
 * It also settles for a fixed interval before measuring the header, which the
 * spec does not, so the run reaches the later steps instead of dying on the
 * header entrance animation.
 *
 *   node r5-safearea-diag.mjs <baseUrl> [label]
 */
import { chromium, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4519";
const LABEL = process.argv[3] ?? BASE;
const INSETS = { top: 17, right: 29, bottom: 37, left: 23 };
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
const out = { label: LABEL, base: BASE, steps: {} };

await page.goto(`${BASE}/sss`, { waitUntil: "domcontentloaded" });
await page.locator("#root").waitFor({ state: "visible" });
await page.evaluate((values) => {
  const root = document.documentElement.style;
  root.setProperty("--shell-safe-top", `${values.top}px`);
  root.setProperty("--shell-safe-right", `${values.right}px`);
  root.setProperty("--shell-safe-bottom", `${values.bottom}px`);
  root.setProperty("--shell-safe-left", `${values.left}px`);
}, INSETS);

/* The spec measures immediately; the header has an entrance transform, so its
   x drifts. Settle first so this diagnostic reaches the later steps. */
await page.waitForTimeout(2000);

const logo = page.locator("[data-fullscreen-header]").getByRole("link", { name: "MAS Technic ana sayfa" });
const trigger = page.locator("[data-menu-trigger]");
out.steps.header = {
  logo: await logo.boundingBox(),
  trigger: await trigger.boundingBox(),
};

/* Second reading 1s later: if the two differ, the spec's line-611 failure is a
   race against an entrance animation rather than a layout fault. */
await page.waitForTimeout(1000);
out.steps.headerSecondReading = { logo: await logo.boundingBox() };

/* End-key journey to the real bottom, as `fullScrollToBottom` does. */
for (let i = 0; i < 12; i += 1) {
  await page.keyboard.press("End");
  await page.waitForTimeout(300);
  const done = await page.evaluate(() =>
    Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2);
  if (done && i > 1) break;
}
await page.waitForTimeout(600);

const footer = page.getByRole("contentinfo");
out.steps.footerPadding = await footer.locator(".container-industrial").evaluate((el) => {
  const s = getComputedStyle(el);
  return { left: parseFloat(s.paddingLeft), right: parseFloat(s.paddingRight), bottom: parseFloat(s.paddingBottom) };
});
out.steps.legal = await footer.getByRole("link", { name: /Gizlilik Politikası/i }).boundingBox();

/* The contested step. */
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
await page.waitForTimeout(1200);

out.steps.scrollTopGate = await page.evaluate(() => {
  const root = document.documentElement;
  const footerEl = document.querySelector("footer");
  const scrolled = window.scrollY;
  const max = root.scrollHeight - window.innerHeight;
  const footerTop = footerEl ? footerEl.getBoundingClientRect().top : null;
  return {
    scrollHeight: root.scrollHeight,
    innerHeight: window.innerHeight,
    scrollY: scrolled,
    max,
    threshold: max * 0.3,
    scrolledPastThreshold: max > 0 && scrolled > max * 0.3,
    footerTop,
    footerIsBelowViewport: (footerTop ?? Infinity) > window.innerHeight,
    footerHeight: footerEl ? footerEl.getBoundingClientRect().height : null,
    gateShouldShow: max > 0 && scrolled > max * 0.3 && (footerTop ?? Infinity) > window.innerHeight,
  };
});

const scrollTop = page.getByRole("button", { name: "Yukarı çık" });
out.steps.scrollTopButton = {
  count: await scrollTop.count(),
  visible: await scrollTop.isVisible().catch(() => false),
  box: await scrollTop.boundingBox().catch(() => null),
};

console.log(JSON.stringify(out, null, 2));
await browser.close();
