import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

export interface KnowledgeItem {
  kind: string;
  title: string;
  path: string;
  image: string;
}

interface EditorialKnowledgePreviewProps {
  items: readonly KnowledgeItem[];
}

export function EditorialKnowledgePreview({ items }: EditorialKnowledgePreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const movePreviewRef = useRef<((value: number) => void) | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    let cancelled = false;
    let cleanup = () => {};

    void import("@/hooks/use-gsap").then(({ gsap }) => {
      if (cancelled || !previewRef.current) return;
      const move = gsap.quickTo(previewRef.current, "y", {
        duration: 0.35,
        ease: "power3.out",
      });
      movePreviewRef.current = move;
      cleanup = () => {
        move.tween.kill();
        movePreviewRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [prefersReducedMotion]);

  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    const preview = previewRef.current;
    const move = movePreviewRef.current;
    if (!root || !preview || !move) return;
    const bounds = root.getBoundingClientRect();
    const previewHeight = preview.offsetHeight;
    const desired = event.clientY - bounds.top - previewHeight / 2;
    move(Math.min(Math.max(desired, 0), Math.max(0, bounds.height - previewHeight)));
  };

  return (
    <div ref={rootRef} className="lf-editorial-preview-shell" onPointerMove={followPointer}>
      <div className="lf-editorial-list">
        {items.map((item, index) => (
          <Link
            to={item.path}
            data-lf-reveal
            data-cursor="open"
            data-active={index === activeIndex ? "" : undefined}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
            key={item.path}
          >
            <img src={item.image} alt="" width="1600" height="896" loading="lazy" decoding="async" />
            <span>0{index + 1}</span>
            <small>{item.kind}</small>
            <strong>{item.title}</strong>
            <ArrowRight />
          </Link>
        ))}
        <Link className="lf-inline-link" to="/blog">
          Tüm teknik içerikler <ArrowRight />
        </Link>
      </div>

      <div ref={previewRef} className="lf-editorial-floating-preview" aria-hidden="true">
        {items.map((item, index) => (
          <img
            src={item.image}
            alt=""
            width="1600"
            height="896"
            loading="lazy"
            decoding="async"
            data-active={index === activeIndex ? "" : undefined}
            key={item.path}
          />
        ))}
        <div>
          <span>0{activeIndex + 1}</span>
          <small>{items[activeIndex].kind}</small>
        </div>
      </div>
    </div>
  );
}
