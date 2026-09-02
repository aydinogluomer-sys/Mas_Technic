/* The public shell's surface area, in one import path.
   Phases 07 and 08 compose inner-page bodies from these; nothing else in
   `src/components/shell/**` is meant to be imported directly. */
export { PageShell, type PageShellProps } from "./PageShell";
export { ShellBand, type ShellBandProps } from "./ShellBand";
export {
  ShellDivider,
  ShellEvidence,
  ShellMetaRow,
  ShellPageHero,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "./ShellPrimitives";
export { ShellEmpty, ShellLoading, ShellRouteBoundary, ShellRouteError } from "./ShellStates";
export { SiteFooter } from "./SiteFooter";
export { footerGroups, type FooterLinkGroup } from "./footer-groups";
