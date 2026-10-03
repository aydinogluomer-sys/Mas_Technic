import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ENGLISH_LIVE } from "@/lib/site-config";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { LANGUAGES, loadLanguage, type LanguageCode } from "@/i18n";
import { isPanelPath, normalizeLocale, switchLocalePath } from "@/i18n/locale";

/* L01: on a public route a language is an ADDRESS — choosing EN opens the same
   record under `/en`, choosing TR opens it without the prefix; the URL then
   drives the rendered language (see `useRouteLanguageReady` in App.tsx). On a
   panel route the address has no locale, so the choice only re-renders. The
   choice is remembered either way (`mas_lang`), for the panel. */
function useChooseLanguage() {
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  return (code: LanguageCode) => {
    if (isPanelPath(pathname)) { void loadLanguage(code); return; }
    try { window.localStorage.setItem("mas_lang", code); } catch { /* storage blocked */ }
    navigate(switchLocalePath(pathname, search, hash, normalizeLocale(code)));
  };
}

type LanguageSwitchProps = {
  className?: string;
  /** `inline`: the five codes in a row (menu). `dropdown`: one `TR ▾` control
      that opens the list (header bar, where the row did not fit its order). */
  variant?: "inline" | "dropdown";
};

/* TR · EN only (L01). See `useChooseLanguage` above for what a choice does. */
/* C3 — the switch is the only entry point to the English surface, so it is
   not rendered while English is unpublished (`ENGLISH_LIVE`). */
export function LanguageSwitch(props: LanguageSwitchProps) {
  return ENGLISH_LIVE ? <LanguageSwitchControl {...props} /> : null;
}

function LanguageSwitchControl({ className = "", variant = "inline" }: LanguageSwitchProps) {
  const { i18n, t } = useTranslation();
  const choose = useChooseLanguage();
  const current = (i18n.language ?? "tr").split("-")[0] as LanguageCode;

  if (variant === "dropdown") {
    return <LanguageDropdown className={className} current={current} label={t("Dil seçimi")} />;
  }

  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label={t("Dil seçimi")}>
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          lang={language.code}
          aria-pressed={current === language.code}
          aria-label={language.name}
          onClick={() => choose(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}

/* A listbox-button: the button names the current language, the list holds all
   five. Arrow keys move, Enter/Space choose, Escape and an outside click close
   and hand focus back to the button. */
function LanguageDropdown({ className, current, label }: { className: string; current: LanguageCode; label: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** Last pointer position seen over the list; reset on every open. */
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const listId = useId();
  const currentIndex = Math.max(0, LANGUAGES.findIndex((language) => language.code === current));
  const currentLanguage = LANGUAGES[currentIndex];

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const chooseLanguage = useChooseLanguage();
  const choose = useCallback((index: number) => {
    chooseLanguage(LANGUAGES[index].code);
    close(true);
  }, [close, chooseLanguage]);

  useEffect(() => {
    if (!open) return;
    pointerRef.current = null;
    setActive(currentIndex);
    listRef.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, currentIndex, close]);

  const onButtonKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = LANGUAGES.length - 1;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => (index >= last ? 0 : index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (index <= 0 ? last : index - 1)); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(last); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
    else if (event.key === "Escape") { event.preventDefault(); close(true); }
    else if (event.key === "Tab") { close(false); }
  };

  return (
    <div ref={rootRef} className={`lang-dropdown ${className}`.trim()} data-open={open || undefined}>
      <button
        ref={buttonRef}
        type="button"
        className="lang-dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${currentLanguage.name}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKey}
      >
        <span lang={currentLanguage.code}>{currentLanguage.label}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          className="lang-dropdown-list"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${LANGUAGES[active].code}`}
          onKeyDown={onListKey}
        >
          {LANGUAGES.map((language, index) => (
            <li
              key={language.code}
              id={`${listId}-${language.code}`}
              role="option"
              lang={language.code}
              aria-selected={language.code === current}
              data-active={index === active || undefined}
              /* QA01: only a pointer that really MOVED picks an option. The
                 list opens under a resting pointer; `pointerenter`, and the
                 synthetic pointer events Chromium sends after a layout change,
                 fired for whatever option lay beneath it and overrode the one
                 chosen with the arrow keys (measured: 1 run in 6–8). */
              onPointerMove={(event) => {
                const last = pointerRef.current;
                pointerRef.current = { x: event.clientX, y: event.clientY };
                if (last && (last.x !== event.clientX || last.y !== event.clientY)) setActive(index);
              }}
              onClick={() => choose(index)}
            >
              <span>{language.label}</span>
              <small>{language.name}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
