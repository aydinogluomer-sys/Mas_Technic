# İddia kaydı (claims register)

İzin, doğrulama ve public gösterim ayrı sütunlarda tutulur. `PUBLIC_OK` bir **izindir**, doğrulama değildir. Tam tarama T02'nin işi (2. paket). Bu ilk sürüm yalnız S00/M01 sırasında dokunulan veya §3'te adı geçen satırları içerir.

Sütunlar: id · rota/alan · mevcut metin · fact source · kapsam · izin kaynağı · doğrulama tarihi · doğrulama durumu · yayın kararı.

| id | Rota / alan | Mevcut metin | Fact source | Kapsam | İzin kaynağı | Doğrulama tarihi | Doğrulama | Yayın kararı |
|---|---|---|---|---|---|---|---|---|
| CERT-ISO9001 | `src/content/claims.ts` `CERTIFICATIONS`; SSS/FAQ cevapları | `ISO 9001:2015` | `USER_INPUTS.md` §C `ISO_9001_VALUE: VERIFIED` | Bilinmiyor (kapsam/issuer/geçerlilik belgesi yok) | `USER_INPUTS.md` §C `PUBLIC_OK` | — | Belge bekleniyor (O03) | Yayında kalır; yayın kabulü `BLOCKED_DATA` |
| CERT-ISO14001 | aynı | `ISO 14001:2015` | `USER_INPUTS.md` §C `VERIFIED` | Bilinmiyor | `USER_INPUTS.md` §C `PUBLIC_OK` | — | Belge bekleniyor (O03) | Yayında kalır; yayın kabulü `BLOCKED_DATA` |
| CERT-OHSAS18001 | `claims.ts` `CERTIFICATIONS`; `chatFaqData.ts:82`; `servicePages.ts` FAQ (1958, 2807, 2975) | `OHSAS 18001` | `USER_INPUTS.md` §C `OTHER_CERTIFICATIONS` | OHSAS 18001 standardı geri çekildi; güncel geçerliliği belgesiz | `USER_INPUTS.md` §C `PUBLIC_OK` (izin kaydı **değiştirilmez**) | — | Güncel geçerlilik doğrulanmadı | Sözleşme §3: aktif sertifika vitrininden çıkar (T02/UX03) — henüz uygulanmadı |
| CERT-ISO45001 | — | yok | — | — | — | — | — | Eklenmez (§3) |
| MAT-SCORE-MORPH | `/malzemeler` → `MaterialMorphScroll` `materialProps` | İşlenebilirlik 4/5, Korozyon 5/5, Mukavemet 4/5, Termal 3/5 | Kaynak yok (sabit kodlanmış örnek) | Hangi malzemeye ait olduğu belirsiz | — | — | Belgesiz | **M01 ile public'ten kaldırıldı** (component artık mount edilmiyor) |
| MAT-SCORE-TABLE | `/malzemeler` karşılaştırma + sıralama | `İşlenebilirlik n/5`, `Korozyon direnci n/5`, fiyat bandı sıralaması | `src/data/materialsData.ts` | Belgeli rubrik yok | — | — | Belgesiz | T03'te public'ten kalkacak (henüz yayında) |
| SLA-QUOTE | `QUOTE_RESPONSE_TIME` (claims.ts:218) | 1–3 iş günü | `USER_INPUTS.md` `QUOTE_SLA: 1-3 Days` | Teklif dönüş süresi | `PUBLIC_IF_VERIFIED_AND_STRATEGIC` | — | İşletme beyanı | Yayında (mevcut onaylı kaynak; RFQ03 aynı kaynağı kullanacak) |
| REF-PLATE-MALZEME | `/malzemeler` 04 PAFTA | `hero-malzeme-kutuphanesi.webp` | Mevcut site asset'i | Temsili görünüm | Mevcut kullanım (ServiceDetail hero'su) | — | Şirket fotoğrafı iddiası **yok** | Caption: `Temsili malzeme görünümü; …` |
