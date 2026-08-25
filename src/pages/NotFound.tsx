import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search, FileQuestion, HelpCircle } from "lucide-react";

export const NotFound = () => {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ribbon canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const ribbons: {
      x: number; y: number; w: number; h: number;
      speed: number; angle: number; opacity: number; hue: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create ribbons
    for (let i = 0; i < 6; i++) {
      ribbons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: 150 + Math.random() * 250,
        h: 1 + Math.random() * 2,
        speed: 0.15 + Math.random() * 0.3,
        angle: -20 + Math.random() * 40,
        opacity: 0.03 + Math.random() * 0.06,
        hue: 190 + Math.random() * 20,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ribbons.forEach((r) => {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate((r.angle * Math.PI) / 180);
        ctx.fillStyle = `hsla(${r.hue}, 80%, 45%, ${r.opacity})`; // OK: dynamic hue — runtime hesaplamalı
        ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);

        // Glow
        ctx.shadowColor = `hsla(${r.hue}, 80%, 50%, ${r.opacity * 2})`; // OK: dynamic hue
        ctx.shadowBlur = 30;
        ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
        ctx.restore();

        r.y += r.speed;
        r.x += Math.sin(r.y * 0.005) * 0.3;
        if (r.y > canvas.height + 50) {
          r.y = -50;
          r.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        fontFamily: "'Exo 2', system-ui, sans-serif",
        background: "hsl(var(--background))",
      }}
    >
      {/* Canvas ribbons */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[1]" />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.07) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scanlines */}
      <div
        className="fixed inset-0 z-[3] pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgb(var(--surface-base-rgb) / 0.03) 2px, rgb(var(--surface-base-rgb) / 0.03) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 z-[4] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgb(var(--surface-base-rgb) / 0.6) 100%)",
        }}
      />

      {/* Logo top-left */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="fixed top-8 left-8 z-10"
      >
        <Link
          to="/"
          className="text-sm font-extrabold tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground/100 transition-opacity no-underline"
        >
          MAS<span className="text-primary">TECHNIC</span>
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative select-none leading-[0.85]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(8rem, 18vw, 16rem)",
            fontWeight: 500,
            letterSpacing: "-0.04em",
            color: "transparent",
            background: "linear-gradient(180deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.04) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextStroke: "1.5px hsl(var(--primary) / 0.35)",
          }}
        >
          404
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 80 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-px my-6"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
          }}
        />

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted-foreground font-light uppercase tracking-[0.06em] max-w-[500px]"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.35rem)" }}
        >
          Aradığınız sayfa <strong className="text-primary font-semibold">bulunamadı</strong>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted-foreground/50 text-sm font-light tracking-wider mt-2"
        >
          Bu koordinatlarda işlenecek parça yok.
        </motion.p>

        {/* Quick Links Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full max-w-lg"
        >
          {[
            { label: "Ana Sayfa", to: "/", icon: Home },
            { label: "Hizmetlerimiz", to: "/#hizmetler", icon: Search },
            { label: "Teklif Al", to: "/teklif-al", icon: FileQuestion },
            { label: "SSS", to: "/sss", icon: HelpCircle },
          ].map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.08 }}
            >
              <Link
                to={link.to}
                className="flex flex-col items-center gap-2.5 p-4 rounded-lg border border-border/20 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
              >
                <link.icon
                  size={18}
                  className="text-muted-foreground/60 group-hover:text-primary group-hover:scale-110 transition-all duration-300"
                />
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 group-hover:text-foreground transition-colors">
                  {link.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-4 mt-8 flex-col sm:flex-row w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-[0.12em] no-underline transition-all duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 30px hsl(var(--primary) / 0.2)" }}
          >
            <ArrowLeft size={14} />
            Ana Sayfa
          </Link>
          <Link
            to="/iletisim"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary/10 text-primary border border-primary/30 font-semibold text-xs uppercase tracking-[0.12em] no-underline transition-all duration-300 hover:text-primary-foreground hover:bg-primary hover:-translate-y-0.5"
          >
            İletişim
          </Link>
        </motion.div>
      </div>

      {/* Coords bottom-right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.3, y: 0 }}
        transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-8 right-8 z-10 text-right hidden sm:block"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.65rem",
          color: "hsl(var(--muted-foreground))",
          lineHeight: 1.8,
          letterSpacing: "0.05em",
        }}
      >
        <div>ERR::PAGE_NOT_FOUND</div>
        <div>
          STATUS: 404 · REDIRECT: {countdown}s
        </div>
      </motion.div>
    </div>
  );
};
