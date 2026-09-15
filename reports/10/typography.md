# Phase 10-4 — Typography engineering

Base `4f90998` · branch `wt/coder-p10-4` · requirement IDs 707–715, 716–725 (visual half).
Every number below was read from a rendered page by a probe under `reports/10/probes/`; the
stylesheet was never the evidence.

| step | instrument | before | after |
|---|---|---|---|
| 1 synthetic faces | `font-faces.probe.mjs` — 99 routes @1280, `document.fonts` per face + CSS font-matching over the loaded faces + CDP `CSS.getPlatformFontsForNode` | `font-faces-before.md`: **87** mismatched (family, weight, style) combos, root `font-synthesis: weight style small-caps` | `font-faces.md`: **0**, root `font-synthesis: none` |
| 2 tabular numerals | same probe, "numeric" rows | 4 selectors carried `tabular-nums`; table row headers and prose cells did not | every aligned / updating figure computes `tabular-nums` (§2) |
| 3 headings / prose | `heading-widows.probe.mjs` — 5 routes × 375/768/1280, word-level `Range` rects | **2** soft-wrap widows, 29 over-75ch rows (27 container false positives) | **0** widows, 80/80 headings per width `balance`, 1 residual over-measure (a caption, on the record) |
| 4 fallback metrics | `scripts/fonts/metrics.mjs` + `font-swap.probe.mjs` | no `size-adjust`/overrides anywhere | three metric-matched local faces; swap shift table in §4 |
| 5 glyph coverage | `glyph-coverage.probe.mjs` — 41 glyphs × 10 faces, CDP painter per cell | **154** public-use cells painted by a system font | **50** in-family recoveries; 104 cells remain where the family has no such glyph (§5) |

## 1 · Loaded faces vs used faces

**Measured start.** The css2 request loaded Newsreader *italic only* at 300 and 400, Space
Grotesk 300–700 and IBM Plex Mono 400–700. The DOM asked for:

| family | weight | style | elements (99 routes) | what painted it |
|---|---|---|---|---|
| Newsreader | 400 | normal | 375 on 87 routes | the **italic** face — the only Newsreader face there was (`italic-for-upright`) |
| Newsreader | 400 | italic | 6 | italic 400 ✓ |
| Space Grotesk | 400 / 500 / 600 / 700 | normal | 5063 / 19 / 2469 / 487 | ✓ |
| Space Grotesk | 900 (`strong` in the manifesto `h2`) | normal | 1 | 700 face, no synthesis (Blink synthesises only when the matched face is < 600) |
| IBM Plex Mono | 400 / 500 / 600 / 700 | normal | 4040 / 5475 / 2670 / 141 | ✓ |
| IBM Plex Mono | 650 (eight `font:` shorthands) | normal | 25 | 700 face |
| Newsreader italic 300, Space Grotesk 300 | — | — | 0 | declared, never requested |

Two latent synthetic faces sat in dead CSS: `.tl-reference-grid li[data-brand="serif"]` asked
Newsreader for italic **600** (synthetic bold over italic 400) and `[data-brand="italic"]` asked
Space Grotesk for an **italic** it does not ship (synthetic oblique). No `REFERENCE_LOGOS` entry
sets `brand`, so nothing rendered, but both would have the moment one did.

**Fix.** `index.html` now requests `Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400` (upright
+ italic 400), `Space+Grotesk:wght@400;500;600;700`, Plex Mono unchanged. Every `650` became
`700` (the face it already resolved to — zero visual change, an honest request), the manifesto
`strong` is pinned to 700, the two `[data-brand]` rules ask for italic 400 / upright 700.
`html { font-synthesis: none }` in `src/index.css`.

**Proof.** `reports/10/probes/font-faces.md`: every (family, weight, style) combination on all 99
routes classifies `ok` against a `document.fonts` face with `status: loaded` (per face — not
`fonts.ready`), and CDP reports the webfont as the sole painter of the representative element of
each combination. Root `font-synthesis` computes `none`.

## 2 · Tabular numerals

**Measured.** At 40px, Space Grotesk sets `1111` at 66.9px and `0000` at 102.6px; with `tnum`
both are 99.2px. Newsreader's default figures are already equal-width at 91.3px. IBM Plex Mono
is monospaced (96px either way). So the surfaces that could drift were the Space Grotesk ones:
`th` row headers such as "Alüminyum 2024-T3" beside `[data-numeric]` cells, and prose cells in
the cookie/tolerance tables. The 30 mono counters were tabular by construction but declared
nothing.

**Declared once per surface, not per element:**

| surface | rule | file |
|---|---|---|
| every spec / comparison / material table | `.shell-table table` (+ restated on `thead th`, whose `font:` shorthand resets the property) | shell.css |
| measurement rows | `.shell-meta-row dd` (existing), `.shell-detail-figures dd` | shell.css |
| counters, indices, dates, sizes, in-place readouts | one grouped **NUMERIC REGISTER** rule at the end of shell.css: `.shell-title-index, .shell-index-no, .shell-index-meta > span, .shell-run-no, .shell-plate-no, .shell-segment-code, .shell-doc-section-no, .shell-auth-list-no, .shell-contents a > span:first-child, .shell-lead-sections a > span:first-child, .shell-detail-figures dd, .shell-field-hint, .shell-tags > li, .shell-rail, .tl-band-index, .tl-meta-run span` | shell.css |
| landing step / FAQ / RFQ numerals | `.tl-process li>span, .tl-faq summary span, .tl-rfq-body>ol b` after their shorthands; `.tl-nexus-kpis strong`, `.tl-proof article strong` beside theirs | technical-landing.css |
| header sheet count | `.tl-header-context` beside its shorthand | navigation.css |

Why the register sits at the end of the file: almost every counter is set with the `font:`
shorthand, which resets `font-variant-numeric`; a grouped rule ties them on specificity and wins
on order. The position is the mechanism, and the DOM probe is the check — verified on 12 routes,
31 selectors compute `tabular-nums` (list in the step-2 commit).

Left proportional, on purpose: prose, addresses, titles ("3 Eksen Frezeleme"), the phone number.
The `MaterialMorphScroll` overlay's "4/5" readouts are Tailwind `font-mono` markup (mono, so
tabular by nature) and outside the allowlist.

## 3 · Heading breaks, widows, measure

**Rule.** A widow is a heading of ≥ 3 words whose last line carries one word after a *soft*
wrap. The hero (`HAM GEOMETRİDEN<br>DOĞRULANMIŞ<br>HASSASİYETE`) and the manifesto end on
authored `<br>` stanzas — reported as `authored (br)`, not failed; the markup is the design and
outside this packet. A two-word heading on two lines is a `split` (nothing to pull down).

**Before** (`heading-widows-before.md`): project-grid `h3` at 768 ended on "7075-T6";
`.shell-next-copy h2` on `/blog` at 1280 ended on "çıktı?". 15 of 80 headings per width
computed `balance`, the rest `wrap`.

**After** (`heading-widows.md`): `h1–h6 { text-wrap: balance }` at the base layer in
`src/index.css` (the heading ROLE; `white-space: nowrap` on any heading still wins because an
unlayered `text-wrap-mode` beats it); `.shell-statement` and `.shell-notfound-title` — headings
by role, not tag — carry it explicitly. **0 widows** on `/`, `/hizmetler/cnc-frezeleme`,
`/endustriyel/havacilik-uzay`, `/blog`, `/kvkk` at 375 / 768 / 1280; 80/80 headings compute
`balance` at every width.

`text-wrap: pretty` on the prose CONTAINERS (inherited): `.shell-prose, .shell-lede,
.shell-title-block > p, .shell-faq-answer, .shell-index-desc, .shell-run-detail,
.shell-detail-lede, .shell-detail-list, .shell-table-note, .shell-next-lede, .shell-notice-body,
.shell-state-detail, .shell-evidence-body, .shell-doc-section-body, .shell-note,
.shell-auth-legal` and the landing's `.tl-hero-copy>p, .tl-process li p, .tl-manifesto p,
.tl-faq details p, .tl-cert>p, .tl-rfq-body>ol span`. Progressive: an engine that does not know
`pretty` drops the declaration and keeps `wrap`.

**Measure.** Every `p/li/dd` ≥ 100 characters that sets its own text was measured as
content-width ÷ the advance of `0` in its own font. Prose roles all sit at 46–72.5ch. One
lacked a cap and could set 107ch at 768 on `/kvkk`: `.shell-note` (the doc-aside margin note),
now `max-width: 72ch`. One residual: `.tl-proof-note`, a 117-character 8px mono footnote set
right-aligned on one line under the proof strip (141ch at 768, 246ch at 1280). It is a caption,
not long-form prose; a `ch` cap would fold it to two lines and change the strip. Left as is.

## 4 · Fallback metrics

**Method.** `scripts/fonts/metrics.mjs` — no package (`fontkit` is not installed and none may be
added). It fetches the site's css2 stylesheet with a Chrome UA, downloads the *latin* 400 upright
WOFF2 of each family (cached in the OS temp dir, not the repo), and reads it with a parser
written in the script: WOFF2 header, base-128 table directory with the known-tag index, one
Brotli stream (`node:zlib`), then `head`, `hhea`, `OS/2`, `maxp`, `cmap` (format 4/12) and
`hmtx`. The table walk is verified by the `head` magic number; a transformed `hmtx` is refused
rather than guessed (Google's files transform only `glyf`/`loca`). The local fallbacks (Arial,
Georgia, Courier New from `C:\Windows\Fonts`) go through the same reader as plain sfnt.

Average advance is weighted by a **Turkish** letter-frequency table plus the space — the site's
text is Turkish; an English table weights `w x q` that Turkish barely uses and under-weights
`ı ş ğ ç ö ü`. Then `size-adjust = avg(webfont)/avg(fallback)` and the three overrides are the
webfont's `hhea` box over its em, divided by `size-adjust` (all three webfonts set
USE_TYPO_METRICS with typo == hhea).

| fallback face | local | size-adjust | ascent | descent | line-gap | source metrics |
|---|---|---|---|---|---|---|
| Space Grotesk Fallback | Arial / Liberation Sans | 107.44% | 91.59% | 27.18% | 0 | SG upm 1000, hhea 984/−292/0, avg .4733em · Arial upm 2048, 1854/−434/67, avg .4405em |
| Newsreader Fallback | Georgia / Liberation Serif | 91.22% | 80.57% | 29.05% | 0 | NR upm 2000, hhea 1470/−530/0, avg .4024em · Georgia upm 2048, 1878/−449/0, avg .4412em |
| IBM Plex Mono Fallback | Courier New / Liberation Mono | 99.98% | 102.52% | 27.50% | 0 | PM upm 1000, hhea 1025/−275/0, .600em · Courier New upm 2048, 1705/−615/0, .6001em |

The faces live in `src/styles/design-tokens.css`; each `--tl-font-*` stack names its fallback
second; `body` takes the token stack (with the literal stack as the `var()` default).

**Cross-check (measured overlay, `font-swap-after.md` §Overlay).** A real site paragraph in a
300px column at 20px/1.5, webfont vs fallback face: Space Grotesk 9 lines / 270px both, width
ratio 0.992; Newsreader 7 / 210 both, 1.006; Plex Mono 11 / 330 both, 0.9997.

**Swap shift, before → after** (`font-swap-before.md` → `font-swap-after.md`). Geometry: the
route laid out with the font hosts aborted vs loaded, every text-owning element's `top`
compared. CLS: `layout-shift` entries with the WOFF2 responses held 1200ms, minus a
fonts-blocked control.

| vw | route | mean Δtop | max Δtop | moved > 1px | Δ doc height | swap CLS |
|---|---|---|---|---|---|---|
| 1280 | / | 25.3 → **0.18** px | 51.9 → 19.4 | 242/328 → **3**/328 | −36 → 0 | 0.0041 → 0.0027 |
| 1280 | /hizmetler/cnc-frezeleme | 49.7 → 51.1 | 74 → 74 | 274/318 → 274/318 | −74 → −74 | 0.0002 → 0 |
| 1280 | /blog | 21.5 → 21.7 | 26.8 → 24.8 | 124/142 → 124/142 | −25 → −25 | 0.0098 → 0.0097 |
| 1280 | /kvkk | 57.6 → 57.1 | 131 → 131 | 85/142 → 79/142 | −131 → −131 | **0.0539 → 0.0013** |
| 1280 | /malzemeler | 20.5 → **1.4** | 96.3 → 24.8 | 484/835 → **47**/835 | 71 → −25 | 0.0001 → 0 |
| 375 | / | 37.8 → 19.2 | 88.5 → 58.3 | 275/283 → 275/283 | −36 → −19 | 0.0107 → 0.0109 |
| 375 | /hizmetler/cnc-frezeleme | **265.0 → 7.3** | 432 → 20.2 | 267/282 → 165/282 | 432 → 2 | **0.0125 → 0.0001** |
| 375 | /blog | **108.3 → 14.9** | 232 → 30 | 98/111 → 55/111 | 231 → 30 | **0.0154 → 0.0001** |
| 375 | /kvkk | **211.7 → 24.4** | 349 → 49.6 | 99/113 → 66/113 | 350 → 50 | 0.0445 → 0.0237 |
| 375 | /malzemeler | 11.6 → 4.8 | 71.7 → 21 | 197/446 → 101/446 | 72 → 21 | 0.0004 → 0.0002 (control run picked up 0.082 unrelated) |

**Residual, on the record.** The three desktop prose routes keep their Δ. Their columns are
capped in `ch`, and `ch` is the advance of `0` in the *first available font*: Space Grotesk's
`0` is .638em, the size-adjusted Arial `0` .5975em, so `.shell-prose { max-width: 68ch }` is
6.3% narrower until the swap and every paragraph re-wraps into the wider column. Matching the
zero glyph instead would mis-set every line by 6.8% everywhere, including the mobile columns
that are now within 7–24px. The average-advance match is the right trade; the `ch` caps are the
packet's own unit. Also seen: a constant **0.079 CLS at 1280 in the fonts-blocked control** on
every route — a layout shift that has nothing to do with fonts (something shifts on load at
1280 alone); outside this packet, flagged for the coordinator.

Not covered: Tailwind `font-mono` / `font-sans` utility classes in component markup keep
Tailwind's own stack (`tailwind.config.ts` is outside the allowlist); the `MaterialMorphScroll`
overlay and the CAD dashboard are the surfaces affected.

## 5 · Turkish and engineering glyphs

`glyph-coverage.probe.mjs` renders each glyph in each of the 10 faces on
`/hizmetler/tolerans-hassasiyet` (the route with the GD&T table) and asks CDP which platform
font painted it. Glyph set: the Turkish letters, the packet's engineering set, and every symbol
grep found in public data/markup (`→ ← ↑ ↓ ↻ ≤ ≥ ≈ ⊥ ◎ ○ ▱ ⌖ ★ ☆ ∪ ⌀`).

| glyph group | SG 400/500/600/700 | NR 400 / 400i | PM 400/500/600/700 |
|---|---|---|---|
| `İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü` | in-family | in-family | in-family |
| `± Ø µ ° ² ³ ×` | in-family | in-family | in-family |
| `→ ← ≤ ≥ ≈` | **system → in-family** | system (no glyph) | **system → in-family** |
| `↑ ↓ ↻` | system (no glyph) | system (no glyph) | **system → in-family** |
| `⊥ ⌖ ◎ ○ ▱ ★ ☆ ∪ ⌀ ∅ ∥ ⌒ ⌓ ⟂` | system (no glyph) | system (no glyph) | system (no glyph) |

**Cause of the before state.** Google's latin/latin-ext `unicode-range` blocks stop at U+02FF
plus a few punctuation ranges (U+2191 and U+2193 are in latin; U+2190/U+2192 are not). A code
point outside every declared range is never looked up in the webfont, so `→` — used on ~85
public links — was Times New Roman on every route even though both sans and mono have it.

**Fix.** A second css2 request with `text=` for exactly these 22 code points, declared before
the main request so the main subsets keep priority. Google returns each family cut to those
glyphs with a matching `unicode-range`, so nothing downloads until a symbol is rendered and a
family that lacks a glyph falls through. File sizes: Space Grotesk 1988 B per weight, Plex Mono
1732–2824 B, Newsreader 5.4–6.2 KB (fetched only when a symbol is set in Newsreader — headings —
which the probe saw on 0 of 99 routes). On a typical route two to three of these load (`→` in
Space Grotesk 400/600, Plex 400/500): ~4–8 KB.

**Findings that need a substitution outside this packet** (the family has no glyph; system
fallback is Cambria Math / Segoe UI Symbol on Windows, and on Android there may be no font at
all): the GD&T symbol column in `src/data/servicePages.ts` (`⌖ ⊥ ◎ ▱ ○ ↻` — `↻` now in-family),
the `⊥` in the hero FCF (`TechnicalHero.tsx`), `★☆` machinability ratings (24 rows in
servicePages), `∪`. Recommended: GD&T as inline SVG symbols (they are drawn characters in ASME
Y14.5, not typographic), ratings as "5/5" in the mono register, `⊥` on the hero as an SVG path.

## Commands

See the packet return for the `npx tsc -b` paste and the e2e lanes.
