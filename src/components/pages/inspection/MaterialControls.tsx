import { useTranslation } from "react-i18next";
import { useMaterialView } from "./useMaterialView";


type View = ReturnType<typeof useMaterialView>;
export function MaterialControls({ view, total, selected, limit }: { view: View; total: number; selected: number; limit: number }) {
  const { t } = useTranslation();
  return (
    <div className="inspection-register-controls">
      <div className="inspection-controls inspection-search">
        <label>{t("Malzeme")}<input type="search" value={view.query} onChange={(event) => view.setQuery(event.target.value)} /></label>
        <label>{t("Kaynak")}<select value={view.source} onChange={(event) => view.setSource(event.target.value)}>
          <option value="all">{t("Tümü")}</option>
          <option value="sourced">{t("Değerlerin kaynağı")}</option>
          <option value="unknown">{t("Veri doğrulanmadı")}</option>
        </select></label>
        <label>{t("Sırala")}<select value={view.sort} onChange={(event) => view.setSort(event.target.value)}>
          <option value="original">{t("Malzeme kaydı")}</option>
          <option value="name">{t("Malzeme")}</option>
          <option value="density-asc">{t("Yoğunluk")} ↑</option>
          <option value="density-desc">{t("Yoğunluk")} ↓</option>
          <option value="strength-desc">{t("Çekme mukavemeti")} ↓</option>
        </select></label>
        <button type="button" onClick={() => { view.setQuery(""); view.setSource("all"); view.setSort("original"); }}>{t("Sıfırla")}</button>
      </div>
      <p className="inspection-register-status" role="status">{view.rows.length} / {total} · {t("Karşılaştırma")}: {selected} / {limit}</p>
      {!view.rows.length && <p role="status">{t("Sonuç bulunamadı")}</p>}
    </div>
  );
}
