import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/LocaleLink";
import { accountLink } from "@/components/navigation/ia";
import { NEXUS_DEMO_LABEL, NEXUS_NOT_REAL_LABEL, nexusDemoSteps } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { NexusOperationPlate } from "./NexusOperationPlate";

export function NexusEvidence() {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>(nexusDemoSteps[0].key);
  return (
    <TechnicalSectionFrame id="nexus" no="11" label="NEXUS" className="tl-nexus tl-inspection-nexus" labelledBy="tl-nexus-title">
      <div className="tl-nexus-body">
        <header>
          <h2 id="tl-nexus-title">{t("Bir işin beş adımı,")}<br /><em>{t("her adımda bir belge.")}</em></h2>
          <p className="tl-nexus-stamp" data-testid="nexus-demo-stamp"><strong>{t(NEXUS_DEMO_LABEL)}</strong><span>{t(NEXUS_NOT_REAL_LABEL)}</span></p>
        </header>
        <div className="tl-nexus-app">
          <div className="tl-nexus-rail" role="group" aria-label={t("NEXUS demo adımları")}>
            {nexusDemoSteps.map((step, index) => (
              <button key={step.key} type="button" aria-pressed={active === step.key} aria-controls={`tl-nexus-step-${step.key}`} onClick={() => setActive(step.key)}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{t(step.title)}
              </button>
            ))}
          </div>
          <div className="tl-nexus-main">
            {nexusDemoSteps.map((step, index) => (
              <section key={step.key} id={`tl-nexus-step-${step.key}`} data-active={active === step.key}
                className={active === step.key ? "tl-nexus-step" : "tl-nexus-step tl-visually-hidden"}
                aria-label={`${t(NEXUS_DEMO_LABEL)} · ${t(step.title)}`}>
                <p className="tl-nexus-step-meta">{t(NEXUS_DEMO_LABEL)} · {t(NEXUS_NOT_REAL_LABEL)} · {t("ADIM {{n}} / {{total}}", { n: index + 1, total: nexusDemoSteps.length })}</p>
                <h3>{t(step.title)}</h3>
                <NexusOperationPlate operation={step.key} />
                <p>{t(step.summary)}</p>
                <dl><div><dt>{t("OLUŞAN BELGE")}</dt><dd>{t(step.document)}</dd></div><div><dt>{t("KARAR")}</dt><dd>{t(step.decision)}</dd></div></dl>
              </section>
            ))}
          </div>
        </div>
        <div className="tl-nexus-cta">
          <Link to="/teklif-al" className="tl-nexus-rfq" data-testid="nexus-rfq"><small>{t("YENİ MÜŞTERİ")}</small>{t("TEKLİF İSTEYİN")}<ArrowRight aria-hidden="true" /></Link>
          <Link to={accountLink.path} className="tl-nexus-login" data-testid="nexus-login"><small>{t("MEVCUT MÜŞTERİ")}</small>{t("NEXUS'A GİRİŞ YAP")}<ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
