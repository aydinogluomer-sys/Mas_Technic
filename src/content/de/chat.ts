import type { ChatText } from "@/content/en/types";
import { CAD_UPLOAD_EXTENSIONS } from "./cad";

export const chat: Record<string, ChatText> = {
  "0": {
    question: "Wie erhalte ich ein Angebot?",
    answer: "Für ein Angebot besuchen Sie unsere Seite [Angebot anfordern](/teklif-al). Durch das Hochladen Ihrer CAD-Datei erhalten Sie schnell ein Angebot. Alternativ können Sie eine E-Mail an sales@mastechnic.com senden.",
    keywords: ["angebot", "preis", "kosten", "gebühr", "was kostet", "budget", "kostenvoranschlag", "anfrage", "rfq"],
  },
  "1": {
    question: "Wie kann ich Sie kontaktieren?",
    answer: "📞 Telefon: +90 (536) 564 51 94\n📧 E-Mail: sales@mastechnic.com\n📍 Adresse: Ataşehir Mah., 8287. Sok. No: 4, 35620 Çiğli/İzmir\n\nWeitere Informationen finden Sie auf unserer Seite [Kontakt](/iletisim).",
    keywords: ["kontakt", "telefon", "adresse", "e-mail", "mail", "wo", "standort", "anfahrt", "nummer"],
  },
  "2": {
    question: "Welche Branchen beliefern Sie?",
    answer: "Wir beliefern Luft- und Raumfahrt, Verteidigung, Automobil, Medizintechnik, Robotik, Energie, Schifffahrt, Hydraulik und viele weitere Branchen. Details finden Sie unter [Hochtechnologie](/endustriyel/kategori/yuksek-teknoloji) und auf unseren weiteren Branchenseiten.",
    keywords: ["branche", "industrie", "luftfahrt", "automobil", "medizintechnik", "verteidigung", "rüstung", "welche branche"],
  },
  "3": {
    question: "Fertigen Sie Prototypen?",
    answer: "Ja! Wir fertigen Prototypen ab einem einzelnen Teil. Die Lieferzeit wird nach Prüfung von Werkstoffbeschaffung, Anzahl der Arbeitsgänge und Kapazitätsplanung mit dem Angebot mitgeteilt. Details finden Sie auf unserer Seite [Prototypenfertigung](/endustriyel/prototip-uretim).",
    keywords: ["prototyp", "muster", "einzelteil", "einzelstück", "versuch", "erstmuster"],
  },
  "4": {
    question: "Welche CNC-Leistungen bieten Sie an?",
    answer: "CNC-Fräsen (3-4-5 Achsen), CNC-Drehen, Mikrozerspanung, Tieflochbohren & Reiben, Lasergravur, Oberflächenbehandlungen, Montage und mehr. Unsere Zerspanungsleistungen finden Sie auf der Seite [Zerspanung](/hizmetler/kategori/talasli-imalat).",
    keywords: ["cnc", "leistung", "was machen sie", "was bieten sie", "fräsen", "drehen", "zerspanung", "bearbeitung"],
  },
  "5": {
    question: "Wie lang ist Ihre Lieferzeit?",
    answer: "Die Lieferzeit wird nach Prüfung von Werkstoffbeschaffung, Anzahl der Arbeitsgänge und Kapazitätsplanung mit dem Angebot mitgeteilt. Die Lieferzeit eines Auftrags hängt oft nicht von der Maschine ab, sondern davon, wann der Werkstoff eintrifft; deshalb wird der Beschaffungsstand bereits in der Angebotsphase bewertet, bevor die Fertigung geplant wird.",
    keywords: ["lieferung", "lieferzeit", "zeit", "wann", "wie viele tage", "schnell", "dringend", "termin"],
  },
  "6": {
    question: "Welche Werkstoffe verarbeiten Sie?",
    answer: "Wir verarbeiten technische Werkstoffe wie Aluminium (6061, 7075), Edelstahl (304, 316), Kohlenstoffstahl, Titan, Messing, Kupfer, PEEK und POM/Delrin. Details finden Sie auf unserer Seite [Werkstoffbibliothek](/malzemeler).",
    keywords: ["werkstoff", "material", "metall", "aluminium", "stahl", "titan", "kunststoff", "messing", "kupfer", "edelstahl"],
  },
  "7": {
    question: "Gibt es eine Mindestbestellmenge?",
    answer: "Die Mindestbestellmenge liegt bei 1 (ein einzelnes Teil). Wir planen die Fertigung flexibel vom Prototyp bis zur Serienfertigung.",
    keywords: ["mindest", "menge", "bestellung", "wie viele", "moq", "mindestens", "stückzahl"],
  },
  "8": {
    question: "Welche Qualitätszertifikate haben Sie?",
    answer: "Wir sind nach ISO 9001:2015 und ISO 14001:2015 für unsere Managementsysteme zertifiziert. Für jeden Auftrag wird ein Prüfplan erstellt; das Messprotokoll wird der Lieferdokumentation beigefügt, und eine akkreditierte KMG-Messung durch Dritte ist auf Anfrage möglich.",
    keywords: ["qualität", "zertifikat", "zertifizierung", "iso", "norm", "dokument", "bericht"],
  },
  "9": {
    question: "Welche Toleranzen erreichen Sie?",
    answer: "Unser Standardarbeitsbereich liegt bei ±0,01 mm; die erreichbare Toleranz wird in der technischen Prüfung anhand von Geometrie, Werkstoff und Maßkette festgelegt. Details finden Sie auf unserer Seite [Toleranz & Präzision](/kabiliyetler/tolerans-hassasiyet).",
    keywords: ["toleranz", "präzision", "genauigkeit", "eng", "mikron"],
  },
  "10": {
    question: "Versenden Sie per Paketdienst?",
    answer: "Versandart und Verpackung werden im Angebot entsprechend den Auftragsbedingungen festgelegt; Versandoptionen für das Inland und das Ausland werden gemeinsam in der Angebotsphase geklärt.",
    keywords: ["paketdienst", "versand", "sendung", "verschicken", "paket", "transport", "dhl", "fedex", "ups", "spedition"],
  },
  "11": {
    question: "Liefern Sie ins Ausland?",
    answer: "Anfragen für Auslandslieferungen werden in der Angebotsphase bewertet; Lieferbedingung (z. B. DDP / FCA) und erforderliche Exportdokumente werden gemeinsam entsprechend den Auftragsbedingungen festgelegt.",
    keywords: ["ausland", "export", "international", "übersee", "europa", "usa", "amerika", "zoll"],
  },
  "12": {
    question: "Sind Rückgabe oder Umtausch möglich?",
    answer: "Die Konformität wird anhand der im Prüfplan definierten Merkmale und des Messprotokolls in der Lieferdokumentation bewertet. Wenn Sie eine Abweichung feststellen, melden Sie diese mit den Messergebnissen an sales@mastechnic.com; das weitere Vorgehen wird gemeinsam entsprechend den Auftragsbedingungen vereinbart.",
    keywords: ["rückgabe", "umtausch", "zurücksenden", "abweichung", "fehlerhaft", "mangelhaft", "gewährleistung", "garantie", "haftung", "zusicherung"],
  },
  "13": {
    question: "Welche Zahlungsarten bieten Sie an?",
    answer: "Die Zahlungsbedingungen werden im Angebot auftragsbezogen festgelegt; wir stellen Firmenrechnungen und E-Rechnungen aus. Welche Zahlungsart möglich ist, klären wir in der Angebotsphase.",
    keywords: ["zahlung", "überweisung", "banküberweisung", "kreditkarte", "rechnung", "e-rechnung", "bedingungen", "vorkasse", "ratenzahlung", "bank"],
  },
  "14": {
    question: "Ist Vorkasse erforderlich?",
    answer: "Wir haben keine veröffentlichten festen Zahlungsbedingungen. Die Bedingungen werden im Angebot auftragsbezogen festgelegt und gemeinsam in der Angebotsphase geklärt.",
    keywords: ["vorkasse", "vorauszahlung", "anzahlung", "im voraus", "zahlungsbedingungen", "netto", "ratenzahlung"],
  },
  "15": {
    question: "Welche CAD-Dateiformate akzeptieren Sie?",
    answer: `Formate, die Sie direkt im Angebotsprozess hochladen können: ${CAD_UPLOAD_EXTENSIONS}. Für ein nicht aufgeführtes Format oder eine bemaßte technische Zeichnung können Sie die Datei an sales@mastechnic.com senden.`,
    keywords: ["datei", "format", "cad", "step", "iges", "stl", "obj", "3mf", "zeichnung", "3d", "modell"],
  },
  "16": {
    question: "Wie sind Ihre Geschäftszeiten?",
    answer: "Mit Angebots- und technischen Fragen können Sie sich jederzeit an sales@mastechnic.com wenden; Angebotsanfragen beantworten wir innerhalb von 1–3 Werktagen. Telefon und Adresse finden Sie auf unserer Seite [Kontakt](/iletisim).",
    keywords: ["arbeitszeit", "öffnungszeiten", "büro", "geöffnet", "geschlossen", "wochenende", "samstag", "sonntag", "geschäftszeiten"],
  },
  "17": {
    question: "Welche Oberflächenbehandlungen bieten Sie an?",
    answer: "Eloxieren, mechanische Oberflächenbearbeitung (Strahlen, Gleitschleifen, Polieren), chemische Behandlungen (Passivieren, Phosphatieren) sowie Lackierung und Schutzbeschichtung. Details finden Sie auf unserer Seite [Oberflächenbehandlungen](/hizmetler/kategori/yuzey-islemleri).",
    keywords: ["oberfläche", "eloxieren", "eloxal", "beschichtung", "lackierung", "verchromen", "vernickeln", "strahlen", "passivieren", "veredelung"],
  },
  "18": {
    question: "Bieten Sie Serienfertigung an?",
    answer: "Ja, wir fertigen vom Einzelteil bis zur Serie. In der Serienfertigung bieten wir einen Stückkostenvorteil und gleichbleibende Qualität. Siehe unsere Seite [Serienfertigung](/kabiliyetler/seri-imalat).",
    keywords: ["serie", "serienfertigung", "charge", "stückzahl", "großauftrag", "volumen", "massenfertigung"],
  },
  "19": {
    question: "Bieten Sie Konstruktionsunterstützung an?",
    answer: "Ja! Mit einer DFM-Analyse (fertigungsgerechte Konstruktion) helfen wir Ihnen, Ihre Konstruktion fertigungsgerecht auszulegen. Wir machen Vorschläge zur Kosten- und Zeitoptimierung.",
    keywords: ["konstruktion", "design", "dfm", "unterstützung", "engineering", "optimierung", "beratung"],
  },
  "20": {
    question: "Erstellen Sie technische Zeichnungen?",
    answer: "Ja, wir bieten 3D-Modellierung und technische 2D-Zeichnungen an. Aus Skizzen unserer Kunden erstellen wir fertigungsreife CAD-Dateien.",
    keywords: ["zeichnung", "technische zeichnung", "modellierung", "konstruktion", "3d-modell", "2d", "cad-konstruktion"],
  },
  "21": {
    question: "Was ist das Kundenportal?",
    answer: "Im Kundenportal können Sie Ihre Aufträge verfolgen, Ihre Angebote einsehen, auf Qualitätsberichte zugreifen und Supportanfragen erstellen. Zu Ihrem Konto gelangen Sie über die Seite [Anmeldung](/giris).",
    keywords: ["kundenportal", "portal", "kundenbereich", "konto", "anmelden", "login", "auftragsverfolgung", "dashboard"],
  },
  "22": {
    question: "Wer ist MAS Technic?",
    answer: "MAS Technic ist ein Unternehmen für CNC-Präzisionsfertigung mit Sitz in İzmir. Vom Prototyp bis zur Serienfertigung beliefern wir zahlreiche Branchen, allen voran Luft- und Raumfahrt, Verteidigung, Automobil und Medizintechnik. Details finden Sie auf unserer Seite [Über uns](/hakkimizda).",
    keywords: ["mas technic", "wer sind sie", "unternehmen", "firma", "über uns", "was ist", "vorstellung"],
  },
  "23": {
    question: "Welchen Maschinenpark haben Sie?",
    answer: "Wir verfügen über Verfahrensfamilien für 3-, 4- und 5-Achs-Fräsen, Drehen mit C-/Y-Achse und Langdrehen, Tieflochbearbeitung sowie Draht- und Senkerodieren; welche eingesetzt wird, bestimmt die Teilegeometrie. Eine akkreditierte KMG-Messung durch Dritte ist auf Anfrage möglich. Siehe unsere Seite [Maschinenpark](/kabiliyetler/makine-parkuru).",
    keywords: ["maschine", "maschinenpark", "maschinen", "ausstattung", "kapazität", "achse", "fräsmaschine", "drehmaschine"],
  },
};
