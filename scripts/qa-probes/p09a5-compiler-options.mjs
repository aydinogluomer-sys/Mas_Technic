/**
 * QA 09a-R5 item 1, part 5 — WHAT IS `verbatimModuleSyntax` ACTUALLY HOLDING UP,
 * AND WHAT HAPPENS ON A DIFFERENT TYPESCRIPT MAJOR?
 *
 * The gate's "no module edge" property has a single load-bearing compiler option.
 * `verbatimModuleSyntax` was introduced in TypeScript 5.0. `package.json` pins
 * `typescript: ^5.8.3`, so today it is present — but `^` admits 5.x only, and a
 * future 6.x, or a workspace that hoists a different copy, is one `npm install`
 * away. `transpileModule` does not reject unknown compiler options; it ignores
 * them.
 *
 * So the question is not "does 5.8.3 honour it" (it does) but "what is the
 * BLAST RADIUS if a compiler ignores it". Measured here by transpiling the same
 * four sources twice — once with the gate's exact options, once with the option
 * removed — and diffing the emitted text.
 *
 * Nothing in the repository is written and the gate is not modified; this calls
 * `typescript` directly with the two option sets.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ts = (await import("typescript")).default;

const GATE_OPTIONS = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  verbatimModuleSyntax: true,
  isolatedModules: true,
};
const WITHOUT = { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, isolatedModules: true };

const SOURCES = {
  "S1 explicit `import type`  (must be erased by both)": `import type { A } from "@/utils/cadUpload";\ndeclare const x: A;\nexport const y = 1;\n`,
  "S2 value-syntax import, binding used as a VALUE": `import { A } from "@/utils/cadUpload";\nexport const y = A;\n`,
  "S3 value-syntax import, binding used ONLY IN TYPE POSITION": `import { A } from "@/utils/cadUpload";\nexport const y: typeof A = 1 as never;\n`,
  "S4 side-effect-only import": `import "@/utils/cadUpload";\nexport const y = 1;\n`,
};

const emits = (src, opts) =>
  ts
    .transpileModule(src, { fileName: "claims.ts", reportDiagnostics: true, compilerOptions: opts })
    .outputText.includes("cadUpload");

console.log("# QA 09a-R5 — what verbatimModuleSyntax is holding up");
console.log(`# typescript ${ts.version}`);
console.log("");
console.log("source                                                       gate opts   without verbatim");
let divergences = 0;
for (const [id, src] of Object.entries(SOURCES)) {
  const a = emits(src, GATE_OPTIONS);
  const b = emits(src, WITHOUT);
  if (a !== b) divergences += 1;
  console.log(
    `${id.padEnd(60)} ${(a ? "SURVIVES" : "erased  ").padEnd(11)} ${b ? "SURVIVES" : "erased"}${a !== b ? "   <-- DIVERGES" : ""}`,
  );
}
console.log("");
console.log(`edge-preserving divergences between the two option sets: ${divergences}`);
console.log("");
console.log("Reading: an import that SURVIVES is one the emitted module must resolve from a temp");
console.log("directory, i.e. one that makes the gate fail closed. An import that is ERASED loads");
console.log("clean and the ledger is compared as if it had no edge at all.");

/* And the real ledger: what does the gate's own option set actually emit for it? */
const ledger = fileURLToPath(new URL("../../src/content/claims.ts", import.meta.url));
const out = ts.transpileModule(readFileSync(ledger, "utf8"), {
  fileName: ledger,
  reportDiagnostics: true,
  compilerOptions: GATE_OPTIONS,
});
const importLines = out.outputText.split("\n").filter((l) => /^\s*(import|export .* from|const .*=\s*await import)/.test(l));
console.log("");
console.log("## src/content/claims.ts, transpiled with the gate's own options");
console.log(`   diagnostics (errors): ${(out.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error).length}`);
console.log(`   surviving import/export-from statements in the emitted module: ${importLines.length}`);
for (const l of importLines) console.log(`     ${l.trim()}`);
console.log(`   emitted bytes: ${out.outputText.length}`);
