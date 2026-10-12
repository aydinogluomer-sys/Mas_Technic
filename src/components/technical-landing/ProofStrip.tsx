import { technicalProof, technicalProofNote } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { useTranslation } from "react-i18next";

const proofVariants = ["principal", "principal", "verbal", "verbal", "principal", "certification"] as const;

export function ProofStrip() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="03" label="PROOF STRIP" className="tl-proof" ariaLabel={t("Üretim kabiliyeti özeti")}>
      <div className="tl-proof-grid">
        {technicalProof.map(({ value, label, icon: Icon }, index) => (
          <article key={label} data-proof-variant={proofVariants[index]}>
            <Icon aria-hidden="true" />
            <strong>{t(value)}</strong>
            <span>{t(label)}</span>
            <svg className="tl-proof-dimension" viewBox="0 0 160 12" aria-hidden="true" focusable="false">
              <path pathLength="1" d="M1 1v10M1 6h158M159 1v10" />
            </svg>
          </article>
        ))}
      </div>
      <p className="tl-proof-note">{t(technicalProofNote)}</p>
    </TechnicalSectionFrame>
  );
}
