import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import cncVideo from "@/assets/cnc-sequence-scroll.mp4";
import cncPoster from "@/assets/cnc-start-frame.jpg";
import { Settings, Target, Layers, Zap } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { TextScramble } from "@/components/ui/TextScramble";

const features = [
  {
    icon: Target,
    title: "Mikron Hassasiyet",
    desc: "±0.005mm tolerans ile üretim kapasitesi.",
  },
  {
    icon: Settings,
    title: "Çok Eksenli İşleme",
    desc: "5 eksenli CNC ile karmaşık geometriler.",
  },
  {
    icon: Layers,
    title: "Geniş Malzeme Yelpazesi",
    desc: "Alüminyum, paslanmaz çelik, titanyum ve daha fazlası...",
  },
  {
    icon: Zap,
    title: "Hızlı Teslimat",
    desc: "Prototipten seriye optimum üretim süreleri.",
  },
];

export const VideoScrollSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      const unsubscribe = scrollYProgress.on("change", (progress) => {
        if (video.duration && isFinite(video.duration)) {
          video.currentTime = progress * video.duration;
        }
      });
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;

    if (video.readyState >= 1) {
      unsubscribe = handleMetadata();
    } else {
      const onLoaded = () => {
        unsubscribe = handleMetadata();
      };
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      return () => video.removeEventListener("loadedmetadata", onLoaded);
    }

    return () => unsubscribe?.();
  }, [scrollYProgress]);

  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.85, 1], [1, 1, 1, 0]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.01], [1, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.01], [1, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.01], [0, 0]);
  const descOpacity = useTransform(scrollYProgress, [0, 0.02], [1, 1]);
  const cardsOpacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);
  const cardsY = useTransform(scrollYProgress, [0, 0.03], [30, 0]);
  const exitOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);

  // Blueprint grid opacity
  const gridOpacity = useTransform(scrollYProgress, [0, 0.05, 0.8, 0.9], [0, 0.08, 0.08, 0]);

  return (
    <div
      ref={containerRef}
      className="relative h-[300vh]"
      style={{ background: "var(--bg-precision-deep)" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Video */}
        <motion.div className="absolute inset-0" style={{ opacity }}>
          <video
            ref={videoRef}
            src={cncVideo}
            poster={cncPoster}
            muted
            playsInline
            preload="none"
            className="w-full h-full object-cover hidden md:block"
            style={{ background: `url(${cncPoster}) center/cover no-repeat` }}
          />
          <img src={cncPoster} alt="CNC Hassas İşleme" className="w-full h-full object-cover md:hidden" loading="lazy" />
        </motion.div>

        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "var(--overlay-dark-heavy)" }} />

        {/* Blueprint grid overlay */}
        {!prefersReduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: gridOpacity,
              backgroundImage: `
                linear-gradient(var(--precision-grid) 1px, transparent 1px),
                linear-gradient(90deg, var(--precision-grid) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8">
          <motion.span
            className="text-xs uppercase tracking-[0.3em] mb-6 block"
            style={{
              color: "hsl(var(--primary))",
              fontFamily: "'IBM Plex Mono', monospace",
              opacity: labelOpacity,
            }}
          >
            <TextScramble text="MÜHENDİSLİK & ÜRETİM" speed={35} trigger="inView" />
          </motion.span>

          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-4"
            style={{ lineHeight: 1, opacity: titleOpacity, y: titleY, color: "var(--text-primary)" }}
          >
            Hassas İşleme
          </motion.h2>

          <motion.p
            className="text-base md:text-lg max-w-xl mb-12"
            style={{ color: "var(--text-secondary)", opacity: descOpacity }}
          >
            Gelişmiş çok eksenli CNC tezgâhlarımızla mikron düzeyinde hassasiyetle en karmaşık parça geometrilerini
            üretiyoruz.
          </motion.p>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            style={{ opacity: cardsOpacity, y: cardsY }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group p-4 md:p-5 transition-all duration-300"
                style={{
                  border: `1px solid var(--surface-border)`,
                  background: "var(--surface-glass)",
                  backdropFilter: "blur(8px)",
                  transformStyle: "preserve-3d",
                }}
                whileHover={prefersReduced ? {} : {
                  rotateX: -3,
                  rotateY: 3,
                  scale: 1.02,
                  boxShadow: `0 10px 40px var(--precision-hover-shadow)`,
                  borderColor: "var(--precision-hover-border)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <f.icon className="w-6 h-6 mb-3 transition-transform duration-300 group-hover:scale-110" style={{ color: "hsl(var(--primary))" }} strokeWidth={1.5} />
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Phase label */}
        <div
          className="absolute top-6 right-6 font-mono text-[9px] tracking-[0.3em] uppercase pointer-events-none z-10"
          style={{ color: "var(--text-vignette)" }}
        >
          FAZE 04 — HASSAS İŞLEME
        </div>

        {/* Exit transition overlay */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            opacity: exitOpacity,
            background: "var(--bg-precision-deep)",
          }}
        />
      </div>
    </div>
  );
};
