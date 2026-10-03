/**
 * C2 — the hook `src/main.tsx` uses to get the first route ready before React
 * renders over prerendered HTML. `App.tsx` owns the route table and registers
 * the implementation at module load; keeping the hand-off here lets `App.tsx`
 * export components only (React Fast Refresh).
 */
/** `"ready"`, or the error the route's code failed with. */
export type PrepareResult = "ready" | { error: unknown };
type Prepare = (pathname: string) => Promise<PrepareResult>;

let prepare: Prepare = async () => "ready";

export function registerRoutePreparer(fn: Prepare) {
  prepare = fn;
}

export function prepareRoute(pathname: string): Promise<PrepareResult> {
  return prepare(pathname);
}
