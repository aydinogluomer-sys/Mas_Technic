import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FolderOpen, Upload, FileCode, FileText, Download, Search } from "lucide-react";
import { CardListSkeleton } from "./MusteriSkeletons";
import { toast } from "sonner";
import { lazy, Suspense } from "react";

const CustomerCadPreview = lazy(() => import("./CustomerCadPreview").then(m => ({ default: m.CustomerCadPreview })));

interface CustomerFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  version: number | null;
  notes: string | null;
  created_at: string;
  signedUrl?: string;
  source: "upload" | "rfq";
  rfqId?: string;
}

const PAGE_SIZE = 20;

const fileIcon = (type: string | null) => {
  switch (type) {
    case "cad": case "step": case "stp": case "iges": return FileCode;
    default: return FileText;
  }
};

const CAD_EXTS = ["stl", "obj", "step", "stp", "iges", "igs"];
const isCadFile = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return CAD_EXTS.includes(ext);
};

type FilterType = "all" | "upload" | "rfq";

export const TeknikArsivTab = () => {
  const [uploadedFiles, setUploadedFiles] = useState<CustomerFile[]>([]);
  const [rfqFiles, setRfqFiles] = useState<CustomerFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFiles = useCallback(async (pageNum: number, append: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: customerFiles } = await supabase
      .from("customer_files")
      .select("id, file_name, file_url, file_type, version, notes, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);

    const newItems: CustomerFile[] = await Promise.all(
      ((customerFiles as CustomerFile[]) || []).map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from("customer-files")
          .createSignedUrl(file.file_url, 3600);
        return { ...file, signedUrl: urlData?.signedUrl, source: "upload" as const };
      })
    );

    setHasMore(newItems.length === PAGE_SIZE);
    if (append) setUploadedFiles(prev => [...prev, ...newItems]);
    else setUploadedFiles(newItems);
    setLoading(false);
  }, []);

  const fetchRfqFiles = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rfqs } = await supabase
      .from("rfqs")
      .select("id, files, created_at, service")
      .eq("user_id", user.id)
      .not("files", "is", null)
      .order("created_at", { ascending: false });

    const result: CustomerFile[] = [];
    if (rfqs) {
      for (const rfq of rfqs) {
        if (!rfq.files || rfq.files.length === 0) continue;
        for (const filePath of rfq.files) {
          const fileName = filePath.split("/").pop() || filePath;
          const ext = fileName.split(".").pop()?.toLowerCase() || "";
          const fileType = ["step", "stp", "iges", "igs", "stl", "obj"].includes(ext) ? "cad" :
                          ["pdf"].includes(ext) ? "pdf" : "other";

          const { data: urlData } = await supabase.storage
            .from("cad-uploads")
            .createSignedUrl(filePath, 3600);

          result.push({
            id: `rfq-${rfq.id}-${fileName}`,
            file_name: fileName,
            file_url: filePath,
            file_type: fileType,
            version: null,
            notes: rfq.service ? `Teklif: ${rfq.service}` : null,
            created_at: rfq.created_at,
            signedUrl: urlData?.signedUrl,
            source: "rfq",
            rfqId: rfq.id,
          });
        }
      }
    }
    setRfqFiles(result);
  }, []);

  useEffect(() => {
    Promise.all([fetchFiles(0, false), fetchRfqFiles()]);

    const channel = supabase
      .channel("customer-files-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "customer_files" }, async (payload) => {
        const newFile = payload.new as { id: string; file_name: string; file_url: string; file_type: string | null; version: number | null; notes: string | null; created_at: string };
        const { data: urlData } = await supabase.storage.from("customer-files").createSignedUrl(newFile.file_url, 3600);
        setUploadedFiles(prev => [{ ...newFile, signedUrl: urlData?.signedUrl, source: "upload" as const }, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customer_files" }, async (payload) => {
        const updated = payload.new as { id: string; file_name: string; file_url: string; file_type: string | null; version: number | null; notes: string | null; created_at: string };
        const { data: urlData } = await supabase.storage.from("customer-files").createSignedUrl(updated.file_url, 3600);
        setUploadedFiles(prev => prev.map(f => f.id === updated.id ? { ...updated, signedUrl: urlData?.signedUrl, source: "upload" as const } : f));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "customer_files" }, (payload) => {
        const deleted = payload.old as { id: string };
        setUploadedFiles(prev => prev.filter(f => f.id !== deleted.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchFiles, fetchRfqFiles]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFiles(nextPage, true);
    setLoadingMore(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Oturum bulunamadı."); setUploading(false); return; }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${session.user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("customer-files").upload(path, file);
    if (uploadError) { toast.error("Dosya yüklenemedi: " + uploadError.message); setUploading(false); return; }

    const fileType = ["step", "stp", "iges", "igs"].includes(ext) ? "cad" :
                     ["pdf"].includes(ext) ? "pdf" : "other";

    const { error: dbError } = await supabase.from("customer_files").insert({
      user_id: session.user.id,
      file_name: file.name,
      file_url: path,
      file_type: fileType,
    });

    if (dbError) { toast.error("Dosya kaydedilemedi."); } else {
      toast.success("Dosya yüklendi!");
    }
    setUploading(false);
    e.target.value = "";
  };

  if (loading) return <CardListSkeleton count={4} />;

  // Merge and sort
  const allFiles = [...uploadedFiles, ...rfqFiles].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply filters
  const filteredFiles = allFiles.filter(f => {
    if (filter === "upload" && f.source !== "upload") return false;
    if (filter === "rfq" && f.source !== "rfq") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.file_name.toLowerCase().includes(q) || (f.notes || "").toLowerCase().includes(q);
    }
    return true;
  });

  const uploadCount = uploadedFiles.length;
  const rfqCount = rfqFiles.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-sm">Teknik Dosyalarım</h3>
        <label>
          <Input type="file" className="hidden" accept=".step,.stp,.iges,.igs,.stl,.obj,.pdf,.dxf,.dwg,.png,.jpg" onChange={handleUpload} />
          <Button size="sm" variant="outline" className="gap-2 text-xs cursor-pointer" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Dosya Yükle
            </span>
          </Button>
        </label>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center border border-border rounded overflow-hidden text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
          >
            Tümü ({allFiles.length})
          </button>
          <button
            onClick={() => setFilter("upload")}
            className={`px-3 py-1.5 transition-colors border-l border-border ${filter === "upload" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
          >
            Yüklediğim ({uploadCount})
          </button>
          <button
            onClick={() => setFilter("rfq")}
            className={`px-3 py-1.5 transition-colors border-l border-border ${filter === "rfq" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
          >
            Teklif Dosyaları ({rfqCount})
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dosya ara..."
            className="w-full bg-background border border-border pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary transition-colors rounded"
          />
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FolderOpen size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {allFiles.length === 0 ? "Henüz dosya yüklenmemiş." : "Aramanızla eşleşen dosya bulunamadı."}
          </p>
          <p className="text-xs mt-1">
            {allFiles.length === 0
              ? "Teknik çizimlerinizi ve CAD dosyalarınızı buradan yönetin. Teklif talebi ile gönderilen dosyalar da burada görünür."
              : "Farklı bir arama terimi deneyin veya filtreyi değiştirin."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((f) => {
            const Icon = fileIcon(f.file_type);
            return (
              <div key={f.id} className="border border-border bg-background hover:border-primary/20 transition-colors rounded-lg overflow-hidden">
                <div className="flex items-center gap-4 p-3">
                  <Icon size={20} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{new Date(f.created_at).toLocaleDateString("tr-TR")}</span>
                      {f.version && f.version > 1 && <span>· v{f.version}</span>}
                      {f.notes && <span>· {f.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] uppercase ${f.source === "rfq" ? "border-primary/30 text-primary" : ""}`}>
                      {f.source === "rfq" ? "Teklif" : f.file_type || "dosya"}
                    </Badge>
                    <a href={f.signedUrl || "#"} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={!f.signedUrl}><Download size={14} /></Button>
                    </a>
                  </div>
                </div>
                {f.signedUrl && isCadFile(f.file_name) && (
                  <div className="px-3 pb-3">
                    <Suspense fallback={<div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>}>
                      <CustomerCadPreview signedUrl={f.signedUrl} fileName={f.file_name} />
                    </Suspense>
                  </div>
                )}
              </div>
            );
          })}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Daha Fazla Yükle"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
