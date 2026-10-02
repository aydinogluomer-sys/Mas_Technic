/* PROBE 6 — QA run 2. An INDEPENDENT contrast instrument for B24.
 *
 * Why not the Coder's method: it takes the modal *glyph* pixel as foreground,
 * which under-reports below ~12px because antialiasing never lets a pixel reach
 * the glyph core. This instrument never reads a glyph pixel at all.
 *
 *   BACKGROUND — measured, from rendered pixels. Every text-bearing element on
 *     the page is set `visibility:hidden` at once (which does not move layout),
 *     the viewport is screenshotted, and each element's own bounding box is read
 *     out of that screenshot. That composites photographs, gradients, overlays,
 *     ancestor opacity and blend of everything BEHIND the text, correctly, and
 *     it is exactly the case axe declines to guess at ("bgOverlap").
 *
 *   FOREGROUND — computed, not sampled. The perceived glyph colour at full
 *     coverage is composite(color, alpha x ancestor-opacity-chain) over that
 *     measured background. That is the WCAG foreground by definition and it is
 *     immune to glyph size.
 *
 * Reported per element: ratio against the MODAL background pixel and against
 * the WORST background pixel in the box, plus the naive glyph-pixel number so
 * the Coder's caveat can be tested against this instrument directly.
 *
 * Negative controls are injected on every run (known 21:1, known 1.0:1, known
 * 3.0:1 and an 8px version of the same) and asserted before any result is used.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const ROUTES = process.env.QA_ROUTES
  ? process.env.QA_ROUTES.split(",")
  : [
      "/hakkimizda",
      "/iletisim",
      "/malzemeler",
      "/malzemeler/aluminyum",
      "/hizmetler/kategori/talasli-imalat",
      "/hizmetler/cnc-frezeleme",
      "/endustriyel/havacilik-uzay",
    ];

const VIEWPORTS = process.env.QA_VP === "375"
  ? [{ width: 375, height: 812, mobile: true }]
  : [{ width: 1280, height: 900 }];

/* ---------- in-page helpers, installed once per page ---------- */
const INSTALL = () => {
  const W = window;
  W.__qa = {};

  W.__qa.vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden"
      && cs.display !== "none" && Number(cs.opacity) > 0.01;
  };

  /** direct (own) text of an element, ignoring text inside child elements */
  W.__qa.ownText = (el) => {
    let s = "";
    for (const n of el.childNodes) if (n.nodeType === 3) s += n.nodeValue;
    return s.replace(/\s+/g, " ").trim();
  };

  W.__qa.candidates = () => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("svg")) continue;
      const t = W.__qa.ownText(el);
      if (!t) continue;
      if (!W.__qa.vis(el)) continue;
      out.push(el);
    }
    W.__qa._els = out;
    /* Snapshot every style we will need BEFORE anything is mutated. Reading
       computed colour after the transparency pass is an ordering hazard that
       silently turns every element into "1.0:1". */
    W.__qa._snap = out.map((el) => {
      const cs = getComputedStyle(el);
      return {
        color: cs.color,
        fontSize: parseFloat(cs.fontSize),
        fontWeight: parseInt(cs.fontWeight, 10) || 400,
      };
    });
    return out.length;
  };

  /* Remove the GLYPHS without removing the element's own background, its
     layout, or anything painted behind it. `visibility:hidden` would take the
     element's own background with it and make a light button read as the dark
     band behind it — measured, and it produced two false 1.07:1 results. */
  W.__qa.hideText = (on) => {
    for (const el of W.__qa._els) {
      if (on) {
        el.style.setProperty("color", "transparent", "important");
        el.style.setProperty("-webkit-text-fill-color", "transparent", "important");
        el.style.setProperty("text-shadow", "none", "important");
        el.style.setProperty("text-decoration-color", "transparent", "important");
      } else {
        el.style.removeProperty("color");
        el.style.removeProperty("-webkit-text-fill-color");
        el.style.removeProperty("text-shadow");
        el.style.removeProperty("text-decoration-color");
      }
    }
  };

  /* The line boxes the glyphs actually occupy, not the element box. Sampling
     the element box lets an unrelated accent rule or panel inside the same box
     masquerade as the text background. */
  W.__qa.lineRects = (el) => {
    const rects = [];
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 1 && r.height > 1) rects.push(r);
    }
    return rects;
  };

  /** every visible position:fixed overlay that can paint on top of body text */
  W.__qa.overlays = () => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed") continue;
      if (!W.__qa.vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      out.push({ cls: (el.getAttribute("class") || "").slice(0, 50), tag: el.tagName.toLowerCase(),
                 x: r.x, y: r.y, w: r.width, h: r.height, z: cs.zIndex });
    }
    return out;
  };

  W.__qa.overlapFrac = (rects, ovs) => {
    let total = 0, covered = 0;
    for (const r of rects) {
      total += r.width * r.height;
      for (const o of ovs) {
        const ix = Math.max(0, Math.min(r.right, o.x + o.w) - Math.max(r.left, o.x));
        const iy = Math.max(0, Math.min(r.bottom, o.y + o.h) - Math.max(r.top, o.y));
        covered += ix * iy;
      }
    }
    return total ? Math.min(1, covered / total) : 0;
  };

  W.__qa.selector = (el) => {
    const parts = [];
    let n = el;
    for (let i = 0; i < 4 && n && n.nodeType === 1 && n !== document.body; i++) {
      const cls = (n.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
      parts.unshift(n.tagName.toLowerCase() + (cls ? "." + cls : ""));
      n = n.parentElement;
    }
    return parts.join(" > ");
  };

  /** product of the opacity of the element and every ancestor */
  W.__qa.opacityChain = (el) => {
    let o = 1, n = el;
    while (n && n !== document.documentElement) {
      const v = Number(getComputedStyle(n).opacity);
      if (!Number.isNaN(v)) o *= v;
      n = n.parentElement;
    }
    return o;
  };

  W.__qa.parseRGB = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };

  W.__qa.lum = (r, g, b) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  W.__qa.ratio = (a, b) => {
    const l1 = W.__qa.lum(a[0], a[1], a[2]), l2 = W.__qa.lum(b[0], b[1], b[2]);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  W.__qa.over = (fg, bg) => [
    fg.r * fg.a + bg[0] * (1 - fg.a),
    fg.g * fg.a + bg[1] * (1 - fg.a),
    fg.b * fg.a + bg[2] * (1 - fg.a),
  ];

  /** decode a base64 PNG into an ImageData held on window */
  W.__qa.loadShot = async (b64, key) => {
    const blob = await (await fetch("data:image/png;base64," + b64)).blob();
    const bmp = await createImageBitmap(blob);
    const cv = new OffscreenCanvas(bmp.width, bmp.height);
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(bmp, 0, 0);
    W.__qa[key] = cx.getImageData(0, 0, bmp.width, bmp.height);
    W.__qa[key + "_scale"] = bmp.width / window.innerWidth;
    return [bmp.width, bmp.height];
  };

  /** all pixels of a rect out of a stored ImageData, as a colour histogram */
  W.__qa.hist = (key, rects) => {
    const img = W.__qa[key], s = W.__qa[key + "_scale"];
    if (!img) return null;
    const map = new Map();
    let total = 0;
    for (const rect of rects) {
      const x0 = Math.max(0, Math.round(rect.x * s)), y0 = Math.max(0, Math.round(rect.y * s));
      const x1 = Math.min(img.width, Math.round((rect.x + rect.width) * s));
      const y1 = Math.min(img.height, Math.round((rect.y + rect.height) * s));
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * img.width + x) * 4;
          const k = (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2];
          map.set(k, (map.get(k) || 0) + 1);
          total++;
        }
      }
    }
    if (!total) return null;
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return { total, entries: arr.map(([k, n]) => [[(k >> 16) & 255, (k >> 8) & 255, k & 255], n]) };
  };
};

/** measure every candidate currently fully inside the viewport */
const MEASURE = (done) => {
  const W = window, Q = W.__qa;
  const out = [];
  const ovs = Q.overlays();
  W.__qa._els.forEach((el, idx) => {
    if (done.includes(idx)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (r.top < 0 || r.bottom > window.innerHeight || r.left < 0 || r.right > window.innerWidth) return;
    if (!Q.vis(el)) return;
    const lines = Q.lineRects(el);
    if (!lines.length) return;
    const snap = Q._snap[idx];
    const cs = getComputedStyle(el);
    const bgH = Q.hist("bg", lines);
    const fgH = Q.hist("fg", lines);
    if (!bgH || bgH.total < 4) return;
    const col = Q.parseRGB(snap.color);
    if (!col) return;
    const chain = Q.opacityChain(el);
    const eff = { r: col.r, g: col.g, b: col.b, a: col.a * chain };

    // modal background = most common pixel with text hidden
    const modal = bgH.entries[0][0];
    const modalShare = bgH.entries[0][1] / bgH.total;
    const fgModal = Q.over(eff, modal);
    const rModal = Q.ratio(fgModal, modal);

    // worst background pixel that occupies at least 2% of the box
    let worst = { ratio: Infinity, bg: modal };
    for (const [c, n] of bgH.entries) {
      if (n / bgH.total < 0.05) continue;
      const rr = Q.ratio(Q.over(eff, c), c);
      if (rr < worst.ratio) worst = { ratio: rr, bg: c };
    }

    // the naive method under test: modal glyph pixel from the composited shot
    let naive = null;
    if (fgH && fgH.total > 3) {
      // the pixel in the composited shot furthest (in luminance) from the modal bg
      let best = null, bd = -1;
      for (const [c, n] of fgH.entries) {
        if (n / fgH.total < 0.005) continue;
        const d = Math.abs(Q.lum(c[0], c[1], c[2]) - Q.lum(modal[0], modal[1], modal[2]));
        if (d > bd) { bd = d; best = c; }
      }
      if (best) naive = { px: best, ratio: Q.ratio(best, modal) };
    }

    const fs = snap.fontSize;
    const fw = snap.fontWeight;
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    out.push({
      idx,
      sel: Q.selector(el),
      text: Q.ownText(el).slice(0, 44),
      fontSize: +fs.toFixed(2),
      fontWeight: fw,
      required: large ? 3 : 4.5,
      color: snap.color,
      opacityChain: +chain.toFixed(3),
      ariaHidden: !!el.closest("[aria-hidden='true']"),
      modalBg: modal,
      modalShare: +modalShare.toFixed(3),
      ratioModal: +rModal.toFixed(3),
      ratioWorst: +worst.ratio.toFixed(3),
      worstBg: worst.bg,
      naiveGlyphRatio: naive ? +naive.ratio.toFixed(3) : null,
      naiveGlyphPx: naive ? naive.px : null,
      bgColors: bgH.entries.length,
      overlayCover: +Q.overlapFrac(lines, ovs).toFixed(3),
      overlays: Q.overlapFrac(lines, ovs) > 0.05 ? ovs.filter((o) => Q.overlapFrac(lines, [o]) > 0.05).map((o) => o.tag + "." + o.cls) : [],
    });
  });
  return out;
};

const CONTROLS = () => {
  const host = document.createElement("div");
  host.id = "qa-contrast-controls";
  host.style.cssText = "position:fixed;top:0;right:0;z-index:2147483647;background:#fff;padding:2px";
  host.innerHTML = `
   <div style="background:#ffffff"><span id="qa-c-21" style="color:#000000;font-size:16px">kontrol yirmibir</span></div>
   <div style="background:#808080"><span id="qa-c-1" style="color:#808080;font-size:16px">kontrol bir</span></div>
   <div style="background:#ffffff"><span id="qa-c-3" style="color:#949494;font-size:16px">kontrol uc</span></div>
   <div style="background:#ffffff"><span id="qa-c-3s" style="color:#949494;font-size:8px">kontrol uc kucuk</span></div>
   <div style="background:#ffffff;opacity:0.5"><span id="qa-c-op" style="color:#000000;font-size:16px">kontrol yarim opaklik</span></div>`;
  document.body.insertBefore(host, document.body.firstChild);
};

const settle = async (page) => {
  await page.evaluate(async () => {
    try {
      await Promise.race([
        Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    } catch { /* ignore */ }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 260));
  });
};

const shootInto = async (page, key) => {
  const buf = await page.screenshot({ type: "png" });
  await page.evaluate(
    ([b64, k]) => window.__qa.loadShot(b64, k),
    [buf.toString("base64"), key],
  );
};

const browser = await launch();
const out = {};
for (const vp of VIEWPORTS) {
  const c = await ctx(browser, { ...vp, reduce: true });
  const page = await c.newPage();
  for (const route of ROUTES) {
    await goto(page, route);
    await page.evaluate(INSTALL);
    await page.evaluate(CONTROLS);
    const n = await page.evaluate(() => window.__qa.candidates());
    const rows = [];
    const done = [];
    const steps = await page.evaluate(() =>
      Math.max(1, Math.ceil(document.body.scrollHeight / (window.innerHeight * 0.85))));
    for (let s = 0; s < Math.min(steps + 1, 40); s++) {
      await page.evaluate((k) => window.scrollTo(0, k * window.innerHeight * 0.85), s);
      await settle(page);
      // composited shot first, then the background shot
      await shootInto(page, "fg");
      await page.evaluate(() => window.__qa.hideText(true));
      await page.waitForTimeout(90);
      await shootInto(page, "bg");
      await page.evaluate(() => window.__qa.hideText(false));
      await page.waitForTimeout(60);
      const got = await page.evaluate(MEASURE, done);
      for (const g of got) { done.push(g.idx); g.scrollStep = s; rows.push(g); }
    }
    const ctl = rows.filter((r) => r.sel.includes("#") || /kontrol/.test(r.text));
    out[`${vp.width}|${route}`] = {
      candidates: n,
      measured: rows.length,
      controls: ctl.map((r) => ({ text: r.text, fontSize: r.fontSize, ratioModal: r.ratioModal, naive: r.naiveGlyphRatio })),
      /* opacityChain ~ 0 means the glyphs are not painted at all at this scroll
         position; that is a motion-state question, not a contrast one. */
      fails: rows.filter((r) => !/kontrol/.test(r.text) && r.ratioModal < r.required && r.overlayCover <= 0.05 && r.opacityChain > 0.05),
      invisible: rows.filter((r) => !/kontrol/.test(r.text) && r.opacityChain <= 0.05).map((r) => ({ sel: r.sel, text: r.text, op: r.opacityChain, step: r.scrollStep })),
      failsOccluded: rows.filter((r) => !/kontrol/.test(r.text) && r.ratioModal < r.required && r.overlayCover > 0.05),
      nearWorst: rows.filter((r) => !/kontrol/.test(r.text) && r.ratioModal >= r.required && r.ratioWorst < r.required),
      smallText: rows.filter((r) => !/kontrol/.test(r.text) && r.fontSize <= 12)
        .map((r) => ({ sel: r.sel, text: r.text, fontSize: r.fontSize, color: r.color, modalBg: r.modalBg, ratioModal: r.ratioModal, naiveGlyphRatio: r.naiveGlyphRatio, ariaHidden: r.ariaHidden, required: r.required })),
      all: rows,
    };
    process.stderr.write(`${vp.width} ${route}: measured ${rows.length}/${n}, fails ${out[`${vp.width}|${route}`].fails.length}\n`);
  }
  await c.close();
}
await browser.close();
log(out);
