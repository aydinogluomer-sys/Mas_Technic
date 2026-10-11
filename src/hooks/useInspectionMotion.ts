import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/** One owner for photo translation; text, schemas and PDF pages never drift.
 * No perpetual frame loop: intersection chooses the working set, scroll/resize
 * requests one frame, and route/preference changes release all resources.
 * Content's default state is visible, including when observation is absent. */
export function useInspectionMotion(rootRef: RefObject<HTMLElement>) {
  const { pathname } = useLocation();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || typeof IntersectionObserver === "undefined") return;

    const bands = [...root.querySelectorAll<HTMLElement>(".tl-band")];
    const photos = [...root.querySelectorAll<HTMLImageElement>(
      '.shell-plate:not([data-size="reference"]) .shell-plate-frame > img, [data-inspection-photo]',
    )];
    const active = new Set<HTMLImageElement>();
    const desktop = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    let frame = 0;

    const place = () => {
      frame = 0;
      if (document.hidden) return;
      // Read geometry as a batch before writing the compositor properties.
      const readings = [...active].map((photo) => {
        const rect = photo.parentElement!.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0,
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
        ));
        return { photo, shift: desktop.matches ? 36 - progress * 72 : 0, progress };
      });
      readings.forEach(({ photo, shift, progress }) => {
        photo.style.translate = shift ? `0 ${shift.toFixed(2)}px` : "";
        photo.parentElement!.style.setProperty("--inspection-travel", String(progress));
      });
    };
    const schedule = () => {
      if (!frame && active.size && !document.hidden) frame = requestAnimationFrame(place);
    };
    const adapt = () => {
      // Also reset offscreen photos: a previous desktop displacement must not
      // survive a mobile/coarse-pointer resize just because it is not active.
      photos.forEach((photo) => {
        photo.style.translate = "";
        photo.style.willChange = desktop.matches && active.has(photo) ? "translate" : "";
        photo.parentElement?.style.removeProperty("--inspection-travel");
      });
      schedule();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        photos.forEach((photo) => { photo.style.willChange = ""; });
      } else adapt();
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const node = entry.target as HTMLElement;
        if (node.matches(".tl-band")) {
          if (entry.isIntersecting) {
            node.setAttribute("data-registered", "");
            observer.unobserve(node);
          }
          return;
        }
        const photo = node as HTMLImageElement;
        if (entry.isIntersecting) {
          active.add(photo);
          photo.style.willChange = desktop.matches ? "translate" : "";
        } else {
          active.delete(photo);
          photo.style.willChange = "";
        }
      });
      schedule();
    }, { rootMargin: "8% 0px", threshold: 0 });

    bands.forEach((band) => observer.observe(band));
    photos.forEach((photo) => observer.observe(photo));
    root.dataset.inspection = "ready";
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", adapt);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", adapt);
      document.removeEventListener("visibilitychange", visibility);
      delete root.dataset.inspection;
      bands.forEach((band) => band.removeAttribute("data-registered"));
      photos.forEach((photo) => {
        photo.style.translate = "";
        photo.style.willChange = "";
        photo.parentElement?.style.removeProperty("--inspection-travel");
      });
    };
  }, [rootRef, pathname, reduced]);
}
