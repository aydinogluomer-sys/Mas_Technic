import type { ElementType, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { railLabel } from "./rail-labels";

/* ══════════════════════════════════════════════════════════════════════════
   THE BAND — the public site's one horizontal unit

   Every public surface is a stack of bands. A band is:

       rail (--tl-rail)  +  --tl-cols equal master columns  +  a hairline rule

   and it carries an index in the rail — the sheet number that makes the page
   read as a drawing rather than as a scroll of sections.

   WHAT THIS REPLACES
   ------------------
   Until Phase 04 this primitive existed only as
   `technical-landing/TechnicalSectionFrame.tsx` and only `/` could use it.
   Inner pages had no band, no rail and no index at all: they opened straight
   into `<main class="pt-24 pb-16">` with a `container-industrial` inside, i.e.
   a completely different geometry from the home page
   (`reports/baseline/shell-inventory.md` §5). The component moved here, kept
   its behaviour byte for byte, and `TechnicalSectionFrame` is now a thin
   re-export so the landing keeps working through its old name.
   ══════════════════════════════════════════════════════════════════════════ */

/* THE CONTENT-PROVENANCE STAMP IS GONE (Phase 06).
 *
 * `status="demo" | "sample"` painted a corner badge — `DEMO İÇERİK`,
 * `ÖRNEK İÇERİK` — so an unfinished band had to SAY it was unfinished instead
 * of passing as evidence. That was the right instinct at the wrong altitude:
 * three bands of the landing carried one, which made the home page read as a
 * demo to any careful visitor, and the badge did nothing to stop the invented
 * numbers underneath it from being invented.
 *
 * Phase 06 removed the content instead. No band sets a status any more, so the
 * prop, the labels and the badge are deleted rather than left as a loaded gun:
 * `scripts/claims-gate.mjs` fails on the strings, and there is no longer an
 * affordance that makes shipping placeholder content feel acceptable.        */

export type ShellBandProps = {
  as?: ElementType;
  /** Rail index — the sheet number, e.g. `04`. */
  no: string;
  /** Rail caption under the index, e.g. `HİZMET`. */
  label: string;
  className?: string;
  id?: string;
  labelledBy?: string;
  ariaLabel?: string;
  /**
   * `paper` flips the band to the warm evidence ground. `graphite` is the
   * field default and names it explicitly at a call site; it reaches no
   * selector — see `TONE_ATTRIBUTE` below.
   */
  tone?: "graphite" | "paper";
  children: ReactNode;
};

/* THE ATTRIBUTE IS NOT THE PROP, AND THIS IS THE 09a TRAP CLOSED BEFORE IT
   OPENS.

   `data-band-tone="graphite"` used to be written into the DOM by every
   default `ShellSurfaceBand`, and NO rule anywhere matched it — verified by
   injection, a no-op today. It was still a loaded selector. `shell.css` binds
   the whole `--sf-*` role set on `.shell-root .tl-band[data-band-tone="paper"]`
   because a paper band nested in a graphite root is a ground the ROOT cannot
   see; the moment a future phase gave the graphite twin a background without
   binding the roles beside it, that is precisely the nested-ground trap that
   falsified two 09a `--sf-danger` proposals.

   BINDING THE GRAPHITE ROLES WOULD HAVE BEEN THE WRONG HALF OF THE CHOICE,
   and the measurement says so rather than taste. `PageShell` defaults
   `surface = "paper"`, so most inner pages are paper ROOTS whose default
   bands declare `tone="graphite"` and correctly inherit paper roles, because
   nothing paints a graphite band background. Binding `--sf-ink: var(--tl-white)`
   on that selector would put white ink on paper across every one of those
   bands — the same trap, mirrored, and live rather than latent.

   So the attribute is emitted only for a tone the stylesheet actually binds.
   `graphite` means "the field default", which is exactly what NO attribute
   means, and now no selector can be written against it at all. The prop keeps
   both names because saying `tone="graphite"` at a call site is honest
   authoring; only the DOM narrows. Enforced, not just described:
   `e2e/design-system-typography.spec.ts` asserts that no rendered
   `data-band-tone` carries any value but `paper`. */
const TONE_ATTRIBUTE = (tone: ShellBandProps["tone"]): "paper" | undefined =>
  tone === "paper" ? "paper" : undefined;

export function ShellBand({
  as: Component = "section",
  no,
  label,
  className = "",
  id,
  labelledBy,
  ariaLabel,
  tone,
  children,
}: ShellBandProps) {
  const { i18n } = useTranslation();
  return (
    <Component
      id={id}
      className={`tl-band ${className}`.trim()}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      data-band-tone={TONE_ATTRIBUTE(tone)}
      data-sheet-no={no}
    >
      <div className="tl-band-index" aria-hidden="true">
        <span>{no}</span>
        <small>{railLabel(label, i18n.language)}</small>
      </div>
      {children}
    </Component>
  );
}
