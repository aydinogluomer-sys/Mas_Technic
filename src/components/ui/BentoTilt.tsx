import { forwardRef, useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoTiltProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const BentoTilt = forwardRef<HTMLDivElement, BentoTiltProps>(
  ({ children, className, disabled = false }, ref) => {
    const [transform, setTransform] = useState("");

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const rotateX = (relativeY - 0.5) * 5;
      const rotateY = (relativeX - 0.5) * -5;
      setTransform(`perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(.98,.98,.98)`);
    }, [disabled]);

    const handleMouseLeave = useCallback(() => setTransform(""), []);

    return (
      <div
        ref={ref}
        className={cn("transition-transform duration-200 motion-reduce:transform-none", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform, transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    );
  },
);

BentoTilt.displayName = "BentoTilt";