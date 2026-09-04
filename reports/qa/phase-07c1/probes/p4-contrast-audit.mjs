/* PROBE 4 — an INDEPENDENT full contrast audit, not a re-run of axe.
 *
 * axe declines a node whenever it cannot prove the background analytically
 * (image ancestor, overlap, partial obscuring). That is the exact hole the
 * Phase 04 defect hid in. This instrument never declines: it measures the
 * composited background from the RENDERED PIXELS by capturing each viewport
 * twice — once normally, once with `color: transparent` forced on everything —
 * and taking the modal pixel of each text node's own box from the second
 * capture. Foreground is the computed `color`, which is what SC 1.4.3 asks for.
 *
 * Output: every visible text node whose measured ratio is below its required
 * ratio, plus the whole distribution so a passing claim is falsifiable.
 */
import { launch, ctx, goto, BASE } from "./lib.mjs";

const ROUTES = (process.env.QA_ROUTES ?? [
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/cnc-frezeleme",
  "/endustriyel/havacilik-uzay",
  "/hizmetler/anodizasyon",
].join(",")).split(",");

const VIEWPORTS = (process.env.QA_VIEWPORTS ?? "1280,375").split(",").map(Number);

const COLLECT = () => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let node;
  while ((node = walker.nextNode())) {
    const t = (node.textContent || "").trim();
    if (!t) continue;
    const el = node.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (Number(cs.opacity) < 0.05) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    // skip elements that are entirely off-screen for this scroll step
    if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) continue;
    // skip clipped-out / visually-hidden patterns
    if (r.width <= 1 && r.height <= 1) continue;
    const px = parseFloat(cs.fontSize);
    const w = Number(cs.fontWeight) || (cs.fontWeight === "bold" ? 700 : 400);
    out.push({
      text: t.slice(0, 60),
      color: cs.color,
      fontSize: px,
      fontWeight: w,
      required: px >= 24 || (px >= 18.66 && w >= 700) ? 3.0 : 4.5,
      rect: {
        x: Math.max(0, Math.round(r.left)),
        y: Math.max(0, Math.round(r.top)),
        w: Math.round(Math.min(r.right, window.innerWidth) - Math.max(0, r.left)),
        h: Math.round(Math.min(r.bottom, window.innerHeight) - Math.max(0, r.top)),
      },
      sel: (() => {
        const parts = [];
        let n = el;
        for (let i = 0; n && i < 4; i++) {
          parts.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === "string"
            ? "." + n.className.trim().split(/\s+/).slice(0, 3).join(".") : ""));
          n = n.parentElement;
        }
        return parts.join(" > ");
      })(),
      ariaHidden: !!el.closest("[aria-hidden='true']"),
    });
  }
  return out;
};

const HIDE = `*,*::before,*::after{color:transparent !important;text-shadow:none !important;-webkit-text-stroke-width:0 !important;caret-color:transparent !important;}`;

const browser = await launch();
const results = {};

for (const width of VIEWPORTS) {
  const c = await ctx(browser, { width, height: width < 768 ? 812 : 900, mobile: width < 768, reduce: true });
  const page = await c.newPage();

  // in-page measuring kernel
  await page.addInitScript(() => {
    window.__qaMeasure = async (b64, nodes) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const g = cv.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const sx = cv.width / window.innerWidth;
      const sy = cv.height / window.innerHeight;
      const lum = (r, gg, b) => {
        const f = (x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b);
      };
      const contrast = (a, b) => {
        const [hi, lo] = [a, b].sort((p, q) => q - p);
        return (hi + 0.05) / (lo + 0.05);
      };
      return nodes.map((n) => {
        const x = Math.round(n.rect.x * sx), y = Math.round(n.rect.y * sy);
        const w = Math.max(1, Math.round(n.rect.w * sx)), h = Math.max(1, Math.round(n.rect.h * sy));
        if (x + w > cv.width || y + h > cv.height || w < 1 || h < 1) return { ...n, bg: null };
        const d = g.getImageData(x, y, w, h).data;
        const counts = new Map();
        for (let i = 0; i < d.length; i += 4) {
          const k = d[i] + "," + d[i + 1] + "," + d[i + 2];
          counts.set(k, (counts.get(k) || 0) + 1);
        }
        let best = null, bestN = -1;
        for (const [k, cnt] of counts) if (cnt > bestN) { bestN = cnt; best = k; }
        const bg = best.split(",").map(Number);
        const m = n.color.match(/rgba?\(([^)]+)\)/);
        if (!m) return { ...n, bg, ratio: null };
        const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
        const alpha = p[3] ?? 1;
        // composite the foreground over the measured background if it is
        // translucent — a 60%-alpha ink on graphite is not the ink's own ratio
        const fg = [0, 1, 2].map((i) => Math.round(p[i] * alpha + bg[i] * (1 - alpha)));
        return {
          ...n,
          bg,
          bgShare: +(bestN / (w * h)).toFixed(3),
          fgComposited: fg,
          alpha,
          ratio: +contrast(lum(fg[0], fg[1], fg[2]), lum(bg[0], bg[1], bg[2])).toFixed(3),
        };
      });
    };
  });

  for (const route of ROUTES) {
    await goto(page, route);
    // mount everything, then return to the top
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });

    const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = await page.evaluate(() => window.innerHeight);
    const steps = Math.min(14, Math.ceil(docHeight / vh));
    const failures = [];
    let measured = 0;
    const dist = { "<3": 0, "3-4.5": 0, "4.5-7": 0, ">=7": 0, unknown: 0 };

    for (let s = 0; s < steps; s++) {
      await page.evaluate((y) => window.scrollTo(0, y), s * vh);
      await page.waitForTimeout(280);
      const nodes = await page.evaluate(COLLECT);
      if (!nodes.length) continue;
      await page.addStyleTag({ content: HIDE, id: "qa-hide" });
      await page.waitForTimeout(120);
      const buf = await page.screenshot();
      await page.evaluate(() => {
        document.querySelectorAll("style").forEach((st) => {
          if (st.textContent && st.textContent.includes("caret-color:transparent")) st.remove();
        });
      });
      await page.waitForTimeout(80);
      const rows = await page.evaluate(
        ([b64, ns]) => window.__qaMeasure(b64, ns),
        [buf.toString("base64"), nodes],
      );
      for (const r of rows) {
        if (r.ratio == null) { dist.unknown++; continue; }
        measured++;
        if (r.ratio < 3) dist["<3"]++;
        else if (r.ratio < 4.5) dist["3-4.5"]++;
        else if (r.ratio < 7) dist["4.5-7"]++;
        else dist[">=7"]++;
        if (r.ratio < r.required) {
          failures.push({
            sel: r.sel, text: r.text, fontSize: r.fontSize, fontWeight: r.fontWeight,
            color: r.color, bg: r.bg, bgShare: r.bgShare, ratio: r.ratio, required: r.required,
            ariaHidden: r.ariaHidden, scrollStep: s,
          });
        }
      }
    }
    // de-duplicate by selector+text
    const uniq = new Map();
    for (const f of failures) {
      const k = f.sel + "|" + f.text + "|" + f.ratio;
      if (!uniq.has(k)) uniq.set(k, f);
    }
    results[`${width}|${route}`] = { measured, dist, failures: [...uniq.values()] };
    process.stderr.write(
      `${width} ${route}: measured ${measured}, below-threshold ${uniq.size}\n`,
    );
  }
  await c.close();
}
await browser.close();
process.stdout.write(JSON.stringify(results, null, 1) + "\n");
