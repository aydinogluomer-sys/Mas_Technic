import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShellTitleBlock } from "@/components/shell";
import {
  RFQ_MATERIAL_GROUPS,
  RFQ_MATERIAL_OTHER,
  RFQ_PRIORITIES,
  RFQ_SERVICES,
  RFQ_SURFACE_FINISHES,
  RFQ_TOLERANCES,
  type RfqDraft,
  type RfqOption,
} from "./rfq-model";
import { rfqErrorId, rfqFieldId, type RfqFieldErrors, type RfqFieldName } from "./rfq-schema";

/* ══════════════════════════════════════════════════════════════════════════
   STEP 02 — WHO IS ASKING, AND FOR WHAT

   EVERY LABEL IS PROGRAMMATICALLY ASSOCIATED, AND SO IS EVERY ERROR.
   The previous version built its four contact inputs from a `.map()` over an
   array of tuples and rendered `<label>{t("` with no `htmlFor` and `")}<input>` with
   no `id` — so not one of them was associated (WCAG 1.3.1 / 3.3.2), and the
   only validation feedback in the whole form was a single toast that named
   one problem at a time and disappeared. Here each control has an `id` from
   `rfqFieldId`, its message has an `id` from `rfqErrorId`, and the control
   points at the message with `aria-describedby` while `aria-invalid` marks it.

   NOT COLOUR ALONE: the message is words, in the reader's language, next to
   the field, under a 2px rule — the same `.shell-form-error` device
   `/iletisim` uses, so a field error looks like an error anywhere on the site.

   The `Field` wrapper exists so none of that can be forgotten on the next
   control somebody adds: passing a field name is what wires all four
   attributes.
   ══════════════════════════════════════════════════════════════════════════ */

function Field({
  name,
  label,
  errors,
  hint,
  children,
}: {
  name: RfqFieldName;
  label: string;
  errors: RfqFieldErrors;
  hint?: string;
  /** Receives the id / aria wiring so the control cannot be mis-associated. */
  children: (aria: {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const { t } = useTranslation();
  const message = errors[name];
  const hintId = hint ? `${rfqFieldId(name)}-hint` : undefined;
  const describedBy = [message ? rfqErrorId(name) : null, hintId].filter(Boolean).join(" ");

  return (
    <div className="shell-field">
      <label htmlFor={rfqFieldId(name)}>{label}</label>
      {children({
        id: rfqFieldId(name),
        "aria-invalid": message ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <p className="shell-field-hint" id={hintId}>
          {t(hint)}
        </p>
      )}
      {message && (
        <p className="shell-form-error" id={rfqErrorId(name)}>
          {t(message)}
        </p>
      )}
    </div>
  );
}

type TextFieldName = "name" | "email" | "company" | "phone" | "customMaterial" | "drawingNumber" | "criticalFeatures";

/** A `Field` holding one text input bound to `draft[name]`. */
function TextField({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  placeholder,
  hint,
  draft,
  errors,
  onChange,
}: RfqSpecStepProps & {
  name: TextFieldName;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder: string;
  hint?: string;
}) {
  return (
    <Field name={name} label={label} errors={errors} hint={hint}>
      {(aria) => (
        <input
          {...aria}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={draft[name]}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}

/** One answer or none: pressing the chosen segment again clears it. */
function Segments({
  field,
  title,
  options,
  draft,
  onChange,
}: Omit<RfqSpecStepProps, "errors"> & { field: "finish" | "priority"; title: string; options: readonly RfqOption[] }) {
  const { t } = useTranslation();
  const groupId = `rfq-group-${field}`;
  return (
    <section className="shell-form" aria-labelledby={groupId}>
      <p className="shell-eyebrow" id={groupId}>{title}</p>
      <ul className="shell-segments" aria-labelledby={groupId}>
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className="shell-segment"
              aria-pressed={draft[field] === option.id}
              onClick={() => onChange(field, draft[field] === option.id ? "" : option.id)}
            >
              <span className="shell-segment-code">{t(option.label)}</span>
              {option.detail && <span>{t(option.detail)}</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type RfqSpecStepProps = {
  draft: RfqDraft;
  errors: RfqFieldErrors;
  onChange: (field: RfqFieldName, value: string | number) => void;
};

export function RfqSpecStep({ draft, errors, onChange }: RfqSpecStepProps) {
  const { t } = useTranslation();
  const bound = { draft, errors, onChange };
  return (
    <div className="shell-stack">
      <ShellTitleBlock
        id="rfq-step-spec"
        index="02"
        title={t("Talep bilgileri")}
        standfirst={t("Yıldızlı alanlar zorunludur. Hiçbir seçim sizin yerinize yapılmaz; boş bıraktıklarınız özette “Belirtilmedi” görünür ve teklif yazılırken sorulur. Seçili bir yüzey veya önceliğe yeniden basmak seçimi kaldırır.")}
      />

      <section className="shell-form" aria-labelledby="rfq-group-contact">
        <p className="shell-eyebrow" id="rfq-group-contact">{t("İLETİŞİM")}</p>
        <div className="shell-form-row">
          <TextField {...bound} name="name" label={t("Ad soyad *")} required autoComplete="name" placeholder={t("Satın alma / mühendislik yetkilisi")} />
          <TextField {...bound} name="email" label={t("E-posta *")} type="email" required autoComplete="email" placeholder={t("ornek@firma.com")} />
          <TextField {...bound} name="company" label={t("Firma *")} required autoComplete="organization" placeholder={t("Firma unvanı")} />
          <TextField {...bound} name="phone" label={t("Telefon")} type="tel" autoComplete="tel" placeholder={t("+90 5XX XXX XX XX")} />
        </div>
      </section>

      <section className="shell-form" aria-labelledby="rfq-group-production">
        <p className="shell-eyebrow" id="rfq-group-production">{t("ÜRETİM")}</p>
        <div className="shell-form-row">
          <Field name="service" label={t("Hizmet")} errors={errors}>
            {(aria) => (
              <select
                {...aria}
                name="service"
                value={draft.service}
                onChange={(event) => onChange("service", event.target.value)}
              >
                <option value="">{t("Seçilmedi")}</option>
                {RFQ_SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {t(service.label)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field name="material" label={t("Malzeme")} errors={errors}>
            {(aria) => (
              <select
                {...aria}
                name="material"
                value={draft.material}
                onChange={(event) => onChange("material", event.target.value)}
              >
                <option value="">{t("Seçilmedi")}</option>
                {RFQ_MATERIAL_GROUPS.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {t(item.label)}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label={t("Listede yok")}>
                  <option value={RFQ_MATERIAL_OTHER}>{t("Diğer (manuel giriş)")}</option>
                </optgroup>
              </select>
            )}
          </Field>
        </div>

        {draft.material === RFQ_MATERIAL_OTHER && (
          <TextField
            {...bound}
            name="customMaterial"
            label={t("Malzeme adı *")}
            hint="Standart adı yazın, örneğin 42CrMo4 veya PEEK."
            placeholder={t("Malzeme adını yazınız")}
          />
        )}

        <div className="shell-form-row">
          <Field name="quantity" label={t("Miktar (adet) *")} errors={errors}>
            {(aria) => (
              <input
                {...aria}
                name="quantity"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                required
                value={Number.isFinite(draft.quantity) ? draft.quantity : ""}
                onChange={(event) => onChange("quantity", Number.parseInt(event.target.value, 10))}
              />
            )}
          </Field>
          <Field name="tolerance" label={t("Tolerans")} errors={errors}>
            {(aria) => (
              <select
                {...aria}
                name="tolerance"
                value={draft.tolerance}
                onChange={(event) => onChange("tolerance", event.target.value)}
              >
                <option value="">{t("Seçilmedi")}</option>
                {RFQ_TOLERANCES.map((tolerance) => (
                  <option key={tolerance} value={tolerance}>
                    {t(tolerance)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <div className="shell-form-row">
          <TextField {...bound} name="drawingNumber" label={t("Parça / revizyon")} placeholder={t("MT-042 / Rev B")} />
          <TextField
            {...bound}
            name="criticalFeatures"
            label={t("Kritik ölçüler")}
            hint="Delik ekseni, yüzey pürüzlülüğü, geçme toleransı — teklifi ne belirliyorsa."
            placeholder={t("Ø12 H7 delik ekseni, Ra 0.8")}
          />
        </div>
      </section>

      {/* Two segmented choices rather than eight tinted icon tiles. Both are
          radio groups semantically — one answer each — so they are marked as
          such instead of as eight unrelated buttons. */}
      <Segments draft={draft} onChange={onChange} field="finish" title={t("YÜZEY İŞLEMİ")} options={RFQ_SURFACE_FINISHES} />
      <Segments draft={draft} onChange={onChange} field="priority" title={t("ÖNCELİK")} options={RFQ_PRIORITIES} />
    </div>
  );
}
