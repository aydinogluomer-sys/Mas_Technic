import { useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { SchemaFigure } from "@/components/schemas/SchemaFigure";

type PlanRow = { feature: string; method: string; record: string };
/** No fabricated point coordinates: the drawing is illustrative, the relation is source text. */
export function ProfileControl({ rows, drawing: Drawing, subject }: { rows: readonly PlanRow[]; drawing?: ComponentType; subject: string }) {
  const [active, setActive] = useState(0);
  const { t } = useTranslation();
  const selected = rows[active] ?? rows[0];
  if (!selected) return null;
  return (
    <div className="inspection-profile-control shell-span-full">
      <div className="inspection-profile-drawing">
        {Drawing && <SchemaFigure drawing={Drawing} subject={subject} />}
        <p className="shell-table-note">{t("Temsili mühendislik şeması")}. {t("Bir işe özel plan, parçanın kendi teknik resmine göre bu şablon üzerinden kurulur.")}</p>
      </div>
      <div className="inspection-profile-record">
        <label className="inspection-control-label">{t("ÖZELLİK")}
          <select value={Math.min(active, rows.length - 1)} onChange={(event) => setActive(Number(event.target.value))}>
            {rows.map((row, index) => <option key={`${row.feature}-${index}`} value={index}>{row.feature}</option>)}
          </select>
        </label>
        <dl className="inspection-focus-records" aria-live="polite">
          <div><dt>{t("ÖZELLİK")}</dt><dd>{selected.feature}</dd></div>
          <div data-active><dt>{t("KONTROL YÖNTEMİ")}</dt><dd>{selected.method}</dd></div>
          <div><dt>{t("KAYIT")}</dt><dd>{selected.record}</dd></div>
        </dl>
      </div>
    </div>
  );
}
