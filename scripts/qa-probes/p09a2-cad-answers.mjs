/**
 * QA 09a-R2 — characterise the CAD-format answer collision precisely.
 *
 * Three answers in the assembled pool respond to "what file formats do you
 * accept". One of them is false. This determines WHICH phrasings reach the
 * false one, so the defect can be reported with real exposure rather than a
 * single lucky probe.
 *
 * Ground truth is `CAD_ACCEPTED_EXTENSIONS` in src/utils/cadUpload.ts, which
 * `validateCadFile()` enforces at upload. Anything the pool claims outside
 * that set is a format the visitor will be REFUSED after being told yes.
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const SAFE_ENV = {
  VITE_SUPABASE_URL: "http://127.0.0.1:9",
  VITE_SUPABASE_PUBLISHABLE_KEY: "qa-probe-not-a-real-key",
  VITE_SUPABASE_PROJECT_ID: "qa-probe",
  MODE: "test", DEV: false, PROD: false,
};
async function load(rel, out) {
  const outfile = path.join(root, "scripts", "qa-probes", out);
  await build({
    entryPoints: [path.join(root, rel)], bundle: true, format: "esm", platform: "node",
    outfile, alias: { "@": path.join(root, "src") },
    define: { "import.meta.env": JSON.stringify(SAFE_ENV) }, logLevel: "error",
  });
  return import(pathToFileURL(outfile).href);
}

const { findBestFaqMatch, allFaqEntries } = await load("src/data/chatFaqData.ts", ".p09a2-cad.mjs");
const { CAD_ACCEPTED_EXTENSIONS } = await load("src/utils/cadUpload.ts", ".p09a2-cadutil.mjs");

const ACCEPTED = new Set(CAD_ACCEPTED_EXTENSIONS.map((e) => e.toLowerCase()));
console.log("GROUND TRUTH validateCadFile accepts: " + [...ACCEPTED].join(", "));
console.log("");

// Every format token the pool mentions anywhere.
const FORMAT_TOKENS = [
  "step", "stp", "stl", "obj", "iges", "igs", "3mf",
  "parasolid", "sldprt", "solidworks", "catpart", "catia", "prt", "nx",
  "dwg", "dxf", "pdf",
];

// Which pool entries answer the CAD-format question at all?
const cadEntries = allFaqEntries
  .map((e, i) => ({ i, ...e }))
  .filter((e) => /format/i.test(e.question) && /kabul|destek|y[üu]kle/i.test(e.question + e.answer));

console.log("POOL ENTRIES ANSWERING THE FORMAT QUESTION: " + cadEntries.length);
for (const e of cadEntries) {
  const claimed = FORMAT_TOKENS.filter((t) => new RegExp(`\\b\\.?${t}\\b`, "i").test(e.answer));
  const false_ = claimed.filter((t) => !ACCEPTED.has(t));
  console.log(`  #${e.i} Q: ${e.question}`);
  console.log(`      A: ${e.answer}`);
  console.log(`      claims: [${claimed.join(", ")}]`);
  console.log(`      NOT ACCEPTED BY validateCadFile: [${false_.join(", ") || "none"}] ` +
    (false_.length ? "  <-- FALSE" : "  <-- correct"));
  console.log("");
}

// Which phrasings land on which answer?
const PHRASINGS = [
  "Hangi dosya formatlarını kabul ediyorsunuz?",
  "hangi cad formatlarini kabul ediyorsunuz",
  "dosya formatı",
  "hangi formatlar",
  "catia dosyası", "catia", "catpart",
  "solidworks", "sldprt", "solidworks dosyası",
  "nx dosyası", "parasolid",
  "dwg", "dwg gönderebilir miyim", "dxf",
  "pdf teknik resim yükleyebilir miyim", "pdf çizim",
  "step dosyası", "stl yükleyebilir miyim",
  "çizim gönderebilir miyim",
];

const rows = [];
console.log("PHRASING -> WHICH ANSWER WINS");
for (const p of PHRASINGS) {
  const m = findBestFaqMatch(p);
  if (!m) { console.log(`  "${p}"  -> <no match, default reply>`); rows.push({ p, idx: null }); continue; }
  const idx = allFaqEntries.indexOf(m.entry);
  const claimed = FORMAT_TOKENS.filter((t) => new RegExp(`\\b\\.?${t}\\b`, "i").test(m.entry.answer));
  const false_ = claimed.filter((t) => !ACCEPTED.has(t));
  const verdict = false_.length ? `FALSE (promises ${false_.join("/")})` : "ok";
  console.log(`  "${p}"  -> #${idx} score ${m.score.toFixed(3)}  [${verdict}]`);
  rows.push({ p, idx, score: m.score, verdict, question: m.entry.question });
}

writeFileSync(path.join(root, "reports", "qa", "phase-09a-r2", "cad-answers.json"),
  JSON.stringify({ accepted: [...ACCEPTED], cadEntries, rows }, null, 2), "utf8");
