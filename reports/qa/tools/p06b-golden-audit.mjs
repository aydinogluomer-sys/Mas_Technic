#!/usr/bin/env node
/**
 * QA-owned golden adjudication for the Phase 06 re-verification (R6).
 *
 * `--update-snapshots` overwrites the evidence, so the only honest way to
 * review a regeneration is to decode BOTH blobs and say what changed. This
 * drives `png-diff.mjs`'s comparator over the whole golden set — the 21 files
 * the commit touched AND the ones it did not, because "the control group is
 * byte-identical" is a claim that has to be measured, not accepted.
 *
 * For every file it reports:
 *   raw   — exact channel difference at offset 0 (nothing rounded away)
 *   pm    — pixelmatch YIQ delta at Playwright's default threshold 0.2, i.e.
 *           what `maxDiffPixels: 200` actually sees
 *   dy    — the vertical offset in [-4..+4] that minimises the difference.
 *           +0 means repaint; anything else means the page moved.
 *   bbox  — the change bounding box, so a footer-word swap is distinguishable
 *           from a regression somewhere else on the page.
 *
 * Usage: node reports/qa/tools/p06b-golden-audit.mjs <old-golden-root> [new-golden-root]
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const OLD_ROOT = resolve(process.argv[2]);
const NEW_ROOT = resolve(process.argv[3] ?? join(REPO, "e2e/__golden__"));

/* ── decoder (same as png-diff.mjs; kept local so this tool stands alone) ── */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8 || interlace !== 0) throw new Error(`unsupported PNG bitDepth=${bitDepth}`);
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[rp]; rp += 1;
    const line = raw.subarray(rp, rp + stride); rp += stride;
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
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

const PM_MAX = 35215;
function yiqDelta(r1, g1, b1, a1, r2, g2, b2, a2) {
  const bl = (c, a) => 255 + (c - 255) * (a / 255);
  const R1 = bl(r1, a1), G1 = bl(g1, a1), B1 = bl(b1, a1);
  const R2 = bl(r2, a2), G2 = bl(g2, a2), B2 = bl(b2, a2);
  const y = 0.29889531 * (R1 - R2) + 0.58662247 * (G1 - G2) + 0.11448223 * (B1 - B2);
  const i = 0.59597799 * (R1 - R2) - 0.2741761 * (G1 - G2) - 0.32180189 * (B1 - B2);
  const q = 0.21147017 * (R1 - R2) - 0.52261711 * (G1 - G2) + 0.31114694 * (B1 - B2);
  return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
}

function compare(a, b, dy = 0) {
  const w = Math.min(a.width, b.width);
  let changed = 0, pmChanged = 0;
  let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1;
  let pmMinY = Infinity, pmMaxY = -1, pmMinX = Infinity, pmMaxX = -1;
  const rows = [];
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
        if (yiqDelta(a.data[ia], a.data[ia + 1], a.data[ia + 2], aa, b.data[ib], b.data[ib + 1], b.data[ib + 2], ba) > 0.2 * PM_MAX) {
          pmChanged += 1;
          if (y < pmMinY) pmMinY = y;
          if (y > pmMaxY) pmMaxY = y;
          if (x < pmMinX) pmMinX = x;
          if (x > pmMaxX) pmMaxX = x;
        }
      }
      if (d > 0) {
        rowChanged += 1; changed += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (rowChanged) rows.push(y);
  }
  return {
    changed, pmChanged, rows,
    box: maxX < 0 ? null : { minX, maxX, minY, maxY },
    pmBox: pmMaxY < 0 ? null : { minX: pmMinX, maxX: pmMaxX, minY: pmMinY, maxY: pmMaxY },
  };
}

function walk(root) {
  const out = [];
  const rec = (p) => {
    for (const e of readdirSync(p)) {
      const abs = join(p, e);
      if (statSync(abs).isDirectory()) rec(abs);
      else if (e.endsWith(".png")) out.push(relative(root, abs).replace(/\\/g, "/"));
    }
  };
  rec(root);
  return out.sort();
}

const oldFiles = new Set(walk(OLD_ROOT));
const newFiles = walk(NEW_ROOT);

console.log("# GOLDEN AUDIT — Phase 06 re-verification (R6)");
console.log(`# old: ${OLD_ROOT}`);
console.log(`# new: ${NEW_ROOT}`);
console.log(`# ${newFiles.length} golden(s); raw = exact channel diff, pm = pixelmatch YIQ @0.2 (what maxDiffPixels:200 sees)`);
console.log("");
console.log("file                                                  raw        pm     dy   maxDiffPixels:200  bbox(raw)                         pm-band(y)");

let changedCount = 0, identicalCount = 0, shiftCount = 0, maskedCount = 0;
for (const rel of newFiles) {
  if (!oldFiles.has(rel)) { console.log(`${rel.padEnd(52)} (new file, no baseline)`); continue; }
  const A = decodePng(readFileSync(join(OLD_ROOT, rel)));
  const B = decodePng(readFileSync(join(NEW_ROOT, rel)));
  const at0 = compare(A, B, 0);
  let best = { dy: 0, changed: at0.changed };
  for (let dy = -4; dy <= 4; dy += 1) {
    if (dy === 0) continue;
    const r = compare(A, B, dy);
    if (r.changed < best.changed) best = { dy, changed: r.changed };
  }
  if (at0.changed === 0) identicalCount += 1;
  else changedCount += 1;
  if (best.dy !== 0) shiftCount += 1;
  const verdict = at0.changed === 0 ? "identical" : at0.pmChanged > 200 ? "FAIL(seen)" : "PASS(MASKED)";
  if (at0.changed > 0 && at0.pmChanged <= 200) maskedCount += 1;
  const bbox = at0.box ? `x[${at0.box.minX}..${at0.box.maxX}] y[${at0.box.minY}..${at0.box.maxY}]` : "-";
  const pmb = at0.pmBox ? `y[${at0.pmBox.minY}..${at0.pmBox.maxY}] x[${at0.pmBox.minX}..${at0.pmBox.maxX}]` : "-";
  console.log(
    `${rel.padEnd(52)} ${String(at0.changed).padStart(9)} ${String(at0.pmChanged).padStart(7)}  ${(best.dy >= 0 ? "+" : "") + best.dy}  ${verdict.padEnd(17)} ${bbox.padEnd(33)} ${pmb}`,
  );
}
console.log("");
console.log(`changed: ${changedCount}   byte-identical: ${identicalCount}   minimising at a NON-ZERO offset: ${shiftCount}   masked by maxDiffPixels:200: ${maskedCount}`);
