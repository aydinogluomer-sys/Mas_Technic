import { Fragment, useState } from "react";
import { ShellAction, ShellTagRow } from "@/components/shell";
import type { Material } from "@/data/materialsData";
import { PRICE_BAND } from "./material-figures";

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

   Columns marked `data-col="secondary"` are hidden below 768px with
   `display:none`, not with a clip: the value stays available in the disclosure
   panel, and `display:none` removes the cell from the accessibility tree too,
   so a screen reader is not read a column the layout has dropped.
   ══════════════════════════════════════════════════════════════════════════ */

function Gauge({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <span className="shell-gauge" role="img" aria-label={`${label}: ${value}/${max}`}>
      {Array.from({ length: max }, (_, index) => (
        <span key={index} data-on={index < value || undefined} />
      ))}
    </span>
  );
}

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
              <th scope="col" data-numeric>Yoğunluk g/cm³</th>
              <th scope="col" data-numeric>Çekme MPa</th>
              <th scope="col" data-col="secondary">Sertlik</th>
              <th scope="col" data-numeric data-col="secondary">Maks. °C</th>
              <th scope="col" data-col="secondary">İşlenebilirlik</th>
              <th scope="col" data-col="secondary">Fiyat bandı</th>
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
                    <td data-col="secondary">{material.subcategory}</td>
                    <td data-numeric>{material.density}</td>
                    <td data-numeric>{material.tensileStrength}</td>
                    <td data-col="secondary">{material.hardness}</td>
                    <td data-numeric data-col="secondary">{material.maxTemperature}</td>
                    <td data-col="secondary">
                      <Gauge value={material.machinability} label="İşlenebilirlik" />
                    </td>
                    <td data-col="secondary">{PRICE_BAND[material.priceCategory]}</td>
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
                      <td colSpan={10} className="shell-disclosure-panel">
                        <div className="shell-detail">
                          <p className="shell-detail-lede">{material.description}</p>

                          <dl className="shell-detail-figures">
                            <div>
                              <dt>Sertlik</dt>
                              <dd>{material.hardness}</dd>
                            </div>
                            <div>
                              <dt>Maks. sıcaklık</dt>
                              <dd>{material.maxTemperature} °C</dd>
                            </div>
                            <div>
                              <dt>Isı iletkenliği</dt>
                              <dd>{material.thermalConductivity} W/m·K</dd>
                            </div>
                            <div>
                              <dt>Fiyat bandı</dt>
                              <dd>{PRICE_BAND[material.priceCategory]}</dd>
                            </div>
                            <div>
                              <dt>İşlenebilirlik</dt>
                              <dd><Gauge value={material.machinability} label="İşlenebilirlik" /></dd>
                            </div>
                            <div>
                              <dt>Korozyon direnci</dt>
                              <dd><Gauge value={material.corrosionResistance} label="Korozyon direnci" /></dd>
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
