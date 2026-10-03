import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Arrow, Center, Datum, Lbl, Ln, SchemaSvg, Thin } from "@/components/schemas/kit";

/* PROOF01 — the signature module: one representative part, three features.
   Choosing a feature changes, together, what the drawing highlights, how the
   part is clamped / processed for it, how it is checked and what record the
   check leaves. Native buttons with `aria-pressed`; no pin, no cursor, no
   WebGL. Every panel stays in the DOM (inactive ones visually hidden), so the
   whole approach is readable without choosing anything. No value appears
   here: it is an approach, not a result. */

type FeatureKey = "datum" | "bore" | "finish";

const FEATURES: readonly { key: FeatureKey; label: string; setup: string; control: string; record: string }[] = [
  {
    key: "datum",
    label: "Referans yüzey",
    setup: "Parça ilk operasyonda bu yüzeyden bağlanır; sonraki operasyonlar aynı referansa döner.",
    control: "Düzlemlik ve diğer özelliklerin konumu bu datuma göre kontrol edilir.",
    record: "Kontrol planında datum tanımı ve ilk parça kaydı.",
  },
  {
    key: "bore",
    label: "Delik",
    setup: "Delik, datum A'ya bağlı aynı bağlamada işlenir; ara kontrolden önce takım aşınması izlenir.",
    control: "Çap iç çap ölçümüyle, konumu datum üzerinden kontrol edilir.",
    record: "Kontrol planındaki koteler için ölçüm kaydı.",
  },
  {
    key: "finish",
    label: "Yüzey bitişi",
    setup: "Son paso, resimdeki yüzey şartına göre takım ve kesme parametresiyle planlanır.",
    control: "Resimde belirtilen yüzey şartı, kontrol planında tanımlanan yöntemle doğrulanır.",
    record: "Kontrol planında yüzey şartı satırı; işe özel kayıt teslim dosyasında.",
  },
];

export const SIGNATURE_LABEL = "Temsili geometri ve kontrol yaklaşımı; gerçek ölçüm sonucu değildir.";

function SignatureDrawing({ active }: { active: FeatureKey }) {
  const { t } = useTranslation();
  const on = (key: FeatureKey) => active === key;
  return (
    <SchemaSvg label={t("Örnek parça: referans yüzey, delik ve yüzey bitişi")}>
      <Ln d="M140 80 H500 V240 H140 Z" />
      <Ln d="M140 240 H500" accent={on("datum")} />
      <Ln d="M140 80 H500" accent={on("finish")} />
      <circle cx="320" cy="160" r="40" className={on("bore") ? "sch-accent" : "sch-line"} />
      <Center d="M320 104 V216 M264 160 H376" />
      <path d="M424 62 L432 80 L448 44 H480" className={on("finish") ? "sch-accent" : "sch-thin"} />
      <Datum x={220} y={240} letter="A" dir="down" />
      {on("datum") && (
        <g>
          <Arrow d="M70 160 H134" accent />
          <Arrow d="M570 160 H506" accent />
          <Lbl x={40} y={140} size="s" accent>{t("Bağlama")}</Lbl>
        </g>
      )}
      {on("bore") && (
        <g>
          <Arrow d="M320 20 V112" accent />
          <Thin d="M280 112 H360" />
          <Lbl x={304} y={40} anchor="end" size="s" accent>{t("Takım ekseni")}</Lbl>
        </g>
      )}
      {on("finish") && (
        <g>
          <Arrow d="M150 56 H400" accent />
          <Lbl x={150} y={40} size="s" accent>{t("Son paso")}</Lbl>
        </g>
      )}
      <Lbl x={600} y={300} anchor="end" size="s">{t("Ölçek yok · değer yok")}</Lbl>
    </SchemaSvg>
  );
}

export function SignatureControl() {
  const { t } = useTranslation();
  const [active, setActive] = useState<FeatureKey>("datum");
  return (
    <figure className="tl-signature" aria-labelledby="tl-signature-title">
      <p id="tl-signature-title" className="tl-signature-eyebrow">{t("KONTROL YAKLAŞIMI — BİR ÖZELLİK SEÇİN")}</p>
      <div className="tl-signature-controls" role="group" aria-label={t("Kontrol edilecek özellik")}>
        {FEATURES.map((feature) => (
          <button
            key={feature.key}
            type="button"
            aria-pressed={active === feature.key}
            aria-controls={`tl-signature-${feature.key}`}
            onClick={() => setActive(feature.key)}
          >
            {t(feature.label)}
          </button>
        ))}
      </div>
      <div className="tl-signature-drawing">
        <SignatureDrawing active={active} />
      </div>
      <div className="tl-signature-panels">
        {FEATURES.map((feature) => (
          <dl
            key={feature.key}
            id={`tl-signature-${feature.key}`}
            data-active={active === feature.key}
            className={active === feature.key ? undefined : "tl-visually-hidden"}
            aria-label={t(feature.label)}
          >
            <div><dt>{t("ÖZELLİK")}</dt><dd>{t(feature.label)}</dd></div>
            <div><dt>{t("BAĞLAMA / PROSES")}</dt><dd>{t(feature.setup)}</dd></div>
            <div><dt>{t("KONTROL YÖNTEMİ")}</dt><dd>{t(feature.control)}</dd></div>
            <div><dt>{t("KAYIT")}</dt><dd>{t(feature.record)}</dd></div>
          </dl>
        ))}
      </div>
      <figcaption>{t(SIGNATURE_LABEL)}</figcaption>
    </figure>
  );
}
