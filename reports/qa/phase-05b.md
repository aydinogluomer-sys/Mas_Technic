# QA Report — Phase 05b (creative choreography)

- PHASE: 05b
- CODE_COMMITS: `7085559`, `495d1d7`, `b3d66f6`, `d9a1b45`, `33ddcf8`, `1ee1361` (integration HEAD `1ee1361`)
- BASE FOR DIFF: `a2b4c20`
- QA_COMMIT: TBD
- STATUS: IN PROGRESS
- B28_REGRESSION: NONE
- I4_REMAINING_DEFECT: TBD

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
