import { Clock3, Gauge, Layers3, ScanBarcode, ScanLine, ShieldCheck } from "lucide-react";
import {
  CERTIFICATIONS,
  CMM_COVERAGE_SHORT,
  MINIMUM_TOLERANCE,
  QUOTE_RESPONSE_TIME,
  QUOTE_RESPONSE_TIME_DISPLAY,
  QUALITY_RESOURCES,
  REFERENCE_LOGOS,
} from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   THE LANDING'S FACTS NOW COME FROM ONE PLACE

   Every figure below that a buyer could act on is imported from
   `src/content/claims.ts`, which carries the `USER_INPUTS.md` field that
   authorises it. Before Phase 06 this file was the ORIGIN of the six numbers
   in the proof strip, and four of the six were not backed by anything.

   The corrections, each traceable to §D:

     TOLERANS         claimed twice the verified capability → MINIMUM_TOLERANCE
     TEKLİF SÜRESİ    promised narrower than the SLA        → QUOTE_RESPONSE_TIME
     CMM RAPORU       claimed universal in-house coverage   → CMM_COVERAGE_SHORT
     MALZEME          a private, unknown count              → removed
     ZAMANINDA TESL.  an inflated, unaudited rate           → removed

   The two freed slots carry things a buyer can check instead of trust: the
   machining configuration, and the one certification that is both verified
   and publishable.
   ══════════════════════════════════════════════════════════════════════════ */

export const technicalProof = [
  { value: MINIMUM_TOLERANCE, label: "TOLERANS", icon: ScanLine },
  { value: QUOTE_RESPONSE_TIME_DISPLAY, label: "TEKLİF DÖNÜŞÜ", icon: Clock3 },
  { value: CMM_COVERAGE_SHORT, label: "AKREDİTE CMM ÖLÇÜMÜ", icon: Gauge },
  { value: "İZLENEBİLİR", label: "ÜRETİM", icon: ScanBarcode },
  { value: "5 EKSEN", label: "CNC İŞLEME", icon: Layers3 },
  { value: CERTIFICATIONS[0].code, label: CERTIFICATIONS[0].name, icon: ShieldCheck },
] as const;

/**
 * The note under the strip.
 *
 * It used to soften six numbers, four of which were simply not true — which is
 * not what a qualifier is for. Every number above it is verified now, so the
 * note states the one thing that genuinely varies per job: which tolerance a
 * given geometry can actually hold.
 */
export const technicalProofNote =
  "Ulaşılabilir tolerans; geometri, malzeme ve ölçü zincirine göre değişir, her parça için teknik incelemede belirlenir.";

export const marqueeItems = [
  "5 EKSEN CNC İŞLEME",
  "CNC TORNALAMA",
  "MİKRO İŞLEME",
  "YÜZEY İŞLEMLERİ",
  "KALİTE KONTROL",
  "MONTAJ & BİRLEŞTİRME",
] as const;

/**
 * The hero passport is a DRAWING LEGEND, not a part record.
 *
 * It used to read `ÖLÇÜLER / TOLERANS / YÜZEY / MALZEME / RAPOR NO` about one
 * specific part, with a tolerance the company cannot hold and an inspection
 * report number for a report that does not exist — under a caption admitting
 * the part was only illustrative. Nothing about the pictured part is verified,
 * so the panel now explains the drawing's own vocabulary, which is what the
 * hero is really about (`PRIMARY_CREATIVE_THESIS:
 * MEASUREMENT_IS_THE_INTERACTION_MODEL`). Every value here is printed on the
 * drawing beside it, so the panel cannot be wrong about anything.
 */
/* The hero's part card reads an EXAMPLE drawing (it is captioned so). Every
   value is drawing vocabulary for that example: the tolerance is the site's
   verified floor (`src/content/claims.ts` §D ±0.01 mm), and the drawing number
   is explicitly an example code, never a report number (`claims-gate` blocks
   `MT-20xx-nnnn`, the fabricated-record shape). */
export const heroPartFacts = [
  ["ÖLÇÜLER", "120.00 × 72.00 × 68.00 mm"],
  ["TOLERANS", "±0.010 mm"],
  ["YÜZEY", "Ra 0.4 µm"],
  ["MALZEME", "17-4 PH Paslanmaz Çelik"],
  ["ÇİZİM NO", "MT-ÖRNEK-01"],
] as const;

export const technicalProcess = [
  { no: "01", title: "ANALİZ", lines: ["DFM Analizi", "Tolerans Çalışması", "Üretilebilirlik"] },
  { no: "02", title: "TASARIM", lines: ["CAD Optimizasyon", "Proses Planlama", "Takım & Fikstür Tasarımı"] },
  { no: "03", title: "ÜRETİM", lines: ["5 Eksen CNC İşleme", "Proses Kontrol", "Ara Kontroller"] },
  { no: "04", title: "KALİTE & TESLİMAT", lines: ["Kontrol Planına Göre Ölçüm", "Ölçüm Kaydı", "Güvenli Paketleme"] },
] as const;

/* ── NEXUS01: a DEMO workflow, not a portal screenshot ──────────────────────

   The band used to show four portal tiles over a "masked" order table —
   `MT-••••-••12`, `Braket`, `Alüminyum`, `ÜRETİMDE`. Masking a row reads as
   "a real order, hidden", and there is no such order behind it. The contract
   (NEXUS01) forbids exactly that claim. So the band is now five demo steps
   that explain what each stage of a job produces — a document or a decision —
   and nothing on it pretends to be an order, a customer, a quantity, a date,
   a turnover or a performance rate. Every view carries `DEMO` and
   `GERÇEK SİPARİŞ DEĞİLDİR`; there is nothing to download.               */

export const NEXUS_DEMO_LABEL = "DEMO";
export const NEXUS_NOT_REAL_LABEL = "GERÇEK SİPARİŞ DEĞİLDİR";

export const nexusDemoSteps = [
  {
    key: "teklif",
    title: "TEKLİF",
    summary: "Teknik resim veya 3B model incelenir; geometri, tolerans ve kapsam netleşince teklif hazırlanır.",
    document: "Teklif ve teknik değerlendirme notu",
    decision: "Kapsam, malzeme ve adet müşteriyle teyit edilir.",
  },
  {
    key: "onay",
    title: "ONAY",
    summary: "Teklif onaylanınca iş, revizyonu belli olan resimle açılır.",
    document: "Sipariş onayı ve geçerli resim revizyonu",
    decision: "Kontrol planındaki kritik koteler birlikte belirlenir.",
  },
  {
    key: "uretim",
    title: "ÜRETİM",
    summary: "Operasyonlar proses planına göre ilerler; işin hangi aşamada olduğu portalda görünür.",
    document: "Operasyon kaydı",
    decision: "Ara kontrolün sonucu, bir sonraki operasyonun koşuludur.",
  },
  {
    key: "olcum",
    title: "ÖLÇÜM",
    summary: "Kontrol planındaki özellikler ölçülür ve ölçüm kaydı işe bağlanır.",
    document: "Ölçüm kaydı",
    decision: "Parti, kontrol planı tamamlanınca sevkiyata serbest bırakılır.",
  },
  {
    key: "sevkiyat",
    title: "SEVKİYAT",
    summary: "Parçalar teslim dosyasıyla birlikte sevk edilir.",
    document: "Teslim dosyası: ölçüm kaydı ve şartnamede istenen belgeler",
    decision: "Teslim bilgisi işin kaydına eklenir.",
  },
] as const;

export const qualityCertificates = CERTIFICATIONS;

/** brand: markanın kendi yazım biçimi (italik/serif). Bilinmiyorsa boş bırakılır. */
export const referenceLogos = REFERENCE_LOGOS;

export const technicalFaqs = [
  [
    "Hangi dosya formatlarını destekliyorsunuz?",
    "STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını teklif akışında doğrudan yükleyebilirsiniz. Listede olmayan bir format veya ölçülendirilmiş teknik resim için dosyayı e-posta ile iletebilirsiniz.",
  ],
  [
    "Minimum tolerans değerleri nedir?",
    `Ulaşılabilir tolerans; geometri, malzeme, parça ölçüsü ve proses planına göre değişir. Standart çalışma aralığımız ${MINIMUM_TOLERANCE} olup her parça teknik incelemeden sonra teyit edilir.`,
  ],
  [
    "Ölçüm ve kalite kontrol süreçleriniz nelerdir?",
    "Her iş için bir kontrol planı oluşturulur; ara kontroller proses sırasında, son kontrol bu plana göre yapılır. Akredite üçüncü taraf CMM ölçümü talebe bağlı olarak sağlanır ve ölçüm kaydı teslimat dosyasına eklenir.",
  ],
  [
    "Teslim süreniz ne kadardır?",
    `Termin; malzeme tedariki, operasyon sayısı ve kapasite planı incelendikten sonra teklifle birlikte paylaşılır. Teklif dönüş süremiz ${QUOTE_RESPONSE_TIME}dür.`,
  ],
] as const;

/**
 * The four documents in §H, served from `public/belgeler/`.
 *
 * They were rendered as `<li>` with no `href` under `KAYNAKLAR HAZIRLANIYOR`,
 * with four invented file sizes, while the real PDFs sat outside the build the
 * whole time. `scripts/claims-gate.mjs` re-measures every size from disk now.
 */
export const technicalResources = QUALITY_RESOURCES;

export const rfqSteps = [
  { no: "01", title: "YÜKLE", line: "Çiziminizi bize iletin" },
  { no: "02", title: "ANALİZ", line: "DFM ve tolerans analizi" },
  { no: "03", title: "TEKLİF", line: "Net teklif ve teslim tarihi" },
  { no: "04", title: "ÜRETİM", line: "Kalite ve teslim süreci başlar" },
] as const;

/**
 * The drawing footer's four columns.
 *
 * TWO MIS-TARGETED ENTRIES WERE CORRECTED HERE (Phase 03, task 9 / B14).
 * `["Vizyon & Misyon", "/hakkimizda"]` and `["Kariyer", "/iletisim"]` both
 * promised a page the site does not have and silently delivered a different
 * one. There is no vision/mission page and no careers page, and inventing
 * either would be a fabrication, so the two slots now carry destinations that
 * exist and are labelled as what they are: the technical journal and the FAQ.
 * Every remaining target is either a real route or one of the seven real
 * landing anchors in `src/components/navigation/ia.ts`.
 */
export const footerColumns = [
  {
    title: "ŞİRKET",
    links: [
      ["Hakkımızda", "/hakkimizda"],
      ["Teknik Günlük", "/blog"],
      ["Sertifikalar", "#kalite"],
      ["Sık Sorulanlar", "/sss"],
    ],
  },
  {
    title: "YETENEKLER",
    links: [
      ["5 Eksen CNC", "/hizmetler/cnc-frezeleme"],
      ["Malzemeler", "/malzemeler"],
      ["Toleranslar", "/kabiliyetler/tolerans-hassasiyet"],
      ["Yüzey İşlemleri", "/kabiliyetler/yuzey-islemleri-muhendislik"],
    ],
  },
  {
    title: "KALİTE",
    links: [
      ["Kalite Politikamız", "/kabiliyetler/kalite-kontrol"],
      ["Ölçüm Kayıtları", "#kalite"],
      ["İzlenebilirlik", "#kalite"],
      ["Süreçler", "#surec"],
    ],
  },
  {
    title: "İLETİŞİM",
    links: [
      ["İletişim Bilgileri", "/iletisim"],
      ["Talep Gönder", "/teklif-al"],
      ["Konum", "/iletisim"],
    ],
  },
] as const;
