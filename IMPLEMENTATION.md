# MAS TECHNIC — AWWWARDs 90+ Autonomous Implementation Plan

> **Execution mode:** Autonomous, phase-gated, evidence-driven, no approval pauses between phases.
> **Target repository:** `aydinogluomer-sys/Mas_Technic`
> **Primary objective:** Transform the entire public MAS TECHNIC experience — landing, global menu, inner pages, 404/error states, RFQ, content evidence, SEO, performance, accessibility and QA — into one coherent Awwwards-grade technical-editorial system derived from the current `TechnicalLanding` design language.
> **Non-goal:** Do not redesign admin/customer-panel product surfaces unless a shared public-shell dependency makes a minimal compatibility change unavoidable.

---

## 0. HOW TO USE THIS FILE

This document is the source of truth for the autonomous implementation run. The main Claude Code session must execute it from start to finish. It must not selectively skip tasks, stop for cosmetic approval, or declare a phase complete from memory. Every phase closes only after the relevant files are read back and the phase acceptance criteria pass.

Before starting:

1. Place this file at repo root as `IMPLEMENTATION.md`.
2. Place the supplied `.claude/agents/` and `.claude/skills/` files in the repository.
3. Copy `USER_INPUTS_TEMPLATE.md` to `USER_INPUTS.md` and fill it once.
4. Restart Claude Code so project agents/skills are loaded.
5. Paste the supplied `START_PROMPT.md` prompt.

The run must create and maintain:

```text
PROGRESS.md
reports/
  baseline/
  qa/
  performance/
  accessibility/
  visual/
  seo/
  security/
  release/
```

---

# 1. AUTHORITY, CONFLICT AND ASSUMPTION RULES

## 1.1 Source-of-truth precedence

For this autonomous run only, apply this precedence:

1. `IMPLEMENTATION.md`
2. `USER_INPUTS.md`
3. Current production code and repository tests
4. `MASTER_CONTEXT.md`
5. `CLAUDE.md`
6. Other docs / stale plans / historical references

If an older document conflicts with this plan, this plan wins for the scope of this run. Do not delete historical documents merely because they are stale; update or archive them only when a phase explicitly requires it.

## 1.2 Existing CLAUDE.md autonomous-run exception

The current `CLAUDE.md` says to repeat constraints and wait for approval before starting a task. That is incompatible with this run. Phase 0 must add a narrowly scoped exception:

> When `IMPLEMENTATION.md` is active and `PROGRESS.md` marks mode as `AUTONOMOUS_AWWWARDS_RUN`, the agent must not pause for phase approval. It follows the stop rules in `IMPLEMENTATION.md` instead.

Do not weaken unrelated safety/forbidden-action rules.

## 1.3 Ambiguity policy

When ambiguity is resolvable by repository inspection, inspect and decide. Do not ask the user.

For aesthetic/design ambiguity, prefer:

- current `TechnicalLanding` as visual source of truth,
- technical drawing / metrology / engineering-sheet logic,
- graphite/charcoal + warm paper palette,
- editorial serif accent,
- restrained industrial imagery,
- measurable proof over marketing decoration.

For factual/business ambiguity:

- never invent certification, customer, KPI, measurement, case-study, facility, team-size or security claims;
- use verified input from `USER_INPUTS.md` or repository-backed evidence;
- **truth is not publication permission**: a fact supplied in `USER_INPUTS.md` is internal calibration unless its visibility is explicitly public;
- default publication policy is `INTERNAL_ONLY_UNLESS_PUBLIC_OK`;
- do not expose team size, facility size, machine count, revenue/order volume, or other scale-revealing facts merely because they are known;
- do not use copy such as “small workshop” or invent “large enterprise” positioning; position through capability, process discipline, measurement, traceability and evidence instead of company scale;
- if verification is unavailable, remove, neutralize, anonymize or mark as dev-only rather than fabricating.

Record every material assumption in `PROGRESS.md` under the phase that made it.

## 1.4 Stop rules

Do **not** stop between phases. Stop only when one of these conditions occurs:

- A destructive/irreversible production action is required: production deploy, production database/schema mutation, deleting production data, force-pushing shared history, rotating credentials, changing DNS, merging to protected `main` when not explicitly pre-authorized.
- The repository is in a state where proceeding would overwrite user-owned uncommitted work and no isolated worktree can preserve it.
- A required external credential is necessary to verify a phase and `USER_INPUTS.md` explicitly says the feature must ship now rather than degrade gracefully.
- The plan contains a direct contradiction that cannot be resolved by the precedence/assumption rules.
- All phases are complete.

A failed test is **not** a stop condition. It triggers the correction loop.

---

# 2. AGENT OPERATING MODEL

Use exactly three execution roles for the implementation loop.

## ROLE A — ORCHESTRATOR / INTEGRATOR

The main Claude Code session is the only Orchestrator.

Responsibilities:

- Read this file and `USER_INPUTS.md` first.
- Own phase sequencing and acceptance decisions.
- Maintain `PROGRESS.md`.
- Create the integration branch.
- Spawn only `mas-coder` and `mas-qa` for implementation work.
- Give each subagent a structured contract with explicit file write boundaries.
- Review actual diffs and files after each subagent result.
- Cherry-pick accepted subagent commits into the integration branch.
- Reject a commit that violates scope or overwrites unrelated work.
- Decide PASS / CORRECTION_REQUIRED / BLOCKED for each phase.
- Never directly rewrite production UI/code merely to “help” the Coder. If a production correction is needed, send it back to `mas-coder`.

Allowed Orchestrator writes:

- `PROGRESS.md`
- `reports/release/*`
- temporary orchestration notes under `.work/` if needed
- scoped documentation changes only when the phase explicitly assigns docs to Orchestrator

The Orchestrator must never run two write-capable subagents concurrently against overlapping scopes.

## ROLE B — MAS-CODER

The Coder runs in an isolated worktree.

Responsibilities:

- Receive one phase or correction packet.
- Read only the relevant plan section plus required repo context.
- Modify only the `WRITE_ALLOWLIST` paths from the task packet.
- Never touch `PROGRESS.md`.
- Never change acceptance criteria to make a phase pass.
- Run appropriate local checks before committing.
- Commit all work with meaningful conventional messages.
- Return structured output containing:
  - phase ID,
  - commit SHA(s),
  - changed files,
  - commands run,
  - interpretation/assumptions,
  - known risks.

## ROLE C — MAS-QA

QA runs after the Coder commit has been integrated, in a fresh isolated worktree.

Responsibilities:

- Treat production code as read-only.
- Verify acceptance criteria independently.
- Add or improve tests only in the QA write allowlist.
- Produce deterministic evidence, not subjective reassurance.
- Run the requested commands.
- Create `reports/qa/phase-XX.md`.
- Commit test/report changes if any.
- Return a machine-readable summary:

```text
PHASE: XX
STATUS: PASS | FAIL | BLOCKED
TESTS_PASSED: N
TESTS_FAILED: N
NEW_TESTS_ADDED: N
FAILED_CHECKS:
- ...
ROOT_CAUSES:
- ...
COMMIT: <sha-or-none>
```

QA must not fix production code. Failures go back to the Orchestrator, then to Coder.

---

# 3. GIT / WORKTREE / OWNERSHIP PROTOCOL

## 3.1 Integration branch

Create one long-running integration branch:

```text
claude/awwwards-90-overhaul
```

Never auto-merge to `main` unless `USER_INPUTS.md` explicitly sets:

```text
ALLOW_MAIN_MERGE: YES
```

Even then, merge only after Phase 16 passes.

## 3.2 Worktree isolation

Both `mas-coder` and `mas-qa` must use isolated worktrees.

Loop:

```text
Orchestrator reads phase
  -> Coder worktree implements + commits
  -> Orchestrator reviews/cherry-picks
  -> QA worktree tests + optionally commits tests/report
  -> Orchestrator reviews/cherry-picks QA commit
  -> if FAIL: Coder correction worktree
  -> QA retest worktree
  -> repeat until PASS
  -> Orchestrator closes phase in PROGRESS.md
```

## 3.3 Single-writer rule

At any moment, each production path has one writer only.

Default ownership:

| Area | Writer |
|---|---|
| `src/**` production UI/code | Coder |
| `public/**` production assets/meta | Coder |
| `index.html`, Vite config | Coder |
| `package*.json` | Coder |
| `.github/workflows/**` | Coder |
| `e2e/**`, test fixtures, golden screenshots | QA unless phase task explicitly gives Coder ownership |
| `reports/qa/**` | QA |
| `PROGRESS.md` | Orchestrator |
| `IMPLEMENTATION.md` | immutable during run except typo-only clarifications logged by Orchestrator |
| `USER_INPUTS.md` | read-only during run |

No agent may “clean up” files outside its allowlist.

## 3.4 No destructive git shortcuts

Forbidden unless explicitly authorized by the user:

- `git reset --hard` on user branches
- `git clean -fdx`
- force-push
- rewriting shared history
- deleting unknown branches
- discarding uncommitted user changes

If the starting working tree is dirty, preserve it. Prefer a new clean worktree from current HEAD and record the excluded local diff in baseline notes.

---

# 4. PHASE CONTRACT FORMAT

Every Coder task sent by the Orchestrator must contain:

```text
PHASE_ID:
PHASE_TITLE:
BASE_COMMIT:
OBJECTIVE:
REQUIREMENT_IDS:
READ_FIRST:
WRITE_ALLOWLIST:
DO_NOT_TOUCH:
MANDATORY_TASKS:
ACCEPTANCE_CRITERIA:
COMMANDS_TO_RUN:
RETURN_FORMAT:
```

Every QA task must contain:

```text
PHASE_ID:
CODE_COMMIT:
ACCEPTANCE_CRITERIA:
READ_ONLY_PRODUCTION_PATHS:
QA_WRITE_ALLOWLIST:
MANDATORY_TESTS:
COMMANDS_TO_RUN:
REPORT_PATH:
RETURN_FORMAT:
```

Do not send vague prompts such as “polish the page” or “make it Awwwards quality.” Translate every request into inspectable acceptance criteria.

---

# 5. GLOBAL NON-NEGOTIABLE DESIGN PRINCIPLES

These apply to every public page unless a phase explicitly documents an exception.

1. **Landing is the source of truth, not a one-off skin.** Inner pages must inherit the same system logic, not merely copy its colors.
2. **Measurement is the interaction model.** Grid, rules, datum marks, dimensional thinking, inspection, verification and precision can shape interaction and motion.
3. **Evidence > claims.** Technical proof, real documents, case studies and process evidence carry the brand.
4. **No fake proof theatre.** No invented CMM result, certification, QR verification, client mark, KPI, team number, tolerance or signature.
5. **Technical-editorial, not SaaS.** Avoid generic rounded card grids, glow effects, startup gradients and default component-library aesthetics.
6. **Motion has semantics.** Animation explains assembly, process, measurement, verification or hierarchy; it is not decorative noise.
7. **One grid contract.** Public pages derive from the master sheet/grid and shared shell.
8. **One navigation system.** No parallel homepage/inner-page menu languages.
9. **One typography hierarchy.** Grotesk for interface/editorial structure; serif for controlled editorial contrast; mono for technical data/metadata.
10. **Production truth.** No preview/test/demo route or placeholder language in the award candidate build.

---

# 6. TARGET GLOBAL DESIGN / GRID CONTRACT

The exact final tokens may be adjusted by measured browser output, but the architecture must respect these principles.

## Desktop

```text
SHEET_MAX: 1600px
RAIL: 64px
CONTENT: 12 equal columns
MASTER GRID: rail + 12 columns
```

At 1600px, content is approximately 1536px and each content column approximately 128px before rules.

Recommended landing alignments:

| Section | Column logic |
|---|---|
| Hero | 4 / 6 / 2 |
| Proof | 6 cells × 2 cols |
| Marquee | 12 |
| Process | 4 / 8, then four 3-col steps |
| Nexus | 3 / 9 |
| Featured project | 6 / 6 |
| Secondary projects | 6 + 6 |
| Sectors | four × 3 |
| Manifesto | 12; copy constrained to a deliberate 6–7 col measure |
| Quality | six × 2; decorative stamp must not distort tracks |
| References | six × 2 |
| FAQ | 7 / 5 |
| RFQ | 3 / 4 / 5 or 4 / 4 / 4 |
| Footer | 4 / 8 or another intentional 12-col split |

Use CSS `subgrid` where it materially guarantees shared vertical axes. If fallback is required, derive nested tracks from the same grid tokens rather than arbitrary percentages.

## Tablet

- Rail around 52–56px only if optical tests justify it.
- Six-column technical sheet.
- No unintentional empty sixth track.
- Preserve hierarchy rather than mechanically stacking everything.

## Mobile

- Rail target approximately 40–44px.
- Four-column content grid.
- Technical annotation density must reduce intentionally.
- Touch-first controls and native scroll below the existing mobile threshold.

---

# 7. PHASES

---

## PHASE 00 — AUTONOMOUS BOOTSTRAP, BASELINE AND REQUIREMENT LOCK

**Requirement coverage:** orchestration prerequisite for all 1–739.

### Objective

Create a safe, reproducible run environment and a measurable “before” state. Do not redesign anything yet.

### Mandatory tasks

- Read `IMPLEMENTATION.md`, `USER_INPUTS.md`, `CLAUDE.md`, `MASTER_CONTEXT.md`, `ACTIVE_TASK.md`, package scripts, router, current `Index.tsx`, `TechnicalLanding`, technical landing CSS, Playwright config and CI workflow.
- Add the scoped autonomous-run exception to `CLAUDE.md`.
- Create `claude/awwwards-90-overhaul` from the current intended base commit.
- Preserve existing dirty user work rather than discarding it.
- Create `PROGRESS.md` from the supplied template and mark mode `AUTONOMOUS_AWWWARDS_RUN`.
- Create requirement traceability table covering every requirement ID 1–739.
- Inventory every public route and classify: landing, core corporate, service, sector, content, utility/legal, RFQ/auth, preview/dev, admin/customer.
- Inventory all existing menu/header/footer/page-shell implementations.
- Inventory real vs demo/sample claims, documents and customer/reference data.
- Capture baseline commands and output:
  - `npm ci`
  - `npm run build`
  - `npm run lint`
  - `npx tsc --noEmit`
  - current critical Playwright suite / current e2e script
  - `npm audit` report
- Capture baseline full-page screenshots for at least 375, 768, 1280, 1440 and 1600 where tooling permits.
- Capture current bundle sizes and key chunk warnings.
- Record known CI state and stale test contracts.
- Validate that `.claude/agents/mas-coder.md`, `.claude/agents/mas-qa.md` and all MAS skills are discoverable.

### Do not

- Redesign pages.
- Delete legacy code yet.
- Change claims yet.
- Deploy.

### Acceptance criteria

- Integration branch exists and user work was not lost.
- `PROGRESS.md` exists with baseline commit and current status.
- `reports/baseline/` contains route inventory, test/build baseline, dependency baseline, visual baseline index and known blockers.
- Every requirement ID 1–739 appears in the traceability matrix with a target phase.
- Existing failures are documented rather than hidden.

---

## PHASE 01 — REPOSITORY TRUTH, CI RECOVERY, LEGACY LANDING CLEANUP

**Requirement IDs:** 111–162, 424–430.

### Objective

Make the current `TechnicalLanding` the real production landing source of truth and restore a trustworthy CI/test foundation before visual refactors.

### Mandatory tasks

- Confirm `/` renders `TechnicalLanding` only.
- Remove or dev-gate `/legacy-landing`, `/technical-preview`, `/test` and equivalent preview routes from production.
- Remove or archive stale LandingFlow runtime wiring that no longer belongs to the production homepage.
- Resolve the stale `hero-shell` / `mas:intro-done` lifecycle mismatch.
- Ensure initial HTML shell cannot compete with or obscure the real landing.
- Replace stale hero preload with the actual LCP asset used by the current hero.
- Remove stale `.lf-*` assumptions from active homepage tests.
- Rebuild critical E2E around semantic/current `TechnicalLanding` behavior.
- Split test strategy into fast critical PR gate and larger regression suite where appropriate.
- Add/normalize scripts for `typecheck`, lint, build and critical e2e.
- Update GitHub Actions so required checks finish instead of timing out due obsolete 784-test combinations.
- Add Chromium critical gate and at minimum WebKit + Firefox smoke gates.
- Replace screenshot-only “visual QA” with actual golden diff checks for critical surfaces.
- Keep reduced-motion/accessibility checks in CI.

### Do not

- Start site-wide redesign in this phase.
- Rewrite working Supabase/admin/customer functionality.
- Suppress failing tests merely to get green.

### Acceptance criteria

- No production-public legacy/test/technical-preview route.
- No active homepage test depends on obsolete `.lf-*` contracts.
- Current hero renders without stale shell handoff artifacts.
- Actual current hero asset is the only LCP preload target.
- `npm run typecheck`, `npm run lint`, `npm run build` pass.
- Critical Playwright suite passes in Chromium.
- WebKit and Firefox smoke suites pass.
- Golden screenshot test exists for landing at core viewport(s).
- CI workflow completes within configured timeout.

---

## PHASE 02 — MASTER DESIGN SYSTEM + 12-COLUMN GRID RECONSTRUCTION

**Requirement IDs:** 1–38, 353–371, 391–410, 431–443.

### Objective

Turn the visual grid into a structural grid and consolidate the technical-editorial design system before spreading it across the site.

### Mandatory tasks

- Define shared design tokens for sheet width, rail width, columns, rules, surfaces, typography, spacing and motion timing.
- Resolve README/design-system contradictions against the current intended landing direction.
- Keep the graphite/charcoal + warm paper system unless measured contrast or content requirements demand a token adjustment.
- Standardize typography roles and remove accidental font-rule drift.
- Decide and document radius policy; remove arbitrary local radii that contradict the chosen system.
- Replace hardcoded layout-color values with tokens where practical and meaningful.
- Implement a master public grid primitive / page sheet primitive.
- Use `subgrid` where it guarantees alignment.
- Add a dev-only grid overlay toggle.
- Rebuild landing section geometry so major edges share common axes.

### Required landing corrections

**Hero**
- Enforce actual 4 / 6 / 2 logic.
- Remove accidental two-column and one-column overlaps used as layout substitutes.
- Remove pixel-margin hacks such as passport margins used to compensate for wrong tracks.
- Preserve intentional art-direction overlap only if it is explicitly documented and does not break the grid contract.

**Process**
- Use shared grid tracks.
- Desktop 4 / 8.
- Four steps aligned as 3-col units.
- Fix tablet unused sixth column.

**NEXUS**
- Remove arbitrary `23.8%`, `19.2%`, `4.6%` layout values.
- Use real grid columns such as 3 / 9 with optional intentional breathing column if justified.
- Align header, rail and table boundaries.

**Projects**
- Replace arbitrary 35/65 and 48/52 layout ratios with deliberate master-column spans where possible.
- Featured approximately 6/6; secondaries 6+6.

**Quality**
- Remove the “six fluid + fixed 132px seventh track” distortion.
- Use six 2-col evidence cards or another actual 12-col composition.
- Decorative stamp cannot consume a fake master track.

**FAQ**
- Make 7/5 align to actual master tracks.
- Move spacing into child padding rather than a gap that shifts the shared boundary.

**RFQ**
- Remove 4/5/5 = 14-unit layout.
- Use a 12-unit split.

**Footer**
- Replace arbitrary 43/77 if it prevents shared-axis continuity.
- Adopt intentional 12-column split.

**Mobile/tablet**
- Tablet six-column grid.
- Mobile four-column grid.
- Mobile rail approximately 40–44px unless visual testing proves another value.

### Acceptance criteria

- All landing bands derive from one documented master grid system.
- No major landing section uses unexplained percentage/fr ratios that contradict the master grid.
- Debug grid overlay visually demonstrates shared vertical axes across Hero, Process, Nexus, Projects, Quality, FAQ, RFQ and Footer.
- No tablet Process empty sixth column.
- Mobile rail no longer consumes an excessive share of 320/375 width.
- Golden screenshots updated only after QA confirms improvement and no regression.
- Design-system documentation matches current code.

---

## PHASE 03 — GLOBAL AWWWARDS NAVIGATION + INFORMATION ARCHITECTURE

**Requirement IDs:** 39–73, 270–280, 501–515, 613–624.

### Objective

Create one site-wide Awwwards-grade navigation system derived from the landing's technical-editorial DNA and connect every meaningful public page to it.

### Mandatory tasks

- Inventory final route taxonomy from Phase 0 and `USER_INPUTS.md`.
- Remove duplicate/orphan public routes or redirect them appropriately.
- Standardize Turkish slug conventions.
- Define route groups: services, sectors, company/quality, projects/case studies/resources, editorial/blog, contact/RFQ.
- Landing anchor navigation and full-page route navigation must be conceptually distinct but visually coherent.
- Consolidate `TechnicalHeader`, `HeaderFullscreen` and parallel public-header implementations into one global navigation architecture.
- Build a fullscreen/editorial menu or equivalent strong overlay consistent with the engineering sheet.
- Use page numbers/index marks, technical metadata, rules, typography and measured motion rather than generic SaaS panels.
- Add a clear active-route state.
- Connect every service/sector/core page.
- Keep utility/legal pages discoverable but do not pollute primary navigation.
- Keep RFQ as a strong conversion destination without using arbitrary accent color.
- Implement keyboard navigation, focus trap, ESC close, focus restoration, scroll lock, route-close behavior and reduced-motion variant.
- Implement mobile menu as the same concept adapted, not a generic fallback.
- Any hover preview imagery must be budgeted and lazy/preloaded selectively.
- Remove sound/theme toggles if they do not have real product/brand meaning.

### Acceptance criteria

- One global public navigation implementation is used across `/` and all public inner pages.
- No public page is orphaned.
- No duplicate header design language remains on public routes.
- Menu is fully keyboard-operable.
- Menu passes reduced-motion and mobile tests.
- Back/forward navigation and deep links remain correct.
- Menu visual regression snapshots exist desktop + mobile.

---

## PHASE 04 — GLOBAL PUBLIC PAGE SHELL + ROUTE TRANSITIONS

**Requirement IDs:** 74–110, 444–450, 603–612, 738.

### Objective

Turn landing DNA into reusable site architecture so inner pages inherit the same grid, rail, type, rules, surfaces, menu, footer and motion grammar.

### Mandatory tasks

- Create/normalize a global public `TechnicalPageShell` (name may differ if architecture suggests a better one).
- Shell owns public grid/sheet, index rail logic, global navigation, footer integration and page transition contract.
- Define inner-page hero primitives that are related to landing but not cloned from it.
- Define paper/dark band primitives, technical metadata rows, editorial title blocks, evidence blocks and measured dividers.
- Remove generic rounded SaaS cards, default gradients/glows and inconsistent icon-card patterns from shared public primitives.
- Define consistent loading, empty and route-error shell states.
- Make route transitions measurement/assembly-aware but lightweight.
- Preserve browser history, scroll restoration, direct refresh and anchor behavior.
- Ensure repeated clicks/slow route loading cannot leave the site stuck in transition state.

### Acceptance criteria

- All public page families can render inside one shared shell.
- The same rail/grid/rule/typography contract is available to inner pages.
- Page transition works on direct load, client navigation, back and forward.
- No public page requires the old generic shell to function.
- Visual smoke snapshots prove shell consistency across at least home, service, about, blog/article, RFQ and 404 placeholders.

---

## PHASE 05 — LANDING CREATIVE INTERACTION + MOTION DRAMATURGY

**Requirement IDs:** 193–238, 474–480, 688–706, 739.

### Objective

Raise the landing from polished technical editorial to a memorable creative system without turning it into an effects demo.

### Creative thesis

**Measurement is the interaction model.**

Recommended narrative:

```text
RAW -> MACHINING -> DATUM -> TOLERANCE -> CMM -> VERIFIED
```

### Mandatory tasks

- Make the hero manifold/part the visual protagonist.
- Give dimension lines, datum labels and inspection metadata semantic interaction where useful.
- Ensure the manifesto “Hassasiyet iddia edilmez. Ölçülür.” is reflected in interaction, not just copy.
- Define motion grammar by content type:
  - technical lines draw/lock,
  - paper evidence assembles/prints,
  - dark panels expose/calibrate,
  - data tables resolve/verify,
  - imagery reveals with restrained cinematic motion.
- Preserve a single climax hierarchy: hero + one major manifesto/quality climax + one conversion/project moment.
- Avoid identical reveal animation on every band.
- Audit custom cursor: keep only if it encodes measurement/interaction semantics.
- Audit scroll progress: keep only if it belongs to the same concept.
- Keep motion geometry-safe; transform/opacity/clip-path preferred.
- Pause/avoid expensive offscreen work.
- Mobile gets reduced effect density.
- Reduced-motion version must remain complete, not visually broken.
- Standardize motion durations/easing into micro / standard / cinematic levels.

### Acceptance criteria

- Motion has documented semantic roles.
- At least 2–3 memorable moments exist without every section competing for attention.
- No major animation causes layout shift.
- Reduced-motion path passes.
- Mobile does not inherit desktop-heavy motion blindly.
- Frame pacing shows no obvious repeated jank in core scroll path.
- Landing still reads clearly with motion disabled.

---

## PHASE 06 — CONTENT TRUTH, EVIDENCE MODEL AND CASE-STUDY DATA

**Requirement IDs:** 163–192, 467–473, 625–653.

### Objective

Replace demo/sample/proof-theatre content with verified production truth or safely neutral content.

### Mandatory tasks

- Read all factual fields and their visibility/publication flags in `USER_INPUTS.md`.
- Build separate internal-truth and public-claim layers; never infer public permission from the existence of an internal fact.
- Build a single source of truth for verified **and publication-approved** public claims.
- Default scale-revealing facts (team size, facility size, machine count, revenue/order volume) to private unless explicitly approved and strategically useful.
- Prefer capability/evidence-led positioning over company-size language.
- Remove production labels such as `DEMO İÇERİK`, `ÖRNEK İÇERİK`, `KAYNAKLAR HAZIRLANIYOR`, `DOĞRULAMA SERVİSİ HAZIRLANIYOR` by either completing the feature or removing it from award production.
- Hide EN control until a real English route set exists.
- Verify/remove ISO 9001, AS9100D, ISO 14001, IATF16949 and any other certification claim.
- Verify/remove ±0.005mm, 48-hour quote, 50+ materials, 100% CMM, 98% on-time and similar KPI claims.
- Verify customer/reference names and logo permissions.
- Replace decorative fake verification QR with real verification destination or remove it.
- Replace fake signatures/certification representations with real document previews where authorized.
- Create a reusable case-study data model including challenge, material, process, tolerance, surface finish, inspection method, lead time, result, gallery/evidence, related capability and RFQ CTA.
- Support anonymized confidential case studies without pretending anonymized data is named-client evidence.
- Standardize CTA terminology (`Teklif Al`, `Proje Gönder`, etc.) into one consistent hierarchy.
- Remove generic marketing filler (“yüksek kalite”, “ileri teknoloji”, etc.) when unsupported by proof.
- Ensure headings are semantically correct and technical abbreviations are clear.

### Graceful degradation rule

If real evidence is missing:

- do not block the entire autonomous run;
- remove the unverifiable public claim;
- preserve the component architecture with neutral factual copy where possible;
- record missing optional evidence in the final report.

### Acceptance criteria

- No knowingly fabricated customer/certification/KPI/measurement proof remains in production public UI.
- No internal-only or scale-revealing fact is published without explicit publication permission.
- Public copy does not frame MAS TECHNIC as a “small workshop” and does not fabricate enterprise scale; perceived authority comes from technical specificity, evidence, art direction and process discipline.
- No demo/sample/hazırlanıyor badge appears in award-candidate public pages.
- Claims used in multiple pages come from one consistent verified source.
- Case-study schema exists and can render real/anonymized data.
- Resource/download rows are real links when resource exists, otherwise removed rather than faked.

---

## PHASE 07 — INNER PAGES WAVE A: CORE COMPANY, SERVICES, SECTORS, MATERIALS, CONTACT

**Requirement IDs:** 74–88, 96–110, 258–269, 451–456.

### Objective

Eliminate the design-language break between landing and the most important commercial inner pages.

### Mandatory tasks

Redesign/normalize at minimum:

- Hakkımızda
- İletişim
- Materials/material pages
- Services listing
- Service detail pages
- Sectors listing
- Sector detail pages

Requirements:

- Use global shell/grid/menu/footer.
- No generic “heading + paragraph + four icon cards” corporate template.
- Company history can use dossier/timeline/technical-sheet narrative.
- Mission/vision must be editorial narrative or evidence-backed structure rather than startup cards.
- Service details should show capability, process, tolerances/materials/inspection evidence where verified.
- Sector pages should show actual relevance/capability evidence rather than only hero image + text.
- Contact page must feel like part of the same system and route naturally into RFQ.
- Reuse design-system primitives; do not create one-off page skins.

### Acceptance criteria

- Core pages visually and structurally belong to the landing family.
- No old generic public header/footer remains on these routes.
- No generic rounded-card aesthetic remains unless a deliberate documented exception exists.
- Each service/sector page has a meaningful next-step/RFQ path.
- Desktop/tablet/mobile golden snapshots exist for representative routes.

---

## PHASE 08 — INNER PAGES WAVE B: QUALITY, PROJECTS, BLOG, RESOURCES, LEGAL, SEARCH/DISCOVERY, 404/ERROR

**Requirement IDs:** 89–95, 457–466, 637–669, 680–687.

### Objective

Complete site-wide visual consistency, including the pages most often forgotten in redesigns.

### Mandatory tasks

- Build case-study/project index and detail pages using verified/anonymized data model.
- Rework Quality/Resources into real technical-document/evidence surfaces.
- Rework Blog index into technical editorial publication rather than generic card grid.
- Rework article typography, figure/caption, tables, TOC where useful, related content and non-aggressive RFQ continuation.
- Decide whether search/filtering is actually justified; do not add UI for its own sake.
- Bring SSS/FAQ and legal/privacy/cookie pages into the same shell with restrained treatment.
- Redesign 404 as a branded engineering error state (e.g. geometry/datum/tolerance concept) without sacrificing usability.
- Ensure 404 has global navigation and recovery paths.
- Add branded 500/general error, CAD parse error, form error and meaningful empty/loading states where applicable.
- Ensure 404 is a real HTTP/deployment 404 where hosting permits, not only a client-side soft-404.

### Acceptance criteria

- 404 is unmistakably MAS TECHNIC, usable and linked back into the site.
- Blog/article, quality/resources, case studies, SSS and legal pages all share the global design system.
- No public route still visibly belongs to the old generic design language.
- Search/filter is either implemented with a justified need or explicitly omitted.
- Error/loading/empty states no longer fall back to generic library defaults.

---

## PHASE 09 — RFQ/CAD FUNCTIONALITY, PRIVACY AND SECURITY HARDENING

**Requirement IDs:** 281–293, 516–563.

### Objective

Turn RFQ/CAD from a visually impressive but potentially heavy/ambiguous feature into a trustworthy production conversion flow.

### Mandatory tasks

**Architecture/performance**
- Decompose oversized `TeklifAl.tsx` or equivalent monolith into maintainable modules.
- Lazy-load R3F/Drei/Three/STL/OBJ/OCCT tooling only after the interaction actually needs it.

**Form behavior**
- Verify real submission pipeline.
- Server-side validation where backend allows.
- Client validation with accessible field errors.
- Prevent double-submit.
- Handle timeout/network/upload/parse failures.
- Show accepted CAD formats and max file size before upload.
- Provide success state and stable request/confirmation identifier when system supports it.
- Verify internal notification/recipient path.

**Privacy/business policy**
- Display verified confidentiality wording.
- Explain retention period, deletion process and access policy if known.
- Show NDA path only if actually available.
- Align KVKK/privacy copy with actual data flow.
- Do not claim encryption/security properties not verified.

**Security**
- Audit Supabase RLS and public operations without changing schema unless explicitly authorized.
- Ensure CAD files do not unintentionally become public URLs.
- Use signed access where architecture requires and existing backend supports it.
- Validate extension/MIME/content constraints reasonably.
- Prevent filename/content metadata leakage where possible.
- Ensure errors do not expose stack traces/secrets.
- Audit public environment variables.
- Audit CSP, referrer policy, content type options, permissions policy, frame policy, HTTPS/HSTS compatibility.
- Add spam/rate-limit mitigation if supported by existing architecture and inputs.

### Do not

- Mutate production Supabase schema/data without explicit authorization.
- Invent an NDA or retention commitment.
- Add a security badge unless backed by reality.

### Acceptance criteria

- RFQ flow works end-to-end in non-production/staging/local environment where credentials permit.
- Heavy CAD stack is not in initial public bundle unnecessarily.
- All expected failure states are designed and tested.
- No public CAD file exposure is found in tested flow.
- Security header and dependency findings are documented.
- Privacy copy matches known behavior.

---

## PHASE 10 — VISUAL ASSET GOVERNANCE, TYPOGRAPHY AND RESPONSIVE ART DIRECTION

**Requirement IDs:** 239–257, 670–679, 707–715, relevant 716–725 visual/browser items.

### Objective

Make the imagery and typography look like one commissioned industrial editorial campaign, not a set of filtered stock assets.

### Mandatory tasks

- Audit every public hero/sector/service/project/manifesto image.
- Standardize asset naming and source/optimized derivative relationship.
- Remove duplicate/redundant imagery where it weakens identity.
- Maintain graphite/charcoal low-key industrial mood.
- Avoid neon/cyberpunk, generic blue factory stock and visual clutter.
- Use real manufacturing/facility/project assets from `USER_INPUTS.md` when available.
- Keep one dominant visual idea per image.
- Use responsive images with width/height, `srcset`, `sizes`, and `<picture>`/mobile crop where beneficial.
- Choose WebP/AVIF strategy consistent with existing pipeline and browser support.
- Add safe missing-image fallback.
- Use meaningful alt text for content images and empty alt for decorative images.
- Verify actual loaded font weights/italics; avoid synthetic bold/italic.
- Verify Turkish uppercase/diacritics and technical glyphs ± Ø µ GD&T characters.
- Use tabular numerals where measurement data requires it.
- Control heading line breaks, widows/orphans and measure.

### Acceptance criteria

- No broken image state in public routes.
- Representative imagery reads as one campaign.
- Responsive image markup exists on major image-heavy surfaces.
- No synthetic/incorrect font styling on key typography.
- Turkish and technical glyph test page/screenshots pass.

---

## PHASE 11 — SEO, METADATA, CRAWLABILITY AND SOCIAL PREVIEW

**Requirement IDs:** 294–316, 481/486–489, 564–574.

### Objective

Make every public route production-canonical, crawlable and shareable without preview-host metadata leakage.

### Mandatory tasks

- Replace hardcoded preview-host canonical with production-domain strategy from `USER_INPUTS.md`.
- Resolve İzmir/İstanbul metadata conflict.
- Remove English `availableLanguage` until real English pages exist.
- Provide route-specific title, description, canonical, OG title/description/url/image and Twitter metadata.
- Provide branded production OG assets.
- Improve structured data for organization/service/article/breadcrumb where factual and useful.
- Avoid client-only metadata gaps where practical in current CSR architecture; document limitations rather than pretending SSR exists.
- Generate/validate `sitemap.xml` with only indexable production routes.
- Generate/validate `robots.txt`.
- Ensure preview/test/dev paths are excluded/noindex/removed.
- Remove redirect chains and canonical loops.
- Improve internal linking depth and discoverability.
- Ensure 404 behavior is not a soft-404 where hosting allows configuration.

### Acceptance criteria

- No public metadata references preview-host URLs unless explicitly the production domain.
- Location metadata is consistent.
- Every indexable route has appropriate metadata.
- Sitemap contains only intended canonical pages.
- Robots rules match deployment policy.
- Social preview uses branded stable assets.

---

## PHASE 12 — PERFORMANCE, BUNDLE AND DEPENDENCY HARDENING

**Requirement IDs:** 317–352, 481–485, 590–602 items related to caching/build/deploy readiness.

### Objective

Re-baseline the current site and meet a real performance budget without sacrificing the creative concept.

### Mandatory tasks

- Discard stale April/old-WebGL baseline as current truth; preserve it only as history.
- Measure current mobile and desktop Lighthouse/Web Vitals baseline.
- Track LCP, CLS, INP and relevant blocking/JS metrics.
- Set budgets for initial JS, largest chunks and image payload.
- Resolve >500KB chunk warnings where feasible.
- Keep Three/R3F/Drei/OCCT/XLSX and other specialist bundles lazy.
- Audit GSAP + Framer responsibilities; do not animate the same element with both.
- Optimize fonts and loading strategy.
- Ensure only actual LCP asset is high-priority/preloaded.
- Lazy-load offscreen imagery.
- Ensure image dimensions prevent CLS.
- Audit 18 baseline vulnerabilities, prioritizing high severity.
- Resolve or document `three-mesh-bvh` compatibility/deprecation risk.
- Update browser compatibility data where safe.
- Resolve Vite `path`/`crypto` browser-externalization warnings where they indicate runtime risk.
- Add automated performance budget check to CI when practical without fragile external infrastructure.
- Define static asset/font/HTML cache policy for deployment configuration.

### Target gates

Prefer at minimum:

```text
Lighthouse Performance >= 90 on representative production-like mobile run
LCP < 2.5s
CLS < 0.10
No known avoidable initial CAD/Three bundle on normal landing load
No unexplained >500KB critical initial chunk
```

If a target cannot be met due to environment variance, do not falsify success. Document measured median runs and root cause.

### Acceptance criteria

- New current baseline and final report exist.
- Major specialist libraries are route/interaction-lazy where appropriate.
- LCP preload is correct.
- High-severity dependency findings are fixed or explicitly risk-accepted in report.
- CI includes a practical bundle/perf guard.

---

## PHASE 13 — ACCESSIBILITY, RESPONSIVE AND CROSS-BROWSER RELEASE GATE

**Requirement IDs:** 372–390, 411–423, 716–725.

### Objective

Ensure the award-grade experience remains usable on keyboard, reduced motion, mobile and major engines.

### Mandatory tasks

- Run automated axe checks on key routes/states.
- Test keyboard navigation across menu, FAQ, RFQ, tables/resources and key interactive modules.
- Fix interactive-looking non-controls such as NEXUS list items; make them buttons/links or visually non-interactive.
- Ensure real download rows are semantic links.
- Ensure dialog/menu accessible names, focus trap and focus restoration.
- Ensure decorative SVG/technical linework is hidden from screen readers unless meaningful.
- Provide accessible labels/text for meaningful technical annotations where needed.
- Check contrast across dark/paper/accent surfaces.
- Check touch target sizes.
- Make horizontal tables discoverable and usable on mobile.
- Test reduced motion.
- Test 320, 375, 390, 768, 844 landscape, 1280, 1440 short, 1600 and a reasonable ultrawide.
- Test browser zoom 125/150 where feasible.
- Test Chromium, Firefox and WebKit.
- Check iOS/dynamic viewport/safe-area behavior in relevant responsive CSS.
- Check Safari mask/clip-path/mix-blend-mode fallbacks.
- Check Windows/macOS font rendering via available test environments/screenshots where practical.

### Acceptance criteria

- Zero serious/critical axe violations on critical public flows.
- Global menu is keyboard/reduced-motion safe.
- RFQ is keyboard/touch usable.
- No critical layout break at required viewports.
- Chromium/Firefox/WebKit smoke passes.
- Visual golden suite passes at required representative viewports.

---

## PHASE 14 — ANALYTICS, OBSERVABILITY AND PRODUCTION-INFRASTRUCTURE READINESS

**Requirement IDs:** 575–602.

### Objective

Make the site measurable and diagnosable without compromising privacy or automatically deploying.

### Mandatory tasks

- Use analytics provider only if configured in `USER_INPUTS.md`; otherwise implement no fake provider.
- Track meaningful conversion events: RFQ click/start/submit, CAD upload start/complete, service/case-study to RFQ, 404 occurrence.
- Avoid noisy vanity-event collection.
- Respect consent requirements before analytics where applicable.
- Add/verify client error/runtime monitoring only if provider credentials/config are supplied; otherwise produce integration hook/documentation.
- Track Web Vitals in production if current stack/provider supports it.
- Separate preview/staging/production environment configuration.
- Verify custom-domain/canonical assumptions from config.
- Define cache headers and source-map policy.
- Define rollback procedure.
- Add post-deploy smoke-test script/workflow that can run after a human-authorized deploy.
- Never execute the production deploy in this phase unless explicitly pre-authorized.

### Acceptance criteria

- Measurement plan exists and implemented events are documented.
- Consent behavior is correct for configured analytics.
- Environment/config separation is documented and testable.
- Post-deploy smoke command/workflow exists.
- No production deploy occurred without authorization.

---

## PHASE 15 — AWWWARDS POLISH, FINAL CREATIVE REVIEW AND RELEASE QA

**Requirement IDs:** 490–500, 726–737, plus final polish from 391–410 and 739.

### Objective

Run the site as a jury/user would experience it, remove unfinished signals and verify that the whole site — not only the hero screenshot — sustains the quality bar.

### Mandatory tasks

- Full navigation path review across all primary pages.
- Browser console must be clean of avoidable errors/warnings.
- No failed network requests on standard user path.
- No placeholder/demo/sample copy.
- No broken links/anchors/images/downloads.
- No preview-domain leakage.
- No unnecessarily long preloader.
- First interaction must not be blocked by decorative choreography.
- Check line/rule optical alignment and 1px rendering.
- Check color system: semantic green only where intended; bronze/editorial accent restrained.
- Check typography hierarchy and mono overuse.
- Check negative-space rhythm and ensure sections do not all have equal visual weight.
- Confirm 2–3 memorable creative moments rather than effect saturation.
- Confirm menu, 404, case study, RFQ and inner pages all feel like one creative idea.
- Re-run visual regression, accessibility, performance, cross-browser, SEO and critical e2e suites.
- Produce a jury-style internal scorecard for Design, Usability, Creativity, Content and Developer execution with evidence, not optimism.

### Acceptance criteria

- All automated release gates pass or have explicitly documented non-critical accepted variances.
- No P0/P1 issue remains open without a written reason.
- Site is coherent for a multi-page 5-minute exploration, not only homepage screenshot review.
- Final scorecard identifies no known blocker to the intended award-candidate quality.

---

## PHASE 16 — RELEASE CANDIDATE FREEZE AND FINAL HANDOFF

**Requirement coverage:** closure of 1–739.

### Objective

Freeze a reviewable release candidate and prove requirement coverage.

### Mandatory tasks

- Re-read `IMPLEMENTATION.md` requirement map.
- Verify every requirement range has a PASS, REMOVED_AS_INVALID, or DEFERRED_WITH_REASON state.
- Re-run final commands from clean checkout/worktree.
- Generate `reports/release/FINAL_REPORT.md` with:
  - integration branch,
  - final commit SHA,
  - phase table,
  - total tests passed/failed/skipped,
  - accessibility result,
  - performance result,
  - browser matrix,
  - route matrix,
  - verified/removed claims summary,
  - known open issues,
  - deploy instructions,
  - rollback instructions.
- Update `PROGRESS.md` to `ALL_PHASES_COMPLETE` only after verification.
- Push final integration branch.
- Do not merge/deploy unless pre-authorized.

### Final acceptance criteria

- Every phase 00–16 is PASS.
- Final report exists.
- Final integration branch is pushed.
- No hidden failing test is represented as passing.
- No unresolved requirement ID is silently omitted.

---

# 8. REQUIREMENT TRACEABILITY — ORIGINAL 739 ITEMS

This mapping guarantees that none of the previously enumerated requirements is lost during phase consolidation.

| Original IDs | Phase |
|---|---|
| 1–38 | Phase 02 — Master grid |
| 39–73 | Phase 03 — Global navigation |
| 74–110 | Phase 04 / Phase 07 / Phase 08 — Public shell + page conversion |
| 111–132 | Phase 01 — Landing/legacy/shell cleanup |
| 133–162 | Phase 01 — CI/testing |
| 163–192 | Phase 06 — Content truth/evidence |
| 193–238 | Phase 05 — Creative interaction/motion |
| 239–257 | Phase 10 — Imagery/assets |
| 258–269 | Phase 07 — Core inner-page content architecture |
| 270–280 | Phase 03 — Menu IA |
| 281–293 | Phase 09 — RFQ/CAD |
| 294–316 | Phase 11 — SEO/meta |
| 317–343 | Phase 12 — Performance |
| 344–352 | Phase 12 — Dependency/security hygiene |
| 353–371 | Phase 02 — Design-system source of truth |
| 372–390 | Phase 13 — Accessibility |
| 391–410 | Phase 02 + Phase 15 — Optical polish/system |
| 411–423 | Phase 13 — viewport/browser QA |
| 424–430 | Phase 01 — production stabilization |
| 431–443 | Phase 02 — grid reconstruction |
| 444–450 | Phase 04 — global design system/shell |
| 451–466 | Phase 07 + Phase 08 — page-by-page redesign |
| 467–473 | Phase 06 — real evidence |
| 474–480 | Phase 05 — creative interaction |
| 481–489 | Phase 11 + Phase 12 — SEO/performance finishing |
| 490–500 | Phase 15 — award release QA |
| 501–515 | Phase 03 — IA/URL system |
| 516–535 | Phase 09 — forms/submission |
| 536–552 | Phase 09 — security |
| 553–563 | Phase 09 — privacy/KVKK |
| 564–574 | Phase 11 — sitemap/robots/crawl |
| 575–589 | Phase 14 — analytics/observability |
| 590–602 | Phase 12 + Phase 14 — infra/cache/deploy readiness |
| 603–612 | Phase 04 — route transitions/history |
| 613–624 | Phase 03 — menu refinement |
| 625–636 | Phase 06 — content/microcopy |
| 637–653 | Phase 06 + Phase 08 — case-study system |
| 654–664 | Phase 08 — blog/editorial |
| 665–669 | Phase 08 — search/discovery |
| 670–679 | Phase 10 — asset governance |
| 680–687 | Phase 08 — 404/error states |
| 688–699 | Phase 05 — motion engineering |
| 700–706 | Phase 05 — cursor/pointer |
| 707–715 | Phase 10 — typography engineering |
| 716–725 | Phase 10 + Phase 13 — browser/OS/rendering |
| 726–737 | Phase 15 — Awwwards submission polish |
| 738 | Phase 04 — real site-wide system, not skinning |
| 739 | Phase 05 + Phase 15 — one unified creative idea |

---

# 9. QA GATES BY PHASE

QA must choose the smallest deterministic suite that proves the phase, then run wider regression at milestone phases.

| Phase | Mandatory QA emphasis |
|---|---|
| 00 | Baseline integrity, requirement map completeness |
| 01 | Build/type/lint, route cleanup, shell, critical e2e, CI completion |
| 02 | Grid screenshot/geometry, breakpoint alignment, no overflow |
| 03 | menu keyboard/focus/mobile/routes/deep links |
| 04 | shared shell, history/back/forward/scroll restoration |
| 05 | reduced motion, geometry stability, frame/jank smoke, interaction semantics |
| 06 | content scan for demo/fake/unverified claims, link validation |
| 07 | representative inner-page visual regression + route behavior |
| 08 | blog/case/404/legal/error visual and semantic QA |
| 09 | RFQ success/failure/upload/privacy/security checks |
| 10 | asset/font/glyph/responsive image QA |
| 11 | metadata/canonical/sitemap/robots/internal-link checks |
| 12 | Lighthouse/bundle/dependency/perf budget |
| 13 | axe/keyboard/touch/WebKit/Firefox/multi-viewport |
| 14 | analytics/consent/config/observability smoke without production deploy |
| 15 | full regression + award scorecard |
| 16 | clean-checkout final verification |

---

# 10. PHASE CLOSURE ALGORITHM

For every phase:

```text
1. Orchestrator reads phase requirements + current PROGRESS.
2. Orchestrator verifies previous phase commit and actual file state.
3. Orchestrator creates exact Coder contract.
4. Spawn mas-coder in isolated worktree.
5. Coder implements, runs local checks, commits, returns SHA.
6. Orchestrator inspects commit diff and changed-file scope.
7. If scope violation -> reject and send correction without cherry-pick.
8. If acceptable -> cherry-pick into integration branch.
9. Spawn mas-qa from new integration state.
10. QA writes/updates tests/report only, runs checks, returns PASS/FAIL.
11. Orchestrator inspects QA evidence and cherry-picks valid QA test/report commit.
12. If FAIL -> write correction packet with exact failed criteria and send to mas-coder.
13. Repeat Coder -> QA until PASS.
14. Orchestrator reads relevant final files; does not trust summaries alone.
15. Append phase row to PROGRESS.md with commits/tests/assumptions.
16. Continue immediately to next phase.
```

Maximum correction loops are not artificially capped. If the same root cause fails three loops, the Orchestrator must change strategy: isolate the failing subsystem, reduce scope, inspect logs/files deeper, then continue. Do not simply repeat the same prompt.

---

# 11. PROGRESS.md REQUIRED FORMAT

Use one row per phase plus detailed notes below it.

```markdown
# MAS TECHNIC Autonomous Run Progress

MODE: AUTONOMOUS_AWWWARDS_RUN
BASE_COMMIT: ...
INTEGRATION_BRANCH: claude/awwwards-90-overhaul
STARTED_AT: ...

| Phase | Status | Coder commit(s) | QA commit | Tests | Timestamp |
|---|---|---|---|---|---|
| 00 | PASS | ... | ... | ... | ... |

## Phase XX notes
- Assumptions:
- Files materially changed:
- QA failures/corrections:
- Deferred non-blockers:
```

Valid statuses:

```text
NOT_STARTED
IN_PROGRESS
CORRECTION_REQUIRED
PASS
BLOCKED
```

Do not use “mostly done”.

---

# 12. ACCEPTANCE RULES FOR VISUAL WORK

Visual work must not be approved solely from DOM/CSS inspection.

For substantial visual phases:

- run app in production-like preview,
- capture target viewport screenshots,
- use Playwright golden diffs for stable surfaces,
- inspect screenshots for grid, clipping, overflow, hierarchy, density and text breaks,
- inspect focus/hover/open states,
- inspect reduced-motion state where relevant.

Do not “update snapshots” automatically after a visual failure. First determine whether the new output is intended and meets the phase criteria. Golden files are evidence, not a way to silence tests.

---

# 13. CONTENT-TRUTH RULES

The autonomous agent may redesign, rewrite and reorganize public copy, but may not create unverified facts.

Allowed without user confirmation:

- simplify marketing language,
- remove unverifiable claims,
- anonymize a project when real technical data is supplied but client permission is not,
- rewrite factual user-provided information for clarity,
- hide unfinished language switch or resources.

Not allowed:

- invent certificates or certification numbers,
- invent customer logos or permission,
- invent CMM results,
- invent measured tolerances/results,
- invent team/facility size,
- invent delivery/KPI percentages,
- invent encryption/NDA/retention guarantees,
- create fake verification QR destinations.

---

# 14. DEFINITION OF “AWWWARDS 90+ READY” FOR THIS PLAN

The run is not complete merely because pages look expensive. A release candidate must satisfy all of these dimensions:

**Design** — one coherent technical-editorial system from home to 404; exact grid craft; typography/imagery consistency; no generic SaaS residue.

**Usability** — navigation is obvious enough to use, keyboard/mobile states work, route/history behavior is correct, RFQ works, no decorative interaction blocks users.

**Creativity** — the measurement/verification thesis shapes interaction and motion; 2–3 memorable moments; not a clone of reference sites.

**Content** — verified evidence, useful case studies, real technical information, no fake proof or placeholder states.

**Developer execution** — performant, accessible, cross-browser, tested, maintainable, clean CI, correct metadata and release discipline.

---

# 15. FINAL OUTPUT EXPECTED FROM THE ORCHESTRATOR

When all phases pass, return only after producing the repository report and pushing the integration branch. The final human-facing summary must include:

- integration branch and final commit,
- phase completion count,
- test totals,
- Lighthouse/Web Vitals summary,
- accessibility/browser summary,
- any missing optional real-world content that the user can still supply,
- whether merge/deploy was intentionally not performed,
- path to `reports/release/FINAL_REPORT.md`.

Do not claim production deployment unless it was actually performed and verified.

