import { RFQ_STEPS } from "./rfq-model";
import { useTranslation } from "react-i18next";

/* ══════════════════════════════════════════════════════════════════════════
   THE STEP RUN

   Four steps became three. "İNCELE" and "GÖNDER" were two screens showing the
   same summary, one with a button under it, so the reader confirmed the same
   seven rows twice; the review now sits above the submit control on one
   screen, which is also what makes the double-submit guard and the failure
   notice land next to the thing that failed.

   Rendered as the shell's segmented control rather than a row of circular
   badges joined by tinted rules. `aria-current="step"` states which one the
   reader is on — the old stepper carried no ARIA at all, so a screen-reader
   user heard four unlabelled buttons and no position.
   ══════════════════════════════════════════════════════════════════════════ */

export function RfqStepper({
  current,
  furthest,
  onSelect,
}: {
  /** 1-based. */
  current: number;
  /** The highest step the reader has legitimately reached. */
  furthest: number;
  onSelect: (step: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("Teklif adımları")}>
      <ol className="shell-segments">
        {RFQ_STEPS.map((step, index) => {
          const position = index + 1;
          const reachable = position <= furthest;
          return (
            <li key={step.no}>
              <button
                type="button"
                className="shell-segment"
                aria-pressed={position === current}
                aria-current={position === current ? "step" : undefined}
                aria-disabled={reachable ? undefined : true}
                disabled={!reachable}
                onClick={() => reachable && onSelect(position)}
              >
                <span className="shell-segment-code">{step.no}</span>
                <span>{t(step.label)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
