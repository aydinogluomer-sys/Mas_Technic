/**
 * QA 09a-R5 item 1 — ATTACK THE NEW LOADER.
 *
 * C5 replaced `await import("….ts")` (Node type stripping) with
 * `ts.transpileModule` + `verbatimModuleSyntax` + emit to `mkdtempSync(tmpdir())`.
 * The claim under test, from `claims-gate.mjs:857-865`:
 *
 *   "THE 'BARE NODE PROCESS' PROPERTY IS NOT TRADED AWAY — it is tightened.
 *    … any surviving import then has to resolve from a directory with no
 *    node_modules, no @/ alias and no relative neighbours. A value import of
 *    @/utils/cadUpload throws ERR_MODULE_NOT_FOUND exactly as it threw under
 *    type stripping, and so now does a relative one."
 *
 * Each case below is a fixture ledger fed to the REAL `checkDerivedCadCopy`
 * through the REAL loader. `expect` is what the gate must do; anything else is a
 * hole. Nothing on disk in the repository is written: fixtures go to
 * `mkdtempSync(tmpdir())` via the gate's own `writeFixtureLedger`.
 *
 * Usage: node --import=./scripts/qa-probes/p09a5-expose.mjs scripts/qa-probes/p09a5-loader-attacks.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const gate = await import(new URL("../claims-gate.mjs", import.meta.url).href);
const { checkDerivedCadCopy, writeFixtureLedger, EXPECTED_CAD_COPY } = gate;

const CORRECT =
  `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)};\n` +
  `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`;
const WRONG_FORMATS = `${EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS} ve DWG`;

/** Every case publishes CORRECT copy unless it says otherwise, so any "drift" is a misdiagnosis. */
const CASES = [
  {
    id: "L1  alias value import  (the documented property)",
    src: `import { CAD_ACCEPTED_EXTENSIONS } from "@/utils/cadUpload";\nvoid CAD_ACCEPTED_EXTENSIONS;\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L2  relative value import",
    src: `import { CAD_ACCEPTED_EXTENSIONS } from "../utils/cadUpload";\nvoid CAD_ACCEPTED_EXTENSIONS;\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L3  relative import of a file that EXISTS beside the fixture",
    // Written into the fixture's own temp dir: a genuine relative neighbour.
    neighbour: { name: "neighbour.mjs", body: 'export const X = "neighbour reached";\n' },
    src: `import { X } from "./neighbour.mjs";\nvoid X;\n${CORRECT}`,
    expect: "load",
    why: "the emitted module is written to a DIFFERENT temp dir from the fixture, so even a real neighbour must not resolve",
  },
  {
    id: "L4  bare node: builtin  (node:os)",
    src: `import { tmpdir } from "node:os";\nvoid tmpdir;\n${CORRECT}`,
    expect: "load",
    why: "a builtin needs no node_modules — if this loads, 'any surviving import throws ERR_MODULE_NOT_FOUND' is false",
  },
  {
    id: "L5  bare builtin without the node: prefix  (os)",
    src: `import { tmpdir } from "os";\nvoid tmpdir;\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L6  node: builtin used to COMPUTE the published string",
    src:
      `import { readFileSync } from "node:fs";\n` +
      `void readFileSync;\n` +
      `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)};\n` +
      `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`,
    expect: "load",
  },
  {
    id: "L7  dynamic import() of an alias, awaited at top level",
    src: `const m = await import("@/utils/cadUpload");\nvoid m;\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L8  createRequire escape hatch",
    src:
      `import { createRequire } from "node:module";\n` +
      `const require_ = createRequire(import.meta.url);\n` +
      `void require_;\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L9  bare package specifier that IS installed at the repo root (typescript)",
    src: `import ts from "typescript";\nvoid ts;\n${CORRECT}`,
    expect: "load",
    why: "the emitted module sits in tmp; if node walks up from tmp it finds nothing, but tmp is not always outside a node_modules ancestry",
  },
  {
    id: "L10 an absolute file: URL import of a real repo module",
    absoluteImport: true,
    expect: "load",
  },
  {
    id: "L11 import.meta.env, which Vite defines and Node does not",
    src:
      `export const CAD_UPLOAD_FORMATS = import.meta.env?.VITE_X ?? ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)};\n` +
      `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`,
    expect: "clean",
    why: "no import to resolve; the question is only whether Node and Vite agree on the VALUE",
  },
  {
    id: "L12 THE DIVERGENCE: a browser/Node conditional publishing the wrong string in the browser",
    src:
      `export const CAD_UPLOAD_FORMATS = typeof window === "undefined"\n` +
      `  ? ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)}\n` +
      `  : ${JSON.stringify(WRONG_FORMATS)};\n` +
      `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`,
    expect: "clean",
    why: "gate evaluates in Node (no window) -> correct; the browser evaluates the other branch -> '… ve DWG' is published",
  },
  {
    id: "L13 top-level throw",
    src: `throw new Error("boom");\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L14 top-level infinite side effect is NOT tested; a top-level process.exit is",
    src: `if (process.env.P09A5_NEVER === "1") process.exit(0);\n${CORRECT}`,
    expect: "clean",
    why: "top-level code in the ledger EXECUTES inside the gate process; this is the arbitrary-code surface",
  },
  {
    id: "L15 export { SomeType } under verbatimModuleSyntax",
    src: `type T = string;\nexport { type T };\n${CORRECT}`,
    expect: "clean",
    why: "an explicit `export { type T }` is erased; the un-annotated form is the one that must throw",
  },
  {
    id: "L16 export { SomeType } WITHOUT the type modifier",
    src: `type T = string;\nexport { T };\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L17 `import type` that is actually a value import in disguise (side-effect only)",
    src: `import "@/utils/cadUpload";\n${CORRECT}`,
    expect: "load",
  },
  {
    id: "L18 enum + namespace with CORRECT copy  (the R4-7 control's subject)",
    src: `export enum K { A, B }\nexport namespace N { export const v = 1; }\n${CORRECT}`,
    expect: "clean",
  },
  {
    id: "L19 enum with DRIFTED copy",
    src:
      `export enum K { A, B }\n` +
      `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(WRONG_FORMATS)};\n` +
      `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`,
    expect: "drift",
  },
  {
    id: "L20 a `declare module` augmentation",
    src: `declare module "x" { const y: number; }\n${CORRECT}`,
    expect: "clean",
  },
  {
    id: "L21 decorator syntax (needs experimentalDecorators)",
    src: `class C { @dec m() {} }\nfunction dec() {}\n${CORRECT}`,
    expect: "any",
    why: "recorded, not asserted: either answer is honest as long as it is not reported as drift",
  },
  {
    id: "L22 a getter that returns the right value once and the wrong one after",
    src:
      `let n = 0;\n` +
      `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)};\n` +
      `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n` +
      `void n;\n`,
    expect: "clean",
  },
];

function classify(problems) {
  if (problems.length === 0) return "clean";
  const kinds = [...new Set(problems.map((p) => p.kind))];
  return kinds.length === 1 ? kinds[0] : kinds.join("/");
}

const results = [];
for (const c of CASES) {
  let fixture;
  if (c.absoluteImport) {
    const dir = mkdtempSync(join(tmpdir(), "p09a5-abs-"));
    fixture = join(dir, "claims.ts");
    const target = new URL("../../src/utils/cadUpload.ts", import.meta.url).href;
    writeFileSync(fixture, `const m = await import(${JSON.stringify(target)});\nvoid m;\n${CORRECT}`, "utf8");
  } else if (c.neighbour) {
    const dir = mkdtempSync(join(tmpdir(), "p09a5-nb-"));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, c.neighbour.name), c.neighbour.body, "utf8");
    fixture = join(dir, "claims.ts");
    writeFileSync(fixture, c.src, "utf8");
  } else {
    fixture = writeFixtureLedger(c.src);
  }
  let got;
  let detail = "";
  try {
    const problems = await checkDerivedCadCopy(fixture);
    got = classify(problems);
    detail = problems[0]?.message?.slice(0, 200) ?? "";
  } catch (error) {
    got = "THREW";
    detail = `${error.name}: ${error.message.slice(0, 200)}`;
  }
  const ok = c.expect === "any" || got === c.expect;
  results.push({ id: c.id, expect: c.expect, got, ok, detail, why: c.why ?? "" });
}

console.log("# QA 09a-R5 — loader attacks on ts.transpileModule + tmp-dir import");
console.log("# every fixture publishes CORRECT copy unless the case says otherwise");
console.log("");
for (const r of results) {
  console.log(`${r.ok ? "HELD " : "HOLE "} ${r.id}`);
  console.log(`        expect=${r.expect}  got=${r.got}`);
  if (r.why) console.log(`        why:  ${r.why}`);
  if (r.detail) console.log(`        gate: ${r.detail.replace(/\s+/g, " ")}`);
}
const holes = results.filter((r) => !r.ok);
console.log("");
console.log(`RESULT: ${results.length - holes.length}/${results.length} held; ${holes.length} hole(s)`);
for (const h of holes) console.log(`  HOLE: ${h.id} — expected ${h.expect}, got ${h.got}`);

/* Leave nothing behind that this probe created outside the gate's own bookkeeping. */
for (const d of readdirSync(tmpdir()).filter((n) => n.startsWith("p09a5-"))) {
  try {
    rmSync(join(tmpdir(), d), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
