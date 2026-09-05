import { useParams } from "react-router-dom";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellNotice,
  ShellPageHero,
  ShellPlate,
  ShellRun,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { usePageMeta } from "@/hooks/use-page-meta";
import { caseStudies } from "@/content/caseStudies";
import { caseStudyImages, profileMeta, profileRowMeta } from "@/components/pages/case-study-figures";
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

export const KabiliyetProfilDetay = () => {
  const { slug } = useParams<{ slug: string }>();
  const study = caseStudies.find((entry) => entry.slug === slug);

  usePageMeta({
    title: study ? study.title : "Profil bulunamadı",
    description: study?.challenge,
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
          eyebrow="KAYIT YOK"
          title="Bu profil kaydı bulunamadı"
          lede="Bu adreste bir kabiliyet profili yok. Bağlantı değişmiş olabilir; dizinden ilgili başlığa geçebilirsiniz."
          actions={<ShellAction to="/kabiliyet-profilleri" variant="primary">Profil dizini</ShellAction>}
        />
        <ShellSurfaceBand no="02" label="DİZİN" tone="paper" ariaLabel="Profil dizini">
          <div className="shell-span-full">
            <ShellIndexList
              ariaLabel="Kabiliyet profilleri"
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

  const figure = study.gallery[0];
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
        eyebrow={study.kind === "anonymised-project" ? `${study.sector} · anonimleştirilmiş` : "Kabiliyet profili"}
        title={study.title}
        lede={study.challenge}
        meta={profileMeta(study)}
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
          <ShellTitleBlock id="profil-yaklasim" index="02" title="Yaklaşım" />
          <div className="shell-prose" data-lead>
            <p>{study.outcome}</p>
            <p>{study.leadTime}</p>
          </div>
          <ShellRun
            ariaLabel={`${study.title} — operasyon sırası`}
            items={study.process.map((step) => ({ title: step }))}
          />
        </div>

        <div className="shell-span-note">
          <ShellPlate
            plate="PLAKA 01"
            caption={figure.alt}
            media={<img src={caseStudyImages[figure.image]} alt={figure.alt} width="1024" height="1024" loading="lazy" />}
          />
        </div>
      </ShellSurfaceBand>

      {/* ── 03 — the control plan: what a buyer actually receives ───────── */}
      <ShellSurfaceBand no="03" label="KONTROL" tone="paper" labelledBy="profil-kontrol">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="profil-kontrol"
            index="03"
            title="Kontrol planı"
            standfirst="Hangi özelliğin hangi yöntemle doğrulandığı ve arkasında hangi kaydın kaldığı. Bu plan imalat başlamadan önce yazılır."
          />
        </div>
        {/* The second instance of R3-1, and the one the guard could not see:
            `e2e/qa-p08-scroll-region-reach.spec.ts` walks
            `/kabiliyet-profilleri/ince-cidarli-aluminyum-govde`, which is not a
            slug — the three real ones are `hassas-mil`, `ince-cidarli-govde`
            and `titanyum-baglanti-parcasi`, and ALL THREE lost this table's
            last column at 320 (track 314-327px against a 278px column). Fixed
            in the primitive: `.shell-stack > * { min-width: 0 }`, shell.css. */}
        <div className="shell-span-full shell-stack" data-gap="sm">
          <ShellSpecTable
            caption={`${study.title} — kontrol planı`}
            note="Sütunlar sırasıyla: kontrol edilen özellik, kontrol yöntemi ve kontrolün bıraktığı kayıt. Bir işe özel plan, parçanın kendi teknik resmine göre bu şablon üzerinden kurulur."
            headers={["ÖZELLİK", "KONTROL YÖNTEMİ", "KAYIT"]}
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
              caption={study.reportNo ? `Ölçüm kaydı · ${study.reportNo}` : "Ölçüm kaydı"}
              note="Gerçek bir muayene kaydından alınmıştır. Müşteri ve parça tanımlayıcıları anonimleştirilmiştir."
              headers={["ÖZELLİK", "NOMİNAL", "ÖLÇÜLEN", "SONUÇ"]}
              rows={study.measuredResults.map((row) => [row.feature, row.nominal, row.measured, row.verdict])}
              rowKey={(row) => String(row[0])}
            />
          ) : (
            <ShellNotice tone="caution" label="ÖLÇÜM KAYDI">
              <p>
                Bu profil için yayımlanmış bir nominal → ölçülen tablosu yoktur; böyle bir tablo
                ancak gerçek bir muayene kaydına ve müşteri iznine dayanarak yayımlanabilir.
                Sizin işinizde ölçüm kayıtları teslim dosyasına eklenir. {CMM_COVERAGE} olarak
                sağlanır.
              </p>
            </ShellNotice>
          )}
        </div>
      </ShellSurfaceBand>

      {/* ── 04 — the other profiles ─────────────────────────────────────── */}
      {others.length > 0 && (
        <ShellSurfaceBand no="04" label="DİĞER" ariaLabel="Diğer kabiliyet profilleri">
          <div className="shell-span-full">
            <p className="shell-eyebrow">DİĞER PROFİLLER</p>
            <ShellIndexList
              compact
              ariaLabel="Diğer kabiliyet profilleri"
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
        title="Bu parça ailesinde bir işiniz mi var?"
        body="Teknik resim veya 3B model gönderin; üretilebilirlik incelemesiyle birlikte, parçanız için kontrol planının nasıl kurulacağını da yazalım."
        primary={{ label: study.rfq.label, to: study.rfq.href }}
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Standart tolerans", value: study.tolerance },
          { label: "Ölçüm", value: study.inspection },
        ]}
        secondary={{ label: study.relatedCapability.label, to: study.relatedCapability.href }}
      />
    </PageShell>
  );
};
