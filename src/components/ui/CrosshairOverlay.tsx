import { motion, type MotionValue } from "framer-motion";

interface CrosshairOverlayProps {
  opacity?: MotionValue<number>;
  className?: string;
}

export const CrosshairOverlay = ({ opacity, className = "" }: CrosshairOverlayProps) => {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none z-[8] ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Horizontal line */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            width: 60,
            height: 1,
            left: -30,
            background: `linear-gradient(90deg, transparent, var(--text-hint), transparent)`,
          }}
        />
        {/* Vertical line */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: 1,
            height: 60,
            top: -30,
            background: `linear-gradient(180deg, transparent, var(--text-hint), transparent)`,
          }}
        />
        {/* Corner brackets */}
        {[
          { top: -20, left: -20, borderTop: "1px solid", borderLeft: "1px solid" },
          { top: -20, right: -20, borderTop: "1px solid", borderRight: "1px solid" },
          { bottom: -20, left: -20, borderBottom: "1px solid", borderLeft: "1px solid" },
          { bottom: -20, right: -20, borderBottom: "1px solid", borderRight: "1px solid" },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: 12,
              height: 12,
              borderColor: "var(--text-vignette)",
              ...s,
            } as React.CSSProperties}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Corner coordinate labels */}
      <span
        className="absolute bottom-4 left-4 font-mono text-[9px] tracking-[0.2em]"
        style={{ color: "var(--text-vignette)" }}
      >
        X:0.000 Y:0.000 Z:0.000
      </span>
      <span
        className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.2em]"
        style={{ color: "var(--text-vignette)" }}
      >
        ±0.005mm
      </span>
    </motion.div>
  );
};
