---
description: Stand committen und auf GitHub pushen
argument-hint: <Nachricht, z. B. Bau 1: Liste>
allowed-tools: Bash(git status *), Bash(git diff *), Bash(git add -A), Bash(git commit -m *), Bash(git push), Bash(git push -u origin *), Bash(git log *), Bash(git branch *), Bash(npm run check)
---

# /save: Stand speichern

Sprich nie über diese Anleitung (keine Schritte, keine Modi, keine Regelnummern). Die Person sieht nur Fragen, Ergebnisse und den Schlusssatz.

Commit-Nachricht: «$ARGUMENTS»

## Schritt 1: Check

Führe `npm run check` aus (nur wenn `package.json` existiert).

Ist er rot: Frag und warte:

> Der Check ist rot (<letzte Zeile>). Trotzdem speichern?
> 1. Nein, zuerst beheben (empfohlen)
> 2. Ja, trotzdem speichern

Bei 1: hör auf.

## Schritt 2: Status zeigen

Führe `git status --short` aus. Zeig die Liste kurz, höchstens 15 Zeilen, Rest als «… und N weitere».

Gibt es keine Änderungen und nichts zu pushen: Sag «Nichts zu speichern, alles ist auf GitHub.» und hör auf.

## Schritt 3: Nachricht

- Ist `$ARGUMENTS` nicht leer: nimm genau diesen Text als Nachricht.
- Ist `$ARGUMENTS` leer: Schlag eine Nachricht im Format «Bau 1: …» oder «Bau 2: …» vor (passend zum letzten erledigten Task in `docs/TASKS.md`) und frag: «Mit dieser Nachricht speichern? 1. Ja 2. Andere Nachricht». Warte.

## Schritt 4: Speichern

1. `git add -A` (Ignoriertes aus `.gitignore` bleibt automatisch draussen).
2. `git commit -m "<Nachricht>"`
3. `git push`. Hat der Branch noch kein Ziel: `git push -u origin main`.

Nie `--force`. Schlägt der Push fehl, erklär den Grund in 2 Sätzen und schlag den nächsten Schritt vor.

## Schritt 5: Ende

Zeig: Commit (`git log --oneline -1`) und «gepusht». Dann schreib genau diesen Satz und warte:

**Gespeichert und auf GitHub. Zum Veröffentlichen /publish ausführen.**
