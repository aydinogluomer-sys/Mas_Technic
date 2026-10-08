import { blogPosts, type BlogPost } from "@/data/blogData";
import { categoryPages, type CategoryPageData } from "@/data/categoryPages";
import { collectServiceFaqs, staticEntries, type FaqEntry } from "@/data/chatFaqData";
import { materialCategories, materialsData, type Material, type MaterialCategoryPage } from "@/data/materialsData";
import { servicePages, type ServicePageData } from "@/data/servicePages";
import { caseStudies, type CaseStudy } from "@/content/caseStudies";
import type { EnContent } from "@/content/en";
import { useLocaleContent } from "./content";
import { mergeText, type TextOverlay } from "./localize";

/* ══════════════════════════════════════════════════════════════════════════
   LOCALISED DATA (L01)

   Every public page reads its records through `useSiteData()`, never from
   the data modules directly. On a Turkish route that IS the data modules;
   on `/en` it is the same arrays with each record's English overlay laid
   over it (`mergeText`). The merge happens once per bundle and is cached,
   so ids, slugs, paths, images and numbers are the Turkish record's own.
   ══════════════════════════════════════════════════════════════════════════ */

export interface SiteData {
  servicePages: readonly ServicePageData[];
  categoryPages: readonly CategoryPageData[];
  materialCategories: readonly MaterialCategoryPage[];
  materialsData: readonly Material[];
  blogPosts: readonly BlogPost[];
  caseStudies: readonly CaseStudy[];
  faqEntries: readonly FaqEntry[];
  getPageBySlug: (slug: string) => ServicePageData | undefined;
  getPagesByCategory: (category: string) => ServicePageData[];
  findMaterialCategory: (slug: string) => MaterialCategoryPage | undefined;
  getMaterialsBySubcategory: (key: string) => Material[];
}

function build(
  services: readonly ServicePageData[],
  categories: readonly CategoryPageData[],
  families: readonly MaterialCategoryPage[],
  materials: readonly Material[],
  posts: readonly BlogPost[],
  cases: readonly CaseStudy[],
  faqEntries: readonly FaqEntry[],
): SiteData {
  return {
    servicePages: services,
    categoryPages: categories,
    materialCategories: families,
    materialsData: materials,
    blogPosts: posts,
    caseStudies: cases,
    faqEntries,
    getPageBySlug: (slug) => services.find((page) => page.slug === slug),
    getPagesByCategory: (category) => services.filter((page) => page.category === category),
    findMaterialCategory: (slug) => families.find((family) => family.slug === slug),
    getMaterialsBySubcategory: (key) => materials.filter((material) => material.subcategory === key),
  };
}

const TURKISH = build(
  servicePages, categoryPages, materialCategories, materialsData, blogPosts, caseStudies,
  [...staticEntries, ...collectServiceFaqs(servicePages)],
);

const overlay = <T,>(base: T, text: unknown) => mergeText(base, text as TextOverlay<T> | undefined);

/* One built data set per language bundle (L1), kept while that bundle is. */
const built = new WeakMap<EnContent, SiteData>();

function localizedData(en: EnContent): SiteData {
  const known = built.get(en);
  if (known) return known;
  const services = servicePages.map((page) => overlay(page, en.services[page.slug]));
  const data = build(
    services,
    categoryPages.map((page) => overlay(page, en.categories[`${page.prefix}/${page.slug}`])),
    materialCategories.map((family) => overlay(family, en.families[family.slug])),
    materialsData.map((material) => overlay(material, en.materials[material.id])),
    blogPosts.map((post) => overlay(post, en.blog[post.slug])),
    caseStudies.map((study) => overlay(study, en.cases[study.slug])),
    [...staticEntries.map((entry, index) => en.chat[String(index)] ?? entry), ...collectServiceFaqs(services)],
  );
  built.set(en, data);
  return data;
}

export function useSiteData(): SiteData {
  const bundle = useLocaleContent();
  return bundle ? localizedData(bundle) : TURKISH;
}
