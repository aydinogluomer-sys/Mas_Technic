import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProcessProofCinema } from "@/hooks/useProcessProofCinema";
import { SparkParticles } from "@/components/ui/SparkParticles";

import dfmImage from "@/assets/hero-dfm-tasarim.webp";
import materialImage from "@/assets/hero-malzeme-kutuphanesi.webp";
import machiningImage from "@/assets/hero-cnc-frezeleme.webp";
import surfaceImage from "@/assets/hero-anodizasyon.webp";
import inspectionImage from "@/assets/hero-kalite-kontrol.webp";

export interface ProcessProofStage {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  summary: string;
  media: string;
  mediaAlt: string;
  route: string;
  routeLabel: string;
  proof: readonly string[];
}

export interface AnonymousCaseStudy {
  id: string;
  approved: boolean;
  sector: string;
  challenge: string;
  outcome: string;
  metrics?: readonly { label: string; value: string }[];
}

export interface ProcessProofCinemaProps {
  stages?: readonly ProcessProofStage[];
  caseStudies?: readonly AnonymousCaseStudy[];
  enableAnonymousCases?: boolean;
  className?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

type ProcessProofAnchorId = "neden-biz" | "kabiliyetler";

interface ProcessProofJumpDetail {
  id: ProcessProofAnchorId;
}

const DEFAULT_STAGES: readonly ProcessProofStage[] = [
  {
    id: "brief",
    index: "01",
    eyebrow: "Teknik değerlendirme",
    title: "Parçayı üretimden önce doğrularız.",
    summary: "Geometri, tolerans, adet ve kritik yüzeyler aynı teknik çerçevede değerlendirilir.",
    media: dfmImage,
    mediaAlt: "Üretilebilirlik değerlendirmesi yapılan CNC parça tasarımı",
    route: "/kabiliyetler/tasarim-rehberi-dfm",
    routeLabel: "DFM yaklaşımını incele",
    proof: ["Üretilebilirlik kontrolü", "Kritik ölçü planı", "Termin varsayımları"],
  },
  {
    id: "material",
    index: "02",
    eyebrow: "Malzeme kararı",
    title: "Malzeme, prosesin başlangıç koşuludur.",
    summary: "Alaşım, sertlik ve sertifika gereksinimleri kullanım koşuluna göre netleştirilir.",
    media: materialImage,
    mediaAlt: "CNC üretimi için seçilmiş metal malzeme numuneleri",
    route: "/malzemeler",
    routeLabel: "Malzeme kütüphanesine git",
    proof: ["Parti izlenebilirliği", "Sertifika kontrolü", "Uygun stok formu"],
  },
  {
    id: "machining",
    index: "03",
    eyebrow: "Kontrollü imalat",
    title: "Tekrarlanabilir proses, ölçülebilir parça.",
    summary: "Takım yolu, bağlama ve ara kontrol kararları tek bir üretim planında buluşur.",
    media: machiningImage,
    mediaAlt: "CNC freze tezgahında hassas metal parça üretimi",
    route: "/hizmetler/cnc-frezeleme",
    routeLabel: "CNC frezelemeyi incele",
    proof: ["Fikstür planı", "Proses içi ölçüm", "Revizyon disiplini"],
  },
  {
    id: "finish",
    index: "04",
    eyebrow: "Yüzey ve kimlik",
    title: "Fonksiyon, yüzeyde ve kayıtta korunur.",
    summary: "Kaplama, markalama ve son işlem adımları teknik resimle birlikte yönetilir.",
    media: surfaceImage,
    mediaAlt: "Anodize edilmiş renkli hassas metal parçalar",
    route: "/hizmetler/anodizasyon",
    routeLabel: "Yüzey işlemlerini incele",
    proof: ["Kaplama spesifikasyonu", "Kalıcı markalama", "Görsel kabul kriteri"],
  },
  {
    id: "verification",
    index: "05",
    eyebrow: "Doğrulama ve teslim",
    title: "Teslim edilen yalnız parça değil, güvenilir veridir.",
    summary: "Final ölçüm, dokümantasyon ve sevkiyat kontrolü aynı kapanış planının parçalarıdır.",
    media: inspectionImage,
    mediaAlt: "Kalite kontrol laboratuvarında hassas parça ölçümü",
    route: "/kabiliyetler/kalite-kontrol",
    routeLabel: "Kalite kontrolü incele",
    proof: ["Final ölçüm raporu", "Uygunluk kaydı", "Kontrollü sevkiyat"],
  },
] as const;

function isProcessProofJumpDetail(value: unknown): value is ProcessProofJumpDetail {
  if (!value || typeof value !== "object" || !("id" in value)) return false;
  return value.id === "neden-biz" || value.id === "kabiliyetler";
}

export function ProcessProofCinema({
  stages = DEFAULT_STAGES,
  caseStudies = [],
  enableAnonymousCases = false,
  className = "",
  ctaHref = "/teklif-al",
  ctaLabel = "CAD dosyanı paylaş",
}: ProcessProofCinemaProps) {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const mediaStackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLOutputElement>(null);
  const sceneHalfRef = useRef<ProcessProofAnchorId>("neden-biz");
  // Bu bölüm masaüstünde koyu, mobil/kısa ekranda açık zemine dönüyor
  // (landing-flow.css: `.ppc-root { background: var(--ppc-paper) }`).
  // Adaptif header `data-surface`'ı okuduğu için sabit "dark" yanlış kontrast
  // veriyordu; breakpoint ile birlikte bildiriyoruz.
  const [surface, setSurface] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px), (max-height: 600px), (pointer: coarse)");
    const sync = () => setSurface(query.matches ? "light" : "dark");
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useProcessProofCinema(rootRef);
  const approvedCases = useMemo(
    () => caseStudies.filter((caseStudy) => caseStudy.approved),
    [caseStudies],
  );
  const showAnonymousCases = enableAnonymousCases && approvedCases.length > 0;

  const commitStageSelection = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.processInteraction = String(index);
    window.setTimeout(() => {
      if (root.dataset.processInteraction === String(index)) delete root.dataset.processInteraction;
    }, 650);
    root.querySelectorAll<HTMLElement>("[data-process-stage-trigger]").forEach((item, itemIndex) => {
      if (itemIndex === index) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
    ["[data-process-stage]", "[data-process-proof]", "[data-process-media]"].forEach((selector) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((item, itemIndex) => {
        item.toggleAttribute("data-active", itemIndex === index);
      });
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const readProgress = () => {
      const parsed = Number.parseFloat(root.dataset.processProgress ?? "0");
      const progress = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
      const nextHalf: ProcessProofAnchorId = progress < 0.5 ? "neden-biz" : "kabiliyetler";
      if (progressRef.current) progressRef.current.value = String(Math.round(progress * 100));
      if (nextHalf === sceneHalfRef.current) return;
      sceneHalfRef.current = nextHalf;
      window.dispatchEvent(new CustomEvent("mas:landing-scene-change", { detail: { id: nextHalf } }));
    };

    readProgress();
    const observer = new MutationObserver(readProgress);
    observer.observe(root, { attributes: true, attributeFilter: ["data-process-progress"] });
    return () => observer.disconnect();
  }, []);

  // Aşama görselleri sayfanın çok altında ve toplamda ~1 MB. Mount anında
  // yüklenince mobil 4G'de kritik yolu doyurup LCP'yi geciktiriyordu. Bölüm
  // yaklaşana kadar bekletiyor ve yalnız o breakpoint'te görünen varyantı
  // indiriyoruz (masaüstü stack ile mobil figür aynı anda inmesin).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let armed = false;

    const hydrateVisible = () => {
      if (!armed) return;
      root.querySelectorAll<HTMLImageElement>("img[data-ppc-src]").forEach((image) => {
        if (image.offsetParent === null) return;
        const source = image.dataset.ppcSrc;
        if (source) image.src = source;
        image.removeAttribute("data-ppc-src");
      });
    };

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      armed = true;
      hydrateVisible();
    }, { rootMargin: "600px 0px" });

    observer.observe(root);
    window.addEventListener("resize", hydrateVisible, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", hydrateVisible);
    };
  }, []);

  useEffect(() => {
    const jumpToVirtualAnchor = async (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!isProcessProofJumpDetail(detail)) return;

      const root = rootRef.current;
      if (!root) return;
      const { ScrollTrigger } = await import("@/hooks/use-gsap");
      const trigger = ScrollTrigger.getById("process-proof-cinema");
      const fallbackStart = root.getBoundingClientRect().top + window.scrollY;
      const start = trigger?.start ?? fallbackStart;
      const end = trigger?.end ?? fallbackStart + Math.max(root.offsetHeight, window.innerHeight);
      const destination = detail.id === "neden-biz" ? start : start + (end - start) * 0.5;

      if (window.__lenis) window.__lenis.scrollTo(destination, { immediate: false });
      else window.scrollTo({ top: destination, behavior: "smooth" });
    };

    window.addEventListener("mas:process-proof-jump", jumpToVirtualAnchor);
    return () => window.removeEventListener("mas:process-proof-jump", jumpToVirtualAnchor);
  }, []);

  return (
    <section
      ref={rootRef}
      className={`ppc-root ${className}`.trim()}
      aria-labelledby="process-proof-title"
      data-surface={surface}
      data-process-cinema
      data-process-proof-cinema
      data-process-progress="0"
    >
      <span id="neden-biz" className="ppc-anchor-sentinel" aria-hidden="true" data-process-anchor="start" />

      <div ref={pinRef} className="ppc-pin" data-process-pin>
        <div ref={mediaStackRef} className="ppc-media-stack" aria-hidden="true" data-process-media-stack>
          {stages.map((stage, index) => (
            <figure
              key={stage.id}
              data-process-media={stage.id}
              data-process-media-index={index}
              data-active={index === 0 ? "" : undefined}
            >
              <img data-ppc-src={stage.media} alt="" width="1600" height="896" loading="lazy" decoding="async" />
              {/* Kıvılcım yalnız "Kontrollü imalat" sahnesinde ve o sahne
                  aktifken yanar; canvas kendi IntersectionObserver'ı ile
                  ekran dışında tamamen durur. */}
              {stage.id === "machining" && <SparkParticles />}
            </figure>
          ))}
        </div>
        <div className="ppc-stripes" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => <i className="ppc-stripe" key={index} />)}
        </div>
        <header className="ppc-header">
          <p className="ppc-kicker"><span>04</span> SÜREÇ &amp; KANIT</p>
          <h2 id="process-proof-title" data-lf-cuttext>Karardan parçaya,<br /><em>kanıtla ilerleyen üretim.</em></h2>
          <div className="ppc-status" role="status" aria-live="polite">
            <span>Üretim akışı</span>
            <output ref={progressRef} aria-label="Süreç ilerlemesi">0</output>
            <span aria-hidden="true">%</span>
          </div>
        </header>

        <nav className="ppc-process-rail" aria-label="Üretim süreci aşamaları" data-process-rail>
          <ol>
            {stages.map((stage, index) => (
              <li key={stage.id}>
                <a
                  href={`#process-stage-${stage.id}`}
                  data-process-jump={stage.id}
                  data-process-stage-trigger={stage.id}
                  aria-current={index === 0 ? "step" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    commitStageSelection(index);
                  }}
                  onFocus={() => commitStageSelection(index)}
                >
                  <span>{stage.index}</span>
                  <span>{stage.eyebrow}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="ppc-stage-layout">
          <ol className="ppc-stages" aria-label="Beş aşamalı üretim ve doğrulama akışı">
            {stages.map((stage, index) => (
              <li
                id={`process-stage-${stage.id}`}
                className="ppc-stage"
                data-process-stage={stage.id}
                data-process-stage-index={index}
                data-active={index === 0 ? "" : undefined}
                key={stage.id}
              >
                <article aria-labelledby={`process-stage-title-${stage.id}`}>
                  <div className="ppc-stage-copy" data-process-copy>
                    <p><span>{stage.index}</span> {stage.eyebrow}</p>
                    {/* Mobil parite: masaüstündeki clip-reveal'in GSAP'sız karşılığı.
                        `LandingFlow`'un IN_VIEW_EFFECTS listesi bu varyantı her
                        breakpoint'te yürütüyor ve naturalFlow dalı `:not(cut)` ile
                        bunu bilerek dışarıda bırakıyor — yani mobilde ezilmez,
                        masaüstünde de çift animasyon olmaz. */}
                    <h3 id={`process-stage-title-${stage.id}`} data-lf-reveal="cut">{stage.title}</h3>
                    <p>{stage.summary}</p>
                    <Link to={stage.route}>{stage.routeLabel} <ArrowRight aria-hidden="true" /></Link>
                  </div>
                  {/* Bilerek `data-process-media` YOK: o attribute'un sayısı
                      sözleşmeyle tam 5 (e2e/process-proof-cinema.spec.ts:70).
                      Kıvılcım burada host bulamayınca "görünürse çalış" moduna
                      düşer; mobilde tüm aşamalar zaten akış içinde açık. */}
                  <figure className="ppc-stage-mobile-media" data-lf-reveal="cut">
                    <img data-ppc-src={stage.media} alt={stage.mediaAlt} width="1600" height="896" loading="lazy" decoding="async" />
                    {stage.id === "machining" && <SparkParticles />}
                  </figure>
                  <aside
                    className="ppc-proof-stage"
                    aria-label={`${stage.eyebrow} kanıtları`}
                    data-proof-stage={stage.id}
                    data-process-proof={stage.id}
                    data-active={index === 0 ? "" : undefined}
                  >
                    <p>Kontrol noktaları</p>
                    <ul>{stage.proof.map((item) => <li key={item}>{item}</li>)}</ul>
                  </aside>
                </article>
              </li>
            ))}
          </ol>
        </div>


        <span id="kabiliyetler" className="ppc-anchor-sentinel" aria-hidden="true" data-process-anchor="end" />

        <div className="ppc-proof-rail" data-proof-rail>
          <p>Ölçülebilir proses</p>
          <ul>
            <li><strong>5</strong><span>kontrollü aşama</span></li>
            <li><strong>±0.01 mm</strong><span>standart tolerans</span></li>
            <li><strong>01</strong><span>izlenebilir akış</span></li>
          </ul>
        </div>

        {showAnonymousCases && (
          <section className="ppc-cases" aria-labelledby="process-proof-cases-title" data-anonymous-cases>
            <h3 id="process-proof-cases-title">Onaylı anonim üretim örnekleri</h3>
            <ul>
              {approvedCases.map((caseStudy) => (
                <li key={caseStudy.id}>
                  <article data-approved-case-study={caseStudy.id}>
                    <p>{caseStudy.sector}</p>
                    <h4>{caseStudy.challenge}</h4>
                    <p>{caseStudy.outcome}</p>
                    {caseStudy.metrics?.length ? (
                      <dl>{caseStudy.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="ppc-cta">
          <div>
            <p>Parçanız için aynı kontrollü akışı başlatalım.</p>
            <Link to={ctaHref} data-cursor="teklif">{ctaLabel} <ArrowRight aria-hidden="true" /></Link>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default ProcessProofCinema;
