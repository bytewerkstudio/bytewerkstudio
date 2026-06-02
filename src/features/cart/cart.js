import { qs, formatCurrency, escapeHtml, toast } from "../../core/dom.js";
import { getState, patch, audit } from "../../core/store.js";

export function updateCartCount() {
  const count = getState().cart.reduce((sum, item) => sum + item.qty, 0);
  const node = qs("[data-cart-count]");
  if (node) node.textContent = String(count);
}

export function cartItems() {
  const state = getState();
  return state.cart.map((entry) => {
    const product = state.products.find((item) => item.id === entry.id);
    return product ? { ...entry, product } : null;
  }).filter(Boolean);
}

export function cartTotal() {
  return cartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

export function renderCartDrawer() {
  const drawer = qs("[data-cart-drawer]");
  if (!drawer) return;
  const items = cartItems();
  drawer.innerHTML = `
    <div style="display:grid;grid-template-rows:auto 1fr auto;height:100%;">
      <div class="section-head" style="padding:18px;border-bottom:1px solid var(--line);">
        <div><p class="eyebrow">Warenkorb</p><h2>Deine Auswahl</h2></div>
        <button class="icon-button" type="button" data-action="close-cart">Close</button>
      </div>
      <div style="overflow:auto;padding:18px;display:grid;align-content:start;gap:10px;">
        ${
          items.length
            ? items.map((item) => `
              <article class="notice">
                <strong>${escapeHtml(item.product.title)}</strong><br>
                ${escapeHtml(item.product.seller)} · ${formatCurrency(item.product.price)}
                <div class="actions">
                  <button class="icon-button" data-cart-action="remove" data-id="${item.product.id}" type="button">Entfernen</button>
                </div>
              </article>
            `).join("")
            : '<p class="notice">Noch keine Produkte im Warenkorb.</p>'
        }
      </div>
      <div style="padding:18px;border-top:1px solid var(--line);">
        <p><strong>Summe: ${formatCurrency(cartTotal())}</strong></p>
        <a class="button accent" href="#/checkout" data-action="close-cart">Checkout</a>
      </div>
    </div>
  `;
  drawer.querySelectorAll("[data-cart-action='remove']").forEach((button) => {
    button.addEventListener("click", () => {
      patch((draft) => {
        draft.cart = draft.cart.filter((item) => item.id !== button.dataset.id);
      });
      audit("cart.remove", { productId: button.dataset.id });
      updateCartCount();
      renderCartDrawer();
      toast("Produkt entfernt.");
    });
  });
}
