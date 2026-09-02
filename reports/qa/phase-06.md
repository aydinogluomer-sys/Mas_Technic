# QA Report — Phase 06 (CONTENT TRUTH, EVIDENCE MODEL AND CASE-STUDY DATA)

- PHASE: 06
- CODE_COMMIT: `d23a7c6` (integration HEAD; +7 preceding: `895e1ff` `40e2f6a` `abaeb3a` `6b16282` `054210d` `2074118` `222cda4` `a9763a4`)
- BASE FOR DIFF: `75629f3`
- QA_COMMIT: three commits on `wt/qa-p06`, report + tools only
- STATUS: **FAIL**
- TESTS_PASSED: 202 (critical 163, visual 27, smoke 12)
- TESTS_FAILED: 0
- TESTS_SKIPPED: 3 (pre-existing width-conditional `shell-cascade-contract` cases)
- NEW_TESTS_ADDED: 0 (2 QA-owned analysis tools added under `reports/qa/tools/`)

- FABRICATION_REMAINING: **NOT NONE** — 5 classes, ~30 live occurrences:
  the 24-hour quote SLA on `/teklif-al` (F1); a "proven by real case studies"
  savings claim (F4); five `%100` / "her parça" universal-inspection claims
  (F5); ~16 unauthorised guarantee claims (F6); seven sector-standard
  certification claims outside §C (F7). All pre-existing, none introduced by
  this phase, all shipped in `dist/`.
- INVENTED_ANYTHING: **NO**
- TYPE_GUARANTEE: **PROVEN**
- GATE_DEFEATABLE: **YES**

> **Note on the suite verdicts.** Every automated check this phase owns passes
> — 202/0/3, claims gate `PASS — 0 across 22 rules`, build and typecheck clean.
> The findings below were all reached by reading the shipped bundle rather than
> by running a test. That gap *is* the second finding: the gate reports zero
> over a tree that still carries roughly thirty unauthorised claims.

---

## Headline

Phase 06 did the hard part correctly. Every fabricated certification, every
forged evidence artefact, every scale disclosure and every invented metric
named in the packet is gone from `src/` **and** from `dist/`. Nothing was
invented. The type guarantee compiles as advertised. The golden regeneration
is honest and is backed by an independent pixel audit.

It fails on the thing this phase exists to prevent: **fabricated public claims
survive.** The packet's enumerated list is clean; the tree is not. Reading the
built bundle rather than grepping for known strings turned up roughly thirty
live unauthorised claims across five classes (F1, F4, F5, F6, F7 below). The
sharpest single one:

`src/pages/TeklifAl.tsx:1098-1099` — a file this phase edited — still renders:

> "Teklif talebiniz gönderildikten sonra mühendislerimiz dosyanızı inceleyecek
> ve **24 saat içinde** size detaylı fiyat ve süre bilgisi ile dönüş
> yapacaktır."

`USER_INPUTS.md` §D `QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days` and §J
`QUOTE_SLA: 1-3 Days`. The phase corrected `48 saat → 1-3 iş günü` everywhere
else — `SSS.tsx:29` now says "1-3 iş günü" — so the site now promises two
different SLAs on two pages, and the tighter of the two is on the page where
the buyer actually commits. It ships: `dist/assets/TeklifAl-BVhk9dJ_.js`.

The claims gate did not catch it. Rule `quote-sla-overpromise` is
`/\b48\s?saat|\b24\s?saat(te)?\s+(teklif|dönüş)|\b48\s?h\b/i` — it was written
to catch exactly this shape but requires `teklif`/`dönüş` to follow `24 saat`
immediately; here the intervening words are `içinde size detaylı fiyat ve süre
bilgisi ile`.

---

## Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| R1 | The claim classes **the packet enumerates** removed from `src/` and `dist/` | **PASS** | below |
| R1+ | No fabricated claim of any kind remains (exhaustive bundle sweep) | **FAIL** | F4–F7: ~30 live claims the packet's string list does not name |
| R2 | Corrections are correct, not merely different | **FAIL** | 24-hour SLA survives; CAD list only partly reconciled |
| R3 | `%98 on-time` removal rather than correction to 95 % | **PASS (sound)** | adjudication below |
| R4 | Nothing invented | **PASS** | OHSAS 18001 / TEKNOPAR / 4 PDFs all authorised; PDFs byte-identical to `Politikalar/` |
| R5 | Type-level enforcement actually fails to compile | **PASS (proven)** | `tsc` TS2345 + TS2322 |
| R6 | Gate has teeth / is wired / self-checks | **PARTIAL** | red reproduced at 562; wiring real; but gate is defeatable, incl. by a live defect |
| R7 | 21 goldens regenerated for content reasons only | **PASS** | independent pixel audit, control group byte-identical |
| R8 | 16 deletions were dead before the phase | **PASS** | zero live importers at `75629f3` |
| R9 | Positioning neither apologetic nor inflated | **PASS** | see below |
| R10 | Suites and Phase 01–05 guarantees | **PASS** | 202/0/3; grid 0 off-grid; B28 `hiddenText=0`; motion guard PASS |

---

## R1 — the removals are real and complete

### `src/` (live, non-comment lines)

`node scripts/claims-gate.mjs`

```text
# scanned:  172 files, 23488 non-comment lines
PASS — 0 unverified claims across 22 rules.
```

Independent raw grep over `src/` + `index.html` for every class the packet
names returned 31 hits. Classified by hand:

| Hits | Location | Verdict |
|---|---|---|
| 7 | `src/components/admin/**` (`OEE`, `84.2%`, `quality:98`) | Admin panel. `USER_INPUTS.md` §N `NEVER_REDESIGN_ADMIN: YES`; not a public surface. Ships only in `dist/assets/AdminDashboard-*.js`. **Accepted, recorded below as an advisory.** |
| 20 | block/line comments in `FinalSections.tsx`, `caseStudies.ts`, `claims.ts`, `servicePages.ts`, `toleranceMaterials.ts` | Explanatory records of what was removed and why. Compiled away — verified absent from `dist/`. Correct: the removal stays discussable without being rendered. |
| 4 | `materialsData.ts` (`950+ MPa`), `servicePages.ts` (`150+/750+ saat`, `100K+ çevrim`, `İndirim (50+)`) | Not company-scale. Metallurgical / coating-standard / tooling-life values. See advisory A3. |

### `dist/` — the check the Coder's own bug made necessary

The Coder self-reported that an explanatory comment it added to `index.html`
shipped the word `AS9100D` into `dist/index.html` (Vite copies HTML comments
verbatim), and fixed both the comment and the gate blind spot that allowed it.
**Confirmed fixed.** I read `dist/index.html` in full after a clean
`npm run build` (exit 0):

- no `AS9100D`, no certificate name other than `ISO 9001`;
- `<meta name="geo.placename" content="İzmir">` — §A `PUBLIC_CITY: İzmir` ✓;
- description / `og:` / `twitter:` all carry `±0.01mm` ✓;
- no `twitter:site` handle ✓ (§L).

Full-`dist/` scan for 32 forbidden strings — all zero except five, all
verified benign:

| String | Files | Verdict |
|---|---|---|
| `DNV`, `%98` | 4 `.webp` frames | byte sequences inside compressed image data, not text |
| `OEE` | `dist/assets/AdminDashboard-*.js` | admin only, see above |
| `50+ ` | `materialsData`, `servicePages` chunks | `950+ MPa`, `150+ saat`, `750+ saat` |
| `100K+` | `servicePages` chunk | `Kalıp Ömrü: 100K+ çevrim` (die life) |

Zero occurrences in `dist/` of: `AS9100`, `IATF`, `13485`, `NADCAP`,
`800-171`, `TÜV`, `Bureau Veritas`, `%100 CMM`, `15.000 m`, `PPAP`, `Cpk`,
`50K+`, `ZTM`, `MT-20`, `RAPORU DOĞRULA`, `QUALITY ASSURED`, `YETKİLİ İMZA`,
`NOTER`, `48 saat`, `±0.005`, `DOĞRULAMA SERVİSİ`, `HAZIRLANIYOR`,
`DEMO İÇERİK`.

**R1: PASS.**

---

## R2 — are the corrections correct?

| Correction | Verdict | Evidence |
|---|---|---|
| `±0.005 → ±0.01 mm` | PASS | `MINIMUM_TOLERANCE` in `claims.ts`; every surviving `±0.005` in `src/` is a comment; zero in `dist/`. Hero golden shows `Ø 28.000 ±0.010`, `72.000 ±0.010`. |
| `geo.placename İstanbul → İzmir` | PASS | `dist/index.html` verified byte-for-byte |
| `48 saat → 1–3 iş günü` | **FAIL** | corrected in `SSS.tsx`, `claims.ts`, proof strip — **but `TeklifAl.tsx:1098` still promises 24 hours, and it ships** |
| CAD list vs `CAD_ACCEPTED_EXTENSIONS` | **PARTIAL** | two surfaces reconciled, six not |

### F1 (FAIL) — 24-hour quote SLA on the live RFQ page

`src/pages/TeklifAl.tsx:1098-1099`, rendered inside the step-3 review panel of
`/teklif-al`. Present in `dist/assets/TeklifAl-BVhk9dJ_.js`. Authority: §D
`QUOTE_RESPONSE_TIME_INTERNAL: 1-3 Days`, §J `QUOTE_SLA: 1-3 Days`. The
correct value already exists as `QUOTE_RESPONSE_TIME` in
`src/content/claims.ts` and is imported elsewhere; this string was simply
missed.

### F2 (FAIL, dead code) — the same claim in an orphan component

`src/components/FinalCTASection.tsx:176`: *"CAD dosyanızı gönderin, 24 saat
içinde kapsamlı DFM analizi ve rekabetçi fiyat teklifi alın."* The component
has **zero importers** and is correctly tree-shaken out of `dist/`. It is not
user-reachable, but it is a live source-tree claim carrier that the gate walks
past — and this phase deleted 15 other dead components while leaving this one,
which is the only dead component that still carries a forbidden claim.

### F3 (PARTIAL) — published CAD format list vs the working implementation

§J `ACCEPTED_CAD_FORMATS: DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`.
The implementation is
`src/utils/cadUpload.ts:4` → `["step","stp","stl","obj","iges","igs","3mf"]`.

Reconciled by this phase:

- `src/pages/SSS.tsx:24` — "STEP, STP, STL, OBJ, IGES, IGS ve 3MF" ✓ exact, and correctly adds the e-mail path for anything else
- `src/data/technicalLandingData.ts:130` — ✓ exact

Not reconciled:

| File:line | Text | Problem |
|---|---|---|
| `src/pages/TeklifAl.tsx:620` | `accept=".step,.stp,.iges,.igs,.stl,.obj,.3mf,.x_t,.x_b"` | picker offers Parasolid `.x_t/.x_b`, which `cadUpload.ts` then rejects; also bypasses the existing `CAD_ACCEPT_ATTR` derived constant |
| `src/pages/TeklifAl.tsx:641`, `1279` | `["STEP","STL","OBJ","IGES","3MF"]` / `[…,"STP",…]` | two different hand-maintained lists, both incomplete |
| `src/components/HeroCadDropzone.tsx:57` | "STEP, STL, OBJ, IGES, 3MF" | missing STP/IGS |
| `src/data/chatFaqData.ts:97` | "SolidWorks (.sldprt/.sldasm), DXF, DWG, PDF … **kabul ediyoruz**" | asserts acceptance of five formats the uploader rejects |
| `src/data/servicePages.ts:49`, `94`, `1837`, `1861` | "STEP, IGES, Parasolid, SolidWorks, CATIA, NX … destekliyoruz" | same |

The `servicePages`/`chatFaq` rows are defensible *if* read as "we can work
from these by e-mail" — the corrected SSS answer explicitly establishes that
path. The `TeklifAl.tsx:620` `accept` attribute is not defensible: the file
picker and the validator disagree, which is a functional defect, not a wording
one. Recorded as PARTIAL rather than FAIL because no `USER_INPUTS.md` field is
contradicted by the prose readings; the `accept` mismatch is a Phase 09 item.

---

## R3 — adjudication: removing `%98 on-time` instead of correcting it to 95 %

**Verdict: SOUND. Consistent, not arbitrary.**

Four fields carry `PUBLIC_IF_VERIFIED_AND_STRATEGIC` in §D. The Coder
published three (tolerance, quote SLA, CMM coverage) and withheld one
(on-time delivery). That is only defensible if a stated discriminator does the
work — and one is stated, in `src/content/claims.ts` `ON_TIME_DELIVERY`.

Why it holds:

1. The token is a **conjunction**. `PUBLIC_IF_VERIFIED_AND_STRATEGIC` is
   explicitly not `PUBLIC_OK`, and §0 sets `DEFAULT_FACT_VISIBILITY:
   INTERNAL_ONLY_UNLESS_PUBLIC_OK` with `NEVER_PUBLISH_JUST_BECAUSE_KNOWN:
   YES`. The burden falls on publication. Verification alone does not clear it.
2. The discriminator maps to §0 `PUBLIC_POSITIONING_PRIORITY`
   (`PRECISION_ENGINEERING, MEASUREMENT, TRACEABILITY, PROCESS_DISCIPLINE,
   TECHNICAL_RESPONSIVENESS`). Tolerance → precision engineering. Quote SLA →
   technical responsiveness. CMM coverage → measurement + traceability.
   On-time-delivery **rate maps to none of the five.** It is a logistics
   scorecard, not a capability.
3. The three published ones are **specifications a buyer can test on the first
   order**; a retrospective self-graded percentage is not testable by the buyer
   at all. §O `COPY_STRATEGY: CAPABILITY_AND_EVIDENCE_OVER_COMPANY_SIZE` and
   `BRAND_SCALE_STRATEGY: DO_NOT_DISCUSS_SCALE_UNLESS_IT_ADDS_CREDIBILITY`
   both point the same way. Printing "95 %" also advertises a one-in-twenty
   miss with no audit a buyer can consult.
4. The direction is conservative: removal cannot create a false claim, whereas
   publishing 95 % would introduce a new unaudited public assertion this run
   has no mandate to make.

Design cost: none. The freed proof-strip cell was not left blank — the strip
now reads `±0.01 mm · 1-3 İŞ GÜNÜ · TALEBE BAĞLI · İZLENEBİLİR · 5 EKSEN ·
ISO 9001:2015`, six filled cells (verified in the regenerated 1280 golden).

Caveat for the Orchestrator: if a later phase wants the number back, the route
is a §D publication decision, not a quiet edit — and the gate would **not**
stop a quiet edit (see G4 below).

---

## R4 — nothing was invented

| Addition | Authority | Verified |
|---|---|---|
| `OHSAS 18001` | §C `OTHER_CERTIFICATIONS: OHSAS 18001 (PUBLIC_OK)` | ✓ exact string match |
| `TEKNOPAR` | §F `OTHER_REFERENCES: TEKNOPAR (PUBLIC_OK)` | ✓ |
| 4 quality PDFs | §H, all four `*_VISIBILITY: PUBLIC_OK` | ✓ |

The published reference row is exactly the six §F `PUBLIC_OK` names —
HPT, TAAC, METSAN, TEKNOPAR, TEKNİK BALANS, AKON HİDROLİK — with `ZTM`
(`REMOVE_IF_UNVERIFIED`) gone. Confirmed in the regenerated 1280 golden,
band 11.

The certification set is exactly §C's three: `ISO 9001:2015`,
`ISO 14001:2015`, `OHSAS 18001`. Confirmed in golden band 10.

### PDFs are the real files, and the printed sizes are measured

`md5sum` — served copy vs `Politikalar/` original, byte-identical in all four:

```text
1f1496157a2570ef9e8ee74e17b86b3f  kalite-politikasi.pdf          81083 B → 79 KB  (declared 79)
2d8e81001a4d384755f897c3dc33a4d7  olcum-ekipmanlari.pdf         103038 B → 101 KB (declared 101)
237ebc59dce341fba2cc178a1801a12f  paketleme-kilavuzu.pdf         92312 B → 90 KB  (declared 90)
88ee20951dfd2dfef8ad2fda09e6a66e  tedarikci-davranis-kurallari.pdf 88370 B → 86 KB (declared 86)
```

All four are present in `dist/belgeler/`, i.e. actually served.

I also read the PDFs' text (`pdftotext`) rather than trusting the filenames.
They are genuine MAS TECHNIC documents with real document numbers
(`MT-QAP-2026/01`, `MT-EQP-2026/01`, `MT-PKG-2026/01`, `MT-SCC-2026/01`) and
contain **no** forbidden certification claim. Notably
`olcum-ekipmanlari.pdf` §2 is headed *"İLERİ SEVİYE METROLOJİ VE 3. TARAF
DOĞRULAMA (ON-DEMAND / ACCREDITED)"* — which independently corroborates §D
`CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND` and the site's new
`Akredite 3. taraf CMM ölçümü, talebe bağlı`. The evidence and the claim agree.

**No new fact appears anywhere without a `USER_INPUTS.md` authority.**
INVENTED_ANYTHING: **NO**.

---

## R5 — the type guarantee, proven

`src/content/claims.ts` asserts in its header that publishing a withheld fact
is a `tsc` error. I proved it rather than reading it: a copy of `claims.ts`
with QA probes appended, compiled under the project's own flags
(`--strict false --noImplicitAny false --target ES2020 --moduleResolution bundler`,
matching `tsconfig.app.json`).

```text
claims.ts(338,35): error TS2345: Argument of type '{ readonly visibility:
  "PRIVATE_DO_NOT_DISCLOSE"; readonly source: ...; readonly reason: ... }' is not
  assignable to parameter of type 'PublishableClaim<unknown>'.
  Property 'value' is missing ...
claims.ts(343,3): error TS2322: Type '"PRIVATE_DO_NOT_DISCLOSE"' is not
  assignable to type 'PublishableVisibility'.
```

- Probe A — a well-formed `WithheldClaim` passed to `publish()`: **rejected**,
  `TS2345`, exactly the `ts(2345)` the file header advertises.
- Probe B — withheld shape with a `value` bolted on to dodge probe A:
  **rejected**, `TS2322`. The visibility union closes the loophole.

**TYPE_GUARANTEE: PROVEN.** Two honest limits worth recording, neither of
which contradicts the claim as written:

1. `publish()` / `withhold()` are module-private, so the guarantee binds edits
   *inside* `claims.ts`. Nothing type-level stops a new component writing a raw
   `"%98"` literal — that is the gate's job, and the gate has holes (R6).
2. `tsconfig.app.json` sets `strict: false`, so `strictNullChecks` is off and
   `const s: string = ON_TIME_DELIVERY` compiles, yielding `null`. The
   withheld exports therefore give no *consumption-site* type protection —
   they render nothing rather than failing the build. Probe C also confirms
   the expected and acceptable limit that the type system checks permission
   **shape**, not truth: a fabricated value wrapped in a correct `publish({...})`
   compiles.

---

## R6 — the gate: teeth, wiring, and where the enamel is thin

### Red baseline reproduced — and it is redder than reported

`git archive 75629f3 src index.html` into a clean directory, dropped the
Phase 06 gate script beside it, ran it:

```text
# scanned:  186 files, 26393 non-comment lines
### unverified-certification — 61      ### machine-inventory — 117
### certifying-body — 8                ### fabricated-analytics — 8
### tolerance-beyond-verified — 88     ### demo-placeholder-badge — 6
### quote-sla-overpromise — 10         ### fake-verification — 5
### delivery-or-quality-rate — 8       ### fabricated-report-number — 11
### process-capability-metric — 72     ### unverified-reference — 1
### company-scale-disclosure — 49      ### unapproved-confidentiality — 10
### sector-standard-compliance — 37    ### unverified-social — 3
### named-supplier — 7                 ### english-availability — 1
### named-enterprise-system — 28       ### wrong-city — 1
### unconditional-guarantee — 25       ### marketing-filler — 6
FAIL — 562 claim violation(s), 1 resource problem(s).   [exit 1]
```

**562, not the 503 the Coder reported.** Not a defect — the gate grew rules
after the baseline was taken — but the Orchestrator should record 562 as the
measured figure. Post-phase the same script returns
`PASS — 0 unverified claims across 22 rules` over 172 files / 23,488
non-comment lines. Red to green reproduces.

### Wiring is real

`e2e/landing/claims-gate.spec.ts` sits under `e2e/landing/`, and
`playwright.config.ts:108` sets `CRITICAL_MATCH = ["landing/**/*.spec.ts",
"technical-landing.spec.ts"]`. So `npm run test:e2e:critical` runs it in both
`critical-1280` and `critical-375`. `package.json` and `.github/**` were
untouched, as required. The self-check test writes a probe containing
`AS9100D` and asserts a non-zero exit — a neutered rule set fails there.

### But the gate is defeatable — GATE_DEFEATABLE: **YES**

I ran the gate against a synthetic tree of evasion probes. These are written
in ordinary, publishable Turkish, with correct diacritics — not adversarial
gibberish:

| Probe | Caught? | Why it slips |
|---|---|---|
| `"Teklifinizi 24 saat içinde iletiyoruz."` | **NO** | `quote-sla-overpromise` needs `teklif`/`dönüş` immediately after `24 saat` |
| `"Zamanında teslimat oranımız yüzde 98."` | **NO** | `delivery-or-quality-rate` requires the `%` glyph; the word form evades |
| `"Ekibimizde 48 mühendis çalışıyor."` | **NO** | `company-scale-disclosure` requires a `+` before the noun; a bare count evades. §D TEAM_SIZE is `PRIVATE_DO_NOT_DISCLOSE` |
| `"Üretim alanımız 15.000 metrekare."` | **NO** | requires the `m²` glyph |
| `"Her parça CMM ile %100 ölçülür."` | **NO** | `unconditional-guarantee` lists `ölçüm`, not the verb `ölçülür` |
| `"Bütün siparişlerde muayene raporu verilir."` | **NO** | the rule enumerates `her|tüm`; `bütün` is a synonym it does not know |
| template literal `AS` + `${""}` + `9100D` | **NO** | per-line regex, interpolation splits the token |
| `"AS" +` then newline then `"9100D"` | **NO** | per-line regex |
| `"..." + "AS" + "9100" + "D"` (same line) | **NO** | quotes and `+` sit between the characters |
| `15.000 m&#178;` (HTML entity) | **NO** | entity is not the glyph |
| `A` + U+200B + `S9100D` (zero-width space) | **NO** | invisible character splits the token |
| `AS9100D` / `as9100d` / `NADCAP` / `IATF 16949` | yes | positive controls, all caught |
| `MT-2024-0512`, `15.000 m²`, `52 adet CNC tezgah`, `±0.005mm`, `0.005 mm` | yes | positive controls, all caught |

The first row is **not hypothetical**. It is finding F1: the exact shape the
rule was written for, live on `/teklif-al`, shipped in `dist/`, and walked
past by the gate.

Two further structural gaps:

- **G4 — scope.** `ROOTS = ["src/pages","src/components","src/data","src/content","index.html"]`.
  Not scanned: `src/hooks`, `src/utils`, `src/config`, `src/lib`, `src/routes`,
  `src/App.tsx`, and all of `public/**`. This is not theoretical — user-facing
  copy already lives there: `CAD_FORMAT_HINT` is composed in
  `src/hooks/useCadHandoff.ts:16` and rendered at
  `src/components/technical-landing/FinalSections.tsx:255`. It currently
  carries the Phase 09 carry-forward `Maks. 50 MB`. I scanned the blind zone by
  hand: no *other* live violation is hiding there today.
- **G5 — the self-check races itself.** The probe is written to the shared path
  `src/content/__claims-gate-probe__.ts`. With `fullyParallel: true` and
  `workers: 2` under CI, `critical-1280`'s "the gate can still fail" can be
  holding the probe while `critical-375`'s "no unverified claim exists" runs
  the scanner — a spurious red that `retries: 2` would mask rather than
  explain. A hard kill also leaves a stray `AS9100D` file in `src/`. (Verified
  no stray file is present in the integrated tree.)

**R6: PARTIAL.** The gate is real, wired, honest about its own failure mode,
and its rules each name their `USER_INPUTS.md` authority — that is a genuinely
good artefact. But it is not a sufficient barrier, and this phase shipped a
violation through it.

---

## R7 — the golden regeneration, adjudicated pixel by pixel

`--update-snapshots=all` destroys the evidence a reviewer needs, so I rebuilt
it: `reports/qa/tools/png-diff.mjs` decodes the pre-phase blob from
`git archive 75629f3` and the post-phase blob, and reports changed pixels, the
change bounding box, the changed row bands, and the vertical offset in
`[-4..+4]` that minimises the difference. It also reproduces pixelmatch's YIQ
delta at Playwright's default `threshold: 0.2`, which is the only way to say
what `maxDiffPixels: 200` would actually have seen.

### (c) Headers and navigation goldens are genuinely unchanged — PASS

Only 21 files changed in git: 3 viewports x (1 landing + 6 footers). I diffed
the control group anyway. `shell-header-home`, `shell-header-about`,
`navigation-closed`, `navigation-open` at all three viewports: **0 changed
pixels, all twelve.** Nothing was quietly rebaselined.

### (b) The offset analysis is right — PASS

| Coder's claim | Measured |
|---|---|
| `/` footer at 1440 minimises at **+1** | confirmed: +1 gives 19,037 px, offset 0 gives 41,890 px |
| `/` footer at 1280 minimises at **0** | confirmed: +0 gives 12,119 px |
| `/hakkimizda` footer at 375 minimises at **-1** | confirmed: -1 gives 3,144 px |

### (a) Every diff is a content change — PASS

The only edit to `SiteFooter.tsx` in this phase is the removal of the
Instagram and YouTube entries from `SOCIAL` (§L: both `NONE`, LinkedIn is the
only permitted channel). I confirmed this visually against both golden
versions at 1440: the old bottom bar carries three social glyphs, the new one
carries one; the legal row reflows left by ~84 px, which exactly explains the
uniform `x[122..638] y[265..296]` band that appears on all six desktop
footers. The 1 px vertical offsets are the sub-pixel consequence of that
reflow, not a layout regression.

At 375 the change is confined to `x[74..167] y[606..631]` — the icon row and
nothing else.

The landing goldens shrink by 132 px (375) and 146 px (1280/1440). I read both
versions. The old golden is the fabrication catalogue itself: `±0.005 mm`,
`48 SAAT`, `50+ MALZEME`, `%100 CMM RAPORU`, `%98 ZAMANINDA TESLİMAT`,
`AS9100D`, wet signatures under each certificate, a notary emboss, a
`RAPORU DOĞRULA` QR, a `QUALITY ASSURED` stamp, `CMM ÖLÇÜM RAPORU
MT-2024-04018`, `AERO HOUSING / RAPOR NO: MT-2024-0512`, `ZTM` in the
reference row, `12 AKTİF SİPARİŞ / %98.7 BAŞARI`, and `PDF · 1.2 MB` rows
under `KAYNAKLAR HAZIRLANIYOR` that linked to nothing. The new golden replaces
every one of them and the page still reads as a finished composition — no
blank band, no collapsed section, no orphaned rule. **No unrelated regression
is present in any regenerated golden.**

### (d) `maxDiffPixels: 200` masked a real change — CONFIRMED, and it is a finding

The Coder reported that five of six 375 footers had been passing against a
golden depicting a footer that no longer exists. **I measured it independently
and it is true:**

| Golden | Playwright-equivalent diff | Verdict against `maxDiffPixels: 200` |
|---|---|---|
| 375 footer home / service / rfq / journal / notfound | **79 px** | **PASS — masked** |
| 375 footer about | 4,498 px | fail (would have been caught) |
| 1280 footers | 639–1,316 px | fail |
| 1440 footers | 651–8,278 px | fail |
| landing-fullpage, all viewports | 392k–503k px | fail |

79 px out of 277,875 = **0.028 %**. Two 26 px icon boxes vanished from a public
page and the suite would have said nothing, at five of six surfaces, for as
long as nobody looked. That is the Phase 04 failure mode reappearing with a
smaller blast radius.

**Recommendation (not a Phase 06 blocker, and not mine to implement):**
`maxDiffPixels: 200` is a flat allowance applied to crops ranging from
375x64 px to 1440x4,119 px. On the shell crops it is roughly an order of
magnitude too generous. Either scale it (`maxDiffPixelRatio` around 0.0005) or,
better for this specific surface, assert the footer's social-link set in the
DOM — a link list is a content contract and should not be defended by
photography.

**R7: PASS.** The regeneration is justified, correctly analysed, and hides
nothing. The threshold finding is recorded as a hardening item.

---

## R8 — the 16 deletions

15 components plus `src/data/travelers.ts`. I checked importers **at the base
commit `75629f3`**, i.e. before this phase could have made anything dead:

| Deleted module | Importers at base |
|---|---|
| `CNCScrollStory`, `CapabilitiesSection`, `CertificationsSection`, `FAQBlogSection`, `HeroSection`, `IndustriesSection`, `NexusPromoSection`, `ProjectShowcase`, `QuickQuoteSection`, `ServicesSection`, `TestimonialsSection`, `VideoScrollSection`, `WhyUsSection` | **0** |
| `LiveLedgerCard` | 1 — `HeroSection.tsx` (itself dead, also deleted) |
| `ui/CrosshairOverlay` | 1 — `CNCScrollStory.tsx` (itself dead, also deleted) |
| `data/travelers.ts` | 1 — `ServicesSection.tsx` (itself dead, also deleted) |

The whole set is transitively dead at base. **No user-reachable surface lost
content.** The build confirms it: every golden PNG shrank, the landing page is
132–146 px shorter, and nothing these modules rendered appears in `dist/`.

**R8: PASS.**

---

## R9 — positioning

`DO_NOT_USE_SMALL_WORKSHOP_LANGUAGE` **and**
`DO_NOT_INVENT_LARGE_COMPANY_LANGUAGE`. I read the changed public copy rather
than the summary of it.

**Not apologetic anywhere.** A scan of all public copy for diminishing forms
(`küçük atölye`, `mütevazı`, `sınırlı kapasite`, `henüz`, `maalesef`,
`yapamıyoruz`, `bulunmamaktadır`, `az sayıda`) returns nothing on public
routes; every hit is an admin or customer-panel empty state, which is correct
UI copy. The one public `bulunmamaktadır` is `SSS.tsx:23` — "Minimum sipariş
adedi bulunmamaktadır" — which is a strength, not a limitation.

**Not inflated either.** `marketing-filler` rule: 6 hits at base, 0 now. The
Hakkımızda vision card no longer claims to be "one of Europe's leading
precision machining centres" and the team card no longer publishes a headcount.

**The freed proof-strip cells.** Verified in source and in the regenerated
1280 golden. The strip reads:

```text
±0.01 mm      1-3 İŞ GÜNÜ    TALEBE BAĞLI          İZLENEBİLİR   5 EKSEN       ISO 9001:2015
TOLERANS      TEKLİF DÖNÜŞÜ  AKREDİTE CMM ÖLÇÜMÜ   ÜRETİM        CNC İŞLEME    KALİTE YÖNETİM SİSTEMİ
```

Six cells, none empty, every one either a specification a buyer can test or a
certificate §C authorises. The two cells vacated by `50+ MALZEME` and
`%98 ZAMANINDA TESLİMAT` carry `5 EKSEN / CNC İŞLEME` and `ISO 9001:2015` — as
reported. This reads as discipline. The strip is *stronger* than the one it
replaced, because a reader can act on all six.

**Band 06 NEXUS.** The four fabricated counters (`12 AKTİF SİPARİŞ`,
`7 ÜRETİMDE`, `126 TOPLAM PARÇA`, `%98.7 BAŞARI`) and the named quality
manager are gone; the tiles now name what the portal does
(`SİPARİŞ · DURUM TAKİBİ`, `ÜRETİM · AŞAMA GÖRÜNÜRLÜĞÜ`,
`ÖLÇÜM · KONTROL KAYITLARI`, `SEVKİYAT · TESLİMAT PLANI`) and the order table
is masked (`MT-••••-••12`, `••.••.••••`) under
`PORTAL GÖRÜNÜMÜ · MÜŞTERİYE AİT ALANLAR MASKELENMİŞTİR`.

**My judgement: discipline, not a missing feature.** A masked product
screenshot is the standard and honest way to show a customer portal, the
customer panel it depicts genuinely exists in the repo, and the band asserts
no quantity, rate, date or person. One caveat for the record: the label
*asserts* that the rows are real-but-masked. A strictly weaker phrasing was
unavailable — `ÖRNEK` and `TEMSİLÎ` are themselves forbidden demo badges — so
the Coder was choosing between two rules and chose the one that asserts
nothing checkable. I accept it; the Orchestrator may want a human to confirm
the wording before release.

**Band 07** was renamed `SEÇİLMİŞ PROJELER` to `KABİLİYET PROFİLLERİ` and its
table heads changed from `NOMİNAL / ÖLÇÜLEN / SONUÇ` (a measurement record
that was never measured) to `ÖZELLİK / KONTROL / KAYIT` (a control plan). The
e2e contract now pins those column heads. That is the right correction: the
band stopped pretending to be evidence and started describing method.

**R9: PASS.**

---

## Case-study schema (Phase 06 acceptance criterion)

`src/content/caseStudies.ts` carries every field the phase requires —
`challenge`, `material`, `process`, `tolerance`, `surfaceFinish`,
`inspection`, `leadTime`, `outcome`, `controlPlan`, `gallery`,
`relatedCapability`, `rfq` — as a discriminated union on `kind`.
`CapabilityProfile` types `client`, `reportNo` and `measuredResults` as
`never`, so a capability profile cannot grow project evidence by accident;
`AnonymisedProject` requires `permission: "ANONYMISED"` and a `sector` in place
of a customer. There is deliberately **no** `named-project` variant, which is
the right call: naming a client needs both §F `PUBLIC_OK` and written project
consent, and no project has either.

`tolerance` and `inspection` import from `claims.ts` rather than repeating a
literal. `LEAD_TIME` describes the mechanism ("termin ... teklifle birlikte
verilir") instead of promising a number, which is the correct handling of a
field `USER_INPUTS.md` does not supply.

## Other Phase 06 acceptance criteria

| Criterion | Result | Evidence |
|---|---|---|
| No demo/sample/hazırlanıyor badge on public pages | PASS | `demo-placeholder-badge` 6 to 0; `status="sample"` removed from band 10; zero in `dist/` |
| Claims used on multiple pages come from one source | PASS | `claims.ts` is imported by `technicalLandingData.ts`, `servicePages.ts`, `caseStudies.ts`, `Hakkimizda.tsx`, `SSS.tsx` |
| Resource rows are real links or removed | PASS | four `/belgeler/*.pdf`, HTTP-fetched by the e2e contract, sizes measured from disk by the gate |
| EN control hidden / JSON-LD honest | PASS | `availableLanguage: ["Turkish"]` |
| Generic marketing filler removed | PASS | `marketing-filler` 6 to 0 |
| CTA terminology one hierarchy | PASS | every public quote CTA shares the "Teklif Al" stem with a contextual qualifier |

---

## The rest of R1 — what the string-list check missed, and the exhaustive sweep that found it

The packet gave me a list of claim classes to grep for. That list is clean. So
I stopped grepping for known strings and instead **extracted every
percentage-shaped, guarantee-shaped and certification-shaped string literal
that actually ships**, out of the built public chunks, and read them. That is
where the remaining fabrication is.

None of it was introduced by Phase 06 — I checked every item against
`75629f3` and all of it pre-exists. These are **survivors of a sweep reported
as complete**, on live public service routes, shipped in
`dist/assets/servicePages-BKh_aClb.js` and the chat-FAQ chunk.

### F4 (FAIL) — case-study evidence asserted where §G says none exists

`src/data/servicePages.ts:1854`

> "**Gerçek vaka çalışmalarıyla kanıtlanmış** %70'e kadar tasarruf"
> (up to 70 % savings **proven by real case studies**)

`USER_INPUTS.md` §G `CASE_STUDIES: NONE_PROVIDED_YET`. This is the most on-nose
violation available in this phase: an explicit appeal to case-study evidence,
attached to a quantified savings figure, on the page that sells DFM analysis.
The landing page had exactly this failure removed (band 07, `SEÇİLMİŞ
PROJELER` became `KABİLİYET PROFİLLERİ`); the service page kept it.

No gate rule covers `kanıtlanmış` or `vaka çalışması`.

### F5 (FAIL) — `%100` universal-inspection claims, the same shape as the removed `%100 CMM RAPORU`

| File:line | Claim |
|---|---|
| `servicePages.ts:788` | "Kaplama kalınlığı ve sertlik ölçümü ile **%100 kalite kontrolü**" |
| `servicePages.ts:2737` | "Basınç Testi — **%100 sızdırmazlık kontrolü**" |
| `servicePages.ts:2760` | "**%100 basınç testi** ve sızdırmazlık kontrolü" |
| `servicePages.ts:2767` | "Sızdırmazlık garantisi veriyor musunuz?" → "**Evet**, … **%100 basınç testinden** geçmektedir." |
| `servicePages.ts:2728` | "**Her** hidrolik parça basınç testinden (1.5× çalışma basıncı) ve sızdırmazlık testinden geçmektedir." |

The ledger's own words for why `%100 CMM RAPORU` had to go are *"coverage is
on demand, not universal"* and *"an unconditional promise is a claim with no
evidence"* (§D `CMM_COVERAGE_INTERNAL: THIRD_PARTY_ACCREDITED_ON_DEMAND`).
That reasoning applies identically here and was not applied.

The gate's `unconditional-guarantee` rule is
`/%\s?100\s*(CMM|kontrol|muayene|ölçüm|izlenebilir|NDT|boyutsal|lot|denetim)/i`.
`%100 kalite kontrolü` slips because `kalite` sits between `%100` and
`kontrol`; `%100 basınç testi` and `%100 sızdırmazlık` slip because their nouns
are not in the list.

### F6 (FAIL) — an unauthorised guarantee vocabulary, ~16 live occurrences

No `USER_INPUTS.md` field authorises MAS TECHNIC to *guarantee* anything. The
gate has a rule for this class (`teslimat garantisi|kalite garantisi|tedarik
garantisi`) but it matches only the noun-phrase form. The verb and adjective
forms all ship:

| File:line | Claim |
|---|---|
| `servicePages.ts:625` | "5-10 iş günü üretim süresi ile hızlı **teslimat garanti ediyoruz**" |
| `servicePages.ts:3033` | "IEC 61400 uyumlu, **25+ yıl ömür garantili** bileşenler" |
| `servicePages.ts:2054` | "Her yöntemde seri üretim eşdeğeri kalite ve tutarlılık **garanti edilmektedir**" |
| `servicePages.ts:2051` | "verimlilik ve rekabetçi **fiyat garantisi** sunuyoruz" |
| `servicePages.ts:319` | "±0.01mm çap toleransı **garanti eder**" |
| `servicePages.ts:1094` | "ISO/IEC 16022 ve ISO 15415 doğrulama standartlarına **tam uyum garanti ediyoruz**" |
| `servicePages.ts:1223` | "**2000N+ çekme kuvveti garantisi**" |
| `servicePages.ts:1356` | "… ile kaynak kalitesini **garanti ediyoruz**" |
| `servicePages.ts:2843` | "Helyum sızdırmazlık testi ile **ultra-düşük kaçak garantisi**" |
| `servicePages.ts:2890` | "**3 iterasyon garantisi** ile risk azaltma" |
| `chatFaqData.ts:75` | "**tüm ürünlerimiz** teknik şartnameye **uygunluk garantisi** ile teslim edilir" |

`servicePages.ts:625` is the sharpest: a *delivery* guarantee, the literal
phrase the gate rule was written to catch, in verb form.

### F7 (FAIL) — sector-standard certification claims outside §C

The phase removed AS9100D, IATF 16949, ISO 13485, NADCAP and NIST 800-171 and
added a `sector-standard-compliance` rule whose stated rationale is *"a sector
regulation is a claim a customer's submission depends on."* Several claims of
exactly that kind remain, because the rule enumerates standard numbers:

| File:line | Claim | Why it matters |
|---|---|---|
| `servicePages.ts:1356` | "EN ISO 15614-1 … ve AWS D1.1 **sertifikalı kaynakçılarımız** ile **EN ISO 3834-2 standardında** üretim" | EN ISO 3834-2 is a welding **quality-management-system** certification, directly parallel to ISO 9001; §C lists three certificates and this is not one |
| `servicePages.ts:1378` | "**ISO 9606 sertifikalı** kaynakçılar" | welder qualification certificates |
| `servicePages.ts:3100` | "**NACE MR0175 sour service sertifikalı**" | oil-and-gas material qualification |
| `servicePages.ts:762` | "**MIL-A-8625 Tam Uyum** — Havacılık ve savunma **sertifikalı** kaplama" | defence spec compliance |
| `servicePages.ts:2409` | "Malzeme Tedarik (**AMS sertifikalı**)" | aerospace material spec |
| `servicePages.ts:1532` | "EN 10204 3.1/3.2 Sertifika — **Her malzeme** sertifikalı tedarik" | the phase removed `EN 10204 3.1` from the landing proof list in `RestoredLandingSections.tsx` but left a stronger, universal form here |
| `servicePages.ts:1560` | "Havacılık ve medikal sınıf **sertifikalı** malzemeler" | |

**Deliberately excluded from this finding:** `ASME B16.5`, `ISO 4401`,
`IEC 61400`, `ISO 1461`, `API 6A`, `ISO 2768`, `ASME Y14.5`, `ASTM A967/B912`,
`MIL-DTL-16232/5541`. Those describe what a *part* conforms to dimensionally,
or what a *coating standard* specifies — published design standards, not
assertions that MAS TECHNIC holds an audit. The gate's own comments make the
same distinction and it is the right one.

### Why these are Phase 06 failures and not carry-forwards

The Orchestrator's carry-forward list covers unguarded **lead-time day-ranges**
("no `USER_INPUTS.md` field covers production lead time"). F4–F7 are different:
each has a `USER_INPUTS.md` field that speaks directly to it (§G for F4, §D
`CMM_COVERAGE` for F5, §C for F7), each is the same claim class the phase
removed elsewhere, and each is named in the phase's own mandatory task list —
*"Verify/remove … 100% CMM … **and similar KPI claims**"*, *"Verify/remove …
any other certification claim"* — and in the acceptance criterion *"No
knowingly fabricated customer/certification/KPI/measurement proof remains in
production public UI."*

Commit `8d31435` is titled *"finish the servicePages sweep — certifications,
capacity, suppliers and sector standards."* The sweep is not finished.

---

## R10 — suites and Phase 01–05 guarantees

All runs on the integrated tree at `d23a7c6`, `PLAYWRIGHT_PREVIEW_ONLY=1`
against a single `npm run build`, one suite at a time.

| Check | Result |
|---|---|
| `npm run build` | exit 0 |
| `npm run typecheck` (app + node + e2e projects) | exit 0 |
| `node scripts/claims-gate.mjs` | PASS — 0 across 22 rules |
| `test:e2e:critical` (`critical-1280` + `critical-375`) | **163 passed, 3 skipped, 0 failed** (11.4 min) — matches the Coder's report exactly |
| `test:e2e:visual` (375 / 1280 / 1440) | **27 passed, 0 failed** (1.6 min) |
| `test:e2e:smoke` (webkit + firefox, 1440 + 390) | **12 passed, 0 failed** (1.4 min) |
| `motion-audit --mode=guard` | PASS — every motion call site goes through `@/components/shell/motion` |
| `grid-axis-probe` | **PASS — every measured edge sits on a master axis, 0 off-grid** (1 px tolerance) |
| `motion-audit --mode=rest` (B28) | **PASS — `hiddenText=0` on every route and viewport** |

Totals: **202 passed, 0 failed, 3 skipped.**

The two claims-gate tests are inside the 163 and both pass, including the
self-check that requires the gate to reject a reintroduced `AS9100D`.

**No flake observed.** The Coder reported one environmental flake
(`motion-grammar` "nothing animates while off screen" at `critical-1280`); it
did not reproduce here — it passed first time in a full-suite run.

The three skips are the pre-existing width-conditional `shell-cascade-contract`
cases, not new suppressions. **No skip, `xfail`, tolerance widening or deleted
assertion was introduced by this phase.** The `technical-landing.spec.ts`
changes go the other way: they add negative assertions for `AS9100D` /
`IATF 16949` / `ISO 13485` / `ZTM` / placeholder badges, and they replace "the
resource rows must have no link" with a live HTTP fetch of all four PDFs
requiring `200` and a `pdf` content type. Strictly stronger.

The B28 `rest` run also confirms the Phase 05 guarantee survives this phase:
the only hidden elements at rest are text-free decorative gradient overlays.

---

## Failed checks

| Check | Observation | Root cause | Production fix required? |
|---|---|---|---|
| F1 | `TeklifAl.tsx:1098` promises a 24-hour quote; ships in `dist` | string missed by the sweep; gate rule needs `teklif`/`dönüş` adjacent to `24 saat` | **YES — blocking** |
| F4 | `servicePages.ts:1854` claims savings "proven by real case studies" | §G `CASE_STUDIES: NONE_PROVIDED_YET`; no gate rule covers `kanıtlanmış` / `vaka çalışması` | **YES — blocking** |
| F5 | five live `%100` / "her parça" universal-inspection claims | gate rule enumerates nouns after `%100` instead of matching the pattern | **YES — blocking** |
| F6 | ~16 live guarantee claims in verb/adjective form | gate rule matches only the noun-phrase form `… garantisi` | **YES** |
| F7 | seven sector-standard certification claims outside §C (EN ISO 3834-2, ISO 9606, NACE MR0175, MIL-A-8625, AMS, EN 10204) | gate rule enumerates standard numbers | **YES** |
| F2 | dead `FinalCTASection.tsx` carries the same 24-hour claim | not reachable, but 15 other dead components were deleted and this one was not | Yes (delete) |
| F3 | published CAD format lists disagree with `CAD_ACCEPTED_EXTENSIONS`; `TeklifAl.tsx:620` `accept` offers `.x_t/.x_b` the validator rejects | hand-maintained lists instead of `CAD_ACCEPT_ATTR` | Yes (Phase 09 acceptable) |

## Advisories (not failures)

- **A1 — `maxDiffPixels: 200`.** Reproduced masking a real content change at
  79 px on five of six 375 footers. Recommend a ratio-based threshold or a DOM
  assertion for the footer link set. See R7(d).
- **A2 — gate hardening.** Eleven evasions demonstrated (R6), plus `ROOTS`
  blind to `src/hooks` where rendered copy already lives, plus the self-check
  probe race under `workers: 2`.
- **A3 — commercial claims with no `USER_INPUTS.md` field.**
  `servicePages.ts:2923-2924` publishes a volume-discount schedule (`%15-25` at
  50+, `%25-35` at 200+). Same uncovered class as the ~85 lead-time day-ranges
  already carried forward; recorded so it is decided rather than forgotten.
- **A4 — the admin dashboard still renders fabricated OEE / availability /
  quality figures** (`src/components/admin/dashboardConstants.tsx:53`:
  `Genel OEE 84.2%`, `quality: 98`), shipped in
  `dist/assets/AdminDashboard-*.js`. §N `NEVER_REDESIGN_ADMIN: YES` puts it out
  of scope and it is not a public surface, but it is the last place in the repo
  where the invented operational metrics still live.
- **A5 — two doc references that do not resolve.** `src/content/claims.ts`
  says the PDF sizes are "measured from the served file by
  `scripts/sync-quality-docs.mjs`"; no such file exists — the measurement is
  actually done by `scripts/claims-gate.mjs` (`checkQualityResources`). The
  header example reads `publish(TEAM_SIZE_LEDGER)`; the constant is named
  `TEAM_SIZE`. The guarantees hold; the attributions do not.

## Commands run

```text
npm run build                                                    # exit 0
npm run typecheck                                                # exit 0
node scripts/claims-gate.mjs                                     # PASS, 0 across 22 rules
node <basetree>/scripts/claims-gate.mjs                          # FAIL, 562 violations (red baseline at 75629f3)
node <probetree>/scripts/claims-gate.mjs                         # 11 evasions unlogged
npx tsc --noEmit --strict false ... <claims.ts + QA probes>      # TS2345 + TS2322 as advertised
node reports/qa/tools/golden-audit.mjs <old-goldens> e2e/__golden__/win32
md5sum Politikalar/*.pdf public/belgeler/*.pdf                   # four exact matches
pdftotext -enc UTF-8 public/belgeler/*.pdf -                     # four genuine MAS documents
PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test --project=critical-1280 --project=critical-375
PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test --project=visual-375 --project=visual-1280 --project=visual-1440
PLAYWRIGHT_PREVIEW_ONLY=1 npx playwright test --project=smoke-webkit-1440 --project=smoke-webkit-390 \
                                              --project=smoke-firefox-1440 --project=smoke-firefox-390
node scripts/motion-audit.mjs --mode=guard                        # PASS
node scripts/grid-axis-probe.mjs                                  # PASS, 0 off-grid
node scripts/motion-audit.mjs --mode=rest                         # PASS, hiddenText=0
```

## Scope integrity

- Production files modified by QA: **NONE**.
- Test/report files modified by QA: `reports/qa/phase-06.md`,
  `reports/qa/tools/png-diff.mjs`, `reports/qa/tools/golden-audit.mjs` — all
  inside `QA_WRITE_ALLOWLIST`. All probe trees were built in the scratch
  directory, never in the repo.
- No golden was regenerated, deleted or edited by QA. No assertion was
  weakened. No test was skipped or removed.
- Coder scope: 74 files, none of them `package.json`, `.github/**`,
  `supabase/**`, `/admin/*`, `/musteri-paneli/*`, `PROGRESS.md`,
  `IMPLEMENTATION.md` or `USER_INPUTS.md`.

**SCOPE_INTEGRITY: PASS.**

## Verdict

Phase 06 is the strongest phase artefact in this run so far. The ledger, the
type guarantee, the gate, the case-study schema, the PDF provenance and the
golden audit trail are all real, and several are better than the summaries
claimed. It is still a **FAIL**, because the standard for this phase is not
"most of the fabrication is gone."

What must be true before this phase closes:

1. `TeklifAl.tsx:1098` states `1-3 iş günü` (import `QUOTE_RESPONSE_TIME`).
2. `servicePages.ts:1854` no longer claims case-study proof.
3. The five `%100` / "her parça" universal-inspection claims are removed or
   conditioned, on the same reasoning the ledger already records for
   `%100 CMM RAPORU`.
4. The guarantee vocabulary (F6) and the out-of-§C certification claims (F7)
   are swept.
5. The gate rules are widened to catch the demonstrated evasions — at minimum
   the `24 saat … dönüş` gap, the `garanti ed*` / `garantili` verb forms,
   `%100 <any noun>`, `kanıtlanmış`, and the `sertifikalı` + standard-number
   shape — and `ROOTS` is extended to `src/hooks`, `src/utils`, `src/config`
   and `src/lib`.

A gate that reports `PASS — 0 across 22 rules` over a tree containing roughly
thirty live unauthorised claims is the most dangerous artefact this run has
produced, precisely because it is otherwise excellent. Widening the rules
matters more than the individual string fixes: fix only the strings and the
next copy edit puts them back.
