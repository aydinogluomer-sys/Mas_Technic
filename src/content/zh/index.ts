import core from "./core";
import type { EnContent } from "@/content/en";
import { blog1 } from "./blog1";
import { blog2 } from "./blog2";
import { families } from "./families";
import { materials } from "./materials";
import { cases } from "./cases";
import { chat } from "./chat";

/* The Simplified Chinese content bundle (L5), the same shape as the English one. Loaded
   only on `/zh` routes through `loadLocaleContent()`. Terms follow
   `docs/i18n/glossary-zh.md`. Completeness and number identity:
   `scripts/quality/locale-check.ts zh`. */
const zh: EnContent = {
  ...core,
  families,
  materials,
  blog: { ...blog1, ...blog2 },
  cases,
  chat,
};

export default zh;
