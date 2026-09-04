/* QA round 3 — H6. Run the OLD (6f37eb0) and NEW (7bdd587) chip filters over
 * EVERY `{ label, value }` pair in the data, not only the 48 rows a listing
 * happens to reach. The risk the packet names is the opposite of over-removal:
 * the widened material-grade class is broader than the glued one, so anything
 * it newly ADMITS must be inspected for a withheld leak.
 * usage: node r2-filterdiff.mjs <old-claims.ts> <new-claims.ts> <out.json> */
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildFilter } from "./filterlib.mjs";

const [, , oldClaims, newClaims, outPath] = process.argv;
const OLD = buildFilter(readFileSync(oldClaims, "utf8"));
const NEW = buildFilter(readFileSync(newClaims, "utf8"));

/* Harvest every label/value pair the data files declare. */
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (/\.tsx?$/.test(p)) files.push(p);
  }
})("src");

const PAIR = /\{\s*label:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1\s*,\s*value:\s*(["'`])((?:\\.|(?!\3)[^\\])*)\3/g;
const pairs = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  let m;
  PAIR.lastIndex = 0;
  while ((m = PAIR.exec(src)) !== null) {
    const line = src.slice(0, m.index).split("\n").length;
    pairs.push({ file: f.split("\\").join("/"), line, label: m[2], value: m[4] });
  }
  void lines;
}

const rows = pairs.map((p) => ({ ...p, old: OLD.isPublishable(p), new: NEW.isPublishable(p) }));
const admitted = rows.filter((r) => !r.old && r.new);
const revoked = rows.filter((r) => r.old && !r.new);

/* For every newly admitted value, say which NEW publishable class let it in
   and re-run the ten withheld classes over label+value as a leak check. */
for (const r of admitted) {
  r.viaClass = NEW.publishable.findIndex((re) => re.test(r.value));
  r.viaSource = String(NEW.publishable[r.viaClass]);
  r.withheldHitOnSubject = NEW.withheld.map((re, i) => (re.test(`${r.label} ${r.value}`) ? i : -1)).filter((i) => i >= 0);
}
for (const r of revoked) {
  r.withheldHitOnSubject = NEW.withheld.map((re, i) => (re.test(`${r.label} ${r.value}`) ? i : -1)).filter((i) => i >= 0);
}

const out = {
  pairsFound: pairs.length, filesScanned: files.length,
  oldAdmitted: rows.filter((r) => r.old).length,
  newAdmitted: rows.filter((r) => r.new).length,
  ADMITTED: admitted.length, REVOKED: revoked.length,
  admitted, revoked,
};
writeFileSync(outPath, JSON.stringify(out, null, 1), "utf8");
console.log(`label/value pairs in src: ${pairs.length} (over ${files.length} ts/tsx files)`);
console.log(`publishable under OLD filter: ${out.oldAdmitted}   under NEW filter: ${out.newAdmitted}`);
console.log(`NEWLY ADMITTED: ${admitted.length}   NEWLY REVOKED: ${revoked.length}`);
for (const r of admitted) console.log(`  + ${r.file}:${r.line}  {${r.label}} = "${r.value}"   via ${r.viaSource}`);
for (const r of revoked) console.log(`  - ${r.file}:${r.line}  {${r.label}} = "${r.value}"   withheld classes ${JSON.stringify(r.withheldHitOnSubject)}`);
