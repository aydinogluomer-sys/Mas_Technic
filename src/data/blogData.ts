import blog5eksen from "@/assets/blog-5eksen.jpg";
import blogMalzeme from "@/assets/blog-malzeme.jpg";
import blogDfm from "@/assets/blog-dfm.jpg";
import cncWorkshop from "@/assets/cnc-workshop.jpg";
import qualityControl from "@/assets/quality-control.jpg";
import serviceCncFreze from "@/assets/service-cnc-freze.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured: boolean;
  views: number;
  fullContent: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "5-eksen-cnc-isleme-avantajlari",
    title: "5 Eksen CNC İşleme Avantajları",
    excerpt:
      "Karmaşık geometrilerde tek seferde işleme imkanı sunan 5 eksenli CNC teknolojisi, yüzey kalitesini artırırken setup süresini kısaltıyor.",
    date: "15 Ocak 2024",
    readTime: "8 dk okuma",
    category: "Teknik",
    image: blog5eksen,
    featured: true,
    views: 3420,
    fullContent: [
      "5 eksenli CNC işleme, geleneksel 3 eksenli işlemeye kıyasla önemli avantajlar sunar. X, Y, Z doğrusal eksenlerin yanı sıra A ve B (veya C) döner eksenler sayesinde karmaşık geometrilere sahip parçalar tek kurulumda tamamlanabilir.",
      "Setup süresinin azalması, 5 eksenli işlemenin en önemli avantajlarından biridir. Geleneksel yöntemlerde bir parçanın farklı yüzeylerini işlemek için birden fazla kurulum gerekir. 5 eksenli tezgahlarda ise parça tek seferde bağlanır ve tüm yüzeyler erişilebilir hale gelir. Bu durum setup süresini %60-80 oranında azaltabilir.",
      "Yüzey kalitesi açısından da 5 eksenli işleme büyük avantaj sağlar. Takım, parça yüzeyine her zaman optimum açıyla yaklaşabildiği için daha düzgün ve kaliteli yüzeyler elde edilir. Özellikle havacılık ve medikal sektörlerinde gereken Ra 0.4µm altı yüzey pürüzlülüğü değerlerine kolayca ulaşılır.",
      "Takım ömrü de 5 eksenli işlemede artış gösterir. Takımın parçaya doğru açıyla temas etmesi, kesme kuvvetlerinin dengelenmesi ve titreşimin azalması sayesinde takım aşınması %30-40 oranında düşer. Bu hem maliyet tasarrufu hem de daha tutarlı kalite anlamına gelir.",
      "DMG MORI DMU 65 monoBLOCK gibi modern 5 eksenli tezgahlar, 18.000 RPM mil hızı ve 60 adet takım kapasitesiyle kesintisiz üretim imkânı sunar. Otomatik palet değiştirme sistemleri ile 24 saat insansız çalışma mümkündür.",
      "Sonuç olarak, 5 eksenli CNC işleme; daha kısa setup süreleri, daha yüksek yüzey kalitesi, daha uzun takım ömrü ve karmaşık geometrilerin tek seferde işlenebilmesi gibi avantajlarıyla modern üretimin vazgeçilmez teknolojisidir.",
    ],
  },
  {
    slug: "havacilik-parcalarinda-malzeme-secimi",
    title: "Havacılık Parçalarında Malzeme Seçimi",
    excerpt:
      "Alüminyum 7075 vs Titanyum: Mukavemet, ağırlık ve maliyet karşılaştırması.",
    date: "8 Ocak 2024",
    readTime: "6 dk okuma",
    category: "Malzeme",
    image: blogMalzeme,
    featured: true,
    views: 2890,
    fullContent: [
      "Havacılık sektöründe malzeme seçimi, parçanın performansını doğrudan etkileyen kritik bir karardır. En yaygın kullanılan iki malzeme olan Alüminyum 7075-T6 ve Titanyum Ti6Al4V (Grade 5) arasında doğru seçim yapmak, ağırlık, mukavemet ve maliyet dengesi açısından büyük önem taşır.",
      "Alüminyum 7075-T6, 572 MPa çekme mukavemeti ve 2.81 g/cm³ yoğunluğu ile havacılıkta en çok tercih edilen alüminyum alaşımıdır. Mükemmel işlenebilirliği sayesinde CNC işleme maliyetleri düşüktür. Gövde panelleri, kanat nervürleri ve iç yapısal elemanlarda yaygın olarak kullanılır.",
      "Titanyum Ti6Al4V ise 950 MPa çekme mukavemeti ve 4.43 g/cm³ yoğunluğu ile çeliğe yakın mukavemet sunarken %45 daha hafiftir. Yüksek sıcaklık dayanımı (350°C'ye kadar) ve korozyon direnci ile motor bileşenleri, iniş takımı parçaları ve kritik yapısal elemanlarda tercih edilir.",
      "Maliyet açısından bakıldığında, alüminyum 7075 hammadde maliyeti titanyuma göre yaklaşık 5 kat daha düşüktür. İşleme maliyetleri de alüminyumda %60 daha azdır çünkü titanyumun düşük ısıl iletkenliği ve kimyasal reaktivitesi nedeniyle özel takımlar ve düşük kesme hızları gerekir.",
      "Doğru malzeme seçimi için parçanın maruz kalacağı yükler, çalışma sıcaklığı, korozyon ortamı ve maliyet bütçesi birlikte değerlendirilmelidir. Mas Technic olarak her iki malzeme grubunda da uzman ekibimizle en uygun çözümü sunuyoruz.",
    ],
  },
  {
    slug: "dfm-tasarimdan-uretime-gecis",
    title: "DFM: Tasarımdan Üretime Geçiş",
    excerpt:
      "Design for Manufacturing prensipleri ile maliyetleri düşürün ve kaliteyi artırın.",
    date: "2 Ocak 2024",
    readTime: "10 dk okuma",
    category: "Mühendislik",
    image: blogDfm,
    featured: false,
    views: 1560,
    fullContent: [
      "Design for Manufacturing (DFM), ürün tasarımının üretim süreciyle uyumlu hale getirilmesi prensiplerini kapsar. Doğru uygulandığında üretim maliyetlerini %20-50 oranında düşürebilir.",
      "DFM'in temel prensipleri arasında gereksiz karmaşıklıktan kaçınma, standart toleransların kullanımı, malzeme seçiminin optimize edilmesi ve montaj kolaylığı yer alır. Örneğin, ±0.01mm tolerans yerine ±0.05mm yeterli ise bu tercih işleme süresini ve maliyetini önemli ölçüde azaltır.",
      "İç köşe radyüsleri, DFM'de sıkça karşılaşılan bir konudur. CNC frezeleme ile iç köşeler her zaman belirli bir radyüse sahip olur (takım çapına bağlı). Tasarımda mümkün olduğunca büyük iç köşe radyüsü tercih etmek, daha büyük ve güçlü takımlarla çalışılmasını sağlayarak hem işleme süresini kısaltır hem de yüzey kalitesini artırır.",
      "Duvar kalınlıkları da DFM açısından kritiktir. Çok ince duvarlar (alüminyumda <0.5mm, çelikte <1mm) işleme sırasında titreşim ve deformasyona neden olabilir. Minimum duvar kalınlıklarına uyulması, fire oranını düşürür ve parça kalitesini artırır.",
      "Mas Technic olarak her projede ücretsiz DFM analizi sunuyoruz. CAD dosyanızı aldıktan sonra mühendislik ekibimiz tasarımınızı inceleyerek maliyet ve kalite optimizasyonu önerileri sunar.",
    ],
  },
  {
    slug: "cnc-torna-frezeleme-farki",
    title: "CNC Torna vs Frezeleme: Hangisini Seçmeli?",
    excerpt:
      "Parça geometrisine göre doğru işleme yöntemini seçmek maliyet ve kalite açısından kritik önem taşır.",
    date: "25 Aralık 2023",
    readTime: "7 dk okuma",
    category: "Teknik",
    image: serviceCncFreze,
    featured: false,
    views: 2100,
    fullContent: [
      "CNC torna ve CNC freze, talaşlı imalatın iki temel işleme yöntemidir. Her birinin avantajları ve ideal kullanım alanları farklıdır.",
      "CNC tornalama, silindirik ve döner simetrik parçalar için idealdir. Mil, somun, burç, piston ve gövde gibi parçalar tornada çok daha verimli ve hassas şekilde işlenir. İş parçası dönerken sabit takım malzeme kaldırır.",
      "CNC frezeleme ise düzlemsel yüzeyler, cep işleme, delik delme ve karmaşık 3D geometriler için tercih edilir. Gövde, plaka, braket ve kalıp gibi parçalar frezede işlenir. Takım dönerken iş parçası sabit kalır veya kontrollü hareket eder.",
      "Doğru yöntemi seçmek için parçanın geometrisini analiz etmek gerekir. Genel kural olarak: parçanın ana şekli silindirik ise torna, prizmatik ise freze tercih edilir. Ancak modern CNC torna-freze kombine tezgahlar, her iki işlemi tek kurulumda yapabilir.",
      "Mas Technic'te hem 5 eksenli CNC freze hem de C/Y eksenli CNC torna tezgahlarımızla her iki yöntemi de yüksek hassasiyetle uyguluyoruz. Mühendislik ekibimiz, parçanızın geometrisine göre en uygun işleme stratejisini belirler.",
    ],
  },
  {
    slug: "kalite-kontrol-cmm-olcum",
    title: "Kalite Kontrol: CMM Ölçüm Süreçleri",
    excerpt:
      "Koordinat ölçüm makineleri (CMM) ile hassas boyutsal doğrulama süreçleri.",
    date: "18 Aralık 2023",
    readTime: "9 dk okuma",
    category: "Kalite",
    image: qualityControl,
    featured: false,
    views: 1870,
    fullContent: [
      "Koordinat Ölçüm Makineleri (CMM), CNC işlenmiş parçaların boyutsal doğruluğunu mikron seviyesinde kontrol eden hassas ölçüm cihazlarıdır. Modern üretimde kalite güvencesinin temelini oluşturur.",
      "CMM ölçüm süreci, parçanın 3D koordinat sisteminde konumlandırılmasıyla başlar. Dokunmatik prob veya optik tarama ile yüzeyler taranarak gerçek boyutlar belirlenir. Bu veriler CAD modeli ile karşılaştırılarak sapma raporları oluşturulur.",
      "FAIR (First Article Inspection Report), yeni bir parçanın ilk üretiminde tüm kritik boyutların doğrulanmasını sağlar. AS9102 standardına uygun FAIR raporu, havacılık ve savunma sektörlerinde zorunludur.",
      "SPC (Statistical Process Control) uygulamaları ile seri üretim sürecinde istatistiksel kontrol sağlanır. Cp ve Cpk değerleri hesaplanarak proses yeterliliği izlenir. Cp>1.33 ve Cpk>1.33 değerleri, prosesin yeterli olduğunu gösterir.",
      "Mas Technic olarak Zeiss CONTURA G2 CMM cihazımız ile 0.001mm hassasiyetinde ölçüm yapıyor, her parça için detaylı ölçüm raporu sunuyoruz.",
    ],
  },
  {
    slug: "endustriyel-yuzey-islemleri-rehberi",
    title: "Endüstriyel Yüzey İşlemleri Rehberi",
    excerpt:
      "Anodizasyon, pasivasyon, kaplama ve boyama: Hangi yüzey işlemi ne zaman tercih edilmeli?",
    date: "10 Aralık 2023",
    readTime: "12 dk okuma",
    category: "Rehber",
    image: cncWorkshop,
    featured: false,
    views: 2340,
    fullContent: [
      "Yüzey işlemleri, CNC işlenmiş parçaların korozyon direncini, aşınma dayanımını ve estetik görünümünü iyileştiren kritik proseslerdir. Doğru yüzey işlemi seçimi, parçanın ömrünü ve performansını doğrudan etkiler.",
      "Anodizasyon, alüminyum parçalar için en yaygın yüzey işlemidir. Elektrokimyasal süreçle oluşturulan alüminyum oksit tabakası, hem korozyon koruması hem de dekoratif renklendirme imkânı sunar. Tip II (10-25µm) genel amaçlı, Tip III sert anodizasyon (25-100µm) yüksek aşınma direnci gereken uygulamalar için tercih edilir.",
      "Pasivasyon, paslanmaz çelik parçalar için uygulanan kimyasal işlemdir. Nitrik asit veya sitrik asit banyosunda yüzeydeki serbest demir giderilir ve krom oksit tabakası güçlendirilir. ASTM A967 standardına uygun pasivasyon, korozyon direncini önemli ölçüde artırır.",
      "Toz boya, geniş renk yelpazesi ve dayanıklılık sunan çevre dostu bir kaplama yöntemidir. 60-120µm kalınlıkta uygulanan toz boya, 1000+ saat tuz testi dayanımı sağlar. RAL kataloğundaki tüm renkler mevcuttur.",
      "Elektropolish, paslanmaz çelik yüzeylerin kimyasal olarak parlatılmasıdır. Ra 0.2µm altı yüzey pürüzlülüğü elde edilebilir. Medikal ve gıda sektörlerinde hijyenik yüzey gereksinimleri için idealdir.",
      "Mas Technic olarak tüm yüzey işlemlerini tek çatı altında sunuyor, projenize en uygun çözümü mühendislik ekibimizle belirliyoruz.",
    ],
  },
];

export const blogCategories = ["Tümü", "Teknik", "Malzeme", "Mühendislik", "Kalite", "Rehber"];
