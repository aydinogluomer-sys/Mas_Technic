import { forwardRef, useEffect, useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/hooks/use-gsap";

const charVariants = {
  enter: (i: number) => ({
    y: 0,
    opacity: 1,
    scaleY: 1,
    rotateX: 0,
    transition: { delay: i * 0.035, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
  initial: { y: "-120%", opacity: 0, scaleY: 0.8, rotateX: 40 },
  exit: (i: number) => ({
    y: "120%",
    opacity: 0,
    scaleY: 0.8,
    rotateX: -40,
    transition: { delay: i * 0.02, duration: 0.4, ease: "easeIn" as const },
  }),
};

interface HeadlineStaggerProps {
  text: string;
  scrollRotateX?: ReturnType<typeof useTransform>;
}

export const HeadlineStagger = forwardRef<HTMLDivElement, HeadlineStaggerProps>(
  ({ text, scrollRotateX }, ref) => {
    const prefersReduced = usePrefersReducedMotion();
    const localRef = useRef<HTMLDivElement | null>(null);
    const lines = text.split("\n");

    useEffect(() => {
      if (!localRef.current) return;
      if (prefersReduced) {
        gsap.set(localRef.current.querySelectorAll(".hero-title-line-inner"), { yPercent: 0, opacity: 1 });
        return;
      }
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".hero-title-line-inner",
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 2,
            stagger: 0.08,
            ease: "expo.out",
            onComplete: () => window.dispatchEvent(new CustomEvent("mas:scroll-debug", {
              detail: { type: "text", id: "hero-title", progress: 1 },
            })),
          },
        );
      }, localRef);
      return () => ctx.revert();
    }, [prefersReduced, text]);

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <motion.div
        ref={setRefs}
        className="flex flex-col items-center"
        style={{
          perspective: 800,
          transformStyle: "preserve-3d" as const,
          rotateX: scrollRotateX,
          wordBreak: "break-word",
          overflowWrap: "break-word",
          hyphens: "auto",
        }}
        initial={prefersReduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {lines.map((line, lineIndex) => (
          <span key={line} className="block overflow-hidden text-center">
            <span
              className="hero-title-line-inner block font-extrabold uppercase"
              style={{
                fontSize: "clamp(2.2rem, 7.5vw, 9rem)",
                color: "var(--precision-ice)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                textShadow: "0 4px 30px rgb(var(--precision-ice-rgb) / 0.15)",
                ...(lineIndex === 0
                  ? { WebkitTextStroke: "2px var(--precision-ice)", color: "transparent" }
                  : {}),
              }}
            >
              {line}
            </span>
          </span>
        ))}
        <motion.span
          className="sr-only"
          variants={charVariants}
          initial="enter"
          animate="enter"
        >
          {text}
        </motion.span>
      </motion.div>
    );
  }
);

HeadlineStagger.displayName = "HeadlineStagger";
