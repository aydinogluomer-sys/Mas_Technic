// Phase 10-4 — golden adjudication at the DOM.
//
// A visual golden that moved is only accepted if the DOM explains the pixels. For every
// `*-diff.png` Playwright wrote, the probe:
//   1. decodes the diff (differing pixels are painted red), collects the rows they occupy and
//      merges them into bands (in the captured element's CSS pixel space — the golden is of a
//      locator, so image rows map onto the element's box; `landing-fullpage` maps onto the page);
//   2. opens the same route at the same viewport, finds the captured element, and lists every
//      text-owning descendant whose box intersects each band, together with the properties this
//      packet changes and the renderer's answer for them:
//        newsreader   the first family is Newsreader — its upright face is new (headings were
//                     painted with the italic face before);
//        balance      a heading that now computes `text-wrap: balance` and sets ≥ 2 lines;
//        pretty       prose that now computes `text-wrap: pretty` and sets ≥ 2 lines;
//        tabular      Space Grotesk text with digits that now computes `tabular-nums`;
//        symbol       text (or ::before/::after content) containing → ← ↑ ↓ ↻ ≤ ≥ ≈ — now
//                     painted in-family (CDP), a different advance, so a paragraph can re-wrap;
//        measure-cap  a `.shell-note` that sets ≥ 2 lines — it gained `max-width: 72ch`;
//   3. rules: a band is EXPLAINED when it intersects an element carrying one of those, OR when
//      it lies below the first such element that sets ≥ 2 lines inside the same capture (a
//      re-wrapped multi-line block moves everything under it). Otherwise UNEXPLAINED.
//
// Usage:
//   PROBE_RESULTS=<playwright output dir> PROBE_BASE=http://localhost:4197 node reports/10/probes/golden-adjudicate-10-4.mjs
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..", "..");
const base = process.env.PROBE_BASE ?? "http://localhost:4197";
const RESULTS = process.env.PROBE_RESULTS;
if (!RESULTS) throw new Error("PROBE_RESULTS (playwright output dir) is required");
const out = process.env.PROBE_OUT ?? join(root, "reports", "10", "probes", "golden-adjudicate-10-4.json");
const md = process.env.PROBE_MD ?? join(root, "reports", "10", "probes", "golden-adjudicate-10-4.md");

const PROJECTS = {
  "visual-375": { viewport: { width: 375, height: 812 }, mobile: true },
  "visual-768": { viewport: { width: 768, height: 1024 }, mobile: true },
  "visual-1280": { viewport: { width: 1280, height: 900 }, mobile: false },
  "visual-1440": { viewport: { width: 1440, height: 900 }, mobile: false },
};
const INNER = { about: "/hakkimizda", contact: "/iletisim", materials: "/malzemeler", "material-family": "/malzemeler/aluminyum", "service-category": "/hizmetler/kategori/talasli-imalat", "service-detail": "/hizmetler/cnc-frezeleme", "sector-detail": "/endustriyel/havacilik-uzay" };
const SHELL = { home: "/", service: "/hizmetler/cnc-frezeleme", about: "/hakkimizda", journal: "/blog", rfq: "/teklif-al", notfound: "/__phase04-not-a-route__" };
const WAVEB = { "notfound-body": ["/__phase04-not-a-route__", ".shell-notfound"], "journal-lead": ["/blog", ".tl-band.shell-surface-band"], "quality-documents": ["/kalite-dosyasi", ".tl-band.shell-surface-band"], "profile-scope": ["/kabiliyet-profilleri", ".tl-band.shell-surface-band"] };
function locate(golden) {
  let m;
  if ((m = golden.match(/^inner-hero-(.+)$/))) return { route: INNER[m[1]], selector: ".shell-hero" };
  if ((m = golden.match(/^inner-next-(.+)$/))) return { route: INNER[m[1]], selector: ".shell-next" };
  if ((m = golden.match(/^shell-header-(.+)$/))) return { route: SHELL[m[1]], selector: "[data-fullscreen-header]" };
  if ((m = golden.match(/^shell-footer-(.+)$/))) return { route: SHELL[m[1]], selector: "footer.tl-footer" };
  if ((m = golden.match(/^waveb-(.+)$/))) return { route: WAVEB[m[1]][0], selector: WAVEB[m[1]][1] };
  if (golden === "landing-fullpage") return { route: "/", selector: "html", fullPage: true };
  if (golden === "navigation-closed") return { route: "/", selector: "[data-fullscreen-header]" };
  if (golden === "navigation-open") return { route: "/", selector: "[data-fullscreen-menu]", openMenu: true };
  return null;
}

// Find diffs: <results>/<test-dir>/<golden>-diff.png; the project name is the dir suffix.
const diffs = [];
for (const dir of readdirSync(RESULTS)) {
  const full = join(RESULTS, dir);
  let files = [];
  try { files = readdirSync(full); } catch { continue; }
  for (const f of files) if (f.endsWith("-diff.png")) {
    const golden = f.replace(/-diff\.png$/, "");
    const project = Object.keys(PROJECTS).find((p) => dir.endsWith(p));
    if (project) diffs.push({ dir, project, golden, file: join(full, f) });
  }
}
console.log(`${diffs.length} moved goldens`);

const bandsOf = async (page, b64) => page.evaluate(async (b64) => {
  const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
  const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const rowHits = new Int32Array(c.height); let total = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (data[i] > 200 && data[i + 1] < 90 && data[i + 2] < 90) { rowHits[y]++; total++; } }
  const bands = []; let start = -1;
  for (let y = 0; y <= c.height; y++) { const hit = y < c.height && rowHits[y] > 0; if (hit && start < 0) start = y; if (!hit && start >= 0) { bands.push([start, y - 1]); start = -1; } }
  const merged = [];
  for (const b of bands) { const last = merged[merged.length - 1]; if (last && b[0] - last[1] < 8) last[1] = b[1]; else merged.push([...b]); }
  return { image: [c.width, c.height], total, bands: merged.map(([y0, y1]) => { let n = 0; for (let y = y0; y <= y1; y++) n += rowHits[y]; return [y0, y1, n]; }) };
}, b64);

const readTexts = (selector) => {
  const SYMBOLS = /[→←↑↓↻≤≥≈]/;
  const rootEl = document.querySelector(selector);
  const rb = rootEl.getBoundingClientRect();
  const originY = selector === "html" ? 0 : rb.top + window.scrollY;
  const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const rows = [];
  const lineCount = (el) => { const r = document.createRange(); r.selectNodeContents(el); return new Set(Array.from(r.getClientRects()).map((x) => Math.round(x.top))).size; };
  let id = 0;
  for (const el of rootEl.querySelectorAll("*")) {
    if (["SCRIPT", "STYLE", "SVG", "PATH"].includes(el.tagName)) continue;
    let own = norm(Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(""));
    // Generated content counts as text the packet changed when it is a symbol glyph
    // (`.tl-process li::after { content: "→" }` is painted by the symbol subset now).
    const pseudo = ["::before", "::after"].map((ps) => getComputedStyle(el, ps).content).filter((c) => c && c !== "none" && c !== "normal").map((c) => c.replace(/^"|"$/g, "")).join("");
    if (!own && SYMBOLS.test(pseudo)) own = `[generated] ${pseudo}`;
    if (!own) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const family = s.fontFamily.split(",")[0].replace(/["']/g, "");
    const lines = lineCount(el);
    const flags = [];
    if (family === "Newsreader") flags.push("newsreader");
    if (s.textWrap === "balance" && lines >= 2) flags.push("balance");
    if (s.textWrap === "pretty" && lines >= 2) flags.push("pretty");
    if (family === "Space Grotesk" && /\d/.test(own) && /tabular-nums/.test(s.fontVariantNumeric)) flags.push("tabular");
    if (el.classList.contains("shell-note") && lines >= 2) flags.push("measure-cap"); // `.shell-note` gained `max-width: 72ch`
    if (SYMBOLS.test(own)) { flags.push(own.startsWith("[generated]") ? "symbol(::after)" : "symbol"); el.setAttribute("data-adj", String(id)); }
    rows.push({ id: id++, key: `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ").filter((c) => /^(shell-|tl-)/.test(c)).join(".") : ""}`, top: Math.round(b.top + window.scrollY - originY), bottom: Math.round(b.bottom + window.scrollY - originY), family, lines, flags, text: own.slice(0, 40) });
  }
  // Untouched pictures inside the capture: a few differing pixels inside one is raster jitter
  // (the 10-2b adjudication measured the same class), not a typography change.
  const pictures = Array.from(rootEl.querySelectorAll("img")).map((img) => { const b = img.getBoundingClientRect(); return { key: `img ${(img.currentSrc || img.src).split("/").pop().split("?")[0]}`, top: Math.round(b.top + window.scrollY - originY), bottom: Math.round(b.bottom + window.scrollY - originY) }; }).filter((x) => x.bottom > x.top);
  return { width: rb.width, height: selector === "html" ? document.documentElement.scrollHeight : rb.height, rows, pictures };
};

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];
for (const d of diffs) {
  const where = locate(d.golden);
  if (!where) { results.push({ ...d, verdict: "NO-MAPPING" }); continue; }
  const proj = PROJECTS[d.project];
  const ctx = await browser.newContext({ viewport: proj.viewport, deviceScaleFactor: 1, reducedMotion: "reduce", ...(proj.mobile ? { isMobile: true, hasTouch: true } : {}) });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const bands = await bandsOf(page, readFileSync(d.file).toString("base64"));
  await page.goto(base + where.route, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; for (let y = 0; y <= document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  if (where.openMenu) { await page.locator("[data-menu-trigger]").click(); await page.locator("[data-fullscreen-menu] [data-nav-category]").first().click().catch(() => {}); await page.waitForTimeout(900); }
  const dom = await page.evaluate(readTexts, where.selector);
  const dpr = bands.image[0] / dom.width;
  // CDP painter check for symbol-bearing elements.
  const { root: docRoot } = await cdp.send("DOM.getDocument", { depth: 0 });
  for (const r of dom.rows.filter((x) => x.flags.includes("symbol"))) {
    try { const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: docRoot.nodeId, selector: `[data-adj="${r.id}"]` }); const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId }); r.painter = fonts.map((f) => `${f.familyName}${f.isCustomFont ? "" : " (sys)"}`).join(" + "); } catch { r.painter = "?"; }
  }
  const changed = dom.rows.filter((r) => r.flags.length);
  const reflowCandidates = changed.filter((r) => r.lines >= 2 && (r.flags.includes("balance") || r.flags.includes("pretty") || r.flags.includes("newsreader") || r.flags.includes("symbol") || r.flags.includes("measure-cap"))).sort((a, b) => a.top - b.top);
  const firstReflow = reflowCandidates[0];
  const judged = bands.bands.map(([y0, y1, px]) => {
    const top = y0 / dpr, bottom = y1 / dpr;
    const hits = changed.filter((r) => r.bottom >= top - 3 && r.top <= bottom + 3);
    // The nearest re-wrappable changed block ABOVE the band is the one that moved it.
    const above = reflowCandidates.filter((r) => r.top <= top + 3).sort((a, b) => b.top - a.top)[0];
    const picture = !hits.length && px <= 200 ? dom.pictures.find((pic) => top >= pic.top - 2 && bottom <= pic.bottom + 2) : null;
    return { cssRows: [Math.round(top), Math.round(bottom)], pixels: px, hits: hits.slice(0, 6).map((h) => `${h.key} [${h.flags.join(",")}${h.painter ? " " + h.painter : ""}] “${h.text}”`), downstreamOf: picture ? `raster jitter inside untouched ${picture.key} (${px} px)` : !hits.length && above ? `${above.key} [${above.flags.join(",")}] @${above.top}–${above.bottom} “${above.text.slice(0, 24)}”` : null, explained: hits.length > 0 || !!above || !!picture };
  });
  const unexplained = judged.filter((j) => !j.explained).reduce((n, j) => n + j.pixels, 0);
  const verdict = unexplained <= 120 ? "EXPLAINED" : "UNEXPLAINED";
  results.push({ golden: d.golden, project: d.project, route: where.route, selector: where.selector, differingPixels: bands.total, imageSize: bands.image, dpr, captureHeight: Math.round(dom.height), changedElements: changed.length, firstReflow: firstReflow ? `${firstReflow.key} [${firstReflow.flags.join(",")}] @${firstReflow.top}` : null, bands: judged, unexplainedPixels: unexplained, verdict });
  console.log(`${d.project.padEnd(12)} ${d.golden.padEnd(28)} px ${String(bands.total).padStart(7)} bands ${String(judged.length).padStart(3)} unexplained-px ${String(unexplained).padStart(6)} → ${verdict}${firstReflow ? "   first reflow: " + firstReflow.key + " [" + firstReflow.flags + "]" : ""}`);
  await ctx.close();
}
await browser.close();

const lines = [`# Golden adjudication — 10-4`, "", `${diffs.length} moved goldens · base ${base}`, "", "| project | golden | route | differing px | bands | first re-wrapped block | unexplained px | verdict |", "|---|---|---|---|---|---|---|---|"];
for (const r of results) lines.push(`| ${r.project} | ${r.golden} | ${r.route} | ${r.differingPixels} | ${r.bands?.length ?? "—"} | ${r.firstReflow ?? "—"} | ${r.unexplainedPixels ?? "—"} | **${r.verdict}** |`);
lines.push("", "## Bands", "");
for (const r of results) {
  if (!r.bands) continue;
  lines.push(`### ${r.project} · ${r.golden}`, "", "| rows (css px) | px | intersecting changed elements | downstream of | explained |", "|---|---|---|---|---|");
  for (const b of r.bands) lines.push(`| ${b.cssRows[0]}–${b.cssRows[1]} | ${b.pixels} | ${b.hits.join("<br>").replace(/\|/g, "\\|") || "—"} | ${b.downstreamOf ?? "—"} | ${b.explained ? "yes" : "**NO**"} |`);
  lines.push("");
}
writeFileSync(md, lines.join("\n") + "\n");
writeFileSync(out, JSON.stringify(results, null, 1));
console.log(`written ${md}`);
