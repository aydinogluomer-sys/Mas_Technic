import {
  Box, ChartNoAxesCombined, ClipboardList, Factory, FileBarChart2,
  LayoutGrid, PackageCheck, Radar, Settings, ShieldCheck, UserRound,
} from "lucide-react";
import processImage from "@/assets/hero-cnc-frezeleme.webp";
import projectDefense from "@/assets/industry-defense.webp";
import projectMedical from "@/assets/industry-medical.webp";
import projectTurning from "@/assets/hero-cnc-tornalama.webp";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import { measuredProjects, nexusKpis, nexusOrders, nexusPanels, technicalProcess } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

const projectImages = { defense: projectDefense, medical: projectMedical, turning: projectTurning } as const;
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

/** 06 — NEXUS: müşteri portalının arayüz önizlemesi. Veriler temsilîdir. */
export function NexusEvidence() {
  return (
    <TechnicalSectionFrame id="nexus" no="06" label="NEXUS" className="tl-nexus" labelledBy="tl-nexus-title" status="demo">
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
              <span>Ö. YILMAZ<small>Kalite Yöneticisi</small></span>
            </p>
          </div>
          <div className="tl-nexus-main">
            <div className="tl-scroll-cue" aria-hidden="true">TABLOYU YATAY KAYDIR →</div>
            <div className="tl-nexus-table-wrap" role="region" aria-label="NEXUS örnek iş emirleri" tabIndex={0}>
              <table>
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

/** 07 — Ölçüm tablosuyla birlikte sunulan seçilmiş parçalar. */
export function MeasuredProjects() {
  return (
    <TechnicalSectionFrame id="projeler" no="07" label="SEÇİLMİŞ PROJELER" className="tl-projects" labelledBy="tl-projects-title" status="sample">
      <div className="tl-projects-body">
        {/* Referansta bant başlığı yok; bandı sol raydaki "07 / SEÇİLMİŞ PROJELER"
            etiketi adlandırıyor, başlık yalnızca erişilebilirlik için duruyor. */}
        <h2 id="tl-projects-title" className="tl-visually-hidden">SEÇİLMİŞ PROJELER</h2>
        <div className="tl-project-grid">
          {measuredProjects.map((project, index) => (
            <article className={index === 0 ? "tl-project-featured" : ""} key={project.title}>
              <img src={projectImages[project.image]} alt={`${project.title} örnek hassas imalat parçası`} width="1024" height="1024" loading="lazy" />
              <div>
                <h3>{project.title} — <span>{project.material}</span></h3>
                <p className="tl-report-no">RAPOR NO: {project.report}</p>
                <table>
                  <thead><tr><th>NOMİNAL</th><th>ÖLÇÜLEN</th><th>SONUÇ</th></tr></thead>
                  <tbody>
                    {project.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, i) => <td key={cell} data-result={i === 2 ? "pass" : undefined}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
        <p className="tl-project-note">ÖLÇÜM DEĞERLERİ TEMSİLÎDİR · GERÇEK RAPOR DEĞİLDİR</p>
      </div>
    </TechnicalSectionFrame>
  );
}
