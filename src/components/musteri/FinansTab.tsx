import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Wallet, Download, Loader2 } from "lucide-react";
import { SummarySkeleton, TableSkeleton } from "./MusteriSkeletons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FinDoc {
  id: string;
  title: string | null;
  doc_type: string;
  doc_number: string | null;
  doc_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  currency: string | null;
  payment_status: string | null;
  file_urls: string[] | null;
}

const paymentColor = (s: string | null) => {
  switch (s) {
    case "ödendi": return "bg-green-500/10 text-green-600 border-green-200";
    case "kısmi": return "bg-amber-500/10 text-amber-600 border-amber-200";
    default: return "bg-red-500/10 text-red-600 border-red-200";
  }
};

const paymentLabel = (s: string | null) => {
  switch (s) {
    case "ödendi": return "Ödendi";
    case "kısmi": return "Kısmi Ödeme";
    default: return "Ödenmedi";
  }
};

export const FinansTab = () => {
  const [docs, setDocs] = useState<FinDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("financial_documents")
      .select("id, title, doc_type, doc_number, doc_date, due_date, total_amount, currency, payment_status, file_urls")
      .order("created_at", { ascending: false });
    setDocs((data as FinDoc[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
    const channel = supabase
      .channel("customer-finance-tab")
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_documents" }, () => fetchDocs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDownload = async (doc: FinDoc) => {
    if (!doc.file_urls || doc.file_urls.length === 0) return;
    const path = doc.file_urls[0];

    // If it's already a full URL, open directly
    if (path.startsWith("http")) {
      window.open(path, "_blank");
      return;
    }

    setDownloadingId(doc.id);
    const { data, error } = await supabase.storage
      .from("finance-docs")
      .createSignedUrl(path, 120);

    setDownloadingId(null);
    if (error || !data?.signedUrl) {
      toast.error("Dosya indirme bağlantısı oluşturulamadı.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return (
    <div className="space-y-6">
      <SummarySkeleton />
      <TableSkeleton rows={4} cols={6} />
    </div>
  );

  const totalDebt = docs.filter(d => d.payment_status !== "ödendi").reduce((acc, d) => acc + (d.total_amount || 0), 0);
  const totalPaid = docs.filter(d => d.payment_status === "ödendi").reduce((acc, d) => acc + (d.total_amount || 0), 0);

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Wallet size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Henüz finansal belge bulunmuyor.</p>
        <p className="text-xs mt-1">Fatura ve ödeme durumlarınızı bu sekmeden takip edebileceksiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Toplam Fatura</p>
          <p className="text-xl font-bold font-mono mt-1">{docs.length}</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Ödenen</p>
          <p className="text-xl font-bold font-mono mt-1 text-green-600">₺{totalPaid.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Bakiye (Borç)</p>
          <p className="text-xl font-bold font-mono mt-1 text-red-600">₺{totalDebt.toLocaleString("tr-TR")}</p>
        </div>
      </div>

      {/* Invoice table */}
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
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4 font-mono text-xs">{d.doc_number || d.id.slice(0, 8)}</td>
                <td className="py-3 pr-4">{d.title || d.doc_type}</td>
                <td className="py-3 pr-4 text-muted-foreground">{d.doc_date || "—"}</td>
                <td className="py-3 pr-4 text-muted-foreground">{d.due_date || "—"}</td>
                <td className="py-3 pr-4 text-right font-mono font-semibold">
                  ₺{(d.total_amount || 0).toLocaleString("tr-TR")}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="outline" className={paymentColor(d.payment_status)}>
                    {paymentLabel(d.payment_status)}
                  </Badge>
                </td>
                <td className="py-3">
                  {d.file_urls && d.file_urls.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={downloadingId === d.id}
                      onClick={() => handleDownload(d)}
                    >
                      {downloadingId === d.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
