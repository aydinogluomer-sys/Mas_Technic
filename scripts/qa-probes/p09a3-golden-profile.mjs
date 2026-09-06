/* QA 09a-R3 — HOW the six baselines differ, not merely THAT they differ.
 *
 * The first pass showed the overlap is NOT pixel-identical, and two of the six
 * did not change height at all — so "the crop rounds to one fewer device row"
 * cannot be the whole account. The question this answers is which of two very
 * different things happened:
 *
 *   (a) the band re-rasterised at a different SUB-PIXEL vertical origin, which
 *       perturbs every antialiased glyph and rule edge by a small amount,
 *       spread over the whole image and concentrated on ink; or
 *   (b) the CONTENT of the band changed, which produces large deltas confined
 *       to a few bands of rows and leaves the rest bit-identical.
 *
 * Measured: per-row differing-channel profile, delta histogram, the best whole
 * -row vertical alignment in [-3, +3], and the fraction of rows untouched.
 *
 * Read-only. Nothing under `e2e/__golden__` is written; no `--update-snapshots`.
 */
import { execFileSync } from "node:child_process";
import { inflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });
const git = (args) => execFileSync("git", args, { cwd: ROOT, maxBuffer: 1 << 28 });

function decodePng(buf) {
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") ihdr = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), depth: data[8], colorType: data[9], interlace: data[12] };
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const bpp = ihdr.colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = ihdr.width * bpp;
  const out = Buffer.alloc(ihdr.height * stride);
  let p = 0;
  for (let y = 0; y < ihdr.height; y += 1) {
    const filter = raw[p];
    p += 1;
    const line = raw.subarray(p, p + stride);
    p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      const v = line[x];
      let val;
      if (filter === 0) val = v;
      else if (filter === 1) val = v + a;
      else if (filter === 2) val = v + b;
      else if (filter === 3) val = v + ((a + b) >> 1);
      else {
        const pp = a + b - c;
        const pa = Math.abs(pp - a);
        const pb = Math.abs(pp - b);
        const pc = Math.abs(pp - c);
        val = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      cur[x] = val & 0xff;
    }
  }
  return { ...ihdr, pixels: out, stride, bpp };
}

const MOVED = [
  "visual-1280/inner-next-service-detail.png",
  "visual-1280/shell-footer-service.png",
  "visual-375/inner-next-service-detail.png",
  "visual-375/shell-footer-service.png",
  "visual-768/inner-next-service-detail.png",
  "visual-768/shell-footer-service.png",
];

const report = [];
for (const short of MOVED) {
  const f = `e2e/__golden__/win32/${short}`;
  const A = decodePng(git(["show", `15e19ef~1:${f}`]));
  const B = decodePng(git(["show", `15e19ef:${f}`]));
  const w = Math.min(A.width, B.width);
  const bpp = A.bpp;

  /* Best whole-row alignment: for shift s, compare A row y+s with B row y. */
  const score = (s) => {
    let diff = 0;
    let rows = 0;
    for (let y = 0; y < B.height; y += 1) {
      const ay = y + s;
      if (ay < 0 || ay >= A.height) continue;
      rows += 1;
      for (let x = 0; x < w * bpp; x += 1) {
        if (A.pixels[ay * A.stride + x] !== B.pixels[y * B.stride + x]) diff += 1;
      }
    }
    return { s, diff, rows, perRow: rows ? +(diff / rows).toFixed(1) : 0 };
  };
  const alignments = [-3, -2, -1, 0, 1, 2, 3].map(score);
  const best = alignments.reduce((m, x) => (x.diff / Math.max(1, x.rows) < m.diff / Math.max(1, m.rows) ? x : m));

  /* Per-row profile and delta histogram at shift 0 (top-anchored). */
  const rowProfile = [];
  const hist = { "1-4": 0, "5-16": 0, "17-64": 0, "65-128": 0, "129-255": 0 };
  const h = Math.min(A.height, B.height);
  for (let y = 0; y < h; y += 1) {
    let d = 0;
    for (let x = 0; x < w * bpp; x += 1) {
      const delta = Math.abs(A.pixels[y * A.stride + x] - B.pixels[y * B.stride + x]);
      if (delta === 0) continue;
      d += 1;
      if (delta <= 4) hist["1-4"] += 1;
      else if (delta <= 16) hist["5-16"] += 1;
      else if (delta <= 64) hist["17-64"] += 1;
      else if (delta <= 128) hist["65-128"] += 1;
      else hist["129-255"] += 1;
    }
    rowProfile.push(d);
  }
  const touchedRows = rowProfile.filter((d) => d > 0).length;
  /* Longest run of consecutive untouched rows — a content edit leaves a long
     clean run above and below; a re-rasterisation does not. */
  let run = 0;
  let longestClean = 0;
  for (const d of rowProfile) {
    run = d === 0 ? run + 1 : 0;
    if (run > longestClean) longestClean = run;
  }

  report.push({
    file: short,
    before: `${A.width}x${A.height}`,
    after: `${B.width}x${B.height}`,
    dHeight: B.height - A.height,
    alignments,
    bestAlignmentShift: best.s,
    bestAlignmentDiffPerRow: best.perRow,
    rowsCompared: h,
    rowsWithAnyDifference: touchedRows,
    rowsTouchedPct: `${((touchedRows / h) * 100).toFixed(1)}%`,
    longestUntouchedRunRows: longestClean,
    deltaHistogram: hist,
  });
}
writeFileSync(resolve(OUT, "golden-profile.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

for (const r of report) {
  console.log(`${r.file}   ${r.before} -> ${r.after}  dH=${r.dHeight}`);
  console.log(`   rows differing anywhere : ${r.rowsWithAnyDifference}/${r.rowsCompared}  (${r.rowsTouchedPct})`);
  console.log(`   longest untouched run   : ${r.longestUntouchedRunRows} rows`);
  console.log(`   best row alignment      : shift ${r.bestAlignmentShift}  (${r.bestAlignmentDiffPerRow} differing channels/row)`);
  console.log(`   alignment sweep         : ${r.alignments.map((a) => `${a.s}:${a.perRow}`).join("  ")}`);
  console.log(`   delta histogram         : ${JSON.stringify(r.deltaHistogram)}`);
  console.log("");
}
