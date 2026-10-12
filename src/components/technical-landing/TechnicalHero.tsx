import { Link } from "@/i18n/LocaleLink";
import heroPart from "@/assets/technical-landing/hero-manifold-v1.webp";
import heroPart480 from "@/assets/technical-landing/hero-manifold-v1-480.webp";
import heroPart800 from "@/assets/technical-landing/hero-manifold-v1-800.webp";
import heroPart1200 from "@/assets/technical-landing/hero-manifold-v1-1200.webp";
import heroPartAvif from "@/assets/technical-landing/hero-manifold-v1.avif";
import heroPartAvif480 from "@/assets/technical-landing/hero-manifold-v1-480.avif";
import heroPartAvif800 from "@/assets/technical-landing/hero-manifold-v1-800.avif";
import heroPartAvif1200 from "@/assets/technical-landing/hero-manifold-v1-1200.avif";
import { HERO_IMAGE_SIZES, heroSrcSet } from "./hero-image";
import { heroPartFacts } from "@/data/technicalLandingData";
import { useTranslation } from "react-i18next";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { useState } from "react";

import { Z } from "@/styles/z-index";
import "@/styles/hero-inspection.css";

const dimensions = [
  { key: "bore", term: "ÖLÇÜLER", value: "Ø 28.000 ±0.010", className: "tl-measure tl-measure-top" },
  { key: "height", term: "ÖLÇÜLER", value: "72.000 ±0.010", className: "tl-measure tl-measure-left" },
  { key: "finish", term: "YÜZEY", value: heroPartFacts[2][1], className: "tl-measure tl-measure-finish" },
  { key: "datum", term: "DATUM A", value: "A", className: "tl-datum" },
] as const;

export function TechnicalHero() {
  const { t } = useTranslation();
  const [dimension, setDimension] = useState<string | null>(null);
  const selected = dimensions.find(({ key }) => key === dimension);
  const inspect = (key: string) => setDimension((current) => current === key ? null : key);
  return (
    <TechnicalSectionFrame no="02" label="HERO" className={`tl-hero${dimension ? ` tl-inspect--${dimension}` : ""}`} labelledBy="tl-hero-title">
      <div className="tl-hero-copy">
        <h1 id="tl-hero-title" data-testid="technical-hero-title">{["HAM GEOMETRİDEN", "DOĞRULANMIŞ", "HASSASİYETE"].map((line, index) => <span className="inspection-line" key={line}><span>{t(line)}{index < 2 ? " " : ""}</span></span>)}</h1>
      </div>
      <div className="tl-hero-support">
        <p>{t("MAS TECHNIC; CNC frezeleme, tornalama ve tamamlayıcı işlemler için parçanızı teknik resimden üretim ve kontrol planına taşır. Geometri ve tolerans gereksinimleri incelendikten sonra üretim teklifi hazırlanır.")}</p>
        <Link to="/teklif-al" data-testid="technical-hero-cta">
          {t("TEKLİF AL")}
          <svg viewBox="0 0 40 12" aria-hidden="true"><path d="M0 6h37M31 1l6 5-6 5" /></svg>
        </Link>
      </div>
      <div className="tl-part-stage" aria-label={t("Ölçülendirilmiş CNC manifold parçası çizimi")}>
        <div className="tl-part-frame">
          <div className="tl-part-window">
            {/* One coordinate plane keeps the genuine photograph and example drawing registered. */}
            <div className="tl-part-plane">
              <picture className="tl-part-picture">
                <source type="image/avif" srcSet={heroSrcSet({ 480: heroPartAvif480, 800: heroPartAvif800, 1200: heroPartAvif1200, 1672: heroPartAvif })} sizes={HERO_IMAGE_SIZES} />
                <img src={heroPart} srcSet={heroSrcSet({ 480: heroPart480, 800: heroPart800, 1200: heroPart1200, 1672: heroPart })} sizes={HERO_IMAGE_SIZES} alt={t("Koyu bir ölçüm masası üzerindeki hassas işlenmiş metal hidrolik manifold")} width="1672" height="941" fetchPriority="high" />
              </picture>
              <svg className="tl-dimension-lines" viewBox="0 0 1000 563" aria-hidden="true" style={{ zIndex: Z.content }}>
                <defs>
                  <marker id="tl-arrow" viewBox="0 0 18 7" refX="18" refY="3.5" markerWidth="18" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0.2 18 3.5 0 6.8 3.6 3.5Z" /></marker>
                  <marker id="tl-dot" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><circle cx="4" cy="4" r="2.7" /></marker>
                </defs>
                <g className="tl-dim-line">
                  <path className="tl-dim--bore" d="M580 82V120" markerEnd="url(#tl-arrow)" />
                  <path className="tl-ext tl-dim--height" d="M285 124H480M285 496H500" />
                  <path className="tl-dim--height" d="M325 130V490" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
                  <path className="tl-dim--perp" d="M243 516H330L486 498" markerEnd="url(#tl-dot)" />
                  <path className="tl-dim--finish" d="M764 501L716 478" markerEnd="url(#tl-dot)" />
                  <path className="tl-dim--datum" d="M571 495V466" markerEnd="url(#tl-arrow)" />
                </g>
              </svg>
              {dimensions.map(({ key, value }) => <span key={key} className={`tl-part-label tl-print--${key}`} aria-hidden="true" style={{ zIndex: Z.ambientGlow }}>{t(value)}</span>)}
              <span className="tl-part-label tl-print--perp" aria-hidden="true" style={{ zIndex: Z.ambientGlow }}>⊥ 0.010 A</span>
            </div>
          </div>
          <Link className="tl-image-link" to="/kabiliyet-profilleri" aria-label={t("Kabiliyet Profilleri")} style={{ zIndex: Z.grain }} />
        </div>
        <div className="tl-part-controls">
          {dimensions.map(({ key, term, value, className }) => <button key={key} type="button" className={className} data-dim={key} aria-label={`${t(term)}: ${t(value)}`} aria-pressed={dimension === key} aria-controls="tl-inspection-drawing" aria-describedby="tl-inspection-hint" onClick={() => inspect(key)}>{t(value)}</button>)}
        </div>
      </div>
      <aside className="tl-part-passport" aria-label={t("Örnek parça bilgisi")}>
        <div className="tl-pp-heading"><p className="tl-pp-eyebrow">{t("ÖRNEK PARÇA — ÇİZİM OKUMASI")}</p>
        <h2>{t("PARÇA BİLGİSİ")}</h2></div>
        <dl>{heroPartFacts.map(([term, value]) => <div key={term}><dt>{t(term)}</dt><dd>{t(value)}</dd></div>)}</dl>
        <svg id="tl-inspection-drawing" className="tl-pp-drawing" viewBox="0 0 240 176" aria-hidden="true">
          {/* FRONT VIEW (left) and RIGHT VIEW (right). Schematic, not to scale:
              §3 removed the 1:2 scale label. */}
          <g className="tl-pp-center">
            <path d="M16 70H150M83 22V128M186 70H232M209 30V120" />
          </g>
          <g className="tl-pp-body">
            <path d="M28 34H138V112H28Z" />
            <path d="M28 46H138M28 100H138" />
            <path d="M44 112V124H122V112" />
            <path d="M190 34H228V112H190Z" />
            <path d="M190 46H228M190 100H228" />
          </g>
          <g className="tl-pp-hidden">
            <path d="M190 58H228M190 82H228M200 34V112M218 34V112" />
          </g>
          <g className="tl-pp-bore">
            <circle cx="83" cy="70" r="22" />
            <circle cx="83" cy="70" r="16" />
            <circle cx="121" cy="92" r="9" />
          </g>
          <g className="tl-pp-holes">
            <circle cx="42" cy="44" r="4" /><circle cx="124" cy="44" r="4" />
            <circle cx="42" cy="102" r="4" /><circle cx="124" cy="102" r="4" />
            <circle cx="62" cy="40" r="2.6" /><circle cx="104" cy="40" r="2.6" />
          </g>
          <g className="tl-pp-dim">
            <path d="M28 146H138M28 140V152M138 140V152" />
            <path d="M12 34V112M6 34H18M6 112H18" />
            <path d="M190 146H228M190 140V152M228 140V152" />
          </g>
          <g className="tl-pp-text">
            <text x="83" y="162" textAnchor="middle">120.00</text>
            <text x="209" y="162" textAnchor="middle">68.00</text>
            <text x="8" y="76" textAnchor="middle" transform="rotate(-90 8 73)">72.00</text>
            <text x="83" y="16" textAnchor="middle">Ø 28.000</text>
          </g>
        </svg>
        <p className="tl-pp-caption">{t("ŞEMATİK ÖN / YAN GÖRÜNÜŞ")}</p>
        <p className="tl-inspection-hint" id="tl-inspection-hint">{t("Bir ölçüyü seçin; çizimdeki karşılığını görün.")}<output aria-live="polite" aria-atomic="true">{selected ? ` ${t(selected.term)}: ${selected.value} — ${t("ŞEMATİK ÖN / YAN GÖRÜNÜŞ")}` : ""}</output></p>
      </aside>
    </TechnicalSectionFrame>
  );
}
