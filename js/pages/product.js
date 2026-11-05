/**
 * product.js — Fiche produit (produit.html?id=…) : détails, quantité,
 * ajout au panier, favoris et articles similaires.
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const { $, el, formatMoney, getParam } = MCS.utils;

  MCS.boot(async () => {
    const products = await MCS.data.getProducts();
    const product = products.find((p) => p.id === getParam('id'));
    const root = $('#product-detail');

    // Produit introuvable
    if (!product) {
      document.title = 'Article introuvable — ALY & CONDE Services';
      root.append(MCS.ui.emptyState('Article introuvable', "Ce produit n'existe pas ou n'est plus disponible.", 'Retour à la boutique', 'boutique.html'));
      return;
    }

    document.title = `${product.name} — ALY & CONDE Services`;
    $('#crumb-category').textContent = MCS.ui.categoryLabel(product.category);
    $('#crumb-category').href = `boutique.html?cat=${encodeURIComponent(product.category)}`;
    $('#crumb-name').textContent = product.name;

    /* --- Colonne visuel --- */
    const media = el('div', 'detail-media');
    media.append(MCS.ui.visual(product, 'visual-large'));

    /* --- Colonne informations --- */
    const info = el('div', 'detail-info');
    const title = el('h1', 'detail-title', product.name);
    const price = el('p', 'detail-price', formatMoney(MCS.pricing.toCents(product.price)));
    const stock = el('p', 'detail-stock');
    stock.append(MCS.ui.stockBadge(product));
    const description = el('p', 'detail-description', product.description);

    const list = el('ul', 'detail-points');
    product.details.forEach((point) => list.append(el('li', '', point)));

    /* --- Achat : quantité + bouton --- */
    const buy = el('div', 'detail-buy');
    let qty = 1;
    const available = MCS.ui.isAvailable(product);
    if (available) {
      buy.append(MCS.ui.stepper({ value: 1, max: MCS.cart.limitFor(product), onChange: (n) => { qty = n; } }));
    }
    const addButton = el('button', 'btn btn-primary btn-large', available ? 'Ajouter au panier' : 'Indisponible');
    addButton.type = 'button';
    addButton.disabled = !available;
    addButton.addEventListener('click', () => MCS.ui.addToCart(product, qty));
    buy.append(addButton, MCS.ui.favoriteButton(product, 'fav-btn fav-inline'));

    const note = el('p', 'detail-note',
      product.kind === 'service'
        ? "Service sur rendez-vous : nous vous contactons après la commande pour fixer la date."
        : 'Livraison offerte dès 100 $ d\'achats. Taxes calculées au panier.');

    info.append(title, price, stock, description, list, buy, note);
    root.append(media, info);

    /* --- Articles similaires (même catégorie) --- */
    const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
    if (similar.length > 0) {
      const grid = $('#similar-grid');
      similar.forEach((p) => grid.append(MCS.ui.productCard(p)));
      $('#similar-section').hidden = false;
    }
  });
})();
