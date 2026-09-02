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

/**
 * The Turkish dotted/dotless I trap — and it hid a live claim.
 *
 * JavaScript's `/i` flag canonicalises by `toUpperCase`, which is ASCII-shaped:
 * `ı` (U+0131) upper-cases to `I`, but `İ` (U+0130) upper-cases to itself. So
 * `/kanıtlanmış/i` does NOT match `KANITLANMIŞ`, and `/garanti/i` does not match
 * `GARANTİ`. Every uppercase heading in this codebase — and headings are where
 * the loudest claims live — was invisible to half the rule table.
 *
 * `SiteFooter.tsx:166` shipped `KANITLANMIŞ TESLİM.` into `dist/` past a
 * `kanıtlanmış` rule that was written for exactly it.
 *
 * Fix: fold the I-family in BOTH the scanned text and the pattern sources, so
 * the two ends agree. Folding is one-for-one, so character offsets — and the
 * line map built from them — are unaffected, and an unfolded copy is kept for
 * reporting so a violation still prints the Turkish a human wrote.
 */
const foldTurkishI = (s) => s.replace(/ı/g, "i").replace(/İ/g, "I");
/** Rebuilds a pattern so it matches the folded text. */
const trPattern = (re) => new RegExp(foldTurkishI(re.source), re.flags);

/**
 * Cyrillic and Greek letters that RENDER as Latin ones.
 *
 * `АS9100D` written with a Cyrillic А (U+0410) is pixel-identical to `AS9100D`
 * on screen and reaches the reader as the same claim, but no Latin-alphabet
 * pattern can see it. That is the same class as the zero-width split and the
 * HTML entity handled below — the claim is present in the OUTPUT and absent
 * from the SOURCE spelling — so it is closed the same way, by normalisation
 * rather than by another pattern.
 *
 * It is not only an attack shape: `useProcessProofCinema.ts` already spells
 * `talaş` with a Cyrillic а, by typo. The mapping is strictly one character to
 * one character, so offsets — and the character → line map — are unchanged, and
 * the unfolded copy is still what a violation prints.
 */
const HOMOGLYPHS = new Map(
  Object.entries({
    /* Cyrillic, upper */
    А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", У: "Y", Х: "X", Ѕ: "S", І: "I", Ј: "J",
    /* Cyrillic, lower */
    а: "a", в: "b", е: "e", к: "k", м: "m", о: "o", р: "p", с: "c", т: "t", у: "y", х: "x", ѕ: "s", і: "i", ј: "j",
    /* Greek, upper */
    Α: "A", Β: "B", Ε: "E", Ζ: "Z", Η: "H", Ι: "I", Κ: "K", Μ: "M", Ν: "N", Ο: "O", Ρ: "P", Τ: "T", Υ: "Y", Χ: "X",
    /* Greek, lower. `µ`/`μ` are deliberately absent: they are the micron unit. */
    ο: "o", ν: "v", ρ: "p", τ: "t", χ: "x",
  }),
);
const foldHomoglyphs = (s) => s.replace(/[Ͱ-ϿЀ-ӿ]/g, (ch) => HOMOGLYPHS.get(ch) ?? ch);

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

  const display = chars.join("");
  // Same length, same offsets — only the I-family and the homoglyphs differ.
  return { text: foldHomoglyphs(foldTurkishI(display)), display, lineOf: Int32Array.from(lines) };
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
// The trailing `[A-Z]{0,3}` matters: without it `API 6A`, `API 6D` and
// `API 5CT` do not match at all, because the designator ends in a letter with
// no separator before it. All three shipped as "standartlarına tam uyum".
const STANDARD_TOKEN =
  /\b(?:TS\s+)?(?:EN\s+)?(?:ISO|IEC|EN|DIN|ASTM|ASME|ANSI|AWS|AMS|SAE|API|NAS|BS|JIS|MIL|NACE|NF|UNI|GOST|AQAP|OHSAS|IATF|NADCAP|IPC|VDI|VDA|AS|CFR|MDR)[\s/-]?(?:IEC[\s/-]?)?(?:[A-Z]{1,3}[- ]?)?\d{1,6}[A-Z]{0,3}(?:[.\-–/][0-9A-Za-z]{1,4})*\b/g;

/**
 * A spec-table row that DECLARES a certificate or standard:
 * `{ label: "Sertifika", value: "EN 1090" }`.
 *
 * Sentence scoping is right for prose and wrong here — the label and the value
 * are separate string literals, so a sentence-scoped rule reads them as two
 * unrelated claims when they are in fact one: "our certificate is EN 1090".
 * The value is checked against the same §C allow-list.
 */
const LABEL_VALUE_CLAIM =
  /(?:label|title|name|key)\s*:\s*["'`](?:Sertifika|Sertifikasyon|Standart|Belge|Akreditasyon|Uygunluk)[^"'`]*["'`]\s*,\s*(?:value|val|text|desc)\s*:\s*["'`]([^"'`]*)["'`]/g;

/* ── blind spot 1: a standards BODY named with NO designation ──────────────
   `unauthorised-standard-conformity` used to iterate `STANDARD_TOKEN` matches
   and only THEN consult the conformity context. `ASTM standartlarına tam uyum`
   carries no digits, so it produced no token, so the scan produced nothing —
   even though the conformity half of the rule matched the sentence perfectly.
   The rule never got to ask it, and the claim shipped.

   Claiming full conformity to an entire standards BODY is STRICTLY BROADER
   than claiming conformity to one numbered standard, so the narrow claim
   firing while the wide one is silent is exactly backwards. The conformity
   test below therefore runs INDEPENDENTLY of whether a token was found.       */

/**
 * A body name used as a standards reference, with no designation after it.
 *
 * Two tiers, because four of these abbreviations are also ordinary words:
 * `EN` is Turkish "most/width", `AS` hides inside `HASSAS`, `TS` and `NF`
 * appear in identifiers. Those four only match in front of an UNAMBIGUOUS
 * standards noun; the rest also match in front of an attestation noun.
 */
const BODY = "ISO\\s*/\\s*IEC|ISO|IEC|DIN|ASTM|ASME|ANSI|AWS|AMS|SAE|API|NAS|JIS|MIL|NACE|UNI|GOST|AQAP|OHSAS|IATF|NADCAP|BS|TSE";
const AMBIGUOUS_BODY = "EN|AS|TS|NF";
/** Nouns that merely name a standards family — a reference until a predicate makes it a claim. */
const FAMILY_NOUN = "standar[dt]|norm|spesifikasyon|şartname|direktif|yönetmelik|kriter|gereklilik";
/**
 * Nouns that ARE the attestation, so the phrase is a claim on its own.
 * The initial is case-flexible (`ISO Uyum Raporu` is a heading) while the BODY
 * stays case-sensitive: lower-cased, `MIL` is the Turkish word for a shaft and
 * `delik-mil uyumu` is an ordinary fit tolerance, not a claim.
 */
const ATTESTATION_NOUN = "[Uu]yum|[Uu]ygunluk|[Oo]nay|[Bb]elge|[Ss]ertifika|[Aa]kredit";
const BODY_FAMILY_REFERENCE = new RegExp(
  `\\b(?:${BODY}|${AMBIGUOUS_BODY})\\s+(?:${FAMILY_NOUN})[A-Za-zçğıîöşüâ]*`,
  "g",
);
const BODY_ATTESTATION_CLAIM = new RegExp(`\\b(?:${BODY})\\s+(?:${ATTESTATION_NOUN})[A-Za-zçğıîöşüâ]*`, "g");

/**
 * The predicate that turns "named a standards family" into "claimed conformity
 * to it".
 *
 * Deliberately NOT `CONFORMITY_CONTEXT`: that list contains
 * `standar[dt]…nda\b`, which the phrase `ANSI, DIN ve JIS standartlarında boru
 * bağlantı parçaları` satisfies with its own words. That sentence names the
 * dimensional standard families a FITTING is made to — the same engineering
 * reference the token rule deliberately permits for `ASME B16.5` and
 * `ISO 2768-m` — and it asserts no audit. The locative ("in the standards")
 * describes the part; a conformity predicate ("full conformity to the
 * standards") describes the company. Only the second one fires.
 */
const BODY_CONFORMITY_PREDICATE = trPattern(
  /tam uyum|uyum sağl|uyumlu|uygunluk|uygun olarak|uygun üret|uygun imal|sertifika|belgeli|belgemiz|akredit|onayl|tescil|denetim|standar[dt][A-Za-zçğıîöşüâ]{0,12}\s*(?:uygun|göre)|kapsam[ıi]nda\s*(?:üret|imal)/i,
);

/* ── blind spot 2: the header is the predicate ─────────────────────────────
   `LABEL_VALUE_CLAIM` reads a spec row written as an object literal, so it sees
   `{ label: "Sertifika", value: "EN 1090" }` as the single claim it is. A
   comparison table is `{ title, headers: [...], rows: [[...]] }`: the column
   HEADING that gives a cell its meaning lives in a DIFFERENT array from the
   cell, and `SENTENCE_BREAK` — which breaks on `"` followed by `,` — treats
   adjacent array entries as unrelated. That is right for prose and wrong for a
   matrix, where under a column headed `Sertifika` the cell `EN 10204 3.1`
   asserts "the certificate you get is EN 10204 3.1".

   Two kinds of column, and the difference matters as much as the rule:

   - A DOCUMENT column (`Sertifika`, `Belge`, `Akreditasyon`, `Onay`,
     `Uygunluk`, `Rapor`) names something MAS issues or holds. Every cell is an
     attestation, so §C applies to every cell — and a cell needs no number at
     all (`CoC`, `sertifikalı`) to make the claim.
   - A SPECIFICATION column (`Standart`, `Norm`) names which specification
     governs the row's process — `ASTM A967` for nitric passivation,
     `EN ISO 17636` for radiography. That is the precision vocabulary §0
     PUBLIC_POSITIONING_PRIORITY asks for and the token rule already permits in
     prose, so its cells are tested exactly as prose tokens are: they fire only
     when the designation asserts an audit merely by being named
     (`CONFORMITY_BY_NATURE` — management systems and qualification schemes).
     Parking `AS9100D` in a `Standart` column therefore still fires.           */
const TABLE_BLOCK = /headers:\s*\[([^\]]*)\]\s*,\s*rows:\s*\[([\s\S]*?)\n\s*\],/g;
const DOCUMENT_COLUMN = trPattern(/sertifika|belge|akredit|uygunluk|onay|rapor/i);
const SPECIFICATION_COLUMN = trPattern(/standar[dt]|norm/i);
/** Cell words that assert an attestation with no designation of any kind. */
const CELL_ATTESTATION = trPattern(/\bCoC\b|\bCofC\b|sertifikal|belgeli|akredite|\b3\.[12]\b/i);
/**
 * ANY designation-shaped cell under a DOCUMENT column, whether or not its body
 * is one the token list knows. The column heading already says the cell is a
 * document MAS supplies, and §C supplies three; so the allow-list applies to
 * the whole column and a body nobody has heard of does not get a free pass.
 * (`IPC-A-610` under `Belge` was silent until this existed.)
 */
const CELL_DESIGNATION = /\b[A-Z]{2,6}[\s/-]?(?:[A-Z]{1,3}[- ]?)?\d/;

/**
 * What the three §C certificates actually attest: a MANAGEMENT SYSTEM.
 * Used to bound the `attestation-adjective` exemption — see that rule.
 */
const MANAGEMENT_SYSTEM_SUBJECT = trPattern(
  /(?:kalite|çevre|iş sağlığı|isg|enerji|bilgi güvenliği)?\s*yönetim\s*sistem|kalite sistemi|QMS|EMS/i,
);

/**
 * `keywords: [ … ]` spans, used by ONE rule's exemption — see
 * `unconditional-guarantee`. A keyword array is matcher input: `grep` over
 * `src/` shows `keywords` is read only by `findBestFaqMatch` and rendered
 * nowhere.
 */
let keywordSpanCache = { text: null, spans: [] };
function keywordArraySpans(text) {
  if (keywordSpanCache.text === text) return keywordSpanCache.spans;
  const spans = [];
  const re = /\bkeywords\s*:\s*\[/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const close = text.indexOf("]", m.index + m[0].length);
    if (close !== -1) spans.push([m.index, close]);
  }
  keywordSpanCache = { text, spans };
  return spans;
}
const insideKeywordArray = (text, index) => keywordArraySpans(text).some(([a, b]) => index > a && index < b);

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
    "uygun üretim",
    "uygun imalat",
    `spesifikasyon${TRW}{0,6}\\s*uygun`,
    `standar[dt]${TRW}{0,12}\\s*(?:uygun|göre|üret|imal|uyum|çal[ıi]ş)`,
    `standar[dt]${TRW}{0,4}nda\\b`,
    // Restored. `kapsamında üretim` and `…ne sahibiz` were dropped from this
    // list by the widening commit, which is a NARROWING inside a widening:
    // `EN ISO 3834-2 kapsamında üretim` is the literal shape of copy that was
    // live two commits earlier, and `EN 9120 yetkinliğine sahibiz` says the
    // same thing with a different verb. Both are scoped so they cannot reach
    // ordinary engineering prose: `kapsam…` must be followed by a production
    // verb, and `sahi(b|p)` must be possessing an ATTESTATION noun, not a
    // material property ("7.85 g/cm³ yoğunluğa sahiptir").
    `kapsam${TRW}{0,6}\\s*(?:üret|imal|çal[ıi]ş|hizmet|faaliyet)`,
    `(?:sertifika|belge|akredit|onay|yetki|yeterlilik|kalifikasyon|niteli[kğ])${TRW}{0,12}\\s*sahi(?:biz|p|ptir|bim)`,
  ].join("|"),
  "i",
);
// Folded like every other pattern, so `SERTİFİKALI` and `STANDARDINA` reach it.
const CONFORMITY_CONTEXT_FOLDED = trPattern(CONFORMITY_CONTEXT);

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

/**
 * The sentence containing `index`.
 *
 * Scoping the standards rule to the SENTENCE rather than the line is what makes
 * it precise enough to keep. "Sızdırmazlık yüzeyleri ASME B16.5 FF/RF
 * geometrisinde işlenir. … malzeme sertifikası talebe bağlı olarak sağlanır."
 * is two claims: an interface geometry and a document offer. Neither says the
 * company is audited to ASME B16.5, and a line-scoped rule cannot tell.
 *
 * A period only ends a sentence when it is not inside a standard designation:
 * `ASME B16.5` and `EN 10204 3.1` both carry an internal dot, so the boundary
 * requires a non-digit before and whitespace after. String-literal boundaries
 * count too — adjacent array entries are separate claims.
 */
const SENTENCE_BREAK = /[\n]|(?<=[^\d\s])[.!?](?=\s)|["'`]\s*,/g;
function sentenceAt(text, index) {
  SENTENCE_BREAK.lastIndex = 0;
  let start = 0;
  let m;
  while ((m = SENTENCE_BREAK.exec(text)) !== null) {
    if (m.index >= index) return text.slice(start, m.index + m[0].length);
    start = m.index + m[0].length;
  }
  return text.slice(start);
}

/* ── rules ─────────────────────────────────────────────────────────────────
   Each rule is either a `pattern` (matched against the normalised text) or a
   `scan` (a generator, for rules that need to reason about a match rather than
   merely find one).                                                          */

/**
 * @typedef {{ id: string, pattern?: RegExp, scan?: (text: string) => Generator<{ index: number, match: string }>, exempt?: (text: string, index: number) => boolean, authority: string, remedy: string }} Rule
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
        // window → quote vocabulary. The return verb is matched in its
        // CONJUGATED forms too: the noun list caught `dönüş` and walked past
        // `size döneceğiz`, which is how a human actually writes the promise.
        String.raw`\b(?:\d{1,3}\s?(?:saat|sa\.|saatte|saatlik)|aynı gün|ertesi gün|birkaç saat)` +
          String.raw`[^.!?;{}]{0,120}?(?:teklif|fiyatland|fiyat ver|dönüş|geri dön|dönec|dönüyor|döneriz|döner\b|yanıtl|yanıt|cevapl|cevap|görüşl?e|bildir)`,
        // quote vocabulary → window
        String.raw`(?:teklif|fiyatland|fiyat ver|dönüş|geri dön|dönec|dönüyor|döneriz|yanıtl|yanıt|cevapl|cevap|RFQ)` +
          String.raw`[^.!?;{}]{0,120}?\b(?:\d{1,3}\s?(?:saat|sa\.|saatte|saatlik)|aynı gün|ertesi gün|birkaç saat)`,
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
    // The third alternation covers a QUANTIFIED PROJECT OUTCOME —
    // `%70 maliyet ↓`, `ortalama %30-50 maliyet tasarrufu`. A saving is only a
    // fact if a project produced it, and §G says none was supplied. This was
    // the last shape with no rule at all: the fabricated "DFM Başarı Vaka
    // Çalışmaları" table stated its four outcomes as bare table cells with no
    // vocabulary any other rule could see.
    // The last alternation covers a rate written entirely in WORDS — "yüzde
    // doksan sekiz" is the same disclosure as "%98" and reads the same on
    // screen. It is anchored to a performance noun in both directions so a
    // spelled-out number in ordinary prose does not fire.
    pattern:
      /(?:%\s?|yüzde\s+)\d{1,3}([.,]\d+)?\s*(zamanında|teslimat oranı|başarı|kalite oranı|verimlilik|doğruluk|ilk seferde|hatasız|fire|hurda|red oranı)|(zamanında teslimat|teslimat oranı|başarı oranı|kalite oranı|hatasız üretim|müşteri memnuniyeti)[^.\n]{0,30}(?:%\s?|yüzde\s+)\d|(zamanında teslimat|teslimat oran|başarı oran|kalite oran|hatasız üretim|müşteri memnuniyet|verimlilik|doğruluk oran)[^.\n]{0,30}yüzde\s+(?:yüz|doksan|seksen|yetmiş|altmış|elli|kırk|otuz|yirmi|on\b|dokuz|sekiz|yedi|altı|beş|dört|üç|iki|bir)|yüzde\s+(?:yüz|doksan|seksen|yetmiş|altmış|elli)[^.\n]{0,30}(zamanında|teslimat oran|başarı oran|kalite oran|hatasız|verimlilik)|(?:%\s?|yüzde\s+)\d{1,3}(\s?-\s?\d{1,3})?(['’]?[a-zçğıöşü]{0,3})?\s*(tasarruf|maliyet|süre|ağırlık|kazanç|iyileş|azalma|artış)|(tasarruf|maliyet düşüşü|verim artışı)[^.\n]{0,20}(?:%\s?|yüzde\s+)\d/gi,
    authority:
      "§D ON_TIME_DELIVERY_INTERNAL: 95% (PUBLIC_IF_VERIFIED_AND_STRATEGIC — condition not met) · OTHER_PUBLIC_KPIS: NONE · §G CASE_STUDIES: NONE_PROVIDED_YET",
    remedy:
      "No self-graded performance percentage and no quantified project outcome is published. See ON_TIME_DELIVERY in src/content/claims.ts.",
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
    // The `N'den fazla / üzerinde / aşkın` form is the same disclosure as
    // `N+`, written out. `500'den fazla malzeme çeşidi` is §D
    // MATERIAL_COUNT_INTERNAL: UNKNOWN_REMOVE_IF_UNVERIFIED with
    // MATERIAL_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE — unverified AND
    // withheld — and the glyph-bound rule never saw it.
    pattern: new RegExp(
      [
        String.raw`\b\d[\d.,]*\s?K?\s?\+?\s*(?:adet\s+)?(?:CNC\s+)?(?:tezgah|tezgâh|makine|işleme merkezi|mühendis|teknisyen|personel|çalışan|operatör|kişilik ekip|müşteri|m²|m2\b|metrekare)`,
        String.raw`\b\d[\d.,]*\s?m²`,
        // Spelled-out magnitude. "15 bin metrekare" discloses exactly what
        // "15.000 m²" discloses and reads identically to a buyer.
        String.raw`\b\d[\d.,]*\s+(?:bin|milyon)\s+(?:m²|m2\b|metrekare|adet|tezgah|tezgâh|makine|mühendis|teknisyen|personel|çalışan|müşteri|parça|proje)`,
        String.raw`\b\d[\d.,]*\s?\+\s*(?:parça|malzeme|proje|çeşit)`,
        // Stock tonnage is order-volume disclosure: it tells a reader what the
        // company buys and turns over. §D REVENUE_OR_ORDER_VOLUME.
        String.raw`(?:stok|stokta|depo)\w*[^.\n]{0,60}?\b\d[\d.,]*\s?(?:kg|ton)\b`,
        String.raw`\b\d[\d.,]*\s?(?:kg|ton)\b[^.\n]{0,60}?(?:stok|depo)`,
        String.raw`\b\d[\d.,]*['’´]?(?:d[ae]n|t[ae]n)?\s*(?:fazla|üzerinde|aşkın)\s+(?:farklı\s+)?(?:malzeme|tezgah|tezgâh|makine|mühendis|teknisyen|personel|çalışan|müşteri|proje|parça)`,
        String.raw`\b24\s?\/\s?7|\b7\s?\/\s?24`,
      ].join("|"),
      "gi",
    ),
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
    // `HAZIRLANIYOR` is matched UPPERCASE-ONLY, and only as a shouted heading.
    // Lower-case "hazırlanıyor" is a transient progress message — "Rapor
    // hazırlanıyor…", "Sayfa hazırlanıyor." — which is a loading state, not a
    // coming-soon affordance. The claim this rule exists for was the heading
    // `KAYNAKLAR HAZIRLANIYOR` over four documents that were never in the
    // build. (Before the I-fold below, the `/i` flag never reached the
    // lower-case form at all, so this distinction had not come up.)
    scan: function* (text) {
      const shouted = /DEMO İÇERİK|ÖRNEK İÇERİK|HAZIRLANIYOR|GERÇEK RAPOR DEĞİLDİR|COMING SOON/g;
      const anyCase = trPattern(/TEMSİL[İÎ]|demo içerik|örnek içerik|coming soon/gi);
      for (const re of [trPattern(shouted), anyCase]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text)) !== null) yield { index: m.index, match: m[0] };
      }
    },
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
    //
    // `güvence` now gets the same inflection treatment `garanti` has, but
    // ANCHORED TO THE VERB, because the two senses of the word are not the same
    // claim. "Kalite güvencesi sağlıyoruz" is quality ASSURANCE, the discipline
    // — ordinary engineering vocabulary that §0 PUBLIC_POSITIONING_PRIORITY
    // asks for. "Teslimat güvencesi veriyoruz" is a promise GIVEN. The verb is
    // what separates them, so only `ver…`, `alt(ı|i)na al…` and `taahhüt` fire.
    pattern:
      /\bgaranti(?:\b|si|sini|siyle|sıyla|li|lidir|liyoruz|yoruz|mizdir)|garanti\s+(?:ed|alt|kapsam|veriyor|sunuyor)|\bgüvence(?:si|sini|leri|lerini|miz|mizi|mi)?\s+(?:ver|alt[ıi]na\s+al|taahhüt|ediyoruz|eder\b|edilir)|taahhüt\s+(?:ediyoruz|eder|edilir)/gi,
    // A `keywords: [...]` array is MATCHER INPUT, not published copy: nothing in
    // `src/` renders it, and `findBestFaqMatch` is the only reader. The Phase 06
    // removal of the fabricated guarantee FAQ was correct and stays; but it left
    // the most commercially loaded question on the site — "garanti veriyor
    // musunuz" — routing to the DFM design-support answer at 0.67, a confident
    // wrong answer. Routing it to the true returns policy needs the WORD in a
    // keyword list, and nothing else. The exemption is deliberately narrow: this
    // rule only, inside `keywords: [ … ]` only. Every other rule still applies
    // there, so a certificate or a scale figure cannot be laundered through it.
    exempt: (text, index) => insideKeywordArray(text, index),
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
          // The conditioning clause only conditions the promise while it is not
          // CANCELLED. The keyphrase alone was a parking space: "Her sevkiyat,
          // kontrol planında tanımlananların DIŞINDA da tam boyutsal muayeneden
          // geçer" wore the exemption while promising the exact opposite of it.
          // A cancelling preposition right after the clause withdraws it.
          // (The window stays wide on purpose: `\w*` above backtracks, so
          // narrowing the window would only have moved the hole.)
          String.raw`(?![^.\n]{0,40}kontrol plan[ıi]nda tan[ıi]mlan(?![^.\n]{0,24}(?:d[ıi]ş[ıi]nda|haricinde|ötesinde|fazlas[ıi]|ek olarak)))` +
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
        if (CONFORMITY_BY_NATURE.test(token) || CONFORMITY_CONTEXT_FOLDED.test(sentenceAt(text, m.index))) {
          yield { index: m.index, match: token };
        }
      }
      LABEL_VALUE_CLAIM.lastIndex = 0;
      while ((m = LABEL_VALUE_CLAIM.exec(text)) !== null) {
        STANDARD_TOKEN.lastIndex = 0;
        const declared = m[1].match(STANDARD_TOKEN) ?? [];
        for (const raw of declared) {
          const token = raw.replace(/\s+/g, " ").trim();
          if (ALLOWED_STANDARDS.some((re) => re.test(token))) continue;
          yield { index: m.index, match: token };
        }
      }

      // BLIND SPOT 1. This pass does NOT depend on a token being found, which
      // is the whole point: "ASTM standartlarına tam uyum" has no designation
      // to iterate. The conformity context is evaluated on its own.
      BODY_ATTESTATION_CLAIM.lastIndex = 0;
      while ((m = BODY_ATTESTATION_CLAIM.exec(text)) !== null) {
        // `ISO Uyum Raporu`, `ASTM sertifikalı`: the noun IS the attestation,
        // so the phrase is a claim without any further predicate.
        yield { index: m.index, match: m[0] };
      }
      BODY_FAMILY_REFERENCE.lastIndex = 0;
      while ((m = BODY_FAMILY_REFERENCE.exec(text)) !== null) {
        if (BODY_CONFORMITY_PREDICATE.test(sentenceAt(text, m.index))) {
          yield { index: m.index, match: m[0] };
        }
      }
    },
    authority: "§C — only ISO 9001, ISO 14001 and OHSAS 18001 are supplied; every other standard is unheld",
    remedy:
      "Describe the practice, not the standard you are audited against. Asserting conformity to a standard the company has not declared is a claim a customer's own submission depends on.",
  },
  {
    id: "table-column-attestation",
    // BLIND SPOT 2 — see TABLE_BLOCK above. The claim lives in a `rows` cell
    // and its predicate lives in the `headers` array, so no sentence-scoped or
    // object-literal rule can associate the two. This one walks the table.
    scan: function* (text) {
      TABLE_BLOCK.lastIndex = 0;
      let block;
      while ((block = TABLE_BLOCK.exec(text)) !== null) {
        const headerText = block[1];
        const headers = [...headerText.matchAll(/["'`]([^"'`]*)["'`]/g)].map((h) => h[1]);
        const document = [];
        const specification = [];
        headers.forEach((h, i) => {
          if (DOCUMENT_COLUMN.test(h)) document.push(i);
          else if (SPECIFICATION_COLUMN.test(h)) specification.push(i);
        });
        if (document.length === 0 && specification.length === 0) continue;

        const rowsOffset = block.index + block[0].indexOf(block[2]);
        for (const row of block[2].matchAll(/\[([^\]]*)\]/g)) {
          const cellMatches = [...row[1].matchAll(/["'`]([^"'`]*)["'`]/g)];
          const at = (col) => {
            const cell = cellMatches[col];
            // +1 skips the row's opening `[`, so the reported offset lands on
            // the cell itself and the character → line map stays honest.
            return cell ? { value: cell[1], index: rowsOffset + row.index + 1 + cell.index } : null;
          };
          for (const col of document) {
            const cell = at(col);
            if (!cell) continue;
            STANDARD_TOKEN.lastIndex = 0;
            const unheld = (cell.value.match(STANDARD_TOKEN) ?? []).filter(
              (raw) => !ALLOWED_STANDARDS.some((re) => re.test(raw.replace(/\s+/g, " ").trim())),
            );
            if (unheld.length > 0) yield { index: cell.index, match: unheld[0] };
            else if (CELL_ATTESTATION.test(cell.value) || CELL_DESIGNATION.test(cell.value))
              yield { index: cell.index, match: cell.value };
          }
          for (const col of specification) {
            const cell = at(col);
            if (!cell) continue;
            STANDARD_TOKEN.lastIndex = 0;
            for (const raw of cell.value.match(STANDARD_TOKEN) ?? []) {
              const token = raw.replace(/\s+/g, " ").trim();
              if (ALLOWED_STANDARDS.some((re) => re.test(token))) continue;
              if (CONFORMITY_BY_NATURE.test(token)) yield { index: cell.index, match: token };
            }
          }
        }
      }
    },
    authority: "§C — only ISO 9001, ISO 14001 and OHSAS 18001 are supplied; every other standard is unheld",
    remedy:
      "In a matrix the column heading is the predicate. A cell under 'Sertifika' publishes a document you issue; say what you actually keep, on the terms the rest of the page states.",
  },
  {
    id: "attestation-adjective",
    // `sertifikalı` used as a MODIFIER asserts that an attestation exists for
    // the thing it modifies — "sertifikalı kaynakçılar", "AMS sertifikalı
    // malzeme tedarik", "havacılık ve medikal sınıf sertifikalı malzemeler".
    // None of the three needs a standard number to make the claim, so the
    // standards rule cannot see them.
    //
    // `sertifikası` / `sertifikasyon` as a NOUN is deliberately not matched: a
    // document offered on request ("malzeme sertifikası talebe bağlı olarak
    // sağlanır") is a supply practice, not a claim that MAS is audited.
    //
    // `akredite` is excluded in exactly one form — "akredite üçüncü taraf",
    // which §D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND
    // authorises verbatim. Any other accreditation claim fires.
    // It does NOT fire when an allow-listed certificate is named in the same
    // sentence: `title: "ISO 9001:2015", desc: "Sertifikalı kalite yönetim
    // sistemi"` is a certificate MAS actually holds (§C ISO_9001_VALUE:
    // VERIFIED, PUBLIC_OK) and saying so is the correct copy.
    scan: function* (text) {
      // NOT `\bsertifikalı\b`. JS `\w` is ASCII, so `ı` (U+0131) is a non-word
      // character and there is no word boundary after it — the anchored form
      // silently matched nothing and let "AMS sertifikalı" and "sınıf
      // sertifikalı malzemeler" through. Turkish-final words need an explicit
      // letter lookaround instead.
      const re = trPattern(
        /(?<![\wçğıöşüâî])sertifikalı(?![\wçğıöşüâî])|\bsertifikasyonlu\b|\bbelgeli\b|\bakredite\s+(?!üçüncü\s+taraf|CMM|3\.\s?taraf)\S/gi,
      );
      let m;
      while ((m = re.exec(text)) !== null) {
        // The exemption is LINE-scoped, not sentence-scoped: a card is written
        // as `{ title: "ISO 9001:2015", desc: "Sertifikalı kalite yönetim
        // sistemi" }` and the certificate it names sits in a sibling string
        // literal, which sentence scoping would separate. Widening only the
        // exemption is safe — a line that names no permitted certificate still
        // fires.
        const lineStart = Math.max(0, text.lastIndexOf("\n", m.index) + 1);
        const lineEndRaw = text.indexOf("\n", m.index);
        const line = text.slice(lineStart, lineEndRaw === -1 ? text.length : lineEndRaw);
        const named = line.match(STANDARD_TOKEN) ?? [];
        const allAllowed =
          named.length > 0 &&
          named.every((raw) => ALLOWED_STANDARDS.some((r) => r.test(raw.replace(/\s+/g, " ").trim())));
        // …but line scoping ALONE made the §C card a parking space:
        // `{ title: "ISO 9001:2015", desc: "Sertifikalı kaynakçılarımız ile
        // üretim" }` claimed the exemption for a WELDER qualification, which
        // ISO 9001 does not award. So the exemption now has two doors, and a
        // claim has to walk through one of them:
        //
        //   (a) the permitted certificate is in the SAME string literal, right
        //       next to the adjective — `"ISO 9001 sertifikalı, proses
        //       kontrollü üretim"`. The reader sees which certificate is meant,
        //       because it is in the same sentence they are reading.
        //   (b) the certificate is elsewhere on the line (the sibling-literal
        //       card shape) AND the thing called certified is what those three
        //       certificates actually attest: a MANAGEMENT SYSTEM — quality
        //       (9001), environmental (14001), occupational health and safety
        //       (18001). `"Sertifikalı kalite yönetim sistemi"` keeps it; a
        //       certified welder, material, laboratory or process does not.
        const litFrom = Math.max(
          text.lastIndexOf('"', m.index),
          text.lastIndexOf("'", m.index),
          text.lastIndexOf("`", m.index),
          lineStart,
        );
        let litTo = lineEndRaw === -1 ? text.length : lineEndRaw;
        for (const q of ['"', "'", "`"]) {
          const i = text.indexOf(q, m.index);
          if (i !== -1 && i < litTo) litTo = i;
        }
        const literal = text.slice(litFrom, litTo);
        const inLiteral = literal.match(STANDARD_TOKEN) ?? [];
        const sameLiteralCert =
          inLiteral.length > 0 &&
          inLiteral.every((raw) => ALLOWED_STANDARDS.some((r) => r.test(raw.replace(/\s+/g, " ").trim())));
        const managementSystem = MANAGEMENT_SYSTEM_SUBJECT.test(text.slice(m.index, m.index + 60));
        if (!(sameLiteralCert || (allAllowed && managementSystem))) yield { index: m.index, match: m[0] };
      }
    },
    authority: "§C — only ISO 9001, ISO 14001 and OHSAS 18001 are supplied · §D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND",
    remedy:
      "Calling a material, a person or a process 'sertifikalı' asserts a third-party attestation. Name the record you actually keep, or the specification the customer supplied.",
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

// Every `pattern` is rebuilt against the folded alphabet, so a rule may be
// WRITTEN in ordinary Turkish (`kanıtlanmış`) and still match the uppercase
// form (`KANITLANMIŞ`) that JavaScript's `/i` flag cannot reach. `scan` rules
// fold their own regexes at the point of use.
for (const rule of RULES) {
  if (rule.pattern) rule.pattern = trPattern(rule.pattern);
}

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
  const { text, display, lineOf } = normalise(blankComments(raw, abs.endsWith(".html")));
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
      if (rule.exempt?.(text, hit.index)) continue;
      const line = lineOf[hit.index] ?? 0;
      const key = `${rule.id}:${line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Report from the UNFOLDED copy: offsets are identical, and a violation
      // must print the Turkish that is actually in the file.
      violations.push({
        rule,
        file: rel,
        line,
        match: display.substr(hit.index, hit.match.length),
        text: lineTextOf(display, hit.index),
      });
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
  console.log(
    `# normalisation: zero-width strip, HTML-entity decode, string-concat join, \${} interpolation join, Turkish-I fold, Cyrillic/Greek homoglyph fold`,
  );
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
