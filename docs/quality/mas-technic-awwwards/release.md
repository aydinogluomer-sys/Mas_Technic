# Yayın hazırlığı (RELEASE01) ve canlı döngü (QA02)

Durum: **Vercel yapılandırması + ön render IMPLEMENTED · yerel doğrulama PASS_LOCAL · canlı eşleşme BLOCKED_ACCESS (Vercel erişimi, O01) · domain ve EN kararı BLOCKED_OWNER_DATA (O10, §B) · canlı görev döngüsü BLOCKED_ACCESS (O07)**. Bu belge otomatik yayın, merge ya da deploy yapmaz; adımları sahibine bırakır.

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

## 2. Vercel yapılandırması (C2/C3 — hazır, yerelde doğrulandı)

Host Vercel olarak seçildi. Yapılandırma repoda; canlı doğrulama Vercel erişimiyle yapılır (O01: `BLOCKED_ACCESS`).

| Konu | Uygulama | Yerel kanıt |
|---|---|---|
| Ön render | `npm run build` = `vite build` + `scripts/prerender/prerender.mjs`: 95 TR (+95 EN, EN yayındaysa) public rota statik HTML; `404.html`; panel/giriş için boş `shell.html` | Rota başına `<html lang>`, title, description, robots, canonical/og/hreflang (origin varsa) ve gövde metni ilk HTML'de |
| Devralma | `src/main.tsx`: hazır HTML hidrate edilmez; rota kodu + dil önceden yüklenir, ilk render transition içinde tek adımda yerine geçer | Geciktirilmiş parçayla 3 rota: boş kare 0, yükleniyor karesi 0, konsol hatası 0 |
| Rotalar | `vercel.json` (`scripts/vercel/generate-config.mjs` ile rota tablosundan üretilir; CI `--check` ile senkron kontrol): `cleanUrls`, `trailingSlash:false` | `scripts/serve-dist.mjs` aynı dosyayı uygular (`npm run preview`) |
| HTTP 404 | Bilinmeyen adres → `404.html`, **durum 404**; toptan `index.html` rewrite yok | `/olmayan-sayfa`, `/hizmetler/olmayan` → 404 |
| Yönlendirme | Yanlış aile (TR+EN, 192), eski slug `basinçli-dokum` (düz + kodlanmış), `/cad-dashboard` → kalıcı (Vercel 308) | 308 + doğru `location` |
| Panel/giriş | `/admin*`, `/musteri-paneli*`, `/giris`, `/sifremi-unuttum`, `/reset-password` (+EN) → `shell.html` | 200, ön render içeriği yok |
| Önbellek | `assets/*` `max-age=31536000, immutable`; HTML ve `release.json` `max-age=0, must-revalidate` | başlıklar doğrulandı |
| Eski HTML + yeni parça | Parça hatası → bir kez yenile (sekme başına 30 sn kilit), sonra gerçek yenileme düğmesi (B1) | `boot-resilience.spec.ts` |
| Güvenlik başlıkları | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`. **CSP yok**: randevu iframe'i, hCaptcha ve Supabase çağrıları ölçülmüş bir politika ister; körlemesine eklenmedi | başlıklar doğrulandı |
| İndeksleme | `VITE_SITE_INDEXING=public` + `VITE_SITE_ORIGIN` → `robots.txt` (Allow + Sitemap) ve `sitemap.xml`; aksi hâlde `robots.txt` `Disallow: /`, sitemap yok, her sayfada `noindex` | iki mod üretildi |
| İngilizce | `VITE_SITE_ENGLISH=live` → dil seçici, `/en` ön render, hreflang, sitemap'te EN. **Varsayılan kapalı** (`USER_INPUTS.md` §B `ENGLISH_LIVE_NOW: NO`): `/en` dosyası üretilmez → 404 | iki mod üretildi |

### Derleme Chromium ister

Ön render gerçek bir tarayıcıyla yapılır (Playwright, projede zaten var; yeni paket yok). İki yol:

1. **Önerilen — GitHub Actions'ta derle, Vercel'e hazır çıktıyı gönder.** CI zaten Chromium kuruyor. Vercel CLI ile `vercel pull --environment=production`, `vercel build --prod`, `vercel deploy --prebuilt --prod` (VERCEL_TOKEN, ORG ve PROJECT kimliği GitHub secret olarak). Bu adım yetki gerektirir ve otomatik eklenmedi.
2. **Vercel'in kendi derlemesi.** `vercel.json` `buildCommand: npm run build`. Vercel'in derleme görüntüsünde Chromium bulunmadığı için önce `npx playwright install chromium` gerekir; görüntünün sistem kütüphaneleri Playwright tarafından resmî olarak desteklenmiyor. Denenmeden güvenilir sayılmamalı (`NOT_TESTED`).

### Vercel ortam değişkenleri (Project → Settings → Environment Variables)

| Değişken | Production | Preview |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | gerçek publishable değerler | staging değerleri |
| `VITE_SITE_ORIGIN` | **karar bekliyor** (O10: `www.masmare.com` mı, `mastechnic.com` mu) | boş |
| `VITE_SITE_INDEXING` | `public` (origin kararından sonra) | boş → noindex |
| `VITE_SITE_ENGLISH` | **karar bekliyor** (§B şu an `NO`) | `live` (gözden geçirme için) |

Gizli anahtar (service role, Gemini) Vercel'e konmaz; yalnız Supabase edge function ortamında durur.

## 3. Yayın (rollout) — sahibin adımları

1. PR'ı gözden geçirip merge edin (otomatik merge yok).
2. Vercel projesini bu repoya bağlayın; ortam değişkenlerini yukarıdaki tabloya göre girin (origin ve EN kararları O10 / §B).
3. Önce Preview deployment: `noindex`, `robots.txt Disallow`. Aşağıdakileri koşun:
   `node scripts/quality/verify-release.mjs --base https://<preview-url> --dist dist --out release-check.json`
   (aynı commit'ten, aynı env ile derlenmiş `dist` gerekir) ve §2 tablosundaki adresleri tarayıcıda deneyin.
4. QA02 listesini (§5) test hesabıyla koşun.
5. Production'a terfi (Promote); `verify-release.mjs`'i canlı origin'e karşı tekrar çalıştırın; `robots.txt`, `sitemap.xml`, bir derin rota, bir 404 ve bir yönlendirmeyi kontrol edin.

## 4. Geri alma (rollback)

- **Vercel:** Deployments → önceki başarılı production deployment → *Promote to Production* (ya da *Instant Rollback*). Hash'li varlıklar çakışmaz; HTML ve `release.json` yeniden doğrulandığı için geri alma hemen görünür. Eski sekmede kalan bir ziyaretçi, eksik parça hatasında bir kez otomatik yenilenir.
- **Kod:** `main` üzerinde ilgili merge commit'i `git revert` ile geri alınır (force-push yok).
- **Veritabanı:** bu çalışmada migration uygulanmadı. RFQ yaması (`rfq-backend-patch/`) ileri yönlüdür ve ayrı bir teslimdir.
- **Bayraklar (derleme zamanı):** `VITE_RFQ_ATTACHMENTS` (çoklu ek), `VITE_SITE_ENGLISH` (İngilizce yüzey), `VITE_SITE_INDEXING` (indeksleme). Değiştirmek yeniden derleme ister.

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
