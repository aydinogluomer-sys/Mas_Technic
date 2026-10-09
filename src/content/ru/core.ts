import type { EnCore } from "@/content/en/core";
import { part1 } from "./services/part1";
import { part2 } from "./services/part2";
import { part3 } from "./services/part3";
import { part4 } from "./services/part4";
import { part5 } from "./services/part5";
import { part6 } from "./services/part6";
import { part7 } from "./services/part7";
import { part8 } from "./services/part8";
import { categories } from "./categories";

/* Services and categories: the part of the bundle a service or category page
   reads, loaded on its own (`useLocaleCore()`, `src/i18n/content.ts`) so those
   pages skip families, materials, blog, cases and chat. `index.ts` spreads it. */
const core: EnCore = {
  services: { ...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...part7, ...part8 },
  categories,
};

export default core;
