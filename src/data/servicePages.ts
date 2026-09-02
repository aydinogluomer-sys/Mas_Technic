export interface ComparisonTable {
  title: string;
  description?: string;
  headers: string[];
  rows: string[][];
  highlight?: number; // row index to highlight
}

export interface ServicePageData {
  slug: string;
  category: "hizmetler" | "kabiliyetler" | "endustriyel";
  categoryLabel: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  description: string;
  content: string[];
  features?: string[];
  technicalSpecs?: { label: string; value: string }[];
  heroImage?: string;
  processSteps?: string[];
  advantages?: string[];
  /* `machines` was removed in Phase 06. It published a named machine park
     across nine service pages; §D marks MACHINE_COUNT PRIVATE_DO_NOT_DISCLOSE
     and no model list was ever supplied. The field is gone from the type so
     the data cannot come back without a deliberate decision. */
  materials?: { name: string; grade: string; properties: string }[];
  faq?: { question: string; answer: string }[];
  comparisonTables?: ComparisonTable[];
}

export const servicePages: ServicePageData[] = [
  // ── Hizmetler > Talaşlı İmalat ──
  {
    slug: "cnc-frezeleme",
    category: "hizmetler",
    categoryLabel: "Talaşlı İmalat",
    title: "CNC Frezeleme",
    metaTitle: "CNC Frezeleme Hizmetleri | 5 Eksen Hassas İşleme | Mas Technic",
    metaDescription:
      "3, 4 ve 5 eksenli CNC frezeleme ile ±0.01 mm standart tolerans aralığında üretim. Alüminyum, titanyum ve çelik işleme, ücretsiz DFM analizi.",
    description:
      "5 eksenli CNC frezeleme merkezlerimiz ile karmaşık geometrileri yüksek hassasiyetle işliyoruz. Alüminyumdan titanyuma, plastikten kompozitlere kadar geniş malzeme yelpazesi.",
    heroImage: "hero-cnc-frezeleme",
    content: [
      "5 eksenli CNC freze merkezlerimizde karmaşık geometrileri tek kurulumda tamamlıyoruz. Bağlama sayısını azaltmak yalnızca süreyi kısaltmaz; her yeni bağlama ölçü zincirine yeni bir hata kaynağı eklediği için doğrudan tolerans lehine çalışır.",
      "3 eksen frezeleme ile düz yüzeyler, cep işleme ve standart geometrilerde ekonomik çözümler üretiyoruz. 4 eksen frezeleme ile döner tabla sayesinde silindirik parçalarda kanal açma, delik delme ve profil işleme yapıyoruz. 5 eksen simultane frezeleme ile tek bağlamada en karmaşık parça geometrilerini işleyerek havacılık, medikal ve otomotiv sektörünün taleplerini karşılıyoruz.",
      "Yüksek hızlı işleme (HSM) stratejileriyle ince cidarlı parçalarda kesme kuvvetini düşürüp yüzey kalitesini iyileştiriyoruz. Havacılık, otomotiv, medikal ve savunma gibi kritik sektörlerde standart çalışma aralığımız ±0.01 mm olup ulaşılabilir tolerans her parça için teknik incelemede belirlenir.",
      "Alüminyum (6061, 7075), paslanmaz çelik (304, 316), karbon çelik, titanyum, PEEK ve POM/Delrin gibi mühendislik malzemelerinde uzmanlaşmış ekibimizle hizmetinizdeyiz. Her projede DFM analizi uygulayarak maliyetleri optimize ediyor, STEP, IGES, SolidWorks, CATIA ve NX formatlarını doğrudan işleyebiliyoruz.",
    ],
    features: [
      "3 Eksen Frezeleme — Düz yüzeyler ve standart geometrilerde ekonomik çözüm",
      "4 Eksen Frezeleme — Döner tabla ile çevresel ve profil işleme",
      "5 Eksen Simultane — Tek bağlamada karmaşık geometriler",
      "Yüksek Hızlı İşleme (HSM) — 40.000 RPM, ince cidar ve üstün yüzey",
      "±0.01 mm Standart Tolerans — kontrol planıyla teyit edilir",
      "Otomatik Takım Değiştirme — uzun kesme sürelerinde kesintisiz işleme",
    ],
    technicalSpecs: [
      { label: "Maks. Parça Boyutu (3 Eksen)", value: "1500×800×600mm" },
      { label: "Maks. Parça Boyutu (5 Eksen)", value: "800×500×500mm" },
      { label: "Maks. Mil Hızı", value: "12.000-40.000 RPM" },
      { label: "Takım Kapasitesi", value: "30-120 adet (otomatik)" },
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "Yüzey Kalitesi", value: "Ra 0.4µm'ye kadar" },
    ],
    processSteps: [
      "DFM Analizi",
      "CAM Programlama",
      "Fikstür Hazırlığı",
      "CNC İşleme",
      "CMM Ölçüm",
      "Kalite Raporu",
    ],
    advantages: [
      "3, 4 ve 5 eksen konfigürasyonlarıyla her geometri",
      "HSM ile %40 daha hızlı üretim ve üstün yüzey kalitesi",
      "Otomatik takım değiştirme (30-120 takım magazini)",
      "Gerçek zamanlı süreç izleme ve dijital ikiz simülasyonu",
      "Prototipten seri üretime esnek çözümler (min. 1 adet)",
      "3-5 iş günü prototip, 7-15 iş günü seri üretim teslimatı",
    ],
    materials: [
      { name: "Alüminyum", grade: "6061-T6 / 7075-T6", properties: "Hafif, korozyona dayanıklı, iyi işlenebilirlik" },
      { name: "Paslanmaz Çelik", grade: "304 / 316L", properties: "Yüksek korozyon direnci, hijyenik" },
      { name: "Karbon Çelik", grade: "1045 / 4140", properties: "Yüksek mukavemet, ısıl işleme uygun" },
      { name: "Titanyum", grade: "Ti6Al4V (Grade 5)", properties: "Hafif, biyouyumlu, yüksek mukavemet" },
      { name: "POM (Delrin)", grade: "Delrin 150 / 500", properties: "Düşük sürtünme, boyutsal kararlılık" },
      { name: "PEEK", grade: "PEEK 450G", properties: "Yüksek sıcaklık dayanımı, kimyasal direnci" },
    ],
    faq: [
      { question: "3 eksen mi 5 eksen mi kullanmalıyım?", answer: "Düz yüzeyler ve basit cep işlemleri için 3 eksen yeterlidir ve daha ekonomiktir. Alttan kesim, eğik yüzeyler veya tek bağlamada çok yüzey işleme gerekiyorsa 5 eksen tercih edilir." },
      { question: "CNC frezeleme tolerans değerleriniz nedir?", answer: "Standart çalışma aralığımız ±0.01mm'dir. Ulaşılabilir tolerans; geometri, malzeme, parça ölçüsü ve ölçü zincirine göre değişir ve her parça için teknik incelemede belirlenir." },
      { question: "Hangi dosya formatlarını kabul ediyorsunuz?", answer: "STEP, IGES, Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX (.prt) ve PDF/DWG teknik çizim formatlarını destekliyoruz." },
      { question: "Minimum sipariş adedi var mı?", answer: "Hayır, tek parçadan seri üretime kadar her adette üretim yapıyoruz. Prototip siparişleri de kabul ediyoruz." },
      { question: "Teslimat süreniz ne kadar?", answer: "Standart parçalarda 5-10 iş günü, ekspres üretimde 2 iş gününe kadar inebiliyoruz. Prototip için 3-5 iş günü." },
    ],
    comparisonTables: [
      {
        title: "CNC Frezeleme Eksen Karşılaştırması",
        description: "Parça geometrisine göre en uygun eksen konfigürasyonunu belirleyin",
        headers: ["Özellik", "3 Eksen", "4 Eksen (3+1)", "5 Eksen Simultane"],
        rows: [
          ["Geometri Kapasitesi", "Düz yüzeyler, cep", "Silindirik profiller", "Karmaşık serbest formlar"],
          ["Bağlama Sayısı", "2-4 bağlama", "1-2 bağlama", "Tek bağlama"],
          ["Tolerans", "±0.05mm", "±0.02mm", "±0.01mm"],
          ["Yüzey Kalitesi", "Ra 1.6µm", "Ra 0.8µm", "Ra 0.4µm"],
          ["Setup Süresi", "Kısa", "Orta", "Uzun (ilk parça)"],
          ["Birim Maliyet", "$", "$$", "$$$"],
          ["Tipik Uygulama", "Plaka, braket", "Flanş, kanal", "Türbin, implant"],
        ],
        highlight: 2,
      },
      {
        title: "İşleme Stratejileri ve Yüzey Kalitesi",
        headers: ["Strateji", "İlerleme Hızı", "Yüzey Kalitesi (Ra)", "Takım Ömrü", "Uygulama"],
        rows: [
          ["Kaba İşleme (HPC)", "5000-8000 mm/dk", "Ra 3.2-6.3µm", "Standart", "Talaş hacmi maksimizasyonu"],
          ["Yarı Finiş", "2000-4000 mm/dk", "Ra 1.6-3.2µm", "İyi", "Son şekle yaklaşma"],
          ["Finiş İşleme", "1000-2000 mm/dk", "Ra 0.8-1.6µm", "Uzun", "Son yüzey kalitesi"],
          ["HSM (Yüksek Hız)", "8000-15000 mm/dk", "Ra 0.4-0.8µm", "Kısa", "İnce cidar, sert malzeme"],
          ["Süper Finiş", "500-1000 mm/dk", "Ra 0.1-0.4µm", "Çok uzun", "Optik yüzeyler, kalıp"],
        ],
      },
    ],
  },
  {
    slug: "cnc-tornalama",
    category: "hizmetler",
    categoryLabel: "Talaşlı İmalat",
    title: "CNC Tornalama",
    metaTitle: "CNC Tornalama Hizmetleri | Çift Milli & Swiss Torna | Mas Technic",
    metaDescription: "CNC torna ile Ø0.5-500mm çap aralığında hassas tornalama. Canlı takımlı, Y eksenli ve kayar puntalı torna. ±0.01 mm standart tolerans.",
    description:
      "Çok eksenli torna merkezlerimiz ile mil, somun, gövde ve karmaşık döner parçaları tek kurulumda tamamlayabilme kapasitesi.",
    heroImage: "hero-cnc-tornalama",
    content: [
      "CNC tornalama, silindirik ve dönme simetrisine sahip parçalar için en verimli üretim yöntemidir. C eksenli ve Y eksenli CNC torna tezgahlarımız sayesinde frezeleme operasyonlarını entegre ediyor, off-center delik ve kanal açma işlemlerini tek bağlamada gerçekleştiriyoruz.",
      "2 eksen tornalama ile miller, burçlar ve basit silindirik parçalar üretirken, canlı takımlı tornalama ile Y ekseni üzerinden torna tezgahında frezeleme, delme ve diş açma işlemleri yapıyoruz. Turn-Mill (torna-freze) kabiliyetimiz ile tek bağlamada hem tornalama hem frezeleme yaparak karmaşık parçalarda yüksek hassasiyet ve verimlilik elde ediyoruz.",
      "Kayar puntalı (Swiss tip) tornalama ile Ø0.3mm'den başlayan çaplarda medikal vida, saat pimi ve konektör pini gibi küçük çaplı, uzun parçalar üretiyoruz: desteklenmemiş boyun kısalması sehimi sınırlar. Çift milli torna merkezlerinde ön ve arka yüzey işleme operasyonları tek kurulumda tamamlanır.",
      "380mm maksimum torna çapı, 1000mm torna boyu ve 65mm mil deliği kapasitemiz ile geniş bir parça yelpazesine hizmet veriyoruz. Otomatik bar feeder sistemi ile 3m çapa kadar sürekli üretim kapasitemiz mevcuttur.",
    ],
    features: [
      "2 Eksen Tornalama — Miller, burçlar ve silindirik parçalar",
      "Canlı Takımlı Torna — Y ekseni ile frezeleme, delme, diş açma",
      "Turn-Mill (Torna-Freze) — Tek bağlamada komple işleme",
      "Swiss Tornalama — Ø0.3mm'den başlayan çaplarda kayar punta",
      "Otomatik Bar Feeder — Sürekli üretim için 3m çapa kadar",
      "Çift Milli Torna — Ön ve arka yüzey tek kurulumda",
    ],
    technicalSpecs: [
      { label: "Maks. Torna Çapı", value: "Ø500mm (standart), Ø32mm (Swiss)" },
      { label: "Maks. Torna Boyu", value: "1000mm (standart), 300mm (Swiss)" },
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "Yüzey Kalitesi", value: "Ra 0.4µm'ye kadar" },
      { label: "Canlı Takım", value: "12 istasyonlu, Y ekseni ±50mm" },
      { label: "Bar Besleyici", value: "Ø65mm'ye kadar otomatik" },
    ],
    processSteps: [
      "Teknik Çizim İnceleme",
      "Malzeme Hazırlığı",
      "CNC Tornalama",
      "Ölçüm & Kontrol",
      "Paketleme",
    ],
    advantages: [
      "Tek bağlamada komple işleme",
      "Çift milli üretimle %50 setup tasarrufu",
      "Swiss tip mikro tornalama kabiliyeti (0.3-32mm)",
      "Bar feeder ile gece-gündüz kesintisiz seri üretim",
      "Turn-mill ile frezeleme ihtiyacını tek operasyonda çözme",
      "C ekseni 0.001° hassasiyet ile hassas pozisyonlama",
    ],
    materials: [
      { name: "Alüminyum", grade: "6061 / 2024 / 7075", properties: "Otomat kalite, serbest kesim, hafif" },
      { name: "Pirinç", grade: "CuZn39Pb3 (CW614N)", properties: "Mükemmel işlenebilirlik, dekoratif" },
      { name: "Paslanmaz Çelik", grade: "303 / 304 / 316", properties: "Korozyon direnci, hijyenik" },
      { name: "Otomat Çeliği", grade: "1215 / 11SMnPb30", properties: "Yüksek hız tornalama için optimize" },
      { name: "Titanyum", grade: "Grade 2 / Grade 5", properties: "Biyouyumlu, yüksek mukavemet/ağırlık" },
      { name: "Delrin (POM)", grade: "Delrin 150 / PTFE", properties: "Düşük sürtünme, aşınma direnci" },
    ],
    faq: [
      { question: "Tornalama mı frezeleme mi seçmeliyim?", answer: "Parçanız silindirik veya dönme simetrisine sahipse tornalama daha ekonomiktir. Prizmatik parçalar için frezeleme tercih edilir." },
      { question: "Karmaşık parçalar tek tezgahta mı yapılır?", answer: "Turn-mill tezgahlarımızda hem tornalama hem frezeleme işlemleri tek bağlamada yapılabilir. Bu hassasiyeti artırır ve maliyeti düşürür." },
      { question: "Swiss tornalama ne zaman gerekir?", answer: "Ø32mm altı çaplarda ve boy/çap oranı yüksek parçalarda (örn: medikal vidalar, pimler) Swiss torna daha hassas sonuç verir." },
      { question: "Seri üretim için uygun mu?", answer: "Evet, bar besleyicili tezgahlarımızda gece-gündüz kesintisiz seri üretim yapabiliyoruz." },
      { question: "Hangi çap aralığında tornalama yapabiliyorsunuz?", answer: "Swiss tip torna ile 0.3mm'den başlayarak konvansiyonel torna ile 500mm çapa kadar geniş bir aralıkta tornalama yapabiliyoruz." },
    ],
    comparisonTables: [
      {
        title: "CNC Torna Konfigürasyon Karşılaştırması",
        headers: ["Özellik", "2 Eksen Torna", "Canlı Takımlı (C/Y)", "Turn-Mill", "Swiss Torna"],
        rows: [
          ["Çap Aralığı", "Ø10-500mm", "Ø10-380mm", "Ø10-300mm", "Ø0.3-32mm"],
          ["İşleme Tipi", "Sadece tornalama", "Torna + delme/freze", "Torna + freze komple", "Uzun/ince parçalar"],
          ["Tolerans", "±0.05mm", "±0.02mm", "±0.02mm", "±0.01mm"],
          ["Yüzey Kalitesi", "Ra 0.8µm", "Ra 0.4µm", "Ra 0.4µm", "Ra 0.2µm"],
          ["Setup Süresi", "Kısa", "Orta", "Uzun", "Orta"],
          ["Birim Maliyet", "$", "$$", "$$$", "$$"],
          ["Tipik Parça", "Mil, burç", "Flanş, valf gövde", "Karmaşık gövde", "Pin, vida, konektör"],
        ],
        highlight: 3,
      },
      {
        title: "Torna Malzeme İşlenebilirlik Matrisi",
        headers: ["Malzeme", "Kesme Hızı (m/dk)", "İlerleme (mm/dev)", "Takım Tipi", "İşlenebilirlik"],
        rows: [
          ["Otomat Çeliği (11SMnPb30)", "180-250", "0.15-0.35", "Kaplamalı karbür", "★★★★★"],
          ["Alüminyum 6061", "300-600", "0.10-0.30", "PCD / Elmas", "★★★★★"],
          ["Pirinç CuZn39Pb3", "200-400", "0.10-0.25", "Kaplamasız karbür", "★★★★★"],
          ["Paslanmaz 304", "120-180", "0.08-0.20", "CVD kaplamalı", "★★★☆☆"],
          ["Titanyum Grade 5", "40-80", "0.05-0.15", "PVD kaplamalı", "★★☆☆☆"],
          ["İnkonel 718", "20-40", "0.05-0.10", "Seramik / CBN", "★☆☆☆☆"],
        ],
      },
    ],
  },
  {
    slug: "hassas-mikro-isleme",
    category: "hizmetler",
    categoryLabel: "Talaşlı İmalat",
    title: "Hassas Mikro İşleme",
    metaTitle: "Hassas Mikro İşleme | Küçük Çaplı Takımlar | Medikal & Elektronik | Mas Technic",
    metaDescription: "Ø0.1mm takımlarla mikro frezeleme ve tornalama. Medikal implant, elektronik konektör ve optik parça bileşenlerinde küçük ölçekli hassas işleme.",
    description:
      "Milimetrenin altında toleranslarla, mikron seviyesinde hassasiyet gerektiren parçalar için özel çözümler. Medikal, elektronik ve optik sektörlerine özel ultra-hassas işleme.",
    heroImage: "hero-mikro-isleme",
    content: [
      "Mikro işleme kabiliyetimiz ile Ø0.1mm'ye kadar takımlarla 5 eksen mikro frezeleme gerçekleştiriyoruz. Optik, elektronik ve medikal implant parçalarında standart CNC'nin ulaşamadığı hassasiyet seviyelerine erişiyoruz. 60.000 RPM'e kadar yüksek hızlı iş mili kapasitemiz ile ultra-hassas yüzey kalitesi elde ediyoruz.",
      "Mikro frezeleme ile Ø0.1mm'ye kadar takımlarla optik, elektronik ve medikal implant parçaları üretiyoruz. Mikro tornalama ile Ø0.3mm'den başlayan çaplarda Swiss tornalama ile saat pimi, medikal vida ve konektör pinleri imal ediyoruz. Mikro delme kabiliyetimiz ile Ø0.05mm'ye kadar hassas delik delme yaparak enjektör uçları, nozullar ve akış kontrol parçaları üretiyoruz.",
      "Mikro parçalarda kontrol yöntemi de parçanın ölçeğine göre seçilir: temaslı ölçüm parçayı deforme edebileceği için optik yöntemler tercih edilir. Kontrol planında hangi kotenin hangi yöntemle ölçüleceği önceden tanımlanır ve sonuçlar kayıt altına alınır.",
      "Medikal sektöründe implantlar, cerrahi aletler, kemik vidaları ve stentler; havacılık sektöründe yakıt enjektörleri, sensör muhafazaları ve mikro valfler; elektronik sektöründe konektör pinleri, fiber optik bileşenler ve yarı iletken test aparatları; saat & optik sektöründe saat mekanizma parçaları, lens tutucular ve kamera bileşenleri üretiyoruz.",
    ],
    features: [
      "Mikro Frezeleme — Ø0.1mm takımlarla 5 eksen işleme",
      "Mikro Tornalama — Ø0.3mm'den başlayan Swiss tornalama",
      "Mikro Delme — Ø0.05mm'ye kadar hassas delik delme",
      "Mikro Ölçüm — Optik CMM ile 0.1µm çözünürlükte kontrol",
      "Küçük Çaplı Takım Kabiliyeti — Ø0.1mm'den başlayan takımlar",
      "Yüzey Pürüzlülüğü — Ra 0.1µm (ayna parlaklığı)",
    ],
    technicalSpecs: [
      { label: "Min. Takım Çapı", value: "Ø0.1mm (Freze), Ø0.05mm (Delme)" },
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "Yüzey Kalitesi", value: "Ra 0.1µm (ayna parlaklığı)" },
      { label: "İş Mili Hızı", value: "60.000 RPM" },
      { label: "Parça Boyutu", value: "1mm³ - 100mm³" },
      { label: "Ölçüm Hassasiyeti", value: "0.1µm optik ölçüm" },
    ],
    processSteps: [
      "Mikro CAM Programlama",
      "Özel Takım Seçimi",
      "Mikro İşleme",
      "Optik Ölçüm",
      "Temizleme & Paketleme",
    ],
    advantages: [
      "Küçük ölçekli geometrilerde kontrollü işleme",
      "Özel mikro takım stoku ve 60.000 RPM iş mili",
      "Kontaminasyonsuz üretim ortamı",
      "200x optik büyütme kontrolü",
      "Medikal, havacılık ve elektronik sektör deneyimi",
      "Otomatik besleyicili Swiss torna ile mikro seri üretim",
    ],
    materials: [
      { name: "Titanyum", grade: "Grade 5 (Ti6Al4V)", properties: "Biyouyumlu, hafif, yüksek mukavemet" },
      { name: "Paslanmaz (Medikal)", grade: "316L", properties: "Biyouyumlu, korozyona dayanıklı" },
      { name: "Alüminyum", grade: "7075-T6", properties: "Hafif, yüksek dayanım, iyi işlenebilirlik" },
      { name: "Bakır", grade: "C101 (OFE)", properties: "Yüksek iletkenlik, hassas işleme" },
      { name: "PEEK", grade: "PEEK 450G", properties: "Yüksek sıcaklık, kimyasal direnci" },
      { name: "Tungsten Karbür", grade: "WC-Co", properties: "Aşırı sertlik, aşınma direnci" },
    ],
    faq: [
      { question: "Mikro işleme ne zaman tercih edilmeli?", answer: "Parça özellikleri 1mm altında veya toleranslar ±0.01mm altında ise mikro işleme gereklidir. Standart CNC bu hassasiyetlere ulaşamaz." },
      { question: "Maliyet standart CNC'den yüksek mi?", answer: "Evet, özel takımlar, yavaş ilerleme hızları ve hassas ölçüm gereksinimleri nedeniyle maliyet daha yüksektir. Ancak bu, standart yöntemlerle elde edilemeyecek sonuçlar içindir." },
      { question: "Seri üretim yapabiliyor musunuz?", answer: "Evet, otomatik besleyicili Swiss torna ve palletli 5 eksen sistemleri ile mikro parçalarda bile seri üretim yapabiliyoruz." },
      { question: "Ölçüm raporu veriyor musunuz?", answer: "Kontrol planında tanımlanan koteler ölçülür ve ölçüm kaydı teslimat dosyasına eklenir. Koordinat ölçümü gerektiğinde akredite üçüncü taraf ölçümü talebe bağlı olarak sağlanır." },
    ],
    comparisonTables: [
      {
        title: "Mikro İşleme Teknoloji Karşılaştırması",
        headers: ["Parametre", "Mikro Frezeleme", "Mikro Tornalama", "Mikro Delme", "Mikro EDM"],
        rows: [
          ["Min. Özellik Boyutu", "50µm", "300µm (çap)", "50µm (delik)", "10µm"],
          ["Tolerans", "±2µm", "±3µm", "±5µm", "±1µm"],
          ["Yüzey Kalitesi", "Ra 0.1µm", "Ra 0.2µm", "Ra 0.4µm", "Ra 0.05µm"],
          ["İşleme Hızı", "Orta", "Yüksek", "Düşük", "Çok düşük"],
          ["Malzeme Kısıtı", "Tümü", "Silindirik", "Tümü", "İletken"],
          ["Maliyet", "$$$", "$$", "$$", "$$$$"],
          ["Tipik Uygulama", "Optik, implant", "Pin, vida", "Nozul, enjektör", "Mikro kalıp"],
        ],
      },
      {
        title: "Sektörel Mikro İşleme Gereksinimleri",
        headers: ["Sektör", "Tipik Parça", "Tolerans Beklentisi", "Yüzey Beklentisi", "Sertifika"],
        rows: [
          ["Medikal", "İmplant, cerrahi alet", "Şartnameye göre", "Ra 0.1-0.4µm", "Biyouyumlu malzeme"],
          ["Havacılık", "Yakıt enjektör, sensör", "Şartnameye göre", "Ra 0.2-0.8µm", "İzlenebilir malzeme"],
          ["Elektronik", "Konektör pin, PCB", "±3-5µm", "Ra 0.2-0.4µm", "IPC-A-610"],
          ["Saat & Optik", "Mekanizma, lens tutucu", "±1-3µm", "Ra 0.05-0.1µm", "ISO 1413"],
          ["Otomotiv", "Enjektör nozul, sensör", "Şartnameye göre", "Ra 0.4-0.8µm", "Parti izlenebilirliği"],
        ],
      },
    ],
  },
  {
    slug: "derin-delik-raybalama",
    category: "hizmetler",
    categoryLabel: "Talaşlı İmalat",
    title: "Derin Delik & Raybalama",
    metaTitle: "Derin Delik Delme & Raybalama | L/D 100:1 | Gun Drill & BTA | Mas Technic",
    metaDescription: "Ø2-200mm çap aralığında 2000mm derinliğe kadar derin delik delme. Gun drilling, BTA ve honlama ile Ra 0.2µm yüzey kalitesi. Hidrolik, kalıp ve savunma sektörü.",
    description:
      "Boy/çap oranı yüksek deliklerde hassas ve doğrusal işleme. Hidrolik silindir, kalıp soğutma kanalları ve makina parçaları için uzman çözümler.",
    heroImage: "hero-derin-delik",
    content: [
      "Derin delik delme, boy/çap oranı (L/D) 10:1'den büyük delikler için gerekli olan özel bir işleme sürecidir. Standart matkaplarla bu oranlarda hassas delme mümkün değildir. Özel derin delik delme tezgahlarımız ile Ø2-200mm çap aralığında ve 2000mm derinliğe kadar hassas delik delme imkânı sunuyoruz.",
      "Gun drilling teknolojimiz ile tek dudaklı matkap kullanarak Ø2-20mm çap aralığında L/D oranı 100:1'e kadar derin delikler işliyoruz. Yağ kanalları ve soğutma delikleri için idealdir. BTA (Boring and Trepanning Association) delme sistemi ile Ø20-200mm aralığında büyük çaplı derin deliklerde yüksek talaş kaldırma hızı elde ediyoruz.",
      "Hassas raybalama ile H6/H7 toleranslarında iç çap hassasiyeti sağlıyoruz. Hidrolik silindir ve rulman yatakları için ideal olan bu işlemde standart çalışma aralığımız ±0.01mm çap toleransıdır. Honlama işlemi ile iç yüzeylerde Ra 0.2µm'ye kadar yüzey kalitesi elde ederek silindir gömlekleri ve valfler için mükemmel sonuçlar üretiyoruz.",
      "Hidrolik sistemlerde silindir gövdeleri, valf blokları ve manifold delikleri; kalıp & takım sektöründe enjeksiyon kalıplarında soğutma kanalları ve ejektör delikleri; enerji & makina sektöründe türbin şaftları ve kompresör pistonları; savunma sektöründe silah namluları ve optik tüpleri üretiminde uzmanlaşmış deneyimimiz bulunmaktadır.",
    ],
    features: [
      "Gun Drilling — Ø2-20mm, L/D 100:1, yağ kanalları",
      "BTA Delme — Ø20-200mm, yüksek talaş kaldırma",
      "Hassas Raybalama — H6/H7 tolerans, ±0.01mm çap",
      "Honlama — İç yüzeylerde Ra 0.2µm kalite",
      "2000mm Derinlik — Uzun parçalarda doğrusal delme",
      "500kg Parça Kapasitesi — Ağır iş parçaları",
    ],
    technicalSpecs: [
      { label: "Delik Çapı (Gun Drill)", value: "Ø2-100mm" },
      { label: "Delik Çapı (BTA)", value: "Ø20-200mm" },
      { label: "Maks. Delik Derinliği", value: "2000mm" },
      { label: "Doğrusallık", value: "0.05mm/100mm sapma" },
      { label: "Çap Toleransı", value: "H6/H7 (±0.01mm)" },
      { label: "Yüzey Kalitesi", value: "Ra 0.4µm (delme), Ra 0.2µm (honlama)" },
    ],
    processSteps: [
      "Teknik Analiz",
      "Delme Yöntemi Seçimi",
      "Derin Delik İşleme",
      "Raybalama / Honlama",
      "Ölçüm & Rapor",
    ],
    advantages: [
      "100:1 L/D oranı kapasitesi",
      "Gun drill ve BTA teknolojileri",
      "Honlama ile Ra 0.2µm yüzey iyileştirme",
      "Özel kılavuzlama burs sistemleri ile sapma minimizasyonu",
      "Yüksek basınçlı soğutma sıvısı ile optimize edilmiş kesme",
      "Hidrolik, enerji, kalıp ve savunma sektörü deneyimi",
    ],
    materials: [
      { name: "Çelik", grade: "1045 / 4140 / 42CrMo4", properties: "Yüksek mukavemet, ısıl işleme uygun" },
      { name: "Paslanmaz Çelik", grade: "304 / 316L", properties: "Korozyon direnci, hidrolik uygulamalar" },
      { name: "Alüminyum", grade: "6061 / 7075", properties: "Hafif, soğutma kanalları için ideal" },
      { name: "Dökme Demir", grade: "GGG-40 / GGG-50", properties: "Titreşim sönümleme, ağır yük" },
      { name: "İnkonel", grade: "625 / 718", properties: "Yüksek sıcaklık dayanımı, havacılık" },
      { name: "Bronz", grade: "CuSn8 / CuAl10", properties: "Aşınma direnci, sürtünme azaltma" },
    ],
    faq: [
      { question: "Derin delik nedir?", answer: "Boy/çap oranı (L/D) 10:1'den büyük delikler 'derin delik' olarak tanımlanır. Standart matkaplarla bu oranlarda hassas delme mümkün değildir." },
      { question: "Gun drill ile BTA arasındaki fark nedir?", answer: "Gun drill küçük çaplarda (Ø2-20mm) ve yüksek L/D oranlarında kullanılır. BTA daha büyük çaplarda (Ø20mm üstü) ve yüksek talaş kaldırma hızlarında tercih edilir." },
      { question: "Doğrusallık nasıl sağlanır?", answer: "Özel kılavuzlama burs sistemleri, yüksek basınçlı soğutma sıvısı ve optimize edilmiş kesme parametreleri ile sapma minimuma indirilir." },
      { question: "İç yüzey kalitesi iyileştirilebilir mi?", answer: "Evet, raybalama ve honlama işlemleriyle Ra 0.2µm'ye kadar yüzey kalitesi elde edilebilir. H6 toleransında çap hassasiyeti sağlanır." },
    ],
    comparisonTables: [
      {
        title: "Derin Delik Delme Yöntemleri Karşılaştırması",
        headers: ["Parametre", "Gun Drilling", "BTA Delme", "Trepan Delme", "Konvansiyonel Matkap"],
        rows: [
          ["Çap Aralığı", "Ø2-20mm", "Ø20-200mm", "Ø50-300mm", "Ø1-50mm"],
          ["Maks. L/D Oranı", "100:1", "50:1", "30:1", "5:1"],
          ["Doğrusallık", "0.02mm/100mm", "0.05mm/100mm", "0.1mm/100mm", "0.5mm/100mm"],
          ["Yüzey Kalitesi", "Ra 0.4-0.8µm", "Ra 0.8-1.6µm", "Ra 1.6-3.2µm", "Ra 3.2-6.3µm"],
          ["Talaş Kontrolü", "Harici soğutma", "İç talaş tahliye", "Halka talaş", "Manuel"],
          ["Maliyet", "$$$", "$$", "$$", "$"],
          ["Tipik Uygulama", "Yağ kanalı, namlu", "Silindir gövde", "Büyük boru", "Standart delik"],
        ],
        highlight: 0,
      },
      {
        title: "Raybalama ve Honlama Tolerans Seviyeleri",
        headers: ["İşlem", "Çap Toleransı", "Yüzey Kalitesi (Ra)", "Silindiriklik", "Uygulama"],
        rows: [
          ["Standart Delme", "H11 (±0.1mm)", "Ra 3.2-6.3µm", "0.05mm", "Cıvata deliği"],
          ["Hassas Raybalama", "H7 (±0.01mm)", "Ra 0.8-1.6µm", "0.01mm", "Pim yatağı, burç"],
          ["İnce Raybalama", "H7", "Ra 0.4-0.8µm", "0.02mm", "Rulman yatağı"],
          ["Honlama", "H7", "Ra 0.1-0.4µm", "0.01mm", "Hidrolik silindir"],
          ["Süper Finiş Honlama", "H6", "Ra 0.05-0.1µm", "0.01mm", "Motor silindir"],
        ],
        highlight: 3,
      },
    ],
  },

  // ── Hizmetler > Ön Üretim ──
  {
    slug: "enjeksiyon-kalibi",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Enjeksiyon Kalıbı",
    metaTitle: "Enjeksiyon Kalıp İmalatı | Moldflow Simülasyon | Mas Technic",
    metaDescription: "Alüminyum ve çelik enjeksiyon kalıp üretimi. Moldflow simülasyonu, 1.000.000+ çevrim ömrü. Hızlı prototip kalıplar 2-3 haftada teslimat.",
    description:
      "Alüminyum ve çelik kalıp imalatı. Hızlı prototip kalıplarından yüksek hacimli seri üretim kalıplarına kadar tüm ihtiyaçlarınıza çözüm.",
    heroImage: "hero-enjeksiyon-kalibi",
    content: [
      "Yüksek hassasiyetli plastik enjeksiyon kalıplarının tasarımını ve üretimini gerçekleştiriyoruz. Moldflow simülasyonu ile dolum davranışını kalıp üretiminden önce değerlendiriyoruz. Çekme payı optimizasyonu ve gate/vent konumlandırma dahil kapsamlı DFM analizi sunuyoruz.",
      "Kalıp malzemesi beklenen üretim adedine göre seçilir: Al 7075 (150 HB) prototip ve düşük hacim, P20 (280-320 HB) orta hacim, H13 (45-52 HRC) yüksek hacim, S136 (48-52 HRC) ise korozyon direnci gereken uygulamalar için. Sıcak yolluk desteği ile malzeme tasarrufu ve döngü süresi iyileştirmesi sağlanır.",
      "Alüminyum kalıplar düşük ve orta hacimde daha kısa sürede hazırlanırken, çelik kalıplar yüksek hacimli üretimde daha uzun ömür sağlar. Beklenen adet ve parça geometrisi, kalıp malzemesi ve boşluk sayısı kararını birlikte belirler.",
    ],
    features: [
      "Alüminyum Kalıp — düşük ve orta hacim için hızlı hazırlık",
      "Çelik Kalıp — yüksek hacimli üretimde uzun ömür",
      "Çok Boşluklu Tasarım — Verimlilik artışı",
      "Sıcak Yolluk Sistemi — Malzeme tasarrufu ve döngü iyileştirmesi",
    ],
    technicalSpecs: [
      { label: "Kalıp Boyutu (min)", value: "100×100×100mm" },
      { label: "Kavite Sayısı", value: "1-128 kavite" },
      { label: "Kalıp Ömrü", value: "1.000.000+ çevrim" },
      { label: "Tolerans", value: "±0.01mm" },
    ],
    processSteps: [
      "Ürün Analizi",
      "Kalıp Tasarımı",
      "Moldflow Simülasyonu",
      "CNC İşleme",
      "Deneme Basımı",
      "Teslimat",
    ],
    advantages: [
      "Moldflow akış simülasyonu dahil",
      "DFM analizi ve çekme payı optimizasyonu",
      "Hot runner sistemi desteği",
      "4 farklı kalıp malzemesi seçeneği (Al 7075, P20, H13, S136)",
    ],
    materials: [
      { name: "Al 7075", grade: "150 HB", properties: "Prototip kalıp, 10.000+ çevrim" },
      { name: "P20 (1.2311)", grade: "280-320 HB", properties: "Orta hacim, genel amaçlı" },
      { name: "H13 (1.2344)", grade: "45-52 HRC", properties: "Yüksek hacim, sıcak iş çeliği" },
      { name: "S136 (1.2083)", grade: "48-52 HRC", properties: "Korozyon direnci, optik kalıplar" },
    ],
    faq: [
      { question: "Kalıp teslimat süresi ne kadar?", answer: "Hızlı alüminyum kalıplar 2-3 hafta, çelik kalıplar 4-8 hafta içinde teslim edilir. Proje karmaşıklığına göre değişebilir." },
      { question: "Moldflow simülasyonu zorunlu mu?", answer: "Zorunlu değildir ancak özellikle karmaşık parçalarda dolum problemlerini, çökme izlerini ve eğilmeyi önlemek için şiddetle tavsiye ederiz." },
      { question: "Alüminyum mı çelik kalıp mı seçmeliyim?", answer: "10.000 adete kadar üretim için alüminyum kalıp ekonomiktir. Daha yüksek hacimler için çelik kalıp uzun vadede maliyet avantajı sağlar." },
    ],
    comparisonTables: [
      {
        title: "Enjeksiyon Kalıp Malzemesi Seçim Matrisi",
        headers: ["Kalıp Malzemesi", "Sertlik", "Kalıp Ömrü", "Teslimat Süresi", "Maliyet", "Uygulama"],
        rows: [
          ["Al 7075", "150 HB", "10.000+ çevrim", "2-3 hafta", "$", "Prototip, düşük hacim"],
          ["P20 (1.2311)", "280-320 HB", "500.000+ çevrim", "4-6 hafta", "$$", "Orta hacim, genel amaç"],
          ["H13 (1.2344)", "45-52 HRC", "1.000.000+ çevrim", "6-8 hafta", "$$$", "Yüksek hacim, sıcak iş"],
          ["S136 (1.2083)", "48-52 HRC", "1.000.000+ çevrim", "6-8 hafta", "$$$$", "Optik, medikal, korozyon"],
          ["NAK80", "38-42 HRC", "500.000+ çevrim", "5-7 hafta", "$$$", "Yüksek parlaklık, ön sertleştirilmiş"],
        ],
        highlight: 2,
      },
      {
        title: "Kavite Sayısı ve Üretim Verimliliği",
        headers: ["Kavite", "Çevrim/Saat", "Parça/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],
        rows: [
          ["Tek kavite", "60-120", "60-120", "$$$", "$", "1-10.000 adet"],
          ["2 kavite", "60-120", "120-240", "$$", "1.5×", "10.000-50.000"],
          ["4 kavite", "50-100", "200-400", "$$", "2×", "50.000-200.000"],
          ["8 kavite", "40-80", "320-640", "$", "3×", "200.000-500.000"],
          ["16+ kavite", "30-60", "480-960+", "$", "4-5×", "500.000+"],
        ],
      },
    ],
  },
  {
    slug: "basinçli-dokum",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Basınçlı Döküm",
    heroImage: "hero-basincli-dokum",
    metaTitle: "Basınçlı Döküm Kalıp İmalatı | Alüminyum & Zamak | Mas Technic",
    metaDescription: "120-1200 ton kapasitede alüminyum ve çinko basınçlı döküm kalıbı. 0.5mm min duvar kalınlığı, ±0.05mm tolerans. Akış simülasyonu dahil.",
    description:
      "Alüminyum ve çinko alaşımları ile karmaşık geometrileri tek parça olarak döküm. Yüksek üretim hızı ve düşük birim maliyet avantajı.",
    content: [
      "120-1200 ton kilitleme kuvveti kapasitemiz ile geniş parça yelpazesinde basınçlı döküm kalıpları tasarlıyor ve üretiyoruz. 0.5mm minimum duvar kalınlığı ile ince duvarlı parçalar, ±0.05mm tolerans ile CT4-CT6 kalite sınıfında ve Ra 1.6-3.2 mikron yüzey pürüzlülüğünde sonuçlar elde ediyoruz.",
      "ADC12 (Al-Si) 280 MPa genel amaçlı, A380 320 MPa yüksek dayanımlı, ZA-8 (Zn-Al) 350 MPa döküm somun ve ZA-27 420 MPa ağır yük uygulamaları için optimize edilmiş döküm alaşımları ile çalışıyoruz.",
      "Akış simülasyonu ile kalıp tasarımını optimize ediyor, alüminyum, zamak ve magnezyum döküm kalıpları için en uygun çözümü sunuyoruz.",
    ],
    features: [
      "120-1200 Ton Kilitleme Kuvveti — Geniş parça yelpazesi",
      "0.5mm Min Duvar Kalınlığı — İnce duvarlı parçalar",
      "±0.05mm Tolerans — CT4-CT6 kalite sınıfı",
      "Yüzey Pürüzlülüğü — Ra 1.6-3.2 mikron",
    ],
    technicalSpecs: [
      { label: "Kilitleme Kuvveti", value: "120-1200 ton" },
      { label: "Min. Duvar Kalınlığı", value: "0.5mm" },
      { label: "Malzemeler", value: "ADC12, A380, ZA-8, ZA-27" },
      { label: "Kalıp Ömrü", value: "100K+ çevrim" },
      { label: "Tolerans", value: "±0.05mm (CT4-CT6)" },
      { label: "Yüzey Kalitesi", value: "Ra 1.6-3.2µm" },
    ],
    processSteps: [
      "Parça Analizi",
      "Kalıp Tasarımı",
      "Akış Simülasyonu",
      "Kalıp Üretimi",
      "Deneme Döküm",
      "Seri Üretim",
    ],
    advantages: [
      "Geniş alaşım seçeneği (Al, Zn, Mg)",
      "Akış simülasyonu ile optimize tasarım",
      "İnce duvarlı parça kapasitesi",
      "Yüksek üretim hızı ve düşük birim maliyet",
    ],
    comparisonTables: [
      {
        title: "Basınçlı Döküm Alaşım Karşılaştırması",
        headers: ["Alaşım", "Çekme Dayanımı", "Yoğunluk", "Döküm Sıcaklığı", "Min. Duvar", "Uygulama"],
        rows: [
          ["ADC12 (Al-Si)", "280 MPa", "2.74 g/cm³", "640-680°C", "0.8mm", "Genel amaç, motor gövde"],
          ["A380 (Al-Si-Cu)", "320 MPa", "2.71 g/cm³", "650-700°C", "0.8mm", "Yüksek dayanım, yapısal"],
          ["ZA-8 (Zn-Al)", "350 MPa", "6.3 g/cm³", "420-440°C", "0.5mm", "İnce duvar, somun"],
          ["ZA-27 (Zn-Al)", "420 MPa", "5.0 g/cm³", "440-480°C", "0.75mm", "Ağır yük, rulman"],
          ["AZ91D (Mg)", "230 MPa", "1.81 g/cm³", "620-650°C", "1.0mm", "Hafif, elektronik muhafaza"],
        ],
      },
      {
        title: "Döküm Kalite Sınıfları (ISO 8062)",
        headers: ["Kalite Sınıfı", "Boyut Toleransı", "Yüzey Kalitesi", "Gözeneklilik", "Maliyet", "Uygulama"],
        rows: [
          ["CT4", "±0.05mm", "Ra 0.8-1.6µm", "Çok düşük", "$$$$", "Havacılık, medikal"],
          ["CT5", "±0.1mm", "Ra 1.6-3.2µm", "Düşük", "$$$", "Otomotiv kritik"],
          ["CT6", "±0.2mm", "Ra 3.2-6.3µm", "Orta", "$$", "Genel endüstriyel"],
          ["CT7", "±0.3mm", "Ra 6.3-12.5µm", "Kabul edilebilir", "$", "Dekoratif, yapısal"],
        ],
        highlight: 2,
      },
    ],
  },
  {
    slug: "silikon-kaliplama",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Silikon Kalıplama",
    heroImage: "hero-silikon-kaliplama",
    metaTitle: "Silikon Kalıplama | Vakumlu Döküm | 1-100 Adet | Mas Technic",
    metaDescription: "Vakumlu silikon kalıplama ile 1-100 adet kısa seri üretim. PU, silikon, epoksi. Master modelden 24 saatte ilk parça teslimatı.",
    description:
      "Vakumlu silikon kalıplama ile 1-100 adet arası kısa seri üretim. Master modelden 24 saatte ilk parçalar.",
    content: [
      "Vakum altında döküm, kalıp boşluğunda hava hapsini önleyerek gözeneksiz bir yüzey verir. PU, silikon, polyester ve epoksi malzemelerle üretim yapıyor, pigment ile renk seçeneği sunuyoruz.",
      "PU 60A (60 Shore A, esnek ve yırtılmaz), PU 80A (80 Shore A, orta sertlik), PU 90A (90 Shore A, yüksek dayanım) ve Silikon 40A (40 Shore A, yüksek sıcaklık dayanımlı) malzeme seçenekleri ile geniş uygulama yelpazesine hizmet veriyoruz.",
      "Overmolding ile farklı sertlikte malzemeleri birlikte kullanabiliyoruz. Medikal, otomotiv ve endüstriyel uygulamalar için özel silikon kalıplama çözümleri sunuyoruz. Master modelden 24 saatte ilk parçalar teslim ediyoruz.",
    ],
    features: [
      "Vakumlu Döküm — hava hapsi olmadan gözeneksiz yüzey",
      "Çeşitli Malzemeler — PU, silikon, polyester, epoksi",
      "Renk Seçenekleri — Pigment ile istenilen renk",
      "Overmolding — Farklı sertlikte malzemeler birlikte",
    ],
    technicalSpecs: [
      { label: "Shore Sertlik", value: "40A-90A" },
      { label: "Tolerans", value: "±0.05mm" },
      { label: "Malzeme", value: "PU, LSR, HTV, EPDM" },
      { label: "Sıcaklık Dayanımı", value: "-60°C / +300°C" },
      { label: "Lot Büyüklüğü", value: "1-100 adet" },
    ],
    processSteps: [
      "Master Model Hazırlığı",
      "Silikon Kalıp Dökümü",
      "Vakumlu Döküm",
      "Kürleme",
      "Kalıptan Çıkarma",
      "Kalite Kontrol",
    ],
    advantages: [
      "24 saatte ilk parça teslimatı",
      "1-100 adet kısa seri üretim",
      "4 farklı sertlik seçeneği",
      "Overmolding kapasitesi",
    ],
    comparisonTables: [
      {
        title: "Silikon Kalıplama Malzeme Karşılaştırması",
        headers: ["Malzeme", "Shore Sertlik", "Uzama (%)", "Sıcaklık Aralığı", "Yırtılma Direnci", "Uygulama"],
        rows: [
          ["PU 60A", "60 Shore A", "450%", "-30°C / +80°C", "25 kN/m", "Esnek conta, tampon"],
          ["PU 80A", "80 Shore A", "350%", "-30°C / +90°C", "35 kN/m", "Tutamak, kapak"],
          ["PU 90A", "90 Shore A", "250%", "-20°C / +100°C", "45 kN/m", "Yapısal, yük taşıyan"],
          ["Silikon 40A", "40 Shore A", "600%", "-60°C / +300°C", "20 kN/m", "Yüksek sıcaklık, medikal"],
          ["Silikon 70A", "70 Shore A", "400%", "-55°C / +250°C", "30 kN/m", "O-ring, conta, tuş takımı"],
          ["Epoksi Reçine", "80 Shore D", "5%", "-40°C / +120°C", "Rijit", "Prototip, model"],
        ],
      },
      {
        title: "Üretim Yöntemi Karşılaştırması (Kısa Seri)",
        headers: ["Yöntem", "Min. Adet", "Teslimat", "Parça Maliyeti", "Kalıp Maliyeti", "Yüzey Kalitesi"],
        rows: [
          ["Vakumlu Döküm", "1", "1-3 gün", "$$", "$", "İyi (master'a bağlı)"],
          ["3D Baskı (SLA)", "1", "1-2 gün", "$$$", "Yok", "Çok iyi"],
          ["CNC İşleme", "1", "3-5 gün", "$$$$", "Yok", "Mükemmel"],
          ["Silikon Enjeksiyon", "500+", "2-4 hafta", "$", "$$$", "Mükemmel"],
          ["Sıkıştırma Kalıplama", "100+", "1-3 hafta", "$$", "$$", "İyi"],
        ],
      },
    ],
  },
  {
    slug: "fikstur-aparat-tasarimi",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Fikstür & Aparat Tasarımı",
    heroImage: "hero-fikstur-aparat",
    metaTitle: "Fikstür & Aparat Tasarımı | Özel CNC Fikstür | Mas Technic",
    metaDescription: "CNC işleme, montaj, kaynak ve kontrol için özel fikstür tasarımı. ±0.01mm tekrarlanabilirlik. CATIA/SolidWorks ile 3D modelleme ve simülasyon.",
    description:
      "CNC işleme, montaj, kaynak ve kontrol operasyonları için özel tasarım fikstür ve aparat çözümleri. Tekrarlanabilirlik ve operatör bağımsızlığı.",
    content: [
      "Üretim süreçlerinizi hızlandıracak ve hassasiyeti artıracak özel fikstür ve aparatlar tasarlıyoruz. Torna fikstürü (milliyelti ve milliyetsiz), freze fikstürü (vise, vakumlu ve hidrolik), montaj fikstürü (operatör hatalarını önleme), kontrol fikstürü (ölçüm tekrarlanabilirliği) ve kaynak fikstürü (hizalama ve sabitleme) dahil geniş yelpazede çözümler sunuyoruz.",
      "CATIA ve SolidWorks ile 3D modelleme, kuvvet ve tolerans analizi simülasyonu, 3D baskı veya hızlı imalat ile prototip üretimi ve üretim ortamında doğrulama test & onay süreçleri ile profesyonel tasarım hizmeti veriyoruz.",
      "Çelik, alüminyum ve kompozit malzemelerle ±0.01mm tekrarlanabilirlik sağlayan fikstürler üretiyoruz. Tasarım için 3-5 iş günü, üretim için 5-10 iş günü çalışma süresiyle ilerliyoruz.",
    ],
    features: [
      "Torna Fikstürü — Milliyelti ve milliyetsiz",
      "Freze Fikstürü — Vise, vakumlu ve hidrolik",
      "Montaj Fikstürü — Operatör hatalarını önleme",
      "Kontrol Fikstürü — Ölçüm tekrarlanabilirliği",
      "Kaynak Fikstürü — Hizalama ve sabitleme",
    ],
    technicalSpecs: [
      { label: "Tekrarlanabilirlik", value: "±0.01mm" },
      { label: "Malzeme", value: "Çelik, Al, Kompozit" },
      { label: "Tasarım Süresi", value: "3-5 iş günü" },
      { label: "Üretim Süresi", value: "5-10 iş günü" },
    ],
    processSteps: [
      "İhtiyaç Analizi",
      "3D Modelleme (CATIA/SolidWorks)",
      "Simülasyon (Kuvvet & Tolerans)",
      "Prototip (3D Baskı / Hızlı İmalat)",
      "CNC İşleme & Montaj",
      "Test & Onay",
    ],
    advantages: [
      "CATIA/SolidWorks ile profesyonel tasarım",
      "Kuvvet ve tolerans simülasyonu",
      "3D baskı ile hızlı prototipleme",
      "Üretim ortamında doğrulama testi",
    ],
    comparisonTables: [
      {
        title: "Fikstür Tipi Seçim Rehberi",
        headers: ["Fikstür Tipi", "Bağlama Kuvveti", "Tekrarlanabilirlik", "Değişim Süresi", "Maliyet", "Uygulama"],
        rows: [
          ["Mekanik Mengene", "10-50 kN", "±0.02mm", "1-2 dk", "$", "Genel frezeleme"],
          ["Hidrolik Bağlama", "20-100 kN", "±0.01mm", "10-20 sn", "$$$", "Seri üretim, otomatik"],
          ["Pnömatik Bağlama", "5-30 kN", "±0.01mm", "5-10 sn", "$$", "Hafif parçalar, hızlı"],
          ["Vakumlu Bağlama", "1-10 kN", "±0.01mm", "5 sn", "$$", "İnce plaka, hassas"],
          ["Manyetik Tablo", "5-20 kN", "±0.01mm", "3 sn", "$$", "Ferromanyetik, taşlama"],
          ["Modüler Fikstür", "Değişken", "±0.01mm", "15-30 dk", "$$$$", "Çok amaçlı, esnek"],
        ],
        highlight: 1,
      },
    ],
  },

  // ── Hizmetler > Yüzey İşlemleri ──
  {
    slug: "mekanik-yuzey-islemleri",
    category: "hizmetler",
    categoryLabel: "Yüzey İşlemleri",
    title: "Mekanik Yüzey İşlemleri",
    heroImage: "hero-mekanik-yuzey",
    metaTitle: "Mekanik Yüzey İşlemleri | Kumlama & Parlatma | Mas Technic",
    metaDescription: "Kumlama, vibrasyonlu yüzme, parlatma ve pasivasyon. Ra 0.05µm yüzey kalitesi. Ayna parlaklığından satine yüzeye kadar geniş seçenek.",
    description:
      "Kumlama, vibrasyonlu yüzme, parlatma ve pasivasyon ile yüzey kalitesini iyileştirme ve montaja hazır hale getirme.",
    content: [
      "Mekanik yüzey işlemleri ile parçalarınızın yüzey kalitesini istenen seviyeye getiriyoruz. Kumlama (shot blasting) ile temizleme ve yüzey pürüzlendirme, vibrasyonlu yüzme (tumbling) ile köşeli kısımları kırma, merkezsiz parlatma ile yuvarlak parçalar için yüzey iyileştirme, yüzey parlatma ile ayna parlaklığı ve fırçalama ile satine yüzey efekti elde ediyoruz.",
      "Cam kumu (0.1-0.5mm) ile hassas temizlik, alüminyum oksit (0.2-1.0mm) ile yüzey hazırlık, çelik grit (0.2-2.0mm) ile ağır temizlik ve soda (0.1-0.3mm) ile yumuşak temizlik gibi farklı abrasive malzemelerle çalışıyoruz.",
      "Ra 0.05µm'e kadar yüzey kalitesi, 2-8 bar kumlama basıncı ve 1500×800mm'ye kadar parça boyutu kapasitemiz ile geniş bir hizmet yelpazesi sunuyoruz.",
    ],
    features: [
      "Kumlama (Shot Blasting) — Temizleme ve yüzey pürüzlendirme",
      "Vibrasyonlu Yüzme (Tumbling) — Köşeli kısımları kırma",
      "Merkezsiz Parlatma — Yuvarlak parçalar için",
      "Yüzey Parlatma — Ayna parlaklığı",
      "Fırçalama — Satine yüzey efekti",
    ],
    technicalSpecs: [
      { label: "Yüzey Kalitesi", value: "Ra 0.05µm'e kadar" },
      { label: "Kumlama Basıncı", value: "2-8 bar" },
      { label: "Parlatma Seviyesi", value: "Ayna parlaklığı" },
      { label: "Maks. Parça Boyutu", value: "1500×800mm" },
    ],
    processSteps: [
      "Yüzey Analizi",
      "İşlem Yöntemi Seçimi",
      "Abrasive / Medya Seçimi",
      "Yüzey İşleme",
      "Kalite Kontrol",
    ],
    advantages: [
      "4 farklı abrasive malzeme seçeneği",
      "Ayna parlaklığına kadar parlatma",
      "Montaja hazır yüzey teslimatı",
      "Geniş parça boyutu kapasitesi",
    ],
    comparisonTables: [
      {
        title: "Mekanik Yüzey İşlem Yöntemleri Karşılaştırması",
        headers: ["Yöntem", "Yüzey Kalitesi (Ra)", "İşlem Süresi", "Parça Boyutu", "Maliyet", "Uygulama"],
        rows: [
          ["Kumlama (Cam Kumu)", "Ra 1.6-3.2µm", "5-15 dk", "1500×800mm", "$", "Temizleme, pürüzlendirme"],
          ["Kumlama (Al₂O₃)", "Ra 2.0-4.0µm", "5-15 dk", "1500×800mm", "$", "Boya öncesi hazırlık"],
          ["Vibrasyonlu Yüzme", "Ra 0.4-1.6µm", "30-120 dk", "Küçük parçalar", "$", "Çapak alma, köşe kırma"],
          ["Merkezsiz Parlatma", "Ra 0.1-0.4µm", "10-30 dk", "Ø5-100mm", "$$", "Mil, pim parlatma"],
          ["Mekanik Parlatma", "Ra 0.05-0.2µm", "15-60 dk", "Değişken", "$$$", "Ayna parlaklığı"],
          ["Fırçalama", "Ra 0.4-1.2µm", "5-10 dk", "Düz yüzeyler", "$", "Satine efekt, dekoratif"],
        ],
      },
      {
        title: "Abrasive Medya Seçim Tablosu",
        headers: ["Medya Tipi", "Tane Boyutu", "Sertlik", "Uygun Malzeme", "Etki"],
        rows: [
          ["Cam Kumu", "0.1-0.5mm", "Orta", "Tüm metaller", "Hassas temizlik, mat yüzey"],
          ["Alüminyum Oksit", "0.2-1.0mm", "Yüksek", "Çelik, dökme demir", "Agresif temizlik, pürüzlendirme"],
          ["Çelik Grit", "0.2-2.0mm", "Çok yüksek", "Çelik, döküm", "Ağır pas/kum temizleme"],
          ["Seramik Medya", "3-15mm", "Yüksek", "Tüm metaller", "Çapak alma, yüzey düzeltme"],
          ["Plastik Medya", "2-10mm", "Düşük", "Alüminyum, plastik", "Nazik çapak alma"],
          ["Ceviz Kabuğu", "0.5-2.0mm", "Düşük", "Yumuşak metaller", "Temizlik (boyut değişimi yok)"],
        ],
      },
    ],
  },
  {
    slug: "anodizasyon",
    category: "hizmetler",
    categoryLabel: "Yüzey İşlemleri",
    title: "Anodizasyon",
    metaTitle: "Anodizasyon Hizmeti | Tip I-II-III Sert Anodizasyon | MIL-A-8625 | Mas Technic",
    metaDescription: "Tip I, II ve III anodizasyon. 5-100µm kaplama, 60-70 HRC sertlik, ASTM B117 tuz spreyi testi ile korozyon direnci doğrulaması. 20+ renk seçeneği, havacılık ve medikal uygulamalar.",
    description:
      "Tip I kromik asit, Tip II sülfürik asit ve Tip III sert anodizasyon ile korozyon direnci, aşınma dayanımı, elektriksel yalıtım ve dekoratif kaplama.",
    heroImage: "hero-anodizasyon",
    content: [
      "Anodizasyon, alüminyum yüzeyinde elektrokimyasal yöntemle oluşturulan alüminyum oksit (Al₂O₃) tabakasıdır. Bu tabaka, parçanın korozyon direncini, aşınma dayanımını ve estetik görünümünü önemli ölçüde artırır. Mas Technic olarak havacılık ve medikal uygulamalar için Tip I, Tip II ve Tip III anodizasyon hizmeti sunuyoruz.",
      "Tip I (Kromik Asit) anodizasyon 5-15µm kalınlıkta ince bir oksit tabakası oluşturur; havacılık yapısal parçaları ve boya tutunma alt katmanı olarak tercih edilir. Tip II (Sülfürik Asit) anodizasyon 10-25µm kalınlıkta olup en yaygın kullanılan türdür; korozyon koruması, renkli kaplama ve genel mühendislik uygulamalarında idealdir. Tip III (Sert Anodizasyon) 25-100µm kalınlıkta, 60-70 HRC sertliğe ulaşarak aşınma direnci, elektriksel yalıtım ve yüksek performans gerektiren uygulamalarda kullanılır.",
      "Renklendirme sürecimizde organik ve inorganik boyalar kullanarak siyah, kırmızı, mavi, yeşil, altın, bronz, mor, turuncu, sarı, füme ve naturel (renksiz) dahil 20+ renk seçeneği sunuyoruz. Renk homojenliği ΔE ≤ 2.0 toleransında kontrol edilmektedir. Sealing (sızdırmazlık) işlemi ile oksit tabakasının gözenekleri kapatılarak uzun ömürlü koruma sağlanır.",
      "Kalite kontrol sürecimiz: Eddy current veya mikrometre ile kaplama kalınlığı ölçümü, ASTM B117 tuz spreyi testi ile korozyon direnci doğrulaması, Vickers mikrosertlik testi ile sertlik kontrolü ve renk ölçüm cihazı ile ΔE renk homojenliği kontrolü. Her parti için ölçüm kaydı tutulur.",
      "2000×1000×800mm tank boyutlarımız ile büyük parçalarda da anodizasyon uygulayabiliyoruz. 50 kg/parça maksimum ağırlık kapasitesi, 24-72 saat standart teslimat süresi ve havacılık, otomotiv, medikal, elektronik ve savunma sanayi sektörlerine hizmet veriyoruz.",
    ],
    features: [
      "Tip I (Kromik Asit) — 5-15µm, havacılık yapısal parçalar, boya alt katmanı",
      "Tip II (Sülfürik Asit) — 10-25µm, korozyon koruması, renkli kaplama",
      "Tip III (Sert Anodizasyon) — 25-100µm, 60-70 HRC sertlik, aşınma direnci",
      "20+ Renk Seçeneği — Organik ve inorganik boyalar, ΔE ≤ 2.0 homojenlik",
      "Tip I / II / III — MIL-A-8625 kaplama sınıfları",
      "ASTM B117 Tuz Testi — Korozyon direnci doğrulaması",
    ],
    technicalSpecs: [
      { label: "Kaplama Kalınlığı", value: "5-100µm" },
      { label: "Sertlik (Tip III)", value: "60-70 HRC" },
      { label: "Tuz Testi", value: "500+ saat (ASTM B117)" },
      { label: "Kaplama Sınıfı", value: "MIL-A-8625 Tip I / II / III" },
      { label: "Tank Boyutu", value: "2000×1000×800mm" },
      { label: "Renk Seçeneği", value: "20+ renk" },
    ],
    processSteps: [
      "Yüzey Temizliği & Yağ Giderme",
      "Dağlama (Etching)",
      "Anodizasyon Banyosu",
      "Renklendirme (Opsiyonel)",
      "Sealing (Sızdırmazlık)",
      "Kalite Kontrol & Raporlama",
    ],
    advantages: [
      "4 farklı anodizasyon tipi (Tip I, II, III ve dekoratif)",
      "Tip I, Tip II ve Tip III kaplama sınıfları",
      "ASTM B117 tuz testi ile korozyon direnci doğrulaması",
      "20+ renk seçeneği ile dekoratif ve fonksiyonel kaplama",
      "2000×1000×800mm tank boyutu ile büyük parça kapasitesi",
      "24-72 saat standart teslimat süresi",
      "Kaplama kalınlığı ve sertlik ölçümü ile kalite kontrolü",
      "Havacılık, otomotiv, medikal ve savunma sektörü deneyimi",
    ],
    materials: [
      { name: "Alüminyum 6061-T6", grade: "Al-Mg-Si alaşımı", properties: "En yaygın, mükemmel anodize uyumu, homojen renk" },
      { name: "Alüminyum 7075-T6", grade: "Al-Zn-Mg alaşımı", properties: "Yüksek dayanımlı, anodize renk tonu farklılığı olabilir" },
      { name: "Alüminyum 5083", grade: "Al-Mg alaşımı", properties: "Denizcilik sınıfı, iyi korozyon direnci" },
      { name: "Alüminyum 2024-T3", grade: "Al-Cu alaşımı", properties: "Havacılık, bakır içeriği renk homojenliğini etkileyebilir" },
      { name: "Titanyum Grade 2", grade: "Saf titanyum", properties: "Medikal ve havacılık, özel anodizasyon parametreleri" },
      { name: "Alüminyum Döküm (A356)", grade: "Al-Si-Mg döküm", properties: "Döküm parçalar, gözeneklilik anodize kalitesini etkiler" },
    ],
    faq: [
      { question: "Anodizasyon hangi metallere uygulanabilir?", answer: "Temel olarak alüminyum ve alaşımlarına uygulanır. Titanyum ve magnezyum da anodize edilebilir. En yaygın uygulama Al 6061 ve 7075 serisi alaşımlardır." },
      { question: "Sert anodizasyon (Tip III) ile normal (Tip II) farkı nedir?", answer: "Tip III sert anodizasyon 25-100µm kalınlıkta olup 60-70 HRC sertlik sağlar, aşınma direnci ve elektriksel yalıtım gerektiğinde tercih edilir. Tip II 10-25µm olup genel korozyon koruması ve dekoratif kaplama için uygundur." },
      { question: "Anodizasyon boyut değişikliğine neden olur mu?", answer: "Evet, oksit tabakasının yaklaşık %50'si malzemeye nüfuz eder, %50'si yüzeyden dışarı büyür. Örneğin 25µm Tip II kaplama ~12.5µm boyut artışı yapar. Bu değer işleme toleranslarında dikkate alınmalıdır." },
      { question: "Hangi renklerde anodizasyon yapabiliyorsunuz?", answer: "Siyah, kırmızı, mavi, yeşil, altın, bronz, mor, turuncu, sarı, füme ve naturel dahil 20+ renk seçeneği sunuyoruz. Özel RAL ve Pantone renk eşleştirmesi de yapabiliyoruz." },
      { question: "Kaplama ne kadar dayanıklıdır?", answer: "Kaplamalarımızın korozyon direnci ASTM B117 tuz spreyi testi ile doğrulanır. Sert anodizasyon ile çelik sertliğine yakın aşınma direnci elde edilir." },
      { question: "Anodizasyon teslimat süreniz ne kadar?", answer: "Standart siparişlerde 24-72 saat, büyük partilerde 3-5 iş günü teslimat süremiz bulunmaktadır. Ekspres hizmet ile aynı gün teslimat da mümkündür." },
    ],
    comparisonTables: [
      {
        title: "Anodizasyon Tipleri Karşılaştırması",
        description: "Uygulamanıza en uygun anodizasyon tipini belirleyin",
        headers: ["Özellik", "Tip I (Kromik Asit)", "Tip II (Sülfürik Asit)", "Tip III (Sert Anodizasyon)"],
        rows: [
          ["Kaplama Kalınlığı", "5-15µm", "10-25µm", "25-100µm"],
          ["Sertlik", "200-400 HV", "200-400 HV", "400-600 HV (60-70 HRC)"],
          ["Korozyon Direnci (Tuz Testi)", "336+ saat", "500+ saat", "500+ saat"],
          ["Renklendirme", "Sınırlı", "20+ renk", "Sınırlı (siyah, koyu tonlar)"],
          ["Elektriksel Yalıtım", "Orta", "İyi", "Mükemmel (50V/µm)"],
          ["Aşınma Direnci", "Düşük", "Orta", "Yüksek (çelik eşdeğeri)"],
          ["Uygun Uygulama", "Havacılık yapısal, boya altı", "Genel mühendislik, dekoratif", "Silindir, piston, mil yüzeyleri"],
          ["Standart", "MIL-A-8625 Tip I", "MIL-A-8625 Tip II", "MIL-A-8625 Tip III"],
          ["Maliyet", "$", "$$", "$$$"],
        ],
      },
      {
        title: "Alüminyum Alaşımlarının Anodize Uyumluluğu",
        description: "Alaşım seçiminin anodizasyon kalitesi üzerindeki etkisi",
        headers: ["Alaşım", "Anodize Uyumu", "Renk Homojenliği", "Kaplama Kalitesi", "Önerilen Tip", "Notlar"],
        rows: [
          ["6061-T6", "★★★★★", "Mükemmel", "Homojen, pürüzsüz", "Tip I, II, III", "En yaygın, ideal anodize malzemesi"],
          ["7075-T6", "★★★★☆", "İyi", "Hafif ton farkı olabilir", "Tip II, III", "Zn içeriği renk tonunu etkileyebilir"],
          ["5083", "★★★★☆", "İyi", "Homojen", "Tip II", "Denizcilik, iyi korozyon direnci"],
          ["2024-T3", "★★★☆☆", "Orta", "Bakır çizgileri görülebilir", "Tip I, II", "Cu içeriği renk homojenliğini bozabilir"],
          ["A356 (Döküm)", "★★☆☆☆", "Düşük", "Gözenekli, düzensiz", "Tip II", "Döküm kalitesi kritik, ön işlem gerekir"],
          ["MIC-6 (Döküm)", "★★★☆☆", "Orta", "Kabul edilebilir", "Tip II", "Hassas döküm plakalar için uygun"],
        ],
      },
      {
        title: "Kaplama Sonrası Boyut Değişimi Hesaplama",
        description: "İşleme toleranslarını planlarken kaplama payını hesaba katın",
        headers: ["Anodizasyon Tipi", "Kaplama Kalınlığı", "Yüzeye Eklenen", "Malzemeye Nüfuz", "Net Boyut Artışı (çap)", "Tolerans Etkisi"],
        rows: [
          ["Tip I", "10µm", "~5µm", "~5µm", "+10µm", "±3µm"],
          ["Tip II (Standart)", "20µm", "~10µm", "~10µm", "+20µm", "±5µm"],
          ["Tip II (Kalın)", "25µm", "~12.5µm", "~12.5µm", "+25µm", "±5µm"],
          ["Tip III (İnce)", "25µm", "~12.5µm", "~12.5µm", "+25µm", "±8µm"],
          ["Tip III (Standart)", "50µm", "~25µm", "~25µm", "+50µm", "±10µm"],
          ["Tip III (Kalın)", "75µm", "~37.5µm", "~37.5µm", "+75µm", "±15µm"],
        ],
      },
    ],
  },
  {
    slug: "kimyasal-islemler",
    category: "hizmetler",
    categoryLabel: "Yüzey İşlemleri",
    title: "Kimyasal İşlemler",
    heroImage: "hero-kimyasal-islemler",
    metaTitle: "Kimyasal Yüzey İşlemleri | Pasivasyon & Fosfatlama | Mas Technic",
    metaDescription: "Endüstriyel yağ giderme, pasivasyon, fosfatlama ve elektropolish. ASTM B117 tuz spreyi ve ASTM A967 pasivasyon test yöntemleri ile doğrulama.",
    description:
      "Yağ giderme, pasivasyon, fosfatlama ve elektropolish ile yüzey temizliği ve sonraki işlemlere hazırlık.",
    content: [
      "Kimyasal yüzey işlemleri ile parçalarınızın korozyon direncini artırıyoruz. Endüstriyel yıkama ve ultrasonik yağ giderme, paslanmaz çelik korozyon koruması için pasivasyon, boya tutunması için fosfatlama yüzey hazırlığı, paslanmaz çelik parlatma için elektropolish ve köşeli kısımları yumuşatma için deburring işlemleri gerçekleştiriyoruz.",
      "ASTM B117 tuz spreyi ve ASTM A967 pasivasyon test yöntemleri ile doğrulama yapıyoruz; kaplama kalınlığı 1-25µm aralığındadır.",
    ],
    features: [
      "Yağ Giderme — Endüstriyel yıkama, ultrasonik",
      "Pasivasyon — Paslanmaz çelik korozyon koruması",
      "Fosfatlama — Boya tutunması için yüzey hazırlığı",
      "Elektropolish — Paslanmaz çelik parlatma",
      "Deburring — Köşeli kısımları yumuşatma",
    ],
    technicalSpecs: [
      { label: "Tuz Testi", value: "500+ saat" },
      { label: "Kaplama Kalınlığı", value: "1-25µm" },
      { label: "Test Yöntemi", value: "ASTM B117 tuz spreyi" },
      { label: "Pasivasyon", value: "ASTM A967" },
    ],
    processSteps: [
      "Yüzey Analizi",
      "Ön Temizlik",
      "Kimyasal İşlem",
      "Durulama",
      "Kurutma & Kontrol",
    ],
    advantages: [
      "500+ saat tuz testi dayanımı",
      "ASTM standartlarına tam uyum",
      "Ultrasonik temizlik kapasitesi",
      "Sonraki işlemlere hazır yüzey",
    ],
    comparisonTables: [
      {
        title: "Kimyasal Yüzey İşlem Yöntemleri",
        headers: ["İşlem", "Uygulanan Malzeme", "Kaplama/Etki", "Korozyon Direnci", "Standart", "Uygulama"],
        rows: [
          ["Pasivasyon (Nitrik)", "Paslanmaz çelik", "Krom oksit tabaka", "500+ saat", "ASTM A967", "Medikal, gıda"],
          ["Pasivasyon (Sitrik)", "Paslanmaz çelik", "Krom oksit tabaka", "500+ saat", "ASTM A967", "Çevreci alternatif"],
          ["Fosfatlama (Çinko)", "Çelik", "5-15µm çinko fosfat", "200+ saat", "MIL-DTL-16232", "Boya altı hazırlık"],
          ["Fosfatlama (Mangan)", "Çelik", "5-25µm mangan fosfat", "150+ saat", "MIL-DTL-16232", "Aşınma direnci, yağ tutma"],
          ["Elektropolish", "Paslanmaz çelik", "Yüzey düzeltme", "750+ saat", "ASTM B912", "Medikal, gıda, optik"],
          ["Alodine (Chromate)", "Alüminyum", "0.5-4µm dönüşüm", "168+ saat", "MIL-DTL-5541", "Boya altı, iletkenlik"],
        ],
      },
    ],
  },
  {
    slug: "boya-koruyucu-kaplamalar",
    category: "hizmetler",
    categoryLabel: "Yüzey İşlemleri",
    title: "Boya & Koruyucu Kaplamalar",
    heroImage: "hero-boya-kaplama",
    metaTitle: "Toz Boya & Koruyucu Kaplamalar | RAL Renkler | Mas Technic",
    metaDescription: "Toz boya, ıslak boya, seramik ve PTFE kaplama. 1000+ saat tuz testi, 260°C sıcaklık dayanımı. RAL standart ve özel renkler.",
    description:
      "Toz boya, ıslak boya, seramik kaplama ve özel koruyucu kaplamalar. Endüstriyel uygulamalardan dekoratif yüzeylere kadar.",
    content: [
      "Toz boya (60-120µm, çevre dostu ve dayanıklı), ıslak boya (25-50µm, düzgün yüzey), seramik kaplama (50-100µm, yüksek sıcaklık dayanımı) ve E-kap (20-40µm, elektriksel yalıtım) olmak üzere 4 farklı boya türü ile hizmet veriyoruz.",
      "RAL 9005 (Siyah), 9010 (Beyaz), 9006 (Gri), 3000 (Kırmızı), 5015 (Mavi), 6018 (Yeşil), 1003 (Sarı), 2004 (Turuncu) ve özel RAL renkleri dahil geniş renk yelpazesi sunuyoruz. 1000+ saat tuz testi dayanımı ve 260°C PTFE sıcaklık dayanımı ile üstün koruma sağlıyoruz.",
    ],
    features: [
      "Toz Boya — 60-120µm, çevre dostu ve dayanıklı",
      "Islak Boya — 25-50µm, düzgün yüzey",
      "Seramik Kaplama — 50-100µm, yüksek sıcaklık",
      "E-Kap — 20-40µm, elektriksel yalıtım",
    ],
    technicalSpecs: [
      { label: "Kaplama Kalınlığı", value: "20-120µm" },
      { label: "Sıcaklık Dayanımı", value: "260°C (PTFE)" },
      { label: "Sürtünme Katsayısı", value: "0.05 (PTFE)" },
      { label: "Tuz Testi", value: "1000+ saat" },
    ],
    processSteps: [
      "Yüzey Hazırlığı",
      "Astar Uygulama",
      "Boya / Kaplama",
      "Fırınlama / Kürleme",
      "Kalite Kontrol",
    ],
    advantages: [
      "4 farklı boya/kaplama türü",
      "RAL standart ve özel renkler",
      "1000+ saat tuz testi dayanımı",
      "260°C sıcaklık dayanımlı PTFE kaplama",
    ],
    comparisonTables: [
      {
        title: "Boya & Kaplama Türleri Karşılaştırması",
        headers: ["Kaplama Türü", "Kalınlık", "Sıcaklık Dayanımı", "Tuz Testi", "Sürtünme Kats.", "Uygulama"],
        rows: [
          ["Toz Boya (Polyester)", "60-120µm", "180°C", "1000+ saat", "0.30-0.40", "Dış mekan, dekoratif"],
          ["Toz Boya (Epoksi)", "60-100µm", "120°C", "1500+ saat", "0.35-0.45", "İç mekan, kimyasal direnci"],
          ["Islak Boya (2K PU)", "25-50µm", "130°C", "500+ saat", "0.30-0.40", "Düzgün yüzey, ince kaplama"],
          ["Seramik Kaplama", "50-100µm", "1000°C", "2000+ saat", "0.15-0.25", "Egzoz, motor, yüksek sıcaklık"],
          ["PTFE (Teflon)", "15-40µm", "260°C", "500+ saat", "0.05-0.10", "Yapışmazlık, düşük sürtünme"],
          ["E-Kap (Elektro Kaplama)", "20-40µm", "150°C", "1000+ saat", "0.35-0.45", "Otomotiv, elektrik yalıtım"],
          ["DLC (Diamond-Like)", "1-5µm", "350°C", "5000+ saat", "0.05-0.15", "Aşınma, medikal, uzay"],
        ],
      },
    ],
  },

  // ── Hizmetler > İşaretleme & Tanımlama ──
  {
    slug: "lazer-kazima",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "Lazer Kazıma",
    metaTitle: "Lazer Kazıma & İşaretleme | Fiber Lazer | QR Kod | Mas Technic",
    metaDescription: "20W-100W fiber lazer ile metal, plastik ve ahşapta kalıcı işaretleme. Barkod, QR kod, seri numarası. 100.000 saat lazer ömrü, 10.000 mm/s hız.",
    description:
      "Fiber lazer teknolojisi ile metal, plastik ve kompozit malzemelere yüksek kontrastlı, aşınmaz işaretleme. Barkod, QR kod ve seri numarası.",
    heroImage: "hero-lazer-kazima",
    content: [
      "20W-100W güç aralığında fiber lazer sistemlerimiz ile 100×100mm işaretleme alanında, 0.1mm minimum karakter boyutunda ve 10.000 mm/s hızda yüksek performanslı işaretleme yapıyoruz. 0.01-0.5mm kazıma derinliği kontrolü ile hassas sonuçlar elde ediyoruz.",
      "100.000 saat fiber lazer ömrü ile uzun vadeli güvenilirlik sağlıyoruz. Çelik, alüminyum, plastik ve ahşap dahil çok malzemeli işaretleme kapasitemiz ve dinamik işaretleme özelliğimiz ile yuvarlak parçalarda da mükemmel sonuçlar elde ediyoruz.",
      "Seri numarası ve parti kodu, barkod ve QR kod, logo ve marka, teknik özellikler ve standartlar ile tarih ve üretim kodu işaretleme hizmetleri sunuyoruz.",
    ],
    features: [
      "0.01mm Kazıma Derinliği — Hassas kontrol",
      "100.000 Saat Lazer Ömrü — Fiber kaynak",
      "Çok Malzeme — Çelik, alüminyum, plastik, ahşap",
      "Dinamik İşaretleme — Yuvarlak parçalar için",
    ],
    technicalSpecs: [
      { label: "Lazer Gücü", value: "20W-100W" },
      { label: "İşaretleme Alanı", value: "100×100mm" },
      { label: "Min. Karakter", value: "0.1mm" },
      { label: "Hız", value: "10.000 mm/s" },
      { label: "Kazıma Derinliği", value: "0.01-0.5mm" },
    ],
    processSteps: [
      "Tasarım & Programlama",
      "Malzeme Analizi",
      "Parametre Ayarlama",
      "Lazer İşaretleme",
      "Okuma Doğrulama",
    ],
    advantages: [
      "100.000 saat fiber lazer ömrü",
      "10.000 mm/s işaretleme hızı",
      "Çoklu malzeme desteği",
      "Dinamik (yuvarlak parça) işaretleme",
    ],
    comparisonTables: [
      {
        title: "Lazer İşaretleme Teknoloji Karşılaştırması",
        headers: ["Lazer Tipi", "Dalga Boyu", "Güç Aralığı", "Uygun Malzeme", "Hız", "Uygulama"],
        rows: [
          ["Fiber Lazer", "1064nm", "20-100W", "Metal, plastik", "10.000 mm/s", "Genel amaç, seri üretim"],
          ["CO₂ Lazer", "10.600nm", "10-60W", "Ahşap, plastik, deri", "5.000 mm/s", "Organik malzeme, ambalaj"],
          ["UV Lazer", "355nm", "3-15W", "Plastik, cam, silikon", "3.000 mm/s", "Hassas, ısıya duyarlı"],
          ["Yeşil Lazer", "532nm", "5-20W", "Bakır, altın, PCB", "5.000 mm/s", "Yansıtıcı metaller"],
          ["MOPA Fiber", "1064nm", "20-60W", "Metal (renkli)", "8.000 mm/s", "Renkli işaretleme, paslanmaz"],
        ],
        highlight: 0,
      },
      {
        title: "Malzeme Bazlı Lazer İşaretleme Parametreleri",
        headers: ["Malzeme", "Önerilen Lazer", "Güç", "Hız", "Kontrast", "Notlar"],
        rows: [
          ["Paslanmaz Çelik", "Fiber / MOPA", "20-50W", "500-2000 mm/s", "Yüksek", "Siyah oksit veya beyaz tavlama"],
          ["Alüminyum", "Fiber", "30-60W", "800-3000 mm/s", "Orta-Yüksek", "Eloksal üzeri mükemmel"],
          ["Titanyum", "Fiber / MOPA", "20-40W", "300-1500 mm/s", "Yüksek", "Renkli tavlama mümkün"],
          ["ABS Plastik", "Fiber / UV", "5-20W", "1000-5000 mm/s", "Orta", "Renk değişimi ile"],
          ["Cam", "UV / CO₂", "3-10W", "200-800 mm/s", "Orta", "Mikro çatlak tekniği"],
          ["Sertleştirilmiş Çelik", "Fiber", "30-80W", "300-1000 mm/s", "Çok yüksek", "Derin kazıma mümkün"],
        ],
      },
    ],
  },
  {
    slug: "tavlama",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "Tavlama",
    heroImage: "hero-tavlama",
    description:
      "Stress giderme, yumuşatma, sertleştirme ve normalizasyon tavlama işlemleri ile malzeme mekanik özelliklerinin optimize edilmesi.",
    content: [
      "Stress giderme tavlaması (550-650°C, gerilme giderme), yumuşatma tavlaması (680-720°C, işlenebilirlik artırma), sertleştirme tavlaması (800-900°C, sertlik artışı) ve normalizasyon tavlaması (850-950°C, tane inceltme) olmak üzere 4 farklı tavlama türü sunuyoruz.",
      "Özellikle paslanmaz çelik ve titanyum parçalarda tercih edilen lazer tavlama yöntemimiz ile yüzeyde malzeme çıkarmadan renk değişimi yaparak işaretleme gerçekleştiriyoruz. Yüzey bütünlüğü korunarak altın, mavi ve siyah tonlarında renk değişimi sağlıyoruz.",
    ],
    features: [
      "Stress Giderme — 550-650°C, gerilme giderme",
      "Yumuşatma — 680-720°C, işlenebilirlik artırma",
      "Sertleştirme — 800-900°C, sertlik artışı",
      "Normalizasyon — 850-950°C, tane inceltme",
    ],
    technicalSpecs: [
      { label: "Yüzey Etkisi", value: "Sıfır derinlik" },
      { label: "Renk Aralığı", value: "Altın-Mavi-Siyah" },
      { label: "Uygunluk", value: "Medikal parça" },
      { label: "Dayanıklılık", value: "Kalıcı" },
    ],
    processSteps: [
      "Malzeme Analizi",
      "Tavlama Türü Seçimi",
      "Fırın / Lazer İşlemi",
      "Soğutma Kontrolü",
      "Sertlik & Mikro Yapı Testi",
    ],
    advantages: [
      "4 farklı tavlama türü",
      "Lazer tavlama ile yüzey bütünlüğü koruması",
      "Medikal parça uygunluğu",
      "Kalıcı ve aşınmaz renk değişimi",
    ],
    comparisonTables: [
      {
        title: "Tavlama Türleri ve Parametreleri",
        headers: ["Tavlama Türü", "Sıcaklık Aralığı", "Soğutma", "Sertlik Değişimi", "Amaç", "Uygulama"],
        rows: [
          ["Stress Giderme", "550-650°C", "Fırında yavaş", "Değişmez", "İç gerilme giderme", "CNC sonrası, kaynak sonrası"],
          ["Yumuşatma", "680-720°C", "Fırında çok yavaş", "Düşer (150-200 HB)", "İşlenebilirlik artırma", "Sert çeliklerin işlenmesi"],
          ["Normalizasyon", "850-950°C", "Havada", "Homojenleşir", "Tane inceltme", "Döküm, dövme sonrası"],
          ["Tam Tavlama", "800-900°C", "Fırında yavaş", "Düşer (min.)", "Tam yumuşatma", "Soğuk şekillendirme öncesi"],
          ["Sementasyon", "880-940°C", "Yağ/su", "Yüzey 58-62 HRC", "Yüzey sertleştirme", "Dişli, mil, kam"],
          ["İndüksiyon", "850-1000°C", "Su/polimer", "Yüzey 50-60 HRC", "Lokal sertleştirme", "Mil yatağı, kam yüzeyi"],
        ],
      },
    ],
  },
  {
    slug: "qr-datamatrix-kodlari",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "QR & DataMatrix Kodları",
    heroImage: "hero-qr-datamatrix",
    description:
      "DataMatrix ve QR kod işaretleme. Küçük alanda yüksek veri kapasitesi ile kalıcı parça izlenebilirliği.",
    content: [
      "DataMatrix (2.5×2.5mm alanda 50 karakter), QR Code (5×5mm alanda 500 karakter) ve GS1-128 barkod formatlarında endüstriyel izlenebilirlik için kalıcı kod işaretleme hizmeti sunuyoruz.",
      "UID (Unique Identifier), GS1-128 Barkod, HIBC (Health Industry Bar Code) ve DoD IUID (Item Unique Identification) kodlama seçenekleri ile parça takibi, kalite kontrol ve envanter yönetimi çözümleri sağlıyoruz. İşaretlenen kodların okunabilirliği, teslimattan önce okuma doğrulamasıyla kontrol edilir.",
    ],
    features: [
      "DataMatrix — 2.5×2.5mm'de 50 karakter",
      "QR Code — 5×5mm'de 500 karakter",
      "GS1-128 Barkod — Standart barkod",
      "IUID Kodlama — Savunma sanayi izlenebilirlik",
    ],
    technicalSpecs: [
      { label: "Min. Modül Boyutu", value: "0.1mm" },
      { label: "Okuma Oranı", value: "%99.9+" },
      { label: "Sembol", value: "DataMatrix (ISO/IEC 16022)" },
      { label: "Doğrulama", value: "ISO 15415" },
    ],
    processSteps: [
      "Kod Türü Seçimi",
      "Veri Girişi & Format",
      "Lazer İşaretleme",
      "Okuma Doğrulama",
      "ISO Uyum Raporu",
    ],
    advantages: [
      "Küçük alanda yüksek veri kapasitesi",
      "%99.9+ okuma oranı",
      "ISO/IEC standartlarına tam uyum",
      "Savunma sanayi IUID desteği",
    ],
    comparisonTables: [
      {
        title: "Endüstriyel Kod Türleri Karşılaştırması",
        headers: ["Kod Türü", "Veri Kapasitesi", "Min. Alan", "Hata Düzeltme", "Okuma Mesafesi", "Uygulama"],
        rows: [
          ["DataMatrix (ECC200)", "2.335 alfanümerik", "2.5×2.5mm", "%30 (Reed-Solomon)", "Yakın (50cm)", "Küçük parça, havacılık"],
          ["QR Code", "4.296 alfanümerik", "5×5mm", "%30 (Level H)", "Uzak (2m+)", "Genel, mobil okuma"],
          ["GS1-128 Barkod", "48 karakter", "25×10mm", "Düşük", "Uzak (1m)", "Lojistik, stok yönetimi"],
          ["Micro QR", "35 alfanümerik", "3×3mm", "%15", "Yakın (30cm)", "Çok küçük parçalar"],
          ["PDF417", "1.850 alfanümerik", "15×5mm", "%50", "Orta (1m)", "Belge, sertifika"],
          ["UID / IUID", "Değişken", "Değişken", "Yüksek", "Değişken", "Savunma, askeri"],
        ],
      },
    ],
  },
  {
    slug: "logo-markalama",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "Logo & Markalama",
    heroImage: "hero-logo-markalama",
    description:
      "Lazer, pad printing ve serigrafi ile ürünlerinize marka kimliği kazandırın. Kalıcı ve profesyonel görünüm.",
    content: [
      "Lazer işaretleme (kalıcı, yüksek kontrast, metal ve plastik), pad printing (kavisli yüzeyler, çok renkli), serigrafi (büyük yüzeyler, yüksek hacim) ve etiket (geçici, değiştirilebilir) olmak üzere 4 farklı markalama yöntemi sunuyoruz.",
      "Farklı malzeme türlerinde tutarlı markalama sonuçları elde ediyoruz. 1200 DPI çözünürlük, ±0.01 mm konumlandırma tekrarlanabilirliği ve 300×300mm'ye kadar işaretleme alanı ile logo ve marka işaretleme yapıyoruz.",
    ],
    features: [
      "Lazer — Kalıcı, yüksek kontrast, metal/plastik",
      "Pad Printing — Kavisli yüzeyler, çok renkli",
      "Serigrafi — Büyük yüzeyler, yüksek hacim",
      "Etiket — Geçici, değiştirilebilir",
    ],
    technicalSpecs: [
      { label: "Çözünürlük", value: "1200 DPI" },
      { label: "Tekrarlanabilirlik", value: "±0.01mm" },
      { label: "Maks. Alan", value: "300×300mm" },
      { label: "Kontrol", value: "Numune onayı sonrası seri" },
    ],
    processSteps: [
      "Tasarım İnceleme",
      "Yöntem Seçimi",
      "Numune Çalışması",
      "Seri İşaretleme",
      "Kalite Kontrol",
    ],
    advantages: [
      "4 farklı markalama yöntemi",
      "1200 DPI yüksek çözünürlük",
      "Kavisli yüzeylerde pad printing",
      "Numune onayından sonra tekrarlanabilir seri işaretleme",
    ],
    comparisonTables: [
      {
        title: "Markalama Yöntemleri Karşılaştırması",
        headers: ["Yöntem", "Çözünürlük", "Dayanıklılık", "Renk", "Yüzey Tipi", "Maliyet/Parça", "Hacim"],
        rows: [
          ["Lazer İşaretleme", "0.01mm", "Kalıcı (ömür boyu)", "Tek ton", "Düz/kavisli", "$$", "1-1M+"],
          ["Pad Printing", "0.1mm", "İyi (1000+ saat)", "Çok renkli", "Kavisli ideal", "$", "100-100K"],
          ["Serigrafi", "0.2mm", "İyi (500+ saat)", "Çok renkli", "Düz yüzey", "$", "500-1M+"],
          ["Etiket (Vinil)", "DPI bazlı", "Orta (dış mekan 3-5 yıl)", "Full color", "Düz", "$", "1-10K"],
          ["Tampon Baskı", "0.1mm", "Orta", "Çok renkli", "Düzensiz yüzey", "$", "100-50K"],
        ],
      },
    ],
  },

  // ── Hizmetler > Montaj & Birleştirme ──
  {
    slug: "insert-uygulama",
    category: "hizmetler",
    categoryLabel: "Montaj & Birleştirme",
    title: "Insert Uygulama",
    heroImage: "hero-insert-uygulama",
    description:
      "Metal insertlerin plastik ve metal parçalara ultrasonik, ısıl veya presle montajı. Somun, perçin ve pim uygulama.",
    content: [
      "Ultrasonik insert (plastik için, hızlı ve temiz), ısıl insert (yüksek çekme direnci), pres insert / self-tapping (ekonomik çözüm) ve mold-in insert (en yüksek dayanım) olmak üzere 4 farklı insert uygulama yöntemi sunuyoruz.",
      "Pirinç (nikel kaplamalı, genel amaçlı), çelik (çinko kaplamalı, yüksek dayanım) ve paslanmaz (kaplamasız, korozyon direnci) insert malzemeleri ile M2-M12 çap aralığında, 2000N+ çekme kuvveti ve 3 saniyenin altında çevrim süresi ile hızlı ve güçlü bağlantılar oluşturuyoruz.",
    ],
    features: [
      "Ultrasonik Insert — Plastik için, hızlı ve temiz",
      "Isıl Insert — Yüksek çekme direnci",
      "Pres Insert (Self-tapping) — Ekonomik çözüm",
      "Mold-in Insert — En yüksek dayanım",
    ],
    technicalSpecs: [
      { label: "Yöntem", value: "Ultrasonik / Isıl / Pres" },
      { label: "Çekme Kuvveti", value: "2000N+" },
      { label: "Insert Çapı", value: "M2-M12" },
      { label: "Çevrim Süresi", value: "<3 saniye" },
    ],
    processSteps: [
      "Insert Türü Seçimi",
      "Delik Hazırlığı",
      "Insert Yerleştirme",
      "Çekme Testi",
      "Kalite Kontrol",
    ],
    advantages: [
      "4 farklı insert uygulama yöntemi",
      "3 farklı insert malzeme seçeneği",
      "Çekme testi ile doğrulanan insert bağlantısı",
      "<3 saniye çevrim süresi",
    ],
    comparisonTables: [
      {
        title: "Insert Uygulama Yöntemleri Karşılaştırması",
        headers: ["Yöntem", "Çekme Kuvveti", "Çevrim Süresi", "Uygun Malzeme", "Maliyet", "Avantaj"],
        rows: [
          ["Ultrasonik", "1500-2500N", "<2 sn", "Termoplastik", "$$", "Hızlı, temiz, tekrarlanabilir"],
          ["Isıl (Heat Staking)", "2000-3500N", "3-5 sn", "Termoplastik", "$$", "Yüksek çekme direnci"],
          ["Pres (Self-tapping)", "1000-2000N", "<1 sn", "Plastik, hafif metal", "$", "Ekonomik, hızlı"],
          ["Mold-in", "3000-5000N", "Kalıplama süresi", "Enjeksiyon plastik", "$$$", "En yüksek dayanım"],
          ["Yapıştırıcı", "500-1500N", "Kürleme süresi", "Tüm malzemeler", "$", "Esnek, düşük gerilme"],
        ],
        highlight: 1,
      },
    ],
  },
  {
    slug: "mekanik-montaj",
    category: "hizmetler",
    categoryLabel: "Montaj & Birleştirme",
    title: "Mekanik Montaj",
    heroImage: "hero-mekanik-montaj",
    description:
      "Vida, somun, perçin ve klips montajı. Tork kontrollü sıkma ve otomatik besleme sistemleri ile yüksek verimlilik.",
    content: [
      "Vida ve somun montajı (tork kontrollü), pervane/pernos montajı (hidrolik presle), klips ve segman montajı (otomatik besleme), bearing montajı (özel fikstürlerle) ve O-ring/conta montajı (yağ ve toz korumalı) hizmetleri sunuyoruz.",
      "M3 (1.5-2.0 Nm), M4 (3.0-4.0 Nm), M5 (6.0-8.0 Nm) ve M6 (10.0-12.0 Nm) vida boyutlarında ±5% toleransla tork kontrollü sıkma gerçekleştiriyoruz. Fonksiyon testi, 1000+ ünite/gün kapasite ve seri numarası bazlı takip sistemi ile kaliteli montaj hizmeti sağlıyoruz.",
    ],
    features: [
      "Vida & Somun Montajı — Tork kontrollü",
      "Pervane/Pernos Montajı — Hidrolik presle",
      "Klips & Segman Montajı — Otomatik besleme",
      "Bearing & O-ring Montajı — Özel fikstürlerle",
    ],
    technicalSpecs: [
      { label: "Tork Kontrolü", value: "±5% hassasiyet" },
      { label: "Test", value: "Fonksiyon testi" },
      { label: "Kapasite", value: "1000+ ünite/gün" },
      { label: "Takip", value: "Seri no bazlı" },
    ],
    processSteps: [
      "Montaj Planı Hazırlama",
      "Bileşen Kontrolü",
      "Tork Kontrollü Montaj",
      "Fonksiyon Testi",
      "Paketleme & Etiketleme",
    ],
    advantages: [
      "Tork kontrollü hassas sıkma (±5%)",
      "Otomatik besleme sistemi ile yüksek verimlilik",
      "1000+ ünite/gün kapasite",
      "Seri numarası bazlı izlenebilirlik",
    ],
    comparisonTables: [
      {
        title: "Bağlantı Elemanı Tork Değerleri (Kuru, Sınıf 8.8)",
        headers: ["Vida Boyutu", "Tork (Nm)", "Ön Yükleme (kN)", "Anahtar Boyutu", "Tolerans (±%)", "Kontrol Yöntemi"],
        rows: [
          ["M3", "1.5-2.0", "2.5", "5.5mm", "±5%", "Dijital tork metre"],
          ["M4", "3.0-4.0", "4.5", "7mm", "±5%", "Dijital tork metre"],
          ["M5", "6.0-8.0", "8.0", "8mm", "±5%", "Tork anahtarı"],
          ["M6", "10.0-12.0", "12.0", "10mm", "±5%", "Tork anahtarı"],
          ["M8", "25.0-30.0", "22.0", "13mm", "±5%", "Tork anahtarı"],
          ["M10", "50.0-60.0", "35.0", "17mm", "±5%", "Elektronik tork"],
          ["M12", "85.0-100.0", "50.0", "19mm", "±5%", "Elektronik tork"],
        ],
      },
    ],
  },
  {
    slug: "kitting-paketleme",
    category: "hizmetler",
    categoryLabel: "Montaj & Birleştirme",
    title: "Kitting & Paketleme",
    heroImage: "hero-kitting-paketleme",
    description:
      "Müşteriye özel kit oluşturma, etiketleme ve koruyucu ambalajlama. Tedarik zinciri verimliliğini artırın.",
    content: [
      "Vakumlu (nem ve toz koruması), ESD/antistatik (elektronik parçalar), köpük (kırılabilir parçalar) ve ahşap kasa (ağır ve değerli parçalar) paketleme seçenekleri ile ürünlerinizi güvenle teslim ediyoruz.",
      "Barkodlu etiket, RFID etiket, müşteriye özel etiket tasarımı ve çoklu dil desteği ile kapsamlı etiketleme çözümleri sunuyoruz. MIL-PRF-81705 sınıfı ESD koruyucu ambalaj, VCI ve desiccant koruma dahil ve DDP/FCA teslimat seçenekleri ile profesyonel paketleme hizmeti veriyoruz.",
    ],
    features: [
      "Vakumlu Paketleme — Nem ve toz koruması",
      "ESD (Antistatik) — Elektronik parçalar için",
      "Köpük Koruma — Kırılabilir parçalar için",
      "Ahşap Kasa — Ağır ve değerli parçalar için",
    ],
    technicalSpecs: [
      { label: "ESD Koruma", value: "MIL-PRF-81705" },
      { label: "Etiketleme", value: "Barkod + QR + RFID" },
      { label: "Koruma", value: "VCI, Desiccant" },
      { label: "Teslimat", value: "DDP / FCA" },
    ],
    processSteps: [
      "Kit Listesi Hazırlama",
      "Bileşen Toplama & Sayım",
      "Koruyucu Ambalajlama",
      "Etiketleme",
      "Sevkiyat",
    ],
    advantages: [
      "MIL-PRF-81705 ESD koruma standardı",
      "RFID dahil çoklu etiketleme",
      "VCI ve desiccant koruma",
      "DDP/FCA esnek teslimat seçenekleri",
    ],
    comparisonTables: [
      {
        title: "Paketleme Türleri ve Koruma Seviyeleri",
        headers: ["Paketleme Türü", "Koruma Seviyesi", "Nem Koruma", "Darbe Koruma", "Maliyet", "Uygun Parça"],
        rows: [
          ["PE Poşet", "Temel", "Düşük", "Yok", "$", "Genel, küçük parçalar"],
          ["Vakumlu Poşet", "Yüksek", "Mükemmel", "Düşük", "$$", "Korozyona hassas metal"],
          ["ESD Torba", "Yüksek", "İyi", "Düşük", "$$", "Elektronik, PCB"],
          ["Köpük Yerleştirme", "Çok yüksek", "Orta", "Mükemmel", "$$$", "Hassas, kırılgan parçalar"],
          ["VCI Kağıt/Film", "Yüksek", "Mükemmel", "Düşük", "$$", "Uzun süreli metal depolama"],
          ["Ahşap Kasa", "Maksimum", "İyi", "Çok yüksek", "$$$$", "Ağır, büyük, değerli"],
        ],
      },
    ],
  },
  {
    slug: "kaynakli-imalat",
    category: "hizmetler",
    categoryLabel: "Montaj & Birleştirme",
    title: "Kaynaklı İmalat",
    heroImage: "hero-kaynakli-imalat",
    description:
      "TIG, MIG/MAG ve direnç kaynağı ile metal parçaların birleştirilmesi. Yazılı kaynak prosedürü ve tahribatsız muayene ile kalite kontrol.",
    content: [
      "TIG kaynak (Al, çelik, Ti; 0.5-10mm; hassas uygulamalar), MIG/MAG kaynak (çelik, Al; 1-20mm; hızlı üretim) ve direnç kaynağı (çelik; 0.2-3mm; nokta kaynak) yöntemleri ile metal parçaların birleştirilmesini gerçekleştiriyoruz.",
      "Kaynak işlemleri yazılı kaynak prosedürü (WPS) ile yürütülür; kullanılan parametreler ve sarf malzemeleri iş bazında kayıt altına alınır. RT, UT, PT ve MT tahribatsız muayene yöntemleri ile kaynak dikişleri kontrol edilir ve sonuçlar teslimat dosyasına eklenir.",
    ],
    features: [
      "TIG Kaynak — Al, çelik, Ti; 0.5-10mm; hassas",
      "MIG/MAG Kaynak — Çelik, Al; 1-20mm; hızlı üretim",
      "Direnç Kaynağı — Çelik; 0.2-3mm; nokta kaynak",
      "Yazılı Kaynak Prosedürü — WPS ile yürütülen kaynak",
    ],
    technicalSpecs: [
      { label: "Prosedür", value: "WPS ile kaynak" },
      { label: "Kalınlık", value: "0.2-20 mm" },
      { label: "NDT", value: "RT, UT, PT, MT" },
      { label: "Malzemeler", value: "Al, SS, Ti, Ni" },
    ],
    processSteps: [
      "Kaynak Prosedürü (WPS)",
      "Malzeme & Ekipman Hazırlık",
      "Kaynak İşlemi",
      "NDT Muayene",
      "Kalite Raporu",
    ],
    advantages: [
      "Yazılı kaynak prosedürü (WPS) ile üretim",
      "4 farklı NDT muayene yöntemi",
      "Kaynak dikişlerinde muayene ve ölçüm kaydı",
      "TIG, MIG/MAG ve direnç kaynağı kapasitesi",
    ],
    comparisonTables: [
      {
        title: "Kaynak Yöntemleri Karşılaştırması",
        headers: ["Yöntem", "Malzeme Kalınlığı", "Hız", "Isı Girdisi", "Deformasyon", "Uygulama"],
        rows: [
          ["TIG (GTAW)", "0.5-10mm", "Düşük", "Düşük-Orta", "Düşük", "Hassas, ince iş, Al/Ti"],
          ["MIG/MAG (GMAW)", "1-20mm", "Yüksek", "Orta-Yüksek", "Orta", "Seri üretim, çelik/Al"],
          ["Direnç (Nokta)", "0.2-3mm", "Çok yüksek", "Düşük (lokal)", "Çok düşük", "Sac metal, otomotiv"],
          ["Lazer Kaynak", "0.1-8mm", "Çok yüksek", "Çok düşük", "Minimum", "Hassas, medikal, elektronik"],
          ["Elektron Işın", "0.5-100mm", "Orta", "Çok düşük", "Minimum", "Havacılık, nükleer"],
          ["Sürtünme Karıştırma", "1-50mm", "Orta", "Düşük", "Düşük", "Al alaşımlar, uzay"],
        ],
      },
      {
        title: "NDT (Tahribatsız Muayene) Yöntemleri",
        headers: ["Yöntem", "Kısaltma", "Tespit Yeteneği", "Hassasiyet", "Uygulama Hızı", "Standart"],
        rows: [
          ["Radyografik Test", "RT", "İç hatalar, gözeneklilik", "Yüksek", "Yavaş", "EN ISO 17636"],
          ["Ultrasonik Test", "UT", "İç çatlak, delaminasyon", "Çok yüksek", "Orta", "EN ISO 17640"],
          ["Penetrant Test", "PT", "Yüzey çatlakları", "Yüksek", "Orta", "EN ISO 3452"],
          ["Manyetik Parçacık", "MT", "Yüzey/yüzey altı çatlak", "Yüksek", "Hızlı", "EN ISO 17638"],
          ["Görsel Muayene", "VT", "Yüzey kusurları", "Orta", "Çok hızlı", "EN ISO 17637"],
        ],
      },
    ],
  },

  // ── Kabiliyetler > Üretim Altyapısı ──
  /* MACHINE PARK — rewritten in Phase 06.

     Every sentence on this page was an inventory disclosure, an invented one,
     or both: `15.000 m² üretim alanı`, `50+ tezgah`, per-model work envelopes
     and spindle speeds, a `24/7` production mode, a named calibration
     instrument, and a 2024-2026 capital-investment plan. `USER_INPUTS.md` §D
     marks MACHINE_COUNT, FACILITY_SIZE and REVENUE_OR_ORDER_VOLUME
     PRIVATE_DO_NOT_DISCLOSE, and §0 sets DO_NOT_EMPHASIZE_COMPANY_SCALE: YES.
     Nothing here was verifiable and none of it was publishable.

     The page keeps its slug and its title because `src/components/navigation/
     ia.ts` links to both. What it describes now is the PROCESS FAMILY set —
     which is derived from the repository's own service pages (§E
     MUST_KEEP_SERVICES: DERIVE_FROM_REPO) — and how a process is chosen for a
     part. That is what a buyer needs from this page anyway: not how many
     machines exist, but whether the geometry can be made and how.            */
  {
    slug: "makine-parkuru",
    category: "kabiliyetler",
    categoryLabel: "Üretim Altyapısı",
    title: "Makine Parkuru",
    metaTitle: "Üretim Kabiliyetleri | CNC Freze, Torna, Erozyon | Mas Technic",
    metaDescription:
      "5 eksen CNC frezeleme, C/Y eksenli tornalama, Swiss tornalama, derin delik işleme ve tel erozyon kabiliyetleri. Parça geometrisine göre proses seçimi.",
    description:
      "Bir parçanın hangi tezgâhta üretileceği, geometrisi ve tolerans zinciri tarafından belirlenir. Proses ailelerimiz, bu kararı parçanın gereksinimine göre verebilmek üzere birlikte planlanır.",
    heroImage: "hero-makine-parkuru",
    content: [
      "Üretim planlaması bir tezgâh listesiyle değil, parçanın kendisiyle başlar. Bağlama sayısı, erişilmesi gereken yüzeyler, ölçü zinciri ve malzemenin davranışı; hangi proses ailesinin kullanılacağını ve hangi sırayla işleneceğini belirler.",
      "5 eksen simültane frezeleme, tek bağlamada birden fazla yüzeye erişim gerektiren geometrilerde kullanılır. Bağlama sayısını azaltmak yalnızca süreyi kısaltmaz; her yeni bağlama ölçü zincirine yeni bir hata kaynağı eklediği için doğrudan tolerans lehine çalışır.",
      "C ve Y eksenli tornalama, dönel parçalarda torna ve freze operasyonlarını tek kurulumda toplar. Kayar puntalı (Swiss tip) tornalama ise küçük çaplı, uzun parçalarda desteklenmemiş boyu kısaltarak sehimi sınırlar.",
      "Derin delik işleme, tel erozyon ve dalma erozyon; frezeleme ile ulaşılamayan geometriler için kullanılır: yüksek boy/çap oranlı kanallar, sert malzemede keskin iç köşeler, ince cidarlı kesitler.",
      "Tezgâh doğruluğu üretimin girdisidir, sonucu değildir. Bu nedenle doğruluk periyodik kontrollerle izlenir, kritik işler öncesinde test parçasıyla teyit edilir ve sapma görüldüğünde parça değil proses düzeltilir.",
    ],
    features: [
      "5 Eksen Simültane Frezeleme — tek bağlamada çok yüzeyli geometriler",
      "3 ve 4 Eksen Frezeleme — düz yüzeyler, cepler ve çevresel işleme",
      "C/Y Eksenli CNC Tornalama — dönel parçalarda torna ve freze tek kurulumda",
      "Kayar Puntalı (Swiss) Tornalama — küçük çaplı, uzun parçalar",
      "Derin Delik İşleme — yüksek boy/çap oranlı delikler",
      "Tel ve Dalma Erozyon — sert malzemede keskin iç köşeler",
    ],
    technicalSpecs: [
      { label: "Freze Konfigürasyonu", value: "3, 4 ve 5 eksen" },
      { label: "Torna Konfigürasyonu", value: "C ve Y eksen, kayar punta" },
      { label: "Standart Tolerans", value: "±0.01 mm" },
      { label: "Proses Seçimi", value: "Geometri ve ölçü zincirine göre" },
      { label: "Doğruluk Takibi", value: "Periyodik kontrol + test parçası" },
      { label: "Kontrol", value: "Kontrol planına göre ölçüm" },
    ],
    processSteps: [
      "Teknik İnceleme",
      "Proses Seçimi",
      "Kapasite Planlama",
      "CAM Programlama",
      "Kurulum & Bağlama",
      "CNC İşleme",
      "Ara Kontrol",
      "Son Kontrol",
    ],
    advantages: [
      "Proses, parçanın geometrisine göre seçilir; parça prosese uydurulmaz",
      "Bağlama sayısı ölçü zinciri gözetilerek en aza indirilir",
      "Tezgâh doğruluğu periyodik kontrol ve test parçasıyla izlenir",
      "Kritik ölçüler için kontrol planı üretimden önce hazırlanır",
      "Frezeleme, tornalama ve erozyon aynı iş için birlikte planlanabilir",
      "Sapma görüldüğünde parça değil proses düzeltilir",
    ],
    faq: [
      { question: "Parçam hangi prosesle üretilecek?", answer: "Kararı geometri verir: erişilmesi gereken yüzeyler, ölçü zinciri, boy/çap oranı ve malzeme. Teknik inceleme sonucunda hangi prosesle ve kaç bağlamada üretileceğini teklifle birlikte paylaşırız." },
      { question: "3 eksen mi 5 eksen mi gerekir?", answer: "Düz yüzeyler ve basit cep işlemleri 3 eksende daha ekonomiktir. Alttan kesim, eğik yüzey veya tek bağlamada çok yüzey gerekiyorsa 5 eksen tercih edilir; bağlama sayısındaki azalma tolerans lehine çalışır." },
      { question: "Sert malzemede keskin iç köşe yapılabiliyor mu?", answer: "Frezeleme ile iç köşe yarıçapı takım çapıyla sınırlıdır. Bu sınırın altındaki köşeler için tel veya dalma erozyon kullanılır." },
      { question: "Tezgâh doğruluğunu nasıl teyit ediyorsunuz?", answer: "Doğruluk periyodik kontrollerle izlenir ve kritik işler öncesinde test parçası ölçümüyle teyit edilir. Ölçüm sonuçları kayıt altına alınır." },
      { question: "Uzun ve ince parçalarda ne yapıyorsunuz?", answer: "Kayar puntalı tornalama desteklenmemiş boyu kısaltarak sehimi sınırlar. Gerekirse operasyon sırası ve destek düzeni parçaya göre yeniden planlanır." },
    ],
    comparisonTables: [
      {
        title: "Proses Ailesine Göre Kullanım Alanı",
        description: "Parça geometrisine göre hangi proses ailesinin tercih edildiği",
        headers: ["Proses Ailesi", "Tipik Geometri", "Neden Tercih Edilir", "Sınırı"],
        rows: [
          ["5 Eksen Frezeleme", "Çok yüzeyli, eğik düzlemli parçalar", "Bağlama sayısını ve ölçü zincirini kısaltır", "Kurulum ve programlama süresi uzundur"],
          ["3/4 Eksen Frezeleme", "Düz yüzeyler, cepler, çevresel kanallar", "Ekonomik ve hızlı kurulum", "Alttan kesim ve eğik yüzeylerde yetersiz"],
          ["C/Y Eksenli Tornalama", "Dönel gövdeler, yan delikli miller", "Torna ve frezeyi tek kurulumda toplar", "Dönel olmayan geometriye uygun değil"],
          ["Kayar Puntalı Tornalama", "Küçük çaplı, uzun parçalar", "Desteklenmemiş boyu kısaltır, sehimi sınırlar", "Çap aralığı dardır"],
          ["Derin Delik İşleme", "Yüksek boy/çap oranlı delikler", "Doğrusallığı ve talaş tahliyesini korur", "Delik ekseni kısıtlıdır"],
          ["Tel / Dalma Erozyon", "Sert malzemede keskin iç köşeler", "Kesme kuvveti uygulamaz, formu kopyalar", "Talaş kaldırma hızı düşüktür"],
        ],
      },
      {
        title: "Doğruluk Takibi",
        description: "Tezgâh doğruluğunun izlenme biçimi",
        headers: ["Ne Zaman", "Ne Yapılır", "Ne Bırakır"],
        rows: [
          ["Vardiya başında", "Operatör kontrolü", "Operasyon kaydı"],
          ["Kritik iş öncesi", "Test parçası ölçümü", "Ölçüm kaydı"],
          ["Periyodik", "Geometri ve doğruluk kontrolü", "Bakım kaydı"],
          ["Sapma görüldüğünde", "Proses düzeltme ve yeniden doğrulama", "Düzeltici faaliyet kaydı"],
        ],
      },
    ],
  },
  {
    slug: "malzeme-kutuphanesi",
    category: "kabiliyetler",
    categoryLabel: "Üretim Altyapısı",
    title: "Malzeme Kütüphanesi",
    metaTitle: "Malzeme Kütüphanesi | İzlenebilir Tedarik | Mas Technic",
    metaDescription:
      "Alüminyumdan titanyuma, PEEK'ten Inconel'e geniş malzeme yelpazesi. Parti ve döküm kaydıyla izlenebilir tedarik; malzeme sertifikası talebe bağlı olarak sağlanır.",
    description:
      "Alüminyumdan titanyuma, plastikten kompozitlere kadar geniş bir malzeme yelpazesi ile projenize uygun çözümü sunuyoruz. Malzeme sertifikası ve lot bazlı kayıt talebe bağlı olarak sağlanır.",
    heroImage: "hero-malzeme-kutuphanesi",
    content: [
      "Mas Technic malzeme kütüphanesi metal, plastik, kompozit ve özel alaşımları kapsar. Havacılık sınıfı alüminyumdan medikal sınıfı titanyuma, yüksek performans plastiklerden süper alaşımlara kadar geniş bir yelpazede hizmet veriyoruz.",
      "Metal malzemelerimiz arasında Alüminyum (6061, 7075, 5083 — 95-150 HB), Paslanmaz Çelik (304, 316, 17-4PH — 150-350 HB), Karbon Çelik (1045, 4140, 4340 — 200-350 HB), Titanyum (Gr2, Gr5 Ti6Al4V — 250-350 HB) ve Pirinç/Bronz (C360, C932 — 60-150 HB) bulunmaktadır.",
      "Plastik ve kompozit malzemelerimiz arasında Asetal (POM — düşük sürtünme), Nylon (PA6, PA66 — aşınma direnci), Teflon (PTFE — kimyasal dirençi), PEEK (yüksek sıcaklık — havacılık/medikal), Polikarbonat (PC — şeffaflık) yer almaktadır. Özel alaşımlardan Inconel 718 (yüksek sıcaklık — türbin), Hastelloy (korozyon — kimya endüstrisi), Kovar (termal genleşme — elektronik) ve Tungsten (yüksek yoğunluk — radyasyon koruması) tedarik edebiliyoruz.",
      "Malzeme tedarik sürecimiz beş aşamadan oluşur: anlık stok kontrolü, malzeme sertifikası doğrulama, kimyasal analiz ve boyut kontrolü ile giriş kontrolü, klimatik kontrollü depolama ve lot numarası ile izlenebilirlik. Sık kullanılan alüminyum ve paslanmaz çelik kaliteleri sürekli stokta tutulmaktadır.",
    ],
    features: [
      "Geniş Malzeme Yelpazesi — metal, plastik, kompozit ve özel alaşımlar",
      "Malzeme Sertifikası — Talebe bağlı olarak sağlanır",
      "Klimatik Kontrollü Depo — Sıcaklık ve nem kontrollü depolama",
      "Lot Bazlı İzlenebilirlik — Hammaddeden nihai ürüne tam takip",
      "Anlık Stok Takibi — ERP entegreli gerçek zamanlı stok yönetimi",
      "Havacılık & Medikal Sınıf — şartnameye göre malzeme seçimi",
    ],
    technicalSpecs: [
      { label: "Malzeme Grupları", value: "Metal, plastik, kompozit, özel alaşım" },
      { label: "Sertifika", value: "Talebe bağlı" },
      { label: "Sürekli Stok", value: "Al 6061, Al 7075" },
      { label: "Sürekli Stok", value: "SS 304, SS 316" },
      { label: "Tedarik (Standart)", value: "Stokta / 1-2 hafta" },
      { label: "Tedarik (Özel)", value: "4-8 hafta" },
    ],
    processSteps: [
      "Stok Kontrolü (ERP)",
      "Sertifika Doğrulama",
      "Kimyasal Analiz",
      "Boyut Kontrolü",
      "Klimatik Depolama",
      "Lot Takibi",
    ],
    advantages: [
      "Her projeye uygun malzeme seçimi için mühendislik desteği",
      "Kritik malzemeler (Al, SS) sürekli stokta",
      "Kimyasal analiz ve spektrometre ile giriş kontrolü",
      "ERP sistemi ile anlık stok ve tedarik takibi",
      "Çoklu tedarikçi ile tedarik güvencesi",
      "Havacılık ve medikal uygulamalar için şartnameye göre malzeme seçimi",
    ],
    materials: [
      { name: "Alüminyum", grade: "6061, 7075, 5083", properties: "95-150 HB, havacılık/elektronik, sürekli stok" },
      { name: "Paslanmaz Çelik", grade: "304, 316, 17-4PH", properties: "150-350 HB, medikal/gıda, sürekli stok" },
      { name: "Karbon Çelik", grade: "1045, 4140, 4340", properties: "200-350 HB, mekanik parçalar" },
      { name: "Titanyum", grade: "Gr2, Gr5 (Ti6Al4V)", properties: "250-350 HB, medikal/havacılık, sipariş üzerine" },
      { name: "Pirinç / Bronz", grade: "C360, C932", properties: "60-150 HB, dişli ve yatak uygulamaları" },
      { name: "Inconel 718", grade: "Süper alaşım", properties: "Yüksek sıcaklık, türbin parçaları, sipariş üzerine" },
      { name: "PEEK", grade: "450G", properties: "Yüksek sıcaklık, kimyasal direnci, havacılık/medikal" },
      { name: "POM (Delrin)", grade: "Delrin 150/500", properties: "Düşük sürtünme, dişli ve yatak" },
    ],
    faq: [
      { question: "Hangi malzeme sertifikalarını sağlıyorsunuz?", answer: "Malzeme sertifikası ve kimyasal analiz raporu talebe bağlı olarak sağlanır. Her tedarik, lot ve döküm numarasıyla kayıt altına alınır." },
      { question: "Stokta hangi malzemeler bulunuyor?", answer: "Al 6061, Al 7075, SS 304 ve SS 316 sürekli stokta tutulmaktadır. Titanyum ve Inconel gibi özel malzemeler sipariş üzerine tedarik edilir." },
      { question: "Özel alaşım tedarik edebiliyor musunuz?", answer: "Evet, Inconel 718, Hastelloy, Kovar, Tungsten gibi özel alaşımları 4-8 hafta içinde tedarik edebiliyoruz." },
      { question: "Malzeme kalite kontrolü nasıl yapılıyor?", answer: "Her malzeme girişinde spektrometre ile kimyasal analiz, boyut kontrolü ve sertifika doğrulaması yapılmaktadır. Klimatik kontrollü depoda lot numarası ile izlenebilirlik sağlanır." },
    ],
    comparisonTables: [
      {
        title: "Malzeme Karşılaştırma Matrisi",
        description: "Ana malzeme gruplarının mekanik özellikleri ve maliyet karşılaştırması",
        headers: ["Malzeme", "Sertlik (HB)", "Çekme Dayanımı", "İşlenebilirlik", "Maliyet", "Stok Durumu"],
        rows: [
          ["Al 6061-T6", "95", "310 MPa", "★★★★★", "$", "Stokta"],
          ["Al 7075-T6", "150", "572 MPa", "★★★★☆", "$$", "Stokta"],
          ["SS 304", "187", "515 MPa", "★★★☆☆", "$$", "Stokta"],
          ["SS 316L", "217", "485 MPa", "★★★☆☆", "$$$", "Stokta"],
          ["Ti6Al4V (Gr5)", "334", "950 MPa", "★★☆☆☆", "$$$$", "Sipariş üzerine"],
          ["Inconel 718", "363", "1034 MPa", "★☆☆☆☆", "$$$$$", "4-8 hafta"],
          ["PEEK 450G", "100 (Shore D)", "100 MPa", "★★★★☆", "$$$$", "2-4 hafta"],
          ["POM (Delrin)", "85 (Shore D)", "70 MPa", "★★★★★", "$", "Stokta"],
        ],
      },
      {
        title: "Tedarik Süresi ve Sertifika Matrisi",
        headers: ["Malzeme Grubu", "Standart Tedarik", "Acil Tedarik", "Sertifika", "Min. Sipariş"],
        rows: [
          ["Alüminyum (6061, 7075)", "Stokta", "Aynı gün", "EN 10204 3.1", "1 kg"],
          ["Paslanmaz Çelik (304, 316)", "Stokta", "Aynı gün", "EN 10204 3.1", "5 kg"],
          ["Karbon Çelik (1045, 4140)", "1-2 hafta", "3 iş günü", "EN 10204 3.1", "10 kg"],
          ["Titanyum (Gr2, Gr5)", "4-6 hafta", "2 hafta", "EN 10204 3.2", "5 kg"],
          ["Inconel / Hastelloy", "6-8 hafta", "4 hafta", "EN 10204 3.2", "10 kg"],
          ["PEEK / Yüksek Perf. Plastik", "2-4 hafta", "1 hafta", "CoC", "1 kg"],
        ],
      },
    ],
  },
  /* QUALITY CONTROL — rewritten in Phase 06.

     This page was the single worst fabrication in the repository. It named
     four certificates that do not exist AND the registrars that supposedly
     issued them (`ISO 9001:2015 (TÜV SÜD), AS9100D (SGS), IATF 16949 (Bureau
     Veritas), ISO 13485 (TÜV SÜD)`), a %99.7 quality rate, a 6 Sigma target,
     %100 CMM coverage of critical dimensions, and a metrology laboratory —
     Zeiss, Mitutoyo, GOM, Taylor Hobson, Nikon, Wilson — with model numbers
     and accuracies down to the micron.

     `USER_INPUTS.md` §C supplies ISO 9001, ISO 14001 and OHSAS 18001 and no
     issuer for any of them. §D records CMM coverage as
     THIRD_PARTY_ACCREDITED_ON_DEMAND — not universal, not in-house. §H does
     supply a real, publishable measurement-equipment list as a PDF, which is
     now served from `public/belgeler/` and linked from the landing.

     What replaces it is the thing that was missing: how conformity is
     actually established, and what record each step leaves behind.          */
  {
    slug: "kalite-kontrol",
    category: "kabiliyetler",
    categoryLabel: "Kalite & Standartlar",
    title: "Kalite Kontrol",
    metaTitle: "Kalite Kontrol | Kontrol Planı ve Ölçüm Kaydı | Mas Technic",
    metaDescription:
      "Her iş için kontrol planı, proses içi ara kontrol ve kontrol planına göre son kontrol. Akredite üçüncü taraf CMM ölçümü talebe bağlı. ISO 9001:2015.",
    description:
      "Kalite kontrol, üretimden sonra yapılan bir muayene değil, üretimden önce yazılan bir plandır. Hangi ölçünün nasıl ve hangi aşamada kontrol edileceği, parça tezgâha bağlanmadan belirlenir.",
    heroImage: "hero-kalite-kontrol",
    content: [
      "Her iş için bir kontrol planı oluşturulur. Plan; teknik resimdeki hangi kotelerin kritik olduğunu, her birinin hangi yöntemle ve hangi aşamada kontrol edileceğini ve kontrolün hangi kaydı bırakacağını tanımlar. Bu plan teklif aşamasındaki teknik incelemenin çıktısıdır.",
      "Ara kontroller proses sırasında yapılır. Amaç, hatayı son kontrolde yakalamak değil, bir sonraki operasyona hatalı parça göndermemektir. İlk parça onayı, ısıl işlem gibi ölçü kaydıran adımların sonrası ve bağlama değişimleri, ara kontrolün doğal duraklarıdır.",
      "Son kontrol, kontrol planında tanımlanan koteler üzerinden yapılır ve sonuçlar kayıt altına alınır. Koordinat ölçüm (CMM) gerektiren durumlarda ölçüm, akredite üçüncü taraf tarafından talebe bağlı olarak gerçekleştirilir; bu tercih, ölçümün üretimden bağımsız olmasını sağlar.",
      "Malzeme izlenebilirliği parti ve döküm kaydı üzerinden yürütülür; malzeme sertifikası talep edilmesi halinde teslimat dosyasına eklenir. Kullandığımız ölçüm ve kontrol ekipmanlarının listesi ayrı bir doküman olarak yayımlanmıştır ve kaynaklar bölümünden indirilebilir.",
      "Uygunsuzluk çıktığında sorulan soru parçanın kurtarılıp kurtarılamayacağı değil, prosesin neden o sonucu ürettiğidir. Kök neden bulunana kadar aynı kurulumla üretime devam edilmez.",
    ],
    features: [
      "Kontrol Planı — kritik koteler üretimden önce belirlenir",
      "İlk Parça Kontrolü — kurulum onaylanmadan seri başlamaz",
      "Ara Kontrol — hata bir sonraki operasyona taşınmaz",
      "Son Kontrol — kontrol planına göre, kayıtlı",
      "Akredite 3. Taraf CMM — talebe bağlı, üretimden bağımsız",
      "Malzeme İzlenebilirliği — parti ve döküm kaydı",
    ],
    technicalSpecs: [
      { label: "Yönetim Sistemi", value: "ISO 9001:2015" },
      { label: "Standart Tolerans", value: "±0.01 mm" },
      { label: "Kontrol Planı", value: "Her iş için" },
      { label: "CMM Ölçüm", value: "Akredite 3. taraf, talebe bağlı" },
      { label: "Ölçüm Kaydı", value: "Teslimat dosyasında" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
    ],
    processSteps: [
      "Teknik İnceleme",
      "Kontrol Planı",
      "Malzeme Giriş Kaydı",
      "İlk Parça Kontrolü",
      "Ara Kontroller",
      "Son Kontrol",
      "Ölçüm Kaydı",
    ],
    advantages: [
      "Kontrol planı üretimden önce yazılır, sonradan uydurulmaz",
      "Ara kontroller hatayı bir sonraki operasyona taşımaz",
      "Koordinat ölçümü akredite üçüncü tarafça, üretimden bağımsız yapılır",
      "Ölçüm kayıtları teslimat dosyasıyla birlikte verilir",
      "Malzeme parti ve döküm kaydıyla izlenir",
      "Uygunsuzlukta parça değil proses düzeltilir",
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 yönetim sistemi belgelerimiz bulunmaktadır. Belge kapsamı dışında bir standart gerekiyorsa teknik incelemede birlikte değerlendiririz." },
      { question: "Ölçüm raporu veriyor musunuz?", answer: "Evet. Kontrol planında tanımlanan koteler ölçülür ve sonuçlar kayıt altına alınır; ölçüm kaydı teslimat dosyasına eklenir." },
      { question: "CMM ölçümü yapılıyor mu?", answer: "Koordinat ölçümü, akredite üçüncü taraf tarafından talebe bağlı olarak yapılır. Bu tercih ölçümün üretimden bağımsız olmasını sağlar; ihtiyacınızı teklif aşamasında belirtmeniz yeterlidir." },
      { question: "Kalite kontrol süreci nasıl işliyor?", answer: "Teknik inceleme ile kontrol planı oluşturulur; malzeme girişi kaydedilir, ilk parça onaylanır, proses sırasında ara kontroller yapılır ve son kontrol plana göre tamamlanarak kayıt altına alınır." },
      { question: "Malzeme sertifikası alabilir miyim?", answer: "Malzeme parti ve döküm kaydı üzerinden izlenir. Malzeme sertifikası talep etmeniz halinde teslimat dosyasına eklenir." },
    ],
    comparisonTables: [
      {
        title: "Kontrol Aşamaları ve Bıraktığı Kayıt",
        description: "Her kontrol adımı bir karar noktasıdır ve arkasında bir kayıt bırakır",
        headers: ["Aşama", "Kontrol Noktası", "Yöntem", "Bıraktığı Kayıt", "Sıklık"],
        rows: [
          ["1. Giriş", "Malzeme kimliği", "Parti / döküm takibi", "İzlenebilirlik kaydı", "Her parti"],
          ["2. Kurulum", "Takım ve bağlama doğrulama", "Görsel + ölçü", "Kurulum onayı", "Her kurulum"],
          ["3. İlk Parça", "Kritik koteler", "Kontrol planına göre ölçüm", "İlk parça kaydı", "Her kurulum"],
          ["4. Proses İçi", "Kayma eğilimi olan koteler", "Ara kontrol", "Operasyon kaydı", "Plana göre"],
          ["5. Son Kontrol", "Kontrol planındaki tüm koteler", "Ölçüm; gerekirse akredite CMM", "Ölçüm kaydı", "Plana göre"],
        ],
      },
      {
        title: "Kontrol Yönteminin Seçimi",
        description: "Yöntem, ölçülecek özelliğe ve toleransın darlığına göre belirlenir",
        headers: ["Özellik", "Tipik Yöntem", "Ne Zaman Akredite CMM Gerekir"],
        rows: [
          ["Çap ve boy ölçüleri", "Kontrol planına göre ölçüm", "Tolerans zinciri dar olduğunda"],
          ["Form (düzlem, silindiriklik)", "Kontrol planına göre ölçüm", "Geometrik tolerans şartnamede ise"],
          ["Konum ve eş eksenlilik", "Datum üzerinden kontrol", "Datum yapısı karmaşık olduğunda"],
          ["Yüzey durumu", "Karşılaştırmalı kontrol", "Sayısal Ra şartnamede ise"],
          ["Malzeme kimliği", "Parti / döküm takibi", "Uygulanmaz — belge ile yürür"],
        ],
      },
    ],
  },
  /* TOLERANCE & PRECISION — rewritten in Phase 06.

     This page claimed five tolerance classes down to ±0.001 mm, GD&T
     capability to ±0.003 mm, a named CMM with a stated measurement uncertainty
     of ±0.0019 mm, and a 3DCS/CATIA tolerance-simulation service. §D records
     one verified figure: MINIMUM_TOLERANCE_INTERNAL ±0.01 mm. A measurement
     uncertainty is a calibration result — it cannot be typed into a table.

     ISO 2768 and ASME Y14.5 stay: they are published standards the site
     REFERENCES, not accreditations it claims. The page now explains how a
     tolerance is decided rather than advertising one that cannot be held. */
  {
    slug: "tolerans-hassasiyet",
    category: "kabiliyetler",
    categoryLabel: "Kalite & Standartlar",
    title: "Tolerans & Hassasiyet",
    metaTitle: "Tolerans & Hassasiyet | ±0.01 mm | ISO 2768 | GD&T | Mas Technic",
    metaDescription:
      "±0.01 mm standart tolerans aralığı, ISO 2768 ve ASME Y14.5 (GD&T) okuma. Tolerans; geometri, malzeme ve ölçü zincirine göre teknik incelemede belirlenir.",
    description:
      "Tolerans bir reklam değeri değil, bir karardır: parçanın hangi ölçüsünün ne kadar dar tutulacağı, montajda neyin çalışması gerektiğine göre belirlenir. Standart çalışma aralığımız ±0.01 mm'dir.",
    heroImage: "hero-tolerans-hassasiyet",
    content: [
      "Standart çalışma aralığımız ±0.01 mm'dir. Bir parçada bu aralığın altına inilip inilemeyeceği tek başına tezgâhın değil, geometrinin, malzemenin, parça ölçüsünün ve ölçü zincirinin sorusudur; bu nedenle her parça için teknik incelemede ayrıca belirlenir.",
      "Toleransı belirleyen asıl unsur çoğu zaman bağlama sayısıdır. Her yeni bağlama ölçü zincirine yeni bir hata kaynağı ekler; tek bağlamada tamamlanan bir parça, aynı tezgâhta iki bağlamada işlenen parçadan daha dar tolerans tutar.",
      "Geometrik toleranslar (GD&T) ASME Y14.5 dilinde okunur. Konum, diklik, eş eksenlilik, düzlem ve dairesellik toleransları datum yapısıyla birlikte anlam kazanır: hangi yüzeyin referans alındığı, toleransın kendisi kadar belirleyicidir.",
      "Teknik resimde tolerans belirtilmeyen ölçüler için ISO 2768 genel tolerans sınıfları kullanılır. Hangi sınıfın geçerli olduğu teklif aşamasında netleştirilir; belirsiz bırakılan bir genel tolerans, üretim sonrası tartışmanın en yaygın nedenidir.",
      "Gereğinden dar tolerans maliyeti artırır ve teslimatı uzatır. Teknik incelemede, fonksiyonu etkilemeyen koteleri gevşetmeyi öneririz; hangi ölçünün gerçekten kritik olduğunu birlikte belirlemek, parçayı hem daha ucuz hem daha güvenilir yapar.",
    ],
    features: [
      "±0.01 mm Standart Tolerans — teknik incelemede parça bazında teyit",
      "GD&T Okuma — ASME Y14.5 dilinde konum, form ve yönelim toleransları",
      "Datum Yapısı — hangi yüzeyin referans alındığı birlikte belirlenir",
      "ISO 2768 Genel Toleranslar — belirtilmemiş ölçüler için sınıf mutabakatı",
      "Ölçü Zinciri Analizi — bağlama sayısı ve birikim etkisinin değerlendirilmesi",
      "Tolerans Gevşetme Önerisi — fonksiyonu etkilemeyen koteler için",
    ],
    technicalSpecs: [
      { label: "Standart Tolerans", value: "±0.01 mm" },
      { label: "Genel Tolerans", value: "ISO 2768 (sınıf mutabakatı)" },
      { label: "Geometrik Tolerans", value: "ASME Y14.5 (GD&T)" },
      { label: "Belirleyici", value: "Geometri, malzeme, ölçü zinciri" },
      { label: "Teyit", value: "Teknik inceleme" },
      { label: "Kontrol", value: "Kontrol planına göre ölçüm" },
    ],
    advantages: [
      "Tolerans, parçanın fonksiyonuna göre kote kote kararlaştırılır",
      "Bağlama sayısı ölçü zinciri gözetilerek en aza indirilir",
      "GD&T ve datum yapısı teknik incelemede birlikte okunur",
      "Belirtilmemiş ölçüler için genel tolerans sınıfı teklifte netleşir",
      "Gereksiz dar toleranslar maliyeti düşürmek için gevşetilmesi önerilir",
      "Kritik koteler kontrol planına yazılır ve ölçüm kaydı bırakır",
    ],
    faq: [
      { question: "Standart tolerans aralığınız nedir?", answer: "±0.01 mm'dir. Bir parçada daha darına inilip inilemeyeceği geometri, malzeme, parça ölçüsü ve ölçü zincirine bağlıdır ve teknik incelemede belirlenir." },
      { question: "Geometrik tolerans (GD&T) desteğiniz var mı?", answer: "Evet. ASME Y14.5 dilinde konum, diklik, eş eksenlilik, düzlem ve dairesellik toleranslarını datum yapısıyla birlikte okur ve kontrol planına yazarız." },
      { question: "Teknik resmimde tolerans belirtilmemiş, ne olur?", answer: "Belirtilmemiş ölçüler için ISO 2768 genel tolerans sınıfları kullanılır. Hangi sınıfın geçerli olacağını teklif aşamasında netleştiririz." },
      { question: "Daha dar tolerans istersem ne değişir?", answer: "Operasyon sırası, bağlama düzeni ve kontrol yöntemi değişir; süre ve maliyet artar. Fonksiyonu etkilemeyen koteleri gevşetmenizi önerebiliriz." },
      { question: "Toleransın tutulduğunu nasıl gösteriyorsunuz?", answer: "Kritik koteler kontrol planına yazılır, ölçülür ve sonuçlar kayıt altına alınır. Koordinat ölçümü gerektiğinde akredite üçüncü taraf ölçümü talebe bağlı olarak sağlanır." },
    ],
    comparisonTables: [
      {
        title: "ISO 2768 Tolerans Sınıfları",
        description: "Teknik resimde belirtilmemiş ölçüler için boyut aralığına göre genel toleranslar (mm)",
        headers: ["Tolerans Sınıfı (ISO 2768)", "0.5 – 3 mm", "3 – 6 mm", "6 – 30 mm", "30 – 120 mm", "120 – 400 mm"],
        rows: [
          ["f (İnce)", "±0.05", "±0.05", "±0.1", "±0.15", "±0.2"],
          ["m (Orta)", "±0.1", "±0.1", "±0.2", "±0.3", "±0.5"],
          ["c (Kaba)", "±0.2", "±0.3", "±0.5", "±0.8", "±1.2"],
          ["v (Çok Kaba)", "—", "±0.5", "±1.0", "±1.5", "±2.5"],
        ],
        highlight: 0,
      },
      {
        title: "GD&T — Hangi Tolerans Neyi Kontrol Eder",
        description: "ASME Y14.5 sembolleri ve her birinin hangi montaj sorusunu yanıtladığı",
        headers: ["Tolerans Tipi", "Sembol", "Neyi Kontrol Eder", "Tipik Uygulama", "Datum Gerekir mi"],
        rows: [
          ["Konum", "⌖", "Bir özelliğin referansa göre yeri", "Delik ve pim pozisyonlama", "Evet"],
          ["Diklik", "⊥", "Yüzeyin datuma göre yönelimi", "Yüzey–mil dik referansı", "Evet"],
          ["Eş eksenlilik", "◎", "İki eksenin çakışması", "Rulman yatağı, mil", "Evet"],
          ["Düzlem", "▱", "Yüzeyin kendi içindeki sapması", "Sızdırmazlık yüzeyi", "Hayır"],
          ["Dairesellik", "○", "Kesitin daireden sapması", "Piston, silindir", "Hayır"],
          ["Dönme toleransı", "↻", "Dönerken yüzeyin salgısı", "Şaft, mil", "Evet"],
        ],
      },
      {
        title: "Toleransı Daraltmadan Önce",
        description: "Dar tolerans her zaman doğru cevap değildir; önce bu üç soru sorulur",
        headers: ["Soru", "Neden Sorulur", "Tipik Sonuç"],
        rows: [
          ["Bu kote montajda neyi belirliyor?", "Fonksiyonu olmayan kote gereksiz maliyet üretir", "Kote gevşetilir"],
          ["Ölçü hangi datumdan alınıyor?", "Referans değişimi toleransı yeniden dağıtır", "Zincir kısalır"],
          ["Kaç bağlamada üretilecek?", "Her bağlama yeni bir hata kaynağıdır", "Operasyon sırası değişir"],
        ],
      },
    ],
  },
  {
    slug: "tasarim-rehberi-dfm",
    category: "kabiliyetler",
    categoryLabel: "Mühendislik Desteği",
    title: "Tasarım Rehberi (DFM)",
    metaTitle: "DFM Analizi | Tasarım Rehberi | Maliyet Optimizasyonu | Mas Technic",
    metaDescription:
      "Design for Manufacturing (DFM/DFA) analizi ile tasarımlarınızı optimize edin. CNC ve enjeksiyon DFM kuralları, CATIA/SolidWorks/NX entegrasyonu, %70'e kadar maliyet tasarrufu.",
    description:
      "DFM/DFA analizi ile tasarımlarınızı üretilebilirlik açısından optimize ediyoruz. Üretim maliyetlerini düşüren, kaliteyi artıran ve süreyi kısaltan mühendislik desteği.",
    heroImage: "hero-dfm-tasarim",
    content: [
      "Design for Manufacturing (DFM) analiz sürecimiz 4 aşamadan oluşur: 1. gün — ilk inceleme ve DFM raporu taslağı, 2-3. gün — detaylı analiz ve optimizasyon önerileri, 4. gün — müşteri görüşmesi ve revize CAD modeli, 5. gün — final DFM raporu ve onay. Toplam süreç 5 iş gününde tamamlanır.",
      "CNC işleme DFM kurallarımız: İç köşe yarıçapı R > 0.5mm (sivri köşelerden kaçının), duvar kalınlığı > 0.8mm (çok ince duvarlardan kaçının), derinlik/çap oranı < 4:1 (çok derin deliklerden kaçının) ve standart boyut kullanımı (özel ölçülerden kaçının). Enjeksiyon kalıp DFM kurallarımız: Duvar kalınlığı 1.5-3mm, çekme payı 0.5-2°, köşe yarıçapı R > 0.5mm ve gate konumu kalın kesimden.",
      "Yaygın CAD formatlarını doğrudan işleyebiliyoruz; katı model ile birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır. Takım yolları üretim öncesinde simülasyonla doğrulanır ve çarpışma kontrolü yapılır.",
      "DFM analizinde tipik olarak baktığımız kaldıraçlar: montajı tek parçaya indirgemek, bağlama sayısını azaltmak, takım erişimini kolaylaştırmak, gereksiz dar toleransları gevşetmek ve malzemeyi fonksiyona göre yeniden seçmek. Hangisinin ne kadar etki edeceği parçanın geometrisine ve mevcut üretim planına bağlıdır; beklenen etki analiz raporunda parça bazında verilir.",
    ],
    features: [
      "DFM Analizi — 5 iş günü tamamlanma süresi",
      "CNC İşleme DFM Kuralları — Köşe, duvar, derinlik optimizasyonu",
      "Enjeksiyon Kalıp DFM — Duvar kalınlığı, çekme payı, gate konumu",
      "CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam",
      "Simülasyon — takım yolu doğrulama ve çarpışma kontrolü",
      "Maliyet Optimizasyonu — Parça sayısı, bağlama ve tolerans kaldıraçları",
    ],
    technicalSpecs: [
      { label: "Analiz Süresi", value: "5 iş günü" },
      { label: "Rapor Formatı", value: "PDF + revize CAD" },
      { label: "Desteklenen CAD", value: "STEP, IGES, CATIA, NX, SW" },
      { label: "Revizyon", value: "2 tur dahil" },
      { label: "Maliyet Tasarrufu", value: "Ortalama %30-50" },
      { label: "Simülasyon", value: "Takım yolu doğrulama" },
    ],
    processSteps: [
      "CAD Model Yükleme",
      "İlk İnceleme (1 gün)",
      "Detaylı Analiz (2-3 gün)",
      "Müşteri Görüşmesi",
      "CAD Revizyon",
      "Final DFM Raporu",
    ],
    advantages: [
      "5 gün içinde tamamlanan DFM analiz süreci",
      "CATIA, SolidWorks, NX entegre çalışma",
      "Üretim öncesi takım yolu simülasyonu ve çarpışma kontrolü",
      "Parça sayısı, bağlama sayısı ve işlem adımı azaltma fırsatlarının çıkarılması",
      "Enjeksiyon kalıp ve CNC işleme özel DFM kuralları",
      "Dijital ikiz ile üretim öncesi doğrulama",
    ],
    faq: [
      { question: "DFM analizi ücreti var mı?", answer: "İlk DFM değerlendirmesi ücretsizdir. Detaylı analiz raporu ve CAD revizyonları proje kapsamına göre fiyatlandırılır." },
      { question: "DFM analizi ne kadar sürer?", answer: "Standart bir DFM analizi 5 iş gününde tamamlanır: 1 gün inceleme, 2-3 gün detaylı analiz, 1 gün görüşme ve revizyon." },
      { question: "Hangi CAD formatlarını kabul ediyorsunuz?", answer: "Teklif akışında STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını doğrudan yükleyebilirsiniz. Listede olmayan bir yerel CAD formatı veya ölçülendirilmiş teknik resim için dosyayı sales@mastechnic.com adresine iletebilirsiniz." },
      { question: "DFM analizi ne kadar tasarruf sağlar?", answer: "Tasarrufun büyüklüğü parçanın geometrisine ve mevcut üretim planına bağlıdır. DFM analizinde parça sayısı, bağlama sayısı, takım erişimi ve tolerans zinciri değerlendirilir; beklenen etki analiz raporunda parça bazında verilir." },
    ],
    comparisonTables: [
      {
        title: "CNC İşleme DFM Kontrol Listesi",
        description: "Tasarımınızı üretim öncesi bu kriterlere göre değerlendirin",
        headers: ["Kriter", "Önerilen Değer", "Min. / Maks.", "Kural", "Etki"],
        rows: [
          ["İç Köşe Yarıçapı", "R ≥ 1mm", "R > 0.5mm", "Sivri köşelerden kaçının", "Takım kırılma riski azalır"],
          ["Duvar Kalınlığı", "≥ 1.5mm (metal)", "≥ 0.8mm", "İnce duvarlardan kaçının", "Titreşim ve deformasyon önlenir"],
          ["Derinlik/Çap Oranı", "< 3:1", "< 4:1", "Derin deliklerden kaçının", "Takım sapması minimize edilir"],
          ["Diş Derinliği", "≤ 3×çap", "≤ 5×çap", "Çok derin diş açmaktan kaçının", "Kırılma riski azalır"],
          ["Tolerans", "ISO 2768-m", "±0.01mm (kritik koteler)", "Gereksiz dar toleranstan kaçının", "Maliyet ve termin düşer"],
          ["Yüzey Kalitesi", "Ra 1.6µm", "Ra 0.1µm (özel)", "Fonksiyona uygun Ra seçin", "İşleme süresi kısalır"],
        ],
      },
      /*
       * "DFM Başarı Vaka Çalışmaları" tablosu kaldırıldı.
       *
       * Dört satır dört müşteri projesi anlatıyordu — Motor Braketi
       * (Havacılık), Şanzıman Gövdesi (Otomotiv), Kateter Konnektörü
       * (Medikal), Sensör Muhafazası (Elektronik) — her biri sayısal bir
       * tasarruf oranıyla. USER_INPUTS.md §G CASE_STUDIES:
       * NONE_PROVIDED_YET ve IF_NONE:
       * REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT.
       * Ne proje ne de yayın izni verildi; tablonun tamamı uydurmaydı ve
       * "Gerçek vaka çalışmalarıyla kanıtlanmış" ifadesinin dayanağıydı.
       *
       * Yerine yeni içerik üretilmedi: hemen üstteki "CNC İşleme DFM Kontrol
       * Listesi" §G'nin istediği olgusal-olmayan kabiliyet içeriğidir ve
       * sayfada zaten duruyor. Gerçek iş geldiğinde şeması
       * src/content/caseStudies.ts içinde hazır bekliyor.
       */
    ],
  },
  {
    slug: "yuzey-islemleri-muhendislik",
    category: "kabiliyetler",
    categoryLabel: "Mühendislik Desteği",
    title: "Yüzey İşlemleri Rehberi",
    metaTitle: "Yüzey İşlemleri Rehberi | Anodizasyon, Nitrürleme, Toz Boya | Mas Technic",
    metaDescription:
      "Korozyon korumasından estetik kaplamaya yüzey işlem seçim rehberi. Anodizasyon (10-75µm), toz boya (60-120µm), nikelaj, elektropolish. Ra 0.1-12.5µm yüzey kalitesi.",
    description:
      "Korozyon korumasından elektriksel yalıtıma, dekoratif görünümden tribolojik özelliklere kadar uygulamanıza en uygun yüzey işlem yöntemini belirlemenize yardımcı oluyoruz.",
    heroImage: "hero-yuzey-islemleri",
    content: [
      "Yüzey işlemi seçim matrisimiz: Korozyon koruması için anodizasyon (alüminyum — koruyucu tabaka), sertlik artırma için nitrürleme (çelik — yüzey sertliği), estetik kaplama için toz boya (metal — renkli kaplama) ve elektriksel yalıtım için e-kap (alüminyum — yalıtım). Her ihtiyaca özel çözüm sunuyoruz.",
      "Yüzey pürüzlülüğü (Ra) rehberimiz: Ra 0.1-0.2µm ayna parlaklığı (optik, yatak uygulamaları), Ra 0.4-0.8µm parlak yüzey (mil, piston), Ra 1.6-3.2µm mat yüzey (genel mekanik) ve Ra 6.3-12.5µm pürüzlü yüzey (yapısal parçalar). İşleme yöntemi ve takım seçimi ile hedef Ra değerine ulaşıyoruz.",
      "Kaplama kalınlıkları ve toleransları: Anodizasyon Tip II 10-25µm (±3µm), Anodizasyon Tip III 25-75µm (±5µm), toz boya 60-120µm (±15µm) ve nikelaj 5-20µm (±2µm). Kaplama sonrası boyut değişimi hesaba katılarak işleme toleransları belirlenir.",
      "Yüzey işlemi sonrası tolerans etkileri: Anodizasyon +kalınlık×2 (±5µm), toz boya +kalınlık×2 (±20µm), kumlama -5 ile -20µm (±10µm) ve elektropolish -10 ile -50µm (±5µm). Bu değerler işleme planlamasında dikkate alınarak boyutsal doğruluk korunur.",
    ],
    features: [
      "Yüzey İşlem Seçim Matrisi — İhtiyaca özel yöntem belirleme",
      "Ra Pürüzlülük Rehberi — Ra 0.1µm'den 12.5µm'ye kadar",
      "Kaplama Kalınlık Kontrolü — Anodizasyon, toz boya, nikelaj",
      "Tolerans Etki Analizi — İşlem sonrası boyut değişimi hesaplama",
      "Korozyon Analizi — Tuz spreyi ve çevresel test desteği",
      "Renk ve Estetik Çözümler — RAL/Pantone renk eşleştirme",
    ],
    technicalSpecs: [
      { label: "Anodizasyon Tip II", value: "10-25µm (±3µm)" },
      { label: "Anodizasyon Tip III", value: "25-75µm (±5µm)" },
      { label: "Toz Boya", value: "60-120µm (±15µm)" },
      { label: "Nikelaj", value: "5-20µm (±2µm)" },
      { label: "Min. Yüzey Ra", value: "0.1µm (ayna)" },
      { label: "Maks. Yüzey Ra", value: "12.5µm (pürüzlü)" },
    ],
    faq: [
      { question: "Hangi yüzey işlemi benim parçama uygun?", answer: "Uygulamaya göre değişir: Korozyon koruması için anodizasyon veya nikelaj, sertlik artırma için nitrürleme, estetik için toz boya veya eloksal, elektriksel yalıtım için e-kap öneriyoruz. Mühendislik ekibimiz detaylı analiz yapabilir." },
      { question: "Yüzey işlemi boyut değişikliğine neden olur mu?", answer: "Evet, anodizasyon kalınlık×2 kadar boyut artışı, kumlama 5-20µm boyut azalması yapar. Bu değerler işleme toleranslarında dikkate alınır." },
      { question: "Ra 0.1µm yüzey kalitesine ulaşabilir misiniz?", answer: "Evet, özel takım ve işleme parametreleri ile Ra 0.1µm ayna parlaklığında yüzey kalitesine ulaşabiliyoruz. Optik ve yatak uygulamaları için idealdir." },
    ],
    comparisonTables: [
      {
        title: "Yüzey İşlemi Seçim Matrisi",
        description: "Uygulamanıza göre en uygun yüzey işlem yöntemini belirleyin",
        headers: ["Yüzey İşlemi", "Uyumlu Malzemeler", "Temel Fonksiyon", "Tipik Ra (µm)", "Kaplama Kalınlığı", "Maliyet"],
        rows: [
          ["Eloksal (Anodize) Tip II", "Alüminyum, Titanyum", "Korozyon direnci, renk", "0.8 – 1.6", "10–25µm (±3µm)", "$$"],
          ["Sert Eloksal (Tip III)", "Alüminyum", "Sertlik, aşınma direnci", "0.8 – 1.6", "25–75µm (±5µm)", "$$$"],
          ["Kumlama (Bead Blast)", "Metaller, Plastikler", "Mat yüzey, pürüz giderme", "1.6 – 3.2", "N/A", "$"],
          ["Nikel Kaplama", "Çelik, Bakır", "Aşınma direnci, iletkenlik", "0.4 – 0.8", "5–20µm (±2µm)", "$$$"],
          ["Toz Boya", "Tüm Metaller", "Dekoratif, dış ortam", "N/A", "60–120µm (±15µm)", "$$"],
          ["Elektropolish", "Paslanmaz Çelik", "Parlak yüzey, hijyen", "0.1 – 0.4", "-10 ile -50µm", "$$$"],
          ["Nitrürleme", "Çelik", "Yüzey sertliği", "Değişmez", "0.1–0.5mm difüzyon", "$$$$"],
        ],
      },
      {
        title: "Yüzey Pürüzlülüğü (Ra) Rehberi",
        description: "Uygulamaya göre hedef Ra değerleri ve elde etme yöntemleri",
        headers: ["Ra Aralığı (µm)", "Yüzey Görünümü", "Uygulama Alanı", "İşleme Yöntemi", "Ek Maliyet"],
        rows: [
          ["0.1 – 0.2", "Ayna parlaklığı", "Optik, yatak yüzeyleri", "Lepleme, polisaj", "+%80-100"],
          ["0.4 – 0.8", "Parlak yüzey", "Mil, piston, sızdırmazlık", "İnce frezeleme, taşlama", "+%40-60"],
          ["1.6 – 3.2", "Mat yüzey", "Genel mekanik parçalar", "Standart CNC işleme", "Standart"],
          ["6.3 – 12.5", "Pürüzlü yüzey", "Yapısal, kaynak öncesi", "Kaba işleme, kumlama", "-%10-20"],
        ],
      },
      {
        title: "İşlem Sonrası Boyut Değişimi",
        description: "Yüzey işlemi sonrası tolerans etkileri — işleme planlamasında dikkate alınmalıdır",
        headers: ["Yüzey İşlemi", "Boyut Değişimi", "Tolerans Etkisi", "Planlama Notu"],
        rows: [
          ["Anodizasyon Tip II", "+kalınlık × 2", "±5µm", "Kalınlığın yarısı malzemeye nüfuz eder"],
          ["Anodizasyon Tip III", "+kalınlık × 2", "±10µm", "İşleme boyutunda kaplama payı bırakın"],
          ["Toz Boya", "+kalınlık × 2", "±20µm", "Kritik yüzeyleri maskeleyin"],
          ["Kumlama", "-5 ile -20µm", "±10µm", "Hassas yüzeyleri maskeleyin"],
          ["Elektropolish", "-10 ile -50µm", "±5µm", "Malzeme kaldırılır, boyut küçülür"],
        ],
      },
    ],
  },
  {
    slug: "dusuk-hacimli-uretim",
    category: "kabiliyetler",
    categoryLabel: "Prototipten Seri Üretime",
    title: "Düşük Hacimli Üretim",
    metaTitle: "Düşük Hacimli Üretim | 1-1000 Adet | 3D Baskı, Silikon Kalıp, CNC | Mas Technic",
    metaDescription:
      "3D baskı ile 1-3 günde prototip, silikon kalıplama ile 10-100 adet, hızlı alüminyum kalıp ile 1000 adete kadar üretim. FDM, SLA, SLS, DMLS teknolojileri.",
    description:
      "3D baskı, silikon kalıplama, hızlı alüminyum kalıp ve CNC işleme ile 1-1000 adet arası düşük hacimli üretim ihtiyaçlarınıza esnek ve hızlı çözümler sunuyoruz.",
    heroImage: "hero-seri-uretim",
    content: [
      "Düşük hacimli üretim yöntemlerimizin karşılaştırması: 3D baskı 1-10 adet (1-3 gün, düşük maliyet, ±0.2mm), silikon kalıplama 10-100 adet (5-10 gün, orta maliyet, ±0.1mm), alüminyum kalıp 100-1000 adet (2-3 hafta, orta maliyet, ±0.05mm) ve CNC işleme 1-100 adet (3-10 gün, yüksek maliyet, ±0.01mm). Projenizin adet, süre ve hassasiyet gereksinimlerine göre en uygun yöntemi belirliyoruz.",
      "Eklemeli imalat seçenekleri parçanın işlevine göre ayrışır: FDM (ABS, PLA, naylon) biçim ve montaj denemeleri, SLA (reçine) ince detay ve yüzey, SLS (PA12, TPU) destek yapısı gerektirmeyen fonksiyonel parçalar, DMLS ise metal fonksiyonel prototipler için kullanılır.",
      "Silikon kalıplama sürecimiz 4 aşamadan oluşur: 1) Master model — 3D baskı veya CNC ile üretim (1-3 gün), 2) Silikon kalıp — vakumlu kalıplama (1-2 gün), 3) Döküm — PU/silikon/EP döküm (1 gün/10 parça), 4) Finisaj — yüzey işlemleri ve kalite kontrol (1 gün). Toplam süreç 5-10 iş gününde tamamlanır.",
      "Alüminyum kalıp çözümü, çelik kalıba göre daha hızlı işlenebildiği için düşük ve orta hacimli işlerde tercih edilir. Basınçlı döküm ve enjeksiyon kalıp pilot üretimlerinde, seri kalıp yatırımı öncesinde tasarımın doğrulanmasını sağlar.",
    ],
    features: [
      "3D Baskı (FDM/SLA/SLS/DMLS) — 1-3 günde hızlı prototip",
      "Silikon Kalıplama — 10-100 adet PU/silikon/EP döküm",
      "Alüminyum Kalıp — pilot üretim ve tasarım doğrulaması için",
      "CNC İşleme — 1-100 adet ±0.01mm hassasiyette",
      "Metal 3D Baskı (DMLS) — EOS M290 ile Al, SS, Ti",
      "Fonksiyonel Prototip — Seri üretim malzemesi ile test",
    ],
    technicalSpecs: [
      { label: "Min. Adet", value: "1 adet" },
      { label: "Maks. Adet", value: "1.000 adet" },
      { label: "3D Baskı Teslim", value: "1-3 iş günü" },
      { label: "Silikon Kalıp", value: "5-10 iş günü" },
      { label: "Al Kalıp", value: "2-3 hafta" },
      { label: "CNC Teslim", value: "3-10 iş günü" },
    ],
    processSteps: [
      "Yöntem Seçimi",
      "CAD/Model Hazırlığı",
      "Master Model Üretimi",
      "Kalıp/Baskı İşlemi",
      "Finisaj & Yüzey",
      "Kalite Kontrol",
      "Paketleme & Teslim",
    ],
    advantages: [
      "4 farklı yöntem ile her ihtiyaca uygun çözüm",
      "1 günde başlayan teslimat süreleri",
      "Metal ve plastik 3D baskı kapasitesi",
      "Silikon kalıp ile düşük kalıp maliyeti",
      "Seri üretim öncesi pilot doğrulama",
      "Fonksiyonel prototip ile gerçek koşullarda test",
    ],
    faq: [
      { question: "Prototip için hangi yöntem en uygun?", answer: "1-10 adet ve hızlı teslimat için 3D baskı (1-3 gün), hassas parçalar için CNC (3-10 gün), 10-100 adet plastik parça için silikon kalıplama (5-10 gün) öneriyoruz." },
      { question: "Metal 3D baskı yapabiliyor musunuz?", answer: "Evet, EOS M290 DMLS sistemimiz ile alüminyum, paslanmaz çelik ve titanyum malzemelerde metal 3D baskı yapabiliyoruz." },
      { question: "Silikon kalıptan kaç parça çıkar?", answer: "Bir silikon kalıptan ortalama 20-50 parça üretilebilir. Malzeme ve geometriye göre bu sayı değişebilir." },
      { question: "Düşük hacimden seri üretime geçiş nasıl olur?", answer: "Prototip ve pilot üretimden sonra onaylanan tasarım için çelik kalıp yatırımı veya otomasyonlu CNC seri üretim planlaması yapılır. Geçiş süreci proje yöneticimiz tarafından koordine edilir." },
    ],
    comparisonTables: [
      {
        title: "Üretim Yöntemi Karşılaştırması (Maliyet vs. Adet)",
        description: "Adet sayısına göre en uygun üretim yöntemini seçin — köprü üretim stratejisi için kritik",
        headers: ["Yöntem", "Adet Aralığı", "Birim Maliyet", "Teslimat", "Tolerans", "Kalıp Yatırımı"],
        rows: [
          ["3D Baskı (FDM/SLA)", "1 – 10", "$$$", "1-3 gün", "±0.2mm", "Yok"],
          ["3D Baskı (SLS/DMLS)", "1 – 50", "$$$$", "2-5 gün", "±0.1mm", "Yok"],
          ["CNC İşleme", "1 – 100", "$$$", "3-10 gün", "±0.01mm", "Yok"],
          ["Silikon Kalıplama", "10 – 100", "$$", "5-10 gün", "±0.1mm", "Düşük ($)"],
          ["Hızlı Al Kalıp", "100 – 1.000", "$", "2-3 hafta", "±0.05mm", "Orta ($$)"],
          ["Çelik Kalıp (Enjeksiyon)", "1.000+", "$", "4-8 hafta", "±0.03mm", "Yüksek ($$$$$)"],
        ],
        highlight: 4,
      },
    ],
  },
  {
    slug: "seri-imalat",
    category: "kabiliyetler",
    categoryLabel: "Prototipten Seri Üretime",
    title: "Seri İmalat",
    metaTitle: "Seri İmalat | Tekrarlanabilir Kurulum ve Kontrol Planı | Mas Technic",
    metaDescription:
      "Seri imalatta belirleyici olan tek parçayı üretmek değil, yüzüncü parçayı ilkiyle aynı çıkarmaktır: standart kurulum, kontrol planı ve parti izlenebilirliği.",
    description:
      "Çelik kalıp, basınçlı döküm, otomasyonlu CNC ve montaj hatları ile yüksek hacimli seri üretimde tutarlılık ve verimlilik hedefliyoruz.",
    heroImage: "hero-seri-uretim",
    content: [
      "Seri üretim kapasitelerimiz: CNC seri işleme 1.000-50.000 adet/yıl (±0.01mm tolerans), basınçlı döküm 5.000-500.000 adet/yıl (CT4-CT6), enjeksiyon kalıp 10.000-1.000.000 adet/yıl (CT5-CT7).",
      "Seri işlerde kurulum bir kez yapılıp unutulmaz: standart kurulum prosedürü, sabit referans yüzeyleri ve otomatik takım değiştirme, partiler arası sapmayı sınırlar. İlk parça onaylanmadan seri başlamaz.",
      "Üretim takibi, stok ve kapasite planlaması tek bir kayıt üzerinden yürütülür; hangi partinin nerede olduğu ve hangi kontrolden geçtiği her an kayıtlıdır. Tedarik ihtiyacı bu kayıt üzerinden planlanır, müşteri portalından sipariş durumu görülebilir.",
      "Parti içi tutarlılık, ara kontrollerin plana bağlanmasıyla korunur. Kayma eğilimi olan koteler — takım aşınmasına duyarlı çaplar, ısıl işlem sonrası ölçüler — ayrı bir kontrol adımıyla izlenir ve sonuçlar kayıt altına alınır.",
    ],
    features: [
      "CNC Seri Üretim — 50.000 adet/yıl, ±0.01mm tolerans",
      "Basınçlı Döküm — 500.000 adet/yıl, CT4-CT6 kalıp toleransı",
      "Enjeksiyon Kalıp — 1.000.000 adet/yıl kapasite",
      "Otomatik Takım Değiştirme — uzun partilerde kesintisiz işleme",
      "Otomatik Palet Değiştirme — kurulumun üretimden ayrılması",
      "Üretim Takibi — parti durumunun kayıt altında olması",
    ],
    technicalSpecs: [
      { label: "CNC Seri Kapasite", value: "50.000 adet/yıl" },
      { label: "Döküm Kapasite", value: "500.000 adet/yıl" },
      { label: "Enjeksiyon Kapasite", value: "1.000.000 adet/yıl" },
      { label: "Kurulum", value: "Standart prosedür" },
      { label: "Kontrol", value: "Kontrol planına göre" },
      { label: "Teslimat", value: "JIT uyumlu" },
    ],
    processSteps: [
      "Parti Kaydı",
      "Pilot Üretim",
      "Seri Üretim Onayı",
      "Otomasyon Kurulumu",
      "Seri Üretim Başlangıcı",
      "SPC & Kalite Takibi",
      "JIT Teslimat",
    ],
    advantages: [
      "Standart kurulum prosedürü ile partiler arası tutarlılık",
      "Parti durumu üretim boyunca kayıt altında tutulur",
      "JIT teslimat ve Kanban sistemi entegrasyonu",
      "Kayma eğilimi olan koteler ara kontrolle izlenir",
      "Lot bazlı tam izlenebilirlik",
      "İlk parça onaylanmadan seri üretim başlamaz",
    ],
    faq: [
      { question: "Minimum seri üretim adedi nedir?", answer: "CNC seri üretim için 1.000 adet, basınçlı döküm için 5.000 adet ve enjeksiyon kalıp için 10.000 adetten başlamaktadır." },
      { question: "Teslimat programı düzenlenebiliyor mu?", answer: "Evet. Parti büyüklüğü ve teslimat sıklığı kapasite planlamasıyla birlikte kararlaştırılır; periyodik teslimat programları düzenlenebilir." },
      { question: "Seri üretimde tutarlılığı nasıl koruyorsunuz?", answer: "İlk parça onayı, standart kurulum prosedürü ve kontrol planına bağlı ara kontroller ile. Kayma eğilimi olan koteler ayrı bir adımda izlenir ve ölçüm sonuçları kayıt altına alınır." },
      { question: "Uzun partilerde tezgâh nasıl besleniyor?", answer: "Otomatik takım değiştirme ve bar besleme, uzun partilerde kesintisiz işlemeyi mümkün kılar. Hangi yöntemin kullanılacağı parça geometrisi ve parti büyüklüğüne göre planlanır." },
    ],
    comparisonTables: [
      {
        title: "Seri Üretim Yöntemi Seçimi",
        description: "Parça geometrisi ve toleransa göre yöntem, kurulum ve kontrol yaklaşımı",
        headers: ["Üretim Yöntemi", "Tipik Kullanım", "Tolerans", "Kurulum", "Kontrol Yaklaşımı"],
        rows: [
          ["CNC Seri İşleme", "Dar toleranslı metal parçalar", "±0.01mm", "Standart prosedür + sabit referans", "İlk parça + ara kontrol"],
          ["Basınçlı Döküm", "Karmaşık formlu yüksek hacim", "CT6-CT8", "Kalıp ve döküm parametresi", "Görsel + boyutsal kontrol"],
          ["Enjeksiyon Kalıp", "Plastik yüksek hacim", "CT6-CT8", "Kalıp ve proses penceresi", "İlk parça + periyodik kontrol"],
        ],
      },
    ],
  },

  // ── Kabiliyetler > Süreç & Operasyon ──
  {
    slug: "proje-yonetimi",
    category: "kabiliyetler",
    categoryLabel: "Süreç & Operasyon",
    title: "Proje Yönetimi",
    metaTitle: "Proje Yönetimi | Agile & Phase-Gate | Gerçek Zamanlı Raporlama | Mas Technic",
    metaDescription:
      "Tekliften teslimata beş aşamalı, onay noktalarıyla ilerleyen bir süreç. Her aşama bir çıktı üretir ve bir sonraki aşama o çıktı onaylanmadan başlamaz.",
    description:
      "Özel proje yöneticiniz, gerçek zamanlı raporlama ve proaktif iletişim ile projelerinizin her aşamasında yanınızdayız. Tekliften teslimata kontrollü ve şeffaf süreç yönetimi.",
    heroImage: "hero-proje-yonetimi",
    content: [
      "Proje yönetimi metodolojilerimiz: Agile/Scrum (yazılım entegre projeler — Jira, Confluence), Waterfall (geleneksel mekanik projeler — MS Project), Phase-Gate (seri üretim projeleri — özel template). Projenizin yapısına göre en uygun metodoloji seçilerek uygulanır.",
      "Beş aşamalı proje sürecimiz: 1) Değerlendirme — teklif ve onay, 2) DFM analizi — rapor ve gerekirse tasarım revizyonu, 3) Prototip — numune parça, ölçüm kaydı ve numune onayı, 4) Üretim dosyası — kontrol planı ve izlenebilirlik dokümanları, 5) Seri üretim — parti raporu ve periyodik değerlendirme.",
      "İletişim ve raporlama kanallarımız: proje toplantıları, müşteri portalı üzerinden durum takibi, kritik aşamaların fotoğraf ve video ile belgelenmesi, üretim dosyasının teslimi ve tasarım değişikliği (ECO) yönetimi prosedürü.",
      "Proje yönetimi yazılımlarımız: Jira (görev takibi — Git, Confluence entegrasyonu), Microsoft Project (zamanlama — Excel, PowerBI entegrasyonu) ve Slack/Teams (iletişim — tüm sistemlerle entegrasyon). Her proje için özel bir proje yöneticisi atanır ve baştan sona tek muhatap olarak hizmet verir.",
    ],
    features: [
      "Özel Proje Yöneticisi — Baştan sona tek muhatap",
      "5 Aşamalı Süreç — Değerlendirmeden seri üretime kontrollü geçiş",
      "Agile/Scrum & Phase-Gate — Proje yapısına uygun metodoloji",
      "Gerçek Zamanlı Dashboard — Üretim durumu ve kalite metrikleri",
      "Üretim Dosyası — kontrol planı ve izlenebilirlik kayıtları",
      "ECO Yönetimi — Mühendislik değişiklik prosedürü",
    ],
    technicalSpecs: [
      { label: "Değerlendirme", value: "1-3 gün" },
      { label: "DFM Analizi", value: "3-5 gün" },
      { label: "Prototip", value: "1-3 hafta" },
      { label: "Üretim Dosyası", value: "Numune onayı sonrası" },
      { label: "Raporlama", value: "Haftalık + dashboard" },
      { label: "Araçlar", value: "Jira, MS Project, Slack" },
    ],
    processSteps: [
      "Teklif & Değerlendirme",
      "DFM Analizi",
      "Prototip Üretimi",
      "Test & Doğrulama",
      "Numune Onayı",
      "Seri Üretim Başlatma",
      "Sürekli İyileştirme",
    ],
    advantages: [
      "Deneyimli proje yöneticisi ile tek muhatap",
      "Haftalık ilerleme raporları ve gerçek zamanlı dashboard",
      "Fotoğraf/videolu kritik aşama belgeleme",
      "ECO prosedürü ile kontrollü değişiklik yönetimi",
      "Jira/MS Project ile profesyonel proje takibi",
      "Kontrol planı ve izlenebilirlik kayıtlarının teslimi",
    ],
    faq: [
      { question: "Her projeye özel proje yöneticisi atanıyor mu?", answer: "Evet, her projede özel bir proje yöneticisi atanır ve tekliften teslimata kadar tek muhatap olarak hizmet verir." },
      { question: "Proje ilerlemesini nasıl takip edebilirim?", answer: "Proje toplantıları, müşteri portalı üzerinden durum takibi, kritik aşamaların fotoğraf ve video kayıtları ve üretim dosyası ile her aşamayı takip edebilirsiniz." },
      { question: "Tasarım değişikliği gerektiğinde ne olur?", answer: "ECO (Engineering Change Order) prosedürümüz ile kontrollü bir şekilde değişiklik yönetimi yapılır. Maliyet ve süre etkileri analiz edildikten sonra onayınızla revizyon uygulanır." },
    ],
    comparisonTables: [
      {
        title: "Proje Yönetim Metodolojileri Karşılaştırması",
        description: "Proje yapısına göre en uygun metodoloji seçimi",
        headers: ["Metodoloji", "Uygun Proje Tipi", "Süreç Esnekliği", "Raporlama", "Araçlar", "Teslimat Yaklaşımı"],
        rows: [
          ["Agile / Scrum", "Yazılım entegre projeler", "★★★★★", "Sprint bazlı", "Jira, Confluence", "İteratif — 2 haftalık sprint"],
          ["Waterfall", "Geleneksel mekanik projeler", "★★☆☆☆", "Aşama bazlı", "MS Project", "Sıralı — Phase-Gate onaylı"],
          ["Phase-Gate", "Seri üretim projeleri", "★★★☆☆", "Gate Review", "Özel template", "Kontrollü geçiş — onay noktalarıyla"],
          ["Hibrit", "Karmaşık mühendislik projeleri", "★★★★☆", "Haftalık + Sprint", "Jira + MS Project", "Esnek — proje ihtiyacına göre"],
        ],
      },
      {
        title: "Proje Aşamaları ve Süreleri",
        headers: ["Aşama", "Süre", "Çıktı", "Müşteri Onayı", "İletişim Kanalı"],
        rows: [
          ["1. Değerlendirme & Teklif", "1-3 gün", "Detaylı teklif + zaman planı", "Teklif onayı", "E-posta + Video konferans"],
          ["2. DFM Analizi", "3-5 gün", "DFM raporu + CAD revizyonu", "DFM onayı", "Portal + Toplantı"],
          ["3. Prototip Üretimi", "1-3 hafta", "Örnek parça + ölçüm raporu", "Numune onayı", "Fotoğraf/video + rapor"],
          ["4. Üretim Dosyası", "Numune onayı sonrası", "Kontrol planı + izlenebilirlik kayıtları", "Dosya onayı", "Portal + PDF teslim"],
          ["5. Seri Üretim", "Devam eden", "Parti raporu + SPC verileri", "Periyodik review", "Dashboard + haftalık rapor"],
        ],
      },
    ],
  },
  /* SUPPLY CHAIN — rewritten in Phase 06.

     The page named mills (Alcoa, Assan, Erdemir, Outokumpu, VSMPO, ATI, BASF,
     Sabic), gave each a percentage share of spend, published safety-stock
     tonnage, an approved-supplier count and a %60 localisation ratio. None of
     it was supplied, and the shares and tonnages are order-volume disclosure
     on top (§D REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE).

     Naming your mills also tells a competitor exactly where your material
     comes from — which is why the page now describes the strategy instead of
     the vendors. Material lead times were kept in class-level ranges, which is
     genuinely useful to a buyer planning a project.                          */
  {
    slug: "tedarik-zinciri",
    category: "kabiliyetler",
    categoryLabel: "Süreç & Operasyon",
    title: "Tedarik Zinciri",
    metaTitle: "Tedarik Zinciri Yönetimi | Çift Kaynak, Stok Stratejisi | Mas Technic",
    metaDescription:
      "Kritik malzemede çift kaynak, sınıf bazlı tedarik süresi ve parti izlenebilirliği. Malzeme tedarik riski üretim planlanmadan önce değerlendirilir.",
    description:
      "Bir işin termini çoğu zaman tezgâhta değil, malzemenin gelişinde belirlenir. Tedarik riski bu nedenle teklif aşamasında, üretim planlanmadan önce değerlendirilir.",
    heroImage: "hero-tedarik-zinciri",
    content: [
      "Malzeme tedariki terminin en büyük belirsizliğidir. Standart alüminyum ve paslanmaz çelik kısa sürede temin edilebilirken, titanyum ve nikel esaslı alaşımlar sipariş üzerine gelir ve tedarik süresi üretim süresini aşabilir. Bu nedenle malzeme durumu teklifle birlikte netleştirilir.",
      "Kritik malzemelerde tek kaynağa bağlı kalmamayı esas alıyoruz. Onaylı ikinci kaynak, tedarik kesintisinde işin durmasını engeller; alternatif malzeme seçenekleri ise şartnameyle uyumluysa teknik incelemede birlikte değerlendirilir.",
      "Stok stratejisi malzeme sınıfına göre değişir: sık kullanılan standart profil ve levhalarda emniyet stoğu tutulur, özel alaşımlarda sipariş üzerine tedarik yapılır. Amaç stok maliyetiyle tedarik riski arasında bilinçli bir denge kurmaktır.",
      "Gelen her malzeme parti ve döküm kaydıyla kayıt altına alınır. Bu kayıt, üretimin ilerleyen aşamalarında bir uygunsuzluk çıktığında hangi partinin etkilendiğini belirlemenin tek güvenilir yoludur; malzeme sertifikası talebe bağlı olarak teslimat dosyasına eklenir.",
    ],
    features: [
      "Çift Kaynak — kritik malzemede onaylı ikinci tedarikçi",
      "Sınıf Bazlı Tedarik Süresi — malzeme grubuna göre planlama",
      "Emniyet Stoğu — sık kullanılan standart malzemelerde",
      "Alternatif Malzeme — şartnameyle uyumluysa teknik incelemede",
      "Parti ve Döküm Kaydı — gelen her malzeme için",
      "Malzeme Sertifikası — talebe bağlı, teslimat dosyasında",
    ],
    technicalSpecs: [
      { label: "Kritik Malzeme", value: "Çift kaynak" },
      { label: "Standart Al / SS", value: "Kısa tedarik süresi" },
      { label: "Titanyum", value: "Sipariş üzerine" },
      { label: "Nikel Esaslı Alaşım", value: "Sipariş üzerine" },
      { label: "Kayıt", value: "Parti ve döküm" },
      { label: "Sertifika", value: "Talebe bağlı" },
    ],
    processSteps: [
      "Malzeme Şartnamesinin Okunması",
      "Tedarik Süresi Değerlendirmesi",
      "Kaynak Seçimi",
      "Sipariş ve Takip",
      "Giriş Kaydı (Parti / Döküm)",
      "Üretime Aktarım",
    ],
    advantages: [
      "Tedarik riski üretim planlanmadan önce değerlendirilir",
      "Kritik malzemede tek kaynağa bağlı kalınmaz",
      "Termin, malzemenin gerçek tedarik süresiyle birlikte verilir",
      "Alternatif malzeme yalnızca şartnameyle uyumluysa önerilir",
      "Gelen malzeme parti ve döküm kaydıyla izlenir",
      "Uygunsuzlukta etkilenen parti kayıttan belirlenebilir",
    ],
    faq: [
      { question: "Malzeme tedarik süreniz ne kadar?", answer: "Malzeme sınıfına göre değişir: standart alüminyum ve paslanmaz çelik kısa sürede temin edilebilir; titanyum ve nikel esaslı alaşımlar sipariş üzerine gelir. Projenizin gerçek tedarik süresini teklifle birlikte veririz." },
      { question: "Tedarik kesintisi riski nasıl yönetiliyor?", answer: "Kritik malzemelerde onaylı ikinci kaynak bulundurulur, sık kullanılan standart malzemelerde emniyet stoğu tutulur ve şartnameyle uyumlu alternatif malzemeler önceden değerlendirilir." },
      { question: "Malzeme sertifikası alabilir miyim?", answer: "Malzeme parti ve döküm kaydı üzerinden izlenir. Malzeme sertifikası talep etmeniz halinde teslimat dosyasına eklenir." },
      { question: "Malzemeyi ben tedarik edebilir miyim?", answer: "Evet. Bu durumda malzemenin şartnameye uygunluğunu ve parti kaydını sizden alır, giriş kontrolünü buna göre planlarız." },
    ],
    comparisonTables: [
      {
        title: "Malzeme Sınıfına Göre Tedarik Yaklaşımı",
        description: "Tedarik süresi terminle doğrudan ilgilidir; strateji sınıfa göre değişir",
        headers: ["Malzeme Grubu", "Tipik Erişim", "Stok Stratejisi", "Termine Etkisi"],
        rows: [
          ["Standart alüminyum", "Kısa", "Emniyet stoğu", "Düşük"],
          ["Paslanmaz çelik", "Kısa – orta", "Emniyet stoğu", "Düşük – orta"],
          ["Alaşımlı çelik", "Orta", "Sipariş üzerine", "Orta"],
          ["Titanyum", "Uzun", "Sipariş üzerine", "Yüksek — teklifte belirtilir"],
          ["Nikel esaslı alaşım", "Uzun", "Sipariş üzerine", "Yüksek — teklifte belirtilir"],
          ["Mühendislik plastiği", "Kısa – orta", "Sipariş üzerine", "Düşük – orta"],
        ],
      },
      {
        title: "Tedarik Riskini Azaltan Kararlar",
        headers: ["Karar", "Ne Zaman Alınır", "Neyi Değiştirir"],
        rows: [
          ["Onaylı ikinci kaynak", "Malzeme kritikse", "Kesintide iş durmaz"],
          ["Alternatif malzeme", "Şartname izin veriyorsa", "Tedarik süresi kısalır"],
          ["Emniyet stoğu", "Malzeme sık kullanılıyorsa", "Termin belirsizliği düşer"],
          ["Erken sipariş", "Tedarik süresi uzunsa", "Üretim penceresi korunur"],
        ],
      },
    ],
  },
  /* OPERATIONAL EFFICIENCY — rewritten in Phase 06.

     Every number on this page was invented, several to one decimal place: a
     per-machine OEE matrix naming three machines, a %77.5 average, a %1.2
     scrap rate, %97 on-time delivery, %0.3 complaint rate, %96.8 first-pass
     yield, a 22-minute setup time, 40 mandatory training hours per employee
     and a Six Sigma belt count. `USER_INPUTS.md` supplies none of it; §D marks
     the only related verified figure (on-time delivery) at 95% and its
     visibility conditional, and §0 forbids publishing headcount at all.

     The methods themselves — 5S, Kaizen, Kanban, TPM, SMED — are real
     practices and stay. What is gone is the scoreboard. A method you can
     describe is more credible than a number nobody can audit.               */
  {
    slug: "operasyonel-verimlilik",
    category: "kabiliyetler",
    categoryLabel: "Süreç & Operasyon",
    title: "Operasyonel Verimlilik",
    metaTitle: "Operasyonel Verimlilik | Yalın Üretim, Kaizen, SMED | Mas Technic",
    metaDescription:
      "Yalın üretim, 5S, Kaizen, Kanban, TPM ve SMED uygulamaları. Kurulum süresini kısaltmak, duruşu azaltmak ve tekrarlanabilirliği artırmak için tanımlı yöntemler.",
    description:
      "Verimlilik bir hedef tablosu değil, bir çalışma biçimidir: kurulumun kısalması, duruşun azalması ve aynı parçanın her seferinde aynı çıkması aynı disiplinin sonucudur.",
    heroImage: "hero-operasyonel-verimlilik",
    content: [
      "Bir işin süresi kesme süresinden ibaret değildir. Çoğu iş için belirleyici olan kurulum, bekleme, taşıma ve yeniden ölçüm süreleridir; iyileştirme çalışmalarımız bu nedenle kesme parametrelerinden önce kurulum ve akışa bakar.",
      "SMED yaklaşımı kurulum işlerini iki gruba ayırır: tezgâh dururken yapılması zorunlu olanlar ve tezgâh çalışırken hazırlanabilecek olanlar. İkinci grubu kurulum dışına taşımak, tezgâhın parça üretmediği süreyi doğrudan kısaltır.",
      "5S ve Kanban, aranan şeyin bulunma süresini ve ara stok miktarını düşürür. Standart kurulum prosedürleri, aynı işi ikinci kez yapan operatörün ilk seferki kararları yeniden vermesini engeller — tekrarlanabilirlik burada başlar.",
      "TPM kapsamında bakım, arıza sonrası bir müdahale değil planlı bir iş adımıdır. Tezgâh doğruluğu üretimin girdisi olduğu için bakım gecikmesi doğrudan tolerans kaybı olarak geri döner.",
      "Kaizen atölyelerinde sorulan soru 'kim hata yaptı' değil, 'bu adım neden hataya açık'tır. Kök nedene inilmeden yapılan düzeltme, aynı hatayı bir sonraki partide tekrar üretir.",
    ],
    features: [
      "SMED — kurulum işlerinin tezgâh dışına taşınması",
      "5S — arama ve hazırlık süresinin düşürülmesi",
      "Kanban — malzeme akışı ve ara stok kontrolü",
      "TPM — bakımın planlı bir iş adımı olarak yürütülmesi",
      "Standart Kurulum Prosedürü — kararların tekrar verilmemesi",
      "Kaizen — kök nedene inen düzeltici faaliyet",
    ],
    technicalSpecs: [
      { label: "Yaklaşım", value: "Yalın üretim" },
      { label: "Kurulum", value: "SMED ile ayrıştırma" },
      { label: "Malzeme Akışı", value: "Kanban" },
      { label: "Bakım", value: "Planlı (TPM)" },
      { label: "İyileştirme", value: "Kaizen atölyeleri" },
      { label: "Kayıt", value: "Düzeltici faaliyet kaydı" },
    ],
    advantages: [
      "Kurulum süresi kesme süresinden önce ele alınır",
      "Tezgâh çalışırken hazırlanabilen işler kurulum dışına taşınır",
      "Standart kurulum prosedürü tekrarlanabilirliği artırır",
      "Bakım planlıdır; gecikme tolerans kaybı olarak geri döner",
      "Kök neden bulunmadan düzeltme kapatılmaz",
      "İyileştirmeler kayıt altına alınır ve izlenir",
    ],
    faq: [
      { question: "Verimlilik çalışması parçamı nasıl etkiler?", answer: "Doğrudan iki yerde: kurulum kısaldıkça küçük partiler ekonomik hale gelir, standart kurulum prosedürü ise aynı parçanın partiler arasında aynı çıkmasını kolaylaştırır." },
      { question: "SMED nedir, neden önemli?", answer: "Kurulum işlerini tezgâh dururken zorunlu olanlar ve çalışırken hazırlanabilecek olanlar diye ayırır. İkincisini kurulum dışına taşımak, tezgâhın parça üretmediği süreyi kısaltır." },
      { question: "Bakımı nasıl yönetiyorsunuz?", answer: "Bakım planlı bir iş adımıdır (TPM). Tezgâh doğruluğu üretimin girdisi olduğu için bakım gecikmesi doğrudan tolerans kaybı riski üretir." },
      { question: "Bir uygunsuzluk çıkarsa ne yapılıyor?", answer: "Kaizen ve düzeltici faaliyet süreci işletilir: kök neden bulunmadan aynı kurulumla üretime devam edilmez ve yapılan düzeltme kayıt altına alınır." },
    ],
    comparisonTables: [
      {
        title: "Kayıp Türü ve Karşılık Gelen Yöntem",
        description: "Yalın üretimde her kayıp türünün kendi müdahale aracı vardır",
        headers: ["Kayıp Türü", "Nerede Görünür", "Uygulanan Yöntem", "Bıraktığı Kayıt"],
        rows: [
          ["Kurulum süresi", "Tezgâh dururken geçen hazırlık", "SMED + standart kurulum", "Kurulum onayı"],
          ["Arama ve hazırlık", "Takım, fikstür, ölçü aleti arayışı", "5S", "Yerleşim standardı"],
          ["Ara stok", "Operasyonlar arası bekleyen parça", "Kanban", "Akış kaydı"],
          ["Plansız duruş", "Arıza sonrası bekleme", "TPM — planlı bakım", "Bakım kaydı"],
          ["Tekrarlayan hata", "Aynı uygunsuzluğun geri gelmesi", "Kaizen — kök neden analizi", "Düzeltici faaliyet kaydı"],
        ],
      },
      {
        title: "Kurulum İşlerinin Ayrıştırılması (SMED)",
        description: "Aynı işi hangi tarafta yaptığınız, tezgâhın boşta geçen süresini belirler",
        headers: ["İş", "Tezgâh Dururken Zorunlu mu", "Nasıl Kısaltılır"],
        rows: [
          ["Takım hazırlığı ve ön ayar", "Hayır", "Önceki iş sürerken hazırlanır"],
          ["Fikstür montajı", "Evet", "Hızlı bağlama ve sabit referans"],
          ["Program yükleme ve doğrulama", "Hayır", "Simülasyon önceden tamamlanır"],
          ["Sıfırlama ve referans alma", "Evet", "Standart referans yüzeyi kullanılır"],
          ["İlk parça kontrolü", "Evet", "Kontrol planı önceden hazırdır"],
        ],
      },
    ],
  },

  // ── Endüstriyel > Yüksek Teknoloji ──
  {
    slug: "havacilik-uzay",
    category: "endustriyel",
    categoryLabel: "Yüksek Teknoloji",
    title: "Havacılık & Uzay",
    metaTitle: "Havacılık & Uzay Parça Üretimi | Ti & Inconel İşleme | Mas Technic",
    metaDescription: "Havacılık ve uzay için titanyum Ti6Al4V, Inconel 718 ve havacılık alüminyumu işleme. Kontrol planı, ilk parça kontrolü ve parti izlenebilirliği.",
    description: "Havacılık ve uzay sanayi için motor bileşenleri, yapısal parçalar ve aviyonik muhafazalar üretiyoruz. Zor işlenen alaşımlarda kontrol planına bağlı, izlenebilir üretim.",
    heroImage: "hero-havacilik",
    content: [
      "Havacılık ve uzay sanayi için motor bileşenleri, yapısal parçalar (braket, fitting, rib) ve aviyonik muhafazalar üretiyoruz. Titanyum Ti6Al4V, Inconel 718 ve havacılık alüminyum alaşımları (7075-T6, 2024-T3); ısıyı kesiciye taşıyan, takım ömrünü kısaltan ve bağlama kuvvetine duyarlı malzemelerdir.",
      "Özel proses ihtiyaçları — kimyasal işlemler (anodizasyon, pasivasyon, kromatlama), tahribatsız muayene, ısıl işlem (çökelme sertleştirme, gerilim giderme) ve yüzey kaplama — projenin şartnamesine göre planlanır ve tedarik zinciriyle birlikte yürütülür. Parametreler dondurulur; değişiklik yeniden doğrulama gerektirir.",
      "Kalite yaklaşımımız: ilk parça kontrolü, kontrol planında tanımlanan koteler üzerinden boyutsal ve görsel muayene, GD&T ölçümü, malzeme şartnamesinin (AMS, ASTM) parti kaydıyla doğrulanması ve parti bazlı izlenebilirlik. Belgelendirme formatı müşteri şartnamesine göre belirlenir.",
      "5 eksenli işleme merkezlerimizde karmaşık havacılık geometrilerini tek bağlamada işliyoruz; standart çalışma aralığımız ±0.01 mm'dir. Takım yolları simülasyonla doğrulanır ve seri, ilk parça kontrolü onaylanmadan başlamaz.",
    ],
    features: [
      "Zor İşlenen Alaşım Deneyimi — Ti6Al4V, Inconel 718",
      "Özel Proses Planlaması — kimyasal işlem, NDT, ısıl işlem",
      "Titanyum & Inconel İşleme — 5 eksen, HSM, özel takım",
      "İlk Parça Kontrolü — seri, onay alınmadan başlamaz",
      "İzlenebilirlik — parti ve döküm kaydı",
      "Frozen Process — Onaylı süreç parametreleri sabitlenmiş",
    ],
    technicalSpecs: [
      { label: "Yönetim Sistemi", value: "ISO 9001:2015" },
      { label: "NDT", value: "RT, UT, PT, MT, ET" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
      { label: "Malzemeler", value: "Ti6Al4V, Inconel 718, Al 7075" },
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "İlk Parça", value: "Kontrol planına göre" },
    ],
    processSteps: [
      "Sözleşme İnceleme & PO",
      "Malzeme Tedarik (şartnameye göre)",
      "CAM Programlama & Simülasyon",
      "5 Eksen CNC İşleme",
      "NDT Muayene",
      "CMM & FAI Raporu",
      "Yüzey İşlemi",
      "Son Muayene & Paketleme",
    ],
    advantages: [
      "Zor işlenen alaşımlarda takım ve parametre disiplini",
      "Parti ve döküm kaydına dayalı izlenebilirlik",
      "Ti6Al4V ve Inconel 718 işleme uzmanlığı",
      "5 eksen tek bağlamada karmaşık havacılık geometrileri",
      "İlk parça kontrol kaydı ve ölçüm dosyası teslimi",
      "Frozen process ile onaylı parametrelerin sabitleştirilmesi",
    ],
    materials: [
      { name: "Titanyum", grade: "Ti6Al4V (Grade 5)", properties: "Hafif, biyouyumlu, 950 MPa çekme" },
      { name: "Inconel", grade: "718", properties: "Yüksek sıcaklık, 1034 MPa, türbin parçaları" },
      { name: "Alüminyum", grade: "7075-T6", properties: "Yüksek mukavemet, havacılık yapısal" },
      { name: "Alüminyum", grade: "2024-T3", properties: "Havacılık kaplamalı levha, yorulma direnci" },
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 yönetim sistemi belgelerimiz bulunmaktadır. Projeniz farklı bir standart gerektiriyorsa teknik incelemede birlikte değerlendiririz." },
      { question: "Titanyum işleyebiliyor musunuz?", answer: "Evet, Ti6Al4V (Grade 5) ve Grade 2 titanyum işleme konusunda uzmanız. Özel takımlar, düşük hız/yüksek ilerleme stratejisi ve soğutma yönetimi ile optimal sonuçlar elde ediyoruz." },
      { question: "İlk parça kontrolü yapıyor musunuz?", answer: "Evet. Her yeni parça ve her revizyon için ilk parça kontrolü yapılır ve kayıt altına alınır; belgelendirme formatını şartnamenize göre birlikte belirleriz." },
      { question: "Özel prosesler nasıl yürütülüyor?", answer: "Kimyasal işlem, tahribatsız muayene ve ısıl işlem gibi özel prosesler projenin şartnamesine göre planlanır ve tedarik zinciriyle birlikte yürütülür. Parametreler dondurulur; değişiklik yeniden doğrulama gerektirir." },
    ],
    comparisonTables: [
      {
        title: "Havacılık Malzeme Performans Karşılaştırması",
        headers: ["Malzeme", "Çekme Dayanımı", "Yoğunluk", "Maks. Sıcaklık", "Korozyon Direnci", "Maliyet", "Tipik Uygulama"],
        rows: [
          ["Al 7075-T6", "572 MPa", "2.81 g/cm³", "150°C", "İyi (anodizasyon ile)", "$$", "Yapısal braket, rib, fitting"],
          ["Ti6Al4V (Gr5)", "950 MPa", "4.43 g/cm³", "400°C", "Mükemmel", "$$$$", "Motor, iniş takımı, bağlantı"],
          ["Inconel 718", "1034 MPa", "8.19 g/cm³", "700°C", "Mükemmel", "$$$$$", "Türbin, yanma odası, egzoz"],
          ["SS 15-5PH", "1000 MPa", "7.78 g/cm³", "316°C", "Çok iyi", "$$$", "Aktüatör, valf, yapısal"],
        ],
      },
    ],
  },
  {
    slug: "savunma-sanayi",
    category: "endustriyel",
    categoryLabel: "Yüksek Teknoloji",
    title: "Savunma Sanayi",
    metaTitle: "Savunma Sanayi Parça Üretimi | Balistik Çelik ve Özel Alaşım | Mas Technic",
    metaDescription: "Savunma sanayi için balistik çelik, titanyum ve özel alaşım işleme. Parti ve döküm izlenebilirliği, kontrol planına bağlı muayene.",
    description: "Savunma sanayi için hassas parça üretimi. Zor işlenen malzemelerde kontrol planına bağlı üretim ve parti bazlı izlenebilirlik.",
    content: [
      "Kara, deniz ve hava platformlarına yönelik kritik bileşenler üretiyoruz: silah sistemi komponentleri, optronik muhafazalar, zırh parçaları ve muhabere sistemi bileşenleri. Projenizin tabi olduğu şartname ve standart gereksinimlerini teknik incelemede birlikte okuruz.",
      "Savunma projelerinde teknik verinin nasıl paylaşılacağı ve hangi koşullarla işleneceği proje başında yazılı olarak mutabık kalınır. Şartnamenizin gerektirdiği koşulları teklif aşamasında birlikte değerlendiririz.",
      "Balistik çelik (Armox 500T, Hardox 600), havacılık titanyumu (Ti6Al4V), yüksek mukavemet çelikleri (4340, 300M) ve özel alaşımlar (Inconel, Stellite) işleme kabiliyetimiz ile savunma sanayinin en zorlu malzeme gereksinimlerini karşılıyoruz.",
      "Tahribatsız muayene (RT, UT, PT, MT) kapsamı şartnameye göre kontrol planında tanımlanır ve sonuçlar kayıt altına alınır. Parti bazlı izlenebilirlik ile konfigürasyon ve revizyon takibi birlikte yürütülür.",
    ],
    features: [
      "Şartname Okuma — proje standardı teknik incelemede birlikte değerlendirilir",
      "Konfigürasyon Takibi — versiyon ve revizyon kaydı",
      "Veri Paylaşımı — koşullar proje başında yazılı olarak belirlenir",
      "Tahribatsız Muayene — RT, UT, PT, MT; kapsam plana yazılır",
      "Balistik Malzeme İşleme — Armox 500T, Hardox 600",
      "Konfigürasyon Yönetimi — Versiyon ve değişiklik takibi",
    ],
    technicalSpecs: [
      { label: "Yönetim Sistemi", value: "ISO 9001:2015" },
      { label: "Şartname", value: "Proje bazında okunur" },
      { label: "NDT", value: "RT, UT, PT, MT" },
      { label: "Malzemeler", value: "Armox, Ti, 4340, 300M" },
      { label: "Koşullar", value: "Proje başında yazılı" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
    ],
    processSteps: [
      "Proje Koşullarının Belirlenmesi",
      "Teknik İnceleme & Teklif",
      "Malzeme Tedarik (şartnameye göre)",
      "Üretim",
      "Tahribatsız Muayene",
      "Konfigürasyon Doğrulama",
      "Güvenli Paketleme & Teslimat",
    ],
    advantages: [
      "Proje şartnamesi teknik incelemede satır satır okunur",
      "Teknik veri koşulları proje başında yazılı olarak belirlenir",
      "Balistik çelik ve özel alaşım işleme uzmanlığı",
      "Tahribatsız muayene kapsamı kontrol planında tanımlanır",
      "Parti ve döküm kaydına dayalı izlenebilirlik",
      "Konfigürasyon yönetimi ve değişiklik kontrolü",
    ],
    faq: [
      { question: "Teknik verim nasıl ele alınıyor?", answer: "Teknik verinin nasıl paylaşılacağı ve hangi koşullarla işleneceği proje başında yazılı olarak mutabık kalınır. Şartnamenizin gerektirdiği koşulları teklif aşamasında birlikte değerlendiririz." },
      { question: "Proje şartnamemi karşılayabiliyor musunuz?", answer: "Şartnamenizi teknik incelemede satır satır okur, hangi gereksinimleri bugünkü kabiliyetimizle karşılayabildiğimizi ve hangileri için tedarik zinciri gerektiğini açıkça belirtiriz." },
      { question: "Balistik malzeme işleyebiliyor musunuz?", answer: "Evet, Armox 500T, Hardox 600 ve 300M gibi yüksek sertlikli balistik çelikleri CNC ile işleyebiliyoruz." },
    ],
  },
  {
    slug: "robotik",
    category: "endustriyel",
    categoryLabel: "Yüksek Teknoloji",
    title: "Robotik & Otomasyon",
    metaTitle: "Robotik & Otomasyon Parça Üretimi | ±0.01 mm | Mas Technic",
    metaDescription: "Endüstriyel robot, cobot ve otomasyon sistemleri için hassas mekanik bileşenler. Aktüatör gövdesi, eklem parçası, gripper. Al 7075, SS 316L, ±0.01 mm.",
    description: "Endüstriyel robotlar, cobot'lar ve otomasyon sistemleri için hassas mekanik bileşenler. Aktüatör gövdeleri, eklem parçaları ve gripper komponentleri.",
    content: [
      "Endüstriyel robotlar, kolaboratif robotlar (cobot) ve özel otomasyon sistemleri için hassas mekanik bileşenler üretiyoruz: aktüatör gövdeleri, eklem (joint) parçaları, redüktör muhafazaları, gripper bileşenleri ve sensör montaj aparatları.",
      "Robot bileşenlerinde belirleyici olan tek bir kote değil, eksenlerin birbirine göre konumudur: eş eksenlilik ve diklik, kolun tekrarlanabilirliğini doğrudan etkiler. Bu nedenle referans yüzeyler tek bağlamada işlenir ve ölçüm aynı datum üzerinden yapılır.",
      "Prototipten seri üretime esnek planlama yapıyoruz. Her robot projesi DFM analizi ile başlar, fonksiyonel prototip ile doğrulanır ve numune onayından sonra seri üretime geçilir.",
    ],
    features: [
      "Aktüatör Gövdesi — Al 7075, SS 316L, ±0.01 mm",
      "Eklem (Joint) Parçaları — Yüksek hassasiyet, düşük ağırlık",
      "Gripper Bileşenleri — Özel geometri, fonksiyonel yüzey",
      "Redüktör Muhafazası — Konsantrik hassasiyet, termal kararlılık",
      "Sensör Montaj Aparatı — Mikro hassasiyet, vibrasyon direnci",
      "Prototipten Seri Üretime — DFM → Prototip → Numune Onayı → Seri",
    ],
    technicalSpecs: [
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "Malzeme", value: "Al 7075, SS 316L, POM" },
      { label: "Yüzey", value: "Ra 0.4µm" },
      { label: "Seri Üretim", value: "100-10K adet/yıl" },
      { label: "Ağırlık Opt.", value: "Topoloji optimizasyonu" },
      { label: "GD&T", value: "Konsantriklik ≤0.01mm" },
    ],
    advantages: [
      "5 eksen tek bağlamada karmaşık robot geometrileri",
      "Al 7075 ile hafif ve yüksek dayanımlı bileşenler",
      "Referans yüzeyler tek bağlamada işlenir, ölçüm aynı datumdan yapılır",
      "DFM analizi ile ağırlık ve maliyet optimizasyonu",
      "Prototipten seri üretime sorunsuz geçiş",
      "Endüstriyel robot ve cobot bileşenlerinde yedek parça deneyimi",
    ],
    faq: [
      { question: "Robot bileşenlerinde hangi toleransları tutabiliyorsunuz?", answer: "Standart çalışma aralığımız ±0.01mm'dir. Eş eksenlilik ve diklik gibi geometrik toleranslar datum yapısıyla birlikte değerlendirilir ve kontrol planına yazılır." },
      { question: "Hafif malzeme çözümleriniz var mı?", answer: "Evet, Al 7075-T6 ile yüksek mukavemet/ağırlık oranı, topoloji optimizasyonu ile ağırlık azaltma ve PEEK gibi yüksek performans plastikler sunuyoruz." },
      { question: "Seri üretim yapabiliyor musunuz?", answer: "Evet, 100-10.000 adet/yıl kapasitede otomasyonlu CNC seri üretim yapabiliyoruz. Bar besleyici ve palet sistemi ile kesintisiz üretim sağlıyoruz." },
    ],
  },

  // ── Endüstriyel > Seri Üretim ──
  {
    slug: "otomotiv",
    category: "endustriyel",
    categoryLabel: "Seri Üretim",
    title: "Otomotiv",
    metaTitle: "Otomotiv Parça Üretimi | Tekrarlanabilir Seri İmalat | Mas Technic",
    metaDescription: "Otomotiv için motor, şanzıman, fren ve süspansiyon komponentleri. Kontrol planına bağlı, parti izlenebilirliği olan tekrarlanabilir seri imalat.",
    description: "Otomotiv tedarik zinciri için tekrarlanabilir seri parça üretimi: standart kurulum, kontrol planına bağlı ölçüm ve parti bazlı izlenebilirlik.",
    content: [
      "Otomotiv sektörü için motor bileşenleri (silindir kapağı, krank mili, kam mili), şanzıman parçaları (dişli, mil, muhafaza), fren sistemi bileşenleri (kaliper, disk, piston) ve süspansiyon komponentleri (salıncak, rotil, bijon) üretiyoruz.",
      "Konseptten seri üretime geçiş onay noktalarıyla ilerler: risk analizi, kontrol planı, pilot üretim ve numune onayı. Şartnamenizin gerektirdiği dokümantasyon kapsamını teklif aşamasında birlikte belirleriz.",
      "Otomotiv işlerinde belirleyici olan tek parçanın toleransı değil, partiler arası tutarlılıktır. Takım aşınmasına duyarlı koteler ara kontrolle izlenir, ölçüm sonuçları kayıt altına alınır ve sapma eğilimi görüldüğünde parça değil proses düzeltilir.",
      "8D problem çözme metodolojisi, Poka-Yoke hata önleme sistemleri ve Kaizen sürekli iyileştirme yaklaşımı ile otomotiv kalite kültürünü yaşatıyoruz.",
    ],
    features: [
      "Standart Kurulum — partiler arası tutarlılık",
      "Numune Onayı — seri, ilk parça onaylanmadan başlamaz",
      "APQP — İleri ürün kalite planlama",
      "Ara Kontrol — takım aşınmasına duyarlı koteler izlenir",
      "Otomatik Takım Değiştirme — uzun partilerde kesintisiz işleme",
      "Parti İzlenebilirliği — döküm ve parti kaydı",
    ],
    technicalSpecs: [
      { label: "Yönetim Sistemi", value: "ISO 9001:2015" },
      { label: "Onay", value: "Numune onayı" },
      { label: "Ara Kontrol", value: "Kayma eğilimli koteler" },
      { label: "Kurulum", value: "Standart prosedür" },
      { label: "Kontrol", value: "Kontrol planına göre" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
    ],
    processSteps: [
      "APQP Planlama",
      "FMEA Analizi",
      "Kontrol Planı",
      "Pilot Üretim & MSA",
      "Numune Onayı",
      "Seri Üretim",
      "SPC İzleme",
      "Sürekli İyileştirme",
    ],
    advantages: [
      "Numune onaylanmadan seri üretim başlamaz",
      "Dokümantasyon kapsamı şartnameye göre belirlenir",
      "Takım aşınmasına duyarlı koteler ara kontrolle izlenir",
      "Standart kurulum prosedürü ile partiler arası tutarlılık",
      "8D problem çözme ve Poka-Yoke hata önleme",
      "Otomotiv tedarik zincirinde çalışma deneyimi",
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 yönetim sistemi belgelerimiz bulunmaktadır. Müşterinizin şartnamesi sektöre özel bir standart gerektiriyorsa bunu teklif aşamasında açıkça değerlendiririz." },
      { question: "Hangi dokümantasyonu teslim ediyorsunuz?", answer: "Kontrol planı, ölçüm kayıtları, malzeme parti/döküm kaydı ve numune parçalar standart olarak hazırlanır. Şartnamenizin gerektirdiği ek dokümanları teklif aşamasında birlikte belirleriz." },
      { question: "Partiler arası tutarlılığı nasıl koruyorsunuz?", answer: "Standart kurulum prosedürü, ilk parça onayı ve kontrol planına bağlı ara kontroller ile. Takım aşınmasına duyarlı koteler ayrı bir adımda izlenir ve sonuçlar kayıt altına alınır." },
      { question: "Adet aralığınız nedir?", answer: "Prototipten seri üretime kadar çalışıyoruz. Parti büyüklüğü ve teslimat programı, kapasite planlaması yapıldıktan sonra teklifle birlikte netleşir." },
    ],
  },
  /* MEDICAL — rewritten in Phase 06.

     The page claimed ISO 13485:2016 certification, FDA 21 CFR 820 and MDR
     2017/745 compliance, an ISO 14644-1 Class 7 cleanroom, ISO 10993
     biocompatibility certificates, DHF/DMR documentation, UDI traceability,
     %100 dimensional inspection and ±0.002 mm tolerance. `USER_INPUTS.md` §C
     lists ISO 9001, ISO 14001 and OHSAS 18001 — nothing else. A regulatory
     compliance claim in this sector is not marketing language; a buyer can act
     on it, and a supplier who cannot support it puts their customer's
     submission at risk.

     What is true and useful stays: which materials are machined, why they are
     difficult, and how conformity is recorded.                              */
  {
    slug: "medikal",
    category: "endustriyel",
    categoryLabel: "Seri Üretim",
    title: "Medikal & Biyomedikal",
    metaTitle: "Medikal Parça Üretimi | Ti Gr5, SS 316L, PEEK İşleme | Mas Technic",
    metaDescription:
      "Medikal cihaz bileşenleri, cerrahi alet ve implant parçalarında hassas işleme. Ti Grade 5, SS 316L, CoCrMo, PEEK; parti izlenebilirliği ve ölçüm kaydı.",
    description:
      "Medikal cihaz bileşenleri, cerrahi aletler ve implant parçalarında hassas işleme. Malzemesi zor, toleransı dar ve izlenebilirliği şart olan parçalar.",
    content: [
      "Medikal cihaz bileşenleri, cerrahi el aletleri ve implant parçaları üretiyoruz: kemik vidası, plaka ve çubuk gibi implant geometrileri, forseps ve makas gibi el aletleri, ortopedik komponentler ve laboratuvar ekipmanı parçaları.",
      "Bu sektörün malzemeleri kolay işlenmez. Ti Grade 5 (Ti6Al4V) ısıyı kesiciye taşır ve takım ömrünü kısaltır; SS 316L yapışkan talaş üretir; CoCrMo aşındırıcıdır; PEEK ve UHMWPE ise ısıl genleşmesi yüksek olduğu için ölçünün ölçüm anındaki sıcaklıkla değiştiğini hesaba katmayı gerektirir.",
      "Yüzey durumu çoğu medikal parçada fonksiyonun kendisidir. Elektropolisaj ve pasivasyon, yüzey pürüzlülüğünü düşürmenin yanında serbest demiri gidererek korozyon davranışını değiştirir; hangi işlemin uygulanacağı malzeme ve şartnameye göre belirlenir.",
      "İzlenebilirlik parti ve döküm kaydı üzerinden yürütülür. Malzeme sertifikası ve ölçüm kaydı talebe bağlı olarak teslimat dosyasına eklenir; şartnamenizin gerektirdiği ek dokümantasyon ihtiyacını teklif aşamasında birlikte belirleriz.",
      "Mikro işleme kabiliyetimizle Ø0.3mm'den başlayan medikal vidalar, pimler ve konektörler üretiyoruz. Kayar puntalı tornalama, uzun ve ince implant vidalarında sehimi sınırladığı için tercih edilir.",
    ],
    features: [
      "Biyouyumlu Malzeme İşleme — Ti Gr5, SS 316L, CoCrMo, PEEK, UHMWPE",
      "Mikro İşleme — Ø0.3mm'den başlayan implant vidaları",
      "Kayar Puntalı Tornalama — uzun ve ince parçalarda sehim kontrolü",
      "Elektropolisaj ve Pasivasyon — yüzey ve korozyon davranışı",
      "Parti İzlenebilirliği — döküm ve parti kaydı",
      "Ölçüm Kaydı — kontrol planına göre, teslimat dosyasında",
    ],
    technicalSpecs: [
      { label: "Yönetim Sistemi", value: "ISO 9001:2015" },
      { label: "Malzeme", value: "Ti Gr5, SS 316L, CoCrMo, PEEK" },
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "Yüzey", value: "Elektropolisaj / pasivasyon" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
      { label: "Dokümantasyon", value: "Şartnameye göre belirlenir" },
    ],
    processSteps: [
      "Tasarım İnceleme",
      "Malzeme Tedarik ve Parti Kaydı",
      "CNC / Mikro İşleme",
      "Yüzey İşlemi (Elektropolisaj / Pasivasyon)",
      "Kontrol Planına Göre Ölçüm",
      "Temizlik ve Paketleme",
      "Ölçüm Kaydı Teslimi",
    ],
    advantages: [
      "Zor işlenen biyouyumlu malzemelerde takım ve parametre disiplini",
      "Ø0.3mm'den başlayan mikro medikal parça üretimi",
      "Uzun ince parçalarda kayar puntalı tornalama ile sehim kontrolü",
      "Yüzey işlemi malzeme ve şartnameye göre seçilir",
      "Parti ve döküm kaydı ile izlenebilirlik",
      "Ek dokümantasyon ihtiyacı teklif aşamasında netleştirilir",
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 yönetim sistemi belgelerimiz bulunmaktadır. Projeniz sektöre özel bir standart gerektiriyorsa bunu teklif aşamasında açıkça değerlendiririz." },
      { question: "Hangi biyouyumlu malzemelerle çalışıyorsunuz?", answer: "Ti Grade 5 (Ti6Al4V), SS 316L, CoCrMo, PEEK ve UHMWPE malzemelerde işleme yapıyoruz. Malzemenin sertifikası tedarikçiden gelir ve talep etmeniz halinde teslimat dosyasına eklenir." },
      { question: "Yüzey işlemi yapıyor musunuz?", answer: "Elektropolisaj ve pasivasyon uygulanabilir. Hangi işlemin uygun olduğu malzemeye ve şartnamenize göre belirlenir." },
      { question: "İzlenebilirliği nasıl sağlıyorsunuz?", answer: "Malzeme parti ve döküm kaydı üzerinden izlenir; kontrol planında tanımlanan koteler ölçülür ve ölçüm kaydı teslimat dosyasına eklenir." },
      { question: "Çok küçük parçalar üretebiliyor musunuz?", answer: "Evet. Ø0.3mm'den başlayan vidalar, pimler ve konektörler üretiyoruz; uzun ve ince geometrilerde kayar puntalı tornalama tercih edilir." },
    ],
  },
  {
    slug: "yelken-yat-sistemleri",
    category: "endustriyel",
    categoryLabel: "Seri Üretim",
    title: "Yelken & Yat Sistemleri",
    metaTitle: "Yelken & Yat Parça Üretimi | Korozyona Dayanıklı Alaşımlar | Mas Technic",
    metaDescription: "Denizcilik için korozyona dayanıklı parça üretimi. SS 316L, bronz ve Duplex çelik işleme, elektropolisaj ve galvanik uyum gözeterek malzeme seçimi.",
    description: "Yelken, yat ve denizcilik için korozyona dayanıklı, deniz suyu ortamına uygun hassas mühendislik parçaları.",
    content: [
      "Yelken ve yat sistemleri için SS 316L, Duplex 2205, bronz (C95400) ve özel denizcilik alaşımları ile korozyona dayanıklı parçalar üretiyoruz. Makaralar, vinçler, baş kösteği bağlantıları, dümen sistemi komponentleri ve pervane milleri konusunda uzmanız.",
      "Deniz suyu ortamında parçayı bitiren şey çoğu zaman yük değil korozyondur. Malzeme seçimi galvanik uyum gözetilerek yapılır — birbirine temas eden farklı metaller, tek başına doğru seçilmiş bir alaşımı bile hızla tüketebilir. Elektropolisaj ve pasivasyon, yüzeydeki serbest demiri gidererek korozyon davranışını iyileştirir.",
      "Superyacht ve yarış yelkenciliği segmentlerinde hafif ve yüksek mukavemetli bileşenler — titanyum bağlantı elemanları, karbon fiber takviyeli parçalar ve özel alaşım pervane milleri üretiyoruz.",
    ],
    features: [
      "Galvanik Uyum — temas eden malzemeler birlikte değerlendirilir",
      "Korozyon Direnci — 1000+ saat ASTM B117 tuz testi",
      "SS 316L & Duplex — Deniz suyu uyumlu malzemeler",
      "Elektropolisaj — Ra 0.2µm yüzey kalitesi",
      "Bronz İşleme — C95400, C95500 denizcilik bronzu",
      "Pervane Mili — Titanyum ve Monel alaşımlar",
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "SS 316L, Duplex, Bronz" },
      { label: "Tuz Testi", value: "1000+ saat (ASTM B117)" },
      { label: "Yüzey", value: "Ra 0.2µm (elektropolisaj)" },
      { label: "Malzeme Seçimi", value: "Galvanik uyuma göre" },
      { label: "Tolerans", value: "±0.01mm" },
      { label: "Sızdırmazlık", value: "O-ring yüzeyi Ra 0.4µm" },
    ],
    advantages: [
      "Malzeme seçimi galvanik uyum gözetilerek yapılır",
      "ASTM B117 tuz spreyi testi ile korozyon direnci doğrulaması",
      "SS 316L, Duplex ve bronz işleme uzmanlığı",
      "Superyacht ve yarış yelkenciliği deneyimi",
      "Elektropolisaj ile ultra-pürüzsüz yüzey",
      "Katodik koruma uyumlu malzeme danışmanlığı",
    ],
    faq: [
      { question: "Deniz suyu uyumlu hangi malzemeleri işliyorsunuz?", answer: "SS 316L, Duplex 2205, bronz (C95400, C95500), Monel 400 ve titanyum Grade 2 gibi deniz suyu uyumlu malzemelerle çalışıyoruz." },
      { question: "Tuz testi raporu veriyor musunuz?", answer: "Evet, ASTM B117 tuz spreyi test yöntemiyle yapılan testin raporunu sağlıyoruz. Test süresi ve kabul kriteri parçanın şartnamesine göre belirlenir." },
    ],
  },

  // ── Endüstriyel > Endüstriyel Sistemler ──
  {
    slug: "hidrolik-pnomatik",
    category: "endustriyel",
    categoryLabel: "Endüstriyel Sistemler",
    title: "Hidrolik & Pnömatik",
    metaTitle: "Hidrolik & Pnömatik Parça Üretimi | 350 Bar | Sızdırmazlık | Mas Technic",
    metaDescription: "350 bar basınç dayanımlı hidrolik ve pnömatik sistem bileşenleri. Valf gövdesi, silindir, manifold blok. 42CrMo4, C45 çelik, Ra 0.4µm sızdırmazlık yüzeyi.",
    description: "350 bar basınç dayanımlı hidrolik ve pnömatik sistem bileşenleri. Valf gövdeleri, silindir parçaları, manifold blokları ve özel akışkan güç komponentleri.",
    content: [
      "Hidrolik ve pnömatik sistemler için yüksek basınç dayanımlı bileşenler üretiyoruz. Valf gövdeleri (yönlendirme, basınç, akış kontrol), silindir parçaları (piston, gövde, kapak), manifold blokları (çok portlu, entegre devre) ve pompa bileşenleri konusunda uzmanız.",
      "350 bar'a kadar çalışma basıncında O-ring ve sızdırmazlık yüzeyleri Ra 0.4µm kalitesinde işlenmektedir. 42CrMo4, C45, SS 316 ve özel alaşımlarla üretim yapıyoruz. Derin delik delme kabiliyetimiz ile manifold bloklarında iç kanal işleme gerçekleştiriyoruz.",
      "Basınç ve sızdırmazlık testleri, iş bazında kontrol planında tanımlanan kapsamda uygulanır ve sonuçlar kayıt altına alınır. Valf montaj yüzeyleri ISO 4401 delik düzenine göre işlenir; bağlantı geometrileri yaygın hidrolik bileşen arayüzleriyle çalışacak şekilde üretilir.",
    ],
    features: [
      "Valf Gövdesi — Yönlendirme, basınç ve akış kontrol valfleri",
      "Silindir Parçası — Piston, gövde, kapak, mil",
      "Manifold Blok — Çok portlu, derin delik kanallı",
      "350 Bar Basınç — Yüksek basınç dayanımlı üretim",
      "Sızdırmazlık Yüzeyi — Ra 0.4µm O-ring kanalları",
      "Basınç Testi — Kontrol planına göre sızdırmazlık kontrolü",
    ],
    technicalSpecs: [
      { label: "Maks. Basınç", value: "350 bar" },
      { label: "Sızdırmazlık", value: "Ra 0.4µm O-ring yüzey" },
      { label: "Malzeme", value: "42CrMo4, C45, SS 316" },
      { label: "Test", value: "1.5× basınç testi" },
      { label: "Delik Düzeni", value: "ISO 4401" },
      { label: "Derin Delik", value: "L/D 50:1" },
    ],
    processSteps: [
      "Teknik Çizim İnceleme",
      "Malzeme Hazırlığı",
      "CNC İşleme & Derin Delik",
      "Sızdırmazlık Yüzey İşleme",
      "Basınç Testi",
      "Boyutsal Kontrol & CMM",
      "Koruyucu Paketleme",
    ],
    advantages: [
      "350 bar'a kadar çalışma basıncı için tasarım ve üretim",
      "Ra 0.4µm sızdırmazlık yüzeyi işleme kalitesi",
      "Derin delik kabiliyeti ile manifold kanal işleme",
      "Kontrol planına göre basınç ve sızdırmazlık testi",
      "BoschRexroth, Parker uyumlu bağlantı geometrileri",
      "42CrMo4 ve SS 316 malzeme uzmanlığı",
    ],
    faq: [
      { question: "Kaç bar basınca kadar parça üretebiliyorsunuz?", answer: "350 bar çalışma basıncına kadar parça üretiyoruz. Her parça 1.5× çalışma basıncında test edilmektedir." },
      { question: "Manifold bloklarında iç kanal açabilir misiniz?", answer: "Evet, derin delik delme kabiliyetimiz ile L/D 50:1 oranında manifold kanal işleme yapabiliyoruz." },
      { question: "Sızdırmazlık nasıl doğrulanıyor?", answer: "O-ring kanalları ve sızdırmazlık yüzeyleri Ra 0.4µm hedefiyle işlenir. Basınç ve sızdırmazlık testinin kapsamı iş bazında kontrol planında tanımlanır ve sonuçlar teslimat dosyasına eklenir." },
    ],
  },
  {
    slug: "boru-baglanti-parcalari",
    category: "endustriyel",
    categoryLabel: "Endüstriyel Sistemler",
    title: "Boru & Bağlantı Parçaları",
    metaTitle: "Endüstriyel Boru & Bağlantı Parçaları | ANSI, DIN, JIS | PN6-PN40 | Mas Technic",
    metaDescription: "ANSI, DIN, JIS standartlarında boru bağlantı parçaları. Flanş, adaptör, nipel, dirsek. DN15-DN600, PN6-PN40. SS, CS, Duplex çelik.",
    description: "ANSI, DIN ve JIS standartlarında endüstriyel boru bağlantı parçaları. Flanş, adaptör, nipel, dirsek ve özel geçiş parçaları.",
    content: [
      "Endüstriyel boru sistemleri için flanş (kaynak boyunlu, slip-on, kör), adaptörler (boru çapı ve standart geçişleri), nipeller, dirsekler, T-parçalar ve redüksiyonlar üretiyoruz. Flanş delik düzeni, conta yüzeyi ve çap ölçüleri ANSI B16.5, DIN EN 1092 ve JIS B2220 boyut tablolarına göre işlenir.",
      "DN15-DN600 çap aralığında ve PN6-PN40 basınç sınıflarında üretim yapıyoruz. Karbon çeliği (A105, A350 LF2), paslanmaz çelik (F304, F316, F321), Duplex (F51, F53) ve özel alaşımlarla (Inconel, Monel, Hastelloy) çalışıyoruz.",
      "Basınç testi, boyutsal kontrol ve yüzey muayenesinin kapsamı iş bazında kontrol planında tanımlanır; sonuçlar kayıt altına alınır. Sızdırmazlık yüzeyleri ASME B16.5 FF/RF geometrisinde işlenir. Isıl işlem kaydı, NDT muayene raporu ve malzeme sertifikası talebe bağlı olarak sağlanır.",
    ],
    features: [
      "Çoklu Standart — ANSI B16.5, DIN EN 1092, JIS B2220",
      "Geniş Çap Aralığı — DN15'ten DN600'e kadar",
      "PN6-PN40 Basınç — Farklı basınç sınıflarında üretim",
      "Özel Alaşımlar — Inconel, Monel, Hastelloy",
      "Sızdırmazlık Yüzey — FF/RF ASME B16.5 geometrisi",
      "Malzeme Sertifikası — Talebe bağlı olarak sağlanır",
    ],
    technicalSpecs: [
      { label: "Standartlar", value: "ANSI, DIN, JIS" },
      { label: "Basınç Sınıfı", value: "PN6-PN40 / 150-2500 lb" },
      { label: "Çap Aralığı", value: "DN15-DN600" },
      { label: "Malzeme", value: "CS, SS, Duplex, Inconel" },
      { label: "Sızdırmazlık", value: "FF/RF (ASME B16.5)" },
      { label: "Sertifika", value: "Talebe bağlı" },
    ],
    advantages: [
      "ANSI, DIN ve JIS üçlü standart uyumu",
      "DN15-DN600 geniş çap aralığında üretim",
      "Duplex ve süper alaşım işleme kabiliyeti",
      "Talebe bağlı malzeme sertifikası ve lot kaydı",
      "ASME B16.5 geometrisinde sızdırmazlık yüzeyleri",
      "Isıl işlem ve NDT muayene dahil",
    ],
    faq: [
      { question: "Flanş ölçüleri hangi boyut tablolarına göre işleniyor?", answer: "Flanş delik düzeni, conta yüzeyi ve çap ölçüleri ANSI B16.5, DIN EN 1092 ve JIS B2220 boyut tablolarına ya da müşterinin verdiği teknik resme göre işlenir." },
      { question: "Duplex çelik flanş üretebiliyor musunuz?", answer: "Evet, Duplex 2205 (F51), Super Duplex 2507 (F53) ve diğer korozyon dirençli alaşımlarda flanş ve bağlantı parçaları üretiyoruz." },
    ],
  },
  {
    slug: "iklim-teknolojileri",
    category: "endustriyel",
    categoryLabel: "Endüstriyel Sistemler",
    title: "İklim Teknolojileri",
    metaTitle: "HVAC & Soğutma Parça Üretimi | -40°C / +200°C | Helyum Test | Mas Technic",
    metaDescription: "HVAC, soğutma ve havalandırma sistemi bileşenleri. Kompresör parçası, valf, ısı eşanjör. -40°C/+200°C sıcaklık, 100 bar basınç, helyum sızdırmazlık testi.",
    description: "HVAC, soğutma ve havalandırma sistemleri için -40°C / +200°C sıcaklık aralığında çalışan hassas mekanik bileşenler.",
    content: [
      "HVAC, soğutma ve havalandırma sistemleri için kompresör parçaları (piston, valf plakası, silindir), genleşme valfi bileşenleri, ısı eşanjör parçaları (boru plakası, baffle, bağlantı) ve fan-blower komponentleri üretiyoruz.",
      "-40°C ile +200°C arasında çalışma koşullarına uygun malzeme seçimi ve üretim yapıyoruz. 100 bar'a kadar basınç dayanımı, helyum sızdırmazlık testi ile 1×10⁻⁶ mbar·L/s kaçak oranı kontrolü ve termal şok testleri ile kalite güvencesi sağlıyoruz.",
      "Al 6061 (ısı eşanjör), bakır (Cu-DHP, iletkenlik), SS 304/316 (korozyon direnci) ve özel alaşımlarla üretim yapıyoruz. Soğutucu akışkan uyumluluğu (R-134a, R-410A, R-744) ve gıda teması gereksinimleri, malzeme seçiminde şartnamenize göre değerlendirilir.",
    ],
    features: [
      "Kompresör Parçası — Piston, valf plakası, silindir",
      "Isı Eşanjör — Boru plakası, baffle, bağlantı",
      "Genleşme Valfi — Hassas akış kontrolü",
      "-40°C / +200°C — Geniş sıcaklık aralığı",
      "Helyum Sızdırmazlık — 1×10⁻⁶ mbar·L/s kaçak oranı",
      "Soğutucu Uyumlu — R-134a, R-410A, R-744",
    ],
    technicalSpecs: [
      { label: "Sıcaklık Aralığı", value: "-40°C / +200°C" },
      { label: "Maks. Basınç", value: "100 bar" },
      { label: "Sızdırmazlık", value: "Helyum 1×10⁻⁶ mbar·L/s" },
      { label: "Malzeme", value: "Al, Cu, SS 304/316" },
      { label: "Soğutucu", value: "R-134a, R-410A, R-744" },
      { label: "Soğutucu Sınıfı", value: "HFC / HFO / doğal" },
    ],
    advantages: [
      "-40°C / +200°C geniş sıcaklık aralığında dayanım",
      "Helyum sızdırmazlık testi ile kaçak doğrulaması",
      "Soğutucu ile uyumlu malzeme seçimi",
      "100 bar'a kadar basınç dayanımlı bileşenler",
      "Termal şok testi ile uzun ömür doğrulaması",
      "HVAC ve endüstriyel soğutma sektör deneyimi",
    ],
    faq: [
      { question: "Helyum sızdırmazlık testi yapıyor musunuz?", answer: "Evet, helyum sızdırmazlık testi ile 1×10⁻⁶ mbar·L/s kaçak oranı kontrolü yapıyoruz. Soğutma ve klima sistemleri için kritik olan bu test standarttır." },
      { question: "Hangi soğutucularla uyumlu parça üretiyorsunuz?", answer: "R-134a, R-410A, R-744 (CO₂) ve R-290 soğutucularla uyumlu malzeme ve yüzey işlemi ile üretim yapıyoruz." },
    ],
  },

  // ── Endüstriyel > Üretim Çözümleri ──
  {
    slug: "prototip-uretim",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Prototip Üretim",
    metaTitle: "Hızlı Prototip Üretimi | 3-5 İş Günü | CNC, 3D Baskı, Silikon Kalıp | Mas Technic",
    metaDescription: "3-5 iş günü prototip teslimatı. CNC, 3D baskı (FDM/SLA/SLS/DMLS) ve silikon kalıplama. Gerçek malzeme ile fonksiyonel prototip, seri üretim eşdeğer tolerans.",
    description: "CNC işleme, 3D baskı ve silikon kalıplama ile 3-5 iş günü içinde fonksiyonel prototip teslimatı. Gerçek malzeme ile seri üretim eşdeğer kalite.",
    content: [
      "Tasarım konseptlerinizi 3-5 iş günü içinde fiziksel ürünlere dönüştürüyoruz. CNC işleme ile gerçek malzemede (Al, SS, Ti, PEEK) seri üretim eşdeğer toleransta prototip, 3D baskı ile hızlı konsept doğrulama ve silikon kalıplama ile 10-50 adet çoklu prototip üretimi sunuyoruz.",
      "Fonksiyonel prototip ile parçanızı gerçek çalışma koşullarında test edebilirsiniz. DFM analizi ile tasarım iyileştirmesi ve seri üretime geçiş için kontrol planı hazırlığı sürecin parçasıdır. Tek adet sipariş kabul ediyoruz.",
      "Eklemeli imalat seçenekleri: FDM (ABS, PLA, naylon) biçim ve montaj denemeleri, SLA (reçine) ince detay ve yüzey, SLS (PA12) destek gerektirmeyen fonksiyonel parçalar ve DMLS ile metal fonksiyonel prototipler.",
    ],
    features: [
      "3-5 İş Günü Teslim — Hızlı prototip üretimi",
      "Gerçek Malzeme — Al, SS, Ti, PEEK ile üretim",
      "3D Baskı — FDM, SLA, SLS, DMLS teknolojileri",
      "Silikon Kalıplama — 10-50 adet çoklu prototip",
      "DFM Analizi — Tasarım optimizasyonu dahil",
      "3 İterasyonlu Revizyon Döngüsü — Tasarım revizyon desteği",
    ],
    technicalSpecs: [
      { label: "Teslim Süresi", value: "3-5 iş günü" },
      { label: "Min. Adet", value: "1 adet" },
      { label: "Tolerans", value: "Seri üretim eşdeğer" },
      { label: "Malzeme", value: "Gerçek malzeme" },
      { label: "3D Baskı", value: "FDM, SLA, SLS, DMLS" },
      { label: "İterasyon", value: "3 revizyon dahil" },
    ],
    advantages: [
      "3-5 iş günü hızlı teslimat",
      "Gerçek malzeme ile fonksiyonel test imkanı",
      "4 farklı 3D baskı teknolojisi (metal dahil)",
      "DFM analizi ile tasarım optimizasyonu",
      "3 iterasyonlu revizyon döngüsü ile risk azaltma",
      "Seri üretime sorunsuz geçiş desteği",
    ],
    faq: [
      { question: "En hızlı prototip ne kadar sürede hazır olur?", answer: "3D baskı ile 1-2 iş günü, CNC ile 3-5 iş günü. Ekspres hizmet ile aynı gün teslimat da mümkündür (ek ücret)." },
      { question: "Gerçek malzeme ile prototip yapabiliyor musunuz?", answer: "Evet, CNC ile Al 6061, SS 304, Ti6Al4V, PEEK gibi gerçek malzemelerde seri üretim eşdeğer toleransta prototip üretiyoruz." },
    ],
  },
  {
    slug: "kucuk-seri",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Küçük Seri Üretim",
    metaTitle: "Küçük Seri Üretim | 10-500 Adet | CNC & Hızlı Kalıp | Mas Technic",
    metaDescription: "10-500 adet küçük seri üretim. CNC işleme, alüminyum kalıp ve silikon kalıplama; hacim arttıkça düşen birim maliyet ve parti izlenebilirliği.",
    description: "10-500 adet aralığında küçük seri üretim. Prototipten küçük seriye geçiş, hacimle düşen birim maliyet ve parti bazlı izlenebilirlik.",
    content: [
      "Küçük seri üretim ihtiyaçlarınızı CNC işleme, hızlı alüminyum kalıp ve silikon kalıplama yöntemleri ile esnek ve maliyet etkin şekilde karşılıyoruz. 10-500 adet aralığında prototipten küçük seriye sorunsuz geçiş sağlıyoruz.",
      "Küçük seride birim maliyeti belirleyen asıl kalem kurulumdur: kurulum maliyeti adede bölündüğü için hacim arttıkça birim fiyat düşer. Kontrol planı ve parti bazlı izlenebilirlik standart olarak sağlanır; kademeli fiyatlandırma teklifle birlikte verilir.",
      "Pazar testi, pilot üretim ve pre-production aşamaları için ideal çözüm. Seri üretim geçiş planlaması dahil — kalıp yatırım analizi, otomasyon fizibilite ve maliyet projeksiyon raporu sunuyoruz.",
    ],
    features: [
      "10-500 Adet — Esnek küçük seri üretim kapasitesi",
      "Hacim İndirimi — Adet arttıkça birim maliyet düşer",
      "1-3 Hafta Teslim — Hızlı küçük seri üretim",
      "Kontrol Planı — küçük seride de standart olarak hazırlanır",
      "Pazar Testi — Pre-production ve pilot üretim desteği",
      "Seri Üretim Geçiş Planı — Ölçeklendirme danışmanlığı",
    ],
    technicalSpecs: [
      { label: "Adet Aralığı", value: "10-500 adet" },
      { label: "Teslim", value: "1-3 hafta" },
      { label: "Kalite", value: "Kontrol planı + ölçüm kaydı" },
      { label: "İndirim (50+)", value: "%15-25 hacim indirimi" },
      { label: "İndirim (200+)", value: "%25-35 hacim indirimi" },
      { label: "Yöntemler", value: "CNC, Al kalıp, silikon" },
    ],
    advantages: [
      "Hacim indirimi ile maliyet optimizasyonu",
      "1-3 hafta hızlı teslimat süreleri",
      "Kontrol planı ve ölçüm kaydı küçük seride de standarttır",
      "Prototipten küçük seriye sorunsuz geçiş",
      "Seri üretim geçiş planı ve maliyet projeksiyonu",
      "Lot bazlı izlenebilirlik ve kalite raporlaması",
    ],
    faq: [
      { question: "Küçük seride birim maliyet yüksek mi?", answer: "Birim maliyeti belirleyen asıl kalem kurulumdur ve adede bölünür; hacim arttıkça birim fiyat düşer. Kademeli fiyatlandırmayı ve seri üretime geçiş projeksiyonunu teklifle birlikte veriyoruz." },
      { question: "Küçük seriden seri üretime geçiş nasıl olur?", answer: "Kalıp yatırım analizi, otomasyon fizibilite ve maliyet projeksiyon raporu ile ölçeklendirme planlaması yapıyoruz." },
    ],
  },
  {
    slug: "seri-uretim",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Seri Üretim",
    metaTitle: "Seri Üretim | Tekrarlanabilir Kurulum ve Parti Kontrolü | Mas Technic",
    metaDescription: "Seri üretimde standart kurulum, kontrol planına bağlı ara kontrol ve parti izlenebilirliği. Teslimat programı kapasite planlamasıyla belirlenir.",
    description: "Seri üretimde asıl mesele hız değil tekrarlanabilirliktir: standart kurulum, kontrol planına bağlı ara kontrol ve parti bazlı izlenebilirlik.",
    content: [
      "Seri üretimde tezgâhın hızı değil kurulumun tekrarlanabilirliği belirleyicidir. Sabit referans yüzeyleri, standart kurulum prosedürü ve otomatik takım değiştirme, aynı parçanın partiler arasında aynı çıkmasını sağlar.",
      "Her partide, kontrol planında tanımlanan koteler ölçülür ve sonuçlar kayıt altına alınır. Takım aşınmasına duyarlı ölçüler ayrı bir ara kontrol adımıyla izlenir; sapma eğilimi görüldüğünde parça değil proses düzeltilir.",
      "Seri üretim müşterilerimize yıllık kontrat, JIT teslimat programı, Kanban stok yönetimi, haftalık kapasite raporlaması ve sürekli iyileştirme (Kaizen) programları sunuyoruz.",
    ],
    features: [
      "Standart Kurulum — sabit referans ve tekrarlanabilir bağlama",
      "Otomatik Takım Değiştirme — uzun partilerde kesintisiz işleme",
      "İlk Parça Onayı — seri, onay alınmadan başlamaz",
      "Parti Kaydı — döküm ve parti bazlı izlenebilirlik",
      "Ara Kontrol — kayma eğilimi olan koteler izlenir",
      "JIT Teslimat — Kanban entegreli stok yönetimi",
    ],
    technicalSpecs: [
      { label: "Kurulum", value: "Standart prosedür" },
      { label: "Onay", value: "İlk parça onayı" },
      { label: "Kontrol", value: "Kontrol planına göre" },
      { label: "Ara Kontrol", value: "Kayma eğilimli koteler" },
      { label: "Teslimat", value: "JIT / Kanban" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
    ],
    advantages: [
      "Sabit referans yüzeyleriyle tekrarlanabilir bağlama",
      "Standart kurulum prosedürü ile partiler arası tutarlılık",
      "Ölçüm sonuçları parti bazında kayıt altına alınır",
      "Kayma eğilimi olan koteler ara kontrolle izlenir",
      "JIT ve Kanban ile esnek teslimat",
      "Parti durumu üretim boyunca kayıt altında tutulur",
    ],
    faq: [
      { question: "Seri üretim için asgari adet var mı?", answer: "Sabit bir asgari adet uygulamıyoruz. Parti büyüklüğü, teslimat programı ve fiyatlandırma kapasite planlaması yapıldıktan sonra teklifle birlikte netleşir." },
      { question: "Teslimat programı nasıl belirleniyor?", answer: "Kapasite planlaması sonrasında parti büyüklüğü ve teslimat sıklığı birlikte kararlaştırılır; haftalık veya periyodik teslimat programları düzenlenebilir." },
    ],
  },
  {
    slug: "ozel-projeler",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Özel Mühendislik Projeleri",
    metaTitle: "Özel Mühendislik Projeleri | Anahtar Teslim | R&D | Reverse Engineering | Mas Technic",
    metaDescription: "Standart dışı özel mühendislik projeleri. Anahtar teslim çözümler, reverse engineering, R&D prototipleme, konseptten üretime tam süreç yönetimi.",
    description: "Standart çözümlerin yetersiz kaldığı özel mühendislik projeleri için anahtar teslim çözümler. Reverse engineering, R&D ve konseptten üretime tam süreç.",
    content: [
      "Standart çözümlerin yetersiz kaldığı özel mühendislik projeleri için anahtar teslim çözümler sunuyoruz. Reverse engineering (3D tarama → CAD → üretim), R&D prototipleme (konsept doğrulama → fonksiyonel test), özel tezgah ve fikstür tasarım-imalat ve çoklu disiplin projeleri (mekanik + elektronik + yazılım) yönetiyoruz.",
      "Proje yönetimi — konseptten üretime tüm süreçler tek çatı altında: fizibilite analizi, tasarım (SolidWorks, CATIA, NX), prototip üretimi, test ve doğrulama, pilot üretim ve seri üretim geçişi. Her proje özel bir proje mühendisi tarafından yönetilir.",
      "Ürün geliştirme danışmanlığı sürecin parçasıdır. Teknik verinin nasıl paylaşılacağı ve fikri mülkiyetin nasıl ele alınacağı proje başında yazılı olarak mutabık kalınır.",
    ],
    features: [
      "Anahtar Teslim — Konseptten üretime tam çözüm",
      "Reverse Engineering — 3D tarama, CAD modelleme, üretim",
      "R&D Prototipleme — Konsept doğrulama ve fonksiyonel test",
      "Özel Tezgah Tasarımı — Fikstür ve aparat imalatı",
      "Çoklu Disiplin — Mekanik + elektronik + yazılım",
      "Fikri Mülkiyet — koşullar proje başında yazılı olarak belirlenir",
    ],
    technicalSpecs: [
      { label: "Süreç", value: "Konseptten üretime" },
      { label: "3D Tarama", value: "0.02mm hassasiyet" },
      { label: "CAD", value: "SolidWorks, CATIA, NX" },
      { label: "Koşullar", value: "Proje başında yazılı" },
      { label: "Ar-Ge", value: "TÜBİTAK, KOSGEB desteği" },
      { label: "Proje Yönetimi", value: "Özel proje mühendisi" },
    ],
    advantages: [
      "Konseptten seri üretime anahtar teslim çözüm",
      "Reverse engineering ile yedek parça üretimi",
      "R&D prototipleme ve fonksiyonel test desteği",
      "Teknik veri ve fikri mülkiyet koşulları proje başında netleşir",
      "TÜBİTAK ve KOSGEB proje danışmanlığı",
      "Özel proje mühendisi ile tek muhatap",
    ],
    faq: [
      { question: "Reverse engineering yapabiliyor musunuz?", answer: "Evet, 3D tarama (0.02mm hassasiyet) ile mevcut parçanızı dijitalleştiriyor, CAD modeline dönüştürüyor ve üretiyoruz." },
      { question: "Teknik verim nasıl ele alınıyor?", answer: "Teknik verinin nasıl paylaşılacağı ve fikri mülkiyetin nasıl ele alınacağı proje başında yazılı olarak mutabık kalınır. İhtiyacınızı teklif aşamasında belirtin." },
    ],
  },

  // ── Endüstriyel > Enerji & Altyapı ──
  {
    slug: "yenilenebilir-enerji",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Yenilenebilir Enerji",
    metaTitle: "Yenilenebilir Enerji Parça Üretimi | Rüzgar & Güneş | IEC 61400 | Mas Technic",
    metaDescription: "Rüzgar türbini ve güneş enerjisi sistemi bileşenleri. Hot-dip galvaniz korozyon koruması, ağır yük parçaları. Hub, pitch sistemi, montaj aparatı üretimi.",
    description: "Rüzgar türbini, güneş enerjisi ve enerji depolama sistemleri için dış ortam koşullarına göre malzeme ve kaplama seçilerek üretilen bileşenler.",
    content: [
      "Rüzgar türbini bileşenleri (hub, nacelle, pitch sistemi, yaw sistemi, tower flanşı), güneş paneli montaj sistemleri (tracker, sabit montaj, rail, klamp) ve enerji depolama parçaları (batarya muhafazası, soğutma bileşenleri) üretiyoruz.",
      "Dış ortam koşullarına göre malzeme ve kaplama seçimi ile 25+ yıl dış ortam ömrü hedefliyoruz. Hot-dip galvaniz (ISO 1461 — 85µm min.), Dacromet kaplama ve SS 316L malzeme ile korozyon koruması sağlıyoruz. GGG-40, GGG-50 küresel grafitli dökme demir ve yüksek mukavemetli çeliklerle ağır yük bileşenleri üretiyoruz.",
      "Offshore ve onshore rüzgar enerjisi projeleri, utility-scale güneş enerjisi santralleri ve endüstriyel enerji depolama sistemleri için parça tedarik ediyoruz.",
    ],
    features: [
      "Rüzgar Türbini — Hub, pitch, yaw, tower flanşı",
      "Güneş Paneli Montaj — Tracker, rail, klamp",
      "Ağır Yük Bileşenleri — GGG-40/50 ve yüksek mukavemetli çelik",
      "Hot-Dip Galvaniz — ISO 1461, 85µm+ kaplama",
      "25+ Yıl Ömür — Dış ortam dayanım tasarımı",
      "Enerji Depolama — Batarya muhafaza, soğutma",
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "SS 316L, GGG-40, S355" },
      { label: "Kaplama", value: "Hot-dip galvaniz (85µm+)" },
      { label: "Dayanım", value: "25+ yıl dış ortam" },
      { label: "Kapsam", value: "Rüzgar, güneş, depolama" },
      { label: "Ağırlık", value: "500 kg'a kadar" },
      { label: "NDT", value: "UT, MT zorunlu" },
    ],
    advantages: [
      "Dış ortam koşullarına göre malzeme ve kaplama seçimi",
      "Hot-dip galvaniz ile 25+ yıl korozyon koruması",
      "500 kg'a kadar ağır parça işleme kapasitesi",
      "Offshore ve onshore proje deneyimi",
      "GGG-40/50 dökme demir işleme uzmanlığı",
      "NDT muayene dahil kalite güvence",
    ],
    faq: [
      { question: "Rüzgar türbini bileşenleri üretebiliyor musunuz?", answer: "Evet; hub, pitch sistemi, yaw mekanizması, tower flanşı ve nacelle iç bileşenleri üretiyoruz. Uygulanacak şartname ve kabul kriterleri iş bazında müşteriyle birlikte belirlenir." },
      { question: "Kaç yıl dış ortam dayanımı sağlıyorsunuz?", answer: "Hot-dip galvaniz (ISO 1461, 85µm+) ve uygun malzeme seçimi ile 25+ yıl dış ortam ömrü hedefliyoruz." },
    ],
  },
  {
    slug: "petrol-gaz",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Petrol & Gaz",
    metaTitle: "Petrol & Gaz Parça Üretimi | API 6A | 15000 PSI | NACE MR0175 | Mas Technic",
    metaDescription: "Petrol ve gaz sektörü bileşenleri. 15.000 PSI basınç, -46°C/+343°C sıcaklık. Inconel, Duplex ve Super Duplex çelik işleme.",
    description: "Petrol ve gaz sektörü bileşenleri. 15.000 PSI basınç, -46°C/+343°C sıcaklık aralığında çalışan kritik parçalar.",
    content: [
      "Petrol ve gaz sektörünün zorlu çalışma koşullarına uygun yüksek dayanımlı parçalar üretiyoruz. Wellhead ve Christmas tree bileşenleri, choke ve kontrol valfleri, boru bağlantı parçaları (API 6A flanş, hub), manifold ve BOP (Blowout Preventer) komponentleri imal ediyoruz.",
      "Wellhead, pipeline valf ve casing uygulamaları için 15.000 PSI (1034 bar) çalışma basıncı ve -46°C / +343°C sıcaklık aralığındaki parçaları üretiyoruz. Sour service uygulamalarında malzeme, ısıl işlem ve sertlik sınırları müşteri şartnamesine göre belirlenir ve kayıt altına alınır.",
      "Inconel 625/718, Duplex 2205, Super Duplex 2507, F22 (2.25Cr-1Mo) ve SS 316L gibi korozyon ve yüksek sıcaklık dayanımlı malzemelerle çalışıyoruz. Tahribatsız muayene (RT, UT, MPI, PMI) kapsamı, şartnameye göre kontrol planında tanımlanır.",
    ],
    features: [
      "Wellhead & Pipeline — Flanş, hub, valf gövdesi",
      "15.000 PSI — Ultra yüksek basınç dayanımı",
      "-46°C / +343°C — Ekstrem sıcaklık aralığı",
      "Sour Service — Şartnameye göre malzeme ve ısıl işlem",
      "Inconel & Duplex — Korozyon dirençli özel alaşımlar",
      "Tahribatsız Muayene — RT, UT, MPI, PMI; kapsam plana yazılır",
    ],
    technicalSpecs: [
      { label: "Kapsam", value: "Wellhead, pipeline, casing" },
      { label: "Basınç", value: "15.000 PSI (1034 bar)" },
      { label: "Sıcaklık", value: "-46°C / +343°C" },
      { label: "Sour Service", value: "Şartnameye göre" },
      { label: "Malzeme", value: "Inconel, Duplex, F22" },
      { label: "NDT", value: "RT, UT, MPI, PMI" },
    ],
    advantages: [
      "Wellhead ve pipeline bileşeni üretim kapasitesi",
      "15.000 PSI ultra yüksek basınç kapasitesi",
      "Sour service için şartnameye göre malzeme seçimi",
      "Inconel ve Super Duplex işleme uzmanlığı",
      "Tahribatsız muayene kapsamı kontrol planında tanımlanır",
      "Offshore ve onshore proje deneyimi",
    ],
    faq: [
      { question: "Petrol ve gaz bileşenlerinde hangi kalite kayıtları veriliyor?", answer: "Malzeme sertifikası, ısıl işlem kaydı ve tahribatsız muayene raporları, kapsamı kontrol planında tanımlandığı şekilde teslimat dosyasına eklenir." },
      { question: "Sour service uyumlu parça üretebiliyor musunuz?", answer: "Evet. Sour service uygulamalarında malzeme, ısıl işlem ve sertlik sınırları müşteri şartnamesine göre belirlenir ve kayıt altına alınır." },
    ],
  },
  {
    slug: "guc-dagitim-sistemleri",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Güç Dağıtım Sistemleri",
    metaTitle: "Güç Dağıtım Parça Üretimi | IEC 62271 | 36kV | IACS %99+ | Mas Technic",
    metaDescription: "Elektrik dağıtım ve güç sistemi bileşenleri. 36kV'a kadar, IACS %99+ iletkenlik. Bakır ve alüminyum bara, kontak parçası, izolator.",
    description: "Elektrik dağıtım panoları, transformatör bileşenleri ve güç dağıtım sistemi parçaları. 36kV gerilim seviyesine kadar.",
    content: [
      "Elektrik dağıtım sistemi bileşenleri üretiyoruz: bakır ve alüminyum baralar (iletken, IACS %99+), kontak parçaları (gümüş kaplama, düşük direnç), izolator montaj elemanları ve pano iç bileşenleri. 36kV gerilim seviyesine kadar çalışan parçalar üretiyoruz.",
      "OFE bakır (C10100 — IACS %101), ETP bakır (C11000 — IACS %99.9) ve elektrik kalite alüminyum (1050/1070 — IACS %61) ile yüksek iletkenlik gerektiren parçalar üretiyoruz. Gümüş kaplama ile kontak direncini minimize ediyor, nikel altlık ile difüzyon bariyeri oluşturuyoruz.",
      "Termal simülasyon ile ısı dağılımı optimizasyonu, kısa devre akım dayanımı hesaplama ve ark direnci testleri ile güvenlik doğrulaması sağlıyoruz.",
    ],
    features: [
      "Pano İç Bileşenleri — İzolator montaj ve bağlantı elemanları",
      "36kV Gerilim — Orta gerilim seviyesine kadar",
      "IACS %99+ İletkenlik — OFE ve ETP bakır",
      "Gümüş Kaplama — Düşük kontak direnci",
      "Bara Üretimi — Bakır ve alüminyum iletken",
      "Termal Optimizasyon — Isı dağılımı simülasyonu",
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "Cu (OFE, ETP), Al 1050" },
      { label: "İletkenlik", value: "IACS %99+" },
      { label: "Gerilim", value: "36kV'a kadar" },
      { label: "Kapsam", value: "Bara, kontak, izolator montaj" },
      { label: "Kaplama", value: "Ag (gümüş), Ni altlık" },
      { label: "Test", value: "Ark direnci, kısa devre" },
    ],
    advantages: [
      "36kV'a kadar orta gerilim bileşeni üretimi",
      "IACS %99+ iletkenlikli bakır işleme",
      "Gümüş kaplama ile minimum kontak direnci",
      "36kV orta gerilim seviyesine kadar parça",
      "Termal simülasyon ile optimizasyon",
      "Kısa devre ve ark direnci test desteği",
    ],
    faq: [
      { question: "OFE bakır işleyebiliyor musunuz?", answer: "Evet, OFE bakır (C10100, IACS %101) ve ETP bakır (C11000, IACS %99.9) işleme kabiliyetimiz bulunmaktadır." },
      { question: "Gümüş kaplama yapıyor musunuz?", answer: "Evet, kontak parçaları için gümüş kaplama (nikel altlık üzerine) uyguluyoruz. Kaplama kalınlığı ve yapışma testi standart olarak kontrol edilir." },
    ],
  },
  {
    slug: "madencilik-ekipmanlari",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Madencilik Ekipmanları",
    metaTitle: "Madencilik Ekipman Parçaları | Hardox 600 | 55-65 HRC | 500kg | Mas Technic",
    metaDescription: "Madencilik makineleri için Hardox 600, manganez çeliği ile aşınmaya dayanıklı parça üretimi. 55-65 HRC sertlik, 500kg'a kadar ağırlık, indüksiyon sertleştirme.",
    description: "Madencilik sektörünün ağır çalışma koşullarına uygun, Hardox ve manganez çeliği ile aşınmaya dayanıklı bileşenler.",
    content: [
      "Madencilik sektörünün ağır çalışma koşullarına uygun, aşınmaya ve darbeye dayanıklı parçalar üretiyoruz. Kırıcı bileşenleri (çene, çekiç, astar plakası), konveyör parçaları (rulo, tambur, kayar yatak), delici ekipman komponentleri (uç, gövde, adaptör) ve eleme-sınıflandırma bileşenleri imal ediyoruz.",
      "Hardox 400/500/600 (aşınma çeliği), manganez çeliği (Mn13 — darbe ile sertleşen), beyaz dökme demir (krom karbür — aşırı aşınma) ve 42CrMo4 (QT — genel ağır iş) malzemeleri ile üretim yapıyoruz. 55-65 HRC yüzey sertliği, indüksiyon sertleştirme ve karbürizasyon ile elde edilmektedir.",
      "500 kg'a kadar parça ağırlığı, 1500mm'ye kadar parça boyutu ve CNC + konvansiyonel tezgah hibrit işleme kapasitesi ile büyük ve ağır madencilik parçaları üretiyoruz.",
    ],
    features: [
      "Kırıcı Bileşeni — Çene, çekiç, astar plakası",
      "Konveyör Parçası — Rulo, tambur, kayar yatak",
      "Hardox 400/500/600 — Aşınma çeliği uzmanlığı",
      "55-65 HRC Sertlik — İndüksiyon sertleştirme",
      "500 kg Ağırlık — Büyük parça işleme kapasitesi",
      "Manganez Çeliği — Darbe ile sertleşen Mn13",
    ],
    technicalSpecs: [
      { label: "Sertlik", value: "55-65 HRC" },
      { label: "Malzeme", value: "Hardox, Mn13, 42CrMo4" },
      { label: "Maks. Ağırlık", value: "500 kg" },
      { label: "Maks. Boyut", value: "1500mm" },
      { label: "Isıl İşlem", value: "İndüksiyon, karbürizasyon" },
      { label: "NDT", value: "UT, MT zorunlu" },
    ],
    advantages: [
      "Hardox 400/500/600 aşınma çeliği uzmanlığı",
      "55-65 HRC yüzey sertliği ile uzun ömür",
      "500 kg'a kadar ağır parça işleme kapasitesi",
      "Manganez çeliği ile darbe direnci",
      "İndüksiyon sertleştirme ve karbürizasyon",
      "UT ve MT ile NDT muayene dahil",
    ],
    faq: [
      { question: "Hardox işleyebiliyor musunuz?", answer: "Evet, Hardox 400, 500 ve 600 serisi aşınma çeliklerini CNC ile işleyebiliyoruz. Özel takım ve ilerleme parametreleri ile optimal sonuç elde ediyoruz." },
      { question: "500 kg parça işleyebiliyor musunuz?", answer: "Evet, 500 kg'a kadar ağırlık ve 1500mm'ye kadar boyutta parça işleme kapasitemiz bulunmaktadır. Vinçli yükleme ve özel bağlama düzenleri kullanıyoruz." },
    ],
  },
];

export const getPageBySlug = (slug: string): ServicePageData | undefined =>
  servicePages.find((p) => p.slug === slug);

export const getPagesByCategory = (category: string): ServicePageData[] =>
  servicePages.filter((p) => p.category === category);
