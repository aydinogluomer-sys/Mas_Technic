import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellNotice,
  ShellPageHero,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useTranslation } from "react-i18next";
import { PROFILE_INDEX_LABEL } from "@/content/caseStudies";
import { useSiteData } from "@/i18n/data";
import { profileRowMeta } from "@/components/pages/case-study-figures";
import { CMM_COVERAGE, MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   KABİLİYET PROFİLLERİ — THE INDEX

   ── WHY THIS ROUTE EXISTS AND WHAT IT IS NOT ─────────────────────────────
   `IMPLEMENTATION.md` §PHASE 08 requires a case-study index and detail pages
   "using a verified/anonymized data model". `USER_INPUTS.md` §G says
   `CASE_STUDIES: NONE_PROVIDED_YET` and, where there are none,
   `REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT`.

   Those are not in conflict, because the model already exists. Phase 06 built
   `src/content/caseStudies.ts` as a discriminated union on `kind`, with three
   `capability` entries and an `anonymised-project` variant reserved and typed
   so that a capability profile CANNOT grow `client`, `reportNo` or
   `measuredResults` by accident. The landing already renders those entries as
   band 07, `KABİLİYET PROFİLLERİ`.

   So this route publishes THAT model, under THAT name, presented as what the
   entries actually are: how a part family is approached, what is controlled,
   how it is controlled, and what record each control leaves. When a real
   project and a client permission arrive, the entry changes `kind`, gains
   `measuredResults`, and these two routes carry it without a rewrite.

   The page says this in its own words rather than only in a comment — band 02
   states plainly that these are not customer projects. A reader who is shown
   an index labelled "case studies" and finds capability descriptions has been
   misled by the label; a reader who is told what they are looking at has not.

   ── SEARCH/FILTER: OMITTED ───────────────────────────────────────────────
   Three entries. There is nothing to filter and nothing to search. If the
   corpus grows past a screen, `/sss` is the pattern.

   ── THE INDEX IS A REGISTER, NOT A CARD GRID ─────────────────────────────
   Each row carries the profile's own material and tolerance, so two profiles
   can be compared without opening both (`docs/lean/17` §6.3).
   ══════════════════════════════════════════════════════════════════════════ */

export const KabiliyetProfilleri = () => {
  const { t } = useTranslation();
  const { caseStudies } = useSiteData();
  usePageMeta({
    title: t("Kabiliyet Profilleri"),
    description: t("Parça ailelerine göre üretim ve kontrol yaklaşımımız: hangi özellik, hangi yöntemle doğrulanır ve arkasında hangi kayıt kalır."),
  });

  return (
    <PageShell surface="graphite" rail={{ no: "P1", label: "PROFİL" }}>
      <ShellPageHero
        no="01"
        label="PROFİL"
        crumb={<ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "Kabiliyet profilleri" }]} />}
        eyebrow={t("Üretim ve kontrol yaklaşımı")}
        title={t("Kabiliyet Profilleri")}
        lede={t("Her profil bir parça ailesinin ortaya çıkardığı mühendislik problemini, o problemi ele alış biçimimizi ve bir işin sonunda elinize geçen kontrol planını tarif eder.")}
        meta={[
          { label: t("Profil sayısı"), value: String(caseStudies.length) },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t("Ölçüm"), value: t(CMM_COVERAGE) },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">{t("Teklif Al")}</ShellAction>
            <ShellAction to="/kalite-dosyasi" variant="ghost">{t("Kalite dosyası")}</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="KAPSAM" labelledBy="profiller-kapsam">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="profiller-kapsam"
            index="02"
            title={t("Bir profilde ne bulursunuz")}
          />
          <div className="shell-prose" data-lead>
            <p>
              {t("Her profil, bir parça ailesinde hangi özelliğin neden kritik olduğunu, hangi aşamada nasıl kontrol edildiğini ve kontrolün arkasında hangi kaydın kaldığını anlatır. Kendi parçanızın kontrol planı, teklif aşamasında teknik resminiz üzerinden hazırlanır.")}
            </p>
          </div>
        </div>

        <div className="shell-span-note shell-stack" data-gap="sm">
          <ShellNotice tone="note" label={t("PROFİL")}>
            <p>{t(PROFILE_INDEX_LABEL)}</p>
          </ShellNotice>
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="03" label="DİZİN" tone="paper" labelledBy="profiller-dizin">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="profiller-dizin"
            index="03"
            title={t("Profil dizini")}
            standfirst={t("Her satır profilin malzemesini ve tolerans aralığını taşır; iki profil açılmadan karşılaştırılabilir.")}
          />
        </div>
        <div className="shell-span-full">
          <ShellIndexList
            ariaLabel={t("Kabiliyet profilleri")}
            items={caseStudies.map((study, index) => ({
              to: `/kabiliyet-profilleri/${study.slug}`,
              index: `P${index + 1}`,
              eyebrow: study.kind === "anonymised-project" ? study.sector : t("KABİLİYET PROFİLİ"),
              title: study.title,
              description: study.challenge,
              meta: profileRowMeta(study),
            }))}
          />
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="04"
        title={t("Kendi parçanız hangi profile giriyor?")}
        body={t("Teknik resim veya 3B model gönderin; üretilebilirlik incelemesiyle birlikte, parçanız için kontrol planının nasıl kurulacağını da yazalım.")}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Gönderilecek"), value: t("Teknik resim veya 3B model") },
          { label: t("Ölçüm"), value: t(CMM_COVERAGE) },
        ]}
        secondary={{ label: "Kalite dosyası", to: "/kalite-dosyasi" }}
      />
    </PageShell>
  );
};
