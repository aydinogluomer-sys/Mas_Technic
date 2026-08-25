import { ArrowRight } from "lucide-react";
import { AmbientGlowOverlay } from "@/components/ui/AmbientGlowOverlay";
import { motion } from "framer-motion";
import { useRef, useState, useCallback, useLayoutEffect, forwardRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { MagneticButton } from "./MagneticButton";
import { BracketButton } from "./ui/BracketButton";
import { gsap, ScrollTrigger } from "@/hooks/use-gsap";

/* ── GSAP CTA headline with char stagger ── */
const GsapCtaHeadline = forwardRef<HTMLHeadingElement>((_props, _fRef) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced) return;

    const words = [
      { text: "Birlikte ", gradient: false },
      { text: "Üretelim", gradient: true },
      { text: ".", gradient: false },
    ];

    el.innerHTML = words
      .map((w) => {
        const chars = w.text.split("").map((c) => {
          const style = w.gradient
            ? `display:inline-block;opacity:0;transform:translateY(100%);background:var(--gradient-heat-word);-webkit-background-clip:text;-webkit-text-fill-color:transparent`
            : `display:inline-block;opacity:0;transform:translateY(100%)`;
          return c === " "
            ? " "
            : `<span class="gsap-cta-char" style="${style}">${c}</span>`;
        });
        return chars.join("");
      })
      .join("");

    const allChars = el.querySelectorAll(".gsap-cta-char");

    const ctx = gsap.context(() => {
      gsap.to(allChars, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.03,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <h2
      ref={ref}
      className="text-5xl md:text-7xl lg:text-9xl font-bold text-foreground mb-8 tracking-tighter"
      style={{ lineHeight: 0.95 }}
      aria-label="Birlikte Üretelim."
    >
      {prefersReduced && (
        <>
          Birlikte <span className="text-primary">Üretelim</span>.
        </>
      )}
    </h2>
  );
});

GsapCtaHeadline.displayName = "GsapCtaHeadline";

export const FinalCTASection = forwardRef<HTMLDivElement>((_props, _forwardedRef) => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [sweepState, setSweepState] = useState<"idle" | "animating">("idle");
  const [sweepDirection, setSweepDirection] = useState<"right" | "left">("right");
  const [sweepKey, setSweepKey] = useState(0);

  const triggerSweep = useCallback(
    (dir: "right" | "left") => {
      if (sweepState === "animating") return;
      setSweepDirection(dir);
      setSweepKey((k) => k + 1);
      setSweepState("animating");
    },
    [sweepState]
  );

  const handleMouseEnter = useCallback(() => triggerSweep("right"), [triggerSweep]);
  const handleMouseLeave = useCallback(() => triggerSweep("left"), [triggerSweep]);

  const getClipPath = (dir: "right" | "left", phase: "start" | "end") => {
    if (dir === "right") {
      return phase === "start"
        ? "polygon(-20% 0%, -10% 0%, -30% 100%, -40% 100%)"
        : "polygon(0% 0%, 120% 0%, 100% 100%, -20% 100%)";
    }
    return phase === "start"
      ? "polygon(110% 0%, 120% 0%, 140% 100%, 130% 100%)"
      : "polygon(-20% 0%, 120% 0%, 100% 100%, -20% 100%)";
  };

  return (
    <section
      ref={sectionRef}
      id="iletisim"
      className="section-tone-conversion py-24 md:py-32 lg:py-40 min-h-screen flex items-center justify-center text-center relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AmbientGlowOverlay />
      {/* Flash cut white overlay */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 z-[30] pointer-events-none"
          style={{ backgroundColor: "var(--text-primary)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 0.6, 0] }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.25, ease: "easeOut", times: [0, 0.5, 1] }}
        />
      )}
      {/* Diagonal sweep overlay */}
      <motion.div
        key={sweepKey}
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ clipPath: getClipPath(sweepDirection, "start") }}
        animate={{ clipPath: getClipPath(sweepDirection, "end") }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onAnimationComplete={() => setSweepState("idle")}
        style={{
          background: sweepDirection === "right"
            ? `linear-gradient(135deg, var(--mat-steel-blue) 0%, var(--bg-cinematic-deep) 100%)`
            : `linear-gradient(135deg, var(--bg-cinematic-deep) 0%, var(--mat-steel-blue) 100%)`,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            `linear-gradient(to right, var(--surface-scanline) 1px, transparent 1px), linear-gradient(to bottom, var(--surface-scanline) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-industrial relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70 mb-8 font-mono"
            initial={prefersReduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {"Başlayalım"}
          </motion.p>

          <GsapCtaHeadline />

          <motion.p
            className="text-base md:text-lg mb-12 max-w-xl mx-auto text-foreground/70"
            style={{ lineHeight: 1.7 }}
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {"CAD dosyanızı gönderin, 24 saat içinde kapsamlı DFM analizi ve rekabetçi fiyat teklifi alın."}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <MagneticButton
              href="/teklif-al"
              className="px-10 py-4 font-semibold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all hover:brightness-110 border-2 bg-primary border-primary text-primary-foreground"
              strength={0.25}
            >
              {"Teklif Al"}
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <BracketButton
              as="a"
              href="/iletisim"
              className="text-foreground/80 border-foreground/30 hover:text-foreground hover:border-foreground/60"
            >
              {"Bize Ulaşın"}
            </BracketButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
FinalCTASection.displayName = "FinalCTASection";
