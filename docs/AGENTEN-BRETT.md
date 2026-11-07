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
| Fable (Community) | Forum, Entwickler-Abo, Sicherheit, 3D-Idee­regal | `community.html`, `styles-community.css`, `community.js`, `community-scene.js`, `docs/COMMUNITY.md` | fertig, in Prüfung | `fable/community` |
| Fable (Community) | Header-Eintrag Community | `components.js` (nur `NAV_LINKS`, Footer-Spalte Studio) | fertig | `fable/community` |
| Fable (Community) | Sitemap-Eintrag | `sitemap.xml` | fertig | `fable/community` |
| — | Startseite, Hero, Showroom, Zeichenwerk | siehe `AGENTS.md` | von anderen Agenten belegt | — |
| — | `styles-v5.css`, `ui-v5.js` | — | von anderen Agenten belegt, nicht angefasst | — |

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

## Offene Punkte

- [ ] Supabase-Modus für Beiträge (Tabelle `posts`, RLS, Edge Function für Ratenlimits)
- [ ] E-Mail-Bestätigung vor dem ersten Beitrag
- [ ] Moderation: Meldequeue statt lokalem Ausblenden
- [ ] Übersetzung in eine dritte Sprache
- [ ] Startseiten-Teaser, der auf `community.html` verweist
