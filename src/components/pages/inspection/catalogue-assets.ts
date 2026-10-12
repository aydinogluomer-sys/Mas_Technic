import { DETAIL_VISUALS } from "@/content/detail-visuals";

/* Exact approved manifest stems, with only their numeric image derivatives. */
const images = import.meta.glob<string>([
  "/src/assets/hero-cnc-frezeleme.webp",
  "/src/assets/hero-cnc-frezeleme-[0-9]*.webp",
  "/src/assets/hero-cnc-tornalama.webp",
  "/src/assets/hero-cnc-tornalama-[0-9]*.webp",
  "/src/assets/hero-mikro-isleme.webp",
  "/src/assets/hero-mikro-isleme-[0-9]*.webp",
  "/src/assets/hero-derin-delik.webp",
  "/src/assets/hero-derin-delik-[0-9]*.webp",
  "/src/assets/hero-enjeksiyon-kalibi.webp",
  "/src/assets/hero-enjeksiyon-kalibi-[0-9]*.webp",
  "/src/assets/hero-basincli-dokum.webp",
  "/src/assets/hero-basincli-dokum-[0-9]*.webp",
  "/src/assets/hero-silikon-kaliplama.webp",
  "/src/assets/hero-silikon-kaliplama-[0-9]*.webp",
  "/src/assets/hero-fikstur-aparat.webp",
  "/src/assets/hero-fikstur-aparat-[0-9]*.webp",
  "/src/assets/hero-mekanik-yuzey.webp",
  "/src/assets/hero-mekanik-yuzey-[0-9]*.webp",
  "/src/assets/hero-anodizasyon.webp",
  "/src/assets/hero-anodizasyon-[0-9]*.webp",
  "/src/assets/hero-boya-kaplama.webp",
  "/src/assets/hero-boya-kaplama-[0-9]*.webp",
  "/src/assets/hero-lazer-kazima.webp",
  "/src/assets/hero-lazer-kazima-[0-9]*.webp",
  "/src/assets/hero-qr-datamatrix.webp",
  "/src/assets/hero-qr-datamatrix-[0-9]*.webp",
  "/src/assets/hero-logo-markalama.webp",
  "/src/assets/hero-logo-markalama-[0-9]*.webp",
  "/src/assets/hero-insert-uygulama.webp",
  "/src/assets/hero-insert-uygulama-[0-9]*.webp",
  "/src/assets/hero-kitting-paketleme.webp",
  "/src/assets/hero-kitting-paketleme-[0-9]*.webp",
  "/src/assets/hero-kaynakli-imalat.webp",
  "/src/assets/hero-kaynakli-imalat-[0-9]*.webp",
  "/src/assets/hero-cnc.webp",
  "/src/assets/hero-cnc-[0-9]*.webp",
  "/src/assets/hero-malzeme-kutuphanesi.webp",
  "/src/assets/hero-malzeme-kutuphanesi-[0-9]*.webp",
  "/src/assets/quality-control.webp",
  "/src/assets/quality-control-[0-9]*.webp",
  "/src/assets/hero-tolerans-hassasiyet.webp",
  "/src/assets/hero-tolerans-hassasiyet-[0-9]*.webp",
  "/src/assets/blog-dfm.webp",
  "/src/assets/blog-dfm-[0-9]*.webp",
  "/src/assets/hero-yuzey-islemleri.webp",
  "/src/assets/hero-yuzey-islemleri-[0-9]*.webp",
  "/src/assets/hero-seri-uretim.webp",
  "/src/assets/hero-seri-uretim-[0-9]*.webp",
  "/src/assets/hero-proje-yonetimi.webp",
  "/src/assets/hero-proje-yonetimi-[0-9]*.webp",
  "/src/assets/hero-tedarik-zinciri.webp",
  "/src/assets/hero-tedarik-zinciri-[0-9]*.webp",
  "/src/assets/hero-havacilik.webp",
  "/src/assets/hero-havacilik-[0-9]*.webp",
  "/src/assets/industry-robotics.webp",
  "/src/assets/industry-robotics-[0-9]*.webp",
  "/src/assets/industry-automotive.webp",
  "/src/assets/industry-automotive-[0-9]*.webp",
  "/src/assets/industry-hydraulic.webp",
  "/src/assets/industry-hydraulic-[0-9]*.webp",
  "/src/assets/industry-piping.webp",
  "/src/assets/industry-piping-[0-9]*.webp",
  "/src/assets/industry-hvac.webp",
  "/src/assets/industry-hvac-[0-9]*.webp",
  "/src/assets/industry-renewable.webp",
  "/src/assets/industry-renewable-[0-9]*.webp",
  "/src/assets/industry-oilgas.webp",
  "/src/assets/industry-oilgas-[0-9]*.webp",
  "/src/assets/industry-power.webp",
  "/src/assets/industry-power-[0-9]*.webp",
  "/src/assets/industry-mining.webp",
  "/src/assets/industry-mining-[0-9]*.webp",
], { eager: true, query: "?url", import: "default" });
export function catalogueImage(slug: string) {
  const visual = DETAIL_VISUALS[slug];
  const stem = visual?.kind === "photo" ? visual.asset : visual?.photo?.asset;
  if (!stem) return null;
  const source = images[`/src/assets/${stem}.webp`];
  if (!source) return null;
  const candidates = Object.entries(images).flatMap(([path, url]) => {
    const name = path.split("/").pop() ?? "";
    const suffix = name.startsWith(`${stem}-`) ? name.slice(stem.length + 1) : "";
    return /^\d+\.webp$/.test(suffix) ? [{ width: Number(suffix.split(".")[0]), url }] : [];
  }).sort((a, b) => a.width - b.width);
  return { src: source, srcSet: candidates.map(({ url, width }) => `${url} ${width}w`).join(", ") || undefined };
}
