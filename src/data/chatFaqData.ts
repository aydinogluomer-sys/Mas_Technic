import { servicePages } from "./servicePages";

export interface FaqEntry {
  question: string;
  answer: string;
  keywords: string[];
}

// ── Sabit şablon yanıtlar ──
const staticEntries: FaqEntry[] = [
  {
    question: "Teklif nasıl alabilirim?",
    answer: "Teklif almak için [Teklif Al](/teklif-al) sayfamızı ziyaret edebilirsiniz. CAD dosyanızı yükleyerek hızlı teklif alabilirsiniz. Alternatif olarak info@mastechnic.com adresine mail atabilirsiniz.",
    keywords: ["teklif", "fiyat", "maliyet", "ücret", "para", "ne kadar", "kaç tl", "bütçe", "hesap"],
  },
  {
    question: "İletişim bilgileriniz nelerdir?",
    answer: "📞 Telefon: +90 (212) 555 0000\n📧 E-posta: info@mastechnic.com\n📍 Adres: İstanbul, Türkiye\n\nDetaylı bilgi için [İletişim](/iletisim) sayfamızı ziyaret edin.",
    keywords: ["iletişim", "telefon", "adres", "email", "mail", "nerede", "konum", "ulaşım", "numara"],
  },
  {
    question: "Hangi sektörlere hizmet veriyorsunuz?",
    answer: "Havacılık & uzay, savunma sanayi, otomotiv, medikal, robotik, enerji, denizcilik, hidrolik ve daha birçok sektöre hizmet veriyoruz. Detaylar için [Endüstriyel Çözümler](/endustriyel) sayfamıza bakabilirsiniz.",
    keywords: ["sektör", "endüstri", "havacılık", "otomotiv", "medikal", "savunma", "hangi sektör"],
  },
  {
    question: "Prototip üretimi yapıyor musunuz?",
    answer: "Evet! Tek parçadan başlayarak prototip üretimi yapıyoruz. 3-5 iş günü içinde prototip teslimatı mümkündür. Detaylar için [Prototip Üretim](/endustriyel/prototip-uretim) sayfamıza bakın.",
    keywords: ["prototip", "numune", "tek parça", "deneme", "örnek", "sample"],
  },
  {
    question: "Hangi CNC hizmetleri sunuyorsunuz?",
    answer: "CNC frezeleme (3-4-5 eksen), CNC tornalama, hassas mikro işleme, derin delik & raybalama, lazer kazıma, yüzey işlemleri, montaj ve daha fazlası. Tüm hizmetlerimiz için [Hizmetler](/hizmetler) sayfamızı inceleyin.",
    keywords: ["cnc", "hizmet", "servis", "ne yapıyorsunuz", "neler sunuyorsunuz", "frezeleme", "tornalama"],
  },
  {
    question: "Teslimat süreniz ne kadar?",
    answer: "Prototip siparişlerde 3-5 iş günü, seri üretimde 7-15 iş günü teslimat sürelerimiz bulunmaktadır. Acil siparişler için özel planlama yapılabilir.",
    keywords: ["teslimat", "süre", "zaman", "ne zaman", "kaç gün", "hızlı", "acil", "termin"],
  },
  {
    question: "Hangi malzemelerle çalışıyorsunuz?",
    answer: "Alüminyum (6061, 7075), paslanmaz çelik (304, 316), karbon çelik, titanyum, pirinç, bakır, PEEK, POM/Delrin ve daha 50+ malzeme ile çalışıyoruz. [Malzeme Kütüphanesi](/malzemeler) sayfamızda detayları bulabilirsiniz.",
    keywords: ["malzeme", "metal", "alüminyum", "çelik", "titanyum", "plastik", "pirinç", "bakır", "paslanmaz"],
  },
  {
    question: "Minimum sipariş adedi var mı?",
    answer: "Minimum sipariş adedi 1 (tek parça) olarak belirlenmiştir. Prototipten seri üretime (1000+ adet) kadar esnek üretim kapasitemiz mevcuttur.",
    keywords: ["minimum", "adet", "sipariş", "kaç adet", "en az", "miktar"],
  },
  {
    question: "Kalite sertifikalarınız nelerdir?",
    answer: "ISO 9001:2015, AS9100D (havacılık), ISO 13485 (medikal) sertifikalarına sahibiz. CMM ölçüm raporları ve EN 10204 3.1 malzeme sertifikaları sunuyoruz.",
    keywords: ["kalite", "sertifika", "iso", "as9100", "standart", "belge", "rapor"],
  },
  {
    question: "Tolerans değerleriniz nedir?",
    answer: "Standart ±0.01mm, hassas işlemede ±0.005mm, mikro işlemede ±0.001mm tolerans değerlerine ulaşabiliyoruz. Detaylar için [Tolerans & Hassasiyet](/kabiliyetler/tolerans-hassasiyet) sayfamızı inceleyin.",
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
  // ── Garanti & İade ──
  {
    question: "Garanti veriyor musunuz?",
    answer: "Evet, tüm ürünlerimiz teknik şartnameye uygunluk garantisi ile teslim edilir. Ölçüsel uyumsuzluk veya malzeme hatası durumunda ücretsiz yeniden üretim veya düzeltme yapıyoruz.",
    keywords: ["garanti", "garantili", "güvence", "warranty", "sorumluluk"],
  },
  {
    question: "İade veya değişim yapılabiliyor mu?",
    answer: "Teknik şartnameye uymayan ürünlerde ücretsiz iade/değişim yapılmaktadır. Teslimat sonrası 7 iş günü içinde kalite kontrol raporuyla birlikte bildirim yapmanız yeterlidir.",
    keywords: ["iade", "değişim", "geri gönderme", "uyumsuz", "hatalı", "kusurlu", "return"],
  },
  // ── Ödeme ──
  {
    question: "Ödeme yöntemleriniz nelerdir?",
    answer: "Banka havalesi/EFT, açık hesap (anlaşmalı müşteriler), vadeli ödeme ve kredi kartı ile ödeme kabul ediyoruz. Kurumsal fatura ve e-fatura kesiyoruz.",
    keywords: ["ödeme", "havale", "eft", "kredi kartı", "fatura", "e-fatura", "vade", "peşin", "taksit", "banka"],
  },
  {
    question: "Peşin ödeme zorunlu mu?",
    answer: "İlk siparişlerde %50 ön ödeme talep ediyoruz, kalan %50 teslimatta ödenir. Düzenli müşterilerimize açık hesap ve 30-60 gün vade imkânı sunuyoruz.",
    keywords: ["peşin", "ön ödeme", "avans", "vade", "vadeli", "taksit", "ödeme koşulları"],
  },
  // ── Dosya Formatları ──
  {
    question: "Hangi CAD dosya formatlarını kabul ediyorsunuz?",
    answer: "STEP (.stp/.step), IGES (.igs), SolidWorks (.sldprt/.sldasm), DXF, DWG, PDF çizimler ve 3D modeller kabul ediyoruz. En çok tercih edilen format STEP'tir.",
    keywords: ["dosya", "format", "cad", "step", "iges", "solidworks", "dxf", "dwg", "pdf", "çizim", "3d", "model"],
  },
  // ── Çalışma Saatleri ──
  {
    question: "Çalışma saatleriniz nedir?",
    answer: "Pazartesi – Cuma: 08:00 – 18:00 arası hizmet veriyoruz. Acil siparişler için hafta sonu da üretim yapılabilmektedir.",
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
    answer: "Evet, 10 adetten 100.000+ adete kadar seri üretim kapasitemiz mevcuttur. Seri üretimde birim maliyet avantajı ve tutarlı kalite sağlıyoruz. [Seri Üretim](/kabiliyetler/seri-uretim) sayfamızı inceleyin.",
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
  {
    question: "MAS Technic nedir?",
    answer: "MAS Technic, İstanbul merkezli hassas CNC imalat firmasıdır. Prototipten seri üretime, havacılık-savunma-otomotiv-medikal başta olmak üzere birçok sektöre hizmet vermekteyiz. [Hakkımızda](/hakkimizda) sayfamızda detayları bulabilirsiniz.",
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

// ── Basit TF-IDF benzeri skor hesaplama ──
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wğüşöçıİĞÜŞÖÇ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
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
