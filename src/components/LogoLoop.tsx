import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const ANIM = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, HEADROOM: 2 };

interface LogoItem {
  node: ReactNode;
  alt: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: string) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const LogoLoop = ({
  logos,
  speed = 120,
  direction = "left",
  logoHeight = 28,
  gap = 32,
  pauseOnHover = true,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  className = "",
  style = {},
}: LogoLoopProps) => {
  const prefersReduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTs = useRef<number | null>(null);
  const offset = useRef(0);
  const vel = useRef(0);
  const [seqW, setSeqW] = useState(0);
  const [copies, setCopies] = useState(ANIM.MIN_COPIES);
  const [hovered, setHovered] = useState(false);

  const effHover = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    return pauseOnHover ? 0 : undefined;
  }, [hoverSpeed, pauseOnHover]);

  const target = useMemo(() => {
    const mag = Math.abs(speed);
    const dir = direction === "left" ? 1 : -1;
    return mag * dir * (speed < 0 ? -1 : 1);
  }, [speed, direction]);

  const measure = useCallback(() => {
    const cW = containerRef.current?.clientWidth ?? 0;
    const sW = seqRef.current?.getBoundingClientRect()?.width ?? 0;
    if (sW > 0) {
      setSeqW(Math.ceil(sW));
      setCopies(Math.max(ANIM.MIN_COPIES, Math.ceil(cW / sW) + ANIM.HEADROOM));
    }
  }, []);

  useEffect(() => {
    measure();
    const imgs = seqRef.current?.querySelectorAll("img") ?? [];
    let rem = imgs.length;
    if (!rem) return;
    const done = () => {
      rem--;
      if (!rem) measure();
    };
    imgs.forEach((i) => {
      if (i.complete) done();
      else {
        i.addEventListener("load", done, { once: true });
        i.addEventListener("error", done, { once: true });
      }
    });
  }, [logos, gap, logoHeight, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || seqW <= 0 || prefersReduced) return;
    offset.current = ((offset.current % seqW) + seqW) % seqW;
    track.style.transform = `translate3d(${-offset.current}px,0,0)`;

    const loop = (ts: number) => {
      if (lastTs.current === null) lastTs.current = ts;
      const dt = Math.max(0, ts - lastTs.current) / 1000;
      lastTs.current = ts;
      const t = hovered && effHover !== undefined ? effHover : target;
      vel.current += (t - vel.current) * (1 - Math.exp(-dt / ANIM.SMOOTH_TAU));
      let next = offset.current + vel.current * dt;
      next = ((next % seqW) + seqW) % seqW;
      offset.current = next;
      track.style.transform = `translate3d(${-offset.current}px,0,0)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTs.current = null;
    };
  }, [target, seqW, hovered, effHover, prefersReduced]);

  const lists = useMemo(
    () =>
      Array.from({ length: copies }, (_, ci) => (
        <div
          key={ci}
          ref={ci === 0 ? seqRef : undefined}
          style={{ display: "flex", gap, alignItems: "center", flexShrink: 0 }}
        >
          {logos.map((item, ii) => (
            <div
              key={`${ci}-${ii}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: logoHeight,
                flexShrink: 0,
              }}
            >
              {renderItem ? (
                renderItem(item, `${ci}-${ii}`)
              ) : (
                <div style={{ height: logoHeight, display: "flex", alignItems: "center" }}>{item.node}</div>
              )}
            </div>
          ))}
        </div>
      )),
    [copies, logos, gap, logoHeight, renderItem],
  );

  // Static grid for reduced motion
  if (prefersReduced) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap,
          justifyContent: "center",
          alignItems: "center",
          ...style,
        }}
      >
        {logos.map((item, i) => (
          <div key={i} style={{ height: logoHeight, display: "flex", alignItems: "center" }}>
            {renderItem ? renderItem(item, `static-${i}`) : item.node}
          </div>
        ))}
      </div>
    );
  }

  const fadeColor = fadeOutColor || "var(--background)";

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        contain: "paint",
        maxWidth: "100%",
        width: "100%",
        ...style,
      }}
    >
      {fadeOut && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 80,
              background: `linear-gradient(to right, ${fadeColor}, transparent)`,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 80,
              background: `linear-gradient(to left, ${fadeColor}, transparent)`,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </>
      )}
      <div
        ref={trackRef}
        style={{ display: "flex", gap, willChange: "transform" }}
        onMouseEnter={() => effHover !== undefined && setHovered(true)}
        onMouseLeave={() => effHover !== undefined && setHovered(false)}
      >
        {lists}
      </div>
    </div>
  );
};
