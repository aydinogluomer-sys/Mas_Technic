import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { CheckCircle2 } from "lucide-react";

interface ExportProgressProps {
  visible: boolean;
  fileName: string;
  progress?: number;
}

const ExportProgress = ({ visible, fileName, progress = 0 }: ExportProgressProps) => {
  const isComplete = progress >= 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20, transition: { duration: 0.3, delay: 0.8 } }}
          className="fixed bottom-0 left-0 right-0 z-50 h-10 flex items-center px-4"
          style={{ backgroundColor: "hsl(var(--forge-obsidian))" }}
        >
          {/* Progress bar */}
          <motion.div
            className="absolute left-0 top-0 h-full"
            style={{
              background: isComplete
                ? "linear-gradient(90deg, hsl(var(--status-success)), hsl(var(--status-success-bright)))"
                : "linear-gradient(90deg, hsl(var(--forge-molten)), hsl(var(--forge-amber)))",
              opacity: isComplete ? 0.25 : 0.2,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(progress * 100, 10)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          {/* Text */}
          <div className="relative z-10 flex items-center gap-2">
            {isComplete ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span
                  className="text-xs tracking-wide text-emerald-400"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  İndirme tamamlandı —{" "}
                  <span className="text-emerald-300">{fileName}</span>
                </span>
              </motion.div>
            ) : (
              <span
                className="text-xs tracking-wide"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "hsl(var(--forge-silver))",
                }}
              >
                Rapor hazırlanıyor...{" "}
                <span style={{ color: "hsl(var(--forge-molten))" }}>{fileName}</span>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { ExportProgress };
