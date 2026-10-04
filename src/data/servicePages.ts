import {
  CAD_UPLOAD_EXTENSIONS,
  CAD_UPLOAD_FORMATS,
  LEAD_TIME_SHORT,
  LEAD_TIME_STATEMENT,
  QUOTE_RESPONSE_TIME,
} from "@/content/claims";

/* ═══════════════════════════════════════════════════════════════════════════
   BU DOSYA BİR YAYIN YÜZEYİDİR — 09a-C2

   Üç ayrı yol buradan ziyaretçiye çıkar: `ServiceDetail.tsx` sayfayı basar,
   `CategoryPage.tsx` liste kartlarını üretir ve `chatFaqData.ts`
   `collectServiceFaqs()` ile buradaki HER `faq` girdisini sohbet botunun
   yanıt havuzuna taşır. Yani bu dosyadaki bir teslim süresi, aynı anda bir
   sayfa metni, bir arama sonucu ve bir sohbet yanıtıdır.

   09a-C2 SÜPÜRMESİ — ÜRETİM/TESLİM SÜRELERİ
   -----------------------------------------
   `USER_INPUTS.md` §D tolerans, teklif dönüş süresi, malzeme sayısı, CMM
   kapsamı, zamanında teslim oranı ve dört ölçek rakamı verir. TERMİN,
   LEAD TIME veya TESLİM SÜRESİ diye bir alan YOKTUR; §J `QUOTE_SLA: 1-3 Days`
   ise teklifin saati, parçanın değil. Bu dosya on bir sayfada `3-5 iş günü`,
   `7-15 iş günü`, `24 saat`, `24-72 saat`, `2-3 hafta`, `4-8 hafta` gibi
   teslim taahhütleri yayımlıyordu; hiçbirinin dayanağı yoktu.

   Kural: SÜRE GEREKTİREN HER YERDE TEK KAYNAK `@/content/claims`.
     · `QUOTE_RESPONSE_TIME` — yetkili tek süre (teklif dönüşü, §D + §J).
     · `LEAD_TIME_STATEMENT` / `LEAD_TIME_SHORT` — yetkisiz sürenin yerine
       geçen mekanizma cümlesi. Yeni bir iddia değil; site zaten bunu diyor.
     · `PRODUCTION_LEAD_TIME` — açıkça WITHHELD. Geri getirmek tip hatasıdır.

   Rakam olmayan taahhütler de aynı sınıftadır ve aynı sebeple kaldırıldı:
   "aynı gün teslimat", "ekspres hizmet", "acil tedarik", "gece-gündüz
   kesintisiz üretim". Bir vardiya düzeni de, bir hizmet kademesi de, sayı
   içermeden verilmiş bir termin sözüdür.

   TAM SÜTUN KURALI: bir karşılaştırma tablosunun süre SÜTUNUNUN tamamı
   yetkisizse sütun kaldırılır — beş hücreye "Teklifle birlikte" yazmak bilgi
   taşımayan bir sütun bırakır. Süre, sınıfları karışık bir satır listesinin
   içinde tek bir hücreyse nötralize edilir.

   Makine yarısı: `scripts/claims-gate.mjs` → `unverified-production-lead-time`
   ve `express-service-tier`.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   KABUL EDİLEN CAD FORMATLARI — TÜRETİLİR, YAZILMAZ — 09a-C3

   TEK YETKİ `src/utils/cadUpload.ts` → `CAD_ACCEPTED_EXTENSIONS`. Ziyaretçinin
   yüklediği dosyayı kabul eden ya da reddeden kod odur; yayımlanan cümle onun
   bir kopyası değil, TÜREVİ olmak zorundadır. `USER_INPUTS.md` §J:
   `ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`.

   NEDEN ELLE YAZILMIŞ LİSTE — DOĞRU OLANI BİLE — BİR KUSURDUR
   -----------------------------------------------------------
   Bu dosya iki ayrı biçimde aynı hatayı taşıyordu:

     · `:134` (cnc-frezeleme SSS) ve `:89` (aynı sayfanın gövde metni)
       "Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX (.prt) ve
       PDF/DWG" diyordu. `validateCadFile()` bunların DOKUZUNU DA reddediyor.
       QA çalışma anında kanıtladı: bir `.sldprt` yüklendiğinde ekranda
       "DOSYA REDDEDİLDİ … kabul edilen formatlardan biri değil" çıkıyor.
       Bu satır aynı zamanda sohbet botunun havuzunda: `chatFaqData.ts`
       `collectServiceFaqs()` buradaki HER `faq` girdisini oraya taşıyor ve
       anahtar kelimeleri soru+cevap metninden üretiyor. Yani `catia`,
       `catpart`, `solidworks`, `sldprt` yazan ziyaretçi — yani tam olarak
       zarar gören kişi — 1.000 skorla bu yanlış cevaba düşüyordu.

     · `:1943` ("Desteklenen CAD: STEP, IGES, CATIA, NX, SW") aynı sınıf.

     · `:1967` (DFM SSS) BUGÜN DOĞRU bir listeyi elle yazıyordu. Tehlikeli
       olan da bu: `chatFaqData.ts` aynı listeyi türetiyor, dolayısıyla
       doğrulayıcı değiştiği gün türetilmiş cevap değişir, elle yazılmış olan
       sessizce yanlışa döner. Doğru olan bir sabit, yine de bir sabittir.

   Bu yüzden dört yer de `@/content/claims` içindeki `CAD_UPLOAD_FORMATS` ya da
   `CAD_UPLOAD_EXTENSIONS` sabitini kullanır. Kaynakta artık hiçbir format adı
   YAZILI DEĞİL; bir uzantı eklenip çıkarıldığında dört cümle birden
   kendiliğinden düzelir.

   NEDEN `claims.ts`, NEDEN DOĞRUDAN `cadUpload.ts` DEĞİL: bu dosyayı iki
   Playwright spec'i (`e2e/landing/navigation-reachability.spec.ts` ve
   `e2e/shared-shell-accessibility.spec.ts`) doğrudan NODE çalışma zamanına
   import eder. `cadUpload.ts` → `supabase/env.ts` zinciri modül seviyesinde
   `import.meta.env` okur ve orada `undefined`tır; çalışma zamanı bağı
   eklendiğinde `critical-1280` projesinin TAMAMI toplama aşamasında düştü
   (ölçüldü). `claims.ts` listeyi bir kez yazar ve TİP SİSTEMİYLE
   doğrulayıcıya sabitler — gerekçesi orada.

   Makine yarısı: `scripts/claims-gate.mjs` → `cad-format-list-not-derived`.
   ═══════════════════════════════════════════════════════════════════════════ */

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
  /* IMG01: the page visual is `src/content/detail-visuals.ts`, not a field here. */
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
      /* 09a-C3 — D3 ile aynı sınıf, ikinci yer. "ücretsiz DFM analizi" bir
         TİCARİ POLİTİKADIR ve `USER_INPUTS.md` hiçbir alanında yer almıyor.
         Yumuşatılamaz — okuyucuya bir sayı değil bir taahhüt söyleniyor — o
         yüzden yerine mekanizma yazıldı. `/sss` aynı soruyu Phase 07'de aynı
         gerekçeyle yeniden yazmıştı.

         09a-C4 / R3-4 — DÜZELTME, bu notun ÜÇÜNCÜ kopyası. Burada da
         "`metaDescription` olduğu için arama sonucuna ve sosyal karta da
         çıkıyordu" yazıyordu. YANLIŞTI: bu alanı hiçbir şey okumuyor.
         `ServiceDetail.tsx` :195, :284 ve :306'da `page.description`
         geçiriyor ve `src/**` içinde bir servis rotasında `metaDescription`
         okuyan tek bir yer yok — 44 sayfanın hepsinde ölü veri.
         (`LegalDocument.tsx` aynı adlı bir prop taşır; o BAŞKA bir tipin
         başka bir prop'udur ve o okunur.)

         KALDIRMA DOĞRUYDU, GEREKÇE YANLIŞTI. Yetkisiz bir iddia ölü bir
         alanda da yetkisizdir; üstelik bu alan canlı olmaya bir `usePageMeta`
         çağrısı uzaklıkta ve `claims-gate.mjs` tam bu yüzden onu da tarıyor.
         Alanın bağlanması gerçek bir SEO bulgusudur ve SEO fazına aittir;
         bir içerik düzeltmesinde karara bağlanmaz. */
      "3, 4 ve 5 eksenli CNC frezeleme ile ±0.01 mm standart tolerans aralığında üretim. Alüminyum, titanyum ve çelik işleme, teklifle birlikte üretilebilirlik incelemesi.",
    description:
      "5 eksenli CNC frezeleme merkezlerimiz ile karmaşık geometrileri yüksek hassasiyetle işliyoruz. Alüminyumdan titanyuma, plastikten kompozitlere kadar geniş malzeme yelpazesi.",
    content: [
      "5 eksenli CNC freze merkezlerimizde karmaşık geometrileri tek kurulumda tamamlıyoruz. Bağlama sayısını azaltmak yalnızca süreyi kısaltmaz; her yeni bağlama ölçü zincirine yeni bir hata kaynağı eklediği için doğrudan tolerans lehine çalışır.",
      "3 eksen frezeleme ile düz yüzeyler, cep işleme ve standart geometrilerde ekonomik çözümler üretiyoruz. 4 eksen frezeleme ile döner tabla sayesinde silindirik parçalarda kanal açma, delik delme ve profil işleme yapıyoruz. 5 eksen simultane frezeleme ile tek bağlamada en karmaşık parça geometrilerini işleyerek havacılık, medikal ve otomotiv sektörünün taleplerini karşılıyoruz.",
      "Yüksek hızlı işleme (HSM) stratejileriyle ince cidarlı parçalarda kesme kuvvetini düşürüp yüzey kalitesini iyileştiriyoruz. Havacılık, otomotiv, medikal ve savunma gibi kritik sektörlerde standart çalışma aralığımız ±0.01 mm olup ulaşılabilir tolerans her parça için teknik incelemede belirlenir.",
      /* 09a-C3 — D1'in ikinci yarısı. Bu cümle SSS'deki yanlış listenin AYNISINI
         gövde metninde yayımlıyordu ("STEP, IGES, SolidWorks, CATIA ve NX
         formatlarını doğrudan işleyebiliyoruz"); beş formattan üçünü
         `validateCadFile()` reddediyor. Liste artık türetiliyor. */
      `Alüminyum (6061, 7075), paslanmaz çelik (304, 316), karbon çelik, titanyum, PEEK ve POM/Delrin gibi mühendislik malzemelerinde uzmanlaşmış ekibimizle hizmetinizdeyiz. Her projede DFM analizi uygulayarak maliyetleri optimize ediyoruz; teklif akışındaki yükleyici ${CAD_UPLOAD_FORMATS} uzantılarını doğrular, listede olmayan yerel CAD kayıtlarını ve teknik resimleri e-posta ile alıyoruz.`,
    ],
    features: [
      "3 Eksen Frezeleme — Düz yüzeyler ve standart geometrilerde ekonomik çözüm",
      "4 Eksen Frezeleme — Döner tabla ile çevresel ve profil işleme",
      "5 Eksen Simultane — Tek bağlamada karmaşık geometriler",
      "Yüksek Hızlı İşleme (HSM) — İnce cidarlı parçalarda kesme kuvvetinin düşürülmesi",
      "±0.01 mm Standart Tolerans — kontrol planıyla teyit edilir",
      "Otomatik Takım Değiştirme — uzun kesme sürelerinde kesintisiz işleme",
    ],
    technicalSpecs: [
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
      { label: "Standart Tolerans", value: "±0.01mm" },
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
      /* 09a-C3 — F1. "%40 daha hızlı" kaynaksız bir performans KPI'ı; §D
         `OTHER_PUBLIC_KPIS: NONE`. Kabiliyet kalır, doğrulanmamış sayı gider:
         aynı sayfanın `content[2]` bölümü mekanizmayı zaten doğru anlatıyor
         ("kesme kuvvetini düşürüp yüzey kalitesini iyileştiriyoruz"). */
      "HSM stratejisiyle ince cidarlı parçalarda düşük kesme kuvveti ve iyi yüzey kalitesi",
      "Otomatik takım değiştirme",
      "Prototipten seri üretime esnek çözümler (min. 1 adet)",
      "Termin, kapasite planı incelendikten sonra teklifle birlikte verilir",
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
      /* 09a-C3 — D1. Eski cevap dokuz format vaat ediyordu (parasolid, sldprt,
         solidworks, catpart, catia, prt, nx, dwg, pdf) ve `validateCadFile()`
         dokuzunu da reddediyor. Reddedilen formatlar cümlede KALIYOR — ama
         kabul edildikleri için değil, edilmedikleri için: `collectServiceFaqs()`
         anahtar kelimeleri bu metinden üretir, dolayısıyla `catia`, `catpart`,
         `solidworks`, `sldprt` yazan ziyaretçi artık DOĞRU cevaba düşer.
         Kabul edilen listenin kendisi türetilir; kaynakta yazılı değildir. */
      {
        question: "Hangi dosya formatlarını kabul ediyorsunuz?",
        answer: `Teklif akışındaki yükleyici şu uzantıları doğrular: ${CAD_UPLOAD_EXTENSIONS} — listede olmayan bir uzantı yükleme adımından geçmez. Yerel CAD kayıtlarınızı (SolidWorks .sldprt, CATIA .catpart, NX .prt) veya PDF/DWG teknik resminizi sales@mastechnic.com adresine iletirseniz teklif için değerlendiririz.`,
      },
      { question: "Minimum sipariş adedi var mı?", answer: "Hayır, tek parçadan seri üretime kadar her adette üretim yapıyoruz. Prototip siparişleri de kabul ediyoruz." },
      { question: "Teslimat süreniz ne kadar?", answer: LEAD_TIME_STATEMENT },
    ],
    comparisonTables: [
      {
        title: "CNC Frezeleme Eksen Karşılaştırması",
        description: "Parça geometrisine göre en uygun eksen konfigürasyonunu belirleyin",
        headers: ["Özellik", "3 Eksen", "4 Eksen (3+1)", "5 Eksen Simultane"],
        rows: [
          ["Geometri Kapasitesi", "Düz yüzeyler, cep", "Silindirik profiller", "Karmaşık serbest formlar"],
          ["Bağlama Sayısı", "2-4 bağlama", "1-2 bağlama", "Tek bağlama"],
          ["Setup Süresi", "Kısa", "Orta", "Uzun (ilk parça)"],
          ["Birim Maliyet", "$", "$$", "$$$"],
          ["Tipik Uygulama", "Plaka, braket", "Flanş, kanal", "Türbin, karmaşık gövde"],
        ],
      },
      {
        title: "İşleme Stratejileri ve Yüzey Kalitesi",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
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
    metaDescription: "CNC torna ile hassas tornalama: canlı takımlı, Y eksenli ve kayar puntalı (Swiss tip) torna. ±0.01 mm standart tolerans; çalışma aralığı teklifte belirtilir.",
    description:
      "Çok eksenli torna merkezlerimiz ile mil, somun, gövde ve karmaşık döner parçaları tek kurulumda tamamlayabilme kapasitesi.",
    content: [
      "CNC tornalama, silindirik ve dönme simetrisine sahip parçalar için en verimli üretim yöntemidir. C eksenli ve Y eksenli CNC torna tezgahlarımız sayesinde frezeleme operasyonlarını entegre ediyor, off-center delik ve kanal açma işlemlerini tek bağlamada gerçekleştiriyoruz.",
      "2 eksen tornalama ile miller, burçlar ve basit silindirik parçalar üretirken, canlı takımlı tornalama ile Y ekseni üzerinden torna tezgahında frezeleme, delme ve diş açma işlemleri yapıyoruz. Turn-Mill (torna-freze) kabiliyetimiz ile tek bağlamada hem tornalama hem frezeleme yaparak karmaşık parçalarda yüksek hassasiyet ve verimlilik elde ediyoruz.",
      "Kayar puntalı (Swiss tip) tornalama ile vida, pim ve konektör pini gibi küçük çaplı, uzun parçalar üretiyoruz: desteklenmemiş boyun kısalması sehimi sınırlar. Çift milli torna merkezlerinde ön ve arka yüzey işleme operasyonları tek kurulumda tamamlanır.",
      "Bar besleyicili tezgahlarda çubuk malzeme otomatik ilerlediği için uzun partiler sürekli işlenebilir. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "2 Eksen Tornalama — Miller, burçlar ve silindirik parçalar",
      "Canlı Takımlı Torna — Y ekseni ile frezeleme, delme, diş açma",
      "Turn-Mill (Torna-Freze) — Tek bağlamada komple işleme",
      "Swiss Tornalama — Küçük çaplı, uzun parçalar için kayar punta",
      "Otomatik Bar Besleyici — Uzun partilerde sürekli üretim",
      "Çift Milli Torna — Ön ve arka yüzey tek kurulumda",
    ],
    technicalSpecs: [
      { label: "Çalışma aralığı (çap / boy)", value: "Teklifte belirtilir" },
      { label: "Standart Tolerans", value: "±0.01mm" },
      { label: "Torna tipleri", value: "2 eksen, C/Y, turn-mill, Swiss" },
      { label: "Bar Besleyici", value: "Otomatik" },
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
      /* 09a-C3 — F1 ile aynı sınıf, bu sayfada. "%50 setup tasarrufu"
         kaynaksız; §D `OTHER_PUBLIC_KPIS: NONE`. Kabiliyetin kendisi —
         parçanın arka yüzünün ikinci bağlama olmadan tamamlanması — kalır. */
      "Çift mil ile parçanın arka yüzü ayrı bir bağlama gerektirmeden tamamlanır",
      "Swiss tip tornalama ile küçük çaplı, uzun parçalar",
      "Bar besleyici ile uzun partilerde operatör müdahalesiz işleme",
      "Turn-mill ile frezeleme ihtiyacını tek operasyonda çözme",
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
      { question: "Swiss tornalama ne zaman gerekir?", answer: "Küçük çaplı ve boy/çap oranı yüksek parçalarda (örn. vidalar, pimler) Swiss torna, kesme noktasını burca yakın tuttuğu için sehimi sınırlar. Parçanın Swiss tipe uygunluğu teknik resim incelemesinde belirlenir." },
      { question: "Seri üretim için uygun mu?", answer: "Evet. Bar besleyicili tezgahlarda çubuk malzeme otomatik ilerlediği için uzun partiler operatör müdahalesi olmadan işlenebilir; parti büyüklüğü ve termin kapasite planıyla birlikte teklifte netleşir." },
      { question: "Hangi çap aralığında tornalama yapabiliyorsunuz?", answer: "Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir." },
    ],
    comparisonTables: [
      {
        title: "CNC Torna Konfigürasyon Karşılaştırması",
        headers: ["Özellik", "2 Eksen Torna", "Canlı Takımlı (C/Y)", "Turn-Mill", "Swiss Torna"],
        rows: [
          ["İşleme Tipi", "Sadece tornalama", "Torna + delme/freze", "Torna + freze komple", "Uzun/ince parçalar"],
          ["Setup Süresi", "Kısa", "Orta", "Uzun", "Orta"],
          ["Birim Maliyet", "$", "$$", "$$$", "$$"],
          ["Tipik Parça", "Mil, burç", "Flanş, valf gövde", "Karmaşık gövde", "Pin, vida, konektör"],
        ],
        highlight: 3,
      },
      {
        title: "Torna Malzeme İşlenebilirlik Matrisi",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Malzeme", "Kesme Hızı (m/dk)", "İlerleme (mm/dev)", "Takım Tipi"],
        rows: [
          ["Otomat Çeliği (11SMnPb30)", "180-250", "0.15-0.35", "Kaplamalı karbür"],
          ["Alüminyum 6061", "300-600", "0.10-0.30", "PCD / Elmas"],
          ["Pirinç CuZn39Pb3", "200-400", "0.10-0.25", "Kaplamasız karbür"],
          ["Paslanmaz 304", "120-180", "0.08-0.20", "CVD kaplamalı"],
          ["Titanyum Grade 5", "40-80", "0.05-0.15", "PVD kaplamalı"],
          ["İnkonel 718", "20-40", "0.05-0.10", "Seramik / CBN"],
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
    metaDescription: "Mikro frezeleme, mikro tornalama ve mikro delme. Elektronik konektör, optik ve medikal bileşenlerde küçük ölçekli hassas işleme; çalışma aralığı teklifte belirtilir.",
    description:
      "Standart takımların ulaşamadığı küçük özelliklere sahip parçalar için mikro işleme. Medikal, elektronik ve optik bileşenler tipik uygulama alanlarıdır.",
    content: [
      "Mikro işleme, standart takımların ulaşamadığı küçük özellikleri — dar kanallar, küçük delikler, ince duvarlar — küçük çaplı takımlar ve yüksek iş mili devriyle işler. Optik, elektronik ve medikal bileşenler tipik uygulama alanlarıdır.",
      "Mikro frezeleme, Swiss tip mikro tornalama ve mikro delme ile pim, vida, konektör pini, nozul ve akış kontrol parçaları gibi küçük parçalar üretilir. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
      "Mikro parçalarda kontrol yöntemi de parçanın ölçeğine göre seçilir: temaslı ölçüm parçayı deforme edebileceği için optik yöntemler tercih edilir. Kontrol planında hangi kotenin hangi yöntemle ölçüleceği önceden tanımlanır ve sonuçlar kayıt altına alınır.",
      "Tipik uygulamalar: medikal sektöründe cerrahi alet ve cihaz bileşenleri; havacılıkta yakıt enjektörleri, sensör muhafazaları ve mikro valfler; elektronikte konektör pinleri, fiber optik bileşenler ve yarı iletken test aparatları; saat ve optikte mekanizma parçaları, lens tutucular ve kamera bileşenleri.",
    ],
    features: [
      "Mikro Frezeleme — Küçük çaplı takımlarla 5 eksen işleme",
      "Mikro Tornalama — Küçük çaplı, uzun parçalar için Swiss tip",
      "Mikro Delme — Küçük çaplı hassas delikler",
      "Mikro Ölçüm — Optik ölçüm ile kontrol",
    ],
    technicalSpecs: [
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
      { label: "Standart Tolerans", value: "±0.01mm" },
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
      "Küçük çaplı takımlar ve yüksek devirli iş mili ile işleme",
      "Parça temizliği ve paketleme kontrol planına göre",
      "Optik büyütme altında kontrol",
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
      { question: "Mikro işleme ne zaman tercih edilmeli?", answer: "Özellikler standart takımların ulaşamayacağı kadar küçükse — dar kanallar, küçük delikler, ince duvarlar — mikro işleme gerekir. Parçanın mikro işleme gerektirip gerektirmediği teknik resim incelemesinde belirlenir." },
      { question: "Maliyet standart CNC'den yüksek mi?", answer: "Evet, özel takımlar, yavaş ilerleme hızları ve hassas ölçüm gereksinimleri nedeniyle maliyet daha yüksektir. Ancak bu, standart yöntemlerle elde edilemeyecek sonuçlar içindir." },
      { question: "Seri üretim yapabiliyor musunuz?", answer: "Evet. Otomatik besleyicili Swiss torna ile mikro parçalarda da seri üretim yapılabilir; parti büyüklüğü teklif aşamasında planlanır." },
      { question: "Ölçüm raporu veriyor musunuz?", answer: "Kontrol planında tanımlanan koteler ölçülür ve ölçüm kaydı teslimat dosyasına eklenir. Koordinat ölçümü gerektiğinde akredite üçüncü taraf ölçümü talebe bağlı olarak sağlanır." },
    ],
    comparisonTables: [
      {
        title: "Mikro İşleme Teknoloji Karşılaştırması",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Parametre", "Mikro Frezeleme", "Mikro Tornalama", "Mikro Delme", "Mikro EDM"],
        rows: [
          ["İşleme Hızı", "Orta", "Yüksek", "Düşük", "Çok düşük"],
          ["Malzeme Kısıtı", "Tümü", "Silindirik", "Tümü", "İletken"],
          ["Maliyet", "$$$", "$$", "$$", "$$$$"],
          ["Tipik Uygulama", "Optik, medikal bileşen", "Pin, vida", "Nozul, enjektör", "Mikro kalıp"],
        ],
      },
      {
        title: "Sektörel Mikro İşleme Gereksinimleri",
        description: "Proje gereksinimi şartnameyle tanımlanır; tablo şirket kapasitesi değildir.",
        headers: ["Sektör", "Tipik Parça", "Tolerans Beklentisi", "Belge Beklentisi"],
        rows: [
          ["Medikal", "Cerrahi alet, medikal bileşen", "Şartnameye göre", "Biyouyumlu malzeme kaydı"],
          ["Havacılık", "Yakıt enjektör, sensör", "Şartnameye göre", "İzlenebilir malzeme kaydı"],
          ["Elektronik", "Konektör pin, PCB", "Şartnameye göre", "Görsel kabul kriteri"],
          ["Saat & Optik", "Mekanizma, lens tutucu", "Şartnameye göre", "Ölçüm kaydı"],
          ["Otomotiv", "Enjektör nozul, sensör", "Şartnameye göre", "Parti izlenebilirliği"],
        ],
      },
    ],
  },
  {
    slug: "derin-delik-raybalama",
    category: "hizmetler",
    categoryLabel: "Talaşlı İmalat",
    title: "Derin Delik & Raybalama",
    metaTitle: "Derin Delik Delme & Raybalama | Gun Drill & BTA | Mas Technic",
    metaDescription: "Boy/çap oranı yüksek delikler için gun drilling, BTA delme, raybalama ve honlama. Çalışma aralığı ve tolerans sınıfı teknik resme göre teklifte belirtilir.",
    description:
      "Boy/çap oranı yüksek deliklerde hassas ve doğrusal işleme. Hidrolik silindir, kalıp soğutma kanalları ve makina parçaları için uzman çözümler.",
    /* T01 — the gun-drill range was published as Ø2-20 in three places and
       Ø2-100 in the spec table, and the page equated H6/H7 with "±0.01mm".
       An ISO hole class is not a fixed ± value: its limits depend on the
       nominal size. Ranges, depths, L/D ratios and Ra values are withdrawn
       until the capacity is confirmed (owner input O02). */
    content: [
      "Derin delik delme, boy/çap oranı (L/D) yüksek delikler için gereken özel bir işleme sürecidir; standart matkaplarla bu oranlarda doğrusal ve hassas delik elde etmek zordur.",
      "Gun drilling tek dudaklı matkapla, talaşı yüksek basınçlı soğutma sıvısıyla dışarı taşıyarak küçük çaplı, uzun delikler açar; yağ kanalları ve soğutma delikleri tipik uygulamalardır. BTA delme ise talaşı takımın içinden tahliye ettiği için daha büyük çaplı derin deliklerde tercih edilir.",
      "Raybalama ve honlama, delinmiş deliğin çapını, formunu ve yüzeyini son ölçüye getirir. Delik tolerans sınıfı ve alt/üst sınırlar, nominal ölçü ve teknik resme göre belirlenir.",
      "Hidrolik silindir gövdeleri, valf blokları, manifold delikleri ve kalıp soğutma kanalları bu yöntemlerin tipik uygulama alanlarıdır. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "Gun Drilling — Küçük çaplı, uzun delikler ve yağ kanalları",
      "BTA Delme — Büyük çaplı derin deliklerde iç talaş tahliyesi",
      "Hassas Raybalama — Çap ve form son ölçüye getirilir",
      "Honlama — İç yüzey iyileştirme",
    ],
    technicalSpecs: [
      { label: "Yöntemler", value: "Gun drill, BTA, rayba, honlama" },
      { label: "Çalışma aralığı (çap / derinlik)", value: "Teklifte belirtilir" },
      { label: "Delik toleransı", value: "Nominal ölçü ve resme göre" },
    ],
    processSteps: [
      "Teknik Analiz",
      "Delme Yöntemi Seçimi",
      "Derin Delik İşleme",
      "Raybalama / Honlama",
      "Ölçüm & Rapor",
    ],
    advantages: [
      "Gun drill ve BTA yöntemleri",
      "Raybalama ve honlama ile son ölçü ve yüzey",
      "Kılavuz burç ve yüksek basınçlı soğutma ile sapmanın sınırlanması",
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
      { question: "Derin delik nedir?", answer: "Boy/çap oranı yüksek delikler 'derin delik' olarak adlandırılır; standart matkaplarla bu oranlarda doğrusal ve hassas delik elde etmek zordur." },
      { question: "Gun drill ile BTA arasındaki fark nedir?", answer: "Gun drill küçük çaplarda ve yüksek boy/çap oranlarında kullanılır; talaş soğutma sıvısıyla dışarı taşınır. BTA daha büyük çaplarda tercih edilir; talaş takımın içinden tahliye edilir. Hangi yöntemin kullanılacağı parça ve teknik resim incelemesinde belirlenir." },
      { question: "Doğrusallık nasıl sağlanır?", answer: "Özel kılavuzlama burs sistemleri, yüksek basınçlı soğutma sıvısı ve optimize edilmiş kesme parametreleri ile sapma minimuma indirilir." },
      { question: "İç yüzey kalitesi iyileştirilebilir mi?", answer: "Evet, raybalama ve honlama işlemleri iç yüzeyi ve çapı son ölçüye getirir. Delik tolerans sınıfı ve alt/üst sınırlar, nominal ölçü ve teknik resme göre belirlenir." },
    ],
    comparisonTables: [
      {
        title: "Derin Delik Delme Yöntemleri Karşılaştırması",
        headers: ["Parametre", "Gun Drilling", "BTA Delme", "Konvansiyonel Matkap"],
        rows: [
          ["Talaş Kontrolü", "Soğutma sıvısıyla dış tahliye", "İç talaş tahliye", "Matkap kanalları"],
          ["Tipik Çap", "Küçük çap", "Büyük çap", "Genel"],
          ["Tipik Uygulama", "Yağ kanalı, soğutma deliği", "Silindir gövde", "Standart delik"],
        ],
        highlight: 0,
      },
    ],
  },

  // ── Hizmetler > Ön Üretim ──
  {
    slug: "enjeksiyon-kalibi",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Enjeksiyon Kalıbı",
    metaTitle: "Enjeksiyon Kalıp İmalatı | Mas Technic",
    metaDescription: "Alüminyum ve çelik enjeksiyon kalıp üretimi. Prototip kalıptan seri üretim kalıbına malzeme seçimi; kalıp ömrü kalıp çeliği ve üretim adedine göre teklifte belirtilir.",
    description:
      "Alüminyum ve çelik kalıp imalatı. Hızlı prototip kalıplarından yüksek hacimli seri üretim kalıplarına kadar tüm ihtiyaçlarınıza çözüm.",
    content: [
      "Yüksek hassasiyetli plastik enjeksiyon kalıplarının tasarımını ve üretimini gerçekleştiriyoruz. Dolum davranışı kalıp tasarımında değerlendirilir; karmaşık parçalarda akış analizinin kapsamı teklifte belirtilir. Kalıptan çıkış açısı, çekme telafisi ve gate/vent konumlandırma DFM analizinde ele alınır.",
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
      { label: "Kavite Sayısı", value: "Teklifte belirlenir" },
      { label: "Kalıp ömrü", value: "Kalıp çeliği ve adede göre" },
      { label: "Tolerans", value: "±0.01mm" },
    ],
    processSteps: [
      "Ürün Analizi",
      "Kalıp Tasarımı",
      "Dolum ve Akış Değerlendirmesi",
      "CNC İşleme",
      "Deneme Basımı",
      "Teslimat",
    ],
    advantages: [
      "Dolum davranışının kalıp tasarımında değerlendirilmesi",
      "DFM analizi; kalıptan çıkış açısı ve çekme telafisi ayrı değerlendirilir",
      "Hot runner sistemi desteği",
      "4 farklı kalıp malzemesi seçeneği (Al 7075, P20, H13, S136)",
    ],
    materials: [
      { name: "Al 7075", grade: "150 HB", properties: "Prototip ve düşük hacim kalıbı" },
      { name: "P20 (1.2311)", grade: "280-320 HB", properties: "Orta hacim, genel amaçlı" },
      { name: "H13 (1.2344)", grade: "45-52 HRC", properties: "Yüksek hacim, sıcak iş çeliği" },
      { name: "S136 (1.2083)", grade: "48-52 HRC", properties: "Korozyon direnci, optik kalıplar" },
    ],
    faq: [
      { question: "Kalıp teslimat süresi ne kadar?", answer: `Kalıp termini malzeme sınıfına, kavite sayısına ve yüzey gereksinimine göre değişir; alüminyum kalıp çelik kalıba göre daha kısa sürede işlenir. ${LEAD_TIME_STATEMENT}` },
      { question: "Akış analizi gerekli mi?", answer: "Her parçada gerekmez; özellikle karmaşık parçalarda dolum problemleri, çökme izleri ve eğilme riskini önceden görmek için önerilir. Kapsamı teklif aşamasında belirlenir." },
      { question: "Alüminyum mı çelik kalıp mı seçmeliyim?", answer: "Düşük adetlerde alüminyum kalıp, yüksek adetlerde çelik kalıp genellikle daha ekonomiktir; eşik parça geometrisi, plastik malzeme ve beklenen üretim adedine göre teklif aşamasında belirlenir." },
    ],
    comparisonTables: [
      {
        title: "Enjeksiyon Kalıp Malzemesi Seçim Matrisi",
        description: "Kalıp çeliklerinin tipik sertlik değerleri; kalıp ömrü çelik, plastik malzeme ve üretim adedine göre teklifte belirtilir.",
        headers: ["Kalıp Malzemesi", "Sertlik", "Maliyet", "Uygulama"],
        rows: [
          ["Al 7075", "150 HB", "$", "Prototip, düşük hacim"],
          ["P20 (1.2311)", "280-320 HB", "$$", "Orta hacim, genel amaç"],
          ["H13 (1.2344)", "45-52 HRC", "$$$", "Yüksek hacim, sıcak iş"],
          ["S136 (1.2083)", "48-52 HRC", "$$$$", "Optik, medikal, korozyon"],
          ["NAK80", "38-42 HRC", "$$$", "Yüksek parlaklık, ön sertleştirilmiş"],
        ],
        highlight: 2,
      },
      {
        title: "Kavite Sayısı ve Üretim Verimliliği",
        description: "Kavite sayısı arttıkça birim maliyet düşer, kalıp yatırımı artar; doğru kavite sayısı parça ve adede göre teklifte belirlenir.",
        headers: ["Kavite", "Birim Maliyet", "Kalıp Maliyeti"],
        rows: [
          ["Tek kavite", "$$$", "$"],
          ["2 kavite", "$$", "$$"],
          ["4 kavite", "$$", "$$$"],
          ["8 kavite", "$", "$$$$"],
          ["16+ kavite", "$", "$$$$$"],
        ],
      },
    ],
  },
  {
    slug: "basincli-dokum",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Basınçlı Döküm",
    metaTitle: "Basınçlı Döküm Kalıp İmalatı | Alüminyum & Zamak | Mas Technic",
    metaDescription: "Alüminyum ve çinko basınçlı döküm kalıbı tasarımı ve üretimi. Duvar kalınlığı ve ham parça tolerans sınıfı alaşım ve geometriye göre teklifte belirtilir.",
    description:
      "Alüminyum ve çinko alaşımları ile karmaşık geometrileri tek parça olarak döküm. Yüksek üretim hızı ve düşük birim maliyet avantajı.",
    content: [
      "Basınçlı döküm kalıplarını parça geometrisine, alaşıma ve beklenen üretim adedine göre tasarlıyor ve üretiyoruz. Minimum duvar kalınlığı, ham parçanın tolerans sınıfı (ISO 8062 CT sınıfı nominal ölçüye göre değişir) ve döküm yüzeyi alaşıma, parça ölçüsüne ve kalıp tasarımına bağlıdır; değerler teklifte belirtilir. İşlenen yüzeyler teknik resimdeki toleransa göre ayrıca işlenir.",
      "ADC12 ve A380 (Al-Si) genel amaçlı ve yapısal parçalarda, ZA-8 ve ZA-27 (Zn-Al) ince duvarlı ve ağır yük uygulamalarında kullanılan döküm alaşımlarıdır; alaşım seçimi parçanın işlevine göre yapılır.",
      "Alüminyum, zamak ve magnezyum döküm kalıplarında dolum ve katılaşma davranışı kalıp tasarımında değerlendirilir; akış analizinin kapsamı teklifte belirtilir.",
    ],
    features: [
      "Kalıp Tasarımı — Parça büyüklüğü ve alaşıma göre",
      "İnce Duvarlı Parçalar — Duvar kalınlığı alaşım ve geometriye göre",
      "Ham Parça Toleransı — ISO 8062 CT sınıfı, nominal ölçüye göre",
      "Döküm Yüzeyi — Kalıp yüzeyine ve alaşıma bağlı",
    ],
    technicalSpecs: [
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
      { label: "Malzemeler", value: "ADC12, A380, ZA-8, ZA-27" },
      { label: "Kalıp Ömrü", value: "Teklifte belirtilir" },
      { label: "Tolerans", value: "CT sınıfı nominal ölçüye göre" },
    ],
    processSteps: [
      "Parça Analizi",
      "Kalıp Tasarımı",
      "Dolum ve Akış Değerlendirmesi",
      "Kalıp Üretimi",
      "Deneme Döküm",
      "Seri Üretim",
    ],
    advantages: [
      "Geniş alaşım seçeneği (Al, Zn, Mg)",
      "Dolum davranışı gözetilerek kalıp tasarımı",
      "İnce duvarlı parça kapasitesi",
      "Yüksek üretim hızı ve düşük birim maliyet",
    ],
    comparisonTables: [
      {
        title: "Basınçlı Döküm Alaşım Karşılaştırması",
        description: "Tipik literatür değerleri; tasarım için malzeme sertifikası esas alınır. Şirket kapasitesi değildir.",
        headers: ["Alaşım", "Çekme Dayanımı", "Yoğunluk", "Döküm Sıcaklığı", "Uygulama"],
        rows: [
          ["ADC12 (Al-Si)", "280 MPa", "2.74 g/cm³", "640-680°C", "Genel amaç, motor gövde"],
          ["A380 (Al-Si-Cu)", "320 MPa", "2.71 g/cm³", "650-700°C", "Yüksek dayanım, yapısal"],
          ["ZA-8 (Zn-Al)", "350 MPa", "6.3 g/cm³", "420-440°C", "İnce duvar, somun"],
          ["ZA-27 (Zn-Al)", "420 MPa", "5.0 g/cm³", "440-480°C", "Ağır yük, rulman"],
          ["AZ91D (Mg)", "230 MPa", "1.81 g/cm³", "620-650°C", "Hafif, elektronik muhafaza"],
        ],
      },
    ],
  },
  {
    slug: "silikon-kaliplama",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Silikon Kalıplama",
    metaTitle: "Silikon Kalıplama | Vakumlu Döküm | Kısa Seri | Mas Technic",
    metaDescription: "Vakumlu silikon kalıplama ile kısa seri üretim. PU, silikon, epoksi. Master modelden gözeneksiz yüzeyli çoğaltma; uygun adet teklifte belirtilir.",
    description:
      "Vakumlu silikon kalıplama ile kısa seri üretim. Master modelden gözeneksiz yüzeyli çoğaltma; uygun adet parça ve malzemeye göre teklifte belirtilir.",
    content: [
      "Vakum altında döküm, kalıp boşluğunda hava hapsini önleyerek gözeneksiz bir yüzey verir. PU, silikon, polyester ve epoksi malzemelerle üretim yapıyor, pigment ile renk seçeneği sunuyoruz.",
      "PU 60A (60 Shore A, esnek ve yırtılmaz), PU 80A (80 Shore A, orta sertlik), PU 90A (90 Shore A, yüksek dayanım) ve Silikon 40A (40 Shore A, yüksek sıcaklık dayanımlı) malzeme seçenekleri ile geniş uygulama yelpazesine hizmet veriyoruz.",
      "Overmolding ile farklı sertlikte malzemeleri birlikte kullanabiliyoruz. Medikal, otomotiv ve endüstriyel uygulamalar için özel silikon kalıplama çözümleri sunuyoruz. Termin; master modelin hazır olma durumuna, döküm adedine ve finisaj kapsamına göre teklifle birlikte verilir.",
    ],
    features: [
      "Vakumlu Döküm — hava hapsi olmadan gözeneksiz yüzey",
      "Çeşitli Malzemeler — PU, silikon, polyester, epoksi",
      "Renk Seçenekleri — Pigment ile istenilen renk",
      "Overmolding — Farklı sertlikte malzemeler birlikte",
    ],
    technicalSpecs: [
      { label: "Shore Sertlik", value: "40A-90A" },
      { label: "Tolerans", value: "Teklifte belirtilir" },
      { label: "Malzeme", value: "PU, LSR, HTV, EPDM" },
      { label: "Sıcaklık Dayanımı", value: "Seçilen malzemeye göre" },
      { label: "Lot Büyüklüğü", value: "Kısa seri" },
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
      "Master model onaylandıktan sonra kalıptan hızlı çoğaltma",
      "Kısa seri üretim",
      "4 farklı sertlik seçeneği",
      "Overmolding kapasitesi",
    ],
    comparisonTables: [
      {
        title: "Silikon Kalıplama Malzeme Karşılaştırması",
        description: "Tipik malzeme değerleri; seçilen ürünün teknik föyü esas alınır. Şirket kapasitesi değildir.",
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
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Yöntem", "Min. Adet", "Parça Maliyeti", "Kalıp Maliyeti", "Yüzey Kalitesi"],
        rows: [
          ["Vakumlu Döküm", "1", "$$", "$", "İyi (master'a bağlı)"],
          ["3D Baskı (SLA)", "1", "$$$", "Yok", "Çok iyi"],
          ["CNC İşleme", "1", "$$$$", "Yok", "Mükemmel"],
          ["Silikon Enjeksiyon", "500+", "$", "$$$", "Mükemmel"],
          ["Sıkıştırma Kalıplama", "100+", "$$", "$$", "İyi"],
        ],
      },
    ],
  },
  /* ══════════════════════════════════════════════════════════════════════
     09b-SOFTWARE-INVENTORY — THE CLASS IS DECIDED. ALL SIX, NOT NONE.

     Four sites on this page and two on `/endustriyel/ozel-projeler` named
     CATIA, SolidWorks and NX as the packages work is DESIGNED IN. They are
     gone; the capability they were attached to — 3D modelling, force and
     tolerance simulation, fixture design, solid model and manufacturing
     drawing — is unchanged, because that is what §1.3 permits and what a buyer
     needs.

     THE AUTHORITY. §D supplies no software inventory of any kind. §0 sets
     `DO_NOT_EMPHASIZE_COMPANY_SCALE`, and three seat-expensive enterprise CAD
     suites is a scale claim whatever else it is. Phase 06 removed named
     MACHINE MODELS under the same authority, and `claims-gate.mjs`'s
     `named-enterprise-system` rule already cites §D for ERP, MES and CAM.
     CAD authoring packages are that class; nothing distinguished them but
     the fact that nobody had taken the decision.

     THE FALSIFICATION THAT WAS INVITED, AND WHY IT DOES NOT SURVIVE
     ---------------------------------------------------------------
     It was put like this: a CAD package name is not exactly a machine model,
     because it tells a buyer something OPERATIONAL about file exchange in a
     way a machine model does not. That is the strongest argument for keeping
     them and it fails on this repository's own facts, three times over:

     1. THE OPERATIONAL FACT IS ALREADY PUBLISHED, AND MORE HONESTLY. The FAQ
        entry above — `question: "Hangi dosya formatlarını kabul ediyorsunuz?"`
        — derives the accepted list from `CAD_ACCEPTED_EXTENSIONS` and then
        names `.sldprt`, `.catpart` and `.prt` IN ORDER TO REFUSE THEM, with
        the email route that does work. A buyer who wants to know what happens
        to their CATIA file learns the answer there, and it is the true answer.
        The six sites added nothing to it.

     2. TWO OF THE SIX CONTRADICTED IT. `{ label: "CAD", value: "SolidWorks,
        CATIA, NX" }` is the same shape as `{ label: "Desteklenen CAD", value:
        "STEP, IGES, CATIA, NX, SW" }`, which Phase 09a deleted as D1c. A spec
        row labelled CAD listing three packages, on a page a buyer reads before
        uploading, reads as SUPPORTED INPUT — and the uploader refuses all
        three. So for that site the file-exchange argument is not a reason to
        keep it; it is the reason to remove it fastest.

     3. THE OTHER FOUR SAY NOTHING ABOUT FILE EXCHANGE AT ALL. "…ile 3D
        modelleme", "3D Modelleme (…)", "…ile profesyonel tasarım", "tasarım
        (…)" describe what WE model in. What we model in constrains what we can
        open; it does not tell a buyer what they may send, and on this site it
        actively misleads about it.

     WHAT IS LOST, STATED PLAINLY. A buyer who works in CATIA loses a signal
     that the shop is in the same ecosystem. That signal was worth something
     and it is not free to give up. It is given up because the site cannot
     support it — §D verifies no seat, no version and no license — and because
     the reader gets the true operational answer one page over instead.

     ALL SIX OR NONE was the condition, and it is all six: "CATIA, SolidWorks,
     NX entegre çalışma" and "CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX,
     Mastercam" were already deleted in Phase 09a on this same reasoning, so
     keeping any of the six would have left the site saying in one place what
     it had removed in another.

     THE GUARANTEE MOVED FROM A REGISTER TO A RULE.
     `DEFERRED_09B_SOFTWARE_INVENTORY` existed only to assert that the deferred
     sites still resolved. The class is decided, so its successor is the
     `named-cad-package` rule in `scripts/claims-gate.mjs`, whose positive
     controls are these six strings restored. "Still there" became "may not
     come back", which is strictly stronger.
     ══════════════════════════════════════════════════════════════════════ */
  {
    slug: "fikstur-aparat-tasarimi",
    category: "hizmetler",
    categoryLabel: "Ön Üretim",
    title: "Fikstür & Aparat Tasarımı",
    metaTitle: "Fikstür & Aparat Tasarımı | Özel CNC Fikstür | Mas Technic",
    metaDescription: "CNC işleme, montaj, kaynak ve kontrol için özel fikstür ve aparat tasarımı. 3D modelleme, bağlama kuvveti ve tolerans zinciri değerlendirmesi, üretim ortamında doğrulama.",
    description:
      "CNC işleme, montaj, kaynak ve kontrol operasyonları için özel tasarım fikstür ve aparat çözümleri. Tekrarlanabilirlik ve operatör bağımsızlığı.",
    content: [
      "Üretim süreçlerinizi hızlandıracak ve hassasiyeti artıracak özel fikstür ve aparatlar tasarlıyoruz. Torna fikstürü (parçayı dönme eksenine göre konumlayan ve tutan özel bağlama aparatları), freze fikstürü (vise, vakumlu ve hidrolik), montaj fikstürü (operatör hatalarını önleme), kontrol fikstürü (ölçüm tekrarlanabilirliği) ve kaynak fikstürü (hizalama ve sabitleme) dahil geniş yelpazede çözümler sunuyoruz.",
      "3D modelleme, bağlama kuvveti ve tolerans zinciri değerlendirmesi, 3D baskı veya hızlı imalat ile prototip üretimi ve üretim ortamında doğrulama test & onay adımlarıyla tasarım hizmeti veriyoruz.",
      "Çelik, alüminyum ve kompozit malzemelerle fikstürler üretiyoruz; fikstürün tekrarlanabilirlik hedefi parçanın tolerans zincirine göre belirlenir ve doğrulamada ölçülür. Tasarım ve üretim termini; fikstür karmaşıklığı, malzeme tedariki ve doğrulama kapsamı incelendikten sonra teklifle birlikte verilir.",
    ],
    features: [
      "Torna Fikstürü — Parçayı dönme eksenine göre konumlama ve tutma",
      "Freze Fikstürü — Vise, vakumlu ve hidrolik",
      "Montaj Fikstürü — Operatör hatalarını önleme",
      "Kontrol Fikstürü — Ölçüm tekrarlanabilirliği",
      "Kaynak Fikstürü — Hizalama ve sabitleme",
    ],
    technicalSpecs: [
      { label: "Tekrarlanabilirlik", value: "Tolerans zincirine göre" },
      { label: "Malzeme", value: "Çelik, Al, Kompozit" },
      { label: "Termin", value: LEAD_TIME_SHORT },
      { label: "Doğrulama", value: "Üretim ortamında test" },
    ],
    processSteps: [
      "İhtiyaç Analizi",
      "3D Modelleme",
      "Bağlama Kuvveti & Tolerans Değerlendirmesi",
      "Prototip (3D Baskı / Hızlı İmalat)",
      "CNC İşleme & Montaj",
      "Test & Onay",
    ],
    advantages: [
      "Katı model ve imalat resmi tek akışta",
      "Bağlama kuvveti ve tolerans zinciri değerlendirmesi",
      "3D baskı ile hızlı prototipleme",
      "Üretim ortamında doğrulama testi",
    ],
    comparisonTables: [
      {
        title: "Fikstür Tipi Seçim Rehberi",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Fikstür Tipi", "Bağlama Kuvveti", "Değişim Süresi", "Maliyet", "Uygulama"],
        rows: [
          ["Mekanik Mengene", "10-50 kN", "1-2 dk", "$", "Genel frezeleme"],
          ["Hidrolik Bağlama", "20-100 kN", "10-20 sn", "$$$", "Seri üretim, otomatik"],
          ["Pnömatik Bağlama", "5-30 kN", "5-10 sn", "$$", "Hafif parçalar, hızlı"],
          ["Vakumlu Bağlama", "1-10 kN", "5 sn", "$$", "İnce plaka, hassas"],
          ["Manyetik Tablo", "5-20 kN", "3 sn", "$$", "Ferromanyetik, taşlama"],
          ["Modüler Fikstür", "Değişken", "15-30 dk", "$$$$", "Çok amaçlı, esnek"],
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
    metaTitle: "Mekanik Yüzey İşlemleri | Kumlama & Parlatma | Mas Technic",
    metaDescription: "Kumlama, vibrasyonlu yüzey bitirme, parlatma ve fırçalama. Ayna parlaklığından satine yüzeye kadar seçenek; ulaşılabilir yüzey kalitesi malzemeye göre teklifte belirtilir.",
    description:
      "Kumlama, vibrasyonlu yüzey bitirme, parlatma ve fırçalama ile yüzey kalitesini iyileştirme ve montaja hazır hale getirme. Pasivasyon kimyasal bir işlemdir ve Kimyasal İşlemler sayfasında anlatılır.",
    content: [
      "Mekanik yüzey işlemleri ile parçalarınızın yüzey kalitesini istenen seviyeye getiriyoruz. Kumlama (shot blasting) ile temizleme ve yüzey pürüzlendirme, vibrasyonlu yüzey bitirme (tumbling) ile köşeli kısımları kırma, merkezsiz parlatma ile yuvarlak parçalar için yüzey iyileştirme, yüzey parlatma ile ayna parlaklığı ve fırçalama ile satine yüzey efekti elde ediyoruz.",
      "Cam kumu ile hassas temizlik, alüminyum oksit ile yüzey hazırlık, çelik grit ile ağır temizlik ve soda ile yumuşak temizlik gibi farklı aşındırıcılarla çalışıyoruz; medya ve tane boyutu parça malzemesine ve hedef yüzeye göre seçilir.",
      "Ulaşılabilir yüzey kalitesi ve proses parametreleri malzemeye ve geometrisine göre belirlenir. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "Kumlama (Shot Blasting) — Temizleme ve yüzey pürüzlendirme",
      "Vibrasyonlu Yüzey Bitirme (Tumbling) — Köşeli kısımları kırma",
      "Merkezsiz Parlatma — Yuvarlak parçalar için",
      "Yüzey Parlatma — Ayna parlaklığı",
      "Fırçalama — Satine yüzey efekti",
    ],
    technicalSpecs: [
      { label: "Parlatma Seviyesi", value: "Ayna parlaklığı" },
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
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
      "Medya seçimi parça malzemesine göre",
    ],
    comparisonTables: [
      {
        title: "Mekanik Yüzey İşlem Yöntemleri Karşılaştırması",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Yöntem", "Yüzey Kalitesi (Ra)", "İşlem Süresi", "Maliyet", "Uygulama"],
        rows: [
          ["Kumlama (Cam Kumu)", "Ra 1.6-3.2µm", "5-15 dk", "$", "Temizleme, pürüzlendirme"],
          ["Kumlama (Al₂O₃)", "Ra 2.0-4.0µm", "5-15 dk", "$", "Boya öncesi hazırlık"],
          ["Vibrasyonlu Yüzey Bitirme", "Ra 0.4-1.6µm", "30-120 dk", "$", "Çapak alma, köşe kırma"],
          ["Merkezsiz Parlatma", "Ra 0.1-0.4µm", "10-30 dk", "$$", "Mil, pim parlatma"],
          ["Mekanik Parlatma", "Ra 0.05-0.2µm", "15-60 dk", "$$$", "Ayna parlaklığı"],
          ["Fırçalama", "Ra 0.4-1.2µm", "5-10 dk", "$", "Satine efekt, dekoratif"],
        ],
      },
      {
        title: "Abrasive Medya Seçim Tablosu",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
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
    /* PHASE 07 CORRECTION #1 — F2. `20+ renk seçeneği` was an offering /
       inventory count, structurally the same claim as `15+ alüminyum
       alaşımı` (removed in Phase 07) and `87+ malzeme` — §0
       DO_NOT_EMPHASIZE_COMPANY_SCALE, and no count is verified anywhere in
       `USER_INPUTS.md`. The colours themselves are a real offering and are
       still named; what goes is the number in front of them. ΔE ≤ 2.0 is a
       measured homogeneity tolerance and stays. */
    metaDescription: "Tip I, II ve III (sert) anodizasyon, organik ve inorganik boyalarla renklendirme. Tabaka kalınlığı, sertlik ve korozyon testi gereksinimi şartname ve alaşıma göre belirlenir.",
    description:
      "Tip I kromik asit, Tip II sülfürik asit ve Tip III sert anodizasyon ile korozyon direnci, aşınma dayanımı, elektriksel yalıtım ve dekoratif kaplama.",
    content: [
      "Anodizasyon, alüminyum yüzeyinde elektrokimyasal yöntemle oluşturulan alüminyum oksit (Al₂O₃) tabakasıdır. Bu tabaka, parçanın korozyon direncini, aşınma dayanımını ve estetik görünümünü önemli ölçüde artırır. Mas Technic olarak havacılık ve medikal uygulamalar için Tip I, Tip II ve Tip III anodizasyon hizmeti sunuyoruz.",
      "MIL-A-8625'e göre Tip I (kromik asit) ince bir oksit tabakası oluşturur; boya tutunma alt katmanı olarak tercih edilir. Tip II (sülfürik asit) en yaygın kullanılan türdür; korozyon koruması, renkli kaplama ve genel mühendislik uygulamalarında kullanılır. Tip III (sert anodizasyon) daha kalın ve daha sert bir tabaka oluşturur; aşınma direnci ve elektriksel yalıtım gerektiren yüzeylerde kullanılır. Tabaka kalınlığı ve sertlik alaşıma ve şartnameye göre belirlenir; kaplama sertliği Vickers (HV) ile ifade edilir — HRC ana malzemenin sertliği içindir.",
      "Renklendirme sürecimizde organik ve inorganik boyalar kullanarak siyah, kırmızı, mavi, yeşil, altın, bronz, mor, turuncu, sarı, füme ve naturel (renksiz) renklerde kaplama yapıyoruz; özel RAL ve Pantone eşleştirmesi de mümkündür. Renk toleransı şartnameye göre tanımlanır. Sealing (sızdırmazlık) işlemi ile oksit tabakasının gözenekleri kapatılarak koruma artırılır.",
      "Kaplama kalınlığı, sertlik ve renk kontrolünün yöntemi ve kabul kriteri kontrol planında tanımlanır; korozyon testi (ör. ASTM B117) şartnamede isteniyorsa uygulanır. Her parti için ölçüm kaydı tutulur.",
      "Parça boyutu ve ağırlığına göre uygulanabilirlik teklif aşamasında belirlenir. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "Tip I (Kromik Asit) — İnce oksit tabakası, boya alt katmanı",
      "Tip II (Sülfürik Asit) — Korozyon koruması, renkli kaplama",
      "Tip III (Sert Anodizasyon) — Kalın ve sert tabaka, aşınma direnci",
      "Renklendirme — Organik ve inorganik boyalar",
      "Tip I / II / III — MIL-A-8625 kaplama sınıfları",
      "ASTM B117 Tuz Testi — Şartnamede isteniyorsa",
    ],
    technicalSpecs: [
      { label: "Tabaka kalınlığı", value: "Şartnameye göre" },
      { label: "Tabaka sertliği", value: "HV; alaşım ve prosese göre" },
      { label: "Tuz Testi", value: "ASTM B117; şartnameye göre" },
      { label: "Kaplama Sınıfı", value: "MIL-A-8625 Tip I / II / III" },
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
      { label: "Renk Toleransı", value: "Şartnameye göre" },
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
      "Şartnamede isteniyorsa ASTM B117 tuz testi",
      "Organik ve inorganik boyalarla dekoratif ve fonksiyonel kaplama",
      "Termin, parti büyüklüğü ve kaplama sınıfına göre teklifle birlikte verilir",
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
      { question: "Sert anodizasyon (Tip III) ile normal (Tip II) farkı nedir?", answer: "Tip III sert anodizasyon, Tip II'ye göre daha kalın ve daha sert bir tabaka oluşturur; aşınma direnci ve elektriksel yalıtım gerektiğinde tercih edilir. Tip II genel korozyon koruması ve dekoratif kaplama için uygundur. Kalınlık ve sertlik değerleri şartname ve alaşıma göre belirlenir." },
      { question: "Anodizasyon boyut değişikliğine neden olur mu?", answer: "Evet. Sülfürik anodizasyonda oksit tabakasının yaklaşık yarısı malzemeye nüfuz eder, yarısı yüzeyden dışarı büyür; sert anodizasyonda oran farklıdır. Bu nedenle her yüzeyde tabaka kalınlığının bir kısmı kadar, bir çapta ise bunun iki katı kadar ölçü artışı olur. Kesin pay, maskeleme ve tolerans planıyla birlikte işlem öncesinde belirlenir." },
      { question: "Hangi renklerde anodizasyon yapabiliyorsunuz?", answer: "Siyah, kırmızı, mavi, yeşil, altın, bronz, mor, turuncu, sarı, füme ve naturel (renksiz) renklerde çalışıyoruz. Özel RAL ve Pantone renk eşleştirmesi de yapabiliyoruz; renk toleransı şartnameye göre tanımlanır." },
      { question: "Kaplama ne kadar dayanıklıdır?", answer: "Dayanım; anodizasyon tipine, tabaka kalınlığına ve sealing işlemine bağlıdır. Korozyon testi (ör. ASTM B117) ve kabul kriteri şartnameye göre belirlenir; sert anodizasyon aşınma direnci gereken yüzeyler için tercih edilir." },
      { question: "Anodizasyon teslimat süreniz ne kadar?", answer: `Termin parti büyüklüğüne, kaplama sınıfına ve renklendirme adımının olup olmamasına göre değişir. ${LEAD_TIME_STATEMENT}` },
    ],
    comparisonTables: [
      {
        title: "Anodizasyon Tipleri Karşılaştırması",
        description: "Tipler MIL-A-8625'e göredir; tabaka kalınlığı, sertlik (HV) ve korozyon testi gereksinimi alaşım ve şartnameye göre belirlenir.",
        headers: ["Özellik", "Tip I (Kromik Asit)", "Tip II (Sülfürik Asit)", "Tip III (Sert Anodizasyon)"],
        rows: [
          ["Renklendirme", "Sınırlı", "Tam renk aralığı", "Sınırlı (siyah, koyu tonlar)"],
          ["Elektriksel Yalıtım", "Orta", "İyi", "Yüksek"],
          ["Aşınma Direnci", "Düşük", "Orta", "Yüksek"],
          ["Uygun Uygulama", "Havacılık yapısal, boya altı", "Genel mühendislik, dekoratif", "Silindir, piston, mil yüzeyleri"],
          ["Standart", "MIL-A-8625 Tip I", "MIL-A-8625 Tip II", "MIL-A-8625 Tip III"],
          ["Maliyet", "$", "$$", "$$$"],
        ],
      },
      {
        title: "Alüminyum Alaşımlarının Anodize Uyumluluğu",
        description: "Alaşım seçiminin anodizasyon kalitesi üzerindeki etkisi",
        headers: ["Alaşım", "Renk Homojenliği", "Kaplama Kalitesi", "Önerilen Tip", "Notlar"],
        rows: [
          ["6061-T6", "Mükemmel", "Homojen, pürüzsüz", "Tip I, II, III", "En yaygın, ideal anodize malzemesi"],
          ["7075-T6", "İyi", "Hafif ton farkı olabilir", "Tip II, III", "Zn içeriği renk tonunu etkileyebilir"],
          ["5083", "İyi", "Homojen", "Tip II", "Denizcilik, iyi korozyon direnci"],
          ["2024-T3", "Orta", "Bakır çizgileri görülebilir", "Tip I, II", "Cu içeriği renk homojenliğini bozabilir"],
          ["A356 (Döküm)", "Düşük", "Gözenekli, düzensiz", "Tip II", "Döküm kalitesi kritik, ön işlem gerekir"],
          ["MIC-6 (Döküm)", "Orta", "Kabul edilebilir", "Tip II", "Hassas döküm plakalar için uygun"],
        ],
      },
    ],
  },
  {
    slug: "kimyasal-islemler",
    category: "hizmetler",
    categoryLabel: "Yüzey İşlemleri",
    title: "Kimyasal İşlemler",
    metaTitle: "Kimyasal Yüzey İşlemleri | Pasivasyon & Fosfatlama | Mas Technic",
    metaDescription: "Endüstriyel yağ giderme, pasivasyon, fosfatlama ve elektropolish. ASTM B117 tuz spreyi ve ASTM A967 pasivasyon test yöntemleri ile doğrulama.",
    description:
      "Yağ giderme, pasivasyon, fosfatlama ve elektropolish ile yüzey temizliği ve sonraki işlemlere hazırlık.",
    content: [
      "Kimyasal yüzey işlemleri ile parçalarınızın korozyon direncini artırıyoruz. Endüstriyel yıkama ve ultrasonik yağ giderme, paslanmaz çelik korozyon koruması için pasivasyon, boya tutunması için fosfatlama yüzey hazırlığı, paslanmaz çelik parlatma için elektropolish ve köşeli kısımları yumuşatma için deburring işlemleri gerçekleştiriyoruz.",
      "Doğrulama yöntemi — örneğin ASTM B117 tuz spreyi veya ASTM A967 pasivasyon testleri — ve kabul kriteri şartnameye göre belirlenir. Tabaka kalınlığı işleme göre değişir: pasivasyon ölçülebilir bir kaplama bırakmaz; fosfatlamada kalınlık şartnameye göre belirlenir.",
    ],
    features: [
      "Yağ Giderme — Endüstriyel yıkama, ultrasonik",
      "Pasivasyon — Paslanmaz çelik korozyon koruması",
      "Fosfatlama — Boya tutunması için yüzey hazırlığı",
      "Elektropolish — Paslanmaz çelik parlatma",
      "Deburring — Köşeli kısımları yumuşatma",
    ],
    technicalSpecs: [
      { label: "Tuz Testi", value: "ASTM B117; şartnameye göre" },
      { label: "Tabaka kalınlığı", value: "İşleme ve şartnameye göre" },
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
      "Korozyon testi gereksiniminin şartnameye göre tanımlanması",
      /* Was "ASTM standartlarına tam uyum". Claiming full conformity to an
         entire standards body is broader than claiming it against one numbered
         spec — and the numbered version of this same sentence was removed from
         this page two commits ago. The page's own content line already names
         what actually happens: the two test methods. */
      "Tuz spreyi ve pasivasyon test yöntemleriyle doğrulama",
      "Ultrasonik temizlik kapasitesi",
      "Sonraki işlemlere hazır yüzey",
    ],
    comparisonTables: [
      {
        title: "Kimyasal Yüzey İşlem Yöntemleri",
        description: "Standartlar ve işlem türleri; tabaka kalınlığı ve korozyon testi gereksinimi şartnameye göre belirlenir.",
        headers: ["İşlem", "Uygulanan Malzeme", "Kaplama/Etki", "Standart", "Uygulama"],
        rows: [
          ["Pasivasyon (Nitrik)", "Paslanmaz çelik", "Pasif oksit (kaplama bırakmaz)", "ASTM A967", "Medikal, gıda"],
          ["Pasivasyon (Sitrik)", "Paslanmaz çelik", "Pasif oksit (kaplama bırakmaz)", "ASTM A967", "Çevreci alternatif"],
          ["Fosfatlama (Çinko)", "Çelik", "Çinko fosfat dönüşüm tabakası", "MIL-DTL-16232", "Boya altı hazırlık"],
          ["Fosfatlama (Mangan)", "Çelik", "Mangan fosfat dönüşüm tabakası", "MIL-DTL-16232", "Aşınma direnci, yağ tutma"],
          ["Elektropolish", "Paslanmaz çelik", "Yüzey düzeltme", "ASTM B912", "Medikal, gıda, optik"],
          ["Alodine (Chromate)", "Alüminyum", "Kromat dönüşüm tabakası", "MIL-DTL-5541", "Boya altı, iletkenlik"],
        ],
      },
    ],
  },
  {
    slug: "boya-koruyucu-kaplamalar",
    category: "hizmetler",
    categoryLabel: "Yüzey İşlemleri",
    title: "Boya & Koruyucu Kaplamalar",
    metaTitle: "Toz Boya & Koruyucu Kaplamalar | RAL Renkler | Mas Technic",
    metaDescription: "Toz boya, ıslak boya, seramik ve PTFE kaplama; RAL standart ve özel renkler. Korozyon testi ve sıcaklık dayanımı gereksinimi kaplama sistemine ve şartnameye göre belirlenir.",
    description:
      "Toz boya, ıslak boya, seramik kaplama ve özel koruyucu kaplamalar. Endüstriyel uygulamalardan dekoratif yüzeylere kadar.",
    content: [
      "Toz boya (çevre dostu ve dayanıklı), ıslak boya (düzgün yüzey), seramik kaplama (yüksek sıcaklık dayanımı) ve E-kap (elektriksel yalıtım) olmak üzere dört boya türü ile hizmet veriyoruz. Kaplama kalınlığı şartnameye ve parçaya göre belirlenir.",
      "RAL 9005 (Siyah), 9010 (Beyaz), 9006 (Gri), 3000 (Kırmızı), 5015 (Mavi), 6018 (Yeşil), 1003 (Sarı), 2004 (Turuncu) ve özel RAL renkleri dahil geniş renk yelpazesi sunuyoruz. Korozyon ve sıcaklık dayanımı kaplama sistemine bağlıdır; tuz spreyi süresi gibi test gereksinimleri teklif aşamasında şartnameye göre netleştirilir.",
    ],
    features: [
      "Toz Boya — Çevre dostu ve dayanıklı",
      "Islak Boya — Düzgün yüzey",
      "Seramik Kaplama — Yüksek sıcaklık",
      "E-Kap — Elektriksel yalıtım",
    ],
    technicalSpecs: [
      { label: "Kaplama kalınlığı", value: "Şartnameye göre" },
      { label: "Tuz Testi", value: "ASTM B117; şartnameye göre" },
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
      "Korozyon testi gereksiniminin şartnameye göre tanımlanması",
      "PTFE kaplama ile yapışmazlık ve düşük sürtünme",
    ],
    comparisonTables: [
      {
        title: "Boya & Kaplama Türleri Karşılaştırması",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Kaplama Türü", "Kalınlık", "Sıcaklık Dayanımı", "Sürtünme Kats.", "Uygulama"],
        rows: [
          ["Toz Boya (Polyester)", "60-120µm", "180°C", "0.30-0.40", "Dış mekan, dekoratif"],
          ["Toz Boya (Epoksi)", "60-100µm", "120°C", "0.35-0.45", "İç mekan, kimyasal direnci"],
          ["Islak Boya (2K PU)", "25-50µm", "130°C", "0.30-0.40", "Düzgün yüzey, ince kaplama"],
          ["Seramik Kaplama", "50-100µm", "1000°C", "0.15-0.25", "Egzoz, motor, yüksek sıcaklık"],
          ["PTFE (Teflon)", "15-40µm", "260°C", "0.05-0.10", "Yapışmazlık, düşük sürtünme"],
          ["E-Kap (Elektro Kaplama)", "20-40µm", "150°C", "0.35-0.45", "Otomotiv, elektrik yalıtım"],
          ["DLC (Diamond-Like)", "1-5µm", "350°C", "0.05-0.15", "Aşınma, medikal, uzay"],
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
    metaDescription: "Fiber lazer ile metal, plastik ve ahşapta kalıcı işaretleme: barkod, QR kod, seri numarası, logo. Karakter boyutu ve derinlik malzemeye göre belirlenir.",
    description:
      "Fiber lazer teknolojisi ile metal, plastik ve kompozit malzemelere yüksek kontrastlı, aşınmaz işaretleme. Barkod, QR kod ve seri numarası.",
    content: [
      "Fiber lazer ile seri numarası, barkod, QR kod ve logo işaretlemesi yapıyoruz. İşaretleme alanı, minimum karakter boyutu ve kazıma derinliği malzemeye, yüzeye ve kodun okunabilirlik gereksinimine göre belirlenir.",
      "Çelik, alüminyum, plastik ve ahşap gibi farklı malzemelerde işaretleme yapılabilir; yuvarlak parçalarda dinamik işaretleme uygulanır.",
      "Seri numarası ve parti kodu, barkod ve QR kod, logo ve marka, teknik özellikler ve standartlar ile tarih ve üretim kodu işaretleme hizmetleri sunuyoruz.",
    ],
    features: [
      "Kazıma Derinliği Kontrolü — Malzemeye göre ayarlanır",
      "Çok Malzeme — Çelik, alüminyum, plastik, ahşap",
      "Dinamik İşaretleme — Yuvarlak parçalar için",
    ],
    technicalSpecs: [
      { label: "Yöntem", value: "Fiber lazer işaretleme" },
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
    ],
    processSteps: [
      "Tasarım & Programlama",
      "Malzeme Analizi",
      "Parametre Ayarlama",
      "Lazer İşaretleme",
      "Okuma Doğrulama",
    ],
    advantages: [
      "Çoklu malzeme desteği",
      "Dinamik (yuvarlak parça) işaretleme",
    ],
    comparisonTables: [
      {
        title: "Lazer İşaretleme Teknoloji Karşılaştırması",
        description: "Lazer türlerinin genel karşılaştırması; şirket ekipman listesi veya kapasitesi değildir.",
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
        description: "Başlangıç parametreleri için genel referans; parametre parça ve yüzeye göre denemeyle belirlenir.",
        headers: ["Malzeme", "Önerilen Lazer", "Güç", "Hız", "Kontrast", "Notlar"],
        rows: [
          ["Paslanmaz Çelik", "Fiber / MOPA", "20-50W", "500-2000 mm/s", "Yüksek", "Tavlama: koyu oksit işareti, malzeme kaldırmaz; açık renkli işaret kazımayla olur ve malzeme kaldırır"],
          ["Alüminyum", "Fiber", "30-60W", "800-3000 mm/s", "Orta-Yüksek", "Eloksallı yüzeyde lazer eloksal tabakasını kaldırır; işaret açık renkli ve kontrastlıdır"],
          ["Titanyum", "Fiber / MOPA", "20-40W", "300-1500 mm/s", "Yüksek", "Renkli tavlama mümkün"],
          ["ABS Plastik", "Fiber / UV", "5-20W", "1000-5000 mm/s", "Orta", "Renk değişimi ile"],
          ["Cam", "UV / CO₂", "3-10W", "200-800 mm/s", "Orta", "Mikro çatlak tekniği"],
          ["Sertleştirilmiş Çelik", "Fiber", "30-80W", "300-1000 mm/s", "Çok yüksek", "Derin kazıma mümkün"],
        ],
      },
    ],
  },
  {
    /* T01 — one process. The record used to mix furnace stress relief,
       soft/full annealing, normalising, carburising and induction hardening
       (with temperatures and HRC values) into the laser-marking family, then
       described laser annealing in a second paragraph. Only the laser
       annealing marking method is published here; no heat-treatment capacity
       is claimed. The URL stays `/hizmetler/tavlama`. */
    slug: "tavlama",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "Lazer Tavlama ile Markalama",
    metaTitle: "Lazer Tavlama ile Markalama | Mas Technic",
    metaDescription:
      "Paslanmaz çelik ve titanyum parçalarda yüzeyden malzeme kaldırmadan, ısıl renk değişimiyle okunabilir işaretleme. Kapsam parça ve malzemeye göre teklifte belirtilir.",
    description:
      "Lazer tavlama, yüzeyden malzeme kaldırmadan ısıl renk değişimiyle yapılan bir lazer işaretleme yöntemidir; özellikle paslanmaz çelik ve titanyum parçalarda kullanılır.",
    content: [
      "Lazer tavlama ile markalamada lazer yüzeyi kazımaz; yüzeyi yerel olarak ısıtır ve oluşan ince oksit tabakası işareti koyu ya da renkli bir ton olarak görünür kılar. Yüzeyden malzeme kaldırılmadığı için yüzey bütünlüğü korunur.",
      "Yöntem, özellikle paslanmaz çelik ve titanyum parçalarda seri numarası, parti kodu, logo ve okunabilir kod işaretlemesi için tercih edilir. Elde edilen ton malzemeye ve yüzey durumuna göre değişir.",
      "Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "Malzeme kaldırmadan işaretleme — Yüzey kazınmaz, ısıl renk değişimi oluşur",
      "Paslanmaz çelik ve titanyum — Yöntemin tipik uygulama alanı",
      "İzlenebilirlik işaretleri — Seri numarası, parti kodu, logo ve okunabilir kod",
    ],
    technicalSpecs: [
      { label: "Yöntem", value: "Lazerle ısıl renk değişimi" },
      { label: "Yüzey etkisi", value: "Malzeme kaldırılmaz" },
      { label: "Tipik malzeme", value: "Paslanmaz çelik, titanyum" },
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
    ],
    processSteps: [
      "Malzeme ve Yüzey Kontrolü",
      "İşaret İçeriği ve Konum Onayı",
      "Parametre Denemesi",
      "Lazer Tavlama İşaretlemesi",
      "Okunabilirlik Kontrolü",
    ],
    advantages: [
      "Yüzey bütünlüğü korunur",
      "Kazıma olmadan okunabilir işaret",
      "Paslanmaz çelik ve titanyumda uygulanabilir",
    ],
  },
  {
    slug: "qr-datamatrix-kodlari",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "QR & DataMatrix Kodları",
    description:
      "DataMatrix ve QR kod işaretleme. Küçük alanda yüksek veri kapasitesi ile kalıcı parça izlenebilirliği.",
    content: [
      "DataMatrix, QR Code ve GS1-128 barkod formatlarında endüstriyel izlenebilirlik için kalıcı kod işaretleme hizmeti sunuyoruz. Kod boyutu ve veri kapasitesi; veri içeriğine, modül boyutuna ve okunabilirlik gereksinimine göre belirlenir.",
      "UID (Unique Identifier), GS1-128 Barkod, HIBC (Health Industry Bar Code) ve DoD IUID (Item Unique Identification) kodlama seçenekleri ile parça takibi, kalite kontrol ve envanter yönetimi çözümleri sağlıyoruz. İşaretlenen kodların okunabilirliği, teslimattan önce okuma doğrulamasıyla kontrol edilir.",
    ],
    features: [
      "DataMatrix — Küçük alanda yüksek veri yoğunluğu",
      "QR Code — Hızlı okuma, geniş uyumluluk",
      "GS1-128 Barkod — Standart barkod",
      "IUID Kodlama — Savunma sanayi izlenebilirlik",
    ],
    technicalSpecs: [
      { label: "Sembol", value: "DataMatrix (ISO/IEC 16022)" },
      { label: "Doğrulama", value: "ISO 15415" },
    ],
    processSteps: [
      "Kod Türü Seçimi",
      "Veri Girişi & Format",
      "Lazer İşaretleme",
      "Okuma Doğrulama",
      /* Was "ISO Uyum Raporu" — a conformity report against a standards body
         with no designation, which is the same claim as the bullet below and
         was invisible to the gate for the same reason. What the step produces
         is a read-quality record. */
      "Okuma Kalitesi Raporu",
    ],
    advantages: [
      "Küçük alanda yüksek veri kapasitesi",
      /* Was "ISO/IEC standartlarına tam uyum" — see the ASTM bullet on the
         chemical-processing page. The numbered version of this sentence
         (ISO/IEC 16022, ISO 15415) was already rewritten to read-verification;
         the unbounded version survived on the same page. */
      "Lazer işaretleme sonrası okuma doğrulaması",
      "Savunma sanayi IUID desteği",
    ],
    comparisonTables: [
      {
        title: "Endüstriyel Kod Türleri Karşılaştırması",
        description: "Veri kapasitesi, standardın izin verdiği en büyük sembol içindir; gerçek kod boyutu veri içeriğine ve modül boyutuna göre belirlenir.",
        headers: ["Kod Türü", "Veri Kapasitesi", "Uygulama"],
        rows: [
          ["DataMatrix (ECC200)", "2.335 alfanümerik", "Küçük parça, havacılık"],
          ["QR Code", "4.296 alfanümerik", "Genel, mobil okuma"],
          ["GS1-128 Barkod", "48 karakter", "Lojistik, stok yönetimi"],
          ["Micro QR", "35 alfanümerik", "Çok küçük parçalar"],
          ["PDF417", "1.850 alfanümerik", "Belge, sertifika"],
          ["UID / IUID", "Değişken", "Savunma, askeri"],
        ],
      },
    ],
  },
  {
    slug: "logo-markalama",
    category: "hizmetler",
    categoryLabel: "İşaretleme & Tanımlama",
    title: "Logo & Markalama",
    description:
      "Lazer, pad printing ve serigrafi ile ürünlerinize marka kimliği kazandırın. Kalıcı ve profesyonel görünüm.",
    content: [
      "Lazer işaretleme (kalıcı, yüksek kontrast, metal ve plastik), pad printing (kavisli yüzeyler, çok renkli), serigrafi (büyük yüzeyler, yüksek hacim) ve etiket (geçici, değiştirilebilir) olmak üzere 4 farklı markalama yöntemi sunuyoruz.",
      "Logo ve marka işaretlemesinde konum ve ölçü, teknik resimdeki işaret detayına göre uygulanır; işaretleme alanı ve çözünürlük malzemeye göre belirlenir.",
    ],
    features: [
      "Lazer — Kalıcı, yüksek kontrast, metal/plastik",
      "Pad Printing — Kavisli yüzeyler, çok renkli",
      "Serigrafi — Büyük yüzeyler, yüksek hacim",
      "Etiket — Geçici, değiştirilebilir",
    ],
    technicalSpecs: [
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
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
      "Çözünürlük ve işaret detayı malzemeye göre",
      "Kavisli yüzeylerde pad printing",
      "Numune onayından sonra tekrarlanabilir seri işaretleme",
    ],
    comparisonTables: [
      {
        title: "Markalama Yöntemleri Karşılaştırması",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Yöntem", "Dayanıklılık", "Renk", "Yüzey Tipi", "Maliyet/Parça"],
        rows: [
          ["Lazer İşaretleme", "Kalıcı", "Tek ton", "Düz/kavisli", "$$"],
          ["Pad Printing", "İyi", "Çok renkli", "Kavisli ideal", "$"],
          ["Serigrafi", "İyi", "Çok renkli", "Düz yüzey", "$"],
          ["Etiket (Vinil)", "Orta", "Full color", "Düz", "$"],
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
    description:
      "Metal insertlerin plastik ve metal parçalara ultrasonik, ısıl veya presle montajı. Somun, perçin ve pim uygulama.",
    content: [
      "Ultrasonik insert (plastik için, hızlı ve temiz), ısıl insert (yüksek çekme direnci), pres insert / self-tapping (ekonomik çözüm) ve mold-in insert (en yüksek dayanım) olmak üzere 4 farklı insert uygulama yöntemi sunuyoruz.",
      "Pirinç (nikel kaplamalı, genel amaçlı), çelik (çinko kaplamalı, yüksek dayanım) ve paslanmaz (kaplamasız, korozyon direnci) insert malzemeleriyle bağlantılar oluşturuyoruz. Diş ölçüsü, çekme dayanımı ve çevrim süresi insert tipine, parça malzemesine ve uygulama yöntemine göre belirlenir.",
    ],
    features: [
      "Ultrasonik Insert — Plastik için, hızlı ve temiz",
      "Isıl Insert — Yüksek çekme direnci",
      "Pres Insert (Self-tapping) — Ekonomik çözüm",
      "Mold-in Insert — En yüksek dayanım",
    ],
    technicalSpecs: [
      { label: "Yöntem", value: "Ultrasonik / Isıl / Pres" },
      { label: "Çekme dayanımı", value: "Insert tipine göre" },
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
      "Çevrim süresi insert tipine ve yönteme göre",
    ],
    comparisonTables: [
      {
        title: "Insert Uygulama Yöntemleri Karşılaştırması",
        description: "Genel referans değerleridir; şirket kapasitesini göstermez. Parçanız için geçerli değer teklifte belirtilir.",
        headers: ["Yöntem", "Uygun Malzeme", "Maliyet", "Avantaj"],
        rows: [
          ["Ultrasonik", "Termoplastik", "$$", "Hızlı, temiz, tekrarlanabilir"],
          ["Isıl (Heat Staking)", "Termoplastik", "$$", "Yüksek çekme direnci"],
          ["Pres (Self-tapping)", "Plastik, hafif metal", "$", "Ekonomik, hızlı"],
          ["Mold-in", "Enjeksiyon plastik", "$$$", "En yüksek dayanım"],
          ["Yapıştırıcı", "Tüm malzemeler", "$", "Esnek, düşük gerilme"],
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
    description:
      "Vida, somun, perçin ve klips montajı. Tork kontrollü sıkma ve otomatik besleme sistemleri ile yüksek verimlilik.",
    content: [
      "Vida ve somun montajı (tork kontrollü), perçin montajı, klips ve segman montajı (otomatik besleme), rulman montajı (özel fikstürlerle) ve O-ring/conta montajı (yağ ve toz korumalı) hizmetleri sunuyoruz.",
      /* F2: `1000+ ünite/gün` is a daily production volume — §D
         REVENUE_OR_ORDER_VOLUME. The torque values and the ±5% band are
         process specification and stay. */
      "Tork değerleri bağlantı elemanının boyutuna, sınıfına ve şartnameye göre belirlenir ve tork kontrollü sıkma ile uygulanır. Her montaj fonksiyon testinden geçer ve seri numarası bazlı takip sistemine kaydedilir.",
    ],
    features: [
      "Vida & Somun Montajı — Tork kontrollü",
      "Perçin Montajı — Kalıcı bağlantılar",
      "Klips & Segman Montajı — Otomatik besleme",
      "Rulman & O-ring Montajı — Özel fikstürlerle",
    ],
    technicalSpecs: [
      { label: "Tork Kontrolü", value: "Şartnameye göre" },
      { label: "Test", value: "Fonksiyon testi" },
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
      "Tork kontrollü sıkma",
      "Otomatik besleme sistemi ile yüksek verimlilik",
      "Dijital tork metre ile doğrulama",
      "Seri numarası bazlı izlenebilirlik",
    ],
    comparisonTables: [
      {
        title: "Bağlantı Elemanı Tork Değerleri (Kuru, Sınıf 8.8)",
        description: "Genel referans değerleri (kuru, sınıf 8.8); uygulanacak tork değeri şartnameye ve bağlantı tasarımına göre belirlenir.",
        headers: ["Vida Boyutu", "Tork (Nm)", "Ön Yükleme (kN)", "Anahtar Boyutu", "Kontrol Yöntemi"],
        rows: [
          ["M3", "1.5-2.0", "2.5", "5.5mm", "Dijital tork metre"],
          ["M4", "3.0-4.0", "4.5", "7mm", "Dijital tork metre"],
          ["M5", "6.0-8.0", "8.0", "8mm", "Tork anahtarı"],
          ["M6", "10.0-12.0", "12.0", "10mm", "Tork anahtarı"],
          ["M8", "25.0-30.0", "22.0", "13mm", "Tork anahtarı"],
          ["M10", "50.0-60.0", "35.0", "17mm", "Elektronik tork"],
          ["M12", "85.0-100.0", "50.0", "19mm", "Elektronik tork"],
        ],
      },
    ],
  },
  {
    slug: "kitting-paketleme",
    category: "hizmetler",
    categoryLabel: "Montaj & Birleştirme",
    title: "Kitting & Paketleme",
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
    description:
      "TIG, MIG/MAG ve direnç kaynağı ile metal parçaların birleştirilmesi. Yazılı kaynak prosedürü ve tahribatsız muayene ile kalite kontrol.",
    content: [
      "TIG kaynak (Al, çelik, Ti; hassas uygulamalar), MIG/MAG kaynak (çelik, Al; hızlı üretim) ve direnç kaynağı (çelik; nokta kaynak) yöntemleri ile metal parçaların birleştirilmesini gerçekleştiriyoruz. Kaynaklanabilir kalınlık malzemeye ve birleşim tasarımına göre belirlenir.",
      "Kaynak işlemleri yazılı kaynak prosedürü (WPS) ile yürütülür; kullanılan parametreler ve sarf malzemeleri iş bazında kayıt altına alınır. Şartnamede isteniyorsa kaynak dikişleri RT, UT, PT veya MT tahribatsız muayene yöntemleriyle kontrol edilir ve sonuçlar teslimat dosyasına eklenir.",
    ],
    features: [
      "TIG Kaynak — Al, çelik, Ti; hassas uygulamalar",
      "MIG/MAG Kaynak — Çelik, Al; hızlı üretim",
      "Direnç Kaynağı — Çelik; nokta kaynak",
      "Yazılı Kaynak Prosedürü — WPS ile yürütülen kaynak",
    ],
    technicalSpecs: [
      { label: "Prosedür", value: "WPS ile kaynak" },
      { label: "Kalınlık", value: "Birleşim tasarımına göre" },
      { label: "NDT", value: "RT, UT, PT, MT (şartnameye göre)" },
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
      "Şartnameye göre NDT muayenesi",
      "Kaynak dikişlerinde muayene ve ölçüm kaydı",
      "TIG, MIG/MAG ve direnç kaynağı kapasitesi",
    ],
    comparisonTables: [
      {
        title: "Kaynak Yöntemleri Karşılaştırması",
        description: "Kaynak yöntemlerinin genel karşılaştırması; şirket ekipman listesi veya kapasitesi değildir.",
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
    content: [
      "Mas Technic malzeme kütüphanesi metal, plastik, kompozit ve özel alaşımları kapsar. Havacılık sınıfı alüminyumdan medikal sınıfı titanyuma, yüksek performans plastiklerden süper alaşımlara kadar geniş bir yelpazede hizmet veriyoruz.",
      "Metal malzemelerimiz arasında Alüminyum (6061, 7075, 5083 — 95-150 HB), Paslanmaz Çelik (304, 316, 17-4PH — 150-350 HB), Karbon Çelik (1045, 4140, 4340 — 200-350 HB), Titanyum (Gr2, Gr5 Ti6Al4V — 250-350 HB) ve Pirinç/Bronz (C360, C932 — 60-150 HB) bulunmaktadır.",
      "Plastik ve kompozit malzemelerimiz arasında Asetal (POM — düşük sürtünme), Nylon (PA6, PA66 — aşınma direnci), Teflon (PTFE — kimyasal dirençi), PEEK (yüksek sıcaklık — havacılık/medikal), Polikarbonat (PC — şeffaflık) yer almaktadır. Özel alaşımlardan Inconel 718 (yüksek sıcaklık — türbin), Hastelloy (korozyon — kimya endüstrisi), Kovar (termal genleşme — elektronik) ve Tungsten (yüksek yoğunluk — radyasyon koruması) tedarik edebiliyoruz.",
      "Malzeme girişinde sertifika ve malzeme kimliği kontrol edilir, boyut kontrolü yapılır ve malzeme parti ve döküm numarasıyla kayda alınır. Tedarik yaklaşımı ve süresi malzeme sınıfına göre değişir; teklifte belirtilir.",
    ],
    features: [
      "Geniş Malzeme Yelpazesi — metal, plastik, kompozit ve özel alaşımlar",
      "Malzeme Sertifikası — Talebe bağlı olarak sağlanır",
      "Giriş Kontrolü — Sertifika, kimlik ve boyut kontrolü",
      "Lot Bazlı İzlenebilirlik — Hammaddeden nihai ürüne tam takip",
      "Stok Takibi — Malzeme ve parti kaydı",
      "Havacılık & Medikal Sınıf — şartnameye göre malzeme seçimi",
    ],
    technicalSpecs: [
      { label: "Malzeme Grupları", value: "Metal, plastik, kompozit, özel alaşım" },
      { label: "Sertifika", value: "Talebe bağlı" },
      { label: "Tedarik", value: "Malzeme sınıfına göre" },
      { label: "Tedarik süresi", value: "Teklifte belirtilir" },
    ],
    processSteps: [
      "Stok Kontrolü",
      "Sertifika Doğrulama",
      "Kimlik Kontrolü",
      "Boyut Kontrolü",
      "Depolama",
      "Lot Takibi",
    ],
    advantages: [
      "Her projeye uygun malzeme seçimi için mühendislik desteği",
      "Tedarik süresi malzeme sınıfına göre planlanır",
      "Sertifika ve kimlik kontrolü ile giriş kontrolü",
      "Malzeme ve parti kaydı ile stok ve tedarik takibi",
      "Çoklu tedarikçi ile tedarik güvencesi",
      "Havacılık ve medikal uygulamalar için şartnameye göre malzeme seçimi",
    ],
    materials: [
      { name: "Alüminyum", grade: "6061, 7075, 5083", properties: "Tipik 95-150 HB, havacılık/elektronik" },
      { name: "Paslanmaz Çelik", grade: "304, 316, 17-4PH", properties: "Tipik 150-350 HB, medikal/gıda" },
      { name: "Karbon Çelik", grade: "1045, 4140, 4340", properties: "Tipik 200-350 HB, mekanik parçalar" },
      { name: "Titanyum", grade: "Gr2, Gr5 (Ti6Al4V)", properties: "Tipik 250-350 HB, medikal/havacılık" },
      { name: "Pirinç / Bronz", grade: "C360, C932", properties: "Tipik 60-150 HB, dişli ve yatak uygulamaları" },
      { name: "Inconel 718", grade: "Süper alaşım", properties: "Yüksek sıcaklık, türbin parçaları, sipariş üzerine" },
      { name: "PEEK", grade: "450G", properties: "Yüksek sıcaklık, kimyasal direnci, havacılık/medikal" },
      { name: "POM (Delrin)", grade: "Delrin 150/500", properties: "Düşük sürtünme, dişli ve yatak" },
    ],
    faq: [
      { question: "Hangi malzeme sertifikalarını sağlıyorsunuz?", answer: "Malzeme sertifikası ve kimyasal analiz raporu talebe bağlı olarak sağlanır. Her tedarik, lot ve döküm numarasıyla kayıt altına alınır." },
      { question: "Malzeme tedariki ne kadar sürer?", answer: "Tedarik süresi malzeme sınıfına göre değişir; titanyum ve Inconel gibi özel malzemeler sipariş üzerine tedarik edilir. Süre teklifte belirtilir." },
      { question: "Özel alaşım tedarik edebiliyor musunuz?", answer: `Evet. Inconel 718, Hastelloy, Kovar ve Tungsten gibi özel alaşımlar sipariş üzerine tedarik edilir. ${LEAD_TIME_STATEMENT}` },
      { question: "Malzeme kalite kontrolü nasıl yapılıyor?", answer: "Malzeme girişinde sertifika ve malzeme kimliği doğrulanır, boyut kontrolü yapılır; malzeme parti ve döküm numarasıyla izlenir." },
    ],
    comparisonTables: [
      {
        title: "Malzeme Karşılaştırma Matrisi",
        description: "Ana malzeme gruplarının tipik mekanik değerleri; tasarım için malzeme sertifikası esas alınır.",
        headers: ["Malzeme", "Sertlik (HB)", "Çekme Dayanımı", "Maliyet"],
        rows: [
          ["Al 6061-T6", "95", "310 MPa", "$"],
          ["Al 7075-T6", "150", "572 MPa", "$$"],
          ["SS 304", "187", "515 MPa", "$$"],
          ["SS 316L", "217", "485 MPa", "$$$"],
          ["Ti6Al4V (Gr5)", "334", "950 MPa", "$$$$"],
          ["Inconel 718", "363", "1034 MPa", "$$$$$"],
          ["PEEK 450G", "100 (Shore D)", "100 MPa", "$$$$"],
          ["POM (Delrin)", "85 (Shore D)", "70 MPa", "$"],
        ],
      },
      /* The `Sertifika` column used to publish `EN 10204 3.1` x3, `3.2` x2 and
         `CoC` x1, unconditionally per material group — sixty lines below
         `{ label: "Sertifika", value: "Talebe bağlı" }` on the same page. One
         page answered the buyer's question two ways and the surviving answer
         was the stronger one. EN 10204 names a certificate CLASS a buyer's own
         file depends on; §C supplies three certificates and none of them is it.
         The column now says what the spec row, the feature bullet and the FAQ
         on this page already say. */
      {
        title: "Tedarik Yaklaşımı ve Sertifika Matrisi",
        headers: ["Malzeme Grubu", "Tedarik", "Sertifika"],
        rows: [
          ["Alüminyum (6061, 7075)", "Malzeme sınıfına göre", "Talebe bağlı"],
          ["Paslanmaz Çelik (304, 316)", "Malzeme sınıfına göre", "Talebe bağlı"],
          ["Karbon Çelik (1045, 4140)", "Sipariş üzerine", "Talebe bağlı"],
          ["Titanyum (Gr2, Gr5)", "Sipariş üzerine", "Talebe bağlı"],
          ["Inconel / Hastelloy", "Sipariş üzerine", "Talebe bağlı"],
          ["PEEK / Yüksek Perf. Plastik", "Sipariş üzerine", "Talebe bağlı"],
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
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015 ve ISO 14001:2015 yönetim sistemi belgelerimiz bulunmaktadır. Belge kapsamı dışında bir standart gerekiyorsa teknik incelemede birlikte değerlendiririz." },
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
    /* 09a-C3 — F2a. "%70'e kadar maliyet tasarrufu" kaynaksız bir tasarruf
       oranıydı (§D `OTHER_PUBLIC_KPIS: NONE`, §G `CASE_STUDIES:
       NONE_PROVIDED_YET`). Aynı sayfanın SSS'i zaten "tasarrufun büyüklüğü
       parçaya bağlıdır" diyor; meta onunla çelişiyordu. Sayı gitti,
       kaldıraçlar kaldı.

       09a-C4 / R3-4 — DÜZELTME. Bu not, satırın "`metaDescription` içinde
       olduğu için sayfada değil arama sonucunda ve sosyal kartta da
       yayımlandığını" söylüyordu. YANLIŞTI: bu alanı hiçbir şey okumuyor.
       `ServiceDetail.tsx` :195, :284 ve :306'da `page.description` geçiriyor
       ve `src/**` içinde bir servis rotasında `metaDescription` okuyan tek bir
       yer yok — 44 sayfanın hepsinde ölü veri.

       KALDIRMA DOĞRUYDU, GEREKÇE YANLIŞTI. Yetkisiz bir iddia ölü bir alanda
       da yetkisizdir; üstelik bu alan canlı olmaya bir `usePageMeta` çağrısı
       uzaklıkta ve `claims-gate.mjs` tam bu yüzden onu da tarıyor. Alanın
       bağlanması gerçek bir SEO bulgusudur ve SEO fazına aittir; bir içerik
       düzeltmesinde karara bağlanmaz. */
    metaDescription:
      "Design for Manufacturing (DFM/DFA) analizi ile tasarımlarınızı optimize edin. CNC ve enjeksiyon DFM kuralları, üretilebilirlik incelemesi, parça bazında maliyet kaldıraçları.",
    description:
      "DFM/DFA analizi ile tasarımlarınızı üretilebilirlik açısından optimize ediyoruz. Üretim maliyetlerini düşüren, kaliteyi artıran ve süreyi kısaltan mühendislik desteği.",
    content: [
      "Design for Manufacturing (DFM) analiz sürecimiz 4 aşamadan oluşur: ilk inceleme ve DFM raporu taslağı, detaylı analiz ve optimizasyon önerileri, müşteri görüşmesi ve revize CAD modeli, final DFM raporu ve onay. Sürecin takvimi parçanın karmaşıklığına ve gelen dosyanın eksiksizliğine bağlıdır; teklifle birlikte verilir.",
      "CNC işleme DFM kurallarımız: İç köşe yarıçapı R > 0.5mm (sivri köşelerden kaçının), duvar kalınlığı > 0.8mm (çok ince duvarlardan kaçının), derinlik/çap oranı < 4:1 (çok derin deliklerden kaçının) ve standart boyut kullanımı (özel ölçülerden kaçının). Enjeksiyon kalıp DFM'inde duvar kalınlığı, köşe yarıçapları ve gate konumu değerlendirilir (gate kalın kesimden). Kalıptan çıkış açısı ve çekme telafisi ayrı değerlendirilir; değerler proses ve malzemeye göre belirlenir.",
      /* 09a-C3 — D1 düzeltmesinin bu sayfadaki YAN ETKİSİ, oluşturulmuş DOM'da
         görüldü. `technicalSpecs`teki "Desteklenen CAD" satırı artık
         türetilmiş listeyi basıyor; bu cümle ise birkaç satır aşağıda "yaygın
         CAD formatlarını doğrudan işleyebiliyoruz" diyordu. Aynı ekranda iki
         farklı kabul ölçütü. Cümle, gerçekte olan şeye çevrildi: analiz teklif
         akışına yüklenen modelin üzerinden yürür. */
      "Analiz, teklif akışına yüklenen katı model üzerinden yürütülür; modelle birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır. Takım yolları üretim öncesinde simülasyonla doğrulanır ve çarpışma kontrolü yapılır.",
      "DFM analizinde tipik olarak baktığımız kaldıraçlar: montajı tek parçaya indirgemek, bağlama sayısını azaltmak, takım erişimini kolaylaştırmak, gereksiz dar toleransları gevşetmek ve malzemeyi fonksiyona göre yeniden seçmek. Hangisinin ne kadar etki edeceği parçanın geometrisine ve mevcut üretim planına bağlıdır; beklenen etki analiz raporunda parça bazında verilir.",
    ],
    features: [
      "DFM Analizi — 4 aşamalı inceleme, analiz, görüşme ve raporlama",
      "CNC İşleme DFM Kuralları — Köşe, duvar, derinlik optimizasyonu",
      "Enjeksiyon Kalıp DFM — Duvar kalınlığı, kalıptan çıkış açısı, çekme telafisi, gate konumu",
      /* 09a-C3. Oluşturulmuş DOM'da bu madde, türetilmiş "Desteklenen CAD"
         satırının hemen altında duruyordu: ekranda önce "STEP … 3MF", hemen
         ardından "CATIA, SolidWorks, NX" okunuyor ve okuyucu bunları tek bir
         kabul listesi gibi birleştiriyordu. Ayrıca adlandırılmış CAM/CAD
         yazılımı bir YAZILIM ENVANTERİDİR — `claims-gate.mjs`
         `named-enterprise-system` kuralının dayanağı: §D "no software or
         automation-system inventory was supplied". Kabiliyet kalır, envanter
         gider. */
      "CAD/CAM Entegrasyonu — katı model, takım yolu ve revizyon tek akışta",
      "Simülasyon — takım yolu doğrulama ve çarpışma kontrolü",
      "Maliyet Optimizasyonu — Parça sayısı, bağlama ve tolerans kaldıraçları",
    ],
    technicalSpecs: [
      { label: "Analiz Süresi", value: LEAD_TIME_SHORT },
      { label: "Rapor Formatı", value: "PDF + revize CAD" },
      /* 09a-C3 — D1 ile aynı sınıf: "CATIA, NX, SW" hiçbiri kabul edilmiyor. */
      { label: "Desteklenen CAD", value: CAD_UPLOAD_FORMATS },
      { label: "Revizyon", value: "Kapsamı teklifte belirtilir" },
      /* 09a-C3 — F2b. "Ortalama %30-50" kaynaksızdı ve bu sayfanın kendi
         SSS'i tarafından yalanlanıyordu ("tasarrufun büyüklüğü parçanın
         geometrisine ve mevcut üretim planına bağlıdır"). Satır bir ORTALAMA
         vaat ediyordu; yerine analizde gerçekten bakılan kaldıraçlar yazıldı,
         ki bunlar sayfanın `content[3]` bölümünde zaten sayılıyor. */
      { label: "Maliyet Kaldıraçları", value: "Parça sayısı, bağlama, tolerans" },
      { label: "Simülasyon", value: "Takım yolu doğrulama" },
    ],
    processSteps: [
      "CAD Model Yükleme",
      "İlk İnceleme",
      "Detaylı Analiz",
      "Müşteri Görüşmesi",
      "CAD Revizyon",
      "Final DFM Raporu",
    ],
    advantages: [
      "Dört aşamalı DFM süreci: inceleme, analiz, görüşme, rapor",
      /* 09a-C3 — yukarıdaki `features` maddesiyle aynı gerekçe, aynı sayfa. */
      "Müşteri modeli üzerinden çalışma: gelen katı model revize edilip geri gönderilir",
      "Üretim öncesi takım yolu simülasyonu ve çarpışma kontrolü",
      "Parça sayısı, bağlama sayısı ve işlem adımı azaltma fırsatlarının çıkarılması",
      "Enjeksiyon kalıp ve CNC işleme özel DFM kuralları",
    ],
    faq: [
      /* 09a-C3 — D3. "İlk DFM değerlendirmesi ücretsizdir" bir BEDELSİZLİK
         TAAHHÜDÜ, yani 09a-C2'nin sohbet botundan kaldırdığı ticari politika
         sınıfı; `USER_INPUTS.md` hiçbir alanı böyle bir tarife vermiyor. Bir
         politika hedge'e yumuşatılamaz — okuyucuya bir sayı değil bir kural
         söyleniyor — bu yüzden ödeme koşulları ve iade taahhüdünde olduğu
         gibi yerine MEKANİZMA yazıldı. Sorunun kendisi gerçek bir sorudur ve
         `/sss` de Phase 07'de aynı gerekçeyle silmeyip yeniden yazmıştı. */
      { question: "DFM analizi ücreti var mı?", answer: "Yayımlanan sabit bir DFM ücret tarifemiz yok. Gelen dosyanın üretilebilirlik incelemesi teklif hazırlığının bir adımıdır; ayrıca talep edilen detaylı DFM raporu ve CAD revizyonları ise kapsamıyla birlikte teklifte fiyatlandırılır." },
      { question: "DFM analizi ne kadar sürer?", answer: `Süreç dört aşamadan oluşur: ilk inceleme, detaylı analiz, müşteri görüşmesi ve final rapor. Takvim parçanın karmaşıklığına ve gönderilen dosyanın eksiksizliğine göre değişir. ${LEAD_TIME_STATEMENT}` },
      /* 09a-C3 — D2. Bu liste BUGÜN DOĞRUYDU ve tam da bu yüzden kaldırıldı:
         elle yazılmış olduğu için doğrulayıcı değiştiği gün sessizce yanlışa
         dönerdi. Doğru olan bir sabit, yine de bir sabittir. */
      {
        question: "Hangi CAD formatlarını kabul ediyorsunuz?",
        answer: `Teklif akışındaki yükleyici şu uzantıları doğrular: ${CAD_UPLOAD_EXTENSIONS} — listede olmayan bir uzantı yükleme adımından geçmez. Yerel CAD kaydınızı veya ölçülendirilmiş teknik resminizi sales@mastechnic.com adresine iletirseniz teklif için değerlendiririz.`,
      },
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
          ["Yüzey Kalitesi", "Ra 1.6µm", "Fonksiyona göre", "Fonksiyona uygun Ra seçin", "İşleme süresi kısalır"],
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
      "Korozyon korumasından estetik kaplamaya yüzey işlem seçim rehberi: anodizasyon, toz boya, nikelaj, elektropolisaj ve Ra pürüzlülük rehberi; kaplamanın ölçüye etkisi.",
    description:
      "Korozyon korumasından elektriksel yalıtıma, dekoratif görünümden tribolojik özelliklere kadar uygulamanıza en uygun yüzey işlem yöntemini belirlemenize yardımcı oluyoruz.",
    content: [
      "Yüzey işlemi seçim matrisimiz: Korozyon koruması için anodizasyon (alüminyum — koruyucu tabaka), sertlik artırma için nitrürleme (çelik — yüzey sertliği), estetik kaplama için toz boya (metal — renkli kaplama) ve elektriksel yalıtım için e-kap (alüminyum — yalıtım). Her ihtiyaca özel çözüm sunuyoruz.",
      "Yüzey pürüzlülüğü (Ra) için genel rehber: Ra 0.1-0.2µm ayna parlaklığı (optik, yatak uygulamaları), Ra 0.4-0.8µm parlak yüzey (mil, piston), Ra 1.6-3.2µm mat yüzey (genel mekanik) ve Ra 6.3-12.5µm pürüzlü yüzey (yapısal parçalar). Bu aralıklar sektör rehberidir; parçanız için ulaşılabilir değer malzeme, geometri ve işleme yöntemine göre teklifte belirtilir.",
      "Kaplama kalınlığı ve kalınlık toleransı şartnameye göre belirlenir — örneğin anodizasyonda MIL-A-8625 tipi, nikelajda ilgili kaplama standardı. Kaplama sonrası boyut değişimi hesaba katılarak işleme toleransları belirlenir.",
      "Yüzey işlemlerinin ölçüye etkisi işleme planlamasında dikkate alınır: anodizasyon tabakasının bir kısmı yüzeyden dışarı büyür (sülfürik anodizasyonda yaklaşık yarısı), toz boya yüzeye kalınlığı kadar ekler, kumlama ve elektropolisaj ise yüzeyden malzeme kaldırır. Paylar şartname ve proses parametreleriyle birlikte belirlenir.",
    ],
    features: [
      "Yüzey İşlem Seçim Matrisi — İhtiyaca özel yöntem belirleme",
      "Ra Pürüzlülük Rehberi — Ayna parlaklığından pürüzlü yüzeye",
      "Kaplama Kalınlık Kontrolü — Anodizasyon, toz boya, nikelaj",
      "Tolerans Etki Analizi — İşlem sonrası boyut değişimi hesaplama",
      "Korozyon Gereksinimi — Tuz spreyi şartı kaplama seçiminde dikkate alınır",
      "Renk ve Estetik Çözümler — RAL/Pantone renk eşleştirme",
    ],
    technicalSpecs: [
      { label: "Kaplama kalınlığı", value: "Şartnameye göre" },
    ],
    faq: [
      { question: "Hangi yüzey işlemi benim parçama uygun?", answer: "Uygulamaya göre değişir: Korozyon koruması için anodizasyon veya nikelaj, sertlik artırma için nitrürleme, estetik için toz boya veya eloksal, elektriksel yalıtım için e-kap öneriyoruz. Mühendislik ekibimiz detaylı analiz yapabilir." },
      { question: "Yüzey işlemi boyut değişikliğine neden olur mu?", answer: "Evet. Anodizasyon tabakasının bir kısmı yüzeyden dışarı büyüdüğü için ölçüyü artırır; kumlama ve elektropolisaj yüzeyden malzeme kaldırarak ölçüyü azaltır. Paylar şartname ve proses parametreleriyle belirlenir ve işleme toleranslarında dikkate alınır." },
      { question: "Çok düşük Ra değerlerine ulaşabilir misiniz?", answer: "Ulaşılabilir yüzey pürüzlülüğü malzemeye, geometriye ve işleme yöntemine bağlıdır. Ayna parlaklığı gereken yüzeyler teknik resim incelemesinde değerlendirilir ve hedef değer teklifte belirtilir." },
    ],
    comparisonTables: [
      {
        title: "Yüzey İşlemi Seçim Matrisi",
        description: "Uygulamanıza göre en uygun yüzey işlem yöntemini belirleyin",
        headers: ["Yüzey İşlemi", "Uyumlu Malzemeler", "Temel Fonksiyon", "Tipik Ra (µm)", "Maliyet"],
        rows: [
          ["Eloksal (Anodize) Tip II", "Alüminyum, Titanyum", "Korozyon direnci, renk", "0.8 – 1.6", "$$"],
          ["Sert Eloksal (Tip III)", "Alüminyum", "Sertlik, aşınma direnci", "0.8 – 1.6", "$$$"],
          ["Kumlama (Bead Blast)", "Metaller, Plastikler", "Mat yüzey, pürüz giderme", "1.6 – 3.2", "$"],
          ["Nikel Kaplama", "Çelik, Bakır", "Aşınma direnci, iletkenlik", "0.4 – 0.8", "$$$"],
          ["Toz Boya", "Tüm Metaller", "Dekoratif, dış ortam", "N/A", "$$"],
          ["Elektropolish", "Paslanmaz Çelik", "Parlak yüzey, hijyen", "0.1 – 0.4", "$$$"],
          ["Nitrürleme", "Çelik", "Yüzey sertliği", "Değişmez", "$$$$"],
        ],
      },
      {
        title: "Yüzey Pürüzlülüğü (Ra) Rehberi",
        description: "Uygulamaya göre tipik Ra aralıkları (sektör rehberi); parçanız için ulaşılabilir değer teklifte belirtilir.",
        headers: ["Ra Aralığı (µm)", "Yüzey Görünümü", "Uygulama Alanı", "İşleme Yöntemi"],
        rows: [
          ["0.1 – 0.2", "Ayna parlaklığı", "Optik, yatak yüzeyleri", "Lepleme, polisaj"],
          ["0.4 – 0.8", "Parlak yüzey", "Mil, piston, sızdırmazlık", "İnce frezeleme, taşlama"],
          ["1.6 – 3.2", "Mat yüzey", "Genel mekanik parçalar", "Standart CNC işleme"],
          ["6.3 – 12.5", "Pürüzlü yüzey", "Yapısal, kaynak öncesi", "Kaba işleme, kumlama"],
        ],
      },
      {
        title: "İşlem Sonrası Boyut Değişimi",
        description: "Yüzey işleminin ölçüye etkisi; paylar şartname ve proses parametreleriyle birlikte belirlenir.",
        headers: ["Yüzey İşlemi", "Boyut Değişimi", "Planlama Notu"],
        rows: [
          ["Anodizasyon Tip II", "Artar (yarısı dışarı büyür)", "Kalınlığın yarısı malzemeye nüfuz eder"],
          ["Anodizasyon Tip III", "Artar; pay şartnameye göre", "İşleme boyutunda kaplama payı bırakın"],
          ["Toz Boya", "Artar (kalınlığı kadar)", "Kritik yüzeyleri maskeleyin"],
          ["Kumlama", "Azalır (malzeme kaldırır)", "Hassas yüzeyleri maskeleyin"],
          ["Elektropolish", "Azalır (malzeme kaldırır)", "Malzeme kaldırılır, boyut küçülür"],
        ],
      },
    ],
  },
  {
    slug: "dusuk-hacimli-uretim",
    category: "kabiliyetler",
    categoryLabel: "Prototipten Seri Üretime",
    title: "Düşük Hacimli Üretim",
    metaTitle: "Düşük Hacimli Üretim | 3D Baskı, Silikon Kalıp, CNC | Mas Technic",
    metaDescription:
      "3D baskı ile hızlı prototip, silikon kalıplama ile kısa seri, hızlı alüminyum kalıp ile daha büyük partiler. FDM, SLA, SLS, DMLS teknolojileri.",
    description:
      "3D baskı, silikon kalıplama, hızlı alüminyum kalıp ve CNC işleme ile düşük hacimli üretim ihtiyaçlarınıza esnek çözümler sunuyoruz; yöntem adede ve hassasiyete göre seçilir.",
    content: [
      "Düşük hacimli üretimde yöntem adede, süreye ve hassasiyet gereksinimine göre seçilir: 3D baskı konsept doğrulaması, silikon kalıplama küçük plastik partiler, alüminyum kalıp daha büyük partiler ve CNC işleme dar toleranslı parçalar için uygundur (CNC standart tolerans ±0.01mm). Diğer yöntemlerin toleransı ve her yöntemin termini teklifle birlikte verilir.",
      "Eklemeli imalat seçenekleri parçanın işlevine göre ayrışır: FDM (ABS, PLA, naylon) biçim ve montaj denemeleri, SLA (reçine) ince detay ve yüzey, SLS (PA12, TPU) destek yapısı gerektirmeyen fonksiyonel parçalar, DMLS ise metal fonksiyonel prototipler için kullanılır.",
      "Silikon kalıplama sürecimiz 4 aşamadan oluşur: 1) Master model — 3D baskı veya CNC ile üretim, 2) Silikon kalıp — vakumlu kalıplama, 3) Döküm — PU/silikon/EP döküm, 4) Finisaj — yüzey işlemleri ve kalite kontrol. Toplam terminde belirleyici olan master modelin hazırlanması ve döküm adedidir; termin teklifle birlikte verilir.",
      "Alüminyum kalıp çözümü, çelik kalıba göre daha hızlı işlenebildiği için düşük ve orta hacimli işlerde tercih edilir. Basınçlı döküm ve enjeksiyon kalıp pilot üretimlerinde, seri kalıp yatırımı öncesinde tasarımın doğrulanmasını sağlar.",
    ],
    features: [
      "3D Baskı (FDM/SLA/SLS/DMLS) — konsept doğrulama ve hızlı prototip",
      "Silikon Kalıplama — Kısa seri PU/silikon/EP döküm",
      "Alüminyum Kalıp — pilot üretim ve tasarım doğrulaması için",
      "CNC İşleme — ±0.01mm standart tolerans",
      /* 09a-C3 — F3, birinci yer. Model adı gitti, süreç kaldı: Al/SS/Ti'de
         DMLS bir KABİLİYETTİR; onu yapan tezgâh ise ENVANTERDİR ve §D
         `MACHINE_COUNT: PRIVATE_DO_NOT_DISCLOSE` / §0
         `DO_NOT_EMPHASIZE_COMPANY_SCALE` kapsamındadır. Phase 06 adlandırılmış
         modelleri makine parkı sayfasından aynı gerekçeyle kaldırmıştı; bu
         ikisi o süpürmenin dışında kalmıştı. */
      "Metal 3D Baskı (DMLS) — alüminyum, paslanmaz çelik ve titanyum",
      "Fonksiyonel Prototip — Seri üretim malzemesi ile test",
    ],
    technicalSpecs: [
      { label: "Min. Adet", value: "1 adet" },
      { label: "Yöntemler", value: "3D baskı, silikon kalıp, Al kalıp, CNC" },
      { label: "Termin", value: LEAD_TIME_SHORT },
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
      "Yöntem seçimi adet, tolerans ve termin dengesine göre yapılır",
      "Metal ve plastik 3D baskı kapasitesi",
      "Silikon kalıp ile düşük kalıp maliyeti",
      "Seri üretim öncesi pilot doğrulama",
      "Fonksiyonel prototip ile gerçek koşullarda test",
    ],
    faq: [
      { question: "Prototip için hangi yöntem en uygun?", answer: `Hızlı konsept doğrulaması için 3D baskı, ±0.01mm hassasiyet gereken parçalar için CNC, küçük plastik partiler için silikon kalıplama öneriyoruz. ${LEAD_TIME_STATEMENT}` },
      /* 09a-C3 — F3, ikinci yer ve daha ağır olanı: bu bir `faq` girdisi,
         yani `collectServiceFaqs()` ile sohbet havuzunun 78. kaydı. Model adı
         botun bir soruyla ulaşılabildiği bir envanter bilgisiydi. */
      { question: "Metal 3D baskı yapabiliyor musunuz?", answer: "Evet. DMLS (doğrudan metal lazer sinterleme) ile alüminyum, paslanmaz çelik ve titanyum malzemelerde metal 3D baskı yapıyoruz; parça ölçüsü ve ulaşılabilir tolerans teknik incelemede değerlendirilir." },
      { question: "Silikon kalıptan kaç parça çıkar?", answer: "Bir silikon kalıptan çıkan parça sayısı döküm malzemesine ve geometriye göre değişir; beklenen kalıp ömrü teklifte belirtilir." },
      { question: "Düşük hacimden seri üretime geçiş nasıl olur?", answer: "Prototip ve pilot üretimden sonra onaylanan tasarım için çelik kalıp yatırımı veya otomasyonlu CNC seri üretim planlaması yapılır. Geçiş süreci proje yöneticimiz tarafından koordine edilir." },
    ],
    comparisonTables: [
      {
        title: "Üretim Yöntemi Karşılaştırması (Maliyet vs. Adet)",
        description: "Adet aralıkları genel yönlendirmedir; CNC işlemede standart tolerans ±0.01mm, diğer yöntemlerin toleransı teklifte belirtilir.",
        headers: ["Yöntem", "Adet Aralığı", "Birim Maliyet", "Kalıp Yatırımı"],
        rows: [
          ["3D Baskı (FDM/SLA)", "1 – 10", "$$$", "Yok"],
          ["3D Baskı (SLS/DMLS)", "1 – 50", "$$$$", "Yok"],
          ["CNC İşleme", "1 – 100", "$$$", "Yok"],
          ["Silikon Kalıplama", "10 – 100", "$$", "Düşük ($)"],
          ["Hızlı Al Kalıp", "100 – 1.000", "$", "Orta ($$)"],
          ["Çelik Kalıp (Enjeksiyon)", "1.000+", "$", "Yüksek ($$$$$)"],
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
    content: [
      /* PHASE 07 CORRECTION #1 — F1. This sentence published three annual
         production volumes in the first person ("Seri üretim
         kapasitelerimiz: … 50.000 adet/yıl … 500.000 adet/yıl …
         1.000.000 adet/yıl"). `USER_INPUTS.md` §0
         DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES and §D
         REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE withhold that class,
         and nothing in `USER_INPUTS.md` verifies the figures. KEPT is the
         process-specification half — ±0.01 mm — the one §0
         PUBLIC_POSITIONING_PRIORITY leads with.
         T01: the CT classes went too. Die casting was CT4-CT6 here and
         CT6-CT8 in the table below, and injection moulding was given ISO 8062
         casting classes at all. The mould, the as-moulded/as-cast part and
         the machined faces are now described as three separate requirements. */
      "Seri üretimde yöntem, parça geometrisi ve tolerans hedefine göre seçilir. CNC seri işlemede standart tolerans ±0.01mm'dir. Döküm veya kalıplanmış parçalarda üç gereksinim ayrı ele alınır: kalıbın kendi işleme toleransı, ham (döküm ya da kalıp çıkışı) parçanın tolerans sınıfı ve sonradan işlenen yüzeylerin teknik resimdeki toleransı. Ham parçanın tolerans sınıfı proses ve malzemeye göre teklifte belirtilir.",
      "Seri işlerde kurulum bir kez yapılıp unutulmaz: standart kurulum prosedürü, sabit referans yüzeyleri ve otomatik takım değiştirme, partiler arası sapmayı sınırlar. İlk parça onaylanmadan seri başlamaz.",
      "Üretim takibi, stok ve kapasite planlaması tek bir kayıt üzerinden yürütülür; hangi partinin nerede olduğu ve hangi kontrolden geçtiği her an kayıtlıdır. Tedarik ihtiyacı bu kayıt üzerinden planlanır, müşteri portalından sipariş durumu görülebilir.",
      "Parti içi tutarlılık, ara kontrollerin plana bağlanmasıyla korunur. Kayma eğilimi olan koteler — takım aşınmasına duyarlı çaplar, ısıl işlem sonrası ölçüler — ayrı bir kontrol adımıyla izlenir ve sonuçlar kayıt altına alınır.",
    ],
    features: [
      "CNC Seri İşleme — ±0.01mm tolerans, sabit referans yüzeyleri",
      "Basınçlı Döküm — Ham parça ve işlenen yüzey toleransı ayrı değerlendirilir",
      "Enjeksiyon Kalıp — Kalıp, kalıplanmış parça ve işlenen yüzey ayrı değerlendirilir",
      "Otomatik Takım Değiştirme — uzun partilerde kesintisiz işleme",
      "Otomatik Palet Değiştirme — kurulumun üretimden ayrılması",
      "Üretim Takibi — parti durumunun kayıt altında olması",
    ],
    technicalSpecs: [
      { label: "CNC Seri İşleme", value: "±0.01mm tolerans" },
      { label: "Basınçlı Döküm", value: "Teklifte belirtilir" },
      { label: "Enjeksiyon Kalıp", value: "Teklifte belirtilir" },
      { label: "Kurulum", value: "Standart prosedür" },
      { label: "Kontrol", value: "Kontrol planına göre" },
      { label: "Teslimat", value: "Programa göre" },
    ],
    processSteps: [
      "Parti Kaydı",
      "Pilot Üretim",
      "Seri Üretim Onayı",
      "Otomasyon Kurulumu",
      "Seri Üretim Başlangıcı",
      "SPC & Kalite Takibi",
      "Programlı Teslimat",
    ],
    advantages: [
      "Standart kurulum prosedürü ile partiler arası tutarlılık",
      "Parti durumu üretim boyunca kayıt altında tutulur",
      "Parti büyüklüğü ve teslimat sıklığı programa bağlanır",
      "Kayma eğilimi olan koteler ara kontrolle izlenir",
      "Lot bazlı tam izlenebilirlik",
      "İlk parça onaylanmadan seri üretim başlamaz",
    ],
    faq: [
      /* The published minimums were the lower bounds of the same withheld
         volume ranges (F1); quoting them would have left half the disclosure
         standing. The answer now states how the threshold is DECIDED, which
         is the part that is actually true of every job. */
      { question: "Minimum seri üretim adedi nedir?", answer: "Tek bir eşik yoktur; yönteme göre değişir. Kalıp yatırımı gerektiren yöntemlerde (basınçlı döküm, enjeksiyon kalıp) eşiği kalıp maliyetinin parça başına dağılımı belirler; CNC seri işlemede kurulum süresi belirleyicidir. Parça geometrisi ve tolerans hedefiyle birlikte teklif aşamasında netleştiririz." },
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
          ["Basınçlı Döküm", "Karmaşık formlu yüksek hacim", "Teklifte; işlenen yüzey resme göre", "Kalıp ve döküm parametresi", "Görsel + boyutsal kontrol"],
          ["Enjeksiyon Kalıp", "Plastik yüksek hacim", "Teklifte; işlenen yüzey resme göre", "Kalıp ve proses penceresi", "İlk parça + periyodik kontrol"],
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
    content: [
      "Proje yapısına göre metodoloji seçilir: aşamalı (waterfall) yaklaşım geleneksel mekanik projelerde, onay noktalı (phase-gate) yaklaşım seri üretime geçişte, iteratif yaklaşım ise sık revizyon gerektiren projelerde uygundur.",
      "Beş aşamalı proje sürecimiz: 1) Değerlendirme — teklif ve onay, 2) DFM analizi — rapor ve gerekirse tasarım revizyonu, 3) Prototip — numune parça, ölçüm kaydı ve numune onayı, 4) Üretim dosyası — kontrol planı ve izlenebilirlik dokümanları, 5) Seri üretim — parti raporu ve periyodik değerlendirme.",
      "İletişim ve raporlama kanallarımız: proje toplantıları, müşteri portalı üzerinden durum takibi, kritik aşamaların fotoğraf ve video ile belgelenmesi, üretim dosyasının teslimi ve tasarım değişikliği (ECO) yönetimi prosedürü.",
      "Her proje için tek bir muhatap atanır; aşama çıktıları, onaylar ve teslim kayıtları bu muhatap üzerinden yürür.",
    ],
    features: [
      "Özel Proje Yöneticisi — Baştan sona tek muhatap",
      "5 Aşamalı Süreç — Değerlendirmeden seri üretime kontrollü geçiş",
      "Agile/Scrum & Phase-Gate — Proje yapısına uygun metodoloji",
      "Durum Bildirimi — Aşama ve onay kayıtları",
      "Üretim Dosyası — kontrol planı ve izlenebilirlik kayıtları",
      "ECO Yönetimi — Mühendislik değişiklik prosedürü",
    ],
    technicalSpecs: [
      /* 09a-C2: this row IS the quote-response SLA — "Değerlendirme" is how
         long MAS takes to come back with a price, which §D and §J authorise.
         It was a hand-written literal that happened to agree with the ledger;
         it now reads from the ledger, so it cannot drift away from it. */
      { label: "Değerlendirme", value: QUOTE_RESPONSE_TIME },
      /* 09a-C1 neutralised the DFM row and left "1-3 hafta" in the Prototip row
         directly beneath it. 09a-C2 finishes the column: the only duration left
         is the one with a source. */
      { label: "DFM Analizi", value: LEAD_TIME_SHORT },
      { label: "Prototip", value: LEAD_TIME_SHORT },
      { label: "Üretim Dosyası", value: "Numune onayı sonrası" },
      { label: "Raporlama", value: "Aşama bazlı" },
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
      "Aşama bazlı ilerleme bildirimi",
      "Fotoğraf/videolu kritik aşama belgeleme",
      "ECO prosedürü ile kontrollü değişiklik yönetimi",
      "Tek muhatap üzerinden proje takibi",
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
        headers: ["Metodoloji", "Uygun Proje Tipi", "Süreç Esnekliği", "Raporlama", "Teslimat Yaklaşımı"],
        rows: [
          ["Agile / Scrum", "Sık revizyonlu projeler", "★★★★★", "Sprint bazlı", "İteratif — kısa döngüler"],
          ["Waterfall", "Geleneksel mekanik projeler", "★★☆☆☆", "Aşama bazlı", "Sıralı — Phase-Gate onaylı"],
          ["Phase-Gate", "Seri üretim projeleri", "★★★☆☆", "Gate Review", "Kontrollü geçiş — onay noktalarıyla"],
          ["Hibrit", "Karmaşık mühendislik projeleri", "★★★★☆", "Haftalık + Sprint", "Esnek — proje ihtiyacına göre"],
        ],
      },
      {
        title: "Proje Aşamaları ve Süreleri",
        headers: ["Aşama", "Süre", "Çıktı", "Müşteri Onayı", "İletişim Kanalı"],
        rows: [
          /* 09a-C2: the "Süre" column now reads — quote SLA (sourced, from the
             ledger), Teklifle birlikte, Teklifle birlikte, Numune onayı
             sonrası, Devam eden. Exactly one cell carries a number and it is
             the only one §D and §J authorise. */
          ["1. Değerlendirme & Teklif", QUOTE_RESPONSE_TIME, "Detaylı teklif + zaman planı", "Teklif onayı", "E-posta + Video konferans"],
          ["2. DFM Analizi", LEAD_TIME_SHORT, "DFM raporu + CAD revizyonu", "DFM onayı", "Portal + Toplantı"],
          ["3. Prototip Üretimi", LEAD_TIME_SHORT, "Örnek parça + ölçüm raporu", "Numune onayı", "Fotoğraf/video + rapor"],
          ["4. Üretim Dosyası", "Numune onayı sonrası", "Kontrol planı + izlenebilirlik kayıtları", "Dosya onayı", "Portal + PDF teslim"],
          ["5. Seri Üretim", "Devam eden", "Parti raporu", "Periyodik review", "Portal + periyodik rapor"],
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
      { label: "NDT", value: "Şartnameye göre planlanır" },
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
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015 ve ISO 14001:2015 yönetim sistemi belgelerimiz bulunmaktadır. Projeniz farklı bir standart gerektiriyorsa teknik incelemede birlikte değerlendiririz." },
      { question: "Titanyum işleyebiliyor musunuz?", answer: "Evet, Ti6Al4V (Grade 5) ve Grade 2 titanyum işleme konusunda uzmanız. Özel takımlar, düşük hız/yüksek ilerleme stratejisi ve soğutma yönetimi ile optimal sonuçlar elde ediyoruz." },
      { question: "İlk parça kontrolü yapıyor musunuz?", answer: "Evet. Her yeni parça ve her revizyon için ilk parça kontrolü yapılır ve kayıt altına alınır; belgelendirme formatını şartnamenize göre birlikte belirleriz." },
      { question: "Özel prosesler nasıl yürütülüyor?", answer: "Kimyasal işlem, tahribatsız muayene ve ısıl işlem gibi özel prosesler projenin şartnamesine göre planlanır ve tedarik zinciriyle birlikte yürütülür. Parametreler dondurulur; değişiklik yeniden doğrulama gerektirir." },
    ],
    comparisonTables: [
      {
        title: "Havacılık Malzeme Performans Karşılaştırması",
        description: "Tipik literatür değerleri; tasarım için malzeme sertifikası esas alınır. Şirket kapasitesi değildir.",
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
      { label: "NDT", value: "RT, UT, PT, MT (şartnameye göre)" },
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
      /* F1: `100-10K adet/yıl` is the same annual-volume class as
         `seri-imalat`'s three. Replaced with the geometric tolerance the page
         already proves in its own FAQ. */
      { label: "Eş Eksenlilik", value: "Datum üzerinden ölçülür" },
      { label: "Ağırlık Opt.", value: "Topoloji optimizasyonu" },
      { label: "GD&T", value: "Kontrol planında" },
    ],
    advantages: [
      "5 eksen tek bağlamada karmaşık robot geometrileri",
      "Al 7075 ile hafif ve yüksek dayanımlı bileşenler",
      "Referans yüzeyler tek bağlamada işlenir, ölçüm aynı datumdan yapılır",
      "DFM analizi ile ağırlık ve maliyet optimizasyonu",
      "Prototipten seri üretime sorunsuz geçiş",
      "Eş eksenlilik ve diklik kontrol planında tanımlanır",
    ],
    faq: [
      { question: "Robot bileşenlerinde hangi toleransları tutabiliyorsunuz?", answer: "Standart çalışma aralığımız ±0.01mm'dir. Eş eksenlilik ve diklik gibi geometrik toleranslar datum yapısıyla birlikte değerlendirilir ve kontrol planına yazılır." },
      { question: "Hafif malzeme çözümleriniz var mı?", answer: "Evet, Al 7075-T6 ile yüksek mukavemet/ağırlık oranı, topoloji optimizasyonu ile ağırlık azaltma ve PEEK gibi yüksek performans plastikler sunuyoruz." },
      { question: "Seri üretim yapabiliyor musunuz?", answer: "Evet. Otomasyonlu CNC seri üretimde bar besleyici ve palet sistemi ile kesintisiz işleme yapılır; parti büyüklüğü ve teslimat programı teklif aşamasında birlikte belirlenir." },
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
      "Kontrol planı, ölçüm ve parti kayıtları teslim dosyasında",
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015 ve ISO 14001:2015 yönetim sistemi belgelerimiz bulunmaktadır. Müşterinizin şartnamesi sektöre özel bir standart gerektiriyorsa bunu teklif aşamasında açıkça değerlendiririz." },
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
      "Mikro işleme ile küçük çaplı medikal vidalar, pimler ve konektörler üretilebilir; uzun ve ince geometrilerde kayar puntalı tornalama sehimi sınırladığı için tercih edilir. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "Biyouyumlu Malzeme İşleme — Ti Gr5, SS 316L, CoCrMo, PEEK, UHMWPE",
      "Mikro İşleme — Küçük çaplı vida ve pimler",
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
      "Küçük çaplı medikal parça üretimi",
      "Uzun ince parçalarda kayar puntalı tornalama ile sehim kontrolü",
      "Yüzey işlemi malzeme ve şartnameye göre seçilir",
      "Parti ve döküm kaydı ile izlenebilirlik",
      "Ek dokümantasyon ihtiyacı teklif aşamasında netleştirilir",
    ],
    faq: [
      { question: "Hangi kalite belgeleriniz var?", answer: "ISO 9001:2015 ve ISO 14001:2015 yönetim sistemi belgelerimiz bulunmaktadır. Projeniz sektöre özel bir standart gerektiriyorsa bunu teklif aşamasında açıkça değerlendiririz." },
      { question: "Hangi biyouyumlu malzemelerle çalışıyorsunuz?", answer: "Ti Grade 5 (Ti6Al4V), SS 316L, CoCrMo, PEEK ve UHMWPE malzemelerde işleme yapıyoruz. Malzemenin sertifikası tedarikçiden gelir ve talep etmeniz halinde teslimat dosyasına eklenir." },
      { question: "Yüzey işlemi yapıyor musunuz?", answer: "Elektropolisaj ve pasivasyon uygulanabilir. Hangi işlemin uygun olduğu malzemeye ve şartnamenize göre belirlenir." },
      { question: "İzlenebilirliği nasıl sağlıyorsunuz?", answer: "Malzeme parti ve döküm kaydı üzerinden izlenir; kontrol planında tanımlanan koteler ölçülür ve ölçüm kaydı teslimat dosyasına eklenir." },
      { question: "Çok küçük parçalar üretebiliyor musunuz?", answer: "Evet. Küçük çaplı vidalar, pimler ve konektörler üretilebilir; uzun ve ince geometrilerde kayar puntalı tornalama tercih edilir. Çalışma aralığı teknik resim incelemesinden sonra teklifte belirtilir." },
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
      "Ağırlığın kritik olduğu uygulamalarda titanyum bağlantı elemanları ve özel alaşım pervane milleri, şartnameye ve galvanik uyuma göre birlikte değerlendirilir.",
    ],
    features: [
      "Galvanik Uyum — temas eden malzemeler birlikte değerlendirilir",
      "Korozyon Direnci — Test gereksinimi şartnameye göre (ASTM B117)",
      "SS 316L & Duplex — Deniz suyu uyumlu malzemeler",
      "Elektropolisaj — Yüzey pürüzlülüğü ve korozyon davranışının iyileştirilmesi",
      "Bronz İşleme — C95400, C95500 denizcilik bronzu",
      "Pervane Mili — Titanyum ve Monel alaşımlar",
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "SS 316L, Duplex, Bronz" },
      { label: "Tuz Testi", value: "ASTM B117; şartnameye göre" },
      { label: "Malzeme Seçimi", value: "Galvanik uyuma göre" },
      { label: "Tolerans", value: "±0.01mm" },
    ],
    advantages: [
      "Malzeme seçimi galvanik uyum gözetilerek yapılır",
      "Tuz spreyi gereksinimi (ASTM B117) şartnameye göre planlanır",
      "SS 316L, Duplex ve bronz işleme uzmanlığı",
      "Elektropolisaj ve pasivasyon şartnameye göre uygulanır",
      "Elektropolisaj ile düşük pürüzlülük ve iyileşen korozyon davranışı",
      "Katodik koruma uyumlu malzeme danışmanlığı",
    ],
    faq: [
      { question: "Deniz suyu uyumlu hangi malzemeleri işliyorsunuz?", answer: "SS 316L, Duplex 2205, bronz (C95400, C95500), Monel 400 ve titanyum Grade 2 gibi deniz suyu uyumlu malzemelerle çalışıyoruz." },
      { question: "Tuz testi raporu veriyor musunuz?", answer: "Tuz spreyi testi (ASTM B117) şartnamede isteniyorsa test süresi ve kabul kriteri parçanın şartnamesine göre belirlenir; raporun kapsamı teklif aşamasında netleştirilir." },
    ],
  },

  // ── Endüstriyel > Endüstriyel Sistemler ──
  {
    slug: "hidrolik-pnomatik",
    category: "endustriyel",
    categoryLabel: "Endüstriyel Sistemler",
    title: "Hidrolik & Pnömatik",
    metaTitle: "Hidrolik & Pnömatik Parça Üretimi | Sızdırmazlık Yüzeyleri | Mas Technic",
    metaDescription: "Hidrolik ve pnömatik sistem bileşenleri: valf gövdesi, silindir, manifold blok. 42CrMo4, C45 çelik; çalışma basıncı ve sızdırmazlık yüzeyi gereksinimi şartnameye göre.",
    description: "Hidrolik ve pnömatik sistem bileşenleri: valf gövdeleri, silindir parçaları, manifold blokları ve özel akışkan güç komponentleri.",
    content: [
      "Hidrolik ve pnömatik sistemler için yüksek basınç dayanımlı bileşenler üretiyoruz. Valf gövdeleri (yönlendirme, basınç, akış kontrol), silindir parçaları (piston, gövde, kapak), manifold blokları (çok portlu, entegre devre) ve pompa bileşenleri konusunda uzmanız.",
      "O-ring ve sızdırmazlık yüzeyleri, sistemin çalışma basıncına ve conta üreticisinin yüzey gereksinimine göre işlenir. 42CrMo4, C45, SS 316 ve özel alaşımlarla üretim yapıyoruz. Derin delik delme ile manifold bloklarında iç kanal işleme gerçekleştiriyoruz.",
      "Basınç ve sızdırmazlık testleri, iş bazında kontrol planında tanımlanan kapsamda uygulanır ve sonuçlar kayıt altına alınır. Valf montaj yüzeyleri ISO 4401 delik düzenine göre işlenir; bağlantı geometrileri yaygın hidrolik bileşen arayüzleriyle çalışacak şekilde üretilir.",
    ],
    features: [
      "Valf Gövdesi — Yönlendirme, basınç ve akış kontrol valfleri",
      "Silindir Parçası — Piston, gövde, kapak, mil",
      "Manifold Blok — Çok portlu, derin delik kanallı",
      "Çalışma Basıncı — şartnamedeki basınca göre üretim",
      "Sızdırmazlık Yüzeyi — O-ring kanalları conta gereksinimine göre",
      "Basınç Testi — Kontrol planına göre sızdırmazlık kontrolü",
    ],
    technicalSpecs: [
      { label: "Çalışma basıncı", value: "Proje gereksinimi (şartname)" },
      { label: "Malzeme", value: "42CrMo4, C45, SS 316" },
      { label: "Basınç Testi", value: "Kontrol planında tanımlanır" },
      { label: "Delik Düzeni", value: "ISO 4401" },
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
      "Şartnamedeki çalışma basıncına göre üretim",
      "Sızdırmazlık yüzeylerinin conta gereksinimine göre işlenmesi",
      "Derin delik kabiliyeti ile manifold kanal işleme",
      "Kontrol planına göre basınç ve sızdırmazlık testi",
      "ISO 4401 delik düzeninde valf montaj yüzeyleri",
      "42CrMo4 ve SS 316 malzeme uzmanlığı",
    ],
    faq: [
      { question: "Kaç bar basınca kadar parça üretebiliyorsunuz?", answer: "Çalışma basıncı sistemin tasarım gereksinimidir; parça müşterinin şartnamesindeki basınca göre üretilir. Basınç testinin kapsamı ve test basıncı iş bazında kontrol planında tanımlanır." },
      { question: "Manifold bloklarında iç kanal açabilir misiniz?", answer: "Evet, derin delik delme ile manifold kanalları işlenir; ulaşılabilir boy/çap oranı kanal çapına ve malzemeye göre teklifte belirtilir." },
      { question: "Sızdırmazlık nasıl doğrulanıyor?", answer: "O-ring kanalları ve sızdırmazlık yüzeyleri conta gereksinimindeki Ra hedefiyle işlenir. Basınç ve sızdırmazlık testinin kapsamı iş bazında kontrol planında tanımlanır ve sonuçlar teslimat dosyasına eklenir." },
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
      { label: "Basınç Sınıfı", value: "Proje gereksinimi (şartname)" },
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
      "Isıl işlem ve NDT kaydı talebe bağlı",
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
    metaTitle: "HVAC & Soğutma Parça Üretimi | Mas Technic",
    metaDescription: "HVAC, soğutma ve havalandırma sistemi bileşenleri: kompresör parçası, valf, ısı eşanjörü. Çalışma sıcaklığı, basınç ve sızdırmazlık gereksinimi şartnameye göre.",
    description: "HVAC, soğutma ve havalandırma sistemleri için hassas mekanik bileşenler.",
    content: [
      "HVAC, soğutma ve havalandırma sistemleri için kompresör parçaları (piston, valf plakası, silindir), genleşme valfi bileşenleri, ısı eşanjör parçaları (boru plakası, baffle, bağlantı) ve fan-blower komponentleri üretiyoruz.",
      "Çalışma sıcaklığı ve basınç projenin gereksinimidir; malzeme seçimi bu koşullara göre yapılır. Sızdırmazlık testi (ör. helyum kaçak testi) ve kabul kriteri müşteri şartnamesine göre kontrol planında tanımlanır.",
      "Al 6061 (ısı eşanjör), bakır (Cu-DHP, iletkenlik), SS 304/316 (korozyon direnci) ve özel alaşımlarla üretim yapıyoruz. Soğutucu akışkan uyumluluğu (R-134a, R-410A, R-744) ve gıda teması gereksinimleri, malzeme seçiminde şartnamenize göre değerlendirilir.",
    ],
    features: [
      "Kompresör Parçası — Piston, valf plakası, silindir",
      "Isı Eşanjör — Boru plakası, baffle, bağlantı",
      "Genleşme Valfi — Hassas akış kontrolü",
      "Malzeme Seçimi — Çalışma sıcaklığına göre",
      "Sızdırmazlık — Test yöntemi ve kabul kriteri şartnameye göre",
      "Soğutucu Uyumlu — R-134a, R-410A, R-744",
    ],
    technicalSpecs: [
      { label: "Çalışma koşulları", value: "Proje gereksinimi (şartname)" },
      { label: "Sızdırmazlık", value: "Şartnameye göre" },
      { label: "Malzeme", value: "Al, Cu, SS 304/316" },
      { label: "Soğutucu", value: "R-134a, R-410A, R-744" },
      { label: "Soğutucu Sınıfı", value: "HFC / HFO / doğal" },
    ],
    advantages: [
      "Çalışma koşullarına göre malzeme seçimi",
      "Sızdırmazlık testi yöntemi şartnameye göre tanımlanır",
      "Soğutucu ile uyumlu malzeme seçimi",
    ],
    faq: [
      { question: "Sızdırmazlık testi nasıl tanımlanıyor?", answer: "Sızdırmazlık testinin yöntemi (ör. helyum kaçak testi) ve kabul edilebilir kaçak oranı müşteri şartnamesine göre kontrol planında tanımlanır; test kapsamı teklif aşamasında netleştirilir." },
      { question: "Hangi soğutucularla uyumlu parça üretiyorsunuz?", answer: "R-134a, R-410A, R-744 (CO₂) ve R-290 soğutucularla uyumlu malzeme ve yüzey işlemi ile üretim yapıyoruz." },
    ],
  },

  // ── Endüstriyel > Üretim Çözümleri ──
  {
    slug: "prototip-uretim",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Prototip Üretim",
    /* 09a-C2: all THREE of these carried "3-5 iş günü", and two of them ship
       into search results rather than the page body — a delivery promise in a
       `<title>` is quoted by Google beside the domain, where no reader ever
       sees the page that would qualify it. The route and the "hızlı prototip"
       positioning stay (§1.3 permits positioning through capability); what
       goes is the number nobody can substantiate. The page still has its case
       to make: real material, series-equivalent tolerance, single-unit orders
       and a three-iteration revision loop. */
    metaTitle: "Hızlı Prototip Üretimi | CNC, 3D Baskı, Silikon Kalıp | Mas Technic",
    metaDescription: "CNC, 3D baskı (FDM/SLA/SLS/DMLS) ve silikon kalıplama ile fonksiyonel prototip. Gerçek malzemede seri üretim eşdeğer tolerans, tek adetten üretim.",
    description: "CNC işleme, 3D baskı ve silikon kalıplama ile fonksiyonel prototip üretimi. Gerçek malzeme ile seri üretim eşdeğer kalite, tek adet sipariş.",
    content: [
      "Tasarım konseptlerinizi fiziksel ürünlere dönüştürüyoruz. CNC işleme ile gerçek malzemede (Al, SS, Ti, PEEK) seri üretim eşdeğer toleransta prototip, 3D baskı ile hızlı konsept doğrulama ve silikon kalıplama ile 10-50 adet çoklu prototip üretimi sunuyoruz.",
      "Fonksiyonel prototip ile parçanızı gerçek çalışma koşullarında test edebilirsiniz. DFM analizi ile tasarım iyileştirmesi ve seri üretime geçiş için kontrol planı hazırlığı sürecin parçasıdır. Tek adet sipariş kabul ediyoruz.",
      "Eklemeli imalat seçenekleri: FDM (ABS, PLA, naylon) biçim ve montaj denemeleri, SLA (reçine) ince detay ve yüzey, SLS (PA12) destek gerektirmeyen fonksiyonel parçalar ve DMLS ile metal fonksiyonel prototipler.",
    ],
    features: [
      "Tek Adet Sipariş — prototip için asgari adet yok",
      "Gerçek Malzeme — Al, SS, Ti, PEEK ile üretim",
      "3D Baskı — FDM, SLA, SLS, DMLS teknolojileri",
      "Silikon Kalıplama — Çoklu prototip",
      "DFM Analizi — Tasarım optimizasyonu dahil",
      "Revizyon Döngüsü — iterasyon sayısı teklifte belirtilir",
    ],
    technicalSpecs: [
      { label: "Teslim Süresi", value: LEAD_TIME_SHORT },
      { label: "Min. Adet", value: "1 adet" },
      { label: "Tolerans", value: "Seri üretim eşdeğer" },
      { label: "Malzeme", value: "Gerçek malzeme" },
      { label: "3D Baskı", value: "FDM, SLA, SLS, DMLS" },
      { label: "İterasyon", value: "Teklifte belirtilir" },
    ],
    advantages: [
      "Termin, yöntem ve malzeme seçildikten sonra teklifle birlikte verilir",
      "Gerçek malzeme ile fonksiyonel test imkanı",
      "4 farklı 3D baskı teknolojisi (metal dahil)",
      "DFM analizi ile tasarım optimizasyonu",
      "Revizyon döngüsü ile tasarım riskinin azaltılması",
      "Seri üretime sorunsuz geçiş desteği",
    ],
    faq: [
      { question: "En hızlı prototip ne kadar sürede hazır olur?", answer: `Yöntem seçimi termini doğrudan etkiler: 3D baskı konsept doğrulamada en hızlı seçenektir, CNC ise gerçek malzeme ve seri üretim eşdeğer tolerans gerektiğinde tercih edilir. ${LEAD_TIME_STATEMENT}` },
      { question: "Gerçek malzeme ile prototip yapabiliyor musunuz?", answer: "Evet, CNC ile Al 6061, SS 304, Ti6Al4V, PEEK gibi gerçek malzemelerde seri üretim eşdeğer toleransta prototip üretiyoruz." },
    ],
  },
  {
    slug: "kucuk-seri",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Küçük Seri Üretim",
    metaTitle: "Küçük Seri Üretim | CNC & Hızlı Kalıp | Mas Technic",
    metaDescription: "Küçük seri üretim: CNC işleme, alüminyum kalıp ve silikon kalıplama; hacim arttıkça düşen birim maliyet ve parti izlenebilirliği.",
    description: "Küçük seri üretim: prototipten küçük seriye geçiş, hacimle düşen birim maliyet ve parti bazlı izlenebilirlik.",
    content: [
      "Küçük seri üretim ihtiyaçlarınızı CNC işleme, hızlı alüminyum kalıp ve silikon kalıplama yöntemleri ile karşılıyoruz; yöntem adede ve hassasiyete göre seçilir ve teklifte belirtilir.",
      "Küçük seride birim maliyeti belirleyen asıl kalem kurulumdur: kurulum maliyeti adede bölündüğü için hacim arttıkça birim fiyat düşer. Kontrol planı ve parti bazlı izlenebilirlik standart olarak sağlanır; kademeli fiyatlandırma teklifle birlikte verilir.",
      "Pazar testi, pilot üretim ve pre-production aşamaları için ideal çözüm. Seri üretim geçiş planlaması dahil — kalıp yatırım analizi, otomasyon fizibilite ve maliyet projeksiyon raporu sunuyoruz.",
    ],
    features: [
      "Esnek Parti Büyüklüğü — Yöntem adede göre seçilir",
      "Hacim İndirimi — Adet arttıkça birim maliyet düşer",
      "Termin — kapasite planıyla birlikte teklifte verilir",
      "Kontrol Planı — küçük seride de standart olarak hazırlanır",
      "Pazar Testi — Pre-production ve pilot üretim desteği",
      "Seri Üretim Geçiş Planı — Ölçeklendirme danışmanlığı",
    ],
    technicalSpecs: [
      { label: "Adet Aralığı", value: "Teklifte belirtilir" },
      { label: "Teslim", value: LEAD_TIME_SHORT },
      { label: "Kalite", value: "Kontrol planı + ölçüm kaydı" },
      /* 09a-C2: "%15-25" and "%25-35 hacim indirimi" are a PRICE POLICY, not a
         duration — the reader is being told what discount they will get, and
         `USER_INPUTS.md` authorises no discount schedule. The page's own FAQ
         two fields below already gives the honest answer ("kademeli
         fiyatlandırmayı teklifle birlikte veriyoruz"), so the spec rows were
         contradicting the FAQ on the same page. The DIRECTION — unit cost falls
         as volume rises — is arithmetic about setup amortisation and stays. */
      { label: "Hacim İndirimi", value: "Kademeli fiyatlandırma teklifte" },
      { label: "Yöntemler", value: "CNC, Al kalıp, silikon" },
    ],
    advantages: [
      "Hacim indirimi ile maliyet optimizasyonu",
      "Termin, kurulum ve kapasite planı incelendikten sonra verilir",
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
      "Parti büyüklüğü ve teslimat programı kapasite planlamasıyla birlikte kararlaştırılır; periyodik teslimat ve çerçeve sipariş seçenekleri teklif aşamasında değerlendirilir.",
    ],
    features: [
      "Standart Kurulum — sabit referans ve tekrarlanabilir bağlama",
      "Otomatik Takım Değiştirme — uzun partilerde kesintisiz işleme",
      "İlk Parça Onayı — seri, onay alınmadan başlamaz",
      "Parti Kaydı — döküm ve parti bazlı izlenebilirlik",
      "Ara Kontrol — kayma eğilimi olan koteler izlenir",
      "Programlı Teslimat — parti büyüklüğü ve sıklık kapasiteyle birlikte",
    ],
    technicalSpecs: [
      { label: "Kurulum", value: "Standart prosedür" },
      { label: "Onay", value: "İlk parça onayı" },
      { label: "Kontrol", value: "Kontrol planına göre" },
      { label: "Ara Kontrol", value: "Kayma eğilimli koteler" },
      { label: "Teslimat", value: "Programa göre" },
      { label: "İzlenebilirlik", value: "Parti ve döküm kaydı" },
    ],
    advantages: [
      "Sabit referans yüzeyleriyle tekrarlanabilir bağlama",
      "Standart kurulum prosedürü ile partiler arası tutarlılık",
      "Ölçüm sonuçları parti bazında kayıt altına alınır",
      "Kayma eğilimi olan koteler ara kontrolle izlenir",
      "Teslimat programı kapasite planına bağlanır",
      "Parti durumu üretim boyunca kayıt altında tutulur",
    ],
    faq: [
      { question: "Seri üretim için asgari adet var mı?", answer: "Sabit bir asgari adet uygulamıyoruz. Parti büyüklüğü, teslimat programı ve fiyatlandırma kapasite planlaması yapıldıktan sonra teklifle birlikte netleşir." },
      { question: "Teslimat programı nasıl belirleniyor?", answer: "Kapasite planlaması sonrasında parti büyüklüğü ve teslimat sıklığı birlikte kararlaştırılır; haftalık veya periyodik teslimat programları düzenlenebilir." },
    ],
  },
  /* 09b-SOFTWARE-INVENTORY — sites 5 and 6 of six. `tasarım (SolidWorks,
     CATIA, NX)` in the content prose and `{ label: "CAD", value: "SolidWorks,
     CATIA, NX" }` in the spec table. The second is the one the file-exchange
     argument breaks on: a spec row labelled CAD listing three packages reads
     as supported INPUT, and the uploader refuses all three. The full reasoning
     is filed once, above `fikstur-aparat-tasarimi`; grep
     `09b-SOFTWARE-INVENTORY`. */
  {
    slug: "ozel-projeler",
    category: "endustriyel",
    categoryLabel: "Üretim Çözümleri",
    title: "Özel Mühendislik Projeleri",
    metaTitle: "Özel Mühendislik Projeleri | Anahtar Teslim | R&D | Reverse Engineering | Mas Technic",
    metaDescription: "Standart dışı özel mühendislik projeleri. Anahtar teslim çözümler, reverse engineering, R&D prototipleme, konseptten üretime tam süreç yönetimi.",
    description: "Standart çözümlerin yetersiz kaldığı özel mühendislik projeleri için anahtar teslim çözümler. Reverse engineering, R&D ve konseptten üretime tam süreç.",
    content: [
      "Standart çözümlerin yetersiz kaldığı özel mühendislik projelerinde reverse engineering (3D tarama → CAD → üretim), Ar-Ge prototipleme (konsept doğrulama → fonksiyonel test) ve özel aparat ile fikstür tasarım-imalatı yürütüyoruz. Elektronik veya yazılım içeren projelerde mekanik kapsam ayrıca tanımlanır.",
      "Proje yönetimi — konseptten üretime tüm süreçler tek çatı altında: fizibilite analizi, katı model tasarımı, prototip üretimi, test ve doğrulama, pilot üretim ve seri üretim geçişi. Her proje özel bir proje mühendisi tarafından yönetilir.",
      "Ürün geliştirme danışmanlığı sürecin parçasıdır. Teknik verinin nasıl paylaşılacağı ve fikri mülkiyetin nasıl ele alınacağı proje başında yazılı olarak mutabık kalınır.",
    ],
    features: [
      "Anahtar Teslim — Konseptten üretime tam çözüm",
      "Reverse Engineering — 3D tarama, CAD modelleme, üretim",
      "R&D Prototipleme — Konsept doğrulama ve fonksiyonel test",
      "Özel Tezgah Tasarımı — Fikstür ve aparat imalatı",
      "Mekanik Kapsam — Tasarım ve imalat",
      "Fikri Mülkiyet — koşullar proje başında yazılı olarak belirlenir",
    ],
    technicalSpecs: [
      { label: "Süreç", value: "Konseptten üretime" },
      { label: "3D Tarama", value: "Parça ölçüsüne göre" },
      { label: "Tasarım", value: "Katı model ve teknik resim" },
      { label: "Koşullar", value: "Proje başında yazılı" },
      { label: "Proje Yönetimi", value: "Özel proje mühendisi" },
    ],
    advantages: [
      "Konseptten seri üretime anahtar teslim çözüm",
      "Reverse engineering ile yedek parça üretimi",
      "R&D prototipleme ve fonksiyonel test desteği",
      "Teknik veri ve fikri mülkiyet koşulları proje başında netleşir",
      "Özel proje mühendisi ile tek muhatap",
    ],
    faq: [
      { question: "Reverse engineering yapabiliyor musunuz?", answer: "Evet, 3D tarama ile mevcut parçanızı dijitalleştiriyor, CAD modeline dönüştürüyor ve üretiyoruz; tarama hassasiyeti parça ölçüsüne ve yüzeyine göre belirlenir." },
      { question: "Teknik verim nasıl ele alınıyor?", answer: "Teknik verinin nasıl paylaşılacağı ve fikri mülkiyetin nasıl ele alınacağı proje başında yazılı olarak mutabık kalınır. İhtiyacınızı teklif aşamasında belirtin." },
    ],
  },

  // ── Endüstriyel > Enerji & Altyapı ──
  {
    slug: "yenilenebilir-enerji",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Yenilenebilir Enerji",
    metaTitle: "Yenilenebilir Enerji Parça Üretimi | Rüzgar & Güneş | Mas Technic",
    metaDescription: "Rüzgar türbini ve güneş enerjisi sistemi bileşenleri. Hot-dip galvaniz korozyon koruması, ağır yük parçaları. Hub, pitch sistemi, montaj aparatı üretimi.",
    description: "Rüzgar türbini, güneş enerjisi ve enerji depolama sistemleri için dış ortam koşullarına göre malzeme ve kaplama seçilerek üretilen bileşenler.",
    content: [
      "Rüzgar türbini bileşenleri (hub, nacelle, pitch sistemi, yaw sistemi, tower flanşı), güneş paneli montaj sistemleri (tracker, sabit montaj, rail, klamp) ve enerji depolama parçaları (batarya muhafazası, soğutma bileşenleri) üretiyoruz.",
      "Malzeme ve kaplama dış ortam koşullarına göre seçilir. Hot-dip galvaniz (ISO 1461), Dacromet kaplama ve SS 316L malzeme ile korozyon koruması sağlanır; kaplama kalınlığı ve beklenen ömür ortam sınıfına ve şartnameye göre belirlenir. GGG-40, GGG-50 küresel grafitli dökme demir ve yüksek mukavemetli çeliklerle ağır yük bileşenleri üretiyoruz.",
    ],
    features: [
      "Rüzgar Türbini — Hub, pitch, yaw, tower flanşı",
      "Güneş Paneli Montaj — Tracker, rail, klamp",
      "Ağır Yük Bileşenleri — GGG-40/50 ve yüksek mukavemetli çelik",
      "Hot-Dip Galvaniz — ISO 1461",
      "Dış Ortam Dayanımı — Ortam sınıfına göre malzeme ve kaplama",
      "Enerji Depolama — Batarya muhafaza, soğutma",
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "SS 316L, GGG-40, S355" },
      { label: "Korozyon Koruması", value: "Hot-dip galvaniz (ISO 1461)" },
      { label: "Dayanım", value: "Şartnameye göre" },
      { label: "Kapsam", value: "Rüzgar, güneş, depolama" },
      { label: "NDT", value: "Şartnameye göre" },
    ],
    advantages: [
      "Dış ortam koşullarına göre malzeme ve kaplama seçimi",
      "Hot-dip galvaniz ile korozyon koruması",
      "GGG-40/50 dökme demir işleme uzmanlığı",
      "NDT kapsamı şartnameye göre kontrol planında",
    ],
    faq: [
      { question: "Rüzgar türbini bileşenleri üretebiliyor musunuz?", answer: "Evet; hub, pitch sistemi, yaw mekanizması, tower flanşı ve nacelle iç bileşenleri üretiyoruz. Uygulanacak şartname ve kabul kriterleri iş bazında müşteriyle birlikte belirlenir." },
      { question: "Dış ortam dayanımı nasıl belirleniyor?", answer: "Hot-dip galvaniz (ISO 1461) ve ortam koşuluna uygun malzeme seçimi ile korozyon koruması sağlanır; beklenen dış ortam ömrü ortam sınıfına ve kaplama sistemine göre şartnamede tanımlanır." },
    ],
  },
  {
    slug: "petrol-gaz",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Petrol & Gaz",
    metaTitle: "Petrol & Gaz Parça Üretimi | Mas Technic",
    metaDescription: "Petrol ve gaz sektörü bileşenleri; Inconel, Duplex ve Super Duplex çelik işleme. Basınç ve sıcaklık sınıfı müşteri şartnamesine göre.",
    description: "Petrol ve gaz sektörü için kritik parçalar; basınç ve sıcaklık sınıfı projenin şartnamesine göre.",
    content: [
      "Petrol ve gaz sektörünün zorlu çalışma koşullarına uygun yüksek dayanımlı parçalar üretiyoruz. Wellhead ve Christmas tree bileşenleri, choke ve kontrol valfleri, boru bağlantı parçaları (API 6A flanş, hub), manifold ve BOP (Blowout Preventer) komponentleri imal ediyoruz.",
      "Wellhead, pipeline valf ve casing uygulamalarında çalışma basıncı ve sıcaklık aralığı projenin gereksinimidir ve müşteri şartnamesinde tanımlanır; parça bu gereksinime göre üretilir. Sour service uygulamalarında malzeme, ısıl işlem ve sertlik sınırları müşteri şartnamesine göre belirlenir ve kayıt altına alınır.",
      "Inconel 625/718, Duplex 2205, Super Duplex 2507, F22 (2.25Cr-1Mo) ve SS 316L gibi korozyon ve yüksek sıcaklık dayanımlı malzemelerle çalışıyoruz. Tahribatsız muayene (RT, UT, MPI, PMI) kapsamı, şartnameye göre kontrol planında tanımlanır.",
    ],
    features: [
      "Wellhead & Pipeline — Flanş, hub, valf gövdesi",
      "Basınç Sınıfı — Proje gereksinimi, şartnameye göre",
      "Sour Service — Şartnameye göre malzeme ve ısıl işlem",
      "Inconel & Duplex — Korozyon dirençli özel alaşımlar",
      "Tahribatsız Muayene — RT, UT, MPI, PMI; kapsam plana yazılır",
    ],
    technicalSpecs: [
      { label: "Kapsam", value: "Wellhead, pipeline, casing" },
      { label: "Basınç sınıfı", value: "Proje gereksinimi (şartname)" },
      { label: "Sour Service", value: "Şartnameye göre" },
      { label: "Malzeme", value: "Inconel, Duplex, F22" },
      { label: "NDT", value: "RT, UT, MPI, PMI" },
    ],
    advantages: [
      "Wellhead ve pipeline bileşeni üretim kapasitesi",
      "Sour service için şartnameye göre malzeme seçimi",
      "Inconel ve Super Duplex işleme uzmanlığı",
      "Tahribatsız muayene kapsamı kontrol planında tanımlanır",
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
    metaTitle: "Güç Dağıtım Parça Üretimi | Mas Technic",
    metaDescription: "Elektrik dağıtım ve güç sistemi bileşenleri: bakır ve alüminyum bara, kontak parçası, izolatör montaj elemanı. İletkenlik malzeme sertifikasıyla teyit edilir.",
    description: "Elektrik dağıtım panoları, transformatör bileşenleri ve güç dağıtım sistemi parçaları.",
    content: [
      "Elektrik dağıtım sistemi bileşenleri üretiyoruz: bakır ve alüminyum baralar, kontak parçaları (gümüş kaplama, düşük temas direnci), izolatör montaj elemanları ve pano iç bileşenleri. Gerilim sınıfı projenin gereksinimidir ve müşteri şartnamesinde tanımlanır.",
      "OFE bakır (C10100), ETP bakır (C11000) ve elektrik kalitesi alüminyum (1050/1070) gibi yüksek iletkenlikli malzemelerle parça üretiyoruz; iletkenlik değeri malzeme sertifikasıyla teyit edilir. Gümüş kaplama kontak direncini düşürür, nikel ara katman difüzyon bariyeri oluşturur.",
      "Isıl yük, kısa devre dayanımı ve ark gereksinimleri projenin şartnamesinde tanımlanır; parça bu gereksinimlere ve müşterinin onayladığı tasarıma göre üretilir.",
    ],
    features: [
      "Pano İç Bileşenleri — İzolator montaj ve bağlantı elemanları",
      "Gerilim Sınıfı — Proje gereksinimi, şartnameye göre",
      "Yüksek İletkenlik — OFE ve ETP bakır, sertifikayla teyit",
      "Gümüş Kaplama — Düşük kontak direnci",
      "Bara Üretimi — Bakır ve alüminyum iletken",
      "Şartnameye Uygun Üretim — Isıl ve elektriksel gereksinimler",
    ],
    technicalSpecs: [
      { label: "Malzeme", value: "Cu (OFE, ETP), Al 1050" },
      { label: "İletkenlik", value: "Malzeme sertifikasıyla" },
      { label: "Gerilim sınıfı", value: "Proje gereksinimi (şartname)" },
      { label: "Kapsam", value: "Bara, kontak, izolator montaj" },
      { label: "Kaplama", value: "Ag (gümüş), Ni altlık" },
      { label: "Test", value: "Şartnameye göre" },
    ],
    advantages: [
      "Yüksek iletkenlikli bakır işleme",
      "Gümüş kaplama ile düşük kontak direnci",
      "Şartnamedeki ısıl ve elektriksel gereksinimlere göre üretim",
    ],
    faq: [
      { question: "OFE bakır işleyebiliyor musunuz?", answer: "Evet, OFE bakır (C10100) ve ETP bakır (C11000) işlenir; iletkenlik değeri malzeme sertifikasıyla teyit edilir." },
      { question: "Gümüş kaplama yapıyor musunuz?", answer: "Evet, kontak parçaları için gümüş kaplama (nikel altlık üzerine) uygulanır. Kaplama kalınlığı ve yapışma kontrolü şartnameye göre kontrol planında tanımlanır." },
    ],
  },
  {
    slug: "madencilik-ekipmanlari",
    category: "endustriyel",
    categoryLabel: "Enerji & Altyapı",
    title: "Madencilik Ekipmanları",
    metaTitle: "Madencilik Ekipman Parçaları | Aşınma Çeliği | Mas Technic",
    metaDescription: "Madencilik makineleri için Hardox ve manganez çeliği gibi aşınmaya dayanıklı malzemelerle parça üretimi. Sertlik ve ısıl işlem gereksinimi şartnameye göre; çalışma aralığı teklifte belirtilir.",
    description: "Madencilik sektörünün ağır çalışma koşullarına uygun, Hardox ve manganez çeliği ile aşınmaya dayanıklı bileşenler.",
    content: [
      "Madencilik sektörünün ağır çalışma koşullarına uygun, aşınmaya ve darbeye dayanıklı parçalar üretiyoruz. Kırıcı bileşenleri (çene, çekiç, astar plakası), konveyör parçaları (rulo, tambur, kayar yatak), delici ekipman komponentleri (uç, gövde, adaptör) ve eleme-sınıflandırma bileşenleri imal ediyoruz.",
      "Hardox 400/500/600 (aşınma çeliği), manganez çeliği (Mn13 — darbe ile sertleşen), beyaz dökme demir (krom karbür — aşırı aşınma) ve 42CrMo4 (QT — genel ağır iş) malzemeleri ile üretim yapıyoruz. Yüzey sertliği ve gerekiyorsa ısıl işlem gereksinimi müşteri şartnamesine göre tanımlanır.",
      "Büyük ve ağır madencilik parçalarında CNC ve konvansiyonel tezgah işlemesi birlikte planlanır. Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir.",
    ],
    features: [
      "Kırıcı Bileşeni — Çene, çekiç, astar plakası",
      "Konveyör Parçası — Rulo, tambur, kayar yatak",
      "Hardox 400/500/600 — Aşınma çeliği uzmanlığı",
      "Sertlik — Şartnameye göre",
      "Manganez Çeliği — Darbe ile sertleşen Mn13",
    ],
    technicalSpecs: [
      { label: "Sertlik", value: "Şartnameye göre" },
      { label: "Malzeme", value: "Hardox, Mn13, 42CrMo4" },
      { label: "Çalışma aralığı", value: "Teklifte belirtilir" },
      { label: "NDT", value: "Şartnameye göre" },
    ],
    advantages: [
      "Hardox 400/500/600 aşınma çeliği uzmanlığı",
      "Aşınmaya dayanıklı malzeme seçimi",
      "Manganez çeliği ile darbe direnci",
      "Isıl işlem (indüksiyon, sementasyon) şartnameye göre",
      "NDT kapsamı şartnameye göre tanımlanır",
    ],
    faq: [
      { question: "Hardox işleyebiliyor musunuz?", answer: "Evet, Hardox 400, 500 ve 600 serisi aşınma çeliklerini CNC ile işleyebiliyoruz. Özel takım ve ilerleme parametreleri ile optimal sonuç elde ediyoruz." },
      { question: "Büyük ve ağır parça işleyebiliyor musunuz?", answer: "Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir. Ağır parçalarda vinçli yükleme ve özel bağlama düzenleri kullanılır." },
    ],
  },
];

export const getPageBySlug = (slug: string): ServicePageData | undefined =>
  servicePages.find((p) => p.slug === slug);

export const getPagesByCategory = (category: string): ServicePageData[] =>
  servicePages.filter((p) => p.category === category);
