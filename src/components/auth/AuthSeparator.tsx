import { useTranslation } from "react-i18next";

/* The rule between the social buttons and the e-mail form.

   The construction is `.shell-divider`'s — a hairline with a reading sitting
   on it — with a word instead of a measurement. The two rules are CSS
   pseudo-elements, so only the word reaches the accessibility tree, and the
   word is NOT `aria-hidden`: "or by e-mail" is the sentence that tells a
   screen-reader user the form below is an alternative to the two buttons
   above rather than a second step after them. The old version hid it inside
   an `absolute inset-0` decoration stack and left the reader to infer it. */
export const AuthSeparator = () => {
  const { t } = useTranslation();
  return (
    <p className="shell-auth-rule">
      <span>{t("veya e-posta ile")}</span>
    </p>
  );
};
