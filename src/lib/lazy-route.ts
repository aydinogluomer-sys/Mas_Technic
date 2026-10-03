import { lazy, type ComponentType } from "react";
import { bootMark, errorMessage, reportBoot } from "@/lib/boot-trace";

/**
 * ROUTE CHUNKS THAT CAN FAIL WITHOUT STRANDING THE READER.
 *
 * `React.lazy` caches the promise it was given. When a route chunk fails to
 * load — the classic case is an `index.html` from the previous deploy asking
 * for a hashed file the new deploy no longer has — the rejection is cached
 * too, so the route boundary's "Yeniden dene" re-rendered the same failure
 * forever. Only a reload fetches the new HTML and the new chunk names.
 *
 * Recovery, in order:
 *   1. a chunk-load failure while the browser reports a connection reloads
 *      the page ONCE. A per-tab marker (sessionStorage, 30 s) stops a second
 *      automatic reload, so a chunk that is really missing cannot loop;
 *   2. otherwise the error reaches `ShellRouteBoundary`, which says what
 *      happened and offers a real reload (`isChunkLoadError`).
 * Errors that are not chunk loads (a page that throws while rendering) are
 * not touched: they keep going to the boundary exactly as before.
 */

const RELOAD_MARKER = "mas_chunk_reload";
const RELOAD_WINDOW_MS = 30_000;

const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading (CSS )?chunk [\w-]+ failed|ChunkLoadError/i;

export class ChunkLoadError extends Error {
  constructor(readonly route: string, cause: unknown) {
    super(`route chunk "${route}" failed to load: ${errorMessage(cause)}`);
    this.name = "ChunkLoadError";
  }
}

export function isChunkLoadError(error: unknown): boolean {
  if (error instanceof ChunkLoadError) return true;
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return CHUNK_ERROR.test(text);
}

function reloadedRecently(): boolean {
  try {
    const at = Number(window.sessionStorage.getItem(RELOAD_MARKER));
    return Number.isFinite(at) && Date.now() - at < RELOAD_WINDOW_MS;
  } catch {
    // No storage, no loop guard: never reload automatically.
    return true;
  }
}

function markReload() {
  try {
    window.sessionStorage.setItem(RELOAD_MARKER, String(Date.now()));
  } catch {
    /* guarded by reloadedRecently() returning true when storage is blocked */
  }
}

/** Reload once for a chunk failure; returns false when that is not allowed. */
export function reloadForChunkFailure(route: string): boolean {
  if (typeof window === "undefined") return false;
  if (navigator.onLine === false || reloadedRecently()) return false;
  markReload();
  reportBoot(`reloading after chunk failure (${route})`);
  window.location.reload();
  return true;
}

export function lazyRoute<P extends object>(
  route: string,
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  return lazy(async () => {
    bootMark("chunk:start", route);
    try {
      const module = await load();
      bootMark("chunk:ready", route);
      return module;
    } catch (error) {
      if (!isChunkLoadError(error)) {
        bootMark("chunk:error", `${route} · ${errorMessage(error)}`);
        throw error;
      }
      bootMark("chunk:failed", `${route} · ${errorMessage(error)}`);
      if (reloadForChunkFailure(route)) {
        // The page is going away; keep the loader up instead of flashing an error.
        return new Promise<never>(() => undefined);
      }
      reportBoot(`chunk failed without automatic recovery (${route})`);
      throw new ChunkLoadError(route, error);
    }
  });
}
