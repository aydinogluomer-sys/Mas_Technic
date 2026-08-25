"use client";
import React from "react";
import { motion } from "framer-motion";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface TestimonialsColumnProps {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}

export const TestimonialsColumn = React.forwardRef<HTMLDivElement, TestimonialsColumnProps>(
  function TestimonialsColumn({ className, testimonials, duration }, ref) {
    return (
      <div className={className} ref={ref}>
        <motion.div
          animate={{
            translateY: "-50%",
          }}
          transition={{
            duration: duration || 10,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
          className="flex flex-col gap-6 pb-6"
        >
          {[
            ...new Array(2).fill(0).map((_, index) => (
              <React.Fragment key={index}>
                {testimonials.map(({ text, image, name, role }, i) => (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm" key={`${index}-${i}`}>
                    <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
                    <div className="mt-4 flex items-center gap-3">
                      {image ? (
                        <img src={image} alt={name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            )),
          ]}
        </motion.div>
      </div>
    );
  }
);
