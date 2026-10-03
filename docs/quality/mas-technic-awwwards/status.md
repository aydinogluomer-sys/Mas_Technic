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

## Paket 3 — L01 → SEO01

- HEAD doğrulaması: paket 3 başında dal `13e818e` (paket 2 sonu), `main` = `4618e71` (paket 1–2 merge edilmedi). Paket 3 commit'leri: `5866809`, `5c03c57`, `55324b4`, `bf1cb76` + kapanış commit'i.

| İş | Durum | Bağımlılık | Değişen dosyalar (özet) | Son kanıt |
|---|---|---|---|---|
| L01 | PASS_LOCAL · EN hukuki onay `BLOCKED_DATA` (O08) · canlıya açılış O10 | O08, O10 | `src/i18n/{locale,hooks,LocaleLink,content,data,localize,format}.ts(x)`, `src/i18n/index.ts`, `src/i18n/locales/en-pages.ts`, `src/content/en/**` (48 hizmet, 15 kategori, 11 aile, 87 malzeme, 6 yazı, 3 profil, 24 sohbet, 3 hukuki metin), `src/App.tsx`, sayfa ve shell bileşenleri, `scripts/quality/locale-check.ts`, `e2e/l01-locale.spec.ts` | `locale-check`: tüm kümeler tam, kayıt bazında TR/EN sayı kümesi birebir aynı. Tarayıcı taraması: **99 `/en` rotasında** (statik sayfalar, 48 detay, 15 kategori, 11 aile, 6 yazı, 3 profil, auth, RFQ adımları, menü, 404) Türkçe metin yok; kalan tek eşleşme tüzel kişi adı ve KVKK md. 5/2-ç atfı. `evidence/screens/l01/` (19 kare, 1440 + 375). |
| SEO01 | PASS_LOCAL · prerender `BLOCKED_DATA` (O01) · public build origin'i O10 | O01, O10 | `src/lib/{site-config,site-origin,route-links}.ts`, `src/hooks/use-page-meta.ts`, `vite.config.ts` (`mas-site-meta`), `index.html`, sayfa meta çağrıları | Varsayılan build: `noindex, nofollow`, canonical yok. `VITE_SITE_INDEXING=public` + origin'siz build kırılıyor. Origin'li public build (ölçüm için O10'daki beyan edilen domain ile): ana sayfa canonical/og:url/hreflang statik; route bazında SPA gezinmesi, geri tuşu, yanlış-aile yönlendirmesi ve query'li adreste canonical doğru; 404 ve auth `noindex` ve canonical'sız; panel `noindex`. Hero preload ve font preconnect korunuyor. |

### L01 davranışı

- Public dili **adres** belirler: TR `/…`, EN `/en/…` (aynı slug). Panel/admin rotaları değişmedi; panel dili `mas_lang` ile seçilir, eski DE/RU/ZH değeri TR'ye normalize olur. DE/RU/ZH sözlük dosyaları silinmedi, menüden kalktı.
- Dil düğmesi aynı kaydın diğer dildeki adresine gider (query ve hash korunur). İç bağlantılar `LocaleLink` ile aktif dilde kalır; sohbet yanıtlarındaki bağlantılar da.
- `/en` sayfası, EN sözlük ve içerik paketi gelmeden çizilmez (dil kapısı): EN adreste Türkçe kare yok. TR ilk açılışta kapıdan geçmez (senkron i18n init).
- EN içerik, TR kaydın üstüne yalnız okunacak metni bindiren overlay'lerdir (`mergeText`); id, slug, yol, görsel ve sayılar TR kaydın kendisidir. Sayılar ve birimler değişmedi.
- T01–T03'te kaldırılan iddialar çeviride geri gelmedi. Çeviri sırasında bulunan doğrulanmamış TR iddialar TR kaynakta düzeltildi (`claims-register.md` › L01, 27 satır).
- Hukuki metinler tam EN çeviri; EN sayfa "Türkçe metin bağlayıcıdır" diyor. Onay O08.
- Depolama engelliyken (L01 senaryosu) daha önce `/`, `/sss`, `/teklif-al`, `/giris` dahil sayfalar `ErrorBoundary`'ye düşüyordu (taban build'de de aynı). Tema, Supabase istemci deposu, CAD aktarımı ve sohbet sayacı korumalı erişime alındı; tüm public rotalar açılıyor.
- Bilinen sınır: EN parola sıfırlama e-postası TR `/reset-password`'a döner (D3).

### SEO01 davranışı

- Tek kaynak: `VITE_SITE_ORIGIN` + `VITE_SITE_INDEXING` (`src/lib/site-config.ts`). Gizli değer yok; origin kodda yazılı değil.
- Canonical = origin + yerelleştirilmiş rota; og:url aynı; hreflang `tr` / `en` / `x-default`=tr. Title ve description rotanın kendi içeriğinden, rotanın dilinde.
- `noindex`: 404 ve aile içi bulunamadı görünümleri, giriş/şifre sayfaları, panel ve admin. `preview` build her yerde `noindex`.
- `index.html` içindeki sabit `lovable.app` canonical/og:url kaldırıldı (C10).

### Paket 3 test sonuçları

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` / `tsconfig.e2e.json` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabandaki `BlurImage.tsx` uyarıları) |
| `npm run build` (placeholder env, varsayılan `preview`) | geçti; çıktı `noindex, nofollow`, canonical yok |
| `VITE_SITE_INDEXING=public` origin'siz build | **kırılıyor** (beklenen): `[mas-site-meta] VITE_SITE_INDEXING=public requires VITE_SITE_ORIGIN` |
| `VITE_SITE_INDEXING=public VITE_SITE_ORIGIN=https://…` build | geçti; canonical, og:url, hreflang tr/en/x-default statik ana sayfada; hero preload ve preconnect korunuyor |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal, 306 kontrol |
| `scripts/quality/locale-check.ts` | OK: hizmet 48/48, kategori 15/15, aile 11/11, malzeme 87/87, yazı 6/6, profil 3/3, sohbet 24/24; sayı kümeleri birebir |
| `scripts/quality/claims-scan.ts` (genişletilmiş) | 270 satır, `REVIEW` 0 |
| EN tarayıcı taraması (99 `/en` rotası, Türkçe harf + Türkçe kelime + eksik i18n anahtarı) | 0 Türkçe metin; tek istisnalar tüzel kişi adı ve KVKK md. 5/2-ç atfı |
| `e2e/l01-locale.spec.ts` (desktop-1280, mobile-375) | tümü geçti: overlay tamlığı, locale/SEO yardımcıları, origin'siz public build, 24 rotalık EN turu, aynı kayda geçiş, hard refresh, geri/ileri, eski DE tercihi, yeni sekme, depolama engelli, SPA ve yönlendirme sonrası meta |
| Tam koşu `desktop-1280` + `critical-1280` + `critical-375` (461 test) | 414 geçti, 9 hata, 29 atlandı, 9 koşmadı. 9 hatanın hiçbiri paket 3 kaynaklı değil: 5 `FAIL_INFRA` (Google Fonts sertifika hatası: `landing-structure:95` ×3, `technical-landing:180` ×2), 3'ü taban build'de (`13e818e`) aynı biçimde düşüyor (`qa-09b1-golden-drift` footer — spec'in kendi `hideForeignOverlays` kuralı; `qa-p08-storage-disclosure` — ağda üçüncü taraf host yok; `09b2-fragment-navigation` — 3 tekrarda tabanda da 6/9 hata). 1 hata (L01 EN turu yük altında yükleyici karesini yakaladı) düzeltildi: yükleyici ve ilk kare artık adresin dilinde, yeniden koşuda geçti. |
| Etkilenen setin yeniden koşusu (`l01-locale`, `i18n-switch`, `landing-structure`, `navigation-reachability`, `shared-shell-accessibility`, `detail-route-family`, `copy-user-language`; desktop-1280 + mobile-375 + critical-1280) | 85 geçti, 3 hata (yalnız `landing-structure:95` `FAIL_INFRA`), 47 atlandı |

Güncellenen mevcut spec'ler (davranış değişikliği nedeniyle, gerekçesi yanında): `navigation-reachability` ve `shared-shell-accessibility` rota tablosunu `PUBLIC_PAGES`'ten okuyor; `i18n-switch` TR/EN ve adres tabanlı geçişe göre yeniden yazıldı (C9); `qa-p09a4-evidence-write-guard` yeni tmpdir yazarını kayda aldı; `qa-p09a3-cad-dom` T02'nin (paket 2) kaldırdığı kapasite sütunlarına uyarlandı — bu spec paket 2 regresyon setinde yoktu.

Tarayıcı sonuçları `LOCAL_FIXTURE` (yerel `vite preview`, placeholder Supabase env, Google Fonts erişilemez). Canlı host, gerçek cihaz ve gerçek arama motoru davranışı ölçülmedi.

## Paket 4 — IMG01 → PAGE01 → UX05

- HEAD doğrulaması: paket 4 başında dal `58a5873` (paket 3 sonu), `main` = `4618e71` (paket 1–3 merge edilmedi). Paket 4 tek commit.

| İş | Durum | Bağımlılık | Değişen dosyalar (özet) | Son kanıt |
|---|---|---|---|---|
| IMG01 | PASS_LOCAL | — (gerçek MAS fotoğrafı yok; O04 gelirse yeniden değerlendirilir) | `src/content/detail-visuals.ts` (48 kayıt), `src/components/schemas/{kit,sector,registry,SchemaFigure}.tsx`, `src/pages/ServiceDetail.tsx`, `src/data/servicePages.ts` (`heroImage` kaldırıldı), `src/styles/shell.css` (`.sch*`, `.shell-schema-*`), `scripts/claims-gate.mjs` (C11) | 48/48 açık kayıt; 17 sektörün 15'i ayrı kod şeması, 2'si repo görseli; görsel tekrarı yalnız iki çiftte ve gerekçeli (anodizasyon/kimyasal işlemler, seri imalat/seri üretim). `evidence/screens/p4/img01-sector-plates-{1440,375}.png` |
| PAGE01 | PASS_LOCAL · matris eşikleri O02 | O02 | `src/content/{pilot-modules,related,category-matrix}.ts`, `src/components/schemas/pilot.tsx`, `src/pages/{ServiceDetail,CategoryPage}.tsx`, `src/components/shell/rail-labels.ts` | 7 pilot modül hero'dan hemen sonra (MODÜL bandı: şema + Problem/Proses/Kontrol); 48 sayfada en çok 4 elle seçilmiş ilgili kayıt; 15 kategori sayfasında `İhtiyaç / İlgili proses veya kapsam / Sonraki kayıt` matrisi, sayısal eşik yok. `evidence/screens/p4/page01-ux05-bands-1440.png` |
| UX05 | PASS_LOCAL · gerçek ölçüm raporu O04 | O04 | `src/content/journal-modules.ts`, `src/components/schemas/journal.tsx`, `src/pages/{BlogDetail,KabiliyetProfilDetay}.tsx` | 6 yazıda konuya özel şema, karar tablosu, kaynak listesi (standart adı + neye başvurulduğu), elle seçilmiş ilgili yazı ve hizmetler; tarih değişmedi, yazar adı yok. CMM tablosu ve çizimi "örnek, gerçek rapor değil". 3 profilde 3 ayrı çizim. `evidence/screens/p4/page01-ux05-schemas-375-tr-en.png` |

### IMG01 davranışı

- Detay sayfası plakası tek kaynaktan gelir: `DETAIL_VISUALS[slug]` → `{kind, asset | schema, subject, sourceKind, permissionRef, crop?, shared?}`. Generic fallback yok; kayıtsız slug testte kırılır.
- Repo görselleri MAS fotoğrafı değil (`reports/10/asset-inventory.md` §4); caption konuyu anlatır, tesisi, makineyi ya da kişiyi MAS'ınki gibi sunmaz. İzin kaydı `USER_INPUTS.md §I PROJECT_PHOTOS: USE_REPO`.
- Kod şemaları 640×320 viewBox, yalnız yüzey token'ları (hex yok), etiketler `t()` ile TR/EN. Caption: `Temsili mühendislik şeması · <konu>`. Şemalarda ölçü değeri, tolerans sayısı ya da test sonucu yok; yalnız ilişki (datum, akış, kesit, sıra).
- Konuyla çelişen ya da §I'e takılan görseller değiştirildi: tavlama (D5), montaj ve operasyonel verimlilik (D6).
- 375'te şema etiketleri 19 px'e (küçük etiket 16 px) büyür; tüm şemalar 375'te TR ve EN olarak kare kare gözden geçirildi, taşan ve çakışan etiketler düzeltildi.

### PAGE01 davranışı

- Pilot sayfalar: CNC frezeleme, CNC torna, derin delik, fikstür, anodizasyon, kalite kontrol, DFM. Hero'dan hemen sonra MODÜL bandı: bir teknik problemi gösteren şema + Problem → Proses → Kontrol. Diğer sayfalar değişmedi.
- "Aynı ailenin ilk 8 sayfası" listesi kalktı. Her detayda en çok 4 ilgili kayıt, gerekirse aile dışından (sektör sayfası → parçanın üretildiği hizmet).
- Kategori sayfalarına 03 KARAR bandı eklendi; kardeş sayfalar 04, sonraki adım 05 oldu.

### UX05 davranışı

- Yazılara 03 ŞEMA bandı: şema + KAYNAKLAR + karar tablosu. Not: "Standartlar teknik başvuru olarak anılır; bir uygunluk beyanı değildir." İlgili band (04) ilgili yazılara ek olarak ilgili hizmetleri listeler.
- Torna-freze yazısı iki operasyonu aynı geometri üzerinde karşılaştırır. CMM yazısındaki kontrol planı örnektir, gerçek rapor değil; T03 malzeme koşulları korunur.
- Profil detayında fotoğraf plakası yerine profile özel şema (D7).

### Paket 4 test sonuçları

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` / `tsconfig.e2e.json` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabandaki `BlurImage.tsx` uyarıları) |
| `npm run build` (placeholder env) | geçti |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal, 306 kontrol ("Temsili mühendislik şeması" sabitlendi, C11) |
| `e2e/p4-visuals-modules.spec.ts` (yeni, desktop-1280) | 11/11 geçti: manifest 48/48 ve 17/17 sektör, şema anahtarları ve görsel eşlemesi, gerekçesiz tekrar yok ve sektörde en çok 2 kullanım, sektör şemaları birbirinden farklı; ilgili kayıtlar 48 sayfada ≤4, gerçek ve kendine bağlantısız; 7 pilot modül ayrı çizimle; 15 kategori matrisi gerçek slug'lar ve sayısal eşiksiz; 6 yazı modülü kaynaklı, CMM tablosu örnek etiketli; 3 profil 3 ayrı çizim; tarayıcıda şema plakası + etiket, pilot modül + 4 ilgili bağlantı, kategori matrisi, EN yazı şeması İngilizce |
| EN tarayıcı taraması (72 `/en` detay, kategori, yazı ve profil rotası) | 0 Türkçe metin, eksik anahtar yok |
| Tam koşu `desktop-1280` (306 test) | 265 geçti, 6 hata, 26 atlandı, 9 koşmadı. 6 hatanın hiçbiri paket 4 kaynaklı değil, hepsi paket 3 raporundaki listeyle aynı: `FAIL_INFRA` `landing-structure:95` (`ERR_CERT_AUTHORITY_INVALID`, Google Fonts) ve `technical-landing:180` (yedek fontla footer oranı); tabanda da düşen `qa-09b1-golden-drift` footer, `qa-p08-storage-disclosure:310`, `09b2-fragment-navigation` ×2 |
| `critical-1280` + `critical-375` (163 test) | 160 geçti, 3 hata: yalnız `landing-structure:95` ×2 ve `technical-landing:180` (`FAIL_INFRA`) |
| Etkilenen set `mobile-375` (`l01-locale`, `i18n-switch`, `navigation-reachability`, `p4-visuals-modules`) | koşan 5 test geçti, geri kalanı proje filtresiyle atlandı |
| Görsel inceleme | 19 şema plakası 1440 + 375; 16 modül/yazı/profil şeması 375'te TR ve EN (32 kare); 1440 band kareleri. Çakışan/taşan etiketler iki turda düzeltildi; son kareler `evidence/screens/p4/` |

Tarayıcı sonuçları `LOCAL_FIXTURE` (yerel `vite preview`, placeholder Supabase env, Google Fonts erişilemez).

## Paket 5 — PROOF01 → NEXUS01 → UX03

- HEAD doğrulaması: paket 5 başında dal `f37c0a0` (paket 4 sonu), `main` = `4618e71` (paket 1–4 merge edilmedi). Paket 5 tek commit.

| İş | Durum | Bağımlılık | Değişen dosyalar (özet) | Son kanıt |
|---|---|---|---|---|
| PROOF01 | PASS_LOCAL · gerçek kanıt (PROOF02) `BLOCKED_DATA` | O04 | `src/components/technical-landing/{TechnicalHero,SignatureControl,ProcessNexusProjects}.tsx`, `src/content/measured-evidence.ts`, `src/content/caseStudies.ts`, `src/pages/KabiliyetProfilDetay.tsx`, `src/styles/technical-landing.css`, `scripts/claims-gate.mjs` (C12) | Hero'da Ø 0.010 çerçevesi ve kılavuzu yok; pasaport çizimi "ŞEMATİK ÖN / YAN GÖRÜNÜŞ". Bant 05'te imza modülü: 3 native düğme (`aria-pressed`), çizim vurgusu + bağlama/proses + kontrol yöntemi + kayıt birlikte değişir, üç panel de DOM'da. Ölçüm sözleşmesi ve yayın kapısı: bayrak kapalı, üretim kaynağında kayıt yok, fixture yalnız testte. `evidence/screens/p5/{hero,process}-*` |
| NEXUS01 | PASS_LOCAL · portalın canlı doğrulaması QA02 | O07 | `src/data/technicalLandingData.ts`, `ProcessNexusProjects.tsx`, `technical-landing.css`, `polish.css` | 5 native adım (Teklif, Onay, Üretim, Ölçüm, Sevkiyat); her görünümde `DEMO` ve `GERÇEK SİPARİŞ DEĞİLDİR`; her adımda oluşan belge ve karar. Maskeli sipariş tablosu, portal kutuları ve indirilebilir öğe yok. Yeni müşteri → `/teklif-al`, mevcut müşteri → `/giris`. `evidence/screens/p5/nexus-*` |
| UX03 | PASS_LOCAL · sertifika geçerliliği O03 | O03 | `src/content/quality-documents.ts`, `src/assets/belgeler/*.webp`, `src/pages/KaliteDosyasi.tsx`, `FinalSections.tsx`, `src/styles/{shell,polish-round2-landing}.css` | Dört izinli PDF'in gerçek ilk sayfası; belgenin kendi yazdığı doküman no, tarih ve sürüm (yoksa "Belirtilmemiş"), dil (Türkçe; EN sayfada "Turkish"), ölçülmüş boyut, aç/indir. Ana sayfa şeridindeki sahte belge çizimleri kalktı; sertifikalar yalnız metin (tarama gibi görünmez). Referanslar yalnız isim, logo yok. `evidence/screens/p5/{quality-band,kalite-docs-en}-*` |

### Paket 5 test sonuçları

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` / `tsconfig.e2e.json` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabandaki `BlurImage.tsx`) |
| `npm run build` (placeholder env) | geçti |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal, 306 kontrol |
| `e2e/p5-proof-nexus-quality.spec.ts` (yeni; desktop-1280 + mobile-375) | 15/15 geçti: bayrak kapalı ve kayıt yok; yayın kapısı eksik/doğrulanmamış/izinsiz/limitleri ters kaydı reddeder, boşluk doldurmaz; profil tipi ölçüm taşıyamaz, saklı "UYGUN" yok; hero'da FCF ve 1:2 yok; NEXUS verisinde maske/KPI yok; 4 PDF `%PDF-` ile başlar, ölçülen boyut ledger ile aynı, her birinin küçük resmi var; referanslar yalnız isim. Tarayıcıda: klavye ile düğme seçimi çizim ve paneli birlikte değiştirir, modülde sayısal değer yok; 5 adımın her birinde iki etiket; RFQ/giriş linkleri; PDF'ler HTTP 200 + PDF magic; EN sayfa "Turkish" |
| EN tarayıcı taraması (`/en`, `/en/kalite-dosyasi`, `/en/kabiliyet-profilleri/hassas-mil`) | 0 Türkçe metin |
| Tam koşu `desktop-1280` + `critical-1280` + `critical-375` (483 test) | İlk koşuda önizleme sunucusu 2 saatlik arka plan sınırında durdu; sonraki testler bağlantı hatasıyla düştü. Sunucu yeniden başlatılıp etkilenen 15 spec dosyası tekrar koşuldu: 147 geçti, 4 hata. 2'si `technical-landing:184` footer oranı (`FAIL_INFRA`, yedek font; paket 3–4'te de aynı). 2'si paket 5 kaynaklıydı ve düzeltildi: `i18n-switch` EN eksik anahtar ("Delik" ve sayısal tarih `t()`'den geçiyordu), `qa-p08-scroll-region-reach` ana sayfa tablo tabanı 4 → 3 (NEXUS tablosu kalktı). Düzeltme sonrası `i18n-switch`, `scroll-region-reach`, `p5`, `l01-locale` (desktop-1280 + mobile-375): 46/46 geçti. Sunucu durmadan önce düşen ve paket 5'e ait olmayanlar: `landing-structure:95` (`FAIL_INFRA`), `qa-09b1-golden-drift` footer, `qa-p08-storage-disclosure:310`, `09b2-fragment-navigation` ×2 (tabanda da düşüyor) |

Güncellenen mevcut spec'ler (gerekçesi yanında): `technical-landing` (ters kaydırma bandı 2 → 1, NEXUS başlığı/grubu, adım düğmesi yüksekliği), `landing/motion-grammar` (Ø 0.010 hover satırı ve durum hücresi grameri kalktı), `landing/landing-grid-axes` (`.tl-nexus-kpis` yerine CTA satırı), `qa-p08-scroll-region-reach` (ana sayfa tablo tabanı).

Tarayıcı sonuçları `LOCAL_FIXTURE` (yerel `vite preview`, placeholder Supabase env, Google Fonts erişilemez).

## Paket 6 — RFQ01 → RFQ02 → RFQ03

- HEAD doğrulaması: paket 6 başında dal `985e334` (paket 5 sonu), `main` = `4618e71`. Paket 6 tek commit.
- Kapsam sınırı: `supabase/` salt okunur (CLAUDE.md), deploy yok. Sunucu tarafı **uygulanmadı**; sözleşmesi `rfq-backend-contract.md`.

| İş | Durum | Bağımlılık | Değişen dosyalar (özet) | Son kanıt |
|---|---|---|---|---|
| RFQ01 | İstemci PASS_LOCAL (bayrak açık build, ağ taklitli) · üretimde kapalı · sunucu `BLOCKED_DATA: backend-contract` | O06 | `src/components/rfq/{rfq-attachments,useAttachmentSelection}.ts`, `RfqAttachmentsStep.tsx`, `src/utils/cadUpload.ts` (`uploadStorageObject`), `src/vite-env.d.ts` | Sözleşme: 1 model + 3 PDF, 50/100 MB, en az 1 dosya, PDF imza (`%PDF-`) kontrolü, SHA-256, Unicode ad → güvenli nesne adı, revizyon farkı onayı. Metadata: `kind, originalName, storagePath, sizeBytes, mediaType, sha256, revisionLabel`. `VITE_RFQ_ATTACHMENTS=on` olmadan render edilmez. `evidence/screens/p6/flag-on-step1-*` |
| RFQ02 | İstemci PASS_LOCAL · sunucu `BLOCKED_DATA: backend-contract` | O06 | `src/components/rfq/useRfqSubmission.ts`, `docs/…/rfq-backend-contract.md` | Talep numarası yeniden denemelerde sabit (D13); yanıtsız denemeden sonraki 5xx "alınmış olabilir"; 413 ve 429 kendi cümleleri; çoklu yüklemede ikinci dosya hatasında ilk dosya korunur, yeniden deneme yalnız eksiği yükler. Sunucu tarafı (yol sahipliği, idempotent insert, imzalı URL, kalıcı hız sınırı, yetim temizliği, e-posta) tanımlı, uygulanmadı |
| RFQ03 | PASS_LOCAL | — | `src/pages/TeklifAl.tsx`, `src/components/rfq/{rfq-model,rfq-schema,RfqSpecStep,RfqSubmitStep,RfqAside,RfqUploadStep}.ts(x)`, `src/styles/polish.css` | Başlık "Üretim Teklifi İsteyin"; açıklama ve SLA ledger'dan (C14); adımlar Dosyalar / Bilgiler / İncele-Gönder; hiçbir seçim önceden yapılmıyor, özet "Belirtilmedi"; boş adım hatası; geri/ileri seçimleri koruyor; yenileme uyarısı; önizleme gönderim şartı değil. `evidence/screens/p6/step*` |

### Paket 6 test sonuçları

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` / `tsconfig.e2e.json` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabandaki `BlurImage.tsx`) |
| `npm run build` (varsayılan) | geçti; çoklu ek arayüzü render edilmez (bileşen kodu küçük bir parça olarak pakette kalıyor, Rollup sabit katlamadan önce budama yaptığı için) |
| `VITE_RFQ_ATTACHMENTS=on npx vite build --outDir <scratchpad>` | geçti; ikinci önizleme sunucusu (`127.0.0.1:4182`) |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal (bayrak kapalıyken PDF'i sunan ilk metin kural tarafından yakalandı ve düzeltildi, C14) |
| `e2e/p6-rfq-attachments.spec.ts` (`P6_ATTACHMENTS_URL=http://127.0.0.1:4182`) | desktop-1280 14/14, mobile-375 8/8 (veri testleri yalnız desktop'ta). Saf: model-only/PDF-only/combined, sayı/dosya/toplam sınırları, boş dosya, yanlış uzantı, sahte PDF, DWG/DXF dışarıda, revizyon farkı, Unicode ad, SHA-256. Varsayılan build: başlık/adımlar, önceden seçim yok, boş adım hatası, geri/ileri, kayıp yanıttan sonra aynı numarayla tek yükleme, belirsiz durum, 413/429. Bayrak açık build: PDF-only gövdesi (`attachments`, `application/pdf`, sha256, yol öneki), 4. PDF / sahte PDF / revizyon onayı adım 1'de durdurur, ikinci dosya hatasında yalnız eksik dosya yeniden yüklenir |
| Mevcut RFQ spec'leri (`qa-p09a-rfq-form`, `polish/rfq-cad-preview`; desktop-1280) | güncelleme sonrası 20/20 (C15) |
| Etkilenen set (`i18n-switch`, `l01-locale`, `scroll-region-reach`, `storage-disclosure`, `sla-wobble`, `stabilised-sweep`, `s01-webgl-failure`, `claims-sweep`, `shared-shell-accessibility`; desktop-1280 + critical-375) | 45 geçti, 1 hata: `qa-p08-storage-disclosure:310` (tabanda da düşüyor) |
| EN taraması (`/en/teklif-al`, varsayılan ve bayrak açık build) | 0 Türkçe metin |

Tüm sonuçlar `LOCAL_FIXTURE`: ağ yanıtları tarayıcı içinde taklit edildi, hiçbir istek sunucuya ulaşmadı. Bu, sunucu davranışının kanıtı değildir.

## Paket 7 — UX01 → UX02 → UX04 → PERF01

- HEAD doğrulaması: paket 7 başında dal `225b9db` (paket 6 sonu), `main` = `4618e71`. Paket 7 tek commit. Karşılaştırma tabanı: `225b9db` build'i (ayrı worktree, aynı placeholder env).

| İş | Durum | Bağımlılık | Değişen dosyalar (özet) | Son kanıt |
|---|---|---|---|---|
| UX01 | PASS_LOCAL · kontrast raporu axe ile (aşağıda) | — | `index.html`, `src/lib/hero-shell.ts`, `src/components/PageTransition.tsx`, `src/components/technical-landing/*`, `src/components/shell/{PageShell,SiteFooter}.tsx`, `src/components/navigation/ia.ts`, `src/components/Header.tsx`, `src/styles/{shell,technical-landing,polish,polish-round2-landing,navigation,menu-round2,contact-studio,i18n}.css`, `src/components/ChatBot.tsx`, çerez politikası (C16) | Intro, sayaç, `data-intro-active`, `mas_intro_seen` yok; ilk açılışta perde yok; hero vurgusu 250 ms, etiketler ilk kareden. Ana sayfa sırası sözleşmedeki gibi (12 bant), kayan şerit ve manifesto bandı yok. Tipografi tabanı: görev metni ≥12 px, tablo hücresi/düğme/form ≥14 px, dekoratif ray 10 px (143 bildirim + elle düzeltmeler). 375'te sayfa 9828 → 7792 px (−%20,7, D15). Mobil profil kartı taşma hatası düzeltildi. 320/375/390/640 (200% yakınlaştırma)/768/844 yatay/1440'ta yatay taşma 0. `evidence/screens/p7/landing-*` |
| UX02 | PASS_LOCAL | — | `src/pages/SSS.tsx`, `src/pages/Malzemeler.tsx`, `src/components/pages/MaterialRegister.tsx`, `shell.css` | SSS ilk açılış: 10 genel soru, diğer başlıklar `aria-expanded` düğmeli kapalı gruplar (sorular DOM'da). Arama tüm sorularda çalışır ve eşleşen grupları açar; boş sonuç + temizle; `#sss-N` grubu, `#soru-N` soruyu açar. Karşılaştırma: 1 seçimde ve 4 seçimde açıklayıcı durum satırı, devre dışı kutular bu satıra bağlı. `evidence/screens/p7/{sss,malzemeler}-*` |
| UX04 | PASS_LOCAL · gerçek rezervasyon başarısı kanıtlanmadı (dış takvim) | — | `src/pages/Iletisim.tsx`, `src/components/contact/BookingDialog.tsx`, `src/components/shell/CompactFooter.tsx`, `LegalDocument.tsx`, `AuthLayout.tsx`, `TeklifAl.tsx` | 7 günlük şerit kalktı; tek "Uygun saatleri takvimde görüntüle" + yeni sekme. Diyalog: odak kilidi, Escape, odak iadesi, 8 sn yedek görünüm; `onLoad` sonrası da kalıcı "yeni sekmede aç" satırı. Kompakt footer: hukuk, giriş/şifre, teklif; diğer sayfalar tam footer. `evidence/screens/p7/{iletisim,footer}-*` |
| PERF01 | JS bütçesi PASS_LOCAL · CLS PASS_LOCAL · **LCP lab FAIL** · INP ve saha `NOT_MEASURED` · fontlar `FAIL_INFRA` | O01 (ön render) | `src/App.tsx`, `src/components/ChatLauncher.tsx`, `src/i18n/{index,content}.ts`, `vite.config.ts`, `src/index.css`, `scripts/quality/{perf-lab,serve-gzip}.mjs` | Aşağıdaki tablolar. `evidence/p7-requests.json`, `evidence/p7-perf-lab.json`, `evidence/p7-perf-lab-baseline-pkg6.json`, `evidence/har-p7/*.har` |

### PERF01 — JS bütçesi (S01 yöntemi, `capture-requests.mjs`, soğuk bağlam, 10 sn, gzip)

| Rota | Genişlik | S01 tabanı (4618e71) | Paket 7 başı (225b9db) | Paket 7 sonu | Bütçe ≤320 KiB |
|---|---|---|---|---|---|
| `/` | 375 | 283,6 KiB | 306,7 KiB | **186,9 KiB** | PASS |
| `/` | 1440 | 334,6 KiB | 357,8 KiB | **236,2 KiB** | PASS |
| `/en` | 375 | — | 417,1 KiB | **224,7 KiB** | PASS |
| `/en` | 1440 | — | 468,1 KiB | **274,0 KiB** | PASS |

Ne değişti: sohbet bileşeni (39 KiB) ve onun çektiği veri modülleri (~79 KiB) ilk açılışa kadar yüklenmiyor; yalnız hafif başlatıcı var. İngilizce içerik paketi (72,5 KiB) yalnız kayıt okuyan sayfada, Suspense ile yükleniyor (Türkçe kare yok; 99 `/en` rotası taramasında Türkçe metin yok). Özel imleç ilk fare hareketinde, hareket azaltmada hiç. Ana sayfa parçaları ve `/en` sözlüğü yalnız `/` ve `/en`'de HTML'den önden yükleniyor. 1440'taki fark `vendor-gsap` (44 KiB, ana sayfa hareket katmanı; hareket azaltmada yüklenmiyor).

### PERF01 — Laboratuvar (`perf-lab.mjs`: yavaş 4G 150 ms / 1,6 Mbps, 4× CPU, 5 soğuk koşu, gzip'li statik sunucu)

| Rota | Genişlik | LCP p75 taban (225b9db) | LCP p75 şimdi | CLS p75 taban | CLS p75 şimdi |
|---|---|---|---|---|---|
| `/` | 375 | 2964 ms | **2640 ms** | 0 | 0 |
| `/` | 1440 | 3088 ms | **2760 ms** | 0 | 0 |
| `/en` | 375 | 3684 ms | **3256 ms** | 0,139 | **0** |
| `/en` | 1440 | 3872 ms | **3336 ms** | 0,071 | **0** |

- LCP hedefi (≤2,5 s) **karşılanmadı**. LCP öğesi hero görseli; görsel önceden yükleniyor ama ancak istemci tarafı render zinciri (giriş betiği → dil/rota → ana sayfa parçası) bitince çiziliyor. Çözüm önerisi ön render (SEO01'in prerender adaptörü, host bilgisi O01 beklediği için `BLOCKED_DATA`). PERF01 bu nedenle PASS değil (D17).
- CLS: intro kalkınca açığa çıkan iki kayma (ana sayfadaki yükleme göstergesi ve header yer tutucusunun sonradan eklenmesi) düzeltildi; tabandaki `/en` kayması da gitti.
- `vite preview` sıkıştırmasız sunduğu için ölçüm, `scripts/quality/serve-gzip.mjs` (gzip + SPA fallback) ile yapıldı; aynı koşul taban için de kullanıldı.
- INP: gerçek kullanıcı ölçümü yok → `NOT_MEASURED`. TBT INP diye raporlanmadı. "Core Web Vitals geçti" denmez.
- Fontlar: Google Fonts bu ağdan erişilemiyor (`ERR_CERT_AUTHORITY_INVALID`) → `FAIL_INFRA`; istek `display=swap` taşıyor, aileler değişmedi. Hero önyüklemesi: tek, hash'li, `image/webp`, 200.
- Ekran dışı sürekli animasyon: ana sayfa ve dört iç sayfada çalışan sonsuz animasyon yok (kayan şerit kalktı).

### Paket 7 test sonuçları

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` / `tsconfig.e2e.json` | geçti |
| `npm run lint` | 0 hata, 2 uyarı (tabandaki `BlurImage.tsx`) |
| `npm run build` | geçti |
| `node scripts/claims-gate.mjs` | PASS: 0 ihlal |
| `e2e/p7-ux-perf.spec.ts` (yeni; desktop-1280 + mobile-375) | 26/26: intro yok, hero etiketleri animasyonsuz, bant sırası, 375 yüksekliği ≤ 7862 px, yedi genişlikte taşma 0 ve 375/1440'ta tipografi tabanı (5 rota), SSS ilk görünüm/arama/temizle/derin bağlantı, karşılaştırma sınırı, randevu odak kilidi/Escape/odak iadesi/engellenen takvim, kompakt/tam footer, sohbet ilk açılışta, İngilizce içerik yalnız kayıt sayfasında, önyüklemeler yalnız ana sayfada |
| Tam koşu `desktop-1280` + `critical-1280` + `critical-375` (511 test) | 427 geçti, 50 hata, 32 atlandı. Hatalar triyaj edildi: paket 7'nin bilinçli değiştirdiği yapıya bağlı spec'ler güncellendi (C16–C18) ve iki gerçek bulgu düzeltildi (ilk açılışta oynayan perde; 320'de footer alt satırı ve e-posta düğmesi taşması). Düzeltme sonrası etkilenen 13 spec dosyası (3 proje): 212 geçti + kalan 3 güncelleme sonrası 41 geçti + son oran testi geçti. Kalan bilinen hatalar paket 7 kaynaklı değil: `landing-structure:95` (`FAIL_INFRA`, Google Fonts), `qa-09b1-golden-drift` footer, `qa-p08-storage-disclosure:310`, `09b2-fragment-navigation` ×2 (tabanda da düşüyor). `technical-landing:180/165` footer oranı artık geçiyor (ana sayfa footer'ında ikinci teklif satırı yok) |
| Paket spec'leri (`p4`–`p7`, `l01-locale`; desktop-1280 + mobile-375) | 77/77 |
| EN taraması (99 `/en` rotası) | Türkçe metin yok (istisna: tüzel kişi adı) |

Güncellenen mevcut spec'ler: `technical-landing`, `landing/{landing-structure,landing-reduced-motion,landing-grid-axes,landing-process-flow,motion-grammar,shell-and-transition}`, `helpers.ts` (çapa sırası), `footer-reveal`, `shared-shell-accessibility`, `qa-p08-storage-disclosure`, `polish/{contact-booking,cursor-over-menu}`.

Tarayıcı sonuçları `LOCAL_FIXTURE`. Not: önizleme sunucusu oturum içinde iki kez 2 saatlik arka plan sınırında durdu; etkilenen koşular yeniden yapıldı.

## Sonraki iş

Sözleşme sırasına göre son paket: QA01 → QA02 → RELEASE01. RFQ sunucu tarafı O06, LCP için ön render O01, canlı döngü O07. PROOF02 gerçek veri gelince ayrı içerik teslimidir. Açık girdiler: O01 (host, prerender), O02 (kapasite eşikleri), O04 (gerçek demo kuponu), O05 (malzeme kaynakları), O08 (EN hukuki onay), O10 (origin ve EN'in yayına açılması).
