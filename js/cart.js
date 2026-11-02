/**
 * cart.js — Panier d'achat, conservé dans le navigateur (localStorage) : il
 * survit au rechargement de la page et à la fermeture de l'onglet.
 *
 * Le panier ne contient que { id, qty } : les noms et les prix sont toujours
 * relus dans le catalogue, jamais dans le panier.
 *
 * Expose : MCS.cart
 * Événement : « mcs:cart » est émis sur window à chaque modification
 *             (l'en-tête met à jour le compteur).
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});
  const CONFIG = window.MCS_CONFIG;
  const { read, write } = MCS.utils;

  const CART_KEY = 'mcs.cart';
  const PROMO_KEY = 'mcs.promo';

  /** Lit le panier en ignorant toute ligne invalide (données corrompues). */
  function getLines() {
    const raw = read(CART_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter((l) => l && typeof l.id === 'string' && Number.isInteger(l.qty) && l.qty > 0);
  }

  function save(lines) {
    write(CART_KEY, lines);
    window.dispatchEvent(new CustomEvent('mcs:cart'));
  }

  /** Quantité maximale permise pour un produit (stock et limite par article). */
  function limitFor(product) {
    return product.stock === null ? CONFIG.MAX_QTY : Math.min(CONFIG.MAX_QTY, product.stock);
  }

  /**
   * Ajoute un produit.
   * @returns {{ok:boolean, capped:boolean, qty:number}}
   *   ok = false si rien n'a pu être ajouté ; capped = true si la quantité a été plafonnée.
   */
  function add(product, qty = 1) {
    const max = limitFor(product);
    const lines = getLines();
    const existing = lines.find((l) => l.id === product.id);
    const wanted = (existing ? existing.qty : 0) + qty;
    const finalQty = Math.min(wanted, max);

    if (finalQty < 1) return { ok: false, capped: true, qty: 0 };
    if (existing) existing.qty = finalQty; else lines.push({ id: product.id, qty: finalQty });
    save(lines);
    return { ok: true, capped: wanted > max, qty: finalQty };
  }

  function setQty(product, qty) {
    const lines = getLines();
    const line = lines.find((l) => l.id === product.id);
    if (!line) return;
    line.qty = Math.max(1, Math.min(qty, limitFor(product)));
    save(lines);
  }

  function remove(productId) {
    save(getLines().filter((l) => l.id !== productId));
  }

  function clear() {
    save([]);
    clearPromo();
  }

  /** Nombre total d'articles (pour le compteur de l'en-tête). */
  function count() {
    return getLines().reduce((sum, l) => sum + l.qty, 0);
  }

  /**
   * Associe chaque ligne à son produit du catalogue. Les articles qui n'existent
   * plus sont retirés du panier.
   * @returns {Array<{product:object, qty:number}>}
   */
  function resolve(products) {
    const lines = getLines();
    const resolved = [];
    for (const line of lines) {
      const product = products.find((p) => p.id === line.id);
      if (product) resolved.push({ product, qty: Math.min(line.qty, Math.max(limitFor(product), 1)) });
    }
    if (resolved.length !== lines.length) save(resolved.map((l) => ({ id: l.product.id, qty: l.qty })));
    return resolved;
  }

  /* ----------------------------- Code promotionnel ----------------------------- */

  function getPromo() { return read(PROMO_KEY, null); }
  function setPromo(promo) { write(PROMO_KEY, promo); }
  function clearPromo() { try { localStorage.removeItem(PROMO_KEY); } catch { /* ignoré */ } }

  MCS.cart = { getLines, add, setQty, remove, clear, count, resolve, limitFor, getPromo, setPromo, clearPromo };
})();
