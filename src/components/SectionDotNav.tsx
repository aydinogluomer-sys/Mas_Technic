import { useEffect, useState, useCallback, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface Section {
  id: string;
  label: string;
}

interface SectionDotNavProps {
  sections: Section[];
}

export const SectionDotNav = forwardRef<HTMLDivElement, SectionDotNavProps>(({ sections }, _ref) => {
  const { pathname } = useLocation();
  const prefersReduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const activeIndexRef = useRef(0);
  const isCoarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const isHidden =
    pathname !== "/" ||
    typeof window === "undefined";

  // IO-based active section tracking
  useEffect(() => {
    if (isHidden) return;

    const map = new Map<string, number>();
    sections.forEach((s, i) => map.set(s.id, i));

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = activeIndexRef.current;
        let bestRatio = 0;

        for (const entry of entries) {
          const idx = map.get(entry.target.id);
          if (idx !== undefined && entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = idx;
          }
        }

        if (bestIndex !== activeIndexRef.current) {
          activeIndexRef.current = bestIndex;
          setActiveIndex(bestIndex);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75], rootMargin: "-10% 0px -40% 0px" },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, isHidden]);

  useEffect(() => {
    if (isHidden) return;
    const handleSceneChange = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      const index = sections.findIndex((section) => section.id === id);
      if (index < 0 || index === activeIndexRef.current) return;
      activeIndexRef.current = index;
      setActiveIndex(index);
    };
    window.addEventListener("mas:landing-scene-change", handleSceneChange);
    return () => window.removeEventListener("mas:landing-scene-change", handleSceneChange);
  }, [isHidden, sections]);

  // Visibility based on scroll (rAF throttled)
  useEffect(() => {
    if (isHidden) return;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.scrollY > window.innerHeight * 0.3);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHidden]);

  if (isHidden) return null;

  const handleClick = (id: string) => {
    if (id === "neden-biz" || id === "kabiliyetler") {
      window.dispatchEvent(new CustomEvent("mas:process-proof-jump", { detail: { id } }));
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    }
  };

  if (isCoarse) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className="fixed right-3 top-20 z-40 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            aria-label="Hızlı bölüm navigasyonu"
          >
            <label className="sr-only" htmlFor="mobile-section-jump">Bölüme geç</label>
            <select
              id="mobile-section-jump"
              value={sections[activeIndex]?.id}
              onChange={(event) => handleClick(event.target.value)}
              className="h-10 max-w-40 border px-3 text-[10px] font-mono uppercase tracking-wider shadow-xl"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "var(--surface-glass)",
                borderColor: "var(--surface-border)",
              }}
            >
              {sections.map((section, index) => (
                <option value={section.id} key={section.id}>{String(index + 1).padStart(2, "0")} · {section.label}</option>
              ))}
            </select>
          </motion.nav>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          aria-label="Sayfa bölüm navigasyonu"
        >
          {sections.map((section, i) => {
            const isActive = i === activeIndex;
            const isHovered = i === hoveredIndex;

            return (
              <motion.button
                key={section.id}
                onClick={() => handleClick(section.id)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex(null)}
                className="flex items-center gap-2 group focus-visible:outline-none"
                aria-label={section.label}
                aria-current={isActive ? "location" : undefined}
              >
                {isHovered && (
                  <motion.span
                    className="text-[10px] font-mono uppercase tracking-wider whitespace-nowrap px-2 py-1"
                    style={{
                      color: "hsl(var(--primary-foreground))",
                      backgroundColor: "hsl(var(--forge-steel))",
                    }}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {section.label}
                  </motion.span>
                )}

                <motion.div
                  className="rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    width: isActive ? 10 : 6,
                    height: isActive ? 10 : 6,
                    backgroundColor: isActive
                      ? "hsl(var(--primary))"
                      : "hsl(var(--forge-silver) / 0.4)",
                  }}
                  layout={!prefersReduced}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </motion.button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
});
SectionDotNav.displayName = "SectionDotNav";
