import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/i18n/LocaleLink";
import type { NavigationItem } from "./ia";

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

/** The leave animation is `--tl-dur-short` (350ms); this is the floor if `animationend` never comes. */
const LEAVE_FALLBACK_MS = 500;

/**
 * The category column: a single-open accordion, drawn as a numbered parts
 * list. Each open category exposes its own landing page plus its detail
 * routes, so no page in the family is more than two keystrokes from the rail.
 *
 * A family change swaps the column exit-then-enter: the old family's column
 * leaves with the props it had, and only then does the new one enter
 * (navigation.css §05). Reduced motion swaps at once. The first column of an
 * opening menu does not enter at all; the sheet wipe already reveals it.
 */
export function NavCategoryPanel(props: NavCategoryPanelProps) {
  const { group, reducedMotion } = props;
  const [shownLabel, setShownLabel] = useState(group.label);
  const [entering, setEntering] = useState(false);
  const leaving = !reducedMotion && group.label !== shownLabel;
  const shown = useRef(props);
  if (!leaving) shown.current = props;

  const finishLeave = useCallback(() => {
    setShownLabel(group.label);
    setEntering(true);
  }, [group.label]);
  useEffect(() => {
    if (reducedMotion && group.label !== shownLabel) setShownLabel(group.label);
  }, [group.label, reducedMotion, shownLabel]);
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(finishLeave, LEAVE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [finishLeave, leaving]);

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (leaving) finishLeave();
    else setEntering(false);
  };

  return (
    <CategoryColumn
      key={shown.current.group.label}
      {...shown.current}
      phase={leaving ? "leave" : entering && !reducedMotion ? "enter" : undefined}
      onAnimationEnd={onAnimationEnd}
    />
  );
}

function CategoryColumn({
  group,
  activeCategory,
  currentPath,
  onCategoryChange,
  onNavigate,
  phase,
  onAnimationEnd,
}: NavCategoryPanelProps & { phase?: "enter" | "leave"; onAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void }) {
  const { t } = useTranslation();
  return (
      <div
        data-menu-group={group.label}
        className="tl-menu-categories"
        data-phase={phase}
        onAnimationEnd={onAnimationEnd}
      >
        <header className="tl-menu-panel-head" aria-hidden="true">
          <span>{group.index}</span>
          <strong>{t(group.label)}</strong>
          <small>
            {group.links
              ? `${String(group.links.length).padStart(2, "0")} ${t("SAYFA")}`
              : `${String(group.children?.length ?? 0).padStart(2, "0")} ${t("KATEGORİ")}`}
          </small>
        </header>
        {/* A flat family (04 Kurumsal): its pages are the rows themselves,
            drawn like category rows so the panel keeps one rhythm. */}
        {group.links && (
          <ul className="tl-menu-pages" data-nav-page-list>
            {group.links.map((link, index) => (
              <li key={link.path} className="tl-menu-category">
                <Link
                  to={link.path}
                  className="tl-menu-category-toggle tl-menu-page"
                  data-nav-page={link.label}
                  aria-current={currentPath === link.path ? "page" : undefined}
                  onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}
                >
                  <span className="tl-menu-category-index" aria-hidden="true">{pad(index)}</span>
                  <span className="tl-menu-category-label">{t(link.label)}</span>
                  <span className="tl-menu-category-count" aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
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
      </div>
  );
}
