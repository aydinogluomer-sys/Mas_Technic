import { companyLinks, homeLink, navigationItems, resourceLinks } from "@/components/navigation/ia";

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
   ══════════════════════════════════════════════════════════════════════════ */

export type FooterLinkGroup = {
  title: string;
  items: { label: string; href: string }[];
};

const family = (label: string): FooterLinkGroup => {
  const group = navigationItems.find((item) => item.label === label);
  return {
    title: label.toLocaleUpperCase("tr-TR"),
    items: (group?.children ?? []).map((category) => ({ label: category.label, href: category.path })),
  };
};

export const footerGroups: FooterLinkGroup[] = [
  family("Hizmetler"),
  family("Kabiliyetler"),
  family("Endüstriyel"),
  {
    title: "KURUMSAL",
    items: [
      { label: homeLink.label, href: homeLink.path },
      ...companyLinks.map((link) => ({ label: link.label, href: link.path })),
      ...resourceLinks.map((link) => ({ label: link.label, href: link.path })),
    ],
  },
];
