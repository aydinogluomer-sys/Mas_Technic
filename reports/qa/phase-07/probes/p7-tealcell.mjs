/* PROBE 7 — chase down the one contrast fail p6 found: a <td> reading "$$$"
 * whose glyph line box is 67% rgb(10,126,139). Is it the cell's own paint, an
 * overlay, or the custom cursor parked on top of it?
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
const page = await c.newPage();
await goto(page, "/hizmetler/cnc-frezeleme");

const info = await page.evaluate(() => {
  const tds = [...document.querySelectorAll("td")].filter((t) => t.textContent.trim() === "$$$");
  return tds.map((td) => {
    const r = td.getBoundingClientRect();
    const chain = [];
    let n = td;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      chain.push({
        tag: n.tagName.toLowerCase(),
        cls: (n.getAttribute("class") || "").slice(0, 60),
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.slice(0, 60),
        opacity: cs.opacity,
      });
      n = n.parentElement;
    }
    // what is painted at the centre of this cell, per elementsFromPoint
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const stack = document.elementsFromPoint(cx, cy).slice(0, 6).map((e) => ({
      tag: e.tagName.toLowerCase(),
      cls: (e.getAttribute("class") || "").slice(0, 70),
      bg: getComputedStyle(e).backgroundColor,
      pos: getComputedStyle(e).position,
      z: getComputedStyle(e).zIndex,
    }));
    return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, color: getComputedStyle(td).color, chain: chain.slice(0, 6), stack, rowCls: td.parentElement.className, cellIndex: [...td.parentElement.children].indexOf(td) };
  });
});

// where is the custom cursor right now?
const cursor = await page.evaluate(() =>
  [...document.querySelectorAll("div.fixed")].filter((d) => {
    const cs = getComputedStyle(d);
    return cs.position === "fixed" && cs.pointerEvents === "none" && parseFloat(cs.borderRadius) > 0;
  }).map((d) => {
    const r = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    return { cls: d.className.slice(0, 70), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], bg: cs.backgroundColor, border: cs.borderColor, opacity: cs.opacity, transform: cs.transform };
  }));

log({ tds: info, cursorLike: cursor });
await page.screenshot({ path: "reports/qa/phase-07/evidence/p7-cnc-full.png", fullPage: false });
if (info[0]) {
  const r = info[0].rect;
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), r.y - 300);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "reports/qa/phase-07/evidence/p7-tealcell.png" });
}
await c.close();
await browser.close();
