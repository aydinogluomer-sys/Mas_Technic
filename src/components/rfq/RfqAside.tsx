import { ShellAction, ShellMetaRow, ShellRun } from "@/components/shell";
import {
  CERTIFICATIONS,
  CMM_COVERAGE,
  PUBLIC_PHONE,
  PUBLIC_PHONE_HREF,
  QUOTE_RESPONSE_TIME_DISPLAY,
  SALES_EMAIL,
  SALES_EMAIL_HREF,
} from "@/content/claims";
import {
  optionLabel,
  resolveMaterialLabel,
  RFQ_PRIORITIES,
  RFQ_SERVICES,
  RFQ_SURFACE_FINISHES,
  type RfqDraft,
} from "./rfq-model";

/* ══════════════════════════════════════════════════════════════════════════
   THE ASIDE — the live record, and the three things that are true about it

   Four `card-industrial` panels became one measured column: the running
   summary, what the quote covers, and the direct line. Every figure comes
   from `src/content/claims.ts`, which is the only place a public fact is
   allowed to originate — including the certificate code, which used to be the
   literal string "ISO 9001:2015" typed into this page.

   `CONFIDENTIALITY_PROMISE` is withheld in that ledger (§J `NDA_AVAILABLE:
   NO`, `CONFIDENTIALITY_TEXT_APPROVED: NO`, `CAD_RETENTION_PERIOD: UNKNOWN`),
   so this column says nothing at all about NDAs, retention, deletion or
   encryption. The silence is deliberate and must stay: it is the correct
   state until somebody supplies those fields.
   ══════════════════════════════════════════════════════════════════════════ */

export function RfqAside({ draft, fileName }: { draft: RfqDraft; fileName: string | null }) {
  return (
    <>
      <div>
        <p className="shell-eyebrow">CANLI KAYIT</p>
        <ShellMetaRow
          items={[
            { label: "Dosya", value: fileName ?? "Henüz yüklenmedi" },
            { label: "Hizmet", value: optionLabel(RFQ_SERVICES, draft.service) },
            { label: "Malzeme", value: resolveMaterialLabel(draft.material, draft.customMaterial) },
            { label: "Yüzey", value: optionLabel(RFQ_SURFACE_FINISHES, draft.finish) },
            { label: "Miktar", value: Number.isFinite(draft.quantity) ? `${draft.quantity} adet` : "—" },
            { label: "Öncelik", value: optionLabel(RFQ_PRIORITIES, draft.priority) },
          ]}
        />
      </div>

      <div>
        <p className="shell-eyebrow">TEKLİF VE TERMİN</p>
        <ShellMetaRow
          items={[
            { label: "Teklif dönüşü", value: QUOTE_RESPONSE_TIME_DISPLAY },
            { label: "Termin", value: "Teklifle birlikte" },
            { label: "Ölçüm kaydı", value: "Teslimat dosyasında" },
          ]}
        />
      </div>

      <div>
        <p className="shell-eyebrow">KALİTE</p>
        <ShellRun
          ariaLabel="Kalite güvencesi"
          items={[
            { title: CERTIFICATIONS[0].code, detail: "Sertifikalı kalite yönetim sistemi." },
            { title: "CMM ölçümü", detail: CMM_COVERAGE },
            {
              title: "Malzeme izlenebilirliği",
              detail: "Parti ve döküm kaydı; malzeme sertifikası talebe bağlı.",
            },
          ]}
        />
      </div>

      <div>
        <p className="shell-eyebrow">DOĞRUDAN HAT</p>
        <p className="shell-note">
          Dosya hazır değilse veya form yerine konuşmayı tercih ediyorsanız doğrudan yazın.
        </p>
        <ShellAction href={SALES_EMAIL_HREF} variant="ghost">
          {SALES_EMAIL}
        </ShellAction>
        <ShellAction href={PUBLIC_PHONE_HREF} variant="quiet">
          {PUBLIC_PHONE}
        </ShellAction>
      </div>
    </>
  );
}
