// src/content/claims.ts
var PUBLISHED_CAD_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"];
var joinTurkishList = (parts) => parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} ve ${parts[parts.length - 1]}`;
var CAD_UPLOAD_FORMATS = joinTurkishList(PUBLISHED_CAD_EXTENSIONS.map((ext) => ext.toUpperCase()));
var CAD_UPLOAD_EXTENSIONS = PUBLISHED_CAD_EXTENSIONS.map((ext) => `.${ext}`).join(", ");
function publish(claim) {
  return claim.value;
}
function withhold(claim) {
  return null;
}
var CERTIFICATIONS = publish({
  value: [
    { code: "ISO 9001:2015", name: "KAL\u0130TE Y\xD6NET\u0130M S\u0130STEM\u0130" },
    { code: "ISO 14001:2015", name: "\xC7EVRE Y\xD6NET\u0130M S\u0130STEM\u0130" },
    { code: "OHSAS 18001", name: "\u0130\u015E SA\u011ELI\u011EI VE G\xDCVENL\u0130\u011E\u0130 Y\xD6NET\u0130M S\u0130STEM\u0130" }
  ],
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7C \u2014 ISO_9001_VALUE: VERIFIED / PUBLIC_OK; ISO_14001_VALUE: VERIFIED / PUBLIC_OK; OTHER_CERTIFICATIONS: OHSAS 18001 (PUBLIC_OK)"
});
var CERTIFICATION_SENTENCE_LIST = CERTIFICATIONS.map((c) => c.code).slice(0, -1).join(", ") + " ve " + CERTIFICATIONS[CERTIFICATIONS.length - 1].code;
var CERTIFYING_BODIES = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7C \u2014 no issuer field is provided for any certificate",
  reason: "Naming a registrar invents an audit that did not happen."
});
var MINIMUM_TOLERANCE = publish({
  value: "\xB10.01 mm",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7D \u2014 MINIMUM_TOLERANCE_INTERNAL: \xB10.01 mm, MINIMUM_TOLERANCE_VISIBILITY: PUBLIC_IF_VERIFIED_AND_STRATEGIC"
});
var MINIMUM_TOLERANCE_COMPACT = publish({
  value: "\xB10.01mm",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7D \u2014 MINIMUM_TOLERANCE_INTERNAL: \xB10.01 mm"
});
var QUOTE_RESPONSE_TIME = publish({
  value: "1-3 i\u015F g\xFCn\xFC",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7D QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days; \xA7J QUOTE_SLA: 1-3 Days"
});
var QUOTE_RESPONSE_TIME_DISPLAY = publish({
  value: "1-3 \u0130\u015E G\xDCN\xDC",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7D QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days"
});
var PRODUCTION_LEAD_TIME = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7D \u2014 no lead-time / turnaround / termin field exists; \xA7J QUOTE_SLA: 1-3 Days is the quote's clock, not the part's",
  reason: "A production or delivery window is a commitment, and \xA7D authorises capability figures rather than commitments. The mechanism is publishable; the number is not. Use LEAD_TIME_STATEMENT or LEAD_TIME_SHORT."
});
var LEAD_TIME_STATEMENT = publish({
  value: "Termin; malzeme tedariki, operasyon say\u0131s\u0131 ve kapasite plan\u0131 incelendikten sonra teklifle birlikte verilir.",
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md \xA7J QUOTE_SLA: 1-3 Days \u2014 the quote is where the termin is stated; \xA7D supplies no field that would let the site state it earlier"
});
var LEAD_TIME_SHORT = publish({
  value: "Teklifle birlikte",
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md \xA7J QUOTE_SLA: 1-3 Days \u2014 same fact, cell-sized"
});
var CMM_COVERAGE = publish({
  value: "Akredite 3. taraf CMM \xF6l\xE7\xFCm\xFC, talebe ba\u011Fl\u0131",
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md \xA7D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND, CMM_COVERAGE_VISIBILITY: PUBLIC_IF_VERIFIED_AND_STRATEGIC"
});
var CMM_COVERAGE_SHORT = publish({
  value: "TALEBE BA\u011ELI",
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md \xA7D CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND"
});
var ON_TIME_DELIVERY = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7D ON_TIME_DELIVERY_INTERNAL: 95% (PUBLIC_IF_VERIFIED_AND_STRATEGIC)",
  reason: "The published rate exceeded the verified one, and the 'AND_STRATEGIC' condition is not met: an unaudited self-reported rate is not evidence."
});
var MATERIAL_COUNT = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md \xA7D MATERIAL_COUNT_INTERNAL: UNKNOWN_REMOVE_IF_UNVERIFIED, MATERIAL_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE",
  reason: "The published material count was both unverified and marked private."
});
var TEAM_SIZE = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md \xA7D TEAM_SIZE_VISIBILITY + \xA70 DO_NOT_PUBLISH_TEAM_SIZE_BY_DEFAULT: YES",
  reason: "The published headcount was scale-revealing and unverified."
});
var MACHINE_COUNT = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md \xA7D MACHINE_COUNT_VISIBILITY + \xA70 DO_NOT_PUBLISH_MACHINE_COUNT_BY_DEFAULT: YES",
  reason: "The machine park is private, and the model list was never supplied."
});
var FACILITY_SIZE = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md \xA7D FACILITY_SIZE_VISIBILITY + \xA70 DO_NOT_PUBLISH_FACILITY_SIZE_BY_DEFAULT: YES",
  reason: "The published floor area was scale-revealing and unverified."
});
var ORDER_VOLUME = withhold({
  visibility: "PRIVATE_DO_NOT_DISCLOSE",
  source: "USER_INPUTS.md \xA7D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE",
  reason: "Monthly capacity and the equipment-effectiveness table were invented AND private."
});
var CONTENT_ANALYTICS = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7K ANALYTICS_PROVIDER: NONE",
  reason: "Per-post read counts, their sum and the most-read ranking were all hardcoded."
});
var REFERENCE_LOGOS = publish({
  value: [
    { name: "HPT" },
    { name: "TAAC" },
    { name: "METSAN" },
    { name: "TEKNOPAR" },
    { name: "TEKN\u0130K BALANS" },
    { name: "AKON H\u0130DROL\u0130K" }
  ],
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7F \u2014 HPT/TAAC/METSAN/TEKNIK_BALANS/AKON_HIDROLIK: PUBLIC_OK; OTHER_REFERENCES: TEKNOPAR (PUBLIC_OK). One further name is REMOVE_IF_UNVERIFIED."
});
var CUSTOMER_PROJECT_EVIDENCE = withhold({
  visibility: "ANONYMIZE",
  source: "USER_INPUTS.md \xA7G CASE_STUDIES: NONE_PROVIDED_YET, DEFAULT_CASE_STUDY_VISIBILITY: ANONYMIZE",
  reason: "No project was supplied and no client granted permission. See src/content/caseStudies.ts for the schema that will carry real work."
});
var TESTIMONIALS = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7G \u2014 no testimonial field exists",
  reason: "TestimonialsSection.tsx was dead code carrying invented quotes; it was deleted."
});
var QUALITY_RESOURCES = publish({
  value: [
    { title: "KAL\u0130TE POL\u0130T\u0130KAMIZ", href: "/belgeler/kalite-politikasi.pdf", size: "PDF \xB7 79 KB" },
    { title: "\xD6L\xC7\xDCM EK\u0130PMANLARI L\u0130STES\u0130", href: "/belgeler/olcum-ekipmanlari.pdf", size: "PDF \xB7 101 KB" },
    { title: "PAKETLEME KILAVUZU", href: "/belgeler/paketleme-kilavuzu.pdf", size: "PDF \xB7 90 KB" },
    { title: "TEDAR\u0130K\xC7\u0130 DAVRANI\u015E KURALLARI", href: "/belgeler/tedarikci-davranis-kurallari.pdf", size: "PDF \xB7 86 KB" }
  ],
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7H \u2014 QUALITY_POLICY_VISIBILITY / MEASUREMENT_EQUIPMENT_VISIBILITY / PACKAGING_GUIDE_VISIBILITY / SUPPLIER_CONDUCT_VISIBILITY: all PUBLIC_OK"
});
var REPORT_VERIFICATION_SERVICE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7H OTHER_PUBLIC_DOCS: NONE \u2014 no verification endpoint exists",
  reason: "IMPLEMENTATION.md \xA713 forbids a fake verification destination outright."
});
var CONFIDENTIALITY_PROMISE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7J \u2014 NDA_AVAILABLE: NO, CONFIDENTIALITY_TEXT_APPROVED: NO, CAD_RETENTION_PERIOD: UNKNOWN_REMOVE_IF_UNVERIFIED, CAD_DELETE_REQUEST_PROCESS: UNKNOWN",
  reason: "No confidentiality agreement, retention window or deletion process may be promised."
});
var PUBLIC_CITY = publish({
  value: "\u0130zmir",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7A PUBLIC_CITY: \u0130zmir"
});
var PUBLIC_PHONE = publish({
  value: "+90 (536) 564 51 94",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7A PUBLIC_PHONE: +90 536 564 51 94"
});
var PUBLIC_PHONE_HREF = publish({
  value: "tel:+905365645194",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7A PUBLIC_PHONE"
});
var SALES_EMAIL = publish({
  value: "sales@mastechnic.com",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7A SALES_EMAIL \xB7 \xA7J RFQ_RECIPIENT_EMAIL"
});
var SALES_EMAIL_HREF = publish({
  value: "mailto:sales@mastechnic.com",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md \xA7A SALES_EMAIL"
});
var PUBLIC_ADDRESS_LINES = publish({
  value: ["Ata\u015Fehir Mah., 8287. Sok.", "No: 4, 35620 \xC7i\u011Fli / \u0130ZM\u0130R"],
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md \xA7A PUBLIC_ADDRESS: Ata\u015Fehir, 8287. Sk. No:4, 35620 \xC7i\u011Fli/\u0130zmir; ADDRESS_VISIBILITY: PUBLIC_SUPPORTING"
});
var SOCIAL_LINKS = publish({
  value: [{ label: "LINKEDIN", href: "https://www.linkedin.com/company/mas-technic" }],
  visibility: "PUBLIC_SUPPORTING",
  source: "USER_INPUTS.md \xA7L LINKEDIN: PUBLIC_OK (INSTAGRAM / YOUTUBE / X_TWITTER: NONE)"
});
var ENGLISH_SITE = withhold({
  visibility: "REMOVE_IF_UNVERIFIED",
  source: "USER_INPUTS.md \xA7B ENGLISH_LIVE_NOW: NO",
  reason: "The header toggle went in Phase 03; the JSON-LD language list went in Phase 06."
});

// scripts/qa-probes/p09a3-supabase-client-stub.mjs
var deny = () => {
  throw new Error("QA probe: the Supabase client is stubbed. No production call is permitted.");
};
var supabase = new Proxy({}, { get: deny, apply: deny });

// src/integrations/supabase/env.ts
var required = (name, value) => {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill in the Supabase values (dashboard \u2192 Project Settings \u2192 API).`
    );
  }
  return value;
};
var SUPABASE_URL = required("VITE_SUPABASE_URL", "http://127.0.0.1:1/qa-probe-never-reachable");
var SUPABASE_PUBLISHABLE_KEY = required(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "qa-probe-junk-key-not-a-credential"
);

// src/utils/cadUpload.ts
var CAD_ACCEPTED_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"];
var CAD_MAX_FILE_SIZE = 50 * 1024 * 1024;
var getCadFileExtension = (fileName) => fileName.split(".").pop()?.toLowerCase() ?? "";
var validateCadFile = (file) => {
  const extension = getCadFileExtension(file.name);
  if (!CAD_ACCEPTED_EXTENSIONS.includes(extension)) {
    return `Desteklenmeyen dosya format\u0131. Kabul edilen: ${CAD_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(", ")}`;
  }
  if (file.size > CAD_MAX_FILE_SIZE) return "Dosya boyutu 50 MB'\u0131 a\u015F\u0131yor.";
  return null;
};

// src/data/servicePages.ts
var servicePages = [
  // ── Hizmetler > Talaşlı İmalat ──
  {
    slug: "cnc-frezeleme",
    category: "hizmetler",
    categoryLabel: "Tala\u015Fl\u0131 \u0130malat",
    title: "CNC Frezeleme",
    metaTitle: "CNC Frezeleme Hizmetleri | 5 Eksen Hassas \u0130\u015Fleme | Mas Technic",
    metaDescription: (
      /* 09a-C3 — D3 ile aynı sınıf, ikinci yer. "ücretsiz DFM analizi" bir
         TİCARİ POLİTİKADIR ve `USER_INPUTS.md` hiçbir alanında yer almıyor;
         üstelik `metaDescription` olduğu için arama sonucuna ve sosyal karta
         da çıkıyordu. Yumuşatılamaz — okuyucuya bir sayı değil bir taahhüt
         söyleniyor — o yüzden yerine mekanizma yazıldı. `/sss` aynı soruyu
         Phase 07'de aynı gerekçeyle yeniden yazmıştı. */
      "3, 4 ve 5 eksenli CNC frezeleme ile \xB10.01 mm standart tolerans aral\u0131\u011F\u0131nda \xFCretim. Al\xFCminyum, titanyum ve \xE7elik i\u015Fleme, teklifle birlikte \xFCretilebilirlik incelemesi."
    ),
    description: "5 eksenli CNC frezeleme merkezlerimiz ile karma\u015F\u0131k geometrileri y\xFCksek hassasiyetle i\u015Fliyoruz. Al\xFCminyumdan titanyuma, plastikten kompozitlere kadar geni\u015F malzeme yelpazesi.",
    heroImage: "hero-cnc-frezeleme",
    content: [
      "5 eksenli CNC freze merkezlerimizde karma\u015F\u0131k geometrileri tek kurulumda tamaml\u0131yoruz. Ba\u011Flama say\u0131s\u0131n\u0131 azaltmak yaln\u0131zca s\xFCreyi k\u0131saltmaz; her yeni ba\u011Flama \xF6l\xE7\xFC zincirine yeni bir hata kayna\u011F\u0131 ekledi\u011Fi i\xE7in do\u011Frudan tolerans lehine \xE7al\u0131\u015F\u0131r.",
      "3 eksen frezeleme ile d\xFCz y\xFCzeyler, cep i\u015Fleme ve standart geometrilerde ekonomik \xE7\xF6z\xFCmler \xFCretiyoruz. 4 eksen frezeleme ile d\xF6ner tabla sayesinde silindirik par\xE7alarda kanal a\xE7ma, delik delme ve profil i\u015Fleme yap\u0131yoruz. 5 eksen simultane frezeleme ile tek ba\u011Flamada en karma\u015F\u0131k par\xE7a geometrilerini i\u015Fleyerek havac\u0131l\u0131k, medikal ve otomotiv sekt\xF6r\xFCn\xFCn taleplerini kar\u015F\u0131l\u0131yoruz.",
      "Y\xFCksek h\u0131zl\u0131 i\u015Fleme (HSM) stratejileriyle ince cidarl\u0131 par\xE7alarda kesme kuvvetini d\xFC\u015F\xFCr\xFCp y\xFCzey kalitesini iyile\u015Ftiriyoruz. Havac\u0131l\u0131k, otomotiv, medikal ve savunma gibi kritik sekt\xF6rlerde standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01 mm olup ula\u015F\u0131labilir tolerans her par\xE7a i\xE7in teknik incelemede belirlenir.",
      /* 09a-C3 — D1'in ikinci yarısı. Bu cümle SSS'deki yanlış listenin AYNISINI
         gövde metninde yayımlıyordu ("STEP, IGES, SolidWorks, CATIA ve NX
         formatlarını doğrudan işleyebiliyoruz"); beş formattan üçünü
         `validateCadFile()` reddediyor. Liste artık türetiliyor. */
      `Al\xFCminyum (6061, 7075), paslanmaz \xE7elik (304, 316), karbon \xE7elik, titanyum, PEEK ve POM/Delrin gibi m\xFChendislik malzemelerinde uzmanla\u015Fm\u0131\u015F ekibimizle hizmetinizdeyiz. Her projede DFM analizi uygulayarak maliyetleri optimize ediyoruz; teklif ak\u0131\u015F\u0131ndaki y\xFCkleyici ${CAD_UPLOAD_FORMATS} uzant\u0131lar\u0131n\u0131 do\u011Frular, listede olmayan yerel CAD kay\u0131tlar\u0131n\u0131 ve teknik resimleri e-posta ile al\u0131yoruz.`
    ],
    features: [
      "3 Eksen Frezeleme \u2014 D\xFCz y\xFCzeyler ve standart geometrilerde ekonomik \xE7\xF6z\xFCm",
      "4 Eksen Frezeleme \u2014 D\xF6ner tabla ile \xE7evresel ve profil i\u015Fleme",
      "5 Eksen Simultane \u2014 Tek ba\u011Flamada karma\u015F\u0131k geometriler",
      "Y\xFCksek H\u0131zl\u0131 \u0130\u015Fleme (HSM) \u2014 40.000 RPM, ince cidar ve \xFCst\xFCn y\xFCzey",
      "\xB10.01 mm Standart Tolerans \u2014 kontrol plan\u0131yla teyit edilir",
      "Otomatik Tak\u0131m De\u011Fi\u015Ftirme \u2014 uzun kesme s\xFCrelerinde kesintisiz i\u015Fleme"
    ],
    technicalSpecs: [
      { label: "Maks. Par\xE7a Boyutu (3 Eksen)", value: "1500\xD7800\xD7600mm" },
      { label: "Maks. Par\xE7a Boyutu (5 Eksen)", value: "800\xD7500\xD7500mm" },
      { label: "Maks. Mil H\u0131z\u0131", value: "12.000-40.000 RPM" },
      { label: "Tak\u0131m Kapasitesi", value: "30-120 adet (otomatik)" },
      { label: "Standart Tolerans", value: "\xB10.01mm" },
      { label: "Y\xFCzey Kalitesi", value: "Ra 0.4\xB5m'ye kadar" }
    ],
    processSteps: [
      "DFM Analizi",
      "CAM Programlama",
      "Fikst\xFCr Haz\u0131rl\u0131\u011F\u0131",
      "CNC \u0130\u015Fleme",
      "CMM \xD6l\xE7\xFCm",
      "Kalite Raporu"
    ],
    advantages: [
      "3, 4 ve 5 eksen konfig\xFCrasyonlar\u0131yla her geometri",
      /* 09a-C3 — F1. "%40 daha hızlı" kaynaksız bir performans KPI'ı; §D
         `OTHER_PUBLIC_KPIS: NONE`. Kabiliyet kalır, doğrulanmamış sayı gider:
         aynı sayfanın `content[2]` bölümü mekanizmayı zaten doğru anlatıyor
         ("kesme kuvvetini düşürüp yüzey kalitesini iyileştiriyoruz"). */
      "HSM stratejisiyle ince cidarl\u0131 par\xE7alarda d\xFC\u015F\xFCk kesme kuvveti ve iyi y\xFCzey kalitesi",
      "Otomatik tak\u0131m de\u011Fi\u015Ftirme (30-120 tak\u0131m magazini)",
      "Ger\xE7ek zamanl\u0131 s\xFCre\xE7 izleme ve dijital ikiz sim\xFClasyonu",
      "Prototipten seri \xFCretime esnek \xE7\xF6z\xFCmler (min. 1 adet)",
      "Termin, kapasite plan\u0131 incelendikten sonra teklifle birlikte verilir"
    ],
    materials: [
      { name: "Al\xFCminyum", grade: "6061-T6 / 7075-T6", properties: "Hafif, korozyona dayan\u0131kl\u0131, iyi i\u015Flenebilirlik" },
      { name: "Paslanmaz \xC7elik", grade: "304 / 316L", properties: "Y\xFCksek korozyon direnci, hijyenik" },
      { name: "Karbon \xC7elik", grade: "1045 / 4140", properties: "Y\xFCksek mukavemet, \u0131s\u0131l i\u015Fleme uygun" },
      { name: "Titanyum", grade: "Ti6Al4V (Grade 5)", properties: "Hafif, biyouyumlu, y\xFCksek mukavemet" },
      { name: "POM (Delrin)", grade: "Delrin 150 / 500", properties: "D\xFC\u015F\xFCk s\xFCrt\xFCnme, boyutsal kararl\u0131l\u0131k" },
      { name: "PEEK", grade: "PEEK 450G", properties: "Y\xFCksek s\u0131cakl\u0131k dayan\u0131m\u0131, kimyasal direnci" }
    ],
    faq: [
      { question: "3 eksen mi 5 eksen mi kullanmal\u0131y\u0131m?", answer: "D\xFCz y\xFCzeyler ve basit cep i\u015Flemleri i\xE7in 3 eksen yeterlidir ve daha ekonomiktir. Alttan kesim, e\u011Fik y\xFCzeyler veya tek ba\u011Flamada \xE7ok y\xFCzey i\u015Fleme gerekiyorsa 5 eksen tercih edilir." },
      { question: "CNC frezeleme tolerans de\u011Ferleriniz nedir?", answer: "Standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01mm'dir. Ula\u015F\u0131labilir tolerans; geometri, malzeme, par\xE7a \xF6l\xE7\xFCs\xFC ve \xF6l\xE7\xFC zincirine g\xF6re de\u011Fi\u015Fir ve her par\xE7a i\xE7in teknik incelemede belirlenir." },
      /* 09a-C3 — D1. Eski cevap dokuz format vaat ediyordu (parasolid, sldprt,
         solidworks, catpart, catia, prt, nx, dwg, pdf) ve `validateCadFile()`
         dokuzunu da reddediyor. Reddedilen formatlar cümlede KALIYOR — ama
         kabul edildikleri için değil, edilmedikleri için: `collectServiceFaqs()`
         anahtar kelimeleri bu metinden üretir, dolayısıyla `catia`, `catpart`,
         `solidworks`, `sldprt` yazan ziyaretçi artık DOĞRU cevaba düşer.
         Kabul edilen listenin kendisi türetilir; kaynakta yazılı değildir. */
      {
        question: "Hangi dosya formatlar\u0131n\u0131 kabul ediyorsunuz?",
        answer: `Teklif ak\u0131\u015F\u0131ndaki y\xFCkleyici \u015Fu uzant\u0131lar\u0131 do\u011Frular: ${CAD_UPLOAD_EXTENSIONS} \u2014 listede olmayan bir uzant\u0131 y\xFCkleme ad\u0131m\u0131ndan ge\xE7mez. Yerel CAD kay\u0131tlar\u0131n\u0131z\u0131 (SolidWorks .sldprt, CATIA .catpart, NX .prt) veya PDF/DWG teknik resminizi sales@mastechnic.com adresine iletirseniz teklif i\xE7in de\u011Ferlendiririz.`
      },
      { question: "Minimum sipari\u015F adedi var m\u0131?", answer: "Hay\u0131r, tek par\xE7adan seri \xFCretime kadar her adette \xFCretim yap\u0131yoruz. Prototip sipari\u015Fleri de kabul ediyoruz." },
      { question: "Teslimat s\xFCreniz ne kadar?", answer: LEAD_TIME_STATEMENT }
    ],
    comparisonTables: [
      {
        title: "CNC Frezeleme Eksen Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        description: "Par\xE7a geometrisine g\xF6re en uygun eksen konfig\xFCrasyonunu belirleyin",
        headers: ["\xD6zellik", "3 Eksen", "4 Eksen (3+1)", "5 Eksen Simultane"],
        rows: [
          ["Geometri Kapasitesi", "D\xFCz y\xFCzeyler, cep", "Silindirik profiller", "Karma\u015F\u0131k serbest formlar"],
          ["Ba\u011Flama Say\u0131s\u0131", "2-4 ba\u011Flama", "1-2 ba\u011Flama", "Tek ba\u011Flama"],
          ["Tolerans", "\xB10.05mm", "\xB10.02mm", "\xB10.01mm"],
          ["Y\xFCzey Kalitesi", "Ra 1.6\xB5m", "Ra 0.8\xB5m", "Ra 0.4\xB5m"],
          ["Setup S\xFCresi", "K\u0131sa", "Orta", "Uzun (ilk par\xE7a)"],
          ["Birim Maliyet", "$", "$$", "$$$"],
          ["Tipik Uygulama", "Plaka, braket", "Flan\u015F, kanal", "T\xFCrbin, implant"]
        ],
        highlight: 2
      },
      {
        title: "\u0130\u015Fleme Stratejileri ve Y\xFCzey Kalitesi",
        headers: ["Strateji", "\u0130lerleme H\u0131z\u0131", "Y\xFCzey Kalitesi (Ra)", "Tak\u0131m \xD6mr\xFC", "Uygulama"],
        rows: [
          ["Kaba \u0130\u015Fleme (HPC)", "5000-8000 mm/dk", "Ra 3.2-6.3\xB5m", "Standart", "Tala\u015F hacmi maksimizasyonu"],
          ["Yar\u0131 Fini\u015F", "2000-4000 mm/dk", "Ra 1.6-3.2\xB5m", "\u0130yi", "Son \u015Fekle yakla\u015Fma"],
          ["Fini\u015F \u0130\u015Fleme", "1000-2000 mm/dk", "Ra 0.8-1.6\xB5m", "Uzun", "Son y\xFCzey kalitesi"],
          ["HSM (Y\xFCksek H\u0131z)", "8000-15000 mm/dk", "Ra 0.4-0.8\xB5m", "K\u0131sa", "\u0130nce cidar, sert malzeme"],
          ["S\xFCper Fini\u015F", "500-1000 mm/dk", "Ra 0.1-0.4\xB5m", "\xC7ok uzun", "Optik y\xFCzeyler, kal\u0131p"]
        ]
      }
    ]
  },
  {
    slug: "cnc-tornalama",
    category: "hizmetler",
    categoryLabel: "Tala\u015Fl\u0131 \u0130malat",
    title: "CNC Tornalama",
    metaTitle: "CNC Tornalama Hizmetleri | \xC7ift Milli & Swiss Torna | Mas Technic",
    metaDescription: "CNC torna ile \xD80.5-500mm \xE7ap aral\u0131\u011F\u0131nda hassas tornalama. Canl\u0131 tak\u0131ml\u0131, Y eksenli ve kayar puntal\u0131 torna. \xB10.01 mm standart tolerans.",
    description: "\xC7ok eksenli torna merkezlerimiz ile mil, somun, g\xF6vde ve karma\u015F\u0131k d\xF6ner par\xE7alar\u0131 tek kurulumda tamamlayabilme kapasitesi.",
    heroImage: "hero-cnc-tornalama",
    content: [
      "CNC tornalama, silindirik ve d\xF6nme simetrisine sahip par\xE7alar i\xE7in en verimli \xFCretim y\xF6ntemidir. C eksenli ve Y eksenli CNC torna tezgahlar\u0131m\u0131z sayesinde frezeleme operasyonlar\u0131n\u0131 entegre ediyor, off-center delik ve kanal a\xE7ma i\u015Flemlerini tek ba\u011Flamada ger\xE7ekle\u015Ftiriyoruz.",
      "2 eksen tornalama ile miller, bur\xE7lar ve basit silindirik par\xE7alar \xFCretirken, canl\u0131 tak\u0131ml\u0131 tornalama ile Y ekseni \xFCzerinden torna tezgah\u0131nda frezeleme, delme ve di\u015F a\xE7ma i\u015Flemleri yap\u0131yoruz. Turn-Mill (torna-freze) kabiliyetimiz ile tek ba\u011Flamada hem tornalama hem frezeleme yaparak karma\u015F\u0131k par\xE7alarda y\xFCksek hassasiyet ve verimlilik elde ediyoruz.",
      "Kayar puntal\u0131 (Swiss tip) tornalama ile \xD80.3mm'den ba\u015Flayan \xE7aplarda medikal vida, saat pimi ve konekt\xF6r pini gibi k\xFC\xE7\xFCk \xE7apl\u0131, uzun par\xE7alar \xFCretiyoruz: desteklenmemi\u015F boyun k\u0131salmas\u0131 sehimi s\u0131n\u0131rlar. \xC7ift milli torna merkezlerinde \xF6n ve arka y\xFCzey i\u015Fleme operasyonlar\u0131 tek kurulumda tamamlan\u0131r.",
      "380mm maksimum torna \xE7ap\u0131, 1000mm torna boyu ve 65mm mil deli\u011Fi kapasitemiz ile geni\u015F bir par\xE7a yelpazesine hizmet veriyoruz. Otomatik bar feeder sistemi ile 3m \xE7apa kadar s\xFCrekli \xFCretim kapasitemiz mevcuttur."
    ],
    features: [
      "2 Eksen Tornalama \u2014 Miller, bur\xE7lar ve silindirik par\xE7alar",
      "Canl\u0131 Tak\u0131ml\u0131 Torna \u2014 Y ekseni ile frezeleme, delme, di\u015F a\xE7ma",
      "Turn-Mill (Torna-Freze) \u2014 Tek ba\u011Flamada komple i\u015Fleme",
      "Swiss Tornalama \u2014 \xD80.3mm'den ba\u015Flayan \xE7aplarda kayar punta",
      "Otomatik Bar Feeder \u2014 S\xFCrekli \xFCretim i\xE7in 3m \xE7apa kadar",
      "\xC7ift Milli Torna \u2014 \xD6n ve arka y\xFCzey tek kurulumda"
    ],
    technicalSpecs: [
      { label: "Maks. Torna \xC7ap\u0131", value: "\xD8500mm (standart), \xD832mm (Swiss)" },
      { label: "Maks. Torna Boyu", value: "1000mm (standart), 300mm (Swiss)" },
      { label: "Standart Tolerans", value: "\xB10.01mm" },
      { label: "Y\xFCzey Kalitesi", value: "Ra 0.4\xB5m'ye kadar" },
      { label: "Canl\u0131 Tak\u0131m", value: "12 istasyonlu, Y ekseni \xB150mm" },
      { label: "Bar Besleyici", value: "\xD865mm'ye kadar otomatik" }
    ],
    processSteps: [
      "Teknik \xC7izim \u0130nceleme",
      "Malzeme Haz\u0131rl\u0131\u011F\u0131",
      "CNC Tornalama",
      "\xD6l\xE7\xFCm & Kontrol",
      "Paketleme"
    ],
    advantages: [
      "Tek ba\u011Flamada komple i\u015Fleme",
      /* 09a-C3 — F1 ile aynı sınıf, bu sayfada. "%50 setup tasarrufu"
         kaynaksız; §D `OTHER_PUBLIC_KPIS: NONE`. Kabiliyetin kendisi —
         parçanın arka yüzünün ikinci bağlama olmadan tamamlanması — kalır. */
      "\xC7ift mil ile par\xE7an\u0131n arka y\xFCz\xFC ayr\u0131 bir ba\u011Flama gerektirmeden tamamlan\u0131r",
      "Swiss tip mikro tornalama kabiliyeti (0.3-32mm)",
      "Bar besleyici ile uzun partilerde operat\xF6r m\xFCdahalesiz i\u015Fleme",
      "Turn-mill ile frezeleme ihtiyac\u0131n\u0131 tek operasyonda \xE7\xF6zme",
      "C ekseni 0.001\xB0 hassasiyet ile hassas pozisyonlama"
    ],
    materials: [
      { name: "Al\xFCminyum", grade: "6061 / 2024 / 7075", properties: "Otomat kalite, serbest kesim, hafif" },
      { name: "Pirin\xE7", grade: "CuZn39Pb3 (CW614N)", properties: "M\xFCkemmel i\u015Flenebilirlik, dekoratif" },
      { name: "Paslanmaz \xC7elik", grade: "303 / 304 / 316", properties: "Korozyon direnci, hijyenik" },
      { name: "Otomat \xC7eli\u011Fi", grade: "1215 / 11SMnPb30", properties: "Y\xFCksek h\u0131z tornalama i\xE7in optimize" },
      { name: "Titanyum", grade: "Grade 2 / Grade 5", properties: "Biyouyumlu, y\xFCksek mukavemet/a\u011F\u0131rl\u0131k" },
      { name: "Delrin (POM)", grade: "Delrin 150 / PTFE", properties: "D\xFC\u015F\xFCk s\xFCrt\xFCnme, a\u015F\u0131nma direnci" }
    ],
    faq: [
      { question: "Tornalama m\u0131 frezeleme mi se\xE7meliyim?", answer: "Par\xE7an\u0131z silindirik veya d\xF6nme simetrisine sahipse tornalama daha ekonomiktir. Prizmatik par\xE7alar i\xE7in frezeleme tercih edilir." },
      { question: "Karma\u015F\u0131k par\xE7alar tek tezgahta m\u0131 yap\u0131l\u0131r?", answer: "Turn-mill tezgahlar\u0131m\u0131zda hem tornalama hem frezeleme i\u015Flemleri tek ba\u011Flamada yap\u0131labilir. Bu hassasiyeti art\u0131r\u0131r ve maliyeti d\xFC\u015F\xFCr\xFCr." },
      { question: "Swiss tornalama ne zaman gerekir?", answer: "\xD832mm alt\u0131 \xE7aplarda ve boy/\xE7ap oran\u0131 y\xFCksek par\xE7alarda (\xF6rn: medikal vidalar, pimler) Swiss torna daha hassas sonu\xE7 verir." },
      { question: "Seri \xFCretim i\xE7in uygun mu?", answer: "Evet. Bar besleyicili tezgahlarda \xE7ubuk malzeme otomatik ilerledi\u011Fi i\xE7in uzun partiler operat\xF6r m\xFCdahalesi olmadan i\u015Flenebilir; parti b\xFCy\xFCkl\xFC\u011F\xFC ve termin kapasite plan\u0131yla birlikte teklifte netle\u015Fir." },
      { question: "Hangi \xE7ap aral\u0131\u011F\u0131nda tornalama yapabiliyorsunuz?", answer: "Swiss tip torna ile 0.3mm'den ba\u015Flayarak konvansiyonel torna ile 500mm \xE7apa kadar geni\u015F bir aral\u0131kta tornalama yapabiliyoruz." }
    ],
    comparisonTables: [
      {
        title: "CNC Torna Konfig\xFCrasyon Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["\xD6zellik", "2 Eksen Torna", "Canl\u0131 Tak\u0131ml\u0131 (C/Y)", "Turn-Mill", "Swiss Torna"],
        rows: [
          ["\xC7ap Aral\u0131\u011F\u0131", "\xD810-500mm", "\xD810-380mm", "\xD810-300mm", "\xD80.3-32mm"],
          ["\u0130\u015Fleme Tipi", "Sadece tornalama", "Torna + delme/freze", "Torna + freze komple", "Uzun/ince par\xE7alar"],
          ["Tolerans", "\xB10.05mm", "\xB10.02mm", "\xB10.02mm", "\xB10.01mm"],
          ["Y\xFCzey Kalitesi", "Ra 0.8\xB5m", "Ra 0.4\xB5m", "Ra 0.4\xB5m", "Ra 0.2\xB5m"],
          ["Setup S\xFCresi", "K\u0131sa", "Orta", "Uzun", "Orta"],
          ["Birim Maliyet", "$", "$$", "$$$", "$$"],
          ["Tipik Par\xE7a", "Mil, bur\xE7", "Flan\u015F, valf g\xF6vde", "Karma\u015F\u0131k g\xF6vde", "Pin, vida, konekt\xF6r"]
        ],
        highlight: 3
      },
      {
        title: "Torna Malzeme \u0130\u015Flenebilirlik Matrisi",
        headers: ["Malzeme", "Kesme H\u0131z\u0131 (m/dk)", "\u0130lerleme (mm/dev)", "Tak\u0131m Tipi", "\u0130\u015Flenebilirlik"],
        rows: [
          ["Otomat \xC7eli\u011Fi (11SMnPb30)", "180-250", "0.15-0.35", "Kaplamal\u0131 karb\xFCr", "\u2605\u2605\u2605\u2605\u2605"],
          ["Al\xFCminyum 6061", "300-600", "0.10-0.30", "PCD / Elmas", "\u2605\u2605\u2605\u2605\u2605"],
          ["Pirin\xE7 CuZn39Pb3", "200-400", "0.10-0.25", "Kaplamas\u0131z karb\xFCr", "\u2605\u2605\u2605\u2605\u2605"],
          ["Paslanmaz 304", "120-180", "0.08-0.20", "CVD kaplamal\u0131", "\u2605\u2605\u2605\u2606\u2606"],
          ["Titanyum Grade 5", "40-80", "0.05-0.15", "PVD kaplamal\u0131", "\u2605\u2605\u2606\u2606\u2606"],
          ["\u0130nkonel 718", "20-40", "0.05-0.10", "Seramik / CBN", "\u2605\u2606\u2606\u2606\u2606"]
        ]
      }
    ]
  },
  {
    slug: "hassas-mikro-isleme",
    category: "hizmetler",
    categoryLabel: "Tala\u015Fl\u0131 \u0130malat",
    title: "Hassas Mikro \u0130\u015Fleme",
    metaTitle: "Hassas Mikro \u0130\u015Fleme | K\xFC\xE7\xFCk \xC7apl\u0131 Tak\u0131mlar | Medikal & Elektronik | Mas Technic",
    metaDescription: "\xD80.1mm tak\u0131mlarla mikro frezeleme ve tornalama. Medikal implant, elektronik konekt\xF6r ve optik par\xE7a bile\u015Fenlerinde k\xFC\xE7\xFCk \xF6l\xE7ekli hassas i\u015Fleme.",
    description: "Milimetrenin alt\u0131nda toleranslarla, mikron seviyesinde hassasiyet gerektiren par\xE7alar i\xE7in \xF6zel \xE7\xF6z\xFCmler. Medikal, elektronik ve optik sekt\xF6rlerine \xF6zel ultra-hassas i\u015Fleme.",
    heroImage: "hero-mikro-isleme",
    content: [
      "Mikro i\u015Fleme kabiliyetimiz ile \xD80.1mm'ye kadar tak\u0131mlarla 5 eksen mikro frezeleme ger\xE7ekle\u015Ftiriyoruz. Optik, elektronik ve medikal implant par\xE7alar\u0131nda standart CNC'nin ula\u015Famad\u0131\u011F\u0131 hassasiyet seviyelerine eri\u015Fiyoruz. 60.000 RPM'e kadar y\xFCksek h\u0131zl\u0131 i\u015F mili kapasitemiz ile ultra-hassas y\xFCzey kalitesi elde ediyoruz.",
      "Mikro frezeleme ile \xD80.1mm'ye kadar tak\u0131mlarla optik, elektronik ve medikal implant par\xE7alar\u0131 \xFCretiyoruz. Mikro tornalama ile \xD80.3mm'den ba\u015Flayan \xE7aplarda Swiss tornalama ile saat pimi, medikal vida ve konekt\xF6r pinleri imal ediyoruz. Mikro delme kabiliyetimiz ile \xD80.05mm'ye kadar hassas delik delme yaparak enjekt\xF6r u\xE7lar\u0131, nozullar ve ak\u0131\u015F kontrol par\xE7alar\u0131 \xFCretiyoruz.",
      "Mikro par\xE7alarda kontrol y\xF6ntemi de par\xE7an\u0131n \xF6l\xE7e\u011Fine g\xF6re se\xE7ilir: temasl\u0131 \xF6l\xE7\xFCm par\xE7ay\u0131 deforme edebilece\u011Fi i\xE7in optik y\xF6ntemler tercih edilir. Kontrol plan\u0131nda hangi kotenin hangi y\xF6ntemle \xF6l\xE7\xFClece\u011Fi \xF6nceden tan\u0131mlan\u0131r ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r.",
      "Medikal sekt\xF6r\xFCnde implantlar, cerrahi aletler, kemik vidalar\u0131 ve stentler; havac\u0131l\u0131k sekt\xF6r\xFCnde yak\u0131t enjekt\xF6rleri, sens\xF6r muhafazalar\u0131 ve mikro valfler; elektronik sekt\xF6r\xFCnde konekt\xF6r pinleri, fiber optik bile\u015Fenler ve yar\u0131 iletken test aparatlar\u0131; saat & optik sekt\xF6r\xFCnde saat mekanizma par\xE7alar\u0131, lens tutucular ve kamera bile\u015Fenleri \xFCretiyoruz."
    ],
    features: [
      "Mikro Frezeleme \u2014 \xD80.1mm tak\u0131mlarla 5 eksen i\u015Fleme",
      "Mikro Tornalama \u2014 \xD80.3mm'den ba\u015Flayan Swiss tornalama",
      "Mikro Delme \u2014 \xD80.05mm'ye kadar hassas delik delme",
      "Mikro \xD6l\xE7\xFCm \u2014 Optik CMM ile 0.1\xB5m \xE7\xF6z\xFCn\xFCrl\xFCkte kontrol",
      "K\xFC\xE7\xFCk \xC7apl\u0131 Tak\u0131m Kabiliyeti \u2014 \xD80.1mm'den ba\u015Flayan tak\u0131mlar",
      "Y\xFCzey P\xFCr\xFCzl\xFCl\xFC\u011F\xFC \u2014 Ra 0.1\xB5m (ayna parlakl\u0131\u011F\u0131)"
    ],
    technicalSpecs: [
      { label: "Min. Tak\u0131m \xC7ap\u0131", value: "\xD80.1mm (Freze), \xD80.05mm (Delme)" },
      { label: "Standart Tolerans", value: "\xB10.01mm" },
      { label: "Y\xFCzey Kalitesi", value: "Ra 0.1\xB5m (ayna parlakl\u0131\u011F\u0131)" },
      { label: "\u0130\u015F Mili H\u0131z\u0131", value: "60.000 RPM" },
      { label: "Par\xE7a Boyutu", value: "1mm\xB3 - 100mm\xB3" },
      { label: "\xD6l\xE7\xFCm Hassasiyeti", value: "0.1\xB5m optik \xF6l\xE7\xFCm" }
    ],
    processSteps: [
      "Mikro CAM Programlama",
      "\xD6zel Tak\u0131m Se\xE7imi",
      "Mikro \u0130\u015Fleme",
      "Optik \xD6l\xE7\xFCm",
      "Temizleme & Paketleme"
    ],
    advantages: [
      "K\xFC\xE7\xFCk \xF6l\xE7ekli geometrilerde kontroll\xFC i\u015Fleme",
      "\xD6zel mikro tak\u0131m stoku ve 60.000 RPM i\u015F mili",
      "Kontaminasyonsuz \xFCretim ortam\u0131",
      "200x optik b\xFCy\xFCtme kontrol\xFC",
      "Medikal, havac\u0131l\u0131k ve elektronik sekt\xF6r deneyimi",
      "Otomatik besleyicili Swiss torna ile mikro seri \xFCretim"
    ],
    materials: [
      { name: "Titanyum", grade: "Grade 5 (Ti6Al4V)", properties: "Biyouyumlu, hafif, y\xFCksek mukavemet" },
      { name: "Paslanmaz (Medikal)", grade: "316L", properties: "Biyouyumlu, korozyona dayan\u0131kl\u0131" },
      { name: "Al\xFCminyum", grade: "7075-T6", properties: "Hafif, y\xFCksek dayan\u0131m, iyi i\u015Flenebilirlik" },
      { name: "Bak\u0131r", grade: "C101 (OFE)", properties: "Y\xFCksek iletkenlik, hassas i\u015Fleme" },
      { name: "PEEK", grade: "PEEK 450G", properties: "Y\xFCksek s\u0131cakl\u0131k, kimyasal direnci" },
      { name: "Tungsten Karb\xFCr", grade: "WC-Co", properties: "A\u015F\u0131r\u0131 sertlik, a\u015F\u0131nma direnci" }
    ],
    faq: [
      { question: "Mikro i\u015Fleme ne zaman tercih edilmeli?", answer: "Par\xE7a \xF6zellikleri 1mm alt\u0131nda veya toleranslar \xB10.01mm alt\u0131nda ise mikro i\u015Fleme gereklidir. Standart CNC bu hassasiyetlere ula\u015Famaz." },
      { question: "Maliyet standart CNC'den y\xFCksek mi?", answer: "Evet, \xF6zel tak\u0131mlar, yava\u015F ilerleme h\u0131zlar\u0131 ve hassas \xF6l\xE7\xFCm gereksinimleri nedeniyle maliyet daha y\xFCksektir. Ancak bu, standart y\xF6ntemlerle elde edilemeyecek sonu\xE7lar i\xE7indir." },
      { question: "Seri \xFCretim yapabiliyor musunuz?", answer: "Evet, otomatik besleyicili Swiss torna ve palletli 5 eksen sistemleri ile mikro par\xE7alarda bile seri \xFCretim yapabiliyoruz." },
      { question: "\xD6l\xE7\xFCm raporu veriyor musunuz?", answer: "Kontrol plan\u0131nda tan\u0131mlanan koteler \xF6l\xE7\xFCl\xFCr ve \xF6l\xE7\xFCm kayd\u0131 teslimat dosyas\u0131na eklenir. Koordinat \xF6l\xE7\xFCm\xFC gerekti\u011Finde akredite \xFC\xE7\xFCnc\xFC taraf \xF6l\xE7\xFCm\xFC talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Mikro \u0130\u015Fleme Teknoloji Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Parametre", "Mikro Frezeleme", "Mikro Tornalama", "Mikro Delme", "Mikro EDM"],
        rows: [
          ["Min. \xD6zellik Boyutu", "50\xB5m", "300\xB5m (\xE7ap)", "50\xB5m (delik)", "10\xB5m"],
          ["Tolerans", "\xB12\xB5m", "\xB13\xB5m", "\xB15\xB5m", "\xB11\xB5m"],
          ["Y\xFCzey Kalitesi", "Ra 0.1\xB5m", "Ra 0.2\xB5m", "Ra 0.4\xB5m", "Ra 0.05\xB5m"],
          ["\u0130\u015Fleme H\u0131z\u0131", "Orta", "Y\xFCksek", "D\xFC\u015F\xFCk", "\xC7ok d\xFC\u015F\xFCk"],
          ["Malzeme K\u0131s\u0131t\u0131", "T\xFCm\xFC", "Silindirik", "T\xFCm\xFC", "\u0130letken"],
          ["Maliyet", "$$$", "$$", "$$", "$$$$"],
          ["Tipik Uygulama", "Optik, implant", "Pin, vida", "Nozul, enjekt\xF6r", "Mikro kal\u0131p"]
        ]
      },
      {
        title: "Sekt\xF6rel Mikro \u0130\u015Fleme Gereksinimleri",
        /* Same shape as the material certificate matrix: the column heading is
           the predicate, so `IPC-A-610` and `ISO 1413` published under
           "Sertifika" read as documents MAS supplies. Three of the five cells
           already described the expectation rather than naming a designation;
           the other two now do the same. The heading stays a document column on
           purpose, so the gate keeps watching this column. */
        headers: ["Sekt\xF6r", "Tipik Par\xE7a", "Tolerans Beklentisi", "Y\xFCzey Beklentisi", "Belge Beklentisi"],
        rows: [
          ["Medikal", "\u0130mplant, cerrahi alet", "\u015Eartnameye g\xF6re", "Ra 0.1-0.4\xB5m", "Biyouyumlu malzeme kayd\u0131"],
          ["Havac\u0131l\u0131k", "Yak\u0131t enjekt\xF6r, sens\xF6r", "\u015Eartnameye g\xF6re", "Ra 0.2-0.8\xB5m", "\u0130zlenebilir malzeme kayd\u0131"],
          ["Elektronik", "Konekt\xF6r pin, PCB", "\xB13-5\xB5m", "Ra 0.2-0.4\xB5m", "G\xF6rsel kabul kriteri"],
          ["Saat & Optik", "Mekanizma, lens tutucu", "\xB11-3\xB5m", "Ra 0.05-0.1\xB5m", "\xD6l\xE7\xFCm kayd\u0131"],
          ["Otomotiv", "Enjekt\xF6r nozul, sens\xF6r", "\u015Eartnameye g\xF6re", "Ra 0.4-0.8\xB5m", "Parti izlenebilirli\u011Fi"]
        ]
      }
    ]
  },
  {
    slug: "derin-delik-raybalama",
    category: "hizmetler",
    categoryLabel: "Tala\u015Fl\u0131 \u0130malat",
    title: "Derin Delik & Raybalama",
    metaTitle: "Derin Delik Delme & Raybalama | L/D 100:1 | Gun Drill & BTA | Mas Technic",
    metaDescription: "\xD82-200mm \xE7ap aral\u0131\u011F\u0131nda 2000mm derinli\u011Fe kadar derin delik delme. Gun drilling, BTA ve honlama ile Ra 0.2\xB5m y\xFCzey kalitesi. Hidrolik, kal\u0131p ve savunma sekt\xF6r\xFC.",
    description: "Boy/\xE7ap oran\u0131 y\xFCksek deliklerde hassas ve do\u011Frusal i\u015Fleme. Hidrolik silindir, kal\u0131p so\u011Futma kanallar\u0131 ve makina par\xE7alar\u0131 i\xE7in uzman \xE7\xF6z\xFCmler.",
    heroImage: "hero-derin-delik",
    content: [
      "Derin delik delme, boy/\xE7ap oran\u0131 (L/D) 10:1'den b\xFCy\xFCk delikler i\xE7in gerekli olan \xF6zel bir i\u015Fleme s\xFCrecidir. Standart matkaplarla bu oranlarda hassas delme m\xFCmk\xFCn de\u011Fildir. \xD6zel derin delik delme tezgahlar\u0131m\u0131z ile \xD82-200mm \xE7ap aral\u0131\u011F\u0131nda ve 2000mm derinli\u011Fe kadar hassas delik delme imk\xE2n\u0131 sunuyoruz.",
      "Gun drilling teknolojimiz ile tek dudakl\u0131 matkap kullanarak \xD82-20mm \xE7ap aral\u0131\u011F\u0131nda L/D oran\u0131 100:1'e kadar derin delikler i\u015Fliyoruz. Ya\u011F kanallar\u0131 ve so\u011Futma delikleri i\xE7in idealdir. BTA (Boring and Trepanning Association) delme sistemi ile \xD820-200mm aral\u0131\u011F\u0131nda b\xFCy\xFCk \xE7apl\u0131 derin deliklerde y\xFCksek tala\u015F kald\u0131rma h\u0131z\u0131 elde ediyoruz.",
      "Hassas raybalama ile H6/H7 toleranslar\u0131nda i\xE7 \xE7ap hassasiyeti sa\u011Fl\u0131yoruz. Hidrolik silindir ve rulman yataklar\u0131 i\xE7in ideal olan bu i\u015Flemde standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01mm \xE7ap tolerans\u0131d\u0131r. Honlama i\u015Flemi ile i\xE7 y\xFCzeylerde Ra 0.2\xB5m'ye kadar y\xFCzey kalitesi elde ederek silindir g\xF6mlekleri ve valfler i\xE7in m\xFCkemmel sonu\xE7lar \xFCretiyoruz.",
      "Hidrolik sistemlerde silindir g\xF6vdeleri, valf bloklar\u0131 ve manifold delikleri; kal\u0131p & tak\u0131m sekt\xF6r\xFCnde enjeksiyon kal\u0131plar\u0131nda so\u011Futma kanallar\u0131 ve ejekt\xF6r delikleri; enerji & makina sekt\xF6r\xFCnde t\xFCrbin \u015Faftlar\u0131 ve kompres\xF6r pistonlar\u0131; savunma sekt\xF6r\xFCnde silah namlular\u0131 ve optik t\xFCpleri \xFCretiminde uzmanla\u015Fm\u0131\u015F deneyimimiz bulunmaktad\u0131r."
    ],
    features: [
      "Gun Drilling \u2014 \xD82-20mm, L/D 100:1, ya\u011F kanallar\u0131",
      "BTA Delme \u2014 \xD820-200mm, y\xFCksek tala\u015F kald\u0131rma",
      "Hassas Raybalama \u2014 H6/H7 tolerans, \xB10.01mm \xE7ap",
      "Honlama \u2014 \u0130\xE7 y\xFCzeylerde Ra 0.2\xB5m kalite",
      "2000mm Derinlik \u2014 Uzun par\xE7alarda do\u011Frusal delme",
      "500kg Par\xE7a Kapasitesi \u2014 A\u011F\u0131r i\u015F par\xE7alar\u0131"
    ],
    technicalSpecs: [
      { label: "Delik \xC7ap\u0131 (Gun Drill)", value: "\xD82-100mm" },
      { label: "Delik \xC7ap\u0131 (BTA)", value: "\xD820-200mm" },
      { label: "Maks. Delik Derinli\u011Fi", value: "2000mm" },
      { label: "Do\u011Frusall\u0131k", value: "0.05mm/100mm sapma" },
      { label: "\xC7ap Tolerans\u0131", value: "H6/H7 (\xB10.01mm)" },
      { label: "Y\xFCzey Kalitesi", value: "Ra 0.4\xB5m (delme), Ra 0.2\xB5m (honlama)" }
    ],
    processSteps: [
      "Teknik Analiz",
      "Delme Y\xF6ntemi Se\xE7imi",
      "Derin Delik \u0130\u015Fleme",
      "Raybalama / Honlama",
      "\xD6l\xE7\xFCm & Rapor"
    ],
    advantages: [
      "100:1 L/D oran\u0131 kapasitesi",
      "Gun drill ve BTA teknolojileri",
      "Honlama ile Ra 0.2\xB5m y\xFCzey iyile\u015Ftirme",
      "\xD6zel k\u0131lavuzlama burs sistemleri ile sapma minimizasyonu",
      "Y\xFCksek bas\u0131n\xE7l\u0131 so\u011Futma s\u0131v\u0131s\u0131 ile optimize edilmi\u015F kesme",
      "Hidrolik, enerji, kal\u0131p ve savunma sekt\xF6r\xFC deneyimi"
    ],
    materials: [
      { name: "\xC7elik", grade: "1045 / 4140 / 42CrMo4", properties: "Y\xFCksek mukavemet, \u0131s\u0131l i\u015Fleme uygun" },
      { name: "Paslanmaz \xC7elik", grade: "304 / 316L", properties: "Korozyon direnci, hidrolik uygulamalar" },
      { name: "Al\xFCminyum", grade: "6061 / 7075", properties: "Hafif, so\u011Futma kanallar\u0131 i\xE7in ideal" },
      { name: "D\xF6kme Demir", grade: "GGG-40 / GGG-50", properties: "Titre\u015Fim s\xF6n\xFCmleme, a\u011F\u0131r y\xFCk" },
      { name: "\u0130nkonel", grade: "625 / 718", properties: "Y\xFCksek s\u0131cakl\u0131k dayan\u0131m\u0131, havac\u0131l\u0131k" },
      { name: "Bronz", grade: "CuSn8 / CuAl10", properties: "A\u015F\u0131nma direnci, s\xFCrt\xFCnme azaltma" }
    ],
    faq: [
      { question: "Derin delik nedir?", answer: "Boy/\xE7ap oran\u0131 (L/D) 10:1'den b\xFCy\xFCk delikler 'derin delik' olarak tan\u0131mlan\u0131r. Standart matkaplarla bu oranlarda hassas delme m\xFCmk\xFCn de\u011Fildir." },
      { question: "Gun drill ile BTA aras\u0131ndaki fark nedir?", answer: "Gun drill k\xFC\xE7\xFCk \xE7aplarda (\xD82-20mm) ve y\xFCksek L/D oranlar\u0131nda kullan\u0131l\u0131r. BTA daha b\xFCy\xFCk \xE7aplarda (\xD820mm \xFCst\xFC) ve y\xFCksek tala\u015F kald\u0131rma h\u0131zlar\u0131nda tercih edilir." },
      { question: "Do\u011Frusall\u0131k nas\u0131l sa\u011Flan\u0131r?", answer: "\xD6zel k\u0131lavuzlama burs sistemleri, y\xFCksek bas\u0131n\xE7l\u0131 so\u011Futma s\u0131v\u0131s\u0131 ve optimize edilmi\u015F kesme parametreleri ile sapma minimuma indirilir." },
      { question: "\u0130\xE7 y\xFCzey kalitesi iyile\u015Ftirilebilir mi?", answer: "Evet, raybalama ve honlama i\u015Flemleriyle Ra 0.2\xB5m'ye kadar y\xFCzey kalitesi elde edilebilir. H6 tolerans\u0131nda \xE7ap hassasiyeti sa\u011Flan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Derin Delik Delme Y\xF6ntemleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Parametre", "Gun Drilling", "BTA Delme", "Trepan Delme", "Konvansiyonel Matkap"],
        rows: [
          ["\xC7ap Aral\u0131\u011F\u0131", "\xD82-20mm", "\xD820-200mm", "\xD850-300mm", "\xD81-50mm"],
          ["Maks. L/D Oran\u0131", "100:1", "50:1", "30:1", "5:1"],
          ["Do\u011Frusall\u0131k", "0.02mm/100mm", "0.05mm/100mm", "0.1mm/100mm", "0.5mm/100mm"],
          ["Y\xFCzey Kalitesi", "Ra 0.4-0.8\xB5m", "Ra 0.8-1.6\xB5m", "Ra 1.6-3.2\xB5m", "Ra 3.2-6.3\xB5m"],
          ["Tala\u015F Kontrol\xFC", "Harici so\u011Futma", "\u0130\xE7 tala\u015F tahliye", "Halka tala\u015F", "Manuel"],
          ["Maliyet", "$$$", "$$", "$$", "$"],
          ["Tipik Uygulama", "Ya\u011F kanal\u0131, namlu", "Silindir g\xF6vde", "B\xFCy\xFCk boru", "Standart delik"]
        ],
        highlight: 0
      },
      {
        title: "Raybalama ve Honlama Tolerans Seviyeleri",
        headers: ["\u0130\u015Flem", "\xC7ap Tolerans\u0131", "Y\xFCzey Kalitesi (Ra)", "Silindiriklik", "Uygulama"],
        rows: [
          ["Standart Delme", "H11 (\xB10.1mm)", "Ra 3.2-6.3\xB5m", "0.05mm", "C\u0131vata deli\u011Fi"],
          ["Hassas Raybalama", "H7 (\xB10.01mm)", "Ra 0.8-1.6\xB5m", "0.01mm", "Pim yata\u011F\u0131, bur\xE7"],
          ["\u0130nce Raybalama", "H7", "Ra 0.4-0.8\xB5m", "0.02mm", "Rulman yata\u011F\u0131"],
          ["Honlama", "H7", "Ra 0.1-0.4\xB5m", "0.01mm", "Hidrolik silindir"],
          ["S\xFCper Fini\u015F Honlama", "H6", "Ra 0.05-0.1\xB5m", "0.01mm", "Motor silindir"]
        ],
        highlight: 3
      }
    ]
  },
  // ── Hizmetler > Ön Üretim ──
  {
    slug: "enjeksiyon-kalibi",
    category: "hizmetler",
    categoryLabel: "\xD6n \xDCretim",
    title: "Enjeksiyon Kal\u0131b\u0131",
    metaTitle: "Enjeksiyon Kal\u0131p \u0130malat\u0131 | Moldflow Sim\xFClasyon | Mas Technic",
    metaDescription: "Al\xFCminyum ve \xE7elik enjeksiyon kal\u0131p \xFCretimi. Moldflow sim\xFClasyonu, 1.000.000+ \xE7evrim \xF6mr\xFC. Prototip kal\u0131ptan seri \xFCretim kal\u0131b\u0131na malzeme se\xE7imi.",
    description: "Al\xFCminyum ve \xE7elik kal\u0131p imalat\u0131. H\u0131zl\u0131 prototip kal\u0131plar\u0131ndan y\xFCksek hacimli seri \xFCretim kal\u0131plar\u0131na kadar t\xFCm ihtiya\xE7lar\u0131n\u0131za \xE7\xF6z\xFCm.",
    heroImage: "hero-enjeksiyon-kalibi",
    content: [
      "Y\xFCksek hassasiyetli plastik enjeksiyon kal\u0131plar\u0131n\u0131n tasar\u0131m\u0131n\u0131 ve \xFCretimini ger\xE7ekle\u015Ftiriyoruz. Moldflow sim\xFClasyonu ile dolum davran\u0131\u015F\u0131n\u0131 kal\u0131p \xFCretiminden \xF6nce de\u011Ferlendiriyoruz. \xC7ekme pay\u0131 optimizasyonu ve gate/vent konumland\u0131rma dahil kapsaml\u0131 DFM analizi sunuyoruz.",
      "Kal\u0131p malzemesi beklenen \xFCretim adedine g\xF6re se\xE7ilir: Al 7075 (150 HB) prototip ve d\xFC\u015F\xFCk hacim, P20 (280-320 HB) orta hacim, H13 (45-52 HRC) y\xFCksek hacim, S136 (48-52 HRC) ise korozyon direnci gereken uygulamalar i\xE7in. S\u0131cak yolluk deste\u011Fi ile malzeme tasarrufu ve d\xF6ng\xFC s\xFCresi iyile\u015Ftirmesi sa\u011Flan\u0131r.",
      "Al\xFCminyum kal\u0131plar d\xFC\u015F\xFCk ve orta hacimde daha k\u0131sa s\xFCrede haz\u0131rlan\u0131rken, \xE7elik kal\u0131plar y\xFCksek hacimli \xFCretimde daha uzun \xF6m\xFCr sa\u011Flar. Beklenen adet ve par\xE7a geometrisi, kal\u0131p malzemesi ve bo\u015Fluk say\u0131s\u0131 karar\u0131n\u0131 birlikte belirler."
    ],
    features: [
      "Al\xFCminyum Kal\u0131p \u2014 d\xFC\u015F\xFCk ve orta hacim i\xE7in h\u0131zl\u0131 haz\u0131rl\u0131k",
      "\xC7elik Kal\u0131p \u2014 y\xFCksek hacimli \xFCretimde uzun \xF6m\xFCr",
      "\xC7ok Bo\u015Fluklu Tasar\u0131m \u2014 Verimlilik art\u0131\u015F\u0131",
      "S\u0131cak Yolluk Sistemi \u2014 Malzeme tasarrufu ve d\xF6ng\xFC iyile\u015Ftirmesi"
    ],
    technicalSpecs: [
      { label: "Kal\u0131p Boyutu (min)", value: "100\xD7100\xD7100mm" },
      { label: "Kavite Say\u0131s\u0131", value: "1-128 kavite" },
      { label: "Kal\u0131p \xD6mr\xFC", value: "1.000.000+ \xE7evrim" },
      { label: "Tolerans", value: "\xB10.01mm" }
    ],
    processSteps: [
      "\xDCr\xFCn Analizi",
      "Kal\u0131p Tasar\u0131m\u0131",
      "Moldflow Sim\xFClasyonu",
      "CNC \u0130\u015Fleme",
      "Deneme Bas\u0131m\u0131",
      "Teslimat"
    ],
    advantages: [
      "Moldflow ak\u0131\u015F sim\xFClasyonu dahil",
      "DFM analizi ve \xE7ekme pay\u0131 optimizasyonu",
      "Hot runner sistemi deste\u011Fi",
      "4 farkl\u0131 kal\u0131p malzemesi se\xE7ene\u011Fi (Al 7075, P20, H13, S136)"
    ],
    materials: [
      { name: "Al 7075", grade: "150 HB", properties: "Prototip kal\u0131p, 10.000+ \xE7evrim" },
      { name: "P20 (1.2311)", grade: "280-320 HB", properties: "Orta hacim, genel ama\xE7l\u0131" },
      { name: "H13 (1.2344)", grade: "45-52 HRC", properties: "Y\xFCksek hacim, s\u0131cak i\u015F \xE7eli\u011Fi" },
      { name: "S136 (1.2083)", grade: "48-52 HRC", properties: "Korozyon direnci, optik kal\u0131plar" }
    ],
    faq: [
      { question: "Kal\u0131p teslimat s\xFCresi ne kadar?", answer: `Kal\u0131p termini malzeme s\u0131n\u0131f\u0131na, kavite say\u0131s\u0131na ve y\xFCzey gereksinimine g\xF6re de\u011Fi\u015Fir; al\xFCminyum kal\u0131p \xE7elik kal\u0131ba g\xF6re daha k\u0131sa s\xFCrede i\u015Flenir. ${LEAD_TIME_STATEMENT}` },
      { question: "Moldflow sim\xFClasyonu zorunlu mu?", answer: "Zorunlu de\u011Fildir ancak \xF6zellikle karma\u015F\u0131k par\xE7alarda dolum problemlerini, \xE7\xF6kme izlerini ve e\u011Filmeyi \xF6nlemek i\xE7in \u015Fiddetle tavsiye ederiz." },
      { question: "Al\xFCminyum m\u0131 \xE7elik kal\u0131p m\u0131 se\xE7meliyim?", answer: "10.000 adete kadar \xFCretim i\xE7in al\xFCminyum kal\u0131p ekonomiktir. Daha y\xFCksek hacimler i\xE7in \xE7elik kal\u0131p uzun vadede maliyet avantaj\u0131 sa\u011Flar." }
    ],
    comparisonTables: [
      {
        title: "Enjeksiyon Kal\u0131p Malzemesi Se\xE7im Matrisi",
        /* 09a-C2: the "Teslimat Süresi" column published five mold lead times
           (2-3 / 4-6 / 6-8 / 6-8 / 5-7 hafta). No field authorises any of them,
           and neutralising five cells to "Teklifle birlikte" would leave a
           column that carries no information. The column is removed; the FAQ
           on this page states the same fact once, correctly. Mold LIFE
           (çevrim) is a material property and stays. */
        headers: ["Kal\u0131p Malzemesi", "Sertlik", "Kal\u0131p \xD6mr\xFC", "Maliyet", "Uygulama"],
        rows: [
          ["Al 7075", "150 HB", "10.000+ \xE7evrim", "$", "Prototip, d\xFC\u015F\xFCk hacim"],
          ["P20 (1.2311)", "280-320 HB", "500.000+ \xE7evrim", "$$", "Orta hacim, genel ama\xE7"],
          ["H13 (1.2344)", "45-52 HRC", "1.000.000+ \xE7evrim", "$$$", "Y\xFCksek hacim, s\u0131cak i\u015F"],
          ["S136 (1.2083)", "48-52 HRC", "1.000.000+ \xE7evrim", "$$$$", "Optik, medikal, korozyon"],
          ["NAK80", "38-42 HRC", "500.000+ \xE7evrim", "$$$", "Y\xFCksek parlakl\u0131k, \xF6n sertle\u015Ftirilmi\u015F"]
        ],
        highlight: 2
      },
      {
        title: "Kavite Say\u0131s\u0131 ve \xDCretim Verimlili\u011Fi",
        /* 09a-C3 — F4. "Parça/Saat" SÜTUNU KALDIRILDI.
                   `claims.ts` `WITHHELD_SPEC_CLASSES[0]` bir sayım nesnesinin bir
                   döneme bölünmesini — `parça/saat` dahil — yayımlanamaz sayar. O
                   filtre bu hücreye hiç bakmadı, çünkü `CategoryPage` üzerinden
                   yalnızca `technicalSpecs` üstünde çalışıyor, tablo başlıklarında
                   değil.
        
                   SÜTUN NEDEN SİLİNDİ, NEDEN YENİDEN ADLANDIRILMADI: değerleri
                   `Kavite × Çevrim/Saat` çarpımından ibaretti. Yani sütun kendi
                   başına hiçbir bilgi taşımıyordu; okuyucu aynı sayıya soldaki iki
                   sütundan zaten ulaşıyor. Bu dosyanın başındaki TAM SÜTUN KURALI ile
                   aynı gerekçe: bilgi taşımayan bir sütun nötralize edilmez, kaldırılır.
                   `Çevrim/Saat` KALIR — o kalıbın çevrim hızıdır, bir proses
                   parametresidir ve §0 `PRECISION_ENGINEERING`in koruduğu sınıftır. */
        headers: ["Kavite", "\xC7evrim/Saat", "Birim Maliyet", "Kal\u0131p Maliyeti", "\xD6nerilen Hacim"],
        rows: [
          ["Tek kavite", "60-120", "$$$", "$", "1-10.000 adet"],
          ["2 kavite", "60-120", "$$", "1.5\xD7", "10.000-50.000"],
          ["4 kavite", "50-100", "$$", "2\xD7", "50.000-200.000"],
          ["8 kavite", "40-80", "$", "3\xD7", "200.000-500.000"],
          ["16+ kavite", "30-60", "$", "4-5\xD7", "500.000+"]
        ]
      }
    ]
  },
  {
    slug: "basin\xE7li-dokum",
    category: "hizmetler",
    categoryLabel: "\xD6n \xDCretim",
    title: "Bas\u0131n\xE7l\u0131 D\xF6k\xFCm",
    heroImage: "hero-basincli-dokum",
    metaTitle: "Bas\u0131n\xE7l\u0131 D\xF6k\xFCm Kal\u0131p \u0130malat\u0131 | Al\xFCminyum & Zamak | Mas Technic",
    metaDescription: "120-1200 ton kapasitede al\xFCminyum ve \xE7inko bas\u0131n\xE7l\u0131 d\xF6k\xFCm kal\u0131b\u0131. 0.5mm min duvar kal\u0131nl\u0131\u011F\u0131, \xB10.05mm tolerans. Ak\u0131\u015F sim\xFClasyonu dahil.",
    description: "Al\xFCminyum ve \xE7inko ala\u015F\u0131mlar\u0131 ile karma\u015F\u0131k geometrileri tek par\xE7a olarak d\xF6k\xFCm. Y\xFCksek \xFCretim h\u0131z\u0131 ve d\xFC\u015F\xFCk birim maliyet avantaj\u0131.",
    content: [
      "120-1200 ton kilitleme kuvveti kapasitemiz ile geni\u015F par\xE7a yelpazesinde bas\u0131n\xE7l\u0131 d\xF6k\xFCm kal\u0131plar\u0131 tasarl\u0131yor ve \xFCretiyoruz. 0.5mm minimum duvar kal\u0131nl\u0131\u011F\u0131 ile ince duvarl\u0131 par\xE7alar, \xB10.05mm tolerans ile CT4-CT6 kalite s\u0131n\u0131f\u0131nda ve Ra 1.6-3.2 mikron y\xFCzey p\xFCr\xFCzl\xFCl\xFC\u011F\xFCnde sonu\xE7lar elde ediyoruz.",
      "ADC12 (Al-Si) 280 MPa genel ama\xE7l\u0131, A380 320 MPa y\xFCksek dayan\u0131ml\u0131, ZA-8 (Zn-Al) 350 MPa d\xF6k\xFCm somun ve ZA-27 420 MPa a\u011F\u0131r y\xFCk uygulamalar\u0131 i\xE7in optimize edilmi\u015F d\xF6k\xFCm ala\u015F\u0131mlar\u0131 ile \xE7al\u0131\u015F\u0131yoruz.",
      "Ak\u0131\u015F sim\xFClasyonu ile kal\u0131p tasar\u0131m\u0131n\u0131 optimize ediyor, al\xFCminyum, zamak ve magnezyum d\xF6k\xFCm kal\u0131plar\u0131 i\xE7in en uygun \xE7\xF6z\xFCm\xFC sunuyoruz."
    ],
    features: [
      "120-1200 Ton Kilitleme Kuvveti \u2014 Geni\u015F par\xE7a yelpazesi",
      "0.5mm Min Duvar Kal\u0131nl\u0131\u011F\u0131 \u2014 \u0130nce duvarl\u0131 par\xE7alar",
      "\xB10.05mm Tolerans \u2014 CT4-CT6 kalite s\u0131n\u0131f\u0131",
      "Y\xFCzey P\xFCr\xFCzl\xFCl\xFC\u011F\xFC \u2014 Ra 1.6-3.2 mikron"
    ],
    technicalSpecs: [
      { label: "Kilitleme Kuvveti", value: "120-1200 ton" },
      { label: "Min. Duvar Kal\u0131nl\u0131\u011F\u0131", value: "0.5mm" },
      { label: "Malzemeler", value: "ADC12, A380, ZA-8, ZA-27" },
      { label: "Kal\u0131p \xD6mr\xFC", value: "100K+ \xE7evrim" },
      { label: "Tolerans", value: "\xB10.05mm (CT4-CT6)" },
      { label: "Y\xFCzey Kalitesi", value: "Ra 1.6-3.2\xB5m" }
    ],
    processSteps: [
      "Par\xE7a Analizi",
      "Kal\u0131p Tasar\u0131m\u0131",
      "Ak\u0131\u015F Sim\xFClasyonu",
      "Kal\u0131p \xDCretimi",
      "Deneme D\xF6k\xFCm",
      "Seri \xDCretim"
    ],
    advantages: [
      "Geni\u015F ala\u015F\u0131m se\xE7ene\u011Fi (Al, Zn, Mg)",
      "Ak\u0131\u015F sim\xFClasyonu ile optimize tasar\u0131m",
      "\u0130nce duvarl\u0131 par\xE7a kapasitesi",
      "Y\xFCksek \xFCretim h\u0131z\u0131 ve d\xFC\u015F\xFCk birim maliyet"
    ],
    comparisonTables: [
      {
        title: "Bas\u0131n\xE7l\u0131 D\xF6k\xFCm Ala\u015F\u0131m Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Ala\u015F\u0131m", "\xC7ekme Dayan\u0131m\u0131", "Yo\u011Funluk", "D\xF6k\xFCm S\u0131cakl\u0131\u011F\u0131", "Min. Duvar", "Uygulama"],
        rows: [
          ["ADC12 (Al-Si)", "280 MPa", "2.74 g/cm\xB3", "640-680\xB0C", "0.8mm", "Genel ama\xE7, motor g\xF6vde"],
          ["A380 (Al-Si-Cu)", "320 MPa", "2.71 g/cm\xB3", "650-700\xB0C", "0.8mm", "Y\xFCksek dayan\u0131m, yap\u0131sal"],
          ["ZA-8 (Zn-Al)", "350 MPa", "6.3 g/cm\xB3", "420-440\xB0C", "0.5mm", "\u0130nce duvar, somun"],
          ["ZA-27 (Zn-Al)", "420 MPa", "5.0 g/cm\xB3", "440-480\xB0C", "0.75mm", "A\u011F\u0131r y\xFCk, rulman"],
          ["AZ91D (Mg)", "230 MPa", "1.81 g/cm\xB3", "620-650\xB0C", "1.0mm", "Hafif, elektronik muhafaza"]
        ]
      },
      {
        title: "D\xF6k\xFCm Kalite S\u0131n\u0131flar\u0131 (ISO 8062)",
        headers: ["Kalite S\u0131n\u0131f\u0131", "Boyut Tolerans\u0131", "Y\xFCzey Kalitesi", "G\xF6zeneklilik", "Maliyet", "Uygulama"],
        rows: [
          ["CT4", "\xB10.05mm", "Ra 0.8-1.6\xB5m", "\xC7ok d\xFC\u015F\xFCk", "$$$$", "Havac\u0131l\u0131k, medikal"],
          ["CT5", "\xB10.1mm", "Ra 1.6-3.2\xB5m", "D\xFC\u015F\xFCk", "$$$", "Otomotiv kritik"],
          ["CT6", "\xB10.2mm", "Ra 3.2-6.3\xB5m", "Orta", "$$", "Genel end\xFCstriyel"],
          ["CT7", "\xB10.3mm", "Ra 6.3-12.5\xB5m", "Kabul edilebilir", "$", "Dekoratif, yap\u0131sal"]
        ],
        highlight: 2
      }
    ]
  },
  {
    slug: "silikon-kaliplama",
    category: "hizmetler",
    categoryLabel: "\xD6n \xDCretim",
    title: "Silikon Kal\u0131plama",
    heroImage: "hero-silikon-kaliplama",
    metaTitle: "Silikon Kal\u0131plama | Vakumlu D\xF6k\xFCm | 1-100 Adet | Mas Technic",
    metaDescription: "Vakumlu silikon kal\u0131plama ile 1-100 adet k\u0131sa seri \xFCretim. PU, silikon, epoksi. Master modelden g\xF6zeneksiz y\xFCzeyli \xE7o\u011Faltma.",
    description: "Vakumlu silikon kal\u0131plama ile 1-100 adet aras\u0131 k\u0131sa seri \xFCretim. Master modelden g\xF6zeneksiz y\xFCzeyli \xE7o\u011Faltma.",
    content: [
      "Vakum alt\u0131nda d\xF6k\xFCm, kal\u0131p bo\u015Flu\u011Funda hava hapsini \xF6nleyerek g\xF6zeneksiz bir y\xFCzey verir. PU, silikon, polyester ve epoksi malzemelerle \xFCretim yap\u0131yor, pigment ile renk se\xE7ene\u011Fi sunuyoruz.",
      "PU 60A (60 Shore A, esnek ve y\u0131rt\u0131lmaz), PU 80A (80 Shore A, orta sertlik), PU 90A (90 Shore A, y\xFCksek dayan\u0131m) ve Silikon 40A (40 Shore A, y\xFCksek s\u0131cakl\u0131k dayan\u0131ml\u0131) malzeme se\xE7enekleri ile geni\u015F uygulama yelpazesine hizmet veriyoruz.",
      "Overmolding ile farkl\u0131 sertlikte malzemeleri birlikte kullanabiliyoruz. Medikal, otomotiv ve end\xFCstriyel uygulamalar i\xE7in \xF6zel silikon kal\u0131plama \xE7\xF6z\xFCmleri sunuyoruz. Termin; master modelin haz\u0131r olma durumuna, d\xF6k\xFCm adedine ve finisaj kapsam\u0131na g\xF6re teklifle birlikte verilir."
    ],
    features: [
      "Vakumlu D\xF6k\xFCm \u2014 hava hapsi olmadan g\xF6zeneksiz y\xFCzey",
      "\xC7e\u015Fitli Malzemeler \u2014 PU, silikon, polyester, epoksi",
      "Renk Se\xE7enekleri \u2014 Pigment ile istenilen renk",
      "Overmolding \u2014 Farkl\u0131 sertlikte malzemeler birlikte"
    ],
    technicalSpecs: [
      { label: "Shore Sertlik", value: "40A-90A" },
      { label: "Tolerans", value: "\xB10.05mm" },
      { label: "Malzeme", value: "PU, LSR, HTV, EPDM" },
      { label: "S\u0131cakl\u0131k Dayan\u0131m\u0131", value: "-60\xB0C / +300\xB0C" },
      { label: "Lot B\xFCy\xFCkl\xFC\u011F\xFC", value: "1-100 adet" }
    ],
    processSteps: [
      "Master Model Haz\u0131rl\u0131\u011F\u0131",
      "Silikon Kal\u0131p D\xF6k\xFCm\xFC",
      "Vakumlu D\xF6k\xFCm",
      "K\xFCrleme",
      "Kal\u0131ptan \xC7\u0131karma",
      "Kalite Kontrol"
    ],
    advantages: [
      "Master model onayland\u0131ktan sonra kal\u0131ptan h\u0131zl\u0131 \xE7o\u011Faltma",
      "1-100 adet k\u0131sa seri \xFCretim",
      "4 farkl\u0131 sertlik se\xE7ene\u011Fi",
      "Overmolding kapasitesi"
    ],
    comparisonTables: [
      {
        title: "Silikon Kal\u0131plama Malzeme Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Malzeme", "Shore Sertlik", "Uzama (%)", "S\u0131cakl\u0131k Aral\u0131\u011F\u0131", "Y\u0131rt\u0131lma Direnci", "Uygulama"],
        rows: [
          ["PU 60A", "60 Shore A", "450%", "-30\xB0C / +80\xB0C", "25 kN/m", "Esnek conta, tampon"],
          ["PU 80A", "80 Shore A", "350%", "-30\xB0C / +90\xB0C", "35 kN/m", "Tutamak, kapak"],
          ["PU 90A", "90 Shore A", "250%", "-20\xB0C / +100\xB0C", "45 kN/m", "Yap\u0131sal, y\xFCk ta\u015F\u0131yan"],
          ["Silikon 40A", "40 Shore A", "600%", "-60\xB0C / +300\xB0C", "20 kN/m", "Y\xFCksek s\u0131cakl\u0131k, medikal"],
          ["Silikon 70A", "70 Shore A", "400%", "-55\xB0C / +250\xB0C", "30 kN/m", "O-ring, conta, tu\u015F tak\u0131m\u0131"],
          ["Epoksi Re\xE7ine", "80 Shore D", "5%", "-40\xB0C / +120\xB0C", "Rijit", "Prototip, model"]
        ]
      },
      {
        title: "\xDCretim Y\xF6ntemi Kar\u015F\u0131la\u015Ft\u0131rmas\u0131 (K\u0131sa Seri)",
        /* 09a-C1 neutralised ONE cell of this "Teslimat" column — the CNC row's
           "3-5 gün" — and left "1-3 gün", "1-2 gün", "2-4 hafta" and "1-3 hafta"
           standing beside it. That was worse than what it replaced: a column in
           which one supplier row declines to give a number while its four
           neighbours give one reads as a caveat about CNC, not as a policy.
           09a-C2 removes the column. Nothing in `USER_INPUTS.md` authorises any
           of the five, and five identical "Teklifle birlikte" cells would carry
           no information. The method comparison — adet, maliyet, yüzey — is
           what this table is for and it survives intact. */
        headers: ["Y\xF6ntem", "Min. Adet", "Par\xE7a Maliyeti", "Kal\u0131p Maliyeti", "Y\xFCzey Kalitesi"],
        rows: [
          ["Vakumlu D\xF6k\xFCm", "1", "$$", "$", "\u0130yi (master'a ba\u011Fl\u0131)"],
          ["3D Bask\u0131 (SLA)", "1", "$$$", "Yok", "\xC7ok iyi"],
          ["CNC \u0130\u015Fleme", "1", "$$$$", "Yok", "M\xFCkemmel"],
          ["Silikon Enjeksiyon", "500+", "$", "$$$", "M\xFCkemmel"],
          ["S\u0131k\u0131\u015Ft\u0131rma Kal\u0131plama", "100+", "$$", "$$", "\u0130yi"]
        ]
      }
    ]
  },
  {
    slug: "fikstur-aparat-tasarimi",
    category: "hizmetler",
    categoryLabel: "\xD6n \xDCretim",
    title: "Fikst\xFCr & Aparat Tasar\u0131m\u0131",
    heroImage: "hero-fikstur-aparat",
    metaTitle: "Fikst\xFCr & Aparat Tasar\u0131m\u0131 | \xD6zel CNC Fikst\xFCr | Mas Technic",
    metaDescription: "CNC i\u015Fleme, montaj, kaynak ve kontrol i\xE7in \xF6zel fikst\xFCr tasar\u0131m\u0131. \xB10.01mm tekrarlanabilirlik. CATIA/SolidWorks ile 3D modelleme ve sim\xFClasyon.",
    description: "CNC i\u015Fleme, montaj, kaynak ve kontrol operasyonlar\u0131 i\xE7in \xF6zel tasar\u0131m fikst\xFCr ve aparat \xE7\xF6z\xFCmleri. Tekrarlanabilirlik ve operat\xF6r ba\u011F\u0131ms\u0131zl\u0131\u011F\u0131.",
    content: [
      "\xDCretim s\xFCre\xE7lerinizi h\u0131zland\u0131racak ve hassasiyeti art\u0131racak \xF6zel fikst\xFCr ve aparatlar tasarl\u0131yoruz. Torna fikst\xFCr\xFC (milliyelti ve milliyetsiz), freze fikst\xFCr\xFC (vise, vakumlu ve hidrolik), montaj fikst\xFCr\xFC (operat\xF6r hatalar\u0131n\u0131 \xF6nleme), kontrol fikst\xFCr\xFC (\xF6l\xE7\xFCm tekrarlanabilirli\u011Fi) ve kaynak fikst\xFCr\xFC (hizalama ve sabitleme) dahil geni\u015F yelpazede \xE7\xF6z\xFCmler sunuyoruz.",
      "CATIA ve SolidWorks ile 3D modelleme, kuvvet ve tolerans analizi sim\xFClasyonu, 3D bask\u0131 veya h\u0131zl\u0131 imalat ile prototip \xFCretimi ve \xFCretim ortam\u0131nda do\u011Frulama test & onay s\xFCre\xE7leri ile profesyonel tasar\u0131m hizmeti veriyoruz.",
      "\xC7elik, al\xFCminyum ve kompozit malzemelerle \xB10.01mm tekrarlanabilirlik sa\u011Flayan fikst\xFCrler \xFCretiyoruz. Tasar\u0131m ve \xFCretim termini; fikst\xFCr karma\u015F\u0131kl\u0131\u011F\u0131, malzeme tedariki ve do\u011Frulama kapsam\u0131 incelendikten sonra teklifle birlikte verilir."
    ],
    features: [
      "Torna Fikst\xFCr\xFC \u2014 Milliyelti ve milliyetsiz",
      "Freze Fikst\xFCr\xFC \u2014 Vise, vakumlu ve hidrolik",
      "Montaj Fikst\xFCr\xFC \u2014 Operat\xF6r hatalar\u0131n\u0131 \xF6nleme",
      "Kontrol Fikst\xFCr\xFC \u2014 \xD6l\xE7\xFCm tekrarlanabilirli\u011Fi",
      "Kaynak Fikst\xFCr\xFC \u2014 Hizalama ve sabitleme"
    ],
    technicalSpecs: [
      { label: "Tekrarlanabilirlik", value: "\xB10.01mm" },
      { label: "Malzeme", value: "\xC7elik, Al, Kompozit" },
      { label: "Termin", value: LEAD_TIME_SHORT },
      { label: "Do\u011Frulama", value: "\xDCretim ortam\u0131nda test" }
    ],
    processSteps: [
      "\u0130htiya\xE7 Analizi",
      "3D Modelleme (CATIA/SolidWorks)",
      "Sim\xFClasyon (Kuvvet & Tolerans)",
      "Prototip (3D Bask\u0131 / H\u0131zl\u0131 \u0130malat)",
      "CNC \u0130\u015Fleme & Montaj",
      "Test & Onay"
    ],
    advantages: [
      "CATIA/SolidWorks ile profesyonel tasar\u0131m",
      "Kuvvet ve tolerans sim\xFClasyonu",
      "3D bask\u0131 ile h\u0131zl\u0131 prototipleme",
      "\xDCretim ortam\u0131nda do\u011Frulama testi"
    ],
    comparisonTables: [
      {
        title: "Fikst\xFCr Tipi Se\xE7im Rehberi",
        headers: ["Fikst\xFCr Tipi", "Ba\u011Flama Kuvveti", "Tekrarlanabilirlik", "De\u011Fi\u015Fim S\xFCresi", "Maliyet", "Uygulama"],
        rows: [
          ["Mekanik Mengene", "10-50 kN", "\xB10.02mm", "1-2 dk", "$", "Genel frezeleme"],
          ["Hidrolik Ba\u011Flama", "20-100 kN", "\xB10.01mm", "10-20 sn", "$$$", "Seri \xFCretim, otomatik"],
          ["Pn\xF6matik Ba\u011Flama", "5-30 kN", "\xB10.01mm", "5-10 sn", "$$", "Hafif par\xE7alar, h\u0131zl\u0131"],
          ["Vakumlu Ba\u011Flama", "1-10 kN", "\xB10.01mm", "5 sn", "$$", "\u0130nce plaka, hassas"],
          ["Manyetik Tablo", "5-20 kN", "\xB10.01mm", "3 sn", "$$", "Ferromanyetik, ta\u015Flama"],
          ["Mod\xFCler Fikst\xFCr", "De\u011Fi\u015Fken", "\xB10.01mm", "15-30 dk", "$$$$", "\xC7ok ama\xE7l\u0131, esnek"]
        ],
        highlight: 1
      }
    ]
  },
  // ── Hizmetler > Yüzey İşlemleri ──
  {
    slug: "mekanik-yuzey-islemleri",
    category: "hizmetler",
    categoryLabel: "Y\xFCzey \u0130\u015Flemleri",
    title: "Mekanik Y\xFCzey \u0130\u015Flemleri",
    heroImage: "hero-mekanik-yuzey",
    metaTitle: "Mekanik Y\xFCzey \u0130\u015Flemleri | Kumlama & Parlatma | Mas Technic",
    metaDescription: "Kumlama, vibrasyonlu y\xFCzme, parlatma ve pasivasyon. Ra 0.05\xB5m y\xFCzey kalitesi. Ayna parlakl\u0131\u011F\u0131ndan satine y\xFCzeye kadar geni\u015F se\xE7enek.",
    description: "Kumlama, vibrasyonlu y\xFCzme, parlatma ve pasivasyon ile y\xFCzey kalitesini iyile\u015Ftirme ve montaja haz\u0131r hale getirme.",
    content: [
      "Mekanik y\xFCzey i\u015Flemleri ile par\xE7alar\u0131n\u0131z\u0131n y\xFCzey kalitesini istenen seviyeye getiriyoruz. Kumlama (shot blasting) ile temizleme ve y\xFCzey p\xFCr\xFCzlendirme, vibrasyonlu y\xFCzme (tumbling) ile k\xF6\u015Feli k\u0131s\u0131mlar\u0131 k\u0131rma, merkezsiz parlatma ile yuvarlak par\xE7alar i\xE7in y\xFCzey iyile\u015Ftirme, y\xFCzey parlatma ile ayna parlakl\u0131\u011F\u0131 ve f\u0131r\xE7alama ile satine y\xFCzey efekti elde ediyoruz.",
      "Cam kumu (0.1-0.5mm) ile hassas temizlik, al\xFCminyum oksit (0.2-1.0mm) ile y\xFCzey haz\u0131rl\u0131k, \xE7elik grit (0.2-2.0mm) ile a\u011F\u0131r temizlik ve soda (0.1-0.3mm) ile yumu\u015Fak temizlik gibi farkl\u0131 abrasive malzemelerle \xE7al\u0131\u015F\u0131yoruz.",
      "Ra 0.05\xB5m'e kadar y\xFCzey kalitesi, 2-8 bar kumlama bas\u0131nc\u0131 ve 1500\xD7800mm'ye kadar par\xE7a boyutu kapasitemiz ile geni\u015F bir hizmet yelpazesi sunuyoruz."
    ],
    features: [
      "Kumlama (Shot Blasting) \u2014 Temizleme ve y\xFCzey p\xFCr\xFCzlendirme",
      "Vibrasyonlu Y\xFCzme (Tumbling) \u2014 K\xF6\u015Feli k\u0131s\u0131mlar\u0131 k\u0131rma",
      "Merkezsiz Parlatma \u2014 Yuvarlak par\xE7alar i\xE7in",
      "Y\xFCzey Parlatma \u2014 Ayna parlakl\u0131\u011F\u0131",
      "F\u0131r\xE7alama \u2014 Satine y\xFCzey efekti"
    ],
    technicalSpecs: [
      { label: "Y\xFCzey Kalitesi", value: "Ra 0.05\xB5m'e kadar" },
      { label: "Kumlama Bas\u0131nc\u0131", value: "2-8 bar" },
      { label: "Parlatma Seviyesi", value: "Ayna parlakl\u0131\u011F\u0131" },
      { label: "Maks. Par\xE7a Boyutu", value: "1500\xD7800mm" }
    ],
    processSteps: [
      "Y\xFCzey Analizi",
      "\u0130\u015Flem Y\xF6ntemi Se\xE7imi",
      "Abrasive / Medya Se\xE7imi",
      "Y\xFCzey \u0130\u015Fleme",
      "Kalite Kontrol"
    ],
    advantages: [
      "4 farkl\u0131 abrasive malzeme se\xE7ene\u011Fi",
      "Ayna parlakl\u0131\u011F\u0131na kadar parlatma",
      "Montaja haz\u0131r y\xFCzey teslimat\u0131",
      "Geni\u015F par\xE7a boyutu kapasitesi"
    ],
    comparisonTables: [
      {
        title: "Mekanik Y\xFCzey \u0130\u015Flem Y\xF6ntemleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Y\xF6ntem", "Y\xFCzey Kalitesi (Ra)", "\u0130\u015Flem S\xFCresi", "Par\xE7a Boyutu", "Maliyet", "Uygulama"],
        rows: [
          ["Kumlama (Cam Kumu)", "Ra 1.6-3.2\xB5m", "5-15 dk", "1500\xD7800mm", "$", "Temizleme, p\xFCr\xFCzlendirme"],
          ["Kumlama (Al\u2082O\u2083)", "Ra 2.0-4.0\xB5m", "5-15 dk", "1500\xD7800mm", "$", "Boya \xF6ncesi haz\u0131rl\u0131k"],
          ["Vibrasyonlu Y\xFCzme", "Ra 0.4-1.6\xB5m", "30-120 dk", "K\xFC\xE7\xFCk par\xE7alar", "$", "\xC7apak alma, k\xF6\u015Fe k\u0131rma"],
          ["Merkezsiz Parlatma", "Ra 0.1-0.4\xB5m", "10-30 dk", "\xD85-100mm", "$$", "Mil, pim parlatma"],
          ["Mekanik Parlatma", "Ra 0.05-0.2\xB5m", "15-60 dk", "De\u011Fi\u015Fken", "$$$", "Ayna parlakl\u0131\u011F\u0131"],
          ["F\u0131r\xE7alama", "Ra 0.4-1.2\xB5m", "5-10 dk", "D\xFCz y\xFCzeyler", "$", "Satine efekt, dekoratif"]
        ]
      },
      {
        title: "Abrasive Medya Se\xE7im Tablosu",
        headers: ["Medya Tipi", "Tane Boyutu", "Sertlik", "Uygun Malzeme", "Etki"],
        rows: [
          ["Cam Kumu", "0.1-0.5mm", "Orta", "T\xFCm metaller", "Hassas temizlik, mat y\xFCzey"],
          ["Al\xFCminyum Oksit", "0.2-1.0mm", "Y\xFCksek", "\xC7elik, d\xF6kme demir", "Agresif temizlik, p\xFCr\xFCzlendirme"],
          ["\xC7elik Grit", "0.2-2.0mm", "\xC7ok y\xFCksek", "\xC7elik, d\xF6k\xFCm", "A\u011F\u0131r pas/kum temizleme"],
          ["Seramik Medya", "3-15mm", "Y\xFCksek", "T\xFCm metaller", "\xC7apak alma, y\xFCzey d\xFCzeltme"],
          ["Plastik Medya", "2-10mm", "D\xFC\u015F\xFCk", "Al\xFCminyum, plastik", "Nazik \xE7apak alma"],
          ["Ceviz Kabu\u011Fu", "0.5-2.0mm", "D\xFC\u015F\xFCk", "Yumu\u015Fak metaller", "Temizlik (boyut de\u011Fi\u015Fimi yok)"]
        ]
      }
    ]
  },
  {
    slug: "anodizasyon",
    category: "hizmetler",
    categoryLabel: "Y\xFCzey \u0130\u015Flemleri",
    title: "Anodizasyon",
    metaTitle: "Anodizasyon Hizmeti | Tip I-II-III Sert Anodizasyon | MIL-A-8625 | Mas Technic",
    /* PHASE 07 CORRECTION #1 — F2. `20+ renk seçeneği` was an offering /
       inventory count, structurally the same claim as `15+ alüminyum
       alaşımı` (removed in Phase 07) and `87+ malzeme` — §0
       DO_NOT_EMPHASIZE_COMPANY_SCALE, and no count is verified anywhere in
       `USER_INPUTS.md`. The colours themselves are a real offering and are
       still named; what goes is the number in front of them. ΔE ≤ 2.0 is a
       measured homogeneity tolerance and stays. */
    metaDescription: "Tip I, II ve III anodizasyon. 5-100\xB5m kaplama, 60-70 HRC sertlik, ASTM B117 tuz spreyi testi ile korozyon direnci do\u011Frulamas\u0131. Organik ve inorganik boyalarla renklendirme, havac\u0131l\u0131k ve medikal uygulamalar.",
    description: "Tip I kromik asit, Tip II s\xFClf\xFCrik asit ve Tip III sert anodizasyon ile korozyon direnci, a\u015F\u0131nma dayan\u0131m\u0131, elektriksel yal\u0131t\u0131m ve dekoratif kaplama.",
    heroImage: "hero-anodizasyon",
    content: [
      "Anodizasyon, al\xFCminyum y\xFCzeyinde elektrokimyasal y\xF6ntemle olu\u015Fturulan al\xFCminyum oksit (Al\u2082O\u2083) tabakas\u0131d\u0131r. Bu tabaka, par\xE7an\u0131n korozyon direncini, a\u015F\u0131nma dayan\u0131m\u0131n\u0131 ve estetik g\xF6r\xFCn\xFCm\xFCn\xFC \xF6nemli \xF6l\xE7\xFCde art\u0131r\u0131r. Mas Technic olarak havac\u0131l\u0131k ve medikal uygulamalar i\xE7in Tip I, Tip II ve Tip III anodizasyon hizmeti sunuyoruz.",
      "Tip I (Kromik Asit) anodizasyon 5-15\xB5m kal\u0131nl\u0131kta ince bir oksit tabakas\u0131 olu\u015Fturur; havac\u0131l\u0131k yap\u0131sal par\xE7alar\u0131 ve boya tutunma alt katman\u0131 olarak tercih edilir. Tip II (S\xFClf\xFCrik Asit) anodizasyon 10-25\xB5m kal\u0131nl\u0131kta olup en yayg\u0131n kullan\u0131lan t\xFCrd\xFCr; korozyon korumas\u0131, renkli kaplama ve genel m\xFChendislik uygulamalar\u0131nda idealdir. Tip III (Sert Anodizasyon) 25-100\xB5m kal\u0131nl\u0131kta, 60-70 HRC sertli\u011Fe ula\u015Farak a\u015F\u0131nma direnci, elektriksel yal\u0131t\u0131m ve y\xFCksek performans gerektiren uygulamalarda kullan\u0131l\u0131r.",
      "Renklendirme s\xFCrecimizde organik ve inorganik boyalar kullanarak siyah, k\u0131rm\u0131z\u0131, mavi, ye\u015Fil, alt\u0131n, bronz, mor, turuncu, sar\u0131, f\xFCme ve naturel (renksiz) renklerde kaplama yap\u0131yoruz; \xF6zel RAL ve Pantone e\u015Fle\u015Ftirmesi de m\xFCmk\xFCnd\xFCr. Renk homojenli\u011Fi \u0394E \u2264 2.0 tolerans\u0131nda kontrol edilmektedir. Sealing (s\u0131zd\u0131rmazl\u0131k) i\u015Flemi ile oksit tabakas\u0131n\u0131n g\xF6zenekleri kapat\u0131larak uzun \xF6m\xFCrl\xFC koruma sa\u011Flan\u0131r.",
      "Kalite kontrol s\xFCrecimiz: Eddy current veya mikrometre ile kaplama kal\u0131nl\u0131\u011F\u0131 \xF6l\xE7\xFCm\xFC, ASTM B117 tuz spreyi testi ile korozyon direnci do\u011Frulamas\u0131, Vickers mikrosertlik testi ile sertlik kontrol\xFC ve renk \xF6l\xE7\xFCm cihaz\u0131 ile \u0394E renk homojenli\u011Fi kontrol\xFC. Her parti i\xE7in \xF6l\xE7\xFCm kayd\u0131 tutulur.",
      "2000\xD71000\xD7800mm tank boyutlar\u0131m\u0131z ile b\xFCy\xFCk par\xE7alarda da anodizasyon uygulayabiliyoruz. 50 kg/par\xE7a maksimum a\u011F\u0131rl\u0131k kapasitesi ile havac\u0131l\u0131k, otomotiv, medikal, elektronik ve savunma sanayi sekt\xF6rlerine hizmet veriyoruz."
    ],
    features: [
      "Tip I (Kromik Asit) \u2014 5-15\xB5m, havac\u0131l\u0131k yap\u0131sal par\xE7alar, boya alt katman\u0131",
      "Tip II (S\xFClf\xFCrik Asit) \u2014 10-25\xB5m, korozyon korumas\u0131, renkli kaplama",
      "Tip III (Sert Anodizasyon) \u2014 25-100\xB5m, 60-70 HRC sertlik, a\u015F\u0131nma direnci",
      "Renklendirme \u2014 Organik ve inorganik boyalar, \u0394E \u2264 2.0 homojenlik",
      "Tip I / II / III \u2014 MIL-A-8625 kaplama s\u0131n\u0131flar\u0131",
      "ASTM B117 Tuz Testi \u2014 Korozyon direnci do\u011Frulamas\u0131"
    ],
    technicalSpecs: [
      { label: "Kaplama Kal\u0131nl\u0131\u011F\u0131", value: "5-100\xB5m" },
      { label: "Sertlik (Tip III)", value: "60-70 HRC" },
      { label: "Tuz Testi", value: "500+ saat (ASTM B117)" },
      { label: "Kaplama S\u0131n\u0131f\u0131", value: "MIL-A-8625 Tip I / II / III" },
      { label: "Tank Boyutu", value: "2000\xD71000\xD7800mm" },
      { label: "Renk Homojenli\u011Fi", value: "\u0394E \u2264 2.0" }
    ],
    processSteps: [
      "Y\xFCzey Temizli\u011Fi & Ya\u011F Giderme",
      "Da\u011Flama (Etching)",
      "Anodizasyon Banyosu",
      "Renklendirme (Opsiyonel)",
      "Sealing (S\u0131zd\u0131rmazl\u0131k)",
      "Kalite Kontrol & Raporlama"
    ],
    advantages: [
      "4 farkl\u0131 anodizasyon tipi (Tip I, II, III ve dekoratif)",
      "Tip I, Tip II ve Tip III kaplama s\u0131n\u0131flar\u0131",
      "ASTM B117 tuz testi ile korozyon direnci do\u011Frulamas\u0131",
      "Organik ve inorganik boyalarla dekoratif ve fonksiyonel kaplama",
      "2000\xD71000\xD7800mm tank boyutu ile b\xFCy\xFCk par\xE7a kapasitesi",
      "Termin, parti b\xFCy\xFCkl\xFC\u011F\xFC ve kaplama s\u0131n\u0131f\u0131na g\xF6re teklifle birlikte verilir",
      "Kaplama kal\u0131nl\u0131\u011F\u0131 ve sertlik \xF6l\xE7\xFCm\xFC ile kalite kontrol\xFC",
      "Havac\u0131l\u0131k, otomotiv, medikal ve savunma sekt\xF6r\xFC deneyimi"
    ],
    materials: [
      { name: "Al\xFCminyum 6061-T6", grade: "Al-Mg-Si ala\u015F\u0131m\u0131", properties: "En yayg\u0131n, m\xFCkemmel anodize uyumu, homojen renk" },
      { name: "Al\xFCminyum 7075-T6", grade: "Al-Zn-Mg ala\u015F\u0131m\u0131", properties: "Y\xFCksek dayan\u0131ml\u0131, anodize renk tonu farkl\u0131l\u0131\u011F\u0131 olabilir" },
      { name: "Al\xFCminyum 5083", grade: "Al-Mg ala\u015F\u0131m\u0131", properties: "Denizcilik s\u0131n\u0131f\u0131, iyi korozyon direnci" },
      { name: "Al\xFCminyum 2024-T3", grade: "Al-Cu ala\u015F\u0131m\u0131", properties: "Havac\u0131l\u0131k, bak\u0131r i\xE7eri\u011Fi renk homojenli\u011Fini etkileyebilir" },
      { name: "Titanyum Grade 2", grade: "Saf titanyum", properties: "Medikal ve havac\u0131l\u0131k, \xF6zel anodizasyon parametreleri" },
      { name: "Al\xFCminyum D\xF6k\xFCm (A356)", grade: "Al-Si-Mg d\xF6k\xFCm", properties: "D\xF6k\xFCm par\xE7alar, g\xF6zeneklilik anodize kalitesini etkiler" }
    ],
    faq: [
      { question: "Anodizasyon hangi metallere uygulanabilir?", answer: "Temel olarak al\xFCminyum ve ala\u015F\u0131mlar\u0131na uygulan\u0131r. Titanyum ve magnezyum da anodize edilebilir. En yayg\u0131n uygulama Al 6061 ve 7075 serisi ala\u015F\u0131mlard\u0131r." },
      { question: "Sert anodizasyon (Tip III) ile normal (Tip II) fark\u0131 nedir?", answer: "Tip III sert anodizasyon 25-100\xB5m kal\u0131nl\u0131kta olup 60-70 HRC sertlik sa\u011Flar, a\u015F\u0131nma direnci ve elektriksel yal\u0131t\u0131m gerekti\u011Finde tercih edilir. Tip II 10-25\xB5m olup genel korozyon korumas\u0131 ve dekoratif kaplama i\xE7in uygundur." },
      { question: "Anodizasyon boyut de\u011Fi\u015Fikli\u011Fine neden olur mu?", answer: "Evet, oksit tabakas\u0131n\u0131n yakla\u015F\u0131k %50'si malzemeye n\xFCfuz eder, %50'si y\xFCzeyden d\u0131\u015Far\u0131 b\xFCy\xFCr. \xD6rne\u011Fin 25\xB5m Tip II kaplama ~12.5\xB5m boyut art\u0131\u015F\u0131 yapar. Bu de\u011Fer i\u015Fleme toleranslar\u0131nda dikkate al\u0131nmal\u0131d\u0131r." },
      { question: "Hangi renklerde anodizasyon yapabiliyorsunuz?", answer: "Siyah, k\u0131rm\u0131z\u0131, mavi, ye\u015Fil, alt\u0131n, bronz, mor, turuncu, sar\u0131, f\xFCme ve naturel (renksiz) renklerde \xE7al\u0131\u015F\u0131yoruz. \xD6zel RAL ve Pantone renk e\u015Fle\u015Ftirmesi de yapabiliyoruz; renk homojenli\u011Fi \u0394E \u2264 2.0 tolerans\u0131nda kontrol edilir." },
      { question: "Kaplama ne kadar dayan\u0131kl\u0131d\u0131r?", answer: "Kaplamalar\u0131m\u0131z\u0131n korozyon direnci ASTM B117 tuz spreyi testi ile do\u011Frulan\u0131r. Sert anodizasyon ile \xE7elik sertli\u011Fine yak\u0131n a\u015F\u0131nma direnci elde edilir." },
      { question: "Anodizasyon teslimat s\xFCreniz ne kadar?", answer: `Termin parti b\xFCy\xFCkl\xFC\u011F\xFCne, kaplama s\u0131n\u0131f\u0131na ve renklendirme ad\u0131m\u0131n\u0131n olup olmamas\u0131na g\xF6re de\u011Fi\u015Fir. ${LEAD_TIME_STATEMENT}` }
    ],
    comparisonTables: [
      {
        title: "Anodizasyon Tipleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        description: "Uygulaman\u0131za en uygun anodizasyon tipini belirleyin",
        headers: ["\xD6zellik", "Tip I (Kromik Asit)", "Tip II (S\xFClf\xFCrik Asit)", "Tip III (Sert Anodizasyon)"],
        rows: [
          ["Kaplama Kal\u0131nl\u0131\u011F\u0131", "5-15\xB5m", "10-25\xB5m", "25-100\xB5m"],
          ["Sertlik", "200-400 HV", "200-400 HV", "400-600 HV (60-70 HRC)"],
          ["Korozyon Direnci (Tuz Testi)", "336+ saat", "500+ saat", "500+ saat"],
          ["Renklendirme", "S\u0131n\u0131rl\u0131", "Tam renk aral\u0131\u011F\u0131", "S\u0131n\u0131rl\u0131 (siyah, koyu tonlar)"],
          ["Elektriksel Yal\u0131t\u0131m", "Orta", "\u0130yi", "M\xFCkemmel (50V/\xB5m)"],
          ["A\u015F\u0131nma Direnci", "D\xFC\u015F\xFCk", "Orta", "Y\xFCksek (\xE7elik e\u015Fde\u011Feri)"],
          ["Uygun Uygulama", "Havac\u0131l\u0131k yap\u0131sal, boya alt\u0131", "Genel m\xFChendislik, dekoratif", "Silindir, piston, mil y\xFCzeyleri"],
          ["Standart", "MIL-A-8625 Tip I", "MIL-A-8625 Tip II", "MIL-A-8625 Tip III"],
          ["Maliyet", "$", "$$", "$$$"]
        ]
      },
      {
        title: "Al\xFCminyum Ala\u015F\u0131mlar\u0131n\u0131n Anodize Uyumlulu\u011Fu",
        description: "Ala\u015F\u0131m se\xE7iminin anodizasyon kalitesi \xFCzerindeki etkisi",
        headers: ["Ala\u015F\u0131m", "Anodize Uyumu", "Renk Homojenli\u011Fi", "Kaplama Kalitesi", "\xD6nerilen Tip", "Notlar"],
        rows: [
          ["6061-T6", "\u2605\u2605\u2605\u2605\u2605", "M\xFCkemmel", "Homojen, p\xFCr\xFCzs\xFCz", "Tip I, II, III", "En yayg\u0131n, ideal anodize malzemesi"],
          ["7075-T6", "\u2605\u2605\u2605\u2605\u2606", "\u0130yi", "Hafif ton fark\u0131 olabilir", "Tip II, III", "Zn i\xE7eri\u011Fi renk tonunu etkileyebilir"],
          ["5083", "\u2605\u2605\u2605\u2605\u2606", "\u0130yi", "Homojen", "Tip II", "Denizcilik, iyi korozyon direnci"],
          ["2024-T3", "\u2605\u2605\u2605\u2606\u2606", "Orta", "Bak\u0131r \xE7izgileri g\xF6r\xFClebilir", "Tip I, II", "Cu i\xE7eri\u011Fi renk homojenli\u011Fini bozabilir"],
          ["A356 (D\xF6k\xFCm)", "\u2605\u2605\u2606\u2606\u2606", "D\xFC\u015F\xFCk", "G\xF6zenekli, d\xFCzensiz", "Tip II", "D\xF6k\xFCm kalitesi kritik, \xF6n i\u015Flem gerekir"],
          ["MIC-6 (D\xF6k\xFCm)", "\u2605\u2605\u2605\u2606\u2606", "Orta", "Kabul edilebilir", "Tip II", "Hassas d\xF6k\xFCm plakalar i\xE7in uygun"]
        ]
      },
      {
        title: "Kaplama Sonras\u0131 Boyut De\u011Fi\u015Fimi Hesaplama",
        description: "\u0130\u015Fleme toleranslar\u0131n\u0131 planlarken kaplama pay\u0131n\u0131 hesaba kat\u0131n",
        headers: ["Anodizasyon Tipi", "Kaplama Kal\u0131nl\u0131\u011F\u0131", "Y\xFCzeye Eklenen", "Malzemeye N\xFCfuz", "Net Boyut Art\u0131\u015F\u0131 (\xE7ap)", "Tolerans Etkisi"],
        rows: [
          ["Tip I", "10\xB5m", "~5\xB5m", "~5\xB5m", "+10\xB5m", "\xB13\xB5m"],
          ["Tip II (Standart)", "20\xB5m", "~10\xB5m", "~10\xB5m", "+20\xB5m", "\xB15\xB5m"],
          ["Tip II (Kal\u0131n)", "25\xB5m", "~12.5\xB5m", "~12.5\xB5m", "+25\xB5m", "\xB15\xB5m"],
          ["Tip III (\u0130nce)", "25\xB5m", "~12.5\xB5m", "~12.5\xB5m", "+25\xB5m", "\xB18\xB5m"],
          ["Tip III (Standart)", "50\xB5m", "~25\xB5m", "~25\xB5m", "+50\xB5m", "\xB110\xB5m"],
          ["Tip III (Kal\u0131n)", "75\xB5m", "~37.5\xB5m", "~37.5\xB5m", "+75\xB5m", "\xB115\xB5m"]
        ]
      }
    ]
  },
  {
    slug: "kimyasal-islemler",
    category: "hizmetler",
    categoryLabel: "Y\xFCzey \u0130\u015Flemleri",
    title: "Kimyasal \u0130\u015Flemler",
    heroImage: "hero-kimyasal-islemler",
    metaTitle: "Kimyasal Y\xFCzey \u0130\u015Flemleri | Pasivasyon & Fosfatlama | Mas Technic",
    metaDescription: "End\xFCstriyel ya\u011F giderme, pasivasyon, fosfatlama ve elektropolish. ASTM B117 tuz spreyi ve ASTM A967 pasivasyon test y\xF6ntemleri ile do\u011Frulama.",
    description: "Ya\u011F giderme, pasivasyon, fosfatlama ve elektropolish ile y\xFCzey temizli\u011Fi ve sonraki i\u015Flemlere haz\u0131rl\u0131k.",
    content: [
      "Kimyasal y\xFCzey i\u015Flemleri ile par\xE7alar\u0131n\u0131z\u0131n korozyon direncini art\u0131r\u0131yoruz. End\xFCstriyel y\u0131kama ve ultrasonik ya\u011F giderme, paslanmaz \xE7elik korozyon korumas\u0131 i\xE7in pasivasyon, boya tutunmas\u0131 i\xE7in fosfatlama y\xFCzey haz\u0131rl\u0131\u011F\u0131, paslanmaz \xE7elik parlatma i\xE7in elektropolish ve k\xF6\u015Feli k\u0131s\u0131mlar\u0131 yumu\u015Fatma i\xE7in deburring i\u015Flemleri ger\xE7ekle\u015Ftiriyoruz.",
      "ASTM B117 tuz spreyi ve ASTM A967 pasivasyon test y\xF6ntemleri ile do\u011Frulama yap\u0131yoruz; kaplama kal\u0131nl\u0131\u011F\u0131 1-25\xB5m aral\u0131\u011F\u0131ndad\u0131r."
    ],
    features: [
      "Ya\u011F Giderme \u2014 End\xFCstriyel y\u0131kama, ultrasonik",
      "Pasivasyon \u2014 Paslanmaz \xE7elik korozyon korumas\u0131",
      "Fosfatlama \u2014 Boya tutunmas\u0131 i\xE7in y\xFCzey haz\u0131rl\u0131\u011F\u0131",
      "Elektropolish \u2014 Paslanmaz \xE7elik parlatma",
      "Deburring \u2014 K\xF6\u015Feli k\u0131s\u0131mlar\u0131 yumu\u015Fatma"
    ],
    technicalSpecs: [
      { label: "Tuz Testi", value: "500+ saat" },
      { label: "Kaplama Kal\u0131nl\u0131\u011F\u0131", value: "1-25\xB5m" },
      { label: "Test Y\xF6ntemi", value: "ASTM B117 tuz spreyi" },
      { label: "Pasivasyon", value: "ASTM A967" }
    ],
    processSteps: [
      "Y\xFCzey Analizi",
      "\xD6n Temizlik",
      "Kimyasal \u0130\u015Flem",
      "Durulama",
      "Kurutma & Kontrol"
    ],
    advantages: [
      "500+ saat tuz testi dayan\u0131m\u0131",
      /* Was "ASTM standartlarına tam uyum". Claiming full conformity to an
         entire standards body is broader than claiming it against one numbered
         spec — and the numbered version of this same sentence was removed from
         this page two commits ago. The page's own content line already names
         what actually happens: the two test methods. */
      "Tuz spreyi ve pasivasyon test y\xF6ntemleriyle do\u011Frulama",
      "Ultrasonik temizlik kapasitesi",
      "Sonraki i\u015Flemlere haz\u0131r y\xFCzey"
    ],
    comparisonTables: [
      {
        title: "Kimyasal Y\xFCzey \u0130\u015Flem Y\xF6ntemleri",
        headers: ["\u0130\u015Flem", "Uygulanan Malzeme", "Kaplama/Etki", "Korozyon Direnci", "Standart", "Uygulama"],
        rows: [
          ["Pasivasyon (Nitrik)", "Paslanmaz \xE7elik", "Krom oksit tabaka", "500+ saat", "ASTM A967", "Medikal, g\u0131da"],
          ["Pasivasyon (Sitrik)", "Paslanmaz \xE7elik", "Krom oksit tabaka", "500+ saat", "ASTM A967", "\xC7evreci alternatif"],
          ["Fosfatlama (\xC7inko)", "\xC7elik", "5-15\xB5m \xE7inko fosfat", "200+ saat", "MIL-DTL-16232", "Boya alt\u0131 haz\u0131rl\u0131k"],
          ["Fosfatlama (Mangan)", "\xC7elik", "5-25\xB5m mangan fosfat", "150+ saat", "MIL-DTL-16232", "A\u015F\u0131nma direnci, ya\u011F tutma"],
          ["Elektropolish", "Paslanmaz \xE7elik", "Y\xFCzey d\xFCzeltme", "750+ saat", "ASTM B912", "Medikal, g\u0131da, optik"],
          ["Alodine (Chromate)", "Al\xFCminyum", "0.5-4\xB5m d\xF6n\xFC\u015F\xFCm", "168+ saat", "MIL-DTL-5541", "Boya alt\u0131, iletkenlik"]
        ]
      }
    ]
  },
  {
    slug: "boya-koruyucu-kaplamalar",
    category: "hizmetler",
    categoryLabel: "Y\xFCzey \u0130\u015Flemleri",
    title: "Boya & Koruyucu Kaplamalar",
    heroImage: "hero-boya-kaplama",
    metaTitle: "Toz Boya & Koruyucu Kaplamalar | RAL Renkler | Mas Technic",
    metaDescription: "Toz boya, \u0131slak boya, seramik ve PTFE kaplama. 1000+ saat tuz testi, 260\xB0C s\u0131cakl\u0131k dayan\u0131m\u0131. RAL standart ve \xF6zel renkler.",
    description: "Toz boya, \u0131slak boya, seramik kaplama ve \xF6zel koruyucu kaplamalar. End\xFCstriyel uygulamalardan dekoratif y\xFCzeylere kadar.",
    content: [
      "Toz boya (60-120\xB5m, \xE7evre dostu ve dayan\u0131kl\u0131), \u0131slak boya (25-50\xB5m, d\xFCzg\xFCn y\xFCzey), seramik kaplama (50-100\xB5m, y\xFCksek s\u0131cakl\u0131k dayan\u0131m\u0131) ve E-kap (20-40\xB5m, elektriksel yal\u0131t\u0131m) olmak \xFCzere 4 farkl\u0131 boya t\xFCr\xFC ile hizmet veriyoruz.",
      "RAL 9005 (Siyah), 9010 (Beyaz), 9006 (Gri), 3000 (K\u0131rm\u0131z\u0131), 5015 (Mavi), 6018 (Ye\u015Fil), 1003 (Sar\u0131), 2004 (Turuncu) ve \xF6zel RAL renkleri dahil geni\u015F renk yelpazesi sunuyoruz. 1000+ saat tuz testi dayan\u0131m\u0131 ve 260\xB0C PTFE s\u0131cakl\u0131k dayan\u0131m\u0131 ile \xFCst\xFCn koruma sa\u011Fl\u0131yoruz."
    ],
    features: [
      "Toz Boya \u2014 60-120\xB5m, \xE7evre dostu ve dayan\u0131kl\u0131",
      "Islak Boya \u2014 25-50\xB5m, d\xFCzg\xFCn y\xFCzey",
      "Seramik Kaplama \u2014 50-100\xB5m, y\xFCksek s\u0131cakl\u0131k",
      "E-Kap \u2014 20-40\xB5m, elektriksel yal\u0131t\u0131m"
    ],
    technicalSpecs: [
      { label: "Kaplama Kal\u0131nl\u0131\u011F\u0131", value: "20-120\xB5m" },
      { label: "S\u0131cakl\u0131k Dayan\u0131m\u0131", value: "260\xB0C (PTFE)" },
      { label: "S\xFCrt\xFCnme Katsay\u0131s\u0131", value: "0.05 (PTFE)" },
      { label: "Tuz Testi", value: "1000+ saat" }
    ],
    processSteps: [
      "Y\xFCzey Haz\u0131rl\u0131\u011F\u0131",
      "Astar Uygulama",
      "Boya / Kaplama",
      "F\u0131r\u0131nlama / K\xFCrleme",
      "Kalite Kontrol"
    ],
    advantages: [
      "4 farkl\u0131 boya/kaplama t\xFCr\xFC",
      "RAL standart ve \xF6zel renkler",
      "1000+ saat tuz testi dayan\u0131m\u0131",
      "260\xB0C s\u0131cakl\u0131k dayan\u0131ml\u0131 PTFE kaplama"
    ],
    comparisonTables: [
      {
        title: "Boya & Kaplama T\xFCrleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Kaplama T\xFCr\xFC", "Kal\u0131nl\u0131k", "S\u0131cakl\u0131k Dayan\u0131m\u0131", "Tuz Testi", "S\xFCrt\xFCnme Kats.", "Uygulama"],
        rows: [
          ["Toz Boya (Polyester)", "60-120\xB5m", "180\xB0C", "1000+ saat", "0.30-0.40", "D\u0131\u015F mekan, dekoratif"],
          ["Toz Boya (Epoksi)", "60-100\xB5m", "120\xB0C", "1500+ saat", "0.35-0.45", "\u0130\xE7 mekan, kimyasal direnci"],
          ["Islak Boya (2K PU)", "25-50\xB5m", "130\xB0C", "500+ saat", "0.30-0.40", "D\xFCzg\xFCn y\xFCzey, ince kaplama"],
          ["Seramik Kaplama", "50-100\xB5m", "1000\xB0C", "2000+ saat", "0.15-0.25", "Egzoz, motor, y\xFCksek s\u0131cakl\u0131k"],
          ["PTFE (Teflon)", "15-40\xB5m", "260\xB0C", "500+ saat", "0.05-0.10", "Yap\u0131\u015Fmazl\u0131k, d\xFC\u015F\xFCk s\xFCrt\xFCnme"],
          ["E-Kap (Elektro Kaplama)", "20-40\xB5m", "150\xB0C", "1000+ saat", "0.35-0.45", "Otomotiv, elektrik yal\u0131t\u0131m"],
          ["DLC (Diamond-Like)", "1-5\xB5m", "350\xB0C", "5000+ saat", "0.05-0.15", "A\u015F\u0131nma, medikal, uzay"]
        ]
      }
    ]
  },
  // ── Hizmetler > İşaretleme & Tanımlama ──
  {
    slug: "lazer-kazima",
    category: "hizmetler",
    categoryLabel: "\u0130\u015Faretleme & Tan\u0131mlama",
    title: "Lazer Kaz\u0131ma",
    metaTitle: "Lazer Kaz\u0131ma & \u0130\u015Faretleme | Fiber Lazer | QR Kod | Mas Technic",
    metaDescription: "20W-100W fiber lazer ile metal, plastik ve ah\u015Fapta kal\u0131c\u0131 i\u015Faretleme. Barkod, QR kod, seri numaras\u0131. 100.000 saat lazer \xF6mr\xFC, 10.000 mm/s h\u0131z.",
    description: "Fiber lazer teknolojisi ile metal, plastik ve kompozit malzemelere y\xFCksek kontrastl\u0131, a\u015F\u0131nmaz i\u015Faretleme. Barkod, QR kod ve seri numaras\u0131.",
    heroImage: "hero-lazer-kazima",
    content: [
      "20W-100W g\xFC\xE7 aral\u0131\u011F\u0131nda fiber lazer sistemlerimiz ile 100\xD7100mm i\u015Faretleme alan\u0131nda, 0.1mm minimum karakter boyutunda ve 10.000 mm/s h\u0131zda y\xFCksek performansl\u0131 i\u015Faretleme yap\u0131yoruz. 0.01-0.5mm kaz\u0131ma derinli\u011Fi kontrol\xFC ile hassas sonu\xE7lar elde ediyoruz.",
      "100.000 saat fiber lazer \xF6mr\xFC ile uzun vadeli g\xFCvenilirlik sa\u011Fl\u0131yoruz. \xC7elik, al\xFCminyum, plastik ve ah\u015Fap dahil \xE7ok malzemeli i\u015Faretleme kapasitemiz ve dinamik i\u015Faretleme \xF6zelli\u011Fimiz ile yuvarlak par\xE7alarda da m\xFCkemmel sonu\xE7lar elde ediyoruz.",
      "Seri numaras\u0131 ve parti kodu, barkod ve QR kod, logo ve marka, teknik \xF6zellikler ve standartlar ile tarih ve \xFCretim kodu i\u015Faretleme hizmetleri sunuyoruz."
    ],
    features: [
      "0.01mm Kaz\u0131ma Derinli\u011Fi \u2014 Hassas kontrol",
      "100.000 Saat Lazer \xD6mr\xFC \u2014 Fiber kaynak",
      "\xC7ok Malzeme \u2014 \xC7elik, al\xFCminyum, plastik, ah\u015Fap",
      "Dinamik \u0130\u015Faretleme \u2014 Yuvarlak par\xE7alar i\xE7in"
    ],
    technicalSpecs: [
      { label: "Lazer G\xFCc\xFC", value: "20W-100W" },
      { label: "\u0130\u015Faretleme Alan\u0131", value: "100\xD7100mm" },
      { label: "Min. Karakter", value: "0.1mm" },
      { label: "H\u0131z", value: "10.000 mm/s" },
      { label: "Kaz\u0131ma Derinli\u011Fi", value: "0.01-0.5mm" }
    ],
    processSteps: [
      "Tasar\u0131m & Programlama",
      "Malzeme Analizi",
      "Parametre Ayarlama",
      "Lazer \u0130\u015Faretleme",
      "Okuma Do\u011Frulama"
    ],
    advantages: [
      "100.000 saat fiber lazer \xF6mr\xFC",
      "10.000 mm/s i\u015Faretleme h\u0131z\u0131",
      "\xC7oklu malzeme deste\u011Fi",
      "Dinamik (yuvarlak par\xE7a) i\u015Faretleme"
    ],
    comparisonTables: [
      {
        title: "Lazer \u0130\u015Faretleme Teknoloji Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Lazer Tipi", "Dalga Boyu", "G\xFC\xE7 Aral\u0131\u011F\u0131", "Uygun Malzeme", "H\u0131z", "Uygulama"],
        rows: [
          ["Fiber Lazer", "1064nm", "20-100W", "Metal, plastik", "10.000 mm/s", "Genel ama\xE7, seri \xFCretim"],
          ["CO\u2082 Lazer", "10.600nm", "10-60W", "Ah\u015Fap, plastik, deri", "5.000 mm/s", "Organik malzeme, ambalaj"],
          ["UV Lazer", "355nm", "3-15W", "Plastik, cam, silikon", "3.000 mm/s", "Hassas, \u0131s\u0131ya duyarl\u0131"],
          ["Ye\u015Fil Lazer", "532nm", "5-20W", "Bak\u0131r, alt\u0131n, PCB", "5.000 mm/s", "Yans\u0131t\u0131c\u0131 metaller"],
          ["MOPA Fiber", "1064nm", "20-60W", "Metal (renkli)", "8.000 mm/s", "Renkli i\u015Faretleme, paslanmaz"]
        ],
        highlight: 0
      },
      {
        title: "Malzeme Bazl\u0131 Lazer \u0130\u015Faretleme Parametreleri",
        headers: ["Malzeme", "\xD6nerilen Lazer", "G\xFC\xE7", "H\u0131z", "Kontrast", "Notlar"],
        rows: [
          ["Paslanmaz \xC7elik", "Fiber / MOPA", "20-50W", "500-2000 mm/s", "Y\xFCksek", "Siyah oksit veya beyaz tavlama"],
          ["Al\xFCminyum", "Fiber", "30-60W", "800-3000 mm/s", "Orta-Y\xFCksek", "Eloksal \xFCzeri m\xFCkemmel"],
          ["Titanyum", "Fiber / MOPA", "20-40W", "300-1500 mm/s", "Y\xFCksek", "Renkli tavlama m\xFCmk\xFCn"],
          ["ABS Plastik", "Fiber / UV", "5-20W", "1000-5000 mm/s", "Orta", "Renk de\u011Fi\u015Fimi ile"],
          ["Cam", "UV / CO\u2082", "3-10W", "200-800 mm/s", "Orta", "Mikro \xE7atlak tekni\u011Fi"],
          ["Sertle\u015Ftirilmi\u015F \xC7elik", "Fiber", "30-80W", "300-1000 mm/s", "\xC7ok y\xFCksek", "Derin kaz\u0131ma m\xFCmk\xFCn"]
        ]
      }
    ]
  },
  {
    slug: "tavlama",
    category: "hizmetler",
    categoryLabel: "\u0130\u015Faretleme & Tan\u0131mlama",
    title: "Tavlama",
    heroImage: "hero-tavlama",
    description: "Stress giderme, yumu\u015Fatma, sertle\u015Ftirme ve normalizasyon tavlama i\u015Flemleri ile malzeme mekanik \xF6zelliklerinin optimize edilmesi.",
    content: [
      "Stress giderme tavlamas\u0131 (550-650\xB0C, gerilme giderme), yumu\u015Fatma tavlamas\u0131 (680-720\xB0C, i\u015Flenebilirlik art\u0131rma), sertle\u015Ftirme tavlamas\u0131 (800-900\xB0C, sertlik art\u0131\u015F\u0131) ve normalizasyon tavlamas\u0131 (850-950\xB0C, tane inceltme) olmak \xFCzere 4 farkl\u0131 tavlama t\xFCr\xFC sunuyoruz.",
      "\xD6zellikle paslanmaz \xE7elik ve titanyum par\xE7alarda tercih edilen lazer tavlama y\xF6ntemimiz ile y\xFCzeyde malzeme \xE7\u0131karmadan renk de\u011Fi\u015Fimi yaparak i\u015Faretleme ger\xE7ekle\u015Ftiriyoruz. Y\xFCzey b\xFCt\xFCnl\xFC\u011F\xFC korunarak alt\u0131n, mavi ve siyah tonlar\u0131nda renk de\u011Fi\u015Fimi sa\u011Fl\u0131yoruz."
    ],
    features: [
      "Stress Giderme \u2014 550-650\xB0C, gerilme giderme",
      "Yumu\u015Fatma \u2014 680-720\xB0C, i\u015Flenebilirlik art\u0131rma",
      "Sertle\u015Ftirme \u2014 800-900\xB0C, sertlik art\u0131\u015F\u0131",
      "Normalizasyon \u2014 850-950\xB0C, tane inceltme"
    ],
    technicalSpecs: [
      { label: "Y\xFCzey Etkisi", value: "S\u0131f\u0131r derinlik" },
      { label: "Renk Aral\u0131\u011F\u0131", value: "Alt\u0131n-Mavi-Siyah" },
      { label: "Uygunluk", value: "Medikal par\xE7a" },
      { label: "Dayan\u0131kl\u0131l\u0131k", value: "Kal\u0131c\u0131" }
    ],
    processSteps: [
      "Malzeme Analizi",
      "Tavlama T\xFCr\xFC Se\xE7imi",
      "F\u0131r\u0131n / Lazer \u0130\u015Flemi",
      "So\u011Futma Kontrol\xFC",
      "Sertlik & Mikro Yap\u0131 Testi"
    ],
    advantages: [
      "4 farkl\u0131 tavlama t\xFCr\xFC",
      "Lazer tavlama ile y\xFCzey b\xFCt\xFCnl\xFC\u011F\xFC korumas\u0131",
      "Medikal par\xE7a uygunlu\u011Fu",
      "Kal\u0131c\u0131 ve a\u015F\u0131nmaz renk de\u011Fi\u015Fimi"
    ],
    comparisonTables: [
      {
        title: "Tavlama T\xFCrleri ve Parametreleri",
        headers: ["Tavlama T\xFCr\xFC", "S\u0131cakl\u0131k Aral\u0131\u011F\u0131", "So\u011Futma", "Sertlik De\u011Fi\u015Fimi", "Ama\xE7", "Uygulama"],
        rows: [
          ["Stress Giderme", "550-650\xB0C", "F\u0131r\u0131nda yava\u015F", "De\u011Fi\u015Fmez", "\u0130\xE7 gerilme giderme", "CNC sonras\u0131, kaynak sonras\u0131"],
          ["Yumu\u015Fatma", "680-720\xB0C", "F\u0131r\u0131nda \xE7ok yava\u015F", "D\xFC\u015Fer (150-200 HB)", "\u0130\u015Flenebilirlik art\u0131rma", "Sert \xE7eliklerin i\u015Flenmesi"],
          ["Normalizasyon", "850-950\xB0C", "Havada", "Homojenle\u015Fir", "Tane inceltme", "D\xF6k\xFCm, d\xF6vme sonras\u0131"],
          ["Tam Tavlama", "800-900\xB0C", "F\u0131r\u0131nda yava\u015F", "D\xFC\u015Fer (min.)", "Tam yumu\u015Fatma", "So\u011Fuk \u015Fekillendirme \xF6ncesi"],
          ["Sementasyon", "880-940\xB0C", "Ya\u011F/su", "Y\xFCzey 58-62 HRC", "Y\xFCzey sertle\u015Ftirme", "Di\u015Fli, mil, kam"],
          ["\u0130nd\xFCksiyon", "850-1000\xB0C", "Su/polimer", "Y\xFCzey 50-60 HRC", "Lokal sertle\u015Ftirme", "Mil yata\u011F\u0131, kam y\xFCzeyi"]
        ]
      }
    ]
  },
  {
    slug: "qr-datamatrix-kodlari",
    category: "hizmetler",
    categoryLabel: "\u0130\u015Faretleme & Tan\u0131mlama",
    title: "QR & DataMatrix Kodlar\u0131",
    heroImage: "hero-qr-datamatrix",
    description: "DataMatrix ve QR kod i\u015Faretleme. K\xFC\xE7\xFCk alanda y\xFCksek veri kapasitesi ile kal\u0131c\u0131 par\xE7a izlenebilirli\u011Fi.",
    content: [
      "DataMatrix (2.5\xD72.5mm alanda 50 karakter), QR Code (5\xD75mm alanda 500 karakter) ve GS1-128 barkod formatlar\u0131nda end\xFCstriyel izlenebilirlik i\xE7in kal\u0131c\u0131 kod i\u015Faretleme hizmeti sunuyoruz.",
      "UID (Unique Identifier), GS1-128 Barkod, HIBC (Health Industry Bar Code) ve DoD IUID (Item Unique Identification) kodlama se\xE7enekleri ile par\xE7a takibi, kalite kontrol ve envanter y\xF6netimi \xE7\xF6z\xFCmleri sa\u011Fl\u0131yoruz. \u0130\u015Faretlenen kodlar\u0131n okunabilirli\u011Fi, teslimattan \xF6nce okuma do\u011Frulamas\u0131yla kontrol edilir."
    ],
    features: [
      "DataMatrix \u2014 2.5\xD72.5mm'de 50 karakter",
      "QR Code \u2014 5\xD75mm'de 500 karakter",
      "GS1-128 Barkod \u2014 Standart barkod",
      "IUID Kodlama \u2014 Savunma sanayi izlenebilirlik"
    ],
    technicalSpecs: [
      { label: "Min. Mod\xFCl Boyutu", value: "0.1mm" },
      { label: "Okuma Oran\u0131", value: "%99.9+" },
      { label: "Sembol", value: "DataMatrix (ISO/IEC 16022)" },
      { label: "Do\u011Frulama", value: "ISO 15415" }
    ],
    processSteps: [
      "Kod T\xFCr\xFC Se\xE7imi",
      "Veri Giri\u015Fi & Format",
      "Lazer \u0130\u015Faretleme",
      "Okuma Do\u011Frulama",
      /* Was "ISO Uyum Raporu" — a conformity report against a standards body
         with no designation, which is the same claim as the bullet below and
         was invisible to the gate for the same reason. What the step produces
         is a read-quality record. */
      "Okuma Kalitesi Raporu"
    ],
    advantages: [
      "K\xFC\xE7\xFCk alanda y\xFCksek veri kapasitesi",
      "%99.9+ okuma oran\u0131",
      /* Was "ISO/IEC standartlarına tam uyum" — see the ASTM bullet on the
         chemical-processing page. The numbered version of this sentence
         (ISO/IEC 16022, ISO 15415) was already rewritten to read-verification;
         the unbounded version survived on the same page. */
      "Lazer i\u015Faretleme sonras\u0131 okuma do\u011Frulamas\u0131",
      "Savunma sanayi IUID deste\u011Fi"
    ],
    comparisonTables: [
      {
        title: "End\xFCstriyel Kod T\xFCrleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Kod T\xFCr\xFC", "Veri Kapasitesi", "Min. Alan", "Hata D\xFCzeltme", "Okuma Mesafesi", "Uygulama"],
        rows: [
          ["DataMatrix (ECC200)", "2.335 alfan\xFCmerik", "2.5\xD72.5mm", "%30 (Reed-Solomon)", "Yak\u0131n (50cm)", "K\xFC\xE7\xFCk par\xE7a, havac\u0131l\u0131k"],
          ["QR Code", "4.296 alfan\xFCmerik", "5\xD75mm", "%30 (Level H)", "Uzak (2m+)", "Genel, mobil okuma"],
          ["GS1-128 Barkod", "48 karakter", "25\xD710mm", "D\xFC\u015F\xFCk", "Uzak (1m)", "Lojistik, stok y\xF6netimi"],
          ["Micro QR", "35 alfan\xFCmerik", "3\xD73mm", "%15", "Yak\u0131n (30cm)", "\xC7ok k\xFC\xE7\xFCk par\xE7alar"],
          ["PDF417", "1.850 alfan\xFCmerik", "15\xD75mm", "%50", "Orta (1m)", "Belge, sertifika"],
          ["UID / IUID", "De\u011Fi\u015Fken", "De\u011Fi\u015Fken", "Y\xFCksek", "De\u011Fi\u015Fken", "Savunma, askeri"]
        ]
      }
    ]
  },
  {
    slug: "logo-markalama",
    category: "hizmetler",
    categoryLabel: "\u0130\u015Faretleme & Tan\u0131mlama",
    title: "Logo & Markalama",
    heroImage: "hero-logo-markalama",
    description: "Lazer, pad printing ve serigrafi ile \xFCr\xFCnlerinize marka kimli\u011Fi kazand\u0131r\u0131n. Kal\u0131c\u0131 ve profesyonel g\xF6r\xFCn\xFCm.",
    content: [
      "Lazer i\u015Faretleme (kal\u0131c\u0131, y\xFCksek kontrast, metal ve plastik), pad printing (kavisli y\xFCzeyler, \xE7ok renkli), serigrafi (b\xFCy\xFCk y\xFCzeyler, y\xFCksek hacim) ve etiket (ge\xE7ici, de\u011Fi\u015Ftirilebilir) olmak \xFCzere 4 farkl\u0131 markalama y\xF6ntemi sunuyoruz.",
      "Farkl\u0131 malzeme t\xFCrlerinde tutarl\u0131 markalama sonu\xE7lar\u0131 elde ediyoruz. 1200 DPI \xE7\xF6z\xFCn\xFCrl\xFCk, \xB10.01 mm konumland\u0131rma tekrarlanabilirli\u011Fi ve 300\xD7300mm'ye kadar i\u015Faretleme alan\u0131 ile logo ve marka i\u015Faretleme yap\u0131yoruz."
    ],
    features: [
      "Lazer \u2014 Kal\u0131c\u0131, y\xFCksek kontrast, metal/plastik",
      "Pad Printing \u2014 Kavisli y\xFCzeyler, \xE7ok renkli",
      "Serigrafi \u2014 B\xFCy\xFCk y\xFCzeyler, y\xFCksek hacim",
      "Etiket \u2014 Ge\xE7ici, de\u011Fi\u015Ftirilebilir"
    ],
    technicalSpecs: [
      { label: "\xC7\xF6z\xFCn\xFCrl\xFCk", value: "1200 DPI" },
      { label: "Tekrarlanabilirlik", value: "\xB10.01mm" },
      { label: "Maks. Alan", value: "300\xD7300mm" },
      { label: "Kontrol", value: "Numune onay\u0131 sonras\u0131 seri" }
    ],
    processSteps: [
      "Tasar\u0131m \u0130nceleme",
      "Y\xF6ntem Se\xE7imi",
      "Numune \xC7al\u0131\u015Fmas\u0131",
      "Seri \u0130\u015Faretleme",
      "Kalite Kontrol"
    ],
    advantages: [
      "4 farkl\u0131 markalama y\xF6ntemi",
      "1200 DPI y\xFCksek \xE7\xF6z\xFCn\xFCrl\xFCk",
      "Kavisli y\xFCzeylerde pad printing",
      "Numune onay\u0131ndan sonra tekrarlanabilir seri i\u015Faretleme"
    ],
    comparisonTables: [
      {
        title: "Markalama Y\xF6ntemleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Y\xF6ntem", "\xC7\xF6z\xFCn\xFCrl\xFCk", "Dayan\u0131kl\u0131l\u0131k", "Renk", "Y\xFCzey Tipi", "Maliyet/Par\xE7a", "Hacim"],
        rows: [
          ["Lazer \u0130\u015Faretleme", "0.01mm", "Kal\u0131c\u0131 (\xF6m\xFCr boyu)", "Tek ton", "D\xFCz/kavisli", "$$", "1-1M+"],
          ["Pad Printing", "0.1mm", "\u0130yi (1000+ saat)", "\xC7ok renkli", "Kavisli ideal", "$", "100-100K"],
          ["Serigrafi", "0.2mm", "\u0130yi (500+ saat)", "\xC7ok renkli", "D\xFCz y\xFCzey", "$", "500-1M+"],
          ["Etiket (Vinil)", "DPI bazl\u0131", "Orta (d\u0131\u015F mekan 3-5 y\u0131l)", "Full color", "D\xFCz", "$", "1-10K"],
          ["Tampon Bask\u0131", "0.1mm", "Orta", "\xC7ok renkli", "D\xFCzensiz y\xFCzey", "$", "100-50K"]
        ]
      }
    ]
  },
  // ── Hizmetler > Montaj & Birleştirme ──
  {
    slug: "insert-uygulama",
    category: "hizmetler",
    categoryLabel: "Montaj & Birle\u015Ftirme",
    title: "Insert Uygulama",
    heroImage: "hero-insert-uygulama",
    description: "Metal insertlerin plastik ve metal par\xE7alara ultrasonik, \u0131s\u0131l veya presle montaj\u0131. Somun, per\xE7in ve pim uygulama.",
    content: [
      "Ultrasonik insert (plastik i\xE7in, h\u0131zl\u0131 ve temiz), \u0131s\u0131l insert (y\xFCksek \xE7ekme direnci), pres insert / self-tapping (ekonomik \xE7\xF6z\xFCm) ve mold-in insert (en y\xFCksek dayan\u0131m) olmak \xFCzere 4 farkl\u0131 insert uygulama y\xF6ntemi sunuyoruz.",
      "Pirin\xE7 (nikel kaplamal\u0131, genel ama\xE7l\u0131), \xE7elik (\xE7inko kaplamal\u0131, y\xFCksek dayan\u0131m) ve paslanmaz (kaplamas\u0131z, korozyon direnci) insert malzemeleri ile M2-M12 \xE7ap aral\u0131\u011F\u0131nda, 2000N+ \xE7ekme kuvveti ve 3 saniyenin alt\u0131nda \xE7evrim s\xFCresi ile h\u0131zl\u0131 ve g\xFC\xE7l\xFC ba\u011Flant\u0131lar olu\u015Fturuyoruz."
    ],
    features: [
      "Ultrasonik Insert \u2014 Plastik i\xE7in, h\u0131zl\u0131 ve temiz",
      "Is\u0131l Insert \u2014 Y\xFCksek \xE7ekme direnci",
      "Pres Insert (Self-tapping) \u2014 Ekonomik \xE7\xF6z\xFCm",
      "Mold-in Insert \u2014 En y\xFCksek dayan\u0131m"
    ],
    technicalSpecs: [
      { label: "Y\xF6ntem", value: "Ultrasonik / Is\u0131l / Pres" },
      { label: "\xC7ekme Kuvveti", value: "2000N+" },
      { label: "Insert \xC7ap\u0131", value: "M2-M12" },
      { label: "\xC7evrim S\xFCresi", value: "<3 saniye" }
    ],
    processSteps: [
      "Insert T\xFCr\xFC Se\xE7imi",
      "Delik Haz\u0131rl\u0131\u011F\u0131",
      "Insert Yerle\u015Ftirme",
      "\xC7ekme Testi",
      "Kalite Kontrol"
    ],
    advantages: [
      "4 farkl\u0131 insert uygulama y\xF6ntemi",
      "3 farkl\u0131 insert malzeme se\xE7ene\u011Fi",
      "\xC7ekme testi ile do\u011Frulanan insert ba\u011Flant\u0131s\u0131",
      "<3 saniye \xE7evrim s\xFCresi"
    ],
    comparisonTables: [
      {
        title: "Insert Uygulama Y\xF6ntemleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Y\xF6ntem", "\xC7ekme Kuvveti", "\xC7evrim S\xFCresi", "Uygun Malzeme", "Maliyet", "Avantaj"],
        rows: [
          ["Ultrasonik", "1500-2500N", "<2 sn", "Termoplastik", "$$", "H\u0131zl\u0131, temiz, tekrarlanabilir"],
          ["Is\u0131l (Heat Staking)", "2000-3500N", "3-5 sn", "Termoplastik", "$$", "Y\xFCksek \xE7ekme direnci"],
          ["Pres (Self-tapping)", "1000-2000N", "<1 sn", "Plastik, hafif metal", "$", "Ekonomik, h\u0131zl\u0131"],
          ["Mold-in", "3000-5000N", "Kal\u0131plama s\xFCresi", "Enjeksiyon plastik", "$$$", "En y\xFCksek dayan\u0131m"],
          ["Yap\u0131\u015Ft\u0131r\u0131c\u0131", "500-1500N", "K\xFCrleme s\xFCresi", "T\xFCm malzemeler", "$", "Esnek, d\xFC\u015F\xFCk gerilme"]
        ],
        highlight: 1
      }
    ]
  },
  {
    slug: "mekanik-montaj",
    category: "hizmetler",
    categoryLabel: "Montaj & Birle\u015Ftirme",
    title: "Mekanik Montaj",
    heroImage: "hero-mekanik-montaj",
    description: "Vida, somun, per\xE7in ve klips montaj\u0131. Tork kontroll\xFC s\u0131kma ve otomatik besleme sistemleri ile y\xFCksek verimlilik.",
    content: [
      "Vida ve somun montaj\u0131 (tork kontroll\xFC), pervane/pernos montaj\u0131 (hidrolik presle), klips ve segman montaj\u0131 (otomatik besleme), bearing montaj\u0131 (\xF6zel fikst\xFCrlerle) ve O-ring/conta montaj\u0131 (ya\u011F ve toz korumal\u0131) hizmetleri sunuyoruz.",
      /* F2: `1000+ ünite/gün` is a daily production volume — §D
         REVENUE_OR_ORDER_VOLUME. The torque values and the ±5% band are
         process specification and stay. */
      "M3 (1.5-2.0 Nm), M4 (3.0-4.0 Nm), M5 (6.0-8.0 Nm) ve M6 (10.0-12.0 Nm) vida boyutlar\u0131nda \xB15% toleransla tork kontroll\xFC s\u0131kma ger\xE7ekle\u015Ftiriyoruz. Her montaj fonksiyon testinden ge\xE7er ve seri numaras\u0131 bazl\u0131 takip sistemine kaydedilir."
    ],
    features: [
      "Vida & Somun Montaj\u0131 \u2014 Tork kontroll\xFC",
      "Pervane/Pernos Montaj\u0131 \u2014 Hidrolik presle",
      "Klips & Segman Montaj\u0131 \u2014 Otomatik besleme",
      "Bearing & O-ring Montaj\u0131 \u2014 \xD6zel fikst\xFCrlerle"
    ],
    technicalSpecs: [
      { label: "Tork Kontrol\xFC", value: "\xB15% hassasiyet" },
      { label: "Test", value: "Fonksiyon testi" },
      { label: "Vida Aral\u0131\u011F\u0131", value: "M3-M12" },
      { label: "Takip", value: "Seri no bazl\u0131" }
    ],
    processSteps: [
      "Montaj Plan\u0131 Haz\u0131rlama",
      "Bile\u015Fen Kontrol\xFC",
      "Tork Kontroll\xFC Montaj",
      "Fonksiyon Testi",
      "Paketleme & Etiketleme"
    ],
    advantages: [
      "Tork kontroll\xFC hassas s\u0131kma (\xB15%)",
      "Otomatik besleme sistemi ile y\xFCksek verimlilik",
      "M3-M12 aral\u0131\u011F\u0131nda dijital tork metre ile do\u011Frulama",
      "Seri numaras\u0131 bazl\u0131 izlenebilirlik"
    ],
    comparisonTables: [
      {
        title: "Ba\u011Flant\u0131 Eleman\u0131 Tork De\u011Ferleri (Kuru, S\u0131n\u0131f 8.8)",
        headers: ["Vida Boyutu", "Tork (Nm)", "\xD6n Y\xFCkleme (kN)", "Anahtar Boyutu", "Tolerans (\xB1%)", "Kontrol Y\xF6ntemi"],
        rows: [
          ["M3", "1.5-2.0", "2.5", "5.5mm", "\xB15%", "Dijital tork metre"],
          ["M4", "3.0-4.0", "4.5", "7mm", "\xB15%", "Dijital tork metre"],
          ["M5", "6.0-8.0", "8.0", "8mm", "\xB15%", "Tork anahtar\u0131"],
          ["M6", "10.0-12.0", "12.0", "10mm", "\xB15%", "Tork anahtar\u0131"],
          ["M8", "25.0-30.0", "22.0", "13mm", "\xB15%", "Tork anahtar\u0131"],
          ["M10", "50.0-60.0", "35.0", "17mm", "\xB15%", "Elektronik tork"],
          ["M12", "85.0-100.0", "50.0", "19mm", "\xB15%", "Elektronik tork"]
        ]
      }
    ]
  },
  {
    slug: "kitting-paketleme",
    category: "hizmetler",
    categoryLabel: "Montaj & Birle\u015Ftirme",
    title: "Kitting & Paketleme",
    heroImage: "hero-kitting-paketleme",
    description: "M\xFC\u015Fteriye \xF6zel kit olu\u015Fturma, etiketleme ve koruyucu ambalajlama. Tedarik zinciri verimlili\u011Fini art\u0131r\u0131n.",
    content: [
      "Vakumlu (nem ve toz korumas\u0131), ESD/antistatik (elektronik par\xE7alar), k\xF6p\xFCk (k\u0131r\u0131labilir par\xE7alar) ve ah\u015Fap kasa (a\u011F\u0131r ve de\u011Ferli par\xE7alar) paketleme se\xE7enekleri ile \xFCr\xFCnlerinizi g\xFCvenle teslim ediyoruz.",
      "Barkodlu etiket, RFID etiket, m\xFC\u015Fteriye \xF6zel etiket tasar\u0131m\u0131 ve \xE7oklu dil deste\u011Fi ile kapsaml\u0131 etiketleme \xE7\xF6z\xFCmleri sunuyoruz. MIL-PRF-81705 s\u0131n\u0131f\u0131 ESD koruyucu ambalaj, VCI ve desiccant koruma dahil ve DDP/FCA teslimat se\xE7enekleri ile profesyonel paketleme hizmeti veriyoruz."
    ],
    features: [
      "Vakumlu Paketleme \u2014 Nem ve toz korumas\u0131",
      "ESD (Antistatik) \u2014 Elektronik par\xE7alar i\xE7in",
      "K\xF6p\xFCk Koruma \u2014 K\u0131r\u0131labilir par\xE7alar i\xE7in",
      "Ah\u015Fap Kasa \u2014 A\u011F\u0131r ve de\u011Ferli par\xE7alar i\xE7in"
    ],
    technicalSpecs: [
      { label: "ESD Koruma", value: "MIL-PRF-81705" },
      { label: "Etiketleme", value: "Barkod + QR + RFID" },
      { label: "Koruma", value: "VCI, Desiccant" },
      { label: "Teslimat", value: "DDP / FCA" }
    ],
    processSteps: [
      "Kit Listesi Haz\u0131rlama",
      "Bile\u015Fen Toplama & Say\u0131m",
      "Koruyucu Ambalajlama",
      "Etiketleme",
      "Sevkiyat"
    ],
    advantages: [
      "MIL-PRF-81705 ESD koruma standard\u0131",
      "RFID dahil \xE7oklu etiketleme",
      "VCI ve desiccant koruma",
      "DDP/FCA esnek teslimat se\xE7enekleri"
    ],
    comparisonTables: [
      {
        title: "Paketleme T\xFCrleri ve Koruma Seviyeleri",
        headers: ["Paketleme T\xFCr\xFC", "Koruma Seviyesi", "Nem Koruma", "Darbe Koruma", "Maliyet", "Uygun Par\xE7a"],
        rows: [
          ["PE Po\u015Fet", "Temel", "D\xFC\u015F\xFCk", "Yok", "$", "Genel, k\xFC\xE7\xFCk par\xE7alar"],
          ["Vakumlu Po\u015Fet", "Y\xFCksek", "M\xFCkemmel", "D\xFC\u015F\xFCk", "$$", "Korozyona hassas metal"],
          ["ESD Torba", "Y\xFCksek", "\u0130yi", "D\xFC\u015F\xFCk", "$$", "Elektronik, PCB"],
          ["K\xF6p\xFCk Yerle\u015Ftirme", "\xC7ok y\xFCksek", "Orta", "M\xFCkemmel", "$$$", "Hassas, k\u0131r\u0131lgan par\xE7alar"],
          ["VCI Ka\u011F\u0131t/Film", "Y\xFCksek", "M\xFCkemmel", "D\xFC\u015F\xFCk", "$$", "Uzun s\xFCreli metal depolama"],
          ["Ah\u015Fap Kasa", "Maksimum", "\u0130yi", "\xC7ok y\xFCksek", "$$$$", "A\u011F\u0131r, b\xFCy\xFCk, de\u011Ferli"]
        ]
      }
    ]
  },
  {
    slug: "kaynakli-imalat",
    category: "hizmetler",
    categoryLabel: "Montaj & Birle\u015Ftirme",
    title: "Kaynakl\u0131 \u0130malat",
    heroImage: "hero-kaynakli-imalat",
    description: "TIG, MIG/MAG ve diren\xE7 kayna\u011F\u0131 ile metal par\xE7alar\u0131n birle\u015Ftirilmesi. Yaz\u0131l\u0131 kaynak prosed\xFCr\xFC ve tahribats\u0131z muayene ile kalite kontrol.",
    content: [
      "TIG kaynak (Al, \xE7elik, Ti; 0.5-10mm; hassas uygulamalar), MIG/MAG kaynak (\xE7elik, Al; 1-20mm; h\u0131zl\u0131 \xFCretim) ve diren\xE7 kayna\u011F\u0131 (\xE7elik; 0.2-3mm; nokta kaynak) y\xF6ntemleri ile metal par\xE7alar\u0131n birle\u015Ftirilmesini ger\xE7ekle\u015Ftiriyoruz.",
      "Kaynak i\u015Flemleri yaz\u0131l\u0131 kaynak prosed\xFCr\xFC (WPS) ile y\xFCr\xFCt\xFCl\xFCr; kullan\u0131lan parametreler ve sarf malzemeleri i\u015F baz\u0131nda kay\u0131t alt\u0131na al\u0131n\u0131r. RT, UT, PT ve MT tahribats\u0131z muayene y\xF6ntemleri ile kaynak diki\u015Fleri kontrol edilir ve sonu\xE7lar teslimat dosyas\u0131na eklenir."
    ],
    features: [
      "TIG Kaynak \u2014 Al, \xE7elik, Ti; 0.5-10mm; hassas",
      "MIG/MAG Kaynak \u2014 \xC7elik, Al; 1-20mm; h\u0131zl\u0131 \xFCretim",
      "Diren\xE7 Kayna\u011F\u0131 \u2014 \xC7elik; 0.2-3mm; nokta kaynak",
      "Yaz\u0131l\u0131 Kaynak Prosed\xFCr\xFC \u2014 WPS ile y\xFCr\xFCt\xFClen kaynak"
    ],
    technicalSpecs: [
      { label: "Prosed\xFCr", value: "WPS ile kaynak" },
      { label: "Kal\u0131nl\u0131k", value: "0.2-20 mm" },
      { label: "NDT", value: "RT, UT, PT, MT" },
      { label: "Malzemeler", value: "Al, SS, Ti, Ni" }
    ],
    processSteps: [
      "Kaynak Prosed\xFCr\xFC (WPS)",
      "Malzeme & Ekipman Haz\u0131rl\u0131k",
      "Kaynak \u0130\u015Flemi",
      "NDT Muayene",
      "Kalite Raporu"
    ],
    advantages: [
      "Yaz\u0131l\u0131 kaynak prosed\xFCr\xFC (WPS) ile \xFCretim",
      "4 farkl\u0131 NDT muayene y\xF6ntemi",
      "Kaynak diki\u015Flerinde muayene ve \xF6l\xE7\xFCm kayd\u0131",
      "TIG, MIG/MAG ve diren\xE7 kayna\u011F\u0131 kapasitesi"
    ],
    comparisonTables: [
      {
        title: "Kaynak Y\xF6ntemleri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Y\xF6ntem", "Malzeme Kal\u0131nl\u0131\u011F\u0131", "H\u0131z", "Is\u0131 Girdisi", "Deformasyon", "Uygulama"],
        rows: [
          ["TIG (GTAW)", "0.5-10mm", "D\xFC\u015F\xFCk", "D\xFC\u015F\xFCk-Orta", "D\xFC\u015F\xFCk", "Hassas, ince i\u015F, Al/Ti"],
          ["MIG/MAG (GMAW)", "1-20mm", "Y\xFCksek", "Orta-Y\xFCksek", "Orta", "Seri \xFCretim, \xE7elik/Al"],
          ["Diren\xE7 (Nokta)", "0.2-3mm", "\xC7ok y\xFCksek", "D\xFC\u015F\xFCk (lokal)", "\xC7ok d\xFC\u015F\xFCk", "Sac metal, otomotiv"],
          ["Lazer Kaynak", "0.1-8mm", "\xC7ok y\xFCksek", "\xC7ok d\xFC\u015F\xFCk", "Minimum", "Hassas, medikal, elektronik"],
          ["Elektron I\u015F\u0131n", "0.5-100mm", "Orta", "\xC7ok d\xFC\u015F\xFCk", "Minimum", "Havac\u0131l\u0131k, n\xFCkleer"],
          ["S\xFCrt\xFCnme Kar\u0131\u015Ft\u0131rma", "1-50mm", "Orta", "D\xFC\u015F\xFCk", "D\xFC\u015F\xFCk", "Al ala\u015F\u0131mlar, uzay"]
        ]
      },
      {
        title: "NDT (Tahribats\u0131z Muayene) Y\xF6ntemleri",
        headers: ["Y\xF6ntem", "K\u0131saltma", "Tespit Yetene\u011Fi", "Hassasiyet", "Uygulama H\u0131z\u0131", "Standart"],
        rows: [
          ["Radyografik Test", "RT", "\u0130\xE7 hatalar, g\xF6zeneklilik", "Y\xFCksek", "Yava\u015F", "EN ISO 17636"],
          ["Ultrasonik Test", "UT", "\u0130\xE7 \xE7atlak, delaminasyon", "\xC7ok y\xFCksek", "Orta", "EN ISO 17640"],
          ["Penetrant Test", "PT", "Y\xFCzey \xE7atlaklar\u0131", "Y\xFCksek", "Orta", "EN ISO 3452"],
          ["Manyetik Par\xE7ac\u0131k", "MT", "Y\xFCzey/y\xFCzey alt\u0131 \xE7atlak", "Y\xFCksek", "H\u0131zl\u0131", "EN ISO 17638"],
          ["G\xF6rsel Muayene", "VT", "Y\xFCzey kusurlar\u0131", "Orta", "\xC7ok h\u0131zl\u0131", "EN ISO 17637"]
        ]
      }
    ]
  },
  // ── Kabiliyetler > Üretim Altyapısı ──
  /* MACHINE PARK — rewritten in Phase 06.
  
       Every sentence on this page was an inventory disclosure, an invented one,
       or both: `15.000 m² üretim alanı`, `50+ tezgah`, per-model work envelopes
       and spindle speeds, a `24/7` production mode, a named calibration
       instrument, and a 2024-2026 capital-investment plan. `USER_INPUTS.md` §D
       marks MACHINE_COUNT, FACILITY_SIZE and REVENUE_OR_ORDER_VOLUME
       PRIVATE_DO_NOT_DISCLOSE, and §0 sets DO_NOT_EMPHASIZE_COMPANY_SCALE: YES.
       Nothing here was verifiable and none of it was publishable.
  
       The page keeps its slug and its title because `src/components/navigation/
       ia.ts` links to both. What it describes now is the PROCESS FAMILY set —
       which is derived from the repository's own service pages (§E
       MUST_KEEP_SERVICES: DERIVE_FROM_REPO) — and how a process is chosen for a
       part. That is what a buyer needs from this page anyway: not how many
       machines exist, but whether the geometry can be made and how.            */
  {
    slug: "makine-parkuru",
    category: "kabiliyetler",
    categoryLabel: "\xDCretim Altyap\u0131s\u0131",
    title: "Makine Parkuru",
    metaTitle: "\xDCretim Kabiliyetleri | CNC Freze, Torna, Erozyon | Mas Technic",
    metaDescription: "5 eksen CNC frezeleme, C/Y eksenli tornalama, Swiss tornalama, derin delik i\u015Fleme ve tel erozyon kabiliyetleri. Par\xE7a geometrisine g\xF6re proses se\xE7imi.",
    description: "Bir par\xE7an\u0131n hangi tezg\xE2hta \xFCretilece\u011Fi, geometrisi ve tolerans zinciri taraf\u0131ndan belirlenir. Proses ailelerimiz, bu karar\u0131 par\xE7an\u0131n gereksinimine g\xF6re verebilmek \xFCzere birlikte planlan\u0131r.",
    heroImage: "hero-makine-parkuru",
    content: [
      "\xDCretim planlamas\u0131 bir tezg\xE2h listesiyle de\u011Fil, par\xE7an\u0131n kendisiyle ba\u015Flar. Ba\u011Flama say\u0131s\u0131, eri\u015Filmesi gereken y\xFCzeyler, \xF6l\xE7\xFC zinciri ve malzemenin davran\u0131\u015F\u0131; hangi proses ailesinin kullan\u0131laca\u011F\u0131n\u0131 ve hangi s\u0131rayla i\u015Flenece\u011Fini belirler.",
      "5 eksen sim\xFCltane frezeleme, tek ba\u011Flamada birden fazla y\xFCzeye eri\u015Fim gerektiren geometrilerde kullan\u0131l\u0131r. Ba\u011Flama say\u0131s\u0131n\u0131 azaltmak yaln\u0131zca s\xFCreyi k\u0131saltmaz; her yeni ba\u011Flama \xF6l\xE7\xFC zincirine yeni bir hata kayna\u011F\u0131 ekledi\u011Fi i\xE7in do\u011Frudan tolerans lehine \xE7al\u0131\u015F\u0131r.",
      "C ve Y eksenli tornalama, d\xF6nel par\xE7alarda torna ve freze operasyonlar\u0131n\u0131 tek kurulumda toplar. Kayar puntal\u0131 (Swiss tip) tornalama ise k\xFC\xE7\xFCk \xE7apl\u0131, uzun par\xE7alarda desteklenmemi\u015F boyu k\u0131saltarak sehimi s\u0131n\u0131rlar.",
      "Derin delik i\u015Fleme, tel erozyon ve dalma erozyon; frezeleme ile ula\u015F\u0131lamayan geometriler i\xE7in kullan\u0131l\u0131r: y\xFCksek boy/\xE7ap oranl\u0131 kanallar, sert malzemede keskin i\xE7 k\xF6\u015Feler, ince cidarl\u0131 kesitler.",
      "Tezg\xE2h do\u011Frulu\u011Fu \xFCretimin girdisidir, sonucu de\u011Fildir. Bu nedenle do\u011Fruluk periyodik kontrollerle izlenir, kritik i\u015Fler \xF6ncesinde test par\xE7as\u0131yla teyit edilir ve sapma g\xF6r\xFCld\xFC\u011F\xFCnde par\xE7a de\u011Fil proses d\xFCzeltilir."
    ],
    features: [
      "5 Eksen Sim\xFCltane Frezeleme \u2014 tek ba\u011Flamada \xE7ok y\xFCzeyli geometriler",
      "3 ve 4 Eksen Frezeleme \u2014 d\xFCz y\xFCzeyler, cepler ve \xE7evresel i\u015Fleme",
      "C/Y Eksenli CNC Tornalama \u2014 d\xF6nel par\xE7alarda torna ve freze tek kurulumda",
      "Kayar Puntal\u0131 (Swiss) Tornalama \u2014 k\xFC\xE7\xFCk \xE7apl\u0131, uzun par\xE7alar",
      "Derin Delik \u0130\u015Fleme \u2014 y\xFCksek boy/\xE7ap oranl\u0131 delikler",
      "Tel ve Dalma Erozyon \u2014 sert malzemede keskin i\xE7 k\xF6\u015Feler"
    ],
    technicalSpecs: [
      { label: "Freze Konfig\xFCrasyonu", value: "3, 4 ve 5 eksen" },
      { label: "Torna Konfig\xFCrasyonu", value: "C ve Y eksen, kayar punta" },
      { label: "Standart Tolerans", value: "\xB10.01 mm" },
      { label: "Proses Se\xE7imi", value: "Geometri ve \xF6l\xE7\xFC zincirine g\xF6re" },
      { label: "Do\u011Fruluk Takibi", value: "Periyodik kontrol + test par\xE7as\u0131" },
      { label: "Kontrol", value: "Kontrol plan\u0131na g\xF6re \xF6l\xE7\xFCm" }
    ],
    processSteps: [
      "Teknik \u0130nceleme",
      "Proses Se\xE7imi",
      "Kapasite Planlama",
      "CAM Programlama",
      "Kurulum & Ba\u011Flama",
      "CNC \u0130\u015Fleme",
      "Ara Kontrol",
      "Son Kontrol"
    ],
    advantages: [
      "Proses, par\xE7an\u0131n geometrisine g\xF6re se\xE7ilir; par\xE7a prosese uydurulmaz",
      "Ba\u011Flama say\u0131s\u0131 \xF6l\xE7\xFC zinciri g\xF6zetilerek en aza indirilir",
      "Tezg\xE2h do\u011Frulu\u011Fu periyodik kontrol ve test par\xE7as\u0131yla izlenir",
      "Kritik \xF6l\xE7\xFCler i\xE7in kontrol plan\u0131 \xFCretimden \xF6nce haz\u0131rlan\u0131r",
      "Frezeleme, tornalama ve erozyon ayn\u0131 i\u015F i\xE7in birlikte planlanabilir",
      "Sapma g\xF6r\xFCld\xFC\u011F\xFCnde par\xE7a de\u011Fil proses d\xFCzeltilir"
    ],
    faq: [
      { question: "Par\xE7am hangi prosesle \xFCretilecek?", answer: "Karar\u0131 geometri verir: eri\u015Filmesi gereken y\xFCzeyler, \xF6l\xE7\xFC zinciri, boy/\xE7ap oran\u0131 ve malzeme. Teknik inceleme sonucunda hangi prosesle ve ka\xE7 ba\u011Flamada \xFCretilece\u011Fini teklifle birlikte payla\u015F\u0131r\u0131z." },
      { question: "3 eksen mi 5 eksen mi gerekir?", answer: "D\xFCz y\xFCzeyler ve basit cep i\u015Flemleri 3 eksende daha ekonomiktir. Alttan kesim, e\u011Fik y\xFCzey veya tek ba\u011Flamada \xE7ok y\xFCzey gerekiyorsa 5 eksen tercih edilir; ba\u011Flama say\u0131s\u0131ndaki azalma tolerans lehine \xE7al\u0131\u015F\u0131r." },
      { question: "Sert malzemede keskin i\xE7 k\xF6\u015Fe yap\u0131labiliyor mu?", answer: "Frezeleme ile i\xE7 k\xF6\u015Fe yar\u0131\xE7ap\u0131 tak\u0131m \xE7ap\u0131yla s\u0131n\u0131rl\u0131d\u0131r. Bu s\u0131n\u0131r\u0131n alt\u0131ndaki k\xF6\u015Feler i\xE7in tel veya dalma erozyon kullan\u0131l\u0131r." },
      { question: "Tezg\xE2h do\u011Frulu\u011Funu nas\u0131l teyit ediyorsunuz?", answer: "Do\u011Fruluk periyodik kontrollerle izlenir ve kritik i\u015Fler \xF6ncesinde test par\xE7as\u0131 \xF6l\xE7\xFCm\xFCyle teyit edilir. \xD6l\xE7\xFCm sonu\xE7lar\u0131 kay\u0131t alt\u0131na al\u0131n\u0131r." },
      { question: "Uzun ve ince par\xE7alarda ne yap\u0131yorsunuz?", answer: "Kayar puntal\u0131 tornalama desteklenmemi\u015F boyu k\u0131saltarak sehimi s\u0131n\u0131rlar. Gerekirse operasyon s\u0131ras\u0131 ve destek d\xFCzeni par\xE7aya g\xF6re yeniden planlan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Proses Ailesine G\xF6re Kullan\u0131m Alan\u0131",
        description: "Par\xE7a geometrisine g\xF6re hangi proses ailesinin tercih edildi\u011Fi",
        headers: ["Proses Ailesi", "Tipik Geometri", "Neden Tercih Edilir", "S\u0131n\u0131r\u0131"],
        rows: [
          ["5 Eksen Frezeleme", "\xC7ok y\xFCzeyli, e\u011Fik d\xFCzlemli par\xE7alar", "Ba\u011Flama say\u0131s\u0131n\u0131 ve \xF6l\xE7\xFC zincirini k\u0131salt\u0131r", "Kurulum ve programlama s\xFCresi uzundur"],
          ["3/4 Eksen Frezeleme", "D\xFCz y\xFCzeyler, cepler, \xE7evresel kanallar", "Ekonomik ve h\u0131zl\u0131 kurulum", "Alttan kesim ve e\u011Fik y\xFCzeylerde yetersiz"],
          ["C/Y Eksenli Tornalama", "D\xF6nel g\xF6vdeler, yan delikli miller", "Torna ve frezeyi tek kurulumda toplar", "D\xF6nel olmayan geometriye uygun de\u011Fil"],
          ["Kayar Puntal\u0131 Tornalama", "K\xFC\xE7\xFCk \xE7apl\u0131, uzun par\xE7alar", "Desteklenmemi\u015F boyu k\u0131salt\u0131r, sehimi s\u0131n\u0131rlar", "\xC7ap aral\u0131\u011F\u0131 dard\u0131r"],
          ["Derin Delik \u0130\u015Fleme", "Y\xFCksek boy/\xE7ap oranl\u0131 delikler", "Do\u011Frusall\u0131\u011F\u0131 ve tala\u015F tahliyesini korur", "Delik ekseni k\u0131s\u0131tl\u0131d\u0131r"],
          ["Tel / Dalma Erozyon", "Sert malzemede keskin i\xE7 k\xF6\u015Feler", "Kesme kuvveti uygulamaz, formu kopyalar", "Tala\u015F kald\u0131rma h\u0131z\u0131 d\xFC\u015F\xFCkt\xFCr"]
        ]
      },
      {
        title: "Do\u011Fruluk Takibi",
        description: "Tezg\xE2h do\u011Frulu\u011Funun izlenme bi\xE7imi",
        headers: ["Ne Zaman", "Ne Yap\u0131l\u0131r", "Ne B\u0131rak\u0131r"],
        rows: [
          ["Vardiya ba\u015F\u0131nda", "Operat\xF6r kontrol\xFC", "Operasyon kayd\u0131"],
          ["Kritik i\u015F \xF6ncesi", "Test par\xE7as\u0131 \xF6l\xE7\xFCm\xFC", "\xD6l\xE7\xFCm kayd\u0131"],
          ["Periyodik", "Geometri ve do\u011Fruluk kontrol\xFC", "Bak\u0131m kayd\u0131"],
          ["Sapma g\xF6r\xFCld\xFC\u011F\xFCnde", "Proses d\xFCzeltme ve yeniden do\u011Frulama", "D\xFCzeltici faaliyet kayd\u0131"]
        ]
      }
    ]
  },
  {
    slug: "malzeme-kutuphanesi",
    category: "kabiliyetler",
    categoryLabel: "\xDCretim Altyap\u0131s\u0131",
    title: "Malzeme K\xFCt\xFCphanesi",
    metaTitle: "Malzeme K\xFCt\xFCphanesi | \u0130zlenebilir Tedarik | Mas Technic",
    metaDescription: "Al\xFCminyumdan titanyuma, PEEK'ten Inconel'e geni\u015F malzeme yelpazesi. Parti ve d\xF6k\xFCm kayd\u0131yla izlenebilir tedarik; malzeme sertifikas\u0131 talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r.",
    description: "Al\xFCminyumdan titanyuma, plastikten kompozitlere kadar geni\u015F bir malzeme yelpazesi ile projenize uygun \xE7\xF6z\xFCm\xFC sunuyoruz. Malzeme sertifikas\u0131 ve lot bazl\u0131 kay\u0131t talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r.",
    heroImage: "hero-malzeme-kutuphanesi",
    content: [
      "Mas Technic malzeme k\xFCt\xFCphanesi metal, plastik, kompozit ve \xF6zel ala\u015F\u0131mlar\u0131 kapsar. Havac\u0131l\u0131k s\u0131n\u0131f\u0131 al\xFCminyumdan medikal s\u0131n\u0131f\u0131 titanyuma, y\xFCksek performans plastiklerden s\xFCper ala\u015F\u0131mlara kadar geni\u015F bir yelpazede hizmet veriyoruz.",
      "Metal malzemelerimiz aras\u0131nda Al\xFCminyum (6061, 7075, 5083 \u2014 95-150 HB), Paslanmaz \xC7elik (304, 316, 17-4PH \u2014 150-350 HB), Karbon \xC7elik (1045, 4140, 4340 \u2014 200-350 HB), Titanyum (Gr2, Gr5 Ti6Al4V \u2014 250-350 HB) ve Pirin\xE7/Bronz (C360, C932 \u2014 60-150 HB) bulunmaktad\u0131r.",
      "Plastik ve kompozit malzemelerimiz aras\u0131nda Asetal (POM \u2014 d\xFC\u015F\xFCk s\xFCrt\xFCnme), Nylon (PA6, PA66 \u2014 a\u015F\u0131nma direnci), Teflon (PTFE \u2014 kimyasal diren\xE7i), PEEK (y\xFCksek s\u0131cakl\u0131k \u2014 havac\u0131l\u0131k/medikal), Polikarbonat (PC \u2014 \u015Feffafl\u0131k) yer almaktad\u0131r. \xD6zel ala\u015F\u0131mlardan Inconel 718 (y\xFCksek s\u0131cakl\u0131k \u2014 t\xFCrbin), Hastelloy (korozyon \u2014 kimya end\xFCstrisi), Kovar (termal genle\u015Fme \u2014 elektronik) ve Tungsten (y\xFCksek yo\u011Funluk \u2014 radyasyon korumas\u0131) tedarik edebiliyoruz.",
      "Malzeme tedarik s\xFCrecimiz be\u015F a\u015Famadan olu\u015Fur: anl\u0131k stok kontrol\xFC, malzeme sertifikas\u0131 do\u011Frulama, kimyasal analiz ve boyut kontrol\xFC ile giri\u015F kontrol\xFC, klimatik kontroll\xFC depolama ve lot numaras\u0131 ile izlenebilirlik. S\u0131k kullan\u0131lan al\xFCminyum ve paslanmaz \xE7elik kaliteleri s\xFCrekli stokta tutulmaktad\u0131r."
    ],
    features: [
      "Geni\u015F Malzeme Yelpazesi \u2014 metal, plastik, kompozit ve \xF6zel ala\u015F\u0131mlar",
      "Malzeme Sertifikas\u0131 \u2014 Talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r",
      "Klimatik Kontroll\xFC Depo \u2014 S\u0131cakl\u0131k ve nem kontroll\xFC depolama",
      "Lot Bazl\u0131 \u0130zlenebilirlik \u2014 Hammaddeden nihai \xFCr\xFCne tam takip",
      "Anl\u0131k Stok Takibi \u2014 ERP entegreli ger\xE7ek zamanl\u0131 stok y\xF6netimi",
      "Havac\u0131l\u0131k & Medikal S\u0131n\u0131f \u2014 \u015Fartnameye g\xF6re malzeme se\xE7imi"
    ],
    technicalSpecs: [
      { label: "Malzeme Gruplar\u0131", value: "Metal, plastik, kompozit, \xF6zel ala\u015F\u0131m" },
      { label: "Sertifika", value: "Talebe ba\u011Fl\u0131" },
      { label: "S\xFCrekli Stok", value: "Al 6061, Al 7075" },
      { label: "S\xFCrekli Stok", value: "SS 304, SS 316" },
      { label: "Tedarik (Standart)", value: "S\xFCrekli stok" },
      { label: "Tedarik (\xD6zel)", value: "Sipari\u015F \xFCzerine" }
    ],
    processSteps: [
      "Stok Kontrol\xFC (ERP)",
      "Sertifika Do\u011Frulama",
      "Kimyasal Analiz",
      "Boyut Kontrol\xFC",
      "Klimatik Depolama",
      "Lot Takibi"
    ],
    advantages: [
      "Her projeye uygun malzeme se\xE7imi i\xE7in m\xFChendislik deste\u011Fi",
      "Kritik malzemeler (Al, SS) s\xFCrekli stokta",
      "Kimyasal analiz ve spektrometre ile giri\u015F kontrol\xFC",
      "ERP sistemi ile anl\u0131k stok ve tedarik takibi",
      "\xC7oklu tedarik\xE7i ile tedarik g\xFCvencesi",
      "Havac\u0131l\u0131k ve medikal uygulamalar i\xE7in \u015Fartnameye g\xF6re malzeme se\xE7imi"
    ],
    materials: [
      { name: "Al\xFCminyum", grade: "6061, 7075, 5083", properties: "95-150 HB, havac\u0131l\u0131k/elektronik, s\xFCrekli stok" },
      { name: "Paslanmaz \xC7elik", grade: "304, 316, 17-4PH", properties: "150-350 HB, medikal/g\u0131da, s\xFCrekli stok" },
      { name: "Karbon \xC7elik", grade: "1045, 4140, 4340", properties: "200-350 HB, mekanik par\xE7alar" },
      { name: "Titanyum", grade: "Gr2, Gr5 (Ti6Al4V)", properties: "250-350 HB, medikal/havac\u0131l\u0131k, sipari\u015F \xFCzerine" },
      { name: "Pirin\xE7 / Bronz", grade: "C360, C932", properties: "60-150 HB, di\u015Fli ve yatak uygulamalar\u0131" },
      { name: "Inconel 718", grade: "S\xFCper ala\u015F\u0131m", properties: "Y\xFCksek s\u0131cakl\u0131k, t\xFCrbin par\xE7alar\u0131, sipari\u015F \xFCzerine" },
      { name: "PEEK", grade: "450G", properties: "Y\xFCksek s\u0131cakl\u0131k, kimyasal direnci, havac\u0131l\u0131k/medikal" },
      { name: "POM (Delrin)", grade: "Delrin 150/500", properties: "D\xFC\u015F\xFCk s\xFCrt\xFCnme, di\u015Fli ve yatak" }
    ],
    faq: [
      { question: "Hangi malzeme sertifikalar\u0131n\u0131 sa\u011Fl\u0131yorsunuz?", answer: "Malzeme sertifikas\u0131 ve kimyasal analiz raporu talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r. Her tedarik, lot ve d\xF6k\xFCm numaras\u0131yla kay\u0131t alt\u0131na al\u0131n\u0131r." },
      { question: "Stokta hangi malzemeler bulunuyor?", answer: "Al 6061, Al 7075, SS 304 ve SS 316 s\xFCrekli stokta tutulmaktad\u0131r. Titanyum ve Inconel gibi \xF6zel malzemeler sipari\u015F \xFCzerine tedarik edilir." },
      { question: "\xD6zel ala\u015F\u0131m tedarik edebiliyor musunuz?", answer: `Evet. Inconel 718, Hastelloy, Kovar ve Tungsten gibi \xF6zel ala\u015F\u0131mlar s\xFCrekli stokta tutulmaz, sipari\u015F \xFCzerine tedarik edilir. ${LEAD_TIME_STATEMENT}` },
      { question: "Malzeme kalite kontrol\xFC nas\u0131l yap\u0131l\u0131yor?", answer: "Her malzeme giri\u015Finde spektrometre ile kimyasal analiz, boyut kontrol\xFC ve sertifika do\u011Frulamas\u0131 yap\u0131lmaktad\u0131r. Klimatik kontroll\xFC depoda lot numaras\u0131 ile izlenebilirlik sa\u011Flan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Malzeme Kar\u015F\u0131la\u015Ft\u0131rma Matrisi",
        description: "Ana malzeme gruplar\u0131n\u0131n mekanik \xF6zellikleri ve maliyet kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Malzeme", "Sertlik (HB)", "\xC7ekme Dayan\u0131m\u0131", "\u0130\u015Flenebilirlik", "Maliyet", "Stok Durumu"],
        rows: [
          ["Al 6061-T6", "95", "310 MPa", "\u2605\u2605\u2605\u2605\u2605", "$", "Stokta"],
          ["Al 7075-T6", "150", "572 MPa", "\u2605\u2605\u2605\u2605\u2606", "$$", "Stokta"],
          ["SS 304", "187", "515 MPa", "\u2605\u2605\u2605\u2606\u2606", "$$", "Stokta"],
          ["SS 316L", "217", "485 MPa", "\u2605\u2605\u2605\u2606\u2606", "$$$", "Stokta"],
          ["Ti6Al4V (Gr5)", "334", "950 MPa", "\u2605\u2605\u2606\u2606\u2606", "$$$$", "Sipari\u015F \xFCzerine"],
          ["Inconel 718", "363", "1034 MPa", "\u2605\u2606\u2606\u2606\u2606", "$$$$$", "Sipari\u015F \xFCzerine"],
          ["PEEK 450G", "100 (Shore D)", "100 MPa", "\u2605\u2605\u2605\u2605\u2606", "$$$$", "Sipari\u015F \xFCzerine"],
          ["POM (Delrin)", "85 (Shore D)", "70 MPa", "\u2605\u2605\u2605\u2605\u2605", "$", "Stokta"]
        ]
      },
      /* The `Sertifika` column used to publish `EN 10204 3.1` x3, `3.2` x2 and
         `CoC` x1, unconditionally per material group — sixty lines below
         `{ label: "Sertifika", value: "Talebe bağlı" }` on the same page. One
         page answered the buyer's question two ways and the surviving answer
         was the stronger one. EN 10204 names a certificate CLASS a buyer's own
         file depends on; §C supplies three certificates and none of them is it.
         The column now says what the spec row, the feature bullet and the FAQ
         on this page already say. */
      {
        /* 09a-C2: this matrix published TWO duration columns. "Standart Tedarik"
                 gave six procurement windows and "Acil Tedarik" promised an EXPRESS
                 TIER on top of them — "Aynı gün" for aluminium and stainless. A same-day
                 supply promise contains no digit at all, so no numeric sweep would ever
                 have found it, and it is the strongest commitment on the page.
        
                 The site already answers this question correctly one page away:
                 `/kabiliyetler/tedarik-zinciri` grades material access qualitatively
                 ("Kısa", "Orta", "Uzun", "Sipariş üzerine") and states that the real
                 figure is given with the quote. Two pages cannot answer the buyer's
                 same question two ways. The vocabulary here is now this page's OWN FAQ
                 ("Al 6061, Al 7075, SS 304 ve SS 316 sürekli stokta tutulmaktadır;
                 özel malzemeler sipariş üzerine tedarik edilir") and the express column
                 is gone. */
        title: "Tedarik Yakla\u015F\u0131m\u0131 ve Sertifika Matrisi",
        headers: ["Malzeme Grubu", "Tedarik", "Sertifika", "Min. Sipari\u015F"],
        rows: [
          ["Al\xFCminyum (6061, 7075)", "S\xFCrekli stok", "Talebe ba\u011Fl\u0131", "1 kg"],
          ["Paslanmaz \xC7elik (304, 316)", "S\xFCrekli stok", "Talebe ba\u011Fl\u0131", "5 kg"],
          ["Karbon \xC7elik (1045, 4140)", "Sipari\u015F \xFCzerine", "Talebe ba\u011Fl\u0131", "10 kg"],
          ["Titanyum (Gr2, Gr5)", "Sipari\u015F \xFCzerine", "Talebe ba\u011Fl\u0131", "5 kg"],
          ["Inconel / Hastelloy", "Sipari\u015F \xFCzerine", "Talebe ba\u011Fl\u0131", "10 kg"],
          ["PEEK / Y\xFCksek Perf. Plastik", "Sipari\u015F \xFCzerine", "Talebe ba\u011Fl\u0131", "1 kg"]
        ]
      }
    ]
  },
  /* QUALITY CONTROL — rewritten in Phase 06.
  
       This page was the single worst fabrication in the repository. It named
       four certificates that do not exist AND the registrars that supposedly
       issued them (`ISO 9001:2015 (TÜV SÜD), AS9100D (SGS), IATF 16949 (Bureau
       Veritas), ISO 13485 (TÜV SÜD)`), a %99.7 quality rate, a 6 Sigma target,
       %100 CMM coverage of critical dimensions, and a metrology laboratory —
       Zeiss, Mitutoyo, GOM, Taylor Hobson, Nikon, Wilson — with model numbers
       and accuracies down to the micron.
  
       `USER_INPUTS.md` §C supplies ISO 9001, ISO 14001 and OHSAS 18001 and no
       issuer for any of them. §D records CMM coverage as
       THIRD_PARTY_ACCREDITED_ON_DEMAND — not universal, not in-house. §H does
       supply a real, publishable measurement-equipment list as a PDF, which is
       now served from `public/belgeler/` and linked from the landing.
  
       What replaces it is the thing that was missing: how conformity is
       actually established, and what record each step leaves behind.          */
  {
    slug: "kalite-kontrol",
    category: "kabiliyetler",
    categoryLabel: "Kalite & Standartlar",
    title: "Kalite Kontrol",
    metaTitle: "Kalite Kontrol | Kontrol Plan\u0131 ve \xD6l\xE7\xFCm Kayd\u0131 | Mas Technic",
    metaDescription: "Her i\u015F i\xE7in kontrol plan\u0131, proses i\xE7i ara kontrol ve kontrol plan\u0131na g\xF6re son kontrol. Akredite \xFC\xE7\xFCnc\xFC taraf CMM \xF6l\xE7\xFCm\xFC talebe ba\u011Fl\u0131. ISO 9001:2015.",
    description: "Kalite kontrol, \xFCretimden sonra yap\u0131lan bir muayene de\u011Fil, \xFCretimden \xF6nce yaz\u0131lan bir pland\u0131r. Hangi \xF6l\xE7\xFCn\xFCn nas\u0131l ve hangi a\u015Famada kontrol edilece\u011Fi, par\xE7a tezg\xE2ha ba\u011Flanmadan belirlenir.",
    heroImage: "hero-kalite-kontrol",
    content: [
      "Her i\u015F i\xE7in bir kontrol plan\u0131 olu\u015Fturulur. Plan; teknik resimdeki hangi kotelerin kritik oldu\u011Funu, her birinin hangi y\xF6ntemle ve hangi a\u015Famada kontrol edilece\u011Fini ve kontrol\xFCn hangi kayd\u0131 b\u0131rakaca\u011F\u0131n\u0131 tan\u0131mlar. Bu plan teklif a\u015Famas\u0131ndaki teknik incelemenin \xE7\u0131kt\u0131s\u0131d\u0131r.",
      "Ara kontroller proses s\u0131ras\u0131nda yap\u0131l\u0131r. Ama\xE7, hatay\u0131 son kontrolde yakalamak de\u011Fil, bir sonraki operasyona hatal\u0131 par\xE7a g\xF6ndermemektir. \u0130lk par\xE7a onay\u0131, \u0131s\u0131l i\u015Flem gibi \xF6l\xE7\xFC kayd\u0131ran ad\u0131mlar\u0131n sonras\u0131 ve ba\u011Flama de\u011Fi\u015Fimleri, ara kontrol\xFCn do\u011Fal duraklar\u0131d\u0131r.",
      "Son kontrol, kontrol plan\u0131nda tan\u0131mlanan koteler \xFCzerinden yap\u0131l\u0131r ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r. Koordinat \xF6l\xE7\xFCm (CMM) gerektiren durumlarda \xF6l\xE7\xFCm, akredite \xFC\xE7\xFCnc\xFC taraf taraf\u0131ndan talebe ba\u011Fl\u0131 olarak ger\xE7ekle\u015Ftirilir; bu tercih, \xF6l\xE7\xFCm\xFCn \xFCretimden ba\u011F\u0131ms\u0131z olmas\u0131n\u0131 sa\u011Flar.",
      "Malzeme izlenebilirli\u011Fi parti ve d\xF6k\xFCm kayd\u0131 \xFCzerinden y\xFCr\xFCt\xFCl\xFCr; malzeme sertifikas\u0131 talep edilmesi halinde teslimat dosyas\u0131na eklenir. Kulland\u0131\u011F\u0131m\u0131z \xF6l\xE7\xFCm ve kontrol ekipmanlar\u0131n\u0131n listesi ayr\u0131 bir dok\xFCman olarak yay\u0131mlanm\u0131\u015Ft\u0131r ve kaynaklar b\xF6l\xFCm\xFCnden indirilebilir.",
      "Uygunsuzluk \xE7\u0131kt\u0131\u011F\u0131nda sorulan soru par\xE7an\u0131n kurtar\u0131l\u0131p kurtar\u0131lamayaca\u011F\u0131 de\u011Fil, prosesin neden o sonucu \xFCretti\u011Fidir. K\xF6k neden bulunana kadar ayn\u0131 kurulumla \xFCretime devam edilmez."
    ],
    features: [
      "Kontrol Plan\u0131 \u2014 kritik koteler \xFCretimden \xF6nce belirlenir",
      "\u0130lk Par\xE7a Kontrol\xFC \u2014 kurulum onaylanmadan seri ba\u015Flamaz",
      "Ara Kontrol \u2014 hata bir sonraki operasyona ta\u015F\u0131nmaz",
      "Son Kontrol \u2014 kontrol plan\u0131na g\xF6re, kay\u0131tl\u0131",
      "Akredite 3. Taraf CMM \u2014 talebe ba\u011Fl\u0131, \xFCretimden ba\u011F\u0131ms\u0131z",
      "Malzeme \u0130zlenebilirli\u011Fi \u2014 parti ve d\xF6k\xFCm kayd\u0131"
    ],
    technicalSpecs: [
      { label: "Y\xF6netim Sistemi", value: "ISO 9001:2015" },
      { label: "Standart Tolerans", value: "\xB10.01 mm" },
      { label: "Kontrol Plan\u0131", value: "Her i\u015F i\xE7in" },
      { label: "CMM \xD6l\xE7\xFCm", value: "Akredite 3. taraf, talebe ba\u011Fl\u0131" },
      { label: "\xD6l\xE7\xFCm Kayd\u0131", value: "Teslimat dosyas\u0131nda" },
      { label: "\u0130zlenebilirlik", value: "Parti ve d\xF6k\xFCm kayd\u0131" }
    ],
    processSteps: [
      "Teknik \u0130nceleme",
      "Kontrol Plan\u0131",
      "Malzeme Giri\u015F Kayd\u0131",
      "\u0130lk Par\xE7a Kontrol\xFC",
      "Ara Kontroller",
      "Son Kontrol",
      "\xD6l\xE7\xFCm Kayd\u0131"
    ],
    advantages: [
      "Kontrol plan\u0131 \xFCretimden \xF6nce yaz\u0131l\u0131r, sonradan uydurulmaz",
      "Ara kontroller hatay\u0131 bir sonraki operasyona ta\u015F\u0131maz",
      "Koordinat \xF6l\xE7\xFCm\xFC akredite \xFC\xE7\xFCnc\xFC taraf\xE7a, \xFCretimden ba\u011F\u0131ms\u0131z yap\u0131l\u0131r",
      "\xD6l\xE7\xFCm kay\u0131tlar\u0131 teslimat dosyas\u0131yla birlikte verilir",
      "Malzeme parti ve d\xF6k\xFCm kayd\u0131yla izlenir",
      "Uygunsuzlukta par\xE7a de\u011Fil proses d\xFCzeltilir"
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 y\xF6netim sistemi belgelerimiz bulunmaktad\u0131r. Belge kapsam\u0131 d\u0131\u015F\u0131nda bir standart gerekiyorsa teknik incelemede birlikte de\u011Ferlendiririz." },
      { question: "\xD6l\xE7\xFCm raporu veriyor musunuz?", answer: "Evet. Kontrol plan\u0131nda tan\u0131mlanan koteler \xF6l\xE7\xFCl\xFCr ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r; \xF6l\xE7\xFCm kayd\u0131 teslimat dosyas\u0131na eklenir." },
      { question: "CMM \xF6l\xE7\xFCm\xFC yap\u0131l\u0131yor mu?", answer: "Koordinat \xF6l\xE7\xFCm\xFC, akredite \xFC\xE7\xFCnc\xFC taraf taraf\u0131ndan talebe ba\u011Fl\u0131 olarak yap\u0131l\u0131r. Bu tercih \xF6l\xE7\xFCm\xFCn \xFCretimden ba\u011F\u0131ms\u0131z olmas\u0131n\u0131 sa\u011Flar; ihtiyac\u0131n\u0131z\u0131 teklif a\u015Famas\u0131nda belirtmeniz yeterlidir." },
      { question: "Kalite kontrol s\xFCreci nas\u0131l i\u015Fliyor?", answer: "Teknik inceleme ile kontrol plan\u0131 olu\u015Fturulur; malzeme giri\u015Fi kaydedilir, ilk par\xE7a onaylan\u0131r, proses s\u0131ras\u0131nda ara kontroller yap\u0131l\u0131r ve son kontrol plana g\xF6re tamamlanarak kay\u0131t alt\u0131na al\u0131n\u0131r." },
      { question: "Malzeme sertifikas\u0131 alabilir miyim?", answer: "Malzeme parti ve d\xF6k\xFCm kayd\u0131 \xFCzerinden izlenir. Malzeme sertifikas\u0131 talep etmeniz halinde teslimat dosyas\u0131na eklenir." }
    ],
    comparisonTables: [
      {
        title: "Kontrol A\u015Famalar\u0131 ve B\u0131rakt\u0131\u011F\u0131 Kay\u0131t",
        description: "Her kontrol ad\u0131m\u0131 bir karar noktas\u0131d\u0131r ve arkas\u0131nda bir kay\u0131t b\u0131rak\u0131r",
        headers: ["A\u015Fama", "Kontrol Noktas\u0131", "Y\xF6ntem", "B\u0131rakt\u0131\u011F\u0131 Kay\u0131t", "S\u0131kl\u0131k"],
        rows: [
          ["1. Giri\u015F", "Malzeme kimli\u011Fi", "Parti / d\xF6k\xFCm takibi", "\u0130zlenebilirlik kayd\u0131", "Her parti"],
          ["2. Kurulum", "Tak\u0131m ve ba\u011Flama do\u011Frulama", "G\xF6rsel + \xF6l\xE7\xFC", "Kurulum onay\u0131", "Her kurulum"],
          ["3. \u0130lk Par\xE7a", "Kritik koteler", "Kontrol plan\u0131na g\xF6re \xF6l\xE7\xFCm", "\u0130lk par\xE7a kayd\u0131", "Her kurulum"],
          ["4. Proses \u0130\xE7i", "Kayma e\u011Filimi olan koteler", "Ara kontrol", "Operasyon kayd\u0131", "Plana g\xF6re"],
          ["5. Son Kontrol", "Kontrol plan\u0131ndaki t\xFCm koteler", "\xD6l\xE7\xFCm; gerekirse akredite CMM", "\xD6l\xE7\xFCm kayd\u0131", "Plana g\xF6re"]
        ]
      },
      {
        title: "Kontrol Y\xF6nteminin Se\xE7imi",
        description: "Y\xF6ntem, \xF6l\xE7\xFClecek \xF6zelli\u011Fe ve tolerans\u0131n darl\u0131\u011F\u0131na g\xF6re belirlenir",
        headers: ["\xD6zellik", "Tipik Y\xF6ntem", "Ne Zaman Akredite CMM Gerekir"],
        rows: [
          ["\xC7ap ve boy \xF6l\xE7\xFCleri", "Kontrol plan\u0131na g\xF6re \xF6l\xE7\xFCm", "Tolerans zinciri dar oldu\u011Funda"],
          ["Form (d\xFCzlem, silindiriklik)", "Kontrol plan\u0131na g\xF6re \xF6l\xE7\xFCm", "Geometrik tolerans \u015Fartnamede ise"],
          ["Konum ve e\u015F eksenlilik", "Datum \xFCzerinden kontrol", "Datum yap\u0131s\u0131 karma\u015F\u0131k oldu\u011Funda"],
          ["Y\xFCzey durumu", "Kar\u015F\u0131la\u015Ft\u0131rmal\u0131 kontrol", "Say\u0131sal Ra \u015Fartnamede ise"],
          ["Malzeme kimli\u011Fi", "Parti / d\xF6k\xFCm takibi", "Uygulanmaz \u2014 belge ile y\xFCr\xFCr"]
        ]
      }
    ]
  },
  /* TOLERANCE & PRECISION — rewritten in Phase 06.
  
       This page claimed five tolerance classes down to ±0.001 mm, GD&T
       capability to ±0.003 mm, a named CMM with a stated measurement uncertainty
       of ±0.0019 mm, and a 3DCS/CATIA tolerance-simulation service. §D records
       one verified figure: MINIMUM_TOLERANCE_INTERNAL ±0.01 mm. A measurement
       uncertainty is a calibration result — it cannot be typed into a table.
  
       ISO 2768 and ASME Y14.5 stay: they are published standards the site
       REFERENCES, not accreditations it claims. The page now explains how a
       tolerance is decided rather than advertising one that cannot be held. */
  {
    slug: "tolerans-hassasiyet",
    category: "kabiliyetler",
    categoryLabel: "Kalite & Standartlar",
    title: "Tolerans & Hassasiyet",
    metaTitle: "Tolerans & Hassasiyet | \xB10.01 mm | ISO 2768 | GD&T | Mas Technic",
    metaDescription: "\xB10.01 mm standart tolerans aral\u0131\u011F\u0131, ISO 2768 ve ASME Y14.5 (GD&T) okuma. Tolerans; geometri, malzeme ve \xF6l\xE7\xFC zincirine g\xF6re teknik incelemede belirlenir.",
    description: "Tolerans bir reklam de\u011Feri de\u011Fil, bir karard\u0131r: par\xE7an\u0131n hangi \xF6l\xE7\xFCs\xFCn\xFCn ne kadar dar tutulaca\u011F\u0131, montajda neyin \xE7al\u0131\u015Fmas\u0131 gerekti\u011Fine g\xF6re belirlenir. Standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01 mm'dir.",
    heroImage: "hero-tolerans-hassasiyet",
    content: [
      "Standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01 mm'dir. Bir par\xE7ada bu aral\u0131\u011F\u0131n alt\u0131na inilip inilemeyece\u011Fi tek ba\u015F\u0131na tezg\xE2h\u0131n de\u011Fil, geometrinin, malzemenin, par\xE7a \xF6l\xE7\xFCs\xFCn\xFCn ve \xF6l\xE7\xFC zincirinin sorusudur; bu nedenle her par\xE7a i\xE7in teknik incelemede ayr\u0131ca belirlenir.",
      "Tolerans\u0131 belirleyen as\u0131l unsur \xE7o\u011Fu zaman ba\u011Flama say\u0131s\u0131d\u0131r. Her yeni ba\u011Flama \xF6l\xE7\xFC zincirine yeni bir hata kayna\u011F\u0131 ekler; tek ba\u011Flamada tamamlanan bir par\xE7a, ayn\u0131 tezg\xE2hta iki ba\u011Flamada i\u015Flenen par\xE7adan daha dar tolerans tutar.",
      "Geometrik toleranslar (GD&T) ASME Y14.5 dilinde okunur. Konum, diklik, e\u015F eksenlilik, d\xFCzlem ve dairesellik toleranslar\u0131 datum yap\u0131s\u0131yla birlikte anlam kazan\u0131r: hangi y\xFCzeyin referans al\u0131nd\u0131\u011F\u0131, tolerans\u0131n kendisi kadar belirleyicidir.",
      "Teknik resimde tolerans belirtilmeyen \xF6l\xE7\xFCler i\xE7in ISO 2768 genel tolerans s\u0131n\u0131flar\u0131 kullan\u0131l\u0131r. Hangi s\u0131n\u0131f\u0131n ge\xE7erli oldu\u011Fu teklif a\u015Famas\u0131nda netle\u015Ftirilir; belirsiz b\u0131rak\u0131lan bir genel tolerans, \xFCretim sonras\u0131 tart\u0131\u015Fman\u0131n en yayg\u0131n nedenidir.",
      "Gere\u011Finden dar tolerans maliyeti art\u0131r\u0131r ve teslimat\u0131 uzat\u0131r. Teknik incelemede, fonksiyonu etkilemeyen koteleri gev\u015Fetmeyi \xF6neririz; hangi \xF6l\xE7\xFCn\xFCn ger\xE7ekten kritik oldu\u011Funu birlikte belirlemek, par\xE7ay\u0131 hem daha ucuz hem daha g\xFCvenilir yapar."
    ],
    features: [
      "\xB10.01 mm Standart Tolerans \u2014 teknik incelemede par\xE7a baz\u0131nda teyit",
      "GD&T Okuma \u2014 ASME Y14.5 dilinde konum, form ve y\xF6nelim toleranslar\u0131",
      "Datum Yap\u0131s\u0131 \u2014 hangi y\xFCzeyin referans al\u0131nd\u0131\u011F\u0131 birlikte belirlenir",
      "ISO 2768 Genel Toleranslar \u2014 belirtilmemi\u015F \xF6l\xE7\xFCler i\xE7in s\u0131n\u0131f mutabakat\u0131",
      "\xD6l\xE7\xFC Zinciri Analizi \u2014 ba\u011Flama say\u0131s\u0131 ve birikim etkisinin de\u011Ferlendirilmesi",
      "Tolerans Gev\u015Fetme \xD6nerisi \u2014 fonksiyonu etkilemeyen koteler i\xE7in"
    ],
    technicalSpecs: [
      { label: "Standart Tolerans", value: "\xB10.01 mm" },
      { label: "Genel Tolerans", value: "ISO 2768 (s\u0131n\u0131f mutabakat\u0131)" },
      { label: "Geometrik Tolerans", value: "ASME Y14.5 (GD&T)" },
      { label: "Belirleyici", value: "Geometri, malzeme, \xF6l\xE7\xFC zinciri" },
      { label: "Teyit", value: "Teknik inceleme" },
      { label: "Kontrol", value: "Kontrol plan\u0131na g\xF6re \xF6l\xE7\xFCm" }
    ],
    advantages: [
      "Tolerans, par\xE7an\u0131n fonksiyonuna g\xF6re kote kote kararla\u015Ft\u0131r\u0131l\u0131r",
      "Ba\u011Flama say\u0131s\u0131 \xF6l\xE7\xFC zinciri g\xF6zetilerek en aza indirilir",
      "GD&T ve datum yap\u0131s\u0131 teknik incelemede birlikte okunur",
      "Belirtilmemi\u015F \xF6l\xE7\xFCler i\xE7in genel tolerans s\u0131n\u0131f\u0131 teklifte netle\u015Fir",
      "Gereksiz dar toleranslar maliyeti d\xFC\u015F\xFCrmek i\xE7in gev\u015Fetilmesi \xF6nerilir",
      "Kritik koteler kontrol plan\u0131na yaz\u0131l\u0131r ve \xF6l\xE7\xFCm kayd\u0131 b\u0131rak\u0131r"
    ],
    faq: [
      { question: "Standart tolerans aral\u0131\u011F\u0131n\u0131z nedir?", answer: "\xB10.01 mm'dir. Bir par\xE7ada daha dar\u0131na inilip inilemeyece\u011Fi geometri, malzeme, par\xE7a \xF6l\xE7\xFCs\xFC ve \xF6l\xE7\xFC zincirine ba\u011Fl\u0131d\u0131r ve teknik incelemede belirlenir." },
      { question: "Geometrik tolerans (GD&T) deste\u011Finiz var m\u0131?", answer: "Evet. ASME Y14.5 dilinde konum, diklik, e\u015F eksenlilik, d\xFCzlem ve dairesellik toleranslar\u0131n\u0131 datum yap\u0131s\u0131yla birlikte okur ve kontrol plan\u0131na yazar\u0131z." },
      { question: "Teknik resmimde tolerans belirtilmemi\u015F, ne olur?", answer: "Belirtilmemi\u015F \xF6l\xE7\xFCler i\xE7in ISO 2768 genel tolerans s\u0131n\u0131flar\u0131 kullan\u0131l\u0131r. Hangi s\u0131n\u0131f\u0131n ge\xE7erli olaca\u011F\u0131n\u0131 teklif a\u015Famas\u0131nda netle\u015Ftiririz." },
      { question: "Daha dar tolerans istersem ne de\u011Fi\u015Fir?", answer: "Operasyon s\u0131ras\u0131, ba\u011Flama d\xFCzeni ve kontrol y\xF6ntemi de\u011Fi\u015Fir; s\xFCre ve maliyet artar. Fonksiyonu etkilemeyen koteleri gev\u015Fetmenizi \xF6nerebiliriz." },
      { question: "Tolerans\u0131n tutuldu\u011Funu nas\u0131l g\xF6steriyorsunuz?", answer: "Kritik koteler kontrol plan\u0131na yaz\u0131l\u0131r, \xF6l\xE7\xFCl\xFCr ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r. Koordinat \xF6l\xE7\xFCm\xFC gerekti\u011Finde akredite \xFC\xE7\xFCnc\xFC taraf \xF6l\xE7\xFCm\xFC talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "ISO 2768 Tolerans S\u0131n\u0131flar\u0131",
        description: "Teknik resimde belirtilmemi\u015F \xF6l\xE7\xFCler i\xE7in boyut aral\u0131\u011F\u0131na g\xF6re genel toleranslar (mm)",
        headers: ["Tolerans S\u0131n\u0131f\u0131 (ISO 2768)", "0.5 \u2013 3 mm", "3 \u2013 6 mm", "6 \u2013 30 mm", "30 \u2013 120 mm", "120 \u2013 400 mm"],
        rows: [
          ["f (\u0130nce)", "\xB10.05", "\xB10.05", "\xB10.1", "\xB10.15", "\xB10.2"],
          ["m (Orta)", "\xB10.1", "\xB10.1", "\xB10.2", "\xB10.3", "\xB10.5"],
          ["c (Kaba)", "\xB10.2", "\xB10.3", "\xB10.5", "\xB10.8", "\xB11.2"],
          ["v (\xC7ok Kaba)", "\u2014", "\xB10.5", "\xB11.0", "\xB11.5", "\xB12.5"]
        ],
        highlight: 0
      },
      {
        title: "GD&T \u2014 Hangi Tolerans Neyi Kontrol Eder",
        description: "ASME Y14.5 sembolleri ve her birinin hangi montaj sorusunu yan\u0131tlad\u0131\u011F\u0131",
        headers: ["Tolerans Tipi", "Sembol", "Neyi Kontrol Eder", "Tipik Uygulama", "Datum Gerekir mi"],
        rows: [
          ["Konum", "\u2316", "Bir \xF6zelli\u011Fin referansa g\xF6re yeri", "Delik ve pim pozisyonlama", "Evet"],
          ["Diklik", "\u22A5", "Y\xFCzeyin datuma g\xF6re y\xF6nelimi", "Y\xFCzey\u2013mil dik referans\u0131", "Evet"],
          ["E\u015F eksenlilik", "\u25CE", "\u0130ki eksenin \xE7ak\u0131\u015Fmas\u0131", "Rulman yata\u011F\u0131, mil", "Evet"],
          ["D\xFCzlem", "\u25B1", "Y\xFCzeyin kendi i\xE7indeki sapmas\u0131", "S\u0131zd\u0131rmazl\u0131k y\xFCzeyi", "Hay\u0131r"],
          ["Dairesellik", "\u25CB", "Kesitin daireden sapmas\u0131", "Piston, silindir", "Hay\u0131r"],
          ["D\xF6nme tolerans\u0131", "\u21BB", "D\xF6nerken y\xFCzeyin salg\u0131s\u0131", "\u015Eaft, mil", "Evet"]
        ]
      },
      {
        title: "Tolerans\u0131 Daraltmadan \xD6nce",
        description: "Dar tolerans her zaman do\u011Fru cevap de\u011Fildir; \xF6nce bu \xFC\xE7 soru sorulur",
        headers: ["Soru", "Neden Sorulur", "Tipik Sonu\xE7"],
        rows: [
          ["Bu kote montajda neyi belirliyor?", "Fonksiyonu olmayan kote gereksiz maliyet \xFCretir", "Kote gev\u015Fetilir"],
          ["\xD6l\xE7\xFC hangi datumdan al\u0131n\u0131yor?", "Referans de\u011Fi\u015Fimi tolerans\u0131 yeniden da\u011F\u0131t\u0131r", "Zincir k\u0131sal\u0131r"],
          ["Ka\xE7 ba\u011Flamada \xFCretilecek?", "Her ba\u011Flama yeni bir hata kayna\u011F\u0131d\u0131r", "Operasyon s\u0131ras\u0131 de\u011Fi\u015Fir"]
        ]
      }
    ]
  },
  {
    slug: "tasarim-rehberi-dfm",
    category: "kabiliyetler",
    categoryLabel: "M\xFChendislik Deste\u011Fi",
    title: "Tasar\u0131m Rehberi (DFM)",
    metaTitle: "DFM Analizi | Tasar\u0131m Rehberi | Maliyet Optimizasyonu | Mas Technic",
    /* 09a-C3 — F2a. "%70'e kadar maliyet tasarrufu" kaynaksız bir tasarruf
       oranıydı (§D `OTHER_PUBLIC_KPIS: NONE`, §G `CASE_STUDIES:
       NONE_PROVIDED_YET`) ve `metaDescription` içinde olduğu için sayfada
       değil arama sonucunda ve sosyal kartta da yayımlanıyordu. Aynı sayfanın
       SSS'i zaten "tasarrufun büyüklüğü parçaya bağlıdır" diyor; meta onunla
       çelişiyordu. Sayı gitti, kaldıraçlar kaldı. */
    metaDescription: "Design for Manufacturing (DFM/DFA) analizi ile tasar\u0131mlar\u0131n\u0131z\u0131 optimize edin. CNC ve enjeksiyon DFM kurallar\u0131, \xFCretilebilirlik incelemesi, par\xE7a baz\u0131nda maliyet kald\u0131ra\xE7lar\u0131.",
    description: "DFM/DFA analizi ile tasar\u0131mlar\u0131n\u0131z\u0131 \xFCretilebilirlik a\xE7\u0131s\u0131ndan optimize ediyoruz. \xDCretim maliyetlerini d\xFC\u015F\xFCren, kaliteyi art\u0131ran ve s\xFCreyi k\u0131saltan m\xFChendislik deste\u011Fi.",
    heroImage: "hero-dfm-tasarim",
    content: [
      "Design for Manufacturing (DFM) analiz s\xFCrecimiz 4 a\u015Famadan olu\u015Fur: ilk inceleme ve DFM raporu tasla\u011F\u0131, detayl\u0131 analiz ve optimizasyon \xF6nerileri, m\xFC\u015Fteri g\xF6r\xFC\u015Fmesi ve revize CAD modeli, final DFM raporu ve onay. S\xFCrecin takvimi par\xE7an\u0131n karma\u015F\u0131kl\u0131\u011F\u0131na ve gelen dosyan\u0131n eksiksizli\u011Fine ba\u011Fl\u0131d\u0131r; teklifle birlikte verilir.",
      "CNC i\u015Fleme DFM kurallar\u0131m\u0131z: \u0130\xE7 k\xF6\u015Fe yar\u0131\xE7ap\u0131 R > 0.5mm (sivri k\xF6\u015Felerden ka\xE7\u0131n\u0131n), duvar kal\u0131nl\u0131\u011F\u0131 > 0.8mm (\xE7ok ince duvarlardan ka\xE7\u0131n\u0131n), derinlik/\xE7ap oran\u0131 < 4:1 (\xE7ok derin deliklerden ka\xE7\u0131n\u0131n) ve standart boyut kullan\u0131m\u0131 (\xF6zel \xF6l\xE7\xFClerden ka\xE7\u0131n\u0131n). Enjeksiyon kal\u0131p DFM kurallar\u0131m\u0131z: Duvar kal\u0131nl\u0131\u011F\u0131 1.5-3mm, \xE7ekme pay\u0131 0.5-2\xB0, k\xF6\u015Fe yar\u0131\xE7ap\u0131 R > 0.5mm ve gate konumu kal\u0131n kesimden.",
      /* 09a-C3 — D1 düzeltmesinin bu sayfadaki YAN ETKİSİ, oluşturulmuş DOM'da
         görüldü. `technicalSpecs`teki "Desteklenen CAD" satırı artık
         türetilmiş listeyi basıyor; bu cümle ise birkaç satır aşağıda "yaygın
         CAD formatlarını doğrudan işleyebiliyoruz" diyordu. Aynı ekranda iki
         farklı kabul ölçütü. Cümle, gerçekte olan şeye çevrildi: analiz teklif
         akışına yüklenen modelin üzerinden yürür. */
      "Analiz, teklif ak\u0131\u015F\u0131na y\xFCklenen kat\u0131 model \xFCzerinden y\xFCr\xFCt\xFCl\xFCr; modelle birlikte \xF6l\xE7\xFClendirilmi\u015F teknik resim g\xF6nderilmesi analiz s\xFCresini k\u0131salt\u0131r. Tak\u0131m yollar\u0131 \xFCretim \xF6ncesinde sim\xFClasyonla do\u011Frulan\u0131r ve \xE7arp\u0131\u015Fma kontrol\xFC yap\u0131l\u0131r.",
      "DFM analizinde tipik olarak bakt\u0131\u011F\u0131m\u0131z kald\u0131ra\xE7lar: montaj\u0131 tek par\xE7aya indirgemek, ba\u011Flama say\u0131s\u0131n\u0131 azaltmak, tak\u0131m eri\u015Fimini kolayla\u015Ft\u0131rmak, gereksiz dar toleranslar\u0131 gev\u015Fetmek ve malzemeyi fonksiyona g\xF6re yeniden se\xE7mek. Hangisinin ne kadar etki edece\u011Fi par\xE7an\u0131n geometrisine ve mevcut \xFCretim plan\u0131na ba\u011Fl\u0131d\u0131r; beklenen etki analiz raporunda par\xE7a baz\u0131nda verilir."
    ],
    features: [
      "DFM Analizi \u2014 4 a\u015Famal\u0131 inceleme, analiz, g\xF6r\xFC\u015Fme ve raporlama",
      "CNC \u0130\u015Fleme DFM Kurallar\u0131 \u2014 K\xF6\u015Fe, duvar, derinlik optimizasyonu",
      "Enjeksiyon Kal\u0131p DFM \u2014 Duvar kal\u0131nl\u0131\u011F\u0131, \xE7ekme pay\u0131, gate konumu",
      /* 09a-C3. Oluşturulmuş DOM'da bu madde, türetilmiş "Desteklenen CAD"
         satırının hemen altında duruyordu: ekranda önce "STEP … 3MF", hemen
         ardından "CATIA, SolidWorks, NX" okunuyor ve okuyucu bunları tek bir
         kabul listesi gibi birleştiriyordu. Ayrıca adlandırılmış CAM/CAD
         yazılımı bir YAZILIM ENVANTERİDİR — `claims-gate.mjs`
         `named-enterprise-system` kuralının dayanağı: §D "no software or
         automation-system inventory was supplied". Kabiliyet kalır, envanter
         gider. */
      "CAD/CAM Entegrasyonu \u2014 kat\u0131 model, tak\u0131m yolu ve revizyon tek ak\u0131\u015Fta",
      "Sim\xFClasyon \u2014 tak\u0131m yolu do\u011Frulama ve \xE7arp\u0131\u015Fma kontrol\xFC",
      "Maliyet Optimizasyonu \u2014 Par\xE7a say\u0131s\u0131, ba\u011Flama ve tolerans kald\u0131ra\xE7lar\u0131"
    ],
    technicalSpecs: [
      { label: "Analiz S\xFCresi", value: LEAD_TIME_SHORT },
      { label: "Rapor Format\u0131", value: "PDF + revize CAD" },
      /* 09a-C3 — D1 ile aynı sınıf: "CATIA, NX, SW" hiçbiri kabul edilmiyor. */
      { label: "Desteklenen CAD", value: CAD_UPLOAD_FORMATS },
      { label: "Revizyon", value: "2 tur dahil" },
      /* 09a-C3 — F2b. "Ortalama %30-50" kaynaksızdı ve bu sayfanın kendi
         SSS'i tarafından yalanlanıyordu ("tasarrufun büyüklüğü parçanın
         geometrisine ve mevcut üretim planına bağlıdır"). Satır bir ORTALAMA
         vaat ediyordu; yerine analizde gerçekten bakılan kaldıraçlar yazıldı,
         ki bunlar sayfanın `content[3]` bölümünde zaten sayılıyor. */
      { label: "Maliyet Kald\u0131ra\xE7lar\u0131", value: "Par\xE7a say\u0131s\u0131, ba\u011Flama, tolerans" },
      { label: "Sim\xFClasyon", value: "Tak\u0131m yolu do\u011Frulama" }
    ],
    processSteps: [
      "CAD Model Y\xFCkleme",
      "\u0130lk \u0130nceleme",
      "Detayl\u0131 Analiz",
      "M\xFC\u015Fteri G\xF6r\xFC\u015Fmesi",
      "CAD Revizyon",
      "Final DFM Raporu"
    ],
    advantages: [
      "D\xF6rt a\u015Famal\u0131 DFM s\xFCreci: inceleme, analiz, g\xF6r\xFC\u015Fme, rapor",
      /* 09a-C3 — yukarıdaki `features` maddesiyle aynı gerekçe, aynı sayfa. */
      "M\xFC\u015Fteri modeli \xFCzerinden \xE7al\u0131\u015Fma: gelen kat\u0131 model revize edilip geri g\xF6nderilir",
      "\xDCretim \xF6ncesi tak\u0131m yolu sim\xFClasyonu ve \xE7arp\u0131\u015Fma kontrol\xFC",
      "Par\xE7a say\u0131s\u0131, ba\u011Flama say\u0131s\u0131 ve i\u015Flem ad\u0131m\u0131 azaltma f\u0131rsatlar\u0131n\u0131n \xE7\u0131kar\u0131lmas\u0131",
      "Enjeksiyon kal\u0131p ve CNC i\u015Fleme \xF6zel DFM kurallar\u0131",
      "Dijital ikiz ile \xFCretim \xF6ncesi do\u011Frulama"
    ],
    faq: [
      /* 09a-C3 — D3. "İlk DFM değerlendirmesi ücretsizdir" bir BEDELSİZLİK
         TAAHHÜDÜ, yani 09a-C2'nin sohbet botundan kaldırdığı ticari politika
         sınıfı; `USER_INPUTS.md` hiçbir alanı böyle bir tarife vermiyor. Bir
         politika hedge'e yumuşatılamaz — okuyucuya bir sayı değil bir kural
         söyleniyor — bu yüzden ödeme koşulları ve iade taahhüdünde olduğu
         gibi yerine MEKANİZMA yazıldı. Sorunun kendisi gerçek bir sorudur ve
         `/sss` de Phase 07'de aynı gerekçeyle silmeyip yeniden yazmıştı. */
      { question: "DFM analizi \xFCcreti var m\u0131?", answer: "Yay\u0131mlanan sabit bir DFM \xFCcret tarifemiz yok. Gelen dosyan\u0131n \xFCretilebilirlik incelemesi teklif haz\u0131rl\u0131\u011F\u0131n\u0131n bir ad\u0131m\u0131d\u0131r; ayr\u0131ca talep edilen detayl\u0131 DFM raporu ve CAD revizyonlar\u0131 ise kapsam\u0131yla birlikte teklifte fiyatland\u0131r\u0131l\u0131r." },
      { question: "DFM analizi ne kadar s\xFCrer?", answer: `S\xFCre\xE7 d\xF6rt a\u015Famadan olu\u015Fur: ilk inceleme, detayl\u0131 analiz, m\xFC\u015Fteri g\xF6r\xFC\u015Fmesi ve final rapor. Takvim par\xE7an\u0131n karma\u015F\u0131kl\u0131\u011F\u0131na ve g\xF6nderilen dosyan\u0131n eksiksizli\u011Fine g\xF6re de\u011Fi\u015Fir. ${LEAD_TIME_STATEMENT}` },
      /* 09a-C3 — D2. Bu liste BUGÜN DOĞRUYDU ve tam da bu yüzden kaldırıldı:
         elle yazılmış olduğu için doğrulayıcı değiştiği gün sessizce yanlışa
         dönerdi. Doğru olan bir sabit, yine de bir sabittir. */
      {
        question: "Hangi CAD formatlar\u0131n\u0131 kabul ediyorsunuz?",
        answer: `Teklif ak\u0131\u015F\u0131ndaki y\xFCkleyici \u015Fu uzant\u0131lar\u0131 do\u011Frular: ${CAD_UPLOAD_EXTENSIONS} \u2014 listede olmayan bir uzant\u0131 y\xFCkleme ad\u0131m\u0131ndan ge\xE7mez. Yerel CAD kayd\u0131n\u0131z\u0131 veya \xF6l\xE7\xFClendirilmi\u015F teknik resminizi sales@mastechnic.com adresine iletirseniz teklif i\xE7in de\u011Ferlendiririz.`
      },
      { question: "DFM analizi ne kadar tasarruf sa\u011Flar?", answer: "Tasarrufun b\xFCy\xFCkl\xFC\u011F\xFC par\xE7an\u0131n geometrisine ve mevcut \xFCretim plan\u0131na ba\u011Fl\u0131d\u0131r. DFM analizinde par\xE7a say\u0131s\u0131, ba\u011Flama say\u0131s\u0131, tak\u0131m eri\u015Fimi ve tolerans zinciri de\u011Ferlendirilir; beklenen etki analiz raporunda par\xE7a baz\u0131nda verilir." }
    ],
    comparisonTables: [
      {
        title: "CNC \u0130\u015Fleme DFM Kontrol Listesi",
        description: "Tasar\u0131m\u0131n\u0131z\u0131 \xFCretim \xF6ncesi bu kriterlere g\xF6re de\u011Ferlendirin",
        headers: ["Kriter", "\xD6nerilen De\u011Fer", "Min. / Maks.", "Kural", "Etki"],
        rows: [
          ["\u0130\xE7 K\xF6\u015Fe Yar\u0131\xE7ap\u0131", "R \u2265 1mm", "R > 0.5mm", "Sivri k\xF6\u015Felerden ka\xE7\u0131n\u0131n", "Tak\u0131m k\u0131r\u0131lma riski azal\u0131r"],
          ["Duvar Kal\u0131nl\u0131\u011F\u0131", "\u2265 1.5mm (metal)", "\u2265 0.8mm", "\u0130nce duvarlardan ka\xE7\u0131n\u0131n", "Titre\u015Fim ve deformasyon \xF6nlenir"],
          ["Derinlik/\xC7ap Oran\u0131", "< 3:1", "< 4:1", "Derin deliklerden ka\xE7\u0131n\u0131n", "Tak\u0131m sapmas\u0131 minimize edilir"],
          ["Di\u015F Derinli\u011Fi", "\u2264 3\xD7\xE7ap", "\u2264 5\xD7\xE7ap", "\xC7ok derin di\u015F a\xE7maktan ka\xE7\u0131n\u0131n", "K\u0131r\u0131lma riski azal\u0131r"],
          ["Tolerans", "ISO 2768-m", "\xB10.01mm (kritik koteler)", "Gereksiz dar toleranstan ka\xE7\u0131n\u0131n", "Maliyet ve termin d\xFC\u015Fer"],
          ["Y\xFCzey Kalitesi", "Ra 1.6\xB5m", "Ra 0.1\xB5m (\xF6zel)", "Fonksiyona uygun Ra se\xE7in", "\u0130\u015Fleme s\xFCresi k\u0131sal\u0131r"]
        ]
      }
      /*
       * "DFM Başarı Vaka Çalışmaları" tablosu kaldırıldı.
       *
       * Dört satır dört müşteri projesi anlatıyordu — Motor Braketi
       * (Havacılık), Şanzıman Gövdesi (Otomotiv), Kateter Konnektörü
       * (Medikal), Sensör Muhafazası (Elektronik) — her biri sayısal bir
       * tasarruf oranıyla. USER_INPUTS.md §G CASE_STUDIES:
       * NONE_PROVIDED_YET ve IF_NONE:
       * REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT.
       * Ne proje ne de yayın izni verildi; tablonun tamamı uydurmaydı ve
       * "Gerçek vaka çalışmalarıyla kanıtlanmış" ifadesinin dayanağıydı.
       *
       * Yerine yeni içerik üretilmedi: hemen üstteki "CNC İşleme DFM Kontrol
       * Listesi" §G'nin istediği olgusal-olmayan kabiliyet içeriğidir ve
       * sayfada zaten duruyor. Gerçek iş geldiğinde şeması
       * src/content/caseStudies.ts içinde hazır bekliyor.
       */
    ]
  },
  {
    slug: "yuzey-islemleri-muhendislik",
    category: "kabiliyetler",
    categoryLabel: "M\xFChendislik Deste\u011Fi",
    title: "Y\xFCzey \u0130\u015Flemleri Rehberi",
    metaTitle: "Y\xFCzey \u0130\u015Flemleri Rehberi | Anodizasyon, Nitr\xFCrleme, Toz Boya | Mas Technic",
    metaDescription: "Korozyon korumas\u0131ndan estetik kaplamaya y\xFCzey i\u015Flem se\xE7im rehberi. Anodizasyon (10-75\xB5m), toz boya (60-120\xB5m), nikelaj, elektropolish. Ra 0.1-12.5\xB5m y\xFCzey kalitesi.",
    description: "Korozyon korumas\u0131ndan elektriksel yal\u0131t\u0131ma, dekoratif g\xF6r\xFCn\xFCmden tribolojik \xF6zelliklere kadar uygulaman\u0131za en uygun y\xFCzey i\u015Flem y\xF6ntemini belirlemenize yard\u0131mc\u0131 oluyoruz.",
    heroImage: "hero-yuzey-islemleri",
    content: [
      "Y\xFCzey i\u015Flemi se\xE7im matrisimiz: Korozyon korumas\u0131 i\xE7in anodizasyon (al\xFCminyum \u2014 koruyucu tabaka), sertlik art\u0131rma i\xE7in nitr\xFCrleme (\xE7elik \u2014 y\xFCzey sertli\u011Fi), estetik kaplama i\xE7in toz boya (metal \u2014 renkli kaplama) ve elektriksel yal\u0131t\u0131m i\xE7in e-kap (al\xFCminyum \u2014 yal\u0131t\u0131m). Her ihtiyaca \xF6zel \xE7\xF6z\xFCm sunuyoruz.",
      "Y\xFCzey p\xFCr\xFCzl\xFCl\xFC\u011F\xFC (Ra) rehberimiz: Ra 0.1-0.2\xB5m ayna parlakl\u0131\u011F\u0131 (optik, yatak uygulamalar\u0131), Ra 0.4-0.8\xB5m parlak y\xFCzey (mil, piston), Ra 1.6-3.2\xB5m mat y\xFCzey (genel mekanik) ve Ra 6.3-12.5\xB5m p\xFCr\xFCzl\xFC y\xFCzey (yap\u0131sal par\xE7alar). \u0130\u015Fleme y\xF6ntemi ve tak\u0131m se\xE7imi ile hedef Ra de\u011Ferine ula\u015F\u0131yoruz.",
      "Kaplama kal\u0131nl\u0131klar\u0131 ve toleranslar\u0131: Anodizasyon Tip II 10-25\xB5m (\xB13\xB5m), Anodizasyon Tip III 25-75\xB5m (\xB15\xB5m), toz boya 60-120\xB5m (\xB115\xB5m) ve nikelaj 5-20\xB5m (\xB12\xB5m). Kaplama sonras\u0131 boyut de\u011Fi\u015Fimi hesaba kat\u0131larak i\u015Fleme toleranslar\u0131 belirlenir.",
      "Y\xFCzey i\u015Flemi sonras\u0131 tolerans etkileri: Anodizasyon +kal\u0131nl\u0131k\xD72 (\xB15\xB5m), toz boya +kal\u0131nl\u0131k\xD72 (\xB120\xB5m), kumlama -5 ile -20\xB5m (\xB110\xB5m) ve elektropolish -10 ile -50\xB5m (\xB15\xB5m). Bu de\u011Ferler i\u015Fleme planlamas\u0131nda dikkate al\u0131narak boyutsal do\u011Fruluk korunur."
    ],
    features: [
      "Y\xFCzey \u0130\u015Flem Se\xE7im Matrisi \u2014 \u0130htiyaca \xF6zel y\xF6ntem belirleme",
      "Ra P\xFCr\xFCzl\xFCl\xFCk Rehberi \u2014 Ra 0.1\xB5m'den 12.5\xB5m'ye kadar",
      "Kaplama Kal\u0131nl\u0131k Kontrol\xFC \u2014 Anodizasyon, toz boya, nikelaj",
      "Tolerans Etki Analizi \u2014 \u0130\u015Flem sonras\u0131 boyut de\u011Fi\u015Fimi hesaplama",
      "Korozyon Analizi \u2014 Tuz spreyi ve \xE7evresel test deste\u011Fi",
      "Renk ve Estetik \xC7\xF6z\xFCmler \u2014 RAL/Pantone renk e\u015Fle\u015Ftirme"
    ],
    technicalSpecs: [
      { label: "Anodizasyon Tip II", value: "10-25\xB5m (\xB13\xB5m)" },
      { label: "Anodizasyon Tip III", value: "25-75\xB5m (\xB15\xB5m)" },
      { label: "Toz Boya", value: "60-120\xB5m (\xB115\xB5m)" },
      { label: "Nikelaj", value: "5-20\xB5m (\xB12\xB5m)" },
      { label: "Min. Y\xFCzey Ra", value: "0.1\xB5m (ayna)" },
      { label: "Maks. Y\xFCzey Ra", value: "12.5\xB5m (p\xFCr\xFCzl\xFC)" }
    ],
    faq: [
      { question: "Hangi y\xFCzey i\u015Flemi benim par\xE7ama uygun?", answer: "Uygulamaya g\xF6re de\u011Fi\u015Fir: Korozyon korumas\u0131 i\xE7in anodizasyon veya nikelaj, sertlik art\u0131rma i\xE7in nitr\xFCrleme, estetik i\xE7in toz boya veya eloksal, elektriksel yal\u0131t\u0131m i\xE7in e-kap \xF6neriyoruz. M\xFChendislik ekibimiz detayl\u0131 analiz yapabilir." },
      { question: "Y\xFCzey i\u015Flemi boyut de\u011Fi\u015Fikli\u011Fine neden olur mu?", answer: "Evet, anodizasyon kal\u0131nl\u0131k\xD72 kadar boyut art\u0131\u015F\u0131, kumlama 5-20\xB5m boyut azalmas\u0131 yapar. Bu de\u011Ferler i\u015Fleme toleranslar\u0131nda dikkate al\u0131n\u0131r." },
      { question: "Ra 0.1\xB5m y\xFCzey kalitesine ula\u015Fabilir misiniz?", answer: "Evet, \xF6zel tak\u0131m ve i\u015Fleme parametreleri ile Ra 0.1\xB5m ayna parlakl\u0131\u011F\u0131nda y\xFCzey kalitesine ula\u015Fabiliyoruz. Optik ve yatak uygulamalar\u0131 i\xE7in idealdir." }
    ],
    comparisonTables: [
      {
        title: "Y\xFCzey \u0130\u015Flemi Se\xE7im Matrisi",
        description: "Uygulaman\u0131za g\xF6re en uygun y\xFCzey i\u015Flem y\xF6ntemini belirleyin",
        headers: ["Y\xFCzey \u0130\u015Flemi", "Uyumlu Malzemeler", "Temel Fonksiyon", "Tipik Ra (\xB5m)", "Kaplama Kal\u0131nl\u0131\u011F\u0131", "Maliyet"],
        rows: [
          ["Eloksal (Anodize) Tip II", "Al\xFCminyum, Titanyum", "Korozyon direnci, renk", "0.8 \u2013 1.6", "10\u201325\xB5m (\xB13\xB5m)", "$$"],
          ["Sert Eloksal (Tip III)", "Al\xFCminyum", "Sertlik, a\u015F\u0131nma direnci", "0.8 \u2013 1.6", "25\u201375\xB5m (\xB15\xB5m)", "$$$"],
          ["Kumlama (Bead Blast)", "Metaller, Plastikler", "Mat y\xFCzey, p\xFCr\xFCz giderme", "1.6 \u2013 3.2", "N/A", "$"],
          ["Nikel Kaplama", "\xC7elik, Bak\u0131r", "A\u015F\u0131nma direnci, iletkenlik", "0.4 \u2013 0.8", "5\u201320\xB5m (\xB12\xB5m)", "$$$"],
          ["Toz Boya", "T\xFCm Metaller", "Dekoratif, d\u0131\u015F ortam", "N/A", "60\u2013120\xB5m (\xB115\xB5m)", "$$"],
          ["Elektropolish", "Paslanmaz \xC7elik", "Parlak y\xFCzey, hijyen", "0.1 \u2013 0.4", "-10 ile -50\xB5m", "$$$"],
          ["Nitr\xFCrleme", "\xC7elik", "Y\xFCzey sertli\u011Fi", "De\u011Fi\u015Fmez", "0.1\u20130.5mm dif\xFCzyon", "$$$$"]
        ]
      },
      {
        title: "Y\xFCzey P\xFCr\xFCzl\xFCl\xFC\u011F\xFC (Ra) Rehberi",
        description: "Uygulamaya g\xF6re hedef Ra de\u011Ferleri ve elde etme y\xF6ntemleri",
        headers: ["Ra Aral\u0131\u011F\u0131 (\xB5m)", "Y\xFCzey G\xF6r\xFCn\xFCm\xFC", "Uygulama Alan\u0131", "\u0130\u015Fleme Y\xF6ntemi", "Ek Maliyet"],
        rows: [
          ["0.1 \u2013 0.2", "Ayna parlakl\u0131\u011F\u0131", "Optik, yatak y\xFCzeyleri", "Lepleme, polisaj", "+%80-100"],
          ["0.4 \u2013 0.8", "Parlak y\xFCzey", "Mil, piston, s\u0131zd\u0131rmazl\u0131k", "\u0130nce frezeleme, ta\u015Flama", "+%40-60"],
          ["1.6 \u2013 3.2", "Mat y\xFCzey", "Genel mekanik par\xE7alar", "Standart CNC i\u015Fleme", "Standart"],
          ["6.3 \u2013 12.5", "P\xFCr\xFCzl\xFC y\xFCzey", "Yap\u0131sal, kaynak \xF6ncesi", "Kaba i\u015Fleme, kumlama", "-%10-20"]
        ]
      },
      {
        title: "\u0130\u015Flem Sonras\u0131 Boyut De\u011Fi\u015Fimi",
        description: "Y\xFCzey i\u015Flemi sonras\u0131 tolerans etkileri \u2014 i\u015Fleme planlamas\u0131nda dikkate al\u0131nmal\u0131d\u0131r",
        headers: ["Y\xFCzey \u0130\u015Flemi", "Boyut De\u011Fi\u015Fimi", "Tolerans Etkisi", "Planlama Notu"],
        rows: [
          ["Anodizasyon Tip II", "+kal\u0131nl\u0131k \xD7 2", "\xB15\xB5m", "Kal\u0131nl\u0131\u011F\u0131n yar\u0131s\u0131 malzemeye n\xFCfuz eder"],
          ["Anodizasyon Tip III", "+kal\u0131nl\u0131k \xD7 2", "\xB110\xB5m", "\u0130\u015Fleme boyutunda kaplama pay\u0131 b\u0131rak\u0131n"],
          ["Toz Boya", "+kal\u0131nl\u0131k \xD7 2", "\xB120\xB5m", "Kritik y\xFCzeyleri maskeleyin"],
          ["Kumlama", "-5 ile -20\xB5m", "\xB110\xB5m", "Hassas y\xFCzeyleri maskeleyin"],
          ["Elektropolish", "-10 ile -50\xB5m", "\xB15\xB5m", "Malzeme kald\u0131r\u0131l\u0131r, boyut k\xFC\xE7\xFCl\xFCr"]
        ]
      }
    ]
  },
  {
    slug: "dusuk-hacimli-uretim",
    category: "kabiliyetler",
    categoryLabel: "Prototipten Seri \xDCretime",
    title: "D\xFC\u015F\xFCk Hacimli \xDCretim",
    metaTitle: "D\xFC\u015F\xFCk Hacimli \xDCretim | 1-1000 Adet | 3D Bask\u0131, Silikon Kal\u0131p, CNC | Mas Technic",
    metaDescription: "3D bask\u0131 ile h\u0131zl\u0131 prototip, silikon kal\u0131plama ile 10-100 adet, h\u0131zl\u0131 al\xFCminyum kal\u0131p ile 1000 adete kadar \xFCretim. FDM, SLA, SLS, DMLS teknolojileri.",
    description: "3D bask\u0131, silikon kal\u0131plama, h\u0131zl\u0131 al\xFCminyum kal\u0131p ve CNC i\u015Fleme ile 1-1000 adet aras\u0131 d\xFC\u015F\xFCk hacimli \xFCretim ihtiya\xE7lar\u0131n\u0131za esnek \xE7\xF6z\xFCmler sunuyoruz.",
    heroImage: "hero-seri-uretim",
    content: [
      "D\xFC\u015F\xFCk hacimli \xFCretim y\xF6ntemlerimizin kar\u015F\u0131la\u015Ft\u0131rmas\u0131: 3D bask\u0131 1-10 adet (d\xFC\u015F\xFCk maliyet, \xB10.2mm), silikon kal\u0131plama 10-100 adet (orta maliyet, \xB10.1mm), al\xFCminyum kal\u0131p 100-1000 adet (orta maliyet, \xB10.05mm) ve CNC i\u015Fleme 1-100 adet (y\xFCksek maliyet, \xB10.01mm). Projenizin adet, s\xFCre ve hassasiyet gereksinimlerine g\xF6re en uygun y\xF6ntemi belirliyoruz; her y\xF6ntemin termini teklifle birlikte verilir.",
      "Eklemeli imalat se\xE7enekleri par\xE7an\u0131n i\u015Flevine g\xF6re ayr\u0131\u015F\u0131r: FDM (ABS, PLA, naylon) bi\xE7im ve montaj denemeleri, SLA (re\xE7ine) ince detay ve y\xFCzey, SLS (PA12, TPU) destek yap\u0131s\u0131 gerektirmeyen fonksiyonel par\xE7alar, DMLS ise metal fonksiyonel prototipler i\xE7in kullan\u0131l\u0131r.",
      "Silikon kal\u0131plama s\xFCrecimiz 4 a\u015Famadan olu\u015Fur: 1) Master model \u2014 3D bask\u0131 veya CNC ile \xFCretim, 2) Silikon kal\u0131p \u2014 vakumlu kal\u0131plama, 3) D\xF6k\xFCm \u2014 PU/silikon/EP d\xF6k\xFCm, 4) Finisaj \u2014 y\xFCzey i\u015Flemleri ve kalite kontrol. Toplam terminde belirleyici olan master modelin haz\u0131rlanmas\u0131 ve d\xF6k\xFCm adedidir; termin teklifle birlikte verilir.",
      "Al\xFCminyum kal\u0131p \xE7\xF6z\xFCm\xFC, \xE7elik kal\u0131ba g\xF6re daha h\u0131zl\u0131 i\u015Flenebildi\u011Fi i\xE7in d\xFC\u015F\xFCk ve orta hacimli i\u015Flerde tercih edilir. Bas\u0131n\xE7l\u0131 d\xF6k\xFCm ve enjeksiyon kal\u0131p pilot \xFCretimlerinde, seri kal\u0131p yat\u0131r\u0131m\u0131 \xF6ncesinde tasar\u0131m\u0131n do\u011Frulanmas\u0131n\u0131 sa\u011Flar."
    ],
    features: [
      "3D Bask\u0131 (FDM/SLA/SLS/DMLS) \u2014 konsept do\u011Frulama ve h\u0131zl\u0131 prototip",
      "Silikon Kal\u0131plama \u2014 10-100 adet PU/silikon/EP d\xF6k\xFCm",
      "Al\xFCminyum Kal\u0131p \u2014 pilot \xFCretim ve tasar\u0131m do\u011Frulamas\u0131 i\xE7in",
      "CNC \u0130\u015Fleme \u2014 1-100 adet \xB10.01mm hassasiyette",
      /* 09a-C3 — F3, birinci yer. Model adı gitti, süreç kaldı: Al/SS/Ti'de
         DMLS bir KABİLİYETTİR; onu yapan tezgâh ise ENVANTERDİR ve §D
         `MACHINE_COUNT: PRIVATE_DO_NOT_DISCLOSE` / §0
         `DO_NOT_EMPHASIZE_COMPANY_SCALE` kapsamındadır. Phase 06 adlandırılmış
         modelleri makine parkı sayfasından aynı gerekçeyle kaldırmıştı; bu
         ikisi o süpürmenin dışında kalmıştı. */
      "Metal 3D Bask\u0131 (DMLS) \u2014 al\xFCminyum, paslanmaz \xE7elik ve titanyum",
      "Fonksiyonel Prototip \u2014 Seri \xFCretim malzemesi ile test"
    ],
    technicalSpecs: [
      { label: "Min. Adet", value: "1 adet" },
      { label: "Maks. Adet", value: "1.000 adet" },
      { label: "Y\xF6ntemler", value: "3D bask\u0131, silikon kal\u0131p, Al kal\u0131p, CNC" },
      { label: "Termin", value: LEAD_TIME_SHORT }
    ],
    processSteps: [
      "Y\xF6ntem Se\xE7imi",
      "CAD/Model Haz\u0131rl\u0131\u011F\u0131",
      "Master Model \xDCretimi",
      "Kal\u0131p/Bask\u0131 \u0130\u015Flemi",
      "Finisaj & Y\xFCzey",
      "Kalite Kontrol",
      "Paketleme & Teslim"
    ],
    advantages: [
      "4 farkl\u0131 y\xF6ntem ile her ihtiyaca uygun \xE7\xF6z\xFCm",
      "Y\xF6ntem se\xE7imi adet, tolerans ve termin dengesine g\xF6re yap\u0131l\u0131r",
      "Metal ve plastik 3D bask\u0131 kapasitesi",
      "Silikon kal\u0131p ile d\xFC\u015F\xFCk kal\u0131p maliyeti",
      "Seri \xFCretim \xF6ncesi pilot do\u011Frulama",
      "Fonksiyonel prototip ile ger\xE7ek ko\u015Fullarda test"
    ],
    faq: [
      { question: "Prototip i\xE7in hangi y\xF6ntem en uygun?", answer: `1-10 adet ve h\u0131zl\u0131 konsept do\u011Frulamas\u0131 i\xE7in 3D bask\u0131, \xB10.01mm hassasiyet gereken par\xE7alar i\xE7in CNC, 10-100 adet plastik par\xE7a i\xE7in silikon kal\u0131plama \xF6neriyoruz. ${LEAD_TIME_STATEMENT}` },
      /* 09a-C3 — F3, ikinci yer ve daha ağır olanı: bu bir `faq` girdisi,
         yani `collectServiceFaqs()` ile sohbet havuzunun 78. kaydı. Model adı
         botun bir soruyla ulaşılabildiği bir envanter bilgisiydi. */
      { question: "Metal 3D bask\u0131 yapabiliyor musunuz?", answer: "Evet. DMLS (do\u011Frudan metal lazer sinterleme) ile al\xFCminyum, paslanmaz \xE7elik ve titanyum malzemelerde metal 3D bask\u0131 yap\u0131yoruz; par\xE7a \xF6l\xE7\xFCs\xFC ve ula\u015F\u0131labilir tolerans teknik incelemede de\u011Ferlendirilir." },
      { question: "Silikon kal\u0131ptan ka\xE7 par\xE7a \xE7\u0131kar?", answer: "Bir silikon kal\u0131ptan ortalama 20-50 par\xE7a \xFCretilebilir. Malzeme ve geometriye g\xF6re bu say\u0131 de\u011Fi\u015Febilir." },
      { question: "D\xFC\u015F\xFCk hacimden seri \xFCretime ge\xE7i\u015F nas\u0131l olur?", answer: "Prototip ve pilot \xFCretimden sonra onaylanan tasar\u0131m i\xE7in \xE7elik kal\u0131p yat\u0131r\u0131m\u0131 veya otomasyonlu CNC seri \xFCretim planlamas\u0131 yap\u0131l\u0131r. Ge\xE7i\u015F s\xFCreci proje y\xF6neticimiz taraf\u0131ndan koordine edilir." }
    ],
    comparisonTables: [
      {
        title: "\xDCretim Y\xF6ntemi Kar\u015F\u0131la\u015Ft\u0131rmas\u0131 (Maliyet vs. Adet)",
        description: "Adet say\u0131s\u0131na g\xF6re en uygun \xFCretim y\xF6ntemini se\xE7in \u2014 k\xF6pr\xFC \xFCretim stratejisi i\xE7in kritik",
        /* 09a-C2: the "Teslimat" column carried six delivery windows, from
           "1-3 gün" to "4-8 hafta". The table's stated job — "Maliyet vs. Adet"
           — is served by adet, maliyet, tolerans and kalıp yatırımı; the
           duration column was the only unauthorised thing in it and it is
           removed rather than blanked six times over. */
        headers: ["Y\xF6ntem", "Adet Aral\u0131\u011F\u0131", "Birim Maliyet", "Tolerans", "Kal\u0131p Yat\u0131r\u0131m\u0131"],
        rows: [
          ["3D Bask\u0131 (FDM/SLA)", "1 \u2013 10", "$$$", "\xB10.2mm", "Yok"],
          ["3D Bask\u0131 (SLS/DMLS)", "1 \u2013 50", "$$$$", "\xB10.1mm", "Yok"],
          ["CNC \u0130\u015Fleme", "1 \u2013 100", "$$$", "\xB10.01mm", "Yok"],
          ["Silikon Kal\u0131plama", "10 \u2013 100", "$$", "\xB10.1mm", "D\xFC\u015F\xFCk ($)"],
          ["H\u0131zl\u0131 Al Kal\u0131p", "100 \u2013 1.000", "$", "\xB10.05mm", "Orta ($$)"],
          ["\xC7elik Kal\u0131p (Enjeksiyon)", "1.000+", "$", "\xB10.03mm", "Y\xFCksek ($$$$$)"]
        ],
        highlight: 4
      }
    ]
  },
  {
    slug: "seri-imalat",
    category: "kabiliyetler",
    categoryLabel: "Prototipten Seri \xDCretime",
    title: "Seri \u0130malat",
    metaTitle: "Seri \u0130malat | Tekrarlanabilir Kurulum ve Kontrol Plan\u0131 | Mas Technic",
    metaDescription: "Seri imalatta belirleyici olan tek par\xE7ay\u0131 \xFCretmek de\u011Fil, y\xFCz\xFCnc\xFC par\xE7ay\u0131 ilkiyle ayn\u0131 \xE7\u0131karmakt\u0131r: standart kurulum, kontrol plan\u0131 ve parti izlenebilirli\u011Fi.",
    description: "\xC7elik kal\u0131p, bas\u0131n\xE7l\u0131 d\xF6k\xFCm, otomasyonlu CNC ve montaj hatlar\u0131 ile y\xFCksek hacimli seri \xFCretimde tutarl\u0131l\u0131k ve verimlilik hedefliyoruz.",
    heroImage: "hero-seri-uretim",
    content: [
      /* PHASE 07 CORRECTION #1 — F1. This sentence published three annual
         production volumes in the first person ("Seri üretim
         kapasitelerimiz: … 50.000 adet/yıl … 500.000 adet/yıl …
         1.000.000 adet/yıl"). `USER_INPUTS.md` §0
         DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES and §D
         REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE withhold that class,
         and nothing in `USER_INPUTS.md` verifies the figures. KEPT is the
         process-specification half — ±0.01 mm and the CT casting-tolerance
         classes — the same class Phase 06 kept alongside MIL-A-8625 and
         ISO 2768-m, and the one §0 PUBLIC_POSITIONING_PRIORITY leads with. */
      "Seri \xFCretimde y\xF6ntem, par\xE7a geometrisi ve tolerans hedefine g\xF6re se\xE7ilir: CNC seri i\u015Fleme \xB10.01mm, bas\u0131n\xE7l\u0131 d\xF6k\xFCm CT4-CT6 ve enjeksiyon kal\u0131p CT5-CT7 kal\u0131p tolerans\u0131 aral\u0131\u011F\u0131nda \xE7al\u0131\u015F\u0131r.",
      "Seri i\u015Flerde kurulum bir kez yap\u0131l\u0131p unutulmaz: standart kurulum prosed\xFCr\xFC, sabit referans y\xFCzeyleri ve otomatik tak\u0131m de\u011Fi\u015Ftirme, partiler aras\u0131 sapmay\u0131 s\u0131n\u0131rlar. \u0130lk par\xE7a onaylanmadan seri ba\u015Flamaz.",
      "\xDCretim takibi, stok ve kapasite planlamas\u0131 tek bir kay\u0131t \xFCzerinden y\xFCr\xFCt\xFCl\xFCr; hangi partinin nerede oldu\u011Fu ve hangi kontrolden ge\xE7ti\u011Fi her an kay\u0131tl\u0131d\u0131r. Tedarik ihtiyac\u0131 bu kay\u0131t \xFCzerinden planlan\u0131r, m\xFC\u015Fteri portal\u0131ndan sipari\u015F durumu g\xF6r\xFClebilir.",
      "Parti i\xE7i tutarl\u0131l\u0131k, ara kontrollerin plana ba\u011Flanmas\u0131yla korunur. Kayma e\u011Filimi olan koteler \u2014 tak\u0131m a\u015F\u0131nmas\u0131na duyarl\u0131 \xE7aplar, \u0131s\u0131l i\u015Flem sonras\u0131 \xF6l\xE7\xFCler \u2014 ayr\u0131 bir kontrol ad\u0131m\u0131yla izlenir ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r."
    ],
    features: [
      "CNC Seri \u0130\u015Fleme \u2014 \xB10.01mm tolerans, sabit referans y\xFCzeyleri",
      "Bas\u0131n\xE7l\u0131 D\xF6k\xFCm \u2014 CT4-CT6 kal\u0131p tolerans\u0131",
      "Enjeksiyon Kal\u0131p \u2014 CT5-CT7 kal\u0131p tolerans\u0131",
      "Otomatik Tak\u0131m De\u011Fi\u015Ftirme \u2014 uzun partilerde kesintisiz i\u015Fleme",
      "Otomatik Palet De\u011Fi\u015Ftirme \u2014 kurulumun \xFCretimden ayr\u0131lmas\u0131",
      "\xDCretim Takibi \u2014 parti durumunun kay\u0131t alt\u0131nda olmas\u0131"
    ],
    technicalSpecs: [
      { label: "CNC Seri \u0130\u015Fleme", value: "\xB10.01mm tolerans" },
      { label: "Bas\u0131n\xE7l\u0131 D\xF6k\xFCm", value: "CT4-CT6 kal\u0131p tolerans\u0131" },
      { label: "Enjeksiyon Kal\u0131p", value: "CT5-CT7 kal\u0131p tolerans\u0131" },
      { label: "Kurulum", value: "Standart prosed\xFCr" },
      { label: "Kontrol", value: "Kontrol plan\u0131na g\xF6re" },
      { label: "Teslimat", value: "JIT uyumlu" }
    ],
    processSteps: [
      "Parti Kayd\u0131",
      "Pilot \xDCretim",
      "Seri \xDCretim Onay\u0131",
      "Otomasyon Kurulumu",
      "Seri \xDCretim Ba\u015Flang\u0131c\u0131",
      "SPC & Kalite Takibi",
      "JIT Teslimat"
    ],
    advantages: [
      "Standart kurulum prosed\xFCr\xFC ile partiler aras\u0131 tutarl\u0131l\u0131k",
      "Parti durumu \xFCretim boyunca kay\u0131t alt\u0131nda tutulur",
      "JIT teslimat ve Kanban sistemi entegrasyonu",
      "Kayma e\u011Filimi olan koteler ara kontrolle izlenir",
      "Lot bazl\u0131 tam izlenebilirlik",
      "\u0130lk par\xE7a onaylanmadan seri \xFCretim ba\u015Flamaz"
    ],
    faq: [
      /* The published minimums were the lower bounds of the same withheld
         volume ranges (F1); quoting them would have left half the disclosure
         standing. The answer now states how the threshold is DECIDED, which
         is the part that is actually true of every job. */
      { question: "Minimum seri \xFCretim adedi nedir?", answer: "Tek bir e\u015Fik yoktur; y\xF6nteme g\xF6re de\u011Fi\u015Fir. Kal\u0131p yat\u0131r\u0131m\u0131 gerektiren y\xF6ntemlerde (bas\u0131n\xE7l\u0131 d\xF6k\xFCm, enjeksiyon kal\u0131p) e\u015Fi\u011Fi kal\u0131p maliyetinin par\xE7a ba\u015F\u0131na da\u011F\u0131l\u0131m\u0131 belirler; CNC seri i\u015Flemede kurulum s\xFCresi belirleyicidir. Par\xE7a geometrisi ve tolerans hedefiyle birlikte teklif a\u015Famas\u0131nda netle\u015Ftiririz." },
      { question: "Teslimat program\u0131 d\xFCzenlenebiliyor mu?", answer: "Evet. Parti b\xFCy\xFCkl\xFC\u011F\xFC ve teslimat s\u0131kl\u0131\u011F\u0131 kapasite planlamas\u0131yla birlikte kararla\u015Ft\u0131r\u0131l\u0131r; periyodik teslimat programlar\u0131 d\xFCzenlenebilir." },
      { question: "Seri \xFCretimde tutarl\u0131l\u0131\u011F\u0131 nas\u0131l koruyorsunuz?", answer: "\u0130lk par\xE7a onay\u0131, standart kurulum prosed\xFCr\xFC ve kontrol plan\u0131na ba\u011Fl\u0131 ara kontroller ile. Kayma e\u011Filimi olan koteler ayr\u0131 bir ad\u0131mda izlenir ve \xF6l\xE7\xFCm sonu\xE7lar\u0131 kay\u0131t alt\u0131na al\u0131n\u0131r." },
      { question: "Uzun partilerde tezg\xE2h nas\u0131l besleniyor?", answer: "Otomatik tak\u0131m de\u011Fi\u015Ftirme ve bar besleme, uzun partilerde kesintisiz i\u015Flemeyi m\xFCmk\xFCn k\u0131lar. Hangi y\xF6ntemin kullan\u0131laca\u011F\u0131 par\xE7a geometrisi ve parti b\xFCy\xFCkl\xFC\u011F\xFCne g\xF6re planlan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Seri \xDCretim Y\xF6ntemi Se\xE7imi",
        description: "Par\xE7a geometrisi ve toleransa g\xF6re y\xF6ntem, kurulum ve kontrol yakla\u015F\u0131m\u0131",
        headers: ["\xDCretim Y\xF6ntemi", "Tipik Kullan\u0131m", "Tolerans", "Kurulum", "Kontrol Yakla\u015F\u0131m\u0131"],
        rows: [
          ["CNC Seri \u0130\u015Fleme", "Dar toleransl\u0131 metal par\xE7alar", "\xB10.01mm", "Standart prosed\xFCr + sabit referans", "\u0130lk par\xE7a + ara kontrol"],
          ["Bas\u0131n\xE7l\u0131 D\xF6k\xFCm", "Karma\u015F\u0131k formlu y\xFCksek hacim", "CT6-CT8", "Kal\u0131p ve d\xF6k\xFCm parametresi", "G\xF6rsel + boyutsal kontrol"],
          ["Enjeksiyon Kal\u0131p", "Plastik y\xFCksek hacim", "CT6-CT8", "Kal\u0131p ve proses penceresi", "\u0130lk par\xE7a + periyodik kontrol"]
        ]
      }
    ]
  },
  // ── Kabiliyetler > Süreç & Operasyon ──
  {
    slug: "proje-yonetimi",
    category: "kabiliyetler",
    categoryLabel: "S\xFCre\xE7 & Operasyon",
    title: "Proje Y\xF6netimi",
    metaTitle: "Proje Y\xF6netimi | Agile & Phase-Gate | Ger\xE7ek Zamanl\u0131 Raporlama | Mas Technic",
    metaDescription: "Tekliften teslimata be\u015F a\u015Famal\u0131, onay noktalar\u0131yla ilerleyen bir s\xFCre\xE7. Her a\u015Fama bir \xE7\u0131kt\u0131 \xFCretir ve bir sonraki a\u015Fama o \xE7\u0131kt\u0131 onaylanmadan ba\u015Flamaz.",
    description: "\xD6zel proje y\xF6neticiniz, ger\xE7ek zamanl\u0131 raporlama ve proaktif ileti\u015Fim ile projelerinizin her a\u015Famas\u0131nda yan\u0131n\u0131zday\u0131z. Tekliften teslimata kontroll\xFC ve \u015Feffaf s\xFCre\xE7 y\xF6netimi.",
    heroImage: "hero-proje-yonetimi",
    content: [
      "Proje y\xF6netimi metodolojilerimiz: Agile/Scrum (yaz\u0131l\u0131m entegre projeler \u2014 Jira, Confluence), Waterfall (geleneksel mekanik projeler \u2014 MS Project), Phase-Gate (seri \xFCretim projeleri \u2014 \xF6zel template). Projenizin yap\u0131s\u0131na g\xF6re en uygun metodoloji se\xE7ilerek uygulan\u0131r.",
      "Be\u015F a\u015Famal\u0131 proje s\xFCrecimiz: 1) De\u011Ferlendirme \u2014 teklif ve onay, 2) DFM analizi \u2014 rapor ve gerekirse tasar\u0131m revizyonu, 3) Prototip \u2014 numune par\xE7a, \xF6l\xE7\xFCm kayd\u0131 ve numune onay\u0131, 4) \xDCretim dosyas\u0131 \u2014 kontrol plan\u0131 ve izlenebilirlik dok\xFCmanlar\u0131, 5) Seri \xFCretim \u2014 parti raporu ve periyodik de\u011Ferlendirme.",
      "\u0130leti\u015Fim ve raporlama kanallar\u0131m\u0131z: proje toplant\u0131lar\u0131, m\xFC\u015Fteri portal\u0131 \xFCzerinden durum takibi, kritik a\u015Famalar\u0131n foto\u011Fraf ve video ile belgelenmesi, \xFCretim dosyas\u0131n\u0131n teslimi ve tasar\u0131m de\u011Fi\u015Fikli\u011Fi (ECO) y\xF6netimi prosed\xFCr\xFC.",
      "Proje y\xF6netimi yaz\u0131l\u0131mlar\u0131m\u0131z: Jira (g\xF6rev takibi \u2014 Git, Confluence entegrasyonu), Microsoft Project (zamanlama \u2014 Excel, PowerBI entegrasyonu) ve Slack/Teams (ileti\u015Fim \u2014 t\xFCm sistemlerle entegrasyon). Her proje i\xE7in \xF6zel bir proje y\xF6neticisi atan\u0131r ve ba\u015Ftan sona tek muhatap olarak hizmet verir."
    ],
    features: [
      "\xD6zel Proje Y\xF6neticisi \u2014 Ba\u015Ftan sona tek muhatap",
      "5 A\u015Famal\u0131 S\xFCre\xE7 \u2014 De\u011Ferlendirmeden seri \xFCretime kontroll\xFC ge\xE7i\u015F",
      "Agile/Scrum & Phase-Gate \u2014 Proje yap\u0131s\u0131na uygun metodoloji",
      "Ger\xE7ek Zamanl\u0131 Dashboard \u2014 \xDCretim durumu ve kalite metrikleri",
      "\xDCretim Dosyas\u0131 \u2014 kontrol plan\u0131 ve izlenebilirlik kay\u0131tlar\u0131",
      "ECO Y\xF6netimi \u2014 M\xFChendislik de\u011Fi\u015Fiklik prosed\xFCr\xFC"
    ],
    technicalSpecs: [
      /* 09a-C2: this row IS the quote-response SLA — "Değerlendirme" is how
         long MAS takes to come back with a price, which §D and §J authorise.
         It was a hand-written literal that happened to agree with the ledger;
         it now reads from the ledger, so it cannot drift away from it. */
      { label: "De\u011Ferlendirme", value: QUOTE_RESPONSE_TIME },
      /* 09a-C1 neutralised the DFM row and left "1-3 hafta" in the Prototip row
         directly beneath it. 09a-C2 finishes the column: the only duration left
         is the one with a source. */
      { label: "DFM Analizi", value: LEAD_TIME_SHORT },
      { label: "Prototip", value: LEAD_TIME_SHORT },
      { label: "\xDCretim Dosyas\u0131", value: "Numune onay\u0131 sonras\u0131" },
      { label: "Raporlama", value: "Haftal\u0131k + dashboard" },
      { label: "Ara\xE7lar", value: "Jira, MS Project, Slack" }
    ],
    processSteps: [
      "Teklif & De\u011Ferlendirme",
      "DFM Analizi",
      "Prototip \xDCretimi",
      "Test & Do\u011Frulama",
      "Numune Onay\u0131",
      "Seri \xDCretim Ba\u015Flatma",
      "S\xFCrekli \u0130yile\u015Ftirme"
    ],
    advantages: [
      "Deneyimli proje y\xF6neticisi ile tek muhatap",
      "Haftal\u0131k ilerleme raporlar\u0131 ve ger\xE7ek zamanl\u0131 dashboard",
      "Foto\u011Fraf/videolu kritik a\u015Fama belgeleme",
      "ECO prosed\xFCr\xFC ile kontroll\xFC de\u011Fi\u015Fiklik y\xF6netimi",
      "Jira/MS Project ile profesyonel proje takibi",
      "Kontrol plan\u0131 ve izlenebilirlik kay\u0131tlar\u0131n\u0131n teslimi"
    ],
    faq: [
      { question: "Her projeye \xF6zel proje y\xF6neticisi atan\u0131yor mu?", answer: "Evet, her projede \xF6zel bir proje y\xF6neticisi atan\u0131r ve tekliften teslimata kadar tek muhatap olarak hizmet verir." },
      { question: "Proje ilerlemesini nas\u0131l takip edebilirim?", answer: "Proje toplant\u0131lar\u0131, m\xFC\u015Fteri portal\u0131 \xFCzerinden durum takibi, kritik a\u015Famalar\u0131n foto\u011Fraf ve video kay\u0131tlar\u0131 ve \xFCretim dosyas\u0131 ile her a\u015Famay\u0131 takip edebilirsiniz." },
      { question: "Tasar\u0131m de\u011Fi\u015Fikli\u011Fi gerekti\u011Finde ne olur?", answer: "ECO (Engineering Change Order) prosed\xFCr\xFCm\xFCz ile kontroll\xFC bir \u015Fekilde de\u011Fi\u015Fiklik y\xF6netimi yap\u0131l\u0131r. Maliyet ve s\xFCre etkileri analiz edildikten sonra onay\u0131n\u0131zla revizyon uygulan\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Proje Y\xF6netim Metodolojileri Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        description: "Proje yap\u0131s\u0131na g\xF6re en uygun metodoloji se\xE7imi",
        headers: ["Metodoloji", "Uygun Proje Tipi", "S\xFCre\xE7 Esnekli\u011Fi", "Raporlama", "Ara\xE7lar", "Teslimat Yakla\u015F\u0131m\u0131"],
        rows: [
          ["Agile / Scrum", "Yaz\u0131l\u0131m entegre projeler", "\u2605\u2605\u2605\u2605\u2605", "Sprint bazl\u0131", "Jira, Confluence", "\u0130teratif \u2014 2 haftal\u0131k sprint"],
          ["Waterfall", "Geleneksel mekanik projeler", "\u2605\u2605\u2606\u2606\u2606", "A\u015Fama bazl\u0131", "MS Project", "S\u0131ral\u0131 \u2014 Phase-Gate onayl\u0131"],
          ["Phase-Gate", "Seri \xFCretim projeleri", "\u2605\u2605\u2605\u2606\u2606", "Gate Review", "\xD6zel template", "Kontroll\xFC ge\xE7i\u015F \u2014 onay noktalar\u0131yla"],
          ["Hibrit", "Karma\u015F\u0131k m\xFChendislik projeleri", "\u2605\u2605\u2605\u2605\u2606", "Haftal\u0131k + Sprint", "Jira + MS Project", "Esnek \u2014 proje ihtiyac\u0131na g\xF6re"]
        ]
      },
      {
        title: "Proje A\u015Famalar\u0131 ve S\xFCreleri",
        headers: ["A\u015Fama", "S\xFCre", "\xC7\u0131kt\u0131", "M\xFC\u015Fteri Onay\u0131", "\u0130leti\u015Fim Kanal\u0131"],
        rows: [
          /* 09a-C2: the "Süre" column now reads — quote SLA (sourced, from the
             ledger), Teklifle birlikte, Teklifle birlikte, Numune onayı
             sonrası, Devam eden. Exactly one cell carries a number and it is
             the only one §D and §J authorise. */
          ["1. De\u011Ferlendirme & Teklif", QUOTE_RESPONSE_TIME, "Detayl\u0131 teklif + zaman plan\u0131", "Teklif onay\u0131", "E-posta + Video konferans"],
          ["2. DFM Analizi", LEAD_TIME_SHORT, "DFM raporu + CAD revizyonu", "DFM onay\u0131", "Portal + Toplant\u0131"],
          ["3. Prototip \xDCretimi", LEAD_TIME_SHORT, "\xD6rnek par\xE7a + \xF6l\xE7\xFCm raporu", "Numune onay\u0131", "Foto\u011Fraf/video + rapor"],
          ["4. \xDCretim Dosyas\u0131", "Numune onay\u0131 sonras\u0131", "Kontrol plan\u0131 + izlenebilirlik kay\u0131tlar\u0131", "Dosya onay\u0131", "Portal + PDF teslim"],
          ["5. Seri \xDCretim", "Devam eden", "Parti raporu + SPC verileri", "Periyodik review", "Dashboard + haftal\u0131k rapor"]
        ]
      }
    ]
  },
  /* SUPPLY CHAIN — rewritten in Phase 06.
  
       The page named mills (Alcoa, Assan, Erdemir, Outokumpu, VSMPO, ATI, BASF,
       Sabic), gave each a percentage share of spend, published safety-stock
       tonnage, an approved-supplier count and a %60 localisation ratio. None of
       it was supplied, and the shares and tonnages are order-volume disclosure
       on top (§D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE).
  
       Naming your mills also tells a competitor exactly where your material
       comes from — which is why the page now describes the strategy instead of
       the vendors. Material lead times were kept in class-level ranges, which is
       genuinely useful to a buyer planning a project.                          */
  {
    slug: "tedarik-zinciri",
    category: "kabiliyetler",
    categoryLabel: "S\xFCre\xE7 & Operasyon",
    title: "Tedarik Zinciri",
    metaTitle: "Tedarik Zinciri Y\xF6netimi | \xC7ift Kaynak, Stok Stratejisi | Mas Technic",
    metaDescription: "Kritik malzemede \xE7ift kaynak, s\u0131n\u0131f bazl\u0131 tedarik s\xFCresi ve parti izlenebilirli\u011Fi. Malzeme tedarik riski \xFCretim planlanmadan \xF6nce de\u011Ferlendirilir.",
    description: "Bir i\u015Fin termini \xE7o\u011Fu zaman tezg\xE2hta de\u011Fil, malzemenin geli\u015Finde belirlenir. Tedarik riski bu nedenle teklif a\u015Famas\u0131nda, \xFCretim planlanmadan \xF6nce de\u011Ferlendirilir.",
    heroImage: "hero-tedarik-zinciri",
    content: [
      "Malzeme tedariki terminin en b\xFCy\xFCk belirsizli\u011Fidir. Standart al\xFCminyum ve paslanmaz \xE7elik k\u0131sa s\xFCrede temin edilebilirken, titanyum ve nikel esasl\u0131 ala\u015F\u0131mlar sipari\u015F \xFCzerine gelir ve tedarik s\xFCresi \xFCretim s\xFCresini a\u015Fabilir. Bu nedenle malzeme durumu teklifle birlikte netle\u015Ftirilir.",
      "Kritik malzemelerde tek kayna\u011Fa ba\u011Fl\u0131 kalmamay\u0131 esas al\u0131yoruz. Onayl\u0131 ikinci kaynak, tedarik kesintisinde i\u015Fin durmas\u0131n\u0131 engeller; alternatif malzeme se\xE7enekleri ise \u015Fartnameyle uyumluysa teknik incelemede birlikte de\u011Ferlendirilir.",
      "Stok stratejisi malzeme s\u0131n\u0131f\u0131na g\xF6re de\u011Fi\u015Fir: s\u0131k kullan\u0131lan standart profil ve levhalarda emniyet sto\u011Fu tutulur, \xF6zel ala\u015F\u0131mlarda sipari\u015F \xFCzerine tedarik yap\u0131l\u0131r. Ama\xE7 stok maliyetiyle tedarik riski aras\u0131nda bilin\xE7li bir denge kurmakt\u0131r.",
      "Gelen her malzeme parti ve d\xF6k\xFCm kayd\u0131yla kay\u0131t alt\u0131na al\u0131n\u0131r. Bu kay\u0131t, \xFCretimin ilerleyen a\u015Famalar\u0131nda bir uygunsuzluk \xE7\u0131kt\u0131\u011F\u0131nda hangi partinin etkilendi\u011Fini belirlemenin tek g\xFCvenilir yoludur; malzeme sertifikas\u0131 talebe ba\u011Fl\u0131 olarak teslimat dosyas\u0131na eklenir."
    ],
    features: [
      "\xC7ift Kaynak \u2014 kritik malzemede onayl\u0131 ikinci tedarik\xE7i",
      "S\u0131n\u0131f Bazl\u0131 Tedarik S\xFCresi \u2014 malzeme grubuna g\xF6re planlama",
      "Emniyet Sto\u011Fu \u2014 s\u0131k kullan\u0131lan standart malzemelerde",
      "Alternatif Malzeme \u2014 \u015Fartnameyle uyumluysa teknik incelemede",
      "Parti ve D\xF6k\xFCm Kayd\u0131 \u2014 gelen her malzeme i\xE7in",
      "Malzeme Sertifikas\u0131 \u2014 talebe ba\u011Fl\u0131, teslimat dosyas\u0131nda"
    ],
    technicalSpecs: [
      { label: "Kritik Malzeme", value: "\xC7ift kaynak" },
      { label: "Standart Al / SS", value: "K\u0131sa tedarik s\xFCresi" },
      { label: "Titanyum", value: "Sipari\u015F \xFCzerine" },
      { label: "Nikel Esasl\u0131 Ala\u015F\u0131m", value: "Sipari\u015F \xFCzerine" },
      { label: "Kay\u0131t", value: "Parti ve d\xF6k\xFCm" },
      { label: "Sertifika", value: "Talebe ba\u011Fl\u0131" }
    ],
    processSteps: [
      "Malzeme \u015Eartnamesinin Okunmas\u0131",
      "Tedarik S\xFCresi De\u011Ferlendirmesi",
      "Kaynak Se\xE7imi",
      "Sipari\u015F ve Takip",
      "Giri\u015F Kayd\u0131 (Parti / D\xF6k\xFCm)",
      "\xDCretime Aktar\u0131m"
    ],
    advantages: [
      "Tedarik riski \xFCretim planlanmadan \xF6nce de\u011Ferlendirilir",
      "Kritik malzemede tek kayna\u011Fa ba\u011Fl\u0131 kal\u0131nmaz",
      "Termin, malzemenin ger\xE7ek tedarik s\xFCresiyle birlikte verilir",
      "Alternatif malzeme yaln\u0131zca \u015Fartnameyle uyumluysa \xF6nerilir",
      "Gelen malzeme parti ve d\xF6k\xFCm kayd\u0131yla izlenir",
      "Uygunsuzlukta etkilenen parti kay\u0131ttan belirlenebilir"
    ],
    faq: [
      { question: "Malzeme tedarik s\xFCreniz ne kadar?", answer: "Malzeme s\u0131n\u0131f\u0131na g\xF6re de\u011Fi\u015Fir: standart al\xFCminyum ve paslanmaz \xE7elik k\u0131sa s\xFCrede temin edilebilir; titanyum ve nikel esasl\u0131 ala\u015F\u0131mlar sipari\u015F \xFCzerine gelir. Projenizin ger\xE7ek tedarik s\xFCresini teklifle birlikte veririz." },
      { question: "Tedarik kesintisi riski nas\u0131l y\xF6netiliyor?", answer: "Kritik malzemelerde onayl\u0131 ikinci kaynak bulundurulur, s\u0131k kullan\u0131lan standart malzemelerde emniyet sto\u011Fu tutulur ve \u015Fartnameyle uyumlu alternatif malzemeler \xF6nceden de\u011Ferlendirilir." },
      { question: "Malzeme sertifikas\u0131 alabilir miyim?", answer: "Malzeme parti ve d\xF6k\xFCm kayd\u0131 \xFCzerinden izlenir. Malzeme sertifikas\u0131 talep etmeniz halinde teslimat dosyas\u0131na eklenir." },
      { question: "Malzemeyi ben tedarik edebilir miyim?", answer: "Evet. Bu durumda malzemenin \u015Fartnameye uygunlu\u011Funu ve parti kayd\u0131n\u0131 sizden al\u0131r, giri\u015F kontrol\xFCn\xFC buna g\xF6re planlar\u0131z." }
    ],
    comparisonTables: [
      {
        title: "Malzeme S\u0131n\u0131f\u0131na G\xF6re Tedarik Yakla\u015F\u0131m\u0131",
        description: "Tedarik s\xFCresi terminle do\u011Frudan ilgilidir; strateji s\u0131n\u0131fa g\xF6re de\u011Fi\u015Fir",
        headers: ["Malzeme Grubu", "Tipik Eri\u015Fim", "Stok Stratejisi", "Termine Etkisi"],
        rows: [
          ["Standart al\xFCminyum", "K\u0131sa", "Emniyet sto\u011Fu", "D\xFC\u015F\xFCk"],
          ["Paslanmaz \xE7elik", "K\u0131sa \u2013 orta", "Emniyet sto\u011Fu", "D\xFC\u015F\xFCk \u2013 orta"],
          ["Ala\u015F\u0131ml\u0131 \xE7elik", "Orta", "Sipari\u015F \xFCzerine", "Orta"],
          ["Titanyum", "Uzun", "Sipari\u015F \xFCzerine", "Y\xFCksek \u2014 teklifte belirtilir"],
          ["Nikel esasl\u0131 ala\u015F\u0131m", "Uzun", "Sipari\u015F \xFCzerine", "Y\xFCksek \u2014 teklifte belirtilir"],
          ["M\xFChendislik plasti\u011Fi", "K\u0131sa \u2013 orta", "Sipari\u015F \xFCzerine", "D\xFC\u015F\xFCk \u2013 orta"]
        ]
      },
      {
        title: "Tedarik Riskini Azaltan Kararlar",
        headers: ["Karar", "Ne Zaman Al\u0131n\u0131r", "Neyi De\u011Fi\u015Ftirir"],
        rows: [
          ["Onayl\u0131 ikinci kaynak", "Malzeme kritikse", "Kesintide i\u015F durmaz"],
          ["Alternatif malzeme", "\u015Eartname izin veriyorsa", "Tedarik s\xFCresi k\u0131sal\u0131r"],
          ["Emniyet sto\u011Fu", "Malzeme s\u0131k kullan\u0131l\u0131yorsa", "Termin belirsizli\u011Fi d\xFC\u015Fer"],
          ["Erken sipari\u015F", "Tedarik s\xFCresi uzunsa", "\xDCretim penceresi korunur"]
        ]
      }
    ]
  },
  /* OPERATIONAL EFFICIENCY — rewritten in Phase 06.
  
       Every number on this page was invented, several to one decimal place: a
       per-machine OEE matrix naming three machines, a %77.5 average, a %1.2
       scrap rate, %97 on-time delivery, %0.3 complaint rate, %96.8 first-pass
       yield, a 22-minute setup time, 40 mandatory training hours per employee
       and a Six Sigma belt count. `USER_INPUTS.md` supplies none of it; §D marks
       the only related verified figure (on-time delivery) at 95% and its
       visibility conditional, and §0 forbids publishing headcount at all.
  
       The methods themselves — 5S, Kaizen, Kanban, TPM, SMED — are real
       practices and stay. What is gone is the scoreboard. A method you can
       describe is more credible than a number nobody can audit.               */
  {
    slug: "operasyonel-verimlilik",
    category: "kabiliyetler",
    categoryLabel: "S\xFCre\xE7 & Operasyon",
    title: "Operasyonel Verimlilik",
    metaTitle: "Operasyonel Verimlilik | Yal\u0131n \xDCretim, Kaizen, SMED | Mas Technic",
    metaDescription: "Yal\u0131n \xFCretim, 5S, Kaizen, Kanban, TPM ve SMED uygulamalar\u0131. Kurulum s\xFCresini k\u0131saltmak, duru\u015Fu azaltmak ve tekrarlanabilirli\u011Fi art\u0131rmak i\xE7in tan\u0131ml\u0131 y\xF6ntemler.",
    description: "Verimlilik bir hedef tablosu de\u011Fil, bir \xE7al\u0131\u015Fma bi\xE7imidir: kurulumun k\u0131salmas\u0131, duru\u015Fun azalmas\u0131 ve ayn\u0131 par\xE7an\u0131n her seferinde ayn\u0131 \xE7\u0131kmas\u0131 ayn\u0131 disiplinin sonucudur.",
    heroImage: "hero-operasyonel-verimlilik",
    content: [
      "Bir i\u015Fin s\xFCresi kesme s\xFCresinden ibaret de\u011Fildir. \xC7o\u011Fu i\u015F i\xE7in belirleyici olan kurulum, bekleme, ta\u015F\u0131ma ve yeniden \xF6l\xE7\xFCm s\xFCreleridir; iyile\u015Ftirme \xE7al\u0131\u015Fmalar\u0131m\u0131z bu nedenle kesme parametrelerinden \xF6nce kurulum ve ak\u0131\u015Fa bakar.",
      "SMED yakla\u015F\u0131m\u0131 kurulum i\u015Flerini iki gruba ay\u0131r\u0131r: tezg\xE2h dururken yap\u0131lmas\u0131 zorunlu olanlar ve tezg\xE2h \xE7al\u0131\u015F\u0131rken haz\u0131rlanabilecek olanlar. \u0130kinci grubu kurulum d\u0131\u015F\u0131na ta\u015F\u0131mak, tezg\xE2h\u0131n par\xE7a \xFCretmedi\u011Fi s\xFCreyi do\u011Frudan k\u0131salt\u0131r.",
      "5S ve Kanban, aranan \u015Feyin bulunma s\xFCresini ve ara stok miktar\u0131n\u0131 d\xFC\u015F\xFCr\xFCr. Standart kurulum prosed\xFCrleri, ayn\u0131 i\u015Fi ikinci kez yapan operat\xF6r\xFCn ilk seferki kararlar\u0131 yeniden vermesini engeller \u2014 tekrarlanabilirlik burada ba\u015Flar.",
      "TPM kapsam\u0131nda bak\u0131m, ar\u0131za sonras\u0131 bir m\xFCdahale de\u011Fil planl\u0131 bir i\u015F ad\u0131m\u0131d\u0131r. Tezg\xE2h do\u011Frulu\u011Fu \xFCretimin girdisi oldu\u011Fu i\xE7in bak\u0131m gecikmesi do\u011Frudan tolerans kayb\u0131 olarak geri d\xF6ner.",
      "Kaizen at\xF6lyelerinde sorulan soru 'kim hata yapt\u0131' de\u011Fil, 'bu ad\u0131m neden hataya a\xE7\u0131k't\u0131r. K\xF6k nedene inilmeden yap\u0131lan d\xFCzeltme, ayn\u0131 hatay\u0131 bir sonraki partide tekrar \xFCretir."
    ],
    features: [
      "SMED \u2014 kurulum i\u015Flerinin tezg\xE2h d\u0131\u015F\u0131na ta\u015F\u0131nmas\u0131",
      "5S \u2014 arama ve haz\u0131rl\u0131k s\xFCresinin d\xFC\u015F\xFCr\xFClmesi",
      "Kanban \u2014 malzeme ak\u0131\u015F\u0131 ve ara stok kontrol\xFC",
      "TPM \u2014 bak\u0131m\u0131n planl\u0131 bir i\u015F ad\u0131m\u0131 olarak y\xFCr\xFCt\xFClmesi",
      "Standart Kurulum Prosed\xFCr\xFC \u2014 kararlar\u0131n tekrar verilmemesi",
      "Kaizen \u2014 k\xF6k nedene inen d\xFCzeltici faaliyet"
    ],
    technicalSpecs: [
      { label: "Yakla\u015F\u0131m", value: "Yal\u0131n \xFCretim" },
      { label: "Kurulum", value: "SMED ile ayr\u0131\u015Ft\u0131rma" },
      { label: "Malzeme Ak\u0131\u015F\u0131", value: "Kanban" },
      { label: "Bak\u0131m", value: "Planl\u0131 (TPM)" },
      { label: "\u0130yile\u015Ftirme", value: "Kaizen at\xF6lyeleri" },
      { label: "Kay\u0131t", value: "D\xFCzeltici faaliyet kayd\u0131" }
    ],
    advantages: [
      "Kurulum s\xFCresi kesme s\xFCresinden \xF6nce ele al\u0131n\u0131r",
      "Tezg\xE2h \xE7al\u0131\u015F\u0131rken haz\u0131rlanabilen i\u015Fler kurulum d\u0131\u015F\u0131na ta\u015F\u0131n\u0131r",
      "Standart kurulum prosed\xFCr\xFC tekrarlanabilirli\u011Fi art\u0131r\u0131r",
      "Bak\u0131m planl\u0131d\u0131r; gecikme tolerans kayb\u0131 olarak geri d\xF6ner",
      "K\xF6k neden bulunmadan d\xFCzeltme kapat\u0131lmaz",
      "\u0130yile\u015Ftirmeler kay\u0131t alt\u0131na al\u0131n\u0131r ve izlenir"
    ],
    faq: [
      { question: "Verimlilik \xE7al\u0131\u015Fmas\u0131 par\xE7am\u0131 nas\u0131l etkiler?", answer: "Do\u011Frudan iki yerde: kurulum k\u0131sald\u0131k\xE7a k\xFC\xE7\xFCk partiler ekonomik hale gelir, standart kurulum prosed\xFCr\xFC ise ayn\u0131 par\xE7an\u0131n partiler aras\u0131nda ayn\u0131 \xE7\u0131kmas\u0131n\u0131 kolayla\u015Ft\u0131r\u0131r." },
      { question: "SMED nedir, neden \xF6nemli?", answer: "Kurulum i\u015Flerini tezg\xE2h dururken zorunlu olanlar ve \xE7al\u0131\u015F\u0131rken haz\u0131rlanabilecek olanlar diye ay\u0131r\u0131r. \u0130kincisini kurulum d\u0131\u015F\u0131na ta\u015F\u0131mak, tezg\xE2h\u0131n par\xE7a \xFCretmedi\u011Fi s\xFCreyi k\u0131salt\u0131r." },
      { question: "Bak\u0131m\u0131 nas\u0131l y\xF6netiyorsunuz?", answer: "Bak\u0131m planl\u0131 bir i\u015F ad\u0131m\u0131d\u0131r (TPM). Tezg\xE2h do\u011Frulu\u011Fu \xFCretimin girdisi oldu\u011Fu i\xE7in bak\u0131m gecikmesi do\u011Frudan tolerans kayb\u0131 riski \xFCretir." },
      { question: "Bir uygunsuzluk \xE7\u0131karsa ne yap\u0131l\u0131yor?", answer: "Kaizen ve d\xFCzeltici faaliyet s\xFCreci i\u015Fletilir: k\xF6k neden bulunmadan ayn\u0131 kurulumla \xFCretime devam edilmez ve yap\u0131lan d\xFCzeltme kay\u0131t alt\u0131na al\u0131n\u0131r." }
    ],
    comparisonTables: [
      {
        title: "Kay\u0131p T\xFCr\xFC ve Kar\u015F\u0131l\u0131k Gelen Y\xF6ntem",
        description: "Yal\u0131n \xFCretimde her kay\u0131p t\xFCr\xFCn\xFCn kendi m\xFCdahale arac\u0131 vard\u0131r",
        headers: ["Kay\u0131p T\xFCr\xFC", "Nerede G\xF6r\xFCn\xFCr", "Uygulanan Y\xF6ntem", "B\u0131rakt\u0131\u011F\u0131 Kay\u0131t"],
        rows: [
          ["Kurulum s\xFCresi", "Tezg\xE2h dururken ge\xE7en haz\u0131rl\u0131k", "SMED + standart kurulum", "Kurulum onay\u0131"],
          ["Arama ve haz\u0131rl\u0131k", "Tak\u0131m, fikst\xFCr, \xF6l\xE7\xFC aleti aray\u0131\u015F\u0131", "5S", "Yerle\u015Fim standard\u0131"],
          ["Ara stok", "Operasyonlar aras\u0131 bekleyen par\xE7a", "Kanban", "Ak\u0131\u015F kayd\u0131"],
          ["Plans\u0131z duru\u015F", "Ar\u0131za sonras\u0131 bekleme", "TPM \u2014 planl\u0131 bak\u0131m", "Bak\u0131m kayd\u0131"],
          ["Tekrarlayan hata", "Ayn\u0131 uygunsuzlu\u011Fun geri gelmesi", "Kaizen \u2014 k\xF6k neden analizi", "D\xFCzeltici faaliyet kayd\u0131"]
        ]
      },
      {
        title: "Kurulum \u0130\u015Flerinin Ayr\u0131\u015Ft\u0131r\u0131lmas\u0131 (SMED)",
        description: "Ayn\u0131 i\u015Fi hangi tarafta yapt\u0131\u011F\u0131n\u0131z, tezg\xE2h\u0131n bo\u015Fta ge\xE7en s\xFCresini belirler",
        headers: ["\u0130\u015F", "Tezg\xE2h Dururken Zorunlu mu", "Nas\u0131l K\u0131salt\u0131l\u0131r"],
        rows: [
          ["Tak\u0131m haz\u0131rl\u0131\u011F\u0131 ve \xF6n ayar", "Hay\u0131r", "\xD6nceki i\u015F s\xFCrerken haz\u0131rlan\u0131r"],
          ["Fikst\xFCr montaj\u0131", "Evet", "H\u0131zl\u0131 ba\u011Flama ve sabit referans"],
          ["Program y\xFCkleme ve do\u011Frulama", "Hay\u0131r", "Sim\xFClasyon \xF6nceden tamamlan\u0131r"],
          ["S\u0131f\u0131rlama ve referans alma", "Evet", "Standart referans y\xFCzeyi kullan\u0131l\u0131r"],
          ["\u0130lk par\xE7a kontrol\xFC", "Evet", "Kontrol plan\u0131 \xF6nceden haz\u0131rd\u0131r"]
        ]
      }
    ]
  },
  // ── Endüstriyel > Yüksek Teknoloji ──
  {
    slug: "havacilik-uzay",
    category: "endustriyel",
    categoryLabel: "Y\xFCksek Teknoloji",
    title: "Havac\u0131l\u0131k & Uzay",
    metaTitle: "Havac\u0131l\u0131k & Uzay Par\xE7a \xDCretimi | Ti & Inconel \u0130\u015Fleme | Mas Technic",
    metaDescription: "Havac\u0131l\u0131k ve uzay i\xE7in titanyum Ti6Al4V, Inconel 718 ve havac\u0131l\u0131k al\xFCminyumu i\u015Fleme. Kontrol plan\u0131, ilk par\xE7a kontrol\xFC ve parti izlenebilirli\u011Fi.",
    description: "Havac\u0131l\u0131k ve uzay sanayi i\xE7in motor bile\u015Fenleri, yap\u0131sal par\xE7alar ve aviyonik muhafazalar \xFCretiyoruz. Zor i\u015Flenen ala\u015F\u0131mlarda kontrol plan\u0131na ba\u011Fl\u0131, izlenebilir \xFCretim.",
    heroImage: "hero-havacilik",
    content: [
      "Havac\u0131l\u0131k ve uzay sanayi i\xE7in motor bile\u015Fenleri, yap\u0131sal par\xE7alar (braket, fitting, rib) ve aviyonik muhafazalar \xFCretiyoruz. Titanyum Ti6Al4V, Inconel 718 ve havac\u0131l\u0131k al\xFCminyum ala\u015F\u0131mlar\u0131 (7075-T6, 2024-T3); \u0131s\u0131y\u0131 kesiciye ta\u015F\u0131yan, tak\u0131m \xF6mr\xFCn\xFC k\u0131saltan ve ba\u011Flama kuvvetine duyarl\u0131 malzemelerdir.",
      "\xD6zel proses ihtiya\xE7lar\u0131 \u2014 kimyasal i\u015Flemler (anodizasyon, pasivasyon, kromatlama), tahribats\u0131z muayene, \u0131s\u0131l i\u015Flem (\xE7\xF6kelme sertle\u015Ftirme, gerilim giderme) ve y\xFCzey kaplama \u2014 projenin \u015Fartnamesine g\xF6re planlan\u0131r ve tedarik zinciriyle birlikte y\xFCr\xFCt\xFCl\xFCr. Parametreler dondurulur; de\u011Fi\u015Fiklik yeniden do\u011Frulama gerektirir.",
      "Kalite yakla\u015F\u0131m\u0131m\u0131z: ilk par\xE7a kontrol\xFC, kontrol plan\u0131nda tan\u0131mlanan koteler \xFCzerinden boyutsal ve g\xF6rsel muayene, GD&T \xF6l\xE7\xFCm\xFC, malzeme \u015Fartnamesinin (AMS, ASTM) parti kayd\u0131yla do\u011Frulanmas\u0131 ve parti bazl\u0131 izlenebilirlik. Belgelendirme format\u0131 m\xFC\u015Fteri \u015Fartnamesine g\xF6re belirlenir.",
      "5 eksenli i\u015Fleme merkezlerimizde karma\u015F\u0131k havac\u0131l\u0131k geometrilerini tek ba\u011Flamada i\u015Fliyoruz; standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01 mm'dir. Tak\u0131m yollar\u0131 sim\xFClasyonla do\u011Frulan\u0131r ve seri, ilk par\xE7a kontrol\xFC onaylanmadan ba\u015Flamaz."
    ],
    features: [
      "Zor \u0130\u015Flenen Ala\u015F\u0131m Deneyimi \u2014 Ti6Al4V, Inconel 718",
      "\xD6zel Proses Planlamas\u0131 \u2014 kimyasal i\u015Flem, NDT, \u0131s\u0131l i\u015Flem",
      "Titanyum & Inconel \u0130\u015Fleme \u2014 5 eksen, HSM, \xF6zel tak\u0131m",
      "\u0130lk Par\xE7a Kontrol\xFC \u2014 seri, onay al\u0131nmadan ba\u015Flamaz",
      "\u0130zlenebilirlik \u2014 parti ve d\xF6k\xFCm kayd\u0131",
      "Frozen Process \u2014 Onayl\u0131 s\xFCre\xE7 parametreleri sabitlenmi\u015F"
    ],
    technicalSpecs: [
      { label: "Y\xF6netim Sistemi", value: "ISO 9001:2015" },
      { label: "NDT", value: "RT, UT, PT, MT, ET" },
      { label: "\u0130zlenebilirlik", value: "Parti ve d\xF6k\xFCm kayd\u0131" },
      { label: "Malzemeler", value: "Ti6Al4V, Inconel 718, Al 7075" },
      { label: "Standart Tolerans", value: "\xB10.01mm" },
      { label: "\u0130lk Par\xE7a", value: "Kontrol plan\u0131na g\xF6re" }
    ],
    processSteps: [
      "S\xF6zle\u015Fme \u0130nceleme & PO",
      "Malzeme Tedarik (\u015Fartnameye g\xF6re)",
      "CAM Programlama & Sim\xFClasyon",
      "5 Eksen CNC \u0130\u015Fleme",
      "NDT Muayene",
      "CMM & FAI Raporu",
      "Y\xFCzey \u0130\u015Flemi",
      "Son Muayene & Paketleme"
    ],
    advantages: [
      "Zor i\u015Flenen ala\u015F\u0131mlarda tak\u0131m ve parametre disiplini",
      "Parti ve d\xF6k\xFCm kayd\u0131na dayal\u0131 izlenebilirlik",
      "Ti6Al4V ve Inconel 718 i\u015Fleme uzmanl\u0131\u011F\u0131",
      "5 eksen tek ba\u011Flamada karma\u015F\u0131k havac\u0131l\u0131k geometrileri",
      "\u0130lk par\xE7a kontrol kayd\u0131 ve \xF6l\xE7\xFCm dosyas\u0131 teslimi",
      "Frozen process ile onayl\u0131 parametrelerin sabitle\u015Ftirilmesi"
    ],
    materials: [
      { name: "Titanyum", grade: "Ti6Al4V (Grade 5)", properties: "Hafif, biyouyumlu, 950 MPa \xE7ekme" },
      { name: "Inconel", grade: "718", properties: "Y\xFCksek s\u0131cakl\u0131k, 1034 MPa, t\xFCrbin par\xE7alar\u0131" },
      { name: "Al\xFCminyum", grade: "7075-T6", properties: "Y\xFCksek mukavemet, havac\u0131l\u0131k yap\u0131sal" },
      { name: "Al\xFCminyum", grade: "2024-T3", properties: "Havac\u0131l\u0131k kaplamal\u0131 levha, yorulma direnci" }
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 y\xF6netim sistemi belgelerimiz bulunmaktad\u0131r. Projeniz farkl\u0131 bir standart gerektiriyorsa teknik incelemede birlikte de\u011Ferlendiririz." },
      { question: "Titanyum i\u015Fleyebiliyor musunuz?", answer: "Evet, Ti6Al4V (Grade 5) ve Grade 2 titanyum i\u015Fleme konusunda uzman\u0131z. \xD6zel tak\u0131mlar, d\xFC\u015F\xFCk h\u0131z/y\xFCksek ilerleme stratejisi ve so\u011Futma y\xF6netimi ile optimal sonu\xE7lar elde ediyoruz." },
      { question: "\u0130lk par\xE7a kontrol\xFC yap\u0131yor musunuz?", answer: "Evet. Her yeni par\xE7a ve her revizyon i\xE7in ilk par\xE7a kontrol\xFC yap\u0131l\u0131r ve kay\u0131t alt\u0131na al\u0131n\u0131r; belgelendirme format\u0131n\u0131 \u015Fartnamenize g\xF6re birlikte belirleriz." },
      { question: "\xD6zel prosesler nas\u0131l y\xFCr\xFCt\xFCl\xFCyor?", answer: "Kimyasal i\u015Flem, tahribats\u0131z muayene ve \u0131s\u0131l i\u015Flem gibi \xF6zel prosesler projenin \u015Fartnamesine g\xF6re planlan\u0131r ve tedarik zinciriyle birlikte y\xFCr\xFCt\xFCl\xFCr. Parametreler dondurulur; de\u011Fi\u015Fiklik yeniden do\u011Frulama gerektirir." }
    ],
    comparisonTables: [
      {
        title: "Havac\u0131l\u0131k Malzeme Performans Kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
        headers: ["Malzeme", "\xC7ekme Dayan\u0131m\u0131", "Yo\u011Funluk", "Maks. S\u0131cakl\u0131k", "Korozyon Direnci", "Maliyet", "Tipik Uygulama"],
        rows: [
          ["Al 7075-T6", "572 MPa", "2.81 g/cm\xB3", "150\xB0C", "\u0130yi (anodizasyon ile)", "$$", "Yap\u0131sal braket, rib, fitting"],
          ["Ti6Al4V (Gr5)", "950 MPa", "4.43 g/cm\xB3", "400\xB0C", "M\xFCkemmel", "$$$$", "Motor, ini\u015F tak\u0131m\u0131, ba\u011Flant\u0131"],
          ["Inconel 718", "1034 MPa", "8.19 g/cm\xB3", "700\xB0C", "M\xFCkemmel", "$$$$$", "T\xFCrbin, yanma odas\u0131, egzoz"],
          ["SS 15-5PH", "1000 MPa", "7.78 g/cm\xB3", "316\xB0C", "\xC7ok iyi", "$$$", "Akt\xFCat\xF6r, valf, yap\u0131sal"]
        ]
      }
    ]
  },
  {
    slug: "savunma-sanayi",
    category: "endustriyel",
    categoryLabel: "Y\xFCksek Teknoloji",
    title: "Savunma Sanayi",
    metaTitle: "Savunma Sanayi Par\xE7a \xDCretimi | Balistik \xC7elik ve \xD6zel Ala\u015F\u0131m | Mas Technic",
    metaDescription: "Savunma sanayi i\xE7in balistik \xE7elik, titanyum ve \xF6zel ala\u015F\u0131m i\u015Fleme. Parti ve d\xF6k\xFCm izlenebilirli\u011Fi, kontrol plan\u0131na ba\u011Fl\u0131 muayene.",
    description: "Savunma sanayi i\xE7in hassas par\xE7a \xFCretimi. Zor i\u015Flenen malzemelerde kontrol plan\u0131na ba\u011Fl\u0131 \xFCretim ve parti bazl\u0131 izlenebilirlik.",
    content: [
      "Kara, deniz ve hava platformlar\u0131na y\xF6nelik kritik bile\u015Fenler \xFCretiyoruz: silah sistemi komponentleri, optronik muhafazalar, z\u0131rh par\xE7alar\u0131 ve muhabere sistemi bile\u015Fenleri. Projenizin tabi oldu\u011Fu \u015Fartname ve standart gereksinimlerini teknik incelemede birlikte okuruz.",
      "Savunma projelerinde teknik verinin nas\u0131l payla\u015F\u0131laca\u011F\u0131 ve hangi ko\u015Fullarla i\u015Flenece\u011Fi proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak mutab\u0131k kal\u0131n\u0131r. \u015Eartnamenizin gerektirdi\u011Fi ko\u015Fullar\u0131 teklif a\u015Famas\u0131nda birlikte de\u011Ferlendiririz.",
      "Balistik \xE7elik (Armox 500T, Hardox 600), havac\u0131l\u0131k titanyumu (Ti6Al4V), y\xFCksek mukavemet \xE7elikleri (4340, 300M) ve \xF6zel ala\u015F\u0131mlar (Inconel, Stellite) i\u015Fleme kabiliyetimiz ile savunma sanayinin en zorlu malzeme gereksinimlerini kar\u015F\u0131l\u0131yoruz.",
      "Tahribats\u0131z muayene (RT, UT, PT, MT) kapsam\u0131 \u015Fartnameye g\xF6re kontrol plan\u0131nda tan\u0131mlan\u0131r ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r. Parti bazl\u0131 izlenebilirlik ile konfig\xFCrasyon ve revizyon takibi birlikte y\xFCr\xFCt\xFCl\xFCr."
    ],
    features: [
      "\u015Eartname Okuma \u2014 proje standard\u0131 teknik incelemede birlikte de\u011Ferlendirilir",
      "Konfig\xFCrasyon Takibi \u2014 versiyon ve revizyon kayd\u0131",
      "Veri Payla\u015F\u0131m\u0131 \u2014 ko\u015Fullar proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak belirlenir",
      "Tahribats\u0131z Muayene \u2014 RT, UT, PT, MT; kapsam plana yaz\u0131l\u0131r",
      "Balistik Malzeme \u0130\u015Fleme \u2014 Armox 500T, Hardox 600",
      "Konfig\xFCrasyon Y\xF6netimi \u2014 Versiyon ve de\u011Fi\u015Fiklik takibi"
    ],
    technicalSpecs: [
      { label: "Y\xF6netim Sistemi", value: "ISO 9001:2015" },
      { label: "\u015Eartname", value: "Proje baz\u0131nda okunur" },
      { label: "NDT", value: "RT, UT, PT, MT" },
      { label: "Malzemeler", value: "Armox, Ti, 4340, 300M" },
      { label: "Ko\u015Fullar", value: "Proje ba\u015F\u0131nda yaz\u0131l\u0131" },
      { label: "\u0130zlenebilirlik", value: "Parti ve d\xF6k\xFCm kayd\u0131" }
    ],
    processSteps: [
      "Proje Ko\u015Fullar\u0131n\u0131n Belirlenmesi",
      "Teknik \u0130nceleme & Teklif",
      "Malzeme Tedarik (\u015Fartnameye g\xF6re)",
      "\xDCretim",
      "Tahribats\u0131z Muayene",
      "Konfig\xFCrasyon Do\u011Frulama",
      "G\xFCvenli Paketleme & Teslimat"
    ],
    advantages: [
      "Proje \u015Fartnamesi teknik incelemede sat\u0131r sat\u0131r okunur",
      "Teknik veri ko\u015Fullar\u0131 proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak belirlenir",
      "Balistik \xE7elik ve \xF6zel ala\u015F\u0131m i\u015Fleme uzmanl\u0131\u011F\u0131",
      "Tahribats\u0131z muayene kapsam\u0131 kontrol plan\u0131nda tan\u0131mlan\u0131r",
      "Parti ve d\xF6k\xFCm kayd\u0131na dayal\u0131 izlenebilirlik",
      "Konfig\xFCrasyon y\xF6netimi ve de\u011Fi\u015Fiklik kontrol\xFC"
    ],
    faq: [
      { question: "Teknik verim nas\u0131l ele al\u0131n\u0131yor?", answer: "Teknik verinin nas\u0131l payla\u015F\u0131laca\u011F\u0131 ve hangi ko\u015Fullarla i\u015Flenece\u011Fi proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak mutab\u0131k kal\u0131n\u0131r. \u015Eartnamenizin gerektirdi\u011Fi ko\u015Fullar\u0131 teklif a\u015Famas\u0131nda birlikte de\u011Ferlendiririz." },
      { question: "Proje \u015Fartnamemi kar\u015F\u0131layabiliyor musunuz?", answer: "\u015Eartnamenizi teknik incelemede sat\u0131r sat\u0131r okur, hangi gereksinimleri bug\xFCnk\xFC kabiliyetimizle kar\u015F\u0131layabildi\u011Fimizi ve hangileri i\xE7in tedarik zinciri gerekti\u011Fini a\xE7\u0131k\xE7a belirtiriz." },
      { question: "Balistik malzeme i\u015Fleyebiliyor musunuz?", answer: "Evet, Armox 500T, Hardox 600 ve 300M gibi y\xFCksek sertlikli balistik \xE7elikleri CNC ile i\u015Fleyebiliyoruz." }
    ]
  },
  {
    slug: "robotik",
    category: "endustriyel",
    categoryLabel: "Y\xFCksek Teknoloji",
    title: "Robotik & Otomasyon",
    metaTitle: "Robotik & Otomasyon Par\xE7a \xDCretimi | \xB10.01 mm | Mas Technic",
    metaDescription: "End\xFCstriyel robot, cobot ve otomasyon sistemleri i\xE7in hassas mekanik bile\u015Fenler. Akt\xFCat\xF6r g\xF6vdesi, eklem par\xE7as\u0131, gripper. Al 7075, SS 316L, \xB10.01 mm.",
    description: "End\xFCstriyel robotlar, cobot'lar ve otomasyon sistemleri i\xE7in hassas mekanik bile\u015Fenler. Akt\xFCat\xF6r g\xF6vdeleri, eklem par\xE7alar\u0131 ve gripper komponentleri.",
    content: [
      "End\xFCstriyel robotlar, kolaboratif robotlar (cobot) ve \xF6zel otomasyon sistemleri i\xE7in hassas mekanik bile\u015Fenler \xFCretiyoruz: akt\xFCat\xF6r g\xF6vdeleri, eklem (joint) par\xE7alar\u0131, red\xFCkt\xF6r muhafazalar\u0131, gripper bile\u015Fenleri ve sens\xF6r montaj aparatlar\u0131.",
      "Robot bile\u015Fenlerinde belirleyici olan tek bir kote de\u011Fil, eksenlerin birbirine g\xF6re konumudur: e\u015F eksenlilik ve diklik, kolun tekrarlanabilirli\u011Fini do\u011Frudan etkiler. Bu nedenle referans y\xFCzeyler tek ba\u011Flamada i\u015Flenir ve \xF6l\xE7\xFCm ayn\u0131 datum \xFCzerinden yap\u0131l\u0131r.",
      "Prototipten seri \xFCretime esnek planlama yap\u0131yoruz. Her robot projesi DFM analizi ile ba\u015Flar, fonksiyonel prototip ile do\u011Frulan\u0131r ve numune onay\u0131ndan sonra seri \xFCretime ge\xE7ilir."
    ],
    features: [
      "Akt\xFCat\xF6r G\xF6vdesi \u2014 Al 7075, SS 316L, \xB10.01 mm",
      "Eklem (Joint) Par\xE7alar\u0131 \u2014 Y\xFCksek hassasiyet, d\xFC\u015F\xFCk a\u011F\u0131rl\u0131k",
      "Gripper Bile\u015Fenleri \u2014 \xD6zel geometri, fonksiyonel y\xFCzey",
      "Red\xFCkt\xF6r Muhafazas\u0131 \u2014 Konsantrik hassasiyet, termal kararl\u0131l\u0131k",
      "Sens\xF6r Montaj Aparat\u0131 \u2014 Mikro hassasiyet, vibrasyon direnci",
      "Prototipten Seri \xDCretime \u2014 DFM \u2192 Prototip \u2192 Numune Onay\u0131 \u2192 Seri"
    ],
    technicalSpecs: [
      { label: "Standart Tolerans", value: "\xB10.01mm" },
      { label: "Malzeme", value: "Al 7075, SS 316L, POM" },
      { label: "Y\xFCzey", value: "Ra 0.4\xB5m" },
      /* F1: `100-10K adet/yıl` is the same annual-volume class as
         `seri-imalat`'s three. Replaced with the geometric tolerance the page
         already proves in its own FAQ. */
      { label: "E\u015F Eksenlilik", value: "Datum \xFCzerinden \xF6l\xE7\xFCl\xFCr" },
      { label: "A\u011F\u0131rl\u0131k Opt.", value: "Topoloji optimizasyonu" },
      { label: "GD&T", value: "Konsantriklik \u22640.01mm" }
    ],
    advantages: [
      "5 eksen tek ba\u011Flamada karma\u015F\u0131k robot geometrileri",
      "Al 7075 ile hafif ve y\xFCksek dayan\u0131ml\u0131 bile\u015Fenler",
      "Referans y\xFCzeyler tek ba\u011Flamada i\u015Flenir, \xF6l\xE7\xFCm ayn\u0131 datumdan yap\u0131l\u0131r",
      "DFM analizi ile a\u011F\u0131rl\u0131k ve maliyet optimizasyonu",
      "Prototipten seri \xFCretime sorunsuz ge\xE7i\u015F",
      "End\xFCstriyel robot ve cobot bile\u015Fenlerinde yedek par\xE7a deneyimi"
    ],
    faq: [
      { question: "Robot bile\u015Fenlerinde hangi toleranslar\u0131 tutabiliyorsunuz?", answer: "Standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01mm'dir. E\u015F eksenlilik ve diklik gibi geometrik toleranslar datum yap\u0131s\u0131yla birlikte de\u011Ferlendirilir ve kontrol plan\u0131na yaz\u0131l\u0131r." },
      { question: "Hafif malzeme \xE7\xF6z\xFCmleriniz var m\u0131?", answer: "Evet, Al 7075-T6 ile y\xFCksek mukavemet/a\u011F\u0131rl\u0131k oran\u0131, topoloji optimizasyonu ile a\u011F\u0131rl\u0131k azaltma ve PEEK gibi y\xFCksek performans plastikler sunuyoruz." },
      { question: "Seri \xFCretim yapabiliyor musunuz?", answer: "Evet. Otomasyonlu CNC seri \xFCretimde bar besleyici ve palet sistemi ile kesintisiz i\u015Fleme yap\u0131l\u0131r; parti b\xFCy\xFCkl\xFC\u011F\xFC ve teslimat program\u0131 teklif a\u015Famas\u0131nda birlikte belirlenir." }
    ]
  },
  // ── Endüstriyel > Seri Üretim ──
  {
    slug: "otomotiv",
    category: "endustriyel",
    categoryLabel: "Seri \xDCretim",
    title: "Otomotiv",
    metaTitle: "Otomotiv Par\xE7a \xDCretimi | Tekrarlanabilir Seri \u0130malat | Mas Technic",
    metaDescription: "Otomotiv i\xE7in motor, \u015Fanz\u0131man, fren ve s\xFCspansiyon komponentleri. Kontrol plan\u0131na ba\u011Fl\u0131, parti izlenebilirli\u011Fi olan tekrarlanabilir seri imalat.",
    description: "Otomotiv tedarik zinciri i\xE7in tekrarlanabilir seri par\xE7a \xFCretimi: standart kurulum, kontrol plan\u0131na ba\u011Fl\u0131 \xF6l\xE7\xFCm ve parti bazl\u0131 izlenebilirlik.",
    content: [
      "Otomotiv sekt\xF6r\xFC i\xE7in motor bile\u015Fenleri (silindir kapa\u011F\u0131, krank mili, kam mili), \u015Fanz\u0131man par\xE7alar\u0131 (di\u015Fli, mil, muhafaza), fren sistemi bile\u015Fenleri (kaliper, disk, piston) ve s\xFCspansiyon komponentleri (sal\u0131ncak, rotil, bijon) \xFCretiyoruz.",
      "Konseptten seri \xFCretime ge\xE7i\u015F onay noktalar\u0131yla ilerler: risk analizi, kontrol plan\u0131, pilot \xFCretim ve numune onay\u0131. \u015Eartnamenizin gerektirdi\u011Fi dok\xFCmantasyon kapsam\u0131n\u0131 teklif a\u015Famas\u0131nda birlikte belirleriz.",
      "Otomotiv i\u015Flerinde belirleyici olan tek par\xE7an\u0131n tolerans\u0131 de\u011Fil, partiler aras\u0131 tutarl\u0131l\u0131kt\u0131r. Tak\u0131m a\u015F\u0131nmas\u0131na duyarl\u0131 koteler ara kontrolle izlenir, \xF6l\xE7\xFCm sonu\xE7lar\u0131 kay\u0131t alt\u0131na al\u0131n\u0131r ve sapma e\u011Filimi g\xF6r\xFCld\xFC\u011F\xFCnde par\xE7a de\u011Fil proses d\xFCzeltilir.",
      "8D problem \xE7\xF6zme metodolojisi, Poka-Yoke hata \xF6nleme sistemleri ve Kaizen s\xFCrekli iyile\u015Ftirme yakla\u015F\u0131m\u0131 ile otomotiv kalite k\xFClt\xFCr\xFCn\xFC ya\u015Fat\u0131yoruz."
    ],
    features: [
      "Standart Kurulum \u2014 partiler aras\u0131 tutarl\u0131l\u0131k",
      "Numune Onay\u0131 \u2014 seri, ilk par\xE7a onaylanmadan ba\u015Flamaz",
      "APQP \u2014 \u0130leri \xFCr\xFCn kalite planlama",
      "Ara Kontrol \u2014 tak\u0131m a\u015F\u0131nmas\u0131na duyarl\u0131 koteler izlenir",
      "Otomatik Tak\u0131m De\u011Fi\u015Ftirme \u2014 uzun partilerde kesintisiz i\u015Fleme",
      "Parti \u0130zlenebilirli\u011Fi \u2014 d\xF6k\xFCm ve parti kayd\u0131"
    ],
    technicalSpecs: [
      { label: "Y\xF6netim Sistemi", value: "ISO 9001:2015" },
      { label: "Onay", value: "Numune onay\u0131" },
      { label: "Ara Kontrol", value: "Kayma e\u011Filimli koteler" },
      { label: "Kurulum", value: "Standart prosed\xFCr" },
      { label: "Kontrol", value: "Kontrol plan\u0131na g\xF6re" },
      { label: "\u0130zlenebilirlik", value: "Parti ve d\xF6k\xFCm kayd\u0131" }
    ],
    processSteps: [
      "APQP Planlama",
      "FMEA Analizi",
      "Kontrol Plan\u0131",
      "Pilot \xDCretim & MSA",
      "Numune Onay\u0131",
      "Seri \xDCretim",
      "SPC \u0130zleme",
      "S\xFCrekli \u0130yile\u015Ftirme"
    ],
    advantages: [
      "Numune onaylanmadan seri \xFCretim ba\u015Flamaz",
      "Dok\xFCmantasyon kapsam\u0131 \u015Fartnameye g\xF6re belirlenir",
      "Tak\u0131m a\u015F\u0131nmas\u0131na duyarl\u0131 koteler ara kontrolle izlenir",
      "Standart kurulum prosed\xFCr\xFC ile partiler aras\u0131 tutarl\u0131l\u0131k",
      "8D problem \xE7\xF6zme ve Poka-Yoke hata \xF6nleme",
      "Otomotiv tedarik zincirinde \xE7al\u0131\u015Fma deneyimi"
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 y\xF6netim sistemi belgelerimiz bulunmaktad\u0131r. M\xFC\u015Fterinizin \u015Fartnamesi sekt\xF6re \xF6zel bir standart gerektiriyorsa bunu teklif a\u015Famas\u0131nda a\xE7\u0131k\xE7a de\u011Ferlendiririz." },
      { question: "Hangi dok\xFCmantasyonu teslim ediyorsunuz?", answer: "Kontrol plan\u0131, \xF6l\xE7\xFCm kay\u0131tlar\u0131, malzeme parti/d\xF6k\xFCm kayd\u0131 ve numune par\xE7alar standart olarak haz\u0131rlan\u0131r. \u015Eartnamenizin gerektirdi\u011Fi ek dok\xFCmanlar\u0131 teklif a\u015Famas\u0131nda birlikte belirleriz." },
      { question: "Partiler aras\u0131 tutarl\u0131l\u0131\u011F\u0131 nas\u0131l koruyorsunuz?", answer: "Standart kurulum prosed\xFCr\xFC, ilk par\xE7a onay\u0131 ve kontrol plan\u0131na ba\u011Fl\u0131 ara kontroller ile. Tak\u0131m a\u015F\u0131nmas\u0131na duyarl\u0131 koteler ayr\u0131 bir ad\u0131mda izlenir ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r." },
      { question: "Adet aral\u0131\u011F\u0131n\u0131z nedir?", answer: "Prototipten seri \xFCretime kadar \xE7al\u0131\u015F\u0131yoruz. Parti b\xFCy\xFCkl\xFC\u011F\xFC ve teslimat program\u0131, kapasite planlamas\u0131 yap\u0131ld\u0131ktan sonra teklifle birlikte netle\u015Fir." }
    ]
  },
  /* MEDICAL — rewritten in Phase 06.
  
       The page claimed ISO 13485:2016 certification, FDA 21 CFR 820 and MDR
       2017/745 compliance, an ISO 14644-1 Class 7 cleanroom, ISO 10993
       biocompatibility certificates, DHF/DMR documentation, UDI traceability,
       %100 dimensional inspection and ±0.002 mm tolerance. `USER_INPUTS.md` §C
       lists ISO 9001, ISO 14001 and OHSAS 18001 — nothing else. A regulatory
       compliance claim in this sector is not marketing language; a buyer can act
       on it, and a supplier who cannot support it puts their customer's
       submission at risk.
  
       What is true and useful stays: which materials are machined, why they are
       difficult, and how conformity is recorded.                              */
  {
    slug: "medikal",
    category: "endustriyel",
    categoryLabel: "Seri \xDCretim",
    title: "Medikal & Biyomedikal",
    metaTitle: "Medikal Par\xE7a \xDCretimi | Ti Gr5, SS 316L, PEEK \u0130\u015Fleme | Mas Technic",
    metaDescription: "Medikal cihaz bile\u015Fenleri, cerrahi alet ve implant par\xE7alar\u0131nda hassas i\u015Fleme. Ti Grade 5, SS 316L, CoCrMo, PEEK; parti izlenebilirli\u011Fi ve \xF6l\xE7\xFCm kayd\u0131.",
    description: "Medikal cihaz bile\u015Fenleri, cerrahi aletler ve implant par\xE7alar\u0131nda hassas i\u015Fleme. Malzemesi zor, tolerans\u0131 dar ve izlenebilirli\u011Fi \u015Fart olan par\xE7alar.",
    content: [
      "Medikal cihaz bile\u015Fenleri, cerrahi el aletleri ve implant par\xE7alar\u0131 \xFCretiyoruz: kemik vidas\u0131, plaka ve \xE7ubuk gibi implant geometrileri, forseps ve makas gibi el aletleri, ortopedik komponentler ve laboratuvar ekipman\u0131 par\xE7alar\u0131.",
      "Bu sekt\xF6r\xFCn malzemeleri kolay i\u015Flenmez. Ti Grade 5 (Ti6Al4V) \u0131s\u0131y\u0131 kesiciye ta\u015F\u0131r ve tak\u0131m \xF6mr\xFCn\xFC k\u0131salt\u0131r; SS 316L yap\u0131\u015Fkan tala\u015F \xFCretir; CoCrMo a\u015F\u0131nd\u0131r\u0131c\u0131d\u0131r; PEEK ve UHMWPE ise \u0131s\u0131l genle\u015Fmesi y\xFCksek oldu\u011Fu i\xE7in \xF6l\xE7\xFCn\xFCn \xF6l\xE7\xFCm an\u0131ndaki s\u0131cakl\u0131kla de\u011Fi\u015Fti\u011Fini hesaba katmay\u0131 gerektirir.",
      "Y\xFCzey durumu \xE7o\u011Fu medikal par\xE7ada fonksiyonun kendisidir. Elektropolisaj ve pasivasyon, y\xFCzey p\xFCr\xFCzl\xFCl\xFC\u011F\xFCn\xFC d\xFC\u015F\xFCrmenin yan\u0131nda serbest demiri gidererek korozyon davran\u0131\u015F\u0131n\u0131 de\u011Fi\u015Ftirir; hangi i\u015Flemin uygulanaca\u011F\u0131 malzeme ve \u015Fartnameye g\xF6re belirlenir.",
      "\u0130zlenebilirlik parti ve d\xF6k\xFCm kayd\u0131 \xFCzerinden y\xFCr\xFCt\xFCl\xFCr. Malzeme sertifikas\u0131 ve \xF6l\xE7\xFCm kayd\u0131 talebe ba\u011Fl\u0131 olarak teslimat dosyas\u0131na eklenir; \u015Fartnamenizin gerektirdi\u011Fi ek dok\xFCmantasyon ihtiyac\u0131n\u0131 teklif a\u015Famas\u0131nda birlikte belirleriz.",
      "Mikro i\u015Fleme kabiliyetimizle \xD80.3mm'den ba\u015Flayan medikal vidalar, pimler ve konekt\xF6rler \xFCretiyoruz. Kayar puntal\u0131 tornalama, uzun ve ince implant vidalar\u0131nda sehimi s\u0131n\u0131rlad\u0131\u011F\u0131 i\xE7in tercih edilir."
    ],
    features: [
      "Biyouyumlu Malzeme \u0130\u015Fleme \u2014 Ti Gr5, SS 316L, CoCrMo, PEEK, UHMWPE",
      "Mikro \u0130\u015Fleme \u2014 \xD80.3mm'den ba\u015Flayan implant vidalar\u0131",
      "Kayar Puntal\u0131 Tornalama \u2014 uzun ve ince par\xE7alarda sehim kontrol\xFC",
      "Elektropolisaj ve Pasivasyon \u2014 y\xFCzey ve korozyon davran\u0131\u015F\u0131",
      "Parti \u0130zlenebilirli\u011Fi \u2014 d\xF6k\xFCm ve parti kayd\u0131",
      "\xD6l\xE7\xFCm Kayd\u0131 \u2014 kontrol plan\u0131na g\xF6re, teslimat dosyas\u0131nda"
    ],
    technicalSpecs: [
      { label: "Y\xF6netim Sistemi", value: "ISO 9001:2015" },
      { label: "Malzeme", value: "Ti Gr5, SS 316L, CoCrMo, PEEK" },
      { label: "Standart Tolerans", value: "\xB10.01mm" },
      { label: "Y\xFCzey", value: "Elektropolisaj / pasivasyon" },
      { label: "\u0130zlenebilirlik", value: "Parti ve d\xF6k\xFCm kayd\u0131" },
      { label: "Dok\xFCmantasyon", value: "\u015Eartnameye g\xF6re belirlenir" }
    ],
    processSteps: [
      "Tasar\u0131m \u0130nceleme",
      "Malzeme Tedarik ve Parti Kayd\u0131",
      "CNC / Mikro \u0130\u015Fleme",
      "Y\xFCzey \u0130\u015Flemi (Elektropolisaj / Pasivasyon)",
      "Kontrol Plan\u0131na G\xF6re \xD6l\xE7\xFCm",
      "Temizlik ve Paketleme",
      "\xD6l\xE7\xFCm Kayd\u0131 Teslimi"
    ],
    advantages: [
      "Zor i\u015Flenen biyouyumlu malzemelerde tak\u0131m ve parametre disiplini",
      "\xD80.3mm'den ba\u015Flayan mikro medikal par\xE7a \xFCretimi",
      "Uzun ince par\xE7alarda kayar puntal\u0131 tornalama ile sehim kontrol\xFC",
      "Y\xFCzey i\u015Flemi malzeme ve \u015Fartnameye g\xF6re se\xE7ilir",
      "Parti ve d\xF6k\xFCm kayd\u0131 ile izlenebilirlik",
      "Ek dok\xFCmantasyon ihtiyac\u0131 teklif a\u015Famas\u0131nda netle\u015Ftirilir"
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 y\xF6netim sistemi belgelerimiz bulunmaktad\u0131r. Projeniz sekt\xF6re \xF6zel bir standart gerektiriyorsa bunu teklif a\u015Famas\u0131nda a\xE7\u0131k\xE7a de\u011Ferlendiririz." },
      { question: "Hangi biyouyumlu malzemelerle \xE7al\u0131\u015F\u0131yorsunuz?", answer: "Ti Grade 5 (Ti6Al4V), SS 316L, CoCrMo, PEEK ve UHMWPE malzemelerde i\u015Fleme yap\u0131yoruz. Malzemenin sertifikas\u0131 tedarik\xE7iden gelir ve talep etmeniz halinde teslimat dosyas\u0131na eklenir." },
      { question: "Y\xFCzey i\u015Flemi yap\u0131yor musunuz?", answer: "Elektropolisaj ve pasivasyon uygulanabilir. Hangi i\u015Flemin uygun oldu\u011Fu malzemeye ve \u015Fartnamenize g\xF6re belirlenir." },
      { question: "\u0130zlenebilirli\u011Fi nas\u0131l sa\u011Fl\u0131yorsunuz?", answer: "Malzeme parti ve d\xF6k\xFCm kayd\u0131 \xFCzerinden izlenir; kontrol plan\u0131nda tan\u0131mlanan koteler \xF6l\xE7\xFCl\xFCr ve \xF6l\xE7\xFCm kayd\u0131 teslimat dosyas\u0131na eklenir." },
      { question: "\xC7ok k\xFC\xE7\xFCk par\xE7alar \xFCretebiliyor musunuz?", answer: "Evet. \xD80.3mm'den ba\u015Flayan vidalar, pimler ve konekt\xF6rler \xFCretiyoruz; uzun ve ince geometrilerde kayar puntal\u0131 tornalama tercih edilir." }
    ]
  },
  {
    slug: "yelken-yat-sistemleri",
    category: "endustriyel",
    categoryLabel: "Seri \xDCretim",
    title: "Yelken & Yat Sistemleri",
    metaTitle: "Yelken & Yat Par\xE7a \xDCretimi | Korozyona Dayan\u0131kl\u0131 Ala\u015F\u0131mlar | Mas Technic",
    metaDescription: "Denizcilik i\xE7in korozyona dayan\u0131kl\u0131 par\xE7a \xFCretimi. SS 316L, bronz ve Duplex \xE7elik i\u015Fleme, elektropolisaj ve galvanik uyum g\xF6zeterek malzeme se\xE7imi.",
    description: "Yelken, yat ve denizcilik i\xE7in korozyona dayan\u0131kl\u0131, deniz suyu ortam\u0131na uygun hassas m\xFChendislik par\xE7alar\u0131.",
    content: [
      "Yelken ve yat sistemleri i\xE7in SS 316L, Duplex 2205, bronz (C95400) ve \xF6zel denizcilik ala\u015F\u0131mlar\u0131 ile korozyona dayan\u0131kl\u0131 par\xE7alar \xFCretiyoruz. Makaralar, vin\xE7ler, ba\u015F k\xF6ste\u011Fi ba\u011Flant\u0131lar\u0131, d\xFCmen sistemi komponentleri ve pervane milleri konusunda uzman\u0131z.",
      "Deniz suyu ortam\u0131nda par\xE7ay\u0131 bitiren \u015Fey \xE7o\u011Fu zaman y\xFCk de\u011Fil korozyondur. Malzeme se\xE7imi galvanik uyum g\xF6zetilerek yap\u0131l\u0131r \u2014 birbirine temas eden farkl\u0131 metaller, tek ba\u015F\u0131na do\u011Fru se\xE7ilmi\u015F bir ala\u015F\u0131m\u0131 bile h\u0131zla t\xFCketebilir. Elektropolisaj ve pasivasyon, y\xFCzeydeki serbest demiri gidererek korozyon davran\u0131\u015F\u0131n\u0131 iyile\u015Ftirir.",
      "Superyacht ve yar\u0131\u015F yelkencili\u011Fi segmentlerinde hafif ve y\xFCksek mukavemetli bile\u015Fenler \u2014 titanyum ba\u011Flant\u0131 elemanlar\u0131, karbon fiber takviyeli par\xE7alar ve \xF6zel ala\u015F\u0131m pervane milleri \xFCretiyoruz."
    ],
    features: [
      "Galvanik Uyum \u2014 temas eden malzemeler birlikte de\u011Ferlendirilir",
      "Korozyon Direnci \u2014 1000+ saat ASTM B117 tuz testi",
      "SS 316L & Duplex \u2014 Deniz suyu uyumlu malzemeler",
      "Elektropolisaj \u2014 Ra 0.2\xB5m y\xFCzey kalitesi",
      "Bronz \u0130\u015Fleme \u2014 C95400, C95500 denizcilik bronzu",
      "Pervane Mili \u2014 Titanyum ve Monel ala\u015F\u0131mlar"
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "SS 316L, Duplex, Bronz" },
      { label: "Tuz Testi", value: "1000+ saat (ASTM B117)" },
      { label: "Y\xFCzey", value: "Ra 0.2\xB5m (elektropolisaj)" },
      { label: "Malzeme Se\xE7imi", value: "Galvanik uyuma g\xF6re" },
      { label: "Tolerans", value: "\xB10.01mm" },
      { label: "S\u0131zd\u0131rmazl\u0131k", value: "O-ring y\xFCzeyi Ra 0.4\xB5m" }
    ],
    advantages: [
      "Malzeme se\xE7imi galvanik uyum g\xF6zetilerek yap\u0131l\u0131r",
      "ASTM B117 tuz spreyi testi ile korozyon direnci do\u011Frulamas\u0131",
      "SS 316L, Duplex ve bronz i\u015Fleme uzmanl\u0131\u011F\u0131",
      "Superyacht ve yar\u0131\u015F yelkencili\u011Fi deneyimi",
      "Elektropolisaj ile ultra-p\xFCr\xFCzs\xFCz y\xFCzey",
      "Katodik koruma uyumlu malzeme dan\u0131\u015Fmanl\u0131\u011F\u0131"
    ],
    faq: [
      { question: "Deniz suyu uyumlu hangi malzemeleri i\u015Fliyorsunuz?", answer: "SS 316L, Duplex 2205, bronz (C95400, C95500), Monel 400 ve titanyum Grade 2 gibi deniz suyu uyumlu malzemelerle \xE7al\u0131\u015F\u0131yoruz." },
      { question: "Tuz testi raporu veriyor musunuz?", answer: "Evet, ASTM B117 tuz spreyi test y\xF6ntemiyle yap\u0131lan testin raporunu sa\u011Fl\u0131yoruz. Test s\xFCresi ve kabul kriteri par\xE7an\u0131n \u015Fartnamesine g\xF6re belirlenir." }
    ]
  },
  // ── Endüstriyel > Endüstriyel Sistemler ──
  {
    slug: "hidrolik-pnomatik",
    category: "endustriyel",
    categoryLabel: "End\xFCstriyel Sistemler",
    title: "Hidrolik & Pn\xF6matik",
    metaTitle: "Hidrolik & Pn\xF6matik Par\xE7a \xDCretimi | 350 Bar | S\u0131zd\u0131rmazl\u0131k | Mas Technic",
    metaDescription: "350 bar bas\u0131n\xE7 dayan\u0131ml\u0131 hidrolik ve pn\xF6matik sistem bile\u015Fenleri. Valf g\xF6vdesi, silindir, manifold blok. 42CrMo4, C45 \xE7elik, Ra 0.4\xB5m s\u0131zd\u0131rmazl\u0131k y\xFCzeyi.",
    description: "350 bar bas\u0131n\xE7 dayan\u0131ml\u0131 hidrolik ve pn\xF6matik sistem bile\u015Fenleri. Valf g\xF6vdeleri, silindir par\xE7alar\u0131, manifold bloklar\u0131 ve \xF6zel ak\u0131\u015Fkan g\xFC\xE7 komponentleri.",
    content: [
      "Hidrolik ve pn\xF6matik sistemler i\xE7in y\xFCksek bas\u0131n\xE7 dayan\u0131ml\u0131 bile\u015Fenler \xFCretiyoruz. Valf g\xF6vdeleri (y\xF6nlendirme, bas\u0131n\xE7, ak\u0131\u015F kontrol), silindir par\xE7alar\u0131 (piston, g\xF6vde, kapak), manifold bloklar\u0131 (\xE7ok portlu, entegre devre) ve pompa bile\u015Fenleri konusunda uzman\u0131z.",
      "350 bar'a kadar \xE7al\u0131\u015Fma bas\u0131nc\u0131nda O-ring ve s\u0131zd\u0131rmazl\u0131k y\xFCzeyleri Ra 0.4\xB5m kalitesinde i\u015Flenmektedir. 42CrMo4, C45, SS 316 ve \xF6zel ala\u015F\u0131mlarla \xFCretim yap\u0131yoruz. Derin delik delme kabiliyetimiz ile manifold bloklar\u0131nda i\xE7 kanal i\u015Fleme ger\xE7ekle\u015Ftiriyoruz.",
      "Bas\u0131n\xE7 ve s\u0131zd\u0131rmazl\u0131k testleri, i\u015F baz\u0131nda kontrol plan\u0131nda tan\u0131mlanan kapsamda uygulan\u0131r ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r. Valf montaj y\xFCzeyleri ISO 4401 delik d\xFCzenine g\xF6re i\u015Flenir; ba\u011Flant\u0131 geometrileri yayg\u0131n hidrolik bile\u015Fen aray\xFCzleriyle \xE7al\u0131\u015Facak \u015Fekilde \xFCretilir."
    ],
    features: [
      "Valf G\xF6vdesi \u2014 Y\xF6nlendirme, bas\u0131n\xE7 ve ak\u0131\u015F kontrol valfleri",
      "Silindir Par\xE7as\u0131 \u2014 Piston, g\xF6vde, kapak, mil",
      "Manifold Blok \u2014 \xC7ok portlu, derin delik kanall\u0131",
      "350 Bar Bas\u0131n\xE7 \u2014 Y\xFCksek bas\u0131n\xE7 dayan\u0131ml\u0131 \xFCretim",
      "S\u0131zd\u0131rmazl\u0131k Y\xFCzeyi \u2014 Ra 0.4\xB5m O-ring kanallar\u0131",
      "Bas\u0131n\xE7 Testi \u2014 Kontrol plan\u0131na g\xF6re s\u0131zd\u0131rmazl\u0131k kontrol\xFC"
    ],
    technicalSpecs: [
      { label: "Maks. Bas\u0131n\xE7", value: "350 bar" },
      { label: "S\u0131zd\u0131rmazl\u0131k", value: "Ra 0.4\xB5m O-ring y\xFCzey" },
      { label: "Malzeme", value: "42CrMo4, C45, SS 316" },
      { label: "Test", value: "1.5\xD7 bas\u0131n\xE7 testi" },
      { label: "Delik D\xFCzeni", value: "ISO 4401" },
      { label: "Derin Delik", value: "L/D 50:1" }
    ],
    processSteps: [
      "Teknik \xC7izim \u0130nceleme",
      "Malzeme Haz\u0131rl\u0131\u011F\u0131",
      "CNC \u0130\u015Fleme & Derin Delik",
      "S\u0131zd\u0131rmazl\u0131k Y\xFCzey \u0130\u015Fleme",
      "Bas\u0131n\xE7 Testi",
      "Boyutsal Kontrol & CMM",
      "Koruyucu Paketleme"
    ],
    advantages: [
      "350 bar'a kadar \xE7al\u0131\u015Fma bas\u0131nc\u0131 i\xE7in tasar\u0131m ve \xFCretim",
      "Ra 0.4\xB5m s\u0131zd\u0131rmazl\u0131k y\xFCzeyi i\u015Fleme kalitesi",
      "Derin delik kabiliyeti ile manifold kanal i\u015Fleme",
      "Kontrol plan\u0131na g\xF6re bas\u0131n\xE7 ve s\u0131zd\u0131rmazl\u0131k testi",
      "BoschRexroth, Parker uyumlu ba\u011Flant\u0131 geometrileri",
      "42CrMo4 ve SS 316 malzeme uzmanl\u0131\u011F\u0131"
    ],
    faq: [
      { question: "Ka\xE7 bar bas\u0131nca kadar par\xE7a \xFCretebiliyorsunuz?", answer: "350 bar \xE7al\u0131\u015Fma bas\u0131nc\u0131na kadar par\xE7a \xFCretiyoruz. Her par\xE7a 1.5\xD7 \xE7al\u0131\u015Fma bas\u0131nc\u0131nda test edilmektedir." },
      { question: "Manifold bloklar\u0131nda i\xE7 kanal a\xE7abilir misiniz?", answer: "Evet, derin delik delme kabiliyetimiz ile L/D 50:1 oran\u0131nda manifold kanal i\u015Fleme yapabiliyoruz." },
      { question: "S\u0131zd\u0131rmazl\u0131k nas\u0131l do\u011Frulan\u0131yor?", answer: "O-ring kanallar\u0131 ve s\u0131zd\u0131rmazl\u0131k y\xFCzeyleri Ra 0.4\xB5m hedefiyle i\u015Flenir. Bas\u0131n\xE7 ve s\u0131zd\u0131rmazl\u0131k testinin kapsam\u0131 i\u015F baz\u0131nda kontrol plan\u0131nda tan\u0131mlan\u0131r ve sonu\xE7lar teslimat dosyas\u0131na eklenir." }
    ]
  },
  {
    slug: "boru-baglanti-parcalari",
    category: "endustriyel",
    categoryLabel: "End\xFCstriyel Sistemler",
    title: "Boru & Ba\u011Flant\u0131 Par\xE7alar\u0131",
    metaTitle: "End\xFCstriyel Boru & Ba\u011Flant\u0131 Par\xE7alar\u0131 | ANSI, DIN, JIS | PN6-PN40 | Mas Technic",
    metaDescription: "ANSI, DIN, JIS standartlar\u0131nda boru ba\u011Flant\u0131 par\xE7alar\u0131. Flan\u015F, adapt\xF6r, nipel, dirsek. DN15-DN600, PN6-PN40. SS, CS, Duplex \xE7elik.",
    description: "ANSI, DIN ve JIS standartlar\u0131nda end\xFCstriyel boru ba\u011Flant\u0131 par\xE7alar\u0131. Flan\u015F, adapt\xF6r, nipel, dirsek ve \xF6zel ge\xE7i\u015F par\xE7alar\u0131.",
    content: [
      "End\xFCstriyel boru sistemleri i\xE7in flan\u015F (kaynak boyunlu, slip-on, k\xF6r), adapt\xF6rler (boru \xE7ap\u0131 ve standart ge\xE7i\u015Fleri), nipeller, dirsekler, T-par\xE7alar ve red\xFCksiyonlar \xFCretiyoruz. Flan\u015F delik d\xFCzeni, conta y\xFCzeyi ve \xE7ap \xF6l\xE7\xFCleri ANSI B16.5, DIN EN 1092 ve JIS B2220 boyut tablolar\u0131na g\xF6re i\u015Flenir.",
      "DN15-DN600 \xE7ap aral\u0131\u011F\u0131nda ve PN6-PN40 bas\u0131n\xE7 s\u0131n\u0131flar\u0131nda \xFCretim yap\u0131yoruz. Karbon \xE7eli\u011Fi (A105, A350 LF2), paslanmaz \xE7elik (F304, F316, F321), Duplex (F51, F53) ve \xF6zel ala\u015F\u0131mlarla (Inconel, Monel, Hastelloy) \xE7al\u0131\u015F\u0131yoruz.",
      "Bas\u0131n\xE7 testi, boyutsal kontrol ve y\xFCzey muayenesinin kapsam\u0131 i\u015F baz\u0131nda kontrol plan\u0131nda tan\u0131mlan\u0131r; sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r. S\u0131zd\u0131rmazl\u0131k y\xFCzeyleri ASME B16.5 FF/RF geometrisinde i\u015Flenir. Is\u0131l i\u015Flem kayd\u0131, NDT muayene raporu ve malzeme sertifikas\u0131 talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r."
    ],
    features: [
      "\xC7oklu Standart \u2014 ANSI B16.5, DIN EN 1092, JIS B2220",
      "Geni\u015F \xC7ap Aral\u0131\u011F\u0131 \u2014 DN15'ten DN600'e kadar",
      "PN6-PN40 Bas\u0131n\xE7 \u2014 Farkl\u0131 bas\u0131n\xE7 s\u0131n\u0131flar\u0131nda \xFCretim",
      "\xD6zel Ala\u015F\u0131mlar \u2014 Inconel, Monel, Hastelloy",
      "S\u0131zd\u0131rmazl\u0131k Y\xFCzey \u2014 FF/RF ASME B16.5 geometrisi",
      "Malzeme Sertifikas\u0131 \u2014 Talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r"
    ],
    technicalSpecs: [
      { label: "Standartlar", value: "ANSI, DIN, JIS" },
      { label: "Bas\u0131n\xE7 S\u0131n\u0131f\u0131", value: "PN6-PN40 / 150-2500 lb" },
      { label: "\xC7ap Aral\u0131\u011F\u0131", value: "DN15-DN600" },
      { label: "Malzeme", value: "CS, SS, Duplex, Inconel" },
      { label: "S\u0131zd\u0131rmazl\u0131k", value: "FF/RF (ASME B16.5)" },
      { label: "Sertifika", value: "Talebe ba\u011Fl\u0131" }
    ],
    advantages: [
      "ANSI, DIN ve JIS \xFC\xE7l\xFC standart uyumu",
      "DN15-DN600 geni\u015F \xE7ap aral\u0131\u011F\u0131nda \xFCretim",
      "Duplex ve s\xFCper ala\u015F\u0131m i\u015Fleme kabiliyeti",
      "Talebe ba\u011Fl\u0131 malzeme sertifikas\u0131 ve lot kayd\u0131",
      "ASME B16.5 geometrisinde s\u0131zd\u0131rmazl\u0131k y\xFCzeyleri",
      "Is\u0131l i\u015Flem ve NDT muayene dahil"
    ],
    faq: [
      { question: "Flan\u015F \xF6l\xE7\xFCleri hangi boyut tablolar\u0131na g\xF6re i\u015Fleniyor?", answer: "Flan\u015F delik d\xFCzeni, conta y\xFCzeyi ve \xE7ap \xF6l\xE7\xFCleri ANSI B16.5, DIN EN 1092 ve JIS B2220 boyut tablolar\u0131na ya da m\xFC\u015Fterinin verdi\u011Fi teknik resme g\xF6re i\u015Flenir." },
      { question: "Duplex \xE7elik flan\u015F \xFCretebiliyor musunuz?", answer: "Evet, Duplex 2205 (F51), Super Duplex 2507 (F53) ve di\u011Fer korozyon diren\xE7li ala\u015F\u0131mlarda flan\u015F ve ba\u011Flant\u0131 par\xE7alar\u0131 \xFCretiyoruz." }
    ]
  },
  {
    slug: "iklim-teknolojileri",
    category: "endustriyel",
    categoryLabel: "End\xFCstriyel Sistemler",
    title: "\u0130klim Teknolojileri",
    metaTitle: "HVAC & So\u011Futma Par\xE7a \xDCretimi | -40\xB0C / +200\xB0C | Helyum Test | Mas Technic",
    metaDescription: "HVAC, so\u011Futma ve havaland\u0131rma sistemi bile\u015Fenleri. Kompres\xF6r par\xE7as\u0131, valf, \u0131s\u0131 e\u015Fanj\xF6r. -40\xB0C/+200\xB0C s\u0131cakl\u0131k, 100 bar bas\u0131n\xE7, helyum s\u0131zd\u0131rmazl\u0131k testi.",
    description: "HVAC, so\u011Futma ve havaland\u0131rma sistemleri i\xE7in -40\xB0C / +200\xB0C s\u0131cakl\u0131k aral\u0131\u011F\u0131nda \xE7al\u0131\u015Fan hassas mekanik bile\u015Fenler.",
    content: [
      "HVAC, so\u011Futma ve havaland\u0131rma sistemleri i\xE7in kompres\xF6r par\xE7alar\u0131 (piston, valf plakas\u0131, silindir), genle\u015Fme valfi bile\u015Fenleri, \u0131s\u0131 e\u015Fanj\xF6r par\xE7alar\u0131 (boru plakas\u0131, baffle, ba\u011Flant\u0131) ve fan-blower komponentleri \xFCretiyoruz.",
      "-40\xB0C ile +200\xB0C aras\u0131nda \xE7al\u0131\u015Fma ko\u015Fullar\u0131na uygun malzeme se\xE7imi ve \xFCretim yap\u0131yoruz. 100 bar'a kadar bas\u0131n\xE7 dayan\u0131m\u0131, helyum s\u0131zd\u0131rmazl\u0131k testi ile 1\xD710\u207B\u2076 mbar\xB7L/s ka\xE7ak oran\u0131 kontrol\xFC ve termal \u015Fok testleri ile kalite g\xFCvencesi sa\u011Fl\u0131yoruz.",
      "Al 6061 (\u0131s\u0131 e\u015Fanj\xF6r), bak\u0131r (Cu-DHP, iletkenlik), SS 304/316 (korozyon direnci) ve \xF6zel ala\u015F\u0131mlarla \xFCretim yap\u0131yoruz. So\u011Futucu ak\u0131\u015Fkan uyumlulu\u011Fu (R-134a, R-410A, R-744) ve g\u0131da temas\u0131 gereksinimleri, malzeme se\xE7iminde \u015Fartnamenize g\xF6re de\u011Ferlendirilir."
    ],
    features: [
      "Kompres\xF6r Par\xE7as\u0131 \u2014 Piston, valf plakas\u0131, silindir",
      "Is\u0131 E\u015Fanj\xF6r \u2014 Boru plakas\u0131, baffle, ba\u011Flant\u0131",
      "Genle\u015Fme Valfi \u2014 Hassas ak\u0131\u015F kontrol\xFC",
      "-40\xB0C / +200\xB0C \u2014 Geni\u015F s\u0131cakl\u0131k aral\u0131\u011F\u0131",
      "Helyum S\u0131zd\u0131rmazl\u0131k \u2014 1\xD710\u207B\u2076 mbar\xB7L/s ka\xE7ak oran\u0131",
      "So\u011Futucu Uyumlu \u2014 R-134a, R-410A, R-744"
    ],
    technicalSpecs: [
      { label: "S\u0131cakl\u0131k Aral\u0131\u011F\u0131", value: "-40\xB0C / +200\xB0C" },
      { label: "Maks. Bas\u0131n\xE7", value: "100 bar" },
      { label: "S\u0131zd\u0131rmazl\u0131k", value: "Helyum 1\xD710\u207B\u2076 mbar\xB7L/s" },
      { label: "Malzeme", value: "Al, Cu, SS 304/316" },
      { label: "So\u011Futucu", value: "R-134a, R-410A, R-744" },
      { label: "So\u011Futucu S\u0131n\u0131f\u0131", value: "HFC / HFO / do\u011Fal" }
    ],
    advantages: [
      "-40\xB0C / +200\xB0C geni\u015F s\u0131cakl\u0131k aral\u0131\u011F\u0131nda dayan\u0131m",
      "Helyum s\u0131zd\u0131rmazl\u0131k testi ile ka\xE7ak do\u011Frulamas\u0131",
      "So\u011Futucu ile uyumlu malzeme se\xE7imi",
      "100 bar'a kadar bas\u0131n\xE7 dayan\u0131ml\u0131 bile\u015Fenler",
      "Termal \u015Fok testi ile uzun \xF6m\xFCr do\u011Frulamas\u0131",
      "HVAC ve end\xFCstriyel so\u011Futma sekt\xF6r deneyimi"
    ],
    faq: [
      { question: "Helyum s\u0131zd\u0131rmazl\u0131k testi yap\u0131yor musunuz?", answer: "Evet, helyum s\u0131zd\u0131rmazl\u0131k testi ile 1\xD710\u207B\u2076 mbar\xB7L/s ka\xE7ak oran\u0131 kontrol\xFC yap\u0131yoruz. So\u011Futma ve klima sistemleri i\xE7in kritik olan bu test standartt\u0131r." },
      { question: "Hangi so\u011Futucularla uyumlu par\xE7a \xFCretiyorsunuz?", answer: "R-134a, R-410A, R-744 (CO\u2082) ve R-290 so\u011Futucularla uyumlu malzeme ve y\xFCzey i\u015Flemi ile \xFCretim yap\u0131yoruz." }
    ]
  },
  // ── Endüstriyel > Üretim Çözümleri ──
  {
    slug: "prototip-uretim",
    category: "endustriyel",
    categoryLabel: "\xDCretim \xC7\xF6z\xFCmleri",
    title: "Prototip \xDCretim",
    /* 09a-C2: all THREE of these carried "3-5 iş günü", and two of them ship
       into search results rather than the page body — a delivery promise in a
       `<title>` is quoted by Google beside the domain, where no reader ever
       sees the page that would qualify it. The route and the "hızlı prototip"
       positioning stay (§1.3 permits positioning through capability); what
       goes is the number nobody can substantiate. The page still has its case
       to make: real material, series-equivalent tolerance, single-unit orders
       and a three-iteration revision loop. */
    metaTitle: "H\u0131zl\u0131 Prototip \xDCretimi | CNC, 3D Bask\u0131, Silikon Kal\u0131p | Mas Technic",
    metaDescription: "CNC, 3D bask\u0131 (FDM/SLA/SLS/DMLS) ve silikon kal\u0131plama ile fonksiyonel prototip. Ger\xE7ek malzemede seri \xFCretim e\u015Fde\u011Fer tolerans, tek adetten \xFCretim.",
    description: "CNC i\u015Fleme, 3D bask\u0131 ve silikon kal\u0131plama ile fonksiyonel prototip \xFCretimi. Ger\xE7ek malzeme ile seri \xFCretim e\u015Fde\u011Fer kalite, tek adet sipari\u015F.",
    content: [
      "Tasar\u0131m konseptlerinizi fiziksel \xFCr\xFCnlere d\xF6n\xFC\u015Ft\xFCr\xFCyoruz. CNC i\u015Fleme ile ger\xE7ek malzemede (Al, SS, Ti, PEEK) seri \xFCretim e\u015Fde\u011Fer toleransta prototip, 3D bask\u0131 ile h\u0131zl\u0131 konsept do\u011Frulama ve silikon kal\u0131plama ile 10-50 adet \xE7oklu prototip \xFCretimi sunuyoruz.",
      "Fonksiyonel prototip ile par\xE7an\u0131z\u0131 ger\xE7ek \xE7al\u0131\u015Fma ko\u015Fullar\u0131nda test edebilirsiniz. DFM analizi ile tasar\u0131m iyile\u015Ftirmesi ve seri \xFCretime ge\xE7i\u015F i\xE7in kontrol plan\u0131 haz\u0131rl\u0131\u011F\u0131 s\xFCrecin par\xE7as\u0131d\u0131r. Tek adet sipari\u015F kabul ediyoruz.",
      "Eklemeli imalat se\xE7enekleri: FDM (ABS, PLA, naylon) bi\xE7im ve montaj denemeleri, SLA (re\xE7ine) ince detay ve y\xFCzey, SLS (PA12) destek gerektirmeyen fonksiyonel par\xE7alar ve DMLS ile metal fonksiyonel prototipler."
    ],
    features: [
      "Tek Adet Sipari\u015F \u2014 prototip i\xE7in asgari adet yok",
      "Ger\xE7ek Malzeme \u2014 Al, SS, Ti, PEEK ile \xFCretim",
      "3D Bask\u0131 \u2014 FDM, SLA, SLS, DMLS teknolojileri",
      "Silikon Kal\u0131plama \u2014 10-50 adet \xE7oklu prototip",
      "DFM Analizi \u2014 Tasar\u0131m optimizasyonu dahil",
      "3 \u0130terasyonlu Revizyon D\xF6ng\xFCs\xFC \u2014 Tasar\u0131m revizyon deste\u011Fi"
    ],
    technicalSpecs: [
      { label: "Teslim S\xFCresi", value: LEAD_TIME_SHORT },
      { label: "Min. Adet", value: "1 adet" },
      { label: "Tolerans", value: "Seri \xFCretim e\u015Fde\u011Fer" },
      { label: "Malzeme", value: "Ger\xE7ek malzeme" },
      { label: "3D Bask\u0131", value: "FDM, SLA, SLS, DMLS" },
      { label: "\u0130terasyon", value: "3 revizyon dahil" }
    ],
    advantages: [
      "Termin, y\xF6ntem ve malzeme se\xE7ildikten sonra teklifle birlikte verilir",
      "Ger\xE7ek malzeme ile fonksiyonel test imkan\u0131",
      "4 farkl\u0131 3D bask\u0131 teknolojisi (metal dahil)",
      "DFM analizi ile tasar\u0131m optimizasyonu",
      "3 iterasyonlu revizyon d\xF6ng\xFCs\xFC ile risk azaltma",
      "Seri \xFCretime sorunsuz ge\xE7i\u015F deste\u011Fi"
    ],
    faq: [
      { question: "En h\u0131zl\u0131 prototip ne kadar s\xFCrede haz\u0131r olur?", answer: `Y\xF6ntem se\xE7imi termini do\u011Frudan etkiler: 3D bask\u0131 konsept do\u011Frulamada en h\u0131zl\u0131 se\xE7enektir, CNC ise ger\xE7ek malzeme ve seri \xFCretim e\u015Fde\u011Fer tolerans gerekti\u011Finde tercih edilir. ${LEAD_TIME_STATEMENT}` },
      { question: "Ger\xE7ek malzeme ile prototip yapabiliyor musunuz?", answer: "Evet, CNC ile Al 6061, SS 304, Ti6Al4V, PEEK gibi ger\xE7ek malzemelerde seri \xFCretim e\u015Fde\u011Fer toleransta prototip \xFCretiyoruz." }
    ]
  },
  {
    slug: "kucuk-seri",
    category: "endustriyel",
    categoryLabel: "\xDCretim \xC7\xF6z\xFCmleri",
    title: "K\xFC\xE7\xFCk Seri \xDCretim",
    metaTitle: "K\xFC\xE7\xFCk Seri \xDCretim | 10-500 Adet | CNC & H\u0131zl\u0131 Kal\u0131p | Mas Technic",
    metaDescription: "10-500 adet k\xFC\xE7\xFCk seri \xFCretim. CNC i\u015Fleme, al\xFCminyum kal\u0131p ve silikon kal\u0131plama; hacim artt\u0131k\xE7a d\xFC\u015Fen birim maliyet ve parti izlenebilirli\u011Fi.",
    description: "10-500 adet aral\u0131\u011F\u0131nda k\xFC\xE7\xFCk seri \xFCretim. Prototipten k\xFC\xE7\xFCk seriye ge\xE7i\u015F, hacimle d\xFC\u015Fen birim maliyet ve parti bazl\u0131 izlenebilirlik.",
    content: [
      "K\xFC\xE7\xFCk seri \xFCretim ihtiya\xE7lar\u0131n\u0131z\u0131 CNC i\u015Fleme, h\u0131zl\u0131 al\xFCminyum kal\u0131p ve silikon kal\u0131plama y\xF6ntemleri ile esnek ve maliyet etkin \u015Fekilde kar\u015F\u0131l\u0131yoruz. 10-500 adet aral\u0131\u011F\u0131nda prototipten k\xFC\xE7\xFCk seriye sorunsuz ge\xE7i\u015F sa\u011Fl\u0131yoruz.",
      "K\xFC\xE7\xFCk seride birim maliyeti belirleyen as\u0131l kalem kurulumdur: kurulum maliyeti adede b\xF6l\xFCnd\xFC\u011F\xFC i\xE7in hacim artt\u0131k\xE7a birim fiyat d\xFC\u015Fer. Kontrol plan\u0131 ve parti bazl\u0131 izlenebilirlik standart olarak sa\u011Flan\u0131r; kademeli fiyatland\u0131rma teklifle birlikte verilir.",
      "Pazar testi, pilot \xFCretim ve pre-production a\u015Famalar\u0131 i\xE7in ideal \xE7\xF6z\xFCm. Seri \xFCretim ge\xE7i\u015F planlamas\u0131 dahil \u2014 kal\u0131p yat\u0131r\u0131m analizi, otomasyon fizibilite ve maliyet projeksiyon raporu sunuyoruz."
    ],
    features: [
      "10-500 Adet \u2014 Esnek k\xFC\xE7\xFCk seri \xFCretim kapasitesi",
      "Hacim \u0130ndirimi \u2014 Adet artt\u0131k\xE7a birim maliyet d\xFC\u015Fer",
      "Termin \u2014 kapasite plan\u0131yla birlikte teklifte verilir",
      "Kontrol Plan\u0131 \u2014 k\xFC\xE7\xFCk seride de standart olarak haz\u0131rlan\u0131r",
      "Pazar Testi \u2014 Pre-production ve pilot \xFCretim deste\u011Fi",
      "Seri \xDCretim Ge\xE7i\u015F Plan\u0131 \u2014 \xD6l\xE7eklendirme dan\u0131\u015Fmanl\u0131\u011F\u0131"
    ],
    technicalSpecs: [
      { label: "Adet Aral\u0131\u011F\u0131", value: "10-500 adet" },
      { label: "Teslim", value: LEAD_TIME_SHORT },
      { label: "Kalite", value: "Kontrol plan\u0131 + \xF6l\xE7\xFCm kayd\u0131" },
      /* 09a-C2: "%15-25" and "%25-35 hacim indirimi" are a PRICE POLICY, not a
         duration — the reader is being told what discount they will get, and
         `USER_INPUTS.md` authorises no discount schedule. The page's own FAQ
         two fields below already gives the honest answer ("kademeli
         fiyatlandırmayı teklifle birlikte veriyoruz"), so the spec rows were
         contradicting the FAQ on the same page. The DIRECTION — unit cost falls
         as volume rises — is arithmetic about setup amortisation and stays. */
      { label: "Hacim \u0130ndirimi", value: "Kademeli fiyatland\u0131rma teklifte" },
      { label: "Y\xF6ntemler", value: "CNC, Al kal\u0131p, silikon" }
    ],
    advantages: [
      "Hacim indirimi ile maliyet optimizasyonu",
      "Termin, kurulum ve kapasite plan\u0131 incelendikten sonra verilir",
      "Kontrol plan\u0131 ve \xF6l\xE7\xFCm kayd\u0131 k\xFC\xE7\xFCk seride de standartt\u0131r",
      "Prototipten k\xFC\xE7\xFCk seriye sorunsuz ge\xE7i\u015F",
      "Seri \xFCretim ge\xE7i\u015F plan\u0131 ve maliyet projeksiyonu",
      "Lot bazl\u0131 izlenebilirlik ve kalite raporlamas\u0131"
    ],
    faq: [
      { question: "K\xFC\xE7\xFCk seride birim maliyet y\xFCksek mi?", answer: "Birim maliyeti belirleyen as\u0131l kalem kurulumdur ve adede b\xF6l\xFCn\xFCr; hacim artt\u0131k\xE7a birim fiyat d\xFC\u015Fer. Kademeli fiyatland\u0131rmay\u0131 ve seri \xFCretime ge\xE7i\u015F projeksiyonunu teklifle birlikte veriyoruz." },
      { question: "K\xFC\xE7\xFCk seriden seri \xFCretime ge\xE7i\u015F nas\u0131l olur?", answer: "Kal\u0131p yat\u0131r\u0131m analizi, otomasyon fizibilite ve maliyet projeksiyon raporu ile \xF6l\xE7eklendirme planlamas\u0131 yap\u0131yoruz." }
    ]
  },
  {
    slug: "seri-uretim",
    category: "endustriyel",
    categoryLabel: "\xDCretim \xC7\xF6z\xFCmleri",
    title: "Seri \xDCretim",
    metaTitle: "Seri \xDCretim | Tekrarlanabilir Kurulum ve Parti Kontrol\xFC | Mas Technic",
    metaDescription: "Seri \xFCretimde standart kurulum, kontrol plan\u0131na ba\u011Fl\u0131 ara kontrol ve parti izlenebilirli\u011Fi. Teslimat program\u0131 kapasite planlamas\u0131yla belirlenir.",
    description: "Seri \xFCretimde as\u0131l mesele h\u0131z de\u011Fil tekrarlanabilirliktir: standart kurulum, kontrol plan\u0131na ba\u011Fl\u0131 ara kontrol ve parti bazl\u0131 izlenebilirlik.",
    content: [
      "Seri \xFCretimde tezg\xE2h\u0131n h\u0131z\u0131 de\u011Fil kurulumun tekrarlanabilirli\u011Fi belirleyicidir. Sabit referans y\xFCzeyleri, standart kurulum prosed\xFCr\xFC ve otomatik tak\u0131m de\u011Fi\u015Ftirme, ayn\u0131 par\xE7an\u0131n partiler aras\u0131nda ayn\u0131 \xE7\u0131kmas\u0131n\u0131 sa\u011Flar.",
      "Her partide, kontrol plan\u0131nda tan\u0131mlanan koteler \xF6l\xE7\xFCl\xFCr ve sonu\xE7lar kay\u0131t alt\u0131na al\u0131n\u0131r. Tak\u0131m a\u015F\u0131nmas\u0131na duyarl\u0131 \xF6l\xE7\xFCler ayr\u0131 bir ara kontrol ad\u0131m\u0131yla izlenir; sapma e\u011Filimi g\xF6r\xFCld\xFC\u011F\xFCnde par\xE7a de\u011Fil proses d\xFCzeltilir.",
      "Seri \xFCretim m\xFC\u015Fterilerimize y\u0131ll\u0131k kontrat, JIT teslimat program\u0131, Kanban stok y\xF6netimi, haftal\u0131k kapasite raporlamas\u0131 ve s\xFCrekli iyile\u015Ftirme (Kaizen) programlar\u0131 sunuyoruz."
    ],
    features: [
      "Standart Kurulum \u2014 sabit referans ve tekrarlanabilir ba\u011Flama",
      "Otomatik Tak\u0131m De\u011Fi\u015Ftirme \u2014 uzun partilerde kesintisiz i\u015Fleme",
      "\u0130lk Par\xE7a Onay\u0131 \u2014 seri, onay al\u0131nmadan ba\u015Flamaz",
      "Parti Kayd\u0131 \u2014 d\xF6k\xFCm ve parti bazl\u0131 izlenebilirlik",
      "Ara Kontrol \u2014 kayma e\u011Filimi olan koteler izlenir",
      "JIT Teslimat \u2014 Kanban entegreli stok y\xF6netimi"
    ],
    technicalSpecs: [
      { label: "Kurulum", value: "Standart prosed\xFCr" },
      { label: "Onay", value: "\u0130lk par\xE7a onay\u0131" },
      { label: "Kontrol", value: "Kontrol plan\u0131na g\xF6re" },
      { label: "Ara Kontrol", value: "Kayma e\u011Filimli koteler" },
      { label: "Teslimat", value: "JIT / Kanban" },
      { label: "\u0130zlenebilirlik", value: "Parti ve d\xF6k\xFCm kayd\u0131" }
    ],
    advantages: [
      "Sabit referans y\xFCzeyleriyle tekrarlanabilir ba\u011Flama",
      "Standart kurulum prosed\xFCr\xFC ile partiler aras\u0131 tutarl\u0131l\u0131k",
      "\xD6l\xE7\xFCm sonu\xE7lar\u0131 parti baz\u0131nda kay\u0131t alt\u0131na al\u0131n\u0131r",
      "Kayma e\u011Filimi olan koteler ara kontrolle izlenir",
      "JIT ve Kanban ile esnek teslimat",
      "Parti durumu \xFCretim boyunca kay\u0131t alt\u0131nda tutulur"
    ],
    faq: [
      { question: "Seri \xFCretim i\xE7in asgari adet var m\u0131?", answer: "Sabit bir asgari adet uygulam\u0131yoruz. Parti b\xFCy\xFCkl\xFC\u011F\xFC, teslimat program\u0131 ve fiyatland\u0131rma kapasite planlamas\u0131 yap\u0131ld\u0131ktan sonra teklifle birlikte netle\u015Fir." },
      { question: "Teslimat program\u0131 nas\u0131l belirleniyor?", answer: "Kapasite planlamas\u0131 sonras\u0131nda parti b\xFCy\xFCkl\xFC\u011F\xFC ve teslimat s\u0131kl\u0131\u011F\u0131 birlikte kararla\u015Ft\u0131r\u0131l\u0131r; haftal\u0131k veya periyodik teslimat programlar\u0131 d\xFCzenlenebilir." }
    ]
  },
  {
    slug: "ozel-projeler",
    category: "endustriyel",
    categoryLabel: "\xDCretim \xC7\xF6z\xFCmleri",
    title: "\xD6zel M\xFChendislik Projeleri",
    metaTitle: "\xD6zel M\xFChendislik Projeleri | Anahtar Teslim | R&D | Reverse Engineering | Mas Technic",
    metaDescription: "Standart d\u0131\u015F\u0131 \xF6zel m\xFChendislik projeleri. Anahtar teslim \xE7\xF6z\xFCmler, reverse engineering, R&D prototipleme, konseptten \xFCretime tam s\xFCre\xE7 y\xF6netimi.",
    description: "Standart \xE7\xF6z\xFCmlerin yetersiz kald\u0131\u011F\u0131 \xF6zel m\xFChendislik projeleri i\xE7in anahtar teslim \xE7\xF6z\xFCmler. Reverse engineering, R&D ve konseptten \xFCretime tam s\xFCre\xE7.",
    content: [
      "Standart \xE7\xF6z\xFCmlerin yetersiz kald\u0131\u011F\u0131 \xF6zel m\xFChendislik projeleri i\xE7in anahtar teslim \xE7\xF6z\xFCmler sunuyoruz. Reverse engineering (3D tarama \u2192 CAD \u2192 \xFCretim), R&D prototipleme (konsept do\u011Frulama \u2192 fonksiyonel test), \xF6zel tezgah ve fikst\xFCr tasar\u0131m-imalat ve \xE7oklu disiplin projeleri (mekanik + elektronik + yaz\u0131l\u0131m) y\xF6netiyoruz.",
      "Proje y\xF6netimi \u2014 konseptten \xFCretime t\xFCm s\xFCre\xE7ler tek \xE7at\u0131 alt\u0131nda: fizibilite analizi, tasar\u0131m (SolidWorks, CATIA, NX), prototip \xFCretimi, test ve do\u011Frulama, pilot \xFCretim ve seri \xFCretim ge\xE7i\u015Fi. Her proje \xF6zel bir proje m\xFChendisi taraf\u0131ndan y\xF6netilir.",
      "\xDCr\xFCn geli\u015Ftirme dan\u0131\u015Fmanl\u0131\u011F\u0131 s\xFCrecin par\xE7as\u0131d\u0131r. Teknik verinin nas\u0131l payla\u015F\u0131laca\u011F\u0131 ve fikri m\xFClkiyetin nas\u0131l ele al\u0131naca\u011F\u0131 proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak mutab\u0131k kal\u0131n\u0131r."
    ],
    features: [
      "Anahtar Teslim \u2014 Konseptten \xFCretime tam \xE7\xF6z\xFCm",
      "Reverse Engineering \u2014 3D tarama, CAD modelleme, \xFCretim",
      "R&D Prototipleme \u2014 Konsept do\u011Frulama ve fonksiyonel test",
      "\xD6zel Tezgah Tasar\u0131m\u0131 \u2014 Fikst\xFCr ve aparat imalat\u0131",
      "\xC7oklu Disiplin \u2014 Mekanik + elektronik + yaz\u0131l\u0131m",
      "Fikri M\xFClkiyet \u2014 ko\u015Fullar proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak belirlenir"
    ],
    technicalSpecs: [
      { label: "S\xFCre\xE7", value: "Konseptten \xFCretime" },
      { label: "3D Tarama", value: "0.02mm hassasiyet" },
      { label: "CAD", value: "SolidWorks, CATIA, NX" },
      { label: "Ko\u015Fullar", value: "Proje ba\u015F\u0131nda yaz\u0131l\u0131" },
      { label: "Ar-Ge", value: "T\xDCB\u0130TAK, KOSGEB deste\u011Fi" },
      { label: "Proje Y\xF6netimi", value: "\xD6zel proje m\xFChendisi" }
    ],
    advantages: [
      "Konseptten seri \xFCretime anahtar teslim \xE7\xF6z\xFCm",
      "Reverse engineering ile yedek par\xE7a \xFCretimi",
      "R&D prototipleme ve fonksiyonel test deste\u011Fi",
      "Teknik veri ve fikri m\xFClkiyet ko\u015Fullar\u0131 proje ba\u015F\u0131nda netle\u015Fir",
      "T\xDCB\u0130TAK ve KOSGEB proje dan\u0131\u015Fmanl\u0131\u011F\u0131",
      "\xD6zel proje m\xFChendisi ile tek muhatap"
    ],
    faq: [
      { question: "Reverse engineering yapabiliyor musunuz?", answer: "Evet, 3D tarama (0.02mm hassasiyet) ile mevcut par\xE7an\u0131z\u0131 dijitalle\u015Ftiriyor, CAD modeline d\xF6n\xFC\u015Ft\xFCr\xFCyor ve \xFCretiyoruz." },
      { question: "Teknik verim nas\u0131l ele al\u0131n\u0131yor?", answer: "Teknik verinin nas\u0131l payla\u015F\u0131laca\u011F\u0131 ve fikri m\xFClkiyetin nas\u0131l ele al\u0131naca\u011F\u0131 proje ba\u015F\u0131nda yaz\u0131l\u0131 olarak mutab\u0131k kal\u0131n\u0131r. \u0130htiyac\u0131n\u0131z\u0131 teklif a\u015Famas\u0131nda belirtin." }
    ]
  },
  // ── Endüstriyel > Enerji & Altyapı ──
  {
    slug: "yenilenebilir-enerji",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyap\u0131",
    title: "Yenilenebilir Enerji",
    metaTitle: "Yenilenebilir Enerji Par\xE7a \xDCretimi | R\xFCzgar & G\xFCne\u015F | Mas Technic",
    metaDescription: "R\xFCzgar t\xFCrbini ve g\xFCne\u015F enerjisi sistemi bile\u015Fenleri. Hot-dip galvaniz korozyon korumas\u0131, a\u011F\u0131r y\xFCk par\xE7alar\u0131. Hub, pitch sistemi, montaj aparat\u0131 \xFCretimi.",
    description: "R\xFCzgar t\xFCrbini, g\xFCne\u015F enerjisi ve enerji depolama sistemleri i\xE7in d\u0131\u015F ortam ko\u015Fullar\u0131na g\xF6re malzeme ve kaplama se\xE7ilerek \xFCretilen bile\u015Fenler.",
    content: [
      "R\xFCzgar t\xFCrbini bile\u015Fenleri (hub, nacelle, pitch sistemi, yaw sistemi, tower flan\u015F\u0131), g\xFCne\u015F paneli montaj sistemleri (tracker, sabit montaj, rail, klamp) ve enerji depolama par\xE7alar\u0131 (batarya muhafazas\u0131, so\u011Futma bile\u015Fenleri) \xFCretiyoruz.",
      "D\u0131\u015F ortam ko\u015Fullar\u0131na g\xF6re malzeme ve kaplama se\xE7imi ile 25+ y\u0131l d\u0131\u015F ortam \xF6mr\xFC hedefliyoruz. Hot-dip galvaniz (ISO 1461 \u2014 85\xB5m min.), Dacromet kaplama ve SS 316L malzeme ile korozyon korumas\u0131 sa\u011Fl\u0131yoruz. GGG-40, GGG-50 k\xFCresel grafitli d\xF6kme demir ve y\xFCksek mukavemetli \xE7eliklerle a\u011F\u0131r y\xFCk bile\u015Fenleri \xFCretiyoruz.",
      "Offshore ve onshore r\xFCzgar enerjisi projeleri, utility-scale g\xFCne\u015F enerjisi santralleri ve end\xFCstriyel enerji depolama sistemleri i\xE7in par\xE7a tedarik ediyoruz."
    ],
    features: [
      "R\xFCzgar T\xFCrbini \u2014 Hub, pitch, yaw, tower flan\u015F\u0131",
      "G\xFCne\u015F Paneli Montaj \u2014 Tracker, rail, klamp",
      "A\u011F\u0131r Y\xFCk Bile\u015Fenleri \u2014 GGG-40/50 ve y\xFCksek mukavemetli \xE7elik",
      "Hot-Dip Galvaniz \u2014 ISO 1461, 85\xB5m+ kaplama",
      "25+ Y\u0131l \xD6m\xFCr \u2014 D\u0131\u015F ortam dayan\u0131m tasar\u0131m\u0131",
      "Enerji Depolama \u2014 Batarya muhafaza, so\u011Futma"
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "SS 316L, GGG-40, S355" },
      { label: "Kaplama", value: "Hot-dip galvaniz (85\xB5m+)" },
      { label: "Dayan\u0131m", value: "25+ y\u0131l d\u0131\u015F ortam" },
      { label: "Kapsam", value: "R\xFCzgar, g\xFCne\u015F, depolama" },
      { label: "A\u011F\u0131rl\u0131k", value: "500 kg'a kadar" },
      { label: "NDT", value: "UT, MT zorunlu" }
    ],
    advantages: [
      "D\u0131\u015F ortam ko\u015Fullar\u0131na g\xF6re malzeme ve kaplama se\xE7imi",
      "Hot-dip galvaniz ile 25+ y\u0131l korozyon korumas\u0131",
      "500 kg'a kadar a\u011F\u0131r par\xE7a i\u015Fleme kapasitesi",
      "Offshore ve onshore proje deneyimi",
      "GGG-40/50 d\xF6kme demir i\u015Fleme uzmanl\u0131\u011F\u0131",
      "NDT muayene dahil kalite g\xFCvence"
    ],
    faq: [
      { question: "R\xFCzgar t\xFCrbini bile\u015Fenleri \xFCretebiliyor musunuz?", answer: "Evet; hub, pitch sistemi, yaw mekanizmas\u0131, tower flan\u015F\u0131 ve nacelle i\xE7 bile\u015Fenleri \xFCretiyoruz. Uygulanacak \u015Fartname ve kabul kriterleri i\u015F baz\u0131nda m\xFC\u015Fteriyle birlikte belirlenir." },
      { question: "Ka\xE7 y\u0131l d\u0131\u015F ortam dayan\u0131m\u0131 sa\u011Fl\u0131yorsunuz?", answer: "Hot-dip galvaniz (ISO 1461, 85\xB5m+) ve uygun malzeme se\xE7imi ile 25+ y\u0131l d\u0131\u015F ortam \xF6mr\xFC hedefliyoruz." }
    ]
  },
  {
    slug: "petrol-gaz",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyap\u0131",
    title: "Petrol & Gaz",
    metaTitle: "Petrol & Gaz Par\xE7a \xDCretimi | 15000 PSI | Mas Technic",
    metaDescription: "Petrol ve gaz sekt\xF6r\xFC bile\u015Fenleri. 15.000 PSI bas\u0131n\xE7, -46\xB0C/+343\xB0C s\u0131cakl\u0131k. Inconel, Duplex ve Super Duplex \xE7elik i\u015Fleme.",
    description: "Petrol ve gaz sekt\xF6r\xFC bile\u015Fenleri. 15.000 PSI bas\u0131n\xE7, -46\xB0C/+343\xB0C s\u0131cakl\u0131k aral\u0131\u011F\u0131nda \xE7al\u0131\u015Fan kritik par\xE7alar.",
    content: [
      "Petrol ve gaz sekt\xF6r\xFCn\xFCn zorlu \xE7al\u0131\u015Fma ko\u015Fullar\u0131na uygun y\xFCksek dayan\u0131ml\u0131 par\xE7alar \xFCretiyoruz. Wellhead ve Christmas tree bile\u015Fenleri, choke ve kontrol valfleri, boru ba\u011Flant\u0131 par\xE7alar\u0131 (API 6A flan\u015F, hub), manifold ve BOP (Blowout Preventer) komponentleri imal ediyoruz.",
      "Wellhead, pipeline valf ve casing uygulamalar\u0131 i\xE7in 15.000 PSI (1034 bar) \xE7al\u0131\u015Fma bas\u0131nc\u0131 ve -46\xB0C / +343\xB0C s\u0131cakl\u0131k aral\u0131\u011F\u0131ndaki par\xE7alar\u0131 \xFCretiyoruz. Sour service uygulamalar\u0131nda malzeme, \u0131s\u0131l i\u015Flem ve sertlik s\u0131n\u0131rlar\u0131 m\xFC\u015Fteri \u015Fartnamesine g\xF6re belirlenir ve kay\u0131t alt\u0131na al\u0131n\u0131r.",
      "Inconel 625/718, Duplex 2205, Super Duplex 2507, F22 (2.25Cr-1Mo) ve SS 316L gibi korozyon ve y\xFCksek s\u0131cakl\u0131k dayan\u0131ml\u0131 malzemelerle \xE7al\u0131\u015F\u0131yoruz. Tahribats\u0131z muayene (RT, UT, MPI, PMI) kapsam\u0131, \u015Fartnameye g\xF6re kontrol plan\u0131nda tan\u0131mlan\u0131r."
    ],
    features: [
      "Wellhead & Pipeline \u2014 Flan\u015F, hub, valf g\xF6vdesi",
      "15.000 PSI \u2014 Ultra y\xFCksek bas\u0131n\xE7 dayan\u0131m\u0131",
      "-46\xB0C / +343\xB0C \u2014 Ekstrem s\u0131cakl\u0131k aral\u0131\u011F\u0131",
      "Sour Service \u2014 \u015Eartnameye g\xF6re malzeme ve \u0131s\u0131l i\u015Flem",
      "Inconel & Duplex \u2014 Korozyon diren\xE7li \xF6zel ala\u015F\u0131mlar",
      "Tahribats\u0131z Muayene \u2014 RT, UT, MPI, PMI; kapsam plana yaz\u0131l\u0131r"
    ],
    technicalSpecs: [
      { label: "Kapsam", value: "Wellhead, pipeline, casing" },
      { label: "Bas\u0131n\xE7", value: "15.000 PSI (1034 bar)" },
      { label: "S\u0131cakl\u0131k", value: "-46\xB0C / +343\xB0C" },
      { label: "Sour Service", value: "\u015Eartnameye g\xF6re" },
      { label: "Malzeme", value: "Inconel, Duplex, F22" },
      { label: "NDT", value: "RT, UT, MPI, PMI" }
    ],
    advantages: [
      "Wellhead ve pipeline bile\u015Feni \xFCretim kapasitesi",
      "15.000 PSI ultra y\xFCksek bas\u0131n\xE7 kapasitesi",
      "Sour service i\xE7in \u015Fartnameye g\xF6re malzeme se\xE7imi",
      "Inconel ve Super Duplex i\u015Fleme uzmanl\u0131\u011F\u0131",
      "Tahribats\u0131z muayene kapsam\u0131 kontrol plan\u0131nda tan\u0131mlan\u0131r",
      "Offshore ve onshore proje deneyimi"
    ],
    faq: [
      { question: "Petrol ve gaz bile\u015Fenlerinde hangi kalite kay\u0131tlar\u0131 veriliyor?", answer: "Malzeme sertifikas\u0131, \u0131s\u0131l i\u015Flem kayd\u0131 ve tahribats\u0131z muayene raporlar\u0131, kapsam\u0131 kontrol plan\u0131nda tan\u0131mland\u0131\u011F\u0131 \u015Fekilde teslimat dosyas\u0131na eklenir." },
      { question: "Sour service uyumlu par\xE7a \xFCretebiliyor musunuz?", answer: "Evet. Sour service uygulamalar\u0131nda malzeme, \u0131s\u0131l i\u015Flem ve sertlik s\u0131n\u0131rlar\u0131 m\xFC\u015Fteri \u015Fartnamesine g\xF6re belirlenir ve kay\u0131t alt\u0131na al\u0131n\u0131r." }
    ]
  },
  {
    slug: "guc-dagitim-sistemleri",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyap\u0131",
    title: "G\xFC\xE7 Da\u011F\u0131t\u0131m Sistemleri",
    metaTitle: "G\xFC\xE7 Da\u011F\u0131t\u0131m Par\xE7a \xDCretimi | 36kV | IACS %99+ | Mas Technic",
    metaDescription: "Elektrik da\u011F\u0131t\u0131m ve g\xFC\xE7 sistemi bile\u015Fenleri. 36kV'a kadar, IACS %99+ iletkenlik. Bak\u0131r ve al\xFCminyum bara, kontak par\xE7as\u0131, izolator.",
    description: "Elektrik da\u011F\u0131t\u0131m panolar\u0131, transformat\xF6r bile\u015Fenleri ve g\xFC\xE7 da\u011F\u0131t\u0131m sistemi par\xE7alar\u0131. 36kV gerilim seviyesine kadar.",
    content: [
      "Elektrik da\u011F\u0131t\u0131m sistemi bile\u015Fenleri \xFCretiyoruz: bak\u0131r ve al\xFCminyum baralar (iletken, IACS %99+), kontak par\xE7alar\u0131 (g\xFCm\xFC\u015F kaplama, d\xFC\u015F\xFCk diren\xE7), izolator montaj elemanlar\u0131 ve pano i\xE7 bile\u015Fenleri. 36kV gerilim seviyesine kadar \xE7al\u0131\u015Fan par\xE7alar \xFCretiyoruz.",
      "OFE bak\u0131r (C10100 \u2014 IACS %101), ETP bak\u0131r (C11000 \u2014 IACS %99.9) ve elektrik kalite al\xFCminyum (1050/1070 \u2014 IACS %61) ile y\xFCksek iletkenlik gerektiren par\xE7alar \xFCretiyoruz. G\xFCm\xFC\u015F kaplama ile kontak direncini minimize ediyor, nikel altl\u0131k ile dif\xFCzyon bariyeri olu\u015Fturuyoruz.",
      "Termal sim\xFClasyon ile \u0131s\u0131 da\u011F\u0131l\u0131m\u0131 optimizasyonu, k\u0131sa devre ak\u0131m dayan\u0131m\u0131 hesaplama ve ark direnci testleri ile g\xFCvenlik do\u011Frulamas\u0131 sa\u011Fl\u0131yoruz."
    ],
    features: [
      "Pano \u0130\xE7 Bile\u015Fenleri \u2014 \u0130zolator montaj ve ba\u011Flant\u0131 elemanlar\u0131",
      "36kV Gerilim \u2014 Orta gerilim seviyesine kadar",
      "IACS %99+ \u0130letkenlik \u2014 OFE ve ETP bak\u0131r",
      "G\xFCm\xFC\u015F Kaplama \u2014 D\xFC\u015F\xFCk kontak direnci",
      "Bara \xDCretimi \u2014 Bak\u0131r ve al\xFCminyum iletken",
      "Termal Optimizasyon \u2014 Is\u0131 da\u011F\u0131l\u0131m\u0131 sim\xFClasyonu"
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "Cu (OFE, ETP), Al 1050" },
      { label: "\u0130letkenlik", value: "IACS %99+" },
      { label: "Gerilim", value: "36kV'a kadar" },
      { label: "Kapsam", value: "Bara, kontak, izolator montaj" },
      { label: "Kaplama", value: "Ag (g\xFCm\xFC\u015F), Ni altl\u0131k" },
      { label: "Test", value: "Ark direnci, k\u0131sa devre" }
    ],
    advantages: [
      "36kV'a kadar orta gerilim bile\u015Feni \xFCretimi",
      "IACS %99+ iletkenlikli bak\u0131r i\u015Fleme",
      "G\xFCm\xFC\u015F kaplama ile minimum kontak direnci",
      "36kV orta gerilim seviyesine kadar par\xE7a",
      "Termal sim\xFClasyon ile optimizasyon",
      "K\u0131sa devre ve ark direnci test deste\u011Fi"
    ],
    faq: [
      { question: "OFE bak\u0131r i\u015Fleyebiliyor musunuz?", answer: "Evet, OFE bak\u0131r (C10100, IACS %101) ve ETP bak\u0131r (C11000, IACS %99.9) i\u015Fleme kabiliyetimiz bulunmaktad\u0131r." },
      { question: "G\xFCm\xFC\u015F kaplama yap\u0131yor musunuz?", answer: "Evet, kontak par\xE7alar\u0131 i\xE7in g\xFCm\xFC\u015F kaplama (nikel altl\u0131k \xFCzerine) uyguluyoruz. Kaplama kal\u0131nl\u0131\u011F\u0131 ve yap\u0131\u015Fma testi standart olarak kontrol edilir." }
    ]
  },
  {
    slug: "madencilik-ekipmanlari",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyap\u0131",
    title: "Madencilik Ekipmanlar\u0131",
    metaTitle: "Madencilik Ekipman Par\xE7alar\u0131 | Hardox 600 | 55-65 HRC | 500kg | Mas Technic",
    metaDescription: "Madencilik makineleri i\xE7in Hardox 600, manganez \xE7eli\u011Fi ile a\u015F\u0131nmaya dayan\u0131kl\u0131 par\xE7a \xFCretimi. 55-65 HRC sertlik, 500kg'a kadar a\u011F\u0131rl\u0131k, ind\xFCksiyon sertle\u015Ftirme.",
    description: "Madencilik sekt\xF6r\xFCn\xFCn a\u011F\u0131r \xE7al\u0131\u015Fma ko\u015Fullar\u0131na uygun, Hardox ve manganez \xE7eli\u011Fi ile a\u015F\u0131nmaya dayan\u0131kl\u0131 bile\u015Fenler.",
    content: [
      "Madencilik sekt\xF6r\xFCn\xFCn a\u011F\u0131r \xE7al\u0131\u015Fma ko\u015Fullar\u0131na uygun, a\u015F\u0131nmaya ve darbeye dayan\u0131kl\u0131 par\xE7alar \xFCretiyoruz. K\u0131r\u0131c\u0131 bile\u015Fenleri (\xE7ene, \xE7eki\xE7, astar plakas\u0131), konvey\xF6r par\xE7alar\u0131 (rulo, tambur, kayar yatak), delici ekipman komponentleri (u\xE7, g\xF6vde, adapt\xF6r) ve eleme-s\u0131n\u0131fland\u0131rma bile\u015Fenleri imal ediyoruz.",
      "Hardox 400/500/600 (a\u015F\u0131nma \xE7eli\u011Fi), manganez \xE7eli\u011Fi (Mn13 \u2014 darbe ile sertle\u015Fen), beyaz d\xF6kme demir (krom karb\xFCr \u2014 a\u015F\u0131r\u0131 a\u015F\u0131nma) ve 42CrMo4 (QT \u2014 genel a\u011F\u0131r i\u015F) malzemeleri ile \xFCretim yap\u0131yoruz. 55-65 HRC y\xFCzey sertli\u011Fi, ind\xFCksiyon sertle\u015Ftirme ve karb\xFCrizasyon ile elde edilmektedir.",
      "500 kg'a kadar par\xE7a a\u011F\u0131rl\u0131\u011F\u0131, 1500mm'ye kadar par\xE7a boyutu ve CNC + konvansiyonel tezgah hibrit i\u015Fleme kapasitesi ile b\xFCy\xFCk ve a\u011F\u0131r madencilik par\xE7alar\u0131 \xFCretiyoruz."
    ],
    features: [
      "K\u0131r\u0131c\u0131 Bile\u015Feni \u2014 \xC7ene, \xE7eki\xE7, astar plakas\u0131",
      "Konvey\xF6r Par\xE7as\u0131 \u2014 Rulo, tambur, kayar yatak",
      "Hardox 400/500/600 \u2014 A\u015F\u0131nma \xE7eli\u011Fi uzmanl\u0131\u011F\u0131",
      "55-65 HRC Sertlik \u2014 \u0130nd\xFCksiyon sertle\u015Ftirme",
      "500 kg A\u011F\u0131rl\u0131k \u2014 B\xFCy\xFCk par\xE7a i\u015Fleme kapasitesi",
      "Manganez \xC7eli\u011Fi \u2014 Darbe ile sertle\u015Fen Mn13"
    ],
    technicalSpecs: [
      { label: "Sertlik", value: "55-65 HRC" },
      { label: "Malzeme", value: "Hardox, Mn13, 42CrMo4" },
      { label: "Maks. A\u011F\u0131rl\u0131k", value: "500 kg" },
      { label: "Maks. Boyut", value: "1500mm" },
      { label: "Is\u0131l \u0130\u015Flem", value: "\u0130nd\xFCksiyon, karb\xFCrizasyon" },
      { label: "NDT", value: "UT, MT zorunlu" }
    ],
    advantages: [
      "Hardox 400/500/600 a\u015F\u0131nma \xE7eli\u011Fi uzmanl\u0131\u011F\u0131",
      "55-65 HRC y\xFCzey sertli\u011Fi ile uzun \xF6m\xFCr",
      "500 kg'a kadar a\u011F\u0131r par\xE7a i\u015Fleme kapasitesi",
      "Manganez \xE7eli\u011Fi ile darbe direnci",
      "\u0130nd\xFCksiyon sertle\u015Ftirme ve karb\xFCrizasyon",
      "UT ve MT ile NDT muayene dahil"
    ],
    faq: [
      { question: "Hardox i\u015Fleyebiliyor musunuz?", answer: "Evet, Hardox 400, 500 ve 600 serisi a\u015F\u0131nma \xE7eliklerini CNC ile i\u015Fleyebiliyoruz. \xD6zel tak\u0131m ve ilerleme parametreleri ile optimal sonu\xE7 elde ediyoruz." },
      { question: "500 kg par\xE7a i\u015Fleyebiliyor musunuz?", answer: "Evet, 500 kg'a kadar a\u011F\u0131rl\u0131k ve 1500mm'ye kadar boyutta par\xE7a i\u015Fleme kapasitemiz bulunmaktad\u0131r. Vin\xE7li y\xFCkleme ve \xF6zel ba\u011Flama d\xFCzenleri kullan\u0131yoruz." }
    ]
  }
];

// src/data/chatFaqData.ts
var CAD_EXTENSION_LIST = CAD_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(", ");
var staticEntries = [
  {
    question: "Teklif nas\u0131l alabilirim?",
    answer: "Teklif almak i\xE7in [Teklif Al](/teklif-al) sayfam\u0131z\u0131 ziyaret edebilirsiniz. CAD dosyan\u0131z\u0131 y\xFCkleyerek h\u0131zl\u0131 teklif alabilirsiniz. Alternatif olarak sales@mastechnic.com adresine mail atabilirsiniz.",
    keywords: ["teklif", "fiyat", "maliyet", "\xFCcret", "para", "ne kadar", "ka\xE7 tl", "b\xFCt\xE7e", "hesap"]
  },
  {
    question: "\u0130leti\u015Fim bilgileriniz nelerdir?",
    answer: "\u{1F4DE} Telefon: +90 (536) 564 51 94\n\u{1F4E7} E-posta: sales@mastechnic.com\n\u{1F4CD} Adres: Ata\u015Fehir Mah., 8287. Sok. No: 4, 35620 \xC7i\u011Fli/\u0130zmir\n\nDetayl\u0131 bilgi i\xE7in [\u0130leti\u015Fim](/iletisim) sayfam\u0131z\u0131 ziyaret edin.",
    keywords: ["ileti\u015Fim", "telefon", "adres", "email", "mail", "nerede", "konum", "ula\u015F\u0131m", "numara"]
  },
  {
    question: "Hangi sekt\xF6rlere hizmet veriyorsunuz?",
    answer: "Havac\u0131l\u0131k & uzay, savunma sanayi, otomotiv, medikal, robotik, enerji, denizcilik, hidrolik ve daha bir\xE7ok sekt\xF6re hizmet veriyoruz. Detaylar i\xE7in [End\xFCstriyel \xC7\xF6z\xFCmler](/endustriyel) sayfam\u0131za bakabilirsiniz.",
    keywords: ["sekt\xF6r", "end\xFCstri", "havac\u0131l\u0131k", "otomotiv", "medikal", "savunma", "hangi sekt\xF6r"]
  },
  {
    question: "Prototip \xFCretimi yap\u0131yor musunuz?",
    answer: `Evet! Tek par\xE7adan ba\u015Flayarak prototip \xFCretimi yap\u0131yoruz. ${LEAD_TIME_STATEMENT} Detaylar i\xE7in [Prototip \xDCretim](/endustriyel/prototip-uretim) sayfam\u0131za bak\u0131n.`,
    keywords: ["prototip", "numune", "tek par\xE7a", "deneme", "\xF6rnek", "sample"]
  },
  {
    question: "Hangi CNC hizmetleri sunuyorsunuz?",
    answer: "CNC frezeleme (3-4-5 eksen), CNC tornalama, hassas mikro i\u015Fleme, derin delik & raybalama, lazer kaz\u0131ma, y\xFCzey i\u015Flemleri, montaj ve daha fazlas\u0131. T\xFCm hizmetlerimiz i\xE7in [Hizmetler](/hizmetler) sayfam\u0131z\u0131 inceleyin.",
    keywords: ["cnc", "hizmet", "servis", "ne yap\u0131yorsunuz", "neler sunuyorsunuz", "frezeleme", "tornalama"]
  },
  {
    question: "Teslimat s\xFCreniz ne kadar?",
    answer: `${LEAD_TIME_STATEMENT} Bir i\u015Fin terminini \xE7o\u011Fu zaman tezg\xE2h de\u011Fil malzemenin geli\u015Fi belirler; bu nedenle tedarik durumu \xFCretim planlanmadan \xF6nce, teklif a\u015Famas\u0131nda de\u011Ferlendirilir.`,
    keywords: ["teslimat", "s\xFCre", "zaman", "ne zaman", "ka\xE7 g\xFCn", "h\u0131zl\u0131", "acil", "termin"]
  },
  {
    question: "Hangi malzemelerle \xE7al\u0131\u015F\u0131yorsunuz?",
    answer: "Al\xFCminyum (6061, 7075), paslanmaz \xE7elik (304, 316), karbon \xE7elik, titanyum, pirin\xE7, bak\u0131r, PEEK ve POM/Delrin gibi m\xFChendislik malzemeleriyle \xE7al\u0131\u015F\u0131yoruz. [Malzeme K\xFCt\xFCphanesi](/malzemeler) sayfam\u0131zda detaylar\u0131 bulabilirsiniz.",
    keywords: ["malzeme", "metal", "al\xFCminyum", "\xE7elik", "titanyum", "plastik", "pirin\xE7", "bak\u0131r", "paslanmaz"]
  },
  {
    question: "Minimum sipari\u015F adedi var m\u0131?",
    answer: "Minimum sipari\u015F adedi 1 (tek par\xE7a) olarak belirlenmi\u015Ftir. Prototipten seri \xFCretime kadar esnek \xFCretim planlamas\u0131 yap\u0131yoruz.",
    keywords: ["minimum", "adet", "sipari\u015F", "ka\xE7 adet", "en az", "miktar"]
  },
  {
    question: "Kalite sertifikalar\u0131n\u0131z nelerdir?",
    answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 y\xF6netim sistemi belgelerimiz bulunmaktad\u0131r. Her i\u015F i\xE7in kontrol plan\u0131 olu\u015Fturulur; \xF6l\xE7\xFCm kayd\u0131 teslimat dosyas\u0131na eklenir, akredite \xFC\xE7\xFCnc\xFC taraf CMM \xF6l\xE7\xFCm\xFC talebe ba\u011Fl\u0131 olarak sa\u011Flan\u0131r.",
    keywords: ["kalite", "sertifika", "iso", "standart", "belge", "rapor"]
  },
  {
    question: "Tolerans de\u011Ferleriniz nedir?",
    answer: "Standart \xE7al\u0131\u015Fma aral\u0131\u011F\u0131m\u0131z \xB10.01mm olup ula\u015F\u0131labilir tolerans; geometri, malzeme ve \xF6l\xE7\xFC zincirine g\xF6re teknik incelemede belirlenir. Detaylar i\xE7in [Tolerans & Hassasiyet](/kabiliyetler/tolerans-hassasiyet) sayfam\u0131z\u0131 inceleyin.",
    keywords: ["tolerans", "hassasiyet", "do\u011Fruluk", "precision", "accuracy"]
  },
  // ── Kargo & Teslimat ──
  {
    question: "Kargo ile g\xF6nderim yap\u0131yor musunuz?",
    answer: "Evet, T\xFCrkiye genelinde anla\u015Fmal\u0131 kargo firmalar\u0131yla g\xFCvenli g\xF6nderim yap\u0131yoruz. Yurt d\u0131\u015F\u0131 sevkiyat i\xE7in de DHL, FedEx ve UPS ile \xE7al\u0131\u015F\u0131yoruz. \xD6zel paketleme ve sigortal\u0131 g\xF6nderim se\xE7enekleri mevcuttur.",
    keywords: ["kargo", "g\xF6nderim", "sevkiyat", "g\xF6nderi", "paket", "ula\u015Ft\u0131rma", "dhl", "fedex", "ups", "nakliye"]
  },
  {
    question: "Yurt d\u0131\u015F\u0131na teslimat yap\u0131yor musunuz?",
    answer: "Evet, d\xFCnya genelinde ihracat yap\u0131yoruz. Avrupa, Orta Do\u011Fu, ABD ve Asya'ya d\xFCzenli sevkiyatlar\u0131m\u0131z bulunmaktad\u0131r. \u0130hracat belgeleri ve g\xFCmr\xFCk i\u015Flemlerinde destek sa\u011Fl\u0131yoruz.",
    keywords: ["yurt d\u0131\u015F\u0131", "ihracat", "export", "uluslararas\u0131", "avrupa", "amerika", "g\xFCmr\xFCk"]
  },
  // ── İade ──
  // "Garanti veriyor musunuz?" girdisi kaldırıldı: koşulsuz bir uygunluk
  // garantisi ve ücretsiz yeniden üretim taahhüdü veriyordu; USER_INPUTS.md'de
  // bunu yetkilendiren bir alan yok. Bu kaldırma doğru ve kalıcıdır.
  //
  // Ancak yalnızca yanıtı kaldırmak yetmedi: "garanti veriyor musunuz" sorusu
  // varsayılan yanıta düşmüyor, 0.67 skorla DFM tasarım-desteği yanıtına
  // yanlış yönleniyordu. Sitenin ticari olarak en yüklü sorusuna kendinden
  // emin ve yanlış bir cevap, cevapsızlıktan kötüdür. `garanti`/`güvence`
  // artık burada ANAHTAR KELİME olarak duruyor: anahtar kelime dizisi
  // eşleştirici girdisidir, yayımlanan metin değil — hiçbir bileşen render
  // etmez.
  //
  // 09a-C2: yanıtın kendisi de değişti. "Teknik şartnameye uymayan ürünlerde
  // ÜCRETSİZ İADE/DEĞİŞİM yapılmaktadır. Teslimat sonrası 7 iş günü içinde …"
  // bir garanti taahhüdüydü — Phase 06'da kaldırılan girdinin aynısı, bu kez
  // "garanti" kelimesi kullanılmadan yazılmıştı. USER_INPUTS.md'de iade,
  // değişim veya ayıp bildirimi süresini yetkilendiren bir alan yok; §D
  // kabiliyet değerleri verir, taahhüt değil. Bir ticari POLİTİKA iddiası
  // "teklifle birlikte" diye yumuşatılamaz — okuyucuya bir sayı değil bir
  // politika söyleniyor — bu yüzden iddia kaldırıldı. Yerine, sitenin başka
  // yerlerinde zaten yayımlanan MEKANİZMA geçti: kontrol planı, ölçüm kaydı
  // ve koşulların siparişe göre kararlaştırıldığı gerçeği. Soru duruyor;
  // yalnızca cevap artık verilmemiş bir sözü vermiyor.
  {
    question: "\u0130ade veya de\u011Fi\u015Fim yap\u0131labiliyor mu?",
    answer: "Uygunluk, kontrol plan\u0131nda tan\u0131mlanan koteler ve teslimat dosyas\u0131ndaki \xF6l\xE7\xFCm kayd\u0131 \xFCzerinden de\u011Ferlendirilir. Bir uygunsuzluk tespit ederseniz \xF6l\xE7\xFCm sonu\xE7lar\u0131yla birlikte sales@mastechnic.com adresine bildirin; nas\u0131l ilerlenece\u011Fi sipari\u015Fin ko\u015Fullar\u0131na g\xF6re birlikte kararla\u015Ft\u0131r\u0131l\u0131r.",
    keywords: [
      "iade",
      "de\u011Fi\u015Fim",
      "geri g\xF6nderme",
      "uyumsuz",
      "hatal\u0131",
      "kusurlu",
      "return",
      "warranty",
      "sorumluluk",
      "garanti",
      "g\xFCvence"
    ]
  },
  // ── Ödeme ──
  // 09a-C2: iki yanıt da ödeme ve KREDİ koşulu yayımlıyordu — "açık hesap
  // (anlaşmalı müşteriler), vadeli ödeme", "%50 ÖN ÖDEME … kalan %50
  // teslimatta", "AÇIK HESAP ve 30-60 GÜN VADE imkânı sunuyoruz". Bunlar
  // teslim süresi değil, sözleşme koşuludur ve USER_INPUTS.md'de hiçbir alan
  // bunları yetkilendirmiyor; §J yalnızca teklif SLA'sını verir. Soruların
  // ikisi de gerçek ve duruyor: eşleştirici bir soruyu cevapsız bıraktığında
  // 0.6 eşiğinin altına düşen bir başka yanıta savrulur, ki bu kaldırılan
  // yanıttan da kötüdür.
  {
    question: "\xD6deme y\xF6ntemleriniz nelerdir?",
    answer: "\xD6deme ko\u015Fullar\u0131 sipari\u015Fe g\xF6re teklifte belirlenir; kurumsal fatura ve e-fatura kesiyoruz. Hangi y\xF6ntemle ilerleyebilece\u011Fimizi teklif a\u015Famas\u0131nda netle\u015Ftiriyoruz.",
    keywords: ["\xF6deme", "havale", "eft", "kredi kart\u0131", "fatura", "e-fatura", "vade", "pe\u015Fin", "taksit", "banka"]
  },
  {
    question: "Pe\u015Fin \xF6deme zorunlu mu?",
    answer: "Yay\u0131mlanan sabit bir \xF6deme ko\u015Fulumuz yok. Ko\u015Fullar sipari\u015Fe g\xF6re teklifte belirlenir ve teklif a\u015Famas\u0131nda birlikte netle\u015Ftirilir.",
    keywords: ["pe\u015Fin", "\xF6n \xF6deme", "avans", "vade", "vadeli", "taksit", "\xF6deme ko\u015Fullar\u0131"]
  },
  // ── Dosya Formatları ──
  {
    question: "Hangi CAD dosya formatlar\u0131n\u0131 kabul ediyorsunuz?",
    /* 09a-C3: "En çok tercih edilen format STEP'tir." kaldırıldı. Listenin
       kendisi türetiliyordu ama bu cümle bir format adını ELLE yazıyordu —
       §J'ye göre yayımlanan hiçbir format adı elle yazılmaz. Üstelik bir
       TERCİH SIRASI `CAD_ACCEPTED_EXTENSIONS`ta kodlanmış bir bilgi değil,
       yani türetilebilir de değildi; dizideki sıra tesadüftür. Türetilmiş
       liste okuyucuya ne göndereceğini zaten söylüyor.
       Anahtar kelimeler aynen KALIR: onlar eşleştirici girdisidir, ekrana
       basılmaz, ve `step`/`iges` yazan ziyaretçiyi bu doğru cevaba taşırlar. */
    answer: `Teklif ak\u0131\u015F\u0131nda do\u011Frudan y\xFCkleyebilece\u011Finiz formatlar: ${CAD_EXTENSION_LIST}. Listede olmayan bir format veya \xF6l\xE7\xFClendirilmi\u015F teknik resim i\xE7in dosyay\u0131 sales@mastechnic.com adresine iletebilirsiniz.`,
    keywords: ["dosya", "format", "cad", "step", "iges", "stl", "obj", "3mf", "\xE7izim", "3d", "model"]
  },
  // ── Çalışma Saatleri ──
  // 09a-C2: "Pazartesi – Cuma: 08:00 – 18:00" ile "Acil siparişler için hafta
  // sonu da üretim yapılabilmektedir" kaldırıldı. Phase 07 aynı çalışma saati
  // bloğunu `/iletisim` sayfasından, "hiçbir alan bunları yetkilendirmiyor"
  // gerekçesiyle çıkarmıştı; hafta sonu üretimi ise bir kapasite taahhüdüdür.
  // Bir olguyu bir yüzeyden kaldırıp diğerinde bırakmak, bu fazın düzeltmek
  // için var olduğu hatanın ta kendisi. Yerine yetkili olan tek süre geçti.
  {
    question: "\xC7al\u0131\u015Fma saatleriniz nedir?",
    answer: `Teklif ve teknik sorular\u0131n\u0131z i\xE7in sales@mastechnic.com adresine her zaman yazabilirsiniz; teklif d\xF6n\xFC\u015F s\xFCremiz ${QUOTE_RESPONSE_TIME}d\xFCr. Telefon ve adres bilgisi [\u0130leti\u015Fim](/iletisim) sayfam\u0131zda.`,
    keywords: ["\xE7al\u0131\u015Fma", "saat", "mesai", "a\xE7\u0131k", "kapal\u0131", "hafta sonu", "cumartesi", "pazar", "zaman"]
  },
  // ── Yüzey İşlemleri ──
  {
    question: "Hangi y\xFCzey i\u015Flemlerini yap\u0131yorsunuz?",
    answer: "Anodizasyon, kumlama, boyama, krom kaplama, nikel kaplama, siyah oksit, pasivasyon, eloksal ve daha fazlas\u0131. [Y\xFCzey \u0130\u015Flemleri](/hizmetler/yuzey-islemleri) sayfam\u0131zda detaylar\u0131 bulabilirsiniz.",
    keywords: ["y\xFCzey", "anodizasyon", "kaplama", "boyama", "krom", "nikel", "kumlama", "eloksal", "pasivasyon", "finishing"]
  },
  // ── Seri Üretim ──
  {
    question: "Seri \xFCretim yap\u0131yor musunuz?",
    answer: "Evet, tek par\xE7adan seri \xFCretime kadar \xE7al\u0131\u015F\u0131yoruz. Seri \xFCretimde birim maliyet avantaj\u0131 ve tutarl\u0131 kalite sa\u011Fl\u0131yoruz. [Seri \xDCretim](/kabiliyetler/seri-uretim) sayfam\u0131z\u0131 inceleyin.",
    keywords: ["seri", "seri \xFCretim", "toplu", "adet", "b\xFCy\xFCk sipari\u015F", "volume", "mass production"]
  },
  // ── Teknik Destek ──
  {
    question: "Tasar\u0131m deste\u011Fi veriyor musunuz?",
    answer: "Evet! DFM (Design for Manufacturing) analizi ile tasar\u0131m\u0131n\u0131z\u0131 \xFCretime uygun hale getirmenize yard\u0131mc\u0131 oluyoruz. Maliyet ve s\xFCre optimizasyonu i\xE7in \xF6neriler sunuyoruz.",
    keywords: ["tasar\u0131m", "dfm", "design", "destek", "m\xFChendislik", "optimizasyon", "dan\u0131\u015Fmanl\u0131k"]
  },
  {
    question: "Teknik \xE7izim yap\u0131yor musunuz?",
    answer: "Evet, 3D modelleme ve 2D teknik \xE7izim hizmeti sunuyoruz. M\xFC\u015Fterilerimizin taslak \xE7izimlerinden \xFCretime haz\u0131r CAD dosyalar\u0131 olu\u015Fturabiliyoruz.",
    keywords: ["\xE7izim", "teknik \xE7izim", "modelleme", "3d model", "2d", "cad tasar\u0131m"]
  },
  // ── Müşteri Paneli ──
  {
    question: "M\xFC\u015Fteri paneli nedir?",
    answer: "M\xFC\u015Fteri panelimizden sipari\u015Flerinizi takip edebilir, tekliflerinizi g\xF6r\xFCnt\xFCleyebilir, kalite raporlar\u0131na eri\u015Febilir ve destek talebi olu\u015Fturabilirsiniz. [Giri\u015F Yap](/giris) sayfas\u0131ndan hesab\u0131n\u0131za eri\u015Fin.",
    keywords: ["m\xFC\u015Fteri paneli", "panel", "portal", "hesap", "giri\u015F", "login", "sipari\u015F takip", "dashboard"]
  },
  // ── Genel Bilgiler ──
  // 09a-C2: "İstanbul merkezli" yanlıştı. §A `PUBLIC_CITY: İzmir`, footer,
  // JSON-LD, `/iletisim` ve bu dosyanın kendi adres yanıtı (Çiğli/İzmir)
  // hepsi İzmir diyor. Değer artık ledger'dan geliyor.
  {
    question: "MAS Technic nedir?",
    answer: `MAS Technic, ${PUBLIC_CITY} merkezli hassas CNC imalat firmas\u0131d\u0131r. Prototipten seri \xFCretime, havac\u0131l\u0131k-savunma-otomotiv-medikal ba\u015Fta olmak \xFCzere bir\xE7ok sekt\xF6re hizmet vermekteyiz. [Hakk\u0131m\u0131zda](/hakkimizda) sayfam\u0131zda detaylar\u0131 bulabilirsiniz.`,
    keywords: ["mas technic", "kimsiniz", "firma", "\u015Firket", "hakk\u0131nda", "nedir", "tan\u0131t\u0131m"]
  },
  {
    question: "Makine parkurunuz nedir?",
    answer: "3-4-5 eksen CNC freze, CNC torna, EDM, ta\u015Flama, CMM \xF6l\xE7\xFCm cihazlar\u0131 ve lazer markalama makineleri dahil geni\u015F bir makine parkurumuz bulunmaktad\u0131r. [Makine Parkuru](/kabiliyetler/makine-parkuru) sayfam\u0131z\u0131 inceleyin.",
    keywords: ["makine", "parkur", "tezgah", "ekipman", "kapasite", "eksen", "freze", "torna"]
  }
];
function collectServiceFaqs() {
  const entries = [];
  for (const page of servicePages) {
    if (!page.faq) continue;
    for (const f of page.faq) {
      const combined = `${f.question} ${f.answer}`.toLowerCase();
      const words = combined.replace(/[^\wğüşöçıİĞÜŞÖÇ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
      const uniqueWords = [...new Set(words)];
      entries.push({
        question: f.question,
        answer: f.answer,
        keywords: uniqueWords
      });
    }
  }
  return entries;
}
var allFaqEntries = [
  ...staticEntries,
  ...collectServiceFaqs()
];
var QUESTION_FORM_WORDS = /* @__PURE__ */ new Set([
  // soru eki
  "musunuz",
  "misiniz",
  "m\u0131s\u0131n\u0131z",
  "m\xFCs\xFCn\xFCz",
  "mudur",
  "m\u0131d\u0131r",
  "midir",
  "m\xFCd\xFCr",
  // "…yapıyor musunuz / veriyor musunuz / var mı" kalıbı
  "veriyor",
  "veriyorsunuz",
  "yap\u0131yor",
  "yap\u0131yorsunuz",
  "var",
  "yok"
]);
function normalize(text) {
  const words = text.toLowerCase().replace(/[^\wğüşöçıİĞÜŞÖÇ]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const topical = words.filter((w) => !QUESTION_FORM_WORDS.has(w));
  return topical.length > 0 ? topical : words;
}
function findBestFaqMatch(userInput) {
  const inputWords = normalize(userInput);
  if (inputWords.length === 0) return null;
  let bestMatch = null;
  for (const entry of allFaqEntries) {
    const questionWords = normalize(entry.question);
    const allTargetWords = [...entry.keywords, ...questionWords];
    let matchCount = 0;
    for (const iw of inputWords) {
      if (allTargetWords.some((tw) => tw.includes(iw) || iw.includes(tw))) {
        matchCount++;
      }
    }
    const score = matchCount / inputWords.length;
    if (score > (bestMatch?.score ?? 0)) {
      bestMatch = { entry, score };
    }
  }
  return bestMatch && bestMatch.score >= 0.6 ? bestMatch : null;
}
export {
  CAD_ACCEPTED_EXTENSIONS,
  CAD_UPLOAD_EXTENSIONS,
  CAD_UPLOAD_FORMATS,
  allFaqEntries,
  findBestFaqMatch,
  servicePages,
  validateCadFile
};
