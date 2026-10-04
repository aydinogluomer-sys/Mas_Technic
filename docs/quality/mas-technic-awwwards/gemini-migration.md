# Gemini taşıması — finance-ai ve ocr-invoice

Durum: **IMPLEMENTED · PASS_LOCAL (taklitli) · gerçek provider testi NOT_TESTED · deploy edilmedi**

## Kapsam

| Function | Önce | Sonra |
|---|---|---|
| `finance-ai` | `ai.gateway.lovable.dev` (OpenAI biçimi), `LOVABLE_API_KEY` | Gemini `generateContent`, `gemini-2.5-flash`, `GOOGLE_GEMINI_API_KEY` |
| `ocr-invoice` | aynı gateway, görsel `image_url` data URL | Gemini `generateContent`, dosya `inline_data` (görsel ve PDF) |

Davranış farkları:

- Sistem metni `systemInstruction`, geçmiş `user`/`model` turları. Panelin geçmişi otomatik analizle (model turu) başlıyorsa başa varsayılan analiz isteği eklenir.
- Yanıt `candidates[0].content.parts[].text` birleştirilerek okunur.
- 429 aynı mesajla döner. Gateway'e özgü 402 dalı kaldırıldı (Gemini 402 döndürmez). Diğer provider hataları 500 `Gemini API error`.
- Provider çağrısı 60 sn sonra kesilir → 504 "AI yanıt vermedi".
- OCR JSON ayrıştırma hatası, model metnini mesajına taşımaz (fatura metni loglara girmez).
- `ocr-invoice` dosyayı 32 KiB parçalarla base64'e çevirir; eski tek parça dönüşüm ~1 MB'ta `RangeError` veriyordu.
- Anahtar istek başlığında (`x-goog-api-key`), URL'de değil. Anahtar yalnız sunucuda (edge function env).
- Yetki kontrolü (Bearer + admin rolü) değişmedi.

## Doğrulama

- `deno check` iki function için temiz.
- Taklitli harness (Supabase ve Gemini stub): istek biçimi, yanıt okuma, DB güncellemesi, 429/403, zaman aşımı, bozuk JSON, 3 B / 1 MB / 8 MB dosya. Hepsi beklendiği gibi. Bu `PASS_LOCAL`'dır; gerçek Gemini çağrısı yapılmadı (anahtar yok).

## Merge sonrası düzeltmeler (PR #7 inceleme bulguları)

| Bulgu | Değişiklik |
|---|---|
| `finance-ai`: başarısız bir sorudan sonra yeniden denemede art arda iki `user` turu gidiyordu (panel başarısız soruyu geçmişte tutuyor) | Aynı roldeki komşu turlar Gemini'ye gönderilmeden birleştirilir; roller her zaman dönüşümlü |
| Herkese açık `chat` (JWT yok) kotayı tüketebilir; Gemini kotası **proje** başınadır, anahtar başına değil | `chat`'e IP başına dakikada 10 istek sınırı (bellekte, izolat başına; aşılınca 429 + `Retry-After`, Gemini çağrılmaz). Admin fonksiyonları `GOOGLE_GEMINI_ADMIN_API_KEY` tanımlıysa onu kullanır: bu anahtar **ayrı bir Google Cloud projesinden** alınırsa admin kapasitesi herkese açık trafikten yalıtılır. Tanımlı değilse ortak anahtar kullanılır (bugünkü davranış) |
| `gemini-2.5-flash` yeni projelerde erişilemeyebilir (inceleme iddiası, buradan doğrulanamadı) | Model kod değişmeden değiştirilebilir: `GEMINI_ADMIN_MODEL` (finance-ai, ocr-invoice; varsayılan `gemini-2.5-flash`), `GEMINI_CHAT_MODEL` (chat; varsayılan `gemini-2.0-flash`) |
| `chat` anahtarı URL'de (`?key=`) taşıyordu; URL'ler loglara düşebilir | Anahtar `x-goog-api-key` başlığında |

Gizlilik notu: `chat` hız sınırı için ziyaretçi IP'sini en fazla 1 dakika fonksiyonun belleğinde tutar; Google'a gönderilmez, veritabanına yazılmaz. Gizlilik/KVKK metinlerindeki "IP Google'a aktarılmaz, metin kaydedilmez" ifadeleri doğru kalır. Metinler modeli `gemini-2.0-flash` diye adlandırıyor; `GEMINI_CHAT_MODEL` değiştirilirse metin de güncellenmeli (O08).

Doğrulama: `deno check` üç fonksiyon için temiz. Taklitli harness: rol birleştirme, admin anahtarı/ortak anahtar seçimi, model env'i, chat'te 10 istekten sonra 429 + `Retry-After: 60` ve diğer IP'nin etkilenmemesi, anahtarın URL'de olmaması. Gerçek Gemini çağrısı yapılmadı.

### Model erişimini deploy'dan önce doğrulama

Anahtarı ekrana ya da loga yazmadan, anahtarın sahibi kendi makinesinde:

```
curl -s -o /dev/null -w "%{http_code}\n" -H "x-goog-api-key: $GOOGLE_GEMINI_API_KEY" -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"ping"}]}]}' \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

`200` erişim var demektir; `404`/`403` ise `GEMINI_ADMIN_MODEL`'e erişilebilen bir model adı yazılır (aynısı `gemini-2.0-flash` ve `GEMINI_CHAT_MODEL` için).

## Deploy (yetki gerektirir)

1. Supabase'de `GOOGLE_GEMINI_API_KEY` secret'ının var olduğunu doğrulayın (değeri yazdırmadan): `supabase secrets list` adları listeler. `chat` function'ı çalışıyorsa tanımlıdır.
2. İsteğe bağlı: ayrı bir Google Cloud projesinden alınan anahtarı `supabase secrets set GOOGLE_GEMINI_ADMIN_API_KEY=…` ile ekleyin (değer komut geçmişine düşmesin diye `--env-file` tercih edin). Model doğrulaması yukarıda.
3. PR merge edildikten sonra: `supabase functions deploy finance-ai`, `supabase functions deploy ocr-invoice` ve `supabase functions deploy chat`.
4. Admin panelinde bir analiz ve küçük + ~2 MB'lık bir fatura yüklemesi deneyin; function loglarında hata olmadığını kontrol edin.
5. İkisi de çalışıyorsa `LOVABLE_API_KEY` secret'ını kaldırın.

## Geri alma

Önceki sürümü yeniden deploy edin: `git checkout <önceki-commit> -- supabase/functions/finance-ai supabase/functions/ocr-invoice supabase/functions/chat` ve ilgili `supabase functions deploy` komutları. `LOVABLE_API_KEY` geri alma tamamlanana kadar silinmemelidir (adım 4 bu yüzden en sonda).

## Bilinen kalıntı

`src/components/admin/FinanceDocsView.tsx` "kredi" içeren hata mesajını ayrıca yakalıyor; 402 artık gelmediği için bu dal ölü. Admin koduna dokunmama kuralı nedeniyle bırakıldı; zararsız.
