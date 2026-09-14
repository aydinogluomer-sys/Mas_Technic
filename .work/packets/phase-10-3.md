# CODER PACKET — PHASE 10, PACKET 3: ALT TEXT

PHASE_ID: 10-3
BASE_COMMIT: head of `claude/awwwards-90-overhaul` at dispatch (state it).
WORKTREE: isolated agent worktree on `wt/coder-p10-3` from that base.
REQUIREMENT IDs: 239–257 (alt text), 372–390 (a11y — image text alternatives).

## MEASURED START
`grep alt=` over `src/**/*.tsx`: 6 × `alt=""`, `alt={post.title}`, `alt={page.title}`, `alt="Malzeme Dönüşümü"` ×2,
and data-driven `imageAlt` / `mediaAlt` / `figure.alt` / `gallery[].alt` / `industry.name` / `name` / `alt`.

## TASK
1. **Audit every rendered image on every public route** (use `reports/10/asset-inventory.md` for the surface
   list): classify **content** (conveys information not in adjacent text) vs **decorative** (mood/backdrop,
   or redundant with an adjacent heading/caption).
2. **Content images** get a meaningful alt that describes what is *shown* — subject, material, operation — not the
   page title, not "image of", not a keyword list. Turkish, ≤ ~125 characters, no trailing period rule needed.
3. **Decorative images** get `alt=""` (and `role="presentation"` only where the element is not already an
   `<img>`). A hero that sits under a headline repeating its subject is decorative by this rule.
4. **Data-driven alts**: audit the source fields (`blogData.ts` `imageAlt`, `caseStudies.ts` `gallery[].alt`,
   `technicalLandingData.ts` `mediaAlt`/`figure.alt`, sector `name`) for the same standard; fix in the data.
   `alt={post.title}` and `alt={page.title}` are redundant with the visible heading — resolve each site.
5. Write `reports/10/alt-text.md`: every image, route, classification, before → after, and the one-line reason.

## WRITE_ALLOWLIST
```
src/**/*.tsx  (alt / role attributes ONLY)
src/data/blogData.ts  src/content/caseStudies.ts  src/data/technicalLandingData.ts  src/data/servicePages.ts
src/content/*.ts  (alt fields only)
reports/10/**
```
## DO_NOT_TOUCH
Any `src`, `srcset`, `sizes`, `width`, `height`, `loading`, crop, or asset (10-2a/b); CSS; fonts; every spec;
`e2e/__golden__/**` (alt changes move no pixels — if a golden moves, stop and say why); `scripts/**`;
`PROGRESS.md`; `package*.json`; `.claude/**`.

## ACCEPTANCE
1. `reports/10/alt-text.md` covers every image on every public route with a classification and reason.
2. No alt equals the adjacent heading text; no content image has `alt=""`; no decorative image has prose alt.
   Prove with a rendered DOM probe over all public routes at 1280 (list each `<img>` with its alt and the
   nearest heading), committed to `reports/10/`.
3. `npx tsc -b` exit 0 (paste); `npm run build` exit 0; gate PASS; `shared-shell-accessibility` green;
   no golden moved.

## RULES
No new npm package. No network write. One agent. Commit after every step. `PARTIAL` accepted.
