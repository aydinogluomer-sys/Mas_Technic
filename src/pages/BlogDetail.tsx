import { useParams } from "react-router-dom";
import { useState } from "react";
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
import { blogPosts } from "@/data/blogData";
import { QUOTE_RESPONSE_TIME } from "@/content/claims";

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

export const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((entry) => entry.slug === slug);
  const [copied, setCopied] = useState(false);

  /* The heading string is load-bearing. `e2e/shared-shell-accessibility.spec.ts`
     and `e2e/landing/navigation-reachability.spec.ts` both assert that no
     canonical route renders a heading matching /^(Sayfa|Yazı) Bulunamadı$/ —
     it is how they detect a route resolving to a not-found body. Changing this
     text would not fail those specs; it would quietly disarm them. */
  usePageMeta({
    title: post ? post.title : "Yazı Bulunamadı",
    description: post?.excerpt,
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
          eyebrow="KAYIT YOK"
          title="Yazı Bulunamadı"
          lede="Bu adreste bir yazı yok. Bağlantı değişmiş veya yazı kaldırılmış olabilir; dizinden ilgili başlığa geçebilirsiniz."
          actions={<ShellAction to="/blog" variant="primary">Yazı dizini</ShellAction>}
        />
        <ShellSurfaceBand no="02" label="DİZİN" tone="paper" ariaLabel="Yazı dizini">
          <div className="shell-span-full">
            <ShellIndexList
              ariaLabel="Teknik günlük yazıları"
              items={blogPosts.map((entry) => ({
                to: `/blog/${entry.slug}`,
                eyebrow: entry.category,
                title: entry.title,
                description: entry.excerpt,
                meta: [entry.date, entry.readTime],
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
          { label: "Yayın", value: post.date },
          { label: "Okuma", value: post.readTime },
          { label: "Bölüm", value: String(post.sections.length) },
        ]}
      />

      <ShellSurfaceBand no="02" label="METİN" tone="paper" ariaLabel={`${post.title} — yazı metni`}>
        <div className="shell-doc">
          <div className="shell-doc-main">
            <ShellPlate
              plate="PLAKA 01"
              caption={post.imageCaption}
              media={<img src={post.image} alt={post.imageAlt} width="1600" height="900" />}
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
              ariaLabel={`${post.title} bölümleri`}
              items={post.sections.map((section, index) => ({
                id: section.id,
                no: String(index + 1).padStart(2, "0"),
                label: section.heading,
              }))}
            />

            <nav className="shell-contents" aria-label="Bu yazıyı paylaş">
              <p className="shell-eyebrow">PAYLAŞ</p>
              <ol>
                {SHARE_TARGETS.map((target, index) => (
                  <li key={target.label}>
                    <a
                      href={target.href(shareUrl, post.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span>{target.label} <small>(yeni sekme)</small></span>
                    </a>
                  </li>
                ))}
              </ol>
              <ShellAction variant="quiet" onClick={copyLink}>
                {copied ? "Bağlantı kopyalandı" : "Bağlantıyı kopyala"}
              </ShellAction>
              {/* The live region is always in the DOM, empty until it has
                  something to say: a region inserted at the same moment as its
                  message is frequently not announced at all. */}
              <p className="tl-visually-hidden" role="status" aria-live="polite">
                {copied ? "Bağlantı panoya kopyalandı" : ""}
              </p>
            </nav>

            <p className="shell-note">
              Bu yazıdaki teknik değerler sitenin geri kalanıyla aynı kaynaktan gelir; farklı bir
              sayfada farklı bir değerle karşılaşmazsınız.
            </p>
          </aside>
        </div>
      </ShellSurfaceBand>

      {related.length > 0 && (
        <ShellSurfaceBand no="03" label="İLGİLİ" ariaLabel="İlgili yazılar">
          <div className="shell-span-full">
            <p className="shell-eyebrow">İLGİLİ YAZILAR</p>
            <ShellIndexList
              compact
              ariaLabel="İlgili yazılar"
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
        title="Bu konu sizin parçanızda mı çıktı?"
        body="Teknik resim veya 3B model gönderin; konuyu genel bir yazı üzerinden değil, kendi parçanız üzerinden değerlendirelim."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Gönderilecek", value: "Teknik resim veya 3B model" },
          { label: "Alternatif", value: "Sık sorulan sorular" },
        ]}
        secondary={{ label: "Yazı dizini", to: "/blog" }}
      />
    </PageShell>
  );
};
