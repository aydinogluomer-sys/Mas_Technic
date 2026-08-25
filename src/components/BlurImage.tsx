import { useState, forwardRef } from "react";

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  disableScaleTransform?: boolean;
}

export const BlurImage = forwardRef<HTMLDivElement, BlurImageProps>(
  ({ src, alt, className, style, disableScaleTransform }, ref) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <div ref={ref} style={{ overflow: "hidden", position: "relative", width: "100%", height: "100%" }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={className}
          style={{
            ...style,
            filter: loaded ? "blur(0px)" : "blur(20px)",
            transform: disableScaleTransform ? undefined : loaded ? "scale(1)" : "scale(1.1)",
            transition: "filter 0.5s ease, transform 0.5s ease",
            willChange: loaded ? "auto" : "filter, transform",
          }}
        />
      </div>
    );
  },
);

BlurImage.displayName = "BlurImage";
