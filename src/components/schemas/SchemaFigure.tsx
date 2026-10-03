import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { SCHEMA_LABEL } from "@/content/detail-visuals";

/* A code-drawn schema outside a plate (pilot module, journal, profile): a
   framed 2:1 field and a caption that always starts with the honesty label. */
export function SchemaFigure({ drawing: Drawing, subject, no }: { drawing: ComponentType; subject: string; no?: string }) {
  const { i18n } = useTranslation();
  const label = SCHEMA_LABEL[i18n.language === "en" ? "en" : "tr"];
  return (
    <figure className="shell-schema-figure">
      <div className="shell-schema-frame"><Drawing /></div>
      <figcaption>
        {no && <span>{no}</span>}
        <span>{label}</span>
        <span>{subject}</span>
      </figcaption>
    </figure>
  );
}
