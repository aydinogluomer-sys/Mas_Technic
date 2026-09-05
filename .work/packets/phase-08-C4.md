# CODER TASK PACKET — PHASE 08, CORRECTION ROUND 4 (C4)

PHASE_ID: 08-C4
PHASE_TITLE: Inner Pages Wave B — correction round 4 (a legal table nobody can read on a phone, and a third party four published sentences deny)
BASE_COMMIT: `a5e4e7d` (integration branch `claude/awwwards-90-overhaul`, QA round 2 cherry-picked)

## WORKTREE — ALREADY PREPARED. DO NOT CREATE OR DELETE ANOTHER.

```
C:\Users\Trade Bilisim\pdh-wt\coder-p08     branch: wt/coder-p08c4     at: a5e4e7d
```

Clean, `node_modules` junctioned, `.env` present (without it every route renders
the top-level error boundary and every measurement is a measurement of an error
page). `cd` there and stay. If the harness auto-creates a worktree under
`.claude/worktrees/`, ignore it — do not work in it, **never delete any
worktree.**

## OBJECTIVE

QA round 2 (`reports/qa/phase-08.md`, in your tree) verified **all four** C3
fixes and then failed the phase on **two new blocking defects**, neither of
which C3 was asked to touch. Both live in files Phase 08 wrote. Fix those two,
plus four smaller truth defects found in the same round — three of them in text
or comments C3 itself added.

Read `reports/qa/phase-08.md` first. It is long and it is worth it; DEFECT R2-1
and DEFECT R2-2 are the sections you need, and the evidence is under
`reports/qa/phase-08/r2/`.

## REQUIREMENT_IDS

IMPLEMENTATION.md §7 PHASE 08 acceptance criterion 2 (shared design system —
R2-1 breaks it on a legal surface); §13 and §1.3 (content truth — R2-2);
§12 (visual acceptance).

---

## R2-1 (BLOCKING) — the cookie policy's storage table cannot be read on a phone

### Measured

At 320 / 375 / 390 the `/cerez-politikasi` madde 02 table renders **583.9 px
wide inside a 375 px viewport**. `DEPO`, `NE İŞE YARAR` and `SÜRE` are entirely
off-screen for **all five rows**, and **nothing scrolls**: `scrollLeft` forced
to 9999 on every ancestor from `<table>` to `<documentElement>` stays `0`, there
is no `tabindex`, and `div.shell-root` computes `overflow-x: clip`. Screenshot:
`reports/qa/phase-08/r2/shots/cerez-viewport-375.png`.

### Three things that are already established — do not re-litigate them

1. **It is not the new fifth row's fault.** Hiding that row in the browser
   leaves the width at 583.9 px with identical columns.
2. **It is not the primitive's fault.** `ShellSpecTable`
   (`src/components/shell/ShellComposition.tsx:224-268`) already wraps its table
   in `div.shell-table-scroll`. Orchestrator-verified at source. The scroll
   region simply never engages while its own box is unconstrained.
3. **It is the call site.** `src/pages/CerezPolitikasi.tsx:133` wraps the figure
   in a bare `div.shell-stack`, whose implicit grid track resolves to
   **585.875 px**. Every other document surface resolves to **333 px** — QA
   names `/kalite-dosyasi`'s `shell-span-read shell-stack` as the working
   comparison, and measured the other seven `ShellSpecTable` figures at 333 px,
   where they become real scroll regions.

### What the fix must achieve — outcome, not a prescribed class

QA's smallest fix is one class. **Measure before you accept that.** The clause
body sits inside `LegalDocument`, not inside `/kalite-dosyasi`'s composition, so
confirm what grid the clause body actually establishes and what
`shell-span-read` resolves to *there* before copying it. The criterion is the
measurement, not the class name:

- at **320, 375 and 390**, either the table fits the viewport, or it is a
  genuinely reachable scroll region — reachable by touch **and** by keyboard;
- all four column headers reachable for all five rows;
- 768 / 1280 / 1440 unchanged;
- no other Wave B or legal surface regresses.

### Carry this finding forward in writing

**The reflow guard is green precisely because an ancestor clips.**
`documentElement.scrollWidth − clientWidth <= 1` cannot see this failure class —
content wider than the viewport inside an `overflow-x: clip` ancestor passes it
while being unreadable. Say so in a comment next to the fix. QA reports that a
fourth instrument was blind to it too (`r2/table-blastradius-320.json`). If you
can make the failure visible to a test cheaply, note where such a test belongs —
but writing it is QA's, not yours.

---

## R2-2 (BLOCKING) — `/giris` sets a cookie and embeds a third party, and four published sentences deny it

### Measured (`reports/qa/phase-08/r2/cookies.json`, fresh context, plain load, no interaction)

```
cookie  __cf_bm   domain .hcaptcha.com    httpOnly  secure  sameSite None
                  lifetime 30 minutes     (also .w.hcaptcha.com)
hosts contacted on /giris:
  fonts.googleapis.com, fonts.gstatic.com            (disclosed)
  js.hcaptcha.com, newassets.hcaptcha.com,
  <id>.w.hcaptcha.com x 2                            (NOT disclosed)
```

Every other measured route — `/`, `/kvkk`, `/cerez-politikasi`, `/malzemeler`,
`/teklif-al`, `/sifremi-unuttum`, `/reset-password` — contacts only the two font
hosts and creates **zero** cookies.

`src/pages/Login.tsx:3` imports `@hcaptcha/react-hcaptcha`, `:30` holds the site
key, `:230` renders `<HCaptcha>` inside the form. **It mounts with the page; no
interaction is required.** `/giris` is a public route by the repository's own
contract (`e2e/shared-shell-accessibility.spec.ts` `NON_SHELL_PUBLIC_ROUTES`).

### The five sentences to repair

| document | sentence | why it is false |
|---|---|---|
| `/cerez-politikasi` madde 01 | "Herkese açık sayfalarda **hiçbir çerez oluşturulmuyor**." | `/giris` is a public page and creates two |
| `/cerez-politikasi` madde 03 | "Üçüncü tarafa giden **ikinci ve son** istek sohbet asistanınındır." | there is a third, it needs no consent, and it fires on load |
| `/gizlilik-politikasi` madde 03 | "**Site çerez kullanmaz.**" | false as an absolute over the scope madde 01 declares |
| `/gizlilik-politikasi` madde 05 | "Bunun dışında sayfalarda **gömülü üçüncü taraf içerik** … bulunmaz" + "Bir istisna var" | hCaptcha is an embedded widget iframe, and a second exception |
| `/kvkk` madde 04 | now closes at "**üç hâlde**" | loading `/giris` sends IP and browser data to hCaptcha's endpoints — the same closed-list defect C3 just fixed, one third party over |

**One sentence survives and must not be touched:** madde 01's second sentence.
`__cf_bm` is a bot-management cookie and is genuinely not an ad cookie,
analytics cookie, tag manager, ad pixel or session-recording tool.

### How to write it

Disclose hCaptcha **where the font CDN already is** — that is this repository's
own precedent for a third party the browser contacts directly, and it is how
Gemini was handled in C3. Follow the precedent rather than inventing a new
shape, and say in a comment which precedent you followed.

Hard limits, the same ones C3 worked under:

- **Claim nothing about what hCaptcha or Cloudflare do with the data.** No
  retention, no training, no deletion, no security posture. Nothing in this
  repository can establish it. `GizlilikPolitikasi.tsx` madde 06's stance —
  "orası bizim göremediğimiz bir yer ve sizin adınıza doğrulayamayacağımız bir
  şeyi burada yazmıyoruz" — is the model.
- State what the repo proves: which route, that it mounts on load without
  interaction, which hosts, that it is bot protection on the login form, the
  cookie name and its 30-minute lifetime.
- **Do not remove hCaptcha.** Whether the login form should carry it is a
  security decision and belongs to Phase 09. `src/pages/Login.tsx` is
  DO_NOT_TOUCH here.
- Do not weaken a claim that is still true to make the edit easier. Scoping an
  absolute to the routes it holds on is acceptable **only** where that is the
  honest description; disclosure is preferred, per QA.
- `__cf_bm` is a **cookie**, and the madde 02 table is titled "Yerel depo
  kayıtları". Decide where it belongs and say why — a cookie row in a
  local-storage table would be its own small untruth.

---

## R2-4 — `FAMILY_RESOURCES` is keyed by label, and its comment says the opposite

`src/components/shell/footer-groups.ts`. The comment C3 added says:

> "Keyed by ROUTE, so a renamed label in `ia.ts` cannot silently orphan an entry
> — and an unmatched path simply stays in KURUMSAL, because that column takes
> the complement."

The **lookup key is the family label**; only the values are routes. QA is right
that this is backwards, and it is not merely a comment defect: if someone
renames `Kabiliyetler` in `ia.ts`, `FAMILY_RESOURCES[label]` is `undefined` so
the family adopts nothing, while `ADOPTED_BY_FAMILY` — built from
`Object.values(...)` and therefore independent of the label — still excludes
`/kabiliyet-profilleri` from KURUMSAL. **The link would appear zero times.**

Make the code do what the comment promises, or make the comment describe the
code. The first is better: the failure mode is a published route silently
vanishing from the footer, and the comment's own claim is the safer design.
Whichever you choose, the invariant to preserve is C3's real one — every
`resourceLinks` entry appears in the footer exactly once. Prove it still holds.

## R2-5 — two claims C3 added that measurement contradicts

- `e2e/technical-landing.spec.ts` — the comment now says the 22.50 px pitch is
  "the same in all four columns and at 375/768/1280/1440". At **375** it is not
  measurable at all: `.tl-footer nav` is `display: none`, every delta is 0, and
  the rendering that actually paints there is a disclosure list with a **40 px**
  pitch. Same condition as C3: **comment prose only**, every executable line
  byte-identical, `0.26` still `0.26`, proven with `git diff -U0`.
- `src/components/shell/footer-groups.ts` — the "band is as tall as its tallest
  column" model holds only at **>= 1024**. At 768 `.tl-footer nav` is a 2x2 grid
  (`grid-template-rows: 150px 150px`) whose height is
  `tallest(row 1) + tallest(row 2)`: 13 rows before this change, 12 after, which
  is exactly why 768 lost **one** pitch where 1280/1440 lost two. The headroom
  figure is a 1280 figure; say so.

## R2-6 — two smaller truth tensions in the legal set

- `/kvkk` madde 04 enumerates "üç hâl" and then, in the very next paragraph,
  describes a supplier transfer ("Bir işin yürütülmesi için üçüncü bir
  tedarikçiye teknik dosya iletilmesi gerekiyorsa…"). A closed list with a
  further case immediately beneath it is the same defect D3 was. Resolve it —
  either the supplier case is enumerated, or the sentence stops closing the
  list. This tension predates C3; it is sharper now because the list is
  explicitly numbered.
- `/cerez-politikasi` madde 02's note says "Bu kayıtların hiçbiri … üçüncü bir
  tarafa aktarılmaz", while `sb-…-auth-token` is sent to Supabase — the hosting
  and database provider the other clauses correctly name as a transfer case.
  Make the note true.

---

## WRITE_ALLOWLIST

```
src/pages/CerezPolitikasi.tsx                  (R2-1, R2-2, R2-6)
src/pages/GizlilikPolitikasi.tsx               (R2-2 — no longer the model; it now carries two false sentences)
src/pages/KVKK.tsx                             (R2-2, R2-6)
src/components/shell/footer-groups.ts          (R2-4, R2-5)
e2e/technical-landing.spec.ts                  (R2-5 — COMMENT PROSE ONLY, same condition as C3)
src/styles/shell.css                           (R2-1 — ONLY if measurement proves the call site alone cannot fix it, and then say why in the diff)
e2e/__golden__/**                              (ONLY baselines whose diff your change explains; golden protocol below)
```

`e2e/**` is QA-owned under §3.3; the two entries here are a narrow grant for
this packet, as in C3. `src/styles/shell.css` is a conditional grant — reach for
it only with a measurement that rules out the call-site fix, because a shared
stylesheet change has a blast radius across every surface.

## DO_NOT_TOUCH

```
src/pages/Login.tsx                            ← hCaptcha stays; that is Phase 09's call
package.json  package-lock.json                ← no dependency added or removed, for any reason
src/components/shell/ShellComposition.tsx      ← the primitive is innocent, verified at source
src/components/navigation/ia.ts                ← same blast radius as C3: NavDirectory index + 404 directory
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx
src/pages/TeklifAl.tsx  src/pages/CADDashboard.tsx  src/components/ui/sonner.tsx
src/styles/technical-landing.css               ← R2-3 is PRE-EXISTING and is NOT in this packet; see below
e2e/landing/motion-grammar.spec.ts             ← same
supabase/**   docs/supabase-full-setup.sql
src/pages/admin/**   src/pages/musteri-paneli/**
PROGRESS.md   IMPLEMENTATION.md   USER_INPUTS.md   reports/qa/**   e2e/qa-p08-*.spec.ts
.claude/**   tsconfig.json                     ← uncommitted changes there are INTENTIONAL user state
*.tsbuildinfo                                  ← build artifacts; do not commit, do not revert
```

**R2-3 is deliberately out of scope.** `motion-grammar.spec.ts:254` is red at
`tablet-768` and `landscape-844` because `@media (max-width:767px)`
(`technical-landing.css:507`) does not cover two `mobile: true` projects above
that width. QA proved it pre-existing —
`git log 7dcfb65~1..b77be5c` over both files is empty. Fixing it would remove
`.tl-dimension-lines` at 768 and change landing goldens, which is landing
responsive art direction and belongs to Phase 10. Leave it red; the Orchestrator
has recorded it.

## ACCEPTANCE_CRITERIA

1. `/cerez-politikasi` madde 02 table: at 320, 375 and 390 every column of every
   row is reachable — fits, or scrolls by touch and by keyboard. Report the
   measured widths and the reach method. 768/1280/1440 unchanged.
2. No public route contradicts a published sentence about cookies or embedded
   third parties. `e2e/qa-p08-storage-disclosure.spec.ts` (QA's, in your tree,
   **do not edit it**) must go green — including *no cookie is created on any
   public route*, which is currently red. If it can only pass because a document
   now discloses the cookie, that is the intended outcome; if you believe the
   test itself is wrong, say so with a measurement instead of editing it.
3. Rendered `/kvkk`, `/gizlilik-politikasi`, `/cerez-politikasi` assert nothing
   about what any third party does after receipt. No retention period, deletion
   timetable, encryption, NDA or security-posture claim anywhere.
4. `/kvkk` madde 04's enumeration is consistent with every transfer described
   beneath it.
5. Every `resourceLinks` entry appears in the footer exactly once, and a renamed
   family label in `ia.ts` cannot reduce that to zero. Demonstrate the rename
   case, by test or by measurement.
6. `npx playwright test e2e/technical-landing.spec.ts --project=critical-1280` and
   `--project=critical-375` green; `bantOrani` still `0.23203125` unless you can
   explain a change.
7. All four visual projects run per project; every golden matches or is rebanked
   under the protocol.
8. `node scripts/claims-gate.mjs` PASS; `npx tsc -b` exit 0; `npm run build`
   exit 0.
9. `git status` shows nothing outside the WRITE_ALLOWLIST.

## GOLDEN PROTOCOL (IMPLEMENTATION.md §12)

Unchanged from C3. `--update-snapshots` is not a way to silence a failure.
Adjudicate per viewport *before* regenerating: height delta, first changed row,
and what explains it. `reports/qa/phase-08/probe-golden-rebank.mjs` and
`probe-golden-shift.mjs` are in your tree — borrow, do not edit. Put the table
in the commit message. **Note:** the legal routes have no goldens by deliberate
decision (`e2e/visual/wave-b-golden.spec.ts:37`), so R2-1 and R2-2 may change
nothing photographic. If that is what you measure, say so — "no golden moved" is
a result, not a gap.

## COMMANDS_TO_RUN — machine

- **8 GB RAM, one heavy process at a time.** Nothing else runs while you work.
- Ports 4173 / 4187 / 4190 / 4191 / 4199 were cleared and QA stopped its own on
  4173. Re-check before relying on it. `PLAYWRIGHT_PORT=<free port>` selects the
  port; `--strictPort` is already set.
- A cold `npm run build` died with `write ENOMEM` on this box at ~1 GB free.
  Build once successfully, then use `PLAYWRIGHT_PREVIEW_ONLY=1` for subsequent
  suites.
- Playwright: one `--project=` per invocation, **foreground**, chunked. Never
  `run_in_background`.
- Redirect with `> file 2>&1`. A PowerShell pipeline buffers to the end and
  leaves a 0-byte file if the process is killed.
- `installFontRetry()` in `e2e/visual/fonts.ts` flaked 3 times for QA and twice
  for the C3 Coder ("intercepted 0 requests on fonts.gstatic.com"), always clean
  on isolated re-run. Known, unrelated, feeds a Phase 12 decision. Do not
  "fix" it here.
- Ad-hoc probes: config expects `chromium-1217`, a different build is installed;
  pass `executablePath: "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"`.
- `scripts/claims-gate.mjs` resolves `REPO_ROOT` from its own location. Run it
  in place.
- PowerShell is primary; switch to it if Bash returns a classifier error.

## HOW TO NOT LOSE WORK

- **Commit after every step.** QA was killed mid-round by a process exit and
  lost nothing, because three step commits were already standing. That is the
  only reason this packet exists instead of a repeat round.
- **Every measurement goes to a file or a commit message the moment you take
  it.**
- 529 / `ENOTFOUND` are server-side. Not your bug.

Suggested commits: R2-1 · R2-2 · R2-4+R2-5 · R2-6, each independently green.

## RETURN_FORMAT

Your agent definition's structure, plus:

```text
R2_1_MEASURED:  table width and reach method at 320/375/390 · what you changed and why the call site was or was not enough · 768/1280/1440 unchanged
R2_2_QUOTED:    every rewritten sentence, verbatim from the rendered DOM, and the precedent you followed
R2_2_GATE:      qa-p08-storage-disclosure.spec.ts result, per test
R2_4_PROVEN:    the rename case, demonstrated
R2_5_DIFF:      git diff -U0 proof that technical-landing.spec.ts changed no executable line
```

Falsify me. In this run round 1 falsified two Orchestrator premises, C3
falsified my footer row-count table, and round 2 falsified its own round-1
conclusion about third-party hosts. Report what you measured.
