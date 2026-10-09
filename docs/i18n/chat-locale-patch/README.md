# Sohbet fonksiyonu: dil yaması (taslak, sahibinde)

`supabase/` bu çalışmada dokunulmaz bölge. Bu yüzden değişiklik burada yama olarak duruyor.

## Durum

Sitedeki sohbet istemcisi (`src/components/ChatBot.tsx`) L6'dan beri her isteğe sayfanın dilini ekliyor: `{ messages, locale }`. `locale` değeri `tr`, `en`, `de`, `ru` ya da `zh` olur.

Bugünkü `supabase/functions/chat/index.ts` bu alanı yok sayar. Sistem talimatında "Türkçe yanıt ver" yazdığı için `/en`, `/de`, `/ru` ve `/zh` sayfalarında da yapay zekâ Türkçe yanıt verir. Yama uygulanmadan önce de istemci değişikliği zararsızdır: fazladan alan okunmaz.

SSS eşleşmesi (`src/data/chatFaqData.ts`) tarayıcıda çalışır ve zaten her dilde yanıt verir. Yama yalnız yapay zekâ yanıtını etkiler.

## Yama ne yapar

`chat-locale.patch`:

- Sistem talimatındaki dil cümlesi ve teklif sayfası yolu (`/teklif-al`, `/en/teklif-al`, …) `locale`'e göre seçilir.
- Bilinmeyen, eksik ya da string olmayan `locale` (eski istemci, elle yazılmış istek) bugünkü Türkçe davranışı korur. Arama `Object.hasOwn` ile yapılır; `__proto__` gibi değerler de Türkçeye düşer.
- Sınırlar, hız limiti, Gemini çağrısı ve hata yanıtları değişmez.

Hata metinleri (`Geçersiz istek.` vb.) Türkçe kalır. İstemci bunları `t()` ile gösterir ve beş dilin sözlüğünde karşılıkları var.

## Uygulama (sahip)

```sh
git apply docs/i18n/chat-locale-patch/chat-locale.patch
supabase functions deploy chat
```

Ardından `/en` sayfasında, SSS'de eşleşmeyen bir soru ve onay ile yanıtın İngilizce geldiği görülür. `/de`, `/ru` ve `/zh` ancak `VITE_SITE_LOCALES` ile açıldıklarında aynı şekilde denenir.
