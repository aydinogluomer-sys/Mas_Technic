import { technicalProof, technicalProofNote } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { useTranslation } from "react-i18next";

export function ProofStrip() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="03" label="PROOF STRIP" className="tl-proof" ariaLabel={t("Üretim kabiliyeti özeti")}>
      <div className="tl-proof-grid">
        {technicalProof.map(({ value, label, icon: Icon }) => (
          <article key={label}>
            <Icon aria-hidden="true" />
            <strong>{t(value)}</strong>
            <span>{t(label)}</span>
          </article>
        ))}
      </div>
      <p className="tl-proof-note">{t(technicalProofNote)}</p>
    </TechnicalSectionFrame>
  );
}
