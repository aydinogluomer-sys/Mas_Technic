#!/usr/bin/env node
/**
 * QA-owned PNG differ — Phase 06 R7 (golden regeneration adjudication).
 *
 * The repo has no image library, and `--update-snapshots=all` destroys the
 * evidence a reviewer needs: once the golden is overwritten, "the diff was a
 * content change" is an assertion, not a fact. This decodes the OLD blob and
 * the NEW blob straight out of git and reports, per file:
 *
 *   - changed pixel count and percentage,
 *   - the bounding box of the change,
 *   - the row bands that changed (so a footer edit is distinguishable from a
 *     whole-page shift),
 *   - the vertical offset in [-4..+4] that MINIMISES the difference, which is
 *     how a pure translation is told apart from a repaint.
 *
 * A pure content change has a tight bounding box and minimises at offset 0.
 * A layout shift minimises at a non-zero offset. A regression shows changed
 * bands nowhere near the edited content.
 *
 * Only 8-bit truecolour/alpha non-interlaced PNGs are supported — that is what
 * Chromium's screenshot encoder emits.
 *
 * Usage: node reports/qa/tools/png-diff.mjs <old.png> <new.png> [label]
 */
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }
  if (bitDepth !== 8 || interlace !== 0) {
    throw new Error(`unsupported PNG: bitDepth=${bitDepth} interlace=${interlace}`);
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colorType ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[rp];
    rp += 1;
    const line = raw.subarray(rp, rp + stride);
    rp += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

/**
 * pixelmatch's YIQ colour delta, which is what Playwright's default
 * `toHaveScreenshot` comparator uses. A pixel counts as different when
 * `delta > threshold * 35215`, with Playwright's default `threshold` of 0.2.
 * Reproducing it here is the only way to say what `maxDiffPixels: 200` would
 * actually have seen — a raw channel diff overcounts anti-aliasing badly.
 */
const PM_MAX = 35215;
function yiqDelta(r1, g1, b1, a1, r2, g2, b2, a2) {
  // pixelmatch blends against white for partial alpha.
  const bl = (c, a) => 255 + (c - 255) * (a / 255);
  const R1 = bl(r1, a1);
  const G1 = bl(g1, a1);
  const B1 = bl(b1, a1);
  const R2 = bl(r2, a2);
  const G2 = bl(g2, a2);
  const B2 = bl(b2, a2);
  const y = 0.29889531 * (R1 - R2) + 0.58662247 * (G1 - G2) + 0.11448223 * (B1 - B2);
  const i = 0.59597799 * (R1 - R2) - 0.2741761 * (G1 - G2) - 0.32180189 * (B1 - B2);
  const q = 0.21147017 * (R1 - R2) - 0.52261711 * (G1 - G2) + 0.31114694 * (B1 - B2);
  return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
}

/** Per-pixel max-channel distance; `tol` mirrors nothing in Playwright, it is
 *  deliberately 0 so nothing is rounded away. */
function compare(a, b, dy = 0, tol = 0) {
  const w = Math.min(a.width, b.width);
  const rows = [];
  let changed = 0;
  let pmChanged = 0;
  let minX = Infinity;
  let maxX = -1;
  let minY = Infinity;
  let maxY = -1;
  const yStart = Math.max(0, -dy);
  const yEnd = Math.min(a.height, b.height - dy);
  for (let y = yStart; y < yEnd; y += 1) {
    let rowChanged = 0;
    for (let x = 0; x < w; x += 1) {
      const ia = (y * a.width + x) * a.channels;
      const ib = ((y + dy) * b.width + x) * b.channels;
      let d = 0;
      for (let c = 0; c < Math.min(a.channels, b.channels); c += 1) {
        d = Math.max(d, Math.abs(a.data[ia + c] - b.data[ib + c]));
      }
      if (a.channels >= 3 && b.channels >= 3) {
        const aa = a.channels === 4 ? a.data[ia + 3] : 255;
        const ba = b.channels === 4 ? b.data[ib + 3] : 255;
        const delta = yiqDelta(
          a.data[ia], a.data[ia + 1], a.data[ia + 2], aa,
          b.data[ib], b.data[ib + 1], b.data[ib + 2], ba,
        );
        if (delta > 0.2 * PM_MAX) pmChanged += 1;
      }
      if (d > tol) {
        rowChanged += 1;
        changed += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (rowChanged) rows.push([y, rowChanged]);
  }
  return { changed, pmChanged, rows, box: maxX < 0 ? null : { minX, maxX, minY, maxY } };
}

const [oldPath, newPath, label = ""] = process.argv.slice(2);
const A = decodePng(readFileSync(oldPath));
const B = decodePng(readFileSync(newPath));

console.log(`## ${label || newPath}`);
console.log(`old ${A.width}x${A.height}  new ${B.width}x${B.height}`);
if (A.width !== B.width) {
  console.log("WIDTH CHANGED — not comparable column-wise");
}
if (A.height !== B.height) {
  console.log(`HEIGHT CHANGED by ${B.height - A.height}px`);
}

let best = null;
for (let dy = -4; dy <= 4; dy += 1) {
  const r = compare(A, B, dy);
  if (!best || r.changed < best.changed) best = { dy, ...r };
  console.log(`  offset ${dy >= 0 ? "+" : ""}${dy}: ${r.changed} changed px`);
}
const total = Math.min(A.width * A.height, B.width * B.height);
console.log(`BEST offset ${best.dy >= 0 ? "+" : ""}${best.dy} -> ${best.changed} px (${((best.changed / total) * 100).toFixed(3)}%)`);
const aligned = compare(A, B, 0);
console.log(
  `PLAYWRIGHT-EQUIVALENT (pixelmatch YIQ, threshold 0.2, offset 0): ${aligned.pmChanged} px ` +
    `-> maxDiffPixels:200 verdict = ${aligned.pmChanged > 200 ? "FAIL (visible to the suite)" : "PASS (MASKED by the threshold)"}`,
);
if (best.box) {
  console.log(`bbox x[${best.box.minX}..${best.box.maxX}] y[${best.box.minY}..${best.box.maxY}]`);
  // Collapse contiguous changed rows into bands.
  const bands = [];
  for (const [y] of best.rows) {
    const last = bands[bands.length - 1];
    if (last && y - last[1] <= 3) last[1] = y;
    else bands.push([y, y]);
  }
  console.log(`bands(y): ${bands.map(([s, e]) => `${s}-${e}`).join(", ")}`);
} else {
  console.log("IDENTICAL at best offset");
}
