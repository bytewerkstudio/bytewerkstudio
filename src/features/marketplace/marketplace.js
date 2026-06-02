import { qs, qsa, setView, formatCurrency, formatNumber, escapeHtml, openModal, productImage, toast } from "../../core/dom.js";
import { getState, patch, audit } from "../../core/store.js";
import { validateText } from "../../core/security.js";

const pageSize = 24;
let visible = pageSize;
let filters = {
  query: "",
  category: "all",
  owner: "all",
  sort: "featured",
};

function categories(products) {
  return Array.from(new Set(products.map((product) => product.category))).sort();
}

function filteredProducts() {
  const state = getState();
  const query = filters.query.toLowerCase();
  const result = state.products.filter((product) => {
    const search = [product.title, product.summary, product.seller, product.category, product.tags.join(" ")].join(" ").toLowerCase();
    const queryMatch = !query || search.includes(query);
    const categoryMatch = filters.category === "all" || product.category === filters.category;
    const ownerMatch = filters.owner === "all" || product.ownerType === filters.owner;
    return queryMatch && categoryMatch && ownerMatch;
  });
  return result.sort((a, b) => {
    if (filters.sort === "price-low") return a.price - b.price;
    if (filters.sort === "price-high") return b.price - a.price;
    if (filters.sort === "rating") return b.rating - a.rating;
    if (filters.sort === "downloads") return b.downloads - a.downloads;
    return (b.ownerType === "bytewerk") - (a.ownerType === "bytewerk") || b.rating - a.rating;
  });
}

function card(product) {
  return `
    <article class="product-card ${product.ownerType}" data-product-id="${product.id}">
      <img alt="" src="${productImage(product.id)}" loading="lazy">
      <div class="product-meta">
        <span class="pill">${escapeHtml(product.category)}</span>
        <span class="pill">${escapeHtml(product.risk)}</span>
        <span class="pill">${product.ownerType === "bytewerk" ? "Bytewerk" : "Seller"}</span>
      </div>
      <div class="product-title">
        <h3>${escapeHtml(product.title)}</h3>
        <p class="product-summary">${escapeHtml(product.summary)}</p>
      </div>
      <div class="pill-row">${product.tags.slice(0, 4).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="product-price">${formatCurrency(product.price)}</div>
      <div class="product-actions">
        <button class="button accent" type="button" data-shop-action="add" data-id="${product.id}">In den Warenkorb</button>
        <button class="icon-button" type="button" data-shop-action="wish" data-id="${product.id}">Save</button>
        <button class="icon-button" type="button" data-shop-action="detail" data-id="${product.id}">Info</button>
      </div>
    </article>
  `;
}

function renderGrid() {
  const products = filteredProducts();
  const grid = qs("[data-product-grid]");
  const meta = qs("[data-shop-meta]");
  const more = qs("[data-shop-more]");
  if (!grid || !meta || !more) return;
  grid.innerHTML = products.slice(0, visible).map(card).join("");
  meta.textContent = formatNumber(products.length) + " Treffer von " + formatNumber(getState().products.length) + " Produkten";
  more.hidden = visible >= products.length;
}

function detail(product) {
  openModal(`
    <div class="section-head">
      <div>
        <p class="eyebrow">${escapeHtml(product.seller)}</p>
        <h2>${escapeHtml(product.title)}</h2>
        <p>${escapeHtml(product.summary)}</p>
      </div>
      <button class="icon-button" type="button" data-action="close-modal">Close</button>
    </div>
    <div class="grid two">
      <div class="notice">
        <strong>Produktdetails</strong><br>
        Kategorie: ${escapeHtml(product.category)}<br>
        Lizenz: ${escapeHtml(product.license)}<br>
        Version: ${escapeHtml(product.version)}<br>
        Downloads: ${formatNumber(product.downloads)}<br>
        Preis: ${formatCurrency(product.price)}
      </div>
      <div class="notice">
        <strong>Security</strong><br>
        Status: ${escapeHtml(product.risk)}<br>
        Anforderungen: ${escapeHtml(product.requirements)}<br>
        Update: ${escapeHtml(product.updated)}
      </div>
    </div>
    <h3>Funktionen</h3>
    <div class="pill-row">${product.features.map((feature) => `<span class="pill">${escapeHtml(feature)}</span>`).join("")}</div>
  `);
}

function bindMarketplace() {
  qsa("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      visible = pageSize;
      renderGrid();
    });
  });
  qs("[data-shop-more]")?.addEventListener("click", () => {
    visible += pageSize;
    renderGrid();
  });
  qs("[data-product-grid]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shop-action]");
    if (!button) return;
    const product = getState().products.find((item) => item.id === button.dataset.id);
    if (!product) return;
    if (button.dataset.shopAction === "add") {
      patch((draft) => {
        draft.cart.push({ id: product.id, qty: 1, at: new Date().toISOString() });
      });
      audit("cart.add", { productId: product.id });
      toast(product.title + " wurde in den Warenkorb gelegt.");
    }
    if (button.dataset.shopAction === "wish") {
      patch((draft) => {
        if (!draft.wishlist.includes(product.id)) draft.wishlist.push(product.id);
      });
      audit("wishlist.add", { productId: product.id });
      toast("Produkt gespeichert.");
    }
    if (button.dataset.shopAction === "detail") {
      detail(product);
    }
  });
}

export function renderMarketplace({ app }, query) {
  filters.query = query.get("q") || filters.query || "";
  const state = getState();
  const categoryOptions = categories(state.products).map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  setView(
    app,
    `
      <section class="page">
        <div class="section-head">
          <div>
            <p class="eyebrow">Software Marketplace</p>
            <h1>Shop fuer Bytewerk und Seller.</h1>
            <p>Suche Software, Templates, Tools und digitale Produkte. Bytewerk Studio bleibt im Fokus, externe Seller koennen mitmachen.</p>
          </div>
          <a class="button secondary" href="#/seller">Seller werden</a>
        </div>
        <div class="toolbar">
          <label class="field">Suche<input data-filter="query" type="search" value="${escapeHtml(filters.query)}" placeholder="Software, Security, Dashboard..."></label>
          <label class="field">Kategorie<select data-filter="category"><option value="all">Alle</option>${categoryOptions}</select></label>
          <label class="field">Quelle<select data-filter="owner"><option value="all">Alle</option><option value="bytewerk">Bytewerk</option><option value="seller">Seller</option></select></label>
          <label class="field">Sortieren<select data-filter="sort"><option value="featured">Empfohlen</option><option value="rating">Bewertung</option><option value="downloads">Downloads</option><option value="price-low">Preis aufsteigend</option><option value="price-high">Preis absteigend</option></select></label>
        </div>
        <p class="notice" data-shop-meta>Produkte laden...</p>
        <div class="product-grid" data-product-grid></div>
        <button class="button secondary" type="button" data-shop-more>Mehr Produkte laden</button>
      </section>
    `
  );
  qsa("[data-filter]").forEach((field) => {
    if (field.dataset.filter === "category") field.value = filters.category;
    if (field.dataset.filter === "owner") field.value = filters.owner;
    if (field.dataset.filter === "sort") field.value = filters.sort;
  });
  renderGrid();
  bindMarketplace();
  if (query.get("focus") === "search") qs('[data-filter="query"]')?.focus();
}
