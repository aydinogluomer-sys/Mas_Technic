import { createContext, useContext, useId, type ReactNode } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   SCHEMA KIT (IMG01 / PAGE01 / UX05)

   Small drawing primitives for the code-drawn engineering schemas. Every
   schema is a REPRESENTATIVE drawing ("Temsili mühendislik şeması"): it shows
   relationships — datum, critical surface, flow path, control point — and
   never a measured value, a tolerance figure or a test result.

   Colours come from the surface tokens (`--sf-ink`, `--sf-meta`, `--sf-rule`,
   `--sf-accent`) through the `.sch-*` classes in `src/styles/shell.css`, so
   the same drawing reads on a graphite and on a paper band. One viewBox
   (640 × 320) and one label size keep the labels legible at 375.
   ══════════════════════════════════════════════════════════════════════════ */

const IdContext = createContext("sch");
const useIds = () => useContext(IdContext);

const W = 640;
const H = 320;

export function SchemaSvg({ label, children, viewBox = `0 0 ${W} ${H}` }: { label: string; children: ReactNode; viewBox?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <IdContext.Provider value={id}>
      <svg className="sch" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
        <defs>
          <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" className="sch-hatch-line" />
          </pattern>
          <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="sch-arrow-head" />
          </marker>
        </defs>
        {children}
      </svg>
    </IdContext.Provider>
  );
}

/** Visible outline. */
export const Ln = ({ d, accent = false }: { d: string; accent?: boolean }) => (
  <path d={d} className={accent ? "sch-accent" : "sch-line"} />
);
/** Secondary / construction line. */
export const Thin = ({ d }: { d: string }) => <path d={d} className="sch-thin" />;
/** Hidden edge. */
export const Hidden = ({ d }: { d: string }) => <path d={d} className="sch-hidden" />;
/** Centre line (dash-dot). */
export const Center = ({ d }: { d: string }) => <path d={d} className="sch-center" />;

/** Sectioned (cut) area. */
export function Hatch({ d }: { d: string }) {
  const id = useIds();
  return <path d={d} className="sch-section" fill={`url(#${id}-hatch)`} />;
}

/** A flow / sequence arrow. */
export function Arrow({ d, accent = false }: { d: string; accent?: boolean }) {
  const id = useIds();
  return <path d={d} className={accent ? "sch-accent sch-flow" : "sch-thin sch-flow"} markerEnd={`url(#${id}-arrow)`} />;
}

/** Mono label. `size="s"` for secondary notes. */
export function Lbl({ x, y, children, anchor = "start", accent = false, size }: {
  x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; accent?: boolean; size?: "s";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`sch-text${accent ? " sch-text-accent" : ""}${size === "s" ? " sch-text-s" : ""}`}>
      {children}
    </text>
  );
}

/** Leader from a point on the part to a label. */
export function Callout({ x, y, tx, ty, children, anchor = "start", accent = false }: {
  x: number; y: number; tx: number; ty: number; children: ReactNode; anchor?: "start" | "middle" | "end"; accent?: boolean;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="3" className={accent ? "sch-dot-accent" : "sch-dot"} />
      <path d={`M${x} ${y} L${tx} ${ty}`} className="sch-thin" />
      <Lbl x={anchor === "end" ? tx - 6 : anchor === "middle" ? tx : tx + 6} y={ty + (ty >= y ? 14 : -6)} anchor={anchor} accent={accent}>{children}</Lbl>
    </g>
  );
}

/** Datum feature symbol: a filled triangle on the surface and the letter in a box. */
export function Datum({ x, y, letter, dir = "down" }: { x: number; y: number; letter: string; dir?: "down" | "up" | "left" | "right" }) {
  const v = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[dir];
  const bx = x + v[0] * 30;
  const by = y + v[1] * 30;
  const tri = dir === "down" || dir === "up"
    ? `M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + v[1] * 10} z`
    : `M${x} ${y - 7} L${x} ${y + 7} L${x + v[0] * 10} ${y} z`;
  return (
    <g>
      <path d={tri} className="sch-fill" />
      <path d={`M${x + v[0] * 10} ${y + v[1] * 10} L${bx} ${by}`} className="sch-thin" />
      <rect x={bx - 12} y={by - 12} width="24" height="24" className="sch-box" />
      <text x={bx} y={by + 6} textAnchor="middle" className="sch-text sch-text-datum">{letter}</text>
    </g>
  );
}

/** A numbered step marker (sequence, not a value). */
export function Step({ x, y, n }: { x: number; y: number; n: number | string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" className="sch-box" />
      <text x={x} y={y + 5} textAnchor="middle" className="sch-text sch-text-s">{n}</text>
    </g>
  );
}

/** A dimension line with a word instead of a number (e.g. "PAY", "L/D"). */
export function Dim({ x1, y1, x2, y2, children, offset = 0 }: { x1: number; y1: number; x2: number; y2: number; children?: ReactNode; offset?: number }) {
  const id = useIds();
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M${x1} ${y1} L${x2} ${y2}`} className="sch-thin" markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`} />
      {children && <Lbl x={mx} y={my - 8 + offset} anchor="middle" size="s">{children}</Lbl>}
    </g>
  );
}
