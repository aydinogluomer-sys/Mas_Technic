import { startTransition } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { prepareRoute } from "./lib/route-prepare.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { installHeroShellTeardown } from "./lib/hero-shell.ts";
import { bootMark, errorMessage, installBootTrace, reportBoot } from "./lib/boot-trace.ts";
import { isChunkLoadError, reloadForChunkFailure } from "./lib/lazy-route.ts";
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

const container = document.getElementById("root")!;
const root = createRoot(container);
const app = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

/* C2 — PRERENDERED DOCUMENTS ARE ADOPTED, NOT HYDRATED.
   A public route's HTML is a snapshot of what this app renders
   (`scripts/prerender/prerender.mjs`), so the page is readable before any
   script runs. React does not hydrate it — the snapshot is a browser DOM, not
   React's server output, and a mismatch would be a hydration error. Instead
   the route's chunk and dictionary are fetched first and the first render
   runs as a transition: React keeps the container untouched until the page
   can commit whole, then replaces the snapshot with the same content in one
   step — no loader frame in between.

   Until the route's code is here the snapshot stays: it is the page, its
   links are real addresses and work without script. If the code cannot be
   loaded (an old HTML after a deploy removed the chunk) the page reloads once
   for the new HTML; when even that is not allowed (offline, or the reload
   already happened) the static page is kept rather than replaced by an error. */
if (container.hasAttribute("data-prerendered")) {
  bootMark("prerender:adopt");
  const slow = window.setTimeout(() => reportBoot("prerendered route still preparing after 12000 ms — static page kept"), 12_000);
  void prepareRoute(window.location.pathname).then((result) => {
    window.clearTimeout(slow);
    if (result !== "ready") {
      bootMark("prerender:route-failed", errorMessage(result.error));
      /* Only a failed fetch is cured by new HTML; a module that throws while
         evaluating would throw again after the reload. */
      if (!(isChunkLoadError(result.error) && reloadForChunkFailure("prerendered route"))) {
        reportBoot("prerendered route code unavailable — static page kept");
      }
      return;
    }
    bootMark("prerender:render");
    startTransition(() => root.render(app));
  });
} else {
  root.render(app);
}
