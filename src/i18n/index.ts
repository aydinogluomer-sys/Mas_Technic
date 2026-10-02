import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

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
    /* Only Turkish ships with the app, and it is empty (keys are the Turkish
       text). Each other dictionary is its own chunk, fetched when that
       language is chosen — see `loadLanguage`. */
    resources: { tr: { translation: {} } },
    partialBundledLanguages: true,
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
      /* Nothing is written on load: `mas_lang` exists only once a visitor has
         tapped a language (see `loadLanguage`), as /cerez-politikasi says. */
      caches: [],
    },
    /* Re-render when a dictionary arrives after the language was set (a
       returning visitor whose choice was remembered). */
    react: { useSuspense: false, bindI18nStore: "added" },
    saveMissing: auditMissing,
    missingKeyHandler: auditMissing
      ? (_languages, _namespace, key) => {
          const code = (i18n.language ?? "tr").split("-")[0];
          /* Before its dictionary has arrived every key is "missing"; only a
             key the loaded dictionary lacks is a real gap. */
          if (code === "tr" || !i18n.hasResourceBundle(code, "translation")) return;
          const bag = ((window as unknown as { __i18nMissing?: Set<string> }).__i18nMissing ??= new Set<string>());
          bag.add(key);
        }
      : undefined,
  });

const DICTIONARIES: Record<Exclude<LanguageCode, "tr">, () => Promise<{ default: Record<string, string> }>> = {
  en: () => import("./locales/en"),
  de: () => import("./locales/de"),
  ru: () => import("./locales/ru"),
  zh: () => import("./locales/zh"),
};

async function ensureDictionary(language: string) {
  const code = language.split("-")[0] as LanguageCode;
  if (code === "tr" || !(code in DICTIONARIES) || i18n.hasResourceBundle(code, "translation")) return;
  const { default: dictionary } = await DICTIONARIES[code as Exclude<LanguageCode, "tr">]();
  i18n.addResourceBundle(code, "translation", dictionary, true, true);
}

/* The switch waits for the dictionary so a tap goes straight from one
   language to the other, without a Turkish frame in between. */
export async function loadLanguage(language: LanguageCode) {
  await ensureDictionary(language);
  await i18n.changeLanguage(language);
  try { window.localStorage.setItem("mas_lang", language); } catch { /* storage blocked: the choice lasts this visit */ }
}

syncDocument(i18n.language || "tr");
void ensureDictionary(i18n.language || "tr");
i18n.on("languageChanged", (language) => {
  syncDocument(language);
  void ensureDictionary(language);
});

export default i18n;
