import { Suspense, lazy, useMemo, useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navigate } from "@/i18n/LocaleLink";
import { applyLanguage, isLanguageReady } from "@/i18n";
import { isPanelPath, localeFromPath } from "@/i18n/locale";
import { PageTransition } from "@/components/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ShellLoading, ShellRouteBoundary } from "@/components/shell/ShellStates";
/* `ScrollProgress` WAS imported here and rendered on every public route EXCEPT
   `/` — one of the three undocumented per-route chrome differences Phase 04
   was sent to resolve (`reports/baseline/shell-inventory.md` §3 S4). It is
   gone, everywhere, deliberately:

     · The landing is the design source of truth and never had it.
     · Its bar is a `linear-gradient(90deg, forge-molten, forge-amber)` — an
       orange that exists in no other public surface and in none of the
       `--tl-*` tokens the rest of the shell is built from.
     · It duplicates the scrollbar, and re-renders on every scroll frame
       through a spring plus a velocity sampler.

   The divergence is resolved by removing the outlier, not by spreading it. */
import { isHeroIntroActive } from "@/lib/hero-shell";

const Index = lazy(() => import("./pages/Index").then((m) => ({ default: m.Index })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));
const SSS = lazy(() => import("./pages/SSS").then((m) => ({ default: m.SSS })));
const GizlilikPolitikasi = lazy(() =>
  import("./pages/GizlilikPolitikasi").then((m) => ({ default: m.GizlilikPolitikasi })),
);
const KVKK = lazy(() => import("./pages/KVKK").then((m) => ({ default: m.KVKK })));
const CerezPolitikasi = lazy(() => import("./pages/CerezPolitikasi").then((m) => ({ default: m.CerezPolitikasi })));
const Hakkimizda = lazy(() => import("./pages/Hakkimizda").then((m) => ({ default: m.Hakkimizda })));
const Iletisim = lazy(() => import("./pages/Iletisim").then((m) => ({ default: m.Iletisim })));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail").then((m) => ({ default: m.ServiceDetail })));
const Blog = lazy(() => import("./pages/Blog").then((m) => ({ default: m.Blog })));
const BlogDetail = lazy(() => import("./pages/BlogDetail").then((m) => ({ default: m.BlogDetail })));
/* PHASE 08 — the two surfaces §PHASE 08 requires and the site had no route
   for: the case-study/capability index + detail pair over
   `src/content/caseStudies.ts`, and the quality/resources document surface
   over the four §H PDFs. Both are registered in
   `src/components/navigation/ia.ts` under RESOURCES, so
   `e2e/landing/navigation-reachability.spec.ts` covers them rather than
   reporting them as orphans. */
const KabiliyetProfilleri = lazy(() =>
  import("./pages/KabiliyetProfilleri").then((m) => ({ default: m.KabiliyetProfilleri })),
);
const KabiliyetProfilDetay = lazy(() =>
  import("./pages/KabiliyetProfilDetay").then((m) => ({ default: m.KabiliyetProfilDetay })),
);
const KaliteDosyasi = lazy(() =>
  import("./pages/KaliteDosyasi").then((m) => ({ default: m.KaliteDosyasi })),
);
const AdminLogin = lazy(() => import("./pages/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then((m) => ({ default: m.ResetPassword })));
const Malzemeler = lazy(() => import("./pages/Malzemeler").then((m) => ({ default: m.Malzemeler })));
const MalzemeKategori = lazy(() => import("./pages/MalzemeKategori").then((m) => ({ default: m.MalzemeKategori })));
const TeklifAl = lazy(() => import("./pages/TeklifAl").then((m) => ({ default: m.TeklifAl })));
const MusteriPaneli = lazy(() => import("./pages/MusteriPaneli").then((m) => ({ default: m.MusteriPaneli })));
const CategoryPage = lazy(() => import("./pages/CategoryPage").then((m) => ({ default: m.CategoryPage })));

/**
 * Geliştirme-yalnız yüzeyler (`/technical-preview`, `/legacy-landing`, `/test`).
 *
 * `import.meta.env.DEV` üretimde sabit `false` olduğu için bu üçlü ifade ölü
 * dala düşer ve Rollup dinamik import'u tamamen atar: `dist/` içinde ne
 * `DevRoutes` chunk'ı ne de oradan ulaşılan `LandingFlow` / `TestHowWeWork` /
 * `TechnicalPreview` ağacı kalır. Sayfalar diskte durur, `npm run dev`'de
 * erişilebilir olmayı sürdürür.
 */
const DevRoute = import.meta.env.DEV
  ? lazy(() => import("./routes/DevRoutes"))
  : null;

const ProtectedRoute = lazy(() =>
  import("./components/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute })),
);
const CustomerProtectedRoute = lazy(() =>
  import("./components/CustomerProtectedRoute").then((m) => ({ default: m.CustomerProtectedRoute })),
);
const GlobalToasts = lazy(() =>
  import("./components/GlobalToasts").then((m) => ({ default: m.GlobalToasts })),
);

const ChatBot = lazy(() => import("@/components/ChatBot").then((m) => ({ default: m.ChatBot })));
const CustomCursor = lazy(() =>
  import("@/components/ui/CustomCursor").then((m) => ({ default: m.CustomCursor })),
);
const ScrollDebugPanel = lazy(() =>
  import("@/components/ScrollDebugPanel").then((m) => ({ default: m.ScrollDebugPanel })),
);

/* The route loader is a SHELL STATE now, not a library default. It used to be
   a bare `w-8 h-8 border-2 border-primary animate-spin` square — a spinner
   that belonged to no part of the design language and said nothing. The
   replacement is the shell's datum sweep with a mono status line; under
   `prefers-reduced-motion` the sweep stops and the status line carries the
   whole message. `.shell-boot` is used because this renders BEFORE any
   `PageShell` exists, so it has to bring its own ground. */
const PageLoader = () => (
  <div className="shell-boot">
    <ShellLoading label="YÜKLENİYOR" detail="Sayfa hazırlanıyor." fullHeight={false} />
  </div>
);

/**
 * Landing için Suspense fallback'i.
 *
 * `index.html`'deki app-shell (`#hero-shell`) hero'yu ilk baytta boyuyor ve
 * giriş sekansı (Precision Born) da onun içinde yaşıyor. Opak `PageLoader`
 * buraya konduğu sürece landing'de sekansın ve hero'nun üstünü kapatıp ekranı
 * boş bir spinner'a düşürüyordu (ölçüldü: sekansın ortasında ekran tamamen
 * boşalıyordu). Sekans sürerken zaten gösterilecek bir hero var — fallback
 * hiçbir şey boyamamalı.
 *
 * Bastırma koşulu elemanın VARLIĞINA değil, sekansın GERÇEKTEN çalışmasına
 * bağlı: eski hâlinde `#hero-shell` `/` rotasında hiç kaldırılmadığı için
 * Suspense fallback'i o rotada kalıcı olarak devre dışıydı.
 */
const PublicRouteLoader = () => {
  if (isHeroIntroActive()) return null;
  return <PageLoader />;
};


// Page transition handled by PageTransition component

const LOCALE_PREFIXES = ["", "/en"] as const;

/* The public route table, authored once with Turkish paths. */
const PUBLIC_PAGES: { path: string; element: ReactNode }[] = [
  { path: "/", element: <Index /> },
  { path: "/sss", element: <SSS /> },
  { path: "/gizlilik-politikasi", element: <GizlilikPolitikasi /> },
  { path: "/kvkk", element: <KVKK /> },
  { path: "/cerez-politikasi", element: <CerezPolitikasi /> },
  { path: "/hakkimizda", element: <Hakkimizda /> },
  { path: "/iletisim", element: <Iletisim /> },
  { path: "/malzemeler", element: <Malzemeler /> },
  { path: "/malzemeler/:slug", element: <MalzemeKategori /> },
  { path: "/blog", element: <Blog /> },
  { path: "/blog/:slug", element: <BlogDetail /> },
  { path: "/kabiliyet-profilleri", element: <KabiliyetProfilleri /> },
  { path: "/kabiliyet-profilleri/:slug", element: <KabiliyetProfilDetay /> },
  { path: "/kalite-dosyasi", element: <KaliteDosyasi /> },
  { path: "/hizmetler/kategori/:slug", element: <CategoryPage /> },
  { path: "/kabiliyetler/kategori/:slug", element: <CategoryPage /> },
  { path: "/endustriyel/kategori/:slug", element: <CategoryPage /> },
  { path: "/hizmetler/:slug", element: <ServiceDetail /> },
  { path: "/kabiliyetler/:slug", element: <ServiceDetail /> },
  { path: "/endustriyel/:slug", element: <ServiceDetail /> },
  { path: "/giris", element: <Login /> },
  { path: "/sifremi-unuttum", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/teklif-al", element: <TeklifAl /> },
  { path: "/cad-dashboard", element: <Navigate to="/teklif-al" replace /> },
];

/* L01 — the page waits for its language. On a public route the URL names the
   locale; until that locale is active with its dictionary loaded, the route
   shows the shell loader instead of a Turkish frame of an English page. */
function useRouteLanguageReady(pathname: string): boolean {
  const locale = isPanelPath(pathname) ? null : localeFromPath(pathname);
  const [ready, setReady] = useState(() => (locale ? isLanguageReady(locale) : true));
  useEffect(() => {
    if (!locale) { setReady(true); return; }
    if (isLanguageReady(locale)) { setReady(true); return; }
    let live = true;
    setReady(false);
    void applyLanguage(locale).finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, [locale]);
  return ready;
}

const AnimatedRoutes = () => {
  const location = useLocation();

  const isPanel = useMemo(() => {
    return location.pathname.startsWith("/admin") || location.pathname.startsWith("/musteri-paneli");
  }, [location.pathname]);

  const panelRoutes = (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/musteri-paneli"
          element={
            <CustomerProtectedRoute>
              <MusteriPaneli />
            </CustomerProtectedRoute>
          }
        />
        {/* `shell={false}`: the panel branch keeps its own chrome. Giving an
            admin 404 the public navigation and the site footer would be this
            phase reaching into a shell `USER_INPUTS.md` §N puts out of scope. */}
        <Route path="*" element={<NotFound shell={false} />} />
      </Routes>
    </Suspense>
  );

  /* `ShellRouteBoundary` is INSIDE the transition and OUTSIDE `<Routes>`: a
     page that throws while rendering loses its own body and keeps the header,
     the footer and the navigation, and leaving the route clears the error
     because the boundary resets on `resetKey`. Before Phase 04 a route crash
     took the whole document down to the app-level `ErrorBoundary` card in
     `src/main.tsx`, with no way back except a reload. */
  const publicRoutes = (
    <PageTransition>
      <ShellRouteBoundary resetKey={location.pathname}>
      <Suspense fallback={<PublicRouteLoader />}>
        <Routes location={location}>
          {/* DEV_ONLY_ROUTES:START — üretim derlemesinde `DevRoute` null olur,
              üç <Route> de hiç oluşturulmaz ve istekler `*` üzerinden 404'e
              düşer. Sözleşme e2e/shared-shell-accessibility.spec.ts'te. */}
          {DevRoute && <Route path="/technical-preview" element={<DevRoute view="technical-preview" />} />}
          {DevRoute && <Route path="/legacy-landing" element={<DevRoute view="legacy-landing" />} />}
          {DevRoute && <Route path="/test" element={<DevRoute view="test" />} />}
          {/* DEV_ONLY_ROUTES:END */}
          {/* L01 — every public page is registered twice: as it always was
              (Turkish) and under `/en` with the same slug (English). One
              table, so the two locales cannot drift apart. */}
          {LOCALE_PREFIXES.flatMap((prefix) =>
            PUBLIC_PAGES.map(({ path, element }) => (
              <Route key={`${prefix}${path}`} path={path === "/" ? prefix || "/" : `${prefix}${path}`} element={element} />
            )))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ShellRouteBoundary>
    </PageTransition>
  );

  return isPanel ? panelRoutes : publicRoutes;
};

const AppContent = () => {
  const location = useLocation();
  const languageReady = useRouteLanguageReady(location.pathname);

  // Konami Code easter egg
  useEffect(() => {
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let idx = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[idx]) {
        idx++;
        if (idx === KONAMI.length) {
          document.body.style.transition = "filter 0.3s";
          document.body.style.filter = "hue-rotate(45deg)";
          setTimeout(() => {
            document.body.style.filter = "hue-rotate(0deg)";
            setTimeout(() => { document.body.style.filter = ""; }, 500);
          }, 2000);
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isPanel = useMemo(() => {
    return location.pathname.startsWith("/admin") || location.pathname.startsWith("/musteri-paneli");
  }, [location.pathname]);

  const content = (
    <>
      <a
        href="#main-content"
        className="shared-skip-link fixed z-[10005] -translate-y-24 bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-lg focus:translate-y-0"
      >
        Ana içeriğe geç
      </a>
      <div id="shared-header-host" />
      <ScrollToTop />
      <AnimatedRoutes />
      {/* ── PER-ROUTE CHROME, DECIDED (Phase 04) ─────────────────────────
          Three global layers used to differ per route with no stated reason
          (`reports/baseline/shell-inventory.md` §4). Each is now settled:

          GlobalToasts — EVERY public route, `/` included. It was suppressed
            only on the landing, which meant a toast fired from the landing's
            band 13 RFQ hand-off had no surface to render into and was lost
            silently. The component paints nothing until something calls it,
            so there is no cost to mounting it everywhere and a real defect in
            not doing so.

          ChatBot — every public route, the landing included (revision 4:
            the owner wants the launcher on `/` as well). It hides while a
            footer control has focus (`shell.css`).

          ScrollProgress — removed from every route. See the import block. */}
      <Suspense fallback={null}>
        <GlobalToasts />
      </Suspense>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ScrollDebugPanel />
        </Suspense>
      )}
    </>
  );

  if (!languageReady) return <PageLoader />;
  return isPanel ? content : <SmoothScrollProvider>{content}</SmoothScrollProvider>;
};

/* No QueryClient or Tooltip provider: nothing in the app uses React Query or
   the Radix tooltip, and both sat in the entry chunk of every page. */
export const App = () => (
  <BrowserRouter>
    <PointerCursor />
    <AppContent />
  </BrowserRouter>
);

const PointerCursor = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <CustomCursor />
    </Suspense>
  );
};
