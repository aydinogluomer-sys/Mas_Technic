/* PROBE 11 — decode golden PNGs and say what actually changed.
 * Node has no PNG decoder here, so decoding happens in the browser via
 * createImageBitmap + OffscreenCanvas, which is exact.
 *
 * Usage: node p11-golden-diff.mjs <pairsJsonFile>
 *   pairs: [{ name, a: <path-to-old-png>, b: <path-to-new-png> }]
 * Also supports single-image inspection: [{ name, b }]
 */
import { launch } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const pairs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const browser = await launch();
const c = await browser.newContext();
const page = await c.newPage();
await page.goto("about:blank");

await page.evaluate(() => {
  window.dec = async (b64) => {
    const blob = await (await fetch("data:image/png;base64," + b64)).blob();
    const bmp = await createImageBitmap(blob);
    const cv = new OffscreenCanvas(bmp.width, bmp.height);
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(bmp, 0, 0);
    return cx.getImageData(0, 0, bmp.width, bmp.height);
  };
  window.diff = async (ab, bb) => {
    const A = await window.dec(ab), B = await window.dec(bb);
    if (A.width !== B.width || A.height !== B.height) {
      return { sizeA: [A.width, A.height], sizeB: [B.width, B.height], mismatchSize: true };
    }
    let n = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
    const rowCount = new Array(A.height).fill(0);
    const samples = [];
    for (let y = 0; y < A.height; y++) {
      for (let x = 0; x < A.width; x++) {
        const i = (y * A.width + x) * 4;
        if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) {
          n++; rowCount[y]++;
          if (x < minx) minx = x; if (x > maxx) maxx = x;
          if (y < miny) miny = y; if (y > maxy) maxy = y;
          if (samples.length < 8) samples.push({ x, y, a: [A.data[i], A.data[i + 1], A.data[i + 2]], b: [B.data[i], B.data[i + 1], B.data[i + 2]] });
        }
      }
    }
    const rows = rowCount.map((v, y) => [y, v]).filter(([, v]) => v > 0);
    return {
      size: [A.width, A.height], changed: n,
      pctOfPixels: +(100 * n / (A.width * A.height)).toFixed(4),
      bbox: n ? [minx, miny, maxx, maxy] : null,
      changedRows: rows.length, rowSpans: rows.slice(0, 12), samples,
    };
  };
  /* Compare A shifted up by `dy` against B: the hypothesis "a 1px rule was
     removed and everything below it moved up by 1px" is falsifiable this way. */
  window.shiftDiff = async (ab, bb, dy) => {
    const A = await window.dec(ab), B = await window.dec(bb);
    const w = Math.min(A.width, B.width);
    const h = Math.min(A.height - dy, B.height);
    let n = 0; const samples = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = ((y + dy) * A.width + x) * 4, j = (y * B.width + x) * 4;
      if (A.data[i] !== B.data[j] || A.data[i + 1] !== B.data[j + 1] || A.data[i + 2] !== B.data[j + 2]) {
        n++;
        if (samples.length < 6) samples.push({ x, y, a: [A.data[i], A.data[i + 1], A.data[i + 2]], b: [B.data[j], B.data[j + 1], B.data[j + 2]] });
      }
    }
    return { sizeA: [A.width, A.height], sizeB: [B.width, B.height], comparedRows: h, dy,
             changed: n, pct: +(100 * n / (w * h)).toFixed(4), samples,
             rowAofOld0: Array.from(A.data.slice(0, 12)), rowBofNew0: Array.from(B.data.slice(0, 12)) };
  };

  /* Render the change mask so it can be looked at rather than argued about. */
  window.diffMask = async (ab, bb, dy = 0) => {
    const A = await window.dec(ab), B = await window.dec(bb);
    const w = Math.min(A.width, B.width), h = Math.min(A.height - dy, B.height);
    const cv = new OffscreenCanvas(w, h);
    const cx = cv.getContext("2d");
    const img = cx.createImageData(w, h);
    const rowCount = new Array(h).fill(0);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = ((y + dy) * A.width + x) * 4, j = (y * B.width + x) * 4, k = (y * w + x) * 4;
      const d = Math.abs(A.data[i] - B.data[j]) + Math.abs(A.data[i + 1] - B.data[j + 1]) + Math.abs(A.data[i + 2] - B.data[j + 2]);
      if (d > 0) { rowCount[y]++; img.data[k] = 255; img.data[k + 1] = 0; img.data[k + 2] = 0; img.data[k + 3] = 255; }
      else { img.data[k] = B.data[j] >> 2; img.data[k + 1] = B.data[j + 1] >> 2; img.data[k + 2] = B.data[j + 2] >> 2; img.data[k + 3] = 255; }
    }
    cx.putImageData(img, 0, 0);
    const blob = await cv.convertToBlob({ type: "image/png" });
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = ""; for (const b of buf) bin += String.fromCharCode(b);
    return { png: btoa(bin), rowProfile: rowCount.map((v, y) => [y, v]).filter(([, v]) => v > 0) };
  };

  window.scanImage = async (bb, needleRGB, tol) => {
    const B = await window.dec(bb);
    let n = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
    for (let y = 0; y < B.height; y++) for (let x = 0; x < B.width; x++) {
      const i = (y * B.width + x) * 4;
      if (Math.abs(B.data[i] - needleRGB[0]) <= tol && Math.abs(B.data[i + 1] - needleRGB[1]) <= tol && Math.abs(B.data[i + 2] - needleRGB[2]) <= tol) {
        n++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      }
    }
    return { size: [B.width, B.height], hits: n, bbox: n ? [minx, miny, maxx, maxy] : null };
  };
});

const out = {};
for (const p of pairs) {
  if (p.a && p.b && p.mask) {  // mask (optionally shifted by p.dy)
    const res = await page.evaluate(
      ([a, b, dy]) => window.diffMask(a, b, dy),
      [readFileSync(p.a).toString("base64"), readFileSync(p.b).toString("base64"), p.dy || 0],
    );
    writeFileSync(p.mask, Buffer.from(res.png, "base64"));
    out[p.name] = { mask: p.mask, changedRows: res.rowProfile.length, rowProfile: res.rowProfile };
  } else if (p.a && p.b && p.dy != null) {
    out[p.name] = await page.evaluate(
      ([a, b, dy]) => window.shiftDiff(a, b, dy),
      [readFileSync(p.a).toString("base64"), readFileSync(p.b).toString("base64"), p.dy],
    );
  } else if (p.a && p.b) {
    out[p.name] = await page.evaluate(
      ([a, b]) => window.diff(a, b),
      [readFileSync(p.a).toString("base64"), readFileSync(p.b).toString("base64")],
    );
  } else if (p.b && p.needle) {
    out[p.name] = await page.evaluate(
      ([b, needle, tol]) => window.scanImage(b, needle, tol),
      [readFileSync(p.b).toString("base64"), p.needle, p.tol ?? 6],
    );
  }
}
await c.close();
await browser.close();
if (process.env.QA_OUT) writeFileSync(process.env.QA_OUT, JSON.stringify(out, null, 1));
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
