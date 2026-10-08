import type { EnContent } from "@/content/en";
import { part1 } from "./services/part1";
import { part2 } from "./services/part2";
import { part3 } from "./services/part3";
import { part4 } from "./services/part4";
import { part5 } from "./services/part5";
import { part6 } from "./services/part6";
import { part7 } from "./services/part7";
import { part8 } from "./services/part8";

/* The German content bundle (L3), the same shape as the English one. Loaded
   only on `/de` routes through `loadLocaleContent()`. Sections still empty
   here read the Turkish records until they are translated (L3c); terms
   follow `docs/i18n/glossary-de.md`. Completeness and number identity:
   `scripts/quality/locale-check.ts de`. */
const de: EnContent = {
  services: { ...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8 },
  categories: {},
  families: {},
  materials: {},
  blog: {},
  cases: {},
  chat: {},
};

export default de;
