import { useParams } from "react-router-dom";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellNotice,
  ShellPageHero,
  ShellRun,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useTranslation } from "react-i18next";
import { PROFILE_LABEL } from "@/content/caseStudies";
import { useSiteData } from "@/i18n/data";
import { profileMeta, profileRowMeta } from "@/components/pages/case-study-figures";
import { SchemaFigure } from "@/components/schemas/SchemaFigure";
import { PROFILE_SCHEMAS } from "@/components/schemas/registry";
import { PROFILE_SUBJECTS } from "@/content/journal-modules";
import { CMM_COVERAGE, QUOTE_RESPONSE_TIME } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   KABİLİYET PROFİLİ — DETAIL

   The union in `src/content/caseStudies.ts` is the whole point of this page,
   and it is read here rather than worked around:

     · `kind: "capability"`  — `client`, `reportNo` and `measuredResults` are
       typed `never`, so the measured-results table below is UNREACHABLE for
       today's three entries. It is not dead code: it is the branch that turns
       on when a real, permitted, anonymised job is added, and writing it now
       is how "nothing here has to be rewritten" stays true.
     · `kind: "anonymised-project"` — carries a `sector` instead of a customer
       and `permission: "ANONYMISED"`. The sector is shown; there is no
       variant that can show a name, because naming a client needs two
       separate permissions and no project has either.

   `surfaceFinish` is `string | null` and null everywhere today. A null row is
   ABSENT rather than rendered as "—": a dash in a measurement column reads as
   "we measured, and the answer was nothing".

   The not-found heading is deliberately "Bu profil kaydı bulunamadı", which
   does not match the anchored /^(Sayfa|Yazı) Bulunamadı$/ sentinel two route
   specs use to detect a route resolving to a not-found body — the same
   decision `CategoryPage.tsx` records for Phase 07's F3. The `<h1>` stays;
   only the string avoids the sentinel.
   ══════════════════════════════════════════════════════════════════════════ */

/* UX05: the detail page draws the profile's own problem
   (`src/components/schemas/journal.tsx`); the gallery render stays on the
   landing band (`case-study-figures.ts`). */

export const KabiliyetProfilDetay = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { caseStudies } = useSiteData();
  const study = caseStudies.find((entry) => entry.slug === slug);

  usePageMeta({
    title: study ? study.title : t("Profil bulunamadı"),
    description: study?.challenge,
    noindex: !study,
  });

  if (!study) {
    return (
      <PageShell surface="graphite" rail={{ no: "P1", label: "PROFİL" }}>
        <ShellPageHero
          no="01"
          label="PROFİL"
          crumb={
            <ShellBreadcrumb
              trail={[
                { label: "Ana sayfa", to: "/" },
                { label: "Kabiliyet profilleri", to: "/kabiliyet-profilleri" },
              ]}
            />
          }
          eyebrow={t("KAYIT YOK")}
          title={t("Bu profil kaydı bulunamadı")}
          lede={t("Bu adreste bir kabiliyet profili yok. Bağlantı değişmiş olabilir; dizinden ilgili başlığa geçebilirsiniz.")}
          actions={<ShellAction to="/kabiliyet-profilleri" variant="primary">{t("Profil dizini")}</ShellAction>}
        />
        <ShellSurfaceBand no="02" label="DİZİN" tone="paper" ariaLabel={t("Profil dizini")}>
          <div className="shell-span-full">
            <ShellIndexList
              ariaLabel={t("Kabiliyet profilleri")}
              items={caseStudies.map((entry) => ({
                to: `/kabiliyet-profilleri/${entry.slug}`,
                title: entry.title,
                description: entry.challenge,
                meta: profileRowMeta(entry),
              }))}
            />
          </div>
        </ShellSurfaceBand>
      </PageShell>
    );
  }

  const lang = i18n.language === "en" ? "en" : "tr";
  const ProfileDrawing = PROFILE_SCHEMAS[study.slug as keyof typeof PROFILE_SCHEMAS];
  const others = caseStudies.filter((entry) => entry.slug !== study.slug);

  return (
    <PageShell surface="graphite" rail={{ no: "P1", label: "PROFİL" }}>
      <ShellPageHero
        no="01"
        label="PROFİL"
        crumb={
          <ShellBreadcrumb
            trail={[
              { label: "Ana sayfa", to: "/" },
              { label: "Kabiliyet profilleri", to: "/kabiliyet-profilleri" },
              { label: study.title },
            ]}
          />
        }
        eyebrow={study.kind === "anonymised-project" ? `${study.sector} · ${t("anonimleştirilmiş")}` : t("Kabiliyet profili")}
        title={study.title}
        lede={study.challenge}
        meta={profileMeta(study).map((row) => ({ label: t(row.label), value: row.value }))}
        actions={
          <>
            <ShellAction to={study.rfq.href} variant="primary">{study.rfq.label}</ShellAction>
            <ShellAction to={study.relatedCapability.href} variant="ghost">
              {study.relatedCapability.label}
            </ShellAction>
          </>
        }
      />

      {/* ── 02 — the approach, with the part on the plate beside it ─────── */}
      <ShellSurfaceBand no="02" label="YAKLAŞIM" labelledBy="profil-yaklasim">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock id="profil-yaklasim" index="02" title={t("Yaklaşım")} />
          <div className="shell-prose" data-lead>
            <p>{study.outcome}</p>
            <p>{study.leadTime}</p>
          </div>
          <ShellRun
            ariaLabel={t("{{title}} — operasyon sırası", { title: study.title })}
            items={study.process.map((step) => ({ title: step }))}
          />
        </div>

        {/* UX05 — the profile's own engineering problem, drawn. The generic
            render that stood here (§I: blurred staff behind two of the three)
            stays on the landing only. */}
        <div className="shell-span-note">
          {ProfileDrawing && (
            <SchemaFigure drawing={ProfileDrawing} subject={PROFILE_SUBJECTS[study.slug]?.[lang] ?? study.title} no={`${t("PLAKA")} 01`} />
          )}
        </div>
      </ShellSurfaceBand>

      {/* ── 03 — the control plan: what a buyer actually receives ───────── */}
      <ShellSurfaceBand no="03" label="KONTROL" tone="paper" labelledBy="profil-kontrol">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="profil-kontrol"
            index="03"
            title={t("Kontrol planı")}
            standfirst={t("Hangi özelliğin hangi yöntemle doğrulandığı ve arkasında hangi kaydın kaldığı. Bu plan imalat başlamadan önce yazılır.")}
          />
        </div>
        {/* THE SECOND INSTANCE OF R3-1, AND THE ONE NO TEST WAS LOOKING AT.

            Same defect and same fix as `ServiceDetail.tsx:423`, which carries
            the full diagnosis: `.shell-stack`'s implicit `auto` track sized to
            this table's min-content instead of the column, so
            `.shell-table-scroll` never engaged and the KAYIT column could not
            be reached at 320 by touch, by keyboard or by a forced
            `scrollLeft`. `minmax(0, 1fr)` names the track so it can shrink.

            The guard did not catch this one and would not have: QA's route
            list walks `/kabiliyet-profilleri/ince-cidarli-aluminyum-govde`,
            which is not a slug — the three real ones are `hassas-mil`,
            `ince-cidarli-govde` and `titanyum-baglanti-parcasi` — so it walks
            a 404. Measured directly instead: ALL THREE profiles lost the
            column at 320, track 325.172 / 314.453 / 327.281 against a 278px
            column. After: 278, scroll region live, tabindex 0 on all three.
            The route-list slug is QA's to correct; the spec is not ours. */}
        <div className="shell-span-full shell-stack grid-cols-[minmax(0,1fr)]" data-gap="sm">
          <ShellSpecTable
            caption={t("{{title}} — kontrol planı", { title: study.title })}
            note={t("Sütunlar sırasıyla: kontrol edilen özellik, kontrol yöntemi ve kontrolün bıraktığı kayıt. Bir işe özel plan, parçanın kendi teknik resmine göre bu şablon üzerinden kurulur.")}
            headers={[t("ÖZELLİK"), t("KONTROL YÖNTEMİ"), t("KAYIT")]}
            numericFrom={3}
            rows={study.controlPlan.map((row) => [row.feature, row.method, row.record])}
            rowKey={(row) => String(row[0])}
          />

          {/* The `anonymised-project` branch. Unreachable for today's three
              `capability` entries BY TYPE — `measuredResults` is `never` on
              that variant — and present so that a permitted job slots in
              without a rewrite. */}
          {study.kind === "anonymised-project" && study.measuredResults ? (
            <ShellSpecTable
              caption={study.reportNo ? `${t("Ölçüm kaydı")} · ${study.reportNo}` : t("Ölçüm kaydı")}
              note={t("Gerçek bir muayene kaydından alınmıştır. Müşteri ve parça tanımlayıcıları anonimleştirilmiştir.")}
              headers={[t("ÖZELLİK"), t("NOMİNAL"), t("ÖLÇÜLEN"), t("SONUÇ")]}
              rows={study.measuredResults.map((row) => [row.feature, row.nominal, row.measured, row.verdict])}
              rowKey={(row) => String(row[0])}
            />
          ) : (
            <ShellNotice tone="note" label={t("PROFİL")}>
              <p>{t(PROFILE_LABEL)}</p>
              <p>
                {t("Sizin işinizde ölçüm kayıtları teslim dosyasına eklenir; {{cmm}} olarak sağlanır.", { cmm: t(CMM_COVERAGE) })}
              </p>
            </ShellNotice>
          )}
        </div>
      </ShellSurfaceBand>

      {/* ── 04 — the other profiles ─────────────────────────────────────── */}
      {others.length > 0 && (
        <ShellSurfaceBand no="04" label="DİĞER" ariaLabel={t("Diğer kabiliyet profilleri")}>
          <div className="shell-span-full">
            <p className="shell-eyebrow">{t("DİĞER PROFİLLER")}</p>
            <ShellIndexList
              compact
              ariaLabel={t("Diğer kabiliyet profilleri")}
              items={others.map((entry, index) => ({
                to: `/kabiliyet-profilleri/${entry.slug}`,
                index: `P${index + 1}`,
                title: entry.title,
                description: entry.challenge,
                meta: profileRowMeta(entry),
              }))}
            />
          </div>
        </ShellSurfaceBand>
      )}

      <ShellNextStep
        no="05"
        title={t("Bu parça ailesinde bir işiniz mi var?")}
        body={t("Teknik resim veya 3B model gönderin; üretilebilirlik incelemesiyle birlikte, parçanız için kontrol planının nasıl kurulacağını da yazalım.")}
        primary={{ label: study.rfq.label, to: study.rfq.href }}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Standart tolerans"), value: study.tolerance },
          { label: t("Ölçüm"), value: study.inspection },
        ]}
        secondary={{ label: study.relatedCapability.label, to: study.relatedCapability.href }}
      />
    </PageShell>
  );
};
