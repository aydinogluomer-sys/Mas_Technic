# QA TASK PACKET — PHASE 09a

PHASE_ID: 09a
CODE_COMMIT: `2f6bb3c` — integration branch `claude/awwwards-90-overhaul`
CODER_PACKET: `.work/packets/phase-09a.md`, in your tree.

## WORKTREE — FRESHLY CREATED AND PROVISIONED

```
C:\Users\Trade Bilisim\pdh-wt\qa-p09a      branch: wt/qa-p09a      at: 2f6bb3c
```

`node_modules` junctioned, `.env` copied in (A18: without it every route is the
top-level error boundary). Ignore any harness worktree; never delete one.

---

# ⚠ READ THIS FIRST — A HARD PROHIBITION THAT OVERRIDES EVERY TEST BELOW

**The 09a Coder wrote to the production database.** Four rows in `public.rfqs`
and three objects in `storage.objects/cad-uploads`, on 2026-09-06. It disclosed
this itself; I verified the extent read-only. The full record is in
`PROGRESS.md` under "STOP — 09a wrote to the production database".

The cause matters for you: the Coder reasoned from
`supabase/functions/rfq-rate-limit/index.ts` **in this repository**, which
rejects a malformed e-mail with 400 *before* the insert, and it deliberately
probed with a duplicate primary key so that nothing could be written. **The
deployed function does not behave like that source** — `git log` over it shows
one commit, the initial import, and it has never been deployed. A write the
Coder had engineered to be impossible happened anyway.

**Therefore:**

1. **You must not submit the RFQ form against the live project. Not once.** No
   `functions.invoke("rfq-rate-limit")`, no `storage.from("cad-uploads")`
   upload, no `rfqs` insert, by any route — page interaction, script, or
   `fetch`. There is exactly one configured project and it is production.
2. If a check needs the submit path, **intercept and abort every non-loopback
   request first** and verify the abort worked before the click, the way you did
   in round 4 when you measured the `/iletisim` payload without writing it. If
   you cannot prove the interception holds, do not run the check — report it as
   unverifiable instead.
3. **Do not delete, modify or "clean up" the four rows or three objects.**
   Removing them is a production mutation, it is the user's decision, and it is
   currently unanswered. They are evidence.
4. **Do not deploy anything.** `USER_INPUTS.md` §M sets
   `ALLOW_PRODUCTION_DEPLOY: NO`, and it has not been lifted.
5. Do not re-establish the deployed-vs-source divergence by probing. It is
   already established and it cost four rows. You may confirm the repo-local
   half — that the function's source has a single commit and has never been
   deployed — from `git log` alone.

A read-only audit of Supabase is 09b's scope, not yours. If you find yourself
wanting to write anything anywhere to finish a check, that is the signal to stop
and report it unverified.

---

## WHAT 09a CLAIMS — verify, do not assume

The Coder's report is in the task record; these are its load-bearing numbers.

| claim | value |
|---|---|
| decomposition | `TeklifAl.tsx` **1540 → 418** lines, twelve new modules under `src/components/rfq/**` |
| bundle | route static closure **1629.48 kB → 816.79 kB**, −812.7 kB, −49.9 % |
| lazy boundary | on load and after choosing a file, heavy chunks fetched = `[]`; `CadStage-*.js` + `cssVar-*.js` arrive only after "3B önizlemeyi aç"; OCCT only for a `.step` |
| design | `/teklif-al` teal **16 → 0**, Radix **3 → 0**, shell primitives **1 → 88**; `/cad-dashboard` identical |
| errors | both states `div.shell-notice`, `data-tone="error"`, `role="alert"`, radius `0px`, Space Grotesk, no `data-sonner-toast`; zero `toast`/`sonner` calls left in `rfq/**` or `TeklifAl.tsx` |
| a11y | `aria-invalid`, `aria-describedby` resolving to real text, `<label for>`, focus moves to first invalid field, errors clear on edit |
| double-submit | 13 attempts against a 2.5 s handler → **1** invocation, `disabled` + `aria-busy` |
| formats | shown in hero meta row, `ShellTagRow` chips and dropzone hint, all from `CAD_ACCEPT_ATTR` / `CAD_FORMAT_CHIPS` / `CAD_FORMAT_HINT` |
| goldens | exactly four moved — `shell-footer-rfq.png` at 375/768/1280/1440 — explained by `shell.css:509` giving `.tl-footer` a `border-top: 1px` only under `[data-shell-surface="paper"]`; 1 px translation plus paper-only tints |

## MANDATORY_TESTS

1. **The bundle claim, independently.** Recompute the route's transitive static
   import closure from `dist/assets`, and confirm at runtime that no heavy chunk
   is fetched until a preview is explicitly requested. The Coder notes the bytes
   were never in `TeklifAl-*.js` (42.6 kB) but in a shared 858 kB chunk it
   statically imported — so a route-chunk-only measurement understates it ~20×.
   Do not repeat that mistake.
2. **Design language**, with round 1's own instruments —
   `probe-design-membership.mjs` and `probe-legacy-accent.mjs` in
   `reports/qa/phase-08/`, borrowed unedited. `/teklif-al` and `/cad-dashboard`.
   Criterion 3's remaining route is `/giris` at 92 teal nodes; that is 09b's,
   record it, do not fail 09a on it.
3. **Both branded error states, reached not inferred** —
   `probe-error-states.mjs`, borrowed unedited. The CAD/format error is reached
   by choosing a `.txt`, which is client-side and writes nothing. The form error
   is reached by advancing with no file. **Neither requires a submission.**
4. **Accessibility of the form**: field errors programmatically associated and
   announced, focus management, errors clearing on edit; axe with no serious or
   critical violations on `/teklif-al` at 1280 and 375; reflow at 320.
5. **Double-submit**, without submitting to production: prove the guard from the
   DOM and the handler (disabled state, `aria-busy`, single invocation against
   an intercepted transport).
6. **Content truth.** The Coder removed "10-12 Gün" / "3-5 Gün" delivery lead
   times from four places — a §13 class Phase 08 stripped from this page's
   sidebar. Confirm they are gone from the **rendered** DOM, not just the source,
   and that no new unverifiable claim replaced them. `node scripts/claims-gate.mjs`
   in place. Also confirm the confirmation reference is **server-echoed or
   absent** — never client-fabricated — and that no notification path or
   recipient was invented (the Coder reports there is no mailer, no trigger, no
   scheduled reader, and says so in the copy).
7. **The four rebanked goldens.** Adjudicate them the way you did the 21 in
   round 2: height delta, first changed row, and whether the paper-vs-graphite
   `border-top` story explains what actually moved. `shell-header-rfq.png` must
   be unmoved. Confirm no other baseline moved and that `--update-snapshots` was
   not used to hide anything — `git diff` the baselines against `64d1a8b`.
8. **Regression**: `critical-1280`, `critical-375`, the four visual projects,
   and all three `qa-p08-*` specs unedited at `mobile-320`. The qa-p08 lanes are
   the Phase 08 close and must stay green.

## OUT OF SCOPE

- Anything requiring a production write (see the prohibition).
- `/giris`, `/sifremi-unuttum`, `/reset-password`, the legal pages,
  `ChatBot.tsx`, `ScrollToTop.tsx`, the Supabase RLS/headers audit — all 09b.
- R2-3 at `tablet-768`/`landscape-844` — carried to Phase 10 per A23; confirm
  still red, nothing more.
- `src/pages/CADDashboard.tsx` is an 806-line orphan imported by nothing (the
  route is a `<Navigate>`). The Coder left it. Record whether you agree it is
  dead; the deletion decision is 09b's or Phase 10's, not yours.

## QA_WRITE_ALLOWLIST

```
e2e/qa-p09a-*.spec.ts
reports/qa/phase-09a.md
reports/qa/phase-09a/**
```

Production code read-only. `--update-snapshots` forbidden for any reason.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation,
`> file 2>&1`, never `run_in_background`. Build once then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`; a cold build has died
with `write ENOMEM` here. `installFontRetry()` flakes at visual-375 — known,
Phase 12, do not fix. `scripts/claims-gate.mjs` resolves `REPO_ROOT` from its own
location; run it in place. PowerShell primary.

**Commit after every step.** This run has been interrupted four times and every
agent that committed as it went lost nothing.

## RETURN_FORMAT

```text
BUNDLE:       your own closure numbers before/after · runtime fetch evidence for the lazy boundary
DESIGN:       /teklif-al and /cad-dashboard on the round-1 instruments
ERRORS:       both states measured and how you reached them WITHOUT a submission
FORM_A11Y:    associations, focus, announcement, double-submit — and what you could not verify without writing
TRUTH:        lead times gone from the rendered DOM · reference server-echoed or absent · nothing invented
GOLDENS:      the four, adjudicated · header unmoved · nothing else moved
REGRESSION:   per project
UNVERIFIABLE: everything you could not check because it needed a production write — name each one
VERDICT:      PASS | FAIL
```

The `UNVERIFIABLE` field is not a failure and I expect it to have entries. A
check you honestly declined to run is worth more than one you ran by writing to
the customer's database.
