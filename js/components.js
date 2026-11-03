/**
 * components.js — Composants d'interface réutilisés sur plusieurs pages
 * (carte produit, visuel, badge de stock, sélecteur de quantité, favoris…).
 * Expose : MCS.ui
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});
  const { el, formatMoney, toast } = MCS.utils;

  /** Identifiants des produits favoris de l'utilisateur connecté. */
  const favorites = new Set();

  /* ----------------------------- Catalogue ----------------------------- */

  function categoryLabel(categoryId) {
    const category = MCS.catalogue.categories.find((c) => c.id === categoryId);
    return category ? category.label : categoryId;
  }

  /** Visuel d'un produit : photo si « image » est renseigné, sinon emoji sur fond de couleur. */
  function visual(product, className = '') {
    const box = el('div', `visual ${className}`.trim());
    box.style.setProperty('--tile', product.color || '#d3e7e4');
    if (product.image) {
      const img = el('img', 'visual-img');
      img.src = product.image;
      img.alt = product.name;
      img.loading = 'lazy';
      box.append(img);
    } else {
      const emoji = el('span', 'visual-emoji', product.emoji || '📦');
      emoji.setAttribute('aria-hidden', 'true');
      box.append(emoji);
    }
    return box;
  }

  /** Petit badge de disponibilité. */
  function stockBadge(product) {
    if (product.kind === 'service') return el('span', 'badge badge-service', 'Sur rendez-vous');
    if (product.stock === 0) return el('span', 'badge badge-out', 'Rupture de stock');
    if (product.stock <= 5) return el('span', 'badge badge-low', `Plus que ${product.stock}`);
    return el('span', 'badge badge-ok', 'En stock');
  }

  const isAvailable = (product) => product.kind === 'service' || product.stock > 0;

  /* ----------------------------- Panier ----------------------------- */

  /** Ajoute au panier et informe l'utilisateur. */
  function addToCart(product, qty = 1) {
    if (!isAvailable(product)) {
      toast('Cet article est en rupture de stock.', 'error');
      return;
    }
    const result = MCS.cart.add(product, qty);
    if (!result.ok) {
      toast('Quantité maximale déjà dans votre panier.', 'error');
    } else if (result.capped) {
      toast(`Quantité limitée à ${result.qty} pour « ${product.name} ».`, 'info');
    } else {
      toast(`« ${product.name} » ajouté au panier.`, 'success', 2500, () => { window.location.href = 'panier.html'; });
    }
  }

  /** Sélecteur de quantité − [ n ] +. onChange reçoit la nouvelle quantité. */
  function stepper({ value, max, onChange, label = 'Quantité' }) {
    const wrap = el('div', 'stepper');
    const minus = el('button', 'stepper-btn', '−');
    const input = el('input', 'stepper-input');
    const plus = el('button', 'stepper-btn', '+');

    minus.type = 'button';
    plus.type = 'button';
    minus.setAttribute('aria-label', `Diminuer la ${label.toLowerCase()}`);
    plus.setAttribute('aria-label', `Augmenter la ${label.toLowerCase()}`);
    input.type = 'number';
    input.min = '1';
    input.max = String(max);
    input.value = String(value);
    input.setAttribute('aria-label', label);

    const set = (raw) => {
      const next = Math.max(1, Math.min(max, Math.floor(Number(raw)) || 1));
      input.value = String(next);
      onChange(next);
    };
    minus.addEventListener('click', () => set(Number(input.value) - 1));
    plus.addEventListener('click', () => set(Number(input.value) + 1));
    input.addEventListener('change', () => set(input.value));

    wrap.append(minus, input, plus);
    return wrap;
  }

  /* ----------------------------- Favoris ----------------------------- */

  async function loadFavorites() {
    favorites.clear();
    try {
      (await MCS.data.getFavorites()).forEach((id) => favorites.add(id));
    } catch (error) {
      console.error(error);
    }
  }

  function syncFavoriteButton(button, isFavorite) {
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? '♥' : '♡';
    button.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    button.setAttribute('aria-label', button.title);
  }

  /** Bouton cœur : ajoute/retire un favori (connexion requise). */
  function favoriteButton(product, className = 'fav-btn') {
    const button = el('button', className);
    button.type = 'button';
    syncFavoriteButton(button, favorites.has(product.id));

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      if (!MCS.session.user) {
        const next = window.location.pathname.split('/').pop() + window.location.search;
        toast('Connectez-vous pour utiliser les favoris.', 'info', 4500, () => {
          window.location.href = `compte.html?next=${encodeURIComponent(next)}`;
        });
        return;
      }
      button.disabled = true;
      try {
        const nowFavorite = await MCS.data.toggleFavorite(product.id);
        if (nowFavorite) favorites.add(product.id); else favorites.delete(product.id);
        syncFavoriteButton(button, nowFavorite);
        button.dispatchEvent(new CustomEvent('favorite-changed', { bubbles: true, detail: { product, nowFavorite } }));
      } catch (error) {
        console.error(error);
        toast("Impossible de modifier les favoris.", 'error');
      } finally {
        button.disabled = false;
      }
    });
    return button;
  }

  /* ----------------------------- Carte produit ----------------------------- */

  function productCard(product) {
    const card = el('article', 'card product-card');
    const href = `produit.html?id=${encodeURIComponent(product.id)}`;

    const link = el('a', 'card-visual');
    link.href = href;
    link.setAttribute('aria-label', `Voir ${product.name}`);
    link.append(visual(product));

    const body = el('div', 'card-body');
    const title = el('h3', 'card-title');
    const titleLink = el('a', '', product.name);
    titleLink.href = href;
    title.append(titleLink);

    const meta = el('div', 'card-meta');
    meta.append(el('span', 'price', formatMoney(MCS.pricing.toCents(product.price))), stockBadge(product));

    const addButton = el('button', 'btn btn-primary btn-block', 'Ajouter au panier');
    addButton.type = 'button';
    addButton.disabled = !isAvailable(product);
    if (!isAvailable(product)) addButton.textContent = 'Indisponible';
    addButton.addEventListener('click', () => addToCart(product, 1));

    body.append(el('p', 'card-category', categoryLabel(product.category)), title, meta, addButton);
    card.append(link, favoriteButton(product), body);
    return card;
  }

  /** Bloc « rien à afficher » avec un lien d'action. */
  function emptyState(title, text, linkLabel, href) {
    const box = el('div', 'empty-state');
    box.append(el('h2', '', title), el('p', '', text));
    if (linkLabel) {
      const link = el('a', 'btn btn-primary', linkLabel);
      link.href = href;
      box.append(link);
    }
    return box;
  }

  MCS.ui = {
    favorites, categoryLabel, visual, stockBadge, isAvailable, addToCart,
    stepper, loadFavorites, favoriteButton, productCard, emptyState,
  };
})();
