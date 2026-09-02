import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/shell/PageShell";
import { getPageBySlug, getPagesByCategory } from "@/data/servicePages";
import { ArrowRight, ChevronRight, CheckCircle2, Gauge, ArrowUpRight, Cpu, FlaskConical, Calendar, Sparkles, Layers, Zap } from "lucide-react";
import { useScroll, useTransform } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ComparisonTable } from "@/components/ComparisonTable";
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
import { JsonLdSchema } from "@/components/JsonLdSchema";

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

/* ── Animation variants ── */
const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const revealEase: [number, number, number, number] = [0.77, 0, 0.175, 1];

const slideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-60px" as const },
  transition: { delay, duration: 0.5, ease: smoothEase },
});

const slideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: 40 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true, margin: "-60px" as const },
  transition: { delay, duration: 0.5, ease: smoothEase },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.92 } as const,
  whileInView: { opacity: 1, scale: 1 } as const,
  viewport: { once: true, margin: "-60px" as const },
  transition: { delay, duration: 0.5, ease: smoothEase },
});

const clipReveal = (delay = 0) => ({
  initial: { clipPath: "inset(0 0 100% 0)", opacity: 0 } as const,
  whileInView: { clipPath: "inset(0 0 0% 0)", opacity: 1 } as const,
  viewport: { once: true, margin: "-60px" as const },
  transition: { delay, duration: 0.7, ease: revealEase },
});

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const ServiceDetail = () => {
  const { slug } = useParams<{ category: string; slug: string }>();
  const page = slug ? getPageBySlug(slug) : undefined;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 120]);
  /* I4 — `heroOpacity` is gone. It was
     `useTransform(heroScrollProgress, [0, 0.6], [1, 0])` on the block holding
     the breadcrumb, the eyebrow and this page's ONLY `<h1>`. Every
     `whileInView` on this route already carries `once: true`, so nothing was
     re-hidden by a reveal — the heading was faded out by scroll POSITION, and
     scroll position runs both ways. A scroll-linked opacity can never be
     `once`, and content legible at one scroll offset and not at another is
     missing content at every other offset. `heroY` is untouched: it moves a
     photograph, which is what cinematic motion is for. No layout, copy or
     at-rest appearance changes here.

     WHAT THIS DOES NOT FIX, MEASURED — for Phase 07, which owns this body.
     At 375 the eyebrow and the h1 are invisible regardless of the above, and
     the cause is LAYOUT, not motion. The hero is 320px (viewport y 96..416)
     while the `absolute bottom-0` block inside it is 424px tall, so the block
     spans y -8..416 and its top 104px — the eyebrow and the whole h1, at
     y 32..92 — are clipped off by the hero's `overflow: hidden`. Being
     clipped, the block never intersects, so its `whileInView` never fires and
     it sits at `opacity: 0` as a second, dependent symptom. At 1280 the same
     block is 229px inside a 440px hero and both are fine.

     `--mode=enabled` reports this as `afterScrollText=2` at 375 and 0 at 1280,
     and reports the SAME two elements on base commit a2b4c20, so it predates
     this packet. It is deliberately not patched from here: forcing the reveal
     to fire would put `opacity: 1` on text that is still clipped away, which
     clears the measurement while leaving the reader with no page title. The
     hero needs to fit its content at 375, and that is a layout change this
     packet may not make. `e2e/landing/motion-grammar.spec.ts` pins the motion
     half so it cannot regress while the layout half is outstanding. */

  if (!page) {
    return (
      <PageShell rail={{ no: "03", label: "HİZMET" }}>
        <div className="container-industrial text-center py-20">
          <h1 className="heading-industrial text-3xl mb-4">Sayfa Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">Aradığınız sayfa mevcut değil.</p>
          <Link to="/" className="btn-industrial-primary">Ana Sayfaya Dön</Link>
        </div>
      </PageShell>
    );
  }

  const relatedPages = getPagesByCategory(page.category).filter((p) => p.slug !== page.slug);
  const categoryLabels: Record<string, string> = { hizmetler: "Hizmetler", kabiliyetler: "Kabiliyetler", endustriyel: "Endüstriyel" };
  const heroImage = page.heroImage && heroImageMap[page.heroImage]
    ? heroImageMap[page.heroImage]
    : page.category === "kabiliyetler" ? qualityControl : cncWorkshop;

  return (
    /* Shell only (Phase 04). The page's `<main>` (which carried no id, so the
       skip link had no target here) and its `pt-24` hero clearance are gone:
       the shell supplies `<main id="main-content">` and the fixed bar is
       reserved once by `.tl-header-spacer`. Body untouched — Phase 07 owns
       this page, including blocker B24's 28 `color-contrast` violations. */
    <PageShell rail={{ no: "03", label: "HİZMET" }}>
      <JsonLdSchema
        type="service"
        name={page.title}
        description={page.description}
        category={page.categoryLabel}
        faq={page.faq}
      />
        {/* ═══ HERO with parallax ═══ */}
        <section ref={heroRef} className="relative pb-0">
          <div className="relative h-[320px] md:h-[440px] overflow-hidden">
            <motion.img
              src={heroImage}
              alt={page.title}
              className="w-full h-full object-cover"
              style={{ y: heroY }}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            {/* Ghost machine-loop video */}
            <video
              src="/machine-loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none hidden md:block"
              style={{ mixBlendMode: "luminosity" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-base)] via-[rgb(var(--surface-base-rgb)/0.75)] to-[rgb(var(--surface-base-rgb)/0.2)]" />

            {/* I4: no scroll-linked opacity here — see `heroY` above. */}
            <div className="absolute bottom-0 left-0 right-0 container-industrial pb-10">
              <nav className="flex items-center gap-2 text-xs text-[rgb(var(--text-primary-rgb)/0.6)] mb-4">
                <Link to="/" className="inline-flex min-h-[24px] items-center hover:text-[var(--text-primary)] transition-colors">Ana Sayfa</Link>
                <ChevronRight size={12} />
                <span>{categoryLabels[page.category] || page.category}</span>
                <ChevronRight size={12} />
                <span className="text-[var(--text-primary)] font-medium">{page.title}</span>
              </nav>

              <motion.div {...clipReveal(0.2)}>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-2 block text-primary">
                  {page.categoryLabel}
                </span>
                <h1 className="heading-industrial text-3xl md:text-5xl text-[var(--text-primary)]">{page.title}</h1>
              </motion.div>

              {page.technicalSpecs && page.technicalSpecs.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-3 mt-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {page.technicalSpecs.slice(0, 4).map((spec, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      className="bg-[rgb(var(--text-primary-rgb)/0.1)] backdrop-blur-sm border border-[rgb(var(--text-primary-rgb)/0.1)] px-4 py-2 hover:bg-[rgb(var(--text-primary-rgb)/0.15)] transition-colors"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--text-primary-rgb)/0.5)] block">{spec.label}</span>
                      <span className="text-technical text-sm font-bold text-[var(--text-primary)]">{spec.value}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </section>

        <div className="container-industrial py-12 md:py-16">
          {/* Description with clip reveal */}
          <motion.p {...clipReveal(0.1)} className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">
            {page.description}
          </motion.p>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* ═══ MAIN CONTENT ═══ */}
            <div className="lg:col-span-2 space-y-14">

              {/* Content paragraphs — stagger */}
              <motion.div
                className="space-y-5 text-muted-foreground leading-relaxed"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
              >
                {page.content.map((p, i) => (
                  <motion.p key={i} variants={staggerItem}>{p}</motion.p>
                ))}
              </motion.div>

              {/* Process Steps — numbered timeline style */}
              {page.processSteps && page.processSteps.length > 0 && (
                <motion.div {...slideUp(0.1)}>
                  <h2 className="heading-industrial text-xl mb-6 flex items-center gap-3">
                    <div className="accent-line !w-8" />
                    <Layers size={20} className="text-primary" />
                    Süreç Adımları
                  </h2>
                  <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {page.processSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        className="group flex items-center gap-3 bg-card border border-border px-4 py-4 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-technical text-xs text-primary font-bold shrink-0 w-7 h-7 bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium">{step}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Advantages — slide from left */}
              {page.advantages && page.advantages.length > 0 && (
                <motion.div {...slideUp(0.1)}>
                  <h2 className="heading-industrial text-xl mb-6 flex items-center gap-3">
                    <div className="accent-line !w-8" />
                    <Zap size={20} className="text-primary" />
                    Avantajlarımız
                  </h2>
                  <motion.div
                    className="grid sm:grid-cols-2 gap-3"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {page.advantages.map((adv, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        className="group flex items-start gap-3 bg-card border border-border p-4 hover:border-primary transition-all duration-300 relative overflow-hidden"
                        whileHover={{ x: 4 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5 relative z-10" />
                        <span className="text-sm relative z-10">{adv}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Features — scale-in cards */}
              {page.features && page.features.length > 0 && (
                <motion.div {...slideUp(0.1)}>
                  <h2 className="heading-industrial text-xl mb-6 flex items-center gap-3">
                    <div className="accent-line !w-8" />
                    <Sparkles size={20} className="text-primary" />
                    Öne Çıkan Özellikler
                  </h2>
                  <motion.div
                    className="grid sm:grid-cols-2 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {page.features.map((feature, i) => (
                      <motion.div
                        key={feature}
                        variants={staggerItem}
                        className="group border border-border bg-card p-5 hover:border-primary hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        whileHover={{ y: -4, scale: 1.01 }}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full translate-x-10 translate-y-10 group-hover:scale-[3] transition-transform duration-500" />
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <span className="text-technical text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                          </div>
                          <span className="text-sm font-semibold group-hover:text-primary transition-colors">{feature}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* THE MACHINE PARK BLOCK WAS REMOVED (Phase 06).

                  It rendered `page.machines` — a fabricated inventory of
                  named models, work envelopes and spindle speeds across nine
                  service pages. `USER_INPUTS.md` §D marks MACHINE_COUNT
                  PRIVATE_DO_NOT_DISCLOSE and supplies no model list at all,
                  so both the data and this renderer are gone: leaving the
                  renderer would invite the data back. §H publishes a real
                  measurement-equipment PDF instead, linked from KAYNAKLAR. */}

              {/* Materials — slide left cards */}
              {page.materials && page.materials.length > 0 && (
                <motion.div {...slideUp(0.1)}>
                  <h2 className="heading-industrial text-xl mb-6 flex items-center gap-3">
                    <div className="accent-line !w-8" />
                    <FlaskConical size={20} className="text-primary" />
                    İşlenebilir Malzemeler
                  </h2>
                  <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {page.materials.map((mat, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        className="border border-border bg-card overflow-hidden hover:border-primary transition-all group"
                        whileHover={{ y: -4 }}
                      >
                        <div className="bg-primary/5 px-5 py-3 border-b border-border relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors relative z-10">{mat.name}</h4>
                          <span className="text-technical text-xs text-primary relative z-10">{mat.grade}</span>
                        </div>
                        <div className="px-5 py-3">
                          <p className="text-xs text-muted-foreground">{mat.properties}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Comparison Tables */}
              {page.comparisonTables && page.comparisonTables.length > 0 && (
                <motion.div {...scaleIn(0.1)} className="space-y-8">
                  <h2 className="heading-industrial text-xl mb-6 flex items-center gap-3">
                    <div className="accent-line !w-8" /> Teknik Karşılaştırma Tabloları
                  </h2>
                  {page.comparisonTables.map((table, i) => (
                    <ComparisonTable key={i} table={table} index={i} />
                  ))}
                </motion.div>
              )}

              {/* FAQ Section */}
              {page.faq && page.faq.length > 0 && (
                <motion.div {...slideUp(0.1)}>
                  <h2 className="heading-industrial text-xl mb-6 flex items-center gap-3">
                    <div className="accent-line !w-8" /> Sıkça Sorulan Sorular
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {page.faq.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                      >
                        <AccordionItem value={`faq-${i}`} className="border border-border bg-card px-5 hover:border-primary/50 transition-colors">
                          <AccordionTrigger className="text-sm font-semibold text-left hover:text-primary transition-colors py-4">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground pb-4">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </motion.div>
              )}
            </div>

            {/* ═══ SIDEBAR — STICKY ═══ */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                {page.technicalSpecs && page.technicalSpecs.length > 0 && (
                  <motion.div
                    className="border border-border bg-card overflow-hidden"
                    {...slideLeft(0.2)}
                  >
                    <div className="bg-primary p-4 flex items-center gap-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary" />
                      <Gauge size={20} className="text-primary-foreground relative z-10" />
                      <h3 className="font-bold text-primary-foreground text-sm uppercase tracking-wider relative z-10">Teknik Özellikler</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {page.technicalSpecs.map((spec, i) => (
                        <motion.div
                          key={i}
                          className="flex justify-between items-center px-4 py-3 hover:bg-primary/5 transition-colors"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                        >
                          <span className="text-xs text-muted-foreground">{spec.label}</span>
                          <span className="text-technical text-xs font-bold text-foreground">{spec.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="border-2 border-primary bg-card p-6 relative overflow-hidden group"
                  {...slideLeft(0.3)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Projeniz için teklif alın</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      {page.title} hizmeti hakkında detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.
                    </p>
                    <Link to="/iletisim" className="btn-industrial-primary w-full flex items-center justify-center gap-2 text-center group/btn">
                      Teklif Al <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  className="border border-border bg-card p-6 hover:border-primary/50 transition-colors group"
                  {...slideLeft(0.4)}
                >
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors duration-300">
                    <Calendar size={18} className="text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-bold text-sm mb-2">Online Toplantı Planlayın</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Mühendislik ekibimizle Google Meet üzerinden projenizi detaylı konuşun.
                  </p>
                  <Link to="/iletisim" className="text-xs font-semibold text-primary inline-flex min-h-[24px] w-fit items-center gap-1 hover:gap-2 transition-all">
                    Toplantı Talep Et <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Related pages */}
          {relatedPages.length > 0 && (
            <motion.div className="mt-20 pt-12 border-t border-border" {...slideUp(0.1)}>
              <h2 className="heading-industrial text-xl mb-8 flex items-center gap-3">
                <div className="accent-line !w-8" /> İlgili Sayfalar
              </h2>
              <motion.div
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {relatedPages.slice(0, 8).map((rp) => (
                  <motion.div key={rp.slug} variants={staggerItem}>
                    <Link
                      to={`/${rp.category}/${rp.slug}`}
                      className="block border border-border bg-card p-5 hover:border-primary transition-all group h-full relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{rp.categoryLabel}</span>
                          <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{rp.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{rp.description}</p>
                        {rp.technicalSpecs && rp.technicalSpecs.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                            {rp.technicalSpecs.slice(0, 2).map((spec, i) => (
                              <span key={i} className="text-technical text-[10px] text-primary bg-primary/10 px-2 py-0.5">{spec.value}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
    </PageShell>
  );
};
