import type { EnContent } from "@/content/en";
import { part1 } from "./services/part1";
import { part2 } from "./services/part2";
import { part3 } from "./services/part3";
import { part4 } from "./services/part4";
import { part5 } from "./services/part5";
import { part6 } from "./services/part6";
import { part7 } from "./services/part7";
import { part8 } from "./services/part8";
import { categories } from "./categories";
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
  services: { ...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8 },
  categories,
  families,
  materials,
  blog: { ...blog1, ...blog2 },
  cases,
  chat,
};

export default zh;
