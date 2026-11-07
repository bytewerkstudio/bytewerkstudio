# Marketing — Bytewerk Studio

Stand: 07.11.2026. Diese Datei beschreibt, wie die Website verkauft, was sie
verspricht, und wie man das ohne Tracking misst. Sie ist die Grundlage für alle
Texte und Kanäle; sie ersetzt keine Kampagne.

## 1. Positionierung

**Ein Satz.** Bytewerk Studio baut Software, Websites und Apps in Ludwigshafen —
direkt, nachvollziehbar, ohne Agentur-Umweg.

**Für wen.** Unternehmen und Gründer:innen in der Rhein-Neckar-Region, die eine
belastbare Umsetzung suchen; außerdem Entwickler:innen, die Werkzeuge und Code
aus dem Studio nutzen wollen (Community, Werkstatt-Abo).

**Warum wir.** Kurze Wege, klare Rückfragen, Code der beim Kunden bleibt,
eigene Produkte als Beweis (elf veröffentlichte Apps und Spiele).

**Tonalität.** Ruhig, konkret, ohne Superlative. Zahlen statt Adjektive
(„sieben Windows-Apps, vier Spiele") , Nutzen statt Technik („funktioniert
offline, ohne Konto") . Keine Dringlichkeit, keine Angst, kein „revolutionär".

## 2. Botschaften pro Zielgruppe

| Zielgruppe | Einstieg | Beweis | Handlung |
|---|---|---|---|
| Unternehmen (Region) | `softwareentwicklung-ludwigshafen.html` | Bauplan, Arbeiten, sieben eigene Apps | Projekt anfragen |
| Gründer:innen | Startseite, Konfigurator | Prozess, Festpreis-Pakete, Referenzen | Paket wählen / Kontakt |
| Käufer:innen von Apps | `shop.html`, Produktseiten | Screenshots, Feature-Listen, Lifetime-Lizenz | Kaufanfrage per E-Mail |
| Entwickler:innen | `community.html`, Werkstatt | Forum, Code-Reviews, Abo-Stufen | Developer-Abo |
| Neugierige / 3D | `showroom.html`, `marke.html` | three.js-Szenen, elf Tafeln | Arbeiten ansehen |

Jede Seite hat **genau eine** Hauptaktion. Startseite: Projekt starten.
Shop: Produkt öffnen. Community: Frage stellen. Produktseite: kaufen.

## 3. Kanäle

### 3.1 Eigene Seite (Hauptkanal)

- **SEO-Landingpage** `softwareentwicklung-ludwigshafen.html` für „Softwareentwicklung
  Ludwigshafen", „Webentwicklung Ludwigshafen", „App-Entwicklung Rhein-Neckar".
- **Produktseiten** für Long-Tail („Windows Lern-App offline", „PDF zu Text ohne Cloud",
  „Windows Update Manager winget"). Jede Seite hat eigene Description und OG-Tags.
- **Werkverzeichnis** `arbeiten.html` als Vertrauensbeweis, mit Filter und Fallstudien.
- **Community** als wiederkehrender Grund, die Seite erneut zu besuchen.

### 3.2 Suche und Sichtbarkeit

- `sitemap.xml` mit 27 URLs, `robots.txt` erlaubt alles, `CNAME` auf
  `bytewerkstudio.com`, HTTPS erzwungen.
- Strukturierte Daten (JSON-LD) auf 21 Seiten: Organization, WebSite, WebPage,
  BreadcrumbList, FAQPage, Product/SoftwareApplication.
- Kanonische URLs auf allen Seiten; `konto.html` ist `noindex` und nicht in der Sitemap.
- Sprache: DE als Standard, EN über den Header-Schalter. `og:locale` ist `de_DE`.

### 3.3 Geteilte Links

- Open-Graph- und Twitter-Card-Tags auf 23 Seiten. Bild ist derzeit `logo.svg`;
  für soziale Vorschauen ist ein 1200×630-PNG besser (siehe offene Punkte).
- Community-Seite hat eine Weitergeben-Karte: Link kopieren, E-Mail-Einladung,
  LinkedIn — **ohne** Tracking-Parameter.
- Forum-Themen haben Deep-Links (`community.html#thread-s1`), damit Antworten
  teilbar sind.

### 3.4 E-Mail und direkte Wege

- Kontaktformular öffnet das Mailprogramm (`mailto:`), kein Backend, kein Versand
  über Dritte. Das ist Datenschutz-Argument **und** Marketing-Argument.
- Kauf läuft über eine vorbereitete Mail mit Produkt, Preis und Lizenzhinweis.
- Abo-Anfrage im Forum legt einen lokalen Trial an; Rechnung folgt manuell.

### 3.5 Was bewusst fehlt

Kein Pixel, kein Cookie-Banner, keine Werbenetzwerke, kein Retargeting, keine
Newsletter-Anmeldung ohne Backend. Wer Reichweite kauft, muss das später
nachrüsten — dann mit Einwilligung und einem dokumentierten Zweck.

## 4. Website-Marketingflächen

| Fläche | Aufgabe | Datei |
|---|---|---|
| Hero | Positionierung in einem Satz, eine Aktion | `index.html` |
| Kennzahlen | Beweis (Produkte, Jahre, Region) | `index.html` |
| Werkstoff-Szene | Aufmerksamkeit ohne Ablenkung (three.js) | `scene-workstoff.js` |
| Showroom-Teaser | Neugier auf das Werkverzeichnis | `index.html` |
| Community-Teaser | Forum und Abo sichtbar machen | `styles-community-teaser.css` |
| Preise / Pakete | Entscheidungshilfe, Festpreis | `index.html#preise` |
| Konfigurator | Projekt zuschneiden, Anfrage vorbereiten | `ui-v4.js` |
| FAQ | Einwände vorwegnehmen | `index.html#faq` |
| Community-Seite | Bindung, Abo, Sicherheitsbeweis | `community.html` |
| Weitergeben-Karte | organische Verbreitung | `community.html` |

## 5. Abo-Stufen für Entwickler

| Stufe | Preis | Inhalt | Ziel |
|---|---|---|---|
| Community | 0 € | Forum lesen und schreiben, Lesezeichen, Gelöst-Marken | Einstieg, Reichweite |
| Developer | 12 €/Monat oder 120 €/Jahr | Werkstatt, ein Code-Review pro Monat, frühe Builds, 10 % Shop-Rabatt | Bindung, wiederkehrender Umsatz |
| Studio | 39 €/Monat oder 390 €/Jahr | alles aus Developer, drei Plätze, Priorität im Forum, Architektur-Sprechstunde | Teams, höherer Umsatz |

Die Stufen sind auf `community.html#abo` sichtbar und lokal aktivierbar. Die
Abrechnung ist bewusst **nicht** eingebaut (kein Stripe-Key im Repo); die
Oberfläche legt eine Anfrage an. Vor dem Verkauf braucht es: Rechnungsstellung,
Widerrufsbelehrung, Kündigungsweg, Steuerlogik.

## 6. Launch-Ablauf (pro Änderung)

1. Text gegen Tonalität prüfen: ein Satz, eine Aktion, keine Superlative.
2. `og:title`, `og:description`, `og:image` und Canonical setzen.
3. JSON-LD ergänzen, wenn die Seite neu ist (WebPage + BreadcrumbList).
4. Neue URL in `sitemap.xml` mit `lastmod`.
5. DE und EN durchklicken (`tools/audit-i18n.mjs`), 390/768/1440 px prüfen.
6. Interne Links: mindestens zwei eingehende Links auf jede wichtige Seite.
7. Nach dem Push: Seite in der GitHub-Pages-Vorschau öffnen, Status 200 prüfen.

## 7. Messung ohne Tracking

Die Seite setzt keine Analyse ein. Verfügbar sind:

- **GitHub-Pages-Traffic** (Repository → Insights → Traffic): Aufrufe, Herkunft,
  meistbesuchte Seiten. Aggregiert, ohne Personenbezug, 14 Tage Fenster.
- **Server-Logs des Hosters** (falls eigener Hoster): Statuscodes, Fehlerquote.
- **Forum-Zahlen lokal**: Themen, Antworten, gelöste Themen — nur auf dem Gerät,
  nicht aggregierbar.
- **Suchkonsole** (sobald eingerichtet): Impressionen, Klicks, Suchbegriffe.

Kennzahlen, die zählen: Anfragen pro Woche, Shop-Käufe pro Monat, wiederkehrende
Forum-Nutzer:innen, Abo-Anfragen. Nicht zählen: Seitenaufrufe ohne Handlung.

## 8. Inhalte für das Forum (Redaktionsplan)

Das Forum startet mit neun Themen. Damit es nicht leer wirkt, sind die ersten
Antworten Teil des Seeds. Danach gilt: pro Woche ein Thema, das ein echtes
Problem aus einem Projekt beschreibt, plus eine kurze Antwort aus dem Studio.

Beispielthemen, die zur Positionierung passen:

1. „CSP ohne Inline: wie liefert man eine strikte Policy aus?" (Sicherheit)
2. „Three.js: Szene pausiert nicht im Hintergrund-Tab" (Performance)
3. „Wann lohnt sich eine Windows-App statt einer Web-App?" (Beratung)
4. „PDF-OCR lokal: welche Bibliothek ist wartbar?" (Produktnähe)
5. „Kunde will Festpreis, Umfang ist unklar — wie schneidet man?" (Prozess)

Regeln: keine Werbung, keine Kundennamen, keine Preise Dritter.

## 9. Vorlagen

**Kurzbeschreibung (Social, 2 Zeilen).**
Software, Websites und Apps aus Ludwigshafen. Elf eigene Produkte, ein Forum für
Entwickler:innen, Code der beim Kunden bleibt.

**E-Mail-Betreff für Projektanfragen.**
`Projektanfrage: <Ziel> — <Zeitraum>`

**Shop-Mail-Betreff.**
`Kaufanfrage: <Produkt> — Lifetime-Lizenz`

**Einladung ins Forum.**
`Frage, Antwort, gelöst: das Bytewerk-Forum ist offen — ohne Konto, ohne Tracking.`

## 10. Offene Punkte

- [ ] 1200×630 PNG als `og:image` je Seitengruppe (Start, Shop, Community, Produkt)
- [ ] `og:image` auf absolute URL mit Bildmaßen (`og:image:width`, `:height`) ergänzen
- [ ] Suchkonsole und Sitemap-Einreichung bei Google und Bing
- [ ] Englische Fassung als eigene URLs (`/en/…`) statt Client-Umschaltung — besser für SEO
- [ ] Newsletter oder RSS für das Forum (braucht Backend oder statischen Feed)
- [ ] Abo-Abrechnung (Stripe oder Rechnung) inklusive Widerruf und Kündigung
- [ ] Pressemappe: Logo, Farben, drei Screenshots, Gründer-Porträt
- [ ] Case Studies mit Zahlen (Dauer, Umfang, Ergebnis) auf `arbeiten.html`
