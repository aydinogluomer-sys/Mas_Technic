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
