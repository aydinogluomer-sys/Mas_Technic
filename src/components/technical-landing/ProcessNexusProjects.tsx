import { useState } from "react";
import projectDefense from "@/assets/industry-defense.webp";
import projectDefense640 from "@/assets/industry-defense-640.webp";
import projectDefense960 from "@/assets/industry-defense-960.webp";
import projectMedical from "@/assets/industry-medical.webp";
import projectTurning from "@/assets/hero-cnc-tornalama.webp";
import { coverSizes, responsive, type ResponsiveImage } from "@/components/BlurImage";
import { Link } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { accountLink } from "@/components/navigation/ia";
import { caseStudies, type CaseStudyImageKey } from "@/content/caseStudies";
import { NEXUS_DEMO_LABEL, NEXUS_NOT_REAL_LABEL, nexusDemoSteps, technicalProcess } from "@/data/technicalLandingData";
import { SignatureControl } from "./SignatureControl";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

/* Intrinsic sizes per key so each tile reserves the right box; only the
   featured tile (index 0, `defense`) renders at more than one ladder width
   across the matrix — 332 / 355 / 607 / 687px — so only it carries a
   `srcSet`. The two small tiles stay inside one bucket (201–331px) and keep
   the plain source; see `reports/10/responsive-images.md`. */
const caseStudyImages: Record<CaseStudyImageKey, ResponsiveImage> = {
  defense: responsive(1200, 1200, projectDefense, [projectDefense640, 640], [projectDefense960, 960]),
  medical: responsive(1200, 1200, projectMedical),
  turning: responsive(900, 504, projectTurning),
};

/* `.tl-project-featured` is 264px tall (216 on mobile) and its image spans
   master columns 1-6 of 12 (1-3 of 6 on tablet, full width on mobile). The
   source is square, so the box is always the wider axis. */
const FEATURED_SIZES = coverSizes(1, "264px", [
  ["(max-width: 767px)", "calc(100vw - 43px)", "216px"],
  ["(max-width: 1180px)", "calc((100vw - 56px) / 2 - 1px)"],
  [null, "min(calc((100vw - 66px) / 2), 767px)"],
]);

/** 05 — Karardan parçaya: kontrol yaklaşımı (imza modülü) ve dört adımlı üretim akışı. */
export function TechnicalProcess() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame id="surec" no="05" label="SÜREÇ" className="tl-process" labelledBy="tl-process-title">
      <div className="tl-process-body">
        <div className="tl-process-intro">
          <h2 id="tl-process-title">{t("Karardan parçaya,")}<br /><em>{t("kanıtla ilerleyen üretim.")}</em></h2>
        </div>
        {/* PROOF01: the stock milling render gave way to the signature
            module — the control approach on one representative part. */}
        <SignatureControl />
        <ol>
          {technicalProcess.map((step) => (
            <li key={step.no}>
              <span>{step.no}</span>
              <h3>{t(step.title)}</h3>
              {step.lines.map((line) => <p key={line}>{t(line)}</p>)}
            </li>
          ))}
        </ol>
      </div>
    </TechnicalSectionFrame>
  );
}

/**
 * 06 — NEXUS (NEXUS01): a five-step DEMO of how a job moves, not a portal
 * screenshot. Native buttons with `aria-pressed` choose the step; every step
 * stays in the DOM (inactive ones visually hidden), so the whole workflow is
 * readable without choosing. Each view says `DEMO` and
 * `GERÇEK SİPARİŞ DEĞİLDİR`; nothing is downloadable, nothing identifies an
 * order, a customer, a quantity or a rate. New customers go to the RFQ,
 * existing ones to sign-in — both real routes.
 */
export function NexusEvidence() {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>(nexusDemoSteps[0].key);
  return (
    <TechnicalSectionFrame id="nexus" no="06" label="NEXUS" className="tl-nexus" labelledBy="tl-nexus-title">
      <div className="tl-nexus-body">
        <header>
          <h2 id="tl-nexus-title">{t("Bir işin beş adımı,")}<br /><em>{t("her adımda bir belge.")}</em></h2>
          <p className="tl-nexus-stamp" data-testid="nexus-demo-stamp">
            <strong>{t(NEXUS_DEMO_LABEL)}</strong>
            <span>{t(NEXUS_NOT_REAL_LABEL)}</span>
          </p>
        </header>
        <div className="tl-nexus-app">
          <div className="tl-nexus-rail" role="group" aria-label={t("NEXUS demo adımları")}>
            {nexusDemoSteps.map((step, index) => (
              <button
                key={step.key}
                type="button"
                aria-pressed={active === step.key}
                aria-controls={`tl-nexus-step-${step.key}`}
                onClick={() => setActive(step.key)}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {t(step.title)}
              </button>
            ))}
          </div>
          <div className="tl-nexus-main">
            {nexusDemoSteps.map((step, index) => (
              <section
                key={step.key}
                id={`tl-nexus-step-${step.key}`}
                data-active={active === step.key}
                className={active === step.key ? "tl-nexus-step" : "tl-nexus-step tl-visually-hidden"}
                aria-label={`${t(NEXUS_DEMO_LABEL)} · ${t(step.title)}`}
              >
                <p className="tl-nexus-step-meta">
                  {t(NEXUS_DEMO_LABEL)} · {t(NEXUS_NOT_REAL_LABEL)} · {t("ADIM {{n}} / {{total}}", { n: index + 1, total: nexusDemoSteps.length })}
                </p>
                <h3>{t(step.title)}</h3>
                <p>{t(step.summary)}</p>
                <dl>
                  <div><dt>{t("OLUŞAN BELGE")}</dt><dd>{t(step.document)}</dd></div>
                  <div><dt>{t("KARAR")}</dt><dd>{t(step.decision)}</dd></div>
                </dl>
              </section>
            ))}
          </div>
        </div>
        <div className="tl-nexus-cta">
          <Link to="/teklif-al" className="tl-nexus-rfq" data-testid="nexus-rfq">
            <small>{t("YENİ MÜŞTERİ")}</small>
            {t("TEKLİF İSTEYİN")}
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to={accountLink.path} className="tl-nexus-login" data-testid="nexus-login">
            <small>{t("MEVCUT MÜŞTERİ")}</small>
            {t("NEXUS'A GİRİŞ YAP")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}

/**
 * 07 — Capability profiles, rendered from the case-study schema.
 *
 * This band used to show three "measured projects": a part name, an invented
 * inspection report number and a nominal → measured → `UYGUN` table with
 * micron-level results that were typed, not measured. §G is unambiguous —
 * `CASE_STUDIES: NONE_PROVIDED_YET`, and where there are none,
 * `REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT`.
 *
 * The card keeps its shape. What changed is what the three columns mean: they
 * were a claim about a part that was made, and they are now the control plan a
 * buyer would receive — what is checked, how, and what record it leaves. The
 * report-number line became the link to the capability behind the part family.
 *
 * `src/content/caseStudies.ts` carries the schema. When a real project and a
 * client permission arrive, the entry changes `kind` and gains
 * `measuredResults`; nothing here has to be rewritten.
 */
export function MeasuredProjects() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame id="projeler" no="07" label="KABİLİYET PROFİLLERİ" className="tl-projects" labelledBy="tl-projects-title">
      <div className="tl-projects-body">
        {/* Referansta bant başlığı yok; bandı sol raydaki "07 / KABİLİYET
            PROFİLLERİ" etiketi adlandırıyor, başlık yalnızca erişilebilirlik
            için duruyor. */}
        <h2 id="tl-projects-title" className="tl-visually-hidden">{t("KABİLİYET PROFİLLERİ")}</h2>
        <div className="tl-project-grid">
          {caseStudies.map((study, index) => {
            const figure = caseStudyImages[study.gallery[0].image];
            return (
            <article className={index === 0 ? "tl-project-featured" : ""} key={study.slug}>
              {/* PHASE 10-3 — `alt=""`: each tile's picture sits over an
                  `<h3>` that names the part family and its material, and the
                  render illustrates that family rather than adding to it.
                  `study.gallery[0].alt` is still the plate caption on
                  `/kabiliyet-profilleri/:slug`. */}
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
