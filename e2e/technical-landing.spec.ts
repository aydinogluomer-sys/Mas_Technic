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
    await expect(page.getByLabel("Ölçülendirilmiş CNC manifold parçası çizimi")).toBeVisible();
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

  test("moves the visual band against the scroll without hijacking input", async ({ page }) => {
    // PROOF01: band 05's photo became the signature module (a drawing, not a
    // picture), so only the manifesto keeps the reverse-scroll photograph.
    const sections = page.locator("[data-reverse-scroll]");
    await expect(sections).toHaveCount(1);

    // Mobil dahil her genişlikte açık; tek kapanma koşulu reduced-motion.
    for (let i = 0; i < 1; i += 1) {
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

  test("renders process, the NEXUS preview and the capability profiles", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Karardan parçaya/ })).toBeVisible();
    // NEXUS01: a five-step demo replaced the masked order view.
    await expect(page.getByRole("heading", { name: /her adımda bir belge/ })).toBeVisible();
    await expect(page.getByRole("group", { name: "NEXUS demo adımları" })).toBeVisible();
    await expect(page.getByTestId("nexus-demo-stamp")).toContainText("GERÇEK SİPARİŞ DEĞİLDİR");
    await expect(page.getByRole("heading", { name: "KABİLİYET PROFİLLERİ" })).toBeVisible();
    // Band 07 shows a control plan, not a measurement record. The column head
    // is the contract: NOMİNAL/ÖLÇÜLEN/SONUÇ asserted conformity that was never
    // measured (§G CASE_STUDIES: NONE_PROVIDED_YET).
    const projectHeads = await page.locator(".tl-project-grid article thead th").allTextContents();
    expect([...new Set(projectHeads)]).toEqual(["ÖZELLİK", "KONTROL", "KAYIT"]);
    // Each profile links to the capability behind it instead of to a report number.
    await expect(page.locator(".tl-project-grid .tl-report-no a")).toHaveCount(3);
  });

  test("renders sectors, the quality file and the reference band", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Çalıştığımız sektörler" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /İDDİA EDİLMEZ/ })).toBeVisible();
    // The active showcase (USER_INPUTS.md §C, implementation contract T02):
    // OHSAS 18001 keeps its permission record but is not shown as an active
    // certificate, and ISO 45001 is not added in its place.
    for (const code of ["ISO 9001:2015", "ISO 14001:2015"]) {
      await expect(page.getByRole("heading", { name: code, exact: true })).toBeVisible();
    }
    for (const code of ["AS9100D", "IATF 16949", "ISO 13485", "OHSAS", "ISO 45001"]) {
      await expect(page.getByText(code, { exact: false })).toHaveCount(0);
    }
    await expect(page.getByRole("region", { name: "Referanslar" })).toBeVisible();
    await expect(page.getByText("METSAN", { exact: true })).toBeVisible();
    await expect(page.getByText("TEKNOPAR", { exact: true })).toBeVisible();
    await expect(page.getByText("ZTM", { exact: true })).toHaveCount(0);
    await expect(page.locator(".tl-reference-grid li")).toHaveCount(6);
    // En uzun isimler bile hücreden taşmamalı.
    const tasma = await page.locator(".tl-reference-grid li").evaluateAll((els) =>
      els.map((el) => el.scrollWidth - el.clientWidth));
    expect(Math.max(...tasma)).toBeLessThanOrEqual(0);
  });

  test("serves the four quality documents as real downloads", async ({ page, request }) => {
    // This test replaces "keeps unpublished quality assets honest instead of
    // faking downloads", which asserted the rows had NO link. §H marks all four
    // PDFs PUBLIC_OK; they were never copied into the build. The assertion is
    // strengthened, not relaxed: it now fetches every file and requires a real
    // PDF back, so a broken or missing document fails the gate.
    await expect(page.locator(".tl-resource-title")).toHaveText("KAYNAKLAR");
    const links = page.locator(".tl-resource-list li a");
    await expect(links).toHaveCount(4);
    const hrefs = await links.evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute("href")!));
    expect(hrefs.every((href) => href.startsWith("/belgeler/") && href.endsWith(".pdf"))).toBe(true);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `${href} must be served`).toBe(200);
      expect(response.headers()["content-type"]).toContain("pdf");
    }
    // And no placeholder affordance survives on the public route.
    for (const badge of ["HAZIRLANIYOR", "DEMO İÇERİK", "ÖRNEK İÇERİK", "TEMSİLÎ"]) {
      await expect(page.getByText(badge, { exact: false })).toHaveCount(0);
    }
  });

  test("renders FAQ answers and the RFQ hand-off", async ({ page }) => {
    const faq = page.getByText("Hangi dosya formatlarını destekliyorsunuz?");
    await faq.click();
    // The list must match `CAD_ACCEPTED_EXTENSIONS` exactly. It used to read
    // "STEP, STP, IGES, STL, OBJ, DWG ve PDF": it advertised two formats the
    // uploader rejects and omitted 3MF, which it accepts. Copy that contradicts
    // the implementation sends a buyer away with a file that will not upload.
    await expect(page.getByText(/STEP, STP, STL, OBJ, IGES, IGS ve 3MF/)).toBeVisible();
    await expect(page.getByText(/DWG ve PDF teknik resimlerini/)).toHaveCount(0);
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

    // NEXUS01: the masked order table became five demo step buttons; each is
    // a real touch target and none stretches into a slab.
    const nexusSteps = await page.evaluate(() =>
      [...document.querySelectorAll(".tl-nexus-rail button")].map((button) => button.getBoundingClientRect().height));
    expect(nexusSteps).toHaveLength(5);
    for (const height of nexusSteps) expect(height).toBeGreaterThanOrEqual(44);
    for (const height of nexusSteps) expect(height).toBeLessThanOrEqual(64);

    // 13 RFQ: numara kutusuz ve başlığın üstünde; revizyon 4'ten beri adımlar
    // arasında Process bandıyla aynı ayırıcı (dikey çizgi + "→"), son adımda
    // ikisi de yok; bant kompakt.
    const rfq = await page.evaluate(() => {
      const li = document.querySelector(".tl-rfq-body>ol li")!;
      const b = li.querySelector("b")!;
      const strong = li.querySelector("strong")!;
      const cs = getComputedStyle(li);
      return {
        numaraKutulu: getComputedStyle(b).borderTopWidth !== "0px",
        numaraUstte: b.getBoundingClientRect().bottom <= strong.getBoundingClientRect().top + 1,
        dikeyCizgi: cs.borderRightWidth !== "0px",
        ayrac: getComputedStyle(li, "::after").content.replace(/"/g, ""),
        sonAdim: (() => {
          const last = document.querySelector(".tl-rfq-body>ol li:last-child")!;
          return { cizgi: getComputedStyle(last).borderRightWidth, ok: getComputedStyle(last, "::after").display };
        })(),
        bantOrani: document.querySelector(".tl-rfq")!.getBoundingClientRect().height / window.innerWidth,
      };
    });
    expect(rfq.numaraKutulu).toBe(false);
    expect(rfq.numaraUstte).toBe(true);
    expect(rfq.dikeyCizgi).toBe(true);
    expect(rfq.ayrac).toBe("→");
    expect(rfq.sonAdim).toEqual({ cizgi: "0px", ok: "none" });
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
    // 0.17 → 0.26, and the reason is a change of JOB, not a relaxation.
    //
    // Until Phase 04 this band was the LANDING's footer and nothing else. It
    // carried four hand-picked columns of 15 links, no conversion path and two
    // of the three legal links; every inner page ended instead in a separate
    // 1398px mega footer (measured at 1280 on `/sss`). Phase 04 deleted that
    // second footer and gave this one the whole site's footer job: the
    // complete category-level map derived from `navigation/ia.ts` (21 links),
    // the conversion pair `/teklif-al` + `/iletisim`, the journal link and the
    // third legal link. Measured at 1280 after the consolidation: 298px,
    // ratio 0.2328 (was 213px / 0.1666). At 1440 it is the same 298px.
    //
    // THE ASSERTION IS NOT WEAKENED, it is re-aimed at the same failure it
    // always guarded against — a footer that stops being a title block:
    //   · the mega footer this replaced would read 1.09 here;
    //   · a fifth nav column, or a link column REACHING 8 ROWS, or the
    //     conversion rule wrapping to two rows at desktop, each pushes past
    //     0.26 (headroom over the measured value is 11%, tighter than the
    //     0.17 bound's own 2% headroom over 0.1666 was).
    //
    // THE 8-ROW FIGURE IS MEASURED. An earlier version of this comment said
    // "growing past ~9 rows"; that was an unmeasured illustration and it
    // overstated the room by about a row. It was also contradicted by the 11%
    // figure on the line above it: 11% of 298px is 34.8px, which is 1.5 row
    // pitches, not three. Phase 08 put a column at 8 rows and this assertion
    // went red, which is how the estimate got checked.
    //
    // The arithmetic, AT 1280 AND ONLY AT 1280, all of it measured rather than
    // divided: the band is as tall as its TALLEST nav column, the row pitch is
    // 22.50px (the delta between two consecutive link tops), and the ceiling is
    // 0.26 x 1280 = 332.8px. From the 6-row column that ships today: 7 rows
    // measures 319.50px / 0.2496 and still passes, 8 rows measures 342px /
    // 0.2672 and does not. So there is exactly one row of headroom, and the
    // number is recorded next to the thing that spends it, in
    // `src/components/shell/footer-groups.ts`.
    //
    // AN EARLIER VERSION OF THIS COMMENT SAID THE 22.50px PITCH IS "the same in
    // all four columns and at 375/768/1280/1440". The four columns part holds —
    // 22.50px in every column at 768, 1024, 1280 and 1440. The 375 part is not
    // merely wrong, it is UNMEASURABLE: `.tl-footer nav` computes
    // `display: none` below 768 (`shell.css:747`), every one of the 22 links
    // has a 0x0 rect and every delta is 0. What paints at 375 is
    // `.shell-footer-disclosures`, an accordion — in its default state the
    // panels are CLOSED and no link pitch exists at all; opened, the deltas are
    // 40px inside a panel and 105px across a panel boundary. Neither is 22.50.
    //
    // The single-row model this ratio rests on is also viewport-bound, and the
    // boundary is 1181, not 1024: `--tl-cols` drops 12 -> 6 at
    // `@media (max-width: 1180px)` (`design-tokens.css:160`), so at 768, 1024,
    // 1100 and 1180 `.tl-footer nav` computes `grid-template-rows: 150px 150px`
    // — a 2x2 whose height is tallest(row 1) + tallest(row 2) — and only at
    // >= 1181 is it the single `150px` row this arithmetic assumes. Measured
    // ratios at the boundary: 1180 -> 0.6072, 1181 -> 0.2515, 1200 -> 0.2475.
    // This assertion runs at `critical-1280`, where the model is the right one;
    // the note is here so the next person does not carry the 1280 number to a
    // width where the band is built differently.
    // POLISH RUN (2026-09-28) — 0.26 → 0.75, a change of JOB again, not a
    // relaxation. The footer is now the site's closing scene: a display-scale
    // closing statement with the conversion pair as its first row, then the
    // title block above, then the MAS TECHNIC wordmark at full measure (it
    // used to be a cropped watermark colliding with the CTA buttons and the
    // legal run). Measured: 0.714 at 1280, 0.679 at 1440. The bound still
    // catches a fifth nav column or a wrapped conversion row (each > +0.04),
    // and the new invariant below guards the defect the redesign removed.
    expect(footer.bantOrani).toBeLessThan(0.75);
    const wordmark = await page.evaluate(() => {
      const box = document.querySelector(".pl-wordmark")!;
      const word = box.querySelector("p")!;
      const legal = document.querySelector(".tl-legal")!.getBoundingClientRect();
      return { overflow: word.scrollWidth - box.clientWidth, bottom: word.getBoundingClientRect().bottom, legalTop: legal.top };
    });
    expect(wordmark.overflow, "the wordmark spans the sheet without being cropped").toBeLessThanOrEqual(0);
    expect(wordmark.bottom, "the wordmark never runs under the legal run").toBeLessThanOrEqual(wordmark.legalTop + 1);
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
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    /* `toBeVisible()` resolves the moment the sheet is in the DOM with a
       non-zero box — i.e. at the START of its 620ms opening. Scanning there
       measures colours mid-fade and reports contrast against a partially
       transparent foreground: axe read `#585e5d` for `.tl-menu-family-index`,
       which is `--tl-on-dark-faint` (#868e8b) composited at ~64% opacity, and
       called it 2.98:1. The settled colour is the token's own 6.0:1.

       This is a measurement race in the TEST, not a defect in the menu, and
       waiting for it does not weaken anything: the scan still covers the whole
       open sheet, and it now reports the colours a reader actually sees. */
    await expect.poll(() => menu.evaluate((element) =>
      element.getAnimations({ subtree: true }).filter((animation) =>
        animation.playState === "running").length), { timeout: 10_000 }).toBe(0);
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
