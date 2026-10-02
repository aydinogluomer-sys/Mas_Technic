# QA TASK PACKET — PHASE 09a, ROUND 5 (CLOSING ROUND)

PHASE_ID: 09a-QA-R5
INTEGRATION_HEAD: `80b2c87` on `claude/awwwards-90-overhaul`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p09a5` on `wt/qa-p09a5`, **already created and provisioned** —
`node_modules` junctioned, `.env` copied in. Do not commit `.env`.

**Commit range under review, in integration-branch hashes:** `9761249..80b2c87`. Round 4 caught me citing
pre-cherry-pick hashes that exist only on a coder branch; these are the ones you can actually diff.

## ⚠ THE PRODUCTION-WRITE PROHIBITION — UNCHANGED, ABSOLUTE

**Nothing submitted, invoked, uploaded, inserted, or deployed.** The four `public.rfqs` rows and three
`cad-uploads` objects are untouched evidence of an unresolved user decision. `U1`–`U14` carried;
**do not attempt U1–U7**, every one needs a production write.

## NARROW. C5 ONLY — two files.

Rounds 3 and 4 settled 09a's content, design and regression. This round verifies **C5**: six commits touching
`scripts/claims-gate.mjs` and `e2e/qa-p09a2-claims-sweep.spec.ts`, and nothing else. No rendered copy
changed, so **no golden may move**.

## WHAT I HAVE ALREADY VERIFIED MYSELF

- `node scripts/claims-gate.mjs` → **PASS, 31 rules, 280 controls, 0 failed, 16 of them watching the 3 checks
  that are not rules.**
- `node --no-experimental-strip-types scripts/claims-gate.mjs` → **PASS, identical output.** R4-1's blocking
  condition is gone.
- `git diff --name-only ffe3c0b..80b2c87` is exactly those two files. `.github/workflows/playwright.yml`,
  `package.json` and `package-lock.json` are untouched.
- `typescript ^5.8.3` was already a devDependency, so the new loader adds **no package** — which matters,
  because `CLAUDE.md` forbids adding one.

## THE FIVE THINGS I WANT

**1 — Attack the new loader.** C5 replaced Node's type stripping with `ts.transpileModule` using the repo's
own compiler, `verbatimModuleSyntax: true`, emitting to `mkdtempSync(tmpdir())` and importing from there.
The claim is that the "bare Node process" property is **tightened**, not traded: only an explicit
`import type` is erased, and any surviving import must resolve from a directory with no `node_modules`, no
`@/` alias and no relative neighbours, so a value import throws `ERR_MODULE_NOT_FOUND`. **Try to get a
runtime import past it.** Also: can the transpiled artefact and what Vite bundles diverge? Does the temp
directory leak, collide between concurrent runs, or survive a crash? What happens when `typescript` is absent
or a different major?

**2 — The instrument controls, which are the answer to your own round-4 finding.** You proved that deleting
`checkDerivedCadCopy` or `checkQualityResources` left all 262 controls green. C5 says that is now impossible
and adds a third instrument, `deferred-class-register`. **Re-run your round-4 in-memory sabotage against the
new gate** — `scripts/qa-probes/p09a4-*` is on the branch, read it and run it, do not edit it. Sabotage each
of the three checks, the `verdict()` function, and registry membership. C5 reports ten sabotages and ten red
gates. Confirm, and try one it did not: can an instrument be made to *silently pass* rather than be deleted —
returning `[]` unconditionally, or being dropped from the registry while its function still exists?

**3 — The sweep, three ways.** C5 reports `SLA_ROUTES=57 FINDINGS=0 FAILED=0 neverSettled=0` on three
consecutive runs of the byte-identical spec, agreeing with your own `qa-p09a4-stabilised-sweep`. And it
proved loud failure by temporarily forcing routes to look unsettled, getting *"every public route must SETTLE
and render — an unrendered route is not a clean route"* with `/` at 4891 characters — **matching your
round-4 measurement exactly**. Verify the fix on your own terms, and say whether rounds 2 and 3's findings
now rest on something you trust.

**4 — Detector (D) and the deferral register.** Detector (D) now has two two-condition discriminators;
re-run your 31 adversarial strings plus the two over-catches, and try to find a hole the second condition
opens. The deferral is now a content-addressed register under marker `09b-SOFTWARE-INVENTORY`, asserted to
resolve **exactly once each** every run, citing no line numbers. Confirm all six sites resolve, and confirm
the count is six — you reported five in round 4; I re-counted at the source and made it six
(`:788 :793 :811 :818 :3318 :3332`), and C5 independently made it six too. If you still make it five, say so
and show the work; two of us agreeing is not proof.

**5 — Regression, and five flaky tests.** Full matrix, specs unedited, **no golden moves**. C5 reports five
tests flaky-then-green under load — landing-anchors, landing-process-flow connector matrix, motion-grammar
hover, `qa-p09a3-cad-dom`, `qa-f4-font-guard` — none in a file it touched, and **your round-4 baseline
recorded none**. Determine whether these are machine contention or latent flake. This is the one item where
"environmental" is the convenient answer, so I want it argued rather than asserted.

## ALSO WORTH YOUR JUDGEMENT

- **C5 falsified my packet's framing and I have accepted it.** I offered two routes for R4-1 as equals. They
  were not: my own acceptance criterion 1 required the gate to run on a Node *without* stripping, which
  raising `NODE_VERSION` cannot satisfy — it moves the blocking jobs onto a stripping Node and leaves the
  gate unable to run anywhere else. Tell me whether you agree the criterion had already decided it.
- **A new red-on-legitimate-edit surface.** `deferred-class-register` will turn the gate red when 09b removes
  one of the six sites. C5 says that is deliberate and the message says to delete the register entry. Judge
  whether the message is clear enough that an agent who has never read this packet would do the right thing.
- **Node 20 reached end of life on 2026-04-30** and CI pins it for all six jobs. Now fully decoupled from
  this gate. Confirm the decoupling; the EOL runtime itself is a hygiene item for a later phase, not yours.
- **R4-7 was falsified by measurement**: under the new loader the `enum`/`namespace` case no longer exists,
  because a full transpile emits both. There is a control asserting an `enum` ledger with correct copy
  produces no problem while the same ledger with drifted copy is still caught. Verify that control does what
  it says.

## WRITE_ALLOWLIST

```
e2e/qa-p09a5-*.spec.ts          (new specs only, prefix qa-p09a5-)
e2e/fixtures/qa-p09a5-**
reports/qa/phase-09a-r5/**
scripts/qa-probes/p09a5-**
```

## DO_NOT_TOUCH — production code is READ-ONLY to you

```
src/**  scripts/claims-gate.mjs  index.html  public/**  .github/**  package.json  package-lock.json
e2e/__golden__/**                ← no --update-snapshots, at all, for any reason
e2e/*.spec.ts  e2e/**/*.spec.ts  ← every pre-existing spec, INCLUDING your own from rounds 2, 3 and 4
reports/qa/phase-09a-r2/**  r3/**  r4/**   ← prior rounds' committed records
scripts/qa-probes/p09a2-**  p09a3-**  p09a4-**   ← read and run them; do not edit them
supabase/**  PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  .work/packets/**  .claude/**  tsconfig.json  .env
```

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once, then `PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`, checked
before binding. **Commit after every step** — four agents have stopped mid-run in this phase (two process
kills, a rate limit, one unexplained) and every time only committed work survived.

## RETURN_FORMAT

```text
VERDICT:       PASS | FAIL
LOADER:        your attacks on ts.transpileModule; runtime-import escape, divergence, temp-dir behaviour
INSTRUMENTS:   your round-4 sabotage re-run, plus silent-pass and registry-drop attempts
SWEEP:         your own verification, and whether rounds 2-3 now rest on something you trust
DETECTOR_D:    your adversarial strings against the two-condition discriminators
REGISTER:      all six sites resolve; your independent count and the work behind it
REGRESSION:    per project, specs unedited, goldens unmoved
FLAKE:         contention or latent — argued, not asserted
JUDGEMENT:     the criterion-1 question, the red-on-legitimate-edit message, the enum control
DEFECTS:       file:line, severity, blocks or not
UNVERIFIABLE:  U1-U14 carried, plus anything new
```

This round closes 09a if it passes. Falsify me — you have in all four previous rounds, and round 4 found the
one that mattered most.
