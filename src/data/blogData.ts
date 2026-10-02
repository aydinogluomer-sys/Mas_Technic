import blog5eksen from "@/assets/blog-5eksen.webp";
import blogMalzeme from "@/assets/blog-malzeme.webp";
import blogDfm from "@/assets/blog-dfm.webp";
import heroYuzeyIslemleri from "@/assets/hero-yuzey-islemleri.webp";
import qualityControl from "@/assets/quality-control.webp";
import heroCncFrezeleme from "@/assets/hero-cnc-frezeleme.webp";
import { CMM_COVERAGE, MINIMUM_TOLERANCE, MINIMUM_TOLERANCE_COMPACT } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   TEKNİK GÜNLÜK — THE ARTICLE CORPUS

   ── WHAT CHANGED STRUCTURALLY (Phase 08) ─────────────────────────────────
   `fullContent: string[]` was a flat run of five or six paragraphs. An article
   with no internal structure cannot have a table of contents, cannot be
   deep-linked to the part that answers your question, and reads as a wall on a
   phone — which is what these were. Each post is a `sections[]` of anchored,
   titled runs now. The anchors are `id`, never `slug`: `slug` is the key two
   route-inventory specs extract from this file with
   `/\bslug\s*:\s*["']([^"']+)["']/g`, and a second `slug:` key anywhere in
   here would silently inflate the blog route list they check.

   Two fields are new because the article template needs them and inventing
   them at render time would be worse: `imageAlt` (the photograph described for
   somebody who cannot see it — the old template used the TITLE as the alt
   text, which describes the article and not the picture) and `imageCaption`
   (the plate caption under the frame).

   ── WHAT CHANGED FACTUALLY (IMPLEMENTATION.md §13) ───────────────────────
   Six quantified claims were removed. None of them was about a part MAS made,
   which is exactly why they survived Phase 06's sweep — they read as industry
   background. They are still unsourced numbers printed as fact on a
   manufacturer's own site:

     · "setup süresini %60-80 oranında azaltabilir"
     · "takım aşınması %30-40 oranında düşer"
     · "üretim maliyetlerini %20-50 oranında düşürebilir"
     · "hammadde maliyeti … yaklaşık 5 kat daha düşüktür"
     · "işleme maliyetleri de alüminyumda %60 daha azdır"
     · "1000+ saat tuz testi dayanımı sağlar"

   In every case the MECHANISM is what a reader actually needs and is what the
   sentence now carries: why a second setup costs accuracy, why titanium is
   slow to cut, why a coating's salt-spray rating depends on the specification
   it was applied to. A mechanism can be checked by a reader who knows the
   subject; a bare percentage cannot be checked by anybody.

   Three commitments went the same way. "Mas Technic olarak her projede
   ücretsiz DFM analizi sunuyoruz" and "Ra 0.4µm altı yüzey pürüzlülüğü
   değerlerine kolayca ulaşılır" are promises, and §D authorises capability
   figures rather than promises; "hem 5 eksenli CNC freze hem de C/Y eksenli
   CNC torna tezgahlarımızla" describes an equipment inventory, which §0
   `DO_NOT_PUBLISH_MACHINE_COUNT_BY_DEFAULT` keeps private.

   Every figure that stayed is either a published material property
   (572 MPa / 2.81 g/cm³ / 950 MPa / 4.43 g/cm³), a published standard's own
   number (MIL-A-8625 Tip II/III film thickness, ASTM A967), or comes from
   `@/content/claims` — so an article cannot contradict the rest of the site.
   ══════════════════════════════════════════════════════════════════════════ */

export interface BlogSection {
  /** Anchor id. NEVER named `slug` — see the header note. */
  id: string;
  heading: string;
  paragraphs: string[];
  /**
   * An optional data table, rendered through `ShellSpecTable`.
   *
   * A comparison is a table. Writing "7075 is 572 MPa and titanium is 950 MPa"
   * across two paragraphs asks the reader to hold four numbers in their head
   * and align them; a table aligns them on the page, which is what a table is
   * for. Only rows whose values are published material properties belong here.
   */
  table?: {
    caption: string;
    note?: string;
    headers: string[];
    rows: string[][];
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  /** What the photograph shows. Not the article's title. */
  imageAlt: string;
  /** The plate caption printed under the frame. */
  imageCaption: string;
  featured: boolean;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "5-eksen-cnc-isleme-avantajlari",
    title: "5 Eksen CNC İşleme Avantajları",
    excerpt:
      "Beş eksenin asıl kazancı hız değil, kurulum sayısıdır: her yeni bağlama yeni bir referans hatası kaynağıdır.",
    date: "15 Ocak 2024",
    readTime: "8 dk okuma",
    category: "Teknik",
    image: blog5eksen,
    imageAlt: "İş milindeki kesici takım, soğutma sıvısı altında parlak metal bir gövdenin eğik yüzeyini işlerken",
    imageCaption: "Tek bağlamada birden fazla yüzeye erişen kesici takım",
    featured: true,
    sections: [
      {
        id: "kinematik",
        heading: "Beş eksen ne demek",
        paragraphs: [
          "Beş eksenli işleme, X, Y ve Z doğrusal eksenlerine iki döner eksenin (A ve B, ya da A ve C) eklenmesidir. Kazanç, takımın parçaya yalnızca yukarıdan değil, herhangi bir açıdan yaklaşabilmesidir.",
          "Pratikte bu iki farklı çalışma biçimine karşılık gelir: döner eksenlerin konumlandırıp sabitlendiği 3+2 işleme, ve beş eksenin aynı anda hareket ettiği sürekli beş eksen. Karmaşık yüzeyler ikincisini gerektirir; çok yüzeyli prizmatik parçaların çoğu için birincisi yeterlidir.",
        ],
      },
      {
        id: "kurulum",
        heading: "Asıl kazanç: kurulum sayısı",
        paragraphs: [
          "Bir parçayı ikinci kez bağlamak, yalnızca zaman kaybı değildir. Her yeni kurulum yeni bir referans yüzeyi, yeni bir sıfırlama ve dolayısıyla yeni bir hata kaynağı demektir; ilk kurulumda işlenen bir kotenin ikinci kurulumda işlenen bir kotele ilişkisi, iki kurulumun hizalanma doğruluğu kadardır.",
          "Beş eksenli bir kurulumda parça bir kez bağlanır ve erişilebilir yüzeylerin tümü aynı referans sisteminden işlenir. Geometrik toleransların — eş eksenlilik, diklik, konum — tek bir kurulum içinde tutulabilmesi, beş eksenin ölçülebilir tek büyük farkıdır.",
        ],
      },
      {
        id: "takim-acisi",
        heading: "Takım açısı ve yüzey",
        paragraphs: [
          "Küresel uçlu bir takım, ekseni yüzeye dik olduğunda merkezinde sıfır kesme hızıyla çalışır: orada malzeme kesilmez, ezilir. Döner eksenler takımı eğerek bu ölü noktayı yüzeyden uzaklaştırır ve kesme etkin çapta gerçekleşir.",
          "Sonuç, aynı ilerleme hızında daha düzgün bir yüzey ve daha az sonradan işlem gereğidir. Ulaşılabilecek yüzey pürüzlülüğü değeri malzemeye, takıma, tutuşa ve talep edilen toleransa göre değişir; bu yüzden hedef Ra değeri teknik resimde belirtilmeli ve teklif aşamasında birlikte doğrulanmalıdır.",
        ],
      },
      {
        id: "takim-omru",
        heading: "Takım ömrü ve titreşim",
        paragraphs: [
          "Takım açısının kontrol edilebilmesi, kesme kuvvetinin yönünün de kontrol edilebilmesi anlamına gelir. Kuvvetin takımın eksenine daha yakın bir doğrultuda tutulması sapmayı azaltır; sapmanın azalması titreşimi, titreşimin azalması da kesici ağızdaki darbeli yüklenmeyi azaltır.",
          "Ayrıca beş eksen kısa takımla derin bölgelere ulaşmayı mümkün kılar. Aynı cebi uzun bir takımla işlemek yerine parçayı eğip kısa takımla işlemek, takım sapmasını doğrudan düşürür — çünkü sapma, takım uzamasının küpüyle artar.",
        ],
      },
      {
        id: "ne-zaman-gerekmez",
        heading: "Ne zaman gerekmez",
        paragraphs: [
          "Beş eksen her parça için doğru cevap değildir. Tek yönden erişilebilen, düzlemsel bir parçada beş eksen ek bir doğruluk getirmez; getirdiği şey daha uzun bir programlama süresi ve daha pahalı bir kurulumdur.",
          "Karar ölçütü şudur: parçanın kritik geometrik toleransları farklı yüzeyler arasında mı tanımlı? Cevap evetse, o toleransların tek kurulumda tutulması beş eksenin bedelini karşılar. Cevap hayırsa, üç eksen genellikle daha ekonomik ve aynı ölçüde doğrudur.",
        ],
      },
    ],
  },
  {
    slug: "havacilik-parcalarinda-malzeme-secimi",
    title: "Havacılık Parçalarında Malzeme Seçimi",
    excerpt:
      "Alüminyum 7075-T6 ve Ti-6Al-4V arasındaki seçim bir mukavemet karşılaştırması değil, bir çalışma sıcaklığı ve maliyet kararıdır.",
    date: "8 Ocak 2024",
    readTime: "6 dk okuma",
    category: "Malzeme",
    image: blogMalzeme,
    imageAlt: "Siyah zemin üzerinde yan yana dört silindirik metal numune; uç yüzleri kesilmiş, taşlanmış ve fırçalanmış",
    imageCaption: "Aynı geometrinin iki alaşımda işlenmiş numuneleri",
    featured: true,
    sections: [
      {
        id: "iki-aday",
        heading: "İki aday",
        paragraphs: [
          "Havacılık yapısal parçalarında karar çoğu zaman iki malzeme arasında verilir: Alüminyum 7075-T6 ve Titanyum Ti-6Al-4V (Grade 5). İkisi de yerleşik, ikisi de kolay temin edilir ve ikisinin de tedarik zinciri belgelendirilebilir.",
          "Seçim mukavemet/ağırlık oranını karşılaştırmakla bitmez, çünkü iki malzeme farklı sınırlarda başarısız olur: biri sıcaklıkta, diğeri maliyette.",
        ],
      },
      {
        id: "al-7075",
        heading: "Alüminyum 7075-T6",
        paragraphs: [
          "7075-T6, yaklaşık 572 MPa çekme mukavemeti ve 2,81 g/cm³ yoğunluğu ile alüminyum alaşımlarının üst sınırındadır. Talaş kaldırma davranışı iyidir: yüksek kesme hızlarına izin verir, ısıyı talaşla birlikte uzaklaştırır ve takım ömrünü zorlamaz.",
          "Sınırı sıcaklık ve korozyondur. T6 temperi yüksek sıcaklıkta özelliğini kaybeder ve alaşım gerilmeli korozyon çatlamasına duyarlıdır; bu yüzden yüzey işlemi (tipik olarak anodizasyon) bir tercih değil, tasarımın parçasıdır.",
        ],
      },
      {
        id: "ti-6al-4v",
        heading: "Ti-6Al-4V (Grade 5)",
        paragraphs: [
          "Ti-6Al-4V, yaklaşık 950 MPa çekme mukavemeti ve 4,43 g/cm³ yoğunluğu ile çeliğe yakın mukavemeti belirgin biçimde daha düşük bir yoğunlukla sunar. Yaklaşık 350 °C'ye kadar özelliklerini korur ve doğal oksit tabakası sayesinde ek bir kaplama olmadan korozyona dayanır.",
          "Bedeli işlenebilirliktir. Titanyum ısıyı kötü ileten bir malzemedir: kesme bölgesinde açığa çıkan ısının büyük bölümü talaşla değil, kesici ağızla uzaklaşır. Buna kimyasal reaktivitesi eklenince kesme hızları düşürülmek, takım geometrisi ve soğutma stratejisi buna göre seçilmek zorunda kalır.",
        ],
      },
      {
        id: "karsilastirma",
        heading: "Yan yana",
        paragraphs: [
          "Aşağıdaki değerler malzeme standartlarının yayımlanmış tipik değerleridir; bir parti sertifikasının yerini tutmaz. Bir işte kullanılacak değerler, o partinin malzeme sertifikasından okunur.",
        ],
        table: {
          caption: "7075-T6 ve Ti-6Al-4V — yayımlanmış tipik değerler",
          note: "Kaynak: malzeme standartlarının tipik değer aralıkları. Parti bazlı değerler için malzeme sertifikası esastır.",
          headers: ["ÖZELLİK", "AL 7075-T6", "Tİ-6AL-4V"],
          rows: [
            ["Çekme mukavemeti", "~572 MPa", "~950 MPa"],
            ["Yoğunluk", "2,81 g/cm³", "4,43 g/cm³"],
            ["Çalışma sıcaklığı", "Sınırlı", "~350 °C'ye kadar"],
            ["Korozyon direnci", "Yüzey işlemine bağlı", "Doğal oksit tabakası"],
            ["Talaş kaldırma hızı", "Yüksek", "Düşük"],
          ],
        },
      },
      {
        id: "maliyet",
        heading: "Maliyet farkı nereden gelir",
        paragraphs: [
          "İki maliyet kalemi ayrı ayrı düşünülmelidir. Hammadde tarafında titanyum belirgin biçimde pahalıdır ve fiyatı piyasa koşullarıyla dalgalanır; güncel farkı teklif aşamasında tedarikçi fiyatıyla birlikte veririz, çünkü sabit bir kat sayısı vermek bir yıl sonra yanlış olur.",
          "İşleme tarafında fark tezgâh süresidir: düşük kesme hızı, daha sık takım değişimi ve daha muhafazakâr talaş derinliği, aynı geometrinin titanyumda alüminyuma göre uzun sürmesi demektir. Bu yüzden titanyumda tasarım sadeleştirmenin getirisi, alüminyumdakinden daha büyüktür.",
        ],
      },
      {
        id: "karar",
        heading: "Karar ölçütü",
        paragraphs: [
          "Parçanın çalışma sıcaklığı, korozyon ortamı ve yorulma yükü belirlenmeden malzeme seçimi bir tercih değil, tahmindir. Bu üçü belliyse karar çoğu zaman kendiliğinden çıkar: sıcaklık veya korozyon belirleyiciyse titanyum, ağırlık ve maliyet belirleyiciyse 7075-T6.",
          `İkisi arasında kaldığınız durumlarda teknik resminizi gönderin; aynı geometri için iki malzemede ayrı ayrı fiyat çalışması yapılabilir. Standart tolerans aralığımız her iki malzemede de ${MINIMUM_TOLERANCE}.`,
        ],
      },
    ],
  },
  {
    slug: "dfm-tasarimdan-uretime-gecis",
    title: "DFM: Tasarımdan Üretime Geçiş",
    excerpt:
      "Üretilebilirlik incelemesi, tasarımı değiştirmekle ilgili değildir: hangi kotenin gerçekten neden o değerde olduğunu sormakla ilgilidir.",
    date: "2 Ocak 2024",
    readTime: "10 dk okuma",
    category: "Mühendislik",
    image: blogDfm,
    imageAlt: "Delikli ve flanşlı işlenmiş metal gövde, kendi ölçülendirilmiş teknik resminin üzerinde duruyor",
    imageCaption: "Model ve teknik resim, üretilebilirlik incelemesinde yan yana",
    featured: false,
    sections: [
      {
        id: "dfm-nedir",
        heading: "DFM nedir, ne değildir",
        paragraphs: [
          "Design for Manufacturing (DFM), tasarımın üretim yöntemiyle uyumlu hâle getirilmesidir. Tasarımı basitleştirmek değildir; parçanın işlevini koruyarak, işlevin gerektirmediği maliyetleri ayıklamaktır.",
          "İnceleme her zaman aynı soruyla başlar: bu kote neden bu değerde? Cevabı olan bir kote dokunulmadan kalır. Cevabı 'CAD şablonundan geldi' olan bir kote ise, çoğu zaman en pahalı kotedir.",
        ],
      },
      {
        id: "tolerans",
        heading: "Tolerans",
        paragraphs: [
          `Tolerans, maliyeti en hızlı büyüten tek kalemdir; çünkü dar tolerans yalnızca daha yavaş işlemek değil, aynı zamanda daha çok ölçmek demektir. Standart tolerans aralığımız ${MINIMUM_TOLERANCE_COMPACT}; bir kote gerçekten bunu gerektiriyorsa uygulanır.`,
          "Buna karşılık montajda işlevi olmayan bir yüzeyde ±0,05 mm yeterliyse, o kotenin ±0,01 mm yazılması hiçbir şey kazandırmaz. Uygulamada en verimli DFM çıktısı, teknik resimdeki kotelerin küçük bir bölümünü kritik olarak işaretlemek ve geri kalanını genel tolerans sınıfına bırakmaktır.",
        ],
      },
      {
        id: "ic-kose-radyusu",
        heading: "İç köşe radyüsü",
        paragraphs: [
          "Frezelemede iç köşe her zaman bir radyüse sahiptir ve bu radyüs takım çapının yarısından küçük olamaz. Sıfır köşe isteyen bir tasarım, ya erozyon gibi ikinci bir yöntem ya da köşe boşluğu gibi bir tasarım çözümü gerektirir.",
          "Genel kural: mümkün olan en büyük iç köşe radyüsünü verin. Büyük radyüs, daha büyük çaplı ve daha rijit bir takımla çalışılmasına izin verir; rijit takım daha az saptığı için hem yüzey düzgünleşir hem de ölçü tutarlılığı artar.",
        ],
      },
      {
        id: "duvar-kalinligi",
        heading: "Duvar kalınlığı ve bağlama",
        paragraphs: [
          "İnce cidarlı parçalarda asıl zorluk kesmek değil, bağlamaktır: kesme kuvveti ve ısı parçayı işleme sırasında hareket ettirir, ölçü tezgâhta doğru çıkar, kontrolde çıkmaz. Genel bir başlangıç noktası olarak alüminyumda 0,5 mm, çelikte 1 mm altındaki cidarlar özel bağlama ve kademeli talaş stratejisi gerektirir.",
          "Bu sayılar bir sınır değil, bir uyarı eşiğidir. Cidarın yüksekliği, uzunluğu ve destek koşulları en az kalınlık kadar belirleyicidir; bu yüzden ince cidarlı bir parçada kesme sırası ve bağlama planı, tasarımla birlikte konuşulmalıdır.",
        ],
      },
      {
        id: "nasil-yurutulur",
        heading: "İncelemenin yürütülmesi",
        paragraphs: [
          "Üretilebilirlik incelemesi bizde teklif aşamasının bir parçasıdır, sonradan gelen bir revizyon değil. 3B model ve ölçülendirilmiş teknik resim geldiğinde kote, tolerans ve yüzey talepleri seçilen imalat yöntemine göre gözden geçirilir.",
          "Çıktı bir rapor değil, bir sorular listesidir: maliyeti belirgin biçimde etkileyen noktalar ve bunların her biri için önerilen alternatif, teklifle birlikte yazılı olarak iletilir. Kararı tasarımcı verir; biz yalnızca hangi kararın neye mal olduğunu söyleriz.",
        ],
      },
    ],
  },
  {
    slug: "cnc-torna-frezeleme-farki",
    title: "CNC Torna vs Frezeleme: Hangisini Seçmeli?",
    excerpt:
      "Soruyu parçanın geometrisi cevaplar: dönen parça mı, dönen takım mı? Karar noktası burasıdır, tezgâh listesi değil.",
    date: "25 Aralık 2023",
    readTime: "7 dk okuma",
    category: "Teknik",
    image: heroCncFrezeleme,
    imageAlt: "Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım",
    imageCaption: "Prizmatik geometri: takım döner, parça sabit kalır",
    featured: false,
    sections: [
      {
        id: "iki-yontem",
        heading: "Tek bir ayrım",
        paragraphs: [
          "Talaşlı imalatın iki temel yöntemi arasındaki fark tek bir cümlede özetlenir: tornalamada iş parçası döner ve takım sabit kalır, frezelemede takım döner ve iş parçası sabit kalır ya da kontrollü hareket eder.",
          "Bu ayrım teknik bir ayrıntı değil, doğrudan hangi geometrinin hangi yöntemde doğal olduğunu belirler.",
        ],
      },
      {
        id: "tornalama",
        heading: "Tornalama neyi iyi yapar",
        paragraphs: [
          "Dönel simetrik her şey: miller, burçlar, somunlar, kovanlar, flanşlar. Parça kendi ekseni etrafında döndüğü için silindirik yüzey tek bir sürekli kesme hareketiyle oluşur; bu hem hızlıdır hem de yüzeyi düzgün bırakır.",
          "Tornanın asıl üstünlüğü çap toleransında değil, EŞ EKSENLİLİKTE ortaya çıkar. Aynı bağlamada işlenen iki çap birbirine göre referanslıdır; aynı ilişkiyi frezede kurmak, iki ayrı kurulum ve bir hizalama hatası demektir.",
        ],
      },
      {
        id: "frezeleme",
        heading: "Frezeleme neyi iyi yapar",
        paragraphs: [
          "Düzlemsel yüzeyler, cepler, kanallar, delik grupları ve serbest biçimli üç boyutlu yüzeyler. Gövdeler, plakalar, braketler ve kalıp bileşenleri bu sınıftadır.",
          "Frezenin üstünlüğü esnekliktir: aynı kurulumda farklı takımlarla farklı özellikler işlenebilir, ve döner eksenler eklendiğinde parçanın birden fazla yüzeyi tek referans sisteminden ele alınabilir.",
        ],
      },
      {
        id: "secim",
        heading: "Seçim ölçütü",
        paragraphs: [
          "Genel kural basittir: parçanın taşıyıcı geometrisi dönel ise tornalama, prizmatik ise frezeleme. Karar, parçanın hangi özelliğinin en dar toleransa sahip olduğuna bakılarak verilir — o özellik hangi yöntemde tek kurulumda çıkıyorsa, ana yöntem odur.",
          "Çoğu gerçek parça ikisini birden gerektirir: tornalanmış bir gövdenin üzerine frezelenmiş bir düzlem ve delik grubu. Bu durumda sıralama önemlidir; ikinci operasyonun referans alacağı yüzey, ilk operasyonda işlenmiş olmalıdır.",
        ],
      },
      {
        id: "kombine",
        heading: "Kombine işleme",
        paragraphs: [
          "Torna-freze kombine kinematik — tahrikli takım, C ve Y ekseni — bu iki operasyonu tek bağlamada birleştirir. Kazanç yine kurulum sayısıdır: dönel ve prizmatik özellikler aynı referans sisteminde kalır.",
          "Hangi yöntemin sizin parçanız için uygun olduğunu teknik resim üzerinden birlikte belirleriz; ayrıntılar CNC Tornalama ve CNC Frezeleme hizmet sayfalarında yer alıyor.",
        ],
      },
    ],
  },
  {
    slug: "kalite-kontrol-cmm-olcum",
    title: "Kalite Kontrol: CMM Ölçüm Süreçleri",
    excerpt:
      "Bir ölçüm, hangi datuma göre alındığı yazılmadıkça bir sayıdan ibarettir. CMM'in yaptığı iş budur.",
    date: "18 Aralık 2023",
    readTime: "9 dk okuma",
    category: "Kalite",
    image: qualityControl,
    imageAlt: "Karanlık ölçüm odasında, granit tabla üzerindeki silindirik parçayı problayan köprü tipi CMM",
    imageCaption: "Kontrol planında tanımlı kotelerin doğrulanması",
    featured: false,
    sections: [
      {
        id: "cmm-nedir",
        heading: "CMM ne ölçer",
        paragraphs: [
          "Koordinat ölçüm makinesi (CMM), bir parçanın yüzeyinden noktalar toplayarak o yüzeyin geometrisini bir koordinat sisteminde yeniden kurar. Kumpasın veya mikrometrenin veremediği şeyi verir: yalnızca boyutu değil, FORMU ve KONUMU.",
          "Düzlemsellik, silindiriklik, diklik, konum ve salgı gibi geometrik özellikler tek bir ölçüyle ifade edilemez; bunlar bir yüzeyin bir referansa göre nasıl davrandığının ifadesidir ve ancak koordinat ölçümüyle doğrulanabilir.",
        ],
      },
      {
        id: "datum",
        heading: "Datum: ölçümün başladığı yer",
        paragraphs: [
          "Ölçüm, parçanın koordinat sisteminin kurulmasıyla başlar. Teknik resimdeki datum yüzeyleri probla taranır ve parçanın kendi referans çerçevesi oluşturulur; bundan sonraki her sonuç bu çerçeveye göredir.",
          "Bu yüzden aynı parça, iki farklı datum kurgusuyla iki farklı sonuç verebilir — ikisi de doğru olmak üzere. Ölçüm raporunun hangi datuma göre alındığını yazması, raporun kendisi kadar önemlidir.",
        ],
      },
      {
        id: "ilk-parca",
        heading: "İlk parça kontrolü",
        paragraphs: [
          "Yeni bir parçanın ilk üretiminde tüm kritik koteler doğrulanır. Amacı yalnızca o parçayı onaylamak değil, işleme programının ve kurulumun doğru olduğunu göstermektir; bu doğrulanmadan seri üretime geçmek, hatayı çoğaltmak demektir.",
          "Bu kontrolün hangi formatta belgeleneceği müşteri şartnamesiyle belirlenir. Sektörüne göre belirli bir form isteniyorsa, bunu teklif aşamasında belirtmeniz yeterlidir.",
        ],
      },
      {
        id: "spc",
        heading: "Seri üretimde izleme",
        paragraphs: [
          "Seri üretimde her parçayı tam ölçmek ne gerekli ne de ekonomiktir. Bunun yerine kontrol planında hangi kotenin hangi sıklıkta ölçüleceği belirlenir ve ölçüm sonuçlarının dağılımı izlenir.",
          "İzlenen şey tek bir parçanın uygunluğu değil, dağılımın tolerans aralığına göre nerede durduğudur. Dağılım kayıyorsa, henüz uygunsuz parça çıkmamış olsa bile müdahale edilir — kalite kontrolün ayıklamaktan farkı budur.",
        ],
      },
      {
        id: "bizde-nasil",
        heading: "Bizde nasıl yürüyor",
        paragraphs: [
          "Her iş için bir kontrol planı hazırlanır: hangi kote, hangi aşamada, hangi yöntemle doğrulanacak ve arkasında hangi kayıt kalacak. Bu plan imalat başlamadan önce yazılır.",
          `Ölçüm kayıtları teslim dosyasına eklenir. ${CMM_COVERAGE} olarak sağlanır; sektörünüzün gerektirdiği bir ölçüm kapsamı varsa, teklif aşamasında birlikte tanımlarız.`,
        ],
      },
    ],
  },
  {
    slug: "endustriyel-yuzey-islemleri-rehberi",
    title: "Endüstriyel Yüzey İşlemleri Rehberi",
    excerpt:
      "Anodizasyon, pasivasyon, toz boya, elektropolisaj: hangisi hangi malzemede ne yapar ve şartnamede ne yazmak gerekir.",
    date: "10 Aralık 2023",
    readTime: "12 dk okuma",
    category: "Rehber",
    image: heroYuzeyIslemleri,
    imageAlt: "Makro çekim: kumlanmış, fırçalanmış ve parlatılmış metal yüzeylerin yan yana duran kenarları",
    imageCaption: "Aynı alaşımda dört farklı yüzey bitişi",
    featured: false,
    sections: [
      {
        id: "neden",
        heading: "Yüzey işlemi bir tercih değildir",
        paragraphs: [
          "Yüzey işlemi çoğu zaman görünüm meselesi sanılır. Uygulamada belirleyici olan üç şeydir: korozyon, aşınma ve elektriksel/ısıl davranış. Bunların hiçbiri talaşlı imalatla çözülemez.",
          "Bu yüzden yüzey işlemi tasarım kararıdır ve teknik resimde yazılmalıdır — hangi standart, hangi tip, hangi sınıf ve hangi kalınlık. 'Anodize edilecek' ifadesi bir şartname değildir.",
        ],
      },
      {
        id: "anodizasyon",
        heading: "Anodizasyon — alüminyum",
        paragraphs: [
          "Anodizasyon, alüminyum yüzeyinde elektrokimyasal olarak kontrollü bir oksit tabakası büyütür. Tabaka kaplama değildir; malzemenin kendisinden oluşur, bu yüzden dökülmez ve soyulmaz.",
          "MIL-A-8625 kapsamında Tip II (kükürt asidi, tipik olarak 10-25 µm) genel amaçlı koruma ve renklendirme için, Tip III (sert anodizasyon, tipik olarak 25-100 µm) yüksek aşınma direnci gereken yüzeyler için kullanılır. Tabaka dışa doğru büyüdüğü için ölçüyü değiştirir: dar toleranslı yüzeylerde bu pay tasarımda hesaba katılmalıdır.",
        ],
      },
      {
        id: "pasivasyon",
        heading: "Pasivasyon — paslanmaz çelik",
        paragraphs: [
          "Pasivasyon, paslanmaz çelik yüzeyindeki serbest demiri kimyasal olarak uzaklaştırır ve yüzeyin kendi krom oksit tabakasının yeniden oluşmasına izin verir. İşlem sonrası parçanın boyutu ölçülebilir bir biçimde değişmez.",
          "Yöntem ve kabul ölçütleri ASTM A967'de tanımlıdır; nitrik asit ve sitrik asit esaslı banyolar farklı sınıflardır ve şartnamede hangisinin istendiği belirtilmelidir. Talaşlı imalattan sonra pasivasyon, işleme sırasında yüzeye bulaşan demir kalıntısı nedeniyle çoğu paslanmaz parçada gerekli bir adımdır.",
        ],
      },
      {
        id: "toz-boya",
        heading: "Toz boya",
        paragraphs: [
          "Toz boya, elektrostatik olarak uygulanan ve fırında polimerize olan bir kaplamadır. Çözücü içermemesi ve tek katta kalın film verebilmesi başlıca üstünlükleridir; renk seçimi RAL kataloğu üzerinden yapılır.",
          "Dayanım, boyanın kendisinden çok altındaki ön işlemle belirlenir: yağ alma, fosfatlama veya dönüşüm kaplaması yapılmamış bir yüzeyde en iyi boya bile ayrılır. Bir tuz püskürtme (salt spray) dayanım süresi bekliyorsanız, hedef süreyi ve ilgili standardı şartnamede belirtin; bu değer boya-ön işlem-altlık üçlüsüne bağlıdır ve boyanın tek başına bir özelliği değildir.",
        ],
      },
      {
        id: "elektropolisaj",
        heading: "Elektropolisaj",
        paragraphs: [
          "Elektropolisaj, paslanmaz çelik yüzeyden kontrollü biçimde ince bir tabaka çözer. Yüzeyin tepe noktaları vadilerden daha hızlı çözüldüğü için sonuç hem daha pürüzsüz hem de kimyasal olarak daha temiz bir yüzeydir.",
          "Medikal ve gıda uygulamalarında tercih edilmesinin nedeni parlaklık değil, temizlenebilirliktir: mikro çatlakların ve talaş kalıntısının azalması, yüzeyin sterilize edilebilmesini kolaylaştırır. Ulaşılabilecek Ra değeri başlangıç yüzeyine bağlıdır — elektropolisaj kötü bir işleme yüzeyini kurtarmaz, iyi bir yüzeyi iyileştirir.",
        ],
      },
      {
        id: "secim",
        heading: "Şartnamede ne yazmalı",
        paragraphs: [
          "Dört bilgi yeterlidir: standart, tip/sınıf, kalınlık aralığı ve kaplanmayacak yüzeyler. Son madde en çok atlanan maddedir; diş, geçme yüzeyi ve elektriksel temas noktaları çoğu zaman maskelenmelidir.",
          "Yüzey işlemlerini sunuyor veya koordine ediyoruz. Hangi işlemin sizin parçanız ve çalışma ortamınız için uygun olduğunu, teknik resim üzerinden teklif aşamasında birlikte belirleyebiliriz.",
        ],
      },
    ],
  },
];

/** The categories the corpus actually contains, in first-appearance order. */
export const blogCategories: string[] = [
  ...new Set(blogPosts.map((post) => post.category)),
];
