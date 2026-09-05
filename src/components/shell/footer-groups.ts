import { companyLinks, navigationItems, resourceLinks } from "@/components/navigation/ia";

/* ══════════════════════════════════════════════════════════════════════════
   THE FOOTER'S FOUR COLUMNS — DERIVED, NEVER HAND-MAINTAINED

   Before Phase 04 the site shipped THREE footers with THREE link sets:

     `src/components/Footer.tsx`  + `footer/footerLinks.ts`  (15 inner pages)
     `DrawingFooter` in `technical-landing/FinalSections.tsx`
       reading `technicalLandingData.footerColumns`          (`/` only)
     …and `/teklif-al`, which imported `Footer` and never rendered it, so the
       primary conversion page had no footer at all
       (`src/pages/TeklifAl.tsx:54`, `reports/baseline/shell-inventory.md` §4).

   There is one footer now, and its navigation is computed from
   `src/components/navigation/ia.ts` — the same file the header, the fullscreen
   menu and the reachability gate read. A renamed slug can no longer be right
   in the menu and wrong in the footer, which is exactly the drift that left
   `/endustriyel/kategori/seri-uretim` and two non-existent landing anchors in
   the old footer.

   WHY FOUR COLUMNS AND NOT FIVE
   -----------------------------
   `.tl-footer nav` occupies master columns 5–12 and each column spans two of
   them (`src/styles/technical-landing.css`). Four columns is the master grid's
   answer, not a layout preference; a fifth would put every interior boundary
   off-axis and `scripts/grid-axis-probe.mjs` would fail.

   LINK PARITY — WHAT HAPPENED TO THE LANDING FOOTER'S OWN ENTRIES
   ---------------------------------------------------------------
   `footerColumns` hand-picked four DETAIL pages (`/hizmetler/cnc-frezeleme`,
   `/kabiliyetler/tolerans-hassasiyet`, `/kabiliyetler/yuzey-islemleri-
   muhendislik`, `/kabiliyetler/kalite-kontrol`) and two landing anchors
   (`#kalite`, `#surec`). No destination lost its way into the site:

     · all four detail pages are published in the global menu, under the
       category page that is now in the footer one line above them;
     · both anchors are landing SECTIONS and are published in the menu's
       section rail (`landingSections` in `ia.ts`);
     · `/teklif-al` and `/iletisim` are the footer's conversion row;
     · the legal three are the title block's legal run.

   The footer stops publishing an arbitrary subset of detail pages and starts
   publishing the complete category-level map instead.

   PHASE 08 — WHY THE FOURTH COLUMN NO LONGER TAKES EVERY RESOURCE LINK
   --------------------------------------------------------------------
   Phase 08 published two reference surfaces and registered them in
   `resourceLinks` (`ia.ts`): `/kabiliyet-profilleri` and `/kalite-dosyasi`.
   This file used to pour ALL of `resourceLinks` into KURUMSAL, so that column
   went from 6 rows to 8, and `e2e/technical-landing.spec.ts`'s
   `bantOrani < 0.26` went red at 1280.

   MEASURED — production preview, `/`, `.tl-footer` bounding box. EVERY FIGURE
   IN THIS BLOCK IS A 1280 FIGURE; the paragraph after it says what happens
   elsewhere, because an earlier version of this comment did not and was wrong
   in two places.

     row pitch                 22.50 px   delta between the tops of two
                                          consecutive links; identical in all
                                          four columns at 768 / 1024 / 1280 /
                                          1440. Measured, not a height divided
                                          by a row count.
     band, tallest column 8      342 px   ratio 0.2672 at 1280   RED
     band, tallest column 7    319.50 px  ratio 0.2496 at 1280
     band, tallest column 6      297 px   ratio 0.2320 at 1280   ← ships
     gate ceiling             332.80 px   0.26 x 1280

   ROW COUNTS THAT SHIP (links per column, excluding the `<h3>` title):

     HİZMETLER      5   the five `Hizmetler` categories
     KABİLİYETLER   6   the five `Kabiliyetler` categories + the reference
                        index that carries the family's own name
     ENDÜSTRİYEL    5   the five `Endüstriyel` categories
     KURUMSAL       6   the two company links + the four remaining reference
                        surfaces

   HEADROOM: ONE ROW AT 1280. A seventh row in any column measures 319.50 px /
   0.2496 and still passes. An EIGHTH measures 342 px / 0.2672 and fails the
   gate. If you are here to add a footer link, you get one — and the one after
   it turns `critical-1280` red.

   THE "ONE GRID ROW, TALLEST COLUMN WINS" MODEL IS TRUE ONLY AT >= 1181,
   AND THE PITCH IS NOT MEASURABLE AT 375. Both corrections come out of round
   2; the second was reported against this file and the first was reported with
   the wrong boundary, so here is the measurement:

     375    `.tl-footer nav` computes `display: none` (`shell.css:747`). All
            22 links have a 0x0 rect and every delta is 0. What paints is
            `.shell-footer-disclosures`, an accordion whose panels start
            CLOSED — so in the default state there is no link pitch at all,
            and opened the deltas are 40 px inside a panel and 105 px across a
            panel boundary. 22.50 px is not measurable at this width.
     768    `grid-template-rows: 150px 150px` — a 2x2, columns at x = 57 and
     1024   x = 412 (768), two distinct row origins. Band height is
     1180   tallest(row 1) + tallest(row 2), so it is 12 rows here against 6
            at 1280, which is exactly why the 768 goldens moved by one pitch
            when 1280/1440 moved by two.
     1181   `grid-template-rows: 150px` — the single row this file's
     1440   arithmetic assumes. Band 297 px; ratio 0.2515 at 1181, 0.2320 at
            1280, 0.2063 at 1440.

   The switch is not a footer rule: `--tl-cols` drops 12 -> 6 at
   `@media (max-width: 1180px)` (`design-tokens.css:160`) and the nav is a
   subgrid of the master tracks. Round 2 put this boundary at 1024; measured,
   1024 is `150px 150px`, identical to 768. It is 1181.

   WHAT MOVED, AND WHY IT IS THE FOOTER'S DECISION AND NOT THE IA'S
   ----------------------------------------------------------------
   `ia.ts` is untouched. `resourceLinks` is also read by
   `NavDirectory.tsx:47-53`, which prints `resourceLinks.length` as the
   fullscreen menu's zero-padded KAYNAKLAR index, and by `NotFound.tsx:150,164`,
   whose directory is `navigationItems.length + resourceLinks.length` entries.
   Dropping an entry there to save a footer row would silently edit the menu
   and the 404. So what changed is how these four columns COMPOSE the IA, not
   what the IA publishes. Every entry of `resourceLinks` still appears in the
   footer exactly once: KURUMSAL takes the complement of whatever a family
   column adopts, so a link cannot be lost by editing the map below — and
   after the round-2 correction it cannot be lost by following a family rename
   through that map either, which is the edit that could once have zeroed one.
   See `FAMILY_RESOURCES`.

     · `/kabiliyet-profilleri` -> KABİLİYETLER. It is the index over
       `src/content/caseStudies.ts` and carries the family's own name — the
       same name landing band 07 carries. A reference surface filed under the
       family column it continues reads as that family's evidence; filed under
       KURUMSAL it read as company boilerplate, which it is not.
     · `/kalite-dosyasi` STAYS in KURUMSAL, with the other reference surfaces.
       It is not a machining service and does not belong in a column of
       `Hizmetler` categories.
     · `Ana Sayfa` LEAVES the footer column. It was the third home affordance
       on every page — the fixed header's brand link (`Header.tsx:489`) and the
       fullscreen menu's (`Header.tsx:552`) are the other two, both present at
       every width. The menu's own KURUMSAL column (`NavDirectory.tsx:68`) has
       never listed it: it renders `companyLinks` and nothing else, so the
       footer is now the same statement the menu already makes. `homeLink`
       stays in `ia.ts` and in `navigationTargets()`, so reachability is
       unchanged, and `/404`'s own recovery action (`NotFound.tsx:238`) is
       where `e2e/landing/dev-routes.spec.ts` reads a home link.
   ══════════════════════════════════════════════════════════════════════════ */

export type FooterLinkGroup = {
  title: string;
  items: { label: string; href: string }[];
};

/** The three family columns, in the order they are published. */
const FAMILY_COLUMNS = ["Hizmetler", "Kabiliyetler", "Endüstriyel"] as const;

/**
 * Reference surfaces published under the family column they continue.
 *
 * KEYED BY ROUTE — the key is the path, the value is the `navigationItems`
 * label of the family that adopts it. It used to be the other way round while
 * this comment already claimed route keying, and the mismatch was not merely a
 * comment defect. With the LABEL as the key, the adopting side read
 * `FAMILY_RESOURCES[label]` while the excluding side read
 * `Object.values(FAMILY_RESOURCES).flat()` — one saw the key, the other could
 * not — so a key that stopped matching removed the link from its family AND
 * kept it out of KURUMSAL, and it appeared ZERO times.
 *
 * ROUND 2 NAMED THE WRONG TRIGGER AND I HAVE TO CORRECT IT, because the wrong
 * trigger makes this look harmless. It reported "rename `Kabiliyetler` in
 * `ia.ts` and the link appears zero times". Run it: the link still appears
 * exactly once. `footerGroups` passed `family("Kabiliyetler")` as a STRING
 * LITERAL of this file's own, so the map was looked up with THIS file's
 * spelling and an `ia.ts` rename never reached it — all it did was empty the
 * column of its five categories. What actually zeroed the link was the NEXT
 * edit: updating this map's key to follow that rename, which is exactly what a
 * careful person does while chasing a rename through the codebase. Measured,
 * old code against new, over the three cases:
 *
 *   scenario                            OLD                NEW
 *   today                               1x KABİLİYETLER    1x KABİLİYETLER
 *   ia.ts renamed, map untouched        1x KABİLİYETLER    1x KURUMSAL
 *   ia.ts renamed, map follows it       0x NOWHERE         1x KURUMSAL
 *
 * A route key cannot go stale that way: `adoptingColumn()` returns a family
 * only if that family is a column this file actually publishes AND `ia.ts`
 * still carries the label, so an unmatched entry falls through to KURUMSAL,
 * which takes the complement — and it lands in a column that still renders,
 * which the old code could not manage even when it kept the count right. The
 * invariant is that every `resourceLinks` entry appears in the footer EXACTLY
 * ONCE under every rename, and both sides of the split are now decided by the
 * same function rather than by two expressions that could disagree.
 */
const FAMILY_RESOURCES: Record<string, string> = {
  "/kabiliyet-profilleri": "Kabiliyetler",
};

/**
 * The family column that adopts `path`, or `undefined` if none does — because
 * the path is not mapped, because the mapped family is not one of this file's
 * columns, or because `ia.ts` no longer publishes that label.
 */
const adoptingColumn = (path: string): string | undefined => {
  const label = FAMILY_RESOURCES[path];
  if (label === undefined) return undefined;
  if (!FAMILY_COLUMNS.some((column) => column === label)) return undefined;
  return navigationItems.some((item) => item.label === label) ? label : undefined;
};

/** The paths a family column really takes. KURUMSAL takes everything else. */
const ADOPTED_BY_FAMILY = new Set(
  resourceLinks.filter((link) => adoptingColumn(link.path) !== undefined).map((link) => link.path),
);

const asItems = (links: readonly { label: string; path: string }[]) =>
  links.map((link) => ({ label: link.label, href: link.path }));

const family = (label: string): FooterLinkGroup => {
  const group = navigationItems.find((item) => item.label === label);
  return {
    title: label.toLocaleUpperCase("tr-TR"),
    items: [
      ...(group?.children ?? []).map((category) => ({ label: category.label, href: category.path })),
      ...asItems(resourceLinks.filter((link) => adoptingColumn(link.path) === label)),
    ],
  };
};

export const footerGroups: FooterLinkGroup[] = [
  ...FAMILY_COLUMNS.map(family),
  {
    title: "KURUMSAL",
    items: [
      ...asItems(companyLinks),
      ...asItems(resourceLinks.filter((link) => !ADOPTED_BY_FAMILY.has(link.path))),
    ],
  },
];
