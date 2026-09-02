# QA Report — Phase 06 (CONTENT TRUTH, EVIDENCE MODEL AND CASE-STUDY DATA)

- PHASE: 06
- CODE_COMMIT: `d23a7c6` (integration HEAD; +7 preceding: `895e1ff` `40e2f6a` `abaeb3a` `6b16282` `054210d` `2074118` `222cda4` `a9763a4`)
- BASE FOR DIFF: `75629f3`
- QA_COMMIT: TBD
- STATUS: **FAIL**
- TESTS_PASSED: TBD
- TESTS_FAILED: TBD
- TESTS_SKIPPED: TBD
- NEW_TESTS_ADDED: 0 (2 QA-owned analysis tools added under `reports/qa/tools/`)

- FABRICATION_REMAINING: **1 — a 24-hour quote SLA on the live `/teklif-al` route**
- INVENTED_ANYTHING: **NO**
- TYPE_GUARANTEE: **PROVEN**
- GATE_DEFEATABLE: **YES**

---

## Headline

Phase 06 did the hard part correctly. Every fabricated certification, every
forged evidence artefact, every scale disclosure and every invented metric
named in the packet is gone from `src/` **and** from `dist/`. Nothing was
invented. The type guarantee compiles as advertised. The golden regeneration
is honest and is backed by an independent pixel audit.

It fails on one thing, and it is the thing this phase exists to prevent: **an
overstated commercial promise survives on the public RFQ page.**

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
| R1 | Fabricated claim classes removed from `src/` and `dist/` | **PASS** | below |
| R2 | Corrections are correct, not merely different | **FAIL** | 24-hour SLA survives; CAD list only partly reconciled |
| R3 | `%98 on-time` removal rather than correction to 95 % | **PASS (sound)** | adjudication below |
| R4 | Nothing invented | **PASS** | OHSAS 18001 / TEKNOPAR / 4 PDFs all authorised; PDFs byte-identical to `Politikalar/` |
| R5 | Type-level enforcement actually fails to compile | **PASS (proven)** | `tsc` TS2345 + TS2322 |
| R6 | Gate has teeth / is wired / self-checks | **PARTIAL** | red reproduced at 562; wiring real; but gate is defeatable, incl. by a live defect |
| R7 | 21 goldens regenerated for content reasons only | **PASS** | independent pixel audit, control group byte-identical |
| R8 | 16 deletions were dead before the phase | **PASS** | zero live importers at `75629f3` |
| R9 | Positioning neither apologetic nor inflated | **PASS** | see below |
| R10 | Suites and Phase 01–05 guarantees | TBD | see below |

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
