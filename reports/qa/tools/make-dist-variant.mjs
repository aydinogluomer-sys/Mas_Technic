#!/usr/bin/env node
/**
 * QA PHASE 02 RE-VERIFICATION — byte-level negative controls.
 *
 * Copies the real `dist/` into a scratch directory and applies ONE exact
 * string replacement inside the built landing stylesheet. Unlike the earlier
 * `make-negcontrol-dist.mjs` (which injects an extra <style> block, and so
 * also changes source order) this edits the rule IN PLACE, so the reproduced
 * defect keeps the same cascade position, media range and specificity the
 * original defect had. `dist/` and `src/` are never written.
 *
 *   node make-dist-variant.mjs <dest-dir> <find> <replace>
 */
import { cpSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const [dest, find, replace] = process.argv.slice(2);
if (!dest || !find || replace === undefined) {
  console.error("usage: make-dist-variant.mjs <dest-dir> <find> <replace>");
  process.exit(1);
}
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync("dist", dest, { recursive: true });

const assets = join(dest, "assets");
const sheets = readdirSync(assets).filter((f) => f.endsWith(".css"));
let hits = 0;
for (const sheet of sheets) {
  const p = join(assets, sheet);
  const css = readFileSync(p, "utf8");
  if (!css.includes(find)) continue;
  const count = css.split(find).length - 1;
  hits += count;
  writeFileSync(p, css.split(find).join(replace), "utf8");
  console.log(`patched ${sheet}: ${count} occurrence(s)`);
}
if (hits !== 1) {
  console.error(`EXPECTED exactly 1 occurrence, found ${hits} - refusing to trust this control.`);
  process.exit(1);
}
console.log(`variant written: ${dest}`);
