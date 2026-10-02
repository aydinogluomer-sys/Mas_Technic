/* QA tool — crop a row band out of a PNG (and optionally downscale by an
 * integer factor) so it can be eyeballed.
 *   node golden-crop.mjs <in.png> <out.png> <y0> <y1> [scaleDivisor]
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , inPath, outPath, y0s, y1s, divs = "1"] = process.argv;
const src = PNG.sync.read(readFileSync(inPath));
const y0 = Math.max(0, Number(y0s));
const y1 = Math.min(src.height, Number(y1s));
const div = Math.max(1, Number(divs));

const w = Math.floor(src.width / div);
const h = Math.floor((y1 - y0) / div);
const out = new PNG({ width: w, height: h });

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const sx = x * div;
    const sy = y0 + y * div;
    const si = (sy * src.width + sx) * 4;
    const di = (y * w + x) * 4;
    out.data[di] = src.data[si];
    out.data[di + 1] = src.data[si + 1];
    out.data[di + 2] = src.data[si + 2];
    out.data[di + 3] = 255;
  }
}
writeFileSync(outPath, PNG.sync.write(out));
console.log(`${outPath}  ${w}x${h}  (rows ${y0}..${y1} of ${src.height}, /${div})`);
