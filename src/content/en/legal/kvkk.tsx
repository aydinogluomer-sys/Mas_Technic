import { Link } from "@/i18n/LocaleLink";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { PUBLIC_ADDRESS_LINES, SALES_EMAIL } from "@/content/claims";

/* English translation of `src/pages/KVKK.tsx` (L01). Clause ids, order and
   cross-references are the Turkish document's own. The Turkish text is the
   governing version; this translation awaits the owner's legal review
   (owner input O08). */
export const KVKK_EN = {
  eyebrow: "Legal text",
  title: "Personal Data Protection Notice (KVKK)",
  lede: "Under Turkish Law No. 6698 on the Protection of Personal Data: which personal data this site processes, for what purpose and on what legal basis.",
  metaDescription:
    "Mas Technic personal data protection notice under KVKK — personal data processed, purpose and legal basis, transfers, retention and your rights under Article 11.",
  clauses: [
    {
      id: "veri-sorumlusu",
      title: "Data controller",
      body: (
        <div className="shell-prose">
          <p>
            Under Law No. 6698 on the Protection of Personal Data (KVKK), the data controller is
            <strong> Mas Technic Makine Sanayi Ltd. Şti.</strong>
          </p>
          <p>
            {PUBLIC_ADDRESS_LINES.join(" ")} · {SALES_EMAIL}
          </p>
        </div>
      ),
    },
    {
      id: "islenen-veriler",
      title: "Personal data processed",
      body: (
        <div className="shell-prose">
          <p>
            On this site personal data is processed only to the extent you provide it. On the quote
            form we receive your name and surname, email, company name and telephone; the technical
            drawings or 3D model files you upload with the quote; and, when you open an account,
            your email address.
          </p>
          <p>
            If the content of a file you upload carries personal data — for example a name in the
            drawing's title block — that data is also within the scope of this notice.
          </p>
          <p>
            The same rule applies to the text you type into the chat box in the corner of the
            pages: if what you write carries a name, a telephone number or a company name, that
            data is also within the scope of this notice. Chat text is not saved to the site's
            database; it leaves the site only if you give AI consent, and that transfer is set out
            in clause 04.
          </p>
        </div>
      ),
    },
    {
      id: "amac-ve-hukuki-sebep",
      title: "Purpose and legal basis of processing",
      body: (
        <div className="shell-prose">
          <p>
            Data is processed to prepare quotes, carry out manufacturability reviews, run the order
            and production process, issue invoices and communicate with you about these matters.
          </p>
          <p>
            The legal basis is that processing is directly related to the formation or performance
            of a contract under KVKK Art. 5/2-c, and the fulfilment of a legal obligation under Art.
            5/2-ç. No processing takes place outside these purposes; no profiling for marketing and
            no automated decision-making is applied.
          </p>
        </div>
      ),
    },
    {
      id: "aktarim",
      title: "Transfer",
      body: (
        <div className="shell-prose">
          <p>
            Your personal data is not sold and is not passed to third parties for marketing.
            Transfer takes place only in the cases listed one by one below.
          </p>
          <p>
            <strong>Legal request.</strong> A request based on law from authorised public
            institutions and bodies.
          </p>
          <p>
            <strong>Hosting and database.</strong> The service provider of the hosting and database
            infrastructure used to run this site.
          </p>
          <p>
            <strong>Font delivery network — on every page.</strong> The site's fonts are loaded
            from Google's font delivery network (<code>fonts.googleapis.com</code>,{" "}
            <code>fonts.gstatic.com</code>). Your browser sends a request to these servers on every
            page, and with that request your IP address and browser information reach them. Your
            consent is neither asked for nor obtained for this case: the request is sent as the
            page opens, without you doing anything. The chat assistant case below also goes to
            Google; the two are separate, independent Google services.
          </p>
          <p>
            <strong>Security component on the sign-in page.</strong> When you open the{" "}
            <Link to="/giris">sign-in page</Link>, the hCaptcha component that protects the form
            against automated sign-in attempts is loaded; your browser sends a request to servers
            on the <code>hcaptcha.com</code> domain, and with that request your IP address and
            browser information reach those servers. Your consent is neither asked for nor obtained
            for this case: the component loads as soon as the page opens, without you doing
            anything. The cookie it leaves in your browser and all of the component's domains are
            set out in clauses 01 and 03 of the <Link to="/cerez-politikasi">Cookie Policy</Link>.
          </p>
          <p>
            <strong>Chat assistant — only if you give consent.</strong> If you give AI consent in
            the chat assistant, the conversation up to that point is sent through the site's own
            server function to Google's Gemini service. If you do not give consent, this transfer
            never happens. The only thing transferred is the conversation text: your IP address,
            session information or any other data that identifies you is not sent, because the
            server function in between does not forward your browser's headers. The text is not
            saved to the site's database either. How the transfer happens step by step is in
            clause 06 of the <Link to="/gizlilik-politikasi">Privacy Policy</Link>.
          </p>
          <p>
            <strong>Sign-in with Google or LinkedIn — only if you press that button.</strong> If
            you press the “Google” or “LinkedIn” button on the{" "}
            <Link to="/giris">sign-in page</Link>, your browser leaves the site: first to the
            hosting and authentication infrastructure above, and from there to the chosen
            provider's own sign-in page. If you do not press the button, this redirection never
            happens. This notice does not describe which data is processed on the provider's own
            page; that is the subject of that provider's own privacy notice.
          </p>
          <p>
            <strong>Passing a job to a supplier — with your knowledge.</strong> If a technical file
            needs to be sent to a third-party supplier to carry out a job, this is done only with
            your knowledge.
          </p>
          <p>
            These are the cases in which transfer takes place. This document says nothing about
            what happens to data after it reaches a third party: that is a place we cannot see, and
            we do not write here anything we cannot verify on your behalf. So do not type into the
            chat box any information you do not want to share; use the quote flow for technical
            details — the data and files you leave there are not sent to any AI service.
          </p>
        </div>
      ),
    },
    {
      id: "saklama",
      title: "Retention",
      body: (
        <div className="shell-prose">
          <p>
            Personal data is kept for as long as it is needed for the purpose for which it is
            processed and for as long as the retention obligations laid down by the relevant
            legislation continue; when that period ends it is deleted, destroyed or anonymised.
          </p>
          <p>
            This notice does not commit to a specific number of days or a fixed destruction
            schedule. If you want your data deleted, you can request it by exercising your right in
            clause 06.
          </p>
        </div>
      ),
    },
    {
      id: "haklariniz",
      title: "Your rights (KVKK Art. 11)",
      body: (
        <div className="shell-prose">
          <p>
            Under Article 11 of the Law, you have the right to learn whether your personal data is
            processed; to request information about it if it has been processed; to learn the
            purpose of processing and whether it is used in line with that purpose; to know the
            third parties in Turkey or abroad to whom it has been transferred; to ask for it to be
            corrected if it has been processed incompletely or incorrectly; to ask for it to be
            deleted or destroyed; to ask for corrections and deletions to be notified to the third
            parties to whom it has been transferred; to object to a result against you arising from
            the analysis of processed data exclusively by automated systems; and to claim
            compensation if you suffer damage because of unlawful processing.
          </p>
        </div>
      ),
    },
    {
      id: "basvuru",
      title: "Application",
      body: (
        <div className="shell-prose">
          <p>
            You can send your requests concerning these rights to {SALES_EMAIL}. Your application
            must clearly include information that identifies you and the subject of your request.
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
