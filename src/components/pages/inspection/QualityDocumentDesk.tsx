import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { QUALITY_DOCUMENTS } from "@/content/quality-documents";

/** The cover and metadata always come from the same published PDF record. */
export function QualityDocumentDesk({ subjects }: { subjects: Record<string, string> }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(QUALITY_DOCUMENTS[0].href);
  const [expanded, setExpanded] = useState(false);
  const previewId = useId();
  const doc = QUALITY_DOCUMENTS.find((entry) => entry.href === selected) ?? QUALITY_DOCUMENTS[0];
  return (
    <section className="inspection-document-desk" data-expanded={expanded} aria-label={t("Belge inceleme masası")}>
      <div className="inspection-document-controls">
        <p className="shell-eyebrow">{t("Belge inceleme masası")}</p>
        <ol aria-label={t("Yayımlanan kalite dokümanları")}>
          {QUALITY_DOCUMENTS.map((entry, index) => (
            <li key={entry.href}>
              <button type="button" aria-pressed={doc.href === entry.href} aria-controls={previewId} onClick={() => setSelected(entry.href)}>
                <span aria-hidden="true">D{index + 1}</span> {t(entry.title)}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <figure id={previewId} className="inspection-document-preview">
        <a href={doc.href} target="_blank" rel="noopener" aria-label={t("{{title}} — PDF'i aç", { title: t(doc.title) })}>
          <img src={doc.thumb} width={doc.thumbWidth} height={doc.thumbHeight} alt={t("{{title}} — dokümanın ilk sayfası", { title: t(doc.title) })} decoding="async" />
        </a>
        <figcaption>{t(doc.title)} · {t("dokümanın ilk sayfası")}</figcaption>
      </figure>
      <div className="inspection-document-details">
        <p className="shell-eyebrow">{doc.docNo}</p>
        <h3>{t(doc.title)}</h3>
        <p>{t(subjects[doc.title])}</p>
        <dl>
          <div><dt>{t("Dil")}</dt><dd>{t("Türkçe")}</dd></div>
          <div><dt>{t("Doküman no")}</dt><dd>{doc.docNo}</dd></div>
          <div><dt>{t("Tarih")}</dt><dd>{/^\d/.test(doc.date) ? doc.date : t(doc.date)}</dd></div>
          <div><dt>{t("Sürüm")}</dt><dd>{doc.revision ?? t("Belirtilmemiş")}</dd></div>
          <div><dt>{t("Boyut")}</dt><dd>{doc.size}</dd></div>
        </dl>
        <div className="inspection-document-actions">
          <button type="button" aria-pressed={expanded} aria-controls={previewId} onClick={() => setExpanded((value) => !value)}>
            {t(expanded ? "Önizlemeyi küçült" : "Önizlemeyi büyüt")}
          </button>
          <a href={doc.href} target="_blank" rel="noopener">{t("Aç")}</a>
          <a href={doc.href} download>{t("İndir")}</a>
        </div>
      </div>
    </section>
  );
}
