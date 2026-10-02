/* QA tool — S1: amplitude-resolved, top-aligned golden comparison.
 *
 * Usage: node reports/qa/tools/golden-diff.mjs <oldPng> <newPng> [label]
 *
 * Reports, over the overlapping top-aligned region:
 *   · % of pixels differing at all
 *   · % of pixels differing by >= 16/255 on any channel ("meaningful")
 *   · first/last row containing a meaningful diff
 *   · a vertical-shift probe: for a band of the page BODY (rows 5%..70% of the
 *     shorter image), the offset in [-64,64] that minimises meaningful diff,
 *     and the residual meaningful-diff % at that best offset.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldPath, newPath, label = ""] = process.argv;
const a = PNG.sync.read(readFileSync(oldPath));
const b = PNG.sync.read(readFileSync(newPath));

const W = Math.min(a.width, b.width);
const H = Math.min(a.height, b.height);
const THRESH = 16;

const px = (img, x, y) => (y * img.width + x) * 4;

let anyDiff = 0;
let meaningful = 0;
let firstRow = -1;
let lastRow = -1;
const rowMeaningful = new Array(H).fill(0);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const ia = px(a, x, y);
    const ib = px(b, x, y);
    const dr = Math.abs(a.data[ia] - b.data[ib]);
    const dg = Math.abs(a.data[ia + 1] - b.data[ib + 1]);
    const db = Math.abs(a.data[ia + 2] - b.data[ib + 2]);
    const m = Math.max(dr, dg, db);
    if (m > 0) anyDiff++;
    if (m >= THRESH) {
      meaningful++;
      rowMeaningful[y]++;
      if (firstRow < 0) firstRow = y;
      lastRow = y;
    }
  }
}

const total = W * H;

// Shift probe over the body band.
const bandTop = Math.floor(H * 0.05);
const bandBottom = Math.floor(H * 0.70);
const step = 2; // sample every 2nd pixel horizontally for speed
let best = { offset: 0, ratio: 1 };
for (let off = -64; off <= 64; off++) {
  let bad = 0;
  let seen = 0;
  for (let y = bandTop; y < bandBottom; y++) {
    const yb = y + off;
    if (yb < 0 || yb >= b.height) continue;
    for (let x = 0; x < W; x += step) {
      const ia = px(a, x, y);
      const ib = px(b, x, yb);
      const m = Math.max(
        Math.abs(a.data[ia] - b.data[ib]),
        Math.abs(a.data[ia + 1] - b.data[ib + 1]),
        Math.abs(a.data[ia + 2] - b.data[ib + 2]),
      );
      seen++;
      if (m >= THRESH) bad++;
    }
  }
  const ratio = seen ? bad / seen : 1;
  if (ratio < best.ratio) best = { offset: off, ratio };
}

const pct = (n, d) => ((n / d) * 100).toFixed(3) + " %";
console.log(`--- ${label || oldPath} ---`);
console.log(`  old ${a.width}x${a.height}  ->  new ${b.width}x${b.height}   (compared top-aligned ${W}x${H})`);
console.log(`  any diff              : ${pct(anyDiff, total)}`);
console.log(`  meaningful (>=${THRESH}/255): ${pct(meaningful, total)}`);
console.log(`  rows with meaningful  : ${firstRow} .. ${lastRow}   (of 0..${H - 1})`);
console.log(`  body-band shift probe : best offset ${best.offset} px, residual meaningful ${(best.ratio * 100).toFixed(3)} %`);
