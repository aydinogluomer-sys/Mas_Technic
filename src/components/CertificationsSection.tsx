import { Shield, Plane, Car, HeartPulse, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const certifications = [
  {
    name: "ISO 9001:2015",
    description: "Kalite Yönetim Sistemi",
    icon: Shield,
  },
  {
    name: "AS9100D",
    description: "Havacılık Kalite Standardı",
    icon: Plane,
  },
  {
    name: "IATF 16949",
    description: "Otomotiv Kalite Standardı",
    icon: Car,
  },
  {
    name: "ISO 13485",
    description: "Medikal Cihaz Kalitesi",
    icon: HeartPulse,
  },
  {
    name: "NIST 800-171",
    description: "Siber Güvenlik Uyumu",
    icon: Lock,
  },
];

const VENETIAN_STRIPS = 6;

export const CertificationsSection = () => {
  const prefersReduced = usePrefersReducedMotion();

  const marqueeContent = (
    <div className="cert-marquee-track flex whitespace-nowrap">
      {[...certifications, ...certifications].map((cert, i) => (
        <div key={i} className="inline-flex items-center gap-4 mx-8 md:mx-12 cursor-default group">
          <div
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[rgb(var(--text-primary-rgb)/0.1)]"
            style={{
              border: "1px solid var(--surface-border)",
              backgroundColor: "var(--surface-glass)",
            }}
          >
            <cert.icon
              className="w-5 h-5 md:w-6 md:h-6 transition-colors duration-300"
              style={{ color: "hsl(var(--forge-silver) / 0.6)" }}
              strokeWidth={1.5}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-lg md:text-xl font-bold uppercase tracking-[0.1em] opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: "hsl(var(--forge-silver))",
              }}
            >
              {cert.name}
            </span>
            <span
              className="text-[10px] md:text-xs uppercase tracking-[0.15em]"
              style={{ color: "hsl(var(--forge-silver) / 0.4)" }}
            >
              {cert.description}
            </span>
          </div>
          <span
            className="w-1.5 h-1.5 rounded-full ml-4 md:ml-8 shrink-0"
            style={{ backgroundColor: "hsl(var(--forge-molten) / 0.4)" }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="sertifikalar"
      className="section-industrial min-h-[100dvh] flex flex-col justify-center border-y border-border relative"
      style={{ backgroundColor: "var(--bg-dark-obsidian)" }}
    >
      <style>{`
        /* .dark #sertifikalar { background-color: hsl(var(--forge-iron)) !important; } */
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .cert-marquee-track {
          animation: marquee 30s linear infinite;
        }
        .cert-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--surface-glass) 0%, transparent 50%, var(--surface-glass) 100%)",
        }}
      />

      {/* Venetian blind reveal: colored strips that slide away to reveal marquee */}
      <div className="relative">
        {marqueeContent}
        {Array.from({ length: VENETIAN_STRIPS }).map((_, idx) => (
          <motion.div
            key={idx}
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{
              top: `${(idx / VENETIAN_STRIPS) * 100}%`,
              height: `${100 / VENETIAN_STRIPS}%`,
              backgroundColor: "var(--bg-dark-obsidian)",
              willChange: "clip-path",
            }}
            initial={prefersReduced ? { clipPath: "inset(0 0 100% 0)" } : { clipPath: "inset(0 0 0% 0)" }}
            whileInView={{ clipPath: "inset(0 0 100% 0)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              delay: idx * 0.08,
              ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
            }}
          />
        ))}
      </div>
    </section>
  );
};
