# QA Report — Phase 05b (creative choreography)

- PHASE: 05b
- CODE_COMMITS: `7085559`, `495d1d7`, `b3d66f6`, `d9a1b45`, `33ddcf8`, `1ee1361` (integration HEAD `1ee1361`)
- BASE FOR DIFF: `a2b4c20`
- QA_COMMIT: see final commit on `wt/qa-p05b`
- STATUS: **FAIL** (one item — R2, the hero measurement correlation)
- TESTS_PASSED: 196
- TESTS_FAILED: 0
- TESTS_SKIPPED: 3
- NEW_TESTS_ADDED: 0 (QA may not write `e2e/**` under this packet; 7 QA probe tools added under `reports/qa/tools/`)
- SCOPE_INTEGRITY: PASS
- B28_REGRESSION: **NONE**
- I4_REMAINING_DEFECT: **CONFIRMED_PRE_EXISTING**

Preview served from `dist/` on **port 4211** (4173/4199/5199 held by other
agents). One build, reused for every block.

---

## Block 1 — R1: B28 regression (the phase's most valuable asset)

**Criterion.** Under `prefers-reduced-motion: reduce`, at rest, with no
scrolling, the number of text-bearing elements hidden must be **0** on `/` and
on at least three inner routes, at **both** 1280 and 375.

Measured **twice, with two independent instruments**, because the packet
requires an independent re-measurement and not a re-run of the Coder's tool.

### Instrument 1 — the project's own probe

```text
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=rest
```

| viewport | route | elements | hidden | **hiddenText** |
|---|---|---|---|---|
| 1280 | `/` | 829 | 0 | **0** |
| 1280 | `/hizmetler/cnc-frezeleme` | 711 | 14 | **0** |
| 1280 | `/iletisim` | 271 | 0 | **0** |
| 1280 | `/malzemeler/aluminyum` | 497 | 0 | **0** |
| 1280 | `/hakkimizda` | 171 | 0 | **0** |
| 375 | `/` | 787 | 0 | **0** |
| 375 | `/hizmetler/cnc-frezeleme` | 697 | 14 | **0** |
| 375 | `/iletisim` | 258 | 0 | **0** |
| 375 | `/malzemeler/aluminyum` | 484 | 0 | **0** |
| 375 | `/hakkimizda` | 158 | 0 | **0** |

Exit 0, `PASS — no route hides text-bearing content at rest under reduced
motion.` The 14 `hidden` on the service route are all the same decorative
node printed in full by the probe's `silent` list — `<div class="absolute
inset-0 bg-gradient-to-r from-primary/5 …">` — carrying no text. They are
gradient overlays, not content.

The `rest` probe itself is **byte-identical to the version 05a QA validated**:
`git diff a2b4c20 HEAD -- scripts/motion-audit.mjs` touches only `runFrames`,
`runCursor` and `runGuard`. The gate was not moved under the measurement.

### Instrument 2 — QA-owned independent probe

`reports/qa/tools/p05b-r1-independent-rest.mjs`, written from the criterion
rather than from the Coder's code. It agrees on the population (only elements
with a layout box — a `display:none` subtree such as the closed fullscreen menu
is not "hidden by a reveal", and counting it produces ~52 false positives per
route; my first draft did exactly that and was wrong) but it **checks two
mechanisms the project probe does not**:

- `visibility: hidden` — `motion-audit`'s `effective()` returns `-1` for it and
  the caller then does `if (value !== 0) continue`, so a reveal expressed with
  `visibility` would be skipped;
- `clip-path: inset(… 100% …)` — not examined at all by the project probe,
  although the 05b motion layer parks `.tl-sector-card` at
  `clip-path: inset(0 -8px 100% -8px)` (fully clipped) in a resting
  declaration. It is under `[data-motion="ready"]`, which does not match on the
  reduced-motion path, but that is a fact to be measured rather than assumed.

```text
QA_VP=1280 node reports/qa/tools/p05b-r1-independent-rest.mjs
QA_VP=375  node reports/qa/tools/p05b-r1-independent-rest.mjs
```

All ten route/viewport pairs: `hiddenText=0 (opacity=0 visibility=0 clip=0)`,
`scrollY=0` on every one. Exit 0 both runs.

**R1 — PASS. B28_REGRESSION: NONE.** Zero by two instruments, the second of
which is strictly stricter than the first.

### Environment note (not a defect)

The independent probe was killed mid-run three times with
`Target page, context or browser has been closed`, at a different page each
time (after 3, after 7, and immediately). Host free memory measured 1225 MB of
8043 MB, with the user's own Edge resident. Restarting the browser per viewport
made every slice complete. This is the instability the packet describes; it is
recorded here so it is not mistaken later for a finding.

---

## Block 2 — R3: I4, both halves

### Half 1 — the motion defect IS fixed, and the fix is material

The Coder corrected QA's earlier 05a diagnosis. Verified: **every** `whileInView`
on `src/pages/ServiceDetail.tsx` carries `once: true` — lines 274, 294, 326,
357, 393, 430, 477, 515, 573 — and `git diff a2b4c20 HEAD -- src/pages/ServiceDetail.tsx`
adds **none** of them, so they were already there on base. The 05a attribution
to "`whileInView` without `once: true`" was wrong; the Coder's re-attribution to
the scroll-linked `heroOpacity` is right.

`reports/qa/tools/p05b-r3-i4-geometry.mjs`, h1 effective opacity (multiplied
down the ancestor chain) sampled every 50px:

| viewport | scrollY 0 → 600 | after round trip to 2400 and back |
|---|---|---|
| 1280 | `1 1 1 1 1 1 1 1 1 1 1 1 1` | `1` |
| 375 | `0 0 0 0 0 0 0 0 0 0 0 0 0` | `0` |

Monotonic non-decreasing at both widths. The fix is not vacuous: the removed
binding was `useTransform(heroScrollProgress, [0, 0.6], [1, 0])` with
`target: heroRef`, `offset: ["start start", "end start"]` (lines 125–128;
`ref={heroRef}` is on the hero `<section>` at line 193). Measured at 1280 the
hero occupies document y 128…568, so progress reaches 0.6 at scrollY ≈ 392 —
base rendered the page title at **opacity 0 from scrollY 392 onward**, where
HEAD reads 1 at 400/450/500/550/600. Real, and on the desktop path.

### Half 2 — the layout defect is REAL, STILL PRESENT, and PRE-EXISTING

Measured at rest (`scrollY = 0`), motion enabled:

| | 375 | 1280 |
|---|---|---|
| hero box | top 96, bottom 416, **h 320** | top 128, bottom 568, **h 440** |
| hero `overflow` | `hidden` | `hidden` |
| `absolute bottom-0` block | top **−8**, bottom 416, **h 424** | top 339, bottom 568, **h 229** |
| `<h1>` "CNC Frezeleme" | top **56**, bottom **92** | top 403, bottom 451 |
| `h1ClippedByHero` | **true** | false |
| h1 effective opacity | **0** | 1 |

The Coder's description reproduces exactly: at 375 the block is 424px inside a
320px hero, so it starts 8px above the hero's own top and its first 104px —
containing the eyebrow and the entire `<h1>` at y 32…92 — sit above
`hero.top = 96` and are cut off by `overflow: hidden`.
`h1.bottom (92) <= hero.top (96)` is measured, not inferred.

**Pre-existing — three independent confirmations, no build of base required.**

1. `--mode=enabled` on HEAD returns, for 375 `/hizmetler/cnc-frezeleme`:
   `elements=718 armed=544 armedText=195 afterScroll=22 afterScrollText=2`,
   naming the two elements as the eyebrow "Talaşlı İmalat" and the `<h1>` "CNC
   Frezeleme". **05a QA recorded the identical line on base `a2b4c20`**
   (`reports/qa/phase-05a.md:204`, `:247`) — 718 / 544 / 195 / 22 / **2**, same
   two nodes. Every figure matches.
2. `runEnabled` takes its `afterScroll` census **back at scrollY 0**
   (`scripts/motion-audit.mjs:276` — `window.scrollTo(0, 0)` then measure). At
   scrollY 0 the removed `heroOpacity` evaluated to exactly **1**, so it cannot
   have contributed to base's `afterScrollText=2`. Those 2 were the clip, then
   and now.
3. `opacity` is not a layout property, and the diff on this route changes
   nothing else (`motion.div` → `div` renders the same box). Base and HEAD have
   identical at-rest geometry by construction.

### The refusal to force the reveal was correct

The Coder declined to make the reveal fire. Assessed and **agreed**. Firing it
would set `opacity: 1` on the `<h1>`, taking `afterScrollText` from 2 to 0 — a
green metric — while `h1ClippedByHero` stays `true` and the reader still sees no
page title, because the box is outside the hero's paint area. The number would
move; the defect would not. Refusing it was the right call. The remaining work
is a hero that fits its content at 375, a layout change outside this packet's
allowlist.

**R3 — PASS. I4_REMAINING_DEFECT: CONFIRMED_PRE_EXISTING.** Carried to Phase 07.

---

## Block 3 — R2: is the choreography real and differentiated?

Tool: `reports/qa/tools/p05b-r2-grammar.mjs`. Rather than reading the
stylesheet, it reads back from the live page, per band, the **set of properties
that band's entrance actually moves** (transition properties with a non-zero
duration, plus animation names, including `::before` / `::after`). Bands sharing
one reveal with different durations would collapse to a single signature.

### Bands genuinely differ — 11 distinct signatures across 13 bands at 1280

| band | what its entrance moves |
|---|---|
| `tl-hero` | `@tl-draw-measure` + `@tl-label-lock-down` + `@tl-label-lock-up` + `@tl-part-expose` + `stroke` |
| `tl-proof` | `opacity` **only** — `transform: none`, duration `0.35s` |
| `tl-marquee` | `@tl-marquee` |
| `tl-process` | `opacity` + `transform` + `border-right-color` |
| `tl-nexus` | `clip-path` + **`filter`** + `transform` + `opacity` |
| `tl-projects` | `clip-path` + `transform` + `opacity` |
| `tl-sectors` | `clip-path` + `transform`, **no `opacity`** |
| `tl-quality` | `transform` (curtain `::after`) |
| `tl-references` | `background` + `color` only |
| `tl-faq-band` | `opacity` + `transform` |
| `tl-rfq` | `opacity` + `transform` + `border-color` |
| `tl-footer` | `opacity` + `transform` + `border-color` |

The "eight bands share `opacity` + `translateY`" starting state is genuinely
gone. `filter` (G3 CALIBRATE blur→sharp) appears on exactly one band;
`clip-path` on three, and with different geometry each time; `stroke-dashoffset`
draw animations on the hero only. **PASS.**

### Quietened bands — all four confirmed

- **03 proof** — `transitionProperty: opacity`, `transitionDuration: 0.35s`,
  `transform: none`. Vertical travel removed and the duration is the claimed
  `.62s → .35s`. ✔
- **04 marquee** — see R8 below; parked off screen. ✔
- **11 references** — items carry `color` only; the grid carries `opacity` at
  375 and **`none` at 1280**. Quieter than the "single block transition"
  described in `docs/lean/07-motion-system.md` (on desktop it is *no*
  transition), which is a documentation nit, not a defect: the content is
  visible either way. ✔
- **12 FAQ** — `.tl-faq-title` transitions `opacity, transform`; details carry
  `opacity` only. Path removed as claimed. ✔

### Mobile is structurally different, not slower — 8 signatures vs 11

At 375: `rfqGateClip = none`, `manifestoRuleBefore/After = none`,
`refGridTransition = opacity` (the container carries what the children no
longer do). No `clip-path` curtain exists anywhere below 768. This is the
structural claim, confirmed. See R7 for the counts.

### Climax 1 (02 hero) — entrance PASSES, the interaction FAILS

Entrance is real: `.tl-dimension-lines → @tl-draw-measure`,
`.tl-measure-top → @tl-label-lock-down`, `.tl-measure-finish →
@tl-label-lock-up`, `.tl-part-stage img → @tl-part-expose`. DRAW → LOCK exists.

The **measurement correlation** does not do what it is documented to do.
`reports/qa/tools/p05b-r2-hero-correlation.mjs` at 1440, after the entrance has
finished, reading computed style in three states:

| element | no hover | hover `Ø 28.000` | hover `Ra 0.4 µm` |
|---|---|---|---|
| `.tl-measure-top` opacity | 1 | **1** | **1** |
| `.tl-measure-finish` opacity | 1 | **1** | **1** |
| `.tl-fcf-top` / `.tl-fcf-bottom` / `.tl-datum` / `.tl-measure-left` opacity | 1 | **1** | **1** |
| `.tl-dim--bore` opacity / stroke | 1 / `rgba(226,230,225,.34)` | **0.34** / `rgb(238,233,222)` | 0.34 / base |
| `.tl-dim--finish` opacity / stroke | 1 / base | 0.34 / base | **0.34** / `rgb(238,233,222)` |
| `.tl-pp-bore` opacity | 1 | **0.34** | 0.34 |
| `.tl-pp-holes` / `.tl-pp-dim` opacity | 1 | 0.34 | 0.34 |
| hovered box `border-top-color` | `rgba(226,230,225,.42)` | `rgb(238,233,222)` | `rgb(238,233,222)` |

Both `:has()` selectors were confirmed to be matching at the time of reading
(`heroHasDataDim: true`, `heroHasThis: true`), so this is not a failed hover.

`src/styles/technical-landing.css:~977` claims three simultaneous effects, and
`docs/lean/07-motion-system.md` repeats one of them as fact
("bir ölçünün üzerine gelmek o ölçünün kılavuz çizgisini ve **pasaporttaki
karşılığını** birlikte aydınlatır, kalanı geri çeker"). Measured:

1. "kutunun kendisi öne çıkar" — **partly**. Only `border-color` responds. The
   `opacity: 1` half is inert.
2. "kılavuz çizgisi parlar" — **yes** by `stroke`, but its `opacity` is
   simultaneously pulled to `0.34` along with every other line.
3. "KARŞILIK GELEN öge aydınlanır" — **NO. It is dimmed to 0.34**, the same as
   the elements that are supposed to be receding. The claim is inverted.
4. "Geri kalan ölçümler geri çekilir" — **not for the six measurement boxes**,
   which never move off `opacity: 1` in any state.

Screenshots for the record: `reports/qa/tools/shots/p05b-hero-nohover.png` and
`…/p05b-hero-hover-tlmeasuretop.png`. The orthographic passport at bottom right
is visibly *fainter* on hover, not brighter.

#### Root causes — two, both in `src/styles/technical-landing.css`

**(a) Fill-forwards animations outrank the hover declarations.** The six labels
carry `animation: tl-label-lock-down|up .5s … both` (lines 405–407), whose `to`
keyframe is `opacity: 1`. `animation-fill-mode: both` keeps that applied
forever, and CSS animation values win over normal declarations. Measured:
`animationFillMode: both` on all six, `opacity: 1` in all three states. So both
the `opacity: .34` recede rule and the `opacity: 1` highlight rule are dead on
`.tl-measure`, `.tl-fcf` and `.tl-datum`.

**(b) The dim rule out-specifies the highlight rule.** Line 1004 is
`.tl-hero:has([data-dim]:hover) :is(.tl-dim-line path, .tl-measure, …, .tl-pp-dim){opacity:.34}`;
lines 1006–1011 are `.tl-hero:has(.tl-measure-top:hover) :is(.tl-measure-top,.tl-dim--bore,.tl-pp-bore){opacity:1}`.
A `:is()` takes the specificity of its **most specific argument**, so the first
`:is()` counts as `.tl-dim-line path` = (0,1,1) while the second counts as
(0,1,0) — (0,4,1) beats (0,4,0).

This is confirmed **empirically, not just from the spec**: the dim rule appears
*earlier* in the file than the highlight rule, so on equal specificity the
highlight would win by source order. It does not win — measured
`.tl-dim--finish` = `0.34` while hovering `.tl-measure-finish`, which is one of
that rule's own targets. Higher specificity on the dim rule is therefore proven
by observation.

**R2 — FAIL on climax 1's interaction.** The six grammars, the quietened bands,
the mobile structure, climax 2 and climax 3 all verify. The hero correlation —
described in the CSS and asserted as fact in `docs/lean/07-motion-system.md` —
does the opposite of what is written for the passport correspondence, and
nothing at all for the labels.

---

## Block 4 — R4: I1, I2, I3

### I3 — the `cursor: none` swap. PASS, with a real negative control.

```text
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=cursor
```

| reducedMotion | guard | body | link | button | replacementNodes |
|---|---|---|---|---|---|
| no-preference | replacement present | `none` | `none` | `none` | 2 |
| no-preference | **replacement REMOVED** | `auto` | `pointer` | `pointer` | 0 |
| reduce | replacement present | `none` | `none` | `none` | 2 |
| reduce | **replacement REMOVED** | `auto` | `pointer` | `pointer` | 0 |

The negative control is the part that proves anything, and it behaves
correctly: deleting `[data-custom-cursor]` hands the native pointer straight
back. Under the old unconditional rule it would have stayed `none`. `Z.cursor`
90 → 101 confirmed at `src/styles/z-index.ts:25`, above `pageTransition` (95)
and `preloader` (100).

*Hygiene note (not this packet's file):* `src/components/ui/CustomCursor.tsx:78`
still says "`Z.cursor` is 90, which sits BELOW `Z.pageTransition`…". That
comment is now stale. The file is outside the allowlist, so the Coder could not
have fixed it; recorded so it is not lost.

### I2 — `restingOpacity`. PASS on both halves.

Verified against a DEV server (`vite --port 5311`), because
`import.meta.env.DEV` strips the warning from the production build.
`/giris` renders `FloatingPaths`, whose `opacity: [0.3, 0.6, 0.3]` is the only
live call site where max ≠ last.

```text
node reports/qa/tools/p05b-r4-i2-warning.mjs
```

- **The warning fires**, once, de-duplicated by signature:
  `warning: [shell/motion] opacity keyframes [0.3,0.6,0.3] rest at 0.6, not at
  their last frame 0.3. …` — 1 distinct, 1 occurrence.
- **Semantics did not shift**: 72 non-animating paths, and their distinct
  resting opacities are exactly `[0.6]` — the **maximum**, not the last frame
  `0.3`. Identical to the pre-change behaviour.

### I1 — chroma tripwire and the new guard rule. PASS, with the caveat confirmed.

Source: the tripwire is now behind `{!prefersReduced && (…)}`
(`src/components/ProjectShowcase.tsx:184`). The Coder's own caveat is accurate —
`grep -rn "ProjectShowcase" src/` returns exactly one hit outside the file
itself, and it is a **comment** in `src/components/shell/motion.tsx:95`. The
component is imported by no route, so this fix has no live surface. Carried
forward for dead-code hygiene.

**Guard, negative-controlled by QA** (`--mode=guard` reads `src/` relative to
cwd, so three synthetic files in a scratch directory exercise it without
touching production):

| control | shape | result |
|---|---|---|
| A | `onViewportEnter`, no `usePrefersReducedMotion` anywhere | **FAIL** — "uses a viewport callback the primitive cannot settle…" ✔ |
| B | `import { motion } from "framer-motion"` | **FAIL** — pre-existing rule ✔ |
| C | `onViewportEnter` **with** the hook called (the fixed shape) | **PASS** ✔ |

The rule fires on the defect, passes the fix, and is therefore discriminating,
not merely noisy. On the real tree: `PASS — every motion call site goes through
@/components/shell/motion`, exit 0.

*Hardening note.* The check is `!/usePrefersReducedMotion/.test(source)` — a raw
substring test over the whole file, comments included. My first draft of control
A was **not** caught, purely because its comment contained the word
`usePrefersReducedMotion`. Merely importing the hook and never calling it would
also satisfy it. This is a weakening path rather than a bypass of a live defect,
and the Coder labels the rule a heuristic explicitly; recommend tightening to a
call-shaped match (`usePrefersReducedMotion\s*\(`) outside comments. Not a
phase failure.

---

## Block 5 — R7 density, R6 CLS, R5 frame pacing

### R7 — mobile density. PASS, and it is structural.

```text
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=density
```

| | elements | transitioned | animated | delayed | transformed |
|---|---|---|---|---|---|
| 1280 | 799 | **132** | **9** | 9 | **23** |
| 375 | 764 | **58** | **5** | 4 | **15** |

All three claimed figures reproduce exactly (132/58, 9/5, 23/15 — a 2.28× gap).
The mechanism is confirmed structural, not cosmetic, by the independent
grammar probe in Block 3: below 768 **no `clip-path` curtain exists at all**
(`rfqGateClip = none`, `manifestoRuleBefore/After = none`, `.tl-cert::after` and
`.tl-nexus-app::after` absent), and `refGridTransition` moves from `none` at
1280 to `opacity` at 375 — the animated unit changing from child to container,
exactly as claimed. Distinct band signatures drop 11 → 8.

### R6 — CLS. Criterion PASS; the reported FIGURES do not reproduce.

Three consecutive `--mode=cls` runs on my build of `1ee1361`:

| run | 1280 | 375 |
|---|---|---|
| 1 | 0.02013 | 0.01256 |
| 2 | 0.02018 | 0.01179 |
| 3 | 0.02088 | 0.01209 |

Spread ±0.0004 at 1280 — this measurement is **stable, not noisy**, so the
gap cannot be waved away as host variance the way the frame counts can. The
Coder reports **0.0115** at 1280 and **0.00432** at 375. My 1280 figure is not
merely different, it is higher than the value the Coder gives for the
*pre-change* state (0.01708). **I could not reproduce either number.** I make no
claim of fabrication — a different cache/font state at measurement time would
explain it — but the figures as written are not reproducible here and should
not be carried forward as fact.

**The acceptance criterion itself passes, and by a stronger test than the one
used.** `reports/qa/tools/p05b-r6-cls-causation.mjs` runs the identical scripted
scroll twice on the same build, once with the motion layer live and once under
`prefers-reduced-motion: reduce` where the layer is entirely off:

| | CLS | entries **after 2000ms** (the window in which entrances run) | manifesto entries |
|---|---|---|---|
| 1280, motion on | 0.01952 | **0**, sum 0.00000 | **0** |
| 1280, reduced | 0.06446 | 0, sum 0.00000 | 0 |
| 375, motion on | 0.01268 | 3, sum **0.00105** | **0** |
| 375, reduced | 0.01070 | 0, sum 0.00000 | 0 |

Every material shift lands at 633–906 ms and names `div.tl-hero-copy`,
`div.tl-part-stage`, `aside.tl-part-passport`, the header `div.flex`,
`a.tl-quote-button`, `button.tl-menu-trigger` — load-time font/image reflow,
present with motion off as well, and at 1280 *larger* with motion off
(0.06446 > 0.01952). The motion layer contributes 0.00000 at 1280 and 0.00105
at 375. So "no major animation causes layout shift" is satisfied.

**The manifesto `letter-spacing` close specifically: 0 layout-shift entries in
all four runs.** The Coder's argument — safe because `strong` is the only box on
its line — holds under measurement. The exception is documented as
non-extensible in both the CSS and `docs/lean/07-motion-system.md`, which is the
right way to leave it.

All values are far inside the 0.1 budget.

### R5 — frame pacing, and the honesty around it. PASS.

```text
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=frames
```

| viewport | pass | frames | median | p95 | over32ms | over50ms | longest run | attribution |
|---|---|---|---|---|---|---|---|---|
| 1280 | 1 (entrance) | 499 | 16.7 | 17.1 | **14** | 6 | 5 | `tl-process:6 tl-projects:2 tl-hero:1 tl-proof:1 tl-nexus:1 tl-sectors:1 tl-quality:1 tl-faq-band:1` |
| 1280 | 2 | 538 | 16.7 | 17.1 | **0** | 0 | 0 | – |
| 1280 | 3 | 538 | 16.7 | 17.1 | **0** | 0 | 0 | – |
| 375 | 1 (entrance) | 537 | 16.7 | 17.1 | **2** | 0 | 1 | `tl-process:1 tl-sectors:1` |
| 375 | 2–3 | 538 | 16.7 | 17.2 | **0** | 0 | 0 | – |

The claimed shape reproduces: pass 1 costs something (14 slow frames of 499
here, 12 of 489 as reported — inside the declared ±18 band), passes 2–3 cost
nothing, and `median = 16.7` is invariant across every pass at both widths,
exactly as the docblock says it has been for every version measured. Slow frames
are confined to the entrance; the steady-state scroll is clean, so nothing is
doing permanent work.

**The instrument does report its own limits.** It labels pass 1 as entrance and
separates it from steady state; the summary row prints
`settledOver32ms=0..0` as a range rather than a point, and carries
`note=compare pass-1 to pass-1 only; host noise on this machine is +-18`; and it
attributes each slow frame to a band, which is what turns "the path janks" into
"go and look at `tl-process`".

**No surviving comment or doc claims a frame win the data cannot support.** A
scan of the changed production files for quantified frame/ms claims returns
none. The two places that could have made one instead say the opposite —
`src/styles/technical-landing.css:762–767` records the 16/19/34/34 spread and
states outright that writing "this saved N frames" here *would be fabrication*,
and that the decision was taken on principle (repaint is dearer than composite);
`:872` repeats the same reasoning for the manifesto curtain. `docs/lean/07-motion-system.md`
tells the reader how to read the three passes and repeats the noise band. This
is the correct handling of a measurement the host cannot resolve.

---

## Block 6 — R8 offscreen work and focus rings, R9 suites and gates, R10 axe

### R8 — PASS on both halves.

**Nothing animates off screen.** `reports/qa/tools/p05b-r2-grammar.mjs`, at both
widths:

| | `.tl-marquee-track` `animation-play-state` | classes on `.tl-marquee` |
|---|---|---|
| scrolled into view, 1280 | **running** | `tl-band tl-marquee tl-inview tl-onscreen` |
| scrolled to page bottom, 1280 | **paused** | `tl-band tl-marquee tl-inview` |
| scrolled into view, 375 | **running** | `… tl-onscreen tl-inview` |
| scrolled to page bottom, 375 | **paused** | `tl-band tl-marquee tl-inview` |

The two-way `.tl-onscreen` is removed on exit while the one-way `.tl-inview`
correctly stays. The infinite `tl-marquee` therefore stops compositing when it
cannot be seen, and no entrance can re-arm on scroll-back.

**Focus rings survive every clip.** `reports/qa/tools/p05b-r8-focus-clip.mjs`
drives every band through its entrance first, then reads the *resting* clip —
the state a keyboard user actually focuses in:

| element | resting clip | focusables inside |
|---|---|---|
| `A.tl-sector-card` | **`inset(-8px)`** | 1 |
| `BUTTON.tl-cad-drop` | **`inset(-8px)`** | 1 |
| `SPAN.` (status cell), `TD.` | `inset(0px)` | **0** |
| `.tl-measure-*` / `.tl-fcf-*` / `.tl-datum` | `inset(0/0%…)` | **0** |
| `INPUT.tl-visually-hidden` | `inset(50%)` | 1 — the standard visually-hidden idiom, pre-existing, not motion |

`clips that would slice a focus ring: 0`. The `inset(0)` endings are confirmed
*empirically* to wrap nothing focusable, rather than merely asserted in a
comment.

And the `-8px` is correctly *sized*, not just negative — focusing each element
for real:

```text
.tl-sector-card  {"clip":"inset(-8px)","outlineWidth":"2px","outlineOffset":"4px","outlineStyle":"solid","focused":true}
.tl-cad-drop     {"clip":"inset(-8px)","outlineWidth":"2px","outlineOffset":"4px","outlineStyle":"solid","focused":true}
```

The ring extends 4 + 2 = 6px beyond the border box; the clip extends 8px. 2px of
margin. ✔

### R9 — suites and gates. All green.

Run against the already-serving preview via `PLAYWRIGHT_BASE_URL=http://localhost:4211`
(so no second server and no rebuild), `PLAYWRIGHT_ARTIFACTS=0`.

| gate | result |
|---|---|
| `npm run typecheck` (3 projects) | **exit 0** |
| `node scripts/grid-axis-probe.mjs` | **PASS** — every measured edge on a master axis, 1px tolerance |
| `node scripts/motion-audit.mjs --mode=guard` | **PASS**, exit 0 |
| `test:e2e:critical` (critical-1280 + critical-375) | **157 passed, 3 skipped, 0 failed** (8.8m) |
| `test:e2e:smoke` (webkit ×2, firefox ×2) | **12 passed, 0 failed** (1.5m) |
| `test:e2e:visual` (375 / 1280 / 1440) | **27 passed, 0 failed** (2.1m) |

**No flakes.** Every suite passed on its first attempt; the instability the
packet warned about appeared only in my own single-browser probe scripts (see
Block 1), never in a Playwright run.

157 = 05a's 147 + **exactly the 10 new grammar tests** (5 × 2 projects), and the
3 skips are the same 3 that 05a recorded — so none of the new tests' internal
`test.skip(…)` guards fired and silently removed coverage. All Phase 01–04
guarantees re-confirmed in the run: 14 bands numbered in order, anchors, no
document-level horizontal overflow, shell cascade contract across chunks, the
full menu teardown matrix **including the reduced-motion close path**,
`scrollable-region-focusable` reachability, route transition / back-forward /
B25 modal lock, the 404 shell state, and "reduced motion keeps the complete page
visible without active animation".

**Goldens: none changed, and the argument for that is sound — verified
structurally, not just by the tests passing.** `git diff --stat a2b4c20 HEAD --
e2e/__golden__` is empty. The Coder argues a golden change would have signalled
leakage into resting styles. Assessing it: the visual projects run with
`reducedMotion: "reduce"`, under which `useTechnicalLandingMotion` writes
`data-motion="reduced"` (never `"ready"`) and marks every band arrived, so every
`[data-motion="ready"]` selector fails to match and the curtain pseudo-elements
are never even generated. Independently, `git diff -U0` shows the **first**
changed line in `technical-landing.css` is old line 387, which is the
`/* Motion never changes geometry. */` marker — the entire layout, grid and
typography layer above it is byte-identical. So a golden move was structurally
impossible, and 27 passing baselines confirm it. The argument is correct.

### R10 — axe. Unchanged in both directions. PASS.

```text
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=axe
```

| route | `reduce` | `no-preference` |
|---|---|---|
| `/` | **0** | **0** |
| `/hizmetler/cnc-frezeleme` | 28 — `color-contrast:28` | **0** |
| `/iletisim` | 4 — `color-contrast:1 label:1 select-name:2` | **4 — identical** |
| `/malzemeler/aluminyum` | 0 | 0 |
| `/hakkimizda` | 0 | 0 |

Matches the claim and 05a's recorded figures exactly. The service route's 28 are
newly *visible* pre-existing contrast debt, not new defects — they appear only
under `reduce`, where content that is still armed under `no-preference` becomes
measurable (B24, Phase 07). `/iletisim`'s 4 are identical in **both** modes and
therefore provably not motion-related (I5, Phase 13). Neither fixed nor
worsened by this packet.

---

## Acceptance criteria matrix

| Criterion (IMPLEMENTATION.md §PHASE 05) | Result | Evidence |
|---|---|---|
| Motion has documented semantic roles | **PASS** | 6 grammars in `docs/lean/07-motion-system.md` + CSS; 11 distinct band signatures at 1280 measured live (Block 3) |
| 2–3 memorable moments, not every section competing | **PARTIAL → FAIL** | Climax 2 (manifesto) and 3 (RFQ gate) verified; climax 1's entrance verified but its **interaction is inverted** (Block 3) |
| No major animation causes layout shift | **PASS** | 0 shift entries after 2000ms at 1280, 0.00105 at 375; 0 manifesto entries in 4 runs (Block 5) |
| Reduced-motion path passes | **PASS** | `--mode=rest` hiddenText 0/10; independent probe 0/10 incl. `visibility` and `clip-path` (Block 1) |
| Mobile does not inherit desktop-heavy motion | **PASS** | 132→58 transitioned, 9→5 animated, 23→15 transformed; no `clip-path` curtain exists below 768 (Blocks 3, 5) |
| Frame pacing shows no repeated jank in core scroll | **PASS** | entrance 14/499 slow at 1280, steady state 0 and 0; median 16.7 invariant (Block 5) |
| Landing reads clearly with motion disabled | **PASS** | 27 golden baselines unchanged and passing; `--mode=rest` clean (Blocks 1, 6) |
| B28 must not regress | **PASS** | Two independent instruments, 0/10 (Block 1) |
| Cursor/scroll-progress audited, `cursor:none` safe | **PASS** | `--mode=cursor` negative control returns the native pointer (Block 4) |
| Nothing animates off screen | **PASS** | marquee `running` → `paused` at both widths (Block 6) |
| Geometry-safe motion, focus rings intact | **PASS** | 0 clips slice a ring; `-8px` clip vs 6px ring (Block 6) |

## Failed checks

| Check | Observation | Root cause | Production fix required? |
|---|---|---|---|
| R2 — climax 1 hero measurement correlation | Hovering a measure **dims** its passport counterpart to `0.34` instead of lighting it; the six measurement boxes never recede or advance in `opacity` at all. The behaviour is the inverse of what `src/styles/technical-landing.css:~977` and `docs/lean/07-motion-system.md` both state as fact. | (a) `.tl-measure`/`.tl-fcf`/`.tl-datum` carry `animation: tl-label-lock-* … both` (CSS lines 405–407) whose `to` frame is `opacity: 1`; a fill-forwards animation outranks normal declarations, so both hover rules are dead on them. (b) The dim rule (line 1004) out-specifies the highlight rule (lines 1006–1011) because `:is()` takes its **most specific** argument — `.tl-dim-line path` (0,1,1) vs `.tl-measure-top` (0,1,0). Proven empirically: the dim rule wins despite appearing **earlier** in the file, so source order cannot explain it. | **Yes.** Either raise the highlight rules' specificity above the dim rule (e.g. give the dim `:is()` no element-containing argument, or add a matching qualifier to the highlight rules), and drive the labels' isolation with a property the fill-forwards animation does not own — or, if the correlation is not worth repairing now, delete the claim from the CSS comment and from `docs/lean/07-motion-system.md`, since a documented interaction that does the opposite is worse than none. |
| R6 — reported CLS figures | Claimed 1280 **0.0115** and 375 **0.00432**; measured **0.0201 / 0.0202 / 0.0209** and **0.0126 / 0.0118 / 0.0121** over three runs. The 1280 figure is above even the claimed *pre-change* value (0.01708), and the spread is ±0.0004, so host noise does not explain it. | Not established. A different cache/font state at measurement time would account for it; I make **no** claim of fabrication. | **No code fix.** The acceptance criterion passes by a stronger causal test (Block 5). The written figures should be corrected or dropped rather than carried forward as fact. |

## Carry-forwards (not failures)

- **B24** — 28 `color-contrast` nodes on the service route under `reduce`. Phases 07/13.
- **I5** — `/iletisim` 4 axe nodes, identical in both motion modes, so not motion-related. Phase 13.
- **I4 remaining layout clip** — 375 service hero, `CONFIRMED_PRE_EXISTING`. Phase 07.
- **`ProjectShowcase.tsx` is imported by no route** — the only surviving reference is a comment in `src/components/shell/motion.tsx:95`. Its I1 fix has no live surface. Dead-code hygiene.
- **`CustomCursor.tsx:78`** — comment still says "`Z.cursor` is 90", stale after the 90 → 101 change. File outside the allowlist.
- **Guard hardening** — `!/usePrefersReducedMotion/` is a raw substring test over the whole file; a mention in a comment satisfies it (this defeated my own first negative control). Suggest a call-shaped match.
- **11 references band** — `docs/lean/07-motion-system.md` describes "six delays reduced to a single block transition"; at ≥768 the container transition is switched off entirely, so on desktop there is *no* transition. Documentation nit only.
- **win32-only golden gap**; **content wording** (Phase 06).

## Commands run

```text
npm run build                                            # once; dist/ reused for every block
npx vite preview --port 4211 --strictPort                # 4173/4199/5199 held by other agents
npm run typecheck
node scripts/motion-audit.mjs --mode=rest      | --mode=enabled | --mode=density
node scripts/motion-audit.mjs --mode=cls  (x3) | --mode=frames  | --mode=cursor | --mode=axe
node scripts/motion-audit.mjs --mode=guard                       # real tree, and in a scratch
                                                                 # dir holding 3 synthetic controls
node scripts/grid-axis-probe.mjs
npx playwright test --project=critical-1280 --project=critical-375
npx playwright test --project=smoke-webkit-1440 --project=smoke-webkit-390 \
                    --project=smoke-firefox-1440 --project=smoke-firefox-390
npx playwright test --project=visual-375 --project=visual-1280 --project=visual-1440
node reports/qa/tools/p05b-r1-independent-rest.mjs        # QA_VP=1280 and QA_VP=375
node reports/qa/tools/p05b-r3-i4-geometry.mjs             # QA_VP=1280 and QA_VP=375
node reports/qa/tools/p05b-r2-grammar.mjs                 # QA_VP=1280 and QA_VP=375
node reports/qa/tools/p05b-r2-hero-correlation.mjs
node reports/qa/tools/p05b-r4-i2-warning.mjs              # against `vite --port 5311` (DEV)
node reports/qa/tools/p05b-r6-cls-causation.mjs           # QA_VP=1280 and QA_VP=375
node reports/qa/tools/p05b-r8-focus-clip.mjs
```

## Scope integrity — PASS

- Production files modified by QA: **NONE**.
- Files changed by the packet: 11, matching the packet's list; `git diff --stat a2b4c20 HEAD` shows nothing outside it.
- `e2e/__golden__` — **no golden added, changed or deleted**, and structurally could not have moved (Block 6).
- QA wrote only: `reports/qa/phase-05b.md`, `reports/qa/tools/p05b-*.mjs`, `reports/qa/tools/shots/p05b-*.png`. All inside `QA_WRITE_ALLOWLIST`.
- The guard negative control ran in a scratch directory outside the repo; no synthetic file ever entered `src/`.

## Verdict

**STATUS: FAIL** — on one specific, reproducible item: **climax 1's measurement
correlation does the opposite of what the CSS and the lean doc both state**, for
the passport correspondence, and does nothing at all for the six labels. Under
the packet's rule ("fail only if … a grammar/climax claim is not real"), that is
a failing condition. The fix is small and local, and the report above gives both
root causes with line numbers.

Everything else in the packet holds. **B28 has not regressed** — the phase's
most valuable asset is intact, confirmed by two instruments, the second stricter
than the first. **The I4 reasoning is sound**: the half that was fixed is
verified material, the half that was not is verified real and verified
pre-existing, and the refusal to force a green metric over clipped text was the
right call. The guard is discriminating under negative control, density and
frame pacing reproduce, no golden moved and no golden should have, and 196 tests
passed with zero failures across three suites on first run.

- **B28_REGRESSION: NONE**
- **I4_REMAINING_DEFECT: CONFIRMED_PRE_EXISTING**

---

# RE-VERIFICATION after correction packet #1

**Date:** 2026-09-02 · **Worktree:** `wt/qa-p05c` · **Integration HEAD:** `1e88593`
(`150c546` C1, `c358834` C3/C2, `1e88593` docs) · **Prior QA:** `5191530` (FAIL)

Everything above this line is the original FAIL report and stands unedited.
This section re-verifies only the items the correction packet touched, plus the
regression surface. All numbers below were produced on a fresh `npm run build`
of `1e88593` in this worktree, served by one `vite preview` on `:4211` and
reused by every probe and suite.

**STATUS: PASS.**

- `HOVER_CORRELATION: WORKS`
- `CLS_METHOD: SPLIT_AT_SCROLL_CORRECT`
- `GUARD_HOLE: CLOSED` (the reported one; a narrower, latent one is open — R4 below)

---

## Scope

`diff --name-status 5191530 1e88593` — 4 files, +293 / −20:

| file | |
|---|---|
| `src/styles/technical-landing.css` | the fix |
| `e2e/landing/motion-grammar.spec.ts` | one new test, +83 |
| `scripts/motion-audit.mjs` | CLS A/B + `codeOf` |
| `docs/lean/07-motion-system.md` | the CLS reading note |

No golden touched. Verified independently rather than taken on trust: the 45
committed PNGs under `e2e/` hashed identically before and after a full
`test:e2e:visual` run. No `!important` anywhere in the diff. The built CSS
carries the fix — `@keyframes tl-label-lock-down{0%{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0)}}`,
no `opacity` — and the only surviving `.tl-dim-line path` selector in the
shipped bundle is `{fill:none;stroke:…}`, which cannot collide.

---

## R1 — the correlation works. Measured, at 1440, all sixteen elements.

`reports/qa/tools/p05c-r1-correlation-matrix.mjs`. Every hover is gated on
`.tl-hero:has(SEL:hover)` matching *before* any opacity is read; all six
matched, so none of the numbers below are the "nothing dimmed" false positive.

At rest all sixteen read **1.00** (`.tl-dim--height` matches two paths; both).

Computed own-opacity, one row per hover:

| hovered | m-top | m-left | m-fin | fcf-top | fcf-bot | datum | bore | tol | height | perp | finish | datum-l | pp-body | pp-bore | pp-holes | pp-dim |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `.tl-measure-top` | **1.00** | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 |
| `.tl-fcf-top` | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 |
| `.tl-measure-left` | .34 | **1.00** | .34 | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | .34 | .34 | .34 | **1.00** |
| `.tl-fcf-bottom` | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 | **1.00** | .34 | .34 | .34 |
| `.tl-measure-finish` | .34 | .34 | **1.00** | .34 | .34 | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 | **1.00** | .34 | .34 | .34 |
| `.tl-datum` | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | .34 | .34 | **1.00** | .34 | .34 | .34 | **1.00** |

This is the Coder's table exactly, and it is stronger than the table asked for:
every one of the thirteen *uncorrelated* elements recedes on every hover, not
just the one or two named per row. After the pointer leaves, all sixteen return
to 1.00. The same behaviour is asserted in the suite at 1280 by
`motion-grammar.spec.ts:254`, which passes in `critical-1280`; at `critical-375`
it takes the coarse-pointer branch and asserts `.tl-dimension-lines` is hidden,
which is an assertion rather than a skip.

The latent bug the Coder found in its own work is fixed and I can see it:
`.tl-pp-body` now reads .34 under four of the six hovers. It could not before —
it was in the transition list and in two correlations but in neither dim list.

## R2 — both causes are dead, and the parity claim is real

Both controls are applied **in place on the live CSSOM at the rule's own
index**, so source order never moves and only the property under test changes.
An appended `<style>` would have won by order and proved nothing.

**Cause (a) — `opacity` in the keyframes.** Re-adding `0%{opacity:0…}` /
`100%{opacity:1…}` to `tl-label-lock-down` and `-up`: all six measurement boxes
immediately read 1.00 while hovering `.tl-measure-top`, i.e. frozen opaque in
every state, exactly as described — an animation's fill value under
`fill-mode: both` is applied in the animation origin and outranks every normal
declaration. Guide lines were unaffected in that control (`.tl-dim--bore` 1.00,
the other five .34), which locates the defect precisely.

**Cause (b) — `.tl-dim-line path` in the isolation list.** Replacing the
isolation rule at index 6 with the old list, leaving the correlation at index 7
untouched: every guide line goes to .34 **and so does the hovered box**, while
`.tl-pp-body` stays at 1.00 — the old list's missing member, visible as a
fingerprint. That composite symptom is what the original FAIL described.

**Parity.** Observing that the correlation wins today does not prove parity; it
is equally consistent with the correlation being more specific. The two
hypotheses differ in exactly one observable, so
`reports/qa/tools/p05c-r2-specificity-parity.mjs` reverses the two rules in
place:

```
shipped order  (isolation, then correlation): hovered=1    guide=1    passport=1    other=0.34
reversed order (correlation, then isolation): hovered=0.34 guide=0.34 passport=0.34 other=0.34
```

Reversing the order reverses the winner. Under "correlation is more specific"
that could not happen. **The two rules are equally specific and source order is
what decides** — the contract the stylesheet now documents is the contract the
browser is enforcing.

## R3 — the CLS methodology dispute. Adjudicated.

**`CLS_METHOD: SPLIT_AT_SCROLL_CORRECT`.** The split method is sound and is the
number the causal claim rests on. Two corrections to the framing, though, and
they run opposite ways.

**The premise of the dispute is not accurate.** My original A/B was not a
raw-total A/B. `reports/qa/tools/p05b-r6-cls-causation.mjs` already split each
run, at a fixed 2000 ms cutoff, and the table in the original report is headed
"entries **after 2000ms** (the window in which entrances run)". The
`0.00000 / 0.00105` figures came from that split column, not from a total. The
original report also already states, in the same paragraph, that the reduced
path shifts *more* at 1280 — "at 1280 *larger* with motion off (0.06446 >
0.01952)". So the entrance-shell inversion was in the previous report as a
finding, not missed by it.

**The correction is nevertheless the right one and an improvement.** A fixed
2000 ms cutoff is a guess that silently degrades if load runs long; a
`performance.now()` mark taken at the moment scrolling begins is the same idea
implemented so that it cannot drift. Moving the A/B into `--mode=cls` itself
matters more: the number is now reproducible by instrument instead of by a
QA-side script referenced in a note.

Three consecutive runs of the shipped `--mode=cls` against one build:

| | 1280 | 375 |
|---|---|---|
| `scrollCost` | **0 / 0 / 0** | **0 / 0 / 0** |
| `manifestoEntries` | 0 / 0 / 0 | 0 / 0 / 0 |
| raw `cls`, motion on | 0.01694 / 0.01652 / 0.01150 | 0.01452 / 0.01476 / 0.01452 |
| raw `cls`, reduced | 0.06275 / 0.06385 / 0.06448 | 0.01069 / 0.01070 / 0.01070 |

`scrollCost` 0 and `manifestoEntries` 0 in all six passes — the packet's claim
reproduces, and slightly better (I never saw the 375 `0.00106`). The
reduced-motion path really is the heavier one at 1280, by ~4x, and the largest
entries there are `div.relative` @974 ms and `div.shell-state` @327 ms — the
entrance-shell handover, before scrolling starts. Different timestamps from the
Coder's t≈185/541 ms, same elements, same phase of the page.

**One number here settles the older dispute.** Run 3 measured raw 1280 CLS at
**0.01150** — the exact figure the original report could not reproduce and
flagged as "stable, not noisy". Over three runs of a single unchanged build the
raw total moved 0.0115 → 0.0209. It is not stable; my earlier three-run spread
was luck. That retires the R6 finding in the original report: the discrepancy
belonged to the instrument, not to the build, and the docs are right to say the
raw total is not evidence.

`docs/lean/07-motion-system.md` §"CLS ölçümü nasıl okunur" states it plainly —
"Ham sayfa CLS'i bu iddianın kanıtı DEĞİLDİR ve öyle raporlanmamalıdır" — with
the split explained and the numbers tabled. Requirement met.

## R4 — the reported hole is closed. A narrower one is not, and it fails open.

`GUARD_HOLE: CLOSED` for the hole in the packet. Seven fixtures, run against
both the shipped guard and a pinned copy of the pre-fix script
(`reports/qa/tools/p05c-motion-audit-PREFIX.mjs`), from a scratch tree outside
the repo — no synthetic file ever entered `src/`:

| fixture | old guard | new guard | |
|---|---|---|---|
| A `onViewportEnter`, no mention | FAIL | **FAIL** | correct |
| B real `usePrefersReducedMotion()` call | pass | **pass** | correct |
| C1 mention only in `//`, `/* */`, `{/* */}` + a plain doc URL | **pass** | **FAIL** | the reported hole, closed |
| F commented-out `import { motion } from "framer-motion"` | **breach** | **pass** | old false breach, also fixed |
| E template nested in an interpolation + comment mention | pass | **FAIL** | correct |
| **C2** identifier inside a URL **string** | pass | **pass** | **fails open** |
| **D** regex literal `/['"]/g` then a comment mention | pass | **pass** | **fails open** |

**The direction-of-failure argument in the script's own comment is wrong for
this rule.** The comment says the blind spots "can only make it drop too
little, which surfaces as a LOUD false breach rather than a quiet false pass."
That holds for the import check, which is presence-based. It inverts for the
reduced-motion check, which is **absence**-based: `!/\busePrefersReducedMotion\s*\(/`.
Retaining more text makes the call pattern *easier* to find, so the breach is
silently not reported. Instrumenting `codeOf` on fixture D shows the mechanism —
in `/['"]/g` the `'` opens a string that closes on the `"`, then nothing
rebalances it, the scanner runs to EOF in string mode and the `//` comment on
the next line survives verbatim:

```
has viewport callback : true
looks like a CALL     : true      <- from the COMMENT
=> breach reported    : false
```

C2 needs no scanner bug at all: `codeOf` keeps string bodies by design (the
import check needs the specifier), so a URL that happens to contain
`usePrefersReducedMotion(` satisfies the rule.

**Severity: latent, not live.** `reports/qa/tools/p05c-r4-guard-reachability.mjs`
scans all 269 files under `src/`: zero string literals read as a call, and the
one file with surviving `//` after `codeOf` (`r3f/LiquidImage.tsx`) is GLSL
inside a template literal — correctly preserved string content, not a desync —
and carries no viewport callback. The only file whose *code* contains
`onViewportEnter` is `ProjectShowcase.tsx`, which calls the hook for real at
line 65 and is the already-carried unimported dead-code item.
`--mode=guard` on the real tree: **PASS**.

Not a 05b failing condition — the hole named in the packet is closed and the
guard is strictly better than it was. Recorded for whoever owns the guard next:
anchoring the check to a line that is not a comment, or matching
`const … = usePrefersReducedMotion(`, would close it without a parser.

## R5 — no regressions

| check | result |
|---|---|
| `test:e2e:critical` | **159 passed, 3 skipped, 0 failed** (9.2 m) |
| `test:e2e:smoke` | **12 passed** (59.0 s) |
| `test:e2e:visual` | **27 passed** (59.7 s), first run, **no flake** |
| goldens | 45 PNGs, **byte-identical** before/after |
| `motion-audit --mode=guard` | PASS |
| `grid-axis-probe` | PASS, **0 off-grid**, tolerance 1 px |
| `npm run build` | clean |
| working tree | clean — QA modified no production file |

**B28 at rest**, `--mode=rest`, ten route/viewport pairs: `hiddenText=0` on all
ten. The 14 `hidden` on `/hizmetler/cnc-frezeleme` at both widths are the
pre-existing decorative `div.absolute.inset-0.bg-gradient-to-*` elements with no
own text, reported by the instrument's own `hidden, no own text` channel.
Unchanged from the original report.

**The visual flake.** It did not reproduce — 27/27 on my first run. The Coder's
argument that its diff cannot reach `/__phase04-not-a-route__` is not merely
plausible, it is checkable, and `reports/qa/tools/p05c-r5-flake-reachability.mjs`
checks it under the golden project's own conditions (375, `reducedMotion:
"reduce"`):

- on the 404 route the stylesheet carrying every changed rule, `Index-*.css`,
  **is not loaded at all** (`carriesChangedRules: false`); there is no
  `.tl-hero` and no `.tl-root`;
- on `/` under reduced motion `data-motion` is `"reduced"`, never `"ready"`, so
  **zero** elements anywhere have `tl-label-lock-*` as an applied animation;
- `[data-fullscreen-header]`, the captured element, does not contain the hero on
  either route.

The correction's CSS is not even downloaded on the route that flaked. Add that
the wordmark is shared by all six surfaces and only one of eighteen header
captures moved, and a CSS cause is excluded. Settle race, not regression. No
golden was regenerated, which was the right response.

## R6 — the accessibility trade-off. Route to Phase 13; worse than described.

The Coder flagged this against itself, which is to its credit. Measured rather
than accepted: `reports/qa/tools/p05c-r6-dimmed-text-contrast.mjs` reads
rendered pixels, because these boxes sit on a photograph and the composite
cannot be derived from the stylesheet. Glyph luminance at the 97th percentile
against local backdrop at the 25th, inside each box, at 1440.

| box | at rest | while another is hovered |
|---|---|---|
| `.tl-measure-top` | 15.87:1 | — (hovered) |
| `.tl-measure-left` | 16.02:1 | **2.72:1** |
| `.tl-measure-finish` | 15.40:1 | 3.45:1 |
| `.tl-fcf-top` | 15.58:1 | **2.65:1** |
| `.tl-fcf-bottom` | 14.61:1 | **2.92:1** |
| `.tl-datum` | 12.18:1 | 4.07:1 |

**It is worse than the note says.** The note describes dropping below 4.5:1.
Three of the five drop below **3:1**, the large-text/non-text floor as well.
`.tl-measure-left` — `72.000 ±0.010`, real text, not `aria-hidden`, genuinely
informative — sits at 2.72:1. `aria-hidden="true"` on the three FCF/datum
glyphs does not exempt them from SC 1.4.3, which applies to text that is
visually rendered.

The mitigations are real and I verified each rather than restating them:

- **pointer-only** — the entire block is inside `@media (hover:hover) and (pointer:fine)`; coarse-pointer users never enter the state;
- **no information is gated** — `.tl-hero` `innerText` is identical in both states (measured, `true`);
- **instantly reversible** — all sixteen return to 1.00 when the pointer leaves (R1);
- **the value being read is always at full opacity** — the hovered box measured 15.87:1.

The one thing that stops this being fine is that it is not transient in the way
an animation is. It persists for as long as the pointer rests, so a low-vision
user with a magnifier and a parked pointer loses five of six values for the
duration. There is no `prefers-contrast` guard anywhere in `src/` (only an
unrelated `forced-colors` block in `shell.css`).

**Judgement: acceptable for 05b, route to Phase 13.** It is not a 05b acceptance
criterion, the interaction is a genuine and well-argued climax, and the
information cost is zero. But .34 is a design number chosen for the picture, not
for a contrast floor, and Phase 13 should either raise it until the dimmed text
clears 4.5:1 or add a `prefers-contrast: more` branch that does. Filed with the
measurement so Phase 13 does not have to re-derive it.

---

## Carry-forwards (unchanged, not failures)

B24 (Phases 07/13) · I5 `/iletisim` (Phase 13) · the I4 remaining layout clip
(Phase 07) · `ProjectShowcase` unimported (dead-code hygiene) · win32-only
golden gap · content wording (Phase 06). **New:** the R4 latent guard hole and
the R6 dimmed-text contrast, both above.

## Commands run

```bash
npm run build
node reports/qa/tools/p05c-r1-correlation-matrix.mjs
node reports/qa/tools/p05c-r2-specificity-parity.mjs
node reports/qa/tools/p05c-r4-guard-reachability.mjs
node reports/qa/tools/p05c-r5-flake-reachability.mjs
node reports/qa/tools/p05c-r6-dimmed-text-contrast.mjs
node reports/qa/tools/p05c-motion-audit-PREFIX.mjs --mode=guard   # from a scratch fixture tree
node scripts/motion-audit.mjs --mode=guard
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=cls    # x3
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=rest
PROBE_BASE_URL=http://localhost:4211 node scripts/grid-axis-probe.mjs
PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test --project=critical-1280 --project=critical-375
PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test --project=smoke-webkit-1440 --project=smoke-webkit-390 \
                                             --project=smoke-firefox-1440 --project=smoke-firefox-390
PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test --project=visual-375 --project=visual-1280 --project=visual-1440
```

## Scope integrity — PASS

- Production files modified by QA: **NONE**. The working tree stayed clean throughout.
- QA wrote only `reports/qa/phase-05b.md` and `reports/qa/tools/p05c-*.mjs`, all
  inside `QA_WRITE_ALLOWLIST`. The original FAIL report is unedited above.
- Guard fixtures lived in a scratch directory outside the repo.
- No test was weakened, skipped, retried into green, or deleted; no tolerance
  broadened; no golden regenerated.

## Verdict

**STATUS: PASS.** The one item that failed is fixed, and the fix is verified by
measurement and by two in-place negative controls that reproduce each cause
independently. The specificity contract the stylesheet now claims is the one the
browser enforces, proved by reversal. The CLS instrument now carries its own
A/B and the docs say plainly that the raw total is not evidence — and the raw
total's instability, demonstrated here across three runs of one build, retires
the earlier reproducibility finding as an instrument artefact. The reported
guard hole is closed and the guard is better than before. B28 is intact, 198
tests pass across three suites with zero failures, and no golden moved.

- **HOVER_CORRELATION: WORKS**
- **CLS_METHOD: SPLIT_AT_SCROLL_CORRECT**
- **GUARD_HOLE: CLOSED** (reported one; latent regex/string path open, routed)
- **B28_REGRESSION: NONE**
