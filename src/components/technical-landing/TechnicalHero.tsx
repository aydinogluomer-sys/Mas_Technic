import { Link } from "react-router-dom";
import heroPart from "@/assets/technical-landing/hero-manifold-v1.webp";
import { heroPartFacts } from "@/data/technicalLandingData";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

/**
 * Hero ölçümlendirmesi referanstaki teknik resim dilini izler:
 * her etiket parçaya bir kılavuz çizgiyle BAĞLIDIR ve çizgi ucu ya dolu
 * ok (ölçü/datum) ya da nokta (yüzey) ile biter. Kutular ve SVG aynı
 * koordinat uzayını paylaşır — kutu yüzdesi = viewBox koordinatı / 10,
 * böylece çizgiler her ekran genişliğinde etiketlere değmeye devam eder.
 */
const VIEW_W = 1000;
const VIEW_H = 563;

export function TechnicalHero() {
  return (
    <TechnicalSectionFrame no="02" label="HERO" className="tl-hero" labelledBy="tl-hero-title">
      <div className="tl-hero-copy">
        <h1 id="tl-hero-title" data-testid="technical-hero-title">HAM GEOMETRİDEN<br />DOĞRULANMIŞ<br />HASSASİYETE</h1>
        <p>MAS TECHNIC, 5 eksen CNC teknolojileri ve sıkı kalite kontrol süreçleriyle ham geometriden doğrulanmış hassasiyete ulaştırır.</p>
        <Link to="/teklif-al" data-testid="technical-hero-cta">
          TEKLİF AL
          <svg viewBox="0 0 40 12" aria-hidden="true"><path d="M0 6h37M31 1l6 5-6 5" /></svg>
        </Link>
      </div>

      <div className="tl-part-stage" aria-label="Ölçümlendirilmiş örnek CNC manifold parçası">
        {/* Çerçeve görselin en-boy oranını birebir taşır: parça kırpılmaz ve
            ölçü etiketleri her ekran genişliğinde parçanın üstünde kalır. */}
        <div className="tl-part-frame">
          <img
            src={heroPart}
            alt="Koyu bir ölçüm masası üzerindeki hassas işlenmiş metal hidrolik manifold"
            width="1672"
            height="941"
            fetchPriority="high"
          />

          {/* Fotoğrafın siyahı rgb(1,1,2), bandın zemini rgb(7,11,13) — arada
              ton farkı olduğu için görsel bir dikdörtgen gibi duruyordu.
              `lighten` her kanalı bant siyahına yükseltir, parçanın parlak
              yüzeylerine hiç dokunmaz: dikiş kaybolur. */}
          <div className="tl-part-blend" aria-hidden="true" />

          {/* Referansta parça benekli bir granit ölçüm plakasının üzerinde
              duruyor. Fotoğrafta o doku yok; plakayı burada üretiyoruz. */}
          <div className="tl-part-ground" aria-hidden="true" />

          <svg className="tl-dimension-lines" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
            <defs>
              {/* markerUnits=userSpaceOnUse: uç boyutu çizgi kalınlığından
                  bağımsız kalsın, non-scaling-stroke ile bozulmasın. */}
              {/* Teknik resim oku: uzunluk/genişlik ~3:1 ve hafif içbükey
                  yanaklar. refX uçta olduğu için ok, yolun bittiği noktaya —
                  yani uzatma çizgisine — değer; referansta arada boşluk yok. */}
              <marker id="tl-arrow" viewBox="0 0 18 7" refX="18" refY="3.5" markerWidth="18" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                <path d="M0 0.2 18 3.5 0 6.8 3.6 3.5Z" />
              </marker>
              <marker id="tl-dot" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
                <circle cx="4" cy="4" r="2.7" />
              </marker>
            </defs>

            {/* Koordinatlar fotoğraftaki parçanın ölçülmüş siluetine bağlı:
                üst yüzey y≈124, alt oturma y≈496, sol kenar x≈465,
                sağ kenar x≈810, yükseltilmiş göbek x≈655. */}
            <g className="tl-dim-line">
              {/* Ø 28.000 — kutu altından iner, üst yüzeyde ok ile biter */}
              <path d="M580 82V120" markerEnd="url(#tl-arrow)" />

              {/* Ø 0.005 — tolerans çerçevesinden çıkıp delik yüzeyine iner */}
              <path d="M786 82L742 146" markerEnd="url(#tl-arrow)" />

              {/* 72.000 — gerçek ölçü çizgisi: uzatma çizgileri + çift ok */}
              <path className="tl-ext" d="M285 124H480M285 496H500" />
              <path d="M325 130V490" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />

              {/* ⊥ 0.010 A — kutudan dirsekle parçanın alt oturma yüzeyine.
                  Yol, 72.000 ölçü çizgisinin alt okunun altından geçer. */}
              <path d="M243 516H330L486 498" markerEnd="url(#tl-dot)" />

              {/* Ra 0.4 µm — parçanın daraldığı alt hizada, kutudan sola nokta */}
              <path d="M764 501L716 478" markerEnd="url(#tl-dot)" />

              {/* A datumu — kutudan yukarı, datum yüzeyinde ok ile biter */}
              <path d="M571 495V466" markerEnd="url(#tl-arrow)" />
            </g>
          </svg>

          <span className="tl-measure tl-measure-top">Ø 28.000 ±0.005</span>
          <span className="tl-measure tl-measure-left"><b>72.000</b><b>±0.010</b></span>
          <span className="tl-measure tl-measure-finish">Ra 0.4 µm</span>

          {/* Tolerans çerçeveleri: referansta hücrelere bölünmüş kutular */}
          {/* U+2300 ⌀ IBM Plex Mono'da yok ve minik bir yedeğe düşüyordu;
              U+00D8 Ø hem grotesk hem yedek yüzlerde tam cap yüksekliğinde. */}
          <span className="tl-fcf tl-fcf-top" aria-hidden="true"><i>Ø</i><b>0.005</b></span>
          <span className="tl-fcf tl-fcf-bottom" aria-hidden="true"><i>⊥</i><b>0.010</b><b>A</b></span>
          <span className="tl-datum" aria-hidden="true">A</span>
        </div>
      </div>

      <aside className="tl-part-passport" aria-label="Örnek parça bilgisi">
        <h2>PARÇA BİLGİSİ</h2>
        <dl>{heroPartFacts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        {/* Parçanın ortografik ön görünüşü — referansta soyut bir nişangâh
            değil, gövde hattı, ana delik ve bağlantı delikleri okunuyor. */}
        <svg viewBox="0 0 240 150" aria-hidden="true">
          <g className="tl-pp-body">
            <path d="M44 34h152v82H44z" />
            <path d="M56 46h128v58H56z" />
            <path d="M30 52h14v46H30zM196 46h16v58h-16z" />
            <path d="M60 116h120v10H60zM74 126h18v6H74zM148 126h18v6h-18z" />
          </g>
          <g className="tl-pp-bore">
            <circle cx="112" cy="75" r="27" />
            <circle cx="112" cy="75" r="21" />
            <circle cx="163" cy="90" r="14" />
            <circle cx="163" cy="90" r="9" />
          </g>
          <g className="tl-pp-holes">
            <circle cx="74" cy="52" r="7" /><circle cx="74" cy="52" r="3.4" />
            <circle cx="150" cy="52" r="7" /><circle cx="150" cy="52" r="3.4" />
            <circle cx="74" cy="100" r="7" /><circle cx="74" cy="100" r="3.4" />
            <circle cx="112" cy="44" r="4.6" /><circle cx="186" cy="60" r="4.6" />
            <circle cx="112" cy="108" r="4.6" /><circle cx="136" cy="108" r="4.6" />
          </g>
          <g className="tl-pp-dim">
            <path d="M18 34v82M14 40h8M14 110h8" />
          </g>
        </svg>
        <p>GÖRSEL / TEMSİLÎ PARÇA</p>
      </aside>
    </TechnicalSectionFrame>
  );
}
