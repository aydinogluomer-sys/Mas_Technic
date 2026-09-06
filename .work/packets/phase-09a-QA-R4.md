# QA TASK PACKET — PHASE 09a, ROUND 4 (CLOSING ROUND)

PHASE_ID: 09a-QA-R4
INTEGRATION_HEAD: `184abf2` on `claude/awwwards-90-overhaul`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p09a4` on `wt/qa-p09a4`, **already created and provisioned** —
`node_modules` junctioned, `.env` copied in. Do not commit `.env`.

## ⚠ THE PRODUCTION-WRITE PROHIBITION — UNCHANGED, ABSOLUTE

**Nothing submitted, invoked, uploaded, inserted, or deployed.** The four `public.rfqs` rows and three
`cad-uploads` objects are evidence of an unresolved user decision — do not touch them. `U1`–`U12` are
carried; **do not attempt U1–U7**, every one needs a production write.

## THIS IS THE CLOSING ROUND, AND IT IS NARROW

Round 3 returned PASS on the content and design of 09a and I am not reopening any of it. This round verifies
**C4 and its addendum only** — ten commits, `8b5ee92..184abf2`, which changed the gate, three specs, and two
code comments. **No rendered copy changed and no golden should move.**

## WHAT I HAVE ALREADY VERIFIED MYSELF — do not re-prove these

I ran **your own harness** (`scripts/qa-probes/p09a3-pin-attacks.mjs`) against the fix, in three invocations,
and checked the worktree was clean after each:

```
A6-tuple-intact-derivation-appends-dwg    tsc=0 gate=1  caught by gate    ← was a HOLE
A7-tuple-intact-derivation-truncates      tsc=0 gate=1  caught by gate    ← was a HOLE
A10-pinned-file-prose-offer               tsc=0 gate=1  caught by gate    ← was a HOLE
A11-other-pinned-file-prose-offer         tsc=0 gate=1  caught by gate    ← was a HOLE
A8-whitespace-only-reformat               tsc=0 gate=0  correctly silent  ← was a FALSE POSITIVE
A9-single-quotes                          tsc=0 gate=0  correctly silent  ← was a FALSE POSITIVE
```

Gate on the tree: **PASS, 31 rules, 262 controls, 0 failed** — my run. And `grep` for the false
`metaDescription` sentence in `servicePages.ts` returns exactly one hit, at `:141`, quoted inside its own
correction and immediately followed by `YANLIŞTI`.

## WHAT I WANT FROM THIS ROUND

**1 — The mechanism, not the attacks.** The pin is no longer a type pin. `scripts/claims-gate.mjs` now
`await import()`s `src/content/claims.ts` and compares `CAD_UPLOAD_FORMATS` / `CAD_UPLOAD_EXTENSIONS` **as
values** against a canonical rendering of `CAD_ACCEPTED_EXTENSIONS` read from the authority. It can only do
this because that file's single import is an `import type` that Node's type-stripping erases — so the check
now *enforces* the no-runtime-imports property C3 asserted. **Attack the new mechanism the way you attacked
the old one.** Specifically: can the gate be made to import something that is not what the app bundles? Can
the canonical rendering and the app's rendering diverge? What happens on a Node without type stripping — the
Coder says it fails closed with an explicit message and tested both fail-closed paths; verify that, and
check whether CI could hit it.

**2 — The two checks that no control covers.** The Coder reports, and wrote into the code, that
`runControls` proves *rules* fire but knows nothing about `checkDerivedCadCopy` or `checkQualityResources`:
delete either function or drop it from the `clean` conjunction and **all 262 controls still pass and the gate
still reports PASS**. Verify that claim — it is the sharpest self-criticism in the packet and I want it
confirmed rather than taken. If it is true, say whether you see a way to cover it that a gate is allowed to
do (it may not mutate source at run time).

**3 — The three specs, and whether the class is actually closed.** All three now write to scratch on an
ordinary run and to committed evidence only behind an env flag. **Prove round 2's fifteen and round 3's
forty-six files are byte-identical after a full regression run** — the Coder proved it, and this is your
evidence, so prove it independently. Then: **grep `e2e/**` yourself for any remaining unconditional write
outside `test-results/`.** The Coder says these were the last three. That is the claim I most want a second
pair of eyes on, because the defect was found three times and each time it was "the last one".

**4 — The gate's new and widened rules, both directions.** 244 → 262 controls. `kazan[çc]`, detector (D),
`Mastercam` on `named-enterprise-system`, the re-aimed `:1221` control, and the two pins that now parse
rather than compare bytes. Check the widened rules did not start firing on anything they should not.

**5 — A wobble the Coder reported and did not chase, because it is your spec.**
`qa-p09a2-claims-sweep` reported `SLA_ROUTES=57` on one run and `56` on another in the same session, with
`FINDINGS=0` both times. That is a route rendering the authorised `1-3 iş günü` on one run and not the other.
**Determine whether it is a hydration-timing wobble in the measurement or a real intermittency in the
rendering.** If the measurement is flaky, that is a defect in your own spec and round 3's `SLA: 57 of 63`
finding rests on it.

**6 — Full regression.** `critical-1280`, `critical-375`, four visual projects, `qa-p09a-rfq-form`,
`qa-p09a2-*`, `qa-p09a3-*`, three `qa-p08-*` at `mobile-320`, `shared-shell-accessibility`. Specs unedited.
**No golden may move** — this correction changed no rendered copy. If one moves, that is a defect.

**7 — One judgement call I want a second opinion on.** The Coder gated two of the four D4 sites and
**refused the other two**, because any rule catching them catches all six live sites of the software-inventory
class I deferred to 09b — so writing the rule would take a decision that is not the gate's to take. It wrote
the deferral into the re-aimed control instead. I accepted this. Tell me if I was right, and whether the
deferral is discoverable where it was put.

## WRITE_ALLOWLIST

```
e2e/qa-p09a4-*.spec.ts          (new specs only, prefix qa-p09a4-)
e2e/fixtures/qa-p09a4-**
reports/qa/phase-09a-r4/**
scripts/qa-probes/p09a4-**
```

## DO_NOT_TOUCH — production code is READ-ONLY to you

```
src/**  scripts/claims-gate.mjs  index.html  public/**
e2e/__golden__/**                ← no --update-snapshots, at all
e2e/*.spec.ts  e2e/**/*.spec.ts  ← every pre-existing spec, INCLUDING your own from rounds 2 and 3
reports/qa/phase-09a-r2/**  reports/qa/phase-09a-r3/**   ← prior rounds' committed records
scripts/qa-probes/p09a3-**  p09a2-**   ← read and run them; do not edit them
supabase/**  PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  .work/packets/**
package.json  package-lock.json  .claude/**  tsconfig.json  .env
```

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once, then `PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`, checked
before binding. **Commit after every step** — this phase has lost two agents to process kills.

## RETURN_FORMAT

```text
VERDICT:       PASS | FAIL
MECHANISM:     your attacks on the value-import check, and the Node-without-type-stripping path
UNCOVERED:     whether deleting checkDerivedCadCopy / checkQualityResources goes unnoticed, and any fix
SPECS:         hash proof for r2 and r3, and your own grep for remaining unconditional writes
GATE:          new and widened rules, both directions, false-positive check
SLA_WOBBLE:    57 vs 56 — measurement flake or real intermittency, and what it means for round 3's finding
REGRESSION:    per project, pass/fail, specs unedited, goldens unmoved
D4:            whether the refusal was right and the deferral is discoverable
DEFECTS:       file:line, severity, blocks or not
UNVERIFIABLE:  U1-U12 carried, plus anything new
```

This is the round that closes 09a. If it passes, the phase closes on your verdict; if it does not, say so
plainly. Falsify me — you have in all three previous rounds.
