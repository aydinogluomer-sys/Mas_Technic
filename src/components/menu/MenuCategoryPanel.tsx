import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { NavigationItem } from "../navigation-data";
import { MENU_MOTION } from "./menu-tokens";

interface MenuCategoryPanelProps {
  group: NavigationItem;
  activeCategory: number;
  onCategoryChange: (index: number) => void;
  onNavigate: (path: string) => void;
  reducedMotion: boolean;
}

export function MenuCategoryPanel({ group, activeCategory, onCategoryChange, onNavigate, reducedMotion }: MenuCategoryPanelProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={group.label}
        data-menu-group={group.label}
        className="menu-categories"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, clipPath: "inset(100% 0 0 0)" }}
        animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -18, clipPath: "inset(0 0 100% 0)" }}
        transition={reducedMotion ? MENU_MOTION.reduced : { ...MENU_MOTION.swap, delay: MENU_MOTION.shellDelay + 0.08 }}
      >
        {group.children?.map((category, index) => {
          const open = activeCategory === index;
          const panelId = `menu-${group.label}-${index}`.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-");
          return (
            <motion.section
              key={category.path}
              className={`menu-category ${open ? "is-open" : ""}`}
              initial={reducedMotion ? false : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reducedMotion ? MENU_MOTION.reduced : { ...MENU_MOTION.swap, delay: MENU_MOTION.shellDelay + 0.12 + index * MENU_MOTION.itemStagger }}
            >
              <button
                type="button"
                onClick={() => onCategoryChange(index)}
                aria-expanded={open}
                aria-controls={panelId}
                className="menu-category-toggle"
                data-cursor="category"
              >
                <span className="menu-category-number">0{index + 1}</span>
                <span className="menu-category-icon">{category.icon}</span>
                <span>{category.label}</span>
                <ChevronDown className="menu-category-chevron" aria-hidden="true" />
              </button>
              <div id={panelId} hidden={!open}>
                {open && (
                  <motion.div
                    className="menu-category-details"
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? MENU_MOTION.reduced : { duration: 0.25 }}
                  >
                    <Link data-cursor="open" to={category.path} onClick={(event) => { event.preventDefault(); onNavigate(category.path); }} className="menu-category-landing">
                      {category.label} sayfası <ArrowUpRight className="size-3.5" />
                    </Link>
                    <ul>
                      {category.links.map((link, linkIndex) => (
                        <motion.li
                          key={link.path}
                          initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: reducedMotion ? 0 : linkIndex * MENU_MOTION.itemStagger }}
                        >
                          <Link data-cursor="open" to={link.path} onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}>
                            <span aria-hidden="true" />{link.label}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </motion.section>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
