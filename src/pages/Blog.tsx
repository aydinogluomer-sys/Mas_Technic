import { useTranslation } from "react-i18next";
import { Link } from "@/i18n/LocaleLink";
import { useSiteData } from "@/i18n/data";
import { localDate } from "@/i18n/format";
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
import { blogPosts as turkishPosts } from "@/data/blogData";
import { QUOTE_RESPONSE_TIME } from "@/content/claims";
import { coverSizes } from "@/components/BlurImage";
import { PLATE_IMAGE_HEIGHT, plateSources } from "@/components/blog/plate-sources";

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

/* Measured: 331px at 375, 708 at 768, 403 at 1280, 456 at 1440, 509 at the 1600 sheet. */
const PLATE_NOTE_WIDTHS = [
  ["(max-width: 767px)", "calc(100vw - 44px)"],
  ["(max-width: 1180px)", "calc(100vw - 60px)"],
  [null, "min(calc((100vw - 66px) / 3 - 2px), 509px)"],
] as const;
const leadPlate = plateSources.get(turkishPosts[0].image);

export const Blog = () => {
  const { t, i18n } = useTranslation();
  const { blogPosts } = useSiteData();
  const [LEAD, ...REST] = blogPosts;
  /** The categories the corpus actually contains, in first-appearance order. */
  const blogCategories = [...new Set(blogPosts.map((post) => post.category))];
  const date = (value: string) => localDate(value, i18n.language);
  usePageMeta({
    title: t("Teknik Günlük"),
    description: t("CNC işleme, malzeme seçimi, üretilebilirlik ve kalite kontrol üzerine teknik yazılar. Ölçüye ve yönteme dayalı, kısa bir yayın dizisi."),
  });

  return (
    <PageShell surface="graphite" rail={{ no: "R2", label: "GÜNLÜK" }}>
      <JsonLdSchema
        type="blog"
        name={t("Mas Technic Teknik Günlük")}
        description={t("CNC işleme, talaşlı imalat, malzeme bilimi ve kalite kontrol üzerine teknik yazılar.")}
      />

      <ShellPageHero
        no="01"
        label="GÜNLÜK"
        crumb={<ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "Teknik günlük" }]} />}
        eyebrow={t("Yayın dizisi")}
        title={t("Teknik Günlük")}
        lede={t("Üretim yöntemi, malzeme davranışı ve ölçüm üzerine yazılar. Her yazı bir soruyu, o sorunun mekanizmasıyla birlikte yanıtlar; sayı vermek yerine sayının nereden geldiğini anlatır.")}
        meta={[
          { label: t("Konu"), value: blogCategories.join(" · ") },
          { label: t("Yazı sayısı"), value: String(blogPosts.length) },
          { label: t("Teklif dönüşü"), value: t(QUOTE_RESPONSE_TIME) },
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
            ariaLabel={t("Yazı künyesi")}
            items={[LEAD.category, date(LEAD.date), LEAD.readTime]}
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
            <ShellAction to={`/blog/${LEAD.slug}`} variant="primary">{t("Yazıyı oku")}</ShellAction>
          </div>
        </div>

        <div className="shell-span-note">
          <ShellPlate
            plate={`${t("PLAKA")} 01`}
            caption={LEAD.imageCaption}
            media={
              /* The route's first picture: eager, no `fetchpriority` (Phase 12 owns LCP). */
              <>
                {leadPlate ? (
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
                )}
                {/* The plate opens the post it illustrates. */}
                <Link className="tl-image-link" to={`/blog/${LEAD.slug}`} aria-label={LEAD.title} />
              </>
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
            title={t("Yazı dizini")}
            standfirst={t("Her satır yazının konusunu, yayın tarihini ve okuma süresini taşır.")}
          />
        </div>
        <div className="shell-span-full">
          <ShellIndexList
            ariaLabel={t("Teknik günlük yazıları")}
            items={REST.map((post, index) => ({
              to: `/blog/${post.slug}`,
              index: String(index + 2).padStart(2, "0"),
              eyebrow: post.category,
              title: post.title,
              description: post.excerpt,
              meta: [date(post.date), post.readTime, t("{{count}} bölüm", { count: post.sections.length })],
            }))}
          />
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="04"
        title={t("Yazıdaki bir konu sizin parçanızda mı çıktı?")}
        body={t("Teknik resim veya 3B model gönderin; konuyu genel bir yazı üzerinden değil, kendi parçanız üzerinden konuşalım.")}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Gönderilecek"), value: t("Teknik resim veya 3B model") },
          { label: t("Alternatif"), value: t("Sık sorulan sorular") },
        ]}
        secondary={{ label: "Sık sorulanlar", to: "/sss" }}
      />
    </PageShell>
  );
};
