/* ══════════════════════════════════════════════════════════════════════════
   CONTENT LOCALISATION (L01)

   The data modules stay Turkish and stay the source of every id, slug, path,
   image and number. An English overlay carries ONLY the reader-facing text,
   in the same shape, and `mergeText()` lays it over the Turkish record:

     · strings          → the overlay's string
     · arrays           → merged element by element (same length — checked by
                          `e2e/locale-content.spec.ts`)
     · plain objects    → merged key by key; keys the overlay omits (`path`,
                          `id`, `image`, `href`, …) keep the Turkish value

   So a link keeps its route, a table keeps its row count, and an English page
   cannot gain a capacity figure the Turkish page withdrew: the numbers in each
   overlay are checked against the Turkish record (same test).
   ══════════════════════════════════════════════════════════════════════════ */

export type TextOverlay<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly TextOverlay<U>[]
    : T extends object
      ? { [K in keyof T]?: TextOverlay<T[K]> }
      : T;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function mergeText<T>(base: T, overlay: TextOverlay<T> | undefined): T {
  if (overlay === undefined || overlay === null) return base;
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return base.map((item, index) => mergeText(item, (overlay as unknown[])[index] as TextOverlay<typeof item>)) as T;
  }
  if (isPlainObject(base) && isPlainObject(overlay)) {
    const out: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(overlay)) {
      out[key] = mergeText((base as Record<string, unknown>)[key], value as never);
    }
    return out as T;
  }
  if (typeof base === "string" && typeof overlay === "string") return overlay as T;
  return base;
}
