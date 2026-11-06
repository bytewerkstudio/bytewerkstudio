# Konto, Anmeldung und Registrierung

Die Website hat seit dem 03.11.2026 einen Konto-Bereich:

- `register.html` — Registrierung mit Name, E-Mail, Passwort, AGB-Checkbox
- `login.html` — Anmeldung, „angemeldet bleiben“, Passwort anzeigen
- `passwort-vergessen.html` — Reset-Anfrage
- `konto.html` — Dashboard mit Übersicht, Bibliothek, Bestellungen, Profil, Sicherheit

Der Header zeigt automatisch „Anmelden“ oder das Konto-Menü. Die Logik liegt in `auth.js`,
die Einstellungen in `auth-config.js`.

## Zwei Modi

### 1. `mode: 'local'` (Standard, funktioniert sofort)

Konten werden im Browser gespeichert (`localStorage`). Passwörter werden mit
PBKDF2-SHA256 (310.000 Iterationen, zufälliges Salt) gehasht, niemals im Klartext abgelegt.
Die Session liegt in `localStorage` (30 Tage) oder `sessionStorage` (ohne „angemeldet bleiben“).

Grenzen, die man kennen muss:

- Konten gelten nur in diesem Browser und auf diesem Gerät.
- Es wird keine E-Mail versendet, also kein echter Passwort-Reset.
- Serverseitige Sperren, Audit und Betrugsschutz gibt es nicht.
- Löscht der Nutzer die Browserdaten, ist das Konto weg.

Für eine Vorschau, ein Portfolio oder den Ein-Gerät-Betrieb ist das ausreichend. Für echte
Kundenkonten mit Käufen und Lizenzschlüsseln ist der Supabase-Modus vorgesehen.

### 2. `mode: 'supabase'` (echte Konten)

Supabase liefert Auth mit E-Mail-Bestätigung, Passwort-Reset und geräteübergreifender
Anmeldung. Der Client spricht die Supabase-REST-API direkt an, ohne SDK, damit die
Content-Security-Policy der Seite schlank bleibt.

Einrichtung:

1. Auf [supabase.com](https://supabase.com) ein Projekt anlegen (Free-Tier reicht).
2. Unter **Authentication → Providers** den E-Mail-Provider aktivieren.
3. Unter **Authentication → URL Configuration** eintragen:
   - Site URL: `https://bytewerkstudio.com`
   - Redirect URLs: `https://bytewerkstudio.com/login.html` und
     `https://bytewerkstudio.com/login.html?reset=1`
4. Optional `supabase/schema.sql` im SQL-Editor ausführen (nur für Auswertungen nötig).
5. In `auth-config.js` eintragen:

```js
mode: 'supabase',
supabaseUrl: 'https://DEIN-PROJEKT.supabase.co',
supabaseAnonKey: 'DEIN-ANON-KEY'
```

Der **anon key** ist ein öffentlicher Client-Key und darf im Browser stehen. Der
**service_role key** darf niemals in die Website.

Nach dem Umschalten: Registrierung testen, Bestätigungsmail prüfen, Login und Reset testen.
Die Seite zeigt den Vorschau-Hinweis dann automatisch nicht mehr an.

## Datenmodell (local)

| Key | Inhalt |
| --- | --- |
| `bw.accounts.v1` | Liste der Konten: id, email, name, salt, hash, iterations, createdAt, marketing, library, orders, activity |
| `bw.session.v1` | Aktive Session: uid, token, created, expires |
| `bw.sb.session.v1` | Nur im Supabase-Modus: access_token, refresh_token, expires_at, user |

## Funktionen im Dashboard

- **Übersicht** — Bibliothek, Bestellungen, Mitglied seit, letzte Aktivität
- **Bibliothek** — kostenlose Produkte hinzufügen, bezahlte Produkte verlinken, Lizenzen anzeigen
- **Bestellungen** — Tabelle, sobald Bestellungen mit der Konto-E-Mail verknüpft sind
- **Profil** — Name, Sprache, Marketing-Einwilligung, JSON-Export
- **Sicherheit** — Passwort ändern, Konto löschen (Bestätigung „LÖSCHEN“ + Passwort)

## Sicherheit und Datenschutz

- Im local-Modus verlässt kein Passwort den Browser.
- Der Hash ist salted und langsam (PBKDF2, 310k), das schützt gegen einfaches Auslesen.
- Fünf Fehlversuche sperren die Anmeldung für 60 Sekunden.
- Keine Tracker, keine externen Auth-Skripte, keine Cookies.
- Das Dashboard setzt `noindex, nofollow` und wird nicht in die Sitemap aufgenommen.

## Offene Punkte für den echten Betrieb

1. Supabase-Projekt verbinden und den kompletten Ablauf testen.
2. Bestellungen beim Checkout mit `order.productId`, `order.date`, `order.amount` ins Konto schreiben.
3. Lizenzschlüssel serverseitig erzeugen und im Konto anzeigen.
4. E-Mail-Vorlagen (Bestätigung, Reset) auf Deutsch anpassen.
5. Datenschutzerklärung um Konto-Datenverarbeitung ergänzen.
