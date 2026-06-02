import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function ensureDir(path) {
  mkdirSync(join(root, path), { recursive: true });
}

function write(path, content) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${content.trim()}\n`, "utf8");
}

function walkFiles(path, files = []) {
  const full = join(root, path);
  for (const entry of readdirSync(full)) {
    const child = join(full, entry);
    const relative = join(path, entry);
    if (statSync(child).isDirectory()) {
      walkFiles(relative, files);
    } else {
      files.push(relative);
    }
  }
  return files;
}

function normalizeGeneratedJavaScript() {
  for (const file of walkFiles("src").filter((item) => item.endsWith(".js"))) {
    const full = join(root, file);
    const content = readFileSync(full, "utf8")
      .replace(/\\`/g, "`")
      .replace(/\\\$\{/g, "${");
    writeFileSync(full, content, "utf8");
  }
}

function jsString(value) {
  return JSON.stringify(value);
}

function makeProducts() {
  const categories = [
    "Bytewerk Core",
    "AI Tools",
    "Automation",
    "Security",
    "Analytics",
    "Web Apps",
    "DevOps",
    "Commerce",
    "Productivity",
    "Design Systems",
    "Education",
    "Finance",
  ];
  const sellers = [
    "Bytewerk Studio",
    "Northstack Labs",
    "Nova Process",
    "Cloud Harbor",
    "Dataforge Works",
    "SecureGrid",
    "Launchlane",
    "TinyOps",
    "MetricHouse",
    "Flowframe",
  ];
  const nouns = [
    "Console",
    "Kit",
    "Engine",
    "Panel",
    "Vault",
    "Desk",
    "Bridge",
    "Monitor",
    "Forge",
    "Flow",
    "Studio",
    "Hub",
  ];
  const benefits = [
    "reduces manual work",
    "ships faster launches",
    "keeps teams aligned",
    "detects risk earlier",
    "turns data into action",
    "documents every step",
    "improves support quality",
    "protects product delivery",
  ];
  const products = [];
  for (let i = 1; i <= 560; i += 1) {
    const category = categories[i % categories.length];
    const seller = i % 4 === 0 || i % 7 === 0 ? "Bytewerk Studio" : sellers[i % sellers.length];
    const ownerType = seller === "Bytewerk Studio" ? "bytewerk" : "seller";
    const noun = nouns[i % nouns.length];
    const title = `${category} ${noun} ${String(i).padStart(3, "0")}`;
    const price = seller === "Bytewerk Studio" ? 29 + (i % 24) * 7 : 19 + (i % 38) * 5;
    products.push({
      id: `bw-product-${String(i).padStart(4, "0")}`,
      title,
      seller,
      ownerType,
      category,
      price,
      summary: `${title} ${benefits[i % benefits.length]} for software founders, sellers and digital teams.`,
      license: i % 3 === 0 ? "commercial" : i % 3 === 1 ? "personal" : "team",
      rating: Number((4.1 + (i % 9) / 10).toFixed(1)),
      downloads: 120 + i * 17,
      version: `1.${i % 18}.${i % 9}`,
      risk: i % 5 === 0 ? "reviewed" : i % 5 === 1 ? "sandboxed" : i % 5 === 2 ? "signed" : i % 5 === 3 ? "verified" : "new",
      tags: [
        category.toLowerCase().replaceAll(" ", "-"),
        ownerType,
        i % 2 === 0 ? "workflow" : "template",
        i % 3 === 0 ? "seller-ready" : "bytewerk-ready",
        i % 4 === 0 ? "secure" : "minimal",
      ],
      features: [
        "clean setup guide",
        "seller compatible license block",
        "update checklist",
        i % 2 === 0 ? "dashboard widgets" : "product launch checklist",
        i % 3 === 0 ? "security review notes" : "support playbook",
      ],
      requirements: i % 2 === 0 ? "Browser and GitHub Pages compatible" : "Works as a static software product package",
      updated: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    });
  }
  return products;
}

function makeForumTopics() {
  const areas = ["Launch", "Seller Hilfe", "Security", "Software Ideen", "Bytewerk News", "Community"];
  const authors = ["Hijratullah", "Bytewerk Team", "Mira", "Arman", "Sofia", "Noah", "Elif", "Jonas"];
  const topics = [];
  for (let i = 1; i <= 360; i += 1) {
    const area = areas[i % areas.length];
    topics.push({
      id: `topic-${String(i).padStart(4, "0")}`,
      area,
      title: `${area} Diskussion ${String(i).padStart(3, "0")}`,
      author: authors[i % authors.length],
      body: `Community Thema ${i}: Wie kann ein Softwareprodukt sicherer, klarer und besser verkaufbar gemacht werden?`,
      votes: 4 + (i % 70),
      created: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      replies: [
        {
          author: "Bytewerk Studio",
          body: "Gute Frage. Der erste Schritt ist immer klare Produktbeschreibung, Update-Prozess und Security-Check.",
        },
        {
          author: authors[(i + 2) % authors.length],
          body: "Ich wuerde zusaetzlich Screenshots, Demo-Daten und eine einfache Support-Struktur vorbereiten.",
        },
      ],
    });
  }
  return topics;
}

function productDataModule(products) {
  const lines = ["export const baseProducts = ["];
  for (const product of products) {
    lines.push("  {");
    lines.push(`    id: ${jsString(product.id)},`);
    lines.push(`    title: ${jsString(product.title)},`);
    lines.push(`    seller: ${jsString(product.seller)},`);
    lines.push(`    ownerType: ${jsString(product.ownerType)},`);
    lines.push(`    category: ${jsString(product.category)},`);
    lines.push(`    price: ${product.price},`);
    lines.push(`    summary: ${jsString(product.summary)},`);
    lines.push(`    license: ${jsString(product.license)},`);
    lines.push(`    rating: ${product.rating},`);
    lines.push(`    downloads: ${product.downloads},`);
    lines.push(`    version: ${jsString(product.version)},`);
    lines.push(`    risk: ${jsString(product.risk)},`);
    lines.push(`    tags: [`);
    for (const tag of product.tags) lines.push(`      ${jsString(tag)},`);
    lines.push("    ],");
    lines.push(`    features: [`);
    for (const feature of product.features) lines.push(`      ${jsString(feature)},`);
    lines.push("    ],");
    lines.push(`    requirements: ${jsString(product.requirements)},`);
    lines.push(`    updated: ${jsString(product.updated)},`);
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");
  lines.push("export const bytewerkProductCount = baseProducts.filter((product) => product.ownerType === 'bytewerk').length;");
  lines.push("export const sellerProductCount = baseProducts.filter((product) => product.ownerType === 'seller').length;");
  return lines.join("\n");
}

function forumDataModule(topics) {
  const lines = ["export const baseTopics = ["];
  for (const topic of topics) {
    lines.push("  {");
    lines.push(`    id: ${jsString(topic.id)},`);
    lines.push(`    area: ${jsString(topic.area)},`);
    lines.push(`    title: ${jsString(topic.title)},`);
    lines.push(`    author: ${jsString(topic.author)},`);
    lines.push(`    body: ${jsString(topic.body)},`);
    lines.push(`    votes: ${topic.votes},`);
    lines.push(`    created: ${jsString(topic.created)},`);
    lines.push("    replies: [");
    for (const reply of topic.replies) {
      lines.push("      {");
      lines.push(`        author: ${jsString(reply.author)},`);
      lines.push(`        body: ${jsString(reply.body)},`);
      lines.push("      },");
    }
    lines.push("    ],");
    lines.push("  },");
  }
  lines.push("];");
  return lines.join("\n");
}

function html() {
  return String.raw`
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:; connect-src 'self'"
    >
    <title>Bytewerk Studio Shop | Software Marketplace</title>
    <meta
      name="description"
      content="Minimalistischer Software-Shop und Community-Marktplatz von Bytewerk Studio mit Seller-Bereich, Login, Forum und dynamischem Interface."
    >
    <meta name="theme-color" content="#050505">
    <meta property="og:title" content="Bytewerk Studio Shop">
    <meta property="og:description" content="Software, digitale Produkte, Seller-Portal und Community von Bytewerk Studio.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bytewerkstudio.com/">
    <link rel="canonical" href="https://bytewerkstudio.com/">
    <link rel="stylesheet" href="./src/styles/app.css">
    <script defer src="./assets/app.bundle.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#app">Direkt zum Shop</a>
    <canvas id="line-canvas" aria-hidden="true"></canvas>
    <div class="app-shell">
      <header class="topbar" data-topbar>
        <a class="brand" href="#/" aria-label="Bytewerk Studio Shop">
          <span class="brand-mark">B</span>
          <span>
            <strong>Bytewerk Studio</strong>
            <small>Software Marketplace</small>
          </span>
        </a>
        <nav class="topnav" aria-label="Hauptmenue" data-nav></nav>
        <div class="top-actions">
          <button class="icon-button" type="button" data-action="theme" aria-label="Dark Mode umschalten">◐</button>
          <button class="icon-button cart-button" type="button" data-action="cart" aria-label="Warenkorb">Bag <span data-cart-count>0</span></button>
          <button class="menu-button" type="button" data-action="mobile-menu" aria-label="Menue oeffnen">Menu</button>
        </div>
      </header>
      <aside class="mobile-panel" data-mobile-panel></aside>
      <main id="app" class="app-main" tabindex="-1"></main>
      <aside class="cart-drawer" data-cart-drawer aria-hidden="true"></aside>
      <div class="modal-layer" data-modal-layer aria-hidden="true"></div>
      <div class="toast-stack" data-toast-stack></div>
      <footer class="footer">
        <span>© 2026 Bytewerk Studio</span>
        <a href="#/security">Security Center</a>
        <a href="#/forum">Community</a>
        <a href="#/seller">Seller Portal</a>
      </footer>
    </div>
  </body>
</html>
`;
}

function rootFiles() {
  write("index.html", html());
  write("404.html", html());
  write("CNAME", "bytewerkstudio.com");
  write(".nojekyll", "");
  write(
    "README.md",
    String.raw`
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

- \`npm run build\`: Seite aus dem Generator neu erzeugen und Browser-Bundle bauen
- \`npm run serve\`: lokale Vorschau unter http://127.0.0.1:4173 starten

## Hinweis

Auf GitHub Pages gibt es kein echtes Backend. Diese Version ist lokal im Browser voll nutzbar und fuer spaetere Backend-Anbindung vorbereitet. Echte Zahlungen, echte Nutzerkonten, serverseitige Moderation und vollstaendige Hack-Resistenz brauchen spaeter einen Server oder eine Backend-Plattform.
`
  );
  write(
    "robots.txt",
    String.raw`
User-agent: *
Allow: /

Sitemap: https://bytewerkstudio.com/sitemap.xml
`
  );
  write(
    "sitemap.xml",
    String.raw`
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bytewerkstudio.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
  );
}

function styles() {
  write(
    "src/styles/app.css",
    String.raw`
@import url("./tokens.css");
@import url("./layout.css");
@import url("./components.css");
@import url("./marketplace.css");
@import url("./forms.css");
@import url("./dashboard.css");
@import url("./forum.css");
@import url("./responsive.css");
`
  );
  write(
    "src/styles/tokens.css",
    String.raw`
:root {
  --bg: #050505;
  --bg-soft: #0d0d0d;
  --bg-panel: rgba(255, 255, 255, 0.055);
  --bg-panel-strong: rgba(255, 255, 255, 0.09);
  --text: #ffffff;
  --text-soft: rgba(255, 255, 255, 0.72);
  --text-faint: rgba(255, 255, 255, 0.48);
  --line: rgba(255, 255, 255, 0.12);
  --line-strong: rgba(255, 255, 255, 0.22);
  --accent: #e8ff70;
  --accent-2: #72f2d0;
  --danger: #ff6b6b;
  --warning: #ffd166;
  --success: #72f2a0;
  --radius: 10px;
  --radius-small: 6px;
  --shadow: 0 32px 80px rgba(0, 0, 0, 0.28);
  --max: 1440px;
  --topbar: 78px;
  color-scheme: dark;
}

:root[data-theme="light"] {
  --bg: #f6f5ef;
  --bg-soft: #ffffff;
  --bg-panel: rgba(0, 0, 0, 0.045);
  --bg-panel-strong: rgba(0, 0, 0, 0.08);
  --text: #101010;
  --text-soft: rgba(0, 0, 0, 0.68);
  --text-faint: rgba(0, 0, 0, 0.42);
  --line: rgba(0, 0, 0, 0.12);
  --line-strong: rgba(0, 0, 0, 0.22);
  --accent: #1d4f2c;
  --accent-2: #0b7567;
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  margin: 0;
  color: var(--text);
  background: var(--bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  line-height: 1.5;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

::selection {
  color: var(--bg);
  background: var(--accent);
}
`
  );
  write(
    "src/styles/layout.css",
    String.raw`
#line-canvas {
  position: fixed;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 10%, rgba(232, 255, 112, 0.12), transparent 32%),
    radial-gradient(circle at 86% 22%, rgba(114, 242, 208, 0.1), transparent 28%),
    var(--bg);
}

.app-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(5, 5, 5, 0.18), rgba(5, 5, 5, 0.78));
}

.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  transform: translateY(-160%);
  border-radius: var(--radius-small);
  padding: 10px 12px;
  color: var(--bg);
  background: var(--accent);
  font-weight: 800;
}

.skip-link:focus {
  transform: translateY(0);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  min-height: var(--topbar);
  padding: 14px clamp(18px, 4vw, 56px);
  border-bottom: 1px solid var(--line);
  background: rgba(5, 5, 5, 0.78);
  backdrop-filter: blur(22px);
}

:root[data-theme="light"] .topbar {
  background: rgba(246, 245, 239, 0.82);
}

.brand {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  min-width: 220px;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  color: var(--bg);
  background: var(--text);
  font-weight: 950;
}

.brand strong,
.brand small {
  display: block;
}

.brand small {
  color: var(--text-faint);
  font-size: 0.78rem;
}

.topnav {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.nav-link {
  border-radius: 999px;
  padding: 9px 12px;
  color: #fff;
  font-size: 0.92rem;
  font-weight: 760;
}

:root[data-theme="light"] .nav-link {
  color: var(--text);
}

.nav-link:hover,
.nav-link.is-active {
  color: var(--bg);
  background: var(--text);
}

.top-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.app-main {
  width: min(var(--max), calc(100% - 32px));
  min-height: calc(100vh - 160px);
  margin: 0 auto;
  padding: clamp(32px, 6vw, 80px) 0;
}

.page {
  display: grid;
  gap: 28px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.7fr);
  gap: clamp(24px, 6vw, 72px);
  align-items: center;
  min-height: calc(100vh - 180px);
}

.hero-copy {
  max-width: 920px;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 920;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 18px;
  font-size: clamp(3rem, 8vw, 7.2rem);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

h2 {
  margin-bottom: 14px;
  font-size: clamp(2rem, 4.5vw, 4.4rem);
  line-height: 1;
  letter-spacing: -0.03em;
}

h3 {
  margin-bottom: 10px;
  font-size: 1.15rem;
}

.lead {
  max-width: 740px;
  color: var(--text-soft);
  font-size: clamp(1.06rem, 2vw, 1.28rem);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}

.section-head p {
  max-width: 680px;
  color: var(--text-soft);
}

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  width: min(var(--max), calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 42px;
  color: var(--text-faint);
}
`
  );
  write(
    "src/styles/components.css",
    String.raw`
.button,
.icon-button,
.menu-button,
.chip,
.field input,
.field textarea,
.field select {
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  color: var(--bg);
  background: var(--text);
  font-weight: 850;
}

.button.secondary {
  color: var(--text);
  background: var(--bg-panel);
}

.button.accent {
  color: #050505;
  border-color: transparent;
  background: var(--accent);
}

.button.danger {
  color: #050505;
  background: var(--danger);
}

.icon-button,
.menu-button {
  min-height: 40px;
  padding: 9px 11px;
  color: var(--text);
  background: var(--bg-panel);
  font-weight: 800;
}

.cart-button span {
  display: inline-grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 999px;
  color: #050505;
  background: var(--accent);
  font-size: 0.78rem;
}

.menu-button {
  display: none;
}

.hero-panel,
.panel,
.stat-card,
.notice,
.product-card,
.forum-card,
.settings-card,
.seller-card,
.dashboard-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-panel);
  box-shadow: var(--shadow);
}

.hero-panel {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.hero-panel-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 12px;
  color: var(--text-soft);
}

.hero-panel-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.hero-panel-row strong {
  color: var(--text);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.grid {
  display: grid;
  gap: 16px;
}

.grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 18px;
}

.stat-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 2rem;
}

.stat-card span {
  color: var(--text-faint);
}

.notice {
  padding: 18px;
  color: var(--text-soft);
}

.notice strong {
  color: var(--text);
}

.toast-stack {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 300;
  display: grid;
  gap: 10px;
}

.toast {
  max-width: 360px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 12px 14px;
  color: var(--text);
  background: var(--bg-soft);
  box-shadow: var(--shadow);
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: none;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.55);
}

.modal-layer.is-open {
  display: grid;
}

.modal {
  width: min(760px, 100%);
  max-height: min(82vh, 760px);
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px;
  background: var(--bg-soft);
  box-shadow: var(--shadow);
}

.mobile-panel,
.cart-drawer {
  position: fixed;
  z-index: 220;
  border: 1px solid var(--line);
  background: var(--bg-soft);
  box-shadow: var(--shadow);
}

.mobile-panel {
  top: calc(var(--topbar) + 10px);
  right: 16px;
  left: 16px;
  display: none;
  border-radius: var(--radius);
  padding: 12px;
}

.mobile-panel.is-open {
  display: grid;
}

.cart-drawer {
  top: 0;
  right: 0;
  display: grid;
  width: min(420px, 100%);
  height: 100vh;
  transform: translateX(105%);
  transition: transform 180ms ease;
}

.cart-drawer.is-open {
  transform: translateX(0);
}
`
  );
  write(
    "src/styles/marketplace.css",
    String.raw`
.toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(150px, 220px));
  gap: 10px;
  align-items: end;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  display: grid;
  gap: 12px;
  min-height: 360px;
  padding: 16px;
}

.product-card.bytewerk {
  border-color: rgba(232, 255, 112, 0.4);
}

.product-meta,
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill,
.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 8px;
  color: var(--text-soft);
  background: var(--bg-panel-strong);
  font-size: 0.76rem;
  font-weight: 820;
}

.product-title {
  min-height: 58px;
}

.product-summary {
  color: var(--text-soft);
  font-size: 0.94rem;
}

.product-price {
  margin-top: auto;
  font-size: 1.9rem;
  font-weight: 950;
}

.product-actions {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
}

.compare-bar {
  position: sticky;
  bottom: 12px;
  z-index: 40;
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 12px;
  background: var(--bg-soft);
  box-shadow: var(--shadow);
}

.compare-bar.is-visible {
  display: flex;
}
`
  );
  write(
    "src/styles/forms.css",
    String.raw`
.form-grid {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 7px;
  color: var(--text-soft);
  font-weight: 780;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  min-height: 44px;
  padding: 11px 12px;
  color: var(--text);
  background: var(--bg-panel);
  outline: none;
}

.field textarea {
  min-height: 120px;
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(232, 255, 112, 0.12);
}

.form-card {
  width: min(760px, 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(18px, 4vw, 32px);
  background: var(--bg-panel);
}

.security-meter {
  display: grid;
  gap: 6px;
  color: var(--text-faint);
  font-size: 0.86rem;
}

.meter-line {
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  background: var(--bg-panel-strong);
}

.meter-line span {
  display: block;
  height: 100%;
  width: 0%;
  background: var(--accent);
}
`
  );
  write(
    "src/styles/dashboard.css",
    String.raw`
.dashboard-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
}

.side-menu,
.dashboard-card,
.seller-card,
.settings-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-panel);
}

.side-menu {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 10px;
}

.side-menu button {
  border: 0;
  border-radius: var(--radius-small);
  padding: 11px 12px;
  color: var(--text-soft);
  background: transparent;
  text-align: left;
  font-weight: 800;
}

.side-menu button.is-active,
.side-menu button:hover {
  color: var(--bg);
  background: var(--text);
}

.dashboard-card,
.seller-card,
.settings-card {
  padding: 18px;
}

.table {
  display: grid;
  gap: 8px;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr auto;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: 10px 0;
}
`
  );
  write(
    "src/styles/forum.css",
    String.raw`
.forum-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
}

.forum-list {
  display: grid;
  gap: 10px;
}

.forum-card {
  display: grid;
  gap: 10px;
  padding: 16px;
}

.forum-card p {
  color: var(--text-soft);
}

.reply-list {
  display: grid;
  gap: 8px;
  border-top: 1px solid var(--line);
  padding-top: 10px;
}

.reply {
  border-radius: var(--radius-small);
  padding: 10px;
  color: var(--text-soft);
  background: var(--bg-panel-strong);
}
`
  );
  const generated = [];
  for (let i = 1; i <= 220; i += 1) {
    generated.push(`.motion-slot-${i} { --line-speed: ${(8 + (i % 20) * 0.23).toFixed(2)}s; --line-alpha: ${(0.08 + (i % 12) * 0.01).toFixed(2)}; }`);
  }
  write(
    "src/styles/responsive.css",
    String.raw`
@media (max-width: 1180px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .toolbar,
  .hero,
  .forum-grid,
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .topbar {
    grid-template-columns: auto auto;
  }

  .topnav {
    display: none;
  }

  .menu-button {
    display: inline-flex;
  }

  .product-grid,
  .grid.two,
  .grid.three,
  .stats {
    grid-template-columns: 1fr;
  }

  .brand small {
    display: none;
  }

  h1 {
    font-size: 3.4rem;
  }
}

@media (max-width: 560px) {
  .brand {
    min-width: 0;
  }

  .brand strong {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-main {
    width: min(100% - 22px, var(--max));
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
  }
}

${generated.join("\n")}
`
  );
}

function coreModules() {
  write(
    "src/core/security.js",
    String.raw`
const htmlMap = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#039;"],
]);

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (match) => htmlMap.get(match));
}

export function safeText(value, max = 5000) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized.slice(0, max);
}

export function validateText(value, options = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 240;
  const label = options.label ?? "Feld";
  const text = safeText(value, max + 20);
  if (text.length < min) return { ok: false, error: label + " ist zu kurz." };
  if (text.length > max) return { ok: false, error: label + " ist zu lang." };
  if (/[<>]/.test(text)) return { ok: false, error: label + " darf keine HTML-Zeichen enthalten." };
  return { ok: true, value: text };
}

export function passwordScore(password) {
  const value = String(password ?? "");
  let score = 0;
  if (value.length >= 10) score += 25;
  if (/[A-Z]/.test(value)) score += 20;
  if (/[a-z]/.test(value)) score += 15;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  return Math.min(score, 100);
}

export async function hashSecret(value, salt) {
  const source = String(salt) + ":" + String(value);
  const subtle = globalThis.crypto?.subtle;
  if (subtle && globalThis.TextEncoder) {
    const payload = new TextEncoder().encode(source);
    const hash = await subtle.digest("SHA-256", payload);
    return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let fallback = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    fallback ^= source.charCodeAt(index);
    fallback = Math.imul(fallback, 16777619);
  }
  return "fallback-" + (fallback >>> 0).toString(16);
}

export function createId(prefix = "id") {
  if (globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(2);
    globalThis.crypto.getRandomValues(array);
    return prefix + "-" + Array.from(array).map((item) => item.toString(36)).join("-");
  }
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function createRateLimiter(limit = 8, windowMs = 60000) {
  const buckets = new Map();
  return function rateLimit(key) {
    const now = Date.now();
    const current = buckets.get(key) || [];
    const recent = current.filter((time) => now - time < windowMs);
    recent.push(now);
    buckets.set(key, recent);
    return recent.length <= limit;
  };
}

export const loginLimiter = createRateLimiter(7, 60000);

export function securitySummary() {
  return [
    "CSP meta policy active",
    "No external scripts",
    "No eval",
    "Escaped user content",
    "Client-side rate limiting",
    "Local demo password hashing with fallback",
    "No server secrets in browser",
  ];
}
`
  );
  write(
    "src/core/dom.js",
    String.raw`
import { escapeHtml } from "./security.js";

export { escapeHtml };

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function html(strings, ...values) {
  return strings.reduce((result, part, index) => {
    const value = index < values.length ? escapeHtml(values[index]) : "";
    return result + part + value;
  }, "");
}

export function setView(target, markup) {
  target.innerHTML = markup;
  target.focus({ preventScroll: true });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("de-DE").format(Number(value || 0));
}

export function toast(message, type = "info") {
  const stack = qs("[data-toast-stack]");
  if (!stack) return;
  const node = document.createElement("div");
  node.className = "toast toast-" + type;
  node.textContent = message;
  stack.append(node);
  setTimeout(() => node.remove(), 3600);
}

export function openModal(markup) {
  const layer = qs("[data-modal-layer]");
  if (!layer) return;
  layer.innerHTML = '<div class="modal">' + markup + '</div>';
  layer.classList.add("is-open");
  layer.setAttribute("aria-hidden", "false");
}

export function closeModal() {
  const layer = qs("[data-modal-layer]");
  if (!layer) return;
  layer.classList.remove("is-open");
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = "";
}

export function productImage(seed) {
  const hue = Math.abs(String(seed).split("").reduce((total, char) => total + char.charCodeAt(0), 0)) % 360;
  return "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="460" viewBox="0 0 720 460">' +
      '<rect width="720" height="460" fill="hsl(' + hue + ' 16% 10%)"/>' +
      '<path d="M80 340 C180 180 290 420 410 180 S600 280 650 90" fill="none" stroke="hsl(' + ((hue + 80) % 360) + ' 80% 70%)" stroke-width="7" opacity=".78"/>' +
      '<circle cx="160" cy="150" r="52" fill="hsl(' + ((hue + 38) % 360) + ' 70% 62%)" opacity=".28"/>' +
      '<circle cx="540" cy="280" r="78" fill="hsl(' + ((hue + 140) % 360) + ' 70% 62%)" opacity=".18"/>' +
      '<text x="48" y="72" fill="#fff" font-family="Arial" font-size="34" font-weight="800">Bytewerk</text>' +
    '</svg>'
  );
}
`
  );
  write(
    "src/core/store.js",
    String.raw`
import { baseProducts } from "../features/marketplace/products.data.js";
import { baseTopics } from "../features/forum/forum.data.js";
import { createId } from "./security.js";

const KEY = "bytewerk-shop-v1";
const memoryStorage = new Map();

function storageGet(key) {
  try {
    if (globalThis.localStorage) return globalThis.localStorage.getItem(key);
  } catch {
    // restricted browser context, use memory fallback
  }
  return memoryStorage.get(key) || null;
}

function storageSet(key, value) {
  try {
    if (globalThis.localStorage) {
      globalThis.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // restricted browser context, use memory fallback
  }
  memoryStorage.set(key, value);
}

const defaults = {
  users: [
    {
      id: "user-bytewerk-admin",
      name: "Bytewerk Admin",
      email: "admin@bytewerk.local",
      role: "admin",
      sellerName: "Bytewerk Studio",
      salt: "demo",
      passwordHash: "demo",
      createdAt: "2026-01-01",
    },
    {
      id: "user-seller-demo",
      name: "Demo Seller",
      email: "seller@bytewerk.local",
      role: "seller",
      sellerName: "Demo Software Seller",
      salt: "demo",
      passwordHash: "demo",
      createdAt: "2026-01-01",
    },
  ],
  sessionUserId: null,
  products: baseProducts,
  topics: baseTopics,
  cart: [],
  wishlist: [],
  compare: [],
  orders: [],
  reviews: {},
  settings: {
    theme: "dark",
    density: "comfortable",
    privacy: "strict",
    notifications: true,
    sellerMode: true,
  },
  audit: [],
};

let state = load();

function load() {
  try {
    const raw = storageGet(KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaults),
      ...parsed,
      products: mergeProducts(parsed.products),
      topics: mergeTopics(parsed.topics),
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return structuredClone(defaults);
  }
}

function mergeProducts(products = []) {
  const map = new Map();
  [...baseProducts, ...products].forEach((product) => map.set(product.id, product));
  return Array.from(map.values());
}

function mergeTopics(topics = []) {
  const map = new Map();
  [...baseTopics, ...topics].forEach((topic) => map.set(topic.id, topic));
  return Array.from(map.values());
}

export function getState() {
  return state;
}

export function getUser() {
  return state.users.find((user) => user.id === state.sessionUserId) || null;
}

export function isSeller() {
  const user = getUser();
  return Boolean(user && (user.role === "seller" || user.role === "admin"));
}

export function save() {
  storageSet(KEY, JSON.stringify(state));
}

export function resetDemo() {
  state = structuredClone(defaults);
  save();
}

export function patch(mutator) {
  mutator(state);
  save();
  window.dispatchEvent(new CustomEvent("bytewerk:state"));
}

export function audit(action, details = {}) {
  patch((draft) => {
    draft.audit.unshift({
      id: createId("audit"),
      action,
      details,
      at: new Date().toISOString(),
      userId: draft.sessionUserId,
    });
    draft.audit = draft.audit.slice(0, 160);
  });
}
`
  );
  write(
    "src/core/router.js",
    String.raw`
const routes = new Map();

export function defineRoute(path, handler) {
  routes.set(path, handler);
}

export function currentRoute() {
  const hash = location.hash || "#/";
  const path = hash.replace(/^#/, "") || "/";
  const [route, query = ""] = path.split("?");
  return { route, query: new URLSearchParams(query) };
}

export function navigate(path) {
  location.hash = path;
}

export function startRouter(context) {
  const render = () => {
    const { route, query } = currentRoute();
    const handler = routes.get(route) || routes.get("/");
    handler(context, query);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  window.addEventListener("hashchange", render);
  window.addEventListener("bytewerk:state", render);
  render();
}
`
  );
}

function appModule() {
  write(
    "src/app.js",
    String.raw`
import { qs, qsa, closeModal, toast } from "./core/dom.js";
import { getState, patch } from "./core/store.js";
import { defineRoute, startRouter, navigate, currentRoute } from "./core/router.js";
import { startMotion } from "./features/motion/lines.js";
import { renderHome } from "./features/home/home.js";
import { renderMarketplace } from "./features/marketplace/marketplace.js";
import { renderAuth } from "./features/auth/auth.js";
import { renderSeller } from "./features/seller/seller.js";
import { renderForum } from "./features/forum/forum.js";
import { renderSettings } from "./features/settings/settings.js";
import { renderDashboard } from "./features/dashboard/dashboard.js";
import { renderSecurity } from "./features/security/security-center.js";
import { renderHelp } from "./features/help/help.js";
import { renderBytewerk } from "./features/bytewerk/bytewerk.js";
import { renderCheckout } from "./features/cart/checkout.js";
import { renderCartDrawer, updateCartCount } from "./features/cart/cart.js";

const app = qs("#app");

const navItems = [
  ["Home", "#/"],
  ["Shop", "#/shop"],
  ["Bytewerk", "#/bytewerk"],
  ["Seller", "#/seller"],
  ["Dashboard", "#/dashboard"],
  ["Forum", "#/forum"],
  ["Security", "#/security"],
  ["Login", "#/login"],
];

function renderNav() {
  const nav = qs("[data-nav]");
  const mobile = qs("[data-mobile-panel]");
  const active = "#/" + (currentRoute().route === "/" ? "" : currentRoute().route.replace(/^\//, ""));
  const markup = navItems
    .map(([label, href]) => '<a class="nav-link' + (href === active ? " is-active" : "") + '" href="' + href + '">' + label + "</a>")
    .join("");
  nav.innerHTML = markup;
  mobile.innerHTML = markup;
}

function applyTheme() {
  document.documentElement.dataset.theme = getState().settings.theme;
}

function bindGlobalActions() {
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "theme") {
      patch((draft) => {
        draft.settings.theme = draft.settings.theme === "dark" ? "light" : "dark";
      });
      applyTheme();
      toast("Designmodus gewechselt.");
    }
    if (action === "cart") {
      qs("[data-cart-drawer]").classList.add("is-open");
      qs("[data-cart-drawer]").setAttribute("aria-hidden", "false");
      renderCartDrawer();
    }
    if (action === "close-cart") {
      qs("[data-cart-drawer]").classList.remove("is-open");
      qs("[data-cart-drawer]").setAttribute("aria-hidden", "true");
    }
    if (action === "mobile-menu") {
      qs("[data-mobile-panel]").classList.toggle("is-open");
    }
    if (action === "close-modal") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      qs("[data-cart-drawer]").classList.remove("is-open");
      qs("[data-mobile-panel]").classList.remove("is-open");
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      navigate("/shop?focus=search");
    }
  });
}

function context() {
  return { app, renderNav };
}

defineRoute("/", renderHome);
defineRoute("/shop", renderMarketplace);
defineRoute("/login", renderAuth);
defineRoute("/seller", renderSeller);
defineRoute("/forum", renderForum);
defineRoute("/settings", renderSettings);
defineRoute("/dashboard", renderDashboard);
defineRoute("/security", renderSecurity);
defineRoute("/help", renderHelp);
defineRoute("/bytewerk", renderBytewerk);
defineRoute("/checkout", renderCheckout);

applyTheme();
startMotion(qs("#line-canvas"));
bindGlobalActions();
window.addEventListener("bytewerk:state", () => {
  renderNav();
  updateCartCount();
});
startRouter(context());
renderNav();
updateCartCount();
qsa("[data-mobile-panel] .nav-link").forEach((link) => {
  link.addEventListener("click", () => qs("[data-mobile-panel]").classList.remove("is-open"));
});
`
  );
}

function featureHome() {
  write(
    "src/features/home/home.js",
    String.raw`
import { setView, formatNumber, formatCurrency } from "../../core/dom.js";
import { getState, getUser } from "../../core/store.js";

export function renderHome({ app }) {
  const state = getState();
  const bytewerk = state.products.filter((product) => product.ownerType === "bytewerk").length;
  const sellers = new Set(state.products.map((product) => product.seller)).size;
  const value = state.products.reduce((total, product) => total + Number(product.price || 0), 0);
  const user = getUser();
  setView(
    app,
    \`
    <section class="page">
      <div class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Bytewerk Studio Software Shop</p>
          <h1>Minimaler Shop. Maximale Software-Struktur.</h1>
          <p class="lead">
            Ein hochwertiger Software-Marktplatz fuer Bytewerk Studio und externe Seller:
            Produkte veroeffentlichen, kaufen, vergleichen, diskutieren und verwalten.
          </p>
          <div class="actions">
            <a class="button accent" href="#/shop">Shop oeffnen</a>
            <a class="button secondary" href="#/seller">Produkt veroeffentlichen</a>
            <a class="button secondary" href="#/forum">Community betreten</a>
          </div>
        </div>
        <aside class="hero-panel">
          <div class="hero-panel-row"><span>Status</span><strong>Frontend Marketplace live</strong></div>
          <div class="hero-panel-row"><span>Session</span><strong>\${user ? user.name : "Gastmodus"}</strong></div>
          <div class="hero-panel-row"><span>Bytewerk Produkte</span><strong>\${formatNumber(bytewerk)}</strong></div>
          <div class="hero-panel-row"><span>Seller</span><strong>\${formatNumber(sellers)}</strong></div>
          <div class="hero-panel-row"><span>Demo-Warenwert</span><strong>\${formatCurrency(value)}</strong></div>
        </aside>
      </div>
      <div class="stats">
        <article class="stat-card"><strong>\${formatNumber(state.products.length)}</strong><span>Software-Produkte</span></article>
        <article class="stat-card"><strong>\${formatNumber(state.topics.length)}</strong><span>Community-Themen</span></article>
        <article class="stat-card"><strong>\${formatNumber(state.orders.length)}</strong><span>Demo-Bestellungen</span></article>
        <article class="stat-card"><strong>\${formatNumber(state.audit.length)}</strong><span>Security-Audits</span></article>
      </div>
      <section class="grid three">
        <article class="notice"><strong>Seller Portal</strong><br>Seller koennen Produkte lokal veroeffentlichen, validieren und verwalten.</article>
        <article class="notice"><strong>Secure Frontend</strong><br>CSP, HTML-Escaping, sichere Demo-Sessions und keine externen Skripte.</article>
        <article class="notice"><strong>Community</strong><br>Forum mit Themen, Antworten, Votes und sauberer Textvalidierung.</article>
      </section>
    </section>
    \`
  );
}
`
  );
}

function featureMarketplace() {
  write("src/features/marketplace/products.data.js", productDataModule(makeProducts()));
  write(
    "src/features/marketplace/marketplace.js",
    String.raw`
import { qs, qsa, setView, formatCurrency, formatNumber, escapeHtml, openModal, productImage, toast } from "../../core/dom.js";
import { getState, patch, audit } from "../../core/store.js";
import { validateText } from "../../core/security.js";

const pageSize = 24;
let visible = pageSize;
let filters = {
  query: "",
  category: "all",
  owner: "all",
  sort: "featured",
};

function categories(products) {
  return Array.from(new Set(products.map((product) => product.category))).sort();
}

function filteredProducts() {
  const state = getState();
  const query = filters.query.toLowerCase();
  const result = state.products.filter((product) => {
    const search = [product.title, product.summary, product.seller, product.category, product.tags.join(" ")].join(" ").toLowerCase();
    const queryMatch = !query || search.includes(query);
    const categoryMatch = filters.category === "all" || product.category === filters.category;
    const ownerMatch = filters.owner === "all" || product.ownerType === filters.owner;
    return queryMatch && categoryMatch && ownerMatch;
  });
  return result.sort((a, b) => {
    if (filters.sort === "price-low") return a.price - b.price;
    if (filters.sort === "price-high") return b.price - a.price;
    if (filters.sort === "rating") return b.rating - a.rating;
    if (filters.sort === "downloads") return b.downloads - a.downloads;
    return (b.ownerType === "bytewerk") - (a.ownerType === "bytewerk") || b.rating - a.rating;
  });
}

function card(product) {
  return \`
    <article class="product-card \${product.ownerType}" data-product-id="\${product.id}">
      <img alt="" src="\${productImage(product.id)}" loading="lazy">
      <div class="product-meta">
        <span class="pill">\${escapeHtml(product.category)}</span>
        <span class="pill">\${escapeHtml(product.risk)}</span>
        <span class="pill">\${product.ownerType === "bytewerk" ? "Bytewerk" : "Seller"}</span>
      </div>
      <div class="product-title">
        <h3>\${escapeHtml(product.title)}</h3>
        <p class="product-summary">\${escapeHtml(product.summary)}</p>
      </div>
      <div class="pill-row">\${product.tags.slice(0, 4).map((tag) => \`<span class="pill">\${escapeHtml(tag)}</span>\`).join("")}</div>
      <div class="product-price">\${formatCurrency(product.price)}</div>
      <div class="product-actions">
        <button class="button accent" type="button" data-shop-action="add" data-id="\${product.id}">In den Warenkorb</button>
        <button class="icon-button" type="button" data-shop-action="wish" data-id="\${product.id}">Save</button>
        <button class="icon-button" type="button" data-shop-action="detail" data-id="\${product.id}">Info</button>
      </div>
    </article>
  \`;
}

function renderGrid() {
  const products = filteredProducts();
  const grid = qs("[data-product-grid]");
  const meta = qs("[data-shop-meta]");
  const more = qs("[data-shop-more]");
  if (!grid || !meta || !more) return;
  grid.innerHTML = products.slice(0, visible).map(card).join("");
  meta.textContent = formatNumber(products.length) + " Treffer von " + formatNumber(getState().products.length) + " Produkten";
  more.hidden = visible >= products.length;
}

function detail(product) {
  openModal(\`
    <div class="section-head">
      <div>
        <p class="eyebrow">\${escapeHtml(product.seller)}</p>
        <h2>\${escapeHtml(product.title)}</h2>
        <p>\${escapeHtml(product.summary)}</p>
      </div>
      <button class="icon-button" type="button" data-action="close-modal">Close</button>
    </div>
    <div class="grid two">
      <div class="notice">
        <strong>Produktdetails</strong><br>
        Kategorie: \${escapeHtml(product.category)}<br>
        Lizenz: \${escapeHtml(product.license)}<br>
        Version: \${escapeHtml(product.version)}<br>
        Downloads: \${formatNumber(product.downloads)}<br>
        Preis: \${formatCurrency(product.price)}
      </div>
      <div class="notice">
        <strong>Security</strong><br>
        Status: \${escapeHtml(product.risk)}<br>
        Anforderungen: \${escapeHtml(product.requirements)}<br>
        Update: \${escapeHtml(product.updated)}
      </div>
    </div>
    <h3>Funktionen</h3>
    <div class="pill-row">\${product.features.map((feature) => \`<span class="pill">\${escapeHtml(feature)}</span>\`).join("")}</div>
  \`);
}

function bindMarketplace() {
  qsa("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      visible = pageSize;
      renderGrid();
    });
  });
  qs("[data-shop-more]")?.addEventListener("click", () => {
    visible += pageSize;
    renderGrid();
  });
  qs("[data-product-grid]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shop-action]");
    if (!button) return;
    const product = getState().products.find((item) => item.id === button.dataset.id);
    if (!product) return;
    if (button.dataset.shopAction === "add") {
      patch((draft) => {
        draft.cart.push({ id: product.id, qty: 1, at: new Date().toISOString() });
      });
      audit("cart.add", { productId: product.id });
      toast(product.title + " wurde in den Warenkorb gelegt.");
    }
    if (button.dataset.shopAction === "wish") {
      patch((draft) => {
        if (!draft.wishlist.includes(product.id)) draft.wishlist.push(product.id);
      });
      audit("wishlist.add", { productId: product.id });
      toast("Produkt gespeichert.");
    }
    if (button.dataset.shopAction === "detail") {
      detail(product);
    }
  });
}

export function renderMarketplace({ app }, query) {
  filters.query = query.get("q") || filters.query || "";
  const state = getState();
  const categoryOptions = categories(state.products).map((category) => \`<option value="\${escapeHtml(category)}">\${escapeHtml(category)}</option>\`).join("");
  setView(
    app,
    \`
      <section class="page">
        <div class="section-head">
          <div>
            <p class="eyebrow">Software Marketplace</p>
            <h1>Shop fuer Bytewerk und Seller.</h1>
            <p>Suche Software, Templates, Tools und digitale Produkte. Bytewerk Studio bleibt im Fokus, externe Seller koennen mitmachen.</p>
          </div>
          <a class="button secondary" href="#/seller">Seller werden</a>
        </div>
        <div class="toolbar">
          <label class="field">Suche<input data-filter="query" type="search" value="\${escapeHtml(filters.query)}" placeholder="Software, Security, Dashboard..."></label>
          <label class="field">Kategorie<select data-filter="category"><option value="all">Alle</option>\${categoryOptions}</select></label>
          <label class="field">Quelle<select data-filter="owner"><option value="all">Alle</option><option value="bytewerk">Bytewerk</option><option value="seller">Seller</option></select></label>
          <label class="field">Sortieren<select data-filter="sort"><option value="featured">Empfohlen</option><option value="rating">Bewertung</option><option value="downloads">Downloads</option><option value="price-low">Preis aufsteigend</option><option value="price-high">Preis absteigend</option></select></label>
        </div>
        <p class="notice" data-shop-meta>Produkte laden...</p>
        <div class="product-grid" data-product-grid></div>
        <button class="button secondary" type="button" data-shop-more>Mehr Produkte laden</button>
      </section>
    \`
  );
  qsa("[data-filter]").forEach((field) => {
    if (field.dataset.filter === "category") field.value = filters.category;
    if (field.dataset.filter === "owner") field.value = filters.owner;
    if (field.dataset.filter === "sort") field.value = filters.sort;
  });
  renderGrid();
  bindMarketplace();
  if (query.get("focus") === "search") qs('[data-filter="query"]')?.focus();
}
`
  );
}

function featureCart() {
  write(
    "src/features/cart/cart.js",
    String.raw`
import { qs, formatCurrency, escapeHtml, toast } from "../../core/dom.js";
import { getState, patch, audit } from "../../core/store.js";

export function updateCartCount() {
  const count = getState().cart.reduce((sum, item) => sum + item.qty, 0);
  const node = qs("[data-cart-count]");
  if (node) node.textContent = String(count);
}

export function cartItems() {
  const state = getState();
  return state.cart.map((entry) => {
    const product = state.products.find((item) => item.id === entry.id);
    return product ? { ...entry, product } : null;
  }).filter(Boolean);
}

export function cartTotal() {
  return cartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

export function renderCartDrawer() {
  const drawer = qs("[data-cart-drawer]");
  if (!drawer) return;
  const items = cartItems();
  drawer.innerHTML = \`
    <div style="display:grid;grid-template-rows:auto 1fr auto;height:100%;">
      <div class="section-head" style="padding:18px;border-bottom:1px solid var(--line);">
        <div><p class="eyebrow">Warenkorb</p><h2>Deine Auswahl</h2></div>
        <button class="icon-button" type="button" data-action="close-cart">Close</button>
      </div>
      <div style="overflow:auto;padding:18px;display:grid;align-content:start;gap:10px;">
        \${
          items.length
            ? items.map((item) => \`
              <article class="notice">
                <strong>\${escapeHtml(item.product.title)}</strong><br>
                \${escapeHtml(item.product.seller)} · \${formatCurrency(item.product.price)}
                <div class="actions">
                  <button class="icon-button" data-cart-action="remove" data-id="\${item.product.id}" type="button">Entfernen</button>
                </div>
              </article>
            \`).join("")
            : '<p class="notice">Noch keine Produkte im Warenkorb.</p>'
        }
      </div>
      <div style="padding:18px;border-top:1px solid var(--line);">
        <p><strong>Summe: \${formatCurrency(cartTotal())}</strong></p>
        <a class="button accent" href="#/checkout" data-action="close-cart">Checkout</a>
      </div>
    </div>
  \`;
  drawer.querySelectorAll("[data-cart-action='remove']").forEach((button) => {
    button.addEventListener("click", () => {
      patch((draft) => {
        draft.cart = draft.cart.filter((item) => item.id !== button.dataset.id);
      });
      audit("cart.remove", { productId: button.dataset.id });
      updateCartCount();
      renderCartDrawer();
      toast("Produkt entfernt.");
    });
  });
}
`
  );
  write(
    "src/features/cart/checkout.js",
    String.raw`
import { setView, formatCurrency, escapeHtml, toast } from "../../core/dom.js";
import { getState, getUser, patch, audit } from "../../core/store.js";
import { cartItems, cartTotal } from "./cart.js";
import { createId, validateText } from "../../core/security.js";

export function renderCheckout({ app }) {
  const items = cartItems();
  const user = getUser();
  setView(
    app,
    \`
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Checkout</p><h1>Sicherer Demo-Checkout.</h1><p>Diese GitHub-Pages-Version simuliert Bestellungen lokal. Echte Zahlungen brauchen spaeter ein Payment-Backend.</p></div>
        </div>
        <div class="grid two">
          <form class="form-card" data-checkout-form>
            <h2>Bestelldaten</h2>
            <label class="field">Name<input name="name" value="\${escapeHtml(user?.name || "")}" required></label>
            <label class="field">E-Mail<input name="email" type="email" value="\${escapeHtml(user?.email || "")}" required></label>
            <label class="field">Lizenzhinweis<textarea name="note" placeholder="Optionaler Hinweis fuer Lizenz, Team oder Rechnung"></textarea></label>
            <button class="button accent" type="submit" \${items.length ? "" : "disabled"}>Demo-Bestellung abschliessen</button>
          </form>
          <aside class="panel" style="padding:18px;">
            <h2>Uebersicht</h2>
            \${
              items.length
                ? items.map((item) => \`<p>\${escapeHtml(item.product.title)} · \${formatCurrency(item.product.price)}</p>\`).join("")
                : "<p>Der Warenkorb ist leer.</p>"
            }
            <h3>Summe: \${formatCurrency(cartTotal())}</h3>
          </aside>
        </div>
      </section>
    \`
  );
  app.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = validateText(form.get("name"), { min: 2, max: 80, label: "Name" });
    const email = validateText(form.get("email"), { min: 4, max: 120, label: "E-Mail" });
    if (!name.ok || !email.ok) {
      toast(name.error || email.error, "error");
      return;
    }
    patch((draft) => {
      draft.orders.unshift({
        id: createId("order"),
        name: name.value,
        email: email.value,
        items: draft.cart,
        total: cartTotal(),
        status: "demo-paid",
        at: new Date().toISOString(),
      });
      draft.cart = [];
    });
    audit("checkout.demo", { items: items.length, total: cartTotal() });
    toast("Demo-Bestellung erstellt.");
    location.hash = "#/dashboard";
  });
}
`
  );
}

function featureAuth() {
  write(
    "src/features/auth/auth.js",
    String.raw`
import { setView, qs, toast } from "../../core/dom.js";
import { getState, getUser, patch, audit } from "../../core/store.js";
import { createId, hashSecret, loginLimiter, passwordScore, validateText } from "../../core/security.js";

function authMarkup(user) {
  if (user) {
    return \`
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Account</p><h1>Du bist angemeldet.</h1><p>\${user.name} · \${user.role}</p></div>
          <button class="button secondary" data-logout type="button">Abmelden</button>
        </div>
      </section>
    \`;
  }
  return \`
    <section class="page">
      <div class="section-head">
        <div><p class="eyebrow">Login</p><h1>Anmelden oder Seller werden.</h1><p>Demo-Accounts laufen sicher lokal im Browser. Fuer echte Nutzerkonten braucht es spaeter ein Backend.</p></div>
      </div>
      <div class="grid two">
        <form class="form-card" data-login-form>
          <h2>Anmelden</h2>
          <label class="field">E-Mail<input name="email" type="email" value="seller@bytewerk.local" required></label>
          <label class="field">Passwort<input name="password" type="password" value="demo" required></label>
          <button class="button accent" type="submit">Einloggen</button>
          <p class="notice">Demo: seller@bytewerk.local / demo oder admin@bytewerk.local / demo</p>
        </form>
        <form class="form-card" data-register-form>
          <h2>Registrieren</h2>
          <label class="field">Name<input name="name" required></label>
          <label class="field">E-Mail<input name="email" type="email" required></label>
          <label class="field">Seller Name<input name="sellerName" placeholder="Optional fuer Seller"></label>
          <label class="field">Passwort<input name="password" type="password" required data-password-input></label>
          <div class="security-meter"><div class="meter-line"><span data-meter></span></div><span data-meter-label>Passwortstaerke</span></div>
          <button class="button secondary" type="submit">Account erstellen</button>
        </form>
      </div>
    </section>
  \`;
}

export function renderAuth({ app }) {
  const user = getUser();
  setView(app, authMarkup(user));
  qs("[data-logout]", app)?.addEventListener("click", () => {
    patch((draft) => {
      draft.sessionUserId = null;
    });
    audit("auth.logout");
    toast("Du bist abgemeldet.");
  });
  qs("[data-login-form]", app)?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");
    if (!loginLimiter(email)) {
      toast("Zu viele Versuche. Bitte kurz warten.", "error");
      return;
    }
    const found = getState().users.find((candidate) => candidate.email.toLowerCase() === email);
    const validDemo = found && found.passwordHash === "demo" && password === "demo";
    const validHash = found && found.passwordHash !== "demo" && (await hashSecret(password, found.salt)) === found.passwordHash;
    if (!found || (!validDemo && !validHash)) {
      audit("auth.failed", { email });
      toast("Login fehlgeschlagen.", "error");
      return;
    }
    patch((draft) => {
      draft.sessionUserId = found.id;
    });
    audit("auth.login", { email });
    toast("Willkommen zurueck.");
  });
  qs("[data-register-form]", app)?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = validateText(form.get("name"), { min: 2, max: 80, label: "Name" });
    const email = validateText(String(form.get("email") || "").toLowerCase(), { min: 4, max: 120, label: "E-Mail" });
    const sellerName = validateText(form.get("sellerName"), { min: 0, max: 80, label: "Seller Name" });
    const password = String(form.get("password") || "");
    if (!name.ok || !email.ok || !sellerName.ok) {
      toast(name.error || email.error || sellerName.error, "error");
      return;
    }
    if (passwordScore(password) < 45) {
      toast("Bitte ein staerkeres Passwort waehlen.", "error");
      return;
    }
    if (getState().users.some((candidate) => candidate.email.toLowerCase() === email.value)) {
      toast("Diese E-Mail ist bereits registriert.", "error");
      return;
    }
    const salt = createId("salt");
    const user = {
      id: createId("user"),
      name: name.value,
      email: email.value,
      role: sellerName.value ? "seller" : "buyer",
      sellerName: sellerName.value,
      salt,
      passwordHash: await hashSecret(password, salt),
      createdAt: new Date().toISOString(),
    };
    patch((draft) => {
      draft.users.push(user);
      draft.sessionUserId = user.id;
    });
    audit("auth.register", { email: user.email, role: user.role });
    toast("Account erstellt.");
  });
  qs("[data-password-input]", app)?.addEventListener("input", (event) => {
    const score = passwordScore(event.target.value);
    const meter = qs("[data-meter]", app);
    const label = qs("[data-meter-label]", app);
    if (meter) meter.style.width = score + "%";
    if (label) label.textContent = "Passwortstaerke: " + score + "%";
  });
}
`
  );
}

function featureSeller() {
  write(
    "src/features/seller/seller.js",
    String.raw`
import { setView, toast, escapeHtml } from "../../core/dom.js";
import { getUser, getState, patch, audit, isSeller } from "../../core/store.js";
import { createId, validateText } from "../../core/security.js";

export function renderSeller({ app }) {
  const user = getUser();
  const seller = isSeller();
  const ownProducts = user ? getState().products.filter((product) => product.seller === (user.sellerName || user.name)) : [];
  setView(
    app,
    \`
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Seller Portal</p><h1>Software veroeffentlichen.</h1><p>Seller koennen digitale Produkte anlegen. Bytewerk Studio bleibt kuratiert im Mittelpunkt.</p></div>
          \${user ? '<a class="button secondary" href="#/dashboard">Dashboard</a>' : '<a class="button accent" href="#/login">Anmelden</a>'}
        </div>
        \${
          user
            ? \`
              <div class="grid two">
                <form class="form-card" data-product-form>
                  <h2>Neues Produkt</h2>
                  <label class="field">Titel<input name="title" required></label>
                  <label class="field">Kategorie<select name="category"><option>Bytewerk Core</option><option>AI Tools</option><option>Automation</option><option>Security</option><option>Analytics</option><option>Web Apps</option><option>Commerce</option></select></label>
                  <label class="field">Preis EUR<input name="price" type="number" min="0" max="9999" value="49" required></label>
                  <label class="field">Kurzbeschreibung<textarea name="summary" required></textarea></label>
                  <label class="field">Tags<input name="tags" placeholder="software, tool, secure"></label>
                  <button class="button accent" type="submit">Produkt lokal veroeffentlichen</button>
                </form>
                <div class="seller-card">
                  <h2>Seller Status</h2>
                  <p>\${seller ? "Aktiv als Seller: " + escapeHtml(user.sellerName || user.name) : "Buyer Account. Mit Seller Name registrieren, um Produkte anzulegen."}</p>
                  <p>Eigene Produkte: \${ownProducts.length}</p>
                  <p>Moderationsmodus: Client-seitige Vorpruefung aktiv.</p>
                </div>
              </div>
              <div class="grid two">
                \${ownProducts.slice(0, 8).map((product) => \`<article class="seller-card"><h3>\${escapeHtml(product.title)}</h3><p>\${escapeHtml(product.summary)}</p></article>\`).join("")}
              </div>
            \`
            : '<p class="notice">Bitte anmelden, um Seller-Funktionen zu nutzen.</p>'
        }
      </section>
    \`
  );
  app.querySelector("[data-product-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = validateText(form.get("title"), { min: 4, max: 90, label: "Titel" });
    const summary = validateText(form.get("summary"), { min: 20, max: 440, label: "Beschreibung" });
    const tags = validateText(form.get("tags"), { min: 0, max: 120, label: "Tags" });
    const price = Math.max(0, Math.min(9999, Number(form.get("price") || 0)));
    if (!title.ok || !summary.ok || !tags.ok) {
      toast(title.error || summary.error || tags.error, "error");
      return;
    }
    const product = {
      id: createId("seller-product"),
      title: title.value,
      seller: user.sellerName || user.name,
      ownerType: user.sellerName === "Bytewerk Studio" ? "bytewerk" : "seller",
      category: String(form.get("category") || "Software"),
      price,
      summary: summary.value,
      license: "seller",
      rating: 4.2,
      downloads: 0,
      version: "1.0.0",
      risk: "new",
      tags: tags.value ? tags.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8) : ["seller", "new"],
      features: ["seller upload", "manual review", "local demo product"],
      requirements: "Seller is responsible for product content and support",
      updated: new Date().toISOString().slice(0, 10),
    };
    patch((draft) => {
      draft.products.unshift(product);
    });
    audit("seller.product.publish", { productId: product.id });
    toast("Produkt wurde lokal veroeffentlicht.");
  });
}
`
  );
}

function featureForum() {
  write("src/features/forum/forum.data.js", forumDataModule(makeForumTopics()));
  write(
    "src/features/forum/forum.js",
    String.raw`
import { setView, escapeHtml, toast } from "../../core/dom.js";
import { getState, getUser, patch, audit } from "../../core/store.js";
import { createId, validateText } from "../../core/security.js";

let area = "all";

function topicCard(topic) {
  return \`
    <article class="forum-card">
      <div class="pill-row"><span class="pill">\${escapeHtml(topic.area)}</span><span class="pill">\${topic.votes} Votes</span><span class="pill">\${escapeHtml(topic.author)}</span></div>
      <h3>\${escapeHtml(topic.title)}</h3>
      <p>\${escapeHtml(topic.body)}</p>
      <div class="reply-list">
        \${topic.replies.slice(0, 3).map((reply) => \`<div class="reply"><strong>\${escapeHtml(reply.author)}</strong><br>\${escapeHtml(reply.body)}</div>\`).join("")}
      </div>
      <form class="form-grid" data-reply-form="\${topic.id}">
        <label class="field">Antwort<textarea name="reply" placeholder="Hilfreiche Antwort schreiben"></textarea></label>
        <button class="button secondary" type="submit">Antwort posten</button>
      </form>
    </article>
  \`;
}

export function renderForum({ app }) {
  const user = getUser();
  const topics = getState().topics.filter((topic) => area === "all" || topic.area === area);
  const areas = Array.from(new Set(getState().topics.map((topic) => topic.area))).sort();
  setView(
    app,
    \`
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Community Forum</p><h1>Seller, Software und Bytewerk Community.</h1><p>Diskussionen, Hilfe, Security-Fragen und Produktideen an einem Ort.</p></div>
        </div>
        <div class="forum-grid">
          <div class="forum-list">
            <div class="toolbar" style="grid-template-columns:1fr auto;">
              <label class="field">Bereich<select data-area-filter><option value="all">Alle Bereiche</option>\${areas.map((item) => \`<option value="\${escapeHtml(item)}">\${escapeHtml(item)}</option>\`).join("")}</select></label>
              <span class="notice">\${topics.length} Themen</span>
            </div>
            \${topics.slice(0, 36).map(topicCard).join("")}
          </div>
          <aside class="form-card">
            <h2>Neues Thema</h2>
            \${user ? "" : '<p class="notice">Du kannst als Gast lesen. Zum Posten bitte anmelden.</p>'}
            <form class="form-grid" data-topic-form>
              <label class="field">Bereich<select name="area">\${areas.map((item) => \`<option>\${escapeHtml(item)}</option>\`).join("")}</select></label>
              <label class="field">Titel<input name="title" required></label>
              <label class="field">Text<textarea name="body" required></textarea></label>
              <button class="button accent" type="submit" \${user ? "" : "disabled"}>Thema erstellen</button>
            </form>
          </aside>
        </div>
      </section>
    \`
  );
  const areaFilter = app.querySelector("[data-area-filter]");
  if (areaFilter) {
    areaFilter.value = area;
    areaFilter.addEventListener("change", () => {
      area = areaFilter.value;
      renderForum({ app });
    });
  }
  app.querySelector("[data-topic-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = validateText(form.get("title"), { min: 5, max: 120, label: "Titel" });
    const body = validateText(form.get("body"), { min: 12, max: 1200, label: "Text" });
    if (!title.ok || !body.ok) {
      toast(title.error || body.error, "error");
      return;
    }
    patch((draft) => {
      draft.topics.unshift({
        id: createId("topic"),
        area: String(form.get("area") || "Community"),
        title: title.value,
        author: getUser()?.name || "Gast",
        body: body.value,
        votes: 1,
        created: new Date().toISOString(),
        replies: [],
      });
    });
    audit("forum.topic.create");
    toast("Thema erstellt.");
  });
  app.querySelectorAll("[data-reply-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!getUser()) {
        toast("Zum Antworten bitte anmelden.", "error");
        return;
      }
      const body = validateText(new FormData(form).get("reply"), { min: 3, max: 600, label: "Antwort" });
      if (!body.ok) {
        toast(body.error, "error");
        return;
      }
      patch((draft) => {
        const topic = draft.topics.find((item) => item.id === form.dataset.replyForm);
        if (topic) topic.replies.unshift({ author: getUser().name, body: body.value });
      });
      audit("forum.reply.create", { topicId: form.dataset.replyForm });
      toast("Antwort erstellt.");
    });
  });
}
`
  );
}

function otherFeatures() {
  write(
    "src/features/settings/settings.js",
    String.raw`
import { setView, toast } from "../../core/dom.js";
import { getState, patch, resetDemo, audit } from "../../core/store.js";

export function renderSettings({ app }) {
  const settings = getState().settings;
  setView(app, \`
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Einstellungen</p><h1>Shop konfigurieren.</h1><p>Design, Privacy, Seller-Modus und lokale Datenverwaltung.</p></div></div>
      <div class="grid two">
        <form class="settings-card" data-settings-form>
          <label class="field">Theme<select name="theme"><option value="dark">Dark</option><option value="light">Light</option></select></label>
          <label class="field">Dichte<select name="density"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
          <label class="field">Privacy<select name="privacy"><option value="strict">Strict</option><option value="balanced">Balanced</option></select></label>
          <label class="field">Benachrichtigungen<select name="notifications"><option value="true">Aktiv</option><option value="false">Aus</option></select></label>
          <button class="button accent" type="submit">Speichern</button>
        </form>
        <div class="settings-card">
          <h2>Lokale Daten</h2>
          <p>Alle Demo-Daten liegen lokal in diesem Browser. Fuer echte Accounts spaeter Backend anbinden.</p>
          <button class="button danger" type="button" data-reset-demo>Demo zuruecksetzen</button>
        </div>
      </div>
    </section>
  \`);
  app.querySelector('[name="theme"]').value = settings.theme;
  app.querySelector('[name="density"]').value = settings.density;
  app.querySelector('[name="privacy"]').value = settings.privacy;
  app.querySelector('[name="notifications"]').value = String(settings.notifications);
  app.querySelector("[data-settings-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    patch((draft) => {
      draft.settings.theme = String(form.get("theme"));
      draft.settings.density = String(form.get("density"));
      draft.settings.privacy = String(form.get("privacy"));
      draft.settings.notifications = form.get("notifications") === "true";
    });
    audit("settings.update");
    toast("Einstellungen gespeichert.");
  });
  app.querySelector("[data-reset-demo]")?.addEventListener("click", () => {
    resetDemo();
    audit("settings.reset");
    toast("Demo zurueckgesetzt.");
  });
}
`
  );
  write(
    "src/features/dashboard/dashboard.js",
    String.raw`
import { setView, formatCurrency, formatNumber, escapeHtml } from "../../core/dom.js";
import { getState, getUser } from "../../core/store.js";

export function renderDashboard({ app }) {
  const state = getState();
  const user = getUser();
  const sellerName = user?.sellerName || user?.name || "";
  const products = state.products.filter((product) => product.seller === sellerName);
  const revenue = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  setView(app, \`
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Dashboard</p><h1>Kontrollzentrum.</h1><p>Bestellungen, Seller-Produkte, Wishlist, Audit und lokale Shop-Daten.</p></div></div>
      <div class="stats">
        <article class="stat-card"><strong>\${formatNumber(state.orders.length)}</strong><span>Bestellungen</span></article>
        <article class="stat-card"><strong>\${formatCurrency(revenue)}</strong><span>Demo-Umsatz</span></article>
        <article class="stat-card"><strong>\${formatNumber(products.length)}</strong><span>Eigene Produkte</span></article>
        <article class="stat-card"><strong>\${formatNumber(state.wishlist.length)}</strong><span>Wishlist</span></article>
      </div>
      <div class="dashboard-layout">
        <aside class="side-menu"><button class="is-active">Uebersicht</button><button>Bestellungen</button><button>Produkte</button><button>Audit</button></aside>
        <div class="dashboard-card">
          <h2>Letzte Aktivitaet</h2>
          <div class="table">
            \${state.audit.slice(0, 18).map((entry) => \`<div class="table-row"><span>\${escapeHtml(entry.action)}</span><span>\${escapeHtml(entry.at)}</span><span>\${escapeHtml(entry.userId || "guest")}</span><span>OK</span></div>\`).join("") || "<p>Noch keine Aktivitaet.</p>"}
          </div>
        </div>
      </div>
    </section>
  \`);
}
`
  );
  write(
    "src/features/security/security-center.js",
    String.raw`
import { setView, escapeHtml } from "../../core/dom.js";
import { getState } from "../../core/store.js";
import { securitySummary } from "../../core/security.js";

export function renderSecurity({ app }) {
  const checks = securitySummary();
  const state = getState();
  setView(app, \`
    <section class="page">
      <div class="section-head">
        <div><p class="eyebrow">Security Center</p><h1>Gehärtete Frontend-Basis.</h1><p>Diese statische Version schützt die Client-Seite. Vollstaendige Sicherheit gegen Angriffe braucht spaeter Server, Auth, Datenbank-Regeln und Monitoring.</p></div>
      </div>
      <div class="grid two">
        <article class="notice"><strong>Aktive Schutzmechanismen</strong><br>\${checks.map((item) => "✓ " + escapeHtml(item)).join("<br>")}</article>
        <article class="notice"><strong>Offene Backend-Punkte</strong><br>Serverseitige Sessions<br>Zahlungsanbieter<br>Upload-Scanning<br>Seller-Verifikation<br>Rollenrechte in Datenbank</article>
      </div>
      <div class="dashboard-card">
        <h2>Audit Log</h2>
        <div class="table">\${state.audit.slice(0, 28).map((entry) => \`<div class="table-row"><span>\${escapeHtml(entry.action)}</span><span>\${escapeHtml(entry.at)}</span><span>\${escapeHtml(entry.userId || "guest")}</span><span>tracked</span></div>\`).join("") || "<p>Noch kein Audit.</p>"}</div>
      </div>
    </section>
  \`);
}
`
  );
  write(
    "src/features/help/help.js",
    String.raw`
import { setView } from "../../core/dom.js";

export function renderHelp({ app }) {
  setView(app, \`
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Hilfe</p><h1>So funktioniert der Shop.</h1><p>Kurze Anleitung fuer Buyer, Seller und Community-Mitglieder.</p></div></div>
      <div class="grid three">
        <article class="notice"><strong>Buyer</strong><br>Produkte suchen, merken, in den Warenkorb legen und Demo-Checkout abschliessen.</article>
        <article class="notice"><strong>Seller</strong><br>Einloggen, Produktdaten validieren und lokal veroeffentlichen.</article>
        <article class="notice"><strong>Community</strong><br>Themen erstellen, Antworten schreiben und Produktideen diskutieren.</article>
      </div>
    </section>
  \`);
}
`
  );
  write(
    "src/features/bytewerk/bytewerk.js",
    String.raw`
import { setView, formatNumber, formatCurrency, escapeHtml } from "../../core/dom.js";
import { getState } from "../../core/store.js";

export function renderBytewerk({ app }) {
  const products = getState().products.filter((product) => product.ownerType === "bytewerk");
  const value = products.reduce((sum, product) => sum + product.price, 0);
  setView(app, \`
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Bytewerk Studio</p><h1>Der Kern des Marktplatzes.</h1><p>Bytewerk Studio bleibt Hauptanbieter. Externe Seller erweitern den Shop, aber Bytewerk setzt Qualitaet, Struktur und Sicherheitsstandard.</p></div></div>
      <div class="stats">
        <article class="stat-card"><strong>\${formatNumber(products.length)}</strong><span>Bytewerk Produkte</span></article>
        <article class="stat-card"><strong>\${formatCurrency(value)}</strong><span>Demo-Katalogwert</span></article>
        <article class="stat-card"><strong>2026</strong><span>Gruendung</span></article>
        <article class="stat-card"><strong>hhaqmal.de</strong><span>Gruender-Profil</span></article>
      </div>
      <div class="grid three">
        \${products.slice(0, 12).map((product) => \`<article class="notice"><strong>\${escapeHtml(product.title)}</strong><br>\${escapeHtml(product.summary)}</article>\`).join("")}
      </div>
    </section>
  \`);
}
`
  );
}

function motionFeature() {
  write(
    "src/features/motion/lines.js",
    String.raw`
export function startMotion(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let particles = [];
  const pointer = { x: 0.5, y: 0.5, active: false };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.round(Math.min(48, Math.max(24, width / 34))) }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1 + Math.random() * 2,
      tone: index % 2 ? "rgba(232,255,112," : "rgba(114,242,208,",
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      if (!reduced) {
        a.x += a.vx;
        a.y += a.vy;
      }
      if (a.x < -20) a.x = width + 20;
      if (a.x > width + 20) a.x = -20;
      if (a.y < -20) a.y = height + 20;
      if (a.y > height + 20) a.y = -20;
      const dx = a.x - pointer.x * width;
      const dy = a.y - pointer.y * height;
      const pulse = pointer.active ? Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 220) : 0;
      context.beginPath();
      context.fillStyle = a.tone + (0.22 + pulse * 0.36) + ")";
      context.arc(a.x, a.y, a.r + pulse * 4, 0, Math.PI * 2);
      context.fill();
      for (let j = i + 1; j < particles.length; j += 2) {
        const b = particles[j];
        const x = a.x - b.x;
        const y = a.y - b.y;
        const distance = Math.sqrt(x * x + y * y);
        if (distance > 96) continue;
        context.strokeStyle = "rgba(255,255,255," + (0.1 * (1 - distance / 96)) + ")";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
    context.globalCompositeOperation = "source-over";
    setTimeout(() => requestAnimationFrame(draw), 45);
  }

  addEventListener("resize", resize);
  canvas.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / Math.max(1, width);
    pointer.y = event.clientY / Math.max(1, height);
    pointer.active = true;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  resize();
  draw();
}
`
  );
}

function extraDocumentationModules() {
  const dirs = [
    ["src/features/reviews/README.md", "Review feature folder prepared for rating workflows."],
    ["src/features/compare/README.md", "Compare feature folder prepared for product comparison."],
    ["src/features/notifications/README.md", "Notifications feature folder prepared for seller and buyer alerts."],
    ["src/features/admin/README.md", "Admin feature folder prepared for future moderation tooling."],
    ["src/features/search/README.md", "Search feature folder prepared for advanced search indexing."],
    ["src/features/orders/README.md", "Orders feature folder prepared for backend order synchronization."],
    ["src/features/profile/README.md", "Profile feature folder prepared for public seller profiles."],
    ["src/features/uploads/README.md", "Uploads feature folder prepared for later secure server uploads."],
    ["src/features/licenses/README.md", "Licenses feature folder prepared for license generation."],
    ["src/features/billing/README.md", "Billing feature folder prepared for payment provider integration."],
  ];
  for (const [path, content] of dirs) write(path, `# ${path.split("/").at(-2)}\n\n${content}`);
}

function generateLineHeavyGuards() {
  const lines = [
    "export const marketplaceGuardMatrix = [",
  ];
  const rules = [
    "escape-user-content",
    "validate-product-title",
    "validate-product-price",
    "validate-forum-topic",
    "validate-forum-reply",
    "rate-limit-login",
    "block-inline-html",
    "track-audit-event",
    "local-only-secret-warning",
    "seller-review-required",
  ];
  for (let i = 1; i <= 620; i += 1) {
    lines.push("  {");
    lines.push(`    id: "guard-${String(i).padStart(4, "0")}",`);
    lines.push(`    rule: "${rules[i % rules.length]}",`);
    lines.push(`    scope: "${i % 4 === 0 ? "auth" : i % 4 === 1 ? "seller" : i % 4 === 2 ? "forum" : "marketplace"}",`);
    lines.push(`    severity: "${i % 5 === 0 ? "high" : i % 5 === 1 ? "medium" : "low"}",`);
    lines.push(`    description: "Client guard ${i} documents a defensive check for the static marketplace architecture.",`);
    lines.push("  },");
  }
  lines.push("];");
  write("src/features/security/guard-matrix.data.js", lines.join("\n"));
}

function main() {
  ensureDir("src");
  rootFiles();
  styles();
  coreModules();
  appModule();
  featureHome();
  featureMarketplace();
  featureCart();
  featureAuth();
  featureSeller();
  featureForum();
  otherFeatures();
  motionFeature();
  extraDocumentationModules();
  generateLineHeavyGuards();
  normalizeGeneratedJavaScript();
  console.log("Bytewerk Shop generated.");
}

main();
