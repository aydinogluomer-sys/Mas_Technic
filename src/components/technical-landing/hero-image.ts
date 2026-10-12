/**
 * The landing hero image as a responsive set, shared by `TechnicalHero.tsx`
 * (`<picture>` srcset) and `vite.config.ts` (the matching preload), so the
 * preloaded candidate is always the one the page renders.
 *
 * The entire registered plane is 138% of the stage width. The stage uses
 * eight of twelve master columns on desktop, four of six on tablet, and the
 * full four-column field on mobile. These expressions include the unchanged
 * rail and sheet rules; the capped sheet remains 1600px wide.
 * AVIF first, WebP for browsers without AVIF; 1672 is the original.
 * Files: src/assets/technical-landing/hero-manifold-v1[-<width>].{avif,webp},
 * encoded with Pillow (AVIF q55, WebP q78).
 */
export const HERO_IMAGE_WIDTHS = [480, 800, 1200, 1672] as const;
export type HeroImageWidth = (typeof HERO_IMAGE_WIDTHS)[number];

export const HERO_IMAGE_SIZES = "(max-width: 767px) calc((100vw - 42px) * 1.38), (max-width: 1180px) calc((100vw - 58px) * 0.92), calc((min(100vw, 1600px) - 66px) * 0.92)";

export const heroImageFile = (width: HeroImageWidth, ext: "avif" | "webp") =>
  width === 1672 ? `hero-manifold-v1.${ext}` : `hero-manifold-v1-${width}.${ext}`;

export const heroSrcSet = (urls: Record<HeroImageWidth, string>) =>
  HERO_IMAGE_WIDTHS.map((width) => `${urls[width]} ${width}w`).join(", ");
