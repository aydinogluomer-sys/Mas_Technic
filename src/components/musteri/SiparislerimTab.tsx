import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, RefreshCw, Loader2 } from "lucide-react";
import { TableSkeleton } from "./MusteriSkeletons";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Order {
  id: string;
  part_name: string | null;
  status: string | null;
  progress: number | null;
  quantity: number | null;
  order_date: string | null;
  deadline: string | null;
  rfq_ref: string | null;
}

const PAGE_SIZE = 20;

const statusColor = (s: string | null) => {
  switch (s) {
    case "Üretimde": return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "Tamamlandı": return "bg-green-500/10 text-green-600 border-green-200";
    case "Sevkiyata Hazır": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "Beklemede": return "bg-amber-500/10 text-amber-600 border-amber-200";
    default: return "bg-muted text-muted-foreground";
  }
};

export const SiparislerimTab = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOrders = useCallback(async (pageNum: number, append: boolean) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("orders")
      .select("id, part_name, status, progress, quantity, order_date, deadline, rfq_ref")
      .order("created_at", { ascending: false })
      .range(from, to);
    const newItems = (data as Order[]) || [];
    setHasMore(newItems.length === PAGE_SIZE);
    if (append) setOrders(prev => [...prev, ...newItems]);
    else setOrders(newItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders(0, false);
    const channel = supabase
      .channel("customer-orders-tab")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders(prev => [payload.new as Order, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const updated = payload.new as Order;
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "orders" }, (payload) => {
        const deleted = payload.old as { id: string };
        setOrders(prev => prev.filter(o => o.id !== deleted.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchOrders(nextPage, true);
    setLoadingMore(false);
  };

  const handleReorder = (order: Order) => {
    toast.info(`"${order.part_name}" için yeniden sipariş talebi oluşturuluyor...`);
    navigate("/teklif-al", {
      state: {
        partName: order.part_name,
        quantity: order.quantity,
        reorderFrom: order.id,
      },
    });
  };

  if (loading) return <TableSkeleton rows={4} cols={6} />;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Package size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Henüz siparişiniz bulunmuyor.</p>
        <Link to="/teklif-al" className="text-xs text-primary mt-2 hover:underline">Teklif talebi oluşturun →</Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
            <th className="pb-3 pr-4">Parça</th>
            <th className="pb-3 pr-4">Durum</th>
            <th className="pb-3 pr-4">İlerleme</th>
            <th className="pb-3 pr-4">Adet</th>
            <th className="pb-3 pr-4">Sipariş</th>
            <th className="pb-3 pr-4">Termin</th>
            <th className="pb-3">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border/50 last:border-0">
              <td className="py-3 pr-4 font-medium">{o.part_name || "—"}</td>
              <td className="py-3 pr-4">
                <Badge variant="outline" className={statusColor(o.status)}>{o.status || "—"}</Badge>
              </td>
              <td className="py-3 pr-4 w-32">
                <div className="flex items-center gap-2">
                  <Progress value={o.progress || 0} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground font-mono">{o.progress || 0}%</span>
                </div>
              </td>
              <td className="py-3 pr-4 font-mono">{o.quantity ?? "—"}</td>
              <td className="py-3 pr-4 text-muted-foreground">{o.order_date || "—"}</td>
              <td className="py-3 pr-4 text-muted-foreground">{o.deadline || "—"}</td>
              <td className="py-3">
                {o.status === "Tamamlandı" && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => handleReorder(o)}>
                    <RefreshCw size={14} /> Yeniden Sipariş
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && orders.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Daha Fazla Yükle"}
          </Button>
        </div>
      )}
    </div>
  );
};
