import { useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteData } from "@/i18n/data";
import { localDate } from "@/i18n/format";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellContents,
  ShellDocSection,
  ShellIndexList,
  ShellNextStep,
  ShellPageHero,
  ShellPlate,
  ShellSpecTable,
  ShellSurfaceBand,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePageMeta } from "@/hooks/use-page-meta";
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
import heroCncFrezeleme from "@/assets/hero-cnc-frezeleme.webp";
import heroCncFrezeleme640 from "@/assets/hero-cnc-frezeleme-640.webp";
import heroCncFrezeleme960 from "@/assets/hero-cnc-frezeleme-960.webp";
import qualityControl from "@/assets/quality-control.webp";
import qualityControl640 from "@/assets/quality-control-640.webp";
import qualityControl960 from "@/assets/quality-control-960.webp";
import heroYuzeyIslemleri from "@/assets/hero-yuzey-islemleri.webp";
import heroYuzeyIslemleri640 from "@/assets/hero-yuzey-islemleri-640.webp";
import heroYuzeyIslemleri960 from "@/assets/hero-yuzey-islemleri-960.webp";

/* ══════════════════════════════════════════════════════════════════════════
   ARTICLE

   ── TYPOGRAPHY AND STRUCTURE ─────────────────────────────────────────────
   The old article was `prose prose-sm max-w-none text-muted-foreground` over
   `post.fullContent.map(p => <p>)` — five or six paragraphs at 14px, muted
   grey, running the full width of a `max-w-4xl` container with no internal
   structure at all. `max-w-none` is the instruction that removes the measure
   cap, so on a 1440px screen the body ran to roughly 150 characters a line,
   which is about twice a comfortable measure.

   It is now a `.shell-doc`: anchored, numbered sections in the main column,
   `.shell-prose` (measure capped in `ch`, so it holds at every type size) and
   a sticky contents index in the aside. Every section is deep-linkable, so
   `/blog/…#duvar-kalinligi` is a real address and the index in the aside is
   made of real addresses.

   ── FIGURE AND CAPTION ───────────────────────────────────────────────────
   The hero image was an `aspect-[16/9]` box with `alt={post.title}` — the alt
   text described the ARTICLE, not the photograph, which is exactly the failure
   mode a screen-reader user experiences as "the title, twice". It is a
   `ShellPlate` now: hairline frame, corner ticks, and a plate number plus
   caption in a `<figcaption>` BELOW the frame, never inside it (the I4 rule).
   `imageAlt` and `imageCaption` are separate fields in `blogData.ts` and say
   different things.

   ── TABLES ───────────────────────────────────────────────────────────────
   A section may carry a `table`, rendered through the site's one
   `ShellSpecTable`: tabular figures, right-aligned measurement columns, and a
   caption outside the scroll container so a narrow viewport scrolls the data
   and keeps the table's name in place.

   ── THE COMMENT FORM IS GONE ─────────────────────────────────────────────
   It kept comments in `useState`. Nothing was posted anywhere, nothing was
   moderated and nothing survived a refresh — a reader could type a paragraph,
   press "Yorum Yap", watch it appear, and lose it on navigation. That is the
   Phase 07 `/iletisim` finding again (`docs/lean/17` §6.6): a form that
   pretends to accept something and discards it is worse than no form. There
   is no comment backend in this project and `USER_INPUTS.md` authorises
   none, so it is removed rather than faked.

   Sharing stays, because those links genuinely work, but it is a mono run
   rather than four 40×40 icon boxes.

   ── THE RFQ CONTINUATION IS NOT AGGRESSIVE, BY CONSTRUCTION ──────────────
   One `ShellNextStep` at the end, the same band every other page ends on, and
   it does not interrupt the text. There is no mid-article CTA, no sticky bar
   and no exit modal. The reader finishes the article first.
   ══════════════════════════════════════════════════════════════════════════ */

const SHARE_TARGETS = [
  {
    label: "LINKEDIN",
    href: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "X",
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
] as const;

/* The corpus (`blogData.ts`) stores a bundled URL per post; this map adds the
   asset's intrinsic size and its 640/960 ladder (`scripts/assets/make-derivatives.mjs`),
   keyed by that same URL — Vite resolves one asset to one URL, so the key is
   the import. A post whose image is not listed here renders without a ladder
   or a reserved box; add it when the corpus changes. */
const plateSources = new Map<string, ResponsiveImage>([
  [blog5eksen, responsive(1600, 896, blog5eksen, [blog5eksen640, 640], [blog5eksen960, 960])],
  [blogMalzeme, responsive(1600, 896, blogMalzeme, [blogMalzeme640, 640], [blogMalzeme960, 960])],
  [blogDfm, responsive(1600, 896, blogDfm, [blogDfm640, 640], [blogDfm960, 960])],
  /* 10-2b: `service-cnc-freze` (blue-tinted stock, 800px) fails the campaign's
     graphite mood; the torna/freze post opens on the spindle-and-coolant hero
     its own alt text describes. */
  [heroCncFrezeleme, responsive(1600, 896, heroCncFrezeleme, [heroCncFrezeleme640, 640], [heroCncFrezeleme960, 960])],
  [qualityControl, responsive(1600, 682, qualityControl, [qualityControl640, 640], [qualityControl960, 960])],
  /* 10-2b: the surface-treatment guide no longer opens on `cnc-workshop` (a wide
     machine hall — a facility implication `USER_INPUTS.md` §I forbids, and a
     picture its own caption "dört farklı yüzey bitişi" did not describe); it
     opens on the bead-blasted / brushed macro the caption is about. */
  [heroYuzeyIslemleri, responsive(1600, 896, heroYuzeyIslemleri, [heroYuzeyIslemleri640, 640], [heroYuzeyIslemleri960, 960])],
]);

/* `.shell-plate-frame` image box (`src/styles/shell.css`): `clamp(200px, 33vw,
   420px)` + 120px parallax overscan - 2px border. The image is `object-fit:
   cover`, so the browser needs max(width, height x aspect) of source — see
   `coverSizes` and `reports/10/responsive-images.md`. */
const PLATE_IMAGE_HEIGHT = "clamp(200px, 33vw, 420px) + 118px";
/* Measured: 331px at 375, 708 at 768, 807 at 1280, 914 at 1440, 1021 at the 1600 sheet. */
const PLATE_DOC_WIDTHS = [
  ["(max-width: 767px)", "calc(100vw - 44px)"],
  ["(max-width: 1180px)", "calc(100vw - 60px)"],
  [null, "min(calc((100vw - 66px) * 2 / 3 - 2px), 1021px)"],
] as const;

export const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { blogPosts } = useSiteData();
  const date = (value: string) => localDate(value, i18n.language);
  const post = blogPosts.find((entry) => entry.slug === slug);
  const plate = post ? plateSources.get(post.image) : undefined;
  const [copied, setCopied] = useState(false);

  /* The heading string is load-bearing. `e2e/shared-shell-accessibility.spec.ts`
     and `e2e/landing/navigation-reachability.spec.ts` both assert that no
     canonical route renders a heading matching /^(Sayfa|Yazı) Bulunamadı$/ —
     it is how they detect a route resolving to a not-found body. Changing this
     text would not fail those specs; it would quietly disarm them. */
  usePageMeta({
    title: post ? post.title : t("Yazı Bulunamadı"),
    description: post?.excerpt,
    noindex: !post,
  });

  if (!post) {
    return (
      <PageShell surface="graphite" rail={{ no: "R2", label: "GÜNLÜK" }}>
        <ShellPageHero
          no="01"
          label="GÜNLÜK"
          crumb={
            <ShellBreadcrumb
              trail={[{ label: "Ana sayfa", to: "/" }, { label: "Teknik günlük", to: "/blog" }]}
            />
          }
          eyebrow={t("KAYIT YOK")}
          title={t("Yazı Bulunamadı")}
          lede={t("Bu adreste bir yazı yok. Bağlantı değişmiş veya yazı kaldırılmış olabilir; dizinden ilgili başlığa geçebilirsiniz.")}
          actions={<ShellAction to="/blog" variant="primary">{t("Yazı dizini")}</ShellAction>}
        />
        <ShellSurfaceBand no="02" label="DİZİN" tone="paper" ariaLabel={t("Yazı dizini")}>
          <div className="shell-span-full">
            <ShellIndexList
              ariaLabel={t("Teknik günlük yazıları")}
              items={blogPosts.map((entry) => ({
                to: `/blog/${entry.slug}`,
                eyebrow: entry.category,
                title: entry.title,
                description: entry.excerpt,
                meta: [date(entry.date), entry.readTime],
              }))}
            />
          </div>
        </ShellSurfaceBand>
      </PageShell>
    );
  }

  const related = blogPosts
    .filter((entry) => entry.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const copyLink = () => {
    void navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell surface="graphite" rail={{ no: "R2", label: "YAZI" }}>
      <JsonLdSchema
        type="article"
        name={post.title}
        description={post.excerpt}
        datePublished={post.date}
        category={post.category}
      />

      <ShellPageHero
        no="01"
        label="YAZI"
        crumb={
          <ShellBreadcrumb
            trail={[
              { label: "Ana sayfa", to: "/" },
              { label: "Teknik günlük", to: "/blog" },
              { label: post.title },
            ]}
          />
        }
        eyebrow={post.category}
        title={post.title}
        lede={post.excerpt}
        meta={[
          { label: t("Yayın"), value: date(post.date) },
          { label: t("Okuma"), value: post.readTime },
          { label: t("Bölüm"), value: String(post.sections.length) },
        ]}
      />

      <ShellSurfaceBand no="02" label="METİN" tone="paper" ariaLabel={t("{{title}} — yazı metni", { title: post.title })}>
        <div className="shell-doc">
          <div className="shell-doc-main">
            <ShellPlate
              plate={`${t("PLAKA")} 01`}
              caption={post.imageCaption}
              media={
                /* The route's first picture: eager, no `fetchpriority` (Phase 12 owns LCP). */
                plate ? (
                  <img
                    src={plate.src}
                    srcSet={plate.srcSet}
                    sizes={coverSizes(plate.width / plate.height, PLATE_IMAGE_HEIGHT, PLATE_DOC_WIDTHS)}
                    width={plate.width}
                    height={plate.height}
                    alt={post.imageAlt}
                  />
                ) : (
                  <img src={post.image} alt={post.imageAlt} />
                )
              }
            />

            {post.sections.map((section, index) => (
              <ShellDocSection
                key={section.id}
                id={section.id}
                no={String(index + 1).padStart(2, "0")}
                title={section.heading}
              >
                <div className="shell-prose">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
                {section.table && (
                  <div className="shell-doc-table">
                    <ShellSpecTable
                      caption={section.table.caption}
                      note={section.table.note}
                      headers={section.table.headers}
                      rows={section.table.rows}
                      rowKey={(row) => String(row[0])}
                    />
                  </div>
                )}
              </ShellDocSection>
            ))}
          </div>

          <aside className="shell-doc-aside" data-sticky>
            <ShellContents
              label="BÖLÜMLER"
              ariaLabel={t("{{title}} bölümleri", { title: post.title })}
              items={post.sections.map((section, index) => ({
                id: section.id,
                no: String(index + 1).padStart(2, "0"),
                label: section.heading,
              }))}
            />

            <nav className="shell-contents" aria-label={t("Bu yazıyı paylaş")}>
              <p className="shell-eyebrow">{t("PAYLAŞ")}</p>
              <ol>
                {SHARE_TARGETS.map((target, index) => (
                  <li key={target.label}>
                    <a
                      href={target.href(shareUrl, post.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span>{target.label} <small>{t("(yeni sekme)")}</small></span>
                    </a>
                  </li>
                ))}
              </ol>
              <ShellAction variant="quiet" onClick={copyLink}>
                {t(copied ? "Bağlantı kopyalandı" : "Bağlantıyı kopyala")}
              </ShellAction>
              {/* The live region is always in the DOM, empty until it has
                  something to say: a region inserted at the same moment as its
                  message is frequently not announced at all. */}
              <p className="tl-visually-hidden" role="status" aria-live="polite">
                {copied ? t("Bağlantı panoya kopyalandı") : ""}
              </p>
            </nav>

            <p className="shell-note">
              {t("Bu yazıdaki teknik değerler sitenin geri kalanıyla aynı kaynaktan gelir; farklı bir sayfada farklı bir değerle karşılaşmazsınız.")}
            </p>
          </aside>
        </div>
      </ShellSurfaceBand>

      {related.length > 0 && (
        <ShellSurfaceBand no="03" label="İLGİLİ" ariaLabel={t("İlgili yazılar")}>
          <div className="shell-span-full">
            <p className="shell-eyebrow">{t("İLGİLİ YAZILAR")}</p>
            <ShellIndexList
              compact
              ariaLabel={t("İlgili yazılar")}
              items={related.map((entry, index) => ({
                to: `/blog/${entry.slug}`,
                index: String(index + 1).padStart(2, "0"),
                eyebrow: entry.category,
                title: entry.title,
                description: entry.excerpt,
                meta: [entry.readTime],
              }))}
            />
          </div>
        </ShellSurfaceBand>
      )}

      <ShellNextStep
        no="04"
        title={t("Bu konu sizin parçanızda mı çıktı?")}
        body={t("Teknik resim veya 3B model gönderin; konuyu genel bir yazı üzerinden değil, kendi parçanız üzerinden değerlendirelim.")}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Gönderilecek"), value: t("Teknik resim veya 3B model") },
          { label: t("Alternatif"), value: t("Sık sorulan sorular") },
        ]}
        secondary={{ label: t("Yazı dizini"), to: "/blog" }}
      />
    </PageShell>
  );
};
