import { forwardRef, useRef, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/hooks/use-gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface RevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  variant?: "clip" | "word-stagger" | "percentage-reveal";
  delay?: number;
  duration?: number;
  className?: string;
}

const clipPaths: Record<string, { hidden: string; visible: string }> = {
  up: { hidden: "inset(0 0 100% 0)", visible: "inset(0 0 0% 0)" },
  down: { hidden: "inset(100% 0 0 0)", visible: "inset(0 0 0% 0)" },
  left: { hidden: "inset(0 100% 0 0)", visible: "inset(0 0 0 0)" },
  right: { hidden: "inset(0 0 0 100%)", visible: "inset(0 0 0 0)" },
};

const EASE = [0.76, 0, 0.24, 1] as const;

const WordStagger = ({
  children,
  delay = 0,
  duration = 0.7,
  className = "",
}: Pick<RevealProps, "children" | "delay" | "duration" | "className">) => {
  const text =
    typeof children === "string"
      ? children
      : typeof children === "object" && children !== null && "props" in (children as object)
        ? String((children as React.ReactElement).props?.children ?? "")
        : "";
  if (!text) return <div className={className}>{children}</div>;

  const words = text.split(" ");

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block whitespace-nowrap font-bold tracking-tight"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration, ease: EASE },
            },
          }}
        >
          <span>{word}</span>
        </motion.span>
      ))}
    </motion.span>
  );
};

/* Percentage-based reveal: translateY(100%) → 0% using GSAP ScrollTrigger */
const PercentageReveal = ({
  children,
  delay = 0,
  duration = 0.8,
  className = "",
}: Pick<RevealProps, "children" | "delay" | "duration" | "className">) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    gsap.set(inner, { yPercent: 100, opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.to(inner, {
          yPercent: 0,
          opacity: 1,
          duration,
          delay,
          ease: "power4.out",
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [delay, duration]);

  return (
    <div ref={wrapperRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
};

const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  ({ children, direction = "up", variant = "clip", delay = 0, duration = 0.7, className = "" }, _forwardedRef) => {
    const prefersReduced = usePrefersReducedMotion();

    if (prefersReduced) {
      return <div className={className}>{children}</div>;
    }

    if (variant === "word-stagger") {
      return (
        <WordStagger delay={delay} duration={duration} className={className}>
          {children}
        </WordStagger>
      );
    }

    if (variant === "percentage-reveal") {
      return (
        <PercentageReveal delay={delay} duration={duration} className={className}>
          {children}
        </PercentageReveal>
      );
    }

    const clip = clipPaths[direction];

    return (
      <motion.div
        ref={_forwardedRef}
        className={className}
        initial={{ clipPath: clip.hidden, opacity: 0 }}
        whileInView={{ clipPath: clip.visible, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    );
  },
);

Reveal.displayName = "Reveal";

export { Reveal };
