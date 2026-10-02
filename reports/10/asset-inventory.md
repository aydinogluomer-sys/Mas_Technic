# Phase 10-1 — Asset inventory and governance

Base commit `a74e1f5`. Requirement IDs 239–257 (imagery audit), 670–679 (asset governance).
Every number below is measured, not estimated: dimensions and bytes from a header parser
(WebP VP8/VP8L/VP8X, PNG IHDR, ICO directory, SVG viewBox) plus `ffprobe` for MP4;
reference sites from a basename grep over every text file in the repo (node_modules, dist,
.git, image-source excluded); routes from `App.tsx` × `servicePages.ts` / `blogData.ts` /
`caseStudies.ts`; the 375 crop from a headless-Chrome probe against `vite preview` of the
production build (computed `object-fit` mapping → visible source rectangle, verified against
element screenshots), then the same rectangles cut out of the source files and inspected.

## 0. Summary

| Metric | Before (a74e1f5) | After (this packet) |
|---|---|---|
| Files under `src/assets/` | 65 | 45 |
| Bytes under `src/assets/` | 17,955,284 | 4,027,590 (−13,927,694) |
| Image assets with zero import sites | 15 | 0 |
| Video/sidecar files with zero references | 5 | 0 |
| Non-ASCII / space / typo filenames under `src/assets/` | 3 (`hero-basinçli-dokum.webp`, `feautured blog.png`, `industry-automative.webp`) | 0 |
| Typo duplicates | 1 (`industry-automative` / `industry-automotive`) | 0 |
| Media files emitted into `dist/assets/` | 42 | 42 (identical content hashes; one filename changed) |
| `public/` assets with zero references | 4 (`machine-loop.mp4`, `placeholder.svg`, `images/mas-logo.svg`, `sequence-cnc/`) | 4 — outside this packet's write allowlist, see §3 |

Bundle proof: `ls dist/assets` before and after differ in exactly one line,
`hero-basinçli-dokum-BZCCkd3Z.webp` → `hero-basincli-dokum-BZCCkd3Z.webp` (same content hash).
Nothing removed was ever in the bundle — Vite emits only imported assets — so the 13.9 MB (13.28 MiB) is
repository dead weight (clone size, `assets:sync` scan time, reviewer noise), not a byte of
page weight.

## 1. Inventory — every file under `src/assets/**` and `public/**`

`public/sequence-*` frames are inventoried as two sequences (rows 75–76). "Reference sites"
counts only `src/**`, `index.html` and `vite.config.ts`; mentions in `docs/`, `scripts/qa-probes`
and historical bundle listings are context, not references, and are not listed.
"(+ dev-only)" means the asset is also imported by `LandingFlow.tsx` / `ProcessProofCinema.tsx` /
`RestoredLandingSections.tsx`, which only mount on `/legacy-landing` under `import.meta.env.DEV`
and are tree-shaken out of `dist/` (`App.tsx:70-82`).

| # | File | Dimensions | Bytes | Format | Reference sites (src / index.html / vite.config) | Renders on | Class |
|---|---|---|---|---|---|---|---|
| 1 | `blog-5eksen.webp` | 1600×896 | 69,134 | VP8X (lossy, icc) | `src/components/landing/RestoredLandingSections.tsx:10`<br>`src/data/blogData.ts:1` | /blog (lead), /blog/5-eksen-cnc-isleme-avantajlari | used |
| 2 | `blog-dfm.webp` | 1600×896 | 83,744 | VP8X (lossy, icc) | `src/components/landing/RestoredLandingSections.tsx:12`<br>`src/data/blogData.ts:3` | /blog/dfm-tasarimdan-uretime-gecis | used |
| 3 | `blog-malzeme.webp` | 1600×896 | 162,560 | VP8X (lossy, icc) | `src/components/landing/RestoredLandingSections.tsx:11`<br>`src/data/blogData.ts:2` | /blog/havacilik-parcalarinda-malzeme-secimi | used |
| 4 | `cnc-factory-zoom.mp4` | 1280×726 | 1,439,448 | MP4 h264 24fps 10.04 s, 241 frames | 0 | NONE | UNUSED → removed |
| 5 | `cnc-sequence-scroll.mp4` | 1904×1088 | 4,637,981 | MP4 h264 24fps 6.04 s, 145 frames | 0 | NONE | UNUSED → removed |
| 6 | `cnc-sequence.mp4.asset.json` | — | 322 | JSON (Lovable upload manifest) | 0 | NONE | UNUSED → removed |
| 7 | `cnc-start-frame.webp` | 1600×900 | 64,322 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 8 | `cnc-workshop.webp` | 1600×682 | 86,526 | VP8X (lossy, icc) | `src/data/blogData.ts:4`<br>`src/pages/ServiceDetail.tsx:24` | 15× /endustriyel/* (fallback hero: every sector page except havacilik-uzay), /blog/endustriyel-yuzey-islemleri-rehberi | used |
| 9 | `feautured blog.png` | 1744×2784 | 7,005,035 | PNG 8-bit RGB | 0 | NONE | UNUSED → removed |
| 10 | `hero-anodizasyon.webp` | 1600×896 | 142,380 | VP8X (lossy, icc) | `src/components/landing/ProcessProofCinema.tsx:10`<br>`src/components/LandingFlow.tsx:25`<br>`src/pages/ServiceDetail.tsx:31` | /hizmetler/anodizasyon (+ dev-only) | used |
| 11 | `hero-basincli-dokum.webp` | 1600×896 | 157,320 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:34` | /hizmetler/basinçli-dokum | used — RENAMED from `hero-basinçli-dokum.webp` (non-ASCII) |
| 12 | `hero-boya-kaplama.webp` | 1600×896 | 70,408 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:39` | /hizmetler/boya-koruyucu-kaplamalar | used |
| 13 | `hero-cnc-frezeleme.webp` | 1600×896 | 98,766 | VP8X (lossy, icc) | `src/components/landing/ProcessProofCinema.tsx:9`<br>`src/components/technical-landing/ProcessNexusProjects.tsx:5`<br>`src/pages/ServiceDetail.tsx:26` | / (band 03 process figure), /hizmetler/cnc-frezeleme (+ dev-only) | used |
| 14 | `hero-cnc-tornalama.webp` | 900×504 | 40,042 | VP8X (lossy, icc) | `src/components/pages/case-study-figures.ts:3`<br>`src/components/technical-landing/ProcessNexusProjects.tsx:8`<br>`src/pages/ServiceDetail.tsx:27` | / (projects grid), /hizmetler/cnc-tornalama, /kabiliyet-profilleri/hassas-mil | used |
| 15 | `hero-cnc.webp` | 1600×896 | 79,916 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:23`<br>`src/components/r3f/HeroCanvas.tsx:8` | NONE in dist — dev-only /legacy-landing + orphan `src/components/r3f/HeroCanvas.tsx` (no importer anywhere) | used (dev-only; not in dist) |
| 16 | `hero-derin-delik.webp` | 1600×896 | 114,680 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:29` | /hizmetler/derin-delik-raybalama | used |
| 17 | `hero-dfm-tasarim.webp` | 1600×896 | 68,312 | VP8X (lossy, icc) | `src/components/landing/ProcessProofCinema.tsx:7`<br>`src/pages/ServiceDetail.tsx:49` | /kabiliyetler/tasarim-rehberi-dfm (+ dev-only) | used |
| 18 | `hero-enjeksiyon-kalibi.webp` | 1600×896 | 94,434 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:24`<br>`src/pages/ServiceDetail.tsx:30` | /hizmetler/enjeksiyon-kalibi (+ dev-only) | used |
| 19 | `hero-fikstur-aparat.webp` | 1600×896 | 66,790 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:35` | /hizmetler/fikstur-aparat-tasarimi | used |
| 20 | `hero-havacilik.webp` | 1600×896 | 41,612 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:33` | /endustriyel/havacilik-uzay | used |
| 21 | `hero-insert-uygulama.webp` | 1600×896 | 82,440 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:43` | /hizmetler/insert-uygulama | used |
| 22 | `hero-kalite-kontrol.webp` | 1600×896 | 45,458 | VP8X (lossy, icc) | `src/components/landing/ProcessProofCinema.tsx:11`<br>`src/pages/ServiceDetail.tsx:48` | /kabiliyetler/kalite-kontrol (+ dev-only) | used |
| 23 | `hero-kaynakli-imalat.webp` | 1600×896 | 53,104 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:46` | /hizmetler/kaynakli-imalat | used |
| 24 | `hero-kimyasal-islemler.webp` | 1600×900 | 237,328 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:38` | /hizmetler/kimyasal-islemler | used |
| 25 | `hero-kitting-paketleme.webp` | 1600×896 | 151,352 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:45` | /hizmetler/kitting-paketleme | used |
| 26 | `hero-lazer-kazima.webp` | 1600×896 | 69,316 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:26`<br>`src/pages/ServiceDetail.tsx:32` | /hizmetler/lazer-kazima (+ dev-only) | used |
| 27 | `hero-logo-markalama.webp` | 1600×896 | 112,306 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:42` | /hizmetler/logo-markalama | used |
| 28 | `hero-makine-parkuru.webp` | 1600×896 | 92,954 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:47` | /kabiliyetler/makine-parkuru | used |
| 29 | `hero-malzeme-kutuphanesi.webp` | 1600×896 | 98,002 | VP8X (lossy, icc) | `src/components/landing/ProcessProofCinema.tsx:8`<br>`src/pages/ServiceDetail.tsx:52` | /kabiliyetler/malzeme-kutuphanesi (+ dev-only) | used |
| 30 | `hero-mekanik-montaj.webp` | 1600×896 | 77,108 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:27`<br>`src/pages/ServiceDetail.tsx:44` | /hizmetler/mekanik-montaj (+ dev-only) | used |
| 31 | `hero-mekanik-yuzey.webp` | 1600×896 | 101,470 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:37` | /hizmetler/mekanik-yuzey-islemleri | used |
| 32 | `hero-mikro-isleme.webp` | 1600×896 | 81,514 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:28` | /hizmetler/hassas-mikro-isleme | used |
| 33 | `hero-operasyonel-verimlilik.webp` | 1600×896 | 58,340 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:55` | /kabiliyetler/operasyonel-verimlilik | used |
| 34 | `hero-proje-yonetimi.webp` | 1600×896 | 90,332 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:53` | /kabiliyetler/proje-yonetimi | used |
| 35 | `hero-qr-datamatrix.webp` | 1600×896 | 135,090 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:41` | /hizmetler/qr-datamatrix-kodlari | used |
| 36 | `hero-seri-uretim.webp` | 1600×896 | 50,780 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:56` | /kabiliyetler/dusuk-hacimli-uretim, /kabiliyetler/seri-imalat | used |
| 37 | `hero-silikon-kaliplama.webp` | 1600×896 | 68,450 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:36` | /hizmetler/silikon-kaliplama | used |
| 38 | `hero-tavlama.webp` | 1600×896 | 57,264 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:40` | /hizmetler/tavlama | used |
| 39 | `hero-tedarik-zinciri.webp` | 1600×896 | 107,992 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:54` | /kabiliyetler/tedarik-zinciri | used |
| 40 | `hero-tolerans-hassasiyet.webp` | 2400×1343 | 179,954 | VP8X (lossy, icc) | `src/components/technical-landing/FinalSections.tsx:8`<br>`src/pages/ServiceDetail.tsx:51` | / (band 09 manifesto), /kabiliyetler/tolerans-hassasiyet | used |
| 41 | `hero-yuzey-islemleri.webp` | 1600×896 | 125,926 | VP8X (lossy, icc) | `src/pages/ServiceDetail.tsx:50` | /kabiliyetler/yuzey-islemleri-muhendislik | used |
| 42 | `industry-aerospace.webp` | 1200×1200 | 44,476 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:28`<br>`src/components/technical-landing/FinalSections.tsx:4` | / (sector card) (+ dev-only) | used |
| 43 | `industry-automative.webp` | 1200×1200 | 75,602 | VP8X (lossy, icc) | 0 | NONE | DUPLICATE (typo of `industry-automotive`) → removed |
| 44 | `industry-automotive.webp` | 1200×1200 | 159,032 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:30` | NONE in dist — dev-only /legacy-landing | used (dev-only; not in dist) |
| 45 | `industry-defense.webp` | 1200×1200 | 80,868 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:29`<br>`src/components/pages/case-study-figures.ts:1`<br>`src/components/technical-landing/FinalSections.tsx:5`<br>`src/components/technical-landing/ProcessNexusProjects.tsx:6` | / (featured project + sector card), /kabiliyet-profilleri/ince-cidarli-govde (+ dev-only) | used |
| 46 | `industry-hvac.webp` | 1200×1200 | 65,820 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 47 | `industry-hydraulic.webp` | 1200×1200 | 53,640 | VP8X (lossy, icc) | `src/components/technical-landing/FinalSections.tsx:7` | / (sector card) | used |
| 48 | `industry-marine.webp` | 1200×1200 | 48,098 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 49 | `industry-medical.webp` | 1200×1200 | 45,430 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:31`<br>`src/components/pages/case-study-figures.ts:2`<br>`src/components/technical-landing/FinalSections.tsx:6`<br>`src/components/technical-landing/ProcessNexusProjects.tsx:7` | / (projects grid + sector card), /kabiliyet-profilleri/titanyum-baglanti-parcasi (+ dev-only) | used |
| 50 | `industry-mining.webp` | 1200×1200 | 73,384 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 51 | `industry-oilgas.webp` | 1200×1200 | 79,004 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 52 | `industry-piping.webp` | 1200×1200 | 75,448 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 53 | `industry-power.webp` | 1200×1200 | 101,896 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 54 | `industry-renewable.webp` | 1200×1200 | 122,066 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 55 | `industry-robotics.webp` | 1200×1200 | 60,216 | VP8X (lossy, icc) | `src/components/LandingFlow.tsx:32` | NONE in dist — dev-only /legacy-landing | used (dev-only; not in dist) |
| 56 | `machine-loop-raw.mp4.asset.json` | — | 330 | JSON (Lovable upload manifest) | 0 | NONE | UNUSED → removed |
| 57 | `mas-technic-logo.webp` | 512×512 | 22,400 | VP8X (lossy, alpha, icc) | 0 | NONE | UNUSED → removed |
| 58 | `material-aluminium.webp` | 640×640 | 33,694 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 59 | `material-brass.webp` | 640×640 | 32,316 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 60 | `material-morph-raw.mp4.asset.json` | — | 334 | JSON (Lovable upload manifest) | 0 | NONE | UNUSED → removed |
| 61 | `material-stainless.webp` | 640×640 | 25,232 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 62 | `material-steel.webp` | 640×640 | 24,962 | VP8X (lossy, icc) | 0 | NONE | UNUSED → removed |
| 63 | `quality-control.webp` | 1600×682 | 39,930 | VP8X (lossy, icc) | `src/data/blogData.ts:5`<br>`src/pages/ServiceDetail.tsx:25` | /blog/kalite-kontrol-cmm-olcum (also the `kabiliyetler` fallback — never hit today, every kabiliyetler page has a `heroImage`) | used |
| 64 | `service-cnc-freze.webp` | 800×544 | 26,820 | VP8X (lossy, icc) | `src/data/blogData.ts:6` | /blog/cnc-torna-frezeleme-farki | used |
| 65 | `technical-landing/hero-manifold-v1.webp` | 1672×941 | 64,074 | VP8X (lossy, icc) | `index.html:49` (comment)<br>`src/components/technical-landing/FinalSections.tsx:9`<br>`src/components/technical-landing/TechnicalHero.tsx:2`<br>`vite.config.ts:19` (LCP preload) | / (hero LCP image + band 10 mini-doc) | used |
| 66 | `public/belgeler/kalite-politikasi.pdf` | — | 81,083 | PDF | `src/content/claims.ts:426` | /kalite-dosyasi, /hakkimizda (download links) | used |
| 67 | `public/belgeler/olcum-ekipmanlari.pdf` | — | 103,038 | PDF | `src/content/claims.ts:427` | /kalite-dosyasi, /hakkimizda (download links) | used |
| 68 | `public/belgeler/paketleme-kilavuzu.pdf` | — | 92,312 | PDF | `src/content/claims.ts:428` | /kalite-dosyasi (download link) | used |
| 69 | `public/belgeler/tedarikci-davranis-kurallari.pdf` | — | 88,370 | PDF | `src/content/claims.ts:429` | /kalite-dosyasi (download link) | used |
| 70 | `public/favicon.ico` | 256×256 | 20,373 | ICO, 1 entry 256×256@32bpp | 0 explicit | every route — implicit browser fetch of `/favicon.ico` (`index.html` has no `<link rel="icon">`; served 200 by preview) | used (implicit) |
| 71 | `public/images/mas-logo.svg` | 600×200 | 252 | SVG (text "MAS" in IBM Plex Mono) | 0 | NONE | UNUSED (public/, outside allowlist) |
| 72 | `public/machine-loop.mp4` | 1280×720 | 427,192 | MP4 h264 24fps 3.00 s, 72 frames | `src/pages/ServiceDetail.tsx:103` (comment recording its removal, not a reference) | NONE | UNUSED (public/, outside allowlist) |
| 73 | `public/placeholder.svg` | 1200×1200 | 3,253 | SVG (Lovable template placeholder) | 0 | NONE | UNUSED (public/, outside allowlist) |
| 74 | `public/robots.txt` | — | 174 | TXT | 0 | crawler fetch only | used |
| 75 | `public/sequence-cnc/` (120 frames `frame_0001..0120.webp`) | 1280×720 each, uniform | 8,944,050 | VP8 lossy, avg 72.8 KB/frame | 0 | NONE | UNUSED (DO_NOT_TOUCH) |
| 76 | `public/sequence-material/` (80 frames `frame_0001..0080.webp`) | 1280×720 each, uniform | 3,371,968 | VP8 lossy, avg 41.2 KB/frame | `src/components/MaterialMorphScroll.tsx:67`<br>`src/components/MaterialMorphScroll.tsx:188`<br>`src/components/MaterialMorphScroll.tsx:267` | /malzemeler (`MaterialMorphScroll`, lazy chunk) | used |

Byte-identical duplicate check (md5 over all 65 + public files): 0 groups. `industry-automative`
and `industry-automotive` are different renders of the same brief (75,602 vs 159,032 bytes), so
the duplication is by name and subject, not by bytes.

## 2. Governance actions taken

### 2.1 Rename (commit `5e8dd72`)

| Before | After | Import updated |
|---|---|---|
| `src/assets/hero-basinçli-dokum.webp` | `src/assets/hero-basincli-dokum.webp` | `src/pages/ServiceDetail.tsx:34` (the only import). The `heroImageMap` key was already `"hero-basincli-dokum"`, so no data change. |

Why it mattered beyond hygiene: Vite carried the `ç` into `dist/assets/hero-basinçli-dokum-BZCCkd3Z.webp`,
so the production URL depended on how each CDN and browser percent-encodes U+00E7.

### 2.2 Removal of zero-reference files (commit `5ce615f`) — 20 files, 13,927,694 bytes

All 20 had no import, string reference or test reference in `src/`, `index.html`, `public/`,
`e2e/`, `scripts/` or any config (re-grepped after removal: 0 hits). None was in `dist/`.

| File | Bytes | Reason recorded |
|---|---|---|
| `feautured blog.png` | 7,005,035 | Zero references; typo + space in filename; 7 MB source PNG (the `assets:sync` pipeline archives such sources to the git-ignored `image-source/`); subject is a window, an open book and a cup of tea — off-brand. Removal supersedes the rename the packet asked for. |
| `industry-automative.webp` | 75,602 | Typo duplicate of `industry-automotive.webp`; zero references. Shows a factory hall with masked staff in the background (§I exposure). |
| `cnc-start-frame.webp` | 64,322 | Zero references; a metal billet on black — orphan poster frame of the removed video sequence. |
| `industry-hvac.webp` | 65,820 | Zero references; factory-hall background (§I). |
| `industry-marine.webp` | 48,098 | Zero references. |
| `industry-mining.webp` | 73,384 | Zero references; factory-hall background with staff (§I). |
| `industry-oilgas.webp` | 79,004 | Zero references. |
| `industry-piping.webp` | 75,448 | Zero references. |
| `industry-power.webp` | 101,896 | Zero references. |
| `industry-renewable.webp` | 122,066 | Zero references; factory-hall background with staff (§I). |
| `mas-technic-logo.webp` | 22,400 | Zero references; chrome + electric-blue 3D wordmark — contradicts the graphite/charcoal art direction; `OFFICIAL_LOGO_ASSETS: USE_REPO` is satisfied by the live SVG wordmark in the shell, not this file. |
| `material-aluminium.webp`, `material-brass.webp`, `material-stainless.webp`, `material-steel.webp` | 33,694 + 32,316 + 25,232 + 24,962 | Zero references; the material cards were re-implemented without them (`MaterialMorphScroll` uses `public/sequence-material/`). |
| `cnc-factory-zoom.mp4` | 1,439,448 | Zero references; machine-interior footage (`MACHINE_PHOTOS: NONE`). |
| `cnc-sequence-scroll.mp4` | 4,637,981 | Zero references; carries a visible **"KlingAI 3.0 Omni" watermark** in the bottom-right corner — could never have shipped. |
| `cnc-sequence.mp4.asset.json`, `machine-loop-raw.mp4.asset.json`, `material-morph-raw.mp4.asset.json` | 322 + 330 + 334 | Lovable upload manifests pointing at `/__l5e/assets-v1/...` URLs that do not exist in this deployment. |

### 2.3 Naming standard after this packet

Every file under `src/assets/` now matches `^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+$` (kebab-case ASCII,
single extension). Verified by script over the 45 remaining files: 0 violations.

## 3. Found but not actioned (outside the write allowlist, or needs a code change beyond an import path)

| Item | Finding | Recommended owner |
|---|---|---|
| `public/machine-loop.mp4` (427 KB), `public/placeholder.svg`, `public/images/mas-logo.svg` | Zero references; `public/` is copied verbatim into `dist/`, so unlike the `src/assets` removals these **are** shipped (only fetched if requested, which nothing does). `public/**` is not in this packet's allowlist. | 10-2 or a public-dir hygiene packet |
| `public/sequence-cnc/` (120 frames, 8.9 MB) | Zero references (`use-image-preloader.ts` is generic; only `MaterialMorphScroll` calls it, with `/sequence-material`). Copied verbatim into `dist/`. `DO_NOT_TOUCH` for this packet. | Orchestrator decision |
| `src/components/r3f/HeroCanvas.tsx` | Orphan file — no importer anywhere in `src/`. It is the only reason `hero-cnc.webp` still has two import sites; deleting the orphan and retiring `LandingFlow` would make `hero-cnc.webp`, `industry-automotive.webp`, `industry-robotics.webp` zero-reference (293 KB). Not an import-path update, so out of scope here. | Dev-route cleanup packet |
| `slug: "basinçli-dokum"` (`servicePages.ts:637`, `categoryPages.ts:30`, `navigation/ia.ts:92`) | The route slug itself is non-ASCII (`/hizmetler/basinçli-dokum`); the asset rename does not touch it. A slug change is a redirect + sitemap concern. | Phase 11 (SEO/canonical) |
| `index.html` has no `<link rel="icon">` | The favicon is served only by the implicit `/favicon.ico` request; no `apple-touch-icon`, no SVG icon. | Phase 11 |
| Chat launcher button overlaps the hero plate at 375 | Seen in every 375 plate screenshot (teal circle over the image's right third). Not an asset issue; noted for the responsive pass. | 10-2 / Phase 13 |

## 4. Campaign consistency, mood and §I policy audit — every *used* asset

Criteria (packet task 4): graphite/charcoal low-key industrial; no neon/cyberpunk; no generic blue
factory stock; no clutter; one dominant idea per image. Policy (`USER_INPUTS.md` §I):
`FACILITY_PHOTOS: NONE`, `MACHINE_PHOTOS: NONE`, `TEAM_PHOTOS: NONE`, `PROJECT_PHOTOS: USE_REPO` —
so no asset may depict or imply the facility, machines or staff as MAS's own. None of these images
is a MAS photograph (they are generated/stock renders), which is exactly why the *implication*
matters: a wide hall or a face under a page titled "Makine Parkuru" reads as MAS's own.

Flag legend — **FACILITY**: a wide hall / shop floor is the frame; **STAFF**: a face or a person is
legible; *hands*: only hands/forearms, no face (recorded, lower severity); **MACHINE**: a
machine interior is the subject. Grayscale surfaces on `/` (`filter: grayscale(1)`) neutralise
colour but not content.

| File | Mood verdict (one line) | §I flag |
|---|---|---|
| `technical-landing/hero-manifold-v1.webp` | PASS — hydraulic manifold on black granite, one idea, campaign anchor. | none (machine bokeh far right is unreadable) |
| `hero-cnc-frezeleme.webp` | PASS — spindle and coolant spray on a dark bed, one idea. | MACHINE (interior only, no hall; generic process shot) |
| `hero-cnc-tornalama.webp` | PASS on mood; **weak on quality** — 900×504 source, the smallest hero, upscaled 1.35× at 1280 in the plate frame and soft on 2× DPR. | MACHINE (interior only) |
| `hero-mikro-isleme.webp` | PASS — micro tool over a small block, low key. | *hands* (operator's fingers at frame edge) |
| `hero-derin-delik.webp` | PASS — drill and coolant, one idea. | *hands* (blurred, far background) |
| `hero-enjeksiyon-kalibi.webp` | PASS-marginal — mould cavity is the idea, but a lit hall with machines and green fixtures fills the background (clutter). | FACILITY (background) |
| `hero-basincli-dokum.webp` | PASS — die half in the press, dark, one idea. | MACHINE (interior only) |
| `hero-silikon-kaliplama.webp` | MARGINAL — the bright hands dominate; the silicone part is a small pale blob; idea is unclear. | *hands* |
| `hero-fikstur-aparat.webp` | PASS — fixture on a machine table, cool graphite. | MACHINE (interior only) |
| `hero-mekanik-yuzey.webp` | PASS — blast nozzle and part, one idea. | *hands* |
| `hero-anodizasyon.webp` | PASS — black anodised parts dripping on a rack; the strongest low-key image in the set. | none |
| `hero-kimyasal-islemler.webp` | **FAIL** — bright green chemical tanks, blue pipework, green floor, wide plant view: fails low-key, fails "no generic factory stock", fails "no clutter". Also the heaviest hero (237 KB). | FACILITY (wide plant view) |
| `hero-boya-kaplama.webp` | PASS — spray mist over a bracket, dark ground. | *hands* |
| `hero-lazer-kazima.webp` | PASS — laser tip on a cylinder end, sparks, one idea. | *hands* |
| `hero-tavlama.webp` | PASS — furnace glow; the only warm accent in the set and it is motivated by the process. | MACHINE (furnace interior) |
| `hero-qr-datamatrix.webp` | PASS — Data Matrix on brushed metal, exemplary. | none |
| `hero-logo-markalama.webp` | PASS — engraved mark on a black part, exemplary. | *hands* (corner) |
| `hero-insert-uygulama.webp` | PASS — press tool over a plate, dark. | *hands* |
| `hero-mekanik-montaj.webp` | PASS on tone; **STAFF** — two workers' heads and faces frame the top of the image (visible at ≥768, cropped out at 375). | **STAFF** |
| `hero-kitting-paketleme.webp` | PASS — parts in a black foam case, one idea. | none |
| `hero-kaynakli-imalat.webp` | PASS — TIG torch on a flange, dark. | *hands* |
| `hero-makine-parkuru.webp` | PASS on tone; **FAIL on policy** — a wide hall with rows of machining centres and people, under a page titled "Makine Parkuru": this is a facility claim. | **FACILITY + STAFF** |
| `hero-malzeme-kutuphanesi.webp` | PASS — material slugs on black, exemplary. | none |
| `hero-kalite-kontrol.webp` | PASS on tone; **STAFF** — an inspector's face is legible behind the CMM probe at desktop widths. | **STAFF** |
| `hero-tolerans-hassasiyet.webp` | PASS — caliper jaw on a machined block, exemplary; the largest source (2400×1343). | none |
| `hero-dfm-tasarim.webp` | MARGINAL — CAD screen is the idea, but two people at desks are legible; reads as "our engineering office". | **STAFF** |
| `hero-yuzey-islemleri.webp` | PASS — bead-blasted vs brushed edges, macro, exemplary. | none |
| `hero-seri-uretim.webp` | PASS — rows of identical parts, one idea. | none |
| `hero-proje-yonetimi.webp` | MARGINAL — desk with clipboards and a part; office-stock idiom, mild clutter, but graphite. | none |
| `hero-tedarik-zinciri.webp` | PASS — bar-stock rack, one idea; a person is faintly visible at far left. | *staff-faint* (unreadable at 375) |
| `hero-operasyonel-verimlilik.webp` | MARGINAL — machining centre with control screen; two people at the console at desktop widths. | **STAFF** + MACHINE |
| `hero-havacilik.webp` | PASS — aerospace bracket on a table, hall as bokeh. | FACILITY (bokeh only) |
| `cnc-workshop.webp` | PASS on tone; **FAIL on policy** — a wide, empty machine hall; it is the hero of **15 sector pages** and one blog post, so it is the single largest facility implication on the site. Also 1600×682 (2.35:1), the most aggressively cropped source in the plate frame. | **FACILITY** |
| `quality-control.webp` | PASS — CMM in a clean lab, low key; only used on one blog post. 1600×682. | MACHINE |
| `service-cnc-freze.webp` | **FAIL** — blue-tinted spindle with cyan chips; this is the "generic blue factory stock" the brief excludes. 800×544, smallest source. | MACHINE |
| `blog-5eksen.webp` | PASS — 5-axis head and part, coolant; an operator's face is faint at right. | *staff-faint* |
| `blog-dfm.webp` | PASS — machined part on its drawing, exemplary. | none |
| `blog-malzeme.webp` | PASS — cut material slugs, exemplary. | none |
| `industry-aerospace.webp` | PASS — bracket under a truss, cool graphite. | none |
| `industry-defense.webp` | PASS on tone; people in dark shirts stand blurred behind the housing (legible at desktop featured size 607×264). | STAFF (blurred) |
| `industry-medical.webp` | PASS on tone; white-coat figures blurred behind the implant part. | STAFF (blurred) |
| `industry-hydraulic.webp` | MARGINAL — manifold block is the idea, but two workers are clearly legible behind it in the 333×333 sector card. | **STAFF** |
| `hero-cnc.webp` (dev-only) | PASS — spindle and coolant; near-duplicate concept of `hero-cnc-frezeleme`. | MACHINE |
| `industry-automotive.webp` (dev-only) | PASS — camshaft and pistons on black. | none |
| `industry-robotics.webp` (dev-only) | PASS — robot wrist joint, graphite. | none |
| `public/sequence-material/` (80 frames) | PASS — brushed metal slab morphing on black; consistent with the campaign. | none |
| `public/favicon.ico` | n/a (icon) — 256×256 single entry; no 16/32 px entries, so the tab icon is downscaled by the browser. | none |

Campaign read as a whole, over the 42 shipped images: 33 PASS, 5 MARGINAL (`hero-silikon-kaliplama`, `hero-dfm-tasarim`, `hero-proje-yonetimi`, `hero-operasyonel-verimlilik`, `industry-hydraulic`; `hero-enjeksiyon-kalibi` is a pass with a cluttered background), 4 FAIL. The
two outright mood failures (`hero-kimyasal-islemler`, `service-cnc-freze`) and the two facility
heroes (`cnc-workshop` on 15 pages, `hero-makine-parkuru`) are what stop the set reading as one
commissioned campaign. Replacement or retirement of those four is a 10-2/content decision; this
packet records them and does not alter any `<img>`.

## 5. Responsive crop / art-direction audit at 375

Method: production build served by `vite preview`; headless Chrome at 375×812 (and 1280×800 for
reference) visits `/`, `/blog`, all 47 service/capability/sector pages, all 6 blog posts and the
3 capability profiles; for every `<img>` the probe reads `naturalWidth/Height`, the rendered box,
the nearest `overflow:hidden` ancestor, `object-fit`/`object-position`, and computes the visible
source rectangle. The rectangles were then cut out of the source files with ffmpeg and inspected
next to element screenshots of the real render (they match).

### 5.1 Surfaces and their measured 375 windows

| Surface | Markup / CSS | 375 rendered box → visible | Visible source window | 1280 window (reference) |
|---|---|---|---|---|
| `/` hero part stage | `.tl-part-frame` `aspect-ratio:1672/941`, `object-position:62% 50%` at mobile | 333×187 (whole box visible) | **100 %** of source — no crop; the part occupies ~150 px of the 333 px | x 8–94 %, y 8–94 % (scale 1.16, pos 67 %) |
| `/` band 03 process figure | `.tl-process figure` fixed height + reverse-scroll overscan | 333×312 → 333×216 | x 20–80 %, y 15–85 % (41 %) | x 0–100 %, y 22–78 % |
| `/` featured project | `.tl-project-featured` | 332×216 | x 0–100 %, y 17.5–82.5 % (65 %) | y 28–72 % |
| `/` project grid tiles | `.tl-project-grid` | 331×216 | 1200² sources: y 17–83 %; 900×504 source: x 7–93 %, y 0–100 % | ~full |
| `/` sector cards | `.tl-sector-card` square | 333×333 | **100 %** of the 1200×1200 sources | 100 % |
| `/` band 09 manifesto | `.tl-manifesto-body` `min-height:520px` at mobile, image `object-fit:cover` | 333×664 → 333×520 | **x 36–64 %, y 11–89 % (22 % of area)** | x 0–100 %, y 18–82 % |
| `/` band 10 mini-doc | `.tl-mini-doc img` 56×56 | 56×56 | x 22–78 % | same |
| Service / capability / sector / blog-detail / profile-detail plate | `.shell-plate-frame` `height:clamp(200px,33vw,420px)` → 200 px; image `inset:-60px 0`, `height:calc(100%+120px)`, `object-fit:cover`; parallax `y:[-60,60]` px | 331×318 → 331×200 | 16:9 sources: **x 21–79 %, y 19–81 %** (36.7 %); 1600×682: **x 28–72 %** (27.9 %); 800×544: x 15–85 % (44.5 %); 1200²: x 0–100 %, y 20–80 %. Parallax moves the y-window ±19 % of source height over the scroll. | 16:9: x 0–100 %, y 19–81 % |
| `/blog` lead plate | same `ShellPlate` | as above | as above | as above |

The plate frame is the same component everywhere, so at 375 every 16:9 hero loses 42 % of its
width (21 % each side) and 37 % of its height; a subject that is centred survives, anything at
the edges is cut. Findings per asset:

### 5.2 Verdicts (SURVIVES = subject intact; MARGINAL = subject touched by the crop; CUT = subject lost)

| Asset (surface) | 375 verdict | What the 375 window shows |
|---|---|---|
| `hero-manifold-v1` (`/` hero) | SURVIVES | Whole image; the part is small (≈150 px) but intact. Desktop uses `object-position:67%` + `scale(1.16)`; mobile shows the uncropped frame instead — the subject is not cut, it is under-scaled. |
| `hero-manifold-v1` (mini-doc 56 px) | SURVIVES | Central 56 % width; the manifold fills it. |
| `hero-cnc-frezeleme` (`/` process figure) | SURVIVES | Tool tip, chips and part all inside the window. |
| `hero-cnc-frezeleme` (plate) | SURVIVES | Same; part's left edge touches the frame. |
| `hero-cnc-tornalama` (plate; `/` grid; profile) | SURVIVES | Tool and coolant centred. Source is 900×504, so the 331 px window is drawn from 524 source px — soft on 2× DPR. |
| `hero-mikro-isleme` (plate) | SURVIVES | Tool and block centred. |
| `hero-derin-delik` (plate) | SURVIVES | Drill and bore centred. |
| `hero-enjeksiyon-kalibi` (plate) | MARGINAL | Mould cavity centred, but the mould plate is cut on both sides; reads as a texture rather than an object. |
| `hero-basincli-dokum` (plate) | MARGINAL | Die cavity fills the window; the die's outline is lost on both sides. |
| `hero-silikon-kaliplama` (plate) | SURVIVES | Hands and part centred (see mood note). |
| `hero-fikstur-aparat` (plate) | MARGINAL | Fixture centre survives; its outer columns are cut left and right. |
| `hero-mekanik-yuzey` (plate) | SURVIVES | Nozzle and blast cone in frame. |
| `hero-anodizasyon` (plate) | SURVIVES | Pattern image; any window works. |
| `hero-kimyasal-islemler` (plate) | SURVIVES (crop) | Tanks centred — the crop is fine; the image fails on mood, see §4. |
| `hero-boya-kaplama` (plate) | SURVIVES | Bracket and spray in frame. |
| `hero-lazer-kazima` (plate) | SURVIVES | Laser tip and spark centred. |
| `hero-tavlama` (plate) | MARGINAL | Furnace mouth is cut; only the glowing charge and smoke remain — still one idea, but the furnace is gone. |
| `hero-qr-datamatrix` (plate) | SURVIVES | Code centred. |
| `hero-logo-markalama` (plate) | SURVIVES | Mark centred. |
| `hero-insert-uygulama` (plate) | SURVIVES | Press tool and plate. |
| `hero-mekanik-montaj` (plate) | SURVIVES | Gloved hands and housing; the faces are cropped out at 375 (they are visible from 768 up). |
| `hero-kitting-paketleme` (plate) | MARGINAL | The case edges are cut on all four sides; reads as a grid of parts, the "kit in a case" idea is lost. |
| `hero-kaynakli-imalat` (plate) | SURVIVES | Torch and flange. |
| `hero-makine-parkuru` (plate) | SURVIVES (crop) | Hall perspective centred (policy failure regardless of crop). |
| `hero-malzeme-kutuphanesi` (plate) | SURVIVES | Slugs centred. |
| `hero-kalite-kontrol` (plate) | SURVIVES | Probe and part; the inspector's face is cropped out at 375. |
| `hero-tolerans-hassasiyet` (plate) | MARGINAL | Caliper jaw and block survive; the caliper scale is cut at the top edge. |
| `hero-tolerans-hassasiyet` (`/` manifesto) | **CUT** | Only x 36–64 % survives: one caliper jaw and the block's corner, the scale and the measuring idea are gone. At mobile the band also lays a 96 %→20 % top-down overlay over it, so it functions as a backdrop under the headline, not as a picture. 10-2 needs a portrait crop or a different mobile source for this band. |
| `hero-dfm-tasarim` (plate) | MARGINAL | CAD screen cut on both sides; a person's shoulder remains at left. |
| `hero-yuzey-islemleri` (plate) | SURVIVES | Macro texture. |
| `hero-seri-uretim` (plate) | SURVIVES | Pattern image. |
| `hero-proje-yonetimi` (plate) | SURVIVES | Clipboard and part centred. |
| `hero-tedarik-zinciri` (plate) | SURVIVES | Bar ends fill the frame. |
| `hero-operasyonel-verimlilik` (plate) | SURVIVES | Spindle, control screen; people cropped out. |
| `hero-havacilik` (plate) | MARGINAL | Bracket's right end is cut by the frame edge. |
| `cnc-workshop` (15 sector plates + blog) | SURVIVES (crop) | 2.35:1 source, only the central 44 % width survives; the hall aisle is centred so it still reads as a hall — which is the policy problem, not a crop problem. |
| `quality-control` (blog plate) | SURVIVES | CMM bridge centred; 2.35:1 source, central 44 % width. |
| `service-cnc-freze` (blog plate) | SURVIVES (crop) | Spindle and chips centred; mood failure, see §4. |
| `blog-5eksen` (`/blog` lead + detail) | SURVIVES | Head and part. |
| `blog-dfm` (detail plate) | SURVIVES | Part on drawing. |
| `blog-malzeme` (detail plate) | SURVIVES | Slugs. |
| `industry-defense` (`/` featured, sector card, profile plate) | SURVIVES | Housing centred in all three; blurred people remain in the background at every size. |
| `industry-medical` (`/` grid, sector card, profile plate) | SURVIVES | Part centred; the part's top is touched by the profile plate window (y 20–80 %). |
| `industry-aerospace` (sector card) | SURVIVES | Square source in a square card, 100 %. |
| `industry-hydraulic` (sector card) | SURVIVES | 100 %; the two workers behind the block are fully in frame. |

Handoff to 10-2 (fixes are explicitly not in this packet): (1) the manifesto band needs mobile
art direction — it is the only CUT; (2) the plate frame's fixed 21 %-per-side loss at 375
argues for `<picture>`/`object-position` per asset on the eight MARGINAL heroes, or a taller
mobile frame; (3) `hero-cnc-tornalama` (900×504) and `service-cnc-freze` (800×544) are below the
1600 px standard and soft on 2× DPR; (4) `cnc-workshop` and `quality-control` are 2.35:1 and lose
56 % of their width in the plate frame — if either survives the policy review, it needs a 16:9 re-crop.

## 6. Commands and results

| Command | Result |
|---|---|
| `node measure.mjs` (header parser + ffprobe) over `src/assets/**`, `public/**` | 76 rows measured |
| `node refs.mjs` (basename grep, all text files, exclusions above) | reference map for 76 rows |
| `npm run build` at `a74e1f5` → `ls dist/assets` (media only) | 42 files (baseline) |
| `git mv` + `sed` import update, `npx tsc --noEmit -p tsconfig.app.json` | exit 0 |
| `git rm` × 20, re-grep for every removed basename | 0 hits |
| `npm run build` after governance → diff of media list | 1 line: `hero-basinçli-dokum-BZCCkd3Z.webp` → `hero-basincli-dokum-BZCCkd3Z.webp` |
| `vite preview --port 4187` + `crop-probe.mjs` at 375×812 over 61 routes, and 1280×800 over 5 | 59 element screenshots, 50 unique (asset, surface) windows |
| `ffmpeg crop=` of each measured window + contact sheets | inspected; §5.2 |
| `md5sum` over all assets | 0 duplicate groups |
| filename regex over `src/assets/**` | 0 violations |
| `npx tsc -b`, `npm run build`, `node scripts/claims-gate.mjs` on the final tree | see the packet return (pasted verbatim there) |
| `git rev-parse HEAD:e2e/__golden__` before / after | `576c3a488f99d57e33edcb5f1fe5adfde52304a7` both — no golden moved |
