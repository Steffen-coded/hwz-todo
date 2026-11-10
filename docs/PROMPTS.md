# PROMPTS: Kopierbare Prompts

Jeder Prompt wird so, wie er ist, in Claude Code eingefügt. «Wann» sagt, wann er dran ist. «Prüfen danach» sagt, was danach anzuschauen ist.

## Bau 1: die Liste

### 1. SPEC schreiben

```text
/spec Eine ToDo-App für mich: Aufgaben anlegen, abhaken und löschen.
```

- **Wann:** Ganz am Anfang, direkt nach `claude`.
- **Prüfen danach:** Die Fragen einzeln beantworten, den Look wählen. Dann docs/SPEC.md lesen: Stimmen Ziel, Look und die Kriterien unter «Fertig, wenn»? Freigeben mit «Passt, freigegeben.» oder sagen, was fehlt.

### 2. Plan machen

```text
/plan
```

- **Wann:** Nach der Freigabe der SPEC.
- **Prüfen danach:** docs/TASKS.md lesen. Höchstens 6 Tasks, jeder mit «Test zuerst». Freigeben mit «Plan freigegeben.»

### 3. Einen Task bauen (wiederholen)

```text
/task
```

- **Wann:** Nach der Freigabe des Plans. Immer wieder, bis alle Tasks in docs/TASKS.md `[x]` haben.
- **Prüfen danach:** Der Bericht nennt, was gebaut wurde und wo es zu sehen ist. Im Browser http://localhost:5173/hwz-todo/ öffnen und ausprobieren. Die letzte Zeile von `npm run check` muss grün sein.

### 4. Abnahme

```text
/review
```

- **Wann:** Wenn alle Tasks abgehakt sind.
- **Prüfen danach:** Die Tabelle durchgehen. Bei «Klick-Anleitung» selbst klicken und das Ergebnis melden. Bei Fehlern den vorgeschlagenen Fix-Prompt kopieren und senden.

### 5. Speichern

```text
/save Bau 1: Liste
```

- **Wann:** Nach bestandener Abnahme.
- **Prüfen danach:** Die Meldung zeigt den Commit und «gepusht». Das Repo auf github.com zeigt die neuen Dateien.

### 6. Veröffentlichen

```text
/publish
```

- **Wann:** Nach dem Speichern.
- **Prüfen danach:** Die URL `https://<user>.github.io/hwz-todo/` öffnen. Die App sieht gleich aus wie lokal. Bei 404: 2 Minuten warten, neu laden.

## Bau 2: das Board

### 7. Board-SPEC

```text
/spec Mach aus der Liste ein Board mit drei Spalten: Offen, In Arbeit, Erledigt.
```

- **Wann:** Nach Bau 1, wenn die Liste online ist.
- **Prüfen danach:** In docs/SPEC.md steht unter «## Features» ein neuer Abschnitt mit Gegeben/Wenn/Dann. Er erwähnt die Migration der gespeicherten Daten. Dann weiter mit `/plan`, `/task`, `/review`, `/save Bau 2: Board`, `/publish`.

### 8. Weitere Features

Fertige `/spec`-Prompts stehen in docs/FEATURES.md. Je Feature: `/spec …` → `/plan` → `/task` … → `/review` → `/save Bau 2: <Feature>` → `/publish`.

## Beispiel einer SPEC

So sieht docs/SPEC.md nach `/spec` aus (gekürzt):

```markdown
## Ziel

Eine Liste für meine Aufgaben, die Freude macht und schnell ist.

## Muss

- Aufgabe mit Titel anlegen (Enter oder Plus-Knopf).
- Aufgabe abhaken und wieder öffnen.
- Aufgabe löschen, mit «Rückgängig».
- Zähler «erledigt/gesamt» als Fortschrittsring.

## Look

Aurora

## Nicht

- Kein Login, kein Server. Die Daten bleiben im Browser.

## Fertig, wenn

1. Leere Eingabe
   - Gegeben: Das Eingabefeld ist leer oder enthält nur Leerzeichen.
   - Wenn: Ich Enter drücke.
   - Dann: Es kommt keine Aufgabe dazu und das Feld schüttelt sich kurz.
2. 200 Zeichen
   - Gegeben: Ich tippe einen Titel mit mehr als 200 Zeichen ohne Leerzeichen.
   - Wenn: Ich Enter drücke.
   - Dann: Die Aufgabe hat höchstens 200 Zeichen und der Text bricht in der Karte um.

## Features

(leer)
```

## Beispiel: die 6 Tasks von Bau 1

So sieht docs/TASKS.md nach `/plan` in Bau 1 aus:

```text
[ ] 1  Projekt einrichten
- Ziel: Leerer App-Rahmen im gewählten Look läuft unter http://localhost:5173/hwz-todo/.
- Dateien: alle aus docs/STACK.md, Abschnitt «Dateien für Task 1», plus src/components/ui/*.
- Test zuerst: src/App.test.tsx (kommt mit Task 1, siehe STACK.md).
- Fertig wenn: npm run check grün, Hero-Überschrift sichtbar.

[ ] 2  Datenmodell und Store mit Tests
- Ziel: Aufgaben lassen sich anlegen, abhaken, löschen und im localStorage speichern, noch ohne Oberfläche.
- Dateien: src/features/tasks/model.ts, src/features/tasks/model.test.ts, src/lib/storage.ts, src/lib/storage.test.ts, src/features/tasks/useTasks.ts, src/features/tasks/useTasks.test.ts.
- Test zuerst: addTask ignoriert leeren Titel und kürzt auf 200 Zeichen; loadState gibt bei kaputtem JSON eine leere Liste zurück.
- Fertig wenn: alle Model- und Storage-Tests grün, npm run check grün.

[ ] 3  Liste anzeigen
- Ziel: Gespeicherte Aufgaben erscheinen als TaskCards mit Listen-Animation.
- Dateien: src/features/tasks/components/TaskList.tsx, src/features/tasks/components/TaskCard.tsx, src/features/tasks/components/TaskCard.test.tsx, src/App.tsx.
- Test zuerst: TaskList zeigt zwei Aufgaben aus dem localStorage nach dem Rendern an.
- Fertig wenn: Aufgaben sichtbar (DESIGN.md, Rezepte 3, 4, 7), npm run check grün.

[ ] 4  Aufgabe hinzufügen
- Ziel: Neue Aufgabe per Enter oder Plus-Knopf, leere Eingabe schüttelt.
- Dateien: src/features/tasks/components/TaskInput.tsx, src/features/tasks/components/TaskInput.test.tsx, src/lib/useHotkey.ts, src/App.tsx.
- Test zuerst: Tippen + Enter zeigt die Aufgabe; Enter bei leerem Feld fügt nichts hinzu; «N» fokussiert das Feld.
- Fertig wenn: DESIGN.md, Rezepte 2 und 9 erfüllt, npm run check grün.

[ ] 5  Abhaken und löschen
- Ziel: Abhaken mit Federn, Durchstreichen und Konfetti; Löschen mit Toast «Rückgängig».
- Dateien: src/features/tasks/components/TaskCard.tsx, src/features/tasks/components/TaskCard.test.tsx, src/lib/celebrate.ts, src/lib/theme.ts.
- Test zuerst: Klick auf Checkbox setzt done und ruft celebrate auf; Löschen und «Rückgängig» stellt die Aufgabe wieder her.
- Fertig wenn: DESIGN.md, Rezept 3 erfüllt, Zustand bleibt nach Neuladen, npm run check grün.

[ ] 6  Zähler und leerer Zustand
- Ziel: Fortschrittsring zeigt erledigt/gesamt; ohne Aufgaben erscheint die Illustration des Looks.
- Dateien: src/components/ProgressRing.tsx, src/components/ProgressRing.test.tsx, src/features/tasks/components/EmptyState.tsx, src/App.tsx.
- Test zuerst: Ring hat aria-label «1 von 2 erledigt»; leere Liste zeigt «Alles erledigt. Zeit für Kaffee.».
- Fertig wenn: DESIGN.md, Rezepte 1 und 5 erfüllt, npm run check grün.
```

## Vier Sätze, die immer helfen

| Satz | Wann |
| ---- | ---- |
| «Ändere nur TaskCard.tsx, sonst nichts.» | Der Agent fasst zu viele Dateien an. Dateinamen anpassen. |
| «Schreib zuerst einen Test, der den Fehler zeigt, dann behebe ihn.» | Etwas funktioniert nicht wie erwartet. |
| «Stopp. Erklär in 3 Sätzen, wo es klemmt, und gib mir 2 Optionen.» | Der Agent dreht sich im Kreis. |
| «Zeig mir die letzte Zeile von npm run check.» | Der Agent sagt «fertig», aber es ist unklar, ob alles grün ist. |
