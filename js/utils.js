/**
 * utils.js — Fonctions utilitaires réutilisables (DOM, formats, stockage, toasts).
 * Expose : MCS.utils
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});
  const CONFIG = window.MCS_CONFIG;

  /* ----------------------------- DOM ----------------------------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /**
   * Crée un élément. Le texte est inséré avec textContent (jamais innerHTML) :
   * un nom de produit ou de client contenant du HTML s'affiche comme du texte
   * brut, ce qui évite les failles XSS.
   */
  function el(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== '') node.textContent = text;
    return node;
  }

  /* ----------------------------- Formats ----------------------------- */

  /** 12345 (cents) → « 123,45 $ » */
  function formatMoney(cents) {
    return (cents / 100).toLocaleString('fr-CA', { style: 'currency', currency: CONFIG.CURRENCY });
  }

  /** Date et heure lisibles en français canadien. */
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  /** Retire les accents et met en minuscules (recherche tolérante). */
  function normalize(text) {
    return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  /* ----------------------------- URL ----------------------------- */

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /**
   * Redirection après connexion : on n'accepte qu'une page locale du site
   * (ex. « commande.html »), jamais une adresse externe.
   */
  function safeNext(value) {
    return /^[a-z-]+\.html(\?[\w=&%.-]*)?$/i.test(value || '') ? value : 'compte.html';
  }

  /* ----------------------------- Stockage local ----------------------------- */

  /** Lecture sécurisée (localStorage peut être bloqué en navigation privée). */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function uid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /* ----------------------------- Divers ----------------------------- */

  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Petite notification en bas d'écran.
   * @param {string} message
   * @param {'info'|'success'|'error'} type
   * @param {number} duration  ms
   * @param {Function} [onClick]
   */
  function toast(message, type = 'info', duration = 3500, onClick = null) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = el('div', 'toast-container');
      container.id = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.append(container);
    }
    const node = el('div', `toast toast-${type}`, message);
    if (onClick) {
      node.classList.add('is-clickable');
      node.addEventListener('click', () => { onClick(); node.remove(); });
    }
    container.append(node);
    setTimeout(() => node.remove(), duration);
  }

  MCS.utils = {
    $, $$, el, formatMoney, formatDate, normalize, getParam, safeNext,
    read, write, uid, debounce, toast,
  };
})();
