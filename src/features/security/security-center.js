import { setView, escapeHtml } from "../../core/dom.js";
import { getState } from "../../core/store.js";
import { securitySummary } from "../../core/security.js";

export function renderSecurity({ app }) {
  const checks = securitySummary();
  const state = getState();
  setView(app, `
    <section class="page">
      <div class="section-head">
        <div><p class="eyebrow">Security Center</p><h1>Gehärtete Frontend-Basis.</h1><p>Diese statische Version schützt die Client-Seite. Vollstaendige Sicherheit gegen Angriffe braucht spaeter Server, Auth, Datenbank-Regeln und Monitoring.</p></div>
      </div>
      <div class="grid two">
        <article class="notice"><strong>Aktive Schutzmechanismen</strong><br>${checks.map((item) => "✓ " + escapeHtml(item)).join("<br>")}</article>
        <article class="notice"><strong>Offene Backend-Punkte</strong><br>Serverseitige Sessions<br>Zahlungsanbieter<br>Upload-Scanning<br>Seller-Verifikation<br>Rollenrechte in Datenbank</article>
      </div>
      <div class="dashboard-card">
        <h2>Audit Log</h2>
        <div class="table">${state.audit.slice(0, 28).map((entry) => `<div class="table-row"><span>${escapeHtml(entry.action)}</span><span>${escapeHtml(entry.at)}</span><span>${escapeHtml(entry.userId || "guest")}</span><span>tracked</span></div>`).join("") || "<p>Noch kein Audit.</p>"}</div>
      </div>
    </section>
  `);
}
