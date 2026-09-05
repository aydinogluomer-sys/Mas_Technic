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
