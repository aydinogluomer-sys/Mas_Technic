import { useEffect, useState } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, Wrench, Code, UserX, Package, Cog, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Issue {
  id: string;
  job: string | null;
  category: string | null;
  date: string | null;
  status: string | null;
  severity: string | null;
  machine: string | null;
  detail: string | null;
  resolution: string | null;
  cost: number | null;
}

const categoryIcons: Record<string, typeof Wrench> = {
  "Takım Arızası": Wrench,
  "CAM/NC Hatası": Code,
  "İnsan Hatası": UserX,
  "Kaynak Kusuru": Package,
  "Kritik Donanım": Cog,
};

const categoryColors: Record<string, string> = {
  "Takım Arızası": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "CAM/NC Hatası": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "İnsan Hatası": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Kaynak Kusuru": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Kritik Donanım": "bg-red-500/10 text-red-400 border-red-500/20",
};

const emptyIssue = { id: "", job: "", category: "Takım Arızası", date: new Date().toISOString().slice(0, 10), severity: "normal", machine: "", detail: "", cost: 0 };

export const IssuesView = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState<Issue | null>(null);
  const [resolution, setResolution] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyIssue);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("issues").select("*").order("created_at", { ascending: false });
    if (data) setIssues(data as Issue[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resolve = async () => {
    if (!resolveModal) return;
    await supabase.from("issues").update({ status: "resolved", resolution }).eq("id", resolveModal.id);
    toast.success("Olay çözümlendi");
    setResolveModal(null);
    setResolution("");
    fetchData();
  };

  const categories = ["Takım Arızası", "CAM/NC Hatası", "İnsan Hatası", "Kaynak Kusuru", "Kritik Donanım"];

  if (loading) return <IndustrialSkeleton variant="table" rows={5} columns={5} />;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Header with Add Button */}
      <div className="flex items-center justify-end">
        <button onClick={() => { setForm({ ...emptyIssue, id: `ISS-${String(issues.length + 1).padStart(3, "0")}` }); setShowAdd(true); }}
          className="flex items-center gap-1 px-3 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold hover:bg-[#0AA2CD]/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Yeni Olay
        </button>
      </div>

      {/* Category KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || AlertTriangle;
          const count = issues.filter((i) => i.category === cat && i.status !== "resolved").length;
          return (
            <div key={cat} className={`rounded-xl border p-4 ${categoryColors[cat] || "bg-slate-500/10 border-slate-500/20"}`}>
              <Icon className="w-5 h-5 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">{cat}</p>
              <p className="text-2xl font-black mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium">Kayıtlı olay yok</p>
          </div>
        ) : issues.map((issue) => (
          <div key={issue.id} className={`dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-4 ${
            issue.severity === "high" ? "border-l-4 border-l-red-500" : ""
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0AA2CD]">{issue.id}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                    issue.severity === "high" ? "bg-red-500/20 text-red-400 animate-pulse" :
                    issue.severity === "normal" ? "bg-amber-500/20 text-amber-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {issue.severity === "high" ? "Müdahale Gerekli" : issue.severity === "normal" ? "Normal" : "Bilgilendirme"}
                  </span>
                </div>
                <p className="text-sm dark:text-white text-slate-800 font-bold mt-1">{issue.category} — {issue.machine}</p>
                <p className="text-xs dark:text-slate-400 text-slate-500">İş: {issue.job} • {issue.date} {issue.cost ? `• Maliyet: ₺${Number(issue.cost).toLocaleString("tr-TR")}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                {issue.status !== "resolved" && (
                  <button onClick={() => setResolveModal(issue)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/20">
                    Çözümle
                  </button>
                )}
                <button onClick={async () => { if (!confirm(`"${issue.id}" olayını silmek istediğinize emin misiniz?`)) return; const { error } = await supabase.from("issues").delete().eq("id", issue.id); if (error) toast.error("Silinemedi"); else { toast.success("Olay silindi"); fetchData(); } }} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {issue.detail && <p className="text-xs dark:text-slate-300 text-slate-600 italic dark:bg-[#0F172A] bg-slate-50 rounded p-2 mt-2">"{issue.detail}"</p>}
            {issue.resolution && (
              <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300">{issue.resolution}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Issue Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Yeni Olay Kaydı</h3>
              <button onClick={() => setShowAdd(false)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Olay ID</label>
                  <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Önem</label>
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm">
                    <option value="low">Bilgilendirme</option>
                    <option value="normal">Normal</option>
                    <option value="high">Müdahale Gerekli</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Makine</label>
                  <input value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İş</label>
                  <input value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maliyet ₺</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm" /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detay</label>
                <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-sm min-h-[60px]" /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button disabled={!form.id || saving} onClick={async () => {
                setSaving(true);
                const { error } = await supabase.from("issues").insert({ id: form.id, category: form.category, date: form.date, severity: form.severity, machine: form.machine || null, job: form.job || null, detail: form.detail || null, cost: form.cost, status: "open" });
                setSaving(false);
                if (error) { toast.error("Kayıt eklenemedi"); return; }
                toast.success("Olay kaydedildi");
                setForm(emptyIssue);
                setShowAdd(false);
                fetchData();
              }} className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />} Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setResolveModal(null)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Olay Çözümleme — {resolveModal.id}</h3>
              <button onClick={() => setResolveModal(null)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teşhis Özeti</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] min-h-[80px]"
              placeholder="Çözüm açıklamasını girin..."
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setResolveModal(null)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button onClick={resolve} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold">Müdahaleyi Onayla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
