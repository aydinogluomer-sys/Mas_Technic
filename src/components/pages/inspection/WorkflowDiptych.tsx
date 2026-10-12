import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { pairLocale } from "@/i18n/format";
import { SCHEMA_LABEL } from "@/content/detail-visuals";

type Step = { title: string; detail: string };

/** A source-driven process diagram, never a substitute facility photograph. */
export function WorkflowDiptych({ items }: { items: readonly Step[] }) {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(0);
  const detailId = useId();
  const step = items[active];
  return (
    <div className="inspection-workflow-diptych">
      <div className="inspection-workflow-index">
        <p className="shell-eyebrow">{SCHEMA_LABEL[pairLocale(i18n.language)]}</p>
        <ol aria-label={t("Üretim akışı")}>
          {items.map((item, index) => (
            <li key={item.title}>
              <button type="button" aria-pressed={active === index} aria-controls={detailId} onClick={() => setActive(index)}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </button>
              <p>{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
      <section id={detailId} className="inspection-workflow-detail" aria-label={step.title}>
        <svg className="inspection-workflow-map" viewBox="0 0 560 230" aria-hidden="true">
          <path d="M56 68H504V170H56" className="inspection-workflow-guide" />
          {items.map((item, index) => {
            const x = index < 3 ? 56 + index * 224 : 504 - (index - 3) * 224;
            const y = index < 3 ? 68 : 170;
            return (
              <g key={item.title} data-active={index === active}>
                <circle cx={x} cy={y} r="28" />
                <text x={x} y={y + 5} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
              </g>
            );
          })}
        </svg>
        <p className="inspection-workflow-number" aria-hidden="true">{String(active + 1).padStart(2, "0")}</p>
        <h3>{step.title}</h3>
        <p>{step.detail}</p>
        <p className="inspection-workflow-caption">{SCHEMA_LABEL[pairLocale(i18n.language)]}</p>
      </section>
    </div>
  );
}
