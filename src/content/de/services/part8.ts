import type { ServiceText } from "@/content/en/types";

export const part8: Record<string, ServiceText> = {
  "seri-uretim": {
    categoryLabel: "Fertigungslösungen",
    title: "Serienfertigung",
    metaTitle: "Serienfertigung | Wiederholgenaues Rüsten und Loskontrolle | Mas Technic",
    metaDescription: "Standardisiertes Rüsten, prozessbegleitende Prüfungen nach Prüfplan und Los-Rückverfolgbarkeit in der Serienfertigung. Der Liefertermin folgt aus der Kapazitätsplanung.",
    description: "In der Serienfertigung zählt nicht die Geschwindigkeit, sondern die Wiederholgenauigkeit: standardisiertes Rüsten, prozessbegleitende Prüfungen nach Prüfplan und Rückverfolgbarkeit auf Losebene.",
    content: [
      "In der Serienfertigung entscheidet nicht die Geschwindigkeit der Maschine, sondern die Wiederholgenauigkeit des Rüstens über das Ergebnis. Feste Bezugsflächen, ein standardisiertes Rüstverfahren und automatischer Werkzeugwechsel sorgen dafür, dass dasselbe Teil von Los zu Los gleich ausfällt.",
      "In jedem Los werden die im Prüfplan festgelegten Merkmale gemessen und die Ergebnisse dokumentiert. Verschleißempfindliche Maße werden zusätzlich prozessbegleitend überwacht; zeigt sich ein Drifttrend, wird der Prozess korrigiert, nicht das Teil.",
      "Losgröße und Lieferplan werden gemeinsam mit der Kapazitätsplanung festgelegt; Optionen für periodische Lieferung und Rahmenaufträge werden in der Angebotsphase geprüft.",
    ],
    features: [
      "Standardisiertes Rüsten — fester Bezug und wiederholgenaue Spannung",
      "Automatischer Werkzeugwechsel — unterbrechungsfreie Bearbeitung bei großen Losen",
      "Erstteilfreigabe — kein Serienstart ohne Freigabe",
      "Losdokumentation — Rückverfolgbarkeit von Schmelze und Los",
      "Prozessbegleitende Prüfung — driftanfällige Maße werden überwacht",
      "Terminierte Lieferung — Losgröße und Lieferrhythmus nach Kapazität",
    ],
    technicalSpecs: [
      { label: "Rüsten", value: "Standardverfahren" },
      { label: "Freigabe", value: "Erstteilfreigabe" },
      { label: "Prüfung", value: "Nach Prüfplan" },
      { label: "Prozessbegleitende Prüfung", value: "Driftanfällige Maße" },
      { label: "Lieferung", value: "Nach Lieferplan" },
      { label: "Rückverfolgbarkeit", value: "Los- und Schmelzendokumentation" },
    ],
    advantages: [
      "Wiederholgenaue Spannung durch feste Bezugsflächen",
      "Gleichbleibende Qualität zwischen Losen durch standardisiertes Rüstverfahren",
      "Messergebnisse werden losweise dokumentiert",
      "Driftanfällige Maße werden prozessbegleitend überwacht",
      "Der Lieferplan ist an die Kapazitätsplanung gekoppelt",
      "Der Losstatus wird während der gesamten Fertigung dokumentiert",
    ],
    faq: [
      {
        question: "Gibt es eine Mindestmenge für die Serienfertigung?",
        answer: "Wir legen keine feste Mindestmenge fest. Losgröße, Lieferplan und Preise werden nach erfolgter Kapazitätsplanung mit dem Angebot festgelegt.",
      },
      {
        question: "Wie wird der Lieferplan festgelegt?",
        answer: "Nach der Kapazitätsplanung werden Losgröße und Lieferrhythmus gemeinsam vereinbart; wöchentliche oder periodische Lieferpläne sind möglich.",
      },
    ],
  },
  "ozel-projeler": {
    categoryLabel: "Fertigungslösungen",
    title: "Kundenspezifische Engineering-Projekte",
    metaTitle: "Sonderprojekte | Schlüsselfertig | F&E | Reverse Engineering | Mas Technic",
    metaDescription: "Kundenspezifische Engineering-Projekte jenseits des Standards: schlüsselfertige Lösungen, Reverse Engineering, F&E-Prototypen und Projektmanagement vom Konzept bis zur Fertigung.",
    description: "Schlüsselfertige Lösungen für kundenspezifische Projekte, bei denen Standardlösungen nicht ausreichen. Reverse Engineering, F&E und der gesamte Prozess vom Konzept bis zur Fertigung.",
    content: [
      "Bei kundenspezifischen Projekten, für die Standardlösungen nicht ausreichen, übernehmen wir Reverse Engineering (3D-Scan → CAD → Fertigung), F&E-Prototypenbau (Konzeptvalidierung → Funktionsprüfung) sowie Konstruktion und Fertigung kundenspezifischer Vorrichtungen. Bei Projekten mit Elektronik- oder Softwareanteil wird der mechanische Umfang gesondert definiert.",
      "Projektmanagement — alle Prozesse vom Konzept bis zur Fertigung aus einer Hand: Machbarkeitsanalyse, Volumenmodellkonstruktion, Prototypenfertigung, Prüfung und Validierung, Pilotfertigung und Übergang in die Serienfertigung. Jedes Projekt wird von einem eigenen Projektingenieur betreut.",
      "Beratung zur Produktentwicklung ist Teil des Prozesses. Wie technische Daten ausgetauscht und wie geistiges Eigentum behandelt wird, wird zu Projektbeginn schriftlich vereinbart.",
    ],
    features: [
      "Schlüsselfertig — Komplettlösung vom Konzept bis zur Fertigung",
      "Reverse Engineering — 3D-Scan, CAD-Modellierung, Fertigung",
      "F&E-Prototypenbau — Konzeptvalidierung und Funktionsprüfung",
      "Sondermaschinenbau — Fertigung von Vorrichtungen",
      "Mechanischer Umfang — Konstruktion und Fertigung",
      "Geistiges Eigentum — Bedingungen werden zu Projektbeginn schriftlich festgelegt",
    ],
    technicalSpecs: [
      { label: "Prozess", value: "Vom Konzept bis zur Fertigung" },
      { label: "3D-Scan", value: "Je nach Teilegröße" },
      { label: "Konstruktion", value: "Volumenmodell und Zeichnung" },
      { label: "Bedingungen", value: "Schriftlich zu Projektbeginn" },
      { label: "Projektmanagement", value: "Eigener Projektingenieur" },
    ],
    advantages: [
      "Schlüsselfertige Lösung vom Konzept bis zur Serienfertigung",
      "Ersatzteilfertigung durch Reverse Engineering",
      "Unterstützung bei F&E-Prototypenbau und Funktionsprüfung",
      "Bedingungen zu technischen Daten und geistigem Eigentum werden zu Beginn geregelt",
      "Ein Ansprechpartner durch einen eigenen Projektingenieur",
    ],
    faq: [
      {
        question: "Bieten Sie Reverse Engineering an?",
        answer: "Ja, wir digitalisieren Ihr vorhandenes Teil per 3D-Scan, überführen es in ein CAD-Modell und fertigen es; die Scangenauigkeit richtet sich nach Teilegröße und Oberfläche.",
      },
      {
        question: "Wie werden meine technischen Daten behandelt?",
        answer: "Wie technische Daten ausgetauscht und wie geistiges Eigentum behandelt wird, wird zu Projektbeginn schriftlich vereinbart. Teilen Sie uns Ihre Anforderungen in der Angebotsphase mit.",
      },
    ],
  },
  "yenilenebilir-enerji": {
    categoryLabel: "Energie & Infrastruktur",
    title: "Erneuerbare Energien",
    metaTitle: "Teilefertigung für erneuerbare Energien | Wind & Solar | Mas Technic",
    metaDescription: "Komponenten für Windenergie- und Solaranlagen. Korrosionsschutz durch Feuerverzinkung, hochbelastbare Teile. Fertigung von Naben, Pitchsystemen und Montagehalterungen.",
    description: "Komponenten für Windenergieanlagen, Solarenergie und Energiespeichersysteme, gefertigt aus Werkstoffen und Beschichtungen, die für den Außeneinsatz ausgewählt werden.",
    content: [
      "Wir fertigen Komponenten für Windenergieanlagen (Nabe, Gondel, Pitchsystem, Azimutsystem, Turmflansch), Montagesysteme für Solarmodule (Tracker, Festaufständerung, Schiene, Klemme) sowie Teile für Energiespeicher (Batteriegehäuse, Kühlkomponenten).",
      "Werkstoffe und Beschichtungen werden für den Außeneinsatz ausgewählt. Der Korrosionsschutz erfolgt durch Feuerverzinkung (ISO 1461), Dacromet-Beschichtung und den Werkstoff SS 316L; Schichtdicke und erwartete Lebensdauer richten sich nach Umgebungsklasse und Spezifikation. Hochbelastete Komponenten fertigen wir aus Sphäroguss GGG-40 und GGG-50 sowie hochfesten Stählen.",
    ],
    features: [
      "Windenergieanlage — Nabe, Pitch, Azimut, Turmflansch",
      "Solarmodul-Montage — Tracker, Schiene, Klemme",
      "Hochbelastete Komponenten — GGG-40/50 und hochfester Stahl",
      "Feuerverzinkung — ISO 1461",
      "Beständigkeit im Außeneinsatz — Werkstoff und Beschichtung nach Umgebungsklasse",
      "Energiespeicher — Batteriegehäuse, Kühlung",
    ],
    technicalSpecs: [
      { label: "Werkstoff", value: "SS 316L, GGG-40, S355" },
      { label: "Korrosionsschutz", value: "Feuerverzinkung (ISO 1461)" },
      { label: "Beständigkeit", value: "Nach Spezifikation" },
      { label: "Umfang", value: "Wind, Solar, Speicher" },
      { label: "ZfP", value: "Nach Spezifikation" },
    ],
    advantages: [
      "Werkstoff- und Beschichtungsauswahl für den Außeneinsatz",
      "Korrosionsschutz durch Feuerverzinkung",
      "Erfahrung in der Zerspanung von Gusseisen GGG-40/50",
      "ZfP-Umfang im Prüfplan nach Spezifikation",
    ],
    faq: [
      {
        question: "Können Sie Komponenten für Windenergieanlagen fertigen?",
        answer: "Ja; wir fertigen Naben, Pitchsysteme, Azimutmechanismen, Turmflansche und Innenkomponenten der Gondel. Die anzuwendende Spezifikation und die Abnahmekriterien werden für jeden Auftrag mit dem Kunden festgelegt.",
      },
      {
        question: "Wie wird die Beständigkeit im Außeneinsatz bestimmt?",
        answer: "Der Korrosionsschutz erfolgt durch Feuerverzinkung (ISO 1461) und eine umgebungsgerechte Werkstoffauswahl; die erwartete Lebensdauer im Außeneinsatz wird in der Spezifikation nach Umgebungsklasse und Beschichtungssystem festgelegt.",
      },
    ],
  },
  "petrol-gaz": {
    categoryLabel: "Energie & Infrastruktur",
    title: "Öl und Gas",
    metaTitle: "Teilefertigung für Öl und Gas | Mas Technic",
    metaDescription: "Komponenten für die Öl- und Gasindustrie; Zerspanung von Inconel, Duplex- und Super-Duplex-Stahl. Druck- und Temperaturklasse nach Kundenspezifikation.",
    description: "Kritische Teile für die Öl- und Gasindustrie; Druck- und Temperaturklasse nach Projektspezifikation.",
    content: [
      "Wir fertigen hochfeste Teile für die rauen Betriebsbedingungen der Öl- und Gasindustrie. Dazu gehören Komponenten für Bohrlochköpfe und Eruptionskreuze (Christmas Tree), Drossel- und Regelventile, Rohrverbindungsteile (API 6A Flansche, Hubs), Manifolds und BOP-Komponenten (Blowout Preventer).",
      "Bei Bohrlochkopf-, Pipelineventil- und Casing-Anwendungen sind Betriebsdruck und Temperaturbereich Projektanforderungen, die in der Kundenspezifikation festgelegt sind; das Teil wird nach dieser Anforderung gefertigt. Bei Sauergasanwendungen (Sour Service) werden Werkstoff, Wärmebehandlung und Härtegrenzen nach Kundenspezifikation festgelegt und dokumentiert.",
      "Wir verarbeiten korrosions- und hochtemperaturbeständige Werkstoffe wie Inconel 625/718, Duplex 2205, Super Duplex 2507, F22 (2.25Cr-1Mo) und SS 316L. Der Umfang der zerstörungsfreien Prüfung (RT, UT, MPI, PMI) wird im Prüfplan gemäß Spezifikation festgelegt.",
    ],
    features: [
      "Bohrlochkopf & Pipeline — Flansch, Hub, Ventilgehäuse",
      "Druckklasse — Projektanforderung, nach Spezifikation",
      "Sour Service — Werkstoff und Wärmebehandlung nach Spezifikation",
      "Inconel & Duplex — korrosionsbeständige Sonderlegierungen",
      "Zerstörungsfreie Prüfung — RT, UT, MPI, PMI; Umfang im Plan festgelegt",
    ],
    technicalSpecs: [
      { label: "Umfang", value: "Bohrlochkopf, Pipeline, Casing" },
      { label: "Druckklasse", value: "Projektanforderung (Spez.)" },
      { label: "Sour Service", value: "Nach Spezifikation" },
      { label: "Werkstoff", value: "Inconel, Duplex, F22" },
      { label: "ZfP", value: "RT, UT, MPI, PMI" },
    ],
    advantages: [
      "Fertigungskompetenz für Bohrlochkopf- und Pipelinekomponenten",
      "Werkstoffauswahl für Sour Service nach Spezifikation",
      "Erfahrung in der Zerspanung von Inconel und Super Duplex",
      "Der Umfang der zerstörungsfreien Prüfung wird im Prüfplan festgelegt",
    ],
    faq: [
      {
        question: "Welche Qualitätsnachweise werden für Öl- und Gaskomponenten bereitgestellt?",
        answer: "Werkstoffzeugnisse, Wärmebehandlungsnachweise und Berichte der zerstörungsfreien Prüfung werden in dem im Prüfplan festgelegten Umfang der Lieferdokumentation beigefügt.",
      },
      {
        question: "Können Sie Sour-Service-taugliche Teile fertigen?",
        answer: "Ja. Bei Sauergasanwendungen (Sour Service) werden Werkstoff, Wärmebehandlung und Härtegrenzen nach Kundenspezifikation festgelegt und dokumentiert.",
      },
    ],
  },
  "guc-dagitim-sistemleri": {
    categoryLabel: "Energie & Infrastruktur",
    title: "Energieverteilungssysteme",
    metaTitle: "Teilefertigung für die Energieverteilung | Mas Technic",
    metaDescription: "Komponenten für elektrische Verteilungs- und Energiesysteme: Stromschienen aus Kupfer und Aluminium, Kontaktteile, Isolatorbefestigungen. Leitfähigkeit per Werkstoffzeugnis bestätigt.",
    description: "Teile für elektrische Verteilerschränke, Transformatorkomponenten und Energieverteilungssysteme.",
    content: [
      "Wir fertigen Komponenten für elektrische Verteilungssysteme: Stromschienen aus Kupfer und Aluminium, Kontaktteile (versilbert, geringer Übergangswiderstand), Isolatorbefestigungen und Schaltschrank-Einbauteile. Die Spannungsklasse ist eine Projektanforderung, die in der Kundenspezifikation festgelegt ist.",
      "Wir fertigen Teile aus hochleitfähigen Werkstoffen wie OFE-Kupfer (C10100), ETP-Kupfer (C11000) und Elektroaluminium (1050/1070); der Leitfähigkeitswert wird durch das Werkstoffzeugnis bestätigt. Die Versilberung senkt den Übergangswiderstand, eine Nickelzwischenschicht wirkt als Diffusionssperre.",
      "Anforderungen an thermische Belastung, Kurzschlussfestigkeit und Lichtbogenverhalten werden in der Projektspezifikation festgelegt; das Teil wird nach diesen Anforderungen und der vom Kunden freigegebenen Konstruktion gefertigt.",
    ],
    features: [
      "Schaltschrank-Einbauteile — Isolatorbefestigungen und Verbindungselemente",
      "Spannungsklasse — Projektanforderung, nach Spezifikation",
      "Hohe Leitfähigkeit — OFE- und ETP-Kupfer, per Zeugnis bestätigt",
      "Versilberung — geringer Übergangswiderstand",
      "Stromschienenfertigung — Leiter aus Kupfer und Aluminium",
      "Fertigung nach Spezifikation — thermische und elektrische Anforderungen",
    ],
    technicalSpecs: [
      { label: "Werkstoff", value: "Cu (OFE, ETP), Al 1050" },
      { label: "Leitfähigkeit", value: "Laut Werkstoffzeugnis" },
      { label: "Spannungsklasse", value: "Projektanforderung (Spez.)" },
      { label: "Umfang", value: "Stromschiene, Kontakt, Isolatorhalter" },
      { label: "Beschichtung", value: "Ag (Silber), Ni-Zwischenschicht" },
      { label: "Prüfung", value: "Nach Spezifikation" },
    ],
    advantages: [
      "Zerspanung von hochleitfähigem Kupfer",
      "Geringer Übergangswiderstand durch Versilberung",
      "Fertigung nach den thermischen und elektrischen Anforderungen der Spezifikation",
    ],
    faq: [
      {
        question: "Können Sie OFE-Kupfer bearbeiten?",
        answer: "Ja, wir bearbeiten OFE-Kupfer (C10100) und ETP-Kupfer (C11000); der Leitfähigkeitswert wird durch das Werkstoffzeugnis bestätigt.",
      },
      {
        question: "Bieten Sie Versilberung an?",
        answer: "Ja, Kontaktteile werden versilbert (auf einer Nickelzwischenschicht). Prüfungen von Schichtdicke und Haftfestigkeit werden im Prüfplan nach Spezifikation festgelegt.",
      },
    ],
  },
  "madencilik-ekipmanlari": {
    categoryLabel: "Energie & Infrastruktur",
    title: "Bergbauausrüstung",
    metaTitle: "Teile für Bergbauausrüstung | Verschleißfester Stahl | Mas Technic",
    metaDescription: "Teilefertigung für Bergbaumaschinen aus verschleißfesten Werkstoffen wie Hardox und Manganstahl. Härte und Wärmebehandlung nach Spezifikation; Arbeitsbereich im Angebot.",
    description: "Verschleißfeste Komponenten aus Hardox und Manganstahl für die schweren Einsatzbedingungen im Bergbau.",
    content: [
      "Wir fertigen verschleiß- und schlagfeste Teile für die schweren Einsatzbedingungen im Bergbau. Dazu gehören Brecherkomponenten (Brechbacken, Hämmer, Auskleidungsplatten), Förderbandteile (Rollen, Trommeln, Gleitlager), Komponenten für Bohrausrüstung (Bohrkronen, Grundkörper, Adapter) sowie Sieb- und Klassierkomponenten.",
      "Wir fertigen aus Hardox 400/500/600 (Verschleißstahl), Manganstahl (Mn13 — kaltverfestigend unter Schlagbeanspruchung), weißem Gusseisen (Chromkarbid — extremer Verschleiß) und 42CrMo4 (QT — allgemeine Schwerlast). Oberflächenhärte und bei Bedarf Anforderungen an die Wärmebehandlung werden durch die Kundenspezifikation festgelegt.",
      "Für große, schwere Bergbauteile werden CNC- und konventionelle Bearbeitung gemeinsam geplant. Der Arbeitsbereich wird nach Prüfung von Teilegeometrie und Arbeitsplan im Angebot angegeben.",
    ],
    features: [
      "Brecherkomponente — Brechbacke, Hammer, Auskleidungsplatte",
      "Förderbandteil — Rolle, Trommel, Gleitlager",
      "Hardox 400/500/600 — Erfahrung mit Verschleißstahl",
      "Härte — Nach Spezifikation",
      "Manganstahl — kaltverfestigender Mn13",
    ],
    technicalSpecs: [
      { label: "Härte", value: "Nach Spezifikation" },
      { label: "Werkstoff", value: "Hardox, Mn13, 42CrMo4" },
      { label: "Arbeitsbereich", value: "Angabe im Angebot" },
      { label: "ZfP", value: "Nach Spezifikation" },
    ],
    advantages: [
      "Erfahrung mit Verschleißstahl Hardox 400/500/600",
      "Auswahl verschleißfester Werkstoffe",
      "Schlagfestigkeit durch Manganstahl",
      "Wärmebehandlung (Induktions-, Einsatzhärten) nach Spezifikation",
      "ZfP-Umfang nach Spezifikation festgelegt",
    ],
    faq: [
      {
        question: "Können Sie Hardox bearbeiten?",
        answer: "Ja, wir können Verschleißstähle der Serien Hardox 400, 500 und 600 auf CNC-Maschinen bearbeiten. Mit speziellen Werkzeugen und angepassten Vorschubparametern erzielen wir optimale Ergebnisse.",
      },
      {
        question: "Können Sie große, schwere Teile bearbeiten?",
        answer: "Der Arbeitsbereich wird nach Prüfung von Teilegeometrie und Arbeitsplan im Angebot angegeben. Für schwere Teile werden Kranbeladung und spezielle Spannvorrichtungen eingesetzt.",
      },
    ],
  },
};
