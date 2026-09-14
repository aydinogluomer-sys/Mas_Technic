import {
  Box, ChartNoAxesCombined, ClipboardList, Factory, FileBarChart2,
  LayoutGrid, PackageCheck, Radar, Settings, ShieldCheck, UserRound,
} from "lucide-react";
import processImage from "@/assets/hero-cnc-frezeleme.webp";
import processImage640 from "@/assets/hero-cnc-frezeleme-640.webp";
import processImage960 from "@/assets/hero-cnc-frezeleme-960.webp";
import projectDefense from "@/assets/industry-defense.webp";
import projectDefense640 from "@/assets/industry-defense-640.webp";
import projectDefense960 from "@/assets/industry-defense-960.webp";
import projectMedical from "@/assets/industry-medical.webp";
import projectTurning from "@/assets/hero-cnc-tornalama.webp";
import { coverSizes, responsive, type ResponsiveImage } from "@/components/BlurImage";
import { Link } from "react-router-dom";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import { caseStudies, type CaseStudyImageKey } from "@/content/caseStudies";
import { nexusKpis, nexusOrders, nexusPanels, nexusRedactionNote, technicalProcess } from "@/data/technicalLandingData";
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

/* `.tl-process figure` is 252px tall (216 on mobile) plus a 48px reverse-scroll
   overscan each way, spanning master columns 5-12 (4-6 on tablet, full on
   mobile) with an `object-fit: cover` 16:9 image: on mobile and tablet the
   height decides the source width (312 x 1.786 = 557px, 348 x 1.786 = 621px).
   Measured band widths: 333 at 375, 355 at 768, 809 at 1280, 916 at 1440. */
const processFigure = responsive(1600, 896, processImage, [processImage640, 640], [processImage960, 960]);
const PROCESS_SIZES = coverSizes(1600 / 896, "252px + 96px", [
  ["(max-width: 767px)", "calc(100vw - 42px)", "216px + 96px"],
  ["(max-width: 1180px)", "calc((100vw - 56px) / 2)"],
  [null, "min(calc((100vw - 66px) * 2 / 3), 1023px)"],
]);
const kpiIcons = { box: Box, flow: Factory, stack: PackageCheck, chart: ChartNoAxesCombined } as const;
const panelIcons = [LayoutGrid, ClipboardList, Radar, FileBarChart2, ShieldCheck, Settings] as const;

/** 05 — Karardan parçaya: dört adımlı üretim akışı. */
export function TechnicalProcess() {
  return (
    <TechnicalSectionFrame id="surec" no="05" label="SÜREÇ" className="tl-process" labelledBy="tl-process-title">
      <div className="tl-process-body">
        <div className="tl-process-intro">
          <h2 id="tl-process-title">Karardan parçaya,<br /><em>kanıtla ilerleyen üretim.</em></h2>
        </div>
        <figure>
          <ReverseScrollSection distance={48}>
            <img
              src={processFigure.src}
              srcSet={processFigure.srcSet}
              sizes={PROCESS_SIZES}
              alt="CNC tezgâhında işlenen metal parça"
              width={processFigure.width}
              height={processFigure.height}
              loading="lazy"
              decoding="async"
            />
          </ReverseScrollSection>
        </figure>
        <ol>
          {technicalProcess.map((step) => (
            <li key={step.no}>
              <span>{step.no}</span>
              <h3>{step.title}</h3>
              {step.lines.map((line) => <p key={line}>{line}</p>)}
            </li>
          ))}
        </ol>
      </div>
    </TechnicalSectionFrame>
  );
}

/**
 * 06 — NEXUS: the customer portal's interface, shown as a customer would have
 * to show it.
 *
 * The band used to carry a `DEMO İÇERİK` stamp over four invented KPIs, six
 * invented work orders and a named quality manager who does not exist. A badge
 * admitting the content is fake does not make it publishable — and a portal
 * cannot honestly display real orders either, because they belong to
 * customers. So the tiles describe what the portal does, and the identifying
 * columns are masked the way a screenshot of the live portal would have to be.
 */
export function NexusEvidence() {
  return (
    <TechnicalSectionFrame id="nexus" no="06" label="NEXUS" className="tl-nexus" labelledBy="tl-nexus-title">
      <div className="tl-nexus-body">
        <header>
          <h2 id="tl-nexus-title">Üretiminiz,<br /><em>siz sormadan görünür.</em></h2>
          <div className="tl-nexus-kpis">
            {nexusKpis.map((kpi) => {
              const Icon = kpiIcons[kpi.icon];
              return (
                <div key={kpi.label} data-tone={"tone" in kpi ? kpi.tone : undefined}>
                  <Icon aria-hidden="true" />
                  <strong>{kpi.value}</strong>
                  <span>{kpi.label}</span>
                </div>
              );
            })}
          </div>
        </header>
        <div className="tl-nexus-app">
          <div className="tl-nexus-rail" aria-label="NEXUS panel önizlemesi" role="group" tabIndex={0}>
            <ul>
              {nexusPanels.map((panel, index) => {
                const Icon = panelIcons[index];
                return (
                  <li key={panel} aria-current={index === 0 ? "true" : undefined}>
                    <Icon aria-hidden="true" />{panel}
                  </li>
                );
              })}
            </ul>
            <p className="tl-nexus-user">
              <UserRound aria-hidden="true" />
              <span>MÜŞTERİ HESABI<small>Yetkili kullanıcı</small></span>
            </p>
          </div>
          <div className="tl-nexus-main">
            <div className="tl-scroll-cue" aria-hidden="true">TABLOYU YATAY KAYDIR →</div>
            <div className="tl-nexus-table-wrap" role="region" aria-label={`NEXUS iş emri görünümü — ${nexusRedactionNote}`} tabIndex={0}>
              <table>
                <caption className="tl-visually-hidden">{nexusRedactionNote}</caption>
                <thead>
                  <tr><th>SİPARİŞ NO</th><th>PARÇA</th><th>MALZEME</th><th>ADET</th><th>TESLİMAT</th><th>DURUM</th></tr>
                </thead>
                <tbody>
                  {nexusOrders.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`}>{index === 5 ? <span data-status={cell}>{cell}</span> : cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
  return (
    <TechnicalSectionFrame id="projeler" no="07" label="KABİLİYET PROFİLLERİ" className="tl-projects" labelledBy="tl-projects-title">
      <div className="tl-projects-body">
        {/* Referansta bant başlığı yok; bandı sol raydaki "07 / KABİLİYET
            PROFİLLERİ" etiketi adlandırıyor, başlık yalnızca erişilebilirlik
            için duruyor. */}
        <h2 id="tl-projects-title" className="tl-visually-hidden">KABİLİYET PROFİLLERİ</h2>
        <div className="tl-project-grid">
          {caseStudies.map((study, index) => {
            const figure = caseStudyImages[study.gallery[0].image];
            return (
            <article className={index === 0 ? "tl-project-featured" : ""} key={study.slug}>
              <img
                src={figure.src}
                srcSet={index === 0 ? figure.srcSet : undefined}
                sizes={index === 0 ? FEATURED_SIZES : undefined}
                alt={study.gallery[0].alt}
                width={figure.width}
                height={figure.height}
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3>{study.title} — <span>{study.material}</span></h3>
                <p className="tl-report-no">
                  <Link to={study.relatedCapability.href} style={{ color: "inherit" }}>
                    {study.relatedCapability.label} →
                  </Link>
                </p>
                <table>
                  <thead><tr><th>ÖZELLİK</th><th>KONTROL</th><th>KAYIT</th></tr></thead>
                  <tbody>
                    {study.controlPlan.map((row) => (
                      <tr key={row.feature}>
                        <td>{row.feature}</td>
                        <td>{row.method}</td>
                        <td>{row.record}</td>
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
          KABİLİYET PROFİLLERİ — ÜRETİM VE KONTROL YAKLAŞIMIMIZI TANIMLAR
        </p>
      </div>
    </TechnicalSectionFrame>
  );
}
