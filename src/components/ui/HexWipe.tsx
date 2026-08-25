import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

interface HexWipeProps {
  children: ReactNode;
  isActive: boolean;
  duration?: number;
  className?: string;
}

const HEX_PATH = "M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z";
const EASE = [0.76, 0, 0.24, 1] as [number, number, number, number];

const HexWipe = ({ children, isActive, duration = 0.8, className = "" }: HexWipeProps) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          className={`relative overflow-hidden ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Hex clip-path wipe overlay */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ clipPath: `polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)` }}
            animate={{
              clipPath: `polygon(50% -50%, 150% 0%, 150% 100%, 50% 150%, -50% 100%, -50% 0%)`,
            }}
            exit={{
              clipPath: `polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)`,
            }}
            transition={{ duration, ease: EASE }}
            style={{ backgroundColor: "hsl(var(--forge-obsidian))" }}
          />

          {/* Content underneath */}
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: duration * 0.6, delay: duration * 0.3, ease: EASE }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Standalone hex wipe transition overlay — use between page/section transitions.
 * Renders a full-screen hex-shaped expanding mask.
 */
const HexWipeOverlay = ({
  isVisible,
  duration = 0.8,
  onComplete,
}: {
  isVisible: boolean;
  duration?: number;
  onComplete?: () => void;
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{ backgroundColor: "hsl(var(--forge-obsidian))" }}
          initial={{
            clipPath: `polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)`,
          }}
          animate={{
            clipPath: `polygon(50% -50%, 150% 0%, 150% 100%, 50% 150%, -50% 100%, -50% 0%)`,
          }}
          exit={{
            clipPath: `polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)`,
          }}
          transition={{ duration, ease: EASE }}
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  );
};

export { HexWipe, HexWipeOverlay };
