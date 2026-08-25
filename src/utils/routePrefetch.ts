/**
 * Rota modüllerini niyet anında önden yükler.
 *
 * Rota değişiminde tarayıcı lazy chunk'ı indirip ayrıştırırken ana thread
 * bloke oluyor; bu sırada sayfa geçiş perdesi ilerlese bile etkileşim
 * gecikiyor ve ilk boyama duraklıyor (ölçüldü: chunk ayrıştırması sırasında
 * rAF geri çağrıları hiç çalışmıyor). Menü açıldığında hedef modülleri
 * arka planda çözerek bu bloğu gezinmeden ÖNCEYE taşıyoruz.
 *
 * Aynı yolu iki kez yüklemez; `import()` zaten modül önbelleğine düşer,
 * `started` seti yalnız gereksiz mikro-task üretmemek için.
 */
const started = new Set<string>();

/** Yol → modül yükleyici. Yalnız menüden erişilen halka açık rotalar. */
const loaders: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/Index"),
  "/hakkimizda": () => import("@/pages/Hakkimizda"),
  "/iletisim": () => import("@/pages/Iletisim"),
  "/malzemeler": () => import("@/pages/Malzemeler"),
  "/sss": () => import("@/pages/SSS"),
  "/blog": () => import("@/pages/Blog"),
  "/teklif-al": () => import("@/pages/TeklifAl"),
};

/** Tek bir yolu önden yükler. Bilinmeyen yol sessizce yok sayılır.
 *  (Niyet-bazlı tekil ön yükleme için dışarı açık tutuluyor.) */
export function prefetchRoute(path: string) {
  const loader = loaders[path];
  if (!loader || started.has(path)) return;
  started.add(path);
  // Hata yutulur: ön yükleme en iyi çabadır, gezinmeyi asla engellememeli.
  void loader().catch(() => started.delete(path));
}

/** Menü açılışında en olası hedefleri boşta çözer. */
export function prefetchMenuRoutes() {
  if (typeof window === "undefined") return;
  const run = () => Object.keys(loaders).forEach(prefetchRoute);
  const idle = window.requestIdleCallback;
  if (typeof idle === "function") idle(run, { timeout: 1200 });
  else window.setTimeout(run, 200);
}
