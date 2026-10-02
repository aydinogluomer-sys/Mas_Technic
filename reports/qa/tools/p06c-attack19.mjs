#!/usr/bin/env node
/**
 * QA-owned adversarial harness #2 for `scripts/claims-gate.mjs` (Phase 06,
 * correction packet #2 re-verification).
 *
 * `p06b-gate-evasion.mjs` is now 58/58 against the corrected gate, so it no
 * longer discriminates. This file is the SECOND attack: it goes after the
 * shapes the correction introduced or left, and it accepts MULTI-LINE probes so
 * a `comparisonTables` block — the shape of blind spot 2 — can be attacked as
 * the structure it actually is.
 *
 *   expect: "CATCH"  — the claim renders and must fire.
 *   expect: "PASS"   — legitimate engineering copy; firing is over-removal,
 *                      which §0 PUBLIC_POSITIONING_PRIORITY makes a real cost.
 *
 * Usage: node reports/qa/tools/p06c-attack19.mjs [--gate <path>] [--verbose]
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const argv = process.argv.slice(2);
const gateArg = argv.indexOf("--gate");
const GATE = gateArg === -1 ? join(REPO, "scripts/claims-gate.mjs") : resolve(argv[gateArg + 1]);
const VERBOSE = argv.includes("--verbose");

const BS = String.fromCharCode(92); // a real backslash, so the probe file carries a JS escape

/** @type {{id:string,group:string,expect:"CATCH"|"PASS",why:string,src:string}[]} */
const PROBES = [
  /* ── F — lexical evasions the normaliser does NOT cover ──────────────── */
  { id: "F1", group: "lexical", expect: "CATCH",
    why: "JS unicode escape splits the token in SOURCE only; the string renders as `AS9100D`",
    src: `export const f1 = "A${BS}u00539100D belgemiz vardır.";` },
  { id: "F2", group: "lexical", expect: "CATCH",
    why: "JS hex escape, same shape; renders as `AS9100D`",
    src: `export const f2 = "A${BS}x539100D sertifikamız bulunmaktadır.";` },
  { id: "F3", group: "lexical", expect: "CATCH",
    why: "homoglyph OUTSIDE the folded Cyrillic/Greek ranges — U+2160 ROMAN NUMERAL ONE for I",
    src: `export const f3 = "ⅠATF 16949 belgemiz vardır.";` },
  { id: "F4", group: "lexical", expect: "CATCH",
    why: "homoglyph outside the folded ranges — U+13DA CHEROKEE LETTER S renders as S",
    src: `export const f4 = "AᏚ9100D akreditasyonumuz mevcuttur.";` },
  { id: "F5", group: "lexical", expect: "CATCH",
    why: "control that the Turkish-I fold is not reversible: dotted I inside the claim word",
    src: `export const f5 = "NADCAP akredİtasyonumuz vardır.";` },

  /* ── G — the table rule's column vocabulary is a fixed six-noun list ──── */
  { id: "G1", group: "table-column", expect: "CATCH",
    why: "DOCUMENT column under a SYNONYM header the six-noun list does not contain (`Kalite Kaydı`); the cell is a bare designation-free attestation",
    src: [
      `export const g1 = {`,
      `  title: "Süreç Çıktıları",`,
      `  headers: ["Süreç", "Kalite Kaydı"],`,
      `  rows: [`,
      `    ["Frezeleme", "CoC"],`,
      `    ["Tornalama", "CoC"],`,
      `  ],`,
      `};`,
    ].join("\n") },
  { id: "G2", group: "table-column", expect: "CATCH",
    why: "same synonym header, but the cell names an UNHELD DESIGNATION — the G1 shape with a number on it",
    src: [
      `export const g2 = {`,
      `  title: "Sektörel Teslimat",`,
      `  headers: ["Sektör", "Teslim Edilen Doküman"],`,
      `  rows: [`,
      `    ["Havacılık", "AS9100D uygunluk belgesi"],`,
      `  ],`,
      `};`,
    ].join("\n") },
  { id: "G3", group: "table-column", expect: "CATCH",
    why: "recognised DOCUMENT header, cell carries the attestation as an ADJECTIVE with no designation",
    src: [
      `export const g3 = {`,
      `  title: "Malzeme Matrisi",`,
      `  headers: ["Malzeme", "Sertifika"],`,
      `  rows: [`,
      `    ["Ti6Al4V", "Havacılık onaylı"],`,
      `  ],`,
      `};`,
    ].join("\n") },

  /* ── H — conformity semantics the body-level rule may still miss ─────── */
  { id: "H1", group: "conformity", expect: "CATCH",
    why: "conformity to an UNNAMED standards family — broader than naming one, and no body token to iterate",
    src: `export const h1 = "Uluslararası havacılık standartlarına göre üretim yapıyoruz.";` },
  { id: "H2", group: "conformity", expect: "CATCH",
    why: "third-party audit asserted with no certificate named at all",
    src: `export const h2 = "Kalite yönetim sistemimiz üçüncü taraf denetiminden başarıyla geçmiştir.";` },
  { id: "H3", group: "conformity", expect: "CATCH",
    why: "`normlarına uygun` instead of `standartlarına tam uyum` — same claim, different noun",
    src: `export const h3 = "ASTM normlarına uygun üretim yapıyoruz.";` },
  { id: "H4", group: "conformity", expect: "CATCH",
    why: "the body in the dative with a certification verb, no designation",
    src: `export const h4 = "AWS standartlarına göre belgelendirildik.";` },

  /* ── K — the new keyword-array exemption, attacked directly ──────────── */
  { id: "K1", group: "keyword-exemption", expect: "CATCH",
    why: "a certificate laundered through a keywords array — the exemption must be `unconditional-guarantee` ONLY",
    src: `export const k1 = { keywords: ["AS9100D belgemiz", "NADCAP akreditasyonumuz"], answer: "x" };` },
  { id: "K2", group: "keyword-exemption", expect: "CATCH",
    why: "a company-scale disclosure laundered through a keywords array",
    src: `export const k2 = { keywords: ["15.000 m² üretim alanı", "52 adet CNC tezgah"], answer: "x" };` },
  { id: "K3", group: "keyword-exemption", expect: "CATCH",
    why: "the guarantee word OUTSIDE a keywords array still fires",
    src: `export const k3 = "Tüm parçalarımıza koşulsuz garanti veriyoruz.";` },
  { id: "K4", group: "keyword-exemption", expect: "PASS",
    why: "the documented exemption itself: matcher-only input, rendered nowhere",
    src: `export const k4 = { keywords: ["garanti", "güvence", "iade"], answer: "x" };` },

  /* ── L — metaTitle pass ───────────────────────────────────────────────── */
  { id: "L1", group: "meta-title", expect: "CATCH",
    why: "R6: a designation NOBODY HAS INVENTED, parked in a metaTitle badge list with no verb",
    src: `export const l1 = { metaTitle: "Hassas İmalat | ISO 41822-7 | Mas Technic" };` },
  { id: "L2", group: "meta-title", expect: "CATCH",
    why: "R6: two of the four standards this packet removed, back in a metaTitle",
    src: `export const l2 = { metaTitle: "Petrol & Gaz | API 6A | NACE MR0175 | Mas Technic" };` },
  { id: "L3", group: "meta-title", expect: "PASS",
    why: "the documented two-entry reference class survives in a title (R4b)",
    src: `export const l3 = { metaTitle: "Genel Toleranslar | ISO 2768-m | Mas Technic" };` },
  { id: "L4", group: "meta-title", expect: "PASS",
    why: "a §C certificate in a title is held",
    src: `export const l4 = { metaTitle: "Kalite | ISO 9001 | Mas Technic" };` },

  /* ── M — false-positive controls for the NEW rules (over-removal costs) ─ */
  { id: "M1", group: "false-positive", expect: "PASS",
    why: "SPECIFICATION column naming the method spec that governs the row — the R4b class QA adjudicated correct to keep",
    src: [
      `export const m1 = {`,
      `  title: "Pasivasyon Yöntemleri",`,
      `  headers: ["Yöntem", "Standart"],`,
      `  rows: [`,
      `    ["Nitrik pasivasyon", "ASTM A967"],`,
      `    ["Çinko fosfat", "MIL-DTL-16232"],`,
      `    ["Radyografi", "EN ISO 17636"],`,
      `  ],`,
      `};`,
    ].join("\n") },
  { id: "M2", group: "false-positive", expect: "PASS",
    why: "DOCUMENT column whose cells describe the expectation instead of naming a document",
    src: [
      `export const m2 = {`,
      `  title: "Belge Beklentisi",`,
      `  headers: ["Sektör", "Belge Beklentisi"],`,
      `  rows: [`,
      `    ["Medikal", "Biyouyumlu malzeme kaydı"],`,
      `    ["Havacılık", "İzlenebilir malzeme kaydı"],`,
      `  ],`,
      `};`,
    ].join("\n") },
  { id: "M3", group: "false-positive", expect: "PASS",
    why: "the corrected matrix cell, verbatim from servicePages.ts",
    src: [
      `export const m3 = {`,
      `  title: "Tedarik Süresi ve Sertifika Matrisi",`,
      `  headers: ["Malzeme Grubu", "Standart Tedarik", "Acil Tedarik", "Sertifika", "Min. Sipariş"],`,
      `  rows: [`,
      `    ["Alüminyum (6061, 7075)", "Stokta", "Aynı gün", "Talebe bağlı", "1 kg"],`,
      `  ],`,
      `};`,
    ].join("\n") },
  { id: "M4", group: "false-positive", expect: "PASS",
    why: "a body named in the locative describing the part's dimensional family — the line QA said to keep",
    src: `export const m4 = "ANSI, DIN ve JIS standartlarında boru bağlantı parçaları üretiyoruz.";` },
  { id: "M5", group: "false-positive", expect: "PASS",
    why: "the shipped API 6A flange reference, verbatim shape",
    src: `export const m5 = "Boru bağlantı parçaları (API 6A flanş, hub) imal ediyoruz.";` },
  { id: "M6", group: "false-positive", expect: "PASS",
    why: "quality assurance as a DISCIPLINE, not a promise (D2's kept half)",
    src: `export const m6 = "Kalite güvencesi süreçlerimizi her partide uyguluyoruz.";` },
  { id: "M7", group: "false-positive", expect: "PASS",
    why: "material density with `sahiptir` — D3/D4 must not reach material prose",
    src: `export const m7 = "Çelik 7.85 g/cm³ yoğunluğa sahiptir.";` },
  { id: "M8", group: "false-positive", expect: "PASS",
    why: "delivery status and minimum order quantity in adjacent columns are not a stock tonnage claim (the 2c4b124 boundary)",
    src: [
      `export const m8 = {`,
      `  title: "Tedarik",`,
      `  headers: ["Malzeme", "Tedarik", "Acil", "Min. Sipariş"],`,
      `  rows: [`,
      `    ["Alüminyum", "Stokta", "Aynı gün", "1 kg"],`,
      `  ],`,
      `};`,
    ].join("\n") },

  /* ── N — the two claims 2c4b124 says it restored ─────────────────────── */
  { id: "N1", group: "restored-coverage", expect: "CATCH",
    why: "label/value pair split across two literals — one claim by construction",
    src: `export const n1 = { label: "Stok Malzeme", value: "Al 6061: 5.000 kg" };` },
  { id: "N2", group: "restored-coverage", expect: "CATCH",
    why: "`stoğu` softens the k; the k-only stem never matched it",
    src: `export const n2 = "Güvenlik stoğu (5.000 kg) sürekli tutulur.";` },
  { id: "N3", group: "restored-coverage", expect: "CATCH",
    why: "same softening, comma form",
    src: `export const n3 = "Güvenlik stoğu, 5.000 kg seviyesinde tutulmaktadır.";` },
];

/* ── run ─────────────────────────────────────────────────────────────────── */
const ROOT = join(tmpdir(), `claims-gate-p06c-${process.pid}`);
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(ROOT, "scripts"), { recursive: true });
mkdirSync(join(ROOT, "src/data"), { recursive: true });
mkdirSync(join(ROOT, "src/content"), { recursive: true });
mkdirSync(join(ROOT, "public"), { recursive: true });
copyFileSync(GATE, join(ROOT, "scripts/claims-gate.mjs"));
writeFileSync(join(ROOT, "src/content/claims.ts"), `href: "/belgeler/x.pdf", size: "PDF · 0 KB"\n`);

const lines = ["// QA probe file #2 — one probe per block.", ""];
/** @type {Map<number, typeof PROBES[number]>} */
const lineOfProbe = new Map();
for (const p of PROBES) {
  for (const l of p.src.split("\n")) {
    lines.push(l);
    lineOfProbe.set(lines.length, p);
  }
  lines.push(""); // blank separator, never attributed
}
writeFileSync(join(ROOT, "src/data/probe.ts"), lines.join("\n") + "\n", "utf8");

let out = "";
try {
  out = execFileSync(process.execPath, [join(ROOT, "scripts/claims-gate.mjs")], { encoding: "utf8", cwd: ROOT });
} catch (e) {
  out = (e.stdout ?? "") + (e.stderr ?? "");
}

/** probe id → [{rule, match}] */
const fired = new Map(PROBES.map((p) => [p.id, []]));
let currentRule = null;
for (const raw of out.split("\n")) {
  const ruleHeader = raw.match(/^### ([a-z-]+) — \d+/);
  if (ruleHeader) { currentRule = ruleHeader[1]; continue; }
  const hit = raw.match(/^\s{2}src\/data\/probe\.ts:(\d+): (?:\[([^\]]*)\])?/);
  if (hit && currentRule) {
    const probe = lineOfProbe.get(Number(hit[1]));
    if (probe) fired.get(probe.id).push({ rule: currentRule, match: hit[2] });
  }
}

let failures = 0;
const byGroup = new Map();
for (const p of PROBES) {
  const hits = fired.get(p.id);
  const caught = hits.length > 0;
  const ok = p.expect === "CATCH" ? caught : !caught;
  if (!ok) failures += 1;
  if (!byGroup.has(p.group)) byGroup.set(p.group, []);
  byGroup.get(p.group).push({ p, hits, caught, ok });
}

console.log("# CLAIMS-GATE ADVERSARIAL PROBE #2 — attack 19 hunt");
console.log(`# gate:   ${GATE}`);
console.log(`# probes: ${PROBES.length}`);
console.log("");
for (const [group, items] of byGroup) {
  const bad = items.filter((i) => !i.ok).length;
  console.log(`## ${group} — ${items.length - bad}/${items.length} as expected`);
  for (const i of items) {
    const seen = i.caught ? [...new Set(i.hits.map((f) => f.rule))].join(",") : "(silent)";
    console.log(`${i.ok ? "  ok " : "FAIL"} ${i.p.id.padEnd(4)} expect=${i.p.expect.padEnd(5)} ${seen}`);
    if (!i.ok || VERBOSE) {
      console.log(`       ${i.p.why}`);
      console.log(`       src: ${i.p.src.replace(/\n/g, " / ").slice(0, 170)}`);
    }
  }
  console.log("");
}
console.log(failures === 0 ? "PROBE PASS — every probe behaved as specified." : `PROBE FAIL — ${failures} probe(s) misbehaved.`);
rmSync(ROOT, { recursive: true, force: true });
process.exit(failures === 0 ? 0 : 1);
