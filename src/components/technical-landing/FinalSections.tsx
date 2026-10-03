import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Loader2, UploadCloud } from "lucide-react";
import aerospace from "@/assets/industry-aerospace.webp";
import defense from "@/assets/industry-defense.webp";
import medical from "@/assets/industry-medical.webp";
import hydraulic from "@/assets/industry-hydraulic.webp";
import automotive from "@/assets/industry-automotive.webp";
import robotics from "@/assets/industry-robotics.webp";
import marine from "@/assets/industry-marine.webp";
import piping from "@/assets/industry-piping.webp";
import hvac from "@/assets/industry-hvac.webp";
import renewable from "@/assets/industry-renewable.webp";
import oilgas from "@/assets/industry-oilgas.webp";
import power from "@/assets/industry-power.webp";
import mining from "@/assets/industry-mining.webp";
import {
  qualityCertificates, referenceLogos,
  rfqSteps, technicalFaqs,
} from "@/data/technicalLandingData";
import { CAD_ACCEPT_ATTR, CAD_FORMAT_HINT, useCadHandoff } from "@/hooks/useCadHandoff";
import { upper } from "@/i18n/upper";
import { QUALITY_DOCUMENTS } from "@/content/quality-documents";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

/* Intrinsic size per asset, measured from the file headers
   (`reports/10/asset-inventory.md` §1; `industry-hydraulic` is the 10-2b
   `crop=750:750:180:450`). One shared `1200×1200` literal was wrong for the
   hydraulic card after that crop — the aspect (1:1) happened to stay exact,
   which is why nothing moved, but the attribute is a statement about the
   file and has to be true per file. */
/* ROUND 2 — every sector, not four. The list is the Endüstriyel family's own
   sector routes (`src/components/navigation/ia.ts`), minus the "Üretim
   Çözümleri" group, which lists production modes rather than industries.
   Every sector has its own photograph (1200×1200, one aspect for the whole
   track). hvac, renewable and mining are cropped from their sources so no
   staff, facility hall or branded machine survives (§I); a sector added
   without an image still falls back to the typographic card. */
type Sector = { title: string; href: string; image?: string; width?: number; height?: number };
const sectors: Sector[] = [
  { title: "HAVACILIK & UZAY", href: "/endustriyel/havacilik-uzay", image: aerospace, width: 1200, height: 1200 },
  { title: "SAVUNMA SANAYİ", href: "/endustriyel/savunma-sanayi", image: defense, width: 1200, height: 1200 },
  { title: "MEDİKAL", href: "/endustriyel/medikal", image: medical, width: 1200, height: 1200 },
  { title: "HİDROLİK & PNÖMATİK", href: "/endustriyel/hidrolik-pnomatik", image: hydraulic, width: 750, height: 750 },
  { title: "OTOMOTİV", href: "/endustriyel/otomotiv", image: automotive, width: 1200, height: 1200 },
  { title: "ROBOTİK", href: "/endustriyel/robotik", image: robotics, width: 1200, height: 1200 },
  { title: "YELKEN & YAT SİSTEMLERİ", href: "/endustriyel/yelken-yat-sistemleri", image: marine, width: 1200, height: 1200 },
  { title: "BORU & BAĞLANTI PARÇALARI", href: "/endustriyel/boru-baglanti-parcalari", image: piping, width: 1200, height: 1200 },
  { title: "İKLİM TEKNOLOJİLERİ", href: "/endustriyel/iklim-teknolojileri", image: hvac, width: 1200, height: 1200 },
  { title: "YENİLENEBİLİR ENERJİ", href: "/endustriyel/yenilenebilir-enerji", image: renewable, width: 1200, height: 1200 },
  { title: "PETROL & GAZ", href: "/endustriyel/petrol-gaz", image: oilgas, width: 1200, height: 1200 },
  { title: "GÜÇ DAĞITIM SİSTEMLERİ", href: "/endustriyel/guc-dagitim-sistemleri", image: power, width: 1200, height: 1200 },
  { title: "MADENCİLİK EKİPMANLARI", href: "/endustriyel/madencilik-ekipmanlari", image: mining, width: 1200, height: 1200 },
];

const DRAFT_RFQ_ID = "RFQ-DRAFT-LANDING";

/* Same cover rule, portrait aspect: max(band width, 664px × 0.596) = 396px at
   375 — 640 at 1×, the 800 source at 2×. */

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
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, first: 1, last: 4 });

  /* Position is read back from the scroll port, so swipe, trackpad, keyboard
     and the arrows all report the same state. */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card?.getBoundingClientRect().width || 1;
    const visible = Math.max(1, Math.round(track.clientWidth / step));
    const first = Math.round(track.scrollLeft / step) + 1;
    setEdge({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
      first,
      last: Math.min(sectors.length, first + visible - 1),
    });
  }, []);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      track.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const page = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * track.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <TechnicalSectionFrame no="06" id="sektorler" label="SEKTÖRLER" className="tl-sectors" ariaLabel={t("Çalıştığımız sektörler")}>
      <div className="tl-sectors-body">
        <div
          ref={trackRef}
          id="tl-sector-track"
          className="tl-sector-track"
          role="region"
          aria-label={t("Sektör listesi — yatay kaydırılabilir")}
          tabIndex={0}
          data-lenis-prevent-horizontal
        >
          {sectors.map((sector, index) => (
            <Link to={sector.href} key={sector.href} className="tl-sector-card" data-typographic={sector.image ? undefined : ""}>
              {sector.image ? (
                <img src={sector.image} alt="" width={sector.width} height={sector.height} loading="lazy" decoding="async" />
              ) : (
                <span className="tl-sector-no" aria-hidden="true">{pad(index + 1)}</span>
              )}
              <div><h3>{t(sector.title)}</h3></div>
            </Link>
          ))}
        </div>
        <div className="tl-sector-controls">
          <p aria-live="polite">
            <span>{pad(edge.first)}–{pad(edge.last)}</span> / {pad(sectors.length)} {t("SEKTÖR")}
          </p>
          <div>
            <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-controls="tl-sector-track" aria-label={t("Önceki sektörler")}>
              <ArrowLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => page(1)} disabled={edge.end} aria-controls="tl-sector-track" aria-label={t("Sonraki sektörler")}>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}


/** 10 — Kalite dosyası: sertifikalar, ölçüm raporu ve doğrulama. */
export function QualityFile() {
  const { t, i18n } = useTranslation();
  /* Revision 4: the whole strip is set in capitals, language-aware (İ/ı). */
  const caps = (text: string) => upper(t(text), i18n.language);
  return (
    <TechnicalSectionFrame no="07" id="kalite" label="KALİTE DOSYASI" className="tl-quality" labelledBy="tl-quality-title">
      <div className="tl-quality-body">
        <h2 id="tl-quality-title" className="tl-visually-hidden">{t("Kalite dosyası")}</h2>
        {/* UX03 — the strip used to end in three look-alike "document"
            drawings (nine grey bars in a frame). They are gone: the two
            certificates are named as text — there is no certificate file to
            show, so nothing here may look like a scan (O03) — and the four
            permitted PDFs show their real first page, language, the date and
            revision they print, and their measured size. */}
        <div className="tl-quality-strip">
          {qualityCertificates.map(({ code, name }, index) => (
            <article className="tl-cert tl-cert--system" key={code}>
              <p className="tl-cert-code" aria-hidden="true">Q-{String(index + 1).padStart(2, "0")}</p>
              <h3>{caps(code)}</h3>
              <p>{caps(name)}</p>
              <p className="tl-cert-foot">{caps("YÖNETİM SİSTEMİ BELGESİ")}</p>
            </article>
          ))}
          {QUALITY_DOCUMENTS.map((doc) => (
            <article className="tl-cert tl-cert--doc" key={doc.href}>
              <a href={doc.href} target="_blank" rel="noopener" className="tl-cert-thumb">
                <img src={doc.thumb} width={doc.thumbWidth} height={doc.thumbHeight} alt="" loading="lazy" decoding="async" />
                <span className="tl-visually-hidden">{t("{{title}} — PDF'i aç", { title: t(doc.title) })}</span>
              </a>
              <h3>{caps(doc.title)}</h3>
              <p className="tl-cert-foot">
                {[t("Türkçe"), doc.revision ? `${t("Sürüm")} ${doc.revision}` : null, (/^\d/.test(doc.date) ? doc.date : t(doc.date)), doc.size].filter(Boolean).join(" · ")}
              </p>
            </article>
          ))}
        </div>
        <p className="tl-quality-more"><Link to="/kalite-dosyasi">{t("Kalite dosyasının tamamı")} →</Link></p>
      </div>
    </TechnicalSectionFrame>
  );
}

/** 11 — Referans bandı. */
export function ReferenceBand() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="08" label="REFERANSLAR" className="tl-references" ariaLabel={t("Referanslar")}>
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
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="10" id="sss" label="SSS" className="tl-faq-band" labelledBy="tl-faq-title">
      {/* Başlıklar 1. satırda, listeler 2. satırda: iki sütun referanstaki gibi
          aynı hizadan başlar, başlık uzunluğu değişse bile hiza bozulmaz. */}
      <div className="tl-faq-body">
        <h2 id="tl-faq-title" className="tl-faq-title">{t("Üretime geçmeden önce,")}<br /><em>{t("kritik dört yanıt.")}</em></h2>
        <div className="tl-faq">
          {technicalFaqs.map(([question, answer], index) => (
            <details key={question}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{t(question)}<i aria-hidden="true">+</i></summary>
              <p>{t(answer)}</p>
            </details>
          ))}
        </div>
        {/* UX01 — the four PDFs used to be listed here a second time; band 07
            now shows them with their real first pages, so this column points
            onward instead of repeating them. */}
        <div className="tl-resource">
          <h3 className="tl-resource-title">{t("DEVAMI")}</h3>
          <ul className="tl-resource-list">
            <li><Link to="/sss" style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: "var(--tl-s4)", color: "inherit" }}><span>{t("Tüm sık sorulan sorular")}</span><ArrowRight aria-hidden="true" /></Link></li>
            <li><Link to="/kalite-dosyasi" style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: "var(--tl-s4)", color: "inherit" }}><span>{t("Kalite dosyası ve dokümanlar")}</span><ArrowRight aria-hidden="true" /></Link></li>
          </ul>
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}

/** 13 — Teklif çağrısı. Dosya gerçekten sürükle-bırak ile alınır ve teklif formuna devredilir. */
export function RfqSection() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { handleFile, isUploading, progress, fileName } = useCadHandoff(DRAFT_RFQ_ID);

  return (
    <TechnicalSectionFrame no="11" id="iletisim" label="RFQ" className="tl-rfq" labelledBy="tl-rfq-title">
      <div className="tl-rfq-body">
        <h2 id="tl-rfq-title">{t("Bir sonraki parçanız")}<br /><em>{t("üretime hazır mı?")}</em></h2>
        <input
          ref={inputRef}
          type="file"
          className="tl-visually-hidden"
          aria-label={t("Çizim dosyası seç")}
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
          aria-label={t("Çizim dosyası yükle: dosyayı sürükleyip bırakın veya seçmek için tıklayın")}
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
            {isUploading ? `${t("YÜKLENİYOR")} · %${progress}` : t("ÇİZİM DOSYANIZI SÜRÜKLEYİN")}
            <small>{fileName || t(CAD_FORMAT_HINT)}</small>
          </span>
        </button>
        <ol>
          {rfqSteps.map((step) => (
            <li key={step.no}><b>{step.no}</b><strong>{t(step.title)}</strong><span>{t(step.line)}</span></li>
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
