# QA Report — Phase 09a, Round 5 (closing round)

- PHASE: 09a-QA-R5
- CODE_COMMIT: `80b2c87` (range under review `9761249..80b2c87`: `6cd113d 55434d8 a16bbe3 d101aee 1d419dd 80b2c87`)
- QA_COMMIT: see the `wt/qa-p09a5` tip
- STATUS: **PASS**
- TESTS_PASSED: 376 (+35 on the one re-run) + 280 gate controls + 22 loader attacks + 7 escape cases + 24 sabotages + 31 p09a4 rule probes + 17 detector-D probes
- TESTS_FAILED: 1 (`visual-375 wave-b-golden › journal-lead holds its baseline`, green on re-run and green in three sibling viewports)
- TESTS_SKIPPED: 62
- NEW_TESTS_ADDED: 0 specs. 11 QA probes under `scripts/qa-probes/p09a5-*`.

**Verdict in one line.** Every mandatory acceptance criterion is evidenced as met, and every defect I
found is of one shape: **the code is narrower than the comment above it claims.** That is the same shape as
R4-1, R4-2 and R4-3, so it is worth naming; but none of it is a criterion violated, and the gate at
`80b2c87` is strictly stronger than the gate at `9761249` on every axis I could measure.

---

## Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | R4-1: the gate runs on a Node that does not strip types | **PASS** | `01-`, `02-`: `node scripts/claims-gate.mjs` and `node --no-experimental-strip-types scripts/claims-gate.mjs` both exit 0, **byte-identical** output, `PASS — 0 unverified claims across 31 rules, 280 controls green`, `# controls: 280 (0 failed), of which 16 watch the 3 checks that are not rules`. Node 20 is not installed on this box, so this is a proxy — qualified in *Notes*. |
| 2 | The fix is runtime-independent, not a workflow bump | **PASS** | `43-`… no `--experimental-strip-types` anywhere in `.github/`, `package.json`, `e2e/` or `scripts/`; `e2e/landing/claims-gate.spec.ts:32` invokes bare `node scripts/claims-gate.mjs`; no `engines` field, no `.nvmrc`; grep for Node-21+ APIs (`Object.groupBy`, `Promise.withResolvers`, `toSorted`, `findLast`, `/v` regex flag, `node:sqlite`) in `claims-gate.mjs` → zero hits. |
| 3 | No new npm package | **PASS** | `git diff --name-only 9761249..80b2c87` = 2 files; `package.json`/`package-lock.json` untouched; `typescript ^5.8.3` was already a devDependency. |
| 4 | The "bare Node process" property holds for the ledger as committed | **PASS** | `11-`: `src/content/claims.ts` transpiled with the gate's own options emits **0** surviving `import`/`export…from` statements and **0** error diagnostics. |
| 5 | A runtime import in the ledger is a LOAD failure, not drift | **PASS** (narrow) | `04-` L1/L2/L7/L17: `@/`-alias, relative and side-effect-only imports all `ERR_MODULE_NOT_FOUND` → `kind: "load"`. See D2 for the specifier classes where the *stated universal* fails. |
| 6 | R4-5: the non-rule checks are controlled; ten sabotages, ten red gates | **PASS** | `12-`: all ten of C5's shapes turn the gate red — `neuter-{derived,resources,register}`, `drop-{derived,resources,register}-from-registry`, `verdict-ignores-{derived,resources,register}` — plus `drop-reportDiagnostics`. 11 red. See D1 for the residue. |
| 7 | A third instrument, `deferred-class-register`, exists and counts | **PASS** | `claims-gate.mjs:3005` in `NON_RULE_CHECKS`; `15-`: `checkDeferredClassRegister()` → 0 problems; `16-`: forcing a site to stop resolving turns the run red with `FAILING: deferred-class-register`. |
| 8 | R4-3: the deferral is content-addressed and resolves exactly once each | **PASS** | `15-`: 6 sites, each `occurs 1x`, no line numbers in the register. |
| 9 | The class is six | **PASS** | `15-`: independently counted → **6**, and the same six lines: `servicePages.ts:788 :793 :811 :818 :3318 :3332`. Work shown below. |
| 10 | R4-4: the sweep waits for the page, and `SLA_ROUTES=57` | **PASS** | `21- 22- 23-`: three runs, `ROUTES_VISITED=63 FAILED=0 SLA_ROUTES=57 FINDINGS=0 EXEMPTED=12 neverSettled=0`, and the SLA-route set, findings and exemption set are **identical across all three**. `/` settles at **4891 characters** — my own round-4 number. |
| 11 | An unrendered route fails loudly | **PASS** | `24-`: the spec **exactly as committed** against a shell-only server → 63/63 `never settled: 87 characters after N ms — the shell, not the page`, under `every public route must SETTLE and render — an unrendered route is not a clean route`. |
| 12 | Rounds 2–3 now rest on a settled reading | **PASS** | `40- 41-`: `qa-p09a4-stabilised-sweep` reports `neverSettled=0 SLA_ROUTES=57 FINDINGS=0 EXEMPTED=12` at both desktop-1280 and mobile-375 — two independently-written instruments, identical verdict. |
| 13 | R4-2: detector (D)'s two over-catches are closed, nothing else moved | **PASS** | `17-`: `scripts/qa-probes/p09a4-widened-rules.mjs` re-run **verbatim** → **31 probes, 0 mismatches, 0 contaminated runs**. D6 and D7 both SILENT; D1/D2/D3 still FIRE. |
| 14 | R4-7: the enum control does what it says | **PASS** | `04-` L18 (enum+namespace, correct copy) → `clean`; L19 (enum, drifted copy) → `drift`. `12-` `drop-reportDiagnostics` → RED, so the message assertion in that control is load-bearing as claimed. |
| 15 | R4-6: the `.js` shadow and the JS-family scan are held by controls | **PASS** | Controls `derived-cad-copy: a .js shadow beside the ledger is a LOAD failure` and `walk: the file scan covers the JavaScript family` are in the 280 and green; `12-` shows they go red under `neuter-derived`. |
| 16 | Scope: two files, no golden moved, no spec edited | **PASS** | `git diff --name-only 9761249..80b2c87` = `e2e/qa-p09a2-claims-sweep.spec.ts`, `scripts/claims-gate.mjs`. After four visual projects: `git status --porcelain -- e2e/__golden__` **empty**. `git diff --name-only 80b2c87..HEAD -- e2e/` **empty**. `--update-snapshots` never used. |
| 17 | Full regression | **PASS** | `30-`…`41-`: 376 passed, 1 failed (re-ran green), 62 skipped. |

---

## 1 — The loader, attacked

### 1.1 The claim under test

`claims-gate.mjs:857-865`:

> THE "BARE NODE PROCESS" PROPERTY IS NOT TRADED AWAY — it is tightened. […] That module is written to
> `mkdtempSync(tmpdir())`, OUTSIDE the repository and deliberately: **any surviving import then has to
> resolve from a directory with no `node_modules`, no `@/` alias and no relative neighbours.** A value
> import of `@/utils/cadUpload` throws `ERR_MODULE_NOT_FOUND` exactly as it threw under type stripping,
> and so now does a relative one.

Every clause of that justification is a statement about the emitted module's **location**. An absolute
specifier, and a builtin specifier, do not consult the importing module's location.

### 1.2 Result: 22 attacks, 18 held; then 7 escapes, 6 resolved

`evidence/04-loader-attacks.txt`, `07-`, `08-`. Every fixture publishes **correct** copy, so a `drift`
report would be a misdiagnosis and a `clean` report means the edge resolved.

| specifier form | result | 
|---|---|
| `@/utils/cadUpload` value import | **blocked** — `Cannot find package '@/utils'` → `kind: load` |
| relative `../utils/cadUpload` | **blocked** |
| relative `./neighbour.mjs`, neighbour genuinely present beside the *fixture* | **blocked** — the emitted module lives in a *different* temp dir |
| bare package `typescript` (installed at the repo root) | **blocked** |
| `await import("@/utils/cadUpload")` | **blocked** |
| `export { T }` without the `type` modifier | **blocked** — `Export 'T' is not defined in module` |
| top-level `throw` | **blocked** |
| **`node:os` / `os` / `node:fs` / `node:module` / `node:child_process`** | **RESOLVED, gate `clean`** |
| **absolute `file:` URL, static import of a real `.mjs`** | **RESOLVED, and the code EXECUTED** |
| **absolute `file:` URL, dynamic import of a real `.mjs`** | **RESOLVED, and the code EXECUTED** |
| **absolute `file:` URL of a `.ts` helper** | **RESOLVED and EXECUTED on Node 26; blocked on `--no-experimental-strip-types`** |
| **`createRequire()` + `require(absolute path)`** | **RESOLVED, and the code EXECUTED** |
| absolute `file:` URL of a *real repository module* (`src/utils/cadUpload.ts`) | blocked — but **only on its transitive `@/integrations` edge**, after Node had already opened the repository file |

**6 of 7 escape cases resolved with the gate reporting `clean`; in 5 of them the imported code ran inside
the gate process.** The narrower true statement is: *a specifier that resolves relative to the importing
module's location cannot resolve.* That covers every form a real `claims.ts` could plausibly grow, which
is why this is D2 (low) and not a criterion failure.

One asymmetry worth recording against the "ONE code path on every Node" claim: the `.ts` absolute-URL
escape works on a stripping Node and not on a non-stripping one. The loader is runtime-independent for the
ledger; its *escape surface* is not.

### 1.3 Can the transpiled artefact diverge from what Vite bundles? Yes, and silently

`evidence/05-`, `06-`. The gate evaluates in Node; the browser evaluates in a browser. Any
environment-conditional expression diverges:

```ts
export const CAD_UPLOAD_FORMATS = typeof window === "undefined" ? DERIVED : "… ve DWG";
```

The gate takes the `undefined` branch, sees the correct string and reports `clean` (`04-` L12). The browser
takes the other one.

**But it is covered by a second instrument, and I measured that rather than assuming it.** `src/content/claims.ts`
is in `ROOTS`, and detector (A) runs over every span outside the pinned tuple. Injected through the gate's
real matching path:

- `typeof window …: DERIVED : "STEP, STP, STL, OBJ, IGES, IGS ve 3MF ve DWG"` → **FIRES**
- `typeof window …: DERIVED : "STEP, IGES ve DWG"` → **FIRES**
- `… : "STEP ve DWG dosyalarini kabul ediyoruz"` → **FIRES**
- `globalThis.window ? "DWG, DXF ve SLDPRT" : DERIVED` → **silent**

The residual is a browser-only branch containing no accepted CAD token and no offer predicate — which is
the same residual the text rules already have with no conditional at all. **C5's loader does not widen it.**

### 1.4 Temp directories

`evidence/09-`.

| run | leftover |
|---|---|
| PASSing | 0 |
| PASSing, `--no-experimental-strip-types` | 0 |
| FAILing (a covered rule neutered) | 0 |
| `--list` | 0 |
| four concurrent gates (all four PASS) | 0 |
| **a run that THROWS mid-evaluation** | **16** |

No collision: `mkdtempSync` creates atomically with a random suffix; four concurrent runs all passed and
left nothing. The leak is real and reproducible — `node scripts/claims-gate.mjs --also-scan=src` throws
`EISDIR` and `cleanUpTempDirs()` is the last statement rather than a `finally`. Cosmetic (OS temp space);
recorded as D5. CI never hits it: `claims-gate.spec.ts:73` passes a file.

### 1.5 `typescript` absent, and a different major

`evidence/10-`, `11-`.

**Absent** (resolve hook throwing `ERR_MODULE_NOT_FOUND` for that one specifier; `node_modules` untouched):
the gate **fails closed**, exit 1, `FAILING: controls, derived-cad-copy`, four instrument controls red, and
`Cannot find package 'typescript'` printed verbatim in every message. The `ledger-not-loadable` remedy
paragraph says "Make `src/content/claims.ts` loadable again", which is the wrong advice for a missing
devDependency — but the true cause is on the same line, and the instrument-control block fires first under
"Nothing below this line can be trusted". Acceptable.

**A different major.** `verbatimModuleSyntax` earns its line, and exactly one class depends on it:

| source | gate options | without `verbatimModuleSyntax` |
|---|---|---|
| explicit `import type` | erased | erased |
| value-syntax import, binding used as a value | survives | survives |
| **value-syntax import, binding used ONLY in type position** | **survives** | **erased** |
| side-effect-only import | survives | survives |

`transpileModule` ignores unknown compiler options rather than rejecting them, so a compiler that does not
know the flag would silently erase that one class and the ledger would load clean. `^5.8.3` pins it inside
5.x today; a 6.x bump is the thing to re-measure.

---

## 2 — The instruments: C5's ten sabotages confirmed, and three one-line holes it did not try

### 2.1 The round-4 probes, run verbatim

`evidence/03-`. `scripts/qa-probes/p09a4-*` is DO_NOT_TOUCH; I ran it unmodified.

All four of round 4's sabotage anchors are **gone** — the hook throws `search text NOT FOUND` for
`drop-derived-from-clean`, `neuter-derived-check`, `drop-resources-from-clean` and
`neuter-resources-check`, which is the probe's own self-check working correctly. The probe's positive
control `neuter-a-covered-rule` still turns the gate red, so the harness is measuring the gate and not
itself.

### 2.2 The same four ideas, re-aimed at the new shapes

`evidence/12-`, `13-`. `scripts/qa-probes/p09a5-sabotage-hooks.mjs`. Calibration: `none` → GREEN,
`neuter-a-covered-rule` → RED.

**Eleven sabotages, eleven red gates** — every one C5 claims, plus one it names in a comment:

```
neuter-derived                      RED  5 controls failed
neuter-resources                    RED  1
neuter-register                     RED  1
drop-derived-from-registry          RED  1   <- "silently dropped from the registry
drop-resources-from-registry        RED  1      while its function still exists"
drop-register-from-registry         RED  1      — the packet's question, answered NO
verdict-ignores-derived             RED  1
verdict-ignores-resources           RED  1
verdict-ignores-register            RED  1
drop-reportDiagnostics              RED  1
neuter-a-covered-rule               RED  1
```

Note that `neuter-*` **is** the "returns `[]` unconditionally" case the packet asks about — a `return [];`
inserted at the top of each function. All three are caught.

### 2.3 The six that leave the gate GREEN — D1

```
verdict-ignores-everything          GREEN  exit 0, "PASS", header says "(1 failed)"
silent-on-production-derived        GREEN  exit 0, "PASS — 280 controls green", 0 failed
silent-on-production-resources      GREEN  exit 0, "PASS — 280 controls green", 0 failed
silent-on-production-register       GREEN  exit 0, "PASS — 280 controls green", 0 failed
neuter-check-controls               GREEN  exit 0, all 16 instrument controls silenced, 0 failed
neuter-check-controls-and-derived   GREEN  exit 0, R4-5 restored at a cost of one extra line
```

The three `silent-on-production-*` are **one line each**, and they are enabled by the C5 fix itself. C5's
answer to R4-5 was to **parameterise** the path each check reads so a control can hand it a fixture. Every
one of the sixteen controls therefore passes an argument that is not the production one, and a guard keyed
on that argument is invisible to all sixteen:

```js
async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) {
  if (ledgerFile === CAD_LEDGER_FILE) return [];      // ← one line; 280 controls stay green
```

The same shape works on `publicDir === "public"` and `register === DEFERRED_09B_SOFTWARE_INVENTORY`.
No control anywhere in the file calls any of the three with production defaults.

`neuter-check-controls` matters for a second reason: the header line
`# controls: 280 (0 failed), of which 16 watch the 3 checks` computes 280 from
`CHECK_CONTROLS.length` and 0 from `controlFailures.length`. With `runCheckControls()` returning `[]`
both numbers are unchanged. **That line is not evidence that 280 controls ran.**

`verdict-ignores-everything` prints `# controls: 280 (1 failed)` and `280 controls green` in the same
report — a visible self-contradiction, but exit 0, and CI reads the exit code.

### 2.4 The remedy, measured rather than proposed

I built the obvious fix and it **did not work**, which is worth more than the fix that did.

*Remedy 1* — three controls asserting the production path produces **no problem**
(`checkDerivedCadCopy()` reports no `load` failure, `checkQualityResources()` reports nothing, the real
register resolves). Injected: 283 controls, all green — and `remedy-vs-silent-on-production-derived` is
**still GREEN**. A control that asserts the absence of a problem is satisfied by `return []`. My own
proposed control was vacuous in exactly the way the defect is.

*Remedy 2* — a control that demands a **positive disagreement** on the production path:

```js
const problems = await checkDerivedCadCopy(CAD_LEDGER_FILE, { CAD_UPLOAD_FORMATS: "  no ledger publishes this" });
return problems.some((p) => p.kind === "drift") ? null : "…it is not reading it at all";
```

A guard keyed on `ledgerFile === CAD_LEDGER_FILE` cannot tell this call from the real one, so it must
answer honestly or fail.

```
remedy2-alone                              GREEN   (283 controls, healthy tree)
remedy2-vs-silent-on-production-derived    RED     1 control failed
remedy2-vs-neuter-derived                  RED     6 controls failed
```

**The principle, for the correction packet:** a check that is silent on a healthy tree cannot be controlled
by asserting its silence. Either make the production call disagree deliberately (works for
`derived-cad-copy`), or have the check report **what it examined** — rows measured, sites resolved — and
control that count against the tree (the only shape that closes `quality-resources` and
`deferred-class-register`, since both legitimately return `[]`).

---

## 3 — The sweep

`evidence/21- 22- 23-`, `24-`, `40- 41-`.

Three consecutive runs of the byte-identical committed spec at `desktop-1280`:

```
ROUTES_REQUESTED=63 ROUTES_VISITED=63 FAILED=0 SLA_ROUTES=57 FINDINGS=0 EXEMPTED=12
SETTLED slowest=/malzemeler@2292 / 2836 / 2301 ms  shortest=/endustriyel@1889chars  neverSettled=0
ROUTES_WITHOUT_SLA (6): /kvkk, /gizlilik-politikasi, /cerez-politikasi, /hizmetler, /kabiliyetler, /endustriyel
```

The SLA-route list, the findings list and the exemption set are **identical across all three runs**.
`/` settles at **4891 characters** — the number I measured in round 4 on a settled page, and the number C5
reports. `SLA_ROUTES=57`, three for three: the 56/57 wobble is gone.

**The loud failure, proved without touching the spec.** C5 says it proved this by temporarily forcing
routes to look unsettled. A temporary edit is not evidence anyone can re-run, and the spec is DO_NOT_TOUCH
to me, so I ran it **exactly as committed** against a server returning 88 characters of body text for every
path — the length round 4 measured on the two routes it caught mid-flight (`p09a5-loud-failure.mjs`):

```
ROUTES_REQUESTED=63 ROUTES_VISITED=0 FAILED=63 SLA_ROUTES=0 FINDINGS=0
SETTLED slowest=/@12089ms shortest=/@87chars neverSettled=63
Error: every public route must SETTLE and render — an unrendered route is not a clean route
  { "route": "/", "reason": "never settled: 87 characters after 12089 ms — the shell, not the page" }
  … 62 more, each with its own count and elapsed time
```

Under the old wait all 63 would have been scanned and recorded clean.

**Do rounds 2 and 3 now rest on something I trust? Yes.** Two independently-written instruments —
`qa-p09a2-claims-sweep` (fixed) and `qa-p09a4-stabilised-sweep` (mine, round 4) — now report
`neverSettled=0 SLA_ROUTES=57 FINDINGS=0 EXEMPTED=12`, at desktop-1280 and mobile-375. They agree by
construction on the *waiting* and independently on the *rules*. That is the strongest form of agreement
available here.

One cost, recorded not as a defect: a fully-unrendered run takes **11.7 minutes** against 2.2 for a healthy
one, because a route that never settles burns all 60 poll iterations. `test.setTimeout` was raised to 20
minutes, which covers it here with ~7 minutes of headroom. On a slower runner a genuinely broken build
could hit the test timeout and report a Playwright timeout instead of the 63-route diagnostic list. A
route flat at ≤ `SHELL_ONLY_MAX` for ~10 consecutive polls will not grow; breaking out early would remove
the risk.

---

## 4 — Detector (D), and the register

### 4.1 The two over-catches are closed and nothing else moved

`evidence/17-`. `p09a4-widened-rules.mjs` run verbatim: **31 probes, 0 mismatches, 0 contaminated runs.**
D6 (`Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz.`) and D7
(`Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz.`) are now SILENT; D1/D2/D3 still FIRE; the seven
`kazan[çc]` probes, the three `Mastercam` probes, the six pin probes and the two shadow probes are all
unchanged.

### 4.2 A hole the second condition opens — in fact six

`evidence/18-`, `scripts/qa-probes/p09a5-detector-d.mjs`. `expect` is what the gate's **own comment** says
should happen, so a mismatch is the gate disagreeing with its stated design.

**(i) tests the possessive on the NOUN but the second person on the whole SENTENCE**, and `SENTENCE_BREAK`
(`claims-gate.mjs:593`) does not break on `;`. The comment at `:1102-1105` says *"'Tüm dosyalarınızı kabul
ediyoruz' is a first-person acceptance claim about an unbounded class and must still fire. Both halves, or
nothing."* It fires — until anything second-person follows it:

| string | expected | actual |
|---|---|---|
| `"Tüm dosyalarınızı kabul ediyoruz."` | FIRES | **FIRES** ✔ |
| `"Tüm dosyalarınızı kabul ediyoruz; dilerseniz e-posta ile de gönderebilirsiniz."` | FIRES | **SILENT** |
| `"Her türlü dosyanızı işleyebiliriz; süreci panelden takip edebilirsiniz."` | FIRES | **SILENT** |

**(ii) tests the report governor against 60 characters of RAW FILE TEXT**, not the sentence
(`:1305`), so it reaches across a full stop; and "at most one word between" is a boundary the comment
walks right up to — it cites the three-word form as still firing:

| string | expected | actual |
|---|---|---|
| `"Kalite raporu ile birlikte tüm CAD formatlarını gönderebilirsiniz."` (3 words) | FIRES | **FIRES** ✔ |
| `"Kalite raporu ile tüm CAD formatlarını kabul ediyoruz."` (1 word) | FIRES | **SILENT** |
| `"Rapor sonrası tüm CAD formatlarını kabul ediyoruz."` (1 word) | FIRES | **SILENT** |
| `"Raporlama tüm dosya türlerini destekliyoruz."` (0 words) | FIRES | **SILENT** |
| `"Ölçüm raporu hazırlanır. Tüm CAD formatlarını kabul ediyoruz."` (across a full stop) | FIRES | **SILENT** |
| `"Kontrol raporu teslim edilir. Yaygın CAD formatlarını doğrudan işleyebiliyoruz."` (2 words) | FIRES | **FIRES** ✔ |

Three negative controls (`Hangi dosya formatlarını destekliyorsunuz?`, `…hazırlıyoruz`, the D5 string) stay
silent, so the detector has not simply gone quiet.

All six are **latent** — none is in the tree. Narrow fixes: test `CAD_VISITOR_ACTION` against the predicate
that matched `CAD_OFFER_PREDICATE` rather than the whole sentence; clip the governor's 60-character window
to `sentenceAt(text, index)`.

One dead branch noticed: `CAD_VISITOR_OWNED_NOUN` accepts `belge…niz`, but `CAD_VAGUE_SCOPE`'s noun group
is `dosya|format|uzantı` only, so the `belge` branch can never be reached. Harmless — it makes (i)
narrower.

### 4.3 The count: I make it six, and here is the work

`evidence/15-`, `scripts/qa-probes/p09a5-register-count.mjs`. The class was defined **before** counting:
a LIVE (non-comment) string in the public source naming a CAD **authoring** package as something *we
operate*. The live/comment split is made with the gate's own `blankComments()`, and the search covers
**every scanned root**, not `servicePages.ts` alone, because "six sites in one file" is a claim about the
whole tree.

```
20 lines in the scanned roots name CATIA / SolidWorks / NX
   12 comments  (servicePages.ts :60 :66 :67 :70 :163 :216 :219 :220 :1929 :2070 :2083, chatFaqData.ts:8)
    8 live
      2 CAD-FORMAT class — a file the VISITOR sends, not software we operate:
          servicePages.ts:224                     (09a-C3 keeps it deliberately; reason at :216-222)
          RestoredLandingSections.tsx:42          (see below)
      6 SOFTWARE-INVENTORY class:
          :788  metaDescription "… CATIA/SolidWorks ile 3D modelleme ve simülasyon."
          :793  "CATIA ve SolidWorks ile 3D modelleme, kuvvet ve tolerans analizi simülasyonu…"
          :811  "3D Modelleme (CATIA/SolidWorks)"
          :818  "CATIA/SolidWorks ile profesyonel tasarım"
          :3318 "… tasarım (SolidWorks, CATIA, NX), prototip üretimi…"
          :3332 { label: "CAD", value: "SolidWorks, CATIA, NX" }

MY COUNT: 6      register resolves to: 788, 793, 811, 818, 3318, 3332      SAME SET: true
```

**There was never a disagreement to settle.** My round-4 report (`phase-09a-r4.md:333-335`) said the
*citation's union* was five and named `servicePages.ts:3318` as the omitted sixth; the defect row says
*"enumerates five distinct sites while claiming six (`:3318` omitted)"*. The class was six in round 4 and
it is six now. Two of you agreeing was not proof, and it also was not necessary — the third count agrees
for reasons written down above.

**A finding I raised and then falsified myself.** `RestoredLandingSections.tsx:42` is a rendered-looking
FAQ answer offering `"STEP, STP, IGES, Parasolid, SolidWorks"` — Parasolid and SolidWorks are both refused
by `validateCadFile()`, and STL/OBJ/3MF are missing. No rule fires on it, and the root cause is real:
detector (A) is scoped to `src/data/**` plus pinned files (`claims-gate.mjs:1270`) and this is a component;
detector (B) needs `CAD_OFFER_PREDICATE` and the verb is `değerlendirebiliriz`, which is not in it. **But
it is not published.** `grep Parasolid dist/assets/*.js` after a clean build finds nothing:
`RestoredLandingSections` → `LandingFlow` → `LegacyLanding` → the dev-only `/legacy-landing` route, which
`src/App.tsx` excludes from production. Recorded as an observation, not a defect.

### 4.4 The register's red-on-legitimate-edit message

`evidence/16-`. Forced both directions. What a reader gets:

```
### deferred-class-register — 1
  src/data/servicePages.ts: 09b-SOFTWARE-INVENTORY: "…" occurs 0 times, expected exactly 1. If 09b has
  decided this class, delete the entry from DEFERRED_09B_SOFTWARE_INVENTORY in this file — the register is
  the enumeration of what is still deferred, and an entry that no longer resolves is a list that has
  started to rot. If the copy merely moved, update the fragment.

FAILING: deferred-class-register
```

**Would an agent who has never read the packet do the right thing? Yes.** `09b-SOFTWARE-INVENTORY` and
`DEFERRED_09B_SOFTWARE_INVENTORY` are both unique greppable tokens, the first lands you in the comment
that explains the whole class, and the first remedy sentence is correct for the event that will actually
happen (09b deletes a site → `occurs 0`). No line numbers, which was R4-3's point. Two one-line
improvements worth making:

1. *"in this file"* is printed under the prefix `src/data/servicePages.ts:`, and the constant is in
   `scripts/claims-gate.mjs`. A reader who follows the sentence literally greps the wrong file. Costs one
   grep; it is the same category of misdirection R4-3 raised, so worth closing. Name the file.
2. `occurs 2 times` receives advice written for `occurs 0 times`: *"an entry that no longer resolves"* is
   false, and *"delete the entry"* is the wrong direction when the class has **grown**. One branch.
3. Cosmetic: the generic printer (`:3458-3465`) emits only `file: message`, so this section has no
   `authority:` or `remedy:` line while every other section has both.

---

## 5 — Regression, and the flake

`evidence/30-` … `41-`. Built once (`npm run build`, exit 0, 1 m 17 s), then `PLAYWRIGHT_PREVIEW_ONLY=1
PLAYWRIGHT_PORT=4173` (checked free before binding), one `--project=` per invocation, foreground.

| project / spec | result |
|---|---|
| `critical-1280` | 82 passed, 1 skipped |
| `critical-375` | 81 passed, 2 skipped |
| `visual-375` | **1 failed**, 34 passed, 6 skipped → re-run **35 passed**, 6 skipped |
| `visual-768` | 35 passed, 6 skipped |
| `visual-1280` | 41 passed |
| `visual-1440` | 35 passed, 6 skipped |
| `qa-p09a2-claims-sweep` @ `desktop-1280` ×3 | 3 passed |
| `qa-p09a-rfq-form` + `qa-p09a2-contrast` + `qa-p09a3-cad-dom` @ `desktop-1280` | 20 passed |
| `qa-p09a3-cad-dom` @ `mobile-375` | 2 passed |
| `qa-p08-scroll-region-reach` + `-storage-disclosure` + `-waveb-contract` @ `mobile-320` | 24 passed, 37 skipped |
| `shared-shell-accessibility` @ `desktop-1280` | 12 passed, 4 skipped |
| `qa-p09a4-sla-wobble` + `-stabilised-sweep` + `-evidence-write-guard` @ `desktop-1280` | 6 passed |
| `qa-p09a4-stabilised-sweep` @ `mobile-375` | 1 passed |

**376 passed, 1 failed, 62 skipped** (+35 on the re-run). **No golden moved** —
`git status --porcelain -- e2e/__golden__` empty after all four visual projects and after every other run;
`--update-snapshots` never used. **Specs unedited** — `git diff --name-only 80b2c87..HEAD -- e2e/` empty.
The gate re-run after the whole matrix: `PASS — 0 unverified claims across 31 rules, 280 controls green`.

### The flake, argued

**None of C5's five reproduced.** `critical-1280` and `critical-375` ran 163 tests green with
`retries=0`, so a flake there is a hard failure locally — and landing-anchors, landing-process-flow and
motion-grammar all live in that set. `qa-p09a3-cad-dom` green at both viewports. `qa-f4-font-guard` green
in all five visual runs, including the one that failed.

**I got a sixth, and it is round 3's.** `visual-375 › wave-b-golden.spec.ts › journal-lead holds its
baseline`:

```
Error: installFontRetry() intercepted 0 requests on fonts.gstatic.com — the face files live on that host,
so a pattern that misses it retries nothing that matters
    at visual/fonts.ts:170
Test timeout of 60000ms exceeded.
```

**Contention or latent? Both — and they separate cleanly.**

*Contention was the trigger.* That run followed a build, three sweeps, an 11.7-minute probe and two
critical projects on an 8 GB box. Immediately afterwards I measured the CDN: six sequential fetches of the
exact stylesheet URL, **65–303 ms, zero errors** (`evidence/43-`). The network was fine. A healthy
`wave-b-golden` test takes ~3 s; this one spent 60.

*But contention makes a test slow, not wrong.* Three properties in `e2e/visual/fonts.ts` — not in the
machine — convert slow into failed and into a **misdiagnosis**:

1. `awaitRealFaces()` asserts on a **network side effect** (the interception counts) with **zero
   tolerance**, immediately before an `expect.poll()` that measures the thing it actually cares about
   (`document.fonts`) and *is* tolerant. Under load, "the face files have not been requested yet" and "the
   route pattern is broken" are indistinguishable to it, and it reports the second. The `googleapis`
   assertion is checked first and **passed**, so the stylesheet *was* intercepted — only the face requests
   had not been issued yet.
2. The retry budget is `4 × 15 s = 60 s`, which is **exactly** the test timeout. There is no headroom by
   construction: one slow first attempt consumes the whole test.
3. The entire visual family depends on a **live third-party CDN at capture time**. There is no
   `public/fonts`; `index.html:265-274` loads `fonts.googleapis.com` by URL. A golden-screenshot suite's
   determinism is therefore a function of Google's CDN and the local resolver.

The F4 guard is a legitimate defence against a no-op route pattern, and it should stay. What should change
is *when* it is checked: after the `document.fonts` poll rather than before it, so a slow request is
reported as slow. As it stands the message names the wrong cause — which is exactly why round 3 recorded
this as a flake, round 4 recorded none, and C5 recorded five different ones. Nobody has been reading one
signal.

**This is not attributable to C5**, which touched neither file.

---

## 6 — Judgement calls the packet asked for

**Criterion 1 had already decided it — I agree with C5, and the packet's framing was wrong.** The packet's
acceptance criterion required *the gate to run on a Node without type stripping*. Raising `NODE_VERSION`
does not satisfy that; it satisfies a weaker and different one — *the gate runs in CI*. It moves the six
blocking jobs onto a stripping Node and leaves the gate unable to run anywhere else, including on a
contributor's LTS. My own R4-1 wording ("a gate that cannot run in the place it is supposed to protect is
not a gate") stopped one step short of the sharper property C5 named: **runtime independence**. Two further
facts settle it. Node 20 reached EOL on 2026-04-30, so the workflow route would have had to be redone
within months. And a workflow bump would have left `e2e/landing/claims-gate.spec.ts:32`'s bare
`node scripts/claims-gate.mjs` failing for every local developer on an LTS, with a message about CAD copy
drift. The two routes were never equals.

**The CI decoupling is confirmed.** `.github/workflows/playwright.yml:29` still pins `NODE_VERSION: "20"`
for all six jobs, and nothing about the gate depends on it any more: no `--experimental-strip-types` flag
anywhere in the repo, no `engines`, no `.nvmrc`, `claims-gate.spec.ts` invokes bare `node`, and the gate
uses no API newer than Node 20. The EOL runtime is a hygiene item for a later phase, as the packet says.

**The enum control does what it says.** Independently: a ledger carrying `export enum` + `export namespace`
with correct copy → **no problem of any kind**; the same ledger with drifted copy → **`drift`**. And
`drop-reportDiagnostics` turns the gate red, so the control's message assertion is doing the work the
comment claims it does rather than passing on kind alone. R4-7 is correctly falsified by measurement.

**The red-on-legitimate-edit message** — judged in §4.4. Adequate; two one-line improvements.

---

## Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| `visual-375 › wave-b-golden › journal-lead holds its baseline` | `installFontRetry() intercepted 0 requests on fonts.gstatic.com` + 60 s timeout; green on re-run and in three sibling viewports | `e2e/visual/fonts.ts:169` asserts a network side effect with zero tolerance before the tolerant `document.fonts` poll; retry budget (4×15 s) equals the test timeout; live CDN dependency with no local fallback | Not for 09a — pre-existing, untouched by C5. Test-harness fix. |

## Defects

| # | file:line | severity | blocks? |
|---|---|---|---|
| **D1** | `scripts/claims-gate.mjs:996`, `:2863`, `:2934` — every one of the 16 instrument controls calls these with a fixture argument, so a one-line guard on the production argument (`ledgerFile === CAD_LEDGER_FILE`, `publicDir === "public"`, `register === DEFERRED_09B_SOFTWARE_INVENTORY`) leaves `PASS — 280 controls green` with 0 failed. Plus `:3283` `runCheckControls()` → `[]` silences all 16 while the header still prints `280 (0 failed) … 16 watch`, and `:3027` `verdict()` returning `clean: true` overrides everything including the control that catches it. The claim at `:2985` ("Four sabotages, four red gates") is TRUE; the surrounding conclusion at `:2957-2963` that the R4-5 class is closed is not — it is narrowed. Remedy measured: `evidence/12-` `remedy2-*`. | medium | **no** |
| **D2** | `scripts/claims-gate.mjs:857-865` — "any surviving import then has to resolve from a directory with no `node_modules`, no `@/` alias and no relative neighbours" is false for every specifier that does not consult the importing module's location. 6 of 7 escape cases resolved with the gate reporting `clean`; 5 executed code inside the gate process (`node:*` builtins, bare builtin names, absolute `file:` URLs, `createRequire`). The control that defends the claim exercises only the `@/`-alias form. The ledger as committed is clean (0 surviving imports) and every specifier a real `claims.ts` could plausibly grow IS blocked. | low | no |
| **D3** | `scripts/claims-gate.mjs:1308` and `:1305` — detector (D)'s two new discriminators over-suppress in 6 measured ways, including `"Tüm dosyalarınızı kabul ediyoruz"` the moment any second-person clause follows it, which is the exact string the comment at `:1102-1105` says must still fire. (i) tests the second person on the whole sentence and `SENTENCE_BREAK` does not break on `;`; (ii) tests the governor against raw text and so reaches across a full stop. All latent. | low | no |
| **D4** | `scripts/claims-gate.mjs:2949` — "delete the entry from `DEFERRED_09B_SOFTWARE_INVENTORY` **in this file**" is printed under the prefix `src/data/servicePages.ts:`, but the constant is in `scripts/claims-gate.mjs`. And `occurs 2 times` receives the advice written for `occurs 0 times`. | low | no |
| **D5** | `scripts/claims-gate.mjs:3481` — `cleanUpTempDirs()` is the last statement rather than a `finally`/`process.on("exit")`, so a mid-evaluation throw leaves 16 directories in `os.tmpdir()`. Reproducible today: `node scripts/claims-gate.mjs --also-scan=src` throws `EISDIR`. No verdict depends on it; CI passes a file, not a directory. | low | no |
| **D6** | `e2e/visual/fonts.ts:169-172` — see *Failed checks*. **Pre-existing; not C5's.** | low | no |

## Commands run

```text
git diff --name-only 9761249..80b2c87                      -> 2 files
node scripts/claims-gate.mjs                               -> PASS 31/280/0, exit 0
node --no-experimental-strip-types scripts/claims-gate.mjs -> byte-identical, exit 0
P09A4_MUTATION=<5 mutations> node --import=./scripts/qa-probes/p09a4-gate-mutator.mjs scripts/claims-gate.mjs
node scripts/qa-probes/p09a4-widened-rules.mjs             -> 31 probes, 0 mismatches
node --import=./scripts/qa-probes/p09a5-expose.mjs scripts/qa-probes/p09a5-loader-attacks.mjs
node [--no-experimental-strip-types] --import=…p09a5-expose.mjs …/p09a5-loader-escape.mjs
node scripts/qa-probes/p09a5-tempdir.mjs
P09A5_HIDE_TS=1 node --import=./scripts/qa-probes/p09a5-ts-dependency.mjs scripts/claims-gate.mjs
node scripts/qa-probes/p09a5-compiler-options.mjs
node scripts/qa-probes/p09a5-sabotage-run.mjs              -> 24 sabotages
node --import=…p09a5-expose.mjs scripts/qa-probes/p09a5-register-count.mjs
node scripts/qa-probes/p09a5-detector-d.mjs                -> 17 probes, 7 mismatches (1 my error)
node scripts/qa-probes/p09a5-loud-failure.mjs
npm run build                                              -> exit 0, 1m17s
PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_PORT=4173 npx playwright test --project=<one per invocation>
git status --porcelain -- e2e/__golden__                   -> empty
```

## Scope integrity

- **Production files modified by QA: NONE.** `git diff --name-only 80b2c87..HEAD` lists only
  `reports/qa/phase-09a-r5/**` and `scripts/qa-probes/p09a5-*`.
- No production write of any kind: nothing submitted, invoked, uploaded, inserted or deployed. The four
  `public.rfqs` rows and three `cad-uploads` objects were not touched. **U1–U7 were not attempted.**
- `scripts/claims-gate.mjs` was never opened for writing. Every sabotage and every exposed binding is an
  in-memory ESM `load`-hook rewrite; the file on disk is byte-identical to `80b2c87`.
- `scripts/qa-probes/p09a2-* p09a3-* p09a4-*` were run, not edited.
- No `--update-snapshots`, at all. No golden moved. No pre-existing spec edited. No new npm package.
- `.env` not committed.

## Notes

**Where this verdict is a proxy rather than a measurement.** Node 20 is not installed on this machine
(`/c/Program Files/nodejs/node` is v26.3.0; no nvm/nvs). Criterion 1 is therefore evidenced by
`--no-experimental-strip-types` (byte-identical output), by the absence of any stripping flag or Node
version constraint in the repo, and by a targeted grep for Node-21+ APIs in `claims-gate.mjs` returning
zero hits. The one behaviour I could **not** verify on the real CI runtime is the transpile of
`src/content/claims.ts` under whatever `typescript` binary Node 20's `npm ci` resolves — it will be the
same `5.8.3`, but I have not run it there.

**The through-line, for the orchestrator.** Every defect in this round is the same shape: a true, narrow,
controlled behaviour with a comment above it stating a broader claim than the controls demonstrate.
`:857-865` states a universal about imports its control tests for one specifier class. `:2957-2963`
concludes a class is closed when four specific sabotages are red. `:1102-1118` says "both halves, or
nothing" when one half is tested at sentence scope. This is the third round running in which a *comment*,
not code, was the finding — R4-1's blocking defect was a comment that had gone false, and R4-2's
over-catch was defended by a comment that was wrong. The gate's engineering is good; its prose is
consistently one step ahead of its measurements.

**Recommended routing.** D1 and D2 are gate-hardening, not 09a content, and both have a concrete remedy
written above (`remedy2` measured green-then-red; clip the governor window; name the file in the register
message). They belong in 09b as an explicit item rather than as a note. D6 is a test-harness item
independent of this phase and, on the evidence, the source of three rounds of disagreement about flake.

## Unverifiable

`U1`–`U14` carried unchanged from rounds 2–4. `U1`–`U7` each require a production write and were not
attempted. New this round:

- **U15** — the gate's behaviour on Node 20 itself, and on a `typescript` major other than 5.x. Both
  reasoned and proxied above; neither runtime is available here.
- **U16** — whether `vite build` warns or errors on a ledger importing a `node:` builtin. Not tested,
  because testing it requires editing `src/content/claims.ts`. Reasoned only: Vite externalises browser
  builtins with a warning, so the failure would be at runtime rather than at build time.
