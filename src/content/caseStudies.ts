import { CMM_COVERAGE, LEAD_TIME_STATEMENT, MINIMUM_TOLERANCE } from "./claims";
import type { MeasuredEvidence } from "./measured-evidence";

/* ══════════════════════════════════════════════════════════════════════════
   CASE-STUDY SCHEMA

   `USER_INPUTS.md` §G:

       CASE_STUDIES: NONE_PROVIDED_YET
       DEFAULT_CASE_STUDY_VISIBILITY: ANONYMIZE
       IF_NONE: REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT

   So this module ships the SHAPE that real work will slot into, filled today
   with capability content. What it replaced was three fabricated "measured
   projects" — `AERO HOUSING / Ti-6Al-4V / RAPOR NO: MT-2024-0512` with a
   nominal → measured → `UYGUN` table. Those numbers were invented down to the
   micron and printed under a report number for a report that does not exist.

   THE TYPE DOES THE POLICING
   --------------------------
   The union is discriminated on `kind`:

     • `capability` — a description of how MAS approaches a part family.
       `client`, `measuredResults` and `reportNo` are typed `never`, so a
       capability profile CANNOT grow project evidence by accident.

     • `anonymised-project` — real work, no client name. It must carry
       `permission: "ANONYMISED"` and a `sector` instead of a customer.
       Measured results are optional and only meaningful with a real record.

   There is deliberately no `named-project` variant. Naming a client needs two
   separate permissions (§F `PUBLIC_OK` for the name AND written consent for
   the project), and no project has either today. Adding that variant is a
   decision for a human, not a refactor.
   ══════════════════════════════════════════════════════════════════════════ */

export type CaseStudyImageKey = "defense" | "medical" | "turning";

export type ControlPlanRow = {
  /** What is controlled. */
  feature: string;
  /** How it is controlled. */
  method: string;
  /** What the control leaves behind. */
  record: string;
};

type CaseStudyBase = {
  slug: string;
  /** Part-family name. Never a customer's part number. */
  title: string;
  /** The engineering problem the part poses. */
  challenge: string;
  material: string;
  /** Ordered operations. */
  process: readonly string[];
  /**
   * Never tighter than `claims.MINIMUM_TOLERANCE`. Sourcing it from the ledger
   * rather than typing a number is what stopped ±0.005 mm from coming back.
   */
  tolerance: string;
  /** `null` when no surface-finish figure is verified — which is today. */
  surfaceFinish: string | null;
  /** How conformity is established. Sourced from the ledger. */
  inspection: string;
  /** No lead time is verified in `USER_INPUTS.md`; this states the process. */
  leadTime: string;
  /** What the approach achieves, stated as method rather than as a metric. */
  outcome: string;
  /** The control plan a buyer would receive. */
  controlPlan: readonly ControlPlanRow[];
  /**
   * `alt` is the picture DESCRIBED — what is physically in the frame, not the
   * part family the profile is named after. Both renderers (`/` band 07 and
   * `/kabiliyet-profilleri/:slug`) place the picture directly under a heading
   * that already names the part, so the `<img>` itself carries `alt=""` there
   * and this string is printed as the plate's visible `<figcaption>` instead
   * (Phase 10-3, `reports/10/alt-text.md`). Nothing in it may name a material
   * the photograph cannot show.
   */
  gallery: readonly { image: CaseStudyImageKey; alt: string }[];
  relatedCapability: { label: string; href: string };
  rfq: { label: string; href: string };
};

export type CapabilityProfile = CaseStudyBase & {
  kind: "capability";
  client?: never;
  reportNo?: never;
  measuredResults?: never;
};

export type AnonymisedProject = CaseStudyBase & {
  kind: "anonymised-project";
  /** Sector, never a customer. */
  sector: string;
  permission: "ANONYMISED";
  client?: never;
  /**
   * Only from a real inspection record, in the PROOF01 contract
   * (`measured-evidence.ts`): sample, drawing revision, limits, unit, device,
   * date, source, permission and reviewer. Printed only through
   * `publishMeasuredEvidence`, which returns nothing while the flag is off.
   */
  measuredResults?: readonly MeasuredEvidence[];
  reportNo?: string;
};

export type CaseStudy = CapabilityProfile | AnonymisedProject;

const RFQ_CTA = { label: "BU PARÇA İÇİN TEKLİF AL", href: "/teklif-al" } as const;

/**
 * Lead-time wording. §D and §J supply a quote SLA (1-3 days) but no production
 * lead time, so the site describes the mechanism instead of promising a number.
 *
 * 09a-C2: the string moved to `claims.ts` as `LEAD_TIME_STATEMENT` — byte for
 * byte the same sentence — because eleven service pages had to start saying it
 * too, and a wording that lives in one data file is a wording the next one
 * will contradict. That is exactly how `3-5 iş günü` survived here.
 */
const LEAD_TIME = LEAD_TIME_STATEMENT;

export const caseStudies: readonly CaseStudy[] = [
  {
    kind: "capability",
    slug: "ince-cidarli-govde",
    title: "İNCE CİDARLI GÖVDE",
    challenge:
      "İnce cidarlı gövdelerde asıl zorluk kesme değil, bağlamadır: kuvvet ve ısı parçayı işleme sırasında hareket ettirir, ölçü tezgâhta doğru çıkar, kontrolde çıkmaz.",
    material: "Alüminyum 6061-T6 / 7075-T6",
    process: ["DFM ve bağlama analizi", "5 eksen frezeleme", "Ara kontrol", "Son kontrol"],
    tolerance: MINIMUM_TOLERANCE,
    surfaceFinish: null,
    inspection: CMM_COVERAGE,
    leadTime: LEAD_TIME,
    outcome:
      "Kesme sırası ve bağlama, cidar kalınlığına göre planlanır; kritik ölçüler serbest bırakma sonrasında tekrar kontrol edilir.",
    controlPlan: [
      { feature: "Kritik çap", method: "Kontrol planına göre ölçüm", record: "Ölçüm kaydı" },
      { feature: "Cidar kalınlığı", method: "Ara kontrol", record: "Operasyon kaydı" },
      { feature: "Düzlem / form", method: "Akredite 3. taraf CMM (talebe bağlı)", record: "Ölçüm raporu" },
    ],
    gallery: [{ image: "defense", alt: "Rulman yuvası ve bağlantı delikleri işlenmiş metal gövde, ölçüm masası üzerinde" }],
    relatedCapability: { label: "5 EKSEN CNC FREZELEME", href: "/hizmetler/cnc-frezeleme" },
    rfq: RFQ_CTA,
  },
  {
    kind: "capability",
    slug: "titanyum-baglanti-parcasi",
    title: "TİTANYUM BAĞLANTI PARÇASI",
    challenge:
      "Titanyum ısıyı kesiciye taşır ve takım ömrünü kısaltır. Sorun tek parçayı işlemek değil, yüzüncü parçayı ilk parçayla aynı çıkarmaktır.",
    material: "Ti-6Al-4V (Grade 5)",
    process: ["Takım ve kesme parametresi seçimi", "5 eksen frezeleme", "Takım ömrü izleme", "Son kontrol"],
    tolerance: MINIMUM_TOLERANCE,
    surfaceFinish: null,
    inspection: CMM_COVERAGE,
    leadTime: LEAD_TIME,
    outcome:
      "Kesme parametreleri ve takım değişim aralığı kayda bağlanır; parti içi sapma ara kontrollerle izlenir.",
    controlPlan: [
      { feature: "Bağlantı delikleri", method: "Kontrol planına göre ölçüm", record: "Ölçüm kaydı" },
      { feature: "Takım ömrü", method: "Operasyon içi izleme", record: "Proses kaydı" },
      { feature: "Malzeme kimliği", method: "Parti / döküm takibi", record: "İzlenebilirlik kaydı" },
    ],
    gallery: [{ image: "medical", alt: "Yüzeyi parlatılmış, eğik kanalı ve delikleri işlenmiş dik duran metal bağlantı parçası" }],
    relatedCapability: { label: "TOLERANS VE HASSASİYET", href: "/kabiliyetler/tolerans-hassasiyet" },
    rfq: RFQ_CTA,
  },
  {
    kind: "capability",
    slug: "hassas-mil",
    title: "HASSAS MİL",
    challenge:
      "Uzun millerde çap toleransı tek başına yetmez; eş eksenlilik ve salgı, parçanın montajda çalışıp çalışmayacağını belirler.",
    material: "42CrMo4 / 1.7225",
    process: ["Tornalama", "Isıl işlem sonrası ölçü kontrolü", "Taşlama payı planlama", "Son kontrol"],
    tolerance: MINIMUM_TOLERANCE,
    surfaceFinish: null,
    inspection: CMM_COVERAGE,
    leadTime: LEAD_TIME,
    outcome:
      "Punta ve tutuş referansları operasyon boyunca korunur; geometrik özellikler aynı datum üzerinden kontrol edilir.",
    controlPlan: [
      { feature: "Yatak çapları", method: "Kontrol planına göre ölçüm", record: "Ölçüm kaydı" },
      { feature: "Salgı / eş eksenlilik", method: "Datum üzerinden kontrol", record: "Ölçüm kaydı" },
      { feature: "Sertlik sonrası ölçü", method: "Ara kontrol", record: "Operasyon kaydı" },
    ],
    gallery: [{ image: "turning", alt: "Torna aynasına bağlı metal mil, taret takımı ve soğutma sıvısı altında tornalanırken" }],
    relatedCapability: { label: "CNC TORNALAMA", href: "/hizmetler/cnc-tornalama" },
    rfq: RFQ_CTA,
  },
];

/* COPY01 — the one sentence that tells a reader what a profile is. Stated
   once, here, and used verbatim by the index and every detail page. */
export const PROFILE_LABEL =
  "Bu sayfa bir kabiliyet profilidir; tamamlanmış müşteri projesi veya ölçüm raporu değildir.";
export const PROFILE_INDEX_LABEL =
  "Bu sayfadaki her kayıt bir kabiliyet profilidir; tamamlanmış müşteri projesi veya ölçüm raporu değildir.";
