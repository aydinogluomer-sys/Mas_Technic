import type { CategoryText } from "@/content/en/types";

export const categories: Record<string, CategoryText> = {
  "hizmetler/talasli-imalat": {
    title: "Zerspanung",
    description: "Fertigung mit engen Toleranzen durch CNC-Fräsen, CNC-Drehen und Mikrozerspanung.",
    links: [
      { label: "CNC-Fräsen", description: "Fertigung im Standardtoleranzbereich von ±0,01 mm durch 3-, 4- und 5-Achs-CNC-Fräsen." },
      { label: "CNC-Drehen", description: "Wellen, Muttern und komplexe Drehteile auf mehrachsigen Drehzentren." },
      { label: "Mikrozerspanung", description: "Mikrofräsen und Mikrodrehen mit Werkzeugen kleinen Durchmessers." },
      { label: "Tieflochbohren & Reiben", description: "Präzise Bohrungsgeometrien durch Tieflochbohren und Reiben." },
    ],
  },
  "hizmetler/on-uretim": {
    title: "Vorserie",
    description: "Umfassende Unterstützung in der Produktentwicklung durch Werkzeugbau, Guss- und Prototypenverfahren.",
    links: [
      { label: "Spritzgießwerkzeuge", description: "Konstruktion und Fertigung von Kunststoff-Spritzgießwerkzeugen." },
      { label: "Druckguss", description: "Druckgussfertigung aus Aluminium- und Zinklegierungen." },
      { label: "Silikonabformung", description: "Fertigung flexibler, langlebiger Silikonteile." },
      { label: "Vorrichtungs- & Spannmittelkonstruktion", description: "Höhere Fertigungseffizienz durch kundenspezifische Vorrichtungskonstruktion." },
    ],
  },
  "hizmetler/yuzey-islemleri": {
    title: "Oberflächenbehandlungen",
    description: "Hohe Oberflächenqualität für Ihre Teile durch Eloxieren, Lackierung, Beschichtung und chemische Behandlungen.",
    links: [
      { label: "Mechanische Oberflächenbearbeitung", description: "Oberflächenvorbereitung durch Strahlen, Gleitschleifen, Polieren und Bürsten." },
      { label: "Eloxieren", description: "Korrosionsbeständigkeit und ein dekoratives Erscheinungsbild für Aluminiumteile." },
      { label: "Chemische Behandlungen", description: "Passivieren, Phosphatieren und chemische Beschichtung." },
      { label: "Lackierung & Schutzbeschichtungen", description: "Pulverbeschichtung, Grundierung und spezielle Beschichtungslösungen." },
    ],
  },
  "hizmetler/isaretleme-tanimlama": {
    title: "Markierung & Kennzeichnung",
    description: "Rückverfolgbarkeit und Kennzeichnung von Teilen durch Lasergravur, QR-Codes und Beschriftung.",
    links: [
      { label: "Lasergravur", description: "Teilekennzeichnung durch dauerhafte Laserbeschriftung." },
      { label: "Laserkennzeichnung durch Anlassen", description: "Beschriftung durch thermische Farbänderung, ohne Materialabtrag." },
      { label: "QR- & DataMatrix-Codes", description: "2D-Code-Anwendungen nach Industriestandards." },
      { label: "Logo & Kennzeichnung", description: "Kennzeichnung mit Logos, Seriennummern und individuellen Motiven." },
    ],
  },
  "hizmetler/montaj-birlestirme": {
    title: "Montage & Fügen",
    description: "Komplettfertigung durch Setzen von Gewindeeinsätzen, mechanische Montage, Kitting und Schweißkonstruktion.",
    links: [
      { label: "Gewindeeinsätze setzen", description: "Setzen von Gewindeeinsätzen per Ultraschall und Wärme." },
      { label: "Mechanische Montage", description: "Baugruppenmontage und Komplettmontage von Produkten." },
      { label: "Kitting & Verpackung", description: "Kit-Zusammenstellung und kundenspezifische Verpackungslösungen." },
      { label: "Schweißkonstruktionen", description: "WIG-, MIG/MAG- und Widerstandsschweißen." },
    ],
  },
  "kabiliyetler/uretim-altyapisi": {
    title: "Fertigungsinfrastruktur",
    description: "Moderne CNC-Maschinen, Messmittel und eine breite Werkstoffbibliothek.",
    links: [
      { label: "Maschinenpark", description: "CNC-Drehkompetenz mit 3-, 4- und 5-Achs-Bearbeitungszentren." },
      { label: "Werkstoffbibliothek", description: "Aluminium, Stahl, Edelstahl, Titan, Kupferlegierungen und technische Kunststoffe." },
    ],
  },
  "kabiliyetler/kalite-standartlar": {
    title: "Qualität & Normen",
    description: "Definierte Prozesse der Qualitätskontrolle und Messprotokolle im Rahmen von ISO 9001:2015.",
    links: [
      { label: "Qualitätskontrolle", description: "KMG, optische Messsysteme und Oberflächenmesssysteme." },
      { label: "Toleranz & Präzision", description: "Fertigung und Prüfung im Standardtoleranzbereich von ±0,01 mm." },
    ],
  },
  "kabiliyetler/muhendislik-destegi": {
    title: "Engineering-Support",
    description: "Fachkundige technische Beratung zu DFM-Analyse, Konstruktionsoptimierung und Oberflächenbehandlungen.",
    links: [
      { label: "Konstruktionsleitfaden (DFM)", description: "Analyse der Fertigbarkeit und Konstruktionsoptimierung." },
      { label: "Oberflächenbehandlungen", description: "Auswahl und Anwendung von Oberflächen aus ingenieurtechnischer Sicht." },
    ],
  },
  "kabiliyetler/prototipten-seri-uretime": {
    title: "Vom Prototyp zur Serie",
    description: "Flexible Fertigungskapazität vom Einzelteil bis zu Tausenden von Stück.",
    links: [
      { label: "Kleinserienfertigung", description: "Prototypen und Kleinserien von 1-100 Stück." },
      { label: "Serienfertigung", description: "Serienfertigung mit reproduzierbarer Aufspannung und Prüfplan." },
    ],
  },
  "kabiliyetler/surec-operasyon": {
    title: "Prozess & Betrieb",
    description: "Ein planbarer Fertigungsprozess durch Projektmanagement, Lieferkette und Betriebsplanung.",
    links: [
      { label: "Projektmanagement", description: "Durchgängige Projektkoordination und Berichterstattung." },
      { label: "Lieferkette", description: "Lieferantenauswahl, Rückverfolgbarkeit der Werkstoffe und Chargendokumentation." },
      { label: "Betriebliche Effizienz", description: "Schlanke Fertigung und kontinuierliche Verbesserung." },
    ],
  },
  "endustriyel/yuksek-teknoloji": {
    title: "Hochtechnologie",
    description: "Hochpräzise Fertigung für kritische Branchen wie Luft- und Raumfahrt, Verteidigung und Robotik.",
    links: [
      { label: "Luft- & Raumfahrt", description: "Fertigung von Präzisionsteilen für Anwendungen in der Luft- und Raumfahrt." },
      { label: "Verteidigung", description: "Rückverfolgbare Präzisionsfertigung nach Spezifikation." },
      { label: "Robotik", description: "Roboterkomponenten und Automatisierungsteile." },
    ],
  },
  "endustriyel/seri-uretim-endustriyel": {
    title: "Serienfertigung",
    description: "Fertigung hoher Stückzahlen für die Automobilindustrie, die Medizintechnik und die Schifffahrt.",
    links: [
      { label: "Automobil", description: "Reproduzierbare Teilefertigung für Automobilanwendungen." },
      { label: "Medizintechnik", description: "Präzisionszerspanung von Medizinprodukte- und Implantatteilen." },
      { label: "Segel- & Yachtsysteme", description: "Korrosionsbeständige Teile für die Schifffahrt." },
    ],
  },
  "endustriyel/endustriyel-sistemler": {
    title: "Industriesysteme",
    description: "Industrielle Teilefertigung für Hydraulik, Pneumatik, Rohrverbindungsteile und Klimatechnik.",
    links: [
      { label: "Hydraulik & Pneumatik", description: "Hydraulik- und Pneumatikkomponenten für hohe Drücke." },
      { label: "Rohre & Rohrverbindungsteile", description: "Flansche, Nippel und kundenspezifische Verbindungsteile." },
      { label: "Klimatechnik", description: "Komponenten für HLK- und Kältesysteme." },
    ],
  },
  "endustriyel/uretim-cozumleri": {
    title: "Fertigungslösungen",
    description: "Flexible Fertigung vom Prototyp bis zur Serie, von Kleinserien bis zu Großaufträgen.",
    links: [
      { label: "Prototypenfertigung", description: "Produktvalidierung durch Rapid Prototyping." },
      { label: "Kleinserie", description: "Kleinserienfertigung von 10-100 Stück." },
      { label: "Serienfertigung", description: "Reproduzierbare Serienfertigung nach Prüfplan." },
      { label: "Sonderprojekte", description: "Kundenspezifische Engineering-Lösungen." },
    ],
  },
  "endustriyel/enerji-altyapi": {
    title: "Energie & Infrastruktur",
    description: "Industrielle Fertigung für erneuerbare Energien, Öl und Gas sowie Energieverteilungssysteme.",
    links: [
      { label: "Erneuerbare Energien", description: "Komponenten für Windkraftanlagen und Solarmodule." },
      { label: "Öl & Gas", description: "Teile mit hoher Druck- und Temperaturbeständigkeit." },
      { label: "Energieverteilungssysteme", description: "Ausrüstung für Energieübertragung und -verteilung." },
      { label: "Bergbauausrüstung", description: "Verschleißfeste Teile für den Bergbau." },
    ],
  },
};
