import { setView, toast } from "../../core/dom.js";
import { getState, patch, resetDemo, audit } from "../../core/store.js";

export function renderSettings({ app }) {
  const settings = getState().settings;
  setView(app, `
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
  `);
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
