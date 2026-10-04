/**
 * The landing hero image as a responsive set, shared by `TechnicalHero.tsx`
 * (`<picture>` srcset) and `vite.config.ts` (the matching preload), so the
 * preloaded candidate is always the one the page renders.
 *
 * Widths follow the measured display size (Chromium, DPR 1): the image is
 * `100vw − 42px` wide up to 767px (333px at 375) and about 55vw above, scaled
 * by the stage's 1.16 transform and capped at 890px (797px at 1440). AVIF
 * first, WebP for browsers without AVIF; 1672 is the original.
 * Files: src/assets/technical-landing/hero-manifold-v1[-<width>].{avif,webp},
 * encoded with Pillow (AVIF q55, WebP q78).
 */
export const HERO_IMAGE_WIDTHS = [480, 800, 1200, 1672] as const;
export type HeroImageWidth = (typeof HERO_IMAGE_WIDTHS)[number];

export const HERO_IMAGE_SIZES = "(max-width: 767px) calc(100vw - 42px), min(55vw, 890px)";

export const heroImageFile = (width: HeroImageWidth, ext: "avif" | "webp") =>
  width === 1672 ? `hero-manifold-v1.${ext}` : `hero-manifold-v1-${width}.${ext}`;

export const heroSrcSet = (urls: Record<HeroImageWidth, string>) =>
  HERO_IMAGE_WIDTHS.map((width) => `${urls[width]} ${width}w`).join(", ");
