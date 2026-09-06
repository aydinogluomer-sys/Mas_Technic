#!/usr/bin/env node
/**
 * QA 09a-R4 ITEM 4 — the new and widened rules, in BOTH directions.
 *
 * 09a-C4 took the gate from 244 to 262 controls by widening `kazanç` to
 * `kazan[çc]`, adding detector (D) (`CAD_VAGUE_SCOPE`), adding `Mastercam` to
 * `named-enterprise-system`, and replacing two byte-exact pins with parsers.
 * The tree passing proves the widenings do not fire on anything that is IN the
 * tree. It does not prove they only fire on what they were meant to catch.
 *
 * This feeds each rule strings it was NOT written against, through the gate's
 * own control harness (see the `inject-probe-controls` mutation), and prints
 * FIRES / SILENT for each. Nothing on disk is changed: the gate source is
 * rewritten in an ESM `load` hook.
 *
 * `expect` is what I claim the rule should do. A row where `actual` disagrees
 * with `expect` is a finding — over-catch if it fires and should not, a hole if
 * it does not fire and should.
 */
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @type {{ id: string, rule: string, file?: string, text: string, expect: "FIRES"|"SILENT", why: string }[]} */
const PROBES = [
  /* ── kazan[çc] — the widened noun. The rule turns on the NUMBER. ────── */
  { id: "K1", rule: "delivery-or-quality-rate", expect: "FIRES",
    text: '"%40 kazanç sağlar"', why: "unsourced benefit percentage, softened suffix absent" },
  { id: "K2", rule: "delivery-or-quality-rate", expect: "FIRES",
    text: '"yüzde 40 kazancı elde edilir"', why: "worded percentage + softened suffix" },
  { id: "K3", rule: "delivery-or-quality-rate", expect: "FIRES",
    text: '{ label: "Zaman Kazancı", value: "%20" },', why: "label/value, softened suffix" },
  { id: "K4", rule: "delivery-or-quality-rate", expect: "SILENT",
    text: '"Kazançlı bir tasarım kararıdır."', why: "no number anywhere: ordinary Turkish" },
  { id: "K5", rule: "delivery-or-quality-rate", expect: "SILENT",
    text: '"Kazan çeliği işleme kabiliyeti"', why: "kazan + separate word: boiler steel, not a benefit" },
  { id: "K6", rule: "delivery-or-quality-rate", expect: "SILENT",
    text: '"Kazancı ustalığı geleneği 40 yıldır sürüyor."',
    why: "kazancı = boilermaker (a trade), and 40 carries no % — a plausible over-catch" },
  { id: "K7", rule: "delivery-or-quality-rate", expect: "FIRES",
    text: '"%15 kazancın ötesinde"', why: "another inflection of the softened stem, with a number" },

  /* ── detector (D) — the vague-scope intake offer, no format token. ──── */
  { id: "D1", rule: "cad-format-list-not-derived", expect: "FIRES",
    text: '"Yaygın CAD formatlarını doğrudan işleyebiliyoruz."', why: "the removed sentence, restored" },
  { id: "D2", rule: "cad-format-list-not-derived", expect: "FIRES",
    text: '"Her türlü dosyayı kabul ediyoruz."', why: "the same claim, maximally vague" },
  { id: "D3", rule: "cad-format-list-not-derived", expect: "FIRES",
    text: '"Piyasadaki bütün CAD formatlarını destekliyoruz."', why: "two quantifiers, one offer" },
  { id: "D4", rule: "cad-format-list-not-derived", expect: "SILENT",
    text: 'question: "Hangi dosya formatlarını destekliyorsunuz?",', why: "a question is not an offer" },
  { id: "D5", rule: "cad-format-list-not-derived", expect: "SILENT",
    text: '"Yaygın CAD formatları için ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır."',
    why: "vague scope with no offer predicate" },
  /* THE ONE I EXPECT TO BE WRONG. `yükleyebilirsiniz` is in the offer
     predicate and is exactly the verb a privacy or UX sentence about the
     visitor's OWN files uses. The gate's comment claims the offer predicate is
     what keeps detector (D) off `tüm dosyalarınız`; if this fires, that defence
     does not hold and the rule can over-catch on true, harmless copy. */
  { id: "D6", rule: "cad-format-list-not-derived", expect: "SILENT",
    text: '"Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz."',
    why: "about the visitor's own files and their privacy, not about accepted FORMATS" },
  { id: "D7", rule: "cad-format-list-not-derived", expect: "SILENT",
    text: '"Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz."',
    why: "the report WE deliver, the same distinction the Rapor Formatı control already draws" },

  /* ── named-enterprise-system — Mastercam. ────────────────────────────── */
  { id: "M1", rule: "named-enterprise-system", expect: "FIRES",
    text: '"CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam",', why: "the deleted string, restored" },
  { id: "M2", rule: "named-enterprise-system", expect: "FIRES",
    text: '"Mastercam ile takım yolu üretimi"', why: "the product name alone" },
  { id: "M3", rule: "named-enterprise-system", expect: "SILENT",
    text: '"Master plaka bağlama aparatı"', why: "word boundary must hold: Master is not Mastercam" },

  /* ── the two pins, now parsers. Quoting and spacing must be invisible,
        content must not be. Both are file-scoped, which is why these go
        through the control harness rather than through --also-scan. ─────── */
  { id: "P1", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "SILENT",
    text: 'const PUBLISHED_CAD_EXTENSIONS = [   "step" ,"stp",\n  "stl","obj","iges","igs" , "3mf" ] as const;',
    why: "whitespace mangled beyond A8: the pin parses, so this is not drift" },
  { id: "P1a", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "SILENT",
    text: 'const PUBLISHED_CAD_EXTENSIONS = [   "step" ,"stp",  "stl","obj","iges","igs" , "3mf" ] as const;',
    why: "SAME mangling as P1 but on ONE line — isolates whether the newline is what breaks it" },
  { id: "P1b", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "SILENT",
    text:
      'const PUBLISHED_CAD_EXTENSIONS = [\n  "step",\n  "stp",\n  "stl",\n' +
      '  "obj",\n  "iges",\n  "igs",\n  "3mf",\n] as const;',
    why: "exactly what Prettier writes when the line exceeds the print width" },
  { id: "P2", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "FIRES",
    text: 'const PUBLISHED_CAD_EXTENSIONS = ["stp", "step", "stl", "obj", "iges", "igs", "3mf"] as const;',
    why: "REORDERED — element-wise and in order, so a swap must fire" },
  { id: "P3", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "FIRES",
    text: 'const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs"] as const;',
    why: "TRUNCATED — one short" },
  { id: "P4", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "FIRES",
    text: 'const PUBLISHED_CAD_EXTENSIONS = ["STEP", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;',
    why: "CASE changed — the comparison is exact, not folded" },
  { id: "P5", rule: "cad-format-list-not-derived", file: "src/data/technicalLandingData.ts", expect: "SILENT",
    text: "'STEP,  STP,\n  STL, OBJ, IGES, IGS ve 3MF dosyalarını teklif akışında doğrudan yükleyebilirsiniz.',",
    why: "single quotes and re-wrapped whitespace: the landing pin is \\s+ tolerant" },
  { id: "P6", rule: "cad-format-list-not-derived", file: "src/data/technicalLandingData.ts", expect: "FIRES",
    text: '"STEP, STP, STL, OBJ, IGES, IGS, 3MF ve DWG dosyalarını teklif akışında doğrudan yükleyebilirsiniz.",',
    why: "a refused format appended to the blessed prose" },

  /* ── the pin must not bless the rest of its own file (R3-2, A10/A11). ── */
  { id: "S1", rule: "cad-format-list-not-derived", file: "src/content/claims.ts", expect: "FIRES",
    text: 'const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;\n' +
      'export const NOTE = "Parasolid dosyalarını da kabul ediyoruz.";',
    why: "a valid pin must not hold an exemption open over a prose offer below it" },
  { id: "S2", rule: "cad-format-list-not-derived", file: "src/data/technicalLandingData.ts", expect: "FIRES",
    text: '"STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını teklif akışında doğrudan yükleyebilirsiniz.",\n' +
      'export const N = "Inventor dosyalarını da kabul ediyoruz.";',
    why: "same, on the rendered content file" },
];

/**
 * ONE PROBE PER GATE INVOCATION.
 *
 * A first version injected all probes at once and scraped the report. That was
 * WRONG on multi-line probes: the gate prints a control's text with only its
 * first line indented, so a scraper keyed on indentation truncates the capture
 * and the probe looks as though it fired when it did not. Three rows came back
 * MISMATCH for that reason and none of them was a real finding.
 *
 * The fix is to stop parsing. Each probe goes in ALONE, as a `silent` control,
 * and the only question asked of the output is whether the words "NEGATIVE
 * CONTROL FIRED" appear at all. There is nothing left to mis-parse.
 */
function runOne(probe) {
  const args = ["--import=./scripts/qa-probes/p09a4-gate-mutator.mjs", "scripts/claims-gate.mjs"];
  const env = {
    ...process.env,
    P09A4_MUTATION: "inject-probe-controls",
    P09A4_PROBE_AS: "silent",
    P09A4_PROBES: JSON.stringify([{ rule: probe.rule, file: probe.file, text: probe.text }]),
  };
  let out;
  try {
    out = execFileSync(process.execPath, args, { cwd: REPO_ROOT, encoding: "utf8", env });
  } catch (error) {
    out = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  }
  // The tree is green, so the ONLY thing that can turn this invocation red is
  // the one injected control. Anything else in the output is a probe bug and is
  // surfaced rather than swallowed.
  const fired = out.includes("NEGATIVE CONTROL FIRED");
  const other =
    out.includes("POSITIVE CONTROL DID NOT FIRE") ||
    out.includes("### derived-copy-drift") ||
    out.includes("### published-resource-integrity");
  return { fired, other };
}

let bad = 0;
let contaminated = 0;
console.log("# 09a-R4 - widened and new rules, both directions");
console.log("# one gate invocation per probe; a row marked MISMATCH is a finding:");
console.log("# over-catch if it FIRES and should not, a hole if it is SILENT and should not be.\n");
console.log("id  rule                            expect  actual  ok       why");
for (const p of PROBES) {
  const { fired, other } = runOne(p);
  const actual = fired ? "FIRES" : "SILENT";
  const ok = actual === p.expect;
  if (!ok) bad += 1;
  if (other) contaminated += 1;
  console.log(
    `${p.id.padEnd(3)} ${p.rule.padEnd(31)} ${p.expect.padEnd(7)} ${actual.padEnd(7)} ` +
      `${(ok ? "ok" : "MISMATCH").padEnd(8)}${other ? "[UNRELATED FAILURE IN RUN] " : ""}${p.why}`,
  );
}
console.log(`\n${PROBES.length} probes, ${bad} mismatch(es), ${contaminated} contaminated run(s).`);
process.exitCode = 0;
