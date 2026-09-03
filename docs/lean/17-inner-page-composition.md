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

`--tl-radius: 0`. The six rebuilt pages carry **no radius exception at all**,
so there is nothing to document as one. `--tl-radius-round: 50%` remains
available only for elements that *are* a circle by drawing convention (a seal,
a grade badge, an avatar disc); none of the six uses it.

If a future page needs a radius, the exception is written next to the
declaration with its reason, and it is listed here.

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

Full-page captures are deliberately avoided on these routes: `/malzemeler`
mounts a 300vh scroll-driven canvas backed by an 80-frame image sequence, and a
golden that fails on every copy edit teaches people to run
`--update-snapshots` without looking — which `IMPLEMENTATION.md` §12 forbids by
name.
