# Agenten-Brett

Ein Ort für Absprachen, solange das GitHub-Issue nicht erreichbar ist (kein `gh`
im Terminal). Format wie im Issue: `Agent | Aufgabe | Dateien | Status | Commit`.

## Regeln

1. Vor dem ersten Schreibzugriff die Datei hier eintragen.
2. Eine Datei gehört genau einem Agenten, solange er sie offen hat.
3. `git pull` vor dem ersten Schreibzugriff, `node --check` vor jedem Commit.
4. Kein Force-Push, keine Sammel-Commits, keine Secrets.
5. Was hier steht, ist der aktuelle Stand — nicht das, was ein Agent plant.

## Belegung

| Agent | Aufgabe | Dateien | Status | Commit |
|---|---|---|---|---|
| Fable (Community) | Forum, Entwickler-Abo, Sicherheit, 3D-Idee­regal | `community.html`, `styles-community.css`, `community.js`, `community-scene.js`, `docs/COMMUNITY.md` | fertig, geprüft | `fable/community`, 9 Commits |
| Fable (Community) | Header-Eintrag Community | `components.js` (nur `NAV_LINKS`, Footer-Spalte Studio) | fertig | `fable/community` |
| Fable (Community) | Sitemap-Eintrag | `sitemap.xml` | fertig | `fable/community` |
| Fable (Community) | Merge `fable/community` → `main` (Fast-Forward) | `community*`, `components.js`, `sitemap.xml` | fertig, `main` lokal = `9e5d5e7` | `fable/community` |
| Fable (Abschluss) | Community-Teaser auf der Startseite | `index.html` (nur ein Abschnitt), **neu** `styles-community-teaser.css` | fertig, 1440 + 390 px geprüft | `f7a6118` |
| Fable (Abschluss) | EN-Übersetzungslücken auf zehn Produktseiten | `produkt.html`, `lernreich-pro.html`, `keyforge-vault.html`, `lumaweek-planner.html`, `updatepilot.html`, `bytewerk-pdf-text-pro.html`, `neon-dominion.html`, `mastil.html`, `burgenwerk.html`, `pruefungs-countdown.html` | fertig, 0 deutsche Reste | `38e0955` |
| — | Startseite, Hero, Showroom, Zeichenwerk | siehe `AGENTS.md` | von anderen Agenten belegt | — |
| — | `styles-v5.css`, `ui-v5.js` | — | von anderen Agenten belegt, nicht angefasst | — |
| — | `studio.html`, `atelier.js`, `styles-atelier.css` | — | **fremde, unversionierte Arbeit im Arbeitsverzeichnis** — nicht angefasst | — |

## Übergabe an andere Agenten

- **Header:** `components.js` hat jetzt neun Navigationspunkte. Zwischen 1101 und
  1520 px greift eine engere Laufweite in `styles-community.css`
  (`@media (min-width: 1101px) and (max-width: 1520px)`). Wer die Navigation
  ändert, prüft 1440, 1240 und 1101 px.
- **Neue Sprache:** Die Community-Seite hängt an `bw:lang` und `t(de, en)`.
  Ein dritter Sprachcode braucht `data-xx`-Attribute und einen Fallback in
  `components.js`.
- **Echtes Backend:** `docs/COMMUNITY.md` beschreibt, welche Serverregeln fehlen.
  Die Oberfläche ist darauf vorbereitet — `state` ist die einzige Quelle, die
  gegen eine API getauscht werden müsste.

## Wichtig für die Zusammenführung

Im Arbeitsverzeichnis `../bytewerkstudio-forum` (Branch `claude/forum`) liegt eine
**zweite** Forum-Seite: `forum.html` mit `forum.js`, `styles-forum.css` und
`forum-scene.js`. Sie ist eigenständig gebaut und beansprucht ebenfalls einen
Eintrag in `components.js` (`NAV_LINKS`) und in `sitemap.xml`.

Das ist keine Doppelarbeit aus Versehen, sondern zwei Entwürfe für dieselbe
Aufgabe.

**Empfehlung: `community.html` behalten.** Sie deckt alles ab, was der Auftrag
verlangt — Forum, Entwickler-Abo, Sicherheits-Selbsttest, DE/EN, 3D-Bühne — und
ist auf 320–1440 px gemessen. `forum.html` ist ein reines Forum ohne Abo und
ohne Sicherheitsabschnitt. Vor dem Merge:

1. **Nur `community.html` mergen.** Dann `forum.html`, `forum.js`,
   `styles-forum.css`, `forum-scene.js` und `supabase/forum-schema.sql` nicht
   mitnehmen; `NAV_LINKS` behält genau einen Eintrag (`Community` →
   `community.html`). So steht es im Branch `fable/community` bereits.
2. **Falls `forum.html` schon auf `main` liegt,** bleibt sie als reine
   Themenseite erreichbar; dann in `components.js` den Eintrag `Forum`
   entfernen und in `forum.html` einen `<link rel="canonical">` auf
   `community.html` setzen, damit nicht zwei Foren um dieselben Suchbegriffe
   konkurrieren.

Beide Entwürfe sind in sich geprüft; sie sind nur nicht füreinander gedacht.
Wer merged, prüft danach den Header bei 1440, 1240 und 1101 px, weil beide
Zweige die Navigation enger stellen.

## Veröffentlichung

- Branch `fable/community` liegt **auf dem Fork** `predatorhwg-commits/bytewerkstudio`
  (Push nach `bytewerkstudio/bytewerkstudio` ist mit dem vorhandenen Token nicht
  erlaubt, HTTP 403).
- Pull Request von dort: `https://github.com/predatorhwg-commits/bytewerkstudio/pull/new/fable/community`
- Nach dem Merge nach `main` veröffentlicht GitHub Pages automatisch; die Seite
  erscheint dann unter `https://bytewerkstudio.com/community.html`.
- Stand geprüft: `https://bytewerkstudio.com/community.html` antwortet noch mit
  **404**, solange der Branch nicht auf `main` liegt.

## Offene Punkte

- [ ] Supabase-Modus für Beiträge (Tabelle `posts`, RLS, Edge Function für Ratenlimits)
- [ ] E-Mail-Bestätigung vor dem ersten Beitrag
- [ ] Moderation: Meldequeue statt lokalem Ausblenden
- [ ] Übersetzung in eine dritte Sprache
- [x] Startseiten-Teaser, der auf `community.html` verweist — eingefügt,
      eigener Stylesheet-Link statt Inline-`<style>` (CSP-freundlich)

## Messstand nach dem Abschluss (07.11.2026, 07:20)

Alle 32 Seiten, jeweils 390 und 1440 px, im Headless-Chromium gegen
`python3 -m http.server`:

- 0 Konsolenfehler, 0 horizontales Überlaufen, 0 doppelte IDs, 0 Bilder ohne `alt`
- genau eine `h1` pro Seite, Header und Footer überall vorhanden
- `node --check` auf `community.js`, `community-scene.js`, `components.js` sauber
- Forum Ende-zu-Ende getestet: 9 Startthemen, Suche (3 Treffer für „three"),
  Thema öffnen, Hilfreich-Stimme 34 → 35, Antwort zählt, neues Thema anlegen,
  nach Reload vorhanden, Developer-Abo aktiviert, Werkstatt entsperrt
- Sicherheits-Selbsttest: „7 of 7 attacks blocked" (IMG/SCRIPT/javascript:/
  IFRAME/data:/SVG/STYLE), keine Konsolenfehler dabei
- Sprachaudit DE→EN: 0 deutsche Reste auf Startseite, Community, Shop,
  Arbeiten, Showroom, Studio, Kontakt, Vergleich, Bauplan, Probierstand,
  Marke und den zehn Produktseiten (vorher 98 Stellen)
- three.js: Canvas live auf Startseite (`#stratum`, `#studio-stage`),
  Community (`#community-stage`), Showroom (`#sr-stage`), Bauplan (`#contour`),
  Marke, Studio, Probierstand und 404; keine WebGL-Fehler

## Abschlusslauf Sprachaudit (07.11.2026, 08:05) — Commit `d680db0`

`tools/audit-lang-final.mjs` gegen alle 31 Seiten, Sprache auf EN geschaltet:

    SUMMARY pages=31 clean=31 problems=0

0 deutsche Reste, 0 Konsolenfehler. Zusätzlich übersetzt: AGB, Datenschutz,
Impressum samt Fließtexten und Tabellen-Ankern, `softwareentwicklung-ludwigshafen.html`
(54 Stellen), `shop.html`, alle zehn Produktseiten, Kontakt-Dropdowns,
`register.html` (Passwort-Meter reagiert jetzt auf den Sprachwechsel) und
`index.html` (`ws-fig`).

Marketing steht in `docs/MARKETING.md`: Positionierung, Zielgruppen, Kanäle,
Abo-Stufen, Launch-Ablauf, Messung ohne Tracking, Redaktionsplan, Vorlagen,
offene Punkte (OG-Bild 1200×630, Suchkonsole, englische URLs, Abo-Abrechnung).

## Testwerkzeuge (außerhalb des Repos, unter `~/tools`)

`shot2.mjs` (Screenshot), `audit-one.js` (Seitenprüfung), `audit-i18n.mjs`
(Sprachreste), `missing-i18n.mjs` (fehlende `data-en`), `test-community.mjs`
(Forum/Abo/Selbsttest), `check-links.mjs` (tote Links und Anker).
