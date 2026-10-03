/** `https://host[:port]` with no trailing slash, or `null` if `value` is not a
    bare https origin. Pure — shared by `site-config.ts` and `vite.config.ts`. */
export function normalizeOrigin(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if ((url.pathname && url.pathname !== "/") || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}
