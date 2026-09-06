# QA Report — Phase 09a

- PHASE: 09a
- CODE_COMMIT: `2f6bb3c` (integration branch `claude/awwwards-90-overhaul`; range `3a89e7c..2f6bb3c`)
- QA_COMMIT: `c16d928` + this commit (branch `wt/qa-p09a`, worktree `C:\Users\Trade Bilisim\pdh-wt\qa-p09a`)
- STATUS: **FAIL**
- TESTS_PASSED: 353
- TESTS_FAILED: 4 (2 new — the same defect at two viewports; 2 carried R2-3, expected red per A23)
- TESTS_SKIPPED: 58
- NEW_TESTS_ADDED: 12 (`e2e/qa-p09a-rfq-form.spec.ts`)

**One defect, and it is the phase's own.** Every load-bearing number the Coder
reported reproduces — several of them to the hundredth of a kilobyte. But the
branded error state that acceptance criterion 3 required this phase to build
renders its status label at **2.69:1** on the graphite ground it also moved this
page onto. axe calls it serious at both 1280 and 375. It is one CSS declaration
away from correct and it is not mine to write.

---

## Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | `/teklif-al` inside `<main>`: 0 teal, 0 Radix, 0 `bg-card`, 0 off-register radii, 0 system-font nodes, shell primitives in the Wave A/B range. Same for `/cad-dashboard` | **PASS** | `reports/qa/phase-09a/design-membership.txt`, `legacy-accent.txt`. Both routes: teal **0**, Radix **0**, `bg-card` **0**, off-register radii **0**, system-font nodes **0**, shell primitives **88** (Wave A/B band 47–404). Round 1's instruments `probe-design-membership.mjs` / `probe-legacy-accent.mjs`, borrowed unedited from `reports/qa/phase-08/` |
| 2 | Route chunk carries no `three` / `@react-three/*` / STL / OBJ / OCCT until a preview is requested; before/after reported | **PASS** | `closure-before.txt` / `closure-after.txt`, my own `probe-chunk-closure.mjs` over my own two builds. **1629.48 kB → 816.79 kB (−812.69 kB, −49.87 %)**. Runtime: `qa-p09a-rfq-form.spec.ts:511` — heavy chunks fetched on load `[]`, after choosing a file `[]`, after "3B önizlemeyi aç" `CadStage-*` + `cssVar-*`; OCCT still `[]` for an STL |
| 3 | CAD parse error and form error render `ShellNotice tone="error"`: radius 0, Space Grotesk, `role="alert"`; reached, not inferred | **FAIL** | Reached and branded: `error-states.txt` and spec tests 2–3 — `div.shell-notice[data-tone=error]`, `role="alert"`, `border-radius 0px`, `"Space Grotesk", system-ui, sans-serif`, `data-sonner-toast` count **0**, still present 4.5 s later. **But** `.shell-notice-label` measures **2.69:1** (`notice-contrast.txt`, `axe-detail.txt`) — see Failed checks F1 |
| 4 | Every field error programmatically associated and announced; keyboard users reach the first invalid field | **PASS** | spec test 4. `aria-invalid="true"`, `aria-describedby` → `#rfq-name-error` which exists and carries words, `<label for>` on all eight controls, focus lands on the first invalid control **in document order** (`RFQ_FIELD_ORDER`, not object-key order), form-level `role="alert"`, and editing one field clears its own message and only its own |
| 5 | Double-submit is impossible; demonstrated | **PASS** | spec test 5. 13 attempts (1 real click + 6 synthetic `submit` events + 6 programmatic clicks) against a 2.5 s handler → **1** `functions/v1/rfq-rate-limit` invocation and **1** storage PUT. `disabled` true and `aria-busy="true"` while in flight. Both halves are real: the `useRef` in `useRfqSubmission.ts:197` is what actually holds, because `disabled` only reaches the DOM on the next commit |
| 6 | Accepted formats and max size visible **before** a file is chosen, from the existing constants | **PASS** | spec test 1. Seven chips STEP/STP/STL/OBJ/IGES/IGS/3MF, "Maks. 50 MB" and "en fazla 50 MB" all visible with the input still empty; `accept=".step,.stp,.stl,.obj,.iges,.igs,.3mf"` — every one derived from `CAD_ACCEPTED_EXTENSIONS` / `CAD_MAX_FILE_SIZE` via `CAD_FORMAT_CHIPS` / `CAD_FORMAT_HINT` / `CAD_ACCEPT_ATTR`, no second hand-written list |
| 7 | The three `qa-p08-*` specs green at `mobile-320`, unedited | **PASS** | `pw-qa-p08-mobile-320.txt` — 24 passed, 0 failed, 37 skipped (the skips are the specs' own single-lane gates, e.g. `qa-p08-storage-disclosure.spec.ts:273`). `git diff --name-only 64d1a8b..2f6bb3c -- e2e` names four PNGs and no `.ts` |
| 8 | `critical-1280` and `critical-375` green; `bantOrani` still `0.23203125` | **PASS** | `pw-critical-1280.txt` 82 passed / 1 skipped; `pw-critical-375.txt` 81 passed / 2 skipped. The footer band measures **297 px** at 1280 (`surface-and-footer.txt`) → 297/1280 = **0.23203125**, and `technical-landing.spec.ts:308` passes |
| 9 | Four visual projects run per project; each moved golden adjudicated per viewport; `shell-header-rfq.png` unmoved | **PASS** | `pw-visual-1280/1440/768/375.txt` — 41 / 35 / 35 / 35 passed, 0 failed, `git status -- e2e/__golden__` clean afterwards. Adjudication below |
| 10 | `claims-gate.mjs` PASS; `tsc -b` exit 0; `npm run build` exit 0 | **PASS** | `claims-gate.txt` — PASS, 0 unverified claims across 27 rules, 225 files. `tsc.txt` exit 0. `build-after.txt` exit 0 |
| 11 | `git status` shows nothing outside the Coder's WRITE_ALLOWLIST | **PASS** | 20 files in `3a89e7c..2f6bb3c`; the 18 non-doc ones are `src/pages/TeklifAl.tsx`, `src/components/rfq/**` (11 new), `src/styles/shell.css`, `src/utils/cadUpload.ts` and four `e2e/__golden__` PNGs. Nothing in `supabase/**`, `src/components/admin/**`, the auth or legal pages, `package.json`, `ia.ts`, `footer-groups.ts`, `PROGRESS.md`-adjacent gates or `e2e/qa-p08-*.spec.ts` |

---

## Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| **F1** — axe, `/teklif-al` at 1280 and 375, step 02 with live field errors | `color-contrast (serious) x1` on `p.shell-notice-label` — "FORM HATASI". `#8a4030` on `#070b0d`, 9 px / 600, **2.69:1** against a 4.5:1 requirement (9 px is not large text) | `src/styles/shell.css:1891` paints the error label with `--tl-stamp`, and `src/styles/design-tokens.css:111` defines `--tl-stamp: #8a4030` as **one fixed hex with no surface variant**. On the paper ground the same markup measures **6.08:1**; on graphite it is 2.69:1 | **Yes.** A graphite-scoped value for the error label (or a `data-shell-surface="graphite"` override of `--tl-stamp`). Read-only for QA |

### Why F1 is this phase's and not inherited

`PROGRESS.md` A20 records that `ShellNotice tone="error"` was built by `7dcfb65`
and had **zero usages in `src/`**. It has five now, and `grep -rn 'tone="error"'`
puts every one of them inside `src/components/rfq/**` — the modules this phase
created. The same phase changed `PageShell surface` from the `paper` default to
`graphite` at `src/pages/TeklifAl.tsx:235`. So this is the first time the
primitive has ever rendered anywhere, and the ground it renders on is the one
this phase chose. Both states are affected — the CAD rejection label
("DOSYA REDDEDİLDİ") measures the same 2.69:1 — as are the upload-failure,
chunk-failure and parse-failure notices, which are the same class.

The title and body of the notice are fine: **17.35:1** and **11.32:1**. Only the
9 px mono status label fails, which is also why nothing caught it before —
`shell-golden.spec.ts` deliberately does not photograph page bodies, and
`shared-shell-accessibility.spec.ts` audits `/teklif-al` in its default state,
where no notice exists.

---

## The bundle claim, recomputed independently

Two builds from this worktree — `3a89e7c` detached into a scratch `outDir`, then
`2f6bb3c` into `dist/` — and my own graph walker
(`reports/qa/phase-09a/probe-chunk-closure.mjs`). It follows **static** edges
only (`import x from"./a.js"`, `export*from"./a.js"`) and refuses dynamic ones
(`import("./a.js")`), which is exactly the distinction the trap depends on.
`vite.config.ts` sets `output.hoistTransitiveImports: false`, so the edges in
each emitted chunk are that chunk's real direct imports.

|  | before (`3a89e7c`) | after (`2f6bb3c`) | delta |
|---|---|---|---|
| `TeklifAl-*.js` alone | 41.91 kB | 28.68 kB | −13.23 kB |
| **route static closure** | **1629.48 kB** (31 chunks) | **816.79 kB** (18 chunks) | **−812.69 kB, −49.87 %** |
| closure minus the entry closure | 1347.40 kB (26 chunks) | 536.02 kB (14 chunks) | −811.38 kB, −60.2 % |

Both endpoints land on the Coder's figures exactly. The trap it warned about is
real and my walker confirms it: measuring `TeklifAl-*.js` alone would have
reported a 13 kB saving instead of 813 kB — **61× understated**.

What actually moved: `cssVar-DmkUg4ZZ.js` at **838.08 kB** — the chunk carrying
`three`, `@react-three/fiber`, `@react-three/drei`, `STLLoader`, `OBJLoader` —
was a static member of the route closure and is now reachable only through
`CadStage-*.js`, whose own static closure beyond the route is **837.37 kB**.
`occt-import-js-*.js` (108.88 kB) is a second boundary inside the first: it is a
dynamic edge of `CadStage`, not of the route. The Radix `tabs-*.js` (7.06 kB) and
`switch-*.js` (5.98 kB) chunks left the closure too, which is the same fact
criterion 1 measures as "Radix 3 → 0".

**Runtime confirmation, not just the graph** (`qa-p09a-rfq-form.spec.ts:511`,
every `/assets/*.js` script request recorded):

```
on load                       heavy chunks fetched: []
after choosing a .stl         heavy chunks fetched: []
after "3B önizlemeyi aç"      CadStage-*.js, cssVar-*.js        (OCCT still absent)
```

---

## The four rebanked goldens, adjudicated

`git diff --name-only 64d1a8b..2f6bb3c -- e2e` returns exactly four paths, all
`shell-footer-rfq.png`, at `visual-375/768/1280/1440`. `shell-header-rfq.png` is
not among them, no other baseline is, and no `.ts` under `e2e/` changed — so
`--update-snapshots` cannot have swept anything in alongside them.

The claimed cause is `src/styles/shell.css:506-517`, which gives `.tl-footer` a
`border-top` and recolours `.tl-band-index` **only** under
`[data-shell-surface="paper"]`. Measured on the live build
(`surface-and-footer.txt`):

| slug | route | surface | footer height (1280 / 375) | `border-top` | `.tl-band-index` colour |
|---|---|---|---|---|---|
| home | `/` | graphite | 297 / 740 | `0px` | `rgb(243,240,232)` |
| service | `/hizmetler/cnc-frezeleme` | graphite | 297 / 740 | `0px` | `rgb(243,240,232)` |
| about | `/hakkimizda` | graphite | 297 / 740 | `0px` | `rgb(243,240,232)` |
| journal | `/blog` | graphite | 297 / 740 | `0px` | `rgb(243,240,232)` |
| **rfq** | `/teklif-al` | **graphite** | **297 / 740** | **`0px`** | **`rgb(243,240,232)`** |
| notfound | `/__phase04-not-a-route__` | **paper** | 298 / 741 | **`1px rgba(18,23,25,.42)`** | `rgb(164,171,168)` |

`/teklif-al` used to be in the last row's population and is now in the first
four's. That is the whole change, and it predicts precisely what the pixels
show. Per viewport (`golden-adjudication.txt`, `golden-regions.txt`):

| viewport | height delta | dominant match | unexplained bands |
|---|---|---|---|
| visual-375 | 742 → **741** | `shift -1` | rows 9–14 at x 8–18 (the index column recolour); row 716–724 edge rows |
| visual-768 | 769 → **768** | `shift -1` | rows 27–36 and 46–50 at x 14–40 (index column) |
| visual-1280 | 298 → 298 | `shift -1` | rows 27–36, 46–51 at x 16–46 (index column); rows 90–97 / 131–142 in the link block, which sit in `shift +0` runs — content that did not move, so the 1 px compensation does not apply to it |
| visual-1440 | 298 → 298 | `shift -1` | rows 27–36, 46–51 at x 16–46 only — **236 px in the whole image** |

Sampled colour pairs on the index column, e.g. `#35748b → #72b6cc` and
`#764a2b → #be875a` at 1440 rows 46–51: brighter, which is the
`rgb(164,171,168) → rgb(243,240,232)` recolour, not new content. And the four
visual projects all pass against these baselines with the working tree clean
afterwards, so the banked images are what the build renders today.

*Note on instruments:* `probe-golden-rebank.mjs` and `probe-golden-shift.mjs`
could not be borrowed byte-for-byte — both hardcode
`REPO = "C:/Users/Trade Bilisim/pdh-wt/qa-p08"`, a worktree pruned between
phases. The method in `probe-golden-adjudicate.mjs` is theirs unchanged; the
repo root is a parameter resolved from the script's own location.

---

## Content truth

| Claim | Result | Evidence |
|---|---|---|
| "10-12 Gün" / "3-5 Gün" gone from the **rendered** DOM | **PASS** | `qa-p09a-rfq-form.spec.ts:343` reads `main.innerText` at step 01, step 02, the review summary and the success state and asserts against `/10\s*-\s*12\s*G[üu]n\|3\s*-\s*5\s*G[üu]n\|Ekspres\|Teslimat s[üu]resi/i`. Four states, no match. At source the four occurrences at `3a89e7c:src/pages/TeklifAl.tsx:988,1005,1072,1310` are gone; the two remaining string matches in `src/components/rfq/**` are inside explanatory comments |
| Nothing unverifiable replaced them | **PASS** | The delivery selector became `RFQ_PRIORITIES` — "Standart / Termin teklifle birlikte verilir" and "Öncelikli / Aciliyet notu teklife işlenir". Neither states a duration. The aside says "Termin: Teklifle birlikte". `claims-gate.mjs` PASS across 27 rules |
| The confirmation reference is server-echoed or absent, never client-fabricated | **PASS** | `useRfqSubmission.ts:290` reads `data.rfq.id` and stores `null` when absent; `RfqSubmitStep.tsx:69` omits the whole row when `reference` is null. Proved both ways: with a sealed response echoing `RFQ-2026-QASEAL` the screen shows that value — one the browser could not have generated — and with a 2xx carrying no `rfq.id` the screen shows **no** "Talep numarası" row and no `RFQ-\d{4}-…` string anywhere (spec tests 6 and 7) |
| No notification path or recipient invented | **PASS** | The success copy says *"Dönüş, formda verdiğiniz e-posta adresine yapılır; otomatik bir onay e-postası gönderilmez."* Asserted positively, and asserted that no "onay e-postası gönderildi/gönderilecek" variant appears. The only addresses on the page are `SALES_EMAIL` / `PUBLIC_PHONE` from `src/content/claims.ts` |
| No NDA / retention / deletion / encryption claim | **PASS** | Asserted `not.toMatch(/\bNDA\b/)` (case-sensitive and word-bounded on purpose — a case-insensitive `NDA` matches the middle of "açısından", which cost me one false red) and no "gizlilik sözleşmesi / şifreli / imha edilir / kalıcı olarak silinir". `RfqAside.tsx:29-33` documents the silence as deliberate under §J `NDA_AVAILABLE: NO` |

One thing I could not close and am not asserting: `src/data/servicePages.ts:611,2197,2242` still publish "3-5 gün" for a **DFM analysis** on the service pages. That is outside 09a's routes and untouched by this phase; `claims-gate.mjs` passes it. Recorded, not charged here.

---

## Nothing was written to the production database

This is stated first as a boundary and second as a method, because the last
agent to verify this form wrote four rows and three objects to it.

- **No RFQ was submitted against the live project. Not once.** No
  `functions.invoke("rfq-rate-limit")`, no `storage.from("cad-uploads")` upload,
  no `rfqs` insert, by page interaction, script or `fetch`.
- Every test in `e2e/qa-p09a-rfq-form.spec.ts` installs `sealNetwork()` before
  it opens the page. The route handler **never calls `continue()`** for an
  off-origin request: it either `abort`s it or `fulfill`s it with a synthetic
  response, and a fulfilled route is answered inside the browser.
- The seal is **proved before any control is touched**: `assertSealed()` issues a
  live `fetch` to `https://example.com/qa-p09a-network-seal-canary` and requires
  both that it rejects and that the handler logged it as blocked. Every test then
  ends on `assertNothingReachedTheBackend(seal)`.
- The only off-origin hosts allowed out are `fonts.googleapis.com` and
  `fonts.gstatic.com`, on GET, and that allowance is itself asserted — every
  other host is aborted. Without it every measurement in the file would describe
  a fallback-font layout rather than the page. Neither host can create a row.
- The four rows and three objects the Coder wrote were **not** touched, read,
  modified or deleted. Nothing was deployed. `ALLOW_PRODUCTION_DEPLOY: NO` holds.
- The repo-local half of the divergence is confirmable without probing and I
  confirmed only that: `git log --oneline -- supabase/functions/rfq-rate-limit/index.ts`
  is one commit. I did not re-establish the deployed behaviour.

---

## Unverifiable — checks I declined rather than ran

| # | Check | Why it could not be verified without a production write |
|---|---|---|
| U1 | That the **deployed** `rfq-rate-limit` rejects a malformed e-mail, a short customer, a missing company or a `.txt` in `files` | The only way to learn it is to send the request. The repo source says it does; the run already knows the deployed function does not match its source, and establishing that cost four rows. 09b's audit |
| U2 | That the 429 branch is reachable in production | Requires exceeding a real rate limit against the live function. The branch itself is exercised and correct — spec test 8 drives a real 429 through the real page with the response sealed — but whether production ever emits one is unknown to me |
| U3 | That a real row is written with the fields `useRfqSubmission.ts:267-279` sends, and that `rfqs.id` round-trips | Needs an insert. What I could verify is the client contract: the reference displayed is the one the response carried, and none is displayed when the response carries none |
| U4 | That the CAD object actually lands in `cad-uploads` at `createCadStoragePath(...)` | Needs a storage write. The XHR is sealed and its URL shape observed, nothing more |
| U5 | The 30 s invoke timeout and the 45 s upload stall watchdog under real network conditions | Both are reachable only by holding a real connection open. `INVOKE_TIMEOUT_MS` is passed as `supabase.functions.invoke({ timeout })`; I did not confirm the installed `@supabase/functions-js` honours that option, and confirming it against the live function is a request I will not send |
| U6 | Whether the internal notification path exists end to end | The Coder reports no mailer, no trigger, no scheduled reader. Confirming the absence of a database trigger is a `supabase/**` read, which is 09b's scope; I verified only that the copy claims nothing a reader could be disappointed by |
| U7 | `installFontRetry()` flake at `visual-375` | Known, Phase 12, explicitly not to be fixed. It did not flake in this run |

---

## Commands run

```text
npx tsc -b                                                    exit 0
node scripts/claims-gate.mjs                                  exit 0   PASS, 0 unverified across 27 rules
git checkout --detach 3a89e7c
npx vite build --outDir <scratch>/dist-before --emptyOutDir   exit 0   51.18s
git checkout wt/qa-p09a
npm run build                                                 exit 0   34.65s
node reports/qa/phase-09a/probe-chunk-closure.mjs <before> TeklifAl
node reports/qa/phase-09a/probe-chunk-closure.mjs dist TeklifAl
npm run preview -- --port 4173 --strictPort
node reports/qa/phase-08/probe-design-membership.mjs /teklif-al /cad-dashboard /iletisim /hakkimizda /sss /giris
node reports/qa/phase-08/probe-legacy-accent.mjs
node reports/qa/phase-09a/probe-error-states.mjs              (byte-identical copy of the phase-08 probe; sha256 9a40b800…2792)
node reports/qa/phase-09a/probe-axe-detail.mjs
node reports/qa/phase-09a/probe-notice-contrast.mjs
node reports/qa/phase-09a/probe-surface-and-footer.mjs
node reports/qa/phase-09a/probe-golden-adjudicate.mjs 64d1a8b e2e/__golden__/win32/visual-{375,768,1280,1440}/shell-footer-rfq.png
node reports/qa/phase-09a/probe-golden-regions.mjs   64d1a8b … 1 16
node reports/qa/phase-09a/probe-golden-peer.mjs      64d1a8b

PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_PORT=4173 npx playwright test …
  e2e/qa-p09a-rfq-form.spec.ts --project=desktop-1280           10 passed, 2 failed
  --project=critical-1280                                       82 passed,  1 skipped
  --project=critical-375                                        81 passed,  2 skipped
  --project=visual-1280                                         41 passed
  --project=visual-1440                                         35 passed,  6 skipped
  --project=visual-768                                          35 passed,  6 skipped
  --project=visual-375                                          35 passed,  6 skipped
  e2e/qa-p08-{scroll-region-reach,storage-disclosure,waveb-contract}.spec.ts --project=mobile-320
                                                                24 passed, 37 skipped
  e2e/landing/motion-grammar.spec.ts --project=tablet-768         5 passed,  1 failed  (R2-3, carried)
  e2e/landing/motion-grammar.spec.ts --project=landscape-844      5 passed,  1 failed  (R2-3, carried)
```

One heavy process at a time, foreground, one `--project=` per invocation, output
redirected to a file. `--update-snapshots` was not used, for any reason;
`git status -- e2e/__golden__` is clean after every visual project.

---

## Scope integrity

- **Production files modified by QA: NONE.** `git diff 2f6bb3c..HEAD --name-only`
  returns only `e2e/qa-p09a-rfq-form.spec.ts` and `reports/qa/phase-09a/**` plus
  this file — all inside `QA_WRITE_ALLOWLIST`.
- I detached HEAD to `3a89e7c` to produce the "before" build and returned to
  `wt/qa-p09a`. No file was edited in that state and the build output went to a
  scratch directory outside the repository.
- `tsconfig.app.tsbuildinfo` is a tracked build artefact that `tsc -b` rewrites;
  restored with `git checkout --` before committing. `tsconfig.e2e.tsbuildinfo`
  is untracked and left uncommitted.
- Coder scope, `3a89e7c..2f6bb3c`: **PASS**. 20 files, all inside the Coder's
  WRITE_ALLOWLIST.

---

## Notes, recorded not charged

- **`/giris` still measures 92 legacy-teal nodes** (`legacy-accent.txt`), Radix
  roots 0. Criterion 3's remaining route, assigned to 09b by A21. Not a 09a
  failure.
- **R2-3 is still red**, at both `tablet-768` and `landscape-844`, on the same
  test (`motion-grammar.spec.ts:254`, "hovering a measurement lights its guide
  line and its passport counterpart") with the same `toBeHidden()` error.
  Unchanged, carried to Phase 10 per A23.
- **`src/pages/CADDashboard.tsx` is dead and I agree it is dead.** 806 lines
  exporting `CADDashboard`, and `grep -rn "CADDashboard" src` returns only its
  own declaration — no import anywhere. `src/App.tsx:214` routes `/cad-dashboard`
  to `<Navigate to="/teklif-al" replace />`, and `ia.ts:310` records it as a
  redirect alias. The deletion decision is 09b's or Phase 10's.
- **"Twelve modules" is eleven plus the page.** `src/components/rfq/**` contains
  11 new files (2236 lines); `TeklifAl.tsx` went 1540 → 418. The decomposition
  is real and the seams are honest — no-React data and logic in `.ts`, one
  screen per `.tsx`, `three` confined to `cad/` — but the count in the report is
  one file generous.
- **`RfqSpecStep.tsx:287-289` says the two segmented choices "are radio groups
  semantically … so they are marked as such".** They are implemented as
  `aria-pressed` toggle buttons in a `<ul>`, not `role="radiogroup"` / `role="radio"`.
  That is a defensible pattern and axe does not object; the comment overstates
  what the markup does. Cosmetic, no criterion attached.
- **`supabase/functions/rfq-rate-limit/index.ts` has one commit** in `git log`,
  the initial import. Confirmed from the log alone. I did not probe the deployed
  function.
