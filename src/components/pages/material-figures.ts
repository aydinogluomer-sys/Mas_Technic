import { materialCategories, type Material } from "@/data/materialsData";

/* ══════════════════════════════════════════════════════════════════════════
   MATERIAL FIGURES — the shared reading of `materialsData.ts`

   Both material surfaces (`/malzemeler` and `/malzemeler/:slug`) present the
   same numbers, and before this they formatted them twice, differently: the
   index printed `2.7 g/cm³` in a card and the category page printed a bare
   `2.7` in a four-cell grid with the unit only in the label. One reading, one
   set of units, one place to change them.

   THE RANGES ARE DERIVED, NOT AUTHORED
   ------------------------------------
   `familyRanges()` computes the family's property envelope from the SOURCED
   alloys the page is already listing (T03). That makes the hero metadata on a category page
   evidence in the strict sense used by this project: every figure in it can be
   checked against the table further down the SAME page. Nothing is asserted
   that the page does not also show.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── T03 — SOURCED OR NOT ─────────────────────────────────────────────────
   A material's numeric properties are published only when the record names a
   source (`Material.source`). Until then every figure prints
   `UNVERIFIED_FIGURE`, sorts AFTER every sourced value whatever the direction,
   and never takes part in a range. An unsourced value is not 0 and is not a
   typical value either — it is unknown to the reader.

   The 1–5 machinability / corrosion scores and the price band are not read
   here at all: there is no documented rubric behind them, and price is a
   quotation matter. `PRICE_BAND` and the gauge were removed with them. */
export const UNVERIFIED_FIGURE = "Veri doğrulanmadı";

export const isSourced = (material: Material): boolean => material.source !== null;

/** The family name a reader sees (`Kompozitler`), never the data key (`composite`). */
export function familyName(material: Material): string {
  return materialCategories.find((family) => family.subcategoryKey === material.subcategory)?.name ?? material.subcategory;
}

type NumericKey = "density" | "tensileStrength" | "maxTemperature" | "thermalConductivity";

/** A numeric property as the reader sees it: `2.7` / `2.7 g/cm³`, or the unverified label. */
export function figure(material: Material, key: NumericKey, unit = ""): string {
  if (!isSourced(material)) return UNVERIFIED_FIGURE;
  return unit ? `${material[key]} ${unit}` : String(material[key]);
}

/** Hardness is authored as text (`95 HB`, `62 HRC`) but is still a measured property. */
export function hardness(material: Material): string {
  return isSourced(material) ? material.hardness : UNVERIFIED_FIGURE;
}

/** Sort comparator: sourced values first in the requested direction, unsourced last (by name). */
export function compareFigure(key: NumericKey, direction: "asc" | "desc") {
  return (a: Material, b: Material): number => {
    const sa = isSourced(a);
    const sb = isSourced(b);
    if (sa && sb) return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    if (sa !== sb) return sa ? -1 : 1;
    return a.name.localeCompare(b.name, "tr");
  };
}

/**
 * Deliberately NOT `toLocaleString("tr-TR")`.
 *
 * MEASURED DEFECT THIS FIXES: the hero on `/malzemeler/aluminyum` printed
 * `2,65–2,83 g/cm³` while the alloy table twelve lines below it printed
 * `2.65` — the same figure with two different decimal separators on one page,
 * because the table renders the raw number and the hero went through the
 * Turkish locale. The site's own convention is the dot (`±0.01 mm`, from
 * `MINIMUM_TOLERANCE`), so the derived ranges follow the table rather than the
 * locale.
 */
const decimal = (value: number, digits = 0) => value.toFixed(digits);

/** `165–572 MPa`, or `7.85 g/cm³` when the family has one value. */
export function range(values: number[], unit: string, digits = 0): string {
  if (values.length === 0) return "—";
  const low = Math.min(...values);
  const high = Math.max(...values);
  const suffix = unit ? ` ${unit}` : "";
  return low === high
    ? `${decimal(low, digits)}${suffix}`
    : `${decimal(low, digits)}–${decimal(high, digits)}${suffix}`;
}

/** The hero metadata run for a material family, read off its own SOURCED alloys. */
export function familyRanges(materials: Material[]) {
  const sourced = materials.filter(isSourced);
  const of = (values: number[], unit: string, digits = 0) =>
    sourced.length === 0 ? UNVERIFIED_FIGURE : range(values, unit, digits);
  return [
    { label: "Yoğunluk", value: of(sourced.map((m) => m.density), "g/cm³", 2) },
    { label: "Çekme mukavemeti", value: of(sourced.map((m) => m.tensileStrength), "MPa") },
    { label: "Maks. sıcaklık", value: of(sourced.map((m) => m.maxTemperature), "°C") },
  ];
}
