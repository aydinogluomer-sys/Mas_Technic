import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "mas-technic-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  /* Storage can be blocked (private mode, site-data policy): the theme then
     lasts the visit instead of taking the whole page down (L01 scenario). */
  let stored: Theme | null = null;
  try { stored = localStorage.getItem(STORAGE_KEY) as Theme | null; } catch { /* blocked */ }
  if (stored === "light" || stored === "dark") return stored;
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* blocked: not remembered */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}
