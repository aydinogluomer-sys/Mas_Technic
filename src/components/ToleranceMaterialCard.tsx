import { CheckCircle2, Gauge, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import type { toleranceMaterials } from "@/data/toleranceMaterials";

type ToleranceMaterial = (typeof toleranceMaterials)[number];

type ToleranceMaterialCardProps = {
  material: ToleranceMaterial;
  index: number;
};

export const ToleranceMaterialCard = ({ material, index }: ToleranceMaterialCardProps) => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.article
      className="group relative overflow-hidden border border-surface-border bg-card/80 p-4 md:p-5"
      initial={prefersReduced ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.58, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--border)/0.16)_1px,transparent_1px),linear-gradient(180deg,hsl(var(--border)/0.10)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      <div className="relative flex items-start justify-between gap-4 border-b border-surface-border pb-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
            {material.code}
          </p>
          <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground md:text-2xl">
            {material.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{material.subtitle}</p>
        </div>
        <div className="shrink-0 border border-primary/30 bg-primary/10 px-3 py-2 text-right font-mono">
          <span className="block text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Hedef</span>
          <strong className="text-sm text-primary">{material.target}</strong>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>-0.05 mm</span>
          <span>Nominal</span>
          <span>+0.05 mm</span>
        </div>
        <div className="relative h-12 border border-surface-border bg-background/50">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/60" />
          <div
            className="absolute top-1/2 h-3 -translate-y-1/2 border border-primary/50 bg-primary/35 shadow-[0_0_24px_hsl(var(--primary)/0.18)]"
            style={{ left: `${material.left}%`, width: `${material.width}%` }}
          />
          <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-border" />
        </div>
        <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Gauge className="h-3.5 w-3.5 text-primary" />
          {material.caption}
        </p>
      </div>

      <dl className="relative mt-5 grid grid-cols-2 border-l border-t border-surface-border">
        {material.specs.map(([label, value]) => (
          <div key={label} className="border-b border-r border-surface-border p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-surface-border pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> QC Onaylı</span>
        <span className="inline-flex items-center gap-2"><Ruler className="h-3.5 w-3.5 text-primary" /> CMM İzli</span>
      </div>
    </motion.article>
  );
};
