import { useEffect, type RefObject } from "react";
import { LANDING_MOTION } from "@/config/landing-motion";

interface DecisionPixelTransitionOptions {
  active: boolean;
  reducedMotion: boolean;
  columns?: number;
  rows?: number;
}

export function useDecisionPixelTransition(
  gridRef: RefObject<HTMLDivElement>,
  {
    active,
    reducedMotion,
    columns = LANDING_MOTION.decisionPixelColumns,
    rows = LANDING_MOTION.decisionPixelRows,
  }: DecisionPixelTransitionOptions,
) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const pixels = Array.from(grid.children);

    if (reducedMotion || !active) {
      pixels.forEach((pixel) => {
        (pixel as HTMLElement).style.opacity = "0";
        (pixel as HTMLElement).style.transform = "scale(0)";
      });
      return;
    }

    let cancelled = false;
    let cleanup = () => {};

    void import("@/hooks/use-gsap").then(({ gsap }) => {
      if (cancelled) return;
      gsap.killTweensOf(pixels);
      gsap.set(pixels, { opacity: 1, scale: 0, transformOrigin: "center" });

      const timeline = gsap.timeline();
      const staggerAmount = LANDING_MOTION.decisionStagger * 20;
      timeline
        .to(pixels, {
          scale: 1,
          duration: LANDING_MOTION.decisionCoverDuration,
          ease: "power2.inOut",
          stagger: {
            grid: [rows, columns],
            from: "center",
            amount: staggerAmount,
          },
        })
        .to(pixels, {
          opacity: 0,
          scale: 0,
          duration: LANDING_MOTION.decisionRevealDuration,
          ease: "power3.out",
          stagger: {
            grid: [rows, columns],
            from: "center",
            amount: staggerAmount,
          },
        }, 0.16);

      cleanup = () => {
        timeline.kill();
        gsap.killTweensOf(pixels);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [active, columns, gridRef, reducedMotion, rows]);
}
