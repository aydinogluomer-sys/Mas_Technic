import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText, Upload, Plus, Download, Search, Filter, Brain,
  Receipt, CreditCard, FileCheck, Building2, TrendingUp, TrendingDown,
  CheckCircle2, Clock, AlertTriangle, X, Eye, Trash2, Edit3,
  FileSpreadsheet, FileUp, RefreshCw, Sparkles, ChevronDown, Calendar, ScanLine, Loader2,
  MessageSquare, Send, User, Bot
} from "lucide-react";

const DOC_TYPES = [
  { value: "fatura", label: "Fatura", icon: FileText, color: "text-blue-500" },
  { value: "fiş", label: "Fiş", icon: Receipt, color: "text-emerald-500" },
  { value: "çek", label: "Çek", icon: CreditCard, color: "text-amber-500" },
  { value: "dekont", label: "Dekont", icon: FileCheck, color: "text-purple-500" },
  { value: "e-fatura", label: "E-Fatura", icon: FileSpreadsheet, color: "text-cyan-500" },
];

const CATEGORIES = [
  "Hammadde", "Takım Giderleri", "Sarf Malzeme", "Bakım",
  "Sabit Giderler", "Yazılım", "Personel", "Nakliye", "Diğer"
];

const STATUS_MAP: Record<string, { label: string; class: string; icon: any }> = {
  beklemede: { label: "Beklemede", class: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  onaylandı: { label: "Onaylandı", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  reddedildi: { label: "Reddedildi", class: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle },
};

const PAYMENT_MAP: Record<string, { label: string; class: string }> = {
  ödendi: { label: "Ödendi", class: "bg-emerald-500/10 text-emerald-500" },
  ödenmedi: { label: "Ödenmedi", class: "bg-red-500/10 text-red-500" },
  vadeli: { label: "Vadeli", class: "bg-amber-500/10 text-amber-500" },
  kısmi: { label: "Kısmi", class: "bg-blue-500/10 text-blue-500" },
};

interface FinDoc {
  id: string;
  doc_type: string;
  doc_number: string | null;
  title: string | null;
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  vat_rate: number | null;
  vat_amount: number | null;
  total_amount: number | null;
  category: string | null;
  doc_date: string | null;
  due_date: string | null;
  status: string | null;
  payment_status: string | null;
  source: string | null;
  notes: string | null;
  file_urls: string[] | null;
  ai_summary: string | null;
  ai_category_suggestion: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

const emptyDoc = {
  doc_type: "fatura",
  doc_number: "",
  title: "",
  vendor: "",
  amount: 0,
  vat_rate: 18,
  category: "",
  doc_date: new Date().toISOString().split("T")[0],
  due_date: "",
  notes: "",
  payment_status: "ödenmedi",
  user_id: "",
};

interface CustomerProfile {
  id: string;
  full_name: string | null;
  company: string | null;
  email?: string;
}

export const FinanceDocsView = () => {
  const [docs, setDocs] = useState<FinDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<FinDoc | null>(null);
  const [formData, setFormData] = useState(emptyDoc);
  const [uploading, setUploading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [ocrProcessing, setOcrProcessing] = useState<string | null>(null);
  const [parasutSyncing, setParasutSyncing] = useState(false);
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);

  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from("financial_documents")
      .select("*")
      .order("doc_date", { ascending: false });
    if (error) {
      toast.error("Belgeler yüklenemedi");
      console.error(error);
    } else {
      setDocs((data as any) || []);
      // Only auto-generate on first load when no chat history exists
      if (chatHistory.length === 0) {
        generateAiInsights((data as any) || []);
      }
    }
    setLoading(false);
  };

  // fetchDocs her render'da yeniden oluşuyor (chatHistory'ye bağlı). Abonelik
  // yalnız mount'ta kurulmalı, ama realtime tetiklendiğinde en güncel fetchDocs
  // çağrılmalı — bu yüzden ref üzerinden erişiyoruz.
  const fetchDocsRef = useRef(fetchDocs);
  useEffect(() => { fetchDocsRef.current = fetchDocs; });

  useEffect(() => {
    fetchDocsRef.current();
    // Fetch customer profiles for dropdown
    supabase.from("profiles").select("id, full_name, company").then(({ data }) => {
      if (data) setCustomerProfiles(data as CustomerProfile[]);
    });
    const channel = supabase
      .channel("financial_documents_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_documents" }, () => fetchDocsRef.current())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const generateAiInsights = async (data: FinDoc[], question?: string) => {
    if (!data.length && !question) return;
    setAiLoading(true);
    
    // Add user message to chat history if question exists
    if (question) {
      setChatHistory(prev => [...prev, { role: "user", content: question }]);
    }
    
    try {
      const docsSummary = data.map(d => ({
        doc_type: d.doc_type,
        vendor: d.vendor,
        total_amount: d.total_amount,
        category: d.category,
        payment_status: d.payment_status,
        doc_date: d.doc_date,
        status: d.status,
      }));

      // Build history for contextual conversation
      const historyForApi = question ? chatHistory.map(h => ({ role: h.role, content: h.content })) : [];

      const { data: result, error } = await supabase.functions.invoke("finance-ai", {
        body: { documents: docsSummary, question: question || null, history: historyForApi },
      });

      if (error) throw error;
      if (result?.error) {
        if (result.error.includes("hız limiti")) toast.error(result.error);
        else if (result.error.includes("kredi")) toast.error(result.error);
        else throw new Error(result.error);
        return;
      }

      const analysis = result?.analysis || "";
      const lines = analysis.split("\n").filter((l: string) => l.trim().length > 0);
      setAiInsights(lines);
      
      // Add assistant response to chat history
      if (question) {
        setChatHistory(prev => [...prev, { role: "assistant", content: analysis }]);
      } else if (chatHistory.length === 0) {
        // Initial analysis - add as first assistant message
        setChatHistory([{ role: "assistant", content: analysis }]);
      }
    } catch (e: any) {
      console.error("AI insights error:", e);
      toast.error("AI analizi yapılamadı");
      const insights: string[] = [];
      const totalSpend = data.reduce((s, d) => s + (d.total_amount || 0), 0);
      const unpaid = data.filter(d => d.payment_status === "ödenmedi");
      insights.push(`📊 Toplam belge tutarı: ₺${totalSpend.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} — ${data.length} belge.`);
      if (unpaid.length > 0) insights.push(`⚠️ ${unpaid.length} adet ödenmemiş belge tespit edildi.`);
      setAiInsights(insights);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddDoc = async () => {
    const vatAmt = (formData.amount * formData.vat_rate) / 100;
    const totalAmt = formData.amount + vatAmt;
    const prefix = formData.doc_type === "fatura" ? "FTR" : formData.doc_type === "fiş" ? "FIS" : formData.doc_type === "çek" ? "CEK" : formData.doc_type === "dekont" ? "DKT" : "EFT";
    const docNum = formData.doc_number || `${prefix}-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("financial_documents").insert({
      doc_type: formData.doc_type,
      doc_number: docNum,
      title: formData.title,
      vendor: formData.vendor,
      amount: formData.amount,
      vat_rate: formData.vat_rate,
      vat_amount: vatAmt,
      total_amount: totalAmt,
      category: formData.category,
      doc_date: formData.doc_date || null,
      due_date: formData.due_date || null,
      notes: formData.notes,
      payment_status: formData.payment_status,
      source: "manuel",
      status: "beklemede",
      user_id: formData.user_id || null,
    } as any);

    if (error) {
      toast.error("Belge eklenemedi: " + error.message);
    } else {
      toast.success("Belge başarıyla eklendi");

      // Send notification to customer with amount
      if (formData.user_id) {
        const docLabel = DOC_TYPES.find(t => t.value === formData.doc_type)?.label || formData.doc_type;
        const dueDateStr = formData.due_date ? ` Vade: ${new Date(formData.due_date).toLocaleDateString("tr-TR")}` : "";
        await supabase.from("notifications").insert({
          user_id: formData.user_id,
          type: "finance",
          title: `Yeni ${docLabel}: ₺${totalAmt.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
          message: `${docNum} numaralı ${docLabel.toLowerCase()} oluşturuldu. Tutar: ₺${totalAmt.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}.${dueDateStr}`,
        });
      }

      setShowAddModal(false);
      setFormData(emptyDoc);
    }
  };

  const triggerOCR = async (filePath: string, docId: string, fileName: string) => {
    setOcrProcessing(docId);
    toast.info(`🔍 "${fileName}" için AI OCR başlatılıyor...`);
    try {
      const { data, error } = await supabase.functions.invoke("ocr-invoice", {
        body: { file_path: filePath, doc_id: docId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`✅ "${fileName}" OCR tamamlandı — veriler otomatik dolduruldu`);
    } catch (e: any) {
      console.error("OCR error:", e);
      toast.error(`OCR hatası: ${e.message || "Bilinmeyen hata"}`);
    } finally {
      setOcrProcessing(null);
    }
  };

  const handleParasutSync = async () => {
    setParasutSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parasut-sync");
      if (error) throw error;
      if (data?.error) {
        if (data.configured === false) {
          toast.error(data.error);
        } else {
          throw new Error(data.error);
        }
        return;
      }
      toast.success(`✅ ${data.message || "Senkronizasyon tamamlandı"}`);
    } catch (e: any) {
      console.error("Paraşüt sync error:", e);
      toast.error(`Paraşüt hatası: ${e.message || "Bilinmeyen hata"}`);
    } finally {
      setParasutSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowed = ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"];
      if (!allowed.includes(ext || "")) {
        toast.error(`Desteklenmeyen dosya formatı: .${ext}`);
        continue;
      }

      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("finance-docs")
        .upload(path, file);

      if (uploadError) {
        toast.error(`Yükleme hatası: ${uploadError.message}`);
        continue;
      }

      const docType = ext === "pdf" ? "e-fatura" : ["doc", "docx"].includes(ext || "") ? "fatura" : "fatura";
      const isImageOrPdf = ["jpg", "jpeg", "png", "webp", "pdf"].includes(ext || "");
      
      const { data: insertData, error: insertError } = await supabase.from("financial_documents").insert({
        doc_type: docType,
        title: file.name.replace(/\.[^/.]+$/, ""),
        source: isImageOrPdf ? "ocr-bekliyor" : "yükleme",
        file_urls: [path],
        status: "beklemede",
      } as any).select().single();

      if (insertError) {
        toast.error(`Kayıt hatası: ${insertError.message}`);
      } else {
        toast.success(`"${file.name}" başarıyla yüklendi`);
        
        // Trigger OCR for images and PDFs
        if (isImageOrPdf && insertData) {
          triggerOCR(path, (insertData as any).id, file.name);
        }
      }
    }
    setUploading(false);
    setShowUploadModal(false);
  };

  const handleExportCSV = () => {
    const bom = "\uFEFF";
    const headers = ["Belge No", "Tür", "Başlık", "Tedarikçi", "Tutar", "KDV", "Toplam", "Kategori", "Tarih", "Durum", "Ödeme"];
    const rows = filteredDocs.map(d => [
      d.doc_number, d.doc_type, d.title, d.vendor,
      d.amount, d.vat_amount, d.total_amount,
      d.category, d.doc_date, d.status, d.payment_status
    ].join(","));
    const csv = bom + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finans-belgeleri-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV dışa aktarıldı");
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("financial_documents").update({ status: newStatus } as any).eq("id", id);
    if (error) toast.error("Güncelleme hatası");
    else toast.success("Durum güncellendi");
  };

  const handlePaymentStatusChange = async (doc: FinDoc, newPaymentStatus: string) => {
    const oldStatus = doc.payment_status;
    const { error } = await supabase.from("financial_documents").update({ payment_status: newPaymentStatus } as any).eq("id", doc.id);
    if (error) { toast.error("Güncelleme hatası"); return; }
    toast.success("Ödeme durumu güncellendi");

    // Send notification to customer if user_id exists
    if (doc.user_id && oldStatus !== newPaymentStatus) {
      const statusLabel = PAYMENT_MAP[newPaymentStatus]?.label || newPaymentStatus;
      const totalStr = `₺${(doc.total_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
      await supabase.from("notifications").insert({
        user_id: doc.user_id,
        type: "finance",
        title: newPaymentStatus === "ödendi"
          ? `Ödeme Onaylandı ✅ ${totalStr}`
          : `Ödeme Durumu: ${statusLabel}`,
        message: `${doc.doc_number || "Belge"} numaralı ${doc.doc_type} için ödeme durumu "${statusLabel}" olarak güncellendi. Tutar: ${totalStr}`,
      });
    }

    // Refresh detail modal if open
    if (showDetailModal?.id === doc.id) {
      setShowDetailModal({ ...doc, payment_status: newPaymentStatus });
    }
    fetchDocs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("financial_documents").delete().eq("id", id);
    if (error) toast.error("Silme hatası: " + error.message);
    else toast.success("Belge silindi");
  };

  const filteredDocs = docs.filter(d => {
    const matchSearch = !searchTerm || [d.title, d.vendor, d.doc_number, d.category]
      .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === "all" || d.doc_type === filterType;
    const matchPayment = filterPayment === "all" || d.payment_status === filterPayment;
    return matchSearch && matchType && matchPayment;
  });

  const totalAmount = filteredDocs.reduce((s, d) => s + (d.total_amount || 0), 0);
  const paidAmount = filteredDocs.filter(d => d.payment_status === "ödendi").reduce((s, d) => s + (d.total_amount || 0), 0);
  const unpaidAmount = filteredDocs.filter(d => d.payment_status === "ödenmedi").reduce((s, d) => s + (d.total_amount || 0), 0);
  const pendingCount = filteredDocs.filter(d => d.status === "beklemede").length;

  const kpis = [
    { label: "Toplam Tutar", value: `₺${totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Ödenen", value: `₺${paidAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Ödenmemiş", value: `₺${unpaidAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Onay Bekleyen", value: pendingCount.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-medium">{kpi.label}</p>
                <p className="text-lg font-black dark:text-white text-slate-800 font-mono">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <div className="dark:bg-gradient-to-r dark:from-[#1E293B] dark:to-[#0F172A] bg-gradient-to-r from-blue-50 to-indigo-50 border dark:border-[#334155] border-blue-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAiPanel(!showAiPanel)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold dark:text-white text-slate-800">AI Finansal Asistan <span className="text-[10px] font-normal text-violet-400">(Gemini)</span></h3>
              <p className="text-[10px] dark:text-slate-400 text-slate-500">
                {aiLoading ? "Analiz yapılıyor..." : aiInsights.length > 0 ? `${aiInsights.length} satır analiz hazır` : "Paneli açın ve analiz başlatın"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {aiLoading && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
            <ChevronDown className={`w-5 h-5 dark:text-slate-400 text-slate-500 transition-transform ${showAiPanel ? "rotate-180" : ""}`} />
          </div>
        </button>
        {showAiPanel && (
          <div className="px-4 pb-4 space-y-3">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`rounded-lg p-3 text-sm leading-relaxed max-w-[85%] ${
                      msg.role === "user" 
                        ? "bg-[#0AA2CD]/10 dark:text-[#0AA2CD] text-[#0AA2CD] border border-[#0AA2CD]/20" 
                        : "dark:bg-[#0F172A]/60 bg-white/80 dark:text-slate-300 text-slate-600 border dark:border-[#334155]/50 border-slate-200"
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-[#0AA2CD]/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-[#0AA2CD]" />
                      </div>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="dark:bg-[#0F172A]/60 bg-white/80 rounded-lg p-3 text-sm dark:text-slate-400 text-slate-500 border dark:border-[#334155]/50 border-slate-200">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400 inline mr-2" />
                      Gemini düşünüyor...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No history yet - loading state */}
            {chatHistory.length === 0 && aiLoading && (
              <div className="dark:bg-[#0F172A]/60 bg-white/80 rounded-lg p-4 text-sm dark:text-slate-400 text-slate-500 border dark:border-[#334155]/50 border-slate-200 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                Gemini finansal analiz yapıyor...
              </div>
            )}

            {/* Question input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="AI'ya soru sor... (ör: Hangi kategoride tasarruf yapabilirim?)"
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !aiLoading && aiQuestion.trim()) { generateAiInsights(docs, aiQuestion.trim()); setAiQuestion(""); } }}
                className="flex-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-white border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={() => { if (aiQuestion.trim()) { generateAiInsights(docs, aiQuestion.trim()); setAiQuestion(""); } else { generateAiInsights(docs); } }}
                disabled={aiLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : aiQuestion.trim() ? <Send className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                {aiLoading ? "Analiz..." : aiQuestion.trim() ? "Gönder" : "Analiz Et"}
              </button>
              {chatHistory.length > 1 && (
                <button
                  onClick={() => { setChatHistory([]); setAiInsights([]); }}
                  className="px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-100 dark:text-slate-400 text-slate-500 text-xs font-bold hover:text-red-400 border dark:border-[#334155] border-slate-200"
                  title="Sohbeti temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400" />
            <input
              type="text"
              placeholder="Belge ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-[#0AA2CD] w-full sm:w-52"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800"
          >
            <option value="all">Tüm Türler</option>
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            className="px-3 py-2 rounded-lg dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800"
          >
            <option value="all">Tüm Ödemeler</option>
            <option value="ödendi">Ödendi</option>
            <option value="ödenmedi">Ödenmedi</option>
            <option value="vadeli">Vadeli</option>
          </select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setShowUploadModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
            <Upload className="w-3.5 h-3.5" /> Yükle
          </button>
          <button onClick={() => { setFormData(emptyDoc); setShowAddModal(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0AA2CD]/10 text-[#0AA2CD] text-xs font-bold hover:bg-[#0AA2CD]/20 transition-colors border border-[#0AA2CD]/20">
            <Plus className="w-3.5 h-3.5" /> Manuel Ekle
          </button>
          <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg dark:bg-white/5 bg-slate-100 dark:text-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border dark:border-[#334155] border-slate-200">
            <Download className="w-3.5 h-3.5" /> Dışa Aktar
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="dark:bg-[#0F172A]/50 bg-slate-50 border-b dark:border-[#334155] border-slate-200">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold">Belge</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold hidden sm:table-cell">Tedarikçi</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold hidden md:table-cell">Kategori</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold">Tutar</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold hidden lg:table-cell">Tarih</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold">Durum</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold hidden sm:table-cell">Ödeme</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#334155] divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 dark:text-slate-400 text-slate-500">Yükleniyor...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 dark:text-slate-400 text-slate-500">Belge bulunamadı</td></tr>
              ) : filteredDocs.map(doc => {
                const typeInfo = DOC_TYPES.find(t => t.value === doc.doc_type) || DOC_TYPES[0];
                const statusInfo = STATUS_MAP[doc.status || "beklemede"] || STATUS_MAP.beklemede;
                const payInfo = PAYMENT_MAP[doc.payment_status || "ödenmedi"] || PAYMENT_MAP.ödenmedi;
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={doc.id} className="dark:hover:bg-white/[0.02] hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${typeInfo.color.replace("text-", "bg-")}/10 flex items-center justify-center shrink-0`}>
                          <typeInfo.icon className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium dark:text-white text-slate-800 text-xs truncate">{doc.title || "—"}</p>
                          <p className="text-[10px] dark:text-slate-500 text-slate-400 font-mono">{doc.doc_number || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs dark:text-slate-300 text-slate-600">{doc.vendor || "—"}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[10px] px-2 py-0.5 rounded-full dark:bg-white/5 bg-slate-100 dark:text-slate-300 text-slate-600">{doc.category || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-xs font-bold dark:text-white text-slate-800 font-mono">₺{(doc.total_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                      <p className="text-[9px] dark:text-slate-500 text-slate-400 font-mono">KDV: ₺{(doc.vat_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-xs dark:text-slate-300 text-slate-600 font-mono">{doc.doc_date || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.class}`}>
                        <StatusIcon className="w-3 h-3" /> <span className="hidden sm:inline">{statusInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${payInfo.class}`}>{payInfo.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setShowDetailModal(doc)} className="p-1 rounded dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD] dark:hover:bg-white/5 hover:bg-slate-100">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {doc.status === "beklemede" && (
                          <button onClick={() => handleStatusChange(doc.id, "onaylandı")} className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(doc.id)} className="p-1 rounded text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t dark:border-[#334155] border-slate-200 px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] dark:text-slate-500 text-slate-400">{filteredDocs.length} belge listeleniyor</span>
          <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono">Toplam: ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="dark:bg-[#1E293B] bg-white rounded-2xl border dark:border-[#334155] border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-[#334155] border-slate-200">
              <h3 className="font-bold dark:text-white text-slate-800 text-sm">Yeni Belge Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="dark:text-slate-400 text-slate-500 hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Belge Türü</label>
                  <select value={formData.doc_type} onChange={e => setFormData({ ...formData, doc_type: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800">
                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Belge No</label>
                  <input value={formData.doc_number} onChange={e => setFormData({ ...formData, doc_number: e.target.value })} placeholder="Otomatik" className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 placeholder:text-slate-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Müşteri (Bildirim İçin)</label>
                <select value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800">
                  <option value="">Müşteri seçiniz (opsiyonel)</option>
                  {customerProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name || "İsimsiz"}{p.company ? ` — ${p.company}` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Başlık</label>
                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Tedarikçi</label>
                <input value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Tutar (₺)</label>
                  <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">KDV Oranı (%)</label>
                  <select value={formData.vat_rate} onChange={e => setFormData({ ...formData, vat_rate: parseInt(e.target.value) })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800">
                    <option value={1}>%1</option>
                    <option value={8}>%8</option>
                    <option value={10}>%10</option>
                    <option value={18}>%18</option>
                    <option value={20}>%20</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800">
                    <option value="">Seçiniz</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Ödeme Durumu</label>
                  <select value={formData.payment_status} onChange={e => setFormData({ ...formData, payment_status: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800">
                    <option value="ödenmedi">Ödenmedi</option>
                    <option value="ödendi">Ödendi</option>
                    <option value="vadeli">Vadeli</option>
                    <option value="kısmi">Kısmi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Belge Tarihi</label>
                  <input type="date" value={formData.doc_date} onChange={e => setFormData({ ...formData, doc_date: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Vade Tarihi</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-bold block mb-1">Notlar</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 resize-none" />
              </div>
              {/* Preview */}
              <div className="dark:bg-[#0F172A]/50 bg-slate-50 rounded-lg p-3 border dark:border-[#334155] border-slate-200">
                <div className="flex justify-between text-xs dark:text-slate-400 text-slate-500">
                  <span>KDV Tutarı:</span>
                  <span className="font-mono font-bold dark:text-white text-slate-800">₺{((formData.amount * formData.vat_rate) / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="dark:text-slate-400 text-slate-500">Genel Toplam:</span>
                  <span className="font-mono font-black text-[#0AA2CD]">₺{(formData.amount + (formData.amount * formData.vat_rate) / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t dark:border-[#334155] border-slate-200 flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-lg dark:bg-white/5 bg-slate-100 dark:text-slate-300 text-slate-600 text-sm font-bold">İptal</button>
              <button onClick={handleAddDoc} className="flex-1 px-4 py-2 rounded-lg bg-[#0AA2CD] text-white text-sm font-bold hover:bg-[#0AA2CD]/90">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="dark:bg-[#1E293B] bg-white rounded-2xl border dark:border-[#334155] border-slate-200 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-[#334155] border-slate-200">
              <h3 className="font-bold dark:text-white text-slate-800 text-sm">Belge Yükle</h3>
              <button onClick={() => setShowUploadModal(false)} className="dark:text-slate-400 text-slate-500 hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed dark:border-[#334155] border-slate-300 rounded-xl p-8 cursor-pointer dark:hover:border-[#0AA2CD]/50 hover:border-[#0AA2CD]/50 transition-colors">
                <ScanLine className="w-10 h-10 text-violet-400 mb-3" />
                <p className="text-sm font-bold dark:text-white text-slate-800">Dosya Sürükle veya Tıkla</p>
                <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-1">
                  Fatura/fiş fotoğrafı (JPG, PNG) • E-fatura (PDF) • Word dosyası (DOC, DOCX)
                </p>
                <p className="text-[10px] text-violet-400 font-bold mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Görsel dosyalar otomatik AI OCR ile işlenir
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {uploading && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm dark:text-slate-400 text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </div>
              )}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: FileUp, label: "Fatura Fotoğrafı", ext: "JPG / PNG" },
                  { icon: FileSpreadsheet, label: "E-Fatura PDF", ext: "PDF" },
                  { icon: FileText, label: "Word İçe Aktar", ext: "DOC / DOCX" },
                ].map((item, i) => (
                  <div key={i} className="dark:bg-[#0F172A]/50 bg-slate-50 rounded-lg p-3 text-center border dark:border-[#334155] border-slate-200">
                    <item.icon className="w-5 h-5 mx-auto dark:text-slate-400 text-slate-500 mb-1" />
                    <p className="text-[10px] font-bold dark:text-slate-300 text-slate-600">{item.label}</p>
                    <p className="text-[9px] dark:text-slate-500 text-slate-400">{item.ext}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="dark:bg-[#1E293B] bg-white rounded-2xl border dark:border-[#334155] border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-[#334155] border-slate-200">
              <h3 className="font-bold dark:text-white text-slate-800 text-sm">Belge Detayı</h3>
              <button onClick={() => setShowDetailModal(null)} className="dark:text-slate-400 text-slate-500 hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[
                ["Belge No", showDetailModal.doc_number],
                ["Tür", showDetailModal.doc_type],
                ["Başlık", showDetailModal.title],
                ["Tedarikçi", showDetailModal.vendor],
                ["Kategori", showDetailModal.category],
                ["Tarih", showDetailModal.doc_date],
                ["Vade", showDetailModal.due_date],
                ["Kaynak", showDetailModal.source],
              ].map(([label, val], i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider dark:text-slate-500 text-slate-400 font-bold">{label}</span>
                  <span className="text-xs dark:text-white text-slate-800 font-medium">{val || "—"}</span>
                </div>
              ))}
              <div className="dark:bg-[#0F172A]/50 bg-slate-50 rounded-lg p-3 border dark:border-[#334155] border-slate-200 space-y-1">
                <div className="flex justify-between text-xs"><span className="dark:text-slate-400 text-slate-500">Tutar:</span><span className="font-mono dark:text-white text-slate-800">₺{(showDetailModal.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-xs"><span className="dark:text-slate-400 text-slate-500">KDV (%{showDetailModal.vat_rate}):</span><span className="font-mono dark:text-white text-slate-800">₺{(showDetailModal.vat_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-xs font-bold"><span className="dark:text-slate-300 text-slate-600">Genel Toplam:</span><span className="font-mono text-[#0AA2CD]">₺{(showDetailModal.total_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></div>
              </div>
              {showDetailModal.notes && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider dark:text-slate-500 text-slate-400 font-bold block mb-1">Notlar</span>
                  <p className="text-xs dark:text-slate-300 text-slate-600">{showDetailModal.notes}</p>
                </div>
              )}
              {/* Payment Status Changer */}
              <div>
                <span className="text-[10px] uppercase tracking-wider dark:text-slate-500 text-slate-400 font-bold block mb-1">Ödeme Durumu Değiştir</span>
                <select
                  value={showDetailModal.payment_status || "ödenmedi"}
                  onChange={e => handlePaymentStatusChange(showDetailModal, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800"
                >
                  <option value="ödenmedi">Ödenmedi</option>
                  <option value="ödendi">Ödendi</option>
                  <option value="vadeli">Vadeli</option>
                  <option value="kısmi">Kısmi</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t dark:border-[#334155] border-slate-200">
              <button onClick={() => setShowDetailModal(null)} className="w-full px-4 py-2 rounded-lg dark:bg-white/5 bg-slate-100 dark:text-slate-300 text-slate-600 text-sm font-bold">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Paraşüt Integration */}
      <div className="dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold dark:text-white text-slate-800">Paraşüt Entegrasyonu</h4>
            <p className="text-[10px] dark:text-slate-400 text-slate-500">API anahtarınızı bağlayarak otomatik belge senkronizasyonu yapabilirsiniz.</p>
          </div>
          <button 
            onClick={handleParasutSync}
            disabled={parasutSyncing}
            className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20 hover:bg-orange-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {parasutSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {parasutSyncing ? "Senkronize ediliyor..." : "Senkronize Et"}
          </button>
        </div>
      </div>

      {/* OCR Processing Indicator */}
      {ocrProcessing && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 shadow-xl">
          <ScanLine className="w-5 h-5 text-violet-500 animate-pulse" />
          <div>
            <p className="text-xs font-bold dark:text-white text-slate-800">AI OCR İşleniyor</p>
            <p className="text-[10px] dark:text-slate-400 text-slate-500">Fatura verileri çıkarılıyor...</p>
          </div>
        </div>
      )}
    </div>
  );
};
