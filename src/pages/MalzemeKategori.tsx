import { Navigate, useParams } from "react-router-dom";
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
import { materialsData, materialCategories, findMaterialCategory } from "@/data/materialsData";
import { familyRanges } from "@/components/pages/material-figures";
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
   The hero now carries the family's property ENVELOPE — density, tensile,
   maximum temperature and machinability, each as a range — and every one of
   those four numbers is computed from the alloy table further down the same
   page (`familyRanges()`). It is the strictest form of evidence available
   here: the page cannot state a figure it does not also show. The old hero
   carried an emoji and a sentence.
   ══════════════════════════════════════════════════════════════════════════ */

export const MalzemeKategori = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = findMaterialCategory(slug || "");

  usePageMeta({
    title: category?.seoTitle ?? "Malzemeler",
    description: category?.seoDescription,
  });

  if (!category) return <Navigate to="/malzemeler" replace />;

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
        eyebrow={`${category.code} · Malzeme ailesi`}
        title={category.heroTitle}
        lede={category.heroDescription}
        meta={familyRanges(materials)}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>
            <ShellAction to="/malzemeler" variant="ghost">Malzeme kaydı</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="TANIM" labelledBy="malzeme-tanim">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock id="malzeme-tanim" index="02" title={`${category.name} nedir?`} />
          <div className="shell-prose" data-lead>
            <p>{category.content.intro}</p>
          </div>
        </div>
        <div className="shell-span-note shell-stack" data-gap="sm">
          <p className="shell-eyebrow">Aile özellikleri</p>
          <ShellTagRow items={category.advantages} ariaLabel={`${category.name} aile özellikleri`} />
          <p className="shell-note">
            Bu sayfadaki sayısal aralıklar, aşağıdaki alaşım kaydından hesaplanır.
          </p>
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="03" label="ÖZELLİK" tone="paper" labelledBy="malzeme-ozellik">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="malzeme-ozellik"
            index="03"
            title="Mekanik ve fiziksel özellikler"
            standfirst={category.content.properties}
          />
        </div>
        <div className="shell-span-full">
          <ShellSpecTable
            caption={`${category.name} alaşım kaydı`}
            note="Değerler malzeme standardının tipik aralıklarıdır; parçaya özgü kabul kriteri kontrol planında belirlenir."
            headers={["Alaşım", "Yoğunluk g/cm³", "Çekme MPa", "Sertlik", "Maks. °C", "İşlenebilirlik"]}
            rowKey={(_, index) => materials[index]?.id ?? String(index)}
            rows={materials.map((material) => [
              material.name,
              material.density,
              material.tensileStrength,
              material.hardness,
              material.maxTemperature,
              `${material.machinability}/5`,
            ])}
          />
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="04" label="KULLANIM" labelledBy="malzeme-kullanim">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock id="malzeme-kullanim" index="04" title="Kullanım alanları" />
          <div className="shell-prose">
            <p>{category.content.applications}</p>
          </div>
        </div>
        <div className="shell-span-note shell-stack" data-gap="sm">
          <p className="shell-eyebrow">Sık görülen uygulamalar</p>
          <ShellTagRow
            items={category.commonApplications}
            ariaLabel={`${category.name} uygulama alanları`}
          />
        </div>
      </ShellSurfaceBand>

      <ShellSurfaceBand no="05" label="İŞLEME" labelledBy="malzeme-isleme">
        <div className="shell-span-half shell-stack">
          <ShellTitleBlock id="malzeme-isleme" index="05" title="CNC işleme özellikleri" />
          <div className="shell-prose">
            <p>{category.content.machining}</p>
            <p>
              Standart çalışma aralığımız {MINIMUM_TOLERANCE}; ulaşılabilir tolerans parça
              geometrisi ve alaşım seçimiyle birlikte teknik incelemede belirlenir.
            </p>
          </div>
        </div>
        <div className="shell-span-half shell-stack">
          <ShellTitleBlock index="06" title="Seçim rehberi" />
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
              title="İlgili malzeme aileleri"
              standfirst="Aynı işlevi farklı bir maliyet veya ağırlık noktasında karşılayan aileler."
            />
          </div>
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel="İlgili malzeme aileleri"
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
        title={`${category.name} ile parça üretimi`}
        body="Teknik resim veya 3B model gönderin; alaşım seçimini üretilebilirlik incelemesiyle birlikte netleştirelim."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Standart tolerans", value: MINIMUM_TOLERANCE },
          { label: "Aile", value: category.name },
        ]}
        secondary={{ label: "İletişim", to: "/iletisim" }}
      />
    </PageShell>
  );
};
