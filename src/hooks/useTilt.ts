import { useRef, useCallback } from "react";

export function useTilt(maxAngle = 5) {
  const ref = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${-y * maxAngle}deg) rotateY(${x * maxAngle}deg)`;
      if (spotRef.current) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        spotRef.current.style.background = `radial-gradient(280px circle at ${px}% ${py}%, rgb(var(--text-primary-rgb) / 0.07), transparent 70%)`;
      }
    },
    [maxAngle],
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    if (spotRef.current) spotRef.current.style.background = "none";
  }, []);

  return { ref, spotRef, handleMouseMove, handleMouseLeave };
}
