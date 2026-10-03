import { useTranslation } from "react-i18next";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { TechnicalLanding } from "@/components/technical-landing/TechnicalLanding";
import { DEFAULT_TITLE, usePageMeta } from "@/hooks/use-page-meta";
import { useLocale } from "@/i18n/hooks";

export const Index = () => {
  const { t } = useTranslation();
  usePageMeta({
    title: DEFAULT_TITLE[useLocale()],
    description: t("CNC Freze, Torna ve Talaşlı İmalatta ±0.01mm hassasiyet. ISO 9001 sertifikalı, proses kontrollü üretim ve DFM analizi. Ölçüm kayıtlı, izlenebilir hassas imalat."),
    fullTitle: true,
  });
  return (
    <>
      <JsonLdSchema type="organization" />
      <TechnicalLanding />
    </>
  );
};
