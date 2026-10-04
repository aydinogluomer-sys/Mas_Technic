# RFQ sunucu yaması (RFQ01–03, D1)

Durum: **IMPLEMENTED (yama olarak) · PASS_LOCAL (taklitli testler) · staging BLOCKED_ACCESS · production uygulanmadı**

`supabase/` altında şema değişikliği `CLAUDE.md` tarafından yasak; bu yüzden sunucu işi buraya, `supabase/` ile aynı düzende, uygulanmaya hazır olarak yazıldı. Sözleşme: [`../rfq-backend-contract.md`](../rfq-backend-contract.md).

## İçerik

| Dosya | Ne yapar |
|---|---|
| `supabase/migrations/20261003120000_rfq_attachments_and_limits.sql` | `rfqs.attachments` (jsonb dizi), `rfqs.email_status`, izolatlar arası kalıcı hız sınırı (`rfq_rate_limits` + atomik `rfq_rate_limit_hit`), yetim yükleme listesi (`rfq_orphan_uploads`), **anonim doğrudan INSERT politikasının kaldırılması** (aşağıda) |
| `supabase/functions/rfq-rate-limit/index.ts` | Bugünkü fonksiyonun yerine geçer: 1 model + 3 PDF, en az 1 dosya; boyut depolamadan ölçülür (50 MB / 100 MB); PDF imzası (`%PDF-`) okunur; yol sahipliği (`<sahip>/<id>/`); aynı `id` ile yeniden gönderim aynı satırı döner (201, `replayed`), farklı içerik 409; hız sınırı kalıcı; bildirim sonucu yanıtta (`email`), iddia edilmez; eski tek dosyalı istekler çalışır |
| `supabase/functions/rfq-attachment-url/index.ts` | Yeni: bir talebin bir dosyası için 5 dakikalık imzalı URL; personel veya talebin sahibi müşteri; diğerleri 403, talebe ait olmayan yol 404 |
| `tests/` | Sözleşme §4 kabul listesi, bellek içi Supabase taklidiyle (21 test) |

## Bulunan güvenlik açığı

`20260224165144_…sql` içindeki `"Anyone can submit RFQ"` politikası, `id`'si olan her satırı anon anahtarla doğrudan `rfqs` tablosuna yazmaya izin veriyor. Bu, edge function'daki bütün doğrulamayı ve hız sınırını atlatır. Migration bu politikayı kaldırır; herkese açık form yazmayı edge function (service role) üzerinden yapar, personel (`is_staff`) yönetim ekranındaki hızlı işlem için doğrudan yazabilir. **Bu madde ekler bayrağından bağımsız olarak öncelikli.**

`cad-uploads` bucket'ı public değil (`20260217215210` ile kapatılmış); okuma yalnız personel ve dosya sahibi.

## Doğrulama (yapılan)

```
npx deno check supabase/functions/rfq-rate-limit/index.ts supabase/functions/rfq-attachment-url/index.ts
cd tests && npx deno test --no-check --allow-env --import-map=import_map.json rfq.test.ts
```

- Tip kontrolü gerçek `@supabase/supabase-js@2` ile temiz.
- 21/21: model-only, PDF-only, model+3 PDF, 2 model (400), 4 PDF (400), dosyasız (400), 51 MB (413, boyut depolamadan), toplam 101 MB (413), beyan edilen boyut uyuşmazlığı (400), PDF olmayan `.pdf` (400), yüklenmemiş dosya (400), Unicode dosya adı korunur, aynı `id` iki kez (tek satır, ikinci 201 `replayed`), aynı `id` farklı içerik (409), başka talebin yolu (400), giriş yapmış kullanıcı kendi `id` öneki, `files`/`attachments` uyuşmazlığı (400), eski tek dosyalı istek (201), dakikada 6. istek (429 + `Retry-After`), okunamayan gövde (400), imzalı URL: sahip 200 / başka müşteri 403 / personel 200 / yabancı yol 404 / oturumsuz 401.

Bu **PASS_LOCAL**'dır: Postgres, RLS ve depolama taklit edildi. Gerçek davranış staging'de aynı listeyle ölçülmeden "geçti" denmez.

## Uygulama sırası (yetki gerektirir: `supabase/` yazma + Supabase proje erişimi, O06)

1. Staging projesinde: migration dosyasını `supabase/migrations/` altına kopyala, `supabase db push`.
2. İki fonksiyonu `supabase/functions/` altına kopyala; `supabase functions deploy rfq-rate-limit` ve `supabase functions deploy rfq-attachment-url`.
3. Staging'de §4 listesini gerçek yüklemelerle koş (test hesabı ve test e-postası: O07). `rfq_orphan_uploads()` ile kuru listeleme yap; silme görevi ancak liste doğru görünürse eklenir.
4. İstemci bayrağı `VITE_RFQ_ATTACHMENTS=on` ile staging build'i; üç gönderim türü (model, PDF, model+PDF) uçtan uca.
5. Yönetim ve müşteri ekranlarının ekleri `rfq-attachment-url` üzerinden açması (`RFQManager.tsx`, `TekliflerimTab.tsx`) — admin/panel kodu `CLAUDE.md` gereği bu işin dışında; ayrı, onaylı bir değişiklik.
6. Production: 1–2 aynı sırayla; bayrak ancak 3–4 staging'de geçince açılır.

## Geri alma

- Fonksiyonlar: önceki `index.ts` yeniden deploy edilir (`git show <önceki>:supabase/functions/rfq-rate-limit/index.ts`).
- Migration ileri yönlüdür; geri almak için yeni bir migration: `attachments`/`email_status` sütunları bırakılabilir (eski fonksiyon okumaz), politika eski haline yazılabilir (önerilmez — açığı geri getirir).
- İstemci bayrağı kapalıyken davranış bugünküyle aynıdır.

## Açık kalanlar

- **E-posta bildirimi:** sağlayıcı seçilmedi (O06/O07). Fonksiyon `email_status: "not_configured"` yazar ve yanıtta bildirir; istemci onay e-postası iddia etmez.
- **sha256:** sunucu 50 MB'a kadar dosyayı yeniden okuyup hash hesaplamaz; istemci beyanı `sha256Source: "client"` olarak saklanır (sözleşme §2.2'nin izin verdiği yol).
- **Yetim temizliği:** listeleme fonksiyonu hazır; zamanlanmış silme görevi staging kuru çalıştırmasından sonra.
