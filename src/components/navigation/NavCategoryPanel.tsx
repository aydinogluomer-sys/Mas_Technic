import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { NavigationItem } from "./ia";
import { NAV_MOTION } from "./motion";

interface NavCategoryPanelProps {
  group: NavigationItem;
  activeCategory: number;
  currentPath: string;
  onCategoryChange: (index: number) => void;
  onNavigate: (path: string) => void;
  reducedMotion: boolean;
}

/** `05` from `/hizmetler/kategori/x` → a stable two-digit sheet index. */
const pad = (index: number) => String(index + 1).padStart(2, "0");

/**
 * The category column: a single-open accordion, drawn as a numbered parts
 * list. Each open category exposes its own landing page plus its detail
 * routes, so no page in the family is more than two keystrokes from the rail.
 */
export function NavCategoryPanel({
  group,
  activeCategory,
  currentPath,
  onCategoryChange,
  onNavigate,
  reducedMotion,
}: NavCategoryPanelProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={group.label}
        data-menu-group={group.label}
        className="tl-menu-categories"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        transition={reducedMotion ? NAV_MOTION.reduced : NAV_MOTION.close}
      >
        <header className="tl-menu-panel-head" aria-hidden="true">
          <span>{group.index}</span>
          <strong>{t(group.label)}</strong>
          <small>{String(group.children?.length ?? 0).padStart(2, "0")} {t("KATEGORİ")}</small>
        </header>
        {group.children?.map((category, index) => {
          const open = activeCategory === index;
          const panelId = `nav-panel-${group.index}-${index}`;
          const toggleId = `nav-toggle-${group.index}-${index}`;
          const categoryIsCurrent = currentPath === category.path;
          return (
            <section
              key={category.path}
              className={`tl-menu-category${open ? " is-open" : ""}`}
            >
              <button
                type="button"
                id={toggleId}
                onClick={() => onCategoryChange(index)}
                aria-expanded={open}
                aria-controls={panelId}
                className="tl-menu-category-toggle"
                data-nav-category={category.label}
              >
                <span className="tl-menu-category-index">{pad(index)}</span>
                <span className="tl-menu-category-label">{t(category.label)}</span>
                <span className="tl-menu-category-count" aria-hidden="true">
                  {String(category.links.length).padStart(2, "0")}
                </span>
              </button>
              <div id={panelId} hidden={!open}>
                {open && (
                  <div className="tl-menu-category-details">
                    <Link
                      className="tl-menu-category-landing"
                      data-nav-category-landing
                      to={category.path}
                      aria-current={categoryIsCurrent ? "page" : undefined}
                      onClick={(event) => { event.preventDefault(); onNavigate(category.path); }}
                    >
                      <span aria-hidden="true">↳</span>
                      {t("{{name}} kategorisi", { name: t(category.label) })}
                    </Link>
                    <ul data-nav-detail-list>
                      {category.links.map((link) => (
                        <li key={link.path}>
                          <Link
                            to={link.path}
                            aria-current={currentPath === link.path ? "page" : undefined}
                            onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}
                          >
                            <span className="tl-menu-tick" aria-hidden="true" />
                            {t(link.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
