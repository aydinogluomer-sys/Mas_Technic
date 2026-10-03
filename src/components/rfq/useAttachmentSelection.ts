import { useCallback, useMemo, useRef, useState } from "react";
import {
  attachmentKindFor,
  looksLikePdf,
  RFQ_ATTACHMENT_LIMITS,
  revisionsDiffer,
  validateAttachments,
  type AttachmentKind,
  type PendingAttachment,
} from "./rfq-attachments";

/* RFQ01 — choosing the files of a multi-attachment request (flag on only).
   Holds the chosen files, their revision labels and the PDF magic results;
   the rules themselves live in `rfq-attachments.ts`, which the e2e contract
   tests directly. Nothing here is written to storage: a reload loses the
   selection, and step 01 says so. */

export function useAttachmentSelection() {
  const [items, setItems] = useState<PendingAttachment[]>([]);
  const [notPdf, setNotPdf] = useState<ReadonlySet<string>>(new Set());
  const [rejected, setRejected] = useState<string[]>([]);
  const [revisionAcknowledged, setRevisionAcknowledged] = useState(false);
  const counter = useRef(0);

  const add = useCallback((files: readonly File[], slot: AttachmentKind) => {
    const accepted: PendingAttachment[] = [];
    const refused: string[] = [];
    for (const file of files) {
      if (attachmentKindFor(file.name) !== slot) {
        refused.push(file.name);
        continue;
      }
      counter.current += 1;
      accepted.push({ key: `att-${counter.current}`, kind: slot, file, revisionLabel: "" });
    }
    setRejected(refused);
    setItems((current) => {
      /* The model slot holds one file: a new model replaces the old one. */
      const kept = slot === "model" ? current.filter((item) => item.kind !== "model") : current;
      return [...kept, ...accepted];
    });
    for (const item of accepted) {
      if (item.kind !== "drawing") continue;
      void looksLikePdf(item.file).then((ok) => {
        if (ok) return;
        setNotPdf((current) => new Set([...current, item.key]));
      });
    }
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
    setNotPdf((current) => {
      if (!current.has(key)) return current;
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }, []);

  const setRevision = useCallback((key: string, revisionLabel: string) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, revisionLabel } : item)));
    setRevisionAcknowledged(false);
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setNotPdf(new Set());
    setRejected([]);
    setRevisionAcknowledged(false);
  }, []);

  const problems = useMemo(
    () => validateAttachments(items, { revisionAcknowledged, notPdf }),
    [items, notPdf, revisionAcknowledged],
  );

  return {
    items,
    problems,
    rejected,
    notPdf,
    revisionAcknowledged,
    setRevisionAcknowledged,
    revisionMismatch: revisionsDiffer(items),
    modelCount: items.filter((item) => item.kind === "model").length,
    drawingCount: items.filter((item) => item.kind === "drawing").length,
    limits: RFQ_ATTACHMENT_LIMITS,
    add,
    remove,
    setRevision,
    clear,
  };
}

export type AttachmentSelection = ReturnType<typeof useAttachmentSelection>;
