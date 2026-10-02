/**
 * QA round 3 — IS MY TOUCH INSTRUMENT BLIND, OR IS TOUCH PANNING BROKEN?
 *
 * Neither `Input.synthesizeScrollGesture` (gestureSourceType touch) nor a
 * hand-rolled `Input.dispatchTouchEvent` drag moved `.shell-table-scroll` at
 * 320/375/390, while ArrowRight — which goes through the same browser input
 * pipeline — moved it to max. Before calling that a defect, run the SAME two
 * instruments against:
 *   a) the document's own vertical scroll (known-good scroller);
 *   b) `/hizmetler/cnc-frezeleme`'s tables, which round 2 measured as working
 *      scroll regions on the pre-fix build;
 * and read `touch-action` on the region and every ancestor, because a
 * `touch-action` that forbids horizontal panning WOULD be a real defect.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const out = {};

// ── a) vertical page scroll, the known-good control ──────────────────────
await page.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.evaluate(() => window.scrollTo(0, 0));
{
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Input.synthesizeScrollGesture", { x: 180, y: 500, xDistance: 0, yDistance: -400, gestureSourceType: "touch", speed: 800 });
  await page.waitForTimeout(800);
  out.verticalPageScroll_synthesize = await page.evaluate(() => Math.round(window.scrollY));
  await cdp.detach();
}
await page.evaluate(() => window.scrollTo(0, 0));
{
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 600 }] });
  for (let s = 1; s <= 14; s++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y: 600 - s * 25 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(800);
  out.verticalPageScroll_dispatch = await page.evaluate(() => Math.round(window.scrollY));
  await cdp.detach();
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.mouse.move(180, 400);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(500);
out.verticalPageScroll_wheel = await page.evaluate(() => Math.round(window.scrollY));

// ── touch-action, on the region and every ancestor ───────────────────────
await page.locator("main table").first().scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
out.touchActionChain = await page.evaluate(() => {
  const chain = [];
  let el = document.querySelector(".shell-table-scroll");
  while (el && el !== document.documentElement.parentElement) {
    const cs = getComputedStyle(el);
    chain.push({
      node: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""),
      touchAction: cs.touchAction,
      overflowX: cs.overflowX,
      overscrollBehaviorX: cs.overscrollBehaviorX,
    });
    el = el.parentElement;
  }
  return chain;
});

// ── b) a scroll region that was already working before the fix ───────────
await page.goto(BASE + "/hizmetler/cnc-frezeleme", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
out.controlRoute = await page.evaluate(() => {
  const regions = [...document.querySelectorAll(".shell-table-scroll")];
  return regions.map((r) => ({
    clientWidth: r.clientWidth, scrollWidth: r.scrollWidth,
    tabindex: r.getAttribute("tabindex"), overflowX: getComputedStyle(r).overflowX,
  }));
});
{
  const idx = out.controlRoute.findIndex((r) => r.scrollWidth > r.clientWidth + 1);
  if (idx >= 0) {
    await page.evaluate((i) => document.querySelectorAll(".shell-table-scroll")[i].scrollIntoView({ block: "center" }), idx);
    await page.waitForTimeout(400);
    const box = await page.locator(".shell-table-scroll").nth(idx).boundingBox();
    const y = Math.max(30, Math.min(box.y + box.height / 2, 780));
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(Math.min(box.x + box.width / 2, 345)), y: Math.round(y), xDistance: -200, yDistance: 0, gestureSourceType: "touch", speed: 800 });
    await page.waitForTimeout(800);
    out.controlRegion_touchScrollLeft = await page.evaluate((i) => document.querySelectorAll(".shell-table-scroll")[i].scrollLeft, idx);
    await cdp.detach();
    // and the keyboard path on the same known-good region
    await page.evaluate((i) => { const e = document.querySelectorAll(".shell-table-scroll")[i]; e.scrollLeft = 0; e.focus(); }, idx);
    for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(400);
    out.controlRegion_arrowScrollLeft = await page.evaluate((i) => document.querySelectorAll(".shell-table-scroll")[i].scrollLeft, idx);
    out.controlRegionIndex = idx;
  }
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
