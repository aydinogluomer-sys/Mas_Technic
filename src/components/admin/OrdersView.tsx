import { useEffect, useState } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Package, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  rfq_ref: string | null;
  customer: string | null;
  part_name: string | null;
  quantity: number | null;
  order_date: string | null;
  deadline: string | null;
  status: string | null;
  progress: number | null;
  completed_qty: number;
  qc_passed_qty: number;
  packed_qty: number;
  machine: string | null;
  notes: string | null;
  user_id: string | null;
}

const statusColors: Record<string, string> = {
  Hazırlık: "bg-blue-500/20 text-blue-400",
  Üretimde: "bg-amber-500/20 text-amber-400",
  "Kalite Kontrol": "bg-purple-500/20 text-purple-400",
  Paketleme: "bg-cyan-500/20 text-cyan-400",
  Tamamlandı: "bg-emerald-500/20 text-emerald-400",
};

const statusOptions = ["Hazırlık", "Üretimde", "Kalite Kontrol", "Paketleme", "Tamamlandı"];

function calcProgress(completed: number, qc: number, packed: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 50 + (qc / total) * 30 + (packed / total) * 20));
}

export const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [form, setForm] = useState({ completed_qty: 0, qc_passed_qty: 0, packed_qty: 0, status: "Hazırlık", machine: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const openEdit = (o: Order) => {
    setSelected(o);
    setForm({
      completed_qty: o.completed_qty || 0,
      qc_passed_qty: o.qc_passed_qty || 0,
      packed_qty: o.packed_qty || 0,
      status: o.status || "Hazırlık",
      machine: o.machine || "",
      notes: o.notes || "",
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const qty = selected.quantity || 1;
    const progress = calcProgress(form.completed_qty, form.qc_passed_qty, form.packed_qty, qty);
    const oldStatus = selected.status;

    const { error } = await supabase.from("orders").update({
      completed_qty: form.completed_qty,
      qc_passed_qty: form.qc_passed_qty,
      packed_qty: form.packed_qty,
      status: form.status,
      machine: form.machine || null,
      notes: form.notes || null,
      progress,
    }).eq("id", selected.id);

    setSaving(false);
    if (error) { toast.error("Güncelleme hatası"); return; }

    // Send notification to customer if status changed and order has user_id
    if (oldStatus !== form.status && selected.user_id) {
      await supabase.from("notifications").insert({
        user_id: selected.user_id,
        type: "order",
        title: `Sipariş Durumu: ${form.status}`,
        message: `${selected.id} numaralı siparişiniz "${oldStatus}" → "${form.status}" olarak güncellendi. İlerleme: %${progress}`,
      }).then(() => {});
    }

    toast.success(`İlerleme %${progress} olarak güncellendi`);
    setSelected(null);
    fetchOrders();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bu sipariş kaydını silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error("Silme hatası"); return; }
    toast.success("Sipariş silindi");
    fetchOrders();
  };

  if (loading) return <IndustrialSkeleton variant="table" rows={6} columns={5} />;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-[fadeInUp_0.4s_ease-out]">
        <Package className="w-12 h-12 mb-3" />
        <p className="font-medium">Henüz sipariş kaydı yok</p>
        <p className="text-xs mt-1">Teklif onaylandıktan sonra siparişler burada görünür</p>
      </div>
    );
  }

  return (
    <>
      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border overflow-hidden animate-[fadeInUp_0.4s_ease-out]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 dark:bg-[#1E293B] bg-white z-10">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                <th className="text-left p-4">Sipariş No</th>
                <th className="text-left p-4 hidden lg:table-cell">RFQ Ref</th>
                <th className="text-left p-4">Müşteri</th>
                <th className="text-left p-4 hidden md:table-cell">Parça</th>
                <th className="text-right p-4 font-mono">Adet</th>
                <th className="text-right p-4 font-mono hidden md:table-cell">Üretilen</th>
                <th className="text-right p-4 font-mono hidden lg:table-cell">KK Geçen</th>
                <th className="text-right p-4 font-mono hidden lg:table-cell">Paket</th>
                <th className="text-left p-4">Durum</th>
                <th className="text-left p-4">İlerleme</th>
                <th className="text-left p-4">Sil</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} onClick={() => openEdit(o)} className="dark:border-[#334155]/50 border-slate-100 border-b dark:hover:bg-white/5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="p-4 font-bold text-[#0AA2CD]">{o.id}</td>
                  <td className="p-4 dark:text-slate-400 text-slate-500 hidden lg:table-cell">{o.rfq_ref || "-"}</td>
                  <td className="p-4 dark:text-white text-slate-800">{o.customer || "-"}</td>
                  <td className="p-4 dark:text-slate-300 text-slate-600 hidden md:table-cell">{o.part_name || "-"}</td>
                  <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums">{o.quantity || "-"}</td>
                  <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums hidden md:table-cell">{o.completed_qty || 0}</td>
                  <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums hidden lg:table-cell">{o.qc_passed_qty || 0}</td>
                  <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums hidden lg:table-cell">{o.packed_qty || 0}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusColors[o.status || ""] || "bg-slate-500/20 text-slate-400"}`}>
                      {o.status || "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 dark:bg-[#0F172A] bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0AA2CD] rounded-full transition-all" style={{ width: `${o.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold dark:text-white text-slate-800 font-mono tabular-nums">{o.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={(e) => handleDelete(e, o.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Update Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0AA2CD]" />
              Üretim Güncelle — {selected?.id}
            </DialogTitle>
            <DialogDescription>
              {selected?.part_name} • Toplam: {selected?.quantity || 0} adet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold dark:text-slate-400 text-slate-500">Tahmini İlerleme</span>
                <span className="text-lg font-black text-[#0AA2CD] font-mono">
                  {calcProgress(form.completed_qty, form.qc_passed_qty, form.packed_qty, selected?.quantity || 1)}%
                </span>
              </div>
              <div className="w-full h-3 dark:bg-[#1E293B] bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0AA2CD] to-emerald-400 rounded-full transition-all" style={{ width: `${calcProgress(form.completed_qty, form.qc_passed_qty, form.packed_qty, selected?.quantity || 1)}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] dark:text-slate-500 text-slate-400">
                <span>Üretim %50</span><span>Kalite %30</span><span>Paket %20</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Üretilen Adet", key: "completed_qty" as const },
                { label: "KK Geçen", key: "qc_passed_qty" as const },
                { label: "Paketlenen", key: "packed_qty" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">{label}</label>
                  <input
                    type="number"
                    min={0}
                    max={selected?.quantity || 9999}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] font-mono text-center font-bold"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Durum</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]"
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Tezgah</label>
              <input
                value={form.machine}
                onChange={(e) => setForm({ ...form, machine: e.target.value })}
                placeholder="Örn: DMG MORI CMX-600"
                className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Üretim Notları</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Üretim sürecine dair notlar..."
                className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] min-h-[60px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>İptal</Button>
              <Button className="flex-1 bg-[#0AA2CD] hover:bg-[#0AA2CD]/90" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
