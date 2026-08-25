import { cn } from "@/lib/utils";

interface IndustrialSkeletonProps {
  variant: "table" | "card" | "list";
  rows?: number;
  columns?: number;
  className?: string;
}

const shimmerClass = "industrial-shimmer rounded";

const TableSkeleton = ({ rows = 5, columns = 4 }: { rows: number; columns: number }) => (
  <div className="w-full overflow-hidden rounded-xl border border-border">
    {/* Header */}
    <div className="flex gap-px bg-muted p-3">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={`h-${i}`}
          className={cn(shimmerClass, "h-4 flex-1", i === 0 ? "max-w-[140px]" : "")}
          style={{ width: `${60 + ((i * 17) % 40)}%` }}
        />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={`r-${r}`} className="flex gap-px p-3 border-t border-border">
        {Array.from({ length: columns }).map((_, c) => (
          <div
            key={`c-${r}-${c}`}
            className={cn(shimmerClass, "h-3.5 flex-1")}
            style={{ width: `${40 + ((r * 7 + c * 13) % 50)}%` }}
          />
        ))}
      </div>
    ))}
  </div>
);

const CardSkeleton = ({ rows = 3 }: { rows: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={`card-${i}`}
        className="rounded-xl bg-card border border-border p-5 space-y-4"
      >
        <div className={cn(shimmerClass, "h-28 w-full rounded-lg")} />
        <div className={cn(shimmerClass, "h-4 w-3/4")} />
        <div className={cn(shimmerClass, "h-3 w-full")} />
        <div className={cn(shimmerClass, "h-3 w-5/6")} />
      </div>
    ))}
  </div>
);

const ListSkeleton = ({ rows = 5 }: { rows: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={`list-${i}`}
        className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border"
      >
        <div className={cn(shimmerClass, "h-10 w-10 rounded-full shrink-0")} />
        <div className="flex-1 space-y-2">
          <div className={cn(shimmerClass, "h-3.5")} style={{ width: `${50 + ((i * 11) % 40)}%` }} />
          <div className={cn(shimmerClass, "h-3")} style={{ width: `${30 + ((i * 17) % 50)}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const IndustrialSkeleton = ({ variant, rows, columns = 4, className }: IndustrialSkeletonProps) => {
  const content = (() => {
    switch (variant) {
      case "table":
        return <TableSkeleton rows={rows ?? 5} columns={columns} />;
      case "card":
        return <CardSkeleton rows={rows ?? 3} />;
      case "list":
        return <ListSkeleton rows={rows ?? 5} />;
    }
  })();

  return <div className={cn("py-8", className)}>{content}</div>;
};

export { IndustrialSkeleton };
