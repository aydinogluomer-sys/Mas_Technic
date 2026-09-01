import type { ElementType, ReactNode } from "react";

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

/**
 * Content provenance, shown as a corner stamp.
 *
 * `demo`/`sample` exist so an unfinished band has to SAY it is unfinished
 * instead of passing as evidence. They are not decoration.
 */
export type ShellContentStatus = "demo" | "sample" | "verified";

const statusLabels: Record<ShellContentStatus, string> = {
  demo: "DEMO İÇERİK",
  sample: "ÖRNEK İÇERİK",
  verified: "DOĞRULANMIŞ",
};

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
  status?: ShellContentStatus;
  /** `paper` flips the band to the warm evidence ground. */
  tone?: "graphite" | "paper";
  children: ReactNode;
};

export function ShellBand({
  as: Component = "section",
  no,
  label,
  className = "",
  id,
  labelledBy,
  ariaLabel,
  status,
  tone,
  children,
}: ShellBandProps) {
  return (
    <Component
      id={id}
      className={`tl-band ${className}`.trim()}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      data-content-status={status}
      data-band-tone={tone}
    >
      <div className="tl-band-index" aria-hidden="true">
        <span>{no}</span>
        <small>{label}</small>
      </div>
      {status && <span className="tl-status-badge">{statusLabels[status]}</span>}
      {children}
    </Component>
  );
}
