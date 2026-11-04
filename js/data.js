/**
 * data.js — Couche d'accès aux données. Le reste du site ne sait jamais d'où
 * viennent les données : il appelle MCS.data.xxx() et c'est ce fichier qui
 * choisit entre deux « adaptateurs » :
 *
 *   • local    : tout est enregistré dans le navigateur (localStorage).
 *                Utilisé quand SUPABASE_URL / SUPABASE_ANON_KEY sont vides.
 *   • supabase : base de données, authentification et fonctions SQL Supabase.
 *
 * Les deux adaptateurs exposent EXACTEMENT les mêmes fonctions :
 *   getProducts, getUser, signUp, signIn, signOut, getFavorites, toggleFavorite,
 *   validatePromo, placeOrder, getOrders, sendContact
 *
 * Utilisation : await MCS.data.ready;  puis  await MCS.data.getProducts();
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});
  const CONFIG = window.MCS_CONFIG;
  const { read, write, uid, formatMoney } = MCS.utils;

  const configured = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  /* ===========================================================================
   * Messages d'erreur et vérification des codes promotionnels (communs)
   * ======================================================================== */

  /** Transforme le résultat d'une vérification de code en message lisible. */
  function promoMessage(result) {
    if (result.reason === 'min') {
      return `Ce code exige un achat minimum de ${formatMoney(MCS.pricing.toCents(result.min_subtotal))}.`;
    }
    return 'Code promotionnel invalide ou expiré.';
  }

  /** Traduit les erreurs Supabase courantes. */
  function friendlyError(error) {
    const message = String((error && error.message) || error || '');
    const lower = message.toLowerCase();
    if (lower.includes('invalid login credentials')) return 'Courriel ou mot de passe incorrect.';
    if (lower.includes('email not confirmed')) return 'Adresse non confirmée : vérifiez votre boîte courriel.';
    if (lower.includes('already registered') || lower.includes('already been registered')) {
      return 'Un compte existe déjà avec ce courriel.';
    }
    if (lower.includes('password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (lower.includes('rate limit') || lower.includes('too many')) return 'Trop de tentatives. Réessayez dans quelques minutes.';
    if (lower.includes('failed to fetch') || lower.includes('network')) return 'Connexion au serveur impossible. Vérifiez votre réseau.';
    return message || 'Une erreur est survenue.';
  }

  /* ===========================================================================
   * ADAPTATEUR LOCAL (mode démonstration)
   * ======================================================================== */

  const KEYS = {
    users: 'mcs.users',
    session: 'mcs.session',
    orders: 'mcs.orders',
    stock: 'mcs.stock',
    counter: 'mcs.orderCounter',
    contact: 'mcs.contactMessages',
    favorites: (userId) => `mcs.favorites.${userId}`,
  };

  /**
   * Hachage du mot de passe (SHA-256 avec sel) quand le navigateur le permet.
   * ⚠️ Le mode local est une DÉMONSTRATION : un vrai site doit utiliser un
   * service d'authentification (c'est ce que fait le mode Supabase).
   */
  async function hashPassword(password, salt) {
    const text = `${salt}:${password}`;
    if (window.crypto && window.crypto.subtle) {
      const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; // repli très simple si l'API n'est pas disponible
    for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
    return `weak-${h}`;
  }

  const publicUser = (u) => ({ id: u.id, email: u.email, fullName: u.fullName });

  const local = {
    async getProducts() {
      const stock = read(KEYS.stock, {});
      return MCS.catalogue.products.map((p) => ({
        ...p,
        stock: p.stock === null ? null : (stock[p.id] ?? p.stock),
      }));
    },

    async getUser() {
      const session = read(KEYS.session, null);
      if (!session) return null;
      const user = read(KEYS.users, []).find((u) => u.id === session.userId);
      return user ? publicUser(user) : null;
    },

    async signUp({ fullName, email, password }) {
      const users = read(KEYS.users, []);
      const mail = email.trim().toLowerCase();
      if (users.some((u) => u.email === mail)) throw new Error('Un compte existe déjà avec ce courriel.');
      const salt = uid();
      const user = { id: uid(), email: mail, fullName: fullName.trim(), salt, passHash: await hashPassword(password, salt) };
      users.push(user);
      write(KEYS.users, users);
      write(KEYS.session, { userId: user.id });
      return { user: publicUser(user), needsConfirmation: false };
    },

    async signIn({ email, password }) {
      const mail = email.trim().toLowerCase();
      const user = read(KEYS.users, []).find((u) => u.email === mail);
      if (!user || user.passHash !== (await hashPassword(password, user.salt))) {
        throw new Error('Courriel ou mot de passe incorrect.');
      }
      write(KEYS.session, { userId: user.id });
      return publicUser(user);
    },

    async signOut() {
      try { localStorage.removeItem(KEYS.session); } catch { /* ignoré */ }
    },

    async getFavorites() {
      const user = await local.getUser();
      return user ? read(KEYS.favorites(user.id), []) : [];
    },

    /** Ajoute ou retire un favori. Retourne true si le produit est maintenant favori. */
    async toggleFavorite(productId) {
      const user = await local.getUser();
      if (!user) throw new Error('Connexion requise.');
      const list = read(KEYS.favorites(user.id), []);
      const isFavorite = list.includes(productId);
      write(KEYS.favorites(user.id), isFavorite ? list.filter((id) => id !== productId) : [...list, productId]);
      return !isFavorite;
    },

    /** @param {number} subtotalCents */
    async validatePromo(code, subtotalCents) {
      const wanted = String(code || '').trim().toUpperCase();
      const promo = MCS.catalogue.promos.find((p) => p.code === wanted && p.active);
      if (!promo) return { valid: false, reason: 'unknown' };
      if (subtotalCents < MCS.pricing.toCents(promo.min_subtotal)) {
        return { valid: false, reason: 'min', min_subtotal: promo.min_subtotal };
      }
      return { valid: true, code: promo.code, kind: promo.kind, value: promo.value, min_subtotal: promo.min_subtotal };
    },

    /** Enregistre une commande. Retourne { id, number, totals } (montants en cents). */
    async placeOrder({ items, promo, customer, payment }) {
      const user = await local.getUser();
      if (!user) throw new Error('Connexion requise pour commander.');
      if (!items.length) throw new Error('Le panier est vide.');
      if (!['livraison', 'interac'].includes(payment)) throw new Error('Mode de paiement invalide.');

      // On relit les produits : on ne fait jamais confiance aux prix du panier
      const products = await local.getProducts();
      const lines = items.map((item) => {
        const product = products.find((p) => p.id === item.id);
        const qty = Number(item.qty);
        if (!product) throw new Error('Article introuvable.');
        if (!Number.isInteger(qty) || qty < 1 || qty > CONFIG.MAX_QTY) throw new Error('Quantité invalide.');
        if (product.stock !== null && product.stock < qty) throw new Error(`Stock insuffisant pour « ${product.name} ».`);
        return { product, qty };
      });

      const subtotal = lines.reduce((sum, l) => sum + MCS.pricing.toCents(l.product.price) * l.qty, 0);
      let promoInfo = null;
      if (promo) {
        const check = await local.validatePromo(promo, subtotal);
        if (!check.valid) throw new Error(promoMessage(check));
        promoInfo = check;
      }
      const totals = MCS.pricing.compute(lines, promoInfo);

      // Mise à jour des stocks
      const stock = read(KEYS.stock, {});
      lines.forEach(({ product, qty }) => {
        if (product.stock !== null) stock[product.id] = product.stock - qty;
      });
      write(KEYS.stock, stock);

      // Numéro de commande : MCS-AAAAMMJJ-0001
      const counter = read(KEYS.counter, 0) + 1;
      write(KEYS.counter, counter);
      const now = new Date();
      const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

      const order = {
        id: uid(),
        number: `MCS-${day}-${String(counter).padStart(4, '0')}`,
        userId: user.id,
        createdAt: now.toISOString(),
        status: 'En attente',
        promo: totals.promoApplied ? promoInfo.code : null,
        payment,
        customer,
        items: lines.map((l) => ({
          id: l.product.id,
          name: l.product.name,
          unitPriceCents: MCS.pricing.toCents(l.product.price),
          qty: l.qty,
        })),
        totals: {
          subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping,
          tps: totals.tps, tvq: totals.tvq, total: totals.total,
        },
      };
      write(KEYS.orders, [...read(KEYS.orders, []), order]);
      return { id: order.id, number: order.number, totals: order.totals };
    },

    async getOrders() {
      const user = await local.getUser();
      if (!user) return [];
      return read(KEYS.orders, [])
        .filter((o) => o.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async sendContact(message) {
      write(KEYS.contact, [...read(KEYS.contact, []), { ...message, createdAt: new Date().toISOString() }]);
    },
  };

  /* ===========================================================================
   * ADAPTATEUR SUPABASE
   * ======================================================================== */

  let sb = null; // client Supabase (créé dans init)
  let productsCache = null;

  const cents = (dollars) => Math.round(Number(dollars) * 100);

  const normalizeProduct = (p) => ({
    id: p.id, name: p.name, description: p.description, details: p.details || [],
    category: p.category, kind: p.kind, price: Number(p.price), stock: p.stock,
    emoji: p.emoji, color: p.color, image: p.image, featured: p.featured,
  });

  const remote = {
    async getProducts() {
      if (productsCache) return productsCache;
      const { data, error } = await sb.from('products').select('*').order('name');
      if (error) throw new Error(friendlyError(error));
      productsCache = data.map(normalizeProduct);
      return productsCache;
    },

    async getUser() {
      const { data } = await sb.auth.getSession();
      const user = data.session && data.session.user;
      if (!user) return null;
      return { id: user.id, email: user.email, fullName: (user.user_metadata && user.user_metadata.full_name) || user.email };
    },

    async signUp({ fullName, email, password }) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) throw new Error(friendlyError(error));
      // Avec la confirmation par courriel, une adresse déjà utilisée renvoie un utilisateur sans identité
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('Un compte existe déjà avec ce courriel.');
      }
      return { user: data.user, needsConfirmation: !data.session };
    },

    async signIn({ email, password }) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(friendlyError(error));
      return data.user;
    },

    async signOut() {
      const { error } = await sb.auth.signOut();
      if (error) throw new Error(friendlyError(error));
    },

    async getFavorites() {
      const user = await remote.getUser();
      if (!user) return [];
      const { data, error } = await sb.from('favorites').select('product_id');
      if (error) throw new Error(friendlyError(error));
      return data.map((row) => row.product_id);
    },

    async toggleFavorite(productId) {
      const user = await remote.getUser();
      if (!user) throw new Error('Connexion requise.');
      const { data: existing, error: readError } = await sb
        .from('favorites').select('product_id').eq('product_id', productId).maybeSingle();
      if (readError) throw new Error(friendlyError(readError));

      if (existing) {
        const { error } = await sb.from('favorites').delete().eq('product_id', productId);
        if (error) throw new Error(friendlyError(error));
        return false;
      }
      const { error } = await sb.from('favorites').insert({ user_id: user.id, product_id: productId });
      if (error) throw new Error(friendlyError(error));
      return true;
    },

    async validatePromo(code, subtotalCents) {
      const { data, error } = await sb.rpc('validate_promo', { p_code: code, p_subtotal: subtotalCents / 100 });
      if (error) throw new Error(friendlyError(error));
      return data;
    },

    async placeOrder({ items, promo, customer, payment }) {
      const { data, error } = await sb.rpc('place_order', {
        p_items: items.map((i) => ({ id: i.id, qty: i.qty })),
        p_promo: promo || null,
        p_customer: customer,
        p_payment: payment,
      });
      if (error) throw new Error(friendlyError(error));
      productsCache = null; // les stocks ont changé
      return {
        id: data.id,
        number: data.number,
        totals: {
          subtotal: cents(data.subtotal), discount: cents(data.discount), shipping: cents(data.shipping),
          tps: cents(data.tps), tvq: cents(data.tvq), total: cents(data.total),
        },
      };
    },

    async getOrders() {
      const { data, error } = await sb
        .from('orders')
        .select('id, number, status, created_at, subtotal, discount, shipping, tps, tvq, total, promo_code, payment_method, customer, order_items ( product_id, name, unit_price, quantity )')
        .order('created_at', { ascending: false });
      if (error) throw new Error(friendlyError(error));
      return data.map((o) => ({
        id: o.id,
        number: o.number,
        createdAt: o.created_at,
        status: o.status,
        promo: o.promo_code,
        payment: o.payment_method,
        customer: o.customer,
        items: (o.order_items || []).map((i) => ({
          id: i.product_id, name: i.name, unitPriceCents: cents(i.unit_price), qty: i.quantity,
        })),
        totals: {
          subtotal: cents(o.subtotal), discount: cents(o.discount), shipping: cents(o.shipping),
          tps: cents(o.tps), tvq: cents(o.tvq), total: cents(o.total),
        },
      }));
    },

    async sendContact({ name, email, subject, message }) {
      const { error } = await sb.from('contact_messages').insert({ name, email, subject, message });
      if (error) throw new Error(friendlyError(error));
    },
  };

  /* ===========================================================================
   * INITIALISATION : choix de l'adaptateur
   * ======================================================================== */

  const data = { mode: 'local', error: null };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Chargement de Supabase impossible.'));
      document.head.append(script);
    });
  }

  async function init() {
    let adapter = local;
    if (configured) {
      try {
        await loadScript(SUPABASE_CDN);
        sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        data.mode = 'supabase';
        adapter = remote;
      } catch (error) {
        // Sans réseau, on retombe sur le mode démonstration plutôt que de bloquer le site
        data.error = error.message;
        console.error(error);
      }
    }
    Object.assign(data, adapter);
  }

  data.ready = init();
  data.promoMessage = promoMessage;
  MCS.data = data;
})();
