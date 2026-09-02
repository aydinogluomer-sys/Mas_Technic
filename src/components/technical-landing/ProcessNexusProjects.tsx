import {
  Box, ChartNoAxesCombined, ClipboardList, Factory, FileBarChart2,
  LayoutGrid, PackageCheck, Radar, Settings, ShieldCheck, UserRound,
} from "lucide-react";
import processImage from "@/assets/hero-cnc-frezeleme.webp";
import projectDefense from "@/assets/industry-defense.webp";
import projectMedical from "@/assets/industry-medical.webp";
import projectTurning from "@/assets/hero-cnc-tornalama.webp";
import { Link } from "react-router-dom";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import { caseStudies } from "@/content/caseStudies";
import { nexusKpis, nexusOrders, nexusPanels, nexusRedactionNote, technicalProcess } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

const caseStudyImages = { defense: projectDefense, medical: projectMedical, turning: projectTurning } as const;
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
            <img src={processImage} alt="CNC tezgâhında işlenen metal parça" width="1920" height="1080" loading="lazy" />
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
          {caseStudies.map((study, index) => (
            <article className={index === 0 ? "tl-project-featured" : ""} key={study.slug}>
              <img src={caseStudyImages[study.gallery[0].image]} alt={study.gallery[0].alt} width="1024" height="1024" loading="lazy" />
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
          ))}
        </div>
        <p className="tl-project-note">
          KABİLİYET PROFİLLERİ — ÜRETİM VE KONTROL YAKLAŞIMIMIZI TANIMLAR
        </p>
      </div>
    </TechnicalSectionFrame>
  );
}
