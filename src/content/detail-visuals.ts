/* ══════════════════════════════════════════════════════════════════════════
   DETAIL-PAGE VISUAL MANIFEST (IMG01)

   One explicit entry per detail page (48). There is no automatic fallback:
   a slug without an entry fails `e2e/p4-visuals-modules.spec.ts`.

   · `photo`  — an existing repository image (`src/assets`). These are
     generated / stock renders, not MAS photographs (`reports/10/
     asset-inventory.md` §4), so the caption describes the subject and never
     claims the facility, a machine or a person as MAS's own
     (`USER_INPUTS.md` §I). Reused on at most two sector pages; every
     reuse names its reason in `shared`.
   · `schema` — an original code-drawn schema (`src/components/schemas`),
     captioned "Temsili mühendislik şeması". It shows relationships only:
     no measured value, tolerance figure or test result.

   `subject` is the page subject the contract assigns (TR / EN); it is the
   plate caption.
   ══════════════════════════════════════════════════════════════════════════ */
import type { SectorSchemaKey } from "@/components/schemas/registry";

type Text = { tr: string; en: string; de: string; ru: string };

export type PhotoAsset =
  | "hero-cnc-frezeleme" | "hero-cnc-tornalama" | "hero-mikro-isleme" | "hero-derin-delik"
  | "hero-enjeksiyon-kalibi" | "hero-basincli-dokum" | "hero-silikon-kaliplama" | "hero-fikstur-aparat"
  | "hero-mekanik-yuzey" | "hero-anodizasyon" | "hero-boya-kaplama" | "hero-lazer-kazima"
  | "hero-qr-datamatrix" | "hero-logo-markalama" | "hero-insert-uygulama" | "hero-kitting-paketleme"
  | "hero-kaynakli-imalat" | "hero-cnc" | "hero-malzeme-kutuphanesi" | "quality-control"
  | "hero-tolerans-hassasiyet" | "blog-dfm" | "hero-yuzey-islemleri" | "hero-seri-uretim"
  | "hero-proje-yonetimi" | "hero-tedarik-zinciri" | "hero-havacilik"
  /* R1: the sector photographs the landing's sector track already uses
     (1200×1200; hvac, renewable and mining cropped free of staff). */
  | "industry-robotics" | "industry-automotive" | "industry-hydraulic" | "industry-piping"
  | "industry-hvac" | "industry-renewable" | "industry-oilgas" | "industry-power" | "industry-mining";

export type DetailVisual =
  | {
      kind: "photo";
      asset: PhotoAsset;
      subject: Text;
      sourceKind: "repo-render";
      permissionRef: string;
      /** `object-position` for the 375 window (`reports/10/art-direction.md`). */
      crop?: string;
      /** Why this asset appears on another page too. */
      shared?: string;
    }
  | {
      kind: "schema";
      schema: SectorSchemaKey;
      subject: Text;
      sourceKind: "code-schema";
      permissionRef: string;
      /** R1 (owner, 5 Oct): the sector's own photograph above the schema.
       *  Only a photograph of the page's subject with no person in it. */
      photo?: { asset: PhotoAsset; subject: Text };
    };

const REPO = "USER_INPUTS.md §I PROJECT_PHOTOS: USE_REPO";
const CODE = "Özgün kod çizimi, IMG01 (izin gerekmez)";

const photo = (asset: PhotoAsset, tr: string, en: string, de: string, ru: string, extra: Partial<Extract<DetailVisual, { kind: "photo" }>> = {}): DetailVisual =>
  ({ kind: "photo", asset, subject: { tr, en, de, ru }, sourceKind: "repo-render", permissionRef: REPO, ...extra });
const schema = (key: SectorSchemaKey, tr: string, en: string, de: string, ru: string, photo?: { asset: PhotoAsset; tr: string; en: string; de: string; ru: string }): DetailVisual =>
  ({
    kind: "schema", schema: key, subject: { tr, en, de, ru }, sourceKind: "code-schema", permissionRef: CODE,
    ...(photo ? { photo: { asset: photo.asset, subject: { tr: photo.tr, en: photo.en, de: photo.de, ru: photo.ru } } } : {}),
  });

export const DETAIL_VISUALS: Record<string, DetailVisual> = {
  /* ── Hizmetler ── */
  "cnc-frezeleme": photo("hero-cnc-frezeleme", "İş milindeki freze takımı ve soğutma sıvısı", "Milling tool at the spindle under coolant", "Fräswerkzeug an der Spindel unter Kühlschmierstoff", "Фреза в шпинделе с подачей СОЖ"),
  "cnc-tornalama": photo("hero-cnc-tornalama", "Aynadaki dönen parça ve torna kalemi", "Rotating part in the chuck with the turning tool", "Rotierendes Werkstück im Futter mit Drehmeißel", "Вращающаяся деталь в патроне и токарный резец"),
  "hassas-mikro-isleme": photo("hero-mikro-isleme", "Küçük bir blok üzerinde mikro takım", "Micro tool over a small block", "Mikrowerkzeug über einem kleinen Block", "Микроинструмент над небольшим блоком"),
  "derin-delik-raybalama": photo("hero-derin-delik", "Derin delik matkabı ve soğutma sıvısı", "Deep-hole drill under coolant", "Tieflochbohrer unter Kühlschmierstoff", "Сверло для глубоких отверстий с подачей СОЖ"),
  "enjeksiyon-kalibi": photo("hero-enjeksiyon-kalibi", "Enjeksiyon kalıbının boşluğu", "Injection mould cavity", "Kavität eines Spritzgießwerkzeugs", "Гнездо литьевой пресс-формы"),
  "basincli-dokum": photo("hero-basincli-dokum", "Preste basınçlı döküm kalıp yarısı", "Die-casting die half in the press", "Druckgusswerkzeughälfte in der Presse", "Полуформа для литья под давлением в прессе"),
  "silikon-kaliplama": photo("hero-silikon-kaliplama", "Silikon kalıp ve dökülen parça", "Silicone mould and a cast part", "Silikonform und gegossenes Teil", "Силиконовая форма и отлитая деталь"),
  "fikstur-aparat-tasarimi": photo("hero-fikstur-aparat", "Tezgâh tablasına bağlanmış fikstür", "Fixture clamped on a machine table", "Auf einem Maschinentisch gespannte Vorrichtung", "Приспособление, закреплённое на столе станка"),
  "mekanik-yuzey-islemleri": photo("hero-mekanik-yuzey", "Kumlama memesi ve parça yüzeyi", "Blasting nozzle and part surface", "Strahldüse und Bauteiloberfläche", "Сопло для пескоструйной обработки и поверхность детали"),
  "anodizasyon": photo("hero-anodizasyon", "Askıda eloksallanmış parçalar", "Anodised parts on a rack", "Eloxierte Teile am Gestell", "Анодированные детали на подвеске", {
    shared: "kimyasal-islemler ile: iki proses aynı askı ve banyo düzeniyle yürür; görsel banyo çıkışını gösterir.",
  }),
  "kimyasal-islemler": photo("hero-anodizasyon", "Banyodan çıkan askıdaki parçalar", "Racked parts leaving the bath", "Teile am Gestell beim Verlassen des Bades", "Детали на подвеске при выходе из ванны", {
    shared: "anodizasyon ile: aynı askı ve banyo düzeni; kimyasal işlemler için ayrı, konuya uygun görsel yok.",
  }),
  "boya-koruyucu-kaplamalar": photo("hero-boya-kaplama", "Braket üzerinde toz boya sisi", "Coating mist over a bracket", "Beschichtungsnebel über einer Halterung", "Облако порошковой краски над кронштейном"),
  "lazer-kazima": photo("hero-lazer-kazima", "Silindir alnında lazer işaretleme", "Laser marking on a cylinder end", "Laserkennzeichnung an einer Zylinderstirnseite", "Лазерная маркировка на торце цилиндра"),
  /* `hero-tavlama` is a furnace glow: it reads as heat treatment, which this
     page (laser annealing MARKING, contract §3) is not. */
  "tavlama": schema("lazer-tavlama", "Isıl renk değişimiyle markalama", "Marking by thermal colour change", "Kennzeichnung durch thermische Farbänderung", "Маркировка за счёт термического изменения цвета"),
  "qr-datamatrix-kodlari": photo("hero-qr-datamatrix", "Fırçalanmış metal üzerinde Data Matrix kodu", "Data Matrix code on brushed metal", "Data-Matrix-Code auf gebürstetem Metall", "Код Data Matrix на шлифованном металле"),
  "logo-markalama": photo("hero-logo-markalama", "Siyah parça üzerinde kazınmış işaret", "Engraved mark on a black part", "Gravierte Kennzeichnung auf einem schwarzen Teil", "Гравированная маркировка на чёрной детали"),
  "insert-uygulama": photo("hero-insert-uygulama", "Plaka üzerinde insert yerleştirme takımı", "Insert installation tool over a plate", "Setzwerkzeug für Gewindeeinsätze über einer Platte", "Инструмент для установки вставок над плитой"),
  "mekanik-montaj": schema("montaj", "Alt montaj sırası ve kontrol", "Sub-assembly sequence and inspection", "Montagefolge der Unterbaugruppe und Prüfung", "Последовательность сборки узла и контроль"),
  "kitting-paketleme": photo("hero-kitting-paketleme", "Köpük yuvalı kasada parçalar", "Parts in a foam-lined case", "Teile in einem Koffer mit Schaumstoffeinlage", "Детали в кейсе с поролоновым ложементом", { crop: "0% 50%" }),
  "kaynakli-imalat": photo("hero-kaynakli-imalat", "Flanş üzerinde TIG torcu", "TIG torch on a flange", "WIG-Brenner an einem Flansch", "Горелка TIG на фланце"),

  /* ── Kabiliyetler ── */
  "makine-parkuru": photo("hero-cnc", "İş mili ve soğutma sıvısı", "Spindle and coolant", "Spindel und Kühlschmierstoff", "Шпиндель и СОЖ"),
  "malzeme-kutuphanesi": photo("hero-malzeme-kutuphanesi", "Siyah zemin üzerinde malzeme kesitleri", "Material slugs on black", "Werkstoffabschnitte auf schwarzem Grund", "Образцы материалов на чёрном фоне"),
  "kalite-kontrol": photo("quality-control", "Koordinat ölçüm makinesinde parça", "Part on a coordinate measuring machine", "Bauteil auf einem Koordinatenmessgerät", "Деталь на координатно-измерительной машине"),
  "tolerans-hassasiyet": photo("hero-tolerans-hassasiyet", "İşlenmiş blok üzerinde kumpas çeneleri", "Calliper jaws on a machined block", "Messschnäbel eines Messschiebers an einem bearbeiteten Block", "Губки штангенциркуля на обработанном блоке", { crop: "90% 50%" }),
  "tasarim-rehberi-dfm": photo("blog-dfm", "Teknik resmi üzerinde işlenmiş parça", "Machined part on its drawing", "Bearbeitetes Teil auf seiner technischen Zeichnung", "Обработанная деталь на своём чертеже"),
  "yuzey-islemleri-muhendislik": photo("hero-yuzey-islemleri", "Kumlanmış ve fırçalanmış kenarlar", "Bead-blasted and brushed edges", "Perlgestrahlte und gebürstete Kanten", "Кромки после дробеструйной обработки и шлифования"),
  "dusuk-hacimli-uretim": schema("dusuk-hacim", "Adede ve hassasiyete göre yöntem seçimi", "Method choice by quantity and precision", "Verfahrenswahl nach Stückzahl und Genauigkeit", "Выбор метода по количеству и точности"),
  "seri-imalat": photo("hero-seri-uretim", "Sıra sıra özdeş parçalar", "Rows of identical parts", "Reihen identischer Teile", "Ряды одинаковых деталей", {
    shared: "seri-uretim ile: iki sayfanın konusu aynı (tekrarlanabilir seri); sözleşme seri görselini seri üretimde tutar.",
  }),
  "proje-yonetimi": photo("hero-proje-yonetimi", "Pano ve parça ile proje masası", "Project desk with clipboard and part", "Projekttisch mit Klemmbrett und Bauteil", "Рабочий стол проекта с планшетом и деталью"),
  "tedarik-zinciri": photo("hero-tedarik-zinciri", "Çubuk malzeme rafı", "Bar-stock rack", "Regal mit Stangenmaterial", "Стеллаж с прутковым материалом"),
  "operasyonel-verimlilik": schema("verimlilik", "Kurulum işlerinin ayrıştırılması", "Separating setup work", "Trennung der Rüstarbeiten", "Разделение наладочных работ"),

  /* ── Endüstriyel (17 sektör) ──
     R1 (owner, 5 Oct): nine sectors get their own photograph above the
     schema. Savunma, medikal and yat stay schema-only (people in the frame);
     prototip, küçük seri and özel projeler have no subject photograph. */
  "havacilik-uzay": photo("hero-havacilik", "Havacılık braketi ve kritik yüzeyleri", "Aerospace bracket and its critical surfaces", "Luftfahrt-Halterung und ihre kritischen Flächen", "Авиационный кронштейн и его критичные поверхности", { crop: "40% 50%" }),
  "savunma-sanayi": schema("savunma", "Muhafaza ve bağlantı referansı", "Housing and connection reference", "Gehäuse und Anschlussbezug", "Корпус и присоединительная база"),
  "robotik": schema("robotik", "Eklem, rulman oturması ve eksen ilişkisi", "Joint, bearing seat and axis relationship", "Gelenk, Lagersitz und Achsbezug", "Шарнир, посадочное место подшипника и связь осей",
    { asset: "industry-robotics", tr: "Robot eklem gövdesi", en: "Robot joint housing", de: "Robotergelenkgehäuse", ru: "Корпус шарнира робота" }),
  "otomotiv": schema("otomotiv", "Aynı parçada numune ve parti kontrol noktaları", "Sample and batch control points on one part", "Muster- und Losprüfpunkte an einem Teil", "Точки контроля образца и партии на одной детали",
    { asset: "industry-automotive", tr: "İşlenmiş otomotiv parçaları", en: "Machined automotive parts", de: "Bearbeitete Automobilteile", ru: "Обработанные автомобильные детали" }),
  "medikal": schema("medikal", "Bileşen yüzeyi ve izlenebilirlik", "Component surface and traceability", "Bauteiloberfläche und Rückverfolgbarkeit", "Поверхность компонента и прослеживаемость"),
  "yelken-yat-sistemleri": schema("yat", "Farklı metallerin bağlantısı ve galvanik uyum", "Joining dissimilar metals and galvanic compatibility", "Verbindung unterschiedlicher Metalle und galvanische Verträglichkeit", "Соединение разнородных металлов и гальваническая совместимость"),
  "hidrolik-pnomatik": schema("hidrolik", "Manifold kesiti, akış yolları ve temizleme", "Manifold section, flow paths and cleaning", "Steuerblock im Schnitt, Strömungskanäle und Reinigung", "Разрез распределительного блока, проточные каналы и очистка",
    { asset: "industry-hydraulic", tr: "Hidrolik manifold bloğu", en: "Hydraulic manifold block", de: "Hydraulik-Steuerblock", ru: "Гидравлический распределительный блок" }),
  "boru-baglanti-parcalari": schema("boru", "Diş, oturma ve flanş bağlantısı kesiti", "Thread, seating and flange connection section", "Gewinde, Sitz und Flanschverbindung im Schnitt", "Разрез резьбы, посадки и фланцевого соединения",
    { asset: "industry-piping", tr: "Flanşlı boru bağlantı parçaları", en: "Flanged pipe fittings", de: "Rohrverbindungsteile mit Flansch", ru: "Фланцевые фасонные детали трубопроводов" }),
  "iklim-teknolojileri": schema("iklim", "Conta, bağlantı ve sızdırmazlık özelliği", "Seal, connection and sealing feature", "Dichtung, Anschluss und Dichtmerkmal", "Уплотнение, соединение и уплотняющий элемент",
    { asset: "industry-hvac", tr: "İklim sistemi bileşenleri", en: "Climate system components", de: "Komponenten für Klimasysteme", ru: "Компоненты климатических систем" }),
  "prototip-uretim": schema("prototip", "Aynı geometrinin iki revizyonu", "Two revisions of one geometry", "Zwei Revisionen einer Geometrie", "Две ревизии одной геометрии"),
  "kucuk-seri": schema("kucuk-seri", "Lot ve parça kimliği düzeni", "Lot and part identity layout", "Anordnung der Los- und Teilekennung", "Схема идентификации партии и детали"),
  "seri-uretim": photo("hero-seri-uretim", "Sıra sıra özdeş parçalar", "Rows of identical parts", "Reihen identischer Teile", "Ряды одинаковых деталей", {
    shared: "seri-imalat ile: aynı konu; sözleşme mevcut seri görselini bu sayfada tutar.",
  }),
  "ozel-projeler": schema("ozel-proje", "Modelden teknik resme", "From model to technical drawing", "Vom Modell zur technischen Zeichnung", "От модели к чертежу"),
  "yenilenebilir-enerji": schema("yenilenebilir", "Dış ortam bağlantısı ve kaplama payı", "Outdoor connection and coating allowance", "Verbindung im Außeneinsatz und Beschichtungszugabe", "Соединение для наружной установки и припуск на покрытие",
    { asset: "industry-renewable", tr: "Büyük çaplı yatak gövdesi", en: "Large-diameter bearing housing", de: "Lagergehäuse mit großem Durchmesser", ru: "Корпус подшипника большого диаметра" }),
  "petrol-gaz": schema("petrol-gaz", "Basınçlı birleşimin kesiti", "Section of a pressure joint", "Schnitt durch eine druckführende Verbindung", "Разрез соединения, работающего под давлением",
    { asset: "industry-oilgas", tr: "Flanşlı basınç gövdesi", en: "Flanged pressure body", de: "Druckkörper mit Flansch", ru: "Фланцевый корпус, работающий под давлением" }),
  "guc-dagitim-sistemleri": schema("guc-dagitim", "Bara, kontak ve montaj kesiti", "Busbar, contact and mounting section", "Stromschiene, Kontakt und Befestigung im Schnitt", "Разрез шины, контакта и крепления",
    { asset: "industry-power", tr: "Güç ekipmanı gövde parçaları", en: "Power equipment housing parts", de: "Gehäuseteile für Energieanlagen", ru: "Детали корпусов энергетического оборудования" }),
  "madencilik-ekipmanlari": schema("madencilik", "Aşınma yüzeyi ve parça kesiti", "Wear surface and part section", "Verschleißfläche und Bauteilschnitt", "Изнашиваемая поверхность и разрез детали",
    { asset: "industry-mining", tr: "İşlenmiş büyük silindirik parça", en: "Large machined cylindrical part", de: "Großes bearbeitetes zylindrisches Teil", ru: "Крупная обработанная цилиндрическая деталь" }),
};

/** The honesty label every code-drawn schema carries (contract §3, IMG01). */
export const SCHEMA_LABEL: Text = { tr: "Temsili mühendislik şeması", en: "Representative engineering schema", de: "Beispielhaftes Konstruktionsschema", ru: "Условная конструкторская схема" };
