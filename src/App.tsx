import { Suspense, lazy, useMemo, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
// `useSoundEngine` was imported here and never called. The sound and theme
// toggles that used to sit in the public header are gone with Phase 03 — a CNC
// manufacturer's navigation has no product or brand reason to carry them — so
// this dead import goes with them. The hook itself stays: `CustomCursor`,
// `MagneticButton`, `BracketButton` and `HeroSection` still call it.
import { useAmbientGlow } from "@/hooks/useAmbientGlow";
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

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
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

const queryClient = new QueryClient();

// Page transition handled by PageTransition component

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );

  const publicRoutes = (
    <PageTransition>
      <Suspense fallback={<PublicRouteLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          {/* DEV_ONLY_ROUTES:START — üretim derlemesinde `DevRoute` null olur,
              üç <Route> de hiç oluşturulmaz ve istekler `*` üzerinden 404'e
              düşer. Sözleşme e2e/shared-shell-accessibility.spec.ts'te. */}
          {DevRoute && <Route path="/technical-preview" element={<DevRoute view="technical-preview" />} />}
          {DevRoute && <Route path="/legacy-landing" element={<DevRoute view="legacy-landing" />} />}
          {DevRoute && <Route path="/test" element={<DevRoute view="test" />} />}
          {/* DEV_ONLY_ROUTES:END */}
          <Route path="/sss" element={<SSS />} />
          <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/cerez-politikasi" element={<CerezPolitikasi />} />
          <Route path="/hakkimizda" element={<Hakkimizda />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/malzemeler" element={<Malzemeler />} />
          <Route path="/malzemeler/:slug" element={<MalzemeKategori />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/hizmetler/kategori/:slug" element={<CategoryPage />} />
          <Route path="/kabiliyetler/kategori/:slug" element={<CategoryPage />} />
          <Route path="/endustriyel/kategori/:slug" element={<CategoryPage />} />
          <Route path="/hizmetler/:slug" element={<ServiceDetail />} />
          <Route path="/kabiliyetler/:slug" element={<ServiceDetail />} />
          <Route path="/endustriyel/:slug" element={<ServiceDetail />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/teklif-al" element={<TeklifAl />} />
          <Route path="/cad-dashboard" element={<Navigate to="/teklif-al" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );

  return isPanel ? panelRoutes : publicRoutes;
};

const AppContent = () => {
  const location = useLocation();
  useAmbientGlow();

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
      {location.pathname !== "/" && (
        <Suspense fallback={null}>
          <GlobalToasts />
        </Suspense>
      )}
      {location.pathname !== "/" && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ScrollDebugPanel />
        </Suspense>
      )}
    </>
  );

  return isPanel ? content : <SmoothScrollProvider>{content}</SmoothScrollProvider>;
};

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <PointerCursor />
        <ScrollProgress />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
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
