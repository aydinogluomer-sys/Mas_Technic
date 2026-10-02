import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { NAV_MOTION } from "./motion";

interface NavTriggerProps {
  open: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
  triggerRef: RefObject<HTMLButtonElement>;
}

/**
 * The one control that opens the global navigation.
 *
 * It is deliberately the THIRD tabbable element of every public page
 * (skip link → brand → trigger). `e2e/fullscreen-menu.spec.ts` locks that
 * position, which is why the header bar carries no other links: the whole
 * information architecture lives one keypress away instead of half in a bar
 * and half in an overlay.
 *
 * Three rules, not an icon: closed they read as a stacked dimension set,
 * open they cross into a datum mark.
 */
export function NavTrigger({ open, reducedMotion, onToggle, triggerRef }: NavTriggerProps) {
  const { t } = useTranslation();
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="fullscreen-navigation"
      aria-label={open ? t("Menüyü kapat") : t("Menüyü aç")}
      className="tl-menu-trigger"
      data-menu-trigger
    >
      <span className="tl-menu-trigger-label">{open ? t("KAPAT") : t("MENÜ")}</span>
      <span className="tl-menu-trigger-rules" aria-hidden="true">
        {[0, 1, 2].map((line) => (
          <motion.span
            key={line}
            animate={open
              ? line === 0
                ? { top: 8, width: 22, rotate: 45 }
                : line === 1
                  ? { opacity: 0, width: 10, x: 4 }
                  : { top: 8, width: 22, rotate: -45 }
              : { top: line * 8, width: line === 1 ? 14 : 22, rotate: 0, opacity: 1, x: 0 }}
            transition={reducedMotion ? NAV_MOTION.reduced : NAV_MOTION.micro}
          />
        ))}
      </span>
    </button>
  );
}
