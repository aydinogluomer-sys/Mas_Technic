# Faz 6: son ölçüm

Ölçülen build: `main a37a09d` (PR #36 sonrası), EN açık, placeholder Supabase env. Taban için `f0-baseline.md` kullanıldı (`7eeae2c`). Ölçüm araçları Faz 0'dakilerle aynı.

## Bundle — `scripts/quality/bundle-report.mjs`

| | Faz 0 | Faz 6 | Fark |
|---|---|---|---|
| `/` ilk JS (gz) | 162,8 KiB | 123,4 KiB | −39,4 KiB (−24 %) |
| `/en` ilk JS (gz) | 203,1 KiB | 163,9 KiB | −39,2 KiB (−19 %) |
| Render-blocking CSS (gz, 3 dosya) | 57,8 KiB | 56,6 KiB | −1,2 KiB |
| Framer (`vendor-framer`) ilk grafikte | var | yok | Faz 2 |
| GSAP (`vendor-gsap`) ilk grafikte | yok | yok | Faz 0'da da yoktu; `--forbid vendor-framer,vendor-gsap` geçti |

Toplamlar raporların `jsTotalKiB.gz` alanından alındı. Planın hedefi `/` için yaklaşık 117 KiB'ti. Ölçülen değer 123,4 KiB.

Kaynak dosyalar: `f0-bundle-report.json` ve `f6-bundle-report.json`.

## Satırlar — `scripts/quality/line-report.mjs`

| Kova | Faz 0 | Faz 6 | Fark |
|---|---|---|---|
| İçerik (kısaltılmaz) | 17.957 | 35.622 | +17.665 |
| Kilitli (`admin`, `musteri-paneli`, supabase types…) | 12.970 | 12.970 | 0 |
| **Refactor edilebilir** | **35.718** | **31.111** | **−4.607 (−12,9 %)** |
| Toplam `src/` | 66.645 | 79.703 | +13.058 |

İçerik artışının 17.634 satırı Faz L'den geliyor: DE, RU ve ZH sözlükleri, içerik paketleri ve yasal metinler. Faz L'den hemen önce (`a382450`, PR #23 sonrası) içerik kovası 17.988 satırdı. Kalan 31 satır R1 ve sonrası işlerden geliyor (`detail-visuals.ts` +22, `technicalLandingData.ts` +9). Bunlar planın "içerik dosyaları kısaltılmaz, eklemek serbest" kuralına giriyor. Kodun sadeleşmesi refactor edilebilir kovada ölçülüyor.

Plan tablosu 1a ile 1b için −8,5 ile −9,2 % tahmin etmişti. Ölçülen −12,9 % 1c olmadan geldi; Faz 1c atlandı.

## Yerel lab — `scripts/quality/perf-lab.mjs` (yalnız yön)

Ayarlar Faz 0 ile aynı: yavaş 4G (150 ms, 1,6 Mbps), 4× CPU, rota ve genişlik başına 5 soğuk koşu, `serve-dist` (HTTP/1.1). Makine yükü günden güne değiştiği için Faz 0 build'i (`7eeae2c`) yeniden build edildi. İki build **aynı oturumda arka arkaya** ölçüldü (A/B).

| Rota @ genişlik | LCP p75 F0 → F6 | JS 10 sn F0 → F6 (KiB) | Lab TBT p75 F0 → F6 |
|---|---|---|---|
| `/` @375 | 1680 → 1680 | 198,1 → 159,1 | 871 → 1244 |
| `/` @1440 | 1764 → 1796 | 248,5 → 164,5 | 1339 → 1439 |
| `/en` @375 | 1672 → 1716 | 238,7 → 199,9 | 1039 → 1188 |
| `/en` @1440 | 1744 → 1752 | 289,1 → 205,3 | 1470 → 1184 |
| `/hizmetler/cnc-frezeleme` @375 | 1604 → 1648 | 291,6 → 309,9 | 812 → 917 |
| `/hizmetler/cnc-frezeleme` @1440 | 1640 → 1608 | **342 → 315,3** | 1211 → 1000 |

CLS iki build'de aynı: 375'te 0; 1440'ta `/` için 0,014, `/en` için 0,009.

**Okuma:**
- **10 saniyede yüklenen JS:** masaüstünde belirgin düştü; `/` @1440'ta −34 %. Planın masaüstü hedefi yaklaşık 122 KiB'ti, ölçülen 164,5 KiB. Kalan farkın hangi chunk'lardan geldiği istek düzeyinde ölçülmedi.
- **JS bütçesi (320 KiB):**
  - `/hizmetler/cnc-frezeleme` @1440 bütçenin altına indi (342 → 315).
  - İngilizce hizmet sayfası `/en/hizmetler/cnc-frezeleme` Faz 6 ölçümünde bütçenin üstündeydi: 375'te 423,7, 1440'ta 429 KiB (C4'te 405,2 ve 455,5). Kaynak: `f6-perf-lab-en-service.json`. Bu aşım aşağıdaki "EN hizmet bütçesi" bölümünde kapatıldı.
- **LCP:** fark ±45 ms içinde. Bu, koşular arası gürültüden ayırt edilemiyor; LCP değişmedi denebilir.
- **Lab TBT:** sonuç karışık. `/` @375 iki ayrı koşuda da yükseldi (Faz 6 ilk koşu 1094, A/B koşusu 1244; Faz 0 729 ve 871). `/en` @1440 ile hizmet sayfası @1440'ta düştü.
  - `/` için olası neden: taban `7eeae2c`, R1'den **önceki** ana sayfa. R1, kullanıcı kararıyla bandı, manifestoyu, süreç fotoğrafını ve ters kaydırma bölümünü geri getirdi. Yani karşılaştırılan iki `/` aynı sayfa değil.
  - Bu açıklama doğrulanmadı; profil alınmadı. Lab TBT INP değildir.
- **Kritik CSS** (`f4-css-fonts.md`): yerelde `cssEnd − imageEnd` 375'te +345 ms. Vercel ölçümünde koşul sağlandı, ama site sahibi kuralı uygulamadı (aşağıda).

Kaynak dosyalar: `f6-perf-lab-local.json` (ilk koşu), `f6-perf-lab-ab-f0.json` ve `f6-perf-lab-ab-f6.json` (A/B), `f6-perf-lab-en-service.json` (İngilizce hizmet sayfası).

## Yapılmayanlar / sahibinde

| Ölçüm | Durum |
|---|---|
| Vercel preview workflow `perf=true, english=true` (gerçek HTTP/2, CDN) | **Ölçüldü**: 10 Ekim, aşağıdaki "Vercel preview" bölümü |
| Chrome DevTools Lighthouse (mobil, 3 koşu, medyan) | **NOT_TESTED**, kullanıcı koşacak |
| WebPageTest, gerçek iPhone Safari ve Android Chrome | **NOT_TESTED** (O14) |
| INP | ölçülmedi |

## Faz özeti

| Faz | PR | Sonuç |
|---|---|---|
| 1a | #17 | ölü ve dev-only kod silindi; −5.950 satır, −3,4 MB kare |
| 1b-i…iii | #18, #20, #21 | shell, auth ve RFQ'da davranış koruyan sadeleştirme |
| 2 | #22 | header menüsü ve ters kaydırma Framer'dan CSS'e geçti |
| 3 | #23 | Lenis GSAP'siz, boşta ya da ilk girdide başlıyor |
| L1–L6 | #24–#34 | TR, EN, DE, RU, ZH; yeni diller bayrakla kapalı, anadil ve hukuk incelemesi bekliyor (O16) |
| 4 | #35 | ölü CSS silindi (−650 satır); font ön yüklemeleri doğrulandı |
| 1b-iv (kısa) | #36 | blog görsel tablosu ve rota ailesi tablosu tek yerde |
| 1c | — | atlandı (kullanıcı kararı) |

Her PR'ın kapısında parity full uygulandı (`maxDiffPixels: 0`). PR #28'den beri çıkan tek fark, iki İngilizce PEEK sayfası: `en__malzemeler` ve `en__malzemeler__yuksek-performans-plastikler`. Bu fark #28'de bilerek yapılan içerik değişikliğinden geliyor ve yerel taban ondan eski.

## EN hizmet bütçesi (Faz 6 sonrası)

Ölçüm `perf-lab.mjs` ile yapıldı. Ayarlar yukarıdakiyle aynı: yavaş 4G, 4× CPU, 5 soğuk koşu, yerel, yalnız yön gösterir. Kaynak: `f6-perf-lab-budget.json`.

| Rota @ genişlik | JS 10 sn önce → sonra (KiB) | LCP p75 (ms) |
|---|---|---|
| `/en/hizmetler/cnc-frezeleme` @375 | 423,7 → **294,5** | 1524 |
| `/en/hizmetler/cnc-frezeleme` @1440 | 429 → **299,9** | 1588 |
| `/hizmetler/cnc-frezeleme` @375 | 309,9 → 203,9 | 1552 |
| `/hizmetler/cnc-frezeleme` @1440 | 315,3 → 209,3 | 1612 |
| `/` @375 · @1440 | 159,1 · 164,5 → 131,2 · 136,5 | 1660 · 1788 |
| `/en` @375 · @1440 | 199,9 · 205,3 → 172 · 177,4 | 1644 · 1720 |

**Ne değişti:**
1. **Hizmet sayfası parallax'ı framer'sız.** `ServiceDetail` yalnız hero görselinin ±60 px parallax'ı ve açılış animasyonu için `vendor-framer` (43 KiB gz) yüklüyordu.
   - Parallax artık bir scroll/resize dinleyicisi ve `ResizeObserver` ile CSS `translate` özelliğine yazılıyor.
   - Açılış animasyonu artık bir CSS keyframe (`shell-plate-settle`).
   - Azaltılmış harekette ikisi de kapalı, önceki gibi.
2. **Hizmet ve kategori sayfaları yalnız kendi verisini okuyor** (`useServiceData()`, `src/i18n/service-data.ts`).
   - Her dilin içerik paketinden hizmet ve kategori kısmı ayrı bir parçaya ayrıldı (`src/content/<dil>/core.ts`). Tam paket bu parçayı içe aktarmaya devam ediyor.
   - Bu sayfalar artık malzeme, blog, vaka ve sohbet modüllerini ve paketin geri kalanını indirmiyor.
   - İlk açılışta önceden yüklenen parça da buna göre seçiliyor (`App.tsx`, `SERVICE_FAMILY_PATH`).
3. **Toast katmanları ilk etkileşimde yükleniyor.** İlk etkileşim `pointerdown`, `keydown`, `touchstart` ya da `dragenter` olayı.
   - Herkese açık sayfalardaki her toast bir kullanıcı eylemine yanıt.
   - Sonner'ın `useTheme()` çağrısı mount anında temayı da uyguluyordu; bu iş artık uygulama kabuğunda, aynı noktada yapılıyor.

**Parity (full, 390 test):** 325 geçti. Farklar:
- **2 sayfa:** bilinen İngilizce PEEK farkı.
- **63 hizmet sayfasının hero görseli:** 62'si 1440'ta, biri (`/hizmetler/lazer-kazima`) 375'te.
  - Bütün fark kutuları görsel çerçevesinin içinde: en fazla 417 px yükseklik, çerçeve 420 px.
  - Neden: main'deki taban, framer'ın JS ile sürdüğü açılış animasyonunu bitmeden yakalıyor (ölçek 1,0026). Parity'nin `rest` adımı yalnız WAAPI/CSS animasyonlarını sona sarabiliyor. CSS animasyonu bitmiş durumda yakalanıyor.
  - Parallax değeri −51,35 px'e karşı −51,31 px.
  - Görsel aynı dosyadan ve aynı konumda çiziliyor.
- **Bu sırada bulunan iki fark kapatıldı:**
  - Bitmiş animasyonun `fill: both` ile görseli ayrı katmanda tutması.
  - Toast ertelemesiyle temanın ilk tıklamaya kayması.

## Vercel preview (10 Ekim)

Workflow koşusu: https://github.com/aydinogluomer-sys/Mas_Technic/actions/runs/38026649673
- Commit `main 59f3b45`, EN açık.
- Ortam: preview (HTTP/2, Vercel edge), GitHub runner Chromium.
- Ayarlar: yavaş 4G, 4× CPU, rota başına 5 soğuk koşu.
- Sayılar iş logundan alındı. Artifact (`preview-evidence-attempt-1`) bu oturumdan indirilemedi.
- Lab TBT INP değildir; INP ölçülmedi.

| Rota @ genişlik | LCP p75 | CLS p75 | JS 10 sn | Lab TBT p75 | CSS bitişi / görsel bitişi p75 |
|---|---|---|---|---|---|
| `/` @375 | 1732 ms | 0 | 133,2 KiB | 624 ms | 1362 / 683 ms |
| `/` @1440 | 1800 ms | 0 | 138,8 KiB | 805 ms | 1390 / 990 ms |
| `/hizmetler/cnc-frezeleme` @375 | 1652 ms | 0 | 208,4 KiB | 365 ms | 1392 / — |
| `/hizmetler/cnc-frezeleme` @1440 | 1716 ms | 0 | 213,9 KiB | 487 ms | 1398 / — |
| `/en` @375 | 1648 ms | 0 | 174,3 KiB | 587 ms | 1341 / 711 ms |
| `/en` @1440 | 1740 ms | 0 | 179,8 KiB | 666 ms | 1391 / 976 ms |
| `/en/hizmetler/cnc-frezeleme` @375 | 1632 ms | 0 | 300,3 KiB | 365 ms | 1384 / — |
| `/en/hizmetler/cnc-frezeleme` @1440 | 1692 ms | 0 | 305,9 KiB | 394 ms | 1412 / — |

**Okuma:**
- **LCP:** her rotada 2,5 s hedefinin altında; en yüksek değer 1800 ms.
- **CLS:** her rotada 0.
- **JS 10 sn:** her rota 320 KiB bütçesinin içinde. En dar rota EN hizmet sayfası: 300 / 306 KiB, yerel ölçümden yaklaşık 6 KiB yüksek.
- **Yayın doğrulaması** (`verify-release.mjs`) hata vermeden geçti.
- **Kritik CSS:** `cssEnd − imageEnd` 375'te `/` için +679 ms, `/en` için +630 ms. Plan kuralının koşulu sağlanıyor, ama site sahibi kuralı uygulamadı (`f4-css-fonts.md`).
- **Hâlâ ölçülmeyenler:** Lighthouse (mobil, 3 koşu), WebPageTest ve gerçek cihaz.
