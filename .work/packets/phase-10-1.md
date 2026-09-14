# CODER PACKET — PHASE 10, PACKET 1: ASSET INVENTORY AND GOVERNANCE

PHASE_ID: 10-1
BASE_COMMIT: `a74e1f5`
WORKTREE: `C:\Users\Trade Bilisim\precision-dynamics-hub-main\pdh-wt\coder-p09a` on `wt/coder-p10-1`, clean.
REQUIREMENT IDs: 239–257 (imagery audit), 670–679 (asset governance).

## TASK

1. **Inventory every image asset** under `src/assets/**` and `public/**` (excluding `sequence-*` frames, which
   are inventoried as two sequences): file, dimensions, bytes, format, every import/reference site, and the
   route(s) it renders on. Write `reports/10/asset-inventory.md`. Measure; do not guess.
2. **Classify each asset**: used / unused / duplicate. Starting facts, verified by grep: `industry-automative.webp`
   and `industry-automotive.webp` both exist (typo duplicate); `feautured blog.png` (typo, space, PNG);
   `hero-basinçli-dokum.webp` (non-ASCII filename); 15 assets have zero import sites.
3. **Governance actions, only where safe**: remove assets with zero references (they are dead weight in the
   repo, not the bundle — say which). Rename non-ASCII/space/typo filenames and update every import. Standardise
   naming to `kebab-case-ascii.webp`. Do not touch `public/sequence-*`.
4. **Campaign consistency + mood audit** for every *used* asset: graphite/charcoal low-key industrial; no
   neon/cyberpunk, no generic blue factory stock, no clutter; one dominant idea per image. Record a one-line
   verdict per asset in the inventory. **`USER_INPUTS.md` §I: `FACILITY_PHOTOS: NONE`, `MACHINE_PHOTOS: NONE`,
   `TEAM_PHOTOS: NONE`, `PROJECT_PHOTOS: USE_REPO`** — so no asset may depict or imply the facility, machines
   or staff as MAS's own. Flag any that does.
5. **Responsive crop / art-direction audit**: for each hero surface, whether the image survives the 375 crop
   (subject not cut). Record; fixes go to packet 10-2.

## WRITE_ALLOWLIST
```
src/assets/**                    (rename / delete only; no new assets)
src/**/*.tsx  src/**/*.ts        (ONLY import-path updates for renamed assets)
reports/10/**
```
## DO_NOT_TOUCH
`public/sequence-*`, any `<img>` markup or props (10-2), alt text (10-3), fonts/CSS (10-4), `supabase/**`,
every spec, `e2e/__golden__/**`, `scripts/**`, `PROGRESS.md`, `package*.json`, `.claude/**`.

## ACCEPTANCE
1. `reports/10/asset-inventory.md` lists every asset with dimensions, bytes, references, routes, mood verdict,
   375-crop verdict; unused and duplicate assets are removed with the reason recorded.
2. No filename with spaces, uppercase, or non-ASCII remains under `src/assets/`; every import resolves.
3. `npx tsc -b` exit 0 (paste output); `npm run build` exit 0; `node scripts/claims-gate.mjs` PASS;
   no golden moved.

## RULES
No new npm package. No network write. Commit after every step. `PARTIAL` accepted.
