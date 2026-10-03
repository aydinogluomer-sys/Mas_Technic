import { Link } from "@/i18n/LocaleLink";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* English translation of `src/pages/GizlilikPolitikasi.tsx` (L01). Clause
   ids, order and cross-references are the Turkish document's own. The
   Turkish text is the governing version; owner legal review O08. */
export const PRIVACY_EN = {
  eyebrow: "Legal text",
  title: "Privacy Policy",
  lede: "What this site does with visitor data — and, more importantly, what it does not do.",
  metaDescription:
    "Mas Technic privacy policy — the information you send us, data stored in your browser, no tracking, third-party requests and the chat assistant's AI transfer.",
  clauses: [
    {
      id: "kapsam",
      title: "Scope",
      body: (
        <div className="shell-prose">
          <p>
            This policy explains how the public pages on mastechnic.com handle visitor data. The
            legal framework, purpose, transfers and your rights concerning the processing of
            personal data are in a separate document — the{" "}
            <Link to="/kvkk">Personal Data Protection Notice (KVKK)</Link> — and the two texts do
            not repeat each other.
          </p>
        </div>
      ),
    },
    {
      id: "toplanan-bilgiler",
      title: "Information you send us",
      body: (
        <div className="shell-prose">
          <p>
            The site collects no personal information unless you fill in a form. In the quote flow
            we receive your name and surname, email, company name and telephone, together with the
            technical drawing or 3D model file you upload. When you open an account your email
            address is recorded.
          </p>
          <p>
            This information is used only to prepare quotes, carry out manufacturability reviews
            and communicate with you about them. No newsletter subscription, advertising list or
            similar marketing record is kept.
          </p>
          <p>
            What you type into the chat box is not saved; but if you give consent it is sent to an
            AI service. What you type into forms follows the path in clause 05; because the chat
            transfer is separate from that path and happens only with your consent, it is described
            in a separate clause — clause 06.
          </p>
        </div>
      ),
    },
    {
      id: "tarayici-verisi",
      title: "Data stored in your browser",
      body: (
        <div className="shell-prose">
          <p>
            This site's own pages create no cookies; the only exception is the security component
            embedded on the sign-in page, set out in clause 05. Your preferences and session
            information are kept in your browser's own local storage (<code>localStorage</code> /{" "}
            <code>sessionStorage</code>) and are not sent to the server automatically with every
            request.
          </p>
          <p>
            What each record is for and how to delete it is listed item by item on the{" "}
            <Link to="/cerez-politikasi">Cookie Policy</Link> page.
          </p>
        </div>
      ),
    },
    {
      id: "izleme-yok",
      title: "Tracking and measurement",
      body: (
        <div className="shell-prose">
          <p>
            No analytics tool, tag manager, advertising pixel or session recording software runs on
            this site. No page view counts, click maps or visitor profiles are kept.
          </p>
          <p>
            This also means that no figure published on the site is based on a readership or
            popularity measurement; because no such measurement is made, no such figure is
            published.
          </p>
        </div>
      ),
    },
    {
      id: "ucuncu-taraf-istekleri",
      title: "Third-party requests",
      body: (
        <div className="shell-prose">
          <p>
            Page fonts are loaded from Google's font delivery network —{" "}
            <code>fonts.googleapis.com</code> and <code>fonts.gstatic.com</code>. This means your
            browser sends a request to those servers on every page, without you doing anything, and
            the server in question sees your IP address and browser information as a result of that
            request. No data other than the request for the font files is sent with it. The chat
            transfer in clause 06 also goes to Google; the two are separate, independent Google
            services, and that is why they are written out separately here.
          </p>
          <p>
            When you use the quote flow, the form data and the file you upload are sent to the
            site's hosting and database infrastructure.
          </p>
          <p>
            The only third-party component embedded in the pages is on the{" "}
            <Link to="/giris">sign-in page</Link>: the form is protected against automated sign-in
            attempts by hCaptcha. This component loads as soon as the page opens — you do not need
            to click anything and your consent is not asked — frames from the{" "}
            <code>hcaptcha.com</code> domain are embedded in the page, because your browser sends
            requests to those servers they see your IP address and browser information, and a
            cookie named <code>__cf_bm</code> with a lifetime of thirty minutes is created in your
            browser. All of the cookie's fields are set out in clause 01 of the{" "}
            <Link to="/cerez-politikasi">Cookie Policy</Link>. This policy cannot describe what
            happens to the data after it reaches hcaptcha.com: the limit in clause 06 applies here
            too.
          </p>
          <p>
            Apart from this, there is no embedded third-party video, map, advertising or social
            media component on the pages.
          </p>
          <p>
            The second exception deserves its own clause: if you give AI consent to the chat
            assistant, the text you write is transferred to a third party. How, and to whom, is in
            clause 06. The difference matters: that transfer happens only if you give consent,
            whereas the component on the sign-in page loads the moment you open the page.
          </p>
        </div>
      ),
    },
    {
      id: "sohbet-asistani",
      title: "Chat assistant and AI",
      body: (
        <div className="shell-prose">
          <p>
            There is a chat box in the corner of the pages other than the home page, and it works
            in two different ways. The difference is where the text you write goes. If your
            question matches the ready-made question-and-answer list embedded in the site, the
            answer is found inside your browser: in that case no request is sent anywhere.
          </p>
          <p>
            If no match is found, the assistant stops and asks you whether to use AI. Only if you
            type <strong>“Yes”</strong> — or press the Yes button that appears — is the conversation
            up to that point sent first to the site's own server function and from there to
            Google's Gemini service (<code>generativelanguage.googleapis.com</code>,{" "}
            <code>gemini-2.0-flash</code>); the answer comes from there. If you say “No” or type
            nothing, this transfer does not happen. Consent is not taken once and set aside: it is
            asked again for every new question that cannot be answered.
          </p>
          <p>
            Only the conversation text is sent with this request: your IP address, session
            information or any other data that identifies you is not transferred to Google. What
            you write is not saved to the site's database either — the function in between passes
            the message on and does not keep it. The only record the chat box leaves in your
            browser is <code>mas_chat_ai_count</code>, which counts the limit of at most 5 messages
            a day and is listed in clause 02 of the{" "}
            <Link to="/cerez-politikasi">Cookie Policy</Link>.
          </p>
          <p>
            This policy cannot describe what happens to the text after it reaches Google: that is a
            place we cannot see, and we do not write here anything we cannot verify on your behalf.
            That is why we say it plainly — do not type into the chat box any information you do
            not want to share, such as a part number, a tolerance value, the content of a technical
            drawing or your company's name. Use the <Link to="/teklif-al">quote flow</Link> for
            technical details: the data and files you leave there follow the path in clause 05 and
            are not sent to any AI service.
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
            For questions about this policy and requests concerning your personal data, you can
            write to {SALES_EMAIL}. The full list of your rights under KVKK Art. 11 is in clause 06
            of the <Link to="/kvkk">Personal Data Protection Notice (KVKK)</Link>.
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
