import { forwardRef, type ReactNode, type ElementType } from "react";
import { useSoundEngine } from "@/hooks/use-sound";
import { Link } from "react-router-dom";

interface BracketButtonProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export const BracketButton = forwardRef<HTMLElement, BracketButtonProps>(
  ({ children, as: Component = "button", className = "", onClick, href, ...props }, ref) => {
    const { play } = useSoundEngine();
    const isInternalLink = Component === "a" && Boolean(href?.startsWith("/"));
    const ResolvedComponent = isInternalLink ? Link : Component;
    const navigationProps = isInternalLink ? { to: href } : { href };

    return (
      <ResolvedComponent
        ref={ref}
        className={`group inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-mono text-sm uppercase tracking-[0.18em] transition-all duration-300 hover:border-primary hover:text-primary ${className}`}
        onMouseEnter={() => play("tick")}
        onClick={() => {
          play("click");
          onClick?.();
        }}
        {...navigationProps}
        {...props}
      >
        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1 text-muted-foreground group-hover:text-primary">
          {"["}
        </span>
        <span>{children}</span>
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-muted-foreground group-hover:text-primary">
          {"]"}
        </span>
      </ResolvedComponent>
    );
  },
);

BracketButton.displayName = "BracketButton";
