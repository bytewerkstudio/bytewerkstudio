import { setView, escapeHtml, toast } from "../../core/dom.js";
import { getState, getUser, patch, audit } from "../../core/store.js";
import { createId, validateText } from "../../core/security.js";

let area = "all";

function topicCard(topic) {
  return `
    <article class="forum-card">
      <div class="pill-row"><span class="pill">${escapeHtml(topic.area)}</span><span class="pill">${topic.votes} Votes</span><span class="pill">${escapeHtml(topic.author)}</span></div>
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.body)}</p>
      <div class="reply-list">
        ${topic.replies.slice(0, 3).map((reply) => `<div class="reply"><strong>${escapeHtml(reply.author)}</strong><br>${escapeHtml(reply.body)}</div>`).join("")}
      </div>
      <form class="form-grid" data-reply-form="${topic.id}">
        <label class="field">Antwort<textarea name="reply" placeholder="Hilfreiche Antwort schreiben"></textarea></label>
        <button class="button secondary" type="submit">Antwort posten</button>
      </form>
    </article>
  `;
}

export function renderForum({ app }) {
  const user = getUser();
  const topics = getState().topics.filter((topic) => area === "all" || topic.area === area);
  const areas = Array.from(new Set(getState().topics.map((topic) => topic.area))).sort();
  setView(
    app,
    `
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Community Forum</p><h1>Seller, Software und Bytewerk Community.</h1><p>Diskussionen, Hilfe, Security-Fragen und Produktideen an einem Ort.</p></div>
        </div>
        <div class="forum-grid">
          <div class="forum-list">
            <div class="toolbar" style="grid-template-columns:1fr auto;">
              <label class="field">Bereich<select data-area-filter><option value="all">Alle Bereiche</option>${areas.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}</select></label>
              <span class="notice">${topics.length} Themen</span>
            </div>
            ${topics.slice(0, 36).map(topicCard).join("")}
          </div>
          <aside class="form-card">
            <h2>Neues Thema</h2>
            ${user ? "" : '<p class="notice">Du kannst als Gast lesen. Zum Posten bitte anmelden.</p>'}
            <form class="form-grid" data-topic-form>
              <label class="field">Bereich<select name="area">${areas.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
              <label class="field">Titel<input name="title" required></label>
              <label class="field">Text<textarea name="body" required></textarea></label>
              <button class="button accent" type="submit" ${user ? "" : "disabled"}>Thema erstellen</button>
            </form>
          </aside>
        </div>
      </section>
    `
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
