# Performance Baseline — v3.0

**Date:** 2026-04-17 (rev2 — post xlsx dynamic import)
**Build command:** `npm run build`
**Build time:** 21.75s
**Total dist/assets:** 18 MB (uncompressed)

## Top Chunks (gzipped)

| Chunk | Raw | Gzipped | Notes |
|---|---|---|---|
| `vendor-three` | 688 KB | **176.5 KB** | Three.js + R3F — 3D viewer + WebGL scenes |
| `index` (main) | 480 KB | **145.2 KB** | Landing entry chunk |
| `vendor-recharts` | 445 KB | **115.8 KB** | Charts — admin dashboard |
| `vendor-fiber` | 306 KB | **98.7 KB** | React Three Fiber |
| `AdminDashboard` | 329 KB | 72.3 KB | Lazy route |
| `servicePages` | 175 KB | 54.4 KB | Static data |
| `vendor-framer` | 134 KB | 44.8 KB | Framer Motion |
| `ChatBot` | 135 KB | 42.9 KB | Lazy mounted |
| `MusteriPaneli` | 134 KB | 37.6 KB | Lazy route |
| `vendor-gsap` | 70 KB | 27.7 KB | GSAP + ScrollTrigger |
| `xlsx.min` (async) | 627 KB | 323.1 KB | **Now lazy** — admin Excel export only |

## ✅ Fixed Since rev1

- **xlsx-js-style code-split**: removed from `manualChunks` in `vite.config.ts` and switched
  `src/utils/excelExport.ts` to `await import("xlsx-js-style")`. Output filename is now
  `xlsx.min-*.js` (Rollup async chunk pattern) instead of the eager `vendor-xlsx-*.js`
  vendor chunk. **Saves ~323 KB gzipped on landing initial load.**

## Total JS budget

- **Landing first load (estimate):** index + vendor-framer + vendor-gsap + vendor-three +
  vendor-fiber ≈ **493 KB gzipped**.
- xlsx no longer counted (lazy on admin only).
- Target was < 300 KB gzipped → exceeded due to Three.js. Acceptable trade-off for the
  WebGL hero scenes (HeroCanvas, CNCScrollStory, MaterialMorphScroll are all `lazy()`-ed,
  so vendor-three only loads when the corresponding scene mounts).

## Remaining red flags (NON-BLOCKING)

- ⚠️ **Main `index` chunk 145 KB gzipped** — investigate if any admin/customer-only
  modules leak into it (e.g. shared utility imports).
- ⚠️ **`vendor-recharts` 116 KB gzipped** — admin dashboard only; could split per route.
- ✅ All other chunks under 100 KB gzipped.

## Build warnings

> Some chunks are larger than 500 kB after minification.

Source: `xlsx.min` (async, admin only), `vendor-three` (intentionally chunked, lazy
mounted scenes). Both warnings are acceptable.
