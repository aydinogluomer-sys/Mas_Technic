/* Before vs after, from the two JSON files the one instrument wrote.
   The claim under test is not "the controls got better" — that is visible in
   either file on its own. It is the SECOND claim, the one that is easy to make
   and hard to keep: that nothing which is not a control moved. */
import { readFileSync } from "node:fs";

const load = (l) => JSON.parse(readFileSync(`reports/09b1c1/control-boundary-${l}.json`, "utf8"));
const before = load("before");
const after = load("after");

const key = (r) => `${r.viewport}|${r.route}|${r.kind}|${r.component}|${r.tone}`;
const index = (d) => new Map(d.rows.filter((r) => !r.error).map((r) => [key(r), r]));
const B = index(before);
const A = index(after);

const changed = [];
const same = [];
const onlyBefore = [];
const onlyAfter = [];

for (const [k, b] of B) {
  const a = A.get(k);
  if (!a) { onlyBefore.push(k); continue; }
  if (a.borderRaw !== b.borderRaw || a.binding !== b.binding) changed.push({ k, b, a });
  else same.push(k);
}
for (const k of A.keys()) if (!B.has(k)) onlyAfter.push(k);

const byKind = (list, kind) => list.filter((c) => c.k.split("|")[2] === kind);

console.log(`rows before ${B.size}  after ${A.size}  changed ${changed.length}  unchanged ${same.length}`);
console.log(`only-before ${onlyBefore.length}  only-after ${onlyAfter.length}`);

for (const kind of ["control", "control-edge", "decor"]) {
  const rows = byKind(changed, kind);
  console.log(`\n══ CHANGED — ${kind} (${rows.length}) ══`);
  for (const { k, b, a } of rows) {
    console.log(`${k}\n    ${b.borderRaw} -> ${a.borderRaw}   binding ${b.binding} -> ${a.binding}`);
  }
  const untouched = same.filter((s) => s.split("|")[2] === kind).length;
  console.log(`   (${untouched} ${kind} rows identical in both runs)`);
}

if (onlyBefore.length || onlyAfter.length) {
  console.log("\n══ ROWS PRESENT IN ONLY ONE RUN — every one of these needs an explanation ══");
  for (const k of onlyBefore) console.log(`  before only: ${k}`);
  for (const k of onlyAfter) console.log(`  after  only: ${k}`);
}

const stillFailing = [...A.values()].filter((r) => r.kind === "control" && !r.disabled && r.binding < 3);
console.log(`\n══ CONTROLS STILL UNDER 3:1 AFTER (${stillFailing.length}) ══`);
for (const r of stillFailing) console.log(`  ${r.viewport} ${r.route} ${r.component} ${r.tone} ${r.binding}`);
