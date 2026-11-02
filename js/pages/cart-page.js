/**
 * cart-page.js — Page du panier : quantités, retrait d'articles, code
 * promotionnel (fonctionnalité supplémentaire) et récapitulatif des montants.
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const CONFIG = window.MCS_CONFIG;
  const { $, el, formatMoney, toast } = MCS.utils;
  const { toCents } = MCS.pricing;

  MCS.boot(async () => {
    const products = await MCS.data.getProducts();
    let promoError = ''; // message d'erreur du dernier code essayé

    /** Ligne « Libellé ........ montant » du récapitulatif. */
    function summaryRow(label, value, className = '') {
      const row = el('div', `summary-row ${className}`.trim());
      row.append(el('span', '', label), el('span', '', value));
      return row;
    }

    /* ----------------------------- Lignes d'articles ----------------------------- */

    function buildLine(line) {
      const { product, qty } = line;
      const available = MCS.ui.isAvailable(product);
      const item = el('article', 'cart-line');

      const thumb = el('a', 'line-visual');
      thumb.href = `produit.html?id=${encodeURIComponent(product.id)}`;
      thumb.setAttribute('aria-label', `Voir ${product.name}`);
      thumb.append(MCS.ui.visual(product, 'visual-small'));

      const info = el('div', 'line-info');
      const name = el('a', 'line-name', product.name);
      name.href = thumb.href;
      info.append(name, el('p', 'line-unit', `${formatMoney(toCents(product.price))} l'unité`));
      if (!available) {
        info.append(el('p', 'line-warning', "Cet article n'est plus disponible : retirez-le pour commander."));
      } else if (product.stock !== null && product.stock < qty) {
        info.append(el('p', 'line-warning', `Stock limité à ${product.stock} : ajustez la quantité.`));
      }

      const controls = el('div', 'line-controls');
      if (available) {
        controls.append(MCS.ui.stepper({
          value: Math.min(qty, MCS.cart.limitFor(product)),
          max: MCS.cart.limitFor(product),
          onChange: (n) => { MCS.cart.setQty(product, n); render(); },
        }));
      }
      const remove = el('button', 'link-btn', 'Retirer');
      remove.type = 'button';
      remove.addEventListener('click', () => {
        MCS.cart.remove(product.id);
        toast(`« ${product.name} » retiré du panier.`, 'info', 2200);
        render();
      });
      controls.append(remove);

      item.append(thumb, info, controls, el('p', 'line-total', formatMoney(toCents(product.price) * qty)));
      return item;
    }

    /* ----------------------------- Récapitulatif ----------------------------- */

    /** Zone du code promotionnel. */
    function buildPromoBox(promo, totals) {
      const box = el('div', 'promo-box');

      if (promo) {
        const applied = el('div', 'promo-applied');
        applied.append(el('strong', '', promo.code));
        const remove = el('button', 'link-btn', 'Retirer le code');
        remove.type = 'button';
        remove.addEventListener('click', () => { MCS.cart.clearPromo(); promoError = ''; render(); });
        applied.append(remove);
        box.append(applied);

        if (!totals.promoApplied) {
          box.append(el('p', 'promo-note',
            `Ce code s'applique dès ${formatMoney(toCents(promo.min_subtotal))} d'achats.`));
        }
        return box;
      }

      const form = el('form', 'promo-form');
      form.noValidate = true;
      const label = el('label', 'visually-hidden', 'Code promotionnel');
      const input = el('input');
      input.type = 'text';
      input.id = 'promo-input';
      input.placeholder = 'Code promotionnel';
      input.autocomplete = 'off';
      input.maxLength = 30;
      label.htmlFor = 'promo-input';
      const button = el('button', 'btn btn-small', 'Appliquer');
      button.type = 'submit';
      form.append(label, input, button);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const code = input.value.trim();
        if (!code) { promoError = 'Saisissez un code.'; render(); return; }
        button.disabled = true;
        try {
          const result = await MCS.data.validatePromo(code, totals.subtotal);
          if (result.valid) {
            MCS.cart.setPromo({
              code: result.code, kind: result.kind,
              value: Number(result.value), min_subtotal: Number(result.min_subtotal),
            });
            promoError = '';
            toast(`Code ${result.code} appliqué.`, 'success');
          } else {
            promoError = MCS.data.promoMessage(result);
          }
        } catch (error) {
          console.error(error);
          promoError = "Impossible de vérifier le code pour l'instant.";
        }
        render();
      });

      box.append(form);
      if (promoError) {
        const message = el('p', 'form-error', promoError);
        message.setAttribute('role', 'alert');
        box.append(message);
      }
      return box;
    }

    function buildSummary(lines, totals, promo, blocked) {
      const box = $('#cart-summary');
      box.replaceChildren(el('h2', 'summary-title', 'Récapitulatif'));

      box.append(buildPromoBox(promo, totals));

      box.append(summaryRow('Sous-total', formatMoney(totals.subtotal)));
      if (totals.discount > 0) {
        box.append(summaryRow(`Rabais (${promo.code})`, `− ${formatMoney(totals.discount)}`, 'is-discount'));
      }
      let shippingText = formatMoney(totals.shipping);
      if (!totals.physical) shippingText = 'Aucune (services)';
      else if (totals.shipping === 0) shippingText = 'Offerte';
      box.append(summaryRow('Livraison', shippingText));
      box.append(summaryRow('TPS (5 %)', formatMoney(totals.tps)));
      box.append(summaryRow('TVQ (9,975 %)', formatMoney(totals.tvq)));
      box.append(summaryRow('Total', formatMoney(totals.total), 'is-total'));

      // Encouragement pour atteindre la livraison offerte
      if (totals.physical && totals.shipping > 0) {
        const missing = toCents(CONFIG.FREE_SHIPPING_MIN) - (totals.subtotal - totals.discount);
        if (missing > 0) {
          box.append(el('p', 'summary-hint', `Plus que ${formatMoney(missing)} pour la livraison offerte.`));
        }
      }

      if (blocked) {
        const disabled = el('button', 'btn btn-accent btn-block btn-large', 'Passer à la commande');
        disabled.type = 'button';
        disabled.disabled = true;
        box.append(disabled, el('p', 'form-error', 'Corrigez les articles signalés avant de commander.'));
      } else {
        const go = el('a', 'btn btn-accent btn-block btn-large', 'Passer à la commande');
        go.href = 'commande.html';
        box.append(go);
      }

      const more = el('a', 'link-btn summary-more', 'Continuer mes achats');
      more.href = 'boutique.html';
      box.append(more);
    }

    /* ----------------------------- Affichage principal ----------------------------- */

    function render() {
      const lines = MCS.cart.resolve(products);
      const layout = $('#cart-layout');
      const empty = $('#cart-empty');

      if (lines.length === 0) {
        layout.hidden = true;
        empty.hidden = false;
        empty.replaceChildren(MCS.ui.emptyState('Votre panier est vide', 'Parcourez la boutique pour trouver du matériel ou un service.', 'Voir la boutique', 'boutique.html'));
        return;
      }
      layout.hidden = false;
      empty.hidden = true;

      const promo = MCS.cart.getPromo();
      const totals = MCS.pricing.compute(lines, promo);
      const blocked = lines.some((l) => !MCS.ui.isAvailable(l.product) || (l.product.stock !== null && l.product.stock < l.qty));

      const container = $('#cart-lines');
      container.replaceChildren(...lines.map(buildLine));

      const clear = el('button', 'link-btn', 'Vider le panier');
      clear.type = 'button';
      clear.addEventListener('click', () => { MCS.cart.clear(); render(); });
      container.append(clear);

      buildSummary(lines, totals, promo, blocked);
    }

    render();
  });
})();
