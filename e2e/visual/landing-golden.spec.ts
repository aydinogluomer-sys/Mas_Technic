import { expect, test } from "@playwright/test";
import { freezeVisualState, gotoAndSettle, landingReady } from "../helpers";

/**
 * Altın (golden) görsel fark.
 *
 * Eskiden "görsel QA" yalnızca ekran görüntüsü EKLİYORDU (`fullpage-visual-qa`)
 * — hiçbir şeyle karşılaştırmadan. Burada gerçek bir `toHaveScreenshot()`
 * karşılaştırması yapılır; referanslar `e2e/__golden__/{platform}/{project}/`
 * altında saklanır. `{platform}` şart: yazı tipi rasterizasyonu işletim
 * sistemine göre değiştiği için platform-kör bir referans sahte fark üretir.
 *
 * Belirlenimli koşullar: `prefers-reduced-motion` proje düzeyinde açık
 * (`playwright.config.ts` `visual-*` projeleri), animasyonlar dondurulmuş,
 * tüm görseller decode edilmiş, yazı tipleri hazır.
 */
test.describe("landing golden screenshots", () => {
  test("matches the committed landing baseline", async ({ page }) => {
    // `playwright.config.ts` `visual-*` projeleri zaten `reducedMotion:
    // "reduce"` bildiriyor; burada AÇIKÇA da uygulanır. Ölçüldü: yalnız proje
    // ayarına güvenildiğinde `[data-reverse-scroll-enabled]` "true" kalıyor ve
    // framer yayı yakalama anında hâlâ hareket hâlinde oluyordu
    // (`matrix(1,0,0,1,0,-35)` → `-72`), bu da altın farkı oynak yapıyordu.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await page.waitForLoadState("networkidle");
    await freezeVisualState(page);

    // Belirlenimlilik ön koşulu, sessiz bir varsayım değil ölçülen bir iddia:
    // ters-scroll katmanları reduced-motion altında kapalı ve dönüşümsüz
    // olmalı. Yay (framer `useSpring`) hâlâ çalışıyorsa altın karşılaştırma
    // birkaç piksellik oynak bir kaymayla kırmızıya düşer (ölçüldü: 1440'ta
    // ~6 px dikey kayma).
    await expect
      .poll(() => page.locator("[data-reverse-scroll-content]").evaluateAll((nodes) =>
        nodes.map((node) => [
          node.parentElement?.getAttribute("data-reverse-scroll-enabled"),
          getComputedStyle(node).transform,
        ].join(":"))))
      .toEqual(["false:none", "false:none"]);

    await expect(page).toHaveScreenshot("landing-fullpage.png", {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      // ORANSAL pay bilerek KULLANILMIYOR. Önceki `maxDiffPixelRatio: 0.002`
      // 1280x3844'lük bir sayfada 9.840 piksellik bütçe demekti; ölçüldü:
      // referansa enjekte edilen 120x60'lık dolu bir dikdörtgen (7.200 piksel)
      // testi HÂLÂ geçiriyordu — yani kapı gerçek bir görsel değişikliği
      // yakalamıyordu. Yakalama belirlenimli hâle getirildikten sonra
      // (bkz. `freezeVisualState` ve yukarıdaki reduced-motion iddiası)
      // ardışık koşular birbirinin aynısı çıkıyor, bu yüzden bütçe mutlak ve
      // dar tutulur: yalnız kenar yumuşatma gürültüsüne yer bırakır.
      maxDiffPixels: 200,
      // Varsayılan 5 sn, Chromium'un büyük ölçek-küçültülmüş webp'leri düşük
      // kaliteli ilk rasterden yüksek kaliteliye yükseltmesine yetmiyordu:
      // "Failed to take two consecutive stable screenshots" ile düşüyordu
      // (ölçüldü, visual-1440). Süre uzatmak toleransı gevşetmez — yalnızca
      // karşılaştırmayı sayfa yakınsadıktan sonra yapar.
      timeout: 30_000,
    });
  });
});
