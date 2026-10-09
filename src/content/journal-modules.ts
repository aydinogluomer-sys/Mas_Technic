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

type Text = { tr: string; en: string; de: string; ru: string; zh: string };

export interface JournalModule {
  subject: Text;
  table: { caption: Text; note?: Text; headers: Text[]; rows: Text[][] };
  sources: { ref: string; what: Text }[];
  relatedPosts: string[];
  relatedServices: string[];
}

const tx = (tr: string, en: string, de: string, ru: string, zh: string): Text => ({ tr, en, de, ru, zh });

export const JOURNAL_MODULES: Record<string, JournalModule> = {
  "5-eksen-cnc-isleme-avantajlari": {
    subject: tx("Aynı parça: üç kurulum ve tek kurulum", "One part: three setups and one setup", "Ein Teil: drei Aufspannungen und eine Aufspannung", "Одна деталь: три установа и один установ", "同一零件：三次装夹与一次装夹"),
    table: {
      caption: tx("Beş eksen ne zaman gerekir", "When five axes are needed", "Wann fünf Achsen nötig sind", "Когда нужны пять осей", "何时需要五轴"),
      headers: [tx("Soru", "Question", "Frage", "Вопрос", "问题"), tx("Cevap evetse", "If yes", "Falls ja", "Если да", "若是"), tx("Cevap hayırsa", "If no", "Falls nein", "Если нет", "若否")],
      rows: [
        [tx("Kritik geometrik tolerans farklı yüzeyler arasında mı?", "Is a critical geometric tolerance defined between different faces?", "Ist eine kritische geometrische Toleranz zwischen verschiedenen Flächen definiert?", "Задан ли критичный геометрический допуск между разными поверхностями?", "关键几何公差是否定义在不同表面之间？"), tx("Tek kurulum: beş eksen", "One setup: five axes", "Eine Aufspannung: fünf Achsen", "Один установ: пять осей", "一次装夹：五轴"), tx("Üç eksen genellikle yeterli", "Three axes are usually enough", "Drei Achsen genügen meist", "Обычно достаточно трёх осей", "通常三轴即可")],
        [tx("Serbest biçimli yüzey var mı?", "Is there a free-form surface?", "Gibt es eine Freiformfläche?", "Есть ли поверхность свободной формы?", "是否有自由曲面？"), tx("Sürekli beş eksen", "Continuous five-axis", "Simultan fünfachsig", "Непрерывная пятиосевая обработка", "五轴联动"), tx("3+2 konumlama yeterli olabilir", "3+2 positioning may be enough", "3+2-Positionierung kann genügen", "Может хватить позиционирования 3+2", "3+2 定位或可满足")],
        [tx("Derin bölgeye kısa takımla erişmek gerekiyor mu?", "Does a deep area need a short tool?", "Ist ein tiefer Bereich mit kurzem Werkzeug zu erreichen?", "Нужен ли доступ к глубокой зоне коротким инструментом?", "是否需要用短刀具进入深部区域？"), tx("Parçayı eğerek kısa takım", "Tilt the part, use a short tool", "Teil schwenken, kurzes Werkzeug", "Наклон детали, короткий инструмент", "倾斜零件，使用短刀具"), tx("Standart takım boyu", "Standard tool length", "Standard-Werkzeuglänge", "Стандартная длина инструмента", "标准刀具长度")],
      ],
    },
    sources: [
      { ref: "ISO 841", what: tx("Sayısal kontrollü tezgâhlarda eksen ve hareket adlandırması", "Axis and motion nomenclature for numerically controlled machines", "Achsen- und Bewegungsbezeichnungen für numerisch gesteuerte Maschinen", "Обозначение осей и движений станков с числовым программным управлением", "数控机床的坐标轴和运动命名") },
      { ref: "ISO 1101", what: tx("Geometrik ürün spesifikasyonu: biçim, yön, konum ve salgı toleransları", "Geometrical product specification: form, orientation, location and run-out tolerances", "Geometrische Produktspezifikation: Form-, Richtungs-, Orts- und Lauftoleranzen", "Геометрические характеристики изделий: допуски формы, ориентации, расположения и биения", "产品几何技术规范：形状、方向、位置和跳动公差") },
    ],
    relatedPosts: ["cnc-torna-frezeleme-farki", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["cnc-frezeleme", "fikstur-aparat-tasarimi"],
  },
  "havacilik-parcalarinda-malzeme-secimi": {
    subject: tx("Malzeme seçiminin karar yolu", "The decision path for material selection", "Der Entscheidungsweg bei der Werkstoffauswahl", "Порядок принятия решения при выборе материала", "材料选择的决策路径"),
    table: {
      caption: tx("Ölçüt ve aday", "Criterion and candidate", "Kriterium und Kandidat", "Критерий и вариант", "指标与候选材料"),
      note: tx("Nitel karşılaştırma. Sayısal değerler yazının tablosundadır ve tipik değerlerdir; bir işte parti sertifikası esastır.", "A qualitative comparison. Numerical values are in the article's table and are typical; for a job the batch certificate governs.", "Ein qualitativer Vergleich. Zahlenwerte stehen in der Tabelle des Beitrags und sind typische Werte; für einen Auftrag ist das Chargenzeugnis maßgebend.", "Качественное сравнение. Числовые значения приведены в таблице статьи и являются типичными; для конкретного заказа определяющим является сертификат на партию.", "定性比较。数值见文章中的表格，均为典型值；具体订单以批次证书为准。"),
      headers: [tx("Ölçüt", "Criterion", "Kriterium", "Критерий", "指标"), tx("Al 7075-T6", "Al 7075-T6", "Al 7075-T6", "Al 7075-T6", "Al 7075-T6"), tx("Ti-6Al-4V", "Ti-6Al-4V", "Ti-6Al-4V", "Ti-6Al-4V", "Ti-6Al-4V")],
      rows: [
        [tx("Yüksek çalışma sıcaklığı", "High operating temperature", "Hohe Betriebstemperatur", "Высокая рабочая температура", "高工作温度"), tx("Sınırlı", "Limited", "Begrenzt", "Ограниченно", "有限"), tx("Uygun", "Suitable", "Geeignet", "Подходит", "适用")],
        [tx("Kaplamasız korozyon direnci", "Corrosion resistance without coating", "Korrosionsbeständigkeit ohne Beschichtung", "Коррозионная стойкость без покрытия", "无涂层时的耐腐蚀性"), tx("Yüzey işlemi gerekir", "Needs surface treatment", "Oberflächenbehandlung nötig", "Нужна обработка поверхности", "需表面处理"), tx("Doğal oksit tabakası", "Natural oxide layer", "Natürliche Oxidschicht", "Естественный оксидный слой", "天然氧化层")],
        [tx("İşleme süresi", "Machining time", "Bearbeitungszeit", "Время обработки", "加工时间"), tx("Kısa", "Short", "Kurz", "Короткое", "短"), tx("Uzun", "Long", "Lang", "Долгое", "长")],
        [tx("Hammadde maliyeti", "Raw material cost", "Rohmaterialkosten", "Стоимость исходного материала", "原材料成本"), tx("Düşük", "Lower", "Niedriger", "Ниже", "较低"), tx("Yüksek, dalgalı", "Higher, fluctuating", "Höher, schwankend", "Выше, нестабильна", "较高，波动大")],
      ],
    },
    sources: [
      { ref: "AMS 4045", what: tx("7075 alüminyum levha ve plaka, T6 temper", "7075 aluminium sheet and plate, T6 temper", "7075-Aluminiumblech und -platte, Zustand T6", "Листы и плиты из алюминия 7075, состояние T6", "7075 铝合金薄板和厚板，T6 状态") },
      { ref: "AMS 4911", what: tx("Ti-6Al-4V levha, şerit ve plaka", "Ti-6Al-4V sheet, strip and plate", "Ti-6Al-4V-Blech, -Band und -Platte", "Листы, ленты и плиты из Ti-6Al-4V", "Ti-6Al-4V 薄板、带材和厚板") },
      { ref: "EN 10204", what: tx("Metalik ürünler için muayene belgesi türleri", "Types of inspection documents for metallic products", "Arten von Prüfbescheinigungen für metallische Erzeugnisse", "Типы документов о контроле металлической продукции", "金属产品检验文件类型") },
    ],
    relatedPosts: ["endustriyel-yuzey-islemleri-rehberi", "5-eksen-cnc-isleme-avantajlari"],
    relatedServices: ["malzeme-kutuphanesi", "havacilik-uzay"],
  },
  "dfm-tasarimdan-uretime-gecis": {
    subject: tx("İç köşe yarıçapı ve takım", "Internal corner radius and tool", "Innerer Eckenradius und Werkzeug", "Внутренний радиус угла и инструмент", "内圆角半径与刀具"),
    table: {
      caption: tx("Bir kote için üç soru", "Three questions for a dimension", "Drei Fragen zu einem Maß", "Три вопроса к одному размеру", "针对一个尺寸的三个问题"),
      headers: [tx("Soru", "Question", "Frage", "Вопрос", "问题"), tx("Cevap", "Answer", "Antwort", "Ответ", "答案"), tx("Teknik resimde", "On the drawing", "In der Zeichnung", "На чертеже", "图纸标注")],
      rows: [
        [tx("Bu kotenin montajda işlevi var mı?", "Does this dimension have a function in the assembly?", "Hat dieses Maß eine Funktion in der Baugruppe?", "Выполняет ли этот размер функцию в сборке?", "该尺寸在装配中是否有功能？"), tx("Hayır", "No", "Nein", "Нет", "否"), tx("Genel tolerans sınıfı", "General tolerance class", "Allgemeintoleranzklasse", "Класс общих допусков", "一般公差等级")],
        [tx("Hangi yüzeye göre çalışıyor?", "Which surface does it work against?", "Auf welche Fläche bezieht es sich?", "Относительно какой поверхности он работает?", "它相对于哪个表面起作用？"), tx("Belli", "Known", "Bekannt", "Известна", "已知"), tx("Datuma bağlı geometrik tolerans", "Geometric tolerance to a datum", "Geometrische Toleranz mit Bezug", "Геометрический допуск относительно базы", "相对基准的几何公差")],
        [tx("Dar tolerans neyi korur?", "What does the tight tolerance protect?", "Was sichert die enge Toleranz?", "Что обеспечивает жёсткий допуск?", "严格公差保证的是什么？"), tx("Geçme veya sızdırmazlık", "A fit or a seal", "Eine Passung oder Abdichtung", "Посадку или уплотнение", "配合或密封"), tx("Kritik kote olarak işaretle", "Mark as a critical dimension", "Als kritisches Maß kennzeichnen", "Отметить как критичный размер", "标记为关键尺寸")],
      ],
    },
    sources: [
      { ref: "ISO 2768-1", what: tx("Ayrı tolerans verilmemiş ölçüler için genel toleranslar", "General tolerances for dimensions without individual tolerances", "Allgemeintoleranzen für Maße ohne einzelne Toleranzeintragung", "Общие допуски на размеры без индивидуальных допусков", "无单独公差标注尺寸的一般公差") },
      { ref: "ISO 8015", what: tx("Geometrik ürün spesifikasyonunun temel kavramları", "Fundamental concepts of geometrical product specification", "Grundlagen der geometrischen Produktspezifikation", "Основные понятия геометрических характеристик изделий", "产品几何技术规范的基本概念") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing", "Geometrische Tolerierung", "Геометрические допуски", "几何公差") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["tasarim-rehberi-dfm", "tolerans-hassasiyet"],
  },
  "cnc-torna-frezeleme-farki": {
    subject: tx("Aynı geometride tornalama ve frezeleme", "Turning and milling on the same geometry", "Drehen und Fräsen an derselben Geometrie", "Токарная и фрезерная обработка одной геометрии", "同一几何形状上的车削与铣削"),
    table: {
      caption: tx("Özellik ve doğal yöntem", "Feature and natural method", "Merkmal und naheliegendes Verfahren", "Элемент и предпочтительный метод", "特征与首选工艺"),
      headers: [tx("Özellik", "Feature", "Merkmal", "Элемент", "特征"), tx("Doğal yöntem", "Natural method", "Naheliegendes Verfahren", "Предпочтительный метод", "首选工艺"), tx("Neden", "Why", "Warum", "Почему", "原因")],
      rows: [
        [tx("Eş eksenli çaplar", "Concentric diameters", "Koaxiale Durchmesser", "Соосные диаметры", "同轴直径"), tx("Tornalama", "Turning", "Drehen", "Токарная обработка", "车削"), tx("Aynı bağlamada birbirine referanslı", "Referenced to each other in one clamping", "In einer Aufspannung aufeinander bezogen", "Связаны друг с другом в одном установе", "一次装夹中互为基准")],
        [tx("Düzlem ve cep", "Flat and pocket", "Ebene und Tasche", "Плоскость и карман", "平面与型腔"), tx("Frezeleme", "Milling", "Fräsen", "Фрезерная обработка", "铣削"), tx("Döner takım, sabit parça", "Rotating tool, stationary part", "Rotierendes Werkzeug, stehendes Teil", "Вращающийся инструмент, неподвижная деталь", "旋转刀具，固定零件")],
        [tx("Eksene dik delik grubu", "Hole pattern across the axis", "Bohrbild quer zur Achse", "Группа отверстий поперёк оси", "垂直于轴线的孔组"), tx("Frezeleme veya tahrikli takım", "Milling or driven tools", "Fräsen oder angetriebene Werkzeuge", "Фрезерование или приводной инструмент", "铣削或动力刀具"), tx("İkinci operasyon ilkinin yüzeyine bağlanır", "The second operation references the first's surface", "Die zweite Operation bezieht sich auf die Fläche der ersten", "Вторая операция базируется на поверхности первой", "第二道工序以第一道工序的表面为基准")],
      ],
    },
    sources: [
      { ref: "ISO 1101", what: tx("Eş eksenlilik ve salgı toleransları", "Concentricity and run-out tolerances", "Koaxialitäts- und Lauftoleranzen", "Допуски соосности и биения", "同轴度与跳动公差") },
      { ref: "ISO 2768-2", what: tx("Geometrik özellikler için genel toleranslar", "General tolerances for geometrical features", "Allgemeintoleranzen für geometrische Merkmale", "Общие допуски на геометрические элементы", "几何要素的一般公差") },
    ],
    relatedPosts: ["5-eksen-cnc-isleme-avantajlari", "kalite-kontrol-cmm-olcum"],
    relatedServices: ["cnc-tornalama", "cnc-frezeleme"],
  },
  "kalite-kontrol-cmm-olcum": {
    subject: tx("Datum kurgusu ve problama noktaları", "Datum set-up and probing points", "Bezugssystem und Antastpunkte", "Схема баз и точки ощупывания", "基准设置与探测点"),
    table: {
      caption: tx("Örnek kontrol planı (demo)", "Example control plan (demo)", "Beispielhafter Prüfplan (Demo)", "Пример плана контроля (демо)", "检验计划示例（演示）"),
      note: tx("Bu tablo bir şablondur; gerçek bir ölçüm raporu veya müşteri işi değildir. Sizin işinizin planı teknik resminize göre kurulur.", "This table is a template; it is not a real measurement report or a customer job. The plan for your job is built from your drawing.", "Diese Tabelle ist eine Vorlage; sie ist kein echtes Messprotokoll und kein Kundenauftrag. Der Plan für Ihren Auftrag wird anhand Ihrer Zeichnung erstellt.", "Эта таблица — шаблон; это не реальный протокол измерений и не заказ клиента. План для вашего заказа составляется по вашему чертежу.", "本表为模板，并非真实的测量报告或客户订单。您的订单计划将依据您的图纸制定。"),
      headers: [tx("Özellik", "Feature", "Merkmal", "Параметр", "特征"), tx("Yöntem", "Method", "Methode", "Метод", "方法"), tx("Kayıt", "Record", "Nachweis", "Протокол", "记录")],
      rows: [
        [tx("Datum A düzlemi", "Datum A plane", "Bezugsebene A", "Базовая плоскость A", "基准 A 平面"), tx("CMM, düzlemsellik", "CMM, flatness", "KMG, Ebenheit", "КИМ, плоскостность", "三坐标，平面度"), tx("Ölçüm kaydı", "Measurement record", "Messprotokoll", "Протокол измерений", "测量记录")],
        [tx("Delik konumu (A-B)", "Hole position (A-B)", "Bohrungsposition (A-B)", "Позиция отверстия (A-B)", "孔位置（A-B）"), tx("CMM, konum", "CMM, position", "KMG, Position", "КИМ, позиция", "三坐标，位置度"), tx("Ölçüm kaydı", "Measurement record", "Messprotokoll", "Протокол измерений", "测量记录")],
        [tx("Delik çapı", "Hole diameter", "Bohrungsdurchmesser", "Диаметр отверстия", "孔径"), tx("Ara kontrol", "In-process check", "Zwischenprüfung", "Промежуточный контроль", "过程检验"), tx("Operasyon kaydı", "Operation record", "Arbeitsgangprotokoll", "Протокол операции", "工序记录")],
      ],
    },
    sources: [
      { ref: "ISO 10360-2", what: tx("Koordinat ölçüm makinelerinin kabul ve yeniden doğrulama testleri", "Acceptance and reverification tests for coordinate measuring machines", "Annahme- und Bestätigungsprüfungen für Koordinatenmessgeräte", "Приёмочные испытания и перепроверка координатно-измерительных машин", "三坐标测量机的验收检测和复检检测") },
      { ref: "ISO 5459", what: tx("Datumlar ve datum sistemleri", "Datums and datum systems", "Bezüge und Bezugssysteme", "Базы и системы баз", "基准和基准体系") },
      { ref: "ISO 1101", what: tx("Geometrik toleranslar", "Geometrical tolerancing", "Geometrische Tolerierung", "Геометрические допуски", "几何公差") },
    ],
    relatedPosts: ["dfm-tasarimdan-uretime-gecis", "cnc-torna-frezeleme-farki"],
    relatedServices: ["kalite-kontrol", "tolerans-hassasiyet"],
  },
  "endustriyel-yuzey-islemleri-rehberi": {
    subject: tx("İşlemin yüzey ölçüsüne etkisi", "The effect of the treatment on surface size", "Einfluss der Behandlung auf das Oberflächenmaß", "Влияние обработки на размер поверхности", "处理对表面尺寸的影响"),
    table: {
      caption: tx("Şartnamede ne yazmalı", "What the specification should state", "Was in der Spezifikation stehen sollte", "Что указать в спецификации", "技术规范中应注明什么"),
      headers: [tx("İşlem", "Treatment", "Behandlung", "Обработка", "工艺"), tx("Ölçüye etkisi", "Effect on size", "Maßeinfluss", "Влияние на размер", "尺寸影响"), tx("Şartnamede", "In the specification", "In der Spezifikation", "В спецификации", "规范中注明")],
      rows: [
        [tx("Anodizasyon", "Anodising", "Eloxieren", "Анодирование", "阳极氧化"), tx("Artar; bir kısmı içe nüfuz eder", "Increases; part penetrates inward", "Nimmt zu; ein Teil wächst nach innen", "Увеличивается; часть слоя растёт внутрь", "增大；部分向内渗入"), tx("MIL-A-8625 tip ve sınıf, kalınlık", "MIL-A-8625 type and class, thickness", "MIL-A-8625 Typ und Klasse, Schichtdicke", "MIL-A-8625: тип и класс, толщина", "MIL-A-8625 类型与等级、厚度")],
        [tx("Pasivasyon", "Passivation", "Passivieren", "Пассивация", "钝化"), tx("Ölçülebilir değişim yok", "No measurable change", "Keine messbare Änderung", "Измеримых изменений нет", "无可测变化"), tx("ASTM A967 yöntemi", "ASTM A967 method", "Verfahren nach ASTM A967", "Метод по ASTM A967", "ASTM A967 方法")],
        [tx("Toz boya", "Powder coating", "Pulverbeschichtung", "Порошковая окраска", "粉末喷涂"), tx("Kalınlığı kadar artar", "Increases by its thickness", "Nimmt um die Schichtdicke zu", "Увеличивается на толщину покрытия", "按涂层厚度增大"), tx("Ön işlem, kalınlık, maskeleme", "Pretreatment, thickness, masking", "Vorbehandlung, Schichtdicke, Abdeckung", "Подготовка поверхности, толщина, маскирование", "前处理、厚度、遮蔽")],
        [tx("Elektropolisaj", "Electropolishing", "Elektropolieren", "Электрополирование", "电解抛光"), tx("Azalır", "Decreases", "Nimmt ab", "Уменьшается", "减小"), tx("Hedef Ra ve kaldırılacak pay", "Target Ra and removal allowance", "Ziel-Ra und Abtragszugabe", "Целевое Ra и припуск на съём", "目标 Ra 及去除余量")],
      ],
    },
    sources: [
      { ref: "MIL-A-8625", what: tx("Alüminyum ve alaşımları için anodik kaplamalar", "Anodic coatings for aluminium and aluminium alloys", "Anodische Beschichtungen für Aluminium und Aluminiumlegierungen", "Анодные покрытия для алюминия и алюминиевых сплавов", "铝及铝合金的阳极氧化膜") },
      { ref: "ASTM A967", what: tx("Paslanmaz çelik parçalar için kimyasal pasivasyon işlemleri", "Chemical passivation treatments for stainless steel parts", "Chemische Passivierung von Edelstahlteilen", "Химическая пассивация деталей из нержавеющей стали", "不锈钢零件的化学钝化处理") },
      { ref: "ISO 21920-2", what: tx("Yüzey dokusu: profil parametreleri (Ra)", "Surface texture: profile parameters (Ra)", "Oberflächenbeschaffenheit: Profilparameter (Ra)", "Структура поверхности: параметры профиля (Ra)", "表面结构：轮廓参数（Ra）") },
    ],
    relatedPosts: ["havacilik-parcalarinda-malzeme-secimi", "dfm-tasarimdan-uretime-gecis"],
    relatedServices: ["anodizasyon", "yuzey-islemleri-muhendislik"],
  },
};

/* UX05 — one engineering problem per capability profile. */
export const PROFILE_SUBJECTS: Record<string, Text> = {
  "ince-cidarli-govde": tx("İnce cidar: bağlama ve serbest bırakma", "Thin wall: clamping and release", "Dünne Wand: Spannen und Entspannen", "Тонкая стенка: закрепление и раскрепление", "薄壁：装夹与松开"),
  "titanyum-baglanti-parcasi": tx("Titanyum: proses ve ara kontrol", "Titanium: process and in-process check", "Titan: Prozess und Zwischenprüfung", "Титан: процесс и промежуточный контроль", "钛：工艺与过程检验"),
  "hassas-mil": tx("Mil: datum ve salgı kurulumu", "Shaft: datum and run-out set-up", "Welle: Bezugssystem und Rundlauf", "Вал: база и схема контроля биения", "轴：基准与跳动检测设置"),
};
