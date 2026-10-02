/* QA 09a-R3 — the widened `delivery-or-quality-rate` against the FULL gate.
 *
 * The isolated-alternation battery flagged one shape the two new alternations
 * miss. The alternations are not the rule, so this asks the whole instrument:
 * insert each candidate into `servicePages.ts` `technicalSpecs` / `advantages`
 * exactly as a content author would, run `scripts/claims-gate.mjs`, restore,
 * and assert the tree is clean. Nothing mutated is ever committed.
 *
 * The hypothesis under test is Turkish consonant softening: the rule's benefit
 * vocabulary spells `kazanç`, and the possessive of that noun is `kazancı`.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });
const SP = resolve(ROOT, "src/data/servicePages.ts");

const sh = (cmd) => {
  try {
    return { code: 0, out: execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const requireClean = (l) => {
  if (sh("git diff --quiet").code !== 0) throw new Error(`ABORT: dirty at ${l}`);
};

/* Insertion point: the DFM page's technicalSpecs, the exact block F2b lived in. */
const ANCHOR = '      { label: "Maliyet Kaldıraçları", value: "Parça sayısı, bağlama, tolerans" },';

const CANDIDATES = [
  { id: "baseline-F2b-verbatim", line: '{ label: "Maliyet Tasarrufu", value: "Ortalama %30-50" },', want: "fires" },
  { id: "softened-zaman-kazanci", line: '{ label: "Zaman Kazancı", value: "%25" },', want: "fires" },
  { id: "softened-maliyet-kazanci", line: '{ label: "Maliyet Kazancı", value: "%30-50" },', want: "fires" },
  { id: "softened-verim-kazanci", line: '{ label: "Verim Kazancı", value: "Ortalama %40" },', want: "fires" },
  { id: "unsoftened-kazanc-control", line: '{ label: "Zaman Kazanç", value: "%25" },', want: "fires" },
  { id: "tasarrufu-possessive-control", line: '{ label: "Maliyet Tasarrufu", value: "%25" },', want: "fires" },
  { id: "prose-softened-kazanc", line: '{ label: "Not", value: "%35 zaman kazancı elde edilir" },', want: "fires" },
  { id: "prose-softened-kazanc-no-other-noun", line: '{ label: "Not", value: "Ortalama %35 kazancı ölçüldü" },', want: "fires" },
  { id: "negative-ordinary-spec", line: '{ label: "Kavite Sayısı", value: "8" },', want: "silent" },
];

const results = [];
requireClean("start");
for (const c of CANDIDATES) {
  const original = readFileSync(SP, "utf8");
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const anchor = eol === "\r\n" ? ANCHOR : ANCHOR;
  if (original.split(anchor).length - 1 !== 1) throw new Error("anchor not unique");
  let rec;
  try {
    writeFileSync(SP, original.replace(anchor, `      ${c.line}${eol}${anchor}`), "utf8");
    const gate = sh("node scripts/claims-gate.mjs");
    const fired = gate.code !== 0;
    rec = {
      id: c.id,
      line: c.line,
      expected: c.want,
      fired,
      verdict: (gate.out.match(/^(PASS|FAIL).*$/m) || ["(none)"])[0].trim(),
      hit: (gate.out.match(/^\s*src\/[^\n]*$/m) || ["(none)"])[0].trim(),
      rule: (gate.out.match(/[a-z-]*(delivery-or-quality-rate|free-of-charge-commitment|periodic-volume-disclosure|machine-inventory|cad-format-list-not-derived)/) || [null])[0],
      result: (fired ? "fires" : "silent") === c.want ? "as expected" : "*** MISS ***",
    };
  } finally {
    writeFileSync(SP, original, "utf8");
  }
  requireClean(`after ${c.id}`);
  results.push(rec);
  console.log(`${rec.id.padEnd(34)} ${rec.result.padEnd(14)} fired=${String(rec.fired).padEnd(5)} ${rec.rule ?? ""}`);
  if (rec.fired) console.log(`      ${rec.hit}`);
}
requireClean("end");
writeFileSync(resolve(OUT, "widened-holes.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log("\nworking tree verified clean after every candidate.");
