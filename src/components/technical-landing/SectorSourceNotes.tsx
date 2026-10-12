import { useServiceData } from "@/i18n/service-data";
import { useTranslation } from "react-i18next";

export default function SectorSourceNotes({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { getPageBySlug } = useServiceData();
  const page = getPageBySlug(slug);
  if (!page) return <p>{t("Teknik kapsamı ilgili sektör sayfasında inceleyin.")}</p>;
  return (
    <div className="tl-sector-source">
      <p>{page.description}</p>
      {page.features?.length ? <div><h3>{t("TEKNİK YAKLAŞIM")}</h3><ul>{page.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul></div> : null}
      {page.processSteps?.length ? <div><h3>{t("PROSES PLANLAMA")}</h3><p>{page.processSteps.slice(0, 4).join(" → ")}</p></div> : null}
    </div>
  );
}
