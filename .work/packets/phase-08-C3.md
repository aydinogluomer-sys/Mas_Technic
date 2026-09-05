# CODER TASK PACKET — PHASE 08, CORRECTION ROUND 3 (C3)

PHASE_ID: 08-C3
PHASE_TITLE: Inner Pages Wave B — correction round 3 (two blocking gates, two content-truth defects)
BASE_COMMIT: `aae3536` (integration branch `claude/awwwards-90-overhaul`, QA round 1 cherry-picked)

## WORKTREE — ALREADY PREPARED FOR YOU. DO NOT CREATE ANOTHER.

```
C:\Users\Trade Bilisim\pdh-wt\coder-p08     branch: wt/coder-p08c3     at: aae3536
```

It is clean, `node_modules` is a junction to the main checkout, and `.env` is
present (without `.env` every route renders the top-level error boundary and
every measurement you take is a measurement of an error page).

`cd` there first and stay there. If the harness auto-creates a worktree under
`.claude/worktrees/`, **ignore it — do not delete it and do not work in it.**
**NEVER delete any existing worktree.** One was deleted earlier in this run and
cost an hour.

## OBJECTIVE

Four defects from `reports/qa/phase-08.md` (in the tree at your base commit).
Two are red repository gates, two are false statements in published legal text.
Nothing else. This is not a phase; do not improve anything you were not asked to.

## REQUIREMENT_IDS

IMPLEMENTATION.md §7 PHASE 08 acceptance criteria 2 and 5; §12 (visual
acceptance); §13 (content truth); §1.3 (truth is not publication permission).

## READ_FIRST

1. `reports/qa/phase-08.md` — DEFECT 1, DEFECT 2, DEFECT 3, DEFECT 4.
2. `e2e/technical-landing.spec.ts:253-271` — the assertion and its Phase 04 comment.
3. `src/components/shell/footer-groups.ts` — the whole file, including the header comment.
4. `e2e/visual/radius-census.ts:122-168` and `e2e/visual/radius-census.spec.ts:80-135`.
5. `src/pages/GizlilikPolitikasi.tsx:118-137` and `:198-235` — the wording D3 must mirror.
6. `USER_INPUTS.md` §J (retention/deletion: `UNKNOWN_REMOVE_IF_UNVERIFIED`) and §K.
7. Skills: `mas-content-truth` for D3/D4, `mas-grid-system` + `mas-navigation-ia` for D1.

---

## DEFECT 1 (BLOCKING) — the two new footer links break `critical-1280`

### What is red

```
npx playwright test e2e/technical-landing.spec.ts --project=critical-1280 -g "reference proportions"
  expect(footer.bantOrani).toBeLessThan(0.26)   ->   received 0.2671875   (3 identical runs)
```

`.tl-footer` height / 1280. `0.2671875 x 1280 = 342 px`. The bound is
`< 0.26`, i.e. `< 332.8 px`. `critical-*` is the family
`playwright.config.ts` calls "PR'ı bloke eden hızlı kapı".

### The measurements you are given (Orchestrator-verified; falsify them, do not trust them)

| fact | value | source |
|---|---|---|
| footer height before Phase 08 | 298 px | `git show 7dcfb65~1:e2e/__golden__/win32/visual-1280/shell-footer-home.png` is 1278x298 |
| footer height now | 342 px | the assertion's own reading, 0.2671875 x 1280 |
| ratio before | 0.2328 | 298 / 1280 |
| gate ceiling | 332.8 px | 0.26 x 1280 |
| implied row pitch | ~22.5 px | 45 px / 2 added rows — CONFIRM THIS BY MEASURING, it is a division, not an observation |

Footer column row counts, counted from source at your base commit:

| column | source | rows before 08 | rows now |
|---|---|---|---|
| HİZMETLER | `family("Hizmetler")` | 5 | 5 |
| KABİLİYETLER | `family("Kabiliyetler")` | 5 | 5 |
| ENDÜSTRİYEL | `family("Endüstriyel")` | 6 | 6 |
| KURUMSAL | `homeLink + companyLinks + resourceLinks` | 6 | **8** |

The band is as tall as its tallest column. Tallest went 6 -> 8, and the band
went 298 -> 342.

### The one thing the Phase 04 comment gets wrong, and the one thing it gets right

The comment at `e2e/technical-landing.spec.ts:255-270` predicts the trip point
as "a link column growing past ~9 rows". That estimate is **wrong**, and it is
contradicted by the same comment's own correct figure: it says headroom over
the measured value is 11%, and 11% of 298 px is 34.8 px — about **1.5 rows**.
From a 6-row column the guard therefore trips at **8** rows, which is exactly
what happened. The bound `0.26` is the part Phase 04 actually set and measured;
the "~9 rows" sentence is an unmeasured illustration that overstates the room
by roughly one row.

So: the guard fired correctly. Do not read "the comment said 9 and we only have
8" as evidence that the constant is wrong.

### The rule for this defect

**DO NOT CHANGE `0.26`.** Not to 0.27, not to a computed constant, not to a
per-viewport table. QA's judgement, which I adopt: moving it would be the third
re-aiming of the same assertion in four phases and would make it unfalsifiable.

Absorb the two links instead. If — and only if — you can demonstrate by
measurement that no defensible arrangement fits under 332.8 px, **STOP and
report `BLOCKED` with the measurements.** Re-deriving the contract is an
Orchestrator decision, not yours.

### Where you may fix it

**`src/components/shell/footer-groups.ts` only.**

`src/components/navigation/ia.ts` is DO_NOT_TOUCH for this defect, and the
reason is measurable: `resourceLinks` is also read by
`src/components/navigation/NavDirectory.tsx:50-53` — which prints
`resourceLinks.length` as a zero-padded index in the fullscreen menu — and by
`src/pages/NotFound.tsx:150,164`, whose 8-entry directory is QA's criterion-1
evidence. Removing an entry from `resourceLinks` silently edits the menu and
the 404. Change how the **footer composes its four columns**, not what the
site's IA publishes.

### The option space (arithmetic only — you decide, and you measure)

Predicted band height = 298 + (tallest_rows - 6) x pitch.

| arrangement | tallest column | predicted height | predicted ratio | rows of headroom left |
|---|---|---|---|---|
| today | KURUMSAL 8 | 342 | 0.2672 | RED |
| both new links -> KABİLİYETLER | KABİLİYETLER 7 | ~320.5 | ~0.2504 | 0 |
| one -> KABİLİYETLER, one stays in KURUMSAL | 7 | ~320.5 | ~0.2504 | 0 |
| `Kabiliyet Profilleri` -> KABİLİYETLER (6), `Kalite Dosyası` stays in KURUMSAL, `Ana Sayfa` leaves the footer column (6) | 6 | ~298 | ~0.2328 | 1 |

ENDÜSTRİYEL is already 6 and cannot absorb anything without becoming the new
tallest. You are free to choose an arrangement I have not listed. Constraints:

- Four columns. **No fifth column** — `.tl-footer nav` occupies master columns
  5–12 at two each; a fifth puts every interior boundary off-axis and
  `scripts/grid-axis-probe.mjs` fails. The reason is written in the file's own
  header comment.
- Every arrangement must be **semantically defensible in writing**. A reference
  surface filed under the family column it continues is defensible. A quality
  document filed under machining services is not.
- Both routes must stay reachable: `e2e/landing/navigation-reachability.spec.ts`
  must stay green.
- If your chosen arrangement leaves **0 rows of headroom**, say so explicitly in
  the `footer-groups.ts` comment, with the number, so the next person adding a
  footer link knows the next row trips a blocking gate.

### Required documentation for D1

Extend the header comment in `footer-groups.ts` with a short section stating:
what moved and why, the measured row counts per column, the measured
`.tl-footer` height and ratio at 1280, and the remaining headroom in rows. The
existing header comment is the model for tone and precision — match it.

### The failure 931594f made, which you must not repeat

`931594f` and `85a7d8b` rebanked 23 + 3 goldens for the footer growth and
adjudicated them per viewport — carefully and, per QA's independent re-check,
correctly. What they never ran was the `critical-*` projects, where the same
+45 px is a numeric contract rather than a picture. **Run `critical-1280` and
`critical-375` before you commit anything that touches the footer.**

---

## DEFECT 2 (BLOCKING) — a Phase 08 edit moved a line the radius register cites

### What is red

```
npx playwright test --project=visual-1280 e2e/visual/radius-census.spec.ts
  "§4's source column still lands on a radius declaration"
  + Array [ "src/components/ChatBot.tsx:225" ]
```

### The correction to QA's stated fix — read this, it is the part QA left incomplete

QA reports the fix as "a one-line citation update in
`docs/lean/17-inner-page-composition.md:137`". That alone will turn the OTHER
test in the same file red. Verify this yourself before you edit:

- `e2e/visual/radius-census.ts:152-153` holds `file: "src/components/ChatBot.tsx", lines: "225"` inside `RADIUS_SOURCES`.
- `foldRegister` (`radius-census.ts:194`) builds each row's `source` cell as `` `${basename(source.file)}:${source.lines}` `` — i.e. **from `RADIUS_SOURCES`, not from the document**.
- The test `every number in docs/lean/17 §4 comes back out of the browser` asserts `measured` (rendered rows, source cell included) `toEqual` `documented` (the table parsed out of the markdown).

So the code constant and the document cell are one contract in two files and
must move together. Change only the `lines` field; do not touch `matches`.

### The four drifted citations (verified at your base commit)

| where | says | truth now |
|---|---|---|
| `e2e/visual/radius-census.ts:153` | `lines: "225"` | the launcher `rounded-full` is `ChatBot.tsx:294` |
| `docs/lean/17-inner-page-composition.md:137` | `` `ChatBot.tsx:225` `` | same |
| `docs/lean/17-inner-page-composition.md` ~`:186-187` (the "Excluded" paragraph) | `ChatBot.tsx:276-346` for the in-panel avatar/chip radii | those `rounded-full` declarations are now at `:345, :357, :369, :395, :428, :434` |
| `docs/lean/17-inner-page-composition.md` ~`:180-183` | "`ChatBot.tsx` (`7a5daf0`) … byte-identical" to the Phase 06 close | **false.** `git hash-object src/components/ChatBot.tsx` = `44d9bafc8f7f03b9645e87c617727bb9a348b5a6`. `CustomCursor.tsx` is still `98e64abfb04f37da1f739224ce60d250c4964130`, so that half of the sentence holds. Re-word so only the true claim survives: the six **declarations** are unchanged; the ChatBot **file** is not. |

Nothing about the rendered radius changed. This is a citation repair, not a
design change. Do not edit any component to make a citation true.

---

## DEFECT 3 (CONTENT TRUTH — the heaviest finding) — `/kvkk` still says transfers happen in exactly two cases

### What is false

`src/pages/KVKK.tsx`, clause `aktarim` (~`:86-99`):

> "Aktarım **iki hâlde** olur: yetkili kamu kurum ve kuruluşlarının kanuna
> dayalı talebi, ve bu sitenin çalışması için kullanılan barındırma ile veri
> tabanı altyapısının hizmet sağlayıcısı."

A third transfer exists and this phase disclosed it in the other two documents.
Commit `5138fc1` — whose subject is *"the chat does not stop at our backend — it
goes to Google, so say that"* — touched `CerezPolitikasi.tsx` and
`GizlilikPolitikasi.tsx` and **not** `KVKK.tsx`. The one document whose statutory
job is to enumerate *aktarım* is the one that was missed.

It is in scope by the document's own rule: madde 02, in this phase's own new
wording, says "Yüklediğiniz dosyanın içeriği kişisel veri taşıyorsa … o veri de
bu metnin kapsamındadır." Text a visitor types into the chat is content-borne
personal data of exactly that kind. **A closed list that is now incomplete is
worse than an omission**, which is why this ranks above D4.

### What to write

Two clauses in `src/pages/KVKK.tsx`:

1. **`aktarim`** — the enumeration becomes complete. The third case: if the
   visitor gives AI consent in the chat, the conversation up to that point is
   sent through the site's own server function to Google's Gemini service.
2. **`islenen-veriler`** (madde 02) — the mirror gap. It lists the RFQ form and
   the account e-mail and does not mention the chat.
   `GizlilikPolitikasi.tsx:133-137` is the model for the sentence.

Word it from `src/components/ChatBot.tsx` and from
`src/pages/GizlilikPolitikasi.tsx:198-235`. Keep KVKK.tsx's own register —
statutory, plain, no marketing.

### Hard limits on the wording (§13, §1.3, USER_INPUTS §J)

- **Claim nothing about what Google does with the text.** No retention, no
  training, no deletion, no security posture, no "geçici olarak işlenir".
  Nothing in this repository can establish any of it. `GizlilikPolitikasi.tsx`
  handles this correctly — "orası bizim göremediğimiz bir yer ve sizin adınıza
  doğrulayamayacağımız bir şeyi burada yazmıyoruz" — reuse that stance.
- No retention period, no deletion timetable, no encryption or NDA guarantee.
  Clause 05's existing statutory-position wording is the precedent.
- Do not weaken the two true statements already there (no sale, no marketing
  transfer).
- State what the repository *can* prove and QA verified: the transfer happens
  only after explicit consent; only the conversation text is sent; the edge
  function forwards no browser header, so no IP reaches Google
  (`supabase/functions/chat/index.ts:34-45`); the text is not written to the
  site's database.
- **No cross-route `#hash` link.** `ScrollToTop.tsx` overrides native fragment
  scrolling, so `/gizlilik-politikasi#sohbet-asistani` lands the reader at the
  top of a seven-clause document (measured: the clause sits 2115 px below a
  900 px viewport). That is a known carried defect, not yours to fix here.
  Cite the clause by number in prose — "Gizlilik Politikası'nın 06. maddesi" —
  and link to `/gizlilik-politikasi` without a fragment, the way
  `CerezPolitikasi.tsx` madde 03 already does.

---

## DEFECT 4 (CONTENT TRUTH) — the cookie policy's storage list claims completeness and is short by one

`src/pages/CerezPolitikasi.tsx` madde 01 says "Sakladığı şeyler … hepsi 02.
maddede listelenmiştir". `STORAGE_ROWS` (`:58-84`) lists four records.
A fifth exists: `mas_intro_seen`, written at `index.html:314`
(`sessionStorage.setItem(KEY, "1")`) by the inline "Precision Born" intro
script.

**Add the fifth row. Do not weaken the completeness claim** — that sentence is
the valuable part of the clause, and it is cheaper to make it true than to
water it down.

The row must be true and no more than true, from `index.html:294-316`:

- store: `sessionStorage`
- purpose: it records that the entry sequence has already played, so it plays once
- written only on `/` (`onLanding`), and not at all under `prefers-reduced-motion: reduce`
- lifetime: until the tab is closed — that is what `sessionStorage` is; do not invent a duration
- it is a one-bit UI-state flag: not tracking, not identifying, never sent
  anywhere — consistent with the "hiçbiri reklam veya profilleme amacı taşımaz"
  note already under the table

Match the existing four rows' column shape and tone exactly.

The no-cookie claim in madde 01 is **true** — QA measured zero cookies over six
public routes. Leave it alone.

---

## WRITE_ALLOWLIST

```
src/components/shell/footer-groups.ts          (D1)
src/pages/KVKK.tsx                             (D3)
src/pages/CerezPolitikasi.tsx                  (D4)
docs/lean/17-inner-page-composition.md         (D2 — register table cell, Excluded paragraph, blob-hash sentence)
e2e/visual/radius-census.ts                    (D2 — the `lines` field of the `chat launcher` entry, NOTHING ELSE)
e2e/__golden__/**                              (D1 — only baselines whose diff the footer change explains; see the golden protocol)
e2e/technical-landing.spec.ts                  (COMMENT PROSE ONLY — see the exact condition below)
```

`e2e/**` is QA-owned under IMPLEMENTATION.md §3.3. The three entries above are
an **explicit, narrow grant** for this packet, because the register contract
spans a doc and a test file and cannot be made green from one side. Do not
extend it.

### The one permitted edit to `e2e/technical-landing.spec.ts`

The comment's "a link column growing past ~9 rows" is a false statement that
this defect just falsified. You may correct that sentence to the measured trip
point, showing the arithmetic (298 px, the measured pitch, the 332.8 px
ceiling), **on one condition**: every executable line in the file is
byte-identical before and after. Prove it in your return —
`git diff -U0 e2e/technical-landing.spec.ts` must show no changed line outside a
comment, and `0.26` must still be `0.26`. If you would rather not touch the file
at all, skip it. It is the one optional item in the packet, and skipping it is
not a failure.

## DO_NOT_TOUCH

```
src/components/navigation/ia.ts                ← D1's blast radius; see the reasoning above
src/components/ChatBot.tsx                     ← D2 is a citation repair; the component is correct
src/components/ScrollToTop.tsx                 ← carried defect, Phase 09
src/pages/TeklifAl.tsx  src/pages/Login.tsx  src/pages/CADDashboard.tsx
src/components/ui/sonner.tsx                   ← DEFECT 5, an open Orchestrator decision, not in this packet
src/pages/GizlilikPolitikasi.tsx               ← already correct; it is the model, not the target
supabase/**   docs/supabase-full-setup.sql
src/pages/admin/**   src/pages/musteri-paneli/**   (and every /admin, /musteri-paneli route)
PROGRESS.md   IMPLEMENTATION.md   USER_INPUTS.md
reports/qa/**                                  ← QA's, including phase-08/
.claude/**   tsconfig.json                     ← uncommitted changes there are INTENTIONAL. Do not commit, revert or clean them.
package.json  package-lock.json                ← no new dependency, for any reason
src/styles/z-index.ts                          ← unless you have a measured reason, and then say so
```

## ACCEPTANCE_CRITERIA

1. `npx playwright test e2e/technical-landing.spec.ts --project=critical-1280` — green, with `bantOrani` reported as a measured value and the headroom stated in rows.
2. `npx playwright test --project=critical-375` — green.
3. `npx playwright test --project=visual-1280 e2e/visual/radius-census.spec.ts` — all three tests green, including `every number in docs/lean/17 §4 comes back out of the browser` and the drift control.
4. `npx playwright test e2e/landing/navigation-reachability.spec.ts --project=<one project>` — green; `/kabiliyet-profilleri` and `/kalite-dosyasi` still reachable.
5. The four visual projects (`visual-375`, `visual-768`, `visual-1280`, `visual-1440`) run per project, in foreground, in chunks. Every golden either matches or is rebanked under the protocol below.
6. Rendered `/kvkk` enumerates three transfer cases, names the Gemini transfer, and asserts nothing about Google's behaviour after receipt. Rendered madde 02 mentions the chat.
7. Rendered `/cerez-politikasi` madde 02 lists five storage records including `mas_intro_seen`; madde 01's completeness claim is unchanged and now true.
8. `node scripts/claims-gate.mjs` — PASS, 0 unverified claims.
9. `npx tsc -b` exit 0; `npm run build` exit 0.
10. `git status` in the worktree shows nothing outside the WRITE_ALLOWLIST.

## GOLDEN PROTOCOL (IMPLEMENTATION.md §12)

Golden files are evidence. `--update-snapshots` is not a way to silence a test.

For every baseline you rebank:

1. Adjudicate it **per viewport before regenerating**: height delta, first
   changed row, and confirmation that nothing above the footer moved.
2. `reports/qa/phase-08/probe-golden-rebank.mjs` and `probe-golden-shift.mjs`
   are committed in your tree at the base commit and do exactly this
   (threshold 16/255). Reuse them rather than writing new ones. Read them
   first — they are QA's, so you are borrowing an instrument, not editing it.
3. Put the resulting table in the commit message, viewport by viewport, the way
   `931594f` did. That commit's adjudication was correct and QA falsified it
   row by row without breaking it; it is the standard.
4. A golden whose diff the footer change does **not** explain is a finding, not
   a rebank. Stop and report it.

## COMMANDS_TO_RUN — and the machine you are on

This machine has **8 GB of RAM. One heavy process at a time.** Nothing else will
be running against it while you work; keep it that way.

- Playwright: always `--project=<one project>`, always **foreground**. Never
  `run_in_background`. The critical suite gave 3 phantom failures in one pass
  and 163/163 when split into 5 chunks — split by spec file or by `-g`.
- Redirect output to a file: `> path/to/log.txt 2>&1`. A PowerShell pipeline
  (`| Select-Object -Last N`) buffers to the end and leaves a 0-byte file if the
  process is killed. That happened twice in this run.
- Forgotten preview servers have been seen on ports 4173, 4187, 4190, 4191,
  4199. `Get-NetTCPConnection -LocalPort <p> -State Listen` then `Stop-Process`
  works here; `pkill -f "vite preview"` does **not** work on this machine.
- Ad-hoc browser probes: the config expects `chromium-1217` and a different
  build is installed. Pass
  `executablePath: "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"`.
- `scripts/claims-gate.mjs` resolves `REPO_ROOT` from its own location
  (`dirname(script)/..`). Run it in place; a copy elsewhere silently scans 0
  files and reports 0 violations.
- PowerShell is the primary shell. If the Bash tool returns a classifier
  unavailability error, switch to PowerShell rather than retrying Bash.

## HOW TO NOT LOSE WORK (this run has paid for each of these)

- **Commit after every step.** Not at the end. A QA agent died to a 529 with its
  commit standing; a Coder hit the watchdog twice and kept four commits. The
  agent that batches its work is the one that loses it.
- **Every measurement goes into a file or a commit message, immediately.** The
  most expensive loss in this run was a browser measurement taken inside a
  600-second window, never committed, existing nowhere on disk.
- A 529 or `ENOTFOUND` is server-side. It is not your bug and not a reason to
  change approach.

Suggested commit sequence — four commits, each independently green:

```
1. fix(footer):   D1  (footer-groups.ts + its comment)    -> critical-1280, critical-375
2. test(visual):  D1  (golden rebank, adjudicated)        -> the four visual projects
3. docs(radius):  D2  (docs/lean/17 + radius-census.ts)   -> radius-census.spec.ts
4. docs(legal):   D3 + D4 (KVKK.tsx, CerezPolitikasi.tsx) -> claims gate, build, rendered check
```

Commit message bodies carry the measurements. Follow the repository's existing
style: the subject says what changed and why, in one lower-case line, no period.

## RETURN_FORMAT

Your agent definition's structure, plus these four fields:

```text
D1_MEASURED:   arrangement chosen · rows per column after · .tl-footer height and ratio at 1280 · headroom in rows · row pitch as measured, not divided
D1_GOLDENS:    each rebanked baseline · height delta · first changed row · why the footer explains it
D2_VERIFIED:   the three radius-census tests, with the source cell before and after
D3_D4_QUOTED:  the exact new sentences, so the Orchestrator can check them without opening a browser
```

If you conclude any part of this packet is wrong — the arithmetic, the row
counts, the claim that `ia.ts` must not move, the option space — **say so with
the measurement that shows it.** Both the Coder and QA falsified Orchestrator
premises more than once in this run. That is the process working, not a problem.
