import { marqueeItems } from "@/data/technicalLandingData";
import { Link } from "@/i18n/LocaleLink";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { useTranslation } from "react-i18next";

const capabilityRoutes = [
  "/hizmetler/cnc-frezeleme", "/hizmetler/cnc-tornalama", "/hizmetler/hassas-mikro-isleme",
  "/hizmetler/kategori/yuzey-islemleri", "/kabiliyetler/kalite-kontrol", "/hizmetler/kategori/montaj-birlestirme",
] as const;

export function MarqueeBand() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="04" label="MARQUEE" className="tl-marquee" ariaLabel={t("Üretim kabiliyetleri")}>
      <div className="tl-marquee-viewport">
        <div className="tl-marquee-track">
          <ul className="tl-marquee-primary">
            {marqueeItems.map((item, index) => <li key={item}><Link to={capabilityRoutes[index]}>{t(item)}</Link></li>)}
          </ul>
          <ul className="tl-marquee-duplicate" aria-hidden="true">
            {marqueeItems.map((item) => <li key={item}>{t(item)}</li>)}
          </ul>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
