import type { TextOverlay } from "@/i18n/localize";
import type { ServicePageData } from "@/data/servicePages";
import type { CategoryPageData } from "@/data/categoryPages";
import type { Material, MaterialCategoryPage } from "@/data/materialsData";
import type { BlogPost } from "@/data/blogData";
import type { CaseStudy } from "@/content/caseStudies";
import type { FaqEntry } from "@/data/chatFaqData";

/* Overlay shapes for the English content bundle. Each is the Turkish record's
   text, in the same structure; ids, slugs, paths and images are never
   repeated here (see `src/i18n/localize.ts`). */
export type ServiceText = TextOverlay<Omit<ServicePageData, "slug" | "category">>;
export type CategoryText = TextOverlay<Omit<CategoryPageData, "slug" | "prefix">>;
export type FamilyText = TextOverlay<Omit<MaterialCategoryPage, "slug" | "code" | "subcategoryKey" | "relatedCategories">>;
export type MaterialText = TextOverlay<Pick<Material, "name" | "propertyConditions" | "description" | "applications" | "advantages" | "limitations">>;
export type BlogText = TextOverlay<Omit<BlogPost, "slug" | "date" | "image" | "featured">>;
export type CaseText = TextOverlay<Omit<CaseStudy, "slug" | "kind">>;
export type ChatText = Omit<FaqEntry, never>;
