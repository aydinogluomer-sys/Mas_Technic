#!/usr/bin/env node
/**
 * QA-owned batch driver for `png-diff.mjs` — Phase 06 R7.
 *
 * Walks every golden that Phase 06 regenerated, diffs the pre-phase blob
 * against the post-phase blob, and prints one line per file plus the row
 * bands that moved. Reads the OLD tree from a directory the caller has already
 * extracted with `git archive` (this script never touches git).
 *
 * Usage: node reports/qa/tools/golden-audit.mjs <old-golden-root> <new-golden-root>
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const [oldRoot, newRoot] = process.argv.slice(2);
const VIEWPORTS = ["visual-375", "visual-1280", "visual-1440"];
const FILES = [
  "landing-fullpage.png",
  "shell-footer-home.png",
  "shell-footer-about.png",
  "shell-footer-service.png",
  "shell-footer-rfq.png",
  "shell-footer-journal.png",
  "shell-footer-notfound.png",
];

for (const vp of VIEWPORTS) {
  for (const f of FILES) {
    const a = join(oldRoot, vp, f);
    const b = join(newRoot, vp, f);
    if (!existsSync(a) || !existsSync(b)) {
      console.log(`## ${vp}/${f}\nMISSING\n`);
      continue;
    }
    const r = spawnSync(
      process.execPath,
      ["reports/qa/tools/png-diff.mjs", a, b, `${vp}/${f}`],
      { encoding: "utf8" },
    );
    const lines = (r.stdout || r.stderr).split("\n").filter(
      (l) => !/^  offset /.test(l),
    );
    console.log(lines.join("\n"));
  }
}
