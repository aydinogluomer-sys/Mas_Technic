/* PROBE 5 — QA run 2.
 * (a) NEGATIVE CONTROL for the equal-tile "four icon cards" detector: inject the
 *     old corporate template into a live rebuilt page and prove the detector
 *     fires (red), then remove it and prove it stops (green).
 * (b) Unknown-slug branches of the three rebuilt page components: heading audit.
 * (c) Full radius inventory on /malzemeler, attributed to the owning component.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const detector = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"
      && Number(cs.opacity) > 0.01;
  };
  const tiles = [];
  for (const parent of document.querySelectorAll("main *, .shell-root *")) {
    const kids = [...parent.children].filter(vis);
    if (kids.length < 3 || kids.length > 8) continue;
    const boxes = kids.map((k) => k.getBoundingClientRect());
    const w = boxes[0].width, h = boxes[0].height;
    if (w < 60 || h < 60) continue;
    if (!boxes.every((b) => Math.abs(b.width - w) <= 2)) continue;
    if (!boxes.every((b) => Math.abs(b.height - h) <= 2)) continue;
    const tops = new Set(boxes.map((b) => Math.round(b.top)));
    if (kids.length / tops.size < 2) continue;
    tiles.push({
      parentCls: (parent.getAttribute("class") || "").slice(0, 60),
      n: kids.length,
      kidsWithIcon: kids.filter((k) => k.querySelector("svg, img, [class*='icon']")).length,
      tile: [Math.round(w), Math.round(h)],
      sampleText: (kids[0].textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
    });
  }
  return tiles;
};

const inject = () => {
  const host = document.createElement("section");
  host.id = "qa-negative-control";
  host.innerHTML = `
    <h2 style="font-size:32px">Neden Biz?</h2>
    <p>Mukemmel hizmet icin dogru cozum ortagi.</p>
    <div id="qa-nc-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      ${[1, 2, 3, 4].map((i) => `
        <div style="border:1px solid #888;border-radius:12px;padding:24px;height:180px;box-shadow:0 4px 10px rgba(0,0,0,.2)">
          <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          <h3>Ozellik ${i}</h3><p>Kisa aciklama metni ${i}.</p>
        </div>`).join("")}
    </div>`;
  (document.querySelector("main") || document.body).appendChild(host);
};

const headings = () => {
  const out = {};
  for (const t of ["h1", "h2", "h3", "h4", "h5", "h6"]) out[t] = document.querySelectorAll(t).length;
  out.title = document.title;
  out.firstH = (() => {
    const e = document.querySelector("h1,h2,h3,h4,h5,h6");
    return e ? e.tagName + ": " + (e.textContent || "").trim().slice(0, 50) : null;
  })();
  out.bodyText = (document.querySelector("main")?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 160);
  out.shellState = [...document.querySelectorAll("[data-shell-state]")].map((e) => e.getAttribute("data-shell-state"));
  return out;
};

const radiusInventory = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"
      && Number(cs.opacity) > 0.01;
  };
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const px = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius]
      .map((v) => parseFloat(v) || 0);
    if (Math.max(...px) <= 0.5) continue;
    const r = el.getBoundingClientRect();
    let owner = null, n = el;
    while (n && n !== document.body) {
      const c = n.getAttribute && n.getAttribute("class");
      if (c && /[a-z]/.test(c)) { owner = c.slice(0, 70); break; }
      n = n.parentElement;
    }
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") || "").slice(0, 70),
      owner,
      radius: cs.borderRadius,
      box: [Math.round(r.width), Math.round(r.height)],
      bg: cs.backgroundColor,
      inChat: !!el.closest("[class*='chat'],[id*='chat'],[data-chat]"),
      inHeader: !!el.closest("[data-fullscreen-header],header"),
      inFooter: !!el.closest("footer,.tl-footer"),
    });
  }
  return out;
};

const browser = await launch();
const out = { negativeControl: {}, unknownSlug: {}, radius: {} };

{
  const c = await ctx(browser, { width: 1280, height: 900 });
  const page = await c.newPage();
  for (const route of ["/hakkimizda", "/hizmetler/cnc-frezeleme"]) {
    await goto(page, route);
    const green = await page.evaluate(detector);
    await page.evaluate(inject);
    await page.waitForTimeout(150);
    const red = await page.evaluate(detector);
    await page.evaluate(() => document.getElementById("qa-negative-control")?.remove());
    await page.waitForTimeout(150);
    const green2 = await page.evaluate(detector);
    out.negativeControl[route] = {
      beforeInject: green,
      afterInject_iconTiles: red.filter((t) => t.kidsWithIcon >= 3),
      afterInject_total: red.length,
      afterRemove: green2,
    };
  }
  await c.close();
}

{
  const c = await ctx(browser, { width: 1280, height: 900 });
  const page = await c.newPage();
  for (const route of [
    "/hizmetler/kategori/qa-bogus-slug",
    "/endustriyel/kategori/qa-bogus-slug",
    "/kabiliyetler/kategori/qa-bogus-slug",
    "/hizmetler/qa-bogus-slug",
    "/endustriyel/qa-bogus-slug",
    "/malzemeler/qa-bogus-slug",
    "/qa-bogus-route",
    "/hizmetler/kategori/yuzey-islemleri",
    "/endustriyel/kategori/yuksek-teknoloji",
  ]) {
    await goto(page, route);
    out.unknownSlug[route] = await page.evaluate(headings);
  }
  await c.close();
}

for (const vp of [{ width: 375, height: 812, mobile: true }, { width: 1280, height: 900 }]) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  for (const route of ["/malzemeler", "/hakkimizda", "/"]) {
    await goto(page, route);
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += window.innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 250));
    });
    out.radius[`${vp.width}|${route}`] = await page.evaluate(radiusInventory);
  }
  await c.close();
}

await browser.close();
log(out);
