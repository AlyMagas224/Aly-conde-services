/**
 * config.js — Paramètres modifiables de la boutique.
 *
 * MODE DÉMONSTRATION (par défaut) : laissez SUPABASE_URL et SUPABASE_ANON_KEY
 * vides. Le site fonctionne immédiatement : les comptes, paniers et commandes
 * sont enregistrés dans le navigateur (localStorage).
 *
 * MODE SUPABASE : remplissez les deux valeurs (Supabase > Project Settings > API)
 * après avoir exécuté sql/schema.sql. Les données sont alors enregistrées dans
 * la base de données, partagées entre appareils, et les commandes sont
 * calculées côté serveur.
 *
 * La clé « anon » est PUBLIQUE par conception : la sécurité repose sur les
 * politiques RLS de sql/schema.sql. N'utilisez JAMAIS la clé « service_role ».
 */
window.MCS_CONFIG = {
  /* ----- Coordonnées de l'entreprise (affichées dans le pied de page et la page Contact) ----- */
  COMPANY: {
    name: 'ALY & CONDE Services',
    email: 'alymagas96@gmail.com',
    phone: '(438) 341-4489',
    address: 'Québec, Canada',             // à remplacer
    hours: 'Lundi au vendredi, 9 h à 17 h',
  },

  /* ----- Supabase (laisser vide = mode démonstration) ----- */
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  /* ----- Prix, livraison et taxes (doivent correspondre à sql/schema.sql) ----- */
  CURRENCY: 'CAD',
  TPS_RATE: 0.05,          // taxe fédérale (5 %)
  TVQ_RATE: 0.09975,       // taxe de vente du Québec (9,975 %)
  FREE_SHIPPING_MIN: 100,  // livraison offerte dès ce montant (après rabais)
  SHIPPING_FLAT: 9.99,     // frais de livraison sous ce montant
  MAX_QTY: 20,             // quantité maximale par article
};
