/**
 * OverlayReveal.tsx — CLEAN SEPARATED
 *
 * FIX: Was concatenated inside SmoothScrollProvider.tsx by Lovable.
 * Now standalone at src/components/ui/OverlayReveal.tsx
 */
import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "@/hooks/use-gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface OverlayRevealProps {
  children: ReactNode;
  className?: string;
  /** Overlay color — defaults to forge-obsidian */
  overlayColor?: string;
  /** Stagger delay when used in a group */
  staggerDelay?: number;
  /** Direction the overlay peels from */
  direction?: "top" | "bottom" | "left" | "right";
}

const originMap = {
  top: "top center",
  bottom: "bottom center",
  left: "center left",
  right: "center right",
} as const;

const scaleProperty = (dir: "top" | "bottom" | "left" | "right") =>
  dir === "left" || dir === "right" ? "scaleX" : "scaleY";

export const OverlayReveal = ({
  children,
  className = "",
  overlayColor = "var(--surface-base)",
  staggerDelay = 0,
  direction = "top",
}: OverlayRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!container || !overlay || !content) return;

    const prop = scaleProperty(direction);
    gsap.set(overlay, { [prop]: 1, transformOrigin: originMap[direction] });
    gsap.set(content, { scale: 1.15, opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 82%",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({ delay: staggerDelay });
        tl.to(overlay, {
          [prop]: 0,
          duration: 0.9,
          ease: "power4.inOut",
        });
        tl.to(
          content,
          {
            scale: 1,
            opacity: 1,
            duration: 1.4,
            ease: "power2.out",
          },
          "<0.1",
        );
      },
    });

    return () => {
      trigger.kill();
    };
  }, [direction, staggerDelay, prefersReduced]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ backgroundColor: overlayColor }}
      />
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

OverlayReveal.displayName = "OverlayReveal";
