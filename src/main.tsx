import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";

// index.html'deki app-shell hero yalnız landing için var; orada LandingFlow
// gerçek hero'yu boyadıktan sonra kaldırıyor. Diğer rotalarda hiç gösterilmemeli
// (tam ekran kaplıyor), bu yüzden React render etmeden önce siliniyor.
if (window.location.pathname !== "/") {
  document.getElementById("hero-shell")?.remove();
}

createRoot(document.getElementById("root")!).render(<App />);
