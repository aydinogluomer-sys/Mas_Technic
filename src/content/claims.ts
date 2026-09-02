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
  reason:
    "servicePages.ts once printed 'ISO 9001:2015 (TÜV SÜD), AS9100D (SGS), " +
    "IATF 16949 (Bureau Veritas)'. None of it was supplied; naming a registrar " +
    "invents an audit that did not happen.",
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
    "The site printed %98 against a verified 95%. The condition 'AND_STRATEGIC' " +
    "is not met: an unaudited self-reported rate is not evidence.",
});

export const MATERIAL_COUNT = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source:
    "USER_INPUTS.md §D MATERIAL_COUNT_INTERNAL: UNKNOWN_REMOVE_IF_UNVERIFIED, " +
    "MATERIAL_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE",
  reason: "'50+ MALZEME' was both unverified and marked private.",
});

export const TEAM_SIZE = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D TEAM_SIZE_VISIBILITY + §0 DO_NOT_PUBLISH_TEAM_SIZE_BY_DEFAULT: YES",
  reason: "'50+ deneyimli mühendis' is scale-revealing and unverified.",
});

export const MACHINE_COUNT = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D MACHINE_COUNT_VISIBILITY + §0 DO_NOT_PUBLISH_MACHINE_COUNT_BY_DEFAULT: YES",
  reason:
    "'50+ Tezgah' plus named machine models (DMG MORI, Mazak, Haas, Sodick) " +
    "published a machine park that is private and was never verified.",
});

export const FACILITY_SIZE = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D FACILITY_SIZE_VISIBILITY + §0 DO_NOT_PUBLISH_FACILITY_SIZE_BY_DEFAULT: YES",
  reason: "'15.000 m² üretim alanı' is scale-revealing and unverified.",
});

export const ORDER_VOLUME = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md §D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE",
  reason: "'50K+ adet/ay kapasite' and the OEE table were invented AND private.",
});

/** No analytics provider exists, so no view count, ranking or reach can. */
export const CONTENT_ANALYTICS = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §K ANALYTICS_PROVIDER: NONE",
  reason:
    "blogData.ts carried hardcoded per-post view counts and Blog.tsx summed them " +
    "into '14.2K TOPLAM OKUMA' and a most-read ranking. Nothing measured them.",
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
    "OTHER_REFERENCES: TEKNOPAR (PUBLIC_OK). ZTM: REMOVE_IF_UNVERIFIED.",
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
  reason:
    "The landing showed a decorative seeded-LCG QR under 'RAPORU DOĞRULA' with " +
    "'DOĞRULAMA SERVİSİ HAZIRLANIYOR'. IMPLEMENTATION.md §13 forbids a fake " +
    "verification destination outright.",
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
  reason: "No NDA, retention window or deletion process may be promised anywhere.",
});

/* ── §A / §B / §L — identity ────────────────────────────────────────────── */

export const PUBLIC_CITY = publish({
  value: "İzmir",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §A PUBLIC_CITY: İzmir",
});

export const SOCIAL_LINKS: readonly { label: string; href: string }[] = publish({
  value: [{ label: "LINKEDIN", href: "https://www.linkedin.com/company/mas-technic" }] as const,
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md §L LINKEDIN: PUBLIC_OK (INSTAGRAM / YOUTUBE / X_TWITTER: NONE)",
});

export const ENGLISH_SITE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md §B ENGLISH_LIVE_NOW: NO",
  reason:
    "The header EN toggle went in Phase 03. JSON-LD still told search engines " +
    "`availableLanguage: ['Turkish', 'English']`; Phase 06 removed that too.",
});
