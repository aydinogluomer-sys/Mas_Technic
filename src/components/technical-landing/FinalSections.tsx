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

/* ══════════════════════════════════════════════════════════════════════════
   WHAT THIS FILE NO LONGER DRAWS

   Four decorative devices were deleted in Phase 06, not restyled:

     • a wet-signature SVG under each certificate       — a forged signature
     • an embossed notary seal on the first certificate — a forged attestation
     • a seeded-LCG "QR" under `RAPORU DOĞRULA` with
       `DOĞRULAMA SERVİSİ HAZIRLANIYOR`                 — a verification
                                                          destination that
                                                          does not exist
     • a `QUALITY ASSURED` circular stamp               — a self-issued seal
                                                          with no issuing body

   Each was decorative in intent and evidentiary in effect. `IMPLEMENTATION.md`
   §13 names the fake verification destination explicitly; the other three are
   the same failure with a different geometry. The band keeps its structure —
   six cards on the paper ground — but every card now points at something that
   exists.
   ══════════════════════════════════════════════════════════════════════════ */

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
    <TechnicalSectionFrame no="10" id="kalite" label="KALİTE DOSYASI" className="tl-quality" labelledBy="tl-quality-title">
      <div className="tl-quality-body">
        <h2 id="tl-quality-title" className="tl-visually-hidden">Kalite dosyası</h2>
        <div className="tl-quality-strip">
          {/* Three certificates, and only three: `USER_INPUTS.md` §C records
              AS9100D and IATF 16949 as NONE. The card count is unchanged
              because OHSAS 18001 was permitted and simply missing. */}
          {qualityCertificates.map(({ code, name }) => (
            <article className="tl-cert" key={code}>
              <h3>{code}</h3>
              <p>{name}</p>
              <div className="tl-cert-sign">
                <span><small>YÖNETİM SİSTEMİ BELGESİ</small></span>
              </div>
            </article>
          ))}

          <article className="tl-cert tl-cert-report">
            <h3>ÖLÇÜM KAYDI</h3>
            <p>Kontrol planına göre</p>
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
            <h3>MALZEME İZLENEBİLİRLİĞİ</h3>
            <p>Parti ve döküm kaydı</p>
            <div className="tl-cert-table" aria-hidden="true">
              {Array.from({ length: 7 }, (_, row) => (
                <span key={row}><i /><i /><i /><i /></span>
              ))}
            </div>
          </article>

          {/* Where the fake verification QR stood. The documents named here are
              the four real PDFs in §H; they are downloadable from the KAYNAKLAR
              list in band 12. */}
          <article className="tl-cert tl-cert-verify">
            <h3>KALİTE DOSYASI</h3>
            <p>Kalite politikası · Ölçüm ekipmanları · Paketleme · Tedarikçi kuralları</p>
            <div className="tl-cert-table" aria-hidden="true">
              {Array.from({ length: 7 }, (_, row) => (
                <span key={row}><i /><i /><i /><i /></span>
              ))}
            </div>
            <small>KAYNAKLAR BÖLÜMÜNDEN İNDİRİLEBİLİR</small>
          </article>
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
        {/* The four documents were real and publishable (§H) the whole time.
            They were rendered as inert `<li>`s under `KAYNAKLAR HAZIRLANIYOR`
            with four invented file sizes, for files that had never been copied
            into the build. They are served from `public/belgeler/` now, and
            `scripts/claims-gate.mjs` re-measures every printed size from disk.

            The inline flex is deliberate: `.tl-resource-list li` owns the row
            layout in `technical-landing.css`, which this phase may not edit, so
            the anchor has to become the row rather than sit inside it. */}
        <div className="tl-resource">
          <h3 className="tl-resource-title">KAYNAKLAR</h3>
          <ul className="tl-resource-list">
            {technicalResources.map(({ title, href, size }) => (
              <li key={href}>
                <a
                  href={href}
                  download
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--tl-s4)",
                    color: "inherit",
                  }}
                >
                  <span>{title}</span><em>{size}</em><ArrowDown aria-hidden="true" />
                </a>
              </li>
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
