#!/usr/bin/env node
/**
 * CLAIMS GATE — the machine half of `USER_INPUTS.md` §0.
 *
 * Phase 00 produced `reports/baseline/content-claims-inventory.md`: 67 curated
 * rows, 41 of them `UNVERIFIED_MUST_REMOVE`. That document is a snapshot — it
 * cannot stop the 42nd. This script can.
 *
 * It walks the public-facing source (the same roots and exclusions the Phase 00
 * scanner used, plus `src/content/`) and fails on any pattern that
 * `USER_INPUTS.md` does not authorise. Every rule names the field that decides
 * it, so a failure tells you WHY, not just WHERE.
 *
 * It also checks the four published quality PDFs actually exist in `public/`
 * and that the byte sizes printed next to them are real — the previous copy
 * invented all four sizes for files that were never even in the build.
 *
 * Usage:
 *     node scripts/claims-gate.mjs            # fail on violation
 *     node scripts/claims-gate.mjs --list     # print the rule table
 *
 * Comment lines are skipped. A rule may be discussed in a comment (that is how
 * the removals stay explainable) but never rendered.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Same scope as `reports/baseline/tools/scan-claims.mjs`, plus the new ledger. */
const ROOTS = ["src/pages", "src/components", "src/data", "src/content", "index.html"];
const EXCLUDE = [
  /[\\/]admin[\\/]/i,
  /[\\/]musteri[\\/]/i,
  /[\\/]AdminDashboard\./,
  /[\\/]AdminLogin\./,
  /[\\/]MusteriPaneli\./,
];
const EXT = /\.(tsx?|html)$/;

/**
 * @typedef {{ id: string, pattern: RegExp, authority: string, remedy: string }} Rule
 */

/** @type {Rule[]} */
const RULES = [
  {
    id: "unverified-certification",
    pattern: /AS\s?9100|IATF\s?16949|ISO\s?13485|NADCAP|NIST\s?800-171/i,
    authority: "§C AS9100D_VALUE: NONE · IATF_16949_VALUE: NONE · ISO 13485 / NADCAP / NIST 800-171 appear nowhere",
    remedy: "Use src/content/claims.ts CERTIFICATIONS. ISO 9001, ISO 14001 and OHSAS 18001 are the only permitted codes.",
  },
  {
    id: "certifying-body",
    pattern: /T[ÜU]V\s?S[ÜU]D|Bureau\s?Veritas|\bSGS\b|\bDNV\b|Lloyd'?s\s?Register/i,
    authority: "§C — no issuer is supplied for any certificate",
    remedy: "Never name a registrar. Naming one invents an audit.",
  },
  {
    id: "tolerance-beyond-verified",
    // A bare `0.003` is an animation speed as often as a tolerance, so the
    // rule needs either the ± sign or a length unit before it fires.
    pattern: /±\s?0[.,]00\d|\b0[.,]00\d+\s?(mm|µm|μm|um)\b|\bRa\s?0[.,]00\d/,
    authority: "§D MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm",
    remedy: "Import MINIMUM_TOLERANCE from src/content/claims.ts. ±0.005 claimed twice the verified capability.",
  },
  {
    id: "quote-sla-overpromise",
    pattern: /\b48\s?saat|\b24\s?saat(te)?\s+(teklif|dönüş)|\b48\s?h\b/i,
    authority: "§D QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days · §J QUOTE_SLA: 1-3 Days",
    remedy: "Import QUOTE_RESPONSE_TIME from src/content/claims.ts.",
  },
  {
    id: "delivery-or-quality-rate",
    // A bare "teslimat" after a percentage is excluded: "%50 teslimatta ödenir"
    // is a payment term, not a performance rate.
    pattern:
      /%\s?\d{1,3}([.,]\d+)?\s*(zamanında|teslimat oranı|başarı|kalite oranı|verimlilik|doğruluk|ilk seferde)|(zamanında teslimat|teslimat oranı|başarı oranı|kalite oranı)[^.\n]{0,25}%\s?\d/i,
    authority: "§D ON_TIME_DELIVERY_INTERNAL: 95% (PUBLIC_IF_VERIFIED_AND_STRATEGIC — condition not met)",
    remedy: "No self-graded performance percentage is published. See ON_TIME_DELIVERY in src/content/claims.ts.",
  },
  {
    id: "process-capability-metric",
    pattern: /\bOEE\b|\bCpk\b|\bPpk\b|\bPPAP\b/,
    authority: "§D — no capability index, OEE figure or PPAP level was ever supplied",
    remedy: "Fabricated operational metrics (%77.5 OEE, Cpk ≥1.67, PPAP Level 5). Remove; do not soften.",
  },
  {
    id: "company-scale-disclosure",
    pattern:
      /\b\d[\d.,]*\s?K?\s?\+\s*(adet|parça|malzeme|tezgah|makine|mühendis|teknisyen|personel|çalışan|müşteri|proje|m²)|\b\d[\d.,]*\s?m²|\b\d[\d.,]*\s*(adet\s+)?(CNC\s+)?tezgah|\b24\s?\/\s?7|\b7\s?\/\s?24/i,
    authority:
      "§D TEAM_SIZE / MACHINE_COUNT / FACILITY_SIZE / REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE · §0 DO_NOT_EMPHASIZE_COMPANY_SCALE: YES",
    remedy: "Scale is withheld even where true. Positioning comes from process and measurement, not size.",
  },
  {
    id: "machine-inventory",
    // CASE-SENSITIVE: these are proper nouns and always capitalised in source,
    // and case-insensitively `GOM` matches inside ordinary words. The machine
    // brand `Okuma` is deliberately absent — it collides with the Turkish word
    // "okuma" (reading), which the DataMatrix page uses correctly as
    // "Okuma Doğrulama". A rule that cries wolf gets switched off.
    pattern:
      /DMG\s?MORI|\bDMU\s?\d|Variaxis|monoBLOCK|\bMazak\b|\bHaas\b|\bSodick\b|\bZeiss\b|\bGOM\b|Taylor\s?Hobson|Mitutoyo|Renishaw|Hexagon\s?Metrology|Keyence|Hermle|Doosan|Makino|Kitamura|\bStuder\b|\bKUKA\b|\bFANUC\b|Stratasys|Formlabs|Trumpf|GF Machining|\bTornos\b/,
    authority: "§D MACHINE_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE — and no model list was ever supplied",
    remedy: "Named machines and metrology brands were invented. §H supplies a real equipment PDF instead.",
  },
  {
    id: "fabricated-analytics",
    pattern: /\bviews\s*[:?]|TOPLAM OKUMA|okunma sayısı|görüntülenme sayısı|BLOG İSTATİSTİKLERİ/i,
    authority: "§K ANALYTICS_PROVIDER: NONE",
    remedy: "With no analytics provider there is no view count, no total and no most-read ranking.",
  },
  {
    id: "demo-placeholder-badge",
    pattern: /DEMO İÇERİK|ÖRNEK İÇERİK|HAZIRLANIYOR|TEMSİL[İÎ]|GERÇEK RAPOR DEĞİLDİR|COMING SOON/i,
    authority: "IMPLEMENTATION.md §7 Phase 06 — no demo/sample/coming-soon affordance ships on a public route",
    remedy: "Finish the feature or remove it. A badge does not make placeholder content acceptable.",
  },
  {
    id: "fake-verification",
    pattern: /RAPORU DOĞRULA|DOĞRULAMA SERVİSİ|QR kodu okut|QUALITY\s*<br|QUALITY\s+ASSURED|YETKİLİ İMZA/i,
    authority: "§H OTHER_PUBLIC_DOCS: NONE — no verification endpoint and no issuing authority exist",
    remedy: "IMPLEMENTATION.md §13 forbids a fake verification destination, a forged signature and a self-issued seal.",
  },
  {
    id: "fabricated-report-number",
    pattern: /\bMT-20\d{2}-\d{3,}\b/,
    authority: "§G CASE_STUDIES: NONE_PROVIDED_YET",
    remedy: "Report numbers referenced inspection records that do not exist.",
  },
  {
    id: "unverified-reference",
    pattern: /\bZTM\b/,
    authority: "§F ZTM: REMOVE_IF_UNVERIFIED",
    remedy: "Only §F names marked PUBLIC_OK may appear. See REFERENCE_LOGOS in src/content/claims.ts.",
  },
  {
    id: "unapproved-confidentiality",
    // `NDA` is CASE-SENSITIVE on purpose: case-insensitively it also matches the
    // Turkish locative suffix in "hakkı-nda", which produced 150 false hits.
    pattern:
      /\bNDA\b|gizlilik sözleşme|gizlilik anlaşma|gizlilik güvence|güvenlik soruşturma|saklama süre|imha edil/,
    authority: "§J NDA_AVAILABLE: NO · CONFIDENTIALITY_TEXT_APPROVED: NO · CAD_RETENTION_PERIOD: UNKNOWN",
    remedy: "The public copy is correct BY OMISSION. No NDA, retention window or clearance claim may be added.",
  },
  {
    id: "unverified-social",
    // Profile URLs and the `twitter:site` handle only. A share INTENT link
    // (`twitter.com/intent/tweet?...`) claims no account and stays legal;
    // `@MasTechnic` case-insensitively also matched `sales@mastechnic.com`.
    pattern:
      /instagram\.com\/[\w.]|youtube\.com\/@?[\w.]|(?:twitter|x)\.com\/(?!intent)[\w.]|twitter:site/i,
    authority: "§L INSTAGRAM: NONE · YOUTUBE: NONE · X_TWITTER: NONE",
    remedy: "LinkedIn is the only permitted channel. See SOCIAL_LINKS in src/content/claims.ts.",
  },
  {
    id: "english-availability",
    pattern: /availableLanguage[^\n]*English/i,
    authority: "§B ENGLISH_LIVE_NOW: NO",
    remedy: "Structured data must not advertise a language the site does not serve.",
  },
  {
    id: "wrong-city",
    pattern: /geo\.placename[^\n]*İstanbul/i,
    authority: "§A PUBLIC_CITY: İzmir",
    remedy: "The geo meta contradicted the footer, the JSON-LD and the address.",
  },
  {
    id: "unconditional-guarantee",
    pattern:
      /%\s?100\s*(CMM|kontrol|muayene|ölçüm|izlenebilir|NDT|boyutsal|lot|denetim)|teslimat garantisi|kalite garantisi|tedarik garantisi|(her|tüm)\s+(sipariş|parça|üretim)\w*\s+(için\s+)?[^.\n]{0,40}(sertifika|test raporu)/i,
    authority: "§D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND — coverage is on demand, not universal",
    remedy: "State the mechanism and its condition. An unconditional promise is a claim with no evidence.",
  },
  {
    id: "sector-standard-compliance",
    // Sector regulations and form standards are the same failure as a
    // certificate: a buyer acts on them. `USER_INPUTS.md` §C lists three
    // management-system certificates and nothing else.
    pattern:
      /MIL-SPEC|\bAQAP\b|\bITAR\b|MIL-I-45208|\bAS9102\b|21\s?CFR\s?820|MDR\s?2017|ISO\s?10993|ISO\s?14644|Class\s?7\s*(\(|temiz)|FDA\s?(uyum|21)/i,
    authority: "§C — only ISO 9001, ISO 14001 and OHSAS 18001 are supplied",
    remedy: "Describe the practice, not the standard you are audited against. A sector regulation is a claim a customer's submission depends on.",
  },
  {
    id: "named-supplier",
    // The supply-chain page listed mills by name with percentage shares and
    // tonnage. Neither the names nor the shares were ever supplied, and the
    // shares are order-volume disclosure on top (§D REVENUE_OR_ORDER_VOLUME).
    pattern: /\bAlcoa\b|\bOutokumpu\b|\bErdemir\b|\bVSMPO\b|\bSabic\b|\bAssan\b/,
    authority: "§D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE — and no supplier list was supplied",
    remedy: "Name the material and its specification, never the mill and its share of your spend.",
  },
  {
    id: "named-enterprise-system",
    pattern: /SAP\s?(MES|ERP)|\bFastems\b|\bVericut\b|\b3DCS\b/i,
    authority: "§D — no software or automation-system inventory was supplied",
    remedy: "Named ERP/MES/CAM systems assert an infrastructure nobody verified.",
  },
  {
    id: "marketing-filler",
    // A bare `en iyi` is excluded: in `materialsData.ts` it states published
    // machinability rankings ("en iyi işlenebilir paslanmaz"), which is a
    // metallurgical fact, not a boast. Only the company-directed forms fire.
    pattern:
      /yüksek kalite|üstün kalite|ileri teknoloji|en iyi (fiyat|kalite|hizmet|çözüm)|Türkiye'?nin en\b|dünyanın en\b|sektör(ün)?\s+lider|dünya standartlarında|kusursuz/i,
    authority: "§0 PUBLIC_POSITIONING_PRIORITY: PRECISION_ENGINEERING, MEASUREMENT, TRACEABILITY, PROCESS_DISCIPLINE",
    remedy: "Superlatives with no proof behind them. Replace with the specific technical fact, or delete.",
  },
];

/* ── file walk ─────────────────────────────────────────────────────────── */

/** @type {{ rule: Rule, file: string, line: number, text: string }[]} */
const violations = [];
let filesScanned = 0;
let linesScanned = 0;

function walk(path) {
  const abs = resolve(REPO_ROOT, path);
  let stats;
  try {
    stats = statSync(abs);
  } catch {
    return;
  }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(abs)) walk(join(path, entry));
    return;
  }
  if (!EXT.test(abs)) return;
  if (EXCLUDE.some((re) => re.test(abs))) return;

  filesScanned += 1;
  const rel = relative(REPO_ROOT, abs).replace(/\\/g, "/");
  const lines = readFileSync(abs, "utf8").split(/\r?\n/);
  // A removed claim must stay DISCUSSABLE — the whole point of the ledger is
  // that it explains what went and why. So comments are skipped, including
  // block comments whose continuation lines carry no `*` gutter.
  // HTML comments are NOT skipped: Vite ships `index.html` verbatim, so a
  // comment there reaches production and is readable in view-source. This was
  // found the hard way — an explanatory comment naming a removed certificate
  // shipped into `dist/index.html`. JS/TS comments are compiled away and are
  // the right place to record why a claim went.
  const html = abs.endsWith(".html");
  let inBlockComment = false;
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const opens = html ? -1 : line.lastIndexOf("/*");
    const closes = html ? -1 : line.lastIndexOf("*/");
    const wasInBlock = inBlockComment;
    if (inBlockComment) {
      if (closes > -1) inBlockComment = false;
    } else if (opens > -1 && closes < opens) {
      inBlockComment = true;
    }
    if (wasInBlock || (opens > -1 && closes < opens)) return;
    if (!trimmed) return;
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("{/*")
    ) {
      return;
    }
    linesScanned += 1;
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        violations.push({ rule, file: rel, line: index + 1, text: trimmed.slice(0, 180) });
      }
    }
  });
}

/* ── published documents must be real ──────────────────────────────────── */

/**
 * `QUALITY_RESOURCES` prints a byte size next to a download link. Before
 * Phase 06 all four sizes were invented for files that were not in the build
 * at all. This re-derives them from disk.
 */
function checkQualityResources() {
  const ledgerPath = resolve(REPO_ROOT, "src/content/claims.ts");
  if (!existsSync(ledgerPath)) {
    return [{ file: "src/content/claims.ts", message: "the claim ledger is missing" }];
  }
  const source = readFileSync(ledgerPath, "utf8");
  const rows = [...source.matchAll(/href:\s*"(\/belgeler\/[^"]+)"\s*,\s*size:\s*"PDF · (\d+) KB"/g)];
  /** @type {{ file: string, message: string }[]} */
  const problems = [];
  if (rows.length === 0) {
    problems.push({ file: "src/content/claims.ts", message: "no QUALITY_RESOURCES rows found" });
  }
  for (const [, href, declared] of rows) {
    const onDisk = resolve(REPO_ROOT, "public", href.replace(/^\//, ""));
    if (!existsSync(onDisk)) {
      problems.push({ file: `public${href}`, message: "published resource does not exist on disk" });
      continue;
    }
    const actual = Math.round(statSync(onDisk).size / 1024);
    if (String(actual) !== declared) {
      problems.push({
        file: `public${href}`,
        message: `declared ${declared} KB, actual ${actual} KB — the printed size must be measured, not guessed`,
      });
    }
  }
  return problems;
}

/* ── run ───────────────────────────────────────────────────────────────── */

if (process.argv.includes("--list")) {
  console.log("# claims gate rules");
  for (const rule of RULES) {
    console.log(`\n${rule.id}\n  authority: USER_INPUTS.md ${rule.authority}\n  remedy:    ${rule.remedy}`);
  }
  process.exit(0);
}

for (const root of ROOTS) walk(root);
const resourceProblems = checkQualityResources();

const byRule = new Map();
for (const v of violations) {
  if (!byRule.has(v.rule.id)) byRule.set(v.rule.id, []);
  byRule.get(v.rule.id).push(v);
}

console.log("# CLAIMS GATE");
console.log(`# roots:    ${ROOTS.join(", ")}`);
console.log(`# excluded: admin/, musteri/, AdminDashboard, AdminLogin, MusteriPaneli`);
console.log(`# scanned:  ${filesScanned} files, ${linesScanned} non-comment lines`);
console.log("");

if (violations.length === 0 && resourceProblems.length === 0) {
  console.log(`PASS — 0 unverified claims across ${RULES.length} rules.`);
  process.exit(0);
}

console.log("## VIOLATIONS BY RULE");
for (const rule of RULES) {
  const hits = byRule.get(rule.id);
  if (!hits) continue;
  console.log("");
  console.log(`### ${rule.id} — ${hits.length}`);
  console.log(`authority: USER_INPUTS.md ${rule.authority}`);
  console.log(`remedy:    ${rule.remedy}`);
  for (const hit of hits) console.log(`  ${hit.file}:${hit.line}: ${hit.text}`);
}

if (resourceProblems.length > 0) {
  console.log("");
  console.log(`### published-resource-integrity — ${resourceProblems.length}`);
  console.log("authority: USER_INPUTS.md §H — the four quality documents are PUBLIC_OK and must be real links");
  for (const p of resourceProblems) console.log(`  ${p.file}: ${p.message}`);
}

console.log("");
console.log(`FAIL — ${violations.length} claim violation(s), ${resourceProblems.length} resource problem(s).`);
process.exit(1);
