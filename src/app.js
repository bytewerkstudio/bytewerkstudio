import { qs, qsa, closeModal, toast } from "./core/dom.js";
import { getState, patch } from "./core/store.js";
import { defineRoute, startRouter, navigate, currentRoute } from "./core/router.js";
import { startMotion } from "./features/motion/lines.js";
import { renderHome } from "./features/home/home.js";
import { renderMarketplace } from "./features/marketplace/marketplace.js";
import { renderAuth } from "./features/auth/auth.js";
import { renderSeller } from "./features/seller/seller.js";
import { renderForum } from "./features/forum/forum.js";
import { renderSettings } from "./features/settings/settings.js";
import { renderDashboard } from "./features/dashboard/dashboard.js";
import { renderSecurity } from "./features/security/security-center.js";
import { renderHelp } from "./features/help/help.js";
import { renderBytewerk } from "./features/bytewerk/bytewerk.js";
import { renderCheckout } from "./features/cart/checkout.js";
import { renderCartDrawer, updateCartCount } from "./features/cart/cart.js";

const app = qs("#app");

const navItems = [
  ["Home", "#/"],
  ["Shop", "#/shop"],
  ["Bytewerk", "#/bytewerk"],
  ["Seller", "#/seller"],
  ["Dashboard", "#/dashboard"],
  ["Forum", "#/forum"],
  ["Security", "#/security"],
  ["Login", "#/login"],
];

function renderNav() {
  const nav = qs("[data-nav]");
  const mobile = qs("[data-mobile-panel]");
  const active = "#/" + (currentRoute().route === "/" ? "" : currentRoute().route.replace(/^\//, ""));
  const markup = navItems
    .map(([label, href]) => '<a class="nav-link' + (href === active ? " is-active" : "") + '" href="' + href + '">' + label + "</a>")
    .join("");
  nav.innerHTML = markup;
  mobile.innerHTML = markup;
}

function applyTheme() {
  document.documentElement.dataset.theme = getState().settings.theme;
}

function bindGlobalActions() {
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "theme") {
      patch((draft) => {
        draft.settings.theme = draft.settings.theme === "dark" ? "light" : "dark";
      });
      applyTheme();
      toast("Designmodus gewechselt.");
    }
    if (action === "cart") {
      qs("[data-cart-drawer]").classList.add("is-open");
      qs("[data-cart-drawer]").setAttribute("aria-hidden", "false");
      renderCartDrawer();
    }
    if (action === "close-cart") {
      qs("[data-cart-drawer]").classList.remove("is-open");
      qs("[data-cart-drawer]").setAttribute("aria-hidden", "true");
    }
    if (action === "mobile-menu") {
      qs("[data-mobile-panel]").classList.toggle("is-open");
    }
    if (action === "close-modal") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      qs("[data-cart-drawer]").classList.remove("is-open");
      qs("[data-mobile-panel]").classList.remove("is-open");
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      navigate("/shop?focus=search");
    }
  });
}

function context() {
  return { app, renderNav };
}

defineRoute("/", renderHome);
defineRoute("/shop", renderMarketplace);
defineRoute("/login", renderAuth);
defineRoute("/seller", renderSeller);
defineRoute("/forum", renderForum);
defineRoute("/settings", renderSettings);
defineRoute("/dashboard", renderDashboard);
defineRoute("/security", renderSecurity);
defineRoute("/help", renderHelp);
defineRoute("/bytewerk", renderBytewerk);
defineRoute("/checkout", renderCheckout);

applyTheme();
startMotion(qs("#line-canvas"));
bindGlobalActions();
window.addEventListener("bytewerk:state", () => {
  renderNav();
  updateCartCount();
});
startRouter(context());
renderNav();
updateCartCount();
qsa("[data-mobile-panel] .nav-link").forEach((link) => {
  link.addEventListener("click", () => qs("[data-mobile-panel]").classList.remove("is-open"));
});
