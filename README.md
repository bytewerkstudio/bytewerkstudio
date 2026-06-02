# Bytewerk Studio Shop

Live: https://bytewerkstudio.com

Ein minimalistischer, modularer Software-Shop fuer Bytewerk Studio und externe Seller. Die App laeuft auf GitHub Pages als sichere Frontend-Version mit lokalen Demo-Accounts, Seller-Publishing, Community, Forum, Warenkorb, Checkout-Simulation, Einstellungen und Security Center.

## Struktur

- src/core: Routing, Store, Sicherheit, UI-Hilfen
- src/features/auth: Login, Registrierung, Session
- src/features/marketplace: Shop, Suche, Produktkarten
- src/features/cart: Warenkorb und Checkout-Simulation
- src/features/seller: Seller-Portal und Produktveroeffentlichung
- src/features/forum: Community und Diskussionen
- src/features/settings: Theme, Privacy, Konto-Einstellungen
- src/features/security: Security Center und Client-Hardening
- src/features/motion: dynamische Linien im Hintergrund

## Entwicklung

- `npm run build`: Seite aus dem Generator neu erzeugen und Browser-Bundle bauen
- `npm run serve`: lokale Vorschau unter http://127.0.0.1:4173 starten

## Hinweis

Auf GitHub Pages gibt es kein echtes Backend. Diese Version ist lokal im Browser voll nutzbar und fuer spaetere Backend-Anbindung vorbereitet. Echte Zahlungen, echte Nutzerkonten, serverseitige Moderation und vollstaendige Hack-Resistenz brauchen spaeter einen Server oder eine Backend-Plattform.
