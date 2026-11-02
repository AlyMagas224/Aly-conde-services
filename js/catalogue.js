/**
 * catalogue.js — Données du catalogue (mode démonstration) : catégories,
 * produits et codes promotionnels.
 *
 * ⚠️ Ce fichier est généré à partir des mêmes données que sql/schema.sql.
 * Pour modifier un prix ou un stock en mode Supabase, modifiez la table
 * « products » (Table Editor). Ce fichier ne sert alors plus que de secours.
 *
 * Champs d'un produit :
 *   id, name, description, details[], category, kind ("produit" | "service"),
 *   price (en dollars), stock (nombre, ou null pour un service),
 *   emoji + color (visuel par défaut), image (chemin facultatif, ex. "assets/produits/x.jpg"),
 *   featured (affiché « À la une » sur l'accueil).
 */
(function () {
  'use strict';
  const MCS = (window.MCS = window.MCS || {});

  MCS.catalogue = {
      "categories": [
          {
              "id": "ordinateurs",
              "label": "Ordinateurs et écrans",
              "emoji": "💻",
              "description": "Portables, écrans et tablettes pour le travail et les études."
          },
          {
              "id": "accessoires",
              "label": "Accessoires",
              "emoji": "🎧",
              "description": "Claviers, casques, stockage, chargeurs et sacs."
          },
          {
              "id": "services",
              "label": "Services",
              "emoji": "🛠️",
              "description": "Installation, dépannage, création de site et formation."
          }
      ],
      "products": [
          {
              "id": "laptop-probook",
              "name": "Portable ProBook 15\"",
              "category": "ordinateurs",
              "kind": "produit",
              "price": 899.0,
              "stock": 8,
              "emoji": "💻",
              "color": "#d3e7e4",
              "image": "assets/produits/laptop-probook.svg",
              "featured": true,
              "description": "Un portable 15,6 pouces rapide et silencieux, pensé pour le travail et les études.",
              "details": [
                  "Écran 15,6\" Full HD antireflet",
                  "Processeur 8 cœurs, 16 Go de mémoire",
                  "SSD de 512 Go",
                  "Jusqu'à 10 heures d'autonomie"
              ]
          },
          {
              "id": "ecran-24",
              "name": "Écran 24\" Full HD",
              "category": "ordinateurs",
              "kind": "produit",
              "price": 189.99,
              "stock": 14,
              "emoji": "🖥️",
              "color": "#d3e7e4",
              "image": null,
              "featured": false,
              "description": "Un écran net et confortable pour travailler longtemps sans fatigue visuelle.",
              "details": [
                  "Dalle IPS 24 pouces, 1920 × 1080",
                  "Bordures fines, pied inclinable",
                  "Entrées HDMI et DisplayPort"
              ]
          },
          {
              "id": "tablette-10",
              "name": "Tablette 10 pouces 64 Go",
              "category": "ordinateurs",
              "kind": "produit",
              "price": 329.0,
              "stock": 10,
              "emoji": "📱",
              "color": "#d3e7e4",
              "image": null,
              "featured": false,
              "description": "Légère et polyvalente : lecture, notes, visioconférence et divertissement.",
              "details": [
                  "Écran 10,4 pouces",
                  "64 Go de stockage, extensible",
                  "Deux caméras, USB-C"
              ]
          },
          {
              "id": "souris-ergo",
              "name": "Souris sans fil ergonomique",
              "category": "accessoires",
              "kind": "produit",
              "price": 34.99,
              "stock": 40,
              "emoji": "🖱️",
              "color": "#f5e7c2",
              "image": null,
              "featured": false,
              "description": "Une prise en main naturelle pour réduire la fatigue du poignet.",
              "details": [
                  "Connexion sans fil 2,4 GHz",
                  "Capteur réglable jusqu'à 3200 ppp",
                  "Pile incluse"
              ]
          },
          {
              "id": "clavier-meca",
              "name": "Clavier mécanique compact",
              "category": "accessoires",
              "kind": "produit",
              "price": 79.99,
              "stock": 25,
              "emoji": "⌨️",
              "color": "#f5e7c2",
              "image": null,
              "featured": false,
              "description": "Frappe précise et agréable dans un format compact qui libère de l'espace.",
              "details": [
                  "Format 75 %",
                  "Interrupteurs mécaniques silencieux",
                  "Filaire USB-C"
              ]
          },
          {
              "id": "casque-bt",
              "name": "Casque audio Bluetooth",
              "category": "accessoires",
              "kind": "produit",
              "price": 119.0,
              "stock": 18,
              "emoji": "🎧",
              "color": "#f5e7c2",
              "image": "assets/produits/casque-bt.svg",
              "featured": true,
              "description": "Un son clair pour la musique, les cours en ligne et les appels.",
              "details": [
                  "Bluetooth 5, micro intégré",
                  "Jusqu'à 30 heures d'autonomie",
                  "Coussinets souples"
              ]
          },
          {
              "id": "ssd-1to",
              "name": "Disque SSD externe 1 To",
              "category": "accessoires",
              "kind": "produit",
              "price": 109.99,
              "stock": 30,
              "emoji": "💾",
              "color": "#f5e7c2",
              "image": null,
              "featured": false,
              "description": "Sauvegardez et transportez vos fichiers dans un boîtier compact et robuste.",
              "details": [
                  "Capacité de 1 To",
                  "Connexion USB-C",
                  "Résiste aux chocs du quotidien"
              ]
          },
          {
              "id": "chargeur-65w",
              "name": "Chargeur rapide USB-C 65 W",
              "category": "accessoires",
              "kind": "produit",
              "price": 44.5,
              "stock": 50,
              "emoji": "🔌",
              "color": "#f5e7c2",
              "image": null,
              "featured": false,
              "description": "Un seul chargeur pour votre portable, votre tablette et votre téléphone.",
              "details": [
                  "Puissance de 65 W",
                  "Deux ports : USB-C et USB-A",
                  "Format de voyage"
              ]
          },
          {
              "id": "webcam-hd",
              "name": "Webcam HD 1080p",
              "category": "accessoires",
              "kind": "produit",
              "price": 59.99,
              "stock": 22,
              "emoji": "📷",
              "color": "#f5e7c2",
              "image": null,
              "featured": false,
              "description": "Une image nette pour vos réunions et vos cours à distance.",
              "details": [
                  "Full HD 1080p",
                  "Microphone intégré",
                  "Volet de confidentialité"
              ]
          },
          {
              "id": "sac-portable",
              "name": "Sac à dos pour portable",
              "category": "accessoires",
              "kind": "produit",
              "price": 64.0,
              "stock": 4,
              "emoji": "🎒",
              "color": "#f5e7c2",
              "image": null,
              "featured": false,
              "description": "Compartiment rembourré pour portable jusqu'à 16 pouces et rangements pour vos accessoires.",
              "details": [
                  "Portable jusqu'à 16 pouces",
                  "Tissu résistant à l'eau",
                  "Poche antivol dorsale"
              ]
          },
          {
              "id": "srv-installation",
              "name": "Installation et configuration d'ordinateur",
              "category": "services",
              "kind": "service",
              "price": 89.0,
              "stock": null,
              "emoji": "🛠️",
              "color": "#e3def3",
              "image": "assets/produits/srv-installation.svg",
              "featured": true,
              "description": "Nous préparons votre ordinateur : système, mises à jour, logiciels et transfert de vos fichiers.",
              "details": [
                  "Intervention environ 1 h 30",
                  "Installation des logiciels courants",
                  "Transfert de vos fichiers",
                  "Sur rendez-vous"
              ]
          },
          {
              "id": "srv-depannage",
              "name": "Dépannage informatique à distance (1 heure)",
              "category": "services",
              "kind": "service",
              "price": 60.0,
              "stock": null,
              "emoji": "🧑‍💻",
              "color": "#e3def3",
              "image": null,
              "featured": false,
              "description": "Un problème logiciel, un virus, une lenteur ? Nous intervenons à distance, en direct avec vous.",
              "details": [
                  "Séance de 1 heure",
                  "Diagnostic et correction",
                  "Aucun déplacement"
              ]
          },
          {
              "id": "srv-site-vitrine",
              "name": "Création de site vitrine",
              "category": "services",
              "kind": "service",
              "price": 750.0,
              "stock": null,
              "emoji": "🌐",
              "color": "#e3def3",
              "image": "assets/produits/srv-site-vitrine.svg",
              "featured": true,
              "description": "Un site clair et adapté aux téléphones pour présenter votre activité et vous faire contacter.",
              "details": [
                  "Jusqu'à 5 pages",
                  "Adapté aux téléphones",
                  "Formulaire de contact",
                  "Mise en ligne incluse"
              ]
          },
          {
              "id": "srv-formation",
              "name": "Formation bureautique (2 heures)",
              "category": "services",
              "kind": "service",
              "price": 120.0,
              "stock": null,
              "emoji": "🎓",
              "color": "#e3def3",
              "image": null,
              "featured": false,
              "description": "Une séance pratique pour maîtriser vos outils de bureautique, seul ou en petit groupe.",
              "details": [
                  "Séance de 2 heures",
                  "Contenu adapté à votre niveau",
                  "Sur place ou en visioconférence"
              ]
          }
      ],
      "promos": [
          {
              "code": "BIENVENUE10",
              "kind": "percent",
              "value": 10,
              "min_subtotal": 0,
              "active": true,
              "label": "10 % de rabais sur votre commande"
          },
          {
              "code": "MAGAS15",
              "kind": "percent",
              "value": 15,
              "min_subtotal": 100,
              "active": true,
              "label": "15 % de rabais dès 100 $ d'achats"
          },
          {
              "code": "LIVRAISON",
              "kind": "free_shipping",
              "value": 0,
              "min_subtotal": 0,
              "active": true,
              "label": "Livraison offerte"
          }
      ]
  };
})();
