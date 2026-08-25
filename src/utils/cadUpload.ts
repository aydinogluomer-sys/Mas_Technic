import { supabase } from "@/integrations/supabase/client";

export const CAD_ACCEPTED_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"] as const;
export const CAD_MAX_FILE_SIZE = 50 * 1024 * 1024;
export const CAD_UPLOAD_BUCKET = "cad-uploads";

export type CadUploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadedCadFile = {
  path: string;
  name: string;
  size: number;
  type: string;
  extension: string;
};

export const getCadFileExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? "";

export const validateCadFile = (file: File): string | null => {
  const extension = getCadFileExtension(file.name);
  if (!CAD_ACCEPTED_EXTENSIONS.includes(extension as (typeof CAD_ACCEPTED_EXTENSIONS)[number])) {
    return `Desteklenmeyen dosya formatı. Kabul edilen: ${CAD_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(", ")}`;
  }
  if (file.size > CAD_MAX_FILE_SIZE) return "Dosya boyutu 50 MB'ı aşıyor.";
  return null;
};

const sanitizeFileName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

export const createCadStoragePath = (file: File, rfqId: string, userId?: string | null) => {
  const owner = userId || "anonymous";
  return `${owner}/${rfqId}/${Date.now()}-${sanitizeFileName(file.name)}`;
};

const encodeStoragePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

export const uploadCadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: CadUploadProgress) => void,
): Promise<UploadedCadFile> => {
  const validationError = validateCadFile(file);
  if (validationError) throw new Error(validationError);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://zdqiujpeewtyhtcqhdcj.supabase.co";
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcWl1anBlZXd0eWh0Y3FoZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTY0ODAsImV4cCI6MjA4NjIzMjQ4MH0.njAezeA6ikarsELTNRsDHdUefPWhyxQ0kGNPuFk8zrE";
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? publishableKey;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${CAD_UPLOAD_BUCKET}/${encodeStoragePath(path)}`);
    xhr.setRequestHeader("apikey", publishableKey);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.({ loaded: event.loaded, total: event.total, percent: Math.round((event.loaded / event.total) * 100) });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({ loaded: file.size, total: file.size, percent: 100 });
        resolve({ path, name: file.name, size: file.size, type: file.type, extension: getCadFileExtension(file.name) });
        return;
      }
      reject(new Error(`Dosya yüklenemedi (${xhr.status}).`));
    };

    xhr.onerror = () => reject(new Error("Dosya yüklenirken ağ hatası oluştu."));
    xhr.send(file);
  });
};
