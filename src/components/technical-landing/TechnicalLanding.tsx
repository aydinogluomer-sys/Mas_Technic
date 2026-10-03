import { Suspense, lazy, useRef } from "react";
import { PageShell } from "@/components/shell/PageShell";
import { TechnicalHero } from "./TechnicalHero";
import { ProofStrip } from "./ProofStrip";
import { MeasuredProjects, NexusEvidence, TechnicalProcess } from "./ProcessNexusProjects";
import { FaqSection, QualityFile, ReferenceBand, RfqSection, TechnicalSectors } from "./FinalSections";
import "@/styles/technical-landing.css";
import { useTechnicalLandingMotion } from "@/hooks/useTechnicalLandingMotion";

/**
 * Geliştirme-yalnız master ızgara bindirmesi.
 *
 * `import.meta.env.DEV` üretimde derleme zamanı sabiti `false` olduğu için bu
 * üçlü ifade ölü bir dal bırakır: Rollup ne dinamik import'u ne de bindirme
 * bileşenini/CSS'ini `dist/` içine alır. `src/routes/DevRoutes.tsx` ile aynı
 * desen. Aç/kapa: CTRL+ALT+G.
 */
const MasterGridOverlay = import.meta.env.DEV
  ? lazy(() => import("@/components/dev/MasterGridOverlay").then((m) => ({ default: m.MasterGridOverlay })))
  : null;

/**
 * The landing is now a PAGE INSIDE THE SHELL, not its own shell.
 *
 * It used to own the sheet, the `<main>`, the navigation mount and its own
 * footer, which is exactly why `/` and every inner page ended up in different
 * visual worlds (`reports/baseline/shell-inventory.md` §5). `PageShell` owns
 * all four now; this file composes bands 02–13 and nothing else.
 *
 * `layout="bands"` keeps `<main>` a plain block: every child here is already a
 * band with its own rail and master columns, so the shell must not add a
 * second grid on top. `className="tl-root"` and `rootRef` keep the landing's
 * motion layer attached to the same element it always was — every
 * `.tl-root[data-motion="ready"]` rule still applies, including the footer's,
 * because the footer is still a descendant of this root.
 */
export function TechnicalLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  useTechnicalLandingMotion(rootRef);
  return (
    <PageShell
      surface="graphite"
      layout="bands"
      className="tl-root"
      rootRef={rootRef}
      testId="technical-landing-root"
      footerNo="12"
      footerConversion={false}
    >
      {/* UX01 — the contract's reading order: example geometry → verified
          capability summary → control approach (signature module; the
          production flow and the manifesto line merged into it) → three
          profiles → sectors → quality sources → NEXUS demo → short FAQ → RFQ.
          The repeating marquee and the separate manifesto band are gone. */}
      <TechnicalHero />
      <ProofStrip />
      <TechnicalProcess />
      <MeasuredProjects />
      <TechnicalSectors />
      <QualityFile />
      <ReferenceBand />
      <NexusEvidence />
      <FaqSection />
      <RfqSection />
      {MasterGridOverlay && (
        <Suspense fallback={null}>
          <MasterGridOverlay />
        </Suspense>
      )}
    </PageShell>
  );
}
