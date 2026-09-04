/* QA round 3 — anti-laundering. A widened gate must be a SUPERSET of the old
   one at `rule@file:line` granularity. A net count that rose is not evidence:
   a change can add 40 and quietly drop 7. LOST must be exactly 0. */
import { readFileSync, writeFileSync } from "node:fs";
const [, , oldPath, newPath, label, outPath] = process.argv;
const O = JSON.parse(readFileSync(oldPath, "utf8"));
const N = JSON.parse(readFileSync(newPath, "utf8"));
const os = new Set(O.hits.map((h) => h.key));
const ns = new Set(N.hits.map((h) => h.key));
const lost = O.hits.filter((h) => !ns.has(h.key));
const gained = N.hits.filter((h) => !os.has(h.key));
const gainedByRule = {};
for (const h of gained) gainedByRule[h.rule] = (gainedByRule[h.rule] ?? 0) + 1;
const lostByRule = {};
for (const h of lost) lostByRule[h.rule] = (lostByRule[h.rule] ?? 0) + 1;
const out = {
  label, oldTotal: O.total, newTotal: N.total,
  oldDistinct: os.size, newDistinct: ns.size,
  LOST: lost.length, GAINED: gained.length,
  lostByRule, gainedByRule,
  lost, gained,
};
writeFileSync(outPath, JSON.stringify(out, null, 1), "utf8");
console.log(`${label}: ${O.total} -> ${N.total}  LOST=${lost.length}  GAINED=${gained.length}`);
console.log("  gained by rule:", JSON.stringify(gainedByRule));
if (lost.length) console.log("  LOST by rule:", JSON.stringify(lostByRule));
