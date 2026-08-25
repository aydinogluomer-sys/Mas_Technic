import { useRef } from "react";
import { TechnicalHeader } from "./TechnicalHeader";
import { TechnicalHero } from "./TechnicalHero";
import { ProofStrip } from "./ProofStrip";
import { MeasuredProjects, NexusEvidence, TechnicalProcess } from "./ProcessNexusProjects";
import { DrawingFooter, FaqSection, MeasurementManifesto, QualityFile, ReferenceBand, RfqSection, TechnicalSectors } from "./FinalSections";
import { MarqueeBand } from "./MarqueeBand";
import "@/styles/technical-landing.css";
import { useTechnicalLandingMotion } from "@/hooks/useTechnicalLandingMotion";

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
    </div>
  );
}
