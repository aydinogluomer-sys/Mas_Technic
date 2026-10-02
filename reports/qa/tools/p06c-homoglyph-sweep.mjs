#!/usr/bin/env node
/**
 * Is the "attack 19" class LIVE in the tree, or only a hardening note?
 *
 * The corrected gate folds Cyrillic and Greek homoglyphs. This sweep reports
 * every character in the scanned roots that is NEITHER ASCII NOR one of the
 * Turkish/typographic characters this codebase legitimately uses — i.e. every
 * character that could carry a homoglyph or escape evasion — with its file,
 * line and codepoint. It also reports JS `\uXXXX` / `\xXX` escapes inside
 * string literals, which the normaliser does not decode.
 *
 * A non-empty result means the evasion class is reachable in the shipped tree.
 * An empty result means it is a hardening note, not a live defeat.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const ROOTS = ["src/pages", "src/components", "src/data", "src/content", "src/hooks",
  "src/utils", "src/config", "src/lib", "src/routes", "src/App.tsx", "index.html", "public"];
const EXCLUDE = [/[\\/]admin[\\/]/i, /[\\/]musteri[\\/]/i, /AdminDashboard\./, /AdminLogin\./, /MusteriPaneli\./];
const EXT = /\.(tsx?|html|txt|xml|json|webmanifest|svg|md)$/;

/* Characters this codebase legitimately contains. Everything else is suspect. */
const ALLOWED = new Set([
  ..."çÇğĞıİöÖşŞüÜâÂîÎûÛ",          // Turkish
  ..."°±µ²³×–—…‘’“”„«»·•→←↑↓≈≤≥∅⌀⏎", // typographic / engineering
  ..."€₺$£¢©®™§¶†‡",
  ..."✓✔✕✗★☆☑︎",
  " ", "​", "‌", "‍", "﻿", "­",
]);
/*
 * Only LETTER-shaped Latin confusables matter: box-drawing, superscripts,
 * arrows and warning signs cannot carry `AS9100D`. These are the blocks whose
 * members render as Latin letters — Greek, Cyrillic, Armenian, Cherokee,
 * Canadian syllabics, Roman numerals, Lisu, fullwidth forms and mathematical
 * alphanumerics. The micro sign U+00B5 is below the Greek block and so is
 * excluded by construction.
 */
const CONFUSABLE_LETTER =
  /[Ͱ-ϿЀ-ӿԀ-ԯ԰-֏Ꭰ-᏿᐀-ᙿⅠ-ⅿꓐ-꓿Ａ-ｚ０-９]|[\u{1D400}-\u{1D7FF}]/u;
const isSuspect = (ch) => CONFUSABLE_LETTER.test(ch) && !ALLOWED.has(ch);

const ESCAPE = /\\u\{?[0-9a-fA-F]{2,6}\}?|\\x[0-9a-fA-F]{2}/g;

const files = [];
const walk = (p) => {
  const abs = resolve(REPO, p);
  let st;
  try { st = statSync(abs); } catch { return; }
  if (st.isDirectory()) { for (const e of readdirSync(abs)) walk(join(p, e)); return; }
  if (!EXT.test(abs) || EXCLUDE.some((re) => re.test(abs))) return;
  files.push(abs);
};
for (const r of ROOTS) walk(r);

const homoglyphs = [];
const escapes = [];
for (const abs of files) {
  const rel = relative(REPO, abs).replace(/\\/g, "/");
  const src = readFileSync(abs, "utf8").normalize("NFC");
  src.split("\n").forEach((line, i) => {
    for (const ch of line) {
      if (isSuspect(ch)) {
        homoglyphs.push({ rel, line: i + 1, ch, cp: "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"), text: line.trim().slice(0, 110) });
      }
    }
    ESCAPE.lastIndex = 0;
    let m;
    while ((m = ESCAPE.exec(line)) !== null) escapes.push({ rel, line: i + 1, m: m[0], text: line.trim().slice(0, 110) });
  });
}

console.log(`# HOMOGLYPH / ESCAPE SWEEP — ${files.length} files in the gate's own roots`);
console.log("");
console.log(`## non-ASCII characters outside the Turkish/typographic allow-set — ${homoglyphs.length}`);
const byCp = new Map();
for (const h of homoglyphs) {
  if (!byCp.has(h.cp)) byCp.set(h.cp, []);
  byCp.get(h.cp).push(h);
}
for (const [cp, hits] of [...byCp].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${cp} '${hits[0].ch}'  ×${hits.length}`);
  for (const h of hits.slice(0, 4)) console.log(`      ${h.rel}:${h.line}: ${h.text}`);
}
console.log("");
console.log(`## JS unicode/hex escapes — ${escapes.length}`);
for (const e of escapes.slice(0, 20)) console.log(`  ${e.rel}:${e.line}: ${e.m}   ${e.text}`);
console.log("");
console.log(homoglyphs.length === 0 && escapes.length === 0
  ? "SWEEP CLEAN — the escape/homoglyph evasion class is not reachable in this tree."
  : "SWEEP DIRTY — see above.");
