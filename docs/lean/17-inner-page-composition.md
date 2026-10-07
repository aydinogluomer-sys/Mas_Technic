# 17 — Inner-page composition (Phase 07)

> How the commercial inner pages are built, and which decisions are settled so
> that a later phase does not have to re-argue them.
> Companion docs: `15-page-shell.md` (the frame), `06-design-system.md` (the
> tokens), `16-content-truth.md` (what may be published).

---

## 1. What Phase 07 changed

Phase 04 built the shell **frame** and deliberately left page bodies alone.
Six commercial pages therefore still composed their bodies out of a single
device:

```
grid sm:grid-cols-2  →  border border-border bg-card p-6
                        hover:border-primary hover:-translate-y-1 hover:shadow-lg
```

That one device was doing eight different jobs: services listing, sectors
listing, related-pages rail, material grid, advantages, features, contact
tiles, and the four "Misyon / Yaklaşım / Süreç / Kalite" mission cards. On the
two material pages it was joined by corner radii, pill-shaped labels, emoji
category icons, a `⭐` glyph, colour-only price badges and two full-bleed
`linear-gradient(135deg, primary → --forge-navy)` bands — `--forge-navy` being
the superseded forge palette (run assumption A03).

All of it is gone. The pages now compose from primitives.

---

## 2. The primitive ladder

| Layer | Lives in | Examples |
| --- | --- | --- |
| Frame | `src/components/shell/PageShell.tsx` | sheet, rail, nav, footer |
| Band | `ShellBand`, `ShellSurfaceBand` | numbered horizontal unit, `tone` |
| Atom (Phase 04) | `ShellPrimitives.tsx` | hero, meta row, title block, evidence, divider |
| Molecule (Phase 07) | `ShellComposition.tsx` | breadcrumb, action, index list, spec table, run, tag row, plate, next step |
| Page composition | `src/components/pages/**` | `MaterialRegister`, `material-figures` |
| Page | `src/pages/*.tsx` | copy + arrangement only |

**The rule:** if two pages need the same structure it becomes a molecule. If
one page needs a structure that is genuinely specific to its data, it becomes a
component under `src/components/pages/**` — never a block of bespoke markup
inside the page.

Current molecule usage, which is why each one exists:

```
ShellBreadcrumb   4 pages   ShellSpecTable   3 pages   ShellPlate     1 page
ShellAction       6 pages   ShellRun         3 pages   ShellNextStep  6 pages
ShellIndexList    4 pages   ShellTagRow      3 pages
```

---

## 3. Ground: one switch, not two stylesheets

Composition CSS paints from **semantic roles**, not colours:

```
--sf-ink  --sf-body  --sf-meta  --sf-faint
--sf-rule --sf-rule-soft --sf-accent
--sf-raise --sf-hover --sf-field --sf-ground
--sf-invert --sf-on-invert
```

The roles are re-bound once per ground:

* `.shell-root` → graphite (the landing's field)
* `.shell-root[data-shell-surface="paper"]` → paper page
* `.shell-root .tl-band[data-band-tone="paper"]` → **a paper band inside a
  graphite page**

The third case is the reason for the change. The Phase 04 form was
`.shell-root[data-shell-surface="paper"] .x { … }`, a descendant selector that
can never match a paper band inside a graphite root — and graphite field with
paper evidence bands is exactly the alternation the landing is built on. Five
compatibility lines finish the job for the Phase 04 atoms, which still key
their ground off the root.

**Surface choice for the six pages: `graphite`.** They open on the landing's
own field, and evidence bands (`tone="paper"`) carry specification tables,
alloy registers and the FAQ. `PageShell`'s default stays `paper` for the pages
Phase 08 owns; those bodies are still written against the light theme.

---

## 4. Radius

`--tl-radius: 0`. The six rebuilt pages' **own stylesheets** declare no radius
exception, and `shell.css` declares none.

That is not the same as "nothing on those routes paints a radius", which is
what this section used to say, and it was false of what renders.

**This register is the fourth version of itself, and the first one that is not
typed.** v1 said nothing paints a radius. v2 said three things do — the list a
reader gets by opening the two components the writer already knew about. v3
said six, and six is right, but it ran the census at 375 and 1280 only and
explained its two cursor rows with a threshold that does not exist. Three
different wrong tables, one shared cause: somebody wrote down what they
believed. So this table is no longer written. `e2e/visual/radius-census.spec.ts`
runs the census and fails if any cell below disagrees with the browser, and it
checks the source column too — a citation that has drifted off its declaration
is what made v2 look checkable.

**The census.** One route per rebuilt page component, which is what "the six
rebuilt routes" has always meant and was never written down:

```
/hakkimizda                          Hakkimizda
/iletisim                            Iletisim
/malzemeler                          Malzemeler
/malzemeler/aluminyum                MalzemeKategori
/hizmetler/kategori/talasli-imalat   CategoryPage
/hizmetler/cnc-frezeleme             ServiceDetail
```

at **375, 768 and 1280**, `reducedMotion: "reduce"`, **with a fine pointer at
every width**, after a full scroll pass. Every element is grouped by tag plus
full class list; anything with a non-zero computed `border-radius` on any
corner is kept unless it is `display:none`, `visibility:hidden`, `opacity:0` or
a zero box. Counts are instances summed over the six routes; `–` means the
element does not paint at that width at all. Source lines are attached
afterwards, by looking up what the measurement had already found.

**Five sources, two components** (polish run, 2026-09-28 — the PAGES changed,
not the register: the chat launcher lost its `rounded-full` and is now a square
graphite stamp, so its row is gone; the inner-band gutter narrowed the 375 step
meter from 21 to 17 px wide, re-measured by `e2e/visual/radius-census.spec.ts`).

**Three sources, one component** (round 2, 2026-09-30 — the PAGES changed, not
the register: the cursor layers now live in `<body>` and stay parked at
`opacity: 0` until the first `pointermove` arms them, which fixed the cursor
vanishing over the header and the menu. The census never moves the pointer, so
an unarmed cursor paints nothing and both cursor rows are gone. Their radius is
still `borderRadius: "50%"` inline in `CustomCursor.tsx`; it is simply not
painted by an unmoved pointer any more.) Not one of them belongs to a page file:

| element | 375 | 768 | 1280 | radius | box | source |
|---|---|---|---|---|---|---|
<!-- register: empty -->

**Faz 1a (7 Ekim 2026): the register is empty.** `MaterialMorphScroll.tsx` was
deleted (M01 had already taken it off `/malzemeler`), and its three rows left
the table: `step meter` (375: 17×6, `:228`), `property-meter track` (768/1280:
238×4, `:357`) and `property-meter fill` (768/1280: 143/190/238×4, `:359`), all
`9999px`. The census now expects no radius source at all; the marker above says
the table is empty on purpose, so an accidentally truncated table still fails.

The three meters are `/malzemeler` only, and they are two different meters
rather than one that resizes: the step meter is the narrow layout and the
property meters are the wide one, and the switch is between 375 and 768. Both cursor layers
mount on all six routes at 768 and at 1280 (none at 375), but since round 2
they paint only after the pointer has moved.

**768 was missing from v3, and its absence was not neutral — it moved four of
the six rows.** The property meters were recorded as 1280-only when they have
been painting since 768, and the cursor rows were recorded as 1280-only because
the register believed `CustomCursor` does not mount below 901 px.

It does. `901` is the breakpoint of the `cursor: none` rule in `src/index.css`,
which is also quoted in a docblock inside `CustomCursor.tsx` — and a comment
describing a stylesheet was read as the component's own mount condition. The
component's floor is `MOBILE_BREAKPOINT`, **768**, in `src/hooks/use-mobile.tsx`;
above it the only other condition is `(pointer: fine)`. Measured: 767 px with a
fine pointer paints no layers, 768 px paints both, and the two thresholds are
133 px apart — between them a visitor is drawn two pointers, the replacement
and the native one the stylesheet has not taken away yet. The full matrix is
asserted, not described, in `e2e/visual/cursor-overlay-guard.spec.ts`.

That is also why **a census run only at 375 finds two sources** — the step
meter and the launcher — and thinks it is finished. Two, not four: the property
meters are absent at 375 as well.

**The two cursor layers are the ones v2 missed, and the reason it missed them
is worth keeping.** Their radius is `borderRadius: "50%"` as an **inline
style**, so no stylesheet audit and no `rounded-` class grep can see them; and
until round 2 they were at `opacity: 1` from mount, merely parked at (-3,-3)
and (-22,-22), so "the cursor has not moved yet" did not mean "the cursor has
not painted yet". Since round 2 it does: the layers carry `data-armed="false"`
at `opacity: 0` until the first `pointermove`.
`e2e/visual/overlays.ts` gave that as its reason for excluding them, and has
been corrected twice since.

None of the six is a card, and none is the "generic rounded-card aesthetic"
§5.5 forbids: three are 4–6 px hairline meters where the radius is the cap of a
stroke rather than the frame of a surface, one is a fixed launcher owned by
Phases 09/13, and two are a 6 px dot and a 1 px ring that ARE the pointer. All
six **declarations** are unchanged since the Phase 06 close. Only one of the
three FILES still is: `CustomCursor.tsx` is `98e64ab`, byte-identical to the
Phase 06 close. `ChatBot.tsx` is not — it was `7a5daf0` then and hashes
`44d9baf` now, because Phase 08 edited the component above the launcher and
pushed the launcher's `rounded-full` from line 225 to line **294**. The
declaration is character-for-character the same one; only its address moved.
`MaterialMorphScroll.tsx` changed in Phase 07 but in none of its three lines.
So every version of this register has been the register being wrong, never the
pages — and a file hash is evidence about a FILE, which is why the sentence
that used it to vouch for a DECLARATION had to be split in two. (Round 2 edited `CustomCursor.tsx` — portal, arming — and moved the two
declarations to lines 212-225 and 228-241; they are no longer in the table
because they no longer paint for an unmoved pointer.)

**Excluded, as a decision rather than a miss:** two further radius sites exist
in the same components but paint in states this census does not enter — the
`w-10 h-10 rounded-full` loading spinner at `MaterialMorphScroll.tsx:278`, and
the avatar/chip radii inside the chat panel (`ChatBot.tsx:383, 395, 407, 433,
466, 472` — six declarations, not the one range the earlier text implied), which
require the panel to be open. Neither is reachable at rest on any of the six
routes; if a future phase makes either reachable at rest, it belongs in the
table.

If a future page needs a radius, the exception is written next to the
declaration with its reason, and it is listed here — and so is anything a
mounted component paints, at every width where it mounts. The way to add a row
is to re-run the census, not to read a file. The census is now a test, so it
re-runs itself; what a person still has to decide is whether a moved cell means
the pages changed or the register rotted, and to say which.

---

## 5. Grid discipline

`.shell-run`, `.shell-doc`, `.shell-doc-main` and `.shell-doc-aside` are real
`subgrid`s, so every interior boundary is a master boundary at every
breakpoint:

| Element | 12 cols | 6 cols | 4 cols |
| --- | --- | --- | --- |
| `.shell-run > li` | span 4 (3/row) | span 3 (2/row) | full |
| `.shell-doc-main` | 1 / span 8 | full | full |
| `.shell-doc-aside` | 9 / -1 | full | full |
| `.shell-span-read` | 1 / span 7 | full | full |
| `.shell-span-note` | 9 / -1 | full | full |

Subgrid contract from `master-grid.css`: a subgridded element carries no
horizontal padding, border or margin. Breathing room lives on children.

**Two layout facts that are easy to get wrong and expensive to rediscover:**

1. `position: sticky` resolves against the element's *containing block*, and a
   grid item's containing block is its grid area. A sticky bar placed as a grid
   child of a band therefore never travels — its area is one row tall. The
   materials filter bar and its register share one **block** container
   (`.shell-register-scope`), which is the shape `e2e/malzemeler-sticky.spec.ts`
   measures.
2. The same fact makes `.shell-doc-aside[data-sticky]` work: the aside shares
   the main column's row, so its grid area *is* as tall as the document beside
   it. `align-self: start` shrinks the item to its content and leaves the rest
   of the area to scroll through. Below 1180px the aside is in its own row and
   the rule is switched back to `static`.

---

## 6. Decisions recorded, with their reasons

### 6.1 No company-history timeline on `/hakkimizda`

The phase permits a dossier/timeline narrative. `USER_INPUTS.md` supplies no
founding year, no milestone, no relocation, no first-customer date — there is
no history field in it at all. A timeline is a sequence of *dated assertions*,
so building one would mean inventing every entry (`IMPLEMENTATION.md` §13).
The dossier is built from what is verified — scope, process, documents — and
carries no dates.

### 6.2 Services listing and sectors listing are `CategoryPage`

There is no `/hizmetler` or `/endustriyel` index route and Phase 07 does not
create one: `src/components/navigation/ia.ts` is Phase 03's public IA and
`e2e/landing/navigation-reachability.spec.ts` proves route coverage against it.
`CategoryPage` serves all three families and is the listing surface.

### 6.3 An index, not a card grid

A grid of equal cards cannot tell a reader what distinguishes its entries:
every card is the same size, so the only information the layout carries is
"there are four of them". A register row carries the entry's *own* measured
facts, read from that entry's `technicalSpecs`, so two services can be compared
without opening both pages.

### 6.4 No published material count

`MATERIAL_COUNT` is `UNKNOWN_REMOVE_IF_UNVERIFIED` **and**
`PRIVATE_DO_NOT_DISCLOSE` in §D. The library total appeared in the hero
(`{materialsData.length}+ malzeme`), under every category tile, in every
heading and — implicitly — in the pagination control. A count now appears in
exactly one place: as the answer to a search the reader typed, which is a
response to a query rather than a statement about the company.

### 6.5 Derived ranges are the strongest evidence available here

`familyRanges()` computes a material family's density / tensile / temperature /
machinability envelope from the alloys the same page lists. The page therefore
cannot state a figure it does not also show. Prefer this shape wherever the
data allows it.

### 6.6 Two removals on `/iletisim`

* The quick-message form called `toast.success("Mesajınız başarıyla
  gönderildi!")` and made **no network call**. It told the reader their message
  was sent and discarded it. A form that lies about delivery is worse than no
  form; the page has two paths that genuinely deliver.
* "30 dakikalık ücretsiz ilk görüşme" and "Toplantı sonrası detaylı teklif
  raporu" are commitments, and §D authorises capability figures, not
  commitments. Published working hours went the same way — no field authorises
  them, and the booking form's own slot list is the operative information.

### 6.7 Native `<details>` for the FAQ, not the shadcn accordion

It works before hydration and with JavaScript unavailable; its open state is
the element's own, so there is no `aria-expanded` to keep in sync; and the
accordion's styling is written against the shadcn light theme, which is the
palette this phase removes from these routes.

### 6.8 The autoplaying hero video is gone

`/machine-loop.mp4` looped behind the service-detail hero with no pause
control. Looping motion longer than five seconds with no mechanism to stop it
is WCAG 2.2.2, and `prefers-reduced-motion` cannot reach an autoplaying
`<video>` from CSS.

### 6.9 Text over the 80-frame canvas gets a scrim, not a bigger font

`MaterialMorphScroll` is the one component on `/malzemeler` whose ground is a
photograph that changes under the text. Measured from rendered pixels — the
background sampled with every text colour forced transparent, over each run's
own `Range` line boxes, the foreground composited *per pixel* through the
ancestor opacity chain, and the result reported as the **median** over the
sampled pixels because a single modal colour is meaningless against a
photograph — every run in it failed:

| run | viewport | need | before | after |
|---|---|---|---|---|
| `Malzeme Dönüşümü` 12px, `--primary` teal | 375 | 4.5 | **1.745** | pass |
| 4 × 10px property labels, `--text-technical` | 375 | 4.5 | 3.769–4.053 | pass |
| `Yüzey Mükemmelliği` 60px/700 | 1280 | 3 | **2.108** | pass |
| `Malzeme Dönüşümü` 12px, `--primary` teal | 1280 | 4.5 | **2.363** | pass |

**At-rest failures on `/malzemeler`: 5 → 0 at 375, 2 → 0 at 1280.** Same
instrument, same controls, both builds; the only difference is this component.

A run is counted only when its ancestor **opacity chain is ≥ 0.95**. The card
is scroll-faded (`cardOpacity`, `titleOpacity`), and a run caught at chain 0.66
on its way in is a transition frame, not something a reader is reading — the
same distinction the motion audit's rest matrix draws. Those are reported
separately (9 before, 7 after at 1280) and are not counted either way, so the
gate cannot be passed by fading something out.

Three causes and three repairs, recorded because the obvious fix — larger type
— would have fixed none of them:

1. **A dark accent on a dark ground.** The eyebrow was `--primary`
   (rgb 10,125,138). No size passes there. It is `--text-primary` now, which
   also removes the last low-contrast teal on this route.
2. **No scrim.** A 0.25 vignette cannot bound a background that runs from dark
   oxide to bright polished metal across 80 frames. Both the desktop title
   overlay and the mobile fallback now sit on a gradient scrim, so the ground
   under the two largest runs is bounded whatever the frame.
3. **The card was glass.** `rgba(0,0,0,.8)` + `backdrop-blur-md` over
   blown-out metal measured **rgb(88,89,88)** — nowhere near the near-black the
   0.8 alpha implies, which is exactly why "the alpha says it is dark" is not a
   contrast argument. It is a solid `--bg-dark-obsidian` now and the
   backdrop-filter went with it; §5.5 names blur-behind glass as generic-SaaS
   residue and Phase 04 had already removed it from the footer.

**An instrument correction worth keeping.** A first version of this measurement
reported `.shell-row-toggle` ("Ayrıntı") at **1.442:1**, apparently light grey
on paper. It is not a defect: the button's own box measures **1684 of 1763
pixels at `rgb(7,11,13)`** — the graphite sheet — and its `--sf-body` resolves
to `#c1c5c2`, which is a high-contrast pair. Two things produced the false
reading, and both are general traps: the page scrolls through **Lenis**, so a
naive `window.scrollTo` + fixed wait collects line-box rects at one offset and
screenshots at another; and the **chat launcher covers 91 % of that button's
line box** at 1280, so the few unobstructed pixels are not representative of
anything. The instrument now polls to a stable scroll offset, re-verifies it
did not move across the capture, and counts launcher-covered pixels as an
*obstruction* rather than a contrast sample. With the hit-test guard in place
the `.shell-row-toggle` reading disappears from **both** builds, which is the
control that says the guard removed an artefact rather than a defect.

---

## 7. `ShellPlate` and the I4 rule

**Rule: nothing that carries text may be positioned inside an image frame.**

The service-detail hero was `h-[320px] overflow-hidden` with an
`absolute bottom-0` child holding the breadcrumb, the eyebrow, the `<h1>` and
four spec chips. At 375 that child measured 424px, so its top ~104px — the
eyebrow and the entire page title — were cut off by the frame; and because the
block never intersected the viewport, its `whileInView` never fired either, so
it also sat at `opacity: 0`. The transparency was a *symptom*; the layout was
the defect.

`ShellPlate`'s frame contains only the image and four corner ticks. The plate
number and caption are in a `<figcaption>` **below** the frame. No caption
length at any viewport can be clipped by a frame that contains no caption.

Two further consequences worth keeping:

* The `<h1>` carries **no reveal at all**. A page title must not depend on an
  IntersectionObserver. `e2e/landing/motion-grammar.spec.ts` asserts the
  heading's opacity is monotonic non-decreasing across scroll; a constant `1`
  satisfies that by construction rather than by timing.
* Parallax overscan is symmetric and in pixels (60px each way in
  `shell.css`), which is what makes a ±60px translate cover the frame at *both*
  ends of the travel. The old hero translated a `h-full` image 0→120px inside
  `overflow:hidden` and simply exposed the box at the bottom of the range.
  Under `prefers-reduced-motion` the range collapses to `[0, 0]`: a
  scroll-linked transform is motion whatever drives it.

---

## 8. Goldens

`e2e/visual/inner-pages-golden.spec.ts` captures two elements per route — the
opening band and, where the acceptance criterion names it, the closing RFQ band
— across `visual-375 / 768 / 1280 / 1440`.

768 was added to `playwright.config.ts` in this phase. The matrix was
`[375, 1280, 1440]`, i.e. there was **no tablet width in it**, so the
"desktop/tablet/mobile golden snapshots exist" criterion could not be met by
any spec. 768 now matches the `tablet-768` regression project exactly
(768×1024, touch) so the two lanes describe the same device.

### 8.2 The chat launcher is not page content, and is hidden before capture

The launcher (`ChatBot.tsx`) is `position: fixed`, mounts on every public route
except `/`, and sits bottom-right — inside the footer crop at every width and
inside the hero and next-step crops at 375. Scanning all 100 committed goldens
for its teal (`rgb(10,125,138) ±10`) found it baked into **25**, ten of them
banked by this phase.

Nothing is wrong with how it looks. The problem is ownership: Phases 09 and 13
own its visual language, and the day they touch it those goldens go red
together. The reflex to a mass red is `--update-snapshots`, which
`IMPLEMENTATION.md` §12 forbids by name. A baseline of a page's content should
fail when that page's content changes and for no other reason.

`e2e/visual/overlays.ts` hides it with `display: none` before the first
capture. **Hidden, not masked**, and the difference is load-bearing:
Playwright's `mask` paints an opaque box, which would also blind the baseline
to whatever the launcher sits on — permanently, in the exact region where
content is most likely to be covered by accident. At 375 the launcher
completely covers five `<td>` glyph line boxes on `/malzemeler`, so that region
is precisely the one worth keeping under test. `display: none` on a fixed
element removes it from the paint without moving anything, and the content
underneath is compared for the first time. **No `maxDiffPixels` changed
anywhere.**

**What the regeneration was adjudicated on, per viewport, before it happened.**
23 goldens changed. Decoding every `-expected` / `-actual` pair and locating the
launcher as the connected region that changed by more than 40/255 in a channel:

| viewport | disc measured | predicted from CSS | strays | brighter / darker | max Δ |
|---|---|---|---|---|---|
| 375 | 48×48 at x 311–358 | `h-12 w-12`, `right:1rem` → 375−16−48 = **311** | 188–288 | all / **0** | 1–4 |
| 768 | 56×56 at x 695–750 | `md:h-14 md:w-14` → 766−16−56 = **694** | 406 | all / **0** | 4 |
| 1280 | 56×56 at x 1207–1262 | 1278−16−56 = **1206** | 222 | all / **0** | 2 |
| 1440 | 56×56 at x 1367–1422 | 1438−16−56 = **1366** | 222 | all / **0** | 2 |

The disc lands within a pixel of its CSS geometry at all four widths. The
strays are a halo ±5–7 px around it reaching ~14–20 px below — the footprint of
`shadow-lg` (`0 10px 15px -3px`, `0 4px 6px -4px`). Three falsifiable
predictions were checked rather than asserted: every stray pixel gets
**brighter** (removing a translucent black shadow can only brighten — 1,250
strays, **zero** darker, at every viewport), every stray hugs the disc, and the
largest change anywhere outside the disc is **4/255**.

So every changed pixel in all 23 goldens is the launcher or its shadow, and no
content pixel moved. The justification was checked **at each width separately**,
because the Phase 04 precedent is a justification true at 1280/1440 and false at
375 that silently pinned a regression.

`inner-hero-material-family` @375 is the odd one out and is called out rather
than averaged in: its crop clips the launcher 11 px down, so the disc is a
40×11 sliver — 336 changed pixels, 2 strays, max Δ 1.

**Two more goldens changed than the first run reported, and they were
adjudicated separately.** `inner-next-sector-detail` and
`inner-next-service-detail` at 375 never appeared in the first run's failures
because `toHaveScreenshot` stops a test at its first failing assertion, and the
hero capture on those routes fails earlier — so the next-step capture was never
reached. Total: **25**, which is exactly the number the launcher was found in.
Both are the launcher's clipped top arc: a 34×8 sliver at x 318–351 in a
375×549 crop, 216 changed pixels each, of which 214 are the sliver and 2 are its
antialiased rim one pixel either side of the widest row. Those two get *darker*
(max Δ 30) rather than brighter, which is the opposite of the shadow strays and
is correct — a rim pixel loses a teal blend to a graphite ground, while a shadow
pixel loses a black wash. Direction follows the ground, and both directions are
accounted for.

**No golden moved because of A1 or A7.** This suite ran on the post-A1 /
post-A7 build, so a `MaterialMorphScroll` change would have surfaced as a
content-region diff. `/malzemeler`'s only golden is its hero crop; the
morph-scroll band is further down the page and no golden crops it. Measured,
not inferred from golden names.

Full-page captures are deliberately avoided on these routes: `/malzemeler`
mounts a 300vh scroll-driven canvas backed by an 80-frame image sequence, and a
golden that fails on every copy edit teaches people to run
`--update-snapshots` without looking — which `IMPLEMENTATION.md` §12 forbids by
name.

### 8.1 The golden suite depended on a third-party font host

Worth knowing before anyone debugs a "random" golden failure again.

Five consecutive runs of the visual suite on an unchanged build each failed one
or two captures, a different one every time. The two 375 failures were
byte-for-byte the same delta (1453 px, rows 19–43, best offset (0,0), residual
flat at every offset), and the body-copy diffs showed text doubled with a
displacement that *grows* along the line, with lines breaking at different
words. That is a typeface substitution, not a layout change.

`index.html` loads all three families from `fonts.googleapis.com`. When that
request is slow or fails, the capture is of the fallback stack.

Two traps, both now written into `e2e/visual/fonts.ts`:

* `document.fonts.ready` cannot detect it. `ready` resolves when no font load
  is *pending*, and a face that failed — or that was never declared because the
  stylesheet never arrived — is not pending. Both `settleRendering` and
  `freezeVisualState` await `ready`, which is why the race survived them.
* `document.fonts.check()` cannot detect it either. Per spec it answers "can
  this font *list* render the text without further downloads", and a system
  fallback can, so it returns `true` on a machine that has never heard of Space
  Grotesk. The sound test is to enumerate the `FontFaceSet` and require a
  `FontFace` whose family matches and whose `status` is `"loaded"`.

The visual specs now retry the font hosts and then prove the families loaded,
failing with that reason if they did not. No tolerance was loosened; a raised
`maxDiffPixels` would have made a typeface substitution invisible, which is the
opposite of what a golden is for.

**Correction — the retry did not run.** The first version of this section
described the fix as two parts and credited the suite's 56 min → under 4 min
drop to the first of them. That part registered
`page.route("https://fonts.g*", …)`, and Playwright's glob `*` does not cross a
`/`, so the pattern matched only a URL with no path at all. Measured over a
load issuing 17 font requests:

| pattern | intercepted |
|---|---|
| `https://fonts.g*` | 0 / 17 |
| `https://fonts.g**` | 0 / 17 |
| `**fonts.googleapis.com**` | 1 / 17 |
| `https://fonts.googleapis.com/**` | 1 / 17 |

One of seventeen, because only the *stylesheet* is on `fonts.googleapis.com`;
the sixteen face files are on `fonts.gstatic.com`, which nothing was watching.

So the run-time improvement belongs entirely to `awaitRealFaces()`, which fails
a run that could not get the fonts instead of banking a fallback render. The
retry is now registered per host — `https://fonts.googleapis.com/**` and
`https://fonts.gstatic.com/**` — and **counts what it intercepts**;
`awaitRealFaces()` fails if either count is zero. A silent no-op is what went
wrong here, so the repair is not a better glob, it is a glob that cannot fail
quietly.
