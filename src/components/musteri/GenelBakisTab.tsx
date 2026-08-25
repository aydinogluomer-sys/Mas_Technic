import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Package, Clock, MessageSquare, AlertTriangle, CheckCircle2, Wallet, CalendarClock } from "lucide-react";
import { StatsSkeleton, CardListSkeleton } from "./MusteriSkeletons";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Stats {
  totalRfqs: number;
  pendingRfqs: number;
  approvedRfqs: number;
  totalOrders: number;
  activeOrders: number;
  openTickets: number;
}

interface RecentOrder {
  id: string;
  part_name: string | null;
  status: string | null;
  progress: number | null;
}

interface RecentRfq {
  id: string;
  service: string | null;
  status: string | null;
  quoted_price: number | null;
}

interface UnpaidDoc {
  id: string;
  doc_type: string;
  doc_number: string | null;
  title: string | null;
  total_amount: number | null;
  due_date: string | null;
  payment_status: string | null;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) => (
  <div className="bg-card border border-border p-5 flex items-start gap-4">
    <div className={`w-10 h-10 flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-bold font-mono mt-1">{value}</p>
    </div>
  </div>
);

const statusColor = (s: string | null) => {
  switch (s) {
    case "Onaylandı": case "Tamamlandı": return "bg-green-500/10 text-green-600 border-green-200";
    case "Üretimde": case "Değerlendiriliyor": return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "Reddedildi": return "bg-red-500/10 text-red-600 border-red-200";
    default: return "bg-amber-500/10 text-amber-600 border-amber-200";
  }
};

export const GenelBakisTab = () => {
  const [stats, setStats] = useState<Stats>({ totalRfqs: 0, pendingRfqs: 0, approvedRfqs: 0, totalOrders: 0, activeOrders: 0, openTickets: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentRfqs, setRecentRfqs] = useState<RecentRfq[]>([]);
  const [unpaidDocs, setUnpaidDocs] = useState<UnpaidDoc[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [rfqRes, orderRes, ticketRes, finRes] = await Promise.all([
        supabase.from("rfqs").select("id, service, status, quoted_price"),
        supabase.from("orders").select("id, part_name, status, progress"),
        supabase.from("support_tickets").select("id, status"),
        supabase.from("financial_documents").select("id, doc_type, doc_number, title, total_amount, due_date, payment_status").in("payment_status", ["ödenmedi", "vadeli", "kısmi"]),
      ]);

      const rfqs = (rfqRes.data || []) as RecentRfq[];
      const orders = (orderRes.data || []) as RecentOrder[];
      const tickets = ticketRes.data || [];
      const unpaid = (finRes.data || []) as UnpaidDoc[];

      setStats({
        totalRfqs: rfqs.length,
        pendingRfqs: rfqs.filter(r => !r.status || r.status === "Beklemede" || r.status === "Değerlendiriliyor").length,
        approvedRfqs: rfqs.filter(r => r.status === "Onaylandı").length,
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.status === "Üretimde" || o.status === "Beklemede").length,
        openTickets: tickets.filter(t => t.status === "open" || t.status === "in_progress").length,
      });

      setRecentOrders(orders.slice(0, 5));
      setRecentRfqs(rfqs.slice(0, 5));
      setUnpaidDocs(unpaid.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }));
      setTotalDebt(unpaid.reduce((s, d) => s + (d.total_amount || 0), 0));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <StatsSkeleton />
      <div>
        <div className="h-4 w-28 bg-muted rounded mb-3" />
        <CardListSkeleton count={3} />
      </div>
    </div>
  );

  const daysUntilDue = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Toplam Teklif" value={stats.totalRfqs} color="bg-primary/10 text-primary" />
        <StatCard icon={Clock} label="Bekleyen Teklifler" value={stats.pendingRfqs} color="bg-amber-500/10 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Onaylanan Teklifler" value={stats.approvedRfqs} color="bg-green-500/10 text-green-600" />
        <StatCard icon={Package} label="Toplam Sipariş" value={stats.totalOrders} color="bg-blue-500/10 text-blue-600" />
        <StatCard icon={AlertTriangle} label="Aktif Siparişler" value={stats.activeOrders} color="bg-orange-500/10 text-orange-600" />
        <StatCard icon={MessageSquare} label="Açık Destek Talepleri" value={stats.openTickets} color="bg-purple-500/10 text-purple-600" />
      </div>

      {/* Unpaid Invoices Summary */}
      {unpaidDocs.length > 0 && (
        <div className="border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-lg">
              <Wallet size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Ödenmemiş Faturalar</h3>
              <p className="text-2xl font-black font-mono text-red-600 dark:text-red-300">
                ₺{totalDebt.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/30">
              {unpaidDocs.length} belge
            </Badge>
          </div>
          <div className="space-y-2">
            {unpaidDocs.slice(0, 5).map(doc => {
              const days = daysUntilDue(doc.due_date);
              const isOverdue = days !== null && days < 0;
              const isUrgent = days !== null && days >= 0 && days <= 7;
              return (
                <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-background/80 rounded border border-border">
                  <FileText size={14} className="text-red-400 shrink-0" />
                  <span className="text-xs font-medium flex-1 truncate">{doc.title || doc.doc_number || doc.doc_type}</span>
                  <span className="text-xs font-bold font-mono text-red-600 dark:text-red-400">
                    ₺{(doc.total_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                  {doc.due_date && (
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                      isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-muted-foreground"
                    }`}>
                      <CalendarClock size={11} />
                      {isOverdue
                        ? `${Math.abs(days!)} gün gecikmiş`
                        : days === 0
                          ? "Bugün"
                          : `${days} gün kaldı`
                      }
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Son Siparişler</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Henüz sipariş bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-4 p-3 border border-border bg-background">
                <span className="font-medium text-sm flex-1 truncate">{o.part_name || "—"}</span>
                <div className="w-24 flex items-center gap-2">
                  <Progress value={o.progress || 0} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground font-mono">{o.progress || 0}%</span>
                </div>
                <Badge variant="outline" className={statusColor(o.status)}>{o.status || "Beklemede"}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent RFQs */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Son Teklif Talepleri</h3>
        {recentRfqs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Henüz teklif talebi bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {recentRfqs.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 border border-border bg-background">
                <span className="font-medium text-sm flex-1 truncate">{r.service || "Genel"}</span>
                {r.quoted_price && <span className="text-sm font-mono font-semibold">₺{r.quoted_price.toLocaleString("tr-TR")}</span>}
                <Badge variant="outline" className={statusColor(r.status)}>{r.status || "Beklemede"}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
