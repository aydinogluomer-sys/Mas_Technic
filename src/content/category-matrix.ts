/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY DECISION MATRIX (PAGE01)

   Three readable columns per category: the reader's need → the process or
   scope page that answers it → the record that starts the conversation.
   No numeric threshold appears here: capacity figures are not approved
   (owner input O02), so the matrix routes by need, not by number.
   Keys are `${prefix}/${slug}` as in `src/data/categoryPages.ts`.
   ══════════════════════════════════════════════════════════════════════════ */

type Text = { tr: string; en: string; de: string; ru: string; zh: string };
export interface MatrixRow { need: Text; slug: string; next: Text }

const DRAWING: Text = { tr: "Teknik resim veya 3B model", en: "Technical drawing or 3D model", de: "Technische Zeichnung oder 3D-Modell", ru: "Чертёж или 3D-модель", zh: "工程图纸或 3D 模型" };
const SPEC: Text = { tr: "Kaplama / işlem şartnamesi", en: "Coating / process specification", de: "Beschichtungs- / Behandlungsspezifikation", ru: "Спецификация на покрытие / обработку", zh: "涂层 / 处理规范" };
const PLAN: Text = { tr: "Kontrol planı taslağı", en: "Draft control plan", de: "Prüfplanentwurf", ru: "Проект плана контроля", zh: "检验计划草案" };

const row = (tr: string, en: string, de: string, ru: string, zh: string, slug: string, next: Text): MatrixRow => ({ need: { tr, en, de, ru, zh }, slug, next });

export const CATEGORY_MATRIX: Record<string, readonly MatrixRow[]> = {
  "hizmetler/talasli-imalat": [
    row("Prizmatik parça, birden fazla yüzde özellik", "Prismatic part, features on several faces", "Prismatisches Teil, Merkmale auf mehreren Seiten", "Призматическая деталь, элементы на нескольких гранях", "棱柱类零件，特征分布于多个面", "cnc-frezeleme", DRAWING),
    row("Dönel parça, eş eksenli çaplar", "Rotational part, concentric diameters", "Rotationsteil, koaxiale Durchmesser", "Деталь вращения, соосные диаметры", "回转类零件，同轴直径", "cnc-tornalama", DRAWING),
    row("Standart takımın ulaşamadığı küçük özellik", "Small features a standard tool cannot reach", "Kleine Merkmale, die ein Standardwerkzeug nicht erreicht", "Мелкие элементы, недоступные стандартному инструменту", "标准刀具无法触及的小特征", "hassas-mikro-isleme", DRAWING),
    row("Boyu çapına göre uzun delik", "A hole that is long for its diameter", "Eine im Verhältnis zum Durchmesser lange Bohrung", "Отверстие, длинное относительно диаметра", "长径比较大的孔", "derin-delik-raybalama", DRAWING),
  ],
  "hizmetler/on-uretim": [
    row("Plastik parça, seri öncesi kalıp kararı", "Plastic part, tooling decision before series", "Kunststoffteil, Werkzeugentscheidung vor der Serie", "Пластмассовая деталь, решение по оснастке до серии", "塑料件，批量前的模具决策", "enjeksiyon-kalibi", DRAWING),
    row("Karmaşık metal form, yüksek adet", "Complex metal form, high quantity", "Komplexe Metallform, hohe Stückzahl", "Сложная металлическая форма, большое количество", "复杂金属形状，大批量", "basincli-dokum", DRAWING),
    row("Kısa seri veya fonksiyonel prototip", "Short run or functional prototype", "Kleinserie oder Funktionsprototyp", "Малая серия или функциональный прототип", "小批量或功能原型", "silikon-kaliplama", { tr: "Master model ve adet", en: "Master model and quantity", de: "Urmodell und Stückzahl", ru: "Мастер-модель и количество", zh: "母模与数量" }),
    row("Tekrarlanabilir bağlama veya kontrol", "Repeatable clamping or inspection", "Wiederholgenaue Aufspannung oder Prüfung", "Повторяемый установ или контроль", "可重复的装夹或检验", "fikstur-aparat-tasarimi", { tr: "Parça modeli ve operasyon listesi", en: "Part model and operation list", de: "Teilemodell und Arbeitsgangliste", ru: "Модель детали и перечень операций", zh: "零件模型与工序清单" }),
  ],
  "hizmetler/yuzey-islemleri": [
    row("Yüzey hazırlığı, çapak veya görünüm", "Surface preparation, burrs or appearance", "Oberflächenvorbereitung, Grate oder Optik", "Подготовка поверхности, заусенцы или внешний вид", "表面预处理、毛刺或外观", "mekanik-yuzey-islemleri", SPEC),
    row("Alüminyumda korozyon ve renk", "Corrosion and colour on aluminium", "Korrosion und Farbe bei Aluminium", "Коррозия и цвет на алюминии", "铝材的防腐与颜色", "anodizasyon", SPEC),
    row("Paslanmazda pasivasyon, çelikte dönüşüm kaplaması", "Passivation on stainless, conversion coating on steel", "Passivieren bei Edelstahl, Konversionsschicht bei Stahl", "Пассивация нержавеющей стали, конверсионный слой на стали", "不锈钢钝化，钢件转化涂层", "kimyasal-islemler", SPEC),
    row("Dış ortam veya dekoratif kaplama", "Outdoor or decorative coating", "Außen- oder Dekorbeschichtung", "Наружное или декоративное покрытие", "户外或装饰性涂层", "boya-koruyucu-kaplamalar", SPEC),
  ],
  "hizmetler/isaretleme-tanimlama": [
    row("Kalıcı, okunur parça işareti", "Permanent, legible part mark", "Dauerhafte, lesbare Teilekennzeichnung", "Стойкая, читаемая маркировка детали", "永久、清晰的零件标识", "lazer-kazima", { tr: "İşaret içeriği ve yeri", en: "Mark content and location", de: "Inhalt und Position der Kennzeichnung", ru: "Содержание и место маркировки", zh: "标识内容与位置" }),
    row("Malzeme kaldırmadan işaret", "A mark without removing material", "Kennzeichnung ohne Materialabtrag", "Маркировка без съёма материала", "不去除材料的标识", "tavlama", { tr: "İşaret içeriği ve yüzey", en: "Mark content and surface", de: "Inhalt der Kennzeichnung und Oberfläche", ru: "Содержание маркировки и поверхность", zh: "标识内容与表面" }),
    row("Makinece okunan seri ve lot kimliği", "Machine-read serial and lot identity", "Maschinenlesbare Serien- und Losidentifikation", "Машиночитаемая идентификация серии и партии", "可机读的序列号与批次标识", "qr-datamatrix-kodlari", { tr: "Kodlanacak veri", en: "Data to encode", de: "Zu codierende Daten", ru: "Данные для кодирования", zh: "待编码数据" }),
    row("Logo veya müşteri işareti", "Logo or customer mark", "Logo oder Kundenkennzeichnung", "Логотип или маркировка заказчика", "Logo 或客户标识", "logo-markalama", { tr: "Vektör dosya", en: "Vector file", de: "Vektordatei", ru: "Векторный файл", zh: "矢量文件" }),
  ],
  "hizmetler/montaj-birlestirme": [
    row("Plastikte dişli bağlantı", "Threaded connection in plastic", "Gewindeverbindung in Kunststoff", "Резьбовое соединение в пластмассе", "塑料件中的螺纹连接", "insert-uygulama", DRAWING),
    row("Birden fazla parçanın birleştirilmesi", "Joining several parts", "Fügen mehrerer Teile", "Соединение нескольких деталей", "多个零件的连接", "mekanik-montaj", { tr: "Montaj resmi ve parça listesi", en: "Assembly drawing and parts list", de: "Montagezeichnung und Stückliste", ru: "Сборочный чертёж и перечень деталей", zh: "装配图与零件清单" }),
    row("Kit, etiket ve koruyucu ambalaj", "Kits, labels and protective packaging", "Kits, Etiketten und Schutzverpackung", "Комплекты, этикетки и защитная упаковка", "套件、标签与保护性包装", "kitting-paketleme", { tr: "Kit listesi", en: "Kit list", de: "Kitliste", ru: "Состав комплекта", zh: "套件清单" }),
    row("Kaynakla birleştirilen yapı", "A welded structure", "Eine Schweißkonstruktion", "Сварная конструкция", "焊接结构", "kaynakli-imalat", { tr: "Kaynak resmi ve şartname", en: "Weld drawing and specification", de: "Schweißzeichnung und Spezifikation", ru: "Сварочный чертёж и спецификация", zh: "焊接图与规范" }),
  ],
  "kabiliyetler/uretim-altyapisi": [
    row("Hangi proses ailesinin kullanılacağı", "Which process family is used", "Welche Verfahrensfamilie eingesetzt wird", "Какое семейство процессов применяется", "采用哪个工艺系列", "makine-parkuru", DRAWING),
    row("Malzeme seçimi ve karşılaştırma", "Material choice and comparison", "Werkstoffauswahl und Vergleich", "Выбор и сравнение материалов", "材料选择与比较", "malzeme-kutuphanesi", { tr: "Çalışma koşulları", en: "Operating conditions", de: "Einsatzbedingungen", ru: "Условия эксплуатации", zh: "使用工况" }),
  ],
  "kabiliyetler/kalite-standartlar": [
    row("Neyin, nasıl ölçüleceği", "What is measured, and how", "Was gemessen wird und wie", "Что и как измеряется", "测量什么、如何测量", "kalite-kontrol", PLAN),
    row("Hangi kotenin dar tolerans gerektirdiği", "Which dimension really needs a tight tolerance", "Welches Maß wirklich eine enge Toleranz erfordert", "Какой размер действительно требует жёсткого допуска", "哪个尺寸真正需要严格公差", "tolerans-hassasiyet", DRAWING),
  ],
  "kabiliyetler/muhendislik-destegi": [
    row("Tasarımın üretilebilirliği ve maliyeti", "Manufacturability and cost of the design", "Fertigbarkeit und Kosten der Konstruktion", "Технологичность и стоимость конструкции", "设计的可制造性与成本", "tasarim-rehberi-dfm", DRAWING),
    row("Uygun yüzey işlemi ve ölçüye etkisi", "The right surface treatment and its effect on size", "Die passende Oberflächenbehandlung und ihre Auswirkung auf das Maß", "Подходящая обработка поверхности и её влияние на размер", "合适的表面处理及其对尺寸的影响", "yuzey-islemleri-muhendislik", SPEC),
  ],
  "kabiliyetler/prototipten-seri-uretime": [
    row("Az adet, hızlı doğrulama", "Low quantity, quick validation", "Geringe Stückzahl, schnelle Validierung", "Малое количество, быстрая проверка", "少量，快速验证", "dusuk-hacimli-uretim", DRAWING),
    row("Tekrarlanabilir seri", "Repeatable series", "Wiederholgenaue Serie", "Повторяемая серия", "可重复的批量", "seri-imalat", PLAN),
  ],
  "kabiliyetler/surec-operasyon": [
    row("Aşamalar ve tek muhatap", "Stages and a single contact", "Phasen und ein zentraler Ansprechpartner", "Этапы и единое контактное лицо", "各阶段与单一联系人", "proje-yonetimi", { tr: "Proje kapsamı", en: "Project scope", de: "Projektumfang", ru: "Объём проекта", zh: "项目范围" }),
    row("Malzeme tedarik riski ve termin", "Material supply risk and lead time", "Beschaffungsrisiko beim Werkstoff und Liefertermin", "Риск поставки материала и сроки", "材料供应风险与交期", "tedarik-zinciri", { tr: "Malzeme şartnamesi", en: "Material specification", de: "Werkstoffspezifikation", ru: "Спецификация на материал", zh: "材料规范" }),
    row("Kurulum ve akış kayıpları", "Setup and flow losses", "Rüst- und Ablaufverluste", "Потери на наладку и в потоке", "调机与流程损失", "operasyonel-verimlilik", { tr: "Mevcut operasyon listesi", en: "Current operation list", de: "Aktuelle Arbeitsgangliste", ru: "Текущий перечень операций", zh: "现有工序清单" }),
  ],
  "endustriyel/yuksek-teknoloji": [
    row("Zor alaşım, izlenebilir üretim", "Difficult alloys, traceable production", "Schwierige Legierungen, rückverfolgbare Fertigung", "Труднообрабатываемые сплавы, прослеживаемое производство", "难加工合金，可追溯生产", "havacilik-uzay", { tr: "Şartname ve malzeme belgesi", en: "Specification and material document", de: "Spezifikation und Werkstoffnachweis", ru: "Спецификация и документ на материал", zh: "规范与材料文件" }),
    row("Proje şartnamesine bağlı parça", "A part bound by a project specification", "Ein an eine Projektspezifikation gebundenes Teil", "Деталь по спецификации проекта", "受项目规范约束的零件", "savunma-sanayi", { tr: "Şartname ve veri koşulları", en: "Specification and data conditions", de: "Spezifikation und Datenbedingungen", ru: "Спецификация и условия работы с данными", zh: "规范与数据处理条件" }),
    row("Eksen ilişkisi kritik mekanik parça", "Mechanical part where axis relationships are critical", "Mechanisches Teil mit kritischen Achsbeziehungen", "Механическая деталь с критичным расположением осей", "轴线关系关键的机械零件", "robotik", DRAWING),
  ],
  "endustriyel/seri-uretim-endustriyel": [
    row("Partiler arası tutarlılık", "Consistency between batches", "Konsistenz zwischen Chargen", "Стабильность от партии к партии", "批次间一致性", "otomotiv", PLAN),
    row("Biyouyumlu malzeme ve izlenebilirlik", "Biocompatible material and traceability", "Biokompatibler Werkstoff und Rückverfolgbarkeit", "Биосовместимый материал и прослеживаемость", "生物相容性材料与可追溯性", "medikal", { tr: "Şartname ve dokümantasyon kapsamı", en: "Specification and documentation scope", de: "Spezifikation und Dokumentationsumfang", ru: "Спецификация и объём документации", zh: "规范与文档范围" }),
    row("Deniz suyu ve galvanik uyum", "Seawater and galvanic compatibility", "Meerwasser und galvanische Verträglichkeit", "Морская вода и гальваническая совместимость", "海水与电偶相容性", "yelken-yat-sistemleri", { tr: "Montajdaki diğer metaller", en: "Other metals in the assembly", de: "Weitere Metalle in der Baugruppe", ru: "Другие металлы в сборке", zh: "装配中的其他金属" }),
  ],
  "endustriyel/endustriyel-sistemler": [
    row("Basınç altında akışkan, manifold", "Fluid under pressure, manifold", "Medium unter Druck, Verteilerblock", "Среда под давлением, коллектор", "承压流体，集成阀块", "hidrolik-pnomatik", { tr: "Çalışma basıncı ve conta gereksinimi", en: "Working pressure and seal requirement", de: "Betriebsdruck und Dichtungsanforderung", ru: "Рабочее давление и требования к уплотнению", zh: "工作压力与密封要求" }),
    row("Standart boyut tablosuna bağlı bağlantı", "A connection bound by a standard dimension table", "Eine an eine Normmaßtabelle gebundene Verbindung", "Соединение по стандартной таблице размеров", "受标准尺寸表约束的连接件", "boru-baglanti-parcalari", { tr: "Standart ve basınç sınıfı", en: "Standard and pressure class", de: "Norm und Druckstufe", ru: "Стандарт и класс давления", zh: "标准与压力等级" }),
    row("Sızdırmazlık ve soğutucu uyumu", "Sealing and refrigerant compatibility", "Dichtheit und Kältemittelverträglichkeit", "Герметичность и совместимость с хладагентом", "密封性与制冷剂相容性", "iklim-teknolojileri", { tr: "Sızdırmazlık şartnamesi", en: "Sealing specification", de: "Dichtheitsspezifikation", ru: "Спецификация на герметичность", zh: "密封规范" }),
  ],
  "endustriyel/uretim-cozumleri": [
    row("Tasarımı fiziksel olarak doğrulamak", "Validating the design physically", "Die Konstruktion physisch validieren", "Физическая проверка конструкции", "对设计进行实物验证", "prototip-uretim", DRAWING),
    row("Pazar testi veya pilot parti", "Market test or pilot batch", "Markttest oder Pilotcharge", "Рыночный тест или пилотная партия", "市场测试或试产批次", "kucuk-seri", { tr: "Adet ve teslim planı", en: "Quantity and delivery plan", de: "Stückzahl und Lieferplan", ru: "Количество и график поставок", zh: "数量与交付计划" }),
    row("Programlı, tekrarlanabilir teslimat", "Scheduled, repeatable delivery", "Terminierte, wiederholbare Lieferung", "Плановые, повторяемые поставки", "按计划、可重复的交付", "seri-uretim", PLAN),
    row("Standart dışı mühendislik işi", "Non-standard engineering work", "Engineering-Aufgaben außerhalb des Standards", "Нестандартные инженерные задачи", "非标准工程任务", "ozel-projeler", { tr: "Proje tanımı", en: "Project description", de: "Projektbeschreibung", ru: "Описание проекта", zh: "项目描述" }),
  ],
  "endustriyel/enerji-altyapi": [
    row("Dış ortamda çalışan bileşen", "A component working outdoors", "Ein Bauteil für den Außeneinsatz", "Компонент для наружной эксплуатации", "户外工作的部件", "yenilenebilir-enerji", { tr: "Ortam sınıfı ve kaplama sistemi", en: "Environment class and coating system", de: "Umgebungsklasse und Beschichtungssystem", ru: "Класс среды и система покрытия", zh: "环境等级与涂层系统" }),
    row("Basınç ve sıcaklık sınıfı tanımlı parça", "A part with a defined pressure and temperature class", "Ein Teil mit definierter Druck- und Temperaturklasse", "Деталь с заданным классом давления и температуры", "规定了压力与温度等级的零件", "petrol-gaz", { tr: "Şartname ve malzeme sınıfı", en: "Specification and material class", de: "Spezifikation und Werkstoffklasse", ru: "Спецификация и класс материала", zh: "规范与材料等级" }),
    row("İletkenlik ve kontak yüzeyi", "Conductivity and contact surface", "Leitfähigkeit und Kontaktfläche", "Электропроводность и контактная поверхность", "导电性与接触面", "guc-dagitim-sistemleri", { tr: "Malzeme ve kaplama gereksinimi", en: "Material and plating requirement", de: "Werkstoff- und Beschichtungsanforderung", ru: "Требования к материалу и покрытию", zh: "材料与镀层要求" }),
    row("Aşınma ve darbe altındaki parça", "A part under wear and impact", "Ein Teil unter Verschleiß- und Stoßbelastung", "Деталь под износом и ударными нагрузками", "承受磨损与冲击的零件", "madencilik-ekipmanlari", { tr: "Sertlik ve ısıl işlem gereksinimi", en: "Hardness and heat treatment requirement", de: "Härte- und Wärmebehandlungsanforderung", ru: "Требования к твёрдости и термообработке", zh: "硬度与热处理要求" }),
  ],
};
