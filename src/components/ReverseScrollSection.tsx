import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface ReverseScrollSectionProps {
  children: ReactNode;
  className?: string;
  distance?: number;
}

/* The spring the travel follows, in the units Framer's `useSpring` took when
   this section ran on it (Faz 2 dropped Framer from the landing's first load). */
const SPRING = { stiffness: 120, damping: 28, mass: 0.35 };
const SUBSTEP = 1 / 240;
const REST = 0.01;

/**
 * Keeps document scrolling native while moving its visual content in the
 * opposite direction. The bounded transform avoids trapping the user or
 * changing wheel/touch input semantics.
 *
 * Progress runs 0 → 1 from the section's top meeting the viewport's bottom to
 * its bottom leaving the viewport's top, mapped to `-distance → distance` and
 * eased through `SPRING`. The loop runs only while the spring is moving.
 *
 * `--reverse-distance` is published so the surrounding CSS can oversize the
 * content by the same amount; otherwise the travel would expose a gap.
 */
export const ReverseScrollSection = ({
  children,
  className,
  distance = 72,
}: ReverseScrollSectionProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Mobilde de açık: efekt yalnızca transform kullanır ve düzeni değiştirmez,
  // native scroll'a dokunmaz. Tek kapanma koşulu reduced-motion.
  const motionDisabled = usePrefersReducedMotion();

  useEffect(() => {
    const target = targetRef.current;
    const content = contentRef.current;
    if (motionDisabled || !target || !content) return;

    const goal = () => {
      const rect = target.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      return (Math.min(1, Math.max(0, progress)) * 2 - 1) * distance;
    };
    let y = goal();
    let velocity = 0;
    let frame = 0;
    let last = 0;
    const paint = () => { content.style.transform = `translateY(${y}px)`; };
    const step = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      const to = goal();
      for (let t = 0; t < dt; t += SUBSTEP) {
        const h = Math.min(SUBSTEP, dt - t);
        velocity += ((-SPRING.stiffness * (y - to) - SPRING.damping * velocity) / SPRING.mass) * h;
        y += velocity * h;
      }
      if (Math.abs(velocity) < REST && Math.abs(y - to) < REST) {
        y = to;
        frame = 0;
      } else {
        frame = requestAnimationFrame(step);
      }
      paint();
    };
    const wake = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    paint();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      content.style.transform = "";
    };
  }, [distance, motionDisabled]);

  return (
    <div
      ref={targetRef}
      className={className}
      data-reverse-scroll
      data-reverse-scroll-enabled={motionDisabled ? "false" : "true"}
      style={{ "--reverse-distance": `${distance}px` } as CSSProperties}
    >
      <div ref={contentRef} data-reverse-scroll-content>
        {children}
      </div>
    </div>
  );
};
