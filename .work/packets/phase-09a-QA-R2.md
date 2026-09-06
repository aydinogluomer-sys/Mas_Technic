# QA TASK PACKET — PHASE 09a, ROUND 2

PHASE_ID: 09a-QA-R2
INTEGRATION_HEAD: `dae15bb` on `claude/awwwards-90-overhaul`
WORKTREE: create a **fresh** one — `C:\Users\Trade Bilisim\pdh-wt\qa-p09a2` on `wt/qa-p09a2` from `dae15bb`.
Provision it the A04/A18 way: `node_modules` directory junction from the main checkout, and **copy the main
checkout's gitignored `.env` in**. Without `.env` every route renders the top-level error boundary and you
will measure an error page and report it as the site. Do not commit `.env`.

## ⚠ THE PRODUCTION-WRITE PROHIBITION — CARRIED FORWARD VERBATIM, IT IS ABSOLUTE

**Do not submit the RFQ form against the live project, even once, by any route. Do not invoke any edge
function, upload to storage, or insert a row.** Earlier in this phase an agent wrote **four rows to
`public.rfqs` and three objects to `cad-uploads`** on the customer's production database, by trusting this
repository's copy of an edge function that the deployed one does not match.

- Any check that needs the submit path must **intercept and abort every non-loopback request and prove the
  interception holds before the click** — your round-1 self did this with a live canary to example.com fired
  before touching any control. Do that again. It was better than what I specified.
- **Do not touch the four rows or three objects.** They are evidence of an unresolved user decision.
- **Do not re-establish the deployed-vs-source divergence by probing.** It is already established and it cost
  four rows.
- Do not deploy. `USER_INPUTS.md` §M sets `ALLOW_PRODUCTION_DEPLOY: NO`.

Your round-1 `UNVERIFIABLE` entries **U1–U7** all require a production write. They stay unverifiable.
**Do not attempt any of them.** Carry them forward unchanged and say so.

## WHAT ROUND 1 FOUND, AND WHAT THE TWO CORRECTIONS DID

Round 1 returned **FAIL on one defect**, and every load-bearing number 09a claimed reproduced. Two
corrections followed.

**C1 (`3661e0c`, `0780ac4`) — the contrast defect.** `shell.css:1891` coloured
`.shell-notice[data-tone="error"] .shell-notice-label` with `--tl-stamp`, a single fixed `#8a4030` with no
surface variant, measuring **2.69:1** on the graphite ground 09a moved `/teklif-al` onto. The Coder falsified
**both** fixes you and I proposed: a `[data-shell-surface="graphite"]` override leaves
`.tl-band[data-band-tone="paper"]` — a *descendant* of the graphite root — inheriting the graphite red at
**2.23:1 on paper**, trading one serious violation for another. `shell.css:961-970` already documents that
exact trap for the `--sf-*` roles and neither of us had read it. The fix is a new ground-bound role
`--sf-danger` with `--tl-stamp-light: #e18570`, chosen at L=66% because above that the red desaturates to
ΔE 14 from the *caution* label beside it and the two stop being tellable apart at 9px; at 66% it is ΔE 34.
`.shell-form-error` moved to the same role, one deliberate step beyond the packet and reported rather than
smuggled, because `shell.css:1884` promises field-level and block-level errors are the same red.

**C2 (`bc4ed86`, `0a829d0`, `f757d3d`, `dae15bb`) — the turnaround sweep.** Its first agent was killed one
commit in; the second resumed from the surviving worktree. Together they removed or neutralised unauthorised
**production/delivery durations, payment and credit terms, and return/warranty guarantees** across
`chatFaqData.ts` (7 answers) and `servicePages.ts` (**eleven pages**, four whole table columns), added two
gate rules and widened two more.

## WHAT I HAVE ALREADY VERIFIED MYSELF — do not spend your budget re-proving these

- Scope: `git diff --name-only 0780ac4..dae15bb` is exactly 7 paths, all allowlisted. No spec edited, no
  `supabase/**` touched, no DO_NOT_TOUCH path touched.
- The gate, **both directions, run by me**: `node scripts/claims-gate.mjs` on the tree → **PASS, 0
  violations, 29 rules, 178 controls, 0 control failures**. The same gate against `0780ac4`'s
  `servicePages.ts` + `chatFaqData.ts` → **FAIL, 75 violations** (69 lead-time, 4 payment, 1 wrong-city,
  1 returns), 0 control failures.
- Every residual regex hit in `servicePages.ts` — 7 numeric, 2 worded — is inside a **comment**. The gate
  blanks comments by design.
- `servicePages.ts:2933-2935`: `metaTitle`, `metaDescription` and `description` all carry no duration.
- The two scope expansions the Coder flagged rather than smuggled, both adjudicated **accepted** by me:
  the `gece-gündüz kesintisiz` shift claim (the `24/7` precedent comment at `servicePages.ts:1499` is real
  and the claim had survived on another page 1200 lines away), and the `%15-25` / `%25-35 hacim indirimi`
  discount schedule (a price policy its own page FAQ already contradicted).

## WHAT I WANT YOU TO MEASURE

**1 — The contrast fix, rendered, on both grounds.** All five `tone="error"` notice sites, at 1280 and 375.
C1 claims 7.33:1 up from 2.69:1, the `border-left` clearing 1.4.11's 3:1, paper unchanged at 6.93:1, and the
case a root override would have broken at 6.07:1. Reproduce or falsify each. `/iletisim` carries
`.shell-form-error` too — C1 says it was at 2.69:1 on graphite there as well.

**2 — The sweep, in the rendered DOM, not by grep.** No unauthorised production/delivery duration — numeric
**or worded** — no payment or credit term, and no return/warranty guarantee on any public route. Worded forms
that carry no digits are the ones a numeric sweep misses and the ones I missed twice: `aynı gün`, `ekspres`,
`acil`, `gece-gündüz`, `hafta sonu`, `24/7`. The Coder ran a 56-route sweep and reports 0 findings against 24
on the pre-sweep build; run your own, and treat its route list as a floor.

**3 — The chatbot's real answer pool.** This is the item I most want independently checked.
`chatFaqData.ts`'s `collectServiceFaqs()` lifts **every** `faq` entry in `servicePages.ts` into the chatbot's
pool, so the larger half of what a visitor can be told lives in the file the first C2 agent never reached.
Enumerate the **whole** pool as `ChatBot.tsx` would assemble it, and check every answer — not just the seven
entries `chatFaqData.ts` declares directly.

**4 — Column and list coherence.** C2 removed four whole duration columns rather than filling them with five
identical "Teklifle birlikte" cells. Verify no column or list is left half-neutralised — that was C1's
failure and the reason C2 existed. Check `proje-yonetimi`'s "Süre" column especially: exactly one cell is
supposed to carry a number, and it is supposed to be `QUOTE_RESPONSE_TIME` read from the ledger.

**5 — `QUOTE_RESPONSE_TIME` still renders wherever it did.** The Coder says 52 of 56 routes. That is the one
duration with an authority behind it and the sweep must not have taken it with the rest.

**6 — Goldens.** Two moved, both at `visual-375`, both claimed caused by a bullet re-wrapping one line on
`/hizmetler/cnc-frezeleme`. **No `--update-snapshots` from you, at any point** — §12: golden files are
evidence, not a way to silence tests. Verify the two that moved are explained by the change and that nothing
else moved.

**7 — The Coder's four unacted findings.** It found these, correctly judged them outside the packet's three
classes, and left them. I am carrying them to a later phase and I do not want to carry a phantom — confirm
each is genuinely still live in the tree, or tell me it is not:
`servicePages.ts:77` `"HSM ile %40 daha hızlı üretim"`; `tasarim-rehberi-dfm`'s `%70'e kadar maliyet
tasarrufu` and `Ortalama %30-50`; `dusuk-hacimli-uretim`'s named machine model `EOS M290` (Phase 06 removed
named models elsewhere under §D `MACHINE_COUNT: PRIVATE_DO_NOT_DISCLOSE`); and `enjeksiyon-kalibi`'s
`Parça/Saat` table header, which matches `claims.ts` `WITHHELD_SPEC_CLASSES` but escapes it because that
filter runs on `technicalSpecs` via `CategoryPage` and never on a `comparisonTables` header.

**8 — Regression.** `critical-1280`, `critical-375`, the four visual projects, `qa-p09a-rfq-form`, the three
`qa-p08-*` at `mobile-320`, and `shared-shell-accessibility`. Specs unedited. The Coder reports `visual-768`
flaking twice on `e2e/visual/fonts.ts:170` — `installFontRetry() intercepted 0 requests on
fonts.gstatic.com` — on a different untouched test each time, green on the third run. If it bites you, say
whether it is environmental or a regression; do not paper over it.

## WRITE_ALLOWLIST

```
e2e/qa-p09a2-*.spec.ts          (new specs only, prefix qa-p09a2-)
e2e/fixtures/qa-p09a2-**        (fixtures your specs need)
reports/qa/phase-09a-r2/**      (your report and evidence)
scripts/qa-probes/p09a2-**      (throwaway probes; commit them, they are evidence)
```

## DO_NOT_TOUCH — production code is READ-ONLY to you

```
src/**  scripts/claims-gate.mjs  index.html  public/**
e2e/__golden__/**                ← baselines are evidence; no --update-snapshots, at all
e2e/*.spec.ts  e2e/**/*.spec.ts  ← every pre-existing spec, including your own round-1 ones
supabase/**                      ← and no network call to it
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  .work/packets/**
package.json  package-lock.json  .claude/**  tsconfig.json  .env
```

If a production file needs changing, **report it — do not change it.** Round 1's write prohibition held and
you proved it held rather than asserting it; do that again.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once, then `PLAYWRIGHT_PREVIEW_ONLY=1` with a **free** `PLAYWRIGHT_PORT` — check
before binding and leave ports held by pids that are not ours alone. Commit after every step: this phase has
already lost one agent to a process kill, and only what it had committed survived.

## RETURN_FORMAT

```text
VERDICT:       PASS | FAIL
CONTRAST:      the five notice sites + .shell-form-error, measured, both grounds, both viewports
SWEEP:         your own route sweep — routes checked, findings, and the worded forms specifically
CHATBOT_POOL:  the FULL assembled pool including collectServiceFaqs(), every answer adjudicated
COLUMNS:       every duration column and list, proven whole
SLA:           where QUOTE_RESPONSE_TIME renders, and that it is unchanged
GOLDENS:       what moved, what did not, and the proof you ran none with --update-snapshots
CARRIED_FOUR:  each of the Coder's four unacted findings — still live, or not
REGRESSION:    per project, pass/fail, specs unedited
DEFECTS:       each with file:line, severity, and whether it blocks
UNVERIFIABLE:  what you could not check and why — U1-U7 carried unchanged, plus anything new.
               This field is expected to be non-empty and an honest entry here is worth more
               than a check bought with a write to the customer's database.
```

Falsify me. Round 1's most valuable output was the list of what it had **not** verified, which is what sent
it back for the two defects round 1 had missed.
