# Phase 00 — Bundle Baseline

**Base commit:** `6ffde20`
**Sources:** `npm run build` output (`reports/baseline/raw/build-clean.txt`, ANSI-stripped),
`dist/assets` on disk, and a real browser measurement of the landing route
(`reports/baseline/raw/landing-payload.txt`, produced by
`reports/baseline/tools/measure-landing-bundle.mjs`).

```text
dist total on disk: 22 MB
dist/assets entries: 178   (130 .js · 3 .css · 45 .webp)
Vite output table rows: 179
Chunks > 500 kB warning threshold: 3
```

---

## 1. Every emitted chunk over 100 kB

| Chunk | Raw kB | Gzip kB | Loads on `/`? | Nature |
|---|---|---|---|---|
| `assets/OBJLoader-DgHxtQC6.js` | **858.06** | **232.24** | **no** | **three.js core + R3F + drei + three-stdlib + STL/OBJ loaders.** Named after `OBJLoader` only because that is the entry symbol Rollup picked. This is the whole 3D stack in one chunk. |
| `assets/AdminDashboard-B_o7QpTo.js` | **775.14** | **190.09** | **no** | Admin panel route chunk (recharts + admin UI). Out of redesign scope but in the perf budget. |
| `assets/xlsx.min-f-rKPqe7.js` | **627.32** | **322.94** | **no** | `xlsx-js-style`, dynamically imported from `src/utils/excelExport.ts`. Worst gzip ratio in the build (51 %) — it is mostly already-compressed data. |
| `assets/servicePages-CuTr9cj0.js` | 175.27 | 54.50 | **no** | `src/data/servicePages.ts` — the fabricated-claims data file (see `content-claims-inventory.md`). |
| `assets/client-Bp4YQLUG.js` | 172.78 | 45.60 | **YES** | `@supabase/supabase-js`. |
| `assets/index-Dra3Z5KO.css` | 171.66 | 31.12 | **YES** | Global Tailwind + `src/index.css`. |
| `assets/vendor-react-BzjJi5l0.js` | 151.19 | 47.53 | **YES** | react + react-dom + scheduler (`manualChunks`). |
| `assets/MusteriPaneli-BRmpNd-h.js` | 136.06 | 38.38 | **no** | Customer panel route chunk. |
| `assets/ChatBot-Bb0LWlMj.js` | 135.08 | 43.18 | **no** on `/` (suppressed), **YES** on every other public route | Chat widget + `chatFaqData`. |
| `assets/vendor-framer-BpLP2dYa.js` | 133.71 | 44.57 | **YES** | framer-motion. |
| `assets/vendor-gsap-0lJgtTtq.js` | 114.38 | 45.33 | **YES** | gsap + ScrollTrigger. |
| `assets/index-C0dUV9Rh.js` | 112.77 | 38.70 | **YES** (as `index-B0jRwfiq.js` in the env-enabled rebuild) | Application entry / router shell. |
| `assets/occt-import-js-BPAm4Cra.js` | 111.49 | 28.33 | **no** | OpenCascade STEP/IGES WASM glue. |

Just below the cut, for context:

| Chunk | Raw kB | Gzip kB | Loads on `/`? |
|---|---|---|---|
| `assets/materialsData-B2KuSS02.js` | 69.79 | 17.10 | no |
| `assets/Iletisim-CyDguKby.js` | 65.47 | 15.81 | no |
| `assets/TechnicalLanding-D94oHkdf.css` | 52.92 | 10.08 | **YES** |
| `assets/LegacyLanding-BFafmixI.js` | 51.28 | 16.70 | no |
| `assets/LegacyLanding-BQihR7XS.css` | 42.30 | 8.63 | no |
| `assets/TeklifAl-CrMCfODJ.js` | 41.71 | 11.54 | no |
| `assets/TechnicalLanding-Jz2ify37.js` | 34.97 | 11.88 | **YES** |

---

## 2. Measured initial payload of the landing route `/`

Measured in Chrome at 1440×900 against `npm run preview`, counting every same-origin response
until `networkidle` + 2 s:

```text
TOTAL_REQUESTS_SAME_ORIGIN: 45
INITIAL_JS_CHUNKS: 36     INITIAL_JS_RAW_BYTES: 796,484  (777.8 kB)
INITIAL_CSS:        2     RAW_BYTES:            224,593  (219.3 kB)
INITIAL_MEDIA/FONT: 6     RAW_BYTES:            329,180  (321.5 kB)
```

**Total initial JS on the landing: 777.8 kB raw across 36 chunks.**

Top contributors:

| Chunk | Raw kB | Share of initial JS |
|---|---|---|
| `client-*.js` (Supabase) | 169.00 | 21.7 % |
| `vendor-react-*.js` | 147.65 | 19.0 % |
| `vendor-framer-*.js` | 130.58 | 16.8 % |
| `vendor-gsap-*.js` | 111.69 | 14.4 % |
| `index-*.js` (app entry) | 110.15 | 14.2 % |
| `TechnicalLanding-*.js` | 34.60 | 4.4 % |
| `index-BC8Yv_zY.js` | 32.11 | 4.1 % |
| `vendor-utils-*.js` | 20.54 | 2.6 % |
| 28 further chunks (mostly 0.3–4.5 kB lucide icons) | 41.0 | 5.3 % |

### Three observations that matter for the perf phase

1. **Supabase is the single largest thing on the landing page (169 kB, 21.7 %).** The technical
   landing renders no Supabase data; the client is pulled in eagerly through the CAD-handoff
   hook chain (`cadUpload-*.js` is also in the initial set). Combined with the module-scope
   throw documented in `known-blockers.md`, this is both a weight and an availability problem.
2. **Both motion libraries load together: framer-motion 130.58 kB + gsap 111.69 kB = 242.3 kB raw
   (31.2 % of initial JS).** `CLAUDE.md` forbids applying both to the same element, but nothing
   prevents both from *shipping* on the same route, and today both do.
3. **28 separate lucide icon chunks** (`phone-*.js`, `truck-*.js`, `gauge-*.js`, `x-*.js` …), each
   0.3–1.6 kB. That is 28 HTTP requests worth ~15 kB total — pure request overhead from
   `hoistTransitiveImports: false` plus per-icon module splitting.

### CSS / media on the landing

| Asset | Raw kB |
|---|---|
| `index-*.css` | 167.64 |
| `TechnicalLanding-*.css` | 51.69 |
| `hero-cnc-frezeleme-*.webp` | 96.45 |
| `industry-defense-*.webp` | 78.97 |
| **`hero-manifold-v1-*.webp` (the actual LCP hero image)** | **62.57** |
| `industry-medical-*.webp` | 44.37 |
| `hero-cnc-tornalama-*.webp` | 39.10 |
| `/src/assets/hero-cnc.jpg` | **0 — see below** |

**219.3 kB of raw CSS is render-blocking on the landing**, of which 167.64 kB is the global
Tailwind/`index.css` bundle that the technical landing barely uses (it has its own 51.69 kB sheet).

**Wasted LCP preload, confirmed by HTTP response.** `index.html:51` declares:

```html
<link rel="preload" as="image" href="/src/assets/hero-cnc.jpg" fetchpriority="high" />
```

- `src/assets/hero-cnc.jpg` **does not exist in the repository** (only `hero-cnc.webp` does).
- `dist/src/` does not exist, so the preview server answers with the SPA fallback:
  `HTTP/1.1 200 OK · Content-Type: text/html`.
- The browser therefore high-priority-preloads an **HTML document as an image**, then warns:
  *"The resource http://localhost:4173/src/assets/hero-cnc.jpg was preloaded using link preload
  but not used within a few seconds from the window's load event."*
- Meanwhile the real above-the-fold image, `hero-manifold-v1-*.webp` (62.57 kB), gets **no**
  preload despite carrying `fetchPriority="high"` on the `<img>` itself
  (`TechnicalHero.tsx:35`).

## 3. Specialist chunks — do they reach the landing?

Measured, not assumed (`landing-payload.txt` → `Specialist-bundle presence check`):

| Bundle family | Loaded on `/`? | Entry point that pulls it |
|---|---|---|
| `three` / `OBJLoader` / `drei` | **not loaded** ✅ | `src/components/admin/RFQCadPreview.tsx:1-6` (admin, lazy) and `src/components/musteri/CustomerCadPreview.tsx` (customer panel, lazy). `src/components/ModelViewer.tsx` also imports the full stack but is **orphan code — imported by nothing**. `src/components/r3f/HeroCanvas.tsx` and `src/components/r3f/LiquidImage.tsx` are likewise orphans. |
| `occt-import-js` | **not loaded** ✅ | dynamic `await import("occt-import-js")` inside `RFQCadPreview.tsx:108` |
| `xlsx` | **not loaded** ✅ | dynamic import in `src/utils/excelExport.ts` (documented in `vite.config.ts` comments) |
| `AdminDashboard` | not loaded ✅ | `/admin` route |
| `MusteriPaneli` | not loaded ✅ | `/musteri-paneli` route |
| `ChatBot` | not loaded on `/` ✅ | suppressed by `App.tsx:203` only for `/`; **loads on every other public route** |
| `servicePages` | not loaded ✅ | `/hizmetler/*`, `/kabiliyetler/*`, `/endustriyel/*` |
| `materialsData` | not loaded ✅ | `/malzemeler*` |
| `LegacyLanding` | not loaded ✅ | `/legacy-landing` |

**Good news, recorded as such:** the code-splitting for the heavy specialist bundles already
works. Not one of the three 500 kB+ chunks touches the landing route. The landing's 777.8 kB is
made of framework + motion + Supabase, not of Three/OCCT/xlsx.

Non-200 same-origin responses on `/`: **none**.

## 4. What Phase 12 inherits

| Item | Measurement | Target reference |
|---|---|---|
| Initial JS on `/` | 777.8 kB raw / 36 chunks | `IMPLEMENTATION.md` §12 target gates |
| Render-blocking CSS on `/` | 219.3 kB raw (167.64 global + 51.69 landing) | — |
| Chunks > 500 kB in the build | 3 (858 / 775 / 627 kB) | Vite warns at 500 kB |
| Dual motion runtime on `/` | 242.3 kB raw | `CLAUDE.md` motion rules |
| Wasted high-priority preload | 1 (`/src/assets/hero-cnc.jpg` → HTML) | LCP < 2.5 s |
| Icon-chunk request overhead on `/` | 28 requests / ~15 kB | — |
| `dist` on disk | 22 MB | — |
