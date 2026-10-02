/**
 * QA PHASE 09a — WHERE, horizontally, did a rebanked golden change?
 *
 * The shift profile answers "did content move". It does not answer "what
 * moved", and on a footer whose ground is uniform black the best-match search
 * picks spurious offsets on blank rows. So for each row this reports the x
 * extent and the count of differing pixels AFTER compensating for the 1px
 * upward translation the `border-top` removal predicts — i.e. compare new row
 * y against old row y+1. Whatever still differs is NOT explained by the shift.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldRef = "64d1a8b", rel, shiftArg = "1", thrArg = "16"] = process.argv;
const SHIFT = Number(shiftArg);
const THR = Number(thrArg);
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const a = PNG.sync.read(execFileSync("git", ["show", `${oldRef}:${rel}`], { cwd: REPO, maxBuffer: 1 << 28, encoding: "buffer" }));
const b = PNG.sync.read(readFileSync(resolve(REPO, rel)));
const W = Math.min(a.width, b.width);

console.log(`\n### ${rel}   old ${a.width}x${a.height}  new ${b.width}x${b.height}  comparing new[y] against old[y+${SHIFT}]  thr=${THR}`);

let totalRows = 0, totalPx = 0;
const bands = [];
let cur = null;
for (let y = 0; y < b.height; y += 1) {
  const ya = y + SHIFT;
  if (ya < 0 || ya >= a.height) continue;
  let n = 0, minX = W, maxX = -1;
  for (let x = 0; x < W; x += 1) {
    const ia = (ya * a.width + x) * 4;
    const ib = (y * b.width + x) * 4;
    const d = Math.max(
      Math.abs(a.data[ia] - b.data[ib]),
      Math.abs(a.data[ia + 1] - b.data[ib + 1]),
      Math.abs(a.data[ia + 2] - b.data[ib + 2]),
    );
    if (d >= THR) { n += 1; if (x < minX) minX = x; if (x > maxX) maxX = x; }
  }
  if (n === 0) { cur = null; continue; }
  totalRows += 1; totalPx += n;
  if (!cur) { cur = { from: y, to: y, px: 0, minX, maxX }; bands.push(cur); }
  cur.to = y; cur.px += n; cur.minX = Math.min(cur.minX, minX); cur.maxX = Math.max(cur.maxX, maxX);
}

console.log(`  rows still differing after the ${SHIFT}px shift: ${totalRows}/${b.height}   pixels: ${totalPx}`);
for (const band of bands) {
  console.log(`    rows ${String(band.from).padStart(4)}..${String(band.to).padStart(4)}  x ${band.minX}..${band.maxX}  ${band.px}px`);
}

/* Sample the actual colour pair on the largest band, so a "tint" claim can be
   checked against two hex values rather than asserted. */
const biggest = bands.slice().sort((p, q) => q.px - p.px)[0];
if (biggest) {
  const y = Math.floor((biggest.from + biggest.to) / 2);
  const samples = [];
  for (let x = biggest.minX; x <= biggest.maxX && samples.length < 6; x += 1) {
    const ia = ((y + SHIFT) * a.width + x) * 4;
    const ib = (y * b.width + x) * 4;
    const hex = (data, i) => "#" + [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
    if (hex(a.data, ia) !== hex(b.data, ib)) samples.push(`x=${x} old ${hex(a.data, ia)} -> new ${hex(b.data, ib)}`);
  }
  console.log(`  biggest band rows ${biggest.from}..${biggest.to} samples:`);
  for (const s of samples) console.log(`    ${s}`);
}
