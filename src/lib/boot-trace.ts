/**
 * BOOT TRACE — what the page was doing when it stopped.
 *
 * A reader once saw "YÜKLENİYOR · Sayfa hazırlanıyor." and nothing after it,
 * and the session could not be reproduced. This records the few facts that
 * would have answered "which step never finished": the build the HTML came
 * from, the boot phases with their times, every route chunk that started,
 * finished, failed or was retried, the recovery taken, and uncaught errors.
 *
 * Privacy: only phase names, route chunk names, the pathname (no query, no
 * hash) and error MESSAGES truncated to 160 characters. No user input, no
 * file names, no tokens, no e-mail.
 *
 * Noise: nothing is printed on a healthy load. The trace goes to the console
 * once, as a single line, when a loader stalls or a chunk fails; with
 * `localStorage.mas_boot_debug = "1"` every mark is also printed as it
 * happens. `window.__masBoot` holds the trace for a support conversation.
 */

type Mark = { t: number; phase: string; detail?: string };

type BootTrace = {
  build: string;
  path: string;
  online: boolean | null;
  marks: Mark[];
};

const MAX_MARKS = 60;
const MAX_DETAIL = 160;

const verbose = (() => {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem("mas_boot_debug") === "1";
  } catch {
    return false;
  }
})();

function readBuild(): string {
  if (typeof document === "undefined") return "unknown";
  const meta = document.querySelector('meta[name="mas-build"]')?.getAttribute("content");
  return meta ? meta.split(" ")[0].slice(0, 12) : import.meta.env.DEV ? "dev" : "unknown";
}

const trace: BootTrace = {
  build: readBuild(),
  path: typeof location !== "undefined" ? location.pathname : "",
  online: typeof navigator !== "undefined" && "onLine" in navigator ? navigator.onLine : null,
  marks: [],
};

if (typeof window !== "undefined") {
  (window as unknown as { __masBoot?: BootTrace }).__masBoot = trace;
}

const clip = (value: string) => (value.length > MAX_DETAIL ? `${value.slice(0, MAX_DETAIL)}…` : value);

export function bootMark(phase: string, detail?: string) {
  if (trace.marks.length >= MAX_MARKS) trace.marks.shift();
  const mark: Mark = { t: Math.round(typeof performance !== "undefined" ? performance.now() : 0), phase };
  if (detail) mark.detail = clip(detail);
  trace.marks.push(mark);
  if (verbose) console.debug(`[boot] ${mark.t}ms ${phase}${mark.detail ? ` · ${mark.detail}` : ""}`);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return clip(`${error.name}: ${error.message}`);
  return clip(String(error));
}

/** One line on the console, for the moments a reader is stuck. */
export function reportBoot(reason: string) {
  trace.path = typeof location !== "undefined" ? location.pathname : trace.path;
  trace.online = typeof navigator !== "undefined" && "onLine" in navigator ? navigator.onLine : null;
  bootMark("report", reason);
  console.error(`[boot] ${reason} · ${JSON.stringify(trace)}`);
}

let installed = false;

/** Uncaught errors and rejections become marks; nothing else changes. */
export function installBootTrace() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  bootMark("boot:start", trace.build);
  window.addEventListener("error", (event) => bootMark("error", errorMessage(event.error ?? event.message)));
  window.addEventListener("unhandledrejection", (event) => bootMark("rejection", errorMessage(event.reason)));
  window.addEventListener("offline", () => bootMark("network:offline"));
  window.addEventListener("online", () => bootMark("network:online"));
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) bootMark("bfcache:restore");
  });
}
