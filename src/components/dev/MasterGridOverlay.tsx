import { useEffect, useState } from "react";
import "./grid-overlay.css";

/**
 * DEVELOPMENT-ONLY master grid overlay.
 *
 * Draws the technical rail plus the live master columns on top of the page so
 * that shared vertical axes across Hero, Process, Nexus, Projects, Quality,
 * FAQ, RFQ and Footer can be SEEN, not argued about.
 *
 * It is not a redrawing of the grid: the overlay sheet uses exactly the same
 * declaration as `.tl-sheet` + `.tl-band`
 * (`var(--tl-rail) repeat(var(--tl-cols), minmax(0,1fr))`, same
 * `--tl-sheet-max`, same 1px side rules), reading the same tokens. If a token
 * changes, the overlay changes with it — it cannot drift away from the thing
 * it is measuring.
 *
 * Shipping: `TechnicalLanding` reaches this module only through an
 * `import.meta.env.DEV` branch, which is a compile-time constant `false` in a
 * production build. Rollup therefore drops the dynamic import and this whole
 * subtree (component + CSS) from `dist/`. Same pattern as `src/routes/DevRoutes.tsx`.
 *
 * Toggle: Ctrl+Alt+G, or the button in the readout.
 */
const STORAGE_KEY = "mas:grid-overlay";

type Metrics = { width: number; rail: number; columns: number; column: number };

function readMetrics(): Metrics | null {
  const band = document.querySelector(".tl-band");
  if (!band) return null;
  const style = getComputedStyle(band);
  const tracks = style.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat);
  if (tracks.length < 2 || tracks.some(Number.isNaN)) return null;
  return {
    width: window.innerWidth,
    rail: Math.round(tracks[0] * 100) / 100,
    columns: tracks.length - 1,
    column: Math.round(tracks[1] * 100) / 100,
  };
}

export function MasterGridOverlay() {
  const [visible, setVisible] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, visible ? "1" : "0");
    } catch {
      /* private mode — the toggle simply does not persist */
    }
  }, [visible]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        setVisible((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const update = () => setMetrics(readMetrics());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [visible]);

  if (!visible) {
    return (
      <div className="tl-grid-overlay-readout">
        <span>GRID OVERLAY OFF</span>
        <button type="button" onClick={() => setVisible(true)}>CTRL+ALT+G</button>
      </div>
    );
  }

  const columns = metrics?.columns ?? 12;

  return (
    <>
      <div className="tl-grid-overlay" aria-hidden="true" data-testid="master-grid-overlay">
        <div className="tl-grid-overlay-sheet">
          {/* rail + one marker per master column; each marker's left border IS
              a master boundary. */}
          {Array.from({ length: columns + 1 }, (_, index) => <i key={index} />)}
        </div>
      </div>
      <div className="tl-grid-overlay-readout">
        <span>
          {metrics
            ? `${metrics.width}px · rail ${metrics.rail}px (${(metrics.rail / metrics.width * 100).toFixed(1)}%) · ${metrics.columns} cols · ${metrics.column}px`
            : "measuring…"}
        </span>
        <button type="button" onClick={() => setVisible(false)}>HIDE</button>
      </div>
    </>
  );
}

export default MasterGridOverlay;
