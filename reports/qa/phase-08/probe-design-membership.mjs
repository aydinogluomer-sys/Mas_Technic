/**
 * QA PROBE — criterion 3, measured structurally rather than by eye.
 *
 * For every public route, count the markers of the OLD generic library
 * language inside `<main>`:
 *   · shadcn `Card` shells        — `.rounded-lg.border.bg-card` and friends
 *   · non-register border radius  — any computed radius not in the shell's
 *     register (docs/lean/17 §4 publishes 0 / 2 / 4 / 6 / 9999px)
 *   · the shell's own primitives  — `.shell-*` count, as the positive control
 *   · fonts                       — a system-font stack inside main is foreign
 */
import { chromium } from "playwright";
const BASE = "http://localhost:4173";
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : [
  "/kabiliyet-profilleri", "/kabiliyet-profilleri/hassas-mil", "/kalite-dosyasi",
  "/blog", "/blog/5-eksen-cnc-isleme-avantajlari", "/sss",
  "/kvkk", "/gizlilik-politikasi", "/cerez-politikasi", "/qa-zzz-nothing",
  "/hakkimizda", "/iletisim", "/malzemeler", "/hizmetler/cnc-frezeleme",
  "/teklif-al", "/giris", "/sifremi-unuttum", "/reset-password", "/cad-dashboard",
];
const ALLOWED_RADII = new Set(["0px", "2px", "4px", "6px", "9999px", "50%"]);

const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();

console.log("route".padEnd(42) + "shell-*  bg-card  radiusOffRegister  systemFontNodes  topOffRadii");
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const r = await page.evaluate((allowed) => {
    const main = document.querySelector("main") ?? document.body;
    const nodes = [...main.querySelectorAll("*")];
    const shell = nodes.filter((n) => [...n.classList].some((c) => c.startsWith("shell-") || c.startsWith("tl-"))).length;
    const bgCard = nodes.filter((n) => n.classList.contains("bg-card") || n.classList.contains("bg-background") && n.classList.contains("rounded-lg")).length;
    const radii = new Map();
    let off = 0;
    for (const n of nodes) {
      const cs = getComputedStyle(n);
      const rect = n.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) continue;
      for (const v of new Set([cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius])) {
        if (v === "0px") continue;
        if (!allowed.includes(v)) { off += 1; radii.set(v, (radii.get(v) ?? 0) + 1); }
      }
    }
    const sysFont = nodes.filter((n) => {
      const rect = n.getBoundingClientRect();
      if (rect.width < 4) return false;
      const f = getComputedStyle(n).fontFamily;
      return /ui-sans-serif|system-ui|-apple-system|BlinkMacSystemFont/.test(f) && !/Space Grotesk|IBM Plex|Newsreader/.test(f);
    }).length;
    const top = [...radii.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}x${v}`).join(" ");
    return { shell, bgCard, off, sysFont, top };
  }, [...ALLOWED_RADII]);
  console.log(
    route.padEnd(42)
    + String(r.shell).padStart(6)
    + String(r.bgCard).padStart(9)
    + String(r.off).padStart(19)
    + String(r.sysFont).padStart(17)
    + "  " + r.top,
  );
}
await b.close();
