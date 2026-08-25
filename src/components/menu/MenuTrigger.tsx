import { motion } from "framer-motion";
import type { RefObject } from "react";

interface MenuTriggerProps {
  open: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
  triggerRef: RefObject<HTMLButtonElement>;
}

export function MenuTrigger({ open, reducedMotion, onToggle, triggerRef }: MenuTriggerProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="fullscreen-navigation"
      aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
      className="group relative z-[10020] flex min-h-12 min-w-12 items-center justify-center gap-3 px-2 text-current md:min-w-[116px]"
      data-menu-trigger
    >
      <span className="hidden font-mono text-[11px] font-bold uppercase tracking-[0.14em] md:block">
        {open ? "Kapat" : "Menü"}
      </span>
      <span className="relative block h-4 w-7" aria-hidden="true">
        {[0, 1, 2].map((line) => (
          <motion.span
            key={line}
            className="absolute right-0 block h-px bg-current"
            animate={open
              ? line === 0
                ? { top: 7, width: 26, rotate: 45 }
                : line === 1
                  ? { opacity: 0, width: 12, x: 5 }
                  : { top: 7, width: 26, rotate: -45 }
              : { top: line * 7, width: line === 1 ? 18 : 28, rotate: 0, opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0.06 : 0.28 }}
          />
        ))}
      </span>
    </button>
  );
}
