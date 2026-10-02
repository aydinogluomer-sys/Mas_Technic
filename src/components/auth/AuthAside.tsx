import { PUBLIC_CITY } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   THE AUTH ASIDE — and the badge that came off it

   ── THE SECURITY BADGE IS GONE, AND NOTHING REPLACED IT ──────────────────
   This column used to end with a shield icon and the sentence

       "256-bit SSL ile korunan güvenli bağlantı"

   on `/giris`, `/sifremi-unuttum` and `/reset-password`. `IMPLEMENTATION.md`
   §7 PHASE 09 forbids it twice over and independently: "Do not claim
   encryption/security properties not verified", and, under Do not, "Add a
   security badge unless backed by reality."

   Nobody in this repository can back it, and there are three separate reasons,
   any one of which is enough:

     · THE SITE DOES NOT TERMINATE TLS. A host does. Whatever cipher suite and
       key length the connection negotiates is that host's answer and it can
       change without a commit here, so it is not this codebase's to state.
     · "256-bit SSL" NAMES A PROTOCOL THAT IS DEPRECATED. SSL was superseded by
       TLS; and "256-bit" is a symmetric key length that says nothing about the
       handshake, the certificate or the negotiated suite. It is not merely
       unverified, it is not a well-formed claim.
     · `USER_INPUTS.md` AUTHORISES NO SECURITY PROPERTY ANYWHERE.
       `src/content/claims.ts` records the neighbouring facts as WITHHELD —
       `CONFIDENTIALITY_PROMISE`: no NDA, no approved confidentiality text, no
       known retention period — and `RfqAside.tsx:32` documents that
       `/teklif-al`'s silence about encryption is DELIBERATE and must stay.
       This badge made, on three routes, exactly the claim the site's primary
       conversion surface refuses to make.

   The slot is empty because the honest replacement is nothing. A softer badge
   — "güvenli bağlantı", a padlock, "verileriniz korunuyor" — is the same
   unbacked assurance in a quieter voice, and a reader cannot check any of
   them either. What the site DOES say about the data these forms carry lives
   on `/kvkk` and `/gizlilik-politikasi`, which the form column links to, and
   those pages are written from measurements rather than from a mark.

   ── THE FOUR BENEFIT LINES BECAME THE PANEL'S OWN SECTION NAMES ──────────
   They used to read "Teklif taleplerinizi ANLIK takip edin" and
   "MÜHENDİSLERİMİZLE DOĞRUDAN iletişim kurun". Neither is checkable: nothing
   in `/musteri-paneli` is real-time, and its `Destek` tab opens a support
   record, which is not a line to an engineer. The rows below are the
   navigation of the panel the reader is signing in to, verbatim from
   `src/components/musteri/MusteriSidebar.tsx`, so every one of them is
   something the reader will actually find on the other side of the form.

   ── AND THE DECORATION WENT ──────────────────────────────────────────────
   `FloatingPaths` was mounted twice behind this column, and each instance
   builds 36 `<motion.path>` elements inside an `<svg class="text-primary">`
   (`src/components/FloatingPaths.tsx:8,24`). `color` inherits, so every node
   in both trees resolved to the legacy teal — which is the bulk of the 93
   teal nodes `/giris` was measured carrying. It is also a permanent
   `repeat: Infinity` animation running behind a credential form, and it is a
   component outside this packet's allowlist, so it could not have been
   brought into the token system here even if it belonged. The column is now
   ground, hairline and type, like every other surface in the shell.
   ══════════════════════════════════════════════════════════════════════════ */

/** Verbatim from `src/components/musteri/MusteriSidebar.tsx`. */
const PANEL_SECTIONS = [
  "Tekliflerim",
  "Siparişlerim",
  "Üretim Takip",
  "Teknik Arşiv",
  "Kalite Raporları",
  "Ödeme & Faturalar",
  "Destek",
] as const;

export type AuthAsideProps = {
  title: string;
  lede: string;
};

export function AuthAside({ title, lede }: AuthAsideProps) {
  return (
    <aside className="shell-auth-aside" aria-labelledby="auth-aside-title">
      <div className="shell-auth-aside-body">
        <p className="shell-eyebrow">MÜŞTERİ PORTALI</p>
        <div className="shell-auth-mark">
          <span className="shell-auth-mark-block" aria-hidden="true">MT</span>
          <span className="shell-auth-mark-name">
            <b>MAS TECHNIC</b>
            <small>{PUBLIC_CITY}</small>
          </span>
        </div>
        <h2 id="auth-aside-title">{title}</h2>
        <p className="shell-auth-aside-lede">{lede}</p>
        <ul className="shell-auth-list">
          {PANEL_SECTIONS.map((section, index) => (
            <li key={section}>
              <span className="shell-auth-list-no" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="shell-auth-list-label">{section}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
