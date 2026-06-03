(function () {
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
      .split(/\n+/)
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
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\n");
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
    const topics = (template?.topics || topicsFromText("Analysis\nStochastik\nGeometrie\nAltklausur")).slice(0, 8).map((topic) => ({ ...topic, id: uid("topic") }));
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
})();