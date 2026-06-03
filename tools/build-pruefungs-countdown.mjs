import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.join(root, "apps", "pruefungs-countdown");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  const full = path.join(root, file);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content.trimStart().replace(/\n/g, "\r\n"), "utf8");
}

function slug(input) {
  return input
    .toLowerCase()
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const categories = [
  {
    key: "abi",
    label: "Abitur",
    exams: ["Mathematik", "Deutsch", "Englisch", "Biologie", "Geschichte", "Informatik"],
    topics: ["Grundlagen auffrischen", "Pruefungsaufgaben analysieren", "Schwachstellen trainieren", "Probepruefung schreiben", "Fehlerliste wiederholen", "Kurznotizen sichern"],
  },
  {
    key: "uni",
    label: "Universitaet",
    exams: ["Analysis", "BWL", "Programmierung", "Statistik", "Recht", "Psychologie"],
    topics: ["Skript zusammenfassen", "Definitionen lernen", "Uebungsblatt loesen", "Altklausur rechnen", "Karteikarten wiederholen", "Sprechstundenfragen klaeren"],
  },
  {
    key: "ausbildung",
    label: "Ausbildung",
    exams: ["Kaufmann", "Fachinformatik", "Pflege", "Mechatronik", "Elektronik", "Handel"],
    topics: ["Pruefungsordnung lesen", "Fachbegriffe sichern", "Praxisfaelle ueben", "Rechenwege trainieren", "Muendliche Fragen ueben", "Checkliste pruefen"],
  },
  {
    key: "ihk",
    label: "IHK",
    exams: ["AEVO", "WISO", "Projektarbeit", "Fachgespraech", "Buchhaltung", "IT-Systeme"],
    topics: ["Rahmenplan markieren", "Musterfragen beantworten", "Zeitmanagement ueben", "Projektargumentation schaerfen", "Gesetzestexte ordnen", "Praesentation proben"],
  },
  {
    key: "fuehrerschein",
    label: "Fuehrerschein",
    exams: ["Klasse B Theorie", "Klasse A Theorie", "Gefahrzeichen", "Vorfahrt", "Technik", "Umwelt"],
    topics: ["Fragenkatalog lernen", "Fehlerfragen wiederholen", "Schilder trainieren", "Vorfahrtssituationen ueben", "Pruefungssimulation", "Ruheplan vor Pruefung"],
  },
];

function buildTemplateData(count = 80) {
  const templates = [];
  for (let i = 0; i < count; i += 1) {
    const cat = categories[i % categories.length];
    const exam = cat.exams[i % cat.exams.length];
    const days = 7 + (i % 42);
    const intensity = ["leicht", "ausgewogen", "intensiv", "crash"][i % 4];
    const topicItems = cat.topics.map((topic, index) => ({
      id: `${cat.key}-${slug(exam)}-${i + 1}-topic-${index + 1}`,
      title: topic,
      weight: 1 + ((i + index) % 5),
      minutes: 25 + (((i + index) % 4) * 15),
      done: false,
    }));
    templates.push({
      id: `${cat.key}-${slug(exam)}-${String(i + 1).padStart(3, "0")}`,
      category: cat.label,
      title: `${cat.label}: ${exam} ${i + 1}`,
      examType: exam,
      recommendedDays: days,
      intensity,
      color: ["#0a84ff", "#34c759", "#ff9f0a", "#ff375f", "#af52de"][i % 5],
      topics: topicItems,
      routine: [
        "10 Minuten Zielklaerung",
        "2 Fokusbloecke Lernen",
        "5 Minuten Fehlerliste",
        "1 Wiederholung am Abend",
      ],
      successRule: "Jeden Tag ein kleines Ergebnis sichtbar machen.",
    });
  }
  return `/* Generated template library for Pruefungs-Countdown. */\nwindow.PC_TEMPLATES = ${JSON.stringify(templates, null, 2)};\n`;
}

function buildStudyLibrary(count = 96) {
  const phrases = [
    "Heute zaehlt ein sauberer Fokusblock mehr als Perfektion.",
    "Eine alte Aufgabe mit Fehleranalyse ist besser als zehn ueberflogene Seiten.",
    "Schreibe die naechste Frage auf, bevor du aufhoerst.",
    "Wiederholung ist kein Rueckschritt, sondern Stabilisierung.",
    "Plane Pausen wie Termine, sonst nimmt sie dir der Kopf selbst.",
    "Starte mit dem schwierigsten Thema fuer nur zehn Minuten.",
    "Formuliere jedes Thema als pruefbare Frage.",
    "Verlasse den Lernblock mit einem sichtbaren Artefakt.",
  ];
  const library = [];
  for (let i = 0; i < count; i += 1) {
    const cat = categories[i % categories.length];
    library.push({
      id: `micro-guide-${String(i + 1).padStart(4, "0")}`,
      category: cat.label,
      title: `${cat.label} Lernimpuls ${i + 1}`,
      prompt: phrases[i % phrases.length],
      checklist: [
        `Thema: ${cat.topics[i % cat.topics.length]}`,
        "Ziel in einem Satz notieren",
        "Timer auf 25 Minuten stellen",
        "Nach dem Block Ergebnis abhaken",
      ],
      xp: 10 + (i % 9) * 5,
      duration: 15 + (i % 5) * 10,
      mode: ["Fokus", "Wiederholung", "Probe", "Reflexion", "Planung"][i % 5],
    });
  }
  return `/* Generated micro guide library for Pruefungs-Countdown. */\nwindow.PC_STUDY_LIBRARY = ${JSON.stringify(library, null, 2)};\n`;
}

function extractGeneratedArray(source, namespace) {
  const marker = `window.${namespace} = `;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Generated namespace ${namespace} was not found.`);
  }
  const payload = source.slice(markerIndex + marker.length).trim().replace(/;$/, "");
  return JSON.parse(payload);
}

function buildReferenceCatalog() {
  const templates = extractGeneratedArray(buildTemplateData(520), "PC_TEMPLATES");
  const studyGuides = extractGeneratedArray(buildStudyLibrary(760), "PC_STUDY_LIBRARY");
  return `/* Generated extended reference catalog.
   This file intentionally stays outside index.html startup loading so the PWA
   remains fast and smooth. It documents the complete planning library for
   future filters, richer template search and offline expansion packs. */
window.PC_REFERENCE_CATALOG = {
  templates: ${JSON.stringify(templates, null, 2)},
  studyGuides: ${JSON.stringify(studyGuides, null, 2)}
};
`;
}

const indexHtml = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; connect-src 'self'; manifest-src 'self'; worker-src 'self'">
<meta name="theme-color" content="#f7f4ee">
<title>Prüfungs-Countdown — Bytewerk Studio</title>
<meta name="description" content="Kostenlose installierbare PWA fuer Pruefungscountdown, Lernplan, Fokus-Timer, XP, Streaks, Heatmap und Export.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/icon-192.png">
<link rel="stylesheet" href="styles/app.css">
</head>
<body>
<div class="app-shell">
  <header class="topbar">
    <a class="brand" href="../../index.html" aria-label="Zur Bytewerk Website">
      <img src="assets/icon.svg" alt="" class="brand-icon">
      <span>Prüfungs-Countdown</span>
    </a>
    <nav class="top-actions" aria-label="App Aktionen">
      <button class="ios-button ghost" id="theme-toggle" type="button">Dark</button>
      <button class="ios-button ghost" id="install-button" type="button" hidden>Installieren</button>
      <button class="ios-button primary" id="new-exam-focus" type="button">Prüfung +</button>
    </nav>
  </header>

  <main>
    <section class="hero-card">
      <div>
        <p class="eyebrow">Kostenlos · offline · ohne Login</p>
        <h1>Dein Prüfungsplan, schön ruhig.</h1>
        <p class="hero-copy">Lege Prüfungen an, sieh den Countdown, plane Lernblöcke, sammle XP und exportiere deinen Plan. Alles bleibt lokal im Browser.</p>
        <div class="hero-actions">
          <button class="ios-button primary" id="hero-create" type="button">Erste Prüfung anlegen</button>
          <button class="ios-button secondary" id="load-demo" type="button">Demo laden</button>
        </div>
      </div>
      <div class="hero-phone" aria-hidden="true">
        <div class="phone-island"></div>
        <div class="phone-widget">
          <span>Nächste Prüfung</span>
          <strong id="hero-phone-title">Mathematik</strong>
          <em id="hero-phone-days">14 Tage</em>
        </div>
        <div class="phone-rings">
          <span></span><span></span><span></span>
        </div>
      </div>
    </section>

    <section class="dashboard-grid" aria-label="Übersicht">
      <article class="widget glass">
        <span class="widget-label">Nächste Prüfung</span>
        <strong id="next-exam-name">Noch keine Prüfung</strong>
        <p id="next-exam-countdown">Lege unten deine erste Prüfung an.</p>
      </article>
      <article class="widget glass">
        <span class="widget-label">Heute lernen</span>
        <strong id="today-minutes">0 min</strong>
        <p id="today-plan">Keine offenen Lernblöcke.</p>
      </article>
      <article class="widget glass">
        <span class="widget-label">XP & Streak</span>
        <strong><span id="xp-value">0</span> XP</strong>
        <p><span id="streak-value">0</span> Tage Streak</p>
      </article>
      <article class="widget glass">
        <span class="widget-label">Installierbar</span>
        <strong>PWA bereit</strong>
        <p>Auf Handy oder Desktop als App hinzufügen.</p>
      </article>
    </section>

    <section class="layout-grid">
      <aside class="panel">
        <div class="panel-head">
          <h2>Prüfung anlegen</h2>
          <span class="tiny">lokal gespeichert</span>
        </div>
        <form id="exam-form" class="stack">
          <label>Titel<input id="exam-title" required placeholder="z. B. Mathe Abitur"></label>
          <label>Datum<input id="exam-date" type="datetime-local" required></label>
          <label>Kategorie
            <select id="exam-category">
              <option>Abitur</option>
              <option>Universitaet</option>
              <option>Ausbildung</option>
              <option>IHK</option>
              <option>Fuehrerschein</option>
              <option>Sonstiges</option>
            </select>
          </label>
          <label>Vorlage
            <select id="template-select"></select>
          </label>
          <label>Themen<textarea id="exam-topics" rows="7" placeholder="Ein Thema pro Zeile"></textarea></label>
          <button class="ios-button primary full" type="submit">Speichern</button>
        </form>
      </aside>

      <section class="panel main-panel">
        <div class="panel-head">
          <h2>Prüfungen</h2>
          <div class="segmented" role="tablist">
            <button class="active" data-view="exams" type="button">Liste</button>
            <button data-view="week" type="button">Woche</button>
            <button data-view="heatmap" type="button">Heatmap</button>
          </div>
        </div>
        <div id="view-exams" class="view active"></div>
        <div id="view-week" class="view"></div>
        <div id="view-heatmap" class="view"></div>
      </section>
    </section>

    <section class="layout-grid lower-grid">
      <section class="panel">
        <div class="panel-head">
          <h2>Fokus-Timer</h2>
          <span class="tiny">25/5 Workflow</span>
        </div>
        <div class="timer-card">
          <div id="timer-display">25:00</div>
          <div class="timer-actions">
            <button class="ios-button primary" id="timer-start" type="button">Start</button>
            <button class="ios-button secondary" id="timer-pause" type="button">Pause</button>
            <button class="ios-button ghost" id="timer-reset" type="button">Reset</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Journal</h2>
          <span class="tiny">Reflexion</span>
        </div>
        <form id="journal-form" class="stack">
          <textarea id="journal-text" rows="4" placeholder="Was hast du heute gelernt?"></textarea>
          <button class="ios-button primary full" type="submit">Eintrag speichern</button>
        </form>
        <div id="journal-list" class="journal-list"></div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Export</h2>
          <span class="tiny">Backup</span>
        </div>
        <div class="export-grid">
          <button class="ios-button secondary" id="export-json" type="button">JSON exportieren</button>
          <button class="ios-button secondary" id="export-csv" type="button">CSV exportieren</button>
          <button class="ios-button secondary" id="print-plan" type="button">Drucken / PDF</button>
          <label class="file-button">JSON importieren<input id="import-json" type="file" accept="application/json"></label>
          <button class="ios-button ghost" id="notify-button" type="button">Benachrichtigung erlauben</button>
          <button class="ios-button danger" id="reset-app" type="button">Alles löschen</button>
        </div>
      </section>
    </section>

    <section class="panel library-panel">
      <div class="panel-head">
        <h2>Vorlagen & Lernimpulse</h2>
        <span class="tiny">Abi · Uni · Ausbildung · IHK · Führerschein</span>
      </div>
      <div id="guide-list" class="guide-grid"></div>
    </section>
  </main>
</div>

<div id="toast" class="toast" role="status" aria-live="polite"></div>

<script src="data/templates.js"></script>
<script src="data/study-library.js"></script>
<script src="scripts/core.js"></script>
<script src="scripts/app.js"></script>
<script src="scripts/install.js"></script>
</body>
</html>`;

const appCss = `:root {
  color-scheme: light;
  --bg: #f6f3ec;
  --bg-soft: #fffaf1;
  --panel: rgba(255, 255, 255, 0.72);
  --panel-strong: rgba(255, 255, 255, 0.92);
  --ink: #17171f;
  --muted: #777582;
  --line: rgba(28, 28, 32, 0.12);
  --blue: #0a84ff;
  --green: #34c759;
  --gold: #d69b26;
  --red: #ff375f;
  --purple: #af52de;
  --radius: 28px;
  --radius-sm: 18px;
  --shadow: 0 20px 70px rgba(31, 25, 16, 0.12);
  --shadow-soft: 0 8px 30px rgba(31, 25, 16, 0.08);
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #08090d;
  --bg-soft: #11131b;
  --panel: rgba(28, 30, 40, 0.72);
  --panel-strong: rgba(28, 30, 40, 0.92);
  --ink: #f8f8fb;
  --muted: #a0a0ad;
  --line: rgba(255, 255, 255, 0.12);
  --shadow: 0 20px 70px rgba(0, 0, 0, 0.42);
  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.28);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font);
  background:
    radial-gradient(circle at 18% 8%, rgba(255, 205, 90, 0.24), transparent 30%),
    radial-gradient(circle at 80% 10%, rgba(10, 132, 255, 0.18), transparent 26%),
    linear-gradient(180deg, var(--bg), var(--bg-soft));
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; }
button { border: 0; cursor: pointer; }
img { max-width: 100%; display: block; }

.app-shell {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: max(18px, env(safe-area-inset-top)) clamp(16px, 3vw, 42px) 42px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 14px 0 22px;
  backdrop-filter: blur(24px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 760;
  letter-spacing: -0.03em;
  font-size: clamp(18px, 2vw, 24px);
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  box-shadow: var(--shadow-soft);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ios-button, .file-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 720;
  border: 1px solid var(--line);
  color: var(--ink);
  background: var(--panel-strong);
  box-shadow: var(--shadow-soft);
  transition: transform .2s ease, background .2s ease, opacity .2s ease;
}

.ios-button:hover, .file-button:hover { transform: translateY(-1px); }
.ios-button.primary { background: var(--ink); color: var(--bg); }
.ios-button.secondary { background: rgba(10, 132, 255, 0.12); color: var(--blue); box-shadow: none; }
.ios-button.ghost { box-shadow: none; }
.ios-button.danger { background: rgba(255, 55, 95, 0.12); color: var(--red); box-shadow: none; }
.ios-button.full { width: 100%; }
.file-button { position: relative; overflow: hidden; }
.file-button input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.hero-card {
  position: relative;
  overflow: hidden;
  min-height: 520px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  align-items: center;
  gap: clamp(24px, 5vw, 80px);
  padding: clamp(28px, 5vw, 72px);
  border: 1px solid var(--line);
  border-radius: 42px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.48)),
    radial-gradient(circle at 80% 20%, rgba(255, 204, 88, .35), transparent 32%);
  box-shadow: var(--shadow);
}

[data-theme="dark"] .hero-card {
  background:
    linear-gradient(135deg, rgba(30,32,45,.9), rgba(18,20,30,.72)),
    radial-gradient(circle at 80% 20%, rgba(255, 204, 88, .18), transparent 32%);
}

.eyebrow {
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: .14em;
  font-size: 12px;
  font-weight: 800;
}

h1, h2, h3, p { margin: 0; }
h1 {
  margin-top: 16px;
  max-width: 11ch;
  font-size: clamp(54px, 8vw, 118px);
  line-height: .9;
  letter-spacing: -.07em;
}

.hero-copy {
  max-width: 58ch;
  margin-top: 24px;
  color: var(--muted);
  font-size: clamp(17px, 2vw, 22px);
  line-height: 1.55;
}

.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 30px; }

.hero-phone {
  width: min(100%, 360px);
  min-height: 480px;
  justify-self: center;
  border-radius: 48px;
  border: 1px solid rgba(255,255,255,.42);
  background: linear-gradient(180deg, #171b27, #07080c);
  box-shadow: 0 34px 90px rgba(0,0,0,.32);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.phone-island {
  width: 112px;
  height: 32px;
  border-radius: 999px;
  background: #06070b;
  margin: 0 auto;
}

.phone-widget {
  margin-top: 48px;
  padding: 22px;
  border-radius: 28px;
  color: #fff;
  background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.05));
  border: 1px solid rgba(255,255,255,.18);
}

.phone-widget span, .phone-widget em { display: block; color: rgba(255,255,255,.68); font-style: normal; }
.phone-widget strong { display: block; margin: 8px 0 28px; font-size: 28px; }
.phone-widget em { color: #ffd66b; font-size: 46px; font-weight: 800; letter-spacing: -.05em; }
.phone-rings { position: absolute; inset: auto 24px 24px; display: grid; gap: 10px; }
.phone-rings span { height: 18px; border-radius: 999px; background: rgba(255,255,255,.12); }
.phone-rings span:nth-child(2) { width: 72%; }
.phone-rings span:nth-child(3) { width: 46%; }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 18px 0;
}

.widget, .panel {
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(28px) saturate(1.35);
}

.widget { padding: 22px; min-height: 145px; }
.widget-label, .tiny {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .1em;
}
.widget strong { display: block; margin-top: 12px; font-size: clamp(22px, 3vw, 36px); letter-spacing: -.04em; }
.widget p { margin-top: 8px; color: var(--muted); line-height: 1.45; }

.layout-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.lower-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 18px; }
.panel { padding: 22px; }
.main-panel { min-height: 580px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
.panel h2 { font-size: 24px; letter-spacing: -.035em; }

.stack { display: grid; gap: 14px; }
label { display: grid; gap: 7px; color: var(--muted); font-size: 13px; font-weight: 740; }
input, textarea, select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--panel-strong);
  color: var(--ink);
  padding: 13px 14px;
  outline: none;
}
textarea { resize: vertical; line-height: 1.5; }
input:focus, textarea:focus, select:focus { border-color: var(--blue); box-shadow: 0 0 0 4px rgba(10,132,255,.12); }

.segmented {
  display: inline-flex;
  background: rgba(120,120,128,.12);
  border-radius: 999px;
  padding: 4px;
}
.segmented button {
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--muted);
  background: transparent;
  font-weight: 760;
}
.segmented button.active { background: var(--panel-strong); color: var(--ink); box-shadow: var(--shadow-soft); }

.view { display: none; }
.view.active { display: block; }

.exam-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--panel-strong);
  margin-bottom: 14px;
}
.exam-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.color-dot { width: 13px; height: 13px; border-radius: 99px; background: var(--blue); box-shadow: 0 0 0 6px rgba(10,132,255,.12); }
.exam-card h3 { font-size: 24px; letter-spacing: -.035em; }
.countdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 14px 0; }
.count-unit { border-radius: 16px; background: rgba(120,120,128,.1); padding: 12px; text-align: center; }
.count-unit strong { display: block; font-size: 26px; letter-spacing: -.05em; }
.count-unit span { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .09em; }
.topic-list { display: grid; gap: 8px; margin-top: 14px; }
.topic-row, .goal-row, .week-row, .journal-item, .guide-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(120,120,128,.08);
  padding: 12px;
}
.topic-row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; }
.topic-row.done { opacity: .58; text-decoration: line-through; }
.topic-row input { width: auto; }
.pill { display: inline-flex; align-items: center; gap: 6px; border-radius: 99px; padding: 6px 10px; background: rgba(10,132,255,.12); color: var(--blue); font-weight: 780; font-size: 12px; }
.exam-actions { display: flex; flex-direction: column; gap: 8px; min-width: 140px; }

.timer-card { text-align: center; padding: 24px; border-radius: 28px; background: radial-gradient(circle at 50% 0, rgba(255,214,107,.2), transparent 50%); }
#timer-display { font-size: clamp(56px, 8vw, 86px); font-weight: 860; letter-spacing: -.06em; }
.timer-actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
.export-grid { display: grid; gap: 10px; }
.journal-list { display: grid; gap: 10px; margin-top: 14px; max-height: 280px; overflow: auto; }
.journal-item time { display: block; color: var(--muted); font-size: 12px; margin-bottom: 4px; }
.guide-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.guide-card h3 { font-size: 16px; margin-bottom: 8px; }
.guide-card p { color: var(--muted); line-height: 1.45; }
.heatmap-grid { display: grid; grid-template-columns: repeat(14, 1fr); gap: 6px; }
.heat-cell { aspect-ratio: 1; border-radius: 7px; background: rgba(120,120,128,.12); border: 1px solid var(--line); }
.heat-cell[data-level="1"] { background: rgba(52,199,89,.22); }
.heat-cell[data-level="2"] { background: rgba(52,199,89,.42); }
.heat-cell[data-level="3"] { background: rgba(52,199,89,.72); }
.heat-cell[data-level="4"] { background: rgba(52,199,89,.95); }
.week-list { display: grid; gap: 10px; }
.week-row { display: grid; grid-template-columns: 110px 1fr auto; gap: 12px; align-items: center; }
.progress-track { height: 10px; border-radius: 99px; background: rgba(120,120,128,.14); overflow: hidden; margin-top: 10px; }
.progress-bar { height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, var(--blue), var(--green)); }
.toast {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
  pointer-events: none;
  background: var(--ink);
  color: var(--bg);
  border-radius: 999px;
  padding: 13px 18px;
  font-weight: 760;
  box-shadow: var(--shadow);
  transition: .25s ease;
  z-index: 100;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

@media print {
  .topbar, .hero-card, .panel:first-child, .lower-grid, .library-panel, .exam-actions, .segmented { display: none !important; }
  body { background: white; color: black; }
  .app-shell { padding: 0; }
  .panel, .widget, .exam-card { box-shadow: none; background: white; border-color: #ddd; }
  .view { display: block !important; }
}

@media (max-width: 1100px) {
  .hero-card, .layout-grid, .lower-grid { grid-template-columns: 1fr; }
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
  .guide-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-phone { display: none; }
}

@media (max-width: 640px) {
  .app-shell { padding-inline: 12px; }
  .topbar { align-items: flex-start; }
  .top-actions { width: 100%; }
  .ios-button, .file-button { flex: 1 1 auto; }
  h1 { font-size: 54px; }
  .hero-card { border-radius: 30px; padding: 24px; }
  .dashboard-grid, .guide-grid { grid-template-columns: 1fr; }
  .exam-card { grid-template-columns: 1fr; }
  .exam-actions { flex-direction: row; flex-wrap: wrap; }
  .countdown-grid { grid-template-columns: repeat(2, 1fr); }
  .week-row { grid-template-columns: 1fr; }
}`;

const coreJs = `(function () {
  const DAY = 24 * 60 * 60 * 1000;
  const STORE_KEY = "pc-state-v1";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function uid(prefix = "id") {
    const cryptoObj = window.crypto || {};
    if (cryptoObj.randomUUID) return prefix + "-" + cryptoObj.randomUUID();
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function todayKey(date = new Date()) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function dateLabel(date) {
    return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return createDefaultState();
      return migrate(JSON.parse(raw));
    } catch (error) {
      console.warn("State konnte nicht geladen werden", error);
      return createDefaultState();
    }
  }

  function save(state) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function createDefaultState() {
    return {
      version: 1,
      theme: "light",
      xp: 0,
      streak: { count: 0, lastDone: null },
      exams: [],
      journal: [],
      heatmap: {},
      settings: {
        focusMinutes: 25,
        breakMinutes: 5,
        notifications: false,
      },
    };
  }

  function migrate(state) {
    const base = createDefaultState();
    return {
      ...base,
      ...state,
      settings: { ...base.settings, ...(state.settings || {}) },
      streak: { ...base.streak, ...(state.streak || {}) },
      exams: Array.isArray(state.exams) ? state.exams : [],
      journal: Array.isArray(state.journal) ? state.journal : [],
      heatmap: state.heatmap && typeof state.heatmap === "object" ? state.heatmap : {},
    };
  }

  function countdownParts(target) {
    const diff = new Date(target).getTime() - Date.now();
    const safe = Math.max(0, diff);
    const days = Math.floor(safe / DAY);
    const hours = Math.floor((safe % DAY) / (60 * 60 * 1000));
    const minutes = Math.floor((safe % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((safe % (60 * 1000)) / 1000);
    return { total: diff, days, hours, minutes, seconds };
  }

  function progress(exam) {
    const topics = exam.topics || [];
    if (!topics.length) return 0;
    return Math.round((topics.filter((topic) => topic.done).length / topics.length) * 100);
  }

  function sortExams(exams) {
    return [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function nearestExam(exams) {
    return sortExams(exams).find((exam) => countdownParts(exam.date).total >= 0) || sortExams(exams)[0] || null;
  }

  function topicsFromText(text) {
    return String(text || "")
      .split(/\\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, index) => ({
        id: uid("topic"),
        title,
        weight: 1 + (index % 4),
        minutes: 25 + (index % 3) * 15,
        done: false,
      }));
  }

  function createExam({ title, date, category, topics, color }) {
    return {
      id: uid("exam"),
      title: title.trim(),
      date,
      category,
      color: color || ["#0a84ff", "#34c759", "#ff9f0a", "#af52de"][Math.floor(Math.random() * 4)],
      topics,
      blocks: buildBlocks(date, topics),
      goals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function buildBlocks(date, topics) {
    const target = new Date(date);
    const now = new Date();
    const days = Math.max(1, Math.ceil((target - now) / DAY));
    return topics.slice(0, Math.min(topics.length, 30)).map((topic, index) => {
      const blockDate = new Date(now.getTime() + Math.min(days - 1, index) * DAY);
      blockDate.setHours(18, 0, 0, 0);
      return {
        id: uid("block"),
        date: todayKey(blockDate),
        title: topic.title,
        minutes: topic.minutes || 30,
        done: false,
      };
    });
  }

  function exportJson(state) {
    download("pruefungs-countdown-backup.json", JSON.stringify(state, null, 2), "application/json");
  }

  function exportCsv(state) {
    const rows = [["Pruefung", "Kategorie", "Datum", "Thema", "Minuten", "Erledigt"]];
    state.exams.forEach((exam) => {
      (exam.topics || []).forEach((topic) => {
        rows.push([exam.title, exam.category, exam.date, topic.title, topic.minutes || "", topic.done ? "ja" : "nein"]);
      });
    });
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\\n");
    download("pruefungs-countdown-plan.csv", csv, "text/csv");
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function markStudyDay(state, minutes, xp) {
    const key = todayKey();
    const day = state.heatmap[key] || { minutes: 0, xp: 0, done: 0 };
    day.minutes += minutes;
    day.xp += xp;
    day.done += 1;
    state.heatmap[key] = day;
    state.xp += xp;
    if (state.streak.lastDone !== key) {
      const yesterday = todayKey(new Date(Date.now() - DAY));
      state.streak.count = state.streak.lastDone === yesterday ? state.streak.count + 1 : 1;
      state.streak.lastDone = key;
    }
  }

  function seedDemo() {
    const template = (window.PC_TEMPLATES || [])[0];
    const date = new Date(Date.now() + 14 * DAY);
    date.setHours(9, 0, 0, 0);
    const topics = (template?.topics || topicsFromText("Analysis\\nStochastik\\nGeometrie\\nAltklausur")).slice(0, 8).map((topic) => ({ ...topic, id: uid("topic") }));
    const state = createDefaultState();
    state.exams.push(createExam({ title: "Mathematik Abitur", date: date.toISOString().slice(0, 16), category: "Abitur", topics, color: "#0a84ff" }));
    state.journal.push({ id: uid("journal"), date: new Date().toISOString(), text: "Demo gestartet: Heute zwei Fokusbloecke fuer Analysis." });
    markStudyDay(state, 50, 40);
    return state;
  }

  function weekDates() {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return date;
    });
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }

  window.PC = {
    DAY,
    STORE_KEY,
    uid,
    todayKey,
    dateLabel,
    load,
    save,
    createDefaultState,
    countdownParts,
    progress,
    sortExams,
    nearestExam,
    topicsFromText,
    createExam,
    buildBlocks,
    exportJson,
    exportCsv,
    download,
    markStudyDay,
    seedDemo,
    weekDates,
    escapeHtml,
  };
})();`;

const appJs = `(function () {
  const PC = window.PC;
  let state = PC.load();
  let timer = {
    total: state.settings.focusMinutes * 60,
    remaining: state.settings.focusMinutes * 60,
    running: false,
    interval: null,
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const els = {
    form: $("#exam-form"),
    title: $("#exam-title"),
    date: $("#exam-date"),
    category: $("#exam-category"),
    template: $("#template-select"),
    topics: $("#exam-topics"),
    viewExams: $("#view-exams"),
    viewWeek: $("#view-week"),
    viewHeatmap: $("#view-heatmap"),
    nextName: $("#next-exam-name"),
    nextCountdown: $("#next-exam-countdown"),
    todayMinutes: $("#today-minutes"),
    todayPlan: $("#today-plan"),
    xp: $("#xp-value"),
    streak: $("#streak-value"),
    timerDisplay: $("#timer-display"),
    journalForm: $("#journal-form"),
    journalText: $("#journal-text"),
    journalList: $("#journal-list"),
    guideList: $("#guide-list"),
    toast: $("#toast"),
  };

  function init() {
    applyTheme();
    initDefaults();
    bindEvents();
    populateTemplates();
    renderAll();
    setInterval(renderCountdowns, 1000);
  }

  function initDefaults() {
    if (!els.date.value) {
      const next = new Date(Date.now() + 14 * PC.DAY);
      next.setHours(9, 0, 0, 0);
      els.date.value = next.toISOString().slice(0, 16);
    }
  }

  function bindEvents() {
    els.form.addEventListener("submit", onAddExam);
    $("#hero-create").addEventListener("click", () => els.title.focus());
    $("#new-exam-focus").addEventListener("click", () => els.title.focus());
    $("#load-demo").addEventListener("click", () => {
      state = PC.seedDemo();
      persist("Demo geladen");
    });
    $("#theme-toggle").addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      persist("Design gewechselt");
      applyTheme();
    });
    els.template.addEventListener("change", onTemplateChange);
    $$(".segmented button").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".segmented button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        $$(".view").forEach((view) => view.classList.remove("active"));
        $("#view-" + button.dataset.view).classList.add("active");
      });
    });
    $("#timer-start").addEventListener("click", startTimer);
    $("#timer-pause").addEventListener("click", pauseTimer);
    $("#timer-reset").addEventListener("click", resetTimer);
    els.journalForm.addEventListener("submit", onJournal);
    $("#export-json").addEventListener("click", () => PC.exportJson(state));
    $("#export-csv").addEventListener("click", () => PC.exportCsv(state));
    $("#print-plan").addEventListener("click", () => window.print());
    $("#reset-app").addEventListener("click", resetApp);
    $("#notify-button").addEventListener("click", requestNotifications);
    $("#import-json").addEventListener("change", importJson);
  }

  function populateTemplates() {
    const options = (window.PC_TEMPLATES || []).slice(0, 100).map((template) => {
      return '<option value="' + PC.escapeHtml(template.id) + '">' + PC.escapeHtml(template.title) + '</option>';
    });
    els.template.innerHTML = '<option value="">Ohne Vorlage</option>' + options.join("");
  }

  function onTemplateChange() {
    const template = findTemplate(els.template.value);
    if (!template) return;
    els.category.value = template.category;
    els.topics.value = template.topics.map((topic) => topic.title).join("\\n");
    if (!els.title.value) els.title.value = template.examType + " Prüfung";
  }

  function findTemplate(id) {
    return (window.PC_TEMPLATES || []).find((template) => template.id === id);
  }

  function onAddExam(event) {
    event.preventDefault();
    const template = findTemplate(els.template.value);
    const topics = els.topics.value.trim()
      ? PC.topicsFromText(els.topics.value)
      : (template?.topics || []).slice(0, 8).map((topic) => ({ ...topic, id: PC.uid("topic"), done: false }));
    if (!els.title.value.trim() || !els.date.value || !topics.length) {
      toast("Bitte Titel, Datum und mindestens ein Thema eintragen.");
      return;
    }
    const exam = PC.createExam({
      title: els.title.value,
      date: els.date.value,
      category: els.category.value,
      topics,
      color: template?.color,
    });
    state.exams.push(exam);
    els.form.reset();
    initDefaults();
    persist("Prüfung gespeichert");
  }

  function renderAll() {
    renderDashboard();
    renderExams();
    renderWeek();
    renderHeatmap();
    renderJournal();
    renderGuides();
    renderTimer();
  }

  function renderDashboard() {
    const nearest = PC.nearestExam(state.exams);
    const today = state.heatmap[PC.todayKey()] || { minutes: 0 };
    els.todayMinutes.textContent = today.minutes + " min";
    els.xp.textContent = state.xp;
    els.streak.textContent = state.streak.count;
    if (nearest) {
      els.nextName.textContent = nearest.title;
      els.todayPlan.textContent = (nearest.blocks || []).filter((block) => block.date === PC.todayKey() && !block.done).slice(0, 2).map((block) => block.title).join(", ") || "Heute: Wiederholen und ruhig bleiben.";
      $("#hero-phone-title").textContent = nearest.title;
    } else {
      els.nextName.textContent = "Noch keine Prüfung";
      els.nextCountdown.textContent = "Lege unten deine erste Prüfung an.";
      els.todayPlan.textContent = "Keine offenen Lernblöcke.";
    }
    renderCountdowns();
  }

  function renderCountdowns() {
    const nearest = PC.nearestExam(state.exams);
    if (!nearest) return;
    const parts = PC.countdownParts(nearest.date);
    const text = parts.total <= 0
      ? "Die Prüfung ist erreicht."
      : parts.days + " Tage · " + parts.hours + " Std · " + parts.minutes + " Min";
    els.nextCountdown.textContent = text;
    $("#hero-phone-days").textContent = parts.days + " Tage";
    $$(".exam-card").forEach((card) => {
      const exam = state.exams.find((item) => item.id === card.dataset.examId);
      if (!exam) return;
      const p = PC.countdownParts(exam.date);
      card.querySelector("[data-count-days]").textContent = p.days;
      card.querySelector("[data-count-hours]").textContent = p.hours;
      card.querySelector("[data-count-minutes]").textContent = p.minutes;
      card.querySelector("[data-count-seconds]").textContent = p.seconds;
    });
  }

  function renderExams() {
    if (!state.exams.length) {
      els.viewExams.innerHTML = '<div class="empty">Noch keine Prüfung. Lade eine Demo oder lege deine erste Prüfung an.</div>';
      return;
    }
    els.viewExams.innerHTML = PC.sortExams(state.exams).map(renderExamCard).join("");
    els.viewExams.querySelectorAll("[data-topic]").forEach((input) => input.addEventListener("change", onTopicToggle));
    els.viewExams.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", onDeleteExam));
    els.viewExams.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", onEditExam));
    els.viewExams.querySelectorAll("[data-block]").forEach((button) => button.addEventListener("click", onCompleteBlock));
  }

  function renderExamCard(exam) {
    const pct = PC.progress(exam);
    const topics = (exam.topics || []).map((topic) => {
      return '<label class="topic-row ' + (topic.done ? "done" : "") + '">' +
        '<input type="checkbox" data-topic="' + topic.id + '" data-exam="' + exam.id + '" ' + (topic.done ? "checked" : "") + '>' +
        '<span>' + PC.escapeHtml(topic.title) + '</span>' +
        '<em class="pill">' + (topic.minutes || 25) + ' min</em>' +
      '</label>';
    }).join("");
    const todayBlocks = (exam.blocks || []).filter((block) => block.date === PC.todayKey()).slice(0, 3).map((block) => {
      return '<button class="ios-button secondary" data-block="' + block.id + '" data-exam="' + exam.id + '" type="button">' + (block.done ? "✓ " : "") + PC.escapeHtml(block.title) + '</button>';
    }).join("");
    return '<article class="exam-card" data-exam-id="' + exam.id + '">' +
      '<div>' +
        '<div class="exam-title"><span class="color-dot" style="background:' + exam.color + '"></span><h3>' + PC.escapeHtml(exam.title) + '</h3><span class="pill">' + PC.escapeHtml(exam.category) + '</span></div>' +
        '<div class="countdown-grid">' +
          '<div class="count-unit"><strong data-count-days>0</strong><span>Tage</span></div>' +
          '<div class="count-unit"><strong data-count-hours>0</strong><span>Std</span></div>' +
          '<div class="count-unit"><strong data-count-minutes>0</strong><span>Min</span></div>' +
          '<div class="count-unit"><strong data-count-seconds>0</strong><span>Sek</span></div>' +
        '</div>' +
        '<div class="progress-track"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="topic-list">' + topics + '</div>' +
        '<div class="timer-actions">' + todayBlocks + '</div>' +
      '</div>' +
      '<div class="exam-actions">' +
        '<button class="ios-button secondary" data-edit="' + exam.id + '" type="button">Bearbeiten</button>' +
        '<button class="ios-button danger" data-delete="' + exam.id + '" type="button">Löschen</button>' +
      '</div>' +
    '</article>';
  }

  function renderWeek() {
    const dates = PC.weekDates();
    const rows = dates.map((date) => {
      const key = PC.todayKey(date);
      const blocks = state.exams.flatMap((exam) => (exam.blocks || []).filter((block) => block.date === key).map((block) => ({ ...block, exam: exam.title })));
      return '<div class="week-row">' +
        '<strong>' + PC.dateLabel(date) + '</strong>' +
        '<span>' + (blocks.map((block) => PC.escapeHtml(block.exam + ": " + block.title)).join("<br>") || "Puffer / Wiederholung") + '</span>' +
        '<em class="pill">' + blocks.reduce((sum, block) => sum + (block.minutes || 0), 0) + ' min</em>' +
      '</div>';
    });
    els.viewWeek.innerHTML = '<div class="week-list">' + rows.join("") + '</div>';
  }

  function renderHeatmap() {
    const cells = [];
    for (let i = 97; i >= 0; i -= 1) {
      const date = new Date(Date.now() - i * PC.DAY);
      const key = PC.todayKey(date);
      const day = state.heatmap[key] || { minutes: 0 };
      const level = day.minutes > 120 ? 4 : day.minutes > 75 ? 3 : day.minutes > 25 ? 2 : day.minutes > 0 ? 1 : 0;
      cells.push('<span class="heat-cell" title="' + key + ': ' + day.minutes + ' min" data-level="' + level + '"></span>');
    }
    els.viewHeatmap.innerHTML = '<div class="heatmap-grid">' + cells.join("") + '</div>';
  }

  function renderJournal() {
    els.journalList.innerHTML = state.journal.slice().reverse().slice(0, 12).map((item) => {
      return '<article class="journal-item"><time>' + new Date(item.date).toLocaleString("de-DE") + '</time><p>' + PC.escapeHtml(item.text) + '</p></article>';
    }).join("");
  }

  function renderGuides() {
    els.guideList.innerHTML = (window.PC_STUDY_LIBRARY || []).slice(0, 16).map((guide) => {
      return '<article class="guide-card"><h3>' + PC.escapeHtml(guide.title) + '</h3><p>' + PC.escapeHtml(guide.prompt) + '</p><span class="pill">' + guide.duration + ' min · ' + guide.xp + ' XP</span></article>';
    }).join("");
  }

  function onTopicToggle(event) {
    const exam = state.exams.find((item) => item.id === event.target.dataset.exam);
    const topic = exam?.topics.find((item) => item.id === event.target.dataset.topic);
    if (!topic) return;
    topic.done = event.target.checked;
    if (topic.done) PC.markStudyDay(state, topic.minutes || 25, 20);
    persist(topic.done ? "Thema erledigt +20 XP" : "Thema wieder offen");
  }

  function onCompleteBlock(event) {
    const exam = state.exams.find((item) => item.id === event.target.dataset.exam);
    const block = exam?.blocks.find((item) => item.id === event.target.dataset.block);
    if (!block || block.done) return;
    block.done = true;
    PC.markStudyDay(state, block.minutes || 25, 30);
    persist("Lernblock erledigt +30 XP");
  }

  function onDeleteExam(event) {
    const id = event.target.dataset.delete;
    if (!confirm("Diese Prüfung wirklich löschen?")) return;
    state.exams = state.exams.filter((exam) => exam.id !== id);
    persist("Prüfung gelöscht");
  }

  function onEditExam(event) {
    const exam = state.exams.find((item) => item.id === event.target.dataset.edit);
    if (!exam) return;
    const title = prompt("Titel bearbeiten", exam.title);
    if (!title) return;
    exam.title = title.trim();
    exam.updatedAt = new Date().toISOString();
    persist("Prüfung aktualisiert");
  }

  function onJournal(event) {
    event.preventDefault();
    const text = els.journalText.value.trim();
    if (!text) return;
    state.journal.push({ id: PC.uid("journal"), date: new Date().toISOString(), text });
    els.journalText.value = "";
    PC.markStudyDay(state, 5, 5);
    persist("Journal gespeichert +5 XP");
  }

  function startTimer() {
    if (timer.running) return;
    timer.running = true;
    timer.interval = setInterval(() => {
      timer.remaining -= 1;
      if (timer.remaining <= 0) {
        pauseTimer();
        PC.markStudyDay(state, Math.round(timer.total / 60), 35);
        persist("Fokusblock abgeschlossen +35 XP");
        notify("Fokusblock geschafft", "Sehr gut. Kurze Pause und dann weiter.");
        resetTimer();
      }
      renderTimer();
    }, 1000);
  }

  function pauseTimer() {
    timer.running = false;
    clearInterval(timer.interval);
  }

  function resetTimer() {
    pauseTimer();
    timer.total = state.settings.focusMinutes * 60;
    timer.remaining = timer.total;
    renderTimer();
  }

  function renderTimer() {
    const minutes = Math.floor(timer.remaining / 60);
    const seconds = timer.remaining % 60;
    els.timerDisplay.textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function requestNotifications() {
    if (!("Notification" in window)) {
      toast("Benachrichtigungen werden hier nicht unterstützt.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      state.settings.notifications = permission === "granted";
      persist(permission === "granted" ? "Benachrichtigungen erlaubt" : "Benachrichtigungen nicht erlaubt");
    });
  }

  function notify(title, body) {
    if (state.settings.notifications && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "assets/icon-192.png" });
    }
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = JSON.parse(reader.result);
        persist("Backup importiert");
      } catch (error) {
        toast("Import fehlgeschlagen");
      }
    };
    reader.readAsText(file);
  }

  function resetApp() {
    if (!confirm("Alle lokalen Daten löschen?")) return;
    state = PC.createDefaultState();
    persist("Alles gelöscht");
  }

  function persist(message) {
    PC.save(state);
    applyTheme();
    renderAll();
    toast(message);
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $("#theme-toggle").textContent = state.theme === "dark" ? "Light" : "Dark";
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  init();
})();`;

const installJs = `(function () {
  let deferredPrompt = null;
  const installButton = document.getElementById("install-button");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch((error) => {
        console.warn("Service Worker konnte nicht registriert werden", error);
      });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  if (installButton) {
    installButton.addEventListener("click", async () => {
      if (!deferredPrompt) {
        alert("Wenn dein Browser es unterstützt: Menü öffnen und 'App installieren' oder 'Zum Home-Bildschirm' wählen.");
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installButton.hidden = true;
    });
  }
})();`;

const manifest = {
  name: "Prüfungs-Countdown",
  short_name: "Countdown",
  description: "Kostenlose Lern- und Prüfungs-Countdown-App von Bytewerk Studio.",
  start_url: "./",
  scope: "./",
  display: "standalone",
  background_color: "#f6f3ec",
  theme_color: "#d69b26",
  orientation: "portrait-primary",
  icons: [
    { src: "assets/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
    { src: "assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
};

const serviceWorker = `const CACHE_NAME = "pruefungs-countdown-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles/app.css",
  "./scripts/core.js",
  "./scripts/app.js",
  "./scripts/install.js",
  "./data/templates.js",
  "./data/study-library.js",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="80" y1="40" x2="430" y2="470" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fff8e8"/>
      <stop offset=".48" stop-color="#f3c85f"/>
      <stop offset="1" stop-color="#0f2748"/>
    </linearGradient>
    <linearGradient id="ring" x1="90" y1="80" x2="420" y2="420" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffe28a"/>
      <stop offset="1" stop-color="#b87516"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0f1a2f" flood-opacity=".28"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="174" fill="#122844" opacity=".96" filter="url(#shadow)"/>
  <circle cx="256" cy="256" r="188" fill="none" stroke="url(#ring)" stroke-width="18"/>
  <path d="M159 164h194a28 28 0 0 1 28 28v164a28 28 0 0 1-28 28H159a28 28 0 0 1-28-28V192a28 28 0 0 1 28-28Z" fill="#fffaf0"/>
  <path d="M131 221h250" stroke="#d9b45a" stroke-width="14"/>
  <path d="M184 132v58M328 132v58" stroke="#fffaf0" stroke-width="24" stroke-linecap="round"/>
  <path d="M186 268h42M242 268h42M298 268h42M186 322h42M242 322h42" stroke="#142a47" stroke-width="16" stroke-linecap="round"/>
  <path d="M365 139 145 385" stroke="#f6c45d" stroke-width="16" stroke-linecap="round"/>
</svg>`;

const readme = `# Prüfungs-Countdown

Kostenlose installierbare PWA von Bytewerk Studio.

## Funktionen

- mehrere Prüfungen
- Countdown in Tagen, Stunden, Minuten und Sekunden
- Themen, Lernbloecke, Tagesziele
- Fokus-Timer
- XP, Streaks und Heatmap
- Journal
- JSON Import/Export
- CSV Export
- Druck-/PDF-Ansicht
- lokale Speicherung ohne Login und ohne Tracking

## Nutzung

Die App laeuft statisch auf GitHub Pages und kann im Browser als PWA installiert werden.
`;

ensureDir(appRoot);
write("apps/pruefungs-countdown/index.html", indexHtml);
write("apps/pruefungs-countdown/styles/app.css", appCss);
write("apps/pruefungs-countdown/scripts/core.js", coreJs);
write("apps/pruefungs-countdown/scripts/app.js", appJs);
write("apps/pruefungs-countdown/scripts/install.js", installJs);
write("apps/pruefungs-countdown/data/templates.js", buildTemplateData(80));
write("apps/pruefungs-countdown/data/study-library.js", buildStudyLibrary(96));
write("apps/pruefungs-countdown/data/reference-catalog.generated.js", buildReferenceCatalog());
write("apps/pruefungs-countdown/manifest.webmanifest", JSON.stringify(manifest, null, 2));
write("apps/pruefungs-countdown/service-worker.js", serviceWorker);
write("apps/pruefungs-countdown/assets/icon.svg", iconSvg);
write("apps/pruefungs-countdown/assets/logo.svg", iconSvg);
write("apps/pruefungs-countdown/README.md", readme);

console.log("Pruefungs-Countdown PWA generated at apps/pruefungs-countdown");
