/* QA 09b-1 R2 — shared plumbing.
   ==========================================================================
   NETWORK POSTURE. Unchanged from `reports/09b1c1/probe-lib.mjs`, which is
   re-exported rather than reimplemented so there is one guard in this phase
   and not two. Every probe here runs behind `guard()` at allowHosts=[] and
   refuses to continue unless `canary()` observes a real abort first.

   KNOWN LIMIT OF THAT GUARD, recorded in step 1 as D-09b1r2-04: `context.route`
   does not carry WebSocket traffic in Playwright 1.59 (`routeWebSocket` is a
   separate API, `playwright-core/lib/client/browserContext.js:336`). No probe
   here visits a route that opens one — every `.channel()` call in `src/` is
   under `/admin` or `/musteri-paneli`, and both redirect when signed out.

   SERVER. The packet forbids background processes, so each probe starts its
   own `vite preview` in the foreground of its own Node process and kills it in
   a `finally`. `dist/` must already exist; probes do not build.
   ========================================================================== */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

export { guard, canary, chromiumExecutable, launch, BASE } from "../../reports/09b1c1/probe-lib.mjs";

const PORT = Number(process.env.PROBE_PORT ?? 4173);
export const URL_BASE = `http://localhost:${PORT}`;

async function up(url, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url, { redirect: "manual" });
      if (r.status < 500) return true;
    } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/** Start `vite preview` on PORT. Returns `stop()`. Throws if it never answers. */
export async function preview() {
  if (!existsSync("dist/index.html")) {
    throw new Error("dist/index.html missing — run `npm run build` before this probe.");
  }
  /* If something is already serving this port (a parallel run, or a previous
     probe that leaked), reuse it rather than fighting --strictPort. Reported,
     not hidden: a reused server is a different provenance for the evidence. */
  if (await up(URL_BASE, 1200)) {
    console.log(`[probe] reusing a server already answering on ${URL_BASE}`);
    return async () => {};
  }
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    { stdio: ["ignore", "ignore", "pipe"], shell: process.platform === "win32" },
  );
  let err = "";
  child.stderr.on("data", (d) => { err += String(d); });
  if (!(await up(URL_BASE, 90_000))) {
    child.kill();
    throw new Error(`vite preview never answered on ${URL_BASE}\n${err}`);
  }
  console.log(`[probe] preview up on ${URL_BASE}`);
  return async () => {
    /* MEASURED, NOT ASSUMED: on Windows `child.kill()` on the `npx` shim does
       NOT take the vite child with it. The first two runs of these probes each
       leaked a listener on 4173, which the next run then silently "reused" —
       evidence with a provenance nobody chose. Kill the tree, then verify the
       port is actually free and say so if it is not. */
    if (process.platform === "win32" && child.pid) {
      await new Promise((resolve) => {
        spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" })
          .on("close", resolve).on("error", resolve);
      });
    } else {
      child.kill();
    }
    await new Promise((r) => setTimeout(r, 800));
    if (await up(URL_BASE, 500)) console.log("[probe] NOTE: a server is STILL answering after kill — evidence provenance is not clean");
    else console.log("[probe] preview stopped, port free");
  };
}

/** The gate's own census function, byte-for-byte, so probes measure the gate
 *  rather than a paraphrase of it. Kept in sync by `09b1r2-census-parity` in
 *  `09b1r2-gate-attack.mjs`, which diffs this source against the spec's. */
export const CENSUS_SRC = `() => {
  const out = [];
  const fingerprint = (el) => {
    const s = getComputedStyle(el);
    return [
      s.fontFamily.split(",")[0].replace(/["']/g, ""),
      s.fontSize,
      s.fontWeight,
      s.fontStyle,
      s.letterSpacing,
      s.textTransform,
    ].join(" / ");
  };
  const keyOf = (el) => {
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-)/.test(c)).sort();
    return classes.length ? el.tagName.toLowerCase() + "." + classes.join(".") : null;
  };
  const groundOf = (el) => {
    const band = el.closest(".tl-band[data-band-tone]");
    const root = el.closest("[data-shell-surface]");
    return (band && band.getAttribute("data-band-tone"))
      || (root && root.getAttribute("data-shell-surface"))
      || (el.closest(".tl-root") ? "tl-landing" : "none");
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 || r.height >= 1;
  };
  const push = (key, el) => {
    out.push({
      key,
      style: fingerprint(el),
      ground: groundOf(el),
      sample: (el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 30)
        || el.getAttribute("name") || el.tagName.toLowerCase(),
    });
  };
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const key = keyOf(el);
    if (key && visible(el)) push(key, el);
  }
  for (const root of Array.from(document.querySelectorAll(".shell-field"))) {
    for (const el of Array.from(root.querySelectorAll("label, input, select, textarea"))) {
      if (visible(el)) push(".shell-field " + el.tagName.toLowerCase(), el);
    }
  }
  return out;
}`;

/** The gate's `splits()`, same shape. */
export function splits(rows, exempt = new Set()) {
  const groups = new Map();
  for (const r of rows) {
    if (!groups.has(r.key)) groups.set(r.key, new Map());
    const g = groups.get(r.key);
    if (!g.has(r.style)) g.set(r.style, { routes: new Set(), n: 0, grounds: new Set(), sample: r.sample });
    const e = g.get(r.style);
    e.routes.add(r.route);
    e.grounds.add(r.ground);
    e.n += 1;
  }
  return [...groups.entries()]
    .filter(([key, g]) => g.size > 1 && !exempt.has(key))
    .map(([key, g]) => `${key}  ->  ${[...g.entries()]
      .map(([style, e]) => `${style} (${e.n}x on ${[...e.routes].join("+")}, grounds ${[...e.grounds].join("+")}, e.g. "${e.sample}")`)
      .join("   ||   ")}`);
}

export const GATE_ROUTES = [
  "/", "/giris", "/sifremi-unuttum", "/reset-password", "/iletisim", "/teklif-al",
  "/malzemeler", "/sss", "/hakkimizda", "/blog", "/404-this-route-does-not-exist",
];
