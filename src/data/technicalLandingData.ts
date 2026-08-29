import { Clock3, Gauge, Layers3, ScanBarcode, ScanLine, Truck } from "lucide-react";

export const technicalProof = [
  { value: "±0.005 mm", label: "TOLERANS", icon: ScanLine },
  { value: "48 SAAT", label: "TEKLİF SÜRESİ", icon: Clock3 },
  { value: "50+", label: "MALZEME", icon: Layers3 },
  { value: "%100", label: "CMM RAPORU", icon: Gauge },
  { value: "İZLENEBİLİR", label: "ÜRETİM", icon: ScanBarcode },
  { value: "%98", label: "ZAMANINDA TESLİMAT", icon: Truck },
] as const;

export const marqueeItems = [
  "5 EKSEN CNC İŞLEME",
  "CNC TORNALAMA",
  "MİKRO İŞLEME",
  "YÜZEY İŞLEMLERİ",
  "KALİTE KONTROL",
  "MONTAJ & BİRLEŞTİRME",
] as const;

export const heroPartFacts = [
  ["ÖLÇÜLER", "120.00 × 72.00 × 68.00 mm"],
  ["TOLERANS", "±0.005 mm"],
  ["YÜZEY", "Ra 0.4 μm"],
  ["MALZEME", "17-4 PH Paslanmaz Çelik"],
  ["RAPOR NO", "MT-2024-04518"],
] as const;

export const technicalProcess = [
  { no: "01", title: "ANALİZ", lines: ["DFM Analizi", "Tolerans Çalışması", "Üretilebilirlik"] },
  { no: "02", title: "TASARIM", lines: ["CAD Optimizasyon", "Proses Planlama", "Takım & Fikstür Tasarımı"] },
  { no: "03", title: "ÜRETİM", lines: ["5 Eksen CNC İşleme", "Proses Kontrol", "Ara Kontroller"] },
  { no: "04", title: "KALİTE & TESLİMAT", lines: ["%100 CMM Kontrol", "Rapor & Sertifikasyon", "Güvenli Paketleme"] },
] as const;

export const nexusPanels = ["ÖZET", "SİPARİŞLER", "TAKİP", "RAPORLAR", "KALİTE", "AYARLAR"] as const;

export const nexusKpis = [
  { value: "12", label: "AKTİF SİPARİŞ", icon: "box" },
  { value: "7", label: "ÜRETİMDE", icon: "flow", tone: "green" },
  { value: "126", label: "TOPLAM PARÇA", icon: "stack" },
  { value: "%98.7", label: "BAŞARI", icon: "chart" },
] as const;

export const nexusOrders = [
  ["MT-2024-0512", "Bracket", "7075-T651", "25", "22.05.2024", "ÜRETİMDE"],
  ["MT-2024-0511", "Valve Body", "17-4 PH", "10", "22.05.2024", "ÜRETİMDE"],
  ["MT-2024-0510", "Motor Housing", "Ti-6Al-4V", "6", "21.05.2024", "ÜRETİMDE"],
  ["MT-2024-0509", "Compressor Wheel", "Inconel 718", "12", "20.05.2024", "KALİTE KONTROL"],
  ["MT-2024-0508", "Drive Shaft", "42CrMo4", "8", "18.05.2024", "HAZIR"],
  ["MT-2024-0507", "Housing Block", "AL 7075", "15", "17.05.2024", "ÜRETİMDE"],
] as const;

export const measuredProjects = [
  {
    title: "AERO HOUSING",
    material: "Ti-6Al-4V",
    report: "MT-2024-0512",
    image: "defense",
    rows: [["⌀62.000 H7", "62.008", "UYGUN"], ["⌀48.000 H7", "48.005", "UYGUN"], ["120.000 ±0.005", "119.997", "UYGUN"], ["DÜZLÜK 0.020", "0.014", "UYGUN"]],
  },
  {
    title: "TİTANYUM BRAKET",
    material: "Ti-6Al-4V",
    report: "MT-2024-04321",
    image: "medical",
    rows: [["⌀16.000 ±0.015", "15.996", "UYGUN"], ["⌀10.000 ±0.010", "9.998", "UYGUN"], ["DÜZLÜK 0.030", "0.018", "UYGUN"]],
  },
  {
    title: "YÜKSEK HASSASİYETLİ MİL",
    material: "42CrMo4",
    report: "MT-2024-04311",
    image: "turning",
    rows: [["⌀20.000 h6", "19.998", "UYGUN"], ["⌀8.000 ±0.010", "7.995", "UYGUN"], ["SALGI 0.005", "0.003", "UYGUN"]],
  },
] as const;

export const qualityCertificates = [
  { code: "ISO 9001:2015", name: "KALİTE YÖNETİM SİSTEMİ" },
  { code: "AS9100D", name: "HAVACILIK KALİTE YÖNETİM SİSTEMİ" },
  { code: "ISO 14001:2015", name: "ÇEVRE YÖNETİM SİSTEMİ" },
] as const;

/** brand: markanın kendi yazım biçimi (italik/serif). Bilinmiyorsa boş bırakılır. */
export const referenceLogos: readonly { name: string; brand?: "italic" | "serif" }[] = [
  { name: "HPT" },
  { name: "TAAC" },
  { name: "METSAN" },
  { name: "ZTM" },
  { name: "TEKNİK BALANS" },
  { name: "AKON HİDROLİK" },
];

export const technicalFaqs = [
  ["Hangi dosya formatlarını destekliyorsunuz?", "STEP, STP, IGES, STL, OBJ, DWG ve PDF teknik resimlerini teklif akışında yükleyebilirsiniz. 3D model ile birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır."],
  ["Minimum tolerans değerleri nedir?", "Ulaşılabilir tolerans; geometri, malzeme, parça ölçüsü ve proses planına göre değişir. Hedef aralığımız ±0.005 mm olup her proje teknik incelemeden sonra doğrulanır."],
  ["Ölçüm ve kalite kontrol süreçleriniz nelerdir?", "Her iş için kontrol planı oluşturulur; ara kontroller proses sırasında, final kontrol CMM ile yapılır. Ölçüm raporu ve malzeme sertifikası teslimat dosyasına eklenir."],
  ["Teslim süreniz ne kadardır?", "Termin; malzeme tedariki, operasyon sayısı ve kapasite planı incelendikten sonra teklifle birlikte paylaşılır. Standart teklif dönüş süremiz 48 saattir."],
] as const;

export const technicalResources = [
  ["KALİTE POLİTİKAMIZ", "PDF · 1.2 MB"],
  ["ÖLÇÜM CİHAZLARI LİSTESİ", "PDF · 1.4 MB"],
  ["PAKETLEME STANDARTLARIMIZ", "PDF · 1.0 MB"],
  ["TEDARİKÇİ DAVRANIŞ KURALLARI", "PDF · 1.5 MB"],
] as const;

export const rfqSteps = [
  { no: "01", title: "YÜKLE", line: "Çiziminizi bize iletin" },
  { no: "02", title: "ANALİZ", line: "DFM ve tolerans analizi" },
  { no: "03", title: "TEKLİF", line: "Net teklif ve teslim tarihi" },
  { no: "04", title: "ÜRETİM", line: "Kalite ve teslim süreci başlar" },
] as const;

export const footerColumns = [
  {
    title: "ŞİRKET",
    links: [
      ["Hakkımızda", "/hakkimizda"],
      ["Vizyon & Misyon", "/hakkimizda"],
      ["Sertifikalar", "#kalite"],
      ["Kariyer", "/iletisim"],
    ],
  },
  {
    title: "YETENEKLER",
    links: [
      ["5 Eksen CNC", "/hizmetler/cnc-frezeleme"],
      ["Malzemeler", "/malzemeler"],
      ["Toleranslar", "/kabiliyetler/tolerans-hassasiyet"],
      ["Yüzey İşlemleri", "/kabiliyetler/yuzey-islemleri-muhendislik"],
    ],
  },
  {
    title: "KALİTE",
    links: [
      ["Kalite Politikamız", "/kabiliyetler/kalite-kontrol"],
      ["CMM Raporları", "#kalite"],
      ["İzlenebilirlik", "#kalite"],
      ["Süreçler", "#surec"],
    ],
  },
  {
    title: "İLETİŞİM",
    links: [
      ["İletişim Bilgileri", "/iletisim"],
      ["Talep Gönder", "/teklif-al"],
      ["Konum", "/iletisim"],
    ],
  },
] as const;
