import { forwardRef } from "react";
import { motion } from "@/components/shell/motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useRenderProfile } from "@/hooks/useRenderProfile";
import { useSoundEngine } from "@/hooks/use-sound";
import heroBg from "@/assets/hero-cnc.webp";
import cncVideo from "@/assets/cnc-factory-zoom.mp4";
import { LiveLedgerCard } from "./LiveLedgerCard";
import { HeroCadDropzone } from "./HeroCadDropzone";

interface HeroSectionProps {
  isFirstVisit?: boolean;
}

const ticker = [
  ["İşlem hattı", "7 / 9 aktif"],
  ["Son FAIR", "2026·04·22 14:06"],
  ["Aç. teklif", "24"],
  ["48s SLA", "%98.4"],
  ["ISO 9001", "rev J · 2025·11"],
];

export const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(({ isFirstVisit = false }, ref) => {
  const prefersReduced = usePrefersReducedMotion();
  const renderProfile = useRenderProfile();
  const soundEngine = useSoundEngine();
  const delay = isFirstVisit ? 0.25 : 0;
  const itemInitial = prefersReduced ? false : { opacity: 0, y: 26 };

  return (
    <section
      ref={ref}
      id="top"
      className="section-tone-hero relative min-h-[100dvh] overflow-hidden pt-24 pb-16 md:pt-28"
      style={{ color: "var(--text-primary)" }}
    >
      <div className="absolute inset-0 z-0">
        {renderProfile.tier !== "static" ? (
          <video
            src={cncVideo}
            poster={heroBg}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            className="hidden h-full w-full object-cover md:block"
            style={{ opacity: renderProfile.tier === "high" ? 0.24 : 0.16, filter: "brightness(0.65) saturate(0.9)" }}
          />
        ) : null}
        <img src={heroBg} alt="CNC üretim hattı" className={`h-full w-full object-cover ${renderProfile.tier !== "static" ? "md:hidden" : ""}`} style={{ opacity: 0.24 }} />
      </div>
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 540px at 72% 28%, var(--data-accent-soft), transparent 62%), linear-gradient(180deg, var(--overlay-dark-low), var(--bg-cinematic-deep))",
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--surface-scanline) 1px, transparent 1px), linear-gradient(to bottom, var(--surface-scanline) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="container-industrial relative z-10 flex min-h-[calc(100dvh-10rem)] flex-col justify-center gap-8">
        <motion.div
          className="grid border font-mono text-[10px] uppercase tracking-[0.16em] md:grid-cols-5"
          style={{ borderColor: "var(--rule)", color: "var(--text-muted)" }}
          initial={itemInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
          role="status"
          aria-label="Canlı operasyon durumu"
        >
          {ticker.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 border-b px-4 py-3 last:border-b-0 md:block md:border-b-0 md:border-r md:last:border-r-0" style={{ borderColor: "var(--rule)" }}>
              <span className="block" style={{ color: "var(--text-muted)" }}>{key}</span>
              <b className="block pt-1 font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</b>
            </div>
          ))}
        </motion.div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <motion.div
              className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.34em]"
              style={{ color: "var(--text-muted)" }}
              initial={itemInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: delay + 0.08 }}
            >
              <span className="h-px w-10" style={{ background: "var(--action-primary)" }} />
              MT·DHF·01 / Engineering Ledger
            </motion.div>

            <motion.h1
              className="max-w-4xl text-[clamp(3.25rem,10vw,8.8rem)] font-bold leading-[0.9] tracking-tight"
              style={{ color: "var(--text-primary)" }}
              initial={itemInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay + 0.14 }}
            >
              Her iddia<br />
              <em className="font-normal not-italic" style={{ color: "var(--text-secondary)" }}>bir ölçümdür.</em>
              <sup className="ml-3 align-super font-mono text-sm font-medium tracking-normal" style={{ color: "var(--action-primary)" }}>± 0.005 mm</sup>
            </motion.h1>

            <motion.p
              className="mt-7 max-w-2xl text-base leading-8 md:text-lg"
              style={{ color: "var(--text-secondary)" }}
              initial={itemInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: delay + 0.22 }}
            >
              MAS Technic, İzmir Atatürk Organize'de 5 eksen CNC işleme, CMM doğrulama ve yüzey proseslerini tek bir ölçüm defterinden yönetir. Her parçanın spindle saati, tolerans bandı ve QC imzası kayıt altında.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={itemInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: delay + 0.3 }}
            >
              <Link
                to="/teklif-al"
                onMouseEnter={() => soundEngine.play("tick")}
                onClick={() => soundEngine.play("click")}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] transition-transform active:scale-[0.98]"
                style={{ background: "var(--action-primary)", color: "var(--action-primary-ink)" }}
              >
                48 saatte teklif al <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#hizmetler"
                onMouseEnter={() => soundEngine.play("tick")}
                onClick={() => soundEngine.play("click")}
                className="inline-flex items-center justify-center border px-6 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-white/5"
                style={{ borderColor: "var(--rule-strong)", color: "var(--text-primary)" }}
              >
                Traveler örneği gör
              </a>
            </motion.div>

            <HeroCadDropzone />
          </div>

          <LiveLedgerCard />
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
