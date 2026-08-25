import { useRef, useEffect, useCallback, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useImagePreloader } from "@/hooks/use-image-preloader";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const TOTAL_FRAMES = 80;
const FALLBACK_TIMEOUT = 5000;

const materialProps = [
  { label: "İşlenebilirlik", value: 4, max: 5 },
  { label: "Korozyon Direnci", value: 5, max: 5 },
  { label: "Mukavemet", value: 4, max: 5 },
  { label: "Termal Dayanım", value: 3, max: 5 },
];

export const MaterialMorphScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);
  const isMobile = useIsMobile();
  const prefersReduced = usePrefersReducedMotion();
  const [showFallback, setShowFallback] = useState(false);

  const { images, ready, loadedCount } = useImagePreloader({
    basePath: "/sequence-material",
    totalFrames: TOTAL_FRAMES,
    eagerCount: 8,
  });

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => {
      if (!ready) setShowFallback(true);
    }, FALLBACK_TIMEOUT);
    return () => clearTimeout(timer);
  }, [ready]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);
  const cardOpacity = useTransform(scrollYProgress, [0.25, 0.32, 0.82, 0.88], [0, 1, 1, 0]);
  const cardX = useTransform(scrollYProgress, [0.25, 0.35], [60, 0]);
  const ringProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const circumference = 2 * Math.PI * 45;
  const ringOffset = useTransform(ringProgress, (v: number) => circumference * (1 - v));
  const titleOpacity = useTransform(scrollYProgress, [0, 0.05, 0.25, 0.32], [0, 1, 1, 0]);
  const exitOpacity = useTransform(scrollYProgress, [0.85, 1], prefersReduced ? [1, 1] : [1, 0.15]);
  const exitScale = useTransform(scrollYProgress, [0.85, 1], prefersReduced ? [1, 1] : [1, 0.88]);

  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const clamped = Math.min(Math.max(Math.round(index), 0), TOTAL_FRAMES - 1);
      if (clamped === currentFrameRef.current) return;
      currentFrameRef.current = clamped;

      const img = images.current[clamped];
      if (!img || !img.complete) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, w, h);

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = w / h;
      let sw: number, sh: number, sx: number, sy: number;

      if (imgRatio > canvasRatio) {
        sh = img.naturalHeight;
        sw = sh * canvasRatio;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        sw = img.naturalWidth;
        sh = sw / canvasRatio;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    },
    [images]
  );

  useMotionValueEvent(frameIndex, "change", (v) => {
    if (!prefersReduced) drawFrame(v);
  });

  useEffect(() => {
    if (ready) drawFrame(0);
  }, [ready, drawFrame]);

  /* ── Mobile fallback ── */
  if (isMobile) {
    return (
      <section
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--bg-precision-deep)" }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img
            src="/sequence-material/frame_0001.webp"
            alt="Malzeme Dönüşümü"
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
          />
        </motion.div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
          <span
            className="text-xs uppercase tracking-[0.3em] mb-4 block"
            style={{ color: "hsl(var(--primary))", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {"Malzeme Dönüşümü"}
          </span>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            {"Yüzey Mükemmelliği"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            {"Ham titanyumdan cilalı anodize yüzeye dönüşüm."}
          </p>

          {/* Mobile material properties — mediator: mat-silver bars */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {materialProps.map((prop) => (
              <div key={prop.label} className="text-left p-3" style={{ backgroundColor: "var(--surface-glass)", border: `1px solid var(--surface-border)` }}>
                <span className="text-[10px] font-mono uppercase tracking-wider block mb-1" style={{ color: "var(--text-technical)" }}>{prop.label}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: prop.max }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full"
                      style={{
                        backgroundColor: i < prop.value ? "var(--heat-molten)" : "var(--surface-border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const burnInitial = prefersReduced ? { filter: "brightness(1)" } : { filter: "brightness(0)" };
  const burnAnimate = { filter: "brightness(1)" };

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      style={{ height: "300vh", backgroundColor: "var(--bg-precision-deep)" }}
      initial={burnInitial}
      whileInView={burnAnimate}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.0, ease: "easeIn" }}
    >
      <motion.div className="sticky top-0 h-screen overflow-hidden" style={{ opacity: exitOpacity, scale: exitScale, transformOrigin: "center center" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: "var(--bg-precision-deep)" }}
          aria-label="Malzeme dönüşüm animasyonu"
          role="img"
        />

        {showFallback && !ready && (
          <img
            src="/sequence-material/frame_0001.webp"
            alt="Malzeme Dönüşümü"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}

        <div className="absolute inset-0" style={{ background: "var(--overlay-vignette-light)" }} />

        {/* Loading state */}
        {!ready && !showFallback && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ backgroundColor: "var(--bg-precision-deep)" }}>
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: "var(--heat-molten)" }} />
            <span className="text-sm font-mono" style={{ color: "var(--heat-molten)" }}>
              {`%${Math.round((loadedCount / TOTAL_FRAMES) * 100)} yükleniyor...`}
            </span>
          </div>
        )}

        {/* Title overlay */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ opacity: titleOpacity }}
        >
          <div className="text-center max-w-4xl mx-auto px-6">
            <span
              className="text-xs uppercase tracking-[0.3em] mb-4 block"
              style={{ color: "hsl(var(--primary))", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {"Malzeme Dönüşümü"}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {"Yüzey Mükemmelliği"}
            </h2>
          </div>
        </motion.div>

        {/* Floating material properties card — mediator rule: mat-silver ring + precision-indigo */}
        <motion.div
          className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-10 w-72"
          style={{ opacity: cardOpacity, x: cardX }}
        >
          <div
            className="p-6 border backdrop-blur-md"
            style={{
              backgroundColor: "var(--overlay-dark)",
              borderColor: "var(--surface-border)",
            }}
          >
            <div className="flex items-center gap-4 mb-5">
              <svg width="56" height="56" viewBox="0 0 100 100" className="shrink-0 -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-border)" strokeWidth="4" />
                <motion.circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="var(--precision-indigo)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset: ringOffset }}
                />
              </svg>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono block" style={{ color: "var(--text-technical)" }}>
                  {"Dönüşüm"}
                </span>
                <span className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                  {"Ti-6Al-4V"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {materialProps.map((prop) => (
                <div key={prop.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-mono uppercase tracking-wider" style={{ color: "var(--text-technical)" }}>{prop.label}</span>
                    <span className="font-mono font-bold" style={{ color: "var(--text-secondary)" }}>{prop.value}/{prop.max}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(prop.value / prop.max) * 100}%`,
                        background: `linear-gradient(90deg, var(--heat-molten), var(--mat-silver), var(--precision-indigo))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
