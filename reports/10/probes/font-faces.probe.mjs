// Phase 10-4 — rendered synthetic-face probe.
//
// For every public route (the same 99-path set `alt-probe.mjs` derives) at 1280×800:
//   1. `document.fonts` is enumerated PER FACE — family, weight, style, unicode-range, `status` —
//      after `fonts.ready` AND after every face that was `loading` has settled. `fonts.ready`
//      alone is not the proof: it resolves when the *set* is idle, and a face the page never
//      requested stays `unloaded` without failing anything.
//   2. Every element that owns a non-blank text node has its computed `font-family` (first
//      family), `font-weight`, `font-style`, `font-variant-numeric` and `text-wrap` read. When
//      the first family is one of the three webfonts, the CSS font-matching algorithm
//      (CSS Fonts 4 §5.2, the Blink variant) is run against the faces that the route actually
//      loaded, and the outcome is classified:
//        synthetic-bold     requested weight ≥ 600, every candidate face of the matched style
//                           tops out below 600 → Blink emboldens the outline.
//        synthetic-oblique  `font-style: italic` requested, no italic/oblique face → Blink skews.
//        italic-for-upright `font-style: normal` requested, only italic faces exist → the
//                           italic face is used for upright text (not a synthesis, a wrong face).
//        fallback-family    the page has NO face for that family at all → system fallback.
//   3. For each unique (family, weight, style) combination on the route, one representative
//      element is handed to CDP `CSS.getPlatformFontsForNode`, which reports the platform
//      family that actually painted its glyphs — the ground truth that the classification in
//      (2) is checked against.
//   4. Numeric surfaces: every `td`/`th`/`dd`/`dt`/`li`/`span`/`p`/`strong`/`b`/`output`/
//      `time` element whose own text contains a digit is listed with its `font-variant-numeric`
//      and its nearest data-system class, so the tabular-nums audit reads the DOM rather than
//      the stylesheet.
//
// Output: JSON (PROBE_OUT) + Markdown (PROBE_MD). Exit 1 when any synthetic/mismatched face is
// found on any route.
//
// Usage (against `vite preview --port 4197` of the production build):
//   PROBE_BASE=http://localhost:4197 node reports/10/probes/font-faces.probe.mjs
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import * as esbuild from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/esbuild/lib/main.js";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..", "..", "..");
const base = process.env.PROBE_BASE ?? "http://localhost:4197";
const out = process.env.PROBE_OUT ?? join(root, "reports", "10", "probes", "font-faces.json");
const md = process.env.PROBE_MD ?? join(root, "reports", "10", "probes", "font-faces.md");
const ROUTE_LIMIT = process.env.PROBE_ROUTES ? process.env.PROBE_ROUTES.split(",") : null;

/* ── Route derivation — identical to alt-probe.mjs. ─────────────────────────────────── */
const tmp = mkdtempSync(join(tmpdir(), "font-probe-"));
const entry = join(tmp, "entry.mjs");
writeFileSync(entry, `
  export { caseStudies } from "@/content/caseStudies";
  export { categoryPages } from "@/data/categoryPages";
  export { materialCategories } from "@/data/materialsData";
  export { servicePages } from "@/data/servicePages";
  export { blogPosts } from "@/data/blogData";
`);
const bundle = join(tmp, "routes.mjs");
await esbuild.build({
  entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: bundle,
  alias: { "@": join(root, "src") },
  loader: { ".webp": "file" }, assetNames: "[name]", outdir: undefined, logLevel: "silent",
});
const data = await import(pathToFileURL(bundle).href);
const STATIC_FULL_SHELL_ROUTES = ["/", "/sss", "/gizlilik-politikasi", "/kvkk", "/cerez-politikasi", "/hakkimizda",
  "/iletisim", "/malzemeler", "/blog", "/kabiliyet-profilleri", "/kalite-dosyasi", "/teklif-al"];
const NON_SHELL_PUBLIC_ROUTES = ["/giris", "/sifremi-unuttum", "/reset-password", "/cad-dashboard"];
const allRoutes = [
  ...STATIC_FULL_SHELL_ROUTES,
  ...data.categoryPages.map((item) => `/${item.prefix}/kategori/${item.slug}`),
  ...data.servicePages.map((item) => `/${item.category}/${item.slug}`),
  ...data.materialCategories.map((item) => `/malzemeler/${item.slug}`),
  ...data.blogPosts.map((post) => `/blog/${post.slug}`),
  ...data.caseStudies.map((study) => `/kabiliyet-profilleri/${study.slug}`),
  ...NON_SHELL_PUBLIC_ROUTES,
];
if (new Set(allRoutes).size !== 99) throw new Error(`expected 99 public routes, derived ${new Set(allRoutes).size}`);
const routes = ROUTE_LIMIT ?? allRoutes;

const WEBFONTS = ["Space Grotesk", "Newsreader", "IBM Plex Mono"];

/* ── In-page reader. ────────────────────────────────────────────────────────────────── */
const readPage = async (WEBFONTS) => {
  // Wait for the set, then for every face that is mid-flight.
  await document.fonts.ready;
  for (let i = 0; i < 50; i++) {
    const loading = Array.from(document.fonts).filter((f) => f.status === "loading");
    if (!loading.length) break;
    await Promise.allSettled(loading.map((f) => f.loaded));
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const fam = (s) => s.split(",")[0].trim().replace(/^["']|["']$/g, "");
  const faces = Array.from(document.fonts).map((f) => ({
    family: f.family.replace(/^["']|["']$/g, ""), weight: f.weight, style: f.style,
    unicodeRange: f.unicodeRange, status: f.status,
  }));

  // Capabilities per (family, style): list of [min,max] weight ranges of LOADED faces.
  const parseWeight = (w) => {
    const m = String(w).trim().split(/\s+/).map((v) => (v === "normal" ? 400 : v === "bold" ? 700 : Number(v)));
    return m.length === 2 ? [m[0], m[1]] : [m[0], m[0]];
  };
  const caps = {};
  for (const f of faces) {
    if (f.status !== "loaded") continue;
    const style = /italic|oblique/.test(f.style) ? "italic" : "normal";
    (caps[f.family] ??= { normal: [], italic: [] })[style].push(parseWeight(f.weight));
  }
  const anyFace = (family) => faces.some((f) => f.family === family);

  // Blink weight matching over ranges: returns the matched range or null.
  const matchWeight = (ranges, w) => {
    if (!ranges.length) return null;
    const hit = ranges.find(([a, b]) => w >= a && w <= b);
    if (hit) return hit;
    const below = ranges.filter(([, b]) => b < w).sort((x, y) => y[1] - x[1]);
    const above = ranges.filter(([a]) => a > w).sort((x, y) => x[0] - y[0]);
    if (w >= 400 && w <= 500) {
      const upTo500 = above.filter(([a]) => a <= 500);
      return upTo500[0] ?? below[0] ?? above[0];
    }
    if (w < 400) return below[0] ?? above[0];
    return above[0] ?? below[0];
  };
  const classify = (family, weight, style) => {
    if (!anyFace(family)) return { verdict: "fallback-family", face: null };
    const c = caps[family] ?? { normal: [], italic: [] };
    let usedStyle = style;
    let verdict = "ok";
    if (style === "italic" && !c.italic.length) { usedStyle = "normal"; verdict = "synthetic-oblique"; }
    if (style === "normal" && !c.normal.length) { usedStyle = "italic"; verdict = "italic-for-upright"; }
    const ranges = c[usedStyle];
    const face = matchWeight(ranges, weight);
    if (!face) return { verdict: "no-loaded-face", face: null };
    if (weight >= 600 && face[1] < 600) verdict = verdict === "ok" ? "synthetic-bold" : `${verdict}+synthetic-bold`;
    return { verdict, face: face[0] === face[1] ? String(face[0]) : `${face[0]}..${face[1]}` };
  };

  const keyOf = (el) => {
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-)/.test(c)).sort();
    const own = classes.length ? `.${classes.join(".")}` : "";
    let p = el.parentElement, ctx = "";
    while (p && !ctx) {
      const pc = Array.from(p.classList).filter((c) => /^(shell-|tl-)/.test(c)).sort();
      if (pc.length) ctx = `.${pc[0]}`;
      p = p.parentElement;
    }
    return `${el.tagName.toLowerCase()}${own}${ctx ? ` < ${ctx}` : ""}`;
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const combos = new Map(); // family|weight|style -> {count, sample, verdict, face, keys:Set, selectorForCdp}
  const numeric = [];
  const all = Array.from(document.body.querySelectorAll("*"));
  let idx = 0;
  for (const el of all) {
    if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH"].includes(el.tagName)) continue;
    const ownText = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join("");
    if (!norm(ownText)) continue;
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const family = fam(s.fontFamily);
    const weight = Number(s.fontWeight);
    const style = /italic|oblique/.test(s.fontStyle) ? "italic" : "normal";
    const key = keyOf(el);
    if (WEBFONTS.includes(family)) {
      const ck = `${family}|${weight}|${style}`;
      let c = combos.get(ck);
      if (!c) {
        const { verdict, face } = classify(family, weight, style);
        el.setAttribute("data-font-probe", String(++idx));
        c = { family, weight, style, verdict, face, count: 0, keys: new Set(), sample: norm(ownText).slice(0, 60), probeId: String(idx) };
        combos.set(ck, c);
      }
      c.count++;
      c.keys.add(key);
    }
    if (/\d/.test(ownText) && ["TD", "TH", "DD", "DT", "LI", "SPAN", "P", "STRONG", "B", "OUTPUT", "TIME", "SMALL", "EM", "DIV", "A"].includes(el.tagName)) {
      const table = el.closest("table");
      numeric.push({
        key, tag: el.tagName.toLowerCase(), inTable: !!table, tableKey: table ? keyOf(table) : null,
        family, weight, fvn: s.fontVariantNumeric, sample: norm(ownText).slice(0, 40),
      });
    }
  }
  // Numeric rows are aggregated per (selector, family, weight, fvn): the count and one sample
  // carry the same evidence as one row per element at a fraction of the file size.
  const numAgg = new Map();
  for (const n of numeric) {
    const k = `${n.key}|${n.tag}|${n.inTable}|${n.family}|${n.weight}|${n.fvn}`;
    const a = numAgg.get(k) ?? { ...n, count: 0 };
    a.count++;
    numAgg.set(k, a);
  }
  return {
    faces,
    combos: Array.from(combos.values()).map((c) => ({ ...c, keys: Array.from(c.keys).sort().slice(0, 12), keyCount: c.keys.size })),
    numeric: Array.from(numAgg.values()),
    rootSynthesis: getComputedStyle(document.documentElement).fontSynthesis ?? null,
  };
};

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");

const results = [];
for (const route of routes) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  // Reach the bottom so lazily mounted bands exist, then return.
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  const r = await page.evaluate(readPage, WEBFONTS);
  // CDP ground truth per combo.
  const { root: docRoot } = await cdp.send("DOM.getDocument", { depth: 0 });
  for (const c of r.combos) {
    try {
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: docRoot.nodeId, selector: `[data-font-probe="${c.probeId}"]` });
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      c.platform = fonts.map((f) => `${f.familyName}${f.isCustomFont ? "" : " (system)"}×${f.glyphCount}`).join(", ");
    } catch (e) { c.platform = `cdp-error: ${e.message.split("\n")[0]}`; }
    delete c.probeId;
  }
  results.push({ route, ...r });
  const bad = r.combos.filter((c) => c.verdict !== "ok");
  console.log(`${route.padEnd(52)} faces ${r.faces.filter((f) => f.status === "loaded").length}/${r.faces.length} loaded  combos ${r.combos.length}  BAD ${bad.length}${bad.length ? "  " + bad.map((b) => `${b.family} ${b.weight} ${b.style} → ${b.verdict}`).join("; ") : ""}`);
}
await browser.close();

/* ── Aggregate. ─────────────────────────────────────────────────────────────────────── */
const comboAgg = new Map();
for (const r of results) for (const c of r.combos) {
  const k = `${c.family}|${c.weight}|${c.style}`;
  const a = comboAgg.get(k) ?? { family: c.family, weight: c.weight, style: c.style, verdict: c.verdict, face: c.face, routes: 0, elements: 0, keys: new Set(), platform: new Set() };
  a.routes++; a.elements += c.count; c.keys.forEach((x) => a.keys.add(x)); a.platform.add(c.platform);
  comboAgg.set(k, a);
}
const faceAgg = new Map();
for (const r of results) for (const f of r.faces) {
  const k = `${f.family}|${f.weight}|${f.style}|${f.unicodeRange}`;
  const a = faceAgg.get(k) ?? { ...f, statuses: {} };
  a.statuses[f.status] = (a.statuses[f.status] ?? 0) + 1;
  faceAgg.set(k, a);
}
const badTotal = results.reduce((n, r) => n + r.combos.filter((c) => c.verdict !== "ok").length, 0);

const lines = [];
lines.push(`# Font-face probe — ${routes.length} routes @1280`, "", `Base: ${base}  ·  root font-synthesis: \`${results[0]?.rootSynthesis}\`  ·  mismatched combos (route-summed): **${badTotal}**`, "");
lines.push("## Faces declared by the page (document.fonts), status tally across routes", "", "| family | weight | style | unicode-range | statuses |", "|---|---|---|---|---|");
for (const f of Array.from(faceAgg.values()).sort((a, b) => a.family.localeCompare(b.family) || a.style.localeCompare(b.style) || String(a.weight).localeCompare(String(b.weight)))) {
  const ur = f.unicodeRange.length > 40 ? f.unicodeRange.slice(0, 38) + "…" : f.unicodeRange;
  lines.push(`| ${f.family} | ${f.weight} | ${f.style} | \`${ur}\` | ${Object.entries(f.statuses).map(([k, v]) => `${k}:${v}`).join(" ")} |`);
}
lines.push("", "## Requested (family, weight, style) combinations across the DOM", "", "| family | weight | style | verdict | matched face | routes | elements | platform font (CDP) | selectors (first 6) |", "|---|---|---|---|---|---|---|---|---|");
for (const a of Array.from(comboAgg.values()).sort((x, y) => x.family.localeCompare(y.family) || x.style.localeCompare(y.style) || x.weight - y.weight)) {
  lines.push(`| ${a.family} | ${a.weight} | ${a.style} | ${a.verdict === "ok" ? "ok" : `**${a.verdict}**`} | ${a.face ?? "—"} | ${a.routes} | ${a.elements} | ${Array.from(a.platform).join(" / ")} | ${Array.from(a.keys).slice(0, 6).map((k) => `\`${k}\``).join(", ")} |`);
}
lines.push("", "## Numeric surfaces without tabular-nums (td/th/dd/counters), by selector", "", "| selector | in table | family | weight | font-variant-numeric | routes | sample |", "|---|---|---|---|---|---|---|");
const numAgg = new Map();
for (const r of results) for (const n of r.numeric) {
  const k = `${n.key}|${n.inTable}|${n.fvn}`;
  const a = numAgg.get(k) ?? { ...n, routes: new Set() };
  a.routes.add(r.route);
  numAgg.set(k, a);
}
for (const a of Array.from(numAgg.values()).filter((n) => !/tabular-nums/.test(n.fvn) && (n.inTable || /^(td|th|dd|dt|output|time)/.test(n.tag))).sort((x, y) => x.key.localeCompare(y.key))) {
  lines.push(`| \`${a.key}\` | ${a.inTable ? "yes" : "no"} | ${a.family} | ${a.weight} | ${a.fvn} | ${a.routes.size} | ${a.sample.replace(/\|/g, "\\|")} |`);
}
writeFileSync(md, lines.join("\n") + "\n");
// Faces are written once as a table; each route keeps only its per-face status vector.
const faceTable = [];
const faceIndex = new Map();
const slim = results.map((r) => ({
  ...r,
  faces: undefined,
  faceStatus: r.faces.map((f) => {
    const k = `${f.family}|${f.weight}|${f.style}|${f.unicodeRange}`;
    if (!faceIndex.has(k)) { faceIndex.set(k, faceTable.length); faceTable.push({ family: f.family, weight: f.weight, style: f.style, unicodeRange: f.unicodeRange }); }
    return [faceIndex.get(k), f.status];
  }),
}));
writeFileSync(out, JSON.stringify({ base, routes: routes.length, badTotal, faceTable, results: slim }, null, 1));
console.log(`\nwritten ${md}\nwritten ${out}\nmismatched combos: ${badTotal}`);
process.exit(badTotal ? 1 : 0);
