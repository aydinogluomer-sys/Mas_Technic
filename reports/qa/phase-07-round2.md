# QA Report — Phase 07 (Inner Pages Wave A) — re-verification after correction packet #1

- PHASE: 07
- CODE_COMMITS: `f73efe3`, `dacf66d`, `4640135`, `7e69a79`, `d335aeb`, `818f2ea`,
  `b4995fc`, `c83c3a8`, `6494760`, `516ab95`, `6f37eb0`
  (integrated tree `6f37eb0`; pre-correction Phase 07 close `dfe9da7`;
  Phase 06 close `d1ed8e3`; pre-run base `19f30f5`)
- QA_COMMIT: last commit on `wt/qa-p07c1`
- STATUS: **FAIL** — one residual finding (F5-R). Seven of the eight items close.
- TESTS_PASSED: **96** — `npm run test:e2e:visual` on the integrated tree with my
  two new specs included (64 pre-existing executions + 32 mine), 8.0 min, exit 0
- TESTS_FAILED: 0 in any suite; the finding is a documentation-accuracy defect
  caught by a QA probe, not by a suite
- TESTS_SKIPPED: 0 in the runs I made
- NEW_TESTS_ADDED: 8 test cases (`e2e/visual/qa-f4-font-guard.spec.ts` ×4,
  `e2e/visual/qa-a2-overlay-guard.spec.ts` ×4) = 32 executions across the four
  visual projects

Everything below was measured against builds I made and served myself:
`http://localhost:4190` = the integrated tree `6f37eb0`, `http://localhost:4191`
= the pre-correction Phase 07 close `dfe9da7`. Every number comes from a command
I ran. I did not re-run the eight checks the Orchestrator had already re-derived
independently.

---

## 1. Verdict in one paragraph

Seven of the eight items are closed, and most of them are closed unusually well:
F2's anti-laundering set diff reproduces to the digit on three trees, F3 has a
red control that fails on every count it claims to fix, F4's guard can be made to
fail on cue in four different ways, A7's counter-proof shows the choreography was
gated rather than deleted and an old-versus-new script comparison shows the hard
gate was not narrowed, and A2's 25 regenerated goldens contain exactly one changed
region each — the launcher's own footprint, at CSS geometry, with zero darker
shadow strays. I looked at the newly-baselined content and it is correct. The
phase fails on **F5 alone**: the radius register in `docs/lean/17` §4 still lists
three of the five things that paint a radius on those routes. It omits both
layers of the custom cursor, which render at `opacity: 1` with `border-radius:
50%` on all six routes at 1280. The register's sentence "three things paint one"
is false of the exact route and measurement it cites, and the register's own
closing paragraph promises to include "anything a mounted component paints".

---

## 2. Item-by-item

| Item | Result | Decisive evidence |
|---|---|---|
| **F1** withheld-fact leak | **CLOSED** | Filter is fail-closed (4/4), compound values blocked on both value and label (6/6), the six removed claims suppressed (6/6). Rendered DOM of both bundles: 48 primary listing rows, **23 changed**, and a ten-class withheld scan over all **69 surviving chips returns 0 leaks**. Claims resolved at the LEAF, not hidden: `adet/yıl` and `ünite/gün` absent from `/kabiliyetler/seri-imalat`, `/endustriyel/robotik`, `/hizmetler/mekanik-montaj`; `20+ renk` absent from `/hizmetler/anodizasyon`. No over-removal: ±0.01mm, CT4-CT6, CT5-CT7, ΔE, 60-70 HRC, M3–M12/Nm, ASTM B117 all still render. |
| **F2** gate holes | **CLOSED as scoped** | `rule@file:line` SET diff, re-derived by my own harness on three trees: `19f30f5` 788→801 **LOST 0**, company-scale 42→55, all 26 other rules identical; `d1ed8e3` old gate `PASS — 0` → new gate 12, **LOST 0**; `6f37eb0` both 0. Adversarial battery: 16/17 invented disclosure shapes caught (old gate: 1/17), **21/21 specification shapes silent**, 4/4 defeat attempts confirm the documented same-line limit. Three residual issues → hardening notes H1–H3. |
| **F3** not-found bodies | **CLOSED** | Integrated: 0 problems — one `<h1>` each, none matching `/^(Sayfa\|Yazı) Bulunamadı$/`, 8/8 distinct titles, `/malzemeler/<unknown>` keeps its URL. Pre-correction red control: 6 bodies with **h1 count = 0**, `/endustriyel/` and `/kabiliyetler/` both reading `HİZMET`, 3 site-default titles, `/malzemeler/<unknown>` swapping its URL to `/malzemeler`. Spec byte-identical (`cfdc358`) at d1ed8e3/e07c154/dfe9da7/4640135/6f37eb0. |
| **F4** font retry | **CLOSED** | New QA spec, 4/4: armed on both hosts on a real load; throws the gstatic reason when gstatic is silenced; throws the googleapis reason when googleapis is silenced; throws the fallback-stack reason when the faces never load. |
| **F5** radius register | **FAIL** | Fresh census over all six routes × {375, 1280}: **6 class signatures / 5 components** paint a radius. §4 lists 3. See §3. |
| **A1** contrast | **CLOSED** | My glyph-free instrument, controls held (21.000 / 1.000 / 3.033@16px / 3.033@8px / 3.977). At-rest failures 5→0 @375, 1→0 @1280. **The claim the Coder declined to make is now measured**: the property card under reduced motion at chain 1.0 is **8.481:1** @1280 and 7.574–7.875 @375, against a bound of ~8.6. |
| **A7** reduced-motion | **CLOSED** | Red control on the pre-fix build: `hidden=38 hiddenText=12` → FAIL. Integrated: 12 pairs, all `0/0/0` → PASS. Counter-proof `--mode=enabled`: `armed=44 armedText=12` — the reveal still exists. Anti-narrowing: the PRE-A7 script over the SAME build gives byte-identical numbers on all 10 shared pairs. |
| **A2** launcher goldens | **CLOSED** | Launcher in **0 of 100** goldens (positive control finds it at run 52; goldens max run 1). All 25 changes confined to **one** bbox each — the launcher's — at CSS geometry ±1px at all four widths. **4,845 strays, 4 darker**, and those 4 are the two documented rim pixels. New QA spec, 16/16 at four widths, proves `require: true` fails when nothing is found. |

---

## 3. FINDING — F5-R: the radius register lists three of five sources

**Defect.** `docs/lean/17` §4 says, of `/malzemeler`, "computed `border-radius`
over every visible element after a full scroll pass — **three** things paint one",
and tabulates three. Repeating that measurement finds **five**.

**Measured** (`reports/qa/phase-07c1/probes/q4-radius.mjs`, six rebuilt routes ×
{375, 1280}, full scroll pass, every visible element with a non-zero computed
radius on any corner, grouped by class signature):

| source | listed in §4? | where | size / radius |
|---|---|---|---|
| `div.h-1.5.flex-1.rounded-full` | yes | `/malzemeler` @375, 20× | 21×6, 9999px |
| `div.h-1.rounded-full.overflow-hidden` | yes (the "8 ×" row) | `/malzemeler` @1280, 4× | 238×4, 9999px |
| `div.h-full.rounded-full` | yes (same row) | `/malzemeler` @1280, 4× | 190×4 / 238×4 / 143×4 |
| `button.fixed…rounded-full` | yes | all six routes, both widths, 12× | 48×48 / 56×56 |
| `div.fixed.top-0.left-0.pointer-events-none` | **NO** | **all six routes @1280**, 6× | **6×6, radius 50%** |
| `div.fixed.top-0.left-0.pointer-events-none.flex…` | **NO** | **all six routes @1280**, 6× | **44×44, radius 50%** |

**Root cause.** `src/components/ui/CustomCursor.tsx:198-203` (the 6×6 dot) and
`:213-218` (the 44×44 ring), both `borderRadius: "50%"` as an **inline style**, so
no stylesheet grep can see them. §4's own closing paragraph commits to listing
"anything a mounted component paints, because the audit that missed these three
checked the six page *files* and not the components they mount" — and then omits a
mounted component that paints on every one of the six.

**They paint, they are not merely present.** Measured before and after a pointer
move (`probes/q4b-cursor.mjs`): `opacity: 1`, `border-radius: 50%`, full size, on
every route, from mount. Before a pointer moves they are parked at (-3,-3) and
(-22,-22); after, they follow the pointer at 6×6 and 44×44. A real desktop reader
(`min-width: 901px` + `pointer: fine`) sees both.

**Not a code defect.** `CustomCursor.tsx` is byte-identical (`98e64ab`) at
`d1ed8e3`, `e07c154` and `6f37eb0` — exactly the same status as the three sources
that ARE listed. Neither layer is a card, so acceptance criterion 3 is not
violated *in substance*. What is defective is the register that criterion's
documented-exception escape hatch depends on.

**A correct fix must satisfy:** §4 lists both `CustomCursor.tsx` layers with their
sizes, their radius and their source lines, and the sentence "three things paint
one" is corrected to the measured count — or §4 states explicitly which mounted
components it excludes and why, so the omission is a decision rather than a miss.
It must not be closed by deleting the table.

---

## 4. Adjudications the packet asked for

**F1 assumption 1 — a lot-size range that *defines* a service is not an annual
production volume. ACCEPTED.** §D withholds `REVENUE_OR_ORDER_VOLUME` — what the
company turns over — not the range of order sizes it accepts. A minimum order
quantity is a commercial term a buyer needs in order to self-qualify, and removing
it would cost usability for no truth gain. Applied consistently: `1 adet` /
`1.000 adet` on `dusuk-hacimli-uretim` and `10-500 adet` on `kucuk-seri` stay on
their leaf pages. The chip filter suppresses them from the *listing* anyway, which
is conservative in the safe direction.

**F1 assumption 2 — rewriting `seri-imalat`'s minimum-order answer rather than
quoting the lower bounds. ACCEPTED, with a recorded tension.** The old answer
quoted 1.000 / 5.000 / 10.000 adet, which were the lower bounds of the three
withheld ranges (`1.000-50.000`, `5.000-500.000`, `10.000-1.000.000 adet/yıl`), so
quoting them leaves half the disclosure standing. Nothing in `USER_INPUTS.md`
verifies those numbers, and §0 `NEVER_PUBLISH_JUST_BECAUSE_KNOWN` settles it. The
tension with assumption 1 is real — both are "minimum lot size" — and the
discriminator the Coder actually used is *provenance*, not class. Worth recording:
if a minimum order quantity is ever verified in `USER_INPUTS.md`, assumption 2
should be revisited, because assumption 1 would then permit it. The replacement
answer is also more useful than the number it replaced: it names the two things
that actually set the threshold (tooling amortisation, setup time) and says it is
settled at quote stage.

**A2 per-viewport justification (`516ab95` / §8.2). VERIFIED, cell for cell.**
Disc geometry: 48×48 at x 311–358 @375 (CSS predicts x0=311, Δ0); 56×56 at
x 695–750 @768 (predicts 694, Δ+1); 56×56 at x 1207–1262 @1280 (predicts 1206,
Δ+1); 56×56 at x 1367–1422 @1440 (predicts 1366, Δ+1). Strays per file: 222
@1280, 222 @1440, 406 @768 — the doc's exact numbers; **zero darker at 768/1280/
1440**, and the only 4 darker pixels in all 25 are 2 each on the two inner-next
slivers at maxΔ 30, which §8.2 declares separately and explains correctly (a rim
pixel losing a teal blend to a graphite ground, not a black wash). Largest change
outside the disc: 2 @1280/1440, 4 @768.

**Every stray hugs the disc**, the third of §8.2's falsifiable predictions:
overhang beyond the disc's own box is 1–7 px left and right and 0–14 px below,
with the top edge *inside* the disc's vertical span — the asymmetric footprint of
`shadow-lg` (`0 10px 15px -3px`, `0 4px 6px -4px`), which is downward. No stray
sits anywhere else in any of the 25 images.

**The 2 extra goldens were not swept in.** `inner-next-{sector,service}-detail`
@375: 214 disc pixels + 2 strays = 216, against the doc's "216 changed pixels
each, of which 214 are the sliver and 2 are its antialiased rim". Exact.

**`shell-footer-home` is a real control.** It exists at all four widths, is absent
from the 25, and the only Phase 07 change to it was the *addition* of the 768
variant when that viewport was introduced. Same footer element, same widths, the
one route that mounts no launcher, and it did not move.

**No golden moved because of A1 or A7.** Each of the 25 has exactly one changed
bounding box and it is the launcher's. Had A1 or A7 moved a pixel inside any of
those crops, a second box would appear. None does.

**The newly-baselined content is correct.** Inspected at full size: 375
`shell-footer-about`, 1280 `shell-footer-service`, 375 `inner-hero-sector-detail`.
In each the region the disc occupied is plain footer/hero ground. The MALZEMELER
spec block (`Ti6Al4V, Inconel 718, Al 7075`) sits beside the old disc, not under
it, and reads identically in both. No defect is pinned by the first baseline.

---

## 5. Hardening notes (not findings; no correction cycle needed for the phase)

- **H1 — the intervening-adjective widening did not reach the company-scale nouns.**
  `30+ tezgah` fires (the older rule, noun immediately after the digit) but
  `30+ yeni tezgah` is silent, and so are `25+ deneyimli mühendis`,
  `40+ tam zamanlı personel`, `150+ aktif müşteri` and `5.000+ kapalı metrekare`.
  The widened rule's noun list is inventory-only; the JSX-residue rules right
  below it *do* carry `tezgah|makine|mühendis|teknisyen|personel|çalışan|müşteri|
  metrekare`, so the omission looks like an oversight rather than a decision.
  Out of scope for F2 as written — none of the three live claims I proved was of
  this class — but it is Hole 1's own mechanism, half-applied.
- **H2 — a false positive on ordinary JS concatenation.** `"" + malzemeAdi` and
  `'x' + renkKodu` fire on the string-literal-boundary rule. The commit message's
  rationale ("prose does not start with a bare plus") is about prose and this rule
  runs over code, where `"" + x` is an idiom. It fails *loud*, so it costs a human
  adjudication rather than leaking a claim, and nothing in the tree trips it today.
- **H3 — the annual-volume class is still ungated.** `50.000 adet/yıl` is caught by
  **neither** gate, in any of six forms (`adet/yıl`, `adet / yıl`, `adet/ay`,
  `100-10K adet/yıl`, `yıllık N adet`, and inside a label/value pair). The
  spelled-out `50 bin adet` is caught; the numeric form is not. Re-adding the exact
  line F1 removed leaves the gate at `PASS — 0`. Pre-existing (not introduced by
  this phase) and not live — `publishableSpecValues()` defends the listing surface
  by construction — but the class that produced F1 has no static guard.
- **H4 — `overlays.ts`'s stated reason for excluding the cursor is imprecise.** It
  says the cursor "paints nothing until a real pointer moves". Measured: both
  layers are at `opacity: 1` from mount and merely parked at (-3,-3) / (-22,-22),
  so 3×3 of the dot and 22×22 of the ring lie inside the viewport. The
  *conclusion* holds empirically — my teal scan finds 0 exact-colour pixels in all
  100 goldens — but the reason given is not the reason it holds, and a future
  golden that crops the top-left corner would not be protected by it.
- **H5 — `require: false` is currently safe but unguarded.** All three
  `require: false` call sites are on `/` only (`landing-golden` and
  `navigation-golden` visit `/` exclusively; `shell-golden` passes
  `surface.path !== "/"`). Nothing prevents a later phase from adding a non-`/`
  route with `require: false`, which would silently restore the A2 defect.
- **H6 — the chip filter is conservative in two places worth knowing about.**
  `malzeme-kutuphanesi` shows no chips because its label contains `Stok`, and the
  withheld rule `/sto[kğ]|depo/i` is unqualified by a quantity (the gate's own
  stock rule requires `kg|ton` nearby) — so `Sürekli Stok = Al 6061, Al 7075`, a
  material-grade list, is suppressed. And `makine-parkuru` loses `3, 4 ve 5 eksen`
  because the allowlist has no axis-count class, while `claims-gate.mjs`'s own
  negative controls deliberately keep `5 eksen` as a specification. Neither leaves
  a row empty of *measurements* that exist, so neither is over-removal in the
  packet's sense.
- **H7 — a small counting drift, not worth a cycle.** The Coder reports 44 listing
  rows (I measure 48; the count that matters, 23 changed, is exact), 39 hidden
  elements under A7 (I measure 38; `hiddenText=12` matches exactly), 2 at-rest
  contrast failures at 1280 (I measure 1), and "2 strays" on
  `inner-hero-material-family` (I measure 32, a bbox-edge difference). Every
  direction and every endpoint agrees.

---

## 6. Retired — my own errors this round

- **Rail numbers.** My first F3 probe asserted the not-found rail number equalled
  the family number (03/04/05), inferred from a summary rather than from the code.
  `CategoryPage`/`ServiceDetail` pass `no="01"` for the hero and `no="02"` for the
  band; the family lives in the **label**, and the label is right on all six.
  Rescored. **The Coder was right and I was wrong.**
- **Disc-vs-stray classification.** My first A2 adjudication classified by colour,
  which threw the launcher's white speech-bubble icon out into the "strays" and
  produced 15,662 strays with 5,973 darker — an apparent contradiction of §8.2.
  §8.2 locates the launcher as a connected changed *region*, which is correct.
  Reclassified; the numbers then match the doc. **The doc was right and my
  instrument was wrong.**
- **Two probe-order mistakes**, both corrected in the committed files: the F4
  "armed" case used a bare `goto` where the golden specs use `gotoAndSettle` (the
  face files are fetched lazily after the stylesheet parses, so gstatic read 0);
  and the A2 overlap case compared a `position: fixed` viewport rect against an
  unscrolled footer rect.
- **A wrong route list.** My first chip probe used 15 invented category slugs, 12
  of which do not exist; it measured 8 rows instead of 48 and was silently
  measuring not-found bodies. Regenerated from `src/data/categoryPages.ts`.
- **The contention hypothesis is corroborated, and I withdraw my 11 failures.**
  The Orchestrator's five bounded chunks give 163 passed / 3 skipped / 0 failed at
  both widths. I do not dispute it.

---

## 7. Commands run

```text
npm run build                                                   PASS (1m 1s)
node reports/qa/phase-07c1/probes/f2-setdiff.mjs  × 3 trees      LOST 0 / 0 / 0
node reports/qa/phase-07c1/probes/f2-probe.mjs    × 2 batteries  55 + 21 probes
esbuild src/content/claims.ts + 34-case unit battery             29/34 as expected
node reports/qa/phase-07c1/probes/q1-chips.mjs    × 2 builds      48 rows, 23 changed
node reports/qa/phase-07c1/probes/q2-leaf.mjs                     0 problems / 27
node reports/qa/phase-07c1/probes/q3-notfound.mjs × 2 builds      0 vs 12 problems
node reports/qa/phase-07c1/probes/q4-radius.mjs   × 2 modes       6 sources
node reports/qa/phase-07c1/probes/q4b-cursor.mjs                  opacity 1, radius 50%
node reports/qa/phase-07c1/probes/p6-contrast.mjs × 4 runs        5→0 @375, 1→0 @1280
node scripts/motion-audit.mjs --mode=rest         (integrated)   PASS, 12 pairs
node scripts/motion-audit.mjs --mode=enabled      (integrated)   armed=44/12
node scripts/motion-audit.mjs --mode=rest         (pre-fix)      FAIL, 38/12
node .../q5-motion-audit-PRE-A7.mjs --mode=rest   (pre-fix)      PASS — the blind spot
node reports/qa/phase-07c1/probes/q6-launcher-scan.mjs            0/100, control 52
node reports/qa/phase-07c1/probes/q7-golden-reveal.mjs            25 × one bbox
node reports/qa/phase-07c1/probes/q8-golden-adjudicate.mjs        geometry ±1px, 4 darker
npx playwright test e2e/visual/qa-f4-font-guard.spec.ts           4/4 @1280
npx playwright test e2e/visual/qa-a2-overlay-guard.spec.ts        16/16 @375/768/1280/1440
npm run test:e2e:visual  (64 existing + 32 mine)                  96 passed (8.0m)
```

My two specs live in `e2e/visual/` and are matched by the suite's `testMatch`, so
`npm run test:e2e:visual` is now **96 executions, not 64**. All 64 pre-existing
golden comparisons still pass unchanged alongside them.

Full logs and JSON: `reports/qa/phase-07c1/`.

Not re-run (already re-derived independently by the Orchestrator on `6f37eb0`):
`npm run typecheck`, `node scripts/claims-gate.mjs`, `node scripts/grid-axis-probe.mjs`,
`motion-audit --mode=guard`, and the five-chunk critical suite.

---

## 8. Scope integrity — **PASS**

Production files modified by QA: **NONE**. `git diff --name-only 6f37eb0 HEAD`
contains only `e2e/visual/qa-f4-font-guard.spec.ts`,
`e2e/visual/qa-a2-overlay-guard.spec.ts` (both QA-authored, both new) and
`reports/qa/phase-07c1/**`. No golden was regenerated or deleted; no
`maxDiffPixels`, tolerance, skip or assertion was changed anywhere.

Coder scope, checked independently: the eleven correction commits touch
`src/content/claims.ts`, `src/data/servicePages.ts`, `src/pages/{CategoryPage,
MalzemeKategori,ServiceDetail}.tsx`, `src/components/MaterialMorphScroll.tsx`,
`scripts/{claims-gate,motion-audit}.mjs`, `docs/lean/17`, five `e2e/visual/*`
files and 25 golden PNGs. `ChatBot.tsx` (`7a5daf0`) and `CustomCursor.tsx`
(`98e64ab`) are byte-identical to the Phase 06 close. The whole `e2e/` diff across
Phase 07 is **443 insertions, 0 deletions**.

---

## 9. Still open, for the PROGRESS.md record

- **F5-R (this report, §3)** — the radius register lists 3 of 5 sources.
- **H1–H7 (§5)** — hardening notes, no cycle required.
- **A3** — three suites, three font policies. Phases 14/15.
- **A4** — the published address expansion. Adjudicated harmless.
- **A6** — `/iletisim`'s Meet-invite promise (4 → 2). Phase 09.
- **A8** — the register scrolls at 768 with all ten columns. Phase 08.
- **The launcher obstruction itself** — at 1280 it covers 91% of a
  `.shell-row-toggle` line box; at 375 it fully covers five `<td>` glyph line
  boxes. `ChatBot.tsx` is out of scope here. Phases 09/13. Note that A2 makes this
  *more* visible, not less: the goldens no longer hide it.
- **`motion-grammar:254` at `tablet-768` / `landscape-844`** — pre-existing on both
  trees, Phase 05's, carried to Phase 13.
- **New this round, for Phase 11's benefit:** the ~48 real service/sector detail
  routes now emit per-page `<title>`s where they previously emitted the site
  default. Nothing depended on the old value.
