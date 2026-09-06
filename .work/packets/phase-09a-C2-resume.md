# CODER TASK PACKET — PHASE 09a, CORRECTION 2 (RESUMED)

PHASE_ID: 09a-C2r
PHASE_TITLE: Finish the turnaround sweep — `servicePages.ts` and the gate
BASE_COMMIT: `60238c8` (your predecessor's own work — **already on your branch**)
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a` on **`wt/coder-p09a2`**, clean, `.env` present, `node_modules` junctioned.

## READ THIS FIRST — YOU ARE RESUMING, NOT STARTING

A previous agent held this packet, committed **one** step, and its process was
killed. Its worktree was deliberately left in place, so its work is yours to
build on. **Do not redo it and do not revert it.**

`git log --oneline -1` → `60238c8 fix(content): the chatbot was stating payment
terms and a returns warranty as policy`. I have reviewed that commit at the
source. It is good and it stays:

- `chatFaqData.ts` — the four answers named in the original packet, **plus three
  more it found on its own**: `:114` credit terms, `:131` working hours with a
  weekend-production commitment (Phase 07 removed the identical block from
  `/iletisim`), and `:166` `"İSTANBUL merkezli"`, which contradicted §A
  `PUBLIC_CITY: İzmir`, the footer, the JSON-LD and this same file's own address
  answer twenty lines earlier. Now reads `${PUBLIC_CITY}` from the ledger.
- `claims.ts` — gains `PRODUCTION_LEAD_TIME` (withheld), `LEAD_TIME_STATEMENT`
  and `LEAD_TIME_SHORT`. `QUOTE_RESPONSE_TIME` untouched.
- `caseStudies.ts` — reads `LEAD_TIME_STATEMENT` instead of a local literal.

**The full original packet is `.work/packets/phase-09a-C2.md`. Read it — the
rule, the classification method, the `/hizmetler/hizli-prototip` ruling and the
return format all still stand.** This file only says what is left and corrects
what I got wrong in it.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES

**Do not submit the RFQ form, invoke any edge function, upload to storage or
insert a row.** An earlier agent on this phase wrote four rows and three objects
to production by trusting this repository's copy of an edge function that the
deployed one does not match. Nothing in this packet needs the network. Do not
touch those four rows or three objects — they are evidence of an unresolved user
decision. Do not deploy.

## WHAT IS LEFT — measured by me just now, in your worktree at `60238c8`

| target | state |
|---|---|
| `src/data/chatFaqData.ts` | **done** |
| `src/content/claims.ts`, `src/content/caseStudies.ts` | **done** |
| `src/data/servicePages.ts` | **62 hits, untouched** |
| `scripts/claims-gate.mjs` | **untouched — 1459 lines, no rule added** |
| verification (tsc, build, gate, Playwright projects) | **not run** |

## MY REGEX WAS INCOMPLETE — THIRD TIME THIS PHASE

The original packet's inventory regex only matched `gün` and `hafta`. It misses
`saat` entirely, and `servicePages.ts` publishes delivery windows in hours:

```
:774  "… 24-72 saat standart teslimat süresi ve havacılık, otomotiv …"
:806  "24-72 saat standart teslimat süresi"
:824  "Standart siparişlerde 24-72 saat, büyük partilerde 3-5 iş günü teslimat
       süremiz bulunmaktadır. Ekspres hizmet ile aynı gün teslimat da mümkündür."
```

`:824` is worth studying because it shows the shape of what a numeric sweep
misses: **"aynı gün teslimat"** is a delivery commitment with no digits in it at
all, and **"ekspres hizmet"** promises a service tier. Neither would be caught by
any pattern built from `[0-9]`. So:

**Build the inventory from the claim, not from the regex.** Anything that tells a
reader how long the work will take, or promises a tier/priority of service, is in
scope whether or not it contains a number. Named starting points, not a ceiling:
`24-72 saat`, `aynı gün`, `ekspres`, `acil`, `hafta sonu`, `garanti`, `iade`,
`vade`, `ön ödeme`, `açık hesap`, `peşin`.

`servicePages.ts:2933-2935` is the worst single block, because two of the three
lines ship into search results, not just the page body:

```
metaTitle:       "Hızlı Prototip Üretimi | 3-5 İş Günü | CNC, 3D Baskı, Silikon Kalıp | Mas Technic"
metaDescription: "3-5 iş günü prototip teslimatı. …"
description:     "… 3-5 iş günü içinde fonksiyonel prototip teslimatı. …"
```

The original packet named the `metaTitle` only. All three go.

## ALSO CHECK — two files the original packet did not name

`grep -rlE "[0-9]+ *- *[0-9]+ *(iş )?(gün|Gün|hafta|Hafta)" src/` returns, besides
the three already handled and `servicePages.ts`:

```
src/components/rfq/rfq-model.ts        ← :82 is the AUTHORISED "Teklifle birlikte" wording; verify, then leave
src/components/rfq/RfqSubmitStep.tsx   ← unexamined by me. Check what it renders.
```

If `RfqSubmitStep.tsx` renders a duration to a reader, it is in scope under the
same rule; if the match is a keyword, a comment or a matcher input rather than
published text, say so and leave it. Do not redesign either file — this is a copy
correction, not a rework of 09a's RFQ modules.

## THE GATE — check what exists before you add

`scripts/claims-gate.mjs` **already has rules adjacent to two of your three**, and
I do not want three near-duplicates fighting each other:

```
:973  id: "unconditional-guarantee"    ← may already cover part of rule 3
:967  id: "wrong-city"                 ← pattern is /geo\.placename[^\n]*İstanbul/gi
:623  id: "quote-sla-overpromise"      ← the SLA is guarded; do not let a new rule collide with it
:649  id: "delivery-or-quality-rate"   ← read this one carefully before writing rule 1
```

Extend an existing rule where that is the honest fit; add a new one where the
class is genuinely different. Either way the requirement is unchanged: each must
fire on a positive control drawn from **the exact strings you are removing**, and
none may fire on `claims.ts`'s authorised `QUOTE_RESPONSE_TIME`. Prove both
directions.

**And a gate-coverage finding you should fold in.** `wrong-city` matches only
`geo.placename`, so it did **not** catch `chatFaqData.ts:166`'s `"MAS Technic,
İSTANBUL merkezli"` — a wrong-city claim in published prose sailed past the rule
whose entire purpose is wrong-city claims. Widen it, with a control.

## WRITE_ALLOWLIST

```
src/data/servicePages.ts
src/data/*.ts                       (only where your inventory finds a claim)
src/content/*.ts                    (EXCEPT the authorised QUOTE_RESPONSE_TIME block in claims.ts)
src/components/rfq/RfqSubmitStep.tsx  (ONLY if it renders an unauthorised claim; copy only, no rework)
src/pages/**  src/components/**     (ONLY where rendered copy carries an unauthorised claim; no redesign)
scripts/claims-gate.mjs             (the new/widened rules + their controls)
e2e/__golden__/**                   (only baselines your change explains; expect few — text-only edits)
```

## DO_NOT_TOUCH

```
src/content/claims.ts QUOTE_RESPONSE_TIME + QUOTE_RESPONSE_TIME_DISPLAY   ← authorised, cited, correct
src/data/chatFaqData.ts                        ← DONE in 60238c8; do not revisit
e2e/qa-p09a-*.spec.ts  e2e/qa-p08-*.spec.ts    ← QA's; must stay green unedited
supabase/**                                     ← and no network calls to it
src/pages/Login.tsx  src/pages/ForgotPassword.tsx  src/pages/ResetPassword.tsx   ← 09b
src/pages/KVKK.tsx  src/pages/GizlilikPolitikasi.tsx  src/pages/CerezPolitikasi.tsx ← 09b
src/components/ChatBot.tsx                      ← the COMPONENT is 09b's
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← R2-3, Phase 10 (A23)
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  reports/qa/**
package.json  package-lock.json  .claude/**  tsconfig.json
```

Note the auth-route line: every DO_NOT_TOUCH list I have written this phase said
`SifremiUnuttum.tsx`. **That file does not exist** — `/sifremi-unuttum` is served
by `ForgotPassword.tsx` (`App.tsx:211`). Corrected above.

## ACCEPTANCE_CRITERIA

1. No unauthorised production/delivery duration (numeric **or** worded), payment
   or credit term, or return/warranty guarantee remains in the **rendered** DOM
   of any public route. Verified rendered, not by grep alone.
2. No duration column or list is left partly neutralised — every cell of a
   column, and every bullet of a list, speaks the same way.
3. `claims.ts`'s `QUOTE_RESPONSE_TIME` still renders wherever it did, unchanged.
4. `servicePages.ts:2933-2935` — `metaTitle`, `metaDescription` and `description`
   all carry no duration.
5. `scripts/claims-gate.mjs` covers the three classes and the widened wrong-city
   case; each fires on a positive control and none fires on the authorised SLA.
   Gate PASSes on the tree.
6. `critical-1280`, `critical-375`, four visual projects, `qa-p09a-rfq-form`,
   three `qa-p08-*` at `mobile-320` — all green, specs unedited.
7. `npx tsc -b` exit 0; `npm run build` exit 0.
8. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation,
`> file 2>&1`, never `run_in_background`. Build once then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT` — check the port is
free before binding; ports held by pids that are not ours are to be left alone.
**Commit after every step** — the last agent on this packet was killed mid-run
and only what it had committed survived.

## PARTIAL IS ALLOWED

If `servicePages.ts` lands green but the gate work is barely started, commit what
is green and return `PARTIAL` with what remains. A clean partial is worth more
than an unreviewable whole, and this packet has now lost one agent already.

## RETURN_FORMAT

```text
INVENTORY:   every hit, file:line, classified authorised / removed / neutralised, with the reason
             — including the non-numeric commitments ("aynı gün", "ekspres", …)
COLUMNS:     every duration column or list, proven internally consistent
METATITLE:   the 2933-2935 block, before and after
RFQ_FILES:   what rfq-model.ts:82 and RfqSubmitStep.tsx actually are, and what you did about each
GATE:        each rule new or widened, with its positive control and the proof it does not fire on the SLA
GOLDENS:     moved or not
UNVERIFIED:  anything you could not check, and why — this field is expected to be non-empty
```

Falsify me again if I have it wrong. The original packet was wrong twice — once
on scope, once on a fact I asserted as verified — and this one has already
corrected its own regex.
