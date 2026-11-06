# 3D-Szenen (`scene3d.js`)

Die Three.js-Schicht der Website. Eine Datei, ein Build im Ordner `vendor/`,
keine Netzwerkabhaengigkeit. Das Markup besitzt den Platz, `scene3d.js` malt
das Bild.

## Einbinden

Jede Seite laedt die beiden Zeilen in genau dieser Reihenfolge:

```html
<link rel="stylesheet" href="styles-3d.css">
...
<script src="scene3d.js"></script>
```

Eine Szene entsteht durch ein Attribut auf dem Platzhalter:

```html
<div class="hero-scene" data-scene3d="stratum" aria-hidden="true"></div>
<div class="page-head-bg" data-scene3d="contour" aria-hidden="true"></div>
```

| Typ | Wo | Was |
|---|---|---|
| `stratum` | `index.html`, Hero | Sieben Papierplatten auf einer Achse, zwei Haarlinien, Bodenring |
| `contour` | `shop`, `studio`, `vergleich`, `softwareentwicklung-ludwigs­hafen` | Draht-Hoehenfeld mit Wellen aus einem kleinen Shader |

Weitere Attribute:

- `data-scene3d-mobile="off"` — unter 720 px nicht laden (spart Akku).

## Verhalten

- **Laden:** `import()` erst, wenn der Platzhalter bis auf 320 px an den
  Viewport heranreicht. Bis dahin bleibt das CSS-Bild stehen.
- **Ohne WebGL oder ohne `vendor/`:** `html.no-scene3d`, der Platzhalter wird
  ausgeblendet, das CSS-Design bleibt vollstaendig. Keine Fehlermeldung im
  sichtbaren Bereich.
- **Bewegung:** `prefers-reduced-motion` startet pausiert (ein statisches
  Bild). Der Schalter unten links merkt sich die Wahl in `localStorage`
  (`bw-motion`). Er meldet seinen Zustand ueber `aria-pressed`.
- **Budget:** DPR hoechstens 2 (mobil 1,5), hoechstens 2,6 Mio. Pixel, Pause
  in Hintergrund-Tabs und ausserhalb des Viewports. Bleiben Frames ueber
  laengere Zeit langsam, wird einmalig auf DPR 1 heruntergeschaltet.

## API

`window.bwScene3D` — fuer andere Schichten und fuer Tests:

```js
bwScene3D.count();      // Anzahl laufender Szenen
bwScene3D.isMotion();   // true = Animation laeuft
bwScene3D.setMotion(false);  // pausieren (merkt sich die Wahl)
bwScene3D.refresh();    // neu vermessen, z. B. nach Layoutwechsel
```

## Eine Szene ergaenzen

1. In `scene3d.js` eine Fabrik schreiben, die `{ scene, camera, resize, update }`
   zurueckgibt (`update(t, dt, pointer)`).
2. In `SCENES` registrieren: `var SCENES = { stratum: makeStratum, contour: makeContour, neu: makeNeu };`
3. Palette aus `PALETTE` benutzen, nicht neu erfinden: Papier `#faf9f5`,
   Terrakotta `#b04f31`, Salbei `#4f7a63`, Tusche `#1f1e1d`.
4. Pruefen: 0 Konsolenfehler, kein horizontaler Ueberlauf bei 1440 px und
   390 px, Szene pausiert bei `prefers-reduced-motion`.

## Pruefen

```powershell
node --check scene3d.js
python -m http.server 4173   # im Repo-Root
```

Im Browser: DevTools-Konsole leer, `bwScene3D.count()` groesser 0, Schalter
unten links wechselt zwischen Pause und Lauf.
