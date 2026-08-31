# 06 · Design System — Mas Technic

> **Scope.** This file documents the **public** design system: the one the
> landing ships and that every public route inherits. It is written from the
> code, not from intent. Source files:
>
> - `src/styles/design-tokens.css` — the token contract
> - `src/styles/master-grid.css` — the sheet / band / subgrid primitive
> - `src/styles/technical-landing.css` — band composition
>
> The legacy **forge** palette (`--forge-teal`, `--forge-molten`, …) still
> exists in `src/index.css` because the shadcn wrappers, the admin dashboard
> and the customer panel consume it. It is **not** the public language and
> must not be used on a public surface. The two systems are deliberately
> separate; do not merge them and do not re-skin the public site with forge
> tokens.
>
> *(Bu dosya bilinçli olarak İngilizce: içeriği doğrudan CSS'teki token
> adlarına ve seçicilere referans veriyor.)*

---

## Principle

**Technical-editorial, not SaaS.** A graphite/charcoal field, warm technical
paper for evidence, hairline rules, engineering-sheet precision, restrained
bronze as the only editorial accent. Proof over claims, measurement over
adjectives.

Explicitly avoided: rounded card grids, glow/neon, glassmorphism, decorative
gradients, pill clusters, random icon-card grids, stock-corporate composition.

---

## Master grid — the one contract

```text
SHEET_MAX  1600px, centred, 1px side rules
BAND       --tl-rail  +  --tl-cols equal master columns
GAP        0 by contract
```

At 1600px the content field is ~1534px and one master column is ~127.8px.

| Token | Desktop | Tablet ≤1180 | Mobile ≤767 |
|---|---|---|---|
| `--tl-rail` | 64px | 56px | **42px** |
| `--tl-cols` | 12 | 6 | 4 |
| `--tl-gap` | 0 | 0 | 0 |

Rail share of viewport: 4.0% at 1600, 7.3% at 768, 11.2% at 375, 13.1% at 320.

**Enforced bound: the mobile rail share stays below 14%.** The number is
derived, not chosen. `mas-grid-system` forbids the rail "consuming ~15–18% of
viewport", so the implied ceiling is 15%; the shipped 42px rail is under it even
at the narrowest supported width (13.1% at 320); the removed defect — mobile
inheriting the 56px tablet rail — is above it (14.9% at 375, 17.5% at 320). A
14% bound therefore passes the shipped geometry and fails precisely the
regression it exists for. Asserted in `e2e/landing/landing-grid-axes.spec.ts`,
which runs at every mobile viewport in `playwright.config.ts`, `mobile-320`
included.

**The grid tokens are responsive in `design-tokens.css` only.** A band must
never redefine `--tl-rail` or `--tl-cols` inside its own media query. That is
how the landing previously acquired `23.8%`, `19.2%`, `4.6%`, `35%/65%`,
`48%/52%`, a fixed `132px` seventh track, `4fr/5fr/5fr` (fourteen units for a
twelve-unit grid) and `43fr/77fr`, none of which resolved to a master boundary
at any width.

### How a band consumes the grid

```css
/* band body — inherits the band's REAL tracks */
.tl-something-body { grid-column: 2 / -1; display: grid; grid-template-columns: subgrid; }
```

Two rules keep this honest:

1. **A subgridded element carries no horizontal padding, border or margin.**
   Per CSS Grid Level 2 those shorten the first and last subgrid track, so the
   outer edges leave the master grid even while the interior lines stay put.
   Breathing room belongs to the children.
2. **The outer edges of every structural block land on master axes. Internal
   subdivision within a block may be content-measured, and must be named where
   it occurs.** A nested block that keeps *publishing* master tracks downward —
   a card spanning 6 columns that divides on master lines 2 and 4 of those 6 —
   is a `.tl-subgrid` and does so on master lines, never on a fresh percentage.
   A block whose interior is a self-contained composition rather than a
   continuation of the page rhythm may divide on content, provided its own left
   and right edges stay on master axes. That is not a loophole: it is the
   boundary between page structure, which the grid owns, and component
   internals, which it does not. Every such block is enumerated below, and the
   enumeration is the permission — an unnamed content-measured division is a
   defect.

Fallback (`@supports not (grid-template-columns: subgrid)`) derives tracks from
the same tokens. For a full-width body with no horizontal padding and a zero
master gap it is geometrically identical.

#### Documented content-measured interiors

These FOUR blocks divide internally on content, deliberately. In every case the
block's own outer edges are on master axes and are measured by
`scripts/grid-axis-probe.mjs` at 375/768/1280/1440/1600.

| Block | Outer edges | Internal division | Why it is not master-divisible |
|---|---|---|---|
| `.tl-nexus-kpis` | master 3 → 12 (desktop); full field on tablet/mobile | `repeat(4,1fr)` | Four KPI cells across nine master columns have no common master line. The KPI strip is one bordered instrument, not four page columns. |
| `.tl-rfq-body > ol` | master 7 → 12 (desktop); full field below | `repeat(4,1fr)` | Four RFQ steps across five master columns have no common master line. The step list is a self-contained sequence inside the RFQ panel. |
| `.tl-title-block` | full content field | `auto minmax(0,1fr) auto` | The social block and the legal block are text-measured end caps; the middle track is whatever remains. Forcing master tracks would either clip the text or strand it. |
| `.tl-part-passport` (tablet only) | full content field, master 0 → 6 at 768 | `1fr 3fr 1fr`, with `dl` at `repeat(5,1fr)` | On tablet the passport becomes a horizontal data plate: title, spec table, drawing. Its three zones are proportioned to their content, not to the six master columns it spans. Desktop (`display:flex`, master 10 → 12) and mobile (`display:block`) have no such internal grid. |

Adding a fifth entry is a design decision, not a formatting one: it must be
justified here, and the block's outer edges must be added to the probe.

### Band composition

| Band | Composition |
|---|---|
| 01 Header | 3 / 6 / 3 — brand, context readout, actions (fixed global bar) |
| 02 Hero | 4 / 6 / 2 |
| 03 Proof | 6 cells × `span 2` |
| 04 Marquee | 12 |
| 05 Process | 4 / 8, then 4 steps × `span 3` |
| 06 Nexus | 3 / 9 (header title 3, KPIs 9; app rail 3, table 9) |
| 07 Projects | featured 6 / 6; secondaries `span 6`, each divided 2 / 4 |
| 08 Sectors | 4 cards × `span 3` |
| 09 Manifesto | 12; copy on a deliberate 7-column measure |
| 10 Quality | 6 evidence cards × `span 2`; stamp on a real 11–12 span |
| 11 References | 6 cells × `span 2` |
| 12 FAQ | 7 / 5 on master lines; gutter is child padding |
| 13 RFQ | 3 / 4 / 5 |
| 14 Footer | 4 / 8; nav columns 4 × `span 2` |

Because spans are expressed in master columns, most bands reflow on their own:
`span 2` cells go 6-per-row → 3-per-row → 2-per-row and `span 3` cells go
4-per-row → 2-per-row as `--tl-cols` steps 12 → 6 → 4.

**Band 01 is no longer an exception — the break was removed, not renamed.**
The header used to divide internally on `210px 1fr auto` because the quote
button plus the TR/EN language switch did not fit two master columns (202px at
1280) and overflowed. Phase 03 rebuilt band 01 as the fixed global navigation
and removed the language switch, which was inert anyway (`USER_INPUTS.md` §B —
`ENGLISH_LIVE_NOW: NO`). With the switch gone the actions cluster fits three
master columns with room to spare, so `.tl-header` is a `subgrid` like every
other band body and its interior lands on master axes.

Measured with `scripts/grid-axis-probe.mjs`, which probes the interior as well
as the outer edges now that there is no exception to protect:

| Width | Cols | Header outer | Brand | Context | Actions |
|---|---|---|---|---|---|
| 375 | 4 | C0 → C4, Δ 0.00 / 0.00 | C0 → C3, Δ 0.00 | *(hidden)* | C3 → C4, Δ 0.00 |
| 768 | 6 | C0 → C6, Δ 0.00 / 0.02 | C0 → C2, Δ 0.00 | C2 → C3, Δ 0.00 | C3 → C6, Δ 0.02 |
| 1280 | 12 | C0 → C12, Δ 0.00 / 0.13 | C0 → C3, Δ 0.03 | C3 → C9, Δ 0.10 | C9 → C12, Δ 0.13 |
| 1440 | 12 | C0 → C12, Δ 0.00 / 0.00 | C0 → C3, Δ 0.00 | C3 → C9, Δ 0.00 | C9 → C12, Δ 0.00 |
| 1600 | 12 | C0 → C12, Δ 0.00 / 0.06 | C0 → C3, Δ 0.02 | C3 → C9, Δ 0.05 | C9 → C12, Δ 0.06 |

The bar is `position: fixed` and renders through the `#shared-header-host`
portal, so it is out of `.tl-sheet`'s flow and the sheet reserves exactly
`--gnav-h` at the top instead. It still declares the same
`--tl-rail + repeat(--tl-cols, 1fr)` tracks at the same `--tl-sheet-max` width,
which is why its axes coincide with the sheet's rather than merely resembling
them.

### Verification

- `node scripts/grid-axis-probe.mjs` — measures every band's real edges at
  375 / 768 / 1280 / 1440 / 1600 against boundaries derived from the tokens in
  use, and prints band → edge → nearest axis → delta.
- `e2e/landing/landing-grid-axes.spec.ts` — the same assertion inside the
  critical gate. Tolerance 1px.
- **Dev grid overlay:** `CTRL+ALT+G` on `/` under `npm run dev`. It draws the
  rail and the live master columns using the same declaration as `.tl-band`,
  so it cannot drift from what it measures. It is reached only through an
  `import.meta.env.DEV` branch and is absent from `dist/`.

---

## Colour

Every public colour is a `--tl-*` token in `src/styles/design-tokens.css`.
A hardcoded hex/rgb in a public stylesheet is a defect.

### Surfaces

| Token | Value | Role |
|---|---|---|
| `--tl-void` | `#030506` | page behind the sheet |
| `--tl-black` | `#070b0d` | dark band field |
| `--tl-panel` | `#0c1114` | marquee / recessed panel |
| `--tl-panel-soft` | `rgba(10,15,18,.9)` | hero passport panel |
| `--tl-header-surface` | `rgba(7,11,13,.98)` | header bar |
| `--tl-label-surface` | `rgba(6,9,11,.92)` | measurement label / FCF chip |
| `--tl-paper` | `#eee9de` | warm evidence band |
| `--tl-paper-raised` | `#f6f2e8` | certificate card |
| `--tl-paper-sunken` | `#fbf8f1` | document inset inside a card |

### Ink — two ladders, one per ground

On dark: `--tl-white` `#f3f0e8` → `--tl-muted` `#b6bbb8` →
`--tl-on-dark-body` `#c1c5c2` → `--tl-on-dark-soft` `#aeb4b1` →
`--tl-on-dark-meta` `#a4aba8` → `--tl-on-dark-faint` `#868e8b`.

On paper: `--tl-ink` `#121719` → `--tl-ink-muted` `#3b423f` →
`--tl-ink-faint` `#4e5552` → `--tl-ink-soft` `#5c6360`.

### Rules

`--tl-rule` `rgba(227,231,225,.28)` · `--tl-rule-soft` `rgba(227,231,225,.16)` ·
`--tl-label-rule` `rgba(226,230,225,.42)` · `--tl-paper-rule`
`rgba(18,23,25,.3)` · `--tl-paper-rule-strong` · `--tl-paper-rule-soft`.
One weight (`--tl-rule-size: 1px`), four tones.

### Accents — restrained by rule

- `--tl-bronze` `#8a7359` (with `--tl-bronze-light` `#c9b699`) is the **only**
  editorial accent. It marks the italic serif clause in a band headline.
- `--tl-green` / `--tl-green-ink` is **semantic status only**.
- `--tl-stamp` `#8a4030` belongs to the quality seal and nothing else.

### Tints (state, not palette)

`--tl-tint-faint` · `--tl-tint-hover` · `--tl-tint-raise` · `--tl-ink-tint`.

---

## Typography — three faces, three jobs

| Token | Face | Job |
|---|---|---|
| `--tl-font-sans` | Space Grotesk | interface, body copy, display headings |
| `--tl-font-serif` | Newsreader | controlled editorial contrast on band headlines |
| `--tl-font-mono` | IBM Plex Mono | technical data only |

"Technical data only" means labels, measurements, codes, tables, units, part
numbers, indexes, metadata and rail annotation. **Never body copy.**

The serif appears in exactly one shape: a grotesk first line followed by an
italic serif clause in `--tl-bronze` (`.tl-process-intro h2`,
`.tl-nexus-body h2`, `.tl-faq-title`, `.tl-rfq h2`). It is not a general
heading face.

A face is selected through its token. A raw `font-family: "IBM Plex Mono",
monospace` in a public stylesheet is font-rule drift and is treated as a
defect.

---

## Spacing

4px base: `--tl-s1` 4 · `--tl-s2` 8 · `--tl-s3` 12 · `--tl-s4` 16 ·
`--tl-s5` 24 · `--tl-s6` 32 · `--tl-s7` 48 · `--tl-s8` 64.
`--tl-list-row` 34px is the shared FAQ/resource row rhythm.

Horizontal spacing inside a band is **child padding**. It is never a master
gap and never a margin on a grid item — both move a real axis.

---

## Border radius

```
--tl-radius: 0            corner radius, everywhere, no exception
--tl-radius-round: 50%    only where the element IS a circle
```

Corner radius is zero across the public system, matching `--radius: 0rem` in
`src/index.css`. `--tl-radius-round` is a **shape**, not a rounded corner, and
is limited to elements that are a disc by drawing convention: the notary seal,
the EN 10204 grade badge, the avatar disc.

Removed in Phase 02: the arbitrary 3px on the hero measurement labels,
tolerance frames and datum symbol.

---

## Motion

One easing curve for the whole system:

```
--tl-ease-out: cubic-bezier(.16, 1, .3, 1)
--tl-dur-micro .22s   --tl-dur-short .35s   --tl-in .62s   --tl-step 65ms
```

**Motion never changes geometry.** Only `transform`, `opacity`, `clip-path`
and `filter` are animated. No rule in the motion layer touches width, height,
padding, border or grid, so the grid is identical during and after animation.
Any element whose position is *compared* with another element's animates by
opacity alone — a translate would make an alignment contract time-dependent.

`prefers-reduced-motion: reduce` disables animation and transition inside
`.tl-root` entirely, and the page is complete without JavaScript.

---

## Focus and selection

```css
:focus-visible → 2px solid currentColor, 4px offset
::selection    → --tl-paper background, --tl-black text
```

---

## Depth

The public sheet has no z-stack of its own beyond the hero's local layering
(image → blend → ground → dimension lines → labels → copy → passport). Global
layers live in `src/styles/z-index.ts`; do not introduce a z-index outside it.
