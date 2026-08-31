import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Referans pafta 01–14 arası bantlardan oluşur; sıra ve numaralandırma sözleşmedir. */
const BAND_INDICES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"];

test.describe("technical editorial landing phase 1", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("renders the frame, hero, annotations and proof strip", async ({ page }) => {
    await expect(page.getByTestId("technical-landing-root")).toBeVisible();
    await expect(page.getByTestId("technical-hero-title")).toBeVisible();
    await expect(page.getByLabel("Ölçümlendirilmiş örnek CNC manifold parçası")).toBeVisible();
    await expect(page.getByRole("region", { name: "Üretim kabiliyeti özeti" })).toBeVisible();
    await expect(page.getByTestId("technical-hero-cta")).toHaveAttribute("href", "/teklif-al");
  });

  test("numbers every band of the drawing sheet in order", async ({ page }) => {
    const indices = await page.locator(".tl-band-index span").allTextContents();
    expect(indices).toEqual(BAND_INDICES);
  });

  test("does not create document-level horizontal overflow", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps the shared sheet rail and viewport column contract", async ({ page }) => {
    const contract = await page.getByTestId("technical-landing-root").evaluate((root) => {
      const styles = getComputedStyle(root);
      const bands = [...root.querySelectorAll<HTMLElement>(".tl-band")];
      return {
        rail: styles.getPropertyValue("--tl-rail").trim(),
        columns: styles.getPropertyValue("--tl-cols").trim(),
        bandLefts: bands.map((band) => Math.round(band.getBoundingClientRect().left)),
        railRights: bands.map((band) => Math.round(band.querySelector<HTMLElement>(".tl-band-index")!.getBoundingClientRect().right)),
      };
    });
    expect(new Set(contract.bandLefts).size).toBe(1);
    expect(new Set(contract.railRights).size).toBe(1);
    // Phase 02: mobilde ray artık 42px. Eski liste yalnızca 56/64 kabul
    // ediyordu ve bu, DÜZELTİLEN KUSURU kodluyordu: mobil medya sorgusu
    // `--tl-cols`'u sıfırlarken `--tl-rail`'i hiç sıfırlamıyor, dolayısıyla
    // tablet değeri olan 56px'i miras alıyordu — 375px'te ekranın %14.9'u,
    // 320px'te %17.5'i. Değer listesi genişletildi ve iddia ZAYIFLATILMADI:
    // aşağıya raysın gerçek sözleşmesi (görüntü alanının %15'inin altında,
    // mas-grid-system) ölçülen bir kontrol olarak eklendi.
    expect(["42px", "56px", "64px"]).toContain(contract.rail);
    expect(["4", "6", "12"]).toContain(contract.columns);
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(Number.parseFloat(contract.rail) / viewportWidth,
      `rail must not consume an excessive share of a ${viewportWidth}px viewport`)
      .toBeLessThan(0.15);

    // Ray etiketleri her genişlikte soldan sağa okunur ve raydan taşmaz.
    const etiketler = await page.locator(".tl-band-index small").evaluateAll((els) =>
      els.map((el) => ({
        yon: getComputedStyle(el).writingMode,
        tasma: el.getBoundingClientRect().width - el.parentElement!.getBoundingClientRect().width,
      })));
    expect(etiketler.every((e) => e.yon === "horizontal-tb")).toBe(true);
    expect(Math.max(...etiketler.map((e) => e.tasma))).toBeLessThanOrEqual(0);
  });

  test("renders the capability marquee with its loop copy hidden from assistive tech", async ({ page }) => {
    const marquee = page.getByRole("region", { name: "Üretim kabiliyetleri" });
    await expect(marquee).toBeVisible();
    // Kesintisiz döngü için liste iki kez basılır; kopya erişilebilirlik ağacında olmamalı.
    await expect(marquee.locator(".tl-marquee-track > ul")).toHaveCount(2);
    await expect(marquee.locator(".tl-marquee-track > ul[aria-hidden='true']")).toHaveCount(1);
    await expect(marquee.getByRole("listitem").filter({ hasText: "MONTAJ & BİRLEŞTİRME" })).toHaveCount(1);
  });

  test("moves the two visual bands against the scroll without hijacking input", async ({ page }) => {
    const sections = page.locator("[data-reverse-scroll]");
    await expect(sections).toHaveCount(2);

    // Mobil dahil her genişlikte açık; tek kapanma koşulu reduced-motion.
    for (let i = 0; i < 2; i += 1) {
      await expect(sections.nth(i)).toHaveAttribute("data-reverse-scroll-enabled", "true");
    }

    // Kapsayıcı, yolculuğu örtecek kadar büyütülmeli: boşluk açılmamalı.
    const covered = await sections.first().evaluate((el) => {
      const parent = el.parentElement!.getBoundingClientRect();
      const self = el.getBoundingClientRect();
      const distance = parseFloat(getComputedStyle(el).getPropertyValue("--reverse-distance"));
      return { overshootTop: parent.top - self.top, overshootBottom: self.bottom - parent.bottom, distance };
    });
    expect(covered.distance).toBeGreaterThan(0);
    expect(covered.overshootTop).toBeGreaterThanOrEqual(covered.distance - 1);
    expect(covered.overshootBottom).toBeGreaterThanOrEqual(covered.distance - 1);

    // Native scroll korunmalı: aşağı kaydırınca sayfa aşağı gitmeli.
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });

  test("renders process, NEXUS and measured project evidence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Karardan parçaya/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /siz sormadan görünür/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "NEXUS örnek iş emirleri" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "SEÇİLMİŞ PROJELER" })).toBeVisible();
    await expect(page.getByText(/ÖLÇÜM DEĞERLERİ TEMSİLÎDİR/)).toBeVisible();
    await expect(page.getByText("RAPOR NO: MT-2024-0512")).toBeVisible();
  });

  test("renders sectors, the quality file and the reference band", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Çalıştığımız sektörler" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /İDDİA EDİLMEZ/ })).toBeVisible();
    for (const code of ["ISO 9001:2015", "AS9100D", "ISO 14001:2015"]) {
      await expect(page.getByRole("heading", { name: code, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("region", { name: "Referanslar" })).toBeVisible();
    await expect(page.getByText("METSAN", { exact: true })).toBeVisible();
    await expect(page.locator(".tl-reference-grid li")).toHaveCount(6);
    // En uzun isimler bile hücreden taşmamalı.
    const tasma = await page.locator(".tl-reference-grid li").evaluateAll((els) =>
      els.map((el) => el.scrollWidth - el.clientWidth));
    expect(Math.max(...tasma)).toBeLessThanOrEqual(0);
  });

  test("keeps unpublished quality assets honest instead of faking downloads", async ({ page }) => {
    await expect(page.getByText("DOĞRULAMA SERVİSİ HAZIRLANIYOR")).toBeVisible();
    await expect(page.locator(".tl-resource-title small")).toHaveText("HAZIRLANIYOR");
    // Kaynak satırları indirilebilir görünmemeli: link ya da buton olmamalı.
    await expect(page.locator(".tl-resource-list li a, .tl-resource-list li button")).toHaveCount(0);
  });

  test("renders FAQ answers and the RFQ hand-off", async ({ page }) => {
    const faq = page.getByText("Hangi dosya formatlarını destekliyorsunuz?");
    await faq.click();
    await expect(page.getByText(/STEP, STP, IGES/)).toBeVisible();
    const drop = page.getByTestId("technical-cad-drop");
    await expect(drop).toHaveText(/ÇİZİM DOSYANIZI SÜRÜKLEYİN/);
    expect(await drop.evaluate((el) => el.tagName)).toBe("BUTTON");
    // Format/boyut ipucu gerçek yükleyiciden türetilir; referanstaki 100 MB uydurma olurdu.
    await expect(drop).toHaveText(/Maks\. 50 MB/);
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("keeps reference proportions for headline, project cards and NEXUS rows", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1180, "masaüstü oran sözleşmesi");

    // A1: başlık referanstaki gibi üç satır.
    const lines = await page.getByTestId("technical-hero-title").evaluate((el) =>
      Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(3);

    // A2: öne çıkan kart küçüğün ~1.5 katı ve satırlar esnetilmemiş.
    const cards = await page.evaluate(() => {
      const feat = document.querySelector(".tl-project-featured")!;
      const small = document.querySelector(".tl-project-grid article:not(.tl-project-featured)")!;
      return {
        oran: feat.getBoundingClientRect().height / small.getBoundingClientRect().height,
        satir: feat.querySelector("tbody tr")!.getBoundingClientRect().height,
      };
    });
    expect(cards.oran).toBeGreaterThan(1.3);
    expect(cards.oran).toBeLessThan(1.7);
    expect(cards.satir).toBeLessThanOrEqual(44);

    // Görsel kartın dışına taşmamalı (kesin satır izi olmadan kare görsel kartı büyütüyordu).
    const tasma = await page.evaluate(() => {
      const feat = document.querySelector(".tl-project-featured")!;
      const img = feat.querySelector("img")!;
      return img.getBoundingClientRect().bottom - feat.getBoundingClientRect().bottom;
    });
    expect(tasma).toBeLessThanOrEqual(1);

    // A5: tablo sütunu doldururken satırlar aşırı esnememeli.
    const nexusRow = await page.evaluate(() =>
      document.querySelector(".tl-nexus-table-wrap tbody tr")!.getBoundingClientRect().height);
    expect(nexusRow).toBeLessThanOrEqual(44);

    // 13 RFQ referans düzeni: numara kutusuz ve başlığın üstünde, ayraç chevron,
    // dikey çizgi yok, bant kompakt.
    const rfq = await page.evaluate(() => {
      const li = document.querySelector(".tl-rfq-body>ol li")!;
      const b = li.querySelector("b")!;
      const strong = li.querySelector("strong")!;
      const cs = getComputedStyle(li);
      return {
        numaraKutulu: getComputedStyle(b).borderTopWidth !== "0px",
        numaraUstte: b.getBoundingClientRect().bottom <= strong.getBoundingClientRect().top + 1,
        dikeyCizgi: cs.borderLeftWidth !== "0px",
        ayrac: getComputedStyle(li, "::after").content.replace(/"/g, ""),
        bantOrani: document.querySelector(".tl-rfq")!.getBoundingClientRect().height / window.innerWidth,
      };
    });
    expect(rfq.numaraKutulu).toBe(false);
    expect(rfq.numaraUstte).toBe(true);
    expect(rfq.dikeyCizgi).toBe(false);
    expect(rfq.ayrac).toBe(">");
    expect(rfq.bantOrani).toBeLessThan(0.115);

    // 14 footer referans düzeni: başlık dolu (kontursuz), nav sütunları dikey
    // çizgiyle ayrılıyor, adres iki sütun, bant kompakt.
    const footer = await page.evaluate(() => {
      const h2 = getComputedStyle(document.querySelector(".tl-footer h2")!);
      const navDiv = getComputedStyle(document.querySelector(".tl-footer nav div")!);
      const adres = document.querySelector(".tl-footer address")!;
      const p = [...adres.querySelectorAll("p")];
      return {
        dolgu: h2.color,
        kontur: parseFloat(h2.getPropertyValue("-webkit-text-stroke-width")) || 0,
        navAyirac: navDiv.borderLeftWidth,
        adresSutun: new Set(p.map((el) => Math.round(el.getBoundingClientRect().left))).size,
        bantOrani: document.querySelector(".tl-footer")!.getBoundingClientRect().height / window.innerWidth,
      };
    });
    expect(footer.dolgu).not.toBe("rgba(0, 0, 0, 0)");
    expect(footer.kontur).toBe(0);
    expect(footer.navAyirac).not.toBe("0px");
    expect(footer.adresSutun).toBe(2);
    expect(footer.bantOrani).toBeLessThan(0.17);
    // Nav sütunu marka sütunu genişlerse kaymamalı.
    //
    // Phase 02: beklenen aralık ~%41'den ~%37'ye taşındı çünkü ALTINDAKİ
    // GEOMETRİ kasıtlı olarak değişti. Antet gövdesi `minmax(0,43fr)
    // minmax(0,77fr)` kullanıyordu — 120 birimlik, 12'lik master ızgaraya
    // çözülmeyen özel bir bölme; sınırı hiçbir master hatta düşmüyordu
    // (1600'de C4'ün 38.36px sağında ölçüldü) ve `IMPLEMENTATION.md` §7
    // PHASE 02 bunun kaldırılmasını açıkça istiyor. Artık master 4 / 8.
    // Nav sütunu master hat 4'te başlıyor: içerik alanının tam üçte biri,
    // artı sütunun kendi 16px dolgusu. 1280/1440/1600'de sırasıyla %38.0 /
    // %37.4 / %37.0 ölçüldü.
    //
    // İDDİA ZAYIFLATILMADI: aralık hâlâ ±%1.5 genişliğinde ve marka sütunu
    // bir master sütun kadar (≥%7) genişlerse test yine kırmızıya düşer.
    // Kenarın master hatta oturduğu ayrıca
    // `e2e/landing/landing-grid-axes.spec.ts` içinde ölçülüyor.
    const navBaslangic = await page.evaluate(() => {
      const el = document.querySelector(".tl-footer nav h3");
      const r = document.createRange();
      r.selectNodeContents(el);
      return (r.getBoundingClientRect().left / window.innerWidth) * 100;
    });
    expect(navBaslangic).toBeGreaterThan(36.5);
    expect(navBaslangic).toBeLessThan(39.5);

    // Filigran: çizginin üstü net, altı bulanık kopya. İki kopya aynı ölçüyü
    // paylaşmalı (ayrı ayrı ayarlanırsa hizaları kayar) ve nav linklerine değmemeli.
    const filigran = await page.evaluate(() => {
      const body = document.querySelector(".tl-footer-body")!.getBoundingClientRect();
      const tb = document.querySelector(".tl-title-block")!.getBoundingClientRect();
      const net = getComputedStyle(document.querySelector(".tl-footer-body")!, "::before");
      const bulanik = getComputedStyle(document.querySelector(".tl-title-block")!, "::before");
      const satir = parseFloat(net.lineHeight);
      const ust = body.bottom - parseFloat(net.bottom) - satir;
      const navAlt = Math.max(...[...document.querySelectorAll(".tl-footer nav a")]
        .map((a) => a.getBoundingClientRect().bottom));
      return {
        ayniOlcu: net.fontSize === bulanik.fontSize && net.bottom === bulanik.bottom,
        bulaniklik: bulanik.filter,
        navBosluk: ust - navAlt,
        cizgiOrani: (tb.top - ust) / satir,
      };
    });
    expect(filigran.ayniOlcu).toBe(true);
    expect(filigran.bulaniklik).toMatch(/blur/);
    expect(filigran.navBosluk).toBeGreaterThan(8);
    expect(filigran.cizgiOrani).toBeGreaterThan(0.3);
    expect(filigran.cizgiOrani).toBeLessThan(0.7);

    // 12 SSS: referansta sağ sütun kendi akışında — KAYNAKLAR başlığının hemen
    // altından başlar ve bandın tamamına yayılır; SSS listesiyle hizalı DEĞİLDİR.
    const kaynak = await page.evaluate(() => {
      const govde = document.querySelector(".tl-faq-body")!.getBoundingClientRect();
      const baslik = document.querySelector(".tl-resource-title")!.getBoundingClientRect();
      const satir = [...document.querySelectorAll(".tl-resource-list li")];
      const soru = [...document.querySelectorAll(".tl-faq details")];
      return {
        baslikBoslugu: satir[0].getBoundingClientRect().top - baslik.bottom,
        ustBaslangic: satir[0].getBoundingClientRect().top - govde.top,
        kaynakSatir: satir[0].getBoundingClientRect().height,
        sssSatir: soru[0].getBoundingClientRect().height,
        ayirac: getComputedStyle(document.querySelector(".tl-resource")!).borderLeftWidth,
      };
    });
    // Liste kendi başlığına yapışık başlamalı — SSS'e hizalanmak için aşağı itilmemeli.
    expect(kaynak.baslikBoslugu).toBeLessThanOrEqual(20);
    expect(kaynak.ustBaslangic).toBeLessThan(60);
    // Referansta kaynak satırları SSS satırlarından seyrek.
    expect(kaynak.kaynakSatir).toBeGreaterThanOrEqual(kaynak.sssSatir);
    expect(kaynak.ayirac).not.toBe("0px");
  });

  test("has no serious or critical accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include(".tl-root").analyze();
    const blocking = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
    expect(blocking).toEqual([]);
  });

  /**
   * The landing used to have its OWN mobile dialog ("Mobil navigasyon") with a
   * hand-rolled focus trap, separate from the inner pages' overlay. There is
   * one menu now ("Ana menü") and it is the same object at every width, so the
   * contract is asserted at every width rather than only on mobile — a strictly
   * wider assertion than the one it replaces.
   */
  test("the one global menu traps focus, locks scroll and restores the trigger", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Menüyü aç" });
    await trigger.click();
    const menu = page.getByRole("dialog", { name: "Ana menü" });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("aria-modal", "true");
    await expect(page.locator("#root")).toHaveAttribute("inert", "");
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
    const focusable = menu.locator('a[href]:visible, button:not([disabled]):visible');
    await focusable.last().focus();
    await page.keyboard.press("Tab");
    await expect(focusable.first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
  });

  test("keeps the global header free of serious accessibility violations", async ({ page }) => {
    // `.tl-root` axe coverage above cannot see the header any more: it renders
    // through the `#shared-header-host` portal, outside the landing subtree.
    const closed = await new AxeBuilder({ page }).include("[data-fullscreen-header]").analyze();
    expect(closed.violations.filter((item) =>
      item.impact === "serious" || item.impact === "critical")).toEqual([]);
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    const open = await new AxeBuilder({ page }).include("[data-fullscreen-menu]").analyze();
    expect(open.violations.filter((item) =>
      item.impact === "serious" || item.impact === "critical")).toEqual([]);
    await page.keyboard.press("Escape");
  });

  test("reduced motion keeps the complete page visible without active animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.getByTestId("technical-landing-root")).toHaveAttribute("data-motion", "reduced");
    await expect(page.getByTestId("technical-hero-title")).toBeVisible();
    const animated = await page.locator(".tl-root *").evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).animationName !== "none").length);
    expect(animated).toBe(0);
  });
});
