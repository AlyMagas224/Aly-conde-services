/**
 * home.js — Page d'accueil : produits « à la une » et compteurs par catégorie.
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const { $, $$ } = MCS.utils;

  MCS.boot(async () => {
    const products = await MCS.data.getProducts();

    // Produits mis en avant (4 au maximum)
    const grid = $('#featured-grid');
    products.filter((p) => p.featured).slice(0, 4).forEach((p) => grid.append(MCS.ui.productCard(p)));

    // « 10 articles » sur chaque carte de catégorie
    $$('[data-count-for]').forEach((node) => {
      const total = products.filter((p) => p.category === node.dataset.countFor).length;
      node.textContent = `${total} ${total > 1 ? 'articles' : 'article'}`;
    });
  });
})();
