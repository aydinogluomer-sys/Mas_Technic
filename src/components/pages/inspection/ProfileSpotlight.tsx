import { useTranslation } from "react-i18next";
import type { CaseStudy } from "@/content/caseStudies";
import { PROFILE_INDEX_LABEL } from "@/content/caseStudies";
import { caseStudyImages } from "@/components/pages/case-study-figures";
import { ShellAction, ShellPlate } from "@/components/shell";

/** The first source profile introduces the complete native index below. */
export function ProfileSpotlight({ study }: { study: CaseStudy }) {
  const { t } = useTranslation();
  const image = study.gallery[0];
  const control = study.controlPlan[0];
  return (
    <div className="inspection-profile-spotlight">
      <div className="inspection-profile-spotlight-media">
        {image && <ShellPlate plate={`${t("PLAKA")} 01`} caption={image.alt} media={<img src={caseStudyImages[image.image]} alt="" />} />}
        <p className="shell-table-note">{t(PROFILE_INDEX_LABEL)}</p>
      </div>
      <div className="inspection-profile-spotlight-record">
        <p className="shell-eyebrow">{t("Kabiliyet profili")}</p>
        <h2>{study.title}</h2>
        <p className="shell-note">{study.challenge}</p>
        {control && <dl className="inspection-preview-specs">
          <div><dt>{t("ÖZELLİK")}</dt><dd>{control.feature}</dd></div>
          <div><dt>{t("KONTROL YÖNTEMİ")}</dt><dd>{control.method}</dd></div>
          <div><dt>{t("KAYIT")}</dt><dd>{control.record}</dd></div>
        </dl>}
        <ShellAction to={`/kabiliyet-profilleri/${study.slug}`} variant="quiet">{study.title}</ShellAction>
      </div>
    </div>
  );
}
