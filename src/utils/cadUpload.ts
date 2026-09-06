import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/env";

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

/**
 * How long the upload may make no progress at all before it is abandoned.
 *
 * Deliberately an IDLE bound rather than `xhr.timeout`, which bounds the whole
 * request: a legitimate 50 MB STEP file on a slow uplink can take minutes and
 * must not be cancelled for being large. What is not legitimate is a socket
 * that has stopped moving — and before Phase 09 there was no bound of either
 * kind, so a connection that died mid-upload left the reader on
 * "GÖNDERİLİYOR…" indefinitely with no error and no way out but a reload.
 * `IMPLEMENTATION.md` §7 lists "handle timeout/network/upload … failures";
 * this is the timeout half, and it is here rather than in the page because
 * `HeroCadDropzone` and the landing RFQ band share this function.
 */
const UPLOAD_STALL_TIMEOUT_MS = 45_000;

export const uploadCadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: CadUploadProgress) => void,
): Promise<UploadedCadFile> => {
  const validationError = validateCadFile(file);
  if (validationError) throw new Error(validationError);

  const supabaseUrl = SUPABASE_URL;
  const publishableKey = SUPABASE_PUBLISHABLE_KEY;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? publishableKey;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let stalled = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const clearWatchdog = () => {
      if (watchdog !== undefined) clearTimeout(watchdog);
      watchdog = undefined;
    };
    const armWatchdog = () => {
      clearWatchdog();
      watchdog = setTimeout(() => {
        stalled = true;
        xhr.abort();
      }, UPLOAD_STALL_TIMEOUT_MS);
    };
    const settle = (finish: () => void) => {
      clearWatchdog();
      finish();
    };

    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${CAD_UPLOAD_BUCKET}/${encodeStoragePath(path)}`);
    xhr.setRequestHeader("apikey", publishableKey);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      armWatchdog();
      if (!event.lengthComputable) return;
      onProgress?.({ loaded: event.loaded, total: event.total, percent: Math.round((event.loaded / event.total) * 100) });
    };

    xhr.onload = () =>
      settle(() => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.({ loaded: file.size, total: file.size, percent: 100 });
          resolve({ path, name: file.name, size: file.size, type: file.type, extension: getCadFileExtension(file.name) });
          return;
        }
        /* The status is the only backend detail repeated to the reader, and it
           is a number: a storage error body can carry a bucket name and a
           path, which `mas-security-rfq` keeps off the page. */
        reject(new Error(`Dosya yüklenemedi (${xhr.status}).`));
      });

    xhr.onerror = () => settle(() => reject(new Error("Dosya yüklenirken ağ hatası oluştu.")));
    xhr.onabort = () =>
      settle(() =>
        reject(
          new Error(
            stalled
              ? "Dosya yüklemesi yanıt vermeyi bıraktı. Bağlantınızı kontrol edip tekrar deneyin."
              : "Dosya yüklemesi iptal edildi.",
          ),
        ),
      );

    armWatchdog();
    xhr.send(file);
  });
};
