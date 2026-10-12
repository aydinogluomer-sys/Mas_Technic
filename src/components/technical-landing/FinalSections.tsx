import { useRef, useState } from "react";
import { Link } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";
import { ArrowDown, Loader2, UploadCloud } from "lucide-react";
import manifesto from "@/assets/hero-tolerans-hassasiyet.webp";
import manifesto640 from "@/assets/hero-tolerans-hassasiyet-640.webp";
import manifesto960 from "@/assets/hero-tolerans-hassasiyet-960.webp";
import manifesto1600 from "@/assets/hero-tolerans-hassasiyet-1600.webp";
import manifestoPortrait from "@/assets/hero-tolerans-hassasiyet-portrait.webp";
import manifestoPortrait640 from "@/assets/hero-tolerans-hassasiyet-portrait-640.webp";
import { coverSizes, responsive } from "@/components/BlurImage";
import { ReverseScrollSection } from "@/components/ReverseScrollSection";
import {
  referenceLogos,
  rfqSteps, technicalFaqs, technicalResources,
} from "@/data/technicalLandingData";
import { CAD_ACCEPT_ATTR, CAD_FORMAT_HINT, useCadHandoff } from "@/hooks/useCadHandoff";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

const DRAFT_RFQ_ID = "RFQ-DRAFT-LANDING";

const manifestoImage = responsive(2400, 1343, manifesto, [manifesto640, 640], [manifesto960, 960], [manifesto1600, 1600]);
const MANIFESTO_SIZES = coverSizes(2400 / 1343, "440px + 144px", [
  ["(max-width: 767px)", "calc(100vw - 42px)", "520px + 144px"],
  ["(max-width: 1180px)", "calc(100vw - 58px)"],
  [null, "min(calc(100vw - 66px), 1534px)"],
]);
const MANIFESTO_PORTRAIT_MEDIA = "(max-width: 767px)";
const manifestoPortraitImage = responsive(800, 1342, manifestoPortrait, [manifestoPortrait640, 640]);
const MANIFESTO_PORTRAIT_SIZES = coverSizes(800 / 1342, "520px + 144px", [[null, "calc(100vw - 42px)"]]);

export { TechnicalSectors } from "./TechnicalSectors";

export function MeasurementManifesto() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="08" label="MANİFESTO" className="tl-manifesto" labelledBy="tl-manifesto-title">
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

export { QualityFile } from "./QualityFile";

export function ReferenceBand() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="10" label="REFERANSLAR" className="tl-references" ariaLabel={t("Referanslar")}>
      <ul className="tl-reference-grid">
        {referenceLogos.map(({ name, brand }) => (
          <li key={name} data-brand={brand}>{name}</li>
        ))}
      </ul>
    </TechnicalSectionFrame>
  );
}

export function FaqSection() {
  const { t } = useTranslation();
  return (
    <TechnicalSectionFrame no="12" id="sss" label="SSS" className="tl-faq-band" labelledBy="tl-faq-title">
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
        <div className="tl-resource">
          <h3 className="tl-resource-title">{t("KAYNAKLAR")}</h3>
          <ul className="tl-resource-list">
            {technicalResources.map(({ title, href, size }) => (
              <li key={href}>
                <a
                  href={href}
                  download
                  style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: "var(--tl-s4)", color: "inherit" }}
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
            {isUploading ? `${t("YÜKLENİYOR", { context: "upload" })} · %${progress}` : t("ÇİZİM DOSYANIZI SÜRÜKLEYİN")}
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
