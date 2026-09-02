#!/usr/bin/env node
/**
 * CLAIMS GATE — the machine half of `USER_INPUTS.md` §0.
 *
 * Phase 00 produced `reports/baseline/content-claims-inventory.md`: 67 curated
 * rows, 41 of them `UNVERIFIED_MUST_REMOVE`. That document is a snapshot — it
 * cannot stop the 42nd. This script can.
 *
 * It walks the public-facing source and fails on any pattern that
 * `USER_INPUTS.md` does not authorise. Every rule names the field that decides
 * it, so a failure tells you WHY, not just WHERE.
 *
 * WHY THE RULES LOOK THE WAY THEY DO (the Phase 06 correction)
 * ------------------------------------------------------------
 * The first version of this gate enumerated NOUNS and STANDARD NUMBERS. It
 * reported `PASS — 0` over a tree carrying roughly thirty live unauthorised
 * claims, because ordinary publishable Turkish walked straight past it:
 *
 *     "Teklifinizi 24 saat içinde iletiyoruz."   — the SLA rule wanted
 *                                                  `teklif` AFTER `24 saat`
 *     "…kalitesini garanti ediyoruz."            — the rule matched only the
 *                                                  noun `… garantisi`
 *     "EN ISO 3834-2 standardında üretim"        — the standard was simply not
 *                                                  on the deny-list
 *     "Gerçek vaka çalışmalarıyla kanıtlanmış"   — nothing covered it at all
 *
 * A gate that reports zero over live fabrication is worse than no gate: it
 * launders the claim. So the rules below match CLAIM SHAPE, not vocabulary:
 *
 *   - Time-window + quote vocabulary in EITHER order, within a window.
 *   - `garanti` in every Turkish inflection, not one nominal form.
 *   - Universality (`%100`, `yüzde 100`, `her` / `tüm` / `bütün` / `istisnasız`)
 *     next to an inspection, test or certificate — whatever noun is used.
 *   - Proof-by-evidence-that-does-not-exist (`kanıtlanmış`, `vaka çalışması`,
 *     `referans proje`), which §G forbids outright.
 *   - Standards conformity as an ALLOW-LIST against §C. A deny-list of standard
 *     numbers is defeated by the next standard somebody invents; an allow-list
 *     is not.
 *
 * And the source is NORMALISED before matching, so the eleven lexical evasions
 * QA demonstrated (`"AS" + "9100D"`, `AS${""}9100D`, `A<U+200B>S9100D`,
 * `m&#178;`, cross-line concatenation) no longer split a token.
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

/**
 * Every directory that can put a character on a public screen.
 *
 * The Phase 06 review found `ROOTS` blind to `src/hooks`, where `CAD_FORMAT_HINT`
 * — copy rendered verbatim under the landing dropzone — is composed. `src/utils`
 * builds the CAD validation messages, `src/lib`/`src/config` are on the same
 * import path, `src/routes` and `src/App.tsx` carry route-level strings, and
 * everything in `public/` is served byte-for-byte without passing through the
 * bundler at all. A claim is not safe because it lives one directory over.
 */
const ROOTS = [
  "src/pages",
  "src/components",
  "src/data",
  "src/content",
  "src/hooks",
  "src/utils",
  "src/config",
  "src/lib",
  "src/routes",
  "src/App.tsx",
  "index.html",
  "public",
];
const EXCLUDE = [
  /[\\/]admin[\\/]/i,
  /[\\/]musteri[\\/]/i,
  /[\\/]AdminDashboard\./,
  /[\\/]AdminLogin\./,
  /[\\/]MusteriPaneli\./,
];
/**
 * `public/` is served verbatim, so its text formats count too — `robots.txt`,
 * a `sitemap.xml`, a web manifest or an inline `<text>` in an SVG all reach a
 * reader without a compiler in between.
 */
const EXT = /\.(tsx?|html|txt|xml|json|webmanifest|svg|md)$/;

/* ── normalisation ─────────────────────────────────────────────────────────
   Eleven of QA's evasion probes were lexical, not semantic: the claim was
   present and readable in the rendered output, but the SOURCE spelled it in a
   way a per-line regex could not see. Normalisation closes that class as a
   class, rather than adding eleven more patterns.

   The output keeps an exact character → original-line map, so a violation
   still reports the line a human can open.                                   */

const ZERO_WIDTH = new Set([
  "​", // zero-width space
  "‌", // zero-width non-joiner
  "‍", // zero-width joiner
  "⁠", // word joiner
  "﻿", // BOM / zero-width no-break space
  "­", // soft hyphen
]);

const NAMED_ENTITIES = {
  amp: "&",
  nbsp: " ",
  sup2: "²",
  sup3: "³",
  deg: "°",
  plusmn: "±",
  micro: "µ",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
};

const RE_ENTITY = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([a-zA-Z][a-zA-Z0-9]{1,10}));/y;
/** `"a" + "b"`, including across newlines — the concatenation splits nothing. */
const RE_CONCAT = /["'`][ \t\r\n]*\+[ \t\r\n]*["'`]/y;
/** `${"9100D"}` — emit the inner literal; the interpolation splits nothing. */
const RE_INTERP_LITERAL = /\$\{[ \t\r\n]*(["'`])((?:\\.|(?!\1)[^\\])*)\1[ \t\r\n]*\}/y;
/** Any other simple interpolation: it renders as *something*, so close the gap. */
const RE_INTERP_OTHER = /\$\{[^{}"'`]*\}/y;

/**
 * @param {string} src comment-blanked source
 * @returns {{ text: string, lineOf: Int32Array }}
 */
function normalise(src) {
  const chars = [];
  const lines = [];
  let line = 1;
  let i = 0;

  const emit = (s, atLine) => {
    for (const ch of s) {
      chars.push(ch);
      lines.push(atLine);
    }
  };
  const skip = (span) => {
    for (const ch of span) if (ch === "\n") line += 1;
  };

  while (i < src.length) {
    const ch = src[i];

    if (ch === "\n") {
      emit("\n", line);
      line += 1;
      i += 1;
      continue;
    }
    if (ZERO_WIDTH.has(ch)) {
      i += 1;
      continue;
    }
    if (ch === "&") {
      RE_ENTITY.lastIndex = i;
      const m = RE_ENTITY.exec(src);
      if (m) {
        let decoded;
        if (m[1] !== undefined) decoded = String.fromCodePoint(Number(m[1]));
        else if (m[2] !== undefined) decoded = String.fromCodePoint(parseInt(m[2], 16));
        else decoded = NAMED_ENTITIES[m[3].toLowerCase()];
        if (decoded !== undefined) {
          emit(decoded, line);
          i += m[0].length;
          continue;
        }
      }
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      RE_CONCAT.lastIndex = i;
      const m = RE_CONCAT.exec(src);
      if (m) {
        skip(m[0]);
        i += m[0].length;
        continue;
      }
    }
    if (ch === "$" && src[i + 1] === "{") {
      RE_INTERP_LITERAL.lastIndex = i;
      const lit = RE_INTERP_LITERAL.exec(src);
      if (lit) {
        const startLine = line;
        skip(lit[0]);
        emit(lit[2], startLine);
        i += lit[0].length;
        continue;
      }
      RE_INTERP_OTHER.lastIndex = i;
      const other = RE_INTERP_OTHER.exec(src);
      if (other) {
        skip(other[0]);
        i += other[0].length;
        continue;
      }
    }

    emit(ch, line);
    i += 1;
  }

  return { text: chars.join(""), lineOf: Int32Array.from(lines) };
}

/**
 * Blanks comments while preserving line count and column positions, so the
 * normaliser above can still report an openable line number.
 *
 * HTML comments are NOT blanked: Vite ships `index.html` verbatim, so a comment
 * there reaches production and is readable in view-source. This was found the
 * hard way — an explanatory comment naming a removed certificate shipped into
 * `dist/index.html`. JS/TS comments are compiled away and are the right place
 * to record why a claim went.
 */
function blankComments(src, isHtml) {
  if (isHtml) return src;
  // ORDER MATTERS. Block comments are blanked FIRST, on the untouched source:
  // a `/* … */` ledger entry has continuation lines with no `*` gutter, and
  // blanking the gutter lines first would delete the `/*` and `*/` delimiters
  // so the block could never be recognised. Newlines are preserved so the
  // character → line map below stays exact.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .split(/\n/)
    .map((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith("//") || trimmed.startsWith("*") ? "" : line;
    })
    .join("\n");
}

/* ── §C allow-list ─────────────────────────────────────────────────────────
   `USER_INPUTS.md` §C supplies exactly three management-system certificates.
   Everything else is either not held (AS9100D, IATF 16949: `NONE`) or was
   never mentioned at all. This list is the ONLY exemption the standards rule
   grants.                                                                    */

const ALLOWED_STANDARDS = [
  /^ISO\s*9001(:\d{4})?$/i,
  /^ISO\s*14001(:\d{4})?$/i,
  /^OHSAS\s*18001(:\d{4})?$/i,
];

/**
 * A standard-shaped token, matched GENERICALLY. The point is that a standard
 * nobody has invented yet still matches: `ISO 99999`, `EN 4711`, `MAS 1000`.
 */
// CASE-SENSITIVE. Standard bodies are always written in capitals, and `EN`
// lower-cased is the ordinary Turkish word "en" (most / width), `AS` appears
// inside `HASSAS`, and `NF` inside identifiers. The designator part accepts a
// letter series (`AWS D1.1`, `API 6A`, `ASME B16.5`, `MIL-A-8625`) because the
// deny-list version of this rule missed every one of them.
const STANDARD_TOKEN =
  /\b(?:TS\s+)?(?:EN\s+)?(?:ISO|IEC|EN|DIN|ASTM|ASME|AWS|AMS|SAE|API|NAS|BS|JIS|MIL|NACE|NF|UNI|GOST|AQAP|OHSAS|IATF|NADCAP|AS|CFR|MDR)[\s/-]?(?:IEC[\s/-]?)?(?:[A-Z]{1,3}[- ]?)?\d{1,6}(?:[.\-–/][0-9A-Za-z]{1,4})*\b/g;

/**
 * Conformity vocabulary. A standard number becomes a CLAIM when the copy says
 * the company conforms to it, is certified against it, or produces to it —
 * as opposed to naming it as a technical reference ("genel toleranslar
 * ISO 2768-m", "flanş ölçüleri EN 1092-1"), which is engineering vocabulary and
 * asserts no audit.
 */
// Turkish suffixes are agglutinative and `\w` is ASCII-only, so a naive
// `standard[ıi]na` misses `standartlarına` — the plural the copy actually uses.
// `standart` also softens to `standard` before a vowel. Both stems, any number
// of suffix letters, then the conformity verb.
const TRW = "[A-Za-z0-9_çğıîöşüâÇĞİÖŞÜÂÎ]";
const CONFORMITY_CONTEXT = new RegExp(
  [
    // an attestation is claimed to exist
    "sertifika",
    "belgeli",
    "belgemiz",
    "belgesi",
    "belgelendir",
    "akredit",
    "onayl",
    "tescil",
    "denetim",
    "denetlen",
    "kalifiye",
    "yeterlilik",
    "nitelikli kaynakç",
    // conformity is asserted
    "uygunluk",
    "uyumlu",
    "tam uyum",
    "uygun olarak",
    `standar[dt]${TRW}{0,12}\\s*(?:uygun|göre|üret|imal|uyum|çal[ıi]ş)`,
    `standar[dt]${TRW}{0,4}nda\\b`,
  ].join("|"),
  "i",
);

/**
 * Standards that assert an audit merely by being named — management systems and
 * personnel/procedure qualification schemes. Nobody writes "ISO 9606-1
 * kaynakçı" as a dimension reference; it names a qualification a third party
 * awards. Kept as a BACKSTOP behind the generic context rule above, not as the
 * primary mechanism.
 *
 * Deliberately NOT here: process, material and test-method specifications
 * (`MIL-A-8625 Tip II`, `MIL-DTL-16232`, `ASTM B117`, `ASME B16.5`,
 * `ISO 2768-m`). Those name the coating class, the test method or the interface
 * a part is made to. They are the precision vocabulary §0
 * PUBLIC_POSITIONING_PRIORITY asks for and they assert no audit — UNTIL the
 * copy wraps them in conformity language, at which point the generic
 * `CONFORMITY_CONTEXT` path above catches them. The two MIL specs listed here
 * are the exceptions: both are quality-/inspection-SYSTEM requirements, which
 * is the same class as ISO 9001.
 */
const CONFORMITY_BY_NATURE =
  /^(?:(?:TS\s+)?(?:EN\s+)?ISO\s*(?:9001|9004|9606|10012|13485|14001|14731|15614|17020|17025|17065|18001|22000|27001|3834|45001|50001|80079)|AS\s?9\d{3}|IATF\s?\d{5}|OHSAS\s?\d{5}|NADCAP|AQAP\s?\d+|AWS\s?[A-Z]\d+|MIL-(?:I-45208|Q-9858|STD-45662)|MIL-SPEC)/i;

/* ── rules ─────────────────────────────────────────────────────────────────
   Each rule is either a `pattern` (matched against the normalised text) or a
   `scan` (a generator, for rules that need to reason about a match rather than
   merely find one).                                                          */

/**
 * @typedef {{ id: string, pattern?: RegExp, scan?: (text: string) => Generator<{ index: number, match: string }>, authority: string, remedy: string }} Rule
 */

/** @type {Rule[]} */
const RULES = [
  {
    id: "unverified-certification",
    pattern: /AS\s?9100|IATF\s?16949|ISO\s?13485|NADCAP|NIST\s?800-171/gi,
    authority: "§C AS9100D_VALUE: NONE · IATF_16949_VALUE: NONE · ISO 13485 / NADCAP / NIST 800-171 appear nowhere",
    remedy: "Use src/content/claims.ts CERTIFICATIONS. ISO 9001, ISO 14001 and OHSAS 18001 are the only permitted codes.",
  },
  {
    id: "certifying-body",
    pattern: /T[ÜU]V\s?S[ÜU]D|Bureau\s?Veritas|\bSGS\b|\bDNV\b|Lloyd'?s\s?Register/gi,
    authority: "§C — no issuer is supplied for any certificate",
    remedy: "Never name a registrar. Naming one invents an audit.",
  },
  {
    id: "tolerance-beyond-verified",
    // A bare `0.003` is an animation speed as often as a tolerance, so the
    // rule needs either the ± sign or a length unit before it fires.
    pattern: /±\s?0[.,]00\d|\b0[.,]00\d+\s?(mm|µm|μm|um)\b|\bRa\s?0[.,]00\d/g,
    authority: "§D MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm",
    remedy: "Import MINIMUM_TOLERANCE from src/content/claims.ts. ±0.005 claimed twice the verified capability.",
  },
  {
    id: "quote-sla-overpromise",
    // SHAPE, not word order. A quote-turnaround promise is a time window and
    // quote vocabulary in the same breath — in EITHER order. The old rule
    // demanded `teklif` immediately AFTER `24 saat` and so walked past
    // `TeklifAl.tsx:1098`, the exact claim it was written to stop, live in
    // `dist/`. Delivery lead times ("24 saatte ilk parça") carry no quote
    // vocabulary and do not fire; they are a separate, uncovered class.
    pattern: new RegExp(
      [
        // window → quote vocabulary
        String.raw`\b(?:\d{1,3}\s?(?:saat|sa\.|saatte|saatlik)|aynı gün|ertesi gün|birkaç saat)` +
          String.raw`[^.!?\n]{0,60}?(?:teklif|fiyatland|fiyat ver|dönüş|geri dön|yanıt|cevap|görüşl?e|bildir)`,
        // quote vocabulary → window
        String.raw`(?:teklif|fiyatland|fiyat ver|dönüş|geri dön|yanıt|cevap|RFQ)` +
          String.raw`[^.!?\n]{0,60}?\b(?:\d{1,3}\s?(?:saat|sa\.|saatte|saatlik)|aynı gün|ertesi gün|birkaç saat)`,
        // the specific fabricated figure, unconditionally
        String.raw`\b48\s?saat|\b48\s?h\b`,
      ].join("|"),
      "gi",
    ),
    authority: "§D QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days · §J QUOTE_SLA: 1-3 Days",
    remedy: "Import QUOTE_RESPONSE_TIME from src/content/claims.ts.",
  },
  {
    id: "delivery-or-quality-rate",
    // A bare "teslimat" after a percentage is excluded: "%50 teslimatta ödenir"
    // is a payment term, not a performance rate. Both the `%` glyph and the
    // word form `yüzde` count — QA showed `yüzde 98` evading the glyph-only
    // rule while reading identically on screen.
    pattern:
      /(?:%\s?|yüzde\s+)\d{1,3}([.,]\d+)?\s*(zamanında|teslimat oranı|başarı|kalite oranı|verimlilik|doğruluk|ilk seferde|hatasız|fire|hurda|red oranı)|(zamanında teslimat|teslimat oranı|başarı oranı|kalite oranı|hatasız üretim|müşteri memnuniyeti)[^.\n]{0,30}(?:%\s?|yüzde\s+)\d/gi,
    authority: "§D ON_TIME_DELIVERY_INTERNAL: 95% (PUBLIC_IF_VERIFIED_AND_STRATEGIC — condition not met)",
    remedy: "No self-graded performance percentage is published. See ON_TIME_DELIVERY in src/content/claims.ts.",
  },
  {
    id: "process-capability-metric",
    pattern: /\bOEE\b|\bCpk\b|\bPpk\b|\bPPAP\b/g,
    authority: "§D — no capability index, OEE figure or PPAP level was ever supplied",
    remedy: "Fabricated operational metrics (%77.5 OEE, Cpk ≥1.67, PPAP Level 5). Remove; do not soften.",
  },
  {
    id: "company-scale-disclosure",
    // The `+` suffix is no longer required. `"Ekibimizde 48 mühendis çalışıyor"`
    // and `"Üretim alanımız 15.000 metrekare"` disclose exactly what
    // §D TEAM_SIZE / FACILITY_SIZE withhold, and both evaded the glyph-bound
    // rule. Capability counts that are NOT scale (`5 eksen`, `3 vardiya`,
    // `2 iterasyon`) are excluded by the noun list, not by the number.
    pattern:
      /\b\d[\d.,]*\s?K?\s?\+?\s*(?:adet\s+)?(?:CNC\s+)?(?:tezgah|tezgâh|makine|işleme merkezi|mühendis|teknisyen|personel|çalışan|operatör|kişilik ekip|müşteri|m²|m2\b|metrekare)|\b\d[\d.,]*\s?m²|\b\d[\d.,]*\s?\+\s*(?:parça|malzeme|proje)|\b24\s?\/\s?7|\b7\s?\/\s?24/gi,
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
      /DMG\s?MORI|\bDMU\s?\d|Variaxis|monoBLOCK|\bMazak\b|\bHaas\b|\bSodick\b|\bZeiss\b|\bGOM\b|Taylor\s?Hobson|Mitutoyo|Renishaw|Hexagon\s?Metrology|Keyence|Hermle|Doosan|Makino|Kitamura|\bStuder\b|\bKUKA\b|\bFANUC\b|Stratasys|Formlabs|Trumpf|GF Machining|\bTornos\b/g,
    authority: "§D MACHINE_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE — and no model list was ever supplied",
    remedy: "Named machines and metrology brands were invented. §H supplies a real equipment PDF instead.",
  },
  {
    id: "fabricated-analytics",
    pattern: /\bviews\s*[:?]|TOPLAM OKUMA|okunma sayısı|görüntülenme sayısı|BLOG İSTATİSTİKLERİ/gi,
    authority: "§K ANALYTICS_PROVIDER: NONE",
    remedy: "With no analytics provider there is no view count, no total and no most-read ranking.",
  },
  {
    id: "demo-placeholder-badge",
    pattern: /DEMO İÇERİK|ÖRNEK İÇERİK|HAZIRLANIYOR|TEMSİL[İÎ]|GERÇEK RAPOR DEĞİLDİR|COMING SOON/gi,
    authority: "IMPLEMENTATION.md §7 Phase 06 — no demo/sample/coming-soon affordance ships on a public route",
    remedy: "Finish the feature or remove it. A badge does not make placeholder content acceptable.",
  },
  {
    id: "fake-verification",
    pattern: /RAPORU DOĞRULA|DOĞRULAMA SERVİSİ|QR kodu okut|QUALITY\s*<br|QUALITY\s+ASSURED|YETKİLİ İMZA/gi,
    authority: "§H OTHER_PUBLIC_DOCS: NONE — no verification endpoint and no issuing authority exist",
    remedy: "IMPLEMENTATION.md §13 forbids a fake verification destination, a forged signature and a self-issued seal.",
  },
  {
    id: "fabricated-report-number",
    pattern: /\bMT-20\d{2}-\d{3,}\b/g,
    authority: "§G CASE_STUDIES: NONE_PROVIDED_YET",
    remedy: "Report numbers referenced inspection records that do not exist.",
  },
  {
    id: "proof-by-nonexistent-evidence",
    // NEW. Nothing in the old rule set covered this shape at all, and
    // `servicePages.ts:1854` shipped "Gerçek vaka çalışmalarıyla kanıtlanmış
    // %70'e kadar tasarruf" — proof asserted by case studies that, per §G, do
    // not exist. `kanıtlanmış` is the giveaway: it names evidence. If the
    // evidence is real, publish it; if it is not, the word is a fabrication.
    pattern:
      /kanıtlanmış|kanıtlanmıştır|kanıtlanan|ispatlanmış|test edilmiş ve onaylanmış|vaka çalışma|vaka analiz|başarı hikaye|referans proje|case stud|müşteri referansımız|sahada doğrulanmış/gi,
    authority: "§G CASE_STUDIES: NONE_PROVIDED_YET · DEFAULT_CASE_STUDY_VISIBILITY: ANONYMIZE",
    remedy:
      "No project, report or client permission was supplied. State the mechanism (the test method, the standard's own limit) instead of claiming it has been proven. src/content/caseStudies.ts holds the schema for real work.",
  },
  {
    id: "unverified-reference",
    pattern: /\bZTM\b/g,
    authority: "§F ZTM: REMOVE_IF_UNVERIFIED",
    remedy: "Only §F names marked PUBLIC_OK may appear. See REFERENCE_LOGOS in src/content/claims.ts.",
  },
  {
    id: "unapproved-confidentiality",
    // `NDA` is CASE-SENSITIVE on purpose: case-insensitively it also matches the
    // Turkish locative suffix in "hakkı-nda", which produced 150 false hits.
    pattern:
      /\bNDA\b|gizlilik sözleşme|gizlilik anlaşma|gizlilik güvence|güvenlik soruşturma|saklama süre|imha edil/g,
    authority: "§J NDA_AVAILABLE: NO · CONFIDENTIALITY_TEXT_APPROVED: NO · CAD_RETENTION_PERIOD: UNKNOWN",
    remedy: "The public copy is correct BY OMISSION. No NDA, retention window or clearance claim may be added.",
  },
  {
    id: "unverified-social",
    // Profile URLs and the `twitter:site` handle only. A share INTENT link
    // (`twitter.com/intent/tweet?...`) claims no account and stays legal;
    // `@MasTechnic` case-insensitively also matched `sales@mastechnic.com`.
    pattern:
      /instagram\.com\/[\w.]|youtube\.com\/@?[\w.]|(?:twitter|x)\.com\/(?!intent)[\w.]|twitter:site/gi,
    authority: "§L INSTAGRAM: NONE · YOUTUBE: NONE · X_TWITTER: NONE",
    remedy: "LinkedIn is the only permitted channel. See SOCIAL_LINKS in src/content/claims.ts.",
  },
  {
    id: "english-availability",
    pattern: /availableLanguage[^\n]*English/gi,
    authority: "§B ENGLISH_LIVE_NOW: NO",
    remedy: "Structured data must not advertise a language the site does not serve.",
  },
  {
    id: "wrong-city",
    pattern: /geo\.placename[^\n]*İstanbul/gi,
    authority: "§A PUBLIC_CITY: İzmir",
    remedy: "The geo meta contradicted the footer, the JSON-LD and the address.",
  },
  {
    id: "unconditional-guarantee",
    // SHAPE: the promise, in every inflection Turkish gives it. The old rule
    // matched the noun `… garantisi` and nothing else, so `garanti ediyoruz`,
    // `garanti eder`, `garanti altına alıyoruz` and `garantili` — sixteen live
    // claims — passed. `USER_INPUTS.md` has no field that authorises a
    // guarantee of any kind: §D grants capability figures, not promises.
    //
    // `garanti belgesi` in a statutory consumer-law context would be a
    // different thing; the site has no such page, and if one is ever added the
    // exemption belongs here, written down, not in a widened pattern.
    pattern:
      /\bgaranti(?:\b|si|sini|siyle|sıyla|li|lidir|liyoruz|yoruz|mizdir)|garanti\s+(?:ed|alt|kapsam|veriyor|sunuyor)|\bgüvence\s+(?:ediyoruz|veriyoruz|alt[ıi]na)|taahhüt\s+(?:ediyoruz|eder|edilir)/gi,
    authority: "§D — no field authorises a guarantee; §0 NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES",
    remedy:
      "State the mechanism and its condition. A guarantee is a contractual promise, and no promise in USER_INPUTS.md backs one.",
  },
  {
    id: "universal-inspection-claim",
    // SHAPE: universality next to an inspection, test, measurement or
    // certificate — whatever noun carries it. §D says coordinate measurement is
    // third-party accredited and provided ON DEMAND; "%100 kontrol",
    // "her parça ölçülür" and "bütün siparişlerde muayene raporu" all assert a
    // universal in-house coverage that does not exist.
    //
    // Deliberately NOT matched: "her parça için teknik incelemede belirlenir",
    // which is the CONDITIONING clause Phase 06 added — it says the opposite of
    // a universal promise. Hence `incele` is absent from the noun list and the
    // `için ... belirlen` shape is excluded below.
    pattern: new RegExp(
      [
        String.raw`(?:%\s?100|yüzde\s+100|100\s?%)[^.\n]{0,40}?(?:kontrol|muayene|ölçüm|ölçül|denetim|test|izlenebilir|NDT|boyutsal|lot|rapor|sertifika|uygunluk|kalite)`,
        String.raw`(?:kontrol|muayene|ölçüm|denetim|test|izlenebilirlik|rapor|sertifika)[^.\n]{0,25}?(?:%\s?100|yüzde\s+100)`,
        String.raw`\b(?:her|tüm|bütün|hepsi|istisnasız|tamam[ıi])\s+(?:bir\s+)?(?:parça|sipariş|ürün|üretim|sevkiyat|lot|parti)\w*` +
          // Phase 06's CONDITIONING clauses are the opposite of a universal
          // promise and must not fire: "her parça için teknik incelemede
          // belirlenir" scopes the claim to a review, and "her partide, kontrol
          // planında tanımlanan koteler ölçülür" scopes it to the control plan.
          String.raw`(?![^.\n]{0,20}için[^.\n]{0,40}belirlen)` +
          String.raw`(?![^.\n]{0,40}kontrol plan[ıi]nda tan[ıi]mlan)` +
          String.raw`[^.\n]{0,60}?` +
          String.raw`(?:ölçül|muayene|kontrol ed|test ed|testinden|raporu|sertifika|denetlen|izlenebil)`,
      ].join("|"),
      "gi",
    ),
    authority: "§D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND — coverage is on demand, not universal",
    remedy:
      "State the mechanism and its condition. Use CMM_COVERAGE from src/content/claims.ts. An unconditional promise is a claim with no evidence.",
  },
  {
    id: "unauthorised-standard-conformity",
    // ALLOW-LIST, not a deny-list. The old rule enumerated MIL-SPEC, AQAP,
    // AS9102, 21 CFR 820 and a handful more, so `EN ISO 3834-2`, `ISO 9606-1`,
    // `ISO 15614-1` and `AWS D1.1` — a welding quality-management-system
    // certificate parallel to ISO 9001, plus three welder/procedure
    // qualification schemes — shipped untouched. Any standard somebody invents
    // tomorrow would have shipped too.
    //
    // §C supplies ISO 9001, ISO 14001 and OHSAS 18001. Everything else fires
    // when it is asserted as CONFORMITY. A standard named as a technical
    // reference ("genel toleranslar ISO 2768-m", "flanş ölçüleri EN 1092-1",
    // "ASME Y14.5 GD&T") describes the part, claims no audit, and is exactly
    // the precision vocabulary §0 PUBLIC_POSITIONING_PRIORITY asks for.
    scan: function* (text) {
      STANDARD_TOKEN.lastIndex = 0;
      let m;
      while ((m = STANDARD_TOKEN.exec(text)) !== null) {
        const token = m[0].replace(/\s+/g, " ").trim();
        if (ALLOWED_STANDARDS.some((re) => re.test(token))) continue;
        const sentenceStart = Math.max(0, text.lastIndexOf("\n", m.index) + 1);
        const sentenceEnd = text.indexOf("\n", m.index) === -1 ? text.length : text.indexOf("\n", m.index);
        const sentence = text.slice(sentenceStart, sentenceEnd);
        if (CONFORMITY_BY_NATURE.test(token) || CONFORMITY_CONTEXT.test(sentence)) {
          yield { index: m.index, match: token };
        }
      }
    },
    authority: "§C — only ISO 9001, ISO 14001 and OHSAS 18001 are supplied; every other standard is unheld",
    remedy:
      "Describe the practice, not the standard you are audited against. Asserting conformity to a standard the company has not declared is a claim a customer's own submission depends on.",
  },
  {
    id: "named-supplier",
    // The supply-chain page listed mills by name with percentage shares and
    // tonnage. Neither the names nor the shares were ever supplied, and the
    // shares are order-volume disclosure on top (§D REVENUE_OR_ORDER_VOLUME).
    pattern: /\bAlcoa\b|\bOutokumpu\b|\bErdemir\b|\bVSMPO\b|\bSabic\b|\bAssan\b/g,
    authority: "§D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE — and no supplier list was supplied",
    remedy: "Name the material and its specification, never the mill and its share of your spend.",
  },
  {
    id: "named-enterprise-system",
    pattern: /SAP\s?(MES|ERP)|\bFastems\b|\bVericut\b|\b3DCS\b/gi,
    authority: "§D — no software or automation-system inventory was supplied",
    remedy: "Named ERP/MES/CAM systems assert an infrastructure nobody verified.",
  },
  {
    id: "marketing-filler",
    // A bare `en iyi` is excluded: in `materialsData.ts` it states published
    // machinability rankings ("en iyi işlenebilir paslanmaz"), which is a
    // metallurgical fact, not a boast. Only the company-directed forms fire.
    pattern:
      /yüksek kalite|üstün kalite|ileri teknoloji|en iyi (fiyat|kalite|hizmet|çözüm)|Türkiye'?nin en\b|dünyanın en\b|sektör(ün)?\s+lider|dünya standartlarında|kusursuz/gi,
    authority: "§0 PUBLIC_POSITIONING_PRIORITY: PRECISION_ENGINEERING, MEASUREMENT, TRACEABILITY, PROCESS_DISCIPLINE",
    remedy: "Superlatives with no proof behind them. Replace with the specific technical fact, or delete.",
  },
];

/* ── file walk ─────────────────────────────────────────────────────────── */

/** @type {{ rule: Rule, file: string, line: number, text: string }[]} */
const violations = [];
let filesScanned = 0;
let linesScanned = 0;

function lineTextOf(text, index) {
  const start = Math.max(0, text.lastIndexOf("\n", index - 1) + 1);
  const rawEnd = text.indexOf("\n", index);
  const end = rawEnd === -1 ? text.length : rawEnd;
  return text.slice(start, end).trim().slice(0, 180);
}

function scanFile(path, abs) {
  filesScanned += 1;
  const rel = relative(REPO_ROOT, abs).replace(/\\/g, "/");
  const raw = readFileSync(abs, "utf8").normalize("NFC");
  const { text, lineOf } = normalise(blankComments(raw, abs.endsWith(".html")));
  linesScanned += text.split("\n").filter((l) => l.trim()).length;

  const seen = new Set();
  for (const rule of RULES) {
    /** @type {{ index: number, match: string }[]} */
    const hits = [];
    if (rule.scan) {
      for (const hit of rule.scan(text)) hits.push(hit);
    } else {
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(text)) !== null) {
        hits.push({ index: m.index, match: m[0] });
        if (m[0].length === 0) rule.pattern.lastIndex += 1;
      }
    }
    for (const hit of hits) {
      const line = lineOf[hit.index] ?? 0;
      const key = `${rule.id}:${line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      violations.push({ rule, file: rel, line, match: hit.match, text: lineTextOf(text, hit.index) });
    }
  }
}

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
  scanFile(path, abs);
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
  console.log(`# roots: ${ROOTS.join(", ")}`);
  console.log(`# normalisation: zero-width strip, HTML-entity decode, string-concat join, \${} interpolation join`);
  console.log(`# §C allow-list: ISO 9001, ISO 14001, OHSAS 18001`);
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
  // The matched fragment is printed alongside the line: with shape-matching
  // rules the line is often long, and "what fired" is the first thing a reader
  // needs in order to decide whether the copy or the rule is wrong.
  for (const hit of hits) console.log(`  ${hit.file}:${hit.line}: [${hit.match}] ${hit.text}`);
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
