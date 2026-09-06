# CODER TASK PACKET — PHASE 09a, CORRECTION 3

PHASE_ID: 09a-C3
PHASE_TITLE: The claim the sweep walked past, and the four it was told to leave
BASE_COMMIT: `fe3a525`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already checked out on **`wt/coder-p09a3`** at
`fe3a525`, clean, `.env` present, `node_modules` junctioned. Nothing to provision.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES

**Do not submit the RFQ form against the live project, do not invoke any edge function, do not upload to
storage, do not insert a row, do not deploy.** Earlier in this phase an agent wrote four rows to
`public.rfqs` and three objects to `cad-uploads` on the customer's production database by trusting this
repository's copy of an edge function that the deployed one does not match. Those four rows and three
objects are evidence of an unresolved user decision — do not touch them. Nothing in this packet needs the
network.

## D1 — BLOCKING. The sweep fixed the file the claim was copied *to*, not the file it was copied *from*.

`src/data/servicePages.ts:134` — `/hizmetler/cnc-frezeleme`, `faq[2]`:

```
question: "Hangi dosya formatlarını kabul ediyorsunuz?"
answer:   "STEP, IGES, Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX (.prt) ve PDF/DWG
           teknik çizim formatlarını destekliyoruz."
```

`src/utils/cadUpload.ts:4` is the only authority on this:

```ts
export const CAD_ACCEPTED_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;
```

**Nine of the formats that sentence names are rejected by the validator** — parasolid, sldprt, solidworks,
catpart, catia, prt, nx, dwg, pdf. QA proved it at runtime rather than by reading: uploading a `.sldprt`
produced the live notice *"DOSYA REDDEDİLDİ … (.sldprt) kabul edilen formatlardan biri değil."*

**Why this is worse than a stale sentence on a page.** `chatFaqData.ts`'s `collectServiceFaqs()` lifts every
`servicePages.ts` faq entry into the chatbot's answer pool — 116 of the pool's 140 entries. Six phrasings
score **1.000** onto this answer: `catia`, `catia dosyası`, `catpart`, `solidworks`, `sldprt`, `solidworks
dosyası`. The *generic* question correctly reaches the honest answer. **So the false answer is served
selectively to exactly the visitors it harms**: someone holding a SolidWorks or CATIA file asks, is told yes,
and is refused at upload.

**And it is 09a's own miss, not an inherited defect.** `chatFaqData.ts:8-10` documents removing this
identical claim from the static half of the pool, citing §J
`ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`. The file header states the
`collectServiceFaqs()` principle explicitly. The principle was applied to lead times and not to the CAD list
documented ten lines above it. The C2 diff prints line 134 as unchanged context one line below the `:133` it
did change.

## D2 — fold into the same fix. Do not restate the list; derive it.

`src/data/servicePages.ts:1967` hardcodes `"STEP, STP, STL, OBJ, IGES, IGS ve 3MF"`. That is **correct
today**, which is exactly why it is dangerous: `chatFaqData.ts:12` derives the same list from
`CAD_ACCEPTED_EXTENSIONS`, so if the validator ever changes, the derived answer follows and this literal goes
silently stale — reproducing D1 with a fresh timestamp.

**The fix for D1 and D2 is one fix: both sites derive from `CAD_ACCEPTED_EXTENSIONS`.** §J's
`DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION` is not a style preference; it is the rule that makes this class
of defect impossible. A literal that happens to be right is still a literal.

## D3 AND THE FOUR CARRIED FINDINGS — all in this same file, all still live, all verified by me

C2 was told not to touch these because they fell outside its three classes. That was correct discipline then.
It is not correct to make a third pass over a 3,000-line file later for claims we can already see, so they
come in now. **Every line number below I re-checked myself at `fe3a525`** — two of the ones I was carrying
were wrong.

| id | line | claim | why it has no authority |
|---|---|---|---|
| D3 | `:1965` | `"İlk DFM değerlendirmesi ücretsizdir."` | A free-of-charge commitment is a **commercial policy**, the class C2 removed from the chatbot. Nothing in `USER_INPUTS.md` authorises it. |
| F1 | **`:117`** (not `:77` — I was 40 lines stale) | `"HSM ile %40 daha hızlı üretim ve üstün yüzey kalitesi"` | Unsourced performance KPI. §D `OTHER_PUBLIC_KPIS: NONE`. |
| F2a | `:1922` | `"%70'e kadar maliyet tasarrufu"` | Unsourced, **inside `metaDescription`** — so it ships into search results and social cards, not just the page. |
| F2b | `:1945` | `{ label: "Maliyet Tasarrufu", value: "Ortalama %30-50" }` | Unsourced, and contradicted by that page's own FAQ, which was already corrected to say the saving depends on the part. |
| F3 | **`:2103` and `:2131`** (two sites, not one) | `"EOS M290"` | A named machine model. Phase 06 removed named models from the machine-park page under §D `MACHINE_COUNT: PRIVATE_DO_NOT_DISCLOSE` / §0 `DO_NOT_EMPHASIZE_COMPANY_SCALE`. `:2131` is **also chatbot pool entry #78**, so the model is reachable by asking the bot. |
| F4 | `:517` | `headers[2] = "Parça/Saat"` | A throughput disclosure. It matches `claims.ts` `WITHHELD_SPEC_CLASSES` **exactly** — it escapes only because that filter runs on `technicalSpecs` via `CategoryPage` and never on a `comparisonTables` header. |

**Treatment follows the rule C2 established and you applied well.** A capability keeps its substance and loses
the unverifiable number. A **commercial policy** (D3) cannot be softened into a hedge — the reader is being
told a policy, so state the mechanism instead, the way you handled returns and payment terms. F3 loses the
model name and keeps the process (DMLS metal 3D printing in Al/SS/Ti is a capability; the machine that does
it is inventory). F4: relabel or remove the column so it stops publishing parts-per-hour.

**F4 has a second half that matters more than the header.** `WITHHELD_SPEC_CLASSES` filters `technicalSpecs`
but not `comparisonTables` headers, which is why this survived. **Extend the filter to cover
`comparisonTables` headers and cells** so the next one cannot. If that turns out to be architecturally wrong
— say, because a header is not a spec and the filter would misfire — tell me rather than forcing it.

## GATE

The gate now has 29 rules and 178 controls and it did not catch a single item in this packet. Add coverage
for what you are removing here:

1. **A published CAD/file-format list that is not derived from `CAD_ACCEPTED_EXTENSIONS`.** This is the
   highest-value rule in the packet — it makes D1 unrepeatable. Fire on a literal naming a format the
   validator rejects; stay silent on a derived list.
2. **A free-of-charge / no-cost commitment** (D3's class), alongside the existing `payment-or-credit-terms`.
3. **An unsourced performance or saving percentage** (F1, F2a, F2b). Note that `delivery-or-quality-rate`
   *looks* like it should already catch these and does not — the Coder before you checked and said so.
   Widening that rule may be the honest fit rather than a new one; your call, say which and why.

Same standard as C2: each fires on a positive control drawn from **the exact strings you are removing**, and
none fires on `claims.ts`'s authorised `QUOTE_RESPONSE_TIME`. The global invariant C2 added — every rule run
against the SLA controls on every invocation — must still hold with your rules in it.

## WRITE_ALLOWLIST

```
src/data/servicePages.ts
src/data/chatFaqData.ts             (only if deriving the CAD list needs a shared helper)
src/content/claims.ts               (EXCEPT the QUOTE_RESPONSE_TIME block; the WITHHELD_SPEC_CLASSES filter is yours)
src/pages/**  src/components/**     (ONLY the WITHHELD_SPEC_CLASSES filter's call site for F4, and only if needed; no redesign)
scripts/claims-gate.mjs             (the new/widened rules + controls)
e2e/__golden__/**                   (only baselines your change explains — F4's header edit may move a table)
```

## DO_NOT_TOUCH

```
src/content/claims.ts QUOTE_RESPONSE_TIME + QUOTE_RESPONSE_TIME_DISPLAY   ← authorised, cited, correct
src/utils/cadUpload.ts              ← THE AUTHORITY. Read it, derive from it, never edit it to match the copy
e2e/qa-p09a2-*.spec.ts  e2e/qa-p09a-*.spec.ts  e2e/qa-p08-*.spec.ts   ← QA's; must stay green unedited
scripts/qa-probes/**  reports/qa/** ← QA's evidence
supabase/**                          ← and no network call to it
src/pages/Login.tsx  src/pages/ForgotPassword.tsx  src/pages/ResetPassword.tsx   ← 09b
src/pages/KVKK.tsx  src/pages/GizlilikPolitikasi.tsx  src/pages/CerezPolitikasi.tsx ← 09b
src/components/ChatBot.tsx           ← the COMPONENT is 09b's
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← R2-3, Phase 10 (A23)
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  package.json  package-lock.json  .claude/**  tsconfig.json
```

**`cadUpload.ts` being on that list is load-bearing.** The temptation when a page and a validator disagree is
to make them agree; the validator is right and the page is wrong. Adding formats to the validator would turn a
false sentence into a broken upload.

## ACCEPTANCE_CRITERIA

1. No published CAD/file-format list names a format `CAD_ACCEPTED_EXTENSIONS` rejects — verified in the
   **rendered** DOM and in the **assembled chatbot pool**, not by grep.
2. The six phrasings QA found (`catia`, `catia dosyası`, `catpart`, `solidworks`, `sldprt`, `solidworks
   dosyası`) reach an answer that is true. They do not have to reach the *same* entry; they must not reach a
   false one.
3. Both CAD-list sites derive from `CAD_ACCEPTED_EXTENSIONS`. No literal format list survives anywhere in
   `src/data/**`.
4. D3 and F1–F4 removed or neutralised, each with its reason recorded in-file.
5. The gate gains the three above; each fires on a positive control and none fires on the authorised SLA.
   Gate PASSes on the tree, and FAILs on a tree with the strings restored.
6. `critical-1280`, `critical-375`, four visual projects, `qa-p09a-rfq-form`, `qa-p09a2-*`, three `qa-p08-*`
   at `mobile-320`, `shared-shell-accessibility` — all green, specs unedited.
7. `npx tsc -b` exit 0; `npm run build` exit 0.
8. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once then `PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`, checked before
binding. **Commit after every step** — this phase has lost two agents to process kills and both times only
what was committed survived.

## RETURN_FORMAT

```text
CAD:         both sites, before and after; how the derivation works; the six phrasings re-probed
POOL:        the assembled pool re-dumped, and the CAD answers in it adjudicated
CARRIED:     D3, F1, F2a, F2b, F3 (both sites), F4 — each, before and after, with the reason
F4_FILTER:   whether WITHHELD_SPEC_CLASSES now covers comparisonTables, or why it should not
GATE:        each rule new or widened, its positive control, and the proof it is silent on the SLA
GOLDENS:     moved or not
UNVERIFIED:  anything you could not check, and why — expected to be non-empty
```

Falsify me. QA falsified two things in my last packet — the `.shell-form-error` criterion and F1's line
number — and both would have sent you to the wrong place.
