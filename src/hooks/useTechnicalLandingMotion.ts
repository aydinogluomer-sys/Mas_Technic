import { useEffect, type RefObject } from "react";

/**
 * The landing's motion switchboard. It owns two class contracts, and the fact
 * that there are two is the point.
 *
 * `.tl-inview` — ONE-WAY, set once and never removed.
 *   Entrance choreography. A band that has already arrived must stay arrived:
 *   re-running an entrance because the reader scrolled back up would hide
 *   content they had already read, which is the same class of defect as the
 *   service-detail heading that faded out on scroll (I4).
 *
 * `.tl-onscreen` — TWO-WAY, toggled as the band enters and leaves.
 *   Continuous, non-terminating effects, which `.tl-inview` cannot express.
 *   The capability marquee is `animation: tl-marquee 34s linear infinite`, so
 *   under a one-way class it kept compositing a `max-content`-wide track for
 *   the entire session — including while it sat far above the viewport with
 *   the reader down at the RFQ band. Work outside the viewport is work nobody
 *   can see, so the stylesheet parks it with `animation-play-state: paused`
 *   whenever this class is absent.
 *
 * The 12% `rootMargin` on the two-way observer means the marquee is already
 * moving by the time it is genuinely readable, so gating it never reads as a
 * jerk into motion.
 *
 * Under `prefers-reduced-motion` neither observer is created: the root is
 * marked `reduced`, every band is marked arrived, and `technical-landing.css`
 * switches the whole layer off. Nothing is ever left hidden waiting for an
 * intersection that will not come.
 */
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

    const entrance = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("tl-inview");
        entrance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    bands.forEach((band) => entrance.observe(band));

    const live = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("tl-onscreen", entry.isIntersecting);
      });
    }, { rootMargin: "12% 0px" });
    bands.forEach((band) => live.observe(band));

    return () => {
      entrance.disconnect();
      live.disconnect();
    };
  }, [rootRef]);
}
