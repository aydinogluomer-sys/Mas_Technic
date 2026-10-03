# Gerçek ölçüm kaydı şablonu (PROOF02, O04)

Durum: **kod hazır · veri BLOCKED_OWNER_DATA**. Sitede bugün gerçek ölçüm kaydı yok; `MEASURED_EVIDENCE_ENABLED = false` ve ölçüm paneli hiç çizilmiyor. Ana sayfadaki imza modülü **temsili** bir çizim okumasıdır ve kendini öyle tanımlar.

Bir kayıt ancak aşağıdaki alanların **hepsi** gerçek bir kaynak belgeden doldurulursa yayınlanır. Eksik alan doldurulmaz; kayıt reddedilir (`src/content/measured-evidence.ts` → `evidenceProblems`).

## Doldurulacak dosya

`measurement-record-template.csv` — her satır bir özelliğin (balon numarası) bir ölçümü. Örnek satır bilerek yarım bırakıldı: ölçülen değer, yöntem, cihaz, tarih, kaynak, izin ve gözden geçiren boş.

| Alan | Ne yazılır | Kontrol |
|---|---|---|
| `sampleId` | Ölçülen fiziksel numunenin kimliği (demo kupon seri no). **Müşteri parça numarası değil.** | boş olamaz |
| `drawingRevision` | Çizim numarası + revizyon (nominal ve limitler buradan) | boş olamaz |
| `featureId` | Çizimdeki balon numarası | boş olamaz |
| `feature` | Özelliğin adı (ör. "Ø28 delik") | boş olamaz |
| `nominal`, `lowerLimit`, `upperLimit` | Çizimdeki değerler, tek birimde | sayı; alt ≤ üst; nominal limitler içinde |
| `unit` | `mm`, `µm` veya `°` — üç değer için de aynı | yalnız bu üçü |
| `measuredValue` | Kaynak belgedeki değer, **olduğu gibi** | sayı |
| `method` | Nasıl ölçüldü (ör. "CMM, 3 nokta daire") | boş olamaz |
| `device` | Cihaz tipi + demirbaş/seri no | boş olamaz |
| `calibrationContext` | Gerekiyorsa kalibrasyon sertifikası no / tarihi; üçüncü taraf CMM ise hizmet sağlayıcının akreditasyonu | isteğe bağlı |
| `measurementDate` | `YYYY-MM-DD`, gerçek ve geçmiş bir tarih | takvimde var olmalı, gelecekte olmamalı |
| `sourceDocument` | Değerin kopyalandığı rapor (kimliği gizlenmiş kopya) | boş olamaz |
| `permissionRef` | Yayın izninin kaydı (kim, ne zaman, hangi kapsam) | boş olamaz |
| `technicalReviewer` | Kaydı kaynakla karşılaştıran kişi (rol ya da onaylı ad) | boş olamaz |

Uygunluk (`UYGUN`/`UYGUN DEĞİL`) yazılmaz: değer ve limitlerden hesaplanır (`withinLimits`), elle yazılan bir sonuç sayılarla çelişemez.

## Yayın adımları

1. CSV'yi kaynak belgeyle birlikte teslim edin (rapor PDF'i, kimlik bilgileri karartılmış).
2. Kayıt `MEASURED_EVIDENCE` dizisine eklenir; gözden geçiren kaynakla karşılaştırıp `verified: true` der.
3. `MEASURED_EVIDENCE_ENABLED = true`; `e2e/p5-proof-nexus-quality.spec.ts` kaydın kapıdan geçtiğini doğrular.
4. Kaynak belgeye izinli erişim (indirilebilir PDF) ayrı bir kararla eklenir.

**Şematik örnek hazırlamak bu maddeyi kapatmaz.** Gerçek kayıt gelene kadar PROOF02 `BLOCKED_OWNER_DATA`'dır.
