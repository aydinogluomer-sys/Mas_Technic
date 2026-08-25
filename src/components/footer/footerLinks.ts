export type FooterLinkGroup = {
  title: string;
  titleHref: string | null;
  items: { label: string; href: string }[];
};

export const footerLinks: FooterLinkGroup[] = [
  {
    title: "Endüstriyel",
    titleHref: null,
    items: [
      { label: "Yüksek Teknoloji", href: "/endustriyel/kategori/yuksek-teknoloji" },
      { label: "Seri Üretim", href: "/endustriyel/kategori/seri-uretim" },
      { label: "Endüstriyel Sistemler", href: "/endustriyel/kategori/endustriyel-sistemler" },
      { label: "Üretim Çözümleri", href: "/endustriyel/kategori/uretim-cozumleri" },
      { label: "Enerji & Altyapı", href: "/endustriyel/kategori/enerji-altyapi" },
    ],
  },
  {
    title: "Kabiliyetler",
    titleHref: null,
    items: [
      { label: "Üretim Altyapısı", href: "/kabiliyetler/kategori/uretim-altyapisi" },
      { label: "Kalite & Standartlar", href: "/kabiliyetler/kategori/kalite-standartlar" },
      { label: "Mühendislik Desteği", href: "/kabiliyetler/kategori/muhendislik-destegi" },
      { label: "Prototipten Seri Üretime", href: "/kabiliyetler/kategori/prototipten-seri-uretime" },
      { label: "Süreç & Operasyon", href: "/kabiliyetler/kategori/surec-operasyon" },
    ],
  },
  {
    title: "Hizmetler",
    titleHref: null,
    items: [
      { label: "Talaşlı İmalat", href: "/hizmetler/kategori/talasli-imalat" },
      { label: "Ön Üretim", href: "/hizmetler/kategori/on-uretim" },
      { label: "Yüzey İşlemleri", href: "/hizmetler/kategori/yuzey-islemleri" },
      { label: "İşaretleme & Tanımlama", href: "/hizmetler/kategori/isaretleme-tanimlama" },
      { label: "Montaj & Birleştirme", href: "/hizmetler/kategori/montaj-birlestirme" },
    ],
  },
  {
    title: "Kurumsal & Destek",
    titleHref: null,
    items: [
      { label: "Ana Sayfa", href: "/" },
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Teklif & Üretim Süreci", href: "/#hizmetler" },
      { label: "Teknik Kapsam", href: "/#kabiliyetler" },
      { label: "Tedarik Zinciri", href: "/kabiliyetler/tedarik-zinciri" },
      { label: "Kalite Kontrol", href: "/kabiliyetler/kalite-kontrol" },
      { label: "SSS", href: "/sss" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
];
