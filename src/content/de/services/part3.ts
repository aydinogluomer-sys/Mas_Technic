import type { ServiceText } from "@/content/en/types";

const REF = "Allgemeine Richtwerte; sie geben nicht die Kapazität des Unternehmens wieder. Der für Ihr Teil geltende Wert wird im Angebot angegeben.";

export const part3: Record<string, ServiceText> = {
  "lazer-kazima": {
    categoryLabel: "Markierung & Kennzeichnung",
    title: "Lasergravur",
    metaTitle: "Lasergravur & Laserbeschriftung | Faserlaser | QR-Code | Mas Technic",
    metaDescription: "Dauerhafte Faserlaser-Kennzeichnung auf Metall, Kunststoff und Holz: Barcodes, QR-Codes, Seriennummern, Logos. Zeichengröße und Tiefe richten sich nach dem Werkstoff.",
    description: "Kontrastreiche, verschleißfeste Faserlaser-Kennzeichnung auf Metallen, Kunststoffen und Verbundwerkstoffen: Barcodes, QR-Codes und Seriennummern.",
    content: [
      "Wir kennzeichnen Seriennummern, Barcodes, QR-Codes und Logos mit einem Faserlaser. Beschriftungsfeld, minimale Zeichengröße und Gravurtiefe richten sich nach dem Werkstoff, der Oberfläche und der geforderten Lesbarkeit des Codes.",
      "Die Kennzeichnung ist auf unterschiedlichen Werkstoffen wie Stahl, Aluminium, Kunststoffen und Holz möglich; bei runden Teilen kommt die dynamische Beschriftung zum Einsatz.",
      "Wir bieten die Kennzeichnung mit Seriennummern und Chargencodes, Barcodes und QR-Codes, Logos und Marken, technischen Angaben und Normen sowie Datums- und Fertigungscodes.",
    ],
    features: [
      "Steuerung der Gravurtiefe — Abgestimmt auf den Werkstoff",
      "Verschiedene Werkstoffe — Stahl, Aluminium, Kunststoffe, Holz",
      "Dynamische Beschriftung — Für runde Teile",
    ],
    technicalSpecs: [
      { label: "Verfahren", value: "Faserlaser-Beschriftung" },
      { label: "Arbeitsbereich", value: "Wird im Angebot angegeben" },
    ],
    processSteps: ["Gestaltung & Programmierung", "Werkstoffanalyse", "Parametereinstellung", "Laserbeschriftung", "Leseprüfung"],
    advantages: ["Für verschiedene Werkstoffe geeignet", "Dynamische Beschriftung runder Teile"],
    comparisonTables: [
      {
        title: "Laserbeschriftungstechnologien im Vergleich",
        description: "Ein allgemeiner Vergleich der Lasertypen; keine Ausrüstungsliste oder Kapazitätsangabe des Unternehmens.",
        headers: ["Lasertyp", "Wellenlänge", "Leistungsbereich", "Geeigneter Werkstoff", "Geschwindigkeit", "Anwendung"],
        rows: [
          ["Faserlaser", "1064nm", "20-100W", "Metall, Kunststoff", "10.000 mm/s", "Universell, Serienfertigung"],
          ["CO₂-Laser", "10.600nm", "10-60W", "Holz, Kunststoff, Leder", "5.000 mm/s", "Organische Werkstoffe, Verpackungen"],
          ["UV-Laser", "355nm", "3-15W", "Kunststoff, Glas, Silikon", "3.000 mm/s", "Feine, wärmeempfindliche Anwendungen"],
          ["Grüner Laser", "532nm", "5-20W", "Kupfer, Gold, Leiterplatten", "5.000 mm/s", "Reflektierende Metalle"],
          ["MOPA-Faserlaser", "1064nm", "20-60W", "Metall (farbig)", "8.000 mm/s", "Farbbeschriftung, Edelstahl"],
        ],
      },
      {
        title: "Laserbeschriftungsparameter nach Werkstoff",
        description: "Ein allgemeiner Anhaltspunkt für Startparameter; die Parameter werden durch Versuche am Teil und an der Oberfläche festgelegt.",
        headers: ["Werkstoff", "Empfohlener Laser", "Leistung", "Geschwindigkeit", "Kontrast", "Hinweise"],
        rows: [
          ["Edelstahl", "Faser / MOPA", "20-50W", "500-2000 mm/s", "Hoch", "Anlassbeschriftung: dunkle Oxidmarkierung ohne Materialabtrag; eine helle Markierung entsteht durch Gravieren mit Materialabtrag"],
          ["Aluminium", "Faser", "30-60W", "800-3000 mm/s", "Mittel bis hoch", "Auf eloxierten Oberflächen trägt der Laser die Eloxalschicht ab; die Markierung ist hell und kontrastreich"],
          ["Titan", "Faser / MOPA", "20-40W", "300-1500 mm/s", "Hoch", "Farbige Anlassbeschriftung möglich"],
          ["ABS-Kunststoff", "Faser / UV", "5-20W", "1000-5000 mm/s", "Mittel", "Durch Farbumschlag"],
          ["Glas", "UV / CO₂", "3-10W", "200-800 mm/s", "Mittel", "Mikroriss-Verfahren"],
          ["Gehärteter Stahl", "Faser", "30-80W", "300-1000 mm/s", "Sehr hoch", "Tiefgravur möglich"],
        ],
      },
    ],
  },
  tavlama: {
    categoryLabel: "Markierung & Kennzeichnung",
    title: "Laser-Anlassbeschriftung",
    metaTitle: "Laser-Anlassbeschriftung für Edelstahl & Titan | Mas Technic",
    metaDescription: "Lesbare Kennzeichnung durch thermische Anlassfarbe auf Edelstahl- und Titanteilen, ohne Materialabtrag an der Oberfläche. Der Umfang wird im Angebot je nach Teil und Werkstoff angegeben.",
    description: "Die Laser-Anlassbeschriftung ist ein Laserkennzeichnungsverfahren, das durch thermische Farbveränderung ohne Materialabtrag an der Oberfläche markiert; es wird vor allem bei Edelstahl- und Titanteilen eingesetzt.",
    content: [
      "Bei der Laser-Anlassbeschriftung graviert der Laser die Oberfläche nicht, sondern erwärmt sie lokal; die entstehende dünne Oxidschicht macht die Markierung als dunklen oder farbigen Ton sichtbar. Da kein Material abgetragen wird, bleibt die Unversehrtheit der Oberfläche erhalten.",
      "Das Verfahren wird vor allem zur Kennzeichnung von Seriennummern, Chargencodes, Logos und lesbaren Codes auf Edelstahl- und Titanteilen gewählt. Der entstehende Farbton hängt vom Werkstoff und vom Oberflächenzustand ab.",
      "Der Arbeitsbereich wird nach Prüfung der Teilegeometrie und des Prozessplans im Angebot angegeben.",
    ],
    features: [
      "Kennzeichnung ohne Materialabtrag — Die Oberfläche wird nicht graviert; es entsteht eine thermische Farbveränderung",
      "Edelstahl und Titan — Die typische Anwendung des Verfahrens",
      "Kennzeichnung für die Rückverfolgbarkeit — Seriennummer, Chargencode, Logo und lesbarer Code",
    ],
    technicalSpecs: [
      { label: "Verfahren", value: "Thermische Farbveränderung per Laser" },
      { label: "Wirkung auf die Oberfläche", value: "Kein Materialabtrag" },
      { label: "Typischer Werkstoff", value: "Edelstahl, Titan" },
      { label: "Arbeitsbereich", value: "Wird im Angebot angegeben" },
    ],
    processSteps: ["Prüfung von Werkstoff & Oberfläche", "Freigabe von Inhalt & Position der Markierung", "Parameterversuch", "Laser-Anlassbeschriftung", "Lesbarkeitsprüfung"],
    advantages: ["Unversehrtheit der Oberfläche bleibt erhalten", "Lesbare Markierung ohne Gravur", "Für Edelstahl und Titan geeignet"],
  },
  "qr-datamatrix-kodlari": {
    categoryLabel: "Markierung & Kennzeichnung",
    title: "QR- & DataMatrix-Codes",
    description: "Kennzeichnung mit DataMatrix- und QR-Codes. Dauerhafte Rückverfolgbarkeit von Teilen mit hoher Datenkapazität auf kleiner Fläche.",
    content: [
      "Für die industrielle Rückverfolgbarkeit bieten wir dauerhafte Codekennzeichnung in den Formaten DataMatrix, QR-Code und GS1-128-Barcode. Codegröße und Datenkapazität richten sich nach dem Dateninhalt, der Modulgröße und der geforderten Lesbarkeit.",
      "Mit den Codierungsoptionen UID (Unique Identifier), GS1-128-Barcode, HIBC (Health Industry Bar Code) und DoD IUID (Item Unique Identification) bieten wir Lösungen für Teileverfolgung, Qualitätskontrolle und Bestandsmanagement. Die Lesbarkeit der gekennzeichneten Codes wird vor der Auslieferung durch eine Leseprüfung kontrolliert.",
    ],
    features: [
      "DataMatrix — Hohe Datendichte auf kleiner Fläche",
      "QR-Code — Schnelles Lesen, breite Kompatibilität",
      "GS1-128-Barcode — Standard-Barcode",
      "IUID-Codierung — Rückverfolgbarkeit für die Verteidigungsindustrie",
    ],
    technicalSpecs: [
      { label: "Symbologie", value: "DataMatrix (ISO/IEC 16022)" },
      { label: "Verifizierung", value: "ISO 15415" },
    ],
    processSteps: ["Auswahl des Codetyps", "Dateneingabe & Format", "Laserbeschriftung", "Leseprüfung", "Bericht zur Lesequalität"],
    advantages: ["Hohe Datenkapazität auf kleiner Fläche", "Leseprüfung nach der Laserbeschriftung", "IUID-Unterstützung für die Verteidigungsindustrie"],
    comparisonTables: [
      {
        title: "Industrielle Codetypen im Vergleich",
        description: "Die Datenkapazität gilt für das größte nach der Norm zulässige Symbol; die tatsächliche Codegröße richtet sich nach dem Dateninhalt und der Modulgröße.",
        headers: ["Codetyp", "Datenkapazität", "Anwendung"],
        rows: [
          ["DataMatrix (ECC200)", "2.335 alphanumerisch", "Kleinteile, Luft- und Raumfahrt"],
          ["QR-Code", "4.296 alphanumerisch", "Allgemein, mobiles Lesen"],
          ["GS1-128-Barcode", "48 Zeichen", "Logistik, Lagerverwaltung"],
          ["Micro-QR", "35 alphanumerisch", "Sehr kleine Teile"],
          ["PDF417", "1.850 alphanumerisch", "Dokumente, Zertifikate"],
          ["UID / IUID", "Variabel", "Verteidigung, Militär"],
        ],
      },
    ],
  },
  "logo-markalama": {
    categoryLabel: "Markierung & Kennzeichnung",
    title: "Logo & Markenkennzeichnung",
    description: "Verleihen Sie Ihren Produkten eine Markenidentität durch Laserbeschriftung, Tampondruck und Siebdruck. Dauerhaft und professionell.",
    content: [
      "Wir bieten 4 Verfahren zur Markenkennzeichnung: Laserbeschriftung (dauerhaft, kontrastreich, Metalle und Kunststoffe), Tampondruck (gewölbte Flächen, mehrfarbig), Siebdruck (große Flächen, hohe Stückzahlen) und Etiketten (temporär, austauschbar).",
      "Bei der Logo- und Markenkennzeichnung richten sich Position und Größe nach der Kennzeichnungsangabe in der Zeichnung; Beschriftungsfeld und Auflösung hängen vom Werkstoff ab.",
    ],
    features: [
      "Laser — Dauerhaft, kontrastreich, Metall/Kunststoff",
      "Tampondruck — Gewölbte Flächen, mehrfarbig",
      "Siebdruck — Große Flächen, hohe Stückzahlen",
      "Etikett — Temporär, austauschbar",
    ],
    technicalSpecs: [
      { label: "Arbeitsbereich", value: "Wird im Angebot angegeben" },
      { label: "Kontrolle", value: "Serie nach Musterfreigabe" },
    ],
    processSteps: ["Prüfung der Gestaltung", "Verfahrensauswahl", "Musterfertigung", "Serienkennzeichnung", "Qualitätsprüfung"],
    advantages: [
      "4 Verfahren zur Markenkennzeichnung",
      "Auflösung und Detailgrad auf den Werkstoff abgestimmt",
      "Tampondruck auf gewölbten Flächen",
      "Reproduzierbare Serienkennzeichnung nach Musterfreigabe",
    ],
    comparisonTables: [
      {
        title: "Verfahren zur Markenkennzeichnung im Vergleich",
        description: REF,
        headers: ["Verfahren", "Beständigkeit", "Farbe", "Oberflächenart", "Kosten/Teil"],
        rows: [
          ["Laserbeschriftung", "Dauerhaft", "Einfarbig", "Eben/gewölbt", "$$"],
          ["Tampondruck", "Gut", "Mehrfarbig", "Ideal für gewölbte Flächen", "$"],
          ["Siebdruck", "Gut", "Mehrfarbig", "Ebene Fläche", "$"],
          ["Etikett (Vinyl)", "Mittel", "Vollfarbig", "Eben", "$"],
        ],
      },
    ],
  },
  "insert-uygulama": {
    categoryLabel: "Montage & Fügen",
    title: "Gewindeeinsätze setzen",
    description: "Setzen von Metalleinsätzen in Kunststoff- und Metallteile per Ultraschall, Wärme oder Einpressen. Montage von Muttern, Nieten und Stiften.",
    content: [
      "Wir bieten 4 Verfahren zum Setzen von Gewindeeinsätzen: Ultraschall-Einsätze (für Kunststoffe, schnell und sauber), Wärme-Einsätze (hohe Auszugsfestigkeit), Einpress- bzw. selbstschneidende Einsätze (wirtschaftlich) und eingespritzte Einsätze (höchste Festigkeit).",
      "Wir stellen Verbindungen mit Einsätzen aus Messing (vernickelt, universell), Stahl (verzinkt, hohe Festigkeit) und Edelstahl (unbeschichtet, korrosionsbeständig) her. Gewindegröße, Auszugsfestigkeit und Taktzeit richten sich nach Einsatztyp, Werkstoff des Teils und Setzverfahren.",
    ],
    features: [
      "Ultraschall-Einsatz — Für Kunststoffe, schnell und sauber",
      "Wärme-Einsatz — Hohe Auszugsfestigkeit",
      "Einpress-Einsatz (selbstschneidend) — Wirtschaftlich",
      "Eingespritzter Einsatz — Höchste Festigkeit",
    ],
    technicalSpecs: [
      { label: "Verfahren", value: "Ultraschall / Wärme / Einpressen" },
      { label: "Auszugsfestigkeit", value: "Je nach Einsatztyp" },
    ],
    processSteps: ["Auswahl des Einsatztyps", "Bohrungsvorbereitung", "Setzen des Einsatzes", "Auszugsprüfung", "Qualitätsprüfung"],
    advantages: [
      "4 Verfahren zum Setzen von Gewindeeinsätzen",
      "3 Werkstoffoptionen für Einsätze",
      "Durch Auszugsprüfung verifizierte Einsatzverbindungen",
      "Taktzeit je nach Einsatztyp und Verfahren",
    ],
    comparisonTables: [
      {
        title: "Verfahren zum Setzen von Gewindeeinsätzen im Vergleich",
        description: REF,
        headers: ["Verfahren", "Geeigneter Werkstoff", "Kosten", "Vorteil"],
        rows: [
          ["Ultraschall", "Thermoplaste", "$$", "Schnell, sauber, reproduzierbar"],
          ["Warmeinbetten", "Thermoplaste", "$$", "Hohe Auszugsfestigkeit"],
          ["Einpressen (selbstschneidend)", "Kunststoffe, Leichtmetalle", "$", "Wirtschaftlich, schnell"],
          ["Eingespritzt", "Spritzgegossene Kunststoffe", "$$$", "Höchste Festigkeit"],
          ["Eingeklebt", "Alle Werkstoffe", "$", "Flexibel, geringe Spannungen"],
        ],
      },
    ],
  },
  "mekanik-montaj": {
    categoryLabel: "Montage & Fügen",
    title: "Mechanische Montage",
    description: "Montage von Schrauben, Muttern, Nieten und Clips. Drehmomentgesteuertes Anziehen und automatische Zuführsysteme für hohe Effizienz.",
    content: [
      "Wir bieten Schrauben- und Mutternmontage (drehmomentgesteuert), Nieten, Montage von Clips und Sicherungsringen (automatische Zuführung), Lagermontage (mit speziellen Vorrichtungen) und Montage von O-Ringen/Dichtungen (öl- und staubgeschützt).",
      "Die Drehmomentwerte richten sich nach Größe und Festigkeitsklasse des Verbindungselements sowie nach der Spezifikation und werden durch drehmomentgesteuertes Anziehen aufgebracht. Jede Baugruppe durchläuft eine Funktionsprüfung und wird in einem seriennummernbasierten Verfolgungssystem erfasst.",
    ],
    features: [
      "Schrauben- & Mutternmontage — Drehmomentgesteuert",
      "Nieten — Dauerhafte Verbindungen",
      "Clip- & Sicherungsringmontage — Automatische Zuführung",
      "Lager- & O-Ring-Montage — Mit speziellen Vorrichtungen",
    ],
    technicalSpecs: [
      { label: "Drehmomentkontrolle", value: "Gemäß Spezifikation" },
      { label: "Prüfung", value: "Funktionsprüfung" },
      { label: "Verfolgung", value: "Über Seriennummer" },
    ],
    processSteps: ["Montageplan", "Komponentenprüfung", "Drehmomentgesteuerte Montage", "Funktionsprüfung", "Verpackung & Etikettierung"],
    advantages: [
      "Drehmomentgesteuertes Anziehen",
      "Hohe Effizienz durch automatische Zuführung",
      "Verifizierung mit digitalem Drehmomentmessgerät",
      "Rückverfolgbarkeit über Seriennummer",
    ],
    comparisonTables: [
      {
        title: "Anziehdrehmomente für Verbindungselemente (trocken, Festigkeitsklasse 8.8)",
        description: "Allgemeine Richtwerte (trocken, Festigkeitsklasse 8.8); das aufzubringende Drehmoment richtet sich nach der Spezifikation und der Auslegung der Verbindung.",
        headers: ["Schraubengröße", "Drehmoment (Nm)", "Vorspannkraft (kN)", "Schlüsselweite", "Prüfmethode"],
        rows: [
          ["M3", "1,5-2,0", "2,5", "5,5mm", "Digitales Drehmomentmessgerät"],
          ["M4", "3,0-4,0", "4,5", "7mm", "Digitales Drehmomentmessgerät"],
          ["M5", "6,0-8,0", "8,0", "8mm", "Drehmomentschlüssel"],
          ["M6", "10,0-12,0", "12,0", "10mm", "Drehmomentschlüssel"],
          ["M8", "25,0-30,0", "22,0", "13mm", "Drehmomentschlüssel"],
          ["M10", "50,0-60,0", "35,0", "17mm", "Elektronischer Drehmomentschrauber"],
          ["M12", "85,0-100,0", "50,0", "19mm", "Elektronischer Drehmomentschrauber"],
        ],
      },
    ],
  },
};
