# QA REPORT — PHASE 09b-1 ROUND 2 (closing) + PHASE 09b-2

HEAD verified: `5592122` (09b-2 integrated) with QA commits on top; the 09b-1 C2 range `071fe23..63a7ddc`
is contained. Worktree `pdh-wt/qa-p09b1r2` on `wt/qa-p09b1r2`. Steps 1–5 are in
`01-tsc-and-inert.md` … `05-cad-drop.md`; 09b-2 in `06-09b2.md`. This file carries the regression matrix,
the two pre-existing reds, the figures, the guard, and the verdicts.

## `npx tsc -b` — real output, closing tree

```
$ npx tsc -b
EXITCODE=0
```

(no output; also exit 0 on `5592122` before my commits, and on `63a7ddc` at the start of the round — three
runs, all pasted in the commit history; the canary in step 1 proves the command reads `e2e/**`.)

## Regression matrix on the closing tree (`PLAYWRIGHT_PREVIEW_ONLY=1`, one project per invocation)

| project | result | notes |
|---|---|---|
| `critical-1280` | **82 passed**, 1 skipped, 0 failed | 6.5 m |
| `critical-375` | **81 passed**, 2 skipped, 0 failed | 5.0 m |
| `desktop-1280` | **210 passed**, 25 skipped, **1 failed → flake** | `footer-reveal.spec.ts:29 /iletisim` timed out at 60 s with no assertion error on a 33.6 m run (sla-wobble alone took 5.4 m); re-run `--repeat-each=2`: **10/10 passed**. Machine, not code. |
| `tablet-768` | **132 passed**, 103 skipped, **1 failed → pre-existing** | `motion-grammar.spec.ts:254`, §below |
| `mobile-375` | **161 passed**, 75 skipped, 0 failed | 18.9 m |
| `visual-1280` | **40 passed**, **1 failed → 09b-2 regression** | `radius-census.spec.ts:108`, §below. **No golden moved**; no `--update-snapshots` was run. |
| `visual-375` | **35 passed**, 6 skipped, 0 failed | |
| `smoke-webkit-*`, `smoke-firefox-*` | **BLOCKED (environment)** | `browserType.launch: Executable doesn't exist` — `ms-playwright/` now holds only `chromium-1228`; the WebKit/Firefox revisions round 1 used (`webkit-2311/2336`, `firefox-1532/1538`) are gone from this machine. Browser installation is out of bounds by the config's own rule. U17. |
| gated 09b-1 specs (`golden-drift`, `type-slot-census`) | **12 passed** at desktop-1280, writing to `test-results/`, committed evidence untouched | |
| `design-system-typography` | **5 passed** at desktop-1280 (baseline and after the CSS-mutation restore) | |
| `09b2-chat-consent-transfer` | **3 passed** | |
| `09b2-fragment-navigation` | **2 passed, 1 failed** (1/3 on repeat) | D-09b2-01 |
| `qa-p09a4-evidence-write-guard` | **RED 2/2 before gating → GREEN 3/3 after** | §guard |
| `node scripts/claims-gate.mjs` | PASS — 32 rules, 303 controls | |
| `npm run build` | exit 0 (1 m 40 s) | |

## The two pre-existing reds — confirmed and diagnosed

**`tablet-768` › `motion-grammar.spec.ts:254`.** Runtime: `expect(locator('.tl-dimension-lines')).toBeHidden()`
fails, `Received: visible`, at spec `:289-291`, whose predicate is `matchMedia("(hover:hover) and
(pointer:fine)")` — false on `tablet-768` (`hasTouch: true`). The stylesheet hides the element under
`@media (max-width:767px)` (`technical-landing.css:516`) — false at 768. A **pointer** predicate in the spec
and a **width** predicate in the CSS disagree exactly at 768 px with touch. Pre-existence is from history,
not from a rebuild: the CSS rule dates from `b6f2552` (2026-08-29) and the spec predicate from `1e88593`
(2026-09-02), both before 09b-1; the only CSS touch in C2 (`70ad6a3`) changed one colour on
`.tl-cad-drop`. Diagnosis confirmed. Not in any allowlist; `technical-landing.css` and
`motion-grammar.spec.ts` are Phase 10 (A23). For the Orchestrator.

**`button.tl-menu-trigger` at 2.16–2.20:1 on ten rows.** My own painted measurement on `/`
(`scripts/qa-probes/09b1r2-menu-trigger.mjs`, `menu-trigger.txt`): rest **2.133:1** at both 1280 and 375
(`rgb(68,72,72)` rule on `rgb(7,11,13)`), hover 3.71–3.75:1. The Coder's 2.164 is the computed composite;
painted is slightly lower. Rule is `navigation.css:165`, `--tl-rule` on the dark header, untouched by
09b-1/09b-2. Below SC 1.4.11 at rest. Not in any allowlist. For the Orchestrator.

## Figures

Playwright's bundled comparator, `playwright-core/lib/third_party/pixelmatch.js:64`:
`const maxDelta = 35215 * options.threshold * options.threshold;` → **1408.6 ≈ 1409** at the default 0.2.
The 7043 an earlier commit stated is `35215 × 0.2` (threshold not squared). C2's correction is right; my
round-1 figure was already 1409 (`qa-09b1-golden-drift.spec.ts:175`, `35215 * 0.2 * 0.2`). The three
control-boundary deltas — 752, 615, 1294 — are all below 1409, so all three were invisible to the visual
suite; confirmed.

**Does "a fifth of the range per pixel" survive?** Yes, stated as *linear* colour distance, which is what
the sentence meant: the metric is a squared distance, so a cutoff at `0.2²` of its range is a cutoff at
`0.2` of the linear range. For greys the arithmetic is exact — `delta = 0.5053·ΔY²`, so
`ΔY > √(1408.6/0.5053) = 52.8` levels out of 255 = **20.7 %**. A grey pixel must move about a fifth of its
range before the comparator counts it; 1294 corresponds to a 50.6-level move that still did not count. The
characterisation does **not** survive if read as "a fifth of the delta metric's range" — that would be 4 % —
and I am recording which reading is the true one.

## The evidence-write guard (item C)

Confirmed exactly as the coordinator found it: the guard walked both 09b-1 specs, saw the `writeFileSync`,
recognised a destination only as `path.join(process.cwd(), "…")`, and scored two files that write into
`reports/qa/phase-09b1/` on every run as zero sites. Both assertions passed on the empty set.

Done in two commits so the red is on the record:

1. `d9e4df5` — classifier rewritten to start from the write call: first argument read with balanced
   brackets and quotes; literal / template / `path.join(process.cwd(), …)` classify it; identifiers
   resolved through `const` declarations to depth 3 (the `outFile → outDir → path.join` shape of the
   09a-R4 specs); a write it cannot place becomes `<unclassified write>`, **unguarded**. Run on the
   ungated tree: **RED 2/2**, on exactly `qa-09b1-golden-drift.spec.ts` and
   `qa-09b1-type-slot-census.spec.ts`, `destination: "reports", guarded: false`, and nothing else.
   Two of my own drafts of that classifier were wrong first — a bare-literal matcher fired on every
   `"e2e/…"` string in comments, and a first-arg capture cut at the first `,` — both runs kept in the
   commit message.
2. `67db2e9` — the two specs gated behind `QA_09B1_WRITE_EVIDENCE=1` (scratch under `test-results/` by
   default), `EXPECTED` carries their four rows, and a **third test** feeds seven fixture strings to the
   classifier and requires a non-empty site for each shape it claims to see — and `<unclassified write>`
   for a shape it does not. The fixtures are write calls in strings, so the classifier (correctly) censused
   the guard itself; it is excluded from its own walk by name with the reason beside it. **GREEN 3/3.** The
   gated specs: 12 passed, committed evidence untouched, scratch output identical to committed modulo
   CRLF and one capture-noise row on the positive control.

**The rule, applied to my own round-2 instruments** (`4e29bfd`, `09b1r2-css-scope.mjs`): step 2's three
"zero" scans (ground-scoped, state-scoped, `em`) each re-run with one synthetic rule appended and each
found exactly one more — the zeros stand. Of the rest: gate-attack, gate-fence, stale-bound, rule2,
cad-drop and the reducedMotion probe each carry a non-empty control. **One fails the rule and is named:**
`09b1r2-gate-scope.mjs`'s bare-element census (Q1) has no positive control; its 136 buckets are evidence,
not an assertion.

## Defects — consolidated

| id | file:line | sev | blocks |
|---|---|---|---|
| D-09b1r2-01 | `playwright.config.ts:203` — `reducedMotion` in project `use` is inert; 4 non-golden `visual/**` specs run believing it | low | no |
| D-09b1r2-02/03 | `qa-09b1-type-slot-census.spec.ts:57-61,45-52` — one slot row and two routes contribute nothing (mine) | low | no |
| D-09b1r2-04 | `reports/09b1c1/probe-lib.mjs:45` — `guard()` does not cover WebSockets; 14 `.channel()` sites under `/musteri-paneli`,`/admin` | low | no (U15) |
| D-09b1r2-06 | `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo` tracked in git since `2cd03c1` | low | no |
| D-09b1r2-07 | `design-system-typography.spec.ts:217` — floor is a global sum; a route can drop to an error boundary unnoticed (S5: 1300 obs, 0 preconditions, green) | medium | no |
| D-09b1r2-08 | `design-system-typography.spec.ts:132-140` — 1973 bare observations in 136 buckets outside the census; FN-1 confirmed | medium | no |
| D-09b1r2-09 | `design-system-typography.spec.ts:85` — three shipped positional rules one class away from a false split | low | no |
| D-09b1r2-10 | `oauth-return.ts:369-376` — assertion rule not applied to the reference; all four deleted assertions reproducible in Turkish via `KOD:`, incl. combined with whitelisted prose and via the bounce | medium | no |
| D-09b1r2-11 | `oauth-return.ts:125-127` — "cannot be a phone number"; `destek_05551234567` renders | low | no |
| D-09b1r2-12 | `oauth-return.ts:229` — 30 s bound silences a genuine-shaped return at 36 s on 20×/2G here | low | no |
| D-09b1r2-13 | `ResetPassword.tsx:71,184` — renders `error_description` verbatim on an auth route; pre-existing | medium | no |
| D-09b1r2-14 | `navigation.css:165` `button.tl-menu-trigger` 2.13:1 painted at rest, 10 rows; pre-existing | medium | no (routing) |
| D-09b1r2-15 | `technical-landing.css:516` vs `motion-grammar.spec.ts:289` — width vs pointer predicate, red at 768+touch; pre-existing | low | no (Phase 10) |
| **D-09b2-01** | `ScrollToTop.tsx:53,93-98` — frame-bounded landing expires at ≥4× CPU / cold worker; `09b2-fragment-navigation.spec.ts:59` red 1/3 | medium | **yes** (09b-2 AC 5, 9) |
| **D-09b2-02** | `docs/lean/17-*.md:137` cites `ChatBot.tsx:294` for the launcher radius; 09b-2's ChatBot edit moved it to `:332`; `radius-census.spec.ts:108` red, deterministic. The register was outside the Coder's allowlist, which is the cause. | low | **yes** (09b-2 AC 9) |

## Unverifiable — carried

U1–U14 carried unchanged. New: **U15** the WebSocket transport is outside `guard()` and was not exercised;
**U16** rule 2's premise (a signed-in reader is never bounced) needs a session; **U17** WebKit/Firefox
smoke — browsers absent from this machine; last green on this code path is round 1's
`reports/qa/phase-09b1/pw-smoke-*.txt` on `63a7ddc`.

## VERDICTS

**VERDICT_09B1: PASS.** Every C2 acceptance item is evidenced on the head: `tsc -b` exit 0 (pasted, canary
proven), the `reducedMotion` fix restores intent (measured, four placements), the typography gate's figures
reproduce exactly and it goes red on a stylesheet-level ground-scoped defect it had never seen, the four
reader-asserting entries are gone from 47 rendered cases, rule 1 silences round 1's stale case and the clock
is exactly 30 s, `.tl-cad-drop` is ≥3.66:1 in all four states at both widths, no golden moved, and the
regression matrix is green apart from one flake and two reds that predate the phase. The defects above are
real and none is a violation of a C2 criterion; D-10 is the one I would route first.

**VERDICT_09B2: FAIL** on two criteria, both narrow. AC 5/9: the full-navigation fragment landing fails on a
cold worker and at ≥4× CPU because `HASH_SETTLE_FRAMES` is a clock standing in for "the route has mounted"
(D-09b2-01) — the spec is right and caught it. AC 9: `visual-1280` is red on a citation the ChatBot edit
moved and the packet's allowlist could not follow (D-09b2-02). Everything else holds: hosts observed and
published as a rule, the sentry premise fallen at the rendered DOM, D3 holding and widened, the inventory
ruling right with nothing false in its place, the chat filter keyed on state with a wire-level test, gate
32/303. Two correction items, one of them a line number.

**GUARD: RED 2/2 on the ungated tree (`d9e4df5`), GREEN 3/3 after gating (`67db2e9`)**, and the guard now
proves on fixtures that it can return a non-empty result.
