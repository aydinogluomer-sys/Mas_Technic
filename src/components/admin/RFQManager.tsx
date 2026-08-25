import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { FileText, X, Send, Loader2, Trash2, Download, Paperclip, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RFQCadPreview = lazy(() => import("./RFQCadPreview").then((m) => ({ default: m.RFQCadPreview })));

interface RFQ {
  id: string;
  customer: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  material: string | null;
  quantity: number | null;
  date: string | null;
  status: string | null;
  notes: string | null;
  files: string[] | null;
  created_at: string;
  user_id: string | null;
  quoted_price: number | null;
}

const statusColors: Record<string, string> = {
  Yeni: "bg-blue-500/20 text-blue-400",
  "Fiyat Verildi": "bg-amber-500/20 text-amber-400",
  Onaylandı: "bg-emerald-500/20 text-emerald-400",
  Reddedildi: "bg-red-500/20 text-red-400",
  pending: "bg-blue-500/20 text-blue-400",
};

export const RFQManager = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tümü");
  const [sortKey, setSortKey] = useState<"date" | "customer" | "status" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [priceModal, setPriceModal] = useState<RFQ | null>(null);
  const [priceForm, setPriceForm] = useState({ price: "", days: "7", notes: "" });
  const [rejectModal, setRejectModal] = useState<RFQ | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRFQs = useCallback(async () => {
    const { data } = await supabase.from("rfqs").select("*").order("created_at", { ascending: false });
    if (data) setRfqs(data as RFQ[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRFQs();
    const channel = supabase
      .channel("rfqs-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rfqs" }, () => fetchRFQs())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRFQs]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("rfqs").update({ status }).eq("id", id);
    if (error) {
      toast.error("Güncelleme hatası");
      return;
    }
    toast.success(`Durum "${status}" olarak güncellendi`);
    fetchRFQs();
    setSelectedRFQ(null);
  };

  const handleApprove = async (rfq: RFQ) => {
    const { error } = await supabase.from("rfqs").update({ status: "Onaylandı" }).eq("id", rfq.id);
    if (error) {
      toast.error("Onaylama hatası");
      return;
    }

    // Create invoice in financial_documents if there's a quoted price
    if (rfq.quoted_price && rfq.user_id) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      await supabase.from("financial_documents").insert({
        user_id: rfq.user_id,
        doc_type: "fatura",
        title: `${rfq.service || "CNC"} - ${rfq.material || ""} (${rfq.quantity || 1} adet)`,
        total_amount: rfq.quoted_price,
        amount: rfq.quoted_price,
        payment_status: "ödenmedi",
        status: "onaylandı",
        doc_date: new Date().toISOString().split("T")[0],
        due_date: validUntil.toISOString().split("T")[0],
        doc_number: `FTR-${rfq.id
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(-8)
          .toUpperCase()}`,
        notes: `RFQ ${rfq.id} onayı ile oluşturuldu`,
      });
    }

    // Create order in orders table
    const rfqSuffix = rfq.id.replace(/[^a-zA-Z0-9]/g, "").slice(-8);
    const orderId = `ORD-${rfqSuffix}`;
    const partName = `${rfq.service || ""} ${rfq.material || ""}`.trim() || "Belirtilmemiş";

    const { error: orderErr } = await supabase.from("orders").insert({
      id: orderId,
      rfq_ref: rfq.id,
      customer: rfq.customer,
      part_name: partName,
      quantity: rfq.quantity || 1,
      user_id: rfq.user_id,
      status: "Üretimde",
      progress: 0,
      order_date: new Date().toISOString().split("T")[0],
    });

    if (orderErr && orderErr.code === "23505") {
      toast.info("Bu teklif zaten onaylanmış, sipariş mevcut.");
      fetchRFQs();
      setSelectedRFQ(null);
      return;
    }

    // Create WBS entry for production tracking
    const wbsId = `WBS-${rfqSuffix}`;
    await supabase.from("wbs").insert({
      id: wbsId,
      customer: rfq.customer,
      part_name: partName,
      total_qty: rfq.quantity || 1,
      current_step: 0,
      status: "active",
      order_id: orderId,
      user_id: rfq.user_id,
    } as any);

    // Notify customer
    if (rfq.user_id) {
      await supabase.from("notifications").insert({
        user_id: rfq.user_id,
        type: "rfq",
        title: "Teklifiniz Onaylandı ✅",
        message: `${rfq.id} numaralı teklifiniz onaylanarak siparişe dönüştürüldü.`,
      });
    }

    toast.success("Teklif onaylandı, sipariş ve iş akışı oluşturuldu!");
    fetchRFQs();
    setSelectedRFQ(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const { error } = await supabase
      .from("rfqs")
      .update({
        status: "Reddedildi",
        rejection_reason: rejectReason || null,
      })
      .eq("id", rejectModal.id);
    if (error) {
      toast.error("Red işlemi hatası");
      return;
    }

    if (rejectModal.user_id) {
      await supabase.from("notifications").insert({
        user_id: rejectModal.user_id,
        type: "rfq",
        title: "Teklif Reddedildi",
        message: `${rejectModal.id} numaralı teklifiniz reddedildi.${rejectReason ? ` Sebep: ${rejectReason}` : ""}`,
      });
    }

    toast.success("Teklif reddedildi");
    setRejectModal(null);
    setRejectReason("");
    fetchRFQs();
    setSelectedRFQ(null);
  };

  const sendQuote = async () => {
    if (!priceModal || !priceForm.price) return;
    const price = parseFloat(priceForm.price);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(priceForm.days || "7"));

    const { error } = await supabase
      .from("rfqs")
      .update({
        status: "Fiyat Verildi",
        quoted_price: price,
        price_valid_until: validUntil.toISOString().split("T")[0],
      })
      .eq("id", priceModal.id);

    if (error) {
      toast.error("Fiyat gönderilemedi");
      return;
    }

    if (priceModal.user_id) {
      await supabase.from("notifications").insert({
        user_id: priceModal.user_id,
        type: "rfq",
        title: "Teklif Fiyatı Belirlendi 💰",
        message: `${priceModal.id} numaralı teklifinize ₺${price.toLocaleString("tr-TR")} fiyat verildi.`,
      });
    }

    toast.success("Teklif fiyatı gönderildi!");
    setPriceModal(null);
    setPriceForm({ price: "", days: "7", notes: "" });
    fetchRFQs();
  };

  const deleteRFQ = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bu teklif talebini silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("rfqs").delete().eq("id", id);
    if (error) {
      toast.error("Silme hatası");
      return;
    }
    toast.success("Teklif talebi silindi");
    fetchRFQs();
  };

  const isNewStatus = (s: string | null) => !s || s === "Yeni" || s === "pending";

  const filters = ["Tümü", "Yeni", "Fiyat Verildi", "Onaylandı", "Reddedildi"];

  const extractCadFileFromNotes = (notes: string | null) => {
    const m = notes?.match(/CAD dosyası yüklendi:\s*(.+)$/i);
    return m?.[1]?.trim() || null;
  };

  const getRfqFiles = (rfq: RFQ) => {
    if (rfq.files && rfq.files.length > 0) return rfq.files;
    const noteFile = extractCadFileFromNotes(rfq.notes);
    return noteFile ? [noteFile] : [];
  };

  const downloadCadFile = async (rfq: RFQ, fileRef: string) => {
    const rawPath = fileRef
      .replace(/^\/+/, "")
      .replace(/^cad-uploads\//, "")
      .split("?")[0];

    const baseName = rawPath.split("/").pop() || rawPath;
    const cleanBaseName = baseName.replace(/^\d+_/, "");

    const trySignedDownload = async (path: string) => {
      const { data } = await supabase.storage.from("cad-uploads").createSignedUrl(path, 3600, { download: true });
      return data?.signedUrl || null;
    };

    // 1) direct path
    let signedUrl = await trySignedDownload(rawPath);

    // 2) likely RFQ folder paths
    if (!signedUrl) {
      const candidateDirs = [rfq.user_id ? `${rfq.user_id}/${rfq.id}` : null, `anonymous/${rfq.id}`].filter(
        Boolean,
      ) as string[];

      for (const dir of candidateDirs) {
        const { data: dirFiles } = await supabase.storage.from("cad-uploads").list(dir, { limit: 200 });
        const match = dirFiles?.find((f) => f.name === baseName || f.name.includes(cleanBaseName));
        if (match) {
          signedUrl = await trySignedDownload(`${dir}/${match.name}`);
          if (signedUrl) break;
        }
      }
    }

    // 3) root fallback
    if (!signedUrl) {
      const { data: rootFiles } = await supabase.storage.from("cad-uploads").list("", { limit: 200 });
      const rootMatch = rootFiles?.find((f) => f.name === baseName || f.name.includes(cleanBaseName));
      if (rootMatch) signedUrl = await trySignedDownload(rootMatch.name);
    }

    if (!signedUrl) {
      toast.error("CAD dosyası storage'da bulunamadı.");
      return;
    }

    const a = document.createElement("a");
    a.href = signedUrl;
    a.download = baseName;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const statusFiltered =
    filter === "Tümü"
      ? rfqs
      : filter === "Yeni"
        ? rfqs.filter((r) => isNewStatus(r.status))
        : rfqs.filter((r) => r.status === filter);

  const toggleSort = (key: "date" | "customer" | "status") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 text-[#0AA2CD]" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-[#0AA2CD]" />
    );
  };

  const filtered = useMemo(() => {
    const list = [...statusFiltered];
    if (!sortKey) return list;
    return list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = (a.date || "").localeCompare(b.date || "");
      } else if (sortKey === "customer") {
        cmp = (a.customer || "").localeCompare(b.customer || "", "tr");
      } else if (sortKey === "status") {
        cmp = (a.status || "").localeCompare(b.status || "", "tr");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [statusFiltered, sortKey, sortDir]);

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === f
                ? "bg-[#0AA2CD] text-white"
                : "dark:bg-[#1E293B] bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-[#0AA2CD]"
            }`}
          >
            {f}{" "}
            {f !== "Tümü" &&
              `(${
                f === "Yeni"
                  ? rfqs.filter((r) => isNewStatus(r.status)).length
                  : rfqs.filter((r) => r.status === f).length
              })`}
          </button>
        ))}
      </div>

      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border overflow-hidden">
        {loading ? (
          <IndustrialSkeleton variant="table" rows={6} columns={5} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FileText className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Henüz teklif talebi yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 dark:bg-[#1E293B] bg-white z-10">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                  <th className="text-left p-4">ID</th>
                  <th
                    className="text-left p-4 cursor-pointer select-none hover:text-[#0AA2CD] transition-colors"
                    onClick={() => toggleSort("customer")}
                  >
                    <span className="inline-flex items-center">
                      Müşteri <SortIcon col="customer" />
                    </span>
                  </th>
                  <th className="text-left p-4 hidden lg:table-cell">Firma</th>
                  <th className="text-left p-4 hidden md:table-cell">Hizmet</th>
                  <th className="text-left p-4 hidden lg:table-cell">Malzeme</th>
                  <th className="text-right p-4 font-mono">Adet</th>
                  <th className="text-right p-4 font-mono hidden md:table-cell">Fiyat</th>
                  <th
                    className="text-left p-4 hidden md:table-cell cursor-pointer select-none hover:text-[#0AA2CD] transition-colors"
                    onClick={() => toggleSort("date")}
                  >
                    <span className="inline-flex items-center">
                      Tarih <SortIcon col="date" />
                    </span>
                  </th>
                  <th className="text-left p-4 hidden md:table-cell">Dosya</th>
                  <th
                    className="text-left p-4 cursor-pointer select-none hover:text-[#0AA2CD] transition-colors"
                    onClick={() => toggleSort("status")}
                  >
                    <span className="inline-flex items-center">
                      Durum <SortIcon col="status" />
                    </span>
                  </th>
                  <th className="text-left p-4">İşlem</th>
                  <th className="text-left p-4">Sil</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRFQ(r)}
                    className="dark:border-[#334155]/50 border-slate-100 border-b dark:hover:bg-white/5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-bold text-[#0AA2CD]">{r.id}</td>
                    <td className="p-4 dark:text-white text-slate-800">{r.customer || "-"}</td>
                    <td className="p-4 dark:text-slate-400 text-slate-500 hidden lg:table-cell">{r.company || "-"}</td>
                    <td className="p-4 dark:text-slate-300 text-slate-600 hidden md:table-cell">{r.service || "-"}</td>
                    <td className="p-4 dark:text-slate-300 text-slate-600 hidden lg:table-cell">{r.material || "-"}</td>
                    <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums">
                      {r.quantity || "-"}
                    </td>
                    <td className="p-4 dark:text-white text-slate-800 font-bold text-right font-mono tabular-nums hidden md:table-cell">
                      {r.quoted_price ? `₺${r.quoted_price.toLocaleString("tr-TR")}` : "-"}
                    </td>
                    <td className="p-4 dark:text-slate-400 text-slate-500 hidden md:table-cell">{r.date || "-"}</td>
                    <td className="p-4 hidden md:table-cell">
                      {getRfqFiles(r).length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                          <Paperclip className="w-3 h-3" /> {getRfqFiles(r).length}
                        </span>
                      ) : (
                        <span className="dark:text-slate-500 text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusColors[r.status || ""] || statusColors.Yeni}`}
                      >
                        {r.status || "Yeni"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPriceModal(r);
                        }}
                        className="text-xs bg-[#0AA2CD]/10 text-[#0AA2CD] px-3 py-1 rounded font-bold hover:bg-[#0AA2CD]/20"
                      >
                        Fiyat Ver
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => deleteRFQ(e, r.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedRFQ && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedRFQ(null)}
        >
          <div
            className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sticky top-0 dark:bg-[#1E293B] bg-white z-10 pb-2">
              <h3 className="font-black dark:text-white text-slate-800">{selectedRFQ.id}</h3>
              <button
                onClick={() => setSelectedRFQ(null)}
                className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Müşteri", selectedRFQ.customer],
                ["Firma", selectedRFQ.company],
                ["E-posta", selectedRFQ.email],
                ["Telefon", selectedRFQ.phone],
                ["Hizmet", selectedRFQ.service],
                ["Malzeme", selectedRFQ.material],
                ["Adet", selectedRFQ.quantity],
                ["Fiyat", selectedRFQ.quoted_price ? `₺${selectedRFQ.quoted_price.toLocaleString("tr-TR")}` : null],
                ["Notlar", selectedRFQ.notes],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <span className="dark:text-slate-400 text-slate-500">{k}</span>
                  <span className="dark:text-white text-slate-800 font-medium">{v || "-"}</span>
                </div>
              ))}
            </div>

            {/* CAD Files with Preview */}
            <div className="mt-4 pt-3 border-t dark:border-[#334155] border-slate-200">
              <span className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">
                CAD Dosyaları
              </span>
              {getRfqFiles(selectedRFQ).length > 0 ? (
                <div className="mt-2 space-y-3">
                  <Suspense
                    fallback={
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    }
                  >
                    {getRfqFiles(selectedRFQ).map((filePath, idx) => (
                      <RFQCadPreview
                        key={idx}
                        filePath={filePath}
                        rfqId={selectedRFQ.id}
                        userId={selectedRFQ.user_id}
                        onDownload={async () => {
                          toast.loading("Dosya hazırlanıyor...", { id: "file-dl" });
                          await downloadCadFile(selectedRFQ, filePath);
                          toast.dismiss("file-dl");
                        }}
                      />
                    ))}
                  </Suspense>
                </div>
              ) : (
                <p className="mt-2 text-xs dark:text-slate-500 text-slate-400">Bu talep için CAD dosyası bulunamadı.</p>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleApprove(selectedRFQ)}
                className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30"
              >
                Onayla
              </button>
              <button
                onClick={() => {
                  setRejectModal(selectedRFQ);
                  setSelectedRFQ(null);
                }}
                className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30"
              >
                Reddet
              </button>
              <button
                onClick={() => {
                  setPriceModal(selectedRFQ);
                  setSelectedRFQ(null);
                }}
                className="flex-1 py-2 bg-[#0AA2CD]/20 text-[#0AA2CD] rounded-lg text-xs font-bold hover:bg-[#0AA2CD]/30"
              >
                Fiyat Ver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectModal}
        onOpenChange={(o) => {
          if (!o) {
            setRejectModal(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Teklif Reddi — {rejectModal?.id}</DialogTitle>
            <DialogDescription>Red sebebini müşteriye iletmek için aşağıya yazın.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red sebebi (opsiyonel)..."
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary min-h-[100px] text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
              >
                İptal
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleReject}>
                Reddet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Modal */}
      {priceModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPriceModal(null)}
        >
          <div
            className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black dark:text-white text-slate-800 mb-4">Teklif Oluştur — {priceModal.id}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Teklif Fiyatı (TRY)
                </label>
                <input
                  type="number"
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Geçerlilik Süresi (Gün)
                </label>
                <input
                  type="number"
                  value={priceForm.days}
                  onChange={(e) => setPriceForm({ ...priceForm, days: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notlar</label>
                <textarea
                  value={priceForm.notes}
                  onChange={(e) => setPriceForm({ ...priceForm, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] min-h-[60px]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setPriceModal(null)}
                className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold"
              >
                İptal
              </button>
              <button
                onClick={sendQuote}
                disabled={!priceForm.price}
                className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Teklifi Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
