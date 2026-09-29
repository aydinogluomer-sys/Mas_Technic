import { Link } from "react-router-dom";
import heroPart from "@/assets/technical-landing/hero-manifold-v1.webp";
import { heroPartFacts } from "@/data/technicalLandingData";
import { accountLink } from "@/components/navigation/ia";
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
        <Link to={accountLink.path} className="tl-hero-nexus" data-testid="hero-nexus-login">
          <span>NEXUS</span> Müşteri girişi →
        </Link>
      </div>

      <div className="tl-part-stage" aria-label="Ölçülendirilmiş CNC manifold parçası çizimi">
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
            {/* Her kılavuz çizgisi ÖLÇTÜĞÜ etiketle aynı `tl-dim--*` adını
                taşır. Ad, `technical-landing.css` içindeki bağıntı kuralının
                dayanağı: bir ölçüye gelindiğinde o ölçünün çizgisi, kutusu ve
                pasaporttaki karşılığı birlikte aydınlanır, geri kalanı geri
                çekilir. Çizim okumanın kendisi budur — hangi sayı hangi
                yüzeyi anlatıyor. */}
            <g className="tl-dim-line">
              {/* Ø 28.000 — kutu altından iner, üst yüzeyde ok ile biter */}
              <path className="tl-dim--bore" d="M580 82V120" markerEnd="url(#tl-arrow)" />

              {/* Ø 0.010 — tolerans çerçevesinden çıkıp delik yüzeyine iner */}
              <path className="tl-dim--tol" d="M786 82L742 146" markerEnd="url(#tl-arrow)" />

              {/* 72.000 — gerçek ölçü çizgisi: uzatma çizgileri + çift ok */}
              <path className="tl-ext tl-dim--height" d="M285 124H480M285 496H500" />
              <path className="tl-dim--height" d="M325 130V490" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />

              {/* ⊥ 0.010 A — kutudan dirsekle parçanın alt oturma yüzeyine.
                  Yol, 72.000 ölçü çizgisinin alt okunun altından geçer. */}
              <path className="tl-dim--perp" d="M243 516H330L486 498" markerEnd="url(#tl-dot)" />

              {/* Ra 0.4 µm — parçanın daraldığı alt hizada, kutudan sola nokta */}
              <path className="tl-dim--finish" d="M764 501L716 478" markerEnd="url(#tl-dot)" />

              {/* A datumu — kutudan yukarı, datum yüzeyinde ok ile biter */}
              <path className="tl-dim--datum" d="M571 495V466" markerEnd="url(#tl-arrow)" />
            </g>
          </svg>

          {/* `data-dim` yalnızca bağıntının anahtarıdır; hiçbir içeriği
              gizlemez ve yeni bir sekme durağı açmaz. Bağıntı, zaten görünen
              bilgileri BİRBİRİNE bağlayan bir zenginleştirmedir — işaretçisi
              olmayan kullanıcı hiçbir şey kaybetmez. */}
          {/* Every printed tolerance is the verified floor from
              `src/content/claims.ts` (§D ±0.01 mm). The hero used to carry
              ±0.005 in three places — twice the capability MAS TECHNIC has —
              and a surface-finish value (`Ra 0.4 µm`) that `USER_INPUTS.md`
              never supplies at all. The third leader now names a datum
              feature: drawing vocabulary, asserting nothing about capability. */}
          <span className="tl-measure tl-measure-top" data-dim="bore">Ø 28.000 ±0.010</span>
          <span className="tl-measure tl-measure-left" data-dim="height"><b>72.000</b><b>±0.010</b></span>
          <span className="tl-measure tl-measure-finish" data-dim="finish">Ra 0.4 µm</span>

          {/* Tolerans çerçeveleri: referansta hücrelere bölünmüş kutular */}
          {/* U+2300 ⌀ IBM Plex Mono'da yok ve minik bir yedeğe düşüyordu;
              U+00D8 Ø hem grotesk hem yedek yüzlerde tam cap yüksekliğinde. */}
          <span className="tl-fcf tl-fcf-top" data-dim="tol" aria-hidden="true"><i>Ø</i><b>0.010</b></span>
          <span className="tl-fcf tl-fcf-bottom" data-dim="perp" aria-hidden="true"><i>⊥</i><b>0.010</b><b>A</b></span>
          <span className="tl-datum" data-dim="datum" aria-hidden="true">A</span>
        </div>
      </div>

      {/* PART CARD — after the reference sheet: a title-block card that reads
          the example part on the left (dimensions, tolerance, surface,
          material, drawing number) above its own orthographic drawing. It is
          captioned as an example, so no value in it reads as a record. The
          four `tl-pp-*` groups are the hover-correlation keys the motion
          grammar pins (e2e/landing/motion-grammar.spec.ts). */}
      <aside className="tl-part-passport" aria-label="Örnek parça bilgisi">
        <p className="tl-pp-eyebrow">ÖRNEK PARÇA — ÇİZİM OKUMASI</p>
        <h2>PARÇA BİLGİSİ</h2>
        <dl>{heroPartFacts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        <svg className="tl-pp-drawing" viewBox="0 0 240 176" aria-hidden="true">
          {/* FRONT VIEW (left) and RIGHT VIEW (right), third-angle, 1:2 */}
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
        <p>ÖN · YAN GÖRÜNÜŞ · ÖLÇEK 1:2</p>
      </aside>
    </TechnicalSectionFrame>
  );
}
