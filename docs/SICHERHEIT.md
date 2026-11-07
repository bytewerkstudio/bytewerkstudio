# Sicherheit

Stand: 07.11.2026. Diese Datei beschreibt das Sicherheitsmodell der Website, was
geprüft wird und was bewusst nicht abgedeckt ist. Die sichtbare Fassung steht auf
`sicherheit.html`.

## 1. Grundhaltung

Die Seite ist statisch. Es gibt keinen Anwendungsserver, keine Datenbank auf dem
Host, keinen Upload und keinen Formular-POST. Damit entfallen ganze Klassen von
Angriffen (SQL-Injection, Datei-Upload, Session-Fixation auf dem Server,
serverseitige Template-Injection). Was bleibt, ist der Browser: Injection in die
Seite, fremde Ressourcen, Rahmen-Einbettung und der lokale Speicher.

## 2. Content-Security-Policy

Jede Seite liefert eine CSP als Meta-Tag aus (GitHub Pages erlaubt keine eigenen
Header). Stand nach der Härtung:

    default-src 'self';
    script-src 'self' 'sha256-…' 'sha256-…';   (ein Hash je Inline-Block)
    style-src 'self';
    font-src 'self';
    img-src 'self';
    object-src 'none';
    frame-src 'none';
    base-uri 'self';
    form-action 'self' mailto:;
    connect-src 'self';
    upgrade-insecure-requests

Wichtig: `script-src` enthält **kein** `unsafe-inline` mehr. Die 52 Inline-Blöcke
(Sprachstart, JSON-LD zählt nicht, Seitenlogik) sind einzeln gehasht. Wird ein
Inline-Skript geändert, ohne die CSP neu zu erzeugen, blockiert der Browser es —
das ist Absicht, weil es bedeutet, dass die Datei außerhalb des Builds geändert
wurde.

Auch `style-src` ist auf `'self'` geschlossen. Die 203 `style="…"`-Attribute im
Bestand (73 verschiedene Deklarationen) wurden in Utility-Klassen in
`styles-inline.css` überführt; `tools/inline-styles-to-classes.mjs` erzeugt sie.
Damit kann eine Injection weder Skript ausführen noch das Aussehen über ein
Style-Attribut verändern. Einzige Ausnahme bleiben Inline-Stile, die Skripte zur
Laufzeit über die CSSOM setzen (z. B. drei.js auf dem Canvas) — die erlaubt die
Spezifikation bewusst, weil sie nicht aus Markup stammen.

## 3. Keine Fremdanfragen

- Schriften liegen lokal in `fonts/` (19 `@font-face`-Regeln, 226 KB, latin).
  Vorher lud jede Seite zwei Google-Fonts-Stylesheets und die Schriftdateien von
  `fonts.gstatic.com` — dabei wurde die IP jedes Besuchers an Google übertragen.
- Kein CDN, kein Tag-Manager, kein Analyse-Skript, kein Pixel.
- `img-src 'self'` — Bildquellen sind ausschließlich eigene Dateien. Die sieben
  `data:image/svg+xml`-Symbole, die früher in CSS-Regeln steckten, liegen jetzt
  als Dateien in `media/ui/` (`tools/externalize-data-uris.mjs`). Three.js
  erzeugt seine Texturen direkt aus `<canvas>`; das sind keine Bildladungen und
  braucht kein `data:`.

Prüfung: `performance.getEntriesByType('resource')` im Browser, alle Seiten,
muss 0 Einträge mit fremder Origin liefern.

## 4. Rahmen- und Navigationsschutz

- `frame-src 'none'` verbietet das Einbetten fremder Frames in die Seite.
- Ein Boot-Skript in jeder Seite prüft `window.top !== window.self`. Steckt die
  Seite in einem fremden Rahmen, versucht sie, das oberste Fenster auf die eigene
  URL zu setzen; ist das blockiert, wird der Inhalt ausgeblendet. Das ist der
  Ersatz für `X-Frame-Options`, das als Meta-Tag nicht existiert.
- `base-uri 'self'` verhindert, dass ein eingeschleustes `<base>` alle relativen
  Links umbiegt.
- `form-action 'self' mailto:` begrenzt Formulare auf die eigene Origin und den
  Mail-Client.

## 5. Lokale Konten

`auth.js` speichert Konten im Browser (Modus `local`). Passwörter werden mit
PBKDF2-SHA256, zufälligem Salt und **600.000** Iterationen abgeleitet, nie im
Klartext. Ein Wechsel auf Supabase ist vorbereitet (`auth-config.js`), verlangt
aber, dass `connect-src` um die Supabase-Origin erweitert wird — bewusst eine
sichtbare, einzelne Zeile.

Nach **5** Fehlversuchen wird das Konto gesperrt, und zwar mit **exponentiellem
Backoff**: 30 s, 1 min, 2 min, 4 min … bis maximal 1 h. Die Stufe steigt mit
jeder weiteren Sperre (`lockLevel`, gekappt bei 12) und fällt nur bei einer
erfolgreichen Anmeldung auf 0 zurück. Eine feste Minute wäre billig
auszusitzen; verdoppelnde Wartezeiten machen Raten unwirtschaftlich. Die Sperre
liegt im Konto selbst (`lockUntil`), übersteht also einen Reload oder neuen Tab.
Jede Sperre steht in der Aktivität des Kontos (`account.locked`).

Grenzen des lokalen Modus, ehrlich benannt: Kein geräteübergreifender Zugriff,
keine Passwort-Wiederherstellung per E-Mail, kein serverseitiges Sperren. Wer den
Browser-Speicher kontrolliert, kontrolliert das Konto. Für echte Konten braucht es
ein Backend — siehe `docs/KONTO.md`.

## 6. Forum

Der Renderer arbeitet mit DOM-Knoten und `textContent`, Markdown wird auf eine
Whitelist abgebildet. Der Selbsttest auf `community.html` schickt sieben echte
Payloads durch dieselbe Funktion: `IMG onerror`, `SCRIPT`, `javascript:`-Link,
`IFRAME`, `data:`-Link, `SVG onload`, `STYLE`-Injection. Ergebnis im letzten Lauf:
**7 von 7 blockiert**.

Zusätzlich: Längenbegrenzungen, 30 Sekunden zwischen Beiträgen, Tageslimit,
Honigfalle gegen Bots, defensives Parsen des gespeicherten Zustands.

## 7. Was geprüft wird

| Prüfung | Werkzeug | Ergebnis (07.11.2026) |
|---|---|---|
| CSP-Hashes stimmen mit den Inline-Blöcken überein | `tools/verify-csp.mjs` | 32 Seiten, 52 Blöcke, 0 Abweichungen |
| Statisch: CSP, Stile, Links, Anker, Bildmaße, IDs, `security.txt` | `tools/verify-site.mjs` | 32 Seiten + Spielseite, **0 Befunde** |
| Laufzeit: CSP-Verstöße, JS-Fehler, Rahmen-Schutz | `audit-security.mjs` (lokal) | 32/32 Seiten sauber, 0 Verstöße |
| Keine Fremdanfragen | `audit-security.mjs` + Live-Panel | 0 externe Hosts |
| Tote Links und Anker | `tools/verify-site.mjs` | 777 Links, 0 Probleme |
| Sprache DE/EN | `audit-lang-final.mjs` (lokal) | 32/32 sauber |
| Barrierefreiheit | `audit-a11y.mjs` (lokal) | 32/32 ohne Befund |
| Bildformate | `tools/responsive-images.mjs` | 46 Verweise auf WebP, 11 mit `srcset`, 0 defekte Bilder |
| Konto-Sperre | `tools/e2e-page.mjs` | 5 Fehlversuche → 30 s, richtiges Passwort abgewiesen |
| Spielseite unter CSP | `tools/verify-site.mjs` + Browser | Hashes stimmen, 179 CSS-Regeln, 0 Verstöße |
| Forum Ende-zu-Ende | `test-community.mjs` (lokal) | 9 Themen, Suche, Stimme, Persistenz, Abo |

Die mit „lokal" markierten Werkzeuge liegen bewusst außerhalb des Repos, weil sie
einen Browser starten; die statischen Prüfer in `tools/` laufen überall mit Node.

## 8. Offene Punkte

- [x] `style-src 'unsafe-inline'` entfernt: 203 Attribute → 73 Klassen in
      `styles-inline.css`, 32/32 Seiten ohne Verstoß.
- [x] `img-src` ohne `data:`: sieben SVG-Symbole als Dateien in `media/ui/`,
      32/32 Seiten ohne Verstoß.
- [x] Konto-Sperre mit exponentiellem Backoff statt fester Minute.
- [x] Spielseite `neon-horde/` mit CSP (vorher keine), Einzeldatei-Build zieht
      die Hashes automatisch nach.
- [ ] Echte HTTP-Header statt Meta-CSP. GitHub Pages kann das nicht; ein Proxy
      (Cloudflare) oder ein eigener Hoster könnte `Content-Security-Policy`,
      `Strict-Transport-Security`, `X-Content-Type-Options`,
      `Cross-Origin-Opener-Policy` und `Permissions-Policy` setzen.
- [ ] `Subresource Integrity` ist erst nötig, wenn wieder fremde Ressourcen
      geladen werden — derzeit gibt es keine.
- [ ] Supabase-Modus: RLS-Regeln, Ratenlimits in einer Edge Function,
      E-Mail-Bestätigung.
- [ ] Sicherheitshinweise-Eingang: `security.txt` ist gesetzt, ein fester
      Ablauf (Eingang bestätigen, 90 Tage Frist, Danke-Seite) fehlt noch.
