import "@/styles/inspection-operations.css";
import { useState } from "react";
import processImage from "@/assets/hero-cnc-frezeleme.webp";
import processImage640 from "@/assets/hero-cnc-frezeleme-640.webp";
import processImage960 from "@/assets/hero-cnc-frezeleme-960.webp";
import projectDefense from "@/assets/industry-defense.webp";
import projectDefense640 from "@/assets/industry-defense-640.webp";
import projectDefense960 from "@/assets/industry-defense-960.webp";
import projectMedical from "@/assets/industry-medical.webp";
import projectTurning from "@/assets/hero-cnc-tornalama.webp";
import { coverSizes, responsive, type ResponsiveImage } from "@/components/BlurImage";
import { Link } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import { caseStudies, type CaseStudyImageKey } from "@/content/caseStudies";
import { technicalProcess } from "@/data/technicalLandingData";
import { SignatureControl } from "./SignatureControl";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

const caseStudyImages: Record<CaseStudyImageKey, ResponsiveImage> = {
  defense: responsive(1200, 1200, projectDefense, [projectDefense640, 640], [projectDefense960, 960]),
  medical: responsive(1200, 1200, projectMedical),
  turning: responsive(900, 504, projectTurning),
};

const FEATURED_SIZES = coverSizes(1, "420px", [
  ["(max-width: 767px)", "calc(100vw - 43px)", "216px"],
  ["(max-width: 1180px)", "calc((100vw - 56px) / 2 - 1px)"],
  [null, "min(calc((100vw - 66px) / 2), 767px)"],
]);

const processFigure = responsive(1600, 896, processImage, [processImage640, 640], [processImage960, 960]);
const PROCESS_SIZES = coverSizes(1600 / 896, "420px + 96px", [
  ["(max-width: 767px)", "calc(100vw - 42px)", "320px + 96px"],
  ["(max-width: 1180px)", "calc((100vw - 56px) / 2)"],
  [null, "min(calc((100vw - 66px) * 2 / 3), 1023px)"],
]);

export function TechnicalProcess() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const selected = technicalProcess[activeStep];
  return (
    <TechnicalSectionFrame id="surec" no="05" label="SÜREÇ" className="tl-process" labelledBy="tl-process-title">
      <div className="tl-process-body">
        <div className="tl-process-intro">
          <h2 id="tl-process-title">{t("Karardan parçaya,")}<br /><em>{t("kanıtla ilerleyen üretim.")}</em></h2>
          <div id="tl-process-selected" className="tl-process-selected" aria-labelledby="tl-process-selected-title">
            <p className="tl-operation-eyebrow">{selected.no} / 04</p>
            <h3 id="tl-process-selected-title">{t(selected.title)}</h3>
            <p>{selected.lines.map((line) => t(line)).join(" · ")}</p>
          </div>
        </div>
        <figure className="tl-process-photo">
          <ReverseScrollSection distance={48}>
            <img
              src={processFigure.src}
              srcSet={processFigure.srcSet}
              sizes={PROCESS_SIZES}
              alt={t("Soğutma sıvısı altında prizmatik metal bloğu işleyen CNC freze iş mili ve kesici takım")}
              width={processFigure.width}
              height={processFigure.height}
              loading="lazy"
              decoding="async"
            />
          </ReverseScrollSection>
          <Link className="tl-image-link" to="/hizmetler/cnc-frezeleme" aria-label={t("CNC Frezeleme")} />
        </figure>
        <ol>
          {technicalProcess.map((step, index) => (
            <li key={step.no} data-selected={activeStep === index}>
              <span>{step.no}</span>
              <h3><button type="button" aria-pressed={activeStep === index} aria-controls="tl-process-selected" onClick={() => setActiveStep(index)}>{t(step.title)}</button></h3>
              {step.lines.map((line) => <p key={line}>{t(line)}</p>)}
            </li>
          ))}
        </ol>
        <SignatureControl />
      </div>
    </TechnicalSectionFrame>
  );
}

export { NexusEvidence } from "./NexusEvidence";

export function MeasuredProjects() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame id="projeler" no="06" label="KABİLİYET PROFİLLERİ" className="tl-projects" labelledBy="tl-projects-title">
      <div className="tl-projects-body">
        <h2 id="tl-projects-title" className="tl-visually-hidden">{t("KABİLİYET PROFİLLERİ")}</h2>
        <div className="tl-project-grid">
          {caseStudies.map((study, index) => {
            const figure = caseStudyImages[study.gallery[0].image];
            return (
            <article className={index === 0 ? "tl-project-featured" : ""} key={study.slug}>
              <Link className="tl-project-media" to={`/kabiliyet-profilleri/${study.slug}`} aria-label={t(study.title)}>
                <img
                  src={figure.src}
                  srcSet={index === 0 ? figure.srcSet : undefined}
                  sizes={index === 0 ? FEATURED_SIZES : undefined}
                  alt=""
                  width={figure.width}
                  height={figure.height}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div>
                <h3>{t(study.title)} — <span>{t(study.material)}</span></h3>
                <p className="tl-profile-context">{t(study.gallery[0].alt)}</p>
                <p className="tl-report-no">
                  <Link to={study.relatedCapability.href} style={{ color: "inherit" }}>
                    {t(study.relatedCapability.label)} →
                  </Link>
                </p>
                <table>
                  <thead><tr><th>{t("ÖZELLİK")}</th><th>{t("KONTROL")}</th><th>{t("KAYIT")}</th></tr></thead>
                  <tbody>
                    {study.controlPlan.map((row) => (
                      <tr key={row.feature}>
                        <td>{t(row.feature)}</td>
                        <td>{t(row.method)}</td>
                        <td>{t(row.record)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            );
          })}
        </div>
        <p className="tl-project-note">
          {t("KABİLİYET PROFİLLERİ — ÜRETİM VE KONTROL YAKLAŞIMIMIZI TANIMLAR")}
        </p>
      </div>
    </TechnicalSectionFrame>
  );
}
