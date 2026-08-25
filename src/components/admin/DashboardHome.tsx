import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  Power,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Package,
  FileText,
  Users,
  Wrench,
  DollarSign,
  Radio,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Activity,
  Plus,
  Headphones,
  ClipboardList,
} from "lucide-react";
import { QuickActionModals, type ModalType } from "./QuickActionModals";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Area,
} from "recharts";

import {
  C,
  useChartTheme,
  oeeHistory,
  oeeMetrics,
  CustomTooltip,
  renderCustomLabel,
  navigateTo,
  containerVariants,
  itemVariants,
  cardBase,
  clickableCard,
  type DashData,
  type ActivityItem,
} from "./dashboardConstants";
import { DashboardCustomerModal } from "./DashboardCustomerModal";

// ── Color maps — defined outside component to avoid stale closure in buildData ──
const STATUS_COLORS: Record<string, string> = {
  Onaylandı: C.emerald,
  "Fiyat Verildi": C.cyan,
  Reddedildi: C.red,
  Beklemede: C.amber,
  Üretimde: C.cyan,
  Hazırlık: C.orange,
  "Kalite Kontrol": C.purple,
  Tamamlandı: C.emerald,
  "Teslim Edildi": C.lime,
  İptal: C.red,
};

const SEVERITY_COLORS: Record<string, string> = {
  high: C.red,
  normal: C.amber,
  low: C.emerald,
  critical: C.pink,
};

const STAGE_COLORS: Record<string, string> = {
  prospect: C.slate,
  qualified: C.cyan,
  proposal: C.orange,
  negotiation: C.purple,
  closed_won: C.emerald,
  closed_lost: C.red,
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: C.red,
  high: C.orange,
  normal: C.cyan,
  low: C.emerald,
};

export const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashData | null>(null);
  const [rawFins, setRawFins] = useState<any[]>([]);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [activityFilter, setActivityFilter] = useState<"all" | "rfq" | "order" | "ticket">("all");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const ct = useChartTheme();

  const group = (arr: any[], key: string, colorMap: Record<string, string>) => {
    const map: Record<string, number> = {};
    arr.forEach((r) => {
      const k = r[key] || "Belirsiz";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value, color: colorMap[name] || C.slate }));
  };

  const buildData = useCallback(
    (
      rfqs: any[],
      orders: any[],
      issues: any[],
      fins: any[],
      custs: any[],
      pipes: any[],
      maints: any[],
      raws: any[],
      tools: any[],
      tickets: any[],
    ): DashData => {
      const rfqByStatus = group(rfqs, "status", STATUS_COLORS);
      const orderByStatus = group(orders, "status", STATUS_COLORS);

      const finByMonth: Record<string, { Gelir: number; Gider: number }> = {};
      fins.forEach((f) => {
        const m = f.doc_date ? new Date(f.doc_date).toLocaleString("tr-TR", { month: "short" }) : "N/A";
        if (!finByMonth[m]) finByMonth[m] = { Gelir: 0, Gider: 0 };
        if (f.doc_type === "fatura" || f.doc_type === "gelir") finByMonth[m].Gelir += Number(f.total_amount) || 0;
        else finByMonth[m].Gider += Number(f.total_amount) || 0;
      });
      const financialSummary = Object.entries(finByMonth).map(([name, v]) => ({ name, ...v, Net: v.Gelir - v.Gider }));

      const issuesBySeverity = group(issues, "severity", SEVERITY_COLORS);

      const maintMap: Record<string, { count: number; cost: number }> = {};
      maints.forEach((m) => {
        const k = m.type || "Belirsiz";
        if (!maintMap[k]) maintMap[k] = { count: 0, cost: 0 };
        maintMap[k].count++;
        maintMap[k].cost += Number(m.cost) || 0;
      });
      const maintByType = Object.entries(maintMap).map(([name, v]) => ({ name, Adet: v.count, Maliyet: v.cost }));

      const pipelineByStage = group(pipes, "stage", STAGE_COLORS);

      const maxRaw = Math.max(
        raws.reduce((s: number, r: any) => s + (r.stock || 0), 0),
        1,
      );
      const maxTool = Math.max(
        tools.reduce((s: number, t: any) => s + (t.stock || 0), 0),
        1,
      );
      const rawValue = raws.reduce((s: number, r: any) => s + (r.stock || 0) * (Number(r.unit_cost) || 0), 0);
      const toolValue = tools.reduce((s: number, t: any) => s + (t.stock || 0) * (Number(t.unit_cost) || 0), 0);
      const maxVal = Math.max(rawValue, toolValue, 1);
      const lowStockTools = tools.filter((t: any) => (t.stock || 0) <= (t.min_stock || 5)).length;
      const inventoryRadar = [
        {
          subject: "Stok Adedi",
          Hammadde: Math.round((raws.reduce((s: number, r: any) => s + (r.stock || 0), 0) / maxRaw) * 100),
          Takım: Math.round((tools.reduce((s: number, t: any) => s + (t.stock || 0), 0) / maxTool) * 100),
        },
        { subject: "Çeşitlilik", Hammadde: raws.length * 10, Takım: tools.length * 10 },
        {
          subject: "Toplam Değer",
          Hammadde: Math.round((rawValue / maxVal) * 100),
          Takım: Math.round((toolValue / maxVal) * 100),
        },
        { subject: "Risk Skoru", Hammadde: 80, Takım: Math.max(0, 100 - lowStockTools * 20) },
      ];

      const totalIncome = fins
        .filter((f: any) => f.doc_type === "fatura" || f.doc_type === "gelir")
        .reduce((s: number, f: any) => s + (Number(f.total_amount) || 0), 0);
      const totalExpense = fins
        .filter((f: any) => f.doc_type === "gider" || f.doc_type === "masraf")
        .reduce((s: number, f: any) => s + (Number(f.total_amount) || 0), 0);
      const paidAmount = fins
        .filter((f: any) => f.payment_status === "ödendi")
        .reduce((s: number, f: any) => s + (Number(f.total_amount) || 0), 0);
      const unpaidAmount = fins
        .filter((f: any) => f.payment_status === "ödenmedi")
        .reduce((s: number, f: any) => s + (Number(f.total_amount) || 0), 0);
      const overduePayments = fins.filter(
        (f: any) => f.payment_status === "ödenmedi" && f.due_date && new Date(f.due_date) < new Date(),
      ).length;
      const vatCollected = fins.reduce((s: number, f: any) => s + (Number(f.vat_amount) || 0), 0);
      const profitMargin = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

      const expCatMap: Record<string, number> = {};
      const catColors: Record<string, string> = {
        hammadde: C.orange,
        işçilik: C.cyan,
        bakım: C.amber,
        lojistik: C.purple,
        "genel gider": C.pink,
        Belirsiz: C.slate,
      };
      fins
        .filter((f: any) => f.doc_type === "gider" || f.doc_type === "masraf")
        .forEach((f: any) => {
          const cat = f.category || "Belirsiz";
          expCatMap[cat] = (expCatMap[cat] || 0) + (Number(f.total_amount) || 0);
        });
      const expenseByCategory = Object.entries(expCatMap).map(([name, value]) => ({
        name,
        value,
        color: catColors[name] || C.slate,
      }));

      const paymentStatus = [
        { name: "Ödendi", value: paidAmount, color: C.emerald },
        { name: "Ödenmedi", value: unpaidAmount, color: C.red },
      ].filter((p) => p.value > 0);

      const openIssues = issues.filter((i: any) => i.status === "Açık").length;
      const overdueOrders = orders.filter(
        (o: any) => o.deadline && new Date(o.deadline) < new Date() && o.status !== "Tamamlandı",
      ).length;
      const openTickets = tickets.filter((t: any) => t.status === "open").length;

      const topCustomers = [...custs]
        .sort((a: any, b: any) => (Number(b.balance) || 0) - (Number(a.balance) || 0))
        .slice(0, 6)
        .map((c: any) => ({ name: c.short_name || c.company || c.name || "?", Bakiye: Number(c.balance) || 0 }));

      const custFinMap: Record<string, { income: number; expense: number; orders: number; balance: number }> = {};
      orders.forEach((o: any) => {
        const cName = o.customer || "Belirsiz";
        if (!custFinMap[cName]) custFinMap[cName] = { income: 0, expense: 0, orders: 0, balance: 0 };
        custFinMap[cName].orders++;
      });
      fins.forEach((f: any) => {
        const isIncome = f.doc_type === "fatura" || f.doc_type === "gelir";
        const vendor = f.vendor || "Belirsiz";
        if (isIncome) {
          let matched = false;
          for (const cName of Object.keys(custFinMap)) {
            if (cName !== "Belirsiz" && (f.title?.includes(cName) || f.notes?.includes(cName))) {
              custFinMap[cName].income += Number(f.total_amount) || 0;
              matched = true;
              break;
            }
          }
          if (!matched) {
            if (!custFinMap[vendor]) custFinMap[vendor] = { income: 0, expense: 0, orders: 0, balance: 0 };
            custFinMap[vendor].income += Number(f.total_amount) || 0;
          }
        }
      });
      custs.forEach((c: any) => {
        const cName = c.short_name || c.company || c.name || "?";
        if (custFinMap[cName]) {
          custFinMap[cName].balance = Number(c.balance) || 0;
        }
      });
      const customerFinancials = Object.entries(custFinMap)
        .map(([name, v]) => ({
          name,
          income: v.income,
          expense: v.expense,
          net: v.income - v.expense,
          balance: v.balance,
          orders: v.orders,
        }))
        .filter((c) => c.income > 0 || c.orders > 0 || c.balance !== 0)
        .sort((a, b) => b.income - a.income)
        .slice(0, 10);

      const rfqByMonth: Record<string, { total: number; approved: number }> = {};
      rfqs.forEach((r: any) => {
        const m = r.date ? new Date(r.date).toLocaleString("tr-TR", { month: "short" }) : "N/A";
        if (!rfqByMonth[m]) rfqByMonth[m] = { total: 0, approved: 0 };
        rfqByMonth[m].total++;
        if (r.status === "Onaylandı") rfqByMonth[m].approved++;
      });
      const monthlyRfqs = Object.entries(rfqByMonth).map(([month, v]) => ({
        month,
        Talep: v.total,
        Onaylanan: v.approved,
        Oran: v.total > 0 ? Math.round((v.approved / v.total) * 100) : 0,
      }));

      const ticketsByPriority = group(tickets, "priority", PRIORITY_COLORS);

      const orderByMonth: Record<string, { completed: number; total: number }> = {};
      orders.forEach((o: any) => {
        const m = o.order_date ? new Date(o.order_date).toLocaleString("tr-TR", { month: "short" }) : "N/A";
        if (!orderByMonth[m]) orderByMonth[m] = { completed: 0, total: 0 };
        orderByMonth[m].total++;
        if (o.status === "Tamamlandı" || o.status === "Teslim Edildi") orderByMonth[m].completed++;
      });
      const orderCompletion = Object.entries(orderByMonth).map(([name, v]) => ({
        name,
        Tamamlanan: v.completed,
        Hedef: v.total,
      }));

      const timeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}dk önce`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}sa önce`;
        return `${Math.floor(hrs / 24)}g önce`;
      };
      const recentActivity: ActivityItem[] = [
        ...rfqs.slice(-8).map((r: any) => ({
          id: `rfq-${r.id}`,
          type: "rfq" as const,
          title: `Teklif: ${r.id}`,
          subtitle: `${r.customer || "—"} • ${r.service || "—"}`,
          time: r.created_at,
          color: C.cyan,
          icon: FileText,
          tab: "rfq",
        })),
        ...orders.slice(-8).map((o: any) => ({
          id: `ord-${o.id}`,
          type: "order" as const,
          title: `Sipariş: ${o.id}`,
          subtitle: `${o.part_name || "—"} • ${o.customer || "—"}`,
          time: o.created_at,
          color: C.orange,
          icon: Package,
          tab: "orders",
        })),
        ...tickets.slice(-8).map((t: any) => ({
          id: `tkt-${t.id}`,
          type: "ticket" as const,
          title: t.subject || "Destek Talebi",
          subtitle: `${t.priority || "normal"} öncelik`,
          time: t.created_at,
          color: C.purple,
          icon: MessageSquare,
          tab: "support",
        })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 12)
        .map((a) => ({ ...a, time: timeAgo(a.time) }));

      const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      const now = new Date();
      const cfMap: Record<string, { income: number; expense: number }> = {};
      fins.forEach((f: any) => {
        if (!f.doc_date) return;
        const d = new Date(f.doc_date);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        if (!cfMap[key]) cfMap[key] = { income: 0, expense: 0 };
        const isInc = f.doc_type === "fatura" || f.doc_type === "gelir";
        if (isInc) cfMap[key].income += Number(f.total_amount) || 0;
        else cfMap[key].expense += Number(f.total_amount) || 0;
      });
      const sortedMonths = Object.keys(cfMap).sort();
      const avgIncome =
        sortedMonths.length > 0 ? sortedMonths.reduce((s, k) => s + cfMap[k].income, 0) / sortedMonths.length : 50000;
      const avgExpense =
        sortedMonths.length > 0 ? sortedMonths.reduce((s, k) => s + cfMap[k].expense, 0) / sortedMonths.length : 30000;
      let cumulative = 0;
      const cashFlowForecast: DashData["cashFlowForecast"] = [];
      sortedMonths.forEach((key) => {
        const [y, m] = key.split("-").map(Number);
        const net = cfMap[key].income - cfMap[key].expense;
        cumulative += net;
        cashFlowForecast.push({
          month: `${monthNames[m]} ${String(y).slice(2)}`,
          Gelir: Math.round(cfMap[key].income),
          Gider: Math.round(cfMap[key].expense),
          Net: Math.round(net),
          Kümülatif: Math.round(cumulative),
          Bütçe: Math.round(avgIncome * 0.85),
        });
      });
      for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const projIncome = Math.round(avgIncome * (1 + (Math.random() - 0.4) * 0.2));
        const projExpense = Math.round(avgExpense * (1 + (Math.random() - 0.4) * 0.15));
        const net = projIncome - projExpense;
        cumulative += net;
        cashFlowForecast.push({
          month: `${monthNames[futureDate.getMonth()]} ${String(futureDate.getFullYear()).slice(2)}*`,
          Gelir: projIncome,
          Gider: projExpense,
          Net: Math.round(net),
          Kümülatif: Math.round(cumulative),
          Bütçe: Math.round(avgIncome * 0.85),
        });
      }

      return {
        rfqByStatus,
        orderByStatus,
        financialSummary,
        issuesBySeverity,
        maintByType,
        pipelineByStage,
        inventoryRadar,
        kpis: {
          rfqs: rfqs.length,
          orders: orders.length,
          customers: custs.length,
          openIssues,
          openTickets,
          totalIncome,
          totalExpense,
          overdueOrders,
          paidAmount,
          unpaidAmount,
          overduePayments,
          profitMargin,
          vatCollected,
        },
        topCustomers,
        monthlyRfqs,
        ticketsByPriority,
        orderCompletion,
        recentActivity,
        expenseByCategory,
        paymentStatus,
        customerFinancials,
        cashFlowForecast,
      };
    },
    [],
  );

  const fetchAll = useCallback(async () => {
    const [rfqR, ordR, issR, finR, custR, pipeR, maintR, rawR, toolR, ticketR] = await Promise.all([
      supabase.from("rfqs").select("*"),
      supabase.from("orders").select("*"),
      supabase.from("issues").select("*"),
      supabase.from("financial_documents").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("pipeline_leads").select("*"),
      supabase.from("maintenance_logs").select("*"),
      supabase.from("raw_materials").select("*"),
      supabase.from("tool_inventory").select("*"),
      supabase.from("support_tickets").select("*"),
    ]);
    setRawFins(finR.data || []);
    setRawOrders(ordR.data || []);
    const result = buildData(
      rfqR.data || [],
      ordR.data || [],
      issR.data || [],
      finR.data || [],
      custR.data || [],
      pipeR.data || [],
      maintR.data || [],
      rawR.data || [],
      toolR.data || [],
      ticketR.data || [],
    );
    setData(result);
    setLoading(false);
  }, [buildData]);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rfqs" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "issues" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_documents" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_leads" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "maintenance_logs" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "raw_materials" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "tool_inventory" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => fetchAll())
      .subscribe((status) => {
        setRealtimeActive(status === "SUBSCRIBED");
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const customerDetail = useMemo(() => {
    if (!selectedCustomer) return null;
    const custOrders = rawOrders.filter((o: any) => o.customer === selectedCustomer);
    const custFins = rawFins.filter(
      (f: any) =>
        f.vendor === selectedCustomer || f.title?.includes(selectedCustomer) || f.notes?.includes(selectedCustomer),
    );
    const invoices = custFins.filter((f: any) => f.doc_type === "fatura" || f.doc_type === "gelir");
    const payments = custFins.filter((f: any) => f.payment_status === "ödendi");
    const unpaid = custFins.filter((f: any) => f.payment_status !== "ödendi");
    return { custOrders, invoices, payments, unpaid, allFins: custFins };
  }, [selectedCustomer, rawOrders, rawFins]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 dark:bg-[#1E293B] bg-white rounded-2xl border dark:border-[#334155] border-slate-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 dark:bg-[#1E293B] bg-white rounded-2xl border dark:border-[#334155] border-slate-200" />
          <div className="h-72 dark:bg-[#1E293B] bg-white rounded-2xl border dark:border-[#334155] border-slate-200" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Toplam Teklif", value: data.kpis.rfqs, icon: FileText, color: C.cyan, bg: "bg-[#0AA2CD]/10", tab: "rfq" },
    {
      label: "Aktif Sipariş",
      value: data.kpis.orders,
      icon: Package,
      color: C.orange,
      bg: "bg-[#F97316]/10",
      tab: "orders",
    },
    {
      label: "Çözüm Ortağı",
      value: data.kpis.customers,
      icon: Users,
      color: C.emerald,
      bg: "bg-emerald-400/10",
      tab: "customers",
    },
    {
      label: "Açık Sorun",
      value: data.kpis.openIssues,
      icon: AlertTriangle,
      color: data.kpis.openIssues > 0 ? C.red : C.emerald,
      bg: data.kpis.openIssues > 0 ? "bg-red-500/10" : "bg-emerald-400/10",
      tab: "issues",
    },
    {
      label: "Geciken Sipariş",
      value: data.kpis.overdueOrders,
      icon: Clock,
      color: data.kpis.overdueOrders > 0 ? C.red : C.emerald,
      bg: data.kpis.overdueOrders > 0 ? "bg-red-500/10" : "bg-emerald-400/10",
      tab: "orders",
    },
    {
      label: "Net Gelir (₺)",
      value: data.kpis.totalIncome - data.kpis.totalExpense,
      icon: DollarSign,
      color: C.primary,
      bg: "bg-[#0688AD]/10",
      fmt: true,
      tab: "financial",
    },
  ];

  const totalRfq = data.rfqByStatus.reduce((s, r) => s + r.value, 0);
  const grd = { stroke: ct.grid, strokeOpacity: ct.gridOpacity };
  const tkS = { fontSize: 11, fill: ct.tick };
  const tkXS = { fontSize: 10, fill: ct.tick };
  const tkXXS = { fontSize: 9, fill: ct.tick };
  const filteredActivity =
    activityFilter === "all" ? data.recentActivity : data.recentActivity.filter((a) => a.type === activityFilter);

  return (
    <motion.div className="space-y-5 p-1" variants={containerVariants} initial="hidden" animate="visible">
      {/* ── Realtime indicator ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <div className="relative">
          <Radio className={`w-3.5 h-3.5 ${realtimeActive ? "text-emerald-400" : "text-slate-500"}`} />
          {realtimeActive && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          )}
        </div>
        <span className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 tracking-wide">
          {realtimeActive ? "CANLI VERİ AKIŞI AKTİF" : "Bağlanıyor..."}
        </span>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Yeni Teklif", icon: Plus, color: C.cyan, bg: "bg-[#0AA2CD]/10", modal: "rfq" as ModalType },
          {
            label: "Sipariş Ekle",
            icon: ClipboardList,
            color: C.orange,
            bg: "bg-[#F97316]/10",
            modal: "order" as ModalType,
          },
          {
            label: "Destek Talebi",
            icon: Headphones,
            color: C.purple,
            bg: "bg-purple-500/10",
            modal: "support" as ModalType,
          },
          {
            label: "Pipeline Ekle",
            icon: DollarSign,
            color: C.emerald,
            bg: "bg-emerald-400/10",
            modal: "pipeline" as ModalType,
          },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => setActiveModal(a.modal)}
            className="flex items-center gap-3 dark:bg-[#1E293B]/80 bg-white rounded-2xl border dark:border-[#1E293B] border-slate-200 p-4 hover:shadow-lg hover:shadow-[#0AA2CD]/5 transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <span className="text-xs font-bold dark:text-slate-300 text-slate-700 group-hover:text-[#0AA2CD] transition-colors">
              {a.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── KPI CARDS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className={`${cardBase} cursor-pointer hover:scale-[1.02] p-4 relative overflow-hidden`}
            onClick={() => navigateTo(k.tab)}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]"
              style={{ backgroundColor: k.color, transform: "translate(30%, -30%)" }}
            />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-xl ${k.bg} flex items-center justify-center`}>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-black dark:text-white text-slate-800 font-mono tabular-nums leading-none mb-1">
              {k.fmt ? Number(k.value).toLocaleString("tr-TR") : k.value}
            </p>
            <span className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 tracking-wide">
              {k.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ── OEE METRICS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {oeeMetrics.map((m) => (
          <div key={m.label} className={`${cardBase} cursor-pointer p-4`} onClick={() => navigateTo("tpm")}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest">
                {m.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
            </div>
            <p className="text-2xl font-black dark:text-white text-slate-800 mb-3">{m.value}</p>
            <div className="flex items-end gap-[3px] h-7 mb-2">
              {m.bars.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${v}%`,
                    backgroundColor: `color-mix(in srgb, ${
                      m.color === "text-[#0AA2CD]"
                        ? C.cyan
                        : m.color === "text-[#F97316]"
                          ? C.orange
                          : m.color === "text-amber-400"
                            ? C.amber
                            : C.emerald
                    } ${30 + i * 7}%, transparent)`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {m.up ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-[11px] font-bold ${m.up ? "text-emerald-400" : "text-red-400"}`}>{m.trend}</span>
              <span className="text-[10px] text-slate-500 ml-1">son 30g</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── ROW 1: OEE Trend + RFQ Status ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={`lg:col-span-3 ${clickableCard("tpm")}`} onClick={() => navigateTo("tpm")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            OEE Trend Analizi (6 Ay)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeHistory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" {...grd} />
                <XAxis dataKey="month" tick={tkS} axisLine={false} tickLine={false} />
                <YAxis tick={tkS} domain={[70, 100]} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="oee"
                  name="OEE"
                  stroke={C.cyan}
                  strokeWidth={3}
                  dot={{ r: 4, fill: C.cyan, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: C.cyan, strokeWidth: 2, fill: "#0F172A" }}
                />
                <Line
                  type="monotone"
                  dataKey="availability"
                  name="Kullanılabilirlik"
                  stroke={C.orange}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="performance"
                  name="Performans"
                  stroke={C.amber}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  name="Kalite"
                  stroke={C.emerald}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { label: "OEE", color: C.cyan, dash: false },
              { label: "Kullanılabilirlik", color: C.orange, dash: true },
              { label: "Performans", color: C.amber, dash: true },
              { label: "Kalite", color: C.emerald, dash: true },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className={`w-4 h-0.5 rounded-full ${l.dash ? "border-t border-dashed" : ""}`}
                  style={{ backgroundColor: l.dash ? "transparent" : l.color, borderColor: l.color }}
                />
                <span className="text-[10px] dark:text-slate-500 text-slate-400 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${clickableCard("rfq")}`} onClick={() => navigateTo("rfq")}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] group-hover:text-[#0AA2CD] transition-colors">
              RFQ Durum Dağılımı
            </h3>
            <span className="text-lg font-black dark:text-white text-slate-800 font-mono">{totalRfq}</span>
          </div>
          <div className="space-y-3">
            {data.rfqByStatus
              .sort((a, b) => b.value - a.value)
              .map((item) => {
                const pct = totalRfq > 0 ? (item.value / totalRfq) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold dark:text-slate-300 text-slate-600">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black dark:text-white text-slate-800 font-mono">
                          {item.value}
                        </span>
                        <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono w-9 text-right">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 dark:bg-[#0F172A] bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </motion.div>

      {/* ── ROW 2: Financial KPIs + Chart + Payment & Expense ── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {[
            { label: "Toplam Gelir", val: data.kpis.totalIncome, color: C.emerald, icon: TrendingUp },
            { label: "Toplam Gider", val: data.kpis.totalExpense, color: C.red, icon: TrendingDown },
            {
              label: "Net Kar",
              val: data.kpis.totalIncome - data.kpis.totalExpense,
              color: data.kpis.totalIncome - data.kpis.totalExpense >= 0 ? C.emerald : C.red,
              icon: DollarSign,
            },
            {
              label: "Kar Marjı",
              val: data.kpis.profitMargin,
              color: data.kpis.profitMargin >= 40 ? C.emerald : C.orange,
              icon: Gauge,
              pct: true,
            },
            { label: "Tahsil Edilen", val: data.kpis.paidAmount, color: C.cyan, icon: CheckCircle2 },
            { label: "KDV Toplam", val: data.kpis.vatCollected, color: C.purple, icon: FileText },
          ].map((k) => (
            <div key={k.label} className={`${cardBase} p-3 cursor-pointer`} onClick={() => navigateTo("financial")}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${k.color}15` }}
                >
                  <k.icon className="w-3 h-3" style={{ color: k.color }} />
                </div>
                <span className="text-[9px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-wider">
                  {k.label}
                </span>
              </div>
              <p className="text-lg font-black dark:text-white text-slate-800 font-mono tabular-nums">
                {k.pct ? `%${k.val}` : `${Number(k.val).toLocaleString("tr-TR")} ₺`}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className={`lg:col-span-3 ${clickableCard("financial")}`} onClick={() => navigateTo("financial")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] group-hover:text-[#0AA2CD] transition-colors">
                Aylık Gelir & Gider Analizi
              </h3>
              <div className="flex items-center gap-4">
                {data.kpis.overduePayments > 0 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold animate-pulse">
                    {data.kpis.overduePayments} Gecikmiş Ödeme
                  </span>
                )}
                <div className="text-right">
                  <p className="text-[9px] dark:text-slate-500 text-slate-400">Net Kar</p>
                  <p
                    className={`text-sm font-black font-mono ${data.kpis.totalIncome - data.kpis.totalExpense >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {(data.kpis.totalIncome - data.kpis.totalExpense).toLocaleString("tr-TR")} ₺
                  </p>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.financialSummary} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradGelir2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.emerald} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={C.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" {...grd} />
                  <XAxis dataKey="name" tick={tkS} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={tkXS}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Gelir"
                    name="Gelir"
                    fill={C.emerald}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    fillOpacity={0.8}
                  />
                  <Bar dataKey="Gider" name="Gider" fill={C.red} radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.6} />
                  <Line
                    type="monotone"
                    dataKey="Net"
                    name="Net Kar"
                    stroke={C.cyan}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: C.cyan, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { label: "Gelir", color: C.emerald, val: data.kpis.totalIncome },
                { label: "Gider", color: C.red, val: data.kpis.totalExpense },
                { label: "Net", color: C.cyan, val: data.kpis.totalIncome - data.kpis.totalExpense },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] dark:text-slate-500 text-slate-400">{l.label}</span>
                  <span className="text-[11px] font-bold dark:text-slate-300 text-slate-600 font-mono">
                    {l.val.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-rows-2 gap-4">
            <div className={clickableCard("financedocs")} onClick={() => navigateTo("financedocs")}>
              <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-3 group-hover:text-[#0AA2CD] transition-colors">
                Ödeme Durumu
              </h3>
              {data.paymentStatus.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-3 dark:bg-[#0F172A] bg-slate-100 rounded-full overflow-hidden flex">
                      {data.paymentStatus.map((p) => {
                        const total = data.paymentStatus.reduce((s, x) => s + x.value, 0);
                        const w = total > 0 ? (p.value / total) * 100 : 0;
                        return (
                          <div
                            key={p.name}
                            className="h-full first:rounded-l-full last:rounded-r-full"
                            style={{ width: `${w}%`, backgroundColor: p.color }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {data.paymentStatus.map((p) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-[10px] dark:text-slate-400 text-slate-500">{p.name}</span>
                        </div>
                        <span className="text-[11px] font-bold dark:text-white text-slate-800 font-mono">
                          {p.value.toLocaleString("tr-TR")} ₺
                        </span>
                      </div>
                    ))}
                    {data.kpis.unpaidAmount > 0 && (
                      <div className="flex items-center justify-between pt-1.5 border-t dark:border-[#334155] border-slate-200">
                        <span className="text-[9px] dark:text-slate-500 text-slate-400">Tahsilat Oranı</span>
                        <span className="text-[11px] font-black text-[#0AA2CD] font-mono">
                          %{Math.round((data.kpis.paidAmount / (data.kpis.paidAmount + data.kpis.unpaidAmount)) * 100)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs dark:text-slate-500 text-slate-400 mt-2">Finansal veri bulunamadı</p>
              )}
            </div>

            <div className={clickableCard("financial")} onClick={() => navigateTo("financial")}>
              <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-3 group-hover:text-[#0AA2CD] transition-colors">
                Gider Dağılımı
              </h3>
              {data.expenseByCategory.length > 0 ? (
                <div className="space-y-2">
                  {data.expenseByCategory
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((item) => {
                      const total = data.expenseByCategory.reduce((s, e) => s + e.value, 0);
                      const pct = total > 0 ? (item.value / total) * 100 : 0;
                      return (
                        <div key={item.name}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] dark:text-slate-400 text-slate-500 capitalize">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-bold dark:text-white text-slate-800 font-mono">
                              {item.value.toLocaleString("tr-TR")} ₺
                            </span>
                          </div>
                          <div className="h-1.5 dark:bg-[#0F172A] bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-xs dark:text-slate-500 text-slate-400 mt-2">Gider kaydı bulunamadı</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ROW 3: Order Status ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={clickableCard("orders")} onClick={() => navigateTo("orders")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Sipariş Durum Dağılımı
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.orderByStatus}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" {...grd} horizontal={false} />
                <XAxis type="number" tick={tkS} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={tkS} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Adet" radius={[0, 8, 8, 0]} barSize={18}>
                  {data.orderByStatus.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── CUSTOMER FINANCIAL TABLE ── */}
      {data.customerFinancials.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className={`${cardBase} p-5 cursor-pointer`} onClick={() => navigateTo("customers")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em]">
                Müşteri Bazlı Gelir-Gider Karşılaştırması
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full dark:bg-[#0AA2CD]/10 bg-[#0AA2CD]/10 text-[#0AA2CD] font-bold">
                Top {data.customerFinancials.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[9px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                    <th className="text-left py-2.5 pr-3">Müşteri</th>
                    <th className="text-right py-2.5 px-3 font-mono">Sipariş</th>
                    <th className="text-right py-2.5 px-3 font-mono">Gelir (₺)</th>
                    <th className="text-right py-2.5 px-3 font-mono hidden sm:table-cell">Bakiye (₺)</th>
                    <th className="text-right py-2.5 pl-3 font-mono">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customerFinancials.map((c, i) => {
                    const maxIncome = data.customerFinancials[0]?.income || 1;
                    const barW = maxIncome > 0 ? (c.income / maxIncome) * 100 : 0;
                    return (
                      <tr
                        key={c.name}
                        className="dark:border-[#334155]/50 border-slate-100 border-b last:border-0 dark:hover:bg-white/5 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c.name);
                        }}
                      >
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0"
                              style={{
                                backgroundColor:
                                  [
                                    C.primary,
                                    C.cyan,
                                    C.teal,
                                    C.emerald,
                                    C.indigo,
                                    C.purple,
                                    C.orange,
                                    C.amber,
                                    C.pink,
                                    C.lime,
                                  ][i] || C.slate,
                              }}
                            >
                              {i + 1}
                            </div>
                            <span className="text-[11px] font-bold dark:text-white text-slate-800 truncate max-w-[120px] sm:max-w-[180px]">
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[11px] font-bold dark:text-slate-300 text-slate-600 font-mono tabular-nums">
                            {c.orders}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 dark:bg-[#0F172A] bg-slate-100 rounded-full overflow-hidden hidden md:block">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${barW}%`, backgroundColor: C.emerald }}
                              />
                            </div>
                            <span className="text-[11px] font-bold dark:text-emerald-400 text-emerald-600 font-mono tabular-nums">
                              {c.income.toLocaleString("tr-TR")}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                          <span
                            className={`text-[11px] font-bold font-mono tabular-nums ${c.balance > 0 ? "dark:text-amber-400 text-amber-600" : c.balance < 0 ? "dark:text-red-400 text-red-600" : "dark:text-slate-400 text-slate-500"}`}
                          >
                            {c.balance !== 0 ? c.balance.toLocaleString("tr-TR") : "—"}
                          </span>
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              c.balance > 0
                                ? "bg-amber-500/10 text-amber-400"
                                : c.income > 0
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "dark:bg-slate-700/50 bg-slate-100 dark:text-slate-400 text-slate-500"
                            }`}
                          >
                            {c.balance > 0 ? "Alacak" : c.income > 0 ? "Temiz" : "Yeni"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data.customerFinancials.length > 0 && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t dark:border-[#334155] border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] dark:text-slate-500 text-slate-400">Toplam Müşteri Geliri:</span>
                  <span className="text-[11px] font-black dark:text-emerald-400 text-emerald-600 font-mono">
                    {data.customerFinancials.reduce((s, c) => s + c.income, 0).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] dark:text-slate-500 text-slate-400">Toplam Alacak:</span>
                  <span className="text-[11px] font-black dark:text-amber-400 text-amber-600 font-mono">
                    {data.customerFinancials.reduce((s, c) => s + Math.max(c.balance, 0), 0).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── CASH FLOW FORECAST ── */}
      {data.cashFlowForecast.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0AA2CD]" />
                <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em]">
                  Aylık Nakit Akışı Tahmini & Bütçe Karşılaştırması
                </h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full dark:bg-amber-500/10 bg-amber-500/10 text-amber-500 font-bold">
                * Tahmin
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                {
                  label: "Son Ay Net",
                  value: data.cashFlowForecast.filter((c) => !c.month.includes("*")).slice(-1)[0]?.Net || 0,
                  color: C.emerald,
                  prefix: "₺",
                },
                {
                  label: "Kümülatif",
                  value: data.cashFlowForecast[data.cashFlowForecast.length - 1]?.Kümülatif || 0,
                  color: C.cyan,
                  prefix: "₺",
                },
                {
                  label: "Ort. Gelir",
                  value: Math.round(
                    data.cashFlowForecast.reduce((s, c) => s + c.Gelir, 0) / data.cashFlowForecast.length,
                  ),
                  color: C.primary,
                  prefix: "₺",
                },
                {
                  label: "Bütçe Sapma",
                  value: Math.round(
                    ((data.cashFlowForecast.filter((c) => !c.month.includes("*")).slice(-1)[0]?.Gelir || 0) /
                      (data.cashFlowForecast[0]?.Bütçe || 1) -
                      1) *
                      100,
                  ),
                  color: C.orange,
                  prefix: "%",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="dark:bg-[#0F172A]/50 bg-slate-50 rounded-xl p-3 border dark:border-[#334155] border-slate-200"
                >
                  <p className="text-[9px] dark:text-slate-500 text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    {m.label}
                  </p>
                  <p className="text-lg font-black font-mono tabular-nums" style={{ color: m.color }}>
                    {m.prefix}
                    {Math.abs(m.value).toLocaleString("tr-TR")}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.cashFlowForecast} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.cyan} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} strokeOpacity={ct.gridOpacity} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: ct.tick }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 9, fill: ct.tick }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Kümülatif"
                    fill="url(#cashGradient)"
                    stroke={C.cyan}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Bar
                    dataKey="Gelir"
                    name="Gelir"
                    fill={C.emerald}
                    radius={[3, 3, 0, 0]}
                    barSize={14}
                    fillOpacity={0.8}
                  />
                  <Bar dataKey="Gider" name="Gider" fill={C.red} radius={[3, 3, 0, 0]} barSize={14} fillOpacity={0.6} />
                  <Line
                    type="monotone"
                    dataKey="Bütçe"
                    name="Bütçe Hedefi"
                    stroke={C.amber}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { label: "Gelir", color: C.emerald },
                { label: "Gider", color: C.red },
                { label: "Kümülatif", color: C.cyan },
                { label: "Bütçe Hedefi", color: C.amber, dashed: true },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-0.5 rounded"
                    style={{ backgroundColor: l.color, borderBottom: l.dashed ? `2px dashed ${l.color}` : undefined }}
                  />
                  <span className="text-[9px] dark:text-slate-500 text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ROW 3: Pipeline + Issues + Maintenance + Tickets ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={clickableCard("pipeline")} onClick={() => navigateTo("pipeline")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Pipeline Aşamaları
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pipelineByStage}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {data.pipelineByStage.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1">
            {data.pipelineByStage.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 truncate max-w-[80px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold dark:text-white text-slate-800 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={clickableCard("issues")} onClick={() => navigateTo("issues")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Sorun Ciddiyet Dağılımı
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.issuesBySeverity}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {data.issuesBySeverity.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1">
            {data.issuesBySeverity.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 capitalize">{item.name}</span>
                </div>
                <span className="text-[10px] font-bold dark:text-white text-slate-800 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={clickableCard("tpm")} onClick={() => navigateTo("tpm")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Bakım Türleri & Maliyet
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.maintByType} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" {...grd} />
                <XAxis dataKey="name" tick={tkXXS} axisLine={false} tickLine={false} />
                <YAxis tick={tkXXS} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Adet" fill={C.cyan} radius={[3, 3, 0, 0]} barSize={16} />
                <Bar dataKey="Maliyet" fill={C.orange} radius={[3, 3, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.cyan }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Adet</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.orange }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Maliyet</span>
            </div>
          </div>
        </div>

        <div className={clickableCard("support")} onClick={() => navigateTo("support")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] group-hover:text-[#0AA2CD] transition-colors">
              Destek Talepleri
            </h3>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0AA2CD]/10">
              <MessageSquare className="w-3 h-3 text-[#0AA2CD]" />
              <span className="text-[10px] font-bold text-[#0AA2CD] font-mono">{data.kpis.openTickets}</span>
            </div>
          </div>
          <div className="space-y-3">
            {data.ticketsByPriority
              .sort((a, b) => b.value - a.value)
              .map((item) => {
                const total = data.ticketsByPriority.reduce((s, t) => s + t.value, 0);
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold dark:text-slate-300 text-slate-600 capitalize">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold dark:text-white text-slate-800 font-mono">
                        {item.value}
                      </span>
                    </div>
                    <div className="h-1.5 dark:bg-[#0F172A] bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          {data.ticketsByPriority.length === 0 && (
            <div className="flex flex-col items-center justify-center h-44 gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/30" />
              <span className="text-[11px] dark:text-slate-500 text-slate-400">Açık talep yok</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── ROW 4: Top Customers + Radar + RFQ Trend + Order Completion ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={clickableCard("customers")} onClick={() => navigateTo("customers")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            En Yüksek Bakiye
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCustomers} margin={{ top: 5, right: 5, left: -15, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" {...grd} horizontal={false} />
                <XAxis
                  type="number"
                  tick={tkXXS}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <YAxis type="category" dataKey="name" tick={tkXXS} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Bakiye" name="Bakiye (₺)" radius={[0, 6, 6, 0]} barSize={12}>
                  {data.topCustomers.map((_, i) => (
                    <Cell key={i} fill={[C.primary, C.cyan, C.teal, C.emerald, C.indigo, C.purple][i] || C.slate} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={clickableCard("inventory")} onClick={() => navigateTo("inventory")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Envanter Radar
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.inventoryRadar} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke={ct.grid} strokeOpacity={ct.gridOpacity} />
                <PolarAngleAxis dataKey="subject" tick={tkXXS} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar
                  name="Hammadde"
                  dataKey="Hammadde"
                  stroke={C.cyan}
                  fill={C.cyan}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Takım"
                  dataKey="Takım"
                  stroke={C.orange}
                  fill={C.orange}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-1 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.cyan }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Hammadde</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.orange }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Takım</span>
            </div>
          </div>
        </div>

        <div className={clickableCard("rfq")} onClick={() => navigateTo("rfq")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Aylık Teklif Trendi
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRfqs} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" {...grd} />
                <XAxis dataKey="month" tick={tkXXS} axisLine={false} tickLine={false} />
                <YAxis tick={tkXXS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Talep" fill={C.cyan} radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="Onaylanan" fill={C.emerald} radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.cyan }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Talep</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.emerald }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Onay</span>
            </div>
          </div>
        </div>

        <div className={clickableCard("orders")} onClick={() => navigateTo("orders")}>
          <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em] mb-4 group-hover:text-[#0AA2CD] transition-colors">
            Sipariş Tamamlanma
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.orderCompletion} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" {...grd} />
                <XAxis dataKey="name" tick={tkXXS} axisLine={false} tickLine={false} />
                <YAxis tick={tkXXS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="Hedef"
                  name="Toplam"
                  fill={C.slate}
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                  fillOpacity={0.3}
                />
                <Bar dataKey="Tamamlanan" name="Tamamlanan" fill={C.emerald} radius={[3, 3, 0, 0]} barSize={14} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.slate, opacity: 0.3 }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Toplam</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.emerald }} />
              <span className="text-[9px] dark:text-slate-500 text-slate-400">Tamamlanan</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ROW 5: Activity Feed ── */}
      <motion.div variants={itemVariants} className={`${cardBase} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0AA2CD]" />
            <h3 className="text-[10px] font-black dark:text-slate-500 text-slate-400 uppercase tracking-[0.15em]">
              Son Aktiviteler
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {(
              [
                { key: "all", label: "Tümü" },
                { key: "rfq", label: "Teklifler" },
                { key: "order", label: "Siparişler" },
                { key: "ticket", label: "Destek" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setActivityFilter(f.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activityFilter === f.key
                    ? "bg-[#0AA2CD]/15 text-[#0AA2CD]"
                    : "dark:text-slate-500 text-slate-400 dark:hover:bg-white/5 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="text-[10px] dark:text-slate-600 text-slate-300 font-mono ml-2">
              {filteredActivity.length}
            </span>
          </div>
        </div>
        {filteredActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Activity className="w-8 h-8 dark:text-slate-700 text-slate-200" />
            <span className="text-[11px] dark:text-slate-600 text-slate-400">Aktivite bulunamadı</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="flex items-center gap-3 p-2.5 rounded-xl dark:hover:bg-white/[0.03] hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigateTo(a.tab)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${a.color}15` }}
                >
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold dark:text-slate-200 text-slate-700 truncate">{a.title}</p>
                  <p className="text-[10px] dark:text-slate-500 text-slate-400 truncate">{a.subtitle}</p>
                </div>
                <span className="text-[9px] dark:text-slate-600 text-slate-300 font-mono shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <QuickActionModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
      <DashboardCustomerModal
        selectedCustomer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customerDetail={customerDetail}
      />
    </motion.div>
  );
};
