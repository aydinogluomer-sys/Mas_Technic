/* QA-owned. Crop a vertical slice out of a golden PNG for visual inspection.
   usage: node p03-golden-crop.cjs <src.png> <y0> <y1> <out.png> [scale] */
const fs = require("node:fs");
const { PNG } = require("playwright-core/lib/utilsBundle");

const [src, y0s, y1s, out, scaleS] = process.argv.slice(2);
const y0 = Number(y0s); const y1 = Number(y1s);
const scale = Number(scaleS ?? 1);
const A = PNG.sync.read(fs.readFileSync(src));
const h = Math.min(y1, A.height) - y0;
const ow = Math.max(1, Math.round(A.width / scale));
const oh = Math.max(1, Math.round(h / scale));
const B = new PNG({ width: ow, height: oh });
for (let y = 0; y < oh; y += 1) {
  for (let x = 0; x < ow; x += 1) {
    const sy = y0 + Math.min(h - 1, Math.round(y * scale));
    const sx = Math.min(A.width - 1, Math.round(x * scale));
    const si = (sy * A.width + sx) * 4;
    const di = (y * ow + x) * 4;
    B.data[di] = A.data[si];
    B.data[di + 1] = A.data[si + 1];
    B.data[di + 2] = A.data[si + 2];
    B.data[di + 3] = A.data[si + 3];
  }
}
fs.writeFileSync(out, PNG.sync.write(B));
console.log(`wrote ${out} ${ow}x${oh} from ${src} y ${y0}..${y0 + h}`);
