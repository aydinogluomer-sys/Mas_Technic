/**
 * QA round 3 — WHICH REAL INPUT PATHS ACTUALLY MOVE THE REGION at 320/375/390.
 *
 * The main reach probe showed 24/24 cells reachable by `scrollLeft` assignment,
 * but `End` and a hand-rolled CDP touch drag both left `scrollLeft` at 0. A
 * programmatic `scrollLeft` that sticks is proof the box is a real scroll box
 * (it did NOT stick before the fix), but it is not proof a human can reach it.
 * So try every path a human has, one at a time, from a clean scroll position.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const WIDTHS = [320, 375, 390];

const browser = await chromium.launch({ executablePath: EXE });
const out = [];

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.locator("main table").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const reset = () => page.evaluate(() => {
    const s = document.querySelector(".shell-table-scroll");
    s.scrollLeft = 0;
    s.blur?.();
    document.body.focus?.();
  });
  const read = () => page.evaluate(() => {
    const s = document.querySelector(".shell-table-scroll");
    const last = document.querySelectorAll("main table thead th")[3];
    const r = last.getBoundingClientRect();
    return {
      scrollLeft: +s.scrollLeft.toFixed(2),
      max: s.scrollWidth - s.clientWidth,
      lastHeaderInside: r.left >= -0.5 && r.right <= window.innerWidth + 0.5,
      active: document.activeElement ? document.activeElement.className || document.activeElement.tagName : null,
    };
  });

  const box = await page.locator(".shell-table-scroll").first().boundingBox();
  const yMid = Math.max(20, Math.min(box.y + 60, 812 - 40));
  const result = {};

  // 1 — TAB to it, then ArrowRight x30. The shell's own comment says arrow keys.
  await reset();
  await page.evaluate(() => document.querySelector(".shell-table-scroll").focus());
  for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(400);
  result.arrowRight = await read();

  // 2 — End, on the focused region
  await reset();
  await page.evaluate(() => document.querySelector(".shell-table-scroll").focus());
  await page.keyboard.press("End");
  await page.waitForTimeout(400);
  result.end = await read();

  // 3 — is it reachable by TAB at all, and at what position?
  await reset();
  const tabStop = await page.evaluate(() => {
    const target = document.querySelector(".shell-table-scroll");
    return {
      tabindex: target.getAttribute("tabindex"),
      role: target.getAttribute("role"),
      ariaLabel: target.getAttribute("aria-label"),
    };
  });
  result.affordance = tabStop;

  // 4 — mouse wheel with a horizontal delta over the region
  await reset();
  await page.mouse.move(Math.min(box.x + 40, w - 20), yMid);
  await page.mouse.wheel(400, 0);
  await page.waitForTimeout(500);
  result.wheelX = await read();

  // 5 — CDP synthesizeScrollGesture, gestureSourceType touch: the canonical
  //     simulation of a finger swipe; it drives the compositor, not the DOM.
  await reset();
  try {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Input.synthesizeScrollGesture", {
      x: Math.round(Math.min(box.x + box.width / 2, w - 30)),
      y: Math.round(yMid),
      xDistance: -260,
      yDistance: 0,
      gestureSourceType: "touch",
      speed: 800,
    });
    await page.waitForTimeout(700);
    result.touchGesture = await read();
    await cdp.detach();
  } catch (e) { result.touchGesture = { error: String(e) }; }

  // 6 — hand-rolled touch drag, the one the main probe used
  await reset();
  try {
    const cdp = await ctx.newCDPSession(page);
    const x0 = Math.min(box.x + box.width - 20, w - 20);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: yMid }] });
    for (let s = 1; s <= 14; s++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: Math.max(x0 - s * 20, 5), y: yMid }] });
      await page.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(600);
    result.touchDispatch = await read();
    await cdp.detach();
  } catch (e) { result.touchDispatch = { error: String(e) }; }

  // 7 — scrollLeft assignment, the control: it is what the main probe used
  await reset();
  await page.evaluate(() => { document.querySelector(".shell-table-scroll").scrollLeft = 9999; });
  await page.waitForTimeout(200);
  result.scrollLeftAssign = await read();

  // 8 — scrollIntoView on the last header, what assistive tech and find-in-page use
  await reset();
  await page.evaluate(() => {
    document.querySelectorAll("main table thead th")[3].scrollIntoView({ inline: "end", block: "nearest" });
  });
  await page.waitForTimeout(300);
  result.scrollIntoView = await read();

  out.push({ viewport: w, box: { x: +box.x.toFixed(2), y: +box.y.toFixed(2), w: +box.width.toFixed(2), h: +box.height.toFixed(2) }, ...result });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
