import { ShellAction, ShellMetaRow, ShellNotice, ShellTitleBlock } from "@/components/shell";
import { useTranslation } from "react-i18next";
import { QUOTE_RESPONSE_TIME, SALES_EMAIL, SALES_EMAIL_HREF } from "@/content/claims";
import {
  NOT_SPECIFIED,
  optionLabel,
  resolveMaterialLabel,
  RFQ_PRIORITIES,
  RFQ_SERVICES,
  RFQ_SURFACE_FINISHES,
  type Dimensions,
  type RfqDraft,
} from "./rfq-model";
import type { RfqSubmissionState } from "./useRfqSubmission";

/* ══════════════════════════════════════════════════════════════════════════
   STEP 03 — REVIEW, SEND, AND WHAT THE ANSWER MEANS

   ── THE SUCCESS STATE STATES ONLY WHAT HAPPENS ───────────────────────────
   No confirmation e-mail is claimed, because none is sent: `rfq-rate-limit`
   inserts one row into `rfqs` with `status: "Yeni"` and returns; there is no
   trigger on the table, no mailer in `supabase/functions/**` and no scheduled
   job that reads it. What the request actually does is appear in the internal
   quote register (`src/components/admin/RFQManager.tsx`), where staff answer
   it from the address `USER_INPUTS.md` §J names. That is what the copy says.

   ── AND THE REFERENCE IS THE SERVER'S, OR THERE IS NONE ──────────────────
   `reference` is whatever the 201 response echoed back as `rfq.id` — the
   primary key of the row that now exists. If the response carries none, the
   panel below simply has no reference line. `IMPLEMENTATION.md` §13 forbids a
   fabricated confirmation number, and a number generated in the browser for a
   row that may not have been written is exactly that.

   ── NO PRODUCTION LEAD TIME IS SHOWN, HERE OR ANYWHERE ───────────────────
   The summary used to print "Teslimat · Ekspres (3-5 Gün)". §J supplies a
   quote SLA and no production lead time at all, so the summary shows the
   priority the reader asked for and the SLA that is authorised.
   ══════════════════════════════════════════════════════════════════════════ */

export type RfqSubmitStepProps = {
  draft: RfqDraft;
  fileName: string | null;
  dimensions: Dimensions | null;
  state: RfqSubmissionState;
  onEdit: (step: number) => void;
  onRestart: () => void;
};

export function RfqSubmitStep({
  draft,
  fileName,
  dimensions,
  state,
  onEdit,
  onRestart,
}: RfqSubmitStepProps) {
  const { t } = useTranslation();
  if (state.status === "sent") {
    return (
      <div className="shell-stack">
        <p className="shell-eyebrow" role="status">
          TALEP ALINDI
        </p>
        <ShellTitleBlock
          id="rfq-step-sent"
          index="03"
          title={t("Teklif talebiniz kaydedildi")}
          standfirst={t("Mühendislik ekibimiz dosyanızı inceleyip {{time}} içinde fiyat ve termin ile dönecek.", { time: t(QUOTE_RESPONSE_TIME) })}
        />
        <ShellMetaRow
          items={[
            ...(state.reference ? [{ label: t("Talep numarası"), value: state.reference }] : []),
            { label: t("Dönüş süresi"), value: t(QUOTE_RESPONSE_TIME) },
            { label: t("Yanıt adresi"), value: draft.email.trim() },
            { label: t("Bize ulaşın"), value: SALES_EMAIL },
          ]}
        />
        <ShellNotice tone="note" label={t("BUNDAN SONRA NE OLUYOR")}>
          <p>
            {t("Talebiniz teklif kaydına düştü ve ekibimiz orada görüyor. Dönüş, formda verdiğiniz e-posta adresine yapılır; otomatik bir onay e-postası gönderilmez.")}
          </p>
          {state.reference && (
            <p>{t("Bize yazarken {{reference}} numarasını belirtirseniz talebi doğrudan buluruz.", { reference: state.reference })}</p>
          )}
        </ShellNotice>
        <div className="shell-state-actions">
          <ShellAction href={SALES_EMAIL_HREF} variant="ghost">
            {SALES_EMAIL}
          </ShellAction>
          <ShellAction variant="quiet" onClick={onRestart}>
            {t("Yeni bir talep oluştur")}
          </ShellAction>
        </div>
      </div>
    );
  }

  const summary: { label: string; value: string }[] = [
    { label: t("Dosya"), value: fileName ?? t("Eklenmedi") },
    { label: t("Yetkili"), value: draft.name.trim() || "—" },
    { label: t("Firma"), value: draft.company.trim() || "—" },
    { label: t("E-posta"), value: draft.email.trim() || "—" },
    { label: t("Hizmet"), value: t(optionLabel(RFQ_SERVICES, draft.service)) },
    { label: t("Malzeme"), value: t(resolveMaterialLabel(draft.material, draft.customMaterial)) },
    { label: t("Yüzey"), value: t(optionLabel(RFQ_SURFACE_FINISHES, draft.finish)) },
    { label: t("Tolerans"), value: t(draft.tolerance || NOT_SPECIFIED) },
    { label: t("Miktar"), value: Number.isFinite(draft.quantity) ? t("{{count}} adet", { count: draft.quantity }) : t(NOT_SPECIFIED) },
    { label: t("Öncelik"), value: t(optionLabel(RFQ_PRIORITIES, draft.priority)) },
    { label: t("Parça / rev."), value: draft.drawingNumber.trim() || t("Belirtilmedi") },
    ...(dimensions
      ? [{ label: t("Sınırlayıcı kutu"), value: `${dimensions.x} × ${dimensions.y} × ${dimensions.z} mm` }]
      : []),
  ];

  return (
    <div className="shell-stack">
      <ShellTitleBlock
        id="rfq-step-send"
        index="03"
        title={t("Talebinizi kontrol edin ve gönderin")}
        standfirst={t("Aşağıdaki kayıt ekibimize bu haliyle iletilir. Bir şey eksikse ilgili adıma dönüp düzeltebilirsiniz.")}
      />

      <ShellMetaRow items={summary} />

      <div className="shell-state-actions">
        <ShellAction variant="quiet" onClick={() => onEdit(1)}>
          {t("Dosyayı değiştir")}
        </ShellAction>
        <ShellAction variant="quiet" onClick={() => onEdit(2)}>
          {t("Bilgileri düzenle")}
        </ShellAction>
      </div>

      {state.status === "uploading" && (
        <p
          className="shell-field-hint"
          role="progressbar"
          aria-label={t("CAD dosyası yükleniyor")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={state.percent}
        >
          {t("CAD dosyası yükleniyor")} · %{state.percent}
        </p>
      )}
      {state.status === "sending" && (
        <p className="shell-field-hint" role="status">
          {t("Talep kaydediliyor…")}
        </p>
      )}

      {/* A20 — the submission failure is a persistent, announced block. */}
      {state.status === "failed" && (
        <ShellNotice
          tone="error"
          label={t(state.error.label)}
          title={t(state.error.title)}
          action={
            <ShellAction href={SALES_EMAIL_HREF} variant="ghost">
              {t("Dosyayı e-posta ile gönderin")}
            </ShellAction>
          }
        >
          <p>{t(state.error.detail, state.error.detailVars)}</p>
        </ShellNotice>
      )}
    </div>
  );
}
