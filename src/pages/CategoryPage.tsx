import { useLocation, useParams } from "react-router-dom";
import { stripLocale } from "@/i18n/locale";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellPageHero,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { useTranslation } from "react-i18next";
import type { CategoryPageData } from "@/data/categoryPages";
import type { ServicePageData } from "@/data/servicePages";
import { useSiteData } from "@/i18n/data";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME, publishableSpecValues } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY PAGE — THE SERVICES LISTING *AND* THE SECTORS LISTING

   There is no `/hizmetler` or `/endustriyel` index route and this phase does
   not create one: `src/components/navigation/ia.ts` is Phase 03's public
   information architecture and `e2e/landing/navigation-reachability.spec.ts`
   proves route coverage against it, so a new index route would break a
   contract rather than satisfy one. This single component serves all three
   families — `/hizmetler/kategori/:slug`, `/kabiliyetler/kategori/:slug`,
   `/endustriyel/kategori/:slug` — and IS therefore the listing surface the
   phase asks for.

   WHAT THIS REPLACES
   ------------------
   109 lines of the same corporate template: breadcrumb, eyebrow, `<h1>`,
   lede, then `grid sm:grid-cols-2` of `border border-border bg-card p-6
   hover:border-primary hover:-translate-y-1 hover:shadow-lg` link cards, then
   a centred "Projeleriniz için detaylı bilgi almak ister misiniz?" and a teal
   pill.

   WHY AN INDEX AND NOT A CARD GRID
   --------------------------------
   A grid of equal cards is structurally incapable of the one job a listing
   has: telling the reader what DISTINGUISHES its entries. Every card is the
   same size, so every entry looks equally important and the only information
   the layout carries is "there are four of them".

   The register line carries more, and carries it from data that already
   exists: each row now shows up to two of the entry's OWN measured facts,
   read from that entry's `technicalSpecs` in `servicePages.ts`. A reader
   comparing CNC frezeleme with Hassas mikro işleme sees the two envelopes
   side by side on this page instead of opening both. Nothing is invented —
   if an entry has no publishable specs, the row simply has no chips.

   WHAT MAY BE LIFTED, AND WHY THAT IS NOT THE VIEW'S CALL
   ------------------------------------------------------
   The first version of `entryMeta` took `technicalSpecs.slice(0, 2)`, and a
   slice is not a filter: `seri-imalat` begins with two annual production
   volumes, so this listing began printing `50.000 adet/yıl` and
   `500.000 adet/yıl` — figures `USER_INPUTS.md` §0
   `DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: YES` withholds. That a reader
   could have checked them against the leaf page's own table is an argument
   about consistency, not about permission.

   The decision now belongs to `publishableSpecValues()` in
   `src/content/claims.ts`, which is an ALLOWLIST over classes of fact. A spec
   added to `servicePages.ts` later cannot leak through it silently: if its
   value is not recognisably a tolerance, an envelope, a measurement, a
   standard or a material grade, it is not printed here at all.

   The second band is new and exists for the same reason: the old page was a
   dead end that offered exactly one way out (a CTA). The sibling categories
   of the same family are one keystroke away now, which is what makes this a
   listing rather than a leaf.
   ══════════════════════════════════════════════════════════════════════════ */

const FAMILY = {
  hizmetler: { label: "Hizmetler", rail: { no: "03", label: "HİZMET" } },
  kabiliyetler: { label: "Kabiliyetler", rail: { no: "04", label: "KABİLİYET" } },
  endustriyel: { label: "Endüstriyel", rail: { no: "05", label: "SEKTÖR" } },
} as const;

/** Up to two PUBLISHABLE measured facts belonging to the entry itself. */
function entryMeta(path: string, getPageBySlug: (slug: string) => ServicePageData | undefined): string[] {
  const slug = path.split("/").filter(Boolean).pop();
  const page = slug ? getPageBySlug(slug) : undefined;
  return publishableSpecValues(page?.technicalSpecs, 2);
}

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { categoryPages, getPageBySlug } = useSiteData();
  const pathname = stripLocale(useLocation().pathname);
  const prefix: CategoryPageData["prefix"] = pathname.startsWith("/hizmetler")
    ? "hizmetler"
    : pathname.startsWith("/kabiliyetler")
      ? "kabiliyetler"
      : "endustriyel";
  const category = categoryPages.find((item) => item.slug === slug && item.prefix === prefix);
  const family = FAMILY[prefix];

  usePageMeta({
    title: category ? category.title : t("{{family}} — kategori bulunamadı", { family: t(family.label) }),
    description: category?.description,
    noindex: !category,
  });

  if (!category) {
    /* PHASE 07 CORRECTION #1 — F3.
       The first version put this message in `ShellEmpty`, whose `title` is a
       `<p>`, so three not-found bodies shipped with NO `<h1>` at all. The
       concern that produced it was real —
       `e2e/shared-shell-accessibility.spec.ts:363` asserts that no canonical
       route renders a heading matching /^(Sayfa|Yazı) Bulunamadı$/ — but the
       answer was to change the STRING, not to delete the element. This
       heading is "Bu kategori kaydı bulunamadı", which the anchored pattern
       does not match, and the spec keeps its full strength.

       `ShellPageHero` is the same primitive the found branch uses, so the
       not-found body is a page of the same family rather than a fragment. */
    return (
      <PageShell surface="graphite" rail={family.rail}>
        <ShellPageHero
          no="01"
          label={family.rail.label}
          crumb={
            <ShellBreadcrumb
              trail={[{ label: "Ana sayfa", to: "/" }, { label: t(family.label) }]}
            />
          }
          eyebrow={t("KATEGORİ YOK")}
          title={t("Bu kategori kaydı bulunamadı")}
          lede={t("Bağlantı değişmiş olabilir. Aşağıdaki listeden ilgili başlığa geçebilirsiniz.")}
          actions={<ShellAction to="/" variant="ghost">{t("Ana sayfa")}</ShellAction>}
        />
        <ShellSurfaceBand
          no="02"
          label={family.rail.label}
          ariaLabel={t("{{name}} kategorileri", { name: t(family.label) })}
        >
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={t("{{name}} kategorileri", { name: t(family.label) })}
              items={categoryPages
                .filter((item) => item.prefix === prefix)
                .map((item) => ({
                  to: `/${item.prefix}/kategori/${item.slug}`,
                  title: item.title,
                  description: item.description,
                }))}
            />
          </div>
        </ShellSurfaceBand>
      </PageShell>
    );
  }

  const siblings = categoryPages.filter(
    (item) => item.prefix === prefix && item.slug !== category.slug,
  );

  return (
    <PageShell surface="graphite" rail={family.rail}>
      <ShellPageHero
        no="01"
        label={family.rail.label}
        crumb={
          <ShellBreadcrumb
            trail={[
              { label: "Ana sayfa", to: "/" },
              { label: t(family.label) },
              { label: category.title },
            ]}
          />
        }
        eyebrow={t(family.label)}
        title={category.title}
        lede={category.description}
        meta={[
          { label: t("Aile"), value: t(family.label) },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t("Teklif dönüşü"), value: t(QUOTE_RESPONSE_TIME) },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">{t("Teklif Al")}</ShellAction>
            <ShellAction to="/iletisim" variant="ghost">{t("Teknik görüşme")}</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="İÇİNDEKİLER" labelledBy="kategori-icindekiler">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="kategori-icindekiler"
            index="02"
            title={t("Bu başlık altında")}
            standfirst={t("Her satır kendi sayfasına açılır; sağdaki değerler o sayfanın kendi teknik kaydından gelir.")}
          />
        </div>
        <div className="shell-span-full">
          <ShellIndexList
            ariaLabel={t("{{title}} sayfaları", { title: category.title })}
            items={category.links.map((link) => ({
              to: link.path,
              title: link.label,
              description: link.description,
              meta: entryMeta(link.path, getPageBySlug),
            }))}
          />
        </div>
      </ShellSurfaceBand>

      {siblings.length > 0 && (
        <ShellSurfaceBand no="03" label="AİLE" tone="paper" labelledBy="kategori-aile">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="kategori-aile"
              index="03"
              title={t("{{family}} — diğer başlıklar", { family: t(family.label) })}
              standfirst={t("Aradığınız iş bu kategoride değilse, aynı ailenin geri kalanı burada.")}
            />
          </div>
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={t("{{family}} ailesindeki diğer kategoriler", { family: t(family.label) })}
              items={siblings.map((item) => ({
                to: `/${item.prefix}/kategori/${item.slug}`,
                title: item.title,
                description: item.description,
              }))}
            />
          </div>
        </ShellSurfaceBand>
      )}

      <ShellNextStep
        no="04"
        title={t("{{title}} için teklif", { title: category.title })}
        body={t("Teknik resim veya 3B model gönderin; üretilebilirlik incelemesiyle birlikte fiyat çalışması yapalım.")}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t("Alternatif"), value: t("Online teknik görüşme") },
        ]}
        secondary={{ label: t("İletişim"), to: "/iletisim" }}
      />
    </PageShell>
  );
};
