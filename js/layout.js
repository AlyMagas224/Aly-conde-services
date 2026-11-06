/**
 * layout.js — Structure commune à toutes les pages : en-tête (logo, navigation,
 * compte, panier) et pied de page. Fournit aussi MCS.boot(), le point de
 * départ de chaque page.
 *
 * Utilisation dans une page :
 *     MCS.boot(async (user) => { ...code de la page... });
 * boot() attend le DOM, dessine l'en-tête et le pied de page, initialise les
 * données, charge l'utilisateur connecté, puis exécute la fonction de la page.
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});
  const CONFIG = window.MCS_CONFIG;
  const { $, $$, el, getParam, toast } = MCS.utils;

  /** Utilisateur connecté (null si visiteur). Mis à jour par boot(). */
  MCS.session = { user: null };

  /* ----------------------------- En-tête ----------------------------- */

  const HEADER_HTML = `
    <a class="skip-link" href="#main">Aller au contenu principal</a>
    <div class="header-inner container">
      <a class="wordmark" href="index.html" aria-label="ALY &amp; CONDE Services — accueil">
        <span class="wm-name">ALY <em>&amp;</em> CONDE</span>
        <span class="wm-sub">Services</span>
      </a>

      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="site-nav">
        <span class="visually-hidden">Menu</span><span aria-hidden="true">☰</span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="Navigation principale">
        <a href="index.html" data-nav="home">Accueil</a>
        <a href="boutique.html" data-nav="shop">Boutique</a>
        <a href="boutique.html?cat=services" data-nav="services">Services</a>
        <a href="contact.html" data-nav="contact">Contact</a>
      </nav>

      <div class="header-actions">
        <a class="header-link" id="account-link" href="compte.html" data-nav="account">Connexion</a>
        <a class="cart-link" href="panier.html" data-nav="cart" aria-label="Panier">
          <span aria-hidden="true">🛒</span>
          <span class="cart-count" id="cart-count" aria-live="polite">0</span>
        </a>
      </div>
    </div>`;

  /* ----------------------------- Pied de page ----------------------------- */

  const FOOTER_HTML = `
    <div class="container footer-grid">
      <div>
        <p class="footer-brand">ALY <em>&amp;</em> CONDE <span>Services</span></p>
        <p class="footer-text">Matériel informatique et services numériques pour les particuliers et les petites entreprises.</p>
      </div>
      <nav aria-label="Liens du pied de page">
        <h2 class="footer-title">Boutique</h2>
        <ul>
          <li><a href="boutique.html?cat=ordinateurs">Ordinateurs et écrans</a></li>
          <li><a href="boutique.html?cat=accessoires">Accessoires</a></li>
          <li><a href="boutique.html?cat=services">Services</a></li>
          <li><a href="panier.html">Mon panier</a></li>
        </ul>
      </nav>
      <div>
        <h2 class="footer-title">Nous joindre</h2>
        <ul class="footer-contact">
          <li id="footer-email"></li>
          <li id="footer-phone"></li>
          <li id="footer-address"></li>
          <li id="footer-hours"></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p id="footer-copy"></p>
      <p class="footer-note" id="footer-mode" hidden></p>
    </div>`;

  /* ----------------------------- Dessin et mises à jour ----------------------------- */

  function renderShell() {
    const header = $('#site-header');
    const footer = $('#site-footer');
    if (header) header.innerHTML = HEADER_HTML; // gabarit fixe, sans donnée utilisateur
    if (footer) footer.innerHTML = FOOTER_HTML;

    // Coordonnées : insérées avec textContent
    const company = CONFIG.COMPANY;
    const set = (id, text) => { const node = $(id); if (node) node.textContent = text; };
    set('#footer-email', company.email);
    set('#footer-phone', company.phone);
    set('#footer-address', company.address);
    set('#footer-hours', company.hours);
    set('#footer-copy', `© ${new Date().getFullYear()} ${company.name}. Projet réalisé dans le cadre du cours 8WEB101 (UQAC).`);

    markActiveNav();
    updateCartCount();

    // Menu mobile
    const toggle = $('#nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
  }

  /** Souligne le lien de la page courante. */
  function markActiveNav() {
    let page = document.body.dataset.page;
    if (page === 'shop' && getParam('cat') === 'services') page = 'services';
    $$('[data-nav]').forEach((link) => {
      if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
    });
  }

  function updateCartCount() {
    const badge = $('#cart-count');
    if (!badge) return;
    const count = MCS.cart.count();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function updateAccountLink() {
    const link = $('#account-link');
    if (!link) return;
    const user = MCS.session.user;
    link.textContent = user ? user.fullName.split(' ')[0] : 'Connexion';
    link.title = user ? 'Mon compte' : 'Se connecter ou créer un compte';
  }

  /** Indique clairement que les données sont locales (mode démonstration). */
  function updateModeNote() {
    const note = $('#footer-mode');
    if (!note) return;
    if (MCS.data.mode === 'local') {
      note.hidden = false;
      note.textContent = MCS.data.error
        ? 'Connexion à Supabase impossible : mode démonstration (données enregistrées dans ce navigateur).'
        : 'Mode démonstration : comptes, paniers et commandes sont enregistrés dans ce navigateur.';
    }
  }

  /* ----------------------------- Démarrage d'une page ----------------------------- */

  /**
   * @param {(user: object|null) => Promise<void>|void} pageFn  code propre à la page
   */
  function boot(pageFn) {
    const run = async () => {
      renderShell();
      window.addEventListener('mcs:cart', updateCartCount);
      window.addEventListener('storage', updateCartCount); // panier modifié dans un autre onglet
      try {
        await MCS.data.ready;
        MCS.session.user = await MCS.data.getUser();
        updateAccountLink();
        updateModeNote();
        if (MCS.session.user) await MCS.ui.loadFavorites();
        await pageFn(MCS.session.user);
      } catch (error) {
        console.error(error);
        toast('Une erreur est survenue. Rechargez la page.', 'error', 6000);
      }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }

  MCS.boot = boot;
})();
