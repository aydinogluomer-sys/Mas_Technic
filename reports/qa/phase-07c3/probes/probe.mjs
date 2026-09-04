/* QA round 3 — run either gate revision over a list of probe STRINGS through
   the real `normalise()` pipeline, so folding/zero-width/concat handling is
   the production one and not a re-implementation.
   usage: node probe.mjs <gate-lib.mjs> <probes.json> <out.json> */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [, , libPath, probesPath, outPath] = process.argv;
const G = await import(pathToFileURL(resolve(libPath)).href);
/** @type {{id:string,expect:"FIRE"|"SILENT",src:string,note?:string}[]} */
const probes = JSON.parse(readFileSync(probesPath, "utf8"));

const rows = [];
for (const p of probes) {
  const { text } = G.normalise(G.blankComments(p.src.normalize("NFC"), false));
  const fired = [];
  for (const rule of G.RULES) {
    const hits = [];
    if (rule.scan) { for (const h of rule.scan(text)) hits.push(h); }
    else {
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(text)) !== null) {
        hits.push({ index: m.index, match: m[0] });
        if (m[0].length === 0) rule.pattern.lastIndex += 1;
      }
    }
    for (const h of hits) {
      if (rule.exempt?.(text, h.index)) continue;
      fired.push({ rule: rule.id, match: h.match });
    }
  }
  const uniq = [...new Set(fired.map((f) => f.rule))];
  const verdict = uniq.length ? "FIRE" : "SILENT";
  rows.push({ id: p.id, src: p.src, expect: p.expect, verdict, ok: verdict === p.expect, rules: uniq, matches: fired.map((f) => f.match), note: p.note });
}
const bad = rows.filter((r) => !r.ok);
writeFileSync(outPath, JSON.stringify({ lib: libPath, total: rows.length, mismatches: bad.length, rows }, null, 1), "utf8");
console.log(`${libPath}  probes=${rows.length}  as-expected=${rows.length - bad.length}  MISMATCH=${bad.length}`);
for (const r of rows) {
  console.log(`  ${r.ok ? "ok  " : "MISM"} ${r.expect.padEnd(6)}->${r.verdict.padEnd(6)} ${r.id.padEnd(28)} ${r.rules.join(",") || "-"}  ${r.matches.length ? "[" + r.matches.join("][") + "]" : ""}`);
}
