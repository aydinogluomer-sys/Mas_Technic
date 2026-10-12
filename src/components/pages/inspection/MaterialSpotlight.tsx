import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Material, MaterialCategoryPage } from "@/data/materialsData";
import { familyName, figure, hardness, sourceDocuments, UNVERIFIED_FIGURE } from "@/components/pages/material-figures";
import { localDecimals } from "@/i18n/format";

/** Local inspection only: choosing a record never changes the register or RFQ. */
export function MaterialSpotlight({ materials, families }: { materials: readonly Material[]; families: readonly MaterialCategoryPage[] }) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [selectedId, setSelectedId] = useState(materials[0]?.id ?? "");
  const selected = materials.find((material) => material.id === selectedId) ?? materials[0];
  if (!selected) return <p className="shell-note">{t("Bu filtreyle kayıt bulunamadı")}</p>;
  const n = (value: string) => localDecimals(t(value), i18n.language);
  const documents = sourceDocuments(selected);
  const rows = [
    [t("Yoğunluk (g/cm³)"), n(figure(selected, "density"))],
    [t("Çekme mukavemeti (MPa)"), n(figure(selected, "tensileStrength"))],
    [t("Sertlik"), n(hardness(selected))],
    [t("Isı iletkenliği (W/m·K)"), n(figure(selected, "thermalConductivity"))],
    [t("Maks. sıcaklık (°C)"), n(figure(selected, "maxTemperature"))],
  ];
  return (
    <section className="inspection-material-spotlight" aria-label={t("Malzeme kaydı")}>
      <div className="inspection-material-identity">
        <label className="inspection-control-label" htmlFor={id}>{t("Malzeme kaydı")}
          <select id={id} value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>
            {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
          </select>
        </label>
        <div aria-live="polite">
          <p className="shell-eyebrow">{familyName(selected, families)}</p>
          <h2 className="inspection-material-name">{selected.name}</h2>
          <p className="shell-note">{selected.description}</p>
          <dl className="inspection-preview-specs">
            <div><dt>{t("Grade / temper")}</dt><dd>{selected.gradeTemper ?? t("Belirtilmedi")}</dd></div>
            <div><dt>{t("Ürün formu")}</dt><dd>{selected.productForm ? t(selected.productForm) : t("Belirtilmedi")}</dd></div>
          </dl>
        </div>
      </div>
      <div className="inspection-material-properties" aria-live="polite">
        <dl className="inspection-preview-specs">
          {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <div className="inspection-material-source">
          <p className="shell-eyebrow">{t("Kaynak")}</p>
          <p className="shell-note">{documents.join(" · ") || t(UNVERIFIED_FIGURE)}</p>
          <p className="shell-eyebrow">{t("Değer koşulu")}</p>
          <p className="shell-note">{selected.propertyConditions}</p>
        </div>
      </div>
    </section>
  );
}
