import { ShellAction, ShellMetaRow, ShellRun } from "@/components/shell";
import { useTranslation } from "react-i18next";
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
  NOT_SPECIFIED,
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
  const { t } = useTranslation();
  return (
    <>
      <div>
        <p className="shell-eyebrow">{t("CANLI KAYIT")}</p>
        <ShellMetaRow
          items={[
            { label: t("Dosya"), value: fileName ?? t("Henüz yüklenmedi") },
            { label: t("Hizmet"), value: t(optionLabel(RFQ_SERVICES, draft.service)) },
            { label: t("Malzeme"), value: t(resolveMaterialLabel(draft.material, draft.customMaterial)) },
            { label: t("Yüzey"), value: t(optionLabel(RFQ_SURFACE_FINISHES, draft.finish)) },
            { label: t("Miktar"), value: Number.isFinite(draft.quantity) ? t("{{count}} adet", { count: draft.quantity }) : t(NOT_SPECIFIED) },
            { label: t("Öncelik"), value: t(optionLabel(RFQ_PRIORITIES, draft.priority)) },
          ]}
        />
      </div>

      <div>
        <p className="shell-eyebrow">{t("TEKLİF VE TERMİN")}</p>
        <ShellMetaRow
          items={[
            { label: t("Teklif dönüşü"), value: t(QUOTE_RESPONSE_TIME_DISPLAY) },
            { label: t("Termin"), value: t("Teklifle birlikte") },
            { label: t("Ölçüm kaydı"), value: t("Teslimat dosyasında") },
          ]}
        />
      </div>

      <div>
        <p className="shell-eyebrow">{t("KALİTE")}</p>
        <ShellRun
          ariaLabel={t("Kalite güvencesi")}
          items={[
            /* NO ATTESTATION ADJECTIVE. `scripts/claims-gate.mjs`'s
               `attestation-adjective` rule exempts "Sertifikalı kalite yönetim
               sistemi" only when a permitted certificate token is a LITERAL on
               the same line; the code here reaches the line through the
               ledger, so the gate cannot see it — and it is right not to,
               because a variable could name any certificate at all. Naming the
               standard says the same true thing and needs no exemption. */
            { title: CERTIFICATIONS[0].code, detail: t("Kalite yönetim sistemi standardı.") },
            { title: t("CMM ölçümü"), detail: t(CMM_COVERAGE) },
            {
              title: t("Malzeme izlenebilirliği"),
              detail: t("Parti ve döküm kaydı; malzeme sertifikası talebe bağlı."),
            },
          ]}
        />
      </div>

      <div>
        <p className="shell-eyebrow">{t("DOĞRUDAN HAT")}</p>
        <p className="shell-note">
          {t("Dosya hazır değilse veya form yerine konuşmayı tercih ediyorsanız doğrudan yazın.")}
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
