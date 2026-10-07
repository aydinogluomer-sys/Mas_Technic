import { useTranslation } from "react-i18next";
import { ShellAction, ShellNotice, ShellTagRow, ShellTitleBlock } from "@/components/shell";
import { CAD_ACCEPT_ATTR, CAD_FORMAT_CHIPS } from "@/hooks/useCadHandoff";
import { REVISION_ACK_LABEL } from "./rfq-attachments";
import { formatFileSize } from "./rfq-model";
import type { AttachmentSelection } from "./useAttachmentSelection";

/* ══════════════════════════════════════════════════════════════════════════
   STEP 01 (multi-attachment) — a model, PDF drawings, or both (RFQ01).

   Rendered only when `RFQ_ATTACHMENTS_ENABLED`. Two native file inputs, one
   per slot, so each has its own accept list and its own accessible name: the
   model slot takes the seven CAD extensions, the drawing slot takes PDF and
   checks the `%PDF-` signature after the file is chosen. A PDF is never
   parsed or previewed. Revision labels are optional; when a model and a
   drawing both carry one and they differ, the request needs the explicit
   acknowledgement the contract words — equality is never assumed.
   ══════════════════════════════════════════════════════════════════════════ */

export function RfqAttachmentsStep({ selection }: { selection: AttachmentSelection }) {
  const { t } = useTranslation();
  const { items, problems, rejected, limits } = selection;
  const maxMb = limits.maxFileBytes / 1024 / 1024;
  const totalMb = limits.maxTotalBytes / 1024 / 1024;
  const shown = problems.filter((problem) => problem.code !== "none");
  /* The input is emptied after each pick so choosing the same file again still fires. */
  const pick = (kind: "model" | "drawing") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    if (files.length) selection.add(files, kind);
    event.target.value = "";
  };

  return (
    <div className="shell-stack">
      <ShellTitleBlock
        id="rfq-step-cad"
        index="01"
        title={t("Dosyalarınızı ekleyin")}
        standfirst={t("3B model, PDF teknik resim veya ikisi birlikte. En fazla {{models}} model ve {{drawings}} PDF; dosya başına {{max}} MB, toplam {{total}} MB.", {
          models: limits.maxModels,
          drawings: limits.maxDrawings,
          max: maxMb,
          total: totalMb,
        })}
      />

      <div className="shell-stack" data-gap="sm">
        <p className="shell-eyebrow">{t("3B MODEL")}</p>
        <ShellTagRow items={[...CAD_FORMAT_CHIPS]} ariaLabel={t("Kabul edilen CAD formatları")} />
        <div className="shell-dropzone">
          <input id="rfq-model" name="model" type="file" accept={CAD_ACCEPT_ATTR} aria-describedby="rfq-files-hint"
            onChange={pick("model")}
          />
          <label htmlFor="rfq-model" className="shell-dropzone-area">
            <span className="shell-dropzone-title">{t(selection.modelCount ? "Modeli değiştirmek için seçin" : "3B model seçin")}</span>
            <span className="shell-dropzone-hint">{t("En fazla {{count}} dosya", { count: limits.maxModels })}</span>
          </label>
        </div>
      </div>

      <div className="shell-stack" data-gap="sm">
        <p className="shell-eyebrow">{t("PDF TEKNİK RESİM")}</p>
        <div className="shell-dropzone">
          <input id="rfq-drawings" name="drawings" type="file" accept=".pdf,application/pdf" multiple aria-describedby="rfq-files-hint"
            onChange={pick("drawing")}
          />
          <label htmlFor="rfq-drawings" className="shell-dropzone-area">
            <span className="shell-dropzone-title">{t("PDF teknik resim seçin")}</span>
            <span className="shell-dropzone-hint">{t("En fazla {{count}} dosya", { count: limits.maxDrawings })}</span>
          </label>
        </div>
      </div>

      <p className="shell-field-hint" id="rfq-files-hint">
        {t("Seçtiğiniz dosyalar tarayıcıda saklanmaz: sayfayı yenilerseniz dosyaları yeniden seçmeniz gerekir.")}
      </p>

      {items.length > 0 && (
        <ul className="rfq-attachments" aria-label={t("Eklenen dosyalar")}>
          {items.map((item) => (
            <li key={item.key} data-kind={item.kind}>
              <p className="rfq-attachment-name">
                <span>{t(item.kind === "model" ? "3B MODEL" : "PDF")}</span>
                {item.file.name}
              </p>
              <p className="rfq-attachment-size">{formatFileSize(item.file.size)}</p>
              <div className="shell-field">
                <label htmlFor={`rfq-rev-${item.key}`}>{t("Revizyon (isteğe bağlı)")}</label>
                <input
                  id={`rfq-rev-${item.key}`}
                  type="text"
                  maxLength={20}
                  value={item.revisionLabel}
                  onChange={(event) => selection.setRevision(item.key, event.target.value)}
                  placeholder={t("ör. Rev B")}
                />
              </div>
              <ShellAction variant="quiet" onClick={() => selection.remove(item.key)}>
                {t("Kaldır")}
              </ShellAction>
            </li>
          ))}
        </ul>
      )}

      {selection.revisionMismatch && (
        <label className="rfq-revision-ack">
          <input
            type="checkbox"
            id="rfq-revision-ack"
            checked={selection.revisionAcknowledged}
            onChange={(event) => selection.setRevisionAcknowledged(event.target.checked)}
          />
          <span>{t(REVISION_ACK_LABEL)}</span>
        </label>
      )}

      {rejected.length > 0 && (
        <ShellNotice tone="error" label={t("DOSYA REDDEDİLDİ")} title={t("Bu dosyalar bu alana eklenmedi")}>
          <p>{rejected.join(", ")}</p>
        </ShellNotice>
      )}

      {shown.length > 0 && (
        <ShellNotice tone="error" label={t("DOSYA KONTROLÜ")} title={t("Dosyalarda düzeltilmesi gereken bir şey var")}>
          <ul>
            {shown.map((problem) => (
              <li key={`${problem.code}-${problem.key ?? ""}`}>{t(problem.message, problem.vars)}</li>
            ))}
          </ul>
        </ShellNotice>
      )}
    </div>
  );
}
