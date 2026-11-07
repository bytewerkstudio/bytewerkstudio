# Bytewerk Website — Arbeitsregeln

Statische Website für bytewerkstudio.com. GitHub Pages veröffentlicht direkt aus
`main`, es gibt keinen Build-Schritt.

## Vor der Arbeit

- Offene Issues lesen: `gh issue list --repo bytewerkstudio/bytewerkstudio --state open`.
- Aufgabe im Issue **„Agenten-Austausch: Aufgaben und Datei-Ownership (Website)“**
  claimen, bevor Dateien geändert werden.
- Dateien, die ein anderer Agent dort beansprucht, nicht ohne Absprache ändern.
- `git pull` vor dem ersten Schreibzugriff, damit alle denselben Stand haben.

## Prüfen vor jedem Push

- `node --check` für jede geänderte JavaScript-Datei.
- Interne Links und Anker prüfen, doppelte IDs vermeiden.
- 1440 px und 390 px ohne horizontales Überlaufen testen.
- 0 Konsolenfehler im Browser.
- Keine Secrets, Keys, Logs, `status.json`, Build-Artefakte oder `*.bak_*`
  committen.

## Koordination

- Ein Kanal: das Agenten-Issue. Kein zweites Parallelsystem.
- Check-in-Format: `Agent | Aufgabe | Dateien | Status | Commit`.
- Wer eine Datei länger als einen Arbeitsschritt offen hat, trägt sie als
  beansprucht ein.
- `main` wird direkt veröffentlicht, deshalb keinen Force-Push und keine
  ungeprüften Sammel-Commits.

## Aktuelle Schichten

| Datei | Zweck |
|---|---|
| `styles.css` | Basis-Theme |
| `styles-v3.css` | Editorial-Layer |
| `styles-auth.css` | Konto und Anmeldung |
| `styles-claude.css` | Claude-Look und V4-Funktionen, wird zuletzt geladen |
| `components.js` | Header, Footer, DE/EN |
| `ui-v4.js` | Suche, Shop-Werkzeuge, Konfigurator |
| `background.js` | Bewegter Hintergrund, code-only |
| `styles-schichtmodell.css` + `schichtmodell.js` | Startseiten-Sektion „Ein Produkt. Vier Schichten." (three.js, r180) |
| `styles-studio3d.css` + `scene-studio.js` | frühere Hero-Bühne, derzeit von keiner Seite geladen; bleibt als Rückfall im Repo |
| `styles-mittag.css` | Startseiten-Sektion Entwickler/Forum/Sicherheit (`.mw-*`) |
| `styles-forum.css` + `forum.js` + `forum-scene.js` | Forum, Pro-Stufe, three.js-Pinwand |
| `styles-entwickler.css` + `entwickler.js` | API-Referenz, Sandbox, Abo-Stufen |
| `styles-sicherheit.css` + `sicherheit.js` + `scene-sicherheit.js` | Sicherheitsseite und Selbsttest |
| `fonts/fonts.css` | Lokale Schriften (Newsreader, Inter, JetBrains Mono) |

Zusammenführung und Datei-Ownership stehen in
[`docs/AGENTEN-ISSUE.md`](docs/AGENTEN-ISSUE.md).
