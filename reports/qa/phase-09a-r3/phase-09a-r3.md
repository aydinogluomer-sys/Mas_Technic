# QA Report — Phase 09a, Round 3

- PHASE: 09a-QA-R3
- CODE_COMMITS: `9d94b72`, `83b4e90`, `b3ae3c7`, `15e19ef`, `38d4f73` (range `8e5472b..38d4f73`); integration head `38d4f73`
- QA_COMMIT: see `wt/qa-p09a3` HEAD
- STATUS: **PASS** (with 6 non-blocking defects, all in instruments and comments, none in published copy)
- TESTS_PASSED: 367
- TESTS_FAILED: 1 (`visual-375` font-cache flake, green on isolated re-run; not a baseline mismatch)
- TESTS_SKIPPED: 62 (all pre-existing viewport/project gating)
- NEW_TESTS_ADDED: 2 (`e2e/qa-p09a3-cad-dom.spec.ts`)

Round 2's findings were not re-verified, per the packet.

---

## 1 — The type pin: 12 attacks, 4 got through

`src/content/claims.ts:74` (`PUBLISHED_CAD_EXTENSIONS`), `:88`
(`CadFormatsArePinnedToValidator`), and `scripts/claims-gate.mjs:803` (`CAD_PINNED_FILES`).

Harness: `scripts/qa-probes/p09a3-pin-attacks.mjs`. Each attack mutates one production file,
runs `npx tsc --noEmit -p tsconfig.app.json` **and** `node scripts/claims-gate.mjs`, restores the
file byte-for-byte, and asserts `git diff --quiet` before the next. Raw:
`reports/qa/phase-09a-r3/pin-attacks.json`.

| # | Attack | tsc | gate | Verdict |
|---|---|---|---|---|
| A0 | append `"dwg"` (orchestrator's control) | TS2344 @ `:88` | FAIL @ `:74` | caught by both |
| A1 | **reorder** `["stp","step",…]` — same set, same length | TS2344 | FAIL | caught by both |
| A2 | **shorten** — drop `"3mf"` | TS2344 | FAIL | caught by both |
| A3 | **case** — `"STEP"` | TS2344 | FAIL | caught by both |
| A4 | **drop `as const`** | TS2344 | PASS | caught by tsc only |
| A5 | annotate `: readonly string[]` | TS2344 | PASS | caught by tsc only |
| A6 | tuple intact; **derivation appends `"DWG"`** | 0 | PASS | **HOLE** |
| A7 | tuple intact; **derivation `slice(0,5)`** | 0 | PASS | **HOLE** |
| A8 | whitespace-only reformat of the tuple | 0 | **FAIL** | false positive |
| A9 | single quotes | 0 | **FAIL** | false positive |
| A10 | prose OFFER of SolidWorks added to `claims.ts` | 0 | PASS | **HOLE** |
| A11 | prose OFFER of SolidWorks added to `technicalLandingData.ts` | 0 | PASS | **HOLE** |

**The four your packet asked for are all caught, by both instruments** — reorder, shorten, case,
and the `as const` removal (tsc alone, correctly: degrading the type is a type problem). The pin
does what it claims for the tuple.

**What it does not cover.** The pin binds `PUBLISHED_CAD_EXTENSIONS` ↔ `CAD_ACCEPTED_EXTENSIONS`.
It does **not** bind the tuple to the two strings the copy actually uses:

```ts
export const CAD_UPLOAD_FORMATS   = joinTurkishList(PUBLISHED_CAD_EXTENSIONS.map((e) => e.toUpperCase()));
export const CAD_UPLOAD_EXTENSIONS = PUBLISHED_CAD_EXTENSIONS.map((e) => `.${e}`).join(", ");
```

Editing either expression (A6, A7) changes every one of the five publication sites while the tuple,
and therefore both instruments, stay green. A6 puts `… IGS, 3MF ve DWG` on five pages against a
validator that refuses DWG. This is the disagreement route the packet asked for and it is inside
`claims.ts` itself, not a remote file.

Separately, `cadFormatScan` (`scripts/claims-gate.mjs:837`) **replaces detectors (A) and (B) for
pinned files**. So in `claims.ts` and `src/data/technicalLandingData.ts` — the second of which is a
rendered content file — a bare prose offer of a rejected format is invisible to the gate (A10, A11).

A8/A9 fail closed: a Prettier reformat or a quote-style change of the tuple turns the gate red with
no drift at all, because the pin is a byte-exact `["step", "stp", …]` substring match. Safe, but it
will produce a puzzling FAIL for whoever runs a formatter.

**Corroboration of the design.** C3's justification for abandoning the runtime import is not merely
plausible, it is measured (`scripts/qa-probes/p09a3-runtime-import-claim.mjs`):

```
head of branch          : npx playwright test --project=critical-1280 --list -> exit 0, Total: 83 tests
with the runtime edge   : -> exit 1, Total: 0 tests in 0 files
                          TypeError: Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')
                          at src/integrations/supabase/env.ts:22
```

Your instruction was wrong and C3 was right to refuse it. The type pin is load-bearing.

---

## 2 — CAD: five sites, an assembled pool of 140, and six phrasings

**The fix reaches nine sites, not five.** Beyond the five you named (`servicePages.ts:210`, `:152`,
`:2058`, `:2100`, `SSS.tsx:135`), commit `b3ae3c7` corrected four more on the DFM page, found by the
Coder in the rendered DOM after its own fix created a contradiction: `:1929` "Yaygın CAD
formatlarını doğrudan işleyebiliyoruz", `:1936` "CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX,
Mastercam", `:1958` "CATIA, SolidWorks, NX entegre çalışma", `:1922` metaDescription. All four are
gone from source and from `dist/`.

**Assembled pool** (`scripts/qa-probes/p09a3-chat-pool.mjs`, bundled with `import.meta.env` defined
to a loopback URL and a junk key, and `@/integrations/supabase/client` aliased to a throwing stub):

```
pool size              : 140   (24 static + 116 from servicePages.faq)
CAD_ACCEPTED_EXTENSIONS: step, stp, stl, obj, iges, igs, 3mf
CAD_UPLOAD_FORMATS     : STEP, STP, STL, OBJ, IGES, IGS ve 3MF
CAD_UPLOAD_EXTENSIONS  : .step, .stp, .stl, .obj, .iges, .igs, .3mf
OFFERS of a refused format : 0
refusal/other mentions     : 10  (8 in entry #26's refusal sentence; 2 are "satır satır", a
                                  false hit of the `sat`/ACIS token in my own scanner)
validator                  : .step .stp .stl .obj .iges .igs .3mf ACCEPTED;
                             .sldprt .catpart .prt .dwg .pdf .x_t REFUSED
```

**All six phrasings re-probed** — `catia`, `catia dosyası`, `catpart`, `solidworks`, `sldprt`,
`solidworks dosyası`. Every one matches entry **#26** at score **1.0**, with the honest answer:

> Teklif akışındaki yükleyici şu uzantıları doğrular: .step, .stp, .stl, .obj, .iges, .igs, .3mf —
> listede olmayan bir uzantı yükleme adımından geçmez. Yerel CAD kayıtlarınızı (SolidWorks .sldprt,
> CATIA .catpart, NX .prt) veya PDF/DWG teknik resminizi sales@mastechnic.com adresine iletirseniz
> teklif için değerlendiririz.

None falls through; none reaches a false answer; the email route is present in all six. Deliberately
naming the three refused formats is what keeps the matcher's keyword extraction reaching this entry.

**Rendered DOM** (`scripts/qa-probes/p09a3-dom-dump.mjs`, `p09a3-dom-offers.mjs`, and the new spec
at `desktop-1280` and `mobile-375`): six routes read from `document.body.innerText` with every
`<details>` forced open — **0 offers of a refused format**; 7 non-offer mentions, all of them either
the refusal sentence or `Rapor Formatı: PDF + revize CAD`, which is the report we deliver.
`/sss` and both service pages paint the derived lists.

*(Note for whoever writes the next DOM check: the FAQ is native `<details>`. A first pass that
clicked every `<summary>` toggled them shut again and read a `/sss` with no answers in it. Open by
attribute, not by click.)*

---

## 3 — F4: the refusal was right, and I can put a number on it

**The Coder was right and the margin is not close.** I ran `isPublishableSpec` over every
`comparisonTables` header in the tree exactly as your instruction would have to be implemented
(`scripts/qa-probes/p09a3-widened-and-f4.mjs`):

```
tables                       : 54
headers                      : 279
headers the ALLOWLIST DROPS  : 265   (95.0%)
tables that would lose >=1 column : 53 of 54
header/row-width mismatches IN THE TREE AS IT STANDS : 0
```

`isPublishableSpec` requires the **value** to match one of `PUBLISHABLE_SPEC_CLASSES`; a header is a
single word, so all of `Kavite`, `Özellik`, `Yöntem`, `Strateji`, `Malzeme`, `Sektör`, `İşlem`,
`Alaşım`, `Kalite Sınıfı` fail it. And `ShellSpecTable` (`src/components/shell/ShellComposition.tsx:243`)
renders `headers` and `rows` independently with no zip and no width check — so a filtered header row
would paint fewer `<th scope="col">` than the body rows have cells, on 53 tables. That is a
correctness and accessibility regression, silently. Your instruction would have shipped it.

**The counter-fix is sound.** Restoring the pre-C3 table
(`scripts/qa-probes/p09a3-restore-carried.mjs`):

```
F4-parca-saat-column                       exit=1  fired by periodic-volume-disclosure
      src/data/servicePages.ts:611: [Parça/Saat] headers: ["Kavite", "Çevrim/Saat", "Parça/Saat", …]
F4-control-cevrim-saat-alone-stays-silent  exit=0  ok (correctly silent)
```

`Parça/Saat` fires; `Çevrim/Saat` — and `Çevrim/Vardiya`, which I added as a harder control — stays
silent, because `çevrim` is not one of the rule's count nouns, exactly as the corrected comment now
says. **Nothing else in the tree newly fires**: the only new shape is
`(adet|ünite|parça|birim|palet|parti|sipariş)\w*\s*/\s*saat`, and a grep over the scanned roots
returns one hit, inside a comment (comments are blanked before scanning). Rows were trimmed with the
header — 5 headers, 5 cells, and 0 header/row mismatches across all 54 tables in the DOM at both
1280 and 375.

---

## 4 — Gate, both directions, and a false-negative in the widened rule

**Forward, my own run:** `node scripts/claims-gate.mjs` → `PASS — 0 unverified claims across 31
rules, 244 controls green` (225 files, 28 415 non-comment lines). Re-run at the end of the round:
identical.

**Backward:** every carried claim restored one at a time, gate re-run, file restored, tree asserted
clean (`reports/qa/phase-09a-r3/restore-carried.txt`). 13 of 13 fire, each by the intended rule:

| Restored | Fires as | at |
|---|---|---|
| D1 nine-format FAQ | `cad-format-list-not-derived` | `servicePages.ts:210` |
| D1b body prose, same page | `cad-format-list-not-derived` | `:152` |
| D1c `"STEP, IGES, CATIA, NX, SW"` | `cad-format-list-not-derived` | `:2058` |
| D2 hand-written correct list | `cad-format-list-not-derived` | `:2100` |
| D2b `/sss` register | `cad-format-list-not-derived` | `SSS.tsx:135` |
| D3 free DFM | `free-of-charge-commitment` | `:2093` |
| D3b free DFM metaDescription | `free-of-charge-commitment` | `:140` |
| F1 `%40 daha hızlı` | `delivery-or-quality-rate` | `:184` |
| F1b `%50 setup tasarrufu` | `delivery-or-quality-rate` | `:288` |
| F2a `%70'e kadar` | `delivery-or-quality-rate` | `:2022` |
| F2b `Ortalama %30-50` | `delivery-or-quality-rate` | `:2065` |
| F3 EOS M290 feature | `machine-inventory` | `:2243` |
| F3b EOS M290 FAQ | `machine-inventory` | `:2274` |
| F4 `Parça/Saat` | `periodic-volume-disclosure` | `:611` |

**False positives on the widened rule: none.** The two new alternations were lifted verbatim from
`claims-gate.mjs` (the lift is asserted, so a drifted copy aborts) and run over a battery of
legitimate shapes and over the whole scanned tree:

```
+%80-100 in the Ra guide, and as a label/value pair : silent
{ label: "Ek Maliyet", value: "+%80-100 daha yüksek" } : silent
IACS %101 / %99.9 / { label: "IACS İletkenlik", value: "%99+" } : silent
{ label: "Okuma Oranı", value: "%99.9+" } : silent
coating physics, alloy composition, relative humidity : silent
live hits of the two NEW alternations across the scanned tree : 0
```

The Coder's two claims about surcharges and material percentages hold.

**But the widened rule has a false NEGATIVE, and it is Turkish.** Run against the *full* gate, not
just the alternations (`scripts/qa-probes/p09a3-widened-holes.mjs`):

```
baseline-F2b-verbatim         { label: "Maliyet Tasarrufu", value: "Ortalama %30-50" }  FIRES
unsoftened-kazanc-control     { label: "Zaman Kazanç",     value: "%25" }               FIRES
tasarrufu-possessive-control  { label: "Maliyet Tasarrufu", value: "%25" }              FIRES
softened-zaman-kazanci        { label: "Zaman Kazancı",    value: "%25" }               *** MISS ***
softened-maliyet-kazanci      { label: "Maliyet Kazancı",  value: "%30-50" }            *** MISS ***
softened-verim-kazanci        { label: "Verim Kazancı",    value: "Ortalama %40" }      *** MISS ***
prose-softened-kazanc         "%35 zaman kazancı elde edilir"                           *** MISS ***
prose-softened-kazanc-no-other-noun  "Ortalama %35 kazancı ölçüldü"                     *** MISS ***
```

Both new alternations spell `kazanç`, and Turkish consonant softening turns the possessive into
`kazancı`. `tasarruf` → `tasarrufu` is unaffected, which is why the class looked covered.
`Maliyet Kazancı: %30-50` is the F2b shape, in the most natural Turkish, and no instrument sees it.
This file already knows the idiom — `alaş[ıi]m`, `çal[ıi]şan`, `sto[kğ]`, `çeşi[td]` — the fix is
`kazan[çc]` in both constants. Nothing in the tree currently uses the softened form with a
percentage, so this is a coverage gap, not a live claim.

---

## 5 — Carried claims, rendered

All gone from `document.body.innerText` at both `desktop-1280` and `mobile-375`, and from every
file under `dist/` (`scripts/qa-probes/p09a3-dist-grep.mjs`, 102 built files):

D3 `:1965`/`:81`, F1 `:117`/`:208`, F2a `:1922`, F2b `:1945`, F3 `:2103` **and** `:2131`, F4
`:517`'s column, plus D1/D1b/D1c/D2/D2b and the four D4 sites. 15 strings, 0 occurrences.
Controls that must be present are present: the derived prose list, the refusal sentence,
`Çevrim/Saat`, and the validator's own list in `cadUpload` and `claims`.

**But two of them were never rendered in the first place, and the source says otherwise.**
`ServiceDetail.tsx:193` passes `page.description` — **not** `page.metaDescription` — to
`usePageMeta`, and `:284` passes `page.description` to `JsonLdSchema`. No component in `src/**`
reads `metaDescription` on a service page. Measured in the DOM:
`/hizmetler/cnc-frezeleme` renders `<meta name="description">` = *"5 eksenli CNC frezeleme
merkezlerimiz ile…"*, which is `description`. So `claims-gate.mjs:1249-1251` ("so into search
results and social cards, not merely onto the page") and `servicePages.ts:2019-2021` ("arama
sonucunda ve sosyal kartta da yayımlanıyordu") are **false as written** — those two strings were
published into the JS chunk and nowhere else. The removals remain correct; the justification
committed alongside them is not. This repository corrected a comment that "named the right table and
defended the wrong column" this very round; the same standard applies here.

The new spec pins the render path, so the day `metaDescription` is wired up, F2a and D3b get the DOM
check they do not currently have.

---

## 6 — Goldens

`e2e/__golden__` holds 116 baselines. `fe3a525..38d4f73` changes exactly **6**. No
`--update-snapshots` was run at any point in this round, and `git status e2e/__golden__` is clean
after every one of the four visual projects.

Measured, not accepted (`p09a3-golden-diff.mjs`, `p09a3-golden-profile.mjs` — a from-scratch PNG
decoder; the baselines are 8-bit colour-type 2):

| baseline | before → after | ΔH | rows differing | longest untouched run | best row alignment |
|---|---|---|---|---|---|
| `visual-1280/inner-next-service-detail` | 1278×334 → 333 | −1 | 111/333 (33%) | 80 | shift 0 |
| `visual-1280/shell-footer-service` | 1278×298 → 298 | 0 | 280/298 (94%) | 3 | **shift −1** |
| `visual-375/inner-next-service-detail` | 375×550 → 549 | −1 | 418/549 (76%) | 5 | **shift +1** |
| `visual-375/shell-footer-service` | 375×741 → 742 | +1 | 45/741 (6%) | 669 | shift 0 |
| `visual-768/inner-next-service-detail` | 766×411 → 411 | 0 | 56/411 (14%) | 296 | shift 0 |
| `visual-768/shell-footer-service` | 766×769 → 768 | −1 | 37/768 (5%) | 549 | shift 0 |

**The cause holds; the account is a simplification.** Two of the six did not change height at all,
and one grew by a row — so "the crop rounds to 333 device rows instead of 334" describes at most two
of them. Every one is nevertheless explained by a whole-band vertical displacement of 0 or ±1 row
plus sub-pixel re-rasterisation: the two with the largest touched-row counts are precisely the two
whose best whole-row alignment is a ±1 shift rather than 0, and the other four leave 296–669
consecutive rows bit-identical. There is no large localised block of new content anywhere in the
six. That is the signature of a page-length change above the band, not of a content edit inside it.

**The byte-identical-rewrite claim is not falsifiable from the repository, and I want to say that
plainly rather than pretend to have checked it.** A rewrite that produces identical bytes and a file
that was never rewritten are indistinguishable in git. What *is* checkable, and passes: the six
committed baselines match the current build (four visual projects green), the other 110 are
untouched, and the old bytes demonstrably do **not** match the current build — so the update was
necessary, not gratuitous. Blanket-updating the whole suite would have rewritten 116 files; 6 moved.

`visual-375` failed once on `notfound carries the same shell chrome` with
`installFontRetry() intercepted 0 requests on fonts.gstatic.com` — the font-cache flake the Coder
already recorded, not a baseline mismatch. Re-run of that spec in isolation: 6/6 green.

---

## 7 — Evidence integrity: confirmed, and it is my defect

`e2e/qa-p09a2-claims-sweep.spec.ts:150-157` calls `mkdirSync` + `writeFileSync` on
`reports/qa/phase-09a-r2/sweep.json` **unconditionally, on every run**, and line 28 reads
`routes.json` out of the same directory — so a prior round's committed evidence directory is both
input and output. I reproduced it: the file went `M` immediately after the run. This time the
content was identical and only the line endings differed (md5 `94ef8618…` → `c5a4ec58…`), which is
exactly why it is dangerous — had C3 changed the sweep result, round 2's record would have been
silently replaced with round 3's numbers under a round-2 filename, with no signal.

Restored with `git checkout` and verified: all 15 files in `reports/qa/phase-09a-r2/` match their
pre-run md5 (`r2-evidence-index-before.txt`). Round 2's record is intact.

This is a defect in **my round-2 spec**, not in C3. It is on the DO_NOT_TOUCH list this round, so it
is reported, not fixed. `e2e/qa-p09a3-cad-dom.spec.ts` writes only into `phase-09a-r3/`.

Related, and worth a line: `e2e/landing/claims-gate.spec.ts:53` writes
`src/content/__claims-gate-probe__.ts` into **production source** and removes it in a `finally`. A
process kill mid-test leaves a file in `src/`. This phase has lost two agents to process kills.

---

## Failed checks

| Check | Observation | Root cause | Production fix required? |
|---|---|---|---|
| `visual-375` `notfound carries the same shell chrome` | `installFontRetry() intercepted 0 requests on fonts.gstatic.com` | fonts served from cache, guard saw no request; known, pre-existing | No — green on isolated re-run |

## Defects (none blocking)

| # | File:line | Severity | Finding | Blocks? |
|---|---|---|---|---|
| R3-1 | `src/content/claims.ts:96,99` | MEDIUM | The pin binds the tuple to the validator but not the tuple to the published strings. Editing `CAD_UPLOAD_FORMATS`/`CAD_UPLOAD_EXTENSIONS` changes all five sites with both instruments green (A6, A7). | No |
| R3-2 | `scripts/claims-gate.mjs:837-848` | MEDIUM | For pinned files (`claims.ts`, `technicalLandingData.ts`) detectors (A) and (B) are replaced, not supplemented. A bare prose offer of a rejected format in either file is invisible (A10, A11). `technicalLandingData.ts` is rendered content. | No |
| R3-3 | `scripts/claims-gate.mjs:905-909` | MEDIUM | Turkish consonant softening: `kazanç` → `kazancı` evades the widened `delivery-or-quality-rate` entirely, prose and label/value. Fix is `kazan[çc]`, an idiom this file already uses four times. | No |
| R3-4 | `scripts/claims-gate.mjs:1249-1251`, `src/data/servicePages.ts:2019-2021`, `:136-138` | LOW-MED | Comments state that the `metaDescription` claims shipped to search results and social cards. `ServiceDetail.tsx:193` passes `page.description`; `metaDescription` is dead data on every service route. Wrong reason committed as production justification. | No |
| R3-5 | `e2e/qa-p09a2-claims-sweep.spec.ts:150-157` | MEDIUM | A QA spec overwrites a prior round's committed evidence directory on every run. Mine, from round 2. | No |
| R3-6 | `scripts/claims-gate.mjs:803` | LOW | The pin is a byte-exact substring match, so a formatter run or a quote-style change turns the gate red with no drift (A8, A9). Fails closed, but confusingly. | No |

## Residual findings (reported, not in this packet's scope)

- `src/data/servicePages.ts:3306` — `{ label: "CAD", value: "SolidWorks, CATIA, NX" }` on
  `/endustriyel/ozel-projeler`, beside `:3292` "tasarım (SolidWorks, CATIA, NX)". Same class as the
  `{ label: "Desteklenen CAD" }` row C3 removed, though the label carries no offer word so the gate's
  detector (C) correctly stays silent. The Coder reported `/hizmetler/fikstur-aparat` (`:774`,
  `:779`, `:797`, `:804`) and did not report these two.
- `scripts/claims-gate.mjs:1221` still lists
  `'"CAD/CAM Entegrasyonu — CATIA, SolidWorks, Mastercam"'` as a **silent** control with the reason
  "the CAD software our engineers model IN — a capability, not an intake list", while `b3ae3c7`
  deleted that exact line from the tree as a software inventory. The gate and the content now take
  opposite positions on one string. Synthetic control, so it costs nothing today; it is the H6 shape.
- `scripts/claims-gate.mjs:751` — `REJECTED_CAD_VOCAB` includes `sat`, and the ASCII-only right
  boundary lets it match inside `satır`, `satış`. Silent today; would fire if an offer verb ever
  shared a sentence with those words.
- Four sites `b3ae3c7` fixed are **ungated**: restoring `"Yaygın CAD formatlarını doğrudan
  işleyebiliyoruz"`, `"CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam"`, `"CATIA,
  SolidWorks, NX entegre çalışma"` or the metaDescription leaves the gate green. A removal no rule
  protects is one commit from returning.
- `e2e/landing/claims-gate.spec.ts:53` writes into `src/content/` and cleans up in `finally`.

## Regression

| Project / spec | Result |
|---|---|
| `critical-1280` | 82 passed, 1 skipped |
| `critical-375` | 81 passed, 2 skipped |
| `visual-1280` | 41 passed |
| `visual-375` | 34 passed, 1 failed (font flake), 6 skipped; 6/6 on isolated re-run |
| `visual-768` | 35 passed, 6 skipped |
| `visual-1440` | 35 passed, 6 skipped |
| `desktop-1280` — `qa-p09a-rfq-form`, `qa-p09a2-contrast`, `shared-shell-accessibility` | 30 passed, 4 skipped |
| `desktop-1280` — `qa-p09a2-claims-sweep` | 1 passed |
| `mobile-320` — `qa-p08-scroll-region-reach` | 9 passed |
| `mobile-320` — `qa-p08-storage-disclosure`, `qa-p08-waveb-contract` | 15 passed, 37 skipped |
| `desktop-1280` / `mobile-375` — `qa-p09a3-cad-dom` (new) | 2 + 2 passed |
| `npm run typecheck` (three configs) | exit 0 |
| `npm run build` | exit 0 |
| `node scripts/claims-gate.mjs` | PASS, 31 rules, 244 controls, 0 failed |

No pre-existing spec was edited: `git status` for `e2e/*.spec.ts`, `e2e/**/*.spec.ts` and
`e2e/__golden__` is clean at the end of the round. All skips are pre-existing viewport/project
gating, none added.

## Commands run

```text
node scripts/claims-gate.mjs                                   (x18, forward and backward)
npx tsc --noEmit -p tsconfig.app.json                          (x13, one per pin attack + baseline)
npm run typecheck
npm run build
node scripts/qa-probes/p09a3-pin-attacks.mjs A0 A1 A2 A3 A4 A5
node scripts/qa-probes/p09a3-pin-attacks.mjs A6 A7 A8 A9
node scripts/qa-probes/p09a3-chat-pool.mjs
node scripts/qa-probes/p09a3-restore-carried.mjs
node scripts/qa-probes/p09a3-widened-and-f4.mjs
node scripts/qa-probes/p09a3-widened-holes.mjs
node scripts/qa-probes/p09a3-dom-dump.mjs
node scripts/qa-probes/p09a3-dom-offers.mjs
node scripts/qa-probes/p09a3-dist-grep.mjs
node scripts/qa-probes/p09a3-golden-diff.mjs
node scripts/qa-probes/p09a3-golden-profile.mjs
node scripts/qa-probes/p09a3-runtime-import-claim.mjs
npx vite preview --port 4175 --strictPort            (port checked free before binding)
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4175 npx playwright test --project=<one per invocation>
```

No `--update-snapshots`, at any point. No `run_in_background` for a heavy process.

## Production-write prohibition

Nothing was submitted, invoked, uploaded or inserted. `U1`–`U7` were not attempted.
Every browser probe seals the network and proves the seal with a live canary to `example.com`
before touching a control (`e2e/fixtures/qa-p09a2-seal.ts`, reused read-only). The Node probes
bundle `import.meta.env.VITE_SUPABASE_URL` to `http://127.0.0.1:1/qa-probe-never-reachable` with a
junk key and alias `@/integrations/supabase/client` to a Proxy that throws on any property access,
so no client is constructed and no socket can open. `assertNoSupabaseContact` green on every run.
`supabase/**` untouched and never contacted.

## Scope integrity — PASS

- Production files modified by QA: **NONE**. Every falsification probe mutates one file, runs, then
  restores it byte-for-byte and asserts `git diff --quiet` before continuing; the harness aborts on a
  dirty tree. Final `git status` for `src/`, `e2e/__golden__`, `scripts/claims-gate.mjs`,
  `index.html`, `public/`, `package.json`, `tsconfig.json`, `PROGRESS.md`, `IMPLEMENTATION.md`,
  `USER_INPUTS.md`, `.work/` and `reports/qa/phase-09a-r2/` is clean.
- QA commits touch 62 paths, all inside `WRITE_ALLOWLIST`: `e2e/qa-p09a3-cad-dom.spec.ts`,
  `scripts/qa-probes/p09a3-*`, `reports/qa/phase-09a-r3/*`. This report sits at
  `reports/qa/phase-09a-r3/phase-09a-r3.md` rather than the customary
  `reports/qa/phase-09a-r3.md`, because the latter is one directory outside the allowlist and I am
  not willing to claim SCOPE_INTEGRITY: PASS while standing on an exception to it.
- `.env` not committed.
- Scope of the correction itself: `git diff --name-only fe3a525..38d4f73` is **13** paths, not the
  11 your packet states — the two extra are `PROGRESS.md` and `.work/packets/phase-09a-C3.md`, both
  from your own commit `634817a`, which is inside the range. `8e5472b..38d4f73` is the 11 you meant.

## Unverifiable

- `U1`–`U11` from round 2, carried. `U1`–`U7` not attempted by instruction — each needs a production
  write.
- **U12 (new)** — whether `inner-hero-service-detail.png` and `shell-header-service.png` were
  *rewritten* byte-identically or simply never rewritten. Indistinguishable in git. What is verified
  instead: the committed bytes match the current build, and only 6 of 116 baselines differ from base.
- **U13 (new)** — whether the four ungated D4 sites and the `/endustriyel/ozel-projeler` CAD row are
  intended to be in scope. That is a policy call, not a measurement.
