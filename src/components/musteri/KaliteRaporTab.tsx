import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Download, FileText, Loader2 } from "lucide-react";
import { CardListSkeleton } from "./MusteriSkeletons";

interface QualityReport {
  id: string;
  title: string;
  report_type: string | null;
  file_url: string | null;
  order_id: string | null;
  notes: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const typeLabel = (t: string | null) => {
  switch (t) {
    case "cmm": return "CMM Ölçüm";
    case "material_cert": return "Malzeme Sertifikası";
    case "inspection": return "Muayene Raporu";
    default: return "Rapor";
  }
};

const typeColor = (t: string | null) => {
  switch (t) {
    case "cmm": return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "material_cert": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "inspection": return "bg-purple-500/10 text-purple-600 border-purple-200";
    default: return "bg-muted text-muted-foreground";
  }
};

export const KaliteRaporTab = () => {
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReports = useCallback(async (pageNum: number, append: boolean) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("quality_reports")
      .select("id, title, report_type, file_url, order_id, notes, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);
    const newItems = (data as QualityReport[]) || [];
    setHasMore(newItems.length === PAGE_SIZE);
    if (append) setReports(prev => [...prev, ...newItems]);
    else setReports(newItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports(0, false);
    const channel = supabase
      .channel("customer-quality-tab")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quality_reports" }, (payload) => {
        setReports(prev => [payload.new as QualityReport, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "quality_reports" }, (payload) => {
        const updated = payload.new as QualityReport;
        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "quality_reports" }, (payload) => {
        const deleted = payload.old as { id: string };
        setReports(prev => prev.filter(r => r.id !== deleted.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchReports]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchReports(nextPage, true);
    setLoadingMore(false);
  };

  if (loading) return <CardListSkeleton count={3} />;

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ClipboardCheck size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Henüz kalite raporu bulunmuyor.</p>
        <p className="text-xs mt-1">Parçalarınız sevk edildiğinde ölçüm raporları ve sertifikalar burada görünecek.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} className="flex items-center gap-4 p-4 border border-border bg-background">
          <FileText size={20} className="text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{r.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(r.created_at).toLocaleDateString("tr-TR")}
              {r.order_id && ` · Sipariş: ${r.order_id.slice(0, 8)}`}
            </p>
            {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
          </div>
          <Badge variant="outline" className={typeColor(r.report_type)}>{typeLabel(r.report_type)}</Badge>
          {r.file_url && (
            <a href={r.file_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Download size={14} /></Button>
            </a>
          )}
        </div>
      ))}
      {hasMore && reports.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Daha Fazla Yükle"}
          </Button>
        </div>
      )}
    </div>
  );
};
