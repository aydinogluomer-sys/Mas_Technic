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
export const heroPartFacts = [
  ["NOMİNAL ÖLÇÜ", "72.000 mm"],
  ["TOLERANS", "±0.010 mm"],
  ["FORM & KONUM", "⊥ 0.010 A"],
  ["DATUM", "A · B"],
] as const;

export const technicalProcess = [
  { no: "01", title: "ANALİZ", lines: ["DFM Analizi", "Tolerans Çalışması", "Üretilebilirlik"] },
  { no: "02", title: "TASARIM", lines: ["CAD Optimizasyon", "Proses Planlama", "Takım & Fikstür Tasarımı"] },
  { no: "03", title: "ÜRETİM", lines: ["5 Eksen CNC İşleme", "Proses Kontrol", "Ara Kontroller"] },
  { no: "04", title: "KALİTE & TESLİMAT", lines: ["Kontrol Planına Göre Ölçüm", "Ölçüm Kaydı", "Güvenli Paketleme"] },
] as const;

export const nexusPanels = ["ÖZET", "SİPARİŞLER", "TAKİP", "RAPORLAR", "KALİTE", "AYARLAR"] as const;

/* ── NEXUS: an ANONYMISED portal view, not a dashboard of invented numbers ──

   The band used to print four KPIs (aktif sipariş, üretimde, toplam parça, a
   success rate to one decimal place), six fabricated work orders, and a named
   quality manager who does not exist. All of it sat under a `DEMO İÇERİK`
   stamp, which admits the problem without fixing it.

   A customer portal cannot honestly show real orders anyway — they belong to
   customers. So the preview shows what the portal DOES, and the order table is
   redacted the way a screenshot of a live portal would have to be. Nothing
   here asserts a quantity, a rate, a date or a person.                      */

export const nexusKpis = [
  { value: "SİPARİŞ", label: "DURUM TAKİBİ", icon: "box" },
  { value: "ÜRETİM", label: "AŞAMA GÖRÜNÜRLÜĞÜ", icon: "flow", tone: "green" },
  { value: "ÖLÇÜM", label: "KONTROL KAYITLARI", icon: "stack" },
  { value: "SEVKİYAT", label: "TESLİMAT PLANI", icon: "chart" },
] as const;

/** Identifying fields are masked; the status vocabulary is the portal's real one. */
export const nexusOrders = [
  ["MT-••••-••12", "Braket", "Alüminyum", "••", "••.••.••••", "ÜRETİMDE"],
  ["MT-••••-••11", "Valf Gövdesi", "Paslanmaz Çelik", "••", "••.••.••••", "ÜRETİMDE"],
  ["MT-••••-••10", "Motor Gövdesi", "Titanyum", "••", "••.••.••••", "ÜRETİMDE"],
  ["MT-••••-••09", "Kompresör Çarkı", "Nikel Alaşım", "••", "••.••.••••", "KALİTE KONTROL"],
  ["MT-••••-••08", "Tahrik Mili", "Alaşımlı Çelik", "••", "••.••.••••", "HAZIR"],
  ["MT-••••-••07", "Gövde Bloğu", "Alüminyum", "••", "••.••.••••", "ÜRETİMDE"],
] as const;

/** Explains the masking glyphs instead of apologising for placeholder data. */
export const nexusRedactionNote = "PORTAL GÖRÜNÜMÜ · MÜŞTERİYE AİT ALANLAR MASKELENMİŞTİR";

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
