import { useState } from "react";
import { useTranslation } from "react-i18next";
import { pairLocale } from "@/i18n/format";
import { ShellAction, ShellPlate } from "@/components/shell";
import { DETAIL_VISUALS } from "@/content/detail-visuals";
import { SchemaFigure } from "@/components/schemas/SchemaFigure";
import { SECTOR_SCHEMAS } from "@/components/schemas/registry";
import type { ServicePageData } from "@/data/servicePages";
import { catalogueImage } from "./catalogue-assets";

type Entry = { path: string; label: string; description: string };
export function CategoryAtlas({ entries, resolve }: { entries: Entry[]; resolve: (slug: string) => ServicePageData | undefined }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(entries[0]?.path ?? "");
  const slugOf = (entry: Entry) => entry.path.split("/").filter(Boolean).pop() ?? "";
  const matches = entries.filter((entry) => {
    const record = resolve(slugOf(entry));
    const text = `${entry.label} ${entry.description} ${record?.materials?.map((item) => item.name).join(" ") ?? ""}`;
    return text.toLocaleLowerCase(i18n.language).includes(query.toLocaleLowerCase(i18n.language))
      && (filter === "all" || (filter === "material" ? Boolean(record?.materials?.length) : Boolean(record?.technicalSpecs?.length)));
  });
  const entry = matches.find((item) => item.path === selected) ?? matches[0];
  const slug = entry ? slugOf(entry) : "";
  const record = resolve(slug);
  const image = catalogueImage(slug);
  const visual = DETAIL_VISUALS[slug];
  const Drawing = visual?.kind === "schema" ? SECTOR_SCHEMAS[visual.schema] : null;
  const lang = pairLocale(i18n.language);
  return (
    <div className="inspection-atlas shell-span-full">
      <div className="inspection-atlas-index">
        <div className="inspection-controls inspection-search">
          <label>{t("Ara")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label>{t("Kapsam")}<select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">{t("Tümü")}</option>
            <option value="material">{t("Malzeme")}</option>
            <option value="spec">{t("Teknik kayıt")}</option>
          </select></label>
          <button type="button" onClick={() => { setQuery(""); setFilter("all"); setSelected(entries[0]?.path ?? ""); }}>{t("Sıfırla")}</button>
        </div>
        <p className="shell-table-note" role="status">{matches.length} / {entries.length}</p>
        {matches.length ? <div className="inspection-catalogue-choices" role="group" aria-label={t("Bu başlık altında")}>
          {matches.map((item, index) => <button type="button" key={item.path} aria-pressed={entry?.path === item.path} onClick={() => setSelected(item.path)}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong>
          </button>)}
        </div> : <p role="status">{t("Sonuç bulunamadı")}</p>}
      </div>
      {entry && <div className="inspection-atlas-preview">
        <h3>{entry.label}</h3><p>{entry.description}</p>
        {image && <ShellPlate size="reference" plate={entry.label} caption={visual?.subject[lang] ?? entry.label} media={<img src={image.src} srcSet={image.srcSet} sizes="(max-width: 767px) 100vw, 50vw" alt="" loading="eager" />} />}
        {Drawing && visual?.kind === "schema" && <SchemaFigure drawing={Drawing} subject={visual.subject[lang]} />}
        {record?.technicalSpecs?.length ? <dl className="inspection-preview-specs">{record.technicalSpecs.slice(0, 3).map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> : null}
        <ShellAction to={entry.path} variant="primary">{entry.label}</ShellAction>
      </div>}
    </div>
  );
}
