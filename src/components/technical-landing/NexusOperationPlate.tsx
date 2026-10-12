import { useTranslation } from "react-i18next";

type Operation = "teklif" | "onay" | "uretim" | "olcum" | "sevkiyat";
const plateTitles: Record<Operation, string> = {
  teklif: "Teknik resim ve revizyon incelemesi",
  onay: "Onaylı resimden operasyon ve kontrol planına",
  uretim: "Takım yolu ve ara kontrol ilişkisi",
  olcum: "Özellik, prob ve ölçüm kaydı ilişkisi",
  sevkiyat: "Parça, paket ve teslim dosyası ilişkisi",
};

/** Schematic geometry communicates the source step, without numerical results. */
export function NexusOperationPlate({ operation }: { operation: Operation }) {
  const { t } = useTranslation();
  return (
    <figure className="tl-operation-plate" data-operation={operation}>
      <svg viewBox="0 0 680 340" role="img" aria-label={t(plateTitles[operation])}>
        <g className="tl-operation-guide" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M24 24h632v292H24z M24 292h632 M56 24v292" />
          <path d="M24 72h12 M24 124h12 M24 176h12 M24 228h12 M24 280h12" />
        </g>
        {operation === "teklif" && <g fill="none" stroke="currentColor" strokeWidth="2">
          <path className="tl-operation-surface" d="M96 52h270v214H96z" />
          <path d="M119 234h224 M258 234v32 M119 252h110 M288 252h55" />
          <path d="M132 104h168v96H132z M132 104l34-28h168v96l-34 28 M300 104l34-28" />
          <circle cx="174" cy="152" r="18" /><circle cx="258" cy="152" r="18" />
          <path className="tl-operation-accent" d="M366 124h62v36h39 M428 124v-40h94" />
          <path d="M478 139h112v78H478z M467 160h11" />
          <path className="tl-operation-accent" d="M518 171v-15a16 16 0 0132 0v15 M514 171h40v29h-40z" />
          <path d="M489 242h120 M489 258h74" />
        </g>}
        {operation === "onay" && <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M99 57h117v175H99z M117 78h80 M117 94h66 M117 187h80 M117 203h55" />
          <path d="M128 125h61v39h-61z M142 139h34" />
          <path className="tl-operation-accent" d="M216 144h48 M254 134l10 10-10 10" />
          <path className="tl-operation-surface" d="M286 118l155-42 112 58-155 46z M286 118v78l112 59 155-43v-78 M398 180v75" />
          <path className="tl-operation-accent" d="M310 130l137-36 21 11-137 36 21 11 137-36 21 11-137 36 21 11 137-36" />
          <path d="M585 73v131 M573 86h24 M573 140h24 M573 192h24 M298 276h288" />
          <circle className="tl-operation-accent" cx="585" cy="86" r="6" /><circle cx="585" cy="140" r="6" /><circle cx="585" cy="192" r="6" />
        </g>}
        {operation === "uretim" && <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M107 270h459v-30H107z M137 240v-47 M537 240v-47" />
          <path className="tl-operation-surface" d="M150 148l180-40 160 60-180 42z M150 148v54l160 65 180-44v-55 M310 210v57" />
          <path d="M352 43h76v49h-76z M364 92v28l26 25 26-25V92 M380 43V28 M400 43V28" />
          <path className="tl-operation-accent" d="M212 164l111-26 127 47 M218 177l95-21 67 25" />
          <path className="tl-operation-accent" d="M390 145v30 M375 166l-11-13 M408 168l10-14 M390 175l-12 10" />
          <path d="M510 65h87v63h-87z M521 84h58 M521 102h35 M553 128v54h-63" />
        </g>}
        {operation === "olcum" && <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M100 62h286v122 M100 62v210h328 M125 85h236v69" />
          <path d="M346 154h31v32h-31z M361 186v24" />
          <circle className="tl-operation-accent" cx="361" cy="215" r="5" />
          <path className="tl-operation-surface" d="M177 230l80-45 109 49-78 42z M177 230v37l111 43 78-40v-36 M288 276v34" />
          <ellipse className="tl-operation-accent" cx="319" cy="237" rx="19" ry="9" />
          <path className="tl-operation-accent" d="M361 215l-23 16 M338 237h105v-72h44" />
          <path d="M487 89h121v170H487z M503 112h88 M503 128h61 M503 165h88 M503 185h88 M503 205h88 M503 225h55" />
          <path className="tl-operation-accent" d="M495 165h-8" />
        </g>}
        {operation === "sevkiyat" && <g fill="none" stroke="currentColor" strokeWidth="2">
          <path className="tl-operation-surface" d="M138 168l117-38 132 50-117 42z M138 168v88l132 49 117-41v-84 M270 222v83" />
          <path d="M138 168l-41-40 117-39 41 41 M255 130l38-53 132 50-38 53 M138 168l-34 44 132 50 34-40" />
          <path className="tl-operation-accent" d="M204 162l47-16 69 26-48 17z M232 155v25 M293 162v18" />
          <path d="M470 69h132v183H470z M449 91h21 M449 91v183h132v-22 M490 94h91 M490 114h62 M490 150h91 M490 172h91 M490 194h66 M490 222h91" />
          <path className="tl-operation-accent" d="M387 222h39v-61h44 M456 151l14 10-14 10" />
          <path d="M154 280h49 M514 286h80" />
        </g>}
      </svg>
      <figcaption><span>{t("Temsilî operasyon şeması")}</span><strong>{t(plateTitles[operation])}</strong></figcaption>
    </figure>
  );
}
