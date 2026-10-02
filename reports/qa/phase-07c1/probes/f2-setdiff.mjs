// QA F2 anti-laundering harness.
// Runs two gate versions over the SAME tree and emits the rule@file:line SET diff.
// GAINED = new catches that old missed. LOST = old catches that new no longer makes.
// A widen-only change must have LOST = 0.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [gateA, gateB, cwd, outPrefix] = process.argv.slice(2);

function run(gate) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [gate], { cwd, encoding: "utf8", maxBuffer: 1 << 28 });
  } catch (e) {
    out = (e.stdout || "") + (e.stderr || "");
  }
  const set = new Map(); // rule@file:line -> matched fragment
  let rule = null;
  const counts = new Map();
  for (const line of out.split(/\r?\n/)) {
    const r = line.match(/^### (\S+) — (\d+)$/);
    if (r) { rule = r[1]; counts.set(rule, Number(r[2])); continue; }
    const h = line.match(/^ {2}(\S+?):(\d+): \[(.*?)\] (.*)$/);
    if (h && rule) set.set(`${rule}@${h[1]}:${h[2]}`, { match: h[3], text: h[4] });
  }
  const scanned = (out.match(/# scanned: +(\d+) files, (\d+) non-comment lines/) || []).slice(1);
  const pass = /^PASS — 0 /m.test(out);
  return { set, counts, scanned, pass, raw: out };
}

const A = run(gateA);
const B = run(gateB);

const keysA = [...A.set.keys()];
const keysB = [...B.set.keys()];
const lost = keysA.filter((k) => !B.set.has(k));
const gained = keysB.filter((k) => !A.set.has(k));

const rules = new Set([...A.counts.keys(), ...B.counts.keys()]);
const perRule = [...rules].sort().map((r) => ({
  rule: r, old: A.counts.get(r) ?? 0, new: B.counts.get(r) ?? 0,
})).filter((x) => x.old !== x.new || true);

const report = {
  cwd, gateA, gateB,
  scannedOld: A.scanned, scannedNew: B.scanned,
  passOld: A.pass, passNew: B.pass,
  totalOld: keysA.length, totalNew: keysB.length,
  LOST: lost.length, GAINED: gained.length,
  lostKeys: lost.map((k) => ({ key: k, ...A.set.get(k) })),
  gainedKeys: gained.map((k) => ({ key: k, ...B.set.get(k) })),
  perRuleCountsChanged: perRule.filter((x) => x.old !== x.new),
  perRuleCountsSame: perRule.filter((x) => x.old === x.new).length,
};
fs.writeFileSync(`${outPrefix}.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${outPrefix}.old.txt`, A.raw);
fs.writeFileSync(`${outPrefix}.new.txt`, B.raw);
console.log(JSON.stringify({
  cwd, scannedOld: A.scanned, scannedNew: B.scanned, passOld: A.pass, passNew: B.pass,
  totalOld: keysA.length, totalNew: keysB.length, LOST: lost.length, GAINED: gained.length,
  perRuleCountsChanged: report.perRuleCountsChanged, perRuleCountsSame: report.perRuleCountsSame,
}, null, 2));
