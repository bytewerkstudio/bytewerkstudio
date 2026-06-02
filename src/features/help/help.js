import { setView } from "../../core/dom.js";

export function renderHelp({ app }) {
  setView(app, `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Hilfe</p><h1>So funktioniert der Shop.</h1><p>Kurze Anleitung fuer Buyer, Seller und Community-Mitglieder.</p></div></div>
      <div class="grid three">
        <article class="notice"><strong>Buyer</strong><br>Produkte suchen, merken, in den Warenkorb legen und Demo-Checkout abschliessen.</article>
        <article class="notice"><strong>Seller</strong><br>Einloggen, Produktdaten validieren und lokal veroeffentlichen.</article>
        <article class="notice"><strong>Community</strong><br>Themen erstellen, Antworten schreiben und Produktideen diskutieren.</article>
      </div>
    </section>
  `);
}
