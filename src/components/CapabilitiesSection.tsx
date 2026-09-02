import { useState, useEffect, useRef, forwardRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { motion } from "@/components/shell/motion";
import { ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { MagneticButton } from "./MagneticButton";

const equipment = [
  {
    category: "CNC Frezeleme",
    model: "DMG MORI 5-Eksen",
    size: "1200 × 800 × 600",
    tolerance: "±0.005 mm",
    speed: "24,000 RPM",
  },
  { category: "CNC Torna", model: "Doosan Puma 400", size: "Ø 400 × 1000L", tolerance: "±0.01 mm", speed: "4,500 RPM" },
  { category: "Taşlama", model: "Studer S33", size: "Ø 350 × 1000L", tolerance: "±0.002 mm", speed: "—" },
  { category: "Tel Erozyon", model: "Sodick ALC600G", size: "600 × 400 × 350", tolerance: "±0.005 mm", speed: "—" },
  { category: "CMM Ölçüm", model: "Zeiss Contura", size: "900 × 1200 × 800", tolerance: "±0.001 mm", speed: "—" },
];

/* CountUp for tolerance stat */
const useToleranceCountUp = (prefersReduced: boolean) => {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced) {
      setValue(0.001);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const target = 0.001;
          const duration = 2000;
          const startTime = Date.now();
          const step = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setValue(easeOut * target);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, prefersReduced]);

  return { value, ref };
};

export const CapabilitiesSection = forwardRef<HTMLDivElement>((_, forwardedRef) => {
  const prefersReduced = usePrefersReducedMotion();
  const tolerance = useToleranceCountUp(prefersReduced);

  const rackInitial = prefersReduced
    ? { opacity: 1, filter: "blur(0px)", scale: 1 }
    : { opacity: 0, filter: "blur(8px)", scale: 0.97 };
  const rackAnimate = { opacity: 1, filter: "blur(0px)", scale: 1 };

  return (
    <motion.section
      ref={forwardedRef}
      id="kabiliyetler"
      className="section-tone-capabilities relative px-4 py-16 md:min-h-[100dvh] md:py-24 lg:py-32"
      initial={rackInitial}
      whileInView={rackAnimate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Sticky panel */}
          <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)] flex flex-col justify-center">
            <motion.div initial={prefersReduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary font-mono">
                  {"Teknik Yetkinlik"}
                </span>
              </div>
              <Reveal variant="word-stagger" duration={0.6}>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{"Makine Parkuru"}</h2>
              </Reveal>
            </motion.div>

            {/* Animated tolerance stat */}
            <motion.div
              ref={tolerance.ref}
              className="p-8 border border-border bg-card mb-8"
              initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-mono">
                {"Minimum Tolerans"}
              </div>
              <div className="text-5xl md:text-6xl font-bold font-mono" style={{ color: "hsl(var(--forge-molten))" }}>
                {"±"}
                {tolerance.value.toFixed(3)}
                <span className="text-2xl">{"mm"}</span>
              </div>
            </motion.div>

            <MagneticButton
              as="button"
              onClick={() => {
                const el = document.getElementById("iletisim");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>{"Teknik Kapasiteyi İncele"}</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>

          {/* Right: Scrolling equipment rows */}
          <div>
            <motion.div
              className="border border-border overflow-x-auto"
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {/* Table Header */}
              <div
                className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border min-w-[640px]"
                style={{ backgroundColor: "var(--mat-steel-blue)" }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-primary)" }}>{"Kategori"}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-primary)" }}>{"Ekipman"}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-primary)" }}>{"Boyut"}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-primary)" }}>{"Tolerans"}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-primary)" }}>{"Hız"}</span>
              </div>

              {/* Table Rows with stagger */}
              {equipment.map((eq, i) => (
                <motion.div
                  key={eq.category}
                  className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-primary/5 transition-colors min-w-[640px] cursor-default"
                  initial={prefersReduced ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                >
                  <span className="text-sm font-semibold text-foreground">{eq.category}</span>
                  <span className="text-sm text-foreground/80">{eq.model}</span>
                  <span className="text-sm text-foreground/75 font-mono">{eq.size}</span>
                  <span className="text-sm font-semibold font-mono" style={{ color: "hsl(var(--forge-molten))" }}>
                    {eq.tolerance}
                  </span>
                  <span className="text-sm text-foreground/75 font-mono">{eq.speed}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

CapabilitiesSection.displayName = "CapabilitiesSection";
