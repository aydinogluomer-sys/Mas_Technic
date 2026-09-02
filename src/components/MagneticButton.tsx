import { useRef, useState, forwardRef, type ReactNode, type MouseEvent } from "react";
import { motion } from "@/components/shell/motion";
import { Link } from "react-router-dom";
import { useSoundEngine } from "@/hooks/use-sound";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  as?: "a" | "button";
  href?: string;
  onClick?: () => void;
  strength?: number;
}

export const MagneticButton = forwardRef<HTMLDivElement, MagneticButtonProps>(
  ({ children, className = "", as = "a", href, onClick, strength = 0.3 }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { play } = useSoundEngine();

    const handleMouse = (e: MouseEvent) => {
      if (isFocused) return;
      if (!innerRef.current) return;
      const { left, top, width, height } = innerRef.current.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) * strength;
      const y = (e.clientY - top - height / 2) * strength;
      setPosition({ x, y });
    };

    const reset = () => {
      setPosition({ x: 0, y: 0 });
      setIsHovered(false);
    };

    const isInternalLink = as === "a" && Boolean(href?.startsWith("/"));
    const Tag = (isInternalLink ? Link : as) as React.ElementType;
    const navigationProps = isInternalLink ? { to: href } : { href };

    return (
      <motion.div
        ref={(node) => {
          (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        onMouseMove={handleMouse}
        onMouseEnter={() => {
          setIsHovered(true);
          play("tick");
        }}
        onMouseLeave={reset}
        onFocus={() => {
          setIsFocused(true);
          reset();
        }}
        onBlur={() => {
          setIsFocused(false);
          reset();
        }}
        animate={{
          x: position.x,
          y: position.y,
          boxShadow: isHovered ? "0 0 20px rgb(var(--heat-molten-rgb) / 0.3)" : "0 0 0px rgb(var(--heat-molten-rgb) / 0)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className="inline-block"
      >
        <Tag
          className={`${className} focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none`}
          {...navigationProps}
          onClick={() => {
            play("click");
            onClick?.();
          }}
        >
          <motion.span
            className="inline-block"
            animate={{
              x: -position.x * 0.4,
              y: -position.y * 0.4,
            }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
          >
            {children}
          </motion.span>
        </Tag>
      </motion.div>
    );
  },
);

MagneticButton.displayName = "MagneticButton";
