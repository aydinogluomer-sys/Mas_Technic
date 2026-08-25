import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, UploadCloud, Youtube } from "lucide-react";
import aerospace from "@/assets/industry-aerospace.webp";
import defense from "@/assets/industry-defense.webp";
import medical from "@/assets/industry-medical.webp";
import hydraulic from "@/assets/industry-hydraulic.webp";
import manifesto from "@/assets/hero-tolerans-hassasiyet.webp";
import reportPart from "@/assets/technical-landing/hero-manifold-v1.webp";
import {
  footerColumns, qualityCertificates, referenceLogos,
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

/** Islak imza izlenimi veren dekoratif çizgi. */
function Signature() {
  return (
    <svg className="tl-signature" viewBox="0 0 120 28" aria-hidden="true">
      <path d="M4 22c10-4 13-18 18-17s2 19 8 20 9-15 14-14 3 13 8 13 8-8 12-10 14-2 18-1" />
      <path className="tl-signature-rule" d="M0 27h120" />
    </svg>
  );
}

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
          {qualityCertificates.map(({ code, name }) => (
            <article className="tl-cert" key={code}>
              <svg className="tl-cert-seal" viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="22" />
                <circle className="tl-cert-teeth" cx="24" cy="24" r="19.4" strokeDasharray="1.5 3.6" />
                <circle cx="24" cy="24" r="16" />
                <circle cx="24" cy="24" r="7" />
                <path d="M24 8v8M24 32v8M8 24h8M32 24h8M12.9 12.9l5.7 5.7M29.4 29.4l5.7 5.7M35.1 12.9l-5.7 5.7M18.6 29.4l-5.7 5.7" />
              </svg>
              <h3>{code}</h3>
              <p>{name}</p>
              <Signature />
            </article>
          ))}

          <article className="tl-cert tl-cert-report">
            <h3>CMM ÖLÇÜM RAPORU</h3>
            <p>MT-2024-04518</p>
            <div className="tl-mini-doc" aria-hidden="true">
              <img src={reportPart} alt="" loading="lazy" />
              <div>
                {Array.from({ length: 5 }, (_, row) => (
                  <span key={row}><i /><i /></span>
                ))}
              </div>
            </div>
          </article>

          <article className="tl-cert tl-cert-material">
            <h3>MALZEME SERTİFİKASI</h3>
            <p>EN 10204 3.1</p>
            <b className="tl-grade-badge" aria-hidden="true">3.1</b>
            <Signature />
          </article>

          <article className="tl-cert tl-cert-verify">
            <h3>RAPORU DOĞRULA</h3>
            <svg className="tl-qr" viewBox="0 0 29 29" aria-hidden="true" shapeRendering="crispEdges">
              <path d="M0 0h7v7H0zM2 2h3v3H2zM22 0h7v7h-7zM24 2h3v3h-3zM0 22h7v7H0zM2 24h3v3H2z" />
              <path d="M9 0h2v2H9zM13 0h2v4h-2zM17 2h2v2h-2zM9 4h4v2H9zM19 5h3v2h-3zM0 9h2v2H0zM4 9h3v2H4zM9 9h2v3H9zM13 10h4v2h-4zM19 9h2v2h-2zM23 10h4v2h-4zM2 13h5v2H2zM11 13h2v4h-2zM15 14h3v2h-3zM20 13h2v3h-2zM25 14h2v2h-2zM0 17h3v2H0zM5 18h4v2H5zM13 17h2v2h-2zM17 18h3v2h-3zM22 17h2v2h-2zM26 18h3v2h-3zM9 21h2v2H9zM13 21h4v2h-4zM19 22h2v2h-2zM24 21h2v2h-2zM9 25h4v2H9zM15 24h2v3h-2zM19 26h4v2h-4zM26 25h3v2h-3z" />
            </svg>
            <p>QR kodu okutunuz</p>
            <small>DOĞRULAMA SERVİSİ HAZIRLANIYOR</small>
          </article>

          <div className="tl-stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" /><circle cx="60" cy="60" r="46" />
            </svg>
            <span>MAS TECHNIC<b>QUALITY<br />ASSURED</b></span>
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

/** 14 — Antet bloğu biçiminde footer. */
export function DrawingFooter() {
  return (
    <TechnicalSectionFrame as="footer" no="14" label="FOOTER" className="tl-footer" ariaLabel="Site altbilgisi">
      <div className="tl-footer-body">
        <div className="tl-footer-brand">
          <h2>HASSAS ÜRETİM.<br />KANITLANMIŞ TESLİM.</h2>
          <address>
            <p><MapPin aria-hidden="true" /><span>NOSAB Minareliçavuş Mah.<br />103. Cadde, Sk. No:12<br />Nilüfer / BURSA</span></p>
            <p><Phone aria-hidden="true" /><a href="tel:+902244824090">+90 224 482 40 90</a></p>
            <p><Mail aria-hidden="true" /><a href="mailto:info@mastechnic.com.tr">info@mastechnic.com.tr</a></p>
          </address>
        </div>
        <nav aria-label="Altbilgi navigasyonu">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map(([label, href]) => (
                href.startsWith("#")
                  ? <a key={label} href={href}>{label}</a>
                  : <Link key={label} to={href}>{label}</Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="tl-title-block">
          <div className="tl-social">
            <a href="https://www.linkedin.com/company/mas-technic" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn"><Linkedin aria-hidden="true" /></a>
            <a href="https://www.instagram.com/mastechnic" target="_blank" rel="noreferrer noopener" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
            <a href="https://www.youtube.com/@mastechnic" target="_blank" rel="noreferrer noopener" aria-label="YouTube"><Youtube aria-hidden="true" /></a>
          </div>
          <p className="tl-meta-run">
            <span>ÇİZEN: MAS TECHNIC</span><span>ÖLÇEK: 1:1</span><span>TARİH: 17.05.2024</span><span>REVİZYON: B</span><span>PAFTA: 01/12</span>
          </p>
          <p className="tl-legal">
            <Link to="/kvkk">KVKK</Link>
            <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <svg className="tl-crosshair" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 0v24M0 12h24" /></svg>
          </p>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
