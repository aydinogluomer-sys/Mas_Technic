import { motion, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface HUDDataPoint {
  label: string;
  value: string;
  unit?: string;
}

interface HUDOverlayProps {
  data: HUDDataPoint[];
  progress?: MotionValue<number>;
  opacity?: MotionValue<number>;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const positionClasses: Record<string, string> = {
  "top-left": "top-6 left-6",
  "top-right": "top-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "bottom-right": "bottom-6 right-6",
};

export const HUDOverlay = ({
  data,
  opacity,
  position = "top-left",
  className = "",
}: HUDOverlayProps) => {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} z-10 pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div
        className="p-3 space-y-2 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{
          backgroundColor: "var(--overlay-dark-mid)",
          border: `1px solid var(--surface-border)`,
          backdropFilter: "blur(4px)",
        }}
      >
        {data.map((d, i) => (
          <motion.div
            key={d.label}
            className="flex items-baseline gap-3"
            initial={reduced ? {} : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <span style={{ color: "var(--text-muted)" }}>{d.label}</span>
            <span className="ml-auto font-bold" style={{ color: "var(--heat-molten)" }}>
              {d.value}
            </span>
            {d.unit && (
              <span style={{ color: "var(--text-hint)" }}>{d.unit}</span>
            )}
          </motion.div>
        ))}

        {/* Animated scan line */}
        {!reduced && (
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ backgroundColor: "var(--heat-molten)", opacity: 0.3 }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </motion.div>
  );
};
