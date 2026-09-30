import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";

/* One tap per language, no menu to open: the five codes sit in a row and the
   current one is marked. Switching re-renders in place — no reload, no route
   change — and is remembered (`localStorage.mas_lang`). */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "tr").split("-")[0];
  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label={t("Dil seçimi")}>
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          lang={language.code}
          aria-pressed={current === language.code}
          aria-label={language.name}
          onClick={() => { void i18n.changeLanguage(language.code); }}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}
