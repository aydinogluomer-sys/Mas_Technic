#!/usr/bin/env node
/**
 * QA-owned adversarial harness for `scripts/claims-gate.mjs` (Phase 06 re-verification).
 *
 * The Phase 06 FAIL was not "some strings survived" — it was that the gate
 * reported `PASS — 0` over a tree carrying them. So the re-verification cannot
 * be a grep: it has to attack the widened gate the same way the first review
 * attacked the narrow one.
 *
 * Each probe is ONE LINE of ordinary, publishable Turkish (or the exact source
 * spelling of a lexical evasion). The harness writes them into a throwaway tree
 * that contains nothing but the gate and the probe file, runs the gate as a
 * child process, and maps every reported violation back to its probe line.
 *
 *   expect: "CATCH"  — the claim must fire. Silence is a gate hole.
 *   expect: "PASS"   — the copy is legitimate. Firing is a false positive,
 *                      which matters just as much: a rule that cries wolf on
 *                      correct engineering copy gets switched off, and §0
 *                      PUBLIC_POSITIONING_PRIORITY puts PRECISION_ENGINEERING
 *                      first, so over-removal has a real cost.
 *
 * Usage:  node reports/qa/tools/p06b-gate-evasion.mjs [--gate <path>] [--verbose]
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

const ZWSP = "​";
const DOLLAR = "$";

/** @type {{id: string, group: string, expect: "CATCH"|"PASS", why: string, src: string}[]} */
const PROBES = [
  /* ── GROUP A — the eleven evasions the first review demonstrated ───────── */
  { id: "A1", group: "prior-evasion", expect: "CATCH", why: "quote SLA: window before quote vocabulary, words in between (this was live in dist as TeklifAl.tsx:1098)",
    src: `export const a1 = "Teklifinizi 24 saat içinde iletiyoruz.";` },
  { id: "A2", group: "prior-evasion", expect: "CATCH", why: "delivery rate written as a word, not the % glyph",
    src: `export const a2 = "Zamanında teslimat oranımız yüzde 98.";` },
  { id: "A3", group: "prior-evasion", expect: "CATCH", why: "team size as a bare count with no + suffix (§D TEAM_SIZE PRIVATE)",
    src: `export const a3 = "Ekibimizde 48 mühendis çalışıyor.";` },
  { id: "A4", group: "prior-evasion", expect: "CATCH", why: "facility size spelled 'metrekare' instead of the m² glyph",
    src: `export const a4 = "Üretim alanımız 15.000 metrekare.";` },
  { id: "A5", group: "prior-evasion", expect: "CATCH", why: "universal inspection with the verb ölçülür, not the noun ölçüm",
    src: `export const a5 = "Her parça CMM ile %100 ölçülür.";` },
  { id: "A6", group: "prior-evasion", expect: "CATCH", why: "universality via the synonym 'bütün'",
    src: `export const a6 = "Bütün siparişlerde muayene raporu verilir.";` },
  { id: "A7", group: "prior-evasion", expect: "CATCH", why: "token split by an empty ${} interpolation",
    src: "export const a7 = `AS" + DOLLAR + '{""}' + "9100D belgemiz vardır.`;" },
  { id: "A8a", group: "prior-evasion", expect: "CATCH", why: "token split by string concatenation ACROSS A NEWLINE (line 1 of 2)",
    src: `export const a8 = "AS" +` },
  { id: "A8b", group: "prior-evasion", expect: "CATCH", why: "…continuation line of A8; either line may carry the report",
    src: `  "9100D sertifikamız bulunmaktadır.";` },
  { id: "A9", group: "prior-evasion", expect: "CATCH", why: "token split by concatenation on one line",
    src: `export const a9 = "Belgelerimiz: " + "AS" + "9100" + "D" + " ve daha fazlası.";` },
  { id: "A10", group: "prior-evasion", expect: "CATCH", why: "facility size with the m² glyph written as an HTML entity",
    src: `export const a10 = "Üretim alanımız 15.000 m&#178; kapalı alandır.";` },
  { id: "A11", group: "prior-evasion", expect: "CATCH", why: "token split by a zero-width space",
    src: `export const a11 = "A${ZWSP}S9100D kalite belgemiz.";`.replace("${ZWSP}", ZWSP) },

  /* ── GROUP B — positive controls: these fired before and must still fire ── */
  { id: "B1", group: "positive-control", expect: "CATCH", why: "unheld certificate, plain", src: `export const b1 = "AS9100D belgemiz vardır.";` },
  { id: "B2", group: "positive-control", expect: "CATCH", why: "same, lower case", src: `export const b2 = "as9100d belgemiz vardır.";` },
  { id: "B3", group: "positive-control", expect: "CATCH", why: "NADCAP", src: `export const b3 = "NADCAP akreditasyonumuz mevcuttur.";` },
  { id: "B4", group: "positive-control", expect: "CATCH", why: "IATF 16949 (§C: NONE)", src: `export const b4 = "IATF 16949 sertifikamız vardır.";` },
  { id: "B5", group: "positive-control", expect: "CATCH", why: "fabricated report number (§G)", src: `export const b5 = "Rapor No: MT-2024-0512";` },
  { id: "B6", group: "positive-control", expect: "CATCH", why: "facility size, m² glyph", src: `export const b6 = "15.000 m² kapalı üretim alanı.";` },
  { id: "B7", group: "positive-control", expect: "CATCH", why: "machine count", src: `export const b7 = "52 adet CNC tezgah ile üretim.";` },
  { id: "B8", group: "positive-control", expect: "CATCH", why: "tolerance beyond ±0.01 mm", src: `export const b8 = "±0.005mm tolerans sağlıyoruz.";` },
  { id: "B9", group: "positive-control", expect: "CATCH", why: "same, unsigned with unit", src: `export const b9 = "0.005 mm hassasiyet.";` },

  /* ── GROUP C — R3: the allow-list property a deny-list cannot have ─────── */
  { id: "C1", group: "invented-standard", expect: "CATCH", why: "R3: INVENTED designation, conformity asserted — appears nowhere in the codebase",
    src: `export const c1 = "ISO 27893 standardına uygun üretim yapıyoruz.";` },
  { id: "C2", group: "invented-standard", expect: "CATCH", why: "R3: invented designation + certificate assertion",
    src: `export const c2 = "EN 4956-3 sertifikalı proseslerimiz bulunmaktadır.";` },
  { id: "C3", group: "invented-standard", expect: "CATCH", why: "R3: invented designation in a spec-table label/value pair",
    src: `export const c3 = { label: "Sertifika", value: "ASME B99.7" };` },
  { id: "C4", group: "invented-standard", expect: "CATCH", why: "R3: invented designation, accreditation asserted",
    src: `export const c4 = "MAS 1000 kapsamında akredite üretim tesisiyiz.";` },
  { id: "C5", group: "invented-standard", expect: "CATCH", why: "R3: attestation adjective with NO standard number at all",
    src: `export const c5 = "Sertifikalı kaynakçılarımız ile üretim yapıyoruz.";` },
  { id: "C6", group: "invented-standard", expect: "CATCH", why: "R3: 'belgeli' with no number",
    src: `export const c6 = "Belgeli operatör kadrosu ile çalışıyoruz.";` },
  { id: "C7", group: "invented-standard", expect: "CATCH", why: "R3: accreditation claim that is not the §D-authorised third-party CMM form",
    src: `export const c7 = "Akredite laboratuvarımızda ölçüm yapıyoruz.";` },

  /* ── GROUP D — new evasion attempts against the WIDENED gate ───────────── */
  { id: "D1", group: "new-attack", expect: "CATCH", why: "quote SLA where the return verb is conjugated (döneceğiz), not the noun dönüş",
    src: `export const d1 = "Dosyanızı inceleyip 24 saat içinde size döneceğiz.";` },
  { id: "D2", group: "new-attack", expect: "CATCH", why: "guarantee via güvence + possessive suffix, which the verb-anchored alternative does not reach",
    src: `export const d2 = "Teslimat güvencesi veriyoruz.";` },
  { id: "D3", group: "new-attack", expect: "CATCH", why: "conformity via 'kapsamında üretim', a phrase dropped from CONFORMITY_CONTEXT in cd6aa0f",
    src: `export const d3 = "EN 3475 kapsamında üretim yapıyoruz.";` },
  { id: "D4", group: "new-attack", expect: "CATCH", why: "conformity via 'sahibiz', also dropped from CONFORMITY_CONTEXT",
    src: `export const d4 = "EN 9120 yetkinliğine sahibiz.";` },
  { id: "D5", group: "new-attack", expect: "CATCH", why: "universal inspection smuggled past the new 'kontrol planında tanımlan' negative lookahead",
    src: `export const d5 = "Her sevkiyat, kontrol planında tanımlananların dışında da tam boyutsal muayeneden geçer.";` },
  { id: "D6", group: "new-attack", expect: "CATCH", why: "facility size with a spelled-out magnitude (15 bin)",
    src: `export const d6 = "15 bin metrekare kapalı üretim alanımız var.";` },
  { id: "D7", group: "new-attack", expect: "CATCH", why: "delivery rate with a spelled-out number",
    src: `export const d7 = "Zamanında teslimat oranımız yüzde doksan sekiz.";` },
  { id: "D8", group: "new-attack", expect: "CATCH", why: "ALLOW-LIST EXEMPTION ABUSE: attestation adjective parked on a line that also names a held certificate",
    src: `export const d8 = { title: "ISO 9001:2015", desc: "Sertifikalı kaynakçılarımız ile üretim" };` },
  { id: "D9", group: "new-attack", expect: "CATCH", why: "same abuse, unheld standard hidden behind an allow-listed one on the same line",
    src: `export const d9 = { a: "ISO 14001", b: "AS9100D belgeli üretim hattı" };` },
  { id: "D10", group: "new-attack", expect: "CATCH", why: "Cyrillic homoglyph А (U+0410) for Latin A — renders identically, not folded",
    src: `export const d10 = "АS9100D belgemiz vardır.";` },
  { id: "D11", group: "new-attack", expect: "CATCH", why: "uppercase claim relying on the Turkish dotless-I fold (the SiteFooter bug class)",
    src: `export const d11 = "GERÇEK VAKA ÇALIŞMALARIYLA KANITLANMIŞ TASARRUF.";` },
  { id: "D12", group: "new-attack", expect: "CATCH", why: "guarantee in uppercase heading form",
    src: `export const d12 = "TESLİMAT GARANTİSİ";` },
  { id: "D13", group: "new-attack", expect: "CATCH", why: "scale disclosure inside a ${} interpolation of a numeric literal",
    src: "export const d13 = `Ekibimizde " + DOLLAR + '{"48"}' + " mühendis çalışıyor.`;" },
  { id: "D14", group: "new-attack", expect: "CATCH", why: "quote SLA in the 'aynı gün' form",
    src: `export const d14 = "Teklifinizi aynı gün iletiyoruz.";` },
  { id: "D15", group: "new-attack", expect: "CATCH", why: "OEE-class fabricated metric",
    src: `export const d15 = "Genel OEE değerimiz 84.2%.";` },
  { id: "D16", group: "new-attack", expect: "CATCH", why: "quantified project outcome with no case study behind it (§G)",
    src: `export const d16 = "DFM analizi ile %40 maliyet tasarrufu sağlıyoruz.";` },
  { id: "D17", group: "new-attack", expect: "CATCH", why: "certifying body named",
    src: `export const d17 = "Belgelerimiz TÜV SÜD tarafından verilmiştir.";` },
  { id: "D18", group: "new-attack", expect: "CATCH", why: "NDA / retention claim (§J NDA_AVAILABLE: NO)",
    src: `export const d18 = "Talep üzerine gizlilik sözleşmesi imzalıyoruz.";` },

  /* ── GROUP E — FALSE-POSITIVE controls: legitimate engineering copy ────── */
  { id: "E1", group: "false-positive", expect: "PASS", why: "tolerance class named as a technical reference, no conformity asserted",
    src: `export const e1 = "Genel toleranslar ISO 2768-m sınıfındadır.";` },
  { id: "E2", group: "false-positive", expect: "PASS", why: "interface geometry named, not an audit",
    src: `export const e2 = "Sızdırmazlık yüzeyleri ASME B16.5 FF/RF geometrisinde işlenir.";` },
  { id: "E3", group: "false-positive", expect: "PASS", why: "test method named without a proven result",
    src: `export const e3 = "Korozyon direnci ASTM B117 tuz spreyi testi ile doğrulanır.";` },
  { id: "E4", group: "false-positive", expect: "PASS", why: "coating class named (MIL-A-8625 Type II)",
    src: `export const e4 = "Tip II sülfürik asit anodizasyon — MIL-A-8625 kaplama sınıfı.";` },
  { id: "E5", group: "false-positive", expect: "PASS", why: "a held certificate, said correctly (§C ISO 9001 VERIFIED / PUBLIC_OK)",
    src: `export const e5 = { title: "ISO 9001:2015", desc: "Kalite yönetim sistemi belgemiz" };` },
  { id: "E6", group: "false-positive", expect: "PASS", why: "the §D-authorised third-party CMM form, verbatim",
    src: `export const e6 = "Akredite üçüncü taraf CMM ölçümü talebe bağlı olarak sağlanır.";` },
  { id: "E7", group: "false-positive", expect: "PASS", why: "the CONDITIONING clause Phase 06 introduced — the opposite of a universal promise",
    src: `export const e7 = "Her partide, kontrol planında tanımlanan koteler ölçülür.";` },
  { id: "E8", group: "false-positive", expect: "PASS", why: "capability count that is not scale disclosure",
    src: `export const e8 = "5 eksen simültane işleme, 3 vardiya çalışma düzeni.";` },
  { id: "E9", group: "false-positive", expect: "PASS", why: "a document offered on request is a supply practice, not an audit claim",
    src: `export const e9 = "Malzeme sertifikası talebe bağlı olarak sağlanır.";` },
  { id: "E10", group: "false-positive", expect: "PASS", why: "published machinability ranking is a metallurgical fact",
    src: `export const e10 = "303 en iyi işlenebilir paslanmaz kalitedir.";` },
  { id: "E11", group: "false-positive", expect: "PASS", why: "the authorised quote SLA, published",
    src: `export const e11 = "Teklif dönüşü 1-3 iş günüdür.";` },
  { id: "E12", group: "false-positive", expect: "PASS", why: "a physical constant, not a coverage claim (%100 IACS)",
    src: `export const e12 = "Elektrik iletkenliği %100 IACS referans değerindedir.";` },
];

/* ── run ─────────────────────────────────────────────────────────────────── */

const ROOT = join(tmpdir(), `claims-gate-probe-${process.pid}`);
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(ROOT, "scripts"), { recursive: true });
mkdirSync(join(ROOT, "src/data"), { recursive: true });
mkdirSync(join(ROOT, "public"), { recursive: true });
copyFileSync(GATE, join(ROOT, "scripts/claims-gate.mjs"));

// The gate also audits the claim ledger's published PDF sizes. That check is
// orthogonal to the rule table, so the probe tree carries a minimal ledger with
// no rows: it keeps `checkQualityResources` from drowning the rule output.
writeFileSync(join(ROOT, "src/content-placeholder.txt"), "");
mkdirSync(join(ROOT, "src/content"), { recursive: true });
writeFileSync(join(ROOT, "src/content/claims.ts"), `href: "/belgeler/x.pdf", size: "PDF · 0 KB"\n`);

const HEADER = ["// QA probe file — one claim per line.", ""];
const lines = [...HEADER];
/** @type {Map<number, typeof PROBES[number]>} */
const lineOfProbe = new Map();
for (const p of PROBES) {
  lines.push(p.src);
  lineOfProbe.set(lines.length, p);
}
writeFileSync(join(ROOT, "src/data/probe.ts"), lines.join("\n") + "\n", "utf8");

let out = "";
try {
  out = execFileSync(process.execPath, [join(ROOT, "scripts/claims-gate.mjs")], { encoding: "utf8", cwd: ROOT });
} catch (e) {
  out = (e.stdout ?? "") + (e.stderr ?? "");
}

/** line → [{rule, match}] */
const hits = new Map();
let currentRule = null;
for (const raw of out.split("\n")) {
  const ruleHeader = raw.match(/^### ([a-z-]+) — \d+/);
  if (ruleHeader) {
    currentRule = ruleHeader[1];
    continue;
  }
  // The pre-correction gate printed `file:line: text`; the widened one prints
  // `file:line: [match] text`. Accept both so the two can be compared.
  const hit = raw.match(/^\s{2}src\/data\/probe\.ts:(\d+): (?:\[([^\]]*)\])?/);
  if (hit && currentRule) {
    const n = Number(hit[1]);
    if (!hits.has(n)) hits.set(n, []);
    hits.get(n).push({ rule: currentRule, match: hit[2] });
  }
}

const rows = [];
for (const [line, probe] of lineOfProbe) {
  const fired = hits.get(line) ?? [];
  // A8 is one claim spread over two lines; the gate may report either.
  rows.push({ probe, fired });
}
const a8 = rows.filter((r) => r.probe.id.startsWith("A8"));
if (a8.some((r) => r.fired.length > 0)) for (const r of a8) r.fired = a8.flatMap((x) => x.fired);

let failures = 0;
const byGroup = new Map();
for (const r of rows) {
  const caught = r.fired.length > 0;
  const ok = r.probe.expect === "CATCH" ? caught : !caught;
  if (!ok) failures += 1;
  if (!byGroup.has(r.probe.group)) byGroup.set(r.probe.group, []);
  byGroup.get(r.probe.group).push({ ...r, ok, caught });
}

console.log("# CLAIMS-GATE ADVERSARIAL PROBE — Phase 06 re-verification");
console.log(`# gate:   ${GATE}`);
console.log(`# probes: ${rows.length}`);
console.log("");
for (const [group, items] of byGroup) {
  const bad = items.filter((i) => !i.ok).length;
  console.log(`## ${group} — ${items.length - bad}/${items.length} as expected`);
  for (const i of items) {
    const verdict = i.ok ? "  ok " : "FAIL";
    const seen = i.caught ? i.fired.map((f) => f.rule).join(",") : "(silent)";
    console.log(`${verdict} ${i.probe.id.padEnd(4)} expect=${i.probe.expect.padEnd(5)} ${seen}`);
    if (!i.ok || VERBOSE) {
      console.log(`       ${i.probe.why}`);
      console.log(`       src: ${i.probe.src.slice(0, 150)}`);
    }
  }
  console.log("");
}
console.log(failures === 0 ? "PROBE PASS — every probe behaved as specified." : `PROBE FAIL — ${failures} probe(s) misbehaved.`);
rmSync(ROOT, { recursive: true, force: true });
process.exit(failures === 0 ? 0 : 1);
