/**
 * QA PROBE — falsify the rebank claim for the 23 MODIFIED goldens.
 *
 * CLAIM UNDER TEST (integration note, commit 85a7d8b / 931594f): the only
 * difference between the pre-Phase-08 baseline and the rebanked one is the
 * shared footer gaining two links from `ia.ts` — i.e. a PURE APPEND, with
 * nothing above the footer moving.
 *
 * METHOD: read the old blob straight out of git, decode both PNGs, and report
 *   · image height delta
 *   · the FIRST row that differs by >= threshold on any channel
 *   · the LAST such row
 *   · per-row change counts around the first change
 * A pure append shows its first changed row inside the footer region and
 * nothing above it. Any earlier changed row falsifies the claim.
 *
 * Usage: node probe-golden-rebank.mjs <oldRef> <goldenPathRelativeToRepo> [threshold]
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldRef = "7dcfb65~1", rel, thrArg = "8"] = process.argv;
const THR = Number(thrArg);
const REPO = "C:/Users/Trade Bilisim/pdh-wt/qa-p08";

const oldBuf = execFileSync("git", ["show", `${oldRef}:${rel}`], {
  cwd: REPO, maxBuffer: 1 << 28, encoding: "buffer",
});
const a = PNG.sync.read(oldBuf);
const b = PNG.sync.read(readFileSync(`${REPO}/${rel}`));

console.log(`\n### ${rel}`);
console.log(`  old ${a.width}x${a.height}   new ${b.width}x${b.height}   heightDelta=${b.height - a.height}  widthDelta=${b.width - a.width}`);

const W = Math.min(a.width, b.width);
const H = Math.min(a.height, b.height);
let first = -1, last = -1, changedRows = 0, changedPx = 0;
const rowCounts = new Array(H).fill(0);
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
  rowCounts[y] = n;
  if (n > 0) {
    changedRows += 1;
    changedPx += n;
    if (first < 0) first = y;
    last = y;
  }
}
console.log(`  threshold=${THR}/255  changedRows=${changedRows}/${H}  changedPx=${changedPx}`);
console.log(`  FIRST changed row = ${first}   (${first < 0 ? "-" : ((first / H) * 100).toFixed(1) + "% down the common region"})`);
console.log(`  LAST  changed row = ${last}`);
if (first >= 0) {
  const from = Math.max(0, first - 3);
  const to = Math.min(H, first + 12);
  console.log(`  rows ${from}..${to - 1}: ${rowCounts.slice(from, to).join(",")}`);
}
// Where the shared footer starts, when the caller knows it.
const footerTop = Number(process.env.QA_FOOTER_TOP ?? NaN);
if (Number.isFinite(footerTop)) {
  const above = rowCounts.slice(0, footerTop).reduce((s, n) => s + n, 0);
  console.log(`  pixels changed ABOVE row ${footerTop} (declared footer top): ${above}`);
}
