import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { qualityCertificates } from "@/data/technicalLandingData";
import { QUALITY_DOCUMENTS } from "@/content/quality-documents";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";

export function QualityFile() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [failedThumbs, setFailedThumbs] = useState<string[]>([]);
  const selected = QUALITY_DOCUMENTS[active];
  const thumbFailed = (href: string) => setFailedThumbs((previous) => previous.includes(href) ? previous : [...previous, href]);
  const metadata = (doc: typeof selected) => [t("Türkçe"), doc.revision ? `${t("Sürüm")} ${doc.revision}` : null, (/^\d/.test(doc.date) ? doc.date : t(doc.date)), doc.size].filter(Boolean).join(" · ");
  return (
    <TechnicalSectionFrame no="09" id="kalite" label="KALİTE DOSYASI" className="tl-quality tl-inspection-quality" labelledBy="tl-quality-title">
      <div className="tl-quality-body">
        <header className="tl-quality-heading"><p className="tl-operation-eyebrow">{t("KAYNAKLAR")} · PDF</p><h2 id="tl-quality-title">{t("Kalite dosyası")}</h2></header>
        <div className="tl-quality-desk">
          <div className="tl-quality-document-list" role="group" aria-label={t("Kalite dosyası")}>
            {QUALITY_DOCUMENTS.map((doc, index) => <article key={doc.href} className="tl-quality-document" data-selected={active === index}>
              <button type="button" onClick={() => setActive(index)} aria-pressed={active === index} aria-controls="tl-quality-preview">
                {!failedThumbs.includes(doc.href) && <img src={doc.thumb} width={doc.thumbWidth} height={doc.thumbHeight} alt="" loading="lazy" decoding="async" onError={() => thumbFailed(doc.href)} />}
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{t(doc.title)}</strong>
              </button>
              <p>{doc.docNo}</p><p>{metadata(doc)}</p>
              <a href={doc.href} target="_blank" rel="noopener" aria-label={t("{{title}} — PDF'i aç", { title: t(doc.title) })}>{t("PDF'i aç")}<ArrowRight aria-hidden="true" /></a>
            </article>)}
          </div>
          <section id="tl-quality-preview" className="tl-quality-preview" aria-labelledby="tl-quality-selected-title">
            <div className="tl-quality-cover">
              {failedThumbs.includes(selected.href) ? <p>{t("Önizleme yüklenemedi. PDF'i açabilirsiniz.")}</p> :
                <img key={selected.href} src={selected.thumb} width={selected.thumbWidth} height={selected.thumbHeight} alt={t(selected.title)} loading="lazy" decoding="async" onError={() => thumbFailed(selected.href)} />}
            </div>
            <div className="tl-quality-preview-meta"><h3 id="tl-quality-selected-title">{t(selected.title)}</h3><p>{selected.docNo}</p><p>{metadata(selected)}</p>
              <a href={selected.href} target="_blank" rel="noopener">{t("{{title}} — PDF'i aç", { title: t(selected.title) })}<ArrowRight aria-hidden="true" /></a>
            </div>
          </section>
        </div>
        <div className="tl-quality-system-scope">
          {qualityCertificates.map(({ code, name }) => <article key={code}><p>{t("YÖNETİM SİSTEMİ BELGESİ")}</p><h3>{code}</h3><p>{t(name)}</p></article>)}
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
