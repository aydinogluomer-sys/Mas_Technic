import { Suspense, lazy, useRef } from "react";
import { TechnicalHeader } from "./TechnicalHeader";
import { TechnicalHero } from "./TechnicalHero";
import { ProofStrip } from "./ProofStrip";
import { MeasuredProjects, NexusEvidence, TechnicalProcess } from "./ProcessNexusProjects";
import { DrawingFooter, FaqSection, MeasurementManifesto, QualityFile, ReferenceBand, RfqSection, TechnicalSectors } from "./FinalSections";
import { MarqueeBand } from "./MarqueeBand";
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

export function TechnicalLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  useTechnicalLandingMotion(rootRef);
  return (
    <div ref={rootRef} className="tl-root" data-testid="technical-landing-root">
      <div className="tl-sheet">
        <div className="tl-header-band">
          <div className="tl-band-index" aria-hidden="true"><span>01</span><small>HEADER</small></div>
          <TechnicalHeader />
        </div>
        <main id="main-content">
          <TechnicalHero />
          <ProofStrip />
          <MarqueeBand />
          <TechnicalProcess />
          <NexusEvidence />
          <MeasuredProjects />
          <TechnicalSectors />
          <MeasurementManifesto />
          <QualityFile />
          <ReferenceBand />
          <FaqSection />
          <RfqSection />
        </main>
        <DrawingFooter />
      </div>
      {MasterGridOverlay && (
        <Suspense fallback={null}>
          <MasterGridOverlay />
        </Suspense>
      )}
    </div>
  );
}
