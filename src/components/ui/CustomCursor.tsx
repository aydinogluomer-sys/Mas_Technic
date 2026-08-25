import { useEffect, useRef, useCallback } from "react";
import { useSoundEngine } from "@/hooks/use-sound";
import { gsap } from "@/hooks/use-gsap";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CursorLabel {
  text: string;
  scale: number;
}

const SELECTORS: Array<{ selector: string; label: CursorLabel }> = [
  { selector: "[data-cursor='family']", label: { text: "Seç", scale: 1.65 } },
  { selector: "[data-cursor='category']", label: { text: "Aç", scale: 1.65 } },
  { selector: "[data-cursor='open']", label: { text: "Git", scale: 1.65 } },
  { selector: ".gsap-project-card, [data-cursor='kesfet']", label: { text: "Keşfet", scale: 2 } },
  { selector: ".material-card, [data-cursor='cevir']", label: { text: "Çevir", scale: 1.8 } },
  { selector: ".hww-card, [data-cursor='detail']", label: { text: "Detay", scale: 1.8 } },
  { selector: ".testimonial-stack-card", label: { text: "Oku", scale: 1.6 } },
  { selector: ".service-item, [data-cursor='hizmet']", label: { text: "Detay", scale: 1.8 } },
  { selector: "[data-cursor='zoom']", label: { text: "Zoom", scale: 2 } },
  { selector: "[data-cursor='teklif']", label: { text: "Teklif", scale: 2 } },
  { selector: "a[href], .nav-link, button", label: { text: "", scale: 1.3 } },
];

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const { play } = useSoundEngine();
  const quickToX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickToY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const ringQuickToX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const ringQuickToY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      quickToX.current?.(e.clientX);
      quickToY.current?.(e.clientY);
      ringQuickToX.current?.(e.clientX);
      ringQuickToY.current?.(e.clientY);
    },
    [],
  );

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;

    for (const { selector, label: lbl } of SELECTORS) {
      if (target.closest(selector)) {
        play("tick");
        gsap.to(ring, { scale: lbl.scale, duration: 0.3, ease: "power2.out" });
        if (lbl.text) {
          label.textContent = lbl.text;
          gsap.to(label, { opacity: 1, duration: 0.2 });
        }
        return;
      }
    }

    // Reset
    gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(label, { opacity: 0, duration: 0.15 });
  }, [play]);

  useEffect(() => {
    if (prefersReduced || isMobile || !window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    quickToX.current = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
    quickToY.current = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });
    ringQuickToX.current = gsap.quickTo(ring, "x", { duration: 0.3, ease: "power2.out" });
    ringQuickToY.current = gsap.quickTo(ring, "y", { duration: 0.3, ease: "power2.out" });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [prefersReduced, isMobile, handleMouseMove, handleMouseOver]);

  if (prefersReduced || isMobile) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[10052] pointer-events-none"
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "hsl(var(--primary))",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "difference",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[10051] pointer-events-none flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid hsl(var(--primary) / 0.4)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          ref={labelRef}
          className="text-[7px] uppercase tracking-[0.12em] font-mono font-semibold select-none"
          style={{ color: "hsl(var(--primary))", opacity: 0 }}
        />
      </div>
    </>
  );
};
