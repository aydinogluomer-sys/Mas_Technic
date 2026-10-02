# QA TASK PACKET — PHASE 09b-1 (with C1)

PHASE_ID: 09b-1-QA
INTEGRATION_HEAD: `cd0e53a` on `claude/awwwards-90-overhaul`
COMMIT RANGE, in **integration-branch** hashes: `183a323..cd0e53a`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p09b1` on `wt/qa-p09b1`, **already created and provisioned** —
`node_modules` junctioned, `.env` copied in. Do not commit `.env`.

## ⚠ THE PROHIBITION IS STRICTER HERE THAN ANYWHERE IN THIS RUN

The routes under test are the **auth routes**. **Do not sign in, sign up, request a password reset, trigger
an OAuth redirect, or call any Supabase auth method against the live project.** A reset request sends real
mail to a real address; a sign-up creates a real user. Also unchanged: no RFQ submit, no edge-function
invoke, no storage upload, no row insert, no deploy. The four `public.rfqs` rows and three `cad-uploads`
objects are untouched evidence of an unresolved user decision.

Use the pattern this phase established and the Coder ran at `allowed 0`: intercept and abort every
non-loopback request, and **prove the interception with a live canary before touching any control.**

`U1`–`U14` are carried. **Do not attempt U1–U7.**

## WHAT IS UNDER REVIEW

09b-1 (7 commits) migrated `/giris`, `/sifremi-unuttum` and `/reset-password` into the shell design system
and removed a security badge. C1 (5 commits) then fixed two things 09b-1 had proved but could not reach from
its allowlist: a control-boundary contrast failure, and social buttons with no failure path.

## WHAT I HAVE ALREADY VERIFIED MYSELF — do not re-prove

- **The badge is gone**, and the only surviving occurrence of the string in the tree is inside the comment
  explaining its removal.
- **`GoTrueClient.js:1868`** returns `{ data: { provider, url }, error: null }` unconditionally after
  `window.location.assign`, with **no request made** — so the old `if (error)` was unreachable.
- **The new roles are not root-scoped.** `--sf-control-rule` is re-bound at `shell.css:994` and `:1025` —
  the same two ground blocks as `--sf-rule` — which is the 09a `--sf-danger` trap avoided by construction
  rather than by care.
- Scope: 5 source files, 4 golden PNGs (one baseline × 4 viewports), 48 report files. Nothing else.

## THE FIVE THINGS I WANT

**1 — The boundary fix, on grounds the Coder did not name.** It reports worst case **3.47:1 against both
adjacent colours**, on a paper band nested inside a graphite root (`/sss`) as well as on graphite. Measure it
yourself, and go looking for a ground it did not: a paper band inside a paper root, a graphite band inside a
paper root, hover/focus/disabled/invalid states, and forced-colors / high-contrast if you can reach it. The
09a precedent is that a shared-role change fails on the *nested* case, and it was caught only because someone
looked for it.

**2 — The decorative classification, which is the part that could be wrong quietly.** The Coder changed 8
declarations and left the rest, proving non-change by measurement: **216 decor rows and 6 non-enclosing rows
byte-identical before and after**. Two judgement calls are named and I want a second opinion on both:
`a.tl-brand` (called a header grid divider) and `.shell-faq-source a` (called a link underline). If either is
actually a control boundary, it is a live 1.4.11 failure that this correction walked past. Its probe
*discovers* controls by walking bordered boxes rather than taking a list — run it, then try to find a
control it does not discover.

**3 — Fourteen crops that changed without failing.** This is the disclosure I most want examined. The Coder
reports fourteen golden crops contain **changed pixels that passed** because the YIQ delta (615) is under
pixelmatch's default cutoff (1409), all named in `reports/09b1c1/golden-adjudication.txt`. One baseline moved
— `waveb-notfound-body` at four viewports — and it moved only because the 404 body is a **paper** root, where
the delta is 1527 against the same cutoff. **Confirm the fourteen, and tell me whether a suite that passes
while its baselines drift under a threshold is a gate or a formality.** If a tolerance change would surface
them all at once, that is worth knowing before Phase 10 touches art direction.

**4 — The OAuth return leg, attacked.** Failure information arrives in the **fragment**, the SDK discards it
before clearing the URL, and `CustomerProtectedRoute`'s `<Navigate replace />` then erases it — so the Coder
reads `PerformanceNavigationTiming.name` to recover the original landing URL. Attack that: does it survive a
reload, a back/forward, a hash change, a direct paste, a second navigation in the same document? It claims a
hostile `error_description` leaks **0 of 4 needles and 0 script nodes** — try harder than four needles. And
check the deferral it admits: a reader already signed in when an attempt fails sees the notice only at their
next `Login` mount.

**5 — Regression and the honest gaps.** Full matrix, specs unedited, and **only** the four
`waveb-notfound-body` baselines moved. Then the three things it says it cannot know: whether `google` and
`linkedin_oidc` are enabled, whether `{origin}/musteri-paneli` is an allowed redirect URL, and whether GoTrue
serves `/authorize` errors itself rather than redirecting back — which, if it does, keeps the reader off this
site entirely and makes the whole return-leg fix unreachable in exactly the case it was built for. **Say
whether that last one makes the fix theatre or insurance.** Do not resolve any of the three with a live call.

## ALSO

- `.tl-menu-trigger` measures **2.20:1** and lives in `navigation.css`, outside C1's allowlist. The Coder
  argues it is not an *identification* failure because its three hamburger bars paint at 17.35:1 and "MENÜ"
  is visible at 1280. Judge that argument at 375, where the word may not be there.
- `.shell-check` on `/malzemeler` is a native checkbox drawn by the UA under `color-scheme: dark`; the Coder
  says its boundary is not reachable from CSS without rebuilding the control, and did not measure it. Verify
  the unreachability claim rather than the measurement.
- The label defect 09b-1 found in its own work — `.shell-field > label` never matching because `AuthField`
  nests the label — passed `tsc`, eslint, axe, a contrast census and every golden. **Is there a check that
  would have caught it?** If the answer is a cheap one, say so; that gap is worth more than most defects.

## WRITE_ALLOWLIST

```
e2e/qa-09b1-*.spec.ts          (new specs only)
e2e/fixtures/qa-09b1-**
reports/qa/phase-09b1/**
scripts/qa-probes/09b1-**
```

## DO_NOT_TOUCH — production code is READ-ONLY to you

```
src/**  scripts/claims-gate.mjs  index.html  public/**  .github/**  package.json  package-lock.json
e2e/__golden__/**              ← no --update-snapshots, at all, for any reason
e2e/*.spec.ts  e2e/**/*.spec.ts  ← every pre-existing spec, including your own from earlier rounds
reports/09b1/**  reports/09b1c1/**  reports/qa/phase-09a-*/**   ← the Coder's evidence and prior rounds'
scripts/qa-probes/p09a*-**     ← read and run them; do not edit them
supabase/**  PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  .work/packets/**  .claude/**  tsconfig.json  .env
```

If production code needs changing, **report it — do not change it.**

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once, then `PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`, checked
before binding. **Commit after every step** — five agents have stopped mid-run in this run and every time
only committed work survived.

## RETURN_FORMAT

```text
VERDICT:       PASS | FAIL
BOUNDARY:      your own measurements, including grounds and states the Coder did not name
DECOR:         the two judgement calls, and any control its probe fails to discover
CROPS:         the fourteen confirmed or not; gate or formality
OAUTH:         your attacks on the return leg; the hostile-input surface beyond four needles
GAPS:          the three unknowables — and whether the return-leg fix is theatre or insurance
MENU:          the 2.20:1 argument judged at 375
LABEL_GAP:     is there a cheap check that would have caught the never-matching selector
REGRESSION:    per project, specs unedited, only the four named baselines moved
DEFECTS:       file:line, severity, blocks or not
UNVERIFIABLE:  U1-U14 carried, plus anything new
```

Falsify me. Every round in 09a found something that changed the next packet, and the two most valuable
findings in this phase so far were both self-reported by the agent that made them.
