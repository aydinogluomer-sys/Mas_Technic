# Phase 00 — Known Blockers and Pre-existing Risks

**Base commit:** `6ffde20`
Everything below is **already broken or already a risk before any redesign work**. Nothing here
was fixed, suppressed or worked around in Phase 00. Each item carries file:line evidence and the
phase that owns it per `IMPLEMENTATION.md` §8.

Severity key: **S1** = breaks the site or publishes a falsehood · **S2** = breaks a contract,
a test or a budget · **S3** = hygiene / debt.

---

## B01 — S1 — A missing Supabase env var white-screens the entire public site

**Evidence:** `reports/baseline/raw/probe-landing.txt`

```text
ROOT_INNERHTML_LENGTH: 0
TECHNICAL_LANDING_ROOT_COUNT: 0
[pageerror] VITE_SUPABASE_URL is not set. Copy .env.example to .env and fill in the Supabase values…
```

`src/integrations/supabase/client.ts:11` calls `createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, …)`
at **module scope**, and `src/integrations/supabase/env` throws when the variable is absent. The
throw occurs while the module graph is being evaluated, so `createRoot(...).render(<App/>)` in
`src/main.tsx:12` never executes. `#root` stays empty; only the static `#hero-shell` intro from
`index.html` paints.

**Why it matters beyond this worktree:** the technical landing renders no Supabase data whatsoever,
yet a Supabase configuration problem takes down 100 % of the public marketing site — landing,
about, contact, legal pages, 404. There is no error boundary above this (`src/components/ErrorBoundary.tsx`
exists but is not mounted around the app root in `App.tsx`). The same class of failure would occur
on any deploy where the env var is missing, misspelled or rotated.

**Also the direct cause of the first baseline e2e run's 27 failures** (this worktree has no `.env`;
it is gitignored so `git worktree add` does not copy it). With env supplied, the same specs are
25 passed / 5 skipped / 0 failed. See `build-test-baseline.md` §5.

**Owner:** Phase 12 (317–343) for lazy client init + Phase 14 (575–589, 590–602) for config/observability.

---

## B02 — S2 — The landing regression suite tests `/legacy-landing`, not `/`

**Evidence:** `e2e/helpers.ts:62-67`

```ts
export async function gotoAndSettle(page: Page, path: string) {
  // Legacy landing-specific suites remain valuable during the V4 cutover…
  const resolvedPath = path === "/" ? "/legacy-landing" : path;
```

`e2e/landing-flow.spec.ts:38` and `e2e/section-integrity.spec.ts` call `gotoAndSettle(page, "/")`
and are silently redirected. Their assertions target `.lf-*` selectors that exist only inside
`src/components/LandingFlow.tsx`, which is rendered **only** by `/legacy-landing`.

**Scale (counted from `grep -n 'gotoAndSettle(page, "/")' e2e/*.spec.ts`):**

| Spec | Tests |
|---|---|
| `fullscreen-menu.spec.ts` | 12 |
| `landing-flow.spec.ts` | 12 |
| `process-proof-cinema.spec.ts` | 8 |
| `color-system.spec.ts` | 5 |
| `decision-support.spec.ts` | 5 |
| `footer-reveal.spec.ts` | 5 |
| `landing-motion-polish.spec.ts` | 4 |
| `motion-architecture.spec.ts` | 4 |
| `section-integrity.spec.ts` | 4 |
| `reverse-scroll.spec.ts` | 3 |
| `fullpage-visual-qa.spec.ts` | 1 (`LANDING_ROUTES = ["/"]` → `gotoAndSettle`) |
| **Total** | **63** |

**63 tests × 8 projects = 504 of 784 combinations (64 %) regression-test a route that no user is
ever sent to.** Only `technical-landing.spec.ts` (14 × 8 = 112 combinations) asserts against the
real home page. `shared-shell-accessibility.spec.ts` uses raw `page.goto(...)` and is unaffected,
but its route table (`:318-327`) does not include `/` either.

**Owner:** Phase 01 (133–162).

---

## B03 — S2 — Stale `.lf-*` test contracts

**Evidence:** `.lf-` selectors appear in 7 spec files and `e2e/helpers.ts:84`:

| File:line | Selector |
|---|---|
| `e2e/helpers.ts:84` | `main#main-content > .lf-root[data-motion-ready="true"]` |
| `e2e/section-integrity.spec.ts:9,56` | `main#main-content > .lf-root > section` |
| `e2e/landing-flow.spec.ts:118-124,165,212,221,261-264` | `.lf-industry-jump`, `a.lf-industry-card`, `a.lf-material-card`, `.lf-decision-dossier`, `.lf-editorial-list`, `.lf-inline-link`, `.lf-marquee > div`, `.lf-decision-pixels`, `[data-lf-reveal]` |
| `e2e/decision-support.spec.ts:15-97` | `.lf-decision-card`, `.lf-decision-pixels`, `.lf-decision-dossier` |
| `e2e/landing-motion-polish.spec.ts:44-81` | `.lf-editorial-floating-preview`, `.lf-material-card` |
| `e2e/motion-architecture.spec.ts:125-126` | `.lf-featured-pin`, `.lf-industry-track` |

The current landing uses `.tl-*` (`src/styles/technical-landing.css`). **No `.lf-*` class exists
on `/`.** The contracts are green only because of B02.

Related stale contract: `e2e/helpers.ts:3-13` `LANDING_SCENE_IDS` asserts nine anchors
(`top, hizmetler, endustriler, malzemeler, neden-biz, kabiliyetler, referanslar, sss, iletisim`).
The technical landing exposes six (`surec, nexus, projeler, sektorler, kalite, sss, iletisim`) and
has no `#top`, `#hizmetler`, `#endustriler`, `#malzemeler`, `#neden-biz`, `#kabiliyetler`,
`#referanslar`.

**Owner:** Phase 01 (133–162).

---

## B04 — S2 — Two tests are permanently-red-by-design blocker recorders

**Evidence:** `e2e/landing-flow.spec.ts:43-51` and `:53`

```ts
test.fail(physicalSectionCount === 8, "Current landing has exactly eight physical sections; production repair is outside Slice 0.");
expect(physicalSectionCount).toBe(9);
```

Plus `e2e/landing-flow.spec.ts:14-24` `KNOWN_V1_SEMANTIC_VIOLATIONS` — a hardcoded allow-list of
**37 accepted semantic violations** (`scene-id`, `label`, `focus-target`, `tag`, `parent`,
`height` failures across nine sections) — and `:26-33` `KNOWN_MOBILE_CONTRAST_TARGETS`, seven
hardcoded selectors whose **serious axe contrast violations are explicitly tolerated**
(`landing-flow.spec.ts:174` "records the known serious contrast defect instead of treating axe as green").

These tests report PASS while documenting real defects. Any future "all green" claim must
account for them.

**Owner:** Phase 01 (133–162) and Phase 13 (372–390).

---

## B05 — S2 — `#hero-shell` is never removed on the live landing route

**Evidence (measured, not inferred):** `reports/baseline/raw/probe-landing-with-env.txt`

```text
TECHNICAL_LANDING_ROOT_COUNT: 1
HERO_SHELL_STILL_IN_DOM: 1        ← after full load + 3 s
HTML_DATA_INTRO_ACTIVE: false
```

Lifecycle as coded:

| Step | File:line | Behaviour |
|---|---|---|
| paint intro | `index.html:274-292` + inline script `:294-361` | `#hero-shell` painted before the bundle; sets `data-phase` cut → inspect → pass → done; dispatches `mas:intro-done` (`index.html:342`) and removes `data-intro-active`. |
| remove on non-landing | `src/main.tsx:9` | `if (window.location.pathname !== "/") document.getElementById("hero-shell")?.remove();` |
| remove on landing | `src/components/LandingFlow.tsx:115-131` | listens for `mas:intro-done` then `shell.remove()` |

**`LandingFlow` is rendered only by `src/pages/LegacyLanding.tsx:15`.** `/` renders
`src/pages/Index.tsx` → `TechnicalLanding`, which never touches the shell. **So on the one route
the shell is meant to serve, nothing removes it.** It survives at `z-index: 80` with
`opacity/visibility` driven purely by the `[data-phase="done"]` CSS state, permanently in the DOM
and in the a11y/paint tree.

Second-order effect: `src/App.tsx:74-77` `PublicRouteLoader` returns `null` whenever
`#hero-shell` exists — i.e. **on `/` the Suspense fallback is permanently disabled**, because the
element it probes never goes away.

**Owner:** Phase 01 (111–132) and Phase 05 (193–238, 688–699).

---

## B06 — S1 — LCP preload points at a file that does not exist

**Evidence:** `index.html:49-51`

```html
<!-- …erken indirmeye başlatmak için preload. -->
<link rel="preload" as="image" href="/src/assets/hero-cnc.jpg" fetchpriority="high" />
```

- `src/assets/hero-cnc.jpg` **does not exist** in the repository (only `hero-cnc.webp`).
- `dist/src/` does not exist, so the request falls through to the SPA fallback. Measured:
  `curl -D - http://localhost:4173/src/assets/hero-cnc.jpg` → `HTTP/1.1 200 OK`,
  `Content-Type: text/html`.
- The browser therefore issues a **high-priority preload for an HTML document declared as an
  image**, then warns: *"The resource … was preloaded using link preload but not used within a
  few seconds from the window's load event."* (captured in both probe logs).
- The **actual** LCP element is `src/assets/technical-landing/hero-manifold-v1.webp` (62.57 kB,
  `TechnicalHero.tsx:2,32-39`, already `fetchPriority="high"`) and receives **no** preload.

**Owner:** Phase 12 (317–343) and Phase 10 (239–257).

---

## B07 — S2 — CI timeout risk

**Evidence:** `.github/workflows/playwright.yml:11` `timeout-minutes: 30`; step
`run: npm run test:e2e` (the whole suite, no `--project` filter).

Measured combination count: **784 tests = 16 spec files × 8 Chromium projects**
(`reports/baseline/raw/playwright-list.txt`). CI runs with `workers: 2` and `retries: 2`
(`playwright.config.ts:29-34`) and a per-test `timeout: 60_000`.

The `webServer` command is `npm run build && npm run preview` with `timeout: 180_000`
(`playwright.config.ts:200-207`). A **cold `npm run build` measured 4 m 05 s on this host**, so
on a slower CI runner the 180 s webServer timeout is itself marginal, and it consumes ~13 % of the
30-minute job budget before a single test runs.

Worst case with retries: 784 tests × up to 3 attempts. At the ~2 s median observed for
`technical-landing` specs and ~20 s for full-page-traversal specs, the suite plausibly exceeds
30 minutes whenever a systemic failure triggers mass retries. There is no `--shard`, no
`--project` narrowing and no fail-fast.

**Owner:** Phase 01 (133–162).

---

## B08 — S3 — Playwright browser revision mismatch on this host

**Evidence:** `browserType.launch: Executable doesn't exist at …\chromium_headless_shell-1217\…`
Installed revisions under `~/AppData/Local/ms-playwright`: `chromium-1223`, `chromium-1228`,
`chromium-1234` (and matching headless shells) — **1217 is absent**.

The suite only runs because `playwright.config.ts:37-49` falls back to a locally installed
`chrome.exe` / `msedge.exe` via `executablePath`. That means **local runs execute against
whatever Chrome the developer happens to have installed**, not against Playwright's pinned
Chromium — a silent determinism hole between local and CI. The Phase 00 tooling
(`probe-landing.mjs`, `capture-baseline.mjs`, `measure-landing-bundle.mjs`) had to replicate the
same fallback.

**Owner:** Phase 13 (411–423) / Phase 01 (133–162). *Not fixed here — the environment brief
forbids reinstalling browsers.*

---

## B09 — S3 — No `typecheck` npm script, and root `tsc --noEmit` is a no-op

**Evidence:** `package.json` scripts = `dev, build, build:dev, lint, preview, test:e2e,
test:e2e:ui, test:e2e:install, assets:sync`. `tsconfig.json` has `"files": []` + `references`, so
`npx tsc --noEmit` (without `-b`) compiles **zero files** and exits 0 unconditionally. The
meaningful command is `npx tsc --noEmit -p tsconfig.app.json` (also 0 errors).

Additionally: `vitest.config.ts` exists at the repo root, references `./src/test/setup.ts` —
**which does not exist** — and `vitest` is **not** in `package.json` at all. There is no unit-test
capability despite the config implying one.

Strictness is very loose (`tsconfig.app.json`: `strict: false`, `noImplicitAny: false`,
`noUnusedLocals: false`, `noUnusedParameters: false`; root `strictNullChecks: false`), so
"0 type errors" is a weak signal.

*Deliberately not added in Phase 00 — that is Phase 01's task.*
**Owner:** Phase 01 (133–162).

---

## B10 — S1 — Hardcoded Lovable canonical / preview metadata

**Evidence:** `index.html`

| Line | Value |
|---|---|
| `17` | `<link rel="canonical" href="https://mas-technic-precision.lovable.app/" />` |
| `22` | `<meta property="og:url" content="https://mas-technic-precision.lovable.app/" />` |
| `32` | `og:image` → `https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/…lovable.app-1771685445710.png` |
| `46` | `twitter:image` → same R2 preview screenshot |

`USER_INPUTS.md` §A: `PRODUCTION_DOMAIN: https://www.masmare.com`. Every crawlable page on the
production domain currently declares its canonical to be a **Lovable preview deployment**, and
its social card to be a third-party screenshot host. `CLAUDE.md` itself records that Lovable was
abandoned on 2026-05-12.

There is also **one single static canonical for the whole SPA** — every route claims to be `/`.
And there is **no `public/sitemap.xml`** (`public/` contains only `favicon.ico`, `images`,
`machine-loop.mp4`, `placeholder.svg`, `robots.txt`, `sequence-cnc`, `sequence-material`), while
`public/robots.txt` has **no `Sitemap:` directive** and blanket-`Allow: /` — so
`/technical-preview`, `/legacy-landing` and `/test` are all explicitly crawlable.

**Owner:** Phase 11 (294–316, 481–489, 564–574).

---

## B11 — S1 — İzmir ↔ İstanbul metadata conflict

| Source | Value |
|---|---|
| `USER_INPUTS.md` §A | `PUBLIC_CITY: İzmir`, `PUBLIC_DISTRICT: Çiğli` |
| `index.html:19` | `<meta name="geo.placename" content="İstanbul" />` |
| `src/components/JsonLdSchema.tsx:88,174` | `addressLocality: "İzmir"` |
| `src/components/technical-landing/FinalSections.tsx:305` | `No: 4, 35620 Çiğli / İZMİR` |
| `src/components/LiveClock.tsx:10,32` | `timeZone: "Europe/Istanbul"`, rendered as `IST hh:mm:ss` in the footer of every inner page |

The `geo.placename` meta is **factually wrong** and contradicts the structured data on the same
page. (The `Europe/Istanbul` timezone is technically correct for all of Türkiye; only the visible
`IST` label reinforces the confusion — that is a wording decision, not a falsehood.)

**Owner:** Phase 11 (294–316) with Phase 06 (625–636) for the clock label.

---

## B12 — S1 — `availableLanguage` claims English

**Evidence:** `src/components/JsonLdSchema.tsx:95`

```ts
availableLanguage: ["Turkish", "English"],
```

`USER_INPUTS.md` §B: `ENGLISH_LIVE_NOW: NO`. The structured data tells search engines the
business offers English-language contact. Paired with the inert `EN` toggle in the landing header
(`src/components/technical-landing/TechnicalHeader.tsx:57-58`, `title="İngilizce sürüm hazırlanıyor"`),
the site advertises a language it does not serve.

**Owner:** Phase 11 (294–316) and Phase 03 (menu affordance).

---

## B13 — S1 — Unverified certification, KPI and scale claims are shipped publicly

Full catalogue in `content-claims-inventory.md`. Headlines:

| Claim | Where | Truth per `USER_INPUTS.md` |
|---|---|---|
| `AS9100D` (14+ locations, incl. `index.html:9,15` meta and `technicalLandingData.ts:80` with a fake signature + notary seal) | landing + inner pages + `<meta>` | §C `AS9100D_VALUE: NONE` |
| `IATF 16949` (8+ locations) | `Hakkimizda.tsx:22`, `SSS.tsx:26`, `categoryPages.ts:141`, `servicePages.ts:2537+` | §C `IATF_16949_VALUE: NONE` |
| `ISO 13485`, `NADCAP`, `NIST 800-171` | `chatFaqData.ts:53`, `servicePages.ts:2360+`, `CertificationsSection.tsx:26` | not in `USER_INPUTS.md` at all |
| `ISO 9001:2015 (TÜV SÜD), AS9100D (SGS), IATF 16949 (Bureau Veritas), ISO 13485 (TÜV SÜD), ISO 14001 (SGS)` | `servicePages.ts:1689` | invented certification **bodies** |
| `±0.005 mm` (≈120 locations) | landing proof strip `technicalLandingData.ts:4` + everywhere | §D `MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm` |
| `48 SAAT` teklif süresi | `technicalLandingData.ts:5,98` | §D/§J `1-3 Days` |
| `%98` zamanında teslimat | `technicalLandingData.ts:9` | §D `95%` |
| `%100 CMM RAPORU` | `technicalLandingData.ts:7,33` | §D `THIRD_PARTY_ACCREDITED_ON_DEMAND` |
| `50+ MALZEME` | `technicalLandingData.ts:6` | §D `UNKNOWN` + `PRIVATE_DO_NOT_DISCLOSE` |
| `50+ deneyimli mühendis ve teknisyen` | `Hakkimizda.tsx:29` | §D `TEAM_SIZE: PRIVATE_DO_NOT_DISCLOSE` |
| `15.000 m² üretim alanında 50+ CNC tezgah` | `servicePages.ts:1441,1463` | §D `FACILITY_SIZE` / `MACHINE_COUNT: PRIVATE_DO_NOT_DISCLOSE` |
| `%77.5 OEE`, `%99.7 kalite oranı`, `PPAP Level 5`, `Cpk ≥1.67`, `50K+ adet/ay` | `servicePages.ts:2278,1637,2538` | none verified |
| Blog view counts `3.420 … 14.2K TOPLAM OKUMA` | `blogData.ts:32+`, `Blog.tsx:42` | §K `ANALYTICS_PROVIDER: NONE` |
| `ZTM` reference logo | `technicalLandingData.ts:89` | §F `REMOVE_IF_UNVERIFIED` |
| Instagram + YouTube links | `FinalSections.tsx:325-326` | §L `INSTAGRAM: NONE`, `YOUTUBE: NONE` |
| `twitter:site @MasTechnic` | `index.html:38` | §L `X_TWITTER: NONE` |

**Owner:** Phase 06 (163–192, 467–473, 625–636, 637–653), Phase 07/08 for the page rewrites,
Phase 11 for the `<meta>` copies.

---

## B14 — S2 — The landing has no route-level navigation

`src/components/technical-landing/TechnicalHeader.tsx:6-13` exposes six **hash anchors** plus
`/teklif-al` and `/`. From the home page, **no service, sector, material, blog, FAQ, about or
contact page is reachable via the header.** The only cross-route exits are the drawing footer
(`technicalLandingData.ts:115-151`) and one CTA. Two footer entries are mis-targeted:
`["Vizyon & Misyon", "/hakkimizda"]` and `["Kariyer", "/iletisim"]` — pages that do not exist.

`HeaderFullscreen` + `navigation-data.tsx` (the real IA, with ~40 destinations) is **not mounted
on `/` at all**.

**Owner:** Phase 03 (39–73, 270–280, 501–515, 613–624).

---

## B15 — S2 — Preview/dev routes are live and indexable

| Route | File | Problem |
|---|---|---|
| `/technical-preview` | `src/pages/TechnicalPreview.tsx` | Renders the exact same tree as `/`. Crawlable duplicate of the home page. |
| `/legacy-landing` | `src/pages/LegacyLanding.tsx` | A complete second landing page in a different design language. |
| `/test` | `src/pages/TestHowWeWork.tsx` | Its own copy says it exists "yalnızca sticky horizontal scroll davranışını doğrulamak için". |

`index.html:12` sets `robots: index, follow` globally; `public/robots.txt` allows everything;
there is no per-route `noindex`. None of the three is linked from any navigation.

**Owner:** Phase 01 (111–132, 424–430) + Phase 11 (294–316).

---

## B16 — S2 — 404 is soft and force-redirects the user

**Evidence:** `src/pages/NotFound.tsx:16-26`

```ts
useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((prev) => { if (prev <= 1) { window.location.href = "/"; return 0; } return prev - 1; });
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

A hard 15-second redirect to `/` with no way to cancel — hostile to screen-reader users, to anyone
reading the page, and to anyone about to click a recovery link. Also a **soft 404**: the preview
server answered `HTTP 200` for `/bu-sayfa-yok-404-baseline` (`visual/manifest.json`), so search
engines see a 200 for every non-existent URL. The page also has **no header and no footer**
(see `shell-inventory.md` §4).

**Owner:** Phase 08 (680–687) + Phase 11 (564–574) + Phase 13 (372–390).

---

## B17 — S2 — Both motion runtimes ship on the landing

Measured (`reports/baseline/raw/landing-payload.txt`): `vendor-framer-*.js` **130.58 kB** +
`vendor-gsap-*.js` **111.69 kB** = **242.3 kB raw, 31.2 % of the landing's 777.8 kB initial JS**.

`CLAUDE.md` forbids applying GSAP and Framer Motion to the same element, but nothing prevents both
from *shipping* on the same route. On `/`, `PageTransition` (framer) and
`useTechnicalLandingMotion` + `SmoothScrollProvider` (gsap + lenis) are both mounted.

**Owner:** Phase 05 (193–238, 688–699) + Phase 12 (317–343).

---

## B18 — S2 — 3 chunks exceed the 500 kB warning threshold

`OBJLoader-*.js` 858.06 kB · `AdminDashboard-*.js` 775.14 kB · `xlsx.min-*.js` 627.32 kB.
None loads on `/` (verified). Details in `bundle-baseline.md`.

**Owner:** Phase 12 (317–343).

---

## B19 — S2 — 18 npm vulnerabilities, incl. an open-redirect in the shipped router

`0 critical / 15 high / 3 moderate`. The only one that reaches the browser is
`@remix-run/router@1.23.0` (GHSA-2w69-qvjg-hvjx XSS via open redirect, GHSA-2j2x-hqr9-3h42
protocol-relative `//` open redirect) under `react-router-dom@6.30.1`. Full table in
`dependency-baseline.md`.

Also: `three-mesh-bvh@0.7.8` is **lockfile-marked deprecated** ("Deprecated due to three.js
version incompatibility. Please use v0.8.0") and can only be moved via `@react-three/drei` or an
`overrides` entry, of which `package.json` has none.

**Owner:** Phase 12 (344–352).

---

## B20 — S3 — Dead code carrying fabricated claims

Components that are **imported by nothing** yet still contain certification/KPI/case-study claims
and still occupy the lint/type graph:

| File | Claim it carries |
|---|---|
| `src/components/CertificationsSection.tsx` | ISO 9001, AS9100D, IATF 16949, ISO 13485, **NIST 800-171** |
| `src/components/ProjectShowcase.tsx` | "AS9100 sertifikalı üretim hattında 1200+ türbin kanadı", ±0.003 mm, 350+ bar |
| `src/components/HeroSection.tsx` | `48s SLA / %98.4`, `± 0.005 mm`, `ISO 9001 rev J · 2025·11` |
| `src/components/CapabilitiesSection.tsx` | machine models + `±0.005 mm` |
| `src/components/QuickQuoteSection.tsx` | `48 saat`, `±0.005`, `50+` |
| `src/components/TestimonialsSection.tsx` | testimonial scaffold (§G supplies none) |
| `src/components/StatsSection.tsx`, `FAQBlogSection.tsx`, `IndustriesSection.tsx`, `WhyUsSection.tsx`, `CNCScrollStory.tsx`, `VideoScrollSection.tsx`, `NexusPromoSection.tsx` | assorted |
| `src/pages/CADDashboard.tsx` (806 lines) | orphan route page |
| `src/components/ModelViewer.tsx`, `src/components/r3f/HeroCanvas.tsx`, `src/components/r3f/LiquidImage.tsx` | orphan three.js consumers |

**Owner:** Phase 01 (111–132) for deletion, Phase 06 for the claims.

---

## B21 — S3 — `occt-import-js` externalises Node `path` and `crypto` in the browser build

Build warnings (both runs):

```text
[plugin:vite:resolve] Module "path" has been externalized for browser compatibility,
  imported by ".../node_modules/occt-import-js/dist/occt-import-js.js".
[plugin:vite:resolve] Module "crypto" has been externalized …
```

Vite stubs both. If the STEP/IGES parse path in `src/components/admin/RFQCadPreview.tsx:101-120`
ever reaches those calls, it throws at runtime. `occt-import-js@0.0.14` is a pre-1.0 package.

**Owner:** Phase 09 (281–293) + Phase 12 (344–352).

---

## B22 — S3 — Miscellaneous

| # | Item | Evidence | Owner |
|---|---|---|---|
| a | `src/pages/TeklifAl.tsx:54` imports `Footer` and never renders it — the primary conversion page has no footer, no legal links, no secondary nav | `grep "<Footer" src/pages/TeklifAl.tsx` → no match; confirmed in `visual/teklif-al-1440.png` | Phase 04 / 07 |
| b | `caniuse-lite` browser data is **14 months old** | build warning | Phase 12 |
| c | `@playwright/test` is in `dependencies`, not `devDependencies` | `package.json` | Phase 12 |
| d | `lovable-tagger@1.1.13` still in devDependencies and in `vite.config.ts:10` although Lovable was abandoned | `CLAUDE.md` "Lovable terk edildi" | Phase 01 / 12 |
| e | Two coexisting esbuild majors (0.21.5 + 0.25.0) | `npm ci --dry-run` allow-scripts warning | Phase 12 |
| f | `TechnicalSectionFrame.tsx:8` defines a `DOĞRULANMIŞ` status label that **no band ever uses** | read | Phase 06 |
| g | Landing FAQ advertises `DWG` and `PDF` uploads that `CAD_ACCEPTED_EXTENSIONS` does not accept, and omits `3MF` | `technicalLandingData.ts:95` vs `src/utils/cadUpload.ts` | Phase 06 / 09 |
| h | `src/components/ErrorBoundary.tsx` exists but is not mounted around the app root | `App.tsx` read | Phase 04 / 14 |
| i | 28 separate lucide icon chunks load on `/` (~15 kB across 28 requests) | `raw/landing-payload.txt` | Phase 12 |
| j | 219.3 kB of render-blocking CSS on `/`, of which 167.64 kB is the global Tailwind sheet the landing barely uses | `raw/landing-payload.txt` | Phase 12 |
| k | ESLint warning: `TechnicalHeader.tsx:43:18` `react-hooks/exhaustive-deps` on `triggerRef.current` in an effect cleanup | `raw/lint.txt` | Phase 03 / 13 |
| l | No `public/sitemap.xml`; `public/robots.txt` has no `Sitemap:` directive | `ls public/` | Phase 11 |
| m | Every route shares one static `<title>`/`<meta description>` from `index.html` plus a `usePageMeta` hook that sets no canonical | `src/hooks/use-page-meta.ts` has no `canonical` | Phase 11 |

---

## Roll-up

| Severity | Count |
|---|---|
| S1 (site-breaking or publishes a falsehood) | 6 — B01, B06, B10, B11, B12, B13 |
| S2 (broken contract / test / budget) | 11 — B02, B03, B04, B05, B07, B14, B15, B16, B17, B18, B19 |
| S3 (hygiene / debt) | 5 — B08, B09, B20, B21, B22 (13 sub-items) |
