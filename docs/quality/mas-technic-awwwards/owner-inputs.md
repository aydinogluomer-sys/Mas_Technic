# İşletmeden gereken girdiler

Yalnız gerçekten gerekli veri ve belgeler. Bunlar gelmeden teknik iş durmaz: eksik olan iş `BLOCKED_DATA` olarak kaydedilir ve sözleşmedeki güvenli davranış uygulanır.

| Kimlik | Gerekli gerçek veri | Hangi işler bekliyor | Veri yokken uygulanan davranış | Durum |
|---|---|---|---|---|
| O01 | Aday origin/hosting ve deployment erişimi | S01 (candidate-host ölçümü), SEO01 (prerender, canlı doğrulama), RELEASE01 | Ölçümler yerel `vite preview` ile, `LOCAL_FIXTURE` etiketli. SEO01: build varsayılanı `preview` (noindex, canonical yok); prerender adaptörü `BLOCKED_DATA` | Açık |
| O02 | Kapasite kapsam onayı. Öncelikli kalemler: torna çap/boy/bar (Ø500 mı 380 mi, Ø65, 3 m); derin delik gun drill / BTA aralıkları ve derinlik; mikro işleme takım çapı ve iş mili devri; basınçlı döküm kilitleme kuvveti ve min. duvar; anodizasyon tank boyutu ve ağırlık; lazer alanı; parça ağırlık/boyut sınırı. T02 öncesi metinlerin tam listesi: `claims-register.md` ve `evidence/t02-claims-inventory-before.json` | T01, T02 | Çelişkili veya koşulsuz sayı public'te kullanılmaz; kapsam metni kullanılır | Açık |
| O03 | ISO 9001 / 14001 için issuer, kapsam ve geçerlilik belgesi; OHSAS'ın güncel durumu | T02, UX03 | ISO 45001 eklenmez; OHSAS aktif rozet olarak gösterilmez; aktif belge doğrulaması açık kalır | Açık |
| O04 | Bir gerçek demo kuponu: çizim + revizyon, proses/bağlama görseli, kritik koteler, gerçek ölçüm çıktısı, izin, teknik gözden geçiren | PROOF02; UX05 (CMM yazısı) | Temsili etkileşim çalışır; measured panel yayımlanmaz. UX05: CMM yazısındaki kontrol planı tablosu ve çizimi "Örnek · gerçek rapor değil" etiketli; gerçek ölçüm çıktısı gösterilmez | Açık |
| O05 | Malzeme property kaynakları ve koşulları | T03 | Kaynaksız sayı yerine `Veri doğrulanmadı` | Açık |
| O06 | RFQ server kontratı, edge function, storage ve staging test erişimi | RFQ01–03 | UI ve kontrat hazırlanır, çoklu ek üretimde açılmaz | Açık |
| O07 | Test kullanıcı/admin hesabı, test e-posta adresi, test booking kapsamı | QA02 | "Gerçek döngü geçti" denmez; mock/local kanıt ayrı | Açık |
| O08 | EN hukuki metin onayı ve teknik metin gözden geçiren | L01 | Çeviri hazırlandı: KVKK, gizlilik ve çerez metinlerinin tam EN çevirisi `src/content/en/legal/`; EN sayfa "Türkçe metin bağlayıcıdır" diyor. Hukuki/teknik onay uydurulmadı | Açık (çeviri hazır, onay bekliyor) |
| O09 | Gerçek `VITE_SUPABASE_URL` / publishable key ile ölçüm izni (yalnız publishable değerler) | S01 (gerçek env build) | CI placeholder env ile build; `LOCAL_FIXTURE` | Açık |
| O10 | Yayın origin'i ve EN'in canlıya açılması: `USER_INPUTS.md` §A `PRODUCTION_DOMAIN: https://www.masmare.com` ama gizlilik metni ve e-postalar `mastechnic.com` diyor; §B `ENGLISH_LIVE_NOW: NO` | SEO01 (public build), L01 yayını | `VITE_SITE_ORIGIN` kodda yazılı değil; origin verilmeden `public` build kırılır. EN yüzey hazır, ama hangi origin'de ve ne zaman indekslenebilir olacağı işletme kararı | Açık |
