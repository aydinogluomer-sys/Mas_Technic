// Phase 10-4 — rendered heading line-break probe.
//
// For the five key routes the packet names (`/`, one service page, one sector page, `/blog`,
// one legal page) at 375 / 768 / 1280, every rendered `h1`–`h6` plus the display roles that are
// headings by role but not by tag (`.shell-statement`, `.shell-notfound-title`) is measured
// WORD BY WORD: a `Range` is laid over each whitespace-separated word, its client rect is read,
// rects are grouped into lines by their `top`, and the probe records line count, the number of
// words on the last line, and the longest line's width in `ch` of the element's own font size
// (the measure). A WIDOW is a heading of ≥ 2 lines whose last line carries a single word AND
// that line was produced by a SOFT wrap. A line that begins right after an authored `<br>` is a
// stanza the markup asked for (the hero `HAM GEOMETRİDEN<br>DOĞRULANMIŞ<br>HASSASİYETE`), not a
// widow — component markup is outside this packet and those breaks are the design. Such lines
// are reported as `authored` so the reader can see them, but they do not fail the probe. A
// two-word heading that needs two lines is a `split`, not a widow: there is no third word to
// pull down, so nothing `text-wrap` could do would change it.
// Also records the computed `text-wrap` so the fix is proven at the DOM, not at the stylesheet.
//
// PROSE MEASURE. Every visible `p` carrying >= 100 characters is measured too: its content-box
// width divided by the advance of "0" in its own font (a canvas `measureText`) is the widest
// line it could set, in `ch`. Anything above 75ch is reported as over-measure; the packet asks
// for a cap on long-form roles that lack one, and this is how "lack one" is decided — at the
// DOM, not by reading stylesheets for `max-width`.
//
// Output: JSON (PROBE_OUT) + Markdown (PROBE_MD). Exit 1 on any widow.
//
// Usage: PROBE_BASE=http://localhost:4197 node reports/10/probes/heading-widows.probe.mjs
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..", "..");
const base = process.env.PROBE_BASE ?? "http://localhost:4197";
const out = process.env.PROBE_OUT ?? join(root, "reports", "10", "probes", "heading-widows.json");
const md = process.env.PROBE_MD ?? join(root, "reports", "10", "probes", "heading-widows.md");

const ROUTES = process.env.PROBE_ROUTES?.split(",") ?? [
  "/",
  "/hizmetler/cnc-frezeleme",
  "/endustriyel/havacilik-uzay",
  "/blog",
  "/kvkk",
];
const WIDTHS = [
  { vw: 375, vh: 812, mobile: true },
  { vw: 768, vh: 1024, mobile: true },
  { vw: 1280, vh: 800, mobile: false },
];

const readHeadings = () => {
  const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const sel = "h1,h2,h3,h4,h5,h6,.shell-statement,.shell-notfound-title";
  const rows = [];
  for (const el of document.querySelectorAll(sel)) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    if (el.classList.contains("tl-visually-hidden") || el.classList.contains("sr-only")) continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    // Word ranges over the element's text nodes (including nested inline em/strong/a).
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const rects = [];
    let n, brPending = false;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 1) { if (n.tagName === "BR") brPending = true; continue; }
      const text = n.nodeValue;
      const re = /\S+/g;
      let m;
      while ((m = re.exec(text))) {
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        const cr = Array.from(r.getClientRects());
        if (!cr.length) continue;
        // A word can itself break across lines (hyphenation/overflow) — take the last rect's line.
        const last = cr[cr.length - 1];
        rects.push({ word: m[0], top: Math.round(last.top), left: last.left, right: last.right, afterBr: brPending });
        brPending = false;
      }
    }
    if (!rects.length) continue;
    const lines = [];
    for (const r of rects) {
      const line = lines.find((l) => Math.abs(l.top - r.top) < 3);
      if (line) { line.words.push(r.word); line.right = Math.max(line.right, r.right); line.left = Math.min(line.left, r.left); }
      else lines.push({ top: r.top, words: [r.word], left: r.left, right: r.right, authored: r.afterBr });
    }
    lines.sort((a, b) => a.top - b.top);
    const fontSize = parseFloat(s.fontSize);
    const longest = Math.max(...lines.map((l) => l.right - l.left));
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-)/.test(c)).join(".");
    const parent = el.parentElement?.className?.split?.(" ").find((c) => /^(shell-|tl-)/.test(c)) ?? "";
    rows.push({
      tag: el.tagName.toLowerCase(),
      key: `${el.tagName.toLowerCase()}${classes ? "." + classes : ""}${parent ? " < ." + parent : ""}`,
      text: norm(el.textContent).slice(0, 90),
      family: s.fontFamily.split(",")[0].replace(/["']/g, ""),
      fontSize: Math.round(fontSize * 10) / 10,
      textWrap: s.textWrap ?? s.textWrapMode ?? "n/a",
      maxWidth: s.maxWidth,
      lines: lines.length,
      lastLineWords: lines[lines.length - 1].words.length,
      lastLine: lines[lines.length - 1].words.join(" "),
      authored: !!lines[lines.length - 1].authored,
      words: rects.length,
      split: lines.length >= 2 && rects.length === 2,
      widow: lines.length >= 2 && lines[lines.length - 1].words.length === 1 && rects.length >= 3 && !lines[lines.length - 1].authored,
      measureCh: Math.round((longest / (fontSize * 0.5)) * 10) / 10, // ch ≈ .5em for these faces; indicative only
      widthPx: Math.round(box.width),
    });
  }
  // Prose measure census.
  const canvas = document.createElement("canvas").getContext("2d");
  const prose = [];
  for (const el of document.querySelectorAll("p, li, dd")) {
    const text = norm(el.textContent);
    if (text.length < 100) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0) continue;
    // Only elements that SET their own text: a `li` whose text lives in block children
    // (an index row's title + description) is a container, and its width is not a measure.
    if (Array.from(el.children).some((c) => !/^inline/.test(getComputedStyle(c).display))) continue;
    canvas.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const zero = canvas.measureText("0").width;
    const inner = el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-)/.test(c)).join(".");
    const parent = el.parentElement?.className?.split?.(" ").find((c) => /^(shell-|tl-)/.test(c)) ?? "";
    prose.push({
      key: `${el.tagName.toLowerCase()}${classes ? "." + classes : ""}${parent ? " < ." + parent : ""}`,
      chars: text.length, fontSize: parseFloat(s.fontSize), maxWidth: s.maxWidth, textWrap: s.textWrap ?? "n/a",
      measureCh: Math.round((inner / zero) * 10) / 10, over: inner / zero > 75,
      sample: text.slice(0, 50),
    });
  }
  return { rows, prose };
};

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];
for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w.vw, height: w.vh }, deviceScaleFactor: 1, reducedMotion: "reduce",
    ...(w.mobile ? { isMobile: true, hasTouch: true } : {}),
  });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let y = 0; y <= document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    const { rows, prose } = await page.evaluate(readHeadings);
    const widows = rows.filter((r) => r.widow);
    const over = prose.filter((p) => p.over);
    results.push({ vw: w.vw, route, headings: rows.length, widows: widows.length, rows, prose, overMeasure: over.length });
    console.log(`${String(w.vw).padStart(4)} ${route.padEnd(32)} headings ${String(rows.length).padStart(3)}  widows ${widows.length}  prose ${String(prose.length).padStart(3)}  over-75ch ${over.length}${widows.length ? "  " + widows.map((x) => `[${x.key}: …${x.lastLine}]`).join(" ") : ""}`);
  }
  await ctx.close();
}
await browser.close();

const totalWidows = results.reduce((n, r) => n + r.widows, 0);
const lines = [`# Heading widow probe — ${ROUTES.length} routes × ${WIDTHS.length} widths`, "", `Base: ${base}  ·  widows: **${totalWidows}**`, ""];
lines.push("| vw | route | heading | text-wrap | size | lines | last line | widow |", "|---|---|---|---|---|---|---|---|");
for (const r of results) for (const h of r.rows) {
  if (h.lines < 2) continue;
  lines.push(`| ${r.vw} | ${r.route} | \`${h.key}\` | ${h.textWrap} | ${h.fontSize}px | ${h.lines} | ${h.lastLineWords}w: “${h.lastLine.replace(/\|/g, "\\|")}” | ${h.widow ? "**WIDOW**" : h.authored && h.lastLineWords === 1 ? "authored (br)" : h.split ? "split (2 words)" : ""} |`);
}
lines.push("", "## text-wrap census (all headings, multi-line or not)", "", "| vw | text-wrap | headings |", "|---|---|---|");
const census = new Map();
for (const r of results) for (const h of r.rows) { const k = `${r.vw}|${h.textWrap}`; census.set(k, (census.get(k) ?? 0) + 1); }
for (const [k, v] of Array.from(census.entries()).sort()) { const [vw, tw] = k.split("|"); lines.push(`| ${vw} | ${tw} | ${v} |`); }
const totalOver = results.reduce((n, r) => n + r.overMeasure, 0);
lines.push("", `## Prose measure (p/li/dd >= 100 chars) — over 75ch: **${totalOver}**`, "", "| vw | routes | selector | max-width | text-wrap | size | widest possible line (ch) | over |", "|---|---|---|---|---|---|---|---|");
const proseAgg = new Map();
for (const r of results) for (const p of r.prose) {
  const k = `${r.vw}|${p.key}|${p.maxWidth}|${p.textWrap}`;
  const a = proseAgg.get(k) ?? { vw: r.vw, routes: new Set(), key: p.key, maxWidth: p.maxWidth, textWrap: p.textWrap, fontSize: p.fontSize, ch: 0, over: false };
  a.routes.add(r.route); a.ch = Math.max(a.ch, p.measureCh); a.over = a.over || p.over;
  proseAgg.set(k, a);
}
for (const a of Array.from(proseAgg.values()).sort((x, y) => x.vw - y.vw || y.ch - x.ch)) {
  lines.push(`| ${a.vw} | ${Array.from(a.routes).join(", ")} | \`${a.key}\` | ${a.maxWidth} | ${a.textWrap} | ${a.fontSize}px | ${a.ch} | ${a.over ? "**over**" : ""} |`);
}
writeFileSync(md, lines.join("\n") + "\n");
writeFileSync(out, JSON.stringify({ base, totalWidows, totalOver, results }, null, 1));
console.log(`\nwritten ${md}\nwidows: ${totalWidows}  over-measure: ${totalOver}`);
process.exit(totalWidows ? 1 : 0);
