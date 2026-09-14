# CODER PACKET — PHASE 10, PACKET 4: TYPOGRAPHY ENGINEERING

PHASE_ID: 10-4
BASE_COMMIT: head of `claude/awwwards-90-overhaul` at dispatch (state it).
WORKTREE: isolated agent worktree on `wt/coder-p10-4` from that base.
REQUIREMENT IDs: 707–715 (typography engineering), 716–725 (rendering, visual half).

## MEASURED START
Fonts: Google `css2` — IBM Plex Mono 400/500/600/700; **Newsreader italic-only** `ital,opsz,wght@1,6..72,300;1,6..72,400`;
Space Grotesk 300–700; `display=swap`. **No `font-synthesis` declaration anywhere.** `tabular-nums` on 4 selectors
(`index.css:813`, `navigation.css:319,368,461`, `shell.css:286`). `text-wrap: balance` on 2 selectors. **No
`size-adjust`/`ascent-override`/`descent-override`/`line-gap-override` on any fallback face.**

## TASK
1. **Loaded weights vs used weights.** Enumerate every `font-weight`/`font-style` the CSS and components apply
   per family; compare with what the `css2` URL loads. Every mismatch is a synthetic face. Fix by aligning the
   request or the usage — **Newsreader upright or weight > 400 is synthetic today**; decide which is used and
   load it, or stop using it. Then add `font-synthesis: none` at the root so a future mismatch shows as a
   missing weight rather than a fake one. Prove with a rendered probe reading `document.fonts` (status `loaded`
   per face, not `fonts.ready`) and computed `font-weight`/`font-style` per text node class.
2. **Tabular numerals** wherever numbers align in columns or update in place: spec tables, comparison tables,
   measurement rows, counters, indices, prices-with-quote. Audit every `<table>` and every numeric data cell;
   apply `font-variant-numeric: tabular-nums` at the right selector level, not per element.
3. **Heading line breaks, widows, measure.** `text-wrap: balance` on display/heading roles, `text-wrap: pretty`
   on prose paragraphs where supported (progressive); a measure cap (`max-width` in `ch`) on long-form prose
   roles that lack one. Verify no heading ends in a single-word last line at 375/768/1280 on the key routes.
4. **Fallback metrics.** Add `@font-face` fallback faces with `size-adjust`, `ascent-override`,
   `descent-override`, `line-gap-override` for the three families over their system fallbacks, computed from
   the real font metrics (script it — `fontkit` is not installed and no package may be added; read the
   metrics from the downloaded WOFF2 with a small parser, or from the Google CSS `unicode-range` blocks plus a
   measured overlay). Measure the swap shift before/after with a probe that blocks the webfont: CLS
   contribution from the swap must fall, and you report the numbers.
5. **Turkish + engineering glyphs.** Verify every family renders `İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü` at every weight in
   use, plus `± Ø µ ° ² ³ ∅ ⌀ ⊥ ∥ ⌒ ⌓ ⟂` and the GD&T set the site uses (grep for them). Any glyph that falls
   back to a different family is a finding; fix by loading the subset or substituting a glyph the family has.

## WRITE_ALLOWLIST
```
index.html  (font link only)   src/index.css   src/styles/design-tokens.css   src/styles/shell.css
src/styles/navigation.css   src/styles/technical-landing.css  (typography declarations ONLY — nothing motion/layout)
scripts/fonts/**  (metrics script)   reports/10/**
e2e/__golden__/**  (baselines your change explains, adjudicated at the DOM — expect text-wrap changes to move some)
```
## DO_NOT_TOUCH
Component markup; images; every spec; `scripts/claims-gate.mjs`; `PROGRESS.md`; `package*.json`; `.claude/**`;
`e2e/landing/motion-grammar.spec.ts` and the motion half of `technical-landing.css` (A23).

## ACCEPTANCE
1. Zero synthetic faces on any public route, proven by probe; `font-synthesis: none` at root.
2. Tabular numerals on every aligned/updating numeric surface; no heading widow at 375/768/1280 on `/`,
   one service page, one sector page, `/blog`, one legal page; fallback overrides in place with measured
   before/after swap shift; glyph coverage table in `reports/10/typography.md`.
3. `npx tsc -b` exit 0 (paste); `npm run build` exit 0; gate PASS; `critical-1280` + `critical-375` green;
   `design-system-typography` green; every moved golden adjudicated at the DOM.

## RULES
No new npm package. No network write beyond the fonts the site already loads. One agent. Commit after every
step. `PARTIAL` accepted.
