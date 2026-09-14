import { useState, forwardRef } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   BLUR IMAGE — the progressive `<img>` primitive, and the one place a
   missing picture is allowed to fail.

   Phase 10-2a.

   `width` / `height` are the ASSET's intrinsic pixels, threaded through from
   the caller so the browser can reserve the box before the bytes arrive
   (the attributes set `aspect-ratio`; the caller's CSS still owns the final
   size). `srcSet` / `sizes` are passed straight through for surfaces that
   render at more than one width.

   `onError` never leaves the browser's broken-image glyph on a public page:
   the `<img>` is replaced by a shell-toned block that prints the alt text in
   the sheet's mono label voice. The block reads as a labelled empty plate —
   which is what a missing figure is — rather than as a bug. `role="img"` +
   `aria-label` keep the alt text in the accessibility tree, so a screen
   reader hears exactly what it would have heard from the picture.

   `coverSizes()` builds a `sizes` attribute for `object-fit: cover` boxes.
   Cover scales the source to whichever axis demands MORE, so a fixed-height
   frame that is narrower than its picture's aspect needs `height × aspect`
   CSS px of source, not the frame's width — at 375 the shell plate is
   331×318 and shows the central 58% of a 16:9 image drawn 568px wide.
   A `sizes` that said 331px there would have the browser pick a candidate
   that is then upscaled 1.7× before it is even cropped. The helper lives
   here because it is an image-primitive concern; its natural home is the
   plate component, which this packet may not edit.
   ══════════════════════════════════════════════════════════════════════════ */

interface BlurImageProps {
  src: string;
  alt: string;
  /** Intrinsic pixel size of the asset behind `src` (the 1x source), for layout reservation. */
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  className?: string;
  style?: React.CSSProperties;
  disableScaleTransform?: boolean;
}

export const BlurImage = forwardRef<HTMLDivElement, BlurImageProps>(
  ({ src, alt, width, height, srcSet, sizes, loading = "lazy", decoding = "async", className, style, disableScaleTransform }, ref) => {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
      <div ref={ref} style={{ overflow: "hidden", position: "relative", width: "100%", height: "100%" }}>
        {failed ? (
          <div
            role="img"
            aria-label={alt}
            data-image-fallback=""
            className={className}
            style={{
              ...style,
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              padding: "var(--tl-s3, 12px)",
              background: "var(--sf-field, var(--tl-panel))",
              color: "var(--sf-meta, var(--tl-on-dark-meta))",
              border: "var(--tl-rule-size, 1px) solid var(--sf-rule, var(--tl-rule))",
              font: "500 11px/1.4 var(--tl-font-mono)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              filter: "none",
              transform: "none",
            }}
          >
            <span>{alt}</span>
          </div>
        ) : (
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding={decoding}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={className}
            style={{
              ...style,
              filter: loaded ? "blur(0px)" : "blur(20px)",
              transform: disableScaleTransform ? undefined : loaded ? "scale(1)" : "scale(1.1)",
              transition: "filter 0.5s ease, transform 0.5s ease",
              willChange: loaded ? "auto" : "filter, transform",
            }}
          />
        )}
      </div>
    );
  },
);

BlurImage.displayName = "BlurImage";

/**
 * A `sizes` attribute for an `object-fit: cover` image.
 *
 * @param aspect     source width / height (e.g. 1600 / 896)
 * @param boxHeight  CSS length expression for the image box's height
 * @param widths     `[mediaCondition | null, boxWidthExpression]` in source order;
 *                   the `null` condition is the unconditioned last entry
 *
 * Each entry becomes `max(<width>, <height> × aspect)` so the candidate the
 * browser picks is wide enough on whichever axis cover actually scales by.
 */
export function coverSizes(
  aspect: number,
  boxHeight: string,
  widths: readonly (readonly [media: string | null, width: string])[],
): string {
  const need = (width: string) => `max(${width}, calc(${boxHeight} * ${aspect.toFixed(3)}))`;
  return widths.map(([media, width]) => (media ? `${media} ${need(width)}` : need(width))).join(", ");
}
