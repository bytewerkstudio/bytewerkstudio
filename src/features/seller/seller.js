import { setView, toast, escapeHtml } from "../../core/dom.js";
import { getUser, getState, patch, audit, isSeller } from "../../core/store.js";
import { createId, validateText } from "../../core/security.js";

export function renderSeller({ app }) {
  const user = getUser();
  const seller = isSeller();
  const ownProducts = user ? getState().products.filter((product) => product.seller === (user.sellerName || user.name)) : [];
  setView(
    app,
    `
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Seller Portal</p><h1>Software veroeffentlichen.</h1><p>Seller koennen digitale Produkte anlegen. Bytewerk Studio bleibt kuratiert im Mittelpunkt.</p></div>
          ${user ? '<a class="button secondary" href="#/dashboard">Dashboard</a>' : '<a class="button accent" href="#/login">Anmelden</a>'}
        </div>
        ${
          user
            ? `
              <div class="grid two">
                <form class="form-card" data-product-form>
                  <h2>Neues Produkt</h2>
                  <label class="field">Titel<input name="title" required></label>
                  <label class="field">Kategorie<select name="category"><option>Bytewerk Core</option><option>AI Tools</option><option>Automation</option><option>Security</option><option>Analytics</option><option>Web Apps</option><option>Commerce</option></select></label>
                  <label class="field">Preis EUR<input name="price" type="number" min="0" max="9999" value="49" required></label>
                  <label class="field">Kurzbeschreibung<textarea name="summary" required></textarea></label>
                  <label class="field">Tags<input name="tags" placeholder="software, tool, secure"></label>
                  <button class="button accent" type="submit">Produkt lokal veroeffentlichen</button>
                </form>
                <div class="seller-card">
                  <h2>Seller Status</h2>
                  <p>${seller ? "Aktiv als Seller: " + escapeHtml(user.sellerName || user.name) : "Buyer Account. Mit Seller Name registrieren, um Produkte anzulegen."}</p>
                  <p>Eigene Produkte: ${ownProducts.length}</p>
                  <p>Moderationsmodus: Client-seitige Vorpruefung aktiv.</p>
                </div>
              </div>
              <div class="grid two">
                ${ownProducts.slice(0, 8).map((product) => `<article class="seller-card"><h3>${escapeHtml(product.title)}</h3><p>${escapeHtml(product.summary)}</p></article>`).join("")}
              </div>
            `
            : '<p class="notice">Bitte anmelden, um Seller-Funktionen zu nutzen.</p>'
        }
      </section>
    `
  );
  app.querySelector("[data-product-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = validateText(form.get("title"), { min: 4, max: 90, label: "Titel" });
    const summary = validateText(form.get("summary"), { min: 20, max: 440, label: "Beschreibung" });
    const tags = validateText(form.get("tags"), { min: 0, max: 120, label: "Tags" });
    const price = Math.max(0, Math.min(9999, Number(form.get("price") || 0)));
    if (!title.ok || !summary.ok || !tags.ok) {
      toast(title.error || summary.error || tags.error, "error");
      return;
    }
    const product = {
      id: createId("seller-product"),
      title: title.value,
      seller: user.sellerName || user.name,
      ownerType: user.sellerName === "Bytewerk Studio" ? "bytewerk" : "seller",
      category: String(form.get("category") || "Software"),
      price,
      summary: summary.value,
      license: "seller",
      rating: 4.2,
      downloads: 0,
      version: "1.0.0",
      risk: "new",
      tags: tags.value ? tags.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8) : ["seller", "new"],
      features: ["seller upload", "manual review", "local demo product"],
      requirements: "Seller is responsible for product content and support",
      updated: new Date().toISOString().slice(0, 10),
    };
    patch((draft) => {
      draft.products.unshift(product);
    });
    audit("seller.product.publish", { productId: product.id });
    toast("Produkt wurde lokal veroeffentlicht.");
  });
}
