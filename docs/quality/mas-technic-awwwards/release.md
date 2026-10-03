# Yayın hazırlığı (RELEASE01) ve canlı döngü (QA02)

Durum: **yerel hazırlık tamam · canlı eşleşme `BLOCKED_DATA` (O01) · canlı görev döngüsü `BLOCKED_DATA` (O07)**. Bu belge otomatik yayın, merge ya da deploy yapmaz; adımları sahibine bırakır.

## 1. Build kimliği

Her `npm run build`:

- kök dizine `release.json` yazar: `commit` (CI'da `GITHUB_SHA`, yerelde `git rev-parse HEAD`), `builtAt` ve her yayınlanan dosyanın `sha256` + bayt değeri (`index.html` dahil);
- `index.html` içine `<meta name="mas-build" content="<commit> <builtAt>">` ekler.

Hiçbir ortam değeri yazılmaz (Supabase URL/anahtar, site origin yok). Yerel `git rev-parse HEAD` yalnız checkout'u kanıtlar; canlı sürüm, hosttan alınan `release.json`'un build ile eşleşmesiyle kanıtlanır:

```bash
# aynı commit'ten, yayın ortamının env'iyle build
VITE_SUPABASE_URL=… VITE_SUPABASE_PUBLISHABLE_KEY=… \
VITE_SITE_ORIGIN=https://<aday-origin> VITE_SITE_INDEXING=public npm run build
# yayın sonrası
node scripts/quality/verify-release.mjs --base https://<aday-origin> --dist dist --out release-check.json
```

`verify-release.mjs` şunları kontrol eder: `/release.json` commit/zaman/dosya kümesi; her dosyanın hash'i, `content-type`'ı ve önbellek başlığı (hash'li varlıklar uzun, `index.html` kısa); bilinmeyen adresin HTTP durumu; derin rotanın `index.html` ile sunulması; `/robots.txt`; HTML'deki build meta'sı.

## 2. Hostta kapatılacaklar (aday host gelince, O01)

| Konu | Beklenen | Not |
|---|---|---|
| Origin | `VITE_SITE_ORIGIN` = aday origin | Origin'siz `public` build bilerek kırılır (SEO01) |
| İndeksleme | Yayın build'i `VITE_SITE_INDEXING=public`; önizleme/aday build'leri `noindex` | Varsayılan build `noindex` (D4) |
| Canonical / OG / hreflang | Ana sayfada statik; rotalarda `usePageMeta` | Ön render olmadan arama motoru SPA'yı JS ile görür |
| HTTP 404 | Bilinmeyen adres 404 durum kodu (veya bilinçli kayıt) | Bugün SPA fallback 200 + istemci 404; host kuralı gerekir |
| Yanlış aile yönlendirmesi | Bugün istemci `replace`; host 301 kuralı önerilir | R01 notu |
| Önbellek | `assets/*` `max-age=31536000, immutable`; `index.html`, `release.json` `no-cache` | Aksi hâlde yeni sürüm görünmez |
| İçerik türleri | `.webp` `image/webp`, `.pdf` `application/pdf`, `.js` `text/javascript` | `verify-release.mjs` kontrol eder |
| Sıkıştırma | gzip veya brotli | Lab ölçümü gzip ile yapıldı (PERF01) |
| Ön render | Public rotalar için; auth rotaları özel veri taşımaz | LCP hedefi için gerekli (D17); adaptör host bilinince |
| Service worker | Yok; eklenmeyecek | Kaynakta kayıt yok (aranarak doğrulandı) |

Temiz bir oturumda en az şu adresler denenir: `/`, `/en`, `/hizmetler/cnc-frezeleme`, `/hizmetler/cnc-tornalama`, `/malzemeler`, `/kalite-dosyasi`, `/kabiliyet-profilleri/hassas-mil`, `/blog/cnc-torna-frezeleme-farki`, `/teklif-al`, `/kvkk`, yanlış aile (`/endustriyel/cnc-frezeleme` → `/hizmetler/cnc-frezeleme`) ve bilinmeyen bir adres (HTTP ve istemci 404'ü ayrı ayrı).

## 3. Yayın (rollout) — sahibin adımları

1. Dalı gözden geçirin: `claude/documentation-roadmap-nwV4C` → `main` farkı (paket 1–8). Merge kararı sizindir; otomatik merge yapılmadı.
2. Aynı commit'ten yayın env'iyle build alın (yukarıdaki komut). Build kırılırsa (ör. origin yok) yayın durur.
3. Build'i önce bir önizleme/aday adresine yükleyin; `noindex` aday build'i kullanın ya da public build'i erişimi kısıtlı bir adrese koyun.
4. `verify-release.mjs` ve §2 tablosunu aday adreste çalıştırın; `fail` kalmasın.
5. QA02 listesini (§5) test hesabıyla koşun.
6. Canlıya alın; aynı `release.json`'un canlı adreste döndüğünü `verify-release.mjs` ile doğrulayın.

## 4. Geri alma (rollback)

- Önceki build'in `dist/` arşivini (ve `release.json`'unu) saklayın; geri alma, önceki arşivi yeniden yayınlamaktır. Hash'li varlıklar çakışmaz; `index.html` ve `release.json` kısa önbellekli olduğu için geri alma hemen görünür.
- Kod düzeyinde: `main` üzerinde ilgili merge commit'i `git revert` ile geri alınır (force-push yok).
- Veritabanı: bu çalışmada migration uygulanmadı (`supabase/` salt okunur). RFQ çoklu ek migration'ı (`rfq-backend-contract.md` §3) yalnız ileri yönlüdür ve ayrı bir teslimdir.
- Bayraklar: `VITE_RFQ_ATTACHMENTS` kapalı build, çoklu eki kapatmanın tek yoludur (build-time).

## 5. QA02 — canlı görev döngüsü (O07 gelince)

Gerekli: test tenant/hesap (müşteri + admin), test e-posta adresi, test booking kapsamı, staging Supabase erişimi. Gerçek müşteri verisine yazılmaz; başkasına e-posta/toplantı gönderilmez.

| Senaryo | Beklenen | Bugün |
|---|---|---|
| RFQ → dosya → sunucu kaydı | Talep numarası tutarlı, dosya doğru yetkiyle açılır | Yalnız ağ taklidiyle (`p6`, `qa-p09a-rfq-form`) — `LOCAL_FIXTURE` |
| Tekrar gönderim / yanıt kaybı | Tek kayıt | İstemci aynı numarayı yolluyor; sunucu davranışı `rfq-backend-contract.md` §2.4 |
| Bildirim e-postası | Teslim kanıtı | Sistem e-posta göndermiyor; ekran bunu iddia etmiyor |
| Hesap → sipariş → ölçüm dosyası | Müşteri yalnız kendi kaydını görür | Panel kodu kapsam dışı; doğrulanmadı |
| Başka müşterinin verisi | Erişim reddi | Doğrulanmadı |
| Şifre unuttum / sıfırlama (geçerli, süresi dolmuş, tekrar kullanılmış token) | Doğru mesajlar | Doğrulanmadı; EN dönüş adresi D3 |
| Sosyal giriş (izinli sağlayıcı) | Giriş | Doğrulanmadı |
| Büyük yükleme + yeniden deneme | Takılma yok, tek nesne | İstemci 45 sn durma bekçisi; sunucu doğrulanmadı |
| Randevu daveti | Gerçek davet | Dış takvim; doğrulanmadı |

Bu satırların hiçbiri "geçti" sayılmaz; taklitli ve yerel kanıtlar ayrı tutulur (`LOCAL_FIXTURE`).
