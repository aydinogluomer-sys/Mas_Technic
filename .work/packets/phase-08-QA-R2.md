# QA TASK PACKET — PHASE 08, VERIFICATION ROUND 2

PHASE_ID: 08 (QA round 2, after correction packet C3)
CODE_COMMIT: `b77be5c` — integration branch `claude/awwwards-90-overhaul`
PRIOR_QA: `reports/qa/phase-08.md` at round 1 (FAIL). It is in your tree. Read it first.

## WORKTREE — ALREADY PREPARED. DO NOT CREATE OR DELETE ANY WORKTREE.

```
C:\Users\Trade Bilisim\pdh-wt\qa-p08      branch: wt/qa-p08r2      at: b77be5c
```

Clean, `node_modules` junctioned, `.env` present (A18: without it every route is
the top-level error boundary and you would measure an error page), and your own
round-1 evidence is still at `reports/qa/phase-08/`. If the harness auto-creates
a worktree under `.claude/worktrees/`, ignore it — do not work in it, do not
delete it. **NEVER delete an existing worktree.**

## WHAT CHANGED SINCE YOUR ROUND 1

Five commits, `7f871ad..b77be5c`, all from correction packet C3
(`.work/packets/phase-08-C3.md`, in your tree — read it, it is the contract the
Coder worked to):

```
2994246 fix(footer): the fourth column stopped taking every resource link, and the band came back to 297px
17c5b3c test(visual): rebank 21 footer goldens for the 297px band, adjudicated per viewport
e62e96c docs(radius): the launcher moved to line 294, and a file hash was vouching for a declaration
64edf48 docs(legal): /kvkk said transfers happen in exactly two cases, and the cookie table was short by one
b77be5c docs(test): the footer guard trips at 8 rows, not the "~9" this comment guessed
```

Orchestrator review already done, and **not** to be repeated by you: scope audit
against the C3 allowlist (clean), `e2e/technical-landing.spec.ts` proven
comment-only (executable lines byte-identical, `0.26` unchanged),
`radius-census.ts` limited to one `lines` field, `ia.ts` untouched. Two gates
re-run independently at `b77be5c`: `critical-1280` 15/15, radius citation +
control 2/2. Your job is not to repeat my review — it is to measure what I
cannot see from a diff.

## ADJUDICATED SCOPE — READ BEFORE YOU SCORE CRITERIA 3 AND 5

Round 1 failed criteria 3 and 5. Both are now Orchestrator-adjudicated as
CARRIED to Phase 09, recorded in `PROGRESS.md` as **A20** and **A21**. C3 did
not address them and was not asked to.

- **Criterion 5** (CAD-parse / form error still a stock sonner toast) — CARRIED
  per A20, on the plan's authority: `IMPLEMENTATION.md` §7 PHASE 09 names
  `TeklifAl.tsx` and names these exact failure states. You were right that the
  write-allowlist claim was unverifiable — the Phase 08 packets were never
  written to disk, so nothing in the repo records it. That half is dropped; the
  §7 half stands.
- **Criterion 3** (five routes in the old language) — CARRIED per A21.
  `/cad-dashboard` is not a fifth problem: `ia.ts` records it as a redirect alias
  for `/teklif-al`, which is why you measured identical symptoms. The three auth
  routes go to Phase 09b.

**So: do not re-fail Phase 08 on criteria 3 or 5.** Record them as CARRIED with
the assumption ID, re-measure them, and say so **if the measurement has changed**
— a criterion that got *worse* while carried is a finding I need.

Everything else is scored normally. If you find a new blocking defect anywhere,
Phase 08 fails again; carried status is not a shield.

## MANDATORY_TESTS

### 1. The two gates that caused this round (re-measure, do not take my word)

- `e2e/technical-landing.spec.ts` at `--project=critical-1280` and `--project=critical-375`.
- **Report the measured `bantOrani` as a number, not a pass/fail.** Round 1's
  `0.2671875` was measured three times by you; the Coder reports `0.2320312`
  after the fix, from a 297 px band. This will be the third independent reading.
- `e2e/visual/radius-census.spec.ts` at `--project=visual-1280` — **all three
  tests**, including the browser census (`every number in docs/lean/17 §4 comes
  back out of the browser`). That is the one QA's round-1 stated fix would have
  turned red, and it is the one that proves the doc cell and `RADIUS_SOURCES`
  moved together.

### 2. Falsify the D1 footer claim the way you falsified the rebank in round 1

The Coder's account: `/kabiliyet-profilleri` moves to the KABİLİYETLER column,
`/kalite-dosyasi` stays in KURUMSAL, `Ana Sayfa` leaves the footer entirely;
row counts become 5 / 6 / 5 / 6; band 342 px → 297 px; headroom exactly one row.

Check, in the browser:

- the four columns' actual link counts and the measured row pitch;
- that **every** `resourceLinks` entry still appears in the footer exactly once
  (the composition takes the complement, so prove the complement holds);
- that `Ana Sayfa` leaving costs the reader nothing: the header brand
  (`Header.tsx:489`) and menu brand (`Header.tsx:552`) both link `/` — verify at
  **375 as well as 1280**, because a mobile reader who lost a footer row needs
  the header affordance to be real and reachable;
- `e2e/landing/navigation-reachability.spec.ts` green, `/kabiliyet-profilleri`
  and `/kalite-dosyasi` still reachable;
- the fullscreen menu's KAYNAKLAR index still prints `05` and the 404 directory
  still has 8 entries — `ia.ts` was not touched, so both are controls: if either
  moved, the fix leaked into the IA.

### 3. Falsify the 21-golden rebank (your round-1 method, applied again)

`probe-golden-rebank.mjs` and `probe-golden-shift.mjs` are yours and are in your
tree. The Coder borrowed them, re-pointed two constants to run outside your
worktree, and reports it did not write to `reports/qa/**` — confirm that.

Claim under test: the only change is the footer band shrinking by two row
pitches at 1280/1440 and one at 768, with nothing above the footer moving, and
**zero** movement at 375 because `.tl-footer nav` computes to `display: none`
there. That last one is a new claim and the most interesting: it says a whole
viewport is structurally immune to this class of change. Test it.

Also confirm the negative space: no `shell-header-*`, `inner-*`, `navigation-*`
or `waveb-*` baseline was regenerated, and those specs pass against the
**committed** baselines.

### 4. The legal texts, from the rendered DOM (not the source)

- `/kvkk` madde 04 must enumerate **three** transfer cases and name the Gemini
  one. Madde 02 must bring chat text into scope.
- It must assert **nothing** about what Google does after receipt. Read the
  clause adversarially: any sentence that implies retention, deletion, training,
  security posture or "temporary processing" is a defect.
- Everything it *does* assert must be provable from this repository. In
  particular re-verify, against `supabase/functions/chat/index.ts`, that no
  browser header (and therefore no IP) is forwarded and that nothing is written
  to the database. You proved both in round 1; the claim is now in a second
  document, so it is worth one more pass.
- Exactly one link in madde 04, to `/gizlilik-politikasi`, with **no `#`
  fragment** (`ScrollToTop.tsx` would strand the reader — carried defect).
- Unchanged and still true: "satılmaz", "pazarlama amacıyla … devredilmez",
  clause 05's statutory retention wording. No retention period, deletion
  timetable, encryption or NDA claim may have appeared.
- `/cerez-politikasi` madde 02 must render **five** storage rows including
  `mas_intro_seen`, and madde 01's "hepsi 02. maddede listelenmiştir" must be
  byte-unchanged. Verify the new row against `index.html:294-316` — sessionStorage,
  written only on `/`, not written under reduced motion, lifetime = tab.
- Check the five-row table's **layout** at 375 / 768 / 1280. The new row's
  third cell is markedly longer than the other four; `ShellSpecTable` has
  `numericFrom={4}`. No golden covers the legal routes (`wave-b-golden.spec.ts:37`
  says so deliberately), so this is the only thing that will look at it.

### 5. Close round 1's own open list

You named these unverified. They are now the phase's remaining risk:

- **`mas_intro_seen` is the only unlisted storage key** — this is now
  load-bearing, because madde 01's completeness claim depends on it. Enumerate
  cookies + localStorage + sessionStorage across every public route, in one
  context and in a fresh one, including the landing (where the intro script
  runs) and including a reduced-motion context (where it must NOT be written).
- the full `desktop-1280` regression that the process exit cut off;
- the other regression viewports;
- `smoke-firefox-*` and `smoke-webkit-*`;
- contrast at 375 with the glyph-free instrument.

Chunk them. A partial run you report honestly is worth more than a full run you
lose to a watchdog.

### 6. One new permanent gate (this is yours to write)

D4 was a legal-text claim about browser storage that nothing tested, and it was
wrong for as long as it existed. Add a spec that enumerates the browser's actual
storage keys over the public routes and asserts the set is covered by
`STORAGE_ROWS` in `src/pages/CerezPolitikasi.tsx`. It must fail if a new key
appears and nobody adds a row — which is exactly the failure that shipped. Give
it a negative control the way your round-1 specs do, so a checker that passes
everything is distinguishable from a working one.

### 7. One truth-check I want closed before Phase 09 scopes privacy

Both `/kvkk` (new) and `/gizlilik-politikasi` (since `5138fc1`) tell the reader
to use the RFQ flow instead of the chat, because data left there "hiçbir yapay
zekâ servisine gönderilmez". `supabase/functions/` also contains `finance-ai`,
`ocr-invoice` and `parasut-sync`. Trace whether anything an RFQ submission
writes can reach those functions — including admin-triggered paths over the same
rows or the same storage bucket. I am not asking you to judge the admin surface;
I am asking whether that sentence is true as written. If it is not, it is a
content-truth defect in two published documents and it blocks.

## READ_ONLY_PRODUCTION_PATHS

All of `src/**`, `index.html`, `public/**`, `supabase/**`, `docs/**`,
`playwright.config.ts`, `scripts/**`, and every existing `e2e/**` spec and
golden. You may read anything. You may not modify production code to make a
criterion pass, and you may not regenerate a golden.

**`--update-snapshots` is forbidden, for any reason, as in round 1.** If a
golden mismatches, that is the finding.

## QA_WRITE_ALLOWLIST

```
e2e/qa-p08-*.spec.ts            (your own specs, including the new storage gate)
reports/qa/phase-08.md          (rewrite as round 2, keeping round 1's record visible)
reports/qa/phase-08/**          (evidence, probes, shots)
```

Nothing else. `PROGRESS.md`, `IMPLEMENTATION.md`, `USER_INPUTS.md`, `.claude/**`
and `tsconfig.json` are not yours — and the uncommitted changes under `.claude/`
and `tsconfig.json` in the primary checkout are intentional user state.

## COMMANDS_TO_RUN — machine notes, updated since round 1

- **8 GB RAM, one heavy process at a time.** Nothing else will run against the
  machine while you work.
- **Ports 4173 / 4187 / 4190 / 4191 are now free** — I stopped four forgotten
  preview servers from dead agents. The trap they created (a run silently
  testing another worktree's `dist`) is gone, but re-check before you rely on it.
- **A cold `npm run build` died with `write ENOMEM` on this box today** under
  ~1 GB free. If that happens: build once, successfully, then run subsequent
  suites with `PLAYWRIGHT_PREVIEW_ONLY=1` so Playwright serves the existing
  `dist` instead of rebuilding. `PLAYWRIGHT_PORT=<free port>` picks the port;
  `--strictPort` is already set.
- Playwright: one `--project=` per invocation, **foreground**, chunked. Never
  `run_in_background`. Round 1's critical suite gave 3 phantom failures in one
  pass and 163/163 in five chunks. The Coder measured
  `navigation-reachability.spec.ts:240` at 30–54 s inside a 60 s budget — under
  load it can exceed it, and that is a known machine artifact, not a defect;
  re-run it in isolation before reporting it.
- Redirect to a file: `> path 2>&1`. A PowerShell pipeline buffers to the end and
  leaves a 0-byte file when the process is killed. That happened twice.
- Ad-hoc probes: config expects `chromium-1217`, a different build is installed.
  Pass `executablePath: "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"`.
- `scripts/claims-gate.mjs` resolves `REPO_ROOT` from its own location. Run it in
  place, or put your copy in a tree whose `scripts/` folder it sits in — otherwise
  it silently scans 0 files and reports 0 violations.
- `e2e/visual/fonts.ts`'s `installFontRetry()` flaked twice for the Coder at
  visual-1440 ("intercepted 0 requests on fonts.gstatic.com"). Known, unrelated
  to this change, clean on re-run. Note it if you see it; it feeds a Phase 12
  decision about self-hosting the three font families.
- PowerShell is primary. If the Bash tool returns a classifier unavailability
  error, switch rather than retry.

## HOW TO NOT LOSE WORK

- **Commit after every step.** You were killed by a 529 in round 1 and your
  commit survived — that is why round 1 exists as evidence. Do it again.
- **Every measurement goes to a file or a commit message the moment you take
  it.** The most expensive loss in this run was a browser measurement inside a
  600-second window that was never written anywhere.
- 529 / `ENOTFOUND` are server-side. Not your bug, not a reason to change plan.
- Evidence files use `.txt`, not `.log` — `.gitignore:3` is `*.log`, and
  evidence that cannot be committed is not evidence. You worked this out in
  round 1; keep doing it.

## REPORT_PATH

`reports/qa/phase-08.md` — rewritten as **round 2**. Keep round 1's verdict and
its evidence legible (a round-2 report that hides what round 1 found is worse
than no report); state clearly what changed, what you re-measured, and what you
still could not verify. The "what the phase got right, with the measurement"
section from round 1 should survive in some form: a report that lists only
failures misrepresents the work.

## RETURN_FORMAT

Your agent definition's structure, plus:

```text
GATES:            bantOrani measured at 1280 · critical-1280 / critical-375 results · radius-census 3 tests
D1_FALSIFIED:     what you could and could not reproduce of the Coder's footer account, with numbers
GOLDENS:          21 rebanked baselines re-adjudicated · the 375 "structurally immune" claim, tested
LEGAL:            the exact rendered sentences you checked, and every claim you could NOT source from the repo
STORAGE:          the full enumerated key set, per route, plus the reduced-motion context
CARRIED:          criteria 3 and 5 re-measured, stated as CARRIED (A20/A21), and whether either got worse
RFQ_AI_CLAIM:     true or false as written, with the trace
VERDICT:          PASS | FAIL, and if FAIL, exactly which criterion and what the smallest fix is
```

Falsify me. Round 1 falsified two Orchestrator premises and C3 falsified a third
(my footer row-count table said ENDÜSTRİYEL had 6 rows; it has 5, because I
counted a family's own path alongside its first child's). That is the process
working. Report what you measured, not what the packet expects.
