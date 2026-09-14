import { useRef, useEffect, useCallback, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { useImagePreloader } from "@/hooks/use-image-preloader";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 07 CORRECTION #1 — A1. CONTRAST OVER AN 80-FRAME CANVAS.

   Every text run in here sat over a moving photograph with a 0.25 vignette and
   nothing else, so its contrast was whatever the current frame happened to be.
   Measured from rendered pixels (background sampled with every text colour
   forced transparent, over the runs' own `Range` line boxes; foreground
   composited per pixel through the ancestor opacity chain; contrast reported
   as the MEDIAN over the sampled pixels, because a single modal colour is
   meaningless against a photograph):

     /malzemeler @ 375   "Malzeme Dönüşümü"   12px   1.745   (need 4.5)
                         4 × 10px property labels    3.769-4.053
     /malzemeler @ 1280  "Malzeme Dönüşümü"   12px   2.363
                         "Yüzey Mükemmelliği" 60px   2.108   (need 3)
                         4 × 10px card labels        2.020-2.717
                         4 × 10px card values        4.113-4.118

   Three causes, three repairs — none of them "make the text bigger":

   1. THE EYEBROW WAS THE TEAL `--primary` (rgb 10,125,138), which is a
      DARK accent, on a DARK ground. It cannot pass there at any size. It is
      now `--text-primary`, which also removes the last low-contrast teal on
      this route — the same class of repair as B24 on the service pages.
   2. THE TITLE OVERLAY HAD NO SCRIM. A 0.25 vignette does not control a
      background that runs from dark oxide to bright polished metal across 80
      frames. The title block now sits on its own gradient scrim, so the ground
      under the two largest runs is bounded regardless of frame.
   3. THE FLOATING CARD WAS GLASS. `rgba(0,0,0,.8)` + `backdrop-blur-md` over
      blown-out metal measured rgb(88,89,88) — nowhere near the near-black the
      0.8 alpha implies. It is a solid `--bg-dark-obsidian` now, and the
      backdrop-filter goes with it: `IMPLEMENTATION.md` §5.5 names
      blur-behind glass as generic-SaaS residue, and Phase 04 had already
      removed it from the footer for that reason.

   The 10px labels move from `--text-technical` (0.50 alpha) to
   `--text-secondary` (0.70). Hierarchy is kept — label secondary, value
   primary — it is the ALPHA that was doing work the ground could not support.
   ══════════════════════════════════════════════════════════════════════════ */

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

  /* PHASE 07 CORRECTION #1 — A7. REDUCED MOTION MUST NOT COST CONTENT.
     `titleOpacity`, `cardOpacity` and `cardX` were scroll-driven for EVERY
     reader, including one who has asked for reduced motion. At rest that means
     `scrollYProgress = 0`, so the whole title overlay and the whole property
     card sit at `opacity: 0` — measured by
     `scripts/motion-audit.mjs --mode=rest` on `/malzemeler` at 1280:
     `hidden=39, hiddenText=12`, the entire card and title.

     `exitOpacity` and `exitScale` two lines down were already gated this way,
     so this is the file's own established pattern rather than a new one; the
     three that carry CONTENT were simply the ones nobody had gated. Under
     reduced motion they are now constant 1 (and 0 travel), which is the
     "instant state" `CLAUDE.md` requires, not a disabled feature: with motion
     allowed the choreography is untouched, and `--mode=enabled` is the
     counter-proof that it still runs. */
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);
  const cardOpacity = useTransform(
    scrollYProgress,
    [0.25, 0.32, 0.82, 0.88],
    prefersReduced ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );
  const cardX = useTransform(scrollYProgress, [0.25, 0.35], prefersReduced ? [0, 0] : [60, 0]);
  const ringProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const circumference = 2 * Math.PI * 45;
  const ringOffset = useTransform(ringProgress, (v: number) => circumference * (1 - v));
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.25, 0.32],
    prefersReduced ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );
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
            alt="Malzeme Dönüşümü" width="1280" height="720"
            className="w-full h-full object-cover opacity-30"
            loading="lazy" decoding="async"
          />
        </motion.div>
        {/* A1: the mobile still had no scrim either — the same gradient, so
            both breakpoints bound the ground the same way. */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--overlay-vignette-heavy) 18%, "
              + "var(--overlay-vignette-heavy) 82%, transparent 100%)",
          }}
        />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
          <span
            className="text-xs uppercase tracking-[0.3em] mb-4 block"
            style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Mono', monospace" }}
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
                <span className="text-[10px] font-mono uppercase tracking-wider block mb-1" style={{ color: "var(--text-secondary)" }}>{prop.label}</span>
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
            alt="Malzeme Dönüşümü" width="1280" height="720"
            className="absolute inset-0 w-full h-full object-cover opacity-40" loading="lazy" decoding="async"
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
          {/* A1: the scrim. Without it the ground under the 60px title ran to
              rgb(187,188,189) on the bright frames and the title measured
              2.108:1 against a 3:1 requirement. */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[52%]"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, var(--overlay-vignette-heavy) 22%, "
                + "var(--overlay-vignette-heavy) 78%, transparent 100%)",
            }}
          />
          <div className="relative text-center max-w-4xl mx-auto px-6">
            <span
              className="text-xs uppercase tracking-[0.3em] mb-4 block"
              style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Mono', monospace" }}
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
            className="p-6 border"
            style={{
              backgroundColor: "var(--bg-dark-obsidian)",
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
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono block" style={{ color: "var(--text-secondary)" }}>
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
                    <span className="font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{prop.label}</span>
                    <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{prop.value}/{prop.max}</span>
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
