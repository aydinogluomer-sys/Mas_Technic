import { Link } from "react-router-dom";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellIndexList,
  ShellNextStep,
  ShellPageHero,
  ShellPlate,
  ShellSurfaceBand,
  ShellTagRow,
  ShellTitleBlock,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { blogCategories, blogPosts } from "@/data/blogData";
import { QUOTE_RESPONSE_TIME } from "@/content/claims";
import { coverSizes, responsive, type ResponsiveImage } from "@/components/BlurImage";
import blog5eksen from "@/assets/blog-5eksen.webp";
import blog5eksen640 from "@/assets/blog-5eksen-640.webp";
import blog5eksen960 from "@/assets/blog-5eksen-960.webp";
import blogMalzeme from "@/assets/blog-malzeme.webp";
import blogMalzeme640 from "@/assets/blog-malzeme-640.webp";
import blogMalzeme960 from "@/assets/blog-malzeme-960.webp";
import blogDfm from "@/assets/blog-dfm.webp";
import blogDfm640 from "@/assets/blog-dfm-640.webp";
import blogDfm960 from "@/assets/blog-dfm-960.webp";
import serviceCncFreze from "@/assets/service-cnc-freze.webp";
import serviceCncFreze640 from "@/assets/service-cnc-freze-640.webp";
import qualityControl from "@/assets/quality-control.webp";
import qualityControl640 from "@/assets/quality-control-640.webp";
import qualityControl960 from "@/assets/quality-control-960.webp";
import cncWorkshop from "@/assets/cnc-workshop.webp";
import cncWorkshop640 from "@/assets/cnc-workshop-640.webp";
import cncWorkshop960 from "@/assets/cnc-workshop-960.webp";

/* ══════════════════════════════════════════════════════════════════════════
   TEKNİK GÜNLÜK — THE INDEX, AS A PUBLICATION FRONT PAGE

   ── WHAT THIS REPLACES ───────────────────────────────────────────────────
   A `grid lg:grid-cols-4` with a three-quarter card grid and a sidebar of five
   panels. The cards were `border border-border bg-card` with a 16:10 image
   scaling to 105% on hover, a teal category chip, a two-line clamped title and
   a two-line clamped excerpt — i.e. the generic card grid the phase names by
   name. The sidebar carried: a "popular posts" list ranked by a `featured`
   boolean; a four-tile statistics panel (Toplam Yazı / Dakika İçerik /
   Kategori / Öne Çıkan); a category tag cloud duplicating the filter above it;
   a NEWSLETTER SIGNUP; and a "Toplantı Talep Et" card.

   ── THE NEWSLETTER FORM IS GONE, AND THIS IS THE IMPORTANT ONE ───────────
   It rendered an e-mail input and an "Abone Ol" button with NO submit handler,
   NO backend, NO list and no stated purpose. Pressing it did nothing at all.
   That is the same defect Phase 07 removed from `/iletisim` — a form that
   asks for a reader's contact details and discards them — except worse,
   because the field it collects is exactly the one a privacy policy has to
   account for. §K records no provider for anything of the sort. It is deleted
   rather than wired up: nothing in `USER_INPUTS.md` authorises a mailing list.

   ── SEARCH AND FILTER: EXPLICITLY OMITTED ────────────────────────────────
   `IMPLEMENTATION.md` §PHASE 08 accepts an explicit omission with a reason,
   and the corpus supplies it: SIX articles across five categories. Every one
   of them is on this page, above the fold on a desktop screen and inside two
   scrolls on a phone, with its own section headings visible. A search field, a
   sort control and a category filter over six items are furniture — three
   controls to narrow a list nobody needs narrowed, each of which can return an
   empty state on a six-item corpus.

   `/malzemeler` (a register of alloys) and `/sss` (127 questions) DO carry
   search, and the difference is the corpus, not the page type. When this
   journal passes the point where the index cannot be read at a glance, the
   filter belongs here too — and `/sss` is the pattern to copy.

   The sort control is separately gone even as an idea: its third option used
   to be "popular", ranked by a hardcoded per-post view count, and §K
   `ANALYTICS_PROVIDER: NONE` means nothing here can rank by reach.

   ── WHAT THE READER GETS INSTEAD ─────────────────────────────────────────
   A publication front page: one LEAD article opened up — plate, standfirst and
   its own section headings, so the reader can see what is inside before
   deciding — and then the rest as a register, each row carrying its date,
   reading estimate and subject. The distinguishing information is on the page
   rather than behind six clicks, which is the same argument
   `docs/lean/17-inner-page-composition.md` §6.3 makes for every other index on
   this site.
   ══════════════════════════════════════════════════════════════════════════ */

/** The lead is the corpus's first entry — its most recent article. */
const [LEAD, ...REST] = blogPosts;

/* The corpus (`blogData.ts`) stores a bundled URL per post; this map adds the
   asset's intrinsic size and its 640/960 ladder (`scripts/assets/make-derivatives.mjs`),
   keyed by that same URL — Vite resolves one asset to one URL, so the key is
   the import. A post whose image is not listed here renders without a ladder
   or a reserved box; add it when the corpus changes. */
const plateSources = new Map<string, ResponsiveImage>([
  [blog5eksen, responsive(1600, 896, blog5eksen, [blog5eksen640, 640], [blog5eksen960, 960])],
  [blogMalzeme, responsive(1600, 896, blogMalzeme, [blogMalzeme640, 640], [blogMalzeme960, 960])],
  [blogDfm, responsive(1600, 896, blogDfm, [blogDfm640, 640], [blogDfm960, 960])],
  [serviceCncFreze, responsive(800, 544, serviceCncFreze, [serviceCncFreze640, 640])],
  [qualityControl, responsive(1600, 682, qualityControl, [qualityControl640, 640], [qualityControl960, 960])],
  [cncWorkshop, responsive(1600, 682, cncWorkshop, [cncWorkshop640, 640], [cncWorkshop960, 960])],
]);

/* `.shell-plate-frame` image box (`src/styles/shell.css`): `clamp(200px, 33vw,
   420px)` + 120px parallax overscan - 2px border. The image is `object-fit:
   cover`, so the browser needs max(width, height x aspect) of source — see
   `coverSizes` and `reports/10/responsive-images.md`. */
const PLATE_IMAGE_HEIGHT = "clamp(200px, 33vw, 420px) + 118px";
/* Measured: 331px at 375, 708 at 768, 403 at 1280, 456 at 1440, 509 at the 1600 sheet. */
const PLATE_NOTE_WIDTHS = [
  ["(max-width: 767px)", "calc(100vw - 44px)"],
  ["(max-width: 1180px)", "calc(100vw - 60px)"],
  [null, "min(calc((100vw - 66px) / 3 - 2px), 509px)"],
] as const;
const leadPlate = plateSources.get(LEAD.image);

export const Blog = () => {
  usePageMeta({
    title: "Teknik Günlük",
    description:
      "CNC işleme, malzeme seçimi, üretilebilirlik ve kalite kontrol üzerine teknik yazılar. Ölçüye ve yönteme dayalı, kısa bir yayın dizisi.",
  });

  return (
    <PageShell surface="graphite" rail={{ no: "R2", label: "GÜNLÜK" }}>
      <JsonLdSchema
        type="blog"
        name="Mas Technic Teknik Günlük"
        description="CNC işleme, talaşlı imalat, malzeme bilimi ve kalite kontrol üzerine teknik yazılar."
      />

      <ShellPageHero
        no="01"
        label="GÜNLÜK"
        crumb={<ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "Teknik günlük" }]} />}
        eyebrow="Yayın dizisi"
        title="Teknik Günlük"
        lede="Üretim yöntemi, malzeme davranışı ve ölçüm üzerine yazılar. Her yazı bir soruyu, o sorunun mekanizmasıyla birlikte yanıtlar; sayı vermek yerine sayının nereden geldiğini anlatır."
        meta={[
          { label: "Konu", value: blogCategories.join(" · ") },
          { label: "Yazı sayısı", value: String(blogPosts.length) },
          { label: "Teklif dönüşü", value: QUOTE_RESPONSE_TIME },
        ]}
      />

      {/* ── 02 — the lead, opened up ─────────────────────────────────────── */}
      <ShellSurfaceBand no="02" label="BAŞYAZI" labelledBy="blog-lead">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="blog-lead"
            index="02"
            title={<Link to={`/blog/${LEAD.slug}`}>{LEAD.title}</Link>}
            standfirst={LEAD.excerpt}
          />
          <ShellTagRow
            ariaLabel="Yazı künyesi"
            items={[LEAD.category, LEAD.date, LEAD.readTime]}
          />
          {/* The lead's own section headings. A reader decides to open an
              article by what is inside it, and this is the only place the
              inside is visible from the index. */}
          <ol className="shell-lead-sections">
            {LEAD.sections.map((section, index) => (
              <li key={section.id}>
                <Link to={`/blog/${LEAD.slug}#${section.id}`}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span>{section.heading}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="shell-hero-actions">
            <ShellAction to={`/blog/${LEAD.slug}`} variant="primary">Yazıyı oku</ShellAction>
          </div>
        </div>

        <div className="shell-span-note">
          <ShellPlate
            plate="PLAKA 01"
            caption={LEAD.imageCaption}
            media={
              /* The route's first picture: eager, no `fetchpriority` (Phase 12 owns LCP). */
              leadPlate ? (
                <img
                  src={leadPlate.src}
                  srcSet={leadPlate.srcSet}
                  sizes={coverSizes(leadPlate.width / leadPlate.height, PLATE_IMAGE_HEIGHT, PLATE_NOTE_WIDTHS)}
                  width={leadPlate.width}
                  height={leadPlate.height}
                  alt={LEAD.imageAlt}
                />
              ) : (
                <img src={LEAD.image} alt={LEAD.imageAlt} />
              )
            }
          />
        </div>
      </ShellSurfaceBand>

      {/* ── 03 — the rest, as a register ─────────────────────────────────── */}
      <ShellSurfaceBand no="03" label="DİZİN" tone="paper" labelledBy="blog-index">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="blog-index"
            index="03"
            title="Yazı dizini"
            standfirst="Her satır yazının konusunu, yayın tarihini ve okuma süresini taşır."
          />
        </div>
        <div className="shell-span-full">
          <ShellIndexList
            ariaLabel="Teknik günlük yazıları"
            items={REST.map((post, index) => ({
              to: `/blog/${post.slug}`,
              index: String(index + 2).padStart(2, "0"),
              eyebrow: post.category,
              title: post.title,
              description: post.excerpt,
              meta: [post.date, post.readTime, `${post.sections.length} bölüm`],
            }))}
          />
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="04"
        title="Yazıdaki bir konu sizin parçanızda mı çıktı?"
        body="Teknik resim veya 3B model gönderin; konuyu genel bir yazı üzerinden değil, kendi parçanız üzerinden konuşalım."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Gönderilecek", value: "Teknik resim veya 3B model" },
          { label: "Alternatif", value: "Sık sorulan sorular" },
        ]}
        secondary={{ label: "Sık sorulanlar", to: "/sss" }}
      />
    </PageShell>
  );
};
