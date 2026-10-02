# Phase 00 — Route Inventory

**Base commit:** `6ffde20` on `wt/coder-p00`
**Derived from:** `src/App.tsx` (read, not guessed) plus the `lazy()` import block at the
top of the same file. Every entry below is traceable to a `<Route>` element.

`src/App.tsx` splits routing into **two mutually exclusive trees** (`AnimatedRoutes`,
lines ~88–160):

- `panelRoutes` — rendered when `location.pathname` starts with `/admin` or `/musteri-paneli`.
  Wrapped in a plain `<Suspense fallback={<PageLoader/>}>`, **no** `PageTransition`,
  **no** `SmoothScrollProvider` (Lenis).
- `publicRoutes` — everything else. Wrapped in `<PageTransition>` +
  `<Suspense fallback={<PublicRouteLoader/>}>` and, via `AppContent`, in `SmoothScrollProvider`.

**Every route component is lazy.** There is not a single eager route import in `App.tsx`.

---

## Public tree

| Path | Component file | Lazy | Protected | Classification |
|---|---|---|---|---|
| `/` | `src/pages/Index.tsx` → `src/components/technical-landing/TechnicalLanding.tsx` | lazy | public | `landing` |
| `/technical-preview` | `src/pages/TechnicalPreview.tsx` | lazy | public | `preview-dev` |
| `/legacy-landing` | `src/pages/LegacyLanding.tsx` | lazy | public | `preview-dev` |
| `/test` | `src/pages/TestHowWeWork.tsx` | lazy | public | `preview-dev` |
| `/sss` | `src/pages/SSS.tsx` | lazy | public | `content` |
| `/gizlilik-politikasi` | `src/pages/GizlilikPolitikasi.tsx` | lazy | public | `utility-legal` |
| `/kvkk` | `src/pages/KVKK.tsx` | lazy | public | `utility-legal` |
| `/cerez-politikasi` | `src/pages/CerezPolitikasi.tsx` | lazy | public | `utility-legal` |
| `/hakkimizda` | `src/pages/Hakkimizda.tsx` | lazy | public | `core-corporate` |
| `/iletisim` | `src/pages/Iletisim.tsx` | lazy | public | `core-corporate` |
| `/malzemeler` | `src/pages/Malzemeler.tsx` | lazy | public | `content` |
| `/malzemeler/:slug` | `src/pages/MalzemeKategori.tsx` | lazy | public | `content` |
| `/blog` | `src/pages/Blog.tsx` | lazy | public | `content` |
| `/blog/:slug` | `src/pages/BlogDetail.tsx` | lazy | public | `content` |
| `/hizmetler/kategori/:slug` | `src/pages/CategoryPage.tsx` | lazy | public | `service` |
| `/kabiliyetler/kategori/:slug` | `src/pages/CategoryPage.tsx` | lazy | public | `service` |
| `/endustriyel/kategori/:slug` | `src/pages/CategoryPage.tsx` | lazy | public | `sector` |
| `/hizmetler/:slug` | `src/pages/ServiceDetail.tsx` | lazy | public | `service` |
| `/kabiliyetler/:slug` | `src/pages/ServiceDetail.tsx` | lazy | public | `service` |
| `/endustriyel/:slug` | `src/pages/ServiceDetail.tsx` | lazy | public | `sector` |
| `/giris` | `src/pages/Login.tsx` | lazy | public | `rfq-auth` |
| `/sifremi-unuttum` | `src/pages/ForgotPassword.tsx` | lazy | public | `rfq-auth` |
| `/reset-password` | `src/pages/ResetPassword.tsx` | lazy | public | `rfq-auth` |
| `/teklif-al` | `src/pages/TeklifAl.tsx` | lazy | public | `rfq-auth` |
| `/cad-dashboard` | *(no component)* `<Navigate to="/teklif-al" replace />` | n/a | public | `rfq-auth` (redirect) |
| `*` (public catch-all) | `src/pages/NotFound.tsx` | lazy | public | `utility-legal` (404/error) |

**Classification notes (assumptions recorded, not invented):**

- `/malzemeler*` is classified `content` rather than `service`: it is a technical
  reference/material library, not a purchasable service page. Flagging for Phase 03/07
  in case IA wants it under services.
- `/sss` classified `content` (FAQ knowledge surface), not `utility-legal`.
- The public catch-all 404 is given `utility-legal` because the allowed classification set
  has no dedicated error class; §8 assigns 404/error states to Phase 08 (IDs 680–687).

## Panel tree (`NEVER_REDESIGN` per `USER_INPUTS.md` §N)

| Path | Component file | Lazy | Protected | Classification |
|---|---|---|---|---|
| `/admin/login` | `src/pages/AdminLogin.tsx` | lazy | public (login form) | `admin-customer` |
| `/admin` | `src/pages/AdminDashboard.tsx` | lazy | **protected** — `src/components/ProtectedRoute.tsx` | `admin-customer` |
| `/musteri-paneli` | `src/pages/MusteriPaneli.tsx` | lazy | **protected** — `src/components/CustomerProtectedRoute.tsx` | `admin-customer` |
| `*` (panel catch-all) | `src/pages/NotFound.tsx` | lazy | public | `admin-customer` (404 inside the panel tree) |

---

## Counts

| Bucket | Count |
|---|---|
| Total `<Route>` declarations | 30 (26 public incl. 2 catch-alls + redirect, 4 panel) |
| Distinct public URL surfaces (excluding catch-all) | 24 |
| `preview-dev` | 3 (`/technical-preview`, `/legacy-landing`, `/test`) |
| `admin-customer` | 4 |
| `utility-legal` | 3 + 404 |
| `rfq-auth` | 5 (incl. `/cad-dashboard` redirect) |
| Protected routes | 2 |
| Eager routes | 0 |

---

## Preview / test / dev surfaces (explicit flag)

| Route | Evidence | Problem |
|---|---|---|
| `/technical-preview` | `src/pages/TechnicalPreview.tsx` renders `<JsonLdSchema type="organization" /><TechnicalLanding />` — **byte-for-byte the same tree as `/`** (`src/pages/Index.tsx`) | Publicly reachable **duplicate of the home page**. `index.html:12` sets a global `robots: index, follow` and there is no per-route `noindex`, so this is a crawlable duplicate-content surface with a self-referencing canonical pointing at the Lovable preview domain. Owner: Phase 01 (cleanup) + Phase 11 (SEO). |
| `/legacy-landing` | `src/pages/LegacyLanding.tsx` renders the old `LandingFlow` + `Header`/`Footer` + `SectionDotNav` | An entire second, publicly indexable landing page with a *different* design language. Also the only route that still removes `#hero-shell` (see `known-blockers.md`). Owner: Phase 01. |
| `/test` | `src/pages/TestHowWeWork.tsx`; its own copy says *"Bu sayfa yalnızca sticky horizontal scroll davranışını doğrulamak için hazırlanmıştır"* | A developer scroll-experiment page shipped to production and crawlable. Owner: Phase 01. |

## Duplicate / redirect / orphan routes

- **Duplicate render tree:** `/` and `/technical-preview` render the identical component pair.
- **Duplicate component reuse (intentional, not a defect):** `CategoryPage` serves 3 paths,
  `ServiceDetail` serves 3 paths. Recorded so Phase 03/11 can decide the canonical URL family.
- **Redirect:** `/cad-dashboard` → `/teklif-al` (`<Navigate replace />`).
- **Orphan page file:** `src/pages/CADDashboard.tsx` exists (806 lines, imports `Header`) but is
  **never imported by `App.tsx` or anything else** — `grep -rn "CADDashboard" src/` returns only its
  own `export const CADDashboard` declaration. Dead code that still ships into the type/lint graph.

## Orphan / unreachable-from-navigation subsection

**Navigation components searched (exhaustive list of what was grepped):**

1. `src/components/navigation-data.tsx` — data source for the fullscreen menu
2. `src/components/HeaderFullscreen.tsx` — the only real header (`src/components/Header.tsx` is a one-line re-export)
3. `src/components/menu/MenuConversionRail.tsx`, `MenuFamilyRail.tsx`, `MenuCategoryPanel.tsx`, `MenuTrigger.tsx`
4. `src/components/footer/footerLinks.ts`, `FooterBottomBar.tsx`, `FooterCTA.tsx`, `FooterNewsletter.tsx`, `FooterBrand.tsx`
5. `src/components/technical-landing/TechnicalHeader.tsx` — the landing-only header
6. `src/data/technicalLandingData.ts` → `footerColumns` — the landing-only footer
7. `src/pages/NotFound.tsx` — 404 recovery links
8. `src/pages/Login.tsx` — auth cross-links

| Route | Reachable from any nav? | Evidence |
|---|---|---|
| `/technical-preview` | **NO** | Only textual reference anywhere in `src/` is `src/components/ui/ScrollProgress.tsx:19`, which merely *suppresses* the progress bar there. No `<Link>`/`href` anywhere. |
| `/legacy-landing` | **NO** | Zero `<Link>`/`href` references in `src/`. Only `e2e/helpers.ts:66` reaches it, by silently rewriting `/` → `/legacy-landing`. |
| `/test` | **NO** | Zero references outside `App.tsx`. |
| `/cad-dashboard` | **NO** | Zero references outside `App.tsx`; reachable only by typing the URL. |
| `/sifremi-unuttum` | Partially | Not in global nav; only from `src/pages/Login.tsx:191`. Acceptable for an auth flow. |
| `/reset-password` | **NO** (by design) | Reached only from a Supabase password-reset email link. |
| `/admin/login`, `/admin`, `/musteri-paneli` | **NO** (by design) | Intentionally not in public nav. |
| `/blog/:slug` | Yes (indirect) | From `/blog` cards. |
| `/malzemeler/:slug` | Yes (indirect) | From `/malzemeler`. |

**Landing-specific navigation gap (important for Phase 03).** The landing (`/`) does not use
`HeaderFullscreen` at all. `src/components/technical-landing/TechnicalHeader.tsx:6-13` exposes
only six **same-page hash anchors** (`#surec`, `#sektorler`, `#projeler`, `#nexus`, `#kalite`,
`#iletisim`) plus `/teklif-al` and `/`. From the home page, **no service, sector, material,
blog, FAQ, about or contact route is reachable through the header** — the only cross-route exits
are the landing footer (`footerColumns` in `src/data/technicalLandingData.ts:115-151`) and the
single `TEKLİF AL` button. Two of those footer entries are also mis-targeted: *"Vizyon & Misyon"*
and *"Kariyer"* point at `/hakkimizda` and `/iletisim` respectively, i.e. there is no such page.

Owner per `IMPLEMENTATION.md` §8: Phase 03 (IDs 39–73, 270–280, 501–515, 613–624).
