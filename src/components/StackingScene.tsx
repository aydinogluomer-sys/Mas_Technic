import { forwardRef, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/hooks/use-gsap";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface StackingSceneProps {
  children: ReactNode;
  z: number;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const useInsetReveal = (ref: React.RefObject<HTMLDivElement>) => {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced || !ref.current) return;
    if (window.matchMedia("(max-width: 768px), (pointer: coarse)").matches) return;
    const el = ref.current;
    const debugId = el.id || el.querySelector<HTMLElement>("[id]")?.id || "scene";
    window.dispatchEvent(new CustomEvent("mas:scroll-debug", {
      detail: { type: "inset:init", id: debugId, progress: 0 },
    }));
    const tween = gsap.fromTo(el,
      { clipPath: "inset(3% 0% 3% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          end: "top 32%",
          scrub: 0.8,
          onUpdate: (self) => {
            window.dispatchEvent(new CustomEvent("mas:scroll-debug", {
              detail: { type: "inset", id: debugId, progress: self.progress },
            }));
          },
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      ScrollTrigger.refresh();
    };
  }, [prefersReduced, ref]);
};

const setForwardedRef = (forwardedRef: React.ForwardedRef<HTMLDivElement>, node: HTMLDivElement | null) => {
  if (typeof forwardedRef === "function") forwardedRef(node);
  else if (forwardedRef) forwardedRef.current = node;
};

export const Scene = forwardRef<HTMLDivElement, StackingSceneProps>(
  ({ children, z, id, className = "", style }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);
    useInsetReveal(localRef);

    return (
      <div
        id={id}
        ref={(node) => {
          localRef.current = node;
          setForwardedRef(forwardedRef, node);
        }}
        className={`relative w-full ${className}`}
        data-gsap-reveal="inset"
        style={{ clipPath: "inset(0% 0% 0% 0%)", zIndex: z, ...style }}
      >
        {children}
      </div>
    );
  },
);

Scene.displayName = "Scene";

export const FlowScene = forwardRef<HTMLDivElement, StackingSceneProps>(
  ({ children, z, id, className = "", style }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);
    useInsetReveal(localRef);

    return (
      <div
        id={id}
        ref={(node) => {
          localRef.current = node;
          setForwardedRef(forwardedRef, node);
        }}
        className={`relative w-full ${className}`}
        data-gsap-reveal="inset"
        style={{ clipPath: "inset(0% 0% 0% 0%)", zIndex: z, ...style }}
      >
        {children}
      </div>
    );
  },
);

FlowScene.displayName = "FlowScene";
