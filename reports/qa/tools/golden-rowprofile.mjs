/* QA tool — per-band meaningful-diff profile, top-aligned.
 *   node golden-rowprofile.mjs <old.png> <new.png> [bandRows]
 * Prints, for each band of `bandRows` rows, the % of pixels differing by
 * >= 16/255, so the regions that actually repainted can be located.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const [, , oldPath, newPath, bandRowsArg = "100"] = process.argv;
const a = PNG.sync.read(readFileSync(oldPath));
const b = PNG.sync.read(readFileSync(newPath));
const W = Math.min(a.width, b.width);
const H = Math.min(a.height, b.height);
const BAND = Number(bandRowsArg);

for (let top = 0; top < H; top += BAND) {
  const bottom = Math.min(H, top + BAND);
  let bad = 0;
  let seen = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < W; x++) {
      const ia = (y * a.width + x) * 4;
      const ib = (y * b.width + x) * 4;
      const m = Math.max(
        Math.abs(a.data[ia] - b.data[ib]),
        Math.abs(a.data[ia + 1] - b.data[ib + 1]),
        Math.abs(a.data[ia + 2] - b.data[ib + 2]),
      );
      seen++;
      if (m >= 16) bad++;
    }
  }
  const pct = (bad / seen) * 100;
  const bar = "#".repeat(Math.round(pct / 2));
  console.log(`${String(top).padStart(5)}-${String(bottom).padStart(5)}  ${pct.toFixed(1).padStart(5)}%  ${bar}`);
}
