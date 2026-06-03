(function () {
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
    els.topics.value = template.topics.map((topic) => topic.title).join("\n");
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
})();