import type { ReactNode } from "react";
import { ShellTitleBlock } from "@/components/shell";
import {
  RFQ_MATERIAL_GROUPS,
  RFQ_MATERIAL_OTHER,
  RFQ_PRIORITIES,
  RFQ_SERVICES,
  RFQ_SURFACE_FINISHES,
  RFQ_TOLERANCES,
  type RfqDraft,
} from "./rfq-model";
import { rfqErrorId, rfqFieldId, type RfqFieldErrors, type RfqFieldName } from "./rfq-schema";

/* ══════════════════════════════════════════════════════════════════════════
   STEP 02 — WHO IS ASKING, AND FOR WHAT

   EVERY LABEL IS PROGRAMMATICALLY ASSOCIATED, AND SO IS EVERY ERROR.
   The previous version built its four contact inputs from a `.map()` over an
   array of tuples and rendered `<label>` with no `htmlFor` and `<input>` with
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
          {hint}
        </p>
      )}
      {message && (
        <p className="shell-form-error" id={rfqErrorId(name)}>
          {message}
        </p>
      )}
    </div>
  );
}

export type RfqSpecStepProps = {
  draft: RfqDraft;
  errors: RfqFieldErrors;
  onChange: (field: RfqFieldName, value: string | number) => void;
};

export function RfqSpecStep({ draft, errors, onChange }: RfqSpecStepProps) {
  return (
    <div className="shell-stack">
      <ShellTitleBlock
        id="rfq-step-spec"
        index="02"
        title="Talep bilgileri"
        standfirst="Yıldızlı alanlar zorunludur. Geri kalanı boş bırakırsanız teklif yazılırken sorarız."
      />

      <section className="shell-form" aria-labelledby="rfq-group-contact">
        <p className="shell-eyebrow" id="rfq-group-contact">İLETİŞİM</p>
        <div className="shell-form-row">
          <Field name="name" label="Ad soyad *" errors={errors}>
            {(aria) => (
              <input
                {...aria}
                name="name"
                type="text"
                required
                autoComplete="name"
                value={draft.name}
                onChange={(event) => onChange("name", event.target.value)}
                placeholder="Satın alma / mühendislik yetkilisi"
              />
            )}
          </Field>
          <Field name="email" label="E-posta *" errors={errors}>
            {(aria) => (
              <input
                {...aria}
                name="email"
                type="email"
                required
                autoComplete="email"
                value={draft.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="ornek@firma.com"
              />
            )}
          </Field>
          <Field name="company" label="Firma *" errors={errors}>
            {(aria) => (
              <input
                {...aria}
                name="company"
                type="text"
                required
                autoComplete="organization"
                value={draft.company}
                onChange={(event) => onChange("company", event.target.value)}
                placeholder="Firma unvanı"
              />
            )}
          </Field>
          <Field name="phone" label="Telefon" errors={errors}>
            {(aria) => (
              <input
                {...aria}
                name="phone"
                type="tel"
                autoComplete="tel"
                value={draft.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="+90 5XX XXX XX XX"
              />
            )}
          </Field>
        </div>
      </section>

      <section className="shell-form" aria-labelledby="rfq-group-production">
        <p className="shell-eyebrow" id="rfq-group-production">ÜRETİM</p>
        <div className="shell-form-row">
          <Field name="service" label="Hizmet" errors={errors}>
            {(aria) => (
              <select
                {...aria}
                name="service"
                value={draft.service}
                onChange={(event) => onChange("service", event.target.value)}
              >
                {RFQ_SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field name="material" label="Malzeme" errors={errors}>
            {(aria) => (
              <select
                {...aria}
                name="material"
                value={draft.material}
                onChange={(event) => onChange("material", event.target.value)}
              >
                {RFQ_MATERIAL_GROUPS.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Listede yok">
                  <option value={RFQ_MATERIAL_OTHER}>Diğer (manuel giriş)</option>
                </optgroup>
              </select>
            )}
          </Field>
        </div>

        {draft.material === RFQ_MATERIAL_OTHER && (
          <Field
            name="customMaterial"
            label="Malzeme adı *"
            errors={errors}
            hint="Standart adı yazın, örneğin 42CrMo4 veya PEEK."
          >
            {(aria) => (
              <input
                {...aria}
                name="customMaterial"
                type="text"
                value={draft.customMaterial}
                onChange={(event) => onChange("customMaterial", event.target.value)}
                placeholder="Malzeme adını yazınız"
              />
            )}
          </Field>
        )}

        <div className="shell-form-row">
          <Field name="quantity" label="Miktar (adet) *" errors={errors}>
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
          <Field name="tolerance" label="Tolerans" errors={errors}>
            {(aria) => (
              <select
                {...aria}
                name="tolerance"
                value={draft.tolerance}
                onChange={(event) => onChange("tolerance", event.target.value)}
              >
                {RFQ_TOLERANCES.map((tolerance) => (
                  <option key={tolerance} value={tolerance}>
                    {tolerance}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <div className="shell-form-row">
          <Field name="drawingNumber" label="Parça / revizyon" errors={errors}>
            {(aria) => (
              <input
                {...aria}
                name="drawingNumber"
                type="text"
                value={draft.drawingNumber}
                onChange={(event) => onChange("drawingNumber", event.target.value)}
                placeholder="MT-042 / Rev B"
              />
            )}
          </Field>
          <Field
            name="criticalFeatures"
            label="Kritik ölçüler"
            errors={errors}
            hint="Delik ekseni, yüzey pürüzlülüğü, geçme toleransı — teklifi ne belirliyorsa."
          >
            {(aria) => (
              <input
                {...aria}
                name="criticalFeatures"
                type="text"
                value={draft.criticalFeatures}
                onChange={(event) => onChange("criticalFeatures", event.target.value)}
                placeholder="Ø12 H7 delik ekseni, Ra 0.8"
              />
            )}
          </Field>
        </div>
      </section>

      {/* Two segmented choices rather than eight tinted icon tiles. Both are
          radio groups semantically — one answer each — so they are marked as
          such instead of as eight unrelated buttons. */}
      <section className="shell-form" aria-labelledby="rfq-group-finish">
        <p className="shell-eyebrow" id="rfq-group-finish">YÜZEY İŞLEMİ</p>
        <ul className="shell-segments" aria-labelledby="rfq-group-finish">
          {RFQ_SURFACE_FINISHES.map((finish) => (
            <li key={finish.id}>
              <button
                type="button"
                className="shell-segment"
                aria-pressed={draft.finish === finish.id}
                onClick={() => onChange("finish", finish.id)}
              >
                <span className="shell-segment-code">{finish.label}</span>
                {finish.detail && <span>{finish.detail}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell-form" aria-labelledby="rfq-group-priority">
        <p className="shell-eyebrow" id="rfq-group-priority">ÖNCELİK</p>
        <ul className="shell-segments" aria-labelledby="rfq-group-priority">
          {RFQ_PRIORITIES.map((priority) => (
            <li key={priority.id}>
              <button
                type="button"
                className="shell-segment"
                aria-pressed={draft.priority === priority.id}
                onClick={() => onChange("priority", priority.id)}
              >
                <span className="shell-segment-code">{priority.label}</span>
                {priority.detail && <span>{priority.detail}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
