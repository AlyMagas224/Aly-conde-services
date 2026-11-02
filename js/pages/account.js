/**
 * account.js — Page « Mon compte » : connexion, inscription, historique des
 * commandes et favoris.
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const { $, el, formatMoney, formatDate, getParam, safeNext, toast } = MCS.utils;

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_PASSWORD = 6;
  const PAYMENT_LABEL = { livraison: 'Paiement à la livraison / au rendez-vous', interac: 'Virement Interac' };

  /* ----------------------------- Utilitaires de formulaire ----------------------------- */

  function setMessage(id, text, kind = 'error') {
    const node = $(id);
    node.textContent = text;
    node.dataset.kind = kind;
  }

  function setBusy(form, busy) {
    form.querySelectorAll('input, button').forEach((control) => { control.disabled = busy; });
  }

  /** Bascule entre deux onglets/panneaux. names = [[boutonId, panneauId], …] */
  function bindTabs(pairs) {
    pairs.forEach(([tabId, panelId]) => {
      $(tabId).addEventListener('click', () => {
        pairs.forEach(([otherTab, otherPanel]) => {
          const active = otherTab === tabId;
          $(otherTab).classList.toggle('active', active);
          $(otherTab).setAttribute('aria-selected', String(active));
          $(otherPanel).hidden = !active;
        });
      });
    });
  }

  /* ----------------------------- Visiteur : connexion / inscription ----------------------------- */

  function showAuth() {
    $('#auth-section').hidden = false;
    bindTabs([['#tab-login', '#form-login'], ['#tab-signup', '#form-signup']]);

    // Retour à la page d'origine après la connexion (ex. la commande)
    const goNext = () => window.location.assign(safeNext(getParam('next')));

    $('#form-login').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const email = $('#login-email').value.trim();
      const password = $('#login-password').value;
      if (!EMAIL.test(email) || !password) {
        setMessage('#login-message', 'Saisissez votre courriel et votre mot de passe.');
        return;
      }
      setBusy(form, true);
      setMessage('#login-message', '');
      try {
        await MCS.data.signIn({ email, password });
        goNext();
      } catch (error) {
        setMessage('#login-message', error.message);
        setBusy(form, false);
      }
    });

    $('#form-signup').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const fullName = $('#signup-name').value.trim();
      const email = $('#signup-email').value.trim();
      const password = $('#signup-password').value;
      const confirm = $('#signup-confirm').value;

      if (fullName.length < 2) return setMessage('#signup-message', 'Saisissez votre nom complet.');
      if (!EMAIL.test(email)) return setMessage('#signup-message', 'Saisissez une adresse courriel valide.');
      if (password.length < MIN_PASSWORD) {
        return setMessage('#signup-message', `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
      }
      if (password !== confirm) return setMessage('#signup-message', 'Les mots de passe ne correspondent pas.');

      setBusy(form, true);
      setMessage('#signup-message', '');
      try {
        const result = await MCS.data.signUp({ fullName, email, password });
        if (result.needsConfirmation) {
          setMessage('#signup-message', 'Compte créé. Confirmez votre adresse avec le courriel reçu, puis connectez-vous.', 'success');
          setBusy(form, false);
        } else {
          goNext();
        }
      } catch (error) {
        setMessage('#signup-message', error.message);
        setBusy(form, false);
      }
      return undefined;
    });
  }

  /* ----------------------------- Client connecté ----------------------------- */

  /** Carte d'une commande de l'historique. */
  function buildOrder(order) {
    const card = el('article', 'order-card');

    const head = el('header', 'order-head');
    const title = el('div');
    title.append(el('h3', 'order-number', order.number), el('p', 'order-date', formatDate(order.createdAt)));
    head.append(title, el('span', 'badge badge-status', order.status));
    card.append(head);

    const list = el('ul', 'summary-items');
    order.items.forEach((item) => {
      const row = el('li', 'summary-item');
      row.append(el('span', '', `${item.qty} × ${item.name}`), el('span', '', formatMoney(item.unitPriceCents * item.qty)));
      list.append(row);
    });
    card.append(list);

    const totals = order.totals;
    const row = (label, value, cls = '') => {
      const r = el('div', `summary-row ${cls}`.trim());
      r.append(el('span', '', label), el('span', '', value));
      return r;
    };
    card.append(row('Sous-total', formatMoney(totals.subtotal)));
    if (totals.discount > 0) {
      card.append(row(order.promo ? `Rabais (${order.promo})` : 'Rabais', `− ${formatMoney(totals.discount)}`, 'is-discount'));
    }
    card.append(row('Livraison', totals.shipping === 0 ? 'Offerte / aucune' : formatMoney(totals.shipping)));
    card.append(row('TPS', formatMoney(totals.tps)));
    card.append(row('TVQ', formatMoney(totals.tvq)));
    card.append(row('Total', formatMoney(totals.total), 'is-total'));
    card.append(el('p', 'order-payment', PAYMENT_LABEL[order.payment] || order.payment));
    return card;
  }

  async function renderOrders() {
    const panel = $('#panel-orders');
    panel.replaceChildren();
    const orders = await MCS.data.getOrders();
    if (orders.length === 0) {
      panel.append(MCS.ui.emptyState('Aucune commande pour le moment', 'Vos commandes apparaîtront ici.', 'Voir la boutique', 'boutique.html'));
      return;
    }
    orders.forEach((order) => panel.append(buildOrder(order)));
  }

  async function renderFavorites() {
    const grid = $('#favorites-grid');
    const empty = $('#favorites-empty');
    grid.replaceChildren();

    const products = await MCS.data.getProducts();
    const favorites = products.filter((p) => MCS.ui.favorites.has(p.id));
    empty.hidden = favorites.length > 0;
    favorites.forEach((p) => grid.append(MCS.ui.productCard(p)));
  }

  function showDashboard(user) {
    $('#dashboard').hidden = false;
    $('#dash-name').textContent = `Bonjour, ${user.fullName.split(' ')[0]}`;
    $('#dash-email').textContent = user.email;
    bindTabs([['#tab-orders', '#panel-orders'], ['#tab-favorites', '#panel-favorites']]);

    $('#btn-logout').addEventListener('click', async () => {
      try {
        await MCS.data.signOut();
        window.location.assign('index.html');
      } catch (error) {
        console.error(error);
        toast('Erreur lors de la déconnexion.', 'error');
      }
    });

    // Retirer un favori depuis cette page met la liste à jour
    $('#favorites-grid').addEventListener('favorite-changed', renderFavorites);

    renderOrders().catch((error) => {
      console.error(error);
      toast('Impossible de charger vos commandes.', 'error');
    });
    renderFavorites();
  }

  /* ----------------------------- Démarrage ----------------------------- */

  MCS.boot(async (user) => {
    if (user) showDashboard(user); else showAuth();
  });
})();
