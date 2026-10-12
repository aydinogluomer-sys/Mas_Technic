import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/** Only photographs travel; their fixed frame is the geometry anchor. Every
 * lifecycle reset includes offscreen photos so a route cannot retain drift. */
export function useInspectionMotion(rootRef: RefObject<HTMLElement>) {
  const { pathname } = useLocation();
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const desktop = window.matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bands = [...root.querySelectorAll<HTMLElement>(".tl-band")];
    const photos = [...root.querySelectorAll<HTMLImageElement>(
      '.shell-plate:not([data-size="reference"]) .shell-plate-frame > img',
    )];
    const active = new Set<HTMLImageElement>();
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let listening = false;
    const reset = () => photos.forEach((photo) => {
      photo.style.translate = "";
      photo.style.willChange = "";
      photo.parentElement?.style.removeProperty("--inspection-travel");
    });
    const place = () => {
      frame = 0;
      if (document.hidden || !desktop.matches || reduced.matches) return;
      const readings = [...active].map((photo) => ({ photo, rect: photo.parentElement!.getBoundingClientRect() }))
        .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight)
        .map(({ photo, rect }) => ({ photo, progress: Math.min(1, Math.max(0,
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
        )) }));
      readings.forEach(({ photo, progress }) => {
        photo.style.translate = `0 ${(36 - progress * 72).toFixed(2)}px`;
        photo.parentElement!.style.setProperty("--inspection-travel", String(progress));
      });
    };
    const schedule = () => { if (!frame && active.size && !document.hidden) frame = requestAnimationFrame(place); };
    const disconnect = () => {
      cancelAnimationFrame(frame); frame = 0;
      observer?.disconnect(); observer = null;
      if (listening) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        document.fonts?.removeEventListener("loadingdone", schedule);
        listening = false;
      }
      active.clear(); reset();
      delete root.dataset.inspection;
    };
    const adapt = () => {
      disconnect();
      if (document.hidden || !desktop.matches || reduced.matches || typeof IntersectionObserver === "undefined") {
        bands.forEach((band) => band.setAttribute("data-registered", ""));
        return;
      }
      root.dataset.inspection = "ready";
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const node = entry.target as HTMLElement;
          if (node.matches(".tl-band")) {
            if (entry.isIntersecting) { node.setAttribute("data-registered", ""); observer?.unobserve(node); }
            return;
          }
          const photo = photos.find((item) => item.parentElement === node);
          if (!photo) return;
          if (entry.isIntersecting) active.add(photo); else active.delete(photo);
          photo.style.willChange = entry.isIntersecting ? "translate" : "";
        });
        schedule();
      });
      bands.forEach((band) => { if (!band.hasAttribute("data-registered")) observer?.observe(band); });
      photos.forEach((photo) => { if (photo.parentElement) observer?.observe(photo.parentElement); });
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      document.fonts?.addEventListener("loadingdone", schedule);
      listening = true;
    };
    desktop.addEventListener("change", adapt);
    reduced.addEventListener("change", adapt);
    document.addEventListener("visibilitychange", adapt);
    adapt();
    return () => {
      disconnect();
      desktop.removeEventListener("change", adapt);
      reduced.removeEventListener("change", adapt);
      document.removeEventListener("visibilitychange", adapt);
      bands.forEach((band) => band.removeAttribute("data-registered"));
    };
  }, [rootRef, pathname]);
}
