import { useEffect, type ReactNode } from "react";
import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

const shouldDisable =
  (import.meta.env.DEV && import.meta.env.VITE_DISABLE_LENIS === "true") || typeof window === "undefined";

/* Lenis starts when the browser is first idle (at most 2 s after mount) or on
   the first input, whichever comes first, so it never competes with the first
   paint. It drives its own frame loop (`autoRaf`): nothing on the site reads
   GSAP's ScrollTrigger, so the GSAP ticker it used to ride on was dead weight
   in the desktop first load. */
const START_EVENTS = ["wheel", "keydown", "pointerdown", "touchstart"] as const;

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  useEffect(() => {
    if (shouldDisable) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Mobilde Lenis başlatma — native scroll + scroll-snap aktif
    if (window.matchMedia("(max-width: 768px)").matches) return;

    let cancelled = false;
    let lenis: Lenis | null = null;
    let idleHandle = 0;

    const start = () => {
      stopWaiting();
      void import("lenis").then(({ default: LenisRuntime }) => {
        if (cancelled) return;
        lenis = new LenisRuntime({
          lerp: 0.08,
          duration: 1.4,
          smoothWheel: true,
          wheelMultiplier: 0.8,
          touchMultiplier: 1.5,
          autoRaf: true,
        });
        window.__lenis = lenis;
      });
    };
    const stopWaiting = () => {
      START_EVENTS.forEach((type) => window.removeEventListener(type, start));
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
    };

    START_EVENTS.forEach((type) => window.addEventListener(type, start, { once: true, passive: true }));
    idleHandle = typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 2000);

    return () => {
      cancelled = true;
      stopWaiting();
      lenis?.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
};
