import { forwardRef, useRef, useEffect, useCallback, useState, type ForwardedRef } from "react";
import { AmbientGlowOverlay } from "@/components/ui/AmbientGlowOverlay";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useImagePreloader } from "@/hooks/use-image-preloader";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CrosshairOverlay } from "@/components/ui/CrosshairOverlay";
import { HUDOverlay } from "@/components/ui/HUDOverlay";
import { TextScramble } from "@/components/ui/TextScramble";

const TOTAL_FRAMES = 120;
const FALLBACK_TIMEOUT = 5000;

const stories = [
  { range: [0, 0.22], text: "Ham malzeme.\nSonsuz olasılık.", align: "center" as const, size: "text-4xl md:text-6xl lg:text-7xl" },
  { range: [0.18, 0.42], text: "±0.005mm tolerans.", align: "left" as const, size: "text-2xl md:text-4xl", mono: true },
  { range: [0.38, 0.62], text: "Ti-6Al-4V. AS9100D.", align: "right" as const, size: "text-2xl md:text-4xl", mono: true },
  { range: [0.58, 0.82], text: "Prototipten\n50.000 adete.", align: "left" as const, size: "text-3xl md:text-5xl" },
];

const hudData = [
  { label: "MİL DEVR", value: "12.000", unit: "RPM" },
  { label: "İLERLEME", value: "2.400", unit: "mm/dk" },
  { label: "TOLERANS", value: "±0.005", unit: "mm" },
  { label: "EKS", value: "5", unit: "axis" },
];

const setRefs = <T,>(node: T | null, localRef: { current: T | null }, forwardedRef: ForwardedRef<T>) => {
  localRef.current = node;
  if (typeof forwardedRef === "function") forwardedRef(node);
  else if (forwardedRef) forwardedRef.current = node;
};

export const CNCScrollStory = forwardRef<HTMLDivElement>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);
  const isMobile = useIsMobile();
  const prefersReduced = usePrefersReducedMotion();
  const [showFallback, setShowFallback] = useState(false);

  const { images, ready, loadedCount } = useImagePreloader({
    basePath: "/sequence-cnc",
    totalFrames: TOTAL_FRAMES,
    eagerCount: 10,
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

  const story0Opacity = useTransform(scrollYProgress, [stories[0].range[0], stories[0].range[0] + 0.04, stories[0].range[1] - 0.04, stories[0].range[1]], [0, 1, 1, 0]);
  const story1Opacity = useTransform(scrollYProgress, [stories[1].range[0], stories[1].range[0] + 0.04, stories[1].range[1] - 0.04, stories[1].range[1]], [0, 1, 1, 0]);
  const story2Opacity = useTransform(scrollYProgress, [stories[2].range[0], stories[2].range[0] + 0.04, stories[2].range[1] - 0.04, stories[2].range[1]], [0, 1, 1, 0]);
  const story3Opacity = useTransform(scrollYProgress, [stories[3].range[0], stories[3].range[0] + 0.04, stories[3].range[1] - 0.04, stories[3].range[1]], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.90], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.85, 0.92], [30, 0]);
  const hudOpacity = useTransform(scrollYProgress, [0.05, 0.12, 0.82, 0.88], [0, 1, 1, 0]);
  const crosshairOpacity = useTransform(scrollYProgress, [0.15, 0.22, 0.75, 0.82], [0, 0.6, 0.6, 0]);

  const exitOpacity = useTransform(scrollYProgress, [0.88, 1], prefersReduced ? [1, 1] : [1, 0.15]);
  const exitScale = useTransform(scrollYProgress, [0.88, 1], prefersReduced ? [1, 1] : [1, 0.88]);

  const storyOpacities = [story0Opacity, story1Opacity, story2Opacity, story3Opacity];

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
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
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
            src="/sequence-cnc/frame_0001.webp"
            alt="CNC İşleme"
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
          />
        </motion.div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          <span
            className="text-xs uppercase tracking-[0.3em] mb-4 block"
            style={{ color: "hsl(var(--primary))", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {"CNC İşleme Süreci"}
          </span>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            {"Ham Metalden Hassas Parçaya"}
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            {"Alüminyum billet'ten nihai havacılık parçasına dönüşüm sürecini keşfedin."}
          </p>
          <Link
            to="/teklif-al"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            style={{ backgroundColor: "var(--heat-molten)", color: "var(--text-primary)" }}
          >
            <span>{"Teklif Al"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  /* ── Desktop: scroll-driven canvas ── */
  return (
    <div ref={(node) => setRefs(node, containerRef, ref)} className="relative" style={{ height: "350vh", backgroundColor: "var(--bg-precision-deep)" }}>
      <motion.div className="sticky top-0 h-screen overflow-hidden" style={{ opacity: exitOpacity, scale: exitScale, transformOrigin: "center center" }}>
        <AmbientGlowOverlay />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: "var(--bg-precision-deep)" }}
          aria-label="CNC işleme süreci animasyonu"
          role="img"
        />

        {showFallback && !ready && (
          <img
            src="/sequence-cnc/frame_0001.webp"
            alt="CNC İşleme"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}

        {/* Scanline texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, var(--surface-scanline) 0px, var(--surface-scanline) 1px, transparent 1px, transparent 3px)`,
            mixBlendMode: "screen",
            opacity: 0.5,
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "var(--overlay-dark-mid)" }} />

        {/* Crosshair overlay */}
        {!prefersReduced && <CrosshairOverlay opacity={crosshairOpacity} />}

        {/* HUD data readout */}
        {!prefersReduced && (
          <HUDOverlay
            data={hudData}
            opacity={hudOpacity}
            position="top-left"
          />
        )}

        {/* Phase label */}
        <motion.div
          className="absolute top-6 right-6 font-mono text-[9px] tracking-[0.3em] uppercase pointer-events-none z-10"
          style={{ color: "var(--text-vignette)", opacity: hudOpacity }}
        >
          FAZE 03 — CNC İŞLEME
        </motion.div>

        {/* Loading state */}
        {!ready && !showFallback && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ backgroundColor: "var(--bg-precision-deep)" }}>
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: "var(--heat-molten)" }} />
            <span className="text-sm font-mono" style={{ color: "var(--heat-molten)" }}>
              {`%${Math.round((loadedCount / TOTAL_FRAMES) * 100)} yükleniyor...`}
            </span>
          </div>
        )}

        {/* Story overlays */}
        <div className="absolute inset-0 z-10">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              className={`absolute inset-0 flex items-center ${
                story.align === "center" ? "justify-center text-center" :
                story.align === "left" ? "justify-start text-left" :
                "justify-end text-right"
              }`}
              style={{ opacity: prefersReduced ? 1 : storyOpacities[i] }}
            >
              <div className={`max-w-5xl mx-auto px-6 lg:px-12 w-full ${story.align === "right" ? "flex justify-end" : ""}`}>
                {story.mono ? (
                  <TextScramble
                    text={story.text}
                    speed={30}
                    trigger="immediate"
                    once={false}
                    className={`${story.size} font-bold tracking-tight block`}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      textShadow: `0 2px 20px var(--overlay-dark-mid)`,
                      color: "var(--text-primary)",
                    }}
                  />
                ) : (
                  <h2
                    className={`${story.size} font-bold whitespace-pre-line tracking-tight`}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      textShadow: `0 2px 20px var(--overlay-dark-mid)`,
                      color: "var(--text-primary)",
                    }}
                  >
                    {story.text}
                  </h2>
                )}
              </div>
            </motion.div>
          ))}

          {/* CTA at end */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: ctaOpacity, y: ctaY }}
          >
            <Link
              to="/teklif-al"
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "var(--heat-molten)", color: "var(--text-primary)" }}
            >
              <span>{"Teklif Al"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

CNCScrollStory.displayName = "CNCScrollStory";
