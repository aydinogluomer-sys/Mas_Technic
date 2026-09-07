# MAS TECHNIC Autonomous Run Progress

MODE: AUTONOMOUS_AWWWARDS_RUN
BASE_COMMIT: b6f2552aa376edfd678ad0d7465e12aa26d260d3
RUN_BASE_COMMIT: 366f321 (pre-run working tree preserved + plan path normalized)
INTEGRATION_BRANCH: claude/awwwards-90-overhaul
USER_BRANCH_PRESERVED: claude/motion-layer-and-asset-pipeline @ b6f2552 (untouched)
STARTED_AT: 2026-08-31T01:51:28Z
CURRENT_PHASE: 08

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
| 06 | PASS | 895e1ff..a9763a4 (8), af83702..d5e2c90 (5), ad6dcb4, 6cefea8, f9e164d | 1cf8f14..3724b1b (3), 9f56bbf, 7c8a761, 2b904c1..516efc3 (4) | 544 passed / 0 failed / 3 skipped; 281 QA probes added | 2026-09-03T02:10Z |
| 07 | PASS | e598d01..dfe9da7 (5); C1 f73efe3..6f37eb0 (11); C2 93b77bc..23cbc63 (6); C3 73adb1b..6984fae (3) | R1 94f0ef0; R2 55d1e2f..19acc52 (12); R3 335ff5e..bf960c6 (3); R4 fac2b65..92567c4 (4) | visual 122 passed / 18 skipped / 0 failed (per project); critical 163 passed / 3 skipped / 0 failed (chunked) | 2026-09-04T18:40Z |
| 08 | PASS | 7dcfb65..5138fc1 (15); C3 2994246..b77be5c (5); C4 6981a4d..c79147b (3); C5 5003c66..27de482 (3) | R1 aae3536; R2 e676ef2..a5e4e7d (9); R3 f9f5442..41fe117 (13); R4 a9291bd..0b3ed2a (6) | round 3 full regression 1168 passed / 557 skipped; round 4 closing lanes 219 passed / 19 skipped; 1 carried pre-existing red (R2-3, A23) | 2026-09-05T22:06Z |
| 09a | IN_PROGRESS | — | — | — | 2026-09-06T02:40Z |
| 09b | NOT_STARTED | — | — | — | — |
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
| A10 | 07 | "Services listing" and "Sectors listing" are satisfied by redesigning `src/pages/CategoryPage.tsx`; no new `/hizmetler` or `/endustriyel` index route is created. | There is no bare family index route. Phase 03 fixed the public IA in `src/components/navigation/ia.ts` and `e2e/landing/navigation-reachability.spec.ts` proves the route inventory against it, so a new index route would break a delivered contract. `CategoryPage` already serves all three families (15 category routes) and **is** the listing surface. IMPLEMENTATION.md §1.1 puts existing code and repo tests above later docs. |
| A11 | 07 | Phase 07 grants `mas-coder` ownership of `playwright.config.ts`, `e2e/visual/**` and `e2e/__golden__/**`, which §3.3 otherwise assigns to QA. | §3.3 permits it when the phase task explicitly gives the Coder ownership. Phase 07's acceptance requires desktop/tablet/mobile goldens for the routes it redesigns; capturing a golden is inseparable from the redesign that changes it, and splitting them across two agents guarantees a broken intermediate state. Same basis as A08. `mas-qa` still verifies independently and may add its own specs anywhere in `e2e/**`. |
| A12 | 07 | A `visual-768` project is added to the Playwright visual matrix (previously `[375, 1280, 1440]`). | Phase 07 acceptance requires **tablet** golden coverage and no tablet width existed in the visual matrix, so the criterion was unmeetable as configured. Goldens this creates at 768 are first baselines, not regenerations — but the Coder is required to visually inspect each one before committing, because a first baseline can pin a defect exactly as a regenerated one can (Phase 04 D0 precedent). |
| A13 | 07 | Five clean stale `.claude/worktrees/agent-*` worktrees at pre-run snapshot `1477484` were removed and their throwaway branches deleted. | Each verified `git status --porcelain` empty and unlocked. Same class as A06, where stale worktrees blocked all agent spawning. Never merged; the integration branch was untouched. |
| A14 | 08 | Phase 08 grants `mas-coder` ownership of `e2e/shared-shell-accessibility.spec.ts`, `e2e/visual/**`, the golden PNGs and `scripts/motion-audit.mjs`, which §3.3 otherwise assigns to QA. | Same basis as A08/A11, and forced: the phase adds three routes, and both the shared-shell route inventory and the motion rest matrix hard-code the route list. Splitting "add the route" from "add it to the inventory the suite asserts against" across two agents guarantees a red intermediate state. The Orchestrator's first packet mandated new routes while placing both files on DO_NOT_TOUCH — an impossible contract, corrected in packet C1. `mas-qa` still verifies independently and may add its own `qa-*` specs. |
| A15 | 08 | "Build case-study/project index and detail pages" is satisfied by `/kabiliyet-profilleri` + `/kabiliyet-profilleri/:slug` over the three `kind: "capability"` entries in `src/content/caseStudies.ts`, and the surface says on the page that these are capability profiles rather than delivered customer projects. | `USER_INPUTS.md` §J `NDA_AVAILABLE: NO` and §G: there is no customer project the repo can substantiate and no permission to publish one. IMPLEMENTATION.md §13 and the run brief both require neutralising an unverifiable public claim rather than inventing one or stopping. The Phase 06 data model was built for exactly this: an entry changes `kind` and gains `measuredResults` when a real project and a permission arrive, and nothing else is rewritten. |
| A16 | 08 | "Rework Quality/Resources into real technical-document/evidence surfaces" is satisfied by `/kalite-dosyasi` presenting the four §H PDFs as a document register with their measured file sizes, rather than by asserting certifications. | The repo can substantiate the documents themselves — they exist in `public/` — but not any certification claim about them. Publishing the register is evidence; publishing a claim about scope of certification would be invention. `DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK` also bars restating anything in them that §D holds private. |
| A17 | 08 | The legal pages now disclose that chat messages are transferred to Google (`generativelanguage.googleapis.com`) although `USER_INPUTS.md` contains **no field** for AI, processors or third parties. | The transfer is a fact of the shipped code (`supabase/functions/chat/index.ts`), not a fact supplied by the user, so the publication policy does not gate it — a privacy page that omits a transfer the code performs is false, and §13 forbids that. The disclosure is confined to what the code proves (when the request is made, what is sent, what is not forwarded, that nothing reaches the database) and deliberately asserts **nothing** about Google's retention, training or handling, which is unknowable from this repo. |
| A18 | 08 | QA copied the primary checkout's gitignored `.env` into the `wt/qa-p08` worktree and rebuilt before measuring anything. | A worktree has no `.env`, and without one every route renders the top-level error boundary — so a QA agent that did not notice would have measured an error page and reported it as the site. The file was **not** committed and the worktree is throwaway, so no secret enters git. Same class as A04 (`node_modules` junction): worktree setup, not a product decision. Any future worktree-based QA must do the same.
| A19 | 08 | Correction packet C3 extends the A14 grant: `mas-coder` may edit `e2e/visual/radius-census.ts` (the `lines` field of one `RADIUS_SOURCES` entry), `e2e/__golden__/**` (only baselines whose diff the footer change explains) and comment prose in `e2e/technical-landing.spec.ts`. | §3.3 permits a phase task to give the Coder ownership, and D2 forces it: the register's SOURCE column is **generated** from `RADIUS_SOURCES` (`radius-census.ts:194`), not parsed from the document, so the doc cell and the code constant are one contract living in two files — repairing either alone turns the sibling test red. QA's stated fix ("a one-line citation update in `docs/lean/17`") is incomplete for that reason; the packet says so and tells the Coder to verify it before editing. The golden grant is A14 continued for the same footer. The `technical-landing.spec.ts` grant is prose-only and conditional: every executable line, `0.26` included, byte-identical, proven with `git diff -U0`. |
| A20 | 08 | D5 (unbranded CAD-parse and form errors) is accepted as CARRIED to Phase 09 — on the plan's authority, not on the write-allowlist claim QA declined to accept. | The literal claim in `docs/lean/18-document-surfaces.md:162-165` ("Phase 09 owns it and Phase 08 may not edit it") is **unverifiable**: subagent packets were never persisted to disk, so nothing in the repository records that allowlist. The substantive claim is verifiable and true — IMPLEMENTATION.md §7 PHASE 09 names the file (“Decompose oversized `TeklifAl.tsx`”) and names these exact states (“Handle timeout/network/upload/parse failures”, “Client validation with accessible field errors”). Phase 08's own mandatory task also names “CAD parse error, form error”, so this is a **plan overlap**, not a Phase 08 evasion. Branding a toast inside a 1540-line file Phase 09 will decompose is the same work twice plus a merge conflict with the decomposition. Phase 09 therefore inherits a hard requirement: wire `ShellNotice tone="error"` — built by `7dcfb65`, used **zero** times in `src/` — to both states. The doc sentence should be re-pointed at §7 PHASE 09 rather than at an uncitable packet. |
| A21 | 08 | D6: criterion 3's five failing routes are two Phase 09 routes plus three genuinely unowned auth routes; all five attach to Phase 09, which is split 09a/09b. | `/teklif-al` is Phase 09's by §7. `/cad-dashboard` is not a fifth problem — `src/components/navigation/ia.ts` records it as “Redirect alias for /teklif-al, not a destination of its own”, which is why QA measured byte-identical symptoms on both (16 teal, 3 Radix, 1 shell primitive); fixing one fixes the other. That leaves `/giris`, `/sifremi-unuttum`, `/reset-password`, named by no phase. The run brief requires Phase 09 to be halved regardless (Phase 05 §10 precedent, which bought a correction round), so they attach to **09b**, beside the form primitives 09a builds. Scope constraint recorded now so 09b does not overreach: all four are `NON_SHELL_PUBLIC_ROUTES` (`e2e/shared-shell-accessibility.spec.ts:83-88`) and `:334` asserts 95 full-shell + 4 non-shell = 99. Criterion 3 asks for the design **language**, not the shell chrome; migrating them into the shell would re-derive that 99/95 contract and is not what the criterion requires. |
| A22 | 08 | Four forgotten `vite preview` servers (ports 4173, 4187, 4190, 4191; started 03–05 Sep by agents that are long dead) were stopped during C3 integration. No worktree, branch or file was touched. | Same class as A13 (stale worktrees) — environment hygiene rather than a product decision, and this time it was blocking: `reuseExistingServer` on the default port 4173 makes a suite silently test **another worktree's `dist`**, which is a wrong measurement that looks like a right one. They were identified by port with `Get-NetTCPConnection` rather than by guessing at process names, and a preview server is restored by re-running `npm run preview`. The 8 GB box is genuinely short as well: a cold `npm run build` in the primary checkout died with `write ENOMEM` at ~1 GB free while they were up. Recorded because stopping a process is a side effect on the user's machine, however small. |
| A23 | 08 | `e2e/landing/motion-grammar.spec.ts:254`, red at `tablet-768` and `landscape-844`, is recorded as a PRE-EXISTING failure carried to **Phase 10** rather than fixed in a Phase 08 correction round. | QA proved it pre-existing rather than asserting it: `git log 7dcfb65~1..b77be5c` over both `src/styles/technical-landing.css` and the spec is **empty** — no Phase 08 commit, C3 included, touched either file. The cause is a breakpoint/pointer mismatch: the test branches on `(hover:hover) and (pointer:fine)` and both projects set `mobile: true`, while the rule that removes `.tl-dimension-lines` is `@media (max-width:767px)` (`technical-landing.css:507`), so a hover-only affordance paints on a coarse pointer at 768 and 844. It went unseen because this run had never exercised those two viewports. Fixing it removes the lines at 768 and therefore **changes landing goldens** — landing responsive art direction, which Phase 10 owns, not a legal-page correction packet. Precedent for carrying a pre-existing red across a phase close is in this table's own history (Phase 02 "1 pre-existing fail", Phase 03 "4 pre-existing page-debt fails"). |
| A24 | 08 | `e2e/qa-p08-storage-disclosure.spec.ts` test 3 is **re-aimed** by QA in round 3 — from "no cookie is created on any public route" to "every cookie observed on any public route is covered by the published disclosure" — rather than left permanently red or made green by touching `Login.tsx`. | The assertion `expect(cookies).toEqual([])` encoded a **published claim**, and it did its job: it held `/cerez-politikasi` to its word and it is how R2-2 surfaced. That claim has now been retired *because it was false*, and the document discloses one cookie with its attributes instead. The assertion therefore no longer corresponds to anything the site asserts — it now fails on a **correctly disclosed** cookie, which is not a defect. This is the Phase 04 re-aiming shape, not a weakening: the JOB changed. The new assertion is strictly stronger for the purpose the gate exists to serve — it goes red the day an undisclosed cookie appears, which the old one could not distinguish from the disclosed one — and it is immune to the variance C4 measured, where `.w.hcaptcha.com`'s ephemeral worker hostname produced **two** `__cf_bm` entries in one run and **one** in another, so any count-based assertion would flake. The Coder was right to refuse all three green paths available to it (removing hCaptcha = DO_NOT_TOUCH and Phase 09's security call; editing QA's test = forbidden to the Coder; blocking `hcaptcha.com` at the network layer = a test that lies) and to return PARTIAL instead. Leaving it red was the remaining option and is rejected: this run gates phase closure on suites being green, so a permanently expected-red test would both block Phase 08 forever and corrode the discipline every other gate depends on. The visibility it was preserving belongs in this file and in the Phase 09 packet, which is where hCaptcha's fate is recorded. Both existing negative controls must be extended to the new assertion, and QA must write the reasoning into the file the way Phase 04 wrote its own. |
| A25 | 08 | R3-1 — a `mobile-320` failure on `/hizmetler/cnc-frezeleme`, a **Phase 07** surface — is fixed inside Phase 08's C5 rather than carried, even though A23 carried a different pre-existing red one round earlier. | The two are not alike, and the difference is the cost of the fix, not the ownership. A23's `motion-grammar` red needs `.tl-dimension-lines` removed at 768, which **moves landing goldens** and is a responsive-art-direction decision Phase 10 owns. R3-1 needs the one-class change C4 already proved on `/cerez-politikasi`, and QA states the guard goes green "with no edit to the test" — no golden, no design decision, no new mechanism. The governing reason is consistency with A24: this round rejected leaving a test permanently red because a phase that gates closure on green suites cannot ship an expected-red gate without corroding every other one. Invoking that to re-aim one test and then closing the phase with a different one red — written by this phase's own QA, in this phase's own round — would be incoherent. Recorded because it is a deliberate scope excursion beyond Phase 08's acceptance criteria, which name only Wave B surfaces: the guard is site-wide by design, so the first thing it found outside Wave B is the phase's to answer for, once. |
| A26 | 08 | `/gizlilik-politikasi` madde 02's "sohbet … sitede yazdığınız bir metnin dışarı çıktığı **tek yer**" is carried to **Phase 09** rather than repaired in a Phase 08 round — subject to QA round 4 ruling it contestable rather than false. | C5 found it and correctly refused to edit it, because its allowlist opened `GizlilikPolitikasi.tsx` only if madde 05 was contestable, and madde 05 proved true. The tension is real: madde 05 of the same document says RFQ form data and the uploaded file reach the hosting and database infrastructure, which `/kvkk` madde 04 counts as a transfer case. It is nevertheless a different severity from R2-2, and the distinction is the one that decides this: R2-2's five sentences were **false** — a cookie existed that the text said did not — whereas "dışarı çıkan metin" can honestly denote leaving our own processing chain for a genuine third party such as Google, which the RFQ path does not do. On that reading the sentence stands, and no test is red either way. Phase 09's mandatory tasks name this work exactly ("Align KVKK/privacy copy with actual data flow") and Phase 09 rewrites the RFQ path that creates the tension, so it has a real owner rather than a convenient one. **QA round 4 was asked to test this reading, not accept it**, and did. **Verdict: contestable, but my factual premise above was understated and is corrected here.** QA measured — with every non-loopback request intercepted and aborted, so nothing was written — that filling `/iletisim`'s free-text "Ek notlar" and submitting produces `POST https://<project>.supabase.co/rest/v1/meetings` carrying `{"notes":"…"}`, the typed string **verbatim**, to a different registrable domain; `/teklif-al` does the same with "Kritik ölçüler" (`TeklifAl.tsx:534`). So typed text does leave the site's own domain, and my "the RFQ path does not do that" was wrong as stated. The reading nevertheless survives, on a ground QA states better than I did: the predicate is **custodial, not a host count**. "Üç yer" was false because 3 ≠ 4 and no reading survives that; here "dışarı" is undefined and the document set uses it both ways — against, madde 05's heading is "Üçüncü taraf istekleri" and `/kvkk` madde 04 calls it an aktarım; for, madde 05's body says "**sitenin** barındırma ve veri tabanı altyapısı", and a veri işleyen is not a third party with its own purposes. Decisively, and unlike R2-2, **no reader is deprived of the fact**: madde 05 states it unqualified two clauses later, `/kvkk` madde 04 enumerates it, and C5's madde 03 now names it with its triggers. What would flip it to false is typed text reaching a party outside the processing chain — measured, and the only non-loopback hosts attempted on the whole submit path were `fonts.googleapis.com` and the one project host. Carried **by name** to Phase 09's "Align KVKK/privacy copy with actual data flow"; the repair is one clause. |
| A27 | 08 | `src/pages/Malzemeler.tsx:177` carries a C5 comment that describes the **wrong element**, and it is carried to Phase 10 as a one-line correction rather than fixed in a sixth Phase 08 round. | C5 flagged that call site as an unwatched risk because "Malzemeler' register is filterable, so its min-content is user-driven". QA round 4 measured it and the attribution is wrong: that stack holds `ul.shell-segments` — the filter buttons — not the register. The filterable register lives in `div.shell-span-full.shell-register-scope`, which is not a `shell-stack` and never carried the auto-track shape. All **12 filter states** at 320 and 375 keep the wrapper box at the column (278 / 333) with the table 491.484–543.141 inside a live scroll region, and the widest state is the default one the guard already walks — filtering can only remove rows. So **no watcher is needed** and the risk C5 named does not exist. Its `tabindex=null` is correct by design: the hook skips regions that already contain a focus stop. The comment is wrong about which element it documents, which in this repository is a defect and not a triviality — but it misleads no measurement, no test and no reader of the site, and the phase's gates are green. The authoritative facts are recorded here, so the record is right even while the comment is not. |

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

---

### Phase 06 — CONTENT TRUTH, EVIDENCE MODEL AND CASE-STUDY DATA — PASS (after 2 correction loops)

**The truth phase.** Two QA FAILs before PASS, both because the claims gate reported **0 while fabrications
shipped**. The final gate is 26 rules over 207 files / 26,068 non-comment lines.

**What was removed** (each with its `USER_INPUTS.md` authority): AS9100D (14+ sites, incl. a fake wet
signature and embossed notary seal), IATF 16949, ISO 13485, NADCAP, NIST 800-171, EN ISO 3834-2, ISO
9606-1/-2, ISO 15614-1, AWS D1.1, EN 1090, IEC 61400/62271, API 6A/6D/5CT, NACE MR0175, EN 10204,
IPC-A-610, ISO 1413; the invented certifying bodies TÜV SÜD / SGS / Bureau Veritas / DNV-GL; `%100 CMM`;
`50+` materials; `%98` on-time; team size, `15.000 m²`, machine counts, OEE, Cpk, PPAP, `50K+`/`100K+`
adet, 14 stock tonnages; blog view counts and the ranking derived from them; ZTM; every `MT-20xx-xxxx`
report number; the QR "RAPORU DOĞRULA" and QUALITY ASSURED stamp; NDA / confidentiality / security-clearance
guarantees; `availableLanguage: English`; Instagram / YouTube / `twitter:site`.
**Corrected:** `±0.005 → ±0.01 mm`, `48 saat → 1–3 iş günü`, `İstanbul → İzmir`, CAD format lists derived
from `CAD_ACCEPTED_EXTENSIONS`. **Added under explicit authority:** OHSAS 18001 (§C), TEKNOPAR (§F), and
the four `Politikalar/` PDFs (§H, all `PUBLIC_OK`, md5-identical to source) — so `KAYNAKLAR HAZIRLANIYOR`
became real downloads. **15 dead claim-carrying components deleted**, verified dead before this phase.

**Publication made a compile-time property.** `src/content/claims.ts`: `publish()` accepts only a
`PublishableClaim`; `withhold()` returns a type that cannot satisfy it, so shipping a
`PRIVATE_DO_NOT_DISCLOSE` fact is a `tsc` error. QA proved it rather than reading it — scratch probes
compile to `TS2345` / `TS2322`. Two honest limits recorded: the guarantee binds only inside `claims.ts`
(`publish`/`withhold` are module-private), and `strict: false` means `const s: string = ON_TIME_DELIVERY`
compiles.

**QA FAIL #1 — the gate reported 0 over ~30 live fabrications.** Found by extracting every percentage-,
guarantee- and certification-shaped literal from the **built bundle** and reading it. Root cause: rules
enumerated **nouns and standard numbers** instead of matching **claim shape**, and ROOTS omitted
`src/hooks`, `src/utils`, `src/config`, `src/lib`, `src/App.tsx`, `public/**`. Orchestrator ordered the
rules widened **before any string was touched**.
The structural change: certification checking became an **allow-list against §C's three certificates**
rather than a deny-list of numbers. QA then invented four designations absent from the codebase —
`ISO 27893`, `EN 4956-3`, `ASME B99.7`, `MAS 1000` — and **all four fire**. A deny-list could never have
done that. Twelve false-positive controls stayed silent, so it was not bought with over-removal.
Normalisation closed eleven lexical evasions as a class: zero-width strip, HTML-entity decode,
string-concat and `${}` interpolation joins, and **Turkish dotted/dotless-I folding** — which had been
hiding `KANITLANMIŞ TESLİM.` ("PROVEN DELIVERY") shipping in `dist/` from `SiteFooter.tsx:166`.

**QA FAIL #2 — two claims the widened gate still could not see.**
**G1:** a `"Tedarik Süresi ve Sertifika Matrisi"` table published `EN 10204 3.1` ×3, `3.2` ×2 and `CoC`
unconditionally under a `Sertifika` column, while **line 1540 of the same file, installed by the same
commit**, read `{ label: "Sertifika", value: "Talebe bağlı" }`. Blind spot: the rule read
`{ label, value }` object rows but not `headers`/`rows` tables, where heading and cell live in different
arrays. **G2:** `"ASTM standartlarına tam uyum"` / `"ISO/IEC standartlarına tam uyum"` survived because
packet #1 removed only *numbered* instances — conformity to an entire body is **strictly broader**. Blind
spot: the rule iterated standard tokens *before* consulting conformity context, so a body named without a
number produced nothing to check.
QA also corrected the Orchestrator: the `EN 10204` withholding I had accepted reached production **only
via the dev-only `/legacy-landing`** and never shipped — which is also why the landing goldens moved in
one band, not two. "Commit messages must describe what actually ships" became an explicit rule.

**The Coder caught a regression in its own instrument.** Its literal-boundary guard silenced **two real
claims on the red tree** — including `"Güvenlik stoğu (5.000 kg)"`, which never matched the `stok` stem
because Turkish softens k→ğ. It found this only by re-running the anti-laundering comparison and noticing
`company-scale-disclosure` had dropped 42 → 38, and fixed it in a third commit nobody asked for. Its
principle, recorded: *"A gate that reports fewer claims on a known-red tree is the same failure as one
that reports zero on a live one."*

**QA REVERSED ITSELF ON THE TABLE RULE.** The Coder deliberately did **not** implement QA's proposed rule,
arguing it would have deleted `ASTM A967` (nitric passivation), `MIL-DTL-16232` (zinc phosphate) and five
`EN ISO 176xx/3452` NDT method standards — the same class as `ASTM B117` / `MIL-A-8625` that QA itself had
adjudicated correct to keep. It split by column *kind* instead: a **document** column (`Sertifika`,
`Belge`, `Akreditasyon`, `Onay`, `Uygunluk`, `Rapor`) names something MAS issues, so §C applies and a cell
fires with no designation at all; a **specification** column (`Standart`, `Norm`) names which spec governs
the row. QA's verdict: `TABLE_RULE_LINE: CORRECT` — *"I was wrong, the Coder was right."* The 11 surviving
cells sit in method-comparison tables where the row's subject is the method, not MAS; and one of the 7
removed (`IPC-A-610`) QA's own scanner had never matched, because `IPC` was absent from its body list.

**Anti-laundering — the check that decides whether a gate is real.** A gate can be made green by fixing
content or by weakening rules. Verified three ways, twice by the Orchestrator independently:
- Widened gate vs verbatim pre-fix `servicePages.ts`: **117 violations**, restoring to 0 (Orchestrator).
- New gate vs `3747db5` — **the exact tree the previous gate passed with 0** — fired **14 violations**
  (Orchestrator).
- QA's `p06c-coverage-regression.mjs` diffed `rule@file:line` **sets** across both gate builds over the
  whole 222-file red tree: **767 → 788**, 26 of 27 rules identical line for line, `company-scale-disclosure`
  42 = 42, and **exactly one line lost** — the documented `chatFaqData.ts:76` keyword array, whose `:74`
  question and `:75` answer still fire. `COVERAGE_REGRESSION: NONE`.

**Evasion resistance.** QA's 18 attacks: 9/18 caught → **18/18**, with all 12 false-positive controls
still silent. QA then wrote 31 fresh probes and found 8 more holes (JS `\u`/`\x` escapes, homoglyphs
outside the folded ranges, a document heading outside the six-noun list, `onaylı` as a cell attestation,
two body-less conformity claims) — a homoglyph sweep over all 207 files found **no claim carrier** behind
any of them, so QA recorded them as hardening notes rather than findings, applying its own prior bar that
`GATE_DEFEATABLE: YES` was a finding *because G2 was live*. Final: `GATE_DEFEATABLE: NO`.

**A regression the truth work caused, disclosed and fixed.** Removing the guarantee FAQ cost the chatbot
its `garanti`/`güvence` keywords, because those words cannot live in `src/data` without firing the rule.
QA found it was **worse than disclosed**: `"garanti veriyor musunuz"` did not fall through — it
**mis-routed to the DFM design-support answer at 0.67**, i.e. answered confidently and wrongly. Fixed by a
narrow per-rule `exempt` hook (only `unconditional-guarantee`, only inside `keywords: [ … ]`), plus
dropping 14 content-free question-form words from scoring. QA A/B'd **165 queries**: four targeted queries
now reach the returns answer at **1.00**; five collateral changes, all disclosed. The Coder had already
*shrunk* an earlier, larger stopword list because it turned QA's `hatalı parça gelirse ne olur` from
NO MATCH into a confident wrong answer — QA reproduced that exactly.

**Goldens.** 21 regenerated in packet #1, adjudicated with QA's own dependency-free PNG decoder **before**
regenerating (never `--update-snapshots` first): 24 byte-identical controls, all 21 minimising at **offset
+0** (repaint, not shift), one tight band per width, all driven by one word (`KANITLANMIŞ`→`İZLENEBİLİR`,
same character count so nothing reflows), all far above `maxDiffPixels: 200`. Packet #2 changed **zero**
goldens — correct, since every edit was `/hizmetler/*` data and the chatbot matcher, which no golden covers.
Earlier finding retained: five of six 375 footers had been **passing while depicting a footer that no
longer existed**, a 79-px change under the 200-px threshold.

**Judgement calls adjudicated SOUND:** `%98` **removed** rather than corrected to the verified 95%, because
`PUBLIC_IF_VERIFIED_AND_STRATEGIC` is a conjunction and a retrospective self-grade matches none of §0's
five positioning priorities; `MIL-A-8625` / `ASME B16.5` / `ISO 2768-m` / `ASTM B117` **kept** as coating
class, interface geometry, tolerance class and test method — over-removal fails §0's `PRECISION_ENGINEERING`
priority as surely as fabrication fails the truth rule.

**CARRY-FORWARDS.** Commercial promises with **no** `USER_INPUTS.md` field, therefore ungated: ~85
lead-time day-ranges, the volume-discount schedule, the 7-day returns window, "3 iterasyonlu revizyon
döngüsü", and 4× `24 saatte ilk parça` (vacuum-casting delivery, no quote vocabulary). Advisories: the chat
matcher's substring rule (`"kaynak".includes("ayna")`); `%99.9+ okuma oranı` adjudicated a symbology
property like `%100 IACS`; the eight unreachable gate holes. Unchanged: `Maks. 50 MB` (Phase 09);
canonical / `og:url` / r2.dev `og:image` / `IST` clock label (Phase 11); band 07/10 compositional pass
(Phases 07/08); B24, B29, B30, B31.

---

### Phase 07 — INNER PAGES WAVE A — PASS (after 3 correction packets and 4 QA rounds)

**The longest phase of the run.** Six commercial pages rebuilt on the shell system; every *design*
acceptance criterion was met on the first Coder pass and never regressed. All three FAILs were **content
truth and documentation accuracy**, which sit above the phase criteria.

**What shipped.** Eight new molecules (`ShellComposition.tsx`: breadcrumb, action, index list, spec table,
run, tag row, plate, next step) plus `MaterialRegister`; `Hakkimizda`, `Iletisim`, `Malzemeler`,
`MalzemeKategori`, `CategoryPage`, `ServiceDetail` rebuilt; `ComparisonTable.tsx` deleted (proved
unreferenced); emoji category icons replaced by technical designations; `visual-768` added, since the
"desktop/tablet/mobile golden" criterion was unmeetable against a `[375,1280,1440]` matrix (A12).

**B24 CLOSED — a genuine repair, not the Phase 04 bucket shuffle.** QA built an instrument that never reads
a glyph pixel (background sampled with every text colour forced transparent over `Range` line boxes;
foreground computed as `composite(color x alpha x ancestor-opacity-chain)`), controlled at 21:1, 1:1, 3.03:1
at 16px **and** 8px, and 50%-black-on-white. It reads **28 real failures on `/endustriyel/havacilik-uzay`
at 375 on `d1ed8e3` and 0 on the integrated build.** Both axe buckets fell: violations 29 -> 0, incomplete
17 -> 4, and the 4 survivors were measured individually (10.01, 8.44, 10.01) — axe declines them only
because an image ancestor makes the background unprovable.

**QA retired the Coder's own declared risk, in the Coder's favour.** `.tl-band-index small` measures
**5.089:1**, not the ~3.0 the Coder reported and left unfixed. Its 8px control reproduces the Coder's
method error exactly (true 3.033 -> naive 2.119). The Coder was right to leave it and wrong about why.

**I4 CLOSED structurally.** The `<h1>` moved into normal flow in its own band, the photograph became a
`ShellPlate`, and the title carries **no reveal at all** — "a page title must not depend on an
IntersectionObserver" is I4's real lesson. Verified `clippers=[]`, opacity 1, fully on screen at
320/375/768/1280 under both motion modes.

---

#### QA round 1 -> FAIL: five findings, all content truth

- **F1 (most serious) — Phase 07 published annual production volumes on a surface that did not carry them.**
  `/kabiliyetler/kategori/prototipten-seri-uretime` printed `50.000 adet/yil` and `500.000 adet/yil`, from
  `CategoryPage.tsx:64-70` republishing `technicalSpecs.slice(0,2)` with **no publication-class filter**. The
  design note defended the chips as internally consistent with a table further down the same page — an
  argument orthogonal to whether the figure may be published at all. §0
  `DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES`; §D `PRIVATE_DO_NOT_DISCLOSE`.
- **F2 — the claims gate had two holes with live claims behind them.** Proved by running the byte-identical
  gate inside the tree that still carried `15+ aluminyum alasimi`: **`PASS — 0`**. Hole 1: the noun had to
  follow the digit immediately and `alasim`/`renk`/`unite` were absent. Hole 2: `{materialsData.length}+
  malzeme` **rendered "87+ malzeme ve alasim"** against a rule that existed, defeated because the digit is
  never in the source.
- **F3** — the `<h1>` was removed from three not-found bodies (`ShellEmpty`'s title is a `<p>`);
  `/endustriyel/<unknown>` also showed the wrong family rail.
- **F4** — `installFontRetry()` never ran: `page.route("https://fonts.g*")` intercepted **0 of 17** requests,
  because Playwright's `*` does not cross `/`. Two documents credited it for a 56min -> 4min improvement.
- **F5** — `docs/lean/17` §4's radius register was false of what renders.

**The Coder's own most valuable find, unprompted.** Five runs of the visual suite on an unchanged build each
failed one or two *different* captures. The two 375 failures were byte-identical (1453 px, rows 19-43, best
offset (0,0), residual flat) and body copy was doubled with a displacement growing along the line — a
**typeface substitution**. `document.fonts.ready` cannot see it (a failed face is not *pending*) and
`document.fonts.check()` cannot either (per spec it answers whether the font *list* can render without
further downloads, so a system fallback returns `true`). The fix enumerates the `FontFaceSet` for
`status === "loaded"`. **No tolerance was raised** — a looser `maxDiffPixels` would have made a typeface
substitution invisible.

#### Correction #1 — F1-F5 plus three advisories the Orchestrator promoted

- **F1 fixed fail-closed.** `publishableSpecValues()` runs a withheld pass over **label and value together**,
  then requires a positive match against publishable classes — so a spec added later that matches nothing is
  **not printed**. QA: 4/4 nonsense specs suppressed, compound-value attack fails 6/6 (including
  `"50.000 adet/yil, ±0.01mm"`), 48 rows measured, 23 changed, **0 leaks across all 69 chips**. Underlying
  claims resolved at the leaf, not hidden. `±0.01mm`, `CT4-CT6`, `ΔE ≤ 2.0`, `60-70 HRC`, the M3-M12 torque
  table and `500+ saat (ASTM B117)` all kept — over-removal fails §0 `PRECISION_ENGINEERING` as surely as
  fabrication fails the truth rule.
- **A7 (promoted advisory) found a live B28 recurrence.** `/malzemeler` was missing from the reduced-motion
  rest matrix. Adding it turned it red immediately: **`hidden=39 hiddenText=12`** at 1280 — the entire title
  overlay and property card invisible to readers who asked for reduced motion, because `titleOpacity`,
  `cardOpacity` and `cardX` took `scrollYProgress` unconditionally while `exitOpacity`/`exitScale` **two
  lines below in the same file** were already gated. Red banked in `b4995fc` before the fix. `hidden` went to
  **0**, not just `hiddenText`, and `--mode=enabled` still reports `armed=44 / armedText=12` — the
  choreography was not deleted, only turned off for readers who asked.
- **A1 (promoted)** — `MaterialMorphScroll` contrast 5 -> 0 at 375 (lowest was **1.588:1**) and 2 -> 0 at 1280.
- **A2 (promoted)** — the chat launcher was baked into **25 of 100 goldens**, 10 of them new this phase.
  Fixed with `display: none`, **not** Playwright's `mask`: `mask` paints an opaque box and would permanently
  blind every baseline to the content underneath, in exactly the region most likely to be covered by
  accident. The content there is now under test for the first time; QA decoded it and found no defect pinned.
  `hideForeignOverlays` **fails** when it finds nothing to hide — a silent no-op is how it got into 25
  baselines, and is the same failure F4 had just closed.

#### QA round 2 -> FAIL on F5-R alone; correction #2

Seven of eight items closed. The Orchestrator then **overrode QA's classification on two hardening notes**,
and both turned out to have had live carriers:

- **H3** — the annual-volume class was caught by **neither** gate in any of six forms. Re-adding the exact
  line F1 removed left the gate green. QA's bar (live carrier = finding, else hardening note) is right for a
  pre-existing hole found in the wild, and **wrong for a hole sitting behind a claim this phase just
  removed** — there the absence of a carrier is a consequence of the fix. The new rule found **12 live
  carriers in `servicePages.ts` on `d1ed8e3`**: the exact rows F1 removed.
- **H1** — one intervening adjective defeated the company-scale nouns. Live carrier:
  `Hakkimizda.tsx:29`, `50+ deneyimli muhendis`, on the pre-run base.
- **H6** — two over-removals fixed; two instruments had disagreed about whether `5 eksen` is a specification.

**A latent class found while building it:** **`\b` in JavaScript is ASCII-only**, so `\bunite` never matches
after a space. With `\b` the rule read `1000 unite/gun` as SILENT. Swept across all 27 rules on three trees
(0->0, 24->24, 834->834): real, no live carrier, hardening note.

**Anti-laundering, every gate change, `rule@file:line` SET diff:** `19f30f5` 801 -> 834 **LOST 0**;
`d1ed8e3` `PASS — 0` -> 24 **LOST 0**. 21/21 specification shapes stayed silent.

**The Coder retracted its own commit message** (`23cbc63`): a claim it had made about I-folding was false,
because `trPattern()` folds every rule centrally. Its reason: *"a wrong reason next to correct code is
precisely F5-R and H4; it does not get to survive because it was mine."*

#### QA round 3 -> FAIL on H4; correction #3 under §10

`overlays.ts` had replaced a wrong reason with one **right in two legs and false in the first**: it claimed
`CustomCursor` does not mount below 901px. The real guard is `CustomCursor.tsx:189`
(`isMobile || !finePointer`, `MOBILE_BREAKPOINT = 768`); 2 layers mount at 768 and at 900 with a fine
pointer. **901 is the breakpoint of the `cursor: none` rule at `index.css:786`** — and it also appears in a
docblock at `CustomCursor.tsx:31` quoting that CSS rule. A comment describing a stylesheet was read as the
component's own mount condition. The forward instruction therefore told future phases that sub-901 full-page
captures are safe; they are not.

**This was the third loop in which the same claim was written down wrong**, so IMPLEMENTATION.md §10 was
invoked: **stop writing the threshold in prose and make it executable.** The result is a ten-cell
`(width, pointer)` matrix asserting the real mount condition, a §4 register derived from a census rather than
typed, and only then the prose correction.

**QA made the new guard red three ways**, each injected into a **copy** of `dist/` on a second port so the
repo never contained the defect: `--gnav-z: 10000 -> 5`; header alpha `.98 -> .30`; and
`MOBILE_BREAKPOINT: 768 -> 901`, i.e. **making the retired claim true**, which turned the matrix red on
exactly the three cells it denied. Against the breakpoint mutant the census collapses to `- | - | 6` — which
*is* §4 version 3's wrong table.

**Two claims corrected against the Orchestrator's own packet:**
- **`elementsFromPoint` cannot return either cursor layer** — both are `pointer-events: none`. The
  Orchestrator relayed that method as evidence for the pointer-loss measurement; the conclusion held, the
  cited method did not. QA re-measured with the pointer actually moved.
- **The Coder's stated reason for refusing the literal assertion was false** (hiding the cursor moves no
  pixel: at 1440 the frame is byte-identical, at 1280 the diff bbox excludes the 22x22 footprint). The
  refusal was still **correct for a better reason it did not give**: `hideForeignOverlays` sums one counter
  across all selectors, so the cursor's two matches would permanently satisfy the launcher-drift assertion at
  1280/1440, disarming two specs and two of QA's own round-3 red controls.

**The "safety" of the goldens had two different causes at different widths, and both files had stated a third.**
375/768 are safe because `hasTouch: true` makes `(pointer: fine)` false (`isMobile` alone does not);
1280/1440 are safe by **paint order** — `.tl-header-band` at `z-index: 10000` over the layers' 101/100,
measured as 0 teal pixels in the committed `landing-fullpage.png` versus 6 with the header hidden.

---

**ENVIRONMENTAL — recorded because it recurred three times.** On this host the visual and critical suites
fail 1-2 assertions when run whole, a **different** one each time, and pass completely when run per project
or in chunks. Settled by measurement, not by assertion: visual **122 passed / 18 skipped / 0 failed** across
375/768/1280/1440 run separately (the same 140 executions that gave 2 failures combined); critical
**163 passed / 3 skipped / 0 failed** in five chunks. QA only **partly** accepts contention as the cause and
found a contributing defect — see N3.

**Agent losses this phase:** ten, to 600s watchdog stalls, process exits, 529s and two DNS outages. Three
were recovered by resuming with their worktree intact; one was lost because the Orchestrator removed a failed
agent's worktree as routine hygiene and made it unresumable. The incremental-commit protocol preserved work
three separate times.

**A near-miss in the record itself.** QA wrote all four rounds to `reports/qa/phase-07.md`. Integrating a
later round alone would have silently discarded the report that produced the FAIL it answers. Round 1 is
preserved as `phase-07-round1.md` and round 2 as `phase-07-round2.md`; only filenames changed.

---

**OPEN AT CLOSE (from QA round 4 §15, verbatim):**

- **A3** *(carried, advisory)* — three suites, three font policies: `shared-shell-accessibility` stubs the
  host, the visual suite now **requires** it live and fails without it, the critical suite does neither. A CI
  runner without egress to `fonts.gstatic.com` fails the visual suite by design. **Phases 14/15.**
- **N1** — no visible pointer over the header at >=901px: native `cursor: none` plus a replacement
  contributing **0 px** because it sits under `z-index: 10000`. The `:has([data-custom-cursor])` gate passes
  because it checks the replacement *exists*, not that it is *visible*. Usability high, not a WCAG SC
  failure. **Phase 13.**
- **N2** — both pointers drawn between 768 and 900px. **Phase 13.**
- **N3** — unguarded terminal `route.continue()` at `e2e/visual/fonts.ts:146` turns a slow host into
  `Route is already handled!`; every visual spec installs that handler, which explains the *roving* failures
  better than contention alone. **Phase 13.**
- **N4** — `isVisualProject` recognises one glob spelling. **N5** — the ARMED message blames the cursor for a
  header regression. **N6** — the detector over-flags on string literals. **N7** — `citationDeclaresRadius`
  passes on wide ranges. **N12** — flat-specs / no-fixture-rename now enforced by tripwires.
- **N8** — `CLAUDE.md:48` and `MASTER_CONTEXT.md:170` still say `Desktop cursor (>901px, pointer:fine)`.
  Both DO_NOT_TOUCH this run; **the user's call.**
- **N9** — `BrutalCrosshairCursor` is a **phantom**: it never existed on any ref, yet is named in 6 docs.
  Same shape as the stale B31 the Coder corrected the Orchestrator on.
- **N10** — `CustomCursor.tsx:78` still says `Z.cursor` is 90; it is 101. **Phase 15.**
- **N11** — `Z.header: 50` has **zero consumers** while `navigation.css:34` hardcodes `--gnav-z: 10000`,
  though `CLAUDE.md` names `z-index.ts` as the single source of truth for z-index. **Phase 15.**

**Carried from earlier phases, unchanged:** B29 (hero isolation contrast, Phase 13); B30 (guard fails open on
regex literals/URL strings, no live false pass); `motion-grammar:254` at `tablet-768`/`landscape-844` —
reproducible on **both** trees, `technical-landing.css:513` hides the lines under `@media (max-width:767px)`
while the spec asserts hidden whenever `(hover:hover) and (pointer:fine)` is false (**pre-existing Phase 05,
Phase 13**); win32-only golden gap; `Maks. 50 MB` (Phase 09); canonical / `og:url` / r2.dev `og:image` / `IST`
clock (Phase 11); the launcher **obstruction** itself — at 1280 it covers 91% of a `.shell-row-toggle` line
box, at 375 it fully covers five `<td>` glyph line boxes (**Phases 09/13**; A2 makes it *more* visible, since
the goldens no longer hide it); ungated commercial promises with no `USER_INPUTS.md` field; A4 (the address
expansion, adjudicated harmless because `Mah.` labels a mahalle already in §A and `Sok.`/`Sk.` abbreviate the
same word — no fact added); A6 (`/iletisim` Meet promise, 4 -> 2, Phase 09); A8 (register scrolls at 768,
Phase 08); H2 (a **loud** false positive on `"" + x`, deliberately not narrowed); H7 (counting drift, every
direction and endpoint agreeing); ~48 detail routes now emit per-page titles (**Phase 11**); the uncommitted
`.claude/` permission change (A07).

**B31 CLOSED** — `ProjectShowcase.tsx` does not exist at `d1ed8e3`; Phase 06 had already deleted it. The
Coder corrected the Orchestrator's stale carry-forward.

---

### Phase 08 — INNER PAGES WAVE B: QUALITY, PROJECTS, BLOG, RESOURCES, LEGAL, SEARCH/DISCOVERY, 404/ERROR — IN_PROGRESS (QA round 1: FAIL)

**Integration branch at this record:** `5138fc1`. **Coder worktree:** `wt/coder-p08` (left in place, resumable).
**QA worktree:** `wt/qa-p08` at `5138fc1` — round 1 dispatched, not yet returned.

**Integrated so far — 15 commits in three batches.**

| Batch | Commits | What it delivered |
|---|---|---|
| Wave B | `7dcfb65` … `931594f` (8) | Three Wave B shell molecules and the 500 state's `<h1>`; three legal texts onto one document sheet; the 404 as a coordinate that is not on the sheet, with a correction affordance; `/sss` as a register; `/blog` as a technical publication; the two new route families; two document-sheet spacing defects found by measuring the render; 16 new Wave B baselines with 23 existing goldens adjudicated per viewport before regeneration. |
| C1 | `f190ef2` … `d3c8a6c` (5) | Route inventory to 99; the motion rest matrix repointed off the site that no longer exists; the last public write to `faq_analytics` removed together with the legal sentence it made false; the skip link recognised as the **second** foreign fixed overlay and moved into `e2e/visual/overlays.ts` so every visual spec stops baking it; a dead sentinel removed from the whole-page axe lane. |
| C2 | `85a7d8b`, `5138fc1` (2) | Landing rebanked at 768/1280/1440 after per-viewport adjudication; the legal pages state that the chat does not stop at this site's backend — it goes to Google. |

**Gates on the integrated tree (Orchestrator-run, not relayed):**

| Check | Result |
|---|---|
| `npm run build` | PASS (49.84 s) |
| `npm run typecheck` | PASS |
| `node scripts/claims-gate.mjs` | PASS — 0 violations across 27 rules |
| `node scripts/motion-audit.mjs --mode=guard` | PASS |

**Two Orchestrator packet premises the Coder falsified, recorded because the pattern repeats.**

1. The C2 packet asserted "the legal pages have Wave B baselines; if one moves, stop and report." They do not.
   `e2e/visual/wave-b-golden.spec.ts` excludes the legal routes deliberately, and its own header gives the
   reason: those routes are text that will be revised by somebody who is not looking at a screenshot suite,
   so pinning them would manufacture the exact failure mode §12 warns about. Verified against the file:
   `grep -nE "kvkk|gizlilik|cerez|legal"` returns a comment line and nothing else.
2. The C1 packet mandated three new routes while placing `e2e/shared-shell-accessibility.spec.ts` (which
   hard-codes the route inventory) and `scripts/**` (which holds the motion rest matrix) on DO_NOT_TOUCH.
   Impossible as written; authorised in C1 and logged as A14.

The Coder also corrected its own first wording, from "per session" to "every time", after re-reading
`ChatBot.tsx:214`/`:248`: consent is re-asked on every unanswerable question, not once per visit.

**Two defects confirmed by the Orchestrator in the integrated tree, carried into the QA packet for adjudication
of severity rather than existence.**

- **P08-D1** — `src/components/ChatBot.tsx:239` filters the assistant's consent prompt out of the payload by
  comparing against a **stale literal** (`"… (Günlük limit: " + AI_DAILY_LIMIT + " mesaj)\n\n**Evet** yazarak
  onaylayabilirsiniz."`), while `:273` renders `"… (Kalan: ${remaining} mesaj)\n\n**Evet** veya **Hayır**
  yazarak yanıtlayın."`. The filter matches nothing, so the consent prompt **is** included in what is sent to
  Google. Harmless in content — it is the site's own string, not the visitor's — but it is a dead filter, and
  whether it falsifies a sentence on the legal pages is a QA call.
- **P08-D2** — `src/components/ScrollToTop.tsx` contains no reference to `location.hash`; it scrolls to 0 on
  every pathname change. Cross-route links to a clause anchor therefore land at the top of the page. The Coder
  mitigated it by naming the clause number in the link text. Whether that satisfies "linked back into the
  site" is a QA call.

**Assumptions logged this phase:** A14 (Coder ownership of the two files the new routes force), A15
(capability profiles, not customer projects — `NDA_AVAILABLE: NO`), A16 (the quality surface is a document
register, not a certification claim), A17 (the Google transfer is disclosed although `USER_INPUTS.md` has no
field for it, because it is a fact of the code rather than a fact supplied by the user).

#### QA round 1 — **FAIL**

Worktree `wt/qa-p08` at `5138fc1`; report and evidence committed there as **`88a4fa7`** (49 files: the report,
14 probe scripts, 18 evidence captures, 4 screenshots, 1 new `qa-*` spec; no production path in the commit).
380 passed / 2 failed / 84 skipped, 46 new assertions. The agent was killed by a process exit mid-run and was
**resumed from its own transcript** — its worktree was left in place, which is why 45 minutes of probes
survived. Contrast with the Phase 07 loss, where removing a stopped agent's worktree destroyed its work.

**Acceptance criteria as measured:**

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | 404 unmistakably MAS TECHNIC, usable, linked back | PASS | Both branches reached. `/kalite-dosyas` gives 3 suggestions, each resolving 200 with a real `<h1>`; `/qa-zzz-nothing` gives `YAKIN KAYIT 0`, block correctly absent, 8-entry directory and global nav still present. |
| 2 | Wave B shares the global design system | PASS | Measured inside `<main>` on all ten surfaces: 0 teal, 0 Radix primitives, 0 `bg-card`, 0 off-register radii, 0 system fonts, 47–404 shell primitives. |
| 3 | No public route in the old generic language | **FAIL** | `/teklif-al` 16 teal + 3 Radix + 1 shell primitive; `/giris` 92 teal; `/cad-dashboard` 16 + 3 + 1; `/sifremi-unuttum` and `/reset-password` 0 shell primitives. |
| 4 | Search/filter justified or explicitly omitted | PASS | In writing, per surface: `SSS.tsx:60-72` implemented; `Blog.tsx:41-56`, `KabiliyetProfilleri.tsx:44-46`, `KaliteDosyasi.tsx:68-69`, `NotFound.tsx:59-65` omitted, with the reason. |
| 5 | Error/loading/empty not library defaults | **FAIL** | Loading, empty and 500 are branded and reachable. CAD-format and form errors render a stock `sonner` toast: `rgb(255,255,255)`, `8px` radius, `ui-sans-serif`. |

Mandatory tasks all PASS except the two error states (D5). **"Real HTTP 404 where hosting permits" is
explicitly deferred with a verified reason** — QA confirmed no hosting config of any kind exists in the repo
and that `/bu-sayfa-yok` returns `200 text/html`. The task's own condition is therefore not met, which is a
legitimate deferral rather than a silent skip.

**Defects.**

- **D1 — BLOCKING, `critical-1280` is red.** `e2e/technical-landing.spec.ts:271`: `footer.bantOrani`
  `0.2671875` against a `< 0.26` bound, three identical runs. Cause is `src/components/navigation/ia.ts:256-257`
  — the two new `resourceLinks` grew the footer 298 to 342 px. **The bound's own comment names this exact
  failure**: "a fifth nav column, or a link column growing past ~9 rows, or the conversion rule wrapping to two
  rows at desktop, each pushes past 0.26". `931594f` rebanked 23 goldens but never ran the critical projects.
  Orchestrator note: the fix is NOT raising the constant. Phase 04's precedent in that same comment re-aimed
  0.17 to 0.26 only because the underlying geometry deliberately changed, and recorded the measurement for it.
  The first question for the Coder is whether the footer map can absorb two more links without any column
  passing 9 rows.
- **D2 — BLOCKING, `visual-1280` is red.** `radius-census.spec.ts:108`:
  `docs/lean/17-inner-page-composition.md:137` cites `ChatBot.tsx:225` for the launcher radius; Phase 08
  inserted 143 lines and the `rounded-full` declaration is now at `:294`. QA verified `:225` *was* correct at
  `7dcfb65~1`. The same drift affects the panel-radius citation nearby. Documentation-accuracy failure, one-line
  class — but it is red, so it blocks.
- **D3 — CONTENT TRUTH, the most serious finding.** `/kvkk` madde 04 (`src/pages/KVKK.tsx:86-99`) still says
  transfer happens **in exactly two cases** — a lawful public-authority request, and the hosting/database
  provider. Google is neither. `git show --stat 5138fc1` confirms the commit that exists to disclose the Gemini
  transfer touched `CerezPolitikasi.tsx` and `GizlilikPolitikasi.tsx` and **not `KVKK.tsx`**. The notice's own
  madde 02 puts content-borne personal data in scope, so chat text is in scope by the document's own rule. This
  is worse than an omission: the sentence affirmatively **closes** an enumeration that is now incomplete.
- **D4 — CONTENT TRUTH.** `/cerez-politikasi` madde 02 claims its storage list is complete; measured over six
  routes it is short by `mas_intro_seen`, declared at `index.html:302`. Cookies proper: genuinely zero, as
  claimed.
- **D5 — Orchestrator decision, not a Coder correction.** The two unbranded error states are deferred at
  `docs/lean/18-document-surfaces.md:162-165`. QA did **not** verify the write-allowlist claim behind that
  deferral, and says so.
- **D6 — Orchestrator decision.** Criterion 3 fails on five routes. QA reports that no phase owns them; the
  Orchestrator's reading is that `/teklif-al` and `/cad-dashboard` are substantially rewritten by **Phase 09**,
  which decomposes `TeklifAl.tsx` (1540 lines), and that only the three auth routes — `/giris`,
  `/sifremi-unuttum`, `/reset-password` — are genuinely unowned. To be settled when Phase 09 is scoped.

**The two carried defects, adjudicated.**

- **P08-D1 (`ChatBot.tsx:239-240`)** — makes **no** legal sentence false. All three texts say "o ana kadarki
  yazışma", which covers the consent prompt. QA traced the real payload: every prior turn, the consent prompt,
  and a duplicate of the question; `callAi`'s first argument is dead. **Not a Phase 08 blocker — carried to
  Phase 09.** QA's corollary is the part worth keeping: the defect is *masked* by broad wording, so if anyone
  later narrows that clause it becomes false the same day with **no test watching**. Fix by keying the filter
  on state, never on a string literal.
- **P08-D2 (`ScrollToTop.tsx`)** — confirmed by measurement and worse than assumed: the clause sits 2115 px
  below a 900 px viewport both after an SPA click **and** after a full navigation to the pasted URL, because
  the `useLayoutEffect` overrides the browser's native fragment scroll. It does **not** affect criterion 1; all
  404 links are route paths and all resolve. It does break the only cross-route hash link in the app —
  `ChatBot.tsx:418`, created by Phase 08, in the privacy affordance. **MEDIUM, required before release.**

**Goldens — §12 honoured.** No `--update-snapshots`, at any point. All four visual projects run per-project:
35/35/35 green, 40+1 at 1280, where the 1 is D2, a citation assertion rather than a snapshot. **All 16 new and
all 23 modified baselines matched.** QA falsified the rebank claim rather than accepting it: first meaningful
changed row 3752 of 3918 on the 1280 landing, 132 of 298 on the footer crops — nothing above the footer moved.
At 375 it is a sub-pixel plus-or-minus-1 shift from the rewritten `/blog` and 404 bodies, with
`SiteFooter.tsx`, `footer-groups.ts`, `claims.ts` and `Header.tsx` byte-identical across the phase. All 16
`waveb-*` contain their stated subject: 6 opened by eye, 10 checked for degeneracy.

**Orchestrator verification of QA's claims.** D2, D3 and D4 were re-verified independently at the source
(`git show --stat 5138fc1`; `docs/lean/17-inner-page-composition.md:137` against `grep -n "rounded-full"
src/components/ChatBot.tsx`; `src/pages/KVKK.tsx:86-99`; `index.html:302`). D1 was verified in *substance* —
the bound, its comment, and the `ia.ts` change — but the **`critical-1280` run itself was not repeated by the
Orchestrator**; that figure is QA's, from three identical runs. Recorded as relayed, not as independently
confirmed.

**Stated unverified by QA, carried:** the full `desktop-1280` regression, cut off by the process exit, though
`critical-*` and `shared-shell-accessibility` did run; the other seven regression viewports; `smoke-*` on
Firefox and WebKit; contrast at 375 with the glyph-free instrument, where axe ran clean; the write-allowlist
claim behind D5; and whether `mas_intro_seen` is the only unlisted storage key.

**Environmental fact worth carrying (A18).** The QA worktree had no `.env`, and without it every route renders
the top-level error boundary — a QA agent that did not notice would have measured an error page and reported it
as the site. QA copied the main repo's `.env` in, gitignored and **not** committed, and rebuilt; every
measurement above is post-rebuild. Any future worktree-based QA must do the same.

#### Correction round C3 — dispatched 2026-09-05T07:37Z

**QA round 1 integrated first.** `88a4fa7` was still sitting on `wt/qa-p08` and had never been cherry-picked,
so the Coder would have based C3 on a tree without QA's 46-test contract spec or its probes. Scope inspected
before picking: 49 files, `e2e/qa-p08-waveb-contract.spec.ts` and `reports/qa/phase-08/**` only, no production
code — clean under §3.3. Cherry-picked as **`aae3536`**, now the integration HEAD and the C3 base commit.

**Worktree.** Reused the existing `C:\Users\Trade Bilisim\pdh-wt\coder-p08` (clean, `node_modules` junction,
`.env` present), branch `wt/coder-p08c3` created at `97dab55` and fast-forwarded to `aae3536`. **No worktree
was deleted**, and `wt/coder-p08c2` still points at `ed427b7`. Packet persisted to
`.work/packets/phase-08-C3.md` so it survives an agent death — the Phase 08 packets were not, which is exactly
why A20 could not be settled on its own terms.

**Packet scope:** D1–D4 only. D5 and D6 are settled above (A20, A21) and were deliberately kept out of it.

**Two Orchestrator corrections to QA's stated fixes, both verified at source before the packet went out.**

- **D2 is a two-file contract, not a one-line doc edit.** `foldRegister` (`e2e/visual/radius-census.ts:194`)
  builds each register row's SOURCE cell as `` `${basename(source.file)}:${source.lines}` `` — from
  `RADIUS_SOURCES`, not from the markdown — and the sibling test asserts the rendered rows `toEqual` the table
  parsed out of the document. Editing `docs/lean/17:137` alone would have turned *that* test red and produced a
  second correction round. Two further citations in the same document have drifted the same way
  (`ChatBot.tsx:276-346` → the in-panel radii are now at `:345,:357,:369,:395,:428,:434`), and one claim in it
  is now flatly false: `docs/lean/17` says `ChatBot.tsx` is byte-identical to blob `7a5daf0` at the Phase 06
  close, but `git hash-object src/components/ChatBot.tsx` is `44d9bafc…`. `CustomCursor.tsx` is still
  `98e64abf…`, so only half the sentence rotted. Four repairs, not one.
- **D1: the Phase 04 comment's "~9 rows" estimate is the part that is wrong, not the bound.** The same comment
  states headroom over the measured value as 11%; 11% of 298 px is 34.8 px, i.e. **~1.5 link rows** at the
  ~22.5 px pitch implied by 45 px / 2 rows. From a 6-row column the guard therefore trips at **8** rows, which
  is exactly what happened. So the earlier note in this file — "the first question is whether the footer map can
  absorb two more links without any column passing 9 rows" — asks the wrong question: 9 rows was never
  reachable. The packet hands the Coder the arithmetic and forbids raising `0.26`, and requires `BLOCKED` with
  measurements rather than a re-derived constant if nothing defensible fits under 332.8 px.

**A blast radius the packet closes off.** `src/components/navigation/ia.ts` is DO_NOT_TOUCH for D1, because
`resourceLinks` is also read by `NavDirectory.tsx:50-53` — which prints `resourceLinks.length` as the
fullscreen menu's zero-padded index — and by `NotFound.tsx:150,164`, whose 8-entry directory is QA's own
criterion-1 evidence. Removing an entry there would silently edit the menu and the 404. The fix locus is
`src/components/shell/footer-groups.ts`: how the footer composes four columns, not what the IA publishes.

**Footer row counts counted from source at `aae3536`** (the packet's input, to be falsified by measurement):
HİZMETLER 5, KABİLİYETLER 5, ENDÜSTRİYEL 6, KURUMSAL 6 → **8**. The band is as tall as its tallest column, and
298 px → 342 px matches 2 rows at ~22.5 px. ENDÜSTRİYEL at 6 cannot absorb anything without becoming the new
tallest.

**Still relayed, not independently confirmed:** the `0.2671875` figure is QA's, from three identical runs; the
Orchestrator has not re-run `critical-1280`. The packet requires the Coder to measure it directly, and QA
round 2 will re-measure it a third time.

#### C3 returned and was integrated — 2026-09-05

Five commits, cherry-picked one at a time into the integration branch as `2994246`, `17c5b3c`, `e62e96c`,
`64edf48`, `b77be5c`. The integrated tree is byte-identical to the Coder's `a48c719` outside `PROGRESS.md`
and `.work/` (`git diff --stat` empty), so nothing was lost or altered in transit.

**Scope audit — PASS.** 27 files: `footer-groups.ts`, `KVKK.tsx`, `CerezPolitikasi.tsx`, `docs/lean/17`,
`radius-census.ts`, `technical-landing.spec.ts` (comment prose) and 21 goldens at 768/1280/1440. Nothing from
the DO_NOT_TOUCH list: `ia.ts`, `ChatBot.tsx`, `ScrollToTop.tsx`, `TeklifAl.tsx`, `sonner.tsx`,
`GizlilikPolitikasi.tsx`, `supabase/**`, `reports/qa/**`, `.claude/**`, `tsconfig.json` and `package*.json` are
all untouched. `visual-375` goldens untouched.

**The one optional item, proven rather than asserted.** `e2e/technical-landing.spec.ts` was edited. Stripping
comment lines from both revisions and hashing gives `ab22563e…` on each side — identical — and `0.26` is still
`0.26`. The comment now records the measured trip point instead of the "~9 rows" guess.

**A premise of mine was falsified, correctly.** My C3 row-count table gave ENDÜSTRİYEL as 6 rows. It has **5**:
`navigationItems[2].children` holds five categories, and my grep counted `path: "/endustriyel/kategori/
yuksek-teknoloji"` twice because the family's own path and its first child's path are the same string
(`ia.ts:184` and `:188`). All three family columns were 5, so the option space was wider than the packet
claimed. It did not change the outcome — the Coder chose the packet's option 4 — but the table was wrong and
the record should say so.

**What ships.** `/kabiliyet-profilleri` moves to the KABİLİYETLER column (a reference surface under the family
whose name it carries); `/kalite-dosyasi` stays with the other reference surfaces in KURUMSAL; `Ana Sayfa`
leaves the footer, because the fixed header brand (`Header.tsx:489`) and the menu brand (`Header.tsx:552`)
already link `/` at every width and the menu's own KURUMSAL column has never listed it. `ia.ts` is untouched;
KURUMSAL takes the **complement** of what a family column adopts, so no `resourceLinks` entry can be dropped by
editing the map. Rows 5 / 6 / 5 / 6, band 342 px → **297 px**, ratio 0.2320 against a 332.8 px ceiling, pitch
22.50 px measured (not divided), **one row of headroom** — written into `footer-groups.ts` and into the spec
comment next to the thing that spends it.

**Independently verified by the Orchestrator at `b77be5c`, not relayed.** `critical-1280` on
`e2e/technical-landing.spec.ts`: **15/15 green**, including `keeps reference proportions…` — the assertion this
whole round exists for, and the third independent measurement of it. `radius-census.spec.ts` citation test and
its drift control: **2/2 green**. Both run in the foreground against a `dist` built at 13:20, after the last C3
commit.

**Two integration incidents, both resolved without touching user state.** A range `git cherry-pick` refused
(the sequencer wants a clean index) and left sequencer state plus the intentional `.claude/**` and
`tsconfig.json` changes staged. Cleared with `cherry-pick --quit` (which does not touch the working tree) and
`restore --staged`, returning those eleven files to exactly the ` M` state they were found in, contents
unchanged; the five commits then went in one at a time. Separately, a cold `npm run build` in the primary
checkout died with `write ENOMEM` — see A22.

**One truth risk I am carrying, not silently accepting.** `/kvkk` now repeats a sentence
`/gizlilik-politikasi` has shipped since `5138fc1`: that data left in the RFQ flow "hiçbir yapay zekâ servisine
gönderilmez". `supabase/functions/` also holds `finance-ai`, `ocr-invoice` and `parasut-sync`. The claim is
plausible — those are admin-side and invoice-shaped — but it is now published in two documents and has never
been traced. QA round 2 is asked to trace it; if it is false as written it blocks, and it is in any case an
input to Phase 09b's privacy scoping.

**QA round 2 dispatched** to `wt/qa-p08r2` at `b77be5c`, packet at `.work/packets/phase-08-QA-R2.md`. It is
told not to re-fail criteria 3 and 5 (carried per A20/A21) but to re-measure them and report if either got
worse; to falsify the footer account and the 21-golden rebank with its own instruments; to close its own
round-1 unverified list, starting with whether `mas_intro_seen` really is the only unlisted storage key — that
one is now load-bearing for a published completeness claim; and to add a permanent storage gate, because D4 was
a legal-text claim that nothing tested and it was wrong for as long as it existed.

#### QA round 2 — interrupted after step 3, resumed not restarted

The QA agent was killed by a Claude Code process exit, not by anything it did. **Its commit discipline held and
nothing was lost:** three step commits stand on `wt/qa-p08r2` (`e676ef2`, `6f55acc`, `87d0bb9`) and steps 4–5
were on disk uncommitted. Resumed from its own transcript via `SendMessage` — per the run's rule, a dead agent
is resumed, never restarted — with instructions to commit the loose evidence first and continue at step 5. The
worktree was not deleted and no work was redone.

**Gates re-measured, third independent reading.** `critical-1280` 15/15; `critical-375` 81 passed / 2 skipped;
`radius-census` 3/3 including the drift negative control. `bantOrani` **0.23203125** from a **297.0000 px**
band, ceiling 332.80 px, headroom 35.80 px = 1.591 pitches = exactly one row. Columns ship 5 / 6 / 5 / 6; all
five `resourceLinks` entries appear exactly once in each footer rendering; `href="/"` appears **zero** times in
the footer, and the header brand clicked from the bottom of `/kalite-dosyasi` lands on `/` at both 375 and
1280 at focus position 1. IA controls unmoved: menu KAYNAKLAR index `05`, 404 directory 8 entries — so the fix
did not leak into `ia.ts`.

**The strongest evidence in the round.** Current 1280 `landing-fullpage` against **pre-Phase-08** `7dcfb65~1`:
`heightDelta 0`, 61 changed rows all inside the footer, and **zero changed pixels above the footer top at
threshold 1/255**. The band is back where Phase 04 left it, and the phase's two links cost nothing above it.
Not one golden mismatched across the four visual projects.

**NEW DEFECT, expected blocking — the cookie table is unreadable on a phone.** At 320 / 375 / 390 the storage
table renders **583.9 px wide inside a 375 px viewport**: `DEPO`, `NE İŞE YARAR` and `SÜRE` are entirely
off-screen for all five rows, and **nothing scrolls** — `scrollLeft` forced to 9999 on every ancestor from
`<table>` to `<documentElement>` stays 0, there is no `tabindex`, and `div.shell-root` computes
`overflow-x: clip`. The reflow guard is green *precisely because an ancestor clips*, which is worth carrying:
that guard cannot see this failure class. It is **not** the fifth row's fault — hiding the new row leaves the
width at 583.9 with identical columns — and it is Phase 08's own: the table arrives in `36c3980` and
`7dcfb65~1` has none. Root cause isolated to the call site: `CerezPolitikasi.tsx:133` wraps the figure in a
bare `div.shell-stack` whose implicit grid track resolves to 585.875 px, where `/kalite-dosyasi` uses
`shell-span-read shell-stack` and resolves to 333 px. Orchestrator-verified at source: the primitive is
innocent — `ShellSpecTable` (`ShellComposition.tsx:224-268`) already wraps its table in
`div.shell-table-scroll`; it simply never becomes a scroll container while its own box is unconstrained. The
other seven `ShellSpecTable` figures measure 333 px and do become real scroll regions.

**Two claims C3 itself added are contradicted by measurement**, and both go into C4 rather than being left in
commit bodies:

- `e2e/technical-landing.spec.ts`'s new "the same in all four columns and at 375/768/1280/1440" is **false at
  375**: `.tl-footer nav` is `display: none` there and every pitch delta is 0.
- `footer-groups.ts`'s single tallest-column model holds only at **>=1024**. At 768 the band is a 2x2 grid
  (`grid-template-rows: 150px 150px`) whose height is tallest(row 1) + tallest(row 2) — 13 rows before, 12
  after, which is why 768 lost one pitch where 1280/1440 lost two.

**A 375 state no golden covers.** With `.tl-footer nav` collapsed the footer is 740.44 px and immune to this
change; opening the four disclosures takes it to 1684.44 px at a 40 px pitch with both changed columns fully
visible. Immunity at 375 is conditional on the disclosures staying shut, and nothing photographs the open
state.

`installFontRetry()` failed three times (once each at 375, 768, 1440), all clean on isolated re-run — a higher
flake rate than the C3 Coder saw, and another input to the Phase 12 decision to self-host the three families.

#### QA round 2 returned — FAIL, on two defects C3 was never asked to touch

Nine QA commits cherry-picked as `e676ef2..a5e4e7d`; scope audited first and clean (`reports/qa/**` and
`e2e/qa-p08-storage-disclosure.spec.ts` only, no production file). 1155 passed / 6 failed / 526 skipped; three
of the six failures are the one `installFontRetry()` fixture flake, clean on isolated re-run.

**All four C3 fixes verified.** D1, D2, D3, D4 confirmed at the measurements above. The phase fails on
different ground.

**R2-2 — the heaviest finding of the whole phase, and QA found it by correcting itself.** `/giris` mounts
hCaptcha on page load (`Login.tsx:230`, no interaction required), which sets `__cf_bm` on `.hcaptcha.com` and
`.w.hcaptcha.com` (30-minute lifetime) and contacts four `hcaptcha.com` hosts. `/giris` is public by the
repository's own contract. **Five published sentences deny it**, and Phase 08 wrote all five in `36c3980`:
`/cerez-politikasi` madde 01 "Herkese açık sayfalarda hiçbir çerez oluşturulmuyor" and madde 03 "üçüncü tarafa
giden **ikinci ve son** istek"; `/gizlilik-politikasi` madde 03 "Site çerez kullanmaz" and madde 05 "gömülü
üçüncü taraf içerik … bulunmaz"; and `/kvkk` madde 04, which C3 just closed at "üç hâl" — the same closed-list
defect class as D3, one third party over. Round 1 had asserted "no undisclosed third-party transfer exists";
QA retracted that in writing, naming the reason — it had measured six routes and none of them was `/giris`.
That is the run's own open-item discipline catching a real miss, and it is why round 1's open list was worth
carrying.

**R2-1 — a legal page unreadable on a phone.** As recorded above, and now with a screenshot
(`r2/shots/cerez-viewport-375.png`). Orchestrator-verified at source that the primitive is innocent.

**R2-3 — pre-existing, carried to Phase 10 (A23).** Not Phase 08's, proven by an empty `git log` over both
files across every phase commit.

**Round 1's open list is closed.** `mas_intro_seen` was the last unlisted local/session key: 26 route
templates, fresh context per route plus one accumulating context, every route writes `mas-technic-theme`, only
`/` adds `mas_intro_seen`, and under `reducedMotion: "reduce"` it is not written at all — matching
`index.html:294-316` claim for claim. So madde 01's completeness sentence is TRUE about local and session
storage; it is the **cookie** half of the same clause that fails. The full `desktop-1280` regression, the seven
remaining viewports, cross-browser smoke and contrast at 375 all ran.

**The RFQ / AI claim is TRUE as written** — the check I asked for before Phase 09 scopes privacy. An RFQ writes
one `rfqs` row via `rfq-rate-limit` and one `cad-uploads` object; the three AI/sync `functions.invoke` sites
live in one admin file that never reads either; `rfqs` and `cad-uploads` appear in none of `finance-ai`,
`ocr-invoice`, `parasut-sync`, `due-date-reminder`; the single scheduled `net.http_post` is a daily empty-body
call and no trigger exists on `rfqs`. **Caveat to carry into Phase 09b:** `finance-ai`'s `documents` array is
caller-supplied and unvalidated, so the guarantee is held by one call site rather than by a constraint.

**Both carried criteria re-measured with round 1's own probes and neither got worse** (teal 16/92/16, shell
primitives 1/0/0/0/1; the CAD error still a white 8 px system-font toast).

**C4 dispatched** to `wt/coder-p08c4` at `a5e4e7d`, packet at `.work/packets/phase-08-C4.md`: R2-1, R2-2, the
`FAMILY_RESOURCES` label-keying bug QA found (keyed by label while its comment claims route, so a rename in
`ia.ts` would drop a published route from the footer to **zero** appearances), the two false comment claims C3
added, and two smaller legal-text tensions. `Login.tsx` is DO_NOT_TOUCH — whether the login form should carry
hCaptcha is Phase 09's security decision, not a disclosure decision. `src/styles/shell.css` is a conditional
grant, reachable only with a measurement that rules out the call-site fix.

**C4 was interrupted once and relaunched — and the run's "resume, never restart" reflex has an exception.** The
user stopped the first C4 agent before it wrote anything; the worktree was clean at `a5e4e7d`, so nothing was
lost. On the user's instruction to continue, `SendMessage` refused the resume: *"Agent … was stopped by the
user and won't be resumed. Treat its work as cancelled."* So the rule this run learned the expensive way —
a dead agent is resumed, never restarted — holds for agents killed by 529s, watchdogs and process exits, but
**not** for an agent stopped by the user: that one is cancelled permanently and a fresh agent must be launched
against the same packet. Persisting packets to `.work/packets/` is what makes that relaunch cost nothing,
which is the second time that habit has paid since A20 identified its absence. One orphaned preview server the
stopped agent left on port 4187 was cleared first, same class as A22.

#### C4 returned PARTIAL and was integrated — three premises falsified, two of them QA's

Three commits cherry-picked as `6981a4d`, `3e2f7dc`, `c79147b`. Scope clean: five files, no `Login.tsx`, no
`shell.css`, no `ia.ts`, no golden touched (`git diff --name-only … -- e2e/__golden__` is empty), only the two
`.tsbuildinfo` artifacts left alone in the working tree. Verified independently on a **fresh build** of the
integrated state: `critical-1280` 15/15.

**My "smallest fix is one class" premise was wrong, and both candidate classes were measured inert.**
`.shell-doc-section-body` computes `display: block`, so `grid-column` on a child does nothing —
`shell-span-read` leaves the figure at 585.88px at every width, and `shell-doc-table` is `margin-top` only. The
real cause is subtler than QA's diagnosis too: `div.shell-stack` is correctly sized (278 / 333 / 348px); the
585.875px is its **implicit grid track**. `.shell-stack` sets `min-width: 0` on itself but **not on its
items**, so `figure.shell-table` kept `min-width: auto` and the single `auto` track could not size below the
figure's min-content — and *this* table's min-content is 585.875px because its key column carries unbreakable
tokens like `mas_pending_cad_upload`. The other seven `ShellSpecTable` figures share the identical wrapper and
survive only because their own min-content happens to fit. Fixed by dropping the grid at the call site, in
`BlogDetail.tsx:199`'s shape — the one call site that already had it right. Measured after: scroll region with
`tabindex="0"`, `role="group"` and an `aria-label`, **24 of 24 cells reachable** at 320/375/390 by real touch
drag and by `End`; 768/1280/1440 identical to before, digit for digit. The better long-term fix
(`.shell-stack > * { min-width: 0 }`) is named in the code comment for whoever owns that call.

**The carried lesson is now written next to the fix.** `documentElement.scrollWidth − clientWidth <= 1`
measured **0** at all three widths while three of four columns were unreachable, because `div.shell-root`
computes `overflow-x: clip` — which, unlike `hidden`, is not programmatically scrollable either. Neither the
reflow guard nor axe can see this class. The Coder names the test that could and where it belongs
(`e2e/landing/shell-cascade-contract.spec.ts`, whose "scrollable regions stay keyboard reachable" lane passed
here for the wrong reason). That is QA's to write.

**R2-2 was bigger than the packet said: eight false sentences, not five.** The Coder found three more — the
page lede, the clause-01 title, and the `metaDescription`. The last is the one worth keeping: a page that
repairs its body and keeps a lying meta description still lies in a search result. hCaptcha is disclosed
following the font-CDN precedent — cookie attributes in the cookie clause, the request in the clause that
enumerates outbound requests, the transfer in the document whose statutory job is transfers. `__cf_bm` is
deliberately **not** a row in madde 02, because that table is titled "Yerel depo kayıtları" and its own note
says these records are not cookies and are readable only by this site's pages; `__cf_bm` is the opposite on
both counts. Orchestrator adversarial scan of all three files: no retention, deletion, training, encryption,
NDA or security-posture claim; the aktarım clause no longer carries a numeral at all, so it cannot go stale
again; no cross-route `#` link.

**QA's rename trigger does not reproduce, and a test written against it would have gone green over a live
bug.** `footerGroups` passed `family("Kabiliyetler")` as its own string literal, so an `ia.ts` rename never
reached the map; all it did was empty the column of its five categories. The edit that actually zeroes the link
is the *next* one — updating the map key to follow the rename, which is what a careful maintainer does. The
defect was real and the fix is right; the reported trigger was not. Now keyed by route, with both sides of the
split decided by one `adoptingColumn()` function rather than two expressions that could disagree.

**QA's "≥1024" boundary was also wrong.** Measured `grid-template-rows`: 768/1024/1100/1180 are all
`150px 150px`, **1181** is `150px`. The switch is `--tl-cols` 12→6 at `@media (max-width:1180px)`
(`design-tokens.css:160`) — not a footer rule at all. Ratios 1180 → 0.6072, 1181 → 0.2515. Also recorded: the
375 rendering is an **accordion**, so closed there is no link pitch at all, and opened the deltas are 40px
inside a panel and 105px across a panel boundary.

**The one thing C4 could not do, and the decision it forced — A24.** `qa-p08-storage-disclosure.spec.ts` test 3
stays red, and the Coder returned PARTIAL rather than reach for any of the three green paths, all of which
would have broken something (removing hCaptcha, editing QA's test, or blocking `hcaptcha.com` — "a test that
lies"). Orchestrator-confirmed on the integrated state: 5 passed, 1 failed, and **both negative controls
pass**, so the checker itself is sound. The test is re-aimed by QA in round 3 per **A24**; the reasoning is
recorded there and it is the Phase 04 shape, not a weakening.

**Still open, carried:** `/cerez-politikasi` madde 04 still says no cookie-preferences window is shown, and
whether a widget that loads before any interaction changes that is a legal determination rather than a
repository fact — recorded in the file header, routed to Phase 09 with hCaptcha itself. And the madde 02 rows
are very tall at ≤390 with blank space in the visible strip; every cell is reachable, so it is a polish
question for QA round 3 to judge, not a defect.

#### QA round 3 — PASS, and the new guard immediately found a second instance of the defect it was written for

Thirteen QA commits cherry-picked as `f9f5442..41fe117`; scope clean (`reports/qa/**` and `e2e/qa-p08-*` only).
1168 passed / 5 failed / 557 skipped. Both C4 blockers verified fixed.

**A24 implemented, and made stronger than I specified.** Test 3 now checks disclosure coverage in **both
halves** — the cookie's name must appear as a `<code>` token in the rendered `/cerez-politikasi` **and** its
host must be a domain the document names or a subdomain of one. Controls: both standalone ones extended
(`_ga@.google-analytics.com` red, `__cf_bm@.evil.example` red — precisely the case the old assertion could not
distinguish from the disclosed one — `.a1b2c3.w.hcaptcha.com` green), plus three inline controls on the live
observed set. The `.w.hcaptcha.com` variance C4 reported reproduced: two entries this run, one in an earlier
probe. 6/6 green, hCaptcha untouched.

**The packet's own predicate for the new guard was inert, and QA said so instead of shipping it.** I specified
`scrollWidth <= clientWidth + 1 || isScrollable(el)`. Measured live against R2-1's *pre-fix* markup that
predicate is **TRUE** — the region fit its own box (584 in 584) while being 627.875px wide inside a 375px
viewport. A guard built to my specification would have passed the defect it was written to catch. QA replaced
it: walk every `<table>` (not a class) on 22 public routes, find the nearest scrolling ancestor, and assert
fits → else the container's own box is in the viewport → else at max scroll the right edge comes inside → else
keyboard-reachable. Controls include R2-1's own numbers kept as a fixture it must reject, and a **live** control
that restores the pre-C4 markup in the real DOM and requires the guard to go red.

**It caught a second instance on its first run — R3-1.** `/hizmetler/cnc-frezeleme`'s
`CNC Frezeleme — malzeme kaydı` figure, `ServiceDetail.tsx:423`, same mechanism, one column instead of three,
`mobile-320` only. PRE-EXISTING and Phase 07's: QA verified that phase's full diff touches neither the page nor
its data.

**Two C4 claims corrected by later measurement.** `End` does nothing — ArrowRight is the scroll key; the region
is still keyboard reachable, so the acceptance holds, but C4's stated method was wrong. And QA could not
demonstrate touch either way and says so plainly: its instrument moves the document but no inner region on any
route, including pre-existing ones, with `touch-action: auto` on all 15 ancestors. Reach at 320/375/390 is
established by keyboard and by geometry, not by a touch measurement anyone has made.

**QA also confirmed C4 against itself:** the tallest-column boundary is 1181, not its own round-2 "≥1024"
(1024 measures `150px 150px`, identical to 768). Table reach 24/24 at all six widths, with 768/1280/1440 proven
unchanged by live A/B rather than by trust. All eight rewritten sentences verified from the DOM; `/kvkk` madde
04 numeral-free with the supplier case inside the enumeration; madde 01's second sentence byte-identical;
`__cf_bm`'s absence from the madde 02 table verified by *reasoning* — `document.cookie` is `""` on `/giris`
while the cookie exists in the jar, and it rides every request to `.hcaptcha.com`, so both of the table note's
properties fail for it. Footer invariant holds under all four rename scenarios, and scenario 3a reproduced
C4's OLD **0× NOWHERE** exactly.

**Polish judged and declined, with a better finding in its place.** The `mas_intro_seen` row is 246.5px with
228.5px blank at ≤390; the only truthful shortening buys 65px of 705, and QA declined that trade on a legal
page this phase spent three rounds teaching to carry its facts. What it raised instead is not this page's:
`.shell-table-scroll` (`shell.css:1299`) has **no affordance that it scrolls sideways** — no fade, no shadow,
no hint, overlay scrollbars hidden at rest — across all 16 tables on 8 routes. C4 made the table reachable;
nothing yet makes it discoverable. **Carried to Phase 10 or 12.**

#### C5 dispatched — I am not closing the phase with the guard red

QA returned PASS and handed R3-1 up rather than hiding it. I am not accepting that close as it stands, and the
reason is consistency: **A24 rejected leaving a test permanently red**, and it would be incoherent to invoke
that reasoning to re-aim one test and then close the phase with another one red — one this phase's own QA just
wrote. The fix is the one C4 already proved, applied to one more call site, and QA states the guard goes green
"with no edit to the test".

C5 is deliberately small — two items, at `wt/coder-p08c5`, packet
`.work/packets/phase-08-C5.md`:

1. **R3-1.** Four call sites share the wrapper shape (`ServiceDetail.tsx:423` and `:512`,
   `KabiliyetProfilDetay.tsx:157`, `Malzemeler.tsx:177`); only `:423` fails today and the other three survive
   by accident of content width, which is the same accident C4 described. The Coder must **measure** the choice
   between the call-site fix and the systemic `.shell-stack > * { min-width: 0 }` its own C4 comment named as
   better, and default to the narrow one in a closing round unless the blast-radius measurement clears the
   shared stylesheet.
2. **A third closed count, in a sentence C4 itself wrote.** `/cerez-politikasi` madde 03 now says "Tarayıcınızın
   bu sitenin dışına istek gönderdiği **üç yer** var. **Üçü de burada.**" QA measured that true on plain page
   load only. Orchestrator-verified at source why that is not enough:
   `src/integrations/supabase/client.ts:11` calls `createClient` with `VITE_SUPABASE_URL` **in the browser**,
   and `/giris` and `/teklif-al` — both public — call Supabase from the browser on interaction. The sentence is
   false the moment a reader does what the site asks. This is the third instance of the defect class this phase
   has now corrected twice, and the second one we ourselves introduced while fixing the first; `/kvkk` madde 04
   shows the shape that cannot go stale, because C4 removed the numeral there entirely.

#### C5 returned and was integrated — my scope was wrong on all three counts

Three commits picked as `5003c66`, `a727e54`, `27de482`. Net production change is **two added class names**;
everything else is comments and legal copy. Verified independently on a fresh build of the integrated state:
`qa-p08-scroll-region-reach` **6/6 at `mobile-320`**.

**R3-1 was not one call site, one route and one viewport, as my packet claimed. It was two call sites, ten
routes, three viewports, 14 instances.** `ServiceDetail.tsx:423` fails on seven service routes at 320 —
`cnc-tornalama` (358) and `malzeme-kutuphanesi` (351.844) also at 375 and 390 — and
`KabiliyetProfilDetay.tsx:157` fails on **all three** capability profiles (325.172 / 314.453 / 327.281 against
a 278px column). The fix is `grid-cols-[minmax(0,1fr)]`, the same declaration `shell.css:1553` already uses for
`.shell-form-row`. `ServiceDetail.tsx:512` and `Malzemeler.tsx:177` measured track == wrapper at every width
and were left alone with comments. After: all 106 `shell-span-full shell-stack` instances over 244
route × viewport records fit their column, 0 overflowing.

**The systemic fix is safe and unavailable, which are different things.** C5 built
`.shell-stack > * { min-width: 0 }` first and measured it over 76 routes × 7 viewports = 375 records: it moved
geometry only inside the defective figures, and **nothing** moved at 768/844/1280/1440 on any route or on any
of the 14 golden surfaces at any golden width. I was not too cautious about blast radius. But QA's own **live
control** (`qa-p08-scroll-region-reach.spec.ts:535`) restores the pre-C4 markup in the real DOM and requires
the checker to report exactly one problem — and the class fix makes that defect *impossible to express*, so the
control goes green and the test fails. A live control that reconstructs a defect at the root forbids fixing it
at the root. C5 chose "green unedited" over a tidier stylesheet, which was right under its instructions, and
left the measurement in both commit messages for whoever re-aims that control. **QA round 4 owns the ruling.**

**A dead sentinel, in a gate written one round ago.** `qa-p08-scroll-region-reach.spec.ts:129` walks
`/kabiliyet-profilleri/ince-cidarli-aluminyum-govde` and `:134` walks `/endustriyel/havacilik` — **neither is a
slug**. Orchestrator-verified: the real profiles are `ince-cidarli-govde`, `titanyum-baglanti-parcasi`,
`hassas-mil` (`src/content/caseStudies.ts:115,138,161`) and the real sector is `havacilik-uzay`
(`servicePages.ts:2434`). So the guard walks a 404 twice, and `KabiliyetProfilDetay.tsx:157` had **no watcher
at all** — C5 found those three instances by direct measurement, not by the gate. This is the same class as
`d3c8a6c`, "the whole-page axe lane had a dead sentinel, and it was hiding the clock", one round after this run
paid for it. QA round 4's first job, and the anti-404 control matters more than the route fix.

**C5 corrected my proposed wording before it became the fourth instance of the defect it was fixing.** I
suggested scoping madde 03 to "a page load". C5 refused: the client is configured `persistSession: true` +
`autoRefreshToken: true`, so a signed-in reader's browser reaches that host on a plain load too. The clause now
names its triggers positively and carries no count at all. `/gizlilik-politikasi` madde 05's "tek üçüncü taraf
bileşeni" was checked and left: it counts **embedded components**, not request destinations — no `<iframe>`
outside hCaptcha's own, no third-party script tag, and `fetch` embeds nothing — so it survives exactly the
action that falsified "üç yer".

**One content item handed up rather than edited out of scope (A26).**

#### QA round 4 — PASS. Phase 08 closes.

Six QA commits picked as `a9291bd..0b3ed2a`; scope clean. Orchestrator's closing verification on the
integration branch, fresh build: `qa-p08-scroll-region-reach` + `qa-p08-storage-disclosure` +
`qa-p08-waveb-contract` at `mobile-320` → **24 passed, 0 failed**.

**The dead sentinel is closed, and the fix is better than the one I asked for.** Both walked paths confirmed
dead **by measurement** rather than by reading the data — they render "Bu profil kaydı bulunamadı" and "Bu
sayfa kaydı bulunamadı" with 0 tables. The mechanism is worth keeping: `TABLE_CENSUS` is a floor keyed **by
route**, and it listed neither path, so it expected 0 tables and got 0. The sentinel was dead in exactly the
way an empty scan is green. Corrected to the real slugs plus the other two capability profiles: the walk now
sees **22 tables over 24 routes** (was 16 over 22), and finds **no new red** — C5 missed nothing.

**The anti-404 control tested the naive alternative instead of assuming it.** `wrongSurfaces()` runs before any
table assertion: a route must declare a surface, its `<h1>` must not be one of the app's four not-found
headings, and `PUBLIC_ROUTES` and `ROUTE_SURFACE` are asserted equal in both directions. A length floor —
the obvious cheap guard — **would not have worked, and the test proves it**: the 404 bodies are 667 / 768 / 792
characters, *longer* than `/reset-password` (490), `/sifremi-unuttum` (483), `/teklif-al` (493) and `/giris`
(629). Its live control drives the app to both historical dead paths and a nonsense path and measures each
**under the identity of a walked route** — the exact substitution the defect performed.

**C5's fourteen reproduced exactly**, by removing the fix's effect in the live DOM rather than by trusting the
report: same set, same numbers, all of the R2-1 "own box" shape. As shipped: zero problems at every width.

**QA overturned its own round-3 control, and named the error as its own.** Ruling: re-aim it, keep it live —
and the class fix is now available. The reasoning is the best sentence of the round: the control *had two jobs
and only one is a control's*. Regression-catching belongs to the walk (24 routes, 3 lanes); this test only
proves the checker is not hollow. Sourcing its defect from **production being broken** turned repairing
production into a failure — a **defect ratchet**. QA calls that its own round-3 error, not C5's in round 5. The
re-aimed control stays live but builds the geometry inline on a class-less wrapper so no stylesheet can reach
it, asserts the defect's *shape* (container right edge past the viewport, `forcedScrollLeft` exactly 0) rather
than a count, and ends by injecting `.shell-stack > * { min-width: 0 }` and requiring itself to **still fire**.
Strictly harder to hollow than before, and the systemic fix becomes a clean later-phase cleanup.

**A26 adjudicated: contestable, not false — with my premise corrected.** See A26; QA measured typed free text
reaching `supabase.co` verbatim, which my wording had denied. The reading survives on a custodial predicate,
and no reader is deprived of the fact. Carried by name to Phase 09.

**Goldens unmoved, confirmed three ways:** four visual projects green, `git diff 9dc1353..27de482 --
e2e/__golden__` empty, `git status` clean after QA's own runs. 116 baselines, none under 2 kB.

### Phase 08 closed — PASS

Four correction rounds and four QA rounds. What the phase actually cost and bought:

- **Two blocking gates** (footer proportion, radius citation) and **four content-truth defects** fixed in C3.
- **Two more blocking defects** C3 was never asked about — a legal table no phone could read, and eight
  published sentences denying a cookie that had been shipping — found by QA round 2 **because round 1 wrote
  down what it had not verified** and then went back for it.
- **Three new permanent gates** that did not exist before: storage-disclosure coverage, scroll-region reach,
  and the anti-404 surface control.
- **Nine falsified premises**, spread across every role: two of mine in C3, my footer row count, my
  one-class-fix claim, my R3-1 scope, my "page load" wording, my A26 premise; QA's rename trigger, its ≥1024
  boundary, its own round-1 third-party conclusion, and its own round-3 control.

**Carried out of the phase, all recorded, none silent:** R2-3 → Phase 10 (A23); `.shell-table-scroll` has no
affordance that it scrolls at all across 16 tables on 8 routes → Phase 10/12; `Malzemeler.tsx:177`'s
misattributed comment → Phase 10 (A27); `/gizlilik-politikasi` madde 02 → Phase 09 (A26); hCaptcha's presence
on `/giris` and the cookie-preferences question → Phase 09; `finance-ai`'s unvalidated `documents` array →
Phase 09b; the three-suite font policy → Phase 12; criteria 3 and 5 → Phase 09 (A20, A21).

---

### Phase 09a — RFQ/CAD ARCHITECTURE, FORM BEHAVIOUR AND THE SURFACE ITSELF — IN_PROGRESS

**The user closed A07 themselves.** Between turns, `3a89e7c` committed the eleven files that had been
deliberately uncommitted all run — `.claude/agents/mas-coder.md`, the nine skill files and `tsconfig.json` —
with the message *"commit the harness permission escalation deliberately, not silently"*. A07 recorded that
this was the user's decision to make and not the run's; it is now made. The integration branch is unaffected:
`dc19d5a` is an ancestor of `3a89e7c`, the working tree is clean apart from the `.references/react-bits`
submodule that has been dirty since the run began, and every Phase 08 artefact is present — six packets under
`.work/packets/`, the PASS row, and all three `qa-p08-*` specs.

**The `pdh-wt/*` worktrees were pruned in the same window, and nothing was lost by it.** `git worktree list`
now shows only the main checkout, and `wt/coder-p08c5` and `wt/qa-p08r4` are gone as refs — but both had
already been cherry-picked into the integration branch, so the content is on the branch and reachable. This is
worth recording precisely because the run's standing rule is never to delete a worktree: **the rule held, and
this was not the run deleting one.** Phase 09a therefore starts in a newly created
`C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, provisioned the A04/A18 way — `node_modules` junction plus a
copied, uncommitted `.env`.

**The split, per A21 and the run brief.** `IMPLEMENTATION.md` §7 PHASE 09 has four task blocks. **09a** takes
Architecture/performance and Form behaviour, plus the two Phase 08 items that live inside `TeklifAl.tsx` and
would otherwise mean editing 1540 lines twice: **A20** (wire `ShellNotice tone="error"` — built by `7dcfb65`,
`role="alert"`, still **zero** usages in `src/` — to the CAD parse error and the form error) and **A21**'s
`/teklif-al` + `/cad-dashboard` design migration. **09b** takes Privacy/business policy, Security, the three
auth routes, and the carried privacy items: **A26** (madde 02's "tek yer"), hCaptcha's presence on `/giris` and
the cookie-preferences question, `finance-ai`'s unvalidated `documents` array, `ChatBot.tsx`'s dead
consent-prompt filter (fix keyed on state, never on a string literal), and `ScrollToTop.tsx`'s fragment
override.

**Starting facts handed to the Coder, measured rather than assumed:** the route is *already* lazy
(`App.tsx:66`) but the 3D stack is **static** at `TeklifAl.tsx:3-7`, so opening `/teklif-al` pulls the whole
viewer before anyone asks for one — while `occt-import-js` is already dynamic at `:382`, which is the pattern
to copy and it is in the same file. `rfq-rate-limit` already exists (164 lines), so the spam/rate-limit task
needs no invention. The three AI/sync edge functions are invoked only from `admin/FinanceDocsView.tsx`, which
is what makes the RFQ/AI claim true, and 09a must not disturb it.

**The packet carries an explicit permission I have not given before:** if the decomposition lands green but the
design migration is barely started, commit what is green and return `PARTIAL`. Phase 08 cost four correction
rounds partly because packets were large and returns were all-or-nothing; a clean partial is worth more than an
unreviewable whole.

#### STOP — 09a wrote to the production database. Run paused for a user decision.

`IMPLEMENTATION.md` §1.4 makes a production database mutation a **stop condition**. One occurred. The Coder
disclosed it unprompted and gave search keys; I verified the extent read-only through the Supabase MCP against
the project in `.env` (`zdqiujpeewtyhtcqhdcj`), and **the extent is larger than the Coder estimated** — it said
"at most two of each".

**Actually written, all on 2026-09-06:**

| table | id / name | created |
|---|---|---|
| `public.rfqs` | `PROBE-DO-NOT-INSERT` (`email='not-an-email'`, rest null) | 00:13:02Z |
| `public.rfqs` | `RFQ-2026-P1X2WWXZ` — `QA Probe` / `QA Muhendislik` / `qa@example.com` | 00:06:16Z |
| `public.rfqs` | `RFQ-2026-P1VM3KET` — same | 00:05:07Z |
| `public.rfqs` | `RFQ-2026-P1UNKFR4` — same | 00:04:24Z |
| `storage.objects` `cad-uploads` | `anonymous/RFQ-2026-P1X2WWXZ/1788653175327-qa-part.stl` | 00:06:15Z |
| `storage.objects` `cad-uploads` | `anonymous/RFQ-2026-P1VM3KET/1788653106897-qa-part.stl` | 00:05:07Z |
| `storage.objects` `cad-uploads` | `anonymous/RFQ-2026-P1UIC7X6/1788653055355-qa-part.stl` | 00:04:16Z |

**Four rows and three objects**, not two and two, and the object under `P1UIC7X6` has no matching row, so the
sets only partly overlap. The older `rfqs` rows (`AeroBracket V2` / `client@precision.com`, Feb–Mar 2026) are
pre-existing seed data, not this run's, and are not mine to touch or judge.

**Nothing has been deleted.** Removing them is itself a production mutation and needs the user's explicit
authorisation; the anon role has no DELETE policy, so it would require service-role access. Recorded here so
the record survives regardless of what is decided.

**How it happened, and it is not simple carelessness.** The Coder's premise was the edge-function source in
this repository, which rejects a malformed e-mail with 400 *before* the insert. It probed with a duplicate
primary key precisely so that nothing could be written. The deployed function does not behave like the source,
so the write it had engineered to be impossible happened anyway. The packet is also at fault: it told the Coder
to "verify the real submission pipeline end to end locally" and said `.env` is present so credentials permit
it, without saying that the only configured project **is** production. That sentence is mine.

**The far more serious finding is what the probe revealed.** `git log` over
`supabase/functions/rfq-rate-limit/index.ts` has **one commit, the initial import** — the source has never been
deployed. Probed against the deployed function, it reached the insert for a missing e-mail, a malformed
e-mail, a one-character customer, a missing company and a `.txt` in `files`; only the `id` guard fires. Fifteen
requests inside a minute from one address produced **no 429**. So on production today, anyone can write
unvalidated rows to `rfqs` and objects to `cad-uploads` anonymously and unthrottled. That is a live exposure
this run found by accident, and it belongs to 09b — but it is the user's to know now, not at 09b's close.

Compounding it: `TeklifAl.tsx:545`'s `if (fnData?.error)` was **dead code**, so even a correctly deployed rate
limiter could never have shown a reader its message.

**09a's own work is green and scope-clean, and is being held rather than integrated** pending the user's
decision: `TeklifAl.tsx` 1540 → 418 lines across twelve modules; route static closure 1629.48 kB → 816.79 kB
(**−812.7 kB, −49.9 %**) with the WebGL stack behind an explicit request; teal 16 → 0, Radix 3 → 0, shell
primitives 1 → 88 on `/teklif-al` and `/cad-dashboard`; both A20 error states branded and reached, not
inferred; four `shell-footer-rfq` goldens rebanked and adjudicated at the DOM rather than the pixels. It also
removed a content-truth defect nobody had flagged — the delivery selector was still publishing "10-12 Gün" and
"3-5 Gün" production lead times in four places, the same class Phase 08 stripped from this page's sidebar.

**User decision, 2026-09-06.** Asked three questions; **one was answered: integrate 09a.** Done — cherry-picked
as `96015a5`, `fa82de2`, `2f6bb3c`, tree matching the Coder's, working tree clean. The other two are **still
open and I am defaulting to the safe side of both**: nothing has been deleted, and nothing has been deployed.

**QA 09a dispatched with a prohibition I have not written before.** The user chose plain "integrate and send to
QA as normal" over the variant that spelled out an offline constraint — but QA writing to production was never
"normal": §3.3 makes production read-only for QA, and no part of this run ever authorised a production write.
The 09a write was an accident, not a precedent. So the QA packet forbids submitting the RFQ form against the
live project even once, by any route; requires any check that needs the submit path to intercept and abort
every non-loopback request and **prove the interception holds before the click**, the way round 4 measured the
`/iletisim` payload without writing it; forbids touching the four rows and three objects, which are evidence of
an unresolved decision; and forbids re-establishing the deployed-vs-source divergence by probing, since it is
already established and it cost four rows. Its return format carries an `UNVERIFIABLE` field, and the packet
says plainly that entries there are expected and are worth more than a check run by writing to the customer's
database.

#### QA 09a — FAIL on one defect, and every number 09a claimed is true

Three QA commits integrated as `b8182da..3604194`; scope clean. 353 tests passed.

**The prohibition held, and QA proved it held rather than asserting it.** Nothing was submitted, invoked,
uploaded or inserted. Its seal never forwards an off-origin request, and it fires a **live canary to
example.com to prove the interception works before touching any control** — the discipline I asked for, done
better than I specified. The `UNVERIFIABLE` field came back with **seven** honest entries, all of them things
that genuinely need a production write: whether the deployed limiter rejects a malformed e-mail (U1), whether
the 429 branch is reachable in production (U2), whether a row is written with the fields
`useRfqSubmission.ts:267-279` sends (U3), whether the object lands at `createCadStoragePath(...)` (U4), the two
timeout constants under real network conditions (U5), the notification path end to end (U6, a `supabase/**`
read that belongs to 09b), and the visual-375 font flake (U7).

**Every load-bearing number 09a reported reproduced.** QA built both endpoints itself — `3a89e7c` into a
scratch `outDir`, `2f6bb3c` into `dist/` — with a static-edge-only walker and `hoistTransitiveImports:false`:
static closure **1629.48 kB → 816.79 kB**, matching the Coder to the hundredth of a kB. And the trap is worse
than the packet warned: the route-chunk-only figure moves 41.91 → 28.68 kB, so measuring that alone understates
the win **61×**, not 20×. Runtime: no heavy chunk on load, none after choosing a file, `CadStage` + `cssVar`
only after the explicit request, and OCCT still absent for an STL because it is a *second* dynamic boundary
inside the first. Design 0/0/88 on both routes. Both error states reached without a submission. Focus lands on
the first invalid field in **document** order, not object-key order. Thirteen submit attempts → one invocation.
Lead times gone from the rendered DOM at all four steps, and the confirmation reference proved server-echoed
**both ways** — a sealed response echoing `RFQ-2026-QASEAL` puts that value on screen, and a 2xx with no
`rfq.id` yields no reference row at all.

**The one defect is 09a's own, and it is the kind only a rendered check finds.** `shell.css:1891` colours
`.shell-notice[data-tone="error"] .shell-notice-label` with `--tl-stamp`, and `design-tokens.css:111` defines
that as a single fixed `#8a4030` with no surface variant. On the graphite ground 09a moved `/teklif-al` onto,
it measures **2.69:1 at 9px/600** against 4.5:1 — axe serious, at 1280 and 375. On paper the identical markup
measures 6.08:1, so the token was fine until this page used it. A20 recorded `tone="error"` had **zero** usages
in `src/`; all five it now has are 09a's, and the upload-, chunk- and parse-failure notices carry the same
label. Nothing caught it because `shell-golden.spec.ts` deliberately does not photograph page bodies and
`shared-shell-accessibility.spec.ts` audits `/teklif-al` only in its default state, where no notice exists.

**A second content-truth item QA found while checking the first.** `servicePages.ts:611,2197,2242` still
publish "3-5 gün" as a production/DFM turnaround. Orchestrator-verified: **`USER_INPUTS.md` has no lead-time,
turnaround or delivery field at all**, so these are unverifiable public claims with no authority, and the run's
standing instruction to remove or neutralise such a claim is not phase-scoped. Folded into the correction
rather than carried. `scripts/claims-gate.mjs` **passes** with them in the tree, so it has no turnaround rule —
the same shape as round 1's finding that it has no revenue rule, and a gate-coverage item for a later phase.

**09a-C1 dispatched** to `wt/coder-p09a1` at `3604194`, packet `.work/packets/phase-09a-C1.md`, carrying the
production-write prohibition forward verbatim.

#### 09a-C1 integrated — and the Coder falsified both fixes I recommended

Two commits picked as `3661e0c`, `0780ac4`. Scope clean, no golden moved, nothing touched the network: both
submit-path probes seal the context, `abort`/`fulfill` every off-origin request, never call `continue()`, and
assert a **live canary blocked before any control is touched** — ledger `fulfilled in-browser: 2, forwarded to
backend: 0`.

**Neither shape QA and I proposed survived measurement.** Both are root-scoped, and one number kills both: a
`[data-shell-surface="graphite"]` override of `--tl-stamp` leaves `.tl-band[data-band-tone="paper"]` — a
*descendant* of the graphite root — inheriting the graphite red, which measures **2.23:1 on paper**. It trades
one serious violation for another. `shell.css:961-970` already documents that exact trap for the `--sf-*`
roles, and neither of us read it. The fix is a new ground-bound role `--sf-danger`, following the
`--tl-bronze-light` / `--tl-bronze-ink` precedent Phase 04 introduced for this same two-ground problem. The
new `--tl-stamp-light: #e18570` was chosen at L=66% and not higher for a reason worth keeping: above that the
red desaturates to **ΔE 14** from the colour the *caution* label beside it uses, so error and caution stop
being tellable apart at 9px; at 66% it is ΔE 34. All five notice sites now measure **7.33:1** at 1280 and 375,
up from 2.69:1, and the `border-left` moved with them so 1.4.11's 3:1 is cleared too. Paper proven unchanged at
6.93:1, and the case a root override would have broken measures 6.07:1.

One deliberate step beyond the packet, reported rather than smuggled: `.shell-form-error`'s rule moved to
`--sf-danger` as well, because `shell.css:1884` *promises* field-level and block-level errors are the same red
— leaving it on `--tl-stamp` would have made that promise true only on paper, and it was at 2.69:1 on graphite
on `/teklif-al` **and** `/iletisim`.

#### C2 dispatched — I under-scoped C1 twice, and one of my "verified" facts was false

**The Coder was right in C1's KNOWN_RISKS #1.** Neutralising three cells left **one cell of a five-cell
duration column** reading "Teklifle birlikte" beside four neighbours still publishing `1-3 gün`, `1-2 gün`,
`2-4 hafta`, `1-3 hafta`. Locally incoherent, and arguably worse than what it replaced.

**And I have to correct a fact I asserted to the user and wrote into a packet as Orchestrator-verified.** I
said `USER_INPUTS.md` has no lead-time, turnaround or delivery field **at all**. That is false. My grep used
Turkish terms; the fields are English-named — `QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days` (§88),
`ON_TIME_DELIVERY_INTERNAL: 95%` (§94, `PUBLIC_IF_VERIFIED_AND_STRATEGIC`), `QUOTE_SLA: 1-3 Days` (§168). The
C1 fix still stands, because a *production* turnaround is not a *quote-response* SLA, but it was made for a
reason that was partly wrong and the record has to say so. `src/content/claims.ts:125-132` had it right all
along: it publishes `QUOTE_RESPONSE_TIME` as "1-3 iş günü" **citing both fields**. That is the model, and it
is now the packet's rule.

**The sweep is bigger and worse than a services tidy-up.** 62 matching lines in `servicePages.ts`, 4 in
`chatFaqData.ts`, 1 in `claims.ts` (the authorised one). The chatbot's are the most serious in the tree,
because `chatFaqData` is bundled and answered locally, so a visitor is told them as company policy: `:38` and
`:48` publish production turnarounds, **`:96` promises free return/exchange within 7 working days — a warranty
commitment** — and **`:119` publishes payment and credit terms ("%50 ön ödeme", "açık hesap ve 30-60 gün
vade")**. Nothing in `USER_INPUTS.md` authorises any of them. `servicePages.ts:2933`'s
`metaTitle: "Hızlı Prototip Üretimi | 3-5 İş Günü | …"` ships the claim into search results.

**Two orchestrator rulings in the packet.** A commercial policy claim cannot be neutralised into "with the
quote" the way a duration can — the reader is being told a policy, not a number — so payment terms, credit and
the return guarantee are **removed**, not softened. And `/hizmetler/hizli-prototip` **keeps its route**:
"hızlı prototip" is positioning, which §1.3 permits, while the unverifiable number is what it forbids; the page
argues from process and capability instead. If that leaves it with nothing to say, that is a finding, not a
licence to invent.

C1 forbade adding a claims-gate rule; **C2 requires three** — production/delivery durations, payment/credit
terms, and return/warranty guarantees — each with a positive control and each proven not to fire on the
authorised SLA. The gate passing with every one of these in the tree is the same coverage hole as round 1's
finding that it has no revenue rule, and it is now earned rather than speculative.

#### Phase 09b — scoping notes, gathered read-only while C2 runs

Recorded now so the packet is quick when 09a closes, and because two of these are corrections.

**The auth routes are 528 lines, not three unknowns.** `Login.tsx` 273, `ForgotPassword.tsx` 105,
`ResetPassword.tsx` 150. **`SifremiUnuttum.tsx` does not exist** — the route `/sifremi-unuttum` is served by
`ForgotPassword.tsx` (`App.tsx:211`). Every DO_NOT_TOUCH list I have written this phase named the Turkish
filename, so it protected a file that is not there; no harm followed, because the real file was never in a
WRITE_ALLOWLIST either, but 09b's packet must name the real one.

**`ChatBot.tsx`'s dead filter is exactly as QA described and the state-keyed fix is available.**
`pendingAiPrompt` is state at `:179`; `:240` filters the outgoing history against a **string literal** that
`:273` no longer produces. Because the state is right there, the fix QA prescribed — drop the trailing
assistant message when `pendingAiPrompt` is set — needs no new mechanism. QA's corollary stands and belongs in
the packet: the defect is currently *masked* by the legal texts' broad "o ana kadarki yazışma" wording, so
narrowing that clause later would make it false the same day with no test watching.

**`ScrollToTop.tsx` is 20 lines and already holds what it needs.** It calls `useLocation()` but destructures
only `pathname`, so `hash` is one word away. The override QA measured is the `requestAnimationFrame(() =>
window.scrollTo(0, 0))` at the end, plus the Lenis branch above it.

**The security surface, measured:** `src/utils/cadUpload.ts` never calls `getPublicUrl` or `createSignedUrl` —
it uploads by XHR with `x-upsert: false` — so no public URL is minted client-side. Whether the **bucket** is
public is a Supabase-side question and belongs to 09b's read-only audit.

**And a finding that shapes what 09b can honestly deliver.** §7 PHASE 09 requires auditing CSP, referrer
policy, content-type options, permissions policy, frame policy and HSTS. Measured: **no hosting header
configuration exists anywhere** — no `vercel.json`, `netlify.toml`, `public/_headers`,
`staticwebapp.config.json`, `firebase.json` or `.htaccess` — and `index.html` carries **no** CSP, referrer or
content-type meta either. This is the same shape as Phase 08's real-HTTP-404 finding, and the honest outcome is
the same: the audit will report that none of these headers is set and that most cannot be set from this
repository at all. What *can* be done from here is the `<meta>`-expressible subset. 09b must not claim a header
posture it cannot produce, and must not invent a hosting config on a guess — Phase 08 established that adding
one blind breaks every deep route.

**Still open, and blocking nothing else:** (1) whether to delete the four `rfqs` rows and three `cad-uploads`
objects — a production mutation only the user can authorise, and the anon role has no DELETE policy so it needs
service-role access; (2) whether the undeployed rate limiter is fixed now by deploying the repo's function —
`USER_INPUTS.md` §M sets `ALLOW_PRODUCTION_DEPLOY: NO`, so I cannot close that exposure — or documented as a
09b finding and left live until the user acts.

#### C2 lost its agent one commit in — and the worktree rule paid for itself again

The C2 Coder's process was killed after **one** commit. `ListAgents` shows no live subagent; the worktree
`pdh-wt/coder-p09a` (`wt/coder-p09a2`) is clean at `60238c8`. Because the standing rule is never to remove a
stopped agent's worktree, nothing was lost — the same rule that saved 45 minutes of QA probes in Phase 08, and
the inverse of the Phase 07 loss where removing one destroyed the work. **C2 is being resumed, not restarted.**

**What `60238c8` actually contains, reviewed at the source rather than taken from a summary.** The four
`chatFaqData.ts` answers the packet named, **plus three the Coder found itself**: `:114` credit terms, `:131`
working hours carrying a weekend-production commitment — Phase 07 removed the identical block from `/iletisim`
for want of authority — and `:166` `"MAS Technic, İSTANBUL merkezli"`, which contradicted §A `PUBLIC_CITY:
İzmir`, the footer, the JSON-LD, `/iletisim` **and this same file's own address answer twenty lines earlier**
(`Çiğli/İzmir`). That value now reads `${PUBLIC_CITY}` from the ledger. `claims.ts` gains `PRODUCTION_LEAD_TIME`
(withheld), `LEAD_TIME_STATEMENT` and `LEAD_TIME_SHORT`; `caseStudies.ts` reads the statement from there instead
of holding its own literal. `QUOTE_RESPONSE_TIME` untouched.

The Coder's own reasoning for the two commercial-policy answers is better than my packet's and is worth
keeping: every question **stays**, because `findBestFaqMatch` has a 0.6 floor and a commercially loaded question
left unanswered does not fall silent — it lands on a wrong neighbour. That is the failure Phase 06 hit with
"garanti veriyor musunuz" at 0.67. Deleting the entry would have been worse than the claim.

**Still untouched, measured by me in the worktree:** `servicePages.ts` — **62 hits, none addressed**;
`scripts/claims-gate.mjs` — 1459 lines, **no rule added**; no verification run at all.

**My inventory regex was wrong for the third time this phase.** It matched `gün` and `hafta` only, so it missed
`servicePages.ts:774,806,824`'s `24-72 saat` delivery windows outright. Worse, `:824` publishes **"Ekspres
hizmet ile aynı gün teslimat da mümkündür"** — a delivery commitment and a service tier with **no digits in
them at all**, which no numeric pattern could ever have caught. The resume packet therefore tells the Coder to
build the inventory from the claim rather than from my regex. Two files the original packet never named also
carry matches: `rfq-model.ts` (`:82` is the authorised wording, verify and leave) and `RfqSubmitStep.tsx`
(unexamined).

**A gate-coverage finding that indicts the gate, not the copy.** `scripts/claims-gate.mjs:967`'s `wrong-city`
rule matches `/geo\.placename[^\n]*İstanbul/gi` — so `chatFaqData.ts:166`'s wrong-city claim **in published
prose** sailed straight past the rule whose entire purpose is wrong-city claims. Same shape as the gate having
no revenue rule and no turnaround rule: the gate guards the structured field and not the sentence. Widening it,
with a control, is in the resume packet.

**Also corrected in the resume packet:** the DO_NOT_TOUCH list now names `ForgotPassword.tsx`. Every list I
wrote this phase said `SifremiUnuttum.tsx`, which does not exist.

`09a-C2r` dispatched to the same worktree, packet `.work/packets/phase-09a-C2-resume.md`, `PARTIAL` explicitly
permitted and "commit after every step" made a packet rule rather than advice.

#### C2 integrated — the file I called "62 hits" was eleven pages, and two of them were in no list I wrote

Four commits cherry-picked as `bc4ed86`, `0a829d0`, `f757d3d`, `dae15bb`. The integration tree is byte-identical
to the Coder's on every production and test path; the only difference is `PROGRESS.md` and the two packets,
which are mine. Working tree clean apart from the `.references/react-bits` submodule that has been dirty all
run.

**Scope verified by diff, not by summary.** `git diff --name-only 0780ac4..dae15bb` is exactly seven paths:
`servicePages.ts`, `chatFaqData.ts`, `claims.ts`, `caseStudies.ts`, `claims-gate.mjs`, and two `visual-375`
PNGs. No spec edited, no `supabase/**` touched, no DO_NOT_TOUCH path touched, and no network write of any
kind — the RFQ form was never submitted, no edge function invoked, no object uploaded, no row inserted.

**The gate, run by me, in both directions.** On the tree: **PASS, 0 violations, 29 rules, 178 controls, 0
control failures.** Against `0780ac4`'s two data files, restored into the worktree and then restored back:
**FAIL, 75 violations** — 69 lead-time, 4 payment, 1 wrong-city, 1 returns. That is the adversarial half
proved end to end rather than by unit control, and it is the first time this run has had a gate rule whose
positive controls are the exact strings the same commit removed.

Every residual regex hit left in `servicePages.ts` — seven numeric, two worded — is inside a **comment**. The
gate blanks comments by design, which is also a known risk the Coder recorded: if anyone ever makes it scan
comments, four files fail at once because the in-file explanations quote the strings they removed.

**My "62 hits in one file" was the wrong unit, and it hid two whole pages.** Built from the claim instead of
the regex it is **eleven pages**, and `/kabiliyetler/malzeme-kutuphanesi` and
`/kabiliyetler/tasarim-rehberi-dfm` were in neither list I wrote. `malzeme-kutuphanesi` was the worse: a
six-row numeric procurement matrix *plus* an "Acil Tedarik" express column — while `/kabiliyetler/tedarik-zinciri`,
one page away, grades the same materials qualitatively and says the real figure comes with the quote. Two
pages answering the buyer's same question two different ways, one of them with numbers nobody set.

**Four whole duration columns removed rather than filled with five identical cells.** Enjeksiyon "Teslimat
Süresi" (5), silikon "Teslimat" (5, the column C1 half-fixed and the reason C2 existed), dusuk-hacimli
"Teslimat" (6), and malzeme's two-column "Tedarik Süresi ve Sertifika Matrisi" (6+6), retitled and retabulated
to say what that page's own FAQ already said. A column of five identical "Teklifle birlikte" cells carries no
information; the Coder's judgement here is better than the instruction it was given. `proje-yonetimi`'s "Süre"
column now has **exactly one cell carrying a number** — `1-3 iş günü`, read from `QUOTE_RESPONSE_TIME` — which
is the only duration on this site §D and §J authorise.

**Two scope expansions, flagged rather than smuggled, both adjudicated ACCEPTED and both verified by me at the
source.**

- `/hizmetler/cnc-tornalama` published *"Bar feeder ile gece-gündüz kesintisiz seri üretim"* twice. That is a
  shift-pattern commitment, and it is the same claim Phase 06 removed from the machine-park page as `24/7` —
  the comment recording that removal is still at `servicePages.ts:1499`, twelve hundred lines from the copy
  that survived. Neutralised to the mechanism: a bar feeder lets a long batch run without operator
  intervention, which is true and claims nothing about shifts. It also touches §0
  `DO_NOT_EMPHASIZE_COMPANY_SCALE`, since a shift pattern is a capacity statement.
- `/endustriyel/kucuk-seri` published `%15-25` and `%25-35 hacim indirimi` as spec rows. Not a duration — a
  **price policy**, and its own page FAQ four fields below already said tiered pricing comes with the quote.
  Now "Kademeli fiyatlandırma teklifte".

Both are removals of unverifiable public claims, which the run brief directs rather than merely permits.

**Two more corrections to me, on top of the regex.** My `rfq-model.ts:82` and `RfqSubmitStep.tsx` line
references were both wrong: the regex hit `:31` and `:33`, and **both are code comments** quoting strings a
previous phase already deleted. What `RfqSubmitStep.tsx` actually renders reads `QUOTE_RESPONSE_TIME` from the
ledger in both places. Neither file needed touching; both are now negative controls in the gate.

**The gate work is the durable half.** Two new rules — `unverified-production-lead-time` (three detectors:
prose, bare cell, and SEO string, because `metaTitle`/`metaDescription` make the field name the context) and
`payment-or-credit-terms`, anchored to the term being *granted* rather than to the topic, so "Peşin ödeme
zorunlu mu?" and its honest answer stay silent and are controls. Two widened — `unconditional-guarantee`,
which caught "garanti" and "güvence" but not `ÜCRETSİZ İADE/DEĞİŞİM yapılmaktadır`, the strongest form of the
promise; and `wrong-city`, my finding, whose pattern was `geo.placename` only. Its new negative controls are
worth recording: `timeZone: "Europe/Istanbul"` is an IANA identifier, and `Login.tsx`'s "İstanbul" placeholder
is the **customer's** city field, not a claim about ours. And a global invariant now runs on every invocation:
**four SLA controls × 29 rules**, so no rule added later can quietly start firing on the one authorised
duration, and a rule that stops firing on the string it was written for fails the gate.

**Goldens: two moved, both explained, none silenced.** `inner-next-service-detail.png` 549→550px and
`shell-footer-service.png` 742→741px at `visual-375`, both on `/hizmetler/cnc-frezeleme`, because a replaced
advantages bullet wraps one line further at 375. Controlled: the same two goldens re-run against `0780ac4`'s
`servicePages.ts` in the same worktree passed 13/13. `--update-snapshots=changed` wrote exactly these two;
everything else in both spec files was byte-identical, and 768/1280/1440 needed none.

**A coupling that changes what the chatbot fix actually was.** `chatFaqData.ts`'s `collectServiceFaqs()` lifts
**every** `faq` entry in `servicePages.ts` into the chatbot's answer pool. So `60238c8` — the commit that
"fixed the chatbot" — reached only the smaller half of what a visitor can be told; the larger half lived in the
file the killed agent never got to. It is fixed now, but the coupling is load-bearing and was documented
nowhere. That is the item QA round 2 is most pointedly asked to check independently.

**Four in-scope findings the Coder deliberately did not act on**, because they fall outside the packet's three
classes and the packet forbids opportunistic cleanup — correct discipline, and all four are cheap for a later
packet because they sit in files already being edited: `servicePages.ts:77`'s unsourced `%40 daha hızlı
üretim` against §D `OTHER_PUBLIC_KPIS: NONE`; `tasarim-rehberi-dfm`'s `%70'e kadar maliyet tasarrufu` and
`Ortalama %30-50`, both contradicted by that page's own already-corrected FAQ; `dusuk-hacimli-uretim`'s named
machine model `EOS M290`, the same class Phase 06 removed under §D `MACHINE_COUNT:
PRIVATE_DO_NOT_DISCLOSE`; and `enjeksiyon-kalibi`'s `Parça/Saat` table header, which matches `claims.ts`
`WITHHELD_SPEC_CLASSES` exactly but escapes it because that filter runs on `technicalSpecs` via `CategoryPage`
and never on a `comparisonTables` header. **QA R2 is asked to confirm each is still live** so I am not
carrying a phantom into a later phase.

**QA round 2 dispatched** to a fresh `wt/qa-p09a2` from `dae15bb`, packet `.work/packets/phase-09a-QA-R2.md`,
carrying the production-write prohibition verbatim and instructing that **U1–U7 stay unattempted** — every one
of them needs a write to the customer's database, and an honest unverifiable entry is worth more than a check
bought that way.

#### QA 09a round 2 — FAIL on one defect, and it is the one I sent QA to look for

Nine commits integrated as `55a18ed..fe3a525`; 25 paths, every one inside the allowlist — three
`qa-p09a2-*` specs, a fixture, seven probes, evidence. No production path, no golden, no pre-existing spec,
and `.env` copied in but never committed (0 occurrences in history). The agent was killed mid-run for the
**second** time this phase and resumed from its own transcript with five commits already banked. Two agents
killed, two recoveries, zero work lost — the worktree rule has now paid for itself three times.

**Everything C1 and C2 claimed reproduced, twice over.** Contrast measured both arithmetically from the token
hexes and in the rendered cascade: `#e18570` on `#070b0d` = **7.33:1** at 9px/600 for both the label and the
2px `border-left`, at 1280 and 375; the paper band nested inside the graphite root = 6.07:1; the trap a root
override would have created = 2.23:1; ΔE = 33.8, which is C1's "34". Columns: 17 time-like columns walked in
the real structure, **0 mixed**, and `proje-yonetimi`'s "Süre" proven to read the *identifier*
`QUOTE_RESPONSE_TIME` at `:2324` rather than a literal that merely matches. Sweep: QA built its own 63-route
list rather than taking the Coder's 56 — 0 findings, 12 raw hits all adjudicated false **by word sense** and
each encoded with its reason so it re-fires if the text changes (`taahhüt ETMEZ` is a negated disclaimer;
`kesintisiz işleme` is bar feed, not a shift; "Gun Drilling" is English; `100.000 saat` is fiber-laser
service life). Goldens: exactly the two that moved, both explained by a bullet 19 characters longer
re-wrapping at 375 and fitting on one line at every larger viewport — and the proof is that
`git diff --stat dae15bb..HEAD -- e2e/__golden__` is **empty after all four visual projects ran**, which no
`--update-snapshots` could leave true. Regression 364 passed / 0 failed / 62 skipped.

**QA falsified me twice and was right both times, verified at the source.**

- My packet said `.shell-form-error` had been at 2.69:1 **as text**. It never was. `shell.css:1493` sets
  `color: var(--sf-ink)` and did before C1 too, ~17.9:1. What C1 moved to `--sf-danger` is the **2px
  `border-left`** at `:1491`. The number 2.69 is right; the element and the criterion are not — a 2px rule is
  non-text, so what was failing is **1.4.11's 3:1**, not 1.4.3's 4.5:1.
- `F1` is at `servicePages.ts:117`, not `:77`. I had been carrying a line number 40 lines stale.

Both matter only because a correction packet written from them sends a Coder to the wrong place — which is
exactly what C3 would have done.

**The pool coupling is worse than I described it.** Not "the larger half": the assembled pool is **140
entries, 116 of them lifted from `servicePages.ts` by `collectServiceFaqs()` — 83%**. `ChatBot.tsx:261`
renders `match.entry.answer` verbatim, no network, no moderation. QA read and adjudicated all 140. Against
C2's three classes the sweep holds completely: **0 delivery durations, 0 payment or credit terms, 0
return/warranty guarantees** anywhere in the pool.

**D1 — BLOCKING, and it is 09a's own miss rather than an inherited defect.** `servicePages.ts:134` publishes
*"STEP, IGES, Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX (.prt) ve PDF/DWG teknik çizim
formatlarını destekliyoruz."* `cadUpload.ts:4` accepts `step, stp, stl, obj, iges, igs, 3mf` and **rejects
nine of the formats that sentence names**. QA proved it at runtime rather than by reading — a `.sldprt`
upload produced the live notice *"DOSYA REDDEDİLDİ … kabul edilen formatlardan biri değil."*

The exposure is sharper than one unlucky probe. **Six phrasings score 1.000 onto it** — `catia`, `catia
dosyası`, `catpart`, `solidworks`, `sldprt`, `solidworks dosyası` — while the *generic* question correctly
reaches the honest derived answer. **So the false answer is served selectively to precisely the visitors it
harms:** someone holding a SolidWorks or CATIA file asks, is told yes, and is refused at upload.

And `chatFaqData.ts:8-10` documents removing this identical claim from the static half of the pool, citing §J
`ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`, with the `collectServiceFaqs()` principle
stated in the same header. **The principle was applied to lead times and not to the CAD list documented ten
lines above it.** The C2 diff prints line 134 as unchanged context one line below the `:133` it did change.

QA's own adjudication of the three-way collision is the right one and I have adopted it: three CAD answers in
the pool is **one** defect, not two — the other two are factually correct, and the collision is only harmful
because `:134` is false. The literal list at `:1967` is a separate, non-blocking drift risk (D2): correct
today, which is exactly what makes it dangerous, because `chatFaqData.ts:12` derives the same list and this
one would go silently stale the day the validator changes.

**All five carried findings confirmed live, with two of my references corrected.** `F1` at `:117`; `F2a` at
`:1922` and **inside `metaDescription`**, so it ships into search results and social cards; `F2b` at `:1945`;
`F3` at **two** sites, `:2103` and `:2131` — and `:2131` is **chatbot pool entry #78**, so the named machine
model is reachable by asking the bot, not only by reading the page; `F4` at `:517`. QA added **D3**,
`:1965`'s *"İlk DFM değerlendirmesi ücretsizdir"* — a free-of-charge commitment, the same commercial-policy
class C2 stripped from the chatbot.

**Orchestrator ruling on scope: all of them go into C3.** C2 was right to leave them — they were outside its
three classes and the packet forbade opportunistic cleanup. But every one is an unverifiable public claim in
the same 3,000-line file, the run's standing instruction to remove such claims is not phase-scoped, and a
third pass over that file later costs more than folding them in now. C3 therefore carries D1, D2, D3 and
F1–F4.

**The gate's blind spot is the durable finding.** 29 rules, 178 controls, and it caught **none** of these.
`WITHHELD_SPEC_CLASSES` matches `F4`'s `Parça/Saat` header *exactly* and misses it only because the filter
runs on `technicalSpecs` via `CategoryPage` and never on a `comparisonTables` header. C3 asks for three
rules, of which one matters most: **a published format list that is not derived from
`CAD_ACCEPTED_EXTENSIONS` should fail the gate**, which makes D1 unrepeatable rather than merely fixed.

**`visual-768`'s flake did not reproduce** — green on its only run, all 35. QA's assessment is environmental,
and it argues it rather than asserting it: `fonts.ts:170` is a font-CDN interception helper on a surface 09a
never touched, it hit a different untouched test each time, and C2 changed only string content in two data
files, which cannot change whether a `gstatic` request is issued. It also refuses to file it as nothing:
a real determinism gap, to be fixed at `fonts.ts:170`. Round 1 logged the same flake at `visual-375`, not 768.

**Unverifiable, honestly kept.** U1–U7 carried forward **unattempted** — every one needs a write to the
customer's database. Four new: **U8**, the five `tone="error"` sites are verified through one shared component
and one shared rule rather than five independent renders; **U9**, `.shell-form-error` on `/teklif-al` was
measured on a *planted* element and only `/iletisim`'s is the real always-rendered one; **U10**, deep-link and
`:slug` routes fall outside the 63-route public sweep, so a claim living only on a blog post or material page
would not have been seen; **U11** is not a gap but a proof — a live canary to example.com was fired and
required to fail **before any control was touched**, in every test, and the probe bundles were given a
loopback URL and a junk key instead of the real credentials so they could not reach the project even by
accident.

**09a-C3 dispatched** to `wt/coder-p09a3` at `fe3a525` in the existing Coder worktree, packet
`.work/packets/phase-09a-C3.md`, with `cadUpload.ts` on DO_NOT_TOUCH and the reason spelled out: when a page
and a validator disagree, the instinct to make them agree by widening the validator would turn a false
sentence into a broken upload.

#### C3 integrated — the fix I mandated was impossible, and what replaced it is stricter

Six commits picked as `8e5472b..38d4f73`; eleven paths, tree identical to the Coder's on every code and test
path. No production write of any kind.

**D1 was five sites, not the one I named — and one of them was on the page I did name.** `:134` was the FAQ
entry QA found; **`:89` publishes the same false claim in body prose on the same page**, so the fix my packet
specified would have left `/hizmetler/cnc-frezeleme` still telling buyers it takes SolidWorks. Also `:1943`
(`"Desteklenen CAD: STEP, IGES, CATIA, NX, SW"`), `:1967` (D2's correct-today literal) and **`pages/SSS.tsx:132`**,
a fifth site my allowlist did not contemplate. The Coder edited it and **declared the interpretation rather
than claiming silent compliance** — the right call, and accepted: leaving it would have left the packet's own
highest-value gate rule failing on the tree.

**What the fix keeps is as important as what it removes.** `:210` still *names* SolidWorks `.sldprt`, CATIA
`.catpart`, NX `.prt` and PDF/DWG — as formats the uploader will **not** take, with an email route beside
them. Deleting the words would have made all six phrasings fall through to a default response; naming them in
a refusal is what keeps `catia`, `catpart`, `solidworks`, `sldprt` landing on a **true** answer. The Coder
re-probed all six against the assembled pool: 1.000 onto that entry.

**I mandated a fix that cannot be built, and the Coder proved it rather than working around it quietly.** I
said derive the list from `CAD_ACCEPTED_EXTENSIONS` at runtime. That version typechecks and builds — and then
**kills spec collection for all of `critical-1280`**, because `cadUpload.ts` → `supabase/env.ts` reads
`import.meta.env` at module scope while `navigation-reachability.spec.ts` and
`shared-shell-accessibility.spec.ts` import `servicePages.ts` into the Playwright **Node** runtime. Every
runtime path to that constant goes through `env.ts`, and `cadUpload.ts`, `env.ts` and `tsconfig.e2e.json` are
all off-limits.

**What replaced it is stricter than what I asked for, not looser.** The list is restated **once**, in
`claims.ts`, behind `import type` — erased at compile time, no module edge, so `claims.ts` keeps its
no-runtime-imports property — and pinned by a tuple-exact type assertion (`Exact<typeof
PUBLISHED_CAD_EXTENSIONS, typeof CAD_ACCEPTED_EXTENSIONS>`), with an independent text comparison in the gate.
Two instruments that must agree. A runtime derivation would change the copy *silently* when the validator
changed; this fails `npx tsc -b`, which the release gate already requires.

**I tested the pin myself rather than accepting it.** Appending `"dwg"` to the tuple produced `TS2344` at
`claims.ts:88` from `tsc` **and** a gate FAIL at `claims.ts:74` — both instruments, independently. Restored
clean. I also tested the one deferral the Coder asked me to accept: `technicalLandingData.ts:130` still
restates the list (not on the allowlist, and `technical-landing.spec.ts:167` asserts the exact string), and
it is **pinned, not exempted** — drifting it by one format turned the gate FAIL at that line. A literal that
survives only while it is exactly right is a legitimate deferral.

**The `F4` instruction was wrong and the Coder refused it, correctly.** I told it to extend
`WITHHELD_SPEC_CLASSES` to `comparisonTables` headers. `isPublishableSpec` is an **allowlist**: run over
headers it drops "Kavite", "Özellik", "Yöntem" — nearly every header in the file — and its withheld half
alone kills the `$/$$$` cost cells; worse, it would silently mutate a rendered table into rows with more cells
than headers. The filter exists because `CategoryPage` **republishes** a spec on a surface it was not written
for; a comparison table is authored in place, so there is no republication to guard. My instruction would
have broken working tables to catch one header.

**And the machine half it found instead is the better finding.** `periodic-volume-disclosure` had
deliberately omitted `saat` from its period list, and **the note justifying the omission named the right table
and defended the wrong column**: it cited `Çevrim/Saat` as "a mould's cycle rate", but `Çevrim/Saat` was never
reachable, because `çevrim` is not one of the rule's count nouns. The omission bought nothing and cost the
class for three phases. `saat` now sits in the denominator alternative only — `Parça/Saat` fires,
`Çevrim/Saat` stays silent — and the rule agrees with `WITHHELD_SPEC_CLASSES[0]`, which had listed `saat` all
along.

**Gate: 29 rules / 178 controls → 31 / 244.** PASS on the tree, verified by my own run; FAIL with the removed
strings restored, 15 violations at the exact lines. `cad-format-list-not-derived` reads
`CAD_ACCEPTED_EXTENSIONS` from `cadUpload.ts` each run and **throws if it cannot**, and asks *"was this
derived?"* rather than *"is this true?"* — so the two correct-today literals fire exactly as the false ones
did. That is the rule that makes D1 unrepeatable rather than merely fixed. `free-of-charge-commitment` is new
beside `payment-or-credit-terms`, which had removed payment terms and discount schedules and left the mirror
image standing. `delivery-or-quality-rate` was **widened rather than duplicated** — the Coder's reasoning,
which I endorse: §D `OTHER_PUBLIC_KPIS: NONE` already decides `%40 daha hızlı` the same way it decides `%95
zamanında teslimat`, and *two rules over one class is how the last three holes happened*.

**The carried findings, each with a twin the Coder found beside it.** D3's free-DFM promise also existed at
`:81` **in a `metaDescription`**, so it was shipping into search results; F1's `%40 daha hızlı` had `%50 setup
tasarrufu` at `:208`; F2a came out of a `metaDescription` too; F3's `EOS M290` went from both `:2103` and
`:2131`; F4's column was removed rather than relabelled because its five values were exactly Kavite ×
Çevrim/Saat and carried no information the two columns to its left did not.

**Goldens: six moved at 375/768/1280, and the Coder proved the cause before touching them** — base `fe3a525`
passes both tests, so not flake; `.shell-next` keeps its height (332.438px), child count (29) and text, and
only its fractional top moved, so the crop rounds to 333 device rows instead of 334.
`inner-hero-service-detail` and `shell-header-service` are captured by the same two tests and were rewritten
**byte-identically** — the signature of a targeted update rather than a blanket one, and the thing QA R3 is
asked to check specifically.

**A residual that needs an allowlist decision, reported rather than swept.** `/hizmetler/fikstur-aparat`
names CATIA and SolidWorks four times (`:680` in a `metaDescription`, `:685`, `:703`, `:710`) as the tools a
fixture is *designed in* — a software-inventory class, the same authority the gate's `named-enterprise-system`
rule already cites. The Coder fixed the DFM page's instance because deriving that page's "Desteklenen CAD" row
put two different accepted-format lists on one screen and the contradiction was its own; the fixture page
publishes no intake list, so no reader is misled about what to send. **Its reasoning for stopping is the right
one — "a sweep of a class this packet does not contain is not mine to run" — and the decision is mine.**
Carrying to 09b rather than expanding C3 a second time.

**Also carried:** a pre-existing matcher quirk, not a false claim — `parasolid` scores 1.000 onto "Teklif
nasıl alabilirim?" because `findBestFaqMatch` does substring matching and `para` is one of that entry's
keywords. Harmless answer, wrong routing. And `chatFaqData.ts:165`'s keyword array still contains raw
extension strings, which is exempted by rule and documented: matcher input, never rendered, and it is what
routes those words to the derived answer.

**QA round 3 dispatched** to a fresh, pre-provisioned `wt/qa-p09a3` at `38d4f73`, packet
`.work/packets/phase-09a-QA-R3.md`. Deliberately **narrow**: round 2's findings are not to be re-verified.
Its three targets are the type pin — attacked by reordering, shortening, case and dropping `as const`, the
routes I did not test — the five CAD sites and six phrasings, and a second opinion on whether the Coder's F4
refusal was right. It is also asked whether its own round-2 spec can overwrite round 2's committed evidence,
since running it rewrote `sweep.json` and the Coder had to restore it.

#### QA 09a round 3 — PASS, and it got through the pin two ways I did not think to try

Ten commits integrated as `8ae3728..8217c67`; 62 paths, all allowlisted, `.env` not committed, nothing
submitted or inserted. **Integration error of mine, caught and fixed in the same turn:** I first
cherry-picked only QA's final report commit, which left the branch missing the nine commits carrying its
evidence. `git diff` against the QA branch showed 15,984 deletions and I picked the remaining nine. The tree
now matches exactly. Worth recording because the check that caught it — diffing the integration tree against
the agent's own — is the one that makes "integrated" mean something.

**VERDICT: PASS.** Six defects, none blocking.

**It attacked the type pin twelve ways and four got through.** The four I named in the packet are all caught,
both instruments: reorder, shorten, case change → `TS2344` **and** gate FAIL. Dropping `as const` or
annotating `: readonly string[]` → tsc only, which is correct rather than a hole, because the literal is still
textually right.

**The two that got through are the ones I did not think to try, and they are inside `claims.ts`.** The pin
binds the **tuple to the validator**; nothing binds the **published strings to the tuple**. Leave the tuple
untouched and edit the derivation —
`joinTurkishList([...PUBLISHED_CAD_EXTENSIONS.map(e => e.toUpperCase()), "DWG"])` — and `tsc` exits 0, the
gate passes, and **all five publication sites read `… IGS, 3MF ve DWG` against a validator that refuses
DWG.** That is the exact defect C3 existed to make impossible, reintroduced one layer up. `A7` is the same
with `.slice(0, 5)`. **R3-1.**

**And the gate's pinned-file scan replaces the general detectors instead of supplementing them**
(`claims-gate.mjs:837-848`), so a bare prose offer of SolidWorks added to `claims.ts` — **or to
`technicalLandingData.ts`, a rendered content file** — is invisible to both instruments. A file being pinned
should buy an *extra* check, never fewer. **R3-2.**

**Both of the Coder's refusals were independently confirmed, by measurement rather than by argument.** QA
restored the runtime import edge and ran the collector: `critical-1280 --list` gives **0 tests in 0 files**
(`TypeError … VITE_SUPABASE_URL` at `env.ts:22`) against **83** at HEAD. My instruction was not merely
awkward, it was unbuildable. And the `F4` filter I ordered extended: over every header in the tree
`isPublishableSpec` drops **265 of 279 (95%)**, **53 of 54 tables** lose a column, and
`ShellComposition.tsx:243` renders `headers` and `rows` independently with no zip and no width check — it
would have shipped 53 malformed tables. The counter-fix is sound: `Parça/Saat` fires, `Çevrim/Saat` and
`Çevrim/Vardiya` stay silent, rows were trimmed with the header (0 mismatches, measured in the DOM).

**The CAD fix reaches nine sites, not the five I recorded.** Beyond `:210 :152 :2058 :2100 SSS:135`, commit
`b3ae3c7` corrected four more on the DFM page that its own fix had put into contradiction on screen. Pool
re-assembled from the real modules: 140 entries, **0 offers of a refused format**; all six phrasings hit
entry #26 at 1.000 with the refusal and the email route; rendered DOM at 1280 and 375 with `<details>` forced
open shows 0 offers and 7 non-offer mentions.

**A false statement of mine, corrected here rather than quietly.** I wrote — in the C3 packet, in this file,
and in a commit message — that the free-DFM and `%70` claims were "shipping into search results and social
cards" because they sat in a `metaDescription`. **That is false.** `ServiceDetail.tsx:195, 284, 306` all pass
`page.description`; **nothing in `src/**` reads `metaDescription` on a service route.** The removals were
right — they were unauthorised claims wherever they sat — but the reason I gave for their severity was wrong,
and two in-code comments now repeat it. C4 corrects the comments. **That every service page carries an unread
`metaDescription` is itself a real finding and it belongs to the SEO phase, not to a content correction** —
recorded, not acted on.

**A gate false negative in the class just widened: `kazanç` is matched, `kazancı` is not.** `{ label:
"Maliyet Kazancı", value: "%30-50" }` passes the full gate while `Zaman Kazanç` fires. I checked the tree —
**no live instances**, so it is a latent hole rather than a live claim. The fix is the `kazan[çc]` idiom the
file already uses four times. **R3-3.**

**A hazard this run has demonstrated twice.** `e2e/landing/claims-gate.spec.ts:53` writes a probe file into
**`src/content/`** and removes it in `finally` — and two agents have been killed mid-run this phase, which
leaves that file in production source. QA also found and owned a defect of its own: its round-2 spec writes
`reports/qa/phase-09a-r2/sweep.json` unconditionally on every run, so running it **overwrites round 2's
committed evidence**. It reproduced the overwrite, restored all 15 files to their pre-run md5, and reported
it against itself. **R3-5.**

**Goldens, profiled rather than eyeballed.** QA wrote a from-scratch PNG decoder and found the Coder's account
is a *simplification* — two of the six did not change height and one grew a row — but every one is explained
by a whole-band ±1-row displacement plus sub-pixel re-rasterisation, with 296–669 bit-identical consecutive
rows in four of them and no localised block of new content anywhere. It also refused to claim something it
could not check: **"the byte-identical-rewrite claim is not falsifiable from git"** — a rewrite producing
identical bytes and no rewrite at all are indistinguishable — so it logged that as U12 rather than pretending.
That is the discipline this run is being built on.

**Regression 367 passed / 1 failed / 62 skipped**, the one failure being the `visual-375` font-cache flake,
6/6 green on isolated re-run. Specs unedited, goldens clean after four visual projects.

**Two scope corrections to me, both right.** `fe3a525..38d4f73` is **13** paths, not the 11 I wrote — the
extras are `PROGRESS.md` and my own C3 packet, committed inside the range; `8e5472b..38d4f73` is the 11 I
meant. And `servicePages.ts:3292` / `:3306` carry `{ label: "CAD", value: "SolidWorks, CATIA, NX" }` on
`/endustriyel/ozel-projeler` — the same class as the row C3 removed, which the Coder had reported only for
`fikstur-aparat`.

**Orchestrator ruling on that class:** it is now **six sites** across two pages, and it is one decision, not
six. It goes to **09b whole**. The Coder was right to stop at the DFM page in C3 — where deriving the
"Desteklenen CAD" row had put two different accepted-format lists on one screen, making the contradiction its
own to fix — and the same reasoning says do not half-sweep it now.

**09a-C4 dispatched** to `wt/coder-p09a4` at `8217c67`, packet `.work/packets/phase-09a-C4.md`: bind the
derived strings to the pinned tuple, make the pinned-file scan supplement rather than replace the general
detectors, close `kazancı`, correct the two false comments without wiring `metaDescription` up, move the
probe file out of `src/**`, make the QA evidence write opt-in, stop the byte-exact pin false-positiving on a
reformat, and gate the four D4 sites that QA found ungated. **I deliberately did not prescribe the mechanism
for the pin this time** — I prescribed one last packet and it could not be built. Acceptance is QA's own
attack harness, `p09a3-pin-attacks.mjs`, which is committed on the branch: read it, run it, do not edit it.

#### C4 integrated — the pin is closed, and the mechanism is a third one neither of us proposed

Ten commits picked as `8b5ee92..184abf2`, six paths, tree identical to the Coder's on every code and test
path. No rendered copy changed; **no golden moved**.

**All four holes closed and both false positives gone — verified by my own runs of QA's harness, not by the
Coder's report.** Three invocations, worktree checked clean after each:

```
A6-tuple-intact-derivation-appends-dwg    tsc=0 gate=1  caught by gate    ← was a HOLE
A7-tuple-intact-derivation-truncates      tsc=0 gate=1  caught by gate    ← was a HOLE
A10-pinned-file-prose-offer               tsc=0 gate=1  caught by gate    ← was a HOLE
A11-other-pinned-file-prose-offer         tsc=0 gate=1  caught by gate    ← was a HOLE
A8-whitespace-only-reformat               tsc=0 gate=0  correctly silent  ← was a FALSE POSITIVE
A9-single-quotes                          tsc=0 gate=0  correctly silent  ← was a FALSE POSITIVE
```

Gate on the tree, my run: **PASS, 31 rules, 262 controls, 0 failed** (was 244).

**The mechanism is neither of the two I imagined, and the Coder proved why the obvious one is unavailable
rather than asserting it.** A type-level binding cannot be built here: `Array.prototype.map` is declared
`map<U>(…): U[]`, so it returns a plain array and the element literals are destroyed before any
template-literal type could join them back into `"STEP, … ve 3MF"`. It demonstrated that with a three-line
probe under the repo's own `tsc` under `--strict`. And building one would have required rewriting the
derivation *expression* — **which is the exact anchor `p09a3-pin-attacks.mjs` mutates**, so the fix would
have disabled the probe that proves it. Both anchor lines are byte-identical to `8217c67`.

So `claims-gate.mjs` now `await import()`s `claims.ts` and compares `CAD_UPLOAD_FORMATS` and
`CAD_UPLOAD_EXTENSIONS` **as values** against a canonical rendering of `CAD_ACCEPTED_EXTENSIONS` read from the
authority — the total, order-preserving function checked on the values rather than on the code that produces
them. It can only do that because that file's single import is an `import type` Node's type stripping erases,
which means **the check now enforces the no-runtime-imports property C3 merely asserted**. Both fail-closed
paths were tested rather than assumed: a value import of the validator, and a non-erasable TypeScript enum,
each producing an explicit `derived-copy problem` FAIL.

**The pin also stopped replacing the general detectors.** Being pinned now buys a file an *extra* check —
the pin marks the one span where the list may be spelt, and every detector runs over everything outside it.
Detector (A) now runs on any pinned file, not only `src/data/**`; the ledger is not in `src/data/` and had no
restated-list cover at all.

**And both pins now parse instead of comparing bytes**, which is what killed the false positives: the ledger
pin extracts the quoted tokens between the brackets and compares element-wise and in order, and the landing
pin matches its words with `\s+` between them. A formatter run no longer turns the gate red for nothing.

**The Coder refused half of an instruction and was right.** I asked for all four ungated D4 sites gated. It
gated two that needed no judgement — a §J intake claim, and `Mastercam` added beside `Vericut` in a rule that
already holds CAM packages. It **refused the other two**, because any rule catching them catches all six live
sites of the software-inventory class I had just deferred to 09b: `:774`, `:779`, `:797`, `:804`, `:3292`,
`:3306`. Its reasoning is the part worth keeping — *"writing the rule takes the decision, and writing it with
an enumerated exemption list for the six fakes taking it"* — and if 09b rules the class publishable, the rule
would be wrong and the list would be noise. It then wrote the deferral **into the gate at the re-aimed
control, where the next agent will look**, rather than into a document nobody opens.

**A stale control that was blessing a class vacuously.** `:1221` asserted silence on
`'"CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam",'` — a string `b3ae3c7` had **deleted**. A negative
control on an absent string passes for free. Re-aimed at the two strings in that class that are live, so it
fails the day either changes, and the deleted one moved to `fires` on `named-enterprise-system`.

**My false sentence existed in three places and all three are corrected.** The addendum took the third at
`servicePages.ts:133-139`, which my own allowlist parenthetical had fenced off. I verified the result: `grep`
for the phrase now returns **one** hit, at `:141`, quoted as what the note used to say and immediately
followed by `YANLIŞTI`. The Coder added to it the detail that explains why the same mistake was made three
times — `LegalDocument.tsx` carries a prop of the same name on a different type, **and that one is read**.

**The evidence-overwrite defect was found three times and each time it was "the last one".** Round 3 found it
in its own round-2 spec; C4 fixed that and `claims-gate.spec.ts`, which was writing a probe file into
`src/content/` and cleaning up in `finally` — a hazard this run has demonstrated twice by losing agents to
process kills. Then running the required check for C4 revealed a **third**, `qa-p09a3-cad-dom.spec.ts`,
overwriting round 3's own evidence. All three now write to `test-results/` on an ordinary run and to the
committed path only behind an explicit env flag, with the path echoed either way. Round 2's fifteen files and
round 3's forty-six are byte-identical by hash. **QA round 4 is asked to grep for a fourth rather than take
"these were the last three" on trust.**

**A self-criticism I asked for and got in the code rather than in a report.** `runControls` proves that
*rules* fire on the strings they were written for, and knows nothing about the two checks that are not rules:
delete `checkDerivedCadCopy` or `checkQualityResources`, or drop either from the `clean` conjunction, and
**all 262 controls still pass and the gate still reports PASS**. The Coder wrote that plainly next to the
function, said why it is recorded rather than closed — a control would have to mutate a source file while the
gate runs, which a gate must not do — and named what proves it instead, so the external proof is findable
from the code. Round 4 is asked to confirm it rather than accept it.

**Carried, unfixed, deliberate:** `npm run lint` exits 1 at `8217c67` and at `184abf2` with the same four
errors, two of them in files C4 edited and both pre-existing byte-for-byte, one on a line the packet forbade
changing. A single `UV_HANDLE_CLOSING` libuv assertion, one observation against 25 clean re-runs, mitigated
by moving off `process.exit()` so the loop drains, root cause not found and said so. And a wobble the Coder
reported without chasing because the spec is QA's: `qa-p09a2-claims-sweep` gave `SLA_ROUTES=57` on one run
and `56` on another in the same session, `FINDINGS=0` both times — if that measurement is flaky then round
3's "SLA on 57 of 63" rests on it, which is why round 4 is asked to settle it.

**QA round 4 dispatched** — the closing round — to a fresh, pre-provisioned `wt/qa-p09a4` at `184abf2`,
packet `.work/packets/phase-09a-QA-R4.md`. Narrow by design: round 3's content findings are not reopened. Its
targets are the **new** mechanism rather than the old attacks, the two uncovered checks, whether the
evidence-overwrite class is actually closed, the SLA wobble, and a second opinion on the D4 refusal. If it
passes, 09a closes on its verdict.

#### QA 09a round 4 — FAIL, because the gate this phase built cannot run in the place it blocks

Eight commits integrated as `179f38d..ffe3c0b`; 44 files, all inside the four allowlisted prefixes, `.env`
not committed, nothing submitted or inserted. Tree identical to QA's.

**R4-1 — BLOCKING, and it is the kind of defect that only appears if you ask where the code runs rather than
whether it works.** `checkDerivedCadCopy` (`claims-gate.mjs:813`) `await import()`s a `.ts` file and its own
message says *"Node >= 22.18 is required"*. `.github/workflows/playwright.yml:29` pins **`NODE_VERSION:
"20"`** for all six jobs, and Node 20 has no type stripping at all — `--experimental-strip-types` first
appears in 22.6.0. Every link is in the repo: `e2e/landing/claims-gate.spec.ts` runs the gate, it is a
`CRITICAL_MATCH` (`playwright.config.ts:108`), and the blocking `e2e-critical` job runs
`npm run test:e2e:critical` on push and PR to `main`. **I verified the whole chain at the source and ran the
proof myself**: `node --no-experimental-strip-types scripts/claims-gate.mjs` exits 1 with `Unknown file
extension ".ts"`, reported as a *derived-copy problem*. So the first PR to `main` gets a red critical suite
whose message is about CAD copy drift.

It fails **closed**, which is the right direction. But a gate that cannot run where it blocks is not a gate,
and C4 introduced the requirement — `git show e7cf106:scripts/claims-gate.mjs` has no dynamic import. Neither
the Coder, nor QA round 3, nor I would have found this by testing locally on Node 26. `package.json` declares
**no `engines.node`**, which is why nothing caught the mismatch.

**R4-5 — the Coder's own self-criticism was confirmed four ways, and the reason it gave for not closing it was
falsified.** QA used an ESM load hook to rewrite the gate **in memory** — disk never opened for writing —
and neutered each check in turn: `checkDerivedCadCopy` neutered → PASS 262/0; dropped from the `clean`
conjunction → PASS 262/0; the same twice for `checkQualityResources`. **And it proved its own probe could turn
red** by neutering a check that *is* covered, which came back FAIL 262/1 — so the four PASSes are a finding
rather than a broken harness. That last step is the difference between a measurement and a claim.

The stated impossibility — *"a control would have to mutate a source file while the gate runs, which a gate
must not do"* — does not hold. Two designs a gate is allowed to use: split the read from the judgement so
`compareDerivedCopy(namespace, expected)` is pure and can be fed a fake namespace, or use an optional fixture
path — **the very `mkdtempSync(tmpdir())` pattern C4 itself introduced** for `--also-scan=`. Recorded as
accepted: the finding was right, the reason was not, and C5 closes it.

**R4-4 — a finding that reaches backwards into two prior rounds, and QA filed it against itself.**
`qa-p09a2-claims-sweep.spec.ts:139` waits for `#root > *` to be **attached** — which the shell alone satisfies
— then sleeps 350 ms. Measured: **41 of 63 routes settle more than 350 ms after the fastest, the slowest at
4018 ms**, and a faithful replica caught two routes mid-flight with `innerText` of **88 characters** against
5753 and 4891 once settled. So `FINDINGS=0 across 63 routes` has always meant *"across the routes that
happened to have rendered"* — in round 2 and round 3 as much as here.

**The findings survive on a better instrument, which QA built rather than asserted.** A stabilised sweep
returns `neverSettled=0`, `SLA_ROUTES=57`, `FINDINGS=0`, `EXEMPTED=12` at **both** desktop-1280 and
mobile-375, naming the same six routes without the SLA. **57 was right; 56 was the instrument.** The 57-vs-56
wobble I asked it to chase turned out to be the visible edge of a defect that had been quietly weakening two
rounds of evidence.

**R4-3 — the deferral I accepted is not discoverable where it was put.** The instinct was right; the
execution rots. `claims-gate.mjs:1487` cites `servicePages.ts :774 :779 :797 :804`, and at the integration
head those lines are a comparison-table row, a closing bracket, a fixture name and a repeatability label —
the real sites moved **+14**, because a commit in the *same C4 batch* added a 14-line comment at `:132`. My
own `PROGRESS.md` citation of the `ozel-projeler` pair is off by 26 for the same reason. The fix is to stop
citing line numbers: `claims-gate.mjs:2396` already cross-references by **rule id** and survives any edit.

**A correction to QA's correction, checked at the source.** QA reports the class is *five* sites, not six.
That is true of **the control's enumeration** — which double-counts `:793` and never names `:3318` — but not
of the class. I re-grepped: the live sites are `:788 :793 :811 :818 :3318 :3332`. **Six is right**, and the
control names five of them. Recording this precisely because accepting the correction would have shrunk a
class I am about to hand to 09b.

**R4-2 — detector (D) over-catches twice, and one over-catch falsifies the defence written beside it.**
`"Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz."` fires — while the
comment at `claims-gate.mjs:882` defends the detector by arguing `yükleyebilirsiniz` is not an offer
predicate, **and it is in `CAD_OFFER_PREDICATE`**. The second, `"Ölçüm raporunu çeşitli formatlarda
gönderebilirsiniz."`, cuts across the *"Rapor Formatı"* distinction the same rule draws deliberately one
detector earlier. Neither string is in the tree, so it is latent.

**R4-6 — a `.js` shadow would be invisible to both instruments.** `claims-gate.mjs:101`'s `EXT` does not scan
`.js`/`.mjs`, and Vite's default `resolve.extensions` — read from `node_modules/vite/dist/node/constants.js`
rather than from memory — puts `.mjs` and `.js` **before** `.ts`. A `src/content/claims.js` would be what the
app bundles while the gate reads `claims.ts` literally. Zero such files today. **R4-7**: an `enum` or
`namespace` added to `claims.ts` later throws `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` and the gate reports **CAD
copy drift over a correct file** — fails closed, wrong diagnosis.

**What round 4 confirmed rather than found.** The evidence-overwrite class **is** closed: QA's own grep
across `e2e/**` finds only the `mkdtemp` probe, the two env-gated writes and seven `testInfo.attach()` calls
landing in the gitignored `outputDir`. Rather than leave that as a point-in-time statement it wrote a
**census control** — `qa-p09a4-evidence-write-guard.spec.ts` — that fails when a new write destination
appears or an existing one loses its flag. That is the right response to a defect that had been "the last
one" three times. Rounds 2 and 3's 61 committed files are byte-identical by manifest hash before and after
the full regression. Regression **377 passed / 0 failed / 62 skipped**, no flake, **no golden moved**, and
the widened rules survived 31 adversarial strings including the one I would not have thought of —
`"Kazancı ustalığı … 40 yıldır"`, where *kazancı* is Turkish for **boilermaker**, correctly silent.

**And a citation error of mine that QA caught.** My round-4 packet gave the range `8b5ee92..184abf2`, using
the **Coder's** hashes; `8b5ee92` exists only on `wt/coder-p09a4`, never on the integration branch, so
diffing the stated range silently omits the commit introducing the very mechanism under review. The real
range is `e7cf106..184abf2`. Integration itself was clean — `git diff wt/coder-p09a4 184abf2` is my packet
and `PROGRESS.md` only. **Cherry-picking rewrites hashes, and a packet that cites pre-pick hashes cites
commits its reader cannot see.** Every future packet cites integration-branch hashes.

**09a-C5 dispatched** to `wt/coder-p09a5` at `ffe3c0b`. It carries R4-1 through R4-7 and, explicitly
authorised, the one QA spec whose defect reaches backwards. **I did not pick the mechanism for R4-1** — raise
CI's Node, or remove the type-stripping dependency — because I have picked the mechanism twice this phase and
been wrong both times; the packet gives the trade-offs and requires the choice to be proved against a Node
that lacks stripping.

#### C5 integrated — and the two routes I offered as equals were never equal

Six commits picked as `80b2c87`'s range; two files, `scripts/claims-gate.mjs` and
`e2e/qa-p09a2-claims-sweep.spec.ts`, tree identical to the Coder's. `.github/workflows/playwright.yml`,
`package.json` and `package-lock.json` untouched. The agent stopped **twice** mid-run — once on a session
rate limit, once unexplained — and both times its worktree and commits survived. That is four agent stops in
this phase and four recoveries at zero cost.

**R4-1 is closed by my own measurement**: `node --no-experimental-strip-types scripts/claims-gate.mjs` →
**PASS, 31 rules, 280 controls, 0 failed, 16 of them watching the 3 checks that are not rules** — byte-identical
output to the ordinary run.

**The Coder falsified my framing of the choice, and it is right.** I wrote that I was not picking the
mechanism between raising CI's Node and removing the type-stripping dependency. **My own acceptance criterion
1 had already picked**: it required the gate to run and PASS *on a Node without unflagged type stripping,
proved by running it that way*. Bumping `NODE_VERSION` cannot satisfy that — it moves the blocking jobs onto a
Node that strips types while leaving the gate unable to run anywhere else. The two routes were never
symmetric and I presented them as though they were.

Its second argument is better than its first and is the one to keep: **the blast-radius reasoning runs the
opposite way from my reading.** It can run the gate on this machine; it cannot run GitHub Actions. "Move six
jobs to a new major" is precisely the change that could not have been verified before landing. And a
mechanism that works only on the newest major is one CI-image decision, or one contributor on an LTS, away
from returning to this exact failure **wearing the wrong diagnosis**.

**The mechanism adds no package**, which matters because `CLAUDE.md` forbids one: `ts.transpileModule` from
the repository's own declared `typescript ^5.8.3` — the same compiler `npm run typecheck` already runs — with
`verbatimModuleSyntax: true`, emitted to `mkdtempSync(tmpdir())` and imported from there. The "bare Node
process" property is **tightened rather than traded**: only an explicit `import type` is erased, and any
surviving import has to resolve from a directory with no `node_modules`, no `@/` alias and no relative
neighbours, so a value import throws `ERR_MODULE_NOT_FOUND` exactly as it did under stripping. It declined
`engines.node` with a reason — under this route there is no mismatch left for it to catch, and
`package-lock.json` is untouchable so the lock could not be kept in step.

**A correction to what I reported.** I told the user the Coder "found a third non-rule check". It did not —
**it created one**. R4-3's fix turned the 09b deferral from a comment into an assertion, and an assertion
that decides the exit code *is* an instrument, so `deferred-class-register` had to join `NON_RULE_CHECKS` and
earn controls. And my figures were a commit stale: at `9261a19` it is **280 controls / 16 instrument
controls**, not the 276 / 12 I quoted from the `869c38f` state. Both corrected here; the numbers to carry
forward are 280 and 16.

**The uncovered-instrument gap is closed by construction, not by care.** `compareDerivedCopy()` and
`verdict()` are pure and take fabricated inputs; the three checks take the paths they read, so controls point
them at temp fixtures. Instrument controls went **0 → 16**, total 262 → 280. Ten sabotages produced ten red
gates, each naming the instrument that went quiet — **including a control that asserts `verdict()` reports
clean when nothing is wrong**, so the probe is not stuck on red. That last one is the difference between a
sabotage suite and a suite that only ever says no.

**R4-7 was falsified by measurement rather than implemented.** The prediction was that an `enum` or
`namespace` in `claims.ts` would be misreported as copy drift. Under the new loader **that case no longer
exists** — a full transpile emits both, so the ledger loads and is compared normally. There is now a control
asserting an `enum` ledger with correct copy produces *no* problem while the same ledger with drifted copy is
still caught. The load-versus-drift split is still built and still needed, for the failures that do remain: a
value import, a relative import, `export { SomeType }`, unparseable source.

**The deferral register cites no line numbers at all**, and the Coder declined to mark `servicePages.ts`
for a reason worth keeping: inserting markers would shift lines again and re-rot the citations I had just
corrected. Instead the six sites are named **by content** in `DEFERRED_09B_SOFTWARE_INVENTORY` under the
grep-able marker `09b-SOFTWARE-INVENTORY`, and asserted to resolve **exactly once each** on every run. It
re-counted independently and made it **six**, confirming my count and my line numbers against QA round 4's
five.

**The sweep now agrees with itself three times and with a second instrument.** Three consecutive runs of the
byte-identical spec: `SLA_ROUTES=57 FINDINGS=0 FAILED=0 neverSettled=0`. QA's independent
`qa-p09a4-stabilised-sweep` returns the same. And loud failure was *proved*, not asserted — forcing every
route to look unsettled produced *"every public route must SETTLE and render — an unrendered route is not a
clean route"*, naming each route with its character count, and **`/` reported 4891 characters, matching QA's
round-4 measurement exactly**. Two instruments built independently, converging on the same number, is the
strongest evidence this phase has produced about its own measurements.

**Carried and named, not buried.** Five tests went flaky-then-green under load — landing-anchors, the
landing-process-flow connector matrix, motion-grammar hover, `qa-p09a3-cad-dom`, `qa-f4-font-guard` — none in
a file C5 touched, and QA round 4's baseline recorded **none**; the Coder said machine contention is likely
but that it cannot rule out latent flake, which is the honest form. `deferred-class-register` will turn the
gate **red when 09b legitimately removes one of the six sites** — deliberate, with a message saying to delete
the register entry, but a new red-on-legitimate-edit surface 09b must be told about. The gate now loads the
TypeScript compiler, ~0.7–1.0 s, 2.6 s → ~3.5 s. `npm run lint` is down from 4 pre-existing errors to 3, all
in DO_NOT_TOUCH files.

**And an out-of-scope finding worth routing.** **Node 20 reached end of life on 2026-04-30**, and CI pins it
for all six jobs. That is now fully decoupled from this gate — which is the point of the route taken — but an
EOL runtime on every job is a real hygiene item for a later phase.

**QA round 5 dispatched** — the closing round — to a fresh, pre-provisioned `wt/qa-p09a5` at `80b2c87`,
packet `.work/packets/phase-09a-QA-R5.md`, **citing integration-branch hashes** after round 4 caught me
quoting coder-branch ones. Its targets: attack the new loader for a runtime-import escape and for divergence
from what Vite bundles; re-run its own round-4 sabotage against the new gate and try one C5 did not — making
an instrument **silently pass** rather than deleting it; count the six sites itself, because two of us
agreeing is not proof; and argue the flake question rather than assert it.

#### QA 09a round 5 — PASS. Phase 09a closes.

Six commits integrated as `edf5c0e..8c07415`; scope clean, `reports/qa/phase-09a-r5/**` and
`scripts/qa-probes/p09a5-**` only, no spec added, `.env` not committed, nothing submitted or inserted.
**376 Playwright passed, 280 gate controls, 101 probe assertions**, one failure — `visual-375 journal-lead`
— green on re-run and in all three sibling viewports.

**VERDICT: PASS. Phase 09a is closed.**

**The loader holds where it matters and the sentence describing it does not.** The ledger as committed is
clean: **0 surviving import/export-from statements, 0 diagnostics** under the gate's own compiler options,
and `verbatimModuleSyntax` earns its line — exactly one class, a value-syntax import used only in type
position, is elided without it. But the universal asserted at `claims-gate.mjs:857-865` is **false**: **6 of
7 runtime imports resolved with the gate reporting `clean`, and in 5 the imported code executed inside the
gate process** — `node:*` builtins, bare builtin names, absolute `file:` URLs static and dynamic, and
`createRequire` with an absolute path. The true statement is narrower and still sufficient: *a specifier that
resolves relative to the importing module's location cannot resolve* — which covers every form a real
`claims.ts` could grow. Sharpest detail: the `.ts` absolute-URL escape works on a **stripping** Node and not
on a non-stripping one, so the escape surface is not runtime-independent even though the loader now is.

**The instrument controls are real and the claim around them is again too wide.** QA re-aimed its own
round-4 sabotages at the new shapes — the p09a4 probes now throw `search text NOT FOUND`, which is itself
evidence the code moved — and got **11 red, exactly as C5 claimed, including the registry-drop question,
answered no**. Then **six sabotages left `PASS — 280 controls green`**. Three are one line:
`if (ledgerFile === CAD_LEDGER_FILE) return [];` and two siblings. **The parameterisation C5 added so that
the controls could exist is precisely what makes the production call distinguishable from the control call**,
and no control invokes any of the three with production defaults. Worse and simpler: `runCheckControls()`
returning `[]` silences all sixteen **while the header still prints `280 (0 failed) … 16 watch`**, because
`:3361-3362` reads `CHECK_CONTROLS.length` and `NON_RULE_CHECKS.length` — static array lengths. I verified
that at the source.

QA also falsified its **own** first remedy: asserting the *absence* of a problem is satisfied by `return []`,
measured still-green. Its second — demanding a positive disagreement on the production path — goes red. That
self-correction is worth more than the finding.

**Detector (D): 31/31 with both over-catches closed, and six holes from the other side.** The best of them:
`"Tüm dosyalarınızı kabul ediyoruz"` — **the string the comment names as one that must fire** — goes silent
the moment any second-person clause follows it, because `SENTENCE_BREAK` (`:593`,
`/[\n]|(?<=[^\d\s])[.!?](?=\s)|["'\`]\s*,/g`) does not break on `;`. Verified at the source. All six latent;
nothing in the tree today.

**The register: 6/6 resolve exactly once, and my count is confirmed — but I owe QA a correction.** I wrote
that QA had reported the class as five sites and that I was correcting it to six. **QA had it right in round
4**: it said the *citation's union* was five and explicitly named `:3318` as the omitted sixth. My "correction
to QA's correction" corrected something QA had not got wrong. The lines stand: `:788 :793 :811 :818 :3318
:3332`. QA also raised and then **falsified its own by-product finding** — `RestoredLandingSections.tsx:42`
offers Parasolid/SolidWorks, but `grep Parasolid dist/` is empty; it reaches only the dev-only
`/legacy-landing`.

**The flake question, argued rather than asserted, and this is the answer three rounds have been circling.**
None of C5's five reproduced — 163 critical tests green at `retries=0`. QA got a sixth, round 3's. Contention
triggers it, and the CDN measured **65–303 ms with zero errors** immediately after. **Contention makes a test
slow, not wrong.** Three properties in `e2e/visual/fonts.ts` convert slow into a *misdiagnosis*: `:169`
asserts a network side effect with **zero tolerance** immediately before the tolerant `document.fonts` poll;
the retry budget is 4×15 s against a 60 s test timeout; and there is a live CDN dependency with no local
fallback. **That is why three rounds have disagreed about whether this is flake** — each was arguing about the
symptom. Pre-existing, untouched by C5, and now diagnosed.

**The through-line QA drew, which is about this run and not only about the gate.** Three rounds running, the
finding has been a **comment rather than code**: R4-1 was a comment gone false, R4-2 an over-catch defended by
a wrong comment, and all six defects here are true narrow behaviour under prose claiming something broader
than the controls demonstrate. *"The gate's engineering is good; its prose is consistently one step ahead of
its measurements."*

**That applies to me at least as much as to the gate.** This phase I published a severity reason that was
false in three places, framed two routes as equals when my own criterion had already chosen, quoted control
counts a commit stale, cited coder-branch hashes a reader could not resolve, and corrected a correction that
was not wrong. Every one was prose running ahead of measurement. The discipline that caught all of them was
the same one: an adversary whose job is to check the claim rather than the intent.

**Carried into 09b as an explicit hardening item — not a note.**

1. **D1/D2 — the loader and instrument prose.** Narrow the `:857-865` universal to what is true; make the
   three checks fail when guarded by a one-line identity test; make the header count what actually ran rather
   than an array length.
2. **Detector (D)'s six holes**, `SENTENCE_BREAK` and the report governor's reach.
3. **`e2e/visual/fonts.ts:169`** — the zero-tolerance network assertion, the 4×15 s budget against a 60 s
   timeout, and the absent local fallback. Three rounds of "environmental" end here.
4. **The six software-inventory sites** — `:788 :793 :811 :818 :3318 :3332`, one decision.
5. **`deferred-class-register` goes red when 09b legitimately removes one of the six.** Deliberate, message
   says to delete the register entry; QA judges an unbriefed agent would reach the right action, with two
   one-line message fixes (`"in this file"` points at `servicePages.ts` while the constant lives in
   `claims-gate.mjs`; `occurs 2` gets `occurs 0`'s advice).
6. **`metaDescription` is dead data on all 41 service pages** — SEO phase, not 09b.
7. **Node 20 is EOL as of 2026-04-30** and CI pins it for six jobs. Decoupled from the gate; hygiene.

---

### Phase 09a closed — PASS

Five correction rounds, five QA rounds. What it cost and what it bought:

- **`TeklifAl.tsx` 1540 → 418 lines** across twelve modules; static route closure **1629.48 → 816.79 kB**
  (−49.9 %), the WebGL stack behind an explicit request, reproduced by QA to the hundredth of a kB.
- **A live production exposure found by accident** and disclosed rather than buried: the rate limiter's
  source has never been deployed, and the deployed function reaches the insert for a missing e-mail, a
  malformed e-mail, a one-character customer and a `.txt` in `files`, with no 429 after fifteen requests in a
  minute.
- **A contrast defect only a rendered check finds** — 2.69:1 on a ground the phase itself created — fixed
  with a ground-bound role after **both** shapes QA and I proposed were falsified by measurement.
- **An unauthorised-claim sweep across eleven service pages and the whole 140-entry chatbot pool**, including
  four whole duration columns removed rather than half-neutralised, a warranty commitment, payment and credit
  terms, a discount schedule, a shift-pattern claim, and a wrong-city claim contradicted by four other
  surfaces.
- **A false CAD-format promise served selectively to exactly the visitors it harmed** — six phrasings scoring
  1.000 while the generic question reached the honest answer.
- **The gate: 26 → 31 rules, 178 → 280 controls**, including the first rule whose positive controls are the
  exact strings its own commit removed, and the first instruments in this repository that watch the checks
  that are not rules.
- **Two measurement instruments rebuilt after being found unsound** — the claims sweep that had been scanning
  routes which had not rendered, and three specs writing over committed evidence, now held by a census
  control rather than by a promise.
- **Falsifications, in every direction**: the Coder falsified two of my mandates as unbuildable and one as
  destructive; QA falsified my packet's criterion, my severity reason, my hashes, my control counts; I
  falsified two of the Coder's premises and one of QA's; and QA twice falsified itself, once about its own
  spec and once about its own proposed remedy.
- **Four agent stops** — two process kills, a rate limit, one unexplained — and **four recoveries at zero
  cost**, because a stopped agent's worktree is never removed. That rule earned its place more than any
  other.

**Still open and still the user's, defaulted safe throughout:** the four `public.rfqs` rows and three
`cad-uploads` objects are untouched, and nothing has been deployed — so the undeployed rate limiter remains
live on production.
