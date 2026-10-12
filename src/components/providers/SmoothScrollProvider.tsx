import { useEffect, type ReactNode } from "react";
import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
    __lenisMenuLock?: boolean;
  }
}

const START_EVENTS = ["wheel", "keydown", "pointerdown", "touchstart"] as const;
const shouldDisable = (import.meta.env.DEV && import.meta.env.VITE_DISABLE_LENIS === "true")
  || typeof window === "undefined";

export const SmoothScrollProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    if (shouldDisable) return;
    const desktop = window.matchMedia("(min-width: 769px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let generation = 0;
    let lenis: Lenis | null = null;
    let importing = false;
    let waiting = false;
    let frame = 0;
    let idle = 0;
    const eligible = () => desktop.matches && !reduced.matches;
    const canStart = () => eligible() && !window.__lenisMenuLock;
    const stopClock = () => { cancelAnimationFrame(frame); frame = 0; };
    const tick = (time: number) => {
      frame = 0;
      if (disposed || document.hidden || !eligible() || !lenis) return;
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    const runClock = () => {
      if (!frame && lenis && eligible() && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const stopWaiting = () => {
      waiting = false;
      START_EVENTS.forEach((type) => window.removeEventListener(type, start));
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      idle = 0;
    };
    const start = () => {
      stopWaiting();
      if (disposed || !canStart() || document.hidden || lenis || importing) return;
      importing = true;
      const ticket = generation;
      void import("lenis").then(({ default: LenisRuntime }) => {
        if (ticket !== generation || disposed) return;
        importing = false;
        if (!canStart() || document.hidden) return;
        lenis = new LenisRuntime({
          lerp: 0.08, duration: 1.4, smoothWheel: true,
          wheelMultiplier: 0.8, touchMultiplier: 1.5, autoRaf: false,
        });
        window.__lenis = lenis;
        runClock();
      }).catch(() => { if (ticket === generation) importing = false; });
    };
    const waitToStart = () => {
      if (waiting || importing || lenis || !canStart() || document.hidden) return;
      waiting = true;
      START_EVENTS.forEach((type) => window.addEventListener(type, start, { once: true, passive: true }));
      idle = typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 2000 }) : window.setTimeout(start, 2000);
    };
    const reconcile = () => {
      generation += 1;
      importing = false;
      stopWaiting();
      stopClock();
      if (!eligible()) {
        lenis?.destroy();
        if (window.__lenis === lenis) delete window.__lenis;
        lenis = null;
      } else if (!document.hidden) {
        // Header owns stop/start. Visibility only parks the clock, preserving
        // the exact engine and its menu-stopped state across a hidden tab.
        if (lenis) runClock();
        else waitToStart();
      }
    };
    desktop.addEventListener("change", reconcile);
    reduced.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("mas:scroll-lock-change", reconcile);
    waitToStart();
    return () => {
      disposed = true;
      generation += 1;
      stopWaiting();
      stopClock();
      desktop.removeEventListener("change", reconcile);
      reduced.removeEventListener("change", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("mas:scroll-lock-change", reconcile);
      lenis?.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);
  return <>{children}</>;
};
