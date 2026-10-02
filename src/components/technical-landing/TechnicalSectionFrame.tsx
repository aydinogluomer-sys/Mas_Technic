/* The landing's band primitive is the SITE's band primitive now.

   It moved to `src/components/shell/ShellBand.tsx` in Phase 04 so inner pages
   can use the same rail, the same master columns and the same index; this file
   stays as the landing's original import path. Nothing about the rendered
   output changed — `ShellBand` only adds an optional `tone` attribute, which
   the landing does not pass. */
export {
  ShellBand as TechnicalSectionFrame,
  type ShellBandProps as TechnicalSectionFrameProps,
} from "@/components/shell/ShellBand";
