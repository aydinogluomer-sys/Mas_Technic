import { useRef, useEffect } from "react";
import { gsap } from "@/hooks/use-gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SplitTextRevealOptions {
  /** "word" splits by word, "line" splits by line (wraps words into lines) */
  splitBy?: "word" | "line";
  /** Stagger between each split element in seconds */
  stagger?: number;
  /** Total animation duration per element */
  duration?: number;
  /** ScrollTrigger start position */
  triggerStart?: string;
  /** Additional delay before animation starts */
  delay?: number;
  /** Whether animation is disabled */
  disabled?: boolean;
}

/**
 * Manual SplitText replacement — splits text content into words or lines
 * and applies GSAP yPercent reveal with stagger.
 *
 * Usage:
 *   const ref = useSplitTextReveal<HTMLHeadingElement>();
 *   <h2 ref={ref}>My Heading Text</h2>
 */
export function useSplitTextReveal<T extends HTMLElement>(
  options: SplitTextRevealOptions = {},
) {
  const {
    splitBy = "word",
    stagger = 0.06,
    duration = 0.8,
    triggerStart = "top 82%",
    delay = 0,
    disabled = false,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const originalHTML = el.innerHTML;
    const text = el.textContent || "";
    if (!text.trim()) return;

    // Split into words
    const words = text.split(/\s+/).filter(Boolean);

    if (splitBy === "word") {
      el.innerHTML = words
        .map(
          (word) =>
            `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.05em"><span class="split-word" style="display:inline-block;transform:translateY(100%);opacity:0">${word}</span></span>`,
        )
        .join('<span style="display:inline-block;width:0.3em"></span>');
    } else {
      // Line split — wrap all words, then group by offsetTop after render
      el.innerHTML = words
        .map(
          (word) =>
            `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.05em"><span class="split-word" style="display:inline-block;transform:translateY(100%);opacity:0">${word}</span></span>`,
        )
        .join('<span style="display:inline-block;width:0.3em"></span>');
    }

    const splitEls = el.querySelectorAll<HTMLSpanElement>(".split-word");

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: triggerStart,
      once: true,
      onEnter: () => {
        gsap.to(splitEls, {
          y: 0,
          yPercent: 0,
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power4.out",
          clearProps: "transform",
        });
      },
    });

    return () => {
      trigger.kill();
      el.innerHTML = originalHTML;
    };
  }, [splitBy, stagger, duration, triggerStart, delay, disabled]);

  return ref;
}
