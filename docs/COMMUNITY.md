# Community & Forum

Seite: [community.html](../community.html) · Schicht: [styles-community.css](../styles-community.css)
· Motor: [community.js](../community.js) · Bühne: [community-scene.js](../community-scene.js)

Das Forum ist ein **statischer Vorschau-Modus**: Beiträge liegen in
`localStorage` unter `bw-community-v1`. Es gibt keinen Server, kein Konto, keine
Übertragung. Das ist Absicht — die Seite soll die Bedienung, das Design und die
Sicherheitsregeln zeigen, ohne eine halbfertige Datenbank zu behaupten.

## Was die Seite kann

| Bereich | Funktion |
|---|---|
| Bühne | Fünf Kategorie-Karten als Three.js-„Ideenregal“, ziehen dreht, Klick filtert |
| Forum | 9 Beispiel-Themen, Suche, Sortierung, Kategorie-Chips, Lesezeichen, Gelöst-Marke |
| Thema | Antworten, Hilfreich-Stimmen, Code-Blöcke mit Kopieren, Melden, eigene Beiträge löschen |
| Schreiben | Verfassen-Dialog mit Kategorie, Tags, Markdown-lite, Vorschau, Entwurf, Honigfalle |
| Abo | Community / Developer / Studio, Monat/Jahr-Umschalter, lokale Aktivierung, Verwaltung, Kündigung |
| Werkstatt | Nur mit Abo lesbar; gesperrte Ansicht mit klarem Weg zum Plan |
| Sicherheit | Sechs Karten plus Selbsttest mit sieben echten Angriffs-Payloads |
| Marketing | Weitergeben-Karte (Link kopieren, E-Mail-Einladung, LinkedIn) ohne Tracking-Parameter |

## Sicherheitsmodell

Die Seite ist so gebaut, dass Nutzertext niemals Code werden kann.

1. **Rendern ohne `innerHTML`.** `renderRich()` erzeugt ausschließlich
   `document.createTextNode`, `strong`, `em`, `code`, `pre`, `ul`, `ol`, `li`,
   `blockquote`, `p`, `br` und `a`. Unbekannte Zeichen bleiben Text.
2. **Link-Allowlist.** Nur `http:`, `https:` und `mailto:` werden zu Links;
   `javascript:` und `data:` bleiben sichtbarer Text. Jeder externe Link bekommt
   `rel="noopener noreferrer nofollow ugc"` und `target="_blank"`.
3. **Zustand ist untrusted.** `loadState()` parst `localStorage` defensiv:
   Version prüfen, IDs gegen `/^[a-z0-9_-]{2,40}$/i`, Kategorie gegen Allowlist,
   Längen klemmen, Autoren neu aufbauen, unbekannte Pläne verwerfen. Ein
   manipulierter Speicher kann die Seite nicht in einen anderen Zustand zwingen.
4. **CSP bleibt strikt.** `script-src 'self' 'unsafe-inline'` (das Inline-Skript
   im `<head>` setzt nur die Sprache), keine fremden Skripte, kein CDN, kein
   `eval`. Three.js kommt aus `vendor/`.
5. **Missbrauchsgrenzen.** 30 Sekunden zwischen Beiträgen, 40 Beiträge pro Tag,
   Titel 8–120 Zeichen, Beitrag 20–4000 Zeichen, maximal 3 Tags, 80 Antworten
   pro Thema, 200 eigene Themen.
6. **Honigfalle.** Ein visuell verstecktes Feld (`#cm-hp`). Ist es gefüllt, wird
   der Beitrag verworfen, ohne einen Fehler zu zeigen.
7. **Melden.** Ein gemeldeter Beitrag wird lokal ausgeblendet (`hiddenPosts`),
   nicht gelöscht. Die Seite behauptet keine Moderation, die sie nicht hat.

### Selbsttest

Der Knopf „Selbsttest starten“ schickt sieben Payloads durch denselben Renderer,
der jeden Beitrag rendert: `<img onerror>`, `<script>`, `javascript:`-Link,
`<iframe>`, `data:`-Link, `<svg onload>`, `<style>`. Geprüft wird, dass kein
Element aus der Gefahrenliste entsteht, kein `on*`-Attribut übrig bleibt und kein
Link ein gefährliches Protokoll behält.

### Was ein echter Betrieb zusätzlich braucht

Dieser statische Modus ersetzt **keine** Serverregeln. Für echte Konten:

- Beiträge serverseitig validieren und in einer Datenbank mit Row Level Security
  speichern (siehe [KONTO.md](KONTO.md)).
- Ratenlimits pro Konto **und** pro IP im Edge Function / API-Layer.
- Moderation mit Rollen, Meldequeue und Sperren.
- E-Mail-Verifizierung vor dem ersten Beitrag.
- Signierte Uploads nur für Bilder, mit Größen- und Typprüfung.
- Regelmäßige Abhängigkeitsprüfung (`npm audit`, Dependabot) für den Build.

## Sprache

Die Seite nutzt die vorhandene DE/EN-Engine aus `components.js`
(`data-en`, `data-en-ph`, `data-en-aria`) und hört auf `bw:lang`. Dynamische
Texte laufen über `t(de, en)` in `community.js`. Eine weitere Sprache braucht:
einen Knopf im Header, einen Eintrag in `components.js` (`applyLang`) und je
Text ein weiteres Datenattribut — die Struktur ist darauf vorbereitet.

## Dateien und Besitz

| Datei | Gehört | Änderbar durch |
|---|---|---|
| `community.html` | Community-Agent | nur nach Absprache |
| `styles-community.css` | Community-Agent | nur nach Absprache |
| `community.js` | Community-Agent | nur nach Absprache |
| `community-scene.js` | Community-Agent | nur nach Absprache |
| `components.js` | Shared | Header-Eintrag abgestimmt, sonst Shared-Owner |
| `sitemap.xml` | Shared | Eintrag ergänzt |

Die Koordination läuft über das Agenten-Issue im Repository; das lokale Brett
liegt in [AGENTEN-BRETT.md](AGENTEN-BRETT.md).

## Prüfen

```
python3 -m http.server 8765
```

Dann `http://127.0.0.1:8765/community.html` öffnen. Geprüft wurden 1440, 1240,
1101, 1024, 768 und 390 Pixel Breite ohne horizontales Überlaufen, 0
Konsolenfehler, `node --check` für beide Skripte und der Selbsttest mit 7/7
abgewehrten Payloads.

## Redaktion

Beispiel-Themen liegen als `SEED` in `community.js`. Ein neues Thema ist ein
Objekt mit `id`, `cat`, `author`, `at` (Millisekunden), `tags`, `title` und
`body` (je `de`/`en`) sowie `replies`. Danach `node --check community.js` und die
Seite neu laden.
