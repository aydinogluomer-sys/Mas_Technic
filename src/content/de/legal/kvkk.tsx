import { Link } from "@/i18n/LocaleLink";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { PUBLIC_ADDRESS_LINES, SALES_EMAIL } from "@/content/claims";

/* German translation of `src/pages/KVKK.tsx` (L3d). Clause ids, order and
   cross-references are the Turkish document's own. The Turkish text is the
   governing version; this translation awaits native and legal review
   (owner input O16). */
export const KVKK_DE = {
  eyebrow: "Rechtstext",
  title: "Datenschutzhinweis (KVKK)",
  lede: "Nach dem türkischen Gesetz Nr. 6698 zum Schutz personenbezogener Daten: welche personenbezogenen Daten diese Website verarbeitet, zu welchem Zweck und auf welcher Rechtsgrundlage.",
  metaDescription:
    "Datenschutzhinweis von Mas Technic nach dem KVKK — verarbeitete personenbezogene Daten, Zweck und Rechtsgrundlage, Übermittlung, Aufbewahrung und Ihre Rechte nach Artikel 11.",
  clauses: [
    {
      id: "veri-sorumlusu",
      title: "Verantwortlicher",
      body: (
        <div className="shell-prose">
          <p>
            Verantwortlicher im Sinne des Gesetzes Nr. 6698 zum Schutz personenbezogener Daten (KVKK) ist die
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
      title: "Verarbeitete personenbezogene Daten",
      body: (
        <div className="shell-prose">
          <p>
            Auf dieser Website werden personenbezogene Daten nur in dem Umfang verarbeitet, in dem
            Sie sie selbst übermitteln. Über das Angebotsformular erhalten wir Ihren Vor- und
            Nachnamen, Ihre E-Mail-Adresse, den Firmennamen und Ihre Telefonnummer; die technischen
            Zeichnungen oder 3D-Modelldateien, die Sie mit der Angebotsanfrage hochladen; sowie bei
            Eröffnung eines Kontos Ihre E-Mail-Adresse.
          </p>
          <p>
            Enthält der Inhalt einer von Ihnen hochgeladenen Datei personenbezogene Daten — etwa
            einen Namen im Schriftfeld der Zeichnung —, fallen auch diese Daten in den
            Anwendungsbereich dieses Hinweises.
          </p>
          <p>
            Dieselbe Regel gilt für den Text, den Sie in das Chatfenster in der Ecke der Seiten
            eingeben: Enthält das, was Sie schreiben, einen Namen, eine Telefonnummer oder einen
            Firmennamen, fallen auch diese Daten in den Anwendungsbereich dieses Hinweises. Der
            Chattext wird nicht in der Datenbank der Website gespeichert; er verlässt die Website nur,
            wenn Sie Ihre Einwilligung zur KI-Nutzung erteilen, und diese Übermittlung ist in
            Abschnitt 04 beschrieben.
          </p>
        </div>
      ),
    },
    {
      id: "amac-ve-hukuki-sebep",
      title: "Zweck und Rechtsgrundlage der Verarbeitung",
      body: (
        <div className="shell-prose">
          <p>
            Die Daten werden verarbeitet, um Angebote zu erstellen, Prüfungen der Herstellbarkeit
            durchzuführen, den Auftrags- und Fertigungsprozess abzuwickeln, Rechnungen auszustellen
            und mit Ihnen zu diesen Angelegenheiten zu kommunizieren.
          </p>
          <p>
            Rechtsgrundlage ist, dass die Verarbeitung nach Art. 5/2-c KVKK in unmittelbarem
            Zusammenhang mit dem Abschluss oder der Erfüllung eines Vertrags steht, sowie die
            Erfüllung einer rechtlichen Verpflichtung nach Art. 5/2-ç KVKK. Eine Verarbeitung
            außerhalb dieser Zwecke findet nicht statt; es erfolgen weder Profiling zu
            Marketingzwecken noch automatisierte Entscheidungsfindung.
          </p>
        </div>
      ),
    },
    {
      id: "aktarim",
      title: "Übermittlung",
      body: (
        <div className="shell-prose">
          <p>
            Ihre personenbezogenen Daten werden nicht verkauft und nicht zu Marketingzwecken an
            Dritte weitergegeben. Eine Übermittlung erfolgt ausschließlich in den nachstehend
            einzeln aufgeführten Fällen.
          </p>
          <p>
            <strong>Behördliches Ersuchen.</strong> Ein auf gesetzlicher Grundlage beruhendes
            Ersuchen zuständiger öffentlicher Stellen und Einrichtungen.
          </p>
          <p>
            <strong>Hosting und Datenbank.</strong> Der Dienstleister der Hosting- und
            Datenbankinfrastruktur, die für den Betrieb dieser Website genutzt wird.
          </p>
          <p>
            <strong>Sicherheitskomponente auf der Anmeldeseite.</strong> Wenn Sie die{" "}
            <Link to="/giris">Anmeldeseite</Link> aufrufen, wird die hCaptcha-Komponente geladen,
            die das Formular vor automatisierten Anmeldeversuchen schützt; Ihr Browser sendet eine
            Anfrage an Server unter der Domain <code>hcaptcha.com</code>, und mit dieser Anfrage
            gelangen Ihre IP-Adresse und Ihre Browserinformationen an diese Server. Ihre
            Einwilligung wird hierfür weder erbeten noch eingeholt: Die Komponente wird geladen,
            sobald die Seite geöffnet wird, ohne dass Sie etwas tun. Das Cookie, das sie in Ihrem
            Browser hinterlegt, und sämtliche Domains der Komponente sind in den Abschnitten 01 und
            03 der <Link to="/cerez-politikasi">Cookie-Richtlinie</Link> beschrieben.
          </p>
          <p>
            <strong>Chat-Assistent — nur mit Ihrer Einwilligung.</strong> Wenn Sie im
            Chat-Assistenten Ihre Einwilligung zur KI-Nutzung erteilen, wird der bis dahin geführte
            Gesprächsverlauf über die eigene Serverfunktion der Website an den Dienst Gemini von
            Google übermittelt. Erteilen Sie keine Einwilligung, findet diese Übermittlung zu keinem
            Zeitpunkt statt. Übermittelt wird ausschließlich der Gesprächstext: Ihre IP-Adresse,
            Sitzungsinformationen oder sonstige Daten, die Sie identifizieren, werden nicht
            gesendet, da die zwischengeschaltete Serverfunktion die Header Ihres Browsers nicht
            weiterleitet. Der Text wird auch nicht in der Datenbank der Website gespeichert. Wie die
            Übermittlung Schritt für Schritt abläuft, ist in Abschnitt 06
            der <Link to="/gizlilik-politikasi">Datenschutzerklärung</Link> beschrieben.
          </p>
          <p>
            <strong>Anmeldung mit Google oder LinkedIn — nur wenn Sie diese Schaltfläche betätigen.</strong> Wenn
            Sie auf der{" "}
            <Link to="/giris">Anmeldeseite</Link> die Schaltfläche „Google“ oder „LinkedIn“
            betätigen, verlässt Ihr Browser die Website: zunächst zur oben genannten Hosting- und
            Authentifizierungsinfrastruktur und von dort zur eigenen Anmeldeseite des gewählten
            Anbieters. Betätigen Sie die Schaltfläche nicht, findet diese Weiterleitung zu keinem
            Zeitpunkt statt. Welche Daten auf der eigenen Seite des Anbieters verarbeitet werden,
            beschreibt dieser Hinweis nicht; dies ist Gegenstand der eigenen Datenschutzhinweise
            des jeweiligen Anbieters.
          </p>
          <p>
            <strong>Weitergabe eines Auftrags an einen Zulieferer — mit Ihrer Kenntnis.</strong> Muss
            zur Ausführung eines Auftrags eine technische Datei an einen dritten Zulieferer
            übermittelt werden, geschieht dies nur mit Ihrer Kenntnis.
          </p>
          <p>
            Dies sind die Fälle, in denen eine Übermittlung erfolgt. Was mit den Daten geschieht,
            nachdem sie einen Dritten erreicht haben, darüber trifft dieses Dokument keine Aussage:
            Dieser Bereich ist für uns nicht einsehbar, und wir schreiben hier nichts, was wir nicht
            für Sie überprüfen können. Geben Sie daher keine Informationen in das Chatfenster ein,
            die Sie nicht teilen möchten; nutzen Sie für technische Einzelheiten den Angebotsprozess
            — die Daten und Dateien, die Sie dort hinterlassen, werden an keinen KI-Dienst gesendet.
          </p>
        </div>
      ),
    },
    {
      id: "saklama",
      title: "Aufbewahrung",
      body: (
        <div className="shell-prose">
          <p>
            Personenbezogene Daten werden so lange aufbewahrt, wie es für den Zweck, zu dem sie
            verarbeitet werden, erforderlich ist und solange die in den einschlägigen
            Rechtsvorschriften vorgesehenen Aufbewahrungspflichten fortbestehen; nach Ablauf dieses
            Zeitraums werden sie gelöscht, vernichtet oder anonymisiert.
          </p>
          <p>
            Dieser Hinweis sagt weder eine bestimmte Anzahl von Tagen noch einen festen
            Vernichtungsplan zu. Wenn Sie die Löschung Ihrer Daten wünschen, können Sie diese unter
            Ausübung Ihres Rechts nach Abschnitt 06 verlangen.
          </p>
        </div>
      ),
    },
    {
      id: "haklariniz",
      title: "Ihre Rechte (Art. 11 KVKK)",
      body: (
        <div className="shell-prose">
          <p>
            Nach Artikel 11 des Gesetzes haben Sie das Recht, zu erfahren, ob Ihre personenbezogenen
            Daten verarbeitet werden; im Falle einer Verarbeitung Auskunft darüber zu verlangen; den
            Zweck der Verarbeitung zu erfahren und ob die Daten zweckentsprechend verwendet werden;
            die Dritten im In- oder Ausland zu kennen, an die die Daten übermittelt wurden; im Falle
            einer unvollständigen oder unrichtigen Verarbeitung deren Berichtigung zu verlangen;
            deren Löschung oder Vernichtung zu verlangen; zu verlangen, dass Berichtigungen und
            Löschungen den Dritten mitgeteilt werden, an die die Daten übermittelt wurden; einem
            für Sie nachteiligen Ergebnis zu widersprechen, das sich aus der Analyse der
            verarbeiteten Daten ausschließlich durch automatisierte Systeme ergibt; sowie den Ersatz
            des Schadens zu verlangen, wenn Ihnen durch eine rechtswidrige Verarbeitung ein Schaden
            entsteht.
          </p>
        </div>
      ),
    },
    {
      id: "basvuru",
      title: "Antragstellung",
      body: (
        <div className="shell-prose">
          <p>
            Ihre Anträge zu diesen Rechten können Sie an {SALES_EMAIL} richten. Ihr Antrag muss
            Angaben, die Ihre Identifizierung ermöglichen, sowie den Gegenstand Ihres Anliegens klar
            enthalten.
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
