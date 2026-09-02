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

---
---

# QA Report — Phase 06 RE-VERIFICATION (after correction packet #1)

> The FAIL above stands as the record of what was found at `d23a7c6` / `6f60a3a`.
> Nothing in it is retracted. This section verifies the correction commits
> against `USER_INPUTS.md` itself, never against a restatement of it.

- PHASE: 06 (re-verification)
- CODE_COMMITS: `da5a3e0` (integration HEAD) + 4 preceding — `d68fe8a`, `cd6aa0f`, `b01f372`, `4df8ff3`
- BASE FOR DIFF: `6f60a3a` (the failed tree). Red baseline: `75629f3`
- QA_COMMIT: two commits on `wt/qa-p06b`, report + `reports/qa/tools/**` only
- TESTS: 202 passed / 0 failed / 3 skipped (+1 environmental smoke flake, 12/12 on isolation)
- NEW_TESTS_ADDED: 0 (5 QA-owned probes under `reports/qa/tools/`; no `e2e/` file touched)
- STATUS: **FAIL**
- FABRICATION_REMAINING: **NOT NONE** — 2 blocking (G1, G2) + 1 carry-forward (G3)
- GATE_DEFEATABLE: **YES** — 9 of 18 fresh attacks succeed, and one of them is live in the tree
- CHATBOT_REGRESSION: **NEEDS_FIX** — the disclosure understates it: a mis-route, not a fall-through

---

## Headline

This packet did the structurally hard thing and did it well. It replaced a
deny-list of standard numbers with an **allow-list asserted against §C**, and
that change has the property a deny-list can never have. I invented four
designations that appear nowhere in this codebase — `ISO 27893`, `EN 4956-3`,
`ASME B99.7`, `MAS 1000` — and every one of them fires. Three attestation
claims carrying **no standard number at all** fire too. Every item in my
F1–F7 is gone from `dist/`. The 21 goldens are the cleanest regeneration in
this run and are better than the summary claimed.

It still fails, for the same structural reason as the first attempt, one layer
down. **The sweep followed the gate, and the gate keys on a standard-shaped
token.** So the conformity claims that name no token survived:

`src/data/servicePages.ts:888` — `/hizmetler/kimyasal-islemler`
> "**ASTM standartlarına tam uyum**"

`src/data/servicePages.ts:1118` — `/hizmetler/qr-datamatrix-kodlari`
> "**ISO/IEC standartlarına tam uyum**"

Both ship. On those two exact pages this packet removed *every numbered*
instance of the same assertion — `ASTM A967 standardına tam uyum`,
`ISO/IEC 16022 ve ISO 15415 doğrulama standartlarına tam uyum garanti
ediyoruz`, `{ label: "Standartlar", value: "ASTM B117" }`. What is left is
**strictly broader** than what was removed: an unbounded plural conformity
claim against an entire standards body, sitting three lines from the corrected
copy. `unauthorised-standard-conformity` only yields when `STANDARD_TOKEN`
matches something, so a sentence that names the body and omits the number is
invisible to the rule written to stop exactly this.

And `src/data/servicePages.ts:1596-1602` — `/hizmetler/malzeme-kutuphanesi` —
still publishes a table titled **"Tedarik Süresi ve Sertifika Matrisi"** whose
`Sertifika` column reads `EN 10204 3.1` ×3, `EN 10204 3.2` ×2 and `CoC` ×1,
unconditionally, per material group — while the spec row this same commit
installed **on the same page** reads `{ label: "Sertifika", value: "Talebe
bağlı" }`. The page contradicts itself, and the stronger of the two claims is
the one that survived.

---

## Re-verification matrix

| # | Requirement | Result | Evidence |
|---|---|---|---|
| R1 | F1–F7 gone from `src/` and `dist/`; each replacement authorised | **PASS** | below; `dist` sweep of 27 strings returns 0 |
| R1+ | No fabrication of any kind survives (my own exhaustive re-sweep) | **FAIL** | G1, G2 live; G3 bundle-only |
| R2 | My eleven evasions caught; 9/9 positive controls still firing | **PASS** | 12/12 and 9/9 measured |
| R2+ | Can I defeat the widened gate again? | **YES — 9 new holes**, 1 of them live | probe suite below |
| R3 | The allow-list fires on an invented standard | **PASS (proven, 7/7)** | `ISO 27893`, `EN 4956-3`, `ASME B99.7`, `MAS 1000` + 3 number-free forms |
| R3+ | No false positives on legitimate engineering copy | **PASS (12/12 silent)** | over-removal has a cost; §0 puts PRECISION_ENGINEERING first |
| R4a | `EN 10204 3.1` designation withheld | **FAIL** | withheld only on a **dev-only** route; ships on two public ones |
| R4b | `MIL-A-8625`, `ASME B16.5`, `ISO 2768-m`, `ASTM B117` kept | **PASS — line drawn correctly** | adjudication below |
| R4c | `24 saatte ilk parça` = lead time, not a quote SLA | **PASS (sound)** | joins the existing uncovered-lead-time carry-forward |
| R5 | The chatbot keyword regression | **NEEDS_FIX** | measured with the real matcher: mis-routes, not falls through |
| R6 | 21 goldens justified; nothing hidden | **PASS — verified independently** | 24 byte-identical, 0 shifts, 0 masked |
| R7 | Red baseline, suites, Phase 01–05 guarantees | **PASS** | 767 reproduced exactly; suites below |
| — | Scope integrity | **PASS** | no forbidden path touched; no spec weakened |

---

## R1 — the removals are real

### F1–F7, item by item

| Finding | Status | Evidence |
|---|---|---|
| F1 — 24-hour quote SLA on `/teklif-al` | **FIXED** | `TeklifAl.tsx:1099` now renders `{QUOTE_RESPONSE_TIME}` from `claims.ts`; `24 saat` returns 0 hits in `dist` |
| F2 — dead `FinalCTASection.tsx` carrying the same claim | **FIXED** | file deleted (207 lines) |
| F3 — CAD lists vs `CAD_ACCEPTED_EXTENSIONS` | **FIXED where it mattered** | `accept` now `{CAD_ACCEPT_ATTR}`; new derived `CAD_FORMAT_CHIPS`; `chatFaqData` derives from `CAD_ACCEPTED_EXTENSIONS`. Two cosmetic hand-lists remain (below) |
| F4 — "proven by real case studies" savings | **FIXED** | the whole `DFM Başarı Vaka Çalışmaları` table removed with a ledger comment; `vaka çalışma` = 0 in `dist` |
| F5 — five `%100` / "her parça" universal claims | **FIXED** | all five rewritten to control-plan scope; only `%100 IACS` (a physical constant) remains |
| F6 — ~16 guarantee claims | **FIXED, all 16** | the widened gate finds exactly **16** on the pre-fix tree and **0** now; `garanti` = 0 in `dist` |
| F7 — sector-standard certification claims | **FIXED for every item I listed** | ISO 9606, ISO 15614, AWS D1.1, EN ISO 3834-2, EN 1090, NACE MR0175, AMS, MIL-A-8625 conformity — all gone from body copy |

The Coder's claim that it found **three guarantee sites my own list missed** is
**true and verified**: running the widened gate over the pre-fix tree at
`6f60a3a` reports `unconditional-guarantee — 16`, and `servicePages.ts:409`
(`Moldflow … kalitesini garanti altına alıyoruz`) and `:2875`
(`3 İterasyon Garantisi`) are not in my F6 table. Credit where it is due — my
enumeration was incomplete and the gate caught it.

Also confirmed fixed, each verified independently:

- `SiteFooter.tsx:166` `KANITLANMIŞ TESLİM.` → `İZLENEBİLİR TESLİM.` — this one
  **was** shipping in `dist/`, and the dotless-I diagnosis is correct:
  `/kanıtlanmış/i` cannot match `KANITLANMIŞ` because `ı` upper-cases to `I`
  while `İ` upper-cases to itself. I verified the fold both ways (probe D11
  fires now, is silent on the old gate).
- The DFM case-study table body, the 14 stock tonnages (`Al 6061: 5.000 kg`,
  `Stokta (3.000 kg)` …), `500'den fazla malzeme çeşidi`, `500+ çeşit`,
  `HowWeWorkSection` `%100 Kalite Kontrol` → `CMM / Boyutsal Doğrulama`,
  `Sertifikalı tedarikçi ağı` → `Tedarikçi seçimi, malzeme izlenebilirliği ve
  lot kaydı`, `Malzeme Tedarik (AMS sertifikalı)` → `(şartnameye göre)`.

### `dist/` sweep

A clean `npm run build` (exit 0), then a grep of all `dist/assets/*.js` and
`dist/index.html` for 27 forbidden strings:

`AS9100 · IATF 16949 · ISO 13485 · NADCAP · NIST 800-171 · EN ISO 3834 ·
ISO 9606 · AWS D1.1 · EN 1090 · ISO 15614 · KANITLANMI · TÜV SÜD ·
Bureau Veritas · vaka çalışma · MT-20xx- · RAPORU DOĞRULA · QUALITY ASSURED ·
YETKİLİ İMZA · HAZIRLANIYOR · DEMO İÇERİK · %98 · 48 saat · ±0.005 · ZTM ·
500'den fazla · 500+ çeşit · Cpk · PPAP · garanti`

**Zero hits, all 27.** `garanti` returning zero across the whole bundle —
including the admin chunks — is the single most convincing line in this
verification.

### What still ships

| String | × in `dist` | Verdict |
|---|---|---|
| `%100 IACS` | 1 | copper conductivity reference scale — a physical constant. Correctly kept. |
| `24 saatte ilk parça` | 4 | vacuum-casting delivery lead time. See R4c. |
| `EN 10204 3.1` / `3.2` / `CoC` | 3 / 2 / 1 | **G1 — blocking** |
| `ASTM standartlarına tam uyum` | 1 | **G2 — blocking** |
| `ISO/IEC standartlarına tam uyum` | 1 | **G2 — blocking** |
| `NACE MR0175`, `API 6A`, `IEC 61400`, `IEC 62271` | 1 / 2 / 1 / 1 | **G3** — in `metaTitle`, a dead field. Carry-forward with a condition. |

> The `CoC` count needs care: `dist` shows six matches for `CoC`, but five of
> them are inside `CoCrMo` (the cobalt-chrome alloy). Only **one** is the
> certificate abbreviation. I record the corrected number.

---

## G1 (FAIL) — the certificate matrix contradicts the fix on its own page

`src/data/servicePages.ts:1594-1603`, route `/hizmetler/malzeme-kutuphanesi`,
rendered by `ServiceDetail.tsx:427` (`comparisonTables`), shipping in
`dist/assets/servicePages-DsTw2BoA.js`:

```text
title:   "Tedarik Süresi ve Sertifika Matrisi"
headers: ["Malzeme Grubu", "Standart Tedarik", "Acil Tedarik", "Sertifika", "Min. Sipariş"]
rows:    ["Alüminyum (6061, 7075)", "Stokta",   "Aynı gün", "EN 10204 3.1", "1 kg"]
         ["Paslanmaz Çelik (304, 316)", "Stokta","Aynı gün", "EN 10204 3.1", "5 kg"]
         ["Karbon Çelik (1045, 4140)", "1-2 hafta","3 iş günü","EN 10204 3.1", "10 kg"]
         ["Titanyum (Gr2, Gr5)",  "4-6 hafta", "2 hafta",  "EN 10204 3.2", "5 kg"]
         ["Inconel / Hastelloy",  "6-8 hafta", "4 hafta",  "EN 10204 3.2", "10 kg"]
         ["PEEK / Yüksek Perf.",  "2-4 hafta", "1 hafta",  "CoC",          "1 kg"]
```

Sixty lines above it, installed by this same commit `d68fe8a`:

```text
{ label: "Sertifika", value: "Talebe bağlı" }
```

The commit removed the object-literal form of the claim
(`{ label: "Sertifika", value: "EN 10204 3.1/3.2" }`) and the bullet
(`"EN 10204 3.1/3.2 Sertifika — Her malzeme sertifikalı tedarik"`), and left the
table body, which states the same thing **per material group and without the
"on request" condition**. One page now answers the buyer's question two
different ways, and the surviving answer is the stronger one.

**Why the gate is silent.** `LABEL_VALUE_CLAIM` reads a spec row written as
`{ label: …, value: … }`. A `comparisonTables` entry is `{ title, headers: […],
rows: [[…]] }`, so the column heading that gives the cell its meaning lives in
a *different array* from the cell, and `SENTENCE_BREAK` — which breaks on
`"` followed by `,` — deliberately treats adjacent array entries as unrelated
claims. That is the right call for prose and the wrong call for a matrix, where
**the header is the predicate**. The Coder found this class once (the DFM
case-study table body, correctly removed) and did not sweep for the rest of it.
`reports/qa/tools/p06b-table-body-scan.mjs` does that sweep.

**Why the Orchestrator's R4(a) summary reads as if this were handled.** The
`EN 10204 3.1` designation *was* withheld — in
`src/components/landing/RestoredLandingSections.tsx:18`. That component reaches
production through `LandingFlow` → `LegacyLanding` → `DevRoutes`, i.e. the
**dev-only** `/legacy-landing` route. I confirmed it does not ship: the
replacement string `"Talebe göre malzeme sertifikası ve lot bazlı kayıt
zinciri."` returns **zero** hits in `dist/`. The commit message's claim that this
edit "moves landing-fullpage pixels" is also not true — my golden audit shows
the landing goldens changed in exactly one band, the footer (see R6). So the
only production handling of `EN 10204` this packet performed is on
`servicePages.ts`, where it fixed the two prose carriers and left the table.

**The commit message asserts the opposite of the tree.** `d68fe8a`, under the
heading "Malzeme kutuphanesi", states: *"`EN 10204 3.1/3.2 — Her malzeme
sertifikali tedarik` was both an undeclared standard and a universality claim;
the material certificate is now described as what it is, available on
request."* That is the page this table is on, and on that page the certificate
is still published as `EN 10204 3.1` per material group with no condition
attached.

**Authority.** §C supplies exactly three certificates. §0
`DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK` and
`NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES`. The rule's own authority string reads
"§C — only ISO 9001, ISO 14001 and OHSAS 18001 are supplied; every other
standard is unheld", and its remedy reads "Describe the practice, not the
standard you are audited against." The correct copy already exists on the page.

---

## G2 (FAIL) — conformity asserted against a standards BODY, with no designation

| File:line | Route | Claim |
|---|---|---|
| `servicePages.ts:888` | `/hizmetler/kimyasal-islemler` | "**ASTM standartlarına tam uyum**" |
| `servicePages.ts:1118` | `/hizmetler/qr-datamatrix-kodlari` | "**ISO/IEC standartlarına tam uyum**" |

Both are `advantages` bullets, rendered by `ServiceDetail.tsx:314-328`, both in
`dist`. Both are on pages this packet swept, and on both pages the *numbered*
version of the identical sentence was removed by this packet:

- `kimyasal-islemler`: `"ASTM B117 tuz testi standardına uygun … ve ASTM A967
  pasivasyon standardına tam uyum sağlıyoruz"` → rewritten to name the test
  methods; `{ label: "Standartlar", value: "ASTM B117" }` → `{ label: "Test
  Yöntemi", … }`. The bullet three lines away was not touched.
- `qr-datamatrix-kodlari`: `"ISO/IEC 16022 ve ISO 15415 doğrulama
  standartlarına tam uyum garanti ediyoruz"` → rewritten to read-verification;
  `{ label: "Standart", value: "ISO/IEC 16022" }` → `{ label: "Sembol", … }`.
  The bullet was not touched.

"Full conformity to ASTM standards" (unbounded, plural) is a **broader** claim
than "conformity to ASTM A967" (one method spec). The packet removed the narrow
one and kept the wide one.

**Why the gate is silent — and this is the structural half of the finding.**
`unauthorised-standard-conformity` is a `scan` that iterates `STANDARD_TOKEN`
matches and only then consults `CONFORMITY_CONTEXT`. `ASTM standartlarına` has
no digits, so `STANDARD_TOKEN` yields nothing, so the scan yields nothing —
even though `CONFORMITY_CONTEXT` matches the sentence perfectly. The conformity
half of the rule fires; the rule never gets to ask it. This is the one
demonstrated gate hole that is **live in the tree**, which is why
`GATE_DEFEATABLE: YES` is a finding here and not merely a hardening note.

---

## G3 (carry-forward, with a blocking condition) — the `metaTitle` residue

```text
servicePages.ts:3037  "… | Rüzgar & Güneş | IEC 61400 | Mas Technic"
servicePages.ts:3079  "… | API 6A | 15000 PSI | NACE MR0175 | Mas Technic"
servicePages.ts:3121  "… | IEC 62271 | 36kV | IACS %99+ | Mas Technic"
```

On all three of those page records, this packet removed the same standards from
the `description`, the `metaDescription`, the `advantages`, the `features` and
the `technicalSpecs` — and left `metaTitle`. Three for three is a pattern, not
an oversight in one place. `d68fe8a` names all four of these standards
explicitly — *"IEC 61400 (wind), IEC 62271 (switchgear), API 6A/6D/5CT and
NACE MR0175 / ISO 15156 (oil and gas) were all published as conformity … None
is in section C"* — and then leaves them in the title of the very pages it is
describing.

Severity is reduced by a fact I verified rather than assumed: **`metaTitle` and
`metaDescription` have no consumer.** `grep` across `src/` outside the data
files returns nothing; there is no `document.title` assignment, no Helmet, no
SEO utility. The strings ship as bytes in the chunk but never reach a rendered
page or a `<title>`.

So this belongs with the canonical / `og:url` / `og:image` carry-forward to
Phase 11 — **with a recorded condition**: the moment Phase 11 wires these
fields into real metadata, four standards this phase deliberately removed
become public SERP claims. Defuse before wiring, not after.

`servicePages.ts:745` (`MIL-A-8625`) and `:1727` (`ISO 2768`) are **not** part
of this finding — see R4b.

---

## R2 — my eleven evasions, and eighteen new attacks

`reports/qa/tools/p06b-gate-evasion.mjs` — 58 single-line probes, each one
ordinary publishable Turkish or the exact source spelling of a lexical evasion,
run against a throwaway tree containing nothing but the gate and the probe file.

```text
prior-evasion    12/12 as expected      ← my eleven, all now caught
positive-control  9/9  as expected      ← no regression
invented-standard 7/7  as expected      ← R3, the new structural property
new-attack        9/18 as expected      ← nine fresh holes
false-positive   12/12 as expected      ← no over-removal
```

Run against the **pre-correction** gate (`6f60a3a`) the same suite reports
**33** misbehaving probes; against the widened gate, **9**. The widening is a
large, real improvement, not a cosmetic one.

### The eleven, closed as a class

Normalisation — zero-width strip, HTML-entity decode, string-concat join,
`${}` interpolation join — closes five of them at once, which is the right
design: it removes the *class*, not eleven more patterns. The other six were
closed by matching claim shape instead of vocabulary. All twelve probe lines
now fire, and the nine positive controls still fire.

### The nine that still get through

| # | Probe | Rule that should have fired | Live in the tree? |
|---|---|---|---|
| D1 | `"Dosyanızı inceleyip 24 saat içinde size döneceğiz."` | `quote-sla-overpromise` — the list has the noun `dönüş`, not the conjugated verb `döneceğiz` | no |
| D2 | `"Teslimat güvencesi veriyoruz."` | `unconditional-guarantee` — `garanti` is matched in every inflection, `güvence` only as `güvence + ediyoruz/veriyoruz/altına`, so the possessive `güvencesi` breaks the `\s+` | no |
| D3 | `"EN 3475 kapsamında üretim yapıyoruz."` | `unauthorised-standard-conformity` — `kapsamında üretim` was **removed** from `CONFORMITY_CONTEXT` in `cd6aa0f` | no |
| D4 | `"EN 9120 yetkinliğine sahibiz."` | same — `sahibiz`, `sahiptir` and `yetkin` were removed from `CONFORMITY_CONTEXT` in `cd6aa0f` | no |
| D5 | `"Her sevkiyat, kontrol planında tanımlananların dışında da tam boyutsal muayeneden geçer."` | `universal-inspection-claim` — the new `(?!…kontrol planında tanımlan)` lookahead is a keyphrase anyone can park inside a universal promise | no |
| D6 | `"15 bin metrekare kapalı üretim alanımız var."` | `company-scale-disclosure` — spelled-out magnitude | no |
| D7 | `"Zamanında teslimat oranımız yüzde doksan sekiz."` | `delivery-or-quality-rate` — spelled-out number | no |
| D8 | `{ title: "ISO 9001:2015", desc: "Sertifikalı kaynakçılarımız ile üretim" }` | `attestation-adjective` — the line-scoped §C exemption is claimed by any `sertifikalı` parked on a line that also names a held certificate | no |
| D10 | `"АS9100D belgemiz vardır."` (Cyrillic А, U+0410) | `unverified-certification` — homoglyph, not folded | no |
| **G2** | `"ASTM standartlarına tam uyum"` | `unauthorised-standard-conformity` — no token, so the `scan` never consults the conformity context | **YES — see G2** |

**Honest weighting.** D6, D7 and D10 are below the bar I set for myself in the
first review ("ordinary, publishable Turkish, correct diacritics") — this
codebase writes numerals, not number-words. I report them for completeness, not
as blockers. D3 and D4 deserve a different note: those phrases were **present
in `CONFORMITY_CONTEXT` before this packet and were deleted from it** in
`cd6aa0f`. That is a narrowing inside a commit whose purpose was widening, it
costs nothing to restore, and `EN ISO 3834-2 kapsamında üretim` is the literal
shape of copy that was live two commits earlier. D1, D2, D5 and D8 are holes
the new rules created or left in the shape they were written for. **G2 is the
only one that is live, and it is why this is a FAIL.**

One incidental observation, offered because it makes D10 less theoretical than
it looks: this codebase already contains accidental Cyrillic homoglyphs —
`src/hooks/useProcessProofCinema.ts:20` and `:44` both spell `talаş` with
U+0430. Both are inside comments and neither is a claim, so nothing is wrong
today; it simply shows the character class arrives by typo, not only by malice.

---

## R3 — the allow-list property, tested hardest

This is the change that matters most, and it holds.

| Probe | Fired | Rule |
|---|---|---|
| `"ISO 27893 standardına uygun üretim yapıyoruz."` | yes | `unauthorised-standard-conformity` |
| `"EN 4956-3 sertifikalı proseslerimiz bulunmaktadır."` | yes | + `attestation-adjective` |
| `{ label: "Sertifika", value: "ASME B99.7" }` | yes | `unauthorised-standard-conformity` (label/value path) |
| `"MAS 1000 kapsamında akredite üretim tesisiyiz."` | yes | `attestation-adjective` |
| `"Sertifikalı kaynakçılarımız ile üretim yapıyoruz."` | yes | `attestation-adjective` — **no standard number at all** |
| `"Belgeli operatör kadrosu ile çalışıyoruz."` | yes | `attestation-adjective` |
| `"Akredite laboratuvarımızda ölçüm yapıyoruz."` | yes | `attestation-adjective` |

`ISO 27893`, `EN 4956-3`, `ASME B99.7` and `MAS 1000` appear nowhere in this
codebase. Against the **pre-correction** gate all seven are silent. A deny-list
could not have caught any of them, and `attestation-adjective` catching three
claims that carry no designation is the sharper half of the same idea.

**And it does not over-fire.** Twelve false-positive controls — `ISO 2768-m` as
a tolerance class, `ASME B16.5` as an interface geometry, `ASTM B117` as a test
method, `MIL-A-8625` as a coating class, `ISO 9001:2015` said correctly, the
§D-authorised `akredite üçüncü taraf CMM` phrasing, the `her partide, kontrol
planında tanımlanan` conditioning clause, `5 eksen / 3 vardiya`, "malzeme
sertifikası talebe bağlı", `en iyi işlenebilir paslanmaz`, `1-3 iş günü`, and
`%100 IACS` — are **all silent**. That matters as much as the catches: §0 puts
`PRECISION_ENGINEERING` first, and a rule that cries wolf on correct
engineering copy gets switched off.

I also confirmed the exemption is not doing quiet work: only **one** line in the
whole tree relies on the `attestation-adjective` §C line-scoped exemption
(`TeklifAl.tsx:1348`, `{ title: "ISO 9001:2015", desc: "Sertifikalı kalite
yönetim sistemi" }`), and that is a certificate MAS actually holds. D8 is
therefore a latent hole, not a live one.

---

## R4 — the three judgement calls

### (a) `EN 10204 3.1` withheld — **reasoning sound, execution incomplete: FAIL**

The reasoning is right. EN 10204 3.1/3.2 names a *certificate class a buyer's
own file depends on*; publishing it asserts a document chain §C does not
supply, and "material certificate + lot record, on request" says what actually
happens without naming an undeclared standard. Practice unchanged, claim
removed — correct.

But it was carried out in one place, and that place is `RestoredLandingSections.tsx`,
which reaches production only through the **dev-only** `/legacy-landing` route
and does not ship. The two public surfaces — the certificate matrix (G1) and
the `boru-baglanti-parcalari` prose, the latter correctly fixed — were handled
inconsistently. G1 is the residue.

### (b) `MIL-A-8625 Tip II`, `ASME B16.5`, `ISO 2768-m`, `ASTM B117` kept — **the line is drawn correctly: PASS**

Yes, and I would defend this against pressure to remove more.

Each of the four names *what a part or a process is*, not *what the company is
audited to*: `MIL-A-8625` is the Type I/II/III anodising coating class,
`ASME B16.5` is a flange interface geometry, `ISO 2768-m` is a general tolerance
class, `ASTM B117` is the salt-spray test method. A precision manufacturer that
cannot name a tolerance class has nothing to say. §0
`PUBLIC_POSITIONING_PRIORITY` lists `PRECISION_ENGINEERING` first and
`COPY_STRATEGY: CAPABILITY_AND_EVIDENCE_OVER_COMPANY_SIZE` points the same way:
over-removal is a real cost, not a free safety margin.

The test is whether the distinction is *enforced* rather than merely asserted,
and it is. The rewrites carry it in the wording — `{ label: "Standart", value:
"MIL-A-8625" }` became `{ label: "Kaplama Sınıfı", value: "MIL-A-8625 Tip I / II
/ III" }`; `{ label: "Standartlar", value: "ASTM B117" }` became
`{ label: "Test Yöntemi", … }`; `"ASME B16.5 uyumlu"` became `"ASME B16.5
geometrisinde"`; `{ label: "Standart", value: "ISO 4401" }` became
`{ label: "Delik Düzeni", … }`. The noun changed from *what we conform to* to
*what this is*. And the gate enforces the boundary: my probes E1–E4 stay silent
on the reference form and `CONFORMITY_CONTEXT` fires the moment the copy wraps
the same token in `uygun` / `uyum` / `sertifika`. The `CONFORMITY_BY_NATURE`
backstop is scoped to management-system and personnel/procedure qualification
schemes only, which is the correct set.

The two `metaTitle` uses at `:745` (`MIL-A-8625`) and `:1727` (`ISO 2768`) are
consistent with the body copy on those pages and are **not** part of G3.

### (c) `24 saatte ilk parça` = delivery lead time — **sound: PASS, carry-forward**

Four occurrences, all on `/hizmetler/silikon-kaliplama`, all describing
first-article delivery from a master model in vacuum casting. §J `QUOTE_SLA:
1-3 Days` and §D `QUOTE_RESPONSE_TIME_INTERNAL` govern *quote turnaround*;
neither speaks to production lead time, and no `USER_INPUTS.md` field does. The
gate's rule comment says so explicitly and the rule is built to let it through
(the strings carry no quote vocabulary), which is honest rather than convenient.

So it is correctly classified, and it joins the existing carry-forward class of
commercial promises with no `USER_INPUTS.md` field — alongside the ~85 lead-time
day-ranges, the volume-discount schedule, the 7-day returns window and
"3 iterasyonlu revizyon döngüsü". One thing worth recording for whoever
eventually decides that class: at 24 hours this is the **tightest** uncovered
promise on the site, and it is the only sub-day one.

---

## R5 — the chatbot regression: NEEDS_FIX, and it is worse than disclosed

Measured, not argued. `reports/qa/tools/p06b-chat-routing.mjs` bundles
`src/data/chatFaqData.ts` with the project's own esbuild and calls the **real**
`findBestFaqMatch` over the **real** 140-entry corpus (static + service-page
FAQs), so `collectServiceFaqs()` contributes too.

| Query | Result |
|---|---|
| `garanti` | **no match** → AI-consent prompt |
| `garanti veriyor musunuz` | → **"Tasarım desteği veriyor musunuz?"** (score 0.67) — the DFM answer |
| `garantiniz var mı` | **no match** → AI-consent prompt |
| `güvence veriyor musunuz` | → **"Tasarım desteği veriyor musunuz?"** (score 0.67) |
| `warranty` | → "İade veya değişim yapılabiliyor mu?" (1.00) ✓ as claimed |
| `sorumluluk` | → "İade veya değişim yapılabiliyor mu?" (1.00) ✓ as claimed |
| `iade` (control) | → returns answer (1.00) ✓ |
| `hatalı parça gelirse ne olur` | no match |
| `ölçü tutmazsa ne yapıyorsunuz` | no match |

Entries whose keywords or question still contain `garanti`/`güvence`: **0**.

**Assessment.**

1. Removing the answer was **right and must not be undone.** It promised an
   unconditional conformity guarantee plus free re-manufacture; no
   `USER_INPUTS.md` field authorises either, and §D grants capability figures,
   not promises. Restoring the *answer* would re-introduce the fabrication.
2. The disclosure understates the residue. The Coder reported that a Turkish
   user asking "garanti" "falls through to the default reply". For the bare word
   that is true. For the natural sentence — `garanti veriyor musunuz`, which is
   exactly how the removed FAQ was worded — the matcher scores the **DFM design-
   support** entry at 0.67 on the shared question words `veriyor`/`musunuz` and
   answers it confidently. A wrong confident answer to the most commercially
   loaded question on the site is worse than no answer, and it is attributable:
   before the removal the guarantee entry scored 1.00 and won.
3. It is a **routing** defect, not a truth defect. Nothing false is asserted
   about warranty; the buyer is simply sent to the wrong page of the manual.
4. The fix requires no claim. The returns entry already carries true, authorised
   copy. The only blocker is that the *keyword* `garanti` cannot live in
   `src/data` without firing `unconditional-guarantee` — and a `keywords: []`
   array is matcher input, not published copy. Two clean routes: a documented,
   narrow rule exemption for keyword arrays, or hold the keyword list outside
   the gate's `ROOTS`. Either is a gate change, not a content change.

For fairness: the matcher mis-routes on unrelated intents too — my control
`teklif ne kadar sürede gelir` lands on "Malzeme tedarik süreniz ne kadar?" at
score 1.00. Substring matching in both directions over 140 entries is a
pre-existing weakness and **not** something this phase introduced. Only the
`garanti` case is attributable here.

**Verdict: NEEDS_FIX.** It does not block Phase 06's truth criteria and the
Orchestrator may schedule it; it must not be closed on the "falls through to
default" description, which is not what happens.

---

## R6 — the goldens: PASS, and better than reported

`reports/qa/tools/p06b-golden-audit.mjs` decodes every golden in the set with
its own PNG decoder (no image library in the repo) and reports, per file, the
exact channel diff, the pixelmatch YIQ diff at Playwright's default
`threshold: 0.2` (what `maxDiffPixels: 200` actually sees), the offset in
`[-4..+4]` that minimises the difference, and the change bounding box.

```text
45 goldens:  changed 21   byte-identical 24
             minimising at a NON-ZERO offset: 0
             masked by maxDiffPixels:200:     0
```

| Claim | Measured |
|---|---|
| control group of 18 `shell-header-*` + 6 `navigation-*` byte-identical | **confirmed — exactly 24, all 0 changed px** |
| all 21 minimise at **+0** | **confirmed — 0 of 45 minimise at a non-zero offset** |
| 375: `x[59..313]`, 3,840 raw / 2,428 pm | confirmed — raw **3,840 on all seven surfaces, exactly**; pm 2,428 (2,429 on landing) |
| 1280: `x[81..408]`, 5,783 / 4,009 | confirmed — raw **5,783 on all seven, exactly**; pm 4,006–4,011 |
| 1440: `x[81..449]`, 7,066 / 4,888 | confirmed — raw **7,066 on all seven, exactly**; pm 4,888 on all seven |
| all far above `maxDiffPixels: 200` | confirmed — 2,428–4,888, **nothing masked** |
| driven by one word, same character count | confirmed — `KANITLANMIŞ` and `İZLENEBİLİR` are both 11 characters |

The raw counts being **identical to the digit** across seven independent
surfaces per width is the proof that one component changed and nothing else
did. The pm counts differ by ≤5 because the footer lands at a slightly
different `y` inside each crop and antialiasing resolves differently — the
Coder quoted single figures; the small spread is in the honest direction.

I then read the band rather than trusting the numbers. Cropping
`shell-footer-home@1440` rows 30-110 from both blobs:

```text
old:  HASSAS ÜRETİM.  /  KANITLANMIŞ TESLİM.
new:  HASSAS ÜRETİM.  /  İZLENEBİLİR TESLİM.
```

Line 1 unchanged, no reflow, and the four navigation columns to the right are
pixel-identical — consistent with the bounding box stopping at x≈448 on a
1440 px crop.

### `landing-fullpage@1440`

The packet asks me to verify the `188,615 → 181,549 run-to-run noise → 7,066`
reasoning with my own decoder. **The reasoning turns out to be unnecessary.**
Decoding the two *committed* blobs directly:

```text
old 1440x3973   new 1440x3973        (height unchanged — nothing truncated)
raw 7,066   pm 4,888   best offset +0   bbox x[82..449] y[3722..3764]
```

7,066 raw / 4,888 pm, in a single 43-row band at the footer — identical to the
six `shell-footer-*@1440` crops. Whatever an intermediate capture read, the
artefact that was committed differs from its predecessor by exactly the footer
band and nothing else, so the noise story is not load-bearing and I neither
confirm nor need it. Same at 1280 (`y[3664..3702]`) and 375 (`y[8135..8164]`).

**No golden hid a non-content change.** One narrower correction: the commit
message for `cd6aa0f` states the `EN 10204` edit in
`RestoredLandingSections.tsx` "moves landing-fullpage pixels". It does not —
that component is dev-only, the landing goldens changed in one band, and the
band is the footer. The claim over-attributes pixel motion; it hides nothing.

My prior advisory **A1 stands and is now sharper**: at 375 the footer word swap
produces 2,428 pm px, comfortably over the threshold — but the earlier social-
icon removal produced only 79 px and was masked on five of six surfaces. A flat
`maxDiffPixels: 200` applied to crops from 375×64 to 1440×4,119 is still the
wrong shape. Not a Phase 06 blocker, not mine to implement.

---

## R7 — red baseline, suites, Phase 01–05 guarantees

### Red baseline reproduced exactly

`git archive 75629f3 src index.html public` into a clean directory, current
gate dropped beside it:

```text
# scanned:  222 files, 29216 non-comment lines
FAIL — 767 claim violation(s), 1 resource problem(s).
```

**767**, matching the re-measured figure exactly (it was 562 under the older
rules — the delta is the widening, not drift). Post-correction the same script
returns `PASS — 0 unverified claims across 25 rules` over 207 files / 26,060
non-comment lines. Red to green reproduces.

### Anti-laundering, run independently and more broadly

The Orchestrator swapped the pre-fix `servicePages.ts` into the fixed tree and
saw 117. I ran the stronger version: the **entire** pre-correction tree at
`6f60a3a` — the tree I failed — scanned with the **fixed** gate:

```text
### quote-sla-overpromise — 2            ### unconditional-guarantee — 16
### delivery-or-quality-rate — 7         ### universal-inspection-claim — 7
### company-scale-disclosure — 15        ### unauthorised-standard-conformity — 62
### proof-by-nonexistent-evidence — 7    ### attestation-adjective — 11
FAIL — 127 claim violation(s)
```

**127 → 0.** The gate was not neutered to reach zero; if it had been, the tree
I failed would also read low. The class breakdown maps onto my findings
one-for-one — F1 (2), F4 (7), F5 (7), F6 (**16**, exactly the "~16 live
occurrences" I estimated by hand), F7 (62+11, far more than the 7 I enumerated).
The content was fixed, not the gate.

### Suites

All on `da5a3e0`, `PLAYWRIGHT_PREVIEW_ONLY=1` against one `npm run build`, one
suite at a time.

| Check | Result |
|---|---|
| `npm run build` | exit 0 |
| `npm run typecheck` (app + node + e2e) | exit 0 |
| `node scripts/claims-gate.mjs` | **PASS — 0 across 25 rules**, 207 files / 26,060 non-comment lines |
| `test:e2e:critical` (`critical-1280` + `critical-375`) | **163 passed, 3 skipped, 0 failed** (27.2 min), exit 0 |
| `test:e2e:visual` (375 / 1280 / 1440) | **27 passed, 0 failed** (7.5 min), exit 0 |
| `test:e2e:smoke` (webkit + firefox, 1440 + 390) | **11 passed, 1 failed** → **12/12 on isolation**, see below |
| `motion-audit --mode=guard` | PASS — every motion call site goes through `@/components/shell/motion` |
| `grid-axis-probe` | **PASS — every measured edge on a master axis, 0 off-grid** (1 px tolerance) |
| `motion-audit --mode=rest` (B28) | **PASS — `hiddenText=0` on every route and viewport** |

Totals: **202 passed, 0 failed, 3 skipped.** The three skips are the same
pre-existing width-conditional `shell-cascade-contract` cases as before, not
new suppressions.

**The one smoke failure, honestly.** `smoke-firefox-390 › renders the complete
landing and hands off the intro shell` failed once in the four-project run.
Re-run alone: **3 passed (38.1 s), exit 0.** Four browser projects sharing a
machine with roughly a gigabyte free is the explanation; by the rule I am
working to, a failure that does not reproduce in isolation is environmental. I
record it rather than hide it, and I am not counting it against the phase.

Phase 01–05 guarantees all hold: dev routes still 404 in the production build,
the claims-gate self-check (which requires the gate to reject a reintroduced
`AS9100D`) is inside the 163 and passes, grid axes 0 off-grid, and B28 at rest
reports `hiddenText=0` with only text-free decorative gradient overlays hidden.

### Runtime confirmation of the findings

A string in `dist/` is delivered bytes; a string in the DOM is a claim a buyer
reads. `reports/qa/tools/p06b-runtime-claims.mjs` loads the built site in a
real browser and reads them off the rendered page:

```text
/hizmetler/malzeme-kutuphanesi  [200]  "EN 10204 3.1"   PRESENT IN DOM
                                       "EN 10204 3.2"   PRESENT IN DOM
                                       "Tedarik Süresi ve Sertifika Matrisi"  PRESENT IN DOM
                                       "Talebe bağlı"   PRESENT IN DOM   ← the contradiction, on one page
/hizmetler/kimyasal-islemler    [200]  "ASTM standartlarına tam uyum"     PRESENT IN DOM
/hizmetler/qr-datamatrix-kodlari[200]  "ISO/IEC standartlarına tam uyum"  PRESENT IN DOM
/hizmetler/petrol-gaz  (control)[200]  "NACE MR0175"            absent ✓
                                       "sour service sertifikalı" absent ✓
```

G1 and G2 are not grep artefacts. They render.

The control threw up one useful extra: `API 6A` **is** in the DOM of
`/hizmetler/petrol-gaz`, but not as conformity — the sentence reads "boru
bağlantı parçaları (**API 6A flanş, hub**)", which names a wellhead flange
geometry exactly the way `ASME B16.5 geometrisinde` names a flange facing.
That is the R4(b) line applied correctly, on a page where the conformity forms
were removed. It is not a finding; it is evidence the distinction is real.

### Test-integrity check

`git diff --name-only 6f60a3a da5a3e0 -- e2e/` excluding `__golden__` returns
**nothing**. Not one spec was touched. No assertion weakened, no tolerance
widened, no skip or `xfail` added, no coverage deleted. The only `e2e/` change
in the whole packet is the 21 golden PNGs, adjudicated above.

---

## Scope integrity

- Production files modified by QA: **NONE**.
- QA writes, all inside `QA_WRITE_ALLOWLIST`: this report and
  `reports/qa/tools/{p06b-gate-evasion,p06b-table-body-scan,p06b-chat-routing,p06b-golden-audit,p06b-runtime-claims}.mjs`.
  Every probe tree was built under the scratch directory, never in the repo.
- No golden regenerated, deleted or edited by QA.
- Coder scope across the five commits: `scripts/claims-gate.mjs`, ten `src/`
  files, 21 goldens. None of `package.json`, `.github/**`, `supabase/**`,
  `/admin/*`, `/musteri-paneli/*`, `PROGRESS.md`, `IMPLEMENTATION.md`,
  `USER_INPUTS.md`, `playwright.config.ts`, `index.html`.
- Commit ordering: `4df8ff3` is gate-only, as reported. Two later commits
  (`cd6aa0f` +43, `d68fe8a` +214 lines) also amend the gate alongside content.
  I verified those amendments: they are widenings plus two false-positive
  fixes, except for the `CONFORMITY_CONTEXT` phrases noted under D3/D4.

**SCOPE_INTEGRITY: PASS.**

---

## What must be true before this phase closes

Two changes. Both are small, both are on one file, and neither requires a new
fact.

1. **`servicePages.ts:1594-1603`** — the `Sertifika` column of "Tedarik Süresi
   ve Sertifika Matrisi" must stop publishing `EN 10204 3.1` / `3.2` / `CoC`.
   The page's own corrected wording ("Talebe bağlı", "malzeme sertifikası ve
   lot bazlı kayıt") is the answer, and the column heading may need to become
   what it actually is (e.g. `Kayıt`). The table's five other columns are fine.
2. **`servicePages.ts:888` and `:1118`** — `"ASTM standartlarına tam uyum"` and
   `"ISO/IEC standartlarına tam uyum"` must go the same way the numbered
   versions on those two pages already went: name the method, not the audit.

And two gate changes, which matter more than the two strings — fix only the
strings and the next copy edit puts them back:

3. **`unauthorised-standard-conformity` must fire on a standards BODY named
   without a designation.** `(ASTM|ISO|EN|ASME|AWS|API|IEC|DIN|MIL|NACE|
   TSE?)\s+(standart|norm|spesifikasyon)…` in conformity context, with no token
   required. This is the hole G2 walks through, and it is the only demonstrated
   hole that is live.
4. **Table bodies need a rule.** A `headers`/`rows` pair whose column heading
   matches `sertifika|belge|standart|akredit|uygunluk|onay` makes every cell in
   that column a claim. `reports/qa/tools/p06b-table-body-scan.mjs` is the
   check; it belongs in the gate, not in QA's tools directory.

Cheap and worth taking while the file is open, in rough priority order:
restore `kapsamında üretim`, `sahibiz`, `sahiptir`, `yetkin` to
`CONFORMITY_CONTEXT` (D3/D4 — a narrowing this packet introduced); reach the
conjugated return verbs in `quote-sla-overpromise` (D1); give `güvence` the
same inflection treatment `garanti` already has (D2); scope the
`kontrol planında tanımlan` exclusion to the start of the clause rather than
anywhere in the next 40 characters (D5); make the `attestation-adjective` §C
exemption require the certificate and the adjective to be in the same string
literal (D8); decide the chatbot keyword question (R5); and record G3 against
Phase 11 with the condition that the four `metaTitle` standards are removed
before route metadata is wired.

## Verdict

The gate is now a real barrier and the allow-list is the right design — the
invented-standard probes prove a property the previous rule set could not have
had, and the false-positive controls prove it was not bought by over-removal.
127 live claims on the tree I failed, 0 on the tree I am reviewing, with the
same script, is the strongest single piece of evidence in this phase.

It is still a FAIL, and for a reason worth stating plainly rather than as a
scorecard: **the sweep was driven by the gate, so it inherited the gate's blind
spots.** Both content commits say so in their own words — `cd6aa0f`:
*"everything below was flagged by the gate, not by hand"*; `d68fe8a`: *"Every
string below was flagged by the gate."* That is a sound method and it is why
the packet found three guarantee sites I had missed. It is also why the two
survivors are exactly the two shapes the gate cannot see. The gate reads
tokens, so the claim that names no token survived; the gate reads object
literals — `d68fe8a` even fixed `{ label: "Sertifika", value: "EN 1090" }` as
its own claim shape — so the claim that lives in a `headers`/`rows` table body
survived, on the same page, in the same commit.
Both survivors sit inches from copy this packet corrected, and one of them
contradicts its own page. That is a narrower failure than the first one — two
strings instead of thirty — but it is the same failure, and the fix that
matters is the two gate rules, not the two strings.

---
---

# QA Report — Phase 06 RE-VERIFICATION #2 (after correction packet #2)

- PHASE: 06 — CONTENT TRUTH, EVIDENCE MODEL AND CASE-STUDY DATA
- STATUS: **PASS**
- CODE_COMMITS: `45b9eae`, `35ef1ec`, `2c4b124` (integration HEAD `2c4b124`)
- PRIOR QA: `6f60a3a`/`853b09f` FAIL, `3747db5` FAIL
- QA_COMMIT: `2b904c1`, `9940e9f`, `1e5d746`, and this report
- SCOPE_INTEGRITY: PASS
- FABRICATION_REMAINING: **NONE**
- GATE_DEFEATABLE: **NO** (no demonstrated evasion is reachable in this tree; four hardening notes recorded)
- TABLE_RULE_LINE: **CORRECT**
- COVERAGE_REGRESSION: **NONE**
- CHATBOT_REGRESSION: **FIXED**

## Headline

Both blind spots are closed at the level they were opened, the two claims are
gone from source, from `dist/` and from the rendered DOM, and the two things I
was most likely to be wrong about — the table rule and the coverage diff — I
was wrong about one of them. The Coder declined my proposed table rule and gave
a reason; the reason is right, and the eleven cells my own scanner still reports
are the eleven I would have destroyed.

Three numbers carry this verdict:

| | |
|---|---|
| gate on this tree | **PASS — 0 across 26 rules**, 207 files, 26,068 non-comment lines |
| my 58 evasion probes, harness **unmodified** since `3747db5` | **58/58**, including **18/18** attacks (was 9/18) and **12/12** false-positive controls silent |
| previous gate vs corrected gate over the whole pre-Phase-06 red tree, diffed by violation SET | 767 → 788, **1 line lost**, and it is the documented one |

## Re-verification matrix

| Req | What I had to establish | Verdict | Evidence |
|---|---|---|---|
| R1 | G1, G2 and the shipped `EN 10204` path are gone from `src/**` and `dist/**` | **PASS** | grep + fresh build + rendered DOM; 16 document cells walked |
| R2 | 18/18 on my unmodified harness, then attack again | **PASS** | 58/58; 8 new evasions found, **none reachable in this tree** |
| R3 | Adjudicate the table-rule disagreement | **CORRECT — the Coder's line, not mine** | the 11 cells are method standards; my own E3/E4 controls demand they stay |
| R4 | No rule silently lost coverage, rule by rule, whole red tree | **PASS — NONE** | set diff, not count diff; 26 of 27 rules identical line for line |
| R5 | The chatbot fix, and the disclosed stopword shrink | **FIXED** | A/B over 165 queries; sensitivity ladder reproduces the discarded failure |
| R6 | G3 fixed and gated; an uninvented designation still fires in a title | **PASS** | `metaTitle` pass fires on `ISO 41822-7`; `ISO 2768-m` and `ISO 9001` silent |
| R7 | Suites, goldens, Phase 01–05 guarantees | **PASS** | critical 163/3/0, smoke **12/12**, visual 27/27, zero goldens changed |

---

## R1 — the two claims are gone, in all three places a claim can live

### Source

Every surviving occurrence in `src/**` is inside a `/* … */` ledger comment
recording why the string went. There is no live occurrence of any of them:

```text
EN 10204 / EN10204        src: 3 hits, all in comments (RestoredLandingSections.tsx:18,
                               servicePages.ts:1613, :1617)
tam uyum                  src: 2 hits, both in comments (servicePages.ts:894, :1133)
IPC-A-610 / ISO 1413      src: 1 hit,  in a comment (servicePages.ts:296)
ISO Uyum Raporu           src: 1 hit,  in a comment (servicePages.ts:1124)
```

### `dist/`, from a build I made myself

`npm run build` on the clean tree, then a byte sweep of `dist/`:

```text
EN 10204   0    IEC 61400    0    AS9100       0
EN10204    0    IEC 62271    0    IATF 16949   0
tam uyum   0    NACE MR0175  0    ISO 13485    0
IPC-A-610  0    ISO Uyum     0
ISO 1413   0    API 6A       1  <- adjudicated below
```

`API 6A` survives once, in `servicePages.ts:3110`:
`"boru bağlantı parçaları (API 6A flanş, hub)"`. That names the flange's
dimensional family the way `ANSI, DIN ve JIS standartlarında boru bağlantı
parçaları` does — the exact locative construction I told the Coder to keep, and
the same class as `ASTM B117` and `MIL-A-8625` in R4b. There is no conformity
predicate anywhere in the sentence. **Correctly kept.** It is also gone from the
`metaTitle` of that page, which is what G3 was about.

### The rendered page — `reports/qa/tools/p06c-matrix-runtime.mjs`

A grep over `dist/` proves bytes. A table proves the claim. This walks every
rendered `<table>` on the six touched routes, finds each DOCUMENT column by its
heading and prints **every** cell under it, so a partial fix cannot pass as a
whole one:

```text
/hizmetler/malzeme-kutuphanesi
  ["Malzeme Grubu","Standart Tedarik","Acil Tedarik","Sertifika","Min. Sipariş"]
    Alüminyum (6061, 7075)      -> "Talebe bağlı"
    Paslanmaz Çelik (304, 316)  -> "Talebe bağlı"
    Karbon Çelik (1045, 4140)   -> "Talebe bağlı"
    Titanyum (Gr2, Gr5)         -> "Talebe bağlı"
    Inconel / Hastelloy         -> "Talebe bağlı"
    PEEK / Yüksek Perf. Plastik -> "Talebe bağlı"

/hizmetler/hassas-mikro-isleme
  ["Sektör","Tipik Parça","Tolerans Beklentisi","Yüzey Beklentisi","Belge Beklentisi"]
    Medikal     -> "Biyouyumlu malzeme kaydı"    Havacılık    -> "İzlenebilir malzeme kaydı"
    Elektronik  -> "Görsel kabul kriteri"        Saat & Optik -> "Ölçüm kaydı"
    Otomotiv    -> "Parti izlenebilirliği"

/hizmetler/kalite-kontrol
  ["Özellik","Tipik Yöntem","Ne Zaman Akredite CMM Gerekir"]   5 cells, all conditions

document-column cells checked: 16, violating: 0
withdrawn strings found in rendered text: 0
```

**One story, verified rather than asserted.** On
`/hizmetler/malzeme-kutuphanesi` the six matrix cells, the spec row
`{ label: "Sertifika", value: "Talebe bağlı" }` (`:1559`), the page description
(`:1546`) and the page FAQ (`:1592`) now give a buyer the same answer. That was
the whole of G1: the page previously answered its own question two ways and the
surviving answer was the stronger one.

The G2 pair is absent from the DOM of both pages (`p06b-runtime-claims.mjs`,
unmodified), replaced by what those pages' own content lines already said
happens — the two test methods, and the read verification after laser marking.

**Sweep, not spot-fix.** The Coder found the same shape a second time without
being told: `"Sektörel Mikro İşleme Gereksinimleri"` published `IPC-A-610` and
`ISO 1413` under a `Sertifika` heading whose other three cells already
described the expectation. The heading is now `Belge Beklentisi` and it is
**deliberately still a document column**, so the gate keeps watching it — which
is why my runtime tool finds it and checks all five cells.

---

## R2 — 18/18, then eight new evasions, none of them reachable

### The unmodified harness

`git diff 3747db5 HEAD -- reports/qa/tools/p06b-gate-evasion.mjs` is empty.
Run against the corrected gate:

```text
prior-evasion     12/12    invented-standard  7/7
positive-control   9/9     new-attack        18/18   <- was 9/18
false-positive    12/12
PROBE PASS — every probe behaved as specified.
```

The twelve false-positive controls staying silent matters as much as the
eighteen catches. `ISO 2768-m`, `ASME B16.5`, `ASTM B117`, `MIL-A-8625`, the
§D-authorised third-party CMM sentence, the conditioning clause and `%100 IACS`
are all still silent. The teeth were not bought with over-removal.

### Attack 19 — `reports/qa/tools/p06c-attack19.mjs`, 31 new probes

A harness that scores 58/58 no longer discriminates, so I wrote a second one.
It takes **multi-line** probes, so a `headers`/`rows` block can be attacked as
the structure it is rather than as a line.

Eight probes found gate holes:

| # | Shape | Why the gate is silent |
|---|---|---|
| F1 | `"AS9100D belgemiz vardır."` | the normaliser decodes HTML entities, zero-widths, concatenation and interpolation — not **JS string escapes** |
| F2 | `"A\x539100D sertifikamız…"` | same |
| F3 | `ⅠATF 16949` (U+2160 ROMAN NUMERAL ONE) | the homoglyph fold covers Cyrillic and Greek only |
| F4 | `AᏚ9100D` (U+13DA CHEROKEE LETTER S) | same |
| G1 | document column headed `Kalite Kaydı`, cell `CoC` | `DOCUMENT_COLUMN` is a fixed six-noun list; a synonym heading escapes it |
| G3 | column headed `Sertifika`, cell `Havacılık onaylı` | `CELL_ATTESTATION` has `sertifikal\|belgeli\|akredite\|CoC` but not `onaylı` |
| H1 | `"Uluslararası havacılık standartlarına göre üretim yapıyoruz."` | `BODY_FAMILY_REFERENCE` needs a named body; "international aviation standards" names none |
| H2 | `"Kalite yönetim sistemimiz üçüncü taraf denetiminden başarıyla geçmiştir."` | an audit asserted with no certificate and no body |

**Are any of them live? No.** This is the test I set for myself in the last
report — `GATE_DEFEATABLE: YES` was a finding then *because G2 was live in the
tree* — and I have to apply the same bar now.
`reports/qa/tools/p06c-homoglyph-sweep.mjs` reports every Latin-confusable
**letter** and every `\uXXXX`/`\xXX` escape across the gate's own 207 files:

```text
U+0430 'а' x2   useProcessProofCinema.ts:20,44  — "talаş", the disclosed typo,
                                                  in a comment, and now folded
U+03BC 'μ' x2   TeklifAl.tsx:253, HowWeWorkSection.tsx:60 — the micron unit,
                                                  deliberately NOT folded
U+0394 'Δ' x3   servicePages.ts — "ΔE <= 2.0", colour difference
escapes    x2   SectionHeader.tsx:17 — a slug regex character class
```

Not one is a claim carrier. For G1/G3/H1/H2 I swept the same way: every
`onaylı` / `belgeli` / `akredite` / `CoC` occurrence in `src/**` is either a
materials fact (`FDA onaylı` plastic grades), a customer approval (`Onaylı
tasarımlar`), the §D-authorised `akredite üçüncü taraf … talebe bağlı` form, or
the §C-held `ISO 9001:2015 · Sertifikalı kalite yönetim sistemi`. The only
`standartlarında` in the tree is the ANSI/DIN/JIS locative I adjudicated to
keep. There is no `üçüncü taraf denetim` claim anywhere.

So: **GATE_DEFEATABLE: NO.** These eight are hardening notes for whoever
touches the gate next, not defeats. Ranked by how cheaply a real edit could
walk into one: G3 (`onaylı` in a cell) and G1 (a synonym heading) are ordinary
Turkish a copywriter would reach for without meaning anything by it; F1–F4 need
deliberate obfuscation.

---

## R3 — the disagreement, adjudicated against myself

**The Coder is right and I was wrong.** My proposed rule — §C applies to every
cell under any `Sertifika`/`Standart` column — would have deleted real
engineering content, and §0 `PUBLIC_POSITIONING_PRIORITY: PRECISION_ENGINEERING`
makes that a failure, not a conservative choice.

`p06b-table-body-scan.mjs` (my tool, unmodified) reports **11** where it
reported 18. I ran it against the verbatim `servicePages.ts` from `3747db5` to
enumerate the difference rather than assume it: 18 = 11 + 6 (`EN 10204 3.1` x3,
`3.2` x2, `CoC` x1) + 1 (`ISO 1413`). The seventh removal, `IPC-A-610`, my own
`STANDARD_TOKEN` never matched — `IPC` is not in its body list — so my scanner
under-counted the very shape it exists to find. The Coder removed it anyway.

All 11 survivors are in a `Standart` column, in two tables, and both are
**method comparison tables**:

```text
"Kimyasal Yüzey İşlem Yöntemleri"   headers: [..., "Standart", "Uygulama"]
  Pasivasyon (Nitrik)  -> ASTM A967       Fosfatlama (Çinko)  -> MIL-DTL-16232
  Pasivasyon (Sitrik)  -> ASTM A967       Fosfatlama (Mangan) -> MIL-DTL-16232
  Elektropolish        -> ASTM B912       Alodine (Chromate)  -> MIL-DTL-5541

"NDT (Tahribatsız Muayene) Yöntemleri"   headers: ["Yöntem","Kısaltma",...,"Standart"]
  Radyografik Test RT -> EN ISO 17636     Ultrasonik Test   UT -> EN ISO 17640
  Penetrant Test   PT -> EN ISO 3452      Manyetik Parçacık MT -> EN ISO 17638
  Görsel Muayene   VT -> EN ISO 17637
```

The row's subject is **the method, not MAS**. `EN ISO 17636` *is* the
radiography standard; `ASTM A967` *is* the nitric passivation standard. Naming
it states a fact about the method and asserts no audit — there is no conformity
predicate anywhere in either table. That is precisely the class I adjudicated
correct to keep in R4b for `ASTM B117` and `MIL-A-8625`, and it is the class my
own harness pins as **PASS controls E3 and E4**. My rule would have contradicted
my own harness.

The two-column-kind distinction is the right cut, and it is stated in the code
rather than implied: a DOCUMENT column names something MAS issues, so §C applies
to every cell and a bare `CoC` with no designation fires; a SPECIFICATION column
names which spec governs the row, so its cells are tested as prose tokens and
fire only on a management-system or qualification scheme — `AS9100D` parked in a
`Standart` column still fires. I confirmed the silent side independently with
probes M1–M3 and M8, and the firing side with G2.

**TABLE_RULE_LINE: CORRECT.** No cell in the 11 should fire.

---

## R4 — the self-caught instrument regression, verified independently

`reports/qa/tools/p06c-coverage-regression.mjs`. The Coder's principle — *a gate
that reports fewer claims on a known-red tree is the same failure as one that
reports zero on a live one* — is right, and it deserves a stricter instrument
than the count comparison it was found with. **A count diff hides a rule that
gains three hits and loses three.** So this diffs the violation **sets**, keyed
`rule@file:line`, running both gate builds over the same tree.

Tree: `75629f3`, the pre-Phase-06 red baseline, 222 files / 29,216 lines.

```text
prev:  FAIL — 767 claim violation(s)      new:  FAIL — 788 claim violation(s)

26 of 27 rules: identical, line for line, LOST 0 / GAINED 0
  attestation-adjective     43=43    machine-inventory         117=117
  certifying-body            8=8     process-capability-metric  72=72
  company-scale-disclosure  42=42    <- the disclosed regression, restored
  tolerance-beyond-verified 88=88    universal-inspection-claim 33=33
  unverified-certification  61=61    quote-sla-overpromise      12=12
  ...

table-column-attestation            0 ->  11   (+11 gained, 0 lost)
unauthorised-standard-conformity  144 -> 155   (+11 gained, 0 lost)
unconditional-guarantee            29 ->  28   ( 0 gained, 1 LOST)
```

**The one lost line, in full:**

```text
LOST  unconditional-guarantee  src/data/chatFaqData.ts:76
      keywords: ["garanti", "garantili", "güvence", "warranty", "sorumluluk"],
```

That is a matcher input array, read only by `findBestFaqMatch` and rendered by
no component. The two lines above it — `:74` the question and `:75` the answer,
both of which *do* render — are still reported by the corrected gate. So the
exemption is exactly as narrow as documented, and my probes K1/K2 confirm the
scope from the other side: a certificate and a company-scale disclosure both
still fire **inside** a keywords array, because the exemption is bound to one
rule and not to the array.

Both restorations are confirmed independently as CATCH probes N1–N3:
`{ label: "Stok Malzeme", value: "Al 6061: 5.000 kg" }`, `Güvenlik stoğu
(5.000 kg)` and the comma form all fire. The `sto[kğ]` softening is real
Turkish, not a patch written for a probe.

**COVERAGE_REGRESSION: NONE.**

---

## R5 — the chatbot, A/B rather than spot-checked

A change to `normalize()` moves **every** score on both sides of the matcher, so
neither of my tools here is a spot check.

### `p06b-chat-routing.mjs`, unmodified

All four disclosed variants now reach the true returns answer at **1.00**:
`garanti`, `garanti veriyor musunuz`, `garantiniz var mı`, `güvence veriyor
musunuz`. `warranty`, `sorumluluk` and `iade` are unchanged at 1.00.
`hatalı parça gelirse ne olur` and `ölçü tutmazsa ne yapıyorsunuz` still fall
through to the AI-consent prompt — **unchanged**, which is the point.

### `p06c-chat-routing-ab.mjs` — 165 queries through both trees

Nine guarantee/returns queries, sixteen unrelated intents, and all 140 shipped
FAQ questions used as their own query, routed through the real module built from
each tree with the project's own esbuild. **Nine differ.**

Four are the intended fix, and two of those four were previously answered
*confidently and wrongly*: `garanti veriyor musunuz` and `güvence veriyor
musunuz` used to return **"Tasarım desteği veriyor musunuz?"** on the shared
question words. That is the failure the packet describes and it is closed.

Five are collateral, and none is a content-truth failure:

- Three FAQ questions typed verbatim now answer from a **sibling entry on the
  same subject** — series production, first-article inspection, surface
  treatment. Within-topic ties, not topic changes.
- `kaynak yapıyor musunuz` moves from one wrong answer to another. The corpus
  contains **no welding FAQ at all**, so neither tree can answer it. The
  previous answer was won on `yapıyor`+`musunuz` alone — the exact pathology
  being fixed. The new one is won because the matcher's substring rule makes
  `"kaynak".includes("ayna")` true and the Ra 0.1 µm answer contains `ayna`.
  I confirmed that mechanism directly against the live corpus. It predates
  Phase 06 and outlives it. **Advisory, carried forward.**

### The disclosed stopword shrink, reproduced — `p06c-stopword-sensitivity.mjs`

The Coder says it *shrank* a larger list because the larger one turned my
`hatalı parça gelirse ne olur` from NO MATCH into a confident wrong answer.
Score is `matchCount / inputWords.length`, so a longer stopword list
mechanically **raises** a query's best score by shrinking the denominator.
Feeding the same query at successively shorter lengths — which is what a longer
list produces — against the live matcher:

```text
"hatalı parça gelirse ne olur"  (5 words)  -> NO MATCH          <- SHIPPED
"hatalı parça gelirse olur"     (4 words)  -> NO MATCH
"hatalı parça gelirse"          (3 words)  -> "Verimlilik çalışması parçamı
                                               nasıl etkiler?"  score 0.67
"hatalı parça"                  (2 words)  -> NO MATCH
```

The disclosure is true, and the shipped fourteen-word list stops one step short
of it. Disclosing a discarded worse version is the behaviour I want to see.

**CHATBOT_REGRESSION: FIXED.**

---

## R6 — G3, fixed and gated

The four standards are out of the three `metaTitle` strings:

```text
"Yenilenebilir Enerji Parça Üretimi | Rüzgar & Güneş | Mas Technic"
"Petrol & Gaz Parça Üretimi | 15000 PSI | Mas Technic"
"Güç Dağıtım Parça Üretimi | 36kV | IACS %99+ | Mas Technic"
```

The gate now carries a `metaTitle` pass applying the §C allow-list
unconditionally, because a badge list gives a sentence-scoped rule nothing to
read. **The R6 question was whether it is an allow-list or a deny-list with a
hole in it**, and the answer is the first — probe **L1**:

```text
L1  metaTitle: "Hassas İmalat | ISO 41822-7 | Mas Technic"
    -> unauthorised-standard-conformity   (a designation nobody has invented)
L2  metaTitle: "... | API 6A | NACE MR0175 | ..."      -> fires
L3  metaTitle: "Genel Toleranslar | ISO 2768-m | ..."  -> silent (reference class)
L4  metaTitle: "Kalite | ISO 9001 | ..."               -> silent (§C held)
```

The two-entry reference-class allow-list (`MIL-A-8625`, `ISO 2768`) is written
down in the gate with its reason, and it preserves exactly the two designations
I adjudicated in R4b. Phase 11 can now wire route metadata without resurrecting
this class.

---

## R7 — suites, goldens, guarantees

| Check | Result |
|---|---|
| `tsc --noEmit` x 3 projects (`app`, `node`, `e2e`) | clean |
| `eslint .` | clean |
| `npm run build` | built in 36.1 s |
| critical-1280 + critical-375 | **163 passed, 3 skipped, 0 failed** (12.8 m) |
| smoke x 4 (webkit/firefox x 1440/390) | **12 passed, 0 failed** (2.1 m) |
| visual-375 + visual-1280 + visual-1440 | **27 passed, 0 failed** (2.3 m) |
| goldens changed | **0** — `git diff 3747db5 2c4b124 -- e2e/__golden__` is empty, and empty again after the visual run |
| `motion-audit --mode=guard` | PASS — every motion call site goes through `@/components/shell/motion` |
| `motion-audit --mode=rest` (B28) | PASS — `hiddenText=0` on all 5 routes x 2 viewports |
| `grid-axis-probe` | PASS — every measured edge on a master axis, tolerance 1 px |
| `verify-route-inventory` / `verify-visual-manifest` / `verify-traceability` / `scan-report-secrets` | PASS / PASS / PASS / PASS |

**The disclosed smoke flake did not reproduce.** The Coder reported 11 + 1
environmental (`smoke-firefox-390` hero-shell teardown). I got **12/12** on the
first run, in 2.1 minutes. Environmental, as disclosed.

**Zero goldens changed is correct, and checkable rather than plausible.**
`e2e/visual/shell-golden.spec.ts` captures the header and footer of one
representative per page family, and its own header comment says page **bodies**
are deliberately not captured because "a golden that fails on every content edit
teaches people to run `--update-snapshots` without looking". Its service
representative is `/hizmetler/cnc-frezeleme`, which this packet did not touch.
Every edit in the packet is `/hizmetler/*` page **data** plus the chatbot
matcher. No golden covers either. So zero is the number I would expect, and
27/27 passing against untouched baselines is the proof rather than the claim.

---

## Scope integrity — PASS

```text
git diff --stat 3747db5 2c4b124
 scripts/claims-gate.mjs  | 377 ++++++++++++++++++++++++-
 src/data/chatFaqData.ts  |  34 ++-
 src/data/servicePages.ts |  61 +++--
 3 files changed, 438 insertions(+), 34 deletions(-)
```

Three files. No `e2e/**`, no `reports/**`, no `PROGRESS.md`, no
`IMPLEMENTATION.md`, no `USER_INPUTS.md`, no build or workflow config. The Coder
did not touch a QA-owned artefact, which is why my harness is byte-identical to
the one that failed this packet twice and its 18/18 means something.

On my side: four new files, all under `reports/qa/tools/**`, plus this report.
No path listed read-only in the packet was modified.

---

## Advisories — not failures, and not new blocking findings

1. **Chat matcher substring rule.** `tw.includes(iw) || iw.includes(tw)` over
   auto-derived keywords makes `"kaynak"` match `"ayna"`. It predates Phase 06,
   it is not what this packet changed, and it will keep producing confident
   off-topic answers for any query the corpus cannot serve. Worth a phase of its
   own; not one of Phase 06's criteria.
2. **`%99.9+ okuma oranı` and `{ label: "Okuma Oranı", value: "%99.9+" }`**
   (`servicePages.ts:1132`, `:1115`). Present in the pre-Phase-06 red baseline
   and through both of my prior reports without being flagged. I read it the way
   I read `%100 IACS` and the `500+ saat` salt-spray hours — a property of the
   symbology and its verification, not a self-graded company KPI — and
   `delivery-or-quality-rate` is scoped to on-time/quality/scrap/savings by
   design. Recording it so the next reader does not have to rediscover the
   adjudication.
3. **Gate hardening notes:** the eight probes in `p06c-attack19.mjs` that found
   holes. None reachable in this tree. If the gate is touched again, adding
   `onaylı` to `CELL_ATTESTATION` and widening `DOCUMENT_COLUMN` beyond six
   nouns are the two cheapest wins.

## Carry-forwards, restated unchanged

`Maks. 50 MB` (Phase 09); canonical / `og:url` / `og:image` / `IST` clock
(Phase 11); lead-time day-ranges, the volume-discount schedule, the 7-day
returns window and "3 iterasyonlu revizyon döngüsü" — commercial promises with
no `USER_INPUTS.md` field; band 07/10 compositional pass (Phases 07/08); B24,
B29, B30, B31.

**G3's condition is discharged.** It was carried forward with the condition that
the four `metaTitle` standards be defused before Phase 11 wires route metadata.
They were defused now, and the gate will not let them back.

## Verdict

I failed this phase twice, and the second failure was the more instructive one:
the sweep was driven by the gate, so it inherited the gate's blind spots. Both
of those spots are now closed **as rules** rather than as strings, which is the
fix I asked for. The evidence that they are closed as rules is that my
unmodified harness went 9/18 to 18/18 without the harness moving, and that the
Coder found a second instance of the table shape I had not reported.

Two things raise this above a clean scorecard.

The Coder **refused a QA instruction and was right to**. My table rule would
have deleted `ASTM A967`, `MIL-DTL-16232` and five `EN ISO` NDT method standards
— content that makes the site read like a shop that knows what it is doing — and
it would have contradicted two PASS controls in my own harness. Over-removal is
a failure, and the refusal arrived with the argument rather than instead of it.

And the Coder **caught a regression in its own instrument**, from a four-claim
drop on a tree nobody was looking at, then disclosed a discarded worse version
of the chatbot fix which I reproduced. A gate that quietly gets weaker is worse
than one that is loudly wrong. Verified rule by rule, by set and not by count,
across 27 rules and 788 violations on the red tree: one line changed, and it is
the one the commit message names.

**STATUS: PASS.**
