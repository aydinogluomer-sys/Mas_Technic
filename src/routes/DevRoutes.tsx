import TechnicalPreview from "@/pages/TechnicalPreview";
import LegacyLanding from "@/pages/LegacyLanding";
import { TestHowWeWork } from "@/pages/TestHowWeWork";

/**
 * Geliştirme-yalnız yüzeyler.
 *
 * `/technical-preview`, `/legacy-landing` ve `/test` yayınlanabilir sayfalar
 * değil: birincisi `/` ile birebir aynı ağacı basan taranabilir bir kopya,
 * ikincisi başka bir tasarım dilindeki eski landing, üçüncüsü kendi metninde
 * "yalnızca sticky horizontal scroll davranışını doğrulamak için" var olduğunu
 * söyleyen bir deney sayfası.
 *
 * Üçü de `npm run dev` altında erişilebilir kalır; üretim derlemesinde ise
 * `App.tsx` bu modülü `import.meta.env.DEV` yanlış olan ölü bir dalda tutar,
 * böylece Rollup dinamik import'u ve buradan ulaşılan tüm ağacı (LandingFlow
 * dahil) `dist/` dışında bırakır.
 */
export type DevRouteView = "technical-preview" | "legacy-landing" | "test";

export default function DevRoute({ view }: { view: DevRouteView }) {
  if (view === "legacy-landing") return <LegacyLanding />;
  if (view === "test") return <TestHowWeWork />;
  return <TechnicalPreview />;
}
