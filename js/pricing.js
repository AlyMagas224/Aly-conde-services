/**
 * pricing.js — Calcul du sous-total, du rabais, de la livraison, des taxes
 * et du total. Fonction PURE : mêmes entrées, mêmes sorties, aucun effet de bord.
 *
 * Tous les montants sont en CENTS (nombres entiers) pour éviter les erreurs
 * d'arrondi des nombres décimaux (0,1 + 0,2 ≠ 0,3 en JavaScript).
 *
 * Ces règles sont dupliquées dans la fonction SQL place_order() : en mode
 * Supabase, c'est le serveur qui fait foi ; ce fichier sert à l'affichage
 * (panier) et au mode démonstration.
 *
 * Expose : MCS.pricing.compute(lines, promo), MCS.pricing.toCents(dollars)
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});
  const CONFIG = window.MCS_CONFIG;

  const toCents = (dollars) => Math.round(dollars * 100);

  /**
   * Taxe en cents. Le taux est converti en entier (0,09975 → 9975) pour que
   * la multiplication reste exacte avant la division finale.
   */
  function taxOf(baseCents, rate) {
    return Math.round((baseCents * Math.round(rate * 100000)) / 100000);
  }

  /**
   * @param {Array<{product:{price:number,kind:string}, qty:number}>} lines
   * @param {{kind:string, value:number, min_subtotal:number}|null} promo  code déjà validé
   * @returns {{subtotal:number, discount:number, shipping:number, tps:number, tvq:number,
   *            total:number, promoApplied:boolean, physical:boolean, freeShipping:boolean}}
   */
  function compute(lines, promo = null) {
    const subtotal = lines.reduce((sum, l) => sum + toCents(l.product.price) * l.qty, 0);
    const physical = lines.some((l) => l.product.kind !== 'service');

    // Rabais : le code ne s'applique que si le minimum d'achat est atteint
    const promoApplied = Boolean(promo) && subtotal >= toCents(promo.min_subtotal || 0);
    let discount = 0;
    let freeByCode = false;
    if (promoApplied && promo.kind === 'percent') {
      discount = Math.round((subtotal * promo.value) / 100);
    }
    if (promoApplied && promo.kind === 'free_shipping') {
      freeByCode = true;
    }

    // Livraison : uniquement s'il y a des produits physiques
    const freeThreshold = toCents(CONFIG.FREE_SHIPPING_MIN);
    const shipping = physical && !freeByCode && subtotal - discount < freeThreshold
      ? toCents(CONFIG.SHIPPING_FLAT)
      : 0;

    // Taxes sur (sous-total - rabais + livraison)
    const taxable = subtotal - discount + shipping;
    const tps = taxOf(taxable, CONFIG.TPS_RATE);
    const tvq = taxOf(taxable, CONFIG.TVQ_RATE);

    return {
      subtotal,
      discount,
      shipping,
      tps,
      tvq,
      total: taxable + tps + tvq,
      promoApplied,
      physical,
      freeShipping: physical && shipping === 0,
    };
  }

  MCS.pricing = { compute, toCents };
})();
