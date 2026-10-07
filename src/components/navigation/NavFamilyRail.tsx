import { useTranslation } from "react-i18next";
import type { CSSProperties, KeyboardEvent, RefObject } from "react";
import type { NavigationItem } from "./ia";

interface NavFamilyRailProps {
  groups: NavigationItem[];
  activeIndex: number;
  /** Index of the family that owns the CURRENT route, or -1. */
  currentIndex: number;
  onSelect: (index: number) => void;
  buttonRefs: RefObject<(HTMLButtonElement | null)[]>;
  reducedMotion: boolean;
}

/**
 * The route-family rail — the menu's primary axis.
 *
 * Engineering-sheet language: a mono index, a hairline under every row, and a
 * datum rule that draws itself across the active row. No icons, no chips, no
 * accent fill.
 *
 * Keyboard model is a roving tabindex toolbar: one Tab stop for the whole
 * rail, arrows/Home/End move between families. That is what lets the mobile
 * traversal spec walk 3 families → 15 categories → 48 detail links with Tab
 * alone.
 */
export function NavFamilyRail({
  groups,
  activeIndex,
  currentIndex,
  onSelect,
  buttonRefs,
  reducedMotion,
}: NavFamilyRailProps) {
  const { t } = useTranslation();
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
    <div className="tl-menu-family-rail" role="group" aria-label={t("Rota aileleri")}>
      {groups.map((item, index) => {
        const active = activeIndex === index;
        return (
          <button
            key={item.label}
            ref={(node) => { if (buttonRefs.current) buttonRefs.current[index] = node; }}
            type="button"
            onClick={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            aria-label={`${item.index} ${t(item.label)}`}
            aria-pressed={active}
            tabIndex={active ? 0 : -1}
            className={`tl-menu-family${active ? " is-active" : ""}${currentIndex === index ? " is-current" : ""}`}
            data-nav-family={item.label}
            // Rows resolve one `--tl-step` apart (navigation.css §04); under
            // reduced motion there is no reveal at all, not a delayed one.
            data-reveal={reducedMotion ? undefined : ""}
            style={{ "--i": index + 1 } as CSSProperties}
          >
            <span className="tl-menu-family-index">{item.index}</span>
            <span className="tl-menu-family-label">{t(item.label)}</span>
            <span className="tl-menu-family-meta" aria-hidden="true">
              {item.links
                ? <>{String(item.links.length).padStart(2, "0")} {t("SAYFA")}</>
                : <>
                    {String(item.children?.length ?? 0).padStart(2, "0")} {t("KATEGORİ")} ·{" "}
                    {String(item.children?.reduce((total, category) => total + category.links.length, 0) ?? 0).padStart(2, "0")} {t("SAYFA")}
                  </>}
            </span>
            {currentIndex === index && (
              <span className="tl-menu-here">{t("BURADASINIZ")}</span>
            )}
            <span className="tl-menu-family-datum" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
