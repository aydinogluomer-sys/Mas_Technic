import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface ReverseScrollSectionProps {
  children: ReactNode;
  className?: string;
  distance?: number;
}

const SPRING = { stiffness: 120, damping: 28, mass: 0.35 };
const SUBSTEP = 1 / 240;
const REST = 0.01;

/** The fixed wrapper supplies layout geometry and overscan. Only its child
 * owns the bounded spring transform, and only while visible on fine desktop. */
export const ReverseScrollSection = ({
  children,
  className,
  distance = 72,
}: ReverseScrollSectionProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    const content = contentRef.current;
    if (!target || !content) return;
    const desktop = window.matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let visible = false;
    let listening = false;
    let observer: IntersectionObserver | null = null;
    let y = 0;
    let velocity = 0;
    let frame = 0;
    let last = 0;
    const eligible = () => !disposed && !document.hidden && desktop.matches && !reduced.matches;
    const read = () => {
      const rect = target.getBoundingClientRect();
      let top = 0;
      for (let node: HTMLElement | null = target; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
      const progress = (window.scrollY + window.innerHeight - top) / (window.innerHeight + target.offsetHeight);
      return {
        visible: rect.bottom > 0 && rect.top < window.innerHeight,
        goal: (Math.min(1, Math.max(0, progress)) * 2 - 1) * distance,
      };
    };
    const stop = () => {
      cancelAnimationFrame(frame); frame = 0;
      if (listening) {
        window.removeEventListener("scroll", wake);
        window.removeEventListener("resize", wake);
        document.fonts?.removeEventListener("loadingdone", wake);
        listening = false;
      }
      velocity = 0;
      content.style.transform = "";
      if (!disposed) setEnabled(false);
    };
    const step = (now: number) => {
      frame = 0;
      if (!eligible() || !visible) { stop(); return; }
      const reading = read();
      if (!reading.visible) { stop(); return; }
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      for (let t = 0; t < dt; t += SUBSTEP) {
        const h = Math.min(SUBSTEP, dt - t);
        velocity += ((-SPRING.stiffness * (y - reading.goal) - SPRING.damping * velocity) / SPRING.mass) * h;
        y += velocity * h;
      }
      if (Math.abs(velocity) < REST && Math.abs(y - reading.goal) < REST) y = reading.goal;
      else frame = requestAnimationFrame(step);
      content.style.transform = `translateY(${y}px)`;
    };
    const wake = () => {
      if (frame || !eligible() || !visible) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };
    const resume = () => {
      if (!eligible() || !visible || listening) return;
      const reading = read();
      if (!reading.visible) return;
      y = reading.goal;
      velocity = 0;
      content.style.transform = `translateY(${y}px)`;
      setEnabled(true);
      window.addEventListener("scroll", wake, { passive: true });
      window.addEventListener("resize", wake);
      document.fonts?.addEventListener("loadingdone", wake);
      listening = true;
    };
    const adapt = () => {
      observer?.disconnect(); observer = null;
      visible = false;
      stop();
      if (!eligible() || typeof IntersectionObserver === "undefined") return;
      observer = new IntersectionObserver((entries) => {
        if (!eligible()) return;
        entries.forEach((entry) => {
          if (entry.target !== target) return;
          visible = entry.isIntersecting;
          if (visible) resume(); else stop();
        });
      });
      observer.observe(target);
    };
    desktop.addEventListener("change", adapt);
    reduced.addEventListener("change", adapt);
    document.addEventListener("visibilitychange", adapt);
    adapt();
    return () => {
      disposed = true;
      observer?.disconnect();
      stop();
      desktop.removeEventListener("change", adapt);
      reduced.removeEventListener("change", adapt);
      document.removeEventListener("visibilitychange", adapt);
    };
  }, [distance]);

  return (
    <div
      ref={targetRef}
      className={className}
      data-reverse-scroll
      data-reverse-scroll-enabled={enabled ? "true" : "false"}
      style={{ "--reverse-distance": `${distance}px` } as CSSProperties}
    >
      <div ref={contentRef} data-reverse-scroll-content>
        {children}
      </div>
    </div>
  );
};
