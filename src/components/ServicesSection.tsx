import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { travelers } from "@/data/travelers";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const fmtMin = (value: number | null) => (value === null ? "—" : `${value} dk`);

export const ServicesSection = () => {
  const [activeId, setActiveId] = useState(travelers[0].id);
  const prefersReduced = usePrefersReducedMotion();
  const active = travelers.find((item) => item.id === activeId) ?? travelers[0];

  return (
    <section id="hizmetler" className="section-tone-services relative py-24 md:py-32">
      <div className="container-industrial">
        <div className="grid gap-8 border-b pb-8 lg:grid-cols-[0.8fr_1.2fr]" style={{ borderColor: "var(--surface-border-light)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--text-inverse-muted)" }}>
            <span style={{ color: "var(--action-primary)" }}>§ 02 · Hizmetler</span>
            <span className="mt-2 block">Traveler format</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-none tracking-tight md:text-6xl">Hizmet değil, <em className="font-normal not-italic" style={{ color: "var(--text-inverse-secondary)" }}>rota.</em></h2>
            <p className="mt-5 max-w-3xl text-base leading-7" style={{ color: "var(--text-inverse-secondary)" }}>
              Her hizmeti bir üretim rotası olarak yayınlıyoruz: Op 10 → Op 40. Setup süresi, tooling ve QC adımları dahil.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap border-b" role="tablist" aria-label="Hizmet seçimi" style={{ borderColor: "var(--surface-border-light)" }}>
          {travelers.map((traveler, index) => {
            const selected = traveler.id === activeId;
            return (
              <button
                key={traveler.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(traveler.id)}
                className="border-b-2 px-4 py-4 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors"
                style={{ borderColor: selected ? "var(--action-primary)" : "transparent", color: selected ? "var(--action-primary)" : "var(--text-inverse-muted)" }}
              >
                <span className="mr-2 opacity-60">{String(index + 1).padStart(2, "0")}</span>{traveler.title}
              </button>
            );
          })}
        </div>

        <motion.article
          key={active.id}
          role="tabpanel"
          className="mt-8 border"
          style={{ borderColor: "var(--surface-border-light)", background: "var(--bg-light-workshop)" }}
          initial={prefersReduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid divide-y font-mono md:grid-cols-5 md:divide-x md:divide-y-0" style={{ borderColor: "var(--surface-border-light)", color: "var(--text-inverse)" }}>
            {[["Traveler", active.code], ["Malzeme", active.meta.material], ["Tolerans bandı", active.meta.tolerance], ["Setup süresi", active.meta.setup], ["Seri aralığı", active.meta.batch]].map(([k, v]) => (
              <div key={k} className="p-4" style={{ borderColor: "var(--surface-border-light)" }}>
                <span className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-inverse-muted)" }}>{k}</span>
                <b className="mt-2 block text-sm font-medium tabular-nums">{v}</b>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-t font-mono text-xs tabular-nums" style={{ borderColor: "var(--surface-border-light)" }}>
              <thead>
                <tr style={{ color: "var(--text-inverse-muted)", background: "var(--surface-hover-light)" }}>
                  {['Op', 'Açıklama', 'Ekipman', 'Setup', 'Cycle', 'QC'].map((head) => <th key={head} scope="col" className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.2em]">{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {active.ops.map((op) => (
                  <tr key={op.n} className="border-t" style={{ borderColor: "var(--surface-border-light)" }}>
                    <td className="px-4 py-4 align-top"><b style={{ color: "var(--action-primary)" }}>{op.n}</b><span className="block pt-1">{op.name}</span></td>
                    <td className="max-w-md px-4 py-4 align-top font-sans text-sm leading-6">{op.desc}{op.note ? <small className="block pt-1 font-mono text-[10px]" style={{ color: "var(--text-inverse-muted)" }}>{op.note}</small> : null}</td>
                    <td className="px-4 py-4 align-top">{op.equipment}</td>
                    <td className="px-4 py-4 align-top text-right">{fmtMin(op.setupMin)}</td>
                    <td className="px-4 py-4 align-top text-right">{fmtMin(op.cycleMin)}</td>
                    <td className="px-4 py-4 align-top text-right">{op.qc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid border-t md:grid-cols-3" style={{ borderColor: "var(--surface-border-light)" }}>
            <div className="p-5"><span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-inverse-muted)" }}>Mühendis onayı</span><div className="mt-2 text-xl">{active.signoff.engineer}</div></div>
            <div className="border-t p-5 md:border-l md:border-t-0" style={{ borderColor: "var(--surface-border-light)" }}><span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-inverse-muted)" }}>Kalite kontrol</span><div className="mt-2 text-xl">{active.signoff.qc}</div><div className="font-mono text-xs" style={{ color: "var(--text-inverse-muted)" }}>{active.signoff.fairRev}</div></div>
            <div className="border-t p-5 md:border-l md:border-t-0" style={{ borderColor: "var(--surface-border-light)" }}><span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-inverse-muted)" }}>Durum</span><div className="mt-3 inline-flex rotate-[-3deg] border-2 px-3 py-2 font-mono text-xs uppercase tracking-[0.18em]" style={{ borderColor: "var(--status-nominal)", color: "var(--status-nominal)" }}>Nominal · %100</div><div className="mt-2 font-mono text-xs" style={{ color: "var(--text-inverse-muted)" }}>{active.signoff.coverage}</div></div>
          </div>
        </motion.article>

        <div className="mt-8 flex justify-end">
          <Link to="/teklif-al" className="inline-flex items-center gap-3 px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.16em]" style={{ background: "var(--action-primary)", color: "var(--action-primary-ink)" }}>Traveler ile teklif al <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
};
