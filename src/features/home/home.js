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
    `
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
          <div class="hero-panel-row"><span>Session</span><strong>${user ? user.name : "Gastmodus"}</strong></div>
          <div class="hero-panel-row"><span>Bytewerk Produkte</span><strong>${formatNumber(bytewerk)}</strong></div>
          <div class="hero-panel-row"><span>Seller</span><strong>${formatNumber(sellers)}</strong></div>
          <div class="hero-panel-row"><span>Demo-Warenwert</span><strong>${formatCurrency(value)}</strong></div>
        </aside>
      </div>
      <div class="stats">
        <article class="stat-card"><strong>${formatNumber(state.products.length)}</strong><span>Software-Produkte</span></article>
        <article class="stat-card"><strong>${formatNumber(state.topics.length)}</strong><span>Community-Themen</span></article>
        <article class="stat-card"><strong>${formatNumber(state.orders.length)}</strong><span>Demo-Bestellungen</span></article>
        <article class="stat-card"><strong>${formatNumber(state.audit.length)}</strong><span>Security-Audits</span></article>
      </div>
      <section class="grid three">
        <article class="notice"><strong>Seller Portal</strong><br>Seller koennen Produkte lokal veroeffentlichen, validieren und verwalten.</article>
        <article class="notice"><strong>Secure Frontend</strong><br>CSP, HTML-Escaping, sichere Demo-Sessions und keine externen Skripte.</article>
        <article class="notice"><strong>Community</strong><br>Forum mit Themen, Antworten, Votes und sauberer Textvalidierung.</article>
      </section>
    </section>
    `
  );
}
