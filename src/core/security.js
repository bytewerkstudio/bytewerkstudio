const htmlMap = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#039;"],
]);

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (match) => htmlMap.get(match));
}

export function safeText(value, max = 5000) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized.slice(0, max);
}

export function validateText(value, options = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 240;
  const label = options.label ?? "Feld";
  const text = safeText(value, max + 20);
  if (text.length < min) return { ok: false, error: label + " ist zu kurz." };
  if (text.length > max) return { ok: false, error: label + " ist zu lang." };
  if (/[<>]/.test(text)) return { ok: false, error: label + " darf keine HTML-Zeichen enthalten." };
  return { ok: true, value: text };
}

export function passwordScore(password) {
  const value = String(password ?? "");
  let score = 0;
  if (value.length >= 10) score += 25;
  if (/[A-Z]/.test(value)) score += 20;
  if (/[a-z]/.test(value)) score += 15;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  return Math.min(score, 100);
}

export async function hashSecret(value, salt) {
  const source = String(salt) + ":" + String(value);
  const subtle = globalThis.crypto?.subtle;
  if (subtle && globalThis.TextEncoder) {
    const payload = new TextEncoder().encode(source);
    const hash = await subtle.digest("SHA-256", payload);
    return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let fallback = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    fallback ^= source.charCodeAt(index);
    fallback = Math.imul(fallback, 16777619);
  }
  return "fallback-" + (fallback >>> 0).toString(16);
}

export function createId(prefix = "id") {
  if (globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(2);
    globalThis.crypto.getRandomValues(array);
    return prefix + "-" + Array.from(array).map((item) => item.toString(36)).join("-");
  }
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function createRateLimiter(limit = 8, windowMs = 60000) {
  const buckets = new Map();
  return function rateLimit(key) {
    const now = Date.now();
    const current = buckets.get(key) || [];
    const recent = current.filter((time) => now - time < windowMs);
    recent.push(now);
    buckets.set(key, recent);
    return recent.length <= limit;
  };
}

export const loginLimiter = createRateLimiter(7, 60000);

export function securitySummary() {
  return [
    "CSP meta policy active",
    "No external scripts",
    "No eval",
    "Escaped user content",
    "Client-side rate limiting",
    "Local demo password hashing with fallback",
    "No server secrets in browser",
  ];
}
