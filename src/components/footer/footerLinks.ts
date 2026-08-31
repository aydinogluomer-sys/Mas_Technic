import { companyLinks, homeLink, navigationItems, resourceLinks } from "@/components/navigation/ia";

/**
 * The inner-page footer's link groups — DERIVED, no longer maintained by hand.
 *
 * This file used to be a third link taxonomy, drifting from both the menu
 * (`navigation-data`) and the landing footer (`footerColumns`). Three of its
 * entries had already rotted:
 *
 *   `/endustriyel/kategori/seri-uretim`  — not a route the app serves. The
 *       real slug in `src/data/categoryPages.ts` is `seri-uretim-endustriyel`,
 *       so this footer link resolved to the category not-found shell.
 *   `/#hizmetler` and `/#kabiliyetler` — two anchors that do not exist on the
 *       production landing; the real seven are in `navigation/ia.ts`
 *       (`reports/baseline/known-blockers.md` B03).
 *
 * Deriving the groups from `src/components/navigation/ia.ts` makes that class
 * of drift impossible: a renamed slug can no longer be right in the menu and
 * wrong in the footer.
 */
export type FooterLinkGroup = {
  title: string;
  titleHref: string | null;
  items: { label: string; href: string }[];
};

const family = (label: string): FooterLinkGroup => {
  const group = navigationItems.find((item) => item.label === label);
  return {
    title: label,
    titleHref: null,
    items: (group?.children ?? []).map((category) => ({ label: category.label, href: category.path })),
  };
};

export const footerLinks: FooterLinkGroup[] = [
  family("Endüstriyel"),
  family("Kabiliyetler"),
  family("Hizmetler"),
  {
    title: "Kurumsal & Destek",
    titleHref: null,
    items: [
      { label: homeLink.label, href: homeLink.path },
      ...companyLinks.map((link) => ({ label: link.label, href: link.path })),
      ...resourceLinks.map((link) => ({ label: link.label, href: link.path })),
    ],
  },
];
