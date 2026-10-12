import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";

type Scene = { node: HTMLElement; anchor: HTMLElement };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** One-way arrivals and two-way visibility remain separate. Scene geometry is
 * read in one event-driven batch; scene consumers never own a scroll clock. */
export function useTechnicalLandingMotion(rootRef: RefObject<HTMLElement>) {
  const { pathname } = useLocation();
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const bands = [...root.querySelectorAll<HTMLElement>(".tl-band")];
    const desktop = window.matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const specs = [
      [".tl-part-frame", ".tl-part-stage"], [".tl-process-photo", ".tl-process-photo"],
      [".tl-manifesto-body", ".tl-manifesto-body"], [".tl-marquee-viewport", ".tl-marquee"],
    ];
    const scenes: Scene[] = specs.flatMap(([selector, anchorSelector]) => {
      const node = root.querySelector<HTMLElement>(selector);
      const anchor = root.querySelector<HTMLElement>(anchorSelector);
      return node && anchor ? [{ node, anchor }] : [];
    });
    const active = new Set<Scene>();
    let entrance: IntersectionObserver | null = null;
    let live: IntersectionObserver | null = null;
    let visible: IntersectionObserver | null = null;
    let frame = 0;
    let rest = 0;
    let failsafe = 0;
    let listening = false;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    const reset = () => scenes.forEach(({ node }) => {
      node.style.removeProperty("--inspection-progress");
      node.style.removeProperty("--inspection-velocity");
    });
    const place = () => {
      frame = 0;
      if (root.dataset.inspectionMotion !== "ready") return;
      const height = window.innerHeight;
      const readings = [...active].map((scene) => ({ scene, rect: scene.anchor.getBoundingClientRect() }))
        .filter(({ rect }) => rect.bottom > 0 && rect.top < height)
        .map(({ scene, rect }) => ({ scene, progress: clamp((height - rect.top) / (height + rect.height), 0, 1) }));
      readings.forEach(({ scene, progress }) => {
        scene.node.style.setProperty("--inspection-progress", progress.toFixed(4));
        scene.node.style.setProperty("--inspection-velocity", String(velocity));
      });
    };
    const schedule = () => {
      if (!frame && active.size && root.dataset.inspectionMotion === "ready") frame = requestAnimationFrame(place);
    };
    const scroll = () => {
      const now = performance.now();
      velocity = clamp((window.scrollY - lastY) / Math.max(1, now - lastTime), -2, 2);
      lastY = window.scrollY;
      lastTime = now;
      window.clearTimeout(rest);
      rest = window.setTimeout(() => { velocity = 0; schedule(); }, 160);
      schedule();
    };
    const disconnect = () => {
      entrance?.disconnect(); live?.disconnect(); visible?.disconnect();
      entrance = live = visible = null;
      cancelAnimationFrame(frame); frame = 0;
      window.clearTimeout(rest); window.clearTimeout(failsafe);
      if (listening) {
        window.removeEventListener("scroll", scroll);
        window.removeEventListener("resize", schedule);
        document.fonts?.removeEventListener("loadingdone", schedule);
        listening = false;
      }
      active.clear(); velocity = 0;
      bands.forEach((band) => band.classList.remove("tl-onscreen"));
      reset();
    };
    const arrive = () => bands.forEach((band) => band.classList.add("tl-inview"));
    const adapt = () => {
      disconnect();
      if (document.hidden || !desktop.matches || reduced.matches || typeof IntersectionObserver === "undefined") {
        root.dataset.motion = "reduced";
        root.dataset.inspectionMotion = document.hidden ? "paused" : "native";
        arrive();
        return;
      }
      root.dataset.motion = "ready";
      root.dataset.inspectionMotion = "ready";
      lastY = window.scrollY; lastTime = performance.now();
      let observed = false;
      failsafe = window.setTimeout(() => {
        if (observed) return;
        disconnect(); arrive();
        root.dataset.motion = "reduced";
        root.dataset.inspectionMotion = "native";
      }, 1600);
      entrance = new IntersectionObserver((entries) => {
        observed = true;
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("tl-inview"); entrance?.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
      live = new IntersectionObserver((entries) => entries.forEach((entry) => {
        entry.target.classList.toggle("tl-onscreen", entry.isIntersecting);
      }));
      visible = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const scene = scenes.find(({ anchor }) => anchor === entry.target);
          if (scene) { if (entry.isIntersecting) active.add(scene); else active.delete(scene); }
        });
        schedule();
      });
      bands.forEach((band) => { if (!band.classList.contains("tl-inview")) entrance?.observe(band); live?.observe(band); });
      scenes.forEach(({ anchor }) => visible?.observe(anchor));
      window.addEventListener("scroll", scroll, { passive: true });
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
      delete root.dataset.inspectionMotion;
      delete root.dataset.motion;
    };
  }, [rootRef, pathname]);
}
