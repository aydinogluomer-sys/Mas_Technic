/* QA round 3 — build counterfactual gate libraries that ADD BACK the two
   exclusions the Coder made deliberately (`saat` in the period list,
   `kapasite` on the label side), so its claim that each one causes a specific
   over-removal can be measured rather than believed. */
import { readFileSync, writeFileSync } from "node:fs";
const [, , inPath, which, outPath] = process.argv;
let s = readFileSync(inPath, "utf8");
let n = 0;
if (which === "saat") {
  // denominator group, and the adverb/adjective groups
  const before = s;
  s = s.split("(?:yıl|ay|hafta|gün|vardiya)").join("(?:yıl|ay|hafta|gün|saat|vardiya)");
  s = s.split("(?:yılda|ayda|haftada|günde|vardiyada)").join("(?:yılda|ayda|haftada|günde|saatte|vardiyada)");
  s = s.split("(?:yıllık|aylık|haftalık|günlük)").join("(?:yıllık|aylık|haftalık|günlük|saatlik)");
  n = before === s ? 0 : 1;
} else if (which === "kapasite") {
  // label side only: the `(?:yıllık|aylık|haftalık|günlük|NB(?:yıl…` alternative
  const target = "(?:yıllık|aylık|haftalık|günlük|${NB}";
  const repl = "(?:yıllık|aylık|haftalık|günlük|kapasite|${NB}";
  const before = s;
  s = s.split(target).join(repl);
  n = before === s ? 0 : 1;
} else throw new Error("which?");
if (!n) throw new Error("counterfactual substitution matched nothing — probe is invalid");
writeFileSync(outPath, s, "utf8");
console.log(`counterfactual "${which}" written to ${outPath}`);
