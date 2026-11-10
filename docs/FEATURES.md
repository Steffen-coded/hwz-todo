# FEATURES: Feature-Karte für Bau 2

Voraussetzung für alle Features: das Board aus Bau 2 (drei Spalten Offen, In Arbeit, Erledigt). Prompt dafür in docs/PROMPTS.md, Nummer 7.

Ein Feature wählen, den Prompt kopieren, senden. Danach wie immer: `/plan` → `/task` … → `/review` → `/save` → `/publish`.

**Aufwand:** 1 Punkt = etwa 15 Minuten, 2 Punkte = etwa 30 Minuten, 3 Punkte = etwa 45 Minuten.

---

### Drag and Drop

- **Kategorie:** Kanban
- **Aufwand:** 2
- **Nutzen:** Karten mit der Maus oder per Tastatur zwischen den Spalten verschieben, statt über Knöpfe.

```text
/spec Karten per Drag and Drop zwischen den Spalten und innerhalb einer Spalte verschieben, auch per Tastatur. Die Zielspalte leuchtet beim Darüberziehen. Rezept 6 aus DESIGN.md.
```

### WIP-Limit

- **Kategorie:** Kanban
- **Aufwand:** 1
- **Nutzen:** Begrenzt die Arbeit in «In Arbeit» (WIP = Work in Progress, angefangene Arbeit), damit Dinge fertig werden statt liegen bleiben.

```text
/spec WIP-Limit für die Spalte «In Arbeit»: höchstens 3 Karten. Der Zähler zeigt «2/3». Bei vollem Limit färbt sich die Spalte als Warnung und eine weitere Karte wird mit einem Toast abgelehnt.
```

### Story Points

- **Kategorie:** Scrum
- **Aufwand:** 2
- **Nutzen:** Jede Karte bekommt eine Grösse (Story Points, geschätzter Aufwand), damit man sieht, wie viel in einer Spalte steckt.

```text
/spec Story Points pro Karte: Auswahl 1, 2, 3, 5 oder 8 über ein Badge auf der Karte. Jede Spalte zeigt die Summe ihrer Punkte im Kopf.
```

### Sprint-Ziel

- **Kategorie:** Scrum
- **Aufwand:** 1
- **Nutzen:** Ein Satz oben am Board erinnert alle, worauf der aktuelle Sprint (kurzer Arbeitsabschnitt) hinarbeitet.

```text
/spec Sprint-Ziel: Ein editierbarer Satz mit Enddatum oben am Board. Klick darauf macht ihn bearbeitbar, Enter speichert, Esc bricht ab. Es zeigt «noch N Tage».
```

### Burndown

- **Kategorie:** Scrum
- **Aufwand:** 3
- **Nutzen:** Eine kleine Kurve zeigt, wie die offene Arbeit über die Tage sinkt (Burndown-Chart).

```text
/spec Burndown-Chart: Speichere pro Tag die Summe der offenen Story Points. Zeige darüber eine kleine SVG-Linie mit Ideallinie, Farben aus dem Look, ohne neues Paket.
```

### Zeile pro Person (Swimlanes)

- **Kategorie:** Swimlanes
- **Aufwand:** 3
- **Nutzen:** Das Board teilt sich in Zeilen pro Person (Swimlanes, Bahnen), damit klar ist, wer woran arbeitet.

```text
/spec Swimlanes: Jede Karte kann einer Person zugeordnet werden (Name, Initialen-Badge). Das Board zeigt eine Zeile pro Person plus «Niemand», jede Zeile mit den drei Spalten.
```

### Look-Wechsel (Dark Mode)

- **Kategorie:** Extra
- **Aufwand:** 1
- **Nutzen:** Zwischen Aurora, Candy und Neon umschalten, die Wahl bleibt nach dem Neuladen erhalten.

```text
/spec Look-Wechsel: Ein Menü oben rechts (shadcn dropdown-menu) wechselt zwischen Aurora, Candy und Neon. Die Wahl wird im localStorage gespeichert und beim Start gesetzt, ohne Flackern.
```

### Export als Markdown

- **Kategorie:** Extra
- **Aufwand:** 1
- **Nutzen:** Das ganze Board als Markdown-Text (einfaches Textformat) kopieren, z. B. für ein Protokoll.

```text
/spec Export als Markdown: Ein Knopf kopiert das Board in die Zwischenablage, je Spalte eine Überschrift und darunter die Karten als Checkliste. Ein Toast bestätigt «Kopiert».
```

---

### Eigene Idee

- **Kategorie:**
- **Aufwand:**
- **Nutzen:**

```text
/spec <Was soll die App zusätzlich können? Für wen? Woran merkt man, dass es funktioniert?>
```
