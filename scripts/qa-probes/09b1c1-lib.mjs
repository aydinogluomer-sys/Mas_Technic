/* 09b-1-C2 — SHARED PLUMBING FOR THE CORRECTION PROBES
   ══════════════════════════════════════════════════════════════════════════
   Two differences from `scripts/qa-probes/probe-lib.mjs`, both deliberate.

   1. IT SERVES `dist/` ITSELF. The C1 probes needed an external
      `npm run preview` on :4173, which means a second long-lived process
      alongside the browser on an 8 GB machine and a probe that fails
      confusingly when it is not there. This one starts a ~40-line static
      server with SPA history fallback in the same process, on an ephemeral
      port, and closes it in `finally`. One process, no port collision with a
      Playwright run, nothing left behind.

   2. THE GUARD IS THE SAME AND IS STILL PROVED. `guard()` aborts every
      request whose host is not the probe's own server, and `canary()` refuses
      to let a probe continue unless a live cross-origin fetch was actually
      aborted. This packet sits next to auth: `.env` is present, the build
      carries a real project URL, and the app asks for a session on mount. The
      prohibition is absolute, so the guard is a control rather than a promise.
   ══════════════════════════════════════════════════════════════════════════ */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

/* `new URL(...).pathname` percent-encodes; this repo's absolute path contains
   a space, so `fileURLToPath` is the only correct conversion here. */
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const DIST = join(ROOT, "dist");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** Serve `dist/` with SPA history fallback. Returns `{ base, close }`. */
export async function serveDist() {
  if (!existsSync(join(DIST, "index.html"))) {
    throw new Error(`No build at ${DIST} — run \`npm run build\` first.`);
  }
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    let file = join(DIST, safe);
    if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
      file = join(DIST, "index.html");
    }
    res.writeHead(200, {
      "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    createReadStream(file).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    base: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

export function chromiumExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    process.env.ProgramFiles
      ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe")
      : undefined,
    process.env["ProgramFiles(x86)"]
      ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe")
      : undefined,
  ];
  return candidates.find((c) => !!c && existsSync(c));
}

export async function launch() {
  const executablePath = chromiumExecutable();
  return chromium.launch(executablePath ? { executablePath } : {});
}

/**
 * Abort everything that is not this probe's own server.
 *
 * @returns { requested, blocked, allowed } live arrays of every URL seen.
 */
export async function guard(context, ownOrigin) {
  const requested = [];
  const blocked = [];
  const allowed = [];
  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(ownOrigin) || url.startsWith("data:") || url.startsWith("blob:")) {
      return route.continue();
    }
    requested.push(url);
    blocked.push(url);
    return route.abort();
  });
  return { requested, blocked, allowed };
}

/** Throws unless a live cross-origin fetch was actually aborted. */
export async function canary(page, log) {
  const marker = "https://canary.example.com/09b1c2-guard-probe";
  const result = await page.evaluate(async (url) => {
    try { await fetch(url, { mode: "no-cors" }); return "REACHED"; }
    catch (e) { return `BLOCKED:${String(e && e.message).slice(0, 80)}`; }
  }, marker);
  if (!String(result).startsWith("BLOCKED")) {
    throw new Error(`GUARD CANARY REACHED THE NETWORK (${result}) — aborting probe.`);
  }
  if (log) log(`guard canary: ${result}`);
  return result;
}

/* ── sRGB contrast, the same maths the shell tokens were solved with ────── */

export const CONTRAST_SOURCE = `
  const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const parse = (s) => {
    const n = String(s).match(/[-\\d.]+/g);
    return n && n.length >= 3 ? n.slice(0, 3).map(Number) : null;
  };
  const alphaOf = (c) => {
    const m = String(c).match(/rgba?\\(([^)]+)\\)/);
    const parts = m ? m[1].split(",").map((v) => parseFloat(v)) : [];
    return parts.length >= 4 ? parts[3] : 1;
  };
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => srgb(v / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    if (!a || !b) return null;
    const la = lum(a); const lb = lum(b);
    return +(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)).toFixed(3));
  };
  /** Composite a possibly-translucent colour over an opaque backdrop. */
  const over = (c, backdrop) => {
    const rgb = parse(c);
    if (!rgb) return null;
    const a = alphaOf(c);
    if (a >= 1) return rgb;
    if (a <= 0) return backdrop;
    return rgb.map((v, i) => Math.round(v * a + backdrop[i] * (1 - a)));
  };
  /** The nearest ancestor that actually paints, composited down to the sheet. */
  const groundOf = (el) => {
    const stack = [];
    let node = el.parentElement;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      if (alphaOf(bg) > 0) stack.push(bg);
      node = node.parentElement;
    }
    let ground = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i -= 1) ground = over(stack[i], ground) ?? ground;
    return ground;
  };
`;
