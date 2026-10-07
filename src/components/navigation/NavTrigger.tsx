import { useTranslation } from "react-i18next";
import type { CSSProperties, RefObject } from "react";

interface NavTriggerProps {
  open: boolean;
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
 * open they cross into a datum mark. The header renders a closed trigger and
 * the dialog an open one, so a trigger never changes state after mounting:
 * the rules are static styles, not an animation.
 */
const RULES: Record<"open" | "closed", CSSProperties[]> = {
  closed: [
    { top: 0, width: 22, transform: "none", opacity: 1 },
    { top: 8, width: 14, transform: "none", opacity: 1 },
    { top: 16, width: 22, transform: "none", opacity: 1 },
  ],
  open: [
    { top: 8, width: 22, transform: "rotate(45deg)" },
    { width: 10, transform: "translateX(4px)", opacity: 0 },
    { top: 8, width: 22, transform: "rotate(-45deg)" },
  ],
};

export function NavTrigger({ open, onToggle, triggerRef }: NavTriggerProps) {
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
        {RULES[open ? "open" : "closed"].map((style, line) => <span key={line} style={style} />)}
      </span>
    </button>
  );
}
