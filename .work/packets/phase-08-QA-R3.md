# QA TASK PACKET — PHASE 08, VERIFICATION ROUND 3 (closing round)

PHASE_ID: 08 (QA round 3, after correction packet C4)
CODE_COMMIT: `49a1af6` — integration branch `claude/awwwards-90-overhaul`
PRIOR_QA: your round-2 report at `reports/qa/phase-08.md`, in your tree.

## WORKTREE — PREPARED. DO NOT CREATE OR DELETE ANY WORKTREE.

```
C:\Users\Trade Bilisim\pdh-wt\qa-p08      branch: wt/qa-p08r3      at: 49a1af6
```

`node_modules` junctioned, `.env` present (A18). Two `.tsbuildinfo` artifacts
sit in the working tree — leave them alone, do not commit and do not revert.
If the harness auto-creates a worktree under `.claude/worktrees/`, ignore it.

## WHAT CHANGED SINCE ROUND 2

Three C4 commits, `6981a4d` · `3e2f7dc` · `c79147b`, packet at
`.work/packets/phase-08-C4.md`. C4 returned **PARTIAL**, deliberately.

Already done by the Orchestrator, do not repeat: scope audit (five files, no
`Login.tsx`, no `shell.css`, no `ia.ts`, zero goldens), adversarial scan of the
three legal files for retention/deletion/training/encryption/NDA claims (clean),
`critical-1280` 15/15 on a **fresh build**, and confirmation that
`qa-p08-storage-disclosure.spec.ts` is 5 passed / 1 failed with **both negative
controls passing**.

**Three premises were falsified in C4, two of them yours.** Read these before
you re-measure anything, because two of your round-2 conclusions were wrong:

1. My "smallest fix is one class" was wrong; both candidates measured inert.
   Your diagnosis was close but not exact — the 585.875px is the wrapper's
   **implicit grid track**, not the wrapper. `.shell-stack` sets `min-width: 0`
   on itself and not on its items, so `figure.shell-table` kept
   `min-width: auto`. This table's min-content is 585.875px because its key
   column carries unbreakable tokens (`mas_pending_cad_upload`).
2. **Your rename trigger does not reproduce.** `footerGroups` passed
   `family("Kabiliyetler")` as its own string literal, so an `ia.ts` rename
   never reached the map. A test written against the trigger you reported would
   have gone green over a live bug. The defect was real; the trigger was not.
3. **Your "≥1024" boundary is wrong.** Measured `grid-template-rows`:
   768/1024/1100/1180 are `150px 150px`, **1181** is `150px`. The switch is
   `--tl-cols` 12→6 at `@media (max-width:1180px)` (`design-tokens.css:160`) —
   not a footer rule.

None of this is a complaint. Round 2 found the two defects that mattered and
retracted its own round-1 claim in writing. It is here so you re-measure rather
than re-assert.

## THE DECISION YOU ARE IMPLEMENTING — A24

`e2e/qa-p08-storage-disclosure.spec.ts` test 3 asserts
`expect(cookies).toEqual([])` — "no cookie is created on any public route".
**Re-aim it** to: *every cookie observed on any public route is covered by the
published disclosure.*

This is an Orchestrator decision, recorded as A24 in `PROGRESS.md`, and the
reasoning is yours to write into the file the way Phase 04 wrote its own:

- The old assertion encoded a **published claim**, and it did its job — it held
  `/cerez-politikasi` to its word and it is how R2-2 surfaced.
- That claim has been retired **because it was false**. The document now
  discloses one cookie with its attributes.
- So the assertion no longer corresponds to anything the site asserts: it fails
  on a **correctly disclosed** cookie, which is not a defect.
- The new assertion is strictly stronger for the gate's purpose — it goes red
  the day an *undisclosed* cookie appears, which the old one could not
  distinguish from a disclosed one.
- It is also immune to the variance C4 measured: `.w.hcaptcha.com`'s ephemeral
  worker hostname produced **two** `__cf_bm` entries in one run and **one** in
  another, so any count-based assertion would flake.

**This is a re-aiming, not a weakening, and your file must say why.** Extend
both existing negative controls to the new assertion — a checker that passes
everything must remain distinguishable from a working one. If you think the
re-aim is wrong, say so with a measurement; I will take that seriously, and
your round-2 report already earned that.

Do **not** make it green by any other route. hCaptcha stays (Phase 09).

## MANDATORY_TESTS

### 1. The table reach — reconcile your instrument with C4's

Your round-2 probe reported the columns unreachable. C4 reports **24 of 24
cells reachable** at 320/375/390 after the fix, by real CDP touch drag and by
`End`, with `tabindex="0"`, `role="group"` and an `aria-label`. Both can be
right — the fix landed in between — but **measure it yourself** and report the
numbers, including 768/1280/1440, which C4 says are unchanged digit for digit.

### 2. Write the guard that would have caught R2-1 (this is the round's most valuable output)

C4's comment names it, and it is right: nothing in the suite can see this
failure class. `documentElement.scrollWidth − clientWidth <= 1` measured **0**
at all three widths while three of four columns were unreachable, because
`div.shell-root` computes `overflow-x: clip` — which, unlike `hidden`, is not
programmatically scrollable either. axe cannot see it either.

Write a spec that walks **every** `.shell-table-scroll` on every public route
and asserts the table either fits its box or its box is a genuine scroll region
(`scrollWidth <= clientWidth + 1 || isScrollable(el)`), at 320 and 375 at
minimum. C4 suggests it belongs beside
`e2e/landing/shell-cascade-contract.spec.ts`'s "scrollable regions stay keyboard
reachable" lane, which passed here for the wrong reason — that is a strong hint,
but it is a production spec file and therefore **not yours**; put it in a
`qa-p08-*` spec. Give it a negative control.

This is the gate that turns a defect found by eye into one found by CI.

### 3. The eight rewritten sentences, from the rendered DOM

C4 repaired eight, not the five the packet listed — it added the page lede, the
clause-01 title and the **`metaDescription`**. Verify all eight render as
quoted, and verify:

- nothing anywhere asserts what hCaptcha or Cloudflare do **after receipt**;
- madde 01's second sentence is byte-identical (it was true and had to survive);
- `/kvkk` madde 04 carries **no numeral** at all now, so the enumeration cannot
  go stale the way "iki hâlde" and "üç hâlde" both did — and the supplier
  transfer is now *inside* the enumeration;
- `__cf_bm` is correctly **absent** from the madde 02 table (that table is
  "Yerel depo kayıtları" and its note says these are not cookies and are
  readable only by this site's pages — `__cf_bm` is the opposite on both
  counts). Confirm the reasoning holds rather than just the absence.
- exactly one link, no `#` fragment, in the clauses that cross-reference.

### 4. The footer invariant, with the corrected trigger

Your original trigger was wrong. The edit that actually zeroes a link is the
**two-step** one: rename the family in `ia.ts` *and* update the map key to
follow it. Verify the new route-keyed `adoptingColumn()` holds the invariant —
every `resourceLinks` entry appears in the footer exactly once — under: today,
rename-only, and rename-plus-map-update. Confirm `bantOrani` is still
`0.23203125` and columns 5/6/5/6.

### 5. Full regression — this is the closing round

All viewports, all four visual projects, cross-browser smoke, contrast, the
whole-page axe lane. No golden may move; C4 moved none and ran no
`--update-snapshots`. Confirm that independently.

### 6. The two carried criteria and the two carried reds

- Criteria 3 and 5 — CARRIED per A21 and A20. Re-measure, report as carried,
  say if either got worse. Do not re-fail the phase on them.
- R2-3 (`motion-grammar.spec.ts` at `tablet-768` / `landscape-844`) — carried to
  Phase 10 per A23. Confirm it is still red and still for the same reason, and
  confirm no Phase 08 commit has touched either file.

### 7. One polish judgement I want your eye on, not a defect

C4 reports the madde 02 rows are very tall at ≤390, with blank space in the
visible strip, because the third column wraps inside the scroll port. Every cell
is reachable, so this is not a defect. C4 suggests shortening the
`mas_intro_seen` description but did not, because you verified all four of that
row's claims true. **Look at it and tell me whether it ships.** If your judgement
is that it does not, say what the smallest honest shortening is — a row whose
truth survives.

## READ_ONLY_PRODUCTION_PATHS

All `src/**`, `index.html`, `public/**`, `supabase/**`, `docs/**`,
`playwright.config.ts`, `scripts/**`, every existing non-`qa-` `e2e/**` spec and
every golden. `--update-snapshots` is forbidden, for any reason. A mismatching
golden is the finding.

## QA_WRITE_ALLOWLIST

```
e2e/qa-p08-*.spec.ts            (including the re-aimed test 3 and the new scroll-region guard)
reports/qa/phase-08.md          (rewrite as round 3; keep rounds 1 and 2 legible)
reports/qa/phase-08/**
```

Nothing else. `PROGRESS.md`, `IMPLEMENTATION.md`, `USER_INPUTS.md`, `.claude/**`,
`tsconfig.json` and `*.tsbuildinfo` are not yours.

## COMMANDS_TO_RUN — machine

- 8 GB RAM, **one heavy process at a time**, nothing else running.
- Ports 4173/4187/4190/4191/4199/4205/4207 — check before use; I have been
  clearing orphans as they appear. `PLAYWRIGHT_PORT=<free port>` selects one.
- A cold `npm run build` has died with `write ENOMEM` here at ~1 GB free. Build
  once successfully, then `PLAYWRIGHT_PREVIEW_ONLY=1` for later suites.
- Playwright: one `--project=` per invocation, **foreground**, chunked. Never
  `run_in_background`.
- Redirect with `> file 2>&1`. PowerShell pipelines buffer to the end and leave
  a 0-byte file if the process is killed.
- `installFontRetry()` flaked 3× for you and 1× for C4 at visual-375, always
  clean on isolated re-run. Known, unrelated, Phase 12 input. Do not fix it.
- Ad-hoc probes: config expects `chromium-1217`, a different build is installed;
  pass `executablePath: "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"`.
- `scripts/claims-gate.mjs` resolves `REPO_ROOT` from its own location; run in
  place.
- PowerShell is primary; switch if Bash returns a classifier error.

## HOW TO NOT LOSE WORK

**Commit after every step.** You were killed mid-round-2 by a process exit and
lost nothing because three step commits were standing; a Coder was stopped by
the user and lost nothing because it had not started. This run has now been
interrupted three times. Assume a fourth.

Every measurement goes to a file the moment you take it. Evidence files end in
`.txt`, not `.log` (`.gitignore:3`).

## REPORT_PATH

`reports/qa/phase-08.md`, rewritten as round 3. Keep rounds 1 and 2 legible —
including your own retraction, which is part of the phase's record and does you
credit. State plainly what you re-measured, what you could not verify, and what
you are handing to Phase 09, 10 and 12.

## RETURN_FORMAT

Your agent definition's structure, plus:

```text
TEST3_REAIMED:  the new assertion, its controls, and your justification (or your argument against A24)
NEW_GUARD:      the scroll-region spec — what it walks, what it caught, its negative control
TABLE_REACH:    your own numbers at 320/375/390/768/1280/1440, reconciled with C4's
LEGAL_EIGHT:    the eight sentences verified from the DOM, plus anything you could not source from the repo
FOOTER:         the invariant under all three rename scenarios
CARRIED:        criteria 3 and 5, and R2-3 — still carried, still the same, or worse
POLISH:         your judgement on the ≤390 row height — ships or does not, and the smallest honest fix
VERDICT:        PASS | FAIL. If FAIL, the exact criterion and the smallest fix.
```

Falsify me. Three premises fell in the last round — mine and two of yours — and
the phase is better for it. Report what you measured.
