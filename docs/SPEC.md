# SPEC: Was die App können muss

Diese Datei füllt /spec. Ein ausgefülltes Beispiel steht in docs/PROMPTS.md unter «Beispiel einer SPEC».

## Ziel

Ich will meine Pendenzen wie in meinem Desktop-Widget im Blick haben: Oben der eine nächste Schritt, darunter alles Offene mit Frist, Überfälliges sofort sichtbar.

## Muss

- Pendenz schnell erfassen: Titel eintippen, optional eine Frist im Format TT.MM.JJJJ, Enter fügt hinzu.
- Fokus-Kachel oben zeigt den einen nächsten Schritt: Automatisch die offene Pendenz mit der frühesten Frist (ohne Frist die älteste), per Stern-Knopf auf einer Pendenz überschreibbar.
- Liste der Pendenzen: Mit Frist zuerst (früheste oben), ohne Frist danach (neueste oben), erledigte ganz unten. Jede Karte zeigt ihre Frist als TT.MM.JJJJ.
- Überfällige Pendenzen (Frist vor heute, noch offen) sind hervorgehoben und tragen das Badge «Überfällig».
- Pendenz abhaken und wieder öffnen, in der Liste und direkt in der Fokus-Kachel. Ein Fortschrittsring zeigt «erledigt/gesamt».
- Pendenz löschen, mit «Rückgängig» im Toast.

## Look

Candy

## Nicht

- Kein Login, kein Server. Die Daten bleiben im Browser.
- Keine Erinnerungen oder Benachrichtigungen bei Fristablauf.
- Keine Kategorien, Projekte oder Board-Spalten.

## Fertig, wenn

1. Leere Eingabe
   - Gegeben: Das Titelfeld ist leer oder enthält nur Leerzeichen.
   - Wenn: Ich Enter drücke.
   - Dann: Es kommt keine Pendenz dazu und das Formular schüttelt sich kurz.
2. 200 Zeichen
   - Gegeben: Ich tippe einen Titel mit mehr als 200 Zeichen ohne Leerzeichen.
   - Wenn: Ich Enter drücke.
   - Dann: Die Pendenz hat höchstens 200 Zeichen, der Text bricht in der Karte und in der Fokus-Kachel um, nichts läuft hinaus.
3. Neu laden
   - Gegeben: Es gibt offene und erledigte Pendenzen, einige mit Frist, eine mit Stern.
   - Wenn: Ich die Seite neu lade.
   - Dann: Alle Pendenzen sind mit Titel, Frist, Zustand und Stern noch da, die Fokus-Kachel zeigt dieselbe Pendenz wie vorher.
4. Abhaken
   - Gegeben: Eine offene Pendenz steht in der Liste.
   - Wenn: Ich ihre Checkbox anklicke.
   - Dann: Der Text wird animiert durchgestrichen, Konfetti erscheint, der Fortschrittsring zählt eins hoch und die Karte gleitet nach unten. Nochmal klicken macht alles rückgängig.
5. Schmales Fenster
   - Gegeben: Das Fenster ist 360 px breit.
   - Wenn: Ich Pendenzen erfasse, abhake und lösche.
   - Dann: Fokus-Kachel, Eingabe und Liste sind lesbar und bedienbar, es gibt kein seitliches Scrollen.
6. Frist erfassen
   - Gegeben: Ich tippe den Titel «Steuererklärung» und als Frist «31.03.2027».
   - Wenn: Ich Enter drücke.
   - Dann: Die Karte zeigt «31.03.2027», beide Felder sind leer und der Fokus steht wieder im Titelfeld.
7. Ungültige Frist
   - Gegeben: Ich tippe einen Titel und als Frist «31.02.2027» oder «morgen».
   - Wenn: Ich Enter drücke.
   - Dann: Es kommt keine Pendenz dazu, das Formular schüttelt sich und unter dem Fristfeld steht «Bitte als TT.MM.JJJJ eingeben».
8. Überfällig
   - Gegeben: Heute ist der 10.11.2026. Es gibt offene Pendenzen mit Frist 09.11.2026 und 10.11.2026.
   - Wenn: Ich die Liste ansehe.
   - Dann: Nur die Pendenz vom 09.11.2026 ist hervorgehoben und trägt «Überfällig». Wird sie abgehakt, verschwindet das Badge.
9. Fokus automatisch
   - Gegeben: Kein Stern ist gesetzt. Es gibt offene Pendenzen mit Frist 15.12.2026, mit Frist 20.11.2026 und eine ohne Frist.
   - Wenn: Ich die Seite ansehe.
   - Dann: Die Fokus-Kachel zeigt die Pendenz mit Frist 20.11.2026. Gibt es keine Pendenz mit Frist, zeigt sie die älteste offene.
10. Fokus per Stern
    - Gegeben: Die Fokus-Kachel zeigt automatisch eine Pendenz.
    - Wenn: Ich bei einer anderen Pendenz den Stern-Knopf drücke.
    - Dann: Die Fokus-Kachel zeigt diese Pendenz, nur sie hat einen gefüllten Stern. Nochmal drücken entfernt den Stern und die Kachel folgt wieder der Regel aus Kriterium 9.
11. Fokus abhaken
    - Gegeben: Die Fokus-Kachel zeigt eine Pendenz.
    - Wenn: Ich sie in der Kachel abhake.
    - Dann: Sie ist erledigt (wie Kriterium 4), ein gesetzter Stern ist weg und die Kachel zeigt den nächsten Schritt nach Kriterium 9. Ist nichts mehr offen, zeigt die Kachel «Alles erledigt. Zeit für Kaffee.»
12. Löschen mit Rückgängig
    - Gegeben: Eine Pendenz mit Frist steht an dritter Stelle.
    - Wenn: Ich sie lösche und im Toast innert 5 Sekunden «Rückgängig» klicke.
    - Dann: Sie ist mit Titel, Frist und Zustand wieder an dritter Stelle.

## Features

(leer)
