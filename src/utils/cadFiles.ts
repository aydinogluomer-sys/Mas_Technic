/* CAD file rules shared by the landing dropzone, the quote studio and the
   chat FAQ. Pure: no network, no Supabase — see `./cadUpload` for the upload. */
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

