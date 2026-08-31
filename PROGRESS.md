# MAS TECHNIC Autonomous Run Progress

MODE: AUTONOMOUS_AWWWARDS_RUN
BASE_COMMIT: b6f2552aa376edfd678ad0d7465e12aa26d260d3
RUN_BASE_COMMIT: 366f321 (pre-run working tree preserved + plan path normalized)
INTEGRATION_BRANCH: claude/awwwards-90-overhaul
USER_BRANCH_PRESERVED: claude/motion-layer-and-asset-pipeline @ b6f2552 (untouched)
STARTED_AT: 2026-08-31T01:51:28Z
CURRENT_PHASE: 03

## Authority

Precedence for this run (IMPLEMENTATION.md §1.1):
IMPLEMENTATION.md > USER_INPUTS.md > current code/tests > MASTER_CONTEXT.md > CLAUDE.md > other docs.

Release permissions from USER_INPUTS.md §M:
- ALLOW_PUSH_TO_AUTONOMOUS_BRANCH: YES
- ALLOW_MAIN_MERGE: NO
- ALLOW_PRODUCTION_DEPLOY: NO
- ALLOW_PRODUCTION_DATABASE_MUTATION: NO

Publication policy: `INTERNAL_ONLY_UNLESS_PUBLIC_OK`. A fact supplied in USER_INPUTS.md is
internal calibration, never automatic publication permission. Company scale (team size,
facility size, machine count, revenue/order volume) is never exposed by default.

| Phase | Status | Coder commit(s) | QA commit | Tests | Timestamp |
|---|---|---|---|---|---|
| 00 | PASS | fb128e9, 9228086 | b845ff1 | 14 AC/SC checks passed, 0 failed; 4 verification scripts added | 2026-08-31T05:55Z |
| 01 | PASS | 038af33, 9392efb | afe1204, 3f2a2a9 | 77 passed / 0 failed / 2 skipped; coverage 177→205 blocks, 562→629 assertions | 2026-08-31T12:20Z |
| 02 | PASS | 28a4cfe, 39bf6d9, 5b82164, cfe5ad0, 603965e, 8c27d71, 8d395a7, b0110fc, 45f3577 | 68518cc, 26980b5, 67267cc | 76 passed / 1 pre-existing fail / 3 skipped | 2026-08-31T16:40Z |
| 03 | IN_PROGRESS | — | — | — | 2026-08-31T16:40Z |
| 04 | NOT_STARTED | — | — | — | — |
| 05 | NOT_STARTED | — | — | — | — |
| 06 | NOT_STARTED | — | — | — | — |
| 07 | NOT_STARTED | — | — | — | — |
| 08 | NOT_STARTED | — | — | — | — |
| 09 | NOT_STARTED | — | — | — | — |
| 10 | NOT_STARTED | — | — | — | — |
| 11 | NOT_STARTED | — | — | — | — |
| 12 | NOT_STARTED | — | — | — | — |
| 13 | NOT_STARTED | — | — | — | — |
| 14 | NOT_STARTED | — | — | — | — |
| 15 | NOT_STARTED | — | — | — | — |
| 16 | NOT_STARTED | — | — | — | — |

## Assumption log

| # | Phase | Assumption | Basis |
|---|---|---|---|
| A01 | 00 | The pre-run dirty working tree (plan, USER_INPUTS.md, .claude agents/skills, templates, Politikalar PDFs, in-flight `FinalSections.tsx` + `technical-landing.css` edits) was committed onto the new integration branch rather than stashed or discarded. | IMPLEMENTATION.md §3.4 "preserve it"; committing is non-destructive and makes run inputs visible to isolated worktrees. User branch `claude/motion-layer-and-asset-pipeline` remains at b6f2552. |
| A02 | 00 | `implementation.md` was renamed to `IMPLEMENTATION.md` (case-only, content unchanged). | Plan §0 requires the file at repo root as `IMPLEMENTATION.md`; Windows had it tracked lowercase, which would break on case-sensitive CI. Not a content edit, so §3.3 immutability holds. |
| A03 | 00 | `MASTER_CONTEXT.md`'s "forge" palette (molten orange / teal) is treated as historical, superseded by the graphite-charcoal + warm-paper `TechnicalLanding` system. | IMPLEMENTATION.md §1.1 precedence + §1.3 aesthetic tie-break + USER_INPUTS.md `KEEP_CURRENT_TECHNICAL_LANDING_ART_DIRECTION: YES`. |
| A04 | 00 | Worktrees reuse the primary checkout's `node_modules` via a Windows directory junction instead of running `npm ci` per worktree. | Avoids multi-GB duplication; dependency tree is identical since worktrees share `package-lock.json` at the same commit. Baseline `npm ci` is still measured once. |
| A05 | 01 | Three consecutive `mas-coder` background agents were killed by Claude Code process exits before committing or reporting. The Orchestrator committed their surviving on-disk work as a WIP checkpoint `4a76b43` on `wt/coder-p01` rather than letting a fourth interruption lose it. | IMPLEMENTATION.md §3.4 forbids discarding work; committing is non-destructive. The checkpoint is explicitly **preservation, not acceptance** — no build/test/QA has validated it, and the successor Coder was instructed to audit it per-task and treat it as suspect. |
| A06 | 01 | Three stale `.claude/worktrees/agent-*` worktrees left locked by dead PIDs were unlocked, removed and pruned, and their throwaway branches deleted. | They blocked all further agent spawning ("isolation refused"). Each was verified clean (`git status --porcelain` empty) and each sat at a pre-run snapshot whose HEAD would have deleted the entire Phase 00 baseline and QA evidence. Never merged; integration branch was untouched throughout. |
| A07 | 01 | The harness rewrote `.claude/` on disk (adds `name:` keys to ten skill frontmatters; flips `mas-coder` `permissionMode` from `auto` to `bypassPermissions`). The Orchestrator's attempt to commit this was **blocked by the auto-mode permission classifier** and was deliberately left uncommitted. | Committing an agent-permission escalation is a decision for the user, not the agent. The on-disk state already governs subagent behaviour, so the run is unaffected; this is tree hygiene only. Flagged to the user rather than worked around. |
| A08 | 01 | Phase 01 explicitly grants `mas-coder` ownership of `e2e/**`, `playwright.config.ts`, `package.json` scripts and `.github/workflows/**`, which §3.3 otherwise assigns to QA. | IMPLEMENTATION.md §3.3 permits this ("unless phase task explicitly gives Coder ownership"). Phase 01's mandatory tasks require route removal and test repointing as one atomic change; splitting them across two agents would guarantee a broken intermediate state. `mas-qa` still verifies independently and may add its own specs. |
| A09 | 01 | Legacy landing specs are relocated to `e2e/legacy/` and excluded via `testIgnore` rather than deleted, and the legacy tolerance allow-lists (37-entry `KNOWN_V1_SEMANTIC_VIOLATIONS`, 7-selector `KNOWN_MOBILE_CONTRAST_TARGETS` tolerating *serious* axe contrast failures) stay with them. | Valid only because those specs test `/legacy-landing`, which this phase makes dev-only. This is **not** permitted as a way to hide failures: no tolerance allow-list may enter the production suite, and real violations the honest new suite exposes on `/` must be reported, not allow-listed. Phase 13 owns fixing them. |

## Phase notes

---

### Phase 00 — AUTONOMOUS BOOTSTRAP, BASELINE AND REQUIREMENT LOCK — PASS

**Coder commits:** `fb128e9` (CLAUDE.md autonomous-run exception, +42/-0 additive), `9228086` (baseline capture, 47 files)
**QA commit:** `b845ff1` — `reports/qa/phase-00.md` + 4 verification scripts under `reports/qa/tools/`

**Assumptions:** A01–A04 above. Additional Phase 00 assumptions accepted by the Orchestrator:
- Real `npm ci` substituted with `npm ci --dry-run` + `npm ls --depth=0` because worktree
  `node_modules` is a shared Windows junction; a destructive reinstall would have corrupted the
  primary checkout. Lockfile sync was still proven. A real `npm ci` is deferred to the Phase 16
  clean checkout.
- Build/test/capture were run twice: without and with `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY`. Without them the React tree does not mount at all, so the
  env-less results are environment artefacts, not repository defects. Both are recorded side by
  side so no ambiguous "27 failures" number is inherited. Orchestrator verified no credential
  value reached any committed file (`reports/qa/tools/scan-report-secrets.mjs` → 0 hits, re-run
  independently).
- Playwright drives a locally installed Chrome because bundled revision 1217 is absent on this
  host — the same fallback `playwright.config.ts` already implements. Logged as blocker B08.
- Baseline screenshots were captured under emulated `prefers-reduced-motion: reduce` with
  animation durations zeroed, for determinism. They therefore show the reduced-motion rendering;
  this is stated in `visual/INDEX.md` rather than left implicit.

**Files materially changed:** `CLAUDE.md` (additive section only); `reports/baseline/**` (10 reports,
6 tools, 19 raw logs, 11 screenshots + manifest); `reports/qa/phase-00.md`; `reports/qa/tools/**`.
Zero `src/**`, `public/**`, `index.html`, `e2e/**`, build-config or `.github/**` changes — verified
by `git diff 366f321 9228086 -- e2e/ src/ public/ index.html package.json playwright.config.ts .github/` (empty).

**Orchestrator independent verification (not taken from subagent summaries):**
- Full `git diff --name-status` reviewed: scope clean for both agents.
- `CLAUDE.md` diff read line by line — purely additive, no existing rule removed or reworded.
- 739-ID coverage re-parsed independently: 739 distinct IDs, 0 gaps, 0 out-of-range.
- QA's `verify-traceability.mjs` re-run by the Orchestrator: `ROLLUP_MISMATCHES: 0`, `VERDICT: PASS`.
- Secret scan re-run by the Orchestrator: `TOTAL_HITS: 0` across 49 text files.
- All 11 baseline PNGs validated as real PNGs whose IHDR dimensions match `manifest.json`.

**QA failures/corrections:** None. Zero correction loops required.

**Deferred non-blockers:** None deferred out of Phase 00. The 22 baseline blockers (B01–B22) are
*findings*, not Phase 00 failures — Phase 00's job was to find them. Ownership per §8:
Phase 01 → B02, B03, B04, B05, B07, B09, B15; Phase 03 → B14; Phase 05 → B17;
Phase 06 → B13; Phase 08 → B16; Phase 10/12 → B06; Phase 11 → B10, B11, B12, B15;
Phase 12 → B01, B18, B19, B21; Phase 13 → B08.

**Baseline headline numbers (locked as the "before" state):**
build PASS · 3 chunks >500 kB (largest `OBJLoader` 858.06 kB raw / 232.24 kB gzip) ·
initial landing JS 777.8 kB across 36 chunks · lint 0 errors / 1 warning ·
`tsc -p tsconfig.app.json` 0 errors (root `tsc --noEmit` type-checks **zero** files) ·
784 e2e tests = 16 specs × 8 projects, of which **504 (64%) assert against `/legacy-landing`** ·
npm audit 18 vulns (0 critical / 15 high / 3 moderate) · 24 distinct public URL surfaces,
3 of them preview/dev · 41 `UNVERIFIED_MUST_REMOVE` + 8 `DEMO_PLACEHOLDER` public claims.

---

### Phase 01 — REPOSITORY TRUTH, CI RECOVERY, LEGACY LANDING CLEANUP — IN_PROGRESS

**Scope:** requirement IDs 111–162, 424–430. Owns baseline blockers B02, B03, B04, B05, B07, B09, B15,
plus a bounded slice of B01 (root ErrorBoundary only) and B06 (LCP preload correction).

**Run-integrity events (recorded because they materially shaped how this phase executed):**

| # | Event | Resolution |
|---|---|---|
| 1 | Coder agent #1 killed by process exit mid-phase; no commit, no report. | Work survived uncommitted in the assigned fixed worktree. Resume via SendMessage failed — harness worktree unverifiable. |
| 2 | Coder agent #2 killed the same way; advanced the work but still never committed. | Orchestrator committed everything as WIP checkpoint `4a76b43` (assumption A05). |
| 3 | Coder agent #3 spawn **refused** — three stale locked `.claude/worktrees/agent-*` blocked isolation. | Unlocked, removed, pruned; throwaway branches deleted (assumption A06). |
| 4 | Coder agent #4 launched with a mandatory anti-interruption protocol: commit after each of seven named verified milestones instead of once at the end. | Running. |

**Checkpoint `4a76b43` contents (36 files, +1400/-293 vs `076c16a`) — UNVERIFIED:**
`src/routes/DevRoutes.tsx`, `src/lib/hero-shell.ts`, `src/components/ErrorBoundary.tsx` (extended),
restructured `playwright.config.ts` + `.github/workflows/playwright.yml`, `index.html` preload change,
`vite.config.ts` change, `package.json` scripts, `vitest.config.ts` deleted, nine specs relocated to
`e2e/legacy/`, new `e2e/landing/` (5 specs), `e2e/smoke/`, `e2e/visual/`, and win32 goldens at
375/1280/1440.

**Outstanding at time of writing:** verification. Nothing in `4a76b43` has been built, type-checked,
linted or tested. The open questions are whether the dev routes genuinely vanish from `dist/`, whether
`#hero-shell` is actually removed on `/`, whether the corrected preload resolves `200` + `image/*`,
and whether the rebuilt critical suite passes against the real landing.

**OUTCOME: PASS.** Coder commits `038af33` + `9392efb`; QA commits `afe1204` + `3f2a2a9`
(`reports/qa/phase-01.md` + 4 probe tools). Zero correction loops.

**What Phase 01 actually changed:**
- `/technical-preview`, `/legacy-landing`, `/test` dev-gated behind `import.meta.env.DEV` via
  `src/routes/DevRoutes.tsx`. Verified both directions: `dist/` contains no chunk referencing them and
  all three 404 in preview, yet all three still render under `npm run dev`.
- `#hero-shell` teardown moved to `src/lib/hero-shell.ts`, owned by the app entry rather than by
  `TechnicalLanding` — because `index.html` emits the shell on *every* route, so a landing-scoped owner
  would leave it orphaned on `/sss`, `/teklif-al` etc. Three guaranteed paths: never-installed →
  immediate; `mas:intro-done` → removal; 7000 ms fallback net; plus a race guard.
- `PublicRouteLoader` now keys off `isHeroIntroActive()` (element present AND `data-intro` AND
  `<html data-intro-active>`) instead of mere element existence, which had permanently disabled the
  Suspense fallback on `/`.
- The phantom LCP preload replaced by a `transformIndexHtml` Vite plugin reading the emitted hashed
  filename from the bundle. It **throws the build** if the asset is absent rather than emitting a wrong
  preload, so the original failure mode cannot silently return.
- `e2e/helpers.ts` no longer rewrites `/` → `/legacy-landing`. `LANDING_SCENE_IDS` corrected to the
  seven anchors the landing really exposes. Nine legacy specs relocated to `e2e/legacy/` behind
  `PLAYWRIGHT_LEGACY=1`; five new production specs added under `e2e/landing/`, plus `e2e/smoke/` and
  `e2e/visual/`.
- `npm run typecheck` added and proven meaningful: 267 app + 25 e2e files, versus **0** for bare
  `tsc --noEmit` (B09 confirmed real, then fixed).
- CI restructured from one unfinishable 784-combination job into `quality` → `build` → `e2e-critical`
  (62) + `e2e-smoke` (12), with `visual` (3) and a dispatch-only `e2e-regression` (536). 62+12+3+536 =
  613 = measured `--list` total.
- `vitest.config.ts` deleted (referenced a nonexistent setup file; `vitest` was never a dependency).
- Root `ErrorBoundary` mounted so a missing `VITE_SUPABASE_URL` degrades to a branded fallback.

**Orchestrator independent verification (not from subagent summaries):**
- Full `git diff --name-status` reviewed for both agents: every path inside its allowlist; no `src/pages/**`,
  `supabase/**`, admin or customer-panel change.
- Read `src/lib/hero-shell.ts` and the `vite.config.ts` preload plugin line by line.
- Re-ran `reports/qa/tools/phase-01-coverage-diff.mjs`: reproduced 177→205 test blocks, 562→629
  assertions, 57→56 skips exactly. Coverage increased; it was not traded for green.
- Confirmed the tolerance allow-lists exist only in `e2e/legacy/landing-flow.spec.ts`; the sole mention
  under `e2e/landing/` is a docblock stating none is inherited.
- Confirmed both surviving `.lf-*` references in the active suite are `toHaveCount(0)` negative assertions.

**QA-proven items the Coder had left unproven:**
- Hero-shell fallback timeout genuinely fires: QA patched `dispatchEvent` to swallow `mas:intro-done`
  and measured teardown at **7040 ms** against the declared 7000 ms constant.
- Golden diffs genuinely compare: QA copied `dist/`, injected a red background into the **copy** only,
  and ran the unmodified spec against committed baselines — 13,015 px (375) and 27,758 px (1280) of
  diff, both FAILED against a 200-px budget. A pass is therefore not a silent re-capture.
- ErrorBoundary upgraded UNPROVEN → PASS: a scratch build with an empty `VITE_SUPABASE_URL` (real
  `.env` untouched) renders the branded fallback on 4/4 routes with a working recovery link.

**Discrepancies QA found (all recorded, none blocking):**
- The legacy allow-list has **36** entries, not the 37 stated in the baseline, in the Coder's report and
  in a code comment at `e2e/landing/landing-accessibility.spec.ts:9`. Documentation-only; the list is
  byte-identical across the move and is legacy-only. To be corrected when that file is next touched.
- Warm build measured 44.52 s vs the Coder's claimed 1 m 13 s (faster; no criterion depends on it).
- The Coder's "73,024-pixel" negative control was **not reproduced**; QA designed its own and reached
  the same conclusion. That specific number must not be cited as evidence.

**Deferred, with owners — carried forward as live assertions, not TODOs:**
- **B14 → Phase 03.** The production landing mounts no global shell: **no `[data-menu-trigger]` and no
  fullscreen navigation at all**. The whole `fullscreen-menu` suite had to be rehosted on `/sss`, and `/`
  moved out of the 90-route full-shell contract into an explicit exception `{ header: 0, footer: 1 }`
  (contract 90→88 full-shell, 95→94 total). That exception is a real assertion that **turns red when
  Phase 03 connects the landing to the global IA** — intentional.
- `/` prints its own `.tl-footer` with no `© YYYY MAS TECHNIC` bottom bar, so it sits outside the shared
  `footer-reveal` and `scroll-snap-regression` contracts; its End-key journey is covered separately.
- **VISUAL-BASELINE-GAP-LINUX.** Only win32 goldens exist, so the CI visual job's guard always trips and
  golden diffing has **zero CI coverage** today. Deliberate — auto-creating a linux baseline would be a
  false green — and surfaced as a `::warning` plus job summary. Golden coverage is local-only until a
  linux baseline is captured.
- **B08-class local engine drift.** Chromium falls back to local Chrome; Firefox/WebKit fall back to
  newer installed revisions than Playwright 1.59 pins. The fallback is CI-excluded, so CI determinism is
  unaffected, but local smoke results come from non-pinned engines.
- `e2e/legacy/**` runs only under `PLAYWRIGHT_LEGACY=1` and is attached to no gate — correct for a
  dev-only route, but unguarded drift surface that will silently rot.
- `decision-support.spec.ts` retired **without** replacement: the component exists only on the legacy
  landing. Verified as genuinely legacy-only, not production coverage parked out of the way.

**Notable finding:** with every tolerance list removed, `/` returns **zero** serious/critical axe
violations at 375 and 1280, one `<h1>`, no skipped heading levels, and a working skip-link target. The
36-entry allow-list was masking legacy-landing debt, not homepage debt.

---

### Phase 02 — MASTER DESIGN SYSTEM + 12-COLUMN GRID RECONSTRUCTION — PASS (after 2 correction loops)

**Coder:** `28a4cfe`, `39bf6d9`, `5b82164`, `cfe5ad0`, `603965e` (initial); `8c27d71`, `8d395a7`, `b0110fc`
(correction #1); `45f3577` (correction #2). **QA:** `539ab6d`-`68518cc` (FAIL), `26980b5`, `67267cc` (PASS).

**Outcome:** the landing grid is now *structural*, not merely drawn. Every band derives from one master
12-column system; **0 off-grid edges** across 330 measured block edges at 375/768/1280/1440/1600
(Orchestrator re-ran the probe independently and reproduced PASS).

**Arbitrary values eliminated** (all verified absent as live declarations; they survive only inside
"BEFORE:" comments): `23.8%`, `19.2%`, `4.6%` (Nexus) -> 3/9; `35%/65%`, `48%/52%` (Projects) -> 6/6 and
master spans; fixed `132px` seventh track (Quality) -> six 2-col cards, stamp evicted to an 11-12 span;
`4fr/5fr/5fr` = **14 units** (RFQ) -> 3/4/5 = 12; `43fr/77fr` (Footer) -> 4/8; FAQ 7/5 now on master
boundaries with the column-gap moved into child padding; Process no longer re-declares `repeat(12,1fr)`
inside a padded body. Hero enforces real 4/6/2 with the 42px/59px compensating passport margins removed.
Tablet Process empty sixth column fixed (intro C0->C3, figure C3->C6). Mobile rail set explicitly to 42px
(was silently inheriting the 56px tablet value: 14.9% of a 375px viewport, 17.5% at 320).

**QA FAIL #1 -> 3 defects, all fixed:**

- **C1 (serious).** Mobile 02->03 process connector missing at 320 and 375. Root cause was **specificity,
  not source order**: `.tl-process li:nth-child(2)::after` (0,2,2) inside `@media (max-width:1180px)` --
  which also matches every mobile width -- beat the mobile rule (0,1,2). Fixed **structurally** by moving
  the tablet exception into `@media (min-width:768px) and (max-width:1180px)`; the intervals are now
  disjoint, so no future specificity change can make it leak. The rule was preserved verbatim, not deleted.
  Aggravating factor: a code comment claimed the fix was measured at 375px when it never had been. That
  comment is gone, and truthful comments were made an explicit acceptance criterion.
- **C2.** `landing-grid-axes.spec.ts` asserted `rail/width < 0.13` while the same authored docs stated
  13.1% at 320; 42/320 = 0.13125, so the `mobile-320` lane -- never run -- was red. Fixed by correcting the
  *assertion*, not the rail: 42px is inside the skill 40-44px range, so shrinking it would have changed
  correct geometry to satisfy a wrong number.
- **C3.** Docs stated grid rules as absolutes that four blocks legitimately violate internally. Rewritten
  to the real rule -- outer edges of every structural block land on master axes; internal subdivision may
  be content-measured **and must be named** -- with five interiors enumerated. `.tl-header` added to the
  probe, so the one documented exception is now *enforced* rather than asserted (delta 0.00-0.13px).

**Correction #2 -- the gap the Coder flagged against its own interest.** Nothing automated protected the
connector: the Playwright per-pixel colour threshold let an **80,602-pixel** byte-level golden delta still
compare as a match. New `e2e/landing/landing-process-flow.spec.ts` asserts computed `::after` display *and*
arrow glyph per step, from a table **measured at ten widths** including the breakpoint edges 767/768 and
1180/1181. It found desktop genuinely differs from tablet (`grid/grid/grid/none` vs `grid/none/grid/none`);
assuming uniformity would have locked in a bug.

**Negative controls -- the evidence that matters most (all QA-run, none taken on trust):**

- **The probe is not self-confirming.** Restoring pre-Phase-02 declarations over a copy of `dist/` gave
  **173 OFF_GRID**; an invisible 3px nudge gave **20 OFF_GRID**.
- **The connector gate can fail.** Reinstating the original leak in a scratch `dist/` (same cascade
  position, same specificity) gave **6 failed / 2 passed**, e.g. `320px (mobile) - step 02 connector -
  display expected "grid", measured "none"`. The 2 passes are the 1280/768 native lanes -- correct, the
  defect is mobile-only.
- **The golden gate is blind to this defect.** `visual-375` **passed** against the defect build, proving
  the new spec is not redundant and that goldens alone would never have caught it.
- **The C2 bound is not toothless.** The real 56px regression short-circuits on the earlier
  `rail <= 46` assertion, so QA built a second 45px control that reaches the share bound and fails at
  `0.140625` vs `< 0.14` -- a margin of 0.000625.

**Goldens deliberately left byte-unmodified.** The connector fix causes **zero layout shift** (40/40 step
boxes identical in top/left/width/height between fixed and defect builds), and a forced regeneration
showed an 80,602-pixel delta that was unrelated rasterisation drift. Committing it would have imported
noise, so the committed goldens were restored bit-for-bit. QA confirmed `git diff -- e2e/__golden__/` empty.

**Orchestrator independent verification:** ran the grid-axis probe (PASS, 0 off-grid); opened
`process-375.png` and saw the missing 02->03 arrow directly; confirmed the disjoint media-query fix in the
CSS; ran the new connector spec (4/4 green in both critical projects); confirmed `src/index.css` is
byte-identical to base for R5; confirmed all banned values survive only in comments.

**ORCHESTRATOR-ACCEPTED SCOPE DEVIATION.** The Coder edited `e2e/technical-landing.spec.ts`, outside its
WRITE_ALLOWLIST. **Accepted -- this was a defect in my contract, not misconduct.** The file was not in
DO_NOT_TOUCH, and my own packet instructed updating stale expectations rather than deleting assertions;
my allowlist simply failed to enumerate it. Both edits are *strengthenings*: the old
`expect(["56px","64px"]).toContain(rail)` **literally asserted the defect** and was widened to include
42px **plus a new measured `rail/viewportWidth < 0.15` bound that did not exist before**; the footer nav
range narrowed from 5% wide to 3% wide. Nothing deleted, skipped or loosened. The Coder disclosed it
prominently rather than burying it.

**NOT QA-VERIFIED -- do not cite.** The Coder claim of "184 off-grid edges at base" and its
"73,024-pixel golden negative control" were **not** reproduced. QA measured **173** off-grid with its own
instrument (a lower bound, since its override restores only band-body geometry) and designed its own pixel
controls. The `0` at HEAD is QA-verified; `184` and `73,024` are Coder-reported only.

**NEW BLOCKER -- B23, owner Phase 03.** `e2e/shared-shell-accessibility.spec.ts:595` fails reproducibly in
the `mobile-320` lane. **Proven PRE-EXISTING**, not a Phase 02 regression: QA built base commit `9133415`
from `git archive` in scratch and reproduced the failure there, with every replayed measurement
byte-identical at both commits. Root cause is **not** the Coder hypothesis -- the button *is* in the DOM
(`ariaLabelSelectorCount 1`) but `src/index.css:335` deliberately sets `.floating-scroll-top{display:none}`
below 768px (with a comment explaining the fixed header provides the same access), while the spec is pinned
by `test.skip(... !== "mobile-320")` to assert it **visible** at 320. A product decision and a test assert
opposite things, and have done since before this run. A second pre-existing fault in the same spec races
the header entrance transform (12.89/15.36 at head, 19.64 at base; exactly 23 on both after a 2s settle).
Needs a product decision plus a test-side settle fix.

**Carried forward, unchanged:** VISUAL-BASELINE-GAP-LINUX (win32 goldens only; golden diffing still has
zero CI coverage); B08-class local engine drift; content defects on the Quality/Nexus/Projects bands
(fabricated CMM report number, `status="demo"/"sample"` data, decorative verification QR) -> Phase 06;
768px hero photo clipping and the void under the CTA -> Phase 10; >500 kB chunks -> Phase 12.

**Documented intentional grid break (one only):** band 01 header keeps an internal `210px 1fr auto`
because two master columns are 202px at 1280 and the quote button plus language switch overflow that. Its
**outer** edges sit on master C0/C12 at every width (QA-measured, delta 0.00-0.13px). Phase 03 owns global
navigation and should revisit it.
