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

type Text = { tr: string; en: string; de: string };

export interface JournalModule {
  subject: Text;
  table: { caption: Text; note?: Text; headers: Text[]; rows: Text[][] };
  sources: { ref: string; what: Text }[];
  relatedPosts: string[];
  relatedServices: string[];
}

const tx = (tr: string, en: string, de: string): Text => ({ tr, en, de });

export const JOURNAL_MODULES: Record<string, JournalModule> = {
  "5-eksen-cnc-isleme-avantajlari": {
    subject: tx("Aynı parça: üç kurulum ve tek kurulum", "One part: three setups and one setup", "Ein Teil: drei Aufspannungen und eine Aufspannung"),
    table: {
      caption: tx("Beş eksen ne zaman gerekir", "When five axes are needed", "Wann fünf Achsen nötig sind"),
      headers: [tx("Soru", "Question", "Frage"), tx("Cevap evetse", "If yes", "Falls ja"), tx("Cevap hayırsa", "If no", "Falls nein")],
      rows: [
        [tx("Kritik geometrik tolerans farklı yüzeyler arasında mı?", "Is a critical geometric tolerance defined between different faces?", "Ist eine kritische geometrische Toleranz zwischen verschiedenen Flächen definiert?"), tx("Tek kurulum: beş eksen", "One setup: five axes", "Eine Aufspannung: fünf Achsen"), tx("Üç eksen genellikle yeterli", "Three axes are usually enough", "Drei Achsen genügen meist")],
        [tx("Serbest biçimli yüzey var mı?", "Is there a free-form surface?", "Gibt es eine Freiformfläche?"), tx("Sürekli beş eksen", "Continuous five-axis", "Simultan fünfachsig"), tx("3+2 konumlama yeterli olabilir", "3+2 positioning may be enough", "3+2-Positionierung kann genügen")],
        [tx("Derin bölgeye kısa takımla erişmek gerekiyor mu?", "Does a deep area need a short tool?", "Ist ein tiefer Bereich mit kurzem Werkzeug zu erreichen?"), tx("Parçayı eğerek kısa takım", "Tilt the part, use a short tool", "Teil schwenken, kurzes Werkzeug"), tx("Standart takım boyu", "Standard tool length", "Standard-Werkzeuglänge")],
      ],
    },
    sources: [
      { ref: "ISO 841", what: tx("Sayısal kontrollü tezgâhlarda eksen ve hareket adlandırması", "Axis and motion nomenclature for numerically controlled machines", "Achsen- und Bewegungsbezeichnungen für numerisch gesteuerte Maschinen") },
      { ref: "ISO 1101", what: tx("Geometrik ürün spesifikasyonu: biçim, yön, konum ve salgı toleransları", "Geometrical product specification: form, orientation, location and run-out tolerances", "Geometrische Produktspezifikation: Form-, Richtungs-, Orts- und Lauftoleranzen") },
    ],
    relatedPosts: ["cnc-torna-frezeleme-farki", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["cnc-frezeleme", "fikstur-aparat-tasarimi"],
  },
  "havacilik-parcalarinda-malzeme-secimi": {
    subject: tx("Malzeme seçiminin karar yolu", "The decision path for material selection", "Der Entscheidungsweg bei der Werkstoffauswahl"),
    table: {
      caption: tx("Ölçüt ve aday", "Criterion and candidate", "Kriterium und Kandidat"),
      note: tx("Nitel karşılaştırma. Sayısal değerler yazının tablosundadır ve tipik değerlerdir; bir işte parti sertifikası esastır.", "A qualitative comparison. Numerical values are in the article's table and are typical; for a job the batch certificate governs.", "Ein qualitativer Vergleich. Zahlenwerte stehen in der Tabelle des Beitrags und sind typische Werte; für einen Auftrag ist das Chargenzeugnis maßgebend."),
      headers: [tx("Ölçüt", "Criterion", "Kriterium"), tx("Al 7075-T6", "Al 7075-T6", "Al 7075-T6"), tx("Ti-6Al-4V", "Ti-6Al-4V", "Ti-6Al-4V")],
      rows: [
        [tx("Yüksek çalışma sıcaklığı", "High operating temperature", "Hohe Betriebstemperatur"), tx("Sınırlı", "Limited", "Begrenzt"), tx("Uygun", "Suitable", "Geeignet")],
        [tx("Kaplamasız korozyon direnci", "Corrosion resistance without coating", "Korrosionsbeständigkeit ohne Beschichtung"), tx("Yüzey işlemi gerekir", "Needs surface treatment", "Oberflächenbehandlung nötig"), tx("Doğal oksit tabakası", "Natural oxide layer", "Natürliche Oxidschicht")],
        [tx("İşleme süresi", "Machining time", "Bearbeitungszeit"), tx("Kısa", "Short", "Kurz"), tx("Uzun", "Long", "Lang")],
        [tx("Hammadde maliyeti", "Raw material cost", "Rohmaterialkosten"), tx("Düşük", "Lower", "Niedriger"), tx("Yüksek, dalgalı", "Higher, fluctuating", "Höher, schwankend")],
      ],
    },
    sources: [
      { ref: "AMS 4045", what: tx("7075 alüminyum levha ve plaka, T6 temper", "7075 aluminium sheet and plate, T6 temper", "7075-Aluminiumblech und -platte, Zustand T6") },
      { ref: "AMS 4911", what: tx("Ti-6Al-4V levha, şerit ve plaka", "Ti-6Al-4V sheet, strip and plate", "Ti-6Al-4V-Blech, -Band und -Platte") },
      { ref: "EN 10204", what: tx("Metalik ürünler için muayene belgesi türleri", "Types of inspection documents for metallic products", "Arten von Prüfbescheinigungen für metallische Erzeugnisse") },
    ],
    relatedPosts: ["endustriyel-yuzey-islemleri-rehberi", "5-eksen-cnc-isleme-avantajlari"],
    relatedServices: ["malzeme-kutuphanesi", "havacilik-uzay"],
  },
  "dfm-tasarimdan-uretime-gecis": {
    subject: tx("İç köşe yarıçapı ve takım", "Internal corner radius and tool", "Innerer Eckenradius und Werkzeug"),
    table: {
      caption: tx("Bir kote için üç soru", "Three questions for a dimension", "Drei Fragen zu einem Maß"),
      headers: [tx("Soru", "Question", "Frage"), tx("Cevap", "Answer", "Antwort"), tx("Teknik resimde", "On the drawing", "In der Zeichnung")],
      rows: [
        [tx("Bu kotenin montajda işlevi var mı?", "Does this dimension have a function in the assembly?", "Hat dieses Maß eine Funktion in der Baugruppe?"), tx("Hayır", "No", "Nein"), tx("Genel tolerans sınıfı", "General tolerance class", "Allgemeintoleranzklasse")],
        [tx("Hangi yüzeye göre çalışıyor?", "Which surface does it work against?", "Auf welche Fläche bezieht es sich?"), tx("Belli", "Known", "Bekannt"), tx("Datuma bağlı geometrik tolerans", "Geometric tolerance to a datum", "Geometrische Toleranz mit Bezug")],
        [tx("Dar tolerans neyi korur?", "What does the tight tolerance protect?", "Was sichert die enge Toleranz?"), tx("Geçme veya sızdırmazlık", "A fit or a seal", "Eine Passung oder Abdichtung"), tx("Kritik kote olarak işaretle", "Mark as a critical dimension", "Als kritisches Maß kennzeichnen")],
      ],
    },
    sources: [
      { ref: "ISO 2768-1", what: tx("Ayrı tolerans verilmemiş ölçüler için genel toleranslar", "General tolerances for dimensions without individual tolerances", "Allgemeintoleranzen für Maße ohne einzelne Toleranzeintragung") },
      { ref: "ISO 8015", what: tx("Geometrik ürün spesifikasyonunun temel kavramları", "Fundamental concepts of geometrical product specification", "Grundlagen der geometrischen Produktspezifikation") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing", "Geometrische Tolerierung") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["tasarim-rehberi-dfm", "tolerans-hassasiyet"],
  },
  "cnc-torna-frezeleme-farki": {
    subject: tx("Aynı geometride tornalama ve frezeleme", "Turning and milling on the same geometry", "Drehen und Fräsen an derselben Geometrie"),
    table: {
      caption: tx("Özellik ve doğal yöntem", "Feature and natural method", "Merkmal und naheliegendes Verfahren"),
      headers: [tx("Özellik", "Feature", "Merkmal"), tx("Doğal yöntem", "Natural method", "Naheliegendes Verfahren"), tx("Neden", "Why", "Warum")],
      rows: [
        [tx("Eş eksenli çaplar", "Concentric diameters", "Koaxiale Durchmesser"), tx("Tornalama", "Turning", "Drehen"), tx("Aynı bağlamada birbirine referanslı", "Referenced to each other in one clamping", "In einer Aufspannung aufeinander bezogen")],
        [tx("Düzlem ve cep", "Flat and pocket", "Ebene und Tasche"), tx("Frezeleme", "Milling", "Fräsen"), tx("Döner takım, sabit parça", "Rotating tool, stationary part", "Rotierendes Werkzeug, stehendes Teil")],
        [tx("Eksene dik delik grubu", "Hole pattern across the axis", "Bohrbild quer zur Achse"), tx("Frezeleme veya tahrikli takım", "Milling or driven tools", "Fräsen oder angetriebene Werkzeuge"), tx("İkinci operasyon ilkinin yüzeyine bağlanır", "The second operation references the first's surface", "Die zweite Operation bezieht sich auf die Fläche der ersten")],
      ],
    },
    sources: [
      { ref: "ISO 1101", what: tx("Eş eksenlilik ve salgı toleransları", "Concentricity and run-out tolerances", "Koaxialitäts- und Lauftoleranzen") },
      { ref: "ISO 2768-2", what: tx("Geometrik özellikler için genel toleranslar", "General tolerances for geometrical features", "Allgemeintoleranzen für geometrische Merkmale") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["cnc-tornalama", "cnc-frezeleme"],
  },
  "kalite-kontrol-cmm-olcum": {
    subject: tx("Datum kurgusu ve problama noktaları", "Datum set-up and probing points", "Bezugssystem und Antastpunkte"),
    table: {
      caption: tx("Örnek kontrol planı (demo)", "Example control plan (demo)", "Beispielhafter Prüfplan (Demo)"),
      note: tx("Bu tablo bir şablondur; gerçek bir ölçüm raporu veya müşteri işi değildir. Sizin işinizin planı teknik resminize göre kurulur.", "This table is a template; it is not a real measurement report or a customer job. The plan for your job is built from your drawing.", "Diese Tabelle ist eine Vorlage; sie ist kein echtes Messprotokoll und kein Kundenauftrag. Der Plan für Ihren Auftrag wird anhand Ihrer Zeichnung erstellt."),
      headers: [tx("Özellik", "Feature", "Merkmal"), tx("Yöntem", "Method", "Methode"), tx("Kayıt", "Record", "Nachweis")],
      rows: [
        [tx("Datum A düzlemi", "Datum A plane", "Bezugsebene A"), tx("CMM, düzlemsellik", "CMM, flatness", "KMG, Ebenheit"), tx("Ölçüm kaydı", "Measurement record", "Messprotokoll")],
        [tx("Delik konumu (A-B)", "Hole position (A-B)", "Bohrungsposition (A-B)"), tx("CMM, konum", "CMM, position", "KMG, Position"), tx("Ölçüm kaydı", "Measurement record", "Messprotokoll")],
        [tx("Delik çapı", "Hole diameter", "Bohrungsdurchmesser"), tx("Ara kontrol", "In-process check", "Zwischenprüfung"), tx("Operasyon kaydı", "Operation record", "Arbeitsgangprotokoll")],
      ],
    },
    sources: [
      { ref: "ISO 10360-2", what: tx("Koordinat ölçüm makinelerinin kabul ve yeniden doğrulama testleri", "Acceptance and reverification tests for coordinate measuring machines", "Annahme- und Bestätigungsprüfungen für Koordinatenmessgeräte") },
      { ref: "ISO 5459", what: tx("Datumlar ve datum sistemleri", "Datums and datum systems", "Bezüge und Bezugssysteme") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing", "Geometrische Tolerierung") },
    ],
    relatedPosts: ["dfm-tasarimdan-uretime-gecis", "cnc-torna-frezeleme-farki"],
    relatedServices: ["kalite-kontrol", "tolerans-hassasiyet"],
  },
  "endustriyel-yuzey-islemleri-rehberi": {
    subject: tx("İşlemin yüzey ölçüsüne etkisi", "The effect of the treatment on surface size", "Einfluss der Behandlung auf das Oberflächenmaß"),
    table: {
      caption: tx("Şartnamede ne yazmalı", "What the specification should state", "Was in der Spezifikation stehen sollte"),
      headers: [tx("İşlem", "Treatment", "Behandlung"), tx("Ölçüye etkisi", "Effect on size", "Maßeinfluss"), tx("Şartnamede", "In the specification", "In der Spezifikation")],
      rows: [
        [tx("Anodizasyon", "Anodising", "Eloxieren"), tx("Artar; bir kısmı içe nüfuz eder", "Increases; part penetrates inward", "Nimmt zu; ein Teil wächst nach innen"), tx("MIL-A-8625 tip ve sınıf, kalınlık", "MIL-A-8625 type and class, thickness", "MIL-A-8625 Typ und Klasse, Schichtdicke")],
        [tx("Pasivasyon", "Passivation", "Passivieren"), tx("Ölçülebilir değişim yok", "No measurable change", "Keine messbare Änderung"), tx("ASTM A967 yöntemi", "ASTM A967 method", "Verfahren nach ASTM A967")],
        [tx("Toz boya", "Powder coating", "Pulverbeschichtung"), tx("Kalınlığı kadar artar", "Increases by its thickness", "Nimmt um die Schichtdicke zu"), tx("Ön işlem, kalınlık, maskeleme", "Pretreatment, thickness, masking", "Vorbehandlung, Schichtdicke, Abdeckung")],
        [tx("Elektropolisaj", "Electropolishing", "Elektropolieren"), tx("Azalır", "Decreases", "Nimmt ab"), tx("Hedef Ra ve kaldırılacak pay", "Target Ra and removal allowance", "Ziel-Ra und Abtragszugabe")],
      ],
    },
    sources: [
      { ref: "MIL-A-8625", what: tx("Alüminyum ve alaşımları için anodik kaplamalar", "Anodic coatings for aluminium and aluminium alloys", "Anodische Beschichtungen für Aluminium und Aluminiumlegierungen") },
      { ref: "ASTM A967", what: tx("Paslanmaz çelik parçalar için kimyasal pasivasyon işlemleri", "Chemical passivation treatments for stainless steel parts", "Chemische Passivierung von Edelstahlteilen") },
      { ref: "ISO 21920-2", what: tx("Yüzey dokusu: profil parametreleri (Ra)", "Surface texture: profile parameters (Ra)", "Oberflächenbeschaffenheit: Profilparameter (Ra)") },
    ],
    relatedPosts: ["havacilik-parcalarinda-malzeme-secimi", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["anodizasyon", "yuzey-islemleri-muhendislik"],
  },
};

/* UX05 — one engineering problem per capability profile. */
export const PROFILE_SUBJECTS: Record<string, Text> = {
  "ince-cidarli-govde": tx("İnce cidar: bağlama ve serbest bırakma", "Thin wall: clamping and release", "Dünne Wand: Spannen und Entspannen"),
  "titanyum-baglanti-parcasi": tx("Titanyum: proses ve ara kontrol", "Titanium: process and in-process check", "Titan: Prozess und Zwischenprüfung"),
  "hassas-mil": tx("Mil: datum ve salgı kurulumu", "Shaft: datum and run-out set-up", "Welle: Bezugssystem und Rundlauf"),
};
