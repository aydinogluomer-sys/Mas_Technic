import core from "./core";
import type { EnContent } from "@/content/en";
import { families } from "./families";
import { materials } from "./materials";
import { blog1 } from "./blog1";
import { blog2 } from "./blog2";
import { cases } from "./cases";
import { chat } from "./chat";

/* The German content bundle (L3), the same shape as the English one. Loaded
   only on `/de` routes through `loadLocaleContent()`. Terms follow
   `docs/i18n/glossary-de.md`. Completeness and number identity:
   `scripts/quality/locale-check.ts de`. */
const de: EnContent = {
  ...core,
  families,
  materials,
  blog: { ...blog1, ...blog2 },
  cases,
  chat,
};

export default de;
