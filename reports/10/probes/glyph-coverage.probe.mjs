// Phase 10-4 — glyph coverage per family and weight, read from the renderer.
//
// For every face the site uses (Space Grotesk 400/500/600/700, Newsreader 400 upright + italic,
// IBM Plex Mono 400/500/600/700) and every glyph in the set below, one `<span>` is rendered on a
// real route (so the page's own `@font-face` subsets are the ones in play), and CDP
// `CSS.getPlatformFontsForNode` reports which platform font actually painted it. A glyph whose
// painter is not the requested webfont is a FINDING — either the font lacks the glyph, or the
// Google `unicode-range` subsets never cover its code point so the face is never even consulted.
// The probe reports which of the two it is: `document.fonts` is scanned for any face of the
// family whose `unicodeRange` contains the code point.
//
// Glyph set: the Turkish letters at every weight, the engineering set the packet names, and the
// GD&T / arrow / comparison symbols found by grep in `src/data`, `src/content`, `src/components`
// and `src/pages` (public surfaces only; admin-only glyphs are listed but not judged).
//
// Usage: PROBE_BASE=http://localhost:4197 PROBE_TAG=before node reports/10/probes/glyph-coverage.probe.mjs
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..", "..");
const base = process.env.PROBE_BASE ?? "http://localhost:4197";
const tag = process.env.PROBE_TAG ?? "after";
const out = process.env.PROBE_OUT ?? join(root, "reports", "10", "probes", `glyph-coverage-${tag}.json`);
const md = process.env.PROBE_MD ?? join(root, "reports", "10", "probes", `glyph-coverage-${tag}.md`);
const ROUTE = process.env.PROBE_ROUTE ?? "/hizmetler/tolerans-hassasiyet"; // the route with the GD&T table

const FACES = [
  ...[400, 500, 600, 700].map((w) => ({ family: "Space Grotesk", weight: w, style: "normal" })),
  { family: "Newsreader", weight: 400, style: "normal" },
  { family: "Newsreader", weight: 400, style: "italic" },
  ...[400, 500, 600, 700].map((w) => ({ family: "IBM Plex Mono", weight: w, style: "normal" })),
];
const GROUPS = {
  turkish: "İıŞşĞğÇçÖöÜü",
  engineering: "±Øµ°²³×∅⌀⊥∥⌒⌓⟂",
  "site symbols (public)": "→←↑↓↻≤≥≈◎○▱⌖★☆∪",
};
const PUBLIC_USE = new Set("İıŞşĞğÇçÖöÜü±Øµ°²³×⌀⊥→←↑↓↻≤≥≈◎○▱⌖★☆∪");

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");
await page.goto(base + ROUTE, { waitUntil: "networkidle" });

// Plant the spans, force every face to load for every glyph, then wait for the set to settle.
await page.evaluate(async ({ FACES, GROUPS }) => {
  const host = document.createElement("div");
  host.id = "glyph-probe";
  host.style.cssText = "position:absolute;left:0;top:0;z-index:99999;background:#fff;color:#000;padding:8px;font-size:28px;line-height:1";
  let i = 0;
  for (const f of FACES) for (const [group, chars] of Object.entries(GROUPS)) for (const ch of Array.from(chars)) {
    const s = document.createElement("span");
    s.setAttribute("data-g", String(i++));
    s.style.cssText = `font-family:"${f.family}";font-weight:${f.weight};font-style:${f.style};`;
    s.textContent = ch;
    host.appendChild(s);
  }
  document.body.appendChild(host);
  await document.fonts.ready;
  for (let k = 0; k < 40; k++) {
    const loading = Array.from(document.fonts).filter((x) => x.status === "loading");
    if (!loading.length) break;
    await Promise.allSettled(loading.map((x) => x.loaded));
    await document.fonts.ready;
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}, { FACES, GROUPS });

// Which faces (by unicode-range) cover each code point — read from document.fonts.
const coverage = await page.evaluate(({ FACES, GROUPS }) => {
  const parseRanges = (ur) => ur.split(",").map((s) => s.trim().replace(/^U\+/i, "")).map((s) => {
    if (s.includes("?")) { const lo = parseInt(s.replace(/\?/g, "0"), 16), hi = parseInt(s.replace(/\?/g, "F"), 16); return [lo, hi]; }
    const [a, b] = s.split("-"); return [parseInt(a, 16), b ? parseInt(b, 16) : parseInt(a, 16)];
  });
  const faces = Array.from(document.fonts).map((f) => ({ family: f.family.replace(/["']/g, ""), weight: f.weight, style: f.style, status: f.status, ranges: parseRanges(f.unicodeRange) }));
  const outMap = {};
  for (const chars of Object.values(GROUPS)) for (const ch of Array.from(chars)) {
    const cp = ch.codePointAt(0);
    outMap[ch] = {};
    for (const fam of new Set(FACES.map((f) => f.family))) {
      const hits = faces.filter((f) => f.family === fam && f.ranges.some(([lo, hi]) => cp >= lo && cp <= hi));
      outMap[ch][fam] = hits.length ? Array.from(new Set(hits.map((h) => h.status))).join("/") : "no-range";
    }
  }
  return outMap;
}, { FACES, GROUPS });

const { root: docRoot } = await cdp.send("DOM.getDocument", { depth: 0 });
const rows = [];
let i = 0;
for (const f of FACES) for (const [group, chars] of Object.entries(GROUPS)) for (const ch of Array.from(chars)) {
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: docRoot.nodeId, selector: `[data-g="${i++}"]` });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  const painter = fonts.map((x) => `${x.familyName}${x.isCustomFont ? "" : " (system)"}`).join(" + ") || "—";
  const ok = fonts.length === 1 && fonts[0].isCustomFont && fonts[0].familyName.toLowerCase().replace(/\s+\d+pt$/, "").startsWith(f.family.toLowerCase().split(" ")[0]);
  rows.push({ group, ch, cp: "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"), family: f.family, weight: f.weight, style: f.style, painter, ok, range: coverage[ch][f.family], publicUse: PUBLIC_USE.has(ch) });
}
await browser.close();

const findings = rows.filter((r) => !r.ok && r.publicUse);
const lines = [`# Glyph coverage — ${tag}`, "", `Route ${ROUTE} @1280 · ${rows.length} glyph×face cells · findings on public-use glyphs: **${findings.length}**`, ""];
for (const group of Object.keys(GROUPS)) {
  lines.push(`## ${group}`, "", "| glyph | code point | public use | " + FACES.map((f) => `${f.family.split(" ")[0]} ${f.weight}${f.style === "italic" ? "i" : ""}`).join(" | ") + " |", "|---|---|---|" + FACES.map(() => "---").join("|") + "|");
  for (const ch of Array.from(GROUPS[group])) {
    const cells = FACES.map((f) => {
      const r = rows.find((x) => x.ch === ch && x.family === f.family && x.weight === f.weight && x.style === f.style);
      return r.ok ? "ok" : `**${r.painter}** (${r.range})`;
    });
    lines.push(`| ${ch} | ${"U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} | ${PUBLIC_USE.has(ch) ? "yes" : "no"} | ${cells.join(" | ")} |`);
  }
  lines.push("");
}
lines.push("`(no-range)` = no `@font-face` of that family declares a `unicode-range` containing the code point, so the browser never consults the webfont for it; `(loaded)` = a subset covering it is loaded and the font itself lacks the glyph.", "");
writeFileSync(md, lines.join("\n") + "\n");
writeFileSync(out, JSON.stringify({ base, tag, route: ROUTE, findings: findings.length, rows }, null, 1));
console.log(lines.slice(0, 3).join("\n"));
console.log(`written ${md}`);
for (const f of findings) console.log(`  ${f.ch} ${f.cp} ${f.family} ${f.weight}${f.style === "italic" ? "i" : ""} → ${f.painter} (${f.range})`);
