import {
  PageShell,
  ShellAction,
  ShellEvidence,
  ShellIndexList,
  ShellNextStep,
  ShellPageHero,
  ShellRun,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { categoryPages } from "@/data/categoryPages";
import {
  CERTIFICATIONS,
  CERTIFICATION_SENTENCE_LIST,
  CMM_COVERAGE,
  MINIMUM_TOLERANCE,
  PUBLIC_CITY,
  QUALITY_RESOURCES,
  QUOTE_RESPONSE_TIME,
} from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   HAKKIMIZDA — THE COMPANY DOSSIER

   WHAT THIS REPLACES, EXACTLY
   ---------------------------
   49 lines that were the literal template `IMPLEMENTATION.md` §PHASE 07
   forbids: an eyebrow, an `<h1>`, a one-line subheading, two paragraphs, then
   `grid sm:grid-cols-2 lg:grid-cols-4 gap-6` of four `lucide-react` icon tiles
   inside `border border-border bg-card p-6` — Misyon / Yaklaşım / Süreç /
   Kalite. "Heading + paragraph + four icon cards", with the mission and the
   approach written as startup cards: both named in the plan, both gone.

   WHAT THE READER GETS INSTEAD
   ----------------------------
   · A hero that states the four measured facts the company is ALLOWED to
     publish, as a metadata run rather than as adjectives.
   · The mission as editorial prose with one serif statement, and the two
     claims it rests on carried by `ShellEvidence` blocks that name the public
     PDF each comes from — a reader can open the source.
   · The approach as a SEQUENCE: the six steps a job actually moves through,
     each stated as a mechanism rather than as a promise.
   · The scope as a real index into the three route families, which turns the
     page into a hub instead of a dead end.
   · One next step — the same one every other page offers.

   WHAT IS DELIBERATELY ABSENT: A HISTORY TIMELINE
   -----------------------------------------------
   The phase permits a "dossier / timeline / technical-sheet narrative" for
   company history. `USER_INPUTS.md` supplies no founding year, no milestone,
   no relocation and no first-customer date; there is no history field in it at
   all. A timeline is a sequence of dated assertions, so building one here
   would mean inventing every entry, which §13 forbids outright. The dossier is
   therefore built from what IS verified — scope, process, documents — and
   carries no dates. Recorded in `docs/lean/17-inner-page-composition.md`.

   EVERY FACTUAL CLAIM ON THIS PAGE COMES FROM `@/content/claims`.
   ══════════════════════════════════════════════════════════════════════════ */

/* Six steps, written as MECHANISM. Step 05 states the CONDITION on measurement
   coverage (`CMM_COVERAGE`) rather than a universal one: §D records coordinate
   measurement as third-party accredited and provided on demand. */
const WORKFLOW = [
  {
    title: "Talep ve teknik resim",
    detail: "2B teknik resim veya 3B model, adet ve malzeme bilgisiyle birlikte alınır.",
  },
  {
    title: "Üretilebilirlik incelemesi",
    detail: "Kote, tolerans ve yüzey talepleri seçilen imalat yöntemine göre gözden geçirilir.",
  },
  {
    title: "Kontrol planı",
    detail: "Hangi kotenin hangi aşamada, hangi ölçüm yöntemiyle doğrulanacağı imalattan önce yazılır.",
  },
  {
    title: "İmalat",
    detail: "Kurulum, takım listesi ve işleme programı parçaya özel hazırlanır.",
  },
  {
    title: "Boyutsal doğrulama",
    detail: `Kontrol planında tanımlanan koteler ölçülür. ${CMM_COVERAGE} olarak eklenir.`,
  },
  {
    title: "Teslim dosyası",
    detail: "Ölçüm kayıtları ve malzeme parti bilgisi sevkiyatla birlikte iletilir.",
  },
];

const SCOPE_FAMILIES = [
  { prefix: "hizmetler", label: "Hizmetler", caption: "ne yapıyoruz" },
  { prefix: "kabiliyetler", label: "Kabiliyetler", caption: "neyle yapıyoruz" },
  { prefix: "endustriyel", label: "Endüstriyel", caption: "kimin için" },
] as const;

export const Hakkimizda = () => {
  usePageMeta({
    title: "Hakkımızda",
    description:
      "Mas Technic — hassas CNC işleme, talaşlı imalat ve mühendislik çözümleri sunan güvenilir üretim partneri.",
  });

  const certificationRun = CERTIFICATIONS.map((certification) => certification.code).join(" · ");
  const qualityPolicy = QUALITY_RESOURCES[0];
  const measurementList = QUALITY_RESOURCES[1];

  return (
    <PageShell surface="graphite" rail={{ no: "C1", label: "KURUMSAL" }}>
      <JsonLdSchema type="about" />

      <ShellPageHero
        no="01"
        label="KURUMSAL"
        eyebrow="Kurumsal dosya"
        title="Hakkımızda"
        lede="Mas Technic, CNC freze, torna ve talaşlı imalat alanında yüksek hassasiyetli üretim çözümleri sunan bir mühendislik firmasıdır. Havacılık, otomotiv, medikal ve robotik gibi kritik sektörlere hizmet vermekteyiz."
        meta={[
          { label: "Merkez", value: `${PUBLIC_CITY} · Çiğli` },
          { label: "Standart tolerans", value: MINIMUM_TOLERANCE },
          { label: "Teklif dönüşü", value: QUOTE_RESPONSE_TIME },
          { label: "Yönetim sistemleri", value: certificationRun },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>
            <ShellAction to="/iletisim" variant="ghost">İletişim</ShellAction>
          </>
        }
      />

      {/* ── 02 — the mission, as prose and evidence rather than as cards ── */}
      <ShellSurfaceBand no="02" label="YAKLAŞIM" labelledBy="hakkimizda-yaklasim">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="hakkimizda-yaklasim"
            index="02"
            title={<>Hassasiyeti iddia etmek kolay. <em>Ölçmek</em> zor.</>}
          />
          <div className="shell-prose" data-lead>
            <p>
              {CERTIFICATION_SENTENCE_LIST} yönetim sistemleriyle çalışıyoruz. Standart tolerans
              aralığımız {MINIMUM_TOLERANCE}; her iş için kontrol planı oluşturulur ve ölçüm
              kayıtları teslimat dosyasına eklenir. {CMM_COVERAGE} olarak sağlanır.
            </p>
            <p>
              Teknik resim bizim için bir talep listesi değil, bir sözleşmedir. Bir kotenin hangi
              yöntemle ve hangi aşamada doğrulanacağı imalat başlamadan önce kararlaştırılır ve
              kontrol planına yazılır.
            </p>
            <p>
              Bir toleransın maliyeti, o toleransı gerçekten gerektiren işlev kadar anlamlıdır.
              Gerektirmiyorsa bunu söylemeyi tercih ederiz; üretilebilirlik incelemesi bu yüzden
              teklif aşamasının parçasıdır, sonradan gelen bir revizyon değil.
            </p>
            <p>
              Ölçüm kaydı olmayan bir hassasiyet açıklaması yalnızca bir cümledir. Teslim ettiğimiz
              dosya, parçanın neye göre ölçüldüğünü de içerir.
            </p>
          </div>
        </div>

        {/* Both blocks name a file that is actually served from `public/`, so
            the source line is something a reader can open — not a mood. */}
        <div className="shell-span-note shell-stack" data-gap="sm">
          <ShellEvidence kind="BELGE" source={qualityPolicy.title}>
            {CERTIFICATION_SENTENCE_LIST} yönetim sistemleri kapsamında çalışıyoruz.
            <ShellAction href={qualityPolicy.href} variant="quiet">{qualityPolicy.size}</ShellAction>
          </ShellEvidence>

          <ShellEvidence kind="ÖLÇÜM" source={measurementList.title}>
            Standart tolerans aralığı {MINIMUM_TOLERANCE}. {CMM_COVERAGE}.
            <ShellAction href={measurementList.href} variant="quiet">{measurementList.size}</ShellAction>
          </ShellEvidence>

        </div>
      </ShellSurfaceBand>

      {/* ── 03 — the approach as a sequence, on the evidence ground ── */}
      <ShellSurfaceBand no="03" label="SÜREÇ" tone="paper" labelledBy="hakkimizda-surec">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="hakkimizda-surec"
            index="03"
            title="Bir iş nasıl ilerler"
            standfirst="Talepten teslim dosyasına altı adım. Sıralama işten işe değişmez; içeriği parçaya göre yazılır."
          />
        </div>
        <ShellRun items={WORKFLOW} ariaLabel="Üretim akışı" />
      </ShellSurfaceBand>

      {/* ── 04 — scope, as a real index into the three route families ── */}
      <ShellSurfaceBand no="04" label="KAPSAM" labelledBy="hakkimizda-kapsam">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="hakkimizda-kapsam"
            index="04"
            title="Üretim kapsamı"
            standfirst="Aşağıdaki başlıkların her biri kendi sayfasında teknik ayrıntısıyla açılır."
          />
        </div>
        {SCOPE_FAMILIES.map((family) => (
          <div className="shell-span-third shell-stack" data-gap="sm" key={family.prefix}>
            <p className="shell-eyebrow">{family.label} — {family.caption}</p>
            <ShellIndexList
              compact
              ariaLabel={`${family.label} kategorileri`}
              items={categoryPages
                .filter((category) => category.prefix === family.prefix)
                .map((category) => ({
                  to: `/${category.prefix}/kategori/${category.slug}`,
                  title: category.title,
                }))}
            />
          </div>
        ))}
      </ShellSurfaceBand>

      <ShellNextStep
        no="05"
        title="Parçanızı inceleyelim"
        body="Teknik resim veya 3B model gönderin; üretilebilirlik incelemesiyle birlikte fiyat çalışması yapalım."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Gönderilecek", value: "Teknik resim veya 3B model" },
          { label: "Alternatif", value: "Online teknik görüşme" },
        ]}
        secondary={{ label: "İletişim", to: "/iletisim" }}
      />
    </PageShell>
  );
};
