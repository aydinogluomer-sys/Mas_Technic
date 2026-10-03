# RFQ sunucu sözleşmesi (RFQ01 / RFQ02)

Durum: **BLOCKED_DATA: backend-contract** (O06). Bu belge sunucu tarafında yapılması gereken değişikliği tanımlar; hiçbiri uygulanmadı. `supabase/` bu çalışmada salt okunur (CLAUDE.md). Migration ve edge function değişikliği staging'de doğrulanmadan production'a gitmez; production uygulaması ayrı bir teslimdir.

İstemci tarafı hazır ve bayrakla kapalı: `VITE_RFQ_ATTACHMENTS=on` olmadan her build bugünkü tek-model akışını kullanır.

## 1. Bugünkü sunucu (kaynaktan okunan)

`supabase/functions/rfq-rate-limit/index.ts`:

| Konu | Bugün | Sonuç |
|---|---|---|
| Dosya listesi | `files: string[]`; her yolun uzantısı 7 CAD uzantısından biri olmalı | PDF yolu **400**. Boş liste kabul edilir. |
| Ek meta verisi | Yok (`attachments` alanı okunmaz) | Boyut, tür, hash sunucuda doğrulanmaz. |
| Yol sahipliği | Kontrol yok | Başka bir talebin depolama yolu `files`'a yazılabilir. |
| Tekrar gönderim | `id` istemciden; aynı `id` → birincil anahtar çakışması → **500** | Yanıtı kaybolan bir isteğin yeniden denemesi ikinci satır yazmaz ama kullanıcı 500 görür. |
| Hız sınırı | İzolat belleğinde, IP başına dakikada 5 | İzolatlar arasında paylaşılmaz. Önceki ölçüm: canlı fonksiyon kaynakla aynı davranmıyordu (`useRfqSubmission.ts` notu); güncel canlı durum ölçülmedi. |
| E-posta | Gönderilmez | Başarı ekranı onay e-postası iddia etmez. |
| Kullanıcı | JWT'den; gövdeden okunmaz | Doğru. |

## 2. İstenen sözleşme

### 2.1 İstek gövdesi

```jsonc
{
  "id": "RFQ-2026-XXXXXXYY",        // istemci üretir, yeniden denemede AYNI kalır
  "customer": "...", "company": "...", "email": "...", "phone": null,
  "service": null, "material": null, "quantity": 10, "notes": "...",
  "files": ["anonymous/RFQ-.../model-1-govde.step", "anonymous/RFQ-.../drawing-1-govde.pdf"],
  "attachments": [
    {
      "kind": "model",              // "model" | "drawing"
      "originalName": "Gövde Ön Rev B.step",
      "storagePath": "anonymous/RFQ-2026-XXXXXXYY/model-1-Govde-On-Rev-B.step",
      "sizeBytes": 1234567,
      "mediaType": "application/octet-stream",
      "sha256": "…64 hex…",
      "revisionLabel": "Rev B"      // null olabilir
    }
  ]
}
```

`files` geriye uyumluluk için kalır (eski tek dosyalı talepler ve yönetim ekranı onu okur). `attachments` varsa doğrulama `attachments` üzerinden yapılır ve `files` ondan türetilmiş olmalıdır.

### 2.2 Sunucu doğrulaması (istemciyle aynı kurallar)

- En az 1, en çok 1 `model` ve 3 `drawing`.
- `model` uzantısı: `step, stp, stl, obj, iges, igs, 3mf`. `drawing`: `pdf`. DWG/DXF bu turda yok.
- **Boyut sunucudan ölçülür:** her `storagePath` için depolama nesnesinin gerçek boyutu okunur. Dosya başına 50 MB, talep başına toplam 100 MB. İstemcinin `sizeBytes` değeri tek otorite değildir; ölçülenle eşleşmezse 400.
- `drawing` nesnesinin ilk 5 baytı `%PDF-` olmalı; değilse 400.
- `sha256` sunucuda yeniden hesaplanabiliyorsa karşılaştırılır; hesaplanamıyorsa saklanır ve "istemci beyanı" olarak işaretlenir.
- Hata kodları: 400 (geçersiz alan/dosya), 413 (boyut), 429 (hız), 5xx (sunucu). Gövde `{ "error": "<insan için tek cümle>" }`; istemci 240 karakterden uzununu göstermez.

### 2.3 Yol sahipliği

`storagePath`, `<owner>/<id>/` önekiyle başlamalı. `owner` = JWT kullanıcısı varsa onun id'si, yoksa `anonymous`. `id` = isteğin `id`'si. Başka bir önek 400. Böylece başka bir talebin dosyası meta veriye yazılarak erişim kazanılamaz.

### 2.4 Tekrar gönderim (idempotency)

İstemci aynı talebin her denemesinde aynı `id`'yi gönderir (`useRfqSubmission.ts`, `referenceRef`). Sunucu:

1. `insert … on conflict (id) do nothing returning *`.
2. Satır dönmediyse mevcut satırı okur. `email` ve `files` aynıysa **201 ile mevcut satırı** döner (aynı istek, yanıtı kaybolmuştu); farklıysa 409.

İkinci bir idempotency sistemi eklenmez; anahtar zaten birincil anahtardır.

### 2.5 Erişim ve indirme

- Bucket `cad-uploads` public değildir; yeni ekler için public link üretilmez.
- Yönetim ve müşteri ekranları dosyayı yalnız yetkili sunucu akışından alınan kısa ömürlü imzalı URL ile açar. Müşteri yalnız kendi `user_id`'li taleplerinin eklerini görebilir.
- Yönetim ekranı (`RFQManager.tsx`) ve müşteri ekranı `attachments` dizisini okumalı; yalnız `files` olan eski satırlar eskisi gibi çalışmalı.

### 2.6 Hız sınırı

Sunucuda kalıcı ve izolatlar arasında paylaşılan bir sayaç (tablo ya da KV). 429 yanıtı `retry_after` saniyesi ve `Retry-After` başlığı taşır. İstemci bunu zaten okuyor.

### 2.7 Yetim dosyalar

Yüklenip talebe bağlanmayan nesneler (başarısız gönderim, terk edilen form) için:

- **Tanım:** `cad-uploads` içinde, yolu hiçbir `rfqs.files`/`attachments` kaydında geçmeyen ve 24 saatten eski nesne.
- **Temizlik:** günlük zamanlanmış görev yalnız bu tanıma uyan nesneleri siler, silinenleri günlüğe yazar. Talebe bağlı hiçbir nesneye dokunmaz.
- Önce staging'de "kuru çalıştırma" (silmeden listeleme) ile doğrulanır.

### 2.8 E-posta

E-posta, satır kaydedildikten **sonra** gönderilir. E-posta başarısız olursa yanıt yine 201'dir, gövdede `"email": "failed"` bulunur; istemci "talebiniz kaydedildi, onay e-postası gönderilemedi" der ve talebi tekrar yazdırmaz. Bugün e-posta gönderilmediği için istemci bu dalı göstermiyor.

## 3. Migration taslağı (uygulanmadı, yalnız ileri yönlü)

```sql
-- forward-only; staging'de doğrulanmadan production'a uygulanmaz
alter table public.rfqs add column if not exists attachments jsonb;
alter table public.rfqs add constraint rfqs_attachments_is_array
  check (attachments is null or jsonb_typeof(attachments) = 'array');
create table if not exists public.rfq_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null default 0
);
```

## 4. Kabul testleri (sunucu hazır olduğunda, staging)

Model-only · PDF-only · model + 3 PDF · 2 model (400) · 4 PDF (400) · 51 MB dosya (413) · toplam 101 MB (413) · `.pdf` adlı PDF olmayan dosya (400) · Unicode dosya adı · revizyon farkı onayı · aynı `id` ile iki kez gönderim (tek satır, ikinci yanıt 201 + aynı satır) · yanıt kaybından sonra yeniden deneme · ikinci dosyada yükleme hatası ve yeniden deneme (yalnız eksik dosya) · 429 · başka talebin yolunu `files`'a yazma (400) · yetkisiz kullanıcının imzalı URL istemesi (403) · eski tek dosyalı satırın yönetim ekranında açılması.

İstemci tarafı bu senaryoların çoğunu ağ yanıtı taklit edilerek `e2e/p6-rfq-attachments.spec.ts` içinde koşar; bu, sunucu davranışının kanıtı değildir.
