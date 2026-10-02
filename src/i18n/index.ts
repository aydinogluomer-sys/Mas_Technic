import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { isEnContentLoaded, loadEnContent } from "./content";
import { isPanelPath, localeFromPath, normalizeLocale, type PublicLocale } from "./locale";

/* ══════════════════════════════════════════════════════════════════════════
   LOCALISATION — TR · EN (L01; DE / RU / ZH dictionaries are kept on disk
   but no longer offered or loaded: a language is offered only when the whole
   public surface exists in it)

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
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

function syncDocument(language: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = normalizeLocale(language);
}

/* Translation audit: with `localStorage.mas_i18n_debug = "1"` every key a
   non-Turkish language cannot resolve is collected on `window.__i18nMissing`
   (used by e2e/polish/i18n-switch.spec.ts to prove the dictionaries are
   complete for the covered surfaces). Off for every real visitor. */
let auditMissing = false;
try { auditMissing = typeof window !== "undefined" && window.localStorage.getItem("mas_i18n_debug") === "1"; } catch { /* blocked */ }

/* The language a page opens in. Public route: the URL (`/en…` → en, else
   tr) — a stored preference never overrides an address. Panel / admin
   route: the remembered choice, normalised so an old DE / RU / ZH value
   falls back to Turkish. */
export function initialLanguage(): PublicLocale {
  if (typeof window === "undefined") return "tr";
  const { pathname } = window.location;
  if (!isPanelPath(pathname)) return localeFromPath(pathname);
  try { return normalizeLocale(window.localStorage.getItem("mas_lang")); } catch { return "tr"; }
}

void i18n
  .use(initReactI18next)
  .init({
    lng: initialLanguage(),
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
};

/** Switch the rendered language WITHOUT remembering it — what a route change
    does. Waits for the dictionary AND, for English, the content bundle
    (`./content`), so no Turkish frame shows in between. */
export async function applyLanguage(language: PublicLocale) {
  await Promise.all([ensureDictionary(language), language === "en" ? loadEnContent() : null]);
  /* `resolvedLanguage` too: on a direct `/en` load i18next starts in `en`
     before the dictionary exists and resolves to the Turkish fallback; the
     bundle arriving later does not re-resolve it, so the language is set
     again once the dictionary is in. */
  if (normalizeLocale(i18n.language) !== language || normalizeLocale(i18n.resolvedLanguage) !== language) {
    await i18n.changeLanguage(language);
  }
}

/** True once the language the page needs is rendered with its dictionary. */
export function isLanguageReady(language: PublicLocale): boolean {
  return normalizeLocale(i18n.language) === language
    && normalizeLocale(i18n.resolvedLanguage) === language
    && (language === "tr" || (i18n.hasResourceBundle(language, "translation") && isEnContentLoaded()));
}

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
