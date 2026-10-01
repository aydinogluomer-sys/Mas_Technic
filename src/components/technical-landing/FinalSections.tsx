import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowLeft, ArrowRight, Loader2, UploadCloud } from "lucide-react";
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
import manifesto from "@/assets/hero-tolerans-hassasiyet.webp";
import manifesto640 from "@/assets/hero-tolerans-hassasiyet-640.webp";
import manifesto960 from "@/assets/hero-tolerans-hassasiyet-960.webp";
import manifesto1600 from "@/assets/hero-tolerans-hassasiyet-1600.webp";
import manifestoPortrait from "@/assets/hero-tolerans-hassasiyet-portrait.webp";
import manifestoPortrait640 from "@/assets/hero-tolerans-hassasiyet-portrait-640.webp";
import { coverSizes, responsive } from "@/components/BlurImage";
import {
  qualityCertificates, referenceLogos,
  rfqSteps, technicalFaqs, technicalResources,
} from "@/data/technicalLandingData";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import { CAD_ACCEPT_ATTR, CAD_FORMAT_HINT, useCadHandoff } from "@/hooks/useCadHandoff";
import { upper } from "@/i18n/upper";
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

/* The manifesto picture is the one 2400-wide source on the site, so it carries
   a 640/960/1600 ladder under it (`scripts/assets/make-derivatives.mjs`).
   `.tl-manifesto-body` is a full-band box, `min-height` 440px (520 on mobile),
   overscanned 72px top and bottom by `ReverseScrollSection` — 584px / 664px of
   image box — and the image is `object-fit: cover`, so on anything narrower
   than ~1108px the HEIGHT decides the source width the browser needs
   (664 x 1.787 = 1187px at 375, where only the central 333px are visible).
   That is why the mobile entry is not `100vw - 42px`. Band widths measured:
   333 at 375, 710 at 768, 1214 at 1280, 1374 at 1440, 1534 at the 1600 sheet.

   PHASE 10-2b — 375 ART DIRECTION. At 375 the landscape source, cover-fitted
   by height, showed only its central 28% (x 36–64%): one jaw and the block's
   corner, no scale — the inventory's one CUT verdict. Below 768px a `<source>`
   serves a PORTRAIT cut of the same photograph (800×1342, the caliper column:
   scale, both jaws, the pin on the granite — `crop=800:1342:1360:0`, never
   recoloured) so the measuring idea survives under the headline. In the
   333×664 box that portrait is fitted by height too, but at 0.596:1 it shows
   x 8–92% of itself. It also drops the 375 fetch from a 1600-wide candidate
   (~1186px of source needed) to 640. `display: contents` keeps the `<picture>`
   out of the box tree so `.tl-manifesto img` and `[data-reverse-scroll-content]`
   size the `<img>` exactly as before; the desktop candidates are untouched. */
const manifestoImage = responsive(2400, 1343, manifesto, [manifesto640, 640], [manifesto960, 960], [manifesto1600, 1600]);
const MANIFESTO_SIZES = coverSizes(2400 / 1343, "440px + 144px", [
  ["(max-width: 767px)", "calc(100vw - 42px)", "520px + 144px"],
  ["(max-width: 1180px)", "calc(100vw - 58px)"],
  [null, "min(calc(100vw - 66px), 1534px)"],
]);
const MANIFESTO_PORTRAIT_MEDIA = "(max-width: 767px)";
const manifestoPortraitImage = responsive(800, 1342, manifestoPortrait, [manifestoPortrait640, 640]);
/* Same cover rule, portrait aspect: max(band width, 664px × 0.596) = 396px at
   375 — 640 at 1×, the 800 source at 2×. */
const MANIFESTO_PORTRAIT_SIZES = coverSizes(800 / 1342, "520px + 144px", [[null, "calc(100vw - 42px)"]]);

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
    <TechnicalSectionFrame no="08" id="sektorler" label="SEKTÖRLER" className="tl-sectors" ariaLabel={t("Çalıştığımız sektörler")}>
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

export function MeasurementManifesto() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="09" label="MANİFESTO" className="tl-manifesto" labelledBy="tl-manifesto-title">
      <div className="tl-manifesto-body">
        <ReverseScrollSection>
          <picture style={{ display: "contents" }}>
            <source
              media={MANIFESTO_PORTRAIT_MEDIA}
              srcSet={manifestoPortraitImage.srcSet}
              sizes={MANIFESTO_PORTRAIT_SIZES}
              width={manifestoPortraitImage.width}
              height={manifestoPortraitImage.height}
            />
            {/* PHASE 10-3 — `alt=""`. The picture is the band's ground: it
                sits behind a 97%-opaque scrim under a headline whose whole
                subject is measuring ("HASSASİYET İDDİA EDİLMEZ. ÖLÇÜLÜR."),
                and a caliper on a pin is that sentence drawn, not new
                information. The old alt said so a second time. */}
            <img
              src={manifestoImage.src}
              srcSet={manifestoImage.srcSet}
              sizes={MANIFESTO_SIZES}
              alt=""
              width={manifestoImage.width}
              height={manifestoImage.height}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </ReverseScrollSection>
        <Link className="tl-image-link" to="/kabiliyetler/tolerans-hassasiyet" aria-label={t("Tolerans & Hassasiyet")} />
        <div className="tl-manifesto-copy">
          <h2 id="tl-manifesto-title">{t("HASSASİYET")}<br />{t("İDDİA EDİLMEZ.")}<br /><strong>{t("ÖLÇÜLÜR.")}</strong></h2>
          <p>{t("Ölçer, kaydeder, raporlar ve teslim ederiz.")}</p>
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
    <TechnicalSectionFrame no="10" id="kalite" label="KALİTE DOSYASI" className="tl-quality" labelledBy="tl-quality-title">
      <div className="tl-quality-body">
        <h2 id="tl-quality-title" className="tl-visually-hidden">{t("Kalite dosyası")}</h2>
        {/* ROUND 2 — ONE WIREFRAME. Every card: code line, title, subtitle,
            the same document frame, footer line. The three certificates were
            text-only and the three records carried three different drawings,
            so the strip read as six unrelated tiles. Three certificates, and
            only three: `USER_INPUTS.md` §C records AS9100D and IATF 16949 as
            NONE. The documents behind card 06 are the four real PDFs in §H,
            downloadable from the KAYNAKLAR list in band 12. */}
        <div className="tl-quality-strip">
          {[
            ...qualityCertificates.map(({ code, name }) => ({ title: code, sub: name, foot: "YÖNETİM SİSTEMİ BELGESİ" })),
            { title: "ÖLÇÜM KAYDI", sub: "Kontrol planına göre", foot: "ÜRETİM KAYDI" },
            { title: "MALZEME İZLENEBİLİRLİĞİ", sub: "Parti ve döküm kaydı", foot: "ÜRETİM KAYDI" },
            { title: "KALİTE DOSYASI", sub: "Kalite politikası · Ölçüm ekipmanları · Paketleme · Tedarikçi kuralları", foot: "KAYNAKLAR BÖLÜMÜNDEN İNDİRİLEBİLİR" },
          ].map((card, index) => (
            <article className="tl-cert" key={card.title}>
              <p className="tl-cert-code" aria-hidden="true">Q-{String(index + 1).padStart(2, "0")}</p>
              <h3>{caps(card.title)}</h3>
              <p>{caps(card.sub)}</p>
              <div className="tl-cert-doc" aria-hidden="true">
                {Array.from({ length: 9 }, (_, row) => <i key={row} />)}
              </div>
              <p className="tl-cert-foot">{caps(card.foot)}</p>
            </article>
          ))}
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}

/** 11 — Referans bandı. */
export function ReferenceBand() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="11" label="REFERANSLAR" className="tl-references" ariaLabel={t("Referanslar")}>
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
    <TechnicalSectionFrame no="12" id="sss" label="SSS" className="tl-faq-band" labelledBy="tl-faq-title">
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
        {/* The four documents were real and publishable (§H) the whole time.
            They were rendered as inert `<li>`s under `KAYNAKLAR HAZIRLANIYOR`
            with four invented file sizes, for files that had never been copied
            into the build. They are served from `public/belgeler/` now, and
            `scripts/claims-gate.mjs` re-measures every printed size from disk.

            The inline flex is deliberate: `.tl-resource-list li` owns the row
            layout in `technical-landing.css`, which this phase may not edit, so
            the anchor has to become the row rather than sit inside it. */}
        <div className="tl-resource">
          <h3 className="tl-resource-title">{t("KAYNAKLAR")}</h3>
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
                  <span>{t(title)}</span><em>{size}</em><ArrowDown aria-hidden="true" />
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
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { handleFile, isUploading, progress, fileName } = useCadHandoff(DRAFT_RFQ_ID);

  return (
    <TechnicalSectionFrame no="13" id="iletisim" label="RFQ" className="tl-rfq" labelledBy="tl-rfq-title">
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
