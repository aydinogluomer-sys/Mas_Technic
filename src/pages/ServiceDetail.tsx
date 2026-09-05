import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useScroll, useTransform } from "framer-motion";
import { motion } from "@/components/shell/motion";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellPageHero,
  ShellPlate,
  ShellRun,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { getPageBySlug, getPagesByCategory } from "@/data/servicePages";
import { categoryPages } from "@/data/categoryPages";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME } from "@/content/claims";
import cncWorkshop from "@/assets/cnc-workshop.webp";
import qualityControl from "@/assets/quality-control.webp";
import heroCncFrezeleme from "@/assets/hero-cnc-frezeleme.webp";
import heroCncTornalama from "@/assets/hero-cnc-tornalama.webp";
import heroMikroIsleme from "@/assets/hero-mikro-isleme.webp";
import heroDerinDelik from "@/assets/hero-derin-delik.webp";
import heroEnjeksiyonKalibi from "@/assets/hero-enjeksiyon-kalibi.webp";
import heroAnodizasyon from "@/assets/hero-anodizasyon.webp";
import heroLazerKazima from "@/assets/hero-lazer-kazima.webp";
import heroHavacilik from "@/assets/hero-havacilik.webp";
import heroBasincliDokum from "@/assets/hero-basinçli-dokum.webp";
import heroFiksturAparat from "@/assets/hero-fikstur-aparat.webp";
import heroSilikonKaliplama from "@/assets/hero-silikon-kaliplama.webp";
import heroMekanikYuzey from "@/assets/hero-mekanik-yuzey.webp";
import heroKimyasalIslemler from "@/assets/hero-kimyasal-islemler.webp";
import heroBoyaKaplama from "@/assets/hero-boya-kaplama.webp";
import heroTavlama from "@/assets/hero-tavlama.webp";
import heroQrDatamatrix from "@/assets/hero-qr-datamatrix.webp";
import heroLogoMarkalama from "@/assets/hero-logo-markalama.webp";
import heroInsertUygulama from "@/assets/hero-insert-uygulama.webp";
import heroMekanikMontaj from "@/assets/hero-mekanik-montaj.webp";
import heroKittingPaketleme from "@/assets/hero-kitting-paketleme.webp";
import heroKaynakliImalat from "@/assets/hero-kaynakli-imalat.webp";
import heroMakineParkuru from "@/assets/hero-makine-parkuru.webp";
import heroKaliteKontrol from "@/assets/hero-kalite-kontrol.webp";
import heroDfmTasarim from "@/assets/hero-dfm-tasarim.webp";
import heroYuzeyIslemleri from "@/assets/hero-yuzey-islemleri.webp";
import heroToleransHassasiyet from "@/assets/hero-tolerans-hassasiyet.webp";
import heroMalzemeKutuphanesi from "@/assets/hero-malzeme-kutuphanesi.webp";
import heroProjeYonetimi from "@/assets/hero-proje-yonetimi.webp";
import heroTedarikZinciri from "@/assets/hero-tedarik-zinciri.webp";
import heroOperasyonelVerimlilik from "@/assets/hero-operasyonel-verimlilik.webp";
import heroSeriUretim from "@/assets/hero-seri-uretim.webp";

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE · CAPABILITY · SECTOR DETAIL

   One component serves `/hizmetler/:slug`, `/kabiliyetler/:slug` and
   `/endustriyel/:slug`. The substance was never the problem — process steps,
   advantages, features, materials, comparison tables, an FAQ, a technical
   specification sheet, related pages — the LANGUAGE was: `bg-card` +
   `hover:shadow-lg` + `hover:-translate-y-1` cards, two circular tinted
   blobs behind two blocks, a teal header bar on the
   spec sheet, and a hero that clipped its own title.

   ── BLOCKER I4 — THE 375 HERO CLIP, CLOSED STRUCTURALLY ──────────────────
   The hero was `<div class="relative h-[320px] md:h-[440px] overflow-hidden">`
   with an `absolute bottom-0 … pb-10` child holding the breadcrumb, the
   eyebrow, the `<h1>` and four spec chips. At 375 that child measured 424px
   inside a 320px box, so its top ~104px — the eyebrow and the WHOLE page
   title — were cut off; and because the block never intersected the viewport,
   its `whileInView` never fired either, so it also sat at `opacity: 0`. A
   second, dependent symptom of a layout defect.

   The repair is not a bigger box and not `opacity: 1`. The title block is now
   in normal flow in its own band and the photograph is a separate plate band
   below it, whose only children are the image and four corner ticks
   (`ShellPlate`). No caption length at any viewport can be clipped by a frame
   that contains no caption. The `<h1>` is a plain, always-visible heading with
   no reveal at all: a page title must not depend on an IntersectionObserver,
   which is I4's real lesson. `e2e/landing/motion-grammar.spec.ts` asserts the
   heading's opacity is monotonic non-decreasing across scroll; a constant 1
   satisfies it by construction rather than by timing.

   The plate keeps the cinematic motion — a scale settle and a ±60px parallax,
   both suppressed under `prefers-reduced-motion` — because that is what
   cinematic motion is for: a photograph, not a heading.

   ── BLOCKER B24 — CONTRAST ───────────────────────────────────────────────
   The 28 serious `color-contrast` nodes were the teal `--primary` chrome on
   `bg-card`: the eyebrow, the spec chips, the numbered step badges, the
   feature titles and the sidebar labels. Phase 04 measured the chip at
   4.025:1 against its true composited ancestor `rgb(249,248,245)`. None of
   that chrome exists any more. Every text run on this page now resolves from
   the shell's ink ladder against the graphite ground, which is where the
   ladder's steps were chosen and measured. Ratios are reported from rendered
   pixels in the phase report, not asserted here.

   ── THE GHOST VIDEO IS GONE ──────────────────────────────────────────────
   `/machine-loop.mp4` autoplayed on a loop behind the hero with no pause
   control. Looping motion longer than five seconds with no mechanism to stop
   it is WCAG 2.2.2, and `prefers-reduced-motion` cannot reach an autoplaying
   `<video>` from CSS. It also cost a video request on ~60 routes.

   ── READING AS A SECTOR PAGE (`/endustriyel/*`) ──────────────────────────
   The same bands, framed as the question a sector visitor is actually asking.
   Section titles change ("Bu sektörde ne üretiyoruz", "Sektör kabiliyet
   kaydı", "Sektör akışı"), and the closing index adds the SERVICE families
   the sector's parts are produced with — so a sector page ends in capability
   evidence and a route into it, rather than in more sector links.
   ══════════════════════════════════════════════════════════════════════════ */

const heroImageMap: Record<string, string> = {
  "hero-cnc-frezeleme": heroCncFrezeleme,
  "hero-cnc-tornalama": heroCncTornalama,
  "hero-mikro-isleme": heroMikroIsleme,
  "hero-derin-delik": heroDerinDelik,
  "hero-enjeksiyon-kalibi": heroEnjeksiyonKalibi,
  "hero-anodizasyon": heroAnodizasyon,
  "hero-lazer-kazima": heroLazerKazima,
  "hero-havacilik": heroHavacilik,
  "hero-basincli-dokum": heroBasincliDokum,
  "hero-fikstur-aparat": heroFiksturAparat,
  "hero-silikon-kaliplama": heroSilikonKaliplama,
  "hero-mekanik-yuzey": heroMekanikYuzey,
  "hero-kimyasal-islemler": heroKimyasalIslemler,
  "hero-boya-kaplama": heroBoyaKaplama,
  "hero-tavlama": heroTavlama,
  "hero-qr-datamatrix": heroQrDatamatrix,
  "hero-logo-markalama": heroLogoMarkalama,
  "hero-insert-uygulama": heroInsertUygulama,
  "hero-mekanik-montaj": heroMekanikMontaj,
  "hero-kitting-paketleme": heroKittingPaketleme,
  "hero-kaynakli-imalat": heroKaynakliImalat,
  "hero-makine-parkuru": heroMakineParkuru,
  "hero-kalite-kontrol": heroKaliteKontrol,
  "hero-dfm-tasarim": heroDfmTasarim,
  "hero-yuzey-islemleri": heroYuzeyIslemleri,
  "hero-tolerans-hassasiyet": heroToleransHassasiyet,
  "hero-malzeme-kutuphanesi": heroMalzemeKutuphanesi,
  "hero-proje-yonetimi": heroProjeYonetimi,
  "hero-tedarik-zinciri": heroTedarikZinciri,
  "hero-operasyonel-verimlilik": heroOperasyonelVerimlilik,
  "hero-seri-uretim": heroSeriUretim,
};

const FAMILY = {
  hizmetler: { label: "Hizmetler", rail: { no: "03", label: "HİZMET" } },
  kabiliyetler: { label: "Kabiliyetler", rail: { no: "04", label: "KABİLİYET" } },
  endustriyel: { label: "Endüstriyel", rail: { no: "05", label: "SEKTÖR" } },
} as const;

/**
 * `features` are authored as `"Başlık — açıklama"` in `servicePages.ts`. The
 * old renderer printed the whole string inside a numbered card, so the title
 * and its explanation carried the same weight. Splitting on the em dash costs
 * nothing and gives the run a real hierarchy; a feature with no dash keeps its
 * whole string as the title.
 */
function splitFeature(feature: string) {
  const parts = feature.split(/\s+—\s+/);
  return parts.length > 1
    ? { title: parts[0], detail: parts.slice(1).join(" — ") }
    : { title: feature };
}

export const ServiceDetail = () => {
  const { slug } = useParams<{ category: string; slug: string }>();
  const { pathname } = useLocation();
  const page = slug ? getPageBySlug(slug) : undefined;
  const prefersReduced = usePrefersReducedMotion();

  /* PHASE 07 CORRECTION #1 — F3.
     The not-found branch hard-coded `{ no: "03", label: "HİZMET" }`, so
     `/endustriyel/<unknown>` told the reader it was in the services family.
     These routes carry no `:category` param (`/hizmetler/:slug`,
     `/kabiliyetler/:slug`, `/endustriyel/:slug`), so the family is derived
     from the path — the same derivation `CategoryPage` uses. */
  const pathFamily: keyof typeof FAMILY = pathname.startsWith("/kabiliyetler")
    ? "kabiliyetler"
    : pathname.startsWith("/endustriyel")
      ? "endustriyel"
      : "hizmetler";

  /* And the title: an unknown slug fell back to the SITE DEFAULT, which reads
     to a crawler and to a tab strip as though the page had resolved.
     `usePageMeta` cannot be called conditionally, so the found branch gets a
     real title too — an improvement, and the reason the argument is computed
     rather than the hook skipped. */
  usePageMeta(
    page
      ? { title: page.title, description: page.description }
      : {
          title: `${FAMILY[pathFamily].label} — sayfa bulunamadı`,
          description:
            "Aradığınız kayıt bulunamadı. Hizmet ve sektör başlıklarına ana sayfadan ulaşabilirsiniz.",
        },
  );

  const plateRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: plateRef,
    offset: ["start end", "end start"],
  });
  /* ±60px, matching the plate frame's symmetric 60px overscan in `shell.css`,
     so the image covers the frame at BOTH ends of the travel. The hero this
     replaces translated a `h-full` image 0→120px inside `overflow:hidden` and
     exposed the box at the bottom of the range. Zero under reduced motion:
     a scroll-linked transform is motion whatever drives it. */
  const plateY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [-60, 60]);

  if (!page) {
    /* F3: one `<h1>`, from the same primitive the found branch uses. The
       string is not "Sayfa Bulunamadı", so the anchored canonical-route check
       in `e2e/shared-shell-accessibility.spec.ts` keeps its full strength —
       the earlier fix changed the ELEMENT to avoid that check when it only
       ever needed to change the STRING. */
    const notFoundFamily = FAMILY[pathFamily];
    return (
      <PageShell surface="graphite" rail={notFoundFamily.rail}>
        <ShellPageHero
          no="01"
          label={notFoundFamily.rail.label}
          crumb={
            <ShellBreadcrumb
              trail={[{ label: "Ana sayfa", to: "/" }, { label: notFoundFamily.label }]}
            />
          }
          eyebrow="KAYIT YOK"
          title="Bu sayfa kaydı bulunamadı"
          lede="Bağlantı değişmiş olabilir. Aşağıdaki başlıklardan devam edebilirsiniz."
          actions={<ShellAction to="/" variant="ghost">Ana sayfa</ShellAction>}
        />
        <ShellSurfaceBand
          no="02"
          label={notFoundFamily.rail.label}
          ariaLabel={`${notFoundFamily.label} kategorileri`}
        >
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={`${notFoundFamily.label} kategorileri`}
              items={categoryPages
                .filter((item) => item.prefix === pathFamily)
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

  const family = FAMILY[page.category];
  const isSector = page.category === "endustriyel";
  const related = getPagesByCategory(page.category).filter((item) => item.slug !== page.slug);
  const parent = categoryPages.find((category) =>
    category.prefix === page.category
    && category.links.some((link) => link.path === `/${page.category}/${page.slug}`));
  const serviceFamilies = categoryPages.filter((category) => category.prefix === "hizmetler");
  const specs = page.technicalSpecs ?? [];
  const materialRows = page.materials ?? [];
  const heroImage = page.heroImage && heroImageMap[page.heroImage]
    ? heroImageMap[page.heroImage]
    : page.category === "kabiliyetler" ? qualityControl : cncWorkshop;

  /* Band numbers are assigned in render order, so a page without comparison
     tables does not leave a hole in the sheet numbering. JSX evaluates its
     children in source order and `&&` short-circuits before the call. */
  let band = 0;
  const no = () => String(++band).padStart(2, "0");

  return (
    <PageShell surface="graphite" rail={family.rail}>
      <JsonLdSchema
        type="service"
        name={page.title}
        description={page.description}
        category={page.categoryLabel}
        faq={page.faq}
      />

      <ShellPageHero
        no={no()}
        label={family.rail.label}
        crumb={
          <ShellBreadcrumb
            trail={[
              { label: "Ana sayfa", to: "/" },
              { label: family.label },
              ...(parent
                ? [{ label: parent.title, to: `/${parent.prefix}/kategori/${parent.slug}` }]
                : []),
              { label: page.title },
            ]}
          />
        }
        eyebrow={page.categoryLabel}
        title={page.title}
        lede={page.description}
        meta={(page.technicalSpecs ?? []).slice(0, 4).map((spec) => ({
          label: spec.label,
          value: spec.value,
        }))}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>
            <ShellAction to="/iletisim" variant="ghost">Teknik görüşme</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no={no()} label="TANIM" labelledBy="detay-tanim">
        <div className="shell-span-full" ref={plateRef}>
          <ShellPlate
            plate={`PLAKA · ${page.title.toLocaleUpperCase("tr")}`}
            caption={page.categoryLabel}
            media={
              <motion.img
                src={heroImage}
                alt={page.title}
                loading="eager"
                style={{ y: plateY }}
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            }
          />
        </div>

        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="detay-tanim"

            title={isSector ? "Bu sektörde ne üretiyoruz" : "Kapsam"}
          />
          <div className="shell-prose" data-lead>
            {page.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>

        {page.advantages && page.advantages.length > 0 && (
          <div className="shell-span-note shell-stack" data-gap="sm">
            <p className="shell-eyebrow">{isSector ? "Sektöre uygunluk" : "Öne çıkan"}</p>
            <ul className="shell-detail-list">
              {page.advantages.map((advantage) => <li key={advantage}>{advantage}</li>)}
            </ul>
          </div>
        )}
      </ShellSurfaceBand>

      {((page.features && page.features.length > 0)
        || (page.technicalSpecs && page.technicalSpecs.length > 0)) && (
        <ShellSurfaceBand no={no()} label="KABİLİYET" tone="paper" labelledBy="detay-kabiliyet">
          <div className="shell-doc">
            <div className="shell-doc-main">
              <ShellTitleBlock
                id="detay-kabiliyet"
                title={isSector ? "Sektör kabiliyet kaydı" : "Kabiliyet kaydı"}
                standfirst={
                  isSector
                    ? "Bu sektörün parçalarında hangi kabiliyetin devreye girdiği ve neyin kayda geçtiği."
                    : "Hizmetin kapsadığı kabiliyetler ve çalışma aralıkları."
                }
              />
              {page.features && page.features.length > 0 && (
                <ShellRun
                  ariaLabel={`${page.title} kabiliyetleri`}
                  items={page.features.map(splitFeature)}
                />
              )}
            </div>

            {page.technicalSpecs && page.technicalSpecs.length > 0 && (
              <div className="shell-doc-aside" data-sticky>
                <ShellSpecTable
                  caption="Teknik kayıt"
                  headers={["Başlık", "Değer"]}
                  rows={page.technicalSpecs.map((spec) => [spec.label, spec.value])}
                  rowKey={(_, index) => specs[index].label}
                />
                <ShellAction to="/teklif-al" variant="primary" full>Teklif Al</ShellAction>
              </div>
            )}
          </div>
        </ShellSurfaceBand>
      )}

      {page.processSteps && page.processSteps.length > 0 && (
        <ShellSurfaceBand no={no()} label="SÜREÇ" labelledBy="detay-surec">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="detay-surec"

              title={isSector ? "Sektör akışı" : "Süreç akışı"}
              standfirst={`Sıra sabittir; içerik parçaya göre yazılır. Standart çalışma aralığımız ${MINIMUM_TOLERANCE}.`}
            />
          </div>
          <ShellRun
            ariaLabel={`${page.title} süreç adımları`}
            items={page.processSteps.map((step) => ({ title: step }))}
          />
        </ShellSurfaceBand>
      )}

      {page.materials && page.materials.length > 0 && (
        <ShellSurfaceBand no={no()} label="MALZEME" tone="paper" labelledBy="detay-malzeme">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="detay-malzeme"

              title="İşlenebilir malzemeler"
              standfirst="Bu sayfada sık kullanılan malzemeler. Ailenin tamamı malzeme kaydındadır."
            />
          </div>
          {/* R3-1's SURFACE, AND THE TRACK IS THE FIX — PHASE 08 CORRECTION #5.

              `.shell-stack` is `display: grid` with an IMPLICIT column, so the
              track is `auto` and its automatic minimum is the widest item's
              min-content. `figure.shell-table`'s min-content is the table's —
              unbreakable material codes and property strings — so the figure
              grew PAST the wrapper it was given. `.shell-table-scroll`'s
              `overflow-x: auto` then had nothing to do (its box was already as
              wide as its content), `useScrollableRegionAccess` grants a
              tabindex only `if (isScrollable(element))` and granted nothing,
              and the last column was unreachable by touch, by keyboard and by
              a forced `scrollLeft`. Naming the track `minmax(0, 1fr)` — the
              same declaration `shell.css:1553` already uses for
              `.shell-form-row` — lets it shrink to the column and hands the
              overflow back to the scroll region that exists to take it.

              WHAT THIS WAS MEASURED TO BE, against the preview build over 76
              routes x 7 viewports: NOT one route at 320. This wrapper failed
              on SEVEN service routes, and on two of them at 375 and 390 as
              well. Track vs. the 278px column at 320 — cnc-frezeleme 295.078,
              cnc-tornalama 358 (also 375/390), anodizasyon 313.938,
              derin-delik-raybalama 306.156, hassas-mikro-isleme 305.281,
              malzeme-kutuphanesi 351.844 (also 375/390), havacilik-uzay
              295.078. After: 278 / 333 / 348, scroll region live, tabindex 0.

              WHY NOT `.shell-stack > * { min-width: 0 }` IN shell.css, which
              C4's comment proposed and which I measured as SAFE (375 records:
              it moved geometry only inside the defective figures, and nothing
              at all at 768/844/1280/1440 or on any golden surface)? Because
              `e2e/qa-p08-scroll-region-reach.spec.ts`'s live control restores
              the pre-C4 `shell-stack` markup on `/cerez-politikasi` and
              REQUIRES the guard to go red on it. Fixing the class makes R2-1
              impossible to express, the control goes green, and the guard
              fails — measured: `containerClientWidth` 276 against
              `scrollWidth` 584, `forcedScrollLeft` 308, `tabindex="0"`, zero
              problems where the control demands one. The class-level fix is
              correct and cannot land while that control stands; it belongs
              with whoever owns the spec.

              Watched by that same guard, and by `KabiliyetProfilDetay.tsx`,
              which carried the identical defect. */}
          <div className="shell-span-full shell-stack grid-cols-[minmax(0,1fr)]" data-gap="sm">
            <ShellSpecTable
              caption={`${page.title} — malzeme kaydı`}
              headers={["Malzeme", "Kalite", "Özellik"]}
              numericFrom={99}
              rows={page.materials.map((material) => [
                material.name,
                material.grade,
                material.properties,
              ])}
              rowKey={(_, index) => `${materialRows[index].name}-${index}`}
            />
            <ShellAction to="/malzemeler" variant="quiet">Malzeme kaydının tamamı</ShellAction>
          </div>
        </ShellSurfaceBand>
      )}

      {page.comparisonTables && page.comparisonTables.length > 0 && (
        <ShellSurfaceBand no={no()} label="KARŞILAŞTIRMA" labelledBy="detay-karsilastirma">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="detay-karsilastirma"

              title="Teknik karşılaştırma"
              standfirst="Seçenekler yan yana; hangisinin hangi koşulda anlamlı olduğu tabloların kendi notlarında."
            />
          </div>
          {page.comparisonTables.map((table, index) => (
            <div className="shell-span-full" key={table.title}>
              <ShellSpecTable
                caption={table.title}
                note={table.description}
                headers={table.headers}
                rows={table.rows}
                highlight={table.highlight}
                rowKey={(_, rowIndex) => `${index}-${rowIndex}`}
              />
            </div>
          ))}
        </ShellSurfaceBand>
      )}

      {page.faq && page.faq.length > 0 && (
        <ShellSurfaceBand no={no()} label="SORULAR" tone="paper" labelledBy="detay-sorular">
          <div className="shell-span-read">
            <ShellTitleBlock id="detay-sorular" title="Sık sorulan sorular" />
          </div>
          <div className="shell-span-full">
            <div className="shell-faq">
              {page.faq.map((item) => (
                <details className="shell-faq-item" key={item.question}>
                  <summary>{item.question}</summary>
                  <div className="shell-faq-answer"><p>{item.answer}</p></div>
                </details>
              ))}
            </div>
          </div>
        </ShellSurfaceBand>
      )}

      <ShellSurfaceBand no={no()} label="İLGİLİ" labelledBy="detay-ilgili">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="detay-ilgili"

            title={isSector ? "Bu sektörün yakınındaki sayfalar" : "İlgili sayfalar"}
            standfirst={
              isSector
                ? "Aynı sektör ailesindeki diğer başlıklar ve bu parçaların üretildiği hizmet aileleri."
                : "Aynı aileden, birlikte sorulan başlıklar."
            }
          />
        </div>
        {related.length > 0 && (
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={`${family.label} ailesindeki diğer sayfalar`}
              items={related.slice(0, 8).map((item) => ({
                to: `/${item.category}/${item.slug}`,
                eyebrow: item.categoryLabel,
                title: item.title,
                description: item.description,
                meta: (item.technicalSpecs ?? []).slice(0, 2).map((spec) => spec.value),
              }))}
            />
          </div>
        )}
        {isSector && (
          /* Same `shell-span-full shell-stack` shape as the malzeme-kaydı
             wrapper above, WITHOUT its `minmax(0, 1fr)` track — deliberately.
             Measured inside its column at every width
             (278/333/348/710/786/1214/1374) because an index list wraps and
             has no min-content floor a table has. It is left alone so the
             track override stays where a measurement put it; if a child ever
             stops wrapping, the guard
             (`e2e/qa-p08-scroll-region-reach.spec.ts`) only walks tables, so
             this one would need its own measurement. */
          <div className="shell-span-full shell-stack" data-gap="sm">
            <p className="shell-eyebrow">Bu parçalar hangi hizmetlerle üretiliyor</p>
            <ShellIndexList
              compact
              ariaLabel="Hizmet aileleri"
              items={serviceFamilies.map((category) => ({
                to: `/${category.prefix}/kategori/${category.slug}`,
                title: category.title,
                description: category.description,
              }))}
            />
          </div>
        )}
      </ShellSurfaceBand>

      <ShellNextStep
        no={no()}
        title={`${page.title} için teklif`}
        /* The title is NOT lower-cased. `toLocaleLowerCase("tr")` turned
           "CNC Frezeleme" into "cnc frezeleme" mid-sentence, which reads as a
           typo for an acronym and is wrong for every page whose title carries
           one (CNC, QR, DFM, NDT). */
        body={`Teknik resim veya 3B model gönderin; ${page.title} kapsamında üretilebilirlik incelemesiyle birlikte fiyat çalışması yapalım.`}
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Standart tolerans", value: MINIMUM_TOLERANCE },
          { label: family.label, value: page.categoryLabel },
        ]}
        secondary={{ label: "Teknik görüşme", to: "/iletisim" }}
      />
    </PageShell>
  );
};

