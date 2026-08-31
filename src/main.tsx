import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { installHeroShellTeardown } from "./lib/hero-shell.ts";
import "./index.css";

// `index.html` app-shell hero'sunun tek teardown sahibi. Eskiden bu iş
// `LandingFlow`'daydı ve o bileşen yalnız dev-only `/legacy-landing`'de render
// edildiği için shell, var olma sebebi olan `/` rotasında hiç kaldırılmıyordu.
installHeroShellTeardown();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
