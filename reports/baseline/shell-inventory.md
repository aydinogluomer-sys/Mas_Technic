# Phase 00 — Header / Navigation / Footer / Page-Shell Inventory

**Base commit:** `6ffde20`
**Purpose:** expose how many *parallel* navigation and page-shell languages exist today.
Nothing here is changed in Phase 00 — this is measurement only.

**Headline: there are three mutually incompatible public shells, plus a fourth
(panel) shell, plus one route with no shell at all.**

---

## 1. Header / navigation implementations

| # | File | Lines | Consumed by | Design language (one line) |
|---|---|---|---|---|
| H1 | `src/components/Header.tsx` | 1 | *(indirection only)* | Not a component. Single line: `export { HeaderFullscreen as Header } from "./HeaderFullscreen";` — every `import { Header }` in `src/pages/**` actually gets `HeaderFullscreen`. |
| H2 | `src/components/HeaderFullscreen.tsx` | 301 | `/hakkimizda`, `/iletisim`, `/sss`, `/blog`, `/blog/:slug`, `/malzemeler`, `/malzemeler/:slug`, `/hizmetler/*`, `/kabiliyetler/*`, `/endustriyel/*`, `/kvkk`, `/gizlilik-politikasi`, `/cerez-politikasi`, `/teklif-al`, `/legacy-landing`, `/test` (and the orphan `CADDashboard.tsx`) | Minimal floating "MT" mark + sound/theme toggles that portal into `#shared-header-host` (`App.tsx:194`), opening a **Framer-Motion fullscreen overlay menu** with a three-rail layout (family → category → conversion). Samples `[data-surface]` zones on scroll to invert its own contrast. Dark-on-light default, teal accent. |
| H3 | `src/components/technical-landing/TechnicalHeader.tsx` | 79 | `/` and `/technical-preview` **only** | Persistent in-sheet drawing-header band: monospace `MAS TECHNIC / PRECISION CNC` wordmark, six **hash-only** nav items, a TR/EN pair where EN is inert, a `TEKLİF AL` button, and its own hand-rolled mobile dialog with a manual focus trap. Dark graphite, IBM Plex Mono, technical-drawing rules. **Shares no code, no tokens and no route vocabulary with H2.** |
| H4 | `src/components/menu/MenuFamilyRail.tsx` (57), `MenuCategoryPanel.tsx` (85), `MenuConversionRail.tsx` (17), `MenuTrigger.tsx` (44), `menu-tokens.ts` | 203 total | H2 only | Sub-parts of the fullscreen overlay. `menu-tokens.ts` is a *second* motion-token source that is not the technical-landing motion system. |
| H5 | `src/components/navigation-data.tsx` | — | H2 only | The IA data source (families → categories → links). **The landing header H3 does not read it**, so the site has two disjoint navigation vocabularies. |

**Consequence:** the home page and every inner page present a different header, a
different menu interaction model, a different type system, and a different link set.
Owner: Phase 03 (IDs 39–73, 270–280, 613–624) and Phase 04 (IDs 74–110, 444–450, 738).

## 2. Footer implementations

| # | File | Lines | Consumed by | Design language |
|---|---|---|---|---|
| F1 | `src/components/Footer.tsx` | 161 | Every inner page that imports it (see table below) | Large dark "mega footer": full-bleed `MAS TECHNIC` watermark, grid pattern + radial glow backdrop, a scrolling `MarqueeBand`, 4 link columns (desktop) that collapse into `FooterAccordion` disclosures (mobile), newsletter capture, a big CTA slab, and a bottom legal bar with a live `IST hh:mm:ss` clock. Framer-Motion stagger reveals. |
| F2 | `src/components/footer/` — `FooterBackdrop.tsx` (49), `FooterBrand.tsx` (42), `FooterNewsletter.tsx` (62), `FooterCTA.tsx` (71), `FooterBottomBar.tsx` (47), `footerLinks.ts` | 271 + data | F1 only | Composition parts of F1. `footerLinks.ts` is a **third** link taxonomy, distinct from both `navigation-data.tsx` and the landing `footerColumns`. |
| F3 | `DrawingFooter` in `src/components/technical-landing/FinalSections.tsx:294-340` | 47 | `/` and `/technical-preview` only | Technical-drawing **title block**: address/phone/mail as an `<address>`, 4 nav columns from `footerColumns` (`src/data/technicalLandingData.ts:115-151`), social icons, and a fake drawing-sheet meta run (`ÇİZEN / ÖLÇEK 1:1 / TARİH 17.05.2024 / REVİZYON B / PAFTA 01/12`). |

**Three link taxonomies exist in parallel:** `navigation-data.tsx` (menu),
`footer/footerLinks.ts` (inner-page footer), `technicalLandingData.footerColumns` (landing footer).

## 3. Page-shell / chrome layers (global, route-independent)

| # | File | Lines | Scope | Notes |
|---|---|---|---|---|
| S1 | `src/App.tsx` `AppContent` | — | all non-panel routes | Renders skip-link, `#shared-header-host` portal target, `ScrollToTop`, routes, and conditionally `GlobalToasts` + `ChatBot` **only when `pathname !== "/"`** — so the landing has no chat and no toast surface while every other page does. |
| S2 | `src/components/PageTransition.tsx` | — | all public routes | 5-panel Framer-Motion clip curtain with a per-route Turkish label (`ROUTE_NAMES`) and a `MAS / PRECISION` wordmark. Only 7 routes have a real label; everything else falls back to a family word or `MAS TECHNIC`. Bypassed entirely under reduced motion. |
| S3 | `src/components/providers/SmoothScrollProvider.tsx` | — | all non-panel routes | Lenis + GSAP ticker. Not applied to `/admin*` or `/musteri-paneli`. |
| S4 | `src/components/ui/ScrollProgress.tsx` | — | public routes **except** `/`, `/technical-preview`, `/admin*`, `/musteri-paneli` | Velocity-reactive top progress bar. Landing deliberately excluded → yet another per-route chrome difference. |
| S5 | `src/components/ui/CustomCursor.tsx` (via `PointerCursor` in `App.tsx`) | — | all routes with `(hover:hover) and (pointer:fine)` | Global custom cursor. |
| S6 | `src/components/SectionDotNav.tsx` | — | `/legacy-landing` only | Legacy landing's vertical section dot rail. |
| S7 | `#hero-shell` in `index.html:274-292` + inline script | — | intended: `/` only | Static "Precision Born" pre-boot intro painted before the bundle loads. `src/main.tsx:9` removes it on every path except `/`. **On `/` nothing removes it** — see `known-blockers.md`. |
| S8 | `src/components/technical-landing/TechnicalSectionFrame.tsx` | 50 | landing bands only | The landing's own shell primitive: numbered band index (`01 HEADER` … `14 FOOTER`) + optional `DEMO İÇERİK` / `ÖRNEK İÇERİK` status badge. No inner page has an equivalent. |
| S9 | `panelRoutes` branch in `src/App.tsx:91-113` | — | `/admin*`, `/musteri-paneli` | Fourth shell: no `PageTransition`, no Lenis, no `ScrollProgress`. Out of scope per `USER_INPUTS.md` §N. |

## 4. Which shell each public route actually gets

| Route | Header | Footer | Curtain (S2) | ScrollProgress (S4) | ChatBot/Toasts (S1) |
|---|---|---|---|---|---|
| `/` | H3 (`TechnicalHeader`) | F3 (`DrawingFooter`) | yes | **no** | **no** |
| `/technical-preview` | H3 | F3 | yes | **no** | yes |
| `/legacy-landing` | H2 | F1 | yes | yes | yes |
| `/test` | H2 | F1 | yes | yes | yes |
| `/hakkimizda` | H2 | F1 | yes | yes | yes |
| `/iletisim` | H2 | F1 | yes | yes | yes |
| `/sss` | H2 | F1 | yes | yes | yes |
| `/blog`, `/blog/:slug` | H2 | F1 | yes | yes | yes |
| `/malzemeler`, `/malzemeler/:slug` | H2 | F1 | yes | yes | yes |
| `/hizmetler/*`, `/kabiliyetler/*`, `/endustriyel/*` | H2 | F1 | yes | yes | yes |
| `/kvkk`, `/gizlilik-politikasi`, `/cerez-politikasi` | H2 | F1 | yes | yes | yes |
| `/teklif-al` | H2 | **none** | yes | yes | yes |
| `/giris`, `/sifremi-unuttum`, `/reset-password` | **none** | **none** | yes | yes | yes |
| `404` (`*`) | **none** | **none** | yes | yes | yes |

**Defects visible from this table alone:**

1. `src/pages/TeklifAl.tsx:54` imports `Footer` but never renders it (`grep "<Footer"` on that file
   returns nothing). The primary conversion page therefore has **no footer, no legal links and no
   secondary navigation** — confirmed visually in `reports/baseline/visual/teklif-al-1440.png`.
2. The 404 page (`src/pages/NotFound.tsx`) has **neither header nor footer** and its own
   light/teal canvas-ribbon aesthetic — a third visual language again (see `notfound-1440.png`).
3. Auth routes have no shell at all.
4. `/` and `/technical-preview` render the same tree but get *different* global chrome
   (`ChatBot`/`GlobalToasts` are suppressed only for `/`).

## 5. Count of parallel shell languages

| Language | Where |
|---|---|
| A — Technical editorial (dark graphite, drawing sheet, IBM Plex Mono) | `/`, `/technical-preview` |
| B — Fullscreen-overlay + mega-footer (light body, teal accent, dark footer) | all other inner pages |
| C — Chrome-less light/teal (404, auth) | `404`, `/giris`, `/sifremi-unuttum`, `/reset-password` |
| D — Panel (out of scope) | `/admin*`, `/musteri-paneli` |

Three public languages, three link taxonomies, two motion-token sources
(`src/components/menu/menu-tokens.ts` vs `src/config/motion-system.ts` +
`src/hooks/useTechnicalLandingMotion.ts`), and two headers with no shared component.

Owner per `IMPLEMENTATION.md` §8: Phase 01 (111–132), Phase 03 (39–73, 270–280),
Phase 04 (74–110, 444–450, 603–612, 738), Phase 08 (680–687 for the 404 shell).
