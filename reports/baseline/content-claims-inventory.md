# Phase 00 — Public Content Claims Inventory

**Base commit:** `6ffde20`
**Scope scanned:** `src/pages/**`, `src/components/**` (excluding `admin/`, `musteri/`,
`AdminDashboard`, `AdminLogin`, `MusteriPaneli`), `src/data/**`, `index.html`.
**Raw machine scan:** `reports/baseline/raw/claims-scan.txt` (1,105 pattern hits, produced by
`reports/baseline/tools/scan-claims.mjs`). This document is the curated classification of that scan.

**Cross-checked against:** `USER_INPUTS.md` §C (certifications), §D (KPI truth),
§F (customers), §G (case studies), §H (documents), plus §0 publication policy.

> **NOTHING WAS CHANGED IN THIS PHASE.** Every row below is a recording, not a fix.

## Status vocabulary

| Status | Meaning |
|---|---|
| `VERIFIED_PUBLIC_OK` | Backed by `USER_INPUTS.md` **and** marked publishable. |
| `VERIFIED_BUT_NOT_PUBLIC` | True per `USER_INPUTS.md` but visibility is `PRIVATE_DO_NOT_DISCLOSE` / not `PUBLIC_OK`. Must not be rendered. |
| `UNVERIFIED_MUST_REMOVE` | No backing in `USER_INPUTS.md`, or contradicted by it. Must be removed/neutralised, not softened. |
| `DEMO_PLACEHOLDER` | Explicitly self-labelled as demo/sample/representative in the UI. |

**Rendered-today marker:** ✅ = currently rendered on a live public route.
🟡 = rendered only on `/legacy-landing` or `/test` (preview-dev routes, still publicly crawlable).
💀 = dead code — component exists but is imported by nothing, so the claim is not currently painted.

---

## A. Certifications (`USER_INPUTS.md` §C)

Truth per §C: **ISO 9001 = VERIFIED / PUBLIC_OK**, **ISO 14001 = VERIFIED / PUBLIC_OK**,
**OHSAS 18001 = PUBLIC_OK**, **AS9100D = NONE / REMOVE_IF_UNVERIFIED**,
**IATF 16949 = NONE / REMOVE_IF_UNVERIFIED**. ISO 13485, NADCAP and NIST 800-171 appear
**nowhere** in `USER_INPUTS.md`.

| # | file:line | Rendered string (verbatim) | Type | Status |
|---|---|---|---|---|
| C1 | `src/data/technicalLandingData.ts:79` | `ISO 9001:2015` / `KALİTE YÖNETİM SİSTEMİ` | certification | ✅ `VERIFIED_PUBLIC_OK` |
| C2 | `src/data/technicalLandingData.ts:80` | `AS9100D` / `HAVACILIK KALİTE YÖNETİM SİSTEMİ` | certification | ✅ **`UNVERIFIED_MUST_REMOVE`** — §C says `AS9100D_VALUE: NONE`. Rendered on the landing quality band with a fake wet-signature SVG and an embossed notary seal (`FinalSections.tsx:120-132`). |
| C3 | `src/data/technicalLandingData.ts:81` | `ISO 14001:2015` / `ÇEVRE YÖNETİM SİSTEMİ` | certification | ✅ `VERIFIED_PUBLIC_OK` |
| C4 | `src/pages/Hakkimizda.tsx:22` | `ISO 9001:2015, AS9100D ve IATF 16949 sertifikalarına sahip üretim tesisimizde…` | certification | ✅ **`UNVERIFIED_MUST_REMOVE`** (AS9100D + IATF 16949 both `NONE`) |
| C5 | `src/pages/SSS.tsx:26` | `ISO 9001:2015, AS9100D, IATF 16949 ve ISO 14001 belgelerine sahibiz.` | certification | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| C6 | `src/pages/TeklifAl.tsx:1347` | `ISO 9001:2015` — `Sertifikalı kalite yönetim sistemi` | certification | ✅ `VERIFIED_PUBLIC_OK` |
| C7 | `src/data/chatFaqData.ts:53` | `ISO 9001:2015, AS9100D (havacılık), ISO 13485 (medikal) sertifikalarına sahibiz.` | certification | ✅ (ChatBot, all non-`/` routes) **`UNVERIFIED_MUST_REMOVE`** — ISO 13485 is not in `USER_INPUTS.md` at all. |
| C8 | `src/data/categoryPages.ts:86,130,141` | `ISO 9001, AS9100D sertifikalı…`, `AS9100D sertifikalı havacılık parça üretimi.`, `IATF 16949 sertifikalı otomotiv parça üretimi.` | certification | ✅ (`/hizmetler/kategori/*`, `/endustriyel/kategori/*`) **`UNVERIFIED_MUST_REMOVE`** |
| C9 | `src/data/servicePages.ts:1689` | `ISO 9001:2015 (TÜV SÜD), AS9100D (SGS), IATF 16949 (Bureau Veritas), ISO 13485 (TÜV SÜD) ve ISO 14001 (SGS) sertifikalarımız bulunmaktadır.` | certification | ✅ (`/kabiliyetler/kalite-kontrol`) **`UNVERIFIED_MUST_REMOVE`** — names four certificates that do not exist plus **named certification bodies** that `USER_INPUTS.md` never supplies. Highest-severity fabrication found. |
| C10 | `src/data/servicePages.ts:2360-2416` | `AS9100D Rev D sertifikalı`, `NADCAP akreditasyonlu özel prosesler`, `{ label: "Sertifika", value: "AS9100D Rev D" }`, `Yıllık gözetim denetimlerimiz aktif olarak sürdürülmektedir.` | certification | ✅ (`/endustriyel/havacilik-uzay`) **`UNVERIFIED_MUST_REMOVE`** |
| C11 | `src/data/servicePages.ts:2537-2581` | `IATF 16949:2016 sertifikalı`, `PPAP Level 5`, `Cpk ≥1.67`, `50K+ adet/ay kapasite` | certification + KPI | ✅ (`/endustriyel/otomotiv`) **`UNVERIFIED_MUST_REMOVE`** |
| C12 | `src/data/servicePages.ts:239,290,311,314,1558` | `AS9100/ISO 13485 uyumlu ölçüm raporları`, `AS9100D`, `IATF 16949` in capability tables | certification | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| C13 | `index.html:9` (meta description) | `…ISO 9001, AS9100D sertifikalı proses kontrollü üretim…` | certification | ✅ **on every route + in search results** **`UNVERIFIED_MUST_REMOVE`** |
| C14 | `index.html:15` (meta keywords) | `…ISO 9001, AS9100D…` | certification | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| C15 | `src/components/CertificationsSection.tsx:7-29` | `ISO 9001:2015`, `AS9100D`, `IATF 16949`, `ISO 13485`, **`NIST 800-171` — "Siber Güvenlik Uyumu"** | certification + security | 💀 **`UNVERIFIED_MUST_REMOVE`** — dead code (imported by nothing), but a fabricated *security-compliance* claim must not survive in the repo. |
| C16 | `src/components/FAQBlogSection.tsx:30` | `ISO 9001:2015, AS9100D, IATF 16949 ve ISO 14001 belgelerine sahibiz.` | certification | 💀 `UNVERIFIED_MUST_REMOVE` |
| C17 | `src/components/IndustriesSection.tsx:37,49` | `AS9100D sertifikalı havacılık parçaları…`, `IATF 16949 kalite standartlarında…` | certification | 💀 `UNVERIFIED_MUST_REMOVE` |
| C18 | `src/components/CNCScrollStory.tsx:19` | `Ti-6Al-4V. AS9100D.` | certification | 💀 `UNVERIFIED_MUST_REMOVE` |
| C19 | `src/components/HeroSection.tsx:22` | `["ISO 9001", "rev J · 2025·11"]` | certification | 💀 `UNVERIFIED_MUST_REMOVE` — the revision/date suffix is invented. |
| C20 | `src/components/WhyUsSection.tsx:27` | `ISO 14001 uyumlu çevresel yönetim…` | certification | 💀 `VERIFIED_PUBLIC_OK` in substance (ISO 14001 is verified) but the component is dead code. |
| C21 | — | **OHSAS 18001** (`USER_INPUTS.md` §C: `PUBLIC_OK`) | certification | **Absent from the entire site.** A publishable, verified certification is simply not shown. |

**Certification summary:** ISO 9001 and ISO 14001 are the only defensible claims. AS9100D
appears in at least **14 distinct locations**, IATF 16949 in at least **8**, ISO 13485 in **5**,
and NADCAP / NIST 800-171 once each — none of them verified.

## B. Tolerance and capability KPIs (`USER_INPUTS.md` §D)

Truth per §D: `MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm`, `QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days`,
`MATERIAL_COUNT_INTERNAL: UNKNOWN_REMOVE_IF_UNVERIFIED` + `PRIVATE_DO_NOT_DISCLOSE`,
`CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND`, `ON_TIME_DELIVERY_INTERNAL: 95%`,
`TEAM_SIZE` / `MACHINE_COUNT` / `FACILITY_SIZE` / `REVENUE`: all `PRIVATE_DO_NOT_DISCLOSE`.

| # | file:line | Rendered string | Type | Status |
|---|---|---|---|---|
| K1 | `src/data/technicalLandingData.ts:4` | `±0.005 mm` / `TOLERANS` (landing proof strip) | tolerance | ✅ **`UNVERIFIED_MUST_REMOVE`** — §D verified floor is **±0.01 mm**. The site claims twice the capability. |
| K2 | `src/data/technicalLandingData.ts:5` | `48 SAAT` / `TEKLİF SÜRESİ` | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — §D and §J both say **`1-3 Days`**. 48 h is a narrower promise than the verified SLA. |
| K3 | `src/data/technicalLandingData.ts:6` | `50+` / `MALZEME` | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — §D `MATERIAL_COUNT_INTERNAL: UNKNOWN_REMOVE_IF_UNVERIFIED`, visibility `PRIVATE_DO_NOT_DISCLOSE`. |
| K4 | `src/data/technicalLandingData.ts:7` | `%100` / `CMM RAPORU` | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — §D says CMM coverage is `THIRD_PARTY_ACCREDITED_ON_DEMAND`, i.e. **on demand**, not 100 %. |
| K5 | `src/data/technicalLandingData.ts:8` | `İZLENEBİLİR` / `ÜRETİM` | other | ✅ Non-numeric capability statement. Consistent with §0 `PUBLIC_POSITIONING_PRIORITY` (traceability). Keep. |
| K6 | `src/data/technicalLandingData.ts:9` | `%98` / `ZAMANINDA TESLİMAT` | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — §D verified value is **95 %**. Publishing 98 % is an inflated number. |
| K7 | `src/data/technicalLandingData.ts:23` | `["TOLERANS", "±0.005 mm"]` in `heroPartFacts` | tolerance | ✅ `DEMO_PLACEHOLDER` — the passport is labelled `GÖRSEL / TEMSİLÎ PARÇA` (`TechnicalHero.tsx:133`), but the number still reads as a capability claim above the fold. |
| K8 | `src/components/technical-landing/TechnicalHero.tsx:91,93` | `Ø 28.000 ±0.005`, `72.000 / ±0.010`, `Ra 0.4 µm` | tolerance/measurement | ✅ `DEMO_PLACEHOLDER` (same disclaimer) but ±0.005 again exceeds the verified floor. |
| K9 | `src/data/technicalLandingData.ts:96` | `Hedef aralığımız ±0.005 mm olup her proje teknik incelemeden sonra doğrulanır.` (FAQ) | tolerance | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| K10 | `src/data/technicalLandingData.ts:98` | `Standart teklif dönüş süremiz 48 saattir.` (FAQ) | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — contradicts §J `QUOTE_SLA: 1-3 Days`. |
| K11 | `src/data/technicalLandingData.ts:33` | `%100 CMM Kontrol` (process step 04) | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| K12 | `src/pages/Hakkimizda.tsx:22` | `…CMM ölçüm sistemleri ile ±0.005mm hassasiyette üretim gerçekleştiriyoruz.` | tolerance | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| K13 | `src/pages/Hakkimizda.tsx:29` | `Ekip` — `50+ deneyimli mühendis ve teknisyenden oluşan uzman kadro` | KPI (team size) | ✅ **`VERIFIED_BUT_NOT_PUBLIC` → must be removed.** §D `TEAM_SIZE_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE` and §0 `DO_NOT_PUBLISH_TEAM_SIZE_BY_DEFAULT: YES`. The number itself is also unverified. |
| K14 | `src/pages/Hakkimizda.tsx:28` | `Vizyon` — `Avrupa'nın önde gelen hassas işleme merkezlerinden biri olmak` | other | ✅ Aspirational, not factual. Borderline; flag for Phase 06 tone review. |
| K15 | `src/pages/TeklifAl.tsx:1348` | `CMM Ölçüm` — `±0.005 mm hassasiyetinde 3D koordinat ölçümü` | tolerance | ✅ **`UNVERIFIED_MUST_REMOVE`** |
| K16 | `src/pages/TeklifAl.tsx:1349` | `Malzeme Sertifikası` — `Her sipariş için malzeme test raporu` | document | ✅ **`UNVERIFIED_MUST_REMOVE`** — "her sipariş için" is an unconditional guarantee with no backing. |
| K17 | `src/data/servicePages.ts:1439-1481` | `50+ Tezgah`, `15.000 m² üretim alanında 50+ CNC tezgah ile 24/7 üretim kapasitesi`, `{ label: "Toplam Tezgah", value: "50+" }` | facility/machine scale | ✅ **`VERIFIED_BUT_NOT_PUBLIC` + `UNVERIFIED_MUST_REMOVE`.** §D marks `MACHINE_COUNT` and `FACILITY_SIZE` `PRIVATE_DO_NOT_DISCLOSE`; §0 sets `DO_NOT_EMPHASIZE_COMPANY_SCALE: YES`. The specific figures are also unverified. |
| K18 | `src/data/servicePages.ts:2278,2308,2320-2323` | `Genel OEE ortalamamız %77.5'tir: %86 kullanım, %91 performans, %98.5 kalite`, per-machine OEE table naming `DMG DMU 65` and `Mazak QT 350` | KPI + machine inventory | ✅ **`UNVERIFIED_MUST_REMOVE`** — fabricated operational metrics down to two decimal places, plus named machine models. |
| K19 | `src/data/servicePages.ts:1637` | `Zeiss CMM, GOM 3D tarayıcı, Taylor Hobson profilometre ve X-Ray muayene ile %99.7 kalite oranı.` | measurement equipment + KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — named metrology brands. Note `USER_INPUTS.md` §H **does** supply a real `Politikalar/Ölçüm Ekipmanları.pdf` (`PUBLIC_OK`); the site invents equipment instead of citing it. |
| K20 | `src/data/chatFaqData.ts:43,58` | `…daha 50+ malzeme ile çalışıyoruz`, `Standart ±0.01mm, hassas işlemede ±0.005mm, mikro işlemede ±0.001mm` | KPI + tolerance | ✅ (ChatBot) **`UNVERIFIED_MUST_REMOVE`** — the `±0.01mm` figure alone matches §D. |
| K21 | `index.html:9` | `…±0.01mm hassasiyet…` | tolerance | ✅ **`VERIFIED_PUBLIC_OK`** — ironically the meta description is the *only* place carrying the correct ±0.01 mm figure, while the visible site says ±0.005. |
| K22 | `src/data/servicePages.ts` (≈120 further rows) | `±0.005mm`, `±0.003mm`, `±0.001mm`, `Cpk`, `H7/h6` capability tables | tolerance | ✅ `UNVERIFIED_MUST_REMOVE` in bulk. See `raw/claims-scan.txt` → `## TOLERANCE (209)`. |
| K23 | 🟡 `src/components/landing/ProcessProofCinema.tsx:362` | `±0.005 mm` — `hedef hassasiyet` | tolerance | 🟡 `UNVERIFIED_MUST_REMOVE` |
| K24 | 🟡 `src/components/LandingFlow.tsx:54` | `±0.005 mm tolerans` (industry card meta) | tolerance | 🟡 `UNVERIFIED_MUST_REMOVE` |
| K25 | 💀 `src/components/HeroSection.tsx:21,111,137` | `["48s SLA", "%98.4"]`, `± 0.005 mm`, `48 saatte teklif al` | KPI | 💀 `UNVERIFIED_MUST_REMOVE` |
| K26 | 💀 `src/components/QuickQuoteSection.tsx:86,263,265` | `48 saat içinde detaylı teklif`, `±0.005 / mm Tolerans`, `50+ / Malzeme` | KPI | 💀 `UNVERIFIED_MUST_REMOVE` |
| K27 | 💀 `src/components/CapabilitiesSection.tsx:13,18` | `±0.005 mm` + `Sodick ALC600G` machine model, work envelope `600 × 400 × 350` | machine inventory | 💀 `UNVERIFIED_MUST_REMOVE` |
| K28 | 💀 `src/components/ProjectShowcase.tsx:15,39,55` | `AS9100 sertifikalı üretim hattında 1200+ türbin kanadı üretimi. ±0.003mm tolerans.`, `350+ bar test` | case-study | 💀 `UNVERIFIED_MUST_REMOVE` — §G `CASE_STUDIES: NONE_PROVIDED_YET`. |
| K29 | 💀 `src/components/HowWeWorkSection.tsx:63` (🟡 via `/test`) | `±0.005` / `mm Tolerans` | tolerance | 🟡 `UNVERIFIED_MUST_REMOVE` |
| K30 | 💀 `src/components/ui/CrosshairOverlay.tsx:70` | `±0.005mm` | tolerance | 💀 `UNVERIFIED_MUST_REMOVE` |

## C. Customer / reference names (`USER_INPUTS.md` §F)

Truth per §F: HPT, TAAC, METSAN, TEKNIK_BALANS, AKON_HIDROLIK, TEKNOPAR = `PUBLIC_OK`.
**ZTM = `REMOVE_IF_UNVERIFIED`.**

| # | file:line | Rendered string | Type | Status |
|---|---|---|---|---|
| R1 | `src/data/technicalLandingData.ts:86` | `HPT` | customer-reference | ✅ `VERIFIED_PUBLIC_OK` |
| R2 | `src/data/technicalLandingData.ts:87` | `TAAC` | customer-reference | ✅ `VERIFIED_PUBLIC_OK` |
| R3 | `src/data/technicalLandingData.ts:88` | `METSAN` | customer-reference | ✅ `VERIFIED_PUBLIC_OK` |
| R4 | `src/data/technicalLandingData.ts:89` | `ZTM` | customer-reference | ✅ **`UNVERIFIED_MUST_REMOVE`** — §F marks ZTM `REMOVE_IF_UNVERIFIED`. |
| R5 | `src/data/technicalLandingData.ts:90` | `TEKNİK BALANS` | customer-reference | ✅ `VERIFIED_PUBLIC_OK` |
| R6 | `src/data/technicalLandingData.ts:91` | `AKON HİDROLİK` | customer-reference | ✅ `VERIFIED_PUBLIC_OK` |
| R7 | — | `TEKNOPAR` (§F `OTHER_REFERENCES`, `PUBLIC_OK`) | customer-reference | **Absent.** A permitted reference is missing. |
| R8 | 💀 `src/components/TestimonialsSection.tsx` | testimonial component exists | testimonial | 💀 Dead code. Must not be revived: §G supplies no testimonials. |

## D. Case-study / measurement evidence (`USER_INPUTS.md` §G)

§G: `CASE_STUDIES: NONE_PROVIDED_YET`, `DEFAULT_CASE_STUDY_VISIBILITY: ANONYMIZE`,
`IF_NONE: REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT`.

| # | file:line | Rendered string | Type | Status |
|---|---|---|---|---|
| P1 | `src/data/technicalLandingData.ts:54-76` | Three "measured projects" with nominal/measured/`UYGUN` tables, e.g. `AERO HOUSING` / `Ti-6Al-4V` / `RAPOR NO: MT-2024-0512`, `⌀62.000 H7 → 62.008 → UYGUN` | measurement + case-study | ✅ `DEMO_PLACEHOLDER` — band carries `status="sample"` → `ÖRNEK İÇERİK` badge (`TechnicalSectionFrame.tsx:7`) and `ProcessNexusProjects.tsx:135` prints `ÖLÇÜM DEĞERLERİ TEMSİLÎDİR · GERÇEK RAPOR DEĞİLDİR`. Honest, but §G says to **remove** fake project evidence rather than label it. Owner: Phase 06. |
| P2 | `src/data/technicalLandingData.ts:26` | `["RAPOR NO", "MT-2024-04518"]` | document | ✅ `DEMO_PLACEHOLDER` (invented report number) |
| P3 | `src/components/technical-landing/FinalSections.tsx:135-136` | `CMM ÖLÇÜM RAPORU` / `MT-2024-04518` with a decorative document mock | document | ✅ `DEMO_PLACEHOLDER` (band `status="sample"`) |
| P4 | `src/components/technical-landing/FinalSections.tsx:149-150` | `MALZEME SERTİFİKASI` / `EN 10204 3.1` with a fake `3.1` grade badge | document | ✅ `DEMO_PLACEHOLDER` |
| P5 | `src/data/technicalLandingData.ts:39-52` | NEXUS portal KPIs (`12` aktif sipariş, `7` üretimde, `126` toplam parça, `%98.7` başarı) and six invented order rows (`MT-2024-0512 · Bracket · 7075-T651 …`) | KPI + customer data | ✅ `DEMO_PLACEHOLDER` — band `status="demo"` → `DEMO İÇERİK` badge. The invented operator name `Ö. YILMAZ / Kalite Yöneticisi` (`ProcessNexusProjects.tsx:78`) is a fabricated person. |
| P6 | `src/components/technical-landing/FinalSections.tsx:329` | `ÇİZEN: MAS TECHNIC · ÖLÇEK: 1:1 · TARİH: 17.05.2024 · REVİZYON: B · PAFTA: 01/12` | other | ✅ Decorative drawing-sheet metadata presented as fact. Low risk, but it is an invented revision/date. |
| P7 | `src/data/blogData.ts:32,52,71,90,109` + `src/pages/Blog.tsx:42,169,200` | Per-post view counts `3.420`, `2.890`, `1.560`, `2.100`, `1.870` and an aggregate `14.2K TOPLAM OKUMA` / `BLOG İSTATİSTİKLERİ` panel | KPI | ✅ **`UNVERIFIED_MUST_REMOVE`** — hardcoded fake analytics rendered with an eye icon as if measured. `USER_INPUTS.md` §K: `ANALYTICS_PROVIDER: NONE`, so no view count can exist. |

## E. Documents / downloads (`USER_INPUTS.md` §H)

§H supplies four **real, `PUBLIC_OK`** PDFs in `Politikalar/`: Kalite Politikası,
Ölçüm Ekipmanları, Paketleme Kılavuzu, Tedarikçi Davranış Kuralları.

| # | file:line | Rendered string | Type | Status |
|---|---|---|---|---|
| D1 | `src/data/technicalLandingData.ts:101-106` | `KALİTE POLİTİKAMIZ · PDF · 1.2 MB`, `ÖLÇÜM CİHAZLARI LİSTESİ · PDF · 1.4 MB`, `PAKETLEME STANDARTLARIMIZ · PDF · 1.0 MB`, `TEDARİKÇİ DAVRANIŞ KURALLARI · PDF · 1.5 MB` | document/download | ✅ **Mixed.** The four documents are real and publishable (§H) — but they are rendered as `<li>` with a download arrow and **no `href`** (`FinalSections.tsx:226`), under a `KAYNAKLAR HAZIRLANIYOR` heading (`:223`). The **file sizes are invented**: no PDF is served from `public/`, and the real files live outside the build. → sizes = `UNVERIFIED_MUST_REMOVE`; the documents themselves = `VERIFIED_PUBLIC_OK` and should be wired up in Phase 06/08. |
| D2 | `src/components/technical-landing/FinalSections.tsx:160-168` | `RAPORU DOĞRULA` + decorative QR + `QR kodu okutunuz` + `DOĞRULAMA SERVİSİ HAZIRLANIYOR` | verification | ✅ `DEMO_PLACEHOLDER` — the QR is a seeded-LCG texture (`:65-78`), not a scannable code. Honestly labelled, but it advertises a verification service that does not exist. |
| D3 | `src/components/technical-landing/FinalSections.tsx:170-186` | `QUALITY ASSURED` circular stamp reading `MAS TECHNIC / ASSURED` | verification | ✅ **`UNVERIFIED_MUST_REMOVE`** — a self-issued "assured" seal is a quality attestation with no issuing body. `aria-hidden` but visually prominent. |

## F. Explicit demo / placeholder badges already in the UI

| # | file:line | String | Note |
|---|---|---|---|
| B1 | `src/components/technical-landing/TechnicalSectionFrame.tsx:6` | `DEMO İÇERİK` | Applied to band 06 NEXUS (`status="demo"`). |
| B2 | `TechnicalSectionFrame.tsx:7` | `ÖRNEK İÇERİK` | Applied to bands 07 (projects) and 10 (quality file). |
| B3 | `TechnicalSectionFrame.tsx:8` | `DOĞRULANMIŞ` | Defined but **never used** — no band sets `status="verified"`. |
| B4 | `FinalSections.tsx:167` | `DOĞRULAMA SERVİSİ HAZIRLANIYOR` | Verification service placeholder. |
| B5 | `FinalSections.tsx:223` | `KAYNAKLAR HAZIRLANIYOR` | Downloads placeholder. |
| B6 | `ProcessNexusProjects.tsx:135` | `ÖLÇÜM DEĞERLERİ TEMSİLÎDİR · GERÇEK RAPOR DEĞİLDİR` | Project-table disclaimer. |
| B7 | `TechnicalHero.tsx:133` | `GÖRSEL / TEMSİLÎ PARÇA` | Hero part disclaimer. |
| B8 | `ProofStrip.tsx:16` | `Gösterilen değerler proje kapsamı, malzeme ve teknik resim gereksinimlerine göre doğrulanır.` | A softening note under six numbers that are themselves unverified — it does not make ±0.005 / %98 true. |

**Total explicit placeholder affordances currently shipped: 8** (7 distinct strings + the unused
`DOĞRULANMIŞ` label). The landing is visibly a *demo* to any careful reader — three separate bands
carry a badge saying so. Owner: Phase 06 (IDs 163–192, 467–473, 625–636, 637–653).

## G. Language / EN toggle

| # | file:line | String | Status |
|---|---|---|---|
| L1 | `src/components/technical-landing/TechnicalHeader.tsx:57-58` | `TR / EN`, with `EN` inert and `title="İngilizce sürüm hazırlanıyor"` | ✅ Honest-but-misleading. `USER_INPUTS.md` §B `ENGLISH_LIVE_NOW: NO`. A dead EN affordance in the header advertises a language that does not exist. Owner: Phase 03/11. |
| L2 | `src/components/JsonLdSchema.tsx:95` | `availableLanguage: ["Turkish", "English"]` | ✅ **`UNVERIFIED_MUST_REMOVE`** — structured data tells search engines the business supports English contact. §B says `ENGLISH_LIVE_NOW: NO`. Owner: Phase 11. |

## H. Contact / identity facts

| # | file:line | String | Status |
|---|---|---|---|
| I1 | `FinalSections.tsx:304-305` | `Ataşehir Mah., 8287. Sok.` / `No: 4, 35620 Çiğli / İZMİR` | ✅ `VERIFIED_PUBLIC_OK` (§A, `PUBLIC_SUPPORTING`) |
| I2 | `FinalSections.tsx:306` | `+90 (536) 564 51 94` | ✅ `VERIFIED_PUBLIC_OK` (§A) |
| I3 | `FinalSections.tsx:307` | `sales@mastechnic.com` | ✅ `VERIFIED_PUBLIC_OK` (§A) |
| I4 | `FinalSections.tsx:324` | LinkedIn `https://www.linkedin.com/company/mas-technic` | ✅ `VERIFIED_PUBLIC_OK` in principle (§L `LINKEDIN: PUBLIC_OK`) — the **URL itself is unverified**; §L gives permission, not a handle. |
| I5 | `FinalSections.tsx:325` | Instagram `https://www.instagram.com/mastechnic` | ✅ **`UNVERIFIED_MUST_REMOVE`** — §L `INSTAGRAM: NONE`. |
| I6 | `FinalSections.tsx:326` | YouTube `https://www.youtube.com/@mastechnic` | ✅ **`UNVERIFIED_MUST_REMOVE`** — §L `YOUTUBE: NONE`. |
| I7 | `index.html:38` | `<meta name="twitter:site" content="@MasTechnic">` | ✅ **`UNVERIFIED_MUST_REMOVE`** — §L `X_TWITTER: NONE`. |
| I8 | `index.html:19` | `<meta name="geo.placename" content="İstanbul">` | ✅ **`UNVERIFIED_MUST_REMOVE`** — §A `PUBLIC_CITY: İzmir`. Directly contradicts the footer and the JSON-LD (`JsonLdSchema.tsx:88` `addressLocality: "İzmir"`). |
| I9 | `src/components/LiveClock.tsx:10,32` via `src/components/footer/FooterBottomBar.tsx:17` (visible as `IST 05:20:10` in `visual/hakkimizda-1440.png`) | `IST hh:mm:ss` | ✅ `other` — **not factually false**: `Europe/Istanbul` is the correct IANA zone for all of Türkiye. But the rendered label `IST` reads as an İstanbul location and, combined with `index.html:19` `geo.placename = İstanbul`, reinforces the İzmir↔İstanbul conflict. Wording decision for Phase 06/11, not a truth violation. |
| I10 | `index.html:17,22` | canonical + `og:url` = `https://mas-technic-precision.lovable.app/` | ✅ **`UNVERIFIED_MUST_REMOVE`** — §A `PRODUCTION_DOMAIN: https://www.masmare.com`. Owner: Phase 11. |
| I11 | `index.html:32,46` | `og:image` / `twitter:image` on a `pub-….r2.dev/…lovable.app-1771685445710.png` URL | ✅ `UNVERIFIED_MUST_REMOVE` — social preview points at a third-party Lovable screenshot host. |

## I. RFQ / upload claims (`USER_INPUTS.md` §J)

| # | file:line | String | Status |
|---|---|---|---|
| Q1 | `src/utils/cadUpload.ts:5` → `src/hooks/useCadHandoff.ts:16` → landing `CAD_FORMAT_HINT`; also `src/pages/TeklifAl.tsx:638` | `STEP, STP, STL, OBJ, IGES, IGS, 3MF · Maks. 50 MB` | ✅ `VERIFIED_PUBLIC_OK` **with caveat** — §J says `DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION` / `DERIVE_FROM_BACKEND_OR_SHOW_NO_UNVERIFIED_LIMIT`, and this string is genuinely derived from `CAD_MAX_FILE_SIZE`. Whether the Supabase bucket enforces 50 MB is **unverified**; Phase 09 must confirm the server-side limit or drop the number. |
| Q2 | `src/data/technicalLandingData.ts:95` | `STEP, STP, IGES, STL, OBJ, DWG ve PDF teknik resimlerini teklif akışında yükleyebilirsiniz.` | ✅ **`UNVERIFIED_MUST_REMOVE` (partial)** — the FAQ advertises `DWG` and `PDF`, which are **not** in `CAD_ACCEPTED_EXTENSIONS`, and omits `3MF`. The copy contradicts the implementation. |
| Q3 | `USER_INPUTS.md` §J | `NDA_AVAILABLE: NO`, `CONFIDENTIALITY_TEXT_APPROVED: NO`, `CAD_RETENTION_PERIOD: UNKNOWN`, `CAD_DELETE_REQUEST_PROCESS: UNKNOWN` | No NDA/confidentiality/retention promise was found in the scanned public copy — **correct by omission**. Phase 09 must not add one. |

---

## Totals

| Status | Count of catalogued rows |
|---|---|
| `VERIFIED_PUBLIC_OK` | 10 (C1, C3, C6, K5, K21, R1, R2, R3, R5, R6, I1–I3 counted as one identity group, Q1 with caveat) |
| `VERIFIED_BUT_NOT_PUBLIC` | 2 (K13 team size, K17 facility/machine scale) |
| `UNVERIFIED_MUST_REMOVE` | 41 catalogued rows, covering **hundreds** of individual strings once `src/data/servicePages.ts` (175 kB) is expanded — see `raw/claims-scan.txt` |
| `DEMO_PLACEHOLDER` | 8 (K7, K8, P1–P5, D2) |
| Permitted-but-missing | 2 (OHSAS 18001, TEKNOPAR) |

**Single largest liability:** `src/data/servicePages.ts` — a 175 kB data file that fabricates
certifications, certification bodies, machine models, facility area, OEE percentages, PPAP levels,
NADCAP accreditation and monthly capacity across every `/hizmetler/*`, `/kabiliyetler/*` and
`/endustriyel/*` route. Owner: Phase 06 (163–192, 467–473) with Phase 07/08 page rewrites.
