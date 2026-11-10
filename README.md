# HWZ Starter: Agentic Engineering

Mit diesem Repo baut der Agent eine App. Die Person am Laptop steuert, der Agent schreibt den Code.

## Start

```bash
gh repo create hwz-todo --public --clone --template stobro/hwz-starter
cd hwz-todo
claude
```

Beim ersten Start fragt Claude, ob dem Ordner vertraut wird: **«Yes, proceed»** wählen. Erst dann gelten die Freigaben des Projekts und es kommen kaum Rückfragen.

Danach `/` tippen. Es erscheinen sechs Befehle.

## Die sechs Befehle

| Befehl                  | Was er tut                                           | Entscheidung                     |
| ----------------------- | ---------------------------------------------------- | -------------------------------- |
| `/spec <Wunsch>`        | Fragt nach und schreibt `docs/SPEC.md` (was die App können muss) | Look wählen, SPEC freigeben |
| `/plan`                 | Schreibt `docs/PLAN.md` und `docs/TASKS.md` (Bauplan in kleinen Schritten) | Plan freigeben |
| `/task`                 | Baut genau einen Task, mit Test                      | Ergebnis im Browser anschauen    |
| `/review`               | Prüft alles gegen die SPEC und die Wow-Checkliste    | Abnahme                          |
| `/save <Nachricht>`     | Speichert den Stand auf GitHub (Commit und Push)     | Nachricht bestätigen             |
| `/publish`              | Stellt die App auf GitHub Pages (öffentliche Webseite) | URL öffnen                     |

## Ablauf Bau 1: die Liste

`/spec Eine ToDo-App für mich: Aufgaben anlegen, abhaken und löschen.`
→ `/plan` → `/task` (wiederholen, bis alle Tasks abgehakt sind) → `/review` → `/save Bau 1: Liste` → `/publish`

## Ablauf Bau 2: das Board

Feature aus `docs/FEATURES.md` wählen, dann `/spec <Feature>` → `/plan` → `/task` … wie oben. Für jedes weitere Feature wieder mit `/spec` beginnen.

Fertige Prompts stehen in `docs/PROMPTS.md`.

## Wenn etwas klemmt

| Problem                       | Lösung                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| «Port 5173 is already in use» | Das andere Terminal mit dem Dev-Server schliessen oder `npm run dev -- --port 5174` |
| npm-Fehler beim Installieren  | `node -v` prüfen (aktuelle LTS von nodejs.org), dann: «Führe node scripts/setup.mjs --tested aus.» |
| gh nicht angemeldet           | `! gh auth login` in Claude tippen und den Schritten im Browser folgen |
| Pages zeigt 404               | 2 Minuten warten, dann Seite neu laden; sonst `/publish` erneut        |
| «API Error: 502» oder Abbruch mitten im Satz | Der AI Hub hatte einen Aussetzer. Eine Minute warten, dann denselben Befehl noch einmal. |
| Agent hängt fest              | `Esc` drücken, dann: «Stopp. Erklär in 3 Sätzen, wo es klemmt.»        |
