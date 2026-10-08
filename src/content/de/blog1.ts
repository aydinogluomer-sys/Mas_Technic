import type { BlogText } from "@/content/en/types";

export const blog1: Record<string, BlogText> = {
  "5-eksen-cnc-isleme-avantajlari": {
    title: "Die Vorteile der 5-Achs-CNC-Bearbeitung",
    excerpt: "Der eigentliche Gewinn der fünf Achsen ist nicht die Geschwindigkeit, sondern die Zahl der Aufspannungen: Jede neue Aufspannung ist eine neue Quelle für Bezugsfehler.",
    readTime: "8 Min. Lesezeit",
    category: "Technik",
    imageAlt: "Ein Fräswerkzeug in der Spindel bearbeitet unter Kühlschmierstoff die schräge Fläche eines blanken Metallkörpers",
    imageCaption: "Ein Fräswerkzeug erreicht mehrere Flächen in einer einzigen Aufspannung",
    sections: [
      {
        heading: "Was fünf Achsen bedeuten",
        paragraphs: [
          "Die Fünfachsbearbeitung ergänzt die Linearachsen X, Y und Z um zwei Rundachsen (A und B oder A und C). Der Gewinn: Das Werkzeug kann sich dem Bauteil aus jedem Winkel nähern, nicht nur von oben.",
          "In der Praxis entspricht das zwei unterschiedlichen Arbeitsweisen: der 3+2-Bearbeitung, bei der die Rundachsen positionieren und dann klemmen, und der simultanen Fünfachsbearbeitung, bei der sich alle fünf Achsen gleichzeitig bewegen. Komplexe Freiformflächen erfordern die zweite; für die meisten mehrseitigen prismatischen Bauteile genügt die erste.",
        ],
      },
      {
        heading: "Der eigentliche Gewinn: die Zahl der Aufspannungen",
        paragraphs: [
          "Ein Bauteil ein zweites Mal aufzuspannen, kostet nicht nur Zeit. Jede neue Aufspannung bedeutet eine neue Bezugsfläche, ein neues Nullpunktsetzen und damit eine neue Fehlerquelle; der Zusammenhang zwischen einem Maß aus der ersten und einem Maß aus der zweiten Aufspannung ist nur so gut wie die Ausrichtung der beiden Aufspannungen zueinander.",
          "Bei der Fünfachsbearbeitung wird das Bauteil einmal gespannt, und alle zugänglichen Flächen werden aus demselben Bezugssystem bearbeitet. Form- und Lagetoleranzen — Koaxialität, Rechtwinkligkeit, Position — in einer einzigen Aufspannung einhalten zu können, ist der eine große messbare Unterschied der fünf Achsen.",
        ],
      },
      {
        heading: "Werkzeugwinkel und Oberfläche",
        paragraphs: [
          "Steht seine Achse senkrecht zur Oberfläche, arbeitet ein Kugelfräser in seinem Zentrum mit der Schnittgeschwindigkeit null: Dort wird der Werkstoff nicht geschnitten, sondern verschmiert. Die Rundachsen neigen das Werkzeug, um diesen toten Punkt von der Oberfläche wegzubewegen, sodass am wirksamen Durchmesser geschnitten wird.",
          "Das Ergebnis ist eine glattere Oberfläche bei gleichem Vorschub und ein geringerer Bedarf an Nachbearbeitung. Die erreichbare Oberflächenrauheit hängt von Werkstoff, Werkzeug, Spannung und geforderter Toleranz ab; deshalb sollte der Ziel-Ra-Wert auf der Zeichnung angegeben und in der Angebotsphase gemeinsam bestätigt werden.",
        ],
      },
      {
        heading: "Standzeit und Vibration",
        paragraphs: [
          "Den Werkzeugwinkel steuern zu können, heißt auch, die Richtung der Schnittkraft steuern zu können. Liegt die Kraft näher an der Werkzeugachse, verringert sich die Abdrängung; weniger Abdrängung bedeutet weniger Vibration, und weniger Vibration bedeutet weniger Schlagbelastung an der Schneide.",
          "Fünf Achsen ermöglichen es außerdem, tiefe Bereiche mit einem kurzen Werkzeug zu erreichen. Das Bauteil zu neigen und dieselbe Tasche mit einem kurzen statt einem langen Werkzeug zu bearbeiten, verringert die Werkzeugabdrängung unmittelbar — denn die Abdrängung wächst mit der dritten Potenz der Auskraglänge.",
        ],
      },
      {
        heading: "Wann sie nicht nötig sind",
        paragraphs: [
          "Fünf Achsen sind nicht für jedes Bauteil die richtige Antwort. Bei einem flachen Bauteil, das aus einer Richtung erreichbar ist, bringen fünf Achsen keine zusätzliche Genauigkeit; sie bringen eine längere Programmierzeit und eine teurere Aufspannung.",
          "Die Prüffrage lautet: Sind die kritischen Form- und Lagetoleranzen des Bauteils zwischen verschiedenen Flächen definiert? Wenn ja, rechtfertigt das Einhalten dieser Toleranzen in einer einzigen Aufspannung die fünf Achsen. Wenn nicht, sind drei Achsen meist wirtschaftlicher und ebenso genau.",
        ],
      },
    ],
  },
  "havacilik-parcalarinda-malzeme-secimi": {
    title: "Werkstoffauswahl für Luft- und Raumfahrtteile",
    excerpt: "Die Wahl zwischen Aluminium 7075-T6 und Ti-6Al-4V ist kein Festigkeitsvergleich, sondern eine Entscheidung über Einsatztemperatur und Kosten.",
    readTime: "6 Min. Lesezeit",
    category: "Werkstoff",
    imageAlt: "Vier zylindrische Metallproben nebeneinander auf schwarzem Hintergrund; ihre Stirnflächen gedreht, geschliffen und gebürstet",
    imageCaption: "Proben gleicher Geometrie, bearbeitet in zwei Legierungen",
    sections: [
      {
        heading: "Zwei Kandidaten",
        paragraphs: [
          "Bei Strukturbauteilen für die Luft- und Raumfahrt fällt die Entscheidung oft zwischen zwei Werkstoffen: Aluminium 7075-T6 und Titan Ti-6Al-4V (Grade 5). Beide sind etabliert, beide gut verfügbar, und für beide gibt es eine dokumentierbare Lieferkette.",
          "Mit dem Vergleich der Festigkeit im Verhältnis zum Gewicht ist die Wahl nicht getroffen, denn die beiden Werkstoffe stoßen an unterschiedliche Grenzen: der eine an die Temperatur, der andere an die Kosten.",
        ],
      },
      {
        heading: "Aluminium 7075-T6",
        paragraphs: [
          "Mit einer Zugfestigkeit von etwa 572 MPa und einer Dichte von 2,81 g/cm³ liegt 7075-T6 am oberen Ende der Aluminiumlegierungen. Es lässt sich gut zerspanen: Es erlaubt hohe Schnittgeschwindigkeiten, führt die Wärme mit den Spänen ab und belastet die Standzeit nicht.",
          "Seine Grenzen sind Temperatur und Korrosion. Der Zustand T6 verliert bei hoher Temperatur seine Eigenschaften, und die Legierung ist anfällig für Spannungsrisskorrosion; deshalb ist eine Oberflächenbehandlung (typischerweise Eloxieren) keine Option, sondern Teil der Konstruktion.",
        ],
      },
      {
        heading: "Ti-6Al-4V (Grade 5)",
        paragraphs: [
          "Mit einer Zugfestigkeit von etwa 950 MPa und einer Dichte von 4,43 g/cm³ bietet Ti-6Al-4V eine stahlähnliche Festigkeit bei deutlich geringerer Dichte. Es behält seine Eigenschaften bis etwa 350 °C und ist dank seiner natürlichen Oxidschicht ohne zusätzliche Beschichtung korrosionsbeständig.",
          "Der Preis dafür ist die Zerspanbarkeit. Titan leitet Wärme schlecht: Der Großteil der in der Schnittzone entstehenden Wärme fließt über die Schneide ab, nicht mit dem Span. Hinzu kommt seine chemische Reaktionsfreudigkeit, und die Schnittgeschwindigkeiten müssen sinken, Werkzeuggeometrie und Kühlstrategie werden entsprechend gewählt.",
        ],
      },
      {
        heading: "Im direkten Vergleich",
        paragraphs: [
          "Die folgenden Werte sind veröffentlichte typische Werte aus den Werkstoffnormen; sie ersetzen kein Chargenzeugnis. Die für einen Auftrag verwendeten Werte werden dem Werkstoffzeugnis der jeweiligen Charge entnommen.",
        ],
        table: {
          caption: "7075-T6 und Ti-6Al-4V — veröffentlichte typische Werte",
          note: "Quelle: typische Wertebereiche aus den Werkstoffnormen. Für Chargenwerte ist das Werkstoffzeugnis maßgeblich.",
          headers: ["EIGENSCHAFT", "AL 7075-T6", "TI-6AL-4V"],
          rows: [
            ["Zugfestigkeit", "~572 MPa", "~950 MPa"],
            ["Dichte", "2,81 g/cm³", "4,43 g/cm³"],
            ["Einsatztemperatur", "Begrenzt", "Bis ~350 °C"],
            ["Korrosionsbeständigkeit", "Abhängig von der Oberflächenbehandlung", "Natürliche Oxidschicht"],
            ["Zeitspanvolumen", "Hoch", "Niedrig"],
          ],
        },
      },
      {
        heading: "Woher der Kostenunterschied kommt",
        paragraphs: [
          "Zwei Kostenpositionen sind getrennt zu betrachten. Beim Rohmaterial ist Titan deutlich teurer, und sein Preis schwankt mit der Marktlage; den aktuellen Unterschied nennen wir in der Angebotsphase mit dem Preis des Lieferanten, denn ein fester Faktor wäre ein Jahr später falsch.",
          "Bei der Bearbeitung liegt der Unterschied in der Maschinenzeit: Niedrigere Schnittgeschwindigkeit, häufigere Werkzeugwechsel und eine vorsichtigere Schnitttiefe bedeuten, dass dieselbe Geometrie in Titan länger dauert als in Aluminium. Deshalb lohnt sich eine Vereinfachung der Konstruktion bei Titan mehr als bei Aluminium.",
        ],
      },
      {
        heading: "Die entscheidende Prüfung",
        paragraphs: [
          "Solange Einsatztemperatur, korrosive Umgebung und Ermüdungsbelastung des Bauteils nicht bekannt sind, ist die Werkstoffauswahl keine Wahl, sondern eine Vermutung. Sind diese drei bekannt, ergibt sich die Entscheidung oft von selbst: Titan, wenn Temperatur oder Korrosion entscheiden, 7075-T6, wenn Gewicht und Kosten entscheiden.",
          "Wenn Sie zwischen beiden schwanken, senden Sie uns Ihre Zeichnung; für dieselbe Geometrie kann in beiden Werkstoffen eine getrennte Preiskalkulation erstellt werden. Unser Standardtoleranzbereich liegt in beiden Werkstoffen bei ±0,01 mm.",
        ],
      },
    ],
  },
  "dfm-tasarimdan-uretime-gecis": {
    title: "DFM: von der Konstruktion zur Fertigung",
    excerpt: "Bei einer Prüfung auf Fertigungsgerechtheit geht es nicht darum, die Konstruktion zu ändern, sondern zu fragen, warum jedes Maß tatsächlich den Wert hat, den es hat.",
    readTime: "10 Min. Lesezeit",
    category: "Engineering",
    imageAlt: "Ein bearbeiteter Metallkörper mit Bohrungen und Flanschen liegt auf seiner eigenen bemaßten technischen Zeichnung",
    imageCaption: "Modell und technische Zeichnung nebeneinander bei der Prüfung auf Fertigungsgerechtheit",
    sections: [
      {
        heading: "Was DFM ist und was nicht",
        paragraphs: [
          "Design for Manufacturing (DFM), die fertigungsgerechte Konstruktion, bedeutet, die Konstruktion auf das Fertigungsverfahren abzustimmen. Es heißt nicht, die Konstruktion zu vereinfachen; es heißt, Kosten zu beseitigen, die die Funktion nicht erfordert, während die Funktion des Bauteils erhalten bleibt.",
          "Die Prüfung beginnt immer mit derselben Frage: Warum hat dieses Maß diesen Wert? Ein Maß mit einer Antwort bleibt unverändert. Ein Maß, dessen Antwort „kam aus der CAD-Vorlage“ lautet, ist oft das teuerste.",
        ],
      },
      {
        heading: "Toleranz",
        paragraphs: [
          "Die Toleranz ist der Einzelposten, der die Kosten am schnellsten nach oben treibt, denn eine enge Toleranz bedeutet nicht nur langsamer zu bearbeiten, sondern auch mehr zu messen. Unser Standardtoleranzbereich liegt bei ±0,01mm; er wird dort angewendet, wo ein Maß ihn tatsächlich benötigt.",
          "Genügen dagegen auf einer Fläche ohne Funktion in der Baugruppe ±0,05 mm, bringt es nichts, an dieses Maß ±0,01 mm zu schreiben. In der Praxis ist das ergiebigste DFM-Ergebnis, einen kleinen Teil der Zeichnungsmaße als kritisch zu kennzeichnen und den Rest der Allgemeintoleranzklasse zu überlassen.",
        ],
      },
      {
        heading: "Innenradius",
        paragraphs: [
          "Beim Fräsen hat eine Innenecke immer einen Radius, und dieser Radius kann nicht kleiner sein als der halbe Werkzeugdurchmesser. Eine Konstruktion, die eine scharfe Innenecke verlangt, braucht entweder ein zweites Verfahren wie EDM oder eine konstruktive Lösung wie einen Eckenfreistich.",
          "Grundregel: Geben Sie den größtmöglichen Innenradius vor. Ein großer Radius erlaubt die Arbeit mit einem Werkzeug mit größerem Durchmesser und höherer Steifigkeit; ein steifes Werkzeug drängt weniger ab, sodass die Oberfläche glatter und die Maßhaltigkeit besser wird.",
        ],
      },
      {
        heading: "Wandstärke und Spannung",
        paragraphs: [
          "Bei dünnwandigen Bauteilen liegt die eigentliche Schwierigkeit nicht im Schneiden, sondern im Spannen: Schnittkraft und Wärme verschieben das Bauteil während der Bearbeitung, und das Maß stimmt auf der Maschine, aber nicht bei der Prüfung. Als allgemeiner Ausgangspunkt erfordern Wände unter 0,5 mm in Aluminium und 1 mm in Stahl eine spezielle Spannung und eine gestufte Schnittstrategie.",
          "Diese Werte sind keine Grenze, sondern eine Warnschwelle. Höhe, Länge und Abstützung der Wand sind mindestens ebenso wichtig wie ihre Stärke; deshalb sollten bei einem dünnwandigen Bauteil Bearbeitungsreihenfolge und Spannkonzept gemeinsam mit der Konstruktion besprochen werden.",
        ],
      },
      {
        heading: "Wie die Prüfung abläuft",
        paragraphs: [
          "Bei uns ist die Prüfung auf Fertigungsgerechtheit Teil der Angebotsphase, keine nachträgliche Revision. Liegen das 3D-Modell und die bemaßte technische Zeichnung vor, werden Maß-, Toleranz- und Oberflächenanforderungen anhand des gewählten Fertigungsverfahrens geprüft.",
          "Das Ergebnis ist kein Bericht, sondern eine Fragenliste: Die Punkte, die die Kosten deutlich beeinflussen, und für jeden einen Alternativvorschlag senden wir schriftlich mit dem Angebot. Die Entscheidung trifft der Konstrukteur; wir sagen nur, was jede Entscheidung kostet.",
        ],
      },
    ],
  },
};
