# Kararlar — MAS TECHNIC uygulama sözleşmesi

Yürütme kaynağı: kullanıcının verdiği `MAS TECHNIC — Claude Code uygulama sözleşmesi` (sürüm 1.0, 2 Ekim 2026), §3. Bu dosya o kararların repodaki uygulanma durumunu tutar. Yeni karar gerekirse bağlamı ve tek bir öneriyi buraya yazarım.

Durum değerleri: `TODO`, `IN_PROGRESS`, `PASS_LOCAL`, `PASS_LIVE`, `ALREADY_SATISFIED`, `BLOCKED_DATA`, `FAIL`.

## §3 sabit kararlar

| Konu | Karar (özet) | İş | Durum | Not |
|---|---|---|---|---|
| Dil | Public TR + tam EN; DE/RU/ZH menüden gizlenir, dosyalar silinmez | L01 | TODO | 3. paket |
| Dil URL'si | TR yolları aynı; EN `/en` öneki; panel rotaları değişmez | L01, R01 | TODO | R01 yardımcısı `/en` önekini şimdiden koruyor (`src/lib/detail-route.ts`) |
| Malzeme sekansı | `/malzemeler`'den 80 karelik 300vh sekans kaldırılır; kayıt önce, statik pafta sonra | M01 | PASS_LOCAL | Component ve `public/sequence-material/` diskte duruyor; başka rota kullanmıyor ama silme ayrı karar |
| Intro | Tam ekran, bekleten intro kaldırılır | UX01 | TODO | 7. paket |
| Hero ölçüleri | Eksik Ø/0.010 FCF kutusu kalkar; responsive'te `ŞEMATİK ÖN / YAN GÖRÜNÜŞ` | PROOF01 | TODO | |
| Tavlama | `/hizmetler/tavlama` kalır, içerik `Lazer Tavlama ile Markalama` | T01 | PASS_LOCAL | Fırın/sertleştirme/normalizasyon/sementasyon/indüksiyon içeriği ve karışık tablo kaldırıldı; menü, kategori ve sözlükler güncellendi |
| Çelişkili kapasite | Sayı seçilmez; satır çıkar, standart kapsam metni girer | T01, T02 | PASS_LOCAL | Kapsam metni: "Çalışma aralığı, parçanın geometrisi ve proses planı incelendikten sonra teklifte belirtilir." Onay O02 bekliyor. |
| Sertifikalar | OHSAS aktif rozet olarak kullanılmaz; ISO 45001 eklenmez; ISO 9001/14001 izin kapsamında, geçerlilik kontrolü açık | T02, UX03 | PASS_LOCAL (yayın kabulü `BLOCKED_DATA`, O03) | OHSAS `claims.ts` içinde `withhold` kaydı; vitrin, SSS ve chatbot'tan çıkarıldı | `USER_INPUTS.md` §C OHSAS'ı `PUBLIC_OK` diyor; sözleşme izni değiştirmeden vitrinden çıkarmayı söylüyor — izin kaydı aynen korunacak |
| Görsel seçimi | 17 sektör için açık manifest; generic fallback yok | IMG01 | TODO | |
| Gerçek kanıt | Bir gerçek demo kuponu; yoksa measured panel kapalı | PROOF01, PROOF02 | TODO | PROOF02 = `BLOCKED_DATA` adayı (O04) |
| İmza deneyim | 3 özellik → bağlama/proses → kontrol → kayıt; 2D, WebGL yok | PROOF01 | TODO | |
| NEXUS | `DEMO — GERÇEK SİPARİŞ DEĞİLDİR` etiketli 5 adım | NEXUS01 | TODO | |
| RFQ | Model veya PDF (en az biri); 1 model + 3 PDF; 50/100 MB | RFQ01–03 | TODO | Backend kontratı O06 |
| Detay sayfaları | Tek shell; 7 pilot modül | PAGE01 | TODO | |
| Hukuki footer | Hukuk/auth/RFQ'da kompakt footer | UX04 | TODO | |
| Performans | 493 KB baseline değil; gerçek ölçüm; iç hedef ≤320 KiB gzip | S01, PERF01 | IN_PROGRESS | S01 tabanı alındı (bkz. `status.md`) |

## Repodaki eski sözleşmelerle çatışmalar

| # | İş | Çatışma | Uygulanan çözüm |
|---|---|---|---|
| C1 | Tümü | Repoda `IMPLEMENTATION.md` + `PROGRESS.md` ile süren bir `AUTONOMOUS_AWWWARDS_RUN` var (Faz 09a `IN_PROGRESS`, entegrasyon dalı `claude/awwwards-90-overhaul`). `main` HEAD `4618e71` bu sözleşmenin denetim tabanıyla aynı. | Kullanıcı bu sözleşmenin uygulanmasını açıkça istedi; yürütme kaynağı bu sözleşme. Eski koşunun dosyalarına dokunulmadı. Eski koşuyu devam ettirmek ya da kapatmak kullanıcının kararı. |
| C2 | Tümü | `CLAUDE.md` hedefi "Awwwards SOTD" ve 5 kriter puanı yazıyor; bu sözleşme "HM/7.0+ tasarım hedefi, puan/ödül garantisi yazılmaz" diyor. | Raporlarda jüri puanı veya ödül iddiası yok. `CLAUDE.md` değiştirilmedi. |
| C3 | M01 | `src/pages/Malzemeler.tsx` içindeki önceki not `MaterialMorphScroll`'un "yerinde kalacağını" söylüyordu. | §3 kararı uygulandı; not, kaldırmanın gerekçesiyle güncellendi. |
| C5 | M01 | `scripts/claims-gate.mjs` kuralı `demo-placeholder-badge` (eski `IMPLEMENTATION.md` §7 Faz 06) "temsili" kelimesini her bağlamda yasaklıyor. Yeni sözleşme ise M01, IMG01 ve PROOF01'de harfiyen "Temsili …" dürüstlük etiketlerini zorunlu kılıyor. | Kural kaldırılmadı. Yalnız sözleşmenin harfiyen verdiği M01 caption'ı `CONTRACT_HONESTY_LABELS` listesine **sabitlendi**. Kısmi veya başka "temsili" kullanımları hâlâ yakalanıyor (pozitif kontroller eklendi). IMG01/PROOF01 etiketleri o işlerde aynı yolla eklenecek. |
| C6 | COPY01 | `src/components/shell/rail-labels.ts` (Faz 04): "ray her UI dilinde İngilizce sayfa kodu kalır". TR sayfalarda `HEADER`, `PROOF STRIP`, `DEFINITION`, `REGISTER`, `NEXT STEP` gibi etiketler basılıyordu. | Sözleşme kazanır: `railLabel(key, language)` TR'de anlamlı Türkçe bölüm adı (MENÜ, AÇILIŞ, KABİLİYET ÖZETİ, TANIM, KAYIT, SONRAKİ ADIM…), EN'de İngilizce karşılık basar. Pafta numaraları değişmedi. |
| C7 | T02 | `scripts/qa-p09a2-claims-sweep` garanti/taahhüt kelimesini olumsuzlanmış olsa bile yalnız hukuk sayfalarında muaf tutuyor. | Tablo notu "taahhüt" kelimesi olmadan yazıldı ("Genel referans değerleridir; şirket kapasitesini göstermez"). Tarama değiştirilmedi. |
| C8 | L01 | `USER_INPUTS.md` §B `ENGLISH_LIVE_NOW: NO` ve `claims.ts` `ENGLISH_SITE = withhold(...)`; sözleşme paket 3 ise tam TR/EN public yüzey istiyor. | Sözleşme uygulandı: `/en` yüzeyi kuruldu. `USER_INPUTS.md` ve `ENGLISH_SITE` kaydı değiştirilmedi (izinler olduğu gibi). Yayına/indekslemeye açılması O10'a bağlı; build varsayılanı zaten `preview` (noindex). |
| C9 | L01 | `e2e/polish/i18n-switch.spec.ts` (Round 2) beş dil (TR·EN·DE·RU·ZH) ve `mas_lang` ile yerinde dil değişimi bekliyordu. | Sözleşme kazanır: public dil adres ile belirlenir, switch aynı kaydın diğer dildeki adresine gider. Spec TR/EN ve URL davranışına göre yeniden yazıldı; DE/RU/ZH sözlükleri silinmedi. |
| C10 | SEO01 | `index.html` canonical ve `og:url` olarak `https://mas-technic-precision.lovable.app/` yazıyordu; `USER_INPUTS.md` §A başka bir domain veriyor. | Sabit origin kaynaktan kaldırıldı. Origin yalnız `VITE_SITE_ORIGIN` ile gelir; yoksa canonical/og:url/hreflang yazılmaz. `public` build origin'siz kırılır (`mas-site-meta`). |
| C4 | S01 | `CLAUDE.md` "her commit öncesi `npm run build` geçmeli" diyor; envsiz build başarılı ama uygulama tarayıcıda `VITE_SUPABASE_URL is not set` hatasıyla `ErrorBoundary`'ye düşüyor. | Yerel ölçümler CI ile aynı placeholder env ile yapıldı ve `LOCAL_FIXTURE` olarak etiketlendi. Envsiz sonuç ayrıca kaydedildi (`evidence/s01-baseline-requests-noenv.json`). |

## Açık karar önerileri

| # | Konu | Bağlam | Öneri |
|---|---|---|---|
| D1 | `MaterialMorphScroll` ve 80 sekans karesinin silinmesi | M01 sonrası hiçbir rota kullanmıyor (`grep` ile doğrulandı; `e2e/visual/radius-census.ts` yalnız dosya adını referans alıyor). `public/sequence-material/` 80 dosya. | Bir sonraki temizlik paketinde, `radius-census.ts` referansıyla birlikte kaldırılsın. Bu pakette silinmedi. |
| D2 | M01 caption yönü | Sözleşmenin harfiyen verdiği caption "…**aşağıdaki** kayıt…" diyordu; sözleşmenin sıralamasına göre kayıt paftanın **üstünde**. | **Uygulandı (kullanıcı kararı, 2 Ekim 2026):** caption "…**yukarıdaki** kayıt ve çalışma koşullarına göre yapılır." oldu; claims-gate sabitlemesi aynı anda güncellendi, eski metin artık sabit değil (pozitif kontrol). |
| D3 | EN parola sıfırlama dönüşü | `ForgotPassword` Supabase'e `redirectTo: <origin>/reset-password` gönderiyor. `/en/reset-password` kullanmak Supabase'deki izinli yönlendirme listesini değiştirmeyi gerektirebilir (`supabase/` bu işin kapsamı dışında). | Değiştirilmedi: EN kullanıcı sıfırlama bağlantısından TR sayfaya döner. İzinli listeye `/en/reset-password` eklendiğinde tek satırlık değişiklik. |
| D4 | İndeksleme varsayılanı | SEO01 sonrası `npm run build` varsayılanı `preview`: her sayfada `noindex, nofollow`. Bugünkü yayına bu build gönderilirse site indeks dışı kalır. | Yayın build'i `VITE_SITE_INDEXING=public VITE_SITE_ORIGIN=https://…` ile alınmalı (O10). Bu bilinçli: indekslenebilir build kendi origin'ini söylemek zorunda. |
