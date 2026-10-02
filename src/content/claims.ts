/* ══════════════════════════════════════════════════════════════════════════
   THE PUBLISHABLE-CLAIM LEDGER — one source of truth for public fact

   WHY THIS FILE EXISTS
   --------------------
   Before Phase 06 a claim like "AS9100D" or "±0.005 mm" was a string literal
   copied into fourteen different files. There was no place to ask "is this
   true?" and no place at all to ask the second, harder question:
   "is this PUBLISHABLE?".

   `USER_INPUTS.md` §0 sets `DEFAULT_FACT_VISIBILITY:
   INTERNAL_ONLY_UNLESS_PUBLIC_OK` and `NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES`.
   Truth and disclosure are SEPARATE decisions. A fact can be verified and
   still be forbidden on the public site — team size and facility size are
   exactly that case.

   HOW PERMISSION IS ENFORCED (not merely documented)
   --------------------------------------------------
   `publish()` accepts only a `PublishableClaim`. `withhold()` returns `null`
   and its argument type cannot satisfy `publish()`. So publishing a withheld
   fact is a TYPE ERROR, caught by `npm run typecheck`, not a review nicety:

       publish(TEAM_SIZE_LEDGER)   // ts(2345): visibility is not assignable

   Every entry carries the `USER_INPUTS.md` field that authorises it. If a
   claim is not in this file, it has no authorisation and must not be rendered.

   The complementary machine gate is `scripts/claims-gate.mjs`, which fails the
   build if a forbidden claim is reintroduced anywhere in the public source.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The published CAD format list ─────────────────────────────────────────
   09a-C3. `USER_INPUTS.md` §J: `ACCEPTED_CAD_FORMATS:
   DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`. The working implementation is
   `validateCadFile()` in `src/utils/cadUpload.ts`, and five published
   sentences had drifted from it — two of them offering nine formats the
   uploader refuses outright.

   WHY THIS IS A TYPE-PINNED LITERAL AND NOT A RUNTIME IMPORT.
   The obvious fix is `import { CAD_ACCEPTED_EXTENSIONS } from
   "@/utils/cadUpload"`. It was implemented that way first and it does not
   work, for a reason worth writing down rather than rediscovering:

     `cadUpload.ts` imports `integrations/supabase/env.ts`, which evaluates
     `import.meta.env.VITE_SUPABASE_URL` AT MODULE SCOPE. Two Playwright
     specs — `e2e/landing/navigation-reachability.spec.ts` and
     `e2e/shared-shell-accessibility.spec.ts` — import `servicePages.ts`
     directly into the NODE test runtime, where `import.meta.env` is
     undefined. A runtime edge from the data layer to the validator therefore
     takes down spec COLLECTION for the whole `critical-1280` project:
     `TypeError: Cannot read properties of undefined (reading
     'VITE_SUPABASE_URL')`. Measured, not predicted.

   There is no runtime path from `servicePages.ts` to that constant which does
   not load `env.ts`. So the list is restated ONCE, here, and PINNED to the
   validator by the type system: `import type` is erased at compile time and
   adds no module edge at all, while `CadFormatsArePinnedToValidator` below is
   a type error the moment the two tuples differ in content, order or length.

   That is stricter than a runtime derivation, not looser. A runtime
   derivation changes the copy silently when the validator changes; this fails
   `npx tsc -b`, which the release gate already requires. And
   `scripts/claims-gate.mjs` re-checks the same equality by reading both files
   as text, so two independent instruments have to agree — the H6 principle
   this repository already applies to `WITHHELD_SPEC_CLASSES`.

   Every publication site imports the two strings below; none of them spells a
   format name. `claims.ts` keeps its no-runtime-imports property.

   09a-C4 — AND THE TUPLE IS NOT THE THING THAT GETS PUBLISHED. QA attacked
   the pin above twelve ways. It held on all twelve mutations OF THE TUPLE and
   was silent on the two that leave the tuple alone and edit the DERIVATION —
   appending "DWG" to the mapped array, or slicing it to five. `tsc` exits 0,
   because both are well-typed; all five publication sites then read
   "… IGS, 3MF ve DWG" against a validator that refuses DWG.

   No type can close that. `Array.prototype.map` is declared `map<U>(…): U[]`,
   so the element literals are gone before any template-literal type could
   join them back into `"STEP, … ve 3MF"` and compare it. The binding has to
   be made on the VALUES, and the third instrument makes it:
   `scripts/claims-gate.mjs` imports this file — which it can, precisely
   because the only import here is an `import type` that Node's type stripping
   erases — reads `CAD_UPLOAD_FORMATS` and `CAD_UPLOAD_EXTENSIONS` as values,
   and compares them to the canonical rendering of `CAD_ACCEPTED_EXTENSIONS`.

   So DO NOT hand-edit either string below or the expression that builds it.
   Add a format and the gate names the drift; the tuple is still where the list
   is decided, and `cadUpload.ts` is still where the list is TRUE.
   ------------------------------------------------------------------------ */
// This module is also loaded by the Node test runtime, which does not see the
// app tsconfig's `types`; the reference keeps `import.meta.env` typed there.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../vite-env.d.ts" />
import type { CAD_ACCEPTED_EXTENSIONS } from "@/utils/cadFiles";

/** The published copy of `CAD_ACCEPTED_EXTENSIONS`. Pinned below. */
const PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

/**
 * A compile-time error the moment the ledger and the validator disagree.
 *
 * Exported so it cannot be pruned as unused. If this line goes red, the
 * VALIDATOR is right and this list is wrong — update the tuple above, never
 * `cadUpload.ts`. Widening the validator to match the copy would turn a false
 * sentence into a broken upload.
 */
export type CadFormatsArePinnedToValidator = Assert<
  Exact<typeof PUBLISHED_CAD_EXTENSIONS, typeof CAD_ACCEPTED_EXTENSIONS>
>;

const joinTurkishList = (parts: readonly string[]): string =>
  parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} ve ${parts[parts.length - 1]}`;

/** Prose form: `"STEP, STP, STL, OBJ, IGES, IGS ve 3MF"`. */
export const CAD_UPLOAD_FORMATS = joinTurkishList(PUBLISHED_CAD_EXTENSIONS.map((ext) => ext.toUpperCase()));

/** Extension form: `".step, .stp, .stl, .obj, .iges, .igs, .3mf"`. */
export const CAD_UPLOAD_EXTENSIONS = PUBLISHED_CAD_EXTENSIONS.map((ext) => `.${ext}`).join(", ");

/** Publication verdicts from `USER_INPUTS.md` §0 "Publication decision rule". */
export type PublishableVisibility = "PUBLIC_CORE" | "PUBLIC_SUPPORTING";
export type WithheldVisibility =
  | "PRIVATE_DO_NOT_DISCLOSE"
  | "REMOVE_IF_UNVERIFIED"
  | "ANONYMIZE";

type PublishableClaim<T> = {
  readonly value: T;
  readonly visibility: PublishableVisibility;
  /** The `USER_INPUTS.md` field that authorises publication. */
  readonly source: string;
};

type WithheldClaim = {
  readonly visibility: WithheldVisibility;
  readonly source: string;
  /** Why the site says nothing, so a later agent does not "helpfully" restore it. */
  readonly reason: string;
};

/**
 * The only way a fact reaches the DOM.
 *
 * Typed so that a `WithheldClaim` cannot be passed: `visibility` has no
 * overlapping member, and `value` is missing.
 */
function publish<T>(claim: PublishableClaim<T>): T {
  return claim.value;
}

/** Records a true-but-unpublishable fact as an explicit, typed absence. */
function withhold(claim: WithheldClaim): null {
  void claim;
  return null;
}

/* ── §C — certifications ────────────────────────────────────────────────── */

export type Certification = { code: string; name: string };

/**
 * The complete set of certifications MAS TECHNIC may name publicly.
 *
 * AS9100D and IATF 16949 were removed site-wide in Phase 06: `USER_INPUTS.md`
 * §C records both as `NONE`. ISO 13485, NADCAP and NIST 800-171 appear nowhere
 * in `USER_INPUTS.md` at all and were pure invention, as were the certifying
 * bodies (TÜV SÜD / SGS / Bureau Veritas) once printed next to them.
 */
export const CERTIFICATIONS: readonly Certification[] = publish({
  value: [
    { code: "ISO 9001:2015", name: "KALİTE YÖNETİM SİSTEMİ" },
    { code: "ISO 14001:2015", name: "ÇEVRE YÖNETİM SİSTEMİ" },
    { code: "OHSAS 18001", name: "İŞ SAĞLIĞI VE GÜVENLİĞİ YÖNETİM SİSTEMİ" },
  ] as const,
  visibility: "PUBLIC_CORE",
  source:
    "USER_INPUTS.md §C — ISO_9001_VALUE: VERIFIED / PUBLIC_OK; " +
    "ISO_14001_VALUE: VERIFIED / PUBLIC_OK; OTHER_CERTIFICATIONS: OHSAS 18001 (PUBLIC_OK)",
});

/** `ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001` — for running prose. */
export const CERTIFICATION_SENTENCE_LIST = CERTIFICATIONS.map((c) => c.code)
  .slice(0, -1)
  .join(", ") + " ve " + CERTIFICATIONS[CERTIFICATIONS.length - 1].code;

/** No issuing body was ever supplied. Naming one would be a forged attestation. */
export const CERTIFYING_BODIES = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §C — no issuer field is provided for any certificate",
  reason: "Naming a registrar invents an audit that did not happen.",
});

/* ── §D — capability figures ────────────────────────────────────────────── */

/**
 * The tightest tolerance the site may print. `±0.005 mm` appeared in ~50 places
 * and claimed twice the verified capability.
 */
export const MINIMUM_TOLERANCE = publish({
  value: "±0.01 mm",
  visibility: "PUBLIC_CORE",
  source:
    "USER_INPUTS.md §D — MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm, " +
    "MINIMUM_TOLERANCE_VISIBILITY: PUBLIC_IF_VERIFIED_AND_STRATEGIC",
});

/** Compact form for tables and inline copy. */
export const MINIMUM_TOLERANCE_COMPACT = publish({
  value: "±0.01mm",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §D — MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm",
});

/** Quote turnaround. The site promised 48 h; the verified SLA is wider. */
export const QUOTE_RESPONSE_TIME = publish({
  value: "1-3 iş günü",
  visibility: "PUBLIC_CORE",
  source:
    "USER_INPUTS.md §D QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days; " +
    "§J QUOTE_SLA: 1-3 Days",
});

/** Uppercase display form for the proof strip. */
export const QUOTE_RESPONSE_TIME_DISPLAY = publish({
  value: "1-3 İŞ GÜNÜ",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §D QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days",
});

/* ── PRODUCTION LEAD TIME — the fact directly above is not this one ────────
   PHASE 09a CORRECTION #2.

   `QUOTE_RESPONSE_TIME` is how long MAS takes to answer an enquiry. It is
   authorised twice over (§D QUOTE_RESPONSE_TIME_INTERNAL, §J QUOTE_SLA) and it
   is the only duration on this site with a source behind it.

   How long MAKING THE PART takes is a different fact, and no field anywhere in
   `USER_INPUTS.md` supplies it. §D lists tolerance, quote response, material
   count, CMM coverage, on-time delivery and the four scale figures — there is
   no lead-time, turnaround, termin or delivery-window entry, and §J's
   `QUOTE_SLA` is explicitly the quote's clock, not the job's.

   The two were being conflated across the tree: `servicePages.ts` published
   `3-5 iş günü`, `7-15 iş günü`, `24 saat`, `24-72 saat`, `2-3 hafta` and
   `4-8 hafta` as delivery commitments on eleven pages, and `chatFaqData.ts`
   stated two of them to a visitor as company policy. None had an authority.
   `ON_TIME_DELIVERY` below is the closest §D gets, and it is WITHHELD — a site
   that may not print its delivery-performance rate cannot print the delivery
   windows that rate would be measured against.

   `scripts/claims-gate.mjs` `unverified-production-lead-time` is the machine
   half, and it is written to fire on a delivery duration while staying silent
   on `QUOTE_RESPONSE_TIME` — both directions proved by its own controls.     */
export const PRODUCTION_LEAD_TIME = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source:
    "USER_INPUTS.md §D — no lead-time / turnaround / termin field exists; " +
    "§J QUOTE_SLA: 1-3 Days is the quote's clock, not the part's",
  reason:
    "A production or delivery window is a commitment, and §D authorises " +
    "capability figures rather than commitments. The mechanism is publishable; " +
    "the number is not. Use LEAD_TIME_STATEMENT or LEAD_TIME_SHORT.",
});

/**
 * What the site says in place of a delivery number.
 *
 * Not a new claim: this is the sentence `caseStudies.ts` and
 * `technicalLandingData.ts` already published, promoted to the ledger so the
 * eleven service pages that used to print a number say the same thing as the
 * three surfaces that never did.
 */
export const LEAD_TIME_STATEMENT = publish({
  value:
    "Termin; malzeme tedariki, operasyon sayısı ve kapasite planı incelendikten sonra teklifle birlikte verilir.",
  visibility: "PUBLIC_SUPPORTING",
  source:
    "USER_INPUTS.md §J QUOTE_SLA: 1-3 Days — the quote is where the termin is " +
    "stated; §D supplies no field that would let the site state it earlier",
});

/** Cell-sized form, for a table column or a spec row. */
export const LEAD_TIME_SHORT = publish({
  value: "Teklifle birlikte",
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md §J QUOTE_SLA: 1-3 Days — same fact, cell-sized",
});

/**
 * CMM coverage. `%100 CMM RAPORU` was not merely an inflated number — it was
 * qualitatively the wrong claim. Coordinate measurement is third-party
 * accredited and provided on demand, not applied to every part in-house.
 */
export const CMM_COVERAGE = publish({
  value: "Akredite 3. taraf CMM ölçümü, talebe bağlı",
  visibility: "PUBLIC_SUPPORTING",
  source:
    "USER_INPUTS.md §D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND, " +
    "CMM_COVERAGE_VISIBILITY: PUBLIC_IF_VERIFIED_AND_STRATEGIC",
});

export const CMM_COVERAGE_SHORT = publish({
  value: "TALEBE BAĞLI",
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md §D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND",
});

/**
 * On-time delivery. The verified figure is 95 %, not the 98 % the site printed.
 *
 * It is withheld rather than corrected. `..._VISIBILITY` is
 * `PUBLIC_IF_VERIFIED_AND_STRATEGIC` — a conditional permission, not
 * `PUBLIC_OK` — and a self-graded, unaudited percentage is the weakest kind of
 * proof: it advertises a one-in-twenty miss without any evidence a buyer can
 * check. §0 `PUBLIC_POSITIONING_PRIORITY` puts measurement and process
 * discipline ahead of scorekeeping, so the slot carries a checkable capability
 * instead.
 */
export const ON_TIME_DELIVERY = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §D ON_TIME_DELIVERY_INTERNAL: 95% (PUBLIC_IF_VERIFIED_AND_STRATEGIC)",
  reason:
    "The published rate exceeded the verified one, and the 'AND_STRATEGIC' " +
    "condition is not met: an unaudited self-reported rate is not evidence.",
});

export const MATERIAL_COUNT = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source:
    "USER_INPUTS.md §D MATERIAL_COUNT_INTERNAL: UNKNOWN_REMOVE_IF_UNVERIFIED, " +
    "MATERIAL_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE",
  reason: "The published material count was both unverified and marked private.",
});

export const TEAM_SIZE = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D TEAM_SIZE_VISIBILITY + §0 DO_NOT_PUBLISH_TEAM_SIZE_BY_DEFAULT: YES",
  reason: "The published headcount was scale-revealing and unverified.",
});

export const MACHINE_COUNT = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D MACHINE_COUNT_VISIBILITY + §0 DO_NOT_PUBLISH_MACHINE_COUNT_BY_DEFAULT: YES",
  reason: "The machine park is private, and the model list was never supplied.",
});

export const FACILITY_SIZE = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D FACILITY_SIZE_VISIBILITY + §0 DO_NOT_PUBLISH_FACILITY_SIZE_BY_DEFAULT: YES",
  reason: "The published floor area was scale-revealing and unverified.",
});

export const ORDER_VOLUME = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE",
  reason: "Monthly capacity and the equipment-effectiveness table were invented AND private.",
});

/** No analytics provider exists, so no view count, ranking or reach can. */
export const CONTENT_ANALYTICS = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §K ANALYTICS_PROVIDER: NONE",
  reason: "Per-post read counts, their sum and the most-read ranking were all hardcoded.",
});

/* ── §F — customer references ───────────────────────────────────────────── */

export type ReferenceLogo = { name: string; brand?: "italic" | "serif" };

/**
 * Only names explicitly marked `PUBLIC_OK` in §F. ZTM was removed
 * (`REMOVE_IF_UNVERIFIED`); TEKNOPAR was added — it was permitted and simply
 * missing from the site.
 */
export const REFERENCE_LOGOS: readonly ReferenceLogo[] = publish({
  value: [
    { name: "HPT" },
    { name: "TAAC" },
    { name: "METSAN" },
    { name: "TEKNOPAR" },
    { name: "TEKNİK BALANS" },
    { name: "AKON HİDROLİK" },
  ] as const,
  visibility: "PUBLIC_CORE",
  source:
    "USER_INPUTS.md §F — HPT/TAAC/METSAN/TEKNIK_BALANS/AKON_HIDROLIK: PUBLIC_OK; " +
    "OTHER_REFERENCES: TEKNOPAR (PUBLIC_OK). One further name is REMOVE_IF_UNVERIFIED.",
});

/** A reference logo is permission to show a name — not to describe a project. */
export const CUSTOMER_PROJECT_EVIDENCE = withhold({
  visibility: "ANONYMIZE",
  source: "USER_INPUTS.md §G CASE_STUDIES: NONE_PROVIDED_YET, DEFAULT_CASE_STUDY_VISIBILITY: ANONYMIZE",
  reason:
    "No project was supplied and no client granted permission. " +
    "See src/content/caseStudies.ts for the schema that will carry real work.",
});

/** No testimonial was ever supplied. */
export const TESTIMONIALS = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §G — no testimonial field exists",
  reason: "TestimonialsSection.tsx was dead code carrying invented quotes; it was deleted.",
});

/* ── §H — publishable documents ─────────────────────────────────────────── */

export type QualityResource = {
  /** Row label. */
  title: string;
  /** Served from `public/belgeler/`. */
  href: string;
  /** Real byte size, measured from the served file by `scripts/sync-quality-docs.mjs`. */
  size: string;
};

/**
 * The four real PDFs from `Politikalar/`, all `PUBLIC_OK` in §H.
 *
 * They were previously rendered as `<li>` with no `href` under a heading that
 * said `KAYNAKLAR HAZIRLANIYOR`, with invented file sizes. The files existed
 * the whole time — they were simply never copied into the build.
 */
export const QUALITY_RESOURCES: readonly QualityResource[] = publish({
  value: [
    { title: "KALİTE POLİTİKAMIZ", href: "/belgeler/kalite-politikasi.pdf", size: "PDF · 79 KB" },
    { title: "ÖLÇÜM EKİPMANLARI LİSTESİ", href: "/belgeler/olcum-ekipmanlari.pdf", size: "PDF · 101 KB" },
    { title: "PAKETLEME KILAVUZU", href: "/belgeler/paketleme-kilavuzu.pdf", size: "PDF · 90 KB" },
    { title: "TEDARİKÇİ DAVRANIŞ KURALLARI", href: "/belgeler/tedarikci-davranis-kurallari.pdf", size: "PDF · 86 KB" },
  ] as const,
  visibility: "PUBLIC_CORE",
  source:
    "USER_INPUTS.md §H — QUALITY_POLICY_VISIBILITY / MEASUREMENT_EQUIPMENT_VISIBILITY / " +
    "PACKAGING_GUIDE_VISIBILITY / SUPPLIER_CONDUCT_VISIBILITY: all PUBLIC_OK",
});

/** There is no verification service, so there can be no verification QR. */
export const REPORT_VERIFICATION_SERVICE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §H OTHER_PUBLIC_DOCS: NONE — no verification endpoint exists",
  reason: "IMPLEMENTATION.md §13 forbids a fake verification destination outright.",
});

/* ── §J — RFQ and CAD policy ────────────────────────────────────────────── */

/**
 * There is no NDA, no approved confidentiality text and no known retention
 * period. The public copy is correct BY OMISSION — nothing may be added.
 */
export const CONFIDENTIALITY_PROMISE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source:
    "USER_INPUTS.md §J — NDA_AVAILABLE: NO, CONFIDENTIALITY_TEXT_APPROVED: NO, " +
    "CAD_RETENTION_PERIOD: UNKNOWN_REMOVE_IF_UNVERIFIED, CAD_DELETE_REQUEST_PROCESS: UNKNOWN",
  reason: "No confidentiality agreement, retention window or deletion process may be promised.",
});

/* ── §A / §B / §L — identity ────────────────────────────────────────────── */

export const PUBLIC_CITY = publish({
  value: "İzmir",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §A PUBLIC_CITY: İzmir",
});

/**
 * The public contact block (Phase 07).
 *
 * These strings existed already — in `SiteFooter.tsx` as a local `CONTACT`
 * object, and again as literals in `Iletisim.tsx`. Two copies of a phone
 * number is how a site ends up publishing two phone numbers. They move here
 * because §A authorises each of them individually and because the contact page
 * and the footer must agree by construction, not by review.
 *
 * The values are byte-identical to the ones the footer already rendered, so
 * this consolidation changes no pixel.
 */
export const PUBLIC_PHONE = publish({
  value: "+90 (536) 564 51 94",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §A PUBLIC_PHONE: +90 536 564 51 94",
});

export const PUBLIC_PHONE_HREF = publish({
  value: "tel:+905365645194",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §A PUBLIC_PHONE",
});

export const SALES_EMAIL = publish({
  value: "sales@mastechnic.com",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §A SALES_EMAIL · §J RFQ_RECIPIENT_EMAIL",
});

export const SALES_EMAIL_HREF = publish({
  value: "mailto:sales@mastechnic.com",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §A SALES_EMAIL",
});

/** Two lines, because the footer sets it on two. `PUBLIC_SUPPORTING`: the
 *  address may appear contextually, and does — footer and contact page. */
export const PUBLIC_ADDRESS_LINES: readonly string[] = publish({
  value: ["Ataşehir Mah., 8287. Sok.", "No: 4, 35620 Çiğli / İZMİR"] as const,
  visibility: "PUBLIC_SUPPORTING",
  source:
    "USER_INPUTS.md §A PUBLIC_ADDRESS: Ataşehir, 8287. Sk. No:4, 35620 Çiğli/İzmir; " +
    "ADDRESS_VISIBILITY: PUBLIC_SUPPORTING",
});

export const SOCIAL_LINKS: readonly { label: string; href: string }[] = publish({
  value: [
    { label: "LINKEDIN", href: "https://www.linkedin.com/company/mas-technic" },
    { label: "INSTAGRAM", href: "https://www.instagram.com/mastechnic" },
    { label: "FACEBOOK", href: "https://www.facebook.com/mastechnic" },
  ] as const,
  visibility: "PUBLIC_SUPPORTING",
  source:
    "USER_INPUTS.md §L LINKEDIN / INSTAGRAM / FACEBOOK: PUBLIC_OK (owner, 2026-10-01); " +
    "YOUTUBE / X_TWITTER: NONE",
});

export const ENGLISH_SITE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §B ENGLISH_LIVE_NOW: NO",
  reason: "The header toggle went in Phase 03; the JSON-LD language list went in Phase 06.",
});

/* ── Publication CLASS filter for republished spec rows ───────────────────
   PHASE 07 CORRECTION #1 — F1.

   `CategoryPage` lifts facts out of a leaf page's `technicalSpecs` and
   reprints them as listing metadata. The first version took
   `technicalSpecs.slice(0, 2)`. A slice is not a filter: it inherits whatever
   the array happens to begin with, so `seri-imalat`'s
   `{ "CNC Seri Kapasite", "50.000 adet/yıl" }` and
   `{ "Döküm Kapasite", "500.000 adet/yıl" }` were promoted onto a listing
   surface that had never carried them.

   The argument that defended it — "every figure can be checked against the
   table on the same page" — is about internal CONSISTENCY, and publication is
   a different question. `USER_INPUTS.md` §0 answers that one:
   `DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK`,
   `NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES`,
   `DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES`.

   SO THE FILTER IS AN ALLOWLIST, AND THAT IS THE POINT.
   A denylist would have to anticipate every unpublishable phrasing a future
   editor invents. This defaults to SILENCE: a spec is republished only if its
   value is recognisably a member of a class §0's `PUBLIC_POSITIONING_PRIORITY`
   names — tolerance, dimensional envelope, surface / hardness / strength
   measurement, temperature, published standard, material grade. A spec added
   to `servicePages.ts` tomorrow that is none of those simply does not appear,
   and nobody has to remember to exclude it.

   The withheld pass runs FIRST, and over the label as well as the value, so a
   mixed string ("50.000 adet/yıl, ±0.01mm") cannot buy its way in on the
   tolerance half. `scripts/claims-gate.mjs` is the second, independent line:
   the withheld class must not reach the data file in the first place.
   ------------------------------------------------------------------------ */

/** Classes §0 and §D withhold. Checked against label AND value, first. */
const WITHHELD_SPEC_CLASSES: readonly RegExp[] = [
  /* Production / order volume: a count over a period, however written.
     §D REVENUE_OR_ORDER_VOLUME · §0 DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME. */
  /\b(?:adet|ünite|parça|birim|palet|parti|sipariş)\s*\/\s*(?:yıl|ay|hafta|gün|saat|vardiya)/i,
  /\b\d[\d.,]*\s?K?\s?\+?\s*(?:adet|ünite)\b/i,
  /kapasite|hacim|ciro|üretim adedi/i,
  /* Company scale. §D TEAM_SIZE / MACHINE_COUNT / FACILITY_SIZE. */
  /\b(?:tezgah|tezgâh|makine|işleme merkezi|mühendis|teknisyen|personel|çalışan|operatör|müşteri|vardiya)\b/i,
  /\bm²|\bm2\b|metrekare/i,
  /* Stock and warehouse TONNAGE — the same disclosure `claims-gate.mjs`
     already refuses in the source, and qualified the same way it is there.
     PHASE 07 CORRECTION #2 — H6. Unqualified, this suppressed
     `{ label: "Sürekli Stok", value: "Al 6061, Al 7075" }` — a MATERIAL
     GRADE LIST with no quantity in it at all — and with it every chip on the
     material-library row, because the withheld pass reads the label too. The
     gate's own stock rule requires `kg|ton` nearby; a filter stricter than the
     gate, for no stated reason, is not conservatism, it is two instruments
     disagreeing about what the class is. What is withheld is the TONNAGE
     ("Güvenlik stoğu (5.000 kg)"), never the grade. */
  /(?:sto[kğ]|depo)[\s\S]{0,40}?\b\d[\d.,]*\s?(?:kg|ton)\b/i,
  /\b\d[\d.,]*\s?(?:kg|ton)\b[\s\S]{0,40}?(?:sto[kğ]|depo)/i,
  /* Money. */
  /[₺$€]|\bTL\b|\bEUR\b|\bUSD\b/i,
  /* Inventory / offering counts — the `15+ alüminyum alaşımı` class. */
  /\b\d[\d.,]*\s?\+\s*(?:\p{L}+\s+){0,2}(?:renk|çeşit|malzeme|alaşım|ürün|model|kalem)/iu,
  /* Unsourced performance percentages — the `%99.9+ okuma oranı` /
     `%30-50 maliyet tasarrufu` class. §D OTHER_PUBLIC_KPIS: NONE.
     A ± TOLERANCE is not one of these, so `±5%` must survive: the first rule
     requires the number not to be introduced by `±`. Written as a negated
     character class rather than a lookbehind on purpose — lookbehind is a
     parse-time SyntaxError on older Safari, which would take the whole
     module down instead of failing one check. */
  /(^|[^±\d])\d[\d.,]*\s?%/,
  /%\s?\d/,
];

/** Classes that ARE publishable: measurement, standard, material grade. */
const PUBLISHABLE_SPEC_CLASSES: readonly RegExp[] = [
  /* Tolerance — linear, ISO/IT grade, casting-tolerance class (CT4-CT6). */
  /±|\bIT\s?\d|\bCT\s?\d/i,
  /* Dimensional envelope, and any length-unit value. */
  /\b\d[\d.,]*\s?(?:mm|µm|μm|um|cm|nm|inç|inch)\b/i,
  /\d\s*[x×]\s*\d/i,
  /* Ratios and thread designations: `L/D 50:1`, `M2-M12`. */
  /\bL\s?\/\s?D\b|\b\d+\s?:\s?\d+\b|\bM\d{1,2}\b/,
  /* Surface finish, hardness, strength, torque, pressure. */
  /\bR[az]\s?\d|\bHRC\b|\bHV\b|\bHB\b|\bShore\b|\bMPa\b|\bGPa\b|\bN\/mm|\bNm\b|\bbar\b|\bpsi\b|\b\d[\d.,]*\s?lb\b/i,
  /* Force, mass, power, electrical and rotational envelopes — machine-side
     process parameters, not an inventory of machines. */
  /\b\d[\d.,]*\s?(?:ton|kg|kN|N|W|kW|kV|V|A|Hz|kHz|RPM|dev\/dak)\b/,
  /* Thermal envelopes. */
  /°\s?C\b/,
  /* Machine-axis counts. PHASE 07 CORRECTION #2 — H6: `claims-gate.mjs`
     keeps `5 eksen` as a SPECIFICATION in its own negative controls — it is a
     kinematic capability, not an inventory of machines — while this allowlist
     had no class for it, so `3, 4 ve 5 eksen` was dropped from the machine-park
     row. Two instruments cannot disagree about whether `5 eksen` is a
     specification. Written to read a list ("3, 4 ve 5 eksen") as one value. */
  /\b\d(?:[\s,]+(?:ve\s+)?\d)*\s*eksen(?:li)?\b/i,
  /* Service life expressed in cycles, and tooling cavity counts. */
  /\b\d[\d.,]*\s?K?\+?\s*(?:çevrim|döngü|kavite)/i,
  /* Published standards — the class Phase 06 kept alongside MIL-A-8625. */
  /\bISO\b|\bEN\s?\d|\bASTM\b|\bMIL-|\bDIN\b|\bAMS\b|\bIEC\b|\bIPC\b|\bGD&T\b|\bIP\s?\d{2}\b|\bANSI\b|\bJIS\b|\bWPS\b|\bIACS\b/,
  /* Non-destructive-test method sets: RT, UT, PT, MT, ET, MPI, PMI. */
  /\b(?:RT|UT|PT|MT|ET|MPI|PMI)\b(?:[,\s/]+\b(?:RT|UT|PT|MT|ET|MPI|PMI)\b)+/,
  /* Material grades and designations. A grade is a token that mixes letters
     and digits (`ADC12`, `ZA-8`, `42CrMo4`, `6061-T6`, `S355`, `GGG-40`),
     plus the named alloy families that do not.

     PHASE 07 CORRECTION #2 — H6, second cause. The token rule below is
     GLUED: it reads `6061-T6` but not `Al 6061`, because the designation
     there is written with a space. Measured, not inferred — after the stock
     rule was qualified, `{ label: "Sürekli Stok", value: "Al 6061, Al 7075" }`
     and `{ ..., value: "SS 304, SS 316" }` were STILL dropped, so the material
     library would still have shown an empty row. A space is a typographic
     accident, not a class boundary. Three or four digits are required, so
     `Kontrol 3` is not a grade. */
  /\b[A-Z][A-Za-z]{0,3}[\s-]\d{3,4}(?:[\s-]?[A-Z]\d?)?\b/,
  /\b[A-Z][A-Za-z]*-?\d[\w-]*\b|\b\d{3,4}[A-Z]\b/,
  /\b(?:PEEK|POM|PTFE|PVDF|PEI|PPS|AISI|Inconel|Hastelloy|Monel|Duplex|Hardox|Armox|CoCrMo|Ti6Al4V|Bronz|Titanyum)\b/i,
];

/**
 * May this `technicalSpecs` row be reprinted on a listing surface?
 *
 * Default is NO. Used by `src/pages/CategoryPage.tsx`; the decision lives here
 * rather than in the view so the policy has one home.
 */
export function isPublishableSpec(spec: { label: string; value: string }): boolean {
  const subject = `${spec.label} ${spec.value}`;
  if (WITHHELD_SPEC_CLASSES.some((rule) => rule.test(subject))) return false;
  return PUBLISHABLE_SPEC_CLASSES.some((rule) => rule.test(spec.value));
}

/** The first `limit` PUBLISHABLE rows, or none. Never a bare slice. */
export function publishableSpecValues(
  specs: readonly { label: string; value: string }[] | undefined,
  limit: number,
): string[] {
  if (!specs?.length) return [];
  return specs.filter(isPublishableSpec).slice(0, limit).map((spec) => spec.value);
}
