import { Skeleton } from "@/components/ui/skeleton";

/** 3x2 stat card skeleton for GenelBakis */
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-card border border-border p-5 flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    ))}
  </div>
);

/** Table rows skeleton */
export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="space-y-0">
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" style={{ maxWidth: c === 0 ? 180 : 100 }} />
        ))}
      </div>
    ))}
  </div>
);

/** Card list skeleton (for files, reports, etc.) */
export const CardListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 border border-border bg-background">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-2.5 w-28" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    ))}
  </div>
);

/** Production step skeleton */
export const ProductionSkeleton = ({ count = 2 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border border-border bg-background p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-2 w-14 mt-1.5" />
              </div>
              {j < 4 && <Skeleton className="h-0.5 flex-1 mx-1" />}
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    ))}
  </div>
);

/** Summary cards skeleton (3 cards) */
export const SummarySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-background border border-border p-4 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-20" />
      </div>
    ))}
  </div>
);

/** Ticket list skeleton */
export const TicketSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border border-border bg-background p-4 flex items-center gap-4">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4" />
      </div>
    ))}
  </div>
);
