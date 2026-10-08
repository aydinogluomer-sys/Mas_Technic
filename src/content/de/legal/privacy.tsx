import { Link } from "@/i18n/LocaleLink";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* German translation of `src/pages/GizlilikPolitikasi.tsx` (L3d). Clause ids,
   order and cross-references are the Turkish document's own. The Turkish text
   is the governing version; this translation awaits native and legal review
   (owner input O16). */
export const PRIVACY_DE = {
  eyebrow: "Rechtstext",
  title: "Datenschutzerklärung",
  lede: "Was diese Website mit Besucherdaten tut — und, wichtiger noch, was sie nicht tut.",
  metaDescription:
    "Datenschutzerklärung von Mas Technic — die Angaben, die Sie uns übermitteln, in Ihrem Browser gespeicherte Daten, kein Tracking, Anfragen an Dritte und die KI-Übermittlung des Chat-Assistenten.",
  clauses: [
    {
      id: "kapsam",
      title: "Geltungsbereich",
      body: (
        <div className="shell-prose">
          <p>
            Diese Erklärung beschreibt, wie die öffentlich zugänglichen Seiten von mastechnic.com
            mit Besucherdaten umgehen. Der rechtliche Rahmen, die Zwecke, die Übermittlungen und
            Ihre Rechte im Zusammenhang mit der Verarbeitung personenbezogener Daten sind in einem
            gesonderten Dokument — dem{" "}
            <Link to="/kvkk">Datenschutzhinweis (KVKK)</Link> — dargestellt; die beiden Texte
            wiederholen einander nicht.
          </p>
        </div>
      ),
    },
    {
      id: "toplanan-bilgiler",
      title: "Angaben, die Sie uns übermitteln",
      body: (
        <div className="shell-prose">
          <p>
            Die Website erhebt keine personenbezogenen Angaben, solange Sie kein Formular ausfüllen.
            Bei der Angebotsanfrage erhalten wir Ihren Vor- und Nachnamen, Ihre E-Mail-Adresse,
            Ihren Firmennamen und Ihre Telefonnummer sowie die von Ihnen hochgeladene technische
            Zeichnung oder 3D-Modelldatei. Wenn Sie ein Konto eröffnen, wird Ihre E-Mail-Adresse
            gespeichert.
          </p>
          <p>
            Diese Angaben werden ausschließlich verwendet, um Angebote zu erstellen,
            Fertigbarkeitsprüfungen durchzuführen und in diesem Zusammenhang mit Ihnen zu
            kommunizieren. Es werden weder Newsletter-Abonnements noch Werbelisten oder vergleichbare
            Marketingdaten geführt.
          </p>
          <p>
            Was Sie in das Chatfenster eingeben, wird nicht gespeichert; mit Ihrer Einwilligung wird
            es jedoch an einen KI-Dienst weitergeleitet. Was Sie in Formulare eingeben, folgt dem in
            Abschnitt 05 beschriebenen Weg; da die Chat-Übermittlung von diesem Weg getrennt ist und
            nur mit Ihrer Einwilligung erfolgt, wird sie in einem eigenen Abschnitt — Abschnitt 06 —
            beschrieben.
          </p>
        </div>
      ),
    },
    {
      id: "tarayici-verisi",
      title: "In Ihrem Browser gespeicherte Daten",
      body: (
        <div className="shell-prose">
          <p>
            Die eigenen Seiten dieser Website setzen keine Cookies; die einzige Ausnahme ist die in
            die Anmeldeseite eingebettete Sicherheitskomponente, die in Abschnitt 05 beschrieben
            ist. Ihre Einstellungen und Sitzungsinformationen werden im lokalen Speicher Ihres
            Browsers (<code>localStorage</code> /{" "}
            <code>sessionStorage</code>) abgelegt und nicht automatisch mit jeder Anfrage an den
            Server gesendet.
          </p>
          <p>
            Wozu jeder Eintrag dient und wie er gelöscht werden kann, ist auf der Seite{" "}
            <Link to="/cerez-politikasi">Cookie-Richtlinie</Link> einzeln aufgeführt.
          </p>
        </div>
      ),
    },
    {
      id: "izleme-yok",
      title: "Tracking und Reichweitenmessung",
      body: (
        <div className="shell-prose">
          <p>
            Auf dieser Website laufen keine Analysewerkzeuge, kein Tag-Manager, keine Werbepixel und
            keine Software zur Sitzungsaufzeichnung. Es werden weder Seitenaufrufzahlen noch
            Klickkarten oder Besucherprofile erfasst.
          </p>
          <p>
            Das bedeutet auch, dass keine auf der Website veröffentlichte Zahl auf einer Messung von
            Lesern oder Beliebtheit beruht; da keine solche Messung stattfindet, wird auch keine
            solche Zahl veröffentlicht.
          </p>
        </div>
      ),
    },
    {
      id: "ucuncu-taraf-istekleri",
      title: "Anfragen an Dritte",
      body: (
        <div className="shell-prose">
          <p>
            Die Schriftarten der Seiten werden vom eigenen Server dieser Website geladen; für
            Schriftarten wird keine Anfrage an einen Server eines Dritten gesendet.
          </p>
          <p>
            Wenn Sie die Angebotsanfrage nutzen, werden die Formulardaten und die von Ihnen
            hochgeladene Datei an die Hosting- und Datenbankinfrastruktur der Website übermittelt.
          </p>
          <p>
            Die einzige in die Seiten eingebettete Komponente eines Dritten befindet sich auf der{" "}
            <Link to="/giris">Anmeldeseite</Link>: Das Formular ist durch hCaptcha gegen
            automatisierte Anmeldeversuche geschützt. Diese Komponente wird geladen, sobald die
            Seite geöffnet wird — Sie müssen nichts anklicken, und Ihre Einwilligung wird nicht
            eingeholt —, dabei werden Frames der Domain{" "}
            <code>hcaptcha.com</code> in die Seite eingebettet, diese Server sehen Ihre IP-Adresse
            und Browserinformationen, weil Ihr Browser Anfragen an sie sendet, und in Ihrem Browser
            wird ein Cookie namens <code>__cf_bm</code> mit einer Lebensdauer von dreißig Minuten
            gesetzt. Sämtliche Felder dieses Cookies sind in Abschnitt 01 der{" "}
            <Link to="/cerez-politikasi">Cookie-Richtlinie</Link> aufgeführt. Was mit den Daten
            geschieht, nachdem sie hcaptcha.com erreicht haben, kann diese Erklärung nicht
            beschreiben: Die in Abschnitt 06 genannte Grenze gilt auch hier.
          </p>
          <p>
            Darüber hinaus sind in die Seiten keine Video-, Karten-, Werbe- oder
            Social-Media-Komponenten Dritter eingebettet.
          </p>
          <p>
            Die zweite Ausnahme verdient einen eigenen Abschnitt: Wenn Sie dem Chat-Assistenten Ihre
            Einwilligung zur KI-Nutzung erteilen, wird der von Ihnen geschriebene Text an einen
            Dritten übermittelt. Wie und an wen, steht in Abschnitt 06. Der Unterschied ist
            wesentlich: Diese Übermittlung erfolgt nur, wenn Sie einwilligen, während die
            Komponente auf der Anmeldeseite in dem Moment geladen wird, in dem Sie die Seite öffnen.
          </p>
        </div>
      ),
    },
    {
      id: "sohbet-asistani",
      title: "Chat-Assistent und KI",
      body: (
        <div className="shell-prose">
          <p>
            Auf allen Seiten außer der Startseite befindet sich in der Ecke ein Chatfenster, das auf
            zwei unterschiedliche Arten arbeitet. Der Unterschied liegt darin, wohin der von Ihnen
            geschriebene Text gelangt. Stimmt Ihre Frage mit der in die Website eingebetteten Liste
            vorbereiteter Fragen und Antworten überein, wird die Antwort innerhalb Ihres Browsers
            gefunden: In diesem Fall wird keinerlei Anfrage gesendet.
          </p>
          <p>
            Wird keine Übereinstimmung gefunden, hält der Assistent an und fragt Sie, ob KI
            verwendet werden soll. Nur wenn Sie <strong>„Ja“</strong> eingeben — oder die
            erscheinende Schaltfläche „Ja“ drücken —, wird der bisherige Gesprächsverlauf zunächst
            an die eigene Serverfunktion der Website und von dort an den Dienst Gemini von Google
            (<code>generativelanguage.googleapis.com</code>,{" "}
            <code>gemini-2.0-flash</code>) übermittelt; die Antwort kommt von dort. Wenn Sie „Nein“
            sagen oder nichts eingeben, findet diese Übermittlung nicht statt. Die Einwilligung wird
            nicht einmalig eingeholt und dann beiseitegelegt: Sie wird bei jeder neuen Frage, die
            nicht beantwortet werden kann, erneut erfragt.
          </p>
          <p>
            Mit dieser Anfrage wird ausschließlich der Gesprächstext gesendet: Ihre IP-Adresse, Ihre
            Sitzungsinformationen oder sonstige Daten, die Sie identifizieren, werden nicht an
            Google übermittelt. Was Sie schreiben, wird auch nicht in der Datenbank der Website
            gespeichert — die zwischengeschaltete Funktion leitet die Nachricht weiter und behält
            sie nicht. Der einzige Eintrag, den das Chatfenster in Ihrem Browser hinterlässt, ist{" "}
            <code>mas_chat_ai_count</code>, der das Limit von höchstens 5 Nachrichten pro Tag zählt
            und in Abschnitt 02 der{" "}
            <Link to="/cerez-politikasi">Cookie-Richtlinie</Link> aufgeführt ist.
          </p>
          <p>
            Was mit dem Text geschieht, nachdem er Google erreicht hat, kann diese Erklärung nicht
            beschreiben: Das ist ein Bereich, den wir nicht einsehen können, und wir schreiben hier
            nichts, was wir nicht für Sie überprüfen können. Deshalb sagen wir es deutlich — geben
            Sie keine Informationen in das Chatfenster ein, die Sie nicht teilen möchten, etwa eine
            Teilenummer, einen Toleranzwert, den Inhalt einer technischen Zeichnung oder den Namen
            Ihres Unternehmens. Nutzen Sie für technische Details die{" "}
            <Link to="/teklif-al">Angebotsanfrage</Link>: Die dort hinterlegten Daten und Dateien
            folgen dem in Abschnitt 05 beschriebenen Weg und werden an keinen KI-Dienst gesendet.
          </p>
        </div>
      ),
    },
    {
      id: "iletisim",
      title: "Kontakt",
      body: (
        <div className="shell-prose">
          <p>
            Fragen zu dieser Erklärung und Anliegen zu Ihren personenbezogenen Daten können Sie an{" "}
            {SALES_EMAIL} richten. Die vollständige Liste Ihrer Rechte nach Art. 11 KVKK finden Sie
            in Abschnitt 06 des Dokuments <Link to="/kvkk">Datenschutzhinweis (KVKK)</Link>.
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
