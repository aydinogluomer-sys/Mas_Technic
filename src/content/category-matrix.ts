/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY DECISION MATRIX (PAGE01)

   Three readable columns per category: the reader's need → the process or
   scope page that answers it → the record that starts the conversation.
   No numeric threshold appears here: capacity figures are not approved
   (owner input O02), so the matrix routes by need, not by number.
   Keys are `${prefix}/${slug}` as in `src/data/categoryPages.ts`.
   ══════════════════════════════════════════════════════════════════════════ */

type Text = { tr: string; en: string };
export interface MatrixRow { need: Text; slug: string; next: Text }

const DRAWING: Text = { tr: "Teknik resim veya 3B model", en: "Technical drawing or 3D model" };
const SPEC: Text = { tr: "Kaplama / işlem şartnamesi", en: "Coating / process specification" };
const PLAN: Text = { tr: "Kontrol planı taslağı", en: "Draft control plan" };

const row = (tr: string, en: string, slug: string, next: Text): MatrixRow => ({ need: { tr, en }, slug, next });

export const CATEGORY_MATRIX: Record<string, readonly MatrixRow[]> = {
  "hizmetler/talasli-imalat": [
    row("Prizmatik parça, birden fazla yüzde özellik", "Prismatic part, features on several faces", "cnc-frezeleme", DRAWING),
    row("Dönel parça, eş eksenli çaplar", "Rotational part, concentric diameters", "cnc-tornalama", DRAWING),
    row("Standart takımın ulaşamadığı küçük özellik", "Small features a standard tool cannot reach", "hassas-mikro-isleme", DRAWING),
    row("Boyu çapına göre uzun delik", "A hole that is long for its diameter", "derin-delik-raybalama", DRAWING),
  ],
  "hizmetler/on-uretim": [
    row("Plastik parça, seri öncesi kalıp kararı", "Plastic part, tooling decision before series", "enjeksiyon-kalibi", DRAWING),
    row("Karmaşık metal form, yüksek adet", "Complex metal form, high quantity", "basincli-dokum", DRAWING),
    row("Kısa seri veya fonksiyonel prototip", "Short run or functional prototype", "silikon-kaliplama", { tr: "Master model ve adet", en: "Master model and quantity" }),
    row("Tekrarlanabilir bağlama veya kontrol", "Repeatable clamping or inspection", "fikstur-aparat-tasarimi", { tr: "Parça modeli ve operasyon listesi", en: "Part model and operation list" }),
  ],
  "hizmetler/yuzey-islemleri": [
    row("Yüzey hazırlığı, çapak veya görünüm", "Surface preparation, burrs or appearance", "mekanik-yuzey-islemleri", SPEC),
    row("Alüminyumda korozyon ve renk", "Corrosion and colour on aluminium", "anodizasyon", SPEC),
    row("Paslanmazda pasivasyon, çelikte dönüşüm kaplaması", "Passivation on stainless, conversion coating on steel", "kimyasal-islemler", SPEC),
    row("Dış ortam veya dekoratif kaplama", "Outdoor or decorative coating", "boya-koruyucu-kaplamalar", SPEC),
  ],
  "hizmetler/isaretleme-tanimlama": [
    row("Kalıcı, okunur parça işareti", "Permanent, legible part mark", "lazer-kazima", { tr: "İşaret içeriği ve yeri", en: "Mark content and location" }),
    row("Malzeme kaldırmadan işaret", "A mark without removing material", "tavlama", { tr: "İşaret içeriği ve yüzey", en: "Mark content and surface" }),
    row("Makinece okunan seri ve lot kimliği", "Machine-read serial and lot identity", "qr-datamatrix-kodlari", { tr: "Kodlanacak veri", en: "Data to encode" }),
    row("Logo veya müşteri işareti", "Logo or customer mark", "logo-markalama", { tr: "Vektör dosya", en: "Vector file" }),
  ],
  "hizmetler/montaj-birlestirme": [
    row("Plastikte dişli bağlantı", "Threaded connection in plastic", "insert-uygulama", DRAWING),
    row("Birden fazla parçanın birleştirilmesi", "Joining several parts", "mekanik-montaj", { tr: "Montaj resmi ve parça listesi", en: "Assembly drawing and parts list" }),
    row("Kit, etiket ve koruyucu ambalaj", "Kits, labels and protective packaging", "kitting-paketleme", { tr: "Kit listesi", en: "Kit list" }),
    row("Kaynakla birleştirilen yapı", "A welded structure", "kaynakli-imalat", { tr: "Kaynak resmi ve şartname", en: "Weld drawing and specification" }),
  ],
  "kabiliyetler/uretim-altyapisi": [
    row("Hangi proses ailesinin kullanılacağı", "Which process family is used", "makine-parkuru", DRAWING),
    row("Malzeme seçimi ve karşılaştırma", "Material choice and comparison", "malzeme-kutuphanesi", { tr: "Çalışma koşulları", en: "Operating conditions" }),
  ],
  "kabiliyetler/kalite-standartlar": [
    row("Neyin, nasıl ölçüleceği", "What is measured, and how", "kalite-kontrol", PLAN),
    row("Hangi kotenin dar tolerans gerektirdiği", "Which dimension really needs a tight tolerance", "tolerans-hassasiyet", DRAWING),
  ],
  "kabiliyetler/muhendislik-destegi": [
    row("Tasarımın üretilebilirliği ve maliyeti", "Manufacturability and cost of the design", "tasarim-rehberi-dfm", DRAWING),
    row("Uygun yüzey işlemi ve ölçüye etkisi", "The right surface treatment and its effect on size", "yuzey-islemleri-muhendislik", SPEC),
  ],
  "kabiliyetler/prototipten-seri-uretime": [
    row("Az adet, hızlı doğrulama", "Low quantity, quick validation", "dusuk-hacimli-uretim", DRAWING),
    row("Tekrarlanabilir seri", "Repeatable series", "seri-imalat", PLAN),
  ],
  "kabiliyetler/surec-operasyon": [
    row("Aşamalar ve tek muhatap", "Stages and a single contact", "proje-yonetimi", { tr: "Proje kapsamı", en: "Project scope" }),
    row("Malzeme tedarik riski ve termin", "Material supply risk and lead time", "tedarik-zinciri", { tr: "Malzeme şartnamesi", en: "Material specification" }),
    row("Kurulum ve akış kayıpları", "Setup and flow losses", "operasyonel-verimlilik", { tr: "Mevcut operasyon listesi", en: "Current operation list" }),
  ],
  "endustriyel/yuksek-teknoloji": [
    row("Zor alaşım, izlenebilir üretim", "Difficult alloys, traceable production", "havacilik-uzay", { tr: "Şartname ve malzeme belgesi", en: "Specification and material document" }),
    row("Proje şartnamesine bağlı parça", "A part bound by a project specification", "savunma-sanayi", { tr: "Şartname ve veri koşulları", en: "Specification and data conditions" }),
    row("Eksen ilişkisi kritik mekanik parça", "Mechanical part where axis relationships are critical", "robotik", DRAWING),
  ],
  "endustriyel/seri-uretim-endustriyel": [
    row("Partiler arası tutarlılık", "Consistency between batches", "otomotiv", PLAN),
    row("Biyouyumlu malzeme ve izlenebilirlik", "Biocompatible material and traceability", "medikal", { tr: "Şartname ve dokümantasyon kapsamı", en: "Specification and documentation scope" }),
    row("Deniz suyu ve galvanik uyum", "Seawater and galvanic compatibility", "yelken-yat-sistemleri", { tr: "Montajdaki diğer metaller", en: "Other metals in the assembly" }),
  ],
  "endustriyel/endustriyel-sistemler": [
    row("Basınç altında akışkan, manifold", "Fluid under pressure, manifold", "hidrolik-pnomatik", { tr: "Çalışma basıncı ve conta gereksinimi", en: "Working pressure and seal requirement" }),
    row("Standart boyut tablosuna bağlı bağlantı", "A connection bound by a standard dimension table", "boru-baglanti-parcalari", { tr: "Standart ve basınç sınıfı", en: "Standard and pressure class" }),
    row("Sızdırmazlık ve soğutucu uyumu", "Sealing and refrigerant compatibility", "iklim-teknolojileri", { tr: "Sızdırmazlık şartnamesi", en: "Sealing specification" }),
  ],
  "endustriyel/uretim-cozumleri": [
    row("Tasarımı fiziksel olarak doğrulamak", "Validating the design physically", "prototip-uretim", DRAWING),
    row("Pazar testi veya pilot parti", "Market test or pilot batch", "kucuk-seri", { tr: "Adet ve teslim planı", en: "Quantity and delivery plan" }),
    row("Programlı, tekrarlanabilir teslimat", "Scheduled, repeatable delivery", "seri-uretim", PLAN),
    row("Standart dışı mühendislik işi", "Non-standard engineering work", "ozel-projeler", { tr: "Proje tanımı", en: "Project description" }),
  ],
  "endustriyel/enerji-altyapi": [
    row("Dış ortamda çalışan bileşen", "A component working outdoors", "yenilenebilir-enerji", { tr: "Ortam sınıfı ve kaplama sistemi", en: "Environment class and coating system" }),
    row("Basınç ve sıcaklık sınıfı tanımlı parça", "A part with a defined pressure and temperature class", "petrol-gaz", { tr: "Şartname ve malzeme sınıfı", en: "Specification and material class" }),
    row("İletkenlik ve kontak yüzeyi", "Conductivity and contact surface", "guc-dagitim-sistemleri", { tr: "Malzeme ve kaplama gereksinimi", en: "Material and plating requirement" }),
    row("Aşınma ve darbe altındaki parça", "A part under wear and impact", "madencilik-ekipmanlari", { tr: "Sertlik ve ısıl işlem gereksinimi", en: "Hardness and heat treatment requirement" }),
  ],
};
