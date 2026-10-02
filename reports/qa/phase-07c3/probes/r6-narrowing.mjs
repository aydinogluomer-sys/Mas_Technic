/* QA round 3 — anti-narrowing at the RULE TEXT level, not just the hit level.
 * The set diff already shows LOST=0 over two trees, but a rule can be narrowed
 * in a way that loses nothing on the trees that happen to exist. So compare
 * every rule's compiled pattern source, old vs new, and classify:
 *   IDENTICAL / WIDENED (old source is a subsequence of the new) / CHANGED.
 * Anything CHANGED gets printed in full for a human decision. */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";

const O = await import(pathToFileURL(resolve("reports/qa/phase-07c3/lib/gate-OLD.mjs")).href);
const N = await import(pathToFileURL(resolve("reports/qa/phase-07c3/lib/gate-NEW.mjs")).href);

const om = new Map(O.RULES.map((r) => [r.id, r]));
const nm = new Map(N.RULES.map((r) => [r.id, r]));

const rows = [];
for (const [id, o] of om) {
  const n = nm.get(id);
  if (!n) { rows.push({ id, verdict: "RULE REMOVED" }); continue; }
  if (!!o.pattern !== !!n.pattern) { rows.push({ id, verdict: "KIND CHANGED (pattern <-> scan)" }); continue; }
  if (!o.pattern) {
    rows.push({ id, verdict: String(o.scan) === String(n.scan) ? "IDENTICAL (scan fn)" : "CHANGED (scan fn)" });
    continue;
  }
  const a = o.pattern.source, b = n.pattern.source;
  if (a === b) { rows.push({ id, verdict: "IDENTICAL" }); continue; }
  // Is every alternative of the old pattern still present verbatim in the new?
  const alts = a.split("|");
  const missing = alts.filter((x) => x.length > 3 && !b.includes(x));
  rows.push({ id, verdict: missing.length ? "CHANGED — old fragments absent" : "WIDENED (all old fragments retained)", missing, oldLen: a.length, newLen: b.length });
}
const added = [...nm.keys()].filter((id) => !om.has(id));

writeFileSync(process.argv[2], JSON.stringify({ rows, added, oldRules: O.RULES.length, newRules: N.RULES.length }, null, 1));
console.log(`rules: old ${O.RULES.length} -> new ${N.RULES.length};  added: ${added.join(", ") || "none"}`);
for (const r of rows) {
  if (r.verdict === "IDENTICAL" || r.verdict === "IDENTICAL (scan fn)") continue;
  console.log(`  ${r.id}: ${r.verdict}  (source ${r.oldLen} -> ${r.newLen} chars)`);
  for (const m of r.missing ?? []) console.log(`      MISSING FRAGMENT: ${m.slice(0, 160)}`);
}
console.log(`identical: ${rows.filter((r) => r.verdict.startsWith("IDENTICAL")).length} / ${rows.length}`);
