/** QA round 3 — assemble `reports/qa/phase-08.md`: the round-3 body, then the
 *  round-2 report exactly as it was written, which already carries round 1 in
 *  its own §15. Nothing in the preserved text is edited. */
import { readFileSync, writeFileSync } from "node:fs";

const body = readFileSync("reports/qa/phase-08/r3/round3-body.md", "utf8");
const previous = readFileSync("reports/qa/phase-08.md", "utf8");

if (previous.startsWith("# QA Report — Phase 08 · ROUND 3")) {
  throw new Error("phase-08.md is already the round-3 report; refusing to nest it");
}
const marker = "# QA Report — Phase 08 · ROUND 2";
if (!previous.startsWith(marker)) throw new Error("phase-08.md does not start with the round-2 header");

writeFileSync("reports/qa/phase-08.md", `${body.trimEnd()}\n\n${previous.trimEnd()}\n`);
console.log(`written: ${body.split("\n").length} round-3 lines + ${previous.split("\n").length} preserved lines`);
