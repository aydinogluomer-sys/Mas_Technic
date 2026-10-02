/* QA-owned. Phase 03 S1 — quantified old-vs-new golden comparison.
   Uses pngjs bundled inside playwright-core. No production file is touched. */
const fs = require("node:fs");
const path = require("node:path");
const { PNG } = require("playwright-core/lib/utilsBundle");

const ROOT = process.cwd();
const widths = [375, 1280, 1440];

function load(p) {
  return PNG.sync.read(fs.readFileSync(p));
}

function rowDiff(a, b, y, w) {
  // count differing pixels in row y across width w (both images assumed >= w wide)
  let n = 0;
  let maxDelta = 0;
  for (let x = 0; x < w; x += 1) {
    const ia = (y * a.width + x) * 4;
    const ib = (y * b.width + x) * 4;
    const d = Math.max(
      Math.abs(a.data[ia] - b.data[ib]),
      Math.abs(a.data[ia + 1] - b.data[ib + 1]),
      Math.abs(a.data[ia + 2] - b.data[ib + 2]),
      Math.abs(a.data[ia + 3] - b.data[ib + 3]),
    );
    if (d > 0) { n += 1; if (d > maxDelta) maxDelta = d; }
  }
  return { n, maxDelta };
}

function rowDiffShift(a, ya, b, yb, w) {
  let n = 0; let maxDelta = 0;
  for (let x = 0; x < w; x += 1) {
    const ia = (ya * a.width + x) * 4;
    const ib = (yb * b.width + x) * 4;
    const d = Math.max(
      Math.abs(a.data[ia] - b.data[ib]),
      Math.abs(a.data[ia + 1] - b.data[ib + 1]),
      Math.abs(a.data[ia + 2] - b.data[ib + 2]),
      Math.abs(a.data[ia + 3] - b.data[ib + 3]),
    );
    if (d > 0) { n += 1; if (d > maxDelta) maxDelta = d; }
  }
  return { n, maxDelta };
}

function bands(rows) {
  // group consecutive changed row indices into [start,end] bands
  const out = [];
  let start = null;
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i] > 0 && start === null) start = i;
    if ((rows[i] === 0 || i === rows.length - 1) && start !== null) {
      const end = rows[i] === 0 ? i - 1 : i;
      out.push([start, end]);
      start = null;
    }
  }
  return out;
}

for (const w of widths) {
  const oldP = path.join(ROOT, `reports/qa/tools/golden-old/landing-${w}-old.png`);
  const newP = path.join(ROOT, `e2e/__golden__/win32/visual-${w}/landing-fullpage.png`);
  const A = load(oldP); const B = load(newP);
  console.log(`\n================ visual-${w} ================`);
  console.log(`old ${A.width}x${A.height}   new ${B.width}x${B.height}   dH=${B.height - A.height}  dW=${B.width - A.width}`);
  if (A.width !== B.width) { console.log("WIDTH MISMATCH — skipping row analysis"); continue; }
  const W = A.width;

  // --- Pass 1: naive top-aligned comparison over the common height
  const H = Math.min(A.height, B.height);
  const rows = new Array(H).fill(0);
  let totalDiff = 0;
  for (let y = 0; y < H; y += 1) {
    const { n } = rowDiff(A, B, y, W);
    rows[y] = n; totalDiff += n;
  }
  const changedRows = rows.filter((n) => n > 0).length;
  console.log(`TOP-ALIGNED: changed rows ${changedRows}/${H} (${(100 * changedRows / H).toFixed(2)}%), changed px ${totalDiff}/${W * H} (${(100 * totalDiff / (W * H)).toFixed(4)}%)`);
  const b1 = bands(rows);
  console.log(`TOP-ALIGNED changed bands (${b1.length}):`);
  for (const [s, e] of b1.slice(0, 40)) console.log(`   y ${s}..${e}  (${e - s + 1} rows)`);
  if (b1.length > 40) console.log(`   ... ${b1.length - 40} more bands`);

  // --- Pass 2: find the shift point. Try to prove "header band changed + rest shifted by dH".
  const dH = B.height - A.height;
  if (dH !== 0 && Math.abs(dH) < 40) {
    // For each candidate split row k: new[y] == old[y-dH] for y > k
    // Find the smallest k such that all rows below match under the shift.
    let firstShiftMatch = null;
    for (let y = Math.max(0, dH) + 1; y < B.height; y += 1) {
      const { n } = rowDiffShift(B, y, A, y - dH, W);
      if (n === 0) { firstShiftMatch = y; break; }
    }
    // Count how many rows differ under the shifted alignment, over the whole page
    const shiftedRows = [];
    let shiftedTotal = 0;
    for (let y = Math.max(0, dH); y < B.height; y += 1) {
      const ya = y - dH;
      if (ya < 0 || ya >= A.height) { shiftedRows.push(W); shiftedTotal += W; continue; }
      const { n } = rowDiffShift(B, y, A, ya, W);
      shiftedRows.push(n); shiftedTotal += n;
    }
    const shiftedChanged = shiftedRows.filter((n) => n > 0).length;
    console.log(`SHIFTED-BY-${dH}: changed rows ${shiftedChanged}/${shiftedRows.length}, changed px ${shiftedTotal} (${(100 * shiftedTotal / (W * shiftedRows.length)).toFixed(4)}%)`);
    const b2 = bands(shiftedRows);
    const off = Math.max(0, dH);
    console.log(`SHIFTED changed bands (${b2.length}) [new-image y]:`);
    for (const [s, e] of b2.slice(0, 40)) console.log(`   y ${s + off}..${e + off}  (${e - s + 1} rows)  maxRowPx=${Math.max(...shiftedRows.slice(s, e + 1))}`);
    if (b2.length > 40) console.log(`   ... ${b2.length - 40} more bands`);
    console.log(`first fully-identical shifted row: ${firstShiftMatch}`);
  }
}
