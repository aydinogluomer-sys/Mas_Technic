/* QA 09a-R3 — falsification probe for the CAD type pin in src/content/claims.ts.
 *
 * Each attack mutates ONE production file in the working tree, runs BOTH
 * instruments (tsc over tsconfig.app.json, and scripts/claims-gate.mjs), then
 * restores the file byte-for-byte and asserts `git diff --quiet` before moving
 * on. Nothing mutated is ever committed; the harness aborts on a dirty tree.
 *
 * A hole is any attack where the PUBLISHED COPY and the VALIDATOR end up
 * disagreeing while both instruments report green.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CLAIMS = resolve(ROOT, "src/content/claims.ts");
const TECHLAND = resolve(ROOT, "src/data/technicalLandingData.ts");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });

const TUPLE = `const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;`;
const FORMATS = `export const CAD_UPLOAD_FORMATS = joinTurkishList(PUBLISHED_CAD_EXTENSIONS.map((ext) => ext.toUpperCase()));`;

const sh = (cmd) => {
  try {
    return { code: 0, out: execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};

const requireClean = (label) => {
  const r = sh("git diff --quiet");
  if (r.code !== 0) {
    throw new Error(`ABORT: working tree dirty at ${label}\n${sh("git status --porcelain").out}`);
  }
};

/** Replace exactly once; throw if the anchor is missing or ambiguous. */
const sub = (src, from, to) => {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`anchor appears ${n} times, expected 1: ${from.slice(0, 60)}`);
  return src.replace(from, to);
};

const ATTACKS = [
  {
    id: "A0-control-append-dwg",
    file: CLAIMS,
    why: "Control. The orchestrator's own probe: append a format. Both instruments must fire.",
    drift: "copy offers .dwg; validator refuses it",
    mutate: (s) => sub(s, TUPLE, TUPLE.replace(`"3mf"]`, `"3mf", "dwg"]`)),
  },
  {
    id: "A1-reorder-same-content",
    file: CLAIMS,
    why: "Reorder without changing content: swap step/stp. Same set, same length.",
    drift: "prose order only; copy still true",
    mutate: (s) => sub(s, TUPLE, TUPLE.replace(`["step", "stp",`, `["stp", "step",`)),
  },
  {
    id: "A2-shorten-drop-3mf",
    file: CLAIMS,
    why: "Change length in the other direction: remove one accepted format.",
    drift: "copy omits 3MF, which the uploader accepts",
    mutate: (s) => sub(s, TUPLE, TUPLE.replace(`, "3mf"]`, `]`)),
  },
  {
    id: "A3-case-change",
    file: CLAIMS,
    why: "Change case of one member.",
    drift: "extension form renders '.STEP'",
    mutate: (s) => sub(s, TUPLE, TUPLE.replace(`["step",`, `["STEP",`)),
  },
  {
    id: "A4-drop-as-const",
    file: CLAIMS,
    why: "Drop `as const`; the tuple degrades to string[].",
    drift: "pin can no longer compare element-wise",
    mutate: (s) => sub(s, TUPLE, TUPLE.replace(` as const;`, `;`)),
  },
  {
    id: "A5-widen-readonly-string-array",
    file: CLAIMS,
    why: "Keep `as const` but annotate as readonly string[] — a plausible 'make the red line go away' edit.",
    drift: "pin degrades to a content-free comparison",
    mutate: (s) =>
      sub(
        s,
        TUPLE,
        `const PUBLISHED_CAD_EXTENSIONS: readonly string[] = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;`,
      ),
  },
  {
    id: "A6-tuple-intact-derivation-appends-dwg",
    file: CLAIMS,
    why: "THE INTERESTING ONE. Leave the pinned tuple untouched; append a format in the DERIVATION.",
    drift: "published prose reads '... IGS, 3MF ve DWG'; validator refuses DWG",
    mutate: (s) =>
      sub(
        s,
        FORMATS,
        `export const CAD_UPLOAD_FORMATS = joinTurkishList([...PUBLISHED_CAD_EXTENSIONS.map((ext) => ext.toUpperCase()), "DWG"]);`,
      ),
  },
  {
    id: "A7-tuple-intact-derivation-truncates",
    file: CLAIMS,
    why: "Leave the pinned tuple untouched; truncate in the derivation.",
    drift: "published prose omits IGS and 3MF, which the uploader accepts",
    mutate: (s) =>
      sub(
        s,
        FORMATS,
        `export const CAD_UPLOAD_FORMATS = joinTurkishList(PUBLISHED_CAD_EXTENSIONS.slice(0, 5).map((ext) => ext.toUpperCase()));`,
      ),
  },
  {
    id: "A8-whitespace-only-reformat",
    file: CLAIMS,
    why: "Formatting-only change: drop the spaces after the commas. Content identical.",
    drift: "NONE — copy and validator still agree. Any FAIL here is a false positive.",
    expectNoDrift: true,
    mutate: (s) =>
      sub(s, TUPLE, `const PUBLISHED_CAD_EXTENSIONS = ["step","stp","stl","obj","iges","igs","3mf"] as const;`),
  },
  {
    id: "A9-single-quotes",
    file: CLAIMS,
    why: "Quote style change only. Content identical.",
    drift: "NONE — any FAIL here is a false positive.",
    expectNoDrift: true,
    mutate: (s) =>
      sub(s, TUPLE, `const PUBLISHED_CAD_EXTENSIONS = ['step', 'stp', 'stl', 'obj', 'iges', 'igs', '3mf'] as const;`),
  },
  {
    id: "A10-pinned-file-prose-offer",
    file: CLAIMS,
    why: "claims.ts is a PINNED file, so cadFormatScan replaces detectors (A) and (B) there. Add a prose OFFER of a rejected format, tuple untouched.",
    drift: "an exported sentence offers SolidWorks; the uploader refuses it",
    mutate: (s) =>
      sub(
        s,
        FORMATS,
        `export const CAD_UPLOAD_NOTE = "SolidWorks ve CATIA dosyalarini da dogrudan kabul ediyoruz.";\n${FORMATS}`,
      ),
  },
  {
    id: "A11-other-pinned-file-prose-offer",
    file: TECHLAND,
    why: "The SAME exemption on the OTHER pinned file — a real rendered content file. Append a prose offer of a rejected format.",
    drift: "a rendered data file offers SolidWorks; the uploader refuses it",
    mutate: (s) => `${s}\nexport const QA_PROBE_NOTE = "SolidWorks dosyalarini da dogrudan kabul ediyoruz.";\n`,
  },
];

/* Run a subset per invocation: the machine is 8 GB and one heavy process at a
   time, and a full sweep exceeds the harness timeout. Results are merged into
   pin-attacks.json across invocations. */
const only = process.argv.slice(2);
const selected = only.length === 0 ? ATTACKS : ATTACKS.filter((a) => only.some((p) => a.id.startsWith(p)));
if (selected.length === 0) throw new Error(`no attack matches ${only.join(",")}`);

const prior = (() => {
  try {
    return JSON.parse(readFileSync(resolve(OUT, "pin-attacks.json"), "utf8"));
  } catch {
    return [];
  }
})();
const results = prior.filter((r) => !selected.some((a) => a.id === r.id));
requireClean("start");

for (const a of selected) {
  const original = readFileSync(a.file, "utf8");
  let rec;
  try {
    writeFileSync(a.file, a.mutate(original), "utf8");
    const tsc = sh("npx tsc --noEmit -p tsconfig.app.json");
    const gate = sh("node scripts/claims-gate.mjs");
    rec = {
      id: a.id,
      file: a.file.slice(ROOT.length + 1).replace(/\\/g, "/"),
      why: a.why,
      drift: a.drift,
      expectNoDrift: a.expectNoDrift === true,
      tscExit: tsc.code,
      tscFirstError: (tsc.out.match(/^.*error TS\d+.*$/m) || ["(none)"])[0].trim(),
      gateExit: gate.code,
      gateVerdict: (gate.out.match(/^(PASS|FAIL).*$/m) || ["(none)"])[0].trim(),
      gateFirstHit: (gate.out.match(/^\s*(src|index|public)[^\n]*$/m) || ["(none)"])[0].trim(),
    };
    rec.caught = rec.tscExit !== 0 || rec.gateExit !== 0;
    rec.verdict = rec.expectNoDrift
      ? rec.caught
        ? "FALSE POSITIVE"
        : "ok (correctly silent)"
      : rec.caught
        ? `caught by ${[rec.tscExit !== 0 ? "tsc" : null, rec.gateExit !== 0 ? "gate" : null].filter(Boolean).join(" + ")}`
        : "*** HOLE — BOTH INSTRUMENTS GREEN ***";
  } finally {
    writeFileSync(a.file, original, "utf8");
  }
  requireClean(`after ${a.id}`);
  results.push(rec);
  console.log(`${rec.id.padEnd(42)} tsc=${rec.tscExit} gate=${rec.gateExit}  ${rec.verdict}`);
}

requireClean("end");
const order = new Map(ATTACKS.map((a, i) => [a.id, i]));
results.sort((x, y) => (order.get(x.id) ?? 99) - (order.get(y.id) ?? 99));
writeFileSync(resolve(OUT, "pin-attacks.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log("\nworking tree verified clean after every attack.");
