import { useEffect, type RefObject } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const desktopMotionQuery =
  "(min-width: 769px) and (min-height: 601px) and (pointer: fine)";

export function useMaterialCardMotion(rootRef: RefObject<HTMLElement>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root
      || prefersReducedMotion
      || !window.matchMedia(desktopMotionQuery).matches
    ) return;

    let cancelled = false;
    let cleanup = () => {};

    void import("@/hooks/use-gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const cards = gsap.utils.toArray<HTMLElement>(".lf-material-card", root);
      const context = gsap.context(() => {
        const triggers = ScrollTrigger.batch(cards, {
          start: "top 84%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 36, rotateY: -7, opacity: 0 },
              {
                y: 0,
                rotateY: 0,
                opacity: 1,
                stagger: 0.07,
                duration: 0.64,
                ease: "power3.out",
                clearProps: "willChange",
              },
            );
          },
        });
        cleanup = () => triggers.forEach((trigger) => trigger.kill());
      }, root);
      cleanup = () => context.revert();
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [prefersReducedMotion, rootRef]);
}

