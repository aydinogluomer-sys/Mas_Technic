/**
 * QA round 2 — is the clipped part of the cookie table reachable BY ANY MEANS
 * at 375? Tries: horizontal wheel over the table, touch swipe, keyboard focus
 * of the scroll region, window.scrollTo(x), and scrollLeft assignment on every
 * ancestor. If none of them moves anything, three of four columns are lost,
 * not merely off-screen.
 */
import { chromium, devices } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const table = p.locator("main table").first();
await table.scrollIntoViewIfNeeded();
await p.waitForTimeout(500);

const box = await table.boundingBox();
const before = await p.evaluate(() => ({ winX: window.scrollX, docSW: document.documentElement.scrollWidth, docCW: document.documentElement.clientWidth }));

// 1. wheel
await p.mouse.move(Math.min(box.x + 40, 300), box.y + 40);
await p.mouse.wheel(400, 0);
await p.waitForTimeout(400);
const afterWheel = await p.evaluate(() => ({ winX: window.scrollX, headRight: document.querySelectorAll("main thead th")[3].getBoundingClientRect().right }));

// 2. touch swipe
try {
  await p.touchscreen.tap(180, box.y + 40);
  await p.evaluate(() => {
    const el = document.querySelector(".shell-table-scroll");
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
  });
} catch { /* touch events are approximated below by scrollLeft */ }

// 3. force scrollLeft on every ancestor
const forced = await p.evaluate(() => {
  const results = [];
  let el = document.querySelector("main table");
  while (el && el !== document.documentElement) {
    const beforeL = el.scrollLeft;
    el.scrollLeft = 9999;
    results.push({ node: el.tagName.toLowerCase() + "." + String(el.className).slice(0, 40), before: beforeL, after: el.scrollLeft, overflowX: getComputedStyle(el).overflowX });
    el.scrollLeft = beforeL;
    el = el.parentElement;
  }
  window.scrollTo(9999, window.scrollY);
  results.push({ node: "window", after: window.scrollX });
  const de = document.documentElement;
  const bl = de.scrollLeft; de.scrollLeft = 9999;
  results.push({ node: "documentElement", before: bl, after: de.scrollLeft, overflowX: getComputedStyle(de).overflowX });
  de.scrollLeft = bl;
  return results;
});

// 4. keyboard: can the scroll region be focused at all?
const tabbable = await p.evaluate(() => {
  const wrap = document.querySelector(".shell-table-scroll");
  return { tabindex: wrap.getAttribute("tabindex"), role: wrap.getAttribute("role"), ariaLabel: wrap.getAttribute("aria-label") };
});

// 5. what a sighted reader can actually read of each row
const readable = await p.evaluate(() => {
  const vw = window.innerWidth;
  return [...document.querySelectorAll("main tbody tr")].map((tr) => {
    const cells = [...tr.querySelectorAll("th,td")];
    return {
      key: cells[0].textContent.trim(),
      visibleCells: cells.filter((c) => c.getBoundingClientRect().right <= vw + 0.5).map((c) => c.textContent.trim().slice(0, 30)),
      hiddenCells: cells.filter((c) => c.getBoundingClientRect().left >= vw - 0.5).map((c) => c.textContent.trim().slice(0, 30)),
    };
  });
});

await p.screenshot({ path: "C:/Users/Trade Bilisim/pdh-wt/qa-p08/reports/qa/phase-08/r2/shots/cerez-375-after-scroll-attempts.png" });
await b.close();
console.log(JSON.stringify({ before, afterWheel, forced, tabbable, readable }, null, 2));
