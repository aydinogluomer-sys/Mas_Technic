/* QA-owned. Phase 03 S1 — amplitude-resolved region analysis of the golden
   regeneration. Aligns new[y] against old[y - dH] (dH = height delta) and
   reports, per contiguous changed band, how BIG the change is, not just how
   many pixels are non-identical. */
const fs = require("node:fs");
const { PNG } = require("playwright-core/lib/utilsBundle");

const widths = [375, 1280, 1440];
const THRESHOLDS = [0, 4, 8, 16, 32, 64];

for (const w of widths) {
  const A = PNG.sync.read(fs.readFileSync(`reports/qa/tools/golden-old/landing-${w}-old.png`));
  const B = PNG.sync.read(fs.readFileSync(`e2e/__golden__/win32/visual-${w}/landing-fullpage.png`));
  const dH = B.height - A.height;
  const W = A.width;
  console.log(`\n########## visual-${w}  old ${A.width}x${A.height} -> new ${B.width}x${B.height} (dH=${dH}) ##########`);

  // Row-level stats under the shifted alignment used for the body of the page.
  const rowNonZero = new Array(B.height).fill(0);
  const rowMaxAmp = new Array(B.height).fill(0);
  const rowOver16 = new Array(B.height).fill(0);
  for (let y = 0; y < B.height; y += 1) {
    const ya = y - dH;
    if (ya < 0 || ya >= A.height) { rowNonZero[y] = W; rowMaxAmp[y] = 255; rowOver16[y] = W; continue; }
    for (let x = 0; x < W; x += 1) {
      const ia = (ya * A.width + x) * 4;
      const ib = (y * B.width + x) * 4;
      const d = Math.max(
        Math.abs(A.data[ia] - B.data[ib]),
        Math.abs(A.data[ia + 1] - B.data[ib + 1]),
        Math.abs(A.data[ia + 2] - B.data[ib + 2]),
        Math.abs(A.data[ia + 3] - B.data[ib + 3]));
      if (d > 0) { rowNonZero[y] += 1; if (d > rowMaxAmp[y]) rowMaxAmp[y] = d; if (d >= 16) rowOver16[y] += 1; }
    }
  }

  // Whole-page totals
  const totPx = W * B.height;
  const totNZ = rowNonZero.reduce((a, b) => a + b, 0);
  const tot16 = rowOver16.reduce((a, b) => a + b, 0);
  console.log(`WHOLE PAGE (aligned by ${dH}): non-identical px ${totNZ}/${totPx} = ${(100 * totNZ / totPx).toFixed(4)}% ; px with amplitude>=16: ${tot16} = ${(100 * tot16 / totPx).toFixed(4)}%`);

  // Bands where the change is VISUALLY MEANINGFUL (>=16 amplitude on >=1% of the row)
  const meaningful = rowOver16.map((n) => (n >= W * 0.01 ? 1 : 0));
  const bandsOf = (flags) => {
    const out = []; let s = null;
    for (let i = 0; i <= flags.length; i += 1) {
      if (i < flags.length && flags[i] && s === null) s = i;
      if ((i === flags.length || !flags[i]) && s !== null) { out.push([s, i - 1]); s = null; }
    }
    return out;
  };
  const mb = bandsOf(meaningful);
  console.log(`MEANINGFUL bands (amplitude>=16 on >=1% of the row), ${mb.length}:`);
  for (const [s, e] of mb) {
    let peak = 0; let px = 0;
    for (let y = s; y <= e; y += 1) { peak = Math.max(peak, rowMaxAmp[y]); px += rowOver16[y]; }
    console.log(`   y ${s}..${e}  (${e - s + 1} rows)  peakAmplitude=${peak}  px>=16: ${px} (${(100 * px / (W * (e - s + 1))).toFixed(2)}% of band)`);
  }

  // Bands that are non-identical but faint (pure resampling / AA noise)
  const faint = rowNonZero.map((n, i) => (n > 0 && !meaningful[i] ? 1 : 0));
  const fb = bandsOf(faint);
  let faintRows = faint.reduce((a, b) => a + b, 0);
  let faintPeak = 0;
  for (let y = 0; y < B.height; y += 1) if (faint[y]) faintPeak = Math.max(faintPeak, rowMaxAmp[y]);
  console.log(`FAINT-ONLY rows: ${faintRows} in ${fb.length} bands, peak amplitude ${faintPeak}`);
  if (fb.length <= 30) for (const [s, e] of fb) {
    let peak = 0; let nz = 0;
    for (let y = s; y <= e; y += 1) { peak = Math.max(peak, rowMaxAmp[y]); nz += rowNonZero[y]; }
    console.log(`   y ${s}..${e} (${e - s + 1} rows) peak=${peak} nonIdenticalPx=${nz}`);
  }
}
