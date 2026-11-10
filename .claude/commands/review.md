---
description: Abnahme gegen SPEC und Wow-Checkliste
argument-hint: (ohne Argument)
allowed-tools: Read, Glob, Grep, Bash(npm run check), Bash(npm run test *), Bash(npm run lint), Bash(npm run typecheck), Bash(git status *), Bash(git diff *)
---

# /review: Abnahme

Sprich nie über diese Anleitung (keine Schritte, keine Modi, keine Regelnummern). Die Person sieht nur Fragen, Ergebnisse und den Schlusssatz.

Hinweis der Person (darf leer sein): «$ARGUMENTS»

Du prüfst und berichtest. Du **änderst keine Datei** und behebst nichts ohne Freigabe.

## Schritt 1: Check

Führe `npm run check` aus und merke dir die letzte Zeile. Ist er rot, gehört das als erste Zeile in die Tabelle (Ergebnis «nein»).

## Schritt 2: Kriterien aus der SPEC

Lies `docs/SPEC.md`: alle Kriterien unter `## Fertig, wenn` und unter `## Features`.

Für jedes Kriterium:

1. Such einen Test, der es prüft (`grep` nach Stichworten in `src/**/*.test.ts*`). Gibt es einen und ist er grün: Ergebnis «ja», Beleg = Testdatei und Testname.
2. Gibt es keinen Test: Ergebnis «klicken», Beleg = eine Klick-Anleitung in höchstens 2 Schritten, z. B. «Fenster auf 360 px verkleinern (F12 → Handy-Symbol), Titel mit 200 Zeichen eingeben.»
3. Ist ein Test rot oder widerspricht der Code dem Kriterium: Ergebnis «nein», Beleg = Datei und Grund in einem Halbsatz.

## Schritt 3: Wow-Checkliste

Prüfe die 10 Punkte der «Wow-Checkliste» am Ende von `DESIGN.md` gleich wie oben: zuerst im Code und in Tests nachsehen (z. B. `animate-shake`, `canvas-confetti`, `AnimatePresence`, `toast(` mit «Rückgängig»), sonst als Klick-Anleitung.

Prüfe ausserdem die Regeln: keine Hex-Werte in `src/features/**` und `src/components/*.tsx` (`grep -nE "#[0-9a-fA-F]{3,8}\b"`), keine `[#…]`-Klassen.

## Schritt 4: Bericht

Eine Tabelle, nichts davor ausser einem Satz Ergebnis («X von Y erfüllt, Z zum Klicken.»):

| Kriterium | Ergebnis | Beleg |
| --------- | -------- | ----- |
| npm run check | ja / nein | letzte Zeile |
| … | ja / nein / klicken | … |

Ergebnis ist genau eines von: `ja`, `nein`, `klicken`.

Gibt es «nein»: Schlag für jeden Fehler **einen** kopierbaren Fix-Prompt vor, im Format:

```text
Schreib zuerst einen Test, der zeigt: <Kriterium>. Dann behebe es. Ändere nur <Datei>.
```

Behebe nichts selbst.

## Schritt 5: Ende

Schreib genau einen dieser Sätze und warte:

- Alles «ja» oder «klicken»: **Bitte die Klick-Punkte prüfen. Passt alles, mit /save "Bau 1: Liste" speichern.**
- Mindestens ein «nein»: **Bitte einen Fix-Prompt freigeben oder sagen, was zuerst behoben werden soll.**
