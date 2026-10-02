# İşletmeden gereken girdiler

Yalnız gerçekten gerekli veri ve belgeler. Bunlar gelmeden teknik iş durmaz: eksik olan iş `BLOCKED_DATA` olarak kaydedilir ve sözleşmedeki güvenli davranış uygulanır.

| Kimlik | Gerekli gerçek veri | Hangi işler bekliyor | Veri yokken uygulanan davranış | Durum |
|---|---|---|---|---|
| O01 | Aday origin/hosting ve deployment erişimi | S01 (candidate-host ölçümü), SEO01, RELEASE01 | Ölçümler yerel `vite preview` ile, `LOCAL_FIXTURE` etiketli | Açık |
| O02 | Torna / derin delik ve diğer kapasite kapsam onayı | T01, T02 | Çelişkili veya koşulsuz sayı public'te kullanılmaz | Açık |
| O03 | ISO 9001 / 14001 için issuer, kapsam ve geçerlilik belgesi; OHSAS'ın güncel durumu | T02, UX03 | ISO 45001 eklenmez; OHSAS aktif rozet olarak gösterilmez; aktif belge doğrulaması açık kalır | Açık |
| O04 | Bir gerçek demo kuponu: çizim + revizyon, proses/bağlama görseli, kritik koteler, gerçek ölçüm çıktısı, izin, teknik gözden geçiren | PROOF02 | Temsili etkileşim çalışır; measured panel yayımlanmaz | Açık |
| O05 | Malzeme property kaynakları ve koşulları | T03 | Kaynaksız sayı yerine `Veri doğrulanmadı` | Açık |
| O06 | RFQ server kontratı, edge function, storage ve staging test erişimi | RFQ01–03 | UI ve kontrat hazırlanır, çoklu ek üretimde açılmaz | Açık |
| O07 | Test kullanıcı/admin hesabı, test e-posta adresi, test booking kapsamı | QA02 | "Gerçek döngü geçti" denmez; mock/local kanıt ayrı | Açık |
| O08 | EN hukuki metin onayı ve teknik metin gözden geçiren | L01 | Çeviri hazırlanır; hukuki/teknik onay uydurulmaz | Açık |
| O09 | Gerçek `VITE_SUPABASE_URL` / publishable key ile ölçüm izni (yalnız publishable değerler) | S01 (gerçek env build) | CI placeholder env ile build; `LOCAL_FIXTURE` | Açık |
