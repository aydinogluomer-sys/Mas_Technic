// Phase 10-4 — font-swap shift probe.
//
// Two measurements per route, at 1280×800 and 375×812, `prefers-reduced-motion: reduce` so the
// motion layer is off and every shift left is the text's:
//
//   A. GEOMETRY. The route is loaded twice — once with every request to fonts.gstatic.com and
//      fonts.googleapis.com aborted (the page lays out in its fallback faces and never swaps),
//      once normally (webfonts loaded). For every visible element that owns text, the probe
//      records `top` and `height`, plus the document height. The swap shift is the difference
//      between the two layouts: mean |Δtop|, max |Δtop|, the share of elements whose top moved
//      by more than 1px, and Δ document height. This is what the reader would see move.
//
//   B. CLS. The route is loaded with the WOFF2 responses held back for 1200ms (the CSS arrives,
//      `display=swap` paints the fallback, then the fonts land and the text re-lays out). A
//      `PerformanceObserver` registered before any script runs sums every `layout-shift` entry
//      without recent input. A control run with the fonts blocked gives the shift that has
//      nothing to do with the swap; the difference is the swap's own CLS contribution.
//
//   C. OVERLAY. A representative site paragraph is laid out in the webfont and in the fallback
//      face at 20px/300px: the width ratio is the residual `size-adjust` error, and the line
//      count difference is what that error costs. (Before the fallback faces exist this compares
//      against the raw system font.)
//
// Output: JSON (PROBE_OUT) + Markdown (PROBE_MD). Run once before the fallback faces are added
// and once after; the report quotes both.
//
// Usage: PROBE_BASE=http://localhost:4197 PROBE_TAG=before node reports/10/probes/font-swap.probe.mjs
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..", "..");
const base = process.env.PROBE_BASE ?? "http://localhost:4197";
const tag = process.env.PROBE_TAG ?? "after";
const out = process.env.PROBE_OUT ?? join(root, "reports", "10", "probes", `font-swap-${tag}.json`);
const md = process.env.PROBE_MD ?? join(root, "reports", "10", "probes", `font-swap-${tag}.md`);
const ROUTES = process.env.PROBE_ROUTES?.split(",") ?? ["/", "/hizmetler/cnc-frezeleme", "/blog", "/kvkk", "/malzemeler"];
const LANES = [
  { vw: 1280, vh: 800, mobile: false },
  { vw: 375, vh: 812, mobile: true },
];
const FONT_HOST = /fonts\.(gstatic|googleapis)\.com/;
const HOLD_MS = 1200;

const readGeometry = () => {
  const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const rows = [];
  let i = 0;
  for (const el of document.body.querySelectorAll("*")) {
    if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH"].includes(el.tagName)) continue;
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join("");
    if (!norm(own)) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    rows.push({ i: i++, tag: el.tagName.toLowerCase(), family: s.fontFamily.split(",")[0].replace(/["']/g, ""), top: Math.round((r.top + window.scrollY) * 10) / 10, height: Math.round(r.height * 10) / 10, text: norm(own).slice(0, 24) });
  }
  return { docHeight: document.documentElement.scrollHeight, rows };
};

const readOverlay = (families) => {
  const sample = "Ölçülebilir hassasiyet: her parça için kontrol planı oluşturulur, ara kontroller proses sırasında yapılır ve son kontrol raporu teslimat dosyasına eklenir. Standart tolerans aralığımız ±0.01 mm olup geometriye göre teyit edilir.";
  const box = (family, weight) => {
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:-9999px;top:0;width:300px;font:${weight} 20px/1.5 ${family};`;
    d.textContent = sample;
    document.body.appendChild(d);
    const r = d.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(d);
    const lines = new Set(Array.from(range.getClientRects()).map((x) => Math.round(x.top)));
    // Single-line width for the ratio.
    d.style.width = "max-content";
    const w = d.getBoundingClientRect().width;
    d.remove();
    return { height: Math.round(r.height * 10) / 10, lines: lines.size, width: Math.round(w * 10) / 10 };
  };
  return families.map(({ web, fallback, weight }) => {
    const a = box(`"${web}"`, weight), b = box(fallback, weight);
    return { web, fallback, weight, webfont: a, fallbackFace: b, widthRatio: Math.round((b.width / a.width) * 10000) / 10000, heightRatio: Math.round((b.height / a.height) * 10000) / 10000 };
  });
};

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

async function newPage(lane, mode) {
  const ctx = await browser.newContext({
    viewport: { width: lane.vw, height: lane.vh }, deviceScaleFactor: 1, reducedMotion: "reduce",
    ...(lane.mobile ? { isMobile: true, hasTouch: true } : {}),
  });
  await ctx.addInitScript(() => {
    window.__cls = 0; window.__clsEntries = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__clsEntries.push({ t: Math.round(e.startTime), v: Math.round(e.value * 10000) / 10000 }); }
    }).observe({ type: "layout-shift", buffered: true });
  });
  if (mode === "blocked") await ctx.route((u) => FONT_HOST.test(u.hostname), (r) => r.abort());
  if (mode === "held") await ctx.route((u) => u.hostname === "fonts.gstatic.com", async (r) => {
    const res = await r.fetch();
    const body = await res.body();
    await new Promise((x) => setTimeout(x, HOLD_MS));
    await r.fulfill({ response: res, body });
  });
  return { ctx, page: await ctx.newPage() };
}

for (const lane of LANES) for (const route of ROUTES) {
  // A. geometry: blocked vs loaded
  const geo = {};
  for (const mode of ["blocked", "loaded"]) {
    const { ctx, page } = await newPage(lane, mode);
    await page.goto(base + route, { waitUntil: "load", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => setTimeout(r, 600)); });
    geo[mode] = await page.evaluate(readGeometry);
    if (mode === "loaded") geo.overlay = await page.evaluate(readOverlay, [
      { web: "Space Grotesk", fallback: `"Space Grotesk Fallback", Arial`, weight: 400 },
      { web: "Newsreader", fallback: `"Newsreader Fallback", Georgia`, weight: 400 },
      { web: "IBM Plex Mono", fallback: `"IBM Plex Mono Fallback", "Courier New"`, weight: 400 },
    ]);
    await ctx.close();
  }
  const n = Math.min(geo.blocked.rows.length, geo.loaded.rows.length);
  const deltas = [];
  for (let i = 0; i < n; i++) {
    const a = geo.blocked.rows[i], b = geo.loaded.rows[i];
    if (a.text !== b.text) continue; // different element sets (should not happen) — skip the pair
    deltas.push({ dTop: Math.abs(a.top - b.top), dH: Math.abs(a.height - b.height), family: b.family });
  }
  const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
  const geometry = {
    elements: deltas.length,
    meanDTop: Math.round(mean(deltas.map((d) => d.dTop)) * 100) / 100,
    maxDTop: Math.round(Math.max(0, ...deltas.map((d) => d.dTop)) * 10) / 10,
    movedOver1px: deltas.filter((d) => d.dTop > 1).length,
    meanDHeight: Math.round(mean(deltas.map((d) => d.dH)) * 100) / 100,
    docHeightBlocked: geo.blocked.docHeight, docHeightLoaded: geo.loaded.docHeight,
    dDocHeight: geo.loaded.docHeight - geo.blocked.docHeight,
  };
  // B. CLS: held vs blocked control
  const cls = {};
  for (const mode of ["blocked", "held"]) {
    const { ctx, page } = await newPage(lane, mode);
    await page.goto(base + route, { waitUntil: "load", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(HOLD_MS + 800);
    await page.evaluate(async () => { await document.fonts.ready; });
    cls[mode] = await page.evaluate(() => ({ cls: Math.round(window.__cls * 10000) / 10000, entries: window.__clsEntries, fontsLoaded: Array.from(document.fonts).filter((f) => f.status === "loaded").length }));
    await ctx.close();
  }
  const swapCls = Math.round((cls.held.cls - cls.blocked.cls) * 10000) / 10000;
  results.push({ vw: lane.vw, route, geometry, cls: { control: cls.blocked.cls, held: cls.held.cls, swap: swapCls, heldEntries: cls.held.entries.slice(0, 12), fontsLoadedHeld: cls.held.fontsLoaded }, overlay: geo.overlay });
  console.log(`${String(lane.vw).padStart(4)} ${route.padEnd(28)} Δtop mean ${String(geometry.meanDTop).padStart(7)} max ${String(geometry.maxDTop).padStart(7)} moved>1px ${String(geometry.movedOver1px).padStart(4)}/${geometry.elements}  Δdoc ${String(geometry.dDocHeight).padStart(6)}px  CLS control ${cls.blocked.cls} held ${cls.held.cls} swap ${swapCls}`);
}
await browser.close();

const lines = [`# Font swap shift — ${tag}`, "", `Base: ${base} · fonts held ${HOLD_MS}ms for the CLS run · reduced motion on`, ""];
lines.push("| vw | route | elements | mean Δtop | max Δtop | moved >1px | Δ doc height | CLS control (blocked) | CLS held (swap happens) | swap CLS |", "|---|---|---|---|---|---|---|---|---|---|");
for (const r of results) lines.push(`| ${r.vw} | ${r.route} | ${r.geometry.elements} | ${r.geometry.meanDTop}px | ${r.geometry.maxDTop}px | ${r.geometry.movedOver1px} | ${r.geometry.dDocHeight}px | ${r.cls.control} | ${r.cls.held} | **${r.cls.swap}** |`);
const agg = (k) => Math.round((results.reduce((s, r) => s + k(r), 0) / results.length) * 10000) / 10000;
lines.push(`| — | **mean** | | ${agg((r) => r.geometry.meanDTop)}px | | | ${agg((r) => r.geometry.dDocHeight)}px | ${agg((r) => r.cls.control)} | ${agg((r) => r.cls.held)} | **${agg((r) => r.cls.swap)}** |`);
lines.push("", "## Overlay — one paragraph, 300px column, 20px/1.5, webfont vs fallback face", "", "| vw | route | family | fallback stack | webfont lines / height / 1-line width | fallback lines / height / 1-line width | width ratio | height ratio |", "|---|---|---|---|---|---|---|---|");
for (const r of results) for (const o of r.overlay) lines.push(`| ${r.vw} | ${r.route} | ${o.web} | ${o.fallback} | ${o.webfont.lines} / ${o.webfont.height} / ${o.webfont.width} | ${o.fallbackFace.lines} / ${o.fallbackFace.height} / ${o.fallbackFace.width} | ${o.widthRatio} | ${o.heightRatio} |`);
writeFileSync(md, lines.join("\n") + "\n");
writeFileSync(out, JSON.stringify({ base, tag, holdMs: HOLD_MS, results }, null, 1));
console.log(`\nwritten ${md}`);
