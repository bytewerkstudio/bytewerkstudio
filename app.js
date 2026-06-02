const BytewerkStudio = (() => {
  const capabilities = [
    {
      id: "cap-001",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "S",
      title: "ein zentrales Arbeitsdashboard fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Audit", "S", "JavaScript"],
    },
    {
      id: "cap-002",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "M",
      title: "eine robuste Prozess-App fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Konzept", "M", "APIs"],
    },
    {
      id: "cap-003",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "L",
      title: "ein sauberer MVP fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "MVP", "L", "SQL"],
    },
    {
      id: "cap-004",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "XL",
      title: "ein integriertes Backoffice fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Launch", "XL", "Automationen"],
    },
    {
      id: "cap-005",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "S",
      title: "ein wartbares SaaS-Fundament fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Scale", "S", "GitHub"],
    },
    {
      id: "cap-006",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "S",
      title: "eine schnelle Website fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Audit", "S", "HTML"],
    },
    {
      id: "cap-007",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "M",
      title: "eine starke Landingpage fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Konzept", "M", "CSS"],
    },
    {
      id: "cap-008",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "L",
      title: "ein skalierbares Content-System fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "MVP", "L", "SEO"],
    },
    {
      id: "cap-009",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "XL",
      title: "eine bessere Anfrage-Strecke fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Launch", "XL", "Analytics"],
    },
    {
      id: "cap-010",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "S",
      title: "eine saubere SEO-Basis fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Scale", "S", "Performance"],
    },
    {
      id: "cap-011",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "S",
      title: "ein klickbarer Prototyp fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Audit", "S", "PWA"],
    },
    {
      id: "cap-012",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "M",
      title: "eine mobile Web-App fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Konzept", "M", "UX"],
    },
    {
      id: "cap-013",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "L",
      title: "ein validiertes App-Konzept fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "MVP", "L", "Prototyping"],
    },
    {
      id: "cap-014",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "XL",
      title: "eine PWA mit Offline-Basis fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Launch", "XL", "Forms"],
    },
    {
      id: "cap-015",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "S",
      title: "ein klarer Release-Plan fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Scale", "S", "Testing"],
    },
    {
      id: "cap-016",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "S",
      title: "ein KPI-Dashboard fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Audit", "S", "Excel"],
    },
    {
      id: "cap-017",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "M",
      title: "ein Controlling-Workflow fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Konzept", "M", "Python"],
    },
    {
      id: "cap-018",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "L",
      title: "ein Forecast-Modell fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "MVP", "L", "SQL"],
    },
    {
      id: "cap-019",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "XL",
      title: "eine Datenqualitaetsroutine fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Launch", "XL", "SAP"],
    },
    {
      id: "cap-020",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "S",
      title: "ein Reporting-System fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Scale", "S", "Dashboards"],
    },
    {
      id: "cap-021",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "S",
      title: "ein automatisierter Workflow fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Audit", "S", "n8n"],
    },
    {
      id: "cap-022",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "M",
      title: "eine No-Code/Code-Automation fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Konzept", "M", "APIs"],
    },
    {
      id: "cap-023",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "L",
      title: "ein Integrationskonzept fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "MVP", "L", "Webhooks"],
    },
    {
      id: "cap-024",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "XL",
      title: "ein digitales Betriebshandbuch fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Launch", "XL", "E-Mail"],
    },
    {
      id: "cap-025",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "S",
      title: "eine messbare Zeitersparnis fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Scale", "S", "Docs"],
    },
    {
      id: "cap-026",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "S",
      title: "ein digitaler Produktshop fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Audit", "S", "Commerce"],
    },
    {
      id: "cap-027",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "M",
      title: "eine Produktbibliothek fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Konzept", "M", "Downloads"],
    },
    {
      id: "cap-028",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "L",
      title: "eine Checkout-Struktur fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "MVP", "L", "Stripe"],
    },
    {
      id: "cap-029",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "XL",
      title: "ein Template-Angebot fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Launch", "XL", "Content"],
    },
    {
      id: "cap-030",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "S",
      title: "eine Support-Route fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Scale", "S", "Support"],
    },
    {
      id: "cap-031",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "M",
      title: "eine robuste Prozess-App fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Konzept", "M", "APIs"],
    },
    {
      id: "cap-032",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "L",
      title: "ein sauberer MVP fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "MVP", "L", "SQL"],
    },
    {
      id: "cap-033",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "XL",
      title: "ein integriertes Backoffice fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Launch", "XL", "Automationen"],
    },
    {
      id: "cap-034",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "S",
      title: "ein wartbares SaaS-Fundament fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Scale", "S", "GitHub"],
    },
    {
      id: "cap-035",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "M",
      title: "ein zentrales Arbeitsdashboard fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Audit", "M", "JavaScript"],
    },
    {
      id: "cap-036",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "M",
      title: "eine starke Landingpage fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Konzept", "M", "CSS"],
    },
    {
      id: "cap-037",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "L",
      title: "ein skalierbares Content-System fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "MVP", "L", "SEO"],
    },
    {
      id: "cap-038",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "XL",
      title: "eine bessere Anfrage-Strecke fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Launch", "XL", "Analytics"],
    },
    {
      id: "cap-039",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "S",
      title: "eine saubere SEO-Basis fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Scale", "S", "Performance"],
    },
    {
      id: "cap-040",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "M",
      title: "eine schnelle Website fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Audit", "M", "HTML"],
    },
    {
      id: "cap-041",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "M",
      title: "eine mobile Web-App fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Konzept", "M", "UX"],
    },
    {
      id: "cap-042",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "L",
      title: "ein validiertes App-Konzept fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "MVP", "L", "Prototyping"],
    },
    {
      id: "cap-043",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "XL",
      title: "eine PWA mit Offline-Basis fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Launch", "XL", "Forms"],
    },
    {
      id: "cap-044",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "S",
      title: "ein klarer Release-Plan fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Scale", "S", "Testing"],
    },
    {
      id: "cap-045",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "M",
      title: "ein klickbarer Prototyp fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Audit", "M", "PWA"],
    },
    {
      id: "cap-046",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "M",
      title: "ein Controlling-Workflow fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Konzept", "M", "Python"],
    },
    {
      id: "cap-047",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "L",
      title: "ein Forecast-Modell fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "MVP", "L", "SQL"],
    },
    {
      id: "cap-048",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "XL",
      title: "eine Datenqualitaetsroutine fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Launch", "XL", "SAP"],
    },
    {
      id: "cap-049",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "S",
      title: "ein Reporting-System fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Scale", "S", "Dashboards"],
    },
    {
      id: "cap-050",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "M",
      title: "ein KPI-Dashboard fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Audit", "M", "Excel"],
    },
    {
      id: "cap-051",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "M",
      title: "eine No-Code/Code-Automation fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Konzept", "M", "APIs"],
    },
    {
      id: "cap-052",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "L",
      title: "ein Integrationskonzept fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "MVP", "L", "Webhooks"],
    },
    {
      id: "cap-053",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "XL",
      title: "ein digitales Betriebshandbuch fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Launch", "XL", "E-Mail"],
    },
    {
      id: "cap-054",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "S",
      title: "eine messbare Zeitersparnis fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Scale", "S", "Docs"],
    },
    {
      id: "cap-055",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "M",
      title: "ein automatisierter Workflow fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Audit", "M", "n8n"],
    },
    {
      id: "cap-056",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "M",
      title: "eine Produktbibliothek fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Konzept", "M", "Downloads"],
    },
    {
      id: "cap-057",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "L",
      title: "eine Checkout-Struktur fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "MVP", "L", "Stripe"],
    },
    {
      id: "cap-058",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "XL",
      title: "ein Template-Angebot fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Launch", "XL", "Content"],
    },
    {
      id: "cap-059",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "S",
      title: "eine Support-Route fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Scale", "S", "Support"],
    },
    {
      id: "cap-060",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "M",
      title: "ein digitaler Produktshop fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Audit", "M", "Commerce"],
    },
    {
      id: "cap-061",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "L",
      title: "ein sauberer MVP fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "MVP", "L", "SQL"],
    },
    {
      id: "cap-062",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "XL",
      title: "ein integriertes Backoffice fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Launch", "XL", "Automationen"],
    },
    {
      id: "cap-063",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "S",
      title: "ein wartbares SaaS-Fundament fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Scale", "S", "GitHub"],
    },
    {
      id: "cap-064",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "M",
      title: "ein zentrales Arbeitsdashboard fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Audit", "M", "JavaScript"],
    },
    {
      id: "cap-065",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "L",
      title: "eine robuste Prozess-App fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-066",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "L",
      title: "ein skalierbares Content-System fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "MVP", "L", "SEO"],
    },
    {
      id: "cap-067",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "XL",
      title: "eine bessere Anfrage-Strecke fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Launch", "XL", "Analytics"],
    },
    {
      id: "cap-068",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "S",
      title: "eine saubere SEO-Basis fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Scale", "S", "Performance"],
    },
    {
      id: "cap-069",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "M",
      title: "eine schnelle Website fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Audit", "M", "HTML"],
    },
    {
      id: "cap-070",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "L",
      title: "eine starke Landingpage fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Konzept", "L", "CSS"],
    },
    {
      id: "cap-071",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "L",
      title: "ein validiertes App-Konzept fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "MVP", "L", "Prototyping"],
    },
    {
      id: "cap-072",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "XL",
      title: "eine PWA mit Offline-Basis fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Launch", "XL", "Forms"],
    },
    {
      id: "cap-073",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "S",
      title: "ein klarer Release-Plan fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Scale", "S", "Testing"],
    },
    {
      id: "cap-074",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "M",
      title: "ein klickbarer Prototyp fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Audit", "M", "PWA"],
    },
    {
      id: "cap-075",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "L",
      title: "eine mobile Web-App fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Konzept", "L", "UX"],
    },
    {
      id: "cap-076",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "L",
      title: "ein Forecast-Modell fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "MVP", "L", "SQL"],
    },
    {
      id: "cap-077",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "XL",
      title: "eine Datenqualitaetsroutine fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Launch", "XL", "SAP"],
    },
    {
      id: "cap-078",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "S",
      title: "ein Reporting-System fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Scale", "S", "Dashboards"],
    },
    {
      id: "cap-079",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "M",
      title: "ein KPI-Dashboard fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Audit", "M", "Excel"],
    },
    {
      id: "cap-080",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "L",
      title: "ein Controlling-Workflow fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Konzept", "L", "Python"],
    },
    {
      id: "cap-081",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "L",
      title: "ein Integrationskonzept fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "MVP", "L", "Webhooks"],
    },
    {
      id: "cap-082",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "XL",
      title: "ein digitales Betriebshandbuch fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Launch", "XL", "E-Mail"],
    },
    {
      id: "cap-083",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "S",
      title: "eine messbare Zeitersparnis fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Scale", "S", "Docs"],
    },
    {
      id: "cap-084",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "M",
      title: "ein automatisierter Workflow fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Audit", "M", "n8n"],
    },
    {
      id: "cap-085",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "L",
      title: "eine No-Code/Code-Automation fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-086",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "L",
      title: "eine Checkout-Struktur fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "MVP", "L", "Stripe"],
    },
    {
      id: "cap-087",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "XL",
      title: "ein Template-Angebot fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Launch", "XL", "Content"],
    },
    {
      id: "cap-088",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "S",
      title: "eine Support-Route fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Scale", "S", "Support"],
    },
    {
      id: "cap-089",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "M",
      title: "ein digitaler Produktshop fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Audit", "M", "Commerce"],
    },
    {
      id: "cap-090",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "L",
      title: "eine Produktbibliothek fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Konzept", "L", "Downloads"],
    },
    {
      id: "cap-091",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "XL",
      title: "ein integriertes Backoffice fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Launch", "XL", "Automationen"],
    },
    {
      id: "cap-092",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "S",
      title: "ein wartbares SaaS-Fundament fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Scale", "S", "GitHub"],
    },
    {
      id: "cap-093",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "M",
      title: "ein zentrales Arbeitsdashboard fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Audit", "M", "JavaScript"],
    },
    {
      id: "cap-094",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "L",
      title: "eine robuste Prozess-App fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-095",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "XL",
      title: "ein sauberer MVP fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-096",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "XL",
      title: "eine bessere Anfrage-Strecke fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Launch", "XL", "Analytics"],
    },
    {
      id: "cap-097",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "S",
      title: "eine saubere SEO-Basis fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Scale", "S", "Performance"],
    },
    {
      id: "cap-098",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "M",
      title: "eine schnelle Website fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Audit", "M", "HTML"],
    },
    {
      id: "cap-099",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "L",
      title: "eine starke Landingpage fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Konzept", "L", "CSS"],
    },
    {
      id: "cap-100",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "XL",
      title: "ein skalierbares Content-System fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "MVP", "XL", "SEO"],
    },
    {
      id: "cap-101",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "XL",
      title: "eine PWA mit Offline-Basis fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Launch", "XL", "Forms"],
    },
    {
      id: "cap-102",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "S",
      title: "ein klarer Release-Plan fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Scale", "S", "Testing"],
    },
    {
      id: "cap-103",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "M",
      title: "ein klickbarer Prototyp fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Audit", "M", "PWA"],
    },
    {
      id: "cap-104",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "L",
      title: "eine mobile Web-App fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Konzept", "L", "UX"],
    },
    {
      id: "cap-105",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "XL",
      title: "ein validiertes App-Konzept fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "MVP", "XL", "Prototyping"],
    },
    {
      id: "cap-106",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "XL",
      title: "eine Datenqualitaetsroutine fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Launch", "XL", "SAP"],
    },
    {
      id: "cap-107",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "S",
      title: "ein Reporting-System fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Scale", "S", "Dashboards"],
    },
    {
      id: "cap-108",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "M",
      title: "ein KPI-Dashboard fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Audit", "M", "Excel"],
    },
    {
      id: "cap-109",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "L",
      title: "ein Controlling-Workflow fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Konzept", "L", "Python"],
    },
    {
      id: "cap-110",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "XL",
      title: "ein Forecast-Modell fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-111",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "XL",
      title: "ein digitales Betriebshandbuch fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Launch", "XL", "E-Mail"],
    },
    {
      id: "cap-112",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "S",
      title: "eine messbare Zeitersparnis fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Scale", "S", "Docs"],
    },
    {
      id: "cap-113",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "M",
      title: "ein automatisierter Workflow fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Audit", "M", "n8n"],
    },
    {
      id: "cap-114",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "L",
      title: "eine No-Code/Code-Automation fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-115",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "XL",
      title: "ein Integrationskonzept fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "MVP", "XL", "Webhooks"],
    },
    {
      id: "cap-116",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "XL",
      title: "ein Template-Angebot fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Launch", "XL", "Content"],
    },
    {
      id: "cap-117",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "S",
      title: "eine Support-Route fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Scale", "S", "Support"],
    },
    {
      id: "cap-118",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "M",
      title: "ein digitaler Produktshop fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Audit", "M", "Commerce"],
    },
    {
      id: "cap-119",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "L",
      title: "eine Produktbibliothek fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Konzept", "L", "Downloads"],
    },
    {
      id: "cap-120",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "XL",
      title: "eine Checkout-Struktur fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "MVP", "XL", "Stripe"],
    },
    {
      id: "cap-121",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "S",
      title: "ein wartbares SaaS-Fundament fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Scale", "S", "GitHub"],
    },
    {
      id: "cap-122",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "M",
      title: "ein zentrales Arbeitsdashboard fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Audit", "M", "JavaScript"],
    },
    {
      id: "cap-123",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "L",
      title: "eine robuste Prozess-App fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-124",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "XL",
      title: "ein sauberer MVP fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-125",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "S",
      title: "ein integriertes Backoffice fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Launch", "S", "Automationen"],
    },
    {
      id: "cap-126",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "S",
      title: "eine saubere SEO-Basis fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Scale", "S", "Performance"],
    },
    {
      id: "cap-127",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "M",
      title: "eine schnelle Website fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Audit", "M", "HTML"],
    },
    {
      id: "cap-128",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "L",
      title: "eine starke Landingpage fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Konzept", "L", "CSS"],
    },
    {
      id: "cap-129",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "XL",
      title: "ein skalierbares Content-System fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "MVP", "XL", "SEO"],
    },
    {
      id: "cap-130",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "S",
      title: "eine bessere Anfrage-Strecke fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Launch", "S", "Analytics"],
    },
    {
      id: "cap-131",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "S",
      title: "ein klarer Release-Plan fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Scale", "S", "Testing"],
    },
    {
      id: "cap-132",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "M",
      title: "ein klickbarer Prototyp fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Audit", "M", "PWA"],
    },
    {
      id: "cap-133",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "L",
      title: "eine mobile Web-App fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Konzept", "L", "UX"],
    },
    {
      id: "cap-134",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "XL",
      title: "ein validiertes App-Konzept fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "MVP", "XL", "Prototyping"],
    },
    {
      id: "cap-135",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "S",
      title: "eine PWA mit Offline-Basis fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Launch", "S", "Forms"],
    },
    {
      id: "cap-136",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "S",
      title: "ein Reporting-System fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Scale", "S", "Dashboards"],
    },
    {
      id: "cap-137",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "M",
      title: "ein KPI-Dashboard fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Audit", "M", "Excel"],
    },
    {
      id: "cap-138",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "L",
      title: "ein Controlling-Workflow fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Konzept", "L", "Python"],
    },
    {
      id: "cap-139",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "XL",
      title: "ein Forecast-Modell fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-140",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "S",
      title: "eine Datenqualitaetsroutine fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Launch", "S", "SAP"],
    },
    {
      id: "cap-141",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "S",
      title: "eine messbare Zeitersparnis fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Scale", "S", "Docs"],
    },
    {
      id: "cap-142",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "M",
      title: "ein automatisierter Workflow fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Audit", "M", "n8n"],
    },
    {
      id: "cap-143",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "L",
      title: "eine No-Code/Code-Automation fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-144",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "XL",
      title: "ein Integrationskonzept fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "MVP", "XL", "Webhooks"],
    },
    {
      id: "cap-145",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "S",
      title: "ein digitales Betriebshandbuch fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Launch", "S", "E-Mail"],
    },
    {
      id: "cap-146",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "S",
      title: "eine Support-Route fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Scale", "S", "Support"],
    },
    {
      id: "cap-147",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "M",
      title: "ein digitaler Produktshop fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Audit", "M", "Commerce"],
    },
    {
      id: "cap-148",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "L",
      title: "eine Produktbibliothek fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Konzept", "L", "Downloads"],
    },
    {
      id: "cap-149",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "XL",
      title: "eine Checkout-Struktur fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "MVP", "XL", "Stripe"],
    },
    {
      id: "cap-150",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "S",
      title: "ein Template-Angebot fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Launch", "S", "Content"],
    },
    {
      id: "cap-151",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "M",
      title: "ein zentrales Arbeitsdashboard fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Audit", "M", "JavaScript"],
    },
    {
      id: "cap-152",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "L",
      title: "eine robuste Prozess-App fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-153",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "XL",
      title: "ein sauberer MVP fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-154",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "S",
      title: "ein integriertes Backoffice fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Launch", "S", "Automationen"],
    },
    {
      id: "cap-155",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "M",
      title: "ein wartbares SaaS-Fundament fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Scale", "M", "GitHub"],
    },
    {
      id: "cap-156",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "M",
      title: "eine schnelle Website fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Audit", "M", "HTML"],
    },
    {
      id: "cap-157",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "L",
      title: "eine starke Landingpage fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Konzept", "L", "CSS"],
    },
    {
      id: "cap-158",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "XL",
      title: "ein skalierbares Content-System fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "MVP", "XL", "SEO"],
    },
    {
      id: "cap-159",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "S",
      title: "eine bessere Anfrage-Strecke fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Launch", "S", "Analytics"],
    },
    {
      id: "cap-160",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "M",
      title: "eine saubere SEO-Basis fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Scale", "M", "Performance"],
    },
    {
      id: "cap-161",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "M",
      title: "ein klickbarer Prototyp fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Audit", "M", "PWA"],
    },
    {
      id: "cap-162",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "L",
      title: "eine mobile Web-App fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Konzept", "L", "UX"],
    },
    {
      id: "cap-163",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "XL",
      title: "ein validiertes App-Konzept fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "MVP", "XL", "Prototyping"],
    },
    {
      id: "cap-164",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "S",
      title: "eine PWA mit Offline-Basis fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Launch", "S", "Forms"],
    },
    {
      id: "cap-165",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "M",
      title: "ein klarer Release-Plan fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Scale", "M", "Testing"],
    },
    {
      id: "cap-166",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "M",
      title: "ein KPI-Dashboard fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Audit", "M", "Excel"],
    },
    {
      id: "cap-167",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "L",
      title: "ein Controlling-Workflow fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Konzept", "L", "Python"],
    },
    {
      id: "cap-168",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "XL",
      title: "ein Forecast-Modell fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-169",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "S",
      title: "eine Datenqualitaetsroutine fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Launch", "S", "SAP"],
    },
    {
      id: "cap-170",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "M",
      title: "ein Reporting-System fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Scale", "M", "Dashboards"],
    },
    {
      id: "cap-171",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "M",
      title: "ein automatisierter Workflow fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Audit", "M", "n8n"],
    },
    {
      id: "cap-172",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "L",
      title: "eine No-Code/Code-Automation fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-173",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "XL",
      title: "ein Integrationskonzept fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "MVP", "XL", "Webhooks"],
    },
    {
      id: "cap-174",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "S",
      title: "ein digitales Betriebshandbuch fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Launch", "S", "E-Mail"],
    },
    {
      id: "cap-175",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "M",
      title: "eine messbare Zeitersparnis fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Scale", "M", "Docs"],
    },
    {
      id: "cap-176",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "M",
      title: "ein digitaler Produktshop fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Audit", "M", "Commerce"],
    },
    {
      id: "cap-177",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "L",
      title: "eine Produktbibliothek fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Konzept", "L", "Downloads"],
    },
    {
      id: "cap-178",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "XL",
      title: "eine Checkout-Struktur fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "MVP", "XL", "Stripe"],
    },
    {
      id: "cap-179",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "S",
      title: "ein Template-Angebot fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Launch", "S", "Content"],
    },
    {
      id: "cap-180",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "M",
      title: "eine Support-Route fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Scale", "M", "Support"],
    },
    {
      id: "cap-181",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "L",
      title: "eine robuste Prozess-App fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-182",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "XL",
      title: "ein sauberer MVP fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-183",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "S",
      title: "ein integriertes Backoffice fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Launch", "S", "Automationen"],
    },
    {
      id: "cap-184",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "M",
      title: "ein wartbares SaaS-Fundament fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Scale", "M", "GitHub"],
    },
    {
      id: "cap-185",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "L",
      title: "ein zentrales Arbeitsdashboard fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Audit", "L", "JavaScript"],
    },
    {
      id: "cap-186",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "L",
      title: "eine starke Landingpage fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Konzept", "L", "CSS"],
    },
    {
      id: "cap-187",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "XL",
      title: "ein skalierbares Content-System fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "MVP", "XL", "SEO"],
    },
    {
      id: "cap-188",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "S",
      title: "eine bessere Anfrage-Strecke fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Launch", "S", "Analytics"],
    },
    {
      id: "cap-189",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "M",
      title: "eine saubere SEO-Basis fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Scale", "M", "Performance"],
    },
    {
      id: "cap-190",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "L",
      title: "eine schnelle Website fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Audit", "L", "HTML"],
    },
    {
      id: "cap-191",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "L",
      title: "eine mobile Web-App fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Konzept", "L", "UX"],
    },
    {
      id: "cap-192",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "XL",
      title: "ein validiertes App-Konzept fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "MVP", "XL", "Prototyping"],
    },
    {
      id: "cap-193",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "S",
      title: "eine PWA mit Offline-Basis fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Launch", "S", "Forms"],
    },
    {
      id: "cap-194",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "M",
      title: "ein klarer Release-Plan fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Scale", "M", "Testing"],
    },
    {
      id: "cap-195",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "L",
      title: "ein klickbarer Prototyp fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Audit", "L", "PWA"],
    },
    {
      id: "cap-196",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "L",
      title: "ein Controlling-Workflow fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Konzept", "L", "Python"],
    },
    {
      id: "cap-197",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "XL",
      title: "ein Forecast-Modell fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-198",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "S",
      title: "eine Datenqualitaetsroutine fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Launch", "S", "SAP"],
    },
    {
      id: "cap-199",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "M",
      title: "ein Reporting-System fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Scale", "M", "Dashboards"],
    },
    {
      id: "cap-200",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "L",
      title: "ein KPI-Dashboard fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Audit", "L", "Excel"],
    },
    {
      id: "cap-201",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "L",
      title: "eine No-Code/Code-Automation fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Konzept", "L", "APIs"],
    },
    {
      id: "cap-202",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "XL",
      title: "ein Integrationskonzept fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "MVP", "XL", "Webhooks"],
    },
    {
      id: "cap-203",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "S",
      title: "ein digitales Betriebshandbuch fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Launch", "S", "E-Mail"],
    },
    {
      id: "cap-204",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "M",
      title: "eine messbare Zeitersparnis fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Scale", "M", "Docs"],
    },
    {
      id: "cap-205",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "L",
      title: "ein automatisierter Workflow fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Audit", "L", "n8n"],
    },
    {
      id: "cap-206",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "L",
      title: "eine Produktbibliothek fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Konzept", "L", "Downloads"],
    },
    {
      id: "cap-207",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "XL",
      title: "eine Checkout-Struktur fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "MVP", "XL", "Stripe"],
    },
    {
      id: "cap-208",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "S",
      title: "ein Template-Angebot fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Launch", "S", "Content"],
    },
    {
      id: "cap-209",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "M",
      title: "eine Support-Route fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Scale", "M", "Support"],
    },
    {
      id: "cap-210",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "L",
      title: "ein digitaler Produktshop fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Audit", "L", "Commerce"],
    },
    {
      id: "cap-211",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "XL",
      title: "ein sauberer MVP fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-212",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "S",
      title: "ein integriertes Backoffice fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Launch", "S", "Automationen"],
    },
    {
      id: "cap-213",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "M",
      title: "ein wartbares SaaS-Fundament fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Scale", "M", "GitHub"],
    },
    {
      id: "cap-214",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "L",
      title: "ein zentrales Arbeitsdashboard fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Audit", "L", "JavaScript"],
    },
    {
      id: "cap-215",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "XL",
      title: "eine robuste Prozess-App fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-216",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "XL",
      title: "ein skalierbares Content-System fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "MVP", "XL", "SEO"],
    },
    {
      id: "cap-217",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "S",
      title: "eine bessere Anfrage-Strecke fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Launch", "S", "Analytics"],
    },
    {
      id: "cap-218",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "M",
      title: "eine saubere SEO-Basis fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Scale", "M", "Performance"],
    },
    {
      id: "cap-219",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "L",
      title: "eine schnelle Website fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Audit", "L", "HTML"],
    },
    {
      id: "cap-220",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "XL",
      title: "eine starke Landingpage fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Konzept", "XL", "CSS"],
    },
    {
      id: "cap-221",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "XL",
      title: "ein validiertes App-Konzept fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "MVP", "XL", "Prototyping"],
    },
    {
      id: "cap-222",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "S",
      title: "eine PWA mit Offline-Basis fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Launch", "S", "Forms"],
    },
    {
      id: "cap-223",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "M",
      title: "ein klarer Release-Plan fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Scale", "M", "Testing"],
    },
    {
      id: "cap-224",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "L",
      title: "ein klickbarer Prototyp fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Audit", "L", "PWA"],
    },
    {
      id: "cap-225",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "XL",
      title: "eine mobile Web-App fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Konzept", "XL", "UX"],
    },
    {
      id: "cap-226",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "XL",
      title: "ein Forecast-Modell fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "MVP", "XL", "SQL"],
    },
    {
      id: "cap-227",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "S",
      title: "eine Datenqualitaetsroutine fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Launch", "S", "SAP"],
    },
    {
      id: "cap-228",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "M",
      title: "ein Reporting-System fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Scale", "M", "Dashboards"],
    },
    {
      id: "cap-229",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "L",
      title: "ein KPI-Dashboard fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Audit", "L", "Excel"],
    },
    {
      id: "cap-230",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "XL",
      title: "ein Controlling-Workflow fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Konzept", "XL", "Python"],
    },
    {
      id: "cap-231",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "XL",
      title: "ein Integrationskonzept fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "MVP", "XL", "Webhooks"],
    },
    {
      id: "cap-232",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "S",
      title: "ein digitales Betriebshandbuch fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Launch", "S", "E-Mail"],
    },
    {
      id: "cap-233",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "M",
      title: "eine messbare Zeitersparnis fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Scale", "M", "Docs"],
    },
    {
      id: "cap-234",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "L",
      title: "ein automatisierter Workflow fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Audit", "L", "n8n"],
    },
    {
      id: "cap-235",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "XL",
      title: "eine No-Code/Code-Automation fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-236",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "XL",
      title: "eine Checkout-Struktur fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "MVP", "XL", "Stripe"],
    },
    {
      id: "cap-237",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "S",
      title: "ein Template-Angebot fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Launch", "S", "Content"],
    },
    {
      id: "cap-238",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "M",
      title: "eine Support-Route fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Scale", "M", "Support"],
    },
    {
      id: "cap-239",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "L",
      title: "ein digitaler Produktshop fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Audit", "L", "Commerce"],
    },
    {
      id: "cap-240",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "XL",
      title: "eine Produktbibliothek fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Konzept", "XL", "Downloads"],
    },
    {
      id: "cap-241",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "S",
      title: "ein integriertes Backoffice fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Launch", "S", "Automationen"],
    },
    {
      id: "cap-242",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "M",
      title: "ein wartbares SaaS-Fundament fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Scale", "M", "GitHub"],
    },
    {
      id: "cap-243",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "L",
      title: "ein zentrales Arbeitsdashboard fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Audit", "L", "JavaScript"],
    },
    {
      id: "cap-244",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "XL",
      title: "eine robuste Prozess-App fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-245",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "S",
      title: "ein sauberer MVP fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "MVP", "S", "SQL"],
    },
    {
      id: "cap-246",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "S",
      title: "eine bessere Anfrage-Strecke fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Launch", "S", "Analytics"],
    },
    {
      id: "cap-247",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "M",
      title: "eine saubere SEO-Basis fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Scale", "M", "Performance"],
    },
    {
      id: "cap-248",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "L",
      title: "eine schnelle Website fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Audit", "L", "HTML"],
    },
    {
      id: "cap-249",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "XL",
      title: "eine starke Landingpage fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Konzept", "XL", "CSS"],
    },
    {
      id: "cap-250",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "S",
      title: "ein skalierbares Content-System fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "MVP", "S", "SEO"],
    },
    {
      id: "cap-251",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "S",
      title: "eine PWA mit Offline-Basis fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Launch", "S", "Forms"],
    },
    {
      id: "cap-252",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "M",
      title: "ein klarer Release-Plan fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Scale", "M", "Testing"],
    },
    {
      id: "cap-253",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "L",
      title: "ein klickbarer Prototyp fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Audit", "L", "PWA"],
    },
    {
      id: "cap-254",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "XL",
      title: "eine mobile Web-App fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Konzept", "XL", "UX"],
    },
    {
      id: "cap-255",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "S",
      title: "ein validiertes App-Konzept fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "MVP", "S", "Prototyping"],
    },
    {
      id: "cap-256",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "S",
      title: "eine Datenqualitaetsroutine fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Launch", "S", "SAP"],
    },
    {
      id: "cap-257",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "M",
      title: "ein Reporting-System fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Scale", "M", "Dashboards"],
    },
    {
      id: "cap-258",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "L",
      title: "ein KPI-Dashboard fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Audit", "L", "Excel"],
    },
    {
      id: "cap-259",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "XL",
      title: "ein Controlling-Workflow fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Konzept", "XL", "Python"],
    },
    {
      id: "cap-260",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "S",
      title: "ein Forecast-Modell fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "MVP", "S", "SQL"],
    },
    {
      id: "cap-261",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "S",
      title: "ein digitales Betriebshandbuch fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Launch", "S", "E-Mail"],
    },
    {
      id: "cap-262",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "M",
      title: "eine messbare Zeitersparnis fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Scale", "M", "Docs"],
    },
    {
      id: "cap-263",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "L",
      title: "ein automatisierter Workflow fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Audit", "L", "n8n"],
    },
    {
      id: "cap-264",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "XL",
      title: "eine No-Code/Code-Automation fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-265",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "S",
      title: "ein Integrationskonzept fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "MVP", "S", "Webhooks"],
    },
    {
      id: "cap-266",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "S",
      title: "ein Template-Angebot fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Launch", "S", "Content"],
    },
    {
      id: "cap-267",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "M",
      title: "eine Support-Route fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Scale", "M", "Support"],
    },
    {
      id: "cap-268",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "L",
      title: "ein digitaler Produktshop fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Audit", "L", "Commerce"],
    },
    {
      id: "cap-269",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "XL",
      title: "eine Produktbibliothek fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Konzept", "XL", "Downloads"],
    },
    {
      id: "cap-270",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "S",
      title: "eine Checkout-Struktur fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "MVP", "S", "Stripe"],
    },
    {
      id: "cap-271",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "M",
      title: "ein wartbares SaaS-Fundament fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Scale", "M", "GitHub"],
    },
    {
      id: "cap-272",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "L",
      title: "ein zentrales Arbeitsdashboard fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Audit", "L", "JavaScript"],
    },
    {
      id: "cap-273",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "XL",
      title: "eine robuste Prozess-App fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-274",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "S",
      title: "ein sauberer MVP fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "MVP", "S", "SQL"],
    },
    {
      id: "cap-275",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "M",
      title: "ein integriertes Backoffice fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Launch", "M", "Automationen"],
    },
    {
      id: "cap-276",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "M",
      title: "eine saubere SEO-Basis fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Scale", "M", "Performance"],
    },
    {
      id: "cap-277",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "L",
      title: "eine schnelle Website fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Audit", "L", "HTML"],
    },
    {
      id: "cap-278",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "XL",
      title: "eine starke Landingpage fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Konzept", "XL", "CSS"],
    },
    {
      id: "cap-279",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "S",
      title: "ein skalierbares Content-System fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "MVP", "S", "SEO"],
    },
    {
      id: "cap-280",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "M",
      title: "eine bessere Anfrage-Strecke fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Launch", "M", "Analytics"],
    },
    {
      id: "cap-281",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "M",
      title: "ein klarer Release-Plan fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Scale", "M", "Testing"],
    },
    {
      id: "cap-282",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "L",
      title: "ein klickbarer Prototyp fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Audit", "L", "PWA"],
    },
    {
      id: "cap-283",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "XL",
      title: "eine mobile Web-App fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Konzept", "XL", "UX"],
    },
    {
      id: "cap-284",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "S",
      title: "ein validiertes App-Konzept fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "MVP", "S", "Prototyping"],
    },
    {
      id: "cap-285",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "M",
      title: "eine PWA mit Offline-Basis fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Launch", "M", "Forms"],
    },
    {
      id: "cap-286",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "M",
      title: "ein Reporting-System fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Scale", "M", "Dashboards"],
    },
    {
      id: "cap-287",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "L",
      title: "ein KPI-Dashboard fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Audit", "L", "Excel"],
    },
    {
      id: "cap-288",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "XL",
      title: "ein Controlling-Workflow fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Konzept", "XL", "Python"],
    },
    {
      id: "cap-289",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "S",
      title: "ein Forecast-Modell fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "MVP", "S", "SQL"],
    },
    {
      id: "cap-290",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "M",
      title: "eine Datenqualitaetsroutine fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Launch", "M", "SAP"],
    },
    {
      id: "cap-291",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "M",
      title: "eine messbare Zeitersparnis fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Scale", "M", "Docs"],
    },
    {
      id: "cap-292",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "L",
      title: "ein automatisierter Workflow fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Audit", "L", "n8n"],
    },
    {
      id: "cap-293",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "XL",
      title: "eine No-Code/Code-Automation fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-294",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "S",
      title: "ein Integrationskonzept fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "MVP", "S", "Webhooks"],
    },
    {
      id: "cap-295",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "M",
      title: "ein digitales Betriebshandbuch fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Launch", "M", "E-Mail"],
    },
    {
      id: "cap-296",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "M",
      title: "eine Support-Route fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Scale", "M", "Support"],
    },
    {
      id: "cap-297",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "L",
      title: "ein digitaler Produktshop fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Audit", "L", "Commerce"],
    },
    {
      id: "cap-298",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "XL",
      title: "eine Produktbibliothek fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Konzept", "XL", "Downloads"],
    },
    {
      id: "cap-299",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "S",
      title: "eine Checkout-Struktur fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "MVP", "S", "Stripe"],
    },
    {
      id: "cap-300",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "M",
      title: "ein Template-Angebot fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Launch", "M", "Content"],
    },
    {
      id: "cap-301",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "L",
      title: "ein zentrales Arbeitsdashboard fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Audit", "L", "JavaScript"],
    },
    {
      id: "cap-302",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "XL",
      title: "eine robuste Prozess-App fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-303",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "S",
      title: "ein sauberer MVP fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "MVP", "S", "SQL"],
    },
    {
      id: "cap-304",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "M",
      title: "ein integriertes Backoffice fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Launch", "M", "Automationen"],
    },
    {
      id: "cap-305",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "L",
      title: "ein wartbares SaaS-Fundament fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Scale", "L", "GitHub"],
    },
    {
      id: "cap-306",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "L",
      title: "eine schnelle Website fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Audit", "L", "HTML"],
    },
    {
      id: "cap-307",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "XL",
      title: "eine starke Landingpage fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Konzept", "XL", "CSS"],
    },
    {
      id: "cap-308",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "S",
      title: "ein skalierbares Content-System fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "MVP", "S", "SEO"],
    },
    {
      id: "cap-309",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "M",
      title: "eine bessere Anfrage-Strecke fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Launch", "M", "Analytics"],
    },
    {
      id: "cap-310",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "L",
      title: "eine saubere SEO-Basis fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Scale", "L", "Performance"],
    },
    {
      id: "cap-311",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "L",
      title: "ein klickbarer Prototyp fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Audit", "L", "PWA"],
    },
    {
      id: "cap-312",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "XL",
      title: "eine mobile Web-App fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Konzept", "XL", "UX"],
    },
    {
      id: "cap-313",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "S",
      title: "ein validiertes App-Konzept fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "MVP", "S", "Prototyping"],
    },
    {
      id: "cap-314",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "M",
      title: "eine PWA mit Offline-Basis fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Launch", "M", "Forms"],
    },
    {
      id: "cap-315",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "L",
      title: "ein klarer Release-Plan fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Scale", "L", "Testing"],
    },
    {
      id: "cap-316",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "L",
      title: "ein KPI-Dashboard fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Audit", "L", "Excel"],
    },
    {
      id: "cap-317",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "XL",
      title: "ein Controlling-Workflow fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Konzept", "XL", "Python"],
    },
    {
      id: "cap-318",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "S",
      title: "ein Forecast-Modell fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "MVP", "S", "SQL"],
    },
    {
      id: "cap-319",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "M",
      title: "eine Datenqualitaetsroutine fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Launch", "M", "SAP"],
    },
    {
      id: "cap-320",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "L",
      title: "ein Reporting-System fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Scale", "L", "Dashboards"],
    },
    {
      id: "cap-321",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "L",
      title: "ein automatisierter Workflow fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Audit", "L", "n8n"],
    },
    {
      id: "cap-322",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "XL",
      title: "eine No-Code/Code-Automation fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-323",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "S",
      title: "ein Integrationskonzept fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "MVP", "S", "Webhooks"],
    },
    {
      id: "cap-324",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "M",
      title: "ein digitales Betriebshandbuch fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Launch", "M", "E-Mail"],
    },
    {
      id: "cap-325",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "L",
      title: "eine messbare Zeitersparnis fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Scale", "L", "Docs"],
    },
    {
      id: "cap-326",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "L",
      title: "ein digitaler Produktshop fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Audit", "L", "Commerce"],
    },
    {
      id: "cap-327",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "XL",
      title: "eine Produktbibliothek fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Konzept", "XL", "Downloads"],
    },
    {
      id: "cap-328",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "S",
      title: "eine Checkout-Struktur fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "MVP", "S", "Stripe"],
    },
    {
      id: "cap-329",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "M",
      title: "ein Template-Angebot fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Launch", "M", "Content"],
    },
    {
      id: "cap-330",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "L",
      title: "eine Support-Route fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Scale", "L", "Support"],
    },
    {
      id: "cap-331",
      area: "Software",
      tone: "teal",
      stage: "Konzept",
      effort: "XL",
      title: "eine robuste Prozess-App fuer manuelle Freigaben",
      problem: "Wenn manuelle Freigaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein sauberer MVP, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-332",
      area: "Software",
      tone: "teal",
      stage: "MVP",
      effort: "S",
      title: "ein sauberer MVP fuer isolierte Excel-Prozesse",
      problem: "Wenn isolierte Excel-Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein integriertes Backoffice, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "MVP", "S", "SQL"],
    },
    {
      id: "cap-333",
      area: "Software",
      tone: "teal",
      stage: "Launch",
      effort: "M",
      title: "ein integriertes Backoffice fuer unuebersichtliche Tool-Landschaften",
      problem: "Wenn unuebersichtliche Tool-Landschaften Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein wartbares SaaS-Fundament, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen"],
      tags: ["Software", "Launch", "M", "Automationen"],
    },
    {
      id: "cap-334",
      area: "Software",
      tone: "teal",
      stage: "Scale",
      effort: "L",
      title: "ein wartbares SaaS-Fundament fuer wiederkehrende Admin-Aufgaben",
      problem: "Wenn wiederkehrende Admin-Aufgaben Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein zentrales Arbeitsdashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL", "Automationen", "GitHub"],
      tags: ["Software", "Scale", "L", "GitHub"],
    },
    {
      id: "cap-335",
      area: "Software",
      tone: "teal",
      stage: "Audit",
      effort: "XL",
      title: "ein zentrales Arbeitsdashboard fuer fragmentierte Kundendaten",
      problem: "Wenn fragmentierte Kundendaten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine robuste Prozess-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["JavaScript", "APIs", "SQL"],
      tags: ["Software", "Audit", "XL", "JavaScript"],
    },
    {
      id: "cap-336",
      area: "Web",
      tone: "amber",
      stage: "Konzept",
      effort: "XL",
      title: "eine starke Landingpage fuer schwache Erstwirkung",
      problem: "Wenn schwache Erstwirkung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein skalierbares Content-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Konzept", "XL", "CSS"],
    },
    {
      id: "cap-337",
      area: "Web",
      tone: "amber",
      stage: "MVP",
      effort: "S",
      title: "ein skalierbares Content-System fuer unklare Angebotsstruktur",
      problem: "Wenn unklare Angebotsstruktur Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine bessere Anfrage-Strecke, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "MVP", "S", "SEO"],
    },
    {
      id: "cap-338",
      area: "Web",
      tone: "amber",
      stage: "Launch",
      effort: "M",
      title: "eine bessere Anfrage-Strecke fuer lange Ladezeiten",
      problem: "Wenn lange Ladezeiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine saubere SEO-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics"],
      tags: ["Web", "Launch", "M", "Analytics"],
    },
    {
      id: "cap-339",
      area: "Web",
      tone: "amber",
      stage: "Scale",
      effort: "L",
      title: "eine saubere SEO-Basis fuer fehlende Conversion-Pfade",
      problem: "Wenn fehlende Conversion-Pfade Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine schnelle Website, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO", "Analytics", "Performance"],
      tags: ["Web", "Scale", "L", "Performance"],
    },
    {
      id: "cap-340",
      area: "Web",
      tone: "amber",
      stage: "Audit",
      effort: "XL",
      title: "eine schnelle Website fuer zersplitterte Inhalte",
      problem: "Wenn zersplitterte Inhalte Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine starke Landingpage, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["HTML", "CSS", "SEO"],
      tags: ["Web", "Audit", "XL", "HTML"],
    },
    {
      id: "cap-341",
      area: "App",
      tone: "coral",
      stage: "Konzept",
      effort: "XL",
      title: "eine mobile Web-App fuer komplizierte Nutzerwege",
      problem: "Wenn komplizierte Nutzerwege Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein validiertes App-Konzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Konzept", "XL", "UX"],
    },
    {
      id: "cap-342",
      area: "App",
      tone: "coral",
      stage: "MVP",
      effort: "S",
      title: "ein validiertes App-Konzept fuer fehlende mobile Prozesse",
      problem: "Wenn fehlende mobile Prozesse Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine PWA mit Offline-Basis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "MVP", "S", "Prototyping"],
    },
    {
      id: "cap-343",
      area: "App",
      tone: "coral",
      stage: "Launch",
      effort: "M",
      title: "eine PWA mit Offline-Basis fuer ungenutzte Kundeninteraktion",
      problem: "Wenn ungenutzte Kundeninteraktion Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klarer Release-Plan, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms"],
      tags: ["App", "Launch", "M", "Forms"],
    },
    {
      id: "cap-344",
      area: "App",
      tone: "coral",
      stage: "Scale",
      effort: "L",
      title: "ein klarer Release-Plan fuer ungetestete Produktideen",
      problem: "Wenn ungetestete Produktideen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein klickbarer Prototyp, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping", "Forms", "Testing"],
      tags: ["App", "Scale", "L", "Testing"],
    },
    {
      id: "cap-345",
      area: "App",
      tone: "coral",
      stage: "Audit",
      effort: "XL",
      title: "ein klickbarer Prototyp fuer langsame Feedback-Zyklen",
      problem: "Wenn langsame Feedback-Zyklen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine mobile Web-App, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["PWA", "UX", "Prototyping"],
      tags: ["App", "Audit", "XL", "PWA"],
    },
    {
      id: "cap-346",
      area: "Daten",
      tone: "blue",
      stage: "Konzept",
      effort: "XL",
      title: "ein Controlling-Workflow fuer versteckte Kennzahlen",
      problem: "Wenn versteckte Kennzahlen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Forecast-Modell, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Konzept", "XL", "Python"],
    },
    {
      id: "cap-347",
      area: "Daten",
      tone: "blue",
      stage: "MVP",
      effort: "S",
      title: "ein Forecast-Modell fuer manuelle Monatsreports",
      problem: "Wenn manuelle Monatsreports Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Datenqualitaetsroutine, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "MVP", "S", "SQL"],
    },
    {
      id: "cap-348",
      area: "Daten",
      tone: "blue",
      stage: "Launch",
      effort: "M",
      title: "eine Datenqualitaetsroutine fuer fehlende Forecasts",
      problem: "Wenn fehlende Forecasts Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Reporting-System, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP"],
      tags: ["Daten", "Launch", "M", "SAP"],
    },
    {
      id: "cap-349",
      area: "Daten",
      tone: "blue",
      stage: "Scale",
      effort: "L",
      title: "ein Reporting-System fuer unsaubere Datenquellen",
      problem: "Wenn unsaubere Datenquellen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein KPI-Dashboard, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL", "SAP", "Dashboards"],
      tags: ["Daten", "Scale", "L", "Dashboards"],
    },
    {
      id: "cap-350",
      area: "Daten",
      tone: "blue",
      stage: "Audit",
      effort: "XL",
      title: "ein KPI-Dashboard fuer spaete Management-Information",
      problem: "Wenn spaete Management-Information Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Controlling-Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Excel", "Python", "SQL"],
      tags: ["Daten", "Audit", "XL", "Excel"],
    },
    {
      id: "cap-351",
      area: "Automation",
      tone: "green",
      stage: "Konzept",
      effort: "XL",
      title: "eine No-Code/Code-Automation fuer doppelte Dateneingabe",
      problem: "Wenn doppelte Dateneingabe Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Integrationskonzept, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Konzept", "XL", "APIs"],
    },
    {
      id: "cap-352",
      area: "Automation",
      tone: "green",
      stage: "MVP",
      effort: "S",
      title: "ein Integrationskonzept fuer langsame Benachrichtigungen",
      problem: "Wenn langsame Benachrichtigungen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitales Betriebshandbuch, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "MVP", "S", "Webhooks"],
    },
    {
      id: "cap-353",
      area: "Automation",
      tone: "green",
      stage: "Launch",
      effort: "M",
      title: "ein digitales Betriebshandbuch fuer manuelle Dateiablage",
      problem: "Wenn manuelle Dateiablage Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine messbare Zeitersparnis, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail"],
      tags: ["Automation", "Launch", "M", "E-Mail"],
    },
    {
      id: "cap-354",
      area: "Automation",
      tone: "green",
      stage: "Scale",
      effort: "L",
      title: "eine messbare Zeitersparnis fuer chaotische Kundenanfragen",
      problem: "Wenn chaotische Kundenanfragen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein automatisierter Workflow, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks", "E-Mail", "Docs"],
      tags: ["Automation", "Scale", "L", "Docs"],
    },
    {
      id: "cap-355",
      area: "Automation",
      tone: "green",
      stage: "Audit",
      effort: "XL",
      title: "ein automatisierter Workflow fuer nicht dokumentierte Routinen",
      problem: "Wenn nicht dokumentierte Routinen Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine No-Code/Code-Automation, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["n8n", "APIs", "Webhooks"],
      tags: ["Automation", "Audit", "XL", "n8n"],
    },
    {
      id: "cap-356",
      area: "Shop",
      tone: "violet",
      stage: "Konzept",
      effort: "XL",
      title: "eine Produktbibliothek fuer digitale Produkte ohne Verpackung",
      problem: "Wenn digitale Produkte ohne Verpackung Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Checkout-Struktur, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Konzept", "XL", "Downloads"],
    },
    {
      id: "cap-357",
      area: "Shop",
      tone: "violet",
      stage: "MVP",
      effort: "S",
      title: "eine Checkout-Struktur fuer fehlende Produktseiten",
      problem: "Wenn fehlende Produktseiten Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein Template-Angebot, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "MVP", "S", "Stripe"],
    },
    {
      id: "cap-358",
      area: "Shop",
      tone: "violet",
      stage: "Launch",
      effort: "M",
      title: "ein Template-Angebot fuer kein Download-Prozess",
      problem: "Wenn kein Download-Prozess Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Support-Route, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content"],
      tags: ["Shop", "Launch", "M", "Content"],
    },
    {
      id: "cap-359",
      area: "Shop",
      tone: "violet",
      stage: "Scale",
      effort: "L",
      title: "eine Support-Route fuer unscharfe Preislogik",
      problem: "Wenn unscharfe Preislogik Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist ein digitaler Produktshop, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe", "Content", "Support"],
      tags: ["Shop", "Scale", "L", "Support"],
    },
    {
      id: "cap-360",
      area: "Shop",
      tone: "violet",
      stage: "Audit",
      effort: "XL",
      title: "ein digitaler Produktshop fuer kein Launch-System",
      problem: "Wenn kein Launch-System Wachstum bremst, entwirft Bytewerk Studio eine Loesung mit klaren Daten, Rollen und digitalen Ablaeufen.",
      outcome: "Ergebnis ist eine Produktbibliothek, das Teams schneller macht und Entscheidungen besser vorbereitet.",
      tools: ["Commerce", "Downloads", "Stripe"],
      tags: ["Shop", "Audit", "XL", "Commerce"],
    },
  ];

  const products = [
    {
      id: "product-001",
      family: "LaunchKit",
      title: "LaunchKit 01",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Workflow Pack",
      price: 32,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-002",
      family: "LaunchKit",
      title: "LaunchKit 02",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Dashboard Pack",
      price: 35,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-003",
      family: "LaunchKit",
      title: "LaunchKit 03",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Template Pack",
      price: 38,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-004",
      family: "LaunchKit",
      title: "LaunchKit 04",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Workflow Pack",
      price: 41,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-005",
      family: "LaunchKit",
      title: "LaunchKit 05",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Dashboard Pack",
      price: 44,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-006",
      family: "LaunchKit",
      title: "LaunchKit 06",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Template Pack",
      price: 47,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-007",
      family: "LaunchKit",
      title: "LaunchKit 07",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Workflow Pack",
      price: 50,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-008",
      family: "LaunchKit",
      title: "LaunchKit 08",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Dashboard Pack",
      price: 53,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-009",
      family: "LaunchKit",
      title: "LaunchKit 09",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Template Pack",
      price: 56,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-010",
      family: "LaunchKit",
      title: "LaunchKit 10",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Workflow Pack",
      price: 59,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Launch-Plan"],
    },
    {
      id: "product-011",
      family: "LaunchKit",
      title: "LaunchKit 11",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Dashboard Pack",
      price: 62,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-012",
      family: "LaunchKit",
      title: "LaunchKit 12",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Template Pack",
      price: 65,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-013",
      family: "LaunchKit",
      title: "LaunchKit 13",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Workflow Pack",
      price: 68,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-014",
      family: "LaunchKit",
      title: "LaunchKit 14",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Dashboard Pack",
      price: 71,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-015",
      family: "LaunchKit",
      title: "LaunchKit 15",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Template Pack",
      price: 74,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-016",
      family: "LaunchKit",
      title: "LaunchKit 16",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Workflow Pack",
      price: 77,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-017",
      family: "LaunchKit",
      title: "LaunchKit 17",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Dashboard Pack",
      price: 80,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-018",
      family: "LaunchKit",
      title: "LaunchKit 18",
      description: "Website-Launch, SEO-Basis, Checklisten und Content-Struktur",
      format: "Template Pack",
      price: 83,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-019",
      family: "OpsKit",
      title: "OpsKit 01",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Workflow Pack",
      price: 52,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-020",
      family: "OpsKit",
      title: "OpsKit 02",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Dashboard Pack",
      price: 55,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-021",
      family: "OpsKit",
      title: "OpsKit 03",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Template Pack",
      price: 58,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-022",
      family: "OpsKit",
      title: "OpsKit 04",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Workflow Pack",
      price: 61,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-023",
      family: "OpsKit",
      title: "OpsKit 05",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Dashboard Pack",
      price: 64,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-024",
      family: "OpsKit",
      title: "OpsKit 06",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Template Pack",
      price: 67,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-025",
      family: "OpsKit",
      title: "OpsKit 07",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Workflow Pack",
      price: 70,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-026",
      family: "OpsKit",
      title: "OpsKit 08",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Dashboard Pack",
      price: 73,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-027",
      family: "OpsKit",
      title: "OpsKit 09",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Template Pack",
      price: 76,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-028",
      family: "OpsKit",
      title: "OpsKit 10",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Workflow Pack",
      price: 79,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Launch-Plan"],
    },
    {
      id: "product-029",
      family: "OpsKit",
      title: "OpsKit 11",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Dashboard Pack",
      price: 82,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-030",
      family: "OpsKit",
      title: "OpsKit 12",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Template Pack",
      price: 85,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-031",
      family: "OpsKit",
      title: "OpsKit 13",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Workflow Pack",
      price: 88,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-032",
      family: "OpsKit",
      title: "OpsKit 14",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Dashboard Pack",
      price: 91,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-033",
      family: "OpsKit",
      title: "OpsKit 15",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Template Pack",
      price: 94,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-034",
      family: "OpsKit",
      title: "OpsKit 16",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Workflow Pack",
      price: 97,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-035",
      family: "OpsKit",
      title: "OpsKit 17",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Dashboard Pack",
      price: 100,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-036",
      family: "OpsKit",
      title: "OpsKit 18",
      description: "Automationen, Prozessdokumente, Dashboards und Routine-Boards",
      format: "Template Pack",
      price: 103,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-037",
      family: "DataKit",
      title: "DataKit 01",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Workflow Pack",
      price: 72,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-038",
      family: "DataKit",
      title: "DataKit 02",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Dashboard Pack",
      price: 75,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-039",
      family: "DataKit",
      title: "DataKit 03",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Template Pack",
      price: 78,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-040",
      family: "DataKit",
      title: "DataKit 04",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Workflow Pack",
      price: 81,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-041",
      family: "DataKit",
      title: "DataKit 05",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Dashboard Pack",
      price: 84,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-042",
      family: "DataKit",
      title: "DataKit 06",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Template Pack",
      price: 87,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-043",
      family: "DataKit",
      title: "DataKit 07",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Workflow Pack",
      price: 90,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-044",
      family: "DataKit",
      title: "DataKit 08",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Dashboard Pack",
      price: 93,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-045",
      family: "DataKit",
      title: "DataKit 09",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Template Pack",
      price: 96,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-046",
      family: "DataKit",
      title: "DataKit 10",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Workflow Pack",
      price: 99,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Launch-Plan"],
    },
    {
      id: "product-047",
      family: "DataKit",
      title: "DataKit 11",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Dashboard Pack",
      price: 102,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-048",
      family: "DataKit",
      title: "DataKit 12",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Template Pack",
      price: 105,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-049",
      family: "DataKit",
      title: "DataKit 13",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Workflow Pack",
      price: 108,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-050",
      family: "DataKit",
      title: "DataKit 14",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Dashboard Pack",
      price: 111,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-051",
      family: "DataKit",
      title: "DataKit 15",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Template Pack",
      price: 114,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-052",
      family: "DataKit",
      title: "DataKit 16",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Workflow Pack",
      price: 117,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-053",
      family: "DataKit",
      title: "DataKit 17",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Dashboard Pack",
      price: 120,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-054",
      family: "DataKit",
      title: "DataKit 18",
      description: "KPI-Modelle, Controlling-Templates, Forecasts und Reporting",
      format: "Template Pack",
      price: 123,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-055",
      family: "ShopKit",
      title: "ShopKit 01",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Workflow Pack",
      price: 92,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-056",
      family: "ShopKit",
      title: "ShopKit 02",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Dashboard Pack",
      price: 95,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-057",
      family: "ShopKit",
      title: "ShopKit 03",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Template Pack",
      price: 98,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-058",
      family: "ShopKit",
      title: "ShopKit 04",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Workflow Pack",
      price: 101,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-059",
      family: "ShopKit",
      title: "ShopKit 05",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Dashboard Pack",
      price: 104,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-060",
      family: "ShopKit",
      title: "ShopKit 06",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Template Pack",
      price: 107,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-061",
      family: "ShopKit",
      title: "ShopKit 07",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Workflow Pack",
      price: 110,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-062",
      family: "ShopKit",
      title: "ShopKit 08",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Dashboard Pack",
      price: 113,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-063",
      family: "ShopKit",
      title: "ShopKit 09",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Template Pack",
      price: 116,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-064",
      family: "ShopKit",
      title: "ShopKit 10",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Workflow Pack",
      price: 119,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Launch-Plan"],
    },
    {
      id: "product-065",
      family: "ShopKit",
      title: "ShopKit 11",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Dashboard Pack",
      price: 122,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-066",
      family: "ShopKit",
      title: "ShopKit 12",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Template Pack",
      price: 125,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-067",
      family: "ShopKit",
      title: "ShopKit 13",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Workflow Pack",
      price: 128,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-068",
      family: "ShopKit",
      title: "ShopKit 14",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Dashboard Pack",
      price: 131,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-069",
      family: "ShopKit",
      title: "ShopKit 15",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Template Pack",
      price: 134,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-070",
      family: "ShopKit",
      title: "ShopKit 16",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Workflow Pack",
      price: 137,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-071",
      family: "ShopKit",
      title: "ShopKit 17",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Dashboard Pack",
      price: 140,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-072",
      family: "ShopKit",
      title: "ShopKit 18",
      description: "Produktseiten, digitale Downloads, Preislogik und Support-Flows",
      format: "Template Pack",
      price: 143,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-073",
      family: "FounderKit",
      title: "FounderKit 01",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Workflow Pack",
      price: 112,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-074",
      family: "FounderKit",
      title: "FounderKit 02",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Dashboard Pack",
      price: 115,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-075",
      family: "FounderKit",
      title: "FounderKit 03",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Template Pack",
      price: 118,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-076",
      family: "FounderKit",
      title: "FounderKit 04",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Workflow Pack",
      price: 121,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-077",
      family: "FounderKit",
      title: "FounderKit 05",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Dashboard Pack",
      price: 124,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-078",
      family: "FounderKit",
      title: "FounderKit 06",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Template Pack",
      price: 127,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-079",
      family: "FounderKit",
      title: "FounderKit 07",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Workflow Pack",
      price: 130,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-080",
      family: "FounderKit",
      title: "FounderKit 08",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Dashboard Pack",
      price: 133,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-081",
      family: "FounderKit",
      title: "FounderKit 09",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Template Pack",
      price: 136,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-082",
      family: "FounderKit",
      title: "FounderKit 10",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Workflow Pack",
      price: 139,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Launch-Plan"],
    },
    {
      id: "product-083",
      family: "FounderKit",
      title: "FounderKit 11",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Dashboard Pack",
      price: 142,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-084",
      family: "FounderKit",
      title: "FounderKit 12",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Template Pack",
      price: 145,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-085",
      family: "FounderKit",
      title: "FounderKit 13",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Workflow Pack",
      price: 148,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-086",
      family: "FounderKit",
      title: "FounderKit 14",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Dashboard Pack",
      price: 151,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-087",
      family: "FounderKit",
      title: "FounderKit 15",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Template Pack",
      price: 154,
      level: "Studio",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Launch-Plan"],
    },
    {
      id: "product-088",
      family: "FounderKit",
      title: "FounderKit 16",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Workflow Pack",
      price: 157,
      level: "Advanced",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
    {
      id: "product-089",
      family: "FounderKit",
      title: "FounderKit 17",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Dashboard Pack",
      price: 160,
      level: "Starter",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Content-Bloecke", "Review-Fragen"],
    },
    {
      id: "product-090",
      family: "FounderKit",
      title: "FounderKit 18",
      description: "Strategie-Boards, Pitch-Struktur, Roadmaps und Entscheidungslogik",
      format: "Template Pack",
      price: 163,
      level: "Pro",
      includes: ["Strukturierte Vorlage", "Umsetzungs-Checkliste", "Datenfelder", "Review-Fragen"],
    },
  ];

  const stack = [
    {
      name: "HTML",
      copy: "Struktur und semantische Seitenarchitektur",
    },
    {
      name: "CSS",
      copy: "Designsystem, responsive Layouts und Animationen",
    },
    {
      name: "JavaScript",
      copy: "Interaktionen, Rechner, Filter und dynamische Module",
    },
    {
      name: "GitHub Pages",
      copy: "Schnelles Hosting mit Custom Domain",
    },
    {
      name: "APIs",
      copy: "Schnittstellen fuer Daten, Automationen und Produktlogik",
    },
    {
      name: "Python",
      copy: "Datenverarbeitung, Skripte und Analyse-Automation",
    },
    {
      name: "SQL",
      copy: "Datenmodelle, Abfragen und Reporting-Strukturen",
    },
    {
      name: "SAP ERP",
      copy: "Prozessverstaendnis fuer Unternehmensdaten",
    },
    {
      name: "n8n",
      copy: "Automatisierung zwischen Tools und Services",
    },
    {
      name: "Vertex AI",
      copy: "KI-gestuetzte Workflows und Prototyping",
    },
  ];

  const faqs = [
    {
      question: "Was macht Bytewerk Studio?",
      answer: "Bytewerk Studio entwickelt Software, Websites, Apps, Automationen und digitale Produkte fuer Unternehmen, Gruender und Projekte.",
    },
    {
      question: "Wer steht hinter Bytewerk Studio?",
      answer: "Gruender & CIO ist Hijratullah Haqmal. Das Profil auf hhaqmal.de zeigt den Hintergrund in Controlling, Datenanalyse, Prozessen und IT.",
    },
    {
      question: "Kann die Website spaeter erweitert werden?",
      answer: "Ja. Die Seite ist bewusst modular aufgebaut: Inhalte, Rechner, Suchbereiche und Produktmodule koennen weiter wachsen.",
    },
    {
      question: "Ist das eine GitHub-Pages-Website?",
      answer: "Ja. Die Seite wird ueber GitHub Pages veroeffentlicht und verwendet die Custom Domain bytewerkstudio.com.",
    },
    {
      question: "Welche Projekte passen gut?",
      answer: "Besonders gut passen Websites, interne Tools, digitale Produktshops, Automationen, Daten-Dashboards und MVPs.",
    },
    {
      question: "Kann ein Online-Shop fuer digitale Produkte eingebunden werden?",
      answer: "Ja. Die aktuelle Website enthaelt bereits eine Produkt- und Template-Struktur, die spaeter mit Checkout erweitert werden kann.",
    },
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
