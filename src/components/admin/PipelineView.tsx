import { useState, useEffect, useRef } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Filter, PhoneCall, Mail, Handshake, Truck, Star, ArrowRight, Plus, Upload, X, Loader2, Trash2, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

const stagesDef = [
  { id: "prospect", label: "Prospeksiyon", icon: Filter, color: "bg-blue-500" },
  { id: "qualify", label: "Kalifikasyon", icon: PhoneCall, color: "bg-cyan-500" },
  { id: "rfq", label: "Teknik Keşif / RFQ", icon: Mail, color: "bg-[#0AA2CD]" },
  { id: "quote", label: "Teklif & Müzakere", icon: Handshake, color: "bg-amber-500" },
  { id: "po", label: "Sipariş Onayı", icon: Truck, color: "bg-emerald-500" },
  { id: "followup", label: "Teslimat Takibi", icon: Star, color: "bg-purple-500" },
];

const outreachTemplates = [
  { target: "CEO / Üst Yönetim", focus: "Stratejik büyüme & ROI", openRate: "32%" },
  { target: "Üretim Müdürü", focus: "Operasyonel verimlilik & kalite", openRate: "41%" },
  { target: "Satın Alma", focus: "Maliyet optimizasyonu & teslim hızı", openRate: "28%" },
  { target: "Tasarım Mühendisi", focus: "Tolerans kabiliyeti & DFM", openRate: "45%" },
];

interface Lead {
  id: string;
  company: string | null;
  contact_name: string | null;
  contact_email: string | null;
  stage: string | null;
  value: number | null;
  probability: number | null;
  last_action: string | null;
  notes: string | null;
  created_at: string;
}

export const PipelineView = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: "", contact_name: "", contact_email: "", value: "", probability: "50", stage: "prospect", last_action: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const fileRefExcel = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const fetchLeads = async () => {
    const { data } = await supabase.from("pipeline_leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filteredLeads = selectedStage ? leads.filter(d => d.stage === selectedStage) : leads;
  const stages = stagesDef.map(s => ({ ...s, count: leads.filter(d => d.stage === s.id).length }));
  const totalPipelineValue = leads.reduce((s, d) => s + (d.value || 0), 0);
  const weightedValue = leads.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);

  const addLead = async () => {
    if (!form.company.trim()) { toast.error("Firma adı zorunlu"); return; }
    const { error } = await supabase.from("pipeline_leads").insert({
      company: form.company,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      value: parseFloat(form.value) || 0,
      probability: parseInt(form.probability) || 0,
      stage: form.stage,
      last_action: form.last_action || null,
    } as any);
    if (error) { toast.error("Eklenemedi"); return; }
    toast.success("Lead eklendi");
    setShowAdd(false);
    setForm({ company: "", contact_name: "", contact_email: "", value: "", probability: "50", stage: "prospect", last_action: "" });
    fetchLeads();
  };

  const deleteLead = async (id: string) => {
    await supabase.from("pipeline_leads").delete().eq("id", id);
    toast.success("Lead silindi");
    fetchLeads();
  };

  const updateStage = async (id: string, stage: string) => {
    await supabase.from("pipeline_leads").update({ stage } as any).eq("id", id);
    fetchLeads();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    // For Excel files (.xlsx, .xls), parse as CSV-like (tab or comma separated after conversion)
    // Since we can't parse true xlsx in browser without a library, we accept CSV/TSV exported from Excel/Sheets
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    const startIdx = lines[0]?.toLowerCase().includes("firma") || lines[0]?.toLowerCase().includes("company") ? 1 : 0;
    const rows: any[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(/[,;\t]/).map(c => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 1 || !cols[0]) continue;
      rows.push({
        company: cols[0] || null,
        contact_name: cols[1] || null,
        contact_email: cols[2] || null,
        value: parseFloat(cols[3]) || 0,
        stage: cols[4] || "prospect",
      });
    }
    if (rows.length === 0) { toast.error("Dosyada geçerli veri bulunamadı"); setImporting(false); return; }
    const { error } = await supabase.from("pipeline_leads").insert(rows as any);
    if (error) { toast.error("İçe aktarma hatası"); } else { toast.success(`${rows.length} lead içe aktarıldı`); fetchLeads(); }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
    if (fileRefExcel.current) fileRefExcel.current.value = "";
  };

  const handleExportCSV = () => {
    const bom = "\uFEFF";
    const headers = ["Firma", "İlgili Kişi", "E-posta", "Değer", "Aşama", "Olasılık", "Son Eylem", "Tarih"];
    const rows = filteredLeads.map(d => [
      `"${d.company || ""}"`, `"${d.contact_name || ""}"`, `"${d.contact_email || ""}"`,
      d.value || 0, d.stage || "prospect", d.probability || 0,
      `"${d.last_action || ""}"`, d.created_at?.split("T")[0] || ""
    ].join(","));
    const csv = bom + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV dışa aktarıldı");
  };

  const handleExportTSV = () => {
    const bom = "\uFEFF";
    const headers = ["Firma", "İlgili Kişi", "E-posta", "Değer", "Aşama", "Olasılık", "Son Eylem", "Tarih"];
    const rows = filteredLeads.map(d => [
      d.company || "", d.contact_name || "", d.contact_email || "",
      d.value || 0, d.stage || "prospect", d.probability || 0,
      d.last_action || "", d.created_at?.split("T")[0] || ""
    ].join("\t"));
    const tsv = bom + headers.join("\t") + "\n" + rows.join("\n");
    const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline-leads-${new Date().toISOString().split("T")[0]}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel/Sheets uyumlu TSV dışa aktarıldı");
  };

  const handleExportPDF = () => {
    const stageLabels: Record<string, string> = {};
    stagesDef.forEach(s => { stageLabels[s.id] = s.label; });

    const title = `MAS Technic — Satış Pipeline Raporu (${new Date().toLocaleDateString("tr-TR")})`;
    const tableHead = ["#", "Firma", "İlgili Kişi", "E-posta", "Değer (₺)", "Aşama", "Olasılık (%)", "Son Eylem"];
    const tableRows = filteredLeads.map((d, i) => [
      i + 1,
      d.company || "—",
      d.contact_name || "—",
      d.contact_email || "—",
      (d.value || 0).toLocaleString("tr-TR"),
      stageLabels[d.stage || "prospect"] || d.stage,
      d.probability || 0,
      d.last_action || "—",
    ]);

    const totalVal = filteredLeads.reduce((s, d) => s + (d.value || 0), 0);
    const weightedVal = filteredLeads.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;font-size:12px}
  h1{font-size:18px;margin-bottom:4px;color:#0AA2CD}
  .meta{color:#64748b;margin-bottom:20px;font-size:11px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#0AA2CD;color:#fff;text-align:left;padding:8px 10px;font-size:10px;text-transform:uppercase}
  td{padding:7px 10px;border-bottom:1px solid #e2e8f0}
  tr:nth-child(even){background:#f8fafc}
  .summary{display:flex;gap:30px;margin-top:10px}
  .summary div{padding:12px 16px;background:#f1f5f9;border-radius:8px}
  .summary .label{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700}
  .summary .val{font-size:16px;font-weight:900;color:#0f172a;margin-top:2px}
  @media print{body{padding:20px}}
</style></head><body>
  <h1>${title}</h1>
  <p class="meta">${filteredLeads.length} lead · Toplam: ₺${totalVal.toLocaleString("tr-TR")} · Ağırlıklı: ₺${weightedVal.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</p>
  <table><thead><tr>${tableHead.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${tableRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
  <script>window.onload=function(){window.print()}</script>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
    toast.success("PDF yazdırma penceresi açıldı");
  };

  if (loading) return <IndustrialSkeleton variant="card" rows={6} />;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Pipeline</p>
          <p className="text-xl font-black text-[#0AA2CD] font-mono tabular-nums mt-1">₺{totalPipelineValue.toLocaleString("tr-TR")}</p>
        </div>
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ağırlıklı Değer</p>
          <p className="text-xl font-black text-emerald-400 font-mono tabular-nums mt-1">₺{weightedValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif Fırsatlar</p>
          <p className="text-xl font-black dark:text-white text-slate-800 mt-1">{leads.length}</p>
        </div>
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ort. Olasılık</p>
          <p className="text-xl font-black text-amber-400 mt-1">%{leads.length ? Math.round(leads.reduce((s, d) => s + (d.probability || 0), 0) / leads.length) : 0}</p>
        </div>
      </div>

      {/* Funnel */}
      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Satış Hattı Aşamaları</h3>
        <div className="flex flex-wrap gap-2">
          {stages.map((s, i) => (
            <button key={s.id} onClick={() => setSelectedStage(selectedStage === s.id ? null : s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedStage === s.id ? `${s.color} text-white` : "dark:bg-[#0F172A] bg-slate-50 dark:text-slate-300 text-slate-600 hover:text-[#0AA2CD]"
              }`}>
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
              <span className="dark:bg-white/20 bg-black/10 px-1.5 py-0.5 rounded-full text-[10px]">{s.count}</span>
              {i < stages.length - 1 && <ArrowRight className="w-3 h-3 opacity-30 hidden sm:block" />}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Yeni Lead
        </button>
        <label className={`flex items-center gap-1.5 px-3 py-1.5 dark:bg-[#1E293B] bg-slate-100 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold cursor-pointer hover:text-[#0AA2CD] ${importing ? "opacity-50 pointer-events-none" : ""}`}>
          {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          İçe Aktar CSV
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileImport} className="hidden" />
        </label>
        <label className={`flex items-center gap-1.5 px-3 py-1.5 dark:bg-[#1E293B] bg-slate-100 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold cursor-pointer hover:text-[#0AA2CD] ${importing ? "opacity-50 pointer-events-none" : ""}`}>
          {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
          İçe Aktar Excel/Sheets
          <input ref={fileRefExcel} type="file" accept=".tsv,.xls,.xlsx,.csv" onChange={handleFileImport} className="hidden" />
        </label>
        <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 dark:bg-[#1E293B] bg-slate-100 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:text-[#0AA2CD]">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar CSV
        </button>
        <button onClick={handleExportTSV} className="flex items-center gap-1.5 px-3 py-1.5 dark:bg-[#1E293B] bg-slate-100 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:text-[#0AA2CD]">
          <FileSpreadsheet className="w-3.5 h-3.5" /> Dışa Aktar Excel/Sheets
        </button>
        <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 dark:bg-[#1E293B] bg-slate-100 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:text-[#0AA2CD]">
          <FileText className="w-3.5 h-3.5" /> Dışa Aktar PDF
        </button>
      </div>

      {/* Deals Table */}
      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Filter className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Henüz lead bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 dark:bg-[#1E293B] bg-white z-10">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                  <th className="text-left p-4">Firma</th>
                  <th className="text-left p-4 hidden md:table-cell">İlgili Kişi</th>
                  <th className="text-left p-4 hidden lg:table-cell">E-posta</th>
                  <th className="text-right p-4">Değer</th>
                  <th className="text-left p-4">Aşama</th>
                  <th className="text-right p-4">Olasılık</th>
                  <th className="text-left p-4 hidden md:table-cell">Son Eylem</th>
                  <th className="text-left p-4">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((d) => {
                  const stage = stages.find(s => s.id === d.stage);
                  return (
                    <tr key={d.id} className="dark:border-[#334155]/50 border-slate-100 border-b dark:hover:bg-white/5 hover:bg-slate-50 transition-colors">
                      <td className="p-4 dark:text-white text-slate-800 font-medium">{d.company || "—"}</td>
                      <td className="p-4 dark:text-slate-400 text-slate-500 hidden md:table-cell">{d.contact_name || "—"}</td>
                      <td className="p-4 dark:text-slate-400 text-slate-500 hidden lg:table-cell text-xs">{d.contact_email || "—"}</td>
                      <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums">₺{(d.value || 0).toLocaleString("tr-TR")}</td>
                      <td className="p-4">
                        <select value={d.stage || "prospect"} onChange={e => updateStage(d.id, e.target.value)}
                          className="text-[10px] px-2 py-1 rounded-full font-bold border-0 dark:bg-[#0F172A] bg-slate-50 dark:text-slate-300 text-slate-600 focus:outline-none cursor-pointer">
                          {stagesDef.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-xs font-bold font-mono tabular-nums ${(d.probability || 0) >= 70 ? "text-emerald-400" : (d.probability || 0) >= 40 ? "text-amber-400" : "text-slate-400"}`}>
                          %{d.probability || 0}
                        </span>
                      </td>
                      <td className="p-4 text-xs dark:text-slate-400 text-slate-500 hidden md:table-cell">{d.last_action || "—"}</td>
                      <td className="p-4">
                        <button onClick={() => deleteLead(d.id)} className="text-xs text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Outreach Templates */}
      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cold Mail Stratejisi — Hedef Bazlı Mesajlaşma</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {outreachTemplates.map(t => (
            <div key={t.target} className="dark:bg-[#0F172A] bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold dark:text-white text-slate-800 mb-1">{t.target}</p>
              <p className="text-[10px] dark:text-slate-400 text-slate-500 mb-2">{t.focus}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Açılma Oranı</span>
                <span className="text-xs font-bold text-[#0AA2CD] font-mono">{t.openRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Yeni Lead</h3>
              <button onClick={() => setShowAdd(false)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "company", label: "Firma", ph: "Firma Adı" },
                { key: "contact_name", label: "İlgili Kişi", ph: "Ad Soyad" },
                { key: "contact_email", label: "E-posta", ph: "info@firma.com" },
                { key: "value", label: "Değer (₺)", ph: "50000" },
                { key: "probability", label: "Olasılık (%)", ph: "50" },
                { key: "last_action", label: "Son Eylem", ph: "İlk temas yapıldı" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]"
                    placeholder={f.ph} />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aşama</label>
                <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]">
                  {stagesDef.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button onClick={addLead} className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
