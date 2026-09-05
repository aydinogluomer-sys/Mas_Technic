# QA Report — Phase 08 · ROUND 3 (closing round)

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

