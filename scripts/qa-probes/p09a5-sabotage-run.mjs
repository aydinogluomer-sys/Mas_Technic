/**
 * QA 09a-R5 item 2 — run every sabotage in `p09a5-sabotage-hooks.mjs` and
 * report, for each, whether the gate went RED.
 *
 * A sabotage that leaves the gate GREEN is a hole: the instrument it disabled is
 * asleep and nothing says so. `none` and `neuter-a-covered-rule` are the two
 * calibration runs — the first must be green, the second must be red, or the
 * whole table is measuring the harness rather than the gate.
 */
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { MUTATION_IDS } from "./p09a5-sabotage-hooks.mjs";

const GATE = fileURLToPath(new URL("../claims-gate.mjs", import.meta.url));
const LOADER = new URL("./p09a5-sabotage.mjs", import.meta.url).href;
const REPO = fileURLToPath(new URL("../..", import.meta.url));

/** Sabotages that MUST leave the gate green, because they disable nothing. */
const EXPECTED_GREEN = new Set(["none"]);

function run(mutation) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [`--import=${LOADER}`, GATE], {
      cwd: REPO,
      env: { ...process.env, P09A5_MUTATION: mutation },
    });
    let out = "";
    child.stdout.on("data", (b) => (out += b));
    child.stderr.on("data", (b) => (out += b));
    child.on("close", (code) => resolve({ code, out }));
  });
}

const rows = [];
for (const m of ["none", ...MUTATION_IDS]) {
  const { code, out } = await run(m);
  const applied = out.includes(`mutation "${m}" applied`) || m === "none";
  const threw = /p09a5: mutation .* (NOT FOUND|changed nothing)/.test(out);
  const green = code === 0 && out.includes("PASS — 0 unverified claims");
  const controlsFailed = /# controls: \d+ \((\d+) failed\)/.exec(out)?.[1] ?? "?";
  const failing = /^FAILING: (.*)$/m.exec(out)?.[1] ?? "";
  rows.push({ m, code, applied, threw, green, controlsFailed, failing });
}

console.log("# QA 09a-R5 — sabotage of the three instruments, the registry, the verdict and the controls");
console.log("# GREEN after a sabotage that disables an instrument = a hole.");
console.log("");
console.log("mutation                              exit  gate    controls-failed  failing");
for (const r of rows) {
  const verdict = r.threw ? "THREW " : r.green ? "GREEN " : "RED   ";
  console.log(
    `${r.m.padEnd(37)} ${String(r.code).padEnd(5)} ${verdict}  ${String(r.controlsFailed).padEnd(16)} ${r.failing}`,
  );
}

const holes = rows.filter((r) => r.green && !EXPECTED_GREEN.has(r.m));
console.log("");
console.log(`sabotages run: ${rows.length - 1}`);
console.log(`turned the gate RED: ${rows.filter((r) => !r.green && !r.threw && r.m !== "none").length}`);
console.log(`threw (anchor gone): ${rows.filter((r) => r.threw).length}`);
console.log(`LEFT THE GATE GREEN: ${holes.length}`);
for (const h of holes) console.log(`  HOLE: ${h.m} — exit 0, "PASS", ${h.controlsFailed} controls failed`);
