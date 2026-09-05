/**
 * QA PROBE — is the change in a rebanked golden a pure VERTICAL SHIFT?
 * For each row y of the new image, find the offset d in [-8..+8] that best
 * matches old row (y-d). Reports the shift profile so a "content moved" claim
 * can be separated from a "content changed" one.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldRef = "7dcfb65~1", rel] = process.argv;
const REPO = "C:/Users/Trade Bilisim/pdh-wt/qa-p08";
const a = PNG.sync.read(execFileSync("git", ["show", `${oldRef}:${rel}`], { cwd: REPO, maxBuffer: 1 << 28, encoding: "buffer" }));
const b = PNG.sync.read(readFileSync(`${REPO}/${rel}`));
const W = Math.min(a.width, b.width);

const rowDiff = (ya, yb) => {
  if (ya < 0 || ya >= a.height || yb < 0 || yb >= b.height) return Infinity;
  let n = 0;
  for (let x = 0; x < W; x += 1) {
    const ia = (ya * a.width + x) * 4;
    const ib = (yb * b.width + x) * 4;
    if (Math.max(Math.abs(a.data[ia] - b.data[ib]), Math.abs(a.data[ia + 1] - b.data[ib + 1]), Math.abs(a.data[ia + 2] - b.data[ib + 2])) >= 16) n += 1;
  }
  return n;
};

console.log(`### ${rel}  old ${a.width}x${a.height}  new ${b.width}x${b.height}`);
const runs = [];
let cur = null;
for (let y = 0; y < b.height; y += 1) {
  let best = { d: 0, n: Infinity };
  for (let d = -8; d <= 8; d += 1) {
    const n = rowDiff(y - d, y);
    if (n < best.n) best = { d, n };
  }
  const label = best.n === 0 ? `shift ${best.d >= 0 ? "+" : ""}${best.d}` : `NO MATCH (best d=${best.d}, ${best.n}px differ)`;
  if (!cur || cur.label !== label) { cur = { from: y, to: y, label }; runs.push(cur); } else cur.to = y;
}
for (const r of runs) console.log(`  rows ${String(r.from).padStart(4)}..${String(r.to).padStart(4)}  ${r.label}`);
