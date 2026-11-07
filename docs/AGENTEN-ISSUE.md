# Agenten-Issue — Website-Aufwertung bis Mittag (07.11.2026)

Dieses Dokument ersetzt das GitHub-Issue, solange `gh` im Terminal fehlt
(`gh: command not found`, kein Token). Format wie im Issue:
`Agent | Aufgabe | Dateien | Status | Commit`.

## Auftrag

Die Bytewerk-Website bis 12:00 Uhr auf einen sehr hohen Stand bringen:
Grafik, Funktionen, Forum, Abo-Stufen für Entwickler, three.js,
Claude-Design, Mobil/Tablet/PC, DE/EN, Marketing, Sicherheit.
Bestehende Seiten nur additiv ändern, keine fremden Dateien überschreiben,
Mehrfacharbeit vermeiden.

## Abgrenzung — wer was hält

| Agent | Aufgabe | Dateien | Status | Commit |
|---|---|---|---|---|
| Integration (dieser Lauf) | Zusammenführung, Startseiten-Sektion, Marketing, Schriften, Doku | `index.html` (nur neue Sektion), `components.js` (nur `NAV_LINKS` + Footer), `sitemap.xml`, `styles-mittag.css`, `styles.css` + `styles-claude.css` (nur `@import`), `README.md`, `AGENTS.md`, `docs/AGENTEN-ISSUE.md` | in Arbeit → `mittag/integration` | siehe `git log` |
| Astra | Entwickler-Seite mit API-Referenz, Sandbox und Abo-Stufen | `entwickler.html`, `entwickler.js`, `styles-entwickler.css`, `fonts/`, `media/og-entwickler.png`, `site.webmanifest` | übernommen, geprüft | `astra/dev-clean` |
| Claude | Forum mit Threads, Antworten, Lösungsmarkierung, Pro-Stufe | `forum.html`, `forum.js`, `styles-forum.css`, `forum-scene.js`, `supabase/forum-schema.sql` | übernommen, geprüft | `claude/forum` |
| Kimi | Sicherheitsseite, Selbsttest, Meldeweg, Härtungs-Header | `sicherheit.html`, `sicherheit.js`, `scene-sicherheit.js`, `styles-sicherheit.css`, `SECURITY.md`, `.well-known/security.txt`, `_headers`, `docs/SICHERHEIT.md` | übernommen, geprüft | `kimi/sicherheit` |
| Fable | Community-Entwurf (zweites Forum) | `community.html`, `community.js`, `community-scene.js`, `styles-community.css` | **nicht übernommen** — siehe Entscheidung unten | `fable/community` |
| andere | Startseite, Hero, Showroom, Zeichenwerk, Werkstoff | siehe `AGENTS.md` | unangetastet | — |

### Entscheidung: ein Forum, nicht zwei

`forum.html` (Branch `claude/forum`) und `community.html` (Branch
`fable/community`) sind zwei unabhängige Entwürfe derselben Aufgabe. Für
`main` gilt **`forum.html` als das eine Forum**: es hat Threads, Antworten,
Lösungsmarkierung, Suche, Ratenlimits, Pro-Stufe und eine eigene
three.js-Bühne. Der Community-Entwurf bleibt im Branch liegen und wird nicht
gemerged, damit Navigation und Sitemap genau einen Eintrag haben.

## Was dieser Lauf geändert hat

Additiv, ohne fremde Arbeit zu überschreiben:

1. **Startseite** (`index.html`): neue Sektion `#entwickler` zwischen Studio
   und Preisen. Drei Karten (Forum, API-Abo, Sicherheit) und eine Stufenreihe
   Sandbox 0 € / Pro 29 € / Team 99 €. DE/EN über `data-en`, Claude-Optik über
   die vorhandenen Tokens. Styling in `styles-mittag.css` (Namespace `.mw-*`).
2. **Navigation** (`components.js`): Forum und Entwickler in `NAV_LINKS`,
   Forum/Entwickler/Sicherheit in der Footer-Spalte Studio bzw. Rechtliches.
   `localStorage` beim Sprachwechsel gegen blockierten Speicher abgesichert.
3. **Sitemap**: drei neue URLs (`forum.html`, `entwickler.html`,
   `sicherheit.html`).
4. **Schriften**: `styles.css` und `styles-claude.css` importieren nur noch
   `fonts/fonts.css` (lokal, SIL OFL). Damit lädt keine Seite mehr
   `fonts.googleapis.com` oder `fonts.gstatic.com`. Die CSP wurde auf allen
   Seiten von `font-src https://fonts.gstatic.com` auf `font-src 'self'`
   gezogen; `style-src` braucht die Google-Ausnahme nicht mehr. Die
   Preconnect-Links sind entfernt.
5. **Dokumentation**: `README.md`, `AGENTS.md`, `SECURITY.md` und
   `docs/SICHERHEIT.md` beschreiben den neuen Stand.

Nicht angefasst: `styles-v5.css`, `ui-v5.js`, `styles-work.css`,
`work-gallery.js`, `brief.js`, `schichtmodell.js`, `kontakt.html`,
`scene-404.js` und alle Produktseiten — sie gehören anderen Arbeiten.

## Prüfungen (Belege)

Alle Läufe mit `chrome-headless-shell` gegen `python3 -m http.server 8791`,
jeweils ohne Konsolenfehler:

| Prüfung | Ergebnis |
|---|---|
| Startseite 390 / 768 / 1024 / 1440 px | kein horizontaler Überlauf (`scrollWidth - innerWidth = 0`) |
| Navigation 1440 / 1280 / 1101 px | 9 Links, keine Überlappung, kein Clipping |
| Navigation ≤ 1024 px | Umschalter sichtbar, Menü öffnet, 11 Einträge |
| Forum | Thread anlegen, öffnen, antworten, suchen, DE/EN, Persistenz |
| Forum-XSS | `<script>` und `onerror` aus dem Composer werden nicht ausgeführt (`window.__fmXss = 0`) |
| Entwickler-Sandbox | 200 / 401 / 403 / 400 / 201 / 422 wie dokumentiert |
| Abo-Umschalter | monatlich 0 / 29 / 99 €, jährlich 0 / 24 / 82 € |
| Sicherheits-Selbsttest | 8 Fragen, 0 → 100 Punkte, Reset, Tabs |
| three.js | Forum-, Sicherheits-, Entwickler- und Startseiten-Szene melden `three.js r180`, WebGL aktiv |
| Schriften | `document.fonts.check` für Inter, Newsreader, JetBrains Mono = true, 0 Google-Requests |
| Interne Links | 32 Seiten geprüft, keine fehlende Datei |

## Offene Punkte

- [ ] Supabase-Modus für Forum-Beiträge (Tabelle `posts`, RLS, Edge Function für Ratenlimits)
- [ ] `_headers` wirkt erst nach Umzug von GitHub Pages (GitHub ignoriert die Datei)
- [ ] `script-src 'unsafe-inline'` durch Hashes/Nonces ersetzen, dann CSP Stufe 3
- [ ] Startseiten-Teaser für das Forum mit echten Threads füttern
