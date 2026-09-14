# Phase 10-3 — rendered alt-text probe

Base `http://localhost:4194`; 101 page loads over 99 public routes (99 at 1280×800, 2 also at 375×812); 256 image rows; 0 failures.

## Every image, its alt and its nearest heading

| Route | vw | Element | File | alt | Nearest heading | Figcaption | Box | aria-hidden |
|---|---|---|---|---|---|---|---|---|
| `/` | 1280 | img | hero-manifold-v1-DjyYu6ON.webp | Koyu bir ölçüm masası üzerindeki hassas işlenmiş metal hidrolik manifold | h1: HAM GEOMETRİDENDOĞRULANMIŞHASSASİYETE | — | 704×396 | no |
| `/` | 1280 | img | hero-cnc-frezeleme-960-CKZhz_cY.webp | Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım | h2: Karardan parçaya,kanıtla ilerleyen üretim. | — | 809×348 | no |
| `/` | 1280 | img | industry-defense-640-Dnyme1cS.webp | `""` | h3: İNCE CİDARLI GÖVDE — Alüminyum 6061-T6 / 7075-T6 | — | 607×264 | no |
| `/` | 1280 | img | industry-medical-BIVAP-Gq.webp | `""` | h3: TİTANYUM BAĞLANTI PARÇASI — Ti-6Al-4V (Grade 5) | — | 201×194 | no |
| `/` | 1280 | img | hero-cnc-tornalama-DxFnZHUM.webp | `""` | h3: HASSAS MİL — 42CrMo4 / 1.7225 | — | 202×194 | no |
| `/` | 1280 | img | industry-aerospace-CN-v49lX.webp | `""` | h3: HAVACILIK & UZAY | — | 303×304 | no |
| `/` | 1280 | img | industry-defense-CeliYO2F.webp | `""` | h3: SAVUNMA SANAYİ | — | 303×304 | no |
| `/` | 1280 | img | industry-medical-BIVAP-Gq.webp | `""` | h3: MEDİKAL | — | 303×304 | no |
| `/` | 1280 | img | industry-hydraulic-SQGcPZcZ.webp | `""` | h3: ENERJİ & HİDROLİK | — | 304×304 | no |
| `/` | 1280 | img | hero-tolerans-hassasiyet-Wc62OP5H.webp | `""` | h2: HASSASİYETİDDİA EDİLMEZ.ÖLÇÜLÜR. | — | 1214×584 | no |
| `/` | 1280 | img | hero-manifold-v1-DjyYu6ON.webp | `""` | h3: ÖLÇÜM KAYDI | — | 56×56 | yes |
| `/malzemeler` | 1280 | canvas[role=img] |  | Malzeme dönüşüm animasyonu | h2: Yüzey Mükemmelliği | — | 1214×800 | no |
| `/blog` | 1280 | img | blog-5eksen-BwSIm3tw.webp | İş milindeki kesici takım, soğutma sıvısı altında parlak metal bir gövdenin eğik yüzeyini işlerken | h2: 5 Eksen CNC İşleme Avantajları | PLAKA 01Tek bağlamada birden fazla yüzeye erişen kesici takım | 403×538 | no |
| `/hizmetler/cnc-frezeleme` | 1280 | img | hero-cnc-frezeleme-HroBrnyJ.webp | `""` | h2: Kapsam | PLAKA · CNC FREZELEMETalaşlı İmalat | 1212×538 | no |
| `/hizmetler/cnc-tornalama` | 1280 | img | hero-cnc-tornalama-DxFnZHUM.webp | `""` | h2: Kapsam | PLAKA · CNC TORNALAMATalaşlı İmalat | 1212×538 | no |
| `/hizmetler/hassas-mikro-isleme` | 1280 | img | hero-mikro-isleme-BSrAZFIP.webp | `""` | h2: Kapsam | PLAKA · HASSAS MİKRO İŞLEMETalaşlı İmalat | 1212×538 | no |
| `/hizmetler/derin-delik-raybalama` | 1280 | img | hero-derin-delik-CyN-1yCZ.webp | `""` | h2: Kapsam | PLAKA · DERİN DELİK & RAYBALAMATalaşlı İmalat | 1212×538 | no |
| `/hizmetler/enjeksiyon-kalibi` | 1280 | img | hero-enjeksiyon-kalibi-CQ_Cg_WM.webp | `""` | h2: Kapsam | PLAKA · ENJEKSİYON KALIBIÖn Üretim | 1212×538 | no |
| `/hizmetler/basinçli-dokum` | 1280 | img | hero-basincli-dokum-BZCCkd3Z.webp | `""` | h2: Kapsam | PLAKA · BASINÇLI DÖKÜMÖn Üretim | 1212×538 | no |
| `/hizmetler/silikon-kaliplama` | 1280 | img | hero-silikon-kaliplama-AKU6eea7.webp | `""` | h2: Kapsam | PLAKA · SİLİKON KALIPLAMAÖn Üretim | 1212×538 | no |
| `/hizmetler/fikstur-aparat-tasarimi` | 1280 | img | hero-fikstur-aparat-xVjWw0mi.webp | `""` | h2: Kapsam | PLAKA · FİKSTÜR & APARAT TASARIMIÖn Üretim | 1212×538 | no |
| `/hizmetler/mekanik-yuzey-islemleri` | 1280 | img | hero-mekanik-yuzey-CUPVfxai.webp | `""` | h2: Kapsam | PLAKA · MEKANİK YÜZEY İŞLEMLERİYüzey İşlemleri | 1212×538 | no |
| `/hizmetler/anodizasyon` | 1280 | img | hero-anodizasyon-DUx4NaUB.webp | `""` | h2: Kapsam | PLAKA · ANODİZASYONYüzey İşlemleri | 1212×538 | no |
| `/hizmetler/kimyasal-islemler` | 1280 | img | hero-anodizasyon-DUx4NaUB.webp | `""` | h2: Kapsam | PLAKA · KİMYASAL İŞLEMLERYüzey İşlemleri | 1212×538 | no |
| `/hizmetler/boya-koruyucu-kaplamalar` | 1280 | img | hero-boya-kaplama-jhE1pteY.webp | `""` | h2: Kapsam | PLAKA · BOYA & KORUYUCU KAPLAMALARYüzey İşlemleri | 1212×538 | no |
| `/hizmetler/lazer-kazima` | 1280 | img | hero-lazer-kazima-DXf4SvZB.webp | `""` | h2: Kapsam | PLAKA · LAZER KAZIMAİşaretleme & Tanımlama | 1212×538 | no |
| `/hizmetler/tavlama` | 1280 | img | hero-tavlama-ChY0ee-N.webp | `""` | h2: Kapsam | PLAKA · TAVLAMAİşaretleme & Tanımlama | 1212×538 | no |
| `/hizmetler/qr-datamatrix-kodlari` | 1280 | img | hero-qr-datamatrix-9VxRDIuG.webp | `""` | h2: Kapsam | PLAKA · QR & DATAMATRİX KODLARIİşaretleme & Tanımlama | 1212×538 | no |
| `/hizmetler/logo-markalama` | 1280 | img | hero-logo-markalama-Dy2xgzKr.webp | `""` | h2: Kapsam | PLAKA · LOGO & MARKALAMAİşaretleme & Tanımlama | 1212×538 | no |
| `/hizmetler/insert-uygulama` | 1280 | img | hero-insert-uygulama-6qvO51FQ.webp | `""` | h2: Kapsam | PLAKA · INSERT UYGULAMAMontaj & Birleştirme | 1212×538 | no |
| `/hizmetler/mekanik-montaj` | 1280 | img | hero-mekanik-montaj-DfbiLF_I.webp | `""` | h2: Kapsam | PLAKA · MEKANİK MONTAJMontaj & Birleştirme | 1212×538 | no |
| `/hizmetler/kitting-paketleme` | 1280 | img | hero-kitting-paketleme-5S20It4j.webp | `""` | h2: Kapsam | PLAKA · KİTTİNG & PAKETLEMEMontaj & Birleştirme | 1212×538 | no |
| `/hizmetler/kaynakli-imalat` | 1280 | img | hero-kaynakli-imalat-DAdnNgf1.webp | `""` | h2: Kapsam | PLAKA · KAYNAKLI İMALATMontaj & Birleştirme | 1212×538 | no |
| `/kabiliyetler/makine-parkuru` | 1280 | img | hero-cnc-CktaRi9J.webp | `""` | h2: Kapsam | PLAKA · MAKİNE PARKURUÜretim Altyapısı | 1212×538 | no |
| `/kabiliyetler/malzeme-kutuphanesi` | 1280 | img | hero-malzeme-kutuphanesi-PgL8HJsP.webp | `""` | h2: Kapsam | PLAKA · MALZEME KÜTÜPHANESİÜretim Altyapısı | 1212×538 | no |
| `/kabiliyetler/kalite-kontrol` | 1280 | img | quality-control-C8RRRd9J.webp | `""` | h2: Kapsam | PLAKA · KALİTE KONTROLKalite & Standartlar | 1212×538 | no |
| `/kabiliyetler/tolerans-hassasiyet` | 1280 | img | hero-tolerans-hassasiyet-1600-BlYCWHmN.webp | `""` | h2: Kapsam | PLAKA · TOLERANS & HASSASİYETKalite & Standartlar | 1212×538 | no |
| `/kabiliyetler/tasarim-rehberi-dfm` | 1280 | img | blog-dfm-Cz4yiXpK.webp | `""` | h2: Kapsam | PLAKA · TASARIM REHBERİ (DFM)Mühendislik Desteği | 1212×538 | no |
| `/kabiliyetler/yuzey-islemleri-muhendislik` | 1280 | img | hero-yuzey-islemleri-C65G5lOH.webp | `""` | h2: Kapsam | PLAKA · YÜZEY İŞLEMLERİ REHBERİMühendislik Desteği | 1212×538 | no |
| `/kabiliyetler/dusuk-hacimli-uretim` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Kapsam | PLAKA · DÜŞÜK HACİMLİ ÜRETİMPrototipten Seri Üretime | 1212×538 | no |
| `/kabiliyetler/seri-imalat` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Kapsam | PLAKA · SERİ İMALATPrototipten Seri Üretime | 1212×538 | no |
| `/kabiliyetler/proje-yonetimi` | 1280 | img | hero-proje-yonetimi-CbaOjvpX.webp | `""` | h2: Kapsam | PLAKA · PROJE YÖNETİMİSüreç & Operasyon | 1212×538 | no |
| `/kabiliyetler/tedarik-zinciri` | 1280 | img | hero-tedarik-zinciri-BqQmcwwO.webp | `""` | h2: Kapsam | PLAKA · TEDARİK ZİNCİRİSüreç & Operasyon | 1212×538 | no |
| `/kabiliyetler/operasyonel-verimlilik` | 1280 | img | hero-operasyonel-verimlilik-BBhClPOE.webp | `""` | h2: Kapsam | PLAKA · OPERASYONEL VERİMLİLİKSüreç & Operasyon | 1212×538 | no |
| `/endustriyel/havacilik-uzay` | 1280 | img | hero-havacilik-L9vASlRo.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · HAVACILIK & UZAYYüksek Teknoloji | 1212×538 | no |
| `/endustriyel/savunma-sanayi` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · SAVUNMA SANAYİYüksek Teknoloji | 1212×538 | no |
| `/endustriyel/robotik` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · ROBOTİK & OTOMASYONYüksek Teknoloji | 1212×538 | no |
| `/endustriyel/otomotiv` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · OTOMOTİVSeri Üretim | 1212×538 | no |
| `/endustriyel/medikal` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · MEDİKAL & BİYOMEDİKALSeri Üretim | 1212×538 | no |
| `/endustriyel/yelken-yat-sistemleri` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · YELKEN & YAT SİSTEMLERİSeri Üretim | 1212×538 | no |
| `/endustriyel/hidrolik-pnomatik` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · HİDROLİK & PNÖMATİKEndüstriyel Sistemler | 1212×538 | no |
| `/endustriyel/boru-baglanti-parcalari` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · BORU & BAĞLANTI PARÇALARIEndüstriyel Sistemler | 1212×538 | no |
| `/endustriyel/iklim-teknolojileri` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · İKLİM TEKNOLOJİLERİEndüstriyel Sistemler | 1212×538 | no |
| `/endustriyel/prototip-uretim` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · PROTOTİP ÜRETİMÜretim Çözümleri | 1212×538 | no |
| `/endustriyel/kucuk-seri` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · KÜÇÜK SERİ ÜRETİMÜretim Çözümleri | 1212×538 | no |
| `/endustriyel/seri-uretim` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · SERİ ÜRETİMÜretim Çözümleri | 1212×538 | no |
| `/endustriyel/ozel-projeler` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · ÖZEL MÜHENDİSLİK PROJELERİÜretim Çözümleri | 1212×538 | no |
| `/endustriyel/yenilenebilir-enerji` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · YENİLENEBİLİR ENERJİEnerji & Altyapı | 1212×538 | no |
| `/endustriyel/petrol-gaz` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · PETROL & GAZEnerji & Altyapı | 1212×538 | no |
| `/endustriyel/guc-dagitim-sistemleri` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · GÜÇ DAĞITIM SİSTEMLERİEnerji & Altyapı | 1212×538 | no |
| `/endustriyel/madencilik-ekipmanlari` | 1280 | img | hero-seri-uretim-BfX-civG.webp | `""` | h2: Bu sektörde ne üretiyoruz | PLAKA · MADENCİLİK EKİPMANLARIEnerji & Altyapı | 1212×538 | no |
| `/blog/5-eksen-cnc-isleme-avantajlari` | 1280 | img | blog-5eksen-BwSIm3tw.webp | İş milindeki kesici takım, soğutma sıvısı altında parlak metal bir gövdenin eğik yüzeyini işlerken | h2: Beş eksen ne demek | PLAKA 01Tek bağlamada birden fazla yüzeye erişen kesici takım | 807×538 | no |
| `/blog/havacilik-parcalarinda-malzeme-secimi` | 1280 | img | blog-malzeme-BIQkYg9Q.webp | Siyah zemin üzerinde yan yana dört silindirik metal numune; uç yüzleri kesilmiş, taşlanmış ve fırçalanmış | h2: İki aday | PLAKA 01Aynı geometrinin iki alaşımda işlenmiş numuneleri | 807×538 | no |
| `/blog/dfm-tasarimdan-uretime-gecis` | 1280 | img | blog-dfm-Cz4yiXpK.webp | Delikli ve flanşlı işlenmiş metal gövde, kendi ölçülendirilmiş teknik resminin üzerinde duruyor | h2: DFM nedir, ne değildir | PLAKA 01Model ve teknik resim, üretilebilirlik incelemesinde yan yana | 807×538 | no |
| `/blog/cnc-torna-frezeleme-farki` | 1280 | img | hero-cnc-frezeleme-HroBrnyJ.webp | Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım | h2: Tek bir ayrım | PLAKA 01Prizmatik geometri: takım döner, parça sabit kalır | 807×538 | no |
| `/blog/kalite-kontrol-cmm-olcum` | 1280 | img | quality-control-C8RRRd9J.webp | Karanlık ölçüm odasında, granit tabla üzerindeki silindirik parçayı problayan köprü tipi CMM | h2: CMM ne ölçer | PLAKA 01Kontrol planında tanımlı kotelerin doğrulanması | 807×538 | no |
| `/blog/endustriyel-yuzey-islemleri-rehberi` | 1280 | img | hero-yuzey-islemleri-C65G5lOH.webp | Makro çekim: kumlanmış, fırçalanmış ve parlatılmış metal yüzeylerin yan yana duran kenarları | h2: Yüzey işlemi bir tercih değildir | PLAKA 01Aynı alaşımda dört farklı yüzey bitişi | 807×538 | no |
| `/kabiliyet-profilleri/ince-cidarli-govde` | 1280 | img | industry-defense-640-Dnyme1cS.webp | `""` | h2: Yaklaşım | PLAKA 01Rulman yuvası ve bağlantı delikleri işlenmiş metal gövde, ölçüm masası üzerinde | 403×538 | no |
| `/kabiliyet-profilleri/titanyum-baglanti-parcasi` | 1280 | img | industry-medical-640-Cw3i21mc.webp | `""` | h2: Yaklaşım | PLAKA 01Yüzeyi parlatılmış, eğik kanalı ve delikleri işlenmiş dik duran metal bağlantı parçası | 403×538 | no |
| `/kabiliyet-profilleri/hassas-mil` | 1280 | img | hero-cnc-tornalama-DxFnZHUM.webp | `""` | h2: Yaklaşım | PLAKA 01Torna aynasına bağlı metal mil, taret takımı ve soğutma sıvısı altında tornalanırken | 403×538 | no |
| `/` | 375 | img | hero-manifold-v1-DjyYu6ON.webp | Koyu bir ölçüm masası üzerindeki hassas işlenmiş metal hidrolik manifold | h1: HAM GEOMETRİDENDOĞRULANMIŞHASSASİYETE | — | 333×187 | no |
| `/` | 375 | img | hero-cnc-frezeleme-640-rIE7eQIt.webp | Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım | h2: Karardan parçaya,kanıtla ilerleyen üretim. | — | 333×312 | no |
| `/` | 375 | img | industry-defense-640-Dnyme1cS.webp | `""` | h3: İNCE CİDARLI GÖVDE — Alüminyum 6061-T6 / 7075-T6 | — | 332×216 | no |
| `/` | 375 | img | industry-medical-BIVAP-Gq.webp | `""` | h3: TİTANYUM BAĞLANTI PARÇASI — Ti-6Al-4V (Grade 5) | — | 331×216 | no |
| `/` | 375 | img | hero-cnc-tornalama-DxFnZHUM.webp | `""` | h3: HASSAS MİL — 42CrMo4 / 1.7225 | — | 331×216 | no |
| `/` | 375 | img | industry-aerospace-CN-v49lX.webp | `""` | h3: HAVACILIK & UZAY | — | 333×333 | no |
| `/` | 375 | img | industry-defense-CeliYO2F.webp | `""` | h3: SAVUNMA SANAYİ | — | 333×333 | no |
| `/` | 375 | img | industry-medical-BIVAP-Gq.webp | `""` | h3: MEDİKAL | — | 333×333 | no |
| `/` | 375 | img | industry-hydraulic-SQGcPZcZ.webp | `""` | h3: ENERJİ & HİDROLİK | — | 333×333 | no |
| `/` | 375 | img | hero-tolerans-hassasiyet-portrait-640-CLhTHiAY.webp | `""` | h2: HASSASİYETİDDİA EDİLMEZ.ÖLÇÜLÜR. | — | 333×664 | no |
| `/` | 375 | img | hero-manifold-v1-DjyYu6ON.webp | `""` | h3: ÖLÇÜM KAYDI | — | 56×56 | yes |
| `/malzemeler` | 375 | img | frame_0001.webp | `""` | h2: Yüzey Mükemmelliği | — | 333×568 | no |

## Material gauges (`span.shell-gauge[role=img]`, aria-label `İşlenebilirlik: n/5`) — collapsed

- `/malzemeler @ 1280`: 87 gauges, all labelled
- `/malzemeler @ 375`: 87 gauges, all labelled

## Routes with no image

- `/sss` (1280) — h1: Sıkça Sorulan Sorular
- `/gizlilik-politikasi` (1280) — h1: Gizlilik Politikası
- `/kvkk` (1280) — h1: KVKK Aydınlatma Metni
- `/cerez-politikasi` (1280) — h1: Çerez Politikası
- `/hakkimizda` (1280) — h1: Hakkımızda
- `/iletisim` (1280) — h1: Bize ulaşın
- `/kabiliyet-profilleri` (1280) — h1: Kabiliyet Profilleri
- `/kalite-dosyasi` (1280) — h1: Kalite Dosyası
- `/teklif-al` (1280) — h1: Hassas Fiyat Teklifi Alın
- `/hizmetler/kategori/talasli-imalat` (1280) — h1: Talaşlı İmalat
- `/hizmetler/kategori/on-uretim` (1280) — h1: Ön Üretim
- `/hizmetler/kategori/yuzey-islemleri` (1280) — h1: Yüzey İşlemleri
- `/hizmetler/kategori/isaretleme-tanimlama` (1280) — h1: İşaretleme & Tanımlama
- `/hizmetler/kategori/montaj-birlestirme` (1280) — h1: Montaj & Birleştirme
- `/kabiliyetler/kategori/uretim-altyapisi` (1280) — h1: Üretim Altyapısı
- `/kabiliyetler/kategori/kalite-standartlar` (1280) — h1: Kalite & Standartlar
- `/kabiliyetler/kategori/muhendislik-destegi` (1280) — h1: Mühendislik Desteği
- `/kabiliyetler/kategori/prototipten-seri-uretime` (1280) — h1: Prototipten Seri Üretime
- `/kabiliyetler/kategori/surec-operasyon` (1280) — h1: Süreç & Operasyon
- `/endustriyel/kategori/yuksek-teknoloji` (1280) — h1: Yüksek Teknoloji
- `/endustriyel/kategori/seri-uretim-endustriyel` (1280) — h1: Seri Üretim
- `/endustriyel/kategori/endustriyel-sistemler` (1280) — h1: Endüstriyel Sistemler
- `/endustriyel/kategori/uretim-cozumleri` (1280) — h1: Üretim Çözümleri
- `/endustriyel/kategori/enerji-altyapi` (1280) — h1: Enerji & Altyapı
- `/malzemeler/aluminyum` (1280) — h1: CNC İşleme için Alüminyum Alaşımları
- `/malzemeler/celik` (1280) — h1: CNC İşleme için Çelik Alaşımları
- `/malzemeler/paslanmaz-celik` (1280) — h1: CNC İşleme için Paslanmaz Çelik
- `/malzemeler/titanyum` (1280) — h1: CNC İşleme için Titanyum Alaşımları
- `/malzemeler/pirinc-bronz` (1280) — h1: CNC İşleme için Pirinç ve Bronz Alaşımları
- `/malzemeler/bakir` (1280) — h1: CNC İşleme için Bakır
- `/malzemeler/nikel` (1280) — h1: CNC İşleme için Nikel Süperalaşımları
- `/malzemeler/magnezyum` (1280) — h1: CNC İşleme için Magnezyum Alaşımları
- `/malzemeler/termoplastikler` (1280) — h1: CNC İşleme için Mühendislik Plastikleri
- `/malzemeler/yuksek-performans-plastikler` (1280) — h1: CNC İşleme için Yüksek Performans Polimerleri
- `/malzemeler/kompozitler` (1280) — h1: CNC İşleme için Kompozit Malzemeler
- `/giris` (1280) — h1: Giriş Yapın
- `/sifremi-unuttum` (1280) — h1: Şifremi Unuttum
- `/reset-password` (1280) — h1: Yeni Şifre Belirleyin
- `/cad-dashboard` (1280) — → `/teklif-al`; h1: Hassas Fiyat Teklifi Alın

## Failures

None.
