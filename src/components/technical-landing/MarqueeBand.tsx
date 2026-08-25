import { marqueeItems } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

/** 04 — Kabiliyet şeridi. Sonsuz akış için liste iki kez basılır; kopya erişilebilirlik ağacından çıkarılır. */
export function MarqueeBand() {
  return (
    <TechnicalSectionFrame no="04" label="MARQUEE" className="tl-marquee" ariaLabel="Üretim kabiliyetleri">
      <div className="tl-marquee-viewport">
        <div className="tl-marquee-track">
          <ul>{marqueeItems.map((item) => <li key={item}>{item}</li>)}</ul>
          <ul aria-hidden="true">{marqueeItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
