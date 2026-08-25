import { forwardRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  tag: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
  sectionNumber?: number;
}

const toKebab = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F]+/gi, "-")
    .replace(/(^-|-$)/g, "");

const formatNumber = (n: number) => `— ${n.toString().padStart(2, "0")}`;

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ tag, title, description, align = "left", titleClassName, sectionNumber }, ref) => {
    const isCenter = align === "center";
    const headingId = `section-${toKebab(tag)}`;
    const hasNumber = typeof sectionNumber === "number";

    return (
      <div ref={ref} className={isCenter ? "text-center" : ""}>
        <Reveal direction="up" duration={0.5}>
          <div className={`flex items-center gap-3 mb-4 ${isCenter ? "justify-center" : ""}`}>
            <div className="w-8 h-px bg-primary" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-mono text-primary font-semibold">{tag}</span>
            {hasNumber && !isCenter && (
              <>
                <div className="flex-1" />
                <span className="text-xs font-mono tracking-widest text-muted-foreground/60 select-none">
                  {formatNumber(sectionNumber)}
                </span>
              </>
            )}
          </div>
        </Reveal>

        <h2
          id={headingId}
          className={
            titleClassName || "text-4xl md:text-6xl font-bold tracking-tighter mb-4 leading-[0.95] text-foreground"
          }
        >
          {title.split(' ').map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.1 + i * 0.04,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {description && (
          <Reveal direction="up" delay={0.3} duration={0.5}>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">{description}</p>
          </Reveal>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";
