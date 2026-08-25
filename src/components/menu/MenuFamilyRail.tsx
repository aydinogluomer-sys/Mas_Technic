import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { KeyboardEvent, RefObject } from "react";
import type { NavigationItem } from "../navigation-data";
import { MENU_MOTION } from "./menu-tokens";

interface MenuFamilyRailProps {
  groups: NavigationItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  buttonRefs: RefObject<(HTMLButtonElement | null)[]>;
  reducedMotion: boolean;
}

export function MenuFamilyRail({ groups, activeIndex, onSelect, buttonRefs, reducedMotion }: MenuFamilyRailProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % groups.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + groups.length) % groups.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = groups.length - 1;
    else return;
    event.preventDefault();
    onSelect(next);
    buttonRefs.current?.[next]?.focus();
  };

  return (
    <div className="menu-family-rail" role="group" aria-label="Üretim aileleri">
      {groups.map((item, index) => {
        const active = activeIndex === index;
        return (
          <motion.button
            key={item.label}
            ref={(node) => { if (buttonRefs.current) buttonRefs.current[index] = node; }}
            type="button"
            onClick={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            aria-label={`0${index + 1} ${item.label}`}
            aria-pressed={active}
            tabIndex={active ? 0 : -1}
            className={`menu-family ${active ? "is-active" : ""}`}
            data-cursor="family"
            initial={reducedMotion ? false : { opacity: 0, y: 24, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            transition={reducedMotion ? MENU_MOTION.reduced : { ...MENU_MOTION.swap, delay: MENU_MOTION.shellDelay + index * MENU_MOTION.railStagger }}
          >
            <span className="menu-family-index">0{index + 1}</span>
            <span className="menu-family-label">{item.label}</span>
            <span className="menu-family-datum" aria-hidden="true"><i /></span>
            <ArrowUpRight className="menu-family-arrow" aria-hidden="true" />
          </motion.button>
        );
      })}
    </div>
  );
}
