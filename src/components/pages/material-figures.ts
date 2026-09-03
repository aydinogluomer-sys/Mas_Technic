import type { Material } from "@/data/materialsData";

/* ══════════════════════════════════════════════════════════════════════════
   MATERIAL FIGURES — the shared reading of `materialsData.ts`

   Both material surfaces (`/malzemeler` and `/malzemeler/:slug`) present the
   same numbers, and before this they formatted them twice, differently: the
   index printed `2.7 g/cm³` in a card and the category page printed a bare
   `2.7` in a four-cell grid with the unit only in the label. One reading, one
   set of units, one place to change them.

   THE RANGES ARE DERIVED, NOT AUTHORED
   ------------------------------------
   `familyRanges()` computes the family's property envelope from the alloys the
   page is already listing. That makes the hero metadata on a category page
   evidence in the strict sense used by this project: every figure in it can be
   checked against the table further down the SAME page. Nothing is asserted
   that the page does not also show.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Price band. Deliberately words, not colour: the old implementation used
 * `bg-emerald-100 text-emerald-800` / `amber` / `rose` pills, which encode the
 * value in hue alone (WCAG 1.4.1) and read as a consumer badge.
 */
export const PRICE_BAND: Record<Material["priceCategory"], string> = {
  low: "EKONOMİK",
  medium: "ORTA",
  high: "PREMİUM",
};

const trNumber = (value: number, digits = 0) =>
  value.toLocaleString("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** `165–572 MPa`, or `7.85 g/cm³` when the family has one value. */
export function range(values: number[], unit: string, digits = 0): string {
  if (values.length === 0) return "—";
  const low = Math.min(...values);
  const high = Math.max(...values);
  const suffix = unit ? ` ${unit}` : "";
  return low === high
    ? `${trNumber(low, digits)}${suffix}`
    : `${trNumber(low, digits)}–${trNumber(high, digits)}${suffix}`;
}

/** The hero metadata run for a material family, read off its own alloys. */
export function familyRanges(materials: Material[]) {
  return [
    { label: "Yoğunluk", value: range(materials.map((m) => m.density), "g/cm³", 2) },
    { label: "Çekme mukavemeti", value: range(materials.map((m) => m.tensileStrength), "MPa") },
    { label: "Maks. sıcaklık", value: range(materials.map((m) => m.maxTemperature), "°C") },
    { label: "İşlenebilirlik", value: `${range(materials.map((m) => m.machinability), "")} / 5` },
  ];
}
