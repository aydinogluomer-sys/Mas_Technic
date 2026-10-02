/**
 * QA PHASE 09a — the decisive golden adjudication.
 *
 * `e2e/visual/shell-golden.spec.ts:65` screenshots `footer.tl-footer` itself,
 * and that footer is ONE component rendered identically on every route
 * (`footer-groups.ts` is untouched by this phase). So the rebank claim reduces
 * to a falsifiable statement about peers:
 *
 *   IF the only change is that `/teklif-al` stopped being a `paper` surface,
 *   THEN the NEW rfq footer must be pixel-identical to the footer goldens of
 *   routes that were ALREADY graphite and did not move this phase, and the OLD
 *   rfq footer must differ from those same peers by exactly the paper-only
 *   block at `src/styles/shell.css:506-517` — a 1px `border-top` and the
 *   `.tl-band-index` recolour.
 *
 * Anything else in the new baseline is an unexplained rebank.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const OLD_REF = process.argv[2] ?? "64d1a8b";

const fromGit = (ref, rel) =>
  PNG.sync.read(execFileSync("git", ["show", `${ref}:${rel}`], { cwd: REPO, maxBuffer: 1 << 28, encoding: "buffer" }));
const fromDisk = (rel) => PNG.sync.read(readFileSync(resolve(REPO, rel)));

function compare(a, b) {
  const W = Math.min(a.width, b.width);
  const H = Math.min(a.height, b.height);
  let n = 0;
  let firstRow = -1;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const ia = (y * a.width + x) * 4;
      const ib = (y * b.width + x) * 4;
      if (Math.max(
        Math.abs(a.data[ia] - b.data[ib]),
        Math.abs(a.data[ia + 1] - b.data[ib + 1]),
        Math.abs(a.data[ia + 2] - b.data[ib + 2]),
      ) >= 16) { n += 1; if (firstRow < 0) firstRow = y; }
    }
  }
  return { px: n, firstRow, sizes: `${a.width}x${a.height} / ${b.width}x${b.height}` };
}

for (const width of [375, 768, 1280, 1440]) {
  const rfq = `e2e/__golden__/win32/visual-${width}/shell-footer-rfq.png`;
  const newRfq = fromDisk(rfq);
  const oldRfq = fromGit(OLD_REF, rfq);
  console.log(`\n══ visual-${width} ══`);
  for (const peer of ["about", "journal", "service", "home", "notfound"]) {
    const rel = `e2e/__golden__/win32/visual-${width}/shell-footer-${peer}.png`;
    if (!existsSync(resolve(REPO, rel))) continue;
    const moved = execFileSync("git", ["diff", "--name-only", `${OLD_REF}..HEAD`, "--", rel], { cwd: REPO, encoding: "utf8" }).trim();
    const img = fromDisk(rel);
    const a = compare(newRfq, img);
    const b = compare(oldRfq, img);
    console.log(
      `  vs ${peer.padEnd(9)} (${moved ? "MOVED THIS PHASE" : "unmoved"})  ` +
      `NEW rfq: ${String(a.px).padStart(6)}px diff, first row ${a.firstRow}, ${a.sizes}   |   ` +
      `OLD rfq: ${String(b.px).padStart(6)}px diff, first row ${b.firstRow}, ${b.sizes}`,
    );
  }
}
