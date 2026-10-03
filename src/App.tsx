import { Suspense, lazy, useMemo, useEffect, useRef, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, matchRoutes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navigate } from "@/i18n/LocaleLink";
import { applyLanguage, isLanguageReady } from "@/i18n";
import { isPanelPath, localeFromPath } from "@/i18n/locale";
import { applyPrivateRouteMeta } from "@/hooks/use-page-meta";
import { PageTransition } from "@/components/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ShellLoading, ShellRouteBoundary, ShellRouteError } from "@/components/shell/ShellStates";
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
import { ChatLauncher } from "@/components/ChatLauncher";
import { isHeroIntroActive } from "@/lib/hero-shell";
import { lazyRoute, type PreloadableRoute } from "@/lib/lazy-route";
import { registerRoutePreparer } from "@/lib/route-prepare";
import { loadEnContent } from "@/i18n/content";
import { bootMark, errorMessage, reportBoot } from "@/lib/boot-trace";

const Index = lazyRoute("Index", () => import("./pages/Index").then((m) => ({ default: m.Index })));
const NotFound = lazyRoute("NotFound", () => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));
const SSS = lazyRoute("SSS", () => import("./pages/SSS").then((m) => ({ default: m.SSS })));
const GizlilikPolitikasi = lazyRoute("GizlilikPolitikasi", () =>
  import("./pages/GizlilikPolitikasi").then((m) => ({ default: m.GizlilikPolitikasi })),
);
const KVKK = lazyRoute("KVKK", () => import("./pages/KVKK").then((m) => ({ default: m.KVKK })));
const CerezPolitikasi = lazyRoute("CerezPolitikasi", () => import("./pages/CerezPolitikasi").then((m) => ({ default: m.CerezPolitikasi })));
const Hakkimizda = lazyRoute("Hakkimizda", () => import("./pages/Hakkimizda").then((m) => ({ default: m.Hakkimizda })));
const Iletisim = lazyRoute("Iletisim", () => import("./pages/Iletisim").then((m) => ({ default: m.Iletisim })));
const ServiceDetail = lazyRoute("ServiceDetail", () => import("./pages/ServiceDetail").then((m) => ({ default: m.ServiceDetail })));
const Blog = lazyRoute("Blog", () => import("./pages/Blog").then((m) => ({ default: m.Blog })));
const BlogDetail = lazyRoute("BlogDetail", () => import("./pages/BlogDetail").then((m) => ({ default: m.BlogDetail })));
/* PHASE 08 — the two surfaces §PHASE 08 requires and the site had no route
   for: the case-study/capability index + detail pair over
   `src/content/caseStudies.ts`, and the quality/resources document surface
   over the four §H PDFs. Both are registered in
   `src/components/navigation/ia.ts` under RESOURCES, so
   `e2e/landing/navigation-reachability.spec.ts` covers them rather than
   reporting them as orphans. */
const KabiliyetProfilleri = lazyRoute("KabiliyetProfilleri", () =>
  import("./pages/KabiliyetProfilleri").then((m) => ({ default: m.KabiliyetProfilleri })),
);
const KabiliyetProfilDetay = lazyRoute("KabiliyetProfilDetay", () =>
  import("./pages/KabiliyetProfilDetay").then((m) => ({ default: m.KabiliyetProfilDetay })),
);
const KaliteDosyasi = lazyRoute("KaliteDosyasi", () =>
  import("./pages/KaliteDosyasi").then((m) => ({ default: m.KaliteDosyasi })),
);
const AdminLogin = lazyRoute("AdminLogin", () => import("./pages/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazyRoute("AdminDashboard", () => import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const Login = lazyRoute("Login", () => import("./pages/Login").then((m) => ({ default: m.Login })));
const ForgotPassword = lazyRoute("ForgotPassword", () => import("./pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazyRoute("ResetPassword", () => import("./pages/ResetPassword").then((m) => ({ default: m.ResetPassword })));
const Malzemeler = lazyRoute("Malzemeler", () => import("./pages/Malzemeler").then((m) => ({ default: m.Malzemeler })));
const MalzemeKategori = lazyRoute("MalzemeKategori", () => import("./pages/MalzemeKategori").then((m) => ({ default: m.MalzemeKategori })));
const TeklifAl = lazyRoute("TeklifAl", () => import("./pages/TeklifAl").then((m) => ({ default: m.TeklifAl })));
const MusteriPaneli = lazyRoute("MusteriPaneli", () => import("./pages/MusteriPaneli").then((m) => ({ default: m.MusteriPaneli })));
const CategoryPage = lazyRoute("CategoryPage", () => import("./pages/CategoryPage").then((m) => ({ default: m.CategoryPage })));

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

const ProtectedRoute = lazyRoute("ProtectedRoute", () =>
  import("./components/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute })),
);
const CustomerProtectedRoute = lazyRoute("CustomerProtectedRoute", () =>
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
/* The loader is what an /en page shows WHILE its dictionary loads, so its
   words come from the address, not from i18n (L01: no Turkish frame). */
const LOADER_TEXT = {
  tr: { label: "YÜKLENİYOR", detail: "Sayfa hazırlanıyor." },
  en: { label: "LOADING", detail: "Preparing the page." },
} as const;

/* A loader is a promise, not a destination: when the route's code or its
   dictionary has not arrived after this long (a stalled request, a dev server
   restarted under the tab, a cache serving a stale chunk), the reader gets a
   retry instead of an endless sweep, and the console says what was pending. */
const LOADER_TIMEOUT_MS = 12_000;
const LOADER_TIMEOUT_TEXT = {
  tr: {
    label: "YÜKLEME GECİKTİ",
    title: "Sayfa yüklenemedi",
    detail: "Sayfanın dosyaları zamanında gelmedi. Sayfayı yeniden yükleyin; sorun sürerse bize bildirin.",
    offlineLabel: "BAĞLANTI YOK",
    offlineDetail: "Tarayıcı internet bağlantısı olmadığını bildiriyor. Bağlantı gelince sayfayı yeniden yükleyin.",
  },
  en: {
    label: "LOADING STALLED",
    title: "The page could not load",
    detail: "The page's files did not arrive in time. Reload the page; if it keeps happening, let us know.",
    offlineLabel: "NO CONNECTION",
    offlineDetail: "The browser reports no internet connection. Reload the page once you are back online.",
  },
} as const;

type Pending = "route" | "language";

/** True once a loader has been on screen for LOADER_TIMEOUT_MS. */
function useStalled(pathname: string, pending: Pending) {
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    setStalled(false);
    const timer = window.setTimeout(() => {
      reportBoot(`${pending} still loading after ${LOADER_TIMEOUT_MS} ms on ${pathname}`);
      setStalled(true);
    }, LOADER_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, pending]);
  return stalled;
}

const StalledNotice = ({ pathname, pending }: { pathname: string; pending: Pending }) => {
  const locale = isPanelPath(pathname) ? "tr" : localeFromPath(pathname);
  const text = LOADER_TIMEOUT_TEXT[locale];
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  return (
    <div className="shell-boot">
      <ShellRouteError
        label={offline ? text.offlineLabel : text.label}
        title={text.title}
        detail={offline ? text.offlineDetail : text.detail}
        reason={offline ? "ERR::OFFLINE" : `ERR::${pending === "language" ? "LANGUAGE" : "ROUTE"}_LOAD_TIMEOUT`}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
};

const PageLoader = ({ pending = "route" }: { pending?: Pending }) => {
  const { pathname } = useLocation();
  const text = LOADER_TEXT[isPanelPath(pathname) ? "tr" : localeFromPath(pathname)];
  const stalled = useStalled(pathname, pending);
  if (stalled) return <StalledNotice pathname={pathname} pending={pending} />;
  return (
    <div className="shell-boot">
      <ShellLoading label={text.label} detail={text.detail} fullHeight={false} />
    </div>
  );
};

/**
 * Suspense fallback for public routes.
 *
 * PERF01 / UX01: on the landing (`/`, `/en`) the fallback paints nothing.
 * The old reason was the entry sequence, which is gone; the reason now is
 * layout stability — the loader's box was laid out before `shell.css`
 * arrived, resized when it did and then gave way to the hero, a measured
 * 0.02–0.06 layout shift on `/` (lab, 4× CPU). The landing's chunk is the
 * next thing to arrive anyway. Every other route keeps the loader.
 */
const PublicRouteLoader = () => {
  const { pathname } = useLocation();
  if (isHeroIntroActive() || pathname === "/" || pathname === "/en" || pathname === "/en/") return <SilentLoader />;
  return <PageLoader />;
};

/* The landing paints nothing while its chunk arrives (layout stability, see
   above) — but "nothing" must not last forever: a landing chunk that never
   arrives used to leave a blank page with no timeout at all, because the
   timed `PageLoader` was never rendered on `/`. */
const SilentLoader = () => {
  const { pathname } = useLocation();
  const stalled = useStalled(pathname, "route");
  return stalled ? <StalledNotice pathname={pathname} pending="route" /> : null;
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

/**
 * C2 — get a route ready before React first renders it.
 *
 * Used when the document was prerendered (`src/main.tsx`): the static HTML is
 * already on screen, so the first client render must not replace it with a
 * loader. This fetches the matched page's chunk (and, on `/en`, the English
 * dictionary) so that render can commit the page itself. Resolves even on
 * failure — the normal loader and recovery path then takes over.
 */
async function prepareFirstRoute(pathname: string): Promise<"ready" | { error: unknown }> {
  const routes = LOCALE_PREFIXES.flatMap((prefix) =>
    PUBLIC_PAGES.map(({ path, element }) => ({ path: path === "/" ? prefix || "/" : `${prefix}${path}`, element })));
  const match = matchRoutes(routes, pathname)?.at(-1);
  const element = match?.route.element as { type?: PreloadableRoute } | undefined;
  const locale = isPanelPath(pathname) ? null : localeFromPath(pathname);
  /* Pages under /en read the English content bundle and suspend until it is
     there; the /en landing reads none (PERF01), so it is not fetched for it. */
  const needsEnContent = locale === "en" && !/^\/en\/?$/.test(pathname);
  const [route] = await Promise.all([
    element?.type?.preload?.() ?? Promise.resolve("ready" as const),
    locale && !isLanguageReady(locale) ? applyLanguage(locale).catch(() => undefined) : undefined,
    needsEnContent ? loadEnContent().catch(() => undefined) : undefined,
  ]);
  return route;
}

registerRoutePreparer(prepareFirstRoute);

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
    bootMark("language:start", locale);
    void applyLanguage(locale)
      .then(() => bootMark("language:ready", locale))
      .catch((error) => bootMark("language:failed", `${locale} · ${errorMessage(error)}`))
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, [locale]);
  return ready;
}

const AnimatedRoutes = () => {
  const location = useLocation();

  const isPanel = useMemo(() => {
    return location.pathname.startsWith("/admin") || location.pathname.startsWith("/musteri-paneli");
  }, [location.pathname]);

  /* SEO01 — panel and admin routes are never indexed. The pages themselves
     are not touched; the head is set here on every panel navigation. */
  useEffect(() => {
    if (isPanel) applyPrivateRouteMeta();
  }, [isPanel, location.pathname]);

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

/* Routes rendered without the global header (`navigation={false}`). */
const HEADERLESS = ["/giris", "/sifremi-unuttum", "/reset-password"];
const reservesHeader = (pathname: string) => {
  if (isPanelPath(pathname)) return false;
  const bare = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return !HEADERLESS.includes(bare);
};

const AppContent = () => {
  const location = useLocation();
  const languageReady = useRouteLanguageReady(location.pathname);
  const { t } = useTranslation();

  /* The app has committed and owns the document (after adopting prerendered
     HTML too). Before this, a prerendered page's buttons are static markup;
     tests that interact wait for it (e2e/helpers.ts gotoAndSettle). */
  useEffect(() => {
    document.documentElement.setAttribute("data-app-ready", "");
    bootMark("app:ready");
  }, []);

  /* `data-first-view` (set on prerendered documents) holds the page-entrance
     animations back for the page the visitor landed on: it is already on
     screen as static HTML, and replaying a clip-path entrance over it both
     flickers at adoption and hides the title from LCP (polish.css). The first
     client-side navigation lifts it, so later pages enter as designed. */
  const firstPath = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== firstPath.current) document.documentElement.removeAttribute("data-first-view");
  }, [location.pathname]);

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
        {t("Ana içeriğe geç")}
      </a>
      {/* PERF01: on routes that draw the global header, the host reserves the
          header's height from the first frame (`index.css`), so the page does
          not jump down when the header spacer is portalled in. */}
      <div id="shared-header-host" data-reserve={reservesHeader(location.pathname) || undefined} />
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
      <ChatEntry />
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ScrollDebugPanel />
        </Suspense>
      )}
    </>
  );

  if (!languageReady) return <PageLoader pending="language" />;
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

/* PERF01 — the chat renderer loads on the reader's first open; until then
   only the launcher button is on the page (`ChatLauncher.tsx`). */
const ChatEntry = () => {
  const [requested, setRequested] = useState(false);
  if (!requested) return <ChatLauncher onOpen={() => setRequested(true)} />;
  return (
    <Suspense fallback={<ChatLauncher onOpen={() => undefined} busy />}>
      <ChatBot defaultOpen />
    </Suspense>
  );
};

/* PERF01 — the custom cursor loads on the first real mouse movement over a
   fine pointer, not at startup, and never under reduced motion: the native
   cursor serves until then (the stylesheet only hides it once the
   replacement's `[data-custom-cursor]` nodes exist). */
const PointerCursor = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!query.matches || reduced.matches) return;
    const arm = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setEnabled(true);
      window.removeEventListener("pointermove", arm);
    };
    window.addEventListener("pointermove", arm, { passive: true });
    return () => window.removeEventListener("pointermove", arm);
  }, []);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <CustomCursor />
    </Suspense>
  );
};
