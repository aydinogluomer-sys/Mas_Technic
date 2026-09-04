/* QA round 3 — turn any revision of scripts/claims-gate.mjs into an importable
   library. Everything above the "file walk" banner is pure definition and
   never touches REPO_ROOT, so the library is location-independent and the
   probe supplies the tree root explicitly. Deliberately NOT a whole-script
   copy: the Orchestrator's first H3 attempt copied the whole script, which
   resolved REPO_ROOT from its own location and reported "scanned: 0 files". */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const [, , inPath, outPath] = process.argv;
const src = readFileSync(inPath, "utf8");
const marker = src.indexOf("/* \u2500\u2500 file walk");
if (marker < 0) throw new Error("banner not found: " + inPath);
const head = src.slice(0, marker);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, head + "\nexport { RULES, normalise, blankComments, foldTurkishI, trPattern, ROOTS, EXCLUDE, EXT };\n", "utf8");
console.log(`${inPath} -> ${outPath} (${head.split("\n").length} lines of definition)`);
