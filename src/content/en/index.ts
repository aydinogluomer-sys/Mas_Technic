import core from "./core";
import type { BlogText, CaseText, ChatText, FamilyText, MaterialText } from "./types";
import { families } from "./families";
import { materials } from "./materials";
import { blog1 } from "./blog1";
import { blog2 } from "./blog2";
import { cases } from "./cases";
import { chat } from "./chat";

/* The English content bundle (L01). Loaded only on `/en` routes through
   `loadLocaleContent()` in `src/i18n/content.ts`. Completeness and number
   identity: `scripts/quality/locale-check.ts`. */
const en = {
  ...core,
  families: families as Record<string, FamilyText>,
  materials: materials as Record<string, MaterialText>,
  blog: { ...blog1, ...blog2 } as Record<string, BlogText>,
  cases: cases as Record<string, CaseText>,
  chat: chat as Record<string, ChatText>,
};

export type EnContent = typeof en;
export default en;
