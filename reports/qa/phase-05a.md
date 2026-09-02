# QA Report — Phase 05a (motion system foundation)

- PHASE: 05a
- CODE_COMMITS: 5ac4135 (integration HEAD), preceded by 46ae7f4, d51adad, ca40ef0, e54f9f8, 4d9bb28, e1bc431
- BASE FOR DIFF: 62a57cd
- QA_COMMIT: TBD
- STATUS: IN PROGRESS
- TESTS_PASSED: TBD
- TESTS_FAILED: TBD
- TESTS_SKIPPED: TBD
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

*(Blocks 4+ appended below as they complete.)*
