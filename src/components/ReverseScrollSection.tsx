import { useRef, type CSSProperties, type ReactNode } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface ReverseScrollSectionProps {
  children: ReactNode;
  className?: string;
  distance?: number;
}

/**
 * Keeps document scrolling native while moving its visual content in the
 * opposite direction. The bounded transform avoids trapping the user or
 * changing wheel/touch input semantics.
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
  // Mobilde de açık: efekt yalnızca transform kullanır ve düzeni değiştirmez,
  // native scroll'a dokunmaz. Tek kapanma koşulu reduced-motion.
  const motionDisabled = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const y = useSpring(rawY, { stiffness: 120, damping: 28, mass: 0.35 });

  return (
    <div
      ref={targetRef}
      className={className}
      data-reverse-scroll
      data-reverse-scroll-enabled={motionDisabled ? "false" : "true"}
      style={{ "--reverse-distance": `${distance}px` } as CSSProperties}
    >
      <motion.div
        data-reverse-scroll-content
        style={motionDisabled ? undefined : { y }}
      >
        {children}
      </motion.div>
    </div>
  );
};
