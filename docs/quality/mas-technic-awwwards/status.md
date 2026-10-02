# Durum — MAS TECHNIC uygulama sözleşmesi

- Yürütme kaynağı: `MAS TECHNIC — Claude Code uygulama sözleşmesi` v1.0 (2 Ekim 2026)
- Denetim tabanı: `4618e71f6233abc0748cf541733912a26f6bc0e0` (`main`); checkout HEAD aynı commit (S00).
- Dal: `claude/documentation-roadmap-nwV4C`
- Paket 1: **S00 → S01 → M01 → R01**
- Test ortamı: bulut container, headless Chromium 1194, Google Fonts bu ağda sertifika hatası veriyor. Tüm tarayıcı sonuçları `LOCAL_FIXTURE`. Gerçek cihaz yok, aday host yok.

| İş | Durum | Bağımlılık | Değişen dosyalar | Son kanıt |
|---|---|---|---|---|
| S00 | PASS_LOCAL | — | `docs/quality/mas-technic-awwwards/*`, `scripts/quality/routes-manifest.ts` | `routes.json`: 103 adres, sözleşme §15 ile **birebir aynı** (delta 0). Ayrıca 3 dev-only rota ve 96 yanlış-aile yönlendirmesi listelendi. `/` = `TechnicalLanding`. `HeroCanvas` / `CNCScrollStory` repoda yok, bu yüzden görev üretilmedi. Dirty dosya yoktu (`git status` boş). |
| S01 | PASS_LOCAL (kısmi) · `BLOCKED_DATA: candidate-host` | O01, O09 | `scripts/quality/capture-requests.mjs`, `e2e/s01-webgl-failure.spec.ts` | `evidence/s01-baseline-requests.json`, `evidence/s01-baseline-requests-noenv.json`, `evidence/s01-webgl-failure.json`, `evidence/commands.md` |
| M01 | PASS_LOCAL | — | `src/pages/Malzemeler.tsx`, `src/components/shell/ShellComposition.tsx`, `src/styles/shell.css`, `scripts/claims-gate.mjs`, `e2e/malzemeler-static-plate.spec.ts` | 80 kare isteği → 0; canvas 0; pafta yüksekliği 180 / 276 / 480 px (375 / 768 / 1440); yatay taşma 0; görsel hatasında açıklayıcı not. `evidence/screens/after/m01-plate-*.png` |
| R01 | PASS_LOCAL | Host 301 → RELEASE01 | `src/lib/detail-route.ts`, `src/pages/ServiceDetail.tsx`, `e2e/detail-route-family.spec.ts` | 48/48 kanonik adres yönlendirmesiz render oluyor; 96/96 yanlış-aile adresi doğru adrese `replace` yönlendiriliyor; bilinmeyen slug not-found. Direct load, refresh, SPA ve geri tuşu test edildi. Yönlendirme **istemci tarafında**, HTTP 301 değil. |

## S01 taban ölçümü (özet)

Yöntem: her koşu için soğuk tarayıcı bağlamı, etkileşim yok, 10 sn pencere. gzip değeri `dist/` dosyasının seviye-9 gzip boyutu (hesaplanmış). Transfer değeri `vite preview`'dan gelen sıkıştırılmamış bayt sayısı. İkisi hiçbir yerde toplanmadı. Etkileşim olmadığı için kullanıcı isteğiyle açılan modüller (CAD görüntüleyici, chatbot paneli) listede yok.

| Rota | Genişlik | JS gzip, load'a kadar | JS gzip, load→10 sn | Toplam (10 sn) | Görsel istek | Sekans karesi |
|---|---|---|---|---|---|---|
| `/` | 375 | 79.1 KiB | 204.4 KiB | 283.6 KiB | 2 | 0 |
| `/` | 1440 | 79.1 KiB | 255.5 KiB | **334.6 KiB** | 5 | 0 |
| `/malzemeler` (taban) | 375 | 79.1 KiB | 215.0 KiB | 294.2 KiB | 81 | **80** |
| `/malzemeler` (taban) | 1440 | 79.1 KiB | 265.8 KiB | 345.0 KiB | 81 | **80** |
| `/malzemeler` (M01 sonrası) | 375 | 79.2 KiB | 212.2 KiB | 291.3 KiB | 1 | 0 |
| `/malzemeler` (M01 sonrası) | 1440 | 79.2 KiB | 263.2 KiB | 342.4 KiB | 1 | 0 |

- `/` @1440 için 10 sn içindeki otomatik JS, iç hedef olan ≤320 KiB'ın **üstünde** (334.6 KiB). En büyük otomatik modüller: `servicePages` 52K, `vendor-gsap` 44K, `vendor-framer` 43K, `ChatBot` 43K (hepsi load sonrasında, etkileşimsiz geliyor). PERF01'e devredildi, bu pakette dokunulmadı.
- Reduced-motion `/malzemeler`'de de 80 kare indiriliyordu. M01 ile kalktı.
- `/malzemeler` @1440 belge yüksekliği 10636 → 8818 px (−%17).
- Uzun görev: `/` @375 için bir adet 86 ms (t=253 ms).
- Fontlar: Google Fonts bu ağda `ERR_CERT_AUTHORITY_INVALID` veriyor. Font ölçümü yapılamadı, `FAIL_INFRA`.
- Envsiz build: uygulama `VITE_SUPABASE_URL is not set` hatasıyla her public rotada `ErrorBoundary`'ye düşüyor (blank root). `src/integrations/supabase/env.ts` bilerek yüksek sesle hata veriyor; sonuç yalnız bu sandbox'ı temsil ediyor, kullanıcılara genellenmedi. Ölçümler CI ile aynı placeholder env ile alındı.

### Canvas / WebGL envanteri (production)

| Yüzey | Tür | Rota | Ne zaman |
|---|---|---|---|
| `MaterialMorphScroll` | Canvas2D | `/malzemeler` | M01 sonrası **mount edilmiyor** |
| `rfq/cad/CadStage` | WebGL (R3F) | `/teklif-al` | Kullanıcı "3B önizlemeyi aç" dediğinde |
| `admin/RFQCadPreview` | WebGL | `/admin` | Korumalı panel |
| `musteri/CustomerCadPreview` | WebGL | `/musteri-paneli` | Korumalı panel |
| `ui/SparkParticles` | Canvas2D | — | Yalnız dev-only `LandingFlow` üzerinden |

WebGL hata probe'u (`/teklif-al`, desktop-1280): iki senaryoda da sayfa boşalmıyor, dosya formda kalıyor ve 2. adıma geçiliyor. **Bulgular (düzeltilmedi, QA01/RFQ03'e):**
1. WebGL hiç yoksa önizleme "3B görüntüleyici indirilemedi" diyor ve "Tekrar dene" sunuyor. Neden yanlış (indirme değil WebGL desteği), tekrar denemek de işe yaramıyor.
2. Context kaybında önizleme alanı uyarısız bembeyaz kalıyor (`evidence/screens/s01-webgl-context-lost.png`).
3. Özet panelinde kullanıcı seçmeden `25 adet`, `Alüminyum 6061-T6`, `CNC Frezeleme` dolu görünüyor (RFQ03 kapsamı, sözleşme bunu açıkça yasaklıyor).

## Test sonuçları

| Komut | Sonuç |
|---|---|
| `npm run typecheck` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabandaki `BlurImage.tsx` uyarılarıyla aynı) |
| `npm run build` (envsiz ve placeholder env) | geçti |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal, 305 kontrol (301 → 305; yeni 4 kontrol M01 etiket sabitlemesi) |
| Yeni specler: `detail-route-family`, `malzemeler-static-plate`, `s01-webgl-failure` (mobile-375, tablet-768, desktop-1280, desktop-1440; son koşu) | 47 geçti, 0 hata, 21 atlandı. Atlananlar bilerek yalnız desktop-1280'de çalışan veri, 48-adres turu ve WebGL probe testleri. M01 normal ve reduced-motion varyantları ayrı koşuldu. |
| İlgili regresyon (`malzemeler-sticky`, `shared-shell-accessibility`, `navigation-reachability`, `material-category-footer`, `qa-p08-scroll-region-reach`, `qa-p09a2-claims-sweep`, `qa-p09a2-contrast`; desktop-1280 + mobile-375) | 59 geçti, 0 hata, 19 atlandı |
| `critical-1280` + `critical-375` | 158 geçti, 5 hata, 3 atlandı. claims-gate düzeltmesinden sonra yeniden koşuldu: 2 claims-gate hatası kapandı (4/4 geçti). Kalan 3 hata **değişmemiş taban build'de de birebir aynı** (`FAIL_INFRA`): `landing-structure:95` ×2 (Google Fonts sertifika hatası konsolda), `technical-landing:178` (font fallback ile başlık oranı 0.773 > 0.75). |

## Çözülmemiş bağımlılıklar

- `BLOCKED_DATA: candidate-host` (O01): aday host yok, ölçümler yerel.
- O09: gerçek publishable Supabase env ile ölçüm yapılmadı.
- Host seviyesinde 301 (R01'in istemci yönlendirmesinin karşılığı): RELEASE01.
- Font ölçümü: Google Fonts erişilebilir bir ağda tekrarlanmalı.

## Paket 2 — T01 → T02 → T03 → COPY01 (+ D2)

- HEAD doğrulaması: paket 2 başında `origin/claude/documentation-roadmap-nwV4C` = `5ec6ce7` ve `main` = `4618e71` (paket 1 merge edilmemişti); paket 2 aynı dalın üstüne eklendi.
- D2 (kullanıcı kararı): M01 caption "…yukarıdaki kayıt…" oldu; claims-gate sabitlemesi aynı commit'te güncellendi (`328db88`).

| İş | Durum | Bağımlılık | Değişen dosyalar | Son kanıt |
|---|---|---|---|---|
| T01 | PASS_LOCAL · onay `BLOCKED_DATA` (O02) | O02 | `src/data/servicePages.ts`, `categoryPages.ts`, `materialsData.ts`, `navigation/ia.ts`, `i18n/locales/*` | Tablodaki 9 satırın hepsi uygulandı. Kaldırılan ifadeler public veride, meta'da ve türetilmiş SSS/chatbot havuzunda yok (`grep`). Genel ±0.01 mm korundu. |
| T02 | PASS_LOCAL · sertifika yayın kabulü `BLOCKED_DATA` (O03) | O02, O03 | `servicePages.ts`, `chatFaqData.ts`, `claims.ts`, `KaliteDosyasi.tsx`, `FinalSections.tsx`, `technical-landing.css`, `scripts/quality/claims-scan.ts` | `claims-inventory.json`: 620 → 263 sayısal ifade, tablo dışı 274 → 81, sınıflandırılmamış 0. OHSAS vitrinden çıktı. Landing kalite şeridi 5 kartla 12/6/4 ızgarada kapanıyor (`evidence/screens/t02/`). |
| T03 | PASS_LOCAL · kaynaklandırma `BLOCKED_DATA` (O05) | O05 | `materialsData.ts`, `material-figures.ts`, `MaterialRegister.tsx`, `Malzemeler.tsx`, `MalzemeKategori.tsx`, `shell.css`, `e2e/material-data-contract.spec.ts` | 87/87 kayıt yeni alanları taşıyor; kaynaklı kayıt 0. Public'te sayısal malzeme özelliği yok ("Veri doğrulanmadı"). Puan ve fiyat public'ten kalktı. `evidence/screens/t03/` |
| COPY01 | PASS_LOCAL (TR) · EN metin turu L01'e bağlı | L01 | `rail-labels.ts`, `ShellBand.tsx`, `PageShell.tsx`, `Header.tsx`, `TechnicalHero.tsx`, `caseStudies.ts`, `Hakkimizda.tsx`, `SSS.tsx`, `KaliteDosyasi.tsx`, `KabiliyetProfilleri.tsx`, `KabiliyetProfilDetay.tsx`, `i18n/locales/*`, `e2e/copy-user-language.spec.ts` | Yasaklı iç denetim cümleleri 8 rotada yok. Ray TR'de anlamlı Türkçe etiket basıyor. Profil etiketi sözleşmedeki tek cümle. Hero açıklaması sözleşme metni. `evidence/screens/copy01/` |

COPY01'in kabul maddesinde "iki dil ekran görüntüsü" var. EN public yüzey L01'de kurulacağı için bu paket yalnız TR'yi kanıtlıyor. Yeni hero ve ray metinlerinin EN/DE/RU/ZH sözlük karşılıkları eklendi; EN sayfa turu L01'de yapılacak.

### Paket 2 test sonuçları

| Komut | Sonuç |
|---|---|
| `npm run typecheck` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabanla aynı) |
| `npm run build` (envsiz ve placeholder env) | geçti |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal, 306 kontrol |
| `critical-1280` + `critical-375` (son koşu) | 160 geçti, 3 hata, 3 atlandı. Hatalar tabandaki 3 `FAIL_INFRA` testiyle birebir aynı (Google Fonts sertifika hatası / font fallback oranı). Sertifika testi (OHSAS yok, ISO 45001 yok) geçti. |
| Regresyon seti (`shared-shell-accessibility`, `navigation-reachability`, `qa-p08-waveb-contract`, `qa-p09a2-claims-sweep`, `qa-p09a2-contrast`, `design-system-typography`, `fullscreen-menu`, `detail-route-family`, `material-data-contract`, `copy-user-language`; desktop-1280 + tablet-768 + mobile-375) | 183 geçti, 0 hata, 174 atlandı (tek projeye bağlı testler) |
| Malzeme ve tablo seti (`malzemeler-static-plate`, `malzemeler-sticky`, `material-category-footer`, `qa-p08-scroll-region-reach`, `material-data-contract`; 3 görünüm) | 41 geçti, 0 hata |

Ara bulgu (düzeltildi): T02 tablo notundaki "taahhüt değildir" ifadesi `qa-p09a2-claims-sweep` garanti taramasına takıldı. Not, bu kelime olmadan yeniden yazıldı (karar C7).

## Sonraki iş

Paket 3: **L01 → SEO01**. Sözleşme gereği paket 2'nin diff/kanıt değerlendirmesi ve HEAD'in yeniden doğrulanmasından sonra başlar.
