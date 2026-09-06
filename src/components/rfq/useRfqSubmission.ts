import { useCallback, useRef, useState } from "react";
import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { createCadStoragePath, uploadCadFile, type UploadedCadFile } from "@/utils/cadUpload";
import {
  buildRfqNotes,
  createRfqReference,
  optionLabel,
  resolveMaterialLabel,
  RFQ_SERVICES,
  type RfqDraft,
} from "./rfq-model";

/* ══════════════════════════════════════════════════════════════════════════
   THE SUBMISSION PIPELINE

   Four network steps, each with its own failure surface:

     1  session + profile lookup   optional enrichment — MUST NOT be fatal
     2  CAD upload                 XHR to storage, with progress and a stall
                                   watchdog (`utils/cadUpload.ts`)
     3  `rfq-rate-limit`           the edge function that writes the row
     4  the reference the server echoed back

   ── THE DEAD BRANCH THIS REPLACES ────────────────────────────────────────
   The page read the backend's own error messages like this:

       const { data: fnData, error: fnError } = await supabase.functions
         .invoke("rfq-rate-limit", { body });
       if (fnError) throw fnError;
       if (fnData?.error) { toast.error(fnData.error); … }

   `fnData?.error` is UNREACHABLE. `@supabase/functions-js`'s `invoke` checks
   `response.ok` and THROWS `FunctionsHttpError` for any non-2xx
   (`FunctionsClient.js`, `if (!response.ok) throw new FunctionsHttpError(...)`),
   returning `{ data: null, error }`. Every message the function is careful to
   write — "Çok fazla talep gönderildi. Lütfen 1 dakika sonra tekrar deneyin."
   on 429, "Geçerli bir e-posta adresi zorunludur." on 400, "Talep
   oluşturulamadı." on 500 — landed in `fnError`, was rethrown, and reached
   the reader as the library's own string: "Gönderim hatası: Edge Function
   returned a non-2xx status code". Every one of those sentences has been
   unreachable for as long as the branch has existed.

   `FunctionsHttpError.context` IS the `Response`. Reading its JSON body is
   what surfaces the backend's message; the HTTP status is what decides
   whether retrying is worth suggesting.

   MEASURED, AND NOT WHAT THE SOURCE SAYS. The deployed function on the
   configured project answers only the `id` guard: a probe with an id that
   already exists — so no row could be written — got the duplicate-key 500 for
   a missing e-mail, a malformed e-mail, a one-character customer, a missing
   company and a `.txt` in `files`, and fifteen requests inside a minute from
   one address produced no 429. The 429 and 4xx branches below are therefore
   correct and exercised — each one driven through the real page with the
   function's response intercepted, so nothing was written — but currently
   unreachable in production. `supabase/**` is read-only in this
   phase and deploying is a stop condition, so this is reported rather than
   fixed; it belongs to Phase 09b's RLS and backend audit.

   ── WHAT IS DELIBERATELY NOT SHOWN ───────────────────────────────────────
   No stack trace, no Supabase error code, no URL, no environment value
   (`mas-security-rfq`). Every branch below maps to a fixed Turkish sentence;
   the only backend text ever displayed is the message the edge function wrote
   for a human, and it is length-clamped so a future backend change cannot
   paste an internal payload onto the page.
   ══════════════════════════════════════════════════════════════════════════ */

/** How long the RFQ write may take before the reader is told it timed out. */
const INVOKE_TIMEOUT_MS = 30_000;

/** Longest backend sentence we will repeat verbatim. */
const MAX_BACKEND_MESSAGE = 240;

export type RfqSubmissionError = {
  label: string;
  title: string;
  detail: string;
  /** `true` when trying the same request again is a sensible next action. */
  retryable: boolean;
};

export type RfqSubmissionState =
  | { status: "idle" }
  | { status: "uploading"; percent: number }
  | { status: "sending" }
  | { status: "sent"; reference: string | null }
  | { status: "failed"; error: RfqSubmissionError };

type SubmitInput = {
  draft: RfqDraft;
  /** The file chosen on this page, if it has not been uploaded yet. */
  file: File | null;
  /** A storage object the hero dropzone already uploaded. */
  handoff: UploadedCadFile | null;
};

function clampBackendMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_BACKEND_MESSAGE) return null;
  return trimmed;
}

async function readFunctionError(error: unknown): Promise<RfqSubmissionError> {
  /* An aborted fetch is how `invoke`'s own `timeout` option expresses itself:
     the AbortController fires, `fetch` rejects, and the rejection is wrapped
     in `FunctionsFetchError` with the original error as its context. */
  if (error instanceof FunctionsFetchError) {
    const cause = (error as { context?: { name?: string } }).context;
    if (cause?.name === "AbortError" || cause?.name === "TimeoutError") {
      return {
        label: "ZAMAN AŞIMI",
        title: "Sunucu zamanında yanıt vermedi",
        detail:
          "Talebiniz gönderilirken bağlantı süresi doldu. Dosyanız yüklendiyse tekrar denediğinizde " +
          "yeniden yüklenmez; birkaç saniye bekleyip yeniden gönderin.",
        retryable: true,
      };
    }
    return {
      label: "BAĞLANTI HATASI",
      title: "Sunucuya ulaşılamadı",
      detail:
        "İnternet bağlantınız kesilmiş ya da istek engellenmiş olabilir. Bağlantınızı kontrol edip " +
        "tekrar deneyin.",
      retryable: true,
    };
  }

  if (error instanceof FunctionsHttpError) {
    const response = (error as { context?: Response }).context;
    const status = response?.status ?? 0;
    let backendMessage: string | null = null;
    let retryAfterSeconds: number | null = null;
    try {
      const body = await response?.clone().json();
      backendMessage = clampBackendMessage((body as { error?: unknown } | undefined)?.error);
      const retry = (body as { retry_after?: unknown } | undefined)?.retry_after;
      if (typeof retry === "number" && Number.isFinite(retry)) retryAfterSeconds = retry;
    } catch {
      backendMessage = null;
    }

    if (status === 429) {
      return {
        label: "ÇOK FAZLA TALEP",
        title: "Kısa sürede çok fazla talep gönderildi",
        detail:
          backendMessage ??
          `Lütfen ${retryAfterSeconds ?? 60} saniye bekleyip tekrar deneyin.`,
        retryable: true,
      };
    }
    if (status >= 400 && status < 500) {
      return {
        label: "TALEP REDDEDİLDİ",
        title: "Sunucu bu talebi kabul etmedi",
        detail:
          backendMessage ??
          "Alanlardan biri sunucu tarafındaki kontrolü geçemedi. Bilgileri kontrol edip tekrar deneyin.",
        retryable: false,
      };
    }
    return {
      label: "SUNUCU HATASI",
      title: "Talep kaydedilemedi",
      detail:
        backendMessage ??
        "Talebiniz sunucuda kaydedilemedi. Tekrar deneyebilir veya dosyanızı doğrudan e-posta ile gönderebilirsiniz.",
      retryable: true,
    };
  }

  return {
    label: "GÖNDERİM HATASI",
    title: "Talep gönderilemedi",
    detail:
      "Beklenmeyen bir hata oluştu. Tekrar deneyebilir veya dosyanızı doğrudan e-posta ile gönderebilirsiniz.",
    retryable: true,
  };
}

export function useRfqSubmission() {
  const [state, setState] = useState<RfqSubmissionState>({ status: "idle" });
  /**
   * DOUBLE-SUBMIT GUARD.
   *
   * `disabled={pending}` alone is not one: the flag is React state, so it only
   * reaches the DOM on the next commit, and anything that calls the handler
   * without going through the button — implicit form submission on Enter, a
   * synthesised click, a second Enter while the first request is in flight —
   * runs before that commit. A ref is set synchronously on the first call and
   * every later call returns immediately. Both are used: the ref makes a
   * second request impossible, the `disabled` + `aria-busy` pair makes it
   * visible and announced.
   */
  const inFlight = useRef(false);
  /** A storage object already written, so a retry does not upload it twice. */
  const uploadedRef = useRef<UploadedCadFile | null>(null);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const submit = useCallback(async ({ draft, file, handoff }: SubmitInput) => {
    if (inFlight.current) return;
    inFlight.current = true;

    const reference = createRfqReference();
    setState(file && !uploadedRef.current && !handoff ? { status: "uploading", percent: 0 } : { status: "sending" });

    try {
      /* 1 — optional enrichment. A signed-out reader is the normal case and a
         failing session lookup must not cost them their request, so this
         whole step is best-effort. */
      let userId: string | null = null;
      let userEmail: string | null = null;
      let profile: { full_name?: string; company?: string; phone?: string } = {};
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (user) {
          userId = user.id;
          userEmail = user.email ?? null;
          const { data: row } = await supabase
            .from("profiles")
            .select("full_name, company, phone")
            .eq("id", user.id)
            .single();
          if (row) profile = row;
        }
      } catch {
        /* stay anonymous */
      }

      /* 2 — the file. */
      let storedFile = uploadedRef.current ?? handoff;
      if (!storedFile && file) {
        try {
          storedFile = await uploadCadFile(
            file,
            createCadStoragePath(file, reference, userId),
            (progress) => setState({ status: "uploading", percent: progress.percent }),
          );
          uploadedRef.current = storedFile;
        } catch (uploadError) {
          setState({
            status: "failed",
            error: {
              label: "YÜKLEME BAŞARISIZ",
              title: "CAD dosyası yüklenemedi",
              detail:
                uploadError instanceof Error && uploadError.message.length <= MAX_BACKEND_MESSAGE
                  ? uploadError.message
                  : "Dosya yüklenirken bağlantı kesildi. Tekrar deneyin.",
              retryable: true,
            },
          });
          return;
        }
      }

      /* 3 — the write. */
      setState({ status: "sending" });
      const { data, error } = await supabase.functions.invoke("rfq-rate-limit", {
        timeout: INVOKE_TIMEOUT_MS,
        body: {
          id: reference,
          customer: draft.name.trim() || profile.full_name || null,
          company: draft.company.trim() || profile.company || null,
          email: draft.email.trim() || userEmail || null,
          phone: draft.phone.trim() || profile.phone || null,
          user_id: userId,
          quantity: draft.quantity,
          service: optionLabel(RFQ_SERVICES, draft.service),
          material: resolveMaterialLabel(draft.material, draft.customMaterial),
          notes: buildRfqNotes(draft),
          files: storedFile ? [storedFile.path] : [],
        },
      });

      if (error) {
        setState({ status: "failed", error: await readFunctionError(error) });
        return;
      }

      /* 4 — the reference, taken from the row the server says it wrote. If the
         response carries no id, the success screen simply has none: an
         identifier that was never persisted is worth less than silence. */
      const stored = (data as { rfq?: { id?: unknown } } | null)?.rfq?.id;
      setState({ status: "sent", reference: typeof stored === "string" ? stored : null });
      uploadedRef.current = null;
      sessionStorage.removeItem("mas_pending_cad_upload");
    } catch (unexpected) {
      setState({ status: "failed", error: await readFunctionError(unexpected) });
    } finally {
      inFlight.current = false;
    }
  }, []);

  return { state, submit, reset };
}
