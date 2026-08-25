import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, X, FileText, Package, ClipboardCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "rfq" | "order" | "quality" | "finance";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const iconMap = { rfq: FileText, order: Package, quality: ClipboardCheck, finance: Wallet };
const colorMap = { rfq: "text-cyan-500", order: "text-blue-500", quality: "text-purple-500", finance: "text-emerald-500" };

interface Props {
  onTabChange?: (tab: string) => void;
}

export const MusteriNotifications = ({ onTabChange }: Props = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const initialized = useRef(false);

  const persistNotification = async (n: { type: string; title: string; message: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: n.type,
      title: n.title,
      message: n.message,
    });
  };

  const shouldNotify = async (type: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true;
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!data) return true;
    const key = `push_${type}` as string;
    return (data as any)[key] !== false;
  };

  const addNotification = async (n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const allowed = await shouldNotify(n.type);
    if (!allowed) return;

    const notif: Notification = {
      ...n,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev].slice(0, 50));
    toast.info(n.title, { description: n.message, duration: 5000 });
    persistNotification(n);
  };

  // Load history from DB
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) {
        setNotifications(data.map((d: any) => ({
          id: d.id,
          type: d.type as Notification["type"],
          title: d.title,
          message: d.message,
          timestamp: new Date(d.created_at),
          read: d.read,
        })));
      }
    };
    loadHistory();
  }, []);

  // Abonelikler yalnız bir kez kurulur; addNotification her render'da yeniden
  // oluştuğu için en güncel referansı ref üzerinden çağırıyoruz.
  const addNotificationRef = useRef(addNotification);
  useEffect(() => { addNotificationRef.current = addNotification; });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const rfqChannel = supabase
      .channel("notif-rfqs")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rfqs" }, (payload) => {
        const n = payload.new as any;
        const o = payload.old as any;
        if (n.quoted_price && !o.quoted_price) {
          addNotificationRef.current({ type: "rfq", title: "Teklif Fiyatı Verildi", message: `${n.service || "Teklif"} için ₺${Number(n.quoted_price).toLocaleString("tr-TR")} fiyat teklifi geldi.` });
        } else if (n.status !== o.status) {
          addNotificationRef.current({ type: "rfq", title: "Teklif Durumu Güncellendi", message: `Teklif durumu "${n.status}" olarak değiştirildi.` });
        }
      })
      .subscribe();

    const orderChannel = supabase
      .channel("notif-orders")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const n = payload.new as any;
        const o = payload.old as any;
        if (n.status !== o.status) {
          addNotificationRef.current({ type: "order", title: "Sipariş Durumu Değişti", message: `"${n.part_name || "Sipariş"}" durumu "${n.status}" olarak güncellendi.` });
        } else if (n.progress !== o.progress) {
          addNotificationRef.current({ type: "order", title: "Üretim İlerlemesi", message: `"${n.part_name || "Sipariş"}" ilerleme: %${n.progress}` });
        }
      })
      .subscribe();

    const qualityChannel = supabase
      .channel("notif-quality")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quality_reports" }, (payload) => {
        const n = payload.new as any;
        addNotificationRef.current({ type: "quality", title: "Yeni Kalite Raporu", message: `"${n.title}" raporu yüklendi.` });
      })
      .subscribe();

    const financeChannel = supabase
      .channel("notif-finance")
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_documents" }, (payload) => {
        const n = payload.new as any;
        if (payload.eventType === "INSERT") {
          addNotificationRef.current({ type: "finance", title: "Yeni Finansal Belge", message: `"${n.title || n.doc_type}" belgesi oluşturuldu.` });
        } else if (payload.eventType === "UPDATE") {
          addNotificationRef.current({ type: "finance", title: "Finansal Belge Güncellendi", message: `"${n.title || n.doc_number || "Belge"}" güncellendi.` });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(rfqChannel);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(qualityChannel);
      supabase.removeChannel(financeChannel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-1.5 rounded-lg dark:text-slate-400 text-slate-500 hover:text-[hsl(var(--primary))] dark:hover:bg-[#1E293B] hover:bg-slate-100 transition-colors"
        title="Bildirimler"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-lg border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="text-sm font-bold">Bildirimler</h4>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2" onClick={markAllRead}>
                    Tümünü Okundu İşaretle
                  </Button>
                )}
                <button onClick={() => setOpen(false)}><X size={16} className="text-muted-foreground" /></button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-52px)]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  const tabMap: Record<string, string> = {
                    rfq: "teklifler",
                    order: "siparisler",
                    quality: "kalite",
                    finance: "finans",
                  };
                  const targetTab = tabMap[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (onTabChange && targetTab) {
                          onTabChange(targetTab);
                          setOpen(false);
                        }
                      }}
                      className={`w-full text-left flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors hover:bg-accent/50 cursor-pointer ${
                        !n.read ? "dark:bg-[#1E293B]/50 bg-primary/5" : ""
                      }`}
                    >
                      <Icon size={18} className={`shrink-0 mt-0.5 ${colorMap[n.type]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">
                          {n.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
