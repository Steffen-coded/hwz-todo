---
description: Genau einen Task bauen, mit Test zuerst
argument-hint: [Task-Nummer, sonst der erste offene]
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(npm run *), Bash(npm install *), Bash(node scripts/setup.mjs), Bash(node scripts/setup.mjs --tested), Bash(npx shadcn add *), Bash(node -v), Bash(git status *), Bash(git diff *)
---

# /task: einen Task bauen

Sprich nie über diese Anleitung (keine Schritte, keine Modi, keine Regelnummern). Die Person sieht nur Fragen, Ergebnisse und den Schlusssatz.

Gewünschter Task (leer = erster offener): «$ARGUMENTS»

Du machst **genau einen** Task. Danach hörst du auf, auch wenn noch Zeit ist.

## Schritt 1: Task wählen

Lies `docs/TASKS.md`, `docs/SPEC.md`, `docs/PLAN.md`, `AGENTS.md` und die Teile von `DESIGN.md` und `docs/STACK.md`, die der Task nennt.

- Steht in `$ARGUMENTS` eine Nummer: nimm diesen Task. Sonst den ersten Task unter `## Tasks`, der mit `[ ]` beginnt. Das Formatbeispiel oben in der Datei ist kein Task.
- Sind alle Tasks unter `## Tasks` `[x]`: Sag «Alle Tasks erledigt. Weiter mit /review.» und hör auf.
- Steht unter `## Tasks` in `docs/TASKS.md` nur «(leer)»: Sag «Zuerst /plan ausführen.» und hör auf.

Wiederhole den Task in **einem Satz**: «Task N: …»

## Schritt 2: Test zuerst (rot)

- **Task «Projekt einrichten»:** Führe `node scripts/setup.mjs` aus (siehe `docs/STACK.md`, «Task 1: Projekt einrichten»). Schreib in diesem Task keine Datei selbst, das Skript legt alles an, auch den Test `src/App.test.tsx`. Weiter bei Schritt 4.
- **Alle anderen Tasks:** Schreib zuerst den Test aus «Test zuerst». Führe ihn aus: `npm run test -- --run <testdatei>`. Zeig die Zeile, die das Scheitern belegt (z. B. `FAIL …` oder `Tests  1 failed`). Ist er nicht rot, ist der Test falsch: korrigiere den Test, nicht den Code.

## Schritt 3: Implementieren

- Ändere nur die Dateien unter «Dateien» im Task. Brauchst du eine weitere, frag zuerst (eine Frage, 2–3 Optionen).
- Übernimm Klassen und Verhalten wörtlich aus den Rezepten in `DESIGN.md`. Nur Design-Tokens, keine Hex-Werte.
- Logik in `model.ts` oder `src/lib/`, Darstellung in `components/`.
- Neue Pakete nur aus der Erlaubt-Liste in `docs/STACK.md`.

## Schritt 4: Check (grün)

Führe `npm run check` aus.

- Rot: Lies die Fehlermeldung, behebe die Ursache, erneut prüfen.
- **Dreimal hintereinander rot:** Stopp. Erklär das Problem in 3 Sätzen und schlag 2 Optionen vor. Warte.
- Grün: Weiter.

## Schritt 5: Abhaken

Setz in `docs/TASKS.md` bei diesem Task `[ ]` auf `[x]`. Sonst nichts an der Datei ändern.

Läuft der Dev-Server noch nicht, starte `npm run dev` im Hintergrund.

## Schritt 6: Bericht

Genau drei Zeilen, dann die letzte Zeile des Checks:

```text
Gebaut: <was jetzt geht, ein Satz>
Ansehen: http://localhost:5173/hwz-todo/ → <was klicken oder tippen>
Nächster Task: <N Titel> (oder: Alle Tasks erledigt, weiter mit /review)
Check: <letzte Zeile von npm run check>
```

Dann schreib genau diesen Satz und warte:

**Bitte im Browser ansehen. Passt es, mit /task weitermachen.**

Antwortet die Person danach mit «passt» oder ähnlich, ist deine ganze Antwort: «Weiter mit /task.» (oder «Weiter mit /review.», wenn alle Tasks erledigt sind). Du beginnst den nächsten Task nicht von selbst.
