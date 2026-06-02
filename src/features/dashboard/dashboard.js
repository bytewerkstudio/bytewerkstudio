import { setView, formatCurrency, formatNumber, escapeHtml } from "../../core/dom.js";
import { getState, getUser } from "../../core/store.js";

export function renderDashboard({ app }) {
  const state = getState();
  const user = getUser();
  const sellerName = user?.sellerName || user?.name || "";
  const products = state.products.filter((product) => product.seller === sellerName);
  const revenue = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  setView(app, `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Dashboard</p><h1>Kontrollzentrum.</h1><p>Bestellungen, Seller-Produkte, Wishlist, Audit und lokale Shop-Daten.</p></div></div>
      <div class="stats">
        <article class="stat-card"><strong>${formatNumber(state.orders.length)}</strong><span>Bestellungen</span></article>
        <article class="stat-card"><strong>${formatCurrency(revenue)}</strong><span>Demo-Umsatz</span></article>
        <article class="stat-card"><strong>${formatNumber(products.length)}</strong><span>Eigene Produkte</span></article>
        <article class="stat-card"><strong>${formatNumber(state.wishlist.length)}</strong><span>Wishlist</span></article>
      </div>
      <div class="dashboard-layout">
        <aside class="side-menu"><button class="is-active">Uebersicht</button><button>Bestellungen</button><button>Produkte</button><button>Audit</button></aside>
        <div class="dashboard-card">
          <h2>Letzte Aktivitaet</h2>
          <div class="table">
            ${state.audit.slice(0, 18).map((entry) => `<div class="table-row"><span>${escapeHtml(entry.action)}</span><span>${escapeHtml(entry.at)}</span><span>${escapeHtml(entry.userId || "guest")}</span><span>OK</span></div>`).join("") || "<p>Noch keine Aktivitaet.</p>"}
          </div>
        </div>
      </div>
    </section>
  `);
}
