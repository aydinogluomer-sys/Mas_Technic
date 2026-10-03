import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { installHeroShellTeardown } from "./lib/hero-shell.ts";
import { bootMark, installBootTrace } from "./lib/boot-trace.ts";
/* C1 — self-hosted faces first: the stylesheet that names the families must
   not be the one that waits on a third-party host. */
import "./styles/fonts.css";
import "./index.css";
import "./i18n";

// `index.html` app-shell hero'sunun tek teardown sahibi. Eskiden bu iş
// `LandingFlow`'daydı ve o bileşen yalnız dev-only `/legacy-landing`'de render
// edildiği için shell, var olma sebebi olan `/` rotasında hiç kaldırılmıyordu.
installHeroShellTeardown();
installBootTrace();
bootMark("render:start");

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
