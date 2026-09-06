/**
 * QA PHASE 09a — is the branded error label readable in every state this
 * phase renders it in, and is the graphite ground the cause?
 *
 * `.shell-notice[data-tone="error"]` had ZERO usages in `src/` before this
 * phase (PROGRESS.md A20). All five usages it now has are inside
 * `src/components/rfq/**`, on the `/teklif-al` band that the same phase
 * switched from `paper` to `graphite`. So this measures the label in the two
 * states the acceptance criteria name, plus the same markup forced onto the
 * paper ground for comparison.
 *
 * No submission: the CAD error is a client-side rejection and the form error
 * is a client-side guard. Every off-origin request except the font CDN is
 * aborted, and the ledger is printed.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const FONT_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);
const blocked = [];

const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
const parse = (s) => String(s).match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const ratio = (fg, bg) => {
  const [a, b] = [lum(parse(fg)), lum(parse(bg))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.route("**/*", async (route, request) => {
  const url = request.url();
  let host = "";
  try { host = new URL(url).hostname; } catch { /* data: */ }
  if (!host || ["localhost", "127.0.0.1", "[::1]"].includes(host) || FONT_HOSTS.has(host)) {
    await route.fallback();
    return;
  }
  blocked.push(`${request.method()} ${url}`);
  await route.abort("blockedbyclient");
});

const readNotice = () =>
  page.evaluate(() => {
    const notice = document.querySelector("main .shell-notice[data-tone='error']");
    if (!notice) return null;
    const ground = (el) => {
      let node = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
        node = node.parentElement;
      }
      return "rgb(255, 255, 255)";
    };
    const part = (sel) => {
      const el = notice.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { text: el.textContent.trim().slice(0, 40), color: cs.color, ground: ground(el), fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    };
    return {
      label: part(".shell-notice-label"),
      title: part(".shell-notice-title"),
      body: part(".shell-notice-body p"),
      surface: document.querySelector(".shell-root")?.getAttribute("data-shell-surface"),
    };
  });

const report = (name, data) => {
  console.log(`\n── ${name}   (surface=${data.surface}) ──`);
  for (const [part, v] of Object.entries(data)) {
    if (part === "surface" || !v) continue;
    const r = ratio(v.color, v.ground);
    const size = parseFloat(v.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(v.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    console.log(
      `  ${part.padEnd(6)} "${v.text}"  ${v.color} on ${v.ground}  ${v.fontSize}/${v.fontWeight}  ` +
      `ratio ${r.toFixed(2)}:1  needs ${need}:1  ${r >= need ? "PASS" : "FAIL"}`,
    );
  }
};

/* 1 — the CAD/format error, reached by choosing a .txt (client-side only). */
await page.goto(BASE + "/teklif-al", { waitUntil: "networkidle" });
await page.locator("#rfq-cad").setInputFiles({
  name: "qa-not-a-cad-file.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("not a cad file"),
});
await page.waitForTimeout(400);
report("CAD FORMAT ERROR — step 01", await readNotice());

/* 2 — the form error, reached by advancing with no file (client-side guard). */
await page.goto(BASE + "/teklif-al", { waitUntil: "networkidle" });
await page.locator("form button[type='submit']").click();
await page.waitForTimeout(400);
report("FORM ERROR — step 01, no file", await readNotice());

/* 3 — the same markup on the paper ground, to isolate the cause. `/iletisim`
   is a paper surface; the notice tokens are surface-scoped except
   `--tl-stamp`, which is a single fixed hex for both grounds. */
await page.goto(BASE + "/iletisim", { waitUntil: "networkidle" });
const paper = await page.evaluate(() => {
  const root = document.querySelector(".shell-root");
  const main = document.querySelector("main");
  const probe = document.createElement("div");
  probe.className = "shell-notice";
  probe.setAttribute("data-tone", "error");
  probe.innerHTML = '<p class="shell-notice-label">FORM HATASI</p><p class="shell-notice-title">Başlık</p><div class="shell-notice-body"><p>Gövde</p></div>';
  main.appendChild(probe);
  const ground = (el) => {
    let node = el;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
      node = node.parentElement;
    }
    return "rgb(255, 255, 255)";
  };
  const part = (sel) => {
    const el = probe.querySelector(sel);
    const cs = getComputedStyle(el);
    return { text: el.textContent.trim(), color: cs.color, ground: ground(el), fontSize: cs.fontSize, fontWeight: cs.fontWeight };
  };
  const out = {
    label: part(".shell-notice-label"),
    title: part(".shell-notice-title"),
    body: part(".shell-notice-body p"),
    surface: root?.getAttribute("data-shell-surface"),
  };
  probe.remove();
  return out;
});
report("SAME MARKUP INJECTED ON THE PAPER GROUND (/iletisim)", paper);

console.log(`\nblocked off-origin requests: ${blocked.length}`);
for (const entry of new Set(blocked)) console.log(`  ${entry}`);
await b.close();
