import { setView, qs, toast } from "../../core/dom.js";
import { getState, getUser, patch, audit } from "../../core/store.js";
import { createId, hashSecret, loginLimiter, passwordScore, validateText } from "../../core/security.js";

function authMarkup(user) {
  if (user) {
    return `
      <section class="page">
        <div class="section-head">
          <div><p class="eyebrow">Account</p><h1>Du bist angemeldet.</h1><p>${user.name} · ${user.role}</p></div>
          <button class="button secondary" data-logout type="button">Abmelden</button>
        </div>
      </section>
    `;
  }
  return `
    <section class="page">
      <div class="section-head">
        <div><p class="eyebrow">Login</p><h1>Anmelden oder Seller werden.</h1><p>Demo-Accounts laufen sicher lokal im Browser. Fuer echte Nutzerkonten braucht es spaeter ein Backend.</p></div>
      </div>
      <div class="grid two">
        <form class="form-card" data-login-form>
          <h2>Anmelden</h2>
          <label class="field">E-Mail<input name="email" type="email" value="seller@bytewerk.local" required></label>
          <label class="field">Passwort<input name="password" type="password" value="demo" required></label>
          <button class="button accent" type="submit">Einloggen</button>
          <p class="notice">Demo: seller@bytewerk.local / demo oder admin@bytewerk.local / demo</p>
        </form>
        <form class="form-card" data-register-form>
          <h2>Registrieren</h2>
          <label class="field">Name<input name="name" required></label>
          <label class="field">E-Mail<input name="email" type="email" required></label>
          <label class="field">Seller Name<input name="sellerName" placeholder="Optional fuer Seller"></label>
          <label class="field">Passwort<input name="password" type="password" required data-password-input></label>
          <div class="security-meter"><div class="meter-line"><span data-meter></span></div><span data-meter-label>Passwortstaerke</span></div>
          <button class="button secondary" type="submit">Account erstellen</button>
        </form>
      </div>
    </section>
  `;
}

export function renderAuth({ app }) {
  const user = getUser();
  setView(app, authMarkup(user));
  qs("[data-logout]", app)?.addEventListener("click", () => {
    patch((draft) => {
      draft.sessionUserId = null;
    });
    audit("auth.logout");
    toast("Du bist abgemeldet.");
  });
  qs("[data-login-form]", app)?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");
    if (!loginLimiter(email)) {
      toast("Zu viele Versuche. Bitte kurz warten.", "error");
      return;
    }
    const found = getState().users.find((candidate) => candidate.email.toLowerCase() === email);
    const validDemo = found && found.passwordHash === "demo" && password === "demo";
    const validHash = found && found.passwordHash !== "demo" && (await hashSecret(password, found.salt)) === found.passwordHash;
    if (!found || (!validDemo && !validHash)) {
      audit("auth.failed", { email });
      toast("Login fehlgeschlagen.", "error");
      return;
    }
    patch((draft) => {
      draft.sessionUserId = found.id;
    });
    audit("auth.login", { email });
    toast("Willkommen zurueck.");
  });
  qs("[data-register-form]", app)?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = validateText(form.get("name"), { min: 2, max: 80, label: "Name" });
    const email = validateText(String(form.get("email") || "").toLowerCase(), { min: 4, max: 120, label: "E-Mail" });
    const sellerName = validateText(form.get("sellerName"), { min: 0, max: 80, label: "Seller Name" });
    const password = String(form.get("password") || "");
    if (!name.ok || !email.ok || !sellerName.ok) {
      toast(name.error || email.error || sellerName.error, "error");
      return;
    }
    if (passwordScore(password) < 45) {
      toast("Bitte ein staerkeres Passwort waehlen.", "error");
      return;
    }
    if (getState().users.some((candidate) => candidate.email.toLowerCase() === email.value)) {
      toast("Diese E-Mail ist bereits registriert.", "error");
      return;
    }
    const salt = createId("salt");
    const user = {
      id: createId("user"),
      name: name.value,
      email: email.value,
      role: sellerName.value ? "seller" : "buyer",
      sellerName: sellerName.value,
      salt,
      passwordHash: await hashSecret(password, salt),
      createdAt: new Date().toISOString(),
    };
    patch((draft) => {
      draft.users.push(user);
      draft.sessionUserId = user.id;
    });
    audit("auth.register", { email: user.email, role: user.role });
    toast("Account erstellt.");
  });
  qs("[data-password-input]", app)?.addEventListener("input", (event) => {
    const score = passwordScore(event.target.value);
    const meter = qs("[data-meter]", app);
    const label = qs("[data-meter-label]", app);
    if (meter) meter.style.width = score + "%";
    if (label) label.textContent = "Passwortstaerke: " + score + "%";
  });
}
