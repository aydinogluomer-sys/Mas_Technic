# CODER PACKET — PHASE 10, PACKET 5: GLYPH FIXTURE, SYMBOL SUBSTITUTION, CAMPAIGN AUDIT (PHASE CLOSE)

PHASE_ID: 10-5
BASE_COMMIT: `af43f74`
WORKTREE: isolated agent worktree on `wt/coder-p10-5` from that base.
REQUIREMENT IDs: 239–257 (campaign reads as one), 707–715, 716–725 (glyph rendering).
INPUT: `reports/10/typography.md` (glyph coverage table), `reports/10/asset-inventory.md`, `reports/10/art-direction.md`.

## TASK

1. **GD&T / engineering symbols the families lack.** `⊥ ⌖ ◎ ▱ ○ ★ ☆ ∪ ⌀ ∅ ∥ ⌒ ⌓ ⟂` have no glyph in any loaded
   family (measured in 10-4); they paint from Cambria Math / Segoe UI Symbol on Windows and may be tofu on
   Android. Sites: `src/data/servicePages.ts` (4 lines), `TechnicalHero.tsx` (3 lines). For each: substitute
   a glyph the family has (`Ø` for `⌀`/`∅` where it means diameter; `⟂`→`⊥` is not available either — use the
   word or the standard ASCII form `//` for parallel, `_|_`-style is not acceptable), or render the symbol via
   an inline SVG with an accessible name. Never leave a glyph that measures as system-painted. Re-run
   `reports/10/probes/glyph-coverage.probe.mjs`: system-painted cells must be **0** for glyphs the site uses.
2. **Tailwind stack bypass.** `font-mono`/`font-sans` utilities in component markup bypass the fallback faces.
   Align `tailwind.config.ts` `fontFamily` to the token stacks (with the fallback faces second) so the utilities
   and the tokens agree. No new package.
3. **Dev-only glyph fixture.** A dev-only route or Playwright fixture (not a public page) that renders every
   family × weight × style with the Turkish set `İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü`, the engineering set `± Ø µ ° ² ³ ×
   → ← ≤ ≥ ≈ ↑ ↓ ↻`, and a tabular-numeral column — with a screenshot committed to `reports/10/` at 375 and
   1280. If a route: gated by `import.meta.env.DEV`, excluded from the sitemap and `robots`, absent from dist.
4. **Campaign consistency review, final.** With 10-2b's replacements in place, re-read the whole set of shipped
   images (the inventory's PASS/MARGINAL/FAIL column) and write the closing verdict in `reports/10/campaign.md`:
   does the site read as one commissioned industrial-editorial campaign? Name any remaining MARGINAL and why it
   is accepted. Include a contact sheet of every shipped hero at 1280 (ffmpeg).
5. **Phase 10 closure evidence**: `reports/10/README.md` indexing the five packet reports, with each
   IMPLEMENTATION.md Phase 10 mandatory task mapped to the packet that did it and its status.

## WRITE_ALLOWLIST
```
src/data/servicePages.ts  src/components/technical-landing/TechnicalHero.tsx   (symbol substitution ONLY)
tailwind.config.ts   (fontFamily ONLY)
src/pages/dev/**  src/App.tsx  (dev-gated fixture route ONLY, if you choose a route)  OR  e2e/fixtures/glyphs/**
public/robots.txt  (only to exclude the dev route, if created)
reports/10/**   e2e/__golden__/**  (baselines your change explains, adjudicated at the DOM)
```
## DO_NOT_TOUCH
Fonts/links/CSS (10-4 closed them); images; alt; every spec; `scripts/claims-gate.mjs`; `PROGRESS.md`;
`package*.json`; `.claude/**`.

## ACCEPTANCE
1. Glyph probe: 0 system-painted cells for every glyph the site uses; Tailwind utilities resolve to the token
   stacks with fallback faces.
2. Fixture screenshots at 375/1280 committed; fixture absent from dist and sitemap.
3. `reports/10/campaign.md` and `reports/10/README.md` exist; `npx tsc -b` exit 0 (paste); build 0; gate PASS;
   `critical-1280` + `critical-375` green; every moved golden adjudicated at the DOM.

## RULES
No new npm package. No network write. One agent. Commit after every step. `PARTIAL` accepted.
