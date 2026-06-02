import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function write(name, content) {
  writeFileSync(join(root, name), `${content.trim()}\n`, "utf8");
}

function attr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function text(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const navItems = [
  ["Leistungen", "#leistungen"],
  ["Studio OS", "#studio-os"],
  ["Capabilities", "#capabilities"],
  ["Gruender", "#gruender"],
  ["Rechner", "#rechner"],
  ["Kontakt", "#kontakt"],
];

const services = [
  {
    id: "software",
    eyebrow: "01",
    title: "Softwareentwicklung",
    tag: "Build",
    summary:
      "Individuelle Anwendungen, interne Tools, Automatisierungen und produktreife Software fuer reale Prozesse.",
    bullets: ["SaaS-Prototypen", "Admin-Dashboards", "Workflow-Tools", "API-Schnittstellen"],
  },
  {
    id: "web",
    eyebrow: "02",
    title: "Webentwicklung",
    tag: "Launch",
    summary:
      "Websites, Landingpages und Plattformen mit sauberer Struktur, responsivem Design und starker Performance.",
    bullets: ["Corporate Websites", "Landingpages", "Portale", "SEO-Struktur"],
  },
  {
    id: "apps",
    eyebrow: "03",
    title: "App-Entwicklung",
    tag: "Mobile",
    summary:
      "App-Erlebnisse fuer Kunden, Teams und digitale Produkte, vom klickbaren Prototyp bis zur stabilen Version.",
    bullets: ["Mobile UX", "PWA", "MVP", "App-Konzept"],
  },
  {
    id: "it",
    eyebrow: "04",
    title: "IT-Dienstleistungen",
    tag: "Ops",
    summary:
      "Technische Beratung, Setup, Prozessdigitalisierung und Betreuung fuer Unternehmen, Teams und Projekte.",
    bullets: ["Setup", "Support", "Automatisierung", "Datenfluesse"],
  },
  {
    id: "commerce",
    eyebrow: "05",
    title: "Digitale Produkte",
    tag: "Shop",
    summary:
      "Konzeption, Verpackung und Vertrieb digitaler Produkte ueber einen schlanken Online-Shop.",
    bullets: ["Templates", "Toolkits", "Downloads", "Launch-Systeme"],
  },
  {
    id: "data",
    eyebrow: "06",
    title: "Daten & Controlling",
    tag: "Insight",
    summary:
      "Dashboards, Datenmodelle und Auswertungen, die Entscheidungen schneller und transparenter machen.",
    bullets: ["Reporting", "KPIs", "Forecasts", "Controlling"],
  },
];

const studioSystems = [
  {
    title: "Discovery Engine",
    label: "Klarheit",
    copy: "Strukturierte Aufnahme von Zielgruppe, Nutzenversprechen, Prozessen, Daten und technischen Grenzen.",
  },
  {
    title: "Build Pipeline",
    label: "Umsetzung",
    copy: "Planbare Entwicklung mit UI-System, Datenmodell, Schnittstellen, Tests und Launch-Checkliste.",
  },
  {
    title: "Growth Console",
    label: "Weiterentwicklung",
    copy: "Messbare Optimierung nach Launch: Performance, Conversion, Automatisierung und neue Produktmodule.",
  },
  {
    title: "Digital Shop Layer",
    label: "Vertrieb",
    copy: "Struktur fuer digitale Produkte, Produktseiten, Download-Logik, Zahlungswege und Support-Prozesse.",
  },
];

const processSteps = [
  ["01", "Strategie", "Ziele, Zielgruppe, Produktkern und technische Prioritaeten werden verdichtet."],
  ["02", "Architektur", "Daten, Seiten, Komponenten, Workflows und Integrationen werden sauber geplant."],
  ["03", "Designsystem", "Interface, Typografie, Farben, Komponenten und Zustandslogik entstehen als System."],
  ["04", "Entwicklung", "Die Loesung wird umgesetzt, getestet und fuer die echte Nutzung vorbereitet."],
  ["05", "Launch", "Domain, Deployment, SEO, Analytics, Sicherheit und Inhalte werden final geschaltet."],
  ["06", "Iteration", "Nach dem Start werden Nutzerverhalten, Prozesse und Produktideen weiter verbessert."],
];

const capabilityAreas = [
  {
    area: "Software",
    color: "teal",
    problems: [
      "manuelle Freigaben",
      "isolierte Excel-Prozesse",
      "unuebersichtliche Tool-Landschaften",
      "wiederkehrende Admin-Aufgaben",
      "fragmentierte Kundendaten",
    ],
    outcomes: [
      "ein zentrales Arbeitsdashboard",
      "eine robuste Prozess-App",
      "ein sauberer MVP",
      "ein integriertes Backoffice",
      "ein wartbares SaaS-Fundament",
    ],
    tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
  },
  {
    area: "Web",
    color: "amber",
    problems: [
      "schwache Erstwirkung",
      "unklare Angebotsstruktur",
      "lange Ladezeiten",
      "fehlende Conversion-Pfade",
      "zersplitterte Inhalte",
    ],
    outcomes: [
      "eine schnelle Website",
      "eine starke Landingpage",
      "ein skalierbares Content-System",
      "eine bessere Anfrage-Strecke",
      "eine saubere SEO-Basis",
    ],
    tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
  },
  {
    area: "App",
    color: "coral",
    problems: [
      "komplizierte Nutzerwege",
      "fehlende mobile Prozesse",
      "ungenutzte Kundeninteraktion",
      "ungetestete Produktideen",
      "langsame Feedback-Zyklen",
    ],
    outcomes: [
      "ein klickbarer Prototyp",
      "eine mobile Web-App",
      "ein validiertes App-Konzept",
      "eine PWA mit Offline-Basis",
      "ein klarer Release-Plan",
    ],
    tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
  },
  {
    area: "Daten",
    color: "blue",
    problems: [
      "versteckte Kennzahlen",
      "manuelle Monatsreports",
      "fehlende Forecasts",
      "unsaubere Datenquellen",
      "spaete Management-Information",
    ],
    outcomes: [
      "ein KPI-Dashboard",
      "ein Controlling-Workflow",
      "ein Forecast-Modell",
      "eine Datenqualitaetsroutine",
      "ein Reporting-System",
    ],
    tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
  },
  {
    area: "Automation",
    color: "green",
    problems: [
      "doppelte Dateneingabe",
      "langsame Benachrichtigungen",
      "manuelle Dateiablage",
      "chaotische Kundenanfragen",
      "nicht dokumentierte Routinen",
    ],
    outcomes: [
      "ein automatisierter Workflow",
      "eine No-Code/Code-Automation",
      "ein Integrationskonzept",
      "ein digitales Betriebshandbuch",
      "eine messbare Zeitersparnis",
    ],
    tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
  },
  {
    area: "Shop",
    color: "violet",
    problems: [
      "digitale Produkte ohne Verpackung",
      "fehlende Produktseiten",
      "kein Download-Prozess",
      "unscharfe Preislogik",
      "kein Launch-System",
    ],
    outcomes: [
      "ein digitaler Produktshop",
      "eine Produktbibliothek",
      "eine Checkout-Struktur",
      "ein Template-Angebot",
      "eine Support-Route",
    ],
    tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
  },
];

const stages = ["Audit", "Konzept", "MVP", "Launch", "Scale"];
const effort = ["S", "M", "L", "XL"];
const capabilityRecords = [];
let capIndex = 1;

for (let round = 0; round < 12; round += 1) {
  for (const pack of capabilityAreas) {
    for (let i = 0; i < pack.problems.length; i += 1) {
      const stage = stages[(round + i) % stages.length];
      const size = effort[(round + i) % effort.length];
      capabilityRecords.push({
        id: `cap-${String(capIndex).padStart(3, "0")}`,
        area: pack.area,
        tone: pack.color,
        stage,
        effort: size,
        title: `${pack.outcomes[(round + i) % pack.outcomes.length]} fuer ${pack.problems[i]}`,
        problem: `Wenn ${pack.problems[i]} Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.`,
        outcome: `Ergebnis ist ${pack.outcomes[(round + i + 1) % pack.outcomes.length]}, das Teams schneller macht und Entscheidungen besser vorbereitet.`,
        tools: pack.tools.slice(0, 3 + ((round + i) % 3)),
        tags: [pack.area, stage, size, pack.tools[(round + i) % pack.tools.length]],
      });
      capIndex += 1;
    }
  }
}

const productFamilies = [
  ["LaunchKit", "Website-Launch, SEO-Basis, Checklisten und Content-Struktur"],
  ["OpsKit", "Automationen, Prozessdokumente, Dashboards und Routine-Boards"],
  ["DataKit", "KPI-Modelle, Controlling-Templates, Forecasts und Reporting"],
  ["ShopKit", "Produktseiten, digitale Downloads, Preislogik und Support-Flows"],
  ["FounderKit", "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik"],
];
const productRecords = [];
let productIndex = 1;

for (let familyIndex = 0; familyIndex < productFamilies.length; familyIndex += 1) {
  const [family, description] = productFamilies[familyIndex];
  for (let variant = 1; variant <= 18; variant += 1) {
    const price = 29 + familyIndex * 20 + variant * 3;
    productRecords.push({
      id: `product-${String(productIndex).padStart(3, "0")}`,
      family,
      title: `${family} ${String(variant).padStart(2, "0")}`,
      description,
      format: variant % 3 === 0 ? "Template Pack" : variant % 3 === 1 ? "Workflow Pack" : "Dashboard Pack",
      price,
      level: variant % 4 === 0 ? "Advanced" : variant % 4 === 1 ? "Starter" : variant % 4 === 2 ? "Pro" : "Studio",
      includes: [
        "Strukturierte Vorlage",
        "Umsetzungs-Checkliste",
        variant % 2 === 0 ? "Datenfelder" : "Content-Bloecke",
        variant % 5 === 0 ? "Launch-Plan" : "Review-Fragen",
      ],
    });
    productIndex += 1;
  }
}

const stackItems = [
  ["HTML", "Struktur und semantische Seitenarchitektur"],
  ["CSS", "Designsystem, responsive Layouts und Animationen"],
  ["JavaScript", "Interaktionen, Rechner, Filter und dynamische Module"],
  ["GitHub Pages", "Schnelles Hosting mit Custom Domain"],
  ["APIs", "Schnittstellen fuer Daten, Automationen und Produktlogik"],
  ["Python", "Datenverarbeitung, Skripte und Analyse-Automation"],
  ["SQL", "Datenmodelle, Abfragen und Reporting-Strukturen"],
  ["SAP ERP", "Prozessverstaendnis fuer Unternehmensdaten"],
  ["n8n", "Automatisierung zwischen Tools und Services"],
  ["Vertex AI", "KI-gestuetzte Workflows und Prototyping"],
];

const faqItems = [
  [
    "Was macht Bytewerk Studio?",
    "Bytewerk Studio entwickelt Software, Websites, Apps, Automationen und digitale Produkte fuer Unternehmen, Gruender und Projekte.",
  ],
  [
    "Wer steht hinter Bytewerk Studio?",
    "Gruender & CIO ist Hijratullah Haqmal. Das Profil auf hhaqmal.de zeigt den Hintergrund in Controlling, Datenanalyse, Prozessen und IT.",
  ],
  [
    "Kann die Website spaeter erweitert werden?",
    "Ja. Die Seite ist bewusst modular aufgebaut: Inhalte, Rechner, Suchbereiche und Produktmodule koennen weiter wachsen.",
  ],
  [
    "Ist das eine GitHub-Pages-Website?",
    "Ja. Die Seite wird ueber GitHub Pages veroeffentlicht und verwendet die Custom Domain bytewerkstudio.com.",
  ],
  [
    "Welche Projekte passen gut?",
    "Besonders gut passen Websites, interne Tools, digitale Produktshops, Automationen, Daten-Dashboards und MVPs.",
  ],
  [
    "Kann ein Online-Shop fuer digitale Produkte eingebunden werden?",
    "Ja. Die aktuelle Website enthaelt bereits eine Produkt- und Template-Struktur, die spaeter mit Checkout erweitert werden kann.",
  ],
];

function renderServiceCards() {
  return services
    .map(
      (service) => `
          <article class="service-card reveal" data-service="${attr(service.id)}" data-filter-card="${attr(service.tag.toLowerCase())}">
            <div class="service-card__top">
              <span class="service-number">${text(service.eyebrow)}</span>
              <span class="service-tag">${text(service.tag)}</span>
            </div>
            <h3>${text(service.title)}</h3>
            <p>${text(service.summary)}</p>
            <ul>
              ${service.bullets.map((item) => `<li>${text(item)}</li>`).join("\n              ")}
            </ul>
          </article>`
    )
    .join("\n");
}

function renderSystems() {
  return studioSystems
    .map(
      (system, index) => `
          <button class="os-tab${index === 0 ? " is-active" : ""}" type="button" data-os-tab="${index}">
            <span>${text(system.label)}</span>
            ${text(system.title)}
          </button>`
    )
    .join("\n");
}

function renderSystemPanels() {
  return studioSystems
    .map(
      (system, index) => `
          <article class="os-panel${index === 0 ? " is-active" : ""}" data-os-panel="${index}">
            <p class="eyebrow">${text(system.label)}</p>
            <h3>${text(system.title)}</h3>
            <p>${text(system.copy)}</p>
          </article>`
    )
    .join("\n");
}

function renderProcess() {
  return processSteps
    .map(
      ([num, titleValue, copy]) => `
          <article class="process-card reveal">
            <span>${text(num)}</span>
            <h3>${text(titleValue)}</h3>
            <p>${text(copy)}</p>
          </article>`
    )
    .join("\n");
}

function arrayLiteral(values) {
  return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
}

function objectLiteral(record, indent = "    ") {
  return [
    `${indent}{`,
    `${indent}  id: ${JSON.stringify(record.id)},`,
    `${indent}  area: ${JSON.stringify(record.area)},`,
    `${indent}  tone: ${JSON.stringify(record.tone)},`,
    `${indent}  stage: ${JSON.stringify(record.stage)},`,
    `${indent}  effort: ${JSON.stringify(record.effort)},`,
    `${indent}  title: ${JSON.stringify(record.title)},`,
    `${indent}  problem: ${JSON.stringify(record.problem)},`,
    `${indent}  outcome: ${JSON.stringify(record.outcome)},`,
    `${indent}  tools: ${arrayLiteral(record.tools)},`,
    `${indent}  tags: ${arrayLiteral(record.tags)},`,
    `${indent}},`,
  ].join("\n");
}

function productLiteral(record, indent = "    ") {
  return [
    `${indent}{`,
    `${indent}  id: ${JSON.stringify(record.id)},`,
    `${indent}  family: ${JSON.stringify(record.family)},`,
    `${indent}  title: ${JSON.stringify(record.title)},`,
    `${indent}  description: ${JSON.stringify(record.description)},`,
    `${indent}  format: ${JSON.stringify(record.format)},`,
    `${indent}  price: ${record.price},`,
    `${indent}  level: ${JSON.stringify(record.level)},`,
    `${indent}  includes: ${arrayLiteral(record.includes)},`,
    `${indent}},`,
  ].join("\n");
}

function stackLiteral([name, copy], indent = "    ") {
  return [
    `${indent}{`,
    `${indent}  name: ${JSON.stringify(name)},`,
    `${indent}  copy: ${JSON.stringify(copy)},`,
    `${indent}},`,
  ].join("\n");
}

function faqLiteral([question, answer], indent = "    ") {
  return [
    `${indent}{`,
    `${indent}  question: ${JSON.stringify(question)},`,
    `${indent}  answer: ${JSON.stringify(answer)},`,
    `${indent}},`,
  ].join("\n");
}

function generatedMotionClasses() {
  const lines = [];
  for (let i = 1; i <= 180; i += 1) {
    const delay = (i * 0.035).toFixed(3);
    const duration = (8 + (i % 17) * 0.35).toFixed(2);
    lines.push(`.motion-delay-${i} {`);
    lines.push(`  --motion-delay: ${delay}s;`);
    lines.push(`  --motion-duration: ${duration}s;`);
    lines.push(`}`);
  }
  for (let i = 1; i <= 120; i += 1) {
    const hue = 158 + (i % 36);
    const sat = 34 + (i % 18);
    const light = 86 - (i % 24) * 0.3;
    lines.push(`.surface-tone-${i} {`);
    lines.push(`  --surface-tint: hsl(${hue} ${sat}% ${light}%);`);
    lines.push(`  --surface-ring: hsla(${hue}, ${sat}%, 38%, 0.24);`);
    lines.push(`}`);
  }
  return lines.join("\n");
}

const html = String.raw`
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bytewerk Studio | Software, Web, Apps & digitale Produkte</title>
    <meta name="description" content="Bytewerk Studio entwickelt Software, Websites, Apps, Automationen und digitale Produkte. Gruender & CIO: Hijratullah Haqmal von hhaqmal.de.">
    <meta name="theme-color" content="#0f766e">
    <meta property="og:title" content="Bytewerk Studio">
    <meta property="og:description" content="Premium-Website fuer Software, Web- und App-Entwicklung, IT-Dienstleistungen und digitale Produkte.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bytewerkstudio.com/">
    <link rel="canonical" href="https://bytewerkstudio.com/">
    <link rel="stylesheet" href="styles.css">
    <script src="app.js" defer></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Direkt zum Inhalt</a>
    <div class="scroll-progress" aria-hidden="true"><span></span></div>

    <header class="site-header" data-header>
      <a class="brand" href="#top" aria-label="Bytewerk Studio Startseite">
        <span class="brand-mark">B</span>
        <span>
          <strong>Bytewerk Studio</strong>
          <small>Software · Web · Apps</small>
        </span>
      </a>

      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        ${navItems.map(([label, href]) => `<a href="${attr(href)}">${text(label)}</a>`).join("\n        ")}
      </nav>

      <button class="command-open" type="button" data-command-open>
        <span>⌘K</span>
        Navigation
      </button>
    </header>

    <main id="main">
      <section class="hero" id="top">
        <canvas id="hero-canvas" aria-hidden="true"></canvas>
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="hero-content reveal">
            <p class="eyebrow">Software-Gruender & CIO · 2026 - heute</p>
            <h1>Bytewerk Studio baut digitale Systeme, die wie ein Produkt wirken.</h1>
            <p class="hero-text">
              Software, Websites, Apps, Automationen und digitale Produkte fuer moderne Projekte:
              strategisch geplant, visuell stark, technisch sauber und direkt auf Wachstum vorbereitet.
            </p>
            <div class="hero-actions">
              <a class="button button-primary" href="#kontakt">Projekt starten</a>
              <a class="button button-glass" href="#capabilities">Capability-Suche</a>
            </div>
          </div>

          <aside class="hero-console reveal" aria-label="Live Studio Console">
            <div class="console-bar">
              <span></span><span></span><span></span>
              <strong>studio.system</strong>
            </div>
            <div class="console-lines">
              <p><span>status</span> GitHub Pages live</p>
              <p><span>domain</span> bytewerkstudio.com</p>
              <p><span>founder</span> hhaqmal.de</p>
              <p><span>focus</span> Software · Web · Apps · Shop</p>
            </div>
            <div class="console-metric">
              <strong data-counter="360">0</strong>
              <span>Capability-Bausteine im Studio-System</span>
            </div>
          </aside>
        </div>
      </section>

      <section class="metric-band" aria-label="Bytewerk Studio Kennzahlen">
        <div><strong data-counter="6">0</strong><span>Leistungsfelder</span></div>
        <div><strong data-counter="90">0</strong><span>Produktmodule</span></div>
        <div><strong data-counter="360">0</strong><span>Capabilities</span></div>
        <div><strong data-counter="2026">0</strong><span>Startjahr</span></div>
      </section>

      <section class="section" id="leistungen">
        <div class="section-heading reveal">
          <p class="eyebrow">Leistungen</p>
          <h2>Ein Studio fuer digitale Umsetzung, Betrieb und Vertrieb.</h2>
          <p>
            Bytewerk Studio verbindet Softwareentwicklung, Webdesign, App-Logik,
            Datenverstaendnis und digitale Produktstrategie in einem modularen System.
          </p>
        </div>

        <div class="filter-row" aria-label="Leistungsfilter">
          <button class="chip is-active" type="button" data-service-filter="all">Alle</button>
          <button class="chip" type="button" data-service-filter="build">Build</button>
          <button class="chip" type="button" data-service-filter="launch">Launch</button>
          <button class="chip" type="button" data-service-filter="mobile">Mobile</button>
          <button class="chip" type="button" data-service-filter="ops">Ops</button>
          <button class="chip" type="button" data-service-filter="shop">Shop</button>
          <button class="chip" type="button" data-service-filter="insight">Insight</button>
        </div>

        <div class="service-grid">
${renderServiceCards()}
        </div>
      </section>

      <section class="studio-os" id="studio-os">
        <div class="section-heading reveal">
          <p class="eyebrow">Studio OS</p>
          <h2>Ein Betriebssystem fuer digitale Produkte.</h2>
          <p>
            Das Studio OS strukturiert Projekte vom ersten Gedanken bis zum laufenden Betrieb:
            Strategie, Designsystem, Entwicklung, Launch, Messung und Weiterentwicklung.
          </p>
        </div>
        <div class="os-layout reveal">
          <div class="os-tabs" role="tablist" aria-label="Studio OS Bereiche">
${renderSystems()}
          </div>
          <div class="os-panels">
${renderSystemPanels()}
          </div>
        </div>
      </section>

      <section class="capability-section" id="capabilities">
        <div class="section-heading reveal">
          <p class="eyebrow">Capability Library</p>
          <h2>Suche im Bytewerk-Baukasten.</h2>
          <p>
            Filtere nach Software, Web, App, Daten, Automation oder Shop und finde
            konkrete Bausteine fuer dein naechstes Projekt.
          </p>
        </div>

        <div class="capability-toolbar reveal">
          <label class="search-box">
            <span>Suchen</span>
            <input id="capability-search" type="search" placeholder="z. B. Dashboard, API, Launch, Automatisierung">
          </label>
          <div class="capability-chips" id="capability-chips" aria-label="Capability Filter"></div>
        </div>
        <div class="capability-meta" id="capability-meta">Lade Capabilities...</div>
        <div class="capability-grid" id="capability-grid"></div>
        <button class="button button-secondary load-more" type="button" id="capability-more">Mehr laden</button>
      </section>

      <section class="founder-section" id="gruender">
        <div class="founder-card reveal">
          <div>
            <p class="eyebrow">Gruenderprofil</p>
            <h2>Hijratullah Haqmal verbindet Business, Daten und IT.</h2>
            <p>
              Bytewerk Studio wird von Hijratullah Haqmal als Gruender & CIO aufgebaut.
              Der Hintergrund aus Betriebswirtschaft, Controlling, Datenanalyse, Prozessen
              und IT praegt die Art, wie digitale Loesungen geplant und umgesetzt werden.
            </p>
            <div class="founder-actions">
              <a class="button button-primary" href="https://hhaqmal.de/" target="_blank" rel="noreferrer">Profil auf hhaqmal.de</a>
              <a class="button button-glass-light" href="#kontakt">Mit Bytewerk sprechen</a>
            </div>
          </div>
          <div class="founder-signal" aria-label="Gruender Signal">
            <span>Controlling</span>
            <span>Datenanalyse</span>
            <span>Prozessdenken</span>
            <span>Software</span>
            <span>Automatisierung</span>
            <span>Digitale Produkte</span>
          </div>
        </div>
      </section>

      <section class="section stack-section">
        <div class="section-heading reveal">
          <p class="eyebrow">Stack</p>
          <h2>Technologien mit Praxisblick.</h2>
          <p>
            Der Stack bleibt bewusst pragmatisch: schnell genug fuer Launches,
            strukturiert genug fuer Wachstum und anschlussfaehig fuer Daten und Prozesse.
          </p>
        </div>
        <div class="stack-cloud" id="stack-cloud"></div>
      </section>

      <section class="calculator-section" id="rechner">
        <div class="section-heading reveal">
          <p class="eyebrow">Projektrechner</p>
          <h2>Schätze Projektumfang und Nutzen direkt auf der Seite.</h2>
        </div>
        <div class="calculator-grid">
          <form class="calculator-card reveal" id="estimate-form">
            <h3>Projekt-Scope</h3>
            <label>
              Projekttyp
              <select id="project-type">
                <option value="website">Premium Website</option>
                <option value="software">Software / Tool</option>
                <option value="app">App / PWA</option>
                <option value="automation">Automation</option>
                <option value="shop">Digitaler Produktshop</option>
              </select>
            </label>
            <label>
              Umfang
              <input id="project-scope" type="range" min="1" max="10" value="6">
            </label>
            <label>
              Geschwindigkeit
              <select id="project-speed">
                <option value="normal">Normal</option>
                <option value="fast">Schneller Launch</option>
                <option value="deep">Mehr Strategie & System</option>
              </select>
            </label>
            <label class="check-row">
              <input id="project-integrations" type="checkbox" checked>
              Schnittstellen oder Automationen einplanen
            </label>
            <output class="estimate-output" id="estimate-output">Berechnung wird geladen...</output>
          </form>

          <form class="calculator-card reveal" id="roi-form">
            <h3>Automation-Nutzen</h3>
            <label>
              Stunden pro Woche
              <input id="roi-hours" type="number" min="1" max="80" value="8">
            </label>
            <label>
              Interner Stundensatz
              <input id="roi-rate" type="number" min="10" max="250" value="65">
            </label>
            <label>
              Automatisierbarer Anteil
              <input id="roi-percent" type="range" min="10" max="90" value="45">
            </label>
            <output class="estimate-output" id="roi-output">Berechnung wird geladen...</output>
          </form>
        </div>
      </section>

      <section class="process-section">
        <div class="section-heading reveal">
          <p class="eyebrow">Arbeitsweise</p>
          <h2>Von der Idee bis zum Betrieb in sechs klaren Phasen.</h2>
        </div>
        <div class="process-grid">
${renderProcess()}
        </div>
      </section>

      <section class="product-section" id="shop">
        <div class="section-heading reveal">
          <p class="eyebrow">Digitaler Shop</p>
          <h2>Produktmodule fuer den spaeteren Online-Shop.</h2>
          <p>
            Die Website enthaelt bereits eine erweiterbare Produktlogik fuer digitale Downloads,
            Templates und Workflow-Pakete.
          </p>
        </div>
        <div class="product-toolbar reveal">
          <select id="product-filter" aria-label="Produktfamilie filtern">
            <option value="all">Alle Produktfamilien</option>
          </select>
          <span id="product-count">0 Produkte</span>
        </div>
        <div class="product-grid" id="product-grid"></div>
      </section>

      <section class="brief-section">
        <div class="section-heading reveal">
          <p class="eyebrow">Brief Builder</p>
          <h2>Erstelle in 60 Sekunden eine Projektanfrage.</h2>
        </div>
        <form class="brief-form reveal" id="brief-form">
          <label>
            Name / Unternehmen
            <input id="brief-name" type="text" placeholder="z. B. Bytewerk Projekt">
          </label>
          <label>
            Ziel
            <textarea id="brief-goal" rows="4" placeholder="Was soll entstehen? Website, App, Software, Automation..."></textarea>
          </label>
          <label>
            Wichtigste Funktion
            <input id="brief-feature" type="text" placeholder="z. B. Anfrageformular, Dashboard, Produktshop">
          </label>
          <div class="brief-actions">
            <button class="button button-primary" type="submit">E-Mail vorbereiten</button>
            <button class="button button-secondary" type="button" id="brief-copy">Brief kopieren</button>
          </div>
          <p class="form-note" id="brief-note">Noch kein Brief erstellt.</p>
        </form>
      </section>

      <section class="faq-section">
        <div class="section-heading reveal">
          <p class="eyebrow">FAQ</p>
          <h2>Kurze Antworten vor dem ersten Gespraech.</h2>
        </div>
        <div class="faq-list" id="faq-list"></div>
      </section>

      <section class="contact-section" id="kontakt">
        <div class="contact-copy reveal">
          <p class="eyebrow">Kontakt</p>
          <h2>Bereit fuer ein digitales Produkt mit Substanz?</h2>
          <p>
            Schreib Bytewerk Studio, wenn eine Website, App, Softwareloesung,
            Automation oder ein digitaler Produktshop entstehen soll.
          </p>
        </div>
        <div class="contact-card reveal">
          <a class="button button-primary" href="mailto:kontakt@bytewerkstudio.com">kontakt@bytewerkstudio.com</a>
          <a class="button button-glass-light" href="https://github.com/bytewerkstudio/bytewerkstudio" target="_blank" rel="noreferrer">GitHub Repository</a>
        </div>
      </section>
    </main>

    <button class="back-to-top" type="button" data-back-top aria-label="Zurueck nach oben">↑</button>

    <div class="command-palette" data-command-palette aria-hidden="true">
      <div class="command-dialog" role="dialog" aria-modal="true" aria-label="Schnellnavigation">
        <div class="command-head">
          <strong>Schnellnavigation</strong>
          <button type="button" data-command-close aria-label="Schliessen">×</button>
        </div>
        <input id="command-input" type="search" placeholder="Springe zu Leistungen, Rechner, Kontakt...">
        <div class="command-results" id="command-results"></div>
      </div>
    </div>

    <footer class="site-footer">
      <span>© <span id="year">2026</span> Bytewerk Studio</span>
      <span>Gruender & CIO: <a href="https://hhaqmal.de/" target="_blank" rel="noreferrer">Hijratullah Haqmal</a></span>
      <span>Software. Web. Apps. Digitale Produkte.</span>
    </footer>
  </body>
</html>
`;

const css = String.raw`
:root {
  --ink: #17201f;
  --ink-2: #263331;
  --muted: #667370;
  --muted-2: #87918e;
  --paper: #fbfaf5;
  --paper-2: #f2f0e8;
  --panel: rgba(255, 255, 255, 0.86);
  --solid-panel: #ffffff;
  --line: rgba(23, 32, 31, 0.12);
  --line-strong: rgba(23, 32, 31, 0.2);
  --accent: #0f766e;
  --accent-2: #13a085;
  --accent-soft: #dceee9;
  --warm: #eab85f;
  --coral: #d87457;
  --blue: #3a78a1;
  --violet: #7662a8;
  --green: #638d4f;
  --shadow: 0 24px 70px rgba(36, 42, 39, 0.14);
  --shadow-soft: 0 18px 44px rgba(36, 42, 39, 0.09);
  --radius: 8px;
  --header-height: 76px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  line-height: 1.6;
}

body.is-menu-open,
body.is-command-open {
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

img,
canvas {
  display: block;
  max-width: 100%;
}

::selection {
  color: #fff;
  background: var(--accent);
}

.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 999;
  transform: translateY(-180%);
  padding: 10px 14px;
  border-radius: var(--radius);
  color: #fff;
  background: var(--ink);
}

.skip-link:focus {
  transform: translateY(0);
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  width: 100%;
  height: 3px;
  background: transparent;
}

.scroll-progress span {
  display: block;
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--warm), var(--coral));
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 22px;
  align-items: center;
  min-height: var(--header-height);
  padding: 14px clamp(18px, 4vw, 68px);
  border-bottom: 1px solid rgba(23, 32, 31, 0.1);
  background: rgba(251, 250, 245, 0.88);
  backdrop-filter: blur(18px);
}

.site-header.is-scrolled {
  box-shadow: 0 14px 34px rgba(23, 32, 31, 0.08);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: var(--radius);
  color: #fff;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.28), transparent 34%),
    linear-gradient(135deg, var(--ink), #0f3f39);
  box-shadow: inset 0 -4px 0 rgba(255, 255, 255, 0.12);
  font-weight: 900;
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  line-height: 1.1;
  font-weight: 900;
}

.brand small {
  color: var(--muted);
  font-size: 0.78rem;
}

.site-nav {
  display: flex;
  justify-content: center;
  gap: clamp(12px, 2vw, 26px);
}

.site-nav a {
  position: relative;
  color: var(--muted);
  font-size: 0.94rem;
  font-weight: 750;
}

.site-nav a::after {
  position: absolute;
  right: 0;
  bottom: -8px;
  left: 0;
  height: 2px;
  transform: scaleX(0);
  transform-origin: center;
  background: var(--accent);
  content: "";
  transition: transform 180ms ease;
}

.site-nav a:hover,
.site-nav a.is-active {
  color: var(--ink);
}

.site-nav a:hover::after,
.site-nav a.is-active::after {
  transform: scaleX(1);
}

.command-open,
.nav-toggle {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ink);
  background: rgba(255, 255, 255, 0.74);
}

.command-open {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 750;
}

.command-open span {
  padding: 2px 6px;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--ink);
  background: var(--paper-2);
}

.nav-toggle {
  display: none;
  width: 44px;
  height: 40px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
}

.nav-toggle span {
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--ink);
}

.hero {
  position: relative;
  min-height: calc(100vh - var(--header-height));
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 15% 10%, rgba(234, 184, 95, 0.55), transparent 28%),
    radial-gradient(circle at 85% 20%, rgba(19, 160, 133, 0.4), transparent 34%),
    linear-gradient(135deg, #102522, #20312e 42%, #2d3328);
}

#hero-canvas,
.hero-shade {
  position: absolute;
  inset: 0;
}

#hero-canvas {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.hero-shade {
  background:
    linear-gradient(90deg, rgba(10, 18, 16, 0.84), rgba(10, 18, 16, 0.28) 58%, rgba(10, 18, 16, 0.5)),
    linear-gradient(0deg, rgba(10, 18, 16, 0.42), transparent 38%);
}

.hero-inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.78fr);
  gap: clamp(28px, 6vw, 82px);
  align-items: center;
  min-height: calc(100vh - var(--header-height));
  padding: clamp(70px, 11vw, 142px) clamp(20px, 5vw, 72px);
}

.hero-content {
  max-width: 920px;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--accent-2);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero .eyebrow {
  color: #93f2d5;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1,
h2 {
  letter-spacing: 0;
  line-height: 1.04;
}

h1 {
  max-width: 900px;
  margin-bottom: 24px;
  font-size: clamp(3.2rem, 8vw, 7.6rem);
}

h2 {
  margin-bottom: 18px;
  font-size: clamp(2.2rem, 5vw, 4.6rem);
}

h3 {
  margin-bottom: 12px;
  font-size: 1.18rem;
  line-height: 1.2;
}

.hero-text {
  max-width: 720px;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.78);
  font-size: clamp(1.08rem, 2vw, 1.34rem);
}

.hero-actions,
.founder-actions,
.brief-actions,
.contact-card {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 12px 18px;
  font-weight: 850;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border 160ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--accent), #10967b);
  box-shadow: 0 18px 36px rgba(15, 118, 110, 0.26);
}

.button-secondary {
  border-color: var(--line);
  color: var(--ink);
  background: var(--solid-panel);
}

.button-glass {
  border-color: rgba(255, 255, 255, 0.24);
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
}

.button-glass-light {
  border-color: rgba(255, 255, 255, 0.26);
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.hero-console {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(20px);
}

.console-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.console-bar span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
}

.console-bar strong {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.82rem;
}

.console-lines {
  padding: 18px;
}

.console-lines p {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin: 0;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.82);
}

.console-lines p:last-child {
  border-bottom: 0;
}

.console-lines span {
  color: #93f2d5;
  font-weight: 900;
}

.console-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.console-metric strong {
  font-size: 3rem;
  line-height: 1;
}

.console-metric span {
  color: rgba(255, 255, 255, 0.76);
}

.metric-band {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid var(--line);
  background: var(--solid-panel);
}

.metric-band div {
  padding: clamp(22px, 4vw, 40px);
  border-right: 1px solid var(--line);
}

.metric-band div:last-child {
  border-right: 0;
}

.metric-band strong {
  display: block;
  font-size: clamp(2.1rem, 5vw, 4rem);
  line-height: 1;
}

.metric-band span {
  color: var(--muted);
  font-weight: 750;
}

.section,
.studio-os,
.capability-section,
.founder-section,
.calculator-section,
.process-section,
.product-section,
.brief-section,
.faq-section,
.contact-section {
  padding: clamp(64px, 9vw, 118px) clamp(20px, 5vw, 72px);
}

.section-heading {
  max-width: 860px;
}

.section-heading p:not(.eyebrow) {
  color: var(--muted);
  font-size: clamp(1rem, 1.8vw, 1.18rem);
}

.filter-row,
.capability-chips,
.product-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-row {
  margin: 32px 0 22px;
}

.chip {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 14px;
  color: var(--muted);
  background: var(--solid-panel);
  font-size: 0.92rem;
  font-weight: 800;
}

.chip.is-active,
.chip:hover {
  color: #fff;
  border-color: var(--accent);
  background: var(--accent);
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.service-card,
.calculator-card,
.product-card,
.faq-item,
.process-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow: var(--shadow-soft);
}

.service-card {
  min-height: 320px;
  padding: 24px;
}

.service-card__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.service-number {
  color: var(--accent);
  font-weight: 900;
}

.service-tag {
  border-radius: 999px;
  padding: 4px 8px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 0.78rem;
  font-weight: 900;
}

.service-card p,
.service-card li,
.process-card p,
.calculator-card label,
.faq-item p,
.product-card p {
  color: var(--muted);
}

.service-card ul {
  display: grid;
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.service-card li {
  position: relative;
  padding-left: 18px;
}

.service-card li::before {
  position: absolute;
  top: 0.65em;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--warm);
  content: "";
}

.studio-os {
  background:
    linear-gradient(135deg, rgba(220, 238, 233, 0.72), rgba(251, 250, 245, 0.8)),
    var(--paper-2);
}

.os-layout {
  display: grid;
  grid-template-columns: minmax(240px, 0.45fr) minmax(0, 1fr);
  gap: 20px;
  margin-top: 34px;
}

.os-tabs {
  display: grid;
  gap: 10px;
}

.os-tab {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  text-align: left;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.66);
  font-weight: 900;
}

.os-tab span {
  display: block;
  margin-bottom: 4px;
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.os-tab.is-active {
  color: #fff;
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent), #0f9f84);
}

.os-tab.is-active span {
  color: rgba(255, 255, 255, 0.78);
}

.os-panels {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  border-radius: var(--radius);
}

.os-panel {
  display: none;
  min-height: 330px;
  padding: clamp(26px, 5vw, 54px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 85% 20%, rgba(234, 184, 95, 0.3), transparent 30%),
    var(--solid-panel);
  box-shadow: var(--shadow);
}

.os-panel.is-active {
  display: block;
}

.os-panel h3 {
  max-width: 760px;
  font-size: clamp(2rem, 5vw, 4rem);
}

.os-panel p:not(.eyebrow) {
  max-width: 680px;
  color: var(--muted);
  font-size: 1.12rem;
}

.capability-section {
  background: var(--paper);
}

.capability-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 0.55fr) 1fr;
  gap: 18px;
  align-items: end;
  margin-top: 32px;
}

.search-box,
.calculator-card label,
.brief-form label {
  display: grid;
  gap: 8px;
  color: var(--ink);
  font-weight: 850;
}

.search-box input,
.calculator-card input,
.calculator-card select,
.brief-form input,
.brief-form textarea,
.product-toolbar select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 13px 14px;
  color: var(--ink);
  background: var(--solid-panel);
  outline: none;
}

.search-box input:focus,
.calculator-card input:focus,
.calculator-card select:focus,
.brief-form input:focus,
.brief-form textarea:focus,
.product-toolbar select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.13);
}

.capability-meta {
  margin: 20px 0;
  color: var(--muted);
  font-weight: 750;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.capability-card {
  display: grid;
  gap: 14px;
  min-height: 290px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px;
  background: var(--solid-panel);
}

.capability-card[data-tone="teal"] {
  border-top: 4px solid var(--accent);
}

.capability-card[data-tone="amber"] {
  border-top: 4px solid var(--warm);
}

.capability-card[data-tone="coral"] {
  border-top: 4px solid var(--coral);
}

.capability-card[data-tone="blue"] {
  border-top: 4px solid var(--blue);
}

.capability-card[data-tone="green"] {
  border-top: 4px solid var(--green);
}

.capability-card[data-tone="violet"] {
  border-top: 4px solid var(--violet);
}

.capability-card__meta,
.product-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  border-radius: 999px;
  padding: 4px 8px;
  color: var(--muted);
  background: var(--paper-2);
  font-size: 0.75rem;
  font-weight: 850;
}

.capability-card p {
  margin: 0;
  color: var(--muted);
}

.capability-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.capability-tools span {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.74rem;
  font-weight: 800;
}

.load-more {
  margin-top: 22px;
}

.founder-section {
  background: var(--ink);
}

.founder-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.7fr);
  gap: clamp(24px, 5vw, 70px);
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius);
  padding: clamp(28px, 6vw, 70px);
  color: #fff;
  background:
    radial-gradient(circle at 15% 20%, rgba(19, 160, 133, 0.35), transparent 35%),
    radial-gradient(circle at 90% 10%, rgba(234, 184, 95, 0.24), transparent 26%),
    #17201f;
  box-shadow: var(--shadow);
}

.founder-card .eyebrow {
  color: #93f2d5;
}

.founder-card p {
  color: rgba(255, 255, 255, 0.74);
  font-size: 1.1rem;
}

.founder-signal {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.founder-signal span {
  min-height: 86px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius);
  padding: 14px;
  text-align: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.stack-cloud {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
}

.stack-item {
  min-height: 150px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  background: var(--solid-panel);
}

.stack-item strong {
  display: block;
  margin-bottom: 10px;
}

.stack-item span {
  color: var(--muted);
  font-size: 0.92rem;
}

.calculator-section {
  background: var(--paper-2);
}

.calculator-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 34px;
}

.calculator-card {
  display: grid;
  gap: 18px;
  padding: 24px;
}

.check-row {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.check-row input {
  width: auto;
}

.estimate-output {
  display: block;
  border-radius: var(--radius);
  padding: 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--ink), #153c37);
  font-weight: 850;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 34px;
}

.process-card {
  padding: 24px;
  background: var(--solid-panel);
}

.process-card span {
  display: inline-flex;
  margin-bottom: 26px;
  color: var(--accent);
  font-weight: 950;
}

.product-section {
  background: var(--paper);
}

.product-toolbar {
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 18px;
}

.product-toolbar select {
  max-width: 320px;
}

.product-toolbar span {
  color: var(--muted);
  font-weight: 850;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.product-price {
  font-size: 2rem;
  font-weight: 950;
}

.product-card ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-card li {
  color: var(--muted);
  font-size: 0.92rem;
}

.brief-section {
  background:
    linear-gradient(135deg, rgba(220, 238, 233, 0.72), rgba(251, 250, 245, 0.88)),
    var(--paper-2);
}

.brief-form {
  display: grid;
  gap: 18px;
  max-width: 880px;
  margin-top: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(22px, 4vw, 36px);
  background: var(--solid-panel);
  box-shadow: var(--shadow-soft);
}

.form-note {
  margin: 0;
  color: var(--muted);
}

.faq-list {
  display: grid;
  gap: 10px;
  max-width: 960px;
  margin-top: 34px;
}

.faq-item {
  overflow: hidden;
}

.faq-item button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 0;
  padding: 20px;
  color: var(--ink);
  background: transparent;
  text-align: left;
  font-weight: 900;
}

.faq-item button span {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background: var(--paper-2);
}

.faq-item p {
  display: none;
  margin: 0;
  padding: 0 20px 20px;
}

.faq-item.is-open p {
  display: block;
}

.contact-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  color: #fff;
  background:
    radial-gradient(circle at 80% 20%, rgba(234, 184, 95, 0.26), transparent 30%),
    linear-gradient(135deg, #17201f, #123832);
}

.contact-section .eyebrow {
  color: #93f2d5;
}

.contact-copy {
  max-width: 840px;
}

.contact-copy p:not(.eyebrow) {
  color: rgba(255, 255, 255, 0.76);
  font-size: 1.1rem;
}

.site-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14px;
  padding: 24px clamp(20px, 5vw, 72px);
  color: rgba(255, 255, 255, 0.7);
  background: #111916;
}

.site-footer a {
  color: #93f2d5;
}

.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 90;
  width: 46px;
  height: 46px;
  transform: translateY(90px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: #fff;
  background: var(--accent);
  box-shadow: var(--shadow-soft);
  transition: transform 180ms ease;
}

.back-to-top.is-visible {
  transform: translateY(0);
}

.command-palette {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: none;
  place-items: start center;
  padding: 10vh 20px 20px;
  background: rgba(17, 25, 22, 0.58);
  backdrop-filter: blur(12px);
}

.command-palette.is-open {
  display: grid;
}

.command-dialog {
  width: min(680px, 100%);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius);
  background: var(--solid-panel);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.3);
}

.command-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.command-head button {
  border: 0;
  border-radius: 999px;
  width: 34px;
  height: 34px;
  background: var(--paper-2);
}

#command-input {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--line);
  padding: 18px;
  outline: none;
}

.command-results {
  display: grid;
  max-height: 360px;
  overflow: auto;
  padding: 8px;
}

.command-result {
  display: grid;
  gap: 4px;
  border: 0;
  border-radius: var(--radius);
  padding: 12px;
  color: var(--ink);
  background: transparent;
  text-align: left;
}

.command-result:hover,
.command-result.is-selected {
  background: var(--paper-2);
}

.command-result span {
  color: var(--muted);
  font-size: 0.84rem;
}

.reveal {
  transform: translateY(22px);
  opacity: 0;
  transition: opacity 620ms ease, transform 620ms ease;
}

.reveal.is-visible {
  transform: translateY(0);
  opacity: 1;
}

${generatedMotionClasses()}

@media (max-width: 1180px) {
  .service-grid,
  .capability-grid,
  .process-grid,
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stack-cloud {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 920px) {
  .site-header {
    grid-template-columns: auto auto;
  }

  .nav-toggle {
    display: inline-flex;
    justify-self: end;
  }

  .command-open {
    display: none;
  }

  .site-nav {
    position: fixed;
    top: var(--header-height);
    right: 14px;
    left: 14px;
    display: none;
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--solid-panel);
    box-shadow: var(--shadow);
  }

  .site-nav.is-open {
    display: flex;
  }

  .site-nav a {
    padding: 10px;
  }

  .hero-inner,
  .founder-card,
  .calculator-grid,
  .contact-section,
  .capability-toolbar,
  .os-layout {
    grid-template-columns: 1fr;
  }

  .metric-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .brand {
    min-width: 0;
  }

  .brand small {
    display: none;
  }

  h1 {
    font-size: 3rem;
  }

  .hero-inner {
    min-height: auto;
    padding-top: 70px;
    padding-bottom: 70px;
  }

  .service-grid,
  .capability-grid,
  .process-grid,
  .product-grid,
  .stack-cloud,
  .metric-band,
  .founder-signal {
    grid-template-columns: 1fr;
  }

  .metric-band div {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .console-lines p {
    flex-direction: column;
    gap: 2px;
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
`;

const app = String.raw`
const BytewerkStudio = (() => {
  const capabilities = [
${capabilityRecords.map((record) => objectLiteral(record)).join("\n")}
  ];

  const products = [
${productRecords.map((record) => productLiteral(record)).join("\n")}
  ];

  const stack = [
${stackItems.map((record) => stackLiteral(record)).join("\n")}
  ];

  const faqs = [
${faqItems.map((record) => faqLiteral(record)).join("\n")}
  ];

  const commands = [
    { label: "Startseite", hint: "Hero und Studio-Ueberblick", target: "#top" },
    { label: "Leistungen", hint: "Software, Web, Apps, IT und Shop", target: "#leistungen" },
    { label: "Studio OS", hint: "Projekt-System und Betriebslogik", target: "#studio-os" },
    { label: "Capability Library", hint: "Durchsuche 360 Bausteine", target: "#capabilities" },
    { label: "Gruender", hint: "Hijratullah Haqmal und hhaqmal.de", target: "#gruender" },
    { label: "Projektrechner", hint: "Scope und Nutzen schaetzen", target: "#rechner" },
    { label: "Digitaler Shop", hint: "Produktmodule und Templates", target: "#shop" },
    { label: "Kontakt", hint: "Projektanfrage starten", target: "#kontakt" },
  ];

  const state = {
    capabilityArea: "Alle",
    capabilityVisible: 18,
    productFamily: "all",
    commandIndex: 0,
  };

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatEuro(value) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(Math.round(value));
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function smoothGo(target) {
    const element = qs(target);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initYear() {
    const year = qs("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initHeader() {
    const header = qs("[data-header]");
    const nav = qs("#site-nav");
    const toggle = qs(".nav-toggle");
    if (!header || !nav || !toggle) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    qsa("a", nav).forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        document.body.classList.remove("is-menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initScrollProgress() {
    const bar = qs(".scroll-progress span");
    if (!bar) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max <= 0 ? 0 : (window.scrollY / max) * 100;
      bar.style.width = clamp(progress, 0, 100) + "%";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initNavigationSpy() {
    const links = qsa(".site-nav a");
    const sections = links
      .map((link) => {
        const id = link.getAttribute("href");
        return { link, section: id && id.startsWith("#") ? qs(id) : null };
      })
      .filter((item) => item.section);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.classList.remove("is-active"));
          const active = sections.find((item) => item.section === entry.target);
          if (active) active.link.classList.add("is-active");
        });
      },
      { rootMargin: "-40% 0px -52% 0px", threshold: 0.01 }
    );

    sections.forEach((item) => observer.observe(item.section));
  }

  function initReveal() {
    const items = qsa(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((item) => observer.observe(item));
  }

  function initCounters() {
    const counters = qsa("[data-counter]");
    if (!counters.length) return;

    const animate = (node) => {
      const target = Number(node.dataset.counter || "0");
      const start = performance.now();
      const duration = 900 + Math.min(target, 2500) * 0.25;

      const tick = (now) => {
        const progress = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = formatNumber(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initHeroCanvas() {
    const canvas = qs("#hero-canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, active: false };
    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = createParticles();
    }

    function createParticles() {
      const count = Math.round(clamp(width / 18, 42, 110));
      return Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: 1 + Math.random() * 2.4,
        hue: index % 3 === 0 ? 164 : index % 3 === 1 ? 42 : 16,
      }));
    }

    function drawGrid() {
      context.save();
      context.globalAlpha = 0.15;
      context.strokeStyle = "#ffffff";
      context.lineWidth = 1;
      const gap = 72;
      for (let x = -gap; x < width + gap; x += gap) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + gap * 0.6, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += gap) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y + gap * 0.3);
        context.stroke();
      }
      context.restore();
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 118) continue;
          context.globalAlpha = (1 - distance / 118) * 0.26;
          context.strokeStyle = "#b7f7e4";
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    }

    function drawParticles() {
      particles.forEach((particle) => {
        if (!reduced) {
          particle.x += particle.vx;
          particle.y += particle.vy;
        }
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const dx = particle.x - pointer.x * width;
        const dy = particle.y - pointer.y * height;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const pulse = pointer.active ? clamp(1 - distance / 220, 0, 1) : 0;
        const radius = particle.radius + pulse * 4;

        context.beginPath();
        context.fillStyle = "hsla(" + particle.hue + ", 72%, 74%, " + (0.54 + pulse * 0.32) + ")";
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fill();
      });
    }

    function frame() {
      context.clearRect(0, 0, width, height);
      drawGrid();
      drawConnections();
      drawParticles();
      raf = requestAnimationFrame(frame);
    }

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    });

    canvas.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    resize();
    frame();
    window.addEventListener("resize", resize);
    window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
  }

  function initServiceFilters() {
    const buttons = qsa("[data-service-filter]");
    const cards = qsa("[data-filter-card]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.serviceFilter;
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        cards.forEach((card) => {
          const visible = filter === "all" || card.dataset.filterCard === filter;
          card.hidden = !visible;
        });
      });
    });
  }

  function initStudioOs() {
    const tabs = qsa("[data-os-tab]");
    const panels = qsa("[data-os-panel]");
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.osTab;
        tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
        panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.osPanel === id));
      });
    });
  }

  function getCapabilityFilters() {
    return ["Alle"].concat(unique(capabilities.map((item) => item.area)));
  }

  function initCapabilityChips() {
    const wrapper = qs("#capability-chips");
    if (!wrapper) return;
    wrapper.innerHTML = getCapabilityFilters()
      .map((area) => {
        const active = area === state.capabilityArea ? " is-active" : "";
        return '<button class="chip' + active + '" type="button" data-capability-area="' + escapeHtml(area) + '">' + escapeHtml(area) + "</button>";
      })
      .join("");

    qsa("[data-capability-area]", wrapper).forEach((button) => {
      button.addEventListener("click", () => {
        state.capabilityArea = button.dataset.capabilityArea || "Alle";
        state.capabilityVisible = 18;
        initCapabilityChips();
        renderCapabilities();
      });
    });
  }

  function filterCapabilities() {
    const query = (qs("#capability-search")?.value || "").trim().toLowerCase();
    return capabilities.filter((item) => {
      const areaMatch = state.capabilityArea === "Alle" || item.area === state.capabilityArea;
      const haystack = [
        item.area,
        item.stage,
        item.effort,
        item.title,
        item.problem,
        item.outcome,
        item.tools.join(" "),
        item.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return areaMatch && (!query || haystack.includes(query));
    });
  }

  function renderCapabilityCard(item) {
    return [
      '<article class="capability-card" data-tone="' + escapeHtml(item.tone) + '">',
      '  <div class="capability-card__meta">',
      '    <span class="pill">' + escapeHtml(item.area) + "</span>",
      '    <span class="pill">' + escapeHtml(item.stage) + "</span>",
      '    <span class="pill">Scope ' + escapeHtml(item.effort) + "</span>",
      "  </div>",
      "  <h3>" + escapeHtml(item.title) + "</h3>",
      "  <p>" + escapeHtml(item.problem) + "</p>",
      "  <p>" + escapeHtml(item.outcome) + "</p>",
      '  <div class="capability-tools">',
      item.tools.map((tool) => "    <span>" + escapeHtml(tool) + "</span>").join(""),
      "  </div>",
      "</article>",
    ].join("");
  }

  function renderCapabilities() {
    const grid = qs("#capability-grid");
    const meta = qs("#capability-meta");
    const more = qs("#capability-more");
    if (!grid || !meta || !more) return;

    const filtered = filterCapabilities();
    const visible = filtered.slice(0, state.capabilityVisible);
    grid.innerHTML = visible.map(renderCapabilityCard).join("");
    meta.textContent =
      formatNumber(filtered.length) +
      " passende Bausteine · " +
      formatNumber(capabilities.length) +
      " Capabilities insgesamt";
    more.hidden = state.capabilityVisible >= filtered.length;
  }

  function initCapabilityLab() {
    initCapabilityChips();
    const search = qs("#capability-search");
    const more = qs("#capability-more");

    if (search) {
      search.addEventListener("input", () => {
        state.capabilityVisible = 18;
        renderCapabilities();
      });
    }

    if (more) {
      more.addEventListener("click", () => {
        state.capabilityVisible += 18;
        renderCapabilities();
      });
    }

    renderCapabilities();
  }

  function initStackCloud() {
    const target = qs("#stack-cloud");
    if (!target) return;

    target.innerHTML = stack
      .map((item, index) => {
        return [
          '<article class="stack-item reveal surface-tone-' + ((index % 120) + 1) + '">',
          "  <strong>" + escapeHtml(item.name) + "</strong>",
          "  <span>" + escapeHtml(item.copy) + "</span>",
          "</article>",
        ].join("");
      })
      .join("");
  }

  function initEstimator() {
    const form = qs("#estimate-form");
    if (!form) return;
    const type = qs("#project-type", form);
    const scope = qs("#project-scope", form);
    const speed = qs("#project-speed", form);
    const integrations = qs("#project-integrations", form);
    const output = qs("#estimate-output", form);

    const base = {
      website: { min: 1800, max: 6200, weeks: 3, label: "Premium Website" },
      software: { min: 4800, max: 18000, weeks: 7, label: "Software / Tool" },
      app: { min: 5200, max: 22000, weeks: 8, label: "App / PWA" },
      automation: { min: 1200, max: 7600, weeks: 3, label: "Automation" },
      shop: { min: 2600, max: 12000, weeks: 5, label: "Digitaler Produktshop" },
    };

    function calculate() {
      const selected = base[type.value] || base.website;
      const scopeValue = Number(scope.value);
      const speedFactor = speed.value === "fast" ? 1.22 : speed.value === "deep" ? 1.35 : 1;
      const integrationFactor = integrations.checked ? 1.18 : 1;
      const complexity = 0.62 + scopeValue / 10;
      const min = selected.min * complexity * speedFactor * integrationFactor;
      const max = selected.max * complexity * speedFactor * integrationFactor;
      const weeks = Math.ceil(selected.weeks * complexity * (speed.value === "fast" ? 0.78 : speed.value === "deep" ? 1.28 : 1));
      output.textContent =
        selected.label +
        ": ca. " +
        weeks +
        " Wochen · grober Rahmen " +
        formatEuro(min) +
        " bis " +
        formatEuro(max) +
        ".";
    }

    [type, scope, speed, integrations].forEach((control) => {
      if (control) control.addEventListener("input", calculate);
      if (control) control.addEventListener("change", calculate);
    });

    calculate();
  }

  function initRoiCalculator() {
    const form = qs("#roi-form");
    if (!form) return;
    const hours = qs("#roi-hours", form);
    const rate = qs("#roi-rate", form);
    const percent = qs("#roi-percent", form);
    const output = qs("#roi-output", form);

    function calculate() {
      const h = clamp(Number(hours.value || 0), 0, 100);
      const r = clamp(Number(rate.value || 0), 0, 500);
      const p = clamp(Number(percent.value || 0), 0, 100) / 100;
      const weekly = h * r * p;
      const monthly = weekly * 4.33;
      const yearly = weekly * 52;
      output.textContent =
        "Potenzial: ca. " +
        formatEuro(monthly) +
        " pro Monat oder " +
        formatEuro(yearly) +
        " pro Jahr bei " +
        Math.round(p * 100) +
        "% Automatisierung.";
    }

    [hours, rate, percent].forEach((control) => {
      if (control) control.addEventListener("input", calculate);
      if (control) control.addEventListener("change", calculate);
    });

    calculate();
  }

  function getProductFamilies() {
    return unique(products.map((item) => item.family));
  }

  function initProductFilter() {
    const filter = qs("#product-filter");
    if (!filter) return;

    getProductFamilies().forEach((family) => {
      const option = document.createElement("option");
      option.value = family;
      option.textContent = family;
      filter.appendChild(option);
    });

    filter.addEventListener("change", () => {
      state.productFamily = filter.value;
      renderProducts();
    });
  }

  function renderProductCard(item) {
    return [
      '<article class="product-card">',
      '  <div class="product-card__meta">',
      '    <span class="pill">' + escapeHtml(item.family) + "</span>",
      '    <span class="pill">' + escapeHtml(item.format) + "</span>",
      '    <span class="pill">' + escapeHtml(item.level) + "</span>",
      "  </div>",
      "  <h3>" + escapeHtml(item.title) + "</h3>",
      "  <p>" + escapeHtml(item.description) + "</p>",
      '  <div class="product-price">' + formatEuro(item.price) + "</div>",
      "  <ul>",
      item.includes.map((entry) => "    <li>" + escapeHtml(entry) + "</li>").join(""),
      "  </ul>",
      "</article>",
    ].join("");
  }

  function renderProducts() {
    const grid = qs("#product-grid");
    const count = qs("#product-count");
    if (!grid || !count) return;

    const filtered =
      state.productFamily === "all"
        ? products.slice(0, 18)
        : products.filter((item) => item.family === state.productFamily).slice(0, 18);
    grid.innerHTML = filtered.map(renderProductCard).join("");
    count.textContent = formatNumber(filtered.length) + " sichtbare Produkte · " + formatNumber(products.length) + " vorbereitet";
  }

  function initProducts() {
    initProductFilter();
    renderProducts();
  }

  function initFaq() {
    const list = qs("#faq-list");
    if (!list) return;

    list.innerHTML = faqs
      .map((item, index) => {
        return [
          '<article class="faq-item' + (index === 0 ? " is-open" : "") + '">',
          '  <button type="button" aria-expanded="' + (index === 0 ? "true" : "false") + '">',
          "    " + escapeHtml(item.question),
          "    <span>+</span>",
          "  </button>",
          "  <p>" + escapeHtml(item.answer) + "</p>",
          "</article>",
        ].join("");
      })
      .join("");

    qsa(".faq-item button", list).forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function buildBriefText() {
    const name = qs("#brief-name")?.value.trim() || "Neues Bytewerk-Projekt";
    const goal = qs("#brief-goal")?.value.trim() || "Ich moechte ein digitales Projekt starten.";
    const feature = qs("#brief-feature")?.value.trim() || "Die wichtigste Funktion ist noch offen.";
    return [
      "Projektanfrage fuer Bytewerk Studio",
      "",
      "Name / Unternehmen: " + name,
      "Ziel: " + goal,
      "Wichtigste Funktion: " + feature,
      "",
      "Bitte um Rueckmeldung zu Vorgehen, Scope und naechsten Schritten.",
    ].join("\n");
  }

  function initBriefBuilder() {
    const form = qs("#brief-form");
    const copy = qs("#brief-copy");
    const note = qs("#brief-note");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const body = encodeURIComponent(buildBriefText());
      window.location.href = "mailto:kontakt@bytewerkstudio.com?subject=Projektanfrage%20Bytewerk%20Studio&body=" + body;
      if (note) note.textContent = "E-Mail wurde vorbereitet.";
    });

    if (copy) {
      copy.addEventListener("click", async () => {
        const text = buildBriefText();
        try {
          await navigator.clipboard.writeText(text);
          if (note) note.textContent = "Projektbrief wurde kopiert.";
        } catch {
          if (note) note.textContent = "Kopieren ist im Browser blockiert. Du kannst den Text manuell markieren.";
        }
      });
    }
  }

  function initBackToTop() {
    const button = qs("[data-back-top]");
    if (!button) return;

    const update = () => {
      button.classList.toggle("is-visible", window.scrollY > 900);
    };

    button.addEventListener("click", () => smoothGo("#top"));
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function getCommandMatches(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) => {
      return (command.label + " " + command.hint + " " + command.target).toLowerCase().includes(normalized);
    });
  }

  function renderCommands() {
    const input = qs("#command-input");
    const results = qs("#command-results");
    if (!input || !results) return;

    const matches = getCommandMatches(input.value);
    state.commandIndex = clamp(state.commandIndex, 0, Math.max(matches.length - 1, 0));
    results.innerHTML = matches
      .map((command, index) => {
        return [
          '<button class="command-result' + (index === state.commandIndex ? " is-selected" : "") + '" type="button" data-command-target="' + escapeHtml(command.target) + '">',
          "  <strong>" + escapeHtml(command.label) + "</strong>",
          "  <span>" + escapeHtml(command.hint) + "</span>",
          "</button>",
        ].join("");
      })
      .join("");

    qsa("[data-command-target]", results).forEach((button) => {
      button.addEventListener("click", () => {
        closeCommandPalette();
        smoothGo(button.dataset.commandTarget);
      });
    });
  }

  function openCommandPalette() {
    const palette = qs("[data-command-palette]");
    const input = qs("#command-input");
    if (!palette || !input) return;
    palette.classList.add("is-open");
    palette.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-command-open");
    state.commandIndex = 0;
    renderCommands();
    requestAnimationFrame(() => input.focus());
  }

  function closeCommandPalette() {
    const palette = qs("[data-command-palette]");
    if (!palette) return;
    palette.classList.remove("is-open");
    palette.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-command-open");
  }

  function initCommandPalette() {
    const open = qs("[data-command-open]");
    const close = qs("[data-command-close]");
    const input = qs("#command-input");
    const palette = qs("[data-command-palette]");

    if (open) open.addEventListener("click", openCommandPalette);
    if (close) close.addEventListener("click", closeCommandPalette);
    if (palette) {
      palette.addEventListener("click", (event) => {
        if (event.target === palette) closeCommandPalette();
      });
    }
    if (input) {
      input.addEventListener("input", () => {
        state.commandIndex = 0;
        renderCommands();
      });
      input.addEventListener("keydown", (event) => {
        const matches = getCommandMatches(input.value);
        if (event.key === "ArrowDown") {
          event.preventDefault();
          state.commandIndex = clamp(state.commandIndex + 1, 0, Math.max(matches.length - 1, 0));
          renderCommands();
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          state.commandIndex = clamp(state.commandIndex - 1, 0, Math.max(matches.length - 1, 0));
          renderCommands();
        }
        if (event.key === "Enter" && matches[state.commandIndex]) {
          event.preventDefault();
          closeCommandPalette();
          smoothGo(matches[state.commandIndex].target);
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const commandKey = event.metaKey || event.ctrlKey;
      if (commandKey && key === "k") {
        event.preventDefault();
        openCommandPalette();
      }
      if (event.key === "Escape") closeCommandPalette();
    });
  }

  function initMagneticButtons() {
    const buttons = qsa(".button");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    buttons.forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = "translate(" + x * 0.06 + "px, " + y * 0.08 + "px)";
      });
      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  function init() {
    initYear();
    initHeader();
    initScrollProgress();
    initNavigationSpy();
    initHeroCanvas();
    initCounters();
    initServiceFilters();
    initStudioOs();
    initStackCloud();
    initCapabilityLab();
    initEstimator();
    initRoiCalculator();
    initProducts();
    initFaq();
    initBriefBuilder();
    initBackToTop();
    initCommandPalette();
    initMagneticButtons();
    initReveal();
  }

  return {
    init,
    data: {
      capabilities,
      products,
      stack,
      faqs,
    },
  };
})();

document.addEventListener("DOMContentLoaded", BytewerkStudio.init);
`;

const page404 = String.raw`
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Seite nicht gefunden | Bytewerk Studio</title>
    <meta name="robots" content="noindex">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="contact-section" style="min-height: 100vh;">
      <div class="contact-copy">
        <p class="eyebrow">404</p>
        <h1>Diese Seite wurde nicht gefunden.</h1>
        <p>Die Startseite von Bytewerk Studio ist weiterhin erreichbar.</p>
      </div>
      <div class="contact-card">
        <a class="button button-primary" href="/">Startseite oeffnen</a>
      </div>
    </main>
  </body>
</html>
`;

const readme = String.raw`
# Bytewerk Studio Website

Website: https://bytewerkstudio.com

Bytewerk Studio entwickelt Software, Websites, Apps, Automationen, IT-Dienstleistungen und digitale Produkte. Gruender & CIO ist Hijratullah Haqmal, mit Profil unter https://hhaqmal.de/.

## Inhalte

- Premium-Landingpage mit interaktivem Canvas-Hero
- Servicebereiche fuer Software, Web, Apps, IT, Shop und Daten
- Studio-OS-Sektion fuer Strategie, Build, Growth und digitalen Vertrieb
- Capability Library mit 360 durchsuchbaren Bausteinen
- Projekt-Scope-Rechner und Automation-ROI-Rechner
- Digitaler Produktbereich mit vorbereiteten Template-Paketen
- Brief Builder fuer Projektanfragen
- FAQ, Kontaktbereich, SEO-Dateien und Custom-Domain-Konfiguration

## Deployment

Die Seite wird ueber GitHub Pages aus dem Branch main veroeffentlicht. Die Datei CNAME muss bytewerkstudio.com enthalten.
`;

const robots = String.raw`
User-agent: *
Allow: /

Sitemap: https://bytewerkstudio.com/sitemap.xml
`;

const sitemap = String.raw`
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bytewerkstudio.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

mkdirSync(join(root, "tools"), { recursive: true });
write("index.html", html);
write("styles.css", css);
write("app.js", app);
write("404.html", page404);
write("README.md", readme);
write("robots.txt", robots);
write("sitemap.xml", sitemap);
write(".nojekyll", "");

console.log("Bytewerk Studio site generated.");
console.log(`Capabilities: ${capabilityRecords.length}`);
console.log(`Products: ${productRecords.length}`);
