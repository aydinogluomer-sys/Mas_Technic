# Phase 11B — Bundle Leak Scan (Post 11A-extended)
Date: 2026-04-18
Build: clean `rm -rf dist && vite build`

## Main Entry Chunk
`dist/assets/index-uZLA8M3x.js` — 480 kB (raw) / 145 kB (gzip)

## Leak Matrix

| Module | Main chunk hits | Verdict | Separate chunk |
|---|---|---|---|
| `xlsx-js-style` / `XLSX.utils` | 0 | ✅ CLEAN | `xlsx.min-CJ8YSDyO.js` (627K / 323K gz) |
| `occt-import-js` / `ReadStepFile` | 0 | ✅ CLEAN | `occt-import-js-ByQoZ4lW.js` (111K / 28K gz) |
| `AdminDashboard` / `FinancialView` | 2 (route lazy import strings only) | ✅ CLEAN | `AdminDashboard-ZrJIJrWt.js` (329K / 72K gz) |
| `MusteriPaneli` / `TekliflerimTab` | 2 (route lazy import strings only) | ✅ CLEAN | `MusteriPaneli-2pzG5PnH.js` (134K / 37K gz) |

### Note on the "2 hits"
The two matches in `index-uZLA8M3x.js` for AdminDashboard/MusteriPaneli are the literal module specifiers used by `React.lazy(() => import("./pages/AdminDashboard"))` in `App.tsx`. They are NOT compiled component code — verified by the existence of dedicated 329K/134K async chunks.

## Other Async Chunks (verified separated)
- `vendor-three-C_x4mMja.js` (687K / 176K gz) — Three.js
- `vendor-recharts-Bo9PaO9E.js` (445K / 115K gz) — Recharts (admin-only)
- `vendor-fiber-CkQ9ZiqY.js` (306K / 98K gz) — R3F
- `vendor-framer-Cte1g0Ch.js` (134K / 44K gz) — Framer Motion
- `vendor-gsap-D7WUu43W.js` (70K / 27K gz) — GSAP
- `cssVar-BEg8HBIK.js` (14K / 4.8K gz) — new helper bundle

## Verdict
**PASS** — Zero leaks. All admin/customer/heavy modules are properly code-split.
