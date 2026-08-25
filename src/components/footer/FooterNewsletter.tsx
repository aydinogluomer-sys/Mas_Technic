import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

export const FooterNewsletter = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      data-footer-newsletter
      className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-16"
      style={{
        background: "var(--precision-glow-subtle)",
        backdropFilter: "blur(10px)",
        border: "1px solid var(--surface-border)",
        boxShadow: "0 8px 32px 0 var(--overlay-vignette-light)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 40%, hsl(var(--primary) / 0.04) 50%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: "hsl(var(--primary))" }}>
            Teknik Bülten
          </span>
          <p className="text-sm leading-relaxed max-w-md mx-auto md:mx-0" style={{ color: "var(--text-secondary)" }}>
            CNC işleme, malzeme seçimi ve üretilebilirlik hakkındaki teknik analizlerimizi inceleyin.
          </p>
        </div>
        <Link
          to="/blog"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-200 hover:brightness-110 md:w-auto"
        >
          Yazıları incele
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 grid grid-cols-3 gap-1 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-primary" />
        ))}
      </div>
    </motion.div>
  );
};
