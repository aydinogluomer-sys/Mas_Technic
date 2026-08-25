import { useEffect, useRef, useCallback, useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getCSSVar } from "@/utils/cssVar";

interface SparkParticlesProps {
  count?: number;
  colors?: string[];
  speed?: number;
  /** "up" embers or "radial" explosion */
  direction?: "up" | "radial";
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  glow: number;
}

export const SparkParticles = ({
  // Mobil TBT bütçesi (~2 s) dar; 40 yerine ölçülü bir kıvılcım yoğunluğu.
  count = 22,
  colors,
  speed = 1,
  direction = "up",
  className = "",
}: SparkParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const reduced = usePrefersReducedMotion();

  // Heat palette token'larından runtime'da renk havuzu (canvas 2D ctx token literal kabul eder)
  const palette = useMemo(
    () =>
      colors ?? [
        getCSSVar("--heat-ember", "#ff6a00"),
        getCSSVar("--heat-peak", "#e25822"),
        getCSSVar("--heat-amber", "#d4820a"),
        getCSSVar("--heat-molten", "#e8610a"),
      ],
    [colors],
  );

  const createParticle = useCallback(
    (w: number, h: number): Particle => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      if (direction === "up") {
        return {
          x: Math.random() * w,
          y: h + Math.random() * 20,
          vx: (Math.random() - 0.5) * 0.8 * speed,
          vy: -(1 + Math.random() * 2) * speed,
          size: 1 + Math.random() * 2.5,
          life: 0,
          maxLife: 60 + Math.random() * 120,
          color,
          glow: 4 + Math.random() * 8,
        };
      }
      // radial
      const angle = Math.random() * Math.PI * 2;
      const vel = (0.5 + Math.random() * 2) * speed;
      return {
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        size: 1 + Math.random() * 3,
        life: 0,
        maxLife: 40 + Math.random() * 80,
        color,
        glow: 6 + Math.random() * 10,
      };
    },
    [palette, direction, speed],
  );

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      // Transform sıfırlanmadan scale çağrılırsa ResizeObserver her tetiklendiğinde
      // ölçek katlanıyordu (dpr, dpr², dpr³ …) ve parçacıklar dev gibi çiziliyordu.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Init particles
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    particlesRef.current = Array.from({ length: count }, () => {
      const p = createParticle(w, h);
      p.life = Math.random() * p.maxLife; // stagger start
      return p;
    });

    const animate = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);

      particlesRef.current.forEach((p) => {
        p.life++;
        if (p.life > p.maxLife) {
          Object.assign(p, createParticle(cw, ch));
          p.life = 0;
        }

        p.x += p.vx;
        p.y += p.vy;
        // slight wind wobble
        p.vx += (Math.random() - 0.5) * 0.05;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.1
          ? progress / 0.1
          : progress > 0.7
            ? 1 - (progress - 0.7) / 0.3
            : 1;

        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        // shadowBlur çizim başına blur maliyeti; mobil TBT bütçesi dar olduğu
        // için parlaklık korunup yarıçap kısıldı.
        ctx.shadowBlur = p.glow * 0.55;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (running) rafRef.current = requestAnimationFrame(animate);
    };

    // ── Çalışma kapısı ──
    // Orijinal sürüm rAF döngüsünü mount olur olmaz başlatıp hiç durdurmuyordu;
    // ekran dışındayken ve sahne pasifken de CPU yakıyordu. İki sinyal:
    //   • görünürlük (IntersectionObserver)
    //   • sahnenin aktifliği ([data-process-media][data-active])
    // İkisi birden doğruyken çalışır, aksi halde döngü tamamen iptal edilir.
    let running = false;
    let visible = false;
    const host = canvas.closest<HTMLElement>("[data-process-media]");

    const isActive = () => !host || host.hasAttribute("data-active");
    const sync = () => {
      const shouldRun = visible && isActive();
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) {
        resize();
        rafRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(rafRef.current);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(canvas);

    const activeObserver = host
      ? new MutationObserver(sync)
      : null;
    activeObserver?.observe(host!, { attributes: true, attributeFilter: ["data-active"] });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      activeObserver?.disconnect();
      ro.disconnect();
    };
  }, [reduced, count, createParticle]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
