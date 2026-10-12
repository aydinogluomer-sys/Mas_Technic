import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/LocaleLink";
import { TechnicalSectionFrame } from "./TechnicalSectionFrame";
import { sectors } from "./SectorInventory";

const SectorSourceNotes = lazy(() => import("./SectorSourceNotes").catch(() => ({
  default: function SourceUnavailable() {
    const { t } = useTranslation();
    return <p>{t("Teknik kapsamı ilgili sektör sayfasında inceleyin.")}</p>;
  },
})));

/** The service core is requested only as the sector band approaches view. */
export function TechnicalSectors() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [nearViewport, setNearViewport] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sector = sectors[active];
  const pad = (value: number) => String(value).padStart(2, "0");
  useEffect(() => {
    const target = bodyRef.current;
    if (!target) return;
    if (!("IntersectionObserver" in window)) { setNearViewport(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearViewport(true); observer.disconnect(); }
    }, { rootMargin: "320px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  return (
    <TechnicalSectionFrame no="07" id="sektorler" label="SEKTÖRLER" className="tl-sectors tl-inspection-sectors" ariaLabel={t("Çalıştığımız sektörler")}>
      <div className="tl-sectors-body" ref={bodyRef}>
        <section id="tl-sector-detail" className="tl-sector-apparatus" aria-labelledby="tl-sector-title" data-sector={sector.href}>
          <div className="tl-sector-editorial">
            <p className="tl-operation-eyebrow">{pad(active + 1)} / {pad(sectors.length)} · {t("SEKTÖR")}</p>
            <h2 id="tl-sector-title">{t(sector.title)}</h2>
            {nearViewport ? <Suspense fallback={<p>{t("Teknik kapsamı ilgili sektör sayfasında inceleyin.")}</p>}>
              <SectorSourceNotes slug={sector.href.split("/").pop()!} />
            </Suspense> : <p>{t("Teknik kapsamı ilgili sektör sayfasında inceleyin.")}</p>}
            <div className="tl-operation-links">
              <Link to={sector.href}>{t("SEKTÖRÜ İNCELE")}<ArrowRight aria-hidden="true" /></Link>
              <Link to="/teklif-al">{t("TEKLİF İSTEYİN")}<ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          <figure className="tl-sector-master-media" key={sector.href}>
            {sector.image && <img src={sector.image} alt={t(sector.title)} width={sector.width} height={sector.height} loading="lazy" decoding="async" />}
            <figcaption>{t(sector.title)}</figcaption>
          </figure>
        </section>
        <div className="tl-sector-selection-header">
          <p>{t("Çalıştığımız sektörler")} · {pad(sectors.length)}</p>
          <div className="tl-sector-paging">
            <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0} aria-controls="tl-sector-detail" aria-label={t("Önceki sektörler")}><ArrowLeft aria-hidden="true" /></button>
            <button type="button" onClick={() => setActive((value) => Math.min(sectors.length - 1, value + 1))} disabled={active === sectors.length - 1} aria-controls="tl-sector-detail" aria-label={t("Sonraki sektörler")}><ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
        <div id="tl-sector-track" className="tl-sector-selections" role="region" aria-label={t("Sektör listesi — yatay kaydırılabilir")} tabIndex={0} data-lenis-prevent-horizontal>
          {sectors.map((item, index) => <article key={item.href} className="tl-sector-option">
            <button type="button" aria-pressed={active === index} aria-controls="tl-sector-detail" onClick={() => setActive(index)}><span aria-hidden="true">{pad(index + 1)}</span>{t(item.title)}</button>
            <Link to={item.href} aria-label={`${t(item.title)} — ${t("SEKTÖRÜ İNCELE")}`}>{t("SEKTÖRÜ İNCELE")}<ArrowRight aria-hidden="true" /></Link>
          </article>)}
        </div>
      </div>
    </TechnicalSectionFrame>
  );
}
