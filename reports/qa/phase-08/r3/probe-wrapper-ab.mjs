/**
 * QA round 3 — A/B THE WRAPPER, LIVE, AT SIX WIDTHS.
 *
 * Two jobs:
 *
 * 1. C4 claims 768/1280/1440 are "unchanged digit for digit". Round 2 recorded
 *    no digits at those widths for this route, so the claim cannot be checked
 *    against my own record. It CAN be checked directly: restore the pre-C4
 *    markup in the live DOM (`div.shell-doc-table` -> `div.shell-stack`,
 *    `data-gap="sm"`) and re-measure. Same page, same fonts, same layout pass.
 *
 * 2. Establish what a guard would have had to assert to catch R2-1. The
 *    pre-fix `.shell-table-scroll` had clientWidth 584 and scrollWidth 584 —
 *    it FIT ITS OWN BOX. Any predicate of the form
 *    `scrollWidth <= clientWidth + 1 || isScrollable(el)` is therefore GREEN on
 *    the defect. This probe measures both sides so the new guard can be built
 *    on the predicate that actually discriminates.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const WIDTHS = [320, 375, 390, 768, 1280, 1440];

const measure = () => {
  const table = document.querySelector("main table");
  const scroll = table.closest(".shell-table-scroll");
  const figure = table.closest("figure.shell-table");
  const wrapper = figure.parentElement;
  const r = (el) => { const b = el.getBoundingClientRect(); return { w: +b.width.toFixed(3), x: +b.x.toFixed(3), right: +b.right.toFixed(3) }; };
  const before = scroll.scrollLeft;
  scroll.scrollLeft = 9999;
  const forced = scroll.scrollLeft;
  scroll.scrollLeft = before;
  const cells = [...table.querySelectorAll("thead th")].map((th) => {
    const b = th.getBoundingClientRect();
    return { text: th.textContent.trim(), left: +b.left.toFixed(2), right: +b.right.toFixed(2) };
  });
  return {
    viewport: window.innerWidth,
    wrapperClass: wrapper.className,
    wrapperDisplay: getComputedStyle(wrapper).display,
    wrapperTrack: getComputedStyle(wrapper).gridTemplateColumns,
    wrapper: r(wrapper),
    figureMinWidth: getComputedStyle(figure).minWidth,
    figure: r(figure),
    region: {
      ...r(scroll),
      clientWidth: scroll.clientWidth,
      scrollWidth: scroll.scrollWidth,
      overflowX: getComputedStyle(scroll).overflowX,
      forcedScrollLeft: forced,
      tabindex: scroll.getAttribute("tabindex"),
      // THE PREDICATE THE C4 COMMENT AND THE QA PACKET BOTH PROPOSE
      packetPredicate: scroll.scrollWidth <= scroll.clientWidth + 1
        || ((getComputedStyle(scroll).overflowX === "auto" || getComputedStyle(scroll).overflowX === "scroll")
          && scroll.scrollWidth > scroll.clientWidth + 1),
      // WHAT A READER ACTUALLY NEEDS: the region's own box on screen, and the
      // whole table reachable inside it.
      regionOnScreen: r(scroll).x >= -1 && r(scroll).right <= window.innerWidth + 1,
    },
    table: r(table),
    headers: cells,
    headersOffscreen: cells.filter((c) => c.left < -0.5 || c.right > window.innerWidth + 0.5).map((c) => c.text),
  };
};

const browser = await chromium.launch({ executablePath: EXE });
const out = [];

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 812 : 900 },
    hasTouch: w < 900, isMobile: w < 900, deviceScaleFactor: w < 768 ? 2 : 1,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.locator("main table").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const shipped = await page.evaluate(measure);

  // restore the pre-C4 markup, exactly
  await page.evaluate(() => {
    const wrapper = document.querySelector("main table").closest("figure.shell-table").parentElement;
    wrapper.className = "shell-stack";
    wrapper.setAttribute("data-gap", "sm");
  });
  await page.waitForTimeout(400);
  await page.locator("main table").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const reverted = await page.evaluate(measure);

  out.push({ viewport: w, shipped, reverted });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
