# Phase 10-2a — Responsive image markup, dimensions, fallback

Base commit `c2f0596` (head of `claude/awwwards-90-overhaul`). Requirement IDs 239–257
(responsive images), 670–679 (derivative pipeline). Input: `reports/10/asset-inventory.md`.

Every number below is measured against the production build served by `vite preview`
in headless Chrome at 375 / 768 / 1280 / 1440 CSS px, at device-pixel ratios 1 and 2
(`img-probe.mjs`, described in §6). "Source width `sizes` resolves to" is the browser's
own evaluation of the `sizes` attribute, read back through `naturalWidth` of the chosen
candidate; "Chosen" is `currentSrc`.

## 0. Summary

| Item | Result |
|---|---|
| `<img>` elements on public routes without `width`/`height` before | 6 (ServiceDetail plate on 47 routes, `/malzemeler` ×2, mini-doc, `BlurImage`, testimonials) — after: 0 |
| `<img>` elements whose `width`/`height` did not match the asset before | 11 sites (`1920×1080`, `1024×1024`, `1600×900`, `800×544`, `1024×640`, `800×640` placeholders) — after: 0 |
| Public-route images missing `loading="lazy"` / `decoding="async"` below the fold | after: 0; first picture of every route eager, no `fetchpriority` added |
| Surfaces carrying `srcset` + `sizes` | 7 surface types over 39 assets (§2) |
| Derivatives committed | 77 files (39 sources), 3.0 MiB, under `src/assets/` as `<name>-<w>.webp` (§1) |
| `BlurImage` missing-image fallback | shell-toned labelled block, proven with a wrong `src` (§5) |
| Golden baselines moved | 0 — `e2e/__golden__` untouched (§6) |

## 1. Derivative pipeline — `scripts/assets/make-derivatives.mjs`

ffmpeg 8.1.1 with `libwebp` (`sharp` is not installed and no npm package may be added).
For each listed source, the ladder widths 640 / 960 / 1600 **strictly smaller than the
source** are rendered with `scale=W:-2:flags=lanczos`, `-preset photo`, `-pix_fmt yuv420p`.
The source itself is always the widest `srcset` candidate, so nothing is re-encoded at its
own size and nothing is ever upscaled.

**Quality matched to the source.** Lossy WebP does not record its encoder quality. The
script decodes the source, re-encodes it at its own size across `q ∈ {60…95}` and keeps
the `q` whose file size lands closest to the source's — the best available estimate of
the setting the source was made with — then encodes all widths at that `q`. All 39 sources
resolved to **q = 85** (spot check, bytes of a same-size re-encode: `hero-cnc-frezeleme`
source 98,766 → q80 90,216 / q85 103,586 / q90 126,242; `hero-havacilik` 41,612 → q80
36,114 / q85 42,312 / q90 51,948), which is consistent with every source having come out of
the one `assets:sync` pipeline at canvas quality 0.82.

`--check` verifies each expected derivative exists at the right width and flags orphans;
`--report` writes `reports/10/derivatives.json` (source and derivative dimensions and bytes).

| Source class | Sources | Derivatives each | Files |
|---|---|---|---|
| 1600×896 / 1600×900 heroes and blog leads | 32 | 640, 960 | 64 |
| 1600×682 (`cnc-workshop`, `quality-control`) | 2 | 640, 960 | 4 |
| 2400×1343 (`hero-tolerans-hassasiyet`) | 1 | 640, 960, 1600 | 3 |
| 1200×1200 (`industry-defense`, `industry-medical`) | 2 | 640, 960 | 4 |
| 900×504 (`hero-cnc-tornalama`), 800×544 (`service-cnc-freze`) | 2 | 640 | 2 |
| **Total** | **39** | | **77** |

Bytes: `hero-cnc-frezeleme` 96.5 K → 640w 36.2 K, 960w 59.2 K; `hero-tolerans-hassasiyet`
175.7 K → 26.5 / 48.3 / 101.6 K; `hero-kimyasal-islemler` (the heaviest) 231.8 K → 56.0 /
110.5 K. Full table in `derivatives.json`.

## 2. Surfaces — which carry `srcset`, and why the others do not

Rule applied: a surface qualifies when the source width the browser needs for it (its
rendered width, or for an `object-fit: cover` box `max(width, height × aspect)`) crosses
more than one ladder bucket across 375 / 768 / 1280 / 1440 at 1× — or when the packet
names it.

### 2.1 Qualifying (carry `srcset` + `sizes`)

| Surface | File | Span / box | Assets |
|---|---|---|---|
| ServiceDetail plate hero (47 routes) | `src/pages/ServiceDetail.tsx` | `.shell-span-full` plate, 331 → 1372 px | all 31 `heroImageMap` entries + `cnc-workshop`, `quality-control` fallbacks |
| `/blog` lead plate | `src/pages/Blog.tsx` | `.shell-span-note` plate, 331 / 708 / 403 / 456 | whichever post is first (`blog-5eksen` today); map covers all 6 |
| `/blog/:slug` plate | `src/pages/BlogDetail.tsx` | `.shell-doc-main` plate, 331 / 708 / 807 / 914 | all 6 blog sources |
| Capability-profile plate | `src/pages/KabiliyetProfilDetay.tsx` | `.shell-span-note` plate | `industry-defense`, `industry-medical`, `hero-cnc-tornalama` |
| Landing 09 manifesto | `src/components/technical-landing/FinalSections.tsx` | full band, 333 → 1374 wide, 664 / 584 tall | `hero-tolerans-hassasiyet` (2400) |
| Landing 05 process figure | `src/components/technical-landing/ProcessNexusProjects.tsx` | cols 5–12, 333 / 355 / 809 / 916 | `hero-cnc-frezeleme` |
| Landing 07 featured project tile | same | cols 1–6, 332 / 355 / 607 / 687 | `industry-defense` (buckets 640 → 960) |

### 2.2 Not qualifying (source only; `width`/`height`, lazy/async added)

| Surface | Rendered | Why not |
|---|---|---|
| Landing hero part stage (`hero-manifold-v1`, 1672×941) | 333 / 412 / 704 / 797 | Crosses buckets, but it is the LCP image with a `<link rel="preload">` in `vite.config.ts`/`index.html`; a `srcset` here would make the browser pick a candidate the preload did not fetch (double download) unless the preload grows `imagesrcset`/`imagesizes` — `vite.config.ts` is outside this allowlist and LCP prioritisation is Phase 12's. Left as is. |
| Landing 08 sector cards (4 × 1200²) | 333 / 355 / 303 / 343 | One bucket at 1× (all ≤ 640). The honest optimisation is a single 640 source, but swapping the asset a surface uses is 10-2b's. |
| Landing 07 small project tiles (`industry-medical`, `hero-cnc-tornalama`) | 331 / 236 / 201 / 228 | One bucket at 1×. |
| Landing 10 mini-doc (`hero-manifold-v1` at 56×56) | 56 everywhere | Fixed size. A dedicated ~112 px crop would be the fix; that is an asset-choice decision. |
| `/malzemeler` stills (`/sequence-material/frame_0001.webp`, 1280×720) | 333 (mobile) / canvas fallback | `public/**` is DO_NOT_TOUCH and the 80-frame canvas sequence needs one frame size. |
| Dev-only `/legacy-landing` tree, orphan `testimonials-columns-1`, `IndustryStackCard` → `BlurImage` | not in `dist/` | Not public routes; intrinsic sizes corrected so the files are not wrong, nothing more. |

## 3. `sizes` — derived from the master grid and from cover geometry

Every `sizes` is built by `coverSizes(aspect, boxHeight, entries)` in
`src/components/BlurImage.tsx` as `max(boxWidth, boxHeight × aspect)` per breakpoint. The
plate frame is a fixed-height `object-fit: cover` box (`clamp(200px, 33vw, 420px)` + 120 px
parallax overscan − 2 px border), so at 375 it is 331×318 and shows the central 58 % of a
16:9 source drawn **568 px** wide — a `sizes` of `331px` there would make the browser pick a
640 candidate at 2×… and a 640 candidate at 1× only by coincidence, then draw it 1.7× up
before cropping. The measured spans:

| Span | ≤ 767 | 768–1180 | ≥ 1181 (cap at the 1600 sheet) |
|---|---|---|---|
| `.shell-span-full` plate | `100vw − 44px` (331) | `100vw − 60px` (708) | `min(100vw − 68px, 1532px)` (1212 / 1372) |
| `.shell-span-note` plate | same | same | `min((100vw − 66px) / 3 − 2px, 509px)` (403 / 456) |
| `.shell-doc-main` plate | same | same | `min((100vw − 66px) × 2/3 − 2px, 1021px)` (807 / 914) |
| Manifesto (`.tl-manifesto-body`) | `100vw − 42px`, box 664 tall | `100vw − 58px`, 584 tall | `min(100vw − 66px, 1534px)` |
| Process figure | `100vw − 42px`, 312 tall | `(100vw − 56px) / 2`, 348 tall | `min((100vw − 66px) × 2/3, 1023px)` |
| Featured tile | `100vw − 43px`, 216 tall | `(100vw − 56px) / 2 − 1px`, 264 tall | `min((100vw − 66px) / 2, 767px)` |

Two consequences worth stating plainly: the **manifesto at 375 needs ~1186 px of source**
(664 × 1.787) although only 333 px are visible — the 10-1 inventory's one CUT verdict, and
the reason 10-2b's mobile art direction for that band will also be a bytes win; and the
**2.35:1 sources** (`cnc-workshop` on 15 sector pages, `quality-control`) need 746 px at
375 and 1262 px at 1280 in the doc/full plates, because the frame is taller than they are.

### 3.1 Measured: rendered box, resolved `sizes`, chosen candidate

| Route | Asset | Box 375 / 768 / 1280 / 1440 (CSS px) | Source width `sizes` resolves to | Chosen @1× 375 / 768 / 1280 / 1440 | Chosen @2× 375 / 768 / 1280 / 1440 |
|---|---|---|---|---|---|
| `/` | `hero-cnc-frezeleme` (process) | 333×312 / 355×348 / 809×348 / 916×348 | 557 / 621 / 809 / 916 | 640 / 640 / 960 / 960 | 1600 src / 1600 src / 1600 src / 1600 src |
| `/` | `industry-defense` (featured) | 332×216 / 355×264 / 607×264 / 687×264 | 332 / 355 / 607 / 687 | 640 / 640 / 640 / 960 | 960 / 960 / 1200 src / 1200 src |
| `/` | `hero-tolerans-hassasiyet` (manifesto) | 333×664 / 710×584 / 1214×584 / 1374×584 | 1186 / 1043 / 1214 / 1374 | 1600 / 1600 / 1600 / 1600 | 2400 src / 2400 src / 2400 src / 2400 src |
| `/blog` | `blog-5eksen` | 331×318 / 708×371 / 403×538 / 456×538 | 567 / 708 / 960 / 960 | 640 / 960 / 1600 src / 1600 src | 1600 src ×4 |
| `/blog/5-eksen-cnc-isleme-avantajlari` | `blog-5eksen` | 331×318 / 708×371 / 807×538 / 914×538 | 567 / 708 / 960 / 960 | 640 / 960 / 1600 src / 1600 src | 1600 src ×4 |
| `/blog/cnc-torna-frezeleme-farki` | `service-cnc-freze` (800) | 331×318 / 708×371 / 807×538 / 914×538 | 467 / 708 / 807 / 914 | 640 / 800 src / 800 src / 800 src | 800 src ×4 |
| `/blog/kalite-kontrol-cmm-olcum` | `quality-control` (2.35:1) | 331×318 / 708×371 / 807×538 / 914×538 | 746 / 871 / 1262 / 1262 | 960 / 960 / 1600 src / 1600 src | 1600 src ×4 |
| `/hizmetler/cnc-frezeleme` | `hero-cnc-frezeleme` | 331×318 / 708×371 / 1212×538 / 1372×538 | 567 / 708 / 1212 / 1372 | 640 / 960 / 1600 src / 1600 src | 1600 src ×4 |
| `/hizmetler/cnc-tornalama` | `hero-cnc-tornalama` (900) | 331×318 / 708×371 / 1212×538 / 1372×538 | 567 / 707 / 1212 / 1372 | 640 / 900 src / 900 src / 900 src | 900 src ×4 |
| `/kabiliyetler/tolerans-hassasiyet` | `hero-tolerans-hassasiyet` | 331×318 / 708×371 / 1212×538 / 1372×538 | 568 / 708 / 1212 / 1372 | 640 / 960 / 1600 / 1600 | 1600 / 1600 / 2400 src / 2400 src |
| `/endustriyel/medikal` | `cnc-workshop` (2.35:1) | 331×318 / 708×371 / 1212×538 / 1372×538 | 746 / 871 / 1262 / 1372 | 960 / 960 / 1600 src / 1600 src | 1600 src ×4 |
| `/kabiliyet-profilleri/hassas-mil` | `hero-cnc-tornalama` | 331×318 / 708×371 / 403×538 / 456×538 | 567 / 707 / 960 / 960 | 640 / 900 src / 900 src / 900 src | 900 src ×4 |
| `/kabiliyet-profilleri/ince-cidarli-govde` | `industry-defense` | 331×318 / 708×371 / 403×538 / 456×538 | 331 / 707 / 538 / 538 | 640 / 960 / 640 / 640 | 960 / 1200 src / 1200 src / 1200 src |

Reading it: at 375 @1× every 16:9 plate now fetches the 640 derivative (24–56 K instead of
40–232 K); at 768 the 960; the full-width plate at ≥ 1280 correctly stays on the 1600
source. One honest edge: the note/doc plates at ≥ 1181 resolve to 960.7 px (538 × 1.786),
one pixel over the 960 candidate, so the browser takes the 1600 source there — a 1024
rung would close it, but the packet's ladder is 640 / 960 / 1600 and the rule is not to
invent one.

The first probe of this packet (`probe-after.json`) caught a real defect before commit:
`calc(clamp(200px, 33vw, 420px) + 118px * 1.786)` evaluated to 410 px at 375, not 568,
because `*` bound to the last term. `coverSizes` now parenthesises the height
(`8ffa527`); the table above is from the corrected build.

## 4. Intrinsic dimensions, lazy/async, first-hero policy — every public-route `<img>`

| Route | Asset | Surface | `width`×`height` | `loading` | `decoding` | `srcset` | Rendered 375 / 768 / 1280 / 1440 |
|---|---|---|---|---|---|---|---|
| `/` | `hero-manifold-v1` | `.tl-part-frame` (first hero) | 1672×941 | eager (unchanged, `fetchpriority` pre-existing) | — | — | 333 / 412 / 704 / 797 |
| `/` | `hero-cnc-frezeleme` | process figure | 1600×896 (was 1920×1080) | lazy | async | 3 | 333 / 355 / 809 / 916 |
| `/` | `industry-defense` | featured tile | 1200×1200 (was 1024²) | lazy | async | 3 | 332 / 355 / 607 / 687 |
| `/` | `industry-medical` | tile | 1200×1200 (was 1024²) | lazy | async | — | 331 / 236 / 201 / 228 |
| `/` | `hero-cnc-tornalama` | tile | 900×504 (was 1024²) | lazy | async | — | 331 / 236 / 202 / 229 |
| `/` | `industry-*` ×4 | sector cards | 1200×1200 (was 1024²) | lazy | async | — | 333 / 355 / 303 / 343 |
| `/` | `hero-tolerans-hassasiyet` | manifesto | 2400×1343 (was 1920×1080) | lazy | async | 4 | 333 / 710 / 1214 / 1374 |
| `/` | `hero-manifold-v1` | mini-doc | 1672×941 (was none) | lazy | async | — | 56 |
| `/blog` | lead | `.shell-span-note` plate (first picture) | 1600×896 (was 1024×640) | eager (was lazy) | — | 3 | 331 / 708 / 403 / 456 |
| `/blog/:slug` | 6 sources | `.shell-doc-main` plate (first picture) | per asset (was 1600×900 for all) | eager | — | 2–3 | 331 / 708 / 807 / 914 |
| `/hizmetler|kabiliyetler|endustriyel/:slug` | 33 sources | `.shell-span-full` plate (first picture) | per asset (was none) | eager (unchanged) | — | 2–4 | 331 / 708 / 1212 / 1372 |
| `/kabiliyet-profilleri/:slug` | 3 keys | `.shell-span-note` plate (first picture) | per asset (was 1024²) | eager (was lazy) | — | 2–3 | 331 / 708 / 403 / 456 |
| `/malzemeler` | `frame_0001` ×2 | mobile still, canvas fallback | 1280×720 (was none) | lazy | async | — | 333 (mobile) |

Layout effect of the attribute changes: none measurable — every one of these images has
both axes set in CSS (`width:100%; height:100%; object-fit:cover`, or `56px` square), so
the attribute only feeds the pre-load `aspect-ratio`; the rendered boxes above are
identical to the base-build probe (`probe-base.json`) to the pixel.

`fetchpriority` was not added anywhere; the landing hero's pre-existing `fetchPriority="high"`
is untouched.

## 5. `BlurImage` fallback — proof

`src/components/BlurImage.tsx`: `onError` sets `failed`, and the `<img>` is replaced by
`<div role="img" aria-label={alt} data-image-fallback>` — ground `var(--sf-field,
var(--tl-panel))`, hairline `var(--sf-rule, var(--tl-rule))`, mono label in
`var(--sf-meta, var(--tl-on-dark-meta))`, the alt text printed uppercase at the bottom.
No hex, no broken-image glyph, alt text kept in the accessibility tree.

Proof (`reports/10/probes/blurimage-fallback.probe.mjs` + `.entry.tsx`): esbuild bundles
the real component with `src="/assets/this-file-does-not-exist.webp"` next to a healthy
sibling, served from an in-memory route in headless Chrome. Read back:

```json
{ "broken_has_img": false, "fallback_role": "img",
  "fallback_label": "Hassas işlenmiş metal parça", "fallback_bg": "rgb(12, 17, 20)",
  "fallback_color": "rgb(164, 171, 168)", "fallback_font": "\"IBM Plex Mono\", ui-monospace, monospace",
  "fallback_box": [320, 180], "ok_natural": [640, 358],
  "ok_attrs": ["1600", "896", "lazy", "async"], "ok_filter": "blur(0px)" }
```

Screenshot: `reports/10/blurimage-fallback-proof.png`. No route was edited to prove it.
`BlurImage`'s only consumer (`IndustryStackCard`) has no importer today, so the fallback
is not reachable from a public route yet; it is the primitive future plates should use.

## 6. Commands and results

| Command | Result |
|---|---|
| `node scripts/assets/make-derivatives.mjs --report reports/10/derivatives.json` | 39 sources, 77 derivatives, all q=85, 2 m 58 s |
| `node scripts/assets/make-derivatives.mjs --check` | exit 0 |
| `node blurimage-fallback.probe.mjs` | fallback rendered, no `<img>` in the failed slot (§5) |
| `npx tsc --noEmit -p tsconfig.app.json` (after each step) | exit 0 |
| `npx tsc -b` | exit 0 (pasted in the packet return) |
| `npm run build` | exit 0 (built in 37–46 s; 82 derivative files in `dist/assets`) |
| `node scripts/claims-gate.mjs` | PASS — 0 unverified claims across 32 rules, 303 controls green |
| `img-probe.mjs` at 375/768/1280/1440 × DPR 1/2 over 12 routes, base and after | 85 + 170 + 170 rows; tables in §3.1 / §4 |
| `npx playwright test --project=critical-1280` (preview-only on the built tree) | **82 passed, 1 skipped** (`landing-grid-axes.spec.ts:133`, `test.skip(width >= 768)` — the mobile-rail contract, by design at 1280), exit 0 |
| `npx playwright test --project=visual-1280` (extra signal, not required) | 39 passed, 2 failed — both `radius-census.spec.ts`. First run also listed `MaterialMorphScroll.tsx:228/357/359`: the new attributes had pushed the cited radius lines down; fixed in `f7874dd` by folding the attributes onto existing lines (file length unchanged). The remaining failure is `ChatBot.tsx:294` — pre-existing at `c2f0596` (`e2e/visual/radius-census.ts` cites 294, `docs/lean/17 §4` cites 332, line 294 is `addAssistantMsg(...)`); both files are outside this allowlist. No screenshot golden failed. |
| `git rev-parse HEAD:e2e/__golden__` | `576c3a488f99d57e33edcb5f1fe5adfde52304a7` before and after — no golden moved |

Probe method: `vite preview` of the production build; a Playwright script (local Chrome,
`reducedMotion: reduce`) visits each route at each viewport/DPR, scrolls the document to
fire lazy loads, then reads for every `<img>` its attributes, `getBoundingClientRect`,
`naturalWidth/Height` and `currentSrc`. With a `srcset`, Chrome reports `naturalWidth` as
the candidate's width divided by its density — i.e. the resolved `sizes` value — which is
what the "resolves to" column prints.

## 7. Handoff / not done here

- The natural home for `PLATE_IMAGE_HEIGHT` and the three span-width tables is
  `src/components/shell/ShellPlate` (one constant, next to the CSS it mirrors); they are
  repeated in four page files because `src/components/shell/**` is outside this allowlist.
- `blogData.ts` / `case-study-figures.ts` still store only the 1× URL; the page files map
  URL → `ResponsiveImage`. When 10-2b swaps an asset there, the maps in `Blog.tsx` /
  `BlogDetail.tsx` / `KabiliyetProfilDetay.tsx` and `SOURCES` in the script need the new name.
- Manifesto mobile art direction (portrait crop) — 10-2b; it also removes the 1186 px need at 375.
- Landing hero `srcset` requires `imagesrcset`/`imagesizes` on the preload — Phase 12.
- Sector cards / small tiles / mini-doc: a single smaller source each — asset-choice, 10-2b.
- Found, not actioned: the radius register's `ChatBot.tsx:294` citation has drifted (the launcher is at 332); `e2e/visual/radius-census.ts` and `docs/lean/17` need the same one-line correction, by whoever owns them.
- `src/components/BlurImage.tsx` now exports `responsive()` / `coverSizes()` beside the component; ESLint's `react-refresh/only-export-components` warns (2 warnings, 0 errors). A `src/lib/responsive-image.ts` home would silence it — a new file, outside this allowlist.
