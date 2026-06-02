import { baseProducts } from "../features/marketplace/products.data.js";
import { baseTopics } from "../features/forum/forum.data.js";
import { createId } from "./security.js";

const KEY = "bytewerk-shop-v1";
const memoryStorage = new Map();

function storageGet(key) {
  try {
    if (globalThis.localStorage) return globalThis.localStorage.getItem(key);
  } catch {
    // restricted browser context, use memory fallback
  }
  return memoryStorage.get(key) || null;
}

function storageSet(key, value) {
  try {
    if (globalThis.localStorage) {
      globalThis.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // restricted browser context, use memory fallback
  }
  memoryStorage.set(key, value);
}

const defaults = {
  users: [
    {
      id: "user-bytewerk-admin",
      name: "Bytewerk Admin",
      email: "admin@bytewerk.local",
      role: "admin",
      sellerName: "Bytewerk Studio",
      salt: "demo",
      passwordHash: "demo",
      createdAt: "2026-01-01",
    },
    {
      id: "user-seller-demo",
      name: "Demo Seller",
      email: "seller@bytewerk.local",
      role: "seller",
      sellerName: "Demo Software Seller",
      salt: "demo",
      passwordHash: "demo",
      createdAt: "2026-01-01",
    },
  ],
  sessionUserId: null,
  products: baseProducts,
  topics: baseTopics,
  cart: [],
  wishlist: [],
  compare: [],
  orders: [],
  reviews: {},
  settings: {
    theme: "dark",
    density: "comfortable",
    privacy: "strict",
    notifications: true,
    sellerMode: true,
  },
  audit: [],
};

let state = load();

function load() {
  try {
    const raw = storageGet(KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaults),
      ...parsed,
      products: mergeProducts(parsed.products),
      topics: mergeTopics(parsed.topics),
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return structuredClone(defaults);
  }
}

function mergeProducts(products = []) {
  const map = new Map();
  [...baseProducts, ...products].forEach((product) => map.set(product.id, product));
  return Array.from(map.values());
}

function mergeTopics(topics = []) {
  const map = new Map();
  [...baseTopics, ...topics].forEach((topic) => map.set(topic.id, topic));
  return Array.from(map.values());
}

export function getState() {
  return state;
}

export function getUser() {
  return state.users.find((user) => user.id === state.sessionUserId) || null;
}

export function isSeller() {
  const user = getUser();
  return Boolean(user && (user.role === "seller" || user.role === "admin"));
}

export function save() {
  storageSet(KEY, JSON.stringify(state));
}

export function resetDemo() {
  state = structuredClone(defaults);
  save();
}

export function patch(mutator) {
  mutator(state);
  save();
  window.dispatchEvent(new CustomEvent("bytewerk:state"));
}

export function audit(action, details = {}) {
  patch((draft) => {
    draft.audit.unshift({
      id: createId("audit"),
      action,
      details,
      at: new Date().toISOString(),
      userId: draft.sessionUserId,
    });
    draft.audit = draft.audit.slice(0, 160);
  });
}
