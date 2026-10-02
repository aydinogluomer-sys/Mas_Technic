/* PROBE 1 — does each Phase 07 route structurally belong to the landing family?
 *
 * Measured, not eyeballed:
 *   - shell frame present (.shell-root), one global header, exactly one footer
 *   - master grid: the left/right content edges of `.tl-grid` rows compared to
 *     the landing's own `.tl-grid` edges at the same viewport, in px
 *   - h1 count
 *   - links to /teklif-al inside the page body
 *   - every visible element's computed border-radius > 0  (rounded-card sweep)
 *   - "four equal icon tiles" detector: any element with >=3 element children
 *     whose bounding boxes are the same width AND same height (±2px), laid out
 *     on more than one row or as a grid, at least one of which contains an svg.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const ROUTES = [
  "/",
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/cnc-frezeleme",
  "/endustriyel/havacilik-uzay",
  "/hizmetler",
  "/endustriyel",
  "/malzemeler/paslanmaz-celik",
  "/hizmetler/kategori/yuzey-islem",
  "/hizmetler/anodizasyon",
  "/endustriyel/otomotiv",
];

const VIEWPORTS = [
  { width: 375, height: 812, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1280, height: 900 },
];

const measure = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"
      && Number(cs.opacity) > 0.01;
  };

  // --- master grid edges -------------------------------------------------
  const gridRows = [...document.querySelectorAll(".tl-grid")].filter(vis).slice(0, 40);
  const gridEdges = gridRows.map((g) => {
    const r = g.getBoundingClientRect();
    return { left: +r.left.toFixed(2), right: +r.right.toFixed(2), cols: getComputedStyle(g).gridTemplateColumns };
  });

  // --- radius sweep ------------------------------------------------------
  const rounded = [];
  for (const el of document.querySelectorAll("*")) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius];
    const px = radii.map((v) => parseFloat(v) || 0);
    if (Math.max(...px) > 0.5) {
      const r = el.getBoundingClientRect();
      rounded.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 110),
        radius: radii.join(" "),
        box: [Math.round(r.width), Math.round(r.height)],
        inFooter: !!el.closest("footer, .tl-footer"),
        inHeader: !!el.closest("[data-fullscreen-header], header"),
        inChat: !!el.closest("[class*='chat'], [id*='chat']"),
        text: (el.textContent || "").trim().slice(0, 40),
      });
    }
  }

  // --- shadow sweep ------------------------------------------------------
  const shadowed = [];
  for (const el of document.querySelectorAll("*")) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.boxShadow && cs.boxShadow !== "none") {
      shadowed.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 90),
        shadow: cs.boxShadow.slice(0, 70),
      });
    }
  }

  // --- equal-tile grid detector -----------------------------------------
  const tiles = [];
  for (const parent of document.querySelectorAll("main *, .shell-root *")) {
    const kids = [...parent.children].filter(vis);
    if (kids.length < 3 || kids.length > 8) continue;
    const boxes = kids.map((k) => k.getBoundingClientRect());
    const w = boxes[0].width, h = boxes[0].height;
    if (w < 60 || h < 60) continue;
    const sameW = boxes.every((b) => Math.abs(b.width - w) <= 2);
    const sameH = boxes.every((b) => Math.abs(b.height - h) <= 2);
    if (!sameW || !sameH) continue;
    // more than one per row => a grid, not a stack
    const tops = new Set(boxes.map((b) => Math.round(b.top)));
    const perRow = kids.length / tops.size;
    if (perRow < 2) continue;
    const withIcon = kids.filter((k) => k.querySelector("svg, img, [class*='icon']")).length;
    tiles.push({
      parentTag: parent.tagName.toLowerCase(),
      parentCls: (parent.getAttribute("class") || "").slice(0, 90),
      n: kids.length,
      perRow,
      tile: [Math.round(w), Math.round(h)],
      kidsWithIcon: withIcon,
      kidCls: (kids[0].getAttribute("class") || "").slice(0, 80),
      sampleText: (kids[0].textContent || "").trim().replace(/\s+/g, " ").slice(0, 70),
    });
  }

  // --- headings ----------------------------------------------------------
  const h1 = [...document.querySelectorAll("h1")].map((e) => ({
    text: (e.textContent || "").trim().slice(0, 80),
    visible: vis(e),
  }));

  const rfq = [...document.querySelectorAll('a[href="/teklif-al"], a[href$="/teklif-al"]')]
    .filter(vis)
    .map((a) => ({
      text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
      inFooter: !!a.closest("footer, .tl-footer"),
      inHeader: !!a.closest("[data-fullscreen-header], header"),
      inNext: !!a.closest(".shell-next"),
      tabindex: a.getAttribute("tabindex"),
    }));

  return {
    shellRoot: document.querySelectorAll(".shell-root").length,
    header: document.querySelectorAll("[data-fullscreen-header]").length,
    footers: document.querySelectorAll("footer").length,
    tlFooters: document.querySelectorAll(".tl-footer").length,
    footerTags: [...document.querySelectorAll("footer")].map((f) => (f.getAttribute("class") || "").slice(0, 60)),
    bands: document.querySelectorAll(".tl-band, .shell-band").length,
    gridRows: gridEdges.length,
    gridEdges: gridEdges.slice(0, 8),
    h1,
    rfq,
    rounded,
    shadowed,
    tiles,
    shellNext: document.querySelectorAll(".shell-next").length,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    rootAttrs: (() => {
      const r = document.querySelector(".shell-root");
      if (!r) return null;
      const out = {};
      for (const a of r.attributes) out[a.name] = a.value.slice(0, 60);
      return out;
    })(),
  };
};

const browser = await launch();
const out = {};
for (const vp of VIEWPORTS) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  for (const route of ROUTES) {
    await goto(page, route);
    // scroll the whole page so lazy/IO-gated content mounts, then return
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += window.innerHeight * 0.8) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 200));
    });
    out[`${vp.width}|${route}`] = await page.evaluate(measure);
  }
  await c.close();
}
await browser.close();
log(out);
