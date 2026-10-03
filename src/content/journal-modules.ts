/* ══════════════════════════════════════════════════════════════════════════
   JOURNAL MODULES (UX05)

   Each article carries one topic-specific explanatory module: a drawing, a
   decision table, a source list and curated related records. Dates are not
   touched; no author or technical reviewer is named (no person data/permission).
   Sources are the standards the article itself relies on, cited by number —
   a citation is engineering vocabulary, not a conformity claim. The CMM
   module's control plan is a DEMO and says so. Material values follow T03:
   typical values, the batch certificate governs.
   ══════════════════════════════════════════════════════════════════════════ */

type Text = { tr: string; en: string };

export interface JournalModule {
  subject: Text;
  table: { caption: Text; note?: Text; headers: Text[]; rows: Text[][] };
  sources: { ref: string; what: Text }[];
  relatedPosts: string[];
  relatedServices: string[];
}

const tx = (tr: string, en: string): Text => ({ tr, en });

export const JOURNAL_MODULES: Record<string, JournalModule> = {
  "5-eksen-cnc-isleme-avantajlari": {
    subject: tx("Aynı parça: üç kurulum ve tek kurulum", "One part: three setups and one setup"),
    table: {
      caption: tx("Beş eksen ne zaman gerekir", "When five axes are needed"),
      headers: [tx("Soru", "Question"), tx("Cevap evetse", "If yes"), tx("Cevap hayırsa", "If no")],
      rows: [
        [tx("Kritik geometrik tolerans farklı yüzeyler arasında mı?", "Is a critical geometric tolerance defined between different faces?"), tx("Tek kurulum: beş eksen", "One setup: five axes"), tx("Üç eksen genellikle yeterli", "Three axes are usually enough")],
        [tx("Serbest biçimli yüzey var mı?", "Is there a free-form surface?"), tx("Sürekli beş eksen", "Continuous five-axis"), tx("3+2 konumlama yeterli olabilir", "3+2 positioning may be enough")],
        [tx("Derin bölgeye kısa takımla erişmek gerekiyor mu?", "Does a deep area need a short tool?"), tx("Parçayı eğerek kısa takım", "Tilt the part, use a short tool"), tx("Standart takım boyu", "Standard tool length")],
      ],
    },
    sources: [
      { ref: "ISO 841", what: tx("Sayısal kontrollü tezgâhlarda eksen ve hareket adlandırması", "Axis and motion nomenclature for numerically controlled machines") },
      { ref: "ISO 1101", what: tx("Geometrik ürün spesifikasyonu: biçim, yön, konum ve salgı toleransları", "Geometrical product specification: form, orientation, location and run-out tolerances") },
    ],
    relatedPosts: ["cnc-torna-frezeleme-farki", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["cnc-frezeleme", "fikstur-aparat-tasarimi"],
  },
  "havacilik-parcalarinda-malzeme-secimi": {
    subject: tx("Malzeme seçiminin karar yolu", "The decision path for material selection"),
    table: {
      caption: tx("Ölçüt ve aday", "Criterion and candidate"),
      note: tx("Nitel karşılaştırma. Sayısal değerler yazının tablosundadır ve tipik değerlerdir; bir işte parti sertifikası esastır.", "A qualitative comparison. Numerical values are in the article's table and are typical; for a job the batch certificate governs."),
      headers: [tx("Ölçüt", "Criterion"), tx("Al 7075-T6", "Al 7075-T6"), tx("Ti-6Al-4V", "Ti-6Al-4V")],
      rows: [
        [tx("Yüksek çalışma sıcaklığı", "High operating temperature"), tx("Sınırlı", "Limited"), tx("Uygun", "Suitable")],
        [tx("Kaplamasız korozyon direnci", "Corrosion resistance without coating"), tx("Yüzey işlemi gerekir", "Needs surface treatment"), tx("Doğal oksit tabakası", "Natural oxide layer")],
        [tx("İşleme süresi", "Machining time"), tx("Kısa", "Short"), tx("Uzun", "Long")],
        [tx("Hammadde maliyeti", "Raw material cost"), tx("Düşük", "Lower"), tx("Yüksek, dalgalı", "Higher, fluctuating")],
      ],
    },
    sources: [
      { ref: "AMS 4045", what: tx("7075 alüminyum levha ve plaka, T6 temper", "7075 aluminium sheet and plate, T6 temper") },
      { ref: "AMS 4911", what: tx("Ti-6Al-4V levha, şerit ve plaka", "Ti-6Al-4V sheet, strip and plate") },
      { ref: "EN 10204", what: tx("Metalik ürünler için muayene belgesi türleri", "Types of inspection documents for metallic products") },
    ],
    relatedPosts: ["endustriyel-yuzey-islemleri-rehberi", "5-eksen-cnc-isleme-avantajlari"],
    relatedServices: ["malzeme-kutuphanesi", "havacilik-uzay"],
  },
  "dfm-tasarimdan-uretime-gecis": {
    subject: tx("İç köşe yarıçapı ve takım", "Internal corner radius and tool"),
    table: {
      caption: tx("Bir kote için üç soru", "Three questions for a dimension"),
      headers: [tx("Soru", "Question"), tx("Cevap", "Answer"), tx("Teknik resimde", "On the drawing")],
      rows: [
        [tx("Bu kotenin montajda işlevi var mı?", "Does this dimension have a function in the assembly?"), tx("Hayır", "No"), tx("Genel tolerans sınıfı", "General tolerance class")],
        [tx("Hangi yüzeye göre çalışıyor?", "Which surface does it work against?"), tx("Belli", "Known"), tx("Datuma bağlı geometrik tolerans", "Geometric tolerance to a datum")],
        [tx("Dar tolerans neyi korur?", "What does the tight tolerance protect?"), tx("Geçme veya sızdırmazlık", "A fit or a seal"), tx("Kritik kote olarak işaretle", "Mark as a critical dimension")],
      ],
    },
    sources: [
      { ref: "ISO 2768-1", what: tx("Ayrı tolerans verilmemiş ölçüler için genel toleranslar", "General tolerances for dimensions without individual tolerances") },
      { ref: "ISO 8015", what: tx("Geometrik ürün spesifikasyonunun temel kavramları", "Fundamental concepts of geometrical product specification") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["tasarim-rehberi-dfm", "tolerans-hassasiyet"],
  },
  "cnc-torna-frezeleme-farki": {
    subject: tx("Aynı geometride tornalama ve frezeleme", "Turning and milling on the same geometry"),
    table: {
      caption: tx("Özellik ve doğal yöntem", "Feature and natural method"),
      headers: [tx("Özellik", "Feature"), tx("Doğal yöntem", "Natural method"), tx("Neden", "Why")],
      rows: [
        [tx("Eş eksenli çaplar", "Concentric diameters"), tx("Tornalama", "Turning"), tx("Aynı bağlamada birbirine referanslı", "Referenced to each other in one clamping")],
        [tx("Düzlem ve cep", "Flat and pocket"), tx("Frezeleme", "Milling"), tx("Döner takım, sabit parça", "Rotating tool, stationary part")],
        [tx("Eksene dik delik grubu", "Hole pattern across the axis"), tx("Frezeleme veya tahrikli takım", "Milling or driven tools"), tx("İkinci operasyon ilkinin yüzeyine bağlanır", "The second operation references the first's surface")],
      ],
    },
    sources: [
      { ref: "ISO 1101", what: tx("Eş eksenlilik ve salgı toleransları", "Concentricity and run-out tolerances") },
      { ref: "ISO 2768-2", what: tx("Geometrik özellikler için genel toleranslar", "General tolerances for geometrical features") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["cnc-tornalama", "cnc-frezeleme"],
  },
  "kalite-kontrol-cmm-olcum": {
    subject: tx("Datum kurgusu ve problama noktaları", "Datum set-up and probing points"),
    table: {
      caption: tx("Örnek kontrol planı (demo)", "Example control plan (demo)"),
      note: tx("Bu tablo bir şablondur; gerçek bir ölçüm raporu veya müşteri işi değildir. Sizin işinizin planı teknik resminize göre kurulur.", "This table is a template; it is not a real measurement report or a customer job. The plan for your job is built from your drawing."),
      headers: [tx("Özellik", "Feature"), tx("Yöntem", "Method"), tx("Kayıt", "Record")],
      rows: [
        [tx("Datum A düzlemi", "Datum A plane"), tx("CMM, düzlemsellik", "CMM, flatness"), tx("Ölçüm kaydı", "Measurement record")],
        [tx("Delik konumu (A-B)", "Hole position (A-B)"), tx("CMM, konum", "CMM, position"), tx("Ölçüm kaydı", "Measurement record")],
        [tx("Delik çapı", "Hole diameter"), tx("Ara kontrol", "In-process check"), tx("Operasyon kaydı", "Operation record")],
      ],
    },
    sources: [
      { ref: "ISO 10360-2", what: tx("Koordinat ölçüm makinelerinin kabul ve yeniden doğrulama testleri", "Acceptance and reverification tests for coordinate measuring machines") },
      { ref: "ISO 5459", what: tx("Datumlar ve datum sistemleri", "Datums and datum systems") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing") },
    ],
    relatedPosts: ["dfm-tasarimdan-uretime-gecis", "cnc-torna-frezeleme-farki"],
    relatedServices: ["kalite-kontrol", "tolerans-hassasiyet"],
  },
  "endustriyel-yuzey-islemleri-rehberi": {
    subject: tx("İşlemin yüzey ölçüsüne etkisi", "The effect of the treatment on surface size"),
    table: {
      caption: tx("Şartnamede ne yazmalı", "What the specification should state"),
      headers: [tx("İşlem", "Treatment"), tx("Ölçüye etkisi", "Effect on size"), tx("Şartnamede", "In the specification")],
      rows: [
        [tx("Anodizasyon", "Anodising"), tx("Artar; bir kısmı içe nüfuz eder", "Increases; part penetrates inward"), tx("MIL-A-8625 tip ve sınıf, kalınlık", "MIL-A-8625 type and class, thickness")],
        [tx("Pasivasyon", "Passivation"), tx("Ölçülebilir değişim yok", "No measurable change"), tx("ASTM A967 yöntemi", "ASTM A967 method")],
        [tx("Toz boya", "Powder coating"), tx("Kalınlığı kadar artar", "Increases by its thickness"), tx("Ön işlem, kalınlık, maskeleme", "Pretreatment, thickness, masking")],
        [tx("Elektropolisaj", "Electropolishing"), tx("Azalır", "Decreases"), tx("Hedef Ra ve kaldırılacak pay", "Target Ra and removal allowance")],
      ],
    },
    sources: [
      { ref: "MIL-A-8625", what: tx("Alüminyum ve alaşımları için anodik kaplamalar", "Anodic coatings for aluminium and aluminium alloys") },
      { ref: "ASTM A967", what: tx("Paslanmaz çelik parçalar için kimyasal pasivasyon işlemleri", "Chemical passivation treatments for stainless steel parts") },
      { ref: "ISO 21920-2", what: tx("Yüzey dokusu: profil parametreleri (Ra)", "Surface texture: profile parameters (Ra)") },
    ],
    relatedPosts: ["havacilik-parcalarinda-malzeme-secimi", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["anodizasyon", "yuzey-islemleri-muhendislik"],
  },
};

/* UX05 — one engineering problem per capability profile. */
export const PROFILE_SUBJECTS: Record<string, Text> = {
  "ince-cidarli-govde": tx("İnce cidar: bağlama ve serbest bırakma", "Thin wall: clamping and release"),
  "titanyum-baglanti-parcasi": tx("Titanyum: proses ve ara kontrol", "Titanium: process and in-process check"),
  "hassas-mil": tx("Mil: datum ve salgı kurulumu", "Shaft: datum and run-out set-up"),
};
