// QA F2 adversarial probe. Writes one probe per line into a synthetic tree,
// runs a gate over it, and reports FIRED/SILENT per probe against expectation.
// EXPECT "catch"  -> a company-scale/order-volume disclosure the gate must stop.
// EXPECT "silent" -> a specification/ordinary-code shape it must NOT stop
//                    (over-removal fails IMPLEMENTATION.md §0 PRECISION_ENGINEERING).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [gate, treeDir, probeFile, outFile] = process.argv.slice(2);
const probes = JSON.parse(fs.readFileSync(probeFile, "utf8"));

const src = path.join(treeDir, "src", "data");
fs.mkdirSync(src, { recursive: true });

// One probe per line. Line N of the emitted file is probes[N-1] after the
// header, so line = index + 1 + HEADER.
const HEADER = ["export const probe = ["];
const lines = [...HEADER, ...probes.map((p) => p.code), "];"];
fs.writeFileSync(path.join(src, "qaprobe.ts"), lines.join("\n"), "utf8");

let out = "";
try {
  out = execFileSync(process.execPath, [gate], { cwd: treeDir, encoding: "utf8", maxBuffer: 1 << 28 });
} catch (e) { out = (e.stdout || "") + (e.stderr || ""); }

const fired = new Map(); // line -> [rule, match]
let rule = null;
for (const line of out.split(/\r?\n/)) {
  const r = line.match(/^### (\S+) — \d+$/);
  if (r) { rule = r[1]; continue; }
  const h = line.match(/^ {2}(\S*qaprobe\.ts):(\d+): \[(.*?)\] /);
  if (h) fired.set(Number(h[2]), [rule, h[3]]);
}

const rows = probes.map((p, i) => {
  const line = i + 1 + HEADER.length;
  const hit = fired.get(line);
  const got = hit ? "FIRED" : "SILENT";
  const want = p.expect === "catch" ? "FIRED" : "SILENT";
  return { n: i + 1, line, expect: p.expect, got, ok: got === want, rule: hit?.[0] ?? "", match: hit?.[1] ?? "", code: p.code.trim(), why: p.why || "" };
});

const bad = rows.filter((r) => !r.ok);
fs.writeFileSync(outFile, JSON.stringify({ gate, total: rows.length, wrong: bad.length, rows }, null, 2));
for (const r of rows) {
  console.log(`${r.ok ? "ok  " : "WRONG"} #${String(r.n).padStart(2)} want=${r.expect.padEnd(6)} got=${r.got.padEnd(6)} ${r.match ? "[" + r.match + "] " : ""}${r.code.slice(0, 78)}`);
}
console.log(`\nTOTAL ${rows.length}  WRONG ${bad.length}`);
