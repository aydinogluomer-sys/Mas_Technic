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
   went from 6 rows to 8. `.tl-footer nav` is ONE grid row and every column
   stretches to the tallest, so the whole band grew with it and
   `e2e/technical-landing.spec.ts`'s `bantOrani < 0.26` went red at 1280.

   MEASURED — production preview, `/`, `.tl-footer` bounding box:

     row pitch                 22.50 px   delta between the tops of two
                                          consecutive links; identical in all
                                          four columns and at 375 / 768 /
                                          1280 / 1440. Measured, not a height
                                          divided by a row count.
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

   HEADROOM: ONE ROW. A seventh row in any column measures 319.50 px / 0.2496
   and still passes. An EIGHTH measures 342 px / 0.2672 and fails the gate.
   If you are here to add a footer link, you get one — and the one after it
   turns `critical-1280` red.

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
   column adopts, so a link cannot be lost by editing the map below.

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

/**
 * Reference surfaces published under the family column they continue, by
 * `navigationItems` label. Keyed by ROUTE, so a renamed label in `ia.ts`
 * cannot silently orphan an entry — and an unmatched path simply stays in
 * KURUMSAL, because that column takes the complement.
 */
const FAMILY_RESOURCES: Record<string, readonly string[]> = {
  Kabiliyetler: ["/kabiliyet-profilleri"],
};

const ADOPTED_BY_FAMILY = new Set(Object.values(FAMILY_RESOURCES).flat());

const asItems = (links: readonly { label: string; path: string }[]) =>
  links.map((link) => ({ label: link.label, href: link.path }));

const family = (label: string): FooterLinkGroup => {
  const group = navigationItems.find((item) => item.label === label);
  const adopted = FAMILY_RESOURCES[label] ?? [];
  return {
    title: label.toLocaleUpperCase("tr-TR"),
    items: [
      ...(group?.children ?? []).map((category) => ({ label: category.label, href: category.path })),
      ...asItems(resourceLinks.filter((link) => adopted.includes(link.path))),
    ],
  };
};

export const footerGroups: FooterLinkGroup[] = [
  family("Hizmetler"),
  family("Kabiliyetler"),
  family("Endüstriyel"),
  {
    title: "KURUMSAL",
    items: [
      ...asItems(companyLinks),
      ...asItems(resourceLinks.filter((link) => !ADOPTED_BY_FAMILY.has(link.path))),
    ],
  },
];
