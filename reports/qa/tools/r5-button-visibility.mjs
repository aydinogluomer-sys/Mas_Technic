#!/usr/bin/env node
/**
 * QA PHASE 02 RE-VERIFICATION — R5, final narrowing.
 *
 * `.floating-scroll-top` is present in the DOM when the Footer gate is true, yet
 * `getByRole("button", { name: "Yukari cik" })` matches nothing. This dumps the
 * element's computed presentation and ancestor chain so the reason is named
 * rather than guessed.
 */
import { chromium, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4519";
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
await page.goto(`${BASE}/sss`, { waitUntil: "domcontentloaded" });
await page.locator("#root").waitFor({ state: "visible" });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const el = document.querySelector(".floating-scroll-top");
  if (!el) return { found: false };
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const chain = [];
  let node = el;
  while (node && node !== document.documentElement) {
    const cs = getComputedStyle(node);
    chain.push({
      tag: node.tagName.toLowerCase(),
      cls: (node.getAttribute("class") ?? "").slice(0, 80),
      ariaHidden: node.getAttribute("aria-hidden"),
      inert: node.hasAttribute("inert"),
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      transform: cs.transform,
      position: cs.position,
      zIndex: cs.zIndex,
    });
    node = node.parentElement;
  }
  return {
    found: true,
    ariaLabel: el.getAttribute("aria-label"),
    rect: { x: r.x, y: r.y, width: r.width, height: r.height },
    self: { display: s.display, visibility: s.visibility, opacity: s.opacity, pointerEvents: s.pointerEvents },
    chain,
  };
});

const btn = page.getByRole("button", { name: "Yukarı çık" });
const byLabel = page.locator('[aria-label="Yukarı çık"]');
console.log(JSON.stringify({
  base: BASE,
  info,
  roleCount: await btn.count(),
  ariaLabelSelectorCount: await byLabel.count(),
  cssClassCount: await page.locator(".floating-scroll-top").count(),
}, null, 2));
await browser.close();
