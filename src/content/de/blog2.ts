import type { BlogText } from "@/content/en/types";

export const blog2: Record<string, BlogText> = {
  "cnc-torna-frezeleme-farki": {
    title: "CNC-Drehen oder CNC-Fräsen: Was ist die richtige Wahl?",
    excerpt: "Die Geometrie des Teils beantwortet die Frage: Dreht sich das Teil oder das Werkzeug? Das ist der Entscheidungspunkt, nicht die Maschinenliste.",
    readTime: "7 Min. Lesezeit",
    category: "Technik",
    imageAlt: "Eine CNC-Frässpindel mit Schneidwerkzeug bearbeitet einen prismatischen Metallblock unter Kühlschmierstoff",
    imageCaption: "Prismatische Geometrie: Das Werkzeug dreht sich, das Teil steht still",
    sections: [
      {
        heading: "Ein einziger Unterschied",
        paragraphs: [
          "Der Unterschied zwischen den beiden grundlegenden Zerspanungsverfahren passt in einen Satz: Beim Drehen rotiert das Werkstück und das Werkzeug steht still; beim Fräsen rotiert das Werkzeug und das Werkstück steht still oder bewegt sich kontrolliert.",
          "Dieser Unterschied ist kein technisches Detail; er entscheidet unmittelbar, welche Geometrie sich mit welchem Verfahren auf natürliche Weise ergibt.",
        ],
      },
      {
        heading: "Was das Drehen gut kann",
        paragraphs: [
          "Alles Rotationssymmetrische: Wellen, Buchsen, Muttern, Hülsen, Flansche. Da sich das Teil um seine eigene Achse dreht, entsteht eine zylindrische Fläche durch eine einzige kontinuierliche Schnittbewegung; das ist schnell und hinterlässt eine glatte Oberfläche.",
          "Die eigentliche Stärke des Drehens zeigt sich nicht in der Durchmessertoleranz, sondern in der KOAXIALITÄT. Zwei in derselben Aufspannung bearbeitete Durchmesser sind aufeinander bezogen; dieselbe Beziehung auf einer Fräsmaschine herzustellen, bedeutet zwei separate Aufspannungen und einen Ausrichtfehler.",
        ],
      },
      {
        heading: "Was das Fräsen gut kann",
        paragraphs: [
          "Ebene Flächen, Taschen, Nuten, Bohrbilder und dreidimensionale Freiformflächen. Gehäuse, Platten, Halterungen und Werkzeugkomponenten gehören zu dieser Klasse.",
          "Die Stärke des Fräsens ist die Flexibilität: Unterschiedliche Merkmale lassen sich in derselben Aufspannung mit unterschiedlichen Werkzeugen bearbeiten, und mit zusätzlichen Rundachsen können mehrere Seiten des Teils aus einem einzigen Bezugssystem bearbeitet werden.",
        ],
      },
      {
        heading: "Der Auswahltest",
        paragraphs: [
          "Die allgemeine Regel ist einfach: Ist die Hauptgeometrie des Teils rotationssymmetrisch, wird gedreht; ist sie prismatisch, wird gefräst. Entschieden wird anhand des Merkmals mit der engsten Toleranz — das Verfahren, das dieses Merkmal in einer Aufspannung herstellt, ist das Hauptverfahren.",
          "Die meisten realen Teile benötigen beides: eine gefräste Fläche und ein Bohrbild an einem gedrehten Grundkörper. Dann kommt es auf die Reihenfolge an; die Fläche, auf die sich die zweite Operation bezieht, muss in der ersten bearbeitet worden sein.",
        ],
      },
      {
        heading: "Komplettbearbeitung",
        paragraphs: [
          "Dreh-Fräs-Kinematik — angetriebene Werkzeuge, C- und Y-Achse — vereint beide Operationen in einer einzigen Aufspannung. Der Gewinn liegt auch hier in der Zahl der Aufspannungen: Rotationssymmetrische und prismatische Merkmale bleiben im selben Bezugssystem.",
          "Welches Verfahren zu Ihrem Teil passt, entscheiden wir gemeinsam anhand der technischen Zeichnung; Einzelheiten finden Sie auf den Leistungsseiten CNC-Drehen und CNC-Fräsen.",
        ],
      },
    ],
  },
  "kalite-kontrol-cmm-olcum": {
    title: "Qualitätskontrolle: Messprozesse mit dem KMG",
    excerpt: "Eine Messung ist nur eine Zahl, solange sie nicht angibt, auf welchen Bezug sie sich stützt. Genau das leistet ein KMG.",
    readTime: "9 Min. Lesezeit",
    category: "Qualität",
    imageAlt: "Ein KMG in Portalbauweise tastet ein zylindrisches Teil auf einem Granittisch in einem abgedunkelten Messraum ab",
    imageCaption: "Prüfung der im Prüfplan festgelegten Merkmale",
    sections: [
      {
        heading: "Was ein KMG misst",
        paragraphs: [
          "Ein Koordinatenmessgerät (KMG) erfasst Punkte auf der Oberfläche eines Teils und rekonstruiert deren Geometrie in einem Koordinatensystem. Es liefert, was ein Messschieber oder eine Messschraube nicht leisten kann: nicht nur das Maß, sondern auch FORM und LAGE.",
          "Geometrische Merkmale wie Ebenheit, Zylinderform, Rechtwinkligkeit, Position und Rundlauf lassen sich nicht durch eine einzelne Messung ausdrücken; sie beschreiben, wie sich eine Fläche relativ zu einem Bezug verhält, und können nur durch Koordinatenmessung geprüft werden.",
        ],
      },
      {
        heading: "Bezug: wo die Messung beginnt",
        paragraphs: [
          "Die Messung beginnt mit dem Aufbau des Koordinatensystems des Teils. Die Bezugsflächen aus der Zeichnung werden mit dem Taster abgetastet, und das teileigene Bezugssystem wird aufgebaut; jedes weitere Ergebnis bezieht sich auf dieses System.",
          "Deshalb kann dasselbe Teil bei zwei unterschiedlichen Bezugsaufbauten zwei unterschiedliche Ergebnisse liefern — und beide sind richtig. Dass ein Messprotokoll angibt, auf welchen Bezug es sich stützt, ist ebenso wichtig wie das Protokoll selbst.",
        ],
      },
      {
        heading: "Erstteilprüfung",
        paragraphs: [
          "Bei der ersten Fertigung eines neuen Teils werden alle kritischen Maße geprüft. Ziel ist nicht nur die Freigabe dieses Teils, sondern der Nachweis, dass Bearbeitungsprogramm und Aufspannung korrekt sind; wer vor dieser Prüfung in die Serienfertigung geht, vervielfacht den Fehler.",
          "In welchem Format diese Prüfung dokumentiert wird, legt die Kundenspezifikation fest. Wenn Ihre Branche ein bestimmtes Formular verlangt, genügt ein Hinweis in der Angebotsphase.",
        ],
      },
      {
        heading: "Überwachung in der Serienfertigung",
        paragraphs: [
          "In der Serienfertigung ist es weder notwendig noch wirtschaftlich, jedes Teil vollständig zu messen. Stattdessen legt der Prüfplan fest, welches Maß wie oft gemessen wird, und die Verteilung der Messergebnisse wird überwacht.",
          "Überwacht wird nicht die Konformität eines einzelnen Teils, sondern die Lage der Verteilung innerhalb des Toleranzbands. Driftet die Verteilung, wird eingegriffen, auch wenn noch kein fehlerhaftes Teil entstanden ist — das ist der Unterschied zwischen Qualitätskontrolle und Sortierung.",
        ],
      },
      {
        heading: "So arbeiten wir",
        paragraphs: [
          "Für jeden Auftrag wird ein Prüfplan erstellt: welches Maß in welcher Phase mit welcher Methode geprüft wird und welcher Nachweis daraus hervorgeht. Dieser Plan wird vor Fertigungsbeginn festgelegt.",
          "Die Messprotokolle werden der Lieferdokumentation beigefügt. Eine akkreditierte KMG-Messung durch Dritte ist auf Anfrage möglich; verlangt Ihre Branche einen bestimmten Messumfang, legen wir ihn in der Angebotsphase gemeinsam fest.",
        ],
      },
    ],
  },
  "endustriyel-yuzey-islemleri-rehberi": {
    title: "Leitfaden für industrielle Oberflächenbehandlungen",
    excerpt: "Eloxieren, Passivieren, Pulverbeschichten, Elektropolieren: was jedes Verfahren auf welchem Werkstoff bewirkt und was die Spezifikation enthalten muss.",
    readTime: "12 Min. Lesezeit",
    category: "Leitfaden",
    imageAlt: "Makroaufnahme: die Kanten gestrahlter, gebürsteter und polierter Metalloberflächen nebeneinander",
    imageCaption: "Vier unterschiedliche Oberflächengüten auf derselben Legierung",
    sections: [
      {
        heading: "Oberflächenbehandlung ist kein Zusatz",
        paragraphs: [
          "Oft wird angenommen, bei der Oberflächenbehandlung gehe es um das Aussehen. In der Praxis entscheiden drei Dinge: Korrosion, Verschleiß und elektrisches/thermisches Verhalten. Keines davon lässt sich durch Zerspanung lösen.",
          "Deshalb ist die Oberflächenbehandlung eine Konstruktionsentscheidung und gehört in die Zeichnung — welche Norm, welcher Typ, welche Klasse und welche Schichtdicke. „Eloxieren“ ist keine Spezifikation.",
        ],
      },
      {
        heading: "Eloxieren — Aluminium",
        paragraphs: [
          "Beim Eloxieren wird auf der Aluminiumoberfläche elektrochemisch kontrolliert eine Oxidschicht erzeugt. Die Schicht ist keine Beschichtung; sie entsteht aus dem Werkstoff selbst und blättert daher nicht ab und löst sich nicht.",
          "Nach MIL-A-8625 wird Typ II (Schwefelsäure, typisch 10-25 µm) für allgemeinen Schutz und Einfärbung verwendet, Typ III (Harteloxieren, typisch 25-100 µm) für Flächen, die eine hohe Verschleißfestigkeit benötigen. Da die Schicht nach außen wächst, verändert sie die Maße: Bei eng tolerierten Flächen muss dieses Aufmaß in der Konstruktion berücksichtigt werden.",
        ],
      },
      {
        heading: "Passivieren — Edelstahl",
        paragraphs: [
          "Beim Passivieren wird freies Eisen chemisch von der Edelstahloberfläche entfernt, sodass sich die eigene Chromoxidschicht der Oberfläche neu bilden kann. Die Maße des Teils ändern sich durch den Prozess nicht messbar.",
          "Verfahren und Annahmekriterien sind in ASTM A967 festgelegt; Salpetersäure- und Zitronensäurebäder sind unterschiedliche Klassen, und die Spezifikation sollte angeben, welche gefordert ist. Nach der Zerspanung ist das Passivieren für die meisten Edelstahlteile ein notwendiger Schritt, da bei der Bearbeitung Eisenrückstände aufgenommen werden.",
        ],
      },
      {
        heading: "Pulverbeschichtung",
        paragraphs: [
          "Die Pulverbeschichtung wird elektrostatisch aufgetragen und im Ofen eingebrannt. Ihre wesentlichen Stärken: Sie enthält kein Lösungsmittel und ergibt in einem einzigen Auftrag eine dicke Schicht; die Farben werden aus dem RAL-Katalog gewählt.",
          "Über die Beständigkeit entscheidet mehr die Vorbehandlung darunter als der Lack selbst: Auf einer Oberfläche ohne Entfettung, Phosphatierung oder Konversionsschicht löst sich auch der beste Lack. Wenn Sie eine bestimmte Salzsprühnebelbeständigkeit erwarten, geben Sie die Zielzeit und die zugehörige Norm in der Spezifikation an; dieser Wert hängt von der Kombination aus Lack, Vorbehandlung und Grundwerkstoff ab und ist keine Eigenschaft des Lacks allein.",
        ],
      },
      {
        heading: "Elektropolieren",
        paragraphs: [
          "Beim Elektropolieren wird eine dünne Schicht der Edelstahloberfläche kontrolliert abgetragen. Da sich die Spitzen der Oberfläche schneller auflösen als die Täler, entsteht eine Oberfläche, die sowohl glatter als auch chemisch sauberer ist.",
          "Dass das Verfahren in der Medizintechnik und in Lebensmittelanwendungen bevorzugt wird, liegt nicht am Glanz, sondern an der Reinigbarkeit: Weniger Mikrorisse und weniger Bearbeitungsrückstände machen die Oberfläche leichter sterilisierbar. Der erreichbare Ra-Wert hängt von der Ausgangsoberfläche ab — Elektropolieren rettet keine schlecht bearbeitete Oberfläche, es verbessert eine gute.",
        ],
      },
      {
        heading: "Was in die Spezifikation gehört",
        paragraphs: [
          "Vier Angaben genügen: Norm, Typ/Klasse, Schichtdickenbereich und nicht zu beschichtende Flächen. Die letzte Angabe wird am häufigsten vergessen; Gewinde, Passflächen und elektrische Kontaktstellen müssen in der Regel abgedeckt werden.",
          "Wir bieten Oberflächenbehandlungen an oder koordinieren sie. Welche Behandlung zu Ihrem Teil und seiner Einsatzumgebung passt, können wir in der Angebotsphase gemeinsam anhand der technischen Zeichnung entscheiden.",
        ],
      },
    ],
  },
};
