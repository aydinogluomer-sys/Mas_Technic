# QA Report — Phase 07 (round 4, final)

- PHASE: 07
- CODE_COMMIT: `73adb1b`, `a42dc3f`, `6984fae` (round-4 packet #3, on `bf960c6`)
- QA_COMMIT: see `git log wt/qa-p07c3`
- STATUS: **PASS**
- TESTS_PASSED: 130
- TESTS_FAILED: 0
- TESTS_SKIPPED: 18
- NEW_TESTS_ADDED: 2 (× 4 visual projects = 8 executions)

Rounds 1–3 are preserved at `reports/qa/phase-07-round1.md`, `-round2.md`,
`-round3.md`. This round re-verified **only** H4 and the items listed in the
round-4 packet §2–§3. F1, F2, F3, F4, F5-R, A1, A2, A7, H1, H3, H5, H6 and the
`23cbc63` retraction remain closed on round-2/3 evidence and were not re-derived.

---

## 0. Environment integrity — read this before the evidence

`http://localhost:4173` was already serving **a different tree's build**.
Measured: `GET /assets/index-CS4RiwkS.js` (this tree's hash) returns
`text/javascript`, 113 787 bytes on my server and `text/html`, 17 472 bytes on
4173 — an SPA fallback, i.e. that bundle does not exist there. This tree had no
`dist/` at all when I started.

Every measurement below was therefore taken against **a build of this tree**
(`npm run build` at `6984fae`), served by me on port 4917, byte-verified against
`dist/`. Anything measured against 4173 would have been evidence about someone
else's bundle.

---

## 1. Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 2.1 | The mount threshold is an executable assertion, not prose | **PASS** | `run1`: 7/7 green. Independently re-measured — see §2 |
| 2.1 | The guard is falsifiable | **PASS** | Three src-side mutations, each turns it red — see §3 |
| 2.2a | `overlays.ts` leg 2 was also false | **CONFIRMED** | `landing-golden.spec.ts:50` is `await expect(page).toHaveScreenshot("landing-fullpage.png", { fullPage: true })`; `visual-1280`/`visual-1440` are `mobile: false` in `playwright.config.ts:191-192`, so no `hasTouch`, so `(pointer: fine)` |
| 2.2b | Safety at 1280/1440 is paint order | **CONFIRMED, with a correction to the method** | §4 |
| 2.2c | `hasTouch` is the mechanism, not `isMobile` | **CONFIRMED** | `p1-matrix.json`: `768/isMobile-without-touch` → 2 layers, `finePointer: true`; `768/coarse` → 0 |
| 2.3 | §4 is derived, and a stale number fails a test | **PASS** | `run5` green; `run6` red on a mutated build; 5/5 stale-doc mutation classes change the parsed table — §5 |
| 2.4 | The implemented invariant vs. the literal one | **PASS — refusal upheld, stated reason refuted** | §6 |
| 2.5 | src-side pointer defect: severity and owner | **CONFIRMED and assigned** | §7 |
| 2.6 | Stale claims outside the allowlist | **CONFIRMED** | §8 |
| 3 | Rounds 2–3 have not regressed | **PASS** | §9 |
| 3 | `visual-1280` gating mitigation is sound | **PASS, with one limit** | §10 |
| 3 | Occlusion assertion's failure message | **FAIR POINT — hardening item** | §10 |
| 3 | `Z.header` vs `--gnav-z` | **CONFIRMED, pre-existing, assigned** | §11 |

---

## 2. The mount matrix is real, and it is a property of the component

I re-measured all ten cells with **my own context construction, my own settle,
and two routes the Coder did not use** (`/iletisim` and `/`, against its
`/hakkimizda`). `reports/qa/phase-07c4/p1-matrix.json`:

| cell | layers | `(pointer: fine)` | `body { cursor }` | both pointers drawn |
|---|---|---|---|---|
| 375/fine | 0 | true | auto | no |
| 375/coarse | 0 | false | auto | no |
| 767/fine | 0 | true | auto | no |
| **768/fine** | **2** | true | auto | **yes** |
| 768/coarse | 0 | false | auto | no |
| 768/isMobile-without-touch | 2 | true | auto | yes |
| 900/fine | 2 | true | auto | **yes** |
| 901/fine | 2 | true | **none** | no |
| 1280/fine | 2 | true | none | no |
| 1280/coarse | 0 | false | auto | no |

Identical on both routes. This reproduces the Coder's table **exactly**. The
mechanism is confirmed at source: `CustomCursor.tsx:189` is
`if (isMobile || !finePointer) return null;` and `use-mobile.tsx:3` is
`const MOBILE_BREAKPOINT = 768;`. `901` is the breakpoint of an unrelated
`@media (min-width: 901px) and (pointer: fine)` rule at `src/index.css:786`.

**The Coder was right and three rounds of prose — including two of my own
reviews — were wrong.**

---

## 3. Falsification: I made the guard red three ways, without touching a file

All three regressions were injected into a **copy of `dist/`** served on a
second port, so the repository never contained the defect under test and no
production or Coder-owned file was edited at any point.

| Mutation | Plausibility | Result |
|---|---|---|
| `--gnav-z: 10000` → `5` (header below the cursor) | a future phase re-tiering z | **ARMED assertion RED at 1280 and 1440** (`run2`) |
| `--tl-header-surface` alpha `.98` → `.30` (band translucent, still on top) | exactly §3's scenario | **ARMED assertion RED at 1280 and 1440** (`run3`) |
| `MOBILE_BREAKPOINT` `768` → `901` (**the retired claim made true**) | the original defect | **matrix RED on exactly the three cells the claim denied** (`run4`) |

The third is the load-bearing one. Diff reported:

```text
- Expected  - 3        + Received  + 3
-     "layers": 2,     +     "layers": 0,   (×3: 768/fine, 768/isMobile-without-touch, 900/fine)
```

So the matrix is **measured, not hardcoded**, and the answer to the packet's
question is yes: this spec would have caught the original defect, and it catches
the two most plausible next ones.

I also confirmed the guard's own in-suite control is real rather than decorative.
`p2-occlusion.json`, 64×64 corner, `/` and `/hakkimizda`, 1280 and 1440:

- two consecutive captures differ by **0** px (determinism holds),
- with vs. without the cursor: **0** px (ARMED holds),
- with the header occluder removed: **73** px (the measurement can see the cursor).

The Coder reported "6 teal px"; that is the exact-teal-within-tolerance count,
mine is any-channel-difference including the ring's 40 %-alpha border. Not a
contradiction.

**Committed artefacts agree with the live page.** Decoding the four banked
`landing-fullpage.png` files and counting `rgb(10,125,138) ±10` in the top-left
64×64: **0** at `visual-375`, `visual-768`, `visual-1280`, `visual-1440`.

---

## 4. §2.2b — correct conclusion, but the cited method cannot produce it

The packet states the occlusion as
`elementsFromPoint(2,2)` = `header[z=10000]` above `[data-custom-cursor][z=101]`.

**That measurement cannot return the cursor.** Both layers are
`pointer-events: none`, so they are excluded from hit testing at every
coordinate. Measured (`p2-occlusion.json`, all four cells):

```text
hitTest @ (2,2) : div.tl-band-index[z=auto] > header.tl-header-band[z=10000] > ...
cursorInHitTest : false
```

The **conclusion is right** — `.tl-header-band` is `z-index: 10000`,
`opacity: 1`, `background: rgba(7,11,13,0.98)`, `backdrop-filter: blur(14px)`,
rect `[0,0,W,72]`, over layers at `z-index` 101 (dot) and 100 (ring) — but it is
established by z-order plus the 0-vs-73 pixel comparison, not by hit testing.

This is a fourth instance of the phase's own failure mode: a claim about a
measurement that was not the measurement performed. It changes no verdict, and
the guard itself does not rely on it (it compares pixels). Recorded so the
sentence is not carried forward as though it had been reproduced.

---

## 5. §4 is genuinely derived, in both directions

`run5`: 3/3 green against a build of this tree. The comparison is not a count
check — `renderRow` emits seven columns (label, three width counts, radius, box
sizes, source citation) and the test does `toEqual` against the table parsed out
of the document.

**A stale number is fatal.** I mutated a copy of the document five ways and
confirmed each changes the parsed table, so `toEqual(measured)` would fail:

| mutation | detected |
|---|---|
| count `chat launcher` 768: 6 → 5 | yes |
| box `768: 56×56` → `48×48` | yes |
| `cursor dot` back to `– \| – \| 6` (the v3 error) | yes |
| radius `9999px` → `8px` | yes |
| source `MaterialMorphScroll.tsx:228` → `:229` | yes |

**The measured side is real too.** Run against the `MOBILE_BREAKPOINT` mutant
(`run6`), the census collapses to:

```text
-   "`cursor dot` | – | 6 | 6 | ... 768: 6×6 · 1280: 6×6 ..."
+   "`cursor dot` | – | – | 6 | ... 1280: 6×6 ..."
```

which is **exactly §4 version 3's wrong table**, and the test goes red against
the current document. §4 v3 would have been caught by this.

`foldRegister` also throws on an unlabelled radius source and on a label that
paints two different radii (both verified), and `citationDeclaresRadius` has a
real red control.

---

## 6. §2.4 — the refusal is upheld, but not for the reason given

**The Coder's stated reason is false.** It claimed adding `[data-custom-cursor]`
to `FOREIGN_OVERLAYS` "would move `landing-fullpage.png` at 1280 and 1440".
Measured on `/` with `landing-golden.spec.ts`'s own settle, both frames
stabilised to three consecutive identical whole-page captures
(`run11-annotations.json`):

```text
1280   cursor region 0 px    whole frame 150 688 px, bbox [65,210,1278,3898]
1440   cursor region 0 px    whole frame 0 px,       bbox null
```

Both layers are `position: fixed` about the viewport origin (dot 6×6 at
`(-3,-3)`, ring 44×44 at `(-22,-22)`), so the only pixels they can reach are the
top-left 22×22. The 1280 bounding box **excludes that region entirely** — those
150 688 px are a long landing page not being byte-identical between two
whole-page captures, not the cursor. At 1440 the whole frame is identical.
`hideForeignOverlays` does nothing but `display: none`. **Hiding the cursor moves
no pixel it could have moved.**

**The decision was nevertheless correct, for a stronger reason the Coder did not
give.** `hideForeignOverlays` sums one counter across all selectors:

```ts
for (const selector of FOREIGN_OVERLAYS) found += await page.locator(selector).count();
if (require) expect(found, "no [data-chat-launcher] was found to hide — ...").toBeGreaterThan(0);
```

Adding the cursor puts 2 into `found` on every fine-pointer project. Therefore at
`visual-1280` and `visual-1440` it would:

- **permanently satisfy the launcher-drift assertion** for
  `inner-pages-golden.spec.ts:90` and `shell-golden.spec.ts:52`, disarming the
  guard H5 hardened this same phase;
- **turn two of my own round-3 red controls red** —
  `qa-a2-overlay-guard.spec.ts:64` asserts `found` `toBe(0)` on `/`, and
  `:54` requires `require: true` to *throw* on `/`; with the cursor mounted at
  those widths `found` is 2 in both.

So the literal invariant, satisfied the only way that does not edit
`playwright.config.ts`, would have **weakened** existing coverage.

**Is the implemented invariant equivalent in protective power?** For the risk
that matters — a foreign fixed overlay reaching a banked baseline — yes, and in
one respect it is stronger: the literal form is a static configuration check
that would still pass if the header stopped occluding, whereas the implemented
form *measures the frame* and goes red on exactly that (proven in §3). The gap it
leaves is not in protection but in reach, and that gap is §10's scan holes.

---

## 7. §2.5 — confirmed, measured where it matters, and it is worse than stated

The packet argues from the parked corner and from `elementsFromPoint`. Neither
is where a user's pointer is, and the latter cannot see the cursor (§4). So I
**moved the pointer** to a real location inside the fixed header band and to a
control location below it, and compared the composited frame with the
replacement layers present against the same frame with them removed
(`p3-pointer-loss.json`, `/hakkimizda`):

| width | pointer inside the 72 px header band | pointer below the band |
|---|---|---|
| 1280 | native `none`, replacement **0 px** → **no visible pointer at all** | native `none`, replacement 292 px → replacement only |
| 1440 | native `none`, replacement **0 px** → **no visible pointer at all** | native `none`, replacement 292 px → replacement only |
| 900 | native `auto`, replacement 0 px → native only | native `auto`, replacement 292 px → **both pointers drawn** |
| 768 | native `auto`, replacement 0 px → native only | native `auto`, replacement 292 px → **both pointers drawn** |

Two distinct defects:

1. **At ≥901 px with a fine pointer, the user has no pointer over the header
   band.** `src/index.css:786` hides the native cursor; the replacement is at
   `z-index` 101/100 under a `z-index: 10000` band that is 98 % opaque with a
   14 px backdrop blur. The band is full-width, 72 px tall, fixed, and contains
   the primary navigation. The `:has([data-custom-cursor])` gate was added
   precisely to prevent a pointerless state and does not prevent this one,
   because it checks that the replacement **exists**, not that it is **visible**.
2. **Between 768 and 900 px with a fine pointer, both pointers are drawn** — the
   component mounts at 768 but the `cursor: none` rule does not start until 901.

**Is it WCAG?** In my judgement, **no WCAG 2.2 success criterion is failed as
written**. 2.4.7 and 2.4.11 govern *keyboard focus*, not the mouse pointer;
2.5.x govern gestures and cancellation, not pointer visibility; 1.4.11 governs
author-drawn UI components, and a pointer is a user-agent affordance. There is
no SC that requires a visible mouse pointer.

It is nonetheless a **high-severity usability defect** — losing the pointer over
the primary navigation is a direct hit on the Usability criterion the run is
scored on — and defect 2 is a visible-polish defect in a 133 px band. I am
recording it as **usability, high** and **not** as a WCAG failure, rather than
inflating it.

**Owner: Phase 13 — ACCESSIBILITY, RESPONSIVE AND CROSS-BROWSER RELEASE GATE**
(`IMPLEMENTATION.md:961`). Both defects are the same root cause — two
breakpoints, 133 px apart, that were meant to be one — and both are responsive
interaction behaviour. It is not Phase 07 work: Phase 07 neither introduced nor
touched either rule.

---

## 8. §2.6 — stale claims confirmed; nothing shipped depends on them

- `CLAUDE.md:48` and `MASTER_CONTEXT.md:170` both read
  `CustomCursor | Desktop cursor (>901px, pointer:fine)`. **Stale**: the mount
  threshold is 768 (§2). Both are DO_NOT_TOUCH for this run. Nothing in `src/`
  reads either file; they are agent context documents.
- `docs/lean/09-responsive-rules.md:127` lists `BrutalCrosshairCursor (landing
  page)` among desktop features. **Worse than the packet states.** The file does
  not merely go unimported — `src/components/BrutalCrosshairCursor.tsx` and
  `src/components/ui/BrutalCrosshairCursor.tsx` **do not exist**, `find src
  -iname "*crosshair*"` is empty, and `git log --all -- "*BrutalCrosshairCursor*"`
  returns **nothing across every ref**: the file has never existed in this
  repository's history. Zero references from any `.ts`/`.tsx`/`.css`. Same shape
  as B31, and checked rather than assumed.
  Five further documents carry the same phantom: `CLAUDE.md:49`,
  `docs/lean/09-responsive-rules.md:85`, `docs/lean/11-app-architecture.md:55`,
  `docs/lean/12-folder-structure.md:65`, `docs/lean/task-backlog.md:48`,
  `ROADMAP.md:61`.
- **New, same family:** `src/components/ui/CustomCursor.tsx:78` opens
  "`Z.cursor` is 90 … `Z.cursor` itself is referenced by nothing and wants
  correcting in the file that owns it". `src/styles/z-index.ts:25` now reads
  `cursor: 101` and carries an I3 note recording that very move. The docblock
  describing the problem outlived the fix.

---

## 9. Rounds 2–3 have not regressed

Full visual suite, **run per project so nothing competes**, against a build of
this tree:

| project | passed | skipped | failed |
|---|---|---|---|
| visual-375 | 31 | 6 | 0 |
| visual-768 | 31 | 6 | 0 |
| visual-1280 | 37 | 0 | 0 |
| visual-1440 | 31 | 6 | 0 |
| **total** | **130** | **18** | **0** |

Baseline at `6984fae` was 122 / 18 / 0. The delta is exactly +8 = my 2 new
tripwires × 4 projects. `git status -- e2e/__golden__` is **empty after every
run**: no golden was written, updated or regenerated at any point.

Also re-run: `npm run build` (exit 0), `tsc --noEmit -p tsconfig.e2e.json`
(clean), `scripts/claims-gate.mjs` → `PASS — 0 unverified claims across 27 rules`.

### The "fails together, passes apart" reading — I accept it in part, and I can now name a mechanism

`visual-1440` failed once on its first full run, then passed on re-run. The
failing test was my own armed control,
`qa-f4-font-guard.spec.ts:65`, and **the error was not a timeout**:

```text
Error: route.continue: Route is already handled!
   at visual/fonts.ts:146
```

`installFontRetry` (`e2e/visual/fonts.ts:133-146`) retries `route.fetch()` four
times and then falls through to an **unguarded** `await route.continue()`. When
the upstream font host is slow or flaky, that terminal call lands on a route
Playwright has already disposed, and a transient network condition is converted
into an opaque error that names `fonts.ts:146` and says nothing about fonts.

I verified the surrounding facts: `fonts.googleapis.com` and
`fonts.gstatic.com` both resolve and respond (DNS 0.02–0.04 s), and the font
guard passes **12/12** under `--repeat-each=3` in isolation at 1440.

So: **accepted** that the trigger is contention on the external font hosts under
load — that is advisory A3 showing itself, as the packet says, and my armed font
case is indeed the test most exposed to it. **Not accepted** as a complete
reading, because the unguarded fallback in `fonts.ts` amplifies and mislabels
it. And since *every* visual golden spec calls `installFontRetry`, this single
line is a better explanation for the roving `shell-golden` failure than
coincidence: the same hiccup can surface inside whichever spec happens to be
holding the route. That is a testable prediction, not a proven claim, and I flag
it as such.

I did **not** fix it: `e2e/visual/fonts.ts` is not mine to edit this round.

---

## 10. §3 — the gating mitigation, and the failure message

**Gating to `visual-1280` is sound, with one limit.** The static test
`the gate project still exists` is deliberately **not** gated, so it runs in all
four projects; renaming or removing `visual-1280` goes red everywhere. Verified
arithmetically: 6 gated tests (1 matrix + 2 occlusion + 3 census) skip in
375/768/1440 and run in 1280 — which is exactly the `6 skipped` / `+6 passed`
split the Orchestrator observed, and reproduced in §9. The limit it does **not**
cover is a deliberate partial run of only 375/768/1440, where the measured half
simply does not execute; but it is reported as `skipped`, not as passed, so it
is visible. That is inherent to gating and acceptable.

**The failure message is a fair objection and I uphold it.** Proven in §3: both
a header z-order change and a translucent band turn the ARMED assertion red, and
the message read:

> ARMED: the cursor layers reach the composited image at the viewport origin …
> Add [data-custom-cursor] to FOREIGN_OVERLAYS in e2e/visual/overlays.ts

The remediation is not wrong — adding the cursor would stop the baking — but it
names the cursor for a header regression and would send the next reader to patch
the symptom while the header change goes unexamined. **Hardening item**, not a
blocker: the assertion should also report the occluder's measured `z-index`,
`opacity` and rect, so the reader can see at a glance that the header moved.

**Scan holes I found and the Coder did not.** I attacked the pure detectors with
30 adversarial inputs (`p6` equivalent, run at node level). Three
under-detections — the dangerous direction:

| hole | measured | today |
|---|---|---|
| `readVisualSpecs` is a flat `readdirSync`, `testMatch` is recursive | a spec in `e2e/visual/<sub>/` **runs and is never scanned** | no subdirectory exists |
| the detector matches only the literal identifier `page` | `const p = page; expect(p)…` and the fixture rename `({ page: view })` both escape entirely | no visual spec does either |
| `isVisualProject` matches only strings starting with `visual/` | `**/visual/**`, `./visual/`, a RegExp `testMatch`, or a `testDir`-scoped project are all invisible → a fifth fine-pointer visual project would not appear in the pinned map **and** would get no occlusion test | config uses the one recognised spelling |

I closed the first two with tripwires (§12). The third I recorded rather than
tested, because asserting on hypothetical config spellings would pin
`playwright.config.ts`'s style rather than its meaning.

One over-detection, harmless in direction but worth knowing: the detector reads
string literals, so **any spec that merely names the baseline API in a failure
message gets flagged**. It cost me a red run — see §12.

---

## 11. §11 — `Z.header` vs `--gnav-z`, confirmed and assigned

`src/styles/z-index.ts:10` declares `header: 50`. `src/styles/navigation.css:34`
declares `--gnav-z: 10000`, consumed at `navigation.css:48`. `CLAUDE.md` names
`z-index.ts` as the single source of truth.

Measured: `Z.header` has **zero consumers** — the whole `Z` object is imported by
exactly two files, `PageTransition.tsx:5` and `CustomCursor.tsx:52`, and neither
reads `header`. So the registry's header entry is dead and the real value is a
CSS custom property 200× larger. Confirmed pre-existing and outside Phase 07.

**Owner: Phase 15 — AWWWARDS POLISH, FINAL CREATIVE REVIEW AND RELEASE QA**
(`IMPLEMENTATION.md:1033`), which `IMPLEMENTATION.md:1131` already maps to
"Optical polish/system". Phase 02 authored the token file and is the origin, but
it is closed; Phase 15 is the last phase that owns system coherence before the
Phase 16 freeze. The same packet should take `CustomCursor.tsx:78` (§8).

---

## 12. What QA added, and two mistakes of my own

`e2e/visual/qa-h4-cursor-independent.spec.ts` — **2 tests**, ungated, cheap,
deterministic, closing the two scan holes above. Both green in all four projects.

I record two errors of my own, because both are findings about the Coder's
detectors rather than incidents:

1. **My first draft named the baseline-comparison API inside a failure message**
   and, because the draft also used a whole-page capture option, the Coder's
   detector flagged **my file** and would have turned its guard red. Caught
   before commit by running the detector over the spec directory. The file now
   refers to the API by description. This is the same trap the Coder documented
   for `SYNTHETIC_CAPTURES`, and it is load-bearing evidence that the trap is
   real and not hypothetical.
2. **My first whole-page counterfactual had no stabilisation.** Its own
   determinism control came back at **150 688 differing pixels between two
   consecutive frames** — noise far larger than the ~500 px the cursor could
   contribute. I did not report the number it produced. After adding a
   three-consecutive-identical-frames stabiliser it converged (§6). I then
   **removed the test from the suite**: under full-suite load it could not reach
   three stable whole-page frames at 1440 within fourteen captures, i.e. it was
   flaky — passing alone, failing in the suite — and reduced to a stable form it
   becomes a clipped 64×64 comparison that `cursor-overlay-guard.spec.ts`
   already makes, with the same red control. Shipping it would have added a
   flake and no coverage. **This is not coverage deleted to turn red into
   green**: the finding it produced is recorded in §6 with its raw numbers in
   `reports/qa/phase-07c4/run11-annotations.json`, and it duplicated an existing
   green assertion rather than protecting anything new.

---

## 13. Commands run

```text
npm run build                                                     # exit 0
npx tsc --noEmit -p tsconfig.e2e.json                             # clean
node scripts/claims-gate.mjs                                      # PASS 0/27
npx vite preview --port 4917                                      # this tree's dist, byte-verified

npx playwright test --project=visual-1280 e2e/visual/cursor-overlay-guard.spec.ts   # 7 passed
npx playwright test --project=visual-1280 e2e/visual/radius-census.spec.ts          # 3 passed
npx playwright test --project=visual-375 | --project=visual-768
                     | --project=visual-1280 | --project=visual-1440                # per project, §9
npx playwright test --project=visual-1440 e2e/visual/qa-f4-font-guard.spec.ts --repeat-each=3  # 12 passed

# falsification, against a MUTATED COPY of dist/ served on :4918 — no repo file edited
#   --gnav-z 10000 -> 5            => ARMED red   (run2)
#   header alpha .98 -> .30        => ARMED red   (run3)
#   MOBILE_BREAKPOINT 768 -> 901   => matrix red  (run4), census red (run6)

node reports/qa/phase-07c4/probes/p1-matrix.mjs                   # ten cells, two routes
node reports/qa/phase-07c4/probes/p2-occlusion.mjs                # corner + banked goldens
node reports/qa/phase-07c4/probes/p3-pointer-loss.mjs             # §2.5, pointer moved
node reports/qa/phase-07c4/probes/p4-foreign-overlay-counterfactual.mjs
node reports/qa/phase-07c4/probes/p5-fullpage-mutation.mjs
node <scratch>/attack-detectors.mjs                               # 30 adversarial inputs
```

---

## 14. Scope integrity — PASS

- **Production files modified by QA: NONE.** `git status --porcelain` shows no
  tracked file outside `reports/qa/**` and my own spec, at every checkpoint.
- Coder-owned test files (`e2e/visual/cursor-overlay*.ts`, `radius-census*.ts`,
  `overlays.ts`) were **read, run and attacked, never edited**. Every
  falsification was injected into a copy of the build artefact instead.
- No golden was written, updated or regenerated. No tolerance was widened, no
  skip or xfail added, no assertion weakened.
- Files I wrote: `e2e/visual/qa-h4-cursor-independent.spec.ts`,
  `reports/qa/phase-07.md`, `reports/qa/phase-07c4/**`; `reports/qa/phase-07.md`
  (round 3) preserved as `reports/qa/phase-07-round3.md`.
- Never pushed, never merged, never touched `main`.

---

## 15. OPEN ITEMS — the complete list

Carried from earlier rounds and unchanged:

- **A3 (advisory, open)** — visual goldens depend on the live external hosts
  `fonts.googleapis.com` / `fonts.gstatic.com`. Confirmed again this round as
  the trigger for the combined-run flake (§9).

New this round:

| id | item | severity | owner |
|---|---|---|---|
| **N1** | At ≥901 px with a fine pointer there is **no visible pointer over the 72 px fixed header band**: `cursor: none` applies, the replacement is occluded by `--gnav-z: 10000`. The `:has([data-custom-cursor])` gate checks existence, not visibility. Measured 0 px replacement contribution inside the band, 292 px below it. | **usability, high** — not a WCAG SC failure | **Phase 13** |
| **N2** | Between 768 and 900 px with a fine pointer **both pointers are drawn**: the component mounts at 768, `cursor: none` starts at 901. Same root cause as N1 — two breakpoints 133 px apart that were meant to be one. | usability, medium | **Phase 13** |
| **N3** | `installFontRetry` (`e2e/visual/fonts.ts:146`) has an **unguarded terminal `route.continue()`**. A slow font host becomes `route.continue: Route is already handled!`, attributed to `fonts.ts` with no mention of fonts. Every visual golden spec installs this handler, so it is the most likely single explanation for the roving combined-run failures. | test-infra, medium | **Phase 13** (or whichever packet next touches `e2e/visual/fonts.ts`) |
| **N4** | `isVisualProject` recognises only `testMatch` strings beginning `visual/`. `**/visual/**`, `./visual/`, a RegExp, or a `testDir`-scoped project are invisible — such a project would escape both the pinned pointer map and the derived occlusion matrix. | hardening | future phase adding a visual project |
| **N5** | The ARMED occlusion failure message names the cursor for what may be a **header** regression. Should report the occluder's measured `z-index`, `opacity` and rect. | hardening | future phase |
| **N6** | `pageScopedGoldenSpecs` reads string literals, so a spec that merely *names* the baseline API in a failure message is flagged. Over-detection (safe direction), but hostile to specs that document the rule. | hardening | future phase |
| **N7** | `citationDeclaresRadius` uses `some()` over the cited range, so a deliberately wide citation (`1-400`) passes trivially. Narrow today. | hardening | future phase |
| **N8** | `CLAUDE.md:48` and `MASTER_CONTEXT.md:170` still state the retired `>901px` mount threshold. DO_NOT_TOUCH this run; nothing shipped reads them. | docs, low | whichever phase may edit them |
| **N9** | `BrutalCrosshairCursor` is a **phantom**: never present in git history on any ref, yet named in `CLAUDE.md:49`, `docs/lean/09-responsive-rules.md:85,127`, `docs/lean/11-app-architecture.md:55`, `docs/lean/12-folder-structure.md:65`, `docs/lean/task-backlog.md:48`, `ROADMAP.md:61`. | docs, low | doc-hygiene packet |
| **N10** | `src/components/ui/CustomCursor.tsx:78` still says "`Z.cursor` is 90 … referenced by nothing and wants correcting". `src/styles/z-index.ts:25` is now `cursor: 101`. The docblock describing the problem outlived the fix. | docs-in-src, low | **Phase 15** (with N11) |
| **N11** | `Z.header: 50` (`src/styles/z-index.ts:10`) has **zero consumers**; the real header z is `--gnav-z: 10000` (`src/styles/navigation.css:34,48`), contradicting `CLAUDE.md`'s single-source-of-truth rule. Pre-existing, outside Phase 07. | system coherence, medium | **Phase 15** |
| **N12** | Visual specs must stay flat and must not rename the `page` fixture, or the Coder's scan silently under-covers. Now enforced by two tripwires in `e2e/visual/qa-h4-cursor-independent.spec.ts`. | enforced | — |

Nothing above blocks Phase 07. N1/N2 are the only product defects, both
pre-existing, neither introduced nor touched by this phase, and both assigned.

---

## 16. Verdict

Packet #3 does what §10 required: the threshold that three rounds of prose got
wrong is now an assertion that goes red when the claim is made true, and §4's
register is regenerated from the browser rather than typed. I broke both guards
deliberately, three ways, without editing a single repository file, and both
failed the way they should. The one factual claim in the Coder's refusal that
was checkable turned out to be wrong, and the refusal is still correct for a
better reason. My own two mistakes are recorded above rather than buried.

**VERDICT: PASS**
