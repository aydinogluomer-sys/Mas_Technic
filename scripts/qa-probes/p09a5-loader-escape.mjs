/**
 * QA 09a-R5 item 1, part 2 — CAN A RUNTIME IMPORT GET PAST THE LOADER AT ALL?
 *
 * Part 1 (`p09a5-loader-attacks.mjs`) showed the builtin family resolves. This
 * asks the harder question: can the emitted module reach a NON-builtin, i.e. real
 * code the gate did not intend to run, and can it reach the REPOSITORY?
 *
 * `claims-gate.mjs:860` argues the emitted module is safe because it is written
 * "OUTSIDE the repository and deliberately: any surviving import then has to
 * resolve from a directory with no node_modules, no @/ alias and no relative
 * neighbours". Every one of those is a statement about the module's *location*.
 * An ABSOLUTE specifier does not consult the module's location.
 *
 * E1-E4 also separate the two Nodes: CI pins 20 (no type stripping), this box is
 * 26 (stripping on). If an escape works on one and not the other, the claim that
 * the loader gives "ONE code path on every Node" is narrower than stated.
 *
 * Usage: node --import=./scripts/qa-probes/p09a5-expose.mjs scripts/qa-probes/p09a5-loader-escape.mjs
 *        (and again with --no-experimental-strip-types)
 */
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const gate = await import(new URL("../claims-gate.mjs", import.meta.url).href);
const { checkDerivedCadCopy, writeFixtureLedger, EXPECTED_CAD_COPY } = gate;

const CORRECT =
  `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)};\n` +
  `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`;

/* A helper that is NOT a builtin, NOT in node_modules, and NOT beside the emitted
   module. It writes a witness so "did the edge resolve" is answered by the
   helper itself rather than by the absence of an error. */
const helperDir = mkdtempSync(join(tmpdir(), "p09a5-helper-"));
const witness = join(helperDir, "WITNESS");
const helperBody =
  `import { writeFileSync } from "node:fs";\n` +
  `writeFileSync(${JSON.stringify(witness)}, "reached", "utf8");\n` +
  `export const X = 1;\n`;
/* ONE HELPER PER CASE. ESM caches by URL, so importing the same helper twice
   runs the side effect once and makes the second case look "blocked" when it
   had in fact resolved. A probe that misreports a hole as a block is worse than
   no probe. */
for (const n of ["a", "b"]) writeFileSync(join(helperDir, `helper-${n}.mjs`), helperBody, "utf8");
writeFileSync(join(helperDir, "helper.ts"), `${helperBody}export type T = string;\n`, "utf8");

const url = (name) => pathToFileURL(join(helperDir, name)).href;
const repoLeaf = new URL("../../src/utils/cadUpload.ts", import.meta.url).href;

const CASES = [
  {
    id: "E1  absolute file: URL, static import of a .mjs helper",
    src: `import { X } from ${JSON.stringify(url("helper-a.mjs"))};\nvoid X;\n${CORRECT}`,
  },
  {
    id: "E2  absolute file: URL, dynamic import of a .mjs helper",
    src: `const m = await import(${JSON.stringify(url("helper-b.mjs"))});\nvoid m;\n${CORRECT}`,
  },
  {
    id: "E3  absolute file: URL of a .ts helper  (type stripping decides this one)",
    src: `const m = await import(${JSON.stringify(url("helper.ts"))});\nvoid m;\n${CORRECT}`,
  },
  {
    id: "E4  absolute file: URL of a REAL repository module",
    src: `const m = await import(${JSON.stringify(repoLeaf)});\nvoid m;\n${CORRECT}`,
  },
  {
    id: "E5  createRequire + require of an absolute path  (CJS, sidesteps ESM resolution)",
    src:
      `import { createRequire } from "node:module";\n` +
      `const r = createRequire(${JSON.stringify(pathToFileURL(join(helperDir, "x.cjs")).href)});\n` +
      `r(${JSON.stringify(join(helperDir, "helper.cjs").replace(/\\/g, "\\\\"))});\n${CORRECT}`,
    cjs: true,
  },
  {
    id: "E6  node:fs at module scope, reading the repository",
    src:
      `import { readFileSync } from "node:fs";\n` +
      `import { writeFileSync } from "node:fs";\n` +
      `writeFileSync(${JSON.stringify(witness)}, "reached", "utf8");\n` +
      `void readFileSync;\n${CORRECT}`,
  },
  {
    id: "E7  process.binding-free arbitrary side effect: child_process is importable",
    src: `import { execSync } from "node:child_process";\nvoid execSync;\n${CORRECT}`,
  },
];

writeFileSync(
  join(helperDir, "helper.cjs"),
  `require("node:fs").writeFileSync(${JSON.stringify(witness)}, "reached", "utf8");\nmodule.exports = {};\n`,
  "utf8",
);

const rows = [];
for (const c of CASES) {
  try {
    rmSync(witness, { force: true });
  } catch {
    /* ignore */
  }
  const fixture = writeFixtureLedger(c.src);
  let kind;
  let detail = "";
  try {
    const problems = await checkDerivedCadCopy(fixture);
    kind = problems.length === 0 ? "clean" : [...new Set(problems.map((p) => p.kind))].join("/");
    detail = problems[0]?.message ?? "";
  } catch (error) {
    kind = "THREW";
    detail = `${error.name}: ${error.message}`;
  }
  let reached = false;
  try {
    const { existsSync } = await import("node:fs");
    reached = existsSync(witness);
  } catch {
    /* ignore */
  }
  rows.push({ id: c.id, kind, reached, detail: detail.replace(/\s+/g, " ").slice(0, 180) });
}

console.log("# QA 09a-R5 — can a runtime import ESCAPE the temp-dir loader?");
console.log(`# node ${process.version}  execArgv=${JSON.stringify(process.execArgv)}`);
console.log("# 'reached' means the imported code ACTUALLY RAN inside the gate process.");
console.log("");
for (const r of rows) {
  console.log(`${r.kind === "clean" ? "RESOLVED" : "blocked "} ${r.id}   (code actually ran: ${r.reached ? "YES" : "n/a"})`);
  console.log(`         gate verdict on the ledger: ${r.kind}`);
  if (r.detail) console.log(`         ${r.detail}`);
}
console.log("");
console.log(`RESOLVED (no ERR_MODULE_NOT_FOUND, gate saw no problem): ${rows.filter((r) => r.kind === "clean").length}/${rows.length}`);
console.log(`CODE ACTUALLY EXECUTED inside the gate process: ${rows.filter((r) => r.reached).length}/${rows.length}`);
console.log(`LOADED CLEAN (gate saw no problem at all): ${rows.filter((r) => r.kind === "clean").map((r) => r.id.slice(0, 3).trim()).join(", ") || "none"}`);

rmSync(helperDir, { recursive: true, force: true });
