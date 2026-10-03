import { Link } from "@/i18n/LocaleLink";
import { ShellSpecTable } from "@/components/shell";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* English translation of `src/pages/CerezPolitikasi.tsx` (L01). Clause ids,
   order, the storage keys and cross-references are the Turkish document's
   own. The Turkish text is the governing version; owner legal review O08. */
const STORAGE_ROWS: string[][] = [
  ["sb-…-auth-token", "localStorage", "Keeps you signed in if you have signed in.", "Until you sign out"],
  ["mas_chat_ai_count", "localStorage", "Counts the daily number of messages sent to the chat assistant.", "Until the end of the day"],
  ["mas_pending_cad_upload", "sessionStorage", "Carries the drawing you dropped on the home page over to the quote form.", "Deleted when the form takes it over"],
  [
    "mas_lang",
    "localStorage",
    "Remembers the interface language you chose (TR, EN). Written only when you press one of the language buttons; if you choose no language it is never written. On public pages the address sets the language (English pages start with /en); this record only chooses the language of the customer and admin panels.",
    "Until you delete it",
  ],
  [
    "mas-technic-theme",
    "localStorage",
    "Keeps the interface's light/dark palette. Because the notification layer loads on every page, this record is written on every page you open, not only on pages with the 3D viewer.",
    "Until you delete it",
  ],
];

export const COOKIES_EN = {
  eyebrow: "Legal text",
  title: "Cookie Policy",
  lede: "This site's own pages create no cookies; the security component on the sign-in page creates one. Every record kept in your browser is listed one by one in clause 02.",
  metaDescription:
    "Mas Technic cookie policy — the site's own pages create no cookies, the hCaptcha component on the sign-in page creates one; the local storage records kept in your browser, how long they last and how to delete them.",
  clauses: [
    {
      id: "cerez-kullanimi",
      title: "Cookies and the one exception",
      body: (
        <div className="shell-prose">
          <p>
            This site's own pages do not create cookies in your browser. There is also no
            advertising cookie, analytics cookie, tag manager, advertising pixel or session
            recording software.
          </p>
          <p>
            The one exception is the sign-in page, and it deserves its own sentence: when the{" "}
            <Link to="/giris">sign-in page</Link> opens, the hCaptcha component that protects the
            form against automated sign-in attempts loads and a cookie named <code>__cf_bm</code>{" "}
            is created in your browser. The cookie belongs to the <code>hcaptcha.com</code> domain,
            lasts thirty minutes and is marked <code>httpOnly</code> — so page scripts cannot read
            it — and it is sent only with requests to hcaptcha.com. The component loads as soon as
            the page opens; you do not need to click anything for it. What it is is set out in
            clause 03.
          </p>
          <p>
            This does not mean the site stores nothing in your browser. What it stores are not
            cookies but records in your browser's own local storage; all of them are listed in
            clause 02.
          </p>
        </div>
      ),
    },
    {
      id: "tarayici-kayitlari",
      title: "Records kept in your browser",
      body: (
        <>
          <div className="shell-doc-table">
            <ShellSpecTable
              caption="Local storage records"
              note="These records are not cookies: they are not sent automatically with every HTTP request and can be read only by this site's own pages. You can see all of them in the Application / Storage section of your browser's developer tools."
              headers={["RECORD", "STORAGE", "WHAT IT IS FOR", "DURATION"]}
              numericFrom={4}
              rows={STORAGE_ROWS}
              rowKey={(row) => String(row[0])}
            />
          </div>
          <p className="shell-note">
            None of these records serves advertising or profiling. Your browser does not send them
            anywhere on its own; the one exception is the session key — if you have signed in, it
            is added to requests to the site's hosting and database infrastructure, because that is
            what keeps you signed in. This transfer is listed in clause 04 of the{" "}
            <Link to="/kvkk">Personal Data Protection Notice (KVKK)</Link>.
          </p>
        </>
      ),
    },
    {
      id: "ucuncu-taraf",
      title: "Third-party requests",
      body: (
        <div className="shell-prose">
          <p>
            The places your browser sends requests to outside this site are listed one by one
            below. The domains here were written down by measurement: the places your browser
            actually sends requests to are listed, not addresses that appear in a component's
            settings but are never called.
          </p>
          <p>
            <strong>Fonts — on every page.</strong> Fonts are loaded from Google's font delivery
            network (<code>fonts.googleapis.com</code>, <code>fonts.gstatic.com</code>). This
            request is sent on every page, without you doing anything and without your consent
            being asked; the server sees your IP address and browser information as a result of
            the request. This request creates no cookie. The chat transfer in clause 06 also goes
            to Google, but the two are separate, independent Google services.
          </p>
          <p>
            <strong>
              Security component — only on the <Link to="/giris">sign-in page</Link>.
            </strong>{" "}
            The form is protected against automated sign-in attempts by hCaptcha. The component
            loads as soon as the page opens — without you doing anything and without your consent
            being asked — your browser sends requests to servers on the <code>hcaptcha.com</code>{" "}
            domain, frames from there are embedded in the page and the <code>__cf_bm</code> cookie
            described in clause 01 is created. If the component cannot load — for example because
            of a content blocker or a broken connection — an error log is still sent to the same
            domain; so a request goes out in the failure case as well. The servers that receive the
            request see your IP address and browser information, as with any request. What happens
            after that — what happens there — this text does not describe; we do not commit to
            anything on your behalf for a place we cannot see.
          </p>
          <p>
            <strong>Hosting and database infrastructure.</strong> The hosting and database
            infrastructure the site runs on is on a separate domain, so requests to it are also
            sent by your browser: when you sign in, request a password reset, submit the contact
            form or the quote flow, write a message in the chat box and, if you have signed in, to
            keep you signed in. The session key from clause 02 is added to these requests; if you
            are only reading the page there is no key to add. This case is also listed in clause 04
            of the <Link to="/kvkk">Personal Data Protection Notice (KVKK)</Link>.
          </p>
          <p>
            <strong>Sign-in with Google or LinkedIn — only if you press that button.</strong> If
            you press the “Google” or “LinkedIn” button on the{" "}
            <Link to="/giris">sign-in page</Link>, your browser leaves this site: first to the
            hosting and authentication infrastructure in the previous paragraph, and from there to
            the chosen provider's own sign-in page. If you do not press it, these requests never
            happen. What happens on the provider's own page is outside the scope of this text.
          </p>
          <p>
            <strong>Chat assistant — only if you give AI consent.</strong> If you give consent, the
            conversation up to that point is sent through the site's own server function to
            Google's Gemini service. It creates no cookie, but unlike the records listed here it
            does not stay in your browser — that is why exactly where it goes is written in clause
            06 of the <Link to="/gizlilik-politikasi">Privacy Policy</Link>.
          </p>
          <p>
            These are the places requests go to. Apart from these, there is no embedded third-party
            video, map, advertising or social media component on the pages.
          </p>
        </div>
      ),
    },
    {
      id: "yonetim",
      title: "Deleting the records",
      body: (
        <div className="shell-prose">
          <p>
            You can delete the records in clause 02 at any time from your browser's settings —
            “clear site data” or the Application / Storage section of the developer tools. Deleting
            them does not stop the site from working; only your open session, if any, is closed and
            the remembered preference is reset.
          </p>
          <p>
            Because the <code>__cf_bm</code> cookie in clause 01 belongs to hcaptcha.com and not to
            this site's domain, clearing this site's data does not delete it; it is deleted
            separately from your browser's cookie list, or it expires on its own within thirty
            minutes.
          </p>
          <p>
            Because there is no tracking record to delete, no separate “cookie preferences” window
            is shown either. Where no processing that needs consent takes place, a consent window
            gives no information; it only covers the page.
          </p>
        </div>
      ),
    },
    {
      id: "iletisim",
      title: "Contact",
      body: (
        <div className="shell-prose">
          <p>
            For questions about this text you can write to {SALES_EMAIL}. The framework for the
            processing of personal data is in the{" "}
            <Link to="/kvkk">Personal Data Protection Notice (KVKK)</Link>, and the site's general
            privacy behaviour is in the <Link to="/gizlilik-politikasi">Privacy Policy</Link>.
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
