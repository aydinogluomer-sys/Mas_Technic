import { ShellAction, ShellMetaRow, ShellNotice, ShellTitleBlock } from "@/components/shell";
import { QUOTE_RESPONSE_TIME, SALES_EMAIL, SALES_EMAIL_HREF } from "@/content/claims";
import {
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
  if (state.status === "sent") {
    return (
      <div className="shell-stack">
        <p className="shell-eyebrow" role="status">
          TALEP ALINDI
        </p>
        <ShellTitleBlock
          id="rfq-step-sent"
          index="03"
          title="Teklif talebiniz kaydedildi"
          standfirst={`Mühendislik ekibimiz dosyanızı inceleyip ${QUOTE_RESPONSE_TIME} içinde fiyat ve termin ile dönecek.`}
        />
        <ShellMetaRow
          items={[
            ...(state.reference ? [{ label: "Talep numarası", value: state.reference }] : []),
            { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
            { label: "Yanıt adresi", value: draft.email.trim() },
            { label: "Bize ulaşın", value: SALES_EMAIL },
          ]}
        />
        <ShellNotice tone="note" label="BUNDAN SONRA NE OLUYOR">
          <p>
            Talebiniz teklif kaydına düştü ve ekibimiz orada görüyor. Dönüş, formda verdiğiniz e-posta
            adresine yapılır; otomatik bir onay e-postası gönderilmez.
          </p>
          {state.reference && (
            <p>Bize yazarken {state.reference} numarasını belirtirseniz talebi doğrudan buluruz.</p>
          )}
        </ShellNotice>
        <div className="shell-state-actions">
          <ShellAction href={SALES_EMAIL_HREF} variant="ghost">
            {SALES_EMAIL}
          </ShellAction>
          <ShellAction variant="quiet" onClick={onRestart}>
            Yeni bir talep oluştur
          </ShellAction>
        </div>
      </div>
    );
  }

  const summary: { label: string; value: string }[] = [
    { label: "Dosya", value: fileName ?? "Yüklenmedi" },
    { label: "Yetkili", value: draft.name.trim() || "—" },
    { label: "Firma", value: draft.company.trim() || "—" },
    { label: "E-posta", value: draft.email.trim() || "—" },
    { label: "Hizmet", value: optionLabel(RFQ_SERVICES, draft.service) },
    { label: "Malzeme", value: resolveMaterialLabel(draft.material, draft.customMaterial) },
    { label: "Yüzey", value: optionLabel(RFQ_SURFACE_FINISHES, draft.finish) },
    { label: "Tolerans", value: draft.tolerance },
    { label: "Miktar", value: Number.isFinite(draft.quantity) ? `${draft.quantity} adet` : "—" },
    { label: "Öncelik", value: optionLabel(RFQ_PRIORITIES, draft.priority) },
    { label: "Parça / rev.", value: draft.drawingNumber.trim() || "Belirtilmedi" },
    ...(dimensions
      ? [{ label: "Sınırlayıcı kutu", value: `${dimensions.x} × ${dimensions.y} × ${dimensions.z} mm` }]
      : []),
  ];

  return (
    <div className="shell-stack">
      <ShellTitleBlock
        id="rfq-step-send"
        index="03"
        title="Talebinizi kontrol edin ve gönderin"
        standfirst="Aşağıdaki kayıt ekibimize bu haliyle iletilir. Bir şey eksikse ilgili adıma dönüp düzeltebilirsiniz."
      />

      <ShellMetaRow items={summary} />

      <div className="shell-state-actions">
        <ShellAction variant="quiet" onClick={() => onEdit(1)}>
          Dosyayı değiştir
        </ShellAction>
        <ShellAction variant="quiet" onClick={() => onEdit(2)}>
          Bilgileri düzenle
        </ShellAction>
      </div>

      {state.status === "uploading" && (
        <p
          className="shell-field-hint"
          role="progressbar"
          aria-label="CAD dosyası yükleniyor"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={state.percent}
        >
          CAD dosyası yükleniyor · %{state.percent}
        </p>
      )}
      {state.status === "sending" && (
        <p className="shell-field-hint" role="status">
          Talep kaydediliyor…
        </p>
      )}

      {/* A20 — the submission failure is a persistent, announced block. */}
      {state.status === "failed" && (
        <ShellNotice
          tone="error"
          label={state.error.label}
          title={state.error.title}
          action={
            <ShellAction href={SALES_EMAIL_HREF} variant="ghost">
              Dosyayı e-posta ile gönderin
            </ShellAction>
          }
        >
          <p>{state.error.detail}</p>
        </ShellNotice>
      )}
    </div>
  );
}
