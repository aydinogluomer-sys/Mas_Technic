/* PROBE 9 — I4: is the inner-page <h1> visible and unclipped at 320/375/768/1280
 * under BOTH motion preferences, and does it depend on IntersectionObserver?
 *
 * The IO question is answered by neutering IntersectionObserver before any app
 * script runs (a stub that records observations and NEVER delivers a callback).
 * If the heading still paints, no reveal gates it. That is a stronger statement
 * than "clippers=[]".
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const ROUTES = [
  "/hizmetler/cnc-frezeleme",
  "/hizmetler/anodizasyon",
  "/endustriyel/havacilik-uzay",
  "/endustriyel/otomotiv",
  "/hizmetler/kategori/talasli-imalat",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/hakkimizda",
  "/iletisim",
];
const VPS = [
  { width: 320, height: 640, mobile: true },
  { width: 375, height: 812, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1280, height: 900 },
];

const IO_STUB = () => {
  window.__ioCalls = 0;
  class DeadIO {
    constructor() { window.__ioCalls++; }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  Object.defineProperty(window, "IntersectionObserver", { value: DeadIO, writable: true, configurable: true });
  Object.defineProperty(window, "IntersectionObserverEntry", { value: function () {}, writable: true, configurable: true });
};

const MEASURE = () => {
  const h1 = document.querySelector("h1");
  if (!h1) return { present: false };
  const r = h1.getBoundingClientRect();
  const cs = getComputedStyle(h1);
  // ancestors that could clip
  const clippers = [];
  let n = h1.parentElement;
  while (n && n !== document.documentElement) {
    const c = getComputedStyle(n);
    const nr = n.getBoundingClientRect();
    const hidesOverflow = c.overflow !== "visible" || c.overflowY !== "visible" || c.overflowX !== "visible";
    const clipsGeom = hidesOverflow && (r.top < nr.top - 0.5 || r.bottom > nr.bottom + 0.5 || r.left < nr.left - 0.5 || r.right > nr.right + 0.5);
    if (clipsGeom || (c.clipPath && c.clipPath !== "none") || Number(c.opacity) < 0.99) {
      clippers.push({
        cls: (n.getAttribute("class") || "").slice(0, 60),
        overflow: c.overflow, clipPath: c.clipPath.slice(0, 40), opacity: c.opacity,
        box: [Math.round(nr.top), Math.round(nr.bottom)],
        h1box: [Math.round(r.top), Math.round(r.bottom)],
      });
    }
    n = n.parentElement;
  }
  // hit-test the centre of the first line box of the h1's text
  let hitsSelf = null, hitTarget = null;
  const rg = document.createRange();
  rg.selectNodeContents(h1);
  const lines = [...rg.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
  if (lines.length) {
    const q = lines[0];
    const el = document.elementFromPoint(q.left + Math.min(q.width / 2, 40), q.top + q.height / 2);
    hitTarget = el ? el.tagName.toLowerCase() + "." + (el.getAttribute("class") || "").slice(0, 30) : null;
    hitsSelf = !!el && (el === h1 || h1.contains(el) || el.contains(h1));
  }
  return {
    present: true,
    text: (h1.textContent || "").trim().slice(0, 50),
    rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
    onScreen: r.top >= -0.5 && r.bottom <= window.innerHeight + 0.5 && r.left >= -0.5 && r.right <= window.innerWidth + 0.5,
    fullyInViewportWidth: r.left >= -0.5 && r.right <= window.innerWidth + 0.5,
    opacity: cs.opacity,
    visibility: cs.visibility,
    transform: cs.transform,
    clipPath: cs.clipPath.slice(0, 40),
    fontSize: cs.fontSize,
    clippers,
    hitsSelf,
    hitTarget,
    ioConstructed: window.__ioCalls ?? null,
    docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
};

const browser = await launch();
const out = {};
for (const vp of VPS) {
  for (const reduce of [true, false]) {
    for (const io of [true, false]) {
      const c = await ctx(browser, { ...vp, reduce });
      if (!io) await c.addInitScript(IO_STUB);
      const page = await c.newPage();
      for (const route of ROUTES) {
        await goto(page, route);
        await page.waitForTimeout(700);
        out[`${vp.width}|${reduce ? "reduce" : "no-pref"}|${io ? "IO" : "noIO"}|${route}`] =
          await page.evaluate(MEASURE);
      }
      await c.close();
    }
  }
}
await browser.close();
log(out);
