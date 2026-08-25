import { useEffect } from "react";

export function useAmbientGlow() {
  useEffect(() => {
    let ticking = false;
    const handler = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty("--mouse-x", e.clientX + "px");
          document.documentElement.style.setProperty("--mouse-y", e.clientY + "px");
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
}
