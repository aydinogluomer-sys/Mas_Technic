// Phase 10-3 — rendered-DOM alt-text probe.
//
// For every public route (the same 99-path set `e2e/shared-shell-accessibility.spec.ts`
// derives: static full-shell routes + category/service/material/blog/profile routes from
// the data modules + the four non-shell auth routes) at 1280×800, plus 375×812 for the two
// routes whose image set is viewport-conditional (`/` manifesto <picture>, `/malzemeler`
// mobile still), lists every `<img>` and every `role="img"` element with:
//   • alt (verbatim), whether the attribute is present, aria-hidden ancestry,
//   • the nearest heading: the closest ancestor that contains an h1–h6, and inside it the
//     heading nearest in document order to the image (previous preferred over next),
//   • the enclosing <figure>'s <figcaption> text when there is one,
//   • the rendered box, currentSrc basename and width/height attributes.
// Then judges each row against the packet standard:
//   • alt must never equal the nearest heading, the route's <h1>, or the figcaption
//     (normalised, `tr` case-folded) — the <h1> test is what catches `alt={page.title}` on a
//     plate whose nearest heading is the band's own <h2>,
//   • alt must never be a generic placeholder ("image", "görsel", "resim", "photo", "fotoğraf"),
//   • `<img>` must always carry an alt attribute.
// Output: JSON rows + a Markdown table (paths from PROBE_OUT / PROBE_MD), exit 1 on any failure.
//
// Usage (against `vite preview --port 4194` of the production build):
//   PROBE_BASE=http://localhost:4194 node reports/10/probes/alt-probe.mjs
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import * as esbuild from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/esbuild/lib/main.js";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..", "..", "..");
const base = process.env.PROBE_BASE ?? "http://localhost:4194";
const out = process.env.PROBE_OUT ?? join(root, "reports", "10", "probes", "alt-probe.json");
const md = process.env.PROBE_MD ?? join(root, "reports", "10", "probes", "alt-probe.md");

/* ── Route derivation — the spec's recipe, run through esbuild so the TS data modules
      (with `@/` aliases and .webp imports) load in plain Node. ───────────────────────── */
const tmp = mkdtempSync(join(tmpdir(), "alt-probe-"));
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
const routes = [
  ...STATIC_FULL_SHELL_ROUTES,
  ...data.categoryPages.map((item) => `/${item.prefix}/kategori/${item.slug}`),
  ...data.servicePages.map((item) => `/${item.category}/${item.slug}`),
  ...data.materialCategories.map((item) => `/malzemeler/${item.slug}`),
  ...data.blogPosts.map((post) => `/blog/${post.slug}`),
  ...data.caseStudies.map((study) => `/kabiliyet-profilleri/${study.slug}`),
  ...NON_SHELL_PUBLIC_ROUTES,
];
if (new Set(routes).size !== 99) throw new Error(`expected 99 public routes, derived ${new Set(routes).size}`);
const MOBILE_ALSO = new Set(["/", "/malzemeler"]);

/* ── The in-page reader. ─────────────────────────────────────────────────────────────── */
const readImages = () => {
  const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");
  const headingSel = "h1,h2,h3,h4,h5,h6";
  const nearestHeading = (el) => {
    let scope = el.parentElement;
    while (scope && !scope.querySelector(headingSel)) scope = scope.parentElement;
    if (!scope) return null;
    const heads = Array.from(scope.querySelectorAll(headingSel));
    let prev = null, next = null;
    for (const h of heads) {
      const pos = el.compareDocumentPosition(h);
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) prev = h; // last preceding wins
      else if (!next && pos & Node.DOCUMENT_POSITION_FOLLOWING) next = h;
    }
    const h = prev ?? next;
    return h ? { tag: h.tagName.toLowerCase(), text: h.textContent.replace(/\s+/g, " ").trim(), id: h.id || null } : null;
  };
  const hiddenAncestor = (el) => !!el.closest('[aria-hidden="true"]');
  const rows = [];
  for (const img of document.querySelectorAll("img")) {
    const r = img.getBoundingClientRect();
    const fig = img.closest("figure");
    const cap = fig?.querySelector("figcaption")?.textContent.replace(/\s+/g, " ").trim() ?? null;
    const heading = nearestHeading(img);
    const alt = img.getAttribute("alt");
    rows.push({
      kind: "img",
      src: (img.currentSrc || img.getAttribute("src") || "").split("/").pop().split("?")[0],
      hasAlt: img.hasAttribute("alt"), alt,
      role: img.getAttribute("role"),
      ariaHiddenAncestor: hiddenAncestor(img),
      attrW: img.getAttribute("width"), attrH: img.getAttribute("height"),
      natW: img.naturalWidth, natH: img.naturalHeight,
      cw: Math.round(r.width), ch: Math.round(r.height),
      top: Math.round(r.top + window.scrollY),
      heading, figcaption: cap,
      altEqualsHeading: !!(heading && alt && norm(alt) === norm(heading.text)),
      altEqualsCaption: !!(cap && alt && norm(alt) === norm(cap)),
      altInsideHeading: !!(heading && alt && alt.length > 0 && norm(heading.text).includes(norm(alt))),
      altGeneric: !!alt && /^(image|görsel|resim|photo|fotoğraf|picture|img)\b/i.test(alt.trim()),
    });
  }
  for (const el of document.querySelectorAll('[role="img"]')) {
    if (el.tagName === "IMG") continue;
    const r = el.getBoundingClientRect();
    rows.push({
      kind: `${el.tagName.toLowerCase()}[role=img]`,
      src: null, hasAlt: null, alt: el.getAttribute("aria-label"),
      role: "img", ariaHiddenAncestor: hiddenAncestor(el),
      cw: Math.round(r.width), ch: Math.round(r.height), top: Math.round(r.top + window.scrollY),
      heading: nearestHeading(el), figcaption: null,
      altEqualsHeading: false, altEqualsCaption: false, altInsideHeading: false, altGeneric: false,
    });
  }
  return { title: document.title, h1: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim() ?? null, rows };
};

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const rows = [];
const pages = [];
const lanes = [
  { vw: 1280, vh: 800, mobile: false, routes },
  { vw: 375, vh: 812, mobile: true, routes: routes.filter((r) => MOBILE_ALSO.has(r)) },
];
for (const lane of lanes) {
  const ctx = await browser.newContext({
    viewport: { width: lane.vw, height: lane.vh }, deviceScaleFactor: 1, reducedMotion: "reduce",
    ...(lane.mobile ? { isMobile: true, hasTouch: true } : {}),
  });
  const page = await ctx.newPage();
  for (const route of lane.routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 700));
    });
    await page.waitForLoadState("networkidle");
    const result = await page.evaluate(readImages);
    const finalPath = new URL(page.url()).pathname;
    pages.push({ route, vw: lane.vw, finalPath, title: result.title, h1: result.h1, images: result.rows.length });
    for (const r of result.rows) rows.push({ route, vw: lane.vw, finalPath, h1: result.h1, ...r });
  }
  await ctx.close();
}
await browser.close();

/* ── Judgement. ──────────────────────────────────────────────────────────────────────── */
const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");
const failures = [];
for (const r of rows) {
  if (r.kind === "img" && !r.hasAlt) failures.push({ ...r, why: "missing alt attribute" });
  if (r.altEqualsHeading) failures.push({ ...r, why: "alt equals nearest heading" });
  if (r.alt && r.h1 && norm(r.alt) === norm(r.h1)) failures.push({ ...r, why: "alt equals the route <h1>" });
  if (r.altEqualsCaption) failures.push({ ...r, why: "alt equals figcaption" });
  if (r.altGeneric) failures.push({ ...r, why: "generic alt" });
}
writeFileSync(out, JSON.stringify({ base, routes: pages, rows, failures }, null, 1));

const esc = (s) => (s ?? "").toString().replace(/\|/g, "\\|");
/* The `.shell-gauge` spans (`role="img"` + "İşlenebilirlik: n/5") are 46 identical rows per
   materials route; they are kept in the JSON and collapsed to one line here. */
const isGauge = (r) => r.kind === "span[role=img]" && /^İşlenebilirlik: \d\/\d$/.test(r.alt ?? "");
const tableRows = rows.filter((r) => !isGauge(r));
const gaugeCounts = Object.entries(rows.filter(isGauge).reduce((acc, r) => {
  const key = `${r.route} @ ${r.vw}`; acc[key] = (acc[key] ?? 0) + 1; return acc;
}, {}));
const lines = [
  "# Phase 10-3 — rendered alt-text probe",
  "",
  `Base \`${base}\`; ${pages.length} page loads over ${new Set(pages.map((p) => p.route)).size} public routes ` +
  `(${lanes[0].routes.length} at 1280×800, ${lanes[1].routes.length} also at 375×812); ${rows.length} image rows; ` +
  `${failures.length} failures.`,
  "",
  "## Every image, its alt and its nearest heading",
  "",
  "| Route | vw | Element | File | alt | Nearest heading | Figcaption | Box | aria-hidden |",
  "|---|---|---|---|---|---|---|---|---|",
  ...tableRows.map((r) => `| \`${r.route}\` | ${r.vw} | ${r.kind} | ${esc(r.src)} | ${r.hasAlt === false ? "**MISSING**" : r.alt === "" ? "`\"\"`" : esc(r.alt)} | ${r.heading ? `${r.heading.tag}: ${esc(r.heading.text)}` : "—"} | ${esc(r.figcaption) || "—"} | ${r.cw}×${r.ch} | ${r.ariaHiddenAncestor ? "yes" : "no"} |`),
  "",
  "## Material gauges (`span.shell-gauge[role=img]`, aria-label `İşlenebilirlik: n/5`) — collapsed",
  "",
  ...gaugeCounts.map(([key, n]) => `- \`${key}\`: ${n} gauges, all labelled`),
  "",
  "## Routes with no image",
  "",
  ...pages.filter((p) => p.images === 0).map((p) => `- \`${p.route}\` (${p.vw}) — ${p.finalPath !== p.route ? `→ \`${p.finalPath}\`; ` : ""}h1: ${esc(p.h1) || "—"}`),
  "",
  "## Failures",
  "",
  ...(failures.length ? failures.map((f) => `- \`${f.route}\` ${f.src}: ${f.why} — alt "${esc(f.alt)}"`) : ["None."]),
  "",
];
writeFileSync(md, lines.join("\n"));
console.log(`${rows.length} rows over ${pages.length} loads -> ${out}, ${md}; failures: ${failures.length}`);
for (const f of failures) console.log(`FAIL ${f.route} ${f.src}: ${f.why} — "${f.alt}"`);
process.exit(failures.length ? 1 : 0);
