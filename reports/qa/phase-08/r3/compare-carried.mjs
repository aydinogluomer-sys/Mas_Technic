/** QA round 3 — carried criteria 3 and 5, compared to round 1/2 output.
 *  The round-1 evidence files were written under a different console codepage,
 *  so a byte compare only reports mojibake. Strip every non-ASCII character
 *  from both sides and compare the structure that carries the verdict. */
import { readFileSync } from "node:fs";

const strip = (s) => s.replace(/[^\x20-\x7E\n]/g, "");
const load = (p) => strip(readFileSync(p, "utf8")).replace(/\r/g, "").trim();

const pairs = [
  ["criterion 3 — legacy accent", "reports/qa/phase-08/legacy-accent.txt", "reports/qa/phase-08/r3/legacy-accent-r3.txt"],
  ["criterion 3 — design membership", "reports/qa/phase-08/design-membership.txt", "reports/qa/phase-08/r3/design-membership-r3.txt"],
  ["criterion 5 — error states", "reports/qa/phase-08/error-states.txt", "reports/qa/phase-08/r3/error-states-r3.txt"],
];

for (const [name, before, after] of pairs) {
  const a = load(before);
  const b = load(after);
  if (a === b) { console.log(`IDENTICAL (ascii-normalised)  ${name}`); continue; }
  const la = a.split("\n");
  const lb = b.split("\n");
  const diff = [];
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if (la[i] !== lb[i]) diff.push(`  line ${i + 1}\n    round1: ${la[i]}\n    round3: ${lb[i]}`);
  }
  console.log(`DIFFERS  ${name}  (${diff.length} lines)`);
  console.log(diff.slice(0, 30).join("\n"));
}
