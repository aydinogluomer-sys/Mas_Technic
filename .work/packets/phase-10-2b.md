# CODER PACKET — PHASE 10, PACKET 2b: ART DIRECTION, POLICY CROPS, DEAD PUBLIC ASSETS

PHASE_ID: 10-2b
BASE_COMMIT: `10a40a6`
WORKTREE: your isolated agent worktree on `wt/coder-p10-2b` from `10a40a6` (as 10-1/10-2a did).
REQUIREMENT IDs: 239–257 (mood, one idea per image, real-asset policy, mobile crop), 670–679.
INPUT: `reports/10/asset-inventory.md` §mood/policy and §375-crop; `reports/10/responsive-images.md`.

## ORCHESTRATOR RULING (recorded in PROGRESS.md; you may falsify with evidence)
`USER_INPUTS.md` §I: `FACILITY_PHOTOS: NONE`, `MACHINE_PHOTOS: NONE`, `TEAM_PHOTOS: NONE`, and "never falsify
the facility." A stock hall or stock staff presented as MAS's own is a falsification by implication.

## TASK

1. **Policy replacements.** `hero-makine-parkuru` (hall + staff under "Makine Parkuru") and `cnc-workshop`
   (wide hall, fallback hero on 15 `/endustriyel/*` pages + one blog post) may not stay as heroes of surfaces
   about MAS's own capacity. Replace each with an existing on-mood **process or material** asset from the
   inventory that carries no facility/staff implication (e.g. spindle/coolant, cavity, bracket). No new photos
   exist; do not fabricate. Record the mapping.
2. **Staff crops.** `hero-mekanik-montaj`, `hero-kalite-kontrol`, `hero-dfm-tasarim`,
   `hero-operasyonel-verimlilik`, `industry-hydraulic`: crop with ffmpeg to remove legible people **only where
   the subject survives** at every plate/card size in the inventory; otherwise replace as in (1). Regenerate
   derivatives with `scripts/assets/make-derivatives.mjs` for anything you crop.
3. **Mood failures.** `hero-kimyasal-islemler` (green/blue plant) and `service-cnc-freze` (blue stock): replace
   with an on-mood asset or crop to a graphite region that keeps one idea. **Never recolour.**
4. **375 art direction.** `hero-tolerans-hassasiyet` in the `/` manifesto band is CUT (x 36–64 % survives):
   provide a portrait crop via `<picture>` + `media="(max-width: 767px)"`, or `object-position`, whichever keeps
   the caliper scale. The eight MARGINAL plate crops: set per-asset `object-position` where a shift recovers
   the subject; record which remain marginal and why.
5. **Dead public assets.** Remove `public/sequence-cnc/` (8.9 MB, **0 references**, verified), and
   `public/machine-loop.mp4`, `public/placeholder.svg`, `public/images/mas-logo.svg` **only after re-grepping**
   each over `src/`, `index.html`, `vite.config.ts`, `public/*.html`, `e2e/`. Remove `HeroCanvas.tsx` if it is
   truly orphaned (no importer, no route). Paste the greps.

## WRITE_ALLOWLIST
```
src/assets/**  (crops, derivatives; deletions of assets you replace ONLY if zero references remain)
src/pages/ServiceDetail.tsx  src/pages/BlogDetail.tsx  src/data/servicePages.ts  src/data/blogData.ts (image field only)
src/components/technical-landing/FinalSections.tsx  (manifesto band only)
src/components/BlurImage.tsx  (object-position / <picture> support only)
src/components/r3f/HeroCanvas.tsx  (delete only)   public/sequence-cnc/**  public/machine-loop.mp4  public/placeholder.svg  public/images/mas-logo.svg
scripts/assets/make-derivatives.mjs   reports/10/**
e2e/__golden__/**  (baselines your change explains, each adjudicated at the DOM — expect plate/manifesto goldens to move)
```
## DO_NOT_TOUCH
Alt text (10-3); fonts/typography (10-4); `public/sequence-material/**`; every spec; `scripts/claims-gate.mjs`;
`PROGRESS.md`; `package*.json`; `.claude/**`.

## ACCEPTANCE
1. No public surface presents a hall or legible staff as MAS's own; the two FAIL-mood assets are gone from
   every surface; `reports/10/art-direction.md` records every replacement/crop with before/after 375 and 1280
   crops (ffmpeg contact sheet).
2. Manifesto at 375 shows the measuring idea; each of the eight MARGINAL plates is fixed or explicitly kept
   with reason.
3. Dead public assets removed with pasted greps; `npx tsc -b` exit 0 (paste); `npm run build` exit 0; gate PASS;
   `critical-1280` + `critical-375` green; every moved golden adjudicated at the DOM.

## RULES
No new npm package. No network write. One agent. Commit after every step. `PARTIAL` accepted.
