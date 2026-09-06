# QA TASK PACKET — PHASE 09a, ROUND 3

PHASE_ID: 09a-QA-R3
INTEGRATION_HEAD: `38d4f73` on `claude/awwwards-90-overhaul`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p09a3` on `wt/qa-p09a3`, **already created and provisioned** —
`node_modules` junctioned, `.env` copied in (gitignored; do not commit it). Nothing to set up.

## ⚠ THE PRODUCTION-WRITE PROHIBITION — UNCHANGED, ABSOLUTE

**Do not submit the RFQ form against the live project, invoke any edge function, upload to storage, or
insert a row. Do not deploy.** Four rows in `public.rfqs` and three objects in `cad-uploads` were written to
the customer's production database earlier in this phase; they are evidence of an unresolved user decision
and must not be touched. Any check needing the submit path must intercept and abort every non-loopback
request and **prove the interception holds before the click** — your round-2 self fired a live canary to
example.com and gave its probe bundles a loopback URL and a junk key so they could not reach the project even
by accident. That standard stands.

`U1`–`U11` from round 2 are carried. **Do not attempt U1–U7** — every one needs a production write.

## THIS IS A NARROW ROUND. DO NOT RE-VERIFY ROUND 2.

Round 2 established, and I am not asking again: the contrast fix (7.33:1, both grounds, both viewports), the
17 columns, the 63-route sweep, the SLA on 57 routes, and the C2 golden pair. Round 3 verifies **C3 only** —
six commits, `8e5472b..38d4f73`.

## WHAT I HAVE ALREADY VERIFIED MYSELF — do not spend budget re-proving these either

- Scope: `git diff --name-only fe3a525..38d4f73` is 11 paths — `servicePages.ts`, `chatFaqData.ts`,
  `claims.ts`, `SSS.tsx`, `claims-gate.mjs`, and 6 golden PNGs. Nothing else.
- The gate on the tree: **PASS, 31 rules, 244 controls, 0 failed** — run by me.
- **The type pin fires.** I appended `"dwg"` to `PUBLISHED_CAD_EXTENSIONS` and got `TS2344` at
  `claims.ts:88` from `npx tsc -b` **and** a gate FAIL at `claims.ts:74`, from two independent instruments.
  Restored clean.
- **The `technicalLandingData.ts:130` deferral is genuinely pinned, not exempted.** I drifted the string by
  one format and the gate went FAIL at that line. The literal survives only while it is exactly right.

## WHAT C3 DID, AND THE THREE THINGS I WANT YOU TO ATTACK

**C3 falsified my central instruction and I accepted it.** I told the Coder to derive the published CAD list
from `CAD_ACCEPTED_EXTENSIONS` at runtime. That is impossible here: `cadUpload.ts` → `supabase/env.ts` reads
`import.meta.env` at module scope, and two specs import `servicePages.ts` into the Playwright **Node**
runtime, so a runtime import kills spec collection for all of `critical-1280`. The list is instead restated
once in `claims.ts` behind `import type` — erased at compile time, no module edge — and pinned by a
tuple-exact type assertion plus an independent text comparison in the gate.

**1 — Attack the pin.** It is the load-bearing artefact of this correction and it is only worth what it
catches. I proved content drift fires. **You should try what I did not**: reorder without changing content;
change length in the other direction (remove one); change case; change the tuple to `string[]` instead of
`as const`; and any route by which the two files could disagree while both instruments stay green. If there
is a hole, this is the round to find it.

**2 — D1 was five sites, not the one I named.** `:134` and, on the same page in body prose, **`:89`** — my
packet's fix alone would have left the page still publishing the claim. Also `:1943`, `:1967`, and
`pages/SSS.tsx:132`, which is outside the strict reading of the allowlist I wrote; the Coder declared it
rather than claiming silent compliance and I have accepted it. **Re-dump the assembled 140-entry pool and the
rendered DOM and establish for yourself that no site offers a format the validator rejects.**
Note what the fix deliberately keeps: `:210` still *names* SolidWorks, CATIA, NX and PDF/DWG — as formats the
uploader will **not** take, with an email route. That is intentional, and it is what keeps the six phrasings
(`catia`, `catia dosyası`, `catpart`, `solidworks`, `sldprt`, `solidworks dosyası`) landing on a **true**
answer instead of falling to a default. **Re-probe all six.** If any now reaches a false answer, or falls
through, that is a defect.

**3 — The `F4` reversal, which I want a second opinion on.** I told C3 to extend `WITHHELD_SPEC_CLASSES` to
`comparisonTables` headers. **The Coder refused, with an argument I found convincing**: `isPublishableSpec`
is an *allowlist*, so run over headers it would drop "Kavite", "Özellik", "Yöntem" — nearly every header in
the file — and would silently mutate rendered tables into rows with more cells than headers. Its counter-fix
is elsewhere: `periodic-volume-disclosure` had deliberately omitted `saat` from its period list, and the note
justifying that omission **named the right table and defended the wrong column** (`Çevrim/Saat`, which was
never reachable because `çevrim` is not one of the rule's count nouns). `saat` is now in the denominator
alternative only. **Verify that: `Parça/Saat` fires, `Çevrim/Saat` stays silent, and nothing else in the tree
newly fires.** Tell me if the refusal was right.

## ALSO MEASURE

- **Gate, both directions, your own run.** 31 rules / 244 controls; and FAIL with the removed strings
  restored. The three new/widened rules are `cad-format-list-not-derived`, `free-of-charge-commitment`, and
  the widened `delivery-or-quality-rate` (widened rather than duplicated, because two rules over one class is
  how the last three holes happened). Check that the widened rule did not start firing on things it should
  not — the Coder claims surcharges (`+%80-100 "Ek Maliyet"`) and material percentages (`IACS %99+`) stay
  silent by control.
- **The carried claims are actually gone, rendered:** D3 `:1965` free DFM (and a second instance the Coder
  found at `:81`, in a `metaDescription`), F1 `:117` (and `:208`, found by the Coder), F2a `:1922`,
  F2b `:1945`, F3 `:2103` **and** `:2131`, F4 `:517`'s column.
- **Goldens.** Six moved, at 375/768/1280, on two surfaces. The Coder's account: `.shell-next` keeps its
  height (332.438px), child count (29) and text, and only its fractional top moved, so the crop rounds to 333
  device rows instead of 334. It says base `fe3a525` passes both tests, so this is not flake, and that
  `inner-hero-service-detail` and `shell-header-service` were rewritten **byte-identically**. Verify that
  claim specifically — a byte-identical rewrite is the signature of a legitimate targeted update, and its
  absence would be the signature of a blanket one. **No `--update-snapshots` from you, at any point.**
- **Regression.** `critical-1280`, `critical-375`, the four visual projects, `qa-p09a-rfq-form`,
  `qa-p09a2-*`, the three `qa-p08-*` at `mobile-320`, `shared-shell-accessibility`. Specs unedited.
- **One integrity check I want explicitly.** The Coder reports that running your own `qa-p09a2-claims-sweep`
  spec **rewrote `reports/qa/phase-09a-r2/sweep.json`**, and that it restored the file with `git checkout`.
  Confirm the committed evidence from round 2 is intact and that a QA spec writing into the evidence
  directory on every run is not going to quietly overwrite a prior round's record. If it is, say so — that is
  a defect in *your* round-2 spec, not in C3.

## WRITE_ALLOWLIST

```
e2e/qa-p09a3-*.spec.ts          (new specs only, prefix qa-p09a3-)
e2e/fixtures/qa-p09a3-**
reports/qa/phase-09a-r3/**
scripts/qa-probes/p09a3-**
```

## DO_NOT_TOUCH — production code is READ-ONLY to you

```
src/**  scripts/claims-gate.mjs  index.html  public/**
e2e/__golden__/**                ← evidence; no --update-snapshots, at all
e2e/*.spec.ts  e2e/**/*.spec.ts  ← every pre-existing spec, INCLUDING your own round-2 ones
reports/qa/phase-09a-r2/**       ← round 2's committed record; do not overwrite it
supabase/**                      ← and no network call to it
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  .work/packets/**
package.json  package-lock.json  .claude/**  tsconfig.json  .env
```

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once, then `PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`, checked
before binding. **Commit after every step** — this phase has lost two agents to process kills and both times
only committed work survived.

## RETURN_FORMAT

```text
VERDICT:       PASS | FAIL
PIN:           every attack you ran on the type pin, and whether any got through
CAD:           the five sites rendered, the assembled pool, and all six phrasings re-probed
F4:            whether the Coder's refusal was right, and whether the periodic-volume fix is sound
GATE:          your own run, both directions, plus false-positive check on the widened rule
CARRIED:       D3, F1, F2a, F2b, F3 (both), F4 — gone, rendered
GOLDENS:       the six that moved, the two that were rewritten byte-identically, and your no-update proof
EVIDENCE:      whether round 2's committed record is intact and whether a QA spec can overwrite it
REGRESSION:    per project, pass/fail, specs unedited
DEFECTS:       file:line, severity, blocks or not
UNVERIFIABLE:  U1-U11 carried, plus anything new. Expected to be non-empty.
```

Falsify me. You have done it in both previous rounds and both times it changed what the next packet said.
