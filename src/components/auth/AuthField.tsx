import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authErrorId, authFieldId, type AuthFieldErrors, type AuthFieldName } from "./auth-schema";

/* ══════════════════════════════════════════════════════════════════════════
   THE WIRED AUTH FIELD

   The previous `FormField` rendered `<label>` with no `htmlFor` beside a
   `<Input>` with no `id`, so not one control on the three auth routes was
   programmatically associated with its label (WCAG 1.3.1 / 3.3.2) — the same
   defect Phase 09a fixed on `/teklif-al`, in the same shape, four routes
   apart. Passing a field NAME here is what wires all four attributes, so the
   next control somebody adds cannot be mis-associated by omission.

   The decoration also went. The old field placed a lucide icon absolutely
   inside the input and paid for it with `pl-10`; an icon that repeats the
   label in a picture adds nothing a screen reader can use and takes 40px from
   a 420px measure. The label carries the meaning.
   ══════════════════════════════════════════════════════════════════════════ */

export type AuthFieldProps = {
  name: AuthFieldName;
  label: string;
  errors: AuthFieldErrors;
  /** Rendered opposite the label — the "forgot password" link belongs here. */
  aside?: ReactNode;
  hint?: string;
  optional?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name">;

export function AuthField({
  name,
  label,
  errors,
  aside,
  hint,
  optional,
  ...input
}: AuthFieldProps) {
  const { t } = useTranslation();
  const message = errors[name];
  const id = authFieldId(name);
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [message ? authErrorId(name) : null, hintId].filter(Boolean).join(" ");

  return (
    <div className="shell-field">
      <div className="shell-auth-label-row">
        <label htmlFor={id}>
          {t(label)}
          {optional && ` ${t("(opsiyonel)")}`}
        </label>
        {aside}
      </div>
      <input
        {...input}
        placeholder={input.placeholder ? t(input.placeholder) : undefined}
        id={id}
        name={name}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {hint && (
        <p className="shell-field-hint" id={hintId}>
          {t(hint)}
        </p>
      )}
      {message && (
        <p className="shell-form-error" id={authErrorId(name)}>
          {t(message)}
        </p>
      )}
    </div>
  );
}

/**
 * The same field with a reveal toggle.
 *
 * The toggle is a real `<button>` inside the field box, not an icon with a
 * click handler: it needs a name, a pressed state and a focus ring, and it
 * needs its own 42px target rather than stealing the input's. `aria-pressed`
 * states the toggle's condition; the input's own `type` states the result.
 */
export function AuthPasswordField({
  name,
  label,
  errors,
  aside,
  hint,
  ...input
}: Omit<AuthFieldProps, "optional" | "type">) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useTranslation();
  const message = errors[name];
  const id = authFieldId(name);
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [message ? authErrorId(name) : null, hintId].filter(Boolean).join(" ");

  return (
    <div className="shell-field">
      <div className="shell-auth-label-row">
        <label htmlFor={id}>{t(label)}</label>
        {aside}
      </div>
      <div className="shell-auth-control">
        <input
          {...input}
          placeholder={input.placeholder ? t(input.placeholder) : undefined}
          id={id}
          name={name}
          type={revealed ? "text" : "password"}
          aria-invalid={message ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        <button
          type="button"
          className="shell-auth-reveal"
          onClick={() => setRevealed((current) => !current)}
          aria-label={t(revealed ? "Şifreyi gizle" : "Şifreyi göster")}
          aria-pressed={revealed}
          aria-controls={id}
        >
          {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {hint && (
        <p className="shell-field-hint" id={hintId}>
          {t(hint)}
        </p>
      )}
      {message && (
        <p className="shell-form-error" id={authErrorId(name)}>
          {t(message)}
        </p>
      )}
    </div>
  );
}
