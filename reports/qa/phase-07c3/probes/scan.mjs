/* QA round 3 — scan ANY tree with ANY revision of the gate, and emit the
   `rule@file:line` SET the anti-laundering comparison needs.
   usage: node scan.mjs <gate-lib.mjs> <tree-root> <out.json>
   The tree root is passed in, never derived from this file's location. */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";

const [, , libPath, treeRoot, outPath] = process.argv;
const G = await import(pathToFileURL(resolve(libPath)).href);
const ROOT = resolve(treeRoot);

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
let lines = 0;
for (const abs of files) {
  const rel = relative(ROOT, abs).split("\\").join("/");
  const raw = readFileSync(abs, "utf8").normalize("NFC");
  const { text, display, lineOf } = G.normalise(G.blankComments(raw, abs.endsWith(".html")));
  lines += text.split("\n").filter((l) => l.trim()).length;
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
        key: `${rule.id}@${rel}:${line}`,
        rule: rule.id, file: rel, line,
        match: display.substr(h.index, h.match.length),
        text: display.slice(start, rawEnd === -1 ? display.length : rawEnd).trim().slice(0, 180),
      });
    }
  }
}
const byRule = {};
for (const h of hits) byRule[h.rule] = (byRule[h.rule] ?? 0) + 1;
const out = { lib: libPath, tree: ROOT, rules: G.RULES.length, files: files.length, lines, total: hits.length, byRule, hits };
mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 1), "utf8");
console.log(`${libPath} x ${treeRoot}: rules=${G.RULES.length} files=${files.length} lines=${lines} hits=${hits.length}`);
