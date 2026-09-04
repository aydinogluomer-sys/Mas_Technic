import { launch, ctx, goto, log } from "./lib.mjs";

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
const page = await c.newPage();
await goto(page, "/hizmetler/cnc-frezeleme");

// mimic p6's scroll stepping so we land in the same state
const steps = await page.evaluate(() =>
  Math.max(1, Math.ceil(document.body.scrollHeight / (window.innerHeight * 0.85))));
let found = null;
for (let s = 0; s < steps + 1 && !found; s++) {
  await page.evaluate((k) => window.scrollTo(0, k * window.innerHeight * 0.85), s);
  await page.waitForTimeout(400);
  found = await page.evaluate(() => {
    const td = [...document.querySelectorAll("td")].find((t) => t.textContent.trim() === "$$$");
    if (!td) return null;
    const r = td.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) return null;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      scrollY: window.scrollY,
      stack: document.elementsFromPoint(cx, cy).slice(0, 8).map((e) => ({
        tag: e.tagName.toLowerCase(),
        cls: (e.getAttribute("class") || "").slice(0, 70),
        bg: getComputedStyle(e).backgroundColor,
        pos: getComputedStyle(e).position,
        z: getComputedStyle(e).zIndex,
        rect: (() => { const q = e.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height)]; })(),
      })),
      pseudo: (() => {
        const out = [];
        for (const p of ["::before", "::after"]) {
          for (const el of [td, td.parentElement, td.closest("table")]) {
            const cs = getComputedStyle(el, p);
            if (cs.content !== "none" || cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
              out.push({ on: el.tagName + (el.className ? "." + el.className.slice(0, 30) : ""), p, content: cs.content.slice(0, 30), bg: cs.backgroundColor, w: cs.width, h: cs.height, pos: cs.position });
            }
          }
        }
        return out;
      })(),
    };
  });
}

if (found) {
  const r = found.rect;
  const clip = { x: Math.max(0, r.x - 60), y: Math.max(0, r.y - 30), width: Math.min(400, r.w + 120), height: Math.min(120, r.h + 60) };
  await page.screenshot({ path: "reports/qa/phase-07/evidence/p7b-cell-normal.png", clip });
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      el.style.setProperty("color", "transparent", "important");
      el.style.setProperty("-webkit-text-fill-color", "transparent", "important");
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "reports/qa/phase-07/evidence/p7b-cell-notext.png", clip });
}
log({ found });
await c.close();
await browser.close();
