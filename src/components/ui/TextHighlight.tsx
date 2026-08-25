import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "@/hooks/use-gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface TextHighlightProps {
  children: ReactNode;
  /** Highlight color — defaults to primary */
  color?: string;
  className?: string;
}

export const TextHighlight = ({
  children,
  color = "hsl(var(--primary))",
  className = "",
}: TextHighlightProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { backgroundSize: "0% 100%" });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          backgroundSize: "100% 100%",
          duration: 1,
          ease: "power2.out",
        });
      },
    });

    return () => { trigger.kill(); };
  }, [prefersReduced]);

  return (
    <span
      ref={ref}
      className={`bg-no-repeat bg-left ${className}`}
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundSize: prefersReduced ? "100% 100%" : "0% 100%",
        backgroundPosition: "left bottom",
        padding: "0 0.1em",
        boxDecorationBreak: "clone" as const,
        WebkitBoxDecorationBreak: "clone" as const,
      }}
    >
      {children}
    </span>
  );
};
