import { launch, ctx, goto, log } from "./lib.mjs";
const browser = await launch();
const out = {};
for (const vp of [{ width: 320, height: 640, mobile: true }, { width: 375, height: 812, mobile: true }, { width: 768, height: 1024, mobile: true }, { width: 1280, height: 900 }]) {
  const c = await ctx(browser, { ...vp, reduce: true });
  const page = await c.newPage();
  await goto(page, "/malzemeler");
  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(700);
  out[vp.width] = await page.evaluate(() => {
    const t = document.querySelector(".shell-table table");
    if (!t) return null;
    const ths = [...t.querySelectorAll("thead th")];
    const scroller = t.closest(".shell-table-scroll");
    const sr = scroller.getBoundingClientRect();
    return {
      total: ths.length,
      visible: ths.filter((th) => getComputedStyle(th).display !== "none").length,
      inView: ths.filter((th) => {
        const r = th.getBoundingClientRect();
        return getComputedStyle(th).display !== "none" && r.left >= sr.left - 1 && r.right <= sr.right + 1;
      }).map((th) => th.textContent.trim().slice(0, 18)),
      hidden: ths.filter((th) => getComputedStyle(th).display === "none").map((th) => th.textContent.trim().slice(0, 18)),
      scrollWidth: scroller.scrollWidth, clientWidth: scroller.clientWidth,
      focusStops: scroller.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,summary,[tabindex]:not([tabindex='-1'])").length,
      firstStop: (() => { const e = scroller.querySelector("a[href],button,input"); return e ? e.tagName + ":" + (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 24) : null; })(),
      lastStopColumn: (() => {
        const stops = [...scroller.querySelectorAll("button,input")];
        const last = stops[stops.length - 1];
        if (!last) return null;
        const td = last.closest("td,th");
        const row = td ? [...td.parentElement.children].indexOf(td) : null;
        return { tag: last.tagName, cell: row, text: (last.textContent || "").trim().slice(0, 20) };
      })(),
    };
  });
  await c.close();
}
await browser.close();
log(out);
