import { setView, formatCurrency, escapeHtml, toast } from "../../core/dom.js";
import { getState, getUser, patch, audit } from "../../core/store.js";
import { cartItems, cartTotal } from "./cart.js";
import { createId, validateText } from "../../core/security.js";

export function renderCheckout({ app }) {
  const items = cartItems();
  const user = getUser();
  setView(
    app,
    `
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Checkout</p><h1>Sicherer Demo-Checkout.</h1><p>Diese GitHub-Pages-Version simuliert Bestellungen lokal. Echte Zahlungen brauchen spaeter ein Payment-Backend.</p></div>
        </div>
        <div class="grid two">
          <form class="form-card" data-checkout-form>
            <h2>Bestelldaten</h2>
            <label class="field">Name<input name="name" value="${escapeHtml(user?.name || "")}" required></label>
            <label class="field">E-Mail<input name="email" type="email" value="${escapeHtml(user?.email || "")}" required></label>
            <label class="field">Lizenzhinweis<textarea name="note" placeholder="Optionaler Hinweis fuer Lizenz, Team oder Rechnung"></textarea></label>
            <button class="button accent" type="submit" ${items.length ? "" : "disabled"}>Demo-Bestellung abschliessen</button>
          </form>
          <aside class="panel" style="padding:18px;">
            <h2>Uebersicht</h2>
            ${
              items.length
                ? items.map((item) => `<p>${escapeHtml(item.product.title)} · ${formatCurrency(item.product.price)}</p>`).join("")
                : "<p>Der Warenkorb ist leer.</p>"
            }
            <h3>Summe: ${formatCurrency(cartTotal())}</h3>
          </aside>
        </div>
      </section>
    `
  );
  app.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = validateText(form.get("name"), { min: 2, max: 80, label: "Name" });
    const email = validateText(form.get("email"), { min: 4, max: 120, label: "E-Mail" });
    if (!name.ok || !email.ok) {
      toast(name.error || email.error, "error");
      return;
    }
    patch((draft) => {
      draft.orders.unshift({
        id: createId("order"),
        name: name.value,
        email: email.value,
        items: draft.cart,
        total: cartTotal(),
        status: "demo-paid",
        at: new Date().toISOString(),
      });
      draft.cart = [];
    });
    audit("checkout.demo", { items: items.length, total: cartTotal() });
    toast("Demo-Bestellung erstellt.");
    location.hash = "#/dashboard";
  });
}
