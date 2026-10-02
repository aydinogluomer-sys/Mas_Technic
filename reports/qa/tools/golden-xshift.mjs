/* QA tool — horizontal shift probe over a row band.
 *   node golden-xshift.mjs <old.png> <new.png> <y0> <y1>
 * Finds the x offset in [-8,8] that minimises meaningful (>=16/255) diff.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldPath, newPath, y0s, y1s] = process.argv;
const a = PNG.sync.read(readFileSync(oldPath));
const b = PNG.sync.read(readFileSync(newPath));
const y0 = Number(y0s);
const y1 = Number(y1s);
const W = Math.min(a.width, b.width);

for (let off = -8; off <= 8; off++) {
  let bad = 0;
  let seen = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < W; x++) {
      const xb = x + off;
      if (xb < 0 || xb >= b.width) continue;
      const ia = (y * a.width + x) * 4;
      const ib = (y * b.width + xb) * 4;
      const m = Math.max(
        Math.abs(a.data[ia] - b.data[ib]),
        Math.abs(a.data[ia + 1] - b.data[ib + 1]),
        Math.abs(a.data[ia + 2] - b.data[ib + 2]),
      );
      seen++;
      if (m >= 16) bad++;
    }
  }
  console.log(`  x offset ${String(off).padStart(3)} : ${((bad / seen) * 100).toFixed(3)} %`);
}
