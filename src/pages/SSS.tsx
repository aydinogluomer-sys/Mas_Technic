import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/i18n/LocaleLink";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellContents,
  ShellEmpty,
  ShellNextStep,
  ShellPageHero,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { servicePages as turkishServicePages, type ServicePageData } from "@/data/servicePages";
import { useSiteData } from "@/i18n/data";
import { joinList } from "@/i18n/format";
import {
  CAD_UPLOAD_EXTENSIONS,
  CERTIFICATIONS,
  CMM_COVERAGE,
  MINIMUM_TOLERANCE,
  QUOTE_RESPONSE_TIME,
} from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   SSS — THE QUESTION REGISTER

   ── 1. WHAT WAS REMOVED, AND WHY IT IS NOT A STYLE DECISION ───────────────

   This page did not merely LOOK like the old design language. It ran a
   behavioural analytics pipeline that nothing in `USER_INPUTS.md` acknowledges
   and that both legal pages denied.

     · Every search, after a 1.5s debounce, wrote the reader's raw query into
       a Supabase table (`faq_analytics`, `event_type: "search"`).
     · Every question opened wrote that question into the same table.
     · On mount the page read the 200 most recent of each back and rendered
       them as `Popüler Aramalar` and `En Çok Aranan … {count} tıklama`.

   Three separate problems, any one of which is sufficient:

     A. §K records `ANALYTICS_PROVIDER: NONE`. `claims.ts` withholds
        `CONTENT_ANALYTICS` on exactly that authority, with the reason
        "per-post read counts, their sum and the most-read ranking were all
        hardcoded". A most-clicked ranking is that same shape — and it evaded
        the ledger only because this one was measured rather than typed.
        Measured or typed, §K says the site publishes no reach metric.
     B. `Popüler Aramalar` REPUBLISHED OTHER VISITORS' RAW SEARCH STRINGS to
        every subsequent visitor, unfiltered. A buyer who types a part number,
        a project code or their own company name into a CNC supplier's FAQ box
        had it shown to the next person on the page. That is a privacy defect
        with a plausible commercial consequence, not a UI preference.
     C. Neither the privacy policy nor the cookie policy disclosed any of it.
        This phase rewrote both to say the site runs no analytics — and that
        sentence has to be true of the code, not just of the copy.

   The table itself is untouched: `supabase/` is out of scope. What is gone is
   this page's reading from it and writing to it.

   ── 2. SEARCH AND FILTER: IMPLEMENTED, AND HERE IS THE JUSTIFICATION ──────

   `IMPLEMENTATION.md` §PHASE 08 requires search/filter to be justified or
   omitted. Omitted on `/blog` and on the 404; implemented here, because the
   corpus decides it: 10 general entries plus 117 `faq` entries carried by the
   48 service pages, de-duplicated by question. That is a register, and a
   register the length of a small book cannot be read top to bottom.

   Two controls, and no third: a text search over question, answer and
   category, and a category filter. There is no sort control, because there is
   no ordering of questions a reader has an opinion about, and no "popular"
   ordering, because §1A says nothing may measure it.

   ── 3. WHAT THE READER GETS THAT THEY DID NOT BEFORE ──────────────────────

   With no query and no category, the register is GROUPED BY CATEGORY with an
   anchor index beside it. The old page rendered all ~120 questions as one flat
   list of `border bg-card` accordions and offered a category filter as the
   only way through — so the default state of the page was the least usable
   one. Grouped, the default state is a table of contents.

   Filtering or searching flattens it, because inside a result set the
   grouping is noise.

   ── 4. WHAT ELSE WENT ─────────────────────────────────────────────────────

   The four-tile `SSS İstatistikleri` panel (Toplam Soru / Kategori / Kaynak
   Sayfa / Genel Soru) is gone on the `docs/lean/17` §6.4 principle: a count
   appears as the answer to a query the reader typed, not as a statement about
   the corpus. The duplicate category list in the sidebar is gone — it did what
   the filter above it already did. The `border-2 border-primary` CTA with the
   `w-32 h-32 rounded-full` blob scaling to 150% on hover is gone; the page
   ends on the same `ShellNextStep` band every other page ends on.

   The shadcn accordion went too: `<details>` works before hydration, owns its
   own open state, and needs no `aria-expanded` kept in sync
   (`docs/lean/17-inner-page-composition.md` §6.7).
   ══════════════════════════════════════════════════════════════════════════ */

interface FaqEntry {
  question: string;
  answer: string;
  category: string;
  /** The page this answer is published on, when it comes from one. */
  source: string;
  sourceSlug: string;
  sourceCategory: string;
}

/**
 * The ten general entries.
 *
 * Every factual value is sourced from `@/content/claims`, so the FAQ cannot
 * state a tolerance, an SLA or a measurement coverage that the rest of the
 * site contradicts — which is precisely how "48 saat" and "±0.005 mm" used to
 * survive in one corner after being corrected everywhere else.
 *
 * "Ücretsiz DFM analizi yapıyor musunuz?" was rewritten rather than deleted:
 * the question is a real one, but the old answer ("Evet, tüm projelerimiz
 * için…") is an unconditional commitment, and §D authorises capability
 * figures, not commitments (the same reason `/iletisim` lost its "30 dakikalık
 * ücretsiz ilk görüşme" in Phase 07).
 */
/* L01 — the answers are i18n keys; `{{…}}` values come from
   `@/content/claims` at render time (`generalVars`), so the Turkish text is
   byte-for-byte what it was and the English one states the same values. */
const GENERAL_FAQS: FaqEntry[] = [
  {
    question: "Minimum sipariş adedi nedir?",
    answer:
      "Minimum sipariş adedi yoktur. Tek parça prototipten seri üretime kadar çalışıyoruz; adet, teklifteki birim maliyeti etkiler ancak bir alt sınır oluşturmaz.",
    category: "Genel",
  },
  {
    question: "Hangi dosya formatlarını kabul ediyorsunuz?",
    /* 09a-C3: liste doğruydu ama ELLE YAZILMIŞTI — `CAD_ACCEPTED_EXTENSIONS`
       değiştiği gün bu cümle sessizce yanlışa dönerdi. Türetilmiş hâli
       BAYT BAYT aynı metni üretir; değişen tek şey, artık türeyebilmesi. */
    answer: "Teklif akışındaki yükleyici {{formats}} dosyalarını kabul eder. Ölçülendirilmiş 2B teknik resminizi veya listede olmayan bir formatı e-posta ile iletebilirsiniz.",
    category: "Genel",
  },
  {
    question: "Teslim süresi ne kadardır?",
    answer:
      "Termin; malzeme tedariki, operasyon sayısı ve kapasite planı incelendikten sonra teklifle birlikte paylaşılır. Acil işler için önceliklendirme talebinizi teklif aşamasında belirtin.",
    category: "Genel",
  },
  {
    question: "Teklifi ne kadar sürede alırım?",
    answer: "Teknik resim veya 3B model elimize ulaştıktan sonra {{response}} içinde dönüş yapılır. Üretilebilirlik incelemesinde bir soru çıkarsa, teklif beklemeden önce bunu size sorarız.",
    category: "Genel",
  },
  {
    question: "Hangi toleransta çalışıyorsunuz?",
    answer: "Standart tolerans aralığımız {{tolerance}}. Bundan dar bir tolerans gerekiyorsa, hangi kotenin gerçekten o toleransı gerektirdiğini teklif aşamasında birlikte belirleriz; gerektirmiyorsa bunu söylemeyi tercih ederiz.",
    category: "Kalite & Standartlar",
  },
  {
    question: "Kalite belgeniz var mı?",
    answer: "{{certifications}} yönetim sistemi belgelerimiz bulunmaktadır. Belge kapsamı dışında bir standart talep ediyorsanız teknik incelemede birlikte değerlendiririz.",
    category: "Kalite & Standartlar",
  },
  {
    question: "Ölçüm raporu veriyor musunuz?",
    answer: "Her iş için kontrol planı hazırlanır ve ölçüm kayıtları teslim dosyasına eklenir. {{cmm}} olarak sağlanır.",
    category: "Kalite & Standartlar",
  },
  {
    question: "Hangi malzemelerle çalışıyorsunuz?",
    answer:
      "Alüminyum, çelik, paslanmaz çelik, pirinç, bakır, titanyum ve mühendislik plastikleri (POM, PEEK, PA) ile çalışıyoruz. Malzeme kütüphanesindeki her aile için işlenebilirlik ve tipik değer aralıkları yayımlanmıştır.",
    category: "Malzeme",
  },
  {
    question: "Üretilebilirlik (DFM) incelemesi yapıyor musunuz?",
    answer:
      "Üretilebilirlik incelemesi teklif aşamasının bir parçasıdır: kote, tolerans ve yüzey talepleri seçilen imalat yöntemine göre gözden geçirilir ve maliyeti belirgin biçimde etkileyen noktalar teklifle birlikte yazılı olarak iletilir.",
    category: "Mühendislik",
  },
  {
    question: "Yüzey işleme hizmetiniz var mı?",
    answer:
      "Anodizasyon, kaplama, boyama, kumlama, parlatma ve ısıl işlem gibi yüzey işlemlerini sunuyor veya koordine ediyoruz. Hangi işlemin sizin parçanız için uygun olduğunu ilgili hizmet sayfasında bulabilirsiniz.",
    category: "Yüzey İşlemleri",
  },
].map((entry) => ({ ...entry, source: "Genel", sourceSlug: "", sourceCategory: "" }));

/** Service-page category labels → register categories. */
const CATEGORY_OF: Record<string, string> = {
  "Talaşlı İmalat": "Talaşlı İmalat",
  "Ön Üretim": "Kalıp & Ön Üretim",
  "Yüzey İşlemleri": "Yüzey İşlemleri",
  "İşaretleme & Tanımlama": "İşaretleme & Tanımlama",
  "Montaj & Birleştirme": "Montaj & Birleştirme",
  "Üretim Altyapısı": "Üretim Altyapısı",
  "Kalite & Standartlar": "Kalite & Standartlar",
  "Mühendislik Desteği": "Mühendislik",
  "Prototipten Seri Üretime": "Üretim Ölçeklendirme",
  "Süreç & Operasyon": "Süreç & Operasyon",
  "Yüksek Teknoloji": "Endüstriyel Sektörler",
  "Seri Üretim": "Endüstriyel Sektörler",
  "Endüstriyel Sistemler": "Endüstriyel Sektörler",
  "Üretim Çözümleri": "Endüstriyel Sektörler",
  "Enerji & Altyapı": "Endüstriyel Sektörler",
};

/* The register category is keyed by the TURKISH category label, so the
   grouping is the same in both languages; it is translated for display. */
const TURKISH_CATEGORY_LABEL = new Map(turkishServicePages.map((page) => [page.slug, page.categoryLabel]));

function serviceFaqs(pages: readonly ServicePageData[]): FaqEntry[] {
  return pages.flatMap((page) =>
    (page.faq ?? []).map((item) => {
      const label = TURKISH_CATEGORY_LABEL.get(page.slug) ?? page.categoryLabel;
      return {
        question: item.question,
        answer: item.answer,
        category: CATEGORY_OF[label] ?? label,
        source: page.title,
        sourceSlug: page.slug,
        sourceCategory: page.category,
      };
    }),
  );
}

function dedupe(entries: FaqEntry[], language: string): FaqEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.question.toLocaleLowerCase(language).trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function FaqItem({ entry }: { entry: FaqEntry }) {
  const { t } = useTranslation();
  return (
    <details className="shell-faq-item">
      <summary>{entry.question}</summary>
      <div className="shell-faq-answer">
        <p>{entry.answer}</p>
        {entry.sourceSlug && (
          <p className="shell-faq-source">
            <Link to={`/${entry.sourceCategory}/${entry.sourceSlug}`}>
              {t("{{source}} sayfası", { source: entry.source })}
            </Link>
          </p>
        )}
      </div>
    </details>
  );
}

export const SSS = () => {
  const { t, i18n } = useTranslation();
  const { servicePages } = useSiteData();
  const language = i18n.language === "en" ? "en" : "tr-TR";
  usePageMeta({
    title: t("Sıkça Sorulan Sorular"),
    description: t("CNC işleme, malzeme seçimi, tolerans, kalite kontrol ve teslimat süreçleri hakkında sıkça sorulan sorular ve yanıtları."),
  });

  const ALL_FAQS = useMemo(() => {
    const vars = {
      formats: joinList(CAD_UPLOAD_EXTENSIONS.split(", ").map((ext) => ext.slice(1).toUpperCase()), i18n.language),
      response: t(QUOTE_RESPONSE_TIME),
      tolerance: MINIMUM_TOLERANCE,
      certifications: joinList(CERTIFICATIONS.map((certification) => certification.code), i18n.language),
      cmm: t(CMM_COVERAGE),
    };
    const general = GENERAL_FAQS.map((entry) => ({
      ...entry,
      question: t(entry.question),
      answer: t(entry.answer, vars),
    }));
    return dedupe([...general, ...serviceFaqs(servicePages)], language);
  }, [t, i18n.language, servicePages, language]);

  /** Category order is the order the register first meets each category. */
  const CATEGORIES = useMemo(() => [...new Set(ALL_FAQS.map((entry) => entry.category))], [ALL_FAQS]);
  /** A stable DOM id per category, for the anchor index. */
  const anchorOf = (category: string) => `sss-${CATEGORIES.indexOf(category) + 1}`;

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(language);
    return ALL_FAQS.filter((entry) => {
      if (activeCategory && entry.category !== activeCategory) return false;
      if (!needle) return true;
      return (
        entry.question.toLocaleLowerCase(language).includes(needle)
        || entry.answer.toLocaleLowerCase(language).includes(needle)
        || t(entry.category).toLocaleLowerCase(language).includes(needle)
      );
    });
  }, [query, activeCategory, ALL_FAQS, language, t]);

  /* Grouped only in the UNFILTERED state — see the header note. Inside a
     result set the grouping is noise, and a reader who typed a query is
     looking at the answers, not at the taxonomy. */
  const isBrowsing = !query.trim() && !activeCategory;
  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        id: anchorOf(category),
        entries: filtered.filter((entry) => entry.category === category),
      })).filter((group) => group.entries.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, CATEGORIES],
  );

  const jsonLdFaqs = useMemo(
    () => filtered.map((entry) => ({ question: entry.question, answer: entry.answer })),
    [filtered],
  );

  return (
    <PageShell surface="graphite" rail={{ no: "R3", label: "SSS" }}>
      <JsonLdSchema type="faqPage" faq={jsonLdFaqs} />

      <ShellPageHero
        no="01"
        label="SSS"
        crumb={<ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "Sık sorulanlar" }]} />}
        eyebrow={t("Soru kaydı")}
        title={t("Sıkça Sorulan Sorular")}
        lede={t("Üretim, malzeme, tolerans, kalite ve teslimat başlıklarında sık sorulan sorular. Her yanıttan ilgili teknik sayfaya geçebilirsiniz.")}
        meta={[
          { label: t("Kapsam"), value: t("Üretim · Malzeme · Kalite · Teslimat") },
          { label: t("Standart tolerans"), value: MINIMUM_TOLERANCE },
          { label: t("Teklif dönüşü"), value: t(QUOTE_RESPONSE_TIME) },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">{t("Teklif Al")}</ShellAction>
            <ShellAction to="/iletisim" variant="ghost">{t("Soru sor")}</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="KAYIT" tone="paper" labelledBy="sss-register">
        <div className="shell-doc">
          <div className="shell-doc-main">
            <ShellTitleBlock
              id="sss-register"
              index="02"
              title={t("Soru kaydı")}
              standfirst={t("Arayın veya bir başlık seçin. Arama; soru metninde, yanıtta ve başlıkta çalışır.")}
            />

            <section className="shell-filter" aria-label={t("Soru filtreleri")}>
              <div className="shell-field shell-filter-search">
                <label htmlFor="sss-arama">{t("Ara")}</label>
                <input
                  id="sss-arama"
                  type="search"
                  value={query}
                  placeholder={t("tolerans, anodizasyon, termin…")}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="shell-field">
                <label htmlFor="sss-baslik">{t("Başlık")}</label>
                <select
                  id="sss-baslik"
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                >
                  <option value="">{t("Tümü")}</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{t(category)}</option>
                  ))}
                </select>
              </div>
              {/* A count as the ANSWER TO A QUERY, never as a statement about
                  the corpus — `docs/lean/17` §6.4. Silent while browsing. */}
              <p className="shell-field-hint" role="status">
                {isBrowsing ? "" : t("{{count}} soru", { count: filtered.length })}
              </p>
            </section>

            {filtered.length === 0 ? (
              <ShellEmpty
                label="EŞLEŞME YOK"
                title={t("Bu aramayla soru bulunamadı")}
                detail={t("Arama terimini kısaltmayı veya başlık seçimini kaldırmayı deneyebilirsiniz. Sorunuz burada yoksa doğrudan sorabilirsiniz.")}
                action={
                  <ShellAction
                    variant="ghost"
                    onClick={() => { setQuery(""); setActiveCategory(""); }}
                  >
                    {t("Filtreleri temizle")}
                  </ShellAction>
                }
              />
            ) : isBrowsing ? (
              groups.map((group) => (
                <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`}>
                  <h3 id={`${group.id}-title`} className="shell-faq-group">{t(group.category)}</h3>
                  <div className="shell-faq">
                    {group.entries.map((entry) => (
                      <FaqItem key={entry.question} entry={entry} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="shell-faq">
                {filtered.map((entry) => (
                  <FaqItem key={entry.question} entry={entry} />
                ))}
              </div>
            )}
          </div>

          <aside className="shell-doc-aside" data-sticky>
            {isBrowsing && (
              <ShellContents
                label="BAŞLIKLAR"
                ariaLabel="Soru başlıkları"
                items={groups.map((group, index) => ({
                  id: group.id,
                  no: String(index + 1).padStart(2, "0"),
                  label: t(group.category),
                }))}
              />
            )}
            <p className="shell-note">
              {t("Bir başlığın altındaki yanıtlar, o başlığın kendi teknik sayfasından gelir; yanıtı açtığınızda kaynak sayfaya geçebilirsiniz.")}
            </p>
          </aside>
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="03"
        title={t("Sorunuzun yanıtı burada yoksa")}
        body={t("Teknik resim veya 3B model gönderin; sorunuzu parçanın kendisi üzerinden yanıtlayalım. Yalnızca soracaksanız iletişim sayfası daha hızlıdır.")}
        detail={[
          { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
          { label: t("Gönderilecek"), value: t("Teknik resim veya 3B model") },
          { label: t("Ölçüm"), value: t(CMM_COVERAGE) },
        ]}
        secondary={{ label: t("İletişim"), to: "/iletisim" }}
      />
    </PageShell>
  );
};
