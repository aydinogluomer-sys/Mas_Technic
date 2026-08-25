import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, CreditCard, AlertCircle, Landmark, FileCheck, Copy, CheckCircle2, Download, Wallet, Receipt, Zap } from "lucide-react";
import { SummarySkeleton, TableSkeleton } from "./MusteriSkeletons";
import { toast } from "sonner";

interface FinDoc {
  id: string;
  doc_number: string | null;
  title: string | null;
  doc_type: string;
  total_amount: number | null;
  currency: string | null;
  payment_status: string | null;
  due_date: string | null;
  doc_date: string | null;
  file_urls: string[] | null;
}

interface SummaryData {
  totalCount: number;
  totalPaid: number;
  totalUnpaid: number;
}

const PAGE_SIZE = 20;

const statusColor = (s: string | null) => {
  switch (s) {
    case "ödendi": return "bg-green-500/10 text-green-600 border-green-200";
    case "kısmi": return "bg-amber-500/10 text-amber-600 border-amber-200";
    default: return "bg-red-500/10 text-red-600 border-red-200";
  }
};
const statusLabel = (s: string | null) => {
  switch (s) {
    case "ödendi": return "Ödendi";
    case "kısmi": return "Kısmi";
    default: return "Ödenmedi";
  }
};

const BANK_ACCOUNTS = [
  { bank: "Ziraat Bankası", iban: "TR00 0000 0000 0000 0000 0000 01", branch: "Ankara Şubesi" },
  { bank: "İş Bankası", iban: "TR00 0000 0000 0000 0000 0000 02", branch: "OSB Şubesi" },
];

const IyzicoLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="32" rx="4" fill="#1A1A2E" />
    <text x="12" y="22" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="bold" fill="#4285F4">iyzico</text>
    <circle cx="100" cy="16" r="6" fill="#4285F4" opacity="0.7" />
    <circle cx="106" cy="16" r="6" fill="#34A853" opacity="0.7" />
  </svg>
);

const StripeLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="32" rx="4" fill="#635BFF" />
    <text x="12" y="22" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="bold" fill="#FFFFFF">stripe</text>
  </svg>
);

export const OdemeFaturaTab = () => {
  const [docs, setDocs] = useState<FinDoc[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ totalCount: 0, totalPaid: 0, totalUnpaid: 0 });
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<FinDoc | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"iyzico" | "stripe" | "havale" | "cek" | null>(null);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showHavaleDialog, setShowHavaleDialog] = useState(false);
  const [showCekDialog, setShowCekDialog] = useState(false);
  const [showIyzicoDialog, setShowIyzicoDialog] = useState(false);
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Çek form state
  const [cekNo, setCekNo] = useState("");
  const [cekBank, setCekBank] = useState("");
  const [cekVade, setCekVade] = useState("");
  const [cekTutar, setCekTutar] = useState("");
  const [cekSubmitting, setCekSubmitting] = useState(false);

  const fetchSummary = useCallback(async () => {
    const { data } = await supabase
      .from("financial_documents")
      .select("total_amount, payment_status");
    const all = (data as { total_amount: number | null; payment_status: string | null }[]) || [];
    const paid = all.filter(d => d.payment_status === "ödendi");
    const unpaid = all.filter(d => d.payment_status !== "ödendi");
    setSummary({
      totalCount: all.length,
      totalPaid: paid.reduce((a, d) => a + (d.total_amount || 0), 0),
      totalUnpaid: unpaid.reduce((a, d) => a + (d.total_amount || 0), 0),
    });
  }, []);

  const fetchDocs = useCallback(async (pageNum: number, append: boolean) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("financial_documents")
      .select("id, doc_number, title, doc_type, total_amount, currency, payment_status, due_date, doc_date, file_urls")
      .order("created_at", { ascending: false })
      .range(from, to);
    const newItems = (data as FinDoc[]) || [];
    setHasMore(newItems.length === PAGE_SIZE);
    if (append) setDocs(prev => [...prev, ...newItems]);
    else setDocs(newItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.all([fetchSummary(), fetchDocs(0, false)]);
    const channel = supabase
      .channel("customer-odeme-fatura")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "financial_documents" }, (payload) => {
        setDocs(prev => [payload.new as FinDoc, ...prev]);
        fetchSummary();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "financial_documents" }, (payload) => {
        const updated = payload.new as FinDoc;
        setDocs(prev => prev.map(d => d.id === updated.id ? updated : d));
        fetchSummary();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "financial_documents" }, (payload) => {
        const deleted = payload.old as { id: string };
        setDocs(prev => prev.filter(d => d.id !== deleted.id));
        fetchSummary();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSummary, fetchDocs]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchDocs(nextPage, true);
    setLoadingMore(false);
  };

  const handlePayClick = (p: FinDoc) => {
    setSelectedPayment(p);
    setPaymentMethod(null);
    setShowMethodDialog(true);
  };

  const handleMethodSelect = () => {
    setShowMethodDialog(false);
    if (paymentMethod === "iyzico") {
      setShowIyzicoDialog(true);
    } else if (paymentMethod === "stripe") {
      setShowStripeDialog(true);
    } else if (paymentMethod === "havale") {
      setShowHavaleDialog(true);
    } else if (paymentMethod === "cek") {
      openCekDialog();
    }
  };

  const openCekDialog = () => {
    setCekNo("");
    setCekBank("");
    setCekVade("");
    setCekTutar(selectedPayment?.total_amount?.toString() || "");
    setShowCekDialog(true);
  };

  const handleCekSubmit = async () => {
    if (!cekNo.trim() || !cekBank.trim() || !cekVade) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setCekSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCekSubmitting(false); toast.error("Oturum bulunamadı."); return; }

    const message = `Çek Bildirimi\nÇek No: ${cekNo}\nBanka: ${cekBank}\nVade: ${cekVade}\nTutar: ₺${cekTutar}\nFatura: ${selectedPayment?.doc_number || "Genel"}`;

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: `Çek Bildirimi — ${selectedPayment?.doc_number || "Genel"}`,
      message,
      priority: "normal",
    });

    setCekSubmitting(false);
    if (error) {
      toast.error("Çek bildirimi gönderilemedi.");
    } else {
      setShowCekDialog(false);
      toast.success("Çek bilgileriniz iletildi. Ekibimiz sizinle iletişime geçecektir.");
    }
  };

  const handleDownload = async (doc: FinDoc) => {
    if (!doc.file_urls || doc.file_urls.length === 0) return;
    const path = doc.file_urls[0];
    if (path.startsWith("http")) { window.open(path, "_blank"); return; }
    setDownloadingId(doc.id);
    const { data, error } = await supabase.storage.from("finance-docs").createSignedUrl(path, 120);
    setDownloadingId(null);
    if (error || !data?.signedUrl) { toast.error("Dosya indirme bağlantısı oluşturulamadı."); return; }
    window.open(data.signedUrl, "_blank");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(id);
    toast.success("IBAN kopyalandı");
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return (
    <div className="space-y-6">
      <SummarySkeleton />
      <TableSkeleton rows={4} cols={6} />
    </div>
  );

  const unpaid = docs.filter(p => p.payment_status !== "ödendi");
  const paid = docs.filter(p => p.payment_status === "ödendi");

  const isOverdue = (due: string | null) => {
    if (!due) return false;
    return new Date(due) < new Date();
  };

  const paymentInfoText = selectedPayment
    ? `${selectedPayment.doc_number || selectedPayment.id.slice(0, 8)} — ₺${(selectedPayment.total_amount || 0).toLocaleString("tr-TR")}`
    : "Genel ödeme bilgisi";

  return (
    <div className="space-y-6">
      {/* Summary — from separate unpaginated query */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Toplam Fatura</p>
          <p className="text-xl font-bold font-mono mt-1">{summary.totalCount} adet</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Ödenen Toplam</p>
          <p className="text-xl font-bold font-mono mt-1 text-green-600">₺{summary.totalPaid.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Bekleyen Borç</p>
          <p className="text-xl font-bold font-mono mt-1 text-red-600">₺{summary.totalUnpaid.toLocaleString("tr-TR")}</p>
        </div>
      </div>

      {/* Overdue warning */}
      {unpaid.some(p => isOverdue(p.due_date)) && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive p-3 text-sm">
          <AlertCircle size={16} />
          <span>Vadesi geçmiş ödemeniz bulunmaktadır.</span>
        </div>
      )}

      {/* Payment Methods */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Ödeme Yöntemleri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => { setSelectedPayment(null); setShowIyzicoDialog(true); }}
            className="flex items-center gap-3 border border-border bg-background p-4 hover:border-primary/40 transition-colors text-left"
          >
            <CreditCard size={20} className="text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Kredi / Banka Kartı</p>
              <p className="text-xs text-muted-foreground">İyzico ile güvenli ödeme</p>
            </div>
            <IyzicoLogo className="h-6 w-auto shrink-0" />
          </button>
          <button
            onClick={() => { setSelectedPayment(null); setShowStripeDialog(true); }}
            className="flex items-center gap-3 border border-border bg-background p-4 hover:border-primary/40 transition-colors text-left"
          >
            <Zap size={20} className="text-[#635BFF] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Stripe</p>
              <p className="text-xs text-muted-foreground">Uluslararası kart ödemesi</p>
            </div>
            <StripeLogo className="h-6 w-auto shrink-0" />
          </button>
          <button
            onClick={() => { setSelectedPayment(null); setShowHavaleDialog(true); }}
            className="flex items-center gap-3 border border-border bg-background p-4 hover:border-primary/40 transition-colors text-left"
          >
            <Landmark size={20} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Havale / EFT</p>
              <p className="text-xs text-muted-foreground">Banka hesap bilgileri</p>
            </div>
          </button>
          <button
            onClick={() => { setSelectedPayment(null); openCekDialog(); }}
            className="flex items-center gap-3 border border-border bg-background p-4 hover:border-primary/40 transition-colors text-left"
          >
            <FileCheck size={20} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Çek</p>
              <p className="text-xs text-muted-foreground">Çek bilgisi bildirin</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs: Faturalar */}
      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-border bg-background">
          <Receipt size={32} className="mb-2 opacity-30" />
          <p className="text-sm font-medium">Henüz fatura kaydı bulunmuyor.</p>
          <p className="text-xs mt-1">Fatura oluşturulduğunda burada görünecektir.</p>
        </div>
      ) : (
        <Tabs defaultValue="tum" className="w-full">
          <TabsList className="w-full justify-start bg-muted/30 p-0.5 h-auto">
            <TabsTrigger value="tum" className="text-xs py-2 px-4">Tümü ({docs.length})</TabsTrigger>
            <TabsTrigger value="odenmemis" className="text-xs py-2 px-4">Ödenmemiş ({unpaid.length})</TabsTrigger>
            <TabsTrigger value="odenmis" className="text-xs py-2 px-4">Ödendi ({paid.length})</TabsTrigger>
          </TabsList>

          {(["tum", "odenmemis", "odenmis"] as const).map((tabKey) => {
            const filteredDocs = tabKey === "tum" ? docs : tabKey === "odenmemis" ? unpaid : paid;
            return (
              <TabsContent key={tabKey} value={tabKey}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-4">Belge No</th>
                        <th className="pb-3 pr-4">Başlık</th>
                        <th className="pb-3 pr-4">Tarih</th>
                        <th className="pb-3 pr-4">Vade</th>
                        <th className="pb-3 pr-4 text-right">Tutar</th>
                        <th className="pb-3 pr-4">Durum</th>
                        <th className="pb-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map(d => (
                        <tr key={d.id} className={`border-b border-border/50 last:border-0 ${d.payment_status !== "ödendi" && isOverdue(d.due_date) ? "bg-destructive/5" : ""}`}>
                          <td className="py-3 pr-4 font-mono text-xs">{d.doc_number || d.id.slice(0, 8)}</td>
                          <td className="py-3 pr-4">{d.title || d.doc_type || "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{d.doc_date || "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {d.due_date || "—"}
                            {d.payment_status !== "ödendi" && isOverdue(d.due_date) && (
                              <span className="ml-1 text-destructive text-[10px] font-semibold">GECİKMİŞ</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono font-semibold">
                            ₺{(d.total_amount || 0).toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline" className={statusColor(d.payment_status)}>
                              {statusLabel(d.payment_status)}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              {d.payment_status !== "ödendi" && (
                                <Button size="sm" variant="outline" onClick={() => handlePayClick(d)} className="text-xs">
                                  Öde
                                </Button>
                              )}
                              {d.file_urls && d.file_urls.length > 0 && (
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={downloadingId === d.id} onClick={() => handleDownload(d)}>
                                  {downloadingId === d.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {hasMore && docs.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Daha Fazla Yükle"}
          </Button>
        </div>
      )}

      {/* Method Selection Dialog */}
      <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Yöntemi Seçin</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <RadioGroup value={paymentMethod || ""} onValueChange={(v) => setPaymentMethod(v as "iyzico" | "stripe" | "havale" | "cek")} className="space-y-3 mt-2">
            <label className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors">
              <RadioGroupItem value="iyzico" id="iyzico" />
              <CreditCard size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Kredi / Banka Kartı</p>
                <p className="text-xs text-muted-foreground">İyzico ile güvenli ödeme</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors">
              <RadioGroupItem value="stripe" id="stripe" />
              <Zap size={18} className="text-[#635BFF] shrink-0" />
              <div>
                <p className="text-sm font-medium">Stripe</p>
                <p className="text-xs text-muted-foreground">Uluslararası kart ödemesi</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors">
              <RadioGroupItem value="havale" id="havale" />
              <Landmark size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Havale / EFT</p>
                <p className="text-xs text-muted-foreground">Banka hesap bilgilerini görüntüle</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors">
              <RadioGroupItem value="cek" id="cek" />
              <FileCheck size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Çek</p>
                <p className="text-xs text-muted-foreground">Çek bilgilerinizi bildirin</p>
              </div>
            </label>
          </RadioGroup>
          <Button className="w-full mt-4" disabled={!paymentMethod} onClick={handleMethodSelect}>
            Devam Et
          </Button>
        </DialogContent>
      </Dialog>

      {/* İyzico Dialog */}
      <Dialog open={showIyzicoDialog} onOpenChange={setShowIyzicoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>İyzico ile Ödeme</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-center">
              <IyzicoLogo className="h-10 w-auto" />
            </div>
            <div className="bg-muted/50 border border-border p-4 text-center space-y-2">
              <CreditCard size={28} className="mx-auto text-primary/60" />
              <p className="text-sm font-medium">İyzico Entegrasyonu</p>
              <p className="text-xs text-muted-foreground">
                İyzico altyapısı ile güvenli kart ödemesi yakında aktif olacaktır.
                Şimdilik havale/EFT veya çek ile ödeme yapabilirsiniz.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowIyzicoDialog(false)}>
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Dialog */}
      <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stripe ile Ödeme</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-center">
              <StripeLogo className="h-10 w-auto" />
            </div>
            <div className="bg-muted/50 border border-border p-4 text-center space-y-2">
              <Zap size={28} className="mx-auto text-[#635BFF]" />
              <p className="text-sm font-medium">Stripe Entegrasyonu</p>
              <p className="text-xs text-muted-foreground">
                Stripe altyapısı ile uluslararası kart ödemesi yakında aktif olacaktır.
                Şimdilik havale/EFT veya çek ile ödeme yapabilirsiniz.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowStripeDialog(false)}>
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHavaleDialog} onOpenChange={setShowHavaleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Havale / EFT Bilgileri</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {BANK_ACCOUNTS.map((acc) => (
              <div key={acc.iban} className="border border-border p-3 space-y-1.5">
                <p className="text-sm font-semibold">{acc.bank}</p>
                <p className="text-[10px] text-muted-foreground">{acc.branch}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted p-2 rounded">{acc.iban}</code>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(acc.iban, acc.iban)}>
                    {copied === acc.iban ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground text-center">
              Havale/EFT sonrası dekont bilgisini destek üzerinden iletiniz. Manuel onay gereklidir.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Çek Dialog */}
      <Dialog open={showCekDialog} onOpenChange={setShowCekDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Çek Bildirimi</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Çek Seri No</label>
              <Input value={cekNo} onChange={(e) => setCekNo(e.target.value)} placeholder="Çek seri numarası" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Banka</label>
              <Input value={cekBank} onChange={(e) => setCekBank(e.target.value)} placeholder="Çekin bankası" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Vade Tarihi</label>
              <Input type="date" value={cekVade} onChange={(e) => setCekVade(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tutar (₺)</label>
              <Input type="number" value={cekTutar} onChange={(e) => setCekTutar(e.target.value)} className="mt-1" />
            </div>
            <Button className="w-full" disabled={cekSubmitting} onClick={handleCekSubmit}>
              {cekSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Çek Bilgisi Gönder"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Çek bildirimi sonrası manuel onay gereklidir.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
