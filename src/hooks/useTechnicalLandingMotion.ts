import { useEffect, type RefObject } from "react";

export function useTechnicalLandingMotion(rootRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bands = [...root.querySelectorAll<HTMLElement>(".tl-band")];
    if (reduce) {
      root.dataset.motion = "reduced";
      bands.forEach((band) => band.classList.add("tl-inview"));
      return;
    }

    root.dataset.motion = "ready";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("tl-inview");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    bands.forEach((band) => observer.observe(band));
    return () => observer.disconnect();
  }, [rootRef]);
}
