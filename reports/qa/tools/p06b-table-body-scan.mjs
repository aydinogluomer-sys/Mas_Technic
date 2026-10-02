#!/usr/bin/env node
/**
 * QA-owned scanner for the ONE claim carrier the widened gate still cannot see:
 * a data TABLE BODY.
 *
 * `scripts/claims-gate.mjs` reads a spec row as a claim only when it is written
 * as an object literal — `LABEL_VALUE_CLAIM` matches `{ label: "Sertifika",
 * value: "EN 1090" }`. A `contentTables` entry is not written that way. It is
 * `{ title, headers: [...], rows: [[...], [...]] }`, so the column HEADING that
 * gives a cell its meaning sits in a different array from the cell, and the
 * gate's sentence scoping (which breaks on `"` + `,`) deliberately treats
 * adjacent array entries as unrelated claims.
 *
 * That is the right call for prose. It is the wrong call for a matrix, where
 * the header IS the predicate: under a column headed "Sertifika", the cell
 * `EN 10204 3.1` asserts "the certificate you get is EN 10204 3.1".
 *
 * The Coder found this class once (the DFM case-study table body) and fixed it.
 * This tool checks whether it found all of them.
 *
 * Usage: node reports/qa/tools/p06b-table-body-scan.mjs [file...]
 */
import { readFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const FILES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["src/data/servicePages.ts", "src/data/technicalLandingData.ts", "src/data/materialsData.ts", "src/data/categoryPages.ts", "src/data/blogData.ts"];

/** Column headings whose cells are, by definition, an attestation or a conformity claim. */
const CLAIM_HEADER = /sertifika|belge|standart|akredit|uygunluk|onay|test raporu|rapor/i;

/** Same generic standard-shaped token the gate uses. */
const STANDARD_TOKEN =
  /\b(?:TS\s+)?(?:EN\s+)?(?:ISO|IEC|EN|DIN|ASTM|ASME|AWS|AMS|SAE|API|NAS|BS|JIS|MIL|NACE|NF|UNI|GOST|AQAP|OHSAS|IATF|NADCAP|AS|CFR|MDR)[\s/-]?(?:IEC[\s/-]?)?(?:[A-Z]{1,3}[- ]?)?\d{1,6}[A-Z]{0,3}(?:[.\-–/][0-9A-Za-z]{1,4})*\b/g;
const ALLOWED = [/^ISO\s*9001(:\d{4})?$/i, /^ISO\s*14001(:\d{4})?$/i, /^OHSAS\s*18001(:\d{4})?$/i];
/** Attestation words that make a cell a claim even with no standard number. */
const ATTESTATION = /\bCoC\b|sertifikal|belgeli|akredite|3\.1|3\.2/i;

const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

let findings = 0;
for (const rel of FILES) {
  const abs = resolve(REPO, rel);
  let src;
  try {
    src = readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  // `headers: [ ... ]` followed by `rows: [ ... ]`, non-greedy to the closing
  // `],` of rows. Comment blocks are blanked first so a removed table recorded
  // in a `/* … */` ledger does not resurface as a finding.
  const blanked = src.replace(/\/\*[\s\S]*?\*\//g, (b) => b.replace(/[^\n]/g, " "));
  const re = /headers:\s*\[([^\]]*)\]\s*,\s*rows:\s*\[([\s\S]*?)\n\s*\],/g;
  let m;
  while ((m = re.exec(blanked)) !== null) {
    const headers = [...m[1].matchAll(/"([^"]*)"/g)].map((h) => h[1]);
    const claimCols = headers.map((h, i) => (CLAIM_HEADER.test(h) ? i : -1)).filter((i) => i !== -1);
    if (claimCols.length === 0) continue;

    const rowBlock = m[2];
    const rows = [...rowBlock.matchAll(/\[([^\]]*)\]/g)];
    const titleMatch = blanked.slice(Math.max(0, m.index - 400), m.index).match(/title:\s*"([^"]*)"[^"]*$/);
    const title = titleMatch ? titleMatch[1] : "(untitled table)";

    for (const row of rows) {
      const cells = [...row[1].matchAll(/"([^"]*)"/g)].map((c) => c[1]);
      for (const col of claimCols) {
        const cell = cells[col];
        if (!cell) continue;
        const std = (cell.match(STANDARD_TOKEN) ?? []).filter((t) => !ALLOWED.some((a) => a.test(t.replace(/\s+/g, " ").trim())));
        const attest = ATTESTATION.test(cell);
        if (std.length === 0 && !attest) continue;
        findings += 1;
        const line = lineOf(blanked, m.index + m[1].length + row.index);
        console.log(
          `${relative(REPO, abs).replace(/\\/g, "/")}:~${line}  table="${title}"  column="${headers[col]}"  cell="${cell}"` +
            (std.length ? `  [unheld standard: ${std.join(", ")}]` : "  [attestation word]"),
        );
      }
    }
  }
}

console.log("");
console.log(
  findings === 0
    ? "TABLE-BODY SCAN: clean — no certificate/standard column asserts an unheld attestation."
    : `TABLE-BODY SCAN: ${findings} cell(s) assert an attestation under a certificate/standard column heading.`,
);
process.exit(findings === 0 ? 0 : 1);
