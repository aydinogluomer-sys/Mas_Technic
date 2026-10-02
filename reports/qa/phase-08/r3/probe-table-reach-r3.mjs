/**
 * QA round 3 — RECONCILE THE TABLE REACH.
 *
 * Round 2 measured `/cerez-politikasi` madde 02 as 583.9px wide inside a 375px
 * viewport with NOTHING scrollable. C4 reports 24/24 cells reachable at
 * 320/375/390 and 768/1280/1440 unchanged. Both can be true — the fix landed in
 * between — so this re-measures from scratch, with the same instruments round 2
 * used to declare it unreachable plus two C4 named (real CDP touch drag, and
 * the `End` key on a focused region).
 *
 * A cell counts as REACHABLE only if, after scrolling the region by a real
 * input path, its whole box lies inside the viewport's x range. Off-screen and
 * merely-clipped both count as unreachable.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const ROUTE = process.env.ROUTE || "/cerez-politikasi";

const VIEWPORTS = [
  { w: 320, h: 568, touch: true },
  { w: 375, h: 812, touch: true },
  { w: 390, h: 844, touch: true },
  { w: 768, h: 1024, touch: true },
  { w: 1280, h: 800, touch: false },
  { w: 1440, h: 900, touch: false },
];

const browser = await chromium.launch({ executablePath: EXE });
const out = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    hasTouch: vp.touch,
    isMobile: vp.touch,
    deviceScaleFactor: vp.touch ? 2 : 1,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + ROUTE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.locator("main table").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const geometry = await page.evaluate(() => {
    const table = document.querySelector("main table");
    const scroll = table.closest(".shell-table-scroll");
    const figure = table.closest("figure.shell-table");
    const wrapper = figure.parentElement;
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { w: +r.width.toFixed(3), x: +r.x.toFixed(3), right: +r.right.toFixed(3) };
    };
    const cs = getComputedStyle(scroll);
    const wcs = getComputedStyle(wrapper);
    return {
      viewport: window.innerWidth,
      table: box(table),
      figure: box(figure),
      wrapper: { class: wrapper.className, display: wcs.display, ...box(wrapper) },
      scrollRegion: {
        class: scroll.className,
        clientWidth: scroll.clientWidth,
        scrollWidth: scroll.scrollWidth,
        overflowX: cs.overflowX,
        tabindex: scroll.getAttribute("tabindex"),
        role: scroll.getAttribute("role"),
        ariaLabel: scroll.getAttribute("aria-label"),
        owned: scroll.getAttribute("data-shell-scroll-region"),
      },
      docOverflow: getComputedStyle(document.querySelector("div.shell-root")).overflowX,
      docReflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  /* ── reach, cell by cell ──────────────────────────────────────────────
     For every one of the 4 header cells and every body cell, drive the
     scroll region to the position that would expose it and then MEASURE the
     resulting viewport rect. `scrollLeft` assignment is the weakest possible
     claim of scrollability — if the box is not a real scroll box it silently
     stays 0, which is exactly what round 2 measured. */
  const reach = await page.evaluate(() => {
    const table = document.querySelector("main table");
    const scroll = table.closest(".shell-table-scroll");
    const cells = [
      ...table.querySelectorAll("thead th"),
      ...table.querySelectorAll("tbody th, tbody td"),
    ];
    const report = [];
    for (const cell of cells) {
      const before = scroll.scrollLeft;
      // put the cell's left edge at the region's left edge, clamped
      const target = cell.offsetLeft - table.offsetLeft;
      scroll.scrollLeft = target;
      const applied = scroll.scrollLeft;
      const r = cell.getBoundingClientRect();
      const inside = r.left >= -0.5 && r.right <= window.innerWidth + 0.5;
      report.push({
        text: (cell.textContent || "").trim().slice(0, 24),
        head: cell.closest("thead") !== null,
        scrollLeftApplied: +applied.toFixed(2),
        left: +r.left.toFixed(2),
        right: +r.right.toFixed(2),
        inside,
        neededScroll: applied !== before || target === before,
      });
      scroll.scrollLeft = 0;
    }
    return report;
  });

  /* ── the two input paths a human actually has ─────────────────────── */
  const scrollBox = await page.locator(".shell-table-scroll").first().boundingBox();

  // keyboard: focus the region, press End
  let keyboard = null;
  try {
    await page.evaluate(() => document.querySelector(".shell-table-scroll").focus());
    const focused = await page.evaluate(() => document.activeElement?.className || null);
    await page.keyboard.press("End");
    await page.waitForTimeout(350);
    keyboard = await page.evaluate(() => {
      const s = document.querySelector(".shell-table-scroll");
      const last = document.querySelectorAll("main table thead th")[3];
      const r = last.getBoundingClientRect();
      return {
        scrollLeft: +s.scrollLeft.toFixed(2),
        maxScrollLeft: s.scrollWidth - s.clientWidth,
        lastHeaderRight: +r.right.toFixed(2),
        lastHeaderInside: r.left >= -0.5 && r.right <= window.innerWidth + 0.5,
      };
    });
    keyboard.focusedClass = focused;
  } catch (e) { keyboard = { error: String(e) }; }

  await page.evaluate(() => { document.querySelector(".shell-table-scroll").scrollLeft = 0; });

  // touch: a real CDP drag across the region
  let touch = null;
  if (vp.touch && scrollBox) {
    try {
      const cdp = await ctx.newCDPSession(page);
      const y = Math.min(scrollBox.y + scrollBox.height / 2, vp.h - 20);
      const x0 = Math.min(scrollBox.x + scrollBox.width - 20, vp.w - 20);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
      for (let step = 1; step <= 12; step++) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: Math.max(x0 - step * 20, 5), y }],
        });
        await page.waitForTimeout(16);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(500);
      touch = await page.evaluate(() => {
        const s = document.querySelector(".shell-table-scroll");
        return { scrollLeft: +s.scrollLeft.toFixed(2), windowScrollX: window.scrollX };
      });
      await cdp.detach();
    } catch (e) { touch = { error: String(e) }; }
  }

  const cellsTotal = reach.length;
  const cellsReachable = reach.filter((c) => c.inside).length;

  out.push({ viewport: vp.w, geometry, cellsTotal, cellsReachable, reach, keyboard, touch });
  await page.screenshot({ path: `reports/qa/phase-08/r3/shots/cerez-${vp.w}.png` });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
