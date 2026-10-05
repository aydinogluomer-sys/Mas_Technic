# Faz 0 — baseline (4 Ekim 2026)

Taban: `main` `7eeae2c` (PR #14, hero AVIF/WebP sonrası). Build: `VITE_SITE_ENGLISH=live`, placeholder Supabase env. Ürün kodu değişmedi; bu fazda yalnız ölçüm araçları ve kurallar eklendi.

Hiçbir hedef burada "kanıtlandı" değildir. Yerel sayılar yalnız yön gösterir. Lab ölçümünde otorite, preview workflow'unun gerçek Vercel üzerindeki perf-lab koşusudur (`perf=true`). Bu koşu henüz yapılmadı.

## Satır sayısı — `scripts/quality/line-report.mjs`

Kaynak: `f0-line-report.json`. Kapsam: `src/` altındaki `.ts`, `.tsx` ve `.css` dosyaları, 282 dosya.

| Kova | Satır |
|---|---|
| İçerik (kısaltılmaz: `src/data`, `src/content`, `src/i18n/locales`, supabase types) | 17.957 |
| Kilitli (admin, müşteri paneli, excelExport) | 12.970 |
| Refactor edilebilir | 35.718 |
| **Toplam** | **66.645** |

## İlk JS/CSS grafiği — `scripts/quality/bundle-report.mjs`

Kaynak: `f0-bundle-report.json`. Ölçüm gzip -9 ile yapıldı. Kapsam: entry chunk, statik import kapanışı ve `Index` rota chunk'ı; `/en` için buna sözlük chunk'ı da eklenir.

| Sayfa | JS (gz) | Dosya | En büyükler | Render-blocking CSS (gz) |
|---|---|---|---|---|
| `/` | 162,8 KiB | 22 | vendor-react 46,3 · **vendor-framer 43,1** · entry 37,4 · PageShell 13,8 · Index 10,2 | 57,8 KiB (3 dosya: index 29,8 · PageShell 18,8 · Index 9,2) |
| `/en` | 203,1 KiB | 23 | yukarıdakiler + **en sözlüğü 40,3** | 57,8 KiB |

Zaten sağlananlar. Bunlar Faz 0'da kanıtlandı ve iş olarak yapılmayacak:
- **GSAP ve Lenis** ilk grafikte yok. `vendor-gsap`, `use-gsap` ve `lenis` yalnız dinamik import ile geliyor.
- **Admin, xlsx, ChatBot, CustomCursor ve tüm iç sayfalar** yalnız dinamik.
- **Three.js** build'de hiç chunk üretmiyor.
- **MaterialMorphScroll** hiçbir yerden import edilmiyor (Faz 1a'da silinecek).

Gerçek kaldıraç `/`'daki `vendor-framer` (Faz 2). Masaüstünde ilk 10 saniyede gelen GSAP+Lenis ayrı bir kaldıraç (Faz 3). `/en` sözlüğü (40 KiB) ek bir gözlem; planda değil.

## Yerel lab — `scripts/quality/perf-lab.mjs` (yön için)

Kaynak: `f0-perf-lab-local.json`.

Profil:
- yavaş 4G (150 ms, 1,6 Mbps) ve 4× CPU
- rota/genişlik başına 5 soğuk koşu
- sandbox Chromium, `serve-dist` (HTTP/1.1, gzip)

Lab TBT INP değildir; INP ölçülmedi.

| Rota @ genişlik | LCP p75 | LCP öğesi | CSS bitişi p75 | LCP görseli bitişi p75 | Render gecikmesi p75 | CLS p75 | JS 10 sn | Lab TBT p75 |
|---|---|---|---|---|---|---|---|---|
| `/` @375 | 1612 | img | 1117 | 544 | +496 | 0 | 198,1 | 729 |
| `/` @1440 | 1696 | img | 1097 | 872 | +599 | 0,014 | 248,5 | 1131 |
| `/en` @375 | 1624 | img | 1108 | 532 | +520 | 0 | 238,7 | 768 |
| `/en` @1440 | 1704 | img | 1083 | 689 | +620 | 0,009 | 289,1 | 1091 |
| `/hizmetler/cnc-frezeleme` @375 | 1512 | p.shell-lede | 1118 | — | +408 | 0 | 291,6 | 583 |
| `/hizmetler/cnc-frezeleme` @1440 | 1616 | h1 | 1118 | — | +501 | 0 | **342** | 946 |

Süreler ms, boyutlar KiB.

- Kırılım: render gecikmesi = LCP − max(TTFB, CSS bitişi, görsel bitişi). Görsel bitişi, LCP URL'sinin ilk biten isteğidir; preload ile aynı URL ikinci kez istenebiliyor. İlk koşuda en geç biten istek alınmıştı ve render gecikmesi negatif çıktı. Bu düzeltildi, sayılar düzeltilmiş koşudan.
- Yerelde CSS, hero görselinden **sonra** bitiyor (375'te +573 ms). Faz 4'ün kritik CSS kuralı, 375 p75'te `cssEnd > imageEnd + 300 ms` koşuluna bakar. Bu koşul **gerçek Vercel ölçümüyle** karar verilecek. HTTP/1.1 yereli CSS'i olduğundan geç gösterebilir.
- JS bütçesi (320 KiB) yalnız `/hizmetler/cnc-frezeleme` @1440'ta aşılıyor (342). Bu durum C4'ten beri biliniyor.

## Parity harness — `e2e/parity/route-parity.spec.ts`

Kapsam ve adımlar `../parity.md` dosyasında. Gürültü koşusu aynı `main` build'ine karşı yapıldı (`PARITY_SCOPE=full`, 375 + 1440, 190 rota × 2 + rota kümesi kontrolü, menü durumları iki hareket modunda; `maxDiffPixels: 0`, `threshold: 0`, yeniden deneme yok): **390 geçti, 0 flaky, 0 hata.** Harness kapı olarak kullanılabilir. Rota kümesi kontrolü elle de denendi: `sss.html` eksik bir dist'te `removed: ["/sss"]` ile düştü.

## Kapılar (Faz 0)

| Kontrol | Sonuç |
|---|---|
| `npm run typecheck` | geçti |
| `npm run lint` | 0 hata (2 eski uyarı, `BlurImage.tsx`) |
| `motion-audit --mode=guard` | PASS |
| `motion-audit --mode=rest` | PASS |
| `generate-config --check` | güncel (197 redirect, 10 rewrite) |
| `npm run build` | geçti (commit öncesi) |
| Ürün kodu / `package.json` / `supabase/` değişikliği | yok |

## Bekleyen (kullanıcı)

- Preview workflow'u `perf=true` ve `english=true` ile koşulmalı. Bu, AVIF hero'nun gerçek Vercel ölçümü olacak ve Faz 1a'dan önceki gerçek taban sayılacak.
- DevTools Lighthouse ölçümü: Mobil, 3 koşu, medyan alınır. Sonuç buraya yazılacak.
