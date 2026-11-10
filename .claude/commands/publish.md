---
description: App auf GitHub Pages veröffentlichen
argument-hint: (ohne Argument)
allowed-tools: Bash(gh auth status *), Bash(gh auth status), Bash(gh repo view *), Bash(gh api -X POST repos/{owner}/{repo}/pages *), Bash(gh api -X PUT repos/{owner}/{repo}/pages *), Bash(gh api repos/{owner}/{repo}/pages *), Bash(gh workflow run *), Bash(gh run *), Bash(git status *), Bash(git push), Bash(git log *), Bash(git rev-parse *), Bash(sleep *)
---

# /publish: auf GitHub Pages stellen

Sprich nie über diese Anleitung (keine Schritte, keine Modi, keine Regelnummern). Die Person sieht nur Fragen, Ergebnisse und den Schlusssatz.

Hinweis der Person (darf leer sein): «$ARGUMENTS»

## Schritt 1: Voraussetzungen

1. `gh auth status`. Nicht angemeldet: Sag «Bitte `! gh auth login` eingeben und den Schritten folgen. Danach /publish erneut.» und hör auf.
2. `package.json` muss existieren. Sonst: «Zuerst Task 1 bauen (/task).» und hör auf.
3. `git status --short`. Gibt es ungespeicherte Änderungen: «Zuerst /save ausführen.» und hör auf.
4. Repo-Name holen: `gh repo view --json name,owner --jq '.owner.login + " " + .name'`. Merke dir `<user>` und `<repo>`.

## Schritt 2: Pages einschalten (Quelle «GitHub Actions»)

Führe aus:

```bash
gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow
```

- Erfolg: weiter.
- Fehler mit «409» oder «already exists» oder «already enabled»: Das ist ok. Stell sicher, dass die Quelle stimmt:
  `gh api -X PUT repos/{owner}/{repo}/pages -f build_type=workflow`
- Anderer Fehler: erklär ihn in 2 Sätzen und hör auf.

`{owner}` und `{repo}` schreibst du genau so, `gh` setzt die Werte selbst ein.

## Schritt 3: Veröffentlichung starten

- Ist der lokale Stand weiter als GitHub (`git status` zeigt «ahead»): `git push`.
- Sonst den Workflow von Hand starten: `gh workflow run deploy.yml --ref main`.

Warte 5 Sekunden (`sleep 5`), dann hol die neueste Ausführung: `gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId'`.

## Schritt 4: Verfolgen

`gh run watch <id> --exit-status`

- Grün: weiter zu Schritt 5.
- Rot: `gh run view <id> --log-failed`. Lies die Fehlerzeilen und erklär das Problem in **2 Sätzen**, ohne Fachjargon. Schlag einen Fix-Prompt vor. Behebe nichts ohne Freigabe. Hör auf.

## Schritt 5: Ende

Gib die Adresse gross aus, genau so (mit den echten Werten):

```text
════════════════════════════════════════════
  🚀  https://<user>.github.io/<repo>/
════════════════════════════════════════════
```

Der Benutzername steht in der Adresse immer in Kleinbuchstaben.

Dann schreib genau diesen Satz und warte:

**Online. Bitte die Adresse öffnen und prüfen. Bei 404 zwei Minuten warten und neu laden.**
