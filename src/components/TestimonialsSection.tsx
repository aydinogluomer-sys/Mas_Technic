import { forwardRef, useRef, useEffect, type ForwardedRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal as TextReveal } from "./ui/Reveal";
import { LogoLoop } from "./LogoLoop";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap, ScrollTrigger } from "@/hooks/use-gsap";

const testimonials = [
  {
    text: "5 yıldır çalışıyoruz. Havacılık parçalarımızda hiç kalite sorunu yaşamadık. Tolerans disiplinleri ve zamanında teslimatları ile güvenilir bir iş ortağı.",
    name: "Satınalma Müdürü",
    role: "Havacılık & Uzay Sektörü",
  },
  {
    text: "Prototip süreçlerimizde hız ve kalite dengesini mükemmel sağlıyorlar. DFM analizleri sayesinde tasarımlarımızı optimize ettik ve maliyetlerimizi düşürdük.",
    name: "Ar-Ge Mühendisi",
    role: "Otomotiv Sektörü",
  },
  {
    text: "Medikal implant üretiminde güvenilirlik kritik. ISO 13485 uyumlu süreçleri ve izlenebilirlik sistemi tam aradığımız standartları karşılıyor.",
    name: "Üretim Direktörü",
    role: "Medikal Cihaz Üreticisi",
  },
  {
    text: "Savunma sanayii projelerimizde hassasiyet ve gizlilik ön planda. Bu iki konuda da beklentilerimizi fazlasıyla karşılıyorlar.",
    name: "Proje Yöneticisi",
    role: "Savunma Sanayi",
  },
  {
    text: "Küçük partilerden seri üretime geçişte hiç aksama yaşamadık. Esnek üretim kapasiteleri ve hızlı iletişimleri çok değerli.",
    name: "Tedarik Zinciri Uzmanı",
    role: "Endüstriyel Üretim",
  },
  {
    text: "Alüminyum ve paslanmaz çelik işlemede üstün kalite sunuyorlar. Yüzey işlem seçenekleri de oldukça geniş ve profesyonel.",
    name: "Kalite Müdürü",
    role: "Beyaz Eşya Sektörü",
  },
];

const clients = [
  "Emir Alüminyum", "Mert Teknik", "BDM", "Akbaşlar", "EMOR",
  "Batı Isıl İşlem", "Yaka Döküm", "Değer Galvano", "Çağdaş Teknik", "C.T.M",
  "Ege Teknik", "Maktest", "Eksen Hassas Döküm", "Era Metalurji", "Xtremex Kimya",
  "DPM Boya", "Ahmet Tezcan", "Ali Galip", "Mikrosan Makina", "Dösan Isıl İşlem",
  "Asil Oltulu", "Akon Hidrolik", "ENTEA", "Amade Metal", "De-Taş",
];

const stats = [
  { value: "1000+", label: "Tamamlanan Proje" },
  { value: "15+", label: "Yıllık Uzmanlık" },
  { value: "24/7", label: "Kesintisiz Üretim" },
  { value: "%100", label: "Zamanında Teslimat" },
];

const setRefs = <T,>(node: T | null, localRef: { current: T | null }, forwardedRef: ForwardedRef<T>) => {
  localRef.current = node;
  if (typeof forwardedRef === "function") forwardedRef(node);
  else if (forwardedRef) forwardedRef.current = node;
};

export const TestimonialsSection = forwardRef<HTMLElement>((_, ref) => {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  // GSAP stacked card effect
  useEffect(() => {
    if (prefersReduced || isMobile) return;
    const container = cardsContainerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>(".testimonial-stack-card");
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
    cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // last card stays

        ScrollTrigger.create({
          trigger: card,
          start: "top 20%",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(card, {
              scale: 1 - p * 0.08,
              y: -p * 30,
              opacity: 1 - p * 0.6,
              filter: `blur(${p * 6}px)`,
            });
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, [prefersReduced, isMobile]);

  const logoItems = clients.map((name) => ({
    node: (
      <span
        className="text-lg md:text-xl font-bold tracking-wider select-none whitespace-nowrap"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {name}
      </span>
    ),
    alt: name,
  }));

  return (
    <section
      ref={(node) => setRefs(node, sectionRef, ref)}
      id="referanslar"
      className="section-tone-testimonials relative py-24 md:py-32 lg:py-40 flex flex-col justify-center"
    >
      {/* Subtle grain texture for depth separation from Capabilities */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      {/* Decorative corner accents */}
      <div
        className="testimonial-corner absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 pointer-events-none"
        style={{ borderColor: "var(--precision-glow-subtle)" }}
      />
      <div
        className="testimonial-corner absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 pointer-events-none"
        style={{ borderColor: "var(--precision-glow-subtle)" }}
      />

      <div className="container-industrial relative z-10">
        {/* Header */}
        <TextReveal className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="testimonial-accent-line w-10 h-px" style={{ backgroundColor: "var(--accent-teal)" }} />
            <span
              className="testimonial-accent-text text-[10px] font-semibold uppercase tracking-[0.5em] font-mono"
              style={{ color: "var(--accent-teal)" }}
            >
              Güvenilir Partnerler
            </span>
            <div className="testimonial-accent-line w-10 h-px" style={{ backgroundColor: "var(--accent-teal)" }} />
          </div>
          <h2
            className="testimonial-heading text-foreground text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
          >
            Bizi Tercih Edenler
          </h2>
          <p
            className="testimonial-subtext text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--text-inverse-secondary)" }}
          >
            Türkiye'nin önde gelen sanayi kuruluşlarının hassas CNC üretim partneri olarak
            <span className="font-semibold" style={{ color: "hsl(var(--forge-molten))" }}>
              {" "}1000+ projeyi{" "}
            </span>
            başarıyla teslim ettik.
          </p>
        </TextReveal>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="testimonial-stat-card relative text-center py-6 md:py-8 px-4 group overflow-hidden border"
              style={{
                backgroundColor: "var(--surface-glass-hover)",
                borderColor: "var(--precision-glow-subtle)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: "hsl(var(--forge-molten))" }}
              />
              <div
                className="testimonial-stat-value text-2xl md:text-3xl font-bold mb-1.5"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {stat.value}
              </div>
              <div
                className="testimonial-stat-label text-[10px] md:text-xs uppercase tracking-[0.15em] font-medium"
                style={{ color: "var(--text-inverse-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Logo Marquee */}
        <div className="mb-3">
          <LogoLoop
            logos={logoItems}
            speed={70}
            direction="left"
            logoHeight={36}
            gap={isMobile ? 40 : 72}
            pauseOnHover
            fadeOut
            style={{ height: 44 }}
            renderItem={(item) => (
              <div
                className="testimonial-logo-item transition-all duration-300 cursor-default hover:scale-110"
                style={{ color: "var(--text-inverse-muted)" }}
              >
                {item.node}
              </div>
            )}
          />
        </div>
        <div className="w-full h-px mb-3" style={{ backgroundColor: "var(--precision-glow-subtle)" }} />
        <div className="mb-16 md:mb-20">
          <LogoLoop
            logos={logoItems}
            speed={50}
            direction="right"
            logoHeight={36}
            gap={isMobile ? 40 : 72}
            pauseOnHover
            fadeOut
            style={{ height: 44 }}
            renderItem={(item) => (
              <div
                className="testimonial-logo-item transition-all duration-300 cursor-default hover:scale-110"
                style={{ color: "var(--text-inverse-muted)" }}
              >
                {item.node}
              </div>
            )}
          />
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color: "hsl(var(--forge-steel) / 0.4)" }}>
              Aşağı kaydırın
            </span>
            <motion.div
              className="w-5 h-8 border border-primary/30 rounded-full flex justify-center pt-1.5"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <motion.div
                className="w-1 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Stacked Testimonial Cards */}
        <div ref={cardsContainerRef} className="relative max-w-3xl mx-auto">
          <div className="flex flex-col gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testimonial-stack-card testimonial-card-bg border p-8 md:sticky md:p-10"
                style={{
                  top: `${120 + i * 20}px`,
                  backgroundColor: "var(--bg-light-testimonial)",
                  borderColor: "var(--precision-glow-subtle)",
                  zIndex: i + 1,
                }}
              >
                {/* Quote mark */}
                <div
                  className="text-5xl font-serif leading-none mb-4 select-none"
                  style={{ color: "hsl(var(--primary) / 0.15)" }}
                >
                  "
                </div>
                <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: "hsl(var(--foreground))" }}>
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center text-xs font-bold font-mono"
                    style={{
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {t.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/iletisim"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all duration-300 group"
            style={{ color: "var(--accent-teal)" }}
          >
            Siz de partnerimiz olun
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";
