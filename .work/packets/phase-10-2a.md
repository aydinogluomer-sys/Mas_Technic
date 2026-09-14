# CODER PACKET — PHASE 10, PACKET 2a: RESPONSIVE IMAGE MARKUP, DIMENSIONS, FALLBACK

PHASE_ID: 10-2a
BASE_COMMIT: `HEAD of claude/awwwards-90-overhaul` (state it in your first commit)
WORKTREE: `C:\Users\Trade Bilisim\precision-dynamics-hub-main\pdh-wt\coder-p09a` — if the harness blocks it,
use your isolated agent worktree on a branch from the same base, as 10-1 did. Say which.
REQUIREMENT IDs: 239–257 (responsive images), 670–679 (derivative pipeline).
INPUT: `reports/10/asset-inventory.md` (every `<img>` site, rendered sizes per viewport, 375-crop verdicts).

## TASK

1. **Intrinsic dimensions everywhere.** Every `<img>` on a public route carries `width` and `height` matching the
   asset (from the inventory) so layout reserves space — CLS is Phase 12's metric, the markup is this packet's.
   Where a component receives `src` as a prop (`BlurImage`), thread dimensions through the prop.
2. **Derivatives + `srcset`/`sizes` on the major image-heavy surfaces**: the ServiceDetail plate hero, the
   landing manifesto band and process figures, blog leads, and the capability-profile hero. Heroes are single
   1600-wide WebPs today. Generate width variants with **ffmpeg** (present: 8.1.1; `sharp` is not installed and
   no npm package may be added) — 640 / 960 / 1600, WebP, quality matched to the source, named
   `<name>-<w>.webp` beside the source. Only for assets that actually render at more than one size across the
   viewport matrix; say which, and why the others do not qualify. `sizes` must reflect the real layout, not
   `100vw` by default.
3. **`loading="lazy"` + `decoding="async"`** on every image below the fold; **not** on the first hero of a route.
   Do not set `fetchpriority` — Phase 12 owns LCP prioritisation.
4. **Missing-image fallback** in `BlurImage`: `onError` swaps to a branded placeholder (a shell-toned block with
   the alt text), never the browser's broken-image glyph. Prove it with a deliberately wrong `src` in a local
   probe, not by editing a route.
5. Do **not** change which asset a surface uses, crop, `object-position`, or alt text — those are 10-2b and 10-3.

## WRITE_ALLOWLIST
```
src/components/BlurImage.tsx
src/components/landing/EditorialKnowledgePreview.tsx  src/components/landing/ProcessProofCinema.tsx
src/components/LandingFlow.tsx  src/components/MaterialMorphScroll.tsx
src/components/technical-landing/FinalSections.tsx  src/components/technical-landing/ProcessNexusProjects.tsx
src/components/technical-landing/TechnicalHero.tsx  src/components/ui/testimonials-columns-1.tsx
src/pages/Blog.tsx  src/pages/BlogDetail.tsx  src/pages/KabiliyetProfilDetay.tsx  src/pages/ServiceDetail.tsx
src/assets/**                    (NEW derivative files only, named <name>-<w>.webp)
scripts/assets/make-derivatives.mjs   (the ffmpeg script, so the pipeline is reproducible)
reports/10/**
```
## DO_NOT_TOUCH
Alt attributes (10-3); asset choice/crop/`object-position` (10-2b); `public/**`; CSS; fonts; every spec;
`e2e/__golden__/**` unless a baseline moves for a reason you adjudicate at the DOM; `scripts/claims-gate.mjs`;
`PROGRESS.md`; `package*.json`; `.claude/**`.

## ACCEPTANCE
1. Every public-route `<img>` has correct `width`/`height`; lazy/async on below-fold images; first hero eager.
2. The named major surfaces carry `srcset`+`sizes` backed by committed derivatives; `reports/10/responsive-images.md`
   lists each surface, its rendered widths per viewport, and the derivative chosen at 375/768/1280.
3. Fallback proven; `npx tsc -b` exit 0 (paste); `npm run build` exit 0; gate PASS; `critical-1280` green;
   any moved golden adjudicated at the DOM.

## RULES
No new npm package. No network write. One agent. Commit after every step. `PARTIAL` accepted.
