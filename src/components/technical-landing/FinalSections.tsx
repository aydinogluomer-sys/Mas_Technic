import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, Loader2, UploadCloud } from "lucide-react";
import aerospace from "@/assets/industry-aerospace.webp";
import defense from "@/assets/industry-defense.webp";
import medical from "@/assets/industry-medical.webp";
import hydraulic from "@/assets/industry-hydraulic.webp";
import manifesto from "@/assets/hero-tolerans-hassasiyet.webp";
import reportPart from "@/assets/technical-landing/hero-manifold-v1.webp";
import {
  qualityCertificates, referenceLogos,
  rfqSteps, technicalFaqs, technicalResources,
} from "@/data/technicalLandingData";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import { CAD_ACCEPT_ATTR, CAD_FORMAT_HINT, useCadHandoff } from "@/hooks/useCadHandoff";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

const sectors = [
  ["HAVACILIK & UZAY", aerospace, "/endustriyel/havacilik-uzay"],
  ["SAVUNMA SANAYİ", defense, "/endustriyel/savunma-sanayi"],
  ["MEDİKAL", medical, "/endustriyel/medikal"],
  ["ENERJİ & HİDROLİK", hydraulic, "/endustriyel/hidrolik-pnomatik"],
] as const;

const DRAFT_RFQ_ID = "RFQ-DRAFT-LANDING";

/** Referansta her sertifikanın imzası farklı; tek bir çizim tekrar etmiyor. */
const SIGNATURE_PATHS = [
  "M4 22c10-4 13-18 18-17s2 19 8 20 9-15 14-14 3 13 8 13 8-8 12-10 14-2 18-1",
  "M3 19c6 4 9-15 14-14s2 18 8 19 10-14 15-13 5 12 11 11 12-6 17-8",
  "M5 23c4-10 10-17 14-16s1 17 7 18 8-13 13-12 5 11 11 10 12-5 17-7",
] as const;

/** Islak imza izlenimi veren dekoratif çizgi. */
function Signature({ variant = 0 }: { variant?: number }) {
  return (
    <svg className="tl-signature" viewBox="0 0 120 28" aria-hidden="true">
      <path d={SIGNATURE_PATHS[variant % SIGNATURE_PATHS.length]} />
      <path className="tl-signature-rule" d="M0 27h120" />
    </svg>
  );
}

/** Kabartma noter mührü — referansta yalnızca ilk sertifikada var. */
function EmbossSeal() {
  return (
    <svg className="tl-emboss" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" />
      <circle className="tl-emboss-teeth" cx="24" cy="24" r="19.4" strokeDasharray="1.5 3.6" />
      <circle cx="24" cy="24" r="16" />
      <circle cx="24" cy="24" r="7" />
      <path d="M24 8v8M24 32v8M8 24h8M32 24h8M12.9 12.9l5.7 5.7M29.4 29.4l5.7 5.7M35.1 12.9l-5.7 5.7M18.6 29.4l-5.7 5.7" />
    </svg>
  );
}

/**
 * Dekoratif QR dokusu. Modül dizilimi sabit tohumlu LCG ile üretilir; Math.random
 * kullanılmaz ki her render ve her test koşusu aynı deseni versin.
 */
const QR_SIZE = 29;
const QR_FINDERS = [[0, 0], [QR_SIZE - 7, 0], [0, QR_SIZE - 7]]
  .map(([x, y]) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`)
  .join("");
const QR_MODULES = (() => {
  const cells: string[] = [];
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > QR_SIZE - 9 && y < 8) || (x < 8 && y > QR_SIZE - 9);
  let seed = 0x2f6e2b1;
  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if (inFinder(x, y) || ((seed >>> 15) & 1) === 0) continue;
      cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return cells.join("");
})();

/** 08 — Hizmet verilen sektörler. */
export function TechnicalSectors() {
  return (
    <TechnicalSectionFrame no="08" id="sektorler" label="SEKTÖRLER" className="tl-sectors" ariaLabel="Çalıştığımız sektörler">
      <div className="tl-sectors-body">
        {sectors.map(([title, image, href]) => (
          <Link to={href} key={title} className="tl-sector-card">
            <img src={image} alt="" width="1024" height="1024" loading="lazy" />
            <div><h3>{title}</h3></div>
          </Link>
        ))}
      </div>
    </TechnicalSectionFrame>
  );
}

/** 09 — Manifesto. */
export function MeasurementManifesto() {
  return (
    <TechnicalSectionFrame no="09" label="MANİFESTO" className="tl-manifesto" labelledBy="tl-manifesto-title">
      <div className="tl-manifesto-body">
        <ReverseScrollSection>
          <img src={manifesto} alt="Kumpasla ölçülen hassas işlenmiş metal parça" width="1920" height="1080" loading="lazy" />
        </ReverseScrollSection>
        <div className="tl-manifesto-copy">
          <h2 id="tl-manifesto-title">HASSASİYET<br />İDDİA EDİLMEZ.<br /><strong>ÖLÇÜLÜR.</strong></h2>
          <p>Ölçer, kaydeder, raporlar ve teslim ederiz.</p>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}

/** 10 — Kalite dosyası: sertifikalar, ölçüm raporu ve doğrulama. */
export function QualityFile() {
  return (
    <TechnicalSectionFrame no="10" id="kalite" label="KALİTE DOSYASI" className="tl-quality" labelledBy="tl-quality-title" status="sample">
      <div className="tl-quality-body">
        <h2 id="tl-quality-title" className="tl-visually-hidden">Kalite dosyası</h2>
        <div className="tl-quality-strip">
          {qualityCertificates.map(({ code, name }, index) => (
            <article className="tl-cert" key={code}>
              <h3>{code}</h3>
              <p>{name}</p>
              <div className="tl-cert-sign">
                <span>
                  <Signature variant={index} />
                  <small>YETKİLİ İMZA</small>
                </span>
                {index === 0 ? <EmbossSeal /> : null}
              </div>
            </article>
          ))}

          <article className="tl-cert tl-cert-report">
            <h3>CMM ÖLÇÜM RAPORU</h3>
            <p>MT-2024-04518</p>
            <div className="tl-mini-doc" aria-hidden="true">
              <img src={reportPart} alt="" loading="lazy" />
              <div>
                {Array.from({ length: 6 }, (_, row) => (
                  <span key={row}><i /><i /></span>
                ))}
              </div>
            </div>
            <div className="tl-doc-foot" aria-hidden="true"><i /><i /></div>
          </article>

          <article className="tl-cert tl-cert-material">
            <h3>MALZEME SERTİFİKASI</h3>
            <p>EN 10204 3.1</p>
            <div className="tl-cert-table" aria-hidden="true">
              {Array.from({ length: 7 }, (_, row) => (
                <span key={row}><i /><i /><i /><i /></span>
              ))}
              <b className="tl-grade-badge">3.1</b>
            </div>
            <Signature variant={2} />
          </article>

          <article className="tl-cert tl-cert-verify">
            <h3>RAPORU DOĞRULA</h3>
            <svg className="tl-qr" viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} aria-hidden="true" shapeRendering="crispEdges">
              <path fillRule="evenodd" d={QR_FINDERS} />
              <path d={QR_MODULES} />
            </svg>
            <p>QR kodu okutunuz</p>
            <small>DOĞRULAMA SERVİSİ HAZIRLANIYOR</small>
          </article>

          <div className="tl-stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                {/* Üst yay soldan sağa (sweep=1) üstten geçer, alt yay soldan sağa (sweep=0)
                    alttan geçer; ikisi de bu yönde okunaklı çıkıyor. Yön çevrilirse harf sırası ters döner. */}
                <path id="tl-stamp-arc-top" d="M26 60a34 34 0 0 1 68 0" />
                <path id="tl-stamp-arc-bottom" d="M21 60a39 39 0 0 0 78 0" />
              </defs>
              <circle cx="60" cy="60" r="56" />
              <circle cx="60" cy="60" r="52" strokeDasharray="1.6 3.2" />
              <circle cx="60" cy="60" r="42" />
              <text className="tl-stamp-arc"><textPath href="#tl-stamp-arc-top" startOffset="50%">MAS TECHNIC</textPath></text>
              <text className="tl-stamp-arc"><textPath href="#tl-stamp-arc-bottom" startOffset="50%">ASSURED</textPath></text>
              <path d="M17 57v8M13.5 59l7 4M20.5 59l-7 4M103 57v8M99.5 59l7 4M106.5 59l-7 4" />
            </svg>
            <span>QUALITY<br />ASSURED</span>
          </div>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}

/** 11 — Referans bandı. */
export function ReferenceBand() {
  return (
    <TechnicalSectionFrame no="11" label="REFERANSLAR" className="tl-references" ariaLabel="Referanslar">
      <ul className="tl-reference-grid">
        {referenceLogos.map(({ name, brand }) => (
          <li key={name} data-brand={brand}>{name}</li>
        ))}
      </ul>
    </TechnicalSectionFrame>
  );
}

/** 12 — SSS + kaynak dizini. */
export function FaqSection() {
  return (
    <TechnicalSectionFrame no="12" id="sss" label="SSS" className="tl-faq-band" labelledBy="tl-faq-title">
      {/* Başlıklar 1. satırda, listeler 2. satırda: iki sütun referanstaki gibi
          aynı hizadan başlar, başlık uzunluğu değişse bile hiza bozulmaz. */}
      <div className="tl-faq-body">
        <h2 id="tl-faq-title" className="tl-faq-title">Üretime geçmeden önce,<br /><em>kritik dört yanıt.</em></h2>
        <div className="tl-faq">
          {technicalFaqs.map(([question, answer], index) => (
            <details key={question}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{question}<i aria-hidden="true">+</i></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <div className="tl-resource">
          <h3 className="tl-resource-title">KAYNAKLAR <small>HAZIRLANIYOR</small></h3>
          <ul className="tl-resource-list">
            {technicalResources.map(([name, size]) => (
              <li key={name}><span>{name}</span><em>{size}</em><ArrowDown aria-hidden="true" /></li>
            ))}
          </ul>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}

/** 13 — Teklif çağrısı. Dosya gerçekten sürükle-bırak ile alınır ve teklif formuna devredilir. */
export function RfqSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { handleFile, isUploading, progress, fileName } = useCadHandoff(DRAFT_RFQ_ID);

  return (
    <TechnicalSectionFrame no="13" id="iletisim" label="RFQ" className="tl-rfq" labelledBy="tl-rfq-title">
      <div className="tl-rfq-body">
        <h2 id="tl-rfq-title">Bir sonraki parçanız<br /><em>üretime hazır mı?</em></h2>
        <input
          ref={inputRef}
          type="file"
          className="tl-visually-hidden"
          aria-label="Çizim dosyası seç"
          accept={CAD_ACCEPT_ATTR}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className="tl-cad-drop"
          data-testid="technical-cad-drop"
          disabled={isUploading}
          data-dragging={isDragging ? "true" : undefined}
          aria-label="Çizim dosyası yükle: dosyayı sürükleyip bırakın veya seçmek için tıklayın"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
        >
          {isUploading ? <Loader2 className="tl-spin" aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}
          <span>
            {isUploading ? `YÜKLENİYOR · %${progress}` : "ÇİZİM DOSYANIZI SÜRÜKLEYİN"}
            <small>{fileName || CAD_FORMAT_HINT}</small>
          </span>
        </button>
        <ol>
          {rfqSteps.map((step) => (
            <li key={step.no}><b>{step.no}</b><strong>{step.title}</strong><span>{step.line}</span></li>
          ))}
        </ol>
      </div>
    </TechnicalSectionFrame>
  );
}

/* 14 — the drawing title block MOVED to `src/components/shell/SiteFooter.tsx`.

   It was the landing's footer and only the landing's. Phase 04 made it the
   site's one footer, so it is mounted by `PageShell` on every public route —
   including `/teklif-al`, which imported the old mega footer and never
   rendered it. Its four link columns are derived from
   `src/components/navigation/ia.ts` now instead of from
   `technicalLandingData.footerColumns`, so the footer cannot drift from the
   menu again; see `src/components/shell/footer-groups.ts` for what happened
   to each of `footerColumns`' entries. */
