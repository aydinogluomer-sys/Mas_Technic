import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CAD_ACCEPTED_EXTENSIONS,
  CAD_MAX_FILE_SIZE,
  createCadStoragePath,
  uploadCadFile,
  validateCadFile,
} from "@/utils/cadUpload";

/** Gizli file input'una verilebilecek accept değeri — tek doğruluk kaynağından üretilir. */
export const CAD_ACCEPT_ATTR = CAD_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

/** "STEP, STP, STL, OBJ, IGES, IGS, 3MF · Maks. 50 MB" — elle yazılmaz, sabitlerden türetilir. */
export const CAD_FORMAT_HINT = `${CAD_ACCEPTED_EXTENSIONS.map((ext) => ext.toUpperCase()).join(", ")} · Maks. ${Math.round(CAD_MAX_FILE_SIZE / (1024 * 1024))} MB`;

/**
 * Rozet listesi. Elle yazılan liste `.x_t`/`.x_b` gibi doğrulayıcının
 * reddettiği formatları yayınlamıştı; §J `ACCEPTED_CAD_FORMATS:
 * DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION` gereği tek kaynaktan türetilir.
 */
export const CAD_FORMAT_CHIPS = CAD_ACCEPTED_EXTENSIONS.map((ext) => ext.toUpperCase());

/**
 * CAD dosyasını doğrular, yükler ve teklif formuna devreder.
 * HeroCadDropzone ve teknik landing RFQ bandı aynı akışı paylaşır.
 */
export function useCadHandoff(draftRfqId: string) {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateCadFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setFileName(file.name);
      setIsUploading(true);
      setProgress(2);
      try {
        const uploaded = await uploadCadFile(file, createCadStoragePath(file, draftRfqId), (nextProgress) => {
          setProgress(nextProgress.percent);
        });
        sessionStorage.setItem("mas_pending_cad_upload", JSON.stringify(uploaded));
        (window as unknown as { __heroUploadFile?: File }).__heroUploadFile = file;
        toast.success("CAD dosyası yüklendi. Teklif formuna aktarılıyor.");
        navigate("/teklif-al");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Dosya yüklenemedi.");
      } finally {
        setIsUploading(false);
      }
    },
    [draftRfqId, navigate],
  );

  return { handleFile, isUploading, progress, fileName };
}
