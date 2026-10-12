import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Material } from "@/data/materialsData";
import { compareFigure, isSourced } from "../material-figures";

export function useMaterialView(materials: Material[]) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState("original");
  const { i18n } = useTranslation();
  const rows = materials.filter((item) => {
    const text = `${item.name} ${item.gradeTemper ?? ""} ${item.description} ${item.applications.join(" ")}`;
    return text.toLocaleLowerCase(i18n.language).includes(query.toLocaleLowerCase(i18n.language))
      && (source === "all" || isSourced(item) === (source === "sourced"));
  });
  if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  if (sort === "density-asc" || sort === "density-desc") rows.sort(compareFigure("density", sort === "density-asc" ? "asc" : "desc"));
  if (sort === "strength-desc") rows.sort(compareFigure("tensileStrength", "desc"));
  return { rows, query, setQuery, source, setSource, sort, setSort };
}

