import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import de from "./locales/de";
import ru from "./locales/ru";
import zh from "./locales/zh";

/* ══════════════════════════════════════════════════════════════════════════
   ONE-TAP LOCALISATION (round 2, item 14) — TR · EN · DE · RU · ZH

   Keys are the Turkish source strings themselves (`keySeparator: false`,
   `nsSeparator: false`), so a component wraps its existing copy in `t()` and
   Turkish needs no dictionary at all: a missing key renders the key, which IS
   the Turkish text. Scope: interface chrome (header, menu, footer, buttons,
   forms) and the landing. Long inner-page bodies stay Turkish.

   Figures are never translated as numbers: claims come from
   `src/content/claims.ts` and are interpolated (`{{value}}`), so every
   language states the same verified value.
   ══════════════════════════════════════════════════════════════════════════ */
export const LANGUAGES = [
  { code: "tr", label: "TR", name: "Türkçe" },
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "zh", label: "ZH", name: "中文" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const CJK_FONT_ID = "mas-font-noto-sc";

function syncDocument(language: string) {
  if (typeof document === "undefined") return;
  const code = language.split("-")[0];
  document.documentElement.lang = code === "zh" ? "zh-Hans" : code;
  /* Chinese needs a CJK face the Latin families do not carry. It is fetched
     only when Chinese is chosen, so no other visitor pays for it. */
  if (code === "zh" && !document.getElementById(CJK_FONT_ID)) {
    const link = document.createElement("link");
    link.id = CJK_FONT_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }
}

/* Translation audit: with `localStorage.mas_i18n_debug = "1"` every key a
   non-Turkish language cannot resolve is collected on `window.__i18nMissing`
   (used by e2e/polish/i18n-switch.spec.ts to prove the dictionaries are
   complete for the covered surfaces). Off for every real visitor. */
let auditMissing = false;
try { auditMissing = typeof window !== "undefined" && window.localStorage.getItem("mas_i18n_debug") === "1"; } catch { /* blocked */ }

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: {} },
      en: { translation: en },
      de: { translation: de },
      ru: { translation: ru },
      zh: { translation: zh },
    },
    supportedLngs: LANGUAGES.map((language) => language.code),
    nonExplicitSupportedLngs: true,
    fallbackLng: "tr",
    keySeparator: false,
    nsSeparator: false,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    /* Turkish is the site's language; another language is a visitor's
       explicit choice, remembered — never inferred from the browser. */
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "mas_lang",
      caches: ["localStorage"],
    },
    react: { useSuspense: false },
    saveMissing: auditMissing,
    missingKeyHandler: auditMissing
      ? (_languages, _namespace, key) => {
          if ((i18n.language ?? "tr").startsWith("tr")) return;
          const bag = ((window as unknown as { __i18nMissing?: Set<string> }).__i18nMissing ??= new Set<string>());
          bag.add(key);
        }
      : undefined,
  });

syncDocument(i18n.language || "tr");
i18n.on("languageChanged", syncDocument);

export default i18n;
