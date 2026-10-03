import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useSiteData } from "@/i18n/data";
import {
  PageShell,
  ShellAction,
  ShellBand,
  ShellEmpty,
  ShellNextStep,
  ShellNotice,
  ShellPageHero,
  ShellPlate,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { MaterialRegister } from "@/components/pages/MaterialRegister";
import { compareFigure, familyName, figure, hardness, UNVERIFIED_FIGURE } from "@/components/pages/material-figures";
import type { Material, MaterialCategoryPage } from "@/data/materialsData";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME } from "@/content/claims";
import referencePlate from "@/assets/hero-malzeme-kutuphanesi.webp";
import referencePlate640 from "@/assets/hero-malzeme-kutuphanesi-640.webp";
import referencePlate960 from "@/assets/hero-malzeme-kutuphanesi-960.webp";

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

   4. NO IMAGE SEQUENCE (M01). `MaterialMorphScroll` — a 300vh scroll-scrubbed
      canvas over an 80-frame sequence with 1–5 "score" bars — used to sit
      between the hero and the register. It made the reader scroll past three
      screens of motion before reaching the data the page exists for, it
      eagerly fetched frames on first paint, and its score bars were exactly
      the kind of undocumented rating the material contract now forbids. The
      page order is hero → families → register/compare → one static reference
      plate → next step. The component and the sequence files stay on disk
      until another route is proven not to need them.
   ══════════════════════════════════════════════════════════════════════════ */

/* T03: sorting by the undocumented 1–5 machinability score and by price band
   is gone. Numeric sorts put records without a source LAST in either
   direction (`compareFigure`) — an unknown value is never treated as 0. */
const SORT_OPTIONS = [
  { id: "name", label: "İsim (A→Z)" },
  { id: "density", label: "Yoğunluk (düşük → yüksek)" },
  { id: "tensileStrength", label: "Mukavemet (yüksek → düşük)" },
];

const MAX_COMPARE = 4;

/* Labels and the "not stated / not verified" words are i18n keys; the
   figures themselves are never translated. */
const comparisonRows = (
  t: TFunction,
  families: readonly MaterialCategoryPage[],
): { label: string; read: (material: Material) => string }[] => [
  { label: t("Aile"), read: (m) => familyName(m, families) },
  { label: t("Grade / temper"), read: (m) => m.gradeTemper ?? t("Belirtilmedi") },
  { label: t("Ürün formu"), read: (m) => (m.productForm ? t(m.productForm) : t("Belirtilmedi")) },
  { label: t("Yoğunluk (g/cm³)"), read: (m) => t(figure(m, "density")) },
  { label: t("Çekme mukavemeti (MPa)"), read: (m) => t(figure(m, "tensileStrength")) },
  { label: t("Sertlik"), read: (m) => t(hardness(m)) },
  { label: t("Maks. sıcaklık (°C)"), read: (m) => t(figure(m, "maxTemperature")) },
  { label: t("Isı iletkenliği (W/m·K)"), read: (m) => t(figure(m, "thermalConductivity")) },
  { label: t("Değer koşulu"), read: (m) => m.propertyConditions },
  { label: t("Kaynak"), read: (m) => m.source?.document ?? t(UNVERIFIED_FIGURE) },
];

export const Malzemeler = () => {
  const { t, i18n } = useTranslation();
  const { materialCategories, materialsData } = useSiteData();
  const COMPARISON_ROWS = comparisonRows(t, materialCategories);
  usePageMeta({
    title: t("Malzemeler"),
    description: t("CNC işlemede kullanılan alüminyum, çelik, titanyum ve mühendislik plastikleri — teknik özellikler ve karşılaştırma."),
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
        case "density": return compareFigure("density", "asc")(a, b);
        case "tensileStrength": return compareFigure("tensileStrength", "desc")(a, b);
        default: return a.name.localeCompare(b.name, i18n.language);
      }
    });
    return result;
  }, [activeFamily, query, sortBy, materialsData, materialCategories, i18n.language]);

  const activeFamilyPage = materialCategories.find((item) => item.slug === activeFamily);
  const toggleCompare = (material: Material) =>
    setCompare((current) => current.some((item) => item.id === material.id)
      ? current.filter((item) => item.id !== material.id)
      : current.length >= MAX_COMPARE ? current : [...current, material]);

  return (
    <PageShell surface="graphite" rail={{ no: "R1", label: "MALZEME" }}>
      <JsonLdSchema
        type="productCatalog"
        name={t("Malzeme Kütüphanesi")}
        description={t("CNC işleme için alüminyum, çelik, titanyum, pirinç, bakır ve mühendislik plastikleri. Teknik özellikler ve karşılaştırma.")}
      />

      <ShellPageHero
        no="01"
        label="MALZEME"
        eyebrow={t("Teknik referans")}
        title={t("Malzeme kütüphanesi")}
        lede={t("CNC işlemede sık kullanılan metaller, mühendislik plastikleri ve kompozitler için karşılaştırmalı teknik kayıt. Aileyi seçin, değerleri yan yana okuyun, seçtiğiniz malzemeyle teklif dosyası açın.")}
        meta={[
          { label: t("Kayıt türü"), value: t("Karşılaştırmalı teknik referans") },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t("Teklif dönüşü"), value: t(QUOTE_RESPONSE_TIME) },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">{t("Teklif Al")}</ShellAction>
            <ShellAction href="#kayit" variant="ghost">{t("Kayda geç")}</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="AİLE" labelledBy="malzeme-aile">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="malzeme-aile"
            index="02"
            title={t("Malzeme aileleri")}
            standfirst={t("Bir aile seçtiğinizde kayıt daralır; ailenin kendi teknik sayfasına da buradan geçebilirsiniz.")}
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
                <span>{t("Tümü")}</span>
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
              {t("{{name}} teknik sayfası", { name: activeFamilyPage.name })}
            </ShellAction>
          )}
        </div>
      </ShellSurfaceBand>

      <ShellBand no="03" label="KAYIT" id="kayit" ariaLabel={t("Malzeme kaydı")}>
        <div className="tl-grid shell-surface-body">
          {/* One block container, so the sticky bar travels the register's
              whole height and releases before the next band — the contract
              `e2e/malzemeler-sticky.spec.ts` measures. A grid item cannot do
              this: its containing block is its own grid area, one row tall. */}
          <div className="shell-span-full shell-register-scope">
            <section className="sticky shell-sticky-filter" aria-label={t("Kayıt filtreleri")}>
              <div className="shell-filter">
                <div className="shell-field shell-filter-search">
                  <label htmlFor="malzeme-arama">{t("Ara")}</label>
                  <input
                    id="malzeme-arama"
                    type="search"
                    value={query}
                    placeholder={t("7075, PEEK, titanyum…")}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="shell-field">
                  <label htmlFor="malzeme-sirala">{t("Sırala")}</label>
                  <select
                    id="malzeme-sirala"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{t(option.label)}</option>
                    ))}
                  </select>
                </div>
                <p className="shell-field-hint" role="status" id="malzeme-compare-status">
                  {query.trim()
                    ? t("“{{query}}” için {{count}} kayıt", { query: query.trim(), count: filtered.length })
                    : t("Karşılaştırma seçimi {{selected}}/{{max}}", { selected: compare.length, max: MAX_COMPARE })}
                  {/* UX02 — the limit is said, not only enforced: at 1 the
                      table needs a second pick, at 4 the other buttons are
                      disabled and this line says why. */}
                  {compare.length === 1 && <> · {t("Karşılaştırma tablosu için bir malzeme daha seçin.")}</>}
                  {compare.length >= MAX_COMPARE && <> · {t("En fazla {{max}} malzeme karşılaştırılabilir; başka birini eklemek için bir seçimi kaldırın.", { max: MAX_COMPARE })}</>}
                </p>
              </div>
            </section>

            {compare.length >= 2 && (
              <div className="shell-compare">
                <ShellSpecTable
                  caption={t("Karşılaştırma")}
                  note={t("Seçilen malzemeler yan yana. Kaynağı doğrulanmamış değerler “Veri doğrulanmadı” olarak gösterilir; teknik seçimde malzeme sertifikası esas alınır.")}
                  headers={[t("Özellik"), ...compare.map((material) => material.name)]}
                  rows={COMPARISON_ROWS.map((row) => [
                    row.label,
                    ...compare.map((material) => row.read(material)),
                  ])}
                  rowKey={(_, index) => COMPARISON_ROWS[index].label}
                />
                <ShellAction variant="ghost" onClick={() => setCompare([])}>
                  {t("Seçimi temizle")}
                </ShellAction>
              </div>
            )}

            {filtered.length > 0 ? (
              <MaterialRegister
                materials={filtered}
                caption={t("Malzeme kaydı")}
                note={t("Sayısal değerler, kaynağı doğrulanan kayıtlarda gösterilir; diğerlerinde “Veri doğrulanmadı” yazar. Satırı açtığınızda grade/temper, değer koşulu, öne çıkan taraf ve dikkat edilecek noktalar görünür.")}
                selected={compare.map((material) => material.id)}
                onToggleSelect={toggleCompare}
                maxSelected={MAX_COMPARE}
              />
            ) : (
              <ShellEmpty
                label="EŞLEŞME YOK"
                title={t("Bu filtreyle kayıt bulunamadı")}
                detail={t("Arama terimini kısaltmayı veya aile seçimini kaldırmayı deneyin.")}
                action={
                  <ShellAction
                    variant="ghost"
                    onClick={() => { setQuery(""); setActiveFamily("all"); }}
                  >
                    {t("Filtreleri temizle")}
                  </ShellAction>
                }
              />
            )}
          </div>
        </div>
      </ShellBand>

      <ShellSurfaceBand no="04" label="PAFTA" labelledBy="malzeme-pafta">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="malzeme-pafta"
            index="04"
            title={t("Referans görünüm")}
            standfirst={t("Kayıttaki değerleri okuduktan sonra yüzey ve form hakkında genel bir fikir için.")}
          />
        </div>
        <div className="shell-span-full">
          <MaterialReferencePlate />
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="05"
        title={t("Malzeme seçimini birlikte netleştirelim")}
        body={t("Parçanın işlevi, çalışma sıcaklığı ve ortamı belliyse alaşım seçimi teknik bir karardır. Teknik resminizi gönderin, seçeneği gerekçesiyle birlikte yazalım.")}
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

const REFERENCE_CAPTION =
  "Temsili malzeme görünümü; teknik seçim yukarıdaki kayıt ve çalışma koşullarına göre yapılır.";

/* One still image, sized by `--shell-reference-plate-h` (≤480px desktop,
   ≤280px mobile). If it fails to load the frame is replaced by a note that
   says what was meant to be there — an empty bordered box would read as a
   broken page, and text is never placed inside the plate frame (I4). */
function MaterialReferencePlate() {
  const [failed, setFailed] = useState(false);
  const { t } = useTranslation();

  if (failed) {
    return (
      <ShellNotice label={t("GÖRSEL")} title={t("Referans görsel yüklenemedi")}>
        <p>{t(REFERENCE_CAPTION)}</p>
      </ShellNotice>
    );
  }

  return (
    <ShellPlate
      size="reference"
      plate={`${t("PAFTA")} 04`}
      caption={t(REFERENCE_CAPTION)}
      media={
        <img
          src={referencePlate}
          srcSet={`${referencePlate640} 640w, ${referencePlate960} 960w, ${referencePlate} 1600w`}
          sizes="(max-width: 767px) 100vw, 1200px"
          width={1600}
          height={896}
          alt={t("Farklı metal ve plastik yarı mamullerin yan yana görünümü")}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      }
    />
  );
}
