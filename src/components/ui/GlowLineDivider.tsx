/** GlowLineDivider — scroll-triggered glow sweep divider */
import { useRef, useEffect } from "react";
import { gsap } from "@/hooks/use-gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface GlowLineDividerProps {
  /** Gradient color — defaults to primary */
  glowColor?: string;
  className?: string;
}

export const GlowLineDivider = ({ glowColor = "var(--precision-ice)", className = "" }: GlowLineDividerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (prefersReduced || isMobile) return;
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    gsap.set(glow, { x: "-250px" });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(glow, {
          x: container.offsetWidth + 250,
          duration: 1.5,
          ease: "power2.inOut",
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [prefersReduced, isMobile]);

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden ${className}`}>
      {/* Base line */}
      <div className="w-full h-px" style={{ backgroundColor: "hsl(var(--border))" }} />
      {/* Glow sweep */}
      <div
        ref={glowRef}
        className="absolute top-0 h-px pointer-events-none"
        style={{
          width: 250,
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
          opacity: isMobile ? 0.4 : 1,
          left: isMobile ? 0 : undefined,
        }}
      />
    </div>
  );
};
