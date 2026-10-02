import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { Navigate } from "@/i18n/LocaleLink";
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
import { resolveDetailRoute } from "@/lib/detail-route";
import { useTranslation } from "react-i18next";
import { useSiteData } from "@/i18n/data";
import { upper } from "@/i18n/upper";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MINIMUM_TOLERANCE, QUOTE_RESPONSE_TIME } from "@/content/claims";
import { coverSizes, responsive, type ResponsiveImage } from "@/components/BlurImage";
import qualityControl from "@/assets/quality-control.webp";
import qualityControl640 from "@/assets/quality-control-640.webp";
import qualityControl960 from "@/assets/quality-control-960.webp";
import heroCncFrezeleme from "@/assets/hero-cnc-frezeleme.webp";
import heroCncFrezeleme640 from "@/assets/hero-cnc-frezeleme-640.webp";
import heroCncFrezeleme960 from "@/assets/hero-cnc-frezeleme-960.webp";
import heroCncTornalama from "@/assets/hero-cnc-tornalama.webp";
import heroCncTornalama640 from "@/assets/hero-cnc-tornalama-640.webp";
import heroMikroIsleme from "@/assets/hero-mikro-isleme.webp";
import heroMikroIsleme640 from "@/assets/hero-mikro-isleme-640.webp";
import heroMikroIsleme960 from "@/assets/hero-mikro-isleme-960.webp";
import heroDerinDelik from "@/assets/hero-derin-delik.webp";
import heroDerinDelik640 from "@/assets/hero-derin-delik-640.webp";
import heroDerinDelik960 from "@/assets/hero-derin-delik-960.webp";
import heroEnjeksiyonKalibi from "@/assets/hero-enjeksiyon-kalibi.webp";
import heroEnjeksiyonKalibi640 from "@/assets/hero-enjeksiyon-kalibi-640.webp";
import heroEnjeksiyonKalibi960 from "@/assets/hero-enjeksiyon-kalibi-960.webp";
import heroAnodizasyon from "@/assets/hero-anodizasyon.webp";
import heroAnodizasyon640 from "@/assets/hero-anodizasyon-640.webp";
import heroAnodizasyon960 from "@/assets/hero-anodizasyon-960.webp";
import heroLazerKazima from "@/assets/hero-lazer-kazima.webp";
import heroLazerKazima640 from "@/assets/hero-lazer-kazima-640.webp";
import heroLazerKazima960 from "@/assets/hero-lazer-kazima-960.webp";
import heroHavacilik from "@/assets/hero-havacilik.webp";
import heroHavacilik640 from "@/assets/hero-havacilik-640.webp";
import heroHavacilik960 from "@/assets/hero-havacilik-960.webp";
import heroBasincliDokum from "@/assets/hero-basincli-dokum.webp";
import heroBasincliDokum640 from "@/assets/hero-basincli-dokum-640.webp";
import heroBasincliDokum960 from "@/assets/hero-basincli-dokum-960.webp";
import heroFiksturAparat from "@/assets/hero-fikstur-aparat.webp";
import heroFiksturAparat640 from "@/assets/hero-fikstur-aparat-640.webp";
import heroFiksturAparat960 from "@/assets/hero-fikstur-aparat-960.webp";
import heroSilikonKaliplama from "@/assets/hero-silikon-kaliplama.webp";
import heroSilikonKaliplama640 from "@/assets/hero-silikon-kaliplama-640.webp";
import heroSilikonKaliplama960 from "@/assets/hero-silikon-kaliplama-960.webp";
import heroMekanikYuzey from "@/assets/hero-mekanik-yuzey.webp";
import heroMekanikYuzey640 from "@/assets/hero-mekanik-yuzey-640.webp";
import heroMekanikYuzey960 from "@/assets/hero-mekanik-yuzey-960.webp";
import heroBoyaKaplama from "@/assets/hero-boya-kaplama.webp";
import heroBoyaKaplama640 from "@/assets/hero-boya-kaplama-640.webp";
import heroBoyaKaplama960 from "@/assets/hero-boya-kaplama-960.webp";
import heroTavlama from "@/assets/hero-tavlama.webp";
import heroTavlama640 from "@/assets/hero-tavlama-640.webp";
import heroTavlama960 from "@/assets/hero-tavlama-960.webp";
import heroQrDatamatrix from "@/assets/hero-qr-datamatrix.webp";
import heroQrDatamatrix640 from "@/assets/hero-qr-datamatrix-640.webp";
import heroQrDatamatrix960 from "@/assets/hero-qr-datamatrix-960.webp";
import heroLogoMarkalama from "@/assets/hero-logo-markalama.webp";
import heroLogoMarkalama640 from "@/assets/hero-logo-markalama-640.webp";
import heroLogoMarkalama960 from "@/assets/hero-logo-markalama-960.webp";
import heroInsertUygulama from "@/assets/hero-insert-uygulama.webp";
import heroInsertUygulama640 from "@/assets/hero-insert-uygulama-640.webp";
import heroInsertUygulama960 from "@/assets/hero-insert-uygulama-960.webp";
import heroMekanikMontaj from "@/assets/hero-mekanik-montaj.webp";
import heroMekanikMontaj640 from "@/assets/hero-mekanik-montaj-640.webp";
import heroMekanikMontaj960 from "@/assets/hero-mekanik-montaj-960.webp";
import heroKittingPaketleme from "@/assets/hero-kitting-paketleme.webp";
import heroKittingPaketleme640 from "@/assets/hero-kitting-paketleme-640.webp";
import heroKittingPaketleme960 from "@/assets/hero-kitting-paketleme-960.webp";
import heroKaynakliImalat from "@/assets/hero-kaynakli-imalat.webp";
import heroKaynakliImalat640 from "@/assets/hero-kaynakli-imalat-640.webp";
import heroKaynakliImalat960 from "@/assets/hero-kaynakli-imalat-960.webp";
import heroCnc from "@/assets/hero-cnc.webp";
import heroCnc640 from "@/assets/hero-cnc-640.webp";
import heroCnc960 from "@/assets/hero-cnc-960.webp";
import blogDfm from "@/assets/blog-dfm.webp";
import blogDfm640 from "@/assets/blog-dfm-640.webp";
import blogDfm960 from "@/assets/blog-dfm-960.webp";
import heroYuzeyIslemleri from "@/assets/hero-yuzey-islemleri.webp";
import heroYuzeyIslemleri640 from "@/assets/hero-yuzey-islemleri-640.webp";
import heroYuzeyIslemleri960 from "@/assets/hero-yuzey-islemleri-960.webp";
import heroToleransHassasiyet from "@/assets/hero-tolerans-hassasiyet.webp";
import heroToleransHassasiyet640 from "@/assets/hero-tolerans-hassasiyet-640.webp";
import heroToleransHassasiyet960 from "@/assets/hero-tolerans-hassasiyet-960.webp";
import heroToleransHassasiyet1600 from "@/assets/hero-tolerans-hassasiyet-1600.webp";
import heroMalzemeKutuphanesi from "@/assets/hero-malzeme-kutuphanesi.webp";
import heroMalzemeKutuphanesi640 from "@/assets/hero-malzeme-kutuphanesi-640.webp";
import heroMalzemeKutuphanesi960 from "@/assets/hero-malzeme-kutuphanesi-960.webp";
import heroProjeYonetimi from "@/assets/hero-proje-yonetimi.webp";
import heroProjeYonetimi640 from "@/assets/hero-proje-yonetimi-640.webp";
import heroProjeYonetimi960 from "@/assets/hero-proje-yonetimi-960.webp";
import heroTedarikZinciri from "@/assets/hero-tedarik-zinciri.webp";
import heroTedarikZinciri640 from "@/assets/hero-tedarik-zinciri-640.webp";
import heroTedarikZinciri960 from "@/assets/hero-tedarik-zinciri-960.webp";
import heroOperasyonelVerimlilik from "@/assets/hero-operasyonel-verimlilik.webp";
import heroOperasyonelVerimlilik640 from "@/assets/hero-operasyonel-verimlilik-640.webp";
import heroOperasyonelVerimlilik960 from "@/assets/hero-operasyonel-verimlilik-960.webp";
import heroSeriUretim from "@/assets/hero-seri-uretim.webp";
import heroSeriUretim640 from "@/assets/hero-seri-uretim-640.webp";
import heroSeriUretim960 from "@/assets/hero-seri-uretim-960.webp";

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

/* Every plate source with its 640/960(/1600) ladder from
   `scripts/assets/make-derivatives.mjs`. `responsive()` keeps the source as the
   widest candidate, so a 900-wide source (`hero-cnc-tornalama`) never upscales.

   PHASE 10-2b — `USER_INPUTS.md` §I (`FACILITY_PHOTOS: NONE`, `MACHINE_PHOTOS:
   NONE`, `TEAM_PHOTOS: NONE`, "never falsify the facility"): no plate may show a
   hall or legible staff as MAS's own. `cnc-workshop` (a wide empty machine hall,
   the fallback hero of every sector page) and `hero-makine-parkuru` (a hall with
   rows of machining centres and people, under a page titled "Makine Parkuru")
   are retired from this route; the sector fallback is `hero-seri-uretim` (rows
   of identical parts on black, no room implied) and Makine Parkuru carries
   `hero-cnc` (spindle and coolant, cropped so the operator is out of frame).
   Mapping and crops: `reports/10/art-direction.md`. */
const qualityControlHero = responsive(1600, 682, qualityControl, [qualityControl640, 640], [qualityControl960, 960]);

const heroImageMap: Record<string, ResponsiveImage> = {
  "hero-cnc-frezeleme": responsive(1600, 896, heroCncFrezeleme, [heroCncFrezeleme640, 640], [heroCncFrezeleme960, 960]),
  "hero-cnc-tornalama": responsive(900, 504, heroCncTornalama, [heroCncTornalama640, 640]),
  "hero-mikro-isleme": responsive(1600, 896, heroMikroIsleme, [heroMikroIsleme640, 640], [heroMikroIsleme960, 960]),
  "hero-derin-delik": responsive(1600, 896, heroDerinDelik, [heroDerinDelik640, 640], [heroDerinDelik960, 960]),
  "hero-enjeksiyon-kalibi": responsive(1600, 896, heroEnjeksiyonKalibi, [heroEnjeksiyonKalibi640, 640], [heroEnjeksiyonKalibi960, 960]),
  "hero-anodizasyon": responsive(1600, 896, heroAnodizasyon, [heroAnodizasyon640, 640], [heroAnodizasyon960, 960]),
  "hero-lazer-kazima": responsive(1600, 896, heroLazerKazima, [heroLazerKazima640, 640], [heroLazerKazima960, 960]),
  "hero-havacilik": responsive(1600, 896, heroHavacilik, [heroHavacilik640, 640], [heroHavacilik960, 960]),
  "hero-basincli-dokum": responsive(1600, 896, heroBasincliDokum, [heroBasincliDokum640, 640], [heroBasincliDokum960, 960]),
  "hero-fikstur-aparat": responsive(1600, 896, heroFiksturAparat, [heroFiksturAparat640, 640], [heroFiksturAparat960, 960]),
  "hero-silikon-kaliplama": responsive(1600, 896, heroSilikonKaliplama, [heroSilikonKaliplama640, 640], [heroSilikonKaliplama960, 960]),
  "hero-mekanik-yuzey": responsive(1600, 896, heroMekanikYuzey, [heroMekanikYuzey640, 640], [heroMekanikYuzey960, 960]),
  "hero-boya-kaplama": responsive(1600, 896, heroBoyaKaplama, [heroBoyaKaplama640, 640], [heroBoyaKaplama960, 960]),
  "hero-tavlama": responsive(1600, 896, heroTavlama, [heroTavlama640, 640], [heroTavlama960, 960]),
  "hero-qr-datamatrix": responsive(1600, 896, heroQrDatamatrix, [heroQrDatamatrix640, 640], [heroQrDatamatrix960, 960]),
  "hero-logo-markalama": responsive(1600, 896, heroLogoMarkalama, [heroLogoMarkalama640, 640], [heroLogoMarkalama960, 960]),
  "hero-insert-uygulama": responsive(1600, 896, heroInsertUygulama, [heroInsertUygulama640, 640], [heroInsertUygulama960, 960]),
  "hero-mekanik-montaj": responsive(1400, 476, heroMekanikMontaj, [heroMekanikMontaj640, 640], [heroMekanikMontaj960, 960]),
  "hero-kitting-paketleme": responsive(1600, 896, heroKittingPaketleme, [heroKittingPaketleme640, 640], [heroKittingPaketleme960, 960]),
  "hero-kaynakli-imalat": responsive(1600, 896, heroKaynakliImalat, [heroKaynakliImalat640, 640], [heroKaynakliImalat960, 960]),
  "hero-cnc": responsive(1260, 708, heroCnc, [heroCnc640, 640], [heroCnc960, 960]),
  "quality-control": qualityControlHero,
  "blog-dfm": responsive(1600, 896, blogDfm, [blogDfm640, 640], [blogDfm960, 960]),
  "hero-yuzey-islemleri": responsive(1600, 896, heroYuzeyIslemleri, [heroYuzeyIslemleri640, 640], [heroYuzeyIslemleri960, 960]),
  "hero-tolerans-hassasiyet": responsive(2400, 1343, heroToleransHassasiyet, [heroToleransHassasiyet640, 640], [heroToleransHassasiyet960, 960], [heroToleransHassasiyet1600, 1600]),
  "hero-malzeme-kutuphanesi": responsive(1600, 896, heroMalzemeKutuphanesi, [heroMalzemeKutuphanesi640, 640], [heroMalzemeKutuphanesi960, 960]),
  "hero-proje-yonetimi": responsive(1600, 896, heroProjeYonetimi, [heroProjeYonetimi640, 640], [heroProjeYonetimi960, 960]),
  "hero-tedarik-zinciri": responsive(1600, 896, heroTedarikZinciri, [heroTedarikZinciri640, 640], [heroTedarikZinciri960, 960]),
  "hero-operasyonel-verimlilik": responsive(1020, 574, heroOperasyonelVerimlilik, [heroOperasyonelVerimlilik640, 640], [heroOperasyonelVerimlilik960, 960]),
  "hero-seri-uretim": responsive(1600, 896, heroSeriUretim, [heroSeriUretim640, 640], [heroSeriUretim960, 960]),
};

/* `.shell-plate-frame` geometry (`src/styles/shell.css`): a 1px-bordered box
   `clamp(200px, 33vw, 420px)` tall whose image is overscanned by 60px top and
   bottom for the parallax, so the image box is that height + 118px. The plate
   sits in `.shell-span-full` here: full band width at every viewport, which
   measures 100vw - 44px at 375, 100vw - 60px at 768, 100vw - 68px from 1181
   up, capped by the 1600px sheet. The browser needs max(width, height x aspect)
   of source because the image is `object-fit: cover` — at 375 that is 568px
   for a 16:9 source, not 331. Measured in `reports/10/responsive-images.md`. */
const PLATE_IMAGE_HEIGHT = "clamp(200px, 33vw, 420px) + 118px";
const PLATE_FULL_WIDTHS = [
  ["(max-width: 767px)", "calc(100vw - 44px)"],
  ["(max-width: 1180px)", "calc(100vw - 60px)"],
  [null, "min(calc(100vw - 68px), 1532px)"],
] as const;

/* PHASE 10-2b — 375 ART DIRECTION. Cover-fitted by height, a 16:9 source
   shows only its central 58% of width in the 331×318 plate box at 375 (x
   21–79%), 81% at 768, all of it from 1181 up. `object-position` moves that
   window without touching the picture; a subject that is off-centre is
   recovered by sliding the window towards it. Set only where the inventory
   (`reports/10/asset-inventory.md` §5.2) found a MARGINAL crop that a shift
   actually fixes; the others are recorded, with the reason a shift cannot
   help, in `reports/10/art-direction.md`. Vertical position is left at 50%:
   at 375 the box already shows the source's full height, so only the frame's
   own 200-of-318 window and the parallax decide what is seen. */
const PLATE_POSITION: Record<string, string> = {
  /* Caliper sits at x 55–95% of the 2400px source; 90% puts the window at
     x 38–96%: both jaws, the pin and the scale numerals. */
  "hero-tolerans-hassasiyet": "90% 50%",
  /* Bracket spans x 15–77%; 40% centres it (x 17–75%) instead of cutting
     its left foot. */
  "hero-havacilik": "40% 50%",
  /* Centred, the window showed a grid of parts and no case; 0% (x 0–58%)
     keeps the case wall, hinge and latch so it reads as a kit in a case. */
  "hero-kitting-paketleme": "0% 50%",
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
  const { pathname, search, hash } = useLocation();
  const prefersReduced = usePrefersReducedMotion();
  const { t, i18n } = useTranslation();
  const { getPageBySlug, getPagesByCategory, categoryPages } = useSiteData();

  /* R01 — family + slug, not slug alone. A known slug under the wrong family
     redirects to its canonical address; an unknown slug gets the not-found
     view below. The family for that view (PHASE 07 F3: never hard-coded to
     services) comes from the same parse. See `src/lib/detail-route.ts`. */
  const resolution = resolveDetailRoute(pathname, getPageBySlug);
  const page = resolution.kind === "found" ? resolution.record : undefined;
  const pathFamily: keyof typeof FAMILY = resolution.family;

  /* And the title: an unknown slug fell back to the SITE DEFAULT, which reads
     to a crawler and to a tab strip as though the page had resolved.
     `usePageMeta` cannot be called conditionally, so the found branch gets a
     real title too — an improvement, and the reason the argument is computed
     rather than the hook skipped. During a wrong-family redirect the meta is
     the destination record's, so the one render before `<Navigate>` never
     writes a "not found" title. */
  const metaRecord = resolution.kind === "not-found" ? undefined : resolution.record;
  usePageMeta(
    metaRecord
      ? { title: metaRecord.title, description: metaRecord.description }
      : {
          title: t("{{family}} — sayfa bulunamadı", { family: t(FAMILY[pathFamily].label) }),
          description: t("Aradığınız kayıt bulunamadı. Hizmet ve sektör başlıklarına ana sayfadan ulaşabilirsiniz."),
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

  if (resolution.kind === "redirect") {
    return <Navigate to={`${resolution.to}${search}${hash}`} replace />;
  }

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
              trail={[{ label: t("Ana sayfa"), to: "/" }, { label: t(notFoundFamily.label) }]}
            />
          }
          eyebrow={t("KAYIT YOK")}
          title={t("Bu sayfa kaydı bulunamadı")}
          lede={t("Bağlantı değişmiş olabilir. Aşağıdaki başlıklardan devam edebilirsiniz.")}
          actions={<ShellAction to="/" variant="ghost">{t("Ana sayfa")}</ShellAction>}
        />
        <ShellSurfaceBand
          no="02"
          label={notFoundFamily.rail.label}
          ariaLabel={t("{{name}} kategorileri", { name: t(notFoundFamily.label) })}
        >
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={t("{{name}} kategorileri", { name: t(notFoundFamily.label) })}
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
    : page.category === "kabiliyetler" ? qualityControlHero : heroImageMap["hero-seri-uretim"];

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
              { label: t("Ana sayfa"), to: "/" },
              { label: t(family.label) },
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
            <ShellAction to="/teklif-al" variant="primary">{t("Teklif Al")}</ShellAction>
            <ShellAction to="/iletisim" variant="ghost">{t("Teknik görüşme")}</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no={no()} label="TANIM" labelledBy="detay-tanim">
        <div className="shell-span-full" ref={plateRef}>
          <ShellPlate
            plate={`${t("PLAKA")} · ${upper(page.title, i18n.language)}`}
            caption={page.categoryLabel}
            media={
              /* PHASE 10-3 — `alt=""`, not `alt={page.title}`. The plate sits
                 directly under the `<h1>` that carries `page.title`, and the
                 figcaption prints it a second time in the plate designation;
                 a third reading of the same words was the "title, twice"
                 failure. What the picture shows is the page's own subject
                 (the milling spindle under "CNC Frezeleme", the caliper under
                 "Tolerans ve Hassasiyet") or, for the fifteen sector pages on
                 the shared fallback, a mood plate with no sector content at
                 all — decorative under the Phase 10-3 rule either way.
                 `reports/10/alt-text.md` lists all 48 routes. */
              <motion.img
                src={heroImage.src}
                srcSet={heroImage.srcSet}
                sizes={coverSizes(heroImage.width / heroImage.height, PLATE_IMAGE_HEIGHT, PLATE_FULL_WIDTHS)}
                width={heroImage.width}
                height={heroImage.height}
                alt=""
                loading="eager"
                style={{ y: plateY, objectPosition: page.heroImage ? PLATE_POSITION[page.heroImage] : undefined }}
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

            title={t(isSector ? "Bu sektörde ne üretiyoruz" : "Kapsam")}
          />
          <div className="shell-prose" data-lead>
            {page.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>

        {page.advantages && page.advantages.length > 0 && (
          <div className="shell-span-note shell-stack" data-gap="sm">
            <p className="shell-eyebrow">{t(isSector ? "Sektöre uygunluk" : "Öne çıkan")}</p>
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
                title={t(isSector ? "Sektör kabiliyet kaydı" : "Kabiliyet kaydı")}
                standfirst={t(
                  isSector
                    ? "Bu sektörün parçalarında hangi kabiliyetin devreye girdiği ve neyin kayda geçtiği."
                    : "Hizmetin kapsadığı kabiliyetler ve çalışma aralıkları.",
                )}
              />
              {page.features && page.features.length > 0 && (
                <ShellRun
                  ariaLabel={t("{{title}} kabiliyetleri", { title: page.title })}
                  items={page.features.map(splitFeature)}
                />
              )}
            </div>

            {page.technicalSpecs && page.technicalSpecs.length > 0 && (
              <div className="shell-doc-aside" data-sticky>
                <ShellSpecTable
                  caption={t("Teknik kayıt")}
                  headers={[t("Başlık"), t("Değer")]}
                  rows={page.technicalSpecs.map((spec) => [spec.label, spec.value])}
                  rowKey={(_, index) => specs[index].label}
                />
                <ShellAction to="/teklif-al" variant="primary" full>{t("Teklif Al")}</ShellAction>
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

              title={t(isSector ? "Sektör akışı" : "Süreç akışı")}
              standfirst={t("Sıra sabittir; içerik parçaya göre yazılır. Standart çalışma aralığımız {{value}}.", { value: MINIMUM_TOLERANCE })}
            />
          </div>
          <ShellRun
            ariaLabel={t("{{title}} süreç adımları", { title: page.title })}
            items={page.processSteps.map((step) => ({ title: step }))}
          />
        </ShellSurfaceBand>
      )}

      {page.materials && page.materials.length > 0 && (
        <ShellSurfaceBand no={no()} label="MALZEME" tone="paper" labelledBy="detay-malzeme">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="detay-malzeme"

              title={t("İşlenebilir malzemeler")}
              standfirst={t("Bu sayfada sık kullanılan malzemeler. Ailenin tamamı malzeme kaydındadır.")}
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
              caption={t("{{title}} — malzeme kaydı", { title: page.title })}
              headers={[t("Malzeme"), t("Kalite"), t("Özellik")]}
              numericFrom={99}
              rows={page.materials.map((material) => [
                material.name,
                material.grade,
                material.properties,
              ])}
              rowKey={(_, index) => `${materialRows[index].name}-${index}`}
            />
            <ShellAction to="/malzemeler" variant="quiet">{t("Malzeme kaydının tamamı")}</ShellAction>
          </div>
        </ShellSurfaceBand>
      )}

      {page.comparisonTables && page.comparisonTables.length > 0 && (
        <ShellSurfaceBand no={no()} label="KARŞILAŞTIRMA" labelledBy="detay-karsilastirma">
          <div className="shell-span-read">
            <ShellTitleBlock
              id="detay-karsilastirma"

              title={t("Teknik karşılaştırma")}
              standfirst={t("Seçenekler yan yana; hangisinin hangi koşulda anlamlı olduğu tabloların kendi notlarında.")}
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
            <ShellTitleBlock id="detay-sorular" title={t("Sık sorulan sorular")} />
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

            title={t(isSector ? "Bu sektörün yakınındaki sayfalar" : "İlgili sayfalar")}
            standfirst={t(
              isSector
                ? "Aynı sektör ailesindeki diğer başlıklar ve bu parçaların üretildiği hizmet aileleri."
                : "Aynı aileden, birlikte sorulan başlıklar.",
            )}
          />
        </div>
        {related.length > 0 && (
          <div className="shell-span-full">
            <ShellIndexList
              compact
              ariaLabel={t("{{family}} ailesindeki diğer sayfalar", { family: t(family.label) })}
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
            <p className="shell-eyebrow">{t("Bu parçalar hangi hizmetlerle üretiliyor")}</p>
            <ShellIndexList
              compact
              ariaLabel={t("Hizmet aileleri")}
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
        title={t("{{title}} için teklif", { title: page.title })}
        /* The title is NOT lower-cased. `toLocaleLowerCase("tr")` turned
           "CNC Frezeleme" into "cnc frezeleme" mid-sentence, which reads as a
           typo for an acronym and is wrong for every page whose title carries
           one (CNC, QR, DFM, NDT). */
        body={t("Teknik resim veya 3B model gönderin; {{title}} kapsamında üretilebilirlik incelemesiyle birlikte fiyat çalışması yapalım.", { title: page.title })}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t(family.label), value: page.categoryLabel },
        ]}
        secondary={{ label: t("Teknik görüşme"), to: "/iletisim" }}
      />
    </PageShell>
  );
};

