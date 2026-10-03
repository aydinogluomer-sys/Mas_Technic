import { useTranslation } from "react-i18next";
import { Arrow, Callout, Center, Datum, Dim, Hatch, Hidden, Lbl, Ln, SchemaSvg, Step, Thin } from "./kit";

/* UX05 — one explanatory drawing per journal article and per capability
   profile. Representative geometry only; no measured value or result. */

export function JournalBesEksen() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Aynı parça: üç kurulum ve tek kurulum")}>
      <Lbl x={40} y={32}>{t("3 eksen · 3 kurulum")}</Lbl>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Ln d={`M${40 + i * 95} 70 H${115 + i * 95} V130 H${40 + i * 95} Z`} />
          <Arrow d={`M${78 + i * 95} 50 V66`} />
          <Lbl x={78 + i * 95} y={155} anchor="middle" size="s">{`K${i + 1}`}</Lbl>
        </g>
      ))}
      <Lbl x={40} y={190} size="s">{t("Her kurulum yeni bir referans")}</Lbl>
      <Lbl x={380} y={32}>{t("5 eksen · 1 kurulum")}</Lbl>
      <Ln d="M420 90 H560 V170 H420 Z" accent />
      <Arrow d="M490 50 V86" accent />
      <Arrow d="M600 70 L564 104" accent />
      <Arrow d="M380 70 L416 104" accent />
      <Datum x={490} y={170} letter="A" dir="down" />
      <Lbl x={380} y={250} size="s">{t("Tüm yüzeyler tek datumdan")}</Lbl>
    </SchemaSvg>
  );
}

export function JournalMalzeme() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Malzeme seçiminin karar yolu")}>
      <Ln d="M20 130 H220 V190 H20 Z" />
      <Lbl x={120} y={156} anchor="middle" size="s">{t("Çalışma koşulu")}</Lbl>
      <Lbl x={120} y={176} anchor="middle" size="s">{t("belli mi?")}</Lbl>
      <Arrow d="M220 145 L248 95" />
      <Arrow d="M220 175 L248 225" />
      <Ln d="M250 60 H490 V120 H250 Z" />
      <Lbl x={370} y={86} anchor="middle" size="s">{t("Sıcaklık veya korozyon")}</Lbl>
      <Lbl x={370} y={106} anchor="middle" size="s" accent>{t("belirleyici")}</Lbl>
      <Ln d="M250 200 H490 V260 H250 Z" />
      <Lbl x={370} y={226} anchor="middle" size="s">{t("Ağırlık ve maliyet")}</Lbl>
      <Lbl x={370} y={246} anchor="middle" size="s" accent>{t("belirleyici")}</Lbl>
      <Arrow d="M490 90 H512" accent />
      <Arrow d="M490 230 H512" accent />
      <Lbl x={518} y={96}>{t("Ti-6Al-4V")}</Lbl>
      <Lbl x={518} y={236}>{t("7075-T6")}</Lbl>
      <Lbl x={40} y={300} size="s">{t("Değerler için parti sertifikası esastır")}</Lbl>
    </SchemaSvg>
  );
}

export function JournalDfm() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("İç köşe yarıçapı ve takım")}>
      <Ln d="M80 80 H320 V260 H80 Z" />
      <Ln d="M120 120 H260 V230 H120 Z" />
      <circle cx="240" cy="210" r="20" className="sch-accent" />
      <Center d="M240 180 V240 M210 210 H270" />
      <Callout x={240} y={230} tx={60} ty={290} anchor="start">{t("Köşe = takım yarıçapı")}</Callout>
      <Ln d="M380 100 H560 V240 H380 Z" />
      <Ln d="M380 100 H392 V240" accent />
      <Callout x={386} y={170} tx={420} ty={60} accent>{t("İnce cidar")}</Callout>
      <Lbl x={600} y={268} anchor="end" size="s">{t("Bağlama ve kesme sırası")}</Lbl>
    </SchemaSvg>
  );
}

export function JournalTornaFreze() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Aynı geometride tornalama ve frezeleme")}>
      <Ln d="M80 120 H200 V200 H80 Z" />
      <Ln d="M200 100 H360 V220 H200 Z" />
      <Ln d="M360 135 H560 V185 H360 Z" />
      <Center d="M50 160 H590" />
      <Ln d="M240 100 V90 H320 V100" accent />
      <circle cx="280" cy="160" r="10" className="sch-accent" />
      <Lbl x={40} y={250}>{t("Tornalama: çaplar, eş eksenlilik")}</Lbl>
      <Lbl x={40} y={300} accent>{t("Frezeleme: düzlem ve delik grubu")}</Lbl>
      <Callout x={280} y={92} tx={600} ty={40} anchor="end" accent>{t("Frezelenen düzlem")}</Callout>
      <Callout x={480} y={185} tx={600} ty={262} anchor="end">{t("Tornalanan çap")}</Callout>
    </SchemaSvg>
  );
}

export function JournalCmm() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Datum kurgusu ve problama noktaları")}>
      <Ln d="M120 110 H420 V240 H120 Z" />
      <circle cx="300" cy="175" r="35" className="sch-line" />
      {[[150, 240], [250, 240], [380, 240], [120, 150], [120, 210], [420, 175]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" className="sch-dot-accent" />
      ))}
      <Datum x={270} y={240} letter="A" dir="down" />
      <Datum x={120} y={180} letter="B" dir="left" />
      <Ln d="M500 60 V140 M490 140 H510" />
      <circle cx="500" cy="146" r="6" className="sch-line" />
      <Lbl x={460} y={50}>{t("Prob")}</Lbl>
      <Lbl x={600} y={290} anchor="end" size="s" accent>{t("Örnek · gerçek rapor değil")}</Lbl>
    </SchemaSvg>
  );
}

export function JournalYuzey() {
  const { t } = useTranslation();
  const cols = [
    { x: 60, label: t("Anodizasyon"), grow: 8, cut: 0 },
    { x: 200, label: t("Pasivasyon"), grow: 0, cut: 0 },
    { x: 340, label: t("Toz boya"), grow: 16, cut: 0 },
    { x: 480, label: t("Elektropolisaj"), grow: 0, cut: 8 },
  ];
  return (
    <SchemaSvg label={t("İşlemin yüzey ölçüsüne etkisi")}>
      <Thin d="M40 180 H600" />
      <Lbl x={600} y={300} anchor="end" size="s">{t("İşleme ölçüsü")}</Lbl>
      {cols.map((c) => (
        <g key={c.label}>
          <Hatch d={`M${c.x} 180 H${c.x + 100} V260 H${c.x} Z`} />
          {c.grow > 0 && <Ln d={`M${c.x} ${180 - c.grow} H${c.x + 100}`} accent />}
          {c.cut > 0 && <Ln d={`M${c.x} ${180 + c.cut} H${c.x + 100}`} accent />}
          <Lbl x={c.x + 50} y={cols.indexOf(c) % 2 ? 140 : 110} anchor="middle" size="s">{c.label}</Lbl>
        </g>
      ))}
      <Lbl x={40} y={300} size="s">{t("Çizgi kalınlığı ölçek değil, yön gösterir")}</Lbl>
    </SchemaSvg>
  );
}

export function ProfileInceCidar() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("İnce cidar: bağlama ve serbest bırakma")}>
      <Ln d="M120 90 H360 V230 H120 Z" />
      <Ln d="M134 104 H346 V230" />
      <Ln d="M90 150 H120 M360 150 H390" />
      <Arrow d="M60 150 H116" />
      <Arrow d="M420 150 H364" />
      <Lbl x={60} y={130} size="s">{t("Sıkma")}</Lbl>
      <Arrow d="M450 160 H500" accent />
      <Ln d="M520 90 H600 V230 H520 Z" />
      <Hidden d="M530 104 Q560 120 590 104" />
      <Callout x={560} y={110} tx={560} ty={50} anchor="middle" accent>{t("Geri yaylanma")}</Callout>
      <Lbl x={120} y={280}>{t("Tutuluyken")}</Lbl>
      <Lbl x={520} y={280}>{t("Serbestken")}</Lbl>
      <Lbl x={120} y={305} size="s">{t("Kritik ölçü iki durumda da kayda geçer")}</Lbl>
    </SchemaSvg>
  );
}

export function ProfileTitanyum() {
  const { t } = useTranslation();
  const steps = [t("Takım ve parametre"), t("İşleme"), t("Ara kontrol"), t("Takım değişimi"), t("Son kontrol")];
  return (
    <SchemaSvg label={t("Titanyum: proses ve ara kontrol")}>
      {steps.map((label, i) => (
        <g key={label}>
          <Step x={90 + i * 115} y={150} n={i + 1} />
          <Lbl x={90 + i * 115} y={i % 2 ? 224 : 196} anchor="middle" size="s">{label}</Lbl>
          {i < 4 && <Arrow d={`M${106 + i * 115} 150 H${189 + i * 115}`} accent={i === 1} />}
        </g>
      ))}
      <Hidden d="M320 130 C 320 70, 430 70, 435 130" />
      <Lbl x={330} y={60} size="s">{t("Aralık kayda bağlanır")}</Lbl>
      <Lbl x={40} y={280} size="s">{t("Isı kesiciye geçer: takım ömrü izlenir")}</Lbl>
    </SchemaSvg>
  );
}

export function ProfileMil() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Mil: datum ve salgı kurulumu")}>
      <Ln d="M90 135 H210 V185 H90 Z" />
      <Ln d="M210 120 H420 V200 H210 Z" />
      <Ln d="M420 135 H540 V185 H420 Z" />
      <Center d="M50 160 H590" />
      <Ln d="M60 160 L88 146 V174 Z M570 160 L542 146 V174 Z" />
      <Datum x={150} y={185} letter="A" dir="down" />
      <Datum x={480} y={185} letter="B" dir="down" />
      <Ln d="M300 60 H330 V90 H300 Z" />
      <Thin d="M315 90 V120" />
      <Callout x={315} y={75} tx={400} ty={40} accent>{t("Salgı · A-B")}</Callout>
      <Callout x={60} y={160} tx={40} ty={80}>{t("Punta")}</Callout>
      <Lbl x={210} y={280} size="s">{t("Ortak eksen A-B; ölçüm aynı kurulumdan")}</Lbl>
    </SchemaSvg>
  );
}
