import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroPart from "@/assets/technical-landing/hero-manifold-v1.webp";
import { heroPartFacts } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

const annotations = [
  { className: "tl-measure tl-measure-top", label: "⌀ 28.000 ±0.005" },
  { className: "tl-measure tl-measure-left", label: "72.000 ±0.010" },
  { className: "tl-measure tl-measure-bottom", label: "⊥ 0.010 A" },
  { className: "tl-measure tl-measure-finish", label: "Ra 0.4 μm" },
] as const;

export function TechnicalHero() {
  return (
    <>
      <TechnicalSectionFrame no="02" label="HERO" className="tl-hero" labelledBy="tl-hero-title">
        <div className="tl-hero-copy">
          <h1 id="tl-hero-title" data-testid="technical-hero-title">HAM GEOMETRİDEN<br />DOĞRULANMIŞ<br />HASSASİYETE</h1>
          <p>MAS TECHNIC, 5 eksen CNC teknolojileri ve sıkı kalite kontrol süreçleriyle ham geometriden doğrulanmış hassasiyete ulaştırır.</p>
          <Link to="/teklif-al" data-testid="technical-hero-cta">TEKLİF AL <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="tl-part-stage" aria-label="Ölçümlendirilmiş örnek CNC manifold parçası">
          {/* Çerçeve görselin en-boy oranını birebir taşır: parça kırpılmaz ve
              ölçü etiketleri her ekran genişliğinde parçanın üstünde kalır. */}
          <div className="tl-part-frame">
          <img src={heroPart} alt="Koyu bir ölçüm masası üzerindeki hassas işlenmiş metal hidrolik manifold" width="1672" height="941" fetchPriority="high" />
          <svg className="tl-dimension-lines" viewBox="0 0 1000 650" aria-hidden="true">
            <path d="M332 94H676M332 80v28M676 80v28M286 176V503M270 176h30M270 503h30M402 540h300M402 526v28M702 526v28M704 246h152v112" />
            <circle cx="676" cy="94" r="4" /><circle cx="286" cy="176" r="4" /><circle cx="704" cy="246" r="4" />
          </svg>
          {annotations.map((annotation) => <span key={annotation.label} className={annotation.className}>{annotation.label}</span>)}
          <span className="tl-fcf" aria-hidden="true"><i>⌀</i><b>0.005</b></span>
          <span className="tl-datum" aria-hidden="true">A</span>
          </div>
        </div>
        <aside className="tl-part-passport" aria-label="Örnek parça bilgisi">
          <h2>PARÇA BİLGİSİ</h2>
          <dl>{heroPartFacts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
          <svg viewBox="0 0 180 90" aria-hidden="true"><rect x="30" y="18" width="120" height="54" /><circle cx="90" cy="45" r="21" /><circle cx="90" cy="45" r="8" /><path d="M18 45h144M90 6v78M45 26l90 38M45 64l90-38" /></svg>
          <p>GÖRSEL / TEMSİLÎ PARÇA</p>
        </aside>
      </TechnicalSectionFrame>
    </>
  );
}
