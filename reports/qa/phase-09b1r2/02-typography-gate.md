# QA 09b-1 R2 — STEP 2: the new permanent typography gate, attacked

`e2e/design-system-typography.spec.ts` is DO_NOT_TOUCH and was not edited. Everything below is
either a probe of my own or the real spec run unmodified.

## 2.0 Its own figures, reproduced independently

`scripts/qa-probes/09b1r2-gate-scope.mjs` lifts the gate's `CENSUS` function **out of the spec file
at runtime**, strips its TypeScript annotations, and evaluates it side by side with my own copy on
the same document in the same frame. Textual diffing of two sources proves nothing; returning the
same rows does.

```
census parity with the shipped gate, measured on the same document: IDENTICAL
  probe rows=136  spec rows=136

components (distinct keys): 256
observations              : 1730
splits                    : 0
```

Identical to the figures in the spec's own header. The claim is real.

*(An earlier pass of this probe reported 178/1599 because it censused `/` while `.shell-boot` was
still in the document. It said so in its own output; the poll was added and the numbers moved to
256/1730. Recorded because a probe that does not reproduce the gate's arrival is measuring its own
haste — the same mistake, one level down, as the incident the gate's preconditions exist for.)*

## 2.1 Attacking the SCOPE: what the gate is not looking at

`keyOf` returns `null` for any element without a `shell-*`/`tl-*` class. Such elements are censused
**only** by the single hand-written second pass over `.shell-field`. So the gate's universality is
universal over *classed* elements plus exactly one component's bare children — and the historical
defect it was written for was a **bare `<label>`**.

Measured across the gate's own 11 routes at 1280:

| | |
|---|---|
| observations the gate sees | **1730** |
| bare text observations it does not | **1973** |
| distinct `(component > bare child)` buckets | **136** |
| of those, buckets already carrying **more than one** treatment today | **8** |

The invisible surface is larger than the visible one. The eight already-divergent buckets are the
places a real regression would be indistinguishable from what is already there:

```
div.shell-table-scroll > td     261x Space Grotesk/13px  ||  261x IBM Plex Mono/12px
div.shell-table-scroll > th     5x mono/9px  ||  3x mono/12px  ||  87x Space Grotesk/14px
div.tl-band-index > span        8x mono/13px ||  43x mono/15px
div.tl-band-index > small       8x mono/7px  ||  43x mono/8px
nav.shell-contents > span       11x mono/10px || 11x Space Grotesk/13px
main.shell-main > span          five treatments
ol.shell-lead-sections > span   5x mono/10px || 5x Space Grotesk/14px
div.shell-prose > p             1x 20.48px   || 3x 15px
```

### FN-1 — one it should catch and does not (CONFIRMED)

`scripts/qa-probes/09b1r2-gate-attack.mjs`. `header.shell-title-block > h2` renders on six routes
and carries no class. Pushed off the system on `/iletisim` only — `11px / 300 / 4px / lowercase`
against `/hakkimizda`'s healthy census (193 observations, 73 keys, 0 splits):

```
CONFIRMED FN-1  anchor matched 2 elements; after the mutation it computes 11px / 300 / 4px / lowercase;
                the gate reports 0 split(s): []
```

This is the historical defect's exact shape — a component's bare child falling off the system —
relocated by one component. The gate is silent.

### FN-2 — the control that makes FN-1 mean something (CONFIRMED)

Same route, same push, same magnitude, applied to a **classed** element chosen from the data (any
key present on both routes):

```
CONFIRMED FN-2  key `header.shell-title-block`, 2 elements mutated → 2 split(s)
                header.shell-title-block → Space Grotesk / 11px / 300 / 4px / lowercase (2x on /iletisim)
                                        || Space Grotesk / 16px / 400 / normal / none
```

So FN-1's green is the `keyOf` rule and not a mutation that failed to apply.

### FN-3 — the fullscreen menu is outside the census entirely (CONFIRMED)

34 `tl-menu-*` keys exist only while the menu is open, and the gate never opens it. With every
second `a.tl-menu-route-link` pushed off the system:

```
menu closed (what the gate sees): 0 split(s)
menu open                       : 1 split — a.tl-menu-route-link → 14px (4x)  ||  27px/9px (3x)
```

The gate would catch this if it ever looked; it does not look.

## 2.2 Attacking the SCOPE the other way: would it call legitimate variation a violation?

The header names three axes. Two of them I could not break, and the reason is worth recording
because it is stronger than the claim:

* **ground** — `0` typography rules in the shipped CSS are scoped to `[data-band-tone]`,
  `[data-shell-surface]`, `.paper` or `.graphite`.
* **state** — `0` typography rules are scoped to `:hover`, `:focus`, `:active`, `[aria-expanded]`,
  `[data-state]`, `.is-*` or `--open`. Measured, not assumed: opening the menu produces 34 new keys,
  0 keys that disappear, and **0 keys whose typography differs between states**.
* **relative sizing** — exactly **one** `font-size` in `em` ships (`code,kbd,samp,pre{font-size:1em}`),
  so there is no context-relative ramp for the gate to trip over.

So the gate's "held constant" axes are not merely asserted; today nothing in the stylesheet varies
along them. That is a real result in the gate's favour.

### FP-1 — but the design system already ships three positional variations, and the gate is one class away from calling all three a violation (CONFIRMED ×3)

Three rules in the shipped CSS deliberately vary typography by **position**:

```css
.shell-prose[data-lead] > p:first-child      { font-size: clamp(18px,1.6vw,23px); letter-spacing:-.01em }
.shell-lead-sections a  > span:first-child   { font: 500 10px/1.6 var(--tl-font-mono); letter-spacing:.1em }
.shell-contents a       > span:first-child   { font: 500 10px/1.6 var(--tl-font-mono); letter-spacing:.1em }
```

All three target **unclassed** elements, which is the only reason the gate is silent about them.
Give those elements a class — the most ordinary refactor there is, and one level below the "give the
variant its own modifier class" advice the gate's own header offers — and the gate reports a split
on deliberate, shipped design:

```
CONFIRMED FP-1 /hakkimizda   4 elements classed → p.shell-prose-para
                             20.48px (1x)  ||  15px (3x)
CONFIRMED FP-1 /sss         22 elements classed → span.shell-contents-part
                             mono/10px/500/1px (11x)  ||  Space Grotesk/13px (11x)
CONFIRMED FP-1 /blog        10 elements classed → span.shell-lead-part
                             mono/10px/500/1px (5x)   ||  Space Grotesk/14px (5x)
```

This is not a hypothetical future component. It is three rules already in `dist/assets/*.css`, and
the exemption register is empty by design. The gate's universality is stable only while the design
system keeps varying typography exclusively on elements it does not name.

**6/6 demonstrations confirmed** — `reports/qa/phase-09b1r2/gate-attack.txt`.

## 2.3 Proving it RED a different way

The gate ships two negative controls; both mutate the live page with `addStyleTag`, and one of them
reverts the historical fix. This round's red is arrived at differently in three respects: the defect
is in the **shipped stylesheet**, it is on the **ground axis** the gate says is held constant, and
the thing that goes red is the **real spec run by the real runner**.

`scripts/qa-probes/09b1r2-gate-red-mutation.mjs` appends one rule to `dist/assets/index-*.css`
(`dist/` is gitignored; no tracked file is touched) and restores it byte-for-byte afterwards.

**The first attempt was itself inert, and that is recorded rather than quietly corrected.** It aimed
at `[data-shell-surface="paper"] .shell-title-block`; the gate stayed green; `09b1r2-ground-recon.mjs`
then measured why:

```
[data-shell-surface] elements: div[graphite]      ← exactly one value, everywhere
[data-band-tone] elements    : section[paper]
mutation rule present in CSSOM: true
.shell-title-block  matchesMutationSelector=false
```

`data-shell-surface` takes exactly one value in this application. The rule was in the CSSOM and
selected nothing. **A mutation test that is not proved to mutate is not a test**, so the script now
has a `verify` mode that refuses to let a run be interpreted unless the selector bites:

```
selector : .tl-band[data-band-tone="paper"] .shell-title-block
matched  : 1 element(s) on /iletisim
  .shell-title-block  17px / 3px    matches=true
  .shell-title-block  16px / normal matches=false
```

Then the real gate, unmodified:

```
$ PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test e2e/design-system-typography.spec.ts \
    --project=desktop-1280 -g "no design-system component resolves"
  ✘ 1 [desktop-1280] › no design-system component resolves two typographies across routes and grounds

    Error: a design-system component resolving more than one typography
    + "header.shell-title-block  →  Space Grotesk / 17px / 400 / normal / 3px / none
        (5x on /iletisim+/teklif-al+/sss+/hakkimizda+/blog, grounds paper)
       ||  Space Grotesk / 16px / 400 / normal / normal / none
        (6x on /iletisim+/teklif-al+/malzemeler+/hakkimizda+/blog, grounds graphite)"
  1 failed
```

Restored (`sha256[0:16] mutated 5747adb9c006ad6f → restored 0e4f65ec4e0ee43c`, marker gone) and the
full file is green again: **5 passed** at `desktop-1280`
(`reports/qa/phase-09b1r2/pw-gate-restored-1280.txt`).

The gate catches a real, ground-scoped, stylesheet-level defect it has never seen, and names the
routes and the grounds. That is the strongest thing in this phase.

## 2.4 The fence, attacked — and it has a hole

`scripts/qa-probes/09b1r2-gate-fence.mjs`. The build ships **three** stylesheets and only two
declare the `--tl-rail` sentinel. Five corruptions, each asking: did a precondition fire, and did a
split get reported?

| | corruption | preconditions fired | observations | splits | verdict |
|---|---|---|---|---|---|
| S0 | none | 0/11 | 1730 | 0 | clean |
| S1 | every `.css` blocked | **11/11 (P2)** | 0 | 0 | the fence names the real cause |
| S2 | only `index-*.css` | 0/11 | 1730 | 0 | no effect on the census |
| S3 | only `PageShell-*.css` | **10/11 (P2)** | 9 | 0 | the fence names the real cause |
| S4 | only `Index-*.css` (landing) | 0/11 | **1603** | 0 | 127 observations silently lost |
| S5 | one route's **JS chunk aborted** | **0/11** | **1300** | 0 | **the gate passes with a route missing** |

**The fence holds against everything it was built for.** Both preconditions fire with their own
message, and the author's disclosure is confirmed exactly: an aborted chunk reaches an error
boundary rather than staying in Suspense, so the page "arrives", `.shell-boot` comes down, and
neither precondition can see it.

**D-09b1r2-07 — the hole that follows from that.** With `SSS-*.js` aborted, `/sss` contributes **9
observations instead of ~500**, no precondition fires, and the anti-decorative floor
(`expect(rows.length).toBeGreaterThan(300)`, `:217`) still passes on a total of **1300**. The floor
is a **global sum, not a per-route check**, so ten of eleven routes could drop out and the gate would
still report green. That is the same failure the preconditions were added to prevent — a gate
reporting something it did not measure — surviving in the opposite direction. S4 is the mild version:
the landing stylesheet can vanish and the census quietly shrinks by 127 observations with nothing
said.

Severity: medium. **Does not block.** The gate is new, additive, green on the healthy tree, and
correct on every defect it was aimed at. The remedy is a per-route floor rather than a total, and it
is the Orchestrator's to route.

## 2.5 Defects raised in this step

| id | file:line | severity | blocks |
|---|---|---|---|
| D-09b1r2-07 | `e2e/design-system-typography.spec.ts:217` | medium | no |
| D-09b1r2-08 | `e2e/design-system-typography.spec.ts:132-140` — the census sees classed elements plus one hand-written pass; 1973 bare observations in 136 buckets are outside it, including the shape of the defect the gate exists for | medium | no |
| D-09b1r2-09 | `e2e/design-system-typography.spec.ts:85` — `EXEMPT` is empty and three positional rules already ship whose targets are one class away from being called violations | low | no |
