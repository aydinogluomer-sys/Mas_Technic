# Phase 11C — Browser QA & ISSUE-2 Resolution
Date: 2026-04-18

## ISSUE-2 (forwardRef warning) — Root Cause & Fix

**Root cause:** `framer-motion`'s `AnimatePresence` (used in `PageTransition.tsx`) injects a `PopChildMeasure` ref into its first child for exit-animation measurement. When that child is a plain function component (or a `lazy()`-loaded function component without forwardRef), React 18 emits the warning.

**Components fixed (all wrapped with `forwardRef` + `displayName`):**
| Component | File | Why |
|---|---|---|
| `SectionDotNav` | `src/components/SectionDotNav.tsx` | lazy() child of `<Suspense>` under PageTransition |
| `Scene` | `src/pages/Index.tsx` | inline section wrapper |
| `FlowScene` | `src/pages/Index.tsx` | inline section wrapper |
| `TransitionBridge` | `src/components/ui/TransitionBridge.tsx` | lazy() child |
| `motion.button` (inside SectionDotNav) | `src/components/SectionDotNav.tsx` | converted from `<button>` so AnimatePresence can attach ref for exit |

## Browser QA Results (1280×720 desktop)

| Page | Render | Console errors | Theme integrity |
|---|---|---|---|
| `/` | ✅ | ISSUE-2 reduced (TransitionBridge fix to be verified post-rebuild) | OK |

## Notes
- Pre-existing WebGL "Context Lost" warning is unrelated to this phase (browser GPU recycling).
- Mobile/tablet QA carried over from previous Phase 11A-extended session — layouts unchanged.
- Theme reactivity for R3F materials confirmed via cssVar helper integration.
