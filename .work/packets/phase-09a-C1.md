# CODER TASK PACKET — PHASE 09a, CORRECTION 1

PHASE_ID: 09a-C1
BASE_COMMIT: `3604194` (integration branch, QA 09a cherry-picked)
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a` on **`wt/coder-p09a1`**, clean, `.env` present, `node_modules` junctioned.

## ⚠ THE PROHIBITION FROM THE QA PACKET STILL APPLIES

**Do not submit the RFQ form against the live project. Not once.** No
`functions.invoke`, no storage upload, no `rfqs` insert, by any route. Your
predecessor wrote four rows and three objects to production by reasoning from
`supabase/functions/rfq-rate-limit/index.ts` in this repo — which validates —
without knowing the **deployed** function does not, and it had probed with a
duplicate primary key specifically so nothing could be written. It happened
anyway. Neither item below needs the network at all.

Do not touch the four rows or three objects; they are evidence of a decision the
user has not yet made. Do not deploy anything.

## ITEM 1 (BLOCKING) — the error label you shipped fails contrast on the ground you moved the page onto

QA measured, and I verified the mechanism at source:

- `src/styles/shell.css:1891` — `.shell-notice[data-tone="error"] .shell-notice-label { color: var(--tl-stamp); }`
- `src/styles/design-tokens.css:111` — `--tl-stamp: #8a4030`, **one fixed hex, no surface variant**
- On the graphite ground 09a moved `/teklif-al` onto (`TeklifAl.tsx:235`, `surface="graphite"`), that label measures **2.69:1 at 9px/600** against a 4.5:1 requirement — axe `color-contrast`, **serious**, at 1280 and 375.
- The identical markup on a paper ground measures **6.08:1**. The token was fine until this page used it.

**This is 09a's own defect, not inherited.** A20 recorded that `tone="error"`
had **zero** usages in `src/`; all five it now has are yours
(`RfqUploadStep.tsx:126,197`, `CadStageHost.tsx:39`, `RfqSubmitStep.tsx:154`,
`TeklifAl.tsx:315`). Both A20 error states are affected, and so are the
upload-failure, chunk-failure and parse-failure notices — same class, same
label.

**Why nothing caught it:** `shell-golden.spec.ts` deliberately does not
photograph page bodies, and `shared-shell-accessibility.spec.ts` audits
`/teklif-al` only in its default state, where no notice exists. QA's new
`e2e/qa-p09a-rfq-form.spec.ts` now covers the error state at both viewports and
will hold your fix. **It is QA's file — do not edit it.**

**Fix it at the token layer, not by recolouring one component.** QA names two
shapes: a graphite-scoped value for the error label, or a
`[data-shell-surface="graphite"]` override of `--tl-stamp`. Choose with a
measurement and say why. Constraints:

- The **paper** rendering must not change. `/__phase04-not-a-route__` is the only
  remaining paper surface (QA verified) and its goldens must not move.
- `--tl-stamp` is used elsewhere; check every consumer before you change the
  token itself. If a scoped override has a blast radius you cannot bound, a
  graphite-specific label colour is the safer shape — say which you measured.
- Report the measured ratio after, at 1280 and 375, for **all five** notice
  sites, not just the two A20 ones.
- Do not "fix" it by enlarging the label or changing its weight without also
  fixing the colour; 9px/600 at 2.69:1 fails on colour.

## ITEM 2 — three unverifiable turnaround claims on service pages

`src/data/servicePages.ts` publishes a production turnaround in three places:

```
:611   ["CNC İşleme", "1", "3-5 gün", "$$$$", "Yok", "Mükemmel"]
:2197  { label: "DFM Analizi", value: "3-5 gün" }
:2242  ["2. DFM Analizi", "3-5 gün", "DFM raporu + CAD revizyonu", "DFM onayı", "Portal + Toplantı"]
```

QA found these while verifying that you had removed the same class from
`/teklif-al`, and correctly recorded them as out of its scope.

**`USER_INPUTS.md` contains no lead-time, turnaround or delivery field at all** —
Orchestrator-verified by grep. So these are unverifiable public claims with no
authority behind them, and the run's standing instruction is to remove or
neutralise such a claim rather than let it ship. That instruction is not
phase-scoped, which is why this is in your packet and not carried.

**Remove or neutralise the duration, keep the row.** The pattern you already
used on `/teklif-al` is the model — the delivery selector now records a priority
("Termin teklifle birlikte verilir") and no duration anywhere. Do the same here:
the process step is real and stays; the number is the part nobody can
substantiate.

**Note for the record, not for you to fix:** `scripts/claims-gate.mjs` passes
with these in the tree, so it has no rule for turnaround claims — the same
shape as the round-1 finding that it has no revenue rule. That is a gate-coverage
item for a later phase; do not add a rule here.

## WRITE_ALLOWLIST

```
src/styles/design-tokens.css       (Item 1, if the token is where you fix it)
src/styles/shell.css               (Item 1)
src/components/rfq/**              (Item 1, only if the fix genuinely belongs at a call site)
src/data/servicePages.ts           (Item 2)
e2e/__golden__/**                  (only baselines your change explains; §12 protocol — expect NONE)
```

## DO_NOT_TOUCH

```
e2e/qa-p09a-*.spec.ts  e2e/qa-p08-*.spec.ts     ← QA's; all must stay green unedited
supabase/**                                      ← and no network calls to it
src/pages/Login.tsx  src/pages/SifremiUnuttum.tsx  src/pages/ResetPassword.tsx   ← 09b
src/pages/KVKK.tsx  src/pages/GizlilikPolitikasi.tsx  src/pages/CerezPolitikasi.tsx ← 09b
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx                        ← 09b
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts              ← R2-3, Phase 10 (A23)
scripts/claims-gate.mjs                          ← no new rule in this packet
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  reports/qa/**
package.json  package-lock.json  .claude/**  tsconfig.json
```

## ACCEPTANCE_CRITERIA

1. All five `ShellNotice tone="error"` sites measure **≥ 4.5:1** on graphite at 1280 and 375. Report each.
2. Paper rendering unchanged; `/__phase04-not-a-route__` goldens unmoved.
3. `npx playwright test e2e/qa-p09a-rfq-form.spec.ts` green, spec unedited — including its contrast lane.
4. axe: no serious or critical violations on `/teklif-al` in the **error state** at 1280 and 375.
5. "3-5 gün" absent from the rendered DOM of every service page that carried it; the process rows survive; nothing unverifiable replaces the number.
6. `node scripts/claims-gate.mjs` PASS; `npx tsc -b` exit 0; `npm run build` exit 0.
7. `critical-1280`, `critical-375`, four visual projects, three `qa-p08-*` specs at `mobile-320` — all green, no golden moved.
8. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation,
`> file 2>&1`, never `run_in_background`. Build once then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT` — I stopped a leftover
server on 4173, so check before assuming. Commit after every step; this run has
been interrupted four times.

## RETURN_FORMAT

```text
CONTRAST:   the shape you chose and why · measured ratio for all five sites at 1280 and 375 · paper unchanged, proven
TURNAROUND: the three sites, before and after, from the rendered DOM
GOLDENS:    expected none — confirm, or adjudicate any that moved
```

Falsify me. Nine premises fell in Phase 08 and three more in 09a, most of them
mine. If the token is the wrong layer, show the measurement.
