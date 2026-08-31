import { Suspense, lazy, useRef } from "react";
import { Header } from "@/components/Header";
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
      {/* Band 01 is the GLOBAL header now. It renders through the
          `#shared-header-host` portal in `src/App.tsx` so the landing and every
          inner page mount the same navigation, and it keeps the sheet's own
          geometry (`--tl-sheet-max`, `--tl-rail + repeat(--tl-cols,1fr)`) and
          its `01 HEADER` rail index. `.tl-sheet` reserves `--gnav-h` at the top
          so the fixed bar covers nothing. Before Phase 03 this band held a
          landing-only header whose six hash anchors were the only navigation on
          `/` (`reports/baseline/known-blockers.md` B14). */}
      <Header />
      <div className="tl-sheet">
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
