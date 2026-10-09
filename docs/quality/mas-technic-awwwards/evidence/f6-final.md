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
  - İngilizce hizmet sayfası `/en/hizmetler/cnc-frezeleme` **hâlâ bütçenin üstünde**: 375'te 423,7, 1440'ta 429 KiB. C4'te 405,2 ve 455,5 KiB'ti. Kaynak: `f6-perf-lab-en-service.json`. C4 kaydındaki EN aşımları kapanmadı.
- **LCP:** fark ±45 ms içinde. Bu, koşular arası gürültüden ayırt edilemiyor; LCP değişmedi denebilir.
- **Lab TBT:** sonuç karışık. `/` @375 iki ayrı koşuda da yükseldi (Faz 6 ilk koşu 1094, A/B koşusu 1244; Faz 0 729 ve 871). `/en` @1440 ile hizmet sayfası @1440'ta düştü.
  - `/` için olası neden: taban `7eeae2c`, R1'den **önceki** ana sayfa. R1, kullanıcı kararıyla bandı, manifestoyu, süreç fotoğrafını ve ters kaydırma bölümünü geri getirdi. Yani karşılaştırılan iki `/` aynı sayfa değil.
  - Bu açıklama doğrulanmadı; profil alınmadı. Lab TBT INP değildir.
- **Kritik CSS** (`f4-css-fonts.md`): yerelde `cssEnd − imageEnd` 375'te +345 ms. Karar Vercel ölçümüne bırakıldı.

Kaynak dosyalar: `f6-perf-lab-local.json` (ilk koşu), `f6-perf-lab-ab-f0.json` ve `f6-perf-lab-ab-f6.json` (A/B), `f6-perf-lab-en-service.json` (İngilizce hizmet sayfası).

## Yapılmayanlar / sahibinde

| Ölçüm | Durum |
|---|---|
| Vercel preview workflow `perf=true, english=true` (gerçek HTTP/2, CDN) | **NOT_TESTED**, kullanıcı koşacak. Kritik CSS kararı buna bağlı. |
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
