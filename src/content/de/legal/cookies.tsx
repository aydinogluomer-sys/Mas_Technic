import { Link } from "@/i18n/LocaleLink";
import { ShellSpecTable } from "@/components/shell";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* German translation of `src/pages/CerezPolitikasi.tsx` (L3d). Clause ids,
   order and cross-references are the Turkish document's own. The Turkish
   text is the governing version; this translation awaits native and legal
   review (owner input O16). */
const STORAGE_ROWS: string[][] = [
  ["sb-…-auth-token", "localStorage", "Hält Ihre Sitzung aufrecht, sofern Sie sich angemeldet haben.", "Bis zur Abmeldung"],
  ["mas_chat_ai_count", "localStorage", "Zählt die Anzahl der täglich an den Chat-Assistenten gesendeten Nachrichten.", "Bis zum Ende des Tages"],
  ["mas_pending_cad_upload", "sessionStorage", "Überträgt die Zeichnung, die Sie auf der Startseite abgelegt haben, in das Angebotsformular.", "Wird gelöscht, sobald das Formular sie übernimmt"],
  [
    "mas_lang",
    "localStorage",
    "Speichert die von Ihnen gewählte Sprache der Benutzeroberfläche (TR, EN). Wird nur geschrieben, wenn Sie eine der Sprachschaltflächen betätigen; wählen Sie keine Sprache, wird dieser Eintrag nie geschrieben. Auf öffentlichen Seiten bestimmt die Adresse die Sprache (englische Seiten beginnen mit /en); dieser Eintrag legt nur die Sprache des Kunden- und des Verwaltungsbereichs fest.",
    "Bis Sie ihn löschen",
  ],
  [
    "mas-technic-theme",
    "localStorage",
    "Speichert die helle/dunkle Farbgebung der Benutzeroberfläche. Da die Benachrichtigungsebene auf jeder Seite geladen wird, wird dieser Eintrag auf jeder von Ihnen aufgerufenen Seite geschrieben, nicht nur auf Seiten mit dem 3D-Viewer.",
    "Bis Sie ihn löschen",
  ],
];

export const COOKIES_DE = {
  eyebrow: "Rechtstext",
  title: "Cookie-Richtlinie",
  lede: "Die eigenen Seiten dieser Website setzen keine Cookies; die Sicherheitskomponente auf der Anmeldeseite setzt eines. Alle in Ihrem Browser gespeicherten Einträge sind in Abschnitt 02 einzeln aufgeführt.",
  metaDescription:
    "Cookie-Richtlinie von Mas Technic — die eigenen Seiten der Website setzen keine Cookies, die hCaptcha-Komponente auf der Anmeldeseite setzt ein Cookie; die in Ihrem Browser gespeicherten Einträge im lokalen Speicher, ihre Speicherdauer und wie Sie sie löschen.",
  clauses: [
    {
      id: "cerez-kullanimi",
      title: "Cookies und die einzige Ausnahme",
      body: (
        <div className="shell-prose">
          <p>
            Die eigenen Seiten dieser Website setzen in Ihrem Browser keine Cookies. Es gibt auch
            keine Werbe-Cookies, keine Analyse-Cookies, keinen Tag-Manager, kein Werbepixel und
            keine Software zur Sitzungsaufzeichnung.
          </p>
          <p>
            Die einzige Ausnahme ist die Anmeldeseite, und sie verdient einen eigenen Satz: Wenn
            die{" "}
            <Link to="/giris">Anmeldeseite</Link> geöffnet wird, lädt die hCaptcha-Komponente, die
            das Formular vor automatisierten Anmeldeversuchen schützt, und in Ihrem Browser wird
            ein Cookie namens <code>__cf_bm</code>{" "}
            gesetzt. Das Cookie gehört zur Domain <code>hcaptcha.com</code>, hat eine Lebensdauer
            von dreißig Minuten und ist als <code>httpOnly</code> gekennzeichnet — Skripte der
            Seite können es also nicht lesen — und es wird nur mit Anfragen an hcaptcha.com
            gesendet. Die Komponente lädt, sobald die Seite geöffnet wird; Sie müssen dafür nichts
            anklicken. Worum es sich dabei handelt, ist in Abschnitt 03 dargelegt.
          </p>
          <p>
            Das bedeutet nicht, dass die Website nichts in Ihrem Browser speichert. Was sie
            speichert, sind keine Cookies, sondern Einträge im lokalen Speicher Ihres Browsers;
            sie alle sind in Abschnitt 02 aufgeführt.
          </p>
        </div>
      ),
    },
    {
      id: "tarayici-kayitlari",
      title: "In Ihrem Browser gespeicherte Einträge",
      body: (
        <>
          <div className="shell-doc-table">
            <ShellSpecTable
              caption="Einträge im lokalen Speicher"
              note="Diese Einträge sind keine Cookies: Sie werden nicht automatisch mit jeder HTTP-Anfrage gesendet und können nur von den eigenen Seiten dieser Website gelesen werden. Sie können sie alle im Bereich „Anwendung / Speicher“ der Entwicklertools Ihres Browsers einsehen."
              headers={["EINTRAG", "SPEICHER", "ZWECK", "SPEICHERDAUER"]}
              numericFrom={4}
              rows={STORAGE_ROWS}
              rowKey={(row) => String(row[0])}
            />
          </div>
          <p className="shell-note">
            Keiner dieser Einträge dient der Werbung oder der Profilbildung. Ihr Browser sendet
            sie nicht von sich aus an andere Stellen; die einzige Ausnahme ist der
            Sitzungsschlüssel — sofern Sie sich angemeldet haben, wird er Anfragen an die Hosting-
            und Datenbankinfrastruktur der Website beigefügt, denn er hält Ihre Sitzung aufrecht.
            Diese Übermittlung ist in Abschnitt 04 des{" "}
            <Link to="/kvkk">Datenschutzhinweises (KVKK)</Link> aufgeführt.
          </p>
        </>
      ),
    },
    {
      id: "ucuncu-taraf",
      title: "Anfragen an Drittanbieter",
      body: (
        <div className="shell-prose">
          <p>
            Die Stellen außerhalb dieser Website, an die Ihr Browser Anfragen sendet, sind im
            Folgenden einzeln aufgeführt. Die hier genannten Domains wurden durch Messung
            ermittelt: Aufgeführt sind die Stellen, an die Ihr Browser tatsächlich Anfragen sendet,
            nicht Adressen, die zwar in den Einstellungen einer Komponente vorkommen, aber nie
            aufgerufen werden.
          </p>
          <p>
            <strong>Schriftarten.</strong> Schriftarten werden vom eigenen Server dieser Website
            geladen; für Schriftarten wird keine Anfrage an den Server eines Drittanbieters
            gesendet und kein Cookie gesetzt.
          </p>
          <p>
            <strong>
              Sicherheitskomponente — nur auf der <Link to="/giris">Anmeldeseite</Link>.
            </strong>{" "}
            Das Formular wird durch hCaptcha vor automatisierten Anmeldeversuchen geschützt. Die
            Komponente lädt, sobald die Seite geöffnet wird — ohne Ihr Zutun und ohne dass Ihre
            Einwilligung eingeholt wird —, Ihr Browser sendet Anfragen an Server der Domain{" "}
            <code>hcaptcha.com</code>, von dort werden Frames in die Seite eingebettet, und das
            in Abschnitt 01 beschriebene Cookie <code>__cf_bm</code> wird gesetzt. Kann die
            Komponente nicht geladen werden — etwa wegen eines Inhaltsblockers oder einer
            unterbrochenen Verbindung —, wird dennoch ein Fehlerprotokoll an dieselbe Domain
            gesendet; auch im Fehlerfall geht also eine Anfrage hinaus. Die Server, die die Anfrage
            empfangen, sehen wie bei jeder Anfrage Ihre IP-Adresse und Ihre Browserinformationen.
            Was danach geschieht — was dort geschieht —, beschreibt dieser Text nicht; für eine
            Stelle, die wir nicht einsehen können, sagen wir in Ihrem Namen nichts zu.
          </p>
          <p>
            <strong>Hosting- und Datenbankinfrastruktur.</strong> Die Hosting- und
            Datenbankinfrastruktur, auf der die Website läuft, befindet sich unter einer eigenen
            Domain; daher sendet auch Ihr Browser die Anfragen dorthin: wenn Sie sich anmelden,
            ein Zurücksetzen des Passworts anfordern, das Kontaktformular oder den Angebotsprozess
            absenden, eine Nachricht in das Chatfeld schreiben und, sofern Sie sich angemeldet
            haben, um Ihre Sitzung aufrechtzuerhalten. Der Sitzungsschlüssel aus Abschnitt 02 wird
            diesen Anfragen beigefügt; wenn Sie die Seite nur lesen, gibt es keinen Schlüssel, der
            beigefügt werden könnte. Dieser Fall ist ebenfalls in Abschnitt 04 des{" "}
            <Link to="/kvkk">Datenschutzhinweises (KVKK)</Link> aufgeführt.
          </p>
          <p>
            <strong>Anmeldung mit Google oder LinkedIn — nur wenn Sie diese Schaltfläche betätigen.</strong> Wenn
            Sie auf der{" "}
            <Link to="/giris">Anmeldeseite</Link> die Schaltfläche „Google“ oder „LinkedIn“
            betätigen, verlässt Ihr Browser diese Website: zunächst zur Hosting- und
            Authentifizierungsinfrastruktur aus dem vorigen Absatz und von dort zur eigenen
            Anmeldeseite des gewählten Anbieters. Betätigen Sie sie nicht, finden diese Anfragen
            nie statt. Was auf der eigenen Seite des Anbieters geschieht, liegt außerhalb des
            Geltungsbereichs dieses Textes.
          </p>
          <p>
            <strong>Chat-Assistent — nur wenn Sie in die KI-Nutzung einwilligen.</strong> Wenn Sie
            einwilligen, wird der bis dahin geführte Gesprächsverlauf über die eigene
            Serverfunktion der Website an den Dienst Gemini von Google übermittelt. Dabei wird kein
            Cookie gesetzt, doch anders als die hier aufgeführten Einträge verbleibt der Verlauf
            nicht in Ihrem Browser — deshalb ist in Abschnitt 06 der{" "}
            <Link to="/gizlilik-politikasi">Datenschutzerklärung</Link> genau beschrieben, wohin er
            gelangt.
          </p>
          <p>
            Dies sind die Stellen, an die Anfragen gehen. Darüber hinaus enthalten die Seiten keine
            eingebetteten Video-, Karten-, Werbe- oder Social-Media-Komponenten von Drittanbietern.
          </p>
        </div>
      ),
    },
    {
      id: "yonetim",
      title: "Löschen der Einträge",
      body: (
        <div className="shell-prose">
          <p>
            Sie können die Einträge aus Abschnitt 02 jederzeit über die Einstellungen Ihres
            Browsers löschen — über „Websitedaten löschen“ oder im Bereich „Anwendung / Speicher“
            der Entwicklertools. Das Löschen beeinträchtigt die Funktion der Website nicht; es wird
            lediglich Ihre gegebenenfalls offene Sitzung beendet und die gespeicherte Einstellung
            zurückgesetzt.
          </p>
          <p>
            Da das Cookie <code>__cf_bm</code> aus Abschnitt 01 zu hcaptcha.com und nicht zur
            Domain dieser Website gehört, wird es durch das Löschen der Daten dieser Website nicht
            entfernt; es wird gesondert über die Cookie-Liste Ihres Browsers gelöscht oder läuft
            innerhalb von dreißig Minuten von selbst ab.
          </p>
          <p>
            Da es keinen Tracking-Eintrag zu löschen gibt, wird auch kein gesondertes Fenster
            „Cookie-Einstellungen“ angezeigt. Wo keine einwilligungsbedürftige Verarbeitung
            stattfindet, liefert ein Einwilligungsfenster keine Information; es verdeckt lediglich
            die Seite.
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
            Fragen zu diesem Text können Sie an {SALES_EMAIL} richten. Der Rahmen für die
            Verarbeitung personenbezogener Daten ist im{" "}
            <Link to="/kvkk">Datenschutzhinweis (KVKK)</Link> dargelegt, das allgemeine
            Datenschutzverhalten der Website in der <Link to="/gizlilik-politikasi">Datenschutzerklärung</Link>.
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
