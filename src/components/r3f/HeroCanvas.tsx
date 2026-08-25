/**
 * HeroCanvas.tsx — Full-screen R3F canvas behind hero content
 * IO lazy render: viewport dışındayken Canvas unmount.
 */
import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { LiquidImage } from "./LiquidImage";
import heroBg from "@/assets/hero-cnc.jpg";

export const HeroCanvas = () => {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0" style={{ pointerEvents: "auto" }}>
      {visible ? (
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <LiquidImage src={heroBg} opacity={0.25} />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
};
