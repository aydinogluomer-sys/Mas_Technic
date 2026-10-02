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
 *     node scripts/claims-gate.mjs --also-scan=<path>
 *                                             # scan one extra file as well as
 *                                             # the roots. Adds coverage only;
 *                                             # see EXTRA_SCAN_FILES below.
 *
 * Comment lines are skipped. A rule may be discussed in a comment (that is how
 * the removals stay explainable) but never rendered.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
 *
 * 09a-C5 / R4-6 — AND THE JAVASCRIPT FAMILY, which this used to skip. Nothing
 * makes `.ts` the only extension a public string can live in: Vite compiles
 * `.js`, `.jsx`, `.mjs` and `.cjs` under `src/` exactly as happily, and it
 * resolves `.mjs`/`.js` BEFORE `.ts` for an extensionless import — so a
 * `src/content/claims.js` was what the app bundled and what neither instrument
 * read. There are zero such files in the tree today; the point is that the day
 * there is one it is scanned like anything else. `resolutionShadowsOf()` closes
 * the other half: a shadow carrying no forbidden claim of its own.
 */
const EXT = /\.([cm]?[jt]sx?|html|txt|xml|json|webmanifest|svg|md)$/;

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
 * Designations that name a CLASS the part is made to, not an audit the company
 * passed — used only by the `metaTitle` pass, where a badge list gives a rule no
 * sentence to read.
 *
 * `MIL-A-8625` names the Type I/II/III anodising class and `ISO 2768` names the
 * general tolerance class; both were adjudicated as correct engineering
 * vocabulary in the Phase 06 re-verification, and removing them would be
 * over-removal, which §0 PUBLIC_POSITIONING_PRIORITY makes a real failure. This
 * is an ALLOW-LIST like §C, not a deny-list with holes: a designation nobody has
 * invented yet is not on it, so it still fires in a title.
 */
const REFERENCE_CLASS_STANDARDS = [/^MIL-A-8625/i, /^ISO\s*2768/i];

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
/** A route/page title: a badge list, so no conformity predicate can ever appear in it. */
const META_TITLE = /\bmetaTitle\s*:\s*["'`]([^"'`]*)["'`]/g;
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
/* Exact honesty labels mandated by the implementation contract (§3 / M01,
   IMG01, PROOF01). Add a label here only when the contract gives its text
   verbatim; the `demo-placeholder-badge` rule fires on every other use. */
const CONTRACT_HONESTY_LABELS = [
  "Temsili malzeme görünümü; teknik seçim aşağıdaki kayıt ve çalışma koşullarına göre yapılır.",
];
const foldForLabel = (value) => value.replace(/[İIıi]/g, "i").toLowerCase();
const onContractHonestyLabel = (text, index) => {
  const start = text.lastIndexOf("\n", index) + 1;
  const end = text.indexOf("\n", index);
  const line = foldForLabel(text.slice(start, end === -1 ? text.length : end));
  const column = index - start;
  return CONTRACT_HONESTY_LABELS.some((label) => {
    const folded = foldForLabel(label);
    for (let at = line.indexOf(folded); at !== -1; at = line.indexOf(folded, at + 1)) {
      if (column >= at && column < at + folded.length) return true;
    }
    return false;
  });
};

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
/**
 * Turkish-aware word boundaries.
 *
 * `\b` is ASCII-only in JS: `ü`, `ş`, `ç`, `â` are not `\w`, so `\bünite`
 * never matches after a space and `sipariş\b` never matches before one.
 * Measured, not assumed — with `\b` the periodic-volume rule below read
 * `1000 ünite/gün` as SILENT, which is one of the exact shapes it exists to
 * catch. Any rule whose boundary sits next to a Turkish letter must use
 * these instead. Lookbehind is safe here: this script runs in Node only
 * (the browser-side filter in `src/content/claims.ts` deliberately avoids
 * it, for a reason recorded there).
 */
const NB = `(?<!${TRW})`;
const NA = `(?!${TRW})`;
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
 * A `scan` receives the repo-relative path as well as the text. Two rules need
 * it: a claim can be authorised in the LEDGER and forbidden everywhere else,
 * and a rule that cannot tell those apart has to choose between a false
 * positive on `claims.ts` and a hole everywhere else.
 *
 * `controls` is the rule's own proof, and it runs on EVERY invocation rather
 * than behind a flag — see `runControls()` below.
 *
 * @typedef {{ text: string, file?: string }} Control
 * @typedef {{ id: string, pattern?: RegExp, scan?: (text: string, file: string) => Generator<{ index: number, match: string }>, exempt?: (text: string, index: number) => boolean, controls?: { fires?: (string | Control)[], silent?: (string | Control)[] }, authority: string, remedy: string }} Rule
 */

/* ── shared shapes for the 09a-C2 lead-time rules ──────────────────────────
   Written once because two detectors and four controls have to agree about
   what a duration IS. A window is a number, optionally a range, followed by a
   time unit. The lookbehind refuses a digit or a separator before it, which is
   what keeps `100.000 saat fiber lazer ömrü` and `2.335 alfanümerik` out; and
   the absence of `+` in the token is what keeps `500+ saat (ASTM B117)` — salt
   spray, a MATERIAL PROPERTY — out. A coating's endurance is not a promise
   about when a part arrives.                                                  */
/* The trailing boundary is a LOOKAHEAD, not `\b`. JavaScript's `\w` is
   ASCII-only, so `\b` sees a word boundary between the `n` and the `ü` of
   `günü` and the token stops one character short of the word it is matching.
   Measured, not reasoned: `"5 iş günü"` matched `5 iş gün`, which then failed
   the closing quote of the cell detector, and four positive controls went
   green-on-red. Turkish suffixes are the whole point of this token, so the
   boundary has to know about Turkish letters. (`foldTurkishI` will rewrite the
   ı/İ inside this class; a character class survives that unchanged.)         */
const NOT_LETTER = String.raw`(?![0-9A-Za-zÇĞİÖŞÜçğıöşü])`;
const LEAD_TIME_WINDOW =
  String.raw`(?<![\d.,+])\d{1,3}(?:\s?[-–]\s?\d{1,3})?\s?(?:iş\s?)?(?:gün(?:ü|de|lük|ünde)?|hafta(?:da|lık)?|ay(?:da|lık)?|saat(?:te|lik)?)` +
  NOT_LETTER;

/** What makes a duration a DELIVERY duration rather than a process parameter. */
const DELIVERY_VOCAB = String.raw`teslim|teslimat|termin|sevkiyat|üretim sür|imalat sür|tedarik sür|analiz sür|çalışma sür|tamamlan|teslim ed|hazır ol`;

/** The worded half. None of these contains a digit, so no numeric sweep finds
    them, and they are the strongest commitments in the class: a same-day
    promise and a priced express tier. */
/* `acil` and `ekspres` need a LEADING word boundary. Without it `acil` matches
   inside `havacılık` — which, after the Turkish-I fold turns `havacılık` into
   `havacilik`, put this rule on four aerospace sentences that promise nothing
   at all: `Hakkimizda.tsx:119`, `categoryPages.ts:130`, `chatFaqData.ts:214`
   and the `havacilik-uzay` metaTitle. */
const WORDED_TIER = String.raw`aynı gün|ertesi gün|\bekspres|\bacil`;
const WORDED_DELIVERY_TIER =
  String.raw`(?:${WORDED_TIER})[^.!?;{}\n"]{0,60}?(?:teslim|tedarik|üretim|sevkiyat|hizmet)` +
  String.raw`|(?:teslim|tedarik|sevkiyat|üretim)[^.!?;{}\n"]{0,60}?(?:${WORDED_TIER})`;

/* ── 09a-C3: the published CAD format list ─────────────────────────────────
   THE RULE'S GROUND TRUTH IS READ FROM THE VALIDATOR, NOT WRITTEN HERE.

   `USER_INPUTS.md` §J says `ACCEPTED_CAD_FORMATS:
   DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`. A gate that hard-coded the
   accepted list would be the very defect it is checking for, one directory
   over — so it parses `CAD_ACCEPTED_EXTENSIONS` out of
   `src/utils/cadFiles.ts` on every run and fails loudly if it cannot.

   WHAT WENT WRONG, AND WHY A "CORRECT" LIST IS STILL A VIOLATION
   -------------------------------------------------------------
   Five places published a format list. Two were FALSE — `servicePages.ts:134`
   and `:89` offered Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX
   (.prt) and PDF/DWG, all nine of which `validateCadFile()` refuses; QA
   confirmed at runtime that a `.sldprt` upload produces "DOSYA REDDEDİLDİ".
   `:1943` offered CATIA/NX/SW under the label "Desteklenen CAD".

   The other two — `servicePages.ts:1967` and `pages/SSS.tsx:132` — were
   CORRECT ON THE DAY THEY WERE WRITTEN. They are in this rule anyway, and
   that is the whole point: a hand-written list tracks the validator only
   until somebody changes the validator, and then it goes stale in silence.
   The rule therefore does not ask "is this list true?", it asks "was this
   list DERIVED?" — because a derived list interpolates, and `normalise()`
   drops `${…}`, so a derived list leaves NO format token in the source at
   all. A literal that happens to be right is still a literal.

   THREE DETECTORS, because the class has three shapes:

     (A) RESTATED LIST, in `src/data/**` only. Two or more DISTINCT accepted
         extensions inside 80 characters. `src/data` is copy with no code in
         it, so a run of format names there can only be a published list.
         Restricted to `src/data` on purpose: `pages/CADDashboard.tsx` is a
         local STL/OBJ/STEP viewer whose `accept=".stl,.obj,.step,.stp"` and
         `ext === "step"` comparisons are CODE, and a rule that fired on a
         file-type check would be switched off within a week. Two tokens are
         required, not one, because `toleranceMaterials.ts` uses `STL` as an
         abbreviation for STEEL (`"STL·4140·QT"`).

     (B) ACCEPTANCE ASSERTION, everywhere. A format name — accepted OR
         rejected — inside a sentence that OFFERS it. This is the detector
         that separates a promise from a warning, and the boundary is the
         Turkish verb, not the topic:
           "…formatlarını destekliyoruz"        offers   → fires
           "…doğrudan işleyebiliyoruz"          offers   → fires
           "…dosyalarını yükleyebilirsiniz"     offers   → fires
           "…yükleme adımından geçmez"          refuses  → silent
           "…yükleyebilir miyim?"               asks     → silent
           "CATIA ve SolidWorks ile 3D modelleme"  toolchain → silent
         The last one matters: naming the CAD software our engineers model IN
         is a capability claim, not a statement about what a visitor may send,
         and over-removal here would delete true content.

     (C) LABEL / VALUE, where the offer is in the LABEL and the list in the
         VALUE — `{ label: "Desteklenen CAD", value: "STEP, IGES, CATIA, NX,
         SW" }` — one claim split across two string literals, which no
         sentence-scoped detector can see. The label must carry the OFFER
         (`desteklenen`, `kabul`, `yükle`), not merely the topic: with `cad`
         or `format` alone this fires on `{ label: "Rapor Formatı", value:
         "PDF + revize CAD" }`, which describes the report WE deliver.

   `src/utils/cadFiles.ts` is the one file allowed to spell the list. It is
   the authority; asking it to derive from itself is incoherent.            */

/* 09a-C5 / R4-6 — A `.js` SHADOW WOULD BE INVISIBLE TO BOTH INSTRUMENTS.
   Vite's default `resolve.extensions` is
   `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`. Every publication
   site imports the ledger without an extension — `from "@/content/claims"` — so
   a `src/content/claims.mjs`, `.js` or `.mts` sitting beside `claims.ts`
   RESOLVES FIRST. The app would bundle the shadow while both instruments read
   `claims.ts`: the type pin stays green, this check reads the tuple it was
   pointed at, and the published CAD strings could say anything at all. `EXT`
   did not scan those extensions either, so the shadow was not even walked.

   There are ZERO such files today; this is latent, and it is closed twice. `EXT`
   now walks the JavaScript family, so a shadow is at least SCANNED like any
   other public source — and the RESOLUTION is asserted here, for the ledger and
   for the authority, because scanning alone would only catch a shadow that
   happened to contain a forbidden claim. Only the extensions that sort BEFORE
   `.ts` can shadow, so only those are named: a `.tsx` sibling is an ordinary
   duplicate, not an override. */
const SHADOWING_EXTENSIONS = [".mjs", ".js", ".mts"];

/** Files that would win module resolution against `relFile`. */
function resolutionShadowsOf(relFile) {
  const stem = resolve(REPO_ROOT, relFile).replace(/\.tsx?$/, "");
  return SHADOWING_EXTENSIONS.map((ext) => `${stem}${ext}`)
    .filter((abs) => existsSync(abs))
    .map((abs) => relative(REPO_ROOT, abs).replace(/\\/g, "/"));
}

const CAD_AUTHORITY_FILE = "src/utils/cadFiles.ts";

/** `["A","B","C"]` → `"A, B ve C"` — the Turkish join the copy actually uses. */
const joinTurkish = (parts) =>
  parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} ve ${parts[parts.length - 1]}`;

function readAcceptedCadExtensions() {
  const abs = resolve(REPO_ROOT, CAD_AUTHORITY_FILE);
  /* 09a-C5 / R4-6. The authority is read as TEXT, so a `.mjs`/`.js`/`.mts`
     sibling would be what the app imports while this parses the file beside it
     — the same shadow that can rewrite the ledger can rewrite the ground truth,
     and then every CAD rule below is derived from a list nothing ships. It
     throws rather than reporting, because there is no honest report to make. */
  const shadowed = resolutionShadowsOf(CAD_AUTHORITY_FILE);
  if (shadowed.length > 0) {
    throw new Error(
      `claims-gate: ${CAD_AUTHORITY_FILE} is shadowed by ${shadowed.join(", ")}; ` +
        "module resolution prefers .mjs/.js/.mts over .ts, so that file — not this one — is the " +
        "validator the app ships. Delete it.",
    );
  }
  if (!existsSync(abs)) {
    throw new Error(`claims-gate: ${CAD_AUTHORITY_FILE} is missing; the CAD rule has no ground truth.`);
  }
  const source = readFileSync(abs, "utf8");
  const decl = source.match(/CAD_ACCEPTED_EXTENSIONS\s*=\s*\[([^\]]*)\]/);
  if (!decl) {
    throw new Error(
      `claims-gate: could not parse CAD_ACCEPTED_EXTENSIONS out of ${CAD_AUTHORITY_FILE}. ` +
        "This rule derives its ground truth from the validator. Failing loudly beats " +
        "reporting PASS over a list nothing was checked against.",
    );
  }
  const list = [...decl[1].matchAll(/["'`]([A-Za-z0-9]+)["'`]/g)].map((x) => x[1].toLowerCase());
  if (list.length === 0) throw new Error("claims-gate: CAD_ACCEPTED_EXTENSIONS parsed as empty.");
  return list;
}

const ACCEPTED_CAD = readAcceptedCadExtensions();

/* ── THE THIRD INSTRUMENT: the published STRINGS, not the tuple behind them ──
   09a-C4 / R3-1. QA attacked the C3 type pin twelve ways. Two got through and
   they are the same attack: leave the pinned tuple alone and edit the
   DERIVATION one line below it.

       CAD_UPLOAD_FORMATS = joinTurkishList([...PUBLISHED_CAD_EXTENSIONS
         .map((e) => e.toUpperCase()), "DWG"]);          // tsc 0, gate 0
       CAD_UPLOAD_FORMATS = joinTurkishList(
         PUBLISHED_CAD_EXTENSIONS.slice(0, 5).map(…));   // tsc 0, gate 0

   All five publication sites then read "… IGS, 3MF ve DWG" against a validator
   that refuses DWG — the exact defect the pin exists to make impossible, one
   layer up. The tuple was bound to the validator and nothing bound the COPY to
   the tuple.

   WHY THIS IS NOT A FOURTH TYPE-LEVEL PIN. It cannot be one. The joined string
   is produced by `PUBLISHED_CAD_EXTENSIONS.map(…)`, and `Array.prototype.map`
   is declared `map<U>(…): U[]` — it returns a plain array, not a tuple, so the
   element literals are gone before any template-literal type could join them.
   Measured, not assumed: `const T = ["step","stp","3mf"] as const;` then
   `const c: typeof T.map(f) = ["A","B"]` compiles clean under `--strict`. A
   type-level binding would therefore require rewriting the derivation
   expression itself, and that expression is the anchor QA's own harness
   (`scripts/qa-probes/p09a3-pin-attacks.mjs`) mutates — editing it would
   disable the probe that proves the fix.

   WHY THIS IS NOT A BYTE PIN ON THE DERIVATION EITHER. Pinning the source text
   of the derivation would fail on a formatter run (R3-6, the same complaint),
   and it would still only prove the code LOOKS right.

   So the gate EVALUATES it. `claims.ts` has exactly one import and it is an
   `import type`, which is erased before evaluation, so the ledger loads with no
   bundler, no `import.meta.env` and no edge to `supabase/env.ts`. The two
   exported strings are read as VALUES and compared against the canonical
   rendering of `CAD_ACCEPTED_EXTENSIONS`. That is the total, order-preserving
   function the copy is supposed to be: any append, any truncation, any reorder,
   any case change and any hand-written substitution fails, while whitespace and
   quote style are invisible because nothing here compares bytes.

   It also enforces the property `claims.ts` claims for itself: the day someone
   turns that `import type` into a value import, the load throws and the gate
   fails closed rather than quietly skipping.

   09a-C5 / R4-1 — AND IT NO LONGER NEEDS A NODE THAT STRIPS TYPES.
   ---------------------------------------------------------------
   The C4 version did `await import("…/claims.ts")` and relied on Node's
   unflagged TypeScript type stripping, which appears behind a flag in 22.6 and
   unflagged in 22.18. `.github/workflows/playwright.yml` pins
   `NODE_VERSION: "20"` for all six jobs, and Node 20 has no type stripping at
   all: `node --no-experimental-strip-types scripts/claims-gate.mjs` exited 1
   with `Unknown file extension ".ts"` — reported, wrongly, as CAD copy drift.
   `e2e/landing/claims-gate.spec.ts` runs this file and is a `CRITICAL_MATCH`,
   so the first PR to `main` would have got a red critical suite whose message
   was about the wrong thing. It failed CLOSED, which is the right direction,
   but a gate that cannot run in the place it is supposed to protect is not a
   gate.

   WHY THE FIX IS HERE AND NOT IN THE WORKFLOW. Raising CI's Node was the
   smaller diff and it is not sufficient: what this check has to be is
   RUNTIME-INDEPENDENT. A mechanism that only works on the newest major is one
   CI-image decision — or one contributor on an LTS — away from returning to
   exactly this state, and it returns to it wearing the wrong diagnosis. So the
   gate transpiles the ledger with the repository's own `typescript`: a declared
   devDependency, the same compiler `npm run typecheck` already runs, no new
   package — and ONE code path on every Node, rather than a fast path that gets
   exercised locally and a fallback that gets exercised only where it blocks.

   THE "BARE NODE PROCESS" PROPERTY IS NOT TRADED AWAY — it is tightened.
   Emission uses `verbatimModuleSyntax`, so ONLY an explicit `import type` is
   erased and every other import survives into the emitted module verbatim. That
   module is written to `mkdtempSync(tmpdir())`, OUTSIDE the repository and
   deliberately: any surviving import then has to resolve from a directory with
   no `node_modules`, no `@/` alias and no relative neighbours. A value import of
   `@/utils/cadUpload` throws `ERR_MODULE_NOT_FOUND` exactly as it threw under
   type stripping, and so now does a relative one — which is the property the
   ledger states about itself, enforced rather than assumed.

   09a-C5 / R4-5 — AND IT HAS CONTROLS NOW. The C4 comment here recorded that
   this check and `checkQualityResources` were the two instruments `runControls`
   cannot see, and gave a reason for leaving it open: that a control would have
   to mutate a source file while the gate is running. That reason was wrong, and
   QA showed the work. The read is now separated from the judgement —
   `compareDerivedCopy()` is pure and can be handed a fabricated namespace — and
   `checkDerivedCadCopy()` takes the file it reads as an argument, so a control
   can point it at a `mkdtempSync(tmpdir())` fixture instead. Both run on every
   invocation; see `NON_RULE_CHECKS` near the bottom of this file.

   What ALSO proves it is external, and must be re-run when this changes:
   `scripts/qa-probes/p09a3-pin-attacks.mjs` A6 and A7 — a derivation that
   appends `DWG`, and one that truncates to five — go red through this check
   and through nothing else. `tsc` is green on both.                          */
const CAD_LEDGER_FILE = "src/content/claims.ts";

/** What each exported string MUST be, derived from the authority. */
const EXPECTED_CAD_COPY = {
  CAD_UPLOAD_FORMATS: joinTurkish(ACCEPTED_CAD.map((e) => e.toUpperCase())),
  CAD_UPLOAD_EXTENSIONS: ACCEPTED_CAD.map((e) => `.${e}`).join(", "),
};

/** Temp directories this run created — emitted modules, control fixtures. */
const TEMP_DIRS = [];

/** A scratch directory OUTSIDE the repository. The gate never writes to the tree. */
function makeTempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  TEMP_DIRS.push(dir);
  return dir;
}

/**
 * Evaluate a TypeScript module on ANY Node, with only the parts that are
 * provably not code erased. See the R4-1 note above for why this is not
 * `await import(….ts)`.
 *
 * THROWS — it never returns a partial namespace — so the caller can tell
 * "could not load" from "loaded and disagrees".
 */
async function importTypeScriptModule(abs) {
  const ts = (await import("typescript")).default;
  const emitted = ts.transpileModule(readFileSync(abs, "utf8"), {
    fileName: abs,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      // ONLY an explicit `import type` is erased; every value import survives.
      verbatimModuleSyntax: true,
      isolatedModules: true,
    },
  });
  const errors = (emitted.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) {
    throw new Error(
      `it does not compile in isolation: ${errors
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "))
        .join("; ")}`,
    );
  }
  const file = join(makeTempDir("mas-claims-gate-module-"), "module.mjs");
  writeFileSync(file, emitted.outputText, "utf8");
  return await import(pathToFileURL(file).href);
}

/** Remove every temp directory this run wrote. Best effort; no verdict depends on it. */
function cleanUpTempDirs() {
  for (const dir of TEMP_DIRS.splice(0)) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* a leftover directory in the OS temp space changes no verdict */
    }
  }
}

/**
 * THE JUDGEMENT, WITH NO FILE IN IT — 09a-C5 / R4-5.
 *
 * Pure: a namespace object in, a list of problems out. That is what makes this
 * half controllable without touching the tree — a control hands it
 * `{ CAD_UPLOAD_FORMATS: "… ve DWG" }` and asserts that it complains.
 */
function compareDerivedCopy(namespace, expected = EXPECTED_CAD_COPY, file = CAD_LEDGER_FILE) {
  /** @type {{ kind: string, file: string, message: string }[]} */
  const problems = [];
  for (const [name, want] of Object.entries(expected)) {
    const actual = namespace[name];
    if (actual === want) continue;
    problems.push({
      kind: "drift",
      file,
      message:
        `${name} publishes ${JSON.stringify(actual)}, but ${CAD_AUTHORITY_FILE} renders as ` +
        `${JSON.stringify(want)}. The published string must BE the derivation of the validator's ` +
        "list, in order — never a hand-edited copy of it.",
    });
  }
  return problems;
}

/**
 * THE READ. `ledgerFile` is a parameter so a control can point it at a fixture;
 * every ordinary invocation reads the real ledger.
 *
 * 09a-C5 / R4-7 — EVERY PROBLEM CARRIES A `kind`. A file that cannot be
 * evaluated at all and a file that evaluates to the wrong strings are different
 * failures with different remedies, and reporting the first as the second sends
 * a reader to hunt a defect in copy that was never wrong.
 *
 * R4-7 named `enum` and `namespace` as the concrete case, because Node's type
 * stripping refuses both with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. MEASURED
 * AGAINST THE LOADER THIS FILE NOW USES, THAT CASE NO LONGER EXISTS: a full
 * transpile emits both, and a ledger carrying either loads and is compared
 * normally. The distinction is still built, and still needed, for the failures
 * that DO remain — and they are the ones that matter more:
 *
 *     a value import          `ERR_MODULE_NOT_FOUND`   (the property the
 *                                                       ledger claims for
 *                                                       itself, enforced)
 *     a relative import       `ERR_MODULE_NOT_FOUND`
 *     `export { SomeType }`   `SyntaxError` at import   (verbatimModuleSyntax)
 *     unparseable source      a transpile diagnostic
 *
 * All four fail CLOSED and all four are now reported as what they are. The
 * control `derived-cad-copy: a runtime import is a LOAD failure, not drift`
 * holds the distinction to it on every invocation.
 */
async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) {
  const abs = resolve(REPO_ROOT, ledgerFile);
  if (!existsSync(abs)) {
    return [
      {
        kind: "load",
        file: ledgerFile,
        message: "the claim ledger is missing; the published CAD copy was checked against nothing",
      },
    ];
  }
  const shadows = resolutionShadowsOf(ledgerFile);
  if (shadows.length > 0) {
    return [
      {
        kind: "load",
        file: ledgerFile,
        message:
          `is shadowed by ${shadows.join(", ")}. Vite resolves .mjs/.js/.mts BEFORE .ts, so the app would ` +
          "bundle that file while both instruments read this one — the published CAD strings would be " +
          "whatever the shadow says. Delete the shadow: the ledger is a .ts file and only a .ts file.",
      },
    ];
  }
  let ledger;
  try {
    ledger = await importTypeScriptModule(abs);
  } catch (error) {
    return [
      {
        kind: "load",
        file: ledgerFile,
        message:
          `could not be evaluated, so the published CAD strings were checked against NOTHING: ${error.message}. ` +
          "This is NOT a drift report — the copy may be perfectly correct. The ledger must stay loadable " +
          "with only `import type` erased and no module edges at all; it is loaded from a temp directory " +
          "precisely so that no edge can resolve.",
      },
    ];
  }
  return compareDerivedCopy(ledger, expected, ledgerFile);
}

/**
 * CAD formats the validator REFUSES. Unlike the accepted list this one is
 * written down, and that is safe: it only ever WIDENS coverage. A name missing
 * from it cannot turn a false claim into a pass, because detector (A) already
 * fires on the accepted half of any restated list.
 */
const REJECTED_CAD_VOCAB = [
  "parasolid", "x_t", "x_b", "sldprt", "sldasm", "solidworks", "catpart", "catproduct",
  "catia", "dwg", "dxf", "ipt", "iam", "inventor", "creo", "rhino", "3dm", "f3d",
  "sat", "acis", "jt", "pdf", "prt", "nx",
];

/* ASCII boundaries: a format token is ASCII by definition, and `.step` must
   match with its leading dot while `Xstep` must not. */
const cadToken = (names) => new RegExp(`(?<![A-Za-z0-9_])\\.?(?:${names.join("|")})(?![A-Za-z0-9_])`, "gi");
const CAD_ACCEPTED_TOKEN = cadToken(ACCEPTED_CAD);
const CAD_ANY_TOKEN = cadToken([...ACCEPTED_CAD, ...REJECTED_CAD_VOCAB]);

/** The verb that turns naming a format into OFFERING it. */
const CAD_OFFER_PREDICATE = trPattern(
  /kabul\s+ed(?:iyoruz|iyor|er|ilir|ilen|ilmekte|ebiliyoruz|iliyor)|destekl(?:iyoruz|iyor|enen|ediğimiz|emekteyiz|enir)|işleyebiliyoruz|işleyebiliriz|yükleyebilirsiniz|yükleyebileceğiniz|yüklenebilir|yükleyebiliyorsunuz|gönderebilirsiniz/i,
);

const CAD_LABEL_VALUE =
  /(?:label|title|name|key)\s*:\s*["'`]([^"'`]*)["'`]\s*,\s*(?:value|val|text|desc)\s*:\s*["'`]([^"'`]*)["'`]/g;
/** The label has to carry the OFFER, not merely the topic. See (C) above. */
const CAD_LABEL_OFFER = trPattern(/destekl|kabul|yükle|girdi|gelen dosya|alınan dosya/i);

/* (D) THE INTAKE OFFER WITH NO LIST IN IT AT ALL — 09a-C4.
   `b3ae3c7` removed "Yaygın CAD formatlarını doğrudan işleyebiliyoruz" from
   the DFM page. QA restored it and the gate stayed green, because every
   detector above needs a FORMAT TOKEN and this sentence names none. It is
   nonetheless the same claim and the worse version of it: an unbounded offer
   sits a few hundred pixels above a derived "Desteklenen CAD" row and quietly
   overrides it, and no reader can tell which answer is the real one.

   The shape is a vague quantifier attached to a file/format noun inside a
   sentence that OFFERS. The quantifier is what makes it a claim — "Hangi dosya
   formatlarını destekliyorsunuz?" carries the same noun and the same verb and
   asks a question rather than answering one, so it stays silent for want of a
   quantifier. The two-word gap keeps the match inside one noun phrase.

   09a-C5 / R4-2 — THE SENTENCE THAT USED TO STAND HERE WAS FALSE, AND IT WAS
   THE DEFENCE. It said "the offer predicate is what stops it from firing on the
   ordinary sense of `tüm dosyalarınız`". It does not, and it cannot:
   `yükleyebilirsiniz` IS in `CAD_OFFER_PREDICATE`, six lines up. QA measured
   both strings this detector over-caught:

     "Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü
      tarafla paylaşılmaz."
     "Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz."

   Neither is in the tree, so this is latent — but the comment was the reason
   nobody would look again, which is the more expensive half.

   Two discriminators, each closing one of them, and each narrow enough to leave
   the claim shape intact:

   (i) THE VISITOR'S OWN DOCUMENTS ARE NOT A CLASS OF FORMATS. `dosyalarınızı`
       carries a second-person possessive: it counts the files a visitor has, it
       does not name a kind of file we accept. "Upload all of YOUR files in one
       step" says nothing whatever about which formats survive the validator —
       the validator is the answer, a few pixels below. So the possessive
       suppresses, but ONLY when the predicate is second-person too
       (`…ebilirsiniz`, `…ebileceğiniz`), because "Tüm dosyalarınızı kabul
       ediyoruz" is a first-person acceptance claim about an unbounded class and
       must still fire. Both halves, or nothing.

   (ii) THE REPORT WE DELIVER IS NOT THE FILE THE VISITOR SENDS. That is the
       distinction detector (C) already draws deliberately, in its own comment,
       to keep `{ label: "Rapor Formatı", value: "PDF + revize CAD" }` quiet —
       and this detector cut straight across it. A report noun GOVERNING the
       quantified noun phrase (immediately before it, at most one word between)
       suppresses. Adjacency is the point: "Kalite raporu ile birlikte tüm CAD
       formatlarını gönderebilirsiniz" is three words away and still fires.

   The match now runs to the end of the inflected noun — `Tüm dosyalarınızı`,
   not `Tüm dosya` — because the suffix is the evidence discriminator (i) turns
   on, and because a violation should print the word a human wrote. Both strings
   are `silent` controls below, so this cannot quietly regress. */
const CAD_VAGUE_SCOPE = trPattern(
  /(?:yaygın|tüm|bütün|her\s+tür(?:lü)?|her\s+çeşit|birçok|pek\s+çok|çoğu|çeşitli|popüler|başlıca|bilinen|piyasadaki|geniş)\s+(?:\S+\s+){0,2}?(?:dosya|format|uzantı)[a-zçğıöşü]*/gi,
);

/** `dosyalarınızı`, `dosyanız`, `belgelerinizi` — the visitor's OWN documents. */
const CAD_VISITOR_OWNED_NOUN = trPattern(/^(?:dosya|belge)(?:ler|lar)?[ıiuü]?n[ıiuü]z/i);

/** `…ebilirsiniz` / `…abileceğiniz` — the VISITOR acts. We assert nothing. */
const CAD_VISITOR_ACTION = trPattern(/[ae]bilirsiniz|[ae]bileceğiniz|[ae]biliyorsunuz/i);

/** A report noun immediately governing the quantified noun phrase. See (ii). */
const CAD_DELIVERABLE_GOVERNOR = trPattern(/rapor[a-zçğıöşü]*\s+(?:\S+\s+)?$/i);

/**
 * TWO FILES MAY SPELL THE LIST — AND BOTH ARE PINNED, NOT EXEMPTED.
 *
 * A path exemption is a hole. A PIN is not: the file may carry the literal
 * only while that literal equals the derived one character for character.
 * Change `CAD_ACCEPTED_EXTENSIONS` and the gate fails immediately, which is
 * exactly the silent drift an exemption would have hidden. Remove the literal
 * (by deriving it) and the pin dissolves on its own — no accepted-format token
 * survives, so there is nothing left to check.
 *
 *   src/content/claims.ts
 *     The ledger. It restates the list ONCE, as a tuple, because there is no
 *     runtime path from the data layer to `cadUpload.ts` that does not load
 *     `supabase/env.ts` and take down Playwright spec collection — the reason
 *     is written out at that tuple. TypeScript pins it with an exact-tuple
 *     assertion; this is the second, independent instrument that reads both
 *     files as text and compares. Two instruments, one class, no disagreement.
 *
 *   src/data/technicalLandingData.ts
 *     Restates the list in prose ("STEP, STP … ve 3MF … yükleyebilirsiniz").
 *     CORRECT TODAY, and detector (A)/(B)'s class exactly — but that file is
 *     not on packet 09a-C3's WRITE_ALLOWLIST and
 *     `e2e/technical-landing.spec.ts:167` asserts the exact string is visible.
 *     Deferred, pinned, and the one-line fix for whoever gets the allowlist:
 *       `\`${CAD_UPLOAD_FORMATS} dosyalarını teklif akışında doğrudan yükleyebilirsiniz.\``
 *     importing `CAD_UPLOAD_FORMATS` from `@/content/claims`. It produces
 *     byte-identical output, so neither the spec nor the goldens move.
 */
/* THE EXPECTED STRING IS DELIMITED AT BOTH ENDS, and that is not decoration.
   The first version of this pin compared with `includes()` against the bare
   list, and a probe that APPENDED `"dwg"` to the ledger tuple sailed through:
   the expected text was still a prefix of the longer one. TypeScript caught
   that probe; this gate did not, which is precisely the "two instruments, one
   of them asleep" failure the rule exists to prevent. Both expectations still
   carry their closing delimiter, so nothing can be inserted or appended
   without breaking the match.

   09a-C4 / R3-6 — WHAT THEY NO LONGER DO IS COMPARE BYTES. A pin that
   `includes()` the exact rendered literal turns red on a whitespace-only
   reformat and on a single-quote change, with zero semantic drift. QA's A8 and
   A9 are both that false positive. It fails CLOSED, which is the right
   direction, but a formatter run producing a baffling FAIL is how a gate loses
   the benefit of the doubt it needs on the day it is right.

   So each pin now PARSES its span and compares the meaning:

     the ledger tuple  — the quoted tokens between the brackets, compared
                         element-wise and in order against the validator, so
                         quoting and spacing are invisible and a reorder,
                         a truncation, an append or a case change is not;
     the landing prose — the same words with `\s+` between them and either
                         quote character in front.

   Each returns the SPAN it blesses, and only that span. See `cadFormatScan`.
   Folded through `foldTurkishI`, because the scanned text is folded. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The ledger tuple, parsed. `{ present, ok, index, match, region }`. */
function claimsLedgerPin(text) {
  const m = text.match(/PUBLISHED_CAD_EXTENSIONS\s*(?::[^=;]*)?=\s*\[([^\]]*)\]/);
  if (!m) return { present: false };
  const tokens = [...m[1].matchAll(/["'`]([A-Za-z0-9]+)["'`]/g)].map((x) => x[1]);
  const ok = tokens.length === ACCEPTED_CAD.length && tokens.every((t, i) => t === ACCEPTED_CAD[i]);
  return { present: true, ok, index: m.index, match: m[0], region: [m.index, m.index + m[0].length] };
}

/** The landing prose, whitespace- and quote-tolerant. */
function technicalLandingPin(text) {
  const expected = foldTurkishI(`${joinTurkish(ACCEPTED_CAD.map((e) => e.toUpperCase()))} dosyalarını`);
  const re = new RegExp(`["'\`]\\s*${expected.trim().split(/\s+/).map(escapeRe).join("\\s+")}`);
  const m = text.match(re);
  if (!m) return { present: false };
  return { present: true, ok: true, index: m.index, match: m[0], region: [m.index, m.index + m[0].length] };
}

const CAD_PINNED_FILES = new Map([
  ["src/content/claims.ts", claimsLedgerPin],
  ["src/data/technicalLandingData.ts", technicalLandingPin],
]);

/**
 * Distinct accepted-extension tokens within `span` characters of each other.
 *
 * `keywords: [ … ]` is skipped, narrowly and for this rule only, on the same
 * grounds `payment-or-credit-terms` and `unconditional-guarantee` skip it:
 * that array is MATCHER INPUT for `findBestFaqMatch()` and is never rendered.
 * `chatFaqData.ts:165` lists `"step", "iges", "stl", "obj", "3mf"` there
 * precisely so a visitor who types one reaches the derived answer — deleting
 * them to satisfy a rule would break the routing the rule exists to protect.
 */
function* restatedCadLists(text, span = 80) {
  CAD_ACCEPTED_TOKEN.lastIndex = 0;
  const hits = [];
  let m;
  while ((m = CAD_ACCEPTED_TOKEN.exec(text)) !== null) {
    if (!insideKeywordArray(text, m.index)) hits.push(m);
  }
  const bare = (s) => s.replace(/^\./, "").toLowerCase();
  for (let i = 0; i + 1 < hits.length; i += 1) {
    const a = hits[i];
    const b = hits[i + 1];
    if (b.index - a.index > span) continue;
    if (bare(a[0]) === bare(b[0])) continue;
    yield { index: a.index, match: text.slice(a.index, b.index + b[0].length) };
  }
}

/* ── 09b-2: a CAD AUTHORING PACKAGE named as tooling ───────────────────────
   Three regexes and one discriminator, kept beside `cadFormatScan` because
   they draw the same line from the other side: that rule owns "which formats
   may a visitor SEND", this one owns "which software do we claim to OPERATE".
   The rule itself, with its authority and its controls, is `named-cad-package`
   in `RULES`. */
const CAD_PACKAGE_HIT = (() => {
  const PKG = String.raw`(?:CATIA|Solid\s?Works|\bNX\b)`;
  const GOVERNOR = String.raw`(?:ile|kullanarak|üzerinde|ortamında|entegre|entegrasyon[a-zçğıöşü]*|yazılım[a-zçğıöşü]*|lisans[a-zçğıöşü]*|seat)`;
  const CAPABILITY = String.raw`(?:modelleme|tasarım|çizim|simülasyon|programlama|CAD|CAM)`;
  return trPattern(
    new RegExp(
      [
        // (i) an inventory: two packages with only a separator between them
        `${PKG}\\s*(?:,|/|·|\\s+ve\\s+|\\s+veya\\s+)\\s*${PKG}`,
        // (ii) one package plus an ownership / operation governor
        `${PKG}[^.!?;{}\\n"']{0,20}?\\s${GOVERNOR}\\b`,
        // (iii) one package in a parenthetical after a capability noun
        `${CAPABILITY}[^.!?;{}\\n"']{0,20}?\\(\\s*${PKG}`,
      ].join("|"),
      "gi",
    ),
  );
})();

/** The same governor set, as a standalone word — used by the discriminator. */
const CAD_PACKAGE_GOVERNOR_WORD = trPattern(
  /\b(?:ile|kullanarak|üzerinde|ortamında|entegre|entegrasyon[a-zçğıöşü]*|yazılım[a-zçğıöşü]*|lisans[a-zçğıöşü]*|seat)\b/i,
);

/** `dosyamı`, `dosyanızı`, `kayıtlarınızı` — a file the VISITOR owns or sends. */
const CAD_PACKAGE_VISITOR_FILE = trPattern(/\b(?:dosya|kayıt)(?:lar|ler)?[ıiuü]?(?:n[ıiuü]z|m)[ıiuü]?\b/i);

/**
 * THE DISCRIMINATOR, AND IT IS STRUCTURAL RATHER THAN A LIST OF BLESSED
 * SENTENCES. A package name is allowed to appear when the sentence is about a
 * FILE THE VISITOR SENDS and claims nothing about software we run — which is
 * what the live intake answer in `servicePages.ts` does when it names
 * `.sldprt`, `.catpart` and `.prt` in order to REFUSE them, and what a routing
 * question like "SolidWorks veya CATIA dosyamı yükleyebilir miyim?" does.
 *
 * BOTH HALVES ARE REQUIRED, and the second is what stops this from becoming a
 * hole: "Dosyalarınızı SolidWorks İLE açıyoruz" carries the visitor-file noun
 * and still fires, because it also carries an operation governor. Only a
 * sentence that is about the visitor's file AND asserts no operation is quiet.
 */
function* namedCadPackageScan(text) {
  CAD_PACKAGE_HIT.lastIndex = 0;
  let m;
  while ((m = CAD_PACKAGE_HIT.exec(text)) !== null) {
    if (m[0].length === 0) {
      CAD_PACKAGE_HIT.lastIndex += 1;
      continue;
    }
    const sentence = sentenceAt(text, m.index);
    if (CAD_PACKAGE_VISITOR_FILE.test(sentence) && !CAD_PACKAGE_GOVERNOR_WORD.test(sentence)) continue;
    yield { index: m.index, match: m[0] };
  }
}

function* cadFormatScan(text, file) {
  // The authority may — must — spell its own list.
  if (file === CAD_AUTHORITY_FILE) return;

  /* 09a-C4 / R3-2. Being pinned used to REPLACE detectors (A) and (B) on these
     two files, and QA's A10/A11 walked straight through the gap it left: a
     bare prose offer of SolidWorks added to `claims.ts` — or to
     `technicalLandingData.ts`, a RENDERED content file — was invisible to both
     instruments while the pinned literal sat there unchanged, holding the
     exemption open.

     A file being pinned buys it an EXTRA check, never fewer. So the pin no
     longer switches detectors off; it marks the one SPAN in which the list is
     allowed to be spelt, and every detector runs over everything outside that
     span. Remove the literal (by deriving it) and the pin reports `present:
     false`, at which point nothing is blessed and the detectors cover the file
     exactly as they cover any other. */
  const pin = CAD_PINNED_FILES.get(file);
  /** @type {[number, number] | null} */
  let blessed = null;
  if (pin !== undefined) {
    const r = pin(text);
    if (r.present) {
      blessed = r.region;
      if (!r.ok) yield { index: r.index, match: r.match };
    }
  }
  const outside = (index, length) =>
    blessed === null || index < blessed[0] || index + length > blessed[1];

  // (A) a restated list — in copy-only data files, and in every pinned file
  if (file.startsWith("src/data/") || pin !== undefined) {
    for (const hit of restatedCadLists(text)) {
      if (outside(hit.index, hit.match.length)) yield hit;
    }
  }

  // (B) a format named inside a sentence that offers it
  CAD_ANY_TOKEN.lastIndex = 0;
  let token;
  while ((token = CAD_ANY_TOKEN.exec(text)) !== null) {
    if (insideKeywordArray(text, token.index)) continue;
    if (!outside(token.index, token[0].length)) continue;
    if (CAD_OFFER_PREDICATE.test(sentenceAt(text, token.index))) {
      yield { index: token.index, match: token[0] };
    }
  }

  // (C) the offer in the label, the list in the value
  CAD_LABEL_VALUE.lastIndex = 0;
  let pair;
  while ((pair = CAD_LABEL_VALUE.exec(text)) !== null) {
    if (!CAD_LABEL_OFFER.test(pair[1])) continue;
    CAD_ANY_TOKEN.lastIndex = 0;
    if (CAD_ANY_TOKEN.exec(pair[2])) yield { index: pair.index, match: pair[0] };
  }

  // (D) an intake offer with no list in it at all
  CAD_VAGUE_SCOPE.lastIndex = 0;
  let vague;
  while ((vague = CAD_VAGUE_SCOPE.exec(text)) !== null) {
    if (insideKeywordArray(text, vague.index)) continue;
    if (!outside(vague.index, vague[0].length)) continue;
    const sentence = sentenceAt(text, vague.index);
    if (!CAD_OFFER_PREDICATE.test(sentence)) continue;
    // (ii) the report WE deliver, not the file the visitor sends
    if (CAD_DELIVERABLE_GOVERNOR.test(text.slice(Math.max(0, vague.index - 60), vague.index))) continue;
    // (i) the visitor's own documents, and the visitor doing the uploading
    const noun = vague[0].split(/\s+/).pop() ?? "";
    if (CAD_VISITOR_OWNED_NOUN.test(noun) && CAD_VISITOR_ACTION.test(sentence)) continue;
    yield { index: vague.index, match: vague[0] };
  }
}

/* ── 09a-C3: the benefit-percentage half of `delivery-or-quality-rate` ──────
   The packet asked whether this should be a new rule or a widening of the
   existing one. It is a WIDENING, and the reason is in the rule's own
   authority line: §D `OTHER_PUBLIC_KPIS: NONE` and §G `CASE_STUDIES:
   NONE_PROVIDED_YET` already decide `%40 daha hızlı` exactly as they decide
   `%95 zamanında teslimat`. Two rules citing one authority over one class is
   how `wrong-city` and `quote-sla-overpromise` each ended up with a hole
   nobody owned.

   WHY IT DID NOT ALREADY FIRE — measured on the three strings, not guessed.
   The existing benefit alternation is `%N` + optional suffix + `\s*` + noun,
   with NO GAP. Against the live claims:

     "%70'e kadar maliyet tasarrufu"   `kadar ` sits between the suffix and
                                       the noun → no match
     "HSM ile %40 daha hızlı üretim"   `daha hızlı` is not in the noun list
     "%50 setup tasarrufu"             `setup ` sits in the gap → no match
     { label: "Maliyet Tasarrufu",
       value: "Ortalama %30-50" }      the noun is in the LABEL, on the far
                                       side of a string boundary

   So: a bounded gap, a benefit vocabulary that includes the comparative
   forms, and a label/value detector.

   THE GAP IS 30 CHARACTERS AND STOPS AT SENTENCE PUNCTUATION, and the noun
   list is deliberately narrow — `artış`, `azalma`, `düşüş` and `iyileşme` are
   ordinary technical Turkish and are NOT here. A SURCHARGE is not a benefit
   either: the Ra guide's `+%80-100` under "Ek Maliyet" is a price relativity,
   it makes no claim about performance, and it stays. What fires is a
   percentage attached to something getting cheaper, faster or better.

   09a-C4 / R3-3 — ONE SOFTENED SUFFIX WALKED THROUGH THE WIDENING. The rule
   spelt the noun `kazanç` and Turkish softens ç→c before a vowel, so
   `{ label: "Maliyet Kazancı", value: "%30-50" }` and "%35 zaman kazancı elde
   edilir" passed the full gate while `Zaman Kazanç` — a form no one writes —
   fired. The fix is `kazan[çc]`, the consonant-alternation idiom this file
   already uses for `standar[dt]`, `çeşi[td]` and `niteli[kğ]`.

   It is a LATENT hole, not a live claim: the only `kazan…` forms in the tree
   are `blogData.ts:102` and `:121` ("Beş eksenin asıl kazancı hız değil,
   kurulum sayısıdır" / "Asıl kazanç: kurulum sayısı"), and neither carries a
   percentage, so neither fires before or after. Both are kept as negative
   controls below, because the discriminator this rule turns on is the NUMBER,
   not the noun — widening the noun must not start firing on ordinary Turkish
   that quantifies nothing.                                                   */
const UNSOURCED_BENEFIT_PCT =
  String.raw`(?:%\s?|yüzde\s+)\d{1,3}(?:[.,]\d+)?(?:\s?[-–]\s?\d{1,3}(?:[.,]\d+)?)?(?:['’]?[a-zçğıöşü]{0,4})?` +
  String.raw`[^.!?;{}\n"]{0,30}?(?:tasarruf|kazan[çc]|daha hızlı|daha ucuz|daha az maliyet|maliyet düş|maliyet avantaj|verim(?:lilik)?\s+artış|hız\s+artış)`;
const UNSOURCED_BENEFIT_LABEL_VALUE =
  String.raw`(?:label|title|name|key)\s*:\s*["'\x60][^"'\x60]*(?:tasarruf|kazan[çc]|maliyet düşüşü|verim artışı|hız artışı|iyileşme)[^"'\x60]*["'\x60]` +
  String.raw`\s*,\s*(?:value|val|text|desc)\s*:\s*["'\x60][^"'\x60]*(?:%\s?|yüzde\s+)\d[^"'\x60]*["'\x60]`;

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
    controls: {
      fires: ['"Teklifinizi 24 saat içinde iletiyoruz."', '"48 saat içinde dönüş"'],
      silent: ['  value: "1-3 iş günü",', '{ label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },'],
    },
  },
  {
    id: "unverified-production-lead-time",
    /* NEW — 09a-C2. The rule directly above ends with a note that says this
       class exists and is uncovered: "Delivery lead times (`24 saatte ilk
       parça`) carry no quote vocabulary and do not fire; they are a separate,
       uncovered class." It stayed uncovered for three more phases, and in that
       time `servicePages.ts` published `3-5 iş günü`, `7-15 iş günü`,
       `24 saat`, `24-72 saat`, `5-10 iş günü`, `2-3 hafta`, `4-8 hafta` and
       `6-8 hafta` as delivery commitments across eleven pages while the gate
       reported PASS.

       THE TWO FACTS ARE NOT THE SAME FACT. `QUOTE_RESPONSE_TIME` is how long
       MAS takes to answer an enquiry, authorised twice (§D + §J). How long
       MAKING THE PART takes has no field anywhere in `USER_INPUTS.md`, and
       `claims.ts` records it as `PRODUCTION_LEAD_TIME = withhold(...)`.

       This rule does NOT duplicate `quote-sla-overpromise`: that one requires
       QUOTE vocabulary in the window, this one requires DELIVERY vocabulary.
       Nor does it duplicate `delivery-or-quality-rate`: that one is about a
       RATE (`%95 zamanında teslimat`), this one about a DURATION. Three
       adjacent rules, three different claims.

       TWO DETECTORS, because the class has two shapes and one of them defeats
       any sentence-scoped pattern:

         (a) PROSE — a duration window and delivery vocabulary in the same
             sentence, in either order, plus the worded tier promises that
             carry no digit at all ("aynı gün teslimat", "ekspres hizmet",
             "acil tedarik"). No numeric sweep would ever have found those
             three, and they are the strongest commitments in the file.

         (b) BARE CELL — a string literal that is NOTHING BUT a duration.
             `["Al 7075", "150 HB", "10.000+ çevrim", "2-3 hafta", "$", …]` and
             `{ label: "Analiz Süresi", value: "5 iş günü" }` carry no delivery
             vocabulary anywhere a sentence-scoped rule can see, because the
             word that makes them a delivery claim is in the column HEADER or
             the LABEL, on the other side of a string boundary. Four whole
             duration COLUMNS lived in exactly this blind spot. A cell whose
             entire content is a time window is not a measurement of anything;
             it is a date somebody promised.

       THE LEDGER EXEMPTION IS NARROW ON PURPOSE. `claims.ts` is where an
       authorised duration is supposed to live, so `value: "1-3 iş günü"` there
       must not fire — but exempting the whole file would let a fabricated
       lead time be laundered through the ledger, which is the one place nobody
       would think to look. So the exemption requires `QUOTE_RESPONSE_TIME` to
       be the declaration the hit sits inside. A hypothetical
       `PRODUCTION_LEAD_TIME = publish({ value: "3-5 iş günü" })` in that same
       file still fires — and there is a control for it below.                */
    scan: function* (text, file) {
      const prose = trPattern(
        new RegExp(
          [
            `(?:${DELIVERY_VOCAB})[^.!?;{}\n"]{0,80}?${LEAD_TIME_WINDOW}`,
            `${LEAD_TIME_WINDOW}[^.!?;{}\n"]{0,80}?(?:${DELIVERY_VOCAB})`,
            WORDED_DELIVERY_TIER,
          ].join("|"),
          "gi",
        ),
      );
      // A cell is a quoted literal whose whole content is a window — numeric
      // ("2-3 hafta") or worded ("Aynı gün", the express-supply column). The
      // quotes are part of the match, so a substring of a longer sentence
      // cannot satisfy it.
      const cell = trPattern(
        new RegExp(String.raw`(["'\`])\s*(?:${LEAD_TIME_WINDOW}|(?:aynı gün|ertesi gün|ekspres|acil)[^"'\`]{0,12})\s*\1`, "gi"),
      );
      /* (c) SEARCH RESULT. `metaTitle: "Hızlı Prototip Üretimi | 3-5 İş Günü |
         CNC, 3D Baskı, Silikon Kalıp | Mas Technic"` carries no delivery
         vocabulary and is not a bare cell, so neither detector above sees it —
         and it is the WORST string in the class, because a `<title>` is quoted
         by a search engine beside the domain, where no reader ever reaches the
         page that would qualify it. A duration inside an SEO string is a claim
         with no room for a caveat, so the vocabulary requirement is dropped
         here: the field name IS the context. */
      const seo = trPattern(
        new RegExp(String.raw`(?:metaTitle|metaDescription|ogTitle|ogDescription)\s*:\s*"[^"\n]{0,220}?${LEAD_TIME_WINDOW}`, "gi"),
      );

      const inQuoteSla = (index) => {
        if (file !== "src/content/claims.ts") return false;
        return /QUOTE_RESPONSE_TIME[\s\S]{0,240}$/.test(text.slice(Math.max(0, index - 300), index));
      };

      for (const re of [prose, cell, seo]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (!inQuoteSla(m.index)) yield { index: m.index, match: m[0] };
          if (m[0].length === 0) re.lastIndex += 1;
        }
      }
    },
    /* `keywords: [ … ]` is MATCHER INPUT, not published copy: nothing renders
       it and `findBestFaqMatch` is its only reader. `chatFaqData.ts:68` lists
       "kaç gün", "acil" and "termin" so that a visitor asking about lead time
       REACHES the answer that declines to give one — removing the words would
       route the most commercially loaded question on the site to a wrong
       neighbour above the 0.6 floor, which is the Phase 06 failure this phase
       exists to stop repeating. Same exemption, same narrowness and same
       reason as `unconditional-guarantee`: this rule only, that array only.
       Every other rule still applies inside it, so a scale figure or a
       certificate cannot be laundered through a keyword list. */
    exempt: (text, index) => insideKeywordArray(text, index),
    controls: {
      fires: [
        // Every one of these is a string this phase removed, verbatim.
        '"Standart parçalarda 5-10 iş günü, ekspres üretimde 2 iş gününe kadar inebiliyoruz."',
        '"Hızlı alüminyum kalıplar 2-3 hafta, çelik kalıplar 4-8 hafta içinde teslim edilir."',
        '"Master modelden 24 saatte ilk parçalar teslim ediyoruz."',
        '"24-72 saat standart teslimat süresi",',
        '"Ekspres hizmet ile aynı gün teslimat da mümkündür."',
        'answer: "Acil siparişlerde aynı gün teslimat yapıyoruz.",',
        '"3-5 iş günü prototip, 7-15 iş günü seri üretim teslimatı",',
        '"Tasarım için 3-5 iş günü, üretim için 5-10 iş günü çalışma süresiyle ilerliyoruz."',
        '"Toplam süreç 5 iş gününde tamamlanır."',
        'metaTitle: "Hızlı Prototip Üretimi | 3-5 İş Günü | CNC | Mas Technic",',
        // bare cells — four whole columns lived here
        '["Al 7075", "150 HB", "10.000+ çevrim", "2-3 hafta", "$", "Prototip"],',
        '["Vakumlu Döküm", "1", "1-3 gün", "$$", "$", "İyi"],',
        '{ label: "Analiz Süresi", value: "5 iş günü" },',
        '["Alüminyum (6061, 7075)", "Stokta", "Aynı gün", "Talebe bağlı", "1 kg"],',
        // the ledger exemption is scoped to QUOTE_RESPONSE_TIME, not the file
        {
          file: "src/content/claims.ts",
          text: 'export const PRODUCTION_LEAD_TIME = publish({\n  value: "3-5 iş günü",\n});',
        },
      ],
      silent: [
        // the authorised SLA, in the ledger and at every site that imports it
        { file: "src/content/claims.ts", text: 'export const QUOTE_RESPONSE_TIME = publish({\n  value: "1-3 iş günü",\n});' },
        { file: "src/content/claims.ts", text: 'export const QUOTE_RESPONSE_TIME_DISPLAY = publish({\n  value: "1-3 İŞ GÜNÜ",\n});' },
        '{ label: "Değerlendirme", value: QUOTE_RESPONSE_TIME },',
        '["1. Değerlendirme & Teklif", QUOTE_RESPONSE_TIME, "Detaylı teklif"],',
        // the authorised replacement wording this phase put everywhere
        '{ label: "Teslim Süresi", value: LEAD_TIME_SHORT },',
        '"Termin; malzeme tedariki, operasyon sayısı ve kapasite planı incelendikten sonra teklifle birlikte verilir."',
        // measurements that merely share a unit with a promise
        '{ label: "Tuz Testi", value: "500+ saat (ASTM B117)" },',
        '"100.000 saat fiber lazer ömrü ile uzun vadeli güvenilirlik sağlıyoruz.",',
        '["Korozyon Direnci (Tuz Testi)", "336+ saat", "500+ saat", "500+ saat"],',
        '["Mekanik Mengene", "10-50 kN", "±0.02mm", "1-2 dk", "$", "Genel frezeleme"],',
        '"İteratif — 2 haftalık sprint"',
        // `acil` inside `havacılık`, after the Turkish-I fold — four live
        // false positives this rule produced on its first run.
        '"Havacılık ve uzay uygulamaları için hassas parça üretimi."',
        'metaTitle: "Havacılık & Uzay Parça Üretimi | Ti & Inconel İşleme | Mas Technic",',
        '"Prototipten seri üretime, havacılık-savunma-otomotiv-medikal başta olmak üzere birçok sektöre hizmet vermekteyiz."',
        // matcher input, exempted — and the exemption is array-scoped, so the
        // positive control immediately below still fires on the same words in
        // published prose.
        'keywords: ["teslimat", "süre", "zaman", "ne zaman", "kaç gün", "hızlı", "acil", "termin"],',
      ],
    },
    authority:
      "§D — no lead-time, turnaround, termin or delivery-window field exists · §J QUOTE_SLA: 1-3 Days is the quote's clock, not the part's",
    remedy:
      "A process step keeps its step and loses its number: use LEAD_TIME_STATEMENT or LEAD_TIME_SHORT from src/content/claims.ts. If a whole table COLUMN is durations, remove the column — five identical 'Teklifle birlikte' cells carry no information. PRODUCTION_LEAD_TIME is withhold()-typed; publishing it is a type error.",
  },
  {
    id: "payment-or-credit-terms",
    /* NEW — 09a-C2. `chatFaqData.ts` stated two commercial policies to a
       visitor as company policy: "İlk siparişlerde %50 ÖN ÖDEME talep
       ediyoruz, kalan %50 teslimatta ödenir. Düzenli müşterilerimize AÇIK
       HESAP ve 30-60 GÜN VADE imkânı sunuyoruz." and "açık hesap (anlaşmalı
       müşteriler), vadeli ödeme".

       This is not a duration and it cannot be softened into "teklifle
       birlikte" — the reader is not being told a number, they are being told a
       POLICY. §J supplies the quote SLA and nothing else; no field anywhere
       authorises a payment term, a credit line or a discount schedule.
       `/endustriyel/kucuk-seri` published `%15-25` and `%25-35 hacim indirimi`
       as spec rows while its own FAQ said tiered pricing comes with the quote.

       ANCHORED TO THE OFFER, not the topic. "Peşin ödeme zorunlu mu?" is a
       QUESTION a visitor asks and it must keep working; the honest answer
       ("Yayımlanan sabit bir ödeme koşulumuz yok") must not fire either. What
       fires is a term being GRANTED: an open account, a named credit window, a
       percentage attached to a deposit, or an offer verb after any of them.
       `keywords: [...]` is matcher input, exempted the same way and for the
       same reason as `unconditional-guarantee` — narrowly, this rule only.   */
    pattern: new RegExp(
      [
        String.raw`açık\s+hesap`,
        String.raw`\d{1,3}(?:\s?[-–]\s?\d{1,3})?\s?(?:gün|ay)\s*vade`,
        /* NOT a bare `vade…` + offer verb. "uzun vadeli güvenilirlik
           sağlıyoruz" and "uzun vadede maliyet avantajı sağlar" are ordinary
           Turkish for LONG-TERM and say nothing about credit; the first of
           them was a live false positive on `servicePages.ts:1049`. What is
           a credit term is `vadeli ödeme` or `vade` offered as a facility. */
        String.raw`vadeli\s+ödeme`,
        String.raw`\bvade\s*(?:imkan|imkân|olanak|seçenek|farkı|tanı|süresi\s+tanı)`,
        String.raw`(?:%\s?|yüzde\s+)\d{1,3}(?:\s?[-–]\s?\d{1,3})?\s*(?:ön\s*ödeme|peşinat|avans|peşin)`,
        String.raw`(?:ön\s*ödeme|peşinat|avans)[^.!?;{}\n"]{0,30}?(?:%\s?|yüzde\s+)\d`,
        String.raw`(?:ön\s*ödeme|peşinat|avans|kapora)[^.!?;{}\n"]{0,30}?(?:talep ediyoruz|alıyoruz|istiyoruz|zorunludur|şarttır)`,
        String.raw`taksit[^.!?;{}\n"]{0,30}?(?:imkan|imkân|seçenek|sunuyoruz|yapıyoruz|uyguluyoruz)`,
        String.raw`(?:%\s?|yüzde\s+)\d{1,3}(?:\s?[-–]\s?\d{1,3})?\s*(?:hacim\s+)?indirim`,
        String.raw`kredi\s+(?:limiti|imkan|imkânı|hesabı)`,
      ].join("|"),
      "gi",
    ),
    exempt: (text, index) => insideKeywordArray(text, index),
    controls: {
      fires: [
        '"İlk siparişlerde %50 ÖN ÖDEME talep ediyoruz, kalan %50 teslimatta ödenir."',
        '"Düzenli müşterilerimize AÇIK HESAP ve 30-60 GÜN VADE imkânı sunuyoruz."',
        '"Ödeme yöntemleri: havale/EFT, açık hesap (anlaşmalı müşteriler), vadeli ödeme."',
        '{ label: "İndirim (50+)", value: "%15-25 hacim indirimi" },',
        '"Taksit imkanı sunuyoruz."',
      ],
      silent: [
        '"Ödeme koşulları siparişe göre teklifte belirlenir; kurumsal fatura ve e-fatura kesiyoruz."',
        'question: "Peşin ödeme zorunlu mu?",',
        '"Yayımlanan sabit bir ödeme koşulumuz yok. Koşullar siparişe göre teklifte belirlenir."',
        'keywords: ["peşin", "ön ödeme", "avans", "vade", "vadeli", "taksit", "ödeme koşulları"],',
        '{ label: "Hacim İndirimi", value: "Kademeli fiyatlandırma teklifte" },',
        '"Birim maliyeti belirleyen asıl kalem kurulumdur ve adede bölünür; hacim arttıkça birim fiyat düşer."',
        // `uzun vadeli` / `uzun vadede` — ordinary Turkish for long-term.
        '"100.000 saat fiber lazer ömrü ile uzun vadeli güvenilirlik sağlıyoruz."',
        '"Daha yüksek hacimler için çelik kalıp uzun vadede maliyet avantajı sağlar."',
      ],
    },
    authority: "§J — QUOTE_SLA is the only commercial term supplied; §0 DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK",
    remedy:
      "A payment term, a credit line and a discount schedule are contractual policy, not facts about capability. Say the terms are agreed per order and nothing more specific. Do not soften a policy into 'teklifle birlikte' — that answers a question the reader did not ask.",
  },
  {
    id: "cad-format-list-not-derived",
    scan: cadFormatScan,
    controls: {
      fires: [
        // D1 — the false list, exactly as it stood at fe3a525.
        '{ question: "Hangi dosya formatlarını kabul ediyorsunuz?", answer: "STEP, IGES, Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX (.prt) ve PDF/DWG teknik çizim formatlarını destekliyoruz." },',
        // D1's other half: the same claim in body copy, one page above the FAQ.
        '"Her projede DFM analizi uygulayarak maliyetleri optimize ediyor, STEP, IGES, SolidWorks, CATIA ve NX formatlarını doğrudan işleyebiliyoruz."',
        // The offer in the label, the list in the value.
        '{ label: "Desteklenen CAD", value: "STEP, IGES, CATIA, NX, SW" },',
        // D2 — CORRECT ON THE DAY IT WAS WRITTEN, and still a violation.
        '{ question: "Hangi CAD formatlarını kabul ediyorsunuz?", answer: "Teklif akışında STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını doğrudan yükleyebilirsiniz." },',
        // The same, on the public FAQ register rather than in the data file.
        { file: "src/pages/SSS.tsx", text: '"Teklif akışındaki yükleyici STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını kabul eder."' },
        // A single rejected format, offered in prose, with no list around it.
        '"SolidWorks dosyalarını da doğrudan kabul ediyoruz."',
        /* 09a-C4 / R3-2 — QA's A10 and A11, kept as controls so the property
           outlives the probe that found it. BOTH carry the pinned literal AND
           the prose offer, because the hole was specifically that a valid pin
           held the exemption open over the rest of the file. */
        {
          file: "src/content/claims.ts",
          text:
            'const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;\n' +
            'export const CAD_UPLOAD_NOTE = "SolidWorks ve CATIA dosyalarını da doğrudan kabul ediyoruz.";',
        },
        {
          file: "src/data/technicalLandingData.ts",
          text:
            '"STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını teklif akışında doğrudan yükleyebilirsiniz.",\n' +
            'export const QA_PROBE_NOTE = "SolidWorks dosyalarını da doğrudan kabul ediyoruz.";',
        },
        /* 09a-C4 — the pin itself, drifted. The ledger tuple carrying a format
           the validator refuses must fail HERE too, not only in `tsc`: two
           instruments, and neither of them asleep. */
        {
          file: "src/content/claims.ts",
          text: 'const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf", "dwg"] as const;',
        },
        /* 09a-C4 — D4a, detector (D). `b3ae3c7` removed this sentence; QA
           restored it and the gate stayed green because it names no format. */
        '"Yaygın CAD formatlarını doğrudan işleyebiliyoruz; katı model ile birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır.",',
      ],
      silent: [
        /* 09a-C4 / R3-6 — the same tuple in three spellings. The pin PARSES its
           span now, so a formatter run and a quote-style change are invisible
           to it while a content change is not. A8 and A9 were both this false
           positive. */
        {
          file: "src/content/claims.ts",
          text: 'const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;',
        },
        {
          file: "src/content/claims.ts",
          text: 'const PUBLISHED_CAD_EXTENSIONS = ["step","stp","stl","obj","iges","igs","3mf"] as const;',
        },
        {
          file: "src/content/claims.ts",
          text: "const PUBLISHED_CAD_EXTENSIONS = ['step', 'stp', 'stl', 'obj', 'iges', 'igs', '3mf'] as const;",
        },
        // The landing prose the second pin blesses — the live string
        // `e2e/technical-landing.spec.ts:167` asserts is visible.
        {
          file: "src/data/technicalLandingData.ts",
          text: '"STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını teklif akışında doğrudan yükleyebilirsiniz.",',
        },
        // The derived replacements: `normalise()` drops `${…}`, so there is no
        // format token in the source to find. This is the invariant.
        'answer: `Teklif akışındaki yükleyici şu uzantıları doğrular: ${CAD_UPLOAD_EXTENSIONS} — listede olmayan bir uzantı yükleme adımından geçmez.`,',
        '{ label: "Desteklenen CAD", value: CAD_UPLOAD_FORMATS },',
        { file: "src/pages/SSS.tsx", text: "answer: `Teklif akışındaki yükleyici ${CAD_UPLOAD_FORMATS} dosyalarını kabul eder.`," },
        // Naming a rejected format in order to REFUSE it. This is what lets the
        // six phrasings QA measured (`catia`, `catpart`, `sldprt`, …) keep
        // routing to an honest answer instead of falling off the matcher.
        '"Yerel CAD kayıtlarınızı (SolidWorks .sldprt, CATIA .catpart, NX .prt) veya PDF/DWG teknik resminizi sales@mastechnic.com adresine iletirseniz teklif için değerlendiririz."',
        // A question is not an offer.
        'question: "SolidWorks veya CATIA dosyamı doğrudan yükleyebilir miyim?",',
        /* 09a-C4 — detector (D)'s two discriminators, each proved by removing
           one half of the claim. The replacement `b3ae3c7` wrote keeps the
           offer and drops the vague scope; the landing FAQ question keeps the
           noun and the verb and asks rather than answers. */
        '"Analiz, teklif akışına yüklenen katı model üzerinden yürütülür; modelle birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır.",',
        '"Yaygın CAD formatları için ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır."',
        { file: "src/data/technicalLandingData.ts", text: '"Hangi dosya formatlarını destekliyorsunuz?",' },
        /* 09a-C5 / R4-2 — detector (D)'s two over-catches, each held to the
           discriminator that closes it. Neither string is in the tree; both are
           ordinary sentences this site is entitled to write, and the detector
           fired on both while the comment beside it argued it could not.
           (i) the visitor's own files, uploaded by the visitor — no claim about
               which formats survive the validator. */
        '"Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz."',
        /* (ii) the report WE deliver, in the formats WE emit — detector (C) draws
               this same line for `{ label: "Rapor Formatı", … }`. */
        '"Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz."',
        /* The CAD software our engineers model IN — a capability, not an intake
           list.
           09a-C4 — RE-AIMED. This slot used to hold `"CAD/CAM Entegrasyonu —
           CATIA, SolidWorks, NX, Mastercam",`, which `b3ae3c7` had already
           DELETED. A negative control asserting silence on a string that no
           longer exists passes vacuously and quietly blesses the whole class,
           which is the failure mode `runControls` exists to prevent. It is
           replaced by the two strings in this class that are LIVE, so the
           control fails the day either of them changes.

           09a-C5 / R4-3 — AND THE CLASS IS SIX SITES, NOT FIVE, AND IT IS NO
           LONGER CITED BY LINE NUMBER. This slot used to say "those two, plus
           `:774`, `:779`, `:797` and `:804`". Both faults were in that one
           sentence: the four numbers were already stale when they were written
           (a 14-line comment added in the same batch had moved them to `:788`
           `:793` `:811` `:818`), and the enumeration resolved to five distinct
           sites rather than six, because one line was counted twice and
           `tasarım (SolidWorks, CATIA, NX)` was named nowhere at all.

           The class is enumerated by CONTENT in
           `DEFERRED_09B_SOFTWARE_INVENTORY`, marker `09b-SOFTWARE-INVENTORY`,
           and every entry is asserted to still resolve on every invocation. Two
           of the six are also negative controls here, because they are the two
           this rule would otherwise be tempted to catch. Grep the marker; do no
           arithmetic. */
        { file: "src/data/servicePages.ts", text: '{ label: "CAD", value: "SolidWorks, CATIA, NX" },' },
        '"CATIA ve SolidWorks ile 3D modelleme, kuvvet ve tolerans analizi simülasyonu."',
        // The report WE deliver, not the file the visitor sends.
        '{ label: "Rapor Formatı", value: "PDF + revize CAD" },',
        // `STL` as an abbreviation for STEEL. One token is not a list.
        '{ code: "STL·4140·QT", name: "Çelik 4140 QT", subtitle: "Otomotiv · şanzıman parçaları" },',
        // Matcher input, never rendered — and the reason those five tokens are
        // there is so a visitor who types one REACHES the derived answer.
        'keywords: ["dosya", "format", "cad", "step", "iges", "stl", "obj", "3mf", "çizim", "3d", "model"],',
        // The authority itself, and the derivations that read it.
        { file: "src/utils/cadFiles.ts", text: 'export const CAD_ACCEPTED_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;' },
        'const CAD_EXTENSION_LIST = CAD_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(", ");',
      ],
    },
    authority: "§J ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION · §0 DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK",
    remedy:
      "Derive the list from CAD_ACCEPTED_EXTENSIONS — src/data/servicePages.ts exports CAD_UPLOAD_FORMATS ('STEP, STP … ve 3MF') and CAD_UPLOAD_EXTENSIONS ('.step, .stp …'). Never widen the validator to match the copy: that turns a false sentence into a broken upload. A format may be NAMED in order to be refused; it may not be named in order to be offered.",
  },
  {
    id: "free-of-charge-commitment",
    /* NEW — 09a-C3. `payment-or-credit-terms` (above) removed payment terms,
       credit lines and discount schedules from the chatbot on the grounds that
       a commercial POLICY is not a fact about capability. It left the mirror
       image untouched: a price of zero.

       `servicePages.ts:1965` answered "DFM analizi ücreti var mı?" with "İlk
       DFM değerlendirmesi ücretsizdir", and `:81` carried "ücretsiz DFM
       analizi" in a `metaDescription`. Nothing in `USER_INPUTS.md` authorises
       a tariff of any size, zero included, and `/iletisim` lost "30 dakikalık
       ücretsiz ilk görüşme" in Phase 07 for exactly this reason while these
       two survived four more phases.

       09a-C4 / R3-4 — THIS COMMENT USED TO CLAIM MORE THAN WAS TRUE ABOUT THE
       SECOND SITE. It said the string went "into search results and social
       cards, not merely onto the page". It went to neither.
       `ServiceDetail.tsx` passes `page.description` at :195, :284 and :306,
       and nothing anywhere in `src/**` reads `metaDescription` on a service
       route — all 44 of them are dead data. (`LegalDocument.tsx` has a prop of
       the same name and it is a different prop on a different type.)

       THE REMOVAL WAS RIGHT AND ONLY THE REASON WAS WRONG. An unauthorised
       commercial policy is unauthorised in a dead field exactly as in a live
       one, and that field is one `usePageMeta` call from being live — which is
       also why the gate reads it. That 44 service pages carry an unread
       `metaDescription` is a real finding, and it is an SEO finding: it is not
       wired up here, because a content correction is the wrong place to decide
       what a page's search-result copy should be.

       IT CANNOT BE SOFTENED, only replaced. "teklifle birlikte" answers a
       question about WHEN; the reader asked HOW MUCH and was told a rule. So
       the remedy is the mechanism: what the step actually is, and where the
       price is set.

       ANCHORED TO THE GRANT, like the rule it sits beside. "Ücret var mı?" is
       a question a visitor asks and must keep working, and the honest answer
       ("Yayımlanan sabit bir ücret tarifemiz yok") must not fire either —
       neither contains a word from this pattern. `keywords: [ … ]` is matcher
       input and is exempted the same way, narrowly, for this rule only.     */
    pattern: trPattern(
      new RegExp(
        [
          String.raw`ücretsiz`,
          String.raw`bedelsiz`,
          String.raw`masrafsız`,
          String.raw`hiçbir\s+(?:ücret|bedel)`,
          String.raw`(?:ek\s+)?(?:ücret|bedel)\s*(?:talep\s+etmiyoruz|alınmaz|almıyoruz|yansıtmıyoruz)`,
          String.raw`(?:ilk|birinci)\s+(?:\S+\s+){0,3}?(?:ücret|bedel)\s*(?:alınmaz|yoktur)`,
        ].join("|"),
        "gi",
      ),
    ),
    exempt: (text, index) => insideKeywordArray(text, index),
    controls: {
      fires: [
        '{ question: "DFM analizi ücreti var mı?", answer: "İlk DFM değerlendirmesi ücretsizdir. Detaylı analiz raporu ve CAD revizyonları proje kapsamına göre fiyatlandırılır." },',
        '"3, 4 ve 5 eksenli CNC frezeleme ile ±0.01 mm standart tolerans aralığında üretim. Alüminyum, titanyum ve çelik işleme, ücretsiz DFM analizi.",',
        '"30 dakikalık ücretsiz ilk görüşme"',
        '"İlk numune için hiçbir ücret talep etmiyoruz."',
        '"Kargo bedelsizdir."',
      ],
      silent: [
        // The replacements: a mechanism, and where the price is actually set.
        '"Yayımlanan sabit bir DFM ücret tarifemiz yok. Gelen dosyanın üretilebilirlik incelemesi teklif hazırlığının bir adımıdır; ayrıca talep edilen detaylı DFM raporu ve CAD revizyonları ise kapsamıyla birlikte teklifte fiyatlandırılır."',
        '"Alüminyum, titanyum ve çelik işleme, teklifle birlikte üretilebilirlik incelemesi.",',
        // The question a visitor asks has to keep working.
        'question: "DFM analizi ücreti var mı?",',
        '"Ödeme koşulları siparişe göre teklifte belirlenir."',
        'keywords: ["ücret", "ücretsiz", "bedel", "fiyat", "maliyet"],',
      ],
    },
    authority: "§0 DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK · NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES · §J — QUOTE_SLA is the only commercial term supplied",
    remedy:
      "A price of zero is a commercial policy, exactly as a payment term is, and no field authorises one. State the mechanism — what the step is and where the price is set — rather than softening the promise into a hedge.",
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
    //
    // WIDENED — 09a-C3, with the two alternations appended at the end. The
    // existing source is spliced in verbatim rather than retyped, so the
    // widening provably cannot change what already fired. The measurement of
    // why the three live claims walked past it is above `UNSOURCED_BENEFIT_PCT`.
    pattern: new RegExp(
      [
        /(?:%\s?|yüzde\s+)\d{1,3}([.,]\d+)?\s*(zamanında|teslimat oranı|başarı|kalite oranı|verimlilik|doğruluk|ilk seferde|hatasız|fire|hurda|red oranı)|(zamanında teslimat|teslimat oranı|başarı oranı|kalite oranı|hatasız üretim|müşteri memnuniyeti)[^.\n]{0,30}(?:%\s?|yüzde\s+)\d|(zamanında teslimat|teslimat oran|başarı oran|kalite oran|hatasız üretim|müşteri memnuniyet|verimlilik|doğruluk oran)[^.\n]{0,30}yüzde\s+(?:yüz|doksan|seksen|yetmiş|altmış|elli|kırk|otuz|yirmi|on\b|dokuz|sekiz|yedi|altı|beş|dört|üç|iki|bir)|yüzde\s+(?:yüz|doksan|seksen|yetmiş|altmış|elli)[^.\n]{0,30}(zamanında|teslimat oran|başarı oran|kalite oran|hatasız|verimlilik)|(?:%\s?|yüzde\s+)\d{1,3}(\s?-\s?\d{1,3})?(['’]?[a-zçğıöşü]{0,3})?\s*(tasarruf|maliyet|süre|ağırlık|kazan[çc]|iyileş|azalma|artış)|(tasarruf|maliyet düşüşü|verim artışı)[^.\n]{0,20}(?:%\s?|yüzde\s+)\d/
          .source,
        UNSOURCED_BENEFIT_PCT,
        UNSOURCED_BENEFIT_LABEL_VALUE,
      ].join("|"),
      "gi",
    ),
    controls: {
      fires: [
        // F1 — an unsourced speed claim, and the shape that defeated the old
        // no-gap alternation: `daha hızlı` was not in the noun list at all.
        '"HSM ile %40 daha hızlı üretim ve üstün yüzey kalitesi",',
        // Same class, adjacent page. `setup ` sat in the gap.
        '"Çift milli üretimle %50 setup tasarrufu",',
        // F2a — and it was in a metaDescription, so it shipped into search
        // results. `kadar ` sat in the gap.
        '"CNC ve enjeksiyon DFM kuralları, CATIA/SolidWorks/NX entegrasyonu, %70\'e kadar maliyet tasarrufu.",',
        // F2b — the noun is in the LABEL, on the far side of a string boundary.
        '{ label: "Maliyet Tasarrufu", value: "Ortalama %30-50" },',
        // The alternations that already worked, kept under control so the
        // splice above is proved not to have dropped them.
        '"%95 zamanında teslimat oranı"',
        '"yüzde doksan sekiz kalite oranı"',
        /* 09a-C4 / R3-3 — the softened suffix. Both of these passed the full
           gate while `Zaman Kazanç`, which nobody writes, fired. */
        '{ label: "Maliyet Kazancı", value: "%30-50" },',
        '"%35 zaman kazancı elde edilir"',
        // The unsoftened form, so the widening is proved not to have replaced
        // what it was extending.
        '{ label: "Zaman Kazanç", value: "%30-50" },',
      ],
      silent: [
        /* 09a-C4 / R3-3 — the two live `kazan…` sentences in the tree. Neither
           quantifies anything, and the number is what this rule turns on: a
           wider noun list must not start firing on ordinary Turkish. */
        { file: "src/data/blogData.ts", text: '"Beş eksenin asıl kazancı hız değil, kurulum sayısıdır: her yeni bağlama yeni bir referans hatası kaynağıdır.",' },
        { file: "src/data/blogData.ts", text: 'heading: "Asıl kazanç: kurulum sayısı",' },
        // The replacements: capability keeps its substance, loses the number.
        '"HSM stratejisiyle ince cidarlı parçalarda düşük kesme kuvveti ve iyi yüzey kalitesi",',
        '"Çift mil ile parçanın arka yüzü ayrı bir bağlama gerektirmeden tamamlanır",',
        '{ label: "Maliyet Kaldıraçları", value: "Parça sayısı, bağlama, tolerans" },',
        '"Tasarrufun büyüklüğü parçanın geometrisine ve mevcut üretim planına bağlıdır."',
        // A SURCHARGE is not a benefit. The Ra guide prices a finer finish
        // relative to standard machining; it grades no performance.
        '["0.1 – 0.2", "Ayna parlaklığı", "Optik, yatak yüzeyleri", "Lepleme, polisaj", "+%80-100"],',
        // Material and physics percentages, which this rule must never touch.
        '{ label: "Okuma Oranı", value: "%99.9+" },',
        '"OFE bakır (C10100 — IACS %101) ve ETP bakır (C11000 — IACS %99.9)"',
        '"Kaplama kalınlığının %50\'si malzemeye nüfuz eder, %50\'si yüzeyden dışarı çıkar."',
        // Direction without a number: arithmetic about setup amortisation.
        '"Birim maliyeti belirleyen asıl kalem kurulumdur ve adede bölünür; hacim arttıkça birim fiyat düşer."',
      ],
    },
    authority:
      "§D ON_TIME_DELIVERY_INTERNAL: 95% (PUBLIC_IF_VERIFIED_AND_STRATEGIC — condition not met) · OTHER_PUBLIC_KPIS: NONE · §G CASE_STUDIES: NONE_PROVIDED_YET",
    remedy:
      "No self-graded performance percentage and no quantified project outcome is published. A capability keeps its substance and loses the unverifiable number. See ON_TIME_DELIVERY in src/content/claims.ts.",
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
        // PHASE 07 CORRECTION #1 — F2, HOLE 1.
        // The old form was `\b\d[\d.,]*\s?\+\s*(?:parça|malzeme|proje|çeşit)`:
        // the noun had to follow the digit IMMEDIATELY, and three of the
        // commonest inventory nouns were absent. Proved, not inferred — the
        // byte-identical gate reported `PASS — 0` over a tree that still
        // carried `15+ alüminyum alaşımı`, and in a scratch tree
        // `15+ malzeme` / `15+ çeşit` fired while `15+ alüminyum alaşımı`,
        // `20+ renk seçeneği` and `1000+ ünite/gün` were all silent.
        // So: up to two intervening adjectives, and the noun may carry any
        // Turkish suffix. Written against the I-FOLDED text, hence `alaş[ıi]m`.
        //
        // What must keep NOT firing, and does: `60+ HRC`, `1100+ MPa`,
        // `950+ MPa`, `1.000.000+ çevrim`, `500.000+ çevrim`, `10.000+ çevrim`,
        // `500+ saat (ASTM B117)`, `1000+ saat tuz testi`,
        // `1000+ otoklav döngüsü`, `16+ kavite`, `2000N+`, `25+ yıl`. None of
        // their nouns is an inventory noun; these are specification values and
        // over-removal there fails §0 PRECISION_ENGINEERING.
        //
        // PHASE 07 CORRECTION #2 — H1. The widening reached the INVENTORY
        // nouns and stopped there, so `30+ tezgah` fired (the first
        // alternative, whose noun is glued to the digit) while
        // `30+ yeni tezgah`, `25+ deneyimli mühendis`,
        // `40+ tam zamanlı personel`, `150+ aktif müşteri` and
        // `5.000+ kapalı metrekare` were all silent. The three JSX-residue
        // alternatives directly below already carry
        // `tezgah|makine|mühendis|teknisyen|personel|çalışan|müşteri|metrekare`,
        // so the omission was an oversight in ONE alternative rather than a
        // decision — and company scale is the class §0
        // DO_NOT_EMPHASIZE_COMPANY_SCALE names by name. One intervening
        // adjective must not defeat it either.
        //
        // The negative controls above are unaffected: none of them reaches a
        // scale noun within two words of the plus.
        //
        // `çal[ıi]şan` is belt-and-braces, and the commit that added it gave a
        // WRONG reason — recorded here rather than quietly dropped, because a
        // false claim about the machinery is the defect this packet exists to
        // fix. It said the unfolded spelling `çalışan` is dead against the
        // I-folded text. It is not: every rule's pattern is itself folded, once,
        // at the bottom of this file (`rule.pattern = trPattern(rule.pattern)`),
        // so ordinary Turkish spelling is correct in ANY `pattern` rule and
        // `alaş[ıi]m` above was never needed either. Folding is idempotent, so
        // the bracket form costs nothing and keeps the alternative readable
        // if it is ever lifted out of a `pattern` rule.
        String.raw`\b\d[\d.,]*[ \t]?\+[ \t]*(?:${TRW}+[ \t]+){0,2}(?:parça|malzeme|proje|çeşi[td]|alaş[ıi]m|renk|ünite|ürün|model|kalem|marka|tedarikçi|sektör|tezgah|tezgâh|makine|mühendis|teknisyen|personel|çal[ıi]şan|operatör|müşteri|metrekare|m²|m2\b)${TRW}*`,
        // F2, HOLE 2 — the count that is never in the source.
        // `Malzemeler.tsx:122` read `{materialsData.length}+ malzeme ve
        // alaşım` and RENDERED "87+ malzeme ve alaşım". A rule that existed
        // was defeated purely because no digit is written down.
        // `normalise()` already erases `${…}` template interpolation, but a
        // JSX `{expr}` keeps both braces, so the residue is a literal `}`
        // sitting where the number will be. That residue is the signal.
        // Restricted to the same line (`[ \t]`, never `\s`) so a closing brace
        // of ordinary code cannot reach a noun on a later line.
        String.raw`\}[ \t]{0,2}\+[ \t]*(?:${TRW}+[ \t]+){0,2}(?:parça|malzeme|proje|çeşi[td]|alaş[ıi]m|renk|ünite|ürün|model|kalem|tezgah|tezgâh|makine|mühendis|teknisyen|personel|çalışan|müşteri|metrekare)${TRW}*`,
        String.raw`\}[ \t]{1,2}(?:${TRW}+[ \t]+){0,2}(?:parça|malzeme|proje|çeşi[td]|alaş[ıi]m|renk|ünite|tezgah|tezgâh|makine|mühendis|teknisyen|personel|çalışan|müşteri|metrekare)${TRW}*[ \t]*(?:çeşi[td]|say[ıi]s[ıi]|aded[ıi]|seçene)`,
        // The third shape of the same hole: `` `${n}+ parça` ``. Here
        // `normalise()` DOES erase the interpolation (that erasure is what
        // defeats `AS${x}9100D`, so it must stay), which leaves a string
        // literal that begins `+ parça`. Prose does not start with a bare
        // plus, so the literal boundary is itself the evidence.
        String.raw`["'\x60][ \t]{0,2}\+[ \t]*(?:${TRW}+[ \t]+){0,2}(?:parça|malzeme|proje|çeşi[td]|alaş[ıi]m|renk|ünite|tezgah|tezgâh|makine|mühendis|teknisyen|personel|çalışan|müşteri|metrekare)${TRW}*`,
        // Stock tonnage is order-volume disclosure: it tells a reader what the
        // company buys and turns over. §D REVENUE_OR_ORDER_VOLUME.
        // Stock tonnage is ONE statement — "güvenlik stoğu (5.000 kg)" — so the
        // proximity window may not wander across three table columns:
        // `"Stokta", "Aynı gün", "Talebe bağlı", "1 kg"` is a delivery status
        // and a minimum order quantity in different columns, and reading them as
        // one claim is the mirror image of the table blind spot below. The
        // window therefore stops at a string-literal boundary…
        // (`sto[kğ]`: `stoğu` softens the k, and the k-only stem missed
        // "Güvenlik stoğu (5.000 kg)" entirely.)
        String.raw`(?:sto[kğ]|depo)\w*[^.\n"'\x60]{0,60}?\b\d[\d.,]*\s?(?:kg|ton)\b`,
        String.raw`\b\d[\d.,]*\s?(?:kg|ton)\b[^.\n"'\x60]{0,60}?(?:sto[kğ]|depo)`,
        // …with ONE exception, the label/value pair, which is a single claim
        // split across two literals by construction:
        // `{ label: "Stok Malzeme", value: "Al 6061: 5.000 kg" }`.
        String.raw`(?:label|title|name|key)\s*:\s*["'\x60][^"'\x60]*(?:sto[kğ]|depo)[^"'\x60]*["'\x60]\s*,\s*(?:value|val|text|desc)\s*:\s*["'\x60][^"'\x60]*\b\d[\d.,]*\s?(?:kg|ton)\b`,
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
    id: "periodic-volume-disclosure",
    // PHASE 07 CORRECTION #2 — H3. THE CLASS F1 REMOVED HAD NO GATE AT ALL.
    //
    // Phase 07's most serious finding was `{ label: "CNC Seri Kapasite",
    // value: "50.000 adet/yıl" }` and `{ label: "Döküm Kapasite", value:
    // "500.000 adet/yıl" }` promoted onto a listing surface. The content was
    // removed and `publishableSpecValues()` now defends the listing by
    // construction — but a scratch file containing those two pairs, plus
    // "Seri üretim kapasitelerimiz: CNC seri işleme 1.000-50.000 adet/yıl",
    // "yılda 50.000 adet üretiyoruz", "aylık 20.000 adet kapasite" and
    // "günde 1000 ünite", ran through the gate as `0 claim violations`.
    // Re-adding any of those six lines tomorrow left the build green. The
    // spelled-out `50 bin adet` was caught by the magnitude alternative above;
    // no numeric form was caught by anything.
    //
    // A content fix with no gate behind it is one commit from regressing
    // silently, so the class gets its own rule.
    //
    // THE CLASS IS A COUNT OVER A PERIOD, not a count. That distinction is the
    // whole rule and it is the one `USER_INPUTS.md` §D draws:
    // REVENUE_OR_ORDER_VOLUME is what the company turns over. A minimum or
    // maximum LOT SIZE — `1 adet`, `10-500 adet`, `1.000 adet` — is a
    // commercial term a buyer needs in order to self-qualify, it discloses no
    // volume, and it must keep rendering. So every alternative below requires
    // a period: as a denominator (`adet/yıl`), as an adverb (`yılda`,
    // `günde`), or as an adjective (`yıllık`, `aylık`).
    //
    // No digit is required. F2's HOLE 2 was exactly a count that is never
    // written down (`{materialsData.length}+ malzeme`), and `adet/yıl` is a
    // throughput unit whether or not the number is a literal.
    //
    // The COUNT nouns are deliberately identical to `WITHHELD_SPEC_CLASSES[0]`
    // in `src/content/claims.ts`. Two instruments disagreeing about what a
    // class is was itself a Phase 07 finding (H6).
    //
    // THE PERIOD LIST USED TO OMIT `saat`, AND THAT OMISSION WAS WRONG.
    // 09a-C3 corrects it. The note that stood here read:
    //
    //   "with `saat` included this rule fires on `servicePages.ts:471`,
    //    headers: ["Kavite", "Çevrim/Saat", "Parça/Saat", …], which is a
    //    mould's cycle rate sitting next to its cycle count — a process
    //    parameter … not a statement about what the company turns over."
    //
    // It named the right table and defended the wrong column. `Çevrim/Saat`
    // was never at risk: `çevrim` is not one of the COUNT NOUNS above, so the
    // rule cannot see it whatever the period list says. The only thing `saat`
    // switched on was `Parça/Saat` — a count noun over a period, which is the
    // exact shape this rule exists for and which `WITHHELD_SPEC_CLASSES[0]`
    // in `src/content/claims.ts` has always listed, `saat` included. So the
    // omission bought nothing and cost the class: the header published
    // parts-per-hour past this gate for three phases, escaping the chip
    // filter too because that one runs on `technicalSpecs` and never on a
    // comparison-table header. Two instruments disagreeing about what a class
    // is was itself finding H6; here they now agree.
    //
    // `saat` is added to the DENOMINATOR alternative only. The adverbial and
    // adjectival forms (`saatte`, `saatlik`) stay out: they are how ordinary
    // machining prose states a cycle time, and `quote-sla-overpromise` owns
    // the one shape of theirs that is a promise.
    //
    // The explicit `trPattern()` below is redundant — the loop at the bottom of
    // this file folds every rule's `pattern` already, and folding is
    // idempotent. It is kept because this rule is the one place where the
    // period words (`yıl`, `yıllık`, `yılda`) carry the dotless ı in every
    // alternative, and a reader checking THIS rule should not have to scroll
    // 500 lines to learn why they match `yil`.
    pattern: trPattern(
      new RegExp(
        [
          // `50.000 adet/yıl`, `adet / yıl`, `adet/ay`, `ünite/gün`,
          // `1.000-50.000 adet/yıl`, `parti/vardiya`.
          String.raw`${NB}(?:adet|ünite|parça|birim|palet|parti|sipariş)${TRW}*[ \t]*\/[ \t]*(?:yıl|ay|hafta|gün|saat|vardiya)${NA}`,
          // `yılda 50.000 adet`, `günde 1000 ünite`, `ayda toplam 20.000 parça`.
          String.raw`${NB}(?:yılda|ayda|haftada|günde|vardiyada)[ \t]+(?:${TRW}+[ \t]+){0,2}\d[\d.,]*[ \t]?K?[ \t]?\+?[ \t]*(?:adet|ünite|parça|birim|palet|parti|sipariş)${NA}`,
          // `yıllık 50.000 adet`, `aylık 20.000 adet kapasite`, `günlük 1000 ünite`.
          String.raw`${NB}(?:yıllık|aylık|haftalık|günlük)[ \t]+(?:${TRW}+[ \t]+){0,2}\d[\d.,]*[ \t]?K?[ \t]?\+?[ \t]*(?:adet|ünite|parça|birim|palet|parti|sipariş)${NA}`,
          // The same statement with the period trailing: `50.000 adet yıllık
          // kapasite`, `20.000 parça aylık`.
          String.raw`${NB}\d[\d.,]*[ \t]?K?[ \t]?\+?[ \t]*(?:adet|ünite|parça|birim|palet|parti|sipariş)${TRW}*[ \t]+(?:yıllık|aylık|haftalık|günlük|yılda|ayda|günde|vardiyada)${NA}`,
          // The label/value pair, where the period is in the LABEL and the
          // count in the VALUE — one claim split across two string literals by
          // construction, the same shape the stock rule above already has to
          // handle: `{ label: "Yıllık Kapasite", value: "50.000 adet" }`.
          // The label side carries PERIOD words only, and not `kapasite`:
          // with `kapasite` on the label side this fires on
          // `servicePages.ts:63`, `{ label: "Takım Kapasitesi", value:
          // "30-120 adet (otomatik)" }` — a tool magazine, which is a machine
          // envelope and not a throughput. `{ label: "Minimum Sipariş",
          // value: "10-500 adet" }` stays silent for the same reason the whole
          // rule requires a period: a lot size is not a volume.
          String.raw`(?:label|title|name|key)[ \t]*:[ \t]*["'\x60][^"'\x60]*(?:yıllık|aylık|haftalık|günlük|${NB}(?:yıl|ay|hafta|gün|vardiya)${NA})[^"'\x60]*["'\x60][ \t]*,[ \t]*(?:value|val|text|desc)[ \t]*:[ \t]*["'\x60][^"'\x60]*${NB}\d[\d.,]*[ \t]?K?[ \t]?\+?[ \t]*(?:adet|ünite|parça|birim|palet|parti|sipariş)${NA}`,
        ].join("|"),
        "gi",
      ),
    ),
    controls: {
      fires: [
        '"CNC Seri Kapasite", "50.000 adet/yıl"',
        '"yılda 50.000 adet üretiyoruz"',
        // 09a-C3 — F4. The header that escaped both instruments.
        'headers: ["Kavite", "Çevrim/Saat", "Parça/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],',
      ],
      silent: [
        // The corrected header row. `Çevrim/Saat` is a mould cycle rate — a
        // process parameter, and never reachable by this rule anyway, because
        // `çevrim` is not a count noun. The control pins that it stays so.
        'headers: ["Kavite", "Çevrim/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],',
        // A lot size carries no period.
        '{ label: "Adet Aralığı", value: "10-500 adet" },',
        '{ label: "Takım Kapasitesi", value: "30-120 adet (otomatik)" },',
        // A cycle time in ordinary machining prose.
        '"Kalıp çevrim süresi 45 saatte doğrulanır."',
      ],
    },
    authority:
      "§D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE · §0 DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES · NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES",
    remedy:
      "Throughput over a period is order-volume disclosure and is withheld even where verified. A lot size (`10-500 adet`) is not — it carries no period, and this rule requires one. If a whole table COLUMN is throughput, remove it: `Parça/Saat` was Kavite × Çevrim/Saat and carried no information the two columns beside it did not.",
  },
  {
    id: "machine-inventory",
    // CASE-SENSITIVE: these are proper nouns and always capitalised in source,
    // and case-insensitively `GOM` matches inside ordinary words. The machine
    // brand `Okuma` is deliberately absent — it collides with the Turkish word
    // "okuma" (reading), which the DataMatrix page uses correctly as
    // "Okuma Doğrulama". A rule that cries wolf gets switched off.
    // `EOS` added 09a-C3. `servicePages.ts:2103` and `:2131` published "EOS
    // M290" through Phase 06's sweep of the machine-park page and three
    // phases of this gate, because the brand was simply not on the list —
    // and `:2131` is a `faq` entry, so `collectServiceFaqs()` had put the
    // model number in the chatbot pool as entry #78, reachable by asking.
    // Matched with a following model designation rather than bare: `EOS` is
    // three capitals that occur inside identifiers and acronyms, and a rule
    // that cries wolf gets switched off — the same reasoning that keeps
    // `Okuma` off this list. `EOSINT` is the other product family.
    pattern:
      /DMG\s?MORI|\bDMU\s?\d|Variaxis|monoBLOCK|\bMazak\b|\bHaas\b|\bSodick\b|\bZeiss\b|\bGOM\b|Taylor\s?Hobson|Mitutoyo|Renishaw|Hexagon\s?Metrology|Keyence|Hermle|Doosan|Makino|Kitamura|\bStuder\b|\bKUKA\b|\bFANUC\b|Stratasys|Formlabs|Trumpf|GF Machining|\bTornos\b|\bEOS\s?[A-Z]?\s?\d{2,4}\b|\bEOSINT\b/g,
    controls: {
      fires: [
        '"Metal 3D Baskı (DMLS) — EOS M290 ile Al, SS, Ti",',
        '{ question: "Metal 3D baskı yapabiliyor musunuz?", answer: "Evet, EOS M290 DMLS sistemimiz ile alüminyum, paslanmaz çelik ve titanyum malzemelerde metal 3D baskı yapabiliyoruz." },',
        '"DMG MORI DMU 50 işleme merkezi"',
      ],
      silent: [
        // The process is a capability; the machine that runs it is inventory.
        '"Metal 3D Baskı (DMLS) — alüminyum, paslanmaz çelik ve titanyum",',
        '"Evet. DMLS (doğrudan metal lazer sinterleme) ile alüminyum, paslanmaz çelik ve titanyum malzemelerde metal 3D baskı yapıyoruz."',
        // `Okuma` the Turkish noun, kept off the brand list on purpose.
        '{ label: "Okuma Doğrulama", value: "ISO/IEC 15415" },',
      ],
    },
    authority: "§D MACHINE_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE — and no model list was ever supplied",
    remedy: "Named machines and metrology brands were invented. Keep the process, drop the machine. §H supplies a real equipment PDF instead.",
  },
  {
    id: "fabricated-analytics",
    pattern: /\bviews\s*[:?]|TOPLAM OKUMA|okunma sayısı|görüntülenme sayısı|BLOG İSTATİSTİKLERİ/gi,
    authority: "§K ANALYTICS_PROVIDER: NONE",
    remedy: "With no analytics provider there is no view count, no total and no most-read ranking.",
  },
  {
    id: "demo-placeholder-badge",
    // Contract-mandated honesty labels are PINNED, not exempted by pattern.
    // The 2 Oct 2026 implementation contract (`docs/quality/mas-technic-
    // awwwards/decisions.md` C5) REQUIRES the word "Temsili" in exact captions
    // that tell the reader an image is representative rather than a company
    // photograph or report. That is the opposite of a placeholder badge, so
    // only those exact strings pass; any other "temsili" still fires.
    exempt: (text, index) => onContractHonestyLabel(text, index),
    controls: {
      fires: [
        '"TEMSİLİ İÇERİK"',
        '<span>Temsili veri</span>',
        '"Temsili malzeme görünümü"',
      ],
      silent: [
        '"Temsili malzeme görünümü; teknik seçim aşağıdaki kayıt ve çalışma koşullarına göre yapılır.";',
      ],
    },
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
    // Instagram and Facebook are permitted for the one handle the owner
    // supplied (`mastechnic`, 2026-10-01); any other handle is still a claim.
    pattern:
      /instagram\.com\/(?!mastechnic\b)[\w.]|facebook\.com\/(?!mastechnic\b)[\w.]|youtube\.com\/@?[\w.]|(?:twitter|x)\.com\/(?!intent)[\w.]|twitter:site/gi,
    authority: "§L INSTAGRAM / FACEBOOK: PUBLIC_OK (mastechnic only) · YOUTUBE: NONE · X_TWITTER: NONE",
    remedy: "Permitted channels: LinkedIn, instagram.com/mastechnic, facebook.com/mastechnic. See SOCIAL_LINKS in src/content/claims.ts.",
  },
  {
    id: "english-availability",
    pattern: /availableLanguage[^\n]*English/gi,
    authority: "§B ENGLISH_LIVE_NOW: NO",
    remedy: "Structured data must not advertise a language the site does not serve.",
  },
  {
    id: "wrong-city",
    // WIDENED — 09a-C2. The old pattern matched `geo.placename` and nothing
    // else, so it walked past `chatFaqData.ts:166`: "MAS Technic, İSTANBUL
    // merkezli bir hassas imalat firmasıdır." A wrong-city claim in published
    // PROSE sailed past the rule whose entire purpose is wrong-city claims —
    // and it was contradicted by the footer, the JSON-LD, `/iletisim` and that
    // same file's own address answer twenty lines earlier.
    //
    // The widened half is anchored to COMPANY-LOCATION vocabulary in either
    // order, not to the bare city name, because the bare name has innocent
    // uses that must not fire: `LiveClock.tsx` sets `timeZone:
    // "Europe/Istanbul"` (an IANA identifier), and `Login.tsx` uses "İstanbul"
    // as the PLACEHOLDER of a field where the CUSTOMER types their own city.
    // Neither is a claim about where MAS TECHNIC is. Both are negative
    // controls below.
    pattern: new RegExp(
      [
        String.raw`geo\.placename[^\n]*İstanbul`,
        String.raw`İstanbul[^.!?;{}\n]{0,40}?(?:merkez|bulunmakta|bulunuyoruz|yer al|konumlan|fabrika|tesis|şube|ofis|adres)`,
        String.raw`(?:merkez|merkezimiz|fabrikamız|tesisimiz|adresimiz|ofisimiz|üretim tesisi)[^.!?;{}\n]{0,40}?İstanbul`,
      ].join("|"),
      "gi",
    ),
    controls: {
      fires: [
        'geo.placename" content="İstanbul"',
        '"MAS Technic, İSTANBUL merkezli bir hassas imalat firmasıdır."',
        '"Üretim tesisimiz İstanbul Tuzla\'da yer alıyor."',
      ],
      silent: [
        'timeZone: "Europe/Istanbul",',
        '<Input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" maxLength={50} />',
        '"Mas Technic, İzmir merkezli bir hassas imalat firmasıdır."',
      ],
    },
    authority: "§A PUBLIC_CITY: İzmir",
    remedy: "The geo meta contradicted the footer, the JSON-LD and the address. Read PUBLIC_CITY from src/content/claims.ts.",
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
    //
    // WIDENED — 09a-C2, the RETURNS half. `garanti` and `güvence` cover the
    // promise when it is called a guarantee. `chatFaqData.ts:96` made the same
    // promise without either word: "Teknik şartnameye uymayan ürünlerde
    // ÜCRETSİZ İADE/DEĞİŞİM yapılmaktadır. Teslimat sonrası 7 iş günü içinde
    // bildirim yapmanız yeterlidir." A free return with a stated window IS an
    // unconditional guarantee — it is the strongest form of one, because it
    // names the remedy — and no field authorises it. `iade` is anchored to a
    // COMMITMENT (ücretsiz / koşulsuz / a return window / an offer verb) so
    // that ordinary vocabulary survives: an admin-side invoice `iade` row and
    // the KVKK "verilerin iadesi" of a data-subject right are not offers.
    pattern:
      /\bgaranti(?:\b|si|sini|siyle|sıyla|li|lidir|liyoruz|yoruz|mizdir)|garanti\s+(?:ed|alt|kapsam|veriyor|sunuyor)|\bgüvence(?:si|sini|leri|lerini|miz|mizi|mi)?\s+(?:ver|alt[ıi]na\s+al|taahhüt|ediyoruz|eder\b|edilir)|taahhüt\s+(?:ediyoruz|eder|edilir)|(?:ücretsiz|koşulsuz|şartsız|sorgusuz)\s+(?:iade|değişim|değiştirme|geri ödeme)|\biade(?:si|sini|niz)?\s+(?:hakkı|imkanı|imkânı|politikamız|yapılmakta|yapıyoruz|ediyoruz|edilir|kabul ed)|para\s+iades?i/gi,
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
    controls: {
      fires: [
        '"Ürün kalitesini garanti ediyoruz."',
        '"Teslimat güvencesi veriyoruz."',
        '"Teknik şartnameye uymayan ürünlerde ÜCRETSİZ İADE/DEĞİŞİM yapılmaktadır."',
        '"Beğenmezseniz koşulsuz iade hakkınız vardır."',
        '"Uygunsuz parçalarda para iadesi yapıyoruz."',
      ],
      silent: [
        '"Kalite güvencesi sağlıyoruz."',
        'keywords: ["garanti", "iade", "değişim", "kusur"],',
        '"Uygunsuzlukta etkilenen parti kayıttan belirlenebilir."',
        /* The QUESTION must keep working. Phase 06 removed the fabricated
           guarantee ANSWER and left the most commercially loaded question on
           the site routing to the DFM answer at 0.67 — a confident wrong
           answer, which is worse than the claim it replaced. The question is
           published copy and it names the topic; it does not offer a term. */
        'question: "İade veya değişim yapılabiliyor mu?",',
      ],
    },
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

      // A `metaTitle` is a pipe-separated badge list with no verbs in it, so
      // the sentence-scoped path above can never find a conformity predicate
      // there and every designation parked in one is invisible. Three sector
      // pages carried `IEC 61400`, `API 6A`, `NACE MR0175` and `IEC 62271` in
      // their titles after the same standards had been removed from the
      // description, the advantages, the features and the spec rows of those
      // very pages. `metaTitle` has no consumer today; the moment route
      // metadata is wired it becomes a SERP claim with no room for context, so
      // the allow-list applies to it unconditionally.
      META_TITLE.lastIndex = 0;
      while ((m = META_TITLE.exec(text)) !== null) {
        STANDARD_TOKEN.lastIndex = 0;
        for (const raw of m[1].match(STANDARD_TOKEN) ?? []) {
          const token = raw.replace(/\s+/g, " ").trim();
          if (ALLOWED_STANDARDS.some((re) => re.test(token))) continue;
          if (REFERENCE_CLASS_STANDARDS.some((re) => re.test(token))) continue;
          yield { index: m.index, match: token };
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
    /* 09a-C4 — `Mastercam` appended. `b3ae3c7` deleted "CAD/CAM Entegrasyonu —
       CATIA, SolidWorks, NX, Mastercam" and QA measured that restoring it left
       the gate green. Mastercam is a named CAM package and belongs in the list
       that already holds `Vericut` — the same class, the same authority, and
       no new judgement: §D supplied no software inventory of any kind.

       It gates that string and stops there, deliberately. The other three
       names in it are CAD AUTHORING tools and are the class deferred to 09b
       across six live sites; see the re-aimed control on
       `cad-format-list-not-derived`. Nothing in the tree names a CAM package
       today, so this widening moves nothing. */
    pattern: /SAP\s?(MES|ERP)|\bFastems\b|\bVericut\b|\b3DCS\b|\bMastercam\b/gi,
    controls: {
      fires: ['"CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam",'],
      silent: [
        // The capability without the product name — what replaced it.
        '"CAD/CAM Entegrasyonu — katı model, takım yolu ve revizyon tek akışta",',
      ],
    },
    authority: "§D — no software or automation-system inventory was supplied",
    remedy: "Named ERP/MES/CAM systems assert an infrastructure nobody verified.",
  },
  {
    id: "named-cad-package",
    /* 09b-2 — THE SUCCESSOR TO `DEFERRED_09B_SOFTWARE_INVENTORY`.
       That register asserted the six deferred sites still RESOLVED. 09b-2 took
       the decision the register was waiting for and removed all six, so the
       register's job ends and this rule begins: "still there" becomes "may not
       come back", which is strictly stronger.

       AUTHORITY, unchanged from `named-enterprise-system`: §D supplied no
       software inventory of any kind, and §0 sets
       `DO_NOT_EMPHASIZE_COMPANY_SCALE`. That rule already gates CAM and
       ERP/MES names on those grounds and its own comment says the three CAD
       AUTHORING names were the class deferred to 09b. This is that class.

       WHAT IT FIRES ON — the package as TOOLING, in two shapes:

         (i)  two or more packages named side by side, separated by nothing but
              a comma, a slash or `ve`/`veya`. That is an inventory: nobody
              writes "SolidWorks, CATIA, NX" to make a point about one file.
         (ii) one package plus an ownership or operation governor — `ile`,
              `entegre`, `entegrasyon`, `kullanarak`, `ortamında`, `üzerinde`,
              `yazılımı`, `lisans` — or one sitting in a parenthetical after a
              capability noun, which is how four of the six were written.

       WHAT IT MUST NOT FIRE ON, and the discriminator is STRUCTURAL rather
       than a list of blessed sentences. `servicePages.ts` names all three
       packages in the live intake answer, and it does so IN ORDER TO REFUSE
       their native files:

         "(SolidWorks .sldprt, CATIA .catpart, NX .prt)"

       Each name is followed by its own extension, so the separator between two
       package names is never bare — which is exactly the difference between
       naming a FILE and listing a TOOL. Shape (i) cannot reach it and shape
       (ii)'s governors are absent. The refusal is a negative control below and
       `scripts/qa-probes/p09a3-dist-grep.mjs:49` asserts it survives in `dist`.

       THE `\bNX\b` HALF IS THE RISKY ONE and it is deliberately never alone:
       two letters cannot carry a rule. It only ever fires beside another
       package name or a governor.

       OUT OF THIS RULE'S CLASS, ON PURPOSE:
       `src/components/landing/RestoredLandingSections.tsx:42` offers
       "STEP, STP, IGES, Parasolid, SolidWorks ve teknik resim formatlarını
       değerlendirebiliriz" — ONE package name, and the claim is about ACCEPTED
       FORMATS, which is `cad-format-list-not-derived`'s class and not this
       one. It is a negative control below so this rule cannot quietly swallow
       another rule's finding. Recorded rather than fixed here: that string is
       reachable only from the dev-only `/legacy-landing` route and is measured
       ABSENT from `dist/`, and the reason the format rule walks past it is
       that `değerlendirebiliriz` is not in `CAD_OFFER_PREDICATE`. Widening
       that predicate is the right fix and it belongs to whoever owns that
       file. */
    scan: namedCadPackageScan,
    controls: {
      fires: [
        // The six sites 09b-2 removed, restored verbatim. Each must be red.
        '"CATIA/SolidWorks ile 3D modelleme ve simülasyon.",',
        '"CATIA ve SolidWorks ile 3D modelleme, kuvvet ve tolerans analizi simülasyonu, 3D baskı veya hızlı imalat ile prototip üretimi",',
        '"3D Modelleme (CATIA/SolidWorks)",',
        '"CATIA/SolidWorks ile profesyonel tasarım",',
        '"Proje yönetimi: fizibilite analizi, tasarım (SolidWorks, CATIA, NX), prototip üretimi",',
        '{ label: "CAD", value: "SolidWorks, CATIA, NX" },',
        // The two Phase 09a deleted on the same reasoning, so the decision
        // covers what came before it as well as what it removed.
        '"CATIA, SolidWorks, NX entegre çalışma",',
        '"CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam",',
        // A single package claimed as tooling — the shape shape (i) misses.
        '"Parçalarınızı SolidWorks ile modelliyoruz."',
        '"CATIA lisansımız ile karmaşık yüzeyleri işliyoruz."',
      ],
      silent: [
        /* THE LIVE REFUSAL. All three names, and every one of them followed by
           the extension it refuses. This is the string the whole rule is
           shaped around; if it ever goes red the rule is wrong, not the copy. */
        '"Yerel CAD kayıtlarınızı (SolidWorks .sldprt, CATIA .catpart, NX .prt) veya PDF/DWG teknik resminizi sales@mastechnic.com adresine iletirseniz teklif için değerlendiririz."',
        // A question is not an inventory — it is matcher routing.
        'question: "SolidWorks veya CATIA dosyamı doğrudan yükleyebilir miyim?",',
        // Another rule's class, live in the tree. See the note above.
        {
          file: "src/components/landing/RestoredLandingSections.tsx",
          text: '"STEP, STP, IGES, Parasolid, SolidWorks ve teknik resim formatlarını değerlendirebiliriz."',
        },
        // The capability that replaced the six. No package, no inventory.
        '"3D modelleme, kuvvet ve tolerans analizi simülasyonu",',
        '"3D Modelleme",',
        '"Katı model ve imalat resmi tek akışta",',
        '{ label: "Tasarım", value: "Katı model ve teknik resim" },',
        // Word boundaries must hold: `NX` is two letters and lives inside words.
        '{ code: "LNX·7075", name: "Alüminyum 7075", subtitle: "Havacılık · yapısal" },',
        '"Linux tabanlı ölçüm istasyonu ile kayıt tutulur."',
      ],
    },
    authority: "§D — no software inventory was supplied · §0 DO_NOT_EMPHASIZE_COMPANY_SCALE",
    remedy:
      "A named CAD authoring package is inventory, not capability, and it is the class Phase 06 removed named machine models from. State the capability — 3D modelleme, tolerans simülasyonu, katı model ve imalat resmi. A package MAY be named in order to refuse its native file, which is what the intake answer in src/data/servicePages.ts does.",
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

/* ── controls: the gate has to be gated too ────────────────────────────────
   09a-C2. Three findings in three consecutive rounds were the SAME finding: a
   rule existed, reported PASS, and did not cover the claim it was named for.
   `wrong-city` matched `geo.placename` and walked past "İSTANBUL merkezli" in
   published prose. `quote-sla-overpromise` demanded `teklif` AFTER `24 saat`
   and walked past the exact string it was written to stop. `unconditional-
   guarantee` matched one nominal form and let sixteen inflections through.

   A rule with no control is an assertion. These run on EVERY invocation, not
   behind a `--self-test` flag, because a proof you have to remember to run is
   a proof that stops being true. A rule that stops firing on the string it was
   written for FAILS THE GATE, exactly as a live violation does.

   Controls go through the same `normalise()` the scanned tree does, and the
   same `exempt()`, so a control wrapped in `keywords: [ … ]` genuinely proves
   the exemption rather than a regex sitting next to it.                       */

const CONTROL_DEFAULT_FILE = "src/data/servicePages.ts";

/**
 * Every rule must be silent on the ONE duration this site is allowed to print.
 * Not a per-rule control: a global invariant, so a rule added next year is
 * held to it without its author knowing this file's history.
 */
const AUTHORISED_SLA = [
  { file: "src/content/claims.ts", text: 'export const QUOTE_RESPONSE_TIME = publish({\n  value: "1-3 iş günü",\n  visibility: "PUBLIC_CORE",\n});' },
  { file: "src/content/claims.ts", text: 'export const QUOTE_RESPONSE_TIME_DISPLAY = publish({\n  value: "1-3 İŞ GÜNÜ",\n});' },
  { text: '{ label: "Değerlendirme", value: QUOTE_RESPONSE_TIME },' },
  { text: '{ label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },' },
];

/** Run one rule over one control string and report whether it fired. */
function fires(rule, control) {
  const file = control.file ?? CONTROL_DEFAULT_FILE;
  const { text } = normalise(control.text);
  /** @type {{ index: number, match: string }[]} */
  const hits = [];
  if (rule.scan) {
    for (const hit of rule.scan(text, file)) hits.push(hit);
  } else {
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      hits.push({ index: m.index, match: m[0] });
      if (m[0].length === 0) rule.pattern.lastIndex += 1;
    }
  }
  return hits.filter((h) => !rule.exempt?.(text, h.index));
}

const asControl = (c) => (typeof c === "string" ? { text: c } : c);

function runControls() {
  /** @type {{ rule: string, kind: string, text: string }[]} */
  const failures = [];
  for (const rule of RULES) {
    for (const raw of rule.controls?.fires ?? []) {
      const c = asControl(raw);
      if (fires(rule, c).length === 0) {
        failures.push({ rule: rule.id, kind: "POSITIVE CONTROL DID NOT FIRE", text: c.text });
      }
    }
    for (const raw of [...(rule.controls?.silent ?? []), ...AUTHORISED_SLA]) {
      const c = asControl(raw);
      const hits = fires(rule, c);
      if (hits.length > 0) {
        failures.push({
          rule: rule.id,
          kind: `NEGATIVE CONTROL FIRED [${hits[0].match}]`,
          text: c.text,
        });
      }
    }
  }
  return failures;
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
      for (const hit of rule.scan(text, rel)) hits.push(hit);
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
 *
 * 09a-C5 / R4-5 — THE TWO PATHS IT READS ARE PARAMETERS. Not for flexibility:
 * so that a control can point it at a `mkdtempSync(tmpdir())` fixture whose
 * declared size is known to be wrong, and fail if it stays quiet. Every
 * ordinary invocation reads the real ledger and the real `public/`, and there
 * is no command-line flag that changes either — the defaults are the only
 * values production code ever supplies.
 */
function checkQualityResources(ledgerFile = CAD_LEDGER_FILE, publicDir = "public") {
  const ledgerPath = resolve(REPO_ROOT, ledgerFile);
  if (!existsSync(ledgerPath)) {
    return [{ file: ledgerFile, message: "the claim ledger is missing" }];
  }
  const source = readFileSync(ledgerPath, "utf8");
  const rows = [...source.matchAll(/href:\s*"(\/belgeler\/[^"]+)"\s*,\s*size:\s*"PDF · (\d+) KB"/g)];
  /** @type {{ file: string, message: string }[]} */
  const problems = [];
  if (rows.length === 0) {
    problems.push({ file: ledgerFile, message: "no QUALITY_RESOURCES rows found" });
  }
  for (const [, href, declared] of rows) {
    const onDisk = resolve(REPO_ROOT, publicDir, href.replace(/^\//, ""));
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

/* ── 09b-SOFTWARE-INVENTORY: the deferred class, named by CONTENT ───────
   09a-C5 / R4-3. Six live sites in `src/data/servicePages.ts` name CAD AUTHORING
   packages — CATIA, SolidWorks, NX. They are one class and one decision, and
   09b takes it; §D supplied no software inventory of any kind, but the class
   cannot be gated here without taking the decision, because the removed
   "CATIA, SolidWorks, NX entegre çalışma" is the same shape as the live
   "3D Modelleme (CATIA/SolidWorks)" down to the punctuation and any rule that
   catches one catches all six.

   C4 recorded the deferral IN A COMMENT, BY LINE NUMBER, and it was wrong
   before the batch that wrote it had finished: it cited `:774 :779 :797 :804`,
   and a 14-line comment added at `:132` in the same batch had already moved
   them to `:788 :793 :811 :818`. It was also short by one — `:793` was counted
   twice and the `tasarım (SolidWorks, CATIA, NX)` site was named nowhere. Two
   arithmetic faults in one four-item list is not carelessness, it is the wrong
   NOTATION: a line number is a fact about a file that any edit invalidates, and
   nothing tells you when it has.

   So the register names the sites BY THE TEXT THAT IS IN THEM, and asserts that
   each still occurs exactly once. Grep the marker above to find this list; grep
   any entry to find its site. No arithmetic, and if a fragment stops resolving
   the gate says so instead of pointing at the wrong line — which is what makes
   this a register rather than a second comment.

   WHEN 09b DECIDES THE CLASS, THIS TURNS RED, and that is the intended
   behaviour: removing a site is exactly the event the register must not sleep
   through. The remedy is one line — delete the entry — and the failure message
   says so.

   ── 09b-2 DECIDED IT, ALL SIX, SO THE REGISTER IS EMPTY ──────────────────
   The six entries are gone because the six sites are gone; the reasoning is
   filed in `src/data/servicePages.ts` above `fikstur-aparat-tasarimi` (grep
   the marker). The register is EMPTIED RATHER THAN DELETED for two reasons,
   and neither is sentiment:

     · the mechanism is generic and the next deferred class will want it. What
       expired is this class, not the notation.
     · `checkDeferredClassRegister` stays in `NON_RULE_CHECKS`, so the registry
       control keeps asserting the id is present and the two fixture controls
       keep proving the function reports a dead entry and stays quiet on a live
       one. An empty LIVE register does not make the INSTRUMENT untested —
       which is the distinction 09a-C5/R4-5 drew when it found two checks
       asleep behind 262 green controls.

   AND THE GUARANTEE DID NOT EVAPORATE, IT MOVED. A register asserts "these are
   still here"; that question is answered forever once the sites are deleted.
   Its successor is the `named-cad-package` RULE, whose positive controls are
   these six strings restored verbatim. "Still there" became "may not come
   back". If that rule is ever weakened, this comment is the trail back. */
const DEFERRED_09B_SOFTWARE_INVENTORY = {
  marker: "09b-SOFTWARE-INVENTORY",
  file: "src/data/servicePages.ts",
  sites: [],
};

/** Each registered site must still be findable, exactly once, where it is filed. */
function checkDeferredClassRegister(register = DEFERRED_09B_SOFTWARE_INVENTORY) {
  const abs = resolve(REPO_ROOT, register.file);
  if (!existsSync(abs)) {
    return [{ file: register.file, message: `${register.marker}: the file this class is filed under is gone` }];
  }
  const source = readFileSync(abs, "utf8");
  /** @type {{ file: string, message: string }[]} */
  const problems = [];
  for (const site of register.sites) {
    const found = source.split(site).length - 1;
    if (found === 1) continue;
    problems.push({
      file: register.file,
      message:
        `${register.marker}: ${JSON.stringify(site)} occurs ${found} times, expected exactly 1. ` +
        "If 09b has decided this class, delete the entry from DEFERRED_09B_SOFTWARE_INVENTORY in this " +
        "file — the register is the enumeration of what is still deferred, and an entry that no longer " +
        "resolves is a list that has started to rot. If the copy merely moved, update the fragment.",
    });
  }
  return problems;
}

/* ── the instruments that are not rules, and the controls that watch them ──
   09a-C5 / R4-5. `runControls()` above proves that RULES still fire on the
   strings they were written for. It knew nothing about the two checks that are
   not rules — `checkDerivedCadCopy` and `checkQualityResources` — and QA
   demonstrated the consequence four ways: neuter either function, or drop its
   result from the verdict, and all 262 controls stayed green while the gate
   reported PASS. One instrument asleep, one level up from where the controls
   were looking.

   C4 recorded that and gave a reason for not closing it: that a control would
   have to mutate a source file while the gate is running. THAT REASON WAS
   FALSE, and it was the only thing holding the finding open. A check is two
   things bolted together — a READ and a JUDGEMENT — and each half is testable
   on its own terms:

     the judgement   `compareDerivedCopy(namespace, expected)` is pure. Hand it
                     `{ CAD_UPLOAD_FORMATS: "… ve DWG" }` and it must complain;
                     hand it the expected strings and it must not. No file is
                     read, let alone written.
     the read        `checkDerivedCadCopy(file)` and
                     `checkQualityResources(ledger, publicDir)` take the paths
                     they read. A control points them at a `mkdtempSync(tmpdir())`
                     fixture — the same pattern `--also-scan=` uses — so the
                     whole function, not merely its pure half, is exercised.

   THE VERDICT IS COVERED TOO, and that is the half a per-function control does
   not reach. `verdict()` is computed by iterating `NON_RULE_CHECKS`, so
   "dropping a check from the conjunction" now means editing a list that has its
   own control. Four sabotages, four red gates:

     neuter checkDerivedCadCopy      → its fixture controls stop reporting
     neuter checkQualityResources    → its fixture controls stop reporting
     remove either from the registry → the registry control names the missing id
     make verdict() ignore either    → the verdict control stays clean when it
                                       has been handed a problem

   Every one of these runs on EVERY invocation, for the same reason the rule
   controls do: a proof you have to remember to run is a proof that stops being
   true.                                                                       */

/**
 * Every check that is not a rule. The verdict is computed from this list, so a
 * check that is not here does not count — which is exactly why the list itself
 * is controlled.
 */
const NON_RULE_CHECKS = [
  { id: "derived-cad-copy", run: () => checkDerivedCadCopy() },
  { id: "quality-resources", run: () => checkQualityResources() },
  { id: "deferred-class-register", run: () => checkDeferredClassRegister() },
];

/**
 * The one place the run decides whether it is clean.
 *
 * Pure, and it takes the problem map rather than reaching for module state, so
 * a control can hand it a fabricated one. It reports WHICH instruments are
 * unhappy, including any registered check that never produced a result at all.
 */
function verdict({ violations, controlFailures, checkProblems }) {
  const failing = [];
  if (violations.length > 0) failing.push("violations");
  if (controlFailures.length > 0) failing.push("controls");
  for (const check of NON_RULE_CHECKS) {
    const problems = checkProblems.get(check.id);
    if (problems === undefined) {
      failing.push(`${check.id} (registered but never ran)`);
      continue;
    }
    if (problems.length > 0) failing.push(check.id);
  }
  return { clean: failing.length === 0, failing };
}

/** A fixture ledger, written outside the repository. Returns its path. */
function writeFixtureLedger(source) {
  const file = join(makeTempDir("mas-claims-gate-control-"), "claims.ts");
  writeFileSync(file, source, "utf8");
  return file;
}

/**
 * The ledger fixtures spell the two exported strings by hand, because a fixture
 * that DERIVED them could not disagree with the derivation being tested.
 */
const CORRECT_FIXTURE_LEDGER =
  `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS)};\n` +
  `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`;
const DRIFTED_FIXTURE_LEDGER =
  `export const CAD_UPLOAD_FORMATS = ${JSON.stringify(`${EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS} ve DWG`)};\n` +
  `export const CAD_UPLOAD_EXTENSIONS = ${JSON.stringify(EXPECTED_CAD_COPY.CAD_UPLOAD_EXTENSIONS)};\n`;

/** Each returns `null` when the control holds, or WHY it does not. */
const CHECK_CONTROLS = [
  {
    id: "derived-cad-copy: the comparison catches an appended format",
    run() {
      const drifted = { ...EXPECTED_CAD_COPY, CAD_UPLOAD_FORMATS: `${EXPECTED_CAD_COPY.CAD_UPLOAD_FORMATS} ve DWG` };
      return compareDerivedCopy(drifted).length > 0
        ? null
        : "compareDerivedCopy() blessed a namespace publishing a list ending in DWG";
    },
  },
  {
    id: "derived-cad-copy: the comparison is silent on the derived strings",
    run() {
      const hits = compareDerivedCopy({ ...EXPECTED_CAD_COPY });
      return hits.length === 0 ? null : `compareDerivedCopy() complained about the expected strings: ${hits[0].message}`;
    },
  },
  {
    id: "derived-cad-copy: the check reads the ledger it is given",
    async run() {
      const problems = await checkDerivedCadCopy(writeFixtureLedger(DRIFTED_FIXTURE_LEDGER));
      return problems.some((p) => p.kind === "drift")
        ? null
        : "checkDerivedCadCopy() reported no drift over a fixture ledger publishing '… ve DWG'";
    },
  },
  {
    id: "derived-cad-copy: and stays silent when that ledger is correct",
    async run() {
      const problems = await checkDerivedCadCopy(writeFixtureLedger(CORRECT_FIXTURE_LEDGER));
      return problems.length === 0
        ? null
        : `checkDerivedCadCopy() complained about a correct fixture ledger: ${problems[0].message}`;
    },
  },
  {
    id: "derived-cad-copy: a runtime import is a LOAD failure, not drift",
    async run() {
      /* The property the ledger states about itself, held to it. The emitted
         module is imported from a temp directory, so a value import cannot
         resolve — and the report must say "could not load", never "your copy
         has drifted", because the copy in this fixture is exactly right. */
      const fixture = writeFixtureLedger(
        `import { CAD_ACCEPTED_EXTENSIONS } from "@/utils/cadFiles";\nvoid CAD_ACCEPTED_EXTENSIONS;\n${CORRECT_FIXTURE_LEDGER}`,
      );
      const problems = await checkDerivedCadCopy(fixture);
      if (problems.length === 0) return "a ledger with a runtime import loaded anyway; the no-module-edge property is gone";
      if (!problems.every((p) => p.kind === "load")) {
        return `a ledger that could not be loaded was reported as ${problems.map((p) => p.kind).join("/")}`;
      }
      return null;
    },
  },
  {
    id: "derived-cad-copy: a .js shadow beside the ledger is a LOAD failure",
    async run() {
      /* 09a-C5 / R4-6, held on every invocation rather than asserted in a
         comment. `claims.js` beside `claims.ts` is what Vite resolves for
         `from "@/content/claims"`, so it is what the app would BUNDLE while
         both instruments read the `.ts`. The fixture ledger here is CORRECT, so
         a drift report would be the wrong answer twice over. */
      const dir = makeTempDir("mas-claims-gate-control-");
      writeFileSync(join(dir, "claims.ts"), CORRECT_FIXTURE_LEDGER, "utf8");
      writeFileSync(join(dir, "claims.js"), 'export const CAD_UPLOAD_FORMATS = "STEP ve DWG";\n', "utf8");
      const problems = await checkDerivedCadCopy(join(dir, "claims.ts"));
      if (problems.length === 0) return "a .js shadow beside the ledger was not noticed at all";
      if (!problems.every((p) => p.kind === "load")) {
        return `a shadowed ledger was reported as ${problems.map((p) => p.kind).join("/")}`;
      }
      return problems[0].message.includes("claims.js") ? null : "it reported a shadow but did not name the file";
    },
  },
  {
    id: "walk: the file scan covers the JavaScript family, not only .ts",
    run() {
      /* The other half of R4-6. Detecting the shadow beside the LEDGER does not
         help with a `.js` anywhere else in the tree; `EXT` has to walk it. */
      const mustScan = [
        "src/content/claims.js",
        "src/content/claims.mjs",
        "src/data/servicePages.cjs",
        "src/pages/SSS.jsx",
        "src/content/claims.mts",
        "src/content/claims.ts",
        "index.html",
      ];
      const mustSkip = ["src/index.css", "public/logo.png", "src/styles/tokens.scss"];
      const missed = mustScan.filter((f) => !EXT.test(f));
      if (missed.length > 0) return `EXT would not walk ${missed.join(", ")}`;
      const overreach = mustSkip.filter((f) => EXT.test(f));
      return overreach.length === 0 ? null : `EXT would walk ${overreach.join(", ")}, which carries no readable string`;
    },
  },
  {
    id: "derived-cad-copy: an enum in the ledger is compared, not called drift",
    async run() {
      /* 09a-C5 / R4-7. R4-7 predicted `enum`/`namespace` would be reported as
         CAD copy drift, because Node's type stripping refuses both. Under a
         full transpile they simply EMIT, so the honest result is no problem at
         all — and this control is what keeps that claim true rather than
         remembered. The strings in the fixture are correct; a complaint of any
         kind here is a false report about correct copy. */
      const fixture = writeFixtureLedger(
        `export enum LedgerKind { Claim, Withheld }\nexport namespace Ledger { export const v = 1; }\n${CORRECT_FIXTURE_LEDGER}`,
      );
      const problems = await checkDerivedCadCopy(fixture);
      if (problems.length > 0) return `an enum/namespace ledger with CORRECT copy was reported as ${problems[0].kind}: ${problems[0].message}`;
      /* …and the same file with drifted copy must still be caught, or the
         control above only proves the check went quiet. */
      const drifted = writeFixtureLedger(
        `export enum LedgerKind { Claim, Withheld }\n${DRIFTED_FIXTURE_LEDGER}`,
      );
      const hits = await checkDerivedCadCopy(drifted);
      return hits.some((p) => p.kind === "drift") ? null : "an enum ledger publishing DWG was not reported as drift";
    },
  },
  {
    id: "derived-cad-copy: an unparseable ledger is a LOAD failure",
    async run() {
      /* The failure R4-7 is really about, whichever syntax causes it: the gate
         must not describe a file it could not read as a file that disagrees.

         IT ALSO ASSERTS THE MESSAGE, and that is not fussiness. Deleting the
         `reportDiagnostics` branch in `importTypeScriptModule` leaves this
         fixture failing anyway — the emitted garbage throws a bare SyntaxError
         when imported — so a kind-only assertion passes over a gate that has
         stopped reading the compiler at all, and the reader loses "Expression
         expected." in favour of something opaque. Measured: that mutation is
         invisible to every other control in this file. */
      const problems = await checkDerivedCadCopy(writeFixtureLedger("export const CAD_UPLOAD_FORMATS = ;\n"));
      if (problems.length === 0) return "an unparseable ledger produced no problem at all";
      if (!problems.every((p) => p.kind === "load")) {
        return `an unparseable ledger was reported as ${problems.map((p) => p.kind).join("/")}`;
      }
      return problems[0].message.includes("does not compile in isolation")
        ? null
        : "the transpile diagnostic was not read; the reader gets an opaque import error instead of the syntax error";
    },
  },
  {
    id: "quality-resources: the check catches an invented byte size",
    run() {
      const dir = makeTempDir("mas-claims-gate-control-");
      const ledger = join(dir, "claims.ts");
      const docs = join(dir, "belgeler");
      mkdirSync(docs, { recursive: true });
      writeFileSync(join(docs, "fixture.pdf"), "x".repeat(4096), "utf8");
      writeFileSync(ledger, 'href: "/belgeler/fixture.pdf", size: "PDF · 999 KB"\n', "utf8");
      const problems = checkQualityResources(ledger, dir);
      return problems.length > 0
        ? null
        : "checkQualityResources() blessed a row declaring 999 KB for a 4 KB file";
    },
  },
  {
    id: "quality-resources: and is silent when the size is measured",
    run() {
      const dir = makeTempDir("mas-claims-gate-control-");
      const ledger = join(dir, "claims.ts");
      const docs = join(dir, "belgeler");
      mkdirSync(docs, { recursive: true });
      writeFileSync(join(docs, "fixture.pdf"), "x".repeat(4096), "utf8");
      writeFileSync(ledger, 'href: "/belgeler/fixture.pdf", size: "PDF · 4 KB"\n', "utf8");
      const problems = checkQualityResources(ledger, dir);
      return problems.length === 0 ? null : `checkQualityResources() complained about a true size: ${problems[0].message}`;
    },
  },
  {
    id: "deferred-class-register: a site that stopped resolving is reported",
    run() {
      const dir = makeTempDir("mas-claims-gate-control-");
      const file = join(dir, "sites.ts");
      writeFileSync(file, 'export const A = "kept";\n', "utf8");
      const problems = checkDeferredClassRegister({ marker: "CONTROL", file, sites: ['"kept"', '"gone"'] });
      if (problems.length !== 1) {
        return `checkDeferredClassRegister() reported ${problems.length} problems over a register with exactly one dead entry`;
      }
      return problems[0].message.includes("gone") ? null : "it reported a problem but not the entry that had gone";
    },
  },
  {
    id: "deferred-class-register: and is silent while every site resolves",
    run() {
      const dir = makeTempDir("mas-claims-gate-control-");
      const file = join(dir, "sites.ts");
      writeFileSync(file, 'export const A = "kept";\nexport const B = "also";\n', "utf8");
      const problems = checkDeferredClassRegister({ marker: "CONTROL", file, sites: ['"kept"', '"also"'] });
      return problems.length === 0 ? null : `it complained about a register whose sites all resolve: ${problems[0].message}`;
    },
  },
  {
    id: "registry: every non-rule check is registered and controlled",
    run() {
      /* Written out, not derived, so DELETING a check fails here and ADDING one
         also fails here — which is the point: a new instrument does not get to
         join the verdict until somebody has written controls for it. */
      const expected = ["derived-cad-copy", "quality-resources", "deferred-class-register"];
      const actual = NON_RULE_CHECKS.map((c) => c.id);
      if (actual.length !== expected.length || expected.some((id, i) => actual[i] !== id)) {
        return `NON_RULE_CHECKS is [${actual.join(", ")}] but the controls below cover [${expected.join(", ")}]`;
      }
      return null;
    },
  },
  {
    id: "verdict: a problem from any registered check fails the run",
    run() {
      const empty = () => new Map(NON_RULE_CHECKS.map((c) => [c.id, []]));
      for (const check of NON_RULE_CHECKS) {
        const checkProblems = empty();
        checkProblems.set(check.id, [{ file: "control", message: "a fabricated problem" }]);
        const { clean } = verdict({ violations: [], controlFailures: [], checkProblems });
        if (clean) return `verdict() reported clean while ${check.id} was holding a problem`;
      }
      const missing = empty();
      missing.delete(NON_RULE_CHECKS[0].id);
      if (verdict({ violations: [], controlFailures: [], checkProblems: missing }).clean) {
        return `verdict() reported clean while ${NON_RULE_CHECKS[0].id} had produced no result at all`;
      }
      return null;
    },
  },
  {
    id: "verdict: and reports clean when nothing is wrong",
    run() {
      /* The probe has to be able to go green, or the four above prove nothing. */
      const checkProblems = new Map(NON_RULE_CHECKS.map((c) => [c.id, []]));
      return verdict({ violations: [], controlFailures: [], checkProblems }).clean
        ? null
        : "verdict() refused to report clean over an empty run";
    },
  },
];

async function runCheckControls() {
  /** @type {{ scope: string, rule: string, kind: string, text: string }[]} */
  const failures = [];
  for (const control of CHECK_CONTROLS) {
    let why;
    try {
      why = await control.run();
    } catch (error) {
      why = `the control itself threw: ${error.message}`;
    }
    if (why) failures.push({ scope: "check", rule: control.id, kind: "INSTRUMENT CONTROL FAILED", text: why });
  }
  return failures;
}

/* ── run ───────────────────────────────────────────────────────────────── */

/**
 * Extra files to scan, named explicitly on the command line.
 *
 * 09a-C4 / R3-5. `e2e/landing/claims-gate.spec.ts` proves the gate can still
 * FAIL by feeding it a forbidden claim. It used to do that by writing
 * `src/content/__claims-gate-probe__.ts` into PRODUCTION SOURCE and deleting
 * it in `finally` — and two agents have been killed mid-run in this phase
 * alone, which leaves the probe behind in `src/**`.
 *
 * So the probe moves out of the repository and the gate is told where it is.
 * This can only ADD a file to the scan; there is no flag here that removes a
 * root, skips a rule or silences a hit, so it cannot be used to weaken the
 * gate — which is the only property a test-facing entry point has to have.
 */
const EXTRA_SCAN_FILES = process.argv
  .filter((a) => a.startsWith("--also-scan="))
  .map((a) => a.slice("--also-scan=".length))
  .filter(Boolean);

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

const controlFailures = [...runControls(), ...(await runCheckControls())];

for (const root of ROOTS) walk(root);
for (const extra of EXTRA_SCAN_FILES) scanFile(extra, resolve(REPO_ROOT, extra));

/* Every non-rule check runs through the registry, and the verdict below is
   computed from what the registry produced. Nothing here reaches for a check by
   name in order to decide the exit code — the two lookups that follow are for
   REPORTING only. */
const checkProblems = new Map();
for (const check of NON_RULE_CHECKS) checkProblems.set(check.id, await check.run());
const resourceProblems = checkProblems.get("quality-resources") ?? [];
const derivedProblems = checkProblems.get("derived-cad-copy") ?? [];

const byRule = new Map();
for (const v of violations) {
  if (!byRule.has(v.rule.id)) byRule.set(v.rule.id, []);
  byRule.get(v.rule.id).push(v);
}

console.log("# CLAIMS GATE");
console.log(`# roots:    ${ROOTS.join(", ")}`);
console.log(`# excluded: admin/, musteri/, AdminDashboard, AdminLogin, MusteriPaneli`);
console.log(`# scanned:  ${filesScanned} files, ${linesScanned} non-comment lines`);
const controlCount =
  RULES.reduce((n, r) => n + (r.controls?.fires?.length ?? 0) + (r.controls?.silent?.length ?? 0), 0) +
  RULES.length * AUTHORISED_SLA.length +
  CHECK_CONTROLS.length;
console.log(
  `# controls: ${controlCount} (${controlFailures.length} failed), of which ${CHECK_CONTROLS.length} watch the ` +
    `${NON_RULE_CHECKS.length} checks that are not rules`,
);
console.log("");

/* `process.exitCode` rather than `process.exit()`, from the PASS path down.
   Since 09a-C4 this script `await`s a dynamic import of the ledger, and calling
   `process.exit()` while the loader's handle is still closing tripped a libuv
   assertion on Windows once in the first run after that change (0/25 on
   re-test, so a race rather than a determinism). Setting the code and letting
   the event loop drain removes the race and also guarantees stdout is flushed
   before the process goes away — which matters because the full report IS the
   failure message the Playwright spec prints. */
const { clean, failing } = verdict({ violations, controlFailures, checkProblems });

if (clean) {
  console.log(`PASS — 0 unverified claims across ${RULES.length} rules, ${controlCount} controls green.`);
}

const ruleControlFailures = controlFailures.filter((f) => f.scope !== "check");
const checkControlFailures = controlFailures.filter((f) => f.scope === "check");

if (!clean && ruleControlFailures.length > 0) {
  console.log("## RULE CONTROL FAILURES");
  console.log("A rule that no longer fires on the claim it was written for reports PASS over live");
  console.log("fabrication, which is worse than having no rule at all. Fix the RULE, not the control.");
  for (const f of ruleControlFailures) console.log(`  ${f.rule}: ${f.kind}\n    ${f.text}`);
  console.log("");
}

if (!clean && checkControlFailures.length > 0) {
  console.log("## INSTRUMENT CONTROL FAILURES");
  console.log("One of the checks that is NOT a rule has stopped detecting what it exists to detect, or has");
  console.log("stopped counting towards the verdict. Nothing below this line can be trusted until it is fixed:");
  console.log("a gate whose instrument is asleep reports PASS over exactly the class it was built for.");
  for (const f of checkControlFailures) console.log(`  ${f.rule}\n    ${f.text}`);
  console.log("");
}

if (!clean) console.log("## VIOLATIONS BY RULE");
for (const rule of RULES) {
  if (clean) break;
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

/* 09a-C5 / R4-7. Two different failures, two headings, two remedies. "I could
   not read the ledger" printed under `derived-copy-drift` sends a reader to
   hunt for a copy defect in a file that was never wrong — which is precisely
   what the Node-20 load failure did. */
const derivedLoadFailures = derivedProblems.filter((p) => p.kind === "load");
const derivedDrift = derivedProblems.filter((p) => p.kind !== "load");

if (derivedLoadFailures.length > 0) {
  console.log("");
  console.log(`### ledger-not-loadable — ${derivedLoadFailures.length}`);
  console.log(
    "authority: USER_INPUTS.md §J ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION",
  );
  console.log("remedy:    THIS IS NOT A COPY PROBLEM. The published CAD strings were compared to nothing, so");
  console.log("           this says nothing at all about whether they are right. Make src/content/claims.ts");
  console.log("           loadable again: no runtime import, and no syntax that an isolated transpile refuses.");
  for (const p of derivedLoadFailures) console.log(`  ${p.file}: ${p.message}`);
}

if (derivedDrift.length > 0) {
  console.log("");
  console.log(`### derived-copy-drift — ${derivedDrift.length}`);
  console.log(
    "authority: USER_INPUTS.md §J ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION",
  );
  console.log(
    "remedy:    Fix the DERIVATION in src/content/claims.ts, or the tuple it reads. Never widen src/utils/cadFiles.ts to match the copy.",
  );
  for (const p of derivedDrift) console.log(`  ${p.file}: ${p.message}`);
}

/* Any registered check that has no hand-written section above still prints.
   The registry is allowed to grow, and a verdict nobody can read is a verdict
   nobody can act on — `deferred-class-register` turned the run red and said
   nothing at all until this existed. */
const CHECKS_WITH_THEIR_OWN_SECTION = new Set(["derived-cad-copy", "quality-resources"]);
for (const check of NON_RULE_CHECKS) {
  if (CHECKS_WITH_THEIR_OWN_SECTION.has(check.id)) continue;
  const problems = checkProblems.get(check.id) ?? [];
  if (problems.length === 0) continue;
  console.log("");
  console.log(`### ${check.id} — ${problems.length}`);
  for (const p of problems) console.log(`  ${p.file}: ${p.message}`);
}

if (!clean) {
  console.log("");
  /* `failing` comes from `verdict()` itself, so the summary line names every
     instrument that went red — including one added next year whose author
     forgets to touch the counts below. */
  console.log(`FAILING: ${failing.join(", ")}`);
  console.log(
    `FAIL — ${violations.length} claim violation(s), ${resourceProblems.length} resource problem(s), ` +
      `${derivedDrift.length} derived-copy problem(s), ${derivedLoadFailures.length} ledger load failure(s), ` +
      `${controlFailures.length} control failure(s).`,
  );
  process.exitCode = 1;
}

cleanUpTempDirs();
