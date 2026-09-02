# MAS TECHNIC Autonomous Run Progress

MODE: AUTONOMOUS_AWWWARDS_RUN
BASE_COMMIT: b6f2552aa376edfd678ad0d7465e12aa26d260d3
RUN_BASE_COMMIT: 366f321 (pre-run working tree preserved + plan path normalized)
INTEGRATION_BRANCH: claude/awwwards-90-overhaul
USER_BRANCH_PRESERVED: claude/motion-layer-and-asset-pipeline @ b6f2552 (untouched)
STARTED_AT: 2026-08-31T01:51:28Z
CURRENT_PHASE: 06

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
| 03 | PASS | 4937757..1d5ea91 (9), c72fd99, 4066b41, d3822b8 | 1c7e5df, ab8c585, 46d64a8, 02ab2c2 | 220 passed / 4 pre-existing page-debt fails / 3 skipped | 2026-09-01T06:10Z |
| 04 | PASS | 7d01465, d2c7dc1, 6a3bc84, f3cd3f5, a059aef, 9809889, 829cadf, 94f87c3, fe42ce8 | 141fc06..9ad97de (5), 3586e43..3350203 (7) | 202 passed / 0 failed / 3 skipped | 2026-09-02T04:20Z |
| 05 | PASS | 05a: 46ae7f4..e1bc431 (6); 05b: a133728..3f45fd5 (6), 5ff0cae, c3797e5, 7cefcf0 | 05a: 5313739..ca797a5 (4); 05b: e4e626d..5d58889 (5), 3b6cf36..2d7adcd (5) | 198 passed / 0 failed / 3 skipped | 2026-09-02T17:05Z |
| 06 | IN_PROGRESS | — | — | — | 2026-09-02T17:05Z |
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

---

### Phase 03 — GLOBAL AWWWARDS NAVIGATION + INFORMATION ARCHITECTURE — PASS (after 1 correction loop)

**Coder:** `4937757`, `e58a088`, `c3183d1`, `4c6ac37`, `8c2549c`, `9a1fcc3`, `e9b1c6e`, `b6ab1d3`, `7b99416`
(initial, 42 files +2550/-1006); `c72fd99`, `4066b41`, `d3822b8` (correction #1).
**QA:** `1c7e5df`, `ab8c585` (FAIL); `46d64a8`, `02ab2c2` (PASS).

**Outcome.** Three parallel public headers are now one. `HeaderFullscreen.tsx`, `TechnicalHeader.tsx` and
all of `src/components/menu/**` (including the competing `menu-tokens.ts` motion vocabulary) are
**deleted**; `src/components/Header.tsx` is the real component rather than a one-line alias. A single
typed IA (`src/components/navigation/ia.ts`) feeds the menu, the inner footer and the landing footer,
replacing three parallel link taxonomies. B14 is closed: the landing is reachable from, and reaches, the
whole site.

**IA coverage (QA independently re-derived: 26 public routes, 74 targets, 0 orphans, 0 dev leaks):**
3 families x 5 categories = 15 categories over 48 unique detail routes; the 7 real landing anchors
addressed as `/#id` so they work from any page; resources, company, legal, account groups; RFQ as one CTA
never duplicated as a plain link. Deliberate exclusions each carry a recorded reason
(`/sifremi-unuttum`, `/reset-password`, `/cad-dashboard`, `*`, and the three dev-only routes).

**Two real orphans found and fixed, not papered over:** `/kabiliyetler/malzeme-kutuphanesi` (a real
capability page nothing linked to) and `/endustriyel/kategori/seri-uretim` in the inner footer (a slug the
app never serves; correct slug is `seri-uretim-endustriyel`). Two further footer links pointed at
`/#hizmetler` and `/#kabiliyetler`, anchors that do not exist; deriving the footer from the IA removed
them. The two mis-targeted entries the Phase 00 baseline flagged are relabelled
(`Vizyon & Misyon -> Teknik Gunluk`, `Kariyer -> Sik Sorulanlar`).

**Shell contract:** full-shell routes 88 -> **89** (`/` added), total public surfaces 94 -> 94 (`/` moved
from the exception set into the full-shell set). Asserted by an explicit `toContain("/")` alongside the
count. The Phase 01 `{ route: "/", header: 0, footer: 1 }` exception is removed **because it reached the
purpose Phase 01 wrote it for** — this is the one intended expectation change in the run so far.
`e2e/fullscreen-menu.spec.ts` moved back to `/` and gained a lane requiring the menu structure on `/` and
`/sss` to be `toEqual`.

**B23 resolved as a product decision — option (a).** The floating scroll-top control genuinely should not
exist below 768px: the global header is now fixed at every width with a brand link reachable without
scrolling, so the floating control duplicated an always-visible one; at 320 it overlaid footer card text
(the original measured reason); and the landing never had one. `src/index.css` is **comment-only** changed
— the `display:none` rule is untouched — and the spec was corrected at **both** affected widths (320 and
375; the 375 reduced-motion lane carried the identical contradiction and was also failing). Nothing was
deleted: each width now asserts absence from the role tree **and** that `.floating-scroll-top` computes
`display:none`, so re-exposing it without updating the rule still fails.

**Band-01 grid break retired.** With the inert TR/EN switch removed the actions cluster fits three master
columns, so `.tl-header` is now a `subgrid` landing on master axes and the probe measures its **interior**
as well. The documented content-measured interiors table drops 5 -> 4 entries. Probe: 0 off-grid.

**Two defects the new contracts exposed, both fixed:** (1) landing anchor navigation did nothing —
`finishExit` ran inside the Framer exit callback and React committed the modal cleanup, which restores the
opening scroll position, *after* it, so every click moved the band and was snapped back to 0; (2) two
header instances existed during every route transition, so `[data-menu-trigger]` resolved to 2 elements on
Back. Ownership is now arbitrated in the component, so `/giris`, `/reset-password` and the 404 still have
no header.

**QA FAIL -> C1: a WCAG 2.1 SC 2.1.2 keyboard trap.** Under `prefers-reduced-motion: reduce`, opening the
menu **sealed the user inside it**: ESC, the close button and menu links all inert; scroll locked; `#root`
`inert` + `aria-hidden`; only a reload recovered. Measured at 320/375/1280 on `/` and `/hakkimizda`.
Root cause: `animate="visible"` with `exit={reducedMotion ? "visible" : "exit"}` made the exit target
identical to the animate target, so Framer scheduled no exit animation, `onExitComplete` never fired, and
`finishExit` — the only caller of `setPhase("closed")` and `navigate(pendingHref)` — never ran. A genuine
regression: the deleted `HeaderFullscreen` used `exit={{opacity:0}}`, a real 1->0 change even at duration 0.

**Why every gate stayed green** — the finding that mattered most. `fullscreen-menu.spec.ts` held both
halves but never together: one test opened and ESC-closed *without* reduced motion; another opened *under*
reduced motion and never closed. The visual spec opened under reduced motion but only screenshotted.

**The fix removes the fragility, not the symptom.** `AnimatePresence` is gone from `Header.tsx`; the sheet
is conditionally rendered and `settleClose` is scheduled by an effect on `phase === "closing"` with a timer
(0 ms reduced motion, 900 ms otherwise). `onAnimationComplete` is now only an accelerator. Idempotency via
`phaseRef`, set *before* `setPhase` to close the race window. The Coder explicitly declined the shortcut of
giving the reduced-motion variant a token opacity change to coax the callback into firing.

**QA verification of the fix (all its own instruments):** 36/36 teardown cells across
{320,375,1280} x {`/`,`/hakkimizda`} x {reduce,no-preference} x {Escape, close button, link}, each
asserting overflow restored to its exact pre-open value, `inert`/`aria-hidden` cleared, focus back on the
trigger, and a real wheel gesture moving `scrollY`. Seven adversarial attacks x two motion modes could not
re-latch it; re-opening 200 ms into a close leaves it open and past both timers, then closes cleanly; never
a `historyDelta` of 2. **R4 red-then-green reproduced independently**: pre-fix `Header.tsx` built in a
scratch tree gives 6 failed / 6 passed, the six failures exactly the reduced-motion cases. **R5**: renaming
a slice marker now turns both static reachability tests red instead of passing vacuously. **R6**: measured
settle 662 ms full motion / 46 ms reduced against a 900 ms net, so the net never fires in practice.

**TWO CODER CLAIMS QA OVERTURNED — do not carry these forward as written:**
1. **The `"opening" -> "open"` phase did NOT have "the identical hole."** At `d01851e` its only readers
   were `isVisible = phase === "opening" || phase === "open"` and the self-transition, so a stuck
   `"opening"` was inert. The added net is sound hardening, **not** a second trap discovered. (The
   Orchestrator had relayed the Coder's stronger claim to the user and corrected it on QA's evidence.)
2. **R7 is not deterministic.** The Coder reported the reachability history test failing deterministically
   under `PLAYWRIGHT_ARTIFACTS=0`; QA measured 1 of 4 invocations passing there and 1 of 5 *canonical*
   runs failing. It is **flaky**, not deterministic, and not canonically green either.

**Golden regeneration audited and accepted.** The Coder's "0.03-0.04 of pixels" was **not reproducible**;
the real figures are 11.83/12.84/13.22 % of pixels non-identical at any amplitude and
**0.100/0.136/0.119 %** at amplitude >= 16/255, with a **-1 px** height change (not +1). Meaningful change
is confined to three regions, all intended: the header band, the two footer relabels, and a 46-pixel
Phase-02 process-arrow fix the goldens had never absorbed. Everything else peaks at amplitude 2-3/255
(webp re-rasterisation). No unrelated region changed. The nine goldens are byte-unchanged across the
correction packet.

**Accessibility:** zero serious/critical axe violations on the navigation itself, closed and open, at 1280
and 375, including under reduced motion. Every visible menu control >= 44px at all 8 viewports; safe-area
tokens honoured on all four edges at 320; keyboard-only traversal of 3 families -> 15 categories -> 48
detail links verified at mobile-320 with no hover and no programmatic focus.

**NEW CARRY-FORWARDS:**
- **B24 -> Phase 07 + Phase 13.** `src/pages/ServiceDetail.tsx` carries **28 serious `color-contrast`
  violations plus 1 `scrollable-region-focusable`** on `/hizmetler/cnc-frezeleme`, failing 4 lanes. Page
  debt in a file Phase 03 never touched; also present on `Blog` and `Malzemeler`.
- **B25 -> owner of `src/components/PageTransition.tsx` (Phase 04).** `navigation-reachability.spec.ts`
  "keeps deep links and history navigation correct" is **flaky**: after `page.goForward()` with the menu
  open the incoming page never mounts, so the `location.key` effect is never told the route changed.
  `--repeat-each=8` gives 8/8 failures on the unmodified pre-fix header vs 7/8 at `ec7da26`. **PRE-EXISTING
  and a test-harness artefact** — driven as a user would (17 attempts), the menu cleared in 520-641 ms
  every time with 0 latches.
- **B26 -> minor.** Nothing enforces `MENU_SETTLE_FALLBACK_MS (900) > NAV_MOTION.open (620)`. Safe today
  with 280 ms headroom and documented on the line above the constant; a one-line assertion would close it.
- **B27 -> Phase 07.** The Coder reported a breadcrumb clipped by 8px on `/hizmetler/:slug` and
  `/endustriyel/:slug` at <=767. QA **could not reproduce it**: all 11 routes x 3 widths measure
  `clippedBy = 0`. Recorded as over-reported, not as a defect.
- Unchanged: `TeklifAl.tsx` imports `Footer` and never renders it (Phase 04); ~130 lines of dead
  `.menu-*` / `.shared-public-header` CSS still ship on every route (Phase 04/12); `design-tokens.css` is
  inlined into two CSS chunks (Phase 12); `SoundToggle.tsx` / `ThemeToggle.tsx` are now unreferenced files;
  inner-page vertical rhythm shifted 64-72px now the fixed bar is reserved in flow (Phase 04/07);
  `navigation-data.tsx` survives as a documented compatibility re-export because dev-only `LandingFlow.tsx`
  imports `navigationItems`; win32-only golden gap.

---

### Phase 04 — GLOBAL PUBLIC PAGE SHELL + ROUTE TRANSITIONS — PASS (after 1 correction loop)

**Coder:** `7d01465`, `d2c7dc1`, `6a3bc84`, `f3cd3f5`, `a059aef` (initial, 90 files +3002/-1726);
`9809889`, `829cadf`, `94f87c3`, `fe42ce8` (correction #1).
**QA:** `141fc06`-`9ad97de` (FAIL, 5 commits); `3586e43`-`3350203` (PASS, 7 commits).
One earlier QA run was lost entirely to an API error with zero commits — the incremental-commit
protocol was tightened as a result.

**Outcome.** One `PageShell` owns frame, grid, rail, navigation mount, footer and transition contract
across 20 route families at 3 widths. `Footer.tsx`, all of `src/components/footer/**` and
`ScrollProgress.tsx` are **deleted**; the landing drawing title block survived as the single
`SiteFooter`. 19 pages migrated. Every inner page lost ~1,100px of mega footer; `/teklif-al` has a
footer for the first time (it imported `Footer` at line 54 and never rendered it).

**Primitives exposed for Phases 07/08:** `ShellBand`, `ShellPageHero`, `ShellSurfaceBand`,
`ShellTitleBlock`, `ShellMetaRow`, `ShellEvidence` (its `source` prop is **type-required**, so an
evidence block cannot render without saying where the figure came from), `ShellDivider`, and
`ShellLoading` / `ShellEmpty` / `ShellRouteError` / `ShellRouteBoundary`. Top rhythm settled in one
place (`--shell-page-top`), removing the per-page `pt-24`/`pt-28` drift.

**B25 closed structurally.** Root cause: `PageTransition` kept the outgoing page mounted through an
`AnimatePresence` exit, so two route subtrees and two `<Header/>` instances lived ~480ms per
navigation, while the open menu released its scroll lock / `inert` / `aria-hidden` from an effect
cleanup owned by a component *inside* the routed subtree. Fix: exactly one route subtree mounted at
any time, so React's own unmount cleanup releases the lock — no listener, no timeout. Verified 8/8 by
two independent methods and 16/16 under `--repeat-each=8`; the curtain still animates (1.06s).

**QA FAIL -> 3 defects, all fixed:**

- **D0 (serious): a regenerated golden enshrined a live regression.** `master-grid.css:45` declares the
  base `.tl-sheet{border-inline:...}`; both `technical-landing.css:4` and `shell.css:21` `@import` it,
  so Rollup emitted the base into **both** chunk stylesheets while the `<=767px` override lived in only
  one. On `/` the landing chunk loads last and re-declared the base at equal specificity. Measured: `/`
  was `1px/1px` at 375 while every other route was `0px/0px`. The 2px narrower field wrapped the hero
  dimension string, cascading ~15px over ~8100 rows, and shifted the whole mobile body **1px right**.
  A third, independent confirmation came from the Coder's own artefacts: `shell-footer-home.png` was
  **373px** wide against 375px on every other shell-footer golden — the snapshots made to prove "one
  shell" recorded the landing being off-contract, and nobody looked.
  **Fixed by ownership, not by force:** the override now sits in `master-grid.css` directly beneath the
  declaration it overrides, so it is inlined into exactly the chunks its base is. No `!important`, no
  specificity bump. The two 375 goldens were regenerated **from the fixed build**
  (`shell-footer-home` 373->375px; `landing-fullpage` 8969->8962px); 1280 and 1440 byte-unchanged.
- **D1: the shell introduced a new serious axe node.** `scrollable-region-focusable` went 1 -> 2 at 1280
  on `/hizmetler/cnc-frezeleme` because `PageShell`'s 64px rail narrowed the inner-page field
  1278 -> 1214px, pushing a 776px table past its 743px container. (At 1344 = 1280 + rail there was only
  1 region, confirming causation.) Fixed **in the shell, not the page body**: `useScrollableRegionAccess`
  gives genuinely overflowing regions `tabindex="0"`, `role="group"` and a caption-derived name, and
  revokes them when overflow stops. Result **2 -> 0** nodes; it stands down on author-owned regions;
  0 childList mutation batches at rest and across a full scroll pass; sweep median 2.3-3.0ms.
  Landed at 0 rather than the 1 the packet allowed — accepted, because the two containers are
  structurally identical and a fix aimed at only one would have been arbitrary.
- **D2: withdrawn — see below.**

**A GATE THAT WAS PROVEN TO FAIL.** New `e2e/landing/shell-cascade-contract.spec.ts` asserts both the
*result* (every route resolves the same side rules) and the *cause* (no shipped stylesheet may declare
the base without its override — width-independent, so it catches the split even where both values
agree). QA rebuilt `4dc80d4` from source and reproduced **7 failed / 3 passed**, with the three passes
being exactly the ones that should pass. The decisive line, at `critical-1280`, has the RESULT check
passing while the CAUSE check fails in the same run:
`Index-Q-yQMtXW.css declares .tl-sheet border-inline 1x but ships 0 mobile override(s)`.
*Caveat recorded:* the non-vacuity guard at `:138` is `results.length > 0`, which a
`base=0, override=1` stylesheet would satisfy while leaving the loop trivially true. Tighter as
"at least one entry has `base > 0`". Not a failure; worth hardening when next touched.

**CLASS FIX, VERIFIED BY A BETTER AUDIT THAN THE CODER'S.** The Coder diffed two chunks and reported
5 shared selectors / 10 identical rules / 1 split. QA wrote a postcss audit over **all three** emitted
chunks and found **83** `(selector, property)` pairs carrying a duplicated base — a larger exposure
than reported — and **0** D0-shaped splits. Validated as a negative control: **1** split on the
pre-fix build, **0** on the fixed build.

**TWO CONTESTED MEASUREMENTS, BOTH RESOLVED AGAINST QA's ORIGINAL REPORT:**

1. **R5 -> `CODER_CORRECT`. QA withdrew its own "B24 worsened" finding.** It had measured
   4.261 -> 4.025. The Coder rebuilt `076c16a` from `git archive` and measured **4.025 on both builds,
   delta 0.000**, explicitly refusing to manufacture a change to reach the quoted number. The
   Orchestrator computed the arithmetic independently — `rgb(10,125,138)` on the composited ground
   `rgb(225,236,234)` is **4.03:1** — supporting the Coder. QA then confirmed with one instrument across
   both builds: the chip's first opaque ancestor is already `bg-card` `rgb(249,248,245)`, not white;
   all 6 chips, both builds, delta 0.000. **The 4.261 was computed against an assumed `#ffffff` that
   exists on neither build.** What survives: the 28 `color-contrast` violations moved into axe's
   `incomplete` bucket rather than being repaired, and B24 remains open at 4.025:1 for Phases 07/13.
2. **R6 -> `SAMPLING_ARTEFACT`, and Phase 04 in fact improved it.** The axe node count on
   `/hizmetler/cnc-frezeleme` dropped 270 -> 67 because more of the body sits at `opacity:0` when
   scanned without scrolling. Elements genuinely removed from the accessibility tree are **2 before and
   2 after** the scroll — and **Phase 03 hid 75 text elements from AT versus Phase 04's 2**. The reveal
   gating is pre-existing: under `prefers-reduced-motion: reduce`, Phase 03 also shows 194/333 at
   `opacity:0`. Both builds settle to exactly `color-contrast x28`, independently corroborating R5.

**Content edits made under a shell packet — ORCHESTRATOR-ACCEPTED DEVIATION.** My packet said content
is Phase 06's. The Coder nonetheless removed the fabricated `TARIH: 17.05.2024` and `REVIZYON: B` from
the drawing meta run and corrected `PAFTA: 01/12` -> `01/14` to match the observable band count, adding
`(c) {year} MAS TECHNIC`. Verified: removals only, nothing invented. Accepted because §13 mandates
removing unverifiable claims and the consolidation would otherwise have multiplied fabricated drawing
data across 90 routes. **Flagged for Phase 06 confirmation.** The 404's 15-second `window.location`
auto-redirect was also removed as route behaviour (WCAG 2.2.1).

**An invisible-breakage class worth carrying to Phase 12.** `body:has(.footer-industrial:focus-within)
[data-chat-launcher]` lived in `@layer components`; Tailwind drops layered rules whose class candidates
leave the scanned content, so deleting `Footer.tsx` silently deleted that rule from `dist/`. Moved
outside the layer. Other `@layer components` rules may be keyed on now-absent classes.

**ENVIRONMENTAL CONSTRAINT — affects run reliability.** The machine has **7.85 GB total and was
measured at 0.42 GB free**. This produced `net::ERR_INSUFFICIENT_RESOURCES` on a 40-route sweep and is
the likely cause of several agent deaths earlier in the run. The Coder A/B-tested it (pre-fix 4/4,
fixed 3/4 with the same resource error, fixed build *faster*), confirming it is not a code defect.
Five stale agent worktrees and two QA scratch build trees (which held copied `.env` files) were deleted
by the Orchestrator to reclaim space.

**NEW CARRY-FORWARD — B28 -> Phase 05.** Under `prefers-reduced-motion: reduce`, content on **both**
Phase 03 and Phase 04 builds remains gated behind scroll-triggered reveals (194/333 elements at
`opacity:0` at rest). Pre-existing and not a Phase 04 defect, but directly in Phase 05's remit: the
plan requires the reduced-motion path to be *complete, not visually broken*.

**Carried forward unchanged:** B24 `ServiceDetail` contrast + `incomplete`-bucket reclassification
(Phases 07/13); inner-page bodies still resolving text from the shadcn light theme (Phases 07/08);
the support launcher's rounded teal FAB (Phases 09/13); `LiveClock.tsx`, `MarqueeBand.tsx`,
`CADDashboard.tsx` now unreferenced but present on disk (Rollup drops them from `dist/`);
win32-only golden gap; `shell-header-about.png` antialiasing flake.

---

### Phase 05 — LANDING CREATIVE INTERACTION + MOTION DRAMATURGY — PASS (split into 05a + 05b; 1 correction loop on 05b)

**Split rationale.** Six agents were lost on this phase (two watchdog stalls at 600 s, one API error, one
process exit, plus two more) on a machine measured at 0.39-1.2 GB free of 7.85 GB. Per IMPLEMENTATION.md
§10 ("if the same root cause fails three loops, change strategy: isolate, reduce scope"), Phase 05 was
split into 05a (motion-system foundation) and 05b (creative choreography). Every lost agent had committed
incrementally, so each lost only its final step.

**05a — foundation.** Coder `46ae7f4`, `d51adad`, `ca40ef0`, `e54f9f8`, `4d9bb28`, `e1bc431`;
QA `5313739`, `eb902d6`, `1d8782b`, `ca797a5`. PASS, no correction loop.

**05b — choreography.** Coder `a133728`, `cf45ac3`, `3ce84ad`, `27d3dd4`, `82c4736`, `3f45fd5`, then
`5ff0cae`, `c3797e5`, `7cefcf0`; QA `e4e626d`..`5d58889` (FAIL), `3b6cf36`..`2d7adcd` (PASS).

**B28 CLOSED — the phase's most valuable asset.** Root cause was **not** the landing (whose hook was
already correct) but **Framer Motion `whileInView` with `initial={{opacity:0}}` and no reduced-motion
guard** across 12+ files: Framer still waits for intersection under `prefers-reduced-motion`, so content
stayed invisible until scrolled to. Fixed **at the factory**: `src/components/shell/motion.tsx` proxies
framer-motion's `motion` export and, only under reduced motion, renders the finished state. 49 files
repointed — **import line only**, QA verified zero JSX/copy/class/layout lines changed. Measured
text-bearing elements hidden at rest: `/hizmetler/cnc-frezeleme` **186 -> 0** (1280) and **195 -> 0**
(375); `/` **205 -> 0** and **214 -> 0**. Verified again after 05b by a second QA instrument that also
checks `visibility:hidden` and fully-clipping `clip-path`: **0 on all ten route/viewport pairs**.

**A guard that cannot be routed around.** `motion-audit --mode=guard` fails, non-zero, on any direct
`motion` import from framer-motion. Orchestrator negative-controlled it. QA then found it could be
silenced by a mention **inside a comment**; that was fixed to parse code rather than raw text, with a
three-way control (defect FAILS, fixed shape passes, comment-only mention FAILS).

**Six motion grammars replacing one generic reveal** (eight bands previously shared `opacity`+`translateY`):
G1 DRAW->LOCK technical linework; G2 PRINT paper evidence; G3 EXPOSE->CALIBRATE dark instrument panel;
G4 RESOLVE->VERIFY data tables; G5 REVEAL imagery; G6 SETTLE quiet default. **Three climaxes** (02 hero
measurement lock, 09 manifesto letter-spacing close, 13 RFQ gate), paid for by quietening bands 03, 04,
11 and 12. Mobile density is **structurally** lower (G2-G5 gated behind `min-width:768px`, the animated
unit changing from card/cell/row to container): transitioned 132 vs 58, animated 9 vs 5, transformed
23 vs 15 - a 2.3x gap, up from 1.3x.

**QA FAIL -> C1: the flagship interaction did the opposite of its documentation.** Both
`docs/lean/07-motion-system.md` and a CSS comment stated as fact that hovering a measurement lights its
guide line *and its passport counterpart*. Measured: hovering `O 28.000` put `.tl-pp-bore` at **0.34** -
dimmed, in with the elements meant to recede - and the six measurement boxes never moved at all.
**Same failure shape as the Phase 02 comment asserting a measurement nobody took.** Two causes, both
verified by the Orchestrator in source:
(a) `animation: tl-label-lock-* ... both` left `opacity:1` applied, and animated values outrank normal
declarations, so both hover rules were dead on the six labels;
(b) `:is()` takes its **most specific argument**, so the isolation list's `.tl-dim-line path` made it
(0,4,1) against the correlation's (0,4,0). QA's proof was by observation rather than arithmetic: the
isolation rule appears *earlier*, so at equal specificity the correlation would have won on source order.
**Fixed structurally, no `!important`:** the keyframes now animate **only `clip-path`** (the wipe already
hides the box, so the opening picture is unchanged and `opacity` returns to the cascade), and guide lines
are selected by the `tl-dim--*` classes they already carry, leaving both lists class-only. Specificity
parity is now a written contract in the docblock.
**A latent bug fell out of fixing it properly:** `.tl-pp-body` was in the transition list and in two
correlations but **never in the dim list**, so the passport body could never recede in any state. Neither
QA nor the Orchestrator had spotted it. It now recedes under four hovers.
QA re-verification: all six hovers measured at 1440 with every `:has()` confirmed matching first; all
**thirteen** uncorrelated elements recede (stronger than the six required); rest = 1.00. Both causes
negative-controlled **in place on the live CSSOM at the rule's own index**, so source order never moves;
parity proved by the falsifying observation that reversing the two rules flips the winner.

**A CORRECTION TO THE RECORD — the Orchestrator relayed a wrong finding to the user.** QA's first report
said the Coder's CLS figures "do not reproduce" (claimed 1280 = 0.0115; QA measured 0.0201/0.0202/0.0209
with +/-0.0004 spread, concluding host noise did not explain it). On re-verification **QA retired its own
finding as an instrument artefact**: one run measured raw 1280 CLS at exactly **0.01150**, and over three
runs of a single unchanged build the raw total moved 0.0115 -> 0.0209. The Coder's original number was
**right**; the "stable, not noisy" characterisation was wrong. QA also adjudicated *partly against the
Coder's framing*: its original A/B was **not** a raw-total comparison - it already split at a fixed
2000 ms cutoff, and the reduced-path inversion was a prior finding, not a miss. It nonetheless accepted
the correction as the better instrument, because a `performance.now()` scroll mark cannot drift the way a
hardcoded cutoff can. Final: `scrollCost` 0.00000 at 1280 across three runs, `manifestoEntries` 0 in all
six passes; `--mode=cls` now prints the A/B so the number is reproducible by instrument rather than by
note, and the docs state plainly that the raw total is not evidence.

**Frame pacing - a fabricated win the Coder refused to report.** It wrote: *"I nearly reported a
fabricated win here."* Four consecutive passes on one **unchanged** build gave `over32ms` = 16/19/34/34,
so host noise exceeded any code delta. It rebuilt the probe to run three passes, label the entrance pass
separately from steady state, attribute slow frames to a band, and **went back and stripped every CSS
comment citing a frame delta it could not defend**. Median 16.7 ms at both viewports.

**I4 half-fixed, and the half that is not was correctly refused.** The Coder corrected QA's diagnosis
(every `whileInView` on that route already had `once:true`; the real cause was a scroll-linked
`heroOpacity`, now removed). A **second, pre-existing** defect remains at 375: the hero is 320px while
its `absolute bottom-0` child is 424px, so the eyebrow and the entire `<h1>` are clipped by
`overflow:hidden` - and being clipped they never intersect, so their reveal never fires either. It
**deliberately declined** to force the reveal, because `opacity:1` would clear the metric over text the
reader still cannot see. Verified pre-existing on base `a2b4c20`; `I4_REMAINING_DEFECT:
CONFIRMED_PRE_EXISTING`. **Phase 07 owns it.**

**Also delivered:** I1 (decorative chroma no longer animates under reduced motion) plus a new guard rule
for that defect class; I2 (`restingOpacity()` rests at max not last keyframe - constraint documented and
a DEV warning added when max != last); I3 (unscoped `cursor:none` replaced - negative-controlled: with
the replacement mounted `body=none`, without it `body=auto link=pointer button=pointer`; `Z.cursor`
90 -> 101, agreeing with the value CustomCursor had derived locally). Nothing animates off screen; clips
wrapping focusable elements end at `inset(-8px)` so the `:focus-visible` ring at `outline-offset:4px`
is not cut. **45 goldens byte-identical, none regenerated** - correct, because the motion layer lives
under `[data-motion="ready"]` while goldens capture the reduced-motion path, so any change would have
signalled leakage into resting styles.

**NEW CARRY-FORWARDS:**
- **B29 -> Phase 13 (accessibility).** The hero isolation dims non-hovered measurement **text** to 0.34.
  QA measured from rendered pixels (the boxes sit on a photograph): at rest 12.2-16.0:1, but while one is
  hovered the other five fall to **2.65-4.07:1 - three below the 3:1 floor**, not merely below 4.5:1.
  `.tl-measure-left` (`72.000 +/-0.010`, real text, not `aria-hidden`) sits at **2.72:1**, and
  `aria-hidden` does not exempt the FCF glyphs from SC 1.4.3. Unlike an animation it **persists while the
  pointer rests**. Mitigations verified: pointer-only, hero `innerText` identical in both states, full
  reversal on pointer-out, hovered box at 15.87:1. Fix by raising `.34` or adding a `prefers-contrast:
  more` branch - **none exists anywhere in `src/`**.
- **B30 -> tooling hygiene.** A narrower guard hole remains and it **fails open**: the Coder argued its
  `codeOf` limitations can only strip too little (loud false breach), which holds for the presence-based
  import rule but **inverts** for the absence-based `usePrefersReducedMotion` rule. Two fixtures pass that
  should fail - a regex literal `/['"]/g` whose quote characters unbalance the scanner so a following
  comment survives verbatim, and a URL string containing the identifier. Reachability scan of all 269
  files under `src/`: **no live false pass**. Latent, not active.
- **B31 -> dead-code hygiene (Phase 12/15).** `src/components/ProjectShowcase.tsx` is imported by **no
  route**, so I1's fix there has no live surface to demonstrate on.

**Carried forward unchanged:** B24 `ServiceDetail` 28 serious `color-contrast` (Phases 07/13); I5
`/iletisim` 4 always-visible serious nodes, present in both motion modes so not motion-related
(Phase 13); win32-only golden gap; content wording (Phase 06).
