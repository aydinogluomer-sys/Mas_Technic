import { useTranslation } from "react-i18next";
import { Arrow, Callout, Center, Datum, Dim, Hatch, Hidden, Lbl, Ln, SchemaSvg, Step, Thin } from "./kit";

/* PAGE01 — the seven pilot core-module drawings. Each shows ONE technical
   problem on a representative part; no value, tolerance or measured result. */

export function PilotFrezeleme() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Aynı parçada erişim, bağlama ve datum ilişkisi")}>
      <Ln d="M120 120 H420 V240 H120 Z" />
      <Ln d="M170 120 V160 H250 V120 M300 120 V150 H370 V120" />
      <Ln d="M420 160 H460 V210 H420" />
      <Hidden d="M420 170 H380 V200 H420" />
      <Datum x={270} y={240} letter="A" dir="down" />
      <Datum x={120} y={180} letter="B" dir="left" />
      <Arrow d="M210 40 V110" accent />
      <Arrow d="M560 110 L470 175" accent />
      <Lbl x={220} y={50}>{t("OP10 · üstten erişim")}</Lbl>
      <Lbl x={600} y={96} anchor="end">{t("OP20 · eğik erişim")}</Lbl>
      <Callout x={300} y={240} tx={360} ty={290}>{t("Bağlama yüzeyi = datum A")}</Callout>
    </SchemaSvg>
  );
}

export function PilotTornalama() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Aynı datum üzerinden çap ve salgı kontrolü")}>
      <Ln d="M80 140 H230 V180 H80 Z" />
      <Ln d="M230 125 H420 V195 H230 Z" />
      <Ln d="M420 145 H540 V175 H420 Z" />
      <Center d="M50 160 H580" />
      <Ln d="M60 160 L80 150 V170 Z M560 160 L540 150 V170 Z" />
      <Datum x={80} y={180} letter="A" dir="down" />
      <Ln d="M320 70 H350 V100 H320 Z" />
      <Thin d="M335 100 V125" />
      <Callout x={335} y={85} tx={600} ty={40} anchor="end" accent>{t("Salgı · datum A'ya göre")}</Callout>
      <Callout x={60} y={160} tx={40} ty={60} anchor="start">{t("Punta referansı")}</Callout>
      <Lbl x={80} y={270} size="s">{t("Kısa ve rijit: standart torna")}</Lbl>
      <Lbl x={80} y={295} size="s">{t("Uzun ve ince: kayar punta")}</Lbl>
    </SchemaSvg>
  );
}

export function PilotDerinDelik() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Derin delik kesiti ve kontrol yöntemleri")}>
      <Hatch d="M80 100 H560 V140 H80 Z M80 180 H560 V220 H80 Z" />
      <Ln d="M80 140 H560 M80 180 H560" />
      <Center d="M60 160 H580" />
      <Dim x1={80} y1={250} x2={560} y2={250}>{t("Boy (L)")}</Dim>
      <Dim x1={60} y1={140} x2={60} y2={180} />
      <Lbl x={40} y={130} size="s">{t("Çap (D)")}</Lbl>
      <Callout x={300} y={160} tx={60} ty={70}>{t("Çap · iç çap ölçümü")}</Callout>
      <Callout x={420} y={160} tx={600} ty={280} anchor="end">{t("Doğrusallık · plana göre")}</Callout>
      <Lbl x={40} y={30} accent>{t("L/D oranı yöntemi belirler")}</Lbl>
    </SchemaSvg>
  );
}

export function PilotFikstur() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Konumlama, tutma, erişim ve serbest bırakma")}>
      <Ln d="M100 220 H500 V250 H100 Z" />
      <Ln d="M160 140 H440 V220 H160 Z" />
      {[200, 400].map((x) => <circle key={x} cx={x} cy={226} r="6" className="sch-accent" />)}
      <circle cx="152" cy="180" r="6" className="sch-accent" />
      <Arrow d="M300 70 V132" />
      <Arrow d="M520 180 H450" />
      <Step x={200} y={270} n={1} />
      <Step x={540} y={160} n={2} />
      <Step x={300} y={50} n={3} />
      <Callout x={160} y={180} tx={60} ty={120} accent>{t("Konum pimleri")}</Callout>
      <Lbl x={330} y={300}>{t("4 · serbest bırakma kontrolü")}</Lbl>
    </SchemaSvg>
  );
}

export function PilotAnodizasyon() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("İşlem öncesi ve sonrası boyut payı, maskeleme")}>
      <Ln d="M80 120 H300 V200 H80 Z" />
      <Lbl x={80} y={100}>{t("İşleme ölçüsü")}</Lbl>
      <Arrow d="M320 160 H360" />
      <Ln d="M380 120 H600 V200 H380 Z" />
      <Ln d="M374 114 H606 V206 H374 Z" accent />
      <Thin d="M386 126 H594 V194 H386 Z" />
      <Hatch d="M540 114 H606 V206 H540 Z" />
      <Lbl x={380} y={100}>{t("Kaplama sonrası")}</Lbl>
      <Callout x={606} y={150} tx={606} ty={260} anchor="end" accent>{t("Dışa büyüme")}</Callout>
      <Callout x={386} y={180} tx={340} ty={260} anchor="end">{t("İçe nüfuz")}</Callout>
      <Callout x={570} y={114} tx={600} ty={50} anchor="end">{t("Maskelenen yüzey")}</Callout>
    </SchemaSvg>
  );
}

export function PilotKalite() {
  const { t } = useTranslation();
  const steps = [t("Kontrol planı"), t("İlk parça"), t("Ara kontrol"), t("Teslim kaydı")];
  return (
    <SchemaSvg label={t("Kontrol planından teslim kaydına")}>
      {steps.map((label, i) => {
        const x = i % 2 ? 360 : 40;
        const y = i < 2 ? 40 : 120;
        return (
          <g key={label}>
            <Ln d={`M${x} ${y} H${x + 240} V${y + 50} H${x} Z`} accent={i === 3} />
            <Lbl x={x + 120} y={y + 31} anchor="middle" size="s">{label}</Lbl>
          </g>
        );
      })}
      <Arrow d="M282 65 H356" />
      <Arrow d="M480 92 V105 H160 V116" />
      <Arrow d="M282 145 H356" />
      <Hidden d="M40 200 H600 V240 H40 Z" />
      <Lbl x={56} y={226} size="s">{t("Örnek şablon · bu sayfada")}</Lbl>
      <Ln d="M40 256 H600 V296 H40 Z" />
      <Lbl x={56} y={282} size="s">{t("İşe özel kayıt · teslimde")}</Lbl>
    </SchemaSvg>
  );
}

export function PilotDfm() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("İç köşe, cep ve bağlama üzerinde üç sorun")}>
      <Ln d="M40 90 H300 V250 H40 Z" />
      <Ln d="M70 120 H170 V210 H70 Z" />
      <Ln d="M210 120 H250 V210 H210 Z" />
      <Hidden d="M40 250 V270 H300 V250" />
      <Step x={70} y={120} n={1} />
      <Step x={230} y={110} n={2} />
      <Step x={170} y={262} n={3} />
      <Lbl x={330} y={110}>{t("1 · Sivri iç köşe")}</Lbl>
      <Lbl x={330} y={130} size="s" accent>{t("Köşe = takım yarıçapı")}</Lbl>
      <Lbl x={330} y={170}>{t("2 · Derin dar cep")}</Lbl>
      <Lbl x={330} y={190} size="s" accent>{t("Cep oranını ayarla")}</Lbl>
      <Lbl x={330} y={230}>{t("3 · Bağlama yüzeyi yok")}</Lbl>
      <Lbl x={330} y={250} size="s" accent>{t("Bağlama yüzeyi ekle")}</Lbl>
    </SchemaSvg>
  );
}
