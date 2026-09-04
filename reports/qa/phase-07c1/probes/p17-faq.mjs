/* PROBE 17 — the one 375 contrast fail p6 reports on a rebuilt page body:
 * .shell-faq-answer p on /endustriyel/havacilik-uzay, snapshot colour
 * rgb(59,66,63) -> 1.917:1, while the naive glyph reading says 16.3:1.
 * When an instrument and its cross-check disagree by 8x, one of them is wrong.
 * Read the colour AT THE MOMENT OF MEASUREMENT instead of from a load-time
 * snapshot, which is the one thing p6 does not do.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const browser = await launch();
const c = await ctx(browser, { width: 375, height: 812, mobile: true, reduce: true });
const page = await c.newPage();
await goto(page, "/endustriyel/havacilik-uzay");

const atLoad = await page.evaluate(() => {
  const p = document.querySelector(".shell-faq-answer p");
  if (!p) return null;
  const r = p.getBoundingClientRect();
  return { color: getComputedStyle(p).color, opacity: getComputedStyle(p).opacity, h: Math.round(r.height),
           parentOpacity: getComputedStyle(p.closest(".shell-faq-answer")).opacity,
           detailsOpen: p.closest("details")?.open ?? null };
});

// scroll it into view and let anything scroll-driven settle
await page.evaluate(() => document.querySelector(".shell-faq-answer p")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(900);

const inView = await page.evaluate(() => {
  const p = document.querySelector(".shell-faq-answer p");
  const cs = getComputedStyle(p);
  let chain = 1, n = p;
  while (n && n !== document.documentElement) { chain *= Number(getComputedStyle(n).opacity); n = n.parentElement; }
  const rg = document.createRange(); rg.selectNodeContents(p);
  const rects = [...rg.getClientRects()].filter((q) => q.width > 1 && q.height > 1)
    .map((q) => ({ x: q.x, y: q.y, width: q.width, height: q.height }));
  return { color: cs.color, opacity: cs.opacity, chain: +chain.toFixed(3), rects: rects.slice(0, 3),
           text: (p.textContent || "").trim().slice(0, 50), detailsOpen: p.closest("details")?.open ?? null };
});

// sample the true background under the glyph line boxes
const shot = async (transparent) => {
  await page.evaluate((t) => {
    const p = document.querySelector(".shell-faq-answer p");
    if (t) { p.style.setProperty("color", "transparent", "important"); p.style.setProperty("-webkit-text-fill-color", "transparent", "important"); }
    else { p.style.removeProperty("color"); p.style.removeProperty("-webkit-text-fill-color"); }
  }, transparent);
  await page.waitForTimeout(120);
  const buf = await page.screenshot({ type: "png" });
  return buf.toString("base64");
};
const fg = await shot(false);
const bg = await shot(true);

const measured = await page.evaluate(async ([fgB64, bgB64, rects]) => {
  const dec = async (b64) => {
    const blob = await (await fetch("data:image/png;base64," + b64)).blob();
    const bmp = await createImageBitmap(blob);
    const cv = new OffscreenCanvas(bmp.width, bmp.height);
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(bmp, 0, 0);
    return { img: cx.getImageData(0, 0, bmp.width, bmp.height), s: bmp.width / window.innerWidth };
  };
  const hist = ({ img, s }, rs) => {
    const m = new Map(); let tot = 0;
    for (const r of rs) {
      for (let y = Math.round(r.y * s); y < Math.round((r.y + r.height) * s); y++)
        for (let x = Math.round(r.x * s); x < Math.round((r.x + r.width) * s); x++) {
          const i = (y * img.width + x) * 4;
          const k = (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2];
          m.set(k, (m.get(k) || 0) + 1); tot++;
        }
    }
    return { tot, top: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([k, n]) => [[(k >> 16) & 255, (k >> 8) & 255, k & 255], +(n / tot).toFixed(3)]) };
  };
  const F = await dec(fgB64), B = await dec(bgB64);
  return { fg: hist(F, rects), bg: hist(B, rects) };
}, [fg, bg, inView.rects]);

const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(3); };
const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };

const bgTop = measured.bg.top[0][0];
const col = parse(inView.color);
const eff = [col.r * col.a * inView.chain + bgTop[0] * (1 - col.a * inView.chain),
             col.g * col.a * inView.chain + bgTop[1] * (1 - col.a * inView.chain),
             col.b * col.a * inView.chain + bgTop[2] * (1 - col.a * inView.chain)];

log({ atLoad, inView, measured,
      modalBg: bgTop, effectiveFg: eff.map((v) => Math.round(v)),
      ratioFromColourAtMeasurement: ratio(eff, bgTop) });
await c.close();
await browser.close();
