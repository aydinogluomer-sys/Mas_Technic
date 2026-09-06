# CODER TASK PACKET — PHASE 09a, CORRECTION 2

PHASE_ID: 09a-C2
PHASE_TITLE: The turnaround sweep C1 should have been
BASE_COMMIT: `0780ac4`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a` on **`wt/coder-p09a2`**, clean, `.env` present, `node_modules` junctioned.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES

**Do not submit the RFQ form, invoke any edge function, upload to storage or
insert a row.** An earlier agent on this phase wrote four rows and three objects
to production by trusting this repository's copy of an edge function that the
deployed one does not match. Nothing in this packet needs the network. Do not
touch those four rows or three objects — they are evidence of an unresolved user
decision. Do not deploy.

## WHY YOU ARE HERE — AND A CORRECTION TO MY OWN C1 PACKET

You were right in C1's KNOWN_RISKS #1, and I under-scoped the item twice.
Neutralising three cells left **one cell of a five-cell duration column**
reading "Teklifle birlikte" while its four neighbours still publish `1-3 gün`,
`1-2 gün`, `2-4 hafta`, `1-3 hafta`. That is locally incoherent and arguably
worse than what it replaced. This packet finishes the job.

**And I have to correct a statement I made to you in C1.** I wrote:
*"`USER_INPUTS.md` contains no lead-time, turnaround or delivery field at all —
Orchestrator-verified by grep."* **That was wrong.** My grep used Turkish terms
and the fields are English-named. The truth:

```
USER_INPUTS.md:88   QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days
USER_INPUTS.md:89   QUOTE_RESPONSE_TIME_VISIBILITY: PUBLIC_IF_VERIFIED_AND_STRATEGIC
USER_INPUTS.md:94   ON_TIME_DELIVERY_INTERNAL: 95%
USER_INPUTS.md:95   ON_TIME_DELIVERY_VISIBILITY: PUBLIC_IF_VERIFIED_AND_STRATEGIC
USER_INPUTS.md:168  QUOTE_SLA: 1-3 Days
```

Your C1 fix is still correct — a *production* turnaround is not a *quote
response* SLA — but it was made for a reason that was partly false, and you
should work from the accurate rule below rather than from what I told you.

## THE RULE — the only authority that exists, and what follows from it

**Authorised, and already correctly published:** the quote-response SLA.
`src/content/claims.ts:125-132` publishes `QUOTE_RESPONSE_TIME` as `"1-3 iş
günü"` and cites §D and §J. That is the model: a duration with a named source,
routed through `claims.ts`. **Do not touch it.**

**Not authorised by anything, anywhere:**

- **production / delivery turnaround** — how long making the part takes;
- **payment and credit terms**;
- **return, exchange or warranty guarantees**;
- **the 95% on-time figure as public copy.** It is
  `PUBLIC_IF_VERIFIED_AND_STRATEGIC`, and §1.3's default is
  `INTERNAL_ONLY_UNLESS_PUBLIC_OK`. `claims.ts:174` and
  `servicePages.ts:2362` already reference it — check what each actually does
  with it and leave anything that correctly withholds it alone.

**What to do with each unauthorised claim:**

- A **process step with an unsubstantiated duration** keeps the step and loses
  the number. Your C1 wording is the precedent and it is good: `"Teklifle
  birlikte"`, which is not a new claim — it is already published at
  `RfqAside.tsx:58`, `rfq-model.ts:82`, `SSS.tsx:138`, `caseStudies.ts:110`,
  `technicalLandingData.ts:142`.
- A **commercial policy claim** — payment terms, credit, free returns — cannot
  be softened into "with the quote", because the reader is not being told a
  number, they are being told a policy. **Remove the claim.** If removing it
  guts the answer, the honest replacement is to say the terms are agreed per
  order, and nothing more specific.

## THE INVENTORY — mine is a floor, not a ceiling. Build your own.

Measured with `grep -cE "[0-9]+ *- *[0-9]+ *(iş )?(gün|Gün|hafta|Hafta)|[0-9]+ *(iş )?(günü|Günü)|[0-9]+ *(gün|hafta) içinde"`:

| file | matching lines |
|---|---|
| `src/data/servicePages.ts` | **62** |
| `src/data/chatFaqData.ts` | 4 |
| `src/content/claims.ts` | 1 — **this is the authorised one; leave it** |

**The chatbot ones are the most serious in the tree and I want them handled
first.** `chatFaqData` is bundled and answered locally by `ChatBot.tsx`, so these
are stated to a visitor as company policy:

```
:38   "3-5 iş günü içinde prototip teslimatı mümkündür"
:48   "Prototip siparişlerde 3-5 iş günü, seri üretimde 7-15 iş günü teslimat
       sürelerimiz bulunmaktadır. Acil siparişler için özel planlama yapılabilir."
:96   "Teknik şartnameye uymayan ürünlerde ÜCRETSİZ İADE/DEĞİŞİM yapılmaktadır.
       Teslimat sonrası 7 iş günü içinde ... bildirim yapmanız yeterlidir."
:119  "İlk siparişlerde %50 ÖN ÖDEME talep ediyoruz, kalan %50 teslimatta ödenir.
       Düzenli müşterilerimize AÇIK HESAP ve 30-60 GÜN VADE imkânı sunuyoruz."
```

`:96` and `:119` are not turnaround claims at all — they are a **warranty
commitment** and **payment/credit terms**. Nothing in `USER_INPUTS.md`
authorises either.

Also named, not exhaustive: `servicePages.ts:609-613` (the five-cell column C1
half-fixed), `:2196`, `:2241`, and `:2933`'s
`metaTitle: "Hızlı Prototip Üretimi | 3-5 İş Günü | …"` — that one ships into
search results, so it is worse than a body claim.

**Build the real inventory yourself, over `src/data/**`, `src/content/**` and any
rendered copy that carries a duration or a commercial term, and put it in the
commit message.** Classify every hit: authorised with its source, or removed /
neutralised with the reason. Do not stop at my regex.

## ON THE `/hizmetler/hizli-prototip` ROUTE

You flagged the page as "built on the claim". My ruling: **the route stays.**
"Hızlı prototip" is positioning, and §1.3 permits positioning through capability;
what it forbids is the unverifiable *number*. Remove the durations, including
from the `metaTitle`, and let the page make its case on process and capability.
If after that the page has nothing left to say, tell me — that is a finding, not
a licence to invent.

## ADD THE GATE RULE — this is now earned

`scripts/claims-gate.mjs` passes with every one of these in the tree. C1's packet
told you not to add a rule; **this one tells you to.** Add rules that catch:

1. a production/delivery duration in public copy;
2. payment, credit or vade terms;
3. return / exchange / warranty guarantees.

They must **not** fire on `claims.ts`'s authorised `QUOTE_RESPONSE_TIME`, and
they must fire on the exact strings you are removing — prove both directions
with a positive control, the way §3.A's adversarial probe does. This is the same
gate-coverage class as round 1's finding that the gate has no revenue rule.

## WRITE_ALLOWLIST

```
src/data/servicePages.ts
src/data/chatFaqData.ts
src/data/*.ts                       (only where the inventory finds a claim)
src/content/*.ts                    (EXCEPT the authorised QUOTE_RESPONSE_TIME block in claims.ts)
src/pages/**  src/components/**     (ONLY where rendered copy carries an unauthorised claim; no redesign)
scripts/claims-gate.mjs             (the three new rules + their controls)
e2e/__golden__/**                   (only baselines your change explains; expect few — text-only edits)
```

## DO_NOT_TOUCH

```
src/content/claims.ts QUOTE_RESPONSE_TIME + QUOTE_RESPONSE_TIME_DISPLAY   ← authorised, cited, correct
e2e/qa-p09a-*.spec.ts  e2e/qa-p08-*.spec.ts   ← QA's; must stay green unedited
supabase/**                                    ← and no network calls to it
src/pages/Login.tsx  src/pages/SifremiUnuttum.tsx  src/pages/ResetPassword.tsx   ← 09b
src/pages/KVKK.tsx  src/pages/GizlilikPolitikasi.tsx  src/pages/CerezPolitikasi.tsx ← 09b
src/components/ChatBot.tsx                     ← the COMPONENT is 09b's; `chatFaqData.ts` is yours
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← R2-3, Phase 10 (A23)
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  reports/qa/**
package.json  package-lock.json  .claude/**  tsconfig.json
```

## ACCEPTANCE_CRITERIA

1. No unauthorised production/delivery duration, payment or credit term, or
   return/warranty guarantee remains in the **rendered** DOM of any public route
   or in any chatbot FAQ answer. Verified rendered, not by grep alone.
2. No duration column is left partly neutralised — every cell of a column speaks
   the same way.
3. `claims.ts`'s `QUOTE_RESPONSE_TIME` still renders wherever it did, unchanged.
4. `servicePages.ts:2933`'s `metaTitle` carries no duration.
5. `scripts/claims-gate.mjs` gains three rules; each fires on a positive control
   and none fires on the authorised SLA. Gate PASSes on the tree.
6. `critical-1280`, `critical-375`, four visual projects, `qa-p09a-rfq-form`,
   three `qa-p08-*` at `mobile-320` — all green, specs unedited.
7. `npx tsc -b` exit 0; `npm run build` exit 0.
8. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation,
`> file 2>&1`, never `run_in_background`. Build once then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT` — port 4174 is held by
pid 12860, which is not ours; leave it alone. Commit after every step.

## RETURN_FORMAT

```text
INVENTORY:   every hit, file:line, classified authorised / removed / neutralised, with the reason
CHATBOT:     the four answers before and after — these are the ones a visitor is told as policy
COLUMNS:     every duration column, proven internally consistent
METATITLE:   before and after
GATE:        the three rules, each with its positive control and the proof it does not fire on the SLA
GOLDENS:     moved or not
```

Falsify me again if I have it wrong. You were right last time and the packet was
wrong twice — once on scope, once on a fact I asserted as verified.
