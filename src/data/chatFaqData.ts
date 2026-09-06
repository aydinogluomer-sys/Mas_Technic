import { LEAD_TIME_STATEMENT, PUBLIC_CITY, QUOTE_RESPONSE_TIME } from "@/content/claims";
import { CAD_ACCEPTED_EXTENSIONS } from "@/utils/cadUpload";
import { servicePages } from "./servicePages";

/**
 * ".step, .stp, .stl, .obj, .iges, .igs, .3mf"
 *
 * Elle yazılan liste SolidWorks, DXF, DWG ve PDF'i kabul ettiğimizi söylüyordu;
 * `validateCadFile` dördünü de reddediyor. §J
 * `ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`.
 */
const CAD_EXTENSION_LIST = CAD_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(", ");

export interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   BU DOSYA BİR YAYIN YÜZEYİDİR — 09a-C2

   `ChatBot.tsx` `findBestFaqMatch()` sonucunun `answer` alanını doğrudan
   ekrana yazar ve yanıtlar YERELDİR: hiçbir ağ çağrısı, hiçbir moderasyon
   katmanı yok. Buradaki bir cümle, ziyaretçiye şirket politikası olarak
   söylenir. Bu yüzden yayın eşiği bir sayfa metniyle aynıdır, daha düşük
   değil.

   Aynı sebeple `collectServiceFaqs()` `servicePages.ts` içindeki HER `faq`
   girdisini buraya taşır: o dosyadaki bir teslim süresi iddiası, düzeltilmemiş
   bir sohbet yanıtıdır.

   09a-C2'de kaldırılanlar: üretim/teslim süreleri, ödeme ve vade koşulları,
   iade/değişim taahhüdü, çalışma saatleri ve `İstanbul merkezli` — sonuncusu
   §A `PUBLIC_CITY: İzmir` ile ve bu dosyanın kendi adres yanıtıyla
   çelişiyordu. Süre gerektiren yerlerde tek kaynak `@/content/claims`:
   yetkili olan `QUOTE_RESPONSE_TIME`, olmayan yerde `LEAD_TIME_STATEMENT`.
   ═══════════════════════════════════════════════════════════════════════════ */
const staticEntries: FaqEntry[] = [
  {
    question: "Teklif nasıl alabilirim?",
    answer: "Teklif almak için [Teklif Al](/teklif-al) sayfamızı ziyaret edebilirsiniz. CAD dosyanızı yükleyerek hızlı teklif alabilirsiniz. Alternatif olarak sales@mastechnic.com adresine mail atabilirsiniz.",
    keywords: ["teklif", "fiyat", "maliyet", "ücret", "para", "ne kadar", "kaç tl", "bütçe", "hesap"],
  },
  {
    question: "İletişim bilgileriniz nelerdir?",
    answer: "📞 Telefon: +90 (536) 564 51 94\n📧 E-posta: sales@mastechnic.com\n📍 Adres: Ataşehir Mah., 8287. Sok. No: 4, 35620 Çiğli/İzmir\n\nDetaylı bilgi için [İletişim](/iletisim) sayfamızı ziyaret edin.",
    keywords: ["iletişim", "telefon", "adres", "email", "mail", "nerede", "konum", "ulaşım", "numara"],
  },
  {
    question: "Hangi sektörlere hizmet veriyorsunuz?",
    answer: "Havacılık & uzay, savunma sanayi, otomotiv, medikal, robotik, enerji, denizcilik, hidrolik ve daha birçok sektöre hizmet veriyoruz. Detaylar için [Endüstriyel Çözümler](/endustriyel) sayfamıza bakabilirsiniz.",
    keywords: ["sektör", "endüstri", "havacılık", "otomotiv", "medikal", "savunma", "hangi sektör"],
  },
  {
    question: "Prototip üretimi yapıyor musunuz?",
    answer: `Evet! Tek parçadan başlayarak prototip üretimi yapıyoruz. ${LEAD_TIME_STATEMENT} Detaylar için [Prototip Üretim](/endustriyel/prototip-uretim) sayfamıza bakın.`,
    keywords: ["prototip", "numune", "tek parça", "deneme", "örnek", "sample"],
  },
  {
    question: "Hangi CNC hizmetleri sunuyorsunuz?",
    answer: "CNC frezeleme (3-4-5 eksen), CNC tornalama, hassas mikro işleme, derin delik & raybalama, lazer kazıma, yüzey işlemleri, montaj ve daha fazlası. Tüm hizmetlerimiz için [Hizmetler](/hizmetler) sayfamızı inceleyin.",
    keywords: ["cnc", "hizmet", "servis", "ne yapıyorsunuz", "neler sunuyorsunuz", "frezeleme", "tornalama"],
  },
  {
    question: "Teslimat süreniz ne kadar?",
    answer: `${LEAD_TIME_STATEMENT} Bir işin terminini çoğu zaman tezgâh değil malzemenin gelişi belirler; bu nedenle tedarik durumu üretim planlanmadan önce, teklif aşamasında değerlendirilir.`,
    keywords: ["teslimat", "süre", "zaman", "ne zaman", "kaç gün", "hızlı", "acil", "termin"],
  },
  {
    question: "Hangi malzemelerle çalışıyorsunuz?",
    answer: "Alüminyum (6061, 7075), paslanmaz çelik (304, 316), karbon çelik, titanyum, pirinç, bakır, PEEK ve POM/Delrin gibi mühendislik malzemeleriyle çalışıyoruz. [Malzeme Kütüphanesi](/malzemeler) sayfamızda detayları bulabilirsiniz.",
    keywords: ["malzeme", "metal", "alüminyum", "çelik", "titanyum", "plastik", "pirinç", "bakır", "paslanmaz"],
  },
  {
    question: "Minimum sipariş adedi var mı?",
    answer: "Minimum sipariş adedi 1 (tek parça) olarak belirlenmiştir. Prototipten seri üretime kadar esnek üretim planlaması yapıyoruz.",
    keywords: ["minimum", "adet", "sipariş", "kaç adet", "en az", "miktar"],
  },
  {
    question: "Kalite sertifikalarınız nelerdir?",
    answer: "ISO 9001:2015, ISO 14001:2015 ve OHSAS 18001 yönetim sistemi belgelerimiz bulunmaktadır. Her iş için kontrol planı oluşturulur; ölçüm kaydı teslimat dosyasına eklenir, akredite üçüncü taraf CMM ölçümü talebe bağlı olarak sağlanır.",
    keywords: ["kalite", "sertifika", "iso", "standart", "belge", "rapor"],
  },
  {
    question: "Tolerans değerleriniz nedir?",
    answer: "Standart çalışma aralığımız ±0.01mm olup ulaşılabilir tolerans; geometri, malzeme ve ölçü zincirine göre teknik incelemede belirlenir. Detaylar için [Tolerans & Hassasiyet](/kabiliyetler/tolerans-hassasiyet) sayfamızı inceleyin.",
    keywords: ["tolerans", "hassasiyet", "doğruluk", "precision", "accuracy"],
  },
  // ── Kargo & Teslimat ──
  {
    question: "Kargo ile gönderim yapıyor musunuz?",
    answer: "Evet, Türkiye genelinde anlaşmalı kargo firmalarıyla güvenli gönderim yapıyoruz. Yurt dışı sevkiyat için de DHL, FedEx ve UPS ile çalışıyoruz. Özel paketleme ve sigortalı gönderim seçenekleri mevcuttur.",
    keywords: ["kargo", "gönderim", "sevkiyat", "gönderi", "paket", "ulaştırma", "dhl", "fedex", "ups", "nakliye"],
  },
  {
    question: "Yurt dışına teslimat yapıyor musunuz?",
    answer: "Evet, dünya genelinde ihracat yapıyoruz. Avrupa, Orta Doğu, ABD ve Asya'ya düzenli sevkiyatlarımız bulunmaktadır. İhracat belgeleri ve gümrük işlemlerinde destek sağlıyoruz.",
    keywords: ["yurt dışı", "ihracat", "export", "uluslararası", "avrupa", "amerika", "gümrük"],
  },
  // ── İade ──
  // "Garanti veriyor musunuz?" girdisi kaldırıldı: koşulsuz bir uygunluk
  // garantisi ve ücretsiz yeniden üretim taahhüdü veriyordu; USER_INPUTS.md'de
  // bunu yetkilendiren bir alan yok. Bu kaldırma doğru ve kalıcıdır.
  //
  // Ancak yalnızca yanıtı kaldırmak yetmedi: "garanti veriyor musunuz" sorusu
  // varsayılan yanıta düşmüyor, 0.67 skorla DFM tasarım-desteği yanıtına
  // yanlış yönleniyordu. Sitenin ticari olarak en yüklü sorusuna kendinden
  // emin ve yanlış bir cevap, cevapsızlıktan kötüdür. `garanti`/`güvence`
  // artık burada ANAHTAR KELİME olarak duruyor: anahtar kelime dizisi
  // eşleştirici girdisidir, yayımlanan metin değil — hiçbir bileşen render
  // etmez.
  //
  // 09a-C2: yanıtın kendisi de değişti. "Teknik şartnameye uymayan ürünlerde
  // ÜCRETSİZ İADE/DEĞİŞİM yapılmaktadır. Teslimat sonrası 7 iş günü içinde …"
  // bir garanti taahhüdüydü — Phase 06'da kaldırılan girdinin aynısı, bu kez
  // "garanti" kelimesi kullanılmadan yazılmıştı. USER_INPUTS.md'de iade,
  // değişim veya ayıp bildirimi süresini yetkilendiren bir alan yok; §D
  // kabiliyet değerleri verir, taahhüt değil. Bir ticari POLİTİKA iddiası
  // "teklifle birlikte" diye yumuşatılamaz — okuyucuya bir sayı değil bir
  // politika söyleniyor — bu yüzden iddia kaldırıldı. Yerine, sitenin başka
  // yerlerinde zaten yayımlanan MEKANİZMA geçti: kontrol planı, ölçüm kaydı
  // ve koşulların siparişe göre kararlaştırıldığı gerçeği. Soru duruyor;
  // yalnızca cevap artık verilmemiş bir sözü vermiyor.
  {
    question: "İade veya değişim yapılabiliyor mu?",
    answer: "Uygunluk, kontrol planında tanımlanan koteler ve teslimat dosyasındaki ölçüm kaydı üzerinden değerlendirilir. Bir uygunsuzluk tespit ederseniz ölçüm sonuçlarıyla birlikte sales@mastechnic.com adresine bildirin; nasıl ilerleneceği siparişin koşullarına göre birlikte kararlaştırılır.",
    keywords: [
      "iade",
      "değişim",
      "geri gönderme",
      "uyumsuz",
      "hatalı",
      "kusurlu",
      "return",
      "warranty",
      "sorumluluk",
      "garanti",
      "güvence",
    ],
  },
  // ── Ödeme ──
  // 09a-C2: iki yanıt da ödeme ve KREDİ koşulu yayımlıyordu — "açık hesap
  // (anlaşmalı müşteriler), vadeli ödeme", "%50 ÖN ÖDEME … kalan %50
  // teslimatta", "AÇIK HESAP ve 30-60 GÜN VADE imkânı sunuyoruz". Bunlar
  // teslim süresi değil, sözleşme koşuludur ve USER_INPUTS.md'de hiçbir alan
  // bunları yetkilendirmiyor; §J yalnızca teklif SLA'sını verir. Soruların
  // ikisi de gerçek ve duruyor: eşleştirici bir soruyu cevapsız bıraktığında
  // 0.6 eşiğinin altına düşen bir başka yanıta savrulur, ki bu kaldırılan
  // yanıttan da kötüdür.
  {
    question: "Ödeme yöntemleriniz nelerdir?",
    answer: "Ödeme koşulları siparişe göre teklifte belirlenir; kurumsal fatura ve e-fatura kesiyoruz. Hangi yöntemle ilerleyebileceğimizi teklif aşamasında netleştiriyoruz.",
    keywords: ["ödeme", "havale", "eft", "kredi kartı", "fatura", "e-fatura", "vade", "peşin", "taksit", "banka"],
  },
  {
    question: "Peşin ödeme zorunlu mu?",
    answer: "Yayımlanan sabit bir ödeme koşulumuz yok. Koşullar siparişe göre teklifte belirlenir ve teklif aşamasında birlikte netleştirilir.",
    keywords: ["peşin", "ön ödeme", "avans", "vade", "vadeli", "taksit", "ödeme koşulları"],
  },
  // ── Dosya Formatları ──
  {
    question: "Hangi CAD dosya formatlarını kabul ediyorsunuz?",
    /* 09a-C3: "En çok tercih edilen format STEP'tir." kaldırıldı. Listenin
       kendisi türetiliyordu ama bu cümle bir format adını ELLE yazıyordu —
       §J'ye göre yayımlanan hiçbir format adı elle yazılmaz. Üstelik bir
       TERCİH SIRASI `CAD_ACCEPTED_EXTENSIONS`ta kodlanmış bir bilgi değil,
       yani türetilebilir de değildi; dizideki sıra tesadüftür. Türetilmiş
       liste okuyucuya ne göndereceğini zaten söylüyor.
       Anahtar kelimeler aynen KALIR: onlar eşleştirici girdisidir, ekrana
       basılmaz, ve `step`/`iges` yazan ziyaretçiyi bu doğru cevaba taşırlar. */
    answer: `Teklif akışında doğrudan yükleyebileceğiniz formatlar: ${CAD_EXTENSION_LIST}. Listede olmayan bir format veya ölçülendirilmiş teknik resim için dosyayı sales@mastechnic.com adresine iletebilirsiniz.`,
    keywords: ["dosya", "format", "cad", "step", "iges", "stl", "obj", "3mf", "çizim", "3d", "model"],
  },
  // ── Çalışma Saatleri ──
  // 09a-C2: "Pazartesi – Cuma: 08:00 – 18:00" ile "Acil siparişler için hafta
  // sonu da üretim yapılabilmektedir" kaldırıldı. Phase 07 aynı çalışma saati
  // bloğunu `/iletisim` sayfasından, "hiçbir alan bunları yetkilendirmiyor"
  // gerekçesiyle çıkarmıştı; hafta sonu üretimi ise bir kapasite taahhüdüdür.
  // Bir olguyu bir yüzeyden kaldırıp diğerinde bırakmak, bu fazın düzeltmek
  // için var olduğu hatanın ta kendisi. Yerine yetkili olan tek süre geçti.
  {
    question: "Çalışma saatleriniz nedir?",
    answer: `Teklif ve teknik sorularınız için sales@mastechnic.com adresine her zaman yazabilirsiniz; teklif dönüş süremiz ${QUOTE_RESPONSE_TIME}dür. Telefon ve adres bilgisi [İletişim](/iletisim) sayfamızda.`,
    keywords: ["çalışma", "saat", "mesai", "açık", "kapalı", "hafta sonu", "cumartesi", "pazar", "zaman"],
  },
  // ── Yüzey İşlemleri ──
  {
    question: "Hangi yüzey işlemlerini yapıyorsunuz?",
    answer: "Anodizasyon, kumlama, boyama, krom kaplama, nikel kaplama, siyah oksit, pasivasyon, eloksal ve daha fazlası. [Yüzey İşlemleri](/hizmetler/yuzey-islemleri) sayfamızda detayları bulabilirsiniz.",
    keywords: ["yüzey", "anodizasyon", "kaplama", "boyama", "krom", "nikel", "kumlama", "eloksal", "pasivasyon", "finishing"],
  },
  // ── Seri Üretim ──
  {
    question: "Seri üretim yapıyor musunuz?",
    answer: "Evet, tek parçadan seri üretime kadar çalışıyoruz. Seri üretimde birim maliyet avantajı ve tutarlı kalite sağlıyoruz. [Seri Üretim](/kabiliyetler/seri-uretim) sayfamızı inceleyin.",
    keywords: ["seri", "seri üretim", "toplu", "adet", "büyük sipariş", "volume", "mass production"],
  },
  // ── Teknik Destek ──
  {
    question: "Tasarım desteği veriyor musunuz?",
    answer: "Evet! DFM (Design for Manufacturing) analizi ile tasarımınızı üretime uygun hale getirmenize yardımcı oluyoruz. Maliyet ve süre optimizasyonu için öneriler sunuyoruz.",
    keywords: ["tasarım", "dfm", "design", "destek", "mühendislik", "optimizasyon", "danışmanlık"],
  },
  {
    question: "Teknik çizim yapıyor musunuz?",
    answer: "Evet, 3D modelleme ve 2D teknik çizim hizmeti sunuyoruz. Müşterilerimizin taslak çizimlerinden üretime hazır CAD dosyaları oluşturabiliyoruz.",
    keywords: ["çizim", "teknik çizim", "modelleme", "3d model", "2d", "cad tasarım"],
  },
  // ── Müşteri Paneli ──
  {
    question: "Müşteri paneli nedir?",
    answer: "Müşteri panelimizden siparişlerinizi takip edebilir, tekliflerinizi görüntüleyebilir, kalite raporlarına erişebilir ve destek talebi oluşturabilirsiniz. [Giriş Yap](/giris) sayfasından hesabınıza erişin.",
    keywords: ["müşteri paneli", "panel", "portal", "hesap", "giriş", "login", "sipariş takip", "dashboard"],
  },
  // ── Genel Bilgiler ──
  // 09a-C2: "İstanbul merkezli" yanlıştı. §A `PUBLIC_CITY: İzmir`, footer,
  // JSON-LD, `/iletisim` ve bu dosyanın kendi adres yanıtı (Çiğli/İzmir)
  // hepsi İzmir diyor. Değer artık ledger'dan geliyor.
  {
    question: "MAS Technic nedir?",
    answer: `MAS Technic, ${PUBLIC_CITY} merkezli hassas CNC imalat firmasıdır. Prototipten seri üretime, havacılık-savunma-otomotiv-medikal başta olmak üzere birçok sektöre hizmet vermekteyiz. [Hakkımızda](/hakkimizda) sayfamızda detayları bulabilirsiniz.`,
    keywords: ["mas technic", "kimsiniz", "firma", "şirket", "hakkında", "nedir", "tanıtım"],
  },
  {
    question: "Makine parkurunuz nedir?",
    answer: "3-4-5 eksen CNC freze, CNC torna, EDM, taşlama, CMM ölçüm cihazları ve lazer markalama makineleri dahil geniş bir makine parkurumuz bulunmaktadır. [Makine Parkuru](/kabiliyetler/makine-parkuru) sayfamızı inceleyin.",
    keywords: ["makine", "parkur", "tezgah", "ekipman", "kapasite", "eksen", "freze", "torna"],
  },
];

// ── servicePages FAQ'larından otomatik toplama ──
function collectServiceFaqs(): FaqEntry[] {
  const entries: FaqEntry[] = [];
  for (const page of servicePages) {
    if (!page.faq) continue;
    for (const f of page.faq) {
      // Soru ve cevaptan otomatik keyword çıkar
      const combined = `${f.question} ${f.answer}`.toLowerCase();
      const words = combined
        .replace(/[^\wğüşöçıİĞÜŞÖÇ]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const uniqueWords = [...new Set(words)];
      entries.push({
        question: f.question,
        answer: f.answer,
        keywords: uniqueWords,
      });
    }
  }
  return entries;
}

export const allFaqEntries: FaqEntry[] = [
  ...staticEntries,
  ...collectServiceFaqs(),
];

/**
 * Soru kalıbı kelimeleri: hemen her SSS sorusunda geçen, konu taşımayan
 * yardımcı fiiller ve soru edatları.
 *
 * Bunlar skora girdiğinde eşleştirici konuyu değil kalıbı eşliyor:
 * "garanti veriyor musunuz" sorusu `veriyor` + `musunuz` üzerinden
 * "Tasarım desteği veriyor musunuz?" yanıtını 0.67 ile kazanıyordu. İki
 * tarafta da elenirler; hepsi elenirse ham kelimelere geri düşülür, böylece
 * tek başına "nerede" gibi bir girdi sessizleşmez.
 */
const QUESTION_FORM_WORDS = new Set([
  // soru eki
  "musunuz", "misiniz", "mısınız", "müsünüz", "mudur", "mıdır", "midir", "müdür",
  // "…yapıyor musunuz / veriyor musunuz / var mı" kalıbı
  "veriyor", "veriyorsunuz", "yapıyor", "yapıyorsunuz", "var", "yok",
]);

// ── Basit TF-IDF benzeri skor hesaplama ──
function normalize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\wğüşöçıİĞÜŞÖÇ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const topical = words.filter((w) => !QUESTION_FORM_WORDS.has(w));
  return topical.length > 0 ? topical : words;
}

export interface MatchResult {
  entry: FaqEntry;
  score: number;
}

export function findBestFaqMatch(userInput: string): MatchResult | null {
  const inputWords = normalize(userInput);
  if (inputWords.length === 0) return null;

  let bestMatch: MatchResult | null = null;

  for (const entry of allFaqEntries) {
    // Hem keywords hem de soru metninde arama yap
    const questionWords = normalize(entry.question);
    const allTargetWords = [...entry.keywords, ...questionWords];

    let matchCount = 0;
    for (const iw of inputWords) {
      if (allTargetWords.some((tw) => tw.includes(iw) || iw.includes(tw))) {
        matchCount++;
      }
    }

    const score = matchCount / inputWords.length;

    if (score > (bestMatch?.score ?? 0)) {
      bestMatch = { entry, score };
    }
  }

  return bestMatch && bestMatch.score >= 0.6 ? bestMatch : null;
}
