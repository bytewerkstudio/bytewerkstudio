import { setView, formatNumber, formatCurrency, escapeHtml } from "../../core/dom.js";
import { getState } from "../../core/store.js";

export function renderBytewerk({ app }) {
  const products = getState().products.filter((product) => product.ownerType === "bytewerk");
  const value = products.reduce((sum, product) => sum + product.price, 0);
  setView(app, `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Bytewerk Studio</p><h1>Der Kern des Marktplatzes.</h1><p>Bytewerk Studio bleibt Hauptanbieter. Externe Seller erweitern den Shop, aber Bytewerk setzt Qualitaet, Struktur und Sicherheitsstandard.</p></div></div>
      <div class="stats">
        <article class="stat-card"><strong>${formatNumber(products.length)}</strong><span>Bytewerk Produkte</span></article>
        <article class="stat-card"><strong>${formatCurrency(value)}</strong><span>Demo-Katalogwert</span></article>
        <article class="stat-card"><strong>2026</strong><span>Gruendung</span></article>
        <article class="stat-card"><strong>hhaqmal.de</strong><span>Gruender-Profil</span></article>
      </div>
      <div class="grid three">
        ${products.slice(0, 12).map((product) => `<article class="notice"><strong>${escapeHtml(product.title)}</strong><br>${escapeHtml(product.summary)}</article>`).join("")}
      </div>
    </section>
  `);
}
