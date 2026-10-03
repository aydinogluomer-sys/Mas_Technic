import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteData } from "@/i18n/data";
import { ShellAction, ShellTagRow } from "@/components/shell";
import type { Material } from "@/data/materialsData";
import type { SourcedProperty } from "@/data/materialsData";
import { familyName, figure, hardness, isSourced, propertySource, sourceDocuments, UNVERIFIED_FIGURE } from "./material-figures";

const SOURCE_ROWS: [SourcedProperty, string][] = [
  ["density", "Yoğunluk"],
  ["tensileStrength", "Çekme mukavemeti"],
  ["hardness", "Sertlik"],
  ["maxTemperature", "Maks. sıcaklık"],
  ["thermalConductivity", "Isı iletkenliği"],
];

/* ══════════════════════════════════════════════════════════════════════════
   THE MATERIAL REGISTER

   WHAT THIS REPLACES
   ------------------
   `bg-card border rounded-lg p-5 hover:shadow-lg hover:-translate-y-1` — one
   card per alloy, each ~360px tall, carrying an emoji (🔩 / 🧪 / 🧬), a
   colour-coded `bg-emerald-100 / amber-100 / rose-100` price pill, a `⭐` for
   "popular", two `rounded-full` progress bars and a four-cell spec grid. Two
   or three alloys fitted on screen at once, so the one thing a materials
   library is FOR — comparing figures — was impossible without opening a modal
   per material.

   WHY A TABLE
   -----------
   The data is a matrix: N alloys × the same eight properties. A table puts the
   figures in columns so they line up and can be read down, which is the entire
   reason specifications are tabulated. Thirty alloys now fit in the space three
   cards used, and the comparison the page offers is a real one.

   THE DETAIL IS A DISCLOSURE, NOT A MODAL
   ---------------------------------------
   The per-material detail used to be a shadcn `Dialog`. A dialog is portalled
   to `document.body`, outside `.shell-root`, so it inherited none of the page's
   ground and rendered as a light-theme panel over a graphite page; it also took
   the reader out of the list to read one row. An inline disclosure keeps the
   row in place, keeps the ground, and is `aria-expanded` / `aria-controls` all
   the way down.

   Columns marked `data-col="secondary"` (T03: every figure column) are hidden below 768px with
   `display:none`, not with a clip: the value stays available in the disclosure
   panel, and `display:none` removes the cell from the accessibility tree too,
   so a screen reader is not read a column the layout has dropped.

   T03 — NO SCORES, NO PRICE, NO UNSOURCED FIGURES
   -----------------------------------------------
   The 1–5 machinability gauge and the price-band column are gone: neither had
   a documented rubric, and price belongs to the quotation. Every numeric cell
   goes through `figure()`, which prints "Veri doğrulanmadı" for a record with
   no `source`; the disclosure names the grade/temper, product form, test
   conditions and source the figures depend on.
   ══════════════════════════════════════════════════════════════════════════ */

export type MaterialRegisterProps = {
  materials: Material[];
  caption: string;
  note?: string;
  /** Ids currently held for comparison. */
  selected: string[];
  onToggleSelect: (material: Material) => void;
  /** How many may be held at once; the control disables at the ceiling. */
  maxSelected: number;
};

export function MaterialRegister({
  materials,
  caption,
  note,
  selected,
  onToggleSelect,
  maxSelected,
}: MaterialRegisterProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { t } = useTranslation();
  const { materialCategories } = useSiteData();
  /* `figure()` / `hardness()` print `UNVERIFIED_FIGURE` (Turkish) for an
     unsourced record; it is translated here, a number passes through. */
  const f = (value: string) => t(value);

  return (
    <figure className="shell-table shell-register">
      <figcaption>
        <span className="shell-table-caption">{caption}</span>
        {note && <span className="shell-table-note">{note}</span>}
      </figcaption>
      <div className="shell-table-scroll">
        <table aria-label={caption}>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">{t("Karşılaştırmaya ekle")}</span></th>
              <th scope="col">{t("Malzeme")}</th>
              <th scope="col" data-col="secondary">{t("Aile")}</th>
              <th scope="col" data-numeric data-col="secondary">{t("Yoğunluk g/cm³")}</th>
              <th scope="col" data-numeric data-col="secondary">{t("Çekme MPa")}</th>
              <th scope="col" data-col="secondary">{t("Sertlik")}</th>
              <th scope="col" data-numeric data-col="secondary">{t("Maks. °C")}</th>
              <th scope="col"><span className="sr-only">{t("Ayrıntı")}</span></th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => {
              const isSelected = selected.includes(material.id);
              const isOpen = openId === material.id;
              const panelId = `material-detail-${material.id}`;
              return (
                <Fragment key={material.id}>
                  <tr data-reference={isSelected || undefined}>
                    <td>
                      <input
                        className="shell-check"
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && selected.length >= maxSelected}
                        onChange={() => onToggleSelect(material)}
                        aria-label={t("{{name}} — karşılaştırmaya ekle", { name: material.name })}
                        aria-describedby="malzeme-compare-status"
                      />
                    </td>
                    <th scope="row">{material.name}</th>
                    <td data-col="secondary">{familyName(material, materialCategories)}</td>
                    <td data-numeric data-col="secondary" data-unverified={!isSourced(material, "density") || undefined}>{f(figure(material, "density"))}</td>
                    <td data-numeric data-col="secondary" data-unverified={!isSourced(material, "tensileStrength") || undefined}>{f(figure(material, "tensileStrength"))}</td>
                    <td data-col="secondary" data-unverified={!isSourced(material, "hardness") || undefined}>{f(hardness(material))}</td>
                    <td data-numeric data-col="secondary" data-unverified={!isSourced(material, "maxTemperature") || undefined}>{f(figure(material, "maxTemperature"))}</td>
                    <td>
                      <button
                        type="button"
                        className="shell-row-toggle"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : material.id)}
                      >
                        {t(isOpen ? "Kapat" : "Ayrıntı")}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr id={panelId}>
                      <td colSpan={8} className="shell-disclosure-panel">
                        <div className="shell-detail">
                          <p className="shell-detail-lede">{material.description}</p>

                          <dl className="shell-detail-figures">
                            <div>
                              <dt>{t("Grade / temper")}</dt>
                              <dd>{material.gradeTemper ? t(material.gradeTemper) : t("Belirtilmedi")}</dd>
                            </div>
                            <div>
                              <dt>{t("Ürün formu")}</dt>
                              <dd>{material.productForm ? t(material.productForm) : t("Belirtilmedi")}</dd>
                            </div>
                            <div>
                              <dt>{t("Yoğunluk")}</dt>
                              <dd>{f(figure(material, "density", "g/cm³"))}</dd>
                            </div>
                            <div>
                              <dt>{t("Çekme mukavemeti")}</dt>
                              <dd>{f(figure(material, "tensileStrength", "MPa"))}</dd>
                            </div>
                            <div>
                              <dt>{t("Sertlik")}</dt>
                              <dd>{f(hardness(material))}</dd>
                            </div>
                            <div>
                              <dt>{t("Maks. sıcaklık")}</dt>
                              <dd>{f(figure(material, "maxTemperature", "°C"))}</dd>
                            </div>
                            <div>
                              <dt>{t("Isı iletkenliği")}</dt>
                              <dd>{f(figure(material, "thermalConductivity", "W/m·K"))}</dd>
                            </div>
                            <div>
                              <dt>{t("Değer koşulu")}</dt>
                              <dd>{material.propertyConditions}</dd>
                            </div>
                            <div>
                              <dt>{t("Kaynak")}</dt>
                              <dd>{sourceDocuments(material).length ? sourceDocuments(material).join(" · ") : t(UNVERIFIED_FIGURE)}</dd>
                            </div>
                          </dl>

                          {material.propertySources && (
                            /* E1 — every published figure with where it was read
                               and under which condition; a property the
                               datasheet does not give stays unverified above. */
                            <dl className="shell-detail-figures shell-detail-sources" aria-label={t("Değerlerin kaynağı")}>
                              {SOURCE_ROWS.map(([key, label]) => {
                                const item = propertySource(material, key);
                                if (!item) return null;
                                return (
                                  <div key={key}>
                                    <dt>{t(label)}</dt>
                                    <dd>
                                      <a href={item.url} target="_blank" rel="noopener noreferrer">{item.publisher} — {item.document}</a>
                                      {item.version ? ` (${t(item.version)})` : ""}; {t(item.locator)}. {t(item.condition)}.
                                    </dd>
                                  </div>
                                );
                              })}
                            </dl>
                          )}
                          {material.propertySources && (
                            <p className="shell-table-note">
                              {t("Kaynaklar, malzeme sınıfının üreticinin yayımladığı teknik verisidir; tedarikçiyi ya da gelen malzemenin sertifikasını göstermez. Parçanız için geçerli değer, malzeme sertifikasındaki değerdir.")}
                            </p>
                          )}

                          <div className="shell-detail-lists">
                            <div>
                              <p className="shell-eyebrow">{t("Öne çıkan")}</p>
                              <ul className="shell-detail-list">
                                {material.advantages.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="shell-eyebrow">{t("Dikkat edilecek")}</p>
                              <ul className="shell-detail-list">
                                {material.limitations.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <p className="shell-eyebrow">{t("Uygulama alanları")}</p>
                            <ShellTagRow
                              items={material.applications}
                              ariaLabel={t("{{name}} uygulama alanları", { name: material.name })}
                            />
                          </div>

                          <ShellAction to="/teklif-al" variant="ghost">
                            {t("{{name}} ile teklif", { name: material.name })}
                          </ShellAction>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
