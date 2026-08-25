import { useState, useEffect } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { Package, AlertTriangle, Scissors, Wrench, Loader2, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
  id: string;
  code: string;
  name: string;
  category: string | null;
  stock: number;
  min_stock: number;
  unit_cost: number;
  supplier: string | null;
}

interface RawMaterial {
  id: string;
  code: string;
  name: string;
  spec: string | null;
  stock: number;
  unit: string;
  unit_cost: number;
  waste_rate: number;
}

const emptyTool = { code: "", name: "", category: "", stock: 0, min_stock: 5, unit_cost: 0, supplier: "" };
const emptyMaterial = { code: "", name: "", spec: "", stock: 0, unit: "adet", unit_cost: 0, waste_rate: 0 };

export const InventoryView = () => {
  const [tab, setTab] = useState<"tools" | "materials">("tools");
  const [tools, setTools] = useState<Tool[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showAddMat, setShowAddMat] = useState(false);
  const [toolForm, setToolForm] = useState(emptyTool);
  const [matForm, setMatForm] = useState(emptyMaterial);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [{ data: tData }, { data: mData }] = await Promise.all([
      supabase.from("tool_inventory").select("*").order("code"),
      supabase.from("raw_materials").select("*").order("code"),
    ]);
    if (tData) setTools(tData as Tool[]);
    if (mData) setMaterials(mData as RawMaterial[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const ch1 = supabase.channel("tool-inv-rt").on("postgres_changes", { event: "*", schema: "public", table: "tool_inventory" }, () => fetchData()).subscribe();
    const ch2 = supabase.channel("raw-mat-rt").on("postgres_changes", { event: "*", schema: "public", table: "raw_materials" }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []);

  const criticalTools = tools.filter((t) => t.stock <= t.min_stock);
  const totalToolValue = tools.reduce((s, t) => s + t.stock * t.unit_cost, 0);
  const totalMaterialValue = materials.reduce((s, m) => s + m.stock * m.unit_cost, 0);
  const avgWaste = materials.length > 0 ? materials.reduce((s, m) => s + m.waste_rate, 0) / materials.length : 0;

  if (loading) {
    return <IndustrialSkeleton variant="table" rows={5} columns={4} />;
  }

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Kritik Takım Stoku", value: `${criticalTools.length} kalem`, icon: AlertTriangle, color: criticalTools.length > 0 ? "text-red-400" : "text-emerald-400", bg: criticalTools.length > 0 ? "bg-red-400/10" : "bg-emerald-400/10" },
          { label: "Takım Envanter Değeri", value: `₺${totalToolValue.toLocaleString("tr-TR")}`, icon: Wrench, color: "text-[#0AA2CD]", bg: "bg-[#0AA2CD]/10" },
          { label: "Hammadde Değeri", value: `₺${totalMaterialValue.toLocaleString("tr-TR")}`, icon: Package, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Ort. Fire Oranı", value: `%${avgWaste.toFixed(1)}`, icon: Scissors, color: "text-orange-400", bg: "bg-orange-400/10" },
        ].map((m) => (
          <div key={m.label} className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: "tools" as const, label: "Kesici Takımlar" },
            { id: "materials" as const, label: "Hammaddeler" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.id ? "bg-[#0AA2CD] text-white" : "dark:bg-[#1E293B] bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-[#0AA2CD]"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => tab === "tools" ? setShowAddTool(true) : setShowAddMat(true)}
          className="flex items-center gap-1 px-3 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold hover:bg-[#0AA2CD]/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> {tab === "tools" ? "Takım Ekle" : "Malzeme Ekle"}
        </button>
      </div>

      {/* Add Tool Modal */}
      {showAddTool && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAddTool(false)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Yeni Kesici Takım</h3>
              <button onClick={() => setShowAddTool(false)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kod</label>
                  <input value={toolForm.code} onChange={(e) => setToolForm({ ...toolForm, code: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                  <input value={toolForm.category} onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Takım Adı</label>
                <input value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok</label>
                  <input type="number" value={toolForm.stock} onChange={(e) => setToolForm({ ...toolForm, stock: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. Stok</label>
                  <input type="number" value={toolForm.min_stock} onChange={(e) => setToolForm({ ...toolForm, min_stock: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birim ₺</label>
                  <input type="number" value={toolForm.unit_cost} onChange={(e) => setToolForm({ ...toolForm, unit_cost: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tedarikçi</label>
                <input value={toolForm.supplier} onChange={(e) => setToolForm({ ...toolForm, supplier: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAddTool(false)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button disabled={!toolForm.code || !toolForm.name || saving} onClick={async () => {
                setSaving(true);
                const { error } = await supabase.from("tool_inventory").insert({ code: toolForm.code, name: toolForm.name, category: toolForm.category || null, stock: toolForm.stock, min_stock: toolForm.min_stock, unit_cost: toolForm.unit_cost, supplier: toolForm.supplier || null });
                setSaving(false);
                if (error) { toast.error("Eklenemedi"); return; }
                toast.success("Takım eklendi");
                setToolForm(emptyTool);
                setShowAddTool(false);
              }} className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />} Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMat && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAddMat(false)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Yeni Hammadde</h3>
              <button onClick={() => setShowAddMat(false)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kod</label>
                  <input value={matForm.code} onChange={(e) => setMatForm({ ...matForm, code: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birim</label>
                  <select value={matForm.unit} onChange={(e) => setMatForm({ ...matForm, unit: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm">
                    {["adet", "kg", "metre", "m²", "litre"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select></div>
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Malzeme Adı</label>
                <input value={matForm.name} onChange={(e) => setMatForm({ ...matForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ebat / Spec</label>
                <input value={matForm.spec} onChange={(e) => setMatForm({ ...matForm, spec: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok</label>
                  <input type="number" value={matForm.stock} onChange={(e) => setMatForm({ ...matForm, stock: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birim ₺</label>
                  <input type="number" value={matForm.unit_cost} onChange={(e) => setMatForm({ ...matForm, unit_cost: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fire %</label>
                  <input type="number" value={matForm.waste_rate} onChange={(e) => setMatForm({ ...matForm, waste_rate: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAddMat(false)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button disabled={!matForm.code || !matForm.name || saving} onClick={async () => {
                setSaving(true);
                const { error } = await supabase.from("raw_materials").insert({ code: matForm.code, name: matForm.name, spec: matForm.spec || null, stock: matForm.stock, unit: matForm.unit, unit_cost: matForm.unit_cost, waste_rate: matForm.waste_rate });
                setSaving(false);
                if (error) { toast.error("Eklenemedi"); return; }
                toast.success("Hammadde eklendi");
                setMatForm(emptyMaterial);
                setShowAddMat(false);
              }} className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />} Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "tools" ? (
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 dark:bg-[#1E293B] bg-white z-10">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                  <th className="text-left p-4">Kod</th>
                  <th className="text-left p-4">Takım Adı</th>
                  <th className="text-left p-4 hidden md:table-cell">Kategori</th>
                  <th className="text-right p-4">Stok</th>
                  <th className="text-right p-4 hidden md:table-cell">Min.</th>
                  <th className="text-right p-4">Birim ₺</th>
                  <th className="text-left p-4 hidden lg:table-cell">Tedarikçi</th>
                  <th className="text-left p-4">Durum</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => {
                  const critical = t.stock <= t.min_stock;
                  return (
                    <tr key={t.id} className={`dark:border-[#334155]/50 border-slate-100 border-b dark:hover:bg-white/5 hover:bg-slate-50 transition-colors ${critical ? "dark:bg-red-500/5 bg-red-50" : ""}`}>
                      <td className="p-4 font-bold text-[#0AA2CD] text-xs">{t.code}</td>
                      <td className="p-4 dark:text-white text-slate-800 font-medium text-xs">{t.name}</td>
                      <td className="p-4 dark:text-slate-400 text-slate-500 hidden md:table-cell text-xs">{t.category || "-"}</td>
                      <td className={`p-4 text-right font-bold font-mono tabular-nums ${critical ? "text-red-400" : "dark:text-white text-slate-800"}`}>{t.stock}</td>
                      <td className="p-4 text-right dark:text-slate-500 text-slate-400 hidden md:table-cell font-mono tabular-nums">{t.min_stock}</td>
                      <td className="p-4 text-right dark:text-slate-300 text-slate-600 font-mono tabular-nums">₺{t.unit_cost}</td>
                      <td className="p-4 dark:text-slate-400 text-slate-500 hidden lg:table-cell text-xs">{t.supplier || "-"}</td>
                      <td className="p-4">
                        {critical ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400 animate-pulse">Sipariş Ver</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400">Yeterli</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button onClick={async () => { if (!confirm(`"${t.name}" takımını silmek istediğinize emin misiniz?`)) return; const { error } = await supabase.from("tool_inventory").delete().eq("id", t.id); if (error) toast.error("Silinemedi"); else toast.success("Takım silindi"); }} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 dark:bg-[#1E293B] bg-white z-10">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                  <th className="text-left p-4">Kod</th>
                  <th className="text-left p-4">Malzeme</th>
                  <th className="text-left p-4 hidden md:table-cell">Ebat</th>
                  <th className="text-right p-4">Stok</th>
                  <th className="text-right p-4">Birim ₺</th>
                  <th className="text-right p-4">Fire %</th>
                  <th className="text-right p-4 hidden md:table-cell">Toplam ₺</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} className="dark:border-[#334155]/50 border-slate-100 border-b dark:hover:bg-white/5 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-[#0AA2CD] text-xs">{m.code}</td>
                    <td className="p-4 dark:text-white text-slate-800 font-medium text-xs">{m.name}</td>
                    <td className="p-4 dark:text-slate-400 text-slate-500 hidden md:table-cell text-xs font-mono">{m.spec || "-"}</td>
                    <td className="p-4 text-right dark:text-white text-slate-800 font-bold font-mono tabular-nums">{m.stock}</td>
                    <td className="p-4 text-right dark:text-slate-300 text-slate-600 font-mono tabular-nums">₺{m.unit_cost}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-bold font-mono tabular-nums ${m.waste_rate > 30 ? "text-red-400" : m.waste_rate > 20 ? "text-amber-400" : "text-emerald-400"}`}>%{m.waste_rate}</span>
                    </td>
                    <td className="p-4 text-right dark:text-white text-slate-800 font-bold font-mono tabular-nums hidden md:table-cell">₺{(m.stock * m.unit_cost).toLocaleString("tr-TR")}</td>
                    <td className="p-4">
                      <button onClick={async () => { if (!confirm(`"${m.name}" malzemesini silmek istediğinize emin misiniz?`)) return; const { error } = await supabase.from("raw_materials").delete().eq("id", m.id); if (error) toast.error("Silinemedi"); else toast.success("Malzeme silindi"); }} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
