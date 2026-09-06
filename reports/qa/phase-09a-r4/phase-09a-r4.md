# QA Report — Phase 09a, Round 4 (closing round)

- PHASE: `09a-QA-R4`
- CODE_COMMITS: `ba474f7`, `d75b047`, `41977dc`, `7752336`, `f5c27fc`, `20397c0`, `3739628`, `90ea958`,
  `78948f8`, `184abf2` — the true integrated range is **`e7cf106..184abf2`**, not the
  `8b5ee92..184abf2` the packet states (see §0)
- QA_COMMIT: `wt/qa-p09a4` HEAD
- STATUS: **FAIL** — one blocking defect, six non-blocking
- TESTS_PASSED: 377
- TESTS_FAILED: 0 (final state)
- TESTS_SKIPPED: 62 (all pre-existing viewport/project gating)
- NEW_TESTS_ADDED: 6 tests in 3 spec files, plus 3 probe scripts

Round 3's content and design findings were not re-verified, per the packet. Round 3's `SLA: 57 of 63`
**was** re-established, because the packet asked whether the measurement it rests on is sound. It is not,
and 57 is nonetheless the right number — §5.

---

## 0 — Scope integrity

`8b5ee92` **is not on `claude/awwwards-90-overhaul`.** `git branch -a --contains 8b5ee92` returns only
`wt/coder-p09a4`: it is the Coder's own commit object for the same change that landed on the branch as
`ba474f7`. `git diff 8b5ee92..184abf2` still produces a diff, and that diff silently omits the whole
first C4 commit — which is where `checkDerivedCadCopy` and the `await import()` are introduced. Anyone
reviewing the range as written would not see the change this round is mostly about.

The integrated range is `e7cf106..184abf2`, **10 commits, 6 files**:
`scripts/claims-gate.mjs`, `e2e/landing/claims-gate.spec.ts`, `e2e/qa-p09a2-claims-sweep.spec.ts`,
`e2e/qa-p09a3-cad-dom.spec.ts`, `src/content/claims.ts`, `src/data/servicePages.ts`. That is exactly the
packet's description — the gate, three specs, two code comments.

**Integration is clean.** `git diff wt/coder-p09a4 184abf2` is `.work/packets/phase-09a-C4.md` and
`PROGRESS.md` only — the orchestrator's own two files. All ten code commits landed with identical trees.

**No published string changed.** Both `src/data/servicePages.ts` hunks are comment-only; the
`metaDescription` values are context lines in the diff. **No golden moved** (§6).

QA touched no production file. `git status --porcelain -- src public index.html scripts/claims-gate.mjs
e2e/__golden__ reports/qa/phase-09a-r2 reports/qa/phase-09a-r3 …` is empty after the full run:
`evidence/scope-after-visual.txt`.

---

## 1 — The mechanism: attacks on the value-import check

### 1.1 BLOCKING — CI cannot run this gate. `NODE_VERSION: "20"`.

`checkDerivedCadCopy` does `await import(pathToFileURL("src/content/claims.ts"))` and its own error
message says **"Node >= 22.18 is required for the TypeScript type stripping this uses."**

`.github/workflows/playwright.yml:29` sets `NODE_VERSION: "20"`. Node 20 has no type stripping at all —
`--experimental-strip-types` first appears in v22.6.0 — so the import throws `ERR_UNKNOWN_FILE_EXTENSION`.

The chain is deterministic and every link is in the repository:

| link | evidence |
|---|---|
| the gate fails closed without type stripping | `node --no-experimental-strip-types scripts/claims-gate.mjs` → exit 1, `Unknown file extension ".ts"`, `evidence/gate-nostrip.txt` |
| the gate runs inside the critical suite | `e2e/landing/claims-gate.spec.ts:33` `execFileSync("node", ["scripts/claims-gate.mjs"])`; the spec asserts `stdout` is `""` **and** contains `PASS —` |
| the critical suite includes it | `playwright.config.ts:108` `CRITICAL_MATCH = ["landing/**/*.spec.ts", …]` |
| CI runs the critical suite as a blocking gate | `playwright.yml:83` `e2e-critical`, `run: npm run test:e2e:critical`, on `push: [main]` and `pull_request: [main]` |
| CI pins Node 20 | `playwright.yml:29` `NODE_VERSION: "20"`, used by all six jobs |
| C4 introduced the requirement | `git show e7cf106:scripts/claims-gate.mjs` has no `await import`; `ba474f7` adds it |

So the first pull request that carries this branch to `main` gets a red `e2e-critical`, and the failure
message will be a claims-gate report about CAD copy drift — which is not what is wrong.

It fails **closed**, which is the right direction and is to the Coder's credit: no false claim ships. But
a blocking gate that cannot go green on the machine it blocks is not a working gate, the fix is a
one-line change to a file QA may not touch, and 09a closes on this verdict. `NODE_VERSION: "20"` → `"22"`
(current 22.x is ≥ 22.18) or `"24"`, then re-run `e2e-critical`. Nothing else in the repository needs it:
`scripts/claims-gate.mjs:813` is the only runtime `.ts` import in `scripts/**`.

### 1.2 Can the gate import something the app does not bundle? Yes — by extension shadowing.

`REPO_ROOT` is derived from the script's own URL (`claims-gate.mjs:63`), so the check is cwd-independent
and cannot be redirected by running it from elsewhere. The path is a hard-coded constant. Both good.

But the gate resolves **`src/content/claims.ts` literally**, while the app resolves `@/content/claims`
through Vite, whose `resolve.extensions` default — read from the installed package,
`node_modules/vite/dist/node/constants.js:24` — is `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx',
'.json']`. `.mjs` and `.js` come **before** `.ts`. A `src/content/claims.js` would therefore be what the
app bundles while the gate keeps validating `claims.ts` and reporting PASS.

It is doubly blind, because `EXT` at `claims-gate.mjs:101` is
`/\.(tsx?|html|txt|xml|json|webmanifest|svg|md)$/` — **`.js`, `.jsx`, `.mjs` and `.cjs` are not scanned by
the gate at all**, anywhere under `src/` or `public/`. Not live: `find src public -type f \( -name '*.js'
-o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.mts' \)` returns 0. Non-blocking, and the
`EXT` half is pre-existing rather than C4's.

### 1.3 Can the two renderings diverge? Not silently.

`EXPECTED_CAD_COPY` (`claims-gate.mjs:803`) uses the gate's own `joinTurkish`; `claims.ts:110` uses its own
`joinTurkishList`. They are independent implementations, which is the right shape: if either drifts the
comparison fails and the gate goes red. Verified equal today by the gate passing. `CAD_UPLOAD_EXTENSIONS`
matches likewise. `claims.ts` has exactly one import, an `import type`, and no `import.meta.env` at
runtime — checked, so Node and Vite evaluate the same module. A future `import.meta.env?.X ? … : …` would
diverge silently (Node sees `undefined`), but an unguarded `import.meta.env.X` throws and fails closed.

### 1.4 The fail-closed path is real, and it has a second trigger nobody has hit yet.

Node's stripper is strip-only. A `enum`, `namespace`, or a constructor parameter property added to
`claims.ts` throws `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` — measured on this machine, not assumed:
`TypeScript enum is not supported in strip-only mode`. The gate would then report *"could not be
evaluated, so the published CAD strings were checked against nothing"* over a perfectly correct file.
Correct direction, confusing failure. Non-blocking; worth a sentence in the comment.

---

## 2 — The two checks no control covers: the Coder's claim is true, all four ways

The claim was verified, not taken. `scripts/qa-probes/p09a4-gate-mutator{,-hooks}.mjs` rewrites
`scripts/claims-gate.mjs` **in an ESM `load` hook**, so the file on disk is never opened for writing and
`import.meta.url` — hence `REPO_ROOT` — is unchanged. Every mutation asserts its search text was present
and that the source actually changed; a silent no-op would reproduce the very defect under audit.

| mutation | controls | verdict |
|---|---|---|
| `neuter-derived-check` — `checkDerivedCadCopy` returns `[]` | 262 (0 failed) | **PASS** |
| `drop-derived-from-clean` — result dropped from the conjunction | 262 (0 failed) | **PASS** |
| `neuter-resources-check` — `checkQualityResources` returns `[]` | 262 (0 failed) | **PASS** |
| `drop-resources-from-clean` | 262 (0 failed) | **PASS** |
| `neuter-a-covered-rule` — probe's own positive control | 262 (**1 failed**) | **FAIL** |

The last row matters: the probe is proved able to turn the gate red, so the four PASSes are not a broken
harness. Raw: `evidence/uncovered-checks.txt`, `evidence/uncovered-checks-clean-conjunction.txt`.

**The stated impossibility does not hold.** The comment says a control "would have to mutate a source file
while the gate is running, which a gate must not do". Two designs avoid that, and C4 itself supplies the
pattern for one of them:

1. **Split the I/O from the judgement.** `checkDerivedCadCopy` is `read → compare`. Extract
   `compareDerivedCopy(namespace, expected)` — a pure function over a plain object — and a control passes
   `{ CAD_UPLOAD_FORMATS: "… IGS, 3MF ve DWG" }` and asserts a problem comes back. Same for
   `checkQualityResources(ledgerSource, statSize)`. Nothing on disk is touched.
2. **Give it a fixture path.** `checkDerivedCadCopy(file = CAD_LEDGER_FILE)`, and the control points it at
   a ledger written to `tmpdir()` — which is exactly what `claims-gate.spec.ts` now does for `--also-scan=`.

Neither weakens anything, and either turns the "one instrument asleep" hazard from a recorded fact into a
caught one. Non-blocking, because the hazard *is* recorded and A6/A7 prove the check externally.

---

## 3 — The evidence-overwrite class

**Byte-identity, proved independently.** `md5sum` over all 61 files before and after the full regression:

```
r2 15 files, r3 46 files — 61 total
manifest md5 before: 5ce8962c241653836eaec40ff1f87d62
manifest md5 after:  5ce8962c241653836eaec40ff1f87d62   (diff: no output)
```

`evidence/prior-evidence-before.md5`, `evidence/prior-evidence-after.md5`. Both QA specs echoed
`… (scratch)` on every ordinary run — `evidence/reg-qa-p09a-desktop-1280.txt`,
`evidence/reg-qa-p09a3-mobile-375.txt`.

**My own grep of `e2e/**`.** Every write call in the tree, classified:

| site | destination | status |
|---|---|---|
| `e2e/landing/claims-gate.spec.ts:68` | `mkdtempSync(tmpdir())` | outside the repository; removed in `finally`, and a kill now leaves only a temp dir |
| `e2e/qa-p09a2-claims-sweep.spec.ts:168` | `test-results/` unless `QA_SWEEP_WRITE_EVIDENCE=1` | gated |
| `e2e/qa-p09a3-cad-dom.spec.ts:61` | `test-results/` unless `QA_P09A3_WRITE_EVIDENCE=1` | gated |
| 7 × `testInfo.attach(…)` | `outputDir` = `test-results/` (`playwright.config.ts:220`) | gitignored scratch |

`test-results/` and `playwright-report/` are both in `.gitignore`. **No remaining unconditional write
outside `test-results/`. The class is closed** — as of this afternoon.

That last clause is the problem, and it is why the defect was found three times. So it is now closed by a
control rather than by a grep: `e2e/qa-p09a4-evidence-write-guard.spec.ts` censuses every write
destination in `e2e/**` and fails on a new one or on one that loses its flag. Its first run failed on two
of my own specs — a `readFileSync(path.join(process.cwd(), "reports", …))` counted as a write — and the
census now excludes reads. A guard whose first act is a false positive is a guard people switch off.

---

## 4 — The new and widened rules, both directions

`scripts/qa-probes/p09a4-widened-rules.mjs` — 31 adversarial strings, **one gate invocation each**, injected
through the gate's own control harness so the file-scoped detectors and both pins are genuinely exercised.
Full table: `evidence/widened-rules.txt`. **29 as expected, 2 mismatches, 0 contaminated runs.**

Correct in both directions: `kazan[çc]` (fires on `%40 kazanç`, `yüzde 40 kazancı`,
`{ label: "Zaman Kazancı", value: "%20" }`, `%15 kazancın`; silent on `Kazançlı bir tasarım kararıdır`,
`Kazan çeliği`, and on **`Kazancı ustalığı … 40 yıldır`** — `kazancı` is also the Turkish for
*boilermaker*, and the rule correctly turns on the number, not the noun). `Mastercam` fires alone and on
the deleted string, and `Master plaka` holds the word boundary.

**Both pins are genuinely parsers, including across a line break.** `P1a` (mangled spacing, one line),
`P1` (mangled spacing with a newline) and `P1b` (**exactly what Prettier writes when the array exceeds the
print width**) are all silent; `P2` reorder, `P3` truncation, `P4` case change and `P6` appended `DWG` all
fire. `P5` — the landing prose in single quotes and re-wrapped — is silent. A8/A9 are closed and the
harder wrap case with them. `S1`/`S2` confirm a valid pin no longer holds an exemption open over a prose
offer elsewhere in the same file (R3-2 / A10 / A11).

### The two mismatches — detector (D) over-catches. Non-blocking, latent.

| id | string | result |
|---|---|---|
| D6 | `"Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz."` | FIRES `[Tüm dosya]` |
| D7 | `"Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz."` | FIRES `[çeşitli format]` |

D6 falsifies the defence written into the rule at `claims-gate.mjs:882`: *"the offer predicate is what
stops it from firing on the ordinary sense of `tüm dosyalarınız`"*. It does not —
`yükleyebilirsiniz` is **in** `CAD_OFFER_PREDICATE`, and it is precisely the verb a privacy or UX sentence
about the visitor's own files uses.

D7 cuts across a distinction the same rule already draws deliberately: detector (C) keeps
`{ label: "Rapor Formatı", value: "PDF + revize CAD" }` silent because it describes *the report we
deliver*. Detector (D) fires on the same idea in prose.

Neither is live — the gate is green on the tree — so this is a rule that will bite the next writer, not a
false claim. A discriminator that would close both without weakening D1–D3: require the vague quantifier
to govern a noun in the **input** sense (`CAD`, `model`, `dosya` as the object of an intake verb) rather
than any `dosya|format|uzantı`, or exclude sentences whose object is possessed by the reader
(`dosyalarınız`) or by us (`raporumuz`).

---

## 5 — The 57-vs-56 wobble: my own spec, and it is worse than a count

**Reproduced.** Three runs of `e2e/qa-p09a2-claims-sweep.spec.ts` at `desktop-1280`: `SLA_ROUTES=57, 57,
56`, `FINDINGS=0` all three. Set-differencing the three `sweep.json` files names one route: `/teklif-al`.

**Twelve isolated cold loads of `/teklif-al` produced no miss**, sealed or unsealed, with
`document.body.innerText` byte-length **identical** at 350 ms and at 3 s on every attempt. So the route is
not marginal and the seal is not the cause. The wobble belongs to the sweep's sequence.

**A faithful replica caught it.** `e2e/qa-p09a4-sla-wobble.spec.ts`, third test: all 63 routes in the
sweep's order with the sweep's waits, twice, re-reading any route that misses. Two routes missed and
recovered — `/endustriyel/prototip-uretim` on pass 1, `/` on pass 2 — and this is what they looked like:

```
route                          innerTextLen@350   innerTextLen@settled   grewBy
/endustriyel/prototip-uretim         88                  5753             5665
/                                    88                  4891             4803
```

**88 characters.** The route component had not mounted. The sweep waits for `main, .shell-root, #root > *`
to be *attached* — which the app shell satisfies before a lazily-imported route chunk arrives — and then
sleeps a fixed 350 ms. Calibration from the settled run: the fastest route settles at 1291 ms and the
slowest (`/malzemeler`) at 4018 ms; **41 of 63 routes settle more than 350 ms after the fastest one.**

**It is a measurement flake, and the flake is not confined to the SLA count.** The sweep would have scanned
those 88 characters, found nothing, and recorded the route as clean. `FINDINGS=0 across 63 routes` has
always meant *`FINDINGS=0` across the routes that happened to have rendered*, and which routes those are
changes run to run. That is a defect in my round-2 spec. `e2e/qa-p09a2-claims-sweep.spec.ts:139`
(`page.waitForTimeout(350)`) should wait for the body text to stop growing, or for a route-specific
sentinel, and should fail rather than pass on a route that never renders. I may not edit it.

**Round 3's finding survives, on a better instrument.** `e2e/qa-p09a4-stabilised-sweep.spec.ts` re-runs the
round-2 rules verbatim over settled pages and fails if any route is still showing the shell:

```
desktop-1280   routes=63  neverSettled=0  SLA_ROUTES=57  FINDINGS=0  EXEMPTED=12
mobile-375     routes=63  neverSettled=0  SLA_ROUTES=57  FINDINGS=0  EXEMPTED=12
```

The six routes without the SLA are the same six, on both viewports: `/kvkk`,
`/gizlilik-politikasi`, `/cerez-politikasi`, `/hizmetler`, `/kabiliyetler`, `/endustriyel`. **57 is the
right number; 56 was the instrument.** `evidence/stabilised-sweep-desktop-1280.json`,
`evidence/sla-sweep-replica-desktop-1280.json`.

---

## 6 — Regression

Built once (`npm run build`, exit 0, 54.5 s), then `PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_PORT=4290`
(checked free before binding), one `--project=` per invocation, foreground, `> file 2>&1`.

| project / spec | result |
|---|---|
| `critical-1280` | 82 passed, 1 skipped |
| `critical-375` | 81 passed, 2 skipped |
| `visual-375` | 35 passed, 6 skipped |
| `visual-768` | 35 passed, 6 skipped |
| `visual-1280` | 41 passed |
| `visual-1440` | 35 passed, 6 skipped |
| `qa-p09a2-claims-sweep` @ `desktop-1280` ×3 | 3 passed |
| `qa-p09a-rfq-form` + `qa-p09a2-contrast` + `qa-p09a3-cad-dom` @ `desktop-1280` | 20 passed |
| `qa-p09a3-cad-dom` @ `mobile-375` | 2 passed |
| `qa-p08-scroll-region-reach` + `-storage-disclosure` + `-waveb-contract` @ `mobile-320` | 24 passed, 37 skipped |
| `shared-shell-accessibility` @ `desktop-1280` | 12 passed, 4 skipped |
| new: `qa-p09a4-sla-wobble` (3) + `-stabilised-sweep` ×2 + `-evidence-write-guard` (2) | 8 passed |

**377 passed, 0 failed, 62 skipped.** No flake this round — round 3's `visual-375` font-cache flake did not
recur across four visual projects.

**No golden moved.** `git status --porcelain -- e2e/__golden__` empty after all four visual projects and
after every other run. `--update-snapshots` was never used. **Specs unedited**: `git diff --name-only
184abf2..HEAD -- e2e/` lists only the three `qa-p09a4-*` files I added.

---

## 7 — D4: the refusal was right; the deferral is not discoverable where it was put

**The refusal was right, and it is now verified rather than argued.** All four D4 sites, through both rules
that could reach them (`evidence/widened-rules.txt`):

| site | string | gate |
|---|---|---|
| D4a | `"Yaygın CAD formatlarını doğrudan işleyebiliyoruz…"` | **FIRES** (detector D) |
| D4b | `"CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam"` | **FIRES** (`Mastercam`) |
| D4c | `"CATIA, SolidWorks, NX entegre çalışma"` | silent on both rules — refused |
| D4d | the DFM `metaDescription` with `CATIA/SolidWorks/NX entegrasyonu` | silent on both rules — refused |

The two gated ones are separable: D4a is an *intake offer* and D4b names a *CAM package*, and neither
predicate touches the CAD-authoring inventory. D4c and D4d are that inventory, and the Coder is right that
`"CATIA, SolidWorks, NX entegre çalışma"` and the live `"3D Modelleme (CATIA/SolidWorks)"` are the same
shape down to the punctuation — no rule separates them. Gating here would have decided 09b's scope from
inside a content correction. **You were right to accept the refusal.**

**But the deferral is not discoverable at the place it points to.** `scripts/claims-gate.mjs:1487` says the
class is *"Those two, plus `:774`, `:779`, `:797` and `:804`"* of `src/data/servicePages.ts`. At the
integration head those four lines contain:

```
774: ["CNC İşleme", "1", "$$$$", "Yok", "Mükemmel"],
779: ],
797: "Torna Fikstürü — Milliyelti ve milliyetsiz",
804: { label: "Tekrarlanabilirlik", value: "±0.01mm" },
```

At `8b5ee92` — before C4 — those same four lines are the four fikstur-aparat software-inventory strings.
All four are now at **`:788`, `:793`, `:811`, `:818`**: **off by exactly 14**, because `90ea958` added a
14-line comment at `servicePages.ts:132`, in the same C4 batch, after the citation was written.
`PROGRESS.md:2337` cites `:3292` / `:3306` for the `/endustriyel/ozel-projeler` pair; they are at `:3318`
and `:3332`, off by 26 — the same 14 plus the 12 lines `f5c27fc` added at `:2028`.

And the enumeration is short by one. *"Those two"* are `:793` and `:3332`; the cited four resolve to
`:788`, `:793`, `:811`, `:818`. The union is **five** distinct sites, not six —
`servicePages.ts:3318` (`"… tasarım (SolidWorks, CATIA, NX), prototip üretimi…"`) is named nowhere.

Finally, `IMPLEMENTATION.md` contains **zero occurrences of "09b"**. The deferral lives in a narrative log
and two code comments, one of which points at the wrong lines and omits a site. Someone opening 09b and
following the citation lands on a comparison-table row and a closing bracket. Evidence:
`evidence/deferral-citations.txt`.

The counterpart at `claims-gate.mjs:2396` cross-references by **rule id** rather than line number and is
robust. That is the pattern the other one should follow — or a grep-able marker such as
`09b-SOFTWARE-INVENTORY` on each of the six lines.

---

## Defects

| # | file:line | severity | blocks? |
|---|---|---|---|
| R4-1 | `.github/workflows/playwright.yml:29` vs `scripts/claims-gate.mjs:813` — `NODE_VERSION: "20"` cannot type-strip, so the gate wired into the blocking `e2e-critical` job fails closed on every CI run | **BLOCKING** | **yes** |
| R4-2 | `scripts/claims-gate.mjs:882` — detector (D) over-catches: `"Tüm dosyalarınızı … yükleyebilirsiniz"` and `"… çeşitli formatlarda gönderebilirsiniz"` both fire; the rule's own stated defence is falsified | low | no |
| R4-3 | `scripts/claims-gate.mjs:1487` — the 09b deferral cites `servicePages.ts:774/:779/:797/:804`, all stale by 14 after `90ea958`; and enumerates five distinct sites while claiming six (`:3318` omitted). `PROGRESS.md:2337` stale by 26 | low | no |
| R4-4 | `e2e/qa-p09a2-claims-sweep.spec.ts:139` — **my own round-2 spec**: a fixed 350 ms wait scans routes that have not rendered (88 characters observed twice); `FINDINGS=0` is over the routes that happened to be ready | medium | no |
| R4-5 | `scripts/claims-gate.mjs:786-793` — the "impossible to control" claim for `checkDerivedCadCopy` / `checkQualityResources` is confirmed true but not impossible; two allowed designs are given in §2 | low | no |
| R4-6 | `scripts/claims-gate.mjs:101` (`EXT`) + Vite's `.mjs`/`.js`-before-`.ts` resolution — a `src/content/claims.js` would be bundled by the app, validated by neither instrument. 0 such files today | low | no |
| R4-7 | `scripts/claims-gate.mjs:813` — a future `enum`/`namespace` in `claims.ts` throws `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` and produces a CAD-drift failure message over a correct file | low | no |

Also recorded, not a defect: the packet's `8b5ee92..184abf2` names a commit that is not on the branch (§0).

## Unverifiable

**U1–U12 carried.** U1–U7 were not attempted: every one requires a production write, and the four
`public.rfqs` rows and three `cad-uploads` objects were not touched. U13 (round 3) is now **resolved** —
the orchestrator ruled the software-inventory class into 09b, and this round verified the ruling was
carried out (§7).

**U14 (new)** — whether CI actually goes red under Node 20. Proved by mechanism and by running the gate
with type stripping disabled on Node 26; not proved by running Node 20, which is not installed here.

## Scope integrity

- Production files modified by QA: **NONE**
- Written, all inside the allowlist: `e2e/qa-p09a4-{sla-wobble,stabilised-sweep,evidence-write-guard}.spec.ts`,
  `scripts/qa-probes/p09a4-{gate-mutator,gate-mutator-hooks,widened-rules}.mjs`,
  `reports/qa/phase-09a-r4/**`
- `.env` not committed. No `--update-snapshots`. Nothing submitted, invoked, uploaded or inserted.
