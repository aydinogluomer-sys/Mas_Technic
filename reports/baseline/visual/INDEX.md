# Phase 00 — Visual Baseline Index

**Base commit:** `6ffde20`
**Captured by:** `reports/baseline/tools/capture-baseline.mjs` (throwaway; not production `scripts/`)
**Machine manifest:** `manifest.json` in this directory (per-shot HTTP status, document height,
horizontal-overflow flag, console errors, byte size).
**Capture log:** `reports/baseline/raw/capture.txt`

## Capture conditions — read before trusting a pixel

| Condition | Value | Why it is recorded |
|---|---|---|
| Build | `npm run build` **with `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` supplied** | Without them the whole React tree fails to mount and every screenshot would have been the static intro shell only. See `build-test-baseline.md` §5. |
| Server | `npm run preview --port 4173 --strictPort`, started and stopped by the capture script | — |
| Browser | Locally installed **Chrome** (`C:\Program Files\Google\Chrome\Application\chrome.exe`) | The bundled Playwright browser revision (1217) is not among the installed revisions (1223/1228/1234). `playwright.config.ts` uses the same escape hatch. |
| Motion | **`prefers-reduced-motion: reduce` emulated** for every shot, plus a CSS override zeroing all `animation-*`/`transition-*` durations and `scroll-behavior` | Deterministic captures. **Consequence: these images show the reduced-motion rendering, not the full-motion rendering.** Scroll-driven reveals, the marquee and the reverse-scroll parallax are parked at their resting state. |
| Readiness | `waitUntil: "networkidle"` → 1.2 s settle → scripted full-document scroll to force `loading="lazy"` decode → 1.2 s settle | — |
| Scale | `deviceScaleFactor: 1`, `locale: "tr-TR"`, full-page | — |
| Size discipline | PNG re-captured as JPEG q80 if > 8 MB | **Not triggered** — largest PNG is 2.09 MB. |
| Total | **11 / 11 captured, 12.4 MB** (budget ≈ 60 MB) | No capture failed. |

---

## Landing route `/` across the five required widths

| File | Route | Viewport | Doc height | Bytes | What is visibly notable / wrong |
|---|---|---|---|---|---|
| `landing-375.png` | `/` | 375×812 | 8,939 px | 996 kB | Bands stack correctly and there is **no horizontal overflow**, but the page becomes an 8,939 px (≈11 screen) scroll. The 6-cell proof strip collapses to a 2-column grid where `±0.005 mm` sits directly above `48 SAAT` — four unverified numbers in the first screen and a half. The NEXUS table (band 06) becomes a horizontally scrollable region with a `TABLOYU YATAY KAYDIR →` cue, i.e. a nested scroll inside a vertical scroll. Band-index rail (`01 HEADER` …) is still painted at 375 and eats left gutter. |
| `landing-768.png` | `/` | 768×1024 | 5,798 px | 1.20 MB | The **worst breakpoint of the five.** The hero splits into a headline block, a dimensioned part and a `PARÇA BİLGİSİ` passport that reflows into a squat horizontal strip — the drawing annotations (`Ø 28.000 ±0.005`, `72.000/±0.010`, `Ra 0.4 µm`) crowd into the top-right corner and the leader lines lose their geometric relationship to the part. The process step list (band 05) drops to a 2×2 grid while its figure stays half-width, leaving a large empty quadrant. Sector cards (band 08) go 2×2 and the certificate strip (band 10) wraps 3+3, orphaning the `QUALITY ASSURED` stamp on its own row. |
| `landing-1280.png` | `/` | 1280×800 | 3,844 px | 1.64 MB | The intended composition. Reference layout for the grid phase. |
| `landing-1440.png` | `/` | 1440×900 | 3,892 px | 1.88 MB | Canonical desktop view. All 14 numbered bands render in order. Visible content problems (not layout): `AS9100D` certificate card with a fake wet signature; `±0.005 mm / 48 SAAT / 50+ / %100 / %98` proof strip; `ZTM` in the reference band; `DEMO İÇERİK` and `ÖRNEK İÇERİK` badges on bands 06/07/10; `KAYNAKLAR HAZIRLANIYOR` with four non-clickable PDF rows; `DOĞRULAMA SERVİSİ HAZIRLANIYOR` under a decorative QR. |
| `landing-1600.png` | `/` | 1600×900 | 3,981 px | 2.09 MB | Document height *grows* 89 px versus 1440 instead of shrinking — the sheet does not gain a wider measure, so wide viewports get more letterboxing rather than more content per row. Sheet stays centred with growing side margins; the band-index rail drifts further from the content column. |

**Cross-width facts from `manifest.json`:** `horizontalOverflow: false` at all five widths, HTTP 200
at all five, **zero console errors** at all five. The landing is structurally sound; the problems
are compositional (768 px) and factual (claims), not broken layout.

## Design-language break — inner pages at 1440

| File | Route | Doc height | Bytes | What is visibly wrong / notable |
|---|---|---|---|---|
| `hakkimizda-1440.png` | `/hakkimizda` | 2,121 px | 678 kB | **Two design languages on one page.** The top half is a light/off-white generic corporate page with a thin serif-less heading and four flat outlined cards (`Misyon / Vizyon / Ekip / Kalite`); the bottom half is the dark `MAS TECHNIC` watermark mega-footer. Nothing connects them — no shared rule, no shared type scale, no shared rhythm. Content problems visible in the shot: *"ISO 9001:2015, AS9100D ve IATF 16949 sertifikalarına sahip … ±0.005mm hassasiyette"* and the `Ekip` card reading *"50+ deneyimli mühendis ve teknisyenden oluşan uzman kadro"* — a team-size disclosure `USER_INPUTS.md` §D marks `PRIVATE_DO_NOT_DISCLOSE`. Footer bottom bar shows `IST 05:20:10`. The whole "about" page is ~600 px of content followed by ~1,500 px of footer. |
| `iletisim-1440.png` | `/iletisim` | 2,869 px | 729 kB | Generic SaaS contact layout: 4 teal-iconed info cards, a two-column form block with a teal header bar (`Online Toplantı Planlayın` — Google Meet), a `Hızlı Mesaj` card and an `Acil mi?` box. Native `gg.aa.yyyy` date input and a `Saat Seçin` select sit unstyled next to bespoke fields. Again the dark mega-footer is bolted onto a light page. Zero relationship to the drawing-sheet language of `/`. |
| `teklif-al-1440.png` | `/teklif-al` | **900 px** | 84 kB | The primary conversion page. Light theme, teal accent, rounded cards, dashed dropzone — a fourth aesthetic. **It has no footer at all** (`src/pages/TeklifAl.tsx:54` imports `Footer` and never renders it), so there are no legal links, no secondary navigation and no exit path except the chat bubble. Header is a bare `MT` square plus a mute and a theme toggle. The visible copy states `STEP, STP, STL, OBJ, IGES, 3MF • Maks. 50 MB`, which contradicts the landing FAQ's `DWG ve PDF` claim. Document height equals the viewport, so the 84 kB shot is the entire page. |
| `blog-1440.png` | `/blog` | 3,343 px | 1.67 MB | Standard 2-column blog grid + right sidebar. **Fabricated analytics rendered as fact:** per-card eye-icon counts `3.420 / 2.890 / 2.100 / 1.870 / 1.560 / 2.340`, an `EN POPÜLER YAZILAR` ranking derived from them, and a `BLOG İSTATİSTİKLERİ` panel showing `6 TOPLAM YAZI · 14.2K TOPLAM OKUMA · 5 KATEGORİ · 2 ÖNE ÇIKAN`. `USER_INPUTS.md` §K says `ANALYTICS_PROVIDER: NONE`. Six posts total. Newsletter capture with no backend evidence. Dark mega-footer again. |
| `sss-1440.png` | `/sss` | **13,326 px** | 1.55 MB | **The single worst page in the capture set.** ~130 FAQ accordion rows (16 general + every `faq` entry aggregated from `src/data/servicePages.ts` via `SSS.tsx:53`) in one unpaginated, unvirtualised column that is roughly 60 % of the viewport width, leaving a permanently empty right third below the sidebar. At 13,326 px it is 3.4× taller than the entire landing page. The first item is force-opened; everything else is a hairline-separated grey row, so the page reads as an undifferentiated list with no hierarchy, no grouping rhythm and no scannable anchors. Filter chips and a search box exist at the top but there is no sticky control, so after ~2 screens the user has no way back to them. |
| `notfound-1440.png` | `/bu-sayfa-yok-404-baseline` | 900 px | 507 kB | **Third/fourth visual language.** Near-white radial background with pale-teal canvas ribbons, an outlined `404`, `ARADIĞINIZ SAYFA BULUNAMADI`, `Bu koordinatlarda işlenecek parça yok.`, four flat quick-link tiles and two buttons. **No header, no footer, no navigation.** Bottom-right diagnostic text reads `ERR: PAGE_NOT_FOUND / STATUS: 404 // REDIRECT: 15s` — and `src/pages/NotFound.tsx:16-26` really does force `window.location.href = "/"` after a 15-second countdown, which is a usability and accessibility problem (a user reading the page is ejected). Also: the server returns **HTTP 200** for this URL (SPA fallback), so the 404 is soft. Console shows `404 Error: /bu-sayfa-yok-404-baseline`. |

---

## Summary of what the visual baseline proves

1. **Four distinct public visual languages coexist:** dark technical-editorial (`/`), light-corporate + dark mega-footer (`/hakkimizda`, `/iletisim`, `/blog`, `/sss`), chrome-less light/teal SaaS (`/teklif-al`), and the light/teal 404. Nothing is shared: not the type scale, not the accent colour, not the grid, not the header, not the footer presence.
2. **The landing is the only page with a design system.** It is also the only page with a 14-band numbered structure, a rail, and a consistent type/rule vocabulary.
3. **No horizontal overflow anywhere** at any captured width — the redesign starts from a structurally clean base.
4. **768 px is the weakest landing breakpoint**; 1600 px reveals that the sheet does not scale up.
5. **Document heights are wildly inconsistent** for comparable content: 900 px (`/teklif-al`) → 2,121 px (`/hakkimizda`) → 13,326 px (`/sss`).
6. **Content-truth defects are visible without reading any code** — certifications, tolerances, team size and blog analytics are all legible in the screenshots.

Owners per `IMPLEMENTATION.md` §8: Phase 02 (grid), Phase 03 (navigation), Phase 04 (shell),
Phase 06 (content truth), Phase 07/08 (inner pages, 404), Phase 10 (art direction).
