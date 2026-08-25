import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Package, Headphones, DollarSign, Loader2, Upload, X, File } from "lucide-react";

type ModalType = "rfq" | "order" | "support" | "pipeline" | null;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_EXTENSIONS = ".step,.stp,.iges,.igs,.stl,.obj,.3mf,.dxf,.dwg,.pdf,.zip,.rar";

interface UploadedFile {
  file: File;
  uploading: boolean;
  url?: string;
  error?: string;
}

interface Props {
  activeModal: ModalType;
  onClose: () => void;
}

export const QuickActionModals = ({ activeModal, onClose }: Props) => {
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RFQ form
  const [rfq, setRfq] = useState({ customer: "", service: "", material: "", quantity: "", notes: "" });
  const [rfqFiles, setRfqFiles] = useState<UploadedFile[]>([]);
  // Order form
  const [order, setOrder] = useState({ id: "", part_name: "", customer: "", quantity: "", machine: "" });
  // Support form  
  const [ticket, setTicket] = useState({ subject: "", message: "", priority: "normal" });
  // Pipeline form
  const [lead, setLead] = useState({ company: "", contact_name: "", contact_email: "", value: "", stage: "prospect" });

  const inputCls = "w-full px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0AA2CD] focus:ring-1 focus:ring-[#0AA2CD]/30";
  const labelCls = "text-[11px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider mb-1 block";

  const addFiles = useCallback((files: File[]) => {
    const valid: UploadedFile[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} çok büyük (maks 50 MB)`);
        continue;
      }
      if (rfqFiles.length + valid.length >= 5) {
        toast.error("En fazla 5 dosya yüklenebilir");
        break;
      }
      valid.push({ file, uploading: false });
    }
    if (valid.length > 0) setRfqFiles((prev) => [...prev, ...valid]);
  }, [rfqFiles.length]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  }, [addFiles]);

  const removeFile = (idx: number) => {
    setRfqFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadFiles = async (rfqId: string): Promise<string[]> => {
    const urls: string[] = [];
    const updated = [...rfqFiles];

    for (let i = 0; i < updated.length; i++) {
      const f = updated[i];
      updated[i] = { ...f, uploading: true };
      setRfqFiles([...updated]);

      const ext = f.file.name.split(".").pop() || "bin";
      const path = `admin/${rfqId}/${Date.now()}-${f.file.name}`;

      const { error } = await supabase.storage
        .from("cad-uploads")
        .upload(path, f.file, { contentType: f.file.type || `application/octet-stream` });

      if (error) {
        updated[i] = { ...f, uploading: false, error: error.message };
        setRfqFiles([...updated]);
        toast.error(`${f.file.name} yüklenemedi`);
        continue;
      }

      urls.push(path);
      updated[i] = { ...f, uploading: false, url: path };
      setRfqFiles([...updated]);
    }
    return urls;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSaveRfq = async () => {
    if (!rfq.customer.trim()) { toast.error("Müşteri adı zorunlu"); return; }
    setSaving(true);
    const id = `RFQ-${Date.now().toString(36).toUpperCase()}`;

    // Upload files first
    let fileUrls: string[] = [];
    if (rfqFiles.length > 0) {
      fileUrls = await uploadFiles(id);
    }

    const { error } = await supabase.from("rfqs").insert({
      id, customer: rfq.customer, service: rfq.service, material: rfq.material,
      quantity: rfq.quantity ? parseInt(rfq.quantity) : null, notes: rfq.notes,
      files: fileUrls.length > 0 ? fileUrls : null,
      status: "Yeni", date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    if (error) { toast.error("Kayıt başarısız: " + error.message); return; }
    toast.success(`${id} oluşturuldu${fileUrls.length > 0 ? ` (${fileUrls.length} dosya)` : ""}`);
    setRfq({ customer: "", service: "", material: "", quantity: "", notes: "" });
    setRfqFiles([]);
    onClose();
  };

  const handleSaveOrder = async () => {
    if (!order.id.trim() || !order.part_name.trim()) { toast.error("Sipariş No ve Parça Adı zorunlu"); return; }
    setSaving(true);
    const { error } = await supabase.from("orders").insert({
      id: order.id, part_name: order.part_name, customer: order.customer,
      quantity: order.quantity ? parseInt(order.quantity) : null, machine: order.machine,
      status: "Hazırlık", order_date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    if (error) { toast.error("Kayıt başarısız: " + error.message); return; }
    toast.success(`Sipariş ${order.id} oluşturuldu`);
    setOrder({ id: "", part_name: "", customer: "", quantity: "", machine: "" });
    onClose();
  };

  const handleSaveTicket = async () => {
    if (!ticket.subject.trim() || !ticket.message.trim()) { toast.error("Konu ve mesaj zorunlu"); return; }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Oturum bulunamadı"); setSaving(false); return; }
    const { error } = await supabase.from("support_tickets").insert({
      subject: ticket.subject, message: ticket.message, priority: ticket.priority,
      user_id: session.user.id,
    });
    setSaving(false);
    if (error) { toast.error("Kayıt başarısız: " + error.message); return; }
    toast.success("Destek talebi oluşturuldu");
    setTicket({ subject: "", message: "", priority: "normal" });
    onClose();
  };

  const handleSaveLead = async () => {
    if (!lead.company.trim()) { toast.error("Firma adı zorunlu"); return; }
    setSaving(true);
    const { error } = await supabase.from("pipeline_leads").insert({
      company: lead.company, contact_name: lead.contact_name, contact_email: lead.contact_email,
      value: lead.value ? parseFloat(lead.value) : 0, stage: lead.stage,
    });
    setSaving(false);
    if (error) { toast.error("Kayıt başarısız: " + error.message); return; }
    toast.success("Lead eklendi");
    setLead({ company: "", contact_name: "", contact_email: "", value: "", stage: "prospect" });
    onClose();
  };

  return (
    <>
      {/* RFQ Modal */}
      <Dialog open={activeModal === "rfq"} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="dark:bg-[#1E293B] bg-white dark:border-[#334155] border-slate-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-[#0AA2CD]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#0AA2CD]" />
              </div>
              Hızlı Teklif Talebi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className={labelCls}>Müşteri *</label><input className={inputCls} value={rfq.customer} onChange={(e) => setRfq({ ...rfq, customer: e.target.value })} placeholder="Firma / kişi adı" /></div>
            <div><label className={labelCls}>Hizmet</label><input className={inputCls} value={rfq.service} onChange={(e) => setRfq({ ...rfq, service: e.target.value })} placeholder="CNC Frezeleme, Tornalama..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Malzeme</label><input className={inputCls} value={rfq.material} onChange={(e) => setRfq({ ...rfq, material: e.target.value })} placeholder="Al 6061, Çelik..." /></div>
              <div><label className={labelCls}>Adet</label><input className={inputCls} type="number" value={rfq.quantity} onChange={(e) => setRfq({ ...rfq, quantity: e.target.value })} placeholder="100" /></div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className={labelCls}>CAD Dosyaları</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all group ${
                  dragging
                    ? "border-[#0AA2CD] dark:bg-[#0AA2CD]/10 bg-[#0AA2CD]/10 scale-[1.02]"
                    : "dark:border-[#334155] border-slate-200 dark:hover:border-[#0AA2CD]/40 hover:border-[#0AA2CD]/40 dark:hover:bg-[#0AA2CD]/5 hover:bg-[#0AA2CD]/5"
                }`}
              >
                <Upload className={`w-6 h-6 mx-auto mb-2 transition-colors ${dragging ? "text-[#0AA2CD] animate-bounce" : "dark:text-slate-500 text-slate-400 group-hover:text-[#0AA2CD]"}`} />
                <p className="text-xs dark:text-slate-400 text-slate-500">
                  {dragging ? (
                    <span className="font-bold text-[#0AA2CD]">Dosyaları bırakın...</span>
                  ) : (
                    <><span className="font-bold text-[#0AA2CD]">Dosya seçin</span> veya sürükleyip bırakın</>
                  )}
                </p>
                <p className="text-[10px] dark:text-slate-600 text-slate-400 mt-1">
                  STEP, IGES, STL, DXF, DWG, PDF, ZIP — maks 50 MB, en fazla 5 dosya
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File list */}
              {rfqFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {rfqFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg dark:bg-[#0F172A]/60 bg-slate-50 border dark:border-[#334155]/50 border-slate-100">
                      <File className="w-4 h-4 dark:text-slate-400 text-slate-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-slate-300 text-slate-700 truncate">{f.file.name}</p>
                        <p className="text-[10px] dark:text-slate-500 text-slate-400">{formatFileSize(f.file.size)}</p>
                      </div>
                      {f.uploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0AA2CD] shrink-0" />
                      ) : f.error ? (
                        <span className="text-[9px] text-red-400 font-bold shrink-0">Hata</span>
                      ) : f.url ? (
                        <span className="text-[9px] text-emerald-400 font-bold shrink-0">✓</span>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-0.5 rounded dark:hover:bg-white/5 hover:bg-slate-100">
                          <X className="w-3.5 h-3.5 dark:text-slate-500 text-slate-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div><label className={labelCls}>Notlar</label><textarea className={`${inputCls} resize-none h-16`} value={rfq.notes} onChange={(e) => setRfq({ ...rfq, notes: e.target.value })} placeholder="Ek bilgi..." /></div>
          </div>
          <DialogFooter className="mt-4">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]">İptal</button>
            <button onClick={handleSaveRfq} disabled={saving} className="px-5 py-2 rounded-lg bg-[#0AA2CD] text-white text-xs font-bold hover:bg-[#0AA2CD]/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {rfqFiles.length > 0 ? `Kaydet (${rfqFiles.length} dosya)` : "Kaydet"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Modal */}
      <Dialog open={activeModal === "order"} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="dark:bg-[#1E293B] bg-white dark:border-[#334155] border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-[#F97316]" />
              </div>
              Hızlı Sipariş Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Sipariş No *</label><input className={inputCls} value={order.id} onChange={(e) => setOrder({ ...order, id: e.target.value })} placeholder="SP-001" /></div>
              <div><label className={labelCls}>Parça Adı *</label><input className={inputCls} value={order.part_name} onChange={(e) => setOrder({ ...order, part_name: e.target.value })} placeholder="Braket X" /></div>
            </div>
            <div><label className={labelCls}>Müşteri</label><input className={inputCls} value={order.customer} onChange={(e) => setOrder({ ...order, customer: e.target.value })} placeholder="Firma adı" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Adet</label><input className={inputCls} type="number" value={order.quantity} onChange={(e) => setOrder({ ...order, quantity: e.target.value })} placeholder="50" /></div>
              <div><label className={labelCls}>Makine</label><input className={inputCls} value={order.machine} onChange={(e) => setOrder({ ...order, machine: e.target.value })} placeholder="CNC-01" /></div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]">İptal</button>
            <button onClick={handleSaveOrder} disabled={saving} className="px-5 py-2 rounded-lg bg-[#F97316] text-white text-xs font-bold hover:bg-[#F97316]/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Ticket Modal */}
      <Dialog open={activeModal === "support"} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="dark:bg-[#1E293B] bg-white dark:border-[#334155] border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-purple-500" />
              </div>
              Destek Talebi Oluştur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className={labelCls}>Konu *</label><input className={inputCls} value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} placeholder="Talep konusu" /></div>
            <div>
              <label className={labelCls}>Öncelik</label>
              <select className={inputCls} value={ticket.priority} onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}>
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
            <div><label className={labelCls}>Mesaj *</label><textarea className={`${inputCls} resize-none h-24`} value={ticket.message} onChange={(e) => setTicket({ ...ticket, message: e.target.value })} placeholder="Detaylı açıklama..." /></div>
          </div>
          <DialogFooter className="mt-4">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]">İptal</button>
            <button onClick={handleSaveTicket} disabled={saving} className="px-5 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-600/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Gönder
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pipeline Lead Modal */}
      <Dialog open={activeModal === "pipeline"} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="dark:bg-[#1E293B] bg-white dark:border-[#334155] border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              Pipeline Lead Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className={labelCls}>Firma *</label><input className={inputCls} value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} placeholder="Firma adı" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Yetkili</label><input className={inputCls} value={lead.contact_name} onChange={(e) => setLead({ ...lead, contact_name: e.target.value })} placeholder="İsim" /></div>
              <div><label className={labelCls}>E-posta</label><input className={inputCls} value={lead.contact_email} onChange={(e) => setLead({ ...lead, contact_email: e.target.value })} placeholder="email@..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Değer (₺)</label><input className={inputCls} type="number" value={lead.value} onChange={(e) => setLead({ ...lead, value: e.target.value })} placeholder="50000" /></div>
              <div>
                <label className={labelCls}>Aşama</label>
                <select className={inputCls} value={lead.stage} onChange={(e) => setLead({ ...lead, stage: e.target.value })}>
                  <option value="prospect">Prospect</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]">İptal</button>
            <button onClick={handleSaveLead} disabled={saving} className="px-5 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-500/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export type { ModalType };
