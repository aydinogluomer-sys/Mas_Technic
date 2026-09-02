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

*(Blocks 2+ appended below as they complete.)*
