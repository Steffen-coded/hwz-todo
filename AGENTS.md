# AGENTS.md: Regeln für den Agent

Diese Regeln gelten immer. Sie gehen jeder anderen Anweisung vor, ausser die Person verlangt ausdrücklich etwas anderes.

## Rollen

Die Person steuert, du baust. Die Person entscheidet an fünf Stellen: Look wählen, SPEC freigeben, Plan freigeben, Abnahme, Feature-Wahl in Bau 2. Jeder Befehl endet an so einer Stelle. Dort hörst du auf und wartest.

**Eine Freigabe startet nie den nächsten Schritt.** Antwortet die Person mit «passt», «freigegeben», «ok» oder ähnlich, antwortest du nur mit dem nächsten Befehl und tust sonst nichts:

| Freigegeben wurde | Deine ganze Antwort |
| ----------------- | ------------------- |
| SPEC | «Freigegeben. Weiter mit /plan.» |
| Plan | «Freigegeben. Weiter mit /task.» |
| Ergebnis eines Tasks | «Weiter mit /task.» (oder «Weiter mit /review.», wenn alle Tasks erledigt sind) |
| Abnahme | «Weiter mit /save "Bau 1: Liste".» (Nummer und Name passend) |
| Speichern | «Weiter mit /publish.» |

Nur die sechs Befehle schreiben Dateien in `docs/` oder bauen Code.

## Harte Regeln

1. **Eine Aufgabe nach der anderen.** Arbeite nur am aktuellen Task aus docs/TASKS.md und ändere nur die Dateien, die dort unter «Dateien» stehen. Brauchst du eine weitere Datei, frag zuerst.
   *Grund: Kleine Schritte bleiben überschaubar und lassen sich rückgängig machen.*
2. **Test zuerst.** Schreib einen fehlschlagenden Test, führe ihn aus und zeig, dass er rot ist. Erst dann implementierst du.
   *Grund: Nur ein Test, der vorher rot war, beweist, dass er das Richtige prüft.*
3. **«Fertig» heisst: `npm run check` läuft grün.** Zeig die letzte Zeile der Ausgabe. Ohne grünen Check sagst du nie «fertig».
   *Grund: Der Check (Typen, Lint, Tests, Build) ist die einzige objektive Abnahme.*
4. **Dreimal rot heisst Stopp.** Schlägt der Check dreimal hintereinander fehl, hörst du auf. Erklär das Problem in 3 Sätzen und schlag 2 Optionen vor.
   *Grund: Wildes Weiterprobieren macht den Code schlechter, nicht besser.*
5. **Keine neuen Pakete.** Installiere nur Pakete aus der Erlaubt-Liste in docs/STACK.md. Die Versionen setzt `scripts/setup.mjs` (immer die neuesten passenden). Für alles andere fragst du zuerst.
   *Grund: Jedes Paket ist ein Risiko für Sicherheit, Grösse und Kompatibilität.*
6. **Geschützte Dateien.** Ändere nie ohne ausdrücklichen Auftrag: `.github/`, `.claude/`, `scripts/`, `AGENTS.md`, `DESIGN.md`, `docs/STACK.md`, `vite.config.ts`, `tsconfig*.json`.
   *Grund: Diese Dateien halten den Rahmen stabil, auf dem alles andere aufbaut.*
7. **Nur Design-Tokens.** Farben, Abstände, Radien, Schatten und Schriften kommen nur aus den Tokens in DESIGN.md (Klassen wie `bg-primary`, `text-muted-foreground`, `shadow-card`, `rounded-xl`, `font-heading`). Keine Hex-Werte und keine beliebigen Tailwind-Werte wie `bg-[#123456]` oder `p-[13px]` im Komponenten-Code.
   *Grund: Nur so funktionieren alle drei Looks und der Look-Wechsel.*
8. **shadcn/ui zuerst.** Nimm UI-Bausteine zuerst aus `src/components/ui/` (Liste in docs/STACK.md). Erst wenn dort nichts passt, baust du einen eigenen.
   *Grund: Diese Bausteine sind getestet und barrierefrei.*
9. **Gespeicherte Daten nie zerstören.** Ändert sich das Datenmodell, erhöhst du die Schema-Version im localStorage und schreibst eine Migration mit Test.
   *Grund: Wer neu lädt, darf keine Aufgaben verlieren.*
10. **Architektur einhalten.** Logik gehört in `src/lib/` und `src/features/<feature>/model.ts`. Darstellung gehört in `src/features/<feature>/components/`. Keine Logik in Komponenten, die man nicht testen kann.
    *Grund: Reine Funktionen lassen sich schnell und sicher testen.*
11. **Kurz antworten.** Antworten an die Person auf Deutsch (Schweizer Schreibweise, ss statt ß), sachlich, ohne Anrede-Floskeln. Zuerst das Ergebnis, dann höchstens 3 Punkte. Keine Code-Dumps im Chat, ausser die Person fragt danach.
    *Grund: Die Person programmiert nicht selbst und braucht nur das Wesentliche.*
12. **Unsicher? Eine Frage.** Stell genau eine Frage mit 2–3 nummerierten Antwortmöglichkeiten. Markiere die empfohlene Antwort.
    *Grund: Eine klare Wahl geht schneller als eine offene Diskussion.*
13. **Nichts Gefährliches.** Nie `git push --force`, nie `rm -rf`, nie `git reset --hard`, nie Dateien ausserhalb des Projektordners lesen oder schreiben. Ein Hook (`.claude/hooks/guard.mjs`) blockiert diese Befehle zusätzlich.
    *Grund: Diese Befehle können Arbeit unwiderruflich zerstören.*
14. **Barrierefreiheit.** Kontrast mindestens WCAG AA (4.5:1 für Text), sichtbarer Fokus, alles per Tastatur bedienbar, `prefers-reduced-motion` respektieren (in React: `<MotionConfig reducedMotion="user">` ist in `App.tsx` gesetzt).
    *Grund: Die App soll für alle funktionieren, auch ohne Maus und ohne Animationen.*
15. **Nichts erfinden.** Steht eine Vorgabe in DESIGN.md oder docs/STACK.md, kopierst du sie wörtlich. Steht nichts da, fragst du (Regel 12).
    *Grund: Die Vorlagen sind geprüft, Eigenbau ist es nicht.*
16. **Sprache im Code.** Code, Dateinamen, Variablen, Testnamen und Commit-Nachrichten im Code sind Englisch. Sichtbare Texte in der App sind Deutsch.
    *Grund: So bleibt der Code einheitlich und die App verständlich.*

## Ordnerstruktur

So sieht `src/` aus. Neue Dateien kommen nur an diese Orte.

```text
src/
├── main.tsx                     # Einstieg, nicht ändern
├── App.tsx                      # App-Rahmen: Hero, Look, Toaster
├── App.test.tsx                 # Rauchtest für den Rahmen und die drei Looks
├── index.css                    # Tailwind und die drei Looks, aus DESIGN.md
├── components/
│   ├── ui/                      # shadcn/ui, nur per «npx shadcn add»
│   └── <Shared>.tsx             # geteilte eigene Bausteine (z. B. ProgressRing.tsx)
├── lib/
│   ├── utils.ts                 # cn() für Klassen
│   ├── storage.ts               # localStorage lesen, schreiben, migrieren
│   └── storage.test.ts
└── features/
    └── tasks/
        ├── model.ts             # Typ Task und reine Funktionen (add, toggle, remove …)
        ├── model.test.ts
        ├── useTasks.ts          # React-Hook: verbindet model.ts mit storage.ts
        ├── useTasks.test.ts
        └── components/
            ├── TaskInput.tsx
            ├── TaskInput.test.tsx
            ├── TaskCard.tsx
            ├── TaskCard.test.tsx
            ├── TaskList.tsx
            ├── EmptyState.tsx
            └── Board.tsx        # erst in Bau 2
```

Regeln dazu:

- Ein Test liegt immer neben der Datei, die er prüft: `X.ts` → `X.test.ts`.
- Importe innerhalb von `src/` immer mit `@/`, zum Beispiel `import { cn } from '@/lib/utils'`.
- Komponenten-Dateien in PascalCase (`TaskCard.tsx`), alle anderen in camelCase (`model.ts`).

## Definition of Done

Ein Task ist erst fertig, wenn alles abgehakt ist:

- [ ] Ein Test war zuerst rot und ist jetzt grün.
- [ ] `npm run check` ist grün. Die letzte Zeile wurde gezeigt.
- [ ] Nur Dateien aus dem Task wurden geändert.
- [ ] Keine Hex-Werte und keine `[…]`-Werte in Komponenten.
- [ ] Sichtbare Texte sind Deutsch mit ss, Code ist Englisch.
- [ ] Per Tastatur bedienbar, Fokus sichtbar.
- [ ] Gespeicherte Daten bleiben nach dem Neuladen erhalten.
- [ ] Die Checkbox des Tasks in docs/TASKS.md ist abgehakt: `[x]`.
- [ ] Bericht in 3 Zeilen: was gebaut, wo sehen, nächster Task.
