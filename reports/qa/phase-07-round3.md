# QA Report — Phase 07 (Inner Pages Wave A) — round 3, narrow confirmation of correction packet #2

- PHASE: 07
- CODE_COMMITS: `93b77bc` (H3), `3b8fcdc` (H1), `0898f66` (H6), `9b4f312` (H4+H5),
  `f14e194` (F5-R), `23cbc63` (self-retraction) — integrated tree `7bdd587`.
  Reference trees: packet-1 close `6f37eb0`, Phase 06 close `d1ed8e3`,
  pre-run base `19f30f5`.
- QA_COMMIT: last commit on `wt/qa-p07c2` (this branch)
- STATUS: **FAIL** — narrowly, on **H4**. Five of the six items close cleanly, the
  self-retraction verifies TRUE, and nothing closed in round 2 has moved.
- TESTS_PASSED: **263** — visual 100/100 (was 96; I added one test that runs in
  four projects) + critical 163/166, all re-run against my own build of `7bdd587`
- TESTS_FAILED: **0 attributable to the tree.** Two environmental failures
  occurred in one visual run and both passed on immediate re-run — root cause
  identified and reported under "F4's guard is not hermetic". The finding that
  drives this FAIL is a false statement written into a guard file and into
  `docs/lean/17`, not a red test.
- TESTS_SKIPPED: 3 (pre-existing skips in `critical-*`)
- NEW_TESTS_ADDED: **1** (`e2e/visual/qa-a2-overlay-guard.spec.ts` — the H5 lock;
  4 executions, one per visual project)

Round-2 report preserved at `reports/qa/phase-07-round2.md`; round 1 at
`reports/qa/phase-07-round1.md`. Round-3 evidence: `reports/qa/phase-07c3/`.

---

## Verdict in one paragraph

H3, H1, H6, H5 and the self-retraction are all confirmed by independent
measurement with red controls, and the F5-R **table** is complete — my own
census reproduces it element for element at both censused widths. H4 is not.
The commit replaced a wrong reason with a reason that is right in two of its
three legs and **false in the first**: `CustomCursor` does not "not mount below
901 px". Its guard is `isMobile || !finePointer`, `useIsMobile` is
`width < 768`, and there is no `901` anywhere in the component — 901 is the
breakpoint of a `cursor: none` rule in `src/index.css`, a different rule in a
different file. Measured: **at 768 px and at 900 px with a fine pointer, both
cursor layers mount on all six rebuilt routes**, parked at (-3,-3) and
(-22,-22) exactly as at 1280. The same false threshold is repeated in
`docs/lean/17` §4 and, worst, in the forward instruction `overlays.ts` gives to
future phases — which therefore tells the next phase that a full-page capture
below 901 px is safe. It is not, and following that instruction reintroduces
the exact 25-baseline defect A2 removed.

---

## Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| F5-R | `docs/lean/17` §4 register is **complete**, not merely larger | **PASS (table)** | My own census, six routes x {375, 1280}, `reducedMotion: reduce`, full scroll pass, run once with **no pointer** and once with the pointer moved: **6 distinct class signatures, 9 distinct (class, size) signatures, 52 radius elements**, identical both ways. Every table row reproduces exactly. `phase-07c3/out/radius-nopointer.json`, `radius-pointer.json`, probe `probes/r3-radius.mjs` |
| F5-R | the register's exclusion criteria are not doing hidden work | **PASS** | The probe counts what `display:none / visibility:hidden / opacity:0 / zero-box` removes: **0 elements**. The criteria drop nothing. |
| F5-R | source-line and provenance attributions | **PASS** | `MaterialMorphScroll.tsx:228/357/359`, `ChatBot.tsx:225`, `CustomCursor.tsx:194-207` and `209-221` all exact (the ring's opening tag closes at 222, not 221 — cosmetic). `98e64ab` and `7a5daf0` are **blob** hashes, and `git rev-parse HEAD:...` and `d1ed8e3:...` return them for both files: byte-identical to the Phase 06 close, exactly as claimed. `git diff d1ed8e3 HEAD -- MaterialMorphScroll.tsx` touches no radius line. |
| F5-R | "a census run only at 375 finds four sources" | **FAIL (minor)** | It finds **two**: the step meter and the launcher. The two property-meter sites are 1280-only *as well as* the two cursor layers, so 6 − 2 = 4 is the wrong subtraction. Measured both ways in `radius-nopointer.json`. The *warning* the sentence carries ("375 alone is not enough") survives; the number does not. |
| F5-R | "...and so is anything a mounted component paints, **at every width where it mounts**" | **FAIL** | Not met. At **768 px with a fine pointer** both cursor layers mount on all six routes and appear in no row of the table; they are excluded on a stated ground that is false. `phase-07c3/out/radius-768.json`, probe `r8-radius-768.mjs` |
| H3 | new rule `periodic-volume-disclosure`, red-then-green | **PASS** | 24 periodic forms: **23 SILENT on the pre-C2 gate, all 24 FIRE on the new one**; the 24th (`1000+ ünite/gün`) fired pre-C2 only on an unrelated company-scale alternative, never on the periodic class. `out/h3-OLD.json` vs `out/h3-NEW.json` |
| H3 | 12 live carriers over `d1ed8e3`, 32 over `19f30f5` | **PASS** | Exactly 12 and exactly 32, all in `src/data/servicePages.ts`, including the two rows F1 removed (`:2101`, `:2102`) and ten more. `out/setdiff-d1.json`, `out/setdiff-19.json` |
| H3 | the five alternatives, plus the normaliser's hardening | **PASS** | Denominator, adverb, adjective, trailing period and `{label,value}` pair all fire; and because the rule is a `pattern` rule it inherits the normaliser, so the shouted (`YILDA 50.000 ADET`), zero-width-split, HTML-entity, string-concat, `${}`-interpolation and Cyrillic-homoglyph forms all fire too. 24/24. |
| H3 | `saat` exclusion is the right line, drawn in the right place | **PASS — adjudicated** | Counterfactual gate with `saat` added, run over the real tree: **1 hit, `servicePages.ts:471` `["Kavite", "Çevrim/Saat", "Parça/Saat", ...]`** — exactly the row claimed. The rule requires no digit (deliberate, F2 HOLE 2), so `saat` cannot be admitted without either re-opening that hole or bolting on an exemption. The calendar subset is defensible and is documented with its reason. `out/CFsaatxHEAD.json` |
| H3 | `kapasite` exclusion on the label side | **PASS — adjudicated** | Counterfactual with `kapasite` added: **1 hit, `servicePages.ts:63` `{ label: "Takım Kapasitesi", value: "30-120 adet (otomatik)" }`** — a tool magazine, a machine envelope. Exactly as claimed. `out/CFkapxHEAD.json` |
| H1 | company-scale nouns reach the intervening-adjective alternative, with a live carrier | **PASS** | The carrier is real: `src/pages/Hakkimizda.tsx:29` `50+ deneyimli mühendis`, **silent on the pre-C2 gate, firing now**, and it is the single `company-scale-disclosure` gain in the `19f30f5` set diff. Eight forms go SILENT to FIRE. `out/h1-OLD.json` vs `out/h1-NEW.json` |
| H1 | the documented `{0,2}` adjective limit | **PASS** | `8+ tam otomatik makine` fires; `8+ tam otomatik beş eksenli makine` (three intervening words) is silent. |
| H6 | chip census: 48 rows before and after, 69 to 71 chips, exactly two rows change | **PASS** | Re-derived from the **rendered DOM** of my own build over all 15 category routes: 48 primary rows both sides, **69 to 71**, **2 rows changed** — `Makine Parkuru` gains `3, 4 ve 5 eksen`, `Güç Dağıtım Sistemleri` gains `Cu (OFE, ETP), Al 1050`. `out/chips-AFTER-H6.json` vs round-2 `phase-07c1/f1/chips-after.json` |
| H6 | nothing withheld leaks back in through the widened grade class | **PASS** | Stronger than the claimed check. Both filter revisions lifted verbatim from their own `claims.ts` and run over **every one of the 294 `{label, value}` pairs in `src/`**, not just the 48 listed rows: **7 newly admitted, 0 revoked**, and all 7 are grade lists or axis counts. Separately, all **11** withheld classes over all **71** rendered chips: **0 trips**. `out/filterdiff.json`, probe `r2-filterdiff.mjs` |
| H6 | the `/malzemeler` correction — I was wrong on surface | **PASS — Coder correct** | `categoryPages.ts:79` points the "Malzeme Kütüphanesi" row at `/malzemeler`, which has no `servicePage`; the `Sürekli Stok` pairs live on `servicePages.ts:1543` slug `malzeme-kutuphanesi`, which **no listing row targets** (only `ia.ts:143` links it). The row is chipless for an unrelated reason. My round-2 attribution was wrong; the substance (the unqualified stock rule suppressed a grade list) was right, and the stock qualification and the widened grade class are jointly necessary for that pair. |
| H4 | at 375 `CustomCursor` returns null; at 1280 both layers `opacity: 1` at (-3,-3) 6x6 and (-22,-22) 44x44 | **PASS** | Exactly. No pointer ever moved: **0 cursor layers at 375 on all six routes; 12 at 1280 (2 x 6 routes), `opacity: 1`, dot 6x6 rect (-3,-3) with 9 px inside the viewport, ring 44x44 rect (-22,-22) with 484 px inside**. The old reason was indeed false. `out/radius-nopointer.json`, probe `r4-cursorcolour.mjs` |
| H4 | leg 3 — "QA's exact-colour scan over all 100 goldens finds zero cursor pixels" | **PASS — and it needed checking** | My round-2 scan targeted the **launcher's** colour, so the citation is only honest if the dot paints the same colour. It does: both are `rgb(10, 125, 138)`. Over the 100 committed goldens: **exact = 0, tight = 0, maxRun = 1**, against a positive control at **exact = 172, maxRun = 52**. The citation holds. |
| H4 | leg 1 — "below 901 px there is nothing to hide (the component does not mount)" | **FAIL** | False. See "Failed checks". |
| H5 | the `require: false` waiver is derived, not trusted | **PASS** | Both implementations compiled from their real sources with esbuild and driven side by side against the same build: **OLD 3/5, NEW 5/5**, with `/hakkimizda` and `/malzemeler` + `require:false` going **`resolved(1)` to THROWS**. `out/overlays-control.json`, probe `r5-overlays.mjs` |
| H5 | the call-site shape is unchanged, so my guard spec needs no edit | **PASS** | All five call sites unchanged; `shell-golden.spec.ts:52` still passes `require: surface.path !== "/"`. My spec passed unmodified in the 96/96 run. I added one test anyway, to lock H5 rather than leave it uncovered. |
| H5 | the `about:blank` residual — is loud acceptable? | **PASS — adjudicated** | Measured: on `about:blank` the new file throws under `require:false`, **and both the old and the new file throw under `require:true`** (no launcher there either). H5 therefore adds **no new silent mode** and no new failure a caller could hit without already being broken. All five call sites are after `gotoAndSettle`. Loud is correct. |
| 23cbc63 | the self-retraction is itself true | **PASS — verified on the old gate** | The pre-C2 gate spells the noun `çalışan` **unfolded** at lines 677, 681, 709, 710, 716, 733, and those alternatives match both `120+ çalışan` and `120+ ÇALIŞAN` in my probe. So the claim in `0757365` — that the unfolded spelling is dead against I-folded text — was false, and the retraction is correct: `rule.pattern = trPattern(rule.pattern)` folds every rule centrally, folding is idempotent, and `alaş[ıi]m` was never needed either (`15+ alüminyum alaşımı` and `15+ ALÜMİNYUM ALAŞIMI` both fire). |
| §4 | anti-laundering, `rule@file:line` SET diff over both trees | **PASS** | `19f30f5`: **801 to 834, LOST 0**, gained 33 (32 periodic, 1 company-scale). `d1ed8e3`: **12 to 24, LOST 0**, gained 12. Re-derived with my own scanner, which reproduces the official gate exactly (27 rules / 209 files / 26,633 lines / 0). `out/setdiff-19.json`, `out/setdiff-d1.json` |
| §4 | negative controls still silent on **both** gates | **PASS** | All 19 named controls plus 5 more: `60+ HRC`, `1100+/950+ MPa`, `1.000.000+/500.000+/10.000+ çevrim`, `500+ saat (ASTM B117)`, `1000+ saat tuz testi`, `1000+ otoklav döngüsü`, `16+ kavite`, `2000N+`, `25+ yıl`, `5 eksen`, `3 vardiya`, `2 iterasyon`, `CT4-CT6`, `dE <= 2.0`, `+/-0.01mm`, `1 adet`, `10-500 adet`, `Parça/Saat`, `Takım Kapasitesi` — **24/24 SILENT on the old gate and on the new one**. |
| §4 | H2 left alone; no rule narrowed anywhere to silence it | **PASS** | Rule-text comparison, not hit counts: **25 of 26 rules byte-identical**, the 26th widened with every old fragment retained, **1 rule added, 0 removed, 0 `scan` functions changed**. The only narrowing in the packet is the deliberate H6 stock qualification in `claims.ts`, and the gate still fires on all four stock-tonnage shapes at source. `out/narrowing.json` |
| §3 | sweep the other 26 rules for the `\b` ASCII defect | **PASS — no live carrier** | Differential, not by inspection: every `\b` in every `pattern` rule replaced by a Turkish-aware boundary, all three trees re-scanned. **HEAD 0 to 0, `d1ed8e3` 24 to 24, `19f30f5` 834 to 834.** A static analyzer, red-controlled on injected `\bünite`, `sipariş\b` and `\b(?:çeşit|çalışan)`, finds **0 of 89** sites adjacent to a non-ASCII Turkish letter. The gate already handled the class once, in a prior phase, at `claims-gate.mjs:1196`. Details and the one latent site in `claims.ts` under "Notes". |
| §4 | nothing closed in round 2 has regressed | **PASS** | `claims-gate` PASS 0/27 over 209 files / 26,633 lines · `grid-axis-probe` PASS · `motion-audit --mode=guard` PASS · `--mode=rest` PASS, 12 pairs all zero · `typecheck` PASS · `test:e2e:visual` **100/100** · `test:e2e:critical` **163 passed / 3 skipped** · `git diff 6f37eb0..HEAD -- e2e/__golden__` **empty** · `git status e2e/__golden__` clean after every run. All run against my own preview of `7bdd587`. |

---

## Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| **H4-R1** — `e2e/visual/overlays.ts`, leg 1 of "THE REASON IT NEVERTHELESS HOLDS" | The file states "below 901 px there is nothing to hide (**the component does not mount**), which covers the 375 and 768 goldens outright". Measured on `/hakkimizda`, `reducedMotion: reduce`: **768 px + fine pointer gives 2 cursor layers; 900 px + fine pointer gives 2 cursor layers.** Extended to all six rebuilt routes at 768 with a fine pointer: **both layers on all six**, rects (-3,-3) 6x6 and (-22,-22) 44x44 — identical to 1280. | `CustomCursor`'s guard is `isMobile \|\| !finePointer` (`src/components/ui/CustomCursor.tsx:189`); `useIsMobile` is `width < 768` (`src/hooks/use-mobile.tsx:3`). There is no `901` in the component. 901 is the breakpoint of the `cursor: none` rule in `src/index.css:786`, a different rule in a different file, and the two were conflated. The 375 and 768 goldens are in fact safe because `playwright.config.ts` configures both projects `isMobile: true, hasTouch: true`, which makes `(pointer: fine)` **false** — a true, checkable reason the file does not give. | **Yes** — `e2e/visual/overlays.ts` (comment) |
| **H4-R2** — the forward instruction in the same file | "A FULL-PAGE capture at >=901 px, or any element crop that includes the viewport's top-left corner, WILL bake both layers in. If a golden is ever added under either shape, add `[data-custom-cursor]` here." This tells a later phase that a full-page capture **below** 901 px is safe. It is not: at 768-900 px with a fine pointer both layers paint 3x3 and 22x22 px at the origin. A later phase that adds a non-touch visual project in that band and follows this rule reintroduces exactly the defect A2 removed — 25 baselines with a foreign fixed overlay in them — **by following the corrected file's own instruction**. | Same conflation. The correct threshold is ">=768 px **with a fine pointer**" — or, better, no width at all: the observable condition is whether `[data-custom-cursor]` is present in the context being captured. | **Yes** — `e2e/visual/overlays.ts` (comment) |
| **H4-R3 / F5-R** — `docs/lean/17` §4 repeats the same false threshold | "Both cursor layers are on all six routes at 1280 and on **none** at 375, because `CustomCursor` returns null below 901 px". The measured half is right; the stated reason is not. And §4 promises to list "anything a mounted component paints, **at every width where it mounts**" while omitting the 768-900 fine-pointer band, where both layers mount on all six routes. | Same. | **Yes** — `docs/lean/17-inner-page-composition.md` §4 |
| **F5-R-R4** — `docs/lean/17` §4, "a census run only at 375 finds **four** sources and thinks it is finished" | It finds **two** — the step meter (`MaterialMorphScroll.tsx:228`) and the launcher (`ChatBot.tsx:225`). The property-meter track and fill are 1280-only too, not just the cursor layers. | 6 sources minus 2 cursor layers = 4 is the wrong subtraction: four of the six are absent at 375, not two. | **Yes** — `docs/lean/17-inner-page-composition.md` §4 (one word) |

All four are one-sentence corrections in two files, both already inside this
packet's scope. None is a code change, and none makes any current golden, gate
or suite wrong today — every suite is green and no golden is contaminated
(0 exact-colour cursor pixels across all 100).

### Why this is a FAIL and not a carry

Because the acceptance criterion for H4 is *"state the reason the cursor
exclusion **actually holds**"* — that is the commit's own title — and one third
of the stated reason does not hold. This is the **third** wrong reason in this
one file: the original ("paints nothing until a real pointer moves"), which QA
caught in round 2, and now the replacement's first leg. The run has
consistently treated a false claim about the machinery as a defect in its own
right — the Coder did so itself in `23cbc63`, retracting a claim of exactly this
shape, and the Orchestrator promoted H4 into scope for precisely this reason.
Applying a weaker standard to the Coder than the Coder applies to itself would
not be a verification.

It is also not merely descriptive. The false threshold is the operative rule
this guard file hands to future phases, and it is wrong **in the unsafe
direction, by 133 px**, with a named and plausible trigger: a half-screen
browser window on a 1600-wide display is 800 px, and a non-touch visual project
in that band is a normal thing for a later phase to add.

---

## Commands run

```text
# instrument validation — my scanner must reproduce the official gate exactly
node reports/qa/phase-07c3/probes/scan.mjs .../gate-NEW.mjs .  -> 27 rules, 209 files, 26633 lines, 0 hits
node scripts/claims-gate.mjs                                    -> PASS — 0 across 27 rules (same numbers)

# anti-laundering, old gate (6f37eb0) vs new (7bdd587), rule@file:line SET diff
scan.mjs gate-OLD .../tree-19f30f5   -> 801     scan.mjs gate-NEW .../tree-19f30f5   -> 834
scan.mjs gate-OLD .../tree-d1ed8e3   ->  12     scan.mjs gate-NEW .../tree-d1ed8e3   ->  24
setdiff.mjs  19f30f5: 801 -> 834  LOST=0  GAINED=33 {company-scale:1, periodic:32}
setdiff.mjs  d1ed8e3:  12 ->  24  LOST=0  GAINED=12 {periodic:12}

# H3 / H1 / negative controls, both gates
probe.mjs gate-NEW set-h3.json  -> 48 probes, 48 as-expected, 0 mismatch
probe.mjs gate-OLD set-h3.json  -> 48 probes, 25 as-expected  (23 red-control mismatches, all FIRE->SILENT)
probe.mjs gate-NEW set-h1.json  -> 16/16      probe.mjs gate-OLD set-h1.json -> 8/16
probe.mjs gate-NEW set-attack.json  -> 20 evasion probes (see Notes)
probe.mjs gate-NEW set-h6gate.json  -> 7/7

# the two deliberate exclusions, as counterfactual gates over the real tree
mkcounterfactual.mjs +saat      -> 1 hit: servicePages.ts:471 [Parça/Saat]
mkcounterfactual.mjs +kapasite  -> 1 hit: servicePages.ts:63  [label: "Takım Kapasitesi", value: "30-120 adet"]

# the \b class sweep
bsweep.mjs  (every \b -> Turkish-aware boundary, all pattern rules; 89 boundaries, 16 rules)
   HEAD 0->0    d1ed8e3 24->24    19f30f5 834->834      LOST=0 GAINED=0 on all three
bstatic.mjs gate-NEW      -> 89 \b sites, 0 adjacent to a non-ASCII Turkish letter
bstatic.mjs gate-RC-b     -> 93 sites, 3 flagged  (red control: the analyzer works)

# anti-narrowing at rule-text level
r6-narrowing.mjs -> 26->27 rules; 25/26 IDENTICAL; 1 WIDENED (all old fragments retained); 0 removed

# H6 — chip census and leak hunt
r1-chips.mjs (rendered DOM, 15 category routes) -> 48 rows, 71 chips  (round 2: 48 rows, 69 chips)
r2-filterdiff.mjs OLD NEW -> 294 label/value pairs; 132 -> 139 publishable; ADMITTED 7, REVOKED 0
11 withheld classes x 71 rendered chips -> 0 trips

# F5-R — the radius census
r3-radius.mjs                 -> 6 class sigs, 9 (class,size) sigs, 52 elements, 0 excluded
QA_POINTER=1 r3-radius.mjs    -> identical
r7-cursor-breakpoint.mjs      -> 375 touch 0 | 768 touch 0 | 768 MOUSE 2 | 900 MOUSE 2 | 1280 MOUSE 2
r8-radius-768.mjs             -> 768 touch: 5 sigs, 0 cursor | 768 mouse: 7 sigs, 2 cursor, all six routes

# H4 / H5
r4-cursorcolour.mjs -> launcher bg === dot bg (rgb(10,125,138)); dot 9 px, ring 484 px inside the viewport
round-2 launcher-scan.json re-read -> 100 goldens: exact 0, tight 0, maxRun 1; control exact 172, maxRun 52
r5-overlays.mjs -> OLD 3/5, NEW 5/5; about:blank throws under require:false AND require:true

# regression, all against my own preview of 7bdd587 (PLAYWRIGHT_BASE_URL=http://localhost:4917)
npm run build                              -> exit 0
npm run typecheck                          -> exit 0
node scripts/grid-axis-probe.mjs           -> PASS
node scripts/motion-audit.mjs --mode=guard -> PASS
node scripts/motion-audit.mjs --mode=rest  -> PASS, 12 pairs, all hidden/hiddenText/partialText = 0
npm run test:e2e:visual                    -> 96/96 (before my added test)
npm run test:e2e:visual                    -> 98 passed / 2 failed, both fonts.gstatic.com, environmental
npx playwright test ...inner-pages-golden -g "opens and closes" -> 14 passed (the two, green)
npm run test:e2e:critical                  -> 163 passed, 3 skipped
npx playwright test ...qa-a2-overlay-guard.spec.ts (4 projects) -> 20 passed (5 tests x 4)
git diff 6f37eb0..HEAD -- e2e/__golden__   -> empty
git status --porcelain e2e/__golden__      -> clean after every run
```

A note on instruments, since the Orchestrator's first H3 attempt was invalidated
by one: I did **not** copy `claims-gate.mjs`. `probes/mklib.mjs` truncates any
revision of it at the `file walk` banner — everything above which is pure
definition and never touches `REPO_ROOT` — and exports the rule table. The tree
root is then passed to the scanner as an argument. That is why the same probe
can scan three trees with two gate revisions, and why it cannot report
`scanned: 0 files`. It is validated against the real gate on the real tree:
27 rules, 209 files, 26,633 lines, 0 violations — identical.

I also ran every browser measurement against a preview on **port 4917**. Ports
4173 and 4183 were already occupied by other agents' servers in this run, and a
census taken against someone else's bundle is not evidence about this tree.

---

## Scope integrity

- Production files modified by QA: **NONE**. `src/`, `scripts/`, `docs/`,
  `e2e/__golden__/`, `playwright.config.ts`, `package.json`, `PROGRESS.md`,
  `USER_INPUTS.md`, `IMPLEMENTATION.md` all untouched by me.
- No golden regenerated, no tolerance changed, no assertion weakened, no skip or
  xfail added, no coverage deleted. `git status e2e/__golden__` is clean after
  every suite run, and `git diff 6f37eb0..HEAD -- e2e/__golden__` is empty.
- Test/report files modified by QA: `reports/qa/phase-07.md` (this file),
  `reports/qa/phase-07-round2.md` (round 2, preserved before overwrite),
  `reports/qa/phase-07c3/` (probes, libraries, evidence), and
  `e2e/visual/qa-a2-overlay-guard.spec.ts` — my own spec, one test added and its
  header corrected because H5 closed the hole the header said was open.
- The copies under `reports/qa/phase-07c3/lib/` are read-only derivatives of
  `scripts/claims-gate.mjs`, `src/content/claims.ts` and `e2e/visual/overlays.ts`
  at two revisions each, plus two counterfactual and one red-control variant.
  They exist so the measurements are reproducible; nothing in the app imports
  them.

---

## Notes

### The `\b` class defect — carried, not a Phase 07 finding

The Coder's discovery is correct and important: JavaScript's `\b` is ASCII-only,
so `ü ş ç ö ğ ı â` are not `\w`, and a `\b` next to one is dead. With `\b` the
new rule read `1000 ünite/gün` as SILENT. It was handled with `NB`/`NA`
lookarounds.

Swept as instructed, and the sweep is differential rather than by eye: every
`\b` in every `pattern` rule replaced by the Turkish-aware boundary, then all
three trees re-scanned. **Zero difference on all three, including the
834-violation pre-run base.** A static analyzer — red-controlled by injecting
`\bünite`, `sipariş\b` and `\b(?:çeşit|çalışan)` into a rule, which it catches —
finds **0 of 89** `\b` sites adjacent to a non-ASCII letter. The four
`scan`-only rules were read by hand: their `\b`s all sit next to ASCII
(`\b(?:her|tüm|bütün|...)`, `\bgüvence`, `\bakredite`, `eder\b`), and one of
them already solved this class in a prior phase — `claims-gate.mjs:1196`
explicitly writes `ı(?![\wçğıöşüâî])` instead of `\b`, with the reason.

So the class is real, the instrument was already partly aware of it, and there
is **no live carrier anywhere**. Per my own bar, not a Phase 07 finding.

**One latent site does exist, in the other instrument.** `src/content/claims.ts`
withheld class 1 is
`/\b(?:adet|ünite|parça|birim|palet|parti|sipariş)\s*\/\s*(?:yıl|ay|hafta|gün|saat|vardiya)/i`
— the `ünite` branch is dead behind that `\b` (every other branch starts with an
ASCII letter). It is covered today by withheld class 2
(`\b\d...(?:adet|ünite)\b`) whenever a digit precedes, and by class 3
(`kapasite|hacim|ciro`) for the labels that occur; the shape that would escape
(`{ label: "Çıktı", value: "ünite/gün: 1000" }`) exists nowhere and would fail
the build at the gate first. Worth fixing when that file is next opened.

### Evasions of the new rule — latent, none with a carrier

I attacked `periodic-volume-disclosure` with 20 evasions; 18 succeed. Every one
was then hunted for a live carrier in all three trees, and **none has one**:

- **Turkish suffixes on the count noun.** `yılda 50.000 adetlik`,
  `50.000 adettir`, `günde 1000 üniteyi`. The adverb/adjective/trailing
  alternatives end in `${NA}` with no `${TRW}*`, while the denominator
  alternative does allow the suffix — an asymmetry, not a decision. Every
  `aded[ie]` / `parçayı` in the tree is a lot-size or cost-per-unit sentence and
  correctly silent.
- **`{ label, value }` split across lines.** The pair alternative requires them
  on one line. No multi-line pair exists outside `admin/`, which the gate
  excludes.
- **`{ label: "Kapasite", value: "50.000 adet" }`** — bare `Kapasite` with no
  period word. This is the cost of the (correct) `kapasite` exclusion. The chip
  filter withholds it independently (`kapasite|hacim|ciro`), so it is
  double-covered on the listing surface, but the gate would not stop it entering
  the data.
- **Hourly throughput** (`saatte 500 adet`) — the cost of the (correct) `saat`
  exclusion.
- Synonyms and non-Turkish forms: `senede`, `her ay`, `units/year`, `/annum`,
  `50.000 adet-yıl`, `yılda 12.000 ton`.

None is a Phase 07 finding. All are worth a line in whichever phase next opens
the gate.

### Two latent leaks in the widened chip filter — both double-covered

Found by probing, not by reading; neither has a carrier among the 294 pairs:

- `{ label: "Hammadde Stoğu", value: "...toplam 1.200 ton" }` slips the qualified
  stock rule, whose window is `{0,40}` while the gate's equivalent is `{0,60}`
  and stops at a string-literal boundary. **The gate fires on it** (and on all
  four stock-tonnage shapes I tried), so such a row cannot exist without failing
  the build. Defence in depth holds, and the Coder's "qualified the same way it
  is there" is true in kind, not in the window.
- `{ label: "Sipariş No", value: "MT 2024" }` is read as a material grade by the
  widened class `\b[A-Z][A-Za-z]{0,3}[\s-]\d{3,4}...`. That is a false *admit*,
  not a disclosure — it would print a meaningless chip, never a withheld one.

### F4's guard is not hermetic — new observation, reported not escalated

`e2e/visual/fonts.ts:170` asserts that `installFontRetry()` intercepted more
than zero requests on `fonts.gstatic.com`. That assertion depends on the
browser actually issuing those requests during the test. In one of my three
visual runs it did not, and two tests went red:

```text
[visual-375] inner-pages-golden.spec.ts:95  materials       -> intercepted 0 on fonts.gstatic.com
[visual-768] inner-pages-golden.spec.ts:95  material-family -> intercepted 0 on fonts.gstatic.com
```

Both passed on immediate re-run (`14 passed`), and the same suite was 96/96 an
hour earlier and 98/100 in the run that produced these, so the guard is not
broken — it is **non-hermetic**, and this run has already lost agents to a DNS
drop. The failure direction is the safe one (it goes red rather than quietly
passing), which is why this is an observation and not a finding. But a golden
suite whose green depends on reaching `fonts.gstatic.com` will cost the run
time again, and it is worth a decision: either warm the faces deterministically
before asserting, or scope the interception count to the first navigation in
the worker rather than every capture.

### Where I was wrong, and where the Coder was right

- **H6 surface.** My round-2 report attributed the chipless material-library row
  to the stock rule. It is chipless because `categoryPages.ts:79` points it at
  `/malzemeler`, which has no `servicePage`. The Coder's correction is right and
  mine was wrong on that point; the substance of H6 stood, and the two rendered
  chip gains are on different rows than the ones I named.
- **H4 leg 3.** I suspected the citation of my own scan was a mis-attribution,
  because that scan targeted the launcher. It is not: the dot paints the same
  colour, so the scan does exclude it. The Coder's citation is honest.
- **The provenance hashes.** I took `98e64ab` and `7a5daf0` for commit SHAs and
  went looking for a discrepancy. They are blob hashes, and they are exact.

That is now five times in this phase that a QA finding has been retired or
corrected in the Coder's favour.

---

## Still open after this phase — for `PROGRESS.md`

**Must be corrected before Phase 07 closes** (this is the FAIL):

1. `e2e/visual/overlays.ts` — leg 1 of the cursor exclusion, and the forward
   instruction, both assert a 901 px mount threshold the component does not
   have. True rule: the layers mount at **>=768 px with a fine pointer**; the
   375 and 768 goldens are safe because both projects are configured
   `isMobile: true, hasTouch: true`, i.e. coarse pointer.
2. `docs/lean/17` §4 — the same false threshold; plus "a census run only at 375
   finds four sources" (it finds two); plus the unmet promise to list every
   width where a mounted component paints.

**Carried, still open, not Phase 07's** (verified still carried this round):

- **A3** — three suites, three font policies. Phases 14/15.
- **A4** — the address expansion; adjudicated harmless, for the reason given in
  round 2.
- **A6** — the `/iletisim` Meet promise. Phase 09.
- **A8** — the register scrolls at 768. Phase 08.
- **The chat launcher obstruction itself.** Phases 09/13 — and note A2 makes it
  *more* visible now, because the goldens no longer hide it.
- **`motion-grammar:254` at `tablet-768` / `landscape-844`.** Pre-existing
  Phase 05, carried to Phase 13.
- **H7's counting drift.**
- **Phase 11** — roughly 48 detail routes now emit per-page titles.

**New this round, carried, with no live carrier** (each needs a home, none
blocks Phase 07):

- **The duplicate pointer at 768-900 px.** In that band with a fine pointer,
  `CustomCursor` mounts *and* `src/index.css:786`'s `cursor: none` does not apply
  (it needs >=901 px), so a real reader sees both the native cursor and the
  custom dot and ring. `CustomCursor.tsx` and `index.css` are byte-identical to
  the Phase 06 close, so this is **pre-existing, not Phase 07's** — but it is the
  behavioural half of the same 768/901 confusion, and it belongs to whichever
  phase owns the cursor and `index.css`. `CustomCursor.tsx`'s own header already
  flags that `index.css` rule as out of its packet.
- **The `\b` ASCII class**, one latent site in `src/content/claims.ts` (above).
- **18 latent evasions** of `periodic-volume-disclosure` (above).
- **Two latent leaks** in the chip filter, both double-covered by the gate
  (above).
- **F4's font guard is non-hermetic** and cost two red tests in one of three
  runs, both green on re-run (above). Fails in the safe direction; worth a
  decision, not a correction loop.
