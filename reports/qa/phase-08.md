# QA Report — Phase 08 · ROUND 4 (closing)

- PHASE: 08 — INNER PAGES WAVE B
- CODE_COMMIT: `27de482` (C5: `5003c66 · a727e54 · 27de482`)
- WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p08` on `wt/qa-p08r4`
- STATUS: **PASS**
- TESTS_PASSED: 214 in this round's scope (guard 26 over three lanes, four visual projects 146, qa-p08 storage + wave B 37, motion-grammar 10 of 12)
- TESTS_FAILED: 2 — R2-3 only, both lanes, carried to Phase 10 per A23
- TESTS_SKIPPED: 19 (18 visual `installFontRetry` lanes; 1 live control skipped at 1280 by design)
- NEW_TESTS_ADDED: 3 (`wrongSurfaces()` plus its completeness control, its fixture control, and a live-404 control), and the live R2-1 control re-aimed and strengthened
- SCOPE_INTEGRITY: **PASS** — nothing outside `e2e/qa-p08-*.spec.ts` and `reports/qa/**`

**Why PASS, in one paragraph.** C5's two class names are correct and I
reproduced their justification independently: with the fix's effect removed in
the live DOM, exactly **14** route × viewport instances go red, the same set and
the same numbers C5 reported, and as shipped **zero** problems appear over 10
routes × 6 widths. Both untouched call sites measure track == column at every
width. Çerez madde 03 renders without a numeral and names the hosting case with
its triggers. No golden moved. The round's real work was mine to fix: **my guard
walked two 404s**, which is why `KabiliyetProfilDetay.tsx:157` had no watcher,
and it now carries a surface check that a 404 cannot pass. I also **re-aimed my
own live control**, because it was forbidding a root fix that C5 measured safe —
and I measured the block myself before changing anything.

---

## R4-1 · GUARD_FIXED — two 404s, and the control that closes the hole

`reports/qa/phase-08/r4/p1-route-surface.json`, 27 routes at 375.

| walked path | rendered `<h1>` | tables | `<main>` chars |
|---|---|---|---|
| `/kabiliyet-profilleri/ince-cidarli-aluminyum-govde` | **Bu profil kaydı bulunamadı** | 0 | 768 |
| `/endustriyel/havacilik` | **Bu sayfa kaydı bulunamadı** | 0 | 667 |
| `/kabiliyet-profilleri/ince-cidarli-govde` (real) | İNCE CİDARLI GÖVDE | 1 | 2282 |
| `/endustriyel/havacilik-uzay` (real) | Havacılık & Uzay | 3 | 7210 |

**Why `TABLE_CENSUS` could not see it.** The census is a floor keyed *by route*.
It listed neither walked path, so it expected 0 tables and got 0. It was written
to stop a walk that measures nothing on a route that *has* tables; it says
nothing about a route that does not exist. Same shape as `d3c8a6c`'s dead axe
sentinel: a gate reports green for the reason an empty scan does.

**Corrected list.** Both slugs replaced with the real ones; the other two
capability profiles added, because C5 measured all three carrying R3-1. The walk
now sees **22 tables over 24 routes** (was 16 over 22) and 85 header cells over
12 routes. `TABLE_CENSUS` gains four floors.

**What the corrected list finds: no new red anywhere.** mobile-320 9/9,
mobile-375 9/9, desktop-1280 8 passed / 1 skipped, production code unedited.
Every surface C5 fixed is now watched, and C5 missed nothing.

**The new control — `wrongSurfaces()`.** A second pure function over per-route
`<h1>` records, wired into *both* walks *before* any table assertion. Three
rules: the route must have a declared `ROUTE_SURFACE`; its `<h1>` must not be
one of the app's four not-found headings; and it must match the route's own
pattern. `PUBLIC_ROUTES` and `ROUTE_SURFACE` are asserted equal in both
directions, so adding a route without saying what it renders now fails.

A character floor would have been the obvious check and it does **not** work
here — the test proves that rather than assuming it: the not-found bodies
(667 / 768 / 792) are **longer** than `/reset-password` (490),
`/sifremi-unuttum` (483), `/teklif-al` (493) and `/giris` (629). Hence the
`<h1>` key.

Its own controls: a fixture over the two transcribed 404 bodies, a route
rendering a different page, an undeclared route, the positive case; and a live
one that drives the app to both historical dead paths plus a nonsense path,
measures each **under the identity of a route that is walked** — the exact
substitution the defect performed — and requires all three rejected. Measured
live: `["Bu profil kaydı bulunamadı · 0 tables · 768 chars", "Bu sayfa kaydı
bulunamadı · 0 tables · 667 chars", "Bu koordinatta kayıt yok · 0 tables · 792
chars"]`.

---

## R4-2 · C5_VERIFIED — the 14, the two untouched sites, and a misattributed risk

**The 14, reproduced independently** (`r4/p2-r31.json`; 10 routes × 6 widths ×
2 states = 120 measurements). As shipped: **0** problems at every width. With
the fix's effect removed in the live DOM — the implicit `auto` track put back on
every `div.shell-stack` holding a `figure.shell-table` — exactly **14** route ×
viewport instances go red, all of them the R2-1 "container's OWN box" shape:

| route | 320 | 375 | 390 |
|---|---|---|---|
| `/hizmetler/cnc-frezeleme` | **295.078** | ok | ok |
| `/hizmetler/cnc-tornalama` | **358** | **358** | **358** |
| `/hizmetler/anodizasyon` | **313.938** | ok | ok |
| `/hizmetler/derin-delik-raybalama` | **306.156** | ok | ok |
| `/hizmetler/hassas-mikro-isleme` | **305.281** | ok | ok |
| `/kabiliyetler/malzeme-kutuphanesi` | **351.844** | **351.844** | **351.844** |
| `/endustriyel/havacilik-uzay` | **295.078** | ok | ok |
| `/kabiliyet-profilleri/ince-cidarli-govde` | **314.453** | ok | ok |
| `/kabiliyet-profilleri/titanyum-baglanti-parcasi` | **327.281** | ok | ok |
| `/kabiliyet-profilleri/hassas-mil` | **325.172** | ok | ok |

Against a 278 / 333 / 348 px column. Same set, same numbers as C5's commit
message. Nothing at 768, 1280 or 1440 in either state.

**The two untouched call sites are genuinely safe.** `ServiceDetail.tsx:512`
and `Malzemeler.tsx:177` both measure track == column at 320 / 375 / 390 / 768 /
1280 / 1440 — 278 / 333 / 348 / 710 / 1213.984 / 1374 — with
`scrollWidth == clientWidth` in every case. Neither contains a table.

**C5's Malzemeler risk flag is MISATTRIBUTED, and the register needs no
watcher.** `Malzemeler.tsx:177`'s `shell-stack` holds `ul.shell-segments` and an
optional action — no table. The **filterable register is in a different
wrapper**, `div.shell-span-full.shell-register-scope`, which is not a
`shell-stack` and does not carry the `auto`-track shape at all. Measured across
all 12 filter states at 320 and 375 (`r4/p3-untouched.json`): the wrapper box
stays at the column (278 / 333) in **every** state while the table ranges
491.484–543.141 inside a live `.shell-table-scroll` (543/276 at 320). The widest
state is the **default unfiltered one** (543.141, "Tümü") — the state the guard
already walks — and filtering or searching can only remove rows, which cannot
raise min-content. The guard's existing coverage is already the worst case.

One thing C5 noted that I confirm: that scroll region carries `tabindex=null` at
every filter state. Correct by design, not a gap — `useScrollableRegionAccess`
grants a tabindex only when the region contains no focus stop, matching axe's
`scrollable-region-focusable`, and the register's rows contain links.

---

## R4-3 · LEGAL — madde 03 rendered, and what remains closed

Rendered from the live DOM (`r4/p4-cerez-politikasi.txt`), madde 03 now opens
**"Tarayıcınızın bu sitenin dışına istek gönderdiği yerler aşağıda tek tek
sayılıdır."** and closes **"İsteğin gittiği yerler bunlardır."** — `/kvkk` madde
04's shape, no numeral. Four labelled cases: fonts, the security component, the
hosting/database infrastructure, the chat assistant. The hosting paragraph names
its triggers — sign-in, password reset, contact form, RFQ, each chat message —
**and** "giriş yaptıysanız oturumunuzu açık tutmak için", which is the case my
own packet's suggested "a page load" framing would have got wrong. C5 was right
to refuse it: `persistSession: true` + `autoRefreshToken: true` means a
signed-in reader reaches that host on a plain load.

Nothing new is claimed about any third party after receipt. The hCaptcha
paragraph explicitly disclaims it; the chat paragraph defers to
`/gizlilik-politikasi` madde 06; the hosting paragraph asserts only what the
browser does and cites `/kvkk` madde 04.

**The count-closed list defect is gone from all three documents. Three
closed-at-one claims remain**, and I record them rather than declare the
criterion met on a scan:

| claim | verdict |
|---|---|
| çerez md 01 / gizlilik md 03 — "**Tek istisna** giriş sayfası[dır]" (cookies) | TRUE and *watched* — `qa-p08-storage-disclosure.spec.ts` walks the public routes for cookies and is 6/6 |
| gizlilik md 05 — "Sayfalara gömülü **tek** üçüncü taraf bileşeni" | TRUE — verified independently: no `<iframe>` anywhere in `src/**` outside hCaptcha's own injected frames, and `index.html` carries no third-party `<script src>` (the font links are stylesheets). It survives the action that falsified "üç yer": logging in, sending an RFQ or opening the chat embeds nothing |
| gizlilik md 02 — "…dışarı çıktığı **tek yer**" | see R4-5 |

The operative rule this phase has applied three times is *a closed claim is a
defect when a reader can falsify it by doing what the site asks*. The first two
survive that test; the third is adjudicated below.

---

## R4-4 · CONTROL — my live control was forbidding the root fix. I re-aimed it.

**The block is real, and I measured it myself before touching anything**
(`r4/p6-old-control.json`, `/cerez-politikasi` at 375):

| state | container box | client/scroll | forced `scrollLeft` | tabindex | checker |
|---|---|---|---|---|---|
| shipped (`shell-doc-table`) | 42 → 375 | 331 / 584 | 253 | `"0"` | clean |
| old control (`shell-stack` restored) | 42 → **627.875** | 584 / 584 | **0** | `null` | **R2-1 fires** |
| old control **+** `.shell-stack > * { min-width: 0 }` | 42 → 375 | 331 / 584 | 253 | `"0"` | **zero problems** |

With the systemic fix in the stylesheet the old control cannot express the
defect, reports zero problems where it demands one, and the guard fails. C5's
account is exact, and its choice of (a) was correct under its instructions.

**Ruling: re-aim the control; keep it live. The class fix is now available.**

The reason is not that C5 was inconvenienced. It is that the old control had
**two jobs and only one of them is a control's**. Catching a regression of this
defect is the *walk's* job, and the walk does it over 24 routes and three lanes.
This test exists solely to prove `unreachableTables()` is not hollow — an
instrument check. By sourcing its defect from *production being broken*, it made
repairing production a test failure: a defect ratchet. That is strictly worse
than the marginal realism it buys, and it was my error in round 3, not C5's in
round 5.

**What the re-aim keeps and what it changes.** It stays live — real page, real
engine, real collector, on `/cerez-politikasi` — because that is its whole value
over the transcribed fixture. What changes is how the defect gets there: it is
now **built** from inline geometry (`display: grid`, `grid-template-columns:
auto`) on a wrapper stripped of every class, so no stylesheet rule can reach it.
It is also **strengthened**, not softened: it asserts the defect's shape
(`containerRight` past the viewport, `forcedScrollLeft` exactly 0) rather than
only a problem count, and it ends by **injecting
`.shell-stack > * { min-width: 0 }` and requiring itself to still fire** — a
control on the control, so the ratchet cannot silently come back. Verified green
at mobile-320 and mobile-375 with that injection in place.

**Consequence for the Orchestrator:** `.shell-stack > * { min-width: 0 }` is no
longer blocked by the spec. C5 measured it safe over 76 routes × 7 viewports
with no golden movement. It is a clean systemic cleanup for a later phase; it is
**not** needed for Phase 08, because the two call-site classes already close all
14 instances.

---

## R4-5 · MADDE02 — contestable, not false. And here is the measurement.

`/gizlilik-politikasi` madde 02: *"Sohbet kutusuna yazdıklarınız da kaydedilmez;
ama onay verirseniz bir yapay zekâ servisine iletilir. Bu, sitede yazdığınız bir
metnin dışarı çıktığı **tek yer** olduğu için ayrı bir maddede — 06. maddede —
anlatılıyor."*

**The measurement, which I ran rather than reasoned about**
(`r4/p5-outbound.json`). Every non-loopback request intercepted and **aborted**,
so nothing was written anywhere; what is recorded is the request the browser
attempted. Filling `/iletisim`'s free-text "Ek notlar" box and pressing submit:

```
POST https://<project>.supabase.co/rest/v1/meetings
{"name":…,"notes":"Bu bir not: QA-R4-MARKER-9f3a1c"}
```

The typed string leaves verbatim for a host on a different registrable domain.
`/teklif-al` does the same at source with the typed "Kritik ölçüler" and
"Parça/Revizyon" strings (`TeklifAl.tsx:534` → `functions.invoke("rfq-rate-limit")`).
A text the reader wrote on the site reaches a non-site host in at least two
places besides the chat. **The Orchestrator's factual premise is understated,
not overstated.**

**And I still rule it contestable, for a reason the measurement does not
settle.** The predicate is not a host count. Çerez madde 03 counted *request
destinations* — "üç yer" was false because 3 ≠ 4, and no reading survives that.
Madde 02 makes a **custodial** claim about where a text *goes*, and "dışarı" is
undefined in the set, which uses it in two senses:

- **against the sentence** — gizlilik md 05 files the hosting transfer under the
  heading "Üçüncü taraf istekleri", and `/kvkk` md 04 enumerates it as an
  *aktarım*;
- **for the sentence** — md 05's own body calls it "**sitenin** barındırma ve
  veri tabanı altyapısı", the site's *own* infrastructure, and under KVKK a
  *veri işleyen* acting on the controller's instructions is precisely not a
  third party with purposes of its own. On that reading Gemini is the only
  recipient outside the processing chain and the sentence stands exactly.

Two honest readings, both licensed by the document set, and — decisively — **no
reader is deprived of the fact**: md 05 states the RFQ/hosting transfer
unqualified two clauses later, `/kvkk` md 04 enumerates it, and after C5 çerez
md 03 names it with its triggers. That is what separates this from R2-2, where
"hiçbir çerez oluşturulmuyor" had exactly one reading, a cookie existed, and the
fact was disclosed **nowhere**.

**Verdict: CONTESTABLE. Phase 08 closes.** Not comfortable, and it should be
carried by name rather than silently: the sentence is defensible only because
"dışarı" is undefined, and this phase has spent three corrections learning what
an undefined absolute costs. Its natural owner is Phase 09's mandatory "Align
KVKK/privacy copy with actual data flow", which rewrites the RFQ path the
sentence turns on. The repair, when it comes, is one clause: say *what* leaves
and *to whom* instead of counting places.

**What would flip this to FALSE.** If any typed text reached a party outside the
site's own processing chain — an analytics endpoint, a form-relay service, an
email provider called from the browser — without consent. I measured for that:
over the whole `/iletisim` submit path the only non-loopback hosts the browser
attempted at all were `fonts.googleapis.com` and the one `*.supabase.co` project
host. (`fonts.gstatic.com` never appears because aborting the font stylesheet
means the font files are never requested; round 2 measured those two font hosts
as the complete set on every non-`/giris` route.) There is no third recipient.

---

## R4-6 · GOLDENS — unmoved, confirmed three ways

1. All four visual projects run per project and green: `visual-375` 35 passed /
   6 skipped, `visual-768` 35 / 6, `visual-1280` **41 passed, 0 skipped**,
   `visual-1440` 35 / 6. No `--update-snapshots` in any invocation.
2. `git diff 9dc1353..27de482 -- e2e/__golden__` is **empty** — C5 rebanked
   nothing, so the claim is not "the diff passed", it is "there was no diff to
   pass".
3. `git status --porcelain e2e/__golden__` clean after my four runs.

116 baselines, none under 2 kB, so nothing is a degenerate blank.

---

## R4-7 · CARRIED AND OUT OF SCOPE — confirmed, nothing more

- **R2-3** still red at *both* lanes, identical cause:
  `motion-grammar.spec.ts:291` expects `.tl-dimension-lines` hidden and measures
  `"visible"`; 5 passed / 1 failed at `tablet-768` and at `landscape-844`.
  Carried to Phase 10 per A23.
- Criteria 3 and 5: carried per A20/A21, verified twice, not re-measured.
- hCaptcha, `Login.tsx`, `KVKK.tsx`: settled, untouched.
- Not re-run this round, per packet: full regression, cross-browser, contrast,
  whole-page axe. C5's production delta is two class names plus legal copy, and
  round 3 covered those lanes at `49a1af6`.

## R4-8 · GATES

| gate | result |
|---|---|
| `npm run build` | exit 0, 41.76 s |
| `npx tsc -b` | exit 0 |
| `node scripts/claims-gate.mjs` | **PASS** — 0 unverified claims, 27 rules, 214 files |
| `qa-p08-scroll-region-reach` × 3 lanes | 26 passed, 1 skipped by design |
| `qa-p08-storage-disclosure` | **6/6** |
| `qa-p08-waveb-contract` | 37/37 |
| visual × 4 | green, no golden moved |
| `git status` | nothing outside `e2e/qa-p08-*.spec.ts` and `reports/qa/**` (two `.tsbuildinfo` artifacts left alone per packet) |

---
---

# — ROUND 3 REPORT BELOW, UNCHANGED —

- PHASE: 08 — INNER PAGES WAVE B: quality, projects, blog, resources, legal, search/discovery, 404/error
- CODE_COMMIT: `49a1af6` (round-2 base `a5e4e7d` + the three C4 commits `6981a4d · 3e2f7dc · c79147b` + the PROGRESS entry)
- PRIOR ROUNDS: round 1 at `5138fc1` **FAIL**; round 2 at `b77be5c` **FAIL**. Both preserved below, in full, including round 2's retraction of its own round-1 claim.
- WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p08` on `wt/qa-p08r3`
- STATUS: **PASS**
- TESTS_PASSED: 1168
- TESTS_FAILED: 5 (3 distinct causes; 1 is an environment stall that is green in 9.9 s on isolated re-run, 2 are R2-3 carried per A23, 2 are one new PRE-EXISTING defect my own new guard found on a Phase 07 surface)
- TESTS_SKIPPED: 557
- NEW_TESTS_ADDED: 6 (`e2e/qa-p08-scroll-region-reach.spec.ts`), plus test 3 of `e2e/qa-p08-storage-disclosure.spec.ts` re-aimed per A24 and both of its negative controls extended

**Why PASS, in one paragraph.** Both blocking defects are fixed and I verified
each against the running browser rather than the diff. R2-1: all **24 of 24**
cells of `/cerez-politikasi` madde 02 are reachable at 320, 375 and 390 —
`tabindex="0"`, `role="group"`, `aria-label="Yerel depo kayıtları"`, and
ArrowRight drives the region to its maximum (308 / 253 / 238 px) — while
768/1280/1440 are unchanged, which I proved by A/B-ing the pre-C4 markup back
into the live DOM rather than by trusting a claim. R2-2: all **eight** rewritten
sentences render as quoted, every attribute madde 01 publishes about `__cf_bm`
is measured (29.9-minute lifetime, `httpOnly`, `document.cookie` empty, two
`newassets.hcaptcha.com` iframes, no interaction required), `/kvkk` madde 04
carries no numeral at all with the supplier transfer inside the enumeration, and
nothing in any of the three documents claims what hCaptcha or Cloudflare do
after receipt. The footer invariant holds under all four rename scenarios and
`bantOrani` is still **0.23203125**. All four visual projects are clean and the
116 goldens are **byte-identical** before and after. **Three premises fell this
round, and one of them is the packet's own:** the guard predicate I was asked to
write — `scrollWidth <= clientWidth + 1 || isScrollable(el)` — measures **TRUE
on R2-1**, so I built the guard on what actually discriminates; my round-2
"≥1024" footer boundary is wrong and C4's 1181 is right; and C4's "reachable by
`End`" does not reproduce — `End` moves nothing, ArrowRight is the key.

> Round-3 evidence is in `reports/qa/phase-08/r3/`; round-2 in
> `reports/qa/phase-08/r2/`; round-1 in `reports/qa/phase-08/`. Evidence files
> carry `.txt` rather than `.log` because `.gitignore:3` is `*.log`.

---

## 1. TABLE_REACH — reconciled, with my own instrument

`probe-table-reach-r3.mjs`, six viewports, against a **fresh build at
`49a1af6`**. The first thing I measured was that the `dist/` standing in the
tree was **pre-C4** — no `cf_bm` anywhere in it — so every measurement in this
section would otherwise have been a measurement of the old page.

Cells = 4 header cells + 20 body cells = 24.

| viewport | cells reachable | figure | scroll region client/scroll | forced `scrollLeft` | affordance |
|---|---|---|---|---|---|
| 320 | **24 / 24** | 278 | 276 / 584 | 308 | `tabindex="0"` `role="group"` `aria-label` |
| 375 | **24 / 24** | 333 | 331 / 584 | 253 | same |
| 390 | **24 / 24** | 348 | 346 / 584 | 238 | same |
| 768 | **24 / 24** | 710 | 708 / 708 | fits | none — correctly, nothing overflows |
| 1280 | **24 / 24** | 809.328 | 807 / 807 | fits | none |
| 1440 | **24 / 24** | 916 | 914 / 914 | fits | none |

**Round 2 and C4 are both right.** Round 2 measured the page before the fix and
C4 measured it after; the fix landed in between. Round 2's numbers reproduce
exactly on the pre-fix markup (§2.1).

**Two C4 details do not reproduce. Neither is load-bearing.**

- **`End` does nothing.** `scrollLeft` stays 0 at all three widths. The region
  has no *vertical* overflow and `End` is a vertical-end key.
- **ArrowRight is the key that works.** ×30 drives `scrollLeft` to the maximum
  and puts the last header fully inside the viewport. It is the key
  `useScrollableRegionAccess`'s own comment names, and it is the WCAG 2.1.1 path
  the granted `tabindex` exists to open. C4's conclusion holds; its named key
  does not.
- **Touch I cannot demonstrate, and I am not going to claim it.**
  `Input.dispatchTouchEvent` drags the **document** vertically (335 px) but
  moves no inner region — not this one, and not `/hizmetler/cnc-frezeleme`'s
  pre-existing region (331/637, `tabindex="0"`), which ArrowRight moves 306 px
  in the same session. `Input.synthesizeScrollGesture` moves nothing at all,
  including the document. `touch-action` computes `auto` on the region and on
  **all 15 ancestors** up to `<html>`, so nothing forbids panning. Instrument
  limitation, recorded rather than asserted. (`touch-control.json`)

### 1.1 768 / 1280 / 1440 unchanged — measured, not inferred

Round 2 recorded no digits at those widths for this route, so instead of
comparing against a record I do not have, I A/B'd it live: restore the pre-C4
markup on the loaded page (`className` → `shell-stack`, `data-gap="sm"`) and
re-measure in the same layout pass. `wrapper-ab.json`:

| viewport | shipped | reverted | identical? |
|---|---|---|---|
| 768 | figure 710, region 708/708, right 767, 0 offscreen headers | figure 710, region 708/708, right 767, 0 offscreen headers | **yes** |
| 1280 | figure 809.328, region 807/807, right 874.328 | figure 809.328, region 807/807, right 874.328 | **yes** |
| 1440 | figure 916, region 914/914, right 981 | figure 916, region 914/914, right 981 | **yes** |

The C4 comment's account of the cause also reproduces: reverted, the wrapper is
`display: grid` with `grid-template-columns: 585.875px` and the figure's
`min-width` is `auto`; shipped, it is `display: block` with `min-width: 0px`.

---

## 2. NEW_GUARD — `e2e/qa-p08-scroll-region-reach.spec.ts`

### 2.1 The packet's own predicate is inert on the defect it was written for

This is the round's third fallen premise and it changed the shape of the file.

The C4 comment and the QA packet both propose
`scrollWidth <= clientWidth + 1 || isScrollable(el)`. In the same live A/B:

```
375  PRE-FIX   region box 584 wide, right edge 627.875, scrollWidth 584   -> predicate TRUE
     POST-FIX  region box 331 wide, right edge 375,     scrollWidth 584   -> predicate TRUE
```

**Pre-fix the scroll region FIT ITS OWN BOX** (584 content in a 584 box), so
that expression is TRUE on R2-1 at 320, 375 **and** 390. The region was never
too narrow for its table; the region was *wider than the viewport*, so
`overflow-x: auto` had nothing to do. The failure sits one level above where the
predicate looks. What discriminates is the container's own right edge (627.875
against a 375 viewport) and whether a forced `scrollLeft` sticks (0 pre-fix,
253 post-fix).

### 2.2 What the guard actually walks and asserts

It walks every **`<table>`** on every public route — not a class. A class-keyed
walk cannot see a table whose wrapper changed, and the landing's
`.tl-nexus-table-wrap` is already a second wrapper. For each table it finds the
nearest scrolling ancestor and asks four questions in order:

1. does the table already lie inside the viewport;
2. if not, is the **container's own box** inside the viewport — the R2-1 rule,
   and the only one of the four blind instruments that could have caught it;
3. driven to maximum scroll, does the table's right edge come inside the
   viewport — by assignment, not by computed style, because `clip` and an
   unsized grid track both leave `scrollLeft` at 0;
4. and can a keyboard reader reach it (WCAG 2.1.1). The "focus stop inside"
   branch is deliberate: it is the same rule the production hook and axe apply,
   and `/malzemeler`'s register qualifies through it.

A second test asks the symptom directly: every header cell's **start and end**
can be brought inside the viewport.

Walk size, measured: **16 tables over 8 of 22 routes, 64 header cells.**

### 2.3 Its controls

Three fixture records `unreachableTables()` must reject — R2-1's own measured
numbers kept as a permanent fixture, a clipped overflow, and a scroller with no
focus stop — plus two acceptance sanity cases so the checker cannot pass by
rejecting everything. And one **live** control that is the one that matters: it
restores the pre-C4 markup in the DOM of the real page and requires the guard to
go red, on both tests. It does.

### 2.4 Two instrument bugs of my own, found and fixed before it was trusted

- The first version walked on `gotoAndSettle` alone and reported **zero tables
  on `/malzemeler`**, which has one. Same vacuous-measurement shape as the
  storage spec's first version. It now settles the network per route **and**
  asserts a per-route floor against a measured census (`table-classes.json`), so
  a walk that measures nothing can no longer pass everything under it.
- The header sweep targeted `cell.offsetLeft - table.offsetLeft`, which assumes
  cell and table share an `offsetParent`. On `/kabiliyetler/kalite-kontrol`'s
  three tables they do not; it under-scrolled ~44 px and reported **four
  reachable columns as lost**. It now computes the target from live rects, and
  asks start-reachable and end-reachable separately — because a header cell can
  be **wider than its port** (282.6 px in a 278 px port at 320) and no scroll
  position frames it whole. WCAG 1.4.10 permits two-dimensional scrolling for
  tabular data, and I am not going to fail a table a reader can read.

### 2.5 What it caught on its first run — FINDING R3-1, PRE-EXISTING

| lane | result |
|---|---|
| `mobile-375` | 6 passed |
| `desktop-1280` | 5 passed, 1 skipped (the live control is a narrow-width defect) |
| `mobile-320` | 4 passed, **2 failed** — one finding, reported by both tests |

```
/hizmetler/cnc-frezeleme table#1 (CNC Frezeleme — malzeme kaydı):
  the scroll container's OWN box runs from 42 to 337.078 in a 320px viewport
  "Özellik" (108.58px in a 293px port) start=ok end=lost at 336.08
```

295.078 px wide — **the same number round 2 recorded as a marginal Wave A
observation.** Same mechanism as R2-1: `div.shell-span-full shell-stack`, an
`auto` grid track that cannot shrink below the figure's min-content.

**Attribution, checked at source.** The whole phase's diff
(`7dcfb65~1..49a1af6`) touches neither the page nor its data, and its
`shell.css` and `ShellComposition.tsx` diffs contain **no occurrence** of
`shell-stack`, `shell-span-full` or `shell-table` — they only add
`.shell-doc-*`, `.shell-faq-*`, `.shell-notfound-*`, `.shell-contents` and
`.shell-notice`. **Phase 07's surface, one column not three, 320 only.**

I am not weakening the assertion to hide it. R2-3 is the precedent: a red the
phase did not cause, reported and handed up. **This does not fail Phase 08** —
criterion 2 is about the Wave B surfaces, and `/hizmetler/cnc-frezeleme` is not
one of them.

---

## 3. TEST3_REAIMED — A24, and why it is a re-aiming

`e2e/qa-p08-storage-disclosure.spec.ts` test 3 was
`expect(cookies).toEqual([])`. It is now **"every cookie observed on any public
route is covered by the published disclosure"**, and the file carries the
reasoning where the next reader will find it.

**Why the old one had to go.** It encoded a *published claim*, and it did its
job — it held `/cerez-politikasi` to its own word and it is how R2-2 surfaced at
all. That claim has since been retired **because it was false**. Madde 01 no
longer says no cookie is created; it discloses one by name, domain, flags and
lifetime. So the assertion no longer corresponds to anything the site asserts:
left as it was, it fails on a **correctly disclosed** cookie. A red gate over a
green document teaches the next person to delete the gate.

**Why the new one is stronger, not weaker.**

- The old one could not tell a disclosed cookie from an undisclosed one — both
  were simply "a cookie", both red. The new one goes red the day an
  **undisclosed** cookie appears and stays green while the document keeps up
  with the browser. That is the property that protects a reader.
- It checks **both halves**: the name must be published as a `<code>` token
  **and** the cookie's host must be one the document names, or a subdomain of
  one. `__cf_bm@.evil.example` is red.
- It is immune to the variance C4 measured. `.w.hcaptcha.com` is an ephemeral
  per-worker hostname: this round's sweep observed
  `["__cf_bm@.hcaptcha.com","__cf_bm@.w.hcaptcha.com"]`, the per-route probe
  observed **one**, C4 observed two in one run and one in another. Set coverage
  does not care; `toEqual([…])` against a fixed list would flake forever.

**Nothing was made green by another route.** hCaptcha still loads on `/giris`,
`Login.tsx` untouched; that is Phase 09's call.

**The controls.** Both existing negative controls are extended to the cookie
comparison, and three more run **inline on the live observed set** inside test 3
itself:

| control | must report |
|---|---|
| standalone 1 | `_ga@.google-analytics.com` uncovered; `__cf_bm@.evil.example` uncovered — *a published NAME from an unpublished DOMAIN*, the case the old assertion could not distinguish; and `__cf_bm@.a1b2c3.w.hcaptcha.com` **covered**, which is the variance case |
| standalone 2 | the cookie stops being covered when the document stops naming it, **and** when the document stops naming its domain |
| inline ×3 | a poison cookie added to the live set; the real cookie's name from an unpublished host; the real cookie against a disclosure stripped of every name |

A standalone control proves the function *can* fail. The inline ones prove it
could still have failed on the very data that just went green — which is the gap
that let the first version of this file report six greens over a violated claim.

**One parser defect of my own.** The disclosure reader first used
`main.textContent`, which concatenates block elements with no separator: a
paragraph ending "…yoktur." followed by one starting "Tek istisna…" reads as
`yoktur.Tek` and matches the hostname pattern. It produced twelve "domains",
eight of them sentence joins — `tir.belge`, `yok.tek`, `yor.bu`, `r.form`.
`innerText` leaves three; the third was `c.com`, the tail of the rendered
`SALES@MASTECHNİC.COM` where the uppercase Turkish dotted İ falls outside the
ASCII class, and a one-character-label filter drops it. Two remain, both real:
`hcaptcha.com` and `mastechnic.com`. None of the junk could have covered a
cookie — the name half has to match too — but a coverage rule fed tokens nobody
wrote is not a coverage rule.

**Result: 6 passed at `desktop-1280`, `npx tsc -b` exit 0.**

---

## 4. LEGAL_EIGHT — all eight, from the rendered DOM

`probe-legal-r3.mjs` renders all three routes and captures meta description,
lede, every clause's number/id/title/paragraphs, every link with its `href`,
every `<code>` token and the storage table with its note.
`check-legal-text.mjs` runs the invariants over that JSON.

| # | where | rendered |
|---|---|---|
| 1 | `/cerez` lede | "Bu sitenin kendi sayfaları çerez oluşturmuyor; giriş sayfasındaki güvenlik bileşeni bir tane oluşturuyor. Tarayıcınızda tutulan kayıtların tamamı madde 02'de tek tek listelenmiştir." |
| 2 | `/cerez` `metaDescription` | "Mas Technic çerez politikası — sitenin kendi sayfaları çerez oluşturmaz, giriş sayfasındaki hCaptcha bileşeni bir çerez oluşturur; tarayıcınızda tutulan yerel depo kayıtları, süreleri ve nasıl silinecekleri." |
| 3 | `/cerez` madde 01 title | "Çerezler ve tek istisna" |
| 4 | `/cerez` madde 01 p0 | "Bu sitenin kendi sayfaları tarayıcınızda çerez oluşturmuyor." |
| 5 | `/cerez` madde 03 | "Tarayıcınızın bu sitenin dışına istek gönderdiği üç yer var. Üçü de burada." + the three bold leads |
| 6 | `/gizlilik` madde 03 p0 | "Bu sitenin kendi sayfaları çerez oluşturmaz; tek istisna giriş sayfasına gömülü güvenlik bileşenidir ve 05. maddede yazılıdır." |
| 7 | `/gizlilik` madde 05 p2 | "Sayfalara gömülü tek üçüncü taraf bileşeni giriş sayfasındadır…" |
| 8 | `/kvkk` madde 04 p0 | "Aktarım yalnızca aşağıda tek tek sayılan hâllerde olur." |

### 4.1 The invariants — all pass

- **no `#` fragment** in any legal cross-reference: 16 links checked, zero. No
  clause links the same destination twice.
- **`/kvkk` madde 04 carries no numeral** counting its own enumeration — the
  numeral and ordinal scan returns empty. "üçüncü taraf" and "üçüncü bir
  tedarikçi" are third-*party*, not list positions.
- **the supplier case is inside the enumeration**: paragraph 5 of 7, above the
  closing boundary at paragraph 6 ("Aktarımın gerçekleştiği hâller bunlardır.").
- **madde 01's second sentence is BYTE-IDENTICAL** to `a5e4e7d`, both source
  lines, string-compared and not eyeballed.
- **none of the seven retired absolutes survives** anywhere in any of the three
  documents, their ledes or their meta descriptions.

### 4.2 Nothing claims what a third party does after receipt

A deliberately broad scan — retention, deletion timetable, encryption, NDA,
training, security posture, ISO 27001, GDPR — over every paragraph naming
hCaptcha, Cloudflare, `__cf_bm`, Google, Gemini or the font CDN returns **one**
hit, and it is adjudicated **in the checker with its reason** rather than
filtered away, so anything new still fails:

> `/cerez` madde 04 — "…tarayıcınızın çerez listesinden ayrıca silinir ya da
> otuz dakika içinde kendiliğinden düşer." The deleting party is the **reader's
> own browser** and the number is the cookie's own `Expires`, measured at 29.9
> minutes.

All three documents instead carry an explicit refusal, and I quote all three:
`/cerez` md 03 "Bundan sonrasını — orada ne olduğunu — bu metin anlatmıyor";
`/gizlilik` md 05 "Verinin hcaptcha.com'a ulaştıktan sonra ne olduğunu bu
politika anlatamaz"; `/kvkk` md 04 "Bir üçüncü tarafa ulaştıktan sonra verinin
ne olduğu hakkında bu belge bir şey söylemez".

### 4.3 `__cf_bm`'s absence from madde 02 — the REASONING, not just the absence

That table is "Yerel depo kayıtları" and its note gives two properties: these
records are not sent with every HTTP request, and **only this site's pages can
read them**. Both fail for `__cf_bm`, and both are measured:

- `document.cookie` on `/giris` is the **empty string** while `__cf_bm` exists
  in the jar. This site's pages cannot read it.
- it is a cookie on `.hcaptcha.com`, sent with every request to that domain.

A row for it would have made the note false. The decision is right, and it is
the same reasoning C4 wrote.

### 4.4 Every attribute madde 01 publishes, measured

`hosts-frames.json` — fresh context per route, plain load, **no interaction**,
23 public routes:

```
name __cf_bm · domain .hcaptcha.com · httpOnly true · secure true ·
sameSite None · lifetime 29.9 minutes           ("ömrü otuz dakikadır")
document.cookie ""                              ("sayfa betikleri onu okuyamaz")
2 iframes, both newassets.hcaptcha.com,         ("sayfaya oradan iki çerçeve
  #frame=checkbox and #frame=challenge           gömülür")
no interaction required                         ("sayfa açılır açılmaz")
```

`/gizlilik` madde 05's "Sayfalara gömülü **tek** üçüncü taraf bileşeni giriş
sayfasındadır" also holds: iframe count is **0** on all 22 other public routes
and **2** on `/giris`.

### 4.5 What I could not source, and one observation for Phase 09

`/cerez` madde 03 opens "Tarayıcınızın bu sitenin dışına istek gönderdiği **üç
yer** var" — a new closed count, introduced in the same round that removed one
from `/kvkk`. It is **TRUE for a plain load**: 23 routes measured, every one
contacts only the two font hosts, and only `/giris` adds hCaptcha; no Supabase
host is contacted on any plain public-route load. It becomes contestable only
under interaction — submitting the RFQ form or logging in reaches the hosting
and database provider, which madde 02's own note now acknowledges ("sitenin
barındırma ve veri tabanı altyapısına yapılan istekler") and which `/kvkk` madde
04 enumerates as a transfer. Whether the site's own backend is "outside this
site" is a definitional question, and C4 itself argued that a legal document
should not leave the reader to resolve one. **Reported, not raised** — it does
not falsify a sentence on any measurement I can take.

---

## 5. FOOTER — the invariant under four rename scenarios

`probe-footer-rename.mjs` evaluates the **real modules**. `ia.ts` has no imports
of its own, so both files are copied to a scratch directory, the `@/` import is
rewritten relative, the rename is applied as a text edit and esbuild bundles the
result. Nothing in the repository is written to. Both the shipped route-keyed
`footer-groups.ts` and the pre-C4 label-keyed one are run through the same
scenarios.

**"The map follows the rename" has two readings and they disagree on the OLD
code**, so both are measured instead of one being chosen.

| scenario | OLD (label-keyed) | NEW (route-keyed) |
|---|---|---|
| 1 today | 1× KABİLİYETLER | 1× KABİLİYETLER |
| 2 `ia.ts` renamed, map untouched | 1× KABİLİYETLER | 1× KURUMSAL |
| **3a** `ia.ts` renamed, **map key** follows, call-site literal does not | **0× NOWHERE** | **1× KURUMSAL** |
| 3b `ia.ts` renamed, the rename chased everywhere | 1× YETKİNLİKLER | 1× YETKİNLİKLER |

**3a is C4's row and it reproduces exactly.** The old code drops the link to
zero, because `FAMILY_RESOURCES[label]` stopped matching while
`ADOPTED_BY_FAMILY`, built from `Object.values(...)`, kept excluding the path
from KURUMSAL. `adoptingColumn()` holds it at exactly one in every scenario, and
in a column that still renders.

**3b is mine, and it is recorded for exactness.** If the rename is chased all
the way, the OLD code holds too. C4's table says "OLD 0×" without saying which
of the two edits it means. Both are true; the defect is real and its window is
the *incomplete* rename, which is the likelier one.

Column counts 5 / 6 / 5 / 6 and `/kabiliyet-profilleri` exactly once in all four
scenarios and both files. Zero invariant violations anywhere except OLD 3a.

### 5.1 In the browser, and my round-2 boundary corrected

| viewport | `.tl-footer` height | `bantOrani` | `grid-template-rows` | `--tl-cols` |
|---|---|---|---|---|
| 375 | 740.4375 | 1.9745 | `display: none` | 4 |
| 768 | 711.1719 | 0.92600505 | `150px 150px` | 6 |
| 1024 | 708.75 | 0.69213867 | `150px 150px` | 6 |
| 1100 | 712.5 | 0.64772727 | `150px 150px` | 6 |
| 1180 | 716.4688 | 0.60717691 | `150px 150px` | 6 |
| **1181** | **297** | **0.25148180** | **`150px`** | **12** |
| 1200 | 297 | 0.24750000 | `150px` | 12 |
| **1280** | **297.0000** | **0.23203125** ← the gate | `150px` | 12 |
| 1440 | 297 | 0.20625000 | `150px` | 12 |

`bantOrani` is still **0.23203125** from a **297.0000 px** band. **My round-2
"≥1024" boundary was wrong and C4's 1181 is right**: 1024 is `150px 150px`,
identical to 768. C4's three boundary ratios reproduce digit for digit.

Columns 5/6/5/6 at all nine widths. `href="/"` appears **zero** times inside
`.tl-footer` at all nine. Each resource link appears exactly once in the nav
rendering and exactly once in the hidden `<768` disclosures rendering; `/blog`
has a third occurrence and it is **not** a duplicate — it is the "Yazıları
incele" journal call to action in `.shell-footer-conversion`, different
affordance, different text.

```
npx playwright test e2e/technical-landing.spec.ts --project=critical-1280   15 passed
npx playwright test --project=critical-375                                  81 passed, 2 skipped
```

---

## 6. Full regression

| project | result |
|---|---|
| `visual-375` | 35 passed, 6 skipped |
| `visual-768` | 35 passed, 6 skipped |
| `visual-1280` | 41 passed |
| `visual-1440` | 35 passed, 6 skipped |
| `mobile-320` | 127 passed, **2 failed** (R3-1), 53 skipped |
| `mobile-375` | 125 passed, 57 skipped |
| `mobile-390` | 102 passed, 80 skipped |
| `tablet-768` | 98 passed, **2 failed** (R2-3 + one stall), 82 skipped |
| `landscape-844` | 99 passed, **1 failed** (R2-3), 82 skipped |
| `desktop-1280` (3 chunks) | 157 passed, 25 skipped |
| `desktop-1440` | 103 passed, 79 skipped |
| `desktop-1440-short` | 103 passed, 79 skipped |
| `smoke-firefox-390` + `-1440` | 6 passed |
| `smoke-webkit-390` + `-1440` | 6 passed |
| `critical-1280` (technical-landing) | 15 passed |
| `critical-375` | 81 passed, 2 skipped |

`npm run build` exit 0 · `npx tsc -b` exit 0 · `node scripts/claims-gate.mjs`
**PASS — 0 unverified claims across 27 rules**, 214 files / 27 775 non-comment
lines, re-run after the C4 legal edits.

**`installFontRetry()` did not flake once this round** — four clean visual
projects in a row, against three flakes in round 2 and one in C4. Recorded for
the Phase 12 self-hosting decision as a data point in the other direction.

### 6.1 No golden moved — confirmed independently

116 golden files, SHA-256 per file, before and after all four visual projects:
the manifests are **identical**, manifest hash
`C33F8078AB4EE605B4117285791B2DA0679A1C948BD98B7EA3AE6250B52DB528` on both
sides, and `git status e2e/__golden__` is empty. **`--update-snapshots` was
never run, in any round, for any reason.**

### 6.2 The one stall, adjudicated

`shell-and-transition.spec.ts:172` "B25 — a history move with the menu open
never strands the modal lock" failed at `tablet-768` after **14.6 minutes** with
*"Tearing down 'context' exceeded the test timeout of 60000ms"* — a teardown
hang under memory pressure, not an assertion. Re-run in isolation: **green in
9.9 s, 16 passed.** Environment, not the product.

### 6.3 Contrast

| pass | routes | candidates | measured | fails |
|---|---|---|---|---|
| 375, Wave A set | 7 | 992 | 976 | 0 |
| 375, Wave B set | 10 | 1 398 | 1 358 | 1 (adjudicated) |
| 1280, Wave B set | 7 | 1 341 | 1 334 | 1 (adjudicated) |

Negative controls reproduce at **21 / 1 / 3.033 / 3.033 / 3.977** on every route.

Two adjudications, both re-measured by me rather than inherited:

- **375, `/qa-zzz-nothing`** — the `aria-hidden`, transparent-filled decorative
  "404" numeral rounds 1 and 2 adjudicated. Its content is carried as real text
  beside it.
- **1280, `/sss` `.shell-faq-source a`** — the probe reports 2.583 against
  `rgb(7,11,13)`. That is not the background it is painted on. I measured all
  **107** of those links directly: `rgb(78,85,82)` on `rgb(238,233,222)`,
  10 px/500, **ratio 6.319** against a required 4.5. Round 1's adjudication
  holds, and now it holds on my own measurement.

**`/cerez-politikasi`'s unmeasurable share improved and changed kind.** Round 2
could measure only 91 of 113 candidates there — the worst in the set — because
22 elements never entered the viewport behind the clip. It is now 110 of 129,
and the remaining unmeasured elements are inside a *horizontally scrollable
region at rest*, which is a different situation from clipped-and-unreachable.

### 6.4 axe

Zero serious or critical violations anywhere. 19 axe lanes green at
`desktop-1280`, 20 at `mobile-375`, and no failing axe test in **any** project
output this round. Reflow at 320 CSS px holds on all 15 Wave B paths.

---

## 7. CARRIED — criteria 3 and 5, and R2-3

**Criteria 3 (A21) and 5 (A20).** Re-measured with round 1's own probes against
the C4 build. Compared ASCII-normalised — the round-1 files were written under a
different console codepage, so a byte compare only reports mojibake:

```
IDENTICAL (ascii-normalised)  criterion 3 — legacy accent
IDENTICAL (ascii-normalised)  criterion 3 — design membership
IDENTICAL (ascii-normalised)  criterion 5 — error states
```

**Neither got worse. Neither got better.** `/giris` still shows 92 legacy-teal
nodes and 0 shell primitives; the Sonner toast still renders at `8px` radius in
`ui-sans-serif`. Both remain the next phase's.

**R2-3 (A23).** Still red, still `motion-grammar.spec.ts:254`, still
`expect(locator('.tl-dimension-lines')).toBeHidden()` → *Expected hidden,
Received visible*, still only at `tablet-768` and `landscape-844`. Root cause
unchanged: `@media (max-width:767px)` at `technical-landing.css:507` does not
cover two `mobile: true` projects above that width. **`git log 7dcfb65~1..49a1af6`
over `src/styles/technical-landing.css` and `e2e/landing/motion-grammar.spec.ts`
is empty** — no commit of this phase, C3 or C4 included, touched either file.

---

## 8. POLISH — the ≤390 row height: **it ships, but not for the reason the row height suggests**

Measured (`row-polish.json`), and looked at
(`reports/qa/phase-08/r3/shots/table-375.png`).

| row | row height ≤390 | real text lines per cell | blank below the visible key | same row at 768 |
|---|---|---|---|---|
| `sb-…-auth-token` | 85.4 | 1 / 1 / **3** / 3 | 67.4 | 85.4 |
| `mas_chat_ai_count` | 125.7 | 1 / 1 / **5** / 3 | 107.7 | 65.3 |
| `mas_pending_cad_upload` | 105.6 | 1 / 1 / **4** / 3 | 87.6 | 85.4 |
| **`mas_intro_seen`** | **246.5** | 1 / 1 / **11** / 3 | **228.5** | 125.7 |
| `mas-technic-theme` | 105.1 | 1 / 1 / **4** / 2 | 87.1 | 64.8 |

C4's description is exact: the third column wraps to 11 lines out of sight and
the visible strip carries 228.5 px of empty paper on one row, in a 705.4 px
table of which the reader sees one and a half columns. `vertical-align: top`
puts every visible cell at the top of its row, so the blank falls below.

**My judgement: it ships, and I would not take the shortening.**

- Every cell is reachable — 24/24, measured, keyboard path working. This is a
  legibility cost, not information loss.
- The one shortening that costs no verified fact is dropping the middle clause
  of `mas_intro_seen`'s description: *"Ana sayfadaki giriş sekansının oynadığını
  not eder. Yalnızca ana sayfada yazılır, hareket azaltma açıksa hiç yazılmaz."*
  — 158 chars → 108. The dropped clause ("böylece aynı sekmede bir daha
  oynamaz") is a consequence a reader can derive from the purpose plus the SÜRE
  column's "Sekme kapanana kadar", so its truth survives its removal. It buys
  roughly 65 px of 705. **A 9 % improvement on the symptom, in a closing round,
  on a legal page this phase has spent three rounds teaching to carry its facts
  in its sentences.** That trade is the wrong direction, and I decline it. If
  the Orchestrator wants it anyway, that is the sentence and it is honest.
- The other two long cells (`mas_chat_ai_count`, `mas_pending_cad_upload`)
  cannot be shortened without losing a fact.

**What I would raise instead, and it is not this page's:** at ≤390 there is *no
affordance that the table scrolls sideways*. `.shell-table-scroll`
(`shell.css:1299`) is `overflow-x: auto` with a focus outline and nothing else —
no edge fade, no shadow, no hint — and mobile overlay scrollbars are hidden at
rest. On rows 1, 2 and 5 the DEPO column's text fits inside the port, so nothing
is even visibly clipped; the row simply reads as ending. The tall blank rows
make that worse, which is why the row height *feels* like the problem. The fix
belongs to the shell primitive, benefits all 16 tables, and is a Phase 10 or 12
item. **C4 made the table reachable; nothing yet makes it discoverable.**

---

## 9. Acceptance criteria matrix

| # | Criterion | R1 | R2 | R3 | Evidence |
|---|---|---|---|---|---|
| 1 | 404 is unmistakably MAS TECHNIC, usable and linked back | PASS | PASS | **PASS** | `waveb-notfound-body` golden matches; 404 lane green at every project |
| 2 | Blog/article, quality/resources, case studies, SSS and legal share the global design system | PASS | **FAIL** (R2-1) | **PASS** | §1 — 24/24 cells at 320/375/390 with `tabindex`/`role`/`aria-label`; 768/1280/1440 unchanged by live A/B; 0 teal / 0 Radix / 0 off-register radii unchanged |
| 3 | No public route still visibly belongs to the old design language | FAIL | CARRIED (A21) | **CARRIED (A21)** | §7 — identical to round 1, ASCII-normalised |
| 4 | Search/filter implemented with a justified need or explicitly omitted | PASS | PASS | **PASS** | Unchanged; recorded per surface in source |
| 5 | Error/loading/empty states no longer fall back to library defaults | FAIL | CARRIED (A20) | **CARRIED (A20)** | §7 — identical to round 1 |
| — | Content truth (§13, §1.3) across the published legal set | partly FAIL | **FAIL** (R2-2) | **PASS** | §4 — eight sentences from the DOM, every `__cf_bm` attribute measured, no post-receipt claim, no numeral in `/kvkk` md 04 |
| — | §12 visual acceptance | — | PASS | **PASS** | §6.1 — 116 goldens byte-identical, four visual projects clean |

---

## 10. Failed checks

| # | Check | Observation | Root cause | Phase 08's? |
|---|---|---|---|---|
| **R3-1** | `qa-p08-scroll-region-reach.spec.ts`, both walk tests, `mobile-320` only | `/hizmetler/cnc-frezeleme` `CNC Frezeleme — malzeme kaydı`: container box 42 → 337.078 in a 320 viewport; `"Özellik"` end lost at 336.08 | `div.shell-span-full shell-stack`, an `auto` grid track that cannot shrink below the figure's 295.078 px min-content — R2-1's mechanism, one column not three | **NO — PRE-EXISTING, Phase 07's.** The phase's full diff touches neither the page nor its data, and its `shell.css`/`ShellComposition.tsx` diffs contain no `shell-stack`, `shell-span-full` or `shell-table` |
| R2-3 | `motion-grammar.spec.ts:254` at `tablet-768` and `landscape-844` | `expect(locator).toBeHidden()` — Expected hidden, Received visible | `technical-landing.css:507` `@media (max-width:767px)` vs two `mobile: true` projects above it | **NO — CARRIED to Phase 10 per A23.** Both files untouched by the entire phase |
| — | `shell-and-transition.spec.ts:172` at `tablet-768` | "Tearing down 'context' exceeded the test timeout of 60000ms" after 14.6 min | Memory pressure on an 8 GB box during a full-project run | No — environment. Green in 9.9 s on isolated re-run |

---

## 11. Handover

**To Phase 09** — `/giris` mounts hCaptcha on load, with no consent asked,
embedding two `newassets.hcaptcha.com` iframes and setting a 30-minute
`__cf_bm`. It is now *disclosed*, accurately, in three documents. Whether the
login form should carry it at all is a security decision and remains open. So is
`/cerez` madde 04's "no cookie-preferences window is shown", which the C4
comment deliberately left open as a legal determination. And §4.5's "üç yer"
observation.

**To Phase 10** — R2-3 (A23), and **R3-1**: `/hizmetler/cnc-frezeleme`'s
`malzeme kaydı` table at 320. The smallest fix is the same one C4 landed here —
drop the grid from the wrapper, or give `.shell-stack > *` a `min-width: 0`,
which would fix the class rather than the instance and is a design call.
`qa-p08-scroll-region-reach.spec.ts` will go green at `mobile-320` when it is
done, with no edit to the test.

**To Phase 10 or 12** — §8: `.shell-table-scroll` has no scroll affordance. 16
tables on 8 public routes are horizontally scrollable with nothing to say so.

**To Phase 12** — `installFontRetry()` did not flake once this round, against
three in round 2 and one in C4. The self-hosting decision now has evidence on
both sides.

**Still unverifiable from this repository**, carried from round 1: the
production host's real-HTTP-404 behaviour, and Lighthouse/performance, which is
not in this phase's criteria.

---

## 12. Commands run

```text
npm run build                                                          # exit 0
npx tsc -b --pretty false                                              # exit 0 (x4, after each spec edit)
node scripts/claims-gate.mjs                                           # PASS - 0/27, 214 files

npx playwright test e2e/technical-landing.spec.ts --project=critical-1280       # 15 passed
npx playwright test --project=critical-375                                      # 81 passed, 2 skipped
npx playwright test --project=visual-375 / -768 / -1280 / -1440                 # 35/35/41/35 passed
npx playwright test --project=mobile-320                                        # 127 passed, 2 FAILED, 53 skipped
npx playwright test --project=mobile-375                                        # 125 passed, 57 skipped
npx playwright test --project=mobile-390                                        # 102 passed, 80 skipped
npx playwright test --project=tablet-768                                        #  98 passed, 2 FAILED, 82 skipped
npx playwright test e2e/landing/shell-and-transition.spec.ts --project=tablet-768  # 16 passed (the stall, isolated)
npx playwright test --project=landscape-844                                     #  99 passed, 1 FAILED, 82 skipped
npx playwright test <7 specs> --project=desktop-1280                            #  49 passed, 7 skipped
npx playwright test e2e/qa-p08-*.spec.ts --project=desktop-1280                 #  42 passed, 16 skipped
npx playwright test e2e/landing --project=desktop-1280                          #  66 passed, 2 skipped
npx playwright test --project=desktop-1440 / -1440-short                        # 103 passed each, 79 skipped
npx playwright test --project=smoke-firefox-390 --project=smoke-firefox-1440    #  6 passed
npx playwright test --project=smoke-webkit-390 --project=smoke-webkit-1440      #  6 passed
npx playwright test e2e/qa-p08-scroll-region-reach.spec.ts --project=mobile-320 / -375 / desktop-1280
npx playwright test e2e/qa-p08-storage-disclosure.spec.ts --project=desktop-1280   # 6 passed

node reports/qa/phase-08/r3/probe-table-reach-r3.mjs       # 24/24 at six viewports
node reports/qa/phase-08/r3/probe-reach-methods.mjs        # every input path, one at a time
node reports/qa/phase-08/r3/probe-touch-control.mjs        # is the touch instrument blind? yes
node reports/qa/phase-08/r3/probe-wrapper-ab.mjs           # pre-C4 markup restored live, six widths
node reports/qa/phase-08/r3/probe-table-classes.mjs        # the table census the guard's floor uses
node reports/qa/phase-08/r3/probe-legal-r3.mjs             # three documents, rendered
node reports/qa/phase-08/r3/check-legal-text.mjs           # the textual invariants
node reports/qa/phase-08/r3/probe-hosts-frames.mjs         # 23 routes: hosts, iframes, cookies, document.cookie
node reports/qa/phase-08/r3/probe-disclosure-parse.mjs     # where the junk "domains" came from
node reports/qa/phase-08/r3/probe-footer-rename.mjs        # four scenarios x two implementations, via esbuild
node reports/qa/phase-08/r3/probe-footer-geometry.mjs      # nine widths, the 1181 boundary
node reports/qa/phase-08/r3/probe-footer-blog.mjs          # /blog's third occurrence, identified
node reports/qa/phase-08/r3/probe-row-height.mjs           # row and cell geometry at five widths
node reports/qa/phase-08/r3/probe-row-polish.mjs           # real text line boxes + the screenshots
node reports/qa/phase-08/r3/probe-faq-source-contrast.mjs  # the /sss hit, re-adjudicated at 6.319
node reports/qa/phase-08/r3/compare-carried.mjs            # criteria 3 and 5 vs round 1
node reports/qa/phase-08/probe-legacy-accent.mjs           # carried criterion 3
node reports/qa/phase-08/probe-design-membership.mjs       # carried criterion 3
node reports/qa/phase-08/probe-error-states.mjs            # carried criterion 5
QA_VP=375 QA_ROUTES=<wave B> node reports/qa/phase-07/probes/p6-contrast.mjs
QA_ROUTES=<wave B>            node reports/qa/phase-07/probes/p6-contrast.mjs
```

All Playwright runs were foreground, one `--project` at a time, against
`vite preview` on `:4205` (and `:4173` for the round-1 probes, which hard-code
that port and which I would not edit) via `PLAYWRIGHT_BASE_URL`, output
redirected to `.txt`. **Never `run_in_background`.**

---

## 13. Scope integrity

**PASS.**

- **Production files modified by QA: NONE.**
- Files written by QA this round, all inside the WRITE_ALLOWLIST:
  `e2e/qa-p08-scroll-region-reach.spec.ts` (new),
  `e2e/qa-p08-storage-disclosure.spec.ts` (the A24 re-aim and its controls),
  `reports/qa/phase-08.md`, `reports/qa/phase-08/r3/**`.
- **No golden PNG written, moved or deleted; 116 files byte-identical before and
  after all four visual projects. `--update-snapshots` never run, in any round,
  for any reason.**
- No assertion weakened, no tolerance broadened, no skip or xfail added, no
  coverage deleted. Test 3's re-aim is argued in §3 and in the file itself, and
  it made the file *stricter* in a dimension it did not previously have — the
  domain half of cookie coverage. The two new time budgets
  (`WALK_BUDGET_MS = 420_000`, and the existing `SWEEP_BUDGET_MS`) loosen no
  assertion. The new spec's `test.skip` outside its three lanes is lane
  selection, not coverage removal: every assertion runs at 320, 375 and 1280.
- `PROGRESS.md`, `IMPLEMENTATION.md`, `USER_INPUTS.md`, `CLAUDE.md`,
  `MASTER_CONTEXT.md`, `docs/**`, `src/**`, `public/**`, `supabase/**`,
  `scripts/**`, `.claude/**`, `tsconfig.json` and all build/package config:
  untouched.
- `tsconfig.app.tsbuildinfo` (tracked, modified by the type-check) and
  `tsconfig.e2e.tsbuildinfo` (untracked) were left alone and are in **no** QA
  commit, as instructed.
- **Scope audit of the code under test.** C4 changed five production files —
  `CerezPolitikasi.tsx`, `GizlilikPolitikasi.tsx`, `KVKK.tsx`,
  `footer-groups.ts`, `technical-landing.spec.ts` — plus `PROGRESS.md` and its
  own packet. No `Login.tsx`, no `shell.css`, no `ia.ts`, zero goldens. The
  `technical-landing.spec.ts` change is **comment prose only**: `git diff -U0`
  over it shows every added and removed line beginning with `//`, and `0.26` is
  still `0.26`.

---
---

# ROUND 2 — PRESERVED IN FULL

*Round 2 ran at `b77be5c` and returned **FAIL**. It found the two defects that
mattered, and it retracted its own round-1 conclusion in writing. Three of its
claims were later falsified — the rename trigger, the "≥1024" footer boundary,
and its diagnosis of which box the 585.875 px belonged to. All three are
corrected in round 3 above, and the round-2 text is left exactly as it was
written, because a report that is edited after the fact is not a record.*

# QA Report — Phase 08 · ROUND 2

- PHASE: 08 — INNER PAGES WAVE B: quality, projects, blog, resources, legal, search/discovery, 404/error
- CODE_COMMIT: `b77be5c` (round 1 base `aae3536` + the five C3 commits `2994246 · 17c5b3c · e62e96c · 64edf48 · b77be5c`)
- ROUND 1 CODE_COMMIT: `5138fc1` — verdict **FAIL**, preserved in §15 and in `reports/qa/phase-08/`
- QA_COMMIT: this commit (round-2 chain `e676ef2 · 6f55acc · 87d0bb9 · a822e1c · d023322 · a3df541 · 048500f · e78beff`)
- WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p08` on `wt/qa-p08r2`
- STATUS: **FAIL**
- TESTS_PASSED: 1155
- TESTS_FAILED: 6 (3 distinct causes; 3 of the 6 are one known fixture flake, clean on isolated re-run)
- TESTS_SKIPPED: 526
- NEW_TESTS_ADDED: 6 (one new spec, `e2e/qa-p08-storage-disclosure.spec.ts`, `desktop-1280` lane)

**Why FAIL, in one paragraph.** All four defects C3 was asked to fix are fixed,
and I verified each against the running browser rather than the diff: the footer
band measures **297.0000 px / `bantOrani` 0.23203125** at 1280 with the
`critical-*` family green, all three `radius-census` tests pass including the
drift negative control, `/kvkk` madde 04 now enumerates three transfer cases and
names Gemini while asserting nothing about Google after receipt, and the cookie
table renders five rows with `mas_intro_seen` correctly described. The 21
rebanked goldens are justified, and the strongest single measurement of this
round says so: the current 1280 `landing-fullpage` baseline is the same height
as the pre-Phase-08 one and has **zero changed pixels above the footer top even
at threshold 1/255**. But two new blocking defects turned up in the places the
packet sent me to look, both on surfaces Phase 08 created, both fixable inside
Phase 08's own files. **R2-1:** `/cerez-politikasi`'s storage table is 583.9 px
wide inside a 375 px viewport and nothing scrolls — three of its four columns
are unreachable at 320/375/390, on the document a reader is explicitly pointed
at for exactly that information. **R2-2:** `/giris` mounts hCaptcha on page
load, which sets a `__cf_bm` cookie and contacts four `hcaptcha.com` hosts,
falsifying four absolute claims Phase 08 published in two legal documents —
including "Herkese açık sayfalarda hiçbir çerez oluşturulmuyor." Criteria 3 and
5 are recorded as CARRIED per A21/A20 and neither got worse. And the one thing
the packet asked me to close before Phase 09 scopes privacy — the RFQ /
"hiçbir yapay zekâ servisine gönderilmez" sentence — is **TRUE as written**,
traced end to end.

> Round-2 evidence is in `reports/qa/phase-08/r2/`; round-1 evidence remains in
> `reports/qa/phase-08/`. Evidence files carry `.txt` rather than `.log` because
> `.gitignore:3` is `*.log`.

---

## 1. The four C3 defects, re-measured

| C3 defect | Round-1 state | Round-2 measurement | Verdict |
|---|---|---|---|
| **D1** footer breaks `critical-1280` | `bantOrani` 0.2671875 (342 px), three identical runs | **0.23203125** from a **297.0000 px** band; `critical-1280` `technical-landing.spec.ts` 15/15; `critical-375` 81 passed / 2 skipped | **FIXED** |
| **D2** radius citation drifted | `["src/components/ChatBot.tsx:225"]` | `radius-census.spec.ts` at `visual-1280` **3/3**, including *every number in docs/lean/17 §4 comes back out of the browser* (55.4 s) and the drift negative control (7 ms) | **FIXED** |
| **D3** `/kvkk` said transfers happen in two cases | "Aktarım iki hâlde olur" | rendered: "Aktarım **üç hâlde** olur … Google'ın Gemini servisine iletilmesi" | **FIXED** |
| **D4** cookie table short by one | four rows | five rows, `mas_intro_seen` present, every claim in it verified against `index.html:294-316` **and** against the browser | **FIXED** |

### 1.1 `bantOrani` as a number — the third independent reading

Measured with the spec's own expression
(`document.querySelector(".tl-footer").getBoundingClientRect().height / window.innerWidth`),
`probe-footer.mjs`, on the production preview:

| viewport | `.tl-footer` height | `bantOrani` | `.tl-footer nav` display |
|---|---|---|---|
| 375 | 740.4375 px | 1.9745 | **none** (assertion skipped) |
| 768 | 711.1719 px | 0.9260050456 | grid (assertion skipped) |
| **1280** | **297.0000 px** | **0.23203125** | grid ← the gate |
| 1440 | 297.0000 px | 0.20625 | grid |

Ceiling `0.26 × 1280 = 332.80 px`. Headroom `35.80 px = 1.591` row pitches, i.e.
**exactly one row**: 7 rows measures 319.50 px / 0.24960938 and passes, 8 rows
measures 342.00 px / 0.2671875 and does not. The Coder's reported 0.2320312 and
the header comment's "HEADROOM: ONE ROW" both hold.

---

## 2. Falsifying the D1 footer account

Everything the Coder claimed reproduces, and the composition is safe:

- **Column counts** — HİZMETLER 5, KABİLİYETLER 6, ENDÜSTRİYEL 5, KURUMSAL 6,
  identical at 375/768/1280/1440. 22 nav anchors, one fewer than the 23 before.
  (The Orchestrator's original table said ENDÜSTRİYEL had 6; it has 5, as the C3
  packet already conceded.)
- **Row pitch, measured not divided** — 22.50 px between consecutive link tops,
  in all four columns, at 768/1280/1440.
- **The complement holds.** All five `resourceLinks` entries appear **exactly
  once** in the `nav` rendering *and* exactly once in the `<768` disclosure
  rendering, at both 375 and 1280: `/malzemeler`, `/kabiliyet-profilleri`,
  `/kalite-dosyasi`, `/blog`, `/sss`. `href="/"` now appears **zero** times
  anywhere inside `.tl-footer`.
- **`Ana Sayfa` leaving costs the reader nothing — clicked, not asserted.**
  From the bottom of `/kalite-dosyasi`: at 375 the header brand is a
  249.75 × 63 box at `y = 0`, `elementFromPoint` at its centre resolves inside
  the link (nothing covers it), and clicking it lands on `/` with `scrollY 0`.
  Identical at 1280 (303.5 × 71). The brand is focusable at position **1** of 29
  (375) / 47 (1280). The menu brand is visible in the open menu at both widths,
  and the 404 keeps its own "Ana sayfa" action.
- **`navigation-reachability.spec.ts`** — 5/5 at `critical-1280`, including
  `:240` *every route the menu links to resolves without a redirect or a
  not-found shell* at 30.3 s.
- **The two IA controls did not move**, so the fix did not leak into `ia.ts`:
  the fullscreen menu's KAYNAKLAR index still prints **`05`** with 5 entries
  (KURUMSAL `02`/2, ANA SAYFA BÖLÜMLERİ `07`/7), and the 404's `ul.shell-index`
  still holds **8** items — both at 375 and 1280.

### 2.1 Three claims in the new comments that my measurements contradict

None breaks a test. All three are the class of unmeasured sentence this run
keeps having to correct, so they are findings rather than notes.

**C1 — the pitch is not "the same … at 375".** Both
`src/components/shell/footer-groups.ts` and the new comment in
`e2e/technical-landing.spec.ts` say the 22.50 px row pitch is "the same in all
four columns and at 375/768/1280/1440". At 375 `.tl-footer nav` computes to
`display: none`; every one of the 22 links has a 0 × 0 rect and every measured
delta is **0**. The rendering that *does* paint at 375 is
`.shell-footer-disclosures`, and its pitch is **40 px**, not 22.50. The figure
is unmeasurable at the one viewport it is claimed for.

**C2 — the "tallest column" model only holds at ≥ 1024.** `footer-groups.ts`
explains the band as "as tall as its tallest column". At 768 `.tl-footer nav`
computes `grid-template-rows: 150px 150px` — a 2 × 2 grid with two distinct row
origins (559.8 and 733.8) and columns at `x = 57` and `x = 412`. Its height is
`tallest(row 1) + tallest(row 2)`:

```
before C3   row1 max(HİZ 5, KAB 5) = 5   row2 max(END 5, KUR 8) = 8   = 13 rows
after  C3   row1 max(HİZ 5, KAB 6) = 6   row2 max(END 5, KUR 6) = 6   = 12 rows
net −1 × 22.50 px
```

That is exactly the −22 / −23 px the 768 goldens moved, against −45 px at
1280/1440 — and it is why they moved by different amounts, which the comment
does not explain.

**C3 — a latent orphaning risk in the new map.** `FAMILY_RESOURCES` is keyed by
family **label** (`"Kabiliyetler"`) while `ADOPTED_BY_FAMILY` is built from
`Object.values(...).flat()` regardless of whether any label matched. The comment
says "Keyed by ROUTE, so a renamed label in `ia.ts` cannot silently orphan an
entry" and "an unmatched path simply stays in KURUMSAL, because that column
takes the complement". If the label in `ia.ts` is renamed, `family()` adopts
nothing **and** KURUMSAL still excludes the path — the link would appear
**zero** times. Not a defect today (the label matches and all five appear once,
measured), but the comment's stated safety property is the opposite of the
code's behaviour. LOW, recorded.

---

## 3. The 21 rebanked goldens, re-adjudicated

**No `--update-snapshots` was run, at any point, for any reason. No golden PNG
was written, moved or deleted by QA in either round.**

C3 touched exactly 21 baselines — `landing-fullpage` + the six `shell-footer-*`
crops at each of `visual-1280`, `visual-1440`, `visual-768`. **No `visual-375`,
`shell-header-*`, `inner-*`, `navigation-*` or `waveb-*` baseline was
regenerated**, and those specs pass against the committed baselines.
`git diff --name-only aae3536..b77be5c -- reports/` is empty, confirming the
Coder borrowed `probe-golden-rebank.mjs` / `probe-golden-shift.mjs` without
writing into `reports/qa/**`.

### 3.1 The four visual projects, against the committed baselines

| project | result |
|---|---|
| `visual-375` | 34 passed, 6 skipped, 1 failed → **re-run clean 2/2** |
| `visual-768` | 34 passed, 6 skipped, 1 failed → **re-run clean 6/6** |
| `visual-1280` | **41 passed, 0 failed** |
| `visual-1440` | 34 passed, 6 skipped, 1 failed → **re-run clean 7/7** |

**Not one golden mismatch in any project.** All three failures are the same
fixture precondition the packet warned about —
`installFontRetry() intercepted 0 requests on fonts.gstatic.com` — at
`navigation-golden:44`, `shell-golden:43` and `inner-pages-golden:95`
respectively. Three of four projects hit it in a single pass, a higher rate than
the "twice, for the Coder" the packet records. It feeds the Phase 12
self-hosting decision.

### 3.2 Per-golden adjudication (threshold 16/255, oldRef `aae3536`)

| golden | old | new | ΔH | first changed row |
|---|---|---|---|---|
| `1280/landing-fullpage` | 1280×3963 | 1280×3918 | −45 | 3662 of 3918 (93.5 %) |
| `1280/shell-footer-{about,home,journal,rfq}` | 1278×343 | 1278×298 | −45 | 42 |
| `1280/shell-footer-notfound` | 1278×344 | 1278×299 | −45 | 43 |
| `1280/shell-footer-service` | 1278×343 | 1278×298 | −45 | 41 |
| `1440/landing-fullpage` | 1440×4018 | 1440×3973 | −45 | 3717 of 3973 (93.6 %) |
| `1440/shell-footer-*` (six) | 1438×343/344 | 1438×298/299 | −45 | 42 / 43 |
| `768/landing-fullpage` | 768×6189 | 768×6167 | −22 | 5830 of 6167 (94.5 %) |
| `768/shell-footer-*` (six) | 766×735…792 | 766×712…770 | −22 / −23 | 375…433 |

The first changed row moved **up**, from round 1's 132 to 42 on the 1280 footer
crops. That is the correct shape and I checked it deliberately: this is not an
append or a truncation. `Ana Sayfa` leaving KURUMSAL shifts that column from its
**first** link row, and KABİLİYETLER gains a sixth. A change that still started
at row 132 would have been the wrong answer.

For the three full-page crops, footer top = `new height − measured footer
height`: 1280 → 3621 (first change 3662), 1440 → 3675 (3717), 768 → 5456 (5830).
**Nothing above the footer moved**, at threshold 16 and at threshold 8.

### 3.3 The control that settles it

Comparing the **current** baseline against the **pre-Phase-08** one
(`7dcfb65~1`), skipping the whole Phase 08 rebank:

```
e2e/__golden__/win32/visual-1280/landing-fullpage.png
  old 1280x3918   new 1280x3918   heightDelta = 0
  threshold 16/255 : 61 changed rows, all between 3662 and 3784
  threshold  1/255 : 61 changed rows, pixels changed ABOVE row 3621 = 0
e2e/__golden__/win32/visual-1280/shell-footer-home.png
  old 1278x298    new 1278x298    heightDelta = 0    61 changed rows, 42..164
```

Phase 08's **net** footprint on the 1280 landing page is 61 rows inside the
footer band, and the page is back to the exact height it had before the phase.
Above the footer the picture is sub-perceptually identical to pre-Phase-08 —
zero changed pixels even at a 1/255 threshold. That is a stronger statement than
"the rebank was justified".

*Noise, recorded so a future threshold-1 reader is not misled:* current vs
`aae3536` at threshold 1 shows 150 632 px above the footer at 1280 and 1 px at
1440; at threshold 8 both are 0. Since current vs pre-Phase-08 at threshold 1 is
0 at 1280, that noise lives in the `aae3536` blob (the Phase 08 regeneration
`931594f`). At 1440 it is the mirror case. All of it is < 8/255, none of it
affects a passing comparison.

### 3.4 The "375 is structurally immune" claim — tested, and it holds, with a limit

It holds as the goldens see it: `.tl-footer nav` computes to `display: none` at
375, every link rect is 0 × 0, C3 regenerated no `visual-375` baseline, and all
of them match.

**The limit.** Below 768 the same four groups are *also* rendered as
`.shell-footer-disclosures`, collapsed, with a real `hidden` attribute. Opened,
the footer goes **740.44 px → 1684.44 px** at a **40 px** pitch and both changed
columns are fully visible — KABİLİYETLER ending "Kabiliyet Profilleri", KURUMSAL
now starting "Hakkımızda" with no "Ana Sayfa". **No golden covers an open
disclosure.** "Structurally immune" is true of the collapsed state only, which
happens to be the only state any 375 golden captures.

---

## 4. The legal texts, from the rendered DOM

Quotations are `innerText` read out of the running preview at `b77be5c`.

**`/kvkk` madde 04 — three cases, Gemini named:**

> "Kişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü taraflara
> devredilmez. Aktarım **üç hâlde** olur: yetkili kamu kurum ve kuruluşlarının
> kanuna dayalı talebi; bu sitenin çalışması için kullanılan barındırma ile veri
> tabanı altyapısının hizmet sağlayıcısı; ve sohbet asistanında yapay zekâ onayı
> vermeniz hâlinde, o ana kadarki yazışmanın sitenin kendi sunucu fonksiyonu
> üzerinden Google'ın Gemini servisine iletilmesi."

**Nothing is asserted about Google after receipt** — the clause says so itself
("Metnin Google'a ulaştıktan sonraki âkıbeti hakkında bu belge bir şey
söylemez"). An adversarial pattern scan over the full rendered text of all three
legal routes found **no** retention period, **no** deletion timetable, **no**
encryption/SSL/TLS claim, **no** confidentiality-agreement claim, **no**
security-posture claim, and no sentence of the form
`(Google|Gemini) … (sakla|eğit|silin|imha|güvenli|koru|geçici olarak işle)`. The
one `imha takvimi` hit is madde 05's explicit **negation**.

**Exactly one link in madde 04, with no fragment:**
`[{ text: "Gizlilik Politikası", href: "/gizlilik-politikasi", hasHash: false }]`.
The clause is cited by number in prose ("Gizlilik Politikası'nın 06.
maddesindedir"), so `ScrollToTop.tsx`'s carried defect cannot strand the reader.

**Unchanged and still true:** "satılmaz" and "pazarlama amacıyla üçüncü
taraflara devredilmez" are both present; clause 05's statutory wording is intact
and is followed by its own refusal of a fixed timetable.

**Madde 02 brings the chat into scope**, in the phase's own register, and adds
"Sohbet metni sitenin veri tabanına kaydedilmez".

**`/cerez-politikasi` madde 02 renders five rows** — `sb-…-auth-token`,
`mas_chat_ai_count`, `mas_pending_cad_upload`, **`mas_intro_seen`**,
`mas-technic-theme` — and madde 01's completeness sentence is **byte-identical**
to `aae3536` (`diff` of the source block is empty).

> *Method note worth carrying:* an earlier scan with `\bNDA\b` produced three
> false hits. JavaScript's `\b` is ASCII-only, so Turkish `ı`/`ş` count as word
> boundaries and "kapsamında" matches `\bnda\b`. Anywhere a Turkish corpus is
> scanned with word boundaries — `scripts/claims-gate.mjs` included — that is a
> live hazard.

---

## 5. Failed checks

| # | Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|---|
| R2-1 | Visual inspection + geometry of `/cerez-politikasi` madde 02 at 320/375/390 | table is 583.9 px wide in a 375 px viewport; `DEPO`, `NE İŞE YARAR`, `SÜRE` off-screen for all five rows; **nothing scrolls** | `src/pages/CerezPolitikasi.tsx:133` — bare `div.shell-stack`, implicit grid track resolves to 585.875 px | **YES — blocking** |
| R2-2 | `e2e/qa-p08-storage-disclosure.spec.ts` · *no cookie is created on any public route* | `["__cf_bm@.hcaptcha.com", "__cf_bm@.w.hcaptcha.com"]`; four `hcaptcha.com` hosts contacted on `/giris` | `src/pages/Login.tsx:230` mounts hCaptcha; four absolute claims in `src/pages/CerezPolitikasi.tsx` and `src/pages/GizlilikPolitikasi.tsx` deny it | **YES — blocking** |
| R2-3 | `--project=tablet-768` and `--project=landscape-844` | `motion-grammar.spec.ts:254` `expect(locator).toBeHidden()` — Expected hidden, Received visible | `src/styles/technical-landing.css:507` `@media (max-width:767px)` vs two `mobile:true` projects at 768 and 844 | **PRE-EXISTING — not Phase 08's** |
| — | `visual-375` / `visual-768` / `visual-1440`, one test each | `installFontRetry() intercepted 0 requests on fonts.gstatic.com` | `e2e/visual/fonts.ts` | No — flake, clean on isolated re-run |

### DEFECT R2-1 (BLOCKING) — the storage table loses three of its four columns below 768, and nothing scrolls

The packet asked me to **look** at the table, because no golden covers the legal
routes (`e2e/visual/wave-b-golden.spec.ts:37` says so deliberately). I did:
`reports/qa/phase-08/r2/shots/cerez-viewport-375.png`.

**Measured at 375** (`table-clip.json`, and the same at 320 and 390):

```
table width 583.9 px, x = 43, right edge 626.9, viewport 375
KAYIT        [ 43.0 .. 256.0]  VISIBLE
DEPO         [256.0 .. 385.2]  OFF-SCREEN
NE İŞE YARAR [385.2 .. 530.3]  OFF-SCREEN
SÜRE         [530.3 .. 626.9]  OFF-SCREEN
```

Every one of the five rows shows only its key. At 390 `DEPO` appears; columns 3
and 4 never do below 768. At 768 and 1280 the table fits and reads correctly.

**It is not merely off-screen — it is unreachable** (`table-reach.json`):
horizontal wheel leaves `window.scrollX` at 0 and the fourth header's right edge
at 626.875; `scrollLeft = 9999` forced on **every** ancestor from `<table>` to
`<documentElement>` leaves all of them at 0; `window.scrollTo(9999, y)` does
nothing; `.shell-table-scroll` carries **no `tabindex` and no `role`**, so there
is no keyboard route either. `div.shell-root` computes `overflow-x: clip`,
which — unlike `hidden` — is not programmatically scrollable.

**It is not the fifth row's fault.** Hiding the `mas_intro_seen` row in the
browser and re-measuring gives an **identical** 583.9 px and identical column
widths. The row does make the damage far more visible — at 375 it is 246.5 px
tall against 85–126 px for the others, because its long third cell wraps to
eight invisible lines and leaves a quarter-screen of blank paper in the visible
strip — but the clip predates C3. It belongs to Phase 08, which created this
table: `git show 7dcfb65~1:src/pages/CerezPolitikasi.tsx` contains no table at
all, and the pre-Phase-08 text said the opposite of today's ("Zorunlu çerezler,
performans çerezleri ve analitik çerezler kullanmaktayız").

**It is unique to this one surface** (`table-blastradius.json`, at 375 and 320):

| route | figure width (375 / 320) | scrolls | tabindex |
|---|---|---|---|
| `/blog/havacilik-parcalarinda-malzeme-secimi` | 333 / 278 | yes | 0 |
| `/kalite-dosyasi` | 333 / 278 | fits | — |
| `/hizmetler/cnc-frezeleme` (4 tables) | 333 / 278 | yes | 0 |
| `/malzemeler` (MaterialRegister) | 333 / 278 | yes | — |
| **`/cerez-politikasi`** | **585.9 / 585.9** | **NO** | **null** |

(One marginal Wave A case at 320 only: `CNC Frezeleme — malzeme kaydı` is
295.1 px in a 320 viewport and loses one column the same way. Phase 07's, one
column not three.)

**Root cause, measured** (`table-container.json`, containing block of
`figure.shell-table` at 375):

| route | parent | resolved track |
|---|---|---|
| `/blog` | `div.shell-doc-table` | `display: block`, 333 px |
| `/kalite-dosyasi` | `div.shell-span-read shell-stack` | `grid-template-columns: 333px` |
| `/hizmetler/…` | `div.shell-span-full shell-stack` | `grid-template-columns: 333px` |
| **`/cerez-politikasi`** | **`div.shell-stack`** | **`grid-template-columns: 585.875px`** |

`CerezPolitikasi.tsx:133` wraps the table in a bare
`<div className="shell-stack" data-gap="sm">` with no `shell-span-*` class and
no `shell-doc-table`. `.shell-stack` (`shell.css:1098`) sets `min-width: 0` on
*itself*, but its implicit grid track is `auto` and resolves to the table's
585.875 px max-content width instead of the 333 px content column. The figure
then never overflows its wrapper, `.shell-table-scroll`'s `overflow-x: auto`
(`shell.css:1299`) never engages, and `useScrollableRegionAccess` — which grants
the tabindex only `if (isScrollable(element))`
(`useScrollableRegionAccess.ts:160`) — grants nothing. The escape hatch the
primitive's own comment promises ("so a narrow viewport scrolls the data",
`ShellComposition.tsx:203`) is inert here.

**Four instruments go green on it**, which is why it survived round 1:

1. the reflow assertion measures `scrollWidth − clientWidth ≤ 1`, satisfied
   *because* an ancestor clips (round 1: 15/15 at `mobile-320`);
2. axe has no rule for content clipped out of an `overflow: clip` ancestor;
3. `wave-b-golden.spec.ts:37` deliberately covers no legal route;
4. `e2e/landing/shell-cascade-contract.spec.ts`'s three-test lane *"scrollable
   regions stay keyboard reachable"* passes — and cannot fail here, because at
   375 the table is not a scrollable region at all, so there is no missing focus
   stop to find.

A fifth, unrelated instrument did see it: the glyph-free contrast probe at 375
could measure only **91 of 113** candidates on `/cerez-politikasi` — the only
route in the set with a large unmeasurable share — because 22 elements never
enter the viewport.

**Smallest fix:** one class on `src/pages/CerezPolitikasi.tsx:133` — the same
`shell-span-read` / `shell-span-full` the other document surfaces use, or
`shell-doc-table` as the journal article does. A `min-width: 0` on
`.shell-stack > *` would fix the class rather than the instance; that is a
design call. QA does not make production edits.

**Why it blocks:** criterion 2 requires the legal surfaces to share the global
design system, and this is the only one of eight `ShellSpecTable` surfaces that
does not get the shell's table behaviour; the mandatory task list names
"tables"; and the document's own completeness claim points a mobile reader at a
table whose purpose and lifetime columns they cannot read by any means.

### DEFECT R2-2 (BLOCKING) — `/giris` sets a cookie and embeds a third party, and four published absolute claims deny it

**Measured** (`cookies.json`, fresh context, plain load of `/giris`, no
interaction):

```
cookie  __cf_bm   domain .hcaptcha.com   httpOnly  secure  sameSite None
                  lifetime 30 minutes    (also .w.hcaptcha.com)
third-party hosts: fonts.googleapis.com, fonts.gstatic.com   (disclosed)
                   js.hcaptcha.com, newassets.hcaptcha.com,
                   <id>.w.hcaptcha.com x 2                   (NOT disclosed)
```

Every other route measured — `/`, `/kvkk`, `/cerez-politikasi`, `/malzemeler`,
`/teklif-al`, `/sifremi-unuttum`, `/reset-password` — contacts only the two font
hosts and creates zero cookies.

**Source:** `src/pages/Login.tsx:3` imports `@hcaptcha/react-hcaptcha`, `:30`
holds a hardcoded site key, `:230` renders `<HCaptcha>` inside the form. It
mounts with the page; no interaction is needed. **`/giris` is a public route by
the repository's own contract** — `e2e/shared-shell-accessibility.spec.ts` names
it in `NON_SHELL_PUBLIC_ROUTES`.

**The four false sentences, quoted from the rendered DOM:**

| document | sentence | status |
|---|---|---|
| `/cerez-politikasi` madde 01 | "Herkese açık sayfalarda **hiçbir çerez oluşturulmuyor**." | **FALSE** |
| `/cerez-politikasi` madde 03 | "Üçüncü tarafa giden **ikinci ve son** istek sohbet asistanınındır." | **FALSE** — there is a third, it needs no consent and fires on load |
| `/gizlilik-politikasi` madde 03 | "**Site çerez kullanmaz.**" | **FALSE** as an absolute over the scope madde 01 declares |
| `/gizlilik-politikasi` madde 05 | "Bunun dışında sayfalarda **gömülü üçüncü taraf içerik** … bulunmaz" / "**Bir istisna var**…" | **FALSE** — hCaptcha is an embedded widget iframe, and a second exception |

And one more in the document C3 just corrected: `/kvkk` madde 04 now closes its
list at "üç hâl", while loading `/giris` sends the visitor's IP and browser data
to Intuition Machines' hCaptcha endpoints. That is a fourth case — the same
closed-list defect class C3 fixed, one third party over.

The madde 01 sentence that **survives** is its second one: `__cf_bm` is a
bot-management cookie and is not an ad cookie, analytics cookie, tag manager, ad
pixel or session-recording tool.

**Attribution.** The cause predates Phase 08 and `Login.tsx` is untouched by it.
All four sentences were **written by Phase 08** (`36c3980`), replacing a
pre-Phase-08 text that claimed the opposite. §13 and §1.3 are the C3 packet's
own REQUIREMENT_IDs, and both fixes land in Phase 08's own files.

**I have to correct myself.** Round 1 wrote: *"No undisclosed third-party
transfer exists: the only outbound hosts reachable from a visitor's browser are
fonts.googleapis.com / fonts.gstatic.com and the Gemini endpoint."* That was
wrong, for exactly the reason round 1 itself listed as open item 7 — I measured
six routes and none of them was `/giris`.

**Smallest fix:** disclose hCaptcha where the fonts CDN already is
(`/cerez-politikasi` madde 03, `/gizlilik-politikasi` madde 05, `/kvkk` madde
04's enumeration) and add a `__cf_bm` row with its 30-minute lifetime; or scope
the four absolute sentences to the routes they are true of. The first is the
honest one and matches how the fonts CDN and Gemini are already handled.
Removing hCaptcha is a security decision belonging to Phase 09.

### DEFECT R2-3 (PRE-EXISTING, not Phase 08's) — a hover-only affordance renders on touch above the breakpoint

`e2e/landing/motion-grammar.spec.ts:254` fails at `tablet-768` **and**
`landscape-844`, and only there. Reproduced in isolation (5 passed, 1 failed),
so not a flake. The test branches on
`matchMedia("(hover:hover) and (pointer:fine)")`; both projects set
`mobile: true`, so the pointer is coarse and it asserts `.tl-dimension-lines` is
absent. The rule that removes them is `@media (max-width:767px)`
(`src/styles/technical-landing.css:507`, declaration at `:513`), and both
viewports are above it. `git log 7dcfb65~1..b77be5c` over
`src/styles/technical-landing.css` and `e2e/landing/motion-grammar.spec.ts` is
**empty** — neither file was touched by any of the phase's commits, C3 included.
It went unseen because these are the two viewports this run had never exercised.

---

## 6. Storage, enumerated (round 1's open item 7, closed)

26 public route templates, two regimes, three special contexts.

| regime | result |
|---|---|
| one context, all 26 routes in sequence | cookies `["__cf_bm"]`, local `["mas-technic-theme"]`, session `["mas_intro_seen"]` |
| fresh context per route | all 26 write `mas-technic-theme`; **only `/`** adds `mas_intro_seen`; **only `/giris`** adds a cookie |
| `reducedMotion: "reduce"` on `/`, first load and reload | session `[]` — the intro key is **not** written |
| `/` plain, first load and reload | `mas_intro_seen` written once, survives reload |
| fresh context loading `/kvkk` directly | session `[]` — the script does not write off the landing |

Against `index.html:294-316`
(`if (seen || reduced || !onLanding) return; sessionStorage.setItem(KEY, "1")`):
every one of the fifth row's four claims — store, purpose, "only on the home
page / not under reduced motion", "until the tab closes" — is exactly what the
source does and what the browser shows.

**So `mas_intro_seen` was the only unlisted local/session key, and it is now
listed.** Madde 01's completeness claim, read as a claim about localStorage and
sessionStorage, is TRUE. It is the *cookie* half of the same clause that fails.

---

## 7. The new permanent gate

`e2e/qa-p08-storage-disclosure.spec.ts` — QA-owned, `qa-` prefixed,
`desktop-1280` lane, `npx tsc -b` exit 0.

| # | test | result |
|---|---|---|
| 1 | every stored key over every public route has a row in the published table | **pass** — the D4 contract |
| 2 | the rendered table and the `STORAGE_ROWS` constant are the same list | pass |
| 3 | no cookie is created on any public route | **FAIL — defect R2-2** |
| 4 | `mas_intro_seen` is written on `/` and not under reduced motion | pass |
| 5 | negative control — red on an observed key nobody published | pass |
| 6 | negative control — red on a published list that lost a row | pass |

It asserts set **coverage**, not a row count, because a count is not a contract.
It is red by design until the disclosure is corrected; two runs produced the same
two cookies with different ephemeral worker hostnames.

**The first version of this file passed everything, and that is recorded on
purpose** (`STEP5-gate.txt`). It built the sweep on `gotoAndSettle`, which is
`domcontentloaded` plus two paint frames — the right readiness contract for
layout and the wrong one for a widget that mounts after hydration. hCaptcha had
not made a request yet, so all six tests were green against a page that
demonstrably violates the claim. It now waits for `networkidle` (bounded) plus
1 s per route and carries a **positive** control requiring the sweep to have
reached at least one third-party host. The two negative controls did not catch
the vacuous pass, because the hollow part was the *measurement*, not the
comparison — which is the general lesson.

---

## 8. RFQ / "hiçbir yapay zekâ servisine gönderilmez" — TRUE as written

The sentence appears in `/kvkk` madde 04 (new) and `/gizlilik-politikasi` madde
06. Full trace in `STEP7-rfq-ai-trace.txt`.

**What an RFQ submission writes** (`TeklifAl.tsx:513-543`, the only submit path):
one object into the `cad-uploads` bucket, and one row into `rfqs` via
`supabase.functions.invoke("rfq-rate-limit")` →
`supabase/functions/rfq-rate-limit/index.ts:127`. Nothing else.

**Can either reach `finance-ai`, `ocr-invoice` or `parasut-sync`?**

- There are exactly **four** `functions.invoke` call sites in all of `src/`:
  `TeklifAl.tsx:523` → `rfq-rate-limit`, and `FinanceDocsView.tsx:167/255/272` →
  the three AI/sync functions. All three AI invocations live in **one admin file
  that never reads `rfqs` and never touches `cad-uploads`**; its `finance-ai`
  payload is seven fields built from `financial_documents`.
- **Every** reader of `rfqs` (13 sites) and **every** consumer of `cad-uploads`
  (13 sites) was enumerated. Not one invokes an edge function; they are
  `select`/`update`/`delete`, `createSignedUrl`, `list`, `download`, `upload`.
- Server-side, the strings `rfqs` and `cad-uploads` **do not appear** in
  `finance-ai`, `ocr-invoice`, `parasut-sync` or `due-date-reminder`. Those read
  `user_roles`, the `finance-docs` bucket and `financial_documents`.
- The database adds `pg_cron` + `pg_net` and exactly **one** scheduled
  `net.http_post` — a daily 08:00 empty-body call to `due-date-reminder`. No
  trigger on `rfqs`, no webhook on `cad-uploads`.

**Verdict: the sentence is true and both documents may keep it.** Two caveats
recorded rather than hidden: `finance-ai` accepts an unvalidated caller-supplied
`documents` array, so the guarantee is held by one call site and not by a
server-side constraint — the same drift shape round 1 recorded for the chat
consent filter; and an admin pasting RFQ text into the finance AI's free-text box
is a human action, not the data path the sentence is about.

---

## 9. Criteria 3 and 5 — CARRIED, re-measured, neither got worse

Recorded as CARRIED per `PROGRESS.md` **A21** and **A20**. C3 did not address
them and was not asked to. Both re-measured with round 1's own probes.

**Criterion 3 (A21)** — identical to round 1, to the node:

| route | legacy-teal nodes | Radix roots | `shell-*`/`tl-*` primitives |
|---|---|---|---|
| `/teklif-al` | 16 | 3 | 1 |
| `/giris` | 92 | 0 | 0 |
| `/sifremi-unuttum` | — | — | 0 |
| `/reset-password` | — | — | 0 |
| `/cad-dashboard` | 16 | 3 | 1 |

All ten Wave B surfaces and the four Wave A controls: 0 teal, 0 Radix roots, 0
`bg-card`, 0 off-register radii, 0 system-font nodes, 47–404 shell primitives.
`/cad-dashboard` is the redirect alias for `/teklif-al`, which is why the two
rows are identical.

**Criterion 5 (A20)** — identical to round 1:

```json
{ "tag": "li", "sonner": true, "text": "Desteklenmeyen dosya formatı.",
  "background": "rgb(255, 255, 255)", "borderRadius": "8px",
  "border": "1px solid rgb(217, 222, 226)",
  "fontFamily": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont," }
```

The three states Phase 08 *did* brand are unchanged and still correct: `/sss`
empty (`0px`, Space Grotesk, working "FİLTRELERİ TEMİZLE"), loading (`0px`, Space
Grotesk), route error (one `<h1>` "Bu sayfa yüklenemedi",
`ERR::ROUTE_RENDER_FAILED`, three recovery actions).

**NEITHER CARRIED CRITERION GOT WORSE.**

---

## 10. Acceptance criteria matrix

| # | Criterion | Round 1 | Round 2 | Evidence |
|---|---|---|---|---|
| 1 | 404 is unmistakably MAS TECHNIC, usable and linked back | PASS | **PASS** | `ul.shell-index` 8 entries at 375 and 1280; `<h1>` "Bu koordinatta kayıt yok"; own "Ana sayfa" action; `waveb-notfound-body` golden matches |
| 2 | Blog/article, quality/resources, case studies, SSS and legal share the global design system | PASS | **FAIL** | Structurally still 0 teal / 0 Radix / 0 off-register radii on all ten surfaces — but `/cerez-politikasi`'s table is the only one of eight `ShellSpecTable` surfaces that does not get the shell's table behaviour. **DEFECT R2-1** |
| 3 | No public route still visibly belongs to the old design language | FAIL | **CARRIED (A21)** | §9. Unchanged, not worse |
| 4 | Search/filter implemented with a justified need or explicitly omitted | PASS | **PASS** | Unchanged; recorded per surface in source |
| 5 | Error/loading/empty states no longer fall back to library defaults | FAIL | **CARRIED (A20)** | §9. Unchanged, not worse |
| — | Content truth (§13, §1.3) across the published legal set | partly FAIL (D3, D4) | **FAIL** | D3 and D4 fixed and verified; **DEFECT R2-2** — four absolute claims falsified by hCaptcha on `/giris` |

---

## 11. What Phase 08 and C3 got right, with the measurement

*Carried forward from round 1 and extended, because a report that lists only
failures misrepresents the work.*

- **The footer fix is the right fix.** The band came back to 297 px without
  touching `ia.ts`, without a fifth column, and without moving the `0.26`
  constant. The 1280 landing page is now byte-clean above the footer against the
  pre-Phase-08 baseline (§3.3).
- **The radius register moved as one contract.** The C3 packet was right that
  QA's stated one-line doc fix was incomplete — `foldRegister` builds the SOURCE
  cell from `RADIUS_SOURCES` — and all three tests are green, including the
  browser census and the drift control.
- **The KVKK correction is well-judged.** It states only what the repository can
  prove, refuses to describe Google's behaviour, cites the clause by number
  rather than by a fragment `ScrollToTop.tsx` would eat, and leaves the two true
  statements alone.
- **The `<h1>` recurrence of Phase 07's F3 still has not happened** — 15 Wave B
  paths, exactly one `<h1>` each.
- **Zero serious/critical axe violations**, 30/30 across `desktop-1280` and
  `mobile-375`; reflow at 320 CSS px holds on all 15.
- **Contrast at 375 — round 1's open item, now closed.** 1 324 elements over ten
  surfaces, **zero real failures**, negative controls reproducing at
  21 / 1 / 3.033 / 3.033 / 3.977 on every route. The single hit is the same
  `aria-hidden`, transparent-filled decorative "404" numeral round 1 adjudicated
  at 1280 (2.63 here against 2.75 there), whose content is carried as real text
  beside it.
- **The full `desktop-1280` regression round 1 lost is complete** — 176 tests,
  151 passed, 24 skipped, 1 failed (my own new gate). Every repository-owned test
  at that viewport is green, including the five specs round 1 never reached.
- **Cross-browser, run for the first time in this phase:** all four `smoke-*`
  projects green, 12/12. Stated honestly: the smoke suite is three tests and
  covers one inner page, so Wave B under Firefox and WebKit is still uncovered.
- **`node scripts/claims-gate.mjs` → PASS — 0 unverified claims across 27
  rules**, 214 files / 27 705 non-comment lines, re-run after the C3 legal edits.
- **`npx tsc -b` exit 0; `npm run build` exit 0** at `b77be5c`.

---

## 12. Observations (not blocking)

1. **`/kvkk` madde 04 still opens a closed list and then adds to it.** "Aktarım
   üç hâlde olur" is followed a paragraph later by "Bir işin yürütülmesi için
   üçüncü bir tedarikçiye teknik dosya iletilmesi gerekiyorsa…". Pre-existing and
   hedged, so not raised to blocking — but "üç hâlde" is a stronger closed claim
   than "iki hâlde" was.
2. **The storage table's note** says "hiçbiri üçüncü bir tarafa aktarılmaz";
   `sb-…-auth-token` is sent to Supabase on every authenticated request.
   Defensible under the document's own vocabulary, in tension for a literal
   reader.
3. **"Aktarılan tek şey yazışma metnidir"** — the request body also carries the
   site's own `system_instruction` and `generationConfig`. Neither is the
   visitor's data; noted for exactness.
4. **`installFontRetry()` flaked in three of four visual projects in one pass.**
   Higher than previously recorded; feeds the Phase 12 self-hosting decision.
5. **`/malzemeler`'s scroll region scrolls but was not granted a tabindex** in my
   probe window, where the others were. Possibly timing; worth a look when
   somebody is next in `useScrollableRegionAccess`.
6. **Carried from round 1, unchanged:** the claims-gate coverage holes (eight
   strings, no revenue rule); blog publication dates untouched while the bodies
   were rewritten; `ScrollToTop.tsx` eating `location.hash`; the stale
   consent-prompt filter at `ChatBot.tsx:239-240`; the `/sss` capacity claim
   inherited from `servicePages.ts`.

---

## 13. Commands run

```text
npm run build                                                          # exit 0
npx tsc -b --pretty false                                              # exit 0
node scripts/claims-gate.mjs                                           # PASS - 0/27, 214 files

npx playwright test e2e/technical-landing.spec.ts --project=critical-1280   # 15 passed
npx playwright test --project=critical-375                                  # 81 passed, 2 skipped
npx playwright test e2e/visual/radius-census.spec.ts --project=visual-1280  # 3 passed
npx playwright test e2e/landing/navigation-reachability.spec.ts --project=critical-1280  # 5 passed
npx playwright test --project=visual-375   # 34 passed, 1 failed (font flake) -> re-run 2 passed
npx playwright test --project=visual-768   # 34 passed, 1 failed (font flake) -> re-run 6 passed
npx playwright test --project=visual-1280  # 41 passed
npx playwright test --project=visual-1440  # 34 passed, 1 failed (font flake) -> re-run 7 passed
npx playwright test --project=desktop-1280            # 5 chunks: 151 passed, 24 skipped, 1 failed
npx playwright test --project=mobile-320              # 123 passed, 53 skipped
npx playwright test --project=mobile-375              # 119 passed, 57 skipped
npx playwright test --project=mobile-390              # 102 passed, 74 skipped
npx playwright test --project=tablet-768              #  99 passed, 76 skipped, 1 FAILED
npx playwright test --project=landscape-844           #  99 passed, 76 skipped, 1 FAILED
npx playwright test --project=desktop-1440            # 103 passed, 73 skipped
npx playwright test --project=desktop-1440-short      # 103 passed, 73 skipped
npx playwright test --project=smoke-firefox-390 / -1440 / smoke-webkit-390 / -1440   # 12 passed
npx playwright test e2e/qa-p08-storage-disclosure.spec.ts --project=desktop-1280
                                                      # 5 passed, 1 FAILED (defect R2-2)

node reports/qa/phase-08/r2/probe-footer.mjs             # band, columns, pitch, complement, brand
node reports/qa/phase-08/r2/probe-controls.mjs           # menu index, 404 directory, home click
node reports/qa/phase-08/r2/probe-nav-grid.mjs           # the 2x2 grid at 768; 375 disclosures opened
node reports/qa/phase-08/probe-golden-rebank.mjs  (x22)  # 21 rebanked + the pre-Phase-08 control
node reports/qa/phase-08/r2/probe-legal.mjs              # rendered clauses, anchors, table, shots
node reports/qa/phase-08/r2/probe-table-clip.mjs         # the clip, and the 4-row experiment
node reports/qa/phase-08/r2/probe-table-reach.mjs        # every scroll route, tried and refused
node reports/qa/phase-08/r2/probe-table-blastradius.mjs  # 6 routes at 375, 768 and 320
node reports/qa/phase-08/r2/probe-table-container.mjs    # the containing block, route by route
node reports/qa/phase-08/r2/probe-storage.mjs            # 26 routes x 2 regimes + 3 contexts
node reports/qa/phase-08/r2/probe-cookie.mjs             # per-route cookies and third-party hosts
node reports/qa/phase-08/probe-legacy-accent.mjs         # carried criterion 3
node reports/qa/phase-08/probe-design-membership.mjs     # carried criterion 3
node reports/qa/phase-08/probe-error-states.mjs          # carried criterion 5
QA_VP=375 node reports/qa/phase-07/probes/p6-contrast.mjs  # 10 routes, 1324 elements
```

All Playwright runs were foreground, one `--project` at a time, against a single
`vite preview` on `:4173` via `PLAYWRIGHT_BASE_URL`, with output redirected to
`.txt`. Never `run_in_background`.

---

## 14. Scope integrity

**PASS.**

- Production files modified by QA: **NONE**.
- Files created by QA this round, all inside the WRITE_ALLOWLIST:
  `e2e/qa-p08-storage-disclosure.spec.ts`, `reports/qa/phase-08.md`,
  `reports/qa/phase-08/r2/**`. One QA-owned round-2 probe
  (`reports/qa/phase-08/r2/probe-table-blastradius.mjs`) gained an env knob; it
  is mine and inside the allowlist.
- **No golden PNG written, moved or deleted. `--update-snapshots` never run, in
  either round, for any reason.**
- No assertion weakened, no tolerance broadened, no skip or xfail added, no
  coverage deleted. The one budget change in the new spec
  (`test.setTimeout(360_000)` on the two sweep tests) is a time budget for a
  23-route walk measured at ~51 s and ~57 s; it loosens no assertion, and the
  60 s default was what made the first honest run report a timeout instead of a
  defect.
- `PROGRESS.md`, `IMPLEMENTATION.md`, `USER_INPUTS.md`, `CLAUDE.md`,
  `MASTER_CONTEXT.md`, `docs/**`, `src/**`, `public/**`, `supabase/**`,
  `scripts/**`, `.claude/**`, `tsconfig.json` and all build/package config:
  untouched.
- `tsconfig.app.tsbuildinfo` (tracked, modified by the type-check) and
  `tsconfig.e2e.tsbuildinfo` (untracked) are build artifacts outside the
  allowlist. They were left alone and are **not** in any QA commit.

---

## 15. Round 1, preserved

Round 1 ran at `5138fc1` and returned **FAIL**: 380 passed, 2 failed, 84 skipped,
46 new tests. It found two red repository gates (`bantOrani` 0.2671875; the
drifted `ChatBot.tsx:225` radius citation) and two content-truth defects (the
two-case KVKK transfer list; the four-row storage table). All four are now fixed
and independently re-verified above. Round 1 also falsified two Orchestrator
premises, adjudicated the two handed-over defects (`ChatBot.tsx:239-240`,
`ScrollToTop.tsx`), audited the four-PDF document register byte for byte, proved
the analytics removal complete, and ran an adversarial probe of
`scripts/claims-gate.mjs` that found eight escaping strings. Its full text is in
this file's git history at `aae3536`, and all of its evidence remains on disk in
`reports/qa/phase-08/`.

Round 1 named eight things it could not verify. Round 2 closes five of them (the
full `desktop-1280` regression, the other seven viewports, the `smoke-*`
projects, contrast at 375, and whether `mas_intro_seen` was the only unlisted
key), and the Orchestrator resolved a sixth (the Coder write-allowlist claim is
dropped as unverifiable — the Phase 08 packets were never written to disk). Two
remain open and are stated as such: the production host's real-HTTP-404
behaviour, unknowable from the repository; and Lighthouse/performance, not in
this phase's criteria.

**And round 1 got one thing wrong**, which round 2 corrects: its claim that "no
undisclosed third-party transfer exists" was false, because it measured six
routes and none of them was `/giris`. That is defect R2-2.
