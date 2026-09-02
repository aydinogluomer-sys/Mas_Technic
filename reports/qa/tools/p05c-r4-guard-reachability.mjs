#!/usr/bin/env node
/* QA — phase 05b RE-VERIFICATION, R4 reachability.
 *
 * The guard's `codeOf` is a hand-rolled stripper, not a parser. Two disclosed
 * blind spots (a regex literal, a template nested in an interpolation) make it
 * strip TOO LITTLE. The Coder argues that direction is safe because it can
 * only produce a loud false breach. That is true of the IMPORT rule, which is
 * presence-based, and false of the REDUCED-MOTION rule, which is
 * absence-based: retaining more text makes `usePrefersReducedMotion(` MORE
 * likely to be found, so a breach goes unreported. That is a quiet false pass.
 *
 * This measures whether that is reachable in the shipped tree today, and how
 * badly the scanner desynchronises on real files.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function codeOf(source) {
  let out = ""; let i = 0; const n = source.length;
  while (i < n) {
    const ch = source[i]; const next = source[i + 1];
    if (ch === "/" && next === "/") { const nl = source.indexOf("\n", i); i = nl === -1 ? n : nl; continue; }
    if (ch === "/" && next === "*") { const end = source.indexOf("*/", i + 2); i = end === -1 ? n : end + 2; out += " "; continue; }
    if (ch === '"' || ch === "'" || ch === "`") {
      out += ch; i += 1;
      while (i < n) {
        if (source[i] === "\\") { out += source.slice(i, i + 2); i += 2; continue; }
        const closes = source[i] === ch; out += source[i]; i += 1; if (closes) break;
      }
      continue;
    }
    out += ch; i += 1;
  }
  return out;
}

function sourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.(tsx|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = sourceFiles("src");
const viewportFiles = [];
const suspectRegex = [];
const stringMentions = [];
const desync = [];

for (const file of files) {
  const rel = file.split(/[\\/]/).join("/");
  const raw = readFileSync(file, "utf8");
  const code = codeOf(raw);

  const hasCb = /onViewportEnter|onViewportLeave/.test(code);
  if (hasCb) viewportFiles.push(rel);

  // A regex literal carrying an odd number of quote characters desynchronises
  // the string scanner and can swallow the rest of the file.
  for (const m of raw.matchAll(/(?<![\w)\]])\/(?![/*])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\n\\])+\/[gimsuy]*/g)) {
    const lit = m[0];
    const quotes = (lit.match(/['"`]/g) ?? []).length;
    if (quotes > 0) suspectRegex.push({ file: rel, literal: lit, quotes, odd: quotes % 2 === 1 });
  }

  // A STRING that mentions the identifier as a call satisfies the rule too,
  // and that needs no scanner bug at all — `codeOf` keeps string bodies.
  for (const m of code.matchAll(/["'`][^"'`\n]*usePrefersReducedMotion\s*\([^"'`\n]*["'`]/g)) {
    stringMentions.push({ file: rel, snippet: m[0].slice(0, 90) });
  }

  // Cheap desync detector: a `//` line comment that survived stripping.
  const survived = code.split("\n").filter((l) => /^\s*\/\/\s/.test(l)).length;
  if (survived) desync.push({ file: rel, survivingLineComments: survived });
}

const out = (label, rows) => {
  console.log(`\n${label} — ${rows.length}`);
  rows.slice(0, 20).forEach((r) => console.log("   " + JSON.stringify(r)));
  if (rows.length > 20) console.log(`   ... and ${rows.length - 20} more`);
};

console.log(`scanned ${files.length} source files under src/`);
out("files whose CODE contains a viewport callback", viewportFiles.map((f) => ({ file: f })));
out("regex literals containing quote characters", suspectRegex);
out("  of those, ODD quote count (scanner desynchronises)", suspectRegex.filter((r) => r.odd));
out("string literals that read as a usePrefersReducedMotion CALL", stringMentions);
out("files where a `//` comment survived codeOf (scanner desync)", desync);

const reachable = desync.filter((d) => viewportFiles.includes(d.file))
  .concat(stringMentions.filter((s) => viewportFiles.includes(s.file)));
console.log(`\nLIVE FALSE-PASS TODAY: ${reachable.length === 0 ? "none — the hole is latent, not active" : JSON.stringify(reachable)}`);
