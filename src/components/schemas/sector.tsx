import { useTranslation } from "react-i18next";
import { Arrow, Callout, Center, Datum, Dim, Hatch, Hidden, Lbl, Ln, SchemaSvg, Step, Thin } from "./kit";

/* IMG01 — sector and capability schemas. Each drawing answers the subject the
   contract assigns to its page (see `src/content/detail-visuals.ts`). No
   figure, tolerance value or test result appears in any of them. */

export function Savunma() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Muhafaza ve bağlantı referansı")}>
      <Ln d="M150 70 H430 V250 H150 Z" />
      <Ln d="M120 250 H460 V270 H120 Z" />
      <circle cx="290" cy="160" r="52" className="sch-line" />
      <circle cx="290" cy="160" r="30" className="sch-thin" />
      <Center d="M290 90 V230 M220 160 H360" />
      {[180, 400].map((x) => <circle key={x} cx={x} cy="100" r="7" className="sch-thin" />)}
      {[180, 400].map((x) => <circle key={x} cx={x} cy="220" r="7" className="sch-thin" />)}
      <Datum x={300} y={270} letter="A" dir="down" />
      <Datum x={342} y={160} letter="B" dir="right" />
      <Callout x={430} y={260} tx={610} ty={296} anchor="end">{t("Bağlantı yüzeyi")}</Callout>
      <Callout x={400} y={100} tx={500} ty={60}>{t("Delik düzeni")}</Callout>
      <Callout x={250} y={130} tx={60} ty={50} anchor="start" accent>{t("Yatak deliği")}</Callout>
    </SchemaSvg>
  );
}

export function Robotik() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Eklem, rulman oturması ve eksen ilişkisi")}>
      <Ln d="M70 120 H250 L300 140 V180 L250 200 H70 Z" />
      <Ln d="M340 140 L390 120 H570 V200 H390 L340 180 Z" />
      <circle cx="320" cy="160" r="58" className="sch-line" />
      <circle cx="320" cy="160" r="36" className="sch-accent" />
      <circle cx="320" cy="160" r="14" className="sch-thin" />
      <Center d="M320 70 V250 M40 160 H600" />
      <Datum x={320} y={102} letter="A" dir="up" />
      <Callout x={350} y={135} tx={460} ty={70} accent>{t("Rulman oturması")}</Callout>
      <Callout x={520} y={160} tx={600} ty={250} anchor="end">{t("Eksen ilişkisi")}</Callout>
      <Lbl x={70} y={250}>{t("Eş eksenlilik · A")}</Lbl>
    </SchemaSvg>
  );
}

export function Otomotiv() {
  const { t } = useTranslation();
  const lot = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <SchemaSvg label={t("Numune ve parti kontrol noktaları")}>
      <Ln d="M60 70 H240 V190 H60 Z" />
      <circle cx="150" cy="130" r="32" className="sch-line" />
      <Step x={60} y={70} n={1} />
      <Step x={240} y={70} n={2} />
      <Step x={150} y={130} n={3} />
      <Step x={240} y={190} n={4} />
      <Lbl x={60} y={230}>{t("Numune · tüm koteler")}</Lbl>
      <Arrow d="M270 130 H330" />
      {lot.map((i) => (
        <g key={i}>
          <rect x={350 + (i % 4) * 62} y={i < 4 ? 80 : 150} width="44" height="40" className={i % 3 === 0 ? "sch-accent" : "sch-thin"} />
          <circle cx={372 + (i % 4) * 62} cy={(i < 4 ? 80 : 150) + 20} r="9" className="sch-thin" />
        </g>
      ))}
      <Lbl x={350} y={230}>{t("Parti · plandaki koteler")}</Lbl>
      <Lbl x={350} y={260} accent size="s">{t("Vurgulu: ara kontrol")}</Lbl>
    </SchemaSvg>
  );
}

export function Medikal() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Bileşen yüzeyi ve izlenebilirlik")}>
      <Ln d="M80 140 H200 V180 H80 Z" />
      <Ln d="M200 148 H520 L548 160 L520 172 H200" />
      {Array.from({ length: 13 }, (_, i) => <Thin key={i} d={`M${220 + i * 23} 148 L${232 + i * 23} 172`} />)}
      <Ln d="M210 132 H530 M210 188 H530" accent />
      <Center d="M60 160 H580" />
      <rect x="96" y="150" width="88" height="20" className="sch-box" />
      <Lbl x={140} y={165} anchor="middle" size="s">{t("Parti")}</Lbl>
      <Callout x={140} y={150} tx={90} ty={70}>{t("Parti ve döküm kaydı")}</Callout>
      <Callout x={380} y={132} tx={420} ty={70} accent>{t("Yüzey durumu")}</Callout>
      <Callout x={530} y={188} tx={600} ty={250} anchor="end">{t("Ölçüm kaydı")}</Callout>
    </SchemaSvg>
  );
}

export function Yat() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Farklı metallerin bağlantısı ve galvanik uyum")}>
      <Hatch d="M90 110 H550 V150 H90 Z" />
      <Ln d="M90 150 H550 V190 H90 Z" />
      <Ln d="M300 80 H340 V230 H300 Z" />
      <Ln d="M280 80 H360 V95 H280 Z" />
      <Ln d="M280 215 H360 V230 H280 Z" />
      <Ln d="M270 95 H370 V110 H270 Z" accent />
      <Ln d="M270 190 H370 V205 H270 Z" accent />
      <Callout x={120} y={130} tx={70} ty={60}>{t("Metal 1 · paslanmaz")}</Callout>
      <Callout x={120} y={175} tx={70} ty={260}>{t("Metal 2 · alüminyum")}</Callout>
      <Callout x={370} y={102} tx={440} ty={60} accent>{t("Yalıtım pulu")}</Callout>
      <Callout x={370} y={197} tx={440} ty={260} accent>{t("Yalıtım burcu")}</Callout>
    </SchemaSvg>
  );
}

export function Hidrolik() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Manifold kesiti, akış yolları ve temizleme")}>
      <Hatch d="M90 60 H550 V260 H90 Z M140 108 H500 V132 H140 Z M308 132 H332 V220 H308 Z M180 196 H308 V220 H180 Z" />
      <Ln d="M90 60 H550 V260 H90 Z" />
      <Ln d="M140 108 H500 V132 H140 Z" />
      <Ln d="M308 132 H332 V220 H308 Z" />
      <Ln d="M180 196 H308 V220 H180 Z" />
      <Ln d="M500 104 H530 V136 H500 Z" accent />
      <Arrow d="M150 120 H290" accent />
      <Arrow d="M320 140 V200" accent />
      <Arrow d="M300 208 H195" accent />
      <Callout x={320} y={120} tx={566} ty={30} anchor="end">{t("Kesişim · çapak temizliği")}</Callout>
      <Callout x={530} y={120} tx={570} ty={190} anchor="end">{t("Tapa")}</Callout>
      <Lbl x={100} y={290}>{t("Akış yolu")}</Lbl>
    </SchemaSvg>
  );
}

export function Boru() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Diş, oturma ve flanş bağlantısı kesiti")}>
      <Hatch d="M250 60 H290 V260 H250 Z" />
      <Hatch d="M310 60 H350 V260 H310 Z" />
      <Ln d="M290 70 H310 V250 H290 Z" accent />
      <Ln d="M120 120 H250 M120 200 H250 M350 120 H520 M350 200 H520" />
      <Ln d="M270 80 V240 M330 80 V240" />
      {[90, 230].map((y) => <g key={y}><Ln d={`M240 ${y} H360`} /><Ln d={`M228 ${y - 8} H240 V${y + 8} H228 Z M360 ${y - 8} H372 V${y + 8} H360 Z`} /></g>)}
      {Array.from({ length: 6 }, (_, i) => <Thin key={i} d={`M${130 + i * 18} 120 L${139 + i * 18} 112 L${148 + i * 18} 120`} />)}
      <Center d="M90 160 H550" />
      <Callout x={140} y={116} tx={90} ty={60}>{t("Diş oturması")}</Callout>
      <Callout x={300} y={160} tx={420} ty={290} accent>{t("Conta yüzeyi")}</Callout>
      <Callout x={330} y={70} tx={430} ty={40}>{t("Flanş")}</Callout>
    </SchemaSvg>
  );
}

export function Iklim() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Conta, bağlantı ve sızdırmazlık özelliği")}>
      <Hatch d="M100 90 H320 V130 H100 Z M100 190 H320 V230 H100 Z" />
      <Ln d="M100 130 H560 M100 190 H560" />
      <Ln d="M320 90 H360 V130 M320 230 H360 V190" />
      <Ln d="M220 130 V118 H250 V130 M220 190 V202 H250 V190" />
      <circle cx="235" cy="124" r="7" className="sch-accent" />
      <circle cx="235" cy="196" r="7" className="sch-accent" />
      <Center d="M80 160 H580" />
      <Callout x={235} y={118} tx={160} ty={50} accent>{t("O-ring kanalı")}</Callout>
      <Callout x={420} y={130} tx={460} ty={60}>{t("Sızdırmazlık yüzeyi")}</Callout>
      <Callout x={340} y={230} tx={420} ty={280}>{t("Bağlantı")}</Callout>
    </SchemaSvg>
  );
}

export function Prototip() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Aynı geometrinin iki revizyonu")}>
      <Ln d="M60 90 H260 V230 H60 Z" />
      <circle cx="120" cy="160" r="22" className="sch-line" />
      <Ln d="M190 130 H230 V190 H190 Z" />
      <Lbl x={60} y={70}>{t("Rev A")}</Lbl>
      <Arrow d="M290 160 H350" />
      <Ln d="M380 90 H580 V230 H380 Z" />
      <circle cx="440" cy="160" r="22" className="sch-line" />
      <Ln d="M505 125 H550 V195 H505 Z" accent />
      <Hidden d="M510 130 H550 V190 H510 Z" />
      <Lbl x={380} y={70}>{t("Rev B")}</Lbl>
      <Callout x={550} y={125} tx={600} ty={40} anchor="end" accent>{t("Değişen özellik")}</Callout>
      <Lbl x={60} y={280}>{t("Aynı datum, aynı ölçüm")}</Lbl>
    </SchemaSvg>
  );
}

export function KucukSeri() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Lot ve parça kimliği düzeni")}>
      <Ln d="M60 70 H420 V260 H60 Z" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={80 + (i % 4) * 84} y={i < 4 ? 92 : 176} width="64" height="64" className="sch-thin" />
          <rect x={92 + (i % 4) * 84} y={(i < 4 ? 92 : 176) + 40} width="40" height="12" className="sch-accent" />
        </g>
      ))}
      <rect x="460" y="90" width="130" height="80" className="sch-box" />
      <Lbl x={472} y={118}>{t("Lot")}</Lbl>
      <Lbl x={472} y={146} size="s">{t("Malzeme partisi")}</Lbl>
      <Arrow d="M460 130 H425" />
      <Callout x={132} y={138} tx={470} ty={230} accent>{t("Parça kimliği")}</Callout>
    </SchemaSvg>
  );
}

export function OzelProje() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Modelden teknik resme")}>
      <Ln d="M90 140 L170 100 L250 140 L170 180 Z" />
      <Ln d="M90 140 V210 L170 250 V180 M250 140 V210 L170 250" />
      <Lbl x={90} y={290}>{t("3B model")}</Lbl>
      <Arrow d="M280 170 H340" accent />
      <Ln d="M370 80 H470 V150 H370 Z" />
      <Ln d="M370 180 H470 V230 H370 Z" />
      <Ln d="M500 80 H560 V150 H500 Z" />
      <Thin d="M470 115 H500 M420 150 V180" />
      <Lbl x={370} y={290}>{t("Teknik resim")}</Lbl>
      <Callout x={560} y={80} tx={600} ty={40} anchor="end">{t("Görünüşler")}</Callout>
    </SchemaSvg>
  );
}

export function Yenilenebilir() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Dış ortam bağlantısı ve kaplama payı")}>
      <Ln d="M120 90 H300 V230 H120 Z" />
      <Ln d="M112 82 H308 V238 H112 Z" accent />
      <Ln d="M300 140 H540 V180 H300" />
      <Ln d="M292 132 H548 V188 H292" accent />
      <Ln d="M400 110 H420 V210 H400 Z" />
      <Dim x1={300} y1={70} x2={308} y2={70} />
      <Callout x={308} y={84} tx={360} ty={50} accent>{t("Kaplama payı")}</Callout>
      <Callout x={410} y={210} tx={470} ty={270}>{t("Bağlantı elemanı")}</Callout>
      <Lbl x={120} y={280}>{t("Dış ortam · ortam sınıfı")}</Lbl>
    </SchemaSvg>
  );
}

export function PetrolGaz() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Basınçlı birleşimin kesiti")}>
      <Hatch d="M110 100 H300 V130 H110 Z M110 190 H300 V220 H110 Z" />
      <Hatch d="M340 100 H530 V130 H340 Z M340 190 H530 V220 H340 Z" />
      <Ln d="M300 80 L320 100 L340 80 M300 240 L320 220 L340 240" />
      <Ln d="M290 70 H350 V90 H290 Z M290 230 H350 V250 H290 Z" />
      <Ln d="M308 130 L320 142 L332 130 M308 190 L320 178 L332 190" accent />
      <Center d="M90 160 H550" />
      <Callout x={320} y={136} tx={420} ty={50} accent>{t("Sızdırmazlık halkası")}</Callout>
      <Callout x={290} y={80} tx={160} ty={50}>{t("Kelepçe")}</Callout>
      <Lbl x={110} y={280}>{t("Basınç sınıfı şartnameye göre")}</Lbl>
    </SchemaSvg>
  );
}

export function GucDagitim() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Bara, kontak ve montaj kesiti")}>
      <Ln d="M80 120 H360 V150 H80 Z" />
      <Ln d="M280 150 H560 V180 H280 Z" />
      <Ln d="M280 148 H360 V152" accent />
      <Ln d="M310 100 H330 V200 H310 Z" />
      <Ln d="M120 150 V200 H180 V150" />
      <Ln d="M105 200 H195 V230 H105 Z" />
      <Callout x={320} y={150} tx={420} ty={70} accent>{t("Kontak yüzeyi")}</Callout>
      <Callout x={90} y={135} tx={60} ty={70}>{t("Bara")}</Callout>
      <Callout x={150} y={215} tx={230} ty={280}>{t("İzolatör montajı")}</Callout>
    </SchemaSvg>
  );
}

export function Madencilik() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Aşınma yüzeyi ve parça kesiti")}>
      <Hatch d="M90 150 H550 V230 H90 Z" />
      <Ln d="M90 150 L150 110 L210 150 L270 110 L330 150 L390 110 L450 150 L510 110 L550 135" />
      <Ln d="M90 140 L150 100 L210 140 L270 100 L330 140 L390 100 L450 140 L510 100 L550 125" accent />
      {[170, 370].map((x) => <Ln key={x} d={`M${x} 230 V270 M${x - 14} 270 H${x + 14}`} />)}
      <Callout x={270} y={100} tx={300} ty={50} accent>{t("Aşınma payı")}</Callout>
      <Callout x={480} y={200} tx={560} ty={280} anchor="end">{t("Parça kesiti")}</Callout>
      <Lbl x={90} y={290}>{t("Bağlantı cıvataları")}</Lbl>
    </SchemaSvg>
  );
}

export function DusukHacim() {
  const { t } = useTranslation();
  const lanes = [t("3B baskı"), t("Silikon kalıp"), t("CNC işleme")];
  return (
    <SchemaSvg label={t("Adede ve hassasiyete göre yöntem seçimi")}>
      <Arrow d="M90 270 H580" />
      <Lbl x={580} y={296} anchor="end" size="s">{t("Adet")}</Lbl>
      <Arrow d="M90 270 V40" />
      <Lbl x={100} y={36} size="s">{t("Hassasiyet")}</Lbl>
      {lanes.map((label, i) => (
        <g key={label}>
          <Ln d={`M${120 + i * 120} ${200 - i * 50} H${300 + i * 110}`} accent={i === 2} />
          <Lbl x={120 + i * 120} y={190 - i * 50}>{label}</Lbl>
        </g>
      ))}
      <Lbl x={120} y={250} size="s">{t("Aralıklar teklifte belirtilir")}</Lbl>
    </SchemaSvg>
  );
}

export function Montaj() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Alt montaj sırası")}>
      <Ln d="M80 200 H300 V250 H80 Z" />
      <Ln d="M150 140 H230 V180 H150 Z" />
      <Ln d="M182 70 H198 V125 H182 Z M172 60 H208 V70 H172 Z" />
      <Hidden d="M190 125 V230" />
      <Arrow d="M190 128 V138" />
      <Arrow d="M190 182 V196" />
      <Step x={120} y={175} n={1} />
      <Step x={260} y={155} n={2} />
      <Step x={230} y={70} n={3} />
      <Arrow d="M330 160 H390" />
      <Ln d="M420 180 H600 V230 H420 Z" />
      <Ln d="M480 150 H540 V180" />
      <Ln d="M502 110 H518 V150" />
      <Callout x={510} y={230} tx={560} ty={285} anchor="end">{t("Kontrol ve kayıt")}</Callout>
      <Lbl x={60} y={30}>{t("Sıra montaj talimatında")}</Lbl>
    </SchemaSvg>
  );
}

export function Verimlilik() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Kurulum işlerinin ayrıştırılması")}>
      <Lbl x={70} y={80}>{t("Önce")}</Lbl>
      <Ln d="M160 60 H330 V96 H160 Z" accent />
      <Ln d="M330 60 H560 V96 H330 Z" />
      <Lbl x={170} y={84} size="s">{t("Kurulum")}</Lbl>
      <Lbl x={340} y={84} size="s">{t("İşleme")}</Lbl>
      <Lbl x={70} y={200}>{t("Sonra")}</Lbl>
      <Ln d="M160 180 H240 V216 H160 Z" accent />
      <Ln d="M240 180 H560 V216 H240 Z" />
      <Thin d="M160 236 H560 V266 H160 Z" />
      <Lbl x={170} y={256} size="s">{t("Tezgâh çalışırken hazırlık")}</Lbl>
      <Arrow d="M245 110 V170" />
      <Lbl x={70} y={300} size="s">{t("Süreler işe göre değişir")}</Lbl>
    </SchemaSvg>
  );
}

export function LazerTavlama() {
  const { t } = useTranslation();
  return (
    <SchemaSvg label={t("Lazer tavlama ile markalama")}>
      <Ln d="M80 190 H560 V250 H80 Z" />
      <Ln d="M260 186 H420 V194 H260 Z" accent />
      <Ln d="M320 60 L340 60 L336 120 L324 120 Z" />
      <Thin d="M330 120 L300 186 M330 120 L360 186" />
      <Arrow d="M240 150 H420" />
      <Callout x={340} y={190} tx={600} ty={280} anchor="end" accent>{t("Isıl renk değişimi")}</Callout>
      <Callout x={330} y={70} tx={400} ty={40}>{t("Lazer ışını")}</Callout>
      <Lbl x={80} y={290}>{t("Malzeme kaldırılmaz")}</Lbl>
    </SchemaSvg>
  );
}
