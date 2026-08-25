import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { MOTION_EASE, ROUTE_TRANSITION } from "@/config/motion-system";
import { Z } from "@/styles/z-index";

const ROUTE_NAMES: Record<string, string> = {
  "/": "ANASAYFA",
  "/hakkimizda": "HAKKIMIZDA",
  "/iletisim": "İLETİŞİM",
  "/teklif-al": "TEKLİF",
  "/malzemeler": "MALZEMELER",
  "/sss": "SSS",
  "/blog": "BLOG",
};

const PANEL_COUNT = 5;

const getPageName = (pathname: string) => {
  if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];
  if (pathname.startsWith("/hizmetler/")) return "HİZMET";
  if (pathname.startsWith("/kabiliyetler/")) return "KABİLİYET";
  if (pathname.startsWith("/endustriyel/")) return "ENDÜSTRİ";
  if (pathname.startsWith("/malzemeler/")) return "MALZEME";
  if (pathname.startsWith("/blog/")) return "İÇGÖRÜ";
  return "MAS TECHNIC";
};

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const pageName = getPageName(location.pathname);

  const { coverDuration, holdDuration, revealDuration, panelStagger } = ROUTE_TRANSITION;
  const total = coverDuration + holdDuration + revealDuration;

  if (prefersReducedMotion) {
    return (
      <div key={location.pathname} className="relative min-h-screen" data-route-transition>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Paneller AnimatePresence DIŞINDA ve animasyon CSS ile:
          giriş/çıkış eşleştirmesine bırakıldığında hiç oynamıyorlardı (125 karede
          yükseklik 0 — ölçüldü). framer-motion ile sürüldüğünde ise ana thread
          rota chunk'ını ayrıştırırken aç kalıp kapanma anını kaçırıyordu.
          `key={pathname}` sarmalayıcı rota değişiminde tek commit'te remount olur:
          animasyon başa sarar ve panel sayısı her an tam 5 kalır
          (e2e/motion-architecture.spec.ts:61). */}
      <div key={location.pathname} aria-hidden="true">
        {Array.from({ length: PANEL_COUNT }, (_, index) => (
          <div
            key={index}
            className="route-curtain-panel fixed inset-y-0 pointer-events-none overflow-hidden border-r border-white/[0.05]"
            data-route-curtain-panel
            style={{
              zIndex: Z.pageTransition,
              left: `${index * (100 / PANEL_COUNT)}%`,
              width: `${100 / PANEL_COUNT + 0.08}%`,
              backgroundColor: "var(--bg-dark-obsidian)",
              ["--curtain-index" as string]: String(index),
              ["--curtain-duration" as string]: `${total}s`,
              ["--curtain-stagger" as string]: `${panelStagger}s`,
            }}
          >
            <span className="absolute inset-y-0 right-0 w-px bg-primary/25" />
            <span className="absolute bottom-8 right-4 font-mono text-[9px] tracking-[0.3em] text-white/20">
              0{index + 1}
            </span>
          </div>
        ))}
      </div>

    {/* "sync": paneller artık AnimatePresence'ın D I Ş I N D A ve CSS ile sürülüyor,
        dolayısıyla "wait"e geçme gerekçesi (çift route-transition düğümü) ortadan
        kalktı. "wait" her gezinmeye ~0.5 sn gecikme ekleyip çok-rotalı yolculuk
        testini düşürüyordu (ölçüldü). */}
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={`${location.pathname}-label`}
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: Z.pageTransition + 1 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: ROUTE_TRANSITION.revealDuration,
            times: [0, 0.52, 1],
            ease: MOTION_EASE.precision,
          }}
          aria-hidden="true"
          data-route-curtain-label
        >
          <div className="flex flex-col items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.48em] text-primary">
              MAS / PRECISION
            </span>
            <span className="font-mono text-[clamp(2rem,7vw,6rem)] font-semibold tracking-[-0.06em] text-white">
              {pageName}
            </span>
            <span className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
      </motion.div>

      <motion.div
        key={`${location.pathname}-content`}
          className="relative min-h-screen"
          data-route-transition
          initial={{
            opacity: 0.35,
            y: ROUTE_TRANSITION.contentOffset,
            filter: `blur(${ROUTE_TRANSITION.blur}px)`,
          }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{
            opacity: 0.4,
            scale: 0.992,
            filter: `blur(${ROUTE_TRANSITION.blur / 2}px)`,
          }}
          transition={{
            duration: ROUTE_TRANSITION.contentDuration,
            ease: MOTION_EASE.enter,
          }}
        >
          {children}
      </motion.div>
    </AnimatePresence>
    </>
  );
};
