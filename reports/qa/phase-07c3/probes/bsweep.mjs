/* QA round 3 — the \b class sweep.
 *
 * `\b` in JavaScript is ASCII-only: `ü ş ç ö ğ ı â ²` are not `\w`, so a `\b`
 * that sits next to one is either dead (never matches after a space) or
 * inverted. The Coder found this while building the periodic rule and handled
 * it in THAT rule only, with NB/NA lookarounds. This probe asks whether the
 * other 26 rules carry the same defect, and — the part that decides whether it
 * is a finding — whether any live carrier sits behind it.
 *
 * Method is differential, not by inspection: build a counterfactual gate in
 * which EVERY `\b` in every `pattern` rule is replaced by the Turkish-aware
 * boundary the periodic rule uses, then re-scan a tree and diff the hit sets.
 * Anything the counterfactual gains is a real \b hole WITH a live carrier in
 * that tree. Anything it loses is a \b that was firing where it should not.
 *
 * usage: node bsweep.mjs <gate-lib.mjs> <tree-root> <out.json>
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";

const [, , libPath, treeRoot, outPath] = process.argv;
const G = await import(pathToFileURL(resolve(libPath)).href);
const ROOT = resolve(treeRoot);

const W = "[A-Za-z0-9_çğıîöşüâÇĞİÖŞÜÂÎ]";
/* \b means "boundary in either direction". The Turkish-aware equivalent. */
const TRB = `(?:(?<=${W})(?!${W})|(?<!${W})(?=${W}))`;

/** Replace top-level `\b` only: not `\B`, and not `[\b]` (backspace). */
function retro(src) {
  let out = "";
  let inClass = false;
  let n = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") {
      const d = src[i + 1];
      if (d === "b" && !inClass) { out += TRB; n++; i++; continue; }
      out += c + (d ?? ""); i++; continue;
    }
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    out += c;
  }
  return { out, n };
}

const rewritten = [];
const scanRules = [];
for (const rule of G.RULES) {
  if (!rule.pattern) { scanRules.push(rule.id); continue; }
  const { out, n } = retro(rule.pattern.source);
  if (n === 0) continue;
  try {
    rule.pattern = new RegExp(out, rule.pattern.flags);
    rewritten.push({ id: rule.id, boundaries: n });
  } catch (e) {
    rewritten.push({ id: rule.id, boundaries: n, error: String(e) });
  }
}

/* ── scan with the counterfactual gate ─────────────────────────────────── */
const files = [];
function walk(p) {
  const abs = resolve(ROOT, p);
  if (!existsSync(abs)) return;
  if (G.EXCLUDE.some((r) => r.test(abs))) return;
  const st = statSync(abs);
  if (st.isDirectory()) { for (const e of readdirSync(abs)) walk(join(p, e)); return; }
  if (!G.EXT.test(abs)) return;
  files.push(abs);
}
for (const r of G.ROOTS) walk(r);

const hits = [];
for (const abs of files) {
  const rel = relative(ROOT, abs).split("\\").join("/");
  const raw = readFileSync(abs, "utf8").normalize("NFC");
  const { text, display, lineOf } = G.normalise(G.blankComments(raw, abs.endsWith(".html")));
  const seen = new Set();
  for (const rule of G.RULES) {
    const found = [];
    if (rule.scan) { for (const h of rule.scan(text)) found.push(h); }
    else {
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(text)) !== null) {
        found.push({ index: m.index, match: m[0] });
        if (m[0].length === 0) rule.pattern.lastIndex += 1;
      }
    }
    for (const h of found) {
      if (rule.exempt?.(text, h.index)) continue;
      const line = lineOf[h.index] ?? 0;
      const key = `${rule.id}:${line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const start = Math.max(0, display.lastIndexOf("\n", h.index - 1) + 1);
      const rawEnd = display.indexOf("\n", h.index);
      hits.push({
        key: `${rule.id}@${rel}:${line}`, rule: rule.id, file: rel, line,
        match: display.substr(h.index, h.match.length),
        text: display.slice(start, rawEnd === -1 ? display.length : rawEnd).trim().slice(0, 180),
      });
    }
  }
}
const out = {
  lib: libPath, tree: ROOT,
  rulesRewritten: rewritten, totalBoundariesRewritten: rewritten.reduce((a, r) => a + r.boundaries, 0),
  scanOnlyRules: scanRules,
  files: files.length, total: hits.length, hits,
};
mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 1), "utf8");
console.log(`TR-boundary counterfactual: rewrote ${out.totalBoundariesRewritten} \\b in ${rewritten.length} rules (${scanRules.length} scan-only rules untouched: ${scanRules.join(", ")})`);
console.log(`  ${treeRoot}: files=${files.length} hits=${hits.length}`);
