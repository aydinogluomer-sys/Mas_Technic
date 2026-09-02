import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface PageLoaderProps {
  isFirstVisit: boolean;
}

export const PageLoader = ({ isFirstVisit }: PageLoaderProps) => {
  const prefersReduced = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(isFirstVisit && !prefersReduced);
  const [done, setDone] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Lock scroll while loader is visible
  useEffect(() => {
    if (!isVisible) return;

    document.body.style.overflow = "hidden";
    window.__lenis?.stop();

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // Unlock scroll + refresh triggers when loader hides
  useEffect(() => {
    if (isVisible) return;
    if (!isFirstVisit || prefersReduced) return;

    // Loader just closed — release scroll after a short buffer
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        lenis.start();
      }
      ScrollTrigger.refresh();
    }, 60);

    return () => clearTimeout(timer);
  }, [isVisible, isFirstVisit, prefersReduced]);

  useEffect(() => {
    if (!isFirstVisit || prefersReduced) return;

    const start = Date.now();
    // The loader is a brand accent, never a gate in front of the LCP element.
    // Keep the complete first-visit sequence below one second.
    const minDuration = 420;
    let animId: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / minDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (counterRef.current) {
        counterRef.current.textContent = Math.floor(eased * 100).toString().padStart(3, "0");
      }

      if (barRef.current) {
        barRef.current.style.width = `${eased * 100}%`;
      }

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        if (counterRef.current) counterRef.current.textContent = "100";
        setDone(true);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isFirstVisit, prefersReduced]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => setIsVisible(false), 220);
      return () => clearTimeout(timer);
    }
  }, [done]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "hsl(var(--forge-obsidian))" }}
          animate={
            done
              ? { clipPath: "circle(150% at 50% 50%)" }
              : { clipPath: "circle(100% at 50% 50%)" }
          }
          exit={{
            clipPath: "circle(0% at 50% 50%)",
            transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(var(--text-primary-rgb) / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--text-primary-rgb) / 0.04) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative flex flex-col items-center">
            {/* Brand */}
            <motion.span
              className="text-[10px] uppercase tracking-[0.4em] font-mono mb-6" style={{ color: "var(--text-hint)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              MAS TECHNIC
            </motion.span>

            {/* Big monospace counter — 3 digits */}
            <span
              ref={counterRef}
              className="font-mono font-bold select-none"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(4rem, 15vw, 10rem)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              000
            </span>

            {/* Progress bar */}
            <div
              className="mt-6 h-px overflow-hidden"
              style={{ width: 200, backgroundColor: "rgb(var(--text-primary-rgb) / 0.1)" }}
            >
              <div
                ref={barRef}
                className="h-full"
                style={{
                  width: "0%",
                  background:
                    "linear-gradient(90deg, hsl(var(--forge-molten)), hsl(var(--forge-amber)))",
                  transition: "width 0.05s linear",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
