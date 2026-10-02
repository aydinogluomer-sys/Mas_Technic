# QA 09b-1 R2 — STEP 5: `.tl-cad-drop`, measured off painted pixels, in four states

`scripts/qa-probes/09b1r2-cad-drop.mjs` · evidence `reports/qa/phase-09b1r2/cad-drop.{txt,json}`.
Photographed with a 16 px margin, PNG decoded on a canvas **in the page** (neither `pngjs` nor
`pixelmatch` is a dependency and adding one is not QA's to add — round 1's constraint, kept). The
rule row is **found** by scanning for the darkest row rather than assumed, because the box sits at a
fractional `y`. Round 1 never reached this element: it lives on `/`, which was not in that round's
route list.

## 5.1 The eight rows

| viewport | state | declared border / background | painted ground | painted rule (darkest) | rule vs ground | rule vs fill |
|---|---|---|---|---|---|---|
| 1280 | rest | `1px dashed rgba(18,23,25,.54)` / transparent | `rgb(238,233,222)` | `rgb(119,119,115)` | **3.714:1** | 3.714:1 |
| 1280 | hover | `1px dashed rgb(18,23,25)` / `rgba(18,23,25,.04)` | `rgb(238,233,222)` | `rgb(18,23,25)` | 14.923:1 | 13.865:1 |
| 1280 | dragging | `1px **solid** rgb(18,23,25)` / `rgba(18,23,25,.04)` | `rgb(238,233,222)` | `rgb(18,23,25)` | 14.923:1 | 13.865:1 |
| 1280 | focus | outline `2px solid rgb(18,23,25)` offset 4px | `rgb(238,233,222)` | `rgb(18,23,25)` | 14.923:1 | 14.787:1 |
| 375 | rest | as above | `rgb(238,233,222)` | `rgb(119,119,115)` | **3.714:1** | 3.714:1 |
| 375 | hover | as above | `rgb(238,233,222)` | `rgb(18,23,25)` | 14.923:1 | 13.857:1 |
| 375 | dragging | as above | `rgb(238,233,222)` | `rgb(18,23,25)` | 14.923:1 | 13.857:1 |
| 375 | focus | as above | `rgb(238,233,222)` | `rgb(18,23,25)` | 14.923:1 | 14.923:1 |

**Worst boundary contrast across all eight rows: 3.714:1.** WCAG 2.2 SC 1.4.11 (non-text contrast)
requires ≥ 3:1. **PASS in every state at both widths.**

Each state was *proved to be the state*, not assumed: `data-dragging="true"` and
`border-top-style: solid` are read back for the drag row, and `:focus-visible` is read back as
`true` for the focus row (a `Tab` press first, so Chromium's keyboard-modality heuristic applies to
the programmatic `focus()`; asserted rather than hoped for).

## 5.2 Reconciling my 3.714 with the Coder's 3.672 — and what the difference is

The two numbers are the same measurement taken one step apart, and the arithmetic settles it exactly:

```
declared  rgba(18,23,25,.54) composited over paper rgb(238,233,222)  =  rgb(119,120,116)  → 3.6725:1
painted   modal pixel on the rule row                                    rgb(120,120,116)  → 3.6615:1
painted   darkest pixel on the rule row (the dash core)                  rgb(119,119,115)  → 3.7138:1
```

**3.672 is the computed composite, not a photographed pixel.** The painted range brackets it —
3.662 at the most common pixel, 3.714 at the dash core — so the figure is right to three decimal
places for the wrong reason, and nothing turns on it: every candidate is above 3:1 and the smallest
of them (3.662) still clears the criterion by 22 %.

Two smaller notes on the claim as phrased:

* *"against both fill and ground"* is one number and not two in the rest state, because the rest
  background is `transparent`: measured fill and ground are the **identical** pixel
  `rgb(238,233,222)`, contrast 1.000:1 between them. The reassurance the phrase offers is real only
  in the hover/drag states, where fill becomes `rgb(230,225,215)` and the rule still clears at
  13.86:1.
* The dashed rule is **not continuous**, which no summary mentions. Measured duty cycle on the rule
  row: **79.6 %** darker-than-ground at 1280 and **60.2 %** at 375. SC 1.4.11 is about the colour of
  the parts that are painted, so this does not change the verdict — but the 375 row means two fifths
  of the boundary is paper, and it is the narrower viewport that has the sparser rule.

## 5.3 The state changes themselves

The hover/drag affordance is carried almost entirely by the **border**, not by the fill:

```
fill vs ground, hover/drag:  1.076:1   (rgb(230,225,215) against rgb(238,233,222))
rule vs ground, rest → hover: 3.714:1 → 14.923:1
```

A 1.076:1 fill change is below any perceptual threshold on its own. The border change is a factor of
four in contrast and, in the drag state, also a change of `border-style` from dashed to solid — the
duty cycle goes from 79.6 % to **100 %**, which is a shape change as well as a colour change. So the
states are distinguishable, and they are distinguishable by more than colour, which is the useful
property. Recorded because "hover changes `border-color` **and** `background`" reads as two signals
and is measurably one and a half.

## 5.4 Defects raised in this step

None. `.tl-cad-drop` passes SC 1.4.11 in all four states at both widths, with no hardcoded hex
anywhere in its rules (confirmed: every colour resolves through `--tl-paper-control-rule`,
`--tl-ink`, `--tl-ink-tint`).
