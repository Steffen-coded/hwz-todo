# PLAN: Wie die App gebaut wird

Diese Datei füllt /plan aus docs/SPEC.md.

## Stack

Siehe docs/STACK.md. Keine Abweichungen.

## Ordner und Dateien

(leer)

Hier stehen nur Dateien, die neu entstehen oder sich ändern, je mit einem Halbsatz Zweck. Beispiel: `src/features/tasks/model.ts`: Typ Task und reine Funktionen addTask, toggleTask, removeTask.

## Datenmodell

(leer)

Typen als TypeScript-Block, dazu Schlüssel und Version im localStorage. Beispiel: `localStorage "hwz-todo" = { version: 1, tasks: Task[] }`.

## Komponenten

(leer)

Je Komponente: Name, was sie zeigt, welches Rezept aus DESIGN.md sie umsetzt. Beispiel: TaskInput: Eingabefeld mit Plus-Knopf (DESIGN.md, Rezept 2).

## Risiken

(leer)

Höchstens 3, je mit Gegenmassnahme. Beispiel: Alte Daten im localStorage passen nicht mehr: Migration mit Test (AGENTS.md, Regel 9).
