import type { BlogText, CaseText, CategoryText, ChatText, FamilyText, MaterialText, ServiceText } from "./types";
import { part1 } from "./services/part1";
import { part2 } from "./services/part2";
import { part3 } from "./services/part3";
import { part4 } from "./services/part4";
import { part5 } from "./services/part5";
import { part6 } from "./services/part6";
import { part7 } from "./services/part7";
import { part8 } from "./services/part8";
import { categories } from "./categories";
import { families } from "./families";
import { materials } from "./materials";
import { blog1 } from "./blog1";
import { blog2 } from "./blog2";
import { cases } from "./cases";
import { chat } from "./chat";

/* The English content bundle (L01). Loaded only on `/en` routes through
   `loadEnContent()` in `src/i18n/content.ts`. Completeness and number
   identity: `scripts/quality/locale-check.ts`. */
const en = {
  services: { ...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8 } as Record<string, ServiceText>,
  categories: categories as Record<string, CategoryText>,
  families: families as Record<string, FamilyText>,
  materials: materials as Record<string, MaterialText>,
  blog: { ...blog1, ...blog2 } as Record<string, BlogText>,
  cases: cases as Record<string, CaseText>,
  chat: chat as Record<string, ChatText>,
};

export type EnContent = typeof en;
export default en;
