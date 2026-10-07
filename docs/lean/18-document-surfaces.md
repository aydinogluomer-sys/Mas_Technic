# 18 — Document surfaces (Phase 08)

> The documentary half of the public site: legal texts, the technical journal,
> the quality dossier, capability profiles, and the error/empty/loading states.
> Companion docs: `15-page-shell.md` (the frame), `17-inner-page-composition.md`
> (the ladder and the Wave A decisions), `16-content-truth.md` (what may be
> published).

---

## 1. What Phase 08 changed

Phase 04 framed seven surfaces and left their bodies; Phase 07 rebuilt six
commercial pages. What remained was everything that is a *document* rather than
a *product page* — and all of it still resolved its colours from the shadcn
light theme:

| route | was | is |
| --- | --- | --- |
| `/blog` | `grid lg:grid-cols-4` card grid + 5-panel sidebar | lead article + register |
| `/blog/:slug` | `prose prose-sm max-w-none` over a flat paragraph array | anchored sections + contents + plate + table |
| `/sss` | ~120 `border bg-card` accordions + analytics sidebar | grouped register, `<details>`, no analytics |
| `/kvkk` `/gizlilik-politikasi` `/cerez-politikasi` | 24 lines each of `max-w-3xl` prose | one `LegalDocument` sheet, numbered citable clauses |
| `*` (404) | four hand-picked icon links | nearest-record correction + site directory |
| — | no route | `/kabiliyet-profilleri` + `/:slug` |
| — | no route | `/kalite-dosyasi` |

Three molecules were added to `ShellComposition.tsx` because more than one of
those needed the same structure:

```
ShellDocSection   numbered, anchored clause / article section   · 6 pages
ShellContents     the index of those anchors                    · 5 pages
ShellNotice       inline error / caution / note                 · shared
```

`ShellIndexList` gained an `href`/`download` variant so the quality dossier's
document register is the same register row as every other index on the site.
A router `<Link>` to `/belgeler/…` would be intercepted by the router and
resolve to the 404 catch-all, which is why the variant exists rather than a
page-local skin that resembles a register row.

---

## 2. Search and filter, decided per surface

`IMPLEMENTATION.md` §PHASE 08 accepts an explicit omission with a reason. The
corpus decides it, not the page type — and the reason is written in each file
rather than only here.

| surface | corpus | decision | reason |
| --- | --- | --- | --- |
| `/sss` | 10 general + 117 service `faq` entries, de-duplicated | **search + category filter** | A register that long cannot be read top to bottom. |
| `/blog` | 6 articles, 5 categories | **omitted** | Every article is on the page with its own section headings. Three controls to narrow six items are furniture, and each can return an empty state. |
| `/kabiliyet-profilleri` | 3 profiles | **omitted** | Nothing to filter. |
| `/kalite-dosyasi` | 4 documents, 3 certificates | **omitted** | Nothing to search. |
| 404 | — | **omitted**, replaced | There is no site-wide search index in this project. See §4. |
| `/malzemeler` | 11 families (Phase 07) | search + filters | Unchanged. |

Two controls at most, ever. `/sss` deliberately has **no sort control**: no
reader has an opinion about question order, and its third option used to be
"popular", which §K `ANALYTICS_PROVIDER: NONE` makes unmeasurable.

---

## 3. The `/sss` analytics pipeline, and why removing it was not a style call

`/sss` wrote to a Supabase table on every interaction and read it back on
mount:

* every search wrote the reader's raw query (`event_type: "search"`) after a
  1.5 s debounce;
* every question opened wrote that question (`event_type: "click"`);
* the page then read the 200 most recent of each and rendered
  `Popüler Aramalar` and `En Çok Aranan … {count} tıklama`.

Three separate problems, any one sufficient:

1. §K records `ANALYTICS_PROVIDER: NONE`, and `claims.ts` withholds
   `CONTENT_ANALYTICS` on that authority — "per-post read counts, their sum and
   the most-read ranking". A most-clicked ranking is that shape. It evaded the
   ledger only because this one was *measured* rather than typed, and §K does
   not distinguish.
2. `Popüler Aramalar` **republished other visitors' raw search strings** to
   every subsequent visitor, unfiltered. A buyer typing a part number, a
   project code or their own company name into a CNC supplier's FAQ box had it
   shown to the next person on the page.
3. Neither legal page disclosed it, and this phase rewrote both to say the site
   runs no analytics. That sentence has to be true of the code.

`supabase/` is out of scope and the table is untouched. What is gone is this
page reading from it and writing to it.

---

## 4. The 404, and the real-HTTP-404 requirement

### 4.1 Recovery instead of a search box

The old page offered four hand-picked destinations out of ~90 routes. It now
tokenises the requested path and scores it against `navigationTargets()`, so
`/hizmetler/cnc-frezelme` surfaces `/hizmetler/cnc-frezeleme`, and follows that
with the site's own directory. A 404 needs a **correction** affordance, not a
query interface.

A global search box was rejected on evidence: this project has no site-wide
search index, and the two searches that exist are scoped to their own corpora
and cannot answer "where is the page I was trying to reach". The scoring
threshold means the block is **not rendered at all** when nothing scores — an
empty "did you mean" is a worse answer than none.

### 4.2 The deployment half is a stated gap, not a fabricated config

The requirement is conditional — "where hosting permits". Measured from the
repository rather than assumed:

* **No hosting configuration of any kind.** No `_redirects`, `netlify.toml`,
  `vercel.json`, `staticwebapp.config.json`, `firebase.json`, `.htaccess`,
  `public/_headers` or `public/404.html`.
* `vite.config.ts` builds a plain SPA — no SSR, no prerender plugin — so no
  route can carry a status code of its own.
* No deploy target is configured in the repo (Vercel is planned), while `USER_INPUTS.md` §A
  names `https://www.masmare.com` as the production domain and says nothing
  about how it is served. §M sets `ALLOW_PRODUCTION_DEPLOY: NO`.

So the platform's 404 behaviour cannot be established, and guessing is not
free. On a static host that honours `public/404.html` — GitHub Pages is the
clearest case — adding one **changes the SPA fallback**: `/blog/<slug>` would
be served the 404 document instead of `index.html`, and every deep route on the
site would break. A file added on a guess about the host is not a partial win.

**Open, and owned elsewhere:** `<meta name="robots" content="noindex">` on the
404 route is the one mitigation that belongs to a route rather than a host. It
needs `src/hooks/use-page-meta.ts`, which is outside Phase 08's write allowlist
and inside Phase 11's metadata scope.

---

## 5. Error, empty and loading states

`ShellLoading` / `ShellEmpty` / `ShellRouteError` existed from Phase 04. Two
things changed, and the split between them is the thing worth keeping:

* **`ShellEmpty` renders its title as a `<p>`, and that is correct.** It is a
  FRAGMENT, used inside a page that has already published its `<h1>` from
  `ShellPageHero` — the split Phase 07's correction F3 established after an
  earlier version used it as a whole not-found body and shipped three routes
  with no `<h1>`.
* **`ShellRouteError` renders its title as an `<h1>` now, and that is the same
  rule.** `ShellRouteBoundary` renders it *instead of* the entire routed body,
  so while it is on screen it is the document's only content — and its title
  was a `<p>`. F3 in the one state F3 did not look at.

`ShellNotice` is the new inline message block: form error, CAD parse error,
caution beside a table. `tone="error"` is the only tone that takes
`role="alert"`; a note announced on every render is a defect, not a courtesy.
Nothing is a coloured card — the tone is a 2 px rule on the leading edge, the
same device `.shell-form-error` already used, so a field-level error and a
block-level one read as the same object.

**Not wired, and deliberately:** the CAD parse error and the RFQ form errors
live in `src/pages/TeklifAl.tsx`, which Phase 09 owns and Phase 08 may not
edit. The primitive is here for Phase 09 to use; claiming those states are
"done" would be claiming a change that does not exist in that file.

---

## 6. Not-found bodies and the sentinel string

Two route specs detect a route resolving to a not-found body by looking for a
heading matching the anchored `/^(Sayfa|Yazı) Bulunamadı$/`:

* `e2e/shared-shell-accessibility.spec.ts` — all canonical full-shell routes;
* `e2e/landing/navigation-reachability.spec.ts` — every navigation target.

So the string is load-bearing in **both directions**, and the rule is:

* `/blog/:slug` keeps `Yazı Bulunamadı` — it *is* the sentinel, and every
  canonical blog route resolves, so it never fires on one. Renaming it would
  not fail those specs; it would quietly disarm them.
* A *new* not-found body uses a heading the pattern does not match —
  `/kabiliyet-profilleri/:slug` says "Bu profil kaydı bulunamadı", following the
  `CategoryPage.tsx` precedent from F3. The `<h1>` stays; only the string avoids
  the sentinel.

---

## 7. Capability profiles: the collision, and how the type resolves it

`IMPLEMENTATION.md` §PHASE 08 requires case-study index and detail pages.
`USER_INPUTS.md` §G says `CASE_STUDIES: NONE_PROVIDED_YET` and, where there are
none, `REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT`.

These do not conflict, because Phase 06 anticipated exactly this and built
`src/content/caseStudies.ts` as a discriminated union on `kind`:

* `capability` — `client`, `reportNo` and `measuredResults` are typed `never`,
  so a capability profile cannot grow project evidence by accident;
* `anonymised-project` — reserved, carries a `sector` instead of a customer and
  requires `permission: "ANONYMISED"`.

The two routes publish that model under the name the landing already uses for
it (band 07, `KABİLİYET PROFİLLERİ`), and **the index says so on the page**, not
only in a comment: these are not customer projects, there is no
nominal → measured table, and there will not be one without a real inspection
record and a client permission. A reader shown an index labelled "case studies"
and given capability descriptions has been misled by the label.

The detail page renders the `anonymised-project` branch — a measured-results
table and a report number — which is **unreachable by type** for today's three
entries. That is not dead code; it is what makes the model's own promise
("nothing here has to be rewritten") true when a permitted job arrives.

---

## 8. `/kalite-dosyasi`: what it publishes and what it refuses

Everything on the page is `PUBLIC_OK`, and nothing else is: the four §H
documents, the three §C management systems, and the §D tolerance and
measurement-coverage statements — all through `claims.ts`.

Refused, each with its authority:

| refused | authority |
| --- | --- |
| certificate numbers, registrars | `CERTIFYING_BODIES` withheld — "naming a registrar invents an audit that did not happen" |
| verification link or QR | `REPORT_VERIFICATION_SERVICE` withheld; §13 forbids a fake verification destination by name |
| on-time / first-pass rate | `ON_TIME_DELIVERY` withheld — conditional permission, unmet |
| specimen inspection report | there is no real one; a specimen with invented numbers is what Phase 06 deleted from band 07 |

The page therefore has no proof strip and no badge row.

**The route is `/kalite-dosyasi`, not `/kalite`.** `kalite` is already a
published landing anchor in `landingSections` (`/#kalite`, verified against the
DOM by `e2e/landing/landing-anchors.spec.ts`). Two destinations differing only
by a `#` is an addressing trap.

**The landing's band 10 is not linked to it, and that is a scope decision
rather than a design one.** `FinalSections.tsx` is writable in this phase only
"if the Quality surface requires it", and it does not: the route is reachable
from the global menu, the footer and three inner pages. Linking band 10 would
change `landing-fullpage.png` at four viewports for a one-line benefit. It is
recommended for a later phase that is already touching the landing.

---

## 9. Legal texts

One `LegalDocument` composition for three routes: numbered clauses on the paper
document ground, a sticky anchor index, one `LEGAL_REVISION` constant so the
three cannot disagree about when they were written. **Every clause carries a
stable `id`**, because "madde 4" is how these documents are cited and a clause
nobody can link to cannot be quoted back at anybody.

Three factual corrections, all §13:

1. **"Tüm veriler şifreli ortamlarda saklanır ve yetkisiz erişime karşı
   korunur."** §13 forbids inventing encryption guarantees by name and §J
   records `CONFIDENTIALITY_TEXT_APPROVED: NO`. It is **not** replaced with a
   softer sentence — `claims.ts`'s pattern is that a withheld fact becomes a
   typed absence, not a hedge. There is no security clause, and the reason is
   written where the clause was.
2. **"Zorunlu çerezler, performans çerezleri ve analitik çerezler
   kullanmaktayız."** Measured: the only `document.cookie` write in the
   repository is `src/components/ui/sidebar.tsx`, which is imported by nothing
   (`grep -rn "ui/sidebar" src/` returns no hits), and there is no analytics
   script anywhere. §K asked for `DERIVE_FROM_ACTUAL_SCRIPTS`; the page now
   states that no cookie is set and proves it with a table of what the site
   *does* put in the browser — key, store, purpose, lifetime — every row
   readable in devtools.
3. **The veri sorumlusu is the legal person** §A supplies as `PUBLIC_CORE`, and
   the transfer clause states a boundary instead of the blanket "iş ortaklıkları
   kapsamında üçüncü kişilere aktarılabilir".

No retention period and no deletion process is described: §J records both as
`UNKNOWN_REMOVE_IF_UNVERIFIED`. What the KVKK text states is the statutory
position and the reader's md. 11 right — law, not an unverified promise.

Deliberately **not listed** in the cookie table: `mas_sound` (only the Phase 03
header toggle ever wrote it, and the toggle is gone — a key nothing can write is
not something the site stores), `mas_gsap_debug` and the master-grid overlay key
(both behind `import.meta.env.DEV`), and `nexus-settings` (the admin panel,
outside the public surface per §N).

### 9.1 The AI disclosure, and the false sentence that nearly replaced a false page

A fourth correction, added later in the phase, because §3 above set the standard
and the standard cut both ways: *"this phase rewrote both legal pages to say the
site runs no analytics — that sentence has to be true of the code."* The
converse binds too. The chat panel made a request that no legal page described,
and **a privacy policy's job is to enumerate processing**, so an undisclosed
transfer of reader-typed content makes the document misleading even where no
individual sentence in it is false.

**The first draft of the disclosure was wrong, and that is the point.** It said
the assistant sends what you type "to the site's own backend for answering" —
inferred from `ChatBot.tsx`, which posts to `{SUPABASE_URL}/functions/v1/chat`
and stops there. The function does not answer:

| step | where it is written |
| --- | --- |
| local FAQ first, no network on a match | `ChatBot.tsx:291-295` over the bundled `chatFaqData` |
| opt-in gate — typed `Evet` or the button | `:209`, `:384`; `:216` is the only call site of `callAi()` |
| browser → the site's own function | `:71`, `:98` |
| function → **Google Gemini** | `chat/index.ts:32` builds `generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent`, `:34` fetches it, `:22-30` remaps to `role`/`parts` |
| only the text goes onward | `chat/index.ts:37-44` — `system_instruction`, `contents`, `generationConfig`; no browser header forwarded |
| nothing reaches this site's database | the whole 103-line function holds no Supabase client, no `insert`, no `from(` |
| the chat is the ONLY such path | `useRfqSubmission.ts:364` invokes `rfq-rate-limit`, which calls nothing external, and `src/` contains no external `fetch()` at all |

So "our own backend" would have been a **new false statement in the document
this phase rewrote to stop being false** — the failure class this run kept
hitting. The agent that found the gap escalated it rather than patching it,
which is what caught the error; narrowing a legal page is not a call one agent
takes alone.

**What clause 06 does not say, and why.** Nothing about what Google does with
the text, how long it holds it, or whether it trains on it. `USER_INPUTS.md` has
no field about processors, AI or third parties, so this disclosure is grounded
in **observable code facts only** — there is no §-authority to cite the way a
certification has one. The clause states the boundary instead: what we send,
to whom, and that this policy cannot speak for what happens after the handoff.
A reassurance nobody can check is exactly the defect the page lost its
"şifreli ortamlarda saklanır" sentence for.

**The advice is load-bearing, not decoration.** §J records `NDA_AVAILABLE: NO`,
and a reader on a precision-manufacturing site types part numbers, tolerances
and their own company name into a box like that one. Clause 06 tells them not
to, and points them at the RFQ flow, which stays inside the site's own
infrastructure.

**It is also disclosed in the panel**, above the Evet/Hayır buttons, because a
consent gate that does not say what is being consented to is not consent, and
the reader deciding has not opened the policy. `/cerez-politikasi` madde 03
enumerates third-party requests, so it names the transfer too and defers to
madde 06 for the chain.

**No golden covers the legal routes**, by the deliberate design recorded in
`e2e/visual/wave-b-golden.spec.ts`: *"the legal routes are text that will be
revised by somebody who is not looking at a screenshot suite."* Wave B pins four
crops — 404 body, journal lead, quality documents, profile scope — and none is a
legal page. The chat panel is never opened by any spec; only its launcher is,
and that is hidden by `hideForeignOverlays()`.

---

## 10. Content truth in `blogData.ts`

Six unsourced quantified claims removed. None was about a part MAS made, which
is why they survived Phase 06's sweep — they read as industry background — and
they were still unsourced numbers printed as fact on a manufacturer's own site:

```
"setup süresini %60-80 oranında azaltabilir"
"takım aşınması %30-40 oranında düşer"
"üretim maliyetlerini %20-50 oranında düşürebilir"
"hammadde maliyeti … yaklaşık 5 kat daha düşüktür"
"işleme maliyetleri de alüminyumda %60 daha azdır"
"1000+ saat tuz testi dayanımı sağlar"
```

In each case the **mechanism** is what a reader needs and is what the sentence
carries now — why a second setup costs accuracy, why titanium is slow to cut,
why a coating's salt-spray rating depends on the specification it was applied
to. A mechanism can be checked by a reader who knows the subject; a bare
percentage cannot be checked by anybody.

Three commitments went the same way: "her projede ücretsiz DFM analizi
sunuyoruz" and "Ra 0.4µm altı … kolayca ulaşılır" are promises where §D
authorises capability figures, and "C/Y eksenli CNC torna tezgahlarımızla"
describes an equipment inventory that §0 keeps private.

Figures that stayed are published material properties, a published standard's
own numbers (MIL-A-8625 film thickness, ASTM A967), or come from
`@/content/claims`.

**Two forms were deleted rather than wired up**, both the Phase 07 `/iletisim`
finding (`17` §6.6) — a form that accepts something and discards it:

* the blog **newsletter signup** — an e-mail field and a button with no submit
  handler, no backend, no list and no stated purpose. The field it collects is
  exactly the one a privacy policy has to account for, and §K authorises no such
  provider;
* the article **comment form** — comments kept in `useState`, nothing posted,
  nothing moderated, nothing surviving a refresh.

**Section anchors in `blogData.ts` are `id`, never `slug`.** Two route-inventory
specs extract `slug:` from that file by regex
(`/\bslug\s*:\s*["']([^"']+)["']/g`), and a second `slug:` key anywhere in it
would silently inflate the blog route list they check.

---

## 11. Goldens

### 11.1 Four new baselines, and why only four

`e2e/visual/wave-b-golden.spec.ts` captures four crops at 375 / 768 / 1280 /
1440. Each is the region an acceptance criterion or a content-truth rule
actually turns on — the 404 body, the journal lead band, the quality document
register, and the band that states on the page that the capability profiles are
not customer projects. Whole pages are deliberately not captured: `/sss` renders
~120 `<details>` and grows with `servicePages.ts`, and the legal texts will be
revised by people who are not looking at a screenshot suite. Pinning those would
manufacture the failure mode §12 warns about.

All sixteen were opened and looked at before they were banked.

### 11.2 The skip link was in the first four, and that is a finding

`.shared-skip-link` (`src/App.tsx`) is `position: fixed`, parked at
`-translate-y-24` off the top of the viewport, and carries Tailwind's
`shadow-lg`. It paints nothing on screen. But these crops are **taller than the
viewport**, so Playwright captures them with `captureBeyondViewport`, and in the
expanded viewport the fixed link's shadow lands at the crop's own top-left.

Measured on `waveb-notfound-body` @375 before the fix: a wash from
`rgb(235,232,226)` at row 0 back to the page ground `rgb(251,248,241)` by row
~12, across the leftmost ~110px — a ~2.7 % black shading, invisible at full size
and quietly baked into the baseline. Two controls identified it: hiding
`.shared-skip-link` removes it, and so does `box-shadow: none` on everything;
nothing else fixed in the document paints there. **It appears only on the two
mobile-emulated projects (375, 768) and not at 1280/1440**, which is exactly how
it would have surfaced later as an unexplained two-viewport diff.

The global bar is hidden for the same reason and by the same measurement: the
first `waveb-notfound-body` baseline had `ERR::PAGE_NOT_FOUND` covered by the
fixed header, i.e. a content golden that could not see a change in the content it
exists to watch.

Both are hidden **locally in that spec**. `e2e/visual/overlays.ts` is the right
home for the skip-link rule and is outside Phase 08's write allowlist, so it is
reported rather than reached for.

### 11.3 The 23 that changed, adjudicated per viewport before regeneration

One cause: `resourceLinks` in `ia.ts` gained two entries
(`Kabiliyet Profilleri`, `Kalite Dosyası`), which reaches the footer's KURUMSAL
column and the menu's RESOURCES group.

**Source-level control first.** Between the Phase 07 close (`fb62d9e`) and this
phase, the only change to anything the footer renders from is those two array
entries: `SiteFooter.tsx`, `footer-groups.ts`, `claims.ts`, `Header.tsx`, the
rest of `navigation/`, `technical-landing.css`, `master-grid.css` and
`navigation.css` are byte-identical, and `shell.css` gained no `tl-footer` /
`shell-footer` selector. All 24 `shell-header-*` goldens are unchanged, which is
the same statement made by measurement.

| viewport | changed | measured account |
|---|---|---|
| 375 | 2 of 6 footers | **The two links paint nothing here.** Below 768 the nav columns are replaced by `.shell-footer-disclosure` panels carrying a real `hidden` attribute, so a closed column has zero height — and four of the six 375 footer captures passed byte-compatible. The two that changed are exactly the two routes whose *body* this phase rewrote (`/blog`, the 404): a changed page height moves the footer crop by one pixel. `shell-footer-journal`: identical content at offset (0,−1), residual 4.304 → **1.327** (worst offset 14.648). `shell-footer-notfound`: identical content at (0,0), residual **0.781**, crop 743 → 742. |
| 768 | 6 footers + `navigation-open` | KURUMSAL strip (x 428–520): every band unchanged through y 501; y 514 and y 537 change text (glyph height 8 → 10, the new labels have descenders); **two new bands at y 559 and y 582, pitch 22 + 23 = 45**; everything below shifts exactly 45 (y 664 → 709, y 689 → 734); crop 690 → 735. |
| 1280 | 6 footers + `navigation-open` | KURUMSAL strip (x 1095–1250): bands identical at y 0/19/42/64/87/107; y 132 and y 154 change text; **two new bands at y 177 and y 199, pitch 23 + 22 = 45**; conversion row y 208 → 253 and legal run y 277 → 322, both +45; crop 298 → 343. Above the insertion, 9 145 of 10 375 changed pixels are Δ ≤ 8 (sub-pixel antialiasing from the footer's new height); every Δ ≥ 25 pixel is inside x 1092–1184, y 132–176 — the two rows whose text changed — plus 208 pixels on the four column hairlines, which grow with the tallest column. |
| 1440 | 6 footers + `navigation-open` | Band table identical to 1280 (y 0/19/42/64/89/109/132/154 → + 177/199, 208 → 253, 277 → 322); crop 298 → 343. |

`navigation-open` @1280, same method: every band unchanged through y 641
(including the `KAYNAKLAR` heading and the first resource row); y 673 and y 717
change text (glyph height 10 → 13); **two new rows at y 761 and y 805, pitch 44
each**; the crop is a fixed-size overlay so its height does not change. The
group's `03` → `05` count is the reason the whole-image change box starts at
y 597 rather than y 673 — it is a small low-contrast mono pair, below the
Δ ≥ 121 threshold but inside the box.

`navigation-open` @375 **did not change**, and that is evidence rather than
luck: the directory is below the fold inside the menu's own scroll container, so
it is not in the element crop. Had it been, the capture would have failed like
the other three.
