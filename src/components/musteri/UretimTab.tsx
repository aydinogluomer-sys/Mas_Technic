import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock } from "lucide-react";
import { ProductionSkeleton } from "./MusteriSkeletons";

interface OrderProduction {
  id: string;
  part_name: string | null;
  status: string | null;
  progress: number | null;
  quantity: number | null;
  deadline: string | null;
  created_at: string;
}

const STEPS = [
  { key: "malzeme", label: "Malzeme Tedarik", progress: 0 },
  { key: "hazirlık", label: "CAM & Hazırlık", progress: 16 },
  { key: "isleme", label: "CNC İşleme", progress: 33 },
  { key: "final", label: "Final İşlem", progress: 50 },
  { key: "kalite", label: "Kalite Kontrol", progress: 75 },
  { key: "sevkiyat", label: "Tamamlandı", progress: 100 },
];

const getActiveStep = (progress: number) => {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (progress >= STEPS[i].progress) return i;
  }
  return 0;
};

const statusBadgeClass = (s: string | null) => {
  switch (s) {
    case "Üretimde": return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "Kalite Kontrol": return "bg-violet-500/10 text-violet-600 border-violet-200";
    case "Paketleme": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    default: return "bg-amber-500/10 text-amber-600 border-amber-200";
  }
};

const ACTIVE_STATUSES = ["Hazırlık", "Üretimde", "Kalite Kontrol", "Paketleme"];

const estimateCompletion = (progress: number, createdAt: string, deadline: string | null): string | null => {
  if (progress >= 100) return "Tamamlandı";
  if (deadline) return deadline;
  if (progress <= 0) return null;
  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsed = now - start;
  if (elapsed <= 0) return null;
  const totalEstimate = elapsed / (progress / 100);
  const estimatedEnd = new Date(start + totalEstimate);
  return estimatedEnd.toISOString().split("T")[0];
};

export const UretimTab = () => {
  const [items, setItems] = useState<OrderProduction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, part_name, status, progress, quantity, deadline, created_at")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false });
    setItems((data as OrderProduction[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("customer-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <ProductionSkeleton count={2} />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Activity size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Aktif üretim kaydı bulunmuyor.</p>
        <p className="text-xs mt-1">Siparişleriniz üretime girdiğinde burada takip edebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const progress = item.progress || 0;
        const activeStep = getActiveStep(progress);
        const estimated = estimateCompletion(progress, item.created_at, item.deadline);
        
        // Gecikme kontrolü: termin geçmiş ve henüz tamamlanmamış
        const isOverdue = item.deadline && progress < 100 && new Date(item.deadline) < new Date();

        return (
          <div 
            key={item.id} 
            className={`border p-5 transition-all ${
              isOverdue 
                ? "border-destructive bg-destructive/5" 
                : "border-border bg-background"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">{item.part_name || "İsimsiz Parça"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.quantity && `${item.quantity} adet`}
                  {item.deadline && (
                    <span className={isOverdue ? "text-destructive font-medium" : ""}>
                      {" · Termin: "}{item.deadline}{isOverdue && " ⚠️ GECİKMİŞ"}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 animate-pulse">
                    GECİKMİŞ
                  </Badge>
                )}
                {estimated && !item.deadline && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    Tah. {estimated}
                  </span>
                )}
                <Badge variant="outline" className={statusBadgeClass(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => {
                const isActive = i === activeStep;
                const isCompleted = i < activeStep;

                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted ? (isOverdue ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground") :
                        isActive ? (isOverdue ? "bg-destructive text-destructive-foreground ring-4 ring-destructive/20" : "bg-primary text-primary-foreground ring-4 ring-primary/20") :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? "✓" : i + 1}
                      </div>
                      <span className={`text-[10px] mt-1.5 text-center leading-tight ${
                        isActive ? (isOverdue ? "font-bold text-destructive" : "font-bold text-primary") :
                        isCompleted ? "text-foreground" :
                        "text-muted-foreground"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 ${isCompleted ? (isOverdue ? "bg-destructive" : "bg-primary") : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall progress bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isOverdue ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-semibold ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>{progress}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
