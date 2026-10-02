# İddia kaydı (claims register)

İzin, doğrulama ve public gösterim ayrı sütunlarda tutulur. `PUBLIC_OK` bir **izindir**, doğrulama değildir. Regex/tip kapısı (claims-gate, bu kaydın tarayıcısı) gerçek doğrulama yerine geçmez; yalnız envanter ve regresyon korumasıdır.

## Satır bazında kayıt

- Makine tarafından üretilen tam kayıt: [`claims-inventory.json`](claims-inventory.json) (`scripts/quality/claims-scan.ts`). Kapsadığı veri: 48 detay sayfası, 15 kategori, 6 blog yazısı ve 3 profil. Sayısal iddia taşıyan her metin route, alan, metin, sınıf ve yayın kararıyla birlikte listelenir.
- T02 öncesi aynı tarama: [`evidence/t02-claims-inventory-before.json`](evidence/t02-claims-inventory-before.json). Bu tarama T01 sonrası, T02 öncesi durumu gösterir.

| Ölçü | T02 öncesi | T02 sonrası |
|---|---|---|
| Sayısal iddia taşıyan metin | 620 | 263 |
| Tablo dışı (açıklama, meta, içerik, özellik, teknik özellik, avantaj, SSS) | 274 | 81 |
| Birinci tekil/çoğul şahısla yazılmış ("…yoruz", "kapasitemiz") | 61 | 16 |
| Sınıflandırılmamış (`REVIEW`) | — | **0** |

T02 sonrası sınıflar: `CAPABILITY_VERIFIED` 43 (yalnız ±0.01 mm), `CERTIFICATE` 11, `GENERAL_REFERENCE` 157 (tablo notuyla), `MATERIAL_TYPICAL` 35, `EDITORIAL_REFERENCE` 8, `DESIGN_GUIDANCE` 2, `NOT_A_CLAIM` 7.

## Sınıflar ve yayın kuralı

| Sınıf | Tanım | Fact source | Yayın kararı |
|---|---|---|---|
| `CAPABILITY_VERIFIED` | Şirket kabiliyeti, doğrulanmış | `USER_INPUTS.md` §D `MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm` (`claims.ts`) | Yayında. ±0.01 mm daha hassas bir değerle değiştirilmedi. |
| `CERTIFICATE` | ISO 9001:2015, ISO 14001:2015 | `USER_INPUTS.md` §C `VERIFIED` | Yayında. Yayın kabulü `BLOCKED_DATA`: issuer, kapsam ve geçerlilik belgesi yok (O03). |
| `GENERAL_REFERENCE` | Karşılaştırma tablolarındaki genel yöntem/proses değerleri | Kaynak yok (literatür tipik değeri) | Tablo notuyla yayında: "Genel referans değerleridir; şirket kapasitesini göstermez". Şirket kapasitesi gibi okunan sütunlar kaldırıldı. |
| `MATERIAL_TYPICAL` | Malzemenin tipik sertlik/mukavemet değeri | Kaynak yok | "Tipik" etiketiyle yayında; kaynaklandırma T03'te (O05). |
| `EDITORIAL_REFERENCE` | Blogdaki "yaklaşık/tipik" malzeme ve standart değerleri | Metin içinde standart adı (ör. MIL-A-8625) | Yayında; UX05'te gözden geçirilecek. |
| `DESIGN_GUIDANCE` | DFM kuralları, Ra rehberi | Genel tasarım rehberi | Rehber olarak yayında, kabiliyet değil. |
| `NOT_A_CLAIM` | Okuma süresi, sembol adı | — | — |

## T02 kapsamında public'ten çıkarılan iddialar

Değerler silinmedi: T02 öncesi metinleriyle `evidence/t02-claims-inventory-before.json` içinde ve git geçmişinde duruyor. Onaylı veri gelirse tek kaynaktan (`claims.ts`) geri konmalı (O02).

| Öncelik kalemi | Önceki public iddia | Uygulanan karar |
|---|---|---|
| Mikro işleme | 60.000 RPM, Ø0.1/Ø0.05 mm takım, 0.1 µm optik ölçüm, Ra 0.1, 1–100 mm³, ±1–5 µm tablo toleransları | Çıkarıldı. Proses nitel olarak anlatılıyor, çalışma aralığı teklifte. "Medikal implant" yerine "medikal bileşen". |
| Kalıp | 1–128 kavite, 1.000.000+ / 500.000+ / 10.000+ çevrim, çevrim/saat ve hacim tablosu | Çıkarıldı. Kavite ve kalıp ömrü teklifte. Kalıp çeliği sertlikleri tipik değer olarak kaldı. |
| Döküm CT / duvar | 120–1200 ton, 0.5 mm min. duvar, "±0.05 mm CT4–CT6", sabit ± değerli ISO 8062 tablosu, 100K+ çevrim | Çıkarıldı. CT sınıfının nominal ölçüye bağlı olduğu yazıldı; sabit ± tablo kaldırıldı. |
| Anodizasyon HRC / Vickers | "60–70 HRC" sertlik, tip başına kalınlıklar (Tip I 5–15 µm, MIL-A-8625 ile çelişkili), 2000×1000×800 mm tank, 50 kg, boyut hesaplama tablosu | Çıkarıldı. Tabaka sertliğinin HV ile ifade edildiği yazıldı; tipler MIL-A-8625 referansıyla nitel anlatılıyor. |
| Kimyasal işlemler ortak kalınlık | "kaplama kalınlığı 1–25 µm" (pasivasyon dahil) | Çıkarıldı. Pasivasyonun kaplama bırakmadığı, diğer işlemlerde kalınlığın şartnameye göre belirlendiği yazıldı. |
| Tuz spreyi süreleri | 336+ / 500+ / 750+ / 1000+ / 1500+ / 2000+ / 5000+ saat (anodizasyon, kimyasal, boya, yat) | Çıkarıldı. Test süresi ve kabul kriteri şartnameye göre (ASTM B117). |
| Insert | M2–M12, 2000 N+, <3 sn; tablo çekme/çevrim sütunları | Çıkarıldı. Insert tipine ve malzemeye göre. |
| QR / DataMatrix | %99.9+ okuma oranı; 2.5×2.5 mm'de 50, 5×5 mm'de 500 karakter; min. alan ve okuma mesafesi | Çıkarıldı. Tabloda yalnız standardın izin verdiği maksimum kapasite kaldı (açık notla). |
| Enerji 25 yıl | 25+ yıl dış ortam ömrü, 85 µm+, 500 kg | Çıkarıldı. Ömrün ortam sınıfı ve kaplama sistemine göre şartnamede tanımlandığı yazıldı. |
| Petrol 15.000 PSI | 15.000 PSI, −46 / +343 °C | **Proje gereksinimi** olarak yeniden çerçevelendi: basınç ve sıcaklık sınıfı müşteri şartnamesine göre. |
| Güç IACS / 36 kV | IACS %99+ / %101 / %99.9 / %61; 36 kV | Çıkarıldı. ETP bakır için "IACS %99.9" teknik olarak yanlıştı (99.9 saflık değeri). İletkenlik malzeme sertifikasıyla teyit ediliyor; gerilim sınıfı proje gereksinimi. |
| Madencilik sertlik / ağırlık | 55–65 HRC, 500 kg, 1500 mm, indüksiyon/karbürizasyon ile sertleştirme | Çıkarıldı. Sertlik ve ısıl işlem şartnameye göre; çalışma aralığı teklifte. Isıl işlem kapasitesi iddia edilmiyor. |
| Revizyon dahil paketler | "3 revizyon dahil" | Çıkarıldı. Revizyon kapsamı teklifte. |
| Simülasyon / yazılım | Moldflow, dijital ikiz, ERP entegrasyonu, gerçek zamanlı dashboard, Jira/MS Project/PowerBI/Slack envanteri, termal simülasyon + ark testi, "mekanik + elektronik + yazılım" | Çıkarıldı veya koşula bağlandı ("akış analizinin kapsamı teklifte"). CAM takım yolu doğrulaması genel uygulama olarak kaldı. |

Öncelik listesi dışında aynı kuralla kaldırılanlar:
- **CNC freze:** iş alanları, 12.000–40.000 RPM, 30–120 takım magazini, Ra 0.4.
- **Mekanik yüzey:** Ra 0.05, 2–8 bar, 1500×800 mm.
- **Lazer:** 20–100 W, 10.000 mm/s, 100.000 saat lazer ömrü.
- **Logo markalama:** 1200 DPI, ±0.01 mm konum tekrarlanabilirliği.
- **Kaynak:** yönteme göre kalınlık aralıkları.
- **Montaj:** ±%5 tork toleransı, M3–M12.
- **Hidrolik:** 350 bar, 1.5× test, L/D 50:1. Basınç proje gereksinimi olarak çerçevelendi.
- **İklim:** −40 / +200 °C, 100 bar, helyum 1×10⁻⁶. Proje gereksinimi olarak çerçevelendi.
- **3D tarama:** 0.02 mm.
- **Robotik:** konsantriklik ≤0.01 mm.
- **Yat:** elektropolisaj Ra 0.2/0.4.
- **Boru:** PN6–PN40 / 150–2500 lb.
- **Silikon:** ±0.05.
- **Fikstür:** "±0.01 mm tekrarlanabilirlik" (standart toleranstan ayrı bir sonuç iddiası).
- **Adet aralıkları:** sayfadan sayfaya çelişen aralıklar (1–100 / 10–50 / 10–100 / 10–500 / 1–1000).
- **Malzeme stoku:** "sürekli stok" ve minimum sipariş kg iddiaları.

## Sertifikalar

| id | Rota / alan | Mevcut metin | Fact source | İzin kaynağı | Doğrulama | Yayın kararı |
|---|---|---|---|---|---|---|
| CERT-ISO9001 | `claims.ts` `CERTIFICATIONS`; SSS, kalite dosyası, hakkımızda, RFQ | `ISO 9001:2015` | `USER_INPUTS.md` §C `VERIFIED` | §C `PUBLIC_OK` | Belge bekleniyor (O03) | Yayında; yayın kabulü `BLOCKED_DATA` |
| CERT-ISO14001 | aynı | `ISO 14001:2015` | §C `VERIFIED` | §C `PUBLIC_OK` | Belge bekleniyor (O03) | Yayında; yayın kabulü `BLOCKED_DATA` |
| CERT-OHSAS18001 | önceden `CERTIFICATIONS`, chatbot SSS ve 4 sektör SSS'i | `OHSAS 18001` | §C `OTHER_CERTIFICATIONS` | §C `PUBLIC_OK` (**değiştirilmedi**) | Geri çekilmiş standart; güncel geçerlilik belgesiz | **Vitrinden çıkarıldı (T02).** `claims.ts` içinde `OHSAS_18001` adıyla `withhold` kaydı olarak duruyor. |
| CERT-ISO45001 | — | yok | — | — | — | Eklenmedi (§3) |

## M01'den kalan satırlar

| id | Rota / alan | Mevcut metin | Karar |
|---|---|---|---|
| MAT-SCORE-MORPH | `/malzemeler` → `MaterialMorphScroll` | İşlenebilirlik 4/5, Korozyon 5/5, … | M01 ile public'ten kaldırıldı |
| MAT-SCORE-TABLE | `/malzemeler` karşılaştırma ve sıralama | `n/5` puanlar, fiyat bandı sıralaması | T03 |
| SLA-QUOTE | `QUOTE_RESPONSE_TIME` | 1–3 iş günü | Yayında (`USER_INPUTS.md` `QUOTE_SLA`) |
| REF-PLATE-MALZEME | `/malzemeler` 04 PAFTA | Temsili malzeme görünümü | Caption yayında (D2 ile "yukarıdaki") |
