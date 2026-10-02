import { lazy, Suspense, useMemo, useState } from "react";
import {
  PageShell,
  ShellAction,
  ShellBand,
  ShellEmpty,
  ShellLoading,
  ShellNextStep,
  ShellPageHero,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { MaterialRegister } from "@/components/pages/MaterialRegister";
import { PRICE_BAND } from "@/components/pages/material-figures";
import { materialCategories, materialsData, type Material } from "@/data/materialsData";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME } from "@/content/claims";

const MaterialMorphScroll = lazy(() =>
  import("@/components/MaterialMorphScroll").then((module) => ({ default: module.MaterialMorphScroll })));

/* ══════════════════════════════════════════════════════════════════════════
   MALZEMELER — the material register

   WHAT THIS REPLACES, AND WHY THE SHAPE CHANGED
   ---------------------------------------------
   352 lines whose visual vocabulary was the furthest of any page from the
   landing: two full-bleed `linear-gradient(135deg, hsl(var(--primary)) →
   hsl(var(--forge-navy)))` bands (`--forge-navy` being the superseded forge
   palette), 8px-radius category buttons inside a doubled teal ring,
   8px-radius material cards that lifted and dropped a shadow on hover,
   pill-shaped rating bars, pill-shaped application labels, emoji category
   icons, a `⭐` for "popular" and colour-only price badges.

   Underneath all of it was genuinely good technical data presented in the one
   form that made it unusable: one ~360px card per alloy, so two or three fit
   on screen and the single thing a materials library exists for — reading
   figures against each other — required opening a modal per material. The
   register (`MaterialRegister.tsx`) puts them in a table; ~30 alloys now
   occupy the space three cards did.

   THREE FUNCTIONAL DECISIONS WORTH NAMING
   ---------------------------------------
   1. PAGINATION IS GONE. It existed because cards are tall. Rows are not, and
      pagination was also the page's loudest disclosure of how large the
      library is (page count × page size), which §D MATERIAL_COUNT_VISIBILITY
      marks `PRIVATE_DO_NOT_DISCLOSE`. Removing it removed four controls, a
      `window.scrollTo` jump and a policy problem at once.

   2. THE TWO DIALOGS ARE GONE. Both were shadcn `Dialog`s portalled to
      `document.body` — outside `.shell-root`, so neither inherited the page's
      ground. The per-material detail is now an inline disclosure inside its
      own row, and the comparison is a band on the page.

   3. NO PUBLISHED TOTAL. `{materialsData.length}+ malzeme` in the hero, a
      count under every category tile and a count in every heading all
      published `MATERIAL_COUNT`, which §D marks
      `UNKNOWN_REMOVE_IF_UNVERIFIED` *and* `PRIVATE_DO_NOT_DISCLOSE`. A count
      now appears in exactly one place — as the answer to a search the reader
      typed — because that is a response to a query rather than a statement
      about the company.

   `MaterialMorphScroll` is kept and stays where it was. It is a real piece of
   the site's creative work, it already paints on the graphite ground, and on
   this page it now sits between two surfaces of the same family instead of
   between a teal gradient and a grid of white cards.
   ══════════════════════════════════════════════════════════════════════════ */

const SORT_OPTIONS = [
  { id: "name", label: "İsim (A→Z)" },
  { id: "density", label: "Yoğunluk (düşük → yüksek)" },
  { id: "tensileStrength", label: "Mukavemet (yüksek → düşük)" },
  { id: "machinability", label: "İşlenebilirlik (yüksek → düşük)" },
  { id: "priceCategory", label: "Fiyat bandı (düşük → yüksek)" },
];

const PRICE_ORDER: Record<Material["priceCategory"], number> = { low: 1, medium: 2, high: 3 };
const MAX_COMPARE = 4;

const COMPARISON_ROWS: { label: string; read: (material: Material) => string }[] = [
  { label: "Aile", read: (m) => m.subcategory },
  { label: "Yoğunluk (g/cm³)", read: (m) => String(m.density) },
  { label: "Çekme mukavemeti (MPa)", read: (m) => String(m.tensileStrength) },
  { label: "Sertlik", read: (m) => m.hardness },
  { label: "Maks. sıcaklık (°C)", read: (m) => String(m.maxTemperature) },
  { label: "Isı iletkenliği (W/m·K)", read: (m) => String(m.thermalConductivity) },
  { label: "İşlenebilirlik", read: (m) => `${m.machinability}/5` },
  { label: "Korozyon direnci", read: (m) => `${m.corrosionResistance}/5` },
  { label: "Fiyat bandı", read: (m) => PRICE_BAND[m.priceCategory] },
];

export const Malzemeler = () => {
  usePageMeta({
    title: "Malzemeler",
    description:
      "CNC işlemede kullanılan alüminyum, çelik, titanyum ve mühendislik plastikleri — teknik özellikler ve karşılaştırma.",
  });

  const [activeFamily, setActiveFamily] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [query, setQuery] = useState("");
  const [compare, setCompare] = useState<Material[]>([]);

  const filtered = useMemo(() => {
    let result = [...materialsData];
    const needle = query.trim().toLowerCase();
    if (needle) {
      result = result.filter((material) =>
        material.name.toLowerCase().includes(needle)
        || material.description.toLowerCase().includes(needle)
        || material.applications.some((application) => application.toLowerCase().includes(needle)));
    }
    if (activeFamily !== "all") {
      const family = materialCategories.find((item) => item.slug === activeFamily);
      if (family) result = result.filter((material) => material.subcategory === family.subcategoryKey);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "density": return a.density - b.density;
        case "tensileStrength": return b.tensileStrength - a.tensileStrength;
        case "machinability": return b.machinability - a.machinability;
        case "priceCategory": return PRICE_ORDER[a.priceCategory] - PRICE_ORDER[b.priceCategory];
        default: return a.name.localeCompare(b.name, "tr");
      }
    });
    return result;
  }, [activeFamily, query, sortBy]);

  const activeFamilyPage = materialCategories.find((item) => item.slug === activeFamily);
  const toggleCompare = (material: Material) =>
    setCompare((current) => current.some((item) => item.id === material.id)
      ? current.filter((item) => item.id !== material.id)
      : current.length >= MAX_COMPARE ? current : [...current, material]);

  return (
    <PageShell surface="graphite" rail={{ no: "R1", label: "MALZEME" }}>
      <JsonLdSchema
        type="productCatalog"
        name="Malzeme Kütüphanesi"
        description="CNC işleme için alüminyum, çelik, titanyum, pirinç, bakır ve mühendislik plastikleri. Teknik özellikler ve karşılaştırma."
      />

      <ShellPageHero
        no="01"
        label="MALZEME"
        eyebrow="Teknik referans"
        title="Malzeme kütüphanesi"
        lede="CNC işlemede sık kullanılan metaller, mühendislik plastikleri ve kompozitler için karşılaştırmalı teknik kayıt. Aileyi seçin, değerleri yan yana okuyun, seçtiğiniz malzemeyle teklif dosyası açın."
        meta={[
          { label: "Kayıt türü", value: "Karşılaştırmalı teknik referans" },
          { label: "Standart tolerans", value: MINIMUM_TOLERANCE },
          { label: "Teklif dönüşü", value: QUOTE_RESPONSE_TIME },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>
            <ShellAction href="#kayit" variant="ghost">Kayda geç</ShellAction>
          </>
        }
      />

      <Suspense fallback={<ShellLoading label="GÖRSEL DİZİ YÜKLENİYOR" />}>
        <MaterialMorphScroll />
      </Suspense>

      <ShellSurfaceBand no="02" label="AİLE" labelledBy="malzeme-aile">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="malzeme-aile"
            index="02"
            title="Malzeme aileleri"
            standfirst="Bir aile seçtiğinizde kayıt daralır; ailenin kendi teknik sayfasına da buradan geçebilirsiniz."
          />
        </div>
        {/* Same `shell-span-full shell-stack` shape that lost a column on ten
            other routes (R3-1 — see `ServiceDetail.tsx:423` for the mechanism
            and the numbers). This one measured inside its column at every
            width, 320 through 1440, so it is left as it is. Worth knowing that
            its survival is thinner than it looks: the register below is
            FILTERABLE, so its min-content is user-driven rather than fixed by
            the markup. The guard walks `/malzemeler`, and the register
            qualifies for keyboard reach through its own links rather than a
            granted tabindex. */}
        <div className="shell-span-full shell-stack" data-gap="sm">
          <ul className="shell-segments">
            <li>
              <button
                type="button"
                className="shell-segment"
                aria-pressed={activeFamily === "all"}
                onClick={() => setActiveFamily("all")}
              >
                <span className="shell-segment-code">ALL</span>
                <span>Tümü</span>
              </button>
            </li>
            {materialCategories.map((family) => (
              <li key={family.slug}>
                <button
                  type="button"
                  className="shell-segment"
                  aria-pressed={activeFamily === family.slug}
                  onClick={() => setActiveFamily(family.slug)}
                >
                  <span className="shell-segment-code">{family.code}</span>
                  <span>{family.name}</span>
                </button>
              </li>
            ))}
          </ul>
          {activeFamilyPage && (
            <ShellAction to={`/malzemeler/${activeFamilyPage.slug}`} variant="quiet">
              {activeFamilyPage.name} teknik sayfası
            </ShellAction>
          )}
        </div>
      </ShellSurfaceBand>

      <ShellBand no="03" label="KAYIT" id="kayit" ariaLabel="Malzeme kaydı">
        <div className="tl-grid shell-surface-body">
          {/* One block container, so the sticky bar travels the register's
              whole height and releases before the next band — the contract
              `e2e/malzemeler-sticky.spec.ts` measures. A grid item cannot do
              this: its containing block is its own grid area, one row tall. */}
          <div className="shell-span-full shell-register-scope">
            <section className="sticky shell-sticky-filter" aria-label="Kayıt filtreleri">
              <div className="shell-filter">
                <div className="shell-field shell-filter-search">
                  <label htmlFor="malzeme-arama">Ara</label>
                  <input
                    id="malzeme-arama"
                    type="search"
                    value={query}
                    placeholder="7075, PEEK, titanyum…"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="shell-field">
                  <label htmlFor="malzeme-sirala">Sırala</label>
                  <select
                    id="malzeme-sirala"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <p className="shell-field-hint" role="status">
                  {query.trim()
                    ? `“${query.trim()}” için ${filtered.length} kayıt`
                    : `Karşılaştırma seçimi ${compare.length}/${MAX_COMPARE}`}
                </p>
              </div>
            </section>

            {compare.length >= 2 && (
              <div className="shell-compare">
                <ShellSpecTable
                  caption="Karşılaştırma"
                  note="Seçilen malzemeler yan yana. Değerler malzeme standardının tipik aralıklarıdır."
                  headers={["Özellik", ...compare.map((material) => material.name)]}
                  rows={COMPARISON_ROWS.map((row) => [
                    row.label,
                    ...compare.map((material) => row.read(material)),
                  ])}
                  rowKey={(_, index) => COMPARISON_ROWS[index].label}
                />
                <ShellAction variant="ghost" onClick={() => setCompare([])}>
                  Seçimi temizle
                </ShellAction>
              </div>
            )}

            {filtered.length > 0 ? (
              <MaterialRegister
                materials={filtered}
                caption="Malzeme kaydı"
                note="Satırı açtığınızda malzemenin öne çıkan tarafı, dikkat edilecek noktaları ve uygulama alanları görünür."
                selected={compare.map((material) => material.id)}
                onToggleSelect={toggleCompare}
                maxSelected={MAX_COMPARE}
              />
            ) : (
              <ShellEmpty
                label="EŞLEŞME YOK"
                title="Bu filtreyle kayıt bulunamadı"
                detail="Arama terimini kısaltmayı veya aile seçimini kaldırmayı deneyin."
                action={
                  <ShellAction
                    variant="ghost"
                    onClick={() => { setQuery(""); setActiveFamily("all"); }}
                  >
                    Filtreleri temizle
                  </ShellAction>
                }
              />
            )}
          </div>
        </div>
      </ShellBand>

      <ShellNextStep
        no="04"
        title="Malzeme seçimini birlikte netleştirelim"
        body="Parçanın işlevi, çalışma sıcaklığı ve ortamı belliyse alaşım seçimi teknik bir karardır. Teknik resminizi gönderin, seçeneği gerekçesiyle birlikte yazalım."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Standart tolerans", value: MINIMUM_TOLERANCE },
          { label: "Alternatif", value: "Online teknik görüşme" },
        ]}
        secondary={{ label: "İletişim", to: "/iletisim" }}
      />
    </PageShell>
  );
};
