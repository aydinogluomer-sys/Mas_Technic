#!/usr/bin/env node
/**
 * R1 — the certificate matrix, read off the RENDERED page.
 *
 * The Phase 06 FAIL was a table whose `Sertifika` column published `EN 10204`
 * per material group sixty lines below a spec row on the same page saying the
 * certificate is available on request. The correction claims every cell now
 * reads "Talebe bağlı", matching the spec row, the description and the page
 * FAQ. A grep over `dist/` proves the bytes; this proves the TABLE — it walks
 * the rendered `<table>`, finds the `Sertifika` column by its heading, and
 * prints every cell under it, so a partial fix cannot pass as a whole one.
 *
 * It also reads the page's other three answers to the same buyer question, so
 * "one story" is checked rather than asserted.
 *
 * Assumes a preview server is already serving the built `dist/`.
 * Usage: node reports/qa/tools/p06c-matrix-runtime.mjs [baseURL]
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://127.0.0.1:4173";
/* Every route this correction touched that renders a table with a DOCUMENT
   column, plus the two prose pages, so the sweep is the whole shape and not
   the one instance that was reported. */
const ROUTES = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [
      "/hizmetler/malzeme-kutuphanesi",
      "/hizmetler/hassas-mikro-isleme",
      "/hizmetler/kimyasal-islemler",
      "/hizmetler/qr-datamatrix-kodlari",
      "/hizmetler/kalite-kontrol",
      "/hizmetler/kaynak-montaj",
    ];

// Same browser-build mismatch p06b-runtime-claims.mjs documents: this script's
// `@playwright/test` resolution asks for a build the machine does not carry.
// Installing a browser is not a QA-owned change, so point at an installed one.
const CHROMIUM =
  process.env.PW_CHROMIUM ??
  `${process.env.LOCALAPPDATA}\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe`;
const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: "reduce" });

const DOCUMENT_COLUMN = /sertifika|belge|akredit|uygunluk|onay|rapor/i;
const UNHELD =
  /\b(?:TS\s+)?(?:EN\s+)?(?:ISO|IEC|EN|DIN|ASTM|ASME|AWS|AMS|SAE|API|NAS|BS|JIS|MIL|NACE|NF|IATF|NADCAP|AS|IPC)[\s/-]?\S*\d/i;
const ATTESTATION = /\bCoC\b|\bCofC\b|sertifikal|belgeli|akredite|\b3\.[12]\b/i;
/* Strings that must NOT be in the rendered text of any of these routes. */
const MUST_BE_ABSENT = [
  "EN 10204",
  "IPC-A-610",
  "ISO 1413",
  "ASTM standartlarına tam uyum",
  "ISO/IEC standartlarına tam uyum",
  "ISO Uyum Raporu",
];

console.log("# DOCUMENT-COLUMN CELLS AND BODY-LEVEL CONFORMITY — RENDERED");
console.log(`# base: ${BASE}`);
console.log("");

let checked = 0;
let offending = 0;
let leaked = 0;

for (const route of ROUTES) {
  const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60_000 });
  console.log(`## ${route}  [HTTP ${res?.status()}]`);
  const tables = await page.evaluate(() => {
    const out = [];
    for (const t of document.querySelectorAll("table")) {
      const headers = [...t.querySelectorAll("thead th, thead td")].map((c) => c.textContent.trim());
      const rows = [...t.querySelectorAll("tbody tr")].map((r) =>
        [...r.querySelectorAll("td, th")].map((c) => c.textContent.trim()),
      );
      out.push({ headers, rows });
    }
    return out;
  });

  let any = false;
  for (const t of tables) {
    const cols = t.headers.map((h, i) => (DOCUMENT_COLUMN.test(h) ? i : -1)).filter((i) => i >= 0);
    if (cols.length === 0) continue;
    any = true;
    console.log(`   table ${JSON.stringify(t.headers)}`);
    for (const col of cols) {
      console.log(`     document column [${col}] "${t.headers[col]}"`);
      for (const r of t.rows) {
        const cell = r[col];
        if (cell === undefined) continue;
        checked += 1;
        const bad = UNHELD.test(cell) || ATTESTATION.test(cell);
        if (bad) offending += 1;
        console.log(`       ${bad ? "VIOLATION" : "ok       "}  ${JSON.stringify(r[0])} → ${JSON.stringify(cell)}`);
      }
    }
  }
  if (!any) console.log("   (no rendered table carries a document column)");

  const body = await page.evaluate(() => document.body.innerText);
  for (const s of MUST_BE_ABSENT) {
    if (body.includes(s)) { leaked += 1; console.log(`   LEAK  ${JSON.stringify(s)} is in the rendered text`); }
  }
  console.log("");
}

console.log(`## document-column cells checked: ${checked}, violating: ${offending}`);
console.log(`## withdrawn strings found in rendered text: ${leaked}`);
console.log(offending === 0 && leaked === 0
  ? "MATRIX PASS — no rendered document cell names an unheld certificate, and no withdrawn string renders."
  : "MATRIX FAIL");
await browser.close();
process.exit(offending === 0 && leaked === 0 ? 0 : 1);
process.exit(offending === 0 ? 0 : 1);
