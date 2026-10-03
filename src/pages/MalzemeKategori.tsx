import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteData } from "@/i18n/data";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellPageHero,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTagRow,
  ShellTitleBlock,
} from "@/components/shell";
import { familyRanges, figure, hardness } from "@/components/pages/material-figures";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   MATERIAL FAMILY — the technical reference for one material family

   WHAT THIS REPLACES
   ------------------
   168 lines carrying, between them, every offender the phase names:
   12px-radius tinted panels for the advantages and the selection guide,
   pill-shaped labels for the application areas, 8px-radius alloy cards that
   lifted and dropped a shadow on hover, an emoji at 4xl as the
   family's identity, a `bg-muted/30` band, and — bracketing the page — two
   full-bleed `linear-gradient(135deg, hsl(var(--primary)/.95) → ...)` bands
   whose second colour stop was the superseded `--forge-navy` forge palette.

   THE ONE STRUCTURAL ADDITION
   ---------------------------
   The hero now carries the family's property ENVELOPE — density, tensile and
   maximum temperature, each as a range — and every one of those numbers is
   computed from the SOURCED rows of the alloy table further down the same page
   (`familyRanges()`, T03); with no sourced row it reads "Veri doğrulanmadı". It is the strictest form of evidence available
   here: the page cannot state a figure it does not also show. The old hero
   carried an emoji and a sentence.
   ══════════════════════════════════════════════════════════════════════════ */

export const MalzemeKategori = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { materialsData, materialCategories, findMaterialCategory } = useSiteData();
  const category = findMaterialCategory(slug || "");

  usePageMeta({
    title: category?.seoTitle ?? t("Malzeme ailesi bulunamadı"),
    description:
      category?.seoDescription
      ?? t("Aradığınız malzeme ailesi bulunamadı. Aşağıdaki ailelerden devam edebilirsiniz."),
    noindex: !category,
  });

  if (!category) {
    /* PHASE 07 CORRECTION #1 — F3.
       This was `<Navigate to="/malzemeler" replace />`: an unknown family
       slug landed on the full materials index, which looks exactly like a
       page that resolved. A soft 404 is worse than a hard one — the reader
       cannot tell the request failed, and neither can a crawler. It now says
       so, in the family's own shell, with one `<h1>` and its own title, and
       still offers every real family as a way forward. */
    return (
      <PageShell surface="graphite" rail={{ no: "R1", label: "MALZEME" }}>
        <ShellPageHero
          no="01"
          label="MALZEME"
          crumb={
            <ShellBreadcrumb
              trail={[
                { label: "Ana sayfa", to: "/" },
                { label: "Malzemeler", to: "/malzemeler" },
              ]}
            />
          }
          eyebrow={t("AİLE YOK")}
          title={t("Bu malzeme ailesi bulunamadı")}
          lede={t("Bağlantı değişmiş olabilir. Aşağıdaki ailelerden devam edebilir veya tam malzeme kaydına geçebilirsiniz.")}
          actions={<ShellAction to="/malzemeler" variant="ghost">{t("Malzeme kaydı")}</ShellAction>}
        />
        <ShellSurfaceBand no="02" label="MALZEME" ariaLabel={t("Malzeme aileleri")}>
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={t("Malzeme aileleri")}
              items={materialCategories.map((item) => ({
                to: `/malzemeler/${item.slug}`,
                title: item.name,
                description: item.heroDescription,
              }))}
            />
          </div>
        </ShellSurfaceBand>
      </PageShell>
    );
  }

  const materials = materialsData.filter((item) => item.subcategory === category.subcategoryKey);
  const relatedCategories = materialCategories.filter((item) =>
    category.relatedCategories.includes(item.slug));

  return (
    <PageShell surface="graphite" rail={{ no: "R1", label: "MALZEME" }}>
      <ShellPageHero
        no="01"
        label="MALZEME"
        crumb={
          <ShellBreadcrumb
            trail={[
              { label: "Ana sayfa", to: "/" },
              { label: "Malzemeler", to: "/malzemeler" },
              { label: category.name },
            ]}
          />
        }
        eyebrow={`${category.code} · ${t("Malzeme ailesi")}`}
        title={category.heroTitle}
        lede={category.heroDescription}
        meta={familyRanges(materials).map((row) => ({ label: t(row.label), value: t(row.value) }))}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">{t("Teklif Al")}</ShellAction>
            <ShellAction to="/malzemeler" variant="ghost">{t("Malzeme kaydı")}</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="TANIM" labelledBy="malzeme-tanim">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock id="malzeme-tanim" index="02" title={t("{{name}} nedir?", { name: category.name })} />
          <div className="shell-prose" data-lead>
            <p>{category.content.intro}</p>
          </div>
        </div>
        <div className="shell-span-note shell-stack" data-gap="sm">
          <p className="shell-eyebrow">{t("Aile özellikleri")}</p>
          <ShellTagRow items={category.advantages} ariaLabel={t("{{name}} aile özellikleri", { name: category.name })} />
          <p className="shell-note">
            {t("Bu sayfadaki sayısal aralıklar, aşağıdaki alaşım kaydında kaynağı doğrulanmış değerlerden hesaplanır; doğrulanmamış değerler aralığa katılmaz.")}
          </p>
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="03" label="ÖZELLİK" tone="paper" labelledBy="malzeme-ozellik">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="malzeme-ozellik"
            index="03"
            title={t("Mekanik ve fiziksel özellikler")}
            standfirst={category.content.properties}
          />
        </div>
        <div className="shell-span-full">
          <ShellSpecTable
            caption={t("{{name}} alaşım kaydı", { name: category.name })}
            note={`${materials[0]?.propertyConditions ?? ""}. ${t("Kaynağı doğrulanmamış değerler “Veri doğrulanmadı” olarak gösterilir; parçaya özgü kabul kriteri kontrol planında belirlenir.")}`}
            headers={[t("Alaşım"), t("Yoğunluk g/cm³"), t("Çekme MPa"), t("Sertlik"), t("Maks. °C"), t("Kaynak")]}
            rowKey={(_, index) => materials[index]?.id ?? String(index)}
            rows={materials.map((material) => [
              material.name,
              t(figure(material, "density")),
              t(figure(material, "tensileStrength")),
              t(hardness(material)),
              t(figure(material, "maxTemperature")),
              material.source?.document ?? "—",
            ])}
          />
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="04" label="KULLANIM" labelledBy="malzeme-kullanim">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock id="malzeme-kullanim" index="04" title={t("Kullanım alanları")} />
          <div className="shell-prose">
            <p>{category.content.applications}</p>
          </div>
        </div>
        <div className="shell-span-note shell-stack" data-gap="sm">
          <p className="shell-eyebrow">{t("Sık görülen uygulamalar")}</p>
          <ShellTagRow
            items={category.commonApplications}
            ariaLabel={t("{{name}} uygulama alanları", { name: category.name })}
          />
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="05" label="İŞLEME" labelledBy="malzeme-isleme">
        <div className="shell-span-half shell-stack">
          <ShellTitleBlock id="malzeme-isleme" index="05" title={t("CNC işleme özellikleri")} />
          <div className="shell-prose">
            <p>{category.content.machining}</p>
            <p>
              {t("Standart çalışma aralığımız {{value}}; ulaşılabilir tolerans parça geometrisi ve alaşım seçimiyle birlikte teknik incelemede belirlenir.", { value: MINIMUM_TOLERANCE })}
            </p>
          </div>
        </div>
        <div className="shell-span-half shell-stack">
          <ShellTitleBlock index="06" title={t("Seçim rehberi")} />
          <div className="shell-prose">
            <p>{category.content.selection}</p>
          </div>
        </div>
      </ShellSurfaceBand>

      {relatedCategories.length > 0 && (
        <ShellSurfaceBand no="06" label="İLGİLİ" tone="paper" labelledBy="malzeme-ilgili">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="malzeme-ilgili"
              index="07"
              title={t("İlgili malzeme aileleri")}
              standfirst={t("Aynı işlevi farklı bir maliyet veya ağırlık noktasında karşılayan aileler.")}
            />
          </div>
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={t("İlgili malzeme aileleri")}
              items={relatedCategories.map((item) => ({
                to: `/malzemeler/${item.slug}`,
                index: item.code,
                title: item.name,
                description: item.shortDescription,
              }))}
            />
          </div>
        </ShellSurfaceBand>
      )}

      <ShellNextStep
        no="07"
        title={t("{{name}} ile parça üretimi", { name: category.name })}
        body={t("Teknik resim veya 3B model gönderin; alaşım seçimini üretilebilirlik incelemesiyle birlikte netleştirelim.")}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t("Aile"), value: category.name },
        ]}
        secondary={{ label: t("İletişim"), to: "/iletisim" }}
      />
    </PageShell>
  );
};
