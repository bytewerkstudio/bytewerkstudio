import { escapeHtml } from "./security.js";

export { escapeHtml };

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function html(strings, ...values) {
  return strings.reduce((result, part, index) => {
    const value = index < values.length ? escapeHtml(values[index]) : "";
    return result + part + value;
  }, "");
}

export function setView(target, markup) {
  target.innerHTML = markup;
  target.focus({ preventScroll: true });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("de-DE").format(Number(value || 0));
}

export function toast(message, type = "info") {
  const stack = qs("[data-toast-stack]");
  if (!stack) return;
  const node = document.createElement("div");
  node.className = "toast toast-" + type;
  node.textContent = message;
  stack.append(node);
  setTimeout(() => node.remove(), 3600);
}

export function openModal(markup) {
  const layer = qs("[data-modal-layer]");
  if (!layer) return;
  layer.innerHTML = '<div class="modal">' + markup + '</div>';
  layer.classList.add("is-open");
  layer.setAttribute("aria-hidden", "false");
}

export function closeModal() {
  const layer = qs("[data-modal-layer]");
  if (!layer) return;
  layer.classList.remove("is-open");
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = "";
}

export function productImage(seed) {
  const hue = Math.abs(String(seed).split("").reduce((total, char) => total + char.charCodeAt(0), 0)) % 360;
  return "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="460" viewBox="0 0 720 460">' +
      '<rect width="720" height="460" fill="hsl(' + hue + ' 16% 10%)"/>' +
      '<path d="M80 340 C180 180 290 420 410 180 S600 280 650 90" fill="none" stroke="hsl(' + ((hue + 80) % 360) + ' 80% 70%)" stroke-width="7" opacity=".78"/>' +
      '<circle cx="160" cy="150" r="52" fill="hsl(' + ((hue + 38) % 360) + ' 70% 62%)" opacity=".28"/>' +
      '<circle cx="540" cy="280" r="78" fill="hsl(' + ((hue + 140) % 360) + ' 70% 62%)" opacity=".18"/>' +
      '<text x="48" y="72" fill="#fff" font-family="Arial" font-size="34" font-weight="800">Bytewerk</text>' +
    '</svg>'
  );
}
