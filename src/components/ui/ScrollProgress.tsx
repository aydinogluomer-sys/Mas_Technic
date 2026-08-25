import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";

const ScrollProgress = () => {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [progress, setProgress] = useState(0);
  const { velocity, direction } = useScrollVelocity();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(Math.round(v * 100));
  });

  const isHidden =
    pathname === "/" ||
    pathname === "/technical-preview" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/musteri-paneli");

  if (isHidden) return null;

  const barHeight = velocity < 3 ? 2 : velocity < 6 ? 3 : 5;
  const barColor =
    direction === "down"
      ? "linear-gradient(90deg, hsl(var(--forge-molten)), hsl(var(--forge-amber)))"
      : "linear-gradient(90deg, hsl(var(--forge-amber)), hsl(var(--heat-amber-rgb) / 0.85))";

  return (
    <div role="region" aria-label="Sayfa ilerlemesi">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 origin-left"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Sayfa ilerleme durumu"
        style={{
          scaleX,
          height: barHeight,
          transition: "height 0.15s ease-out, background 0.3s ease",
          background: barColor,
        }}
      />
    </div>
  );
};

export { ScrollProgress };
