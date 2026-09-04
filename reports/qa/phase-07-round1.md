# QA Report — Phase 07 (Inner Pages Wave A) — QA run 2

- PHASE: 07
- CODE_COMMITS: `e598d01`, `77dc229`, `2ed0347`, `b4f74a3`, `dfe9da7` (base `e07c154`)
- QA_COMMIT: see `git log wt/qa-p07` — this report is the last commit on that branch
- STATUS: **FAIL**
- TESTS_PASSED: 1145
- TESTS_FAILED: 11 (9 environmental, 2 pre-existing on both trees — all classified below)
- TESTS_SKIPPED: 163
- NEW_TESTS_ADDED: 7 (`e2e/inner-pages-composition.spec.ts`, × 8 regression projects = 56 executions)

Everything below was measured against a preview I built and served myself
(`http://localhost:4183`, `dist/assets/index-D6RH8-Fx.js`), with a second
preview of the Phase 06 close (`d1ed8e3`) on `http://localhost:4184`
(`assets/index-B0g0-tcw.js`) as the BEFORE control. Port 4173 was already
occupied by another checkout's server; I did not use it.

---

## 1. Verdict in one paragraph

The phase's five acceptance criteria are met, and met well: the six rebuilt
pages are structurally part of the landing family, the corporate icon-card
template is genuinely gone (proved with a detector that fires on the template
when it is injected), the `<h1>` clip (I4) is closed harder than claimed, B24's
contrast repair is real rather than a bucket shuffle, and the six regenerated
goldens are justified at every viewport. I could not fault any of those.

It fails on content truth, which `IMPLEMENTATION.md` §13 and `USER_INPUTS.md`
§0 place above the phase criteria. Phase 07's new `CategoryPage.entryMeta()`
takes **annual production volumes** that previously sat on one leaf page and
prints them as chips on a listing page that did not carry them before —
measured before/after on the same route. `USER_INPUTS.md` §0 sets
`DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES` and §D marks
`REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE`. Two further live claims of
the same class ride through `scripts/claims-gate.mjs` because of a hole I have
now proved twice over, and Phase 07 also removed the `<h1>` from three
not-found bodies it rewrote.

---

## 2. Acceptance criteria matrix

| Criterion | Result | Evidence |
|---|---|---|
| Core pages visually and structurally belong to the landing family | **MET** | `p1-structure.rerun.json`: `shellRoot=1`, `[data-fullscreen-header]=1`, `footer=1`, `footer.tl-footer=1` on 14 routes × {375, 768, 1280}. New spec `e2e/inner-pages-composition.spec.ts` asserts it: 56 passed on the integrated tree, **14 failed on the `d1ed8e3` tree** (red control). |
| No old generic public header/footer remains | **MET** | Same measurement — exactly one `<footer>` in the whole document on every route; no second header element anywhere. |
| No generic "heading + paragraph + four icon cards" template | **MET** | Equal-tile detector, negative-controlled: injecting the old template into `/hakkimizda` and `/hizmetler/cnc-frezeleme` at 1280 takes the detector from 4 groups / 0 icon-tiles to 5 / 1 (`kidsWithIcon=4`, tile 292×180) and removing it returns it to 4 / 0. On the real pages the count is 0 at 320/375/390/768/844/1280/1440. See §6 for the one group I first mis-read. |
| No generic rounded-card aesthetic unless documented | **MET, with two advisories** | Full computed-radius sweep: the only radii on the six pages are 20 (375) / 8 (1280) 4–6px `rounded-full` meter bars from the untouched `MaterialMorphScroll.tsx:154,271-273`, the custom cursor, and the ChatBot FAB. None is a card. But `docs/lean/17` §4 says the six pages "carry **no radius exception at all**", which is false of what renders — advisory A5. |
| Each service/sector page has a meaningful next-step/RFQ path | **MET** | `.shell-next` present on every rebuilt route; it contains a visible, focusable `a[href="/teklif-al"]`; asserted at eight viewports by the new spec. |
| Desktop/tablet/mobile goldens exist for representative routes | **MET** | 375 / 768 / 1280 / 1440 × 7 hero crops + 3 next-step crops, plus the shell header/footer set. `visual-768` added under Orchestrator ruling A12. |
| Mandatory task "Services listing / Sectors listing" | **MET** | Orchestrator ruling A10 (PROGRESS.md:59) predates the Coder's work. `/hizmetler` and `/endustriyel` are not routes at all — both render the global 404 ("Aradığınız sayfa bulunamadı"), which is correct: `src/App.tsx` has never had a bare family index, and `CategoryPage` serves all 15 category routes. Verified, not assumed. |

---

## 3. FINDINGS (must fix)

### F1 — Phase 07 publishes annual production volumes on a surface that did not carry them

**Defect.** `/kabiliyetler/kategori/prototipten-seri-uretime` now prints
`50.000 adet/yıl` and `500.000 adet/yıl` as row metadata.

**Measured, before and after, same probe, same viewport:**

```
BEFORE (:4184) /kabiliyetler/kategori/prototipten-seri-uretime
  ... Prototipten Seri Üretime | Tek parçadan binlerce adede kadar esnek
  üretim kapasitesi. | Düşük Hacimli Üretim | 1-100 adet prototip ve küçük
  seri üretim. | Seri İmalat | Tekrarlanabilir kurulum ve kontrol planı ...
        -> title + description only

AFTER  (:4183) the same page also prints
  "50.000 adet/yıl"   "500.000 adet/yıl"
```

**Root cause (not the symptom).** `src/pages/CategoryPage.tsx:64-70`:

```ts
function entryMeta(path: string): string[] {
  const slug = path.split("/").filter(Boolean).pop();
  const page = slug ? getPageBySlug(slug) : undefined;
  if (!page?.technicalSpecs?.length) return [];
  return page.technicalSpecs.slice(0, 2).map((spec) => spec.value);
}
```

It republishes the **first two** `technicalSpecs` of every child entry with no
filter on what class of fact they are. For `seri-imalat`
(`src/data/servicePages.ts:2101-2102`) those two are
`{ label: "CNC Seri Kapasite", value: "50.000 adet/yıl" }` and
`{ label: "Döküm Kapasite", value: "500.000 adet/yıl" }`. The design note above
the function argues the chips are safe because "every figure in it can be
checked against the table further down the SAME page" — that is an *internal
consistency* argument, and it is orthogonal to whether the figure may be
published at all.

**Authority.** `USER_INPUTS.md` §0 `DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME:
YES`; §D `REVENUE_OR_ORDER_VOLUME: PRIVATE_DO_NOT_DISCLOSE`;
`IMPLEMENTATION.md` §13 forbids inventing delivery/KPI figures and nothing in
`USER_INPUTS.md` verifies these.

**A correct fix must satisfy:** the listing chips carry only figures whose
class is publishable (dimensional envelopes, tolerances, standards, material
grades), and the underlying sentence on `/kabiliyetler/seri-imalat` —
"Seri üretim kapasitelerimiz: CNC seri işleme 1.000-50.000 adet/yıl …,
basınçlı döküm 5.000-500.000 adet/yıl …, enjeksiyon kalıp
10.000-1.000.000 adet/yıl" (`servicePages.ts:2087`), first person, about this
company — is resolved rather than only hidden from the listing.

### F2 — `scripts/claims-gate.mjs` has two holes, and live claims sit behind both

**Hole 1 — an intervening adjective, and a short noun list.** The rule at
`scripts/claims-gate.mjs:682` is
`\b\d[\d.,]*\s?\+\s*(?:parça|malzeme|proje|çeşit)`.

*Proof, not inference.* The gate script is byte-identical across the phase
(`git diff --stat e07c154 dfe9da7 -- scripts/` is empty), so running it inside
`qa-before-p07` **is** running today's gate against the tree that still
contains `15+ alüminyum alaşımı` at `src/data/materialsData.ts:50`:

```
$ node scripts/claims-gate.mjs        # HEAD = d1ed8e3
# scanned:  207 files, 26068 non-comment lines
PASS — 0 unverified claims across 26 rules.
```

*Red-then-green on the rule itself*, scratch tree, same script:

```
GREEN (silent — wrongly):  "15+ alüminyum alaşımı" · "20+ renk seçeneği"
                           · "1000+ ünite/gün"          -> 0 claim violations
RED   (fires — correctly): "15+ malzeme" · "15+ çeşit"  -> company-scale-
                           disclosure, 2 violations
```

**Hole 2 — template interpolation.** At `d1ed8e3`,
`src/pages/Malzemeler.tsx:122` read `{materialsData.length}+ malzeme ve alaşım`
and the page **rendered "87+ malzeme ve alaşım"** (measured on the BEFORE
preview, not inferred). `\d+\s*\+\s*malzeme` is a rule that exists and would
have fired; it was defeated purely because the digit is never in the source.
§D marks `MATERIAL_COUNT_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE`. Phase 07 removed
it and documented the removal at `Malzemeler.tsx:57`. No interpolated count
claim remains live.

**Still live behind hole 1**, in the shipped bundle
(`dist/assets/servicePages-DUu27HBT.js`) and read off the rendered page:

| Claim | Occurrences | Route |
|---|---|---|
| `20+ renk seçeneği` / `20+ Renk Seçeneği` / `20+ renk` | 7 | `/hizmetler/anodizasyon` |
| `1000+ ünite/gün` | 3 | `/hizmetler/mekanik-montaj` |

Classification per the packet: `20+ renk seçeneği` is an **offering/inventory
count**, structurally identical to `15+ alüminyum alaşımı` (which the Coder
itself judged unpublishable) and to `87+ malzeme`; `1000+ ünite/gün` is a
**daily production volume**. Neither is a material/process specification of the
`60+ HRC` / `1100+ MPa` / `500+ saat ASTM B117` class that Phase 06 correctly
kept. `50+ tezgah` survives only inside a Phase 06 explanatory comment
(`servicePages.ts:1433`) and the gate correctly skips comments — no carrier,
hardening note only.

**By the bar I set in Phase 06** (hole with a live carrier = finding; hole with
no carrier = hardening note) this is a finding. It is also a miss I share: I
passed Phase 06 with these strings live, and I am recording that.

**Anti-laundering check:** no rule was narrowed and no exemption added —
`git diff --stat e07c154 dfe9da7 -- scripts/` is empty, verified from the diff
rather than from the statement.

### F3 — Phase 07 removed the `<h1>` from three not-found bodies it rewrote

Measured at 1280 (`p5-template.json`), heading census per route:

| Route shape | h1 | Notes |
|---|---|---|
| `/hizmetler/kategori/<unknown>` | **0** | `e07c154` rendered `<h1>Sayfa Bulunamadı</h1>` |
| `/endustriyel/kategori/<unknown>` | **0** | |
| `/kabiliyetler/kategori/<unknown>` | **0** | |
| `/hizmetler/<unknown>` | **0** | `document.title` also falls back to the site default |
| `/endustriyel/<unknown>` | **0** | and the rail reads **`03 HİZMET`**, the wrong family |
| `/malzemeler/<unknown>` | 1 | but renders the full materials index — a soft 404 that looks valid |
| `/qa-bogus-route` (global 404) | 1 | correct |

**Root cause.** `src/pages/CategoryPage.tsx:88-116` replaced the old `<h1>`
with `ShellEmpty`, whose `title` is a `<p>`
(`src/components/shell/ShellStates.tsx:37-55`). The inline comment says the
string was chosen to avoid tripping
`e2e/shared-shell-accessibility.spec.ts`'s canonical-route check — a legitimate
concern, but the fix removed the element rather than changing the string.

**A correct fix must satisfy:** every one of these bodies exposes exactly one
`<h1>`; `/endustriyel/<unknown>` carries its own family rail and label; and the
`document.title` of an unknown service/sector slug is not the site default.

### F4 — `installFontRetry()` never runs; the file and `docs/lean/17` §8.1 say it does

`e2e/visual/fonts.ts:81` registers `page.route("https://fonts.g*", …)`.
Playwright's glob `*` does not cross `/`, so the pattern matches only a URL
with no path. Measured with `page.route()` used exactly as `fonts.ts` uses it,
over a load that issues 17 font requests:

```
"https://fonts.g*"                 intercepted  0 / 17
"https://fonts.g**"                intercepted  0 / 17
"**fonts.googleapis.com**"         intercepted  1 / 17
"https://fonts.googleapis.com/**"  intercepted  1 / 17
```

Part 2 of the stated two-part fix (`awaitRealFaces`) is real and is the
stronger half — it **fails** rather than banking a fallback render. Nothing was
weakened. But the stability the file and the doc attribute to part 1 cannot
have come from part 1, and the run-time drop from 56 minutes to under 4 is
therefore attributed to a mechanism that does not execute.

**A correct fix must satisfy:** the route pattern demonstrably intercepts both
hosts (a test that counts interceptions and fails at zero), or the retry is
removed and the claim withdrawn from `e2e/visual/fonts.ts` and
`docs/lean/17` §8.1.

### F5 — `docs/lean/17` §4 states something untrue about what renders

> "`--tl-radius: 0`. The six rebuilt pages carry **no radius exception at all**,
> so there is nothing to document as one."

Measured on `/malzemeler`, one of the six, computed `border-radius` over every
visible element after a full scroll pass:

```
375  : 20 × div.h-1.5.flex-1.rounded-full   21×6px    MaterialMorphScroll.tsx:154
1280 :  8 × rounded-full meters 238×4 / 190×4         MaterialMorphScroll.tsx:271-273
both : 1 × button.fixed.rounded-full.bg-primary.shadow-lg   ChatBot.tsx:225
```

The elements are hairline meters and a launcher, not cards, so criterion 3 is
not violated by their presence — but §4 is precisely the register that
criterion's escape hatch depends on, and it is inaccurate. This is the fourth
time in this run a document has asserted something untrue about what actually
renders, and the Orchestrator's own pre-QA grep missed it because it checked
the six page *files* rather than the components they mount.

**A correct fix must satisfy:** §4 lists what actually paints a radius on those
routes and why it is allowed, or the statement is qualified to "no radius
exception in the six pages' own stylesheets".

---

## 4. ADVISORIES (carry forward)

- **A1 — `MaterialMorphScroll` contrast, pre-existing.** My independent
  instrument finds 5 real failures on `/malzemeler` at 375 and 1 at 1280, all
  inside the deliberately-kept `MaterialMorphScroll`: `Malzeme Dönüşümü`
  `rgb(10,125,138)` at 12px → **4.013:1** at 1280 and **1.588:1** at 375, and
  four 10px `rgba(240,239,237,0.5)` property labels over the image sequence at
  **3.44–4.11:1**. Identical numbers on the `d1ed8e3` build, so not a Phase 07
  act. Phase 07 fixed 3 of the 8 that were there before.
- **A2 — the chat FAB is inside 25 committed goldens.** Scanned all 100
  goldens for `rgb(10,125,138) ±10`: every `shell-footer-*` at 375/768/1280/
  1440 except `shell-footer-home` (the landing does not mount it), plus
  `inner-hero-{material-family,sector-detail,service-detail}` and
  `inner-next-{sector,service}-detail` at 375. Ten are new this phase. Phases
  09/13 own the launcher's visual language; when they touch it, 25 goldens go
  red at once and the reflex will be `--update-snapshots`, which §12 forbids.
  The FAB also physically covers table content: at 1280 it sits on a `<td>` on
  `/hizmetler/cnc-frezeleme` (67% of the glyph line box) and on
  `.shell-row-toggle` buttons on `/malzemeler`.
- **A3 — the critical suite still hard-depends on the font host.**
  `helpers.settleRendering` awaits `document.fonts.ready` unguarded, so it
  stalls for the full 60s test timeout when `fonts.googleapis.com` is slow.
  Three of this run's flakes are exactly that. `e2e/shared-shell-accessibility`
  stubs the host; the visual suite now *requires* it live and fails without it;
  the critical suite does neither. Three suites, three policies. Phases 14/15
  own CI: a CI runner without egress to `fonts.gstatic.com` will fail the whole
  visual suite by design, not flake.
- **A4 — published address expansion.** `claims.ts` publishes
  `["Ataşehir Mah., 8287. Sok.", "No: 4, 35620 Çiğli / İZMİR"]` against
  §A's `Ataşehir, 8287. Sk. No:4, 35620 Çiğli/İzmir`. The Coder's defence
  ("byte-identical to what `SiteFooter` already rendered") is **factually
  true** — I measured it on the BEFORE preview — but "it already shipped" is
  not a publication authority. What makes it harmless is different: `Mah.`
  labels a mahalle name already present in §A and `Sok.`/`Sk.` abbreviate the
  same word, so no fact is added. Advisory, not a finding.
- **A5 — `docs/lean/17` §4** — see F5; recorded here too because the class
  matters more than the instance.
- **A6 — the "Google Meet davet bağlantısı … gönderilir" promise** on
  `/iletisim` is a delivery guarantee with no verified fulfilment path in
  `USER_INPUTS.md`. Pre-existing (4 occurrences at `e07c154`, 2 now); Phase 07
  reduced it. Phase 09 owns the form pipeline.
- **A7 — `/malzemeler` is not in the motion-audit rest matrix.** The audit
  covers `/`, `/hizmetler/cnc-frezeleme`, `/iletisim`, `/malzemeler/aluminyum`,
  `/hakkimizda` × {1280, 375} and reports `hiddenText=0` on all ten. I measured
  11 elements inside `MaterialMorphScroll` sitting at an ancestor
  `opacity: 0` during a scroll pass; a route with an 80-frame scroll-driven
  canvas is the one most worth having in that matrix.
- **A8 — the material register scrolls at 768 with all ten columns**
  (1068 → 708). Not a violation (see §5), but a worse reading experience than
  375, where five columns are dropped.

---

## 5. Things I checked and found NOT to be defects

- **`.tl-band-index small` (the Coder's own declared known risk) — retired.**
  The Coder left it unfixed, declaring 5.09:1 but "~3.0 by pixel method", and
  argued that fixing it would move the landing goldens. Measured with an
  instrument that never reads a glyph pixel:

  | element | size | naive glyph method | this instrument |
  |---|---|---|---|
  | `.tl-band-index span` "03"/"05"/"07" on paper | 15px | 5.012 | **5.089** |
  | `.tl-band-index small` "KABİLİYET"/"MALZEME"/"SORULAR" | 8px | 2.584–3.042 | **5.089** |

  Identical colour pair, `rgb(92,99,96)` on `rgb(238,233,222)`, `modalShare`
  0.97–0.98. **The colour pair does not change with font size.** The "~3.0" is
  the Coder's own caveat biting its own method. My 8px control settles it: a
  known 3.033:1 pair reads **3.033** on this instrument and **2.119** on the
  naive one, a −30% error; on a light background at 8px the error is −49%.
  There is no SC 1.4.3 failure here, so the `aria-hidden` question (Phase 05's
  B29 ruled it does not exempt) is moot, and so is the golden argument — which
  would not have been acceptable had the defect been real.
- **B24 is a repair, not a bucket shuffle.** Both buckets, both viewports, same
  probe pointed at each tree:

  | route | 1280 before v/i | 1280 after | 375 before v/i | 375 after |
  |---|---|---|---|---|
  | `/hizmetler/cnc-frezeleme` | 28 / 17 | **0 / 4** | 28 / 21 | **0 / 32** |
  | `/endustriyel/havacilik-uzay` | 61 / 52 | **0 / 1** | 28 / 16 | **0 / 23** |
  | `/iletisim` | 4 / 0 | 0 / 0 | 4 / 1 | 0 / 1 |
  | `/malzemeler` | 2 / 7 | 0 / 0 | 2 / 14 | 0 / 182 |
  | `/malzemeler/aluminyum` | 0 / 7 | 0 / 0 | 0 / 7 | 0 / 60 |
  | `/` (untouched control) | 0 / 34 | **0 / 34** | 0 / 27 | **0 / 27** |

  The 375 `incomplete` numbers rise, which is exactly the shape that should be
  distrusted — so I measured them independently rather than reading them. On
  `/malzemeler` at 375, 175 of the 182 are `elmPartiallyObscured` on a table
  that did not exist before; the node population changed, it is not the same 28
  nodes moved. Decisively: my own instrument reads **28 real failures on
  `/endustriyel/havacilik-uzay` at 375 on the BEFORE build and 0 on the AFTER
  build**, and on `/malzemeler` 8 before → 5 after where all 5 survivors are the
  same `MaterialMorphScroll` elements with the same ratios. The landing is
  identical on both trees on the same instrument, which is the control that
  says the instrument did not move.
- **All 4 surviving `incomplete` nodes at 1280 pass on measurement.**
  `.shell-plate-no` 9px → **10.007:1**; `.shell-plate-caption` 11px →
  **8.44:1**; `.shell-span-note > .shell-eyebrow` 10px → **10.007:1**;
  `.tl-band-index small` "KARŞILAŞTIRMA" 8px → **17.352:1** (graphite band).
  Every one has `modalShare = 1.000` and one background colour in its glyph
  line boxes — the figcaption does **not** sit over the photograph. axe's
  declines are conservative and legitimate.
- **I4 is closed, and more strongly than reported.** 144 combinations —
  9 rebuilt routes × {320, 375, 768, 1280} × {reduce, no-preference} ×
  {IntersectionObserver live, IntersectionObserver replaced by a dead stub
  installed before any app script}. All 144: `<h1>` present, opacity 1,
  visibility visible, fully inside the viewport, hit-testing to itself, zero
  clipping/opacity ancestors, `documentElement` horizontal overflow = 0. The IO
  stub is proved live (`window.__ioCalls` is a number in all 72 `noIO` runs;
  4 of them constructed one).
- **The six regenerated goldens are justified — at every width.** `.tl-footer`
  `border-top` measured at 375/768/1280/1440: `/hakkimizda` and
  `/hizmetler/cnc-frezeleme` 1px → **0px**; `/blog` (paper) 1px both;
  `/` (graphite) 0px both; `/teklif-al` and 404 1px. Decoding the PNGs: old row
  0 is exactly `[12,16,18]`, which is `rgba(18,23,25,0.42)` composited over the
  footer's `[7,11,13]` — the border. New row 0 is `[7,11,13]`. At 375 the image
  is 1px shorter and old rows 1..n vs new rows 0..n−1 leave 45 changed pixels
  (about) and, once the FAB is aligned, 34 rows of diacritic antialiasing
  (service). At 1280/1440 only alternate text lines move, which is what a 1px
  shift does to lines on a half-pixel grid. **No content changed.** Phase 04's
  precedent (true at 1280/1440, false at 375) does not repeat.
- **The two defects the Coder says it found while reviewing the 768 baselines
  are fixed, and I found no third.** Rendered `/malzemeler/aluminyum` has
  **zero** comma-decimals and prints `2.65–2.83 g/cm³` in the hero against
  `2.65, 2.83, 2.81, 2.78, …` in the table below it. Every next-step title
  across ten routes keeps its case: "CNC Frezeleme için teklif",
  "Havacılık & Uzay için teklif", "Makine Parkuru için teklif" — no lowercased
  acronym anywhere in the rendered text of 15 routes. I decoded and looked at
  the 768 hero and next-step baselines; they are clean.
- **No `maxDiffPixels` was raised anywhere.**
  `git diff e07c154 dfe9da7 -- e2e/visual/*.spec.ts` adds exactly two calls per
  spec and changes nothing else. `playwright.config.ts` declares no `expect`
  block.
- **No pre-Phase-07 baseline was a fallback render.** The fallback substitution
  is large and measurable (the string "MAS TECHNIC HASSAS" at 700 22px advances
  227.97px on the real face and **247.78px** on the fallback, +8.7% growing
  along the line), and the whole visual suite — including every baseline banked
  before this phase — passes 64/64 under a suite that now proves the real faces
  loaded.
- **Both font spec claims are true.** With both hosts aborted:
  `document.fonts.ready` **resolves**; `document.fonts.check('700 22px "Space
  Grotesk"')` returns **true** while `document.fonts.size` is **0**; the
  FontFaceSet enumeration reports all three families missing. Live, the same
  three read 41 faces and `[]` missing.
- **The `/malzemeler` register is not a 1.4.10 or 2.1.1 failure.**
  `documentElement` horizontal overflow is 0 on all seven rebuilt routes at
  320/375/768. The register drops 5 of its 10 columns at 320/375
  (`display:none`: Aile, Sertlik, Maks. °C, İşlenebilirlik, Fiyat bandı) and
  scrolls 543/331; a data table is explicitly exempt from 1.4.10. Its
  `.shell-table-scroll` is the only one on the rebuilt pages without
  `tabindex=0`/`role=group`/`aria-label`, and correctly so:
  `useScrollableRegionAccess` skips regions that already contain focus stops,
  and this one has 174 — the first the compare checkbox in column 0, the last
  the "Ayrıntı" button in column 9 — so tab order reaches both edges. Every
  other table on those pages does get the treatment (measured: `role=group` +
  "Alüminyum alaşım kaydı", "CNC Frezeleme Eksen Karşılaştırması", "Havacılık
  Malzeme Performans Karşılaştırması", …).
- **`/hakkimizda` publishes no scale of any kind** — no team size, floor area,
  machine count, revenue, volume or inventory count, and no date. Every figure
  traces to `USER_INPUTS.md`: ISO 9001:2015 / ISO 14001:2015 / OHSAS 18001 (§C),
  ±0.01 mm (§D), 1-3 iş günü (§D), "Akredite 3. taraf CMM ölçümü, talebe bağlı"
  (§D `THIRD_PARTY_ACCREDITED_ON_DEMAND`), İzmir · Çiğli (§A). The four PDF
  sizes are real: 81083 B → "79 KB", 103038 → "101 KB", 92312 → "90 KB",
  88370 → "86 KB", all four present in `dist/belgeler/`.
- **Both logged Coder assumptions hold.** (a) `USER_INPUTS.md` contains **zero**
  four-digit years (`grep -coE '\b(18|19|20)[0-9]{2}\b'` = 0), so a dated
  timeline could not have been sourced. (b) the three cross-link families on
  `/hakkimizda` are exactly the 15 category paths in
  `src/components/navigation/ia.ts`. None invented.

---

## 6. Two readings I retired — one inherited, one my own

1. **The first QA run's "every equal-tile group has `kidsWithIcon=0`" is
   false.** `ol.shell-run` on `/iletisim` at 1280 is three equal 405×202 tiles
   and all three matched `svg, img, [class*='icon']`.
2. **My first version of the detector was over-inclusive.** Measured what
   actually matched: a single 14×14 `aria-hidden` `lucide-arrow-right`
   **inside each tile's own CTA link**. That is a direction mark on a control,
   not the 32–48px decorative feature icon the banned template is built from,
   and the tile is an `<li>` in a numbered `<ol>` carrying a title, a detail
   and an action — a process run, which the phase's own task list allows.
   Detector tightened to require ≥20px and *not* inside
   `a, button, summary, [role=button]`. With that definition the count is
   genuinely 0 on all seven routes at all eight widths. The conclusion survives;
   the evidence behind it did not, and now does.
3. **My own 375 contrast "failure" on `.shell-faq-answer p` retired as an
   instrument artefact.** It read 1.917:1 from a snapshot colour while the
   cross-check said 16.3:1. Measured directly: the containing `<details>` is
   **closed** (`open: false`, `details` box 57px tall while the answer claims
   139px inside it), so the paragraph has a layout box but is never painted and
   my sampling read pixels from a region 6004px down the page that shows other
   content. axe was right to ignore it. Recorded as a known limitation of
   `p6-contrast.mjs`: it does not exclude collapsed `<details>` content.

I also found and fixed two false positives in my own instrument before using
it: `visibility:hidden` also removes an element's own background (it made two
teal buttons read 1.07:1), and reading computed colour *after* the transparency
pass returns `rgba(0,0,0,0)` for everything (it made all 320 elements read
1.000:1). Both are in the probe's header comment.

---

## 7. Failed checks

| Check | Observation | Classification | Production fix required? |
|---|---|---|---|
| `motion-grammar:106/125/150` @critical-1280 | 60s timeouts at `document.fonts?.ready` | Environmental. Whole file passes 6/6 twice in isolation (40.1s, 42.4s) | No — but see A3 |
| `motion-grammar:254` @critical-1280 / desktop-1280 | `receded 0.875405 / 0.959629`, expected < 0.5 | Environmental — a transition caught mid-flight under load. Passes 3/3 on **both** trees when quiet | No |
| `technical-landing:376` @critical-1280, @desktop-1440-short | 93 axe contrast nodes, all inside `.tl-menu-sheet` | Environmental — menu caught mid-open. Passes in isolation (9.1s / 10.8s) | No |
| `technical-landing:344` @desktop-1440 | axe on the whole document | Environmental. Passes in isolation (12.1s) | No |
| `shared-shell-accessibility:812` @desktop-1280 | 8 nodes, all `.route-curtain-panel` | Environmental — curtain mid-sweep. Passes in isolation (18.6s) | No |
| `motion-grammar:254` @tablet-768, @landscape-844 | `expect(.tl-dimension-lines).toBeHidden()` fails | **Reproducible, and fails identically on the `d1ed8e3` build.** Not Phase 07. `technical-landing.css:513` hides the lines only under `@media (max-width:767px)` while the spec asserts hidden whenever `(hover:hover) and (pointer:fine)` is false; at 768–1023 with a coarse pointer the two disagree. Last touched in Phase 05 (`150c546`, `1e88593`) | Yes, but not by Phase 07 |

Control that makes those safe: the whole `motion-grammar` file passes 6/6 on
BEFORE at critical-1280 **and** 6/6 on AFTER at critical-1280.

---

## 8. Commands run

```text
npm run build                                            PASS (1m 05s)
npm run typecheck                                        PASS
npx tsc --noEmit -p tsconfig.e2e.json                    PASS (with the new spec)
node scripts/claims-gate.mjs                             PASS — 0 / 26 rules, 209 files, 26482 lines
node scripts/claims-gate.mjs   (in qa-before-p07)        PASS — while "15+ alüminyum alaşımı" is live
node scripts/claims-gate.mjs   (scratch, red control)    FAIL — 2 company-scale violations
node scripts/grid-axis-probe.mjs                         PASS — every edge on a master axis (1px)
node scripts/motion-audit.mjs --mode=guard               PASS
node scripts/motion-audit.mjs --mode=rest                PASS — hiddenText=0, 5 routes × 2 viewports
npm run test:e2e            (PLAYWRIGHT_BASE_URL=:4183)  696 passed / 7 failed / 112 skipped
                                                         — SIGKILLed by the host at test 815 (exit 137)
npx playwright test --project=desktop-1280
        --project=desktop-1440-short --project=desktop-1440
                                                         317 passed / 4 failed / 51 skipped (28.4m)
npm run test:e2e:smoke                                   12 passed / 0 failed (1.7m)
npm run test:e2e:visual                                  64 passed / 0 failed (4.2m)
npx playwright test e2e/inner-pages-composition.spec.ts  56 passed / 0 failed  (AFTER, 8 projects)
                                       against :4184     0 passed / 14 failed (BEFORE — red control)
reports/qa/phase-07/probes/p1  structure, 14 routes × 3 viewports
                              p2  axe both buckets, both trees, 1280
                              p2b axe both buckets, both trees, 375
                              p5  tile detector + negative control + unknown slugs + radius
                              p6  independent contrast instrument, both trees, 1280 and 375
                              p7  the teal cell (the chat FAB, not a contrast defect)
                              p8  published text of 15 + 15 + 3 routes, both trees
                              p9  I4 — 144 combinations
                              p10 footer border, 6 routes × 4 widths, both trees
                              p11 golden decode / shift-diff / diff mask / FAB scan (100 PNGs)
                              p12 font spec claims + route-glob red/green
                              p13 the one error-boundary render, 8 deliberate reloads
                              p14 reflow + scrollable-region access, 7 routes × 3 widths
                              p15 register column census, 4 widths
                              p16 the ol.shell-run icon question
                              p17 the collapsed <details> artefact
```

The full `npm run test:e2e` was killed by the host, so `desktop-1280` appears
in both the partial run and the complete desktop re-run; the totals in the
header sum the chunks as listed and say so rather than pretending one clean
run happened.

---

## 9. Scope integrity — PASS

- Production files modified by QA: **NONE**.
  `git diff --name-only dfe9da7 HEAD` is entirely `reports/qa/**` plus the one
  new file `e2e/inner-pages-composition.spec.ts`, which `QA_WRITE_ALLOWLIST`
  grants.
- No golden regenerated, deleted or updated. Old goldens were extracted with
  `git show` into `reports/qa/phase-07/evidence/goldens-old/` for decoding;
  `e2e/__golden__/**` is untouched.
- No assertion weakened, no tolerance broadened, no skip or xfail added.
- Working tree clean; nothing pushed, nothing merged, `main` untouched.

---

## 10. Where I disagree with the task packet

- The packet frames the `/malzemeler` `rounded-full` bars as possibly "the same
  shape as three earlier defects — a document asserting something untrue about
  what actually renders". I agree it is that class, and I have raised it (F5),
  but I do **not** promote it to a criterion-3 violation: the elements are
  4–6px meters, not cards, and they render identically on the `d1ed8e3` build.
  The defect is the register, not the radius.
- The packet asks whether "it would move the landing goldens" is an acceptable
  reason to leave a live accessibility defect. It is not — but the premise does
  not arise here, because there is no defect: `.tl-band-index small` measures
  5.089:1 and the "~3.0" is the Coder's own instrument caveat. The Coder was
  right to leave it and wrong about why.
