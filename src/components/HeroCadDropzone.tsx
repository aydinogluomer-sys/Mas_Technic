import { useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { CAD_ACCEPT_ATTR, useCadHandoff } from "@/hooks/useCadHandoff";

const DRAFT_RFQ_ID = "RFQ-DRAFT-HERO";

export const HeroCadDropzone = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { handleFile, isUploading, progress, fileName } = useCadHandoff(DRAFT_RFQ_ID);

  return (
    <motion.div
      className="mt-8 border p-4 md:max-w-xl"
      style={{ borderColor: "var(--rule-strong)", background: "var(--surface-glass)" }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.42 }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={CAD_ACCEPT_ATTR}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border border-dashed p-4 text-left transition-colors disabled:cursor-wait disabled:opacity-80"
        style={{ borderColor: isDragging ? "var(--action-primary)" : "var(--rule)", color: "var(--text-primary)" }}
      >
        <span className="flex h-11 w-11 items-center justify-center border" style={{ borderColor: "var(--rule)" }}>
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <UploadCloud className="h-5 w-5 text-primary" />}
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>
            CAD Dosyası Sürükle & Bırak
          </span>
          <span className="mt-1 block truncate text-sm font-semibold">{fileName || "STEP, STL, OBJ, IGES, 3MF · Maks. 50 MB"}</span>
          {isUploading && <span className="mt-2 block h-1 bg-muted"><span className="block h-full bg-primary" style={{ width: `${progress}%` }} /></span>}
        </span>
        <span className="font-mono text-xs text-primary">{isUploading ? `%${progress}` : <CheckCircle2 className="h-4 w-4" />}</span>
      </button>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        <span>Önizleme: Yüzey Eğriliği & Üretilebilirlik</span>
        <span>Süre Tahmini: Bağlayıcı Değildir</span>
      </div>
    </motion.div>
  );
};
