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

type Text = { tr: string; en: string; de: string; ru: string };

export interface JournalModule {
  subject: Text;
  table: { caption: Text; note?: Text; headers: Text[]; rows: Text[][] };
  sources: { ref: string; what: Text }[];
  relatedPosts: string[];
  relatedServices: string[];
}

const tx = (tr: string, en: string, de: string, ru: string): Text => ({ tr, en, de, ru });

export const JOURNAL_MODULES: Record<string, JournalModule> = {
  "5-eksen-cnc-isleme-avantajlari": {
    subject: tx("Aynı parça: üç kurulum ve tek kurulum", "One part: three setups and one setup", "Ein Teil: drei Aufspannungen und eine Aufspannung", "Одна деталь: три установа и один установ"),
    table: {
      caption: tx("Beş eksen ne zaman gerekir", "When five axes are needed", "Wann fünf Achsen nötig sind", "Когда нужны пять осей"),
      headers: [tx("Soru", "Question", "Frage", "Вопрос"), tx("Cevap evetse", "If yes", "Falls ja", "Если да"), tx("Cevap hayırsa", "If no", "Falls nein", "Если нет")],
      rows: [
        [tx("Kritik geometrik tolerans farklı yüzeyler arasında mı?", "Is a critical geometric tolerance defined between different faces?", "Ist eine kritische geometrische Toleranz zwischen verschiedenen Flächen definiert?", "Задан ли критичный геометрический допуск между разными поверхностями?"), tx("Tek kurulum: beş eksen", "One setup: five axes", "Eine Aufspannung: fünf Achsen", "Один установ: пять осей"), tx("Üç eksen genellikle yeterli", "Three axes are usually enough", "Drei Achsen genügen meist", "Обычно достаточно трёх осей")],
        [tx("Serbest biçimli yüzey var mı?", "Is there a free-form surface?", "Gibt es eine Freiformfläche?", "Есть ли поверхность свободной формы?"), tx("Sürekli beş eksen", "Continuous five-axis", "Simultan fünfachsig", "Непрерывная пятиосевая обработка"), tx("3+2 konumlama yeterli olabilir", "3+2 positioning may be enough", "3+2-Positionierung kann genügen", "Может хватить позиционирования 3+2")],
        [tx("Derin bölgeye kısa takımla erişmek gerekiyor mu?", "Does a deep area need a short tool?", "Ist ein tiefer Bereich mit kurzem Werkzeug zu erreichen?", "Нужен ли доступ к глубокой зоне коротким инструментом?"), tx("Parçayı eğerek kısa takım", "Tilt the part, use a short tool", "Teil schwenken, kurzes Werkzeug", "Наклон детали, короткий инструмент"), tx("Standart takım boyu", "Standard tool length", "Standard-Werkzeuglänge", "Стандартная длина инструмента")],
      ],
    },
    sources: [
      { ref: "ISO 841", what: tx("Sayısal kontrollü tezgâhlarda eksen ve hareket adlandırması", "Axis and motion nomenclature for numerically controlled machines", "Achsen- und Bewegungsbezeichnungen für numerisch gesteuerte Maschinen", "Обозначение осей и движений станков с числовым программным управлением") },
      { ref: "ISO 1101", what: tx("Geometrik ürün spesifikasyonu: biçim, yön, konum ve salgı toleransları", "Geometrical product specification: form, orientation, location and run-out tolerances", "Geometrische Produktspezifikation: Form-, Richtungs-, Orts- und Lauftoleranzen", "Геометрические характеристики изделий: допуски формы, ориентации, расположения и биения") },
    ],
    relatedPosts: ["cnc-torna-frezeleme-farki", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["cnc-frezeleme", "fikstur-aparat-tasarimi"],
  },
  "havacilik-parcalarinda-malzeme-secimi": {
    subject: tx("Malzeme seçiminin karar yolu", "The decision path for material selection", "Der Entscheidungsweg bei der Werkstoffauswahl", "Порядок принятия решения при выборе материала"),
    table: {
      caption: tx("Ölçüt ve aday", "Criterion and candidate", "Kriterium und Kandidat", "Критерий и вариант"),
      note: tx("Nitel karşılaştırma. Sayısal değerler yazının tablosundadır ve tipik değerlerdir; bir işte parti sertifikası esastır.", "A qualitative comparison. Numerical values are in the article's table and are typical; for a job the batch certificate governs.", "Ein qualitativer Vergleich. Zahlenwerte stehen in der Tabelle des Beitrags und sind typische Werte; für einen Auftrag ist das Chargenzeugnis maßgebend.", "Качественное сравнение. Числовые значения приведены в таблице статьи и являются типичными; для конкретного заказа определяющим является сертификат на партию."),
      headers: [tx("Ölçüt", "Criterion", "Kriterium", "Критерий"), tx("Al 7075-T6", "Al 7075-T6", "Al 7075-T6", "Al 7075-T6"), tx("Ti-6Al-4V", "Ti-6Al-4V", "Ti-6Al-4V", "Ti-6Al-4V")],
      rows: [
        [tx("Yüksek çalışma sıcaklığı", "High operating temperature", "Hohe Betriebstemperatur", "Высокая рабочая температура"), tx("Sınırlı", "Limited", "Begrenzt", "Ограниченно"), tx("Uygun", "Suitable", "Geeignet", "Подходит")],
        [tx("Kaplamasız korozyon direnci", "Corrosion resistance without coating", "Korrosionsbeständigkeit ohne Beschichtung", "Коррозионная стойкость без покрытия"), tx("Yüzey işlemi gerekir", "Needs surface treatment", "Oberflächenbehandlung nötig", "Нужна обработка поверхности"), tx("Doğal oksit tabakası", "Natural oxide layer", "Natürliche Oxidschicht", "Естественный оксидный слой")],
        [tx("İşleme süresi", "Machining time", "Bearbeitungszeit", "Время обработки"), tx("Kısa", "Short", "Kurz", "Короткое"), tx("Uzun", "Long", "Lang", "Долгое")],
        [tx("Hammadde maliyeti", "Raw material cost", "Rohmaterialkosten", "Стоимость исходного материала"), tx("Düşük", "Lower", "Niedriger", "Ниже"), tx("Yüksek, dalgalı", "Higher, fluctuating", "Höher, schwankend", "Выше, нестабильна")],
      ],
    },
    sources: [
      { ref: "AMS 4045", what: tx("7075 alüminyum levha ve plaka, T6 temper", "7075 aluminium sheet and plate, T6 temper", "7075-Aluminiumblech und -platte, Zustand T6", "Листы и плиты из алюминия 7075, состояние T6") },
      { ref: "AMS 4911", what: tx("Ti-6Al-4V levha, şerit ve plaka", "Ti-6Al-4V sheet, strip and plate", "Ti-6Al-4V-Blech, -Band und -Platte", "Листы, ленты и плиты из Ti-6Al-4V") },
      { ref: "EN 10204", what: tx("Metalik ürünler için muayene belgesi türleri", "Types of inspection documents for metallic products", "Arten von Prüfbescheinigungen für metallische Erzeugnisse", "Типы документов о контроле металлической продукции") },
    ],
    relatedPosts: ["endustriyel-yuzey-islemleri-rehberi", "5-eksen-cnc-isleme-avantajlari"],
    relatedServices: ["malzeme-kutuphanesi", "havacilik-uzay"],
  },
  "dfm-tasarimdan-uretime-gecis": {
    subject: tx("İç köşe yarıçapı ve takım", "Internal corner radius and tool", "Innerer Eckenradius und Werkzeug", "Внутренний радиус угла и инструмент"),
    table: {
      caption: tx("Bir kote için üç soru", "Three questions for a dimension", "Drei Fragen zu einem Maß", "Три вопроса к одному размеру"),
      headers: [tx("Soru", "Question", "Frage", "Вопрос"), tx("Cevap", "Answer", "Antwort", "Ответ"), tx("Teknik resimde", "On the drawing", "In der Zeichnung", "На чертеже")],
      rows: [
        [tx("Bu kotenin montajda işlevi var mı?", "Does this dimension have a function in the assembly?", "Hat dieses Maß eine Funktion in der Baugruppe?", "Выполняет ли этот размер функцию в сборке?"), tx("Hayır", "No", "Nein", "Нет"), tx("Genel tolerans sınıfı", "General tolerance class", "Allgemeintoleranzklasse", "Класс общих допусков")],
        [tx("Hangi yüzeye göre çalışıyor?", "Which surface does it work against?", "Auf welche Fläche bezieht es sich?", "Относительно какой поверхности он работает?"), tx("Belli", "Known", "Bekannt", "Известна"), tx("Datuma bağlı geometrik tolerans", "Geometric tolerance to a datum", "Geometrische Toleranz mit Bezug", "Геометрический допуск относительно базы")],
        [tx("Dar tolerans neyi korur?", "What does the tight tolerance protect?", "Was sichert die enge Toleranz?", "Что обеспечивает жёсткий допуск?"), tx("Geçme veya sızdırmazlık", "A fit or a seal", "Eine Passung oder Abdichtung", "Посадку или уплотнение"), tx("Kritik kote olarak işaretle", "Mark as a critical dimension", "Als kritisches Maß kennzeichnen", "Отметить как критичный размер")],
      ],
    },
    sources: [
      { ref: "ISO 2768-1", what: tx("Ayrı tolerans verilmemiş ölçüler için genel toleranslar", "General tolerances for dimensions without individual tolerances", "Allgemeintoleranzen für Maße ohne einzelne Toleranzeintragung", "Общие допуски на размеры без индивидуальных допусков") },
      { ref: "ISO 8015", what: tx("Geometrik ürün spesifikasyonunun temel kavramları", "Fundamental concepts of geometrical product specification", "Grundlagen der geometrischen Produktspezifikation", "Основные понятия геометрических характеристик изделий") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing", "Geometrische Tolerierung", "Геометрические допуски") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["tasarim-rehberi-dfm", "tolerans-hassasiyet"],
  },
  "cnc-torna-frezeleme-farki": {
    subject: tx("Aynı geometride tornalama ve frezeleme", "Turning and milling on the same geometry", "Drehen und Fräsen an derselben Geometrie", "Токарная и фрезерная обработка одной геометрии"),
    table: {
      caption: tx("Özellik ve doğal yöntem", "Feature and natural method", "Merkmal und naheliegendes Verfahren", "Элемент и предпочтительный метод"),
      headers: [tx("Özellik", "Feature", "Merkmal", "Элемент"), tx("Doğal yöntem", "Natural method", "Naheliegendes Verfahren", "Предпочтительный метод"), tx("Neden", "Why", "Warum", "Почему")],
      rows: [
        [tx("Eş eksenli çaplar", "Concentric diameters", "Koaxiale Durchmesser", "Соосные диаметры"), tx("Tornalama", "Turning", "Drehen", "Токарная обработка"), tx("Aynı bağlamada birbirine referanslı", "Referenced to each other in one clamping", "In einer Aufspannung aufeinander bezogen", "Связаны друг с другом в одном установе")],
        [tx("Düzlem ve cep", "Flat and pocket", "Ebene und Tasche", "Плоскость и карман"), tx("Frezeleme", "Milling", "Fräsen", "Фрезерная обработка"), tx("Döner takım, sabit parça", "Rotating tool, stationary part", "Rotierendes Werkzeug, stehendes Teil", "Вращающийся инструмент, неподвижная деталь")],
        [tx("Eksene dik delik grubu", "Hole pattern across the axis", "Bohrbild quer zur Achse", "Группа отверстий поперёк оси"), tx("Frezeleme veya tahrikli takım", "Milling or driven tools", "Fräsen oder angetriebene Werkzeuge", "Фрезерование или приводной инструмент"), tx("İkinci operasyon ilkinin yüzeyine bağlanır", "The second operation references the first's surface", "Die zweite Operation bezieht sich auf die Fläche der ersten", "Вторая операция базируется на поверхности первой")],
      ],
    },
    sources: [
      { ref: "ISO 1101", what: tx("Eş eksenlilik ve salgı toleransları", "Concentricity and run-out tolerances", "Koaxialitäts- und Lauftoleranzen", "Допуски соосности и биения") },
      { ref: "ISO 2768-2", what: tx("Geometrik özellikler için genel toleranslar", "General tolerances for geometrical features", "Allgemeintoleranzen für geometrische Merkmale", "Общие допуски на геометрические элементы") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["cnc-tornalama", "cnc-frezeleme"],
  },
  "kalite-kontrol-cmm-olcum": {
    subject: tx("Datum kurgusu ve problama noktaları", "Datum set-up and probing points", "Bezugssystem und Antastpunkte", "Схема баз и точки ощупывания"),
    table: {
      caption: tx("Örnek kontrol planı (demo)", "Example control plan (demo)", "Beispielhafter Prüfplan (Demo)", "Пример плана контроля (демо)"),
      note: tx("Bu tablo bir şablondur; gerçek bir ölçüm raporu veya müşteri işi değildir. Sizin işinizin planı teknik resminize göre kurulur.", "This table is a template; it is not a real measurement report or a customer job. The plan for your job is built from your drawing.", "Diese Tabelle ist eine Vorlage; sie ist kein echtes Messprotokoll und kein Kundenauftrag. Der Plan für Ihren Auftrag wird anhand Ihrer Zeichnung erstellt.", "Эта таблица — шаблон; это не реальный протокол измерений и не заказ клиента. План для вашего заказа составляется по вашему чертежу."),
      headers: [tx("Özellik", "Feature", "Merkmal", "Параметр"), tx("Yöntem", "Method", "Methode", "Метод"), tx("Kayıt", "Record", "Nachweis", "Протокол")],
      rows: [
        [tx("Datum A düzlemi", "Datum A plane", "Bezugsebene A", "Базовая плоскость A"), tx("CMM, düzlemsellik", "CMM, flatness", "KMG, Ebenheit", "КИМ, плоскостность"), tx("Ölçüm kaydı", "Measurement record", "Messprotokoll", "Протокол измерений")],
        [tx("Delik konumu (A-B)", "Hole position (A-B)", "Bohrungsposition (A-B)", "Позиция отверстия (A-B)"), tx("CMM, konum", "CMM, position", "KMG, Position", "КИМ, позиция"), tx("Ölçüm kaydı", "Measurement record", "Messprotokoll", "Протокол измерений")],
        [tx("Delik çapı", "Hole diameter", "Bohrungsdurchmesser", "Диаметр отверстия"), tx("Ara kontrol", "In-process check", "Zwischenprüfung", "Промежуточный контроль"), tx("Operasyon kaydı", "Operation record", "Arbeitsgangprotokoll", "Протокол операции")],
      ],
    },
    sources: [
      { ref: "ISO 10360-2", what: tx("Koordinat ölçüm makinelerinin kabul ve yeniden doğrulama testleri", "Acceptance and reverification tests for coordinate measuring machines", "Annahme- und Bestätigungsprüfungen für Koordinatenmessgeräte", "Приёмочные испытания и перепроверка координатно-измерительных машин") },
      { ref: "ISO 5459", what: tx("Datumlar ve datum sistemleri", "Datums and datum systems", "Bezüge und Bezugssysteme", "Базы и системы баз") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing", "Geometrische Tolerierung", "Геометрические допуски") },
    ],
    relatedPosts: ["dfm-tasarimdan-uretime-gecis", "cnc-torna-frezeleme-farki"],
    relatedServices: ["kalite-kontrol", "tolerans-hassasiyet"],
  },
  "endustriyel-yuzey-islemleri-rehberi": {
    subject: tx("İşlemin yüzey ölçüsüne etkisi", "The effect of the treatment on surface size", "Einfluss der Behandlung auf das Oberflächenmaß", "Влияние обработки на размер поверхности"),
    table: {
      caption: tx("Şartnamede ne yazmalı", "What the specification should state", "Was in der Spezifikation stehen sollte", "Что указать в спецификации"),
      headers: [tx("İşlem", "Treatment", "Behandlung", "Обработка"), tx("Ölçüye etkisi", "Effect on size", "Maßeinfluss", "Влияние на размер"), tx("Şartnamede", "In the specification", "In der Spezifikation", "В спецификации")],
      rows: [
        [tx("Anodizasyon", "Anodising", "Eloxieren", "Анодирование"), tx("Artar; bir kısmı içe nüfuz eder", "Increases; part penetrates inward", "Nimmt zu; ein Teil wächst nach innen", "Увеличивается; часть слоя растёт внутрь"), tx("MIL-A-8625 tip ve sınıf, kalınlık", "MIL-A-8625 type and class, thickness", "MIL-A-8625 Typ und Klasse, Schichtdicke", "MIL-A-8625: тип и класс, толщина")],
        [tx("Pasivasyon", "Passivation", "Passivieren", "Пассивация"), tx("Ölçülebilir değişim yok", "No measurable change", "Keine messbare Änderung", "Измеримых изменений нет"), tx("ASTM A967 yöntemi", "ASTM A967 method", "Verfahren nach ASTM A967", "Метод по ASTM A967")],
        [tx("Toz boya", "Powder coating", "Pulverbeschichtung", "Порошковая окраска"), tx("Kalınlığı kadar artar", "Increases by its thickness", "Nimmt um die Schichtdicke zu", "Увеличивается на толщину покрытия"), tx("Ön işlem, kalınlık, maskeleme", "Pretreatment, thickness, masking", "Vorbehandlung, Schichtdicke, Abdeckung", "Подготовка поверхности, толщина, маскирование")],
        [tx("Elektropolisaj", "Electropolishing", "Elektropolieren", "Электрополирование"), tx("Azalır", "Decreases", "Nimmt ab", "Уменьшается"), tx("Hedef Ra ve kaldırılacak pay", "Target Ra and removal allowance", "Ziel-Ra und Abtragszugabe", "Целевое Ra и припуск на съём")],
      ],
    },
    sources: [
      { ref: "MIL-A-8625", what: tx("Alüminyum ve alaşımları için anodik kaplamalar", "Anodic coatings for aluminium and aluminium alloys", "Anodische Beschichtungen für Aluminium und Aluminiumlegierungen", "Анодные покрытия для алюминия и алюминиевых сплавов") },
      { ref: "ASTM A967", what: tx("Paslanmaz çelik parçalar için kimyasal pasivasyon işlemleri", "Chemical passivation treatments for stainless steel parts", "Chemische Passivierung von Edelstahlteilen", "Химическая пассивация деталей из нержавеющей стали") },
      { ref: "ISO 21920-2", what: tx("Yüzey dokusu: profil parametreleri (Ra)", "Surface texture: profile parameters (Ra)", "Oberflächenbeschaffenheit: Profilparameter (Ra)", "Структура поверхности: параметры профиля (Ra)") },
    ],
    relatedPosts: ["havacilik-parcalarinda-malzeme-secimi", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["anodizasyon", "yuzey-islemleri-muhendislik"],
  },
};

/* UX05 — one engineering problem per capability profile. */
export const PROFILE_SUBJECTS: Record<string, Text> = {
  "ince-cidarli-govde": tx("İnce cidar: bağlama ve serbest bırakma", "Thin wall: clamping and release", "Dünne Wand: Spannen und Entspannen", "Тонкая стенка: закрепление и раскрепление"),
  "titanyum-baglanti-parcasi": tx("Titanyum: proses ve ara kontrol", "Titanium: process and in-process check", "Titan: Prozess und Zwischenprüfung", "Титан: процесс и промежуточный контроль"),
  "hassas-mil": tx("Mil: datum ve salgı kurulumu", "Shaft: datum and run-out set-up", "Welle: Bezugssystem und Rundlauf", "Вал: база и схема контроля биения"),
};
