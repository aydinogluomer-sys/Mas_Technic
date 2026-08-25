import { useEffect, useState } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: number;
  name: string | null;
  short_name: string | null;
  email: string | null;
  address: string | null;
  tax_info: string | null;
  iban: string | null;
  balance: number | null;
  last_order: string | null;
  company: string | null;
  city: string | null;
  phone: string | null;
}

export const CustomersView = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", short_name: "", email: "", address: "", tax_info: "", iban: "" });

  const fetchData = async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (data) setCustomers(data as Customer[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addCustomer = async () => {
    if (!form.name.trim()) { toast.error("Firma unvanı zorunludur"); return; }
    if (form.name.length > 200) { toast.error("Firma unvanı en fazla 200 karakter olabilir"); return; }
    if (form.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
      toast.error("Geçerli bir e-posta adresi girin"); return;
    }
    const { error } = await supabase.from("customers").insert({
      name: form.name,
      short_name: form.short_name || null,
      email: form.email || null,
      address: form.address || null,
      tax_info: form.tax_info || null,
      iban: form.iban || null,
    } as any);
    if (error) { toast.error("Eklenemedi"); return; }
    toast.success("Çözüm ortağı eklendi");
    setShowAdd(false);
    setForm({ name: "", short_name: "", email: "", address: "", tax_info: "", iban: "" });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu çözüm ortağını silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) { toast.error("Silme hatası"); return; }
    toast.success("Çözüm ortağı silindi");
    fetchData();
  };

  if (loading) return <IndustrialSkeleton variant="table" rows={5} columns={4} />;

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex items-center justify-between">
        <span className="text-xs dark:text-slate-400 text-slate-500">{customers.length} çözüm ortağı</span>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Yeni Ekle
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Henüz çözüm ortağı kaydı yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5 hover:shadow-xl hover:border-[#0AA2CD]/30 transition-all relative group">
              <button
                onClick={() => handleDelete(c.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#0AA2CD]/20 flex items-center justify-center text-[#0AA2CD] font-black text-sm">
                  {(c.short_name || c.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold dark:text-white text-slate-800 text-sm">{c.name || "—"}</h3>
                  {c.short_name && <p className="text-xs dark:text-slate-400 text-slate-500">{c.short_name}</p>}
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {c.email && <p className="dark:text-slate-400 text-slate-500">✉ {c.email}</p>}
                {c.address && <p className="dark:text-slate-400 text-slate-500">📍 {c.address}</p>}
                {c.tax_info && <p className="dark:text-slate-400 text-slate-500">🏛 {c.tax_info}</p>}
                {c.iban && <p className="dark:text-slate-400 text-slate-500 font-mono text-[10px]">🏦 {c.iban}</p>}
                {c.balance !== null && (
                  <p className="dark:text-white text-slate-800 font-bold mt-2">Bakiye: ₺{Number(c.balance).toLocaleString("tr-TR")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Yeni Çözüm Ortağı</h3>
              <button onClick={() => setShowAdd(false)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "name", label: "Firma Unvanı", ph: "ABC Makina San. Tic. Ltd. Şti." },
                { key: "short_name", label: "Kısa İsim", ph: "ABC Makina" },
                { key: "email", label: "E-Posta Adresi", ph: "info@firma.com" },
                { key: "address", label: "Açık Adresi", ph: "Organize Sanayi Bölgesi, 1. Cadde No:5" },
                { key: "tax_info", label: "Vergi Bilgileri", ph: "İkitelli VD - 1234567890" },
                { key: "iban", label: "IBAN Numaraları", ph: "TR00 0000 0000 0000 0000 0000 00" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                  <input
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]"
                    placeholder={f.ph}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button onClick={addCustomer} className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
