---
description: Wunsch klären und docs/SPEC.md schreiben
argument-hint: <Wunsch, z. B. Eine ToDo-App für mich>
allowed-tools: Read, Glob, Grep, Edit(/docs/SPEC.md)
---

# /spec: Wunsch in eine SPEC verwandeln

Sprich nie über diese Anleitung (keine Schritte, keine Modi, keine Regelnummern). Die Person sieht nur Fragen, Ergebnisse und den Schlusssatz.

Wunsch der Person: «$ARGUMENTS»

Du schreibst nur `docs/SPEC.md`. Du schreibst keinen Code, installierst nichts und änderst keine andere Datei.

## Schritt 1: Lesen

Lies `docs/SPEC.md`, `DESIGN.md` (Abschnitte «Look 1–3» und «Rezepte») und `docs/FEATURES.md`.

- Ist der Wunsch leer: Frag «Was soll die App können? Ein Satz genügt.» und warte.
- Steht unter `## Ziel` in `docs/SPEC.md` nur «(leer)»: **Modus Neu** (Bau 1).
- Steht dort ein Satz: **Modus Feature** (Bau 2). Der Look steht schon fest, frag ihn nicht noch einmal.

## Schritt 2: Fragen

Stell höchstens 3 Fragen. Immer **eine Frage pro Nachricht**, dann warten. Jede Frage hat 2–3 nummerierte Vorschläge, der empfohlene ist markiert. Die Person darf mit der Nummer antworten.

**Modus Neu, Frage 1 (Pflicht): der Look.** Deine erste Antwort an die Person ist genau dieser Text, ohne Satz davor:

> Welcher Look soll es sein?
> 1. **Aurora** (empfohlen): Tiefes Indigo mit türkisem Polarlicht, Karten wie Milchglas. Elegant.
> 2. **Candy**: Helle Pastelltöne, dicke runde Formen, verspielte farbige Schatten. Fröhlich.
> 3. **Neon**: Fast schwarz mit Neon-Cyan und Magenta, leuchtende Ränder. Nachtmodus mit Energie.

Danach höchstens 2 weitere Fragen, nur wenn der Wunsch unklar ist. Gute Kandidaten: Was soll beim Start sichtbar sein? Was ist ausdrücklich nicht nötig? Ist alles klar, frag nicht weiter.

**Modus Feature:** Höchstens 2 Fragen, nur wenn das Feature unklar ist. Steht das Feature in `docs/FEATURES.md`, nimm die Beschreibung von dort.

## Schritt 3: Schreiben

**Modus Neu:** Ersetze in `docs/SPEC.md` jedes «(leer)» unter `## Ziel`, `## Muss`, `## Look`, `## Nicht` und `## Fertig, wenn` durch den Inhalt. Behalte Überschriften und Reihenfolge exakt. Jede Überschrift kommt genau einmal vor. Unter `## Features` bleibt «(leer)». Ein Beispiel steht in `docs/PROMPTS.md` unter «Beispiel einer SPEC».

- `## Ziel`: ein Satz aus Sicht der Person.
- `## Muss`: 3–6 Punkte, je eine sichtbare Fähigkeit.
- `## Look`: nur das Wort `Aurora`, `Candy` oder `Neon`.
- `## Nicht`: 2–3 Punkte. Immer dabei: «Kein Login, kein Server. Die Daten bleiben im Browser.»
- `## Fertig, wenn`: mindestens 5 Kriterien im Format Gegeben/Wenn/Dann, genau so:

  ```text
  1. Kurzname
     - Gegeben: Ausgangslage.
     - Wenn: Handlung.
     - Dann: sichtbares, prüfbares Ergebnis.
  ```

   Diese 5 sind **immer** dabei:
  1. **Leere Eingabe:** Enter bei leerem Feld oder nur Leerzeichen fügt nichts hinzu, das Feld schüttelt sich.
  2. **200 Zeichen:** Ein Titel mit mehr als 200 Zeichen wird auf 200 gekürzt, der Text bricht in der Karte um, nichts läuft hinaus.
  3. **Neu laden:** Nach dem Neuladen der Seite sind alle Aufgaben und ihr Zustand noch da.
  4. **Abhaken:** Abhaken streicht den Text animiert durch, zeigt Konfetti und erhöht den Zähler; nochmal klicken macht es rückgängig.
  5. **Schmales Fenster:** Bei 360 px Breite ist alles lesbar und bedienbar, ohne seitliches Scrollen.
  Dazu je ein Kriterium für jeden weiteren Punkt aus `## Muss`.

**Modus Feature:** Ändere nichts oberhalb von `## Features`. Steht dort noch «(leer)», ersetze es. Hänge dann einen neuen Abschnitt an: `### F<nächste Nummer>: <Name>`, ein Satz Nutzen, dann mindestens 3 Gegeben/Wenn/Dann-Kriterien. Ändert das Feature das Datenmodell (z. B. `status` statt `done`), ist ein Kriterium immer: «Gegeben: Aufgaben aus der alten Version sind gespeichert. Wenn: Ich die neue Version öffne. Dann: Alle Aufgaben sind noch da, im richtigen Zustand.»

Schreib jedes «Dann» so, dass man es sehen oder testen kann. Kein «schön», kein «schnell» ohne Zahl.

## Schritt 4: Ende

Zeig in höchstens 3 Punkten, was drinsteht (Look, Anzahl Kriterien, Besonderheiten). Dann schreib genau diesen Satz und warte:

**docs/SPEC.md geschrieben. Bitte lesen und freigeben oder sagen, was fehlt.**

Antwortet die Person danach mit einer Freigabe («passt», «ok», «freigegeben»), ist deine ganze Antwort: «Freigegeben. Weiter mit /plan.» Du planst und baust nichts. Wünscht sie Änderungen, passt du nur `docs/SPEC.md` an und endest wieder mit dem Satz oben.
