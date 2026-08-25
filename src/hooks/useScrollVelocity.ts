import { useEffect, useRef, useState } from "react";

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const lastY = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const now = Date.now();
          const dt = now - lastTime.current;
          const dy = window.scrollY - lastY.current;
          const v = (Math.abs(dy) / Math.max(dt, 1)) * 100;
          setVelocity(Math.min(v, 10));
          setDirection(dy >= 0 ? "down" : "up");
          lastY.current = window.scrollY;
          lastTime.current = now;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return { velocity, direction };
}
