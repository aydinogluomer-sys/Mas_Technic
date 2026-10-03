import { useCallback, useEffect, useState } from "react";
import { safeSession } from "@/lib/safe-storage";
import {
  CAD_ACCEPTED_EXTENSIONS,
  getCadFileExtension,
  validateCadFile,
  type UploadedCadFile,
} from "@/utils/cadFiles";
import { cadPreviewKind, type CadPreviewKind } from "./rfq-model";

/* ══════════════════════════════════════════════════════════════════════════
   CHOOSING A CAD FILE

   Everything about the file EXCEPT drawing it. This module must never import
   `three`, `@react-three/*`, a loader or `occt-import-js`: it is reachable
   from the route chunk, and one value import here would undo the split.
   `cad/CadStage.tsx` is where those live, behind `CadStageHost`'s
   `React.lazy`.

   THE ERROR IS A VALUE, NOT A TOAST. It was three `toast.error()` calls —
   stock `sonner`, white, 8px radius, `ui-sans-serif`, and gone after four
   seconds whether or not anybody read it. A rejected file is not a transient
   confirmation: it is the current state of the control, it has to persist
   next to the control, and it has to be announced. The page renders it with
   `ShellNotice tone="error"` (`role="alert"`, square, Space Grotesk), which is
   what `PROGRESS.md` A20 carried into this phase.
   ══════════════════════════════════════════════════════════════════════════ */

export type CadSelectionError = {
  /** Mono status label for `ShellNotice`. */
  label: string;
  title: string;
  detail: string;
  /** Interpolation values for `detail`, which doubles as its translation key. */
  detailVars?: Record<string, string>;
};

export type CadSelection = {
  file: File;
  extension: string;
  /** `null` for a format that is quotable but cannot be drawn (IGES, 3MF). */
  previewKind: CadPreviewKind | null;
};

const ACCEPTED_LIST = CAD_ACCEPTED_EXTENSIONS.map((extension) => `.${extension}`).join(", ");

export function useCadSelection() {
  const [selection, setSelection] = useState<CadSelection | null>(null);
  const [error, setError] = useState<CadSelectionError | null>(null);
  const [isDragging, setDragging] = useState(false);
  /**
   * A file the hero dropzone already uploaded before sending the reader here.
   * `useCadHandoff` writes it to `sessionStorage` under the key
   * `/cerez-politikasi` madde 02 publishes; nothing new is stored.
   */
  const [handoff, setHandoff] = useState<UploadedCadFile | null>(null);

  const select = useCallback((file: File) => {
    const validationError = validateCadFile(file);
    if (validationError) {
      const extension = getCadFileExtension(file.name);
      const isSizeProblem = file.size > 0 && !validationError.startsWith("Desteklenmeyen");
      setSelection(null);
      setError({
        label: "DOSYA REDDEDİLDİ",
        title: isSizeProblem ? "Dosya boyutu sınırı aşıyor" : "Bu format okunamıyor",
        detail: isSizeProblem
          ? validationError
          : "“{{name}}”{{extension}} kabul edilen formatlardan biri değil. Kabul edilenler: {{list}}.",
        detailVars: isSizeProblem
          ? undefined
          : { name: file.name, extension: extension ? ` (.${extension})` : "", list: ACCEPTED_LIST },
      });
      return false;
    }

    const extension = getCadFileExtension(file.name);
    setError(null);
    setSelection({ file, extension, previewKind: cadPreviewKind(extension) });
    /* A newly chosen file replaces whatever the hero uploaded, so the request
       cannot carry one file's name and another file's storage object. */
    setHandoff(null);
    safeSession.remove("mas_pending_cad_upload");
    return true;
  }, []);

  const clear = useCallback(() => {
    setSelection(null);
    setError(null);
    setHandoff(null);
    safeSession.remove("mas_pending_cad_upload");
  }, []);

  const reportError = useCallback((next: CadSelectionError | null) => setError(next), []);

  /* ── The hero hand-off ────────────────────────────────────────────────
     `useCadHandoff` uploads the file on `/`, stashes the storage record and
     parks the `File` itself on `window` (it cannot survive `sessionStorage`).
     Both are read exactly once, on mount. */
  useEffect(() => {
    const pending = safeSession.get("mas_pending_cad_upload");
    if (pending) {
      try {
        setHandoff(JSON.parse(pending) as UploadedCadFile);
      } catch {
        safeSession.remove("mas_pending_cad_upload");
      }
    }

    const carrier = window as unknown as { __heroUploadFile?: File };
    const heroFile = carrier.__heroUploadFile;
    if (!heroFile) return;
    delete carrier.__heroUploadFile;

    const validationError = validateCadFile(heroFile);
    if (validationError) {
      setError({
        label: "DOSYA REDDEDİLDİ",
        title: "Aktarılan dosya okunamadı",
        detail: validationError,
      });
      return;
    }
    const extension = getCadFileExtension(heroFile.name);
    setSelection({ file: heroFile, extension, previewKind: cadPreviewKind(extension) });
    // The stashed storage record belongs to this same file, so it is kept.
  }, []);

  const dragHandlers = {
    onDragOver: useCallback((event: React.DragEvent) => {
      event.preventDefault();
      setDragging(true);
    }, []),
    onDragLeave: useCallback(() => setDragging(false), []),
    onDrop: useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) select(file);
      },
      [select],
    ),
  };

  return { selection, error, handoff, isDragging, select, clear, reportError, dragHandlers };
}
