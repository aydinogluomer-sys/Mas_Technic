import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const ledgerRows = [
  { label: "Parça", value: "AL-7075 valf gövdesi", unit: "rev B", pill: "aktif", tone: "active" },
  { label: "Operasyon", value: "Op 30 · 5x finish", unit: "Mazak i-400", pill: "nominal", tone: "ok" },
  { label: "Tolerans", value: "±0.008 mm", unit: "hedef 0.01", pill: "geçti", tone: "ok" },
  { label: "Spindle", value: "74%", unit: "", bar: 74 },
  { label: "CMM", value: "Zeiss Contura", unit: "14:06 TRT", pill: "imzalı", tone: "ok" },
  { label: "Sevkiyat", value: "2026·04·24", unit: "DHL 7632", pill: "planlı", tone: "warn" },
] as const;

const toneStyles = {
  active: { color: "var(--action-primary)", borderColor: "var(--action-primary)" },
  ok: { color: "var(--status-nominal)", borderColor: "var(--status-nominal)" },
  warn: { color: "var(--status-warn)", borderColor: "var(--status-warn)" },
};

export const LiveLedgerCard = () => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.aside
      aria-label="Canlı üretim kaydı"
      className="relative border p-4 sm:p-5 lg:p-6"
      style={{
        borderColor: "var(--rule-strong)",
        background: "linear-gradient(180deg, var(--surface-glass), var(--surface-base))",
        boxShadow: "0 28px 80px var(--overlay-dark-mid)",
      }}
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
    >
      {['tl','tr','bl','br'].map((corner) => (
        <span
          key={corner}
          className={`absolute h-4 w-4 border-primary ${corner.includes('t') ? 'top-3 border-t' : 'bottom-3 border-b'} ${corner.includes('l') ? 'left-3 border-l' : 'right-3 border-r'}`}
          aria-hidden="true"
        />
      ))}

      <div className="mb-5 flex items-center justify-between gap-4 border-b pb-3 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ borderColor: "var(--rule)", color: "var(--text-muted)" }}>
        <div className="flex items-center gap-2">
          <span>MT·LDG / Canlı kayıt</span>
          <span className="border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-medium text-amber-400 tracking-normal normal-case rounded">Temsili Veri</span>
        </div>
        <b style={{ color: "var(--text-primary)", fontWeight: 500 }}>#24·7812</b>
      </div>

      <div className="space-y-0">
        {ledgerRows.map((row, index) => (
          <motion.div
            key={row.label}
            className="grid grid-cols-[88px_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0"
            style={{ borderColor: "var(--rule)" }}
            initial={prefersReduced ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.35 + index * 0.06 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>{row.label}</span>
            {'bar' in row ? (
              <div className="h-2 overflow-hidden border" style={{ borderColor: "var(--rule)", background: "var(--surface-interactive)" }}>
                <motion.span
                  className="block h-full"
                  style={{ background: "var(--data-accent)" }}
                  initial={{ width: prefersReduced ? `${row.bar}%` : "0%" }}
                  animate={{ width: `${row.bar}%` }}
                  transition={{ duration: 0.8, delay: 0.55 }}
                />
              </div>
            ) : (
              <span className="min-w-0 font-mono text-xs sm:text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
                {row.value} {row.unit ? <small style={{ color: "var(--text-muted)" }}>· {row.unit}</small> : null}
              </span>
            )}
            {'pill' in row ? (
              <span className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em]" style={toneStyles[row.tone]}>{row.pill}</span>
            ) : (
              <span className="font-mono text-xs tabular-nums" style={{ color: "var(--text-primary)" }}>{row.value}</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
};
