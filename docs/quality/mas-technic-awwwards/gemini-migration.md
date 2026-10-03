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

## Deploy (yetki gerektirir)

1. Supabase'de `GOOGLE_GEMINI_API_KEY` secret'ının var olduğunu doğrulayın (değeri yazdırmadan): `supabase secrets list` adları listeler. `chat` function'ı çalışıyorsa tanımlıdır.
2. PR merge edildikten sonra: `supabase functions deploy finance-ai` ve `supabase functions deploy ocr-invoice`.
3. Admin panelinde bir analiz ve küçük + ~2 MB'lık bir fatura yüklemesi deneyin; function loglarında hata olmadığını kontrol edin.
4. İkisi de çalışıyorsa `LOVABLE_API_KEY` secret'ını kaldırın.

## Geri alma

Önceki sürümü yeniden deploy edin: `git checkout <önceki-commit> -- supabase/functions/finance-ai supabase/functions/ocr-invoice` ve iki `supabase functions deploy`. `LOVABLE_API_KEY` geri alma tamamlanana kadar silinmemelidir (adım 4 bu yüzden en sonda).

## Bilinen kalıntı

`src/components/admin/FinanceDocsView.tsx` "kredi" içeren hata mesajını ayrıca yakalıyor; 402 artık gelmediği için bu dal ölü. Admin koduna dokunmama kuralı nedeniyle bırakıldı; zararsız.
