# PLAN: Wie die App gebaut wird

Diese Datei füllt /plan aus docs/SPEC.md. Stand: Bau 2 (F1 Kanban-Board). Der Plan von Bau 1 steht in der Git-Historie (Commit «Bau 1: Pendenzen-Liste mit Fristen und Fokus-Kachel»).

## Stack

Siehe docs/STACK.md. Keine Abweichungen. Für Drag and Drop `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (schon installiert).

## Ordner und Dateien

- `src/lib/storage.ts`: Version 2, Migration `migrateV1toV2`, lädt Version-1-Daten verlustfrei.
- `src/lib/storage.test.ts`: Migrationstest mit echten Daten im Format von Version 1.
- `src/features/tasks/model.ts`: `status` statt `done`; neue Funktionen `moveTask`, `tasksByStatus`, `resolveDrop`; `toggleTask` und `selectFocus` nach neuer Regel; `sortTasks` entfällt (Reihenfolge = Array-Reihenfolge).
- `src/features/tasks/model.test.ts`: Tests für die neuen und geänderten Funktionen.
- `src/features/tasks/useTasks.ts`: Zusätzlich `moveTask`.
- `src/features/tasks/components/Board.tsx`: Drei Spalten mit Drag and Drop.
- `src/features/tasks/components/Board.test.tsx`: Spalten, Zähler, leere Spalte, Tastatur-Verschieben.
- `src/features/tasks/components/TaskCard.tsx`: Liest `status`, lässt sich im Board als ziehbare Karte verwenden.
- `src/features/tasks/components/FocusTile.tsx`: Liest `status` statt `done`.
- `src/features/tasks/components/TaskList.tsx`: Wird gelöscht, das Board ersetzt die Liste.
- `src/App.tsx`: Board statt Liste, Seitenbreite `max-w-6xl`.
- Bestehende Tests (`TaskCard.test.tsx`, `FocusTile.test.tsx`, `TaskInput.test.tsx`, `ProgressRing.test.tsx`, `useTasks.test.ts`): Testdaten auf Version 2 umstellen.

## Datenmodell

```ts
export type Status = 'todo' | 'doing' | 'done'

export type Task = {
  id: string // crypto.randomUUID()
  title: string // getrimmt, 1 bis 200 Zeichen
  status: Status // ersetzt done
  createdAt: number // Date.now()
  due: string | null // Frist als 'YYYY-MM-DD', null = keine Frist
  starred: boolean // höchstens eine nicht erledigte Pendenz hat true
}
```

- localStorage `"hwz-todo"` = `{ version: 2, tasks: Task[] }`. `CURRENT_VERSION = 2`.
- Reihenfolge in einer Spalte = Reihenfolge im Array (`tasksByStatus(tasks, status)` filtert, ohne umzusortieren).
- **Migration `migrateV1toV2`:** Version-1-Aufgaben werden zuerst in die bisherige Anzeige-Reihenfolge gebracht (offene mit Frist, früheste oben; offene ohne Frist, neueste oben; erledigte). Dann gilt `done: true` → `status: 'done'`, `done: false` → `status: 'todo'`. Titel, Frist, Stern und `createdAt` bleiben. Eigener Test mit echten Version-1-Daten.
- `addTask`: Neue Pendenz mit `status: 'todo'` ganz oben.
- `toggleTask`: Nicht erledigt → `done` (Stern weg), erledigt → `todo` als oberste Karte in «Offen».
- `moveTask(tasks, id, toStatus, toIndex)`: Setzt den Status und die Position innerhalb der Zielspalte. Nach `done` verschoben, entfällt der Stern.
- `resolveDrop(tasks, activeId, overId)`: Rechnet aus dem dnd-kit-Ziel (Karten-ID oder Spalten-ID) `{ toStatus, toIndex }` aus. Reine Funktion, damit das Ablegen ohne Browser testbar ist.
- `selectFocus(tasks)`: Stern (nicht erledigt) → oberste in `doing` → oberste in `todo` → `null`.

## Komponenten

- **Board:** Drei Spalten «Offen», «In Arbeit», «Erledigt» mit Zähler-Badge, `DndContext` mit Pointer- und Keyboard-Sensor, `SortableContext` je Spalte, `DragOverlay`, leuchtende Zielspalte, leere Spalte mit «Hierher ziehen», deutsche Screenreader-Ansagen (DESIGN.md, Rezept 6). Auf Handys wischbare Spalten mit Snap (DESIGN.md, Rezept 8).
- **TaskCard:** Wie bisher (Checkbox, Frist, «Überfällig», Stern, Löschen), im Board mit `useSortable` und `opacity-50` beim Ziehen (DESIGN.md, Rezepte 3, 6 und 7).
- **FocusTile:** Wie bisher, zeigt `selectFocus` nach neuer Regel.
- **App-Rahmen:** Wie bisher, mit `max-w-6xl` (DESIGN.md, Rezept 1).
- **Konfetti:** Auch, wenn eine Karte in «Erledigt» abgelegt wird (DESIGN.md, Rezept 6).

## Risiken

- Alte Daten passen nicht zum neuen Modell: Migration mit Test aus echten Version-1-Daten (AGENTS.md, Regel 9), zuerst gebaut.
- motion-`layout` auf der Karte und der Transform von dnd-kit stören sich: Im Board steuert nur dnd-kit die Position (kein `layout` auf ziehbaren Karten), die Ein- und Ausblend-Animation bleibt.
- Drag and Drop lässt sich in jsdom kaum mit der Maus testen: Ablege-Logik als reine Funktionen (`resolveDrop`, `moveTask`) testen, Tastatur-Verschieben im Komponententest versuchen, sonst Klick-Anleitung im Review.
