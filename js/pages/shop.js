/**
 * shop.js — Boutique : recherche, filtre par catégorie, tri et disponibilité.
 * Les filtres sont conservés dans l'adresse (?cat=…&q=…) : une recherche peut
 * être partagée par lien et le bouton « Précédent » fonctionne.
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const { $, el, getParam, normalize, debounce } = MCS.utils;

  const SORTS = {
    pertinence: (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'fr'),
    'prix-asc': (a, b) => a.price - b.price,
    'prix-desc': (a, b) => b.price - a.price,
    nom: (a, b) => a.name.localeCompare(b.name, 'fr'),
  };

  MCS.boot(async () => {
    const products = await MCS.data.getProducts();
    const validCategories = MCS.catalogue.categories.map((c) => c.id);

    // État des filtres, lu dans l'adresse
    const state = {
      q: getParam('q') || '',
      cat: validCategories.includes(getParam('cat')) ? getParam('cat') : 'tous',
      sort: SORTS[getParam('sort')] ? getParam('sort') : 'pertinence',
      inStock: getParam('stock') === '1',
    };

    // Sur téléphone, les filtres sont repliés pour laisser voir les produits
    $('#filters-details').open = !window.matchMedia('(max-width: 820px)').matches;

    const searchInput = $('#search');
    const sortSelect = $('#sort');
    const stockCheck = $('#in-stock');
    const chips = $('#category-filter');
    const grid = $('#product-grid');
    const count = $('#results-count');

    searchInput.value = state.q;
    sortSelect.value = state.sort;
    stockCheck.checked = state.inStock;

    /* --- Pastilles de catégories --- */
    const categoryOptions = [{ id: 'tous', label: 'Tous les articles' }, ...MCS.catalogue.categories];
    categoryOptions.forEach((category) => {
      const button = el('button', 'chip', category.label);
      button.type = 'button';
      button.dataset.cat = category.id;
      button.addEventListener('click', () => { state.cat = category.id; update(); });
      chips.append(button);
    });

    /* --- Affichage --- */
    function update() {
      // Pastille active
      chips.querySelectorAll('.chip').forEach((chip) => {
        chip.setAttribute('aria-pressed', String(chip.dataset.cat === state.cat));
      });

      // Filtrage
      const query = normalize(state.q.trim());
      const results = products
        .filter((p) => state.cat === 'tous' || p.category === state.cat)
        .filter((p) => !state.inStock || MCS.ui.isAvailable(p))
        .filter((p) => !query || normalize(`${p.name} ${p.description}`).includes(query))
        .sort(SORTS[state.sort]);

      // Rendu
      grid.replaceChildren();
      if (results.length === 0) {
        grid.append(MCS.ui.emptyState('Aucun résultat', 'Essayez un autre mot-clé ou retirez certains filtres.'));
      } else {
        results.forEach((p) => grid.append(MCS.ui.productCard(p)));
      }
      count.textContent = `${results.length} ${results.length > 1 ? 'articles' : 'article'}`;

      // Adresse (sans recharger la page)
      const params = new URLSearchParams();
      if (state.q.trim()) params.set('q', state.q.trim());
      if (state.cat !== 'tous') params.set('cat', state.cat);
      if (state.sort !== 'pertinence') params.set('sort', state.sort);
      if (state.inStock) params.set('stock', '1');
      const queryString = params.toString();
      try {
        history.replaceState(null, '', queryString ? `?${queryString}` : window.location.pathname);
      } catch {
        // Certains navigateurs refusent replaceState pour un fichier ouvert directement (file://) : sans gravité
      }
    }

    /* --- Événements --- */
    searchInput.addEventListener('input', debounce(() => { state.q = searchInput.value; update(); }, 200));
    sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; update(); });
    stockCheck.addEventListener('change', () => { state.inStock = stockCheck.checked; update(); });
    $('#reset-filters').addEventListener('click', () => {
      Object.assign(state, { q: '', cat: 'tous', sort: 'pertinence', inStock: false });
      searchInput.value = '';
      sortSelect.value = 'pertinence';
      stockCheck.checked = false;
      update();
    });

    update();
  });
})();
