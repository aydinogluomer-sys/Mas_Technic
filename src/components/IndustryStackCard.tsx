import { lazy, Suspense } from "react";
import { motion, useTransform, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { ArrowRight } from "lucide-react";
import { BlurImage } from "./BlurImage";
import type { IndustryType } from "./IndustryModels";

const IndustryCanvas = lazy(() => import("./IndustryModels").then(m => ({ default: m.IndustryCanvas })));

interface Industry {
  name: string;
  description: string;
  highlight: string;
  modelType: IndustryType;
  image: string;
}

interface IndustryStackCardProps {
  industry: Industry;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  isActive: boolean;
  isMobile: boolean;
  onActivate: (type: IndustryType) => void;
  onDeactivate: () => void;
}

export function IndustryStackCard({
  industry,
  index,
  total,
  scrollYProgress,
  isActive,
  isMobile,
  onActivate,
  onDeactivate,
}: IndustryStackCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  const start = index / total;
  const end = (index + 1) / total;

  // Scroll-driven transforms — hooks at top level
  const y = useTransform(scrollYProgress, [start, end], prefersReduced ? ["0%", "0%"] : ["0%", "-100%"]);
  const scale = useTransform(scrollYProgress, [start, end], prefersReduced ? [1, 1] : [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [start, Math.min(end, 0.98)], prefersReduced ? [1, 1] : [1, 0]);

  // 3D tilt (disabled for reduced motion)
  const rotateXVal = useMotionValue(0);
  const rotateYVal = useMotionValue(0);
  const springRotateX = useSpring(rotateXVal, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateYVal, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    rotateXVal.set(-yPos * 8);
    rotateYVal.set(x * 8);
  };

  const handleMouseLeave = () => {
    rotateXVal.set(0);
    rotateYVal.set(0);
    onDeactivate();
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-4"
      style={{ y, scale, opacity, zIndex: total - index }}
    >
      <motion.div
        className="w-full max-w-4xl bg-background border border-border overflow-hidden rounded-sm cursor-pointer"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d" as const,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => !isMobile && onActivate(industry.modelType)}
        onClick={() => isMobile && onActivate(industry.modelType)}
      >
        <div className="grid md:grid-cols-2">
          {/* Image / 3D model */}
          <div className="relative h-64 md:h-80 overflow-hidden bg-card">
            {isActive ? (
              <motion.div
                className="absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0" style={{
                  background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
                }} />
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <IndustryCanvas type={industry.modelType} />
                </Suspense>
              </motion.div>
            ) : (
              <BlurImage
                src={industry.image}
                alt={industry.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-20" />
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col justify-center">
            <h3 className="font-semibold text-xl mb-2">{industry.name}</h3>
            <p className="text-sm text-foreground/70 mb-4 leading-relaxed">{industry.description}</p>
            <div className="px-4 py-2 border border-border inline-block mb-4" style={{ backgroundColor: "hsl(var(--forge-molten) / 0.08)" }}>
              <span className="text-technical text-xs font-semibold" style={{ color: "hsl(var(--forge-steel))" }}>{industry.highlight}</span>
            </div>
            <a href="#teklif" className="text-sm font-semibold text-primary hover:text-accent flex items-center gap-1.5 transition-colors">
              <span>{"Detaylı Bilgi"}</span> <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
