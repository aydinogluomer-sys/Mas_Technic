# Bundle Forensics — Phase 11B
Date: 2026-04-18
Build: Vite production (no 11A color changes — pre-migration baseline state)

## Chunk Inventory (top by raw size)

| Chunk | Raw | Gzip | Purpose |
|---|---|---|---|
| xlsx.min-CJ8YSDyO.js | 850K | 323 KB | Excel export (lazy, async) |
| vendor-three-C_x4mMja.js | 672K | 177 KB | Three.js (R3F WebGL) |
| index-onPjJrZ5.js | 470K | 145 KB | **Main / public landing** |
| vendor-recharts-Bo9PaO9E.js | 435K | 116 KB | Recharts (admin dashboards) |
| AdminDashboard-CHhJF70F.js | 324K | 72 KB | Admin SPA (lazy) |
| vendor-fiber-CkQ9ZiqY.js | 306K | 99 KB | @react-three/fiber + drei |
| servicePages-CuTr9cj0.js | 175K | 54 KB | Service pages bundle |
| vendor-framer-Cte1g0Ch.js | 134K | 45 KB | Framer Motion |
| ChatBot-CoHZU_eY.js | 134K | 43 KB | Chatbot (lazy) |
| MusteriPaneli-C04xj-Ek.js | 134K | 38 KB | Customer SPA (lazy) |
| occt-import-js-ByQoZ4lW.js | 111K | 28 KB | STEP loader (lazy) |
| vendor-gsap-D7WUu43W.js | 70K | 28 KB | GSAP |

## Before/After Size Delta
**No code changes this session — sizes identical:**
```
BEFORE & AFTER (top 5):
850K  xlsx.min                850K
672K  vendor-three            672K
470K  index                   470K
435K  vendor-recharts         435K
324K  AdminDashboard          324K
```
Delta: **0 bytes** (expected — pre-11A state).

## Leak Scan Results (main chunk: `index-onPjJrZ5.js`)

### Admin strings: `AdminDashboard`
**Context inspected** — appears in two non-leak locations:
1. `assets/AdminLogin-...js","assets/AdminDashboard-...js"` → Vite preload manifest (chunk filename map)
2. `m.lazy(()=>se(()=>import("./AdminDashboard-...js"),__vite__mapDeps([...]))).then(t=>({default:t.AdminDashboard}))` → `React.lazy()` wrapper in `App.tsx`

Verdict: **MINIFIER_RESIDUAL** — only the chunk URL + lazy() wrapper string, NOT the component code. Verified via separate chunk presence (`AdminDashboard-CHhJF70F.js`, 324K) and zero size delta.

### Customer strings: `MusteriPaneli`
Same pattern — Vite preload manifest entry + `m.lazy()` wrapper. Code lives entirely in `MusteriPaneli-C04xj-Ek.js` (134K separate chunk).

Verdict: **MINIFIER_RESIDUAL — verified non-leak**.

### xlsx strings: NONE
- `xlsx-js-style`: 0 matches
- `SheetJS`: 0 matches
- `XLSX.utils`: 0 matches

Verdict: **CLEAN** — `xlsx-js-style` is fully isolated in `xlsx.min-...js` (850K) and only loaded via `await import("xlsx-js-style")` in `src/utils/excelExport.ts:241`.

### Supabase admin-only: `user_roles`
**Context**: `await li.from("user_roles").select("role").eq("user_id",i.user.id)` — this is the `useAuth` role-fetching call that runs for **every authenticated user** (not admin-only). Required for client-side route guards (`ProtectedRoute`, `CustomerProtectedRoute`). NOT a leak; intentional.

Verdict: **CLEAN — intentional cross-cutting concern**.

## Verdict
- [x] **CLEAN** (with documented MINIFIER_RESIDUAL for AdminDashboard / MusteriPaneli string references — verified via separate chunks of expected size and zero delta)
- [ ] LEAK_DETECTED

## Total Bundle
- Total JS (raw): ~18 MB across all chunks
- Largest chunk: `xlsx.min-CJ8YSDyO.js` (850 KB raw / 323 KB gzipped) — **lazy-loaded**, not in landing initial load
- Landing initial load (rough): `index` (145 KB gz) + `vendor-three` (177 KB gz) + `vendor-fiber` (99 KB gz) + `vendor-framer` (45 KB gz) + `vendor-gsap` (28 KB gz) ≈ **~493 KB gzipped**
- Red flags (>300 KB gzipped on landing): `xlsx.min` is 323 KB gz **but lazy** — does NOT impact landing.

## Recommendations (deferred, not in 11B scope)
- `vendor-three` (177 KB gz) → could be route-gated to only `/` and 3D viewer pages.
- `vendor-recharts` (116 KB gz) → already admin-isolated via `AdminDashboard` chunk's deps; verify it's not in landing preload graph.

## Note
- 11A color sweep not yet applied — bundle sizes reflect pre-migration state.
- Token migration (string-only changes in JSX/TSX) is expected to have negligible bundle impact (<2 KB).
