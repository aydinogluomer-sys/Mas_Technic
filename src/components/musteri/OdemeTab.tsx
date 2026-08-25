import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, AlertCircle, Landmark, FileCheck, Copy, CheckCircle2, Info } from "lucide-react";
import { SummarySkeleton, TableSkeleton } from "./MusteriSkeletons";
import { toast } from "sonner";

interface Payment {
  id: string;
  doc_number: string | null;
  title: string | null;
  total_amount: number | null;
  currency: string | null;
  payment_status: string | null;
  due_date: string | null;
  doc_date: string | null;
}

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

export const OdemeTab = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "havale" | "cek" | null>(null);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showHavaleDialog, setShowHavaleDialog] = useState(false);
  const [showCekDialog, setShowCekDialog] = useState(false);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Çek form state
  const [cekNo, setCekNo] = useState("");
  const [cekBank, setCekBank] = useState("");
  const [cekVade, setCekVade] = useState("");
  const [cekTutar, setCekTutar] = useState("");
  const [cekSubmitting, setCekSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("financial_documents")
        .select("id, doc_number, title, total_amount, currency, payment_status, due_date, doc_date")
        .order("due_date", { ascending: true });
      setPayments((data as Payment[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const handlePayClick = (p: Payment) => {
    setSelectedPayment(p);
    setPaymentMethod(null);
    setShowMethodDialog(true);
  };

  const handleMethodSelect = () => {
    setShowMethodDialog(false);
    if (paymentMethod === "card") {
      setShowCardDialog(true);
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

  const unpaid = payments.filter(p => p.payment_status !== "ödendi");
  const paid = payments.filter(p => p.payment_status === "ödendi");
  const totalUnpaid = unpaid.reduce((a, p) => a + (p.total_amount || 0), 0);
  const totalPaid = paid.reduce((a, p) => a + (p.total_amount || 0), 0);

  const isOverdue = (due: string | null) => {
    if (!due) return false;
    return new Date(due) < new Date();
  };

  const paymentInfoText = selectedPayment
    ? `${selectedPayment.doc_number || selectedPayment.id.slice(0, 8)} — ₺${(selectedPayment.total_amount || 0).toLocaleString("tr-TR")}`
    : "Genel ödeme bilgisi";

  return (
    <div className="space-y-6">
      {/* Payment Method Buttons - Always visible */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Ödeme Yöntemleri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => { setSelectedPayment(null); setShowCardDialog(true); }}
            className="flex items-center gap-3 border border-border bg-background p-4 hover:border-primary/40 transition-colors text-left"
          >
            <CreditCard size={20} className="text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Kredi / Banka Kartı</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard, Stripe</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <svg viewBox="0 0 780 500" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="20" fill="#1A1F71"/>
                <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2zm224.5-191c-10.5-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.3 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-31.9 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.5 10.2 59.4 10.5 56.2 0 92.7-26.3 93.1-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.3-42.8zm139.4-4.8h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.5h56.2s9.2-24.2 11.3-29.5h68.6c1.6 6.9 6.5 29.5 6.5 29.5h49.7l-43.6-195.8zm-65.9 126.3c4.4-11.3 21.5-55 21.5-55-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 56.8h-44.7zM327.1 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65-73.7-82l47.9 171.5h56.6l84.2-195.8h-57.1z" fill="white"/>
                <path d="M221.5 152.9h-86.2l-.7 3.8c67.1 16.2 111.5 55.4 129.9 102.5l-18.7-90c-3.2-12.4-12.7-15.8-24.3-16.3z" fill="#F7B600"/>
              </svg>
              <svg viewBox="0 0 48 32" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#252525"/>
                <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                <path d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z" fill="#FF5F00"/>
              </svg>
              <svg viewBox="0 0 48 32" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#635BFF"/>
                <path d="M22.5 13.3c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5.2 1.4V9.2c-1.7-.7-3.5-1-5.2-1-4.3 0-7.1 2.2-7.1 6 0 5.8 8 4.9 8 7.4 0 1-.8 1.3-2 1.3-1.7 0-4-.7-5.7-1.7v4.5c1.9.8 3.9 1.2 5.7 1.2 4.4 0 7.4-2.2 7.4-6 0-6.3-8-5.2-8-7.6z" fill="white"/>
              </svg>
            </div>
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

      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-background border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Toplam Ödeme</p>
            <p className="text-xl font-bold font-mono mt-1">{payments.length} adet</p>
          </div>
          <div className="bg-background border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ödenen Toplam</p>
            <p className="text-xl font-bold font-mono mt-1 text-green-600">₺{totalPaid.toLocaleString("tr-TR")}</p>
          </div>
          <div className="bg-background border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Bekleyen Borç</p>
            <p className="text-xl font-bold font-mono mt-1 text-red-600">₺{totalUnpaid.toLocaleString("tr-TR")}</p>
          </div>
        </div>
      )}

      {/* Overdue warning */}
      {unpaid.some(p => isOverdue(p.due_date)) && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive p-3 text-sm">
          <AlertCircle size={16} />
          <span>Vadesi geçmiş ödemeniz bulunmaktadır.</span>
        </div>
      )}

      {/* Payment list or empty */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-border bg-background">
          <CreditCard size={32} className="mb-2 opacity-30" />
          <p className="text-sm font-medium">Henüz fatura kaydı bulunmuyor.</p>
          <p className="text-xs mt-1">Fatura oluşturulduğunda burada görünecektir.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-4">Belge No</th>
                <th className="pb-3 pr-4">Açıklama</th>
                <th className="pb-3 pr-4">Fatura Tarihi</th>
                <th className="pb-3 pr-4">Vade</th>
                <th className="pb-3 pr-4 text-right">Tutar</th>
                <th className="pb-3 pr-4">Durum</th>
                <th className="pb-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className={`border-b border-border/50 last:border-0 ${p.payment_status !== "ödendi" && isOverdue(p.due_date) ? "bg-destructive/5" : ""}`}>
                  <td className="py-3 pr-4 font-mono text-xs">{p.doc_number || p.id.slice(0, 8)}</td>
                  <td className="py-3 pr-4">{p.title || "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.doc_date || "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {p.due_date || "—"}
                    {p.payment_status !== "ödendi" && isOverdue(p.due_date) && (
                      <span className="ml-1 text-destructive text-[10px] font-semibold">GECİKMİŞ</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-semibold">
                    ₺{(p.total_amount || 0).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className={statusColor(p.payment_status)}>
                      {statusLabel(p.payment_status)}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {p.payment_status !== "ödendi" ? (
                      <Button size="sm" variant="outline" onClick={() => handlePayClick(p)} className="text-xs">
                        Öde
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Method Selection Dialog */}
      <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Yöntemi Seçin</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <RadioGroup value={paymentMethod || ""} onValueChange={(v) => setPaymentMethod(v as "card" | "havale" | "cek")} className="space-y-3 mt-2">
            <label className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors">
              <RadioGroupItem value="card" id="card" />
              <CreditCard size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Kredi / Banka Kartı</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard — Stripe ile güvenli ödeme</p>
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

      {/* Card Payment Dialog — "Yakında aktif" placeholder */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kart ile Ödeme</DialogTitle>
            <DialogDescription>{paymentInfoText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3 justify-center">
              <svg viewBox="0 0 780 500" className="h-8" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="20" fill="#1A1F71"/>
                <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2zm224.5-191c-10.5-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.3 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-31.9 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.5 10.2 59.4 10.5 56.2 0 92.7-26.3 93.1-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.3-42.8zm139.4-4.8h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.5h56.2s9.2-24.2 11.3-29.5h68.6c1.6 6.9 6.5 29.5 6.5 29.5h49.7l-43.6-195.8zm-65.9 126.3c4.4-11.3 21.5-55 21.5-55-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 56.8h-44.7zM327.1 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65-73.7-82l47.9 171.5h56.6l84.2-195.8h-57.1z" fill="white"/>
                <path d="M221.5 152.9h-86.2l-.7 3.8c67.1 16.2 111.5 55.4 129.9 102.5l-18.7-90c-3.2-12.4-12.7-15.8-24.3-16.3z" fill="#F7B600"/>
              </svg>
              <svg viewBox="0 0 48 32" className="h-8" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#252525"/>
                <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                <path d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z" fill="#FF5F00"/>
              </svg>
              <svg viewBox="0 0 48 32" className="h-8" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="32" rx="4" fill="#635BFF"/>
                <path d="M22.5 13.3c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5.2 1.4V9.2c-1.7-.7-3.5-1-5.2-1-4.3 0-7.1 2.2-7.1 6 0 5.8 8 4.9 8 7.4 0 1-.8 1.3-2 1.3-1.7 0-4-.7-5.7-1.7v4.5c1.9.8 3.9 1.2 5.7 1.2 4.4 0 7.4-2.2 7.4-6 0-6.3-8-5.2-8-7.6z" fill="white"/>
              </svg>
            </div>
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Stripe ile kart ödemesi yakında aktif olacak</p>
                <p className="text-xs text-muted-foreground mt-1">Şu an için Havale/EFT veya Çek ile ödeme yapabilirsiniz.</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setShowCardDialog(false); if (selectedPayment) setShowMethodDialog(true); }}>
              Geri Dön
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Havale/EFT Dialog */}
      <Dialog open={showHavaleDialog} onOpenChange={setShowHavaleDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Havale / EFT Bilgileri</DialogTitle>
            <DialogDescription>
              Aşağıdaki hesaplardan birine ödemenizi yapabilirsiniz. Açıklama kısmına fatura numaranızı eklemeyi unutmayın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-muted/30 border border-border p-3 text-sm">
              <span className="font-medium">Fatura:</span> {paymentInfoText}
            </div>
            {BANK_ACCOUNTS.map((acc, i) => (
              <div key={i} className="border border-border p-4 space-y-2">
                <p className="font-semibold text-sm">{acc.bank}</p>
                <p className="text-xs text-muted-foreground">{acc.branch}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 flex-1 font-mono">{acc.iban}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(acc.iban, `iban-${i}`)}>
                    {copied === `iban-${i}` ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Havale yaptıktan sonra dekontunuzu Destek sekmesinden iletebilirsiniz.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Çek Dialog — with controlled form + Supabase save */}
      <Dialog open={showCekDialog} onOpenChange={setShowCekDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Çek ile Ödeme</DialogTitle>
            <DialogDescription>
              Çek bilgilerinizi aşağıya girin. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-muted/30 border border-border p-3 text-sm">
              <span className="font-medium">Fatura:</span> {paymentInfoText}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Çek Numarası</Label>
              <Input placeholder="Çek seri numarası" value={cekNo} onChange={e => setCekNo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Banka</Label>
              <Input placeholder="Çeki düzenleyen banka" value={cekBank} onChange={e => setCekBank(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Vade Tarihi</Label>
              <Input type="date" value={cekVade} onChange={e => setCekVade(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tutar (₺)</Label>
              <Input type="number" value={cekTutar} onChange={e => setCekTutar(e.target.value)} />
            </div>
            <Button className="w-full" disabled={cekSubmitting} onClick={handleCekSubmit}>
              {cekSubmitting ? <><Loader2 size={14} className="animate-spin mr-2" /> Gönderiliyor...</> : "Çek Bilgilerini Gönder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
