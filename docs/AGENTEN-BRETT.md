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
| Fable (Härtung) | CSP mit SHA-256-Hashes statt `unsafe-inline`, `frame-src 'none'`, Rahmen-Schutz, lokale Schriften | alle `*.html` (nur `<head>`), `fonts/**`, `styles.css`, `styles-claude.css`, `components.js` | fertig, 32/32 Seiten ohne Verstoß | `6b14295` |
| Fable (Härtung) | Neue Seite Sicherheit mit Live-Prüfung und three.js-Szene | **neu** `sicherheit.html`, `styles-sicherheit.css`, `scene-sicherheit.js`, `docs/SICHERHEIT.md`, `.well-known/security.txt`, `sitemap.xml` | fertig, 390/768/1440 px geprüft | `6b14295` |
| Fable (Härtung) | Passwort-Blockliste, 600.000 PBKDF2-Iterationen | `auth.js`, `register.html`, `docs/KONTO.md` | fertig, 6 Testfälle | in Arbeit |
| Fable (Härtung) | Skip-Link, `<main>`-Landmark, `aria-current`, Bildmaße | alle `*.html` (additiv), `components.js`, `ui-v5.js`, `work-gallery.js` | fertig, 32/32 Seiten ohne Befund | in Arbeit |
| — | Startseite, Hero, Showroom, Zeichenwerk | siehe `AGENTS.md` | von anderen Agenten belegt | — |
| — | `styles-v5.css`, `ui-v5.js` | — | von anderen Agenten belegt, `ui-v5.js` nur um Bildmaße und Button-Text ergänzt | — |
| — | `studio.html`, `atelier.js`, `styles-atelier.css` | — | **fremde, unversionierte Arbeit im Arbeitsverzeichnis** — nicht committet; `studio.html` nur mechanisch an CSP/Schriften/Boot angepasst | — |

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

## Abschluss Härtung und Bildformate (07.11.2026, 11:15)

Commits `6b14295` (CSP, Schriften, Sicherheitsseite) und `5621cc2`
(Barrierefreiheit, Robustheit) auf `main`, danach der Bildformat-Durchgang.

Belege, alle gegen `http://127.0.0.1:8961/`:

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| CSP-Hashes | `verify-csp.mjs` | 32 Seiten, 52 Inline-Blöcke, 0 Abweichungen |
| Laufzeit: CSP, JS, Rahmen | `audit-security.mjs` | `pages=32 clean=32 problems=0` |
| Barrierefreiheit | `audit-a11y.mjs` | `pages=32 clean=32` |
| Sprache DE→EN | `audit-lang-final.mjs` | `pages=32 clean=32 problems=0` |
| Links und Anker | `check-links.mjs` | 33 Seiten, 624 Links, 0 Probleme |
| Performance | `audit-perf.mjs` | CLS 0,001 auf allen 5 Stichproben, 0 Fremdanfragen |
| Forum Ende-zu-Ende | `test-community.mjs` | 7/7 Payloads blockiert, 0 Konsolenfehler |

**Bildformate.** 46 `<img>`-Verweise zeigen jetzt direkt auf WebP
(`media/*.webp`, 9 Dateien, zusammen 443 KB statt 864 KB). Die JPEG/PNG-Originale
bleiben als Quelle im Repo; kein Browser lädt sie noch. Vorher lud die
Startseite das MASTIL-Bild doppelt (JPEG 308 KB + WebP 236 KB), weil der
statische Bento die Quelle vor dem Galerieaufbau anforderte — dieser
Doppelabruf ist weg, `work-gallery.js` entzieht den Originalen die `src`,
sobald die Galerie steht, und stellt sie bei einem Fehler wieder her.

Startseite: 2263 KB → 1736 KB, LCP 1500 → 160 ms (Stichprobe, 1440 px).
`shop.html` 1469 → 1382 KB, `arbeiten.html` 1741 → 1532 KB.

Offen: die Originale (JPEG/PNG) könnten nach einer Übergangsfrist gelöscht
werden; solange ältere Caches sie anfordern, bleiben sie liegen.

## style-src geschlossen (07.11.2026, 11:40)

Die letzte offene CSP-Lücke aus `docs/SICHERHEIT.md` ist zu: **kein
`unsafe-inline` mehr, auch nicht für Stile.**

- 203 `style="…"`-Attribute, 73 verschiedene Deklarationen, in Utility-Klassen
  überführt (`styles-inline.css`, alle mit `!important`, damit sie wie zuvor
  Element-Selektoren schlagen). Erzeugt von `tools/inline-styles-to-classes.mjs`.
- Die sieben `style="--i:N"` im SVG von `ui-entscheidung.js` wurden zu
  `data-i="N"` plus sechs CSS-Regeln — `innerHTML` mit Style-Attribut ist unter
  `style-src 'self'` blockiert.
- Neue CSP-Zeile: `style-src 'self';` — geprüft mit `verify-csp.mjs` (32 Seiten,
  52 Blöcke, 0 Abweichungen) und `audit-security.mjs`
  (`pages=32 clean=32 problems=0`, 0 CSP-Verstöße).
- Die Sicherheitsseite prüft das jetzt selbst: Live-Panel **13/13**.

**Geometrievergleich** gegen den Stand davor (`8211496`, zweiter Server auf
`:8962`), 32 Seiten, jedes Element mit Position, Größe, Sichtbarkeit, Schrift,
Farbe: 21 Seiten pixelgleich, die übrigen Abweichungen liegen im Messrauschen
(identische Stände zeigen bis zu 8 px bei Reveal-Animationen). Ausnahmen:
`sicherheit.html` (neue Tabellenzeile, gewollt) und `studio.html` (fremde,
unversionierte Arbeit — nicht von mir).

## Responsive Bilder und Prüfwerkzeug im Repo (07.11.2026, 12:05)

**Bilder.** Die drei großen Screenshots haben jetzt `srcset` mit 800w/1200w-
Varianten und `sizes`; drei falsche `width`/`height`-Angaben (1200×800 bei
16:9-Bildern) sind auf die echten Maße korrigiert. Das Vorschau-Bild in
`arbeiten.html` lädt beim Hover die 800w-Fassung (62 KB statt 236 KB), die
Galerie reicht `srcset`/`sizes` an ihre `<img>` weiter und der Preload-Warmup
respektiert sie ebenfalls.

Messung Startseite, `performance.getEntriesByType('resource')`, 0 Fremdanfragen:

| Breite | vorher | jetzt |
|---|---|---|
| 390 px | – | **208 KB**, 38 Anfragen |
| 1440 px | 2263 KB | **1519 KB**, 38 Anfragen |

**Werkzeuge jetzt im Repo** (`tools/`, keine Abhängigkeiten, Node ≥ 18):

| Datei | Zweck |
|---|---|
| `verify-site.mjs` | 12 statische Prüfungen, Exit-Code 1 bei Befund |
| `verify-csp.mjs` | Hash-Abgleich Inline-Skript ↔ CSP |
| `harden-csp.mjs` | CSP-Hashes neu erzeugen (nach jeder Skript-Änderung) |
| `inline-styles-to-classes.mjs` | `style="…"` → Klassen in `styles-inline.css` |
| `responsive-images.mjs` | `srcset`/`sizes` + echte Bildmaße |
| `externalize-data-uris.mjs` | `data:image/…` aus CSS → `media/ui/` |
| `serve.mjs` | lokaler Server **mit gzip**, damit Messungen zu GitHub Pages passen |
| `e2e-page.mjs` | Seite über CDP fernsteuern, Szenarien als `.mjs` |

`node tools/verify-site.mjs` auf dem Stand davor (`8211496`): **102 Befunde**;
auf dem aktuellen Stand: **0**. Damit ist der Prüfer selbst belegt, nicht nur
die Seiten.

## img-src, Konto-Sperre, Spielseite (07.11.2026, 12:10)

**CSP ist jetzt vollständig zu — auch für Bilder.**

- `img-src 'self' data:` → `img-src 'self'`. Die sieben `data:image/svg+xml`-
  Symbole aus den Stylesheets liegen als Dateien in `media/ui/`
  (`tools/externalize-data-uris.mjs`, Dateinamen sind Inhalts-Hashes, also
  wiederholbar). Three.js-Texturen entstehen aus `<canvas>` und sind keine
  Bildladungen — sie brauchen kein `data:`.
- Prüfung: 8 Seiten im Browser, 0 Bilder kaputt, 0 CSP-Verstöße.

**Konto-Sperre** (`auth.js`): 5 Fehlversuche, danach **exponentielles Backoff**
30 s → 1 min → 2 min → 4 min … max. 1 h (`lockLevel`, gekappt bei 12), Rückfall
auf 0 nur bei erfolgreicher Anmeldung. Die Sperre liegt im Konto (`lockUntil`),
übersteht also Reload und neuen Tab; jede Sperre steht als `account.locked` in
der Aktivität. Ende-zu-Ende geprüft (`tools/e2e-page.mjs`): 5 Fehlversuche,
danach wird auch das **richtige** Passwort mit „in 30 Sekunden" abgewiesen.

**`neon-horde/` hatte gar keine CSP.** Jetzt:

- `neon-horde/index.html`: CSP mit Hashes für den Stilblock und den Boot-Guard,
  `connect-src 'none'`, `worker-src 'none'`, `form-action 'none'`,
  `frame-src 'none'`. Icon als `icon.svg` statt `data:`-URI.
- Stile, die Module zur Laufzeit einfügen, gehen jetzt über ein **constructable
  stylesheet** (`adoptedStyleSheets`) statt über ein `<style>`-Element —
  `style-src 'self'` blockiert Letzteres, Ersteres nicht (im Browser gemessen).
  Das `<style>`-Element bleibt nur als Fallback für alte Browser.
- `build/build.js` erzeugt die CSP für die Einzeldatei-Fassung **aus dem
  Output** neu, sonst würde der Hash des zusammengelegten Skriptblocks nicht
  mehr stimmen. Der Build bricht ab, wenn die CSP fehlt.
- Gemessen: Spiel startet im Menü, 179 CSS-Regeln, Canvas gezeichnet,
  0 Verstöße, 0 Fehler; Screenshot vor/nach CSP **0 abweichende Pixel**.

**Prüfwerkzeug erweitert:** `verify-site.mjs` prüft jetzt auch
`neon-horde/index.html` und `neon-horde/dist/index.html` (CSP vorhanden, kein
`unsafe-inline`, alle Hashes stimmen, keine `data:`-URIs). Gegenprobe: CSP aus
`dist` entfernt → Prüfer meldet `subapp-csp`, wiederhergestellt → 0 Befunde.

**Neue Werkzeuge:** `tools/serve.mjs` (lokaler Server **mit gzip** — der
Python-Server liefert unkomprimiert und macht jede Messung zu pessimistisch) und
`tools/e2e-page.mjs` (Szenarien als `.mjs`, echte Abläufe statt Screenshots).

Damit sind die realistischen Zahlen: Startseite **624 KB** bei 1440 px
(vorher unkomprimiert gemessen 2263 KB), 41 Anfragen, 0 Fremdanfragen.

## Abschluss-Prüfung (07.11.2026, 12:35)

Nach allen Änderungen, gegen `tools/serve.mjs` (gzip wie GitHub Pages):

| Prüfung | Ergebnis |
|---|---|
| `tools/verify-site.mjs` | 32 Seiten + 2 Spielseiten, **0 Befunde** |
| `tools/verify-csp.mjs` | 32 Seiten, 52 Inline-Blöcke, 0 Abweichungen |
| `audit-security.mjs` | **32/32** sauber, 0 CSP-Verstöße, 0 JS-Fehler |
| `audit-a11y.mjs` | **32/32** ohne Befund |
| `audit-lang-final.mjs` | **32/32** sauber |
| Überlauf 320/390/768/1440 px | keine Seite überläuft horizontal |
| Kennzahlen Startseite 1440 px | 624 KB, 41 Anfragen, 0 Fremdanfragen |
| Kennzahlen Startseite 390 px | 208 KB, 38 Anfragen |

**Funktionsprobe im Browser** (`tools/e2e-page.mjs`): Sprache DE↔EN schaltet
`<html lang>` und die Texte, Suche öffnet mit Cmd/Ctrl+K, findet Treffer und
schließt mit Escape, Werkkorb-Knopf vorhanden, Konto-Sperre greift nach
5 Fehlversuchen.

**Suche ergänzt:** Sieben Seiten fehlten im Index — Sicherheit, Community,
Arbeiten, Bauplan, Showroom, Probierstand, Marke. Eine Suche nach „sicher"
fand vorher nur KeyForge Vault, jetzt die Sicherheitsseite zuerst. AGB,
Datenschutz, Impressum, 404 und die Anmelde-Flows bleiben bewusst draußen.

## Veröffentlichung — offen

Stand auf dem Fork `predatorhwg-commits/bytewerkstudio`, Branch `main`,
`c2d879f`. `git push origin main` scheitert mit 403 (keine Schreibrechte).

Im Hauptrepo sind **fünf** Pull-Requests offen (#26–#30), keiner davon ist
`predatorhwg-commits:main`. `community.html` und `sicherheit.html` liefern live
weiterhin **404**. Zum Veröffentlichen entweder Schreibrechte auf
`bytewerkstudio/bytewerkstudio` geben oder einen PR von
`predatorhwg-commits:main` → `bytewerkstudio:main` öffnen.
