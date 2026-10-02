import { Fragment, useState } from "react";
import { ShellAction, ShellTagRow } from "@/components/shell";
import type { Material } from "@/data/materialsData";
import { familyName, figure, hardness, isSourced, UNVERIFIED_FIGURE } from "./material-figures";

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
              <th scope="col"><span className="sr-only">Karşılaştırmaya ekle</span></th>
              <th scope="col">Malzeme</th>
              <th scope="col" data-col="secondary">Aile</th>
              <th scope="col" data-numeric data-col="secondary">Yoğunluk g/cm³</th>
              <th scope="col" data-numeric data-col="secondary">Çekme MPa</th>
              <th scope="col" data-col="secondary">Sertlik</th>
              <th scope="col" data-numeric data-col="secondary">Maks. °C</th>
              <th scope="col"><span className="sr-only">Ayrıntı</span></th>
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
                        aria-label={`${material.name} — karşılaştırmaya ekle`}
                      />
                    </td>
                    <th scope="row">{material.name}</th>
                    <td data-col="secondary">{familyName(material)}</td>
                    <td data-numeric data-col="secondary" data-unverified={!isSourced(material) || undefined}>{figure(material, "density")}</td>
                    <td data-numeric data-col="secondary" data-unverified={!isSourced(material) || undefined}>{figure(material, "tensileStrength")}</td>
                    <td data-col="secondary" data-unverified={!isSourced(material) || undefined}>{hardness(material)}</td>
                    <td data-numeric data-col="secondary" data-unverified={!isSourced(material) || undefined}>{figure(material, "maxTemperature")}</td>
                    <td>
                      <button
                        type="button"
                        className="shell-row-toggle"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : material.id)}
                      >
                        {isOpen ? "Kapat" : "Ayrıntı"}
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
                              <dt>Grade / temper</dt>
                              <dd>{material.gradeTemper ?? "Belirtilmedi"}</dd>
                            </div>
                            <div>
                              <dt>Ürün formu</dt>
                              <dd>{material.productForm ?? "Belirtilmedi"}</dd>
                            </div>
                            <div>
                              <dt>Yoğunluk</dt>
                              <dd>{figure(material, "density", "g/cm³")}</dd>
                            </div>
                            <div>
                              <dt>Çekme mukavemeti</dt>
                              <dd>{figure(material, "tensileStrength", "MPa")}</dd>
                            </div>
                            <div>
                              <dt>Sertlik</dt>
                              <dd>{hardness(material)}</dd>
                            </div>
                            <div>
                              <dt>Maks. sıcaklık</dt>
                              <dd>{figure(material, "maxTemperature", "°C")}</dd>
                            </div>
                            <div>
                              <dt>Isı iletkenliği</dt>
                              <dd>{figure(material, "thermalConductivity", "W/m·K")}</dd>
                            </div>
                            <div>
                              <dt>Değer koşulu</dt>
                              <dd>{material.propertyConditions}</dd>
                            </div>
                            <div>
                              <dt>Kaynak</dt>
                              <dd>{material.source ? material.source.document : UNVERIFIED_FIGURE}</dd>
                            </div>
                          </dl>

                          <div className="shell-detail-lists">
                            <div>
                              <p className="shell-eyebrow">Öne çıkan</p>
                              <ul className="shell-detail-list">
                                {material.advantages.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="shell-eyebrow">Dikkat edilecek</p>
                              <ul className="shell-detail-list">
                                {material.limitations.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <p className="shell-eyebrow">Uygulama alanları</p>
                            <ShellTagRow
                              items={material.applications}
                              ariaLabel={`${material.name} uygulama alanları`}
                            />
                          </div>

                          <ShellAction to="/teklif-al" variant="ghost">
                            {material.name} ile teklif
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
