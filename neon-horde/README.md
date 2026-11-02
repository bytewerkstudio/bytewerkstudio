# NEON HORDE — Bytewerk Studio

**Kauf die Waffe. Level sie hoch. Noch eine Welle.**

Auto-Aim-Wave-Shooter im Vampire-Survivors-Stil: Endlos-Wellen, 10 kauf- und upgradefähige Waffen, Horden aus 9 Gegnern + 2 Bosse, Combo-Economy, tägliche Belohnungen, Streaks, Offline-Reward und Prestige-Meta. Komplett ohne externe Assets — eine einzige `index.html`, Vanilla JavaScript, Canvas 2D und WebAudio-Synth-Sound.

## Features

- **Waffen-Kauf & Upgrade als Herzstück**: 10 Waffen (Scattergun bis Railgun), Level-Kurven, Milestones bei Lv 3 / Lv 6 / Max, Verkauf mit 50 % Rückgabe.
- **Auto-Aim-Horden**: Du steuerst nur Bewegung und Ausweichen, alles feuert automatisch auf killbare Ziele zuerst.
- **Combo-Fieber**: 2 s-Fenster, ×5 = doppeltes Scrap, ×7 = +10 % Schaden mit Fanfare, Hit-Stop, Screen-Shake.
- **Retention-Systeme**: Daily-Belohnung (50→1000, ab 7-Tage-Streak ×2), Offline-Belohnung (bis 8 h), 24 Errungenschaften, Wochen-Challenge, Operator-Level.
- **Prestige**: Ab Welle 20 Reset gegen permanente Nexus-Shards (HP, Schaden, Speed, Start-Scrap, Start-Waffen-Level).
- **Verlustvermeidung**: 80 % des Scraps sind bei Tod sicher — nichts geht verloren.
- **Zweisprachig** DE/EN, Desktop + Touch (Joystick), läuft offline via `file://` und GitHub Pages.

## Steuerung

| Eingabe | Aktion |
| --- | --- |
| WASD / Pfeile / Joystick | Bewegen |
| Auto | Waffen feuern automatisch |
| P | Pause |
| E | Shop früh öffnen |
| Space / Enter | Nächste Welle |
| 1 / 2 / 3 | Shop-Karte kaufen |

## Projektstruktur

```
neon-horde/
├── index.html          # Shell: Canvas + Skript-Ladereihenfolge
├── src/                # Modular aufgebaute Module (lesbar & wartbar)
│   ├── loader.js       # NH-Namespace, Utilities, Event-Bus, i18n, DOM
│   ├── balance.js      # ALLE Balance-Zahlen (Single Source of Truth)
│   ├── api.js          # Verbindlicher Modul-Vertrag
│   ├── lang.js         # DE/EN-Texte
│   ├── audio.js        # WebAudio-Synth-SFX
│   ├── input.js        # Tastatur + Touch-Joystick
│   ├── save.js         # localStorage-Persistenz
│   ├── meta.js         # Bank, Shards, Daily, Streak, Offline, Achievements
│   ├── entities.js     # Gegner, Bosse, Projektile, Partikel, Pickups
│   ├── weapons.js      # Effektive Stats, Auto-Aim, Feuermuster
│   ├── waves.js        # Spawn-Budget, Skalierung, Boss-Rhythmus
│   ├── shop.js         # Draft-Shop (Kaufen/Upgraden/Verkaufen)
│   ├── ui.js           # Theme, HUD, Screens, Toasts
│   ├── game.js         # Loop, State-Machine, Combo, Integrator
│   └── main.js         # Boot-Sequenz
├── build/build.js      # Veredelung: src/* → dist/index.html
├── test/smoke.js       # Node-Smoke-Test mit DOM/Canvas-Stubs
└── dist/index.html     # Single-File-Build (Verkaufsartefakt, generiert)
```

## Bauen & Testen

```bash
# Single-File-Build erzeugen (dist/index.html)
node build/build.js

# Smoke-Test (Node, ohne Browser)
node test/smoke.js --frames 60
```

Balance-Änderungen: ausschließlich `src/balance.js` anfassen, dann neu bauen. Die Engine enthält keine eigenen Zahlen.

## Lizenz & Verkauf

Kommerzielles Produkt von **Bytewerk Studio**. Alle Rechte vorbehalten. Derzeit nur im Rahmen der Bytewerk-Produktseite / GitHub Pages lizenziert; Verkauf über itch.io / Code-Lizenz wird separat freigegeben. Keine externen Assets, keine Lizenzen Dritter.

---

© 2026 Bytewerk Studio — [bytewerkstudio.com](https://bytewerkstudio.com)