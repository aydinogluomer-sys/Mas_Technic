import { useState, useEffect, useCallback } from "react";
import { Bell, FileText, Package, AlertTriangle, Wrench, Check, ExternalLink, Clock, Timer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Notification {
  id: string;
  type: "rfq" | "order" | "issue" | "maintenance" | "overdue" | "critical_maint";
  title: string;
  description: string;
  time: string;
  read: boolean;
  navigateTo?: string;
  urgent?: boolean;
}

const typeConfig = {
  rfq: { icon: FileText, color: "text-[#0AA2CD]", bg: "bg-[#0AA2CD]/10", label: "Teklif Talebi" },
  order: { icon: Package, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Sipariş" },
  issue: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", label: "Olay" },
  maintenance: { icon: Wrench, color: "text-amber-400", bg: "bg-amber-400/10", label: "Bakım" },
  overdue: { icon: Timer, color: "text-red-500", bg: "bg-red-500/10", label: "Geciken Sipariş" },
  critical_maint: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Kritik Bakım" },
};

interface Props {
  onNavigate?: (tab: string) => void;
}

export const AdminNotifications = ({ onNavigate }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [rfqRes, orderRes, issueRes, maintRes, machineRes] = await Promise.all([
        supabase.from("rfqs").select("id, customer, service, created_at, status").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("id, part_name, customer, created_at, status, deadline").order("created_at", { ascending: false }).limit(10),
        supabase.from("issues").select("id, detail, severity, created_at, status").order("created_at", { ascending: false }).limit(3),
        supabase.from("maintenance_logs").select("id, machine, type, date, status").order("created_at", { ascending: false }).limit(3),
        supabase.from("machine_health").select("id, name, status, next_maintenance, spindle_hours"),
      ]);

      const items: Notification[] = [];

      rfqRes.data?.forEach((r) => {
        items.push({
          id: `rfq-${r.id}`, type: "rfq",
          title: `Yeni Teklif: ${r.customer || "Anonim"}`,
          description: r.service || "Hizmet belirtilmemiş",
          time: r.created_at,
          read: r.status !== "Yeni" && r.status !== "new",
          navigateTo: "rfq",
        });
      });

      // Regular orders
      orderRes.data?.forEach((o) => {
        items.push({
          id: `order-${o.id}`, type: "order",
          title: `Sipariş: ${o.id}`,
          description: `${o.part_name || "Parça"} — ${o.customer || ""}`,
          time: o.created_at,
          read: o.status === "Tamamlandı" || o.status === "completed",
          navigateTo: "orders",
        });
      });

      // Overdue orders
      const now = new Date();
      orderRes.data?.filter((o) => o.deadline && new Date(o.deadline) < now && o.status !== "Tamamlandı" && o.status !== "completed" && o.status !== "Teslim Edildi")
        .forEach((o) => {
          items.push({
            id: `overdue-${o.id}`, type: "overdue",
            title: `⚠️ Geciken: ${o.id}`,
            description: `${o.part_name || "Parça"} — Termin: ${new Date(o.deadline!).toLocaleDateString("tr-TR")}`,
            time: o.created_at,
            read: false, urgent: true,
            navigateTo: "orders",
          });
        });

      issueRes.data?.forEach((i) => {
        items.push({
          id: `issue-${i.id}`, type: "issue",
          title: `Olay: ${i.severity || "Belirsiz"} Seviye`,
          description: i.detail || "Detay yok",
          time: i.created_at,
          read: i.status === "Çözüldü" || i.status === "resolved",
          navigateTo: "issues",
        });
      });

      maintRes.data?.forEach((m) => {
        items.push({
          id: `maint-${m.id}`, type: "maintenance",
          title: `Bakım: ${m.machine}`,
          description: m.type || "Rutin bakım",
          time: m.date || new Date().toISOString(),
          read: m.status === "Tamamlandı" || m.status === "completed",
          navigateTo: "tpm",
        });
      });

      // Critical maintenance alerts from machine_health
      machineRes.data?.filter((m) => {
        const remaining = (m.next_maintenance || 5000) - (m.spindle_hours || 0);
        return remaining <= 200 || m.status === "critical" || m.status === "warning";
      }).forEach((m) => {
        const remaining = (m.next_maintenance || 5000) - (m.spindle_hours || 0);
        items.push({
          id: `crit-maint-${m.id}`, type: "critical_maint",
          title: `🔴 ${m.name} — Bakım Gerekli`,
          description: remaining <= 0 ? `Bakım süresi aşıldı (${Math.abs(remaining)} saat)` : `Kalan: ${remaining} saat`,
          time: new Date().toISOString(),
          read: false, urgent: true,
          navigateTo: "tpm",
        });
      });

      items.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });
      setNotifications(items);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rfqs" }, () => fetchNotifications())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => fetchNotifications())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "issues" }, () => fetchNotifications())
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_health" }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.urgent && !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.navigateTo && onNavigate) {
      onNavigate(n.navigateTo);
      setOpen(false);
    }
  };

  const formatTime = (time: string) => {
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true, locale: tr });
    } catch {
      return "";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD] transition-colors p-1.5 rounded-lg dark:hover:bg-[#1E293B] hover:bg-slate-100"
          title="Bildirimler"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 animate-pulse ${urgentCount > 0 ? "bg-red-500" : "bg-[#0AA2CD]"}`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[400px] p-0 dark:bg-[#1E293B] bg-white dark:border-[#334155] border-slate-200 shadow-2xl rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-[#334155] border-slate-200">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0AA2CD]" />
            <span className="text-sm font-bold dark:text-white text-slate-800">Bildirimler</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-[#0AA2CD] bg-[#0AA2CD]/10 px-2 py-0.5 rounded-full">
                {unreadCount} yeni
              </span>
            )}
            {urgentCount > 0 && (
              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
                {urgentCount} acil
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-slate-500 hover:text-[#0AA2CD] transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Tümünü Oku
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#0AA2CD] border-t-transparent animate-spin rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="w-8 h-8 text-slate-500/30" />
              <p className="text-xs text-slate-500">Henüz bildirim yok</p>
            </div>
          ) : (
            notifications.map((n) => {
              const config = typeConfig[n.type];
              const Icon = config.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b dark:border-[#334155]/50 border-slate-100 last:border-b-0 ${
                    n.urgent && !n.read
                      ? "dark:bg-red-500/5 bg-red-50 dark:hover:bg-red-500/10 hover:bg-red-100/50"
                      : n.read
                        ? "dark:hover:bg-[#0F172A]/50 hover:bg-slate-50"
                        : "dark:bg-[#0AA2CD]/5 bg-[#0AA2CD]/5 dark:hover:bg-[#0AA2CD]/10 hover:bg-[#0AA2CD]/10"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${n.read ? "dark:text-slate-300 text-slate-700" : "dark:text-white text-slate-900"}`}>
                        {n.title}
                      </span>
                      {!n.read && <span className={`w-2 h-2 rounded-full shrink-0 ${n.urgent ? "bg-red-500 animate-pulse" : "bg-[#0AA2CD]"}`} />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-500/60" />
                      <span className="text-[10px] text-slate-500/60">{formatTime(n.time)}</span>
                      <span className={`text-[9px] font-bold ${config.color} ml-auto`}>{config.label}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500/40 shrink-0 mt-1" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t dark:border-[#334155] border-slate-200 text-center">
            <button
              onClick={() => { onNavigate?.("dashboard"); setOpen(false); }}
              className="text-[11px] font-bold text-[#0AA2CD] hover:underline"
            >
              Tüm Aktiviteleri Görüntüle
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
