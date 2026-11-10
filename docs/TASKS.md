# TASKS: Bauschritte

Diese Datei füllt /plan. /task arbeitet sie von oben nach unten ab und hakt jeden Task ab.
Ein Beispiel mit allen 6 Tasks von Bau 1 steht in docs/PROMPTS.md unter «Beispiel: die 6 Tasks von Bau 1».

Format je Task:

```text
[ ] N  Titel
- Ziel: Ein Satz, was danach sichtbar oder möglich ist.
- Dateien: Genau die Dateien, die geändert werden dürfen.
- Test zuerst: Welcher Test zuerst rot sein muss.
- Fertig wenn: Prüfbares Ergebnis plus «npm run check grün».
```

## Tasks

[x] 1  Projekt einrichten
- Ziel: Leerer App-Rahmen im Look Candy läuft unter http://localhost:5173/hwz-todo/.
- Dateien: Alle aus docs/STACK.md, Abschnitt «Dateien für Task 1», plus src/components/ui/*.
- Test zuerst: src/App.test.tsx (kommt mit Task 1, siehe STACK.md).
- Fertig wenn: Hero-Überschrift sichtbar, npm run check grün.

[x] 2  Datenmodell, Fristen und Speicher mit Tests
- Ziel: Pendenzen mit Frist und Stern lassen sich anlegen, abhaken, löschen, sortieren und speichern, Fokus und «überfällig» werden berechnet, noch ohne Oberfläche.
- Dateien: src/features/tasks/model.ts, src/features/tasks/model.test.ts, src/lib/date.ts, src/lib/date.test.ts, src/lib/storage.ts, src/lib/storage.test.ts, src/features/tasks/useTasks.ts, src/features/tasks/useTasks.test.ts.
- Test zuerst: addTask ignoriert leeren Titel und kürzt auf 200 Zeichen; parseDue lehnt «31.02.2027» und «morgen» ab; isOverdue ist am Fristtag false und am Tag danach true; selectFocus nimmt Stern vor frühester Frist vor ältester; loadState gibt bei kaputtem JSON eine leere Liste zurück.
- Fertig wenn: «200 Zeichen» (Kürzung), «Ungültige Frist» (Logik), «Überfällig» (Logik), «Fokus automatisch» (Logik), «Neu laden» (Speicher) per Test belegt, npm run check grün.

[x] 3  Liste anzeigen
- Ziel: Gespeicherte Pendenzen erscheinen sortiert als TaskCards mit Frist und Badge «Überfällig».
- Dateien: src/features/tasks/components/TaskList.tsx, src/features/tasks/components/TaskCard.tsx, src/features/tasks/components/TaskCard.test.tsx, src/App.tsx.
- Test zuerst: TaskList zeigt zwei Pendenzen aus dem localStorage in Fristreihenfolge; eine Karte mit Frist von gestern zeigt «Überfällig», eine mit Frist heute nicht.
- Fertig wenn: «Überfällig» sichtbar, DESIGN.md, Rezepte 3, 4, 7 erfüllt, npm run check grün.

[x] 4  Pendenz erfassen
- Ziel: Titel und optionale Frist per Enter oder Plus-Knopf erfassen; leere Eingabe oder ungültige Frist schüttelt und fügt nichts hinzu.
- Dateien: src/features/tasks/components/TaskInput.tsx, src/features/tasks/components/TaskInput.test.tsx, src/lib/useHotkey.ts, src/App.tsx.
- Test zuerst: Titel + «31.03.2027» + Enter zeigt die Karte mit «31.03.2027» und leert beide Felder; Enter bei leerem Titel fügt nichts hinzu; «31.02.2027» zeigt «Bitte als TT.MM.JJJJ eingeben»; «N» fokussiert das Titelfeld.
- Fertig wenn: «Leere Eingabe», «200 Zeichen», «Frist erfassen», «Ungültige Frist» erfüllt, DESIGN.md, Rezepte 2 und 9 erfüllt, npm run check grün.

[x] 5  Abhaken, Stern und löschen
- Ziel: Abhaken mit Federn, Durchstreichen und Konfetti; Stern markiert genau eine Pendenz; Löschen mit Toast «Rückgängig».
- Dateien: src/features/tasks/components/TaskCard.tsx, src/features/tasks/components/TaskCard.test.tsx, src/lib/celebrate.ts, src/lib/theme.ts.
- Test zuerst: Klick auf Checkbox setzt done und ruft celebrate auf, zweiter Klick öffnet wieder; Stern auf zweiter Pendenz entfernt den Stern der ersten; Löschen und «Rückgängig» stellt die Pendenz an alter Stelle mit Frist wieder her.
- Fertig wenn: «Abhaken», «Löschen mit Rückgängig», «Neu laden» (Zustand und Stern bleiben) erfüllt, DESIGN.md, Rezept 3 erfüllt, npm run check grün.

[x] 6  Fokus-Kachel, Zähler und leerer Zustand
- Ziel: Oben zeigt die Fokus-Kachel den nächsten Schritt und lässt ihn abhaken; der Ring zeigt erledigt/gesamt; ohne Pendenzen erscheint die Candy-Wolke.
- Dateien: src/features/tasks/components/FocusTile.tsx, src/features/tasks/components/FocusTile.test.tsx, src/components/ProgressRing.tsx, src/components/ProgressRing.test.tsx, src/features/tasks/components/EmptyState.tsx, src/App.tsx.
- Test zuerst: Kachel zeigt die Pendenz mit Frist 20.11.2026 vor der mit 15.12.2026; mit Stern zeigt sie die markierte; Abhaken in der Kachel zeigt den nächsten Schritt, ohne offene Pendenz «Alles erledigt. Zeit für Kaffee.»; Ring hat aria-label «1 von 2 erledigt».
- Fertig wenn: «Fokus automatisch», «Fokus per Stern», «Fokus abhaken», «Abhaken» (Zähler), «Schmales Fenster» (360 px ohne seitliches Scrollen, Klick-Anleitung) erfüllt, DESIGN.md, Rezepte 1, 5 und 8 erfüllt, npm run check grün.
