/**
 * QA PHASE 09a — adjudicate a rebanked golden instead of accepting it.
 *
 * `reports/qa/phase-08/probe-golden-rebank.mjs` and `probe-golden-shift.mjs`
 * are the round-2 instruments and the method here is theirs, unchanged: decode
 * the old blob straight out of git, decode the new file, and report the height
 * delta, the first and last changed row, and the per-row vertical-shift
 * profile. They could not be borrowed byte-for-byte because both hardcode
 * `REPO = "C:/Users/Trade Bilisim/pdh-wt/qa-p08"`, a worktree that was pruned
 * between phases; the repo root is a parameter here and nothing else differs.
 *
 * CLAIM UNDER TEST (09a, commit 2f6bb3c): the only reason these four moved is
 * `src/styles/shell.css:509`, which gives `.tl-footer` a `border-top` ONLY
 * under `[data-shell-surface="paper"]`. `/teklif-al` moved from the `paper`
 * default to `graphite`, so that 1px rule disappears and everything below it
 * translates up by 1px, plus whatever paper-only tints the same block carried.
 *
 * A 1px translation predicts: heightDelta 0, first changed row at the footer's
 * top edge, and a `shift +1`/`shift -1` run covering the footer with NO
 * "NO MATCH" run. Anything else falsifies it.
 *
 * Usage: node probe-golden-adjudicate.mjs <oldRef> <goldenPathRelativeToRepo> [threshold]
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldRef = "64d1a8b", rel, thrArg = "8"] = process.argv;
const THR = Number(thrArg);
/** reports/qa/phase-09a → repo root. Resolved from this file, like claims-gate. */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const oldBuf = execFileSync("git", ["show", `${oldRef}:${rel}`], {
  cwd: REPO, maxBuffer: 1 << 28, encoding: "buffer",
});
const a = PNG.sync.read(oldBuf);
const b = PNG.sync.read(readFileSync(resolve(REPO, rel)));

console.log(`\n### ${rel}`);
console.log(`  old ${a.width}x${a.height}   new ${b.width}x${b.height}   heightDelta=${b.height - a.height}  widthDelta=${b.width - a.width}`);

const W = Math.min(a.width, b.width);
const H = Math.min(a.height, b.height);

/* ── 1. first / last changed row, and how much of each row changed ────── */
let first = -1, last = -1, changedRows = 0, changedPx = 0;
const perRow = new Array(H).fill(0);
for (let y = 0; y < H; y += 1) {
  let n = 0;
  for (let x = 0; x < W; x += 1) {
    const ia = (y * a.width + x) * 4;
    const ib = (y * b.width + x) * 4;
    const d = Math.max(
      Math.abs(a.data[ia] - b.data[ib]),
      Math.abs(a.data[ia + 1] - b.data[ib + 1]),
      Math.abs(a.data[ia + 2] - b.data[ib + 2]),
    );
    if (d >= THR) n += 1;
  }
  perRow[y] = n;
  if (n > 0) {
    if (first < 0) first = y;
    last = y;
    changedRows += 1;
    changedPx += n;
  }
}
console.log(`  threshold=${THR}  changedRows=${changedRows}/${H}  changedPx=${changedPx}  first=${first}  last=${last}`);
if (first >= 0) {
  const from = Math.max(0, first - 3);
  const to = Math.min(H - 1, first + 8);
  console.log(`  rows ${from}..${to}: ${perRow.slice(from, to + 1).map((n, i) => `${from + i}:${n}`).join(" ")}`);
}

/* ── 2. vertical-shift profile: moved content, or changed content? ────── */
const rowDiff = (ya, yb) => {
  if (ya < 0 || ya >= a.height || yb < 0 || yb >= b.height) return Infinity;
  let n = 0;
  for (let x = 0; x < W; x += 1) {
    const ia = (ya * a.width + x) * 4;
    const ib = (yb * b.width + x) * 4;
    if (Math.max(
      Math.abs(a.data[ia] - b.data[ib]),
      Math.abs(a.data[ia + 1] - b.data[ib + 1]),
      Math.abs(a.data[ia + 2] - b.data[ib + 2]),
    ) >= 16) n += 1;
  }
  return n;
};

const runs = [];
let cur = null;
for (let y = 0; y < b.height; y += 1) {
  let best = { d: 0, n: Infinity };
  for (let d = -8; d <= 8; d += 1) {
    const n = rowDiff(y - d, y);
    if (n < best.n) best = { d, n };
  }
  const label = best.n === 0
    ? `shift ${best.d >= 0 ? "+" : ""}${best.d}`
    : `NO MATCH (best d=${best.d}, ${best.n}px differ)`;
  if (!cur || cur.label !== label) { cur = { from: y, to: y, label }; runs.push(cur); } else cur.to = y;
}
console.log("  shift profile:");
for (const run of runs) console.log(`    rows ${String(run.from).padStart(4)}..${String(run.to).padStart(4)}  ${run.label}`);
