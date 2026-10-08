/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY DECISION MATRIX (PAGE01)

   Three readable columns per category: the reader's need → the process or
   scope page that answers it → the record that starts the conversation.
   No numeric threshold appears here: capacity figures are not approved
   (owner input O02), so the matrix routes by need, not by number.
   Keys are `${prefix}/${slug}` as in `src/data/categoryPages.ts`.
   ══════════════════════════════════════════════════════════════════════════ */

type Text = { tr: string; en: string; de: string; ru: string };
export interface MatrixRow { need: Text; slug: string; next: Text }

const DRAWING: Text = { tr: "Teknik resim veya 3B model", en: "Technical drawing or 3D model", de: "Technische Zeichnung oder 3D-Modell", ru: "Чертёж или 3D-модель" };
const SPEC: Text = { tr: "Kaplama / işlem şartnamesi", en: "Coating / process specification", de: "Beschichtungs- / Behandlungsspezifikation", ru: "Спецификация на покрытие / обработку" };
const PLAN: Text = { tr: "Kontrol planı taslağı", en: "Draft control plan", de: "Prüfplanentwurf", ru: "Проект плана контроля" };

const row = (tr: string, en: string, de: string, ru: string, slug: string, next: Text): MatrixRow => ({ need: { tr, en, de, ru }, slug, next });

export const CATEGORY_MATRIX: Record<string, readonly MatrixRow[]> = {
  "hizmetler/talasli-imalat": [
    row("Prizmatik parça, birden fazla yüzde özellik", "Prismatic part, features on several faces", "Prismatisches Teil, Merkmale auf mehreren Seiten", "Призматическая деталь, элементы на нескольких гранях", "cnc-frezeleme", DRAWING),
    row("Dönel parça, eş eksenli çaplar", "Rotational part, concentric diameters", "Rotationsteil, koaxiale Durchmesser", "Деталь вращения, соосные диаметры", "cnc-tornalama", DRAWING),
    row("Standart takımın ulaşamadığı küçük özellik", "Small features a standard tool cannot reach", "Kleine Merkmale, die ein Standardwerkzeug nicht erreicht", "Мелкие элементы, недоступные стандартному инструменту", "hassas-mikro-isleme", DRAWING),
    row("Boyu çapına göre uzun delik", "A hole that is long for its diameter", "Eine im Verhältnis zum Durchmesser lange Bohrung", "Отверстие, длинное относительно диаметра", "derin-delik-raybalama", DRAWING),
  ],
  "hizmetler/on-uretim": [
    row("Plastik parça, seri öncesi kalıp kararı", "Plastic part, tooling decision before series", "Kunststoffteil, Werkzeugentscheidung vor der Serie", "Пластмассовая деталь, решение по оснастке до серии", "enjeksiyon-kalibi", DRAWING),
    row("Karmaşık metal form, yüksek adet", "Complex metal form, high quantity", "Komplexe Metallform, hohe Stückzahl", "Сложная металлическая форма, большое количество", "basincli-dokum", DRAWING),
    row("Kısa seri veya fonksiyonel prototip", "Short run or functional prototype", "Kleinserie oder Funktionsprototyp", "Малая серия или функциональный прототип", "silikon-kaliplama", { tr: "Master model ve adet", en: "Master model and quantity", de: "Urmodell und Stückzahl", ru: "Мастер-модель и количество" }),
    row("Tekrarlanabilir bağlama veya kontrol", "Repeatable clamping or inspection", "Wiederholgenaue Aufspannung oder Prüfung", "Повторяемый установ или контроль", "fikstur-aparat-tasarimi", { tr: "Parça modeli ve operasyon listesi", en: "Part model and operation list", de: "Teilemodell und Arbeitsgangliste", ru: "Модель детали и перечень операций" }),
  ],
  "hizmetler/yuzey-islemleri": [
    row("Yüzey hazırlığı, çapak veya görünüm", "Surface preparation, burrs or appearance", "Oberflächenvorbereitung, Grate oder Optik", "Подготовка поверхности, заусенцы или внешний вид", "mekanik-yuzey-islemleri", SPEC),
    row("Alüminyumda korozyon ve renk", "Corrosion and colour on aluminium", "Korrosion und Farbe bei Aluminium", "Коррозия и цвет на алюминии", "anodizasyon", SPEC),
    row("Paslanmazda pasivasyon, çelikte dönüşüm kaplaması", "Passivation on stainless, conversion coating on steel", "Passivieren bei Edelstahl, Konversionsschicht bei Stahl", "Пассивация нержавеющей стали, конверсионный слой на стали", "kimyasal-islemler", SPEC),
    row("Dış ortam veya dekoratif kaplama", "Outdoor or decorative coating", "Außen- oder Dekorbeschichtung", "Наружное или декоративное покрытие", "boya-koruyucu-kaplamalar", SPEC),
  ],
  "hizmetler/isaretleme-tanimlama": [
    row("Kalıcı, okunur parça işareti", "Permanent, legible part mark", "Dauerhafte, lesbare Teilekennzeichnung", "Стойкая, читаемая маркировка детали", "lazer-kazima", { tr: "İşaret içeriği ve yeri", en: "Mark content and location", de: "Inhalt und Position der Kennzeichnung", ru: "Содержание и место маркировки" }),
    row("Malzeme kaldırmadan işaret", "A mark without removing material", "Kennzeichnung ohne Materialabtrag", "Маркировка без съёма материала", "tavlama", { tr: "İşaret içeriği ve yüzey", en: "Mark content and surface", de: "Inhalt der Kennzeichnung und Oberfläche", ru: "Содержание маркировки и поверхность" }),
    row("Makinece okunan seri ve lot kimliği", "Machine-read serial and lot identity", "Maschinenlesbare Serien- und Losidentifikation", "Машиночитаемая идентификация серии и партии", "qr-datamatrix-kodlari", { tr: "Kodlanacak veri", en: "Data to encode", de: "Zu codierende Daten", ru: "Данные для кодирования" }),
    row("Logo veya müşteri işareti", "Logo or customer mark", "Logo oder Kundenkennzeichnung", "Логотип или маркировка заказчика", "logo-markalama", { tr: "Vektör dosya", en: "Vector file", de: "Vektordatei", ru: "Векторный файл" }),
  ],
  "hizmetler/montaj-birlestirme": [
    row("Plastikte dişli bağlantı", "Threaded connection in plastic", "Gewindeverbindung in Kunststoff", "Резьбовое соединение в пластмассе", "insert-uygulama", DRAWING),
    row("Birden fazla parçanın birleştirilmesi", "Joining several parts", "Fügen mehrerer Teile", "Соединение нескольких деталей", "mekanik-montaj", { tr: "Montaj resmi ve parça listesi", en: "Assembly drawing and parts list", de: "Montagezeichnung und Stückliste", ru: "Сборочный чертёж и перечень деталей" }),
    row("Kit, etiket ve koruyucu ambalaj", "Kits, labels and protective packaging", "Kits, Etiketten und Schutzverpackung", "Комплекты, этикетки и защитная упаковка", "kitting-paketleme", { tr: "Kit listesi", en: "Kit list", de: "Kitliste", ru: "Состав комплекта" }),
    row("Kaynakla birleştirilen yapı", "A welded structure", "Eine Schweißkonstruktion", "Сварная конструкция", "kaynakli-imalat", { tr: "Kaynak resmi ve şartname", en: "Weld drawing and specification", de: "Schweißzeichnung und Spezifikation", ru: "Сварочный чертёж и спецификация" }),
  ],
  "kabiliyetler/uretim-altyapisi": [
    row("Hangi proses ailesinin kullanılacağı", "Which process family is used", "Welche Verfahrensfamilie eingesetzt wird", "Какое семейство процессов применяется", "makine-parkuru", DRAWING),
    row("Malzeme seçimi ve karşılaştırma", "Material choice and comparison", "Werkstoffauswahl und Vergleich", "Выбор и сравнение материалов", "malzeme-kutuphanesi", { tr: "Çalışma koşulları", en: "Operating conditions", de: "Einsatzbedingungen", ru: "Условия эксплуатации" }),
  ],
  "kabiliyetler/kalite-standartlar": [
    row("Neyin, nasıl ölçüleceği", "What is measured, and how", "Was gemessen wird und wie", "Что и как измеряется", "kalite-kontrol", PLAN),
    row("Hangi kotenin dar tolerans gerektirdiği", "Which dimension really needs a tight tolerance", "Welches Maß wirklich eine enge Toleranz erfordert", "Какой размер действительно требует жёсткого допуска", "tolerans-hassasiyet", DRAWING),
  ],
  "kabiliyetler/muhendislik-destegi": [
    row("Tasarımın üretilebilirliği ve maliyeti", "Manufacturability and cost of the design", "Fertigbarkeit und Kosten der Konstruktion", "Технологичность и стоимость конструкции", "tasarim-rehberi-dfm", DRAWING),
    row("Uygun yüzey işlemi ve ölçüye etkisi", "The right surface treatment and its effect on size", "Die passende Oberflächenbehandlung und ihre Auswirkung auf das Maß", "Подходящая обработка поверхности и её влияние на размер", "yuzey-islemleri-muhendislik", SPEC),
  ],
  "kabiliyetler/prototipten-seri-uretime": [
    row("Az adet, hızlı doğrulama", "Low quantity, quick validation", "Geringe Stückzahl, schnelle Validierung", "Малое количество, быстрая проверка", "dusuk-hacimli-uretim", DRAWING),
    row("Tekrarlanabilir seri", "Repeatable series", "Wiederholgenaue Serie", "Повторяемая серия", "seri-imalat", PLAN),
  ],
  "kabiliyetler/surec-operasyon": [
    row("Aşamalar ve tek muhatap", "Stages and a single contact", "Phasen und ein zentraler Ansprechpartner", "Этапы и единое контактное лицо", "proje-yonetimi", { tr: "Proje kapsamı", en: "Project scope", de: "Projektumfang", ru: "Объём проекта" }),
    row("Malzeme tedarik riski ve termin", "Material supply risk and lead time", "Beschaffungsrisiko beim Werkstoff und Liefertermin", "Риск поставки материала и сроки", "tedarik-zinciri", { tr: "Malzeme şartnamesi", en: "Material specification", de: "Werkstoffspezifikation", ru: "Спецификация на материал" }),
    row("Kurulum ve akış kayıpları", "Setup and flow losses", "Rüst- und Ablaufverluste", "Потери на наладку и в потоке", "operasyonel-verimlilik", { tr: "Mevcut operasyon listesi", en: "Current operation list", de: "Aktuelle Arbeitsgangliste", ru: "Текущий перечень операций" }),
  ],
  "endustriyel/yuksek-teknoloji": [
    row("Zor alaşım, izlenebilir üretim", "Difficult alloys, traceable production", "Schwierige Legierungen, rückverfolgbare Fertigung", "Труднообрабатываемые сплавы, прослеживаемое производство", "havacilik-uzay", { tr: "Şartname ve malzeme belgesi", en: "Specification and material document", de: "Spezifikation und Werkstoffnachweis", ru: "Спецификация и документ на материал" }),
    row("Proje şartnamesine bağlı parça", "A part bound by a project specification", "Ein an eine Projektspezifikation gebundenes Teil", "Деталь по спецификации проекта", "savunma-sanayi", { tr: "Şartname ve veri koşulları", en: "Specification and data conditions", de: "Spezifikation und Datenbedingungen", ru: "Спецификация и условия работы с данными" }),
    row("Eksen ilişkisi kritik mekanik parça", "Mechanical part where axis relationships are critical", "Mechanisches Teil mit kritischen Achsbeziehungen", "Механическая деталь с критичным расположением осей", "robotik", DRAWING),
  ],
  "endustriyel/seri-uretim-endustriyel": [
    row("Partiler arası tutarlılık", "Consistency between batches", "Konsistenz zwischen Chargen", "Стабильность от партии к партии", "otomotiv", PLAN),
    row("Biyouyumlu malzeme ve izlenebilirlik", "Biocompatible material and traceability", "Biokompatibler Werkstoff und Rückverfolgbarkeit", "Биосовместимый материал и прослеживаемость", "medikal", { tr: "Şartname ve dokümantasyon kapsamı", en: "Specification and documentation scope", de: "Spezifikation und Dokumentationsumfang", ru: "Спецификация и объём документации" }),
    row("Deniz suyu ve galvanik uyum", "Seawater and galvanic compatibility", "Meerwasser und galvanische Verträglichkeit", "Морская вода и гальваническая совместимость", "yelken-yat-sistemleri", { tr: "Montajdaki diğer metaller", en: "Other metals in the assembly", de: "Weitere Metalle in der Baugruppe", ru: "Другие металлы в сборке" }),
  ],
  "endustriyel/endustriyel-sistemler": [
    row("Basınç altında akışkan, manifold", "Fluid under pressure, manifold", "Medium unter Druck, Verteilerblock", "Среда под давлением, коллектор", "hidrolik-pnomatik", { tr: "Çalışma basıncı ve conta gereksinimi", en: "Working pressure and seal requirement", de: "Betriebsdruck und Dichtungsanforderung", ru: "Рабочее давление и требования к уплотнению" }),
    row("Standart boyut tablosuna bağlı bağlantı", "A connection bound by a standard dimension table", "Eine an eine Normmaßtabelle gebundene Verbindung", "Соединение по стандартной таблице размеров", "boru-baglanti-parcalari", { tr: "Standart ve basınç sınıfı", en: "Standard and pressure class", de: "Norm und Druckstufe", ru: "Стандарт и класс давления" }),
    row("Sızdırmazlık ve soğutucu uyumu", "Sealing and refrigerant compatibility", "Dichtheit und Kältemittelverträglichkeit", "Герметичность и совместимость с хладагентом", "iklim-teknolojileri", { tr: "Sızdırmazlık şartnamesi", en: "Sealing specification", de: "Dichtheitsspezifikation", ru: "Спецификация на герметичность" }),
  ],
  "endustriyel/uretim-cozumleri": [
    row("Tasarımı fiziksel olarak doğrulamak", "Validating the design physically", "Die Konstruktion physisch validieren", "Физическая проверка конструкции", "prototip-uretim", DRAWING),
    row("Pazar testi veya pilot parti", "Market test or pilot batch", "Markttest oder Pilotcharge", "Рыночный тест или пилотная партия", "kucuk-seri", { tr: "Adet ve teslim planı", en: "Quantity and delivery plan", de: "Stückzahl und Lieferplan", ru: "Количество и график поставок" }),
    row("Programlı, tekrarlanabilir teslimat", "Scheduled, repeatable delivery", "Terminierte, wiederholbare Lieferung", "Плановые, повторяемые поставки", "seri-uretim", PLAN),
    row("Standart dışı mühendislik işi", "Non-standard engineering work", "Engineering-Aufgaben außerhalb des Standards", "Нестандартные инженерные задачи", "ozel-projeler", { tr: "Proje tanımı", en: "Project description", de: "Projektbeschreibung", ru: "Описание проекта" }),
  ],
  "endustriyel/enerji-altyapi": [
    row("Dış ortamda çalışan bileşen", "A component working outdoors", "Ein Bauteil für den Außeneinsatz", "Компонент для наружной эксплуатации", "yenilenebilir-enerji", { tr: "Ortam sınıfı ve kaplama sistemi", en: "Environment class and coating system", de: "Umgebungsklasse und Beschichtungssystem", ru: "Класс среды и система покрытия" }),
    row("Basınç ve sıcaklık sınıfı tanımlı parça", "A part with a defined pressure and temperature class", "Ein Teil mit definierter Druck- und Temperaturklasse", "Деталь с заданным классом давления и температуры", "petrol-gaz", { tr: "Şartname ve malzeme sınıfı", en: "Specification and material class", de: "Spezifikation und Werkstoffklasse", ru: "Спецификация и класс материала" }),
    row("İletkenlik ve kontak yüzeyi", "Conductivity and contact surface", "Leitfähigkeit und Kontaktfläche", "Электропроводность и контактная поверхность", "guc-dagitim-sistemleri", { tr: "Malzeme ve kaplama gereksinimi", en: "Material and plating requirement", de: "Werkstoff- und Beschichtungsanforderung", ru: "Требования к материалу и покрытию" }),
    row("Aşınma ve darbe altındaki parça", "A part under wear and impact", "Ein Teil unter Verschleiß- und Stoßbelastung", "Деталь под износом и ударными нагрузками", "madencilik-ekipmanlari", { tr: "Sertlik ve ısıl işlem gereksinimi", en: "Hardness and heat treatment requirement", de: "Härte- und Wärmebehandlungsanforderung", ru: "Требования к твёрдости и термообработке" }),
  ],
};
