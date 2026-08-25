import { Gauge, Power, Zap, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

/* ── Colors ── */
export const C = {
  primary: "#0688AD",
  cyan: "#0AA2CD",
  orange: "#F97316",
  amber: "#FBBF24",
  emerald: "#34D399",
  red: "#EF4444",
  purple: "#A855F7",
  pink: "#EC4899",
  slate: "#64748B",
  indigo: "#6366F1",
  teal: "#14B8A6",
  lime: "#84CC16",
};

/* ── Theme-aware chart palette ── */
export const useChartTheme = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return {
    grid: isDark ? "#334155" : "#CBD5E1",
    gridOpacity: isDark ? 0.2 : 0.5,
    tick: isDark ? "#94A3B8" : "#475569",
    tooltipBg: isDark ? "#0F172A" : "#FFFFFF",
    emerald: isDark ? "#34D399" : "#059669",
    red: isDark ? "#EF4444" : "#DC2626",
    orange: isDark ? "#F97316" : "#EA580C",
    slate: isDark ? "#64748B" : "#94A3B8",
  };
};

export const RADIAN = Math.PI / 180;

/* ── Static OEE data ── */
export const oeeHistory = [
  { month: "Eyl", oee: 76, availability: 85, performance: 90, quality: 97 },
  { month: "Eki", oee: 78, availability: 87, performance: 91, quality: 97 },
  { month: "Kas", oee: 80, availability: 88, performance: 92, quality: 98 },
  { month: "Ara", oee: 79, availability: 86, performance: 93, quality: 97 },
  { month: "Oca", oee: 82, availability: 90, performance: 93, quality: 98 },
  { month: "Şub", oee: 84, availability: 91, performance: 95, quality: 98 },
];

export const oeeMetrics = [
  { label: "Genel OEE", value: "84.2%", icon: Gauge, color: "text-[#0AA2CD]", bg: "bg-[#0AA2CD]/10", trend: "+2.1%", up: true, bars: [60, 70, 65, 80, 75, 85, 78, 84, 82, 84] },
  { label: "Kullanılabilirlik", value: "91.5%", icon: Power, color: "text-[#F97316]", bg: "bg-[#F97316]/10", trend: "+0.8%", up: true, bars: [85, 88, 90, 87, 91, 89, 92, 90, 91, 92] },
  { label: "Performans", value: "94.8%", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", trend: "+1.2%", up: true, bars: [90, 92, 91, 93, 94, 92, 95, 93, 94, 95] },
  { label: "Kalite Oranı", value: "98.1%", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10", trend: "-0.2%", up: false, bars: [97, 98, 99, 98, 97, 98, 99, 98, 98, 98] },
];

/* ── Custom Tooltip ── */
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dark:bg-[#0F172A]/95 bg-white/95 backdrop-blur-xl border dark:border-[#334155] border-slate-200 rounded-xl p-3 shadow-2xl">
      <p className="text-[10px] font-black dark:text-slate-400 text-slate-500 mb-1.5 uppercase tracking-wider">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[11px] dark:text-slate-400 text-slate-500">{p.name}:</span>
          <span className="text-[11px] font-black dark:text-white text-slate-800 font-mono">
            {typeof p.value === "number" ? p.value.toLocaleString("tr-TR") : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Custom Pie Label ── */
export const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── Navigate helper ── */
export const navigateTo = (tab: string) => {
  window.dispatchEvent(new CustomEvent("nexus-navigate", { detail: tab }));
};

/* ── Types ── */
export type ActivityItem = {
  id: string;
  type: "rfq" | "order" | "ticket";
  title: string;
  subtitle: string;
  time: string;
  color: string;
  icon: any;
  tab: string;
};

export type DashData = {
  rfqByStatus: { name: string; value: number; color: string }[];
  orderByStatus: { name: string; value: number; color: string }[];
  financialSummary: { name: string; Gelir: number; Gider: number; Net: number }[];
  issuesBySeverity: { name: string; value: number; color: string }[];
  maintByType: { name: string; Adet: number; Maliyet: number }[];
  pipelineByStage: { name: string; value: number; color: string }[];
  inventoryRadar: { subject: string; Hammadde: number; Takım: number }[];
  kpis: { rfqs: number; orders: number; customers: number; openIssues: number; openTickets: number; totalIncome: number; totalExpense: number; overdueOrders: number; paidAmount: number; unpaidAmount: number; overduePayments: number; profitMargin: number; vatCollected: number };
  topCustomers: { name: string; Bakiye: number }[];
  monthlyRfqs: { month: string; Talep: number; Onaylanan: number; Oran: number }[];
  ticketsByPriority: { name: string; value: number; color: string }[];
  orderCompletion: { name: string; Tamamlanan: number; Hedef: number }[];
  recentActivity: ActivityItem[];
  expenseByCategory: { name: string; value: number; color: string }[];
  paymentStatus: { name: string; value: number; color: string }[];
  customerFinancials: { name: string; income: number; expense: number; net: number; balance: number; orders: number }[];
  cashFlowForecast: { month: string; Gelir: number; Gider: number; Net: number; Kümülatif: number; Bütçe: number }[];
};

/* ── Animation variants ── */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const cardBase = "dark:bg-[#1E293B]/80 bg-white rounded-2xl dark:border-[#1E293B] border-slate-200 border shadow-sm hover:shadow-lg hover:shadow-[#0AA2CD]/5 transition-all duration-300";
export const clickableCard = (tab: string) => `${cardBase} cursor-pointer group p-5`;
