import { marqueeItems } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { useTranslation } from "react-i18next";

/** 04 — Kabiliyet şeridi. Sonsuz akış için liste iki kez basılır; kopya erişilebilirlik ağacından çıkarılır. */
export function MarqueeBand() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="04" label="MARQUEE" className="tl-marquee" ariaLabel={t("Üretim kabiliyetleri")}>
      <div className="tl-marquee-viewport">
        <div className="tl-marquee-track">
          <ul>{marqueeItems.map((item) => <li key={item}>{t(item)}</li>)}</ul>
          <ul aria-hidden="true">{marqueeItems.map((item) => <li key={item}>{t(item)}</li>)}</ul>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
