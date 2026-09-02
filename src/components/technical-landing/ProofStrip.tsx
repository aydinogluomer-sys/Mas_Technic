import { technicalProof, technicalProofNote } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

export function ProofStrip() {
  return (
    <TechnicalSectionFrame no="03" label="PROOF STRIP" className="tl-proof" ariaLabel="Üretim kabiliyeti özeti">
      <div className="tl-proof-grid">
        {technicalProof.map(({ value, label, icon: Icon }) => (
          <article key={label}>
            <Icon aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <p className="tl-proof-note">{technicalProofNote}</p>
    </TechnicalSectionFrame>
  );
}
