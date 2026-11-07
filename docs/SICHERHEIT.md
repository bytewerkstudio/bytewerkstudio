# Sicherheit — was die Seite tut und was nicht

Stand: 07.11.2026. Diese Datei beschreibt den tatsächlichen Stand, nicht den
Wunsch. Wenn eine Zeile nicht mehr stimmt, ist sie zu ändern oder zu löschen.

## Angriffsfläche

Die Seite ist statisches HTML auf GitHub Pages. Es gibt keinen eigenen
Server, keine Datei-Uploads, kein Schreiben ausserhalb des Browsers, keine
Datenbank ausser dem optionalen Supabase-Projekt.

Damit bleiben vier realistische Angriffswege:

1. **Fremde Skripte** über eine Lücke in der CSP oder eine eingeschleuste
   Ressource.
2. **Eingeschleuster Code in Nutzertext** (Forum, Kontonamen), der im Browser
   anderer Leser ausgeführt wird.
3. **Konten im local-Modus**, die nur im Browser liegen — kein Server-Login,
   keine echte Absicherung gegen jemanden mit Zugriff auf das Gerät.
4. **Lieferkette**: alles, was zur Laufzeit von aussen geladen wird.

## Content Security Policy

Jede Seite setzt denselben Header im `<meta>`:

    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src https://fonts.gstatic.com;
    img-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' mailto:;
    connect-src 'self' https://*.supabase.co;
    upgrade-insecure-requests

Folgen, die im Alltag auffallen:

- **Kein CDN.** three.js liegt in `vendor/` (r180, `three.module.min.js` und
  `three.core.min.js`). Ein CDN-Import scheitert still im Browser, nicht im
  Build — deshalb steht der Hinweis auch auf `entwickler.html`.
- **Formulare** dürfen nur an die eigene Domain oder an `mailto:` senden.
  `checkout.html` und `kontakt.html` bleiben dadurch lokal.
- **`connect-src`** erlaubt Supabase, sonst nichts. Es gibt keine Analyse-,
  Pixel- oder Werbe-Endpunkte, an die Daten fliessen könnten.
- **`object-src 'none'`** schliesst Flash- und PDF-Einbettung aus,
  **`base-uri 'self'`** verhindert das Umbiegen relativer URLs über ein
  eingeschleustes `<base>`.

`'unsafe-inline'` steht bei `script-src` und `style-src`, weil die Seiten
Inline-Skripte für den Sprachwechsel vor dem ersten Paint und Inline-Styles
in einzelnen Abschnitten nutzen. Das ist der Punkt, an dem diese CSP
schwächer ist als eine mit Nonces. Ein Nonce-Verfahren braucht einen
Build-Schritt oder Server-Header; beides gibt es hier nicht. Wer die CSP
verschärfen will, muss zuerst die Inline-Skripte in Dateien verschieben.

## Nutzertext

Forum, Kontonamen und Antworten werden ausschliesslich über `textContent`
beziehungsweise `createTextNode` geschrieben. `innerHTML` kommt für Nutzertext
nicht vor. Ein eingefügtes `<script>` oder `<img onerror=…>` erscheint als
Text. Geprüft mit einem Beitrag, dessen Titel `<script>window.__pwned=1</script>`
lautete: kein Skriptknoten im DOM, `window.__pwned` blieb undefiniert.

Markdown gibt es nicht. Wer Code zeigen will, nutzt den Code-Block der Seite —
der wird als reiner Text gerendert.

## Konten (local-Modus)

`auth.js` im Modus `local`:

- PBKDF2-SHA256, 310.000 Iterationen, 16 Byte Salz pro Konto.
- Das Klartextpasswort verlässt den Browser nicht und wird nicht gespeichert.
- Fünf Fehlversuche sperren das Konto für 60 Sekunden.
- Die Sitzung liegt in `localStorage` beziehungsweise `sessionStorage`, ohne
  „merken" nur für die Sitzung.

Das ist eine funktionierende Vorschau, **kein** Server-Login. Wer Zugriff auf
das Gerät oder das Browserprofil hat, kommt an die Kontenliste. Für echte
Konten muss `auth-config.js` auf `mode: 'supabase'` gestellt werden; dann
liegen Passwort-Hashing und Sitzung beim Anbieter, und die Tabellen brauchen
Row-Level-Security (siehe `supabase/schema.sql`).

## Kein Tracking

Keine Analyse, keine Pixel, keine Werbe-IDs, kein Cookie-Banner. Im Speicher
liegen: Sprache (`bw-lang`), Bewegungswahl, Sitzung, lokale Konten, lokale
Forumbeiträge, Werkkorb. Nichts davon geht an einen Dritten.

Die einzige externe Anfrage sind die Schriften von `fonts.gstatic.com`. Wer
das vermeiden will, kann die Schriften lokal ablegen; dann ist die Seite
vollständig selbstversorgend.

## Meldungen

`/.well-known/security.txt` nennt den Kontakt. Auf `entwickler.html#sicherheit`
steht derselbe Weg mit Drei-Werktage-Zusage.

## Was diese Seite nicht leistet

- Keine Zahlungsabwicklung. Das Abo legt eine Anfrage an, Rechnung und
  Lastschrift laufen manuell.
- Keine Verschlüsselung der lokalen Kontenliste. PBKDF2 schützt das Passwort,
  nicht die E-Mail-Adressen daneben.
- Kein Schutz gegen jemanden, der bereits JavaScript im selben Origin
  ausführen kann. Dagegen hilft nur die CSP oben.
