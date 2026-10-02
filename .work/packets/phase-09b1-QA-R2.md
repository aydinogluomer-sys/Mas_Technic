# QA TASK PACKET — PHASE 09b-1, ROUND 2 (CLOSING)

PHASE_ID: 09b-1-QA-R2
INTEGRATION_HEAD: `63a7ddc` on `claude/awwwards-90-overhaul`
RANGE UNDER REVIEW, integration-branch hashes: `071fe23..63a7ddc` (C2 and its addendum)
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p09b1r2` on `wt/qa-p09b1r2`, **already created and provisioned**.
Do not commit `.env`.

**A Coder is working in parallel on 09b-2** — the legal pages, `ChatBot.tsx`, `ScrollToTop.tsx` and
`servicePages.ts`. Those files are **not** under review here and may change under you. Verify the head you
were given and say so; do not chase a moving tree.

## ⚠ PROHIBITION — UNCHANGED, STILL STRICTER NEAR AUTH

No sign-in, sign-up, password-reset request, OAuth redirect, or Supabase auth call against the live project.
No RFQ submit, edge-function invoke, storage upload, row insert, or deploy. Canary-proven interception before
any control. `U1`–`U14` carried; **do not attempt U1–U7**.

## THIS ROUND EXISTS BECAUSE OF SOMETHING YOU GOT WRONG

Round 1 returned PASS and reported **`tsc` clean**. It was not. `npx tsc -b` failed with exit 2 on the head
you passed, on **two `TS2353` errors in your own spec files** — `qa-09b1-golden-drift.spec.ts:92` and
`qa-09b1-type-slot-census.spec.ts:97` — and `reports/qa/phase-09b1/tsc.txt`, committed as the evidence, is
**0 bytes**. I verified both, and I also merged it without running the build, so the miss is shared.

**And the type error was the smaller half.** `reducedMotion` has **0 occurrences** in
`node_modules/playwright/lib/` — I confirmed it — so it is not a Playwright *test* option at all. Your
`test.use({ reducedMotion: "reduce" })` was a type error **and a silent no-op**: both specs believed they
captured under reduced motion and did not. The Coder measured four forms and only `contextOptions` and
`emulateMedia` reach the page.

**Start there.** Verify the fix restores the intent rather than deleting it, that both specs still assert what
they were written to assert, and that their committed evidence is unchanged. Then ask the harder question:
**what else in your own instruments is inert in the same way?** A setting that silently does nothing is the
failure mode this phase keeps finding, in the gate's prose, in a never-matching selector, in a project config,
and now in your own fixtures.

## WHAT I HAVE ALREADY VERIFIED

- `npx tsc -b` exits **0** on `63a7ddc`.
- `reducedMotion`: 0 occurrences in `playwright/lib`.
- `.tl-cad-drop` no longer carries a hardcoded hex.
- C2 scope: 9 source/test/probe paths + 36 evidence files + 2 of your specs. **No golden moved.**

## WHAT I WANT

**1 — The new permanent gate, attacked.** `e2e/design-system-typography.spec.ts` holds *a component the
design system defines must compute the same typography everywhere it appears*. It went **universal** on a
measured scope — 256 components, 1730 observations, 0 splits. Attack that scope: find a component that
legitimately varies by ground, viewport, or state and that the gate would call a violation. Find one it
should catch and does not. It was proved red by reverting the historical fix; **prove it red a different
way.** Its author also made it lie once under a corrupted environment and then fenced that with two
preconditions — check the fence holds, and note that the first control written for it did not fire because an
aborted chunk reaches an error boundary rather than staying in suspense.

**2 — The OAuth notice, after capability was removed.** Four reader-asserting `COPY` entries are gone
(`user_banned`, `identity_already_exists`, `email_exists`, `provider_email_needs_verification`) and `COPY` is
now a `Map`. Re-run your round-1 attacks: all five inherited names, your 17 hostile payloads, and the
prose-choice surface that produced "HESAP KAPALI". **Then find what the removal missed** — is there any
remaining code, or any combination, that still asserts a fact about the reader on the strength of a fragment?
The reference filter is disclosed as still admitting `sifrenizi_yeniden_girin`; judge whether that matters.

**3 — The stale bound, which is shape-first and not a clock.** The entry record is read only when the
document was fetched at `/musteri-paneli`; age is a second rule at 30 s. Its author falsified its own clock
by measuring that a genuine return takes 9–13 s on a throttled phone against your 20 s stale case. **Attack
the shape rule**, and check the disclosed hole: `RETURN_MAX_AGE_MS = 30_000` silences a genuine return on a
20× CPU / 2G profile when the document is 83–89 s old. Rule 2, the signed-in-then-signed-out case, is
reasoned from mechanism and measured only in the direction that does not fire — say whether that is
sufficient.

**4 — `.tl-cad-drop`, and the ground it now lives on.** It takes `--tl-paper-control-rule` and measures
3.672:1 against both fill and ground. Measure it yourself, on `/`, at 1280 and 375, off painted pixels as you
did in round 1 — and check the drop zone's **hover, drag and focus** states, which change `border-color` and
`background` and which round 1 never reached because the element was not in its route list.

**5 — Regression, and two pre-existing reds now diagnosed.** `tablet-768` motion-grammar:254 fails, and the
Coder reproduced it on the BASE build: `technical-landing.css:516` hides `.tl-dimension-lines` on a
**width** predicate while the spec asserts on a **pointer** predicate, and at 768 with touch they disagree.
Confirm the diagnosis and the pre-existence. `button.tl-menu-trigger` is now disclosed as an enclosing
control boundary at 2.16–2.20:1 on **ten** route×viewport rows, two of them added by this round on `/`.
Neither is in any allowlist yet; both are for me to route.

**6 — The figure I carried downstream.** C2 corrected its own arithmetic: pixelmatch's cutoff is
`35215 × threshold²` = **1409**, not the 7043 an earlier commit stated. Your round-1 figure of 1409 was
already correct. Confirm the corrected claim — that 1409 is wide enough to have hidden all three
control-boundary changes this phase made (752, 615, 1294) — and say whether your "a fifth of the range per
pixel" characterisation survives the corrected constant.

## WRITE_ALLOWLIST

```
e2e/qa-09b1r2-*.spec.ts      e2e/fixtures/qa-09b1r2-**
reports/qa/phase-09b1r2/**   scripts/qa-probes/09b1r2-**
```

## DO_NOT_TOUCH

```
src/**  scripts/claims-gate.mjs  index.html  public/**  .github/**  package.json  package-lock.json
e2e/__golden__/**            ← no --update-snapshots, at all
e2e/*.spec.ts  e2e/**/*.spec.ts  ← including your own, and including the new typography gate
reports/09b1/**  reports/09b1c1/**  reports/09b1c2/**  reports/qa/phase-09a-*/**  reports/qa/phase-09b1/**
scripts/qa-probes/p09a*  scripts/qa-probes/09b1-*  scripts/qa-probes/09b1c1-*
src/pages/KVKK.tsx  GizlilikPolitikasi.tsx  CerezPolitikasi.tsx  src/components/ChatBot.tsx
src/components/ScrollToTop.tsx  src/data/servicePages.ts   ← a Coder is in these RIGHT NOW
supabase/**  PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  .work/packets/**  .claude/**  tsconfig.json  .env
```

**Report `npx tsc -b`'s exit code explicitly in your return, with the command's real output pasted.** Not a
file, not a summary — the output.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. A Coder is running in parallel; if the machine is contended, say so rather than
reporting a slow test as a defect. **Commit after every step.**

## RETURN_FORMAT

```text
VERDICT:       PASS | FAIL
TSC:           the command, its real output, its exit code
INERT:         what else in your instruments does nothing, found by looking rather than by luck
GATE:          your attacks on the typography gate — scope, false positives, false negatives, the fence
OAUTH:         re-run attacks after the capability removal; what the removal missed
STALE:         the shape rule attacked; the 83-89s hole; whether rule 2's one-direction proof suffices
DROP:          your own painted measurement on /, including hover, drag and focus
REGRESSION:    per project; the two pre-existing reds confirmed and diagnosed
FIGURES:       1409 confirmed; whether your "fifth of the range" survives it
DEFECTS:       file:line, severity, blocks or not
UNVERIFIABLE:  U1-U14 carried, plus anything new
```

Round 1's most valuable output was proving a check this phase had written off as impossible. Its worst was a
zero-byte file under a claim of green. Both are yours; this round is where you show which one is
characteristic.
