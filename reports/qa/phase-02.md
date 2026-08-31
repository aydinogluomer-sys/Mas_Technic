# QA Report — Phase 02 · MASTER DESIGN SYSTEM + 12-COLUMN GRID RECONSTRUCTION

- PHASE: 02
- CODE_COMMITS: `28a4cfe`, `39bf6d9`, `5b82164`, `cfe5ad0`, `603965e` (HEAD `603965e`)
- BASE FOR DIFF: `9133415`
- QA WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p02` on `wt/qa-p02`
- QA_COMMIT: see `git log` on `wt/qa-p02` (report committed incrementally)
- **STATUS: FAIL**
- TESTS_PASSED: 67 · TESTS_FAILED: 1 · TESTS_SKIPPED: 3 · NEW_TESTS_ADDED: 0

> Tally: critical gate 63 passed / 3 skipped; visual gate 3 passed;
> `mobile-320` lane 1 passed + **1 failed** (F2). The two probe negative controls
> and the visual negative control are *deliberate* control failures and are
> excluded from the tally — they are evidence that the gates work, not defects.
- PORTS USED: Playwright `PLAYWRIGHT_PORT=4419`; probe `4199`; negative-control preview `4299` / `4399`; clean preview `4499`; dev server `5299`

> Written and committed incrementally. Nothing below is transcribed from the
> Coder's summary; every row names the command, file, measurement or image that
> produced it.

---

## 0 — Verdict at a glance

Phase 02's central claim is true and I verified it independently: the landing's
band geometry really is derived from one master 12-column system, the probe that
says so is **not** self-confirming, and the goldens really do diff. The static
gates, the critical gate and the visual gate are all green.

It fails on three specific, reproducible findings, all of which are Phase-02
material rather than carried-forward Phase 01 debt:

| # | Finding | Severity |
|---|---|---|
| **F1** | The mobile 02→03 process flow arrow is **still missing** at 320 and 375. The Coder documents this as a *measured fix* in `technical-landing.css:520` ("ölçüldü, 375px"); the fix does not take effect because the tablet rule out-specifies it. Visible in a screenshot. | **FAIL** — false measurement claim + shipping visual defect |
| **F2** | `e2e/landing/landing-grid-axes.spec.ts:142`, added by this phase, **fails at `mobile-320`**, a project in the repo's own regression matrix. It asserts `rail/width < 0.13`; the Coder's own docs state the value is 13.1%. Received `0.13125`. | **FAIL** — phase turns the regression suite red and contradicts its own docs |
| **F3** | S6's "band 01 header is the only remaining break" is **not true**, and `docs/lean/06-design-system.md` rule 2 ("nested blocks that still divide content are themselves subgrids") is contradicted by shipped code in at least four places. | **FAIL (AC9)** — doc asserts what code does not do |

Nothing here requires undoing the phase. All three are narrow, local corrections.

---

## 1 — Acceptance criteria matrix

| AC | Result | Evidence |
|---|---|---|
| **AC1** one documented master grid | **PASS** | `design-tokens.css` declares `--tl-rail / --tl-cols / --tl-gap / --tl-sheet-max` on `:root` and changes them **only** in its own two media queries; `master-grid.css` defines `.tl-band` = `var(--tl-rail) repeat(var(--tl-cols),minmax(0,1fr))` and `.tl-grid` = `grid-column:2/-1` + `subgrid`; `technical-landing.css:158-166` applies `.tl-grid`/`.tl-subgrid` to all 11 band bodies + 7 nested blocks. Probe measured 325 block edges across 5 widths, all on-axis. §2 |
| **AC2** no forbidden value survives as a live declaration | **PASS** | §3 — every one of `23.8% / 19.2% / 4.6% / 35%,65% / 48%,52% / repeat(6,1fr) 132px / 4fr 5fr 5fr / 43fr 77fr` appears **only** in `ÖNCESİ:`/`BEFORE:` prose. All 22 live `grid-template-columns` declarations enumerated and classified. |
| **AC3** dev overlay demonstrates shared axes and does not ship | **PASS** | `grep -ril "MasterGridOverlay\|grid-overlay" dist/` → empty over 367 files; also empty for `tl-grid-overlay`, `mas:grid-overlay`, `CTRL+ALT+G`. Under `npm run dev` the CTRL+ALT+G toggle mounts/unmounts the overlay and its drawn lines coincide with the real band boundaries on **all eight** named bands (worst Δ 0.11px @1280, ≤1px @375). Screenshot `reports/qa/tools/shots/overlay-1280.png`. §5 |
| **AC4** no tablet Process empty sixth column | **PASS** | Probe @768: `Process intro 57.00 (C0) → 412.00 (C3)`, `Process figure 412.00 (C3) → 767.00 (C6)`. 3 + 3 = all six tracks, zero gap. Visually confirmed: `reports/qa/tools/shots/process-768.png` — the figure now reaches the right sheet edge. §6 |
| **AC5** mobile rail 40–44px, well under 15% at 320 **and** 375 | **PASS** | QA-measured: **320 → 42.00px = 13.13%**, **375 → 42.00px = 11.20%**. Both in 40–44px, both under 15%. §7 |
| **AC6** typecheck / lint / build | **PASS** | All three exit 0. Lint: `0 errors, 1 warning`, and that warning is pre-existing at `9133415`. §8 |
| **AC7** critical gate + all Phase 01 guarantees | **PASS** | `63 passed, 3 skipped, 0 failed (5.7m)`. Every Phase 01 guarantee re-confirmed by name. 320 overflow is outside the suite's sweep constant, so I measured it: `scrollWidth == clientWidth` at all six widths. §9 |
| **AC8** visual gate + goldens genuinely diff | **PASS** | `3 passed (21.4s)` against the regenerated goldens; negative control against a 3px-perturbed `dist/` → **`3 failed`** with 145 690 / 116 501 / 125 624 diff pixels against a 200-pixel budget. §10 |
| **AC9** docs match shipped code | **FAIL** | Breakpoint table, band-composition table and `design-tokens.json` `$scope` all verified accurate. But `06-design-system.md` rule 2 and `13-forbidden-patterns.md` "Yerleşim `span N` ile yazılır" are contradicted by `.tl-nexus-kpis`, `.tl-rfq-body>ol`, `.tl-title-block` and tablet `.tl-part-passport`. §12 |

## 1b — Scrutiny-point matrix

| S | Result | Evidence |
|---|---|---|
| **S1** re-derive 184 → 0 | **0 VERIFIED · 184 CORROBORATED, NOT REPRODUCED** | I did not measure 184 and do not restate it as verified. I did measure **0** at HEAD myself, and **173** off-grid edges after re-injecting the verbatim base band-body declarations — a lower bound consistent with 184. §4 |
| **S2** is the probe self-confirming? | **PASS (not self-confirming)** | 325 OK → **173 OFF_GRID** on base geometry; → **20 OFF_GRID** on a single 3px nudge. Residual limitation recorded: it matches *nearest* axis, never *intended* axis. §4 |
| **S3** alignment ≠ good layout | **FAIL** | **F1**: 02→03 flow arrow missing at 320/375, measured and photographed, in the exact place the Coder claims a measured repair. Everything else inspected at six widths is clean. §11 |
| **S4** height growth | **PASS (confirmed)** | Document height Δ measured from the golden PNG headers: **+137px @1280, +144px @1440** — the Coder's exact numbers. Quality stamp row = 24.00px measured gap + 132px stamp = **156px**, matching "~156". Stamp placement judged: acceptable as a title-block sign-off, with a caveat. §13 |
| **S5** flush-cell change | **PASS** | Geometry-driven and consistent with the existing proof/reference language. `git diff 9133415 603965e -- src/components/` proves **no copy, imagery, palette or motion change is even possible** — no band component file was touched. §14 |
| **S6** the documented grid break | **PARTIAL — outer edges PASS, "only" claim FAIL** | Header outer edges measured on master **C0/C12 at every width** (Δ 0.00–0.13px), which the shipped probe never checks because `.tl-header` is not in its target list. But at least four further off-master structural subdivisions ship. §12 |
| **Deviation** `e2e/technical-landing.spec.ts` | **CONFIRMED BENIGN** | Both edits verified as strengthenings, not weakenings; full assertion accounting. §15 |

---

## 2 — AC1 · The master grid is real

`src/styles/design-tokens.css` puts the four grid tokens on `:root` and changes
them in exactly two media queries — nowhere else in the codebase redefines them:

| Breakpoint | `--tl-rail` | `--tl-cols` | `--tl-gap` | QA-measured rail share |
|---|---|---|---|---|
| default | 64px | 12 | 0px | 4.0% @1600 · 4.4% @1440 · 5.0% @1280 |
| `max-width:1180px` | 56px | 6 | 0px | 7.3% @768 |
| `max-width:767px` | 42px | 4 | 0px | 11.2% @375 · 13.1% @320 |

`src/styles/master-grid.css` supplies the one primitive
(`.tl-band` → `var(--tl-rail) repeat(var(--tl-cols),minmax(0,1fr))`;
`.tl-grid` → `grid-column:2/-1` + `grid-template-columns:subgrid` with
`padding-inline:0; border-inline-width:0; margin-inline:0` as an explicit
contract), plus a token-derived `@supports not (subgrid)` fallback.

`src/styles/technical-landing.css:158-166` then applies it **from CSS, not from
markup**, to all eleven band bodies and seven nested blocks, so a band cannot
half-adopt the system. The probe measured **325 block edges across 5 viewports:
0 off-grid, 0 absent, 0 missing, 0 unresolved.**

---

## 3 — AC2 · Forbidden values, declaration vs. comment

Repo-wide scan of `src/` for every forbidden token, then classification of each
hit. In `src/styles/technical-landing.css` the forbidden ratios appear at lines
183, 184, 225, 288, 373 and 401 — **all six inside `ÖNCESİ:` (BEFORE) comment
blocks**, and at `design-tokens.css:18-20`, also prose. Zero live declarations.

Two live `132px` values exist and neither is the forbidden construct:

| Location | Declaration | Is it the banned "fixed 132px seventh track"? |
|---|---|---|
| `technical-landing.css:176` | `.tl-process li{min-height:132px}` | No — a min-height, not a grid track |
| `technical-landing.css:332` | `.tl-stamp{width:132px;height:132px}` | No — the stamp's own square, placed on a real `grid-column:11/-1` |

All 22 live `grid-template-columns` declarations in the file were enumerated. None
is a forbidden value. (Four of them are off-master *internal* subdivisions — that
is finding F3, recorded under §12, not an AC2 violation.)

`src/styles/landing-flow.css` still contains `1.55fr`, `8fr/4fr`, `2fr` etc., but
that sheet is imported only by `src/components/LandingFlow.tsx` — the legacy
landing, not `/`. Out of Phase 02 scope; noted so it is not mistaken for a miss.

---

## 4 — S1 / S2 · Is the probe self-confirming? (the load-bearing check)

`scripts/grid-axis-probe.mjs` derives expected boundaries from
`getComputedStyle(band).gridTemplateColumns`, so "0 off-grid edges" is worthless
unless the probe can be shown to go red when a band actually leaves the grid.

### Run 1 — HEAD, unmodified `dist/`

```text
$ PROBE_PORT=4199 node scripts/grid-axis-probe.mjs
GRID AXIS PROBE: PASS — every measured edge sits on a master axis (tolerance 1px).   exit 0
```

**325 rows, 0 `OFF_GRID`, 0 `ABSENT`, 0 `MISSING`, 0 `UNRESOLVED_TRACKS`.**
The zero-`ABSENT` count matters independently: `ABSENT` rows are *excluded* from
the probe's failure count, so a selector that silently stopped matching would
shrink coverage without turning the probe red. None did.

### Run 2 — NEGATIVE CONTROL B · the pre-Phase-02 geometry restored

`reports/qa/tools/negcontrol-b-restore-base-geometry.css` re-injects the
**verbatim** band-body declarations lifted from
`git show 9133415:src/styles/technical-landing.css` (lines 136, 147, 148, 157,
179, 182, 183, 197, 220, 221, 266, 285, 305) into a **copy** of `dist/` in the
scratch directory, via `reports/qa/tools/make-negcontrol-dist.mjs`. The real
`dist/`, all of `src/` and every tracked file were untouched.

```text
$ node node_modules/vite/bin/vite.js preview --outDir <scratch>/dist-neg-b --port 4299 --strictPort
$ PROBE_BASE_URL=http://localhost:4299 node scripts/grid-axis-probe.mjs
GRID AXIS PROBE: FAIL — 173 measured edge(s) miss the master grid by more than 1px.   exit 1
```

**325 OK → 173 OFF_GRID. The probe is not self-confirming.**

Its printed 1600px deltas reproduce, to the hundredth of a pixel, numbers the
Coder wrote into the CSS as `ÖNCESİ` annotations — which I had no way to influence:

| Block @1600 | QA measured (negative control) | Coder's CSS comment |
|---|---|---|
| Process steps | `+16.00 / +8.02 / +0.03 / −7.95 / −15.94` | `+16.00 / +8.02 / +0.03 / −7.95 / −15.94` |
| Nexus app main left | `−50.02` off C8 | "1600'de ray sağ kenarı C2'nin 48.72px sağında" (same seam) |
| Quality strip | 6 cards, worst `+56.80 / −59.03` | "+16.00 / −11.33 / −38.66 / +61.84 / +34.53 / +7.20" |

### S1 — the "184 → 0" claim, stated honestly

**I did not re-derive 184.** Doing so exactly needs a full production build of
`9133415`, and `src/**` is read-only to me, so I could not check the base tree
out in place. What I did instead:

- **The `0` at HEAD is independently verified** — Run 1, my own execution.
- **The magnitude and direction of `184` is corroborated, not reproduced** — Run 2
  produced **173** off-grid edges from the base band-body declarations alone. 173
  is a *lower bound*, because my override restores only band-body geometry, not
  every base difference (base also had `.tl-proof-grid: repeat(6,1fr)`,
  `.tl-reference-grid: repeat(6,1fr)`, `.tl-sectors-body` tracks, tokens on
  `.tl-root` instead of `:root`, and the mobile rail inheriting 56px). `173 ≤ 184`
  is exactly the expected relationship.

→ Treat **184 as the Coder's number**, not QA's. The **0 is QA-verified**.

### Run 3 — NEGATIVE CONTROL C · sensitivity floor

A 173-edge blowout would be caught by almost anything. `negcontrol-c-sensitivity-3px.css`
applies a **single 3px nudge** (`.tl-sector-card{margin-left:3px}`) — 3× the
tolerance, invisible to the eye:

```text
$ PROBE_BASE_URL=http://localhost:4399 node scripts/grid-axis-probe.mjs
GRID AXIS PROBE: FAIL — 20 measured edge(s) miss the master grid by more than 1px.   exit 1
```

Caught at **every one of the five viewports** (4 cards × 5 widths), each reported
`Δ 3.00–3.10px` off `C0/C3/C6/C9`. The 1px tolerance is real, not cosmetic.
→ **S2: PASS.**

### S2 — residual limitation, recorded

The probe matches each edge to its **nearest** axis and never asserts *which*
axis was intended. It computes a `span` column but does not gate on it. A block
can therefore sit perfectly on-grid at the **wrong** master line and be reported
`OK`. This is not hypothetical — it is exactly the `.tl-project-grid article>img`
defect the Coder hit (featured card silently drawing 2/10 with every edge on a
master line), documented at `technical-landing.css:246-252`. The Coder found it
by looking, not by probing. That is why S3 below is a separate, non-negotiable
check, and it is why F1 exists.

---

## 5 — AC3 · Dev overlay

**Bundle half.** After `npm run build`:

```text
$ grep -ril "MasterGridOverlay\|grid-overlay" dist/               → no matches (exit 1)
$ grep -ril "tl-grid-overlay\|mas:grid-overlay\|CTRL+ALT+G" dist/ → no matches (exit 1)
$ find dist -type f | wc -l                                       → 367
```

The identifier, the CSS class prefix and the localStorage key are absent from all
367 built files. `import.meta.env.DEV` is a compile-time `false`, so Rollup drops
the dynamic import together with the component and its `import "./grid-overlay.css"`.

**Runtime half** (`reports/qa/tools/qa-overlay-check.mjs`, dev server on 5299,
toggled through the documented CTRL+ALT+G chord, not by poking state):

```json
"375":  { "overlayNodesBeforeToggle": 0, "overlayNodesAfterToggle": 1,
          "markerCount": 5,  "drawnAxes": 6,  "readout": "375px · rail 42px (11.2%) · 4 cols · 83.25px" }
"1280": { "overlayNodesBeforeToggle": 0, "overlayNodesAfterToggle": 1,
          "markerCount": 13, "drawnAxes": 14, "readout": "1280px · rail 64px (5.0%) · 12 cols · 101.16px" }
```

For each of the eight bands the criterion names — Hero, Process, Nexus, Projects,
Quality, FAQ, RFQ, Footer — I compared the overlay's drawn lines against that
band's own real track boundaries:

| Viewport | Bands checked | Worst divergence | Status |
|---|---|---|---|
| 375 | 8 / 8 | ≤ 1.00px | all `SHARED` |
| 1280 | 8 / 8 | 0.11px | all `SHARED` |

The 768 pass in the same run reported `overlayNodesAfterToggle: 0` — my own
artefact: the visible flag persists in `localStorage` across the shared browser
context, so the third toggle switched it back off. That incidentally confirms the
toggle works in both directions and that persistence works.

`reports/qa/tools/shots/overlay-1280.png` shows the demonstration the criterion
asks for: hero copy on C0, part stage on C4, part passport on C10, proof cells on
C2/C4/C6/C8/C10 and the process figure on C4 — all sharing the same red lines.

---

## 6 — AC4 · Tablet Process

Probe @768 (`rail 56px · 6 columns · column 118.328px`):

```text
Process  body     57.00  C0  0.00   767.00  C6  0.03   6col  OK
Process  intro    57.00  C0  0.00   412.00  C3  0.02   3col  OK
Process  figure  412.00  C3  0.02   767.00  C6  0.03   3col  OK
```

Intro consumes tracks 0–3, figure tracks 3–6. **All six tracks consumed, no gap.**
Independently re-derived from the DOM by `qa-phase02-measure.mjs`:
`processIntroCols = 3`, `processFigureCols = 3` at 768 (and 4 / 8 at 1280+).
`reports/qa/tools/shots/process-768.png` shows the figure reaching the right
sheet edge. Base CSS at `9133415:359` had `.tl-process-intro{grid-column:1/span 3}`
with `figure{grid-column:4/span 2}` — five of six. Fixed.

---

## 7 — AC5 · Mobile rail, measured at BOTH widths

The Coder reported 375 only. QA measured both, from `getBoundingClientRect()` of
the live `.tl-band-index`:

| Viewport | rail (QA) | share of viewport (QA) | 40–44px? | < 15%? | Coder |
|---|---|---|---|---|---|
| **320** | **42.00px** | **13.13%** | yes | yes | not reported |
| **375** | **42.00px** | **11.20%** | yes | yes | 42px / 11.2% ✓ |

Also verified the rail still clears its content at 320: `technical-landing.css:508`
sizes the index numeral at `24px` inside `4px` gutters (24 + 8 = 32 ≤ 42) and drops
the band-name `small` entirely, so nothing wraps or clips. `shots/full-320.png`
confirms.

→ **AC5: PASS.** See F2 in §16 for the separate problem that the *assertion*
guarding this number is mis-set.

---

## 8 — AC6 · Static gates

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` (`tsc --noEmit` × app/node/e2e) | **PASS**, zero diagnostics |
| Lint | `npm run lint` (`eslint .`) | **PASS** — `✖ 1 problem (0 errors, 1 warning)` |
| Build | `npm run build` | **PASS** — `✓ built in 36.89s`, exit 0 |

The single warning is `react-hooks/exhaustive-deps` at
`src/components/technical-landing/TechnicalHeader.tsx:43`. Verified pre-existing:
the identical `triggerRef.current?.focus()` cleanup is in
`git show 9133415:src/components/technical-landing/TechnicalHeader.tsx`. Phase 02
added no new lint output. The chunk-size warnings are pre-existing build noise
(`xlsx`, `AdminDashboard`, `cssVar`), untouched by this phase.

---

## 9 — AC7 · Critical gate and Phase 01 guarantees

```text
$ PLAYWRIGHT_PORT=4419 npm run test:e2e:critical
  Running 66 tests using 1 worker
  3 skipped
  63 passed (5.7m)          exit 0
```

Skips, all lane selectors and none of them new suppressions:

| # | Test | Reason |
|---|---|---|
| 11 | `landing-grid-axes.spec.ts:128` | `width >= 768` — mobile contract; **executed and passed on `critical-375` (#44)** |
| 32 | `technical-landing.spec.ts:300` | pre-existing `!isMobile` lane, present at `9133415` |
| 63 | `technical-landing.spec.ts:147` | pre-existing `width < 1180` lane, present at `9133415` |

Phase 01 guarantees, each re-confirmed by a named passing test in this run:

| Guarantee | Test | Lanes |
|---|---|---|
| 14 bands in order | `landing-structure.spec.ts:27` #14 / #47 | 1280 + 375 |
| anchors reachable | `landing-anchors.spec.ts:32` #8 / #41 | both |
| no horizontal overflow | `landing-structure.spec.ts:82` #17 (sweeps 375/768/1280/1440/1600) | both |
| reduced motion complete & static | `landing-reduced-motion.spec.ts:14,31` | both |
| console clean, no failed local requests | `landing-structure.spec.ts:95` #18 | both |
| `#hero-shell` removed, no stale intro state | `landing-structure.spec.ts:41` #15 | both |
| exactly one image preload, the rendered hero | `landing-structure.spec.ts:60` #16 | both |
| axe: no serious/critical | `landing-accessibility.spec.ts:20` #4 / #37 | both |
| dev routes 404 in production build | `dev-routes.spec.ts:16` ×3 | both |

**320 overflow — measured by QA, because the suite does not.**
`e2e/landing/landing-structure.spec.ts:24` reads
`const OVERFLOW_WIDTHS = [375, 768, 1280, 1440, 1600];` — **320 is absent**, and
the file is unchanged since Phase 01 (carried-forward gap, not a Phase 02
regression). QA-measured `documentElement.scrollWidth` vs `clientWidth`:

| 320 | 375 | 768 | 1280 | 1440 | 1600 |
|---|---|---|---|---|---|
| 320 / 320 → **0** | 375 / 375 → **0** | 768 / 768 → **0** | 1280 / 1280 → **0** | 1440 / 1440 → **0** | 1600 / 1600 → **0** |

The measurement pass also flagged elements extending past `clientWidth`
(77 at 320, 6 at 1600); every one is inside an intentionally clipped container —
`.tl-marquee-track` (an `overflow:hidden` viewport) or the tablet/mobile
`.tl-nexus-rail` (`overflow-x:auto` tab bar). No element escapes the document.

---

## 10 — AC8 · Goldens

**Positive.** Against the clean `dist/` on port 4499:

```text
$ PLAYWRIGHT_BASE_URL=http://localhost:4499 npm run test:e2e:visual
  ✓ visual-375   ✓ visual-1280   ✓ visual-1440
  3 passed (21.4s)
```

**The goldens were genuinely regenerated**, not merely rewritten. PNG IHDR
dimensions, base vs HEAD:

| Project | base `9133415` | HEAD `603965e` | Δ height |
|---|---|---|---|
| visual-375 | 375 × 8939 | 375 × 8923 | **−16px** |
| visual-1280 | 1280 × 3844 | 1280 × 3981 | **+137px** |
| visual-1440 | 1440 × 3892 | 1440 × 4036 | **+144px** |

**Negative control.** Same suite against the 3px-perturbed `dist/` copy on 4399:

```text
  ✘ visual-375   ✘ visual-1280   ✘ visual-1440
  3 failed
  visual-375 : 375x8923  → 375x8911   145690 pixels different
  visual-1280: 1280x3981 → 1280x3978  116501 pixels different
  visual-1440: 1440x4036 → 1440x4033  125624 pixels different
```

The gate's budget is `maxDiffPixels: 200` (absolute, not a ratio). A 3px CSS nudge
produces 116 k–146 k diff pixels — a 580×–730× margin over budget. The goldens
diff for real. → **AC8: PASS.**

---

## 11 — S3 · Visual inspection · **FINDING F1**

Inspected at 320 / 375 / 768 / 1280 / 1440 / 1600. Screenshots committed under
`reports/qa/tools/shots/` (full page + per-band for process, nexus, projects,
sectors, quality, footer at all six widths).

### F1 — the mobile 02→03 flow arrow is still missing

`reports/qa/tools/shots/process-375.png` shows the ↓ connector between **01→02**
and between **03→04**, and **nothing between 02 and 03**. The DOM agrees —
`getComputedStyle(li, "::after").display` per step:

| Viewport | 01 | 02 | 03 | 04 |
|---|---|---|---|---|
| **320** | `grid` | **`none`** | `grid` | `none` (intended, last) |
| **375** | `grid` | **`none`** | `grid` | `none` (intended, last) |
| 768 | `grid` | `none` (**correct** — end of row 1 in the 2-column tablet layout) | `grid` | `none` |
| 1280 / 1440 / 1600 | `grid` | `grid` | `grid` | `none` |

**Why the Coder's fix does not take effect — specificity, not order.**

```css
/* technical-landing.css:472, inside @media (max-width:1180px) */
.tl-process li:nth-child(2)::after { display: none }        /* specificity (0,2,2) */

/* technical-landing.css:523, inside @media (max-width:767px) */
.tl-process li::after { content:"↓"; display: grid; ... }   /* specificity (0,1,2) */
```

At ≤767px **both** media queries match. The later rule does not win, because
`(0,2,2) > (0,1,2)`: the tablet selector adds a `:nth-child()` pseudo-class the
mobile selector lacks. `display:none` therefore survives on step 02 at mobile.
Steps 01 and 03 pick up `display:grid` normally, which is why the defect looks
like a single missing connector rather than a missing feature.

**Why this is a FAIL and not a note.** The comment at `technical-landing.css:520`
states the fix is in place *and that it was measured*:

> "`display:grid` şart: tablet kuralı `li:nth-child(2)::after{display:none}` … mobile de sızıyordu — 02 ile 03 arasındaki akış oku dikey listede kayboluyordu (**ölçüldü, 375px**)."

I measured at 375px, twice and by two independent methods (computed style and
screenshot), and the arrow is still gone. A claimed measurement contradicts the
shipped artefact. Per §12, this is precisely the class of defect the probe cannot
catch — every element involved is still perfectly on-grid.

**Suggested correction (production; QA does not apply it):** raise the mobile
rule's specificity to at least match, e.g. by also scoping it to
`li:nth-child(2)`, or by moving the tablet suppression into a
`@media (min-width:768px) and (max-width:1180px)` band so it cannot reach mobile
at all. The second is preferable: it removes the leak rather than out-shouting it.

### Everything else inspected — clean

| Band | Widths | Observation |
|---|---|---|
| Hero | all six | Copy / stage / passport hold 4 / 6 / 2. Dimension callouts stay registered to the part at every width; mobile correctly drops to three callouts. Nothing clipped. |
| Proof | all six | 6 → 3 → 2 per row via `span 2`; hairlines resolve correctly at each wrap (`nth-child(3n)`, `nth-child(2n)`). |
| Process | 768 + | Correct (see AC4). Mobile: F1 only. |
| Nexus | all six | 3 / 9 held. Headline, app rail and table all share master line 3 — visible in `shots/nexus-1280.png`. |
| Projects | all six | **The `cfe5ad0` repair is real**: featured card draws image on masters 0–6 and content on 6–12, and the secondary row's centre rule lands on the same master 6. `shots/projects-1280.png`. No orphaned card, no clipping. |
| Sectors | all six | Flush cells, single hairline between. `shots/sectors-1280.png`. |
| Quality | all six | 6 flush evidence cells; stamp on its own row (see S4). |
| FAQ / RFQ | all six | 7 / 5 and 3 / 4 / 5 hold; RFQ collapses cleanly to one column at mobile with the `⌄` connector rotated. |
| Footer | all six | 4 / 8, nav 4 × `span 2`. Watermark clipped at the sheet edge **by design** (`overflow:hidden` filigree), not a defect. `shots/footer-1440.png`. |

---

## 12 — AC9 / S6 · Docs vs code, and the "only remaining break" claim

### The header's outer edges — verified, and the shipped probe never checks them

`scripts/grid-axis-probe.mjs` has no `.tl-header` / `.tl-header-band` entry in
`PROBE_TARGETS`, and neither does `e2e/landing/landing-grid-axes.spec.ts`. So the
documented exception's key promise — "the band's outer edges are on master 0/12" —
is asserted nowhere. I measured it (`reports/qa/tools/qa-s6-grid-breaks.mjs`):

| Viewport | header left | axis | Δ | header right | axis | Δ | On master? |
|---|---|---|---|---|---|---|---|
| 375 | 42.00 | C0 | 0.00 | 375.00 | C4 | 0.00 | **yes** |
| 768 | 57.00 | C0 | 0.00 | 767.00 | C6 | 0.03 | **yes** |
| 1280 | 65.00 | C0 | 0.00 | 1279.00 | C12 | 0.13 | **yes** |
| 1600 | 65.00 | C0 | 0.00 | 1599.00 | C12 | 0.06 | **yes** |

→ **That half of S6 is PASS**, now on measured evidence rather than assertion.

### It is not the only break — **FINDING F3**

The same scan walks every grid element inside every band and measures its
*internal* track boundaries against its band's master axes. Off-master results at
1600 (deduplicated; full JSON in the run log):

| Element | Declared tracks | Internal boundaries off master | Worst | Draws a visible rule? | Documented? |
|---|---|---|---|---|---|
| `.tl-header` | `210px 1fr auto` | 2 / 2 | 45.66px | yes (brand border-right) | **yes** — the acknowledged exception |
| `.tl-nexus-kpis` | `repeat(4,1fr)` across 9 master columns | **3 / 3** | **63.87px** | **yes** — 3 hairlines via `div+div::before` | **no** |
| `.tl-rfq-body>ol` | `repeat(4,1fr)` across 5 master columns | **3 / 3** | **55.87px** | yes — `li::after` `>` connectors | in a CSS comment only, not in the design doc |
| `.tl-title-block` | `auto minmax(0,1fr) auto` | **2 / 2** | **38.08px** | **yes** — `border-right` between social / meta / legal | **no** |
| `.tl-part-passport` (tablet) | `1fr 3fr 1fr` | 2 / 2 | 42.84px @768 | no | **no** |
| `.tl-footer address` | `auto auto` | 1 / 1 | 61.66px | no | n/a — content-driven |
| `.tl-faq summary` | `36px 1fr auto` | 2 / 2 | 52.00px | no | n/a — list-row internals |
| `.tl-nexus-kpis div` | `46px minmax(0,1fr)` | 1 / 1 | 63.02px | no | n/a — icon + text |
| `.tl-mini-doc`, `.tl-cert-table span` | `auto minmax`, `1.7fr 1fr 1fr .7fr`, `2fr 1fr` | 1–3 each | ~47–61px | no — decorative bars inside a card | n/a |

The last four groups are legitimately component-internal (typography and icon
alignment inside a bordered card; no page-level rule is drawn). The **first four**
are not: each divides a multi-column structural block into fresh equal fractions
and, in three cases, draws a visible hairline or connector on the resulting
off-master line.

### The doc statements the code contradicts

1. **`docs/lean/06-design-system.md`, "How a band consumes the grid", rule 2:**
   > "**Nested blocks that still divide content are themselves subgrids.** A card
   > spanning 6 columns divides on master lines 2 and 4 of those 6, not on a fresh
   > percentage."

   Contradicted by `.tl-nexus-kpis` (9 columns → 4 fresh equal fractions, 3 visible
   hairlines), `.tl-rfq-body>ol` (5 → 4), `.tl-title-block` (full width → `auto/1fr/auto`
   with visible borders) and tablet `.tl-part-passport` (`1fr 3fr 1fr`).

2. **`docs/lean/06-design-system.md`, "Documented exception — band 01"** reads as
   the single exception. Measurement says there are at least four structural ones.

3. **`docs/lean/13-forbidden-patterns.md`**: "Yerleşim `span N` ile yazılır."
   Same four elements do not.

### Doc statements that are accurate — verified

| Claim | Source | Verified against |
|---|---|---|
| rail/cols/gap table 64·12 / 56·6 / 42·4, gap 0 | `06`, `09` | `design-tokens.css` + probe readouts |
| rail shares 4.0 / 7.3 / 11.2 / 13.1% | `09` | QA measurement, exact match at all four |
| Band composition 02 Hero 4/6/2 | `06` | `.tl-hero-copy 2/span 4`, `.tl-part-stage 6/span 6`, `.tl-part-passport 12/span 2` |
| 03 Proof 6 × span 2 · 11 References 6 × span 2 | `06` | `.tl-proof article{span 2}`, `.tl-reference-grid li{span 2}` |
| 05 Process 4/8 then 4 × span 3 | `06` | `.tl-process-intro 1/span 4`, `figure 5/-1`, `li{span 3}` |
| 07 Projects featured 6/6, secondaries divided 2/4 | `06` | `featured>img 1/span 6`, `>div 7/-1`; `article>img 1/span 2`, `>div 3/-1` |
| 10 Quality 6 × span 2, stamp on a real 11–12 | `06` | `.tl-cert{span 2}`, `.tl-stamp{grid-column:11/-1}` |
| 12 FAQ 7/5 · 13 RFQ 3/4/5 · 14 Footer 4/8, nav 4 × span 2 | `06` | `.tl-faq-title 1/span 7` + `.tl-resource 8/-1`; `h2 1/span 3` + `.tl-cad-drop 4/span 4` + `ol 8/-1`; `.tl-footer-brand 1/span 4` + `nav div{span 2}` |
| `design-tokens.json` is legacy-forge-only | `design-tokens.json` `$scope` | accurate — that file describes `--forge-*`, the public system is `--tl-*` in `design-tokens.css` |

→ **AC9: FAIL** on statements 1–3 above. Everything else in the docs is accurate,
and the four doc files are a genuine improvement over what they replaced.

---

## 13 — S4 · Height growth

**Document height** — measured directly from the golden PNG IHDR headers, base vs
HEAD (§10). **+137px @1280 and +144px @1440 — the Coder's exact numbers, confirmed.**
Also measured, and *not* reported by the Coder: 375 **shrank by 16px**.

**Quality band / stamp row.** QA-measured at 1280:

```text
last evidence cell bottom : 3113.56
stamp top                 : 3137.56     → gap 24.00px  (= --tl-s5, exactly)
stamp height              : 132.00
```

The stamp is confirmed to be on its own row, below all six cells, right-aligned
on masters 11–12 (`grid-column:11/-1; justify-self:end`). `24 + 132 = 156px` —
matching the Coder's "~156px". I could not re-measure the *base* Quality band
height without a base build (my base-geometry proxy distorts row heights because
the restored explicit tracks fight HEAD's `span` placements, e.g. Sectors reported
3608px), so I record this as **confirmed by construction and by the measured
stamp row**, not by A/B band measurement. The two facts are consistent: the band
grew 156px while the document grew 137px, i.e. ~19px was recovered elsewhere
(Nexus and RFQ both tightened).

**Judgement — sign-off or orphaned row?** `reports/qa/tools/shots/quality-1280.png`.
Verdict: **acceptable, with a caveat.** In its favour, this is genuine drawing-sheet
convention — an approval stamp belongs in the bottom-right of a sheet, isolated,
and it now occupies a real 11–12 master span instead of the fake 7th track it had.
The 24px gap is the system's own `--tl-s5`, not an arbitrary value. Against it: the
row is ~156px tall and its left ten columns are entirely empty, with no title-block
frame to make that emptiness read as intentional. At 1280 the band is now 394px
tall of which 180px is that near-empty row. It reads as *deliberate whitespace* to
a reader who knows the convention, and as a *large gap with a stamp in the corner*
to one who does not. Not an acceptance-criterion failure; flagged for the design
pass — a hairline rule or a title-block frame across masters 0–11 on that row would
settle it. At mobile the stamp is centred and shrunk to 118px, which reads better.

---

## 14 — S5 · The flush-cell change

**Was any content touched?** `git diff 9133415 603965e -- src/components/` returns
exactly three paths: the two **new** dev-only overlay files, and
`TechnicalLanding.tsx` at **+19 / −1**, where the entire change is the
`import.meta.env.DEV` overlay mount plus a `<Suspense>` wrapper. **No band
component file was modified at all** — not `TechnicalHero`, `ProofStrip`,
`LandingBands`, `DrawingFooter`, `MarqueeBand`, `TechnicalHeader`. No copy,
heading, label, `alt`, `src`, link or data value could have changed. Geometry-only
scope is structurally guaranteed by the diff.

**Is the flush-cell change geometry-driven?** Yes. Sectors/Quality/Projects moved
from gapped cards to flush cells because a gap is *the mechanism* that pushed the
cells off master (`.tl-sectors-body` had `gap:var(--tl-s2)` + `padding:var(--tl-s3)`;
`.tl-project-grid article` had `padding:6px`). Removing the gap is not a style
choice made alongside the fix — it *is* the fix, since `--tl-gap` is zero by
contract and breathing room must move to child padding.

**Is it consistent with the existing band language?** Yes. The proof strip
(`.tl-proof article{border-right:1px solid var(--tl-rule)}`) and the reference band
(`.tl-reference-grid li{border-right:...}`) were **already** flush cells with a
single hairline between them, at base `9133415`. Sectors, Quality and Projects now
speak that same language (`shots/sectors-1280.png`, `shots/quality-1280.png`).
This is convergence onto an existing pattern, not a new one.

**Palette / motion / imagery?** `git diff` on the CSS shows no change to any
`--tl-*` colour value, no change to `--tl-ease-out` or the duration tokens, and no
change to any image reference. → **S5: PASS.**

---

## 15 — Orchestrator-accepted deviation, confirmed benign

`git diff --numstat 9133415 603965e -- e2e/` → `30/4` in `technical-landing.spec.ts`,
`144/0` for the new `landing-grid-axes.spec.ts`, plus the three golden PNGs.
The four deleted lines, in full:

```diff
-    expect(["56px", "64px"]).toContain(contract.rail);
-    // Nav sütunu referanstaki gibi ~%41'de başlamalı (marka sütunu genişlerse kayar).
-    expect(navBaslangic).toBeGreaterThan(39);
-    expect(navBaslangic).toBeLessThan(44);
```

**Edit 1 — rail enumeration.** `["56px","64px"]` → `["42px","56px","64px"]`, plus a
new executed bound in the same test:
`expect(rail / viewportWidth).toBeLessThan(0.15)`. Real, unconditional, and
strictly stronger than the enumeration alone — the old list would have silently
accepted `56px` at 320px (17.5%). **Not a weakening.**

**Edit 2 — footer nav start.** `>39 && <44` (5.0 points wide) → `>36.5 && <39.5`
(3.0 points wide): the window **narrowed by 40%**. Sensitivity check: one master
column is 1/12 of the content field ≈ 7.3–8.0% of viewport, so a brand column
growing by one master column moves `navBaslangic` from ~37–38% to ~45% — outside
`<39.5`, and the test goes red. Arithmetic check of the new expectation at 1440:
master 4 = `65 + 4 × 114.5 = 523`, plus the nav column's 1px border and 16px
`padding-left` → 540 → **37.5%**, inside `(36.5, 39.5)` and matching the Coder's
stated 37.4%. **Not a weakening.**

**Assertion accounting.** `expect(` count in `e2e/technical-landing.spec.ts`:
**78 at base → 79 at HEAD** (3 removed, 4 added). Repo-wide scan for `.only`,
`.fixme`, `xit`, `xdescribe`: **zero occurrences**. Every `test.skip` / `test.fail`
at HEAD also exists at base, except the one new viewport-lane selector in
`landing-grid-axes.spec.ts:133`, which matches the repo's established lane pattern.
**Nothing was deleted, skipped, `.only`'d, `xfail`'d or loosened.**

---

## 16 — Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| **F1** · S3 visual · mobile process flow | 02→03 `↓` connector absent at 320 and 375. `getComputedStyle(li:nth-child(2), "::after").display === "none"`. Visible in `reports/qa/tools/shots/process-375.png`. The Coder's comment at `technical-landing.css:520` claims this was fixed *and measured at 375px*. | Specificity, not order. `technical-landing.css:472` `.tl-process li:nth-child(2)::after{display:none}` is `(0,2,2)`; `technical-landing.css:523` `.tl-process li::after{display:grid}` is `(0,1,2)`. `@media (max-width:1180px)` also matches ≤767px, so the tablet rule wins at mobile. | **Yes.** Prefer scoping the tablet suppression to `@media (min-width:768px) and (max-width:1180px)` so the leak is removed rather than out-specified. |
| **F2** · `landing-grid-axes.spec.ts` fails at `mobile-320` | `npx playwright test --project=mobile-320 e2e/landing/landing-grid-axes.spec.ts` → `1 failed, 1 passed`. `Error: rail share of a 320px viewport — Expected: < 0.13, Received: 0.13125`. `mobile-320` is a regression project (`REGRESSION_IGNORE` excludes only visual/smoke/legacy), so `npm run test:e2e` is now red. | `e2e/landing/landing-grid-axes.spec.ts:142` asserts `rail / width < 0.13`. 42 / 320 = 0.13125. The bound contradicts the phase's own documentation: `docs/lean/09-responsive-rules.md` and `06-design-system.md` both state the rail is **13.1% at 320**. The 320 lane was evidently never run. | **Yes**, but trivial: the contract the docs and `mas-grid-system` actually state is *under 15%* (`technical-landing.spec.ts` already uses `< 0.15`). Raising this bound to `0.15` — or to `0.14` to stay tight — restores agreement without weakening anything, since it still rejects the 56px/17.5% defect that motivated it. **The rail itself is correct; only the assertion is mis-set.** |
| **F3** · AC9 · docs assert what code does not do | `06-design-system.md` rule 2 requires nested dividing blocks to be subgrids and frames band 01 as the sole exception; `13-forbidden-patterns.md` requires layout to be written with `span N`. Measured: `.tl-nexus-kpis` (3 off-master boundaries, 63.87px, 3 visible hairlines), `.tl-rfq-body>ol` (3, 55.87px), `.tl-title-block` (2, 38.08px, visible borders), tablet `.tl-part-passport` (2, 42.84px). | The rules were written as absolutes while the implementation kept four pragmatic component-internal divisions. | **Yes — one or the other.** Either make those four subgrids, or amend the two docs to state the real rule (structural page axes derive from the master grid; a bordered component may divide its own interior) and list the exceptions explicitly. Documentation honesty is the phase's own stated standard. |

---

## 17 — Discrepancies found (Coder's number beside mine)

| Item | Coder | QA measured | Verdict |
|---|---|---|---|
| Off-grid edges at HEAD | 0 | **0** (325 rows, 5 widths) | **agrees** |
| Off-grid edges at base | 184 | **173** with base band-body geometry restored over HEAD `dist/` | **corroborated**, not reproduced — 173 is a lower bound (§4). Do not cite 184 as QA-verified. |
| Process step deltas @1600 (before) | +16.00 / +8.02 / +0.03 / −7.95 / −15.94 | **identical** | **agrees exactly** |
| Document growth @1280 | +137px | **+137px** | **agrees exactly** |
| Document growth @1440 | +144px | **+144px** | **agrees exactly** |
| Document change @375 | not reported | **−16px** | QA addition |
| Quality stamp row | "~156px" | **24.00px gap + 132px stamp = 156px** | **agrees**; band-level A/B not independently possible (§13) |
| Mobile rail @375 | 42px / 11.2% | **42.00px / 11.20%** | **agrees exactly** |
| Mobile rail @320 | not measured | **42.00px / 13.13%** | QA addition — within AC5, but see F2 |
| Footer nav start @1440 | 37.4% | **37.5% by arithmetic**; test passes `(36.5, 39.5)` | **agrees** |
| Tablet Process tracks | 3 / 3, sixth column fixed | **3 / 3** (intro C0→C3, figure C3→C6) | **agrees** |
| Mobile 02→03 arrow | "fixed, measured at 375px" | **still `display:none` at 320 and 375** | **CONTRADICTED — F1** |
| Remaining grid breaks | "band 01 header only" | **header + 3 further structural + 5 component-internal** | **CONTRADICTED — F3** |
| New spec passes everywhere | implied | **fails at `mobile-320`** | **CONTRADICTED — F2** |

---

## 18 — Carried forward (not Phase 02 failures)

- `OVERFLOW_WIDTHS` in `e2e/landing/landing-structure.spec.ts:24` omits 320. Phase 01
  file, unchanged. QA measured 320 manually and it is clean (§9); worth adding to
  the constant in a later phase.
- `scripts/grid-axis-probe.mjs` and `e2e/landing/landing-grid-axes.spec.ts` never
  probe `.tl-header` / `.tl-header-band`, so the documented exception's outer-edge
  promise is untested by the repo. QA measured it (§12) and it holds.
- The probe matches *nearest* rather than *intended* axis and does not gate on its
  own `span` output (§4). A `span`-based assertion would have caught the featured-card
  defect the Coder found by eye.
- Content items correctly left alone by this phase and belonging to Phase 06:
  the fabricated CMM report numbers (`MT-2024-0512`, tolerance tables), the
  `status="demo"` NEXUS order data, the decorative verification QR
  (`DOĞRULAMA SERVİSİ HAZIRLANIYOR`), and the `ÖRNEK İÇERİK` / `DEMO İÇERİK`
  badges. Reported here as carried-forward only.

---

## 19 — Commands run

```text
git diff --name-status 9133415 603965e
git diff --stat        9133415 603965e
git diff --numstat     9133415 603965e -- e2e/
git diff               9133415 603965e -- e2e/technical-landing.spec.ts
git diff               9133415 603965e -- src/components/
git diff               9133415 603965e -- docs/lean/
git show 9133415:src/styles/technical-landing.css
git show 9133415:src/components/technical-landing/TechnicalHeader.tsx
git show 9133415:e2e/__golden__/win32/visual-{375,1280,1440}/landing-fullpage.png

npm run typecheck                                                        # PASS
npm run lint                                                             # PASS (1 pre-existing warning)
npm run build                                                            # PASS, 36.89s
grep -ril "MasterGridOverlay\|grid-overlay" dist/                        # empty
grep -ril "tl-grid-overlay\|mas:grid-overlay\|CTRL+ALT+G" dist/          # empty

PLAYWRIGHT_PORT=4419 npm run test:e2e:critical                           # 63 passed, 3 skipped
PROBE_PORT=4199 node scripts/grid-axis-probe.mjs                         # PASS, 0 off-grid, 325 rows

node reports/qa/tools/make-negcontrol-dist.mjs \
     reports/qa/tools/negcontrol-b-restore-base-geometry.css <scratch>/dist-neg-b
node node_modules/vite/bin/vite.js preview --outDir <scratch>/dist-neg-b --port 4299 --strictPort
PROBE_BASE_URL=http://localhost:4299 node scripts/grid-axis-probe.mjs    # FAIL, 173 off-grid

node reports/qa/tools/make-negcontrol-dist.mjs \
     reports/qa/tools/negcontrol-c-sensitivity-3px.css <scratch>/dist-neg-c
node node_modules/vite/bin/vite.js preview --outDir <scratch>/dist-neg-c --port 4399 --strictPort
PROBE_BASE_URL=http://localhost:4399 node scripts/grid-axis-probe.mjs    # FAIL, 20 off-grid

node node_modules/vite/bin/vite.js preview --port 4499 --strictPort
PROBE_BASE_URL=http://localhost:4499 node reports/qa/tools/qa-phase02-measure.mjs
PROBE_BASE_URL=http://localhost:4499 node reports/qa/tools/qa-s6-grid-breaks.mjs
PLAYWRIGHT_BASE_URL=http://localhost:4499 npm run test:e2e:visual        # 3 passed
PLAYWRIGHT_BASE_URL=http://localhost:4399 npm run test:e2e:visual        # 3 failed  (negative control)
PLAYWRIGHT_BASE_URL=http://localhost:4499 npx playwright test \
        --project=mobile-320 e2e/landing/landing-grid-axes.spec.ts       # 1 failed, 1 passed  (F2)

node node_modules/vite/bin/vite.js --port 5299 --strictPort              # dev server
PROBE_BASE_URL=http://localhost:5299 node reports/qa/tools/qa-overlay-check.mjs

git status --porcelain
```

---

## 20 — Scope integrity

- **Production files modified by QA: NONE.** `git status --porcelain` shows only
  paths under `reports/qa/`. `src/**`, `public/**`, `index.html`, all config, all
  workflow files, `e2e/**`, `scripts/**`, `docs/**`, `PROGRESS.md`,
  `IMPLEMENTATION.md`, `USER_INPUTS.md` are untouched.
- **`dist/` was never perturbed.** Both negative controls operate on *copies* in
  the scratch directory, produced by `reports/qa/tools/make-negcontrol-dist.mjs`,
  which reads `dist/` and writes elsewhere. The probe re-run against the real
  `dist/` after the experiments still reports 0 off-grid.
- **Test/report files added by QA** (all inside `QA_WRITE_ALLOWLIST`):
  - `reports/qa/phase-02.md`
  - `reports/qa/tools/qa-phase02-measure.mjs`
  - `reports/qa/tools/qa-overlay-check.mjs`
  - `reports/qa/tools/qa-s6-grid-breaks.mjs`
  - `reports/qa/tools/make-negcontrol-dist.mjs`
  - `reports/qa/tools/negcontrol-b-restore-base-geometry.css`
  - `reports/qa/tools/negcontrol-c-sensitivity-3px.css`
  - `reports/qa/tools/shots/*.png` (45 images)
- **No new e2e spec was added.** `e2e/qa-phase-02/**` was not needed: the evidence
  for every finding came from the existing suite, the committed probe, and
  read-only QA instruments under `reports/qa/tools/`. Adding a spec would have put
  QA-authored assertions into the production gate, which the phase does not require.
- **Transient Playwright output** (`test-results-qa-320/`, `test-results-qa-neg/`)
  was deleted after inspection.
- **SCOPE_INTEGRITY: PASS** — for both the Coder's commits (16 files, all within
  the phase's surface, no `package.json` / build-config / route / schema change)
  and for QA's own writes.

---

# 21 — RE-VERIFICATION after correction packets #1 and #2

> This section is **appended**. Nothing in §0–§20 above has been edited: the
> original FAIL verdict and its three findings stand as the record of what was
> wrong. What follows is the independent evidence that they are now right.

- RE-VERIFICATION RUN: 2026-08-31
- CODE COMMITS UNDER TEST: `43d8adb`, `c269c3d`, `b0110fc` (packet #1, C1/C2/C3)
  and `45f3577` (packet #2, connector gate). Integration head `45f3577` on
  `claude/awwwards-90-overhaul`.
- QA WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p02b` on `wt/qa-p02b`
- PORTS USED: clean preview **4519**; connector negative control **4529**;
  56px-rail negative control **4539**; 45px-rail isolation control **4549**.
  (4173 was occupied by another process — `netstat` PID 6052 — and was avoided.)
- SCOPE: targeted re-verification. §2–§20 PASS findings were not re-derived.

## 21.0 — Re-verification verdict

| Ref | Subject | Result |
|---|---|---|
| **R1** | C1 · mobile 02→03 connector | **PASS** — rendered output at 320/375 shows ↓ after 01, 02, 03 and none after 04; tablet still suppresses after 02; the false "ölçüldü, 375px" comment is gone and its replacement is now itself corroborated by my negative control. |
| **R2** | C2 · rail bound `< 0.14` | **PASS** — `mobile-320` genuinely green; bound matches `09-responsive-rules.md`; **proven not toothless** by an isolation control that trips it with 0.000625 of margin. |
| **R3** | C3 · docs + `.tl-header` probe | **PASS** — the restated rule is satisfied by shipped code, all five content-measured interiors are enumerated *and* are probe targets, `.tl-header` is now measured at five widths (Δ 0.00–0.13px) and the probe still reports 0 off-grid over 330 rows. |
| **R4** | packet #2 · the connector gate | **PASS** — the gate **can fail**: reproducing the original defect byte-level in a scratch `dist/` turns it red, 6 failed / 2 passed, with messages naming the step and the width. Its expectation table is independently correct at all ten widths. |

## 21.1 — R1 · The mobile 02→03 connector

**Static.** `src/styles/technical-landing.css:494-517`: the suppression now lives
in its own `@media (min-width:768px) and (max-width:1180px)` block, and the old
site inside `@media (max-width:1180px)` carries only a pointer comment
(`technical-landing.css:472-473`). The two ranges are disjoint against the mobile
block's `@media (max-width:767px)`, so cascade specificity no longer decides the
outcome. The mobile `::after` override at `:549` no longer needs to restate
`display:grid`; it inherits it from the unscoped base rule at `:177`.

**Runtime — my own measurement, not the spec's.**
`reports/qa/tools/connector-probe.mjs` (QA-owned, imports nothing from `e2e/`)
reads `getComputedStyle(li, "::after")` for all four steps at ten widths against
the clean preview on 4519. Raw output: `reports/qa/tools/connector-head.json`.

```
  320  count=4  rail=42px  01:grid/↓  02:grid/↓  03:grid/↓  04:none/↓
  375  count=4  rail=42px  01:grid/↓  02:grid/↓  03:grid/↓  04:none/↓
  390  count=4  rail=42px  01:grid/↓  02:grid/↓  03:grid/↓  04:none/↓
  767  count=4  rail=42px  01:grid/↓  02:grid/↓  03:grid/↓  04:none/↓
  768  count=4  rail=56px  01:grid/→  02:none/→  03:grid/→  04:none/→
  900  count=4  rail=56px  01:grid/→  02:none/→  03:grid/→  04:none/→
 1180  count=4  rail=56px  01:grid/→  02:none/→  03:grid/→  04:none/→
 1181  count=4  rail=64px  01:grid/→  02:grid/→  03:grid/→  04:none/→
 1280  count=4  rail=64px  01:grid/→  02:grid/→  03:grid/→  04:none/→
 1440  count=4  rail=64px  01:grid/→  02:grid/→  03:grid/→  04:none/→
```

**Rendered output, not computed style alone.** Screenshots of the real `<ol>`:

- `reports/qa/tools/shots-r/process-ol-320.png` — ↓ between 01/02, 02/03, 03/04;
  nothing after 04. Visually inspected.
- `reports/qa/tools/shots-r/process-ol-375.png` — identical pattern.
- `reports/qa/tools/shots-r/process-ol-768.png` — → after 01 and after 03 only.
  Nothing after 02 or 04.
- `reports/qa/tools/shots-r/process-ol-1280.png` — single row, → after 01/02/03.

**Tablet suppression is still required and still correct.** Measured step boxes
at 768 (`connector-head.json`): 01 `left=57`, 02 `left=412`, both `top=-358.81`;
03 `left=57`, 04 `left=412`, both `top=-221.02`. Step 02's right edge is the
sheet edge at 767, i.e. it is genuinely the row-end cell of a 2×2 layout, so
removing its right-facing arrow is the correct behaviour, not a workaround. At
1280 all four share `top=312.98` on one row, so all three interior connectors are
required — which is exactly what is measured.

**The false comment is gone.** `git diff 68518cc..45f3577 -- src/styles/technical-landing.css`
deletes the block containing `(ölçüldü, 375px)`. The replacement comment claims a
*pre-fix* measurement of `grid / none / grid / none` at 320 and 375. That claim is
not taken on trust: my negative control in §21.4 reproduces exactly that reading,
so the comment is now corroborated rather than asserted.

## 21.2 — R2 · The rail bound, and whether it stayed sharp

**The `mobile-320` lane genuinely passes.**

```
PLAYWRIGHT_BASE_URL=http://localhost:4519 npx playwright test \
  --project=mobile-320 --project=mobile-375 --project=mobile-390 \
  e2e/landing/landing-grid-axes.spec.ts
→ 6 passed (28.8s)
```

Both tests in all three mobile lanes are green, including
`the mobile rail does not consume an excessive share of the viewport` at 320,
which was F2.

**Consistent with the docs.** `docs/lean/09-responsive-rules.md:25-32` now states
`Mobil ray payı sınırı: < %14` with the same derivation, and
`docs/lean/06-design-system.md:53-61` states the same in English and points at the
same spec and the `mobile-320` lane. The previously contradicted number (13.1% at
320 vs. a `< 0.13` bound) is now internally consistent: 13.1% < 14%.

**Is 0.14 toothless? No — and here is the proof.** Two controls, both byte-level
edits of the built stylesheet in a *scratch copy* of `dist/`
(`reports/qa/tools/make-dist-variant.mjs`; the real `dist/` and `src/` are never
written).

*Control A — the actual regression.* `--tl-rail: 42px` → `56px` at mobile, i.e.
mobile inheriting the tablet rail, which is the defect the bound guards.
Served on 4539:

```
→ 4 failed  (critical-375, mobile-320, mobile-375, mobile-390)
   Expected: <= 46   Received: 56      (landing-grid-axes.spec.ts:141)
```

So the regression is caught in every mobile lane. Note *which* assertion fires:
the absolute `rail <= 46` bound at line 141 short-circuits before the share bound
at line 161 is ever evaluated. That is a real defence, but on its own it does not
demonstrate that the loosened share bound still has teeth.

*Control B — isolating the share bound.* `--tl-rail: 42px` → `45px`. 45 satisfies
`38 <= rail <= 46`, so lines 140–141 pass and execution reaches line 161. Served
on 4549:

```
  ✘  [mobile-320]  Error: rail share of a 320px viewport
                   Expected: < 0.14   Received: 0.140625   (line 161)
  ✓  [mobile-375]  (45/375 = 0.12)
```

The share bound therefore fires on its own, at the narrowest supported width,
against a rail only **3px** larger than shipped, with **0.000625** of margin. The
headroom the loosening bought is 0.87 percentage points at 320 (13.125% shipped
vs. a 14% ceiling); the defect it guards sits 3.5 pp above the ceiling at 320 and
0.93 pp above it at 375. The bound was widened by one percentage point and
remains strictly tighter than the 15% ceiling `mas-grid-system` implies. **Not
toothless.**

## 21.3 — R3 · Docs and `.tl-header` probe coverage

**The restated rule is one the code satisfies.** `06-design-system.md` rule 2 no
longer claims that every nested dividing block is a subgrid. It now says outer
edges must be on master axes, interiors may be content-measured, and every such
interior must be named — "the enumeration is the permission".
`13-forbidden-patterns.md:27-41` states the same rule in Turkish and names the
same five blocks. `09-responsive-rules.md` carries the rail bound.

**The five are enumerated and each is a probe target.** Cross-checked
`06-design-system.md` "Documented content-measured interiors" against
`scripts/grid-axis-probe.mjs` `PROBE_TARGETS`:

| Enumerated block | Probe target |
|---|---|
| `.tl-header` | `Header · header` → `.tl-header` (added by this correction) |
| `.tl-nexus-kpis` | `Nexus · kpis` |
| `.tl-rfq-body > ol` | `RFQ · steps` |
| `.tl-title-block` | `Footer · title block` |
| `.tl-part-passport` (tablet) | `Hero · part passport` |

These five are exactly `.tl-header` plus the four off-master interiors I found in
F3/S6. I re-enumerated every live `grid-template-columns` in
`technical-landing.css` looking for a sixth *structural* block that divides
content off-master and is not listed: the remaining declarations
(`.tl-mobile-menu nav a`, `.tl-nexus-kpis div`, `.tl-mini-doc`,
`.tl-mini-doc span`, `.tl-cert-table span`, `.tl-faq summary`,
`.tl-footer address`, `.tl-part-passport dl`) are all *inside* a leaf component or
inside an already-enumerated block — none of them is a band-level block that
publishes page tracks. The enumeration is complete as far as this file goes.

**`.tl-header` is now measured, and the documented deltas are true.**
`PROBE_BASE_URL=http://localhost:4519 node scripts/grid-axis-probe.mjs` →
exit 0, full output in `reports/qa/tools/r-probe.txt`:

```
375   Header  header  42.00  C0  0.00   375.00  C4   0.00  4col  OK
768   Header  header  57.00  C0  0.00   767.00  C6   0.03  6col  OK
1280  Header  header  65.00  C0  0.00  1279.00  C12  0.13  12col OK
1440  Header  header  65.00  C0  0.00  1439.00  C12  0.00  12col OK
1600  Header  header  65.00  C0  0.00  1599.00  C12  0.06  12col OK

GRID AXIS PROBE: PASS — every measured edge sits on a master axis (tolerance 1px).
```

Deltas 0.00–0.13px, master 0 → last column at every width — exactly what
`06-design-system.md` now claims. **330 OK rows, 0 OFF_GRID** (was 325 before the
five new header rows). The probe still reports 0 off-grid overall.

## 21.4 — R4 · Can the connector gate fail? (the load-bearing check)

**The expectation table is independently correct.** I did not read the spec's
table and agree with it; I measured the same ten widths with my own instrument
(§21.1) and then compared. Every cell matches, including the point that matters:

| Band | Spec `EXPECTATIONS` | QA measurement |
|---|---|---|
| mobile 320/375/390/767 | `grid grid grid none`, `↓` | identical |
| tablet 768/900/1180 | `grid none grid none`, `→` | identical |
| desktop 1181/1280/1440 | `grid grid grid none`, `→` | identical |

Desktop and tablet **genuinely differ** at step 02 — `grid` vs `none` — and the
difference is justified by geometry I measured rather than by the CSS text: at
768 step 02 is the row-end cell of a 2×2 block (`left=412`, right edge 767, and
03/04 start a new row 137.8px lower), whereas at 1280 all four steps share
`top=312.98` on one row. So the table does not lock in a bug; it encodes the
layout that is actually shipped.

The table is also reachable in both critical projects, because the `sweep` test
resizes one page across all ten widths regardless of project viewport, and the
`native` test re-checks without a resize. `expectationFor()` falls back by
breakpoint rather than skipping for viewports outside the measured set
(`landscape-844`), so no lane silently opts out. `count === 4` is asserted before
the per-step comparison, so an empty `.tl-process li` list cannot vacuously pass.

**NEGATIVE CONTROL — the gate goes red.** I reproduced the original defect the
faithful way, not by injecting an extra late `<style>` (which would also change
source order and so prove less). `reports/qa/tools/make-dist-variant.mjs` copies
`dist/` to a scratch directory and rewrites **one** string *in place* in the built
stylesheet, refusing to run if the match count is not exactly 1:

```
@media (min-width:768px) and (max-width:1180px){.tl-process li:nth-child(2):after{display:none}
                              ↓
@media (max-width:1180px){.tl-process li:nth-child(2):after{display:none}
```

That is literally "move the tablet suppression back into an overlapping
`@media (max-width:1180px)`", at the same cascade position and the same
specificity the defect originally had. Served on 4529, my own probe reads:

```
  320  01:grid/↓  02:none/↓  03:grid/↓  04:none/↓     ← the F1 defect, reproduced
  375  01:grid/↓  02:none/↓  03:grid/↓  04:none/↓
  390  01:grid/↓  02:none/↓  03:grid/↓  04:none/↓
  767  01:grid/↓  02:none/↓  03:grid/↓  04:none/↓
  768+ unchanged
```

This is the same `grid / none / grid / none` the new CSS comment claims was
measured before the fix, which independently corroborates that comment.

Running the shipped gate against that build:

```
PLAYWRIGHT_BASE_URL=http://localhost:4529 npx playwright test \
  --project=critical-375 --project=critical-1280 --project=mobile-320 \
  --project=tablet-768 e2e/landing/landing-process-flow.spec.ts
→ 6 failed, 2 passed (54.2s)
```

with messages that name the step and the width, e.g.

```
"320px (mobile) · step 02 connector · display expected \"grid\", measured \"none\"
 — the vertical list connects every consecutive pair; only step 04 ends the flow"
"375px (mobile) · step 02 connector · display expected \"grid\", measured \"none\" …"
"390px (mobile) · …"   "767px (mobile) · …"
```

The two tests that still pass are the `native` checks in `critical-1280` and
`tablet-768` — correct, because the reproduced defect is mobile-only. The gate is
therefore specific, not a blanket tripwire. **The gate can fail, it fails on
exactly the defect it was written for, and it says where.**

**The real tree is byte-clean.** Both controls wrote only to the scratchpad.
After all experiments, `dist/assets/Index-D_aQBHA0.css` still contains exactly one
`@media (min-width:768px) and (max-width:1180px)` and one `--tl-rail: 42px`, and
`git status --porcelain` lists nothing outside `reports/qa/`.

## 21.5 — Assertion integrity of the `e2e/` diff vs `68518cc`

```
git diff --stat 68518cc..45f3577 -- e2e/
 e2e/landing/landing-grid-axes.spec.ts    |  21 ++-      (1 deletion)
 e2e/landing/landing-process-flow.spec.ts | 212 +++++++   (new file)
 2 files changed, 232 insertions(+), 1 deletion(-)

git diff --stat 68518cc..45f3577 -- e2e/__golden__/     → empty
```

- The single deletion is the `0.13` bound, replaced by `0.14` — the only
  loosening in the diff, and §21.2 proves it retained its teeth.
- No test was deleted, renamed away, `.only`'d or newly skipped. Every
  `test.skip` in the tree is a pre-existing lane selector; none was added or
  broadened by these commits (the grid-axes file's `test.skip(width >= 768)`
  predates the correction and is untouched).
- No golden image byte changed.
- Net coverage change: **+2 tests** in every project that runs
  `landing/**/*.spec.ts`.
