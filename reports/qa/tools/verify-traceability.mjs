#!/usr/bin/env node
/**
 * QA Phase 00 — independent verification of reports/baseline/requirements-traceability.md
 *
 * Written by mas-qa. Deliberately does NOT reuse the Coder's generator
 * (reports/baseline/tools/gen-traceability.mjs). It re-parses:
 *   1. the authoritative range table in IMPLEMENTATION.md section 8, and
 *   2. the per-ID matrix in reports/baseline/requirements-traceability.md
 * and compares them.
 *
 * Exits 1 on any discrepancy.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..", "..");

const plan = readFileSync(resolve(root, "IMPLEMENTATION.md"), "utf8");
const matrix = readFileSync(
  resolve(root, "reports/baseline/requirements-traceability.md"),
  "utf8",
);

const DASH = /[–—-]/; // en dash, em dash, hyphen

// ---------------------------------------------------------------------------
// 1. Parse IMPLEMENTATION.md section 8 range table -> authoritative expectation
// ---------------------------------------------------------------------------
const secStart = plan.indexOf("# 8. REQUIREMENT TRACEABILITY");
const secEnd = plan.indexOf("# 9. QA GATES BY PHASE");
if (secStart < 0 || secEnd < 0) {
  console.error("FATAL: could not locate IMPLEMENTATION.md section 8/9 markers");
  process.exit(1);
}
const sec8 = plan.slice(secStart, secEnd);

/** @type {{lo:number, hi:number, phases:number[], raw:string}[]} */
const planRanges = [];
for (const line of sec8.split(/\r?\n/)) {
  const m = line.match(/^\|\s*(\d+)(?:\s*[–—-]\s*(\d+))?\s*\|\s*(.+?)\s*\|\s*$/);
  if (!m) continue;
  const lo = Number(m[1]);
  const hi = m[2] ? Number(m[2]) : lo;
  const phaseCell = m[3];
  const phases = [...phaseCell.matchAll(/Phase\s+(\d+)/g)].map((p) => Number(p[1]));
  if (phases.length === 0) continue;
  planRanges.push({ lo, hi, phases, raw: phaseCell });
}

// ---------------------------------------------------------------------------
// 2. Parse the per-ID matrix out of requirements-traceability.md
// ---------------------------------------------------------------------------
const perIdStart = matrix.indexOf("## Full per-ID matrix");
if (perIdStart < 0) {
  console.error("FATAL: '## Full per-ID matrix' section not found");
  process.exit(1);
}
const perIdBlock = matrix.slice(perIdStart);

/** @type {Map<number, {phase:number, secondaries:number[], theme:string, line:number}>} */
const byId = new Map();
const duplicates = [];
const malformed = [];
let lineNo = matrix.slice(0, perIdStart).split(/\r?\n/).length;
for (const line of perIdBlock.split(/\r?\n/)) {
  lineNo += 1;
  if (!line.startsWith("|")) continue;
  if (/^\|\s*ID\s*\|/.test(line)) continue; // header
  if (/^\|\s*-+/.test(line)) continue; // separator
  const m = line.match(/^\|\s*(\d+)\s*\|\s*Phase\s+(\d+)\s*\|\s*(.*?)\s*\|\s*$/);
  if (!m) {
    malformed.push({ lineNo, line });
    continue;
  }
  const id = Number(m[1]);
  const phase = Number(m[2]);
  const theme = m[3];
  const secondaries = [...theme.matchAll(/Phase\s+(\d+)/g)].map((p) => Number(p[1]));
  if (byId.has(id)) duplicates.push(id);
  else byId.set(id, { phase, secondaries, theme, line: lineNo });
}

// ---------------------------------------------------------------------------
// 3. Coverage checks
// ---------------------------------------------------------------------------
const ids = [...byId.keys()].sort((a, b) => a - b);
const distinct = ids.length;
const gaps = [];
for (let i = 1; i <= 739; i += 1) if (!byId.has(i)) gaps.push(i);
const outOfRange = ids.filter((i) => i < 1 || i > 739);

// ---------------------------------------------------------------------------
// 4. Cross-check every ID against the plan's own range table
// ---------------------------------------------------------------------------
const mismatches = [];
const droppedSecondaries = [];
const unmappedByPlan = [];
for (let id = 1; id <= 739; id += 1) {
  const row = byId.get(id);
  if (!row) continue;
  const pr = planRanges.find((r) => id >= r.lo && id <= r.hi);
  if (!pr) {
    unmappedByPlan.push(id);
    continue;
  }
  const expectedPrimary = pr.phases[0];
  if (row.phase !== expectedPrimary) {
    mismatches.push({
      id,
      got: row.phase,
      expected: expectedPrimary,
      planCell: pr.raw,
      line: row.line,
    });
  }
  const expectedSecondaries = pr.phases.slice(1);
  const missingSecondaries = expectedSecondaries.filter(
    (p) => !row.secondaries.includes(p),
  );
  if (missingSecondaries.length) {
    droppedSecondaries.push({
      id,
      missing: missingSecondaries,
      planCell: pr.raw,
      theme: row.theme,
      line: row.line,
    });
  }
}

// ---------------------------------------------------------------------------
// 5. Plan-side coverage: does the plan's own range table cover 1..739?
// ---------------------------------------------------------------------------
const planCovered = new Set();
for (const r of planRanges) for (let i = r.lo; i <= r.hi; i += 1) planCovered.add(i);
const planGaps = [];
for (let i = 1; i <= 739; i += 1) if (!planCovered.has(i)) planGaps.push(i);

// ---------------------------------------------------------------------------
// 6. Spot-check the boundary/shared IDs the QA packet demands
// ---------------------------------------------------------------------------
const SPOT = [1, 38, 39, 73, 74, 88, 110, 111, 132, 133, 162, 391, 400, 410, 481, 485, 489, 716, 720, 725, 738, 739];
const spot = SPOT.map((id) => {
  const row = byId.get(id);
  const pr = planRanges.find((r) => id >= r.lo && id <= r.hi);
  return {
    id,
    matrixPhase: row ? `Phase ${String(row.phase).padStart(2, "0")}` : "MISSING",
    matrixSecondaries: row ? row.secondaries : [],
    planCell: pr ? `${pr.lo}${pr.lo === pr.hi ? "" : "-" + pr.hi} => ${pr.raw}` : "NO PLAN ROW",
    ok:
      !!row &&
      !!pr &&
      row.phase === pr.phases[0] &&
      pr.phases.slice(1).every((p) => row.secondaries.includes(p)),
  };
});

// ---------------------------------------------------------------------------
// 7. Report
// ---------------------------------------------------------------------------
console.log("=== QA independent traceability verification ===");
console.log(`PLAN_RANGE_ROWS_PARSED: ${planRanges.length}`);
console.log(`PLAN_TABLE_GAPS (ids in 1..739 no plan row covers): ${planGaps.length === 0 ? "[]" : JSON.stringify(planGaps)}`);
console.log(`DISTINCT_IDS: ${distinct}`);
console.log(`DUPLICATES: ${duplicates.length === 0 ? "[]" : JSON.stringify(duplicates)}`);
console.log(`GAPS: ${gaps.length === 0 ? "[]" : JSON.stringify(gaps)}`);
console.log(`OUT_OF_RANGE: ${outOfRange.length === 0 ? "[]" : JSON.stringify(outOfRange)}`);
console.log(`MALFORMED_ROWS: ${malformed.length}`);
console.log(`PRIMARY_PHASE_MISMATCHES: ${mismatches.length}`);
for (const m of mismatches.slice(0, 40)) console.log(`  id ${m.id} (line ${m.line}): matrix=Phase ${m.got} plan="${m.planCell}" expectedPrimary=Phase ${m.expected}`);
console.log(`DROPPED_SECONDARY_OWNERS: ${droppedSecondaries.length}`);
for (const d of droppedSecondaries.slice(0, 40)) console.log(`  id ${d.id} (line ${d.line}): missing Phase ${d.missing.join(",")} plan="${d.planCell}" theme="${d.theme}"`);
console.log(`IDS_WITH_NO_PLAN_ROW: ${unmappedByPlan.length === 0 ? "[]" : JSON.stringify(unmappedByPlan)}`);

console.log("\n--- Spot checks (boundary + shared ranges) ---");
console.log("| ID | matrix phase | matrix secondaries | IMPLEMENTATION.md section 8 row | OK |");
console.log("|---|---|---|---|---|");
for (const s of spot) {
  console.log(
    `| ${s.id} | ${s.matrixPhase} | ${s.matrixSecondaries.length ? s.matrixSecondaries.map((p) => "Phase " + String(p).padStart(2, "0")).join(", ") : "-"} | ${s.planCell} | ${s.ok ? "OK" : "MISMATCH"} |`,
  );
}

// ---------------------------------------------------------------------------
// 8. Per-phase rollup recomputed independently, compared to the file's rollup
// ---------------------------------------------------------------------------
const rollupStart = matrix.indexOf("## Per-phase rollup");
const rollupBlock = matrix.slice(rollupStart, perIdStart);
/** @type {Map<string, number>} */
const claimedCounts = new Map();
for (const line of rollupBlock.split(/\r?\n/)) {
  const m = line.match(/^\|\s*(Phase\s+\d+)\s*\|\s*(\d+)\s*\|/);
  if (m) claimedCounts.set(m[1], Number(m[2]));
}
/** @type {Map<number, number>} */
const actualCounts = new Map();
for (const row of byId.values())
  actualCounts.set(row.phase, (actualCounts.get(row.phase) ?? 0) + 1);

console.log("\n--- Per-phase primary-ownership rollup (recomputed vs claimed) ---");
console.log("| Phase | claimed | recomputed | OK |");
console.log("|---|---|---|---|");
let rollupBad = 0;
let sum = 0;
for (const [phase, count] of [...actualCounts.entries()].sort((a, b) => a[0] - b[0])) {
  const key = `Phase ${String(phase).padStart(2, "0")}`;
  const claimed = claimedCounts.get(key);
  const ok = claimed === count;
  if (!ok) rollupBad += 1;
  sum += count;
  console.log(`| ${key} | ${claimed ?? "-"} | ${count} | ${ok ? "OK" : "MISMATCH"} |`);
}
console.log(`SUM_OF_PRIMARY_COUNTS: ${sum}`);
console.log(`ROLLUP_MISMATCHES: ${rollupBad}`);

const fail =
  distinct !== 739 ||
  gaps.length ||
  duplicates.length ||
  outOfRange.length ||
  malformed.length ||
  mismatches.length ||
  droppedSecondaries.length ||
  unmappedByPlan.length ||
  planGaps.length ||
  rollupBad ||
  sum !== 739;

console.log(`\nVERDICT: ${fail ? "FAIL" : "PASS"}`);
process.exit(fail ? 1 : 0);
