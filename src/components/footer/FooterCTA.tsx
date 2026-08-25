import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

export const FooterCTA = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      data-footer-cta
      className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-12"
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

      <div className="relative text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Projenizi Hayata Geçirmeye{" "}
          <br className="hidden md:block" />
          <span className="text-primary">Hazır mısınız?</span>
        </h3>
        <p className="text-sm max-w-xl mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
          Parça, malzeme ve kullanım bağlamını paylaşarak teklif sürecini başlatın veya ek bilgi için bize ulaşın.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/teklif-al"
            className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            Hemen Teklif Al
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/iletisim"
            className="px-8 py-3.5 font-semibold text-sm uppercase tracking-wider inline-flex items-center justify-center transition-all"
            style={{ border: "1px solid var(--surface-border-hover)", color: "var(--text-primary)" }}
          >
            Bize Ulaşın
          </Link>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 grid grid-cols-3 gap-1 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-primary" />
        ))}
      </div>
    </motion.div>
  );
};
