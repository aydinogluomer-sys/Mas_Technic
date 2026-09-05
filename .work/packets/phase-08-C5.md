# CODER TASK PACKET — PHASE 08, CORRECTION ROUND 5 (C5, closing)

PHASE_ID: 08-C5
PHASE_TITLE: Close Phase 08 green — the guard's own red, and a third closed count
BASE_COMMIT: `41fe117` (integration branch `claude/awwwards-90-overhaul`, QA round 3 cherry-picked)

## WORKTREE — PREPARED. DO NOT CREATE OR DELETE ANOTHER.

```
C:\Users\Trade Bilisim\pdh-wt\coder-p08     branch: wt/coder-p08c5     at: 41fe117
```

`node_modules` junctioned, `.env` present. Two `.tsbuildinfo` artifacts in the
working tree — leave them, do not commit or revert. Ignore any auto-created
worktree under `.claude/worktrees/`; **never delete a worktree.**

## THIS IS A SMALL PACKET. TWO ITEMS. RESIST EVERYTHING ELSE.

QA round 3 returned **PASS** (`reports/qa/phase-08.md`, in your tree). Both C4
blockers are verified fixed. Two things stand between the phase and a green
close, and neither is large.

## ITEM 1 — R3-1: the new guard is red at `mobile-320`, on a second instance of the defect C4 fixed

`e2e/qa-p08-scroll-region-reach.spec.ts` (QA's, **do not edit it**) walks every
`<table>` on 22 public routes — 16 tables, 8 routes — and both of its walk tests
fail at `mobile-320` only.

**The failing surface:** `/hizmetler/cnc-frezeleme`, the
`CNC Frezeleme — malzeme kaydı` figure. It sits in
`div.shell-span-full shell-stack` (`src/pages/ServiceDetail.tsx:423`), an `auto`
grid track that cannot shrink below the figure's **295.078px** min-content — the
identical mechanism C4 diagnosed for `/cerez-politikasi`, one column wide
instead of three, and only at 320.

**Attribution:** PRE-EXISTING, Phase 07's. QA verified the phase's full diff
touches neither the page nor its data, and that its `shell.css` /
`ShellComposition.tsx` diffs contain no `shell-stack`, `shell-span-full` or
`shell-table`. We are fixing it anyway, because a guard this phase just added
must not close red — the same reasoning `PROGRESS.md` A24 used to re-aim a test
rather than leave one permanently red.

**The fix is the one you already landed**, applied to this call site. QA states
it explicitly: the guard "will go green at `mobile-320` when the same one-class
fix C4 landed here is applied there — **with no edit to the test**."

### The systemic question — measure it, then choose

There are **four** call sites with the identical wrapper shape:

```
src/pages/ServiceDetail.tsx:423        ← the one that fails
src/pages/ServiceDetail.tsx:512
src/pages/KabiliyetProfilDetay.tsx:157
src/pages/Malzemeler.tsx:177
```

Only `:423` fails today; the other three survive because their own min-content
happens to fit, which is exactly the accident C4 described. So there are two
candidate fixes and I want the choice **measured, not assumed**:

- **(a) Call sites.** Apply C4's shape to `:423`, and to any of the other three
  the guard shows a need for. Narrow, proven, no shared-stylesheet risk.
- **(b) Systemic.** `.shell-stack > * { min-width: 0 }` in `src/styles/shell.css`
  — the fix C4's own comment named as "the better long-term fix". It repairs all
  four at once and prevents the fifth.

**Default to (a).** Take (b) only if you measure that it moves no golden and
changes no layout outside these figures — and if you do take it, the
blast-radius measurement goes in the commit message, because `.shell-stack` is
used site-wide and this is a closing round, not the time to gamble a rebank
cycle. If you measure (b) as safe but prefer to be conservative, say so and take
(a); recording the measurement is worth as much as making the change.

Whichever you choose: leave the three surviving call sites documented — a
one-line comment naming the shared shape and the guard that now watches it, so
the next person does not rediscover this a fourth time.

## ITEM 2 — a third closed count, in a sentence C4 wrote

`/cerez-politikasi` madde 03 now opens:

> "Tarayıcınızın bu sitenin dışına istek gönderdiği **üç yer** var. **Üçü de
> burada.**"

This phase has now corrected the same defect class twice — "Aktarım **iki
hâlde** olur" and "üçüncü tarafa giden **ikinci ve son** istek" — and C4's own
fix introduced a third instance of it.

**It is contestable, and I verified the mechanism at source.** QA measured it
true on plain page load (23 routes, no Supabase host observed). But
`src/integrations/supabase/client.ts:11` calls `createClient` with
`VITE_SUPABASE_URL` **in the browser**, and both `/giris` and `/teklif-al` —
public routes — call Supabase from the browser on interaction. So logging in or
submitting an RFQ makes the browser contact a fourth host, and the sentence is
false the moment a reader does the thing the site asks them to do.

**Fix it so it cannot go stale again.** `/kvkk` madde 04 shows the shape: C4
removed the numeral entirely there and the enumeration is now unfalsifiable by
counting. Do the same here — enumerate without closing on a number, or scope the
sentence honestly to what it describes (a page load) and name the interaction
case. Note that madde 03's own list already describes the RFQ path elsewhere in
the document set, so this is a wording repair, not a new disclosure.

Check the neighbouring sentences C4 wrote for the same trap while you are there
— `/gizlilik-politikasi` madde 05's "Sayfalara gömülü **tek** üçüncü taraf
bileşeni" is a closed claim of the same family. If it is true, leave it and say
why; if it is contestable, repair it.

**The limits are unchanged:** claim nothing about what any third party does
after receipt; no retention, deletion, training, encryption, NDA or
security-posture claim; no cross-route `#` fragment.

## WRITE_ALLOWLIST

```
src/pages/ServiceDetail.tsx                  (Item 1)
src/pages/KabiliyetProfilDetay.tsx           (Item 1 — only if the guard shows a need)
src/pages/Malzemeler.tsx                     (Item 1 — same condition)
src/pages/CerezPolitikasi.tsx                (Item 2)
src/pages/GizlilikPolitikasi.tsx             (Item 2 — only if madde 05 is contestable)
src/styles/shell.css                         (Item 1 option (b) ONLY, with the blast-radius measurement)
e2e/__golden__/**                            (only baselines your change explains; protocol unchanged)
```

## DO_NOT_TOUCH

```
e2e/qa-p08-*.spec.ts                         ← QA's, all of them. The guard must go green unedited.
src/pages/Login.tsx                          ← hCaptcha stays; Phase 09
src/pages/KVKK.tsx                           ← correct as it stands
src/components/shell/ShellComposition.tsx  src/components/shell/footer-groups.ts
src/components/navigation/ia.ts  src/components/ChatBot.tsx  src/components/ScrollToTop.tsx
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← R2-3 stays red, carried to Phase 10 (A23)
e2e/technical-landing.spec.ts                ← done; do not touch again
supabase/**  src/pages/admin/**  src/pages/musteri-paneli/**
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  reports/qa/**
.claude/**  tsconfig.json  *.tsbuildinfo  package*.json
```

## ACCEPTANCE_CRITERIA

1. `npx playwright test e2e/qa-p08-scroll-region-reach.spec.ts --project=mobile-320` — **green, with the spec unedited.** Also green at `mobile-375` and `desktop-1280`.
2. Every `<table>` on the public routes either fits its box or is genuinely reachable at 320. Report the figure that failed, before and after.
3. `/cerez-politikasi` madde 03 makes no claim that a reader can falsify by logging in or submitting an RFQ.
4. Rendered legal set still asserts nothing about any third party after receipt; no numeral-closed enumeration remains anywhere in the three documents.
5. `e2e/qa-p08-storage-disclosure.spec.ts` still 6/6 green.
6. `critical-1280` and `critical-375` green; `bantOrani` still `0.23203125`.
7. All four visual projects run per project; **no golden moves**, or each that does is adjudicated per viewport in the commit message.
8. `node scripts/claims-gate.mjs` PASS; `npx tsc -b` exit 0; `npm run build` exit 0.
9. `git status` shows nothing outside the WRITE_ALLOWLIST.

R2-3 (`motion-grammar.spec.ts` at `tablet-768` / `landscape-844`) stays red —
carried to Phase 10, out of scope, do not touch.

## COMMANDS_TO_RUN — machine

8 GB, one heavy process, foreground only, one `--project=` per invocation,
`> file 2>&1`, never `run_in_background`. Build once successfully then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`; a cold build has died
with `write ENOMEM` here. QA reports one `shell-and-transition.spec.ts:172`
stall at `tablet-768` under memory pressure that was green in 9.9s in isolation —
if you see it, re-run in isolation before reporting it. `installFontRetry()`
flakes at visual-375; known, Phase 12, do not fix.

**Commit after every step.** This run has been interrupted three times.

## RETURN_FORMAT

Your agent definition's structure, plus:

```text
ITEM1_MEASURED:  which option you took and why · the failing figure before/after at 320 · the other three call sites' numbers · goldens moved (expected: none)
ITEM2_QUOTED:    the rewritten sentence(s) verbatim from the rendered DOM · your verdict on gizlilik madde 05
GUARD:           qa-p08-scroll-region-reach.spec.ts per project, unedited
```

Falsify me. Three premises fell in C4 and QA round 3 falsified two more of its
own. If the systemic fix is safe and I was too cautious, show me the
measurement.
