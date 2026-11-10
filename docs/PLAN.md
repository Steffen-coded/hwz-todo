# PLAN: Wie die App gebaut wird

Diese Datei füllt /plan aus docs/SPEC.md.

## Stack

Siehe docs/STACK.md. Keine Abweichungen.

## Ordner und Dateien

- `index.html`: Look `candy` (setzt `scripts/setup.mjs` aus der SPEC).
- `src/App.tsx`: App-Rahmen mit Hero, Fortschrittsring, Fokus-Kachel, Eingabe und Liste.
- `src/lib/storage.ts`: localStorage lesen, schreiben, kaputte Daten abfangen.
- `src/lib/date.ts`: Frist «TT.MM.JJJJ» prüfen und umwandeln, Frist anzeigen, «überfällig» berechnen, heutiges Datum als `YYYY-MM-DD`.
- `src/lib/celebrate.ts`: Konfetti-Aufruf, im Test ersetzbar.
- `src/lib/theme.ts`: Konfetti-Farben aus den CSS-Variablen lesen.
- `src/lib/useHotkey.ts`: Taste «N» fokussiert die Eingabe.
- `src/features/tasks/model.ts`: Typ Task und reine Funktionen addTask, toggleTask, removeTask, restoreTask, toggleStar, sortTasks, selectFocus.
- `src/features/tasks/useTasks.ts`: Hook, verbindet model.ts mit storage.ts.
- `src/features/tasks/components/TaskInput.tsx`: Titel- und Fristfeld, Enter fügt hinzu.
- `src/features/tasks/components/TaskCard.tsx`: Eine Pendenz mit Checkbox, Frist, Badge «Überfällig», Stern und Löschen.
- `src/features/tasks/components/TaskList.tsx`: Sortierte Liste mit Animationen.
- `src/features/tasks/components/FocusTile.tsx`: Kachel «Nächster Schritt» oben.
- `src/features/tasks/components/EmptyState.tsx`: Illustration, wenn keine Pendenzen da sind.
- `src/components/ProgressRing.tsx`: Ring «erledigt/gesamt».
- Zu jeder Datei mit Logik oder Verhalten der Test daneben (`*.test.ts` / `*.test.tsx`).

## Datenmodell

```ts
export type Task = {
  id: string // crypto.randomUUID()
  title: string // getrimmt, 1 bis 200 Zeichen
  done: boolean
  createdAt: number // Date.now()
  due: string | null // Frist als 'YYYY-MM-DD', null = keine Frist
  starred: boolean // höchstens eine offene Pendenz hat true
}
```

- localStorage `"hwz-todo"` = `{ version: 1, tasks: Task[] }`. Erste Version, darum keine Migration.
- `loadState` füllt fehlende Felder (`due: null`, `starred: false`), damit unvollständige Daten nicht abstürzen.
- Regeln in model.ts: `toggleStar` entfernt den Stern bei allen anderen. Abhaken entfernt den Stern. `selectFocus(tasks, today)` liefert die Pendenz mit Stern, sonst die offene mit der frühesten Frist, sonst die älteste offene, sonst `null`.
- `sortTasks`: Offene mit Frist (früheste zuerst), offene ohne Frist (neueste zuerst), erledigte zuletzt.
- `isOverdue(due, today)`: Frist vor heute und offen. Heute selbst ist nicht überfällig. `today` wird übergeben, damit Tests ein festes Datum nutzen.

## Komponenten

- **App-Rahmen mit ProgressRing:** Hero «Meine Aufgaben», Datum, Ring rechts (DESIGN.md, Rezept 1).
- **FocusTile:** Grosse Karte `glass rounded-2xl border-2 shadow-pop p-6` mit Label «Nächster Schritt», Titel in `font-heading`, Frist, Checkbox und Stern. Ohne offene Pendenz: «Alles erledigt. Zeit für Kaffee.» (Karten-Stil aus Look Candy, Text-Regeln aus Rezept 7).
- **TaskInput:** Titelfeld plus zweites shadcn-Input «TT.MM.JJJJ» (`aria-label="Frist (optional)"`). Ungültige Frist: Schütteln und Hinweis «Bitte als TT.MM.JJJJ eingeben» in `text-foreground`, verbunden über `aria-describedby` (DESIGN.md, Rezepte 2 und 9).
- **TaskCard:** Checkbox, Titel, Frist in `font-mono`, Stern-Knopf (`Star` aus lucide-react, `aria-pressed`), Löschen. Überfällig: shadcn `<Badge variant="destructive">Überfällig</Badge>` und Karte mit `glow` (DESIGN.md, Rezepte 3 und 7).
- **TaskList:** Sortierte Liste mit AnimatePresence (DESIGN.md, Rezept 4).
- **EmptyState:** Candy-Wolke und freundlicher Satz (DESIGN.md, Rezept 5).

## Risiken

- Datum hängt von der Zeitzone ab, «überfällig» kippt um Mitternacht falsch: Frist nur als `YYYY-MM-DD` speichern, `today` lokal berechnen und als Parameter übergeben, Tests mit festem Datum.
- «31.02.2027» wird von `Date` still zu 03.03.2027: Parser prüft Tag, Monat und Jahr nach dem Umwandeln zurück, eigener Test dafür.
- Fokus-Kachel und Liste zeigen dieselbe Pendenz, Abhaken an zwei Orten kann auseinanderlaufen: Beide rufen dieselbe Funktion aus useTasks auf, die Kachel berechnet sich nur aus `selectFocus`.
