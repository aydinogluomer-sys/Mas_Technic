# QA Report — Phase 05a (motion system foundation)

- PHASE: 05a
- CODE_COMMITS: 5ac4135 (integration HEAD), preceded by 46ae7f4, d51adad, ca40ef0, e54f9f8, 4d9bb28, e1bc431
- BASE FOR DIFF: 62a57cd
- QA_COMMIT: 5313739 (block 1), eb902d6 (blocks 2-3), 1d8782b (block 4), + this finalisation commit
- QA branch: `wt/qa-p05a`
- STATUS: PASS
- TESTS_PASSED: 186
- TESTS_FAILED: 0
- TESTS_SKIPPED: 3
- NEW_TESTS_ADDED: 0

Environment: preview served on **port 4188** (4173 and 5199 held by stale
processes). Built once from `5ac4135`; `dist/` reused for every browser check.

---

## BLOCK 1 — static verification (R3, R4, R5, R6)

### R4 — "49 files repointed, import line only"  → PASS

`git diff -U0 62a57cd..5ac4135 -- src` excluding the six modules that are
deliberately rewritten (`shell/motion.tsx`, `ui/CustomCursor.tsx`,
`config/landing-motion.ts`, `config/motion-system.ts`, `hooks/use-reduced-motion.ts`,
`styles/design-tokens.css`) yields **only import statements** — every single
changed line, aggregated:

```text
  49 +import { motion } from "@/components/shell/motion";
  27 -import { motion } from "framer-motion";
  10 -import { motion, AnimatePresence } from "framer-motion";
  10 +import { AnimatePresence } from "framer-motion";
   4 -import { motion, useScroll, useTransform } from "framer-motion";
   4 +import { useScroll, useTransform } from "framer-motion";
   ... (remaining 12 lines are the same shape: `motion` split off the named import)
```

Exactly **49** files, exactly 49 added import lines, zero JSX/copy/class/layout
lines. The count in the packet is accurate and **no scope creep rode along**.
`src/styles/design-tokens.css` (+16) is **comment-only** — every token value
(`--tl-dur-micro: .22s`, `--tl-dur-short: .35s`, `--tl-in: .62s`,
`--tl-step: 65ms`) is byte-unchanged. `src/hooks/use-sound.ts` is **unchanged**.

### R3 — the proxy forwards faithfully and cannot be bypassed  → PASS

`src/components/shell/motion.tsx`:

- **Verbatim forwarding proven at the code path level**, not asserted:
  `const resolved = prefersReduced ? resolveAtRest(props) : props;`
  With no preference the props object is passed through by identity. There is
  no non-reduced branch that can drop a prop.
- **No silent prop-drop under reduced motion.** `resolveAtRest` destructures
  only `{whileInView, viewport, initial, animate, transition}` and spreads the
  rest. `whileHover` / `whileTap` / `whileFocus` / `exit` / `variants` /
  `style` / `className` / `layout` all survive. The two intentional drops are
  `viewport` (nothing left to observe) and the original `transition` (replaced
  by `MOTION_REDUCED = {duration: 0}`), both documented.
- **The promoted state is the genuine final state**, with one deliberate
  asymmetry in `settle()`: `opacity` collapses a keyframe array to its
  **maximum**, every other property to its **last**. I verified this is safe
  rather than convenient — all four opacity-keyframe call sites in the
  codebase are pulses whose maximum *is* the visible state:

  | Call site | Keyframes | Rest value |
  |---|---|---|
  | `FinalCTASection.tsx:125` | `[0, 0.6, 0]` | 0.6 (visible) |
  | `FloatingPaths.tsx:39` | `[0.3, 0.6, 0.3]` | 0.6 |
  | `NexusPromoSection.tsx:179`, `QuickQuoteSection.tsx:123,248` | `[1, 0.3, 1]` | 1 |
  | `TestimonialsSection.tsx:258` | `[0.4, 1, 0.4]` | 1 |

  There is **no `animate` that fades to `opacity: 0` as its end state**
  (`grep -rnE 'animate=\{\{[^}]*opacity:\s*0'` → no matches), so the max rule
  cannot wrongly pin a deliberately-hidden element visible. Had one existed,
  this heuristic would have been a defect; it does not.
- **Variant forms actually used are covered.** `src/pages/ServiceDetail.tsx`
  exercises all five forms the packet names — object targets (L85/92/99),
  `clipPath` reveal (L105-106), variant strings with `staggerContainer` /
  `staggerItem` (L212-219, L245-251), and `viewport={{once:true}}`
  (L248, 268, 300, 331, 367, 404). That route measures **0 hidden
  text-bearing elements** under reduced motion (see Block 2), so the forms are
  verified empirically on the exact route that uses them, not by reading.
- **Variant-children early return is correct**: elements with none of
  `initial`/`animate`/`whileInView` are returned untouched so they keep
  inheriting parent propagation. Confirmed this is what
  `ProjectShowcase.tsx:172` (an `onViewportEnter`-only element) hits, so its
  `viewport={{once:true}}` is **not** stripped and the callback still fires once.
- **Guard re-run on the clean tree**: `node scripts/motion-audit.mjs --mode=guard`
  → `PASS — every motion call site goes through @/components/shell/motion.`
  (Orchestrator's negative control on `SSS.tsx` and the non-zero exit are
  accepted as already-evidenced and not repeated.)

### R5 — three motion levels  → PASS

`MOTION_LEVEL = {micro: 0.22, standard: 0.35, cinematic: 0.62}` in
`src/config/motion-system.ts` reconciles exactly with the two pre-existing
vocabularies rather than adding a third:

| Level | `motion-system.ts` | `navigation/motion.ts` | `design-tokens.css` |
|---|---|---|---|
| micro | 0.22 | `NAV_MOTION.micro` 0.22 | `--tl-dur-micro: .22s` |
| standard | 0.35 | `NAV_MOTION.close` 0.35 | `--tl-dur-short: .35s` |
| cinematic | 0.62 | `NAV_MOTION.open` 0.62 | `--tl-in: .62s` |
| step | `MOTION_STEP` 0.065 | `NAV_MOTION.step` 0.065 | `--tl-step: 65ms` |
| reduced | `MOTION_REDUCED {duration:0}` | `NAV_MOTION.reduced {duration:0}` | — |

**No fourth vocabulary introduced**; the Phase 03 `NAV_EASE` /
`MOTION_EASE.enter` curve `[0.16, 1, 0.3, 1]` is identical to `--tl-ease-out:
cubic-bezier(.16,1,.3,1)`. Levels are consumed, not just declared:
`CustomCursor.tsx` (5 sites) and `landing-motion.ts` (4 sites) reference
`MOTION_LEVEL`; `shell/motion.tsx` references `MOTION_REDUCED`. The file
honestly annotates the values it did **not** snap to the scale
(`ROUTE_TRANSITION.holdDuration = 0.42`, measured) rather than forcing them —
that is the correct call, since retuning them is a choreography decision.

### R6 — the cursor decision  → PASS (with one reported, un-actioned defect)

"Kept the semantic half, dropped the decorative half" is **substantiated**:

- **Dropped, correctly:** the blanket `a[href], .nav-link, button` selector
  carrying `{text: "", scale: 1.3}` — a generic ring-scale on every link and
  button with an *empty* label. That is the generic awards-site cursor and
  encodes nothing; removing it is right per `mas-motion-system`.
  Also dropped: `mixBlendMode: "difference"` on the dot (a blend mode
  repainting a fixed overlay on every pointer move) and the `play("tick")`
  sound on hover.
- **Kept, correctly:** the 10 remaining entries are all content-typed and name
  the *kind* of interaction before the click — `Seç` / `Aç` / `Keşfet` /
  `Çevir` / `Oku` / `Detay` / `Zoom` / `Teklif`. That is interaction semantics,
  not decoration. Verdict: what remains genuinely earns its place.
- **`use-sound.ts` is byte-unchanged** and its three consumers are intact:
  `MagneticButton.tsx:4,21`, `ui/BracketButton.tsx:2,15`, `HeroSection.tsx:7,28`.
  Only the cursor's own call was removed. No breakage.
- **Bonus accessibility repair, correct:** the component previously returned
  `null` for `prefers-reduced-motion` users while `src/index.css` hides the
  native cursor unconditionally under
  `@media (min-width:901px) and (pointer:fine)` — leaving reduced-motion
  desktop users **with no pointer at all**. It now renders a *non-animated*
  pointer (position written directly, no easing/trail/tween). Verified in
  Block 2 via `--mode=cursor`.

**Reported, not fixed (correctly out of allowlist):** `src/index.css`'s
`cursor: none` rule is still unscoped to whether a replacement is mounted, and
`Z.cursor` (90 in `src/styles/z-index.ts`) sits *below* `Z.pageTransition` (95)
and `Z.preloader` (100); the component works around it locally with
`CURSOR_Z = Z.preloader + 1`. Both are flagged in-source as outside this
packet's write allowlist. Agreed — these are follow-ups, not 05a failures.

---

## BLOCK 2 — runtime measurement (R1, R2, R6-runtime)

All runs: preview on **:4188** from the single `5ac4135` build.

### R1 — B28 at rest under `prefers-reduced-motion: reduce`, no scrolling → FIXED

Metric used: **effective opacity multiplied down the full ancestor chain**
(`display:none`/`visibility:hidden` excluded), over **all laid-out elements**
(`getBoundingClientRect()` width or height > 0). `hiddenText` counts only
elements carrying **their own** text node and not inside `[aria-hidden=true]`.
This is the "effective opacity over laid-out elements" metric — the same one
the Coder quoted, **not** the earlier QA "computed opacity over a sampled set"
metric that produced 194/333.

`node scripts/motion-audit.mjs --mode=rest`

| Viewport | Route | elements | hidden | **hiddenText** |
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

Result: `PASS — no route hides text-bearing content at rest under reduced motion.`
Coverage exceeds the packet's requirement (landing + 4 inner routes including
all three the Coder named, at both 1280 and 375).

The 14 residual hidden elements on `/hizmetler/cnc-frezeleme` are **not** a
defect: all 14 are `<div class="absolute inset-0 bg-gradient-to-r|br
from-primary/5 to-transparent">` — empty hover-state decorative gradient
overlays with no text and no descendants. I read the printed sample rather than
accepting the subtraction.

### Independent confirmation of the BEFORE state (no rebuild required)

I did not take the Coder's before-figures on trust. `--mode=enabled` measures
the same census with motion **allowed** and no scrolling — exactly the state
every user was left in before the fix:

| Viewport | Route | elements | armed | **armedText** | afterScroll | afterScrollText |
|---|---|---|---|---|---|---|
| 1280 | `/` | 861 | 516 | **205** | 5 | 0 |
| 1280 | `/hizmetler/cnc-frezeleme` | 732 | 524 | **186** | 19 | 0 |
| 1280 | `/iletisim` | 292 | 5 | **0** | 5 | 0 |
| 1280 | `/malzemeler/aluminyum` | 518 | 24 | **14** | 5 | 0 |
| 1280 | `/hakkimizda` | 192 | 5 | **0** | 5 | 0 |
| 375 | `/` | 819 | 564 | **214** | 5 | 0 |
| 375 | `/hizmetler/cnc-frezeleme` | 718 | 544 | **195** | 22 | **2** |
| 375 | `/iletisim` | 279 | 102 | **24** | 5 | 0 |
| 375 | `/malzemeler/aluminyum` | 505 | 51 | **21** | 5 | 0 |
| 375 | `/hakkimizda` | 179 | 5 | **0** | 5 | 0 |

The reference route at 1280 reproduces **524 of 732 armed, 186 text-bearing** —
matching the Coder's quoted before-figure of 519/709 with 186 text-bearing, to
within the handful of nodes the new cursor adds to the DOM. **The before-state
is therefore independently confirmed, and the 186 -> 0 delta is real.**

**B28 per-route before -> after (text-bearing elements hidden at rest):**

| Route | 1280 before -> after | 375 before -> after |
|---|---|---|
| `/hizmetler/cnc-frezeleme` | **186 -> 0** | **195 -> 0** |
| `/` (landing) | 205 -> 0 | 214 -> 0 |
| `/malzemeler/aluminyum` | 14 -> 0 | 21 -> 0 |
| `/iletisim` | 0 -> 0 | 24 -> 0 |
| `/hakkimizda` | 0 -> 0 | 0 -> 0 |

### R2 — the non-reduced path still animates → PASS

The same `--mode=enabled` table read the other way: with **no motion preference
set**, 516 elements on the landing and 524 on the service detail are still
*armed* (staged hidden, waiting on their IntersectionObserver) before any
scroll, and resolve to `afterScrollText=0` once scrolled. The choreography is
fully intact — the fix did **not** become "reveals are off for everyone".
Corroborated at code level: `resolveAtRest` is never invoked on the
no-preference path (props passed through by identity).

### R6 runtime — `--mode=cursor` → PASS

| reducedMotion | body | link | button | replacementNodes |
|---|---|---|---|---|
| no-preference | none | none | none | **2** |
| reduce | none | none | none | **2** |

The documented before-state under `reduce` was `replacementNodes=0` — a hidden
native cursor with nothing replacing it. Now 2 (dot + ring) in both modes, and
under `reduce` the ring is written directly to the pointer with no tween.

### Observation (pre-existing, NOT a 05a regression)

375 / `/hizmetler/cnc-frezeleme` shows `afterScrollText=2` on the
**motion-enabled** path: the eyebrow "Talaşlı İmalat" and the `<h1>` "CNC
Frezeleme" read effective opacity 0 after the scripted scroll — a `whileInView`
element re-hiding once scrolled off-screen. It lives entirely on the
verbatim-forwarded path, so 05a neither caused nor changed it. Logged for
Packet 2 / Phase 06.

## BLOCK 3 — e2e suites (R7), part 1

`PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_PORT=4321 PLAYWRIGHT_ARTIFACTS=0`
(4173 and 5199 are held by stale processes).

### `test:e2e:critical` (critical-1280 + critical-375) → **147 passed, 3 skipped, 0 failed** (7.0m)

Re-confirms green after the 49-file migration: 14 bands numbered in order,
anchors, no document-level horizontal overflow, the shell cascade contract, the
full menu teardown matrix **including the reduced-motion close path**,
`scrollable-region-focusable` reachability, route-transition / back-forward /
B25 modal-lock, the 404 shell state, and "reduced motion keeps the complete
page visible without active animation".

## BLOCK 4 — remaining suites, grid, axe, goldens (R7, R8, R9)

### `test:e2e:smoke` (webkit-1440, webkit-390, firefox-1440, firefox-390) → **12 passed, 0 failed** (1.4m)

Cross-browser: complete landing + intro shell hand-off, inner page on the
shared shell, primary conversion route reachable — on both WebKit and Firefox
at both widths.

### `test:e2e:visual` (visual-375, visual-1280, visual-1440) → **27 passed, 0 failed** (1.5m)

### `node scripts/grid-axis-probe.mjs` → **PASS, 0 off-grid**

Run with `PROBE_PORT=4455` (its default 4199 is held by a stale process that
answers with an HTTP error — environmental, see Notes).
`PASS — every measured edge sits on a master axis (tolerance 1px).`

### R9 — goldens → PASS

`git diff --name-only 62a57cd..5ac4135 -- e2e` is **empty**: not one file under
`e2e/**` changed, so `e2e/__golden__/win32/{visual-375,visual-1280,visual-1440}`
are **byte-unchanged**. §12's per-viewport re-justification is therefore not
triggered — there is no regenerated golden to re-justify, which is the outcome
carrying the least risk of repeating the Phase 04 incident (a golden
regenerated on a justification true at 1280/1440 and false at 375).

All 27 visual assertions pass against those untouched baselines, checked **per
viewport separately** (9 per viewport: landing, closed header, open menu, and
six shell-chrome routes). This is a meaningful result rather than a formality:
`CustomCursor` dropped `mixBlendMode: "difference"` from the dot and moved from
`z-[10052]` to `Z.preloader + 1` (101), and the goldens confirm neither shifted
a single rendered pixel of the baselines.

### R8 — axe, and whether the separation is real → PASS

`node scripts/motion-audit.mjs --mode=axe` (serious + critical only, @1280):

| Route | reduce (what a reduced user sees NOW) | no-preference, no scroll (the pre-fix hidden set) |
|---|---|---|
| `/` | 0 | 0 |
| `/hizmetler/cnc-frezeleme` | **28** — `color-contrast:28` | **0** |
| `/iletisim` | 4 — `color-contrast:1 label:1 select-name:2` | 4 — identical |
| `/malzemeler/aluminyum` | 0 | 0 |
| `/hakkimizda` | 0 | 0 |

The node count on the reference route rises 0 -> 28. **I did not accept that as
automatically fine, and I did not accept the Coder's classification.** The
Coder's mode compares two *at-rest* states, which explains why the count rose
but cannot by itself distinguish "newly visible pre-existing debt" from "newly
introduced defect" — it never observes those nodes in a state an ordinary
motion-enabled user would reach.

So I added the missing discriminator
(`reports/qa/tools/p05a-r8-scrolled-axe.mjs`, then
`reports/qa/tools/p05a-r8-node-identity.mjs`): take a **motion-enabled** user,
**scroll the whole page** so every `whileInView` reveal fires naturally, and
compare the resulting violation set against the reduced-at-rest set.

| Run | serious/critical nodes |
|---|---|
| `motion=reduce, scroll=false` | 28 — `color-contrast:28` |
| `motion=no-preference, scroll=false` | 0 |
| **`motion=no-preference, scroll=true`** | **28 — `color-contrast:28`** |
| `motion=reduce, scroll=true` | 28 — `color-contrast:28` |

Compared on **node identity** (element `outerHTML` + axe's resolved
fg/bg/ratio), not on axe's synthesised selector string:

```text
reduced, at rest (no scroll)      : 28 color-contrast nodes
no-preference, scrolled naturally : 28 color-contrast nodes
identical nodes in both           : 28
only on the reduced path          : 0
only on the normal-scrolled path  : 0
```

**The separation is real and the classification is correct.** Every node axe
now reports on the reduced path is reported for an ordinary scrolling user too,
so all 28 are newly *visible* pre-existing debt. Phase 05a introduced none.

(A first pass on selector strings appeared to show 6 divergent nodes. That was
my own probe artifact — v1 scrolled back to the top, which lets `whileInView`
elements without `once:true` re-hide, and axe then synthesises different
`:nth-child()` paths. Corrected in v2 by not returning to the top and by keying
on element identity. Recorded so the 6 is not mistaken for a finding.)

**B24 — neither fixed nor worsened. Confirmed.**

```text
#0a7d8a on #e1ecea = 4.03:1  x22
#0a7d8a on #edf2f0 = 4.3:1   x6
                              --- 28 nodes total
```

28 nodes, ratio 4.03:1 — matching the record of B24 in `reports/qa/phase-04.md`
(28 serious `color-contrast` on `ServiceDetail`, 4.025:1 against a 4.5:1
requirement; the 4.03 vs 4.025 difference is axe's 2-dp rounding, not movement).
Count unchanged, ratios unchanged, colour pairs unchanged. Owned by Phases 07/13.

`/iletisim`'s 4 nodes are **identical in both modes** (`color-contrast:1
label:1 select-name:2`), i.e. always-visible pre-existing debt untouched by this
packet.

---

## Acceptance criteria matrix

| Criterion | Result | Evidence |
|---|---|---|
| R1 — B28 fixed, measured at rest | **PASS** | `--mode=rest`: `hiddenText=0` on all 5 routes x 2 viewports; reference route 186 -> 0 @1280, 195 -> 0 @375 |
| R2 — non-reduced path still animates | **PASS** | `--mode=enabled`: 516 armed on `/`, 524 on service detail with no preference; `afterScrollText=0` |
| R3 — proxy faithful, not bypassable | **PASS** | `resolved = prefersReduced ? resolveAtRest(props) : props`; no prop-drop; `settle()` opacity-max safe against all 4 keyframe call sites; `--mode=guard` PASS |
| R4 — 49 files, import line only | **PASS** | Aggregated diff = 49 added imports + matching removals, zero content/copy/layout lines |
| R5 — three motion levels, no fourth | **PASS** | `MOTION_LEVEL` 0.22/0.35/0.62 == `NAV_MOTION` == `--tl-dur-micro/short/in`; consumed in 9 sites |
| R6 — cursor semantic half kept | **PASS** | Blanket empty-label selector + `mixBlendMode` + hover sound removed; 10 content-typed labels kept; `use-sound.ts` unchanged, 3 consumers intact; `--mode=cursor` 0 -> 2 nodes under `reduce` |
| R7 — suites green, Phase 01-04 guarantees hold | **PASS** | critical 147P/3S, smoke 12P, visual 27P, grid probe 0 off-grid |
| R8 — axe separation real, B24 unmoved | **PASS** | Node-identity comparison: 28 == 28, 0 divergent; B24 28 nodes @4.03:1 unchanged |
| R9 — goldens | **PASS** | No `e2e/**` file changed; byte-unchanged; 27 visual assertions green per viewport |

## Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| — | none | — | — |

## Commands run

```text
npm run build                                                  # once; dist/ reused
node scripts/motion-audit.mjs --mode=rest                      # PASS
node scripts/motion-audit.mjs --mode=enabled
node scripts/motion-audit.mjs --mode=cursor
node scripts/motion-audit.mjs --mode=guard                     # PASS
node scripts/motion-audit.mjs --mode=axe
PROBE_PORT=4455 node scripts/grid-axis-probe.mjs               # PASS
PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_PORT=4321 PLAYWRIGHT_ARTIFACTS=0 \
  npx playwright test --project=critical-1280 --project=critical-375
  ... --project=smoke-webkit-1440 --project=smoke-webkit-390 \
      --project=smoke-firefox-1440 --project=smoke-firefox-390
  ... --project=visual-375 --project=visual-1280 --project=visual-1440
node reports/qa/tools/p05a-r8-scrolled-axe.mjs
node reports/qa/tools/p05a-r8-node-identity.mjs
```

## Scope integrity

- Production files modified by QA: **NONE**
- Test/report files modified by QA: `reports/qa/phase-05a.md`,
  `reports/qa/tools/p05a-r8-scrolled-axe.mjs`,
  `reports/qa/tools/p05a-r8-node-identity.mjs` — all inside QA_WRITE_ALLOWLIST.
- No assertion weakened, no tolerance broadened, no golden regenerated, no skip
  or xfail added, no coverage deleted.
- Coder scope integrity: **PASS** — the 49-file migration is import-only; the
  six rewritten modules are all named deliverables of the packet.

## Notes — environment

- Preview served on **port 4188** for the audit/probes and **4321** for
  Playwright. **4173, 4199 and 5199 are held by stale processes** (4199 answers
  with an HTTP error code, which is why `grid-axis-probe.mjs` needed
  `PROBE_PORT=4455`). Environmental, not code defects.
- Built once; `dist/` reused everywhere via `PLAYWRIGHT_PREVIEW_ONLY=1`. One
  suite at a time. No `net::ERR_INSUFFICIENT_RESOURCES` encountered.
- `node_modules` junction untouched; no install/prune run. `.env` never read,
  printed or committed.

## Carry-forwards (not 05a failures)

- **B24** — `ServiceDetail` 28 serious `color-contrast` @4.03:1. Phases 07/13.
  Now *visible* rather than hidden, which is correct: the fix surfaced it.
- **`/iletisim`** — 4 serious nodes (`color-contrast`, `label`, `select-name`),
  always-visible pre-existing debt.
- **`src/index.css`** — `cursor: none` under `(min-width:901px) and
  (pointer:fine)` is still unscoped to whether a replacement is mounted.
  Correctly reported by the Coder rather than edited (outside allowlist).
- **`src/styles/z-index.ts`** — `Z.cursor` (90) sits below `Z.pageTransition`
  (95) and `Z.preloader` (100); `CustomCursor` works around it locally with
  `Z.preloader + 1`. The token wants correcting in the file that owns it.
- **375 `/hizmetler/cnc-frezeleme`** — eyebrow and `<h1>` re-hide after being
  scrolled past on the **motion-enabled** path (`whileInView` without
  `once:true`). Entirely on the verbatim-forwarded path; 05a neither caused nor
  changed it. For Packet 2 / Phase 06.
- **`ProjectShowcase.tsx:172`** — a decorative chromatic-aberration animation
  still triggers for reduced-motion users (the element has only
  `onViewportEnter`, so the primitive correctly passes it through untouched).
  Motion-grammar question owned by Packet 2.
- Packet 2 items (motion grammar by content type, climax hierarchy, hero-part
  interaction, manifesto enactment, mobile effect density, jank tuning) are out
  of scope here and their absence is not a 05a failure.

## Verdict

**B28_VERDICT: FIXED.**

Text-bearing elements at effective `opacity: 0` at rest under
`prefers-reduced-motion: reduce`, no scrolling — metric: effective opacity
multiplied down the ancestor chain, over all laid-out elements:

| Route | @1280 before -> after | @375 before -> after |
|---|---|---|
| `/hizmetler/cnc-frezeleme` | **186 -> 0** | **195 -> 0** |
| `/` | 205 -> 0 | 214 -> 0 |
| `/malzemeler/aluminyum` | 14 -> 0 | 21 -> 0 |
| `/iletisim` | 0 -> 0 | 24 -> 0 |
| `/hakkimizda` | 0 -> 0 | 0 -> 0 |

The repair is structural rather than per-call-site, the guard makes the bypass
a build failure, the non-reduced choreography is provably untouched, and the
rise in axe nodes is verified to be pre-existing debt becoming visible.

**STATUS: PASS.**

## Note on the 3 skipped tests

All 3 are pre-existing conditional `test.skip(...)` "canonical lane" guards
(e.g. `e2e/landing/navigation-reachability.spec.ts:241` — *"one canonical
resolution lane"*), which deliberately run an assertion in exactly one project
rather than duplicating it across both. They are not suppressed coverage, and
**no skip could have been added by this packet**: `git diff --name-only
62a57cd..5ac4135 -- e2e` is empty, so not one spec file changed.
