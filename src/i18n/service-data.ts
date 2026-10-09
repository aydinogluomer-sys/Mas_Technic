import { categoryPages, type CategoryPageData } from "@/data/categoryPages";
import { servicePages, type ServicePageData } from "@/data/servicePages";
import type { EnCore } from "@/content/en/core";
import { useLocaleCore } from "./content";
import { mergeText, type TextOverlay } from "./localize";

/* The service and category records alone, for `ServiceDetail` and
   `CategoryPage`: the same records and overlay as `useSiteData()`, without
   importing the materials, blog, case and chat modules or the rest of the
   language bundle (JS budget on `/en/hizmetler/*`, Faz 6). */
export interface ServiceData {
  servicePages: readonly ServicePageData[];
  categoryPages: readonly CategoryPageData[];
  getPageBySlug: (slug: string) => ServicePageData | undefined;
}

function build(services: readonly ServicePageData[], categories: readonly CategoryPageData[]): ServiceData {
  return {
    servicePages: services,
    categoryPages: categories,
    getPageBySlug: (slug) => services.find((page) => page.slug === slug),
  };
}

const TURKISH = build(servicePages, categoryPages);
const overlay = <T,>(base: T, text: unknown) => mergeText(base, text as TextOverlay<T> | undefined);
const built = new WeakMap<EnCore, ServiceData>();

export function useServiceData(): ServiceData {
  const core = useLocaleCore();
  if (!core) return TURKISH;
  let data = built.get(core);
  if (!data) {
    data = build(
      servicePages.map((page) => overlay(page, core.services[page.slug])),
      categoryPages.map((page) => overlay(page, core.categories[`${page.prefix}/${page.slug}`])),
    );
    built.set(core, data);
  }
  return data;
}
