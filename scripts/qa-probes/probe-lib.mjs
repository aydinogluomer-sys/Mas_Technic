/* Shared plumbing for the 09b-1 probes.
   ------------------------------------------------------------------------
   NETWORK POSTURE. Every probe in this phase runs behind `guard()`, which
   aborts every request whose host is not loopback unless the probe passes an
   explicit read-only allow list. The packet's prohibition is absolute and this
   packet sits next to auth: a password-reset request sends real mail and a
   sign-up creates a real user, so no probe here may be one accidental click
   away from either.

   `guard()` is proved, not trusted: `canary()` below asks the page to fetch
   `https://canary.example.com/...` and the probe refuses to continue unless
   that fetch was blocked. QA's pattern in this phase; reused verbatim. */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

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
 * Install the abort guard on a context.
 *
 * @param context      Playwright BrowserContext
 * @param allowHosts   hostnames (exact or `.suffix` match) allowed OUT. Empty
 *                     by default: nothing but loopback leaves the machine.
 * @returns { requested, blocked, allowed } live arrays of every URL seen.
 */
export async function guard(context, allowHosts = []) {
  const requested = [];
  const blocked = [];
  const allowed = [];
  await context.route("**/*", (route) => {
    const url = route.request().url();
    let host = "";
    try { host = new URL(url).hostname; } catch { host = ""; }
    if (LOOPBACK.has(host) || url.startsWith("data:") || url.startsWith("blob:")) {
      return route.continue();
    }
    requested.push(url);
    const ok = allowHosts.some((h) => host === h || host.endsWith(`.${h}`));
    if (ok) { allowed.push(url); return route.continue(); }
    blocked.push(url);
    return route.abort();
  });
  return { requested, blocked, allowed };
}

/**
 * PROVE THE GUARD HOLDS BEFORE ANY CONTROL IS TOUCHED.
 * Throws unless a live fetch to a non-loopback host was actually aborted.
 */
export async function canary(page, log) {
  const marker = "https://canary.example.com/09b1-guard-probe";
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

export const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4173";

export async function open(context, path, { waitFor = "load" } = {}) {
  const page = await context.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: waitFor });
  await page.waitForTimeout(600);
  return page;
}
