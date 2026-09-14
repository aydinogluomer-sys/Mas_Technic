# Phase 10-3 — Alt text

Base commit `2d29f44` (head of `claude/awwwards-90-overhaul` at dispatch). Requirement IDs 239–257
(imagery — "meaningful alt text for content images and empty alt for decorative images"), 372–390
(a11y — image text alternatives). Surface list: `reports/10/asset-inventory.md` §1, re-audited on
the *current* tree because 10-2b replaced or cropped eleven heroes after that inventory was
written. Proof: `reports/10/probes/alt-probe.mjs`, a rendered-DOM probe over all 99 public
routes at 1280×800 (plus 375×812 for the two routes whose image set depends on the viewport),
output in `reports/10/probes/alt-probe.md` / `.json`.

## 0. Summary

| Metric | Before (`2d29f44`) | After |
|---|---|---|
| `<img>` rows rendered over the 99 public routes at 1280 | 69 (11 landing + 7 blog + 3 profile + 48 plates) | 69 (same elements, same boxes) |
| Rows whose alt **equals the route's `<h1>`** | 48 (`alt={page.title}` on every service / capability / sector plate; the plate's *nearest* heading is the band's `<h2>` *Kapsam* / *Bu sektörde ne üretiyoruz*, so the probe tests both) | 0 |
| Rows whose alt **equals their own figcaption** | 3 (`/kabiliyet-profilleri/*`) | 0 |
| Rows whose alt **repeats visible adjacent text** without describing the frame | 5 (3 landing profile tiles under the `<h3>` that names the part; manifesto ground under "ÖLÇÜLÜR."; `/malzemeler` still under the "Malzeme Dönüşümü" eyebrow — mobile) | 0 |
| Data alts that described something **not in the picture** | 2 (`blog-dfm` "CAD screen" — there is none; `blog-malzeme` "aluminium and titanium" — four unlabelled slugs) | 0 |
| Data alts that asserted a **material** the render cannot show | 2 (`titanyum`, `alüminyum`) | 0 |
| Content images with `alt=""` | 0 | 0 |
| `<img>` without an `alt` attribute | 0 | 0 |
| Pixels moved | — | none: every change is an `alt` string or a `width`/`height` attribute on an image whose box is fixed by CSS and whose aspect is unchanged (§5); goldens unchanged (§6) |

## 1. The standard, as applied

1. **Content** — the picture conveys something the adjacent text does not. Alt describes what is
   *shown* (subject, operation, finish), in Turkish, ≤ ~125 characters, no page title, no
   "image of", no keyword list, and no material the photograph cannot itself establish.
2. **Decorative** — mood or backdrop, or redundant with an adjacent heading or caption. `alt=""`.
   A hero that sits directly under a headline naming its own subject is decorative by this rule:
   the milling spindle under *CNC Frezeleme* tells a screen-reader user nothing the `<h1>` did not.
3. Nothing echoes the adjacent heading, and where a `<figure>` prints a `<figcaption>` the alt
   never repeats it.

`role="presentation"` was not needed anywhere: every decorative surface is already an `<img>`
(`alt=""` is the complete signal) or is inside an `aria-hidden="true"` wrapper.

## 2. Every image on every public route

"Nearest heading" is what the probe measured: the closest ancestor that contains an `h1–h6`, and
inside it the heading nearest in document order. `h1` is the route's page title where that differs.

### 2.1 `/` — landing (11 `<img>` at 1280; the manifesto swaps its source below 768)

| # | Band | File (current tree) | Class | Before | After | Reason |
|---|---|---|---|---|---|---|
| 1 | 02 hero, `.tl-part-frame` (LCP) | `technical-landing/hero-manifold-v1` 1672×941 | **content** | `Koyu bir ölçüm masası üzerindeki hassas işlenmiş metal hidrolik manifold` | unchanged | The `<h1>` is *HAM GEOMETRİDEN DOĞRULANMIŞ HASSASİYETE*; the part the dimension leaders point at is not named anywhere in text. Describes the frame. |
| 2 | 05 process, `<figure>` beside the intro | `hero-cnc-frezeleme` 1600×896 | **content** | `CNC tezgâhında işlenen metal parça` | `Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım` | Heading is *Karardan parçaya, kanıtla ilerleyen üretim.* and the steps are DFM / production / inspection / delivery — nothing says what is in the frame. Old alt was a generic noun phrase; new one names the operation shown. |
| 3 | 07 profiles, featured tile | `industry-defense` 1200×1200 (640/960 ladder) | **decorative** | `İnce cidarlı işlenmiş metal gövde parçası` | `""` | Sits over `<h3>İNCE CİDARLI GÖVDE — Alüminyum 6061-T6 / 7075-T6</h3>`; the render illustrates the part family the heading names. Alt repeated the heading's subject. |
| 4 | 07 profiles, tile | `industry-medical` 1200×1200 | **decorative** | `Hassas işlenmiş titanyum bağlantı parçası` | `""` | Over `<h3>TİTANYUM BAĞLANTI PARÇASI — Ti-6Al-4V</h3>`; same rule. The old alt also asserted titanium of a stock render. |
| 5 | 07 profiles, tile | `hero-cnc-tornalama` 900×504 | **decorative** | `CNC tornada işlenmiş hassas mil` | `""` | Over `<h3>HASSAS MİL — 42CrMo4</h3>`; alt was the heading reworded. |
| 6–9 | 08 sectors, four cards | `industry-aerospace`, `industry-defense`, `industry-medical` 1200×1200; `industry-hydraulic` **750×750** | **decorative** | `""` | `""` (width/height now per asset, §5) | Each card is a link whose `<h3>` is the sector name; the picture is the card's ground. Already correct. |
| 10 | 09 manifesto ground | `hero-tolerans-hassasiyet` 2400×1343 (`<picture>`: `-portrait` 800×1342 below 768) | **decorative** | `Kumpasla ölçülen hassas işlenmiş metal parça` | `""` | Full-band image behind a 97 %-opaque scrim under *HASSASİYET İDDİA EDİLMEZ. ÖLÇÜLÜR.* — a caliper on a pin is the headline drawn, not new information. Both `<source>` and `<img>` share the one alt. |
| 11 | 10 quality file, `.tl-mini-doc` | `technical-landing/hero-manifold-v1` at 56×56 | **decorative** | `""` (inside `aria-hidden="true"`) | unchanged | A thumbnail inside a mock document that is itself hidden from AT. |

### 2.2 `/blog` and `/blog/:slug` — 7 plates, all **content**

Every blog plate is a `ShellPlate`: `<figure>` → `<img>` + `<figcaption>` (`PLAKA 01` + an
interpretive caption from `imageCaption`). The alt describes the frame; the caption says why it is
there; the two never coincide. Source field: `src/data/blogData.ts` `imageAlt`.

| Route(s) | File | Before | After | Reason |
|---|---|---|---|---|
| `/blog` lead plate (nearest heading `<h2>` *5 Eksen CNC İşleme Avantajları*), `/blog/5-eksen-cnc-isleme-avantajlari` (nearest `<h2>` *Beş eksen ne demek*) | `blog-5eksen` 1600×896 | `Beş eksenli işleme merkezinde bağlanmış alüminyum parça ve kesici takım` | `İş milindeki kesici takım, soğutma sıvısı altında parlak metal bir gövdenin eğik yüzeyini işlerken` | "Beş eksenli" echoed the post title and is not visible (axis count is not in a photograph); "alüminyum" is a guess about a render. The frame shows a spindle tool cutting an angled face under coolant. Caption: *Tek bağlamada birden fazla yüzeye erişen kesici takım*. |
| `/blog/havacilik-parcalarinda-malzeme-secimi` | `blog-malzeme` 1600×896 | `Yan yana duran işlenmiş alüminyum ve titanyum numuneler` | `Siyah zemin üzerinde yan yana dört silindirik metal numune; uç yüzleri kesilmiş, taşlanmış ve fırçalanmış` | The picture is four unlabelled slugs with different end finishes; nothing in it says which alloy is which. Old alt asserted two materials. |
| `/blog/dfm-tasarimdan-uretime-gecis` | `blog-dfm` 1600×896 | `Ekranda açık CAD modeli ve yanında ölçülendirilmiş teknik resim` | `Delikli ve flanşlı işlenmiş metal gövde, kendi ölçülendirilmiş teknik resminin üzerinde duruyor` | **Wrong picture described** — there is no screen and no CAD model in the frame; it is a machined housing standing on its drawing. |
| `/blog/cnc-torna-frezeleme-farki` | `hero-cnc-frezeleme` 1600×896 (10-2b replacement for `service-cnc-freze`) | `CNC freze tezgâhında işlenen prizmatik metal parça` | `Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım` | Accurate but generic; now names the operation in frame. Same string as the landing process figure because it is the same photograph. |
| `/blog/kalite-kontrol-cmm-olcum` | `quality-control` 1600×682 | `Ölçüm masasında probla kontrol edilen işlenmiş metal parça` | `Karanlık ölçüm odasında, granit tabla üzerindeki silindirik parçayı problayan köprü tipi CMM` | The subject of the frame is the bridge CMM, which the old alt left out. |
| `/blog/endustriyel-yuzey-islemleri-rehberi` | `hero-yuzey-islemleri` 1600×896 (10-2b replacement for `cnc-workshop`) | `Farklı yüzey işlemleri uygulanmış metal parçaların bir arada görünümü` | `Makro çekim: kumlanmış, fırçalanmış ve parlatılmış metal yüzeylerin yan yana duran kenarları` | Names the three finishes actually visible instead of "farklı yüzey işlemleri". |

### 2.3 `/kabiliyet-profilleri/:slug` — 3 plates, **decorative** (`alt=""`; description is the visible caption)

`ShellPlate` with `caption={figure.alt}` **and** `alt={figure.alt}`: a screen reader read the
same sentence twice, under an `<h1>` that already names the part. The `<img>` is `alt=""` now and
`gallery[].alt` is printed once, as the `<figcaption>`. Source field: `src/content/caseStudies.ts`
`gallery[].alt` (documented on the type).

| Route | File | `<img>` alt before → after | Caption (from `gallery[].alt`) before → after | Reason for the caption rewrite |
|---|---|---|---|---|
| `/kabiliyet-profilleri/ince-cidarli-govde` (`<h1>` İNCE CİDARLI GÖVDE; nearest `<h2>` *Yaklaşım*) | `industry-defense` | `İnce cidarlı işlenmiş metal gövde parçası` → `""` | → `Rulman yuvası ve bağlantı delikleri işlenmiş metal gövde, ölçüm masası üzerinde` | The old text was the `<h1>` reworded; "ince cidarlı" is not something the picture shows. What it shows: a housing with a bearing bore and bolt holes on a table. |
| `/kabiliyet-profilleri/titanyum-baglanti-parcasi` | `industry-medical` | `Hassas işlenmiş titanyum bağlantı parçası` → `""` | → `Yüzeyi parlatılmış, eğik kanalı ve delikleri işlenmiş dik duran metal bağlantı parçası` | Drops the material claim; describes the polished upright part with its angled slot. |
| `/kabiliyet-profilleri/hassas-mil` | `hero-cnc-tornalama` | `CNC tornada işlenmiş hassas mil` → `""` | → `Torna aynasına bağlı metal mil, taret takımı ve soğutma sıvısı altında tornalanırken` | The frame is the turning operation itself (chuck, turret, coolant), not a finished shaft. |

### 2.4 `/hizmetler/:slug`, `/kabiliyetler/:slug`, `/endustriyel/:slug` — 48 plates, **decorative**

One site, `src/pages/ServiceDetail.tsx`: `alt={page.title}` → `alt=""`. The plate is the first
element after the `ShellPageHero` whose `<h1>` is `page.title`, and the plate's own figcaption
prints `PLAKA · {TITLE}` + the category label. The alt was therefore the third reading of the same
words on every one of these routes — the "title, twice" failure `BlogDetail.tsx` had already
documented and fixed for the blog. The pictures fall into two groups and both are decorative:

- **The subject of the `<h1>`, drawn** (33 routes with a per-page hero): the spindle under *CNC
  Frezeleme*, the caliper under *Tolerans & Hassasiyet*, the material slugs under *Malzeme
  Kütüphanesi*, the anodised rack under *Anodizasyon* (and, since 10-2b, under *Kimyasal
  İşlemler*), the CMM under *Kalite Kontrol*, the housing-on-drawing under *Tasarım Rehberi (DFM)*.
- **A mood plate with no page content** (15 sector routes on the shared `hero-seri-uretim`
  fallback — rows of identical parts under *Otomotiv*, *Petrol & Gaz*, *Madencilik Ekipmanları* …;
  plus *Makine Parkuru* on the cropped `hero-cnc`, *Proje Yönetimi* on a desk still-life,
  *Tedarik Zinciri* on a bar-stock rack). A description here would attach a stock scene to a
  sector it has nothing to do with.

Probe read-back (route → file → nearest heading, all `alt=""`, all with figcaption `PLAKA · …`):

| Route | File | `<h1>` |
|---|---|---|
| `/hizmetler/cnc-frezeleme` | `hero-cnc-frezeleme` | CNC Frezeleme |
| `/hizmetler/cnc-tornalama` | `hero-cnc-tornalama` | CNC Tornalama |
| `/hizmetler/hassas-mikro-isleme` | `hero-mikro-isleme` | Hassas Mikro İşleme |
| `/hizmetler/derin-delik-raybalama` | `hero-derin-delik` | Derin Delik & Raybalama |
| `/hizmetler/enjeksiyon-kalibi` | `hero-enjeksiyon-kalibi` | Enjeksiyon Kalıbı |
| `/hizmetler/basinçli-dokum` | `hero-basincli-dokum` | Basınçlı Döküm |
| `/hizmetler/silikon-kaliplama` | `hero-silikon-kaliplama` | Silikon Kalıplama |
| `/hizmetler/fikstur-aparat-tasarimi` | `hero-fikstur-aparat` | Fikstür & Aparat Tasarımı |
| `/hizmetler/mekanik-yuzey-islemleri` | `hero-mekanik-yuzey` | Mekanik Yüzey İşlemleri |
| `/hizmetler/anodizasyon` | `hero-anodizasyon` | Anodizasyon |
| `/hizmetler/kimyasal-islemler` | `hero-anodizasyon` (10-2b) | Kimyasal İşlemler |
| `/hizmetler/boya-koruyucu-kaplamalar` | `hero-boya-kaplama` | Boya & Koruyucu Kaplamalar |
| `/hizmetler/lazer-kazima` | `hero-lazer-kazima` | Lazer Kazıma |
| `/hizmetler/tavlama` | `hero-tavlama` | Tavlama |
| `/hizmetler/qr-datamatrix-kodlari` | `hero-qr-datamatrix` | QR & DataMatrix Kodları |
| `/hizmetler/logo-markalama` | `hero-logo-markalama` | Logo & Markalama |
| `/hizmetler/insert-uygulama` | `hero-insert-uygulama` | Insert Uygulama |
| `/hizmetler/mekanik-montaj` | `hero-mekanik-montaj` (10-2b crop, 1400×476) | Mekanik Montaj |
| `/hizmetler/kitting-paketleme` | `hero-kitting-paketleme` | Kitting & Paketleme |
| `/hizmetler/kaynakli-imalat` | `hero-kaynakli-imalat` | Kaynaklı İmalat |
| `/kabiliyetler/makine-parkuru` | `hero-cnc` (10-2b crop, 1260×708) | Makine Parkuru |
| `/kabiliyetler/malzeme-kutuphanesi` | `hero-malzeme-kutuphanesi` | Malzeme Kütüphanesi |
| `/kabiliyetler/kalite-kontrol` | `quality-control` (10-2b) | Kalite Kontrol |
| `/kabiliyetler/tolerans-hassasiyet` | `hero-tolerans-hassasiyet` | Tolerans & Hassasiyet |
| `/kabiliyetler/tasarim-rehberi-dfm` | `blog-dfm` (10-2b) | Tasarım Rehberi (DFM) |
| `/kabiliyetler/yuzey-islemleri-muhendislik` | `hero-yuzey-islemleri` | Yüzey İşlemleri Rehberi |
| `/kabiliyetler/dusuk-hacimli-uretim` | `hero-seri-uretim` | Düşük Hacimli Üretim |
| `/kabiliyetler/seri-imalat` | `hero-seri-uretim` | Seri İmalat |
| `/kabiliyetler/proje-yonetimi` | `hero-proje-yonetimi` | Proje Yönetimi |
| `/kabiliyetler/tedarik-zinciri` | `hero-tedarik-zinciri` | Tedarik Zinciri |
| `/kabiliyetler/operasyonel-verimlilik` | `hero-operasyonel-verimlilik` (10-2b crop, 1020×574) | Operasyonel Verimlilik |
| `/endustriyel/havacilik-uzay` | `hero-havacilik` | Havacılık & Uzay |
| `/endustriyel/savunma-sanayi` | `hero-seri-uretim` (fallback) | Savunma Sanayi |
| `/endustriyel/robotik` | `hero-seri-uretim` (fallback) | Robotik & Otomasyon |
| `/endustriyel/otomotiv` | `hero-seri-uretim` (fallback) | Otomotiv |
| `/endustriyel/medikal` | `hero-seri-uretim` (fallback) | Medikal & Biyomedikal |
| `/endustriyel/yelken-yat-sistemleri` | `hero-seri-uretim` (fallback) | Yelken & Yat Sistemleri |
| `/endustriyel/hidrolik-pnomatik` | `hero-seri-uretim` (fallback) | Hidrolik & Pnömatik |
| `/endustriyel/boru-baglanti-parcalari` | `hero-seri-uretim` (fallback) | Boru & Bağlantı Parçaları |
| `/endustriyel/iklim-teknolojileri` | `hero-seri-uretim` (fallback) | İklim Teknolojileri |
| `/endustriyel/prototip-uretim` | `hero-seri-uretim` (fallback) | Prototip Üretim |
| `/endustriyel/kucuk-seri` | `hero-seri-uretim` (fallback) | Küçük Seri Üretim |
| `/endustriyel/seri-uretim` | `hero-seri-uretim` (fallback) | Seri Üretim |
| `/endustriyel/ozel-projeler` | `hero-seri-uretim` (fallback) | Özel Mühendislik Projeleri |
| `/endustriyel/yenilenebilir-enerji` | `hero-seri-uretim` (fallback) | Yenilenebilir Enerji |
| `/endustriyel/petrol-gaz` | `hero-seri-uretim` (fallback) | Petrol & Gaz |
| `/endustriyel/guc-dagitim-sistemleri` | `hero-seri-uretim` (fallback) | Güç Dağıtım Sistemleri |
| `/endustriyel/madencilik-ekipmanlari` | `hero-seri-uretim` (fallback) | Madencilik Ekipmanları |

### 2.5 `/malzemeler` — `MaterialMorphScroll`

| Viewport | Element | Before | After | Reason |
|---|---|---|---|---|
| ≤ 767 (probed at 375) | `<img src="/sequence-material/frame_0001.webp">` at 30 % opacity behind the copy | `Malzeme Dönüşümü` | `""` | **Decorative**: a backdrop whose alt was the literal eyebrow text (`<span>Malzeme Dönüşümü</span>`) printed on top of it; nearest heading *Yüzey Mükemmelliği*. |
| ≥ 768, frames not yet decoded | same still at 40 % opacity as the canvas stand-in | `Malzeme Dönüşümü` | `""` | Same backdrop role; the `<canvas role="img" aria-label="Malzeme dönüşüm animasyonu">` above it is the accessible object. Not rendered in the 1280 probe (frames were ready), verified in source. |
| ≥ 768 | `<canvas role="img">` | `Malzeme dönüşüm animasyonu` | unchanged | The scroll-driven sequence itself; labelled, not a heading echo. |
| all | 46 × `span.shell-gauge[role="img"]` (`MaterialRegister`) | `İşlenebilirlik: n/5` | unchanged | Data gauges with a value label — text alternatives already correct; collapsed to a count in the probe table. |

### 2.6 Routes that render no `<img>` (probe-verified at 1280)

`/sss`, `/gizlilik-politikasi`, `/kvkk`, `/cerez-politikasi`, `/hakkimizda`, `/iletisim`,
`/kabiliyet-profilleri`, `/kalite-dosyasi`, `/teklif-al`, the 15 `/{prefix}/kategori/:slug`
pages, the 11 `/malzemeler/:slug` pages, `/giris`, `/sifremi-unuttum`, `/reset-password`,
`/cad-dashboard` (→ `/teklif-al`). 42 routes.

## 3. Data-driven alt sources audited

| Source | Field | Finding | Action |
|---|---|---|---|
| `src/data/blogData.ts` | `imageAlt` ×6 | 1 described a picture that is not the file (`blog-dfm`), 2 asserted materials, 1 echoed the post title's "beş eksen", 2 were generic | all six rewritten (§2.2) |
| `src/data/blogData.ts` | `imageCaption` ×6 | captions, not alts — out of scope; noted: the `blog-malzeme` caption says *iki alaşımda* of a picture that shows four unlabelled slugs | untouched, handed off (§7) |
| `src/content/caseStudies.ts` | `gallery[].alt` ×3 | each restated the profile `<h1>`; two asserted a material; the string was rendered as both alt and figcaption | rewritten as frame descriptions, now the caption only; type doc added |
| `src/data/technicalLandingData.ts` | `mediaAlt` / `figure.alt` (packet §MEASURED START) | **no such fields exist** on this tree — `mediaAlt` lives in `ProcessProofCinema.tsx`'s own stage table, which mounts only on the dev-only `/legacy-landing` and is not in `dist/` | none |
| `src/data/servicePages.ts` | any alt field | none; the plate alt was `page.title` at the render site | fixed at the site (§2.4) |
| sector `name` (`IndustryStackCard.tsx` `alt={industry.name}`) | — | the component has no importer on this tree (orphan since the landing rebuild); the shipped sector cards in `FinalSections.tsx` already use `alt=""` | none |

## 4. What the probe judges, and what it found

`reports/10/probes/alt-probe.mjs` derives the 99-route set exactly as
`e2e/shared-shell-accessibility.spec.ts` does (static full-shell list + `categoryPages` ×15 +
`servicePages` ×48 + `materialCategories` ×11 + blog slugs ×6 + `caseStudies` ×3 + the four
non-shell auth routes; the data modules are bundled through esbuild so they load in Node),
throws if the count is not 99, visits every route at 1280×800 with `reducedMotion: reduce`,
scrolls the full height to trigger every lazy image, and records every `<img>` and every
`[role="img"]` with its alt, `hasAttribute("alt")`, `aria-hidden` ancestry, nearest heading,
figcaption, rendered box and current source. `/` and `/malzemeler` are read again at 375×812
(manifesto `<picture>` swap; mobile still). Fail conditions: missing alt attribute; alt equal to
the nearest heading or to the route's `<h1>` (normalised, `tr` case-folded); alt equal to the
figcaption; a generic placeholder alt.

Result: **256 rows over 101 loads, 0 failures** — 69 `<img>` rows at 1280 + 12 at 375, 1 canvas,
174 gauge spans. Full table: `reports/10/probes/alt-probe.md`.

## 5. Sector-card intrinsic dimensions (10-2b handoff, `FinalSections.tsx`)

`TechnicalSectors()` printed one shared `width="1200" height="1200"` for four cards;
`industry-hydraulic` has been 750×750 since the 10-2b `crop=750:750:180:450`. The `sectors`
tuple now carries each file's measured size (`1200,1200` ×3, `750,750`) and the `<img>` reads
them. Both aspects are 1:1 and `.tl-sector-card img` is `width:100%; height:100%; object-fit:cover`
in a `min-height:208px` card, so no box changes — the probe reads 303×304 / 304×304 at 1280 and
333×333 at 375 for all four, identical to `reports/10/probes/art-direction.probe.json`.

## 6. Commands and results

All on the final tree in the isolated worktree `wt/coder-p10-3` (Windows 11, Node 26.3.0,
local Chrome as the Chromium executable, B08).

| Command | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` after each step | exit 0 ×3 |
| `npx tsc -b` (final tree) | exit 0 — no output (pasted in the packet return) |
| `npx eslint` on the seven edited TS/TSX files | exit 0 |
| `npm run build` | exit 0, `✓ built in 38.20s` |
| `node scripts/claims-gate.mjs` | `PASS — 0 unverified claims across 32 rules, 303 controls green` |
| `npx vite preview --port 4194` + `PROBE_BASE=http://localhost:4194 node reports/10/probes/alt-probe.mjs` | `256 rows over 101 loads … failures: 0`, exit 0 |
| `npx playwright test e2e/shared-shell-accessibility.spec.ts` (all 8 regression viewports, `PLAYWRIGHT_BASE_URL=http://localhost:4194`) | see packet return |
| `npx playwright test --project=visual-375 --project=visual-768 --project=visual-1280 --project=visual-1440` against the unchanged goldens | see packet return |
| `git diff --check` before every commit | clean |

## 7. Handoff / not done here

- `src/data/blogData.ts` `imageCaption` for `havacilik-parcalarinda-malzeme-secimi` reads *Aynı
  geometrinin iki alaşımda işlenmiş numuneleri*; the picture is four unlabelled slugs. A caption,
  not an alt — outside this packet's allowlist. Suggested: *Uç yüzeyleri farklı bitirilmiş dört
  işlenmiş numune*.
- `caseStudies.ts` `gallery[].alt` is now, in effect, the plate caption (both renderers give the
  `<img>` `alt=""`). Renaming the field to `caption` needs `caption={figure.alt}` edits in two
  renderers, which are not alt attributes; documented on the type instead.
- `TechnicalHero.tsx` `.tl-part-stage` carries `aria-label` on a `<div>` with no role
  (`aria-label` is not permitted on a generic element and is ignored by most AT). Adding
  `role="group"` would make it valid; left alone because it is not an image text alternative and
  the `<img>` inside it already carries the description.
- `src/components/musteri/ProfilAyarlari.tsx` `<AvatarImage alt="Avatar">` is on a panel route
  (`/musteri-paneli/*`), excluded from the public surface and from this packet.
- Dev-only `LandingFlow.tsx` / `ProcessProofCinema.tsx` / `EditorialKnowledgePreview.tsx` /
  `IndustryStackCard.tsx` (orphan) alts are untouched: none of them is in `dist/`.
