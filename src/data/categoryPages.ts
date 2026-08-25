export interface CategoryPageData {
  slug: string;
  prefix: "hizmetler" | "kabiliyetler" | "endustriyel";
  title: string;
  description: string;
  links: { label: string; path: string; description: string }[];
}

export const categoryPages: CategoryPageData[] = [
  // ── Hizmetler ──
  {
    slug: "talasli-imalat",
    prefix: "hizmetler",
    title: "Talaşlı İmalat",
    description: "CNC frezeleme, tornalama ve hassas mikro işleme ile yüksek toleranslı üretim çözümleri.",
    links: [
      { label: "CNC Frezeleme", path: "/hizmetler/cnc-frezeleme", description: "3, 4 ve 5 eksenli CNC frezeleme ile ±0.005mm hassasiyette üretim." },
      { label: "CNC Tornalama", path: "/hizmetler/cnc-tornalama", description: "Çok eksenli torna merkezleri ile mil, somun ve karmaşık döner parçalar." },
      { label: "Hassas Mikro İşleme", path: "/hizmetler/hassas-mikro-isleme", description: "±0.002mm tolerans, Ø0.1mm takımlarla mikro frezeleme ve tornalama." },
      { label: "Derin Delik & Raybalama", path: "/hizmetler/derin-delik-raybalama", description: "Derin delik delme ve raybalama ile hassas delik geometrileri." },
    ],
  },
  {
    slug: "on-uretim",
    prefix: "hizmetler",
    title: "Ön Üretim",
    description: "Kalıp, döküm ve prototip üretim süreçleri ile ürün geliştirme aşamasında kapsamlı destek.",
    links: [
      { label: "Enjeksiyon Kalıbı", path: "/hizmetler/enjeksiyon-kalibi", description: "Plastik enjeksiyon kalıp tasarımı ve imalatı." },
      { label: "Basınçlı Döküm", path: "/hizmetler/basinçli-dokum", description: "Alüminyum ve çinko alaşımlı basınçlı döküm üretimi." },
      { label: "Silikon Kalıplama", path: "/hizmetler/silikon-kaliplama", description: "Esnek ve dayanıklı silikon parça üretimi." },
      { label: "Fikstür & Aparat Tasarımı", path: "/hizmetler/fikstur-aparat-tasarimi", description: "Özel fikstür ve aparat tasarımı ile üretim verimliliği." },
    ],
  },
  {
    slug: "yuzey-islemleri",
    prefix: "hizmetler",
    title: "Yüzey İşlemleri",
    description: "Anodizasyon, boya, kaplama ve kimyasal işlemler ile parçalarınıza üstün yüzey kalitesi.",
    links: [
      { label: "Mekanik Yüzey İşlemleri", path: "/hizmetler/mekanik-yuzey-islemleri", description: "Kumlama, polisaj ve taşlama ile yüzey hazırlığı." },
      { label: "Anodizasyon", path: "/hizmetler/anodizasyon", description: "Alüminyum parçalara korozyon direnci ve estetik görünüm." },
      { label: "Kimyasal İşlemler", path: "/hizmetler/kimyasal-islemler", description: "Pasivizasyon, fosfatlama ve kimyasal kaplama." },
      { label: "Boya & Koruyucu Kaplamalar", path: "/hizmetler/boya-koruyucu-kaplamalar", description: "Toz boya, astar ve özel kaplama çözümleri." },
    ],
  },
  {
    slug: "isaretleme-tanimlama",
    prefix: "hizmetler",
    title: "İşaretleme & Tanımlama",
    description: "Lazer kazıma, QR kodları ve markalama ile parça izlenebilirliği ve tanımlama çözümleri.",
    links: [
      { label: "Lazer Kazıma", path: "/hizmetler/lazer-kazima", description: "Kalıcı lazer işaretleme ile parça tanımlama." },
      { label: "Tavlama", path: "/hizmetler/tavlama", description: "Lazer tavlama ile renk değişimi bazlı işaretleme." },
      { label: "QR & DataMatrix Kodları", path: "/hizmetler/qr-datamatrix-kodlari", description: "Endüstriyel standartlarda 2D kod uygulamaları." },
      { label: "Logo & Markalama", path: "/hizmetler/logo-markalama", description: "Logo, seri numarası ve özel tasarım işaretleme." },
    ],
  },
  {
    slug: "montaj-birlestirme",
    prefix: "hizmetler",
    title: "Montaj & Birleştirme",
    description: "Insert uygulama, mekanik montaj, kitting ve kaynaklı imalat ile komple üretim çözümleri.",
    links: [
      { label: "Insert Uygulama", path: "/hizmetler/insert-uygulama", description: "Ultrasonik ve ısıl insert yerleştirme." },
      { label: "Mekanik Montaj", path: "/hizmetler/mekanik-montaj", description: "Alt montaj ve komple ürün montajı." },
      { label: "Kitting & Paketleme", path: "/hizmetler/kitting-paketleme", description: "Kit hazırlama ve özel paketleme çözümleri." },
      { label: "Kaynaklı İmalat", path: "/hizmetler/kaynakli-imalat", description: "TIG, MIG ve lazer kaynak uygulamaları." },
    ],
  },
  // ── Kabiliyetler ──
  {
    slug: "uretim-altyapisi",
    prefix: "kabiliyetler",
    title: "Üretim Altyapısı",
    description: "Son teknoloji CNC tezgahları, ölçüm cihazları ve geniş malzeme kütüphanesi.",
    links: [
      { label: "Makine Parkuru", path: "/kabiliyetler/makine-parkuru", description: "DMG MORI, Mazak, Haas CNC tezgah filosu." },
      { label: "Malzeme Kütüphanesi", path: "/malzemeler", description: "50+ malzeme ve alaşım seçeneği ile kapsamlı kütüphane." },
    ],
  },
  {
    slug: "kalite-standartlar",
    prefix: "kabiliyetler",
    title: "Kalite & Standartlar",
    description: "ISO 9001, AS9100D sertifikalı kalite kontrol süreçleri ve hassas ölçüm sistemleri.",
    links: [
      { label: "Kalite Kontrol", path: "/kabiliyetler/kalite-kontrol", description: "CMM, optik ve yüzey ölçüm sistemleri." },
      { label: "Tolerans & Hassasiyet", path: "/kabiliyetler/tolerans-hassasiyet", description: "±0.005mm hassasiyette üretim ve ölçüm." },
    ],
  },
  {
    slug: "muhendislik-destegi",
    prefix: "kabiliyetler",
    title: "Mühendislik Desteği",
    description: "DFM analizi, tasarım optimizasyonu ve yüzey işlemleri konusunda uzman mühendislik danışmanlığı.",
    links: [
      { label: "Tasarım Rehberi (DFM)", path: "/kabiliyetler/tasarim-rehberi-dfm", description: "Üretilebilirlik analizi ve tasarım optimizasyonu." },
      { label: "Yüzey İşlemleri", path: "/kabiliyetler/yuzey-islemleri-muhendislik", description: "Mühendislik perspektifinden yüzey seçimi ve uygulaması." },
    ],
  },
  {
    slug: "prototipten-seri-uretime",
    prefix: "kabiliyetler",
    title: "Prototipten Seri Üretime",
    description: "Tek parçadan binlerce adede kadar esnek üretim kapasitesi.",
    links: [
      { label: "Düşük Hacimli Üretim", path: "/kabiliyetler/dusuk-hacimli-uretim", description: "1-100 adet prototip ve küçük seri üretim." },
      { label: "Seri İmalat", path: "/kabiliyetler/seri-imalat", description: "1000+ adet seri üretim kapasitesi." },
    ],
  },
  {
    slug: "surec-operasyon",
    prefix: "kabiliyetler",
    title: "Süreç & Operasyon",
    description: "Proje yönetimi, tedarik zinciri ve operasyonel verimlilik ile kusursuz üretim süreci.",
    links: [
      { label: "Proje Yönetimi", path: "/kabiliyetler/proje-yonetimi", description: "Uçtan uca proje koordinasyonu ve raporlama." },
      { label: "Tedarik Zinciri", path: "/kabiliyetler/tedarik-zinciri", description: "Sertifikalı tedarikçi ağı ve malzeme yönetimi." },
      { label: "Operasyonel Verimlilik", path: "/kabiliyetler/operasyonel-verimlilik", description: "Yalın üretim ve sürekli iyileştirme." },
    ],
  },
  // ── Endüstriyel ──
  {
    slug: "yuksek-teknoloji",
    prefix: "endustriyel",
    title: "Yüksek Teknoloji",
    description: "Havacılık, savunma ve robotik gibi kritik sektörlere yönelik yüksek hassasiyetli üretim.",
    links: [
      { label: "Havacılık & Uzay", path: "/endustriyel/havacilik-uzay", description: "AS9100D sertifikalı havacılık parça üretimi." },
      { label: "Savunma Sanayi", path: "/endustriyel/savunma-sanayi", description: "Askeri standartlarda hassas üretim." },
      { label: "Robotik", path: "/endustriyel/robotik", description: "Robot bileşenleri ve otomasyon parçaları." },
    ],
  },
  {
    slug: "seri-uretim-endustriyel",
    prefix: "endustriyel",
    title: "Seri Üretim",
    description: "Otomotiv, medikal ve denizcilik sektörlerine yönelik yüksek hacimli üretim çözümleri.",
    links: [
      { label: "Otomotiv", path: "/endustriyel/otomotiv", description: "IATF 16949 sertifikalı otomotiv parça üretimi." },
      { label: "Medikal", path: "/endustriyel/medikal", description: "ISO 13485 uyumlu medikal cihaz ve implant üretimi." },
      { label: "Yelken & Yat Sistemleri", path: "/endustriyel/yelken-yat-sistemleri", description: "Denizcilik sektörüne özel korozyona dayanıklı parçalar." },
    ],
  },
  {
    slug: "endustriyel-sistemler",
    prefix: "endustriyel",
    title: "Endüstriyel Sistemler",
    description: "Hidrolik, pnömatik, boru bağlantı ve iklim teknolojileri için endüstriyel parça üretimi.",
    links: [
      { label: "Hidrolik & Pnömatik", path: "/endustriyel/hidrolik-pnomatik", description: "Yüksek basınç dayanımlı hidrolik ve pnömatik bileşenler." },
      { label: "Boru & Bağlantı Parçaları", path: "/endustriyel/boru-baglanti-parcalari", description: "Flanş, nipel ve özel bağlantı elemanları." },
      { label: "İklim Teknolojileri", path: "/endustriyel/iklim-teknolojileri", description: "HVAC ve soğutma sistemleri bileşenleri." },
    ],
  },
  {
    slug: "uretim-cozumleri",
    prefix: "endustriyel",
    title: "Üretim Çözümleri",
    description: "Prototipten seri üretime, küçük partilerden büyük siparişlere esnek üretim.",
    links: [
      { label: "Prototip Üretim", path: "/endustriyel/prototip-uretim", description: "Hızlı prototipleme ile ürün doğrulama." },
      { label: "Küçük Seri", path: "/endustriyel/kucuk-seri", description: "10-100 adet küçük parti üretim." },
      { label: "Seri Üretim", path: "/endustriyel/seri-uretim", description: "1000+ adet yüksek hacimli üretim." },
      { label: "Özel Projeler", path: "/endustriyel/ozel-projeler", description: "Müşteriye özel mühendislik çözümleri." },
    ],
  },
  {
    slug: "enerji-altyapi",
    prefix: "endustriyel",
    title: "Enerji & Altyapı",
    description: "Yenilenebilir enerji, petrol-gaz ve güç dağıtım sistemleri için endüstriyel üretim.",
    links: [
      { label: "Yenilenebilir Enerji", path: "/endustriyel/yenilenebilir-enerji", description: "Rüzgar türbini ve solar panel bileşenleri." },
      { label: "Petrol & Gaz", path: "/endustriyel/petrol-gaz", description: "Yüksek basınç ve sıcaklık dayanımlı parçalar." },
      { label: "Güç Dağıtım Sistemleri", path: "/endustriyel/guc-dagitim-sistemleri", description: "Enerji iletim ve dağıtım ekipmanları." },
      { label: "Madencilik Ekipmanları", path: "/endustriyel/madencilik-ekipmanlari", description: "Aşınmaya dayanıklı madencilik parçaları." },
    ],
  },
];
