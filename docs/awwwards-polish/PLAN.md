# Awwwards Polish Run — Visible-Surface Plan (2026-09-28)

Scope: only what a visitor sees. Landing, every inner page (through the shared
shell), 404, header/menu, footer. No schema, no admin/musteri routes, no new npm
packages, Z-object only, CSS tokens only (CLAUDE.md forbidden list holds).

## Reference synthesis

Prompt files supplied by the user were read as *direction*, not as specs to clone:

| Source | What we take | What we leave |
|---|---|---|
| Prompt 1 (PORTALE) | Treat the existing site as chapter one; evolve its metaphor (the drawing sheet / datum / measurement) instead of replacing it. No card grids, no pills, no glow. | Banking story. |
| Prompt 2 / 8 (Pear, yacht) | Editorial pacing: scale contrast between huge display type and small mono data; text arriving with masked line reveals tied to scroll. One shared GSAP ticker (already Lenis→ticker in `SmoothScrollProvider`). | Video scrub (no approved machine footage — `USER_INPUTS` forbids stock facility). |
| Prompt 7 (stacked cards) | Big serif closing statements with italic muted second line; a strong single CTA per band. | Coloured card deck. |
| Prompt 5 / 9 (ring archives) | Cursor-coupled readouts as the "wow" micro-interaction, reduced-motion safe. | 3D rings. |
| Prompt 4 (aperture hero) | A cinematic closing: footer as the last scene — the wordmark resolved full width, not cropped. | WebGL jet/globe. |
| Awwwards SOTD industrial references (Lusion-style editorial engineering sites, KOTA "technical sheet" portfolios) | Oversized grotesk titles bleeding to the sheet edge, hairline datums, coordinate readouts, generous negative space. | — |

Skills used: `impeccable`, `mas-design-language`, `mas-grid-system`,
`mas-motion-system`, `mas-accessibility-qa`. No external repo cloned: every
needed primitive (GSAP, ScrollTrigger, Lenis) is already in the tree and new
packages are forbidden.

## Audit — defects found at 1440 and 375 (Playwright, prod build)

1. **Grid gutter defect (all inner pages):** band content sits flush on the rail
   hairline (0px gutter) — title, lede, lists touch the vertical rule.
2. **Duplicate rail indexes:** page rail (`C1 KURUMSAL`) and band index (`01`)
   stack in the same column; at 375 the rail label overflows its 42px track.
3. **Inner heroes are timid:** h1 30–52px in a 7/12 column, right half empty.
4. **Heading system inconsistent:** grotesk page titles, serif band titles at
   24–36px — no scale contrast, reads as documentation.
5. **404** on a paper ground (the only paper page), right half empty, no moment.
6. **Footer:** the `MAS TECHNIC` watermark is cropped and collides with the
   CTA buttons and the legal links.
7. **Header context** shows a redundant `MAS TECHNIC` on inner pages.
8. **Chat launcher** is off-palette teal.
9. **Landing:** 7–9px mono labels (usability), hero dimension label clipped,
   hero headline small relative to sheet; mobile rail `02` renders as a blank box.

## Phases (each: build → Playwright screenshots 1440/375 → critical suite)

- **P1 Grid & chrome** — gutters, rail de-duplication, header context, chat palette.
- **P2 Inner hero** — display-scale h1 with masked line reveal, ghost route code,
  full-width measured meta rail; applies to every page using `ShellPageHero`.
- **P3 Type scale** — band title blocks to editorial serif display scale,
  small-type floor 11px on landing/shell mono.
- **P4 404** — graphite "off-datum" stage: sheet-wide 404 with dimension lines and
  a live cursor coordinate readout; directory in two master columns.
- **P5 Footer** — closing scene: serif CTA statement, clean columns, a full-width
  wordmark that is revealed, never cropped.
- **P6 Menu** — verified; only fixes where defects show.
- **P7 Landing** — hero headline scale, dimension label fix, section heading scale.
- **P8 Regression** — critical Playwright lanes, goldens re-banked only for
  surfaces intentionally redesigned.
