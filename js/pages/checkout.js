/**
 * checkout.js — Page de commande : validation du formulaire, envoi de la
 * commande et confirmation.
 *
 * Aucun paiement en ligne n'est traité par ce site : le client choisit de
 * payer à la livraison / au rendez-vous, ou par virement Interac. (Un vrai
 * paiement par carte exigerait un fournisseur comme Stripe.)
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const { $, $$, el, formatMoney, toast } = MCS.utils;
  const { toCents } = MCS.pricing;

  // Livraison au Québec seulement : les taxes du site sont celles du Québec (voir config.js)
  const POSTAL_CODE = /^[GHJ]\d[A-Z][ -]?\d[A-Z]\d$/i;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const PAYMENT_TEXT = {
    livraison: 'Paiement à la réception de votre commande (ou au rendez-vous pour les services).',
    interac: 'Nous vous enverrons par courriel les instructions du virement Interac. La commande est traitée à la réception du paiement.',
  };

  MCS.boot(async (user) => {
    // Une commande exige un compte : on revient ici après la connexion
    if (!user) { window.location.replace('compte.html?next=commande.html'); return; }

    const products = await MCS.data.getProducts();
    const lines = MCS.cart.resolve(products);
    if (lines.length === 0) { window.location.replace('panier.html'); return; }
    if (lines.some((l) => !MCS.ui.isAvailable(l.product) || (l.product.stock !== null && l.product.stock < l.qty))) {
      toast('Certains articles ne sont plus disponibles : vérifiez votre panier.', 'error', 5000);
      window.location.replace('panier.html');
      return;
    }

    const promo = MCS.cart.getPromo();
    const totals = MCS.pricing.compute(lines, promo);
    const form = $('#checkout-form');

    // Les services seuls n'ont pas besoin d'adresse de livraison
    $('#address-group').hidden = !totals.physical;

    // Préremplissage à partir du compte
    $('#fullName').value = user.fullName || '';
    $('#email').value = user.email || '';

    /* ----------------------------- Récapitulatif ----------------------------- */

    function renderSummary() {
      const box = $('#checkout-summary');
      box.replaceChildren(el('h2', 'summary-title', 'Votre commande'));

      const list = el('ul', 'summary-items');
      lines.forEach(({ product, qty }) => {
        const item = el('li', 'summary-item');
        item.append(el('span', '', `${qty} × ${product.name}`), el('span', '', formatMoney(toCents(product.price) * qty)));
        list.append(item);
      });
      box.append(list);

      const row = (label, value, cls = '') => {
        const r = el('div', `summary-row ${cls}`.trim());
        r.append(el('span', '', label), el('span', '', value));
        return r;
      };
      box.append(row('Sous-total', formatMoney(totals.subtotal)));
      if (totals.discount > 0) box.append(row(`Rabais (${promo.code})`, `− ${formatMoney(totals.discount)}`, 'is-discount'));
      let shipping = formatMoney(totals.shipping);
      if (!totals.physical) shipping = 'Aucune (services)';
      else if (totals.shipping === 0) shipping = 'Offerte';
      box.append(row('Livraison', shipping));
      box.append(row('TPS (5 %)', formatMoney(totals.tps)));
      box.append(row('TVQ (9,975 %)', formatMoney(totals.tvq)));
      box.append(row('Total', formatMoney(totals.total), 'is-total'));

      const edit = el('a', 'link-btn summary-more', 'Modifier le panier');
      edit.href = 'panier.html';
      box.append(edit);
    }

    /* ----------------------------- Validation ----------------------------- */

    function setError(name, message) {
      if (!name) return; // champ sans identifiant (ex. boutons radio)
      const target = $(`#err-${name}`);
      const input = $(`#${name}`);
      if (target) target.textContent = message;
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    /** Retourne true si le formulaire est valide ; affiche les erreurs sinon. */
    function validate() {
      const value = (id) => $(`#${id}`).value.trim();
      const errors = {};

      if (value('fullName').length < 2) errors.fullName = 'Saisissez votre nom complet.';
      if (!EMAIL.test(value('email'))) errors.email = 'Saisissez une adresse courriel valide.';
      if (value('phone').replace(/\D/g, '').length < 10) errors.phone = 'Saisissez un numéro à 10 chiffres.';
      if (totals.physical) {
        if (value('street').length < 3) errors.street = 'Saisissez votre adresse.';
        if (value('city').length < 2) errors.city = 'Saisissez votre ville.';
        if (!POSTAL_CODE.test(value('postal'))) errors.postal = 'Code postal du Québec invalide (ex. G7H 2B1).';
      }

      ['fullName', 'email', 'phone', 'street', 'city', 'postal'].forEach((name) => setError(name, errors[name] || ''));
      const first = Object.keys(errors)[0];
      if (first) $(`#${first}`).focus();
      return !first;
    }

    /* ----------------------------- Confirmation ----------------------------- */

    function showConfirmation(result, customer, payment) {
      $('#checkout-layout').hidden = true;
      const box = $('#confirmation');
      box.hidden = false;
      box.replaceChildren();

      const card = el('div', 'confirmation-card');
      card.append(
        el('p', 'confirmation-icon', '✓'),
        el('h2', '', 'Merci, votre commande est enregistrée'),
        el('p', 'confirmation-number', `Numéro de commande : ${result.number}`),
        el('p', '', PAYMENT_TEXT[payment]),
      );

      const list = el('ul', 'summary-items');
      lines.forEach(({ product, qty }) => {
        const item = el('li', 'summary-item');
        item.append(el('span', '', `${qty} × ${product.name}`), el('span', '', formatMoney(toCents(product.price) * qty)));
        list.append(item);
      });
      card.append(list);
      card.append(el('p', 'confirmation-total', `Total : ${formatMoney(result.totals.total)}`));
      card.append(el('p', 'confirmation-text',
        `Nous vous contacterons à ${customer.email} pour le suivi. Vous retrouverez aussi cette commande dans votre compte.`));

      const actions = el('div', 'confirmation-actions');
      const orders = el('a', 'btn btn-primary', 'Voir mes commandes');
      orders.href = 'compte.html';
      const shop = el('a', 'btn', 'Continuer mes achats');
      shop.href = 'boutique.html';
      actions.append(orders, shop);
      card.append(actions);

      box.append(card);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ----------------------------- Envoi ----------------------------- */

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorBox = $('#form-error');
      errorBox.textContent = '';
      if (!validate()) return;

      const payment = form.elements.payment.value;
      const customer = {
        fullName: $('#fullName').value.trim(),
        email: $('#email').value.trim(),
        phone: $('#phone').value.trim(),
        address: totals.physical
          ? {
              street: $('#street').value.trim(),
              city: $('#city').value.trim(),
              province: 'QC',
              postal: $('#postal').value.trim().toUpperCase(),
            }
          : null,
      };

      const button = $('#place-order');
      button.disabled = true;
      button.textContent = 'Envoi en cours…';
      try {
        const result = await MCS.data.placeOrder({
          items: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
          promo: promo ? promo.code : null,
          customer,
          payment,
        });
        MCS.cart.clear();
        showConfirmation(result, customer, payment);
      } catch (error) {
        console.error(error);
        errorBox.textContent = error.message || "La commande n'a pas pu être enregistrée. Réessayez.";
        button.disabled = false;
        button.textContent = 'Confirmer la commande';
      }
    });

    // Effacer l'erreur d'un champ dès que l'utilisateur le modifie
    $$('#checkout-form input').forEach((input) => {
      input.addEventListener('input', () => setError(input.id, ''));
    });

    renderSummary();
  });
})();
