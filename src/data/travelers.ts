export type Traveler = {
  id: string;
  code: string;
  title: string;
  meta: {
    material: string;
    tolerance: string;
    setup: string;
    batch: string;
  };
  ops: {
    n: string;
    name: string;
    desc: string;
    note?: string;
    equipment: string;
    setupMin: number | null;
    cycleMin: number | null;
    qc: string;
  }[];
  signoff: {
    engineer: string;
    qc: string;
    fairRev: string;
    coverage: string;
  };
};

export const travelers: Traveler[] = [
  {
    id: "cnc",
    code: "MT·CNC·5X",
    title: "5 Eksen CNC Frezeleme",
    meta: { material: "Al / Çelik / Ti · 87 alt", tolerance: "±0.005 – 0.05 mm", setup: "32 – 48 dk", batch: "1 – 5.000 adet" },
    ops: [
      { n: "10", name: "Hazırlık", desc: "Traveler açılır, CMTR + gelen malzeme kontrol, rev B teyidi.", note: "Doc control · ISO 9001 §8.5.2", equipment: "Workshop bench", setupMin: 8, cycleMin: null, qc: "Kontrol 1" },
      { n: "20", name: "Kaba freze", desc: "3 eksen kaba pas, 0.3 mm stok bırakma. Coolant: Blaser Vasco 1000.", note: "Tooling: Sandvik CoroMill 390", equipment: "Haas VF-4SS", setupMin: 24, cycleMin: 38, qc: "In-process" },
      { n: "30", name: "5x finish", desc: "5 eksen simultane finiş; R0.5 ball-end, 24.000 rpm. Yüzey Ra 0.8.", note: "Tooling: Mitsubishi VQT4MB", equipment: "Mazak i-400 VC", setupMin: 32, cycleMin: 52, qc: "In-process" },
      { n: "40", name: "CMM ölçüm", desc: "Zeiss Contura, 24 kritik kote, FAIR raporu AS9102 uyumlu.", note: "Sertifika: PDF + STP ile birlikte sevk", equipment: "Zeiss Contura G2", setupMin: 6, cycleMin: 18, qc: "Stamp 1" },
    ],
    signoff: { engineer: "M. Akçay", qc: "E. Öztürk", fairRev: "AS9102 rev C", coverage: "24 / 24 kote geçti" },
  },
  {
    id: "turn",
    code: "MT·TRN·MX",
    title: "CNC Torna · Mill-Turn",
    meta: { material: "Çelik / Paslanmaz / Pirinç", tolerance: "±0.008 – 0.04 mm", setup: "24 – 42 dk", batch: "10 – 20.000 adet" },
    ops: [
      { n: "10", name: "Çubuk kontrol", desc: "Lot, çap ve sertlik girişi yapılır; izlenebilirlik etiketi basılır.", equipment: "Incoming QC", setupMin: 6, cycleMin: null, qc: "Kontrol 1" },
      { n: "20", name: "Torna kaba", desc: "Çift taret kaba pas, delik merkezleme ve kanal açma.", equipment: "Doosan Puma 400", setupMin: 22, cycleMin: 28, qc: "In-process" },
      { n: "30", name: "Mill-turn", desc: "Yan delikler ve flats tek bağlamada tamamlanır.", note: "Runout hedefi <0.012 mm", equipment: "Mazak Integrex", setupMin: 18, cycleMin: 34, qc: "Runout" },
      { n: "40", name: "Final ölçüm", desc: "Çap, salgı ve yüzey pürüzlülüğü kayıt altına alınır.", equipment: "CMM + Mitutoyo", setupMin: 5, cycleMin: 12, qc: "Stamp 1" },
    ],
    signoff: { engineer: "A. Yılmaz", qc: "D. Kaya", fairRev: "FAIR rev B", coverage: "18 / 18 kote geçti" },
  },
  {
    id: "edm",
    code: "MT·EDM·02",
    title: "Tel Erozyon · Dalma",
    meta: { material: "Takım çeliği / Ti / Inconel", tolerance: "±0.004 – 0.02 mm", setup: "18 – 36 dk", batch: "1 – 1.000 adet" },
    ops: [
      { n: "10", name: "Elektrot", desc: "Geometri ve boşaltma yüzeyi doğrulanır.", equipment: "CAM station", setupMin: 12, cycleMin: null, qc: "DFM" },
      { n: "20", name: "Tel kesim", desc: "Düşük gerilimli çoklu pas; çapak minimum.", equipment: "Sodick ALC600G", setupMin: 28, cycleMin: 64, qc: "In-process" },
      { n: "30", name: "Dalma EDM", desc: "Kör cep ve dar radius yüzeyler tamamlanır.", equipment: "Charmilles", setupMin: 24, cycleMin: 48, qc: "Profil" },
      { n: "40", name: "Optik ölçüm", desc: "Profil izdüşümü ve kritik radyüs raporlanır.", equipment: "Keyence IM", setupMin: 7, cycleMin: 14, qc: "Stamp 1" },
    ],
    signoff: { engineer: "S. Demir", qc: "N. Arslan", fairRev: "Profile rev A", coverage: "16 / 16 profil geçti" },
  },
  {
    id: "treat",
    code: "MT·SUR·HT",
    title: "Isıl İşlem · Yüzey",
    meta: { material: "Al / Çelik / Paslanmaz", tolerance: "Ra 0.4 – 1.6 µm", setup: "12 – 30 dk", batch: "5 – 8.000 adet" },
    ops: [
      { n: "10", name: "Mask planı", desc: "Kaplama dışı yüzeyler ve kritik toleranslar işaretlenir.", equipment: "Process desk", setupMin: 10, cycleMin: null, qc: "Plan" },
      { n: "20", name: "Isıl işlem", desc: "Sertlik hedefi ve fırın grafiği lot dosyasına eklenir.", equipment: "Partner furnace", setupMin: 16, cycleMin: 120, qc: "HRC" },
      { n: "30", name: "Kaplama", desc: "Anodize, pasivasyon veya fosfat prosesine alınır.", equipment: "Surface line", setupMin: 14, cycleMin: 55, qc: "Bath log" },
      { n: "40", name: "Yüzey kontrol", desc: "Ra, renk tonu ve maske taşması raporlanır.", equipment: "Ra tester", setupMin: 6, cycleMin: 11, qc: "Stamp 1" },
    ],
    signoff: { engineer: "B. Can", qc: "E. Öztürk", fairRev: "Coating rev D", coverage: "12 / 12 parametre geçti" },
  },
  {
    id: "cmm",
    code: "MT·CMM·FAIR",
    title: "CMM Doğrulama",
    meta: { material: "Tüm kritik parçalar", tolerance: "±0.001 – 0.01 mm", setup: "10 – 28 dk", batch: "FAI / seri kontrol" },
    ops: [
      { n: "10", name: "Plan import", desc: "2D teknik resim balonlanır, STP ile nominal eşleştirilir.", equipment: "Calypso", setupMin: 14, cycleMin: null, qc: "Plan" },
      { n: "20", name: "Fixture", desc: "Parça bağlama tekrarlanabilirliği test edilir.", equipment: "Granite table", setupMin: 18, cycleMin: 8, qc: "R&R" },
      { n: "30", name: "CMM run", desc: "Kritik koteler otomatik ölçülür, sapma grafiği üretilir.", equipment: "Zeiss Contura", setupMin: 8, cycleMin: 26, qc: "Run" },
      { n: "40", name: "Rapor", desc: "FAIR PDF, ham ölçüm CSV ve revizyon imzası paketlenir.", equipment: "QA station", setupMin: 5, cycleMin: 10, qc: "Stamp 1" },
    ],
    signoff: { engineer: "M. Akçay", qc: "D. Kaya", fairRev: "AS9102 rev C", coverage: "%100 FAIR coverage" },
  },
];
