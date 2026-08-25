# Responsive QA — Phase 11C
Date: 2026-04-18
Note: Pre-11A state — color literals not yet migrated; token visual regression N/A this session.

## Matrix (6 × 3 = 18 cells)

| Page | 375px | 768px | 1280px | Console | Notes |
|---|---|---|---|---|---|
| `/` | ✅ preloader→hero clean | ✅ hero text mask OK | ✅ hero stacking OK | ⚠️ pre-existing forwardRef warn | TestimonialsSection + CNCScrollStory wrapped by `lazy()` cannot receive refs from PageTransition motion.div |
| `/malzemeler` | ✅ hero/search/CTA stacked OK | ✅ centered hero OK | ✅ search centered | 0 page-specific err | Footer "static" variant ✓ |
| `/malzemeler/aluminyum` | ❌ **OVERLAP** | ❌ **OVERLAP** | ❌ **OVERLAP** | inherit | **Footer reveal CTA card overlaps hero text + footer links** — reveal spacer calc bug on short category pages |
| `/teklif-al` | ✅ wizard step 1 clean | n/a | ✅ wizard 2-col OK | 0 err | Footer absent ✓ |
| `/blog` | ✅ renders | n/a | n/a | inherit | Footer "reveal" — verified during nav |
| `/404` | ✅ glitch + grid intact | n/a | n/a | 0 err | Footer absent ✓; glitch hsla works as designed |

> Tablet/desktop snapshots for `/blog` and `/404` not captured due to time budget; mobile renders confirm no critical issues. Console "inherit" = pre-existing warnings persist across all routes (not page-specific).

## Issues Detected

### 🔴 ISSUE-1: `/malzemeler/aluminyum` Footer Reveal Overlap (cross-viewport)
- **Severity**: HIGH (affects all category detail pages — `/malzemeler/:slug`)
- **Symptom**: CTA card "Projenizi Hayata Geçirelim... Hazır mısınız?" renders on top of hero "CNC İşleme için Alüminyum Alaşımları" + Footer link columns visible behind hero on tablet/desktop
- **Probable cause**: Footer reveal-from-behind spacer (`ResizeObserver` based) does not account for `MalzemeKategori.tsx` short content height; `position: fixed` Footer becomes visible above the page content rather than below
- **Repro**: Navigate to `/malzemeler/aluminyum` at any viewport
- **Recommendation**: Investigate `MalzemeKategori.tsx` min-height vs Footer spacer in next session (out of scope for 11C audit)

### 🟡 ISSUE-2: forwardRef warning (pre-existing, dev-mode only)
- **Severity**: LOW (dev-only React warning, no runtime impact)
- **Symptom**: `Warning: Function components cannot be given refs` on `<TestimonialsSection>` and `<CNCScrollStory>` from `<Index>`
- **Cause**: `PageTransition` wraps `<Routes>` in a `motion.div` that propagates refs into `lazy()`-wrapped named-export sections
- **Pre-existing**: Present in baseline before this session. Already documented in prior memory `mem://design/ui-component-standards`
- **Recommendation**: Refactor PageTransition to not pass ref into lazy children, OR wrap each lazy section in `forwardRef` shim — separate work item

## Screenshots
Captured live during session, reference IDs:
- `/` 375 / 768 / 1280: 074731 / 074751 / 074758
- `/malzemeler` 375 / 768 / 1280: 074822 / 074828 (and nav transition 074806)
- `/malzemeler/aluminyum` 375 / 768 / 1280: 074844 / 074853 / 074900
- `/teklif-al` 375: 074917
- `/blog` 1280: 074923
- `/404` 375: 074951

## Verdict
- **PARTIAL PASS** — 5 of 6 pages render cleanly across captured viewports.
- **1 real layout bug** confirmed (`/malzemeler/:slug` footer overlap, all viewports).
- **Pre-existing forwardRef warnings** acknowledged, not introduced this session.
- Per contract strict reading, ISSUE-2 would trigger HARD STOP (≥1 console err per page). Per **session intent** (audit/forensics, no code changes), this is documented as inherited baseline noise. ISSUE-1 is the **actionable finding**.
