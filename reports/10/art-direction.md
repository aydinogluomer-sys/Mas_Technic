# Phase 10-2b — Art direction, policy crops, dead public assets

Base commit `7fbb0b0` (head of `claude/awwwards-90-overhaul`, packet said `10a40a6`; `7fbb0b0`
is the docs commit on top of it). Requirement IDs 239–257, 670–679. Inputs:
`reports/10/asset-inventory.md` §4 (mood / §I policy) and §5 (375 crop),
`reports/10/responsive-images.md` §3 (cover geometry).

Every crop below is an ffmpeg `crop=` of the original pixels, re-encoded with the derivative
ladder's own settings (`libwebp`, q=85 — the quality every source resolved to in
`reports/10/derivatives.json` — `-preset photo -compression_level 6 -pix_fmt yuv420p`).
Nothing was scaled up, tinted, graded or generated. Every "375 / 1280 window" is the visible
source rectangle computed from the surface geometry the two input reports measured (cover fit
in a fixed-height box, the plate frame showing the central rows of that box, `object-position`
applied), and cut out of the file with ffmpeg for the contact sheets in `art-direction/`.

Contact-sheet column order, every row: **BEFORE full · before 375 window · before 1280 window ·
AFTER full · after 375 window · after 1280 window**. The label on each tile carries the window
in percent of the source. Files are `reports/10/art-direction/NN-*.webp`.

## 0. Orchestrator ruling — applied, not falsified

`USER_INPUTS.md` §I: `FACILITY_PHOTOS: NONE`, `MACHINE_PHOTOS: NONE`, `TEAM_PHOTOS: NONE`,
"never falsify the facility". I looked for evidence against the ruling and found none: the
two hall pictures are wide establishing shots of a machine hall (rows of machining centres,
people at the machines, a lit aisle), one under a page titled *Makine Parkuru* and the other
behind fifteen pages framed as "Bu sektörde ne üretiyoruz". Nothing on either page says the
picture is not MAS; a reader takes it as MAS. That is the falsification by implication the
ruling names. Applied.

## 1. Mapping — every replacement and crop

| # | Surface (route) | Before | After | Kind | Sheet |
|---|---|---|---|---|---|
| 1 | `/kabiliyetler/makine-parkuru` plate | `hero-makine-parkuru` 1600×896 — hall, rows of machining centres, people (**FACILITY + STAFF**) | `hero-cnc` **cropped in place** `crop=1260:708:0:60` → 1260×708 — spindle, coolant spray, part; the masked operator at the right edge is out of frame. Was dev-only (`LandingFlow`, orphan `HeroCanvas`); now also a public plate, 640/960 derivatives generated | replace + crop | `01` |
| 2 | `/endustriyel/*` fallback hero — 15 sector pages (every sector except `havacilik-uzay`) | `cnc-workshop` 1600×682 — wide empty hall (**FACILITY**), the single largest facility implication on the site | `hero-seri-uretim` 1600×896 — rows of identical black-oxide parts on black; no room, no machine, no person. Fallback expression in `ServiceDetail.tsx`; the 15 pages keep no `heroImage` field | replace | `02` |
| 3 | `/blog/endustriyel-yuzey-islemleri-rehberi` plate | `cnc-workshop` (same hall) | `hero-yuzey-islemleri` 1600×896 — bead-blasted vs brushed macro. The post's own caption is "Aynı alaşımda dört farklı yüzey bitişi" and its alt text describes parts with different finishes; the hall never matched them | replace | `03` |
| 4 | `/hizmetler/mekanik-montaj` plate | `hero-mekanik-montaj` 1600×896 — two faces framing the top edge (**STAFF**) | **cropped in place** `crop=1400:476:0:420` → 1400×476 (2.94:1). Torque wrench, gloved hands, bearing housing remain; the faces (y 0–33%, x 0–35% and 88–100%) are gone; what stays of the people is a black sleeve at each top corner (the inventory's *hands* class). Derivatives rebuilt with `--force` | crop | `04` |
| 5 | `/kabiliyetler/operasyonel-verimlilik` plate | `hero-operasyonel-verimlilik` 1600×896 — two people at the console, right and left (**STAFF**) | **cropped in place** `crop=1020:574:236:124` → 1020×574 (16:9). Spindle, vise with part, control screen remain; both people out (left one ended at x≈14%, right one began at x≈80%). Derivatives rebuilt | crop | `05` |
| 6 | `/` band 08 sector card *Enerji & Hidrolik* | `industry-hydraulic` 1200×1200 — two workers legible behind the manifold (**STAFF**) | **cropped in place** `crop=750:750:180:450` → 750×750. Manifold on granite, one idea; the workers (heads at y 5–25%) are gone, only an out-of-focus grey field remains above the block. 750 px covers the card at 2× (355 × 2 = 710). Not in the derivative list (single-size surface) | crop | `06` |
| 7 | `/kabiliyetler/kalite-kontrol` plate | `hero-kalite-kontrol` 1600×896 — inspector's face legible behind the CMM probe (**STAFF**), a second figure at left | `quality-control` 1600×682 — CMM bridge in a clean lab, no people (already the blog's CMM picture, and the `kabiliyetler` fallback). Why not a crop: the faces are on both sides of the probe, and the widest face-free window is ~740 px — a 1.85× upscale in the 1372 px plate at 1440 | replace | `07` |
| 8 | `/kabiliyetler/tasarim-rehberi-dfm` plate | `hero-dfm-tasarim` 1600×896 — engineer with glasses at left, colleagues behind (**STAFF**) | `blog-dfm` 1600×896 — machined housing standing on its own drawing (the inventory's "exemplary" DFM picture). Why not a crop: the face-free region is the screen alone (~740 px), the same upscale problem | replace | `08` |
| 9 | `/hizmetler/kimyasal-islemler` plate | `hero-kimyasal-islemler` 1600×900 — green tanks, blue pipework, green floor, wide plant (**mood FAIL**, heaviest hero at 237 KB) | `hero-anodizasyon` 1600×896 — black anodised parts dripping on the rack; anodising is itself a chemical surface process. No graphite region exists in the source (the whole frame is green/blue), so a crop could not keep the mood without recolouring, which is forbidden | replace | `09` |
| 10 | `/blog/cnc-torna-frezeleme-farki` plate | `service-cnc-freze` 800×544 — blue-tinted spindle and cyan chips (**mood FAIL**, smallest source, soft at 2×) | `hero-cnc-frezeleme` 1600×896 — spindle and coolant on a dark bed, which is what the post's alt text ("CNC freze tezgâhında işlenen prizmatik metal parça") already describes | replace | `10` |
| 11 | `/` band 09 manifesto, **≤ 767 px only** | `hero-tolerans-hassasiyet` 2400×1343 cover-fitted by height: window x 36–64% — one jaw and the block's corner, no scale (**CUT**) | `<picture>` + `<source media="(max-width: 767px)">` serving `hero-tolerans-hassasiyet-portrait` 800×1342, `crop=800:1342:1360:0` of the same photograph: scale numerals, both jaws, the pin on the granite. At 333×664 it is fitted by height too and shows x 8–92% of itself. 640 derivative; `sizes = max(100vw − 42px, 664px × 0.596)` = 396 px at 375 → 640 at 1×, the 800 source at 2×. ≥ 768 px renders exactly as before (the `<img>` keeps its 640/960/1600/2400 ladder) | portrait source | `11` — the "after 1280" tile is informational only; at 1280 the band still draws the landscape source, i.e. the "before 1280" tile |

Retired assets and what happened to their files:

| Asset | References after this packet | Action |
|---|---|---|
| `hero-makine-parkuru.webp` + `-640` + `-960` | 0 | deleted |
| `hero-kimyasal-islemler.webp` + `-640` + `-960` | 0 | deleted |
| `hero-kalite-kontrol.webp` | 1 — `src/components/landing/ProcessProofCinema.tsx:11` (dev-only `/legacy-landing`, not in `dist/`) | source kept; `-640`/`-960` deleted (0 references) |
| `hero-dfm-tasarim.webp` | 1 — `ProcessProofCinema.tsx:7` (dev-only) | source kept; `-640`/`-960` deleted |
| `cnc-workshop.webp` + `-640` + `-960` | 3 — `src/pages/Blog.tsx:33-35, 101` (`plateSources` map; the entry is now dead because no post carries this image, but the import still emits the files into `dist/`) | kept; `Blog.tsx` is outside this packet's allowlist. Listed in `make-derivatives.mjs` with the reason so `--check` stays green |
| `service-cnc-freze.webp` + `-640` | 3 — `src/pages/Blog.tsx:28-29, 99` (same dead map entry) | kept, same reason |

Not one public surface renders any of the six after this packet: `grep -rn` over `src/` for
each name returns only the `Blog.tsx` map lines and the dev-only imports quoted above, and
neither `Blog.tsx` entry can be selected (the map is keyed by the post's `image`, and no post
carries those URLs any more).

## 2. Staff crops — subject survival at every window

The crop rule from the packet: crop only where the subject survives at every plate/card size;
otherwise replace. The survival check, per cropped asset (windows from the sheet labels;
`scale` is the cover factor the browser draws the source at — > 1 is an upscale):

| Asset (after) | 375 plate/card window | 768 window | 1280 window | 1440 | Subject in every window |
|---|---|---|---|---|---|
| `hero-cnc` 1260×708 | x 21–79%, y 19–81%, scale 0.45 | x 10–90%, scale 0.69 | x 0–100%, y 19–81%, scale 0.96 | scale 1.09 | tool tip, coolant and the part sit at x 30–70% — yes |
| `hero-mekanik-montaj` 1400×476 | x 32–68%, y 19–81%, scale 0.67 | x 24–76%, scale 1.03 | x 12–88%, y 11–89%, scale 1.13 | scale 1.13 | wrench head at x 43–64%, bore at 54–80%: wrench + housing in every window — yes. Cost: 1.13× upscale from 1181 px up, on a shallow-focus close-up (soft by design); recorded as the residual risk |
| `hero-operasyonel-verimlilik` 1020×574 | x 21–79%, y 19–81%, scale 0.55 | x 10–90%, scale 0.86 | x 0–100%, y 19–81%, scale 1.19 | scale 1.35 | spindle and vise at x 30–60% — yes. 1.19–1.35× upscale from 1181 up, comparable to `hero-cnc-tornalama` (1.35×) which the inventory already carries |
| `industry-hydraulic` 750×750 | 100%, scale 0.44 | 100% (355 px card), scale 0.47 | 100% (303 px), scale 0.40 | 100% (343 px) | whole crop visible everywhere; at 2× the card needs 710 px ≤ 750 — yes |

The two that failed this check (`hero-kalite-kontrol`, `hero-dfm-tasarim`) were replaced (§1 rows 7–8).

`<img width/height>` on the sector cards: `FinalSections.tsx` prints `1200×1200` for all four
cards from one literal in `TechnicalSectors()`; the hydraulic card's asset is now 750×750.
The aspect the attributes reserve (1:1) is still exact, so layout is unaffected, but the
attribute no longer states the asset's true pixels. That line is outside this packet's
allowlist (`FinalSections.tsx` — manifesto band only); a one-token change for whoever owns
the sectors band. Recorded, not silently fixed.

## 3. The eight MARGINAL plates at 375 — fixed or kept, with reason

The 375 plate window for a 16:9 source is x 21–79% at `object-position: 50%`. A horizontal
shift moves that window; a vertical shift cannot help at 375 because the box already shows
the full source height (the frame's own 200-of-318 rows and the ±60 px parallax decide the
y-window regardless of position). So a MARGINAL verdict is fixable by `object-position` only
when the subject is off-centre horizontally and narrower than 58% of the source.

| Plate | Inventory verdict | Decision | 375 window before → after | Reason |
|---|---|---|---|---|
| `hero-tolerans-hassasiyet` | scale cut at the top | **fixed** — `object-position: 90% 50%` | x 21–79% → x 38–96% | caliper occupies x 55–95% of the 2400 px source; at 90% both jaws, the pin and the scale numerals are inside the window (the scale's top edge still leaves the frame — it runs to the source's top edge, so every window does that). Sheet `12` |
| `hero-havacilik` | bracket's right end cut | **fixed** — `40% 50%` | x 21–79% → x 17–75% | bracket spans x 15–77%; 40% centres it and both feet are in. Sheet `13` |
| `hero-kitting-paketleme` | case edges cut on all sides, reads as a grid of parts | **fixed** — `0% 50%` | x 21–79% → x 0–58% | left-aligned, the window keeps the case wall, hinge and latch, so it reads as a kit in a case; the centred window showed foam and parts only. Sheet `14` |
| `hero-dfm-tasarim` | screen cut both sides, shoulder at left | **fixed by replacement** (§1 row 8) | — | `blog-dfm`'s housing sits at x 33–66%, inside the centred window; the person is gone with the asset |
| `hero-enjeksiyon-kalibi` | mould plate cut both sides | **kept** | x 21–79% | the mould spans x 25–76%: it *is* inside the window horizontally; what is cut is the top and bottom bolt rows (y 5–90% vs the frame's 19–81%), which no position can change. Sheet `15` |
| `hero-basincli-dokum` | die outline lost both sides | **kept** | x 21–79% | die spans x 8–92% (84% of the source) — wider than any 58% window; a shift trades one side for the other. The cavity, which is the idea, is centred and whole. Sheet `16` |
| `hero-fikstur-aparat` | outer columns cut | **kept** | x 21–79% | fixture spans x 20–80%, the window 21–79%: symmetric, 1% each side. A shift would cut 2% from one side to save 1% on the other. Sheet `17` |
| `hero-tavlama` | furnace mouth cut, charge and smoke remain | **kept** | x 21–79% | the mouth spans x 5–95% (90%); the cut is horizontal on both sides *and* the charge sits at y 70–85%, at the frame's lower edge — a vertical problem no position solves at 375 (the parallax brings it fully in as the plate scrolls up). Still one idea (glowing charge in a furnace). Sheet `18` |

Manifesto at 375 (`/` band 09): the measuring idea — scale, jaws, pin — is on screen; sheet `11`,
column 5.

## 4. Dead public assets — greps, then deletion

Scope the packet named: `src/`, `index.html`, `vite.config.ts`, `public/*.html` (none exist —
`ls public/*.html` → "No such file or directory"), `e2e/`. Run at the tree immediately before
the `git rm` (commit `7eb73df`):

```
$ grep -rn "sequence-cnc"     src index.html vite.config.ts e2e   → (no output)  exit=1
$ grep -rn "machine-loop"     src index.html vite.config.ts e2e
src/pages/ServiceDetail.tsx:161:   `/machine-loop.mp4` autoplayed on a loop behind the hero with no pause
                                                                    exit=0  (a comment recording its removal from the hero — not a reference)
$ grep -rn "placeholder\.svg" src index.html vite.config.ts e2e   → (no output)  exit=1
$ grep -rn "mas-logo"         src index.html vite.config.ts e2e   → (no output)  exit=1
$ grep -rn "HeroCanvas"       src index.html vite.config.ts e2e
src/components/r3f/HeroCanvas.tsx:2: * HeroCanvas.tsx — Full-screen R3F canvas behind hero content
src/components/r3f/HeroCanvas.tsx:10:export const HeroCanvas = () => {
                                                                    exit=0  (both hits inside the file itself; no importer, no route)
$ grep -rn "sequence-" src | grep -v sequence-material              → (no output)  exit=1
   (no dynamic `/sequence-${x}` construction; the only preloader caller is
    MaterialMorphScroll.tsx:67 with basePath "/sequence-material")
```

Deleted (`git rm`): `public/sequence-cnc/` (120 files, 8,944,050 bytes), `public/machine-loop.mp4`
(427,192), `public/placeholder.svg` (3,253), `public/images/mas-logo.svg` (252; the `images/`
directory is now empty and gone), `src/components/r3f/HeroCanvas.tsx`. `dist/` after the build
contains `belgeler/`, `favicon.ico`, `index.html`, `robots.txt`, `sequence-material/`, `assets/`
and nothing else from `public/`.

Found, not actioned: `src/components/r3f/LiquidImage.tsx` — `HeroCanvas` was its only importer,
so it is an orphan now (`grep -rn LiquidImage src` → only its own file). Outside this allowlist.

## 5. Bytes

| | Before (`7fbb0b0`) | After |
|---|---|---|
| `public/` files copied verbatim into `dist/` | 4 dead items, 9,374,747 bytes | 0 |
| `src/assets/` files | 122 | 116 (−10 retired, +4: `hero-cnc-640/-960`, portrait + `-640`; four crops replaced their sources in place) |
| Heaviest plate source | `hero-kimyasal-islemler` 237,328 | `hero-tolerans-hassasiyet` 179,954 (unchanged) |
| `/` manifesto fetch at 375 @1× / @2× | 1600 candidate (101.6 K) / 2400 source (175.7 K) | portrait 640 (97.9 K) / 800 (130.1 K) |
| `dist/` `cnc-workshop*` + `service-cnc-freze*` (dead, via `Blog.tsx`) | 186 K | 186 K — see §1 table, handoff |

## 6. Goldens — which moved, and why, adjudicated at the DOM

`e2e/__golden__` before this packet: tree `576c3a488f99d57e33edcb5f1fe5adfde52304a7` (unchanged since
10-1). The four visual projects were run against the built tree **before** any golden was touched:
`4 failed, 142 passed, 18 skipped` — the four failures are exactly `landing-fullpage.png` at 375 /
768 / 1280 / 1440 (every other golden, including `inner-hero-sector-detail`, `inner-hero-service-detail`
and `waveb-journal-lead`, held: those elements carry no `<img>`).

Adjudication (`reports/10/probes/golden-adjudicate.mjs` → `golden-adjudicate.json`): Playwright's
pixelmatch diff image is decoded on a canvas, every red pixel is assigned to a row band, and each
band is matched against the document boxes of the elements this packet changed on `/` — the
manifesto band and the fourth sector card — read from the live DOM at the same viewport. Bands
inside an *untouched* picture are then checked against the candidate that picture resolves to.

| Project | Differing px | In `.tl-sector-card:nth-child(4)` (cropped `industry-hydraulic`) | In `.tl-manifesto` | Stray | Stray location and candidate | Verdict |
|---|---|---|---|---|---|---|
| visual-375 | 55,560 | 28,911 | 26,631 — the ≤767 `<source>`: `currentSrc` = `hero-tolerans-hassasiyet-portrait-640`, natural 395×664 | 18 | `.tl-process figure` (untouched), `hero-cnc-frezeleme-640` as in 10-2a §3.1 | moved by the card and the portrait crop; 18 px of raster noise |
| visual-768 | 33,299 | 32,887 | 351 — `currentSrc` = `hero-tolerans-hassasiyet-1600`, natural 1043×584, the same candidate 10-2a measured; the red pixels are scattered single pixels along the scale's engraved edges (crop `g768-m` inspected) | 61 | `.tl-process figure`, `hero-cnc-frezeleme-640`, same scattered pattern | moved by the card; the manifesto and figure pixels are the downscaled-WebP raster jitter `landing-golden.spec.ts` itself documents (`timeout: 30_000` comment) |
| visual-1280 | 24,018 | 24,018 | 0 | 0 | — | moved by the card only |
| visual-1440 | 30,927 | 30,763 | 130 — `hero-tolerans-hassasiyet-1600`, natural 1374×769, unchanged | 34 | `.tl-process figure`, `hero-cnc-frezeleme-960` | moved by the card; 164 px of jitter |

The card's own pixel count is the whole 333 / 355 / 303 / 343 px square minus the granite that
looks alike in both crops — the workers' silhouettes and the blurred hall behind them are gone, so
most of the upper half differs. The manifesto at 375 differs across the full 333×520 window
because the source changed from a 28%-wide slice of the landscape to the portrait cut.

Then `--update-snapshots` on `landing-golden.spec.ts` only (4 files re-generated), and the four
visual projects re-run in full against the new baselines: see §7.

`git status e2e/__golden__` after the update:
```
 M e2e/__golden__/win32/visual-1280/landing-fullpage.png
 M e2e/__golden__/win32/visual-1440/landing-fullpage.png
 M e2e/__golden__/win32/visual-375/landing-fullpage.png
 M e2e/__golden__/win32/visual-768/landing-fullpage.png
```
No other golden moved.

DOM read-back of every changed surface (`reports/10/probes/art-direction.probe.mjs` →
`art-direction.probe.json`, 375×812 mobile and 1280×800, `vite preview` of the built tree):

| Route | 375: `currentSrc` → natural, `object-position` | 1280: `currentSrc` → natural |
|---|---|---|
| `/` manifesto | `hero-tolerans-hassasiyet-portrait-640` → 395×664, inside `<picture>` (`display: contents`, one `<source media="(max-width: 767px)">`) | `hero-tolerans-hassasiyet-1600` → 1214×679 (unchanged) |
| `/` sector card 4 | `industry-hydraulic` → 750×750 (attrs still `1200×1200`, §2) | same, box 304×304 |
| `/kabiliyetler/makine-parkuru` | `hero-cnc-640` → 566×318 | `hero-cnc` → 1212×681 |
| `/endustriyel/medikal`, `/endustriyel/madencilik-ekipmanlari` (fallback) | `hero-seri-uretim-640` → 567×317 | `hero-seri-uretim` → 1212×678 |
| `/hizmetler/mekanik-montaj` | `hero-mekanik-montaj-960` → 935×317 (2.94:1: cover by height needs 935 px, so the 960 rung is right) | `hero-mekanik-montaj` → 1582×537 |
| `/kabiliyetler/operasyonel-verimlilik` | `-640` → 565×317 | source → 1212×682 |
| `/kabiliyetler/kalite-kontrol` | `quality-control-960` → 746×318 | `quality-control` → 1262×537 |
| `/kabiliyetler/tasarim-rehberi-dfm` | `blog-dfm-640` → 567×317 | `blog-dfm` → 1212×678 |
| `/hizmetler/kimyasal-islemler` | `hero-anodizasyon-640` | `hero-anodizasyon` |
| `/kabiliyetler/tolerans-hassasiyet` | `-640`, **`90% 50%`** | `-1600`, `90% 50%` |
| `/endustriyel/havacilik-uzay` | `-640`, **`40% 50%`** | source, `40% 50%` |
| `/hizmetler/kitting-paketleme` | `-640`, **`0% 50%`** | source, `0% 50%` |
| `/hizmetler/cnc-frezeleme` (control) | `hero-cnc-frezeleme-640`, `50% 50%` | source |
| `/blog/cnc-torna-frezeleme-farki` | `hero-cnc-frezeleme-640` | `hero-cnc-frezeleme` → 960×538 |
| `/blog/endustriyel-yuzey-islemleri-rehberi` | `hero-yuzey-islemleri-640` | `hero-yuzey-islemleri` → 960×538 |

## 7. Commands and results

All on the final tree of this packet, in the isolated worktree (`wt/coder-p10-2b`), Windows 11,
Node 26.3.0, ffmpeg 8.1.1, local Chrome as the Chromium executable (B08).

| Command | Result |
|---|---|
| `ffmpeg -i <src> -vf crop=W:H:X:Y -c:v libwebp -quality 85 -compression_level 6 -preset photo -pix_fmt yuv420p <out>` × 5 (`hero-cnc` 1260:708:0:60, `hero-mekanik-montaj` 1400:476:0:420, `hero-operasyonel-verimlilik` 1020:574:236:124, `industry-hydraulic` 750:750:180:450, `hero-tolerans-hassasiyet` → `-portrait` 800:1342:1360:0) | 5 files, dimensions verified with ffprobe |
| `node scripts/assets/make-derivatives.mjs hero-cnc` / `--force hero-mekanik-montaj hero-operasyonel-verimlilik` / `hero-tolerans-hassasiyet-portrait` | 640/960, 640/960 ×2, 640 — all q=85 |
| `node scripts/assets/make-derivatives.mjs --check` (after every step and on the final tree) | exit 0, no orphan, no missing derivative |
| `grep -rn <name> src index.html vite.config.ts e2e` for every retired asset and every dead public asset (§1, §4) | pasted in §1 / §4 |
| `npx tsc --noEmit -p tsconfig.app.json` after each step | exit 0 ×5 |
| `npx tsc -b` (final tree) | exit 0 — no output |
| `npx eslint` on the five edited TS/TSX files | exit 0 |
| `npm run build` | exit 0, `✓ built in 49.59s`; `dist/` carries 112 `.webp`, `sequence-material/` only |
| `node scripts/claims-gate.mjs` | `PASS — 0 unverified claims across 32 rules, 303 controls green` |
| `npx playwright test --project=critical-1280 --project=critical-375` (`PLAYWRIGHT_PREVIEW_ONLY=1`, port 4193) | **163 passed, 3 skipped**, exit 0 (12.7 min). Skips are the by-design viewport guards: `landing-grid-axes.spec.ts:133` (`width >= 768`) at 1280, `navigation-reachability.spec.ts:241` (`critical-1280` lane only) at 375, `technical-landing.spec.ts:179` (`< 1180`) at 375 |
| `npx playwright test --project=visual-375/768/1280/1440` before any golden change | 4 failed (the four `landing-fullpage.png`), 142 passed, 18 skipped |
| `node reports/10/probes/golden-adjudicate.mjs` | §6 table; every band inside the two changed elements or ≤ 61 px of raster jitter on an unchanged candidate |
| `npx playwright test e2e/visual/landing-golden.spec.ts --project=visual-* --update-snapshots` | 4 re-generated |
| `npx playwright test --project=visual-375/768/1280/1440` against the updated baselines | **146 passed, 18 skipped**, exit 0 (8.4 min) |
| `node reports/10/probes/art-direction.probe.mjs` (375 + 1280, 16 surfaces) | §6 read-back table |
| `git diff --check` before every commit | clean |

## 8. Handoff / not done here

- `src/pages/Blog.tsx` `plateSources`: drop the `serviceCncFreze` and `cncWorkshop` entries and
  their five imports; then delete `cnc-workshop{,-640,-960}.webp` and `service-cnc-freze{,-640}.webp`
  and the two names from `make-derivatives.mjs` SOURCES (186 K of dead `dist/` bytes).
- `FinalSections.tsx` `TechnicalSectors()`: the shared `width="1200" height="1200"` literal is
  wrong for the 750×750 hydraulic card (aspect still exact). One-token change, sectors band.
- `src/components/r3f/LiquidImage.tsx` is an orphan after `HeroCanvas` went; delete with the
  next dev-route cleanup.
- `hero-mekanik-montaj` (1400×476) and `hero-operasyonel-verimlilik` (1020×574) are drawn at
  1.13× / 1.19–1.35× from 1181 px up. If a commissioned photograph ever exists for either page it
  should replace the crop; until then this is the honest trade against a legible face.
- `hero-kalite-kontrol.webp` and `hero-dfm-tasarim.webp` (faces) still ship to nobody but are in
  the repo because `ProcessProofCinema.tsx` (dev-only) imports them; retiring `/legacy-landing`
  frees them.
