/*
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
              "image": "assets/produits/laptop-probook.jpg",
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
              "image": "assets/produits/ecran-24.jpg",
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
              "image": "assets/produits/tablette-10.jpg",
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
              "image": "assets/produits/souris-ergo.jpg",
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
              "image": "assets/produits/clavier-meca.jpg",
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
              "image": "assets/produits/casque-bt.jpg",
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
              "image": "assets/produits/ssd-1to.jpg",
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
              "name": "Chargeur rapide 67 W avec câble USB-C",
              "category": "accessoires",
              "kind": "produit",
              "price": 44.5,
              "stock": 50,
              "emoji": "🔌",
              "color": "#f5e7c2",
              "image": "assets/produits/chargeur-65w.jpg",
              "featured": false,
              "description": "Un chargeur compact et son câble USB-C pour recharger rapidement votre téléphone, votre tablette et votre portable.",
              "details": [
                  "Puissance de 67 W",
                  "Câble USB-C inclus",
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
              "image": "assets/produits/webcam-hd.jpg",
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
              "image": "assets/produits/sac-portable.jpg",
              "featured": false,
              "description": "Compartiment rembourré pour portable jusqu'à 16 pouces et rangements pour vos accessoires.",
              "details": [
                  "Portable jusqu'à 16 pouces",
                  "Tissu résistant à l'eau",
                  "Poche antivol dorsale"
              ]
          },
          {
              "id": "hub-usb-7",
              "name": "Hub USB 3.0 à 7 ports",
              "category": "accessoires",
              "kind": "produit",
              "price": 34.99,
              "stock": 35,
              "emoji": "🔗",
              "color": "#f5e7c2",
              "image": "assets/produits/hub-usb-7.jpg",
              "featured": false,
              "description": "Multipliez les ports USB de votre ordinateur et branchez clavier, souris, disques et clés en même temps.",
              "details": [
                  "7 ports USB 3.0 haut débit",
                  "Interrupteur et voyant par port",
                  "Compatible PC et Mac"
              ]
          },
          {
              "id": "support-portable",
              "name": "Support pliable pour portable",
              "category": "accessoires",
              "kind": "produit",
              "price": 39.99,
              "stock": 28,
              "emoji": "💻",
              "color": "#f5e7c2",
              "image": "assets/produits/support-portable.jpg",
              "featured": false,
              "description": "Surélevez votre écran pour une posture plus confortable et un meilleur refroidissement.",
              "details": [
                  "Structure légère et rigide",
                  "Hauteur réglable",
                  "Portables de 10 à 17 pouces"
              ]
          },
          {
              "id": "tapis-souris",
              "name": "Tapis de souris en similicuir",
              "category": "accessoires",
              "kind": "produit",
              "price": 24.99,
              "stock": 60,
              "emoji": "🖱️",
              "color": "#f5e7c2",
              "image": "assets/produits/tapis-souris.jpg",
              "featured": false,
              "description": "Une surface lisse et élégante pour une souris précise, avec une base antidérapante.",
              "details": [
                  "Format 40 × 30 cm",
                  "Surface en similicuir facile à nettoyer",
                  "Base en caoutchouc antidérapante"
              ]
          },
          {
              "id": "cle-usb-128",
              "name": "Clé USB double connecteur 128 Go",
              "category": "accessoires",
              "kind": "produit",
              "price": 29.99,
              "stock": 80,
              "emoji": "💽",
              "color": "#f5e7c2",
              "image": "assets/produits/cle-usb-128.jpg",
              "featured": false,
              "description": "Transportez vos documents et vos projets dans un format de poche.",
              "details": [
                  "Capacité de 128 Go",
                  "Connecteurs USB-A et USB-C",
                  "USB 3.1, lecture rapide"
              ]
          },
          {
              "id": "haut-parleur-bt",
              "name": "Haut-parleur Bluetooth portable",
              "category": "accessoires",
              "kind": "produit",
              "price": 59.99,
              "stock": 20,
              "emoji": "🔊",
              "color": "#f5e7c2",
              "image": "assets/produits/haut-parleur-bt.jpg",
              "featured": false,
              "description": "Un son puissant pour la musique et les appels, à l'intérieur comme à l'extérieur.",
              "details": [
                  "Bluetooth 5.3",
                  "Jusqu'à 12 heures d'autonomie",
                  "Résistant à l'eau"
              ]
          },
          {
              "id": "batterie-externe",
              "name": "Batterie externe 20 000 mAh",
              "category": "accessoires",
              "kind": "produit",
              "price": 44.99,
              "stock": 32,
              "emoji": "🔋",
              "color": "#f5e7c2",
              "image": "assets/produits/batterie-externe.jpg",
              "featured": false,
              "description": "Rechargez votre téléphone ou votre tablette n'importe où, plusieurs fois de suite.",
              "details": [
                  "Capacité de 20 000 mAh",
                  "Charge rapide USB-C 20 W",
                  "Deux ports de sortie"
              ]
          },
          {
              "id": "routeur-wifi6",
              "name": "Routeur Wi-Fi 6",
              "category": "accessoires",
              "kind": "produit",
              "price": 89.99,
              "stock": 12,
              "emoji": "📶",
              "color": "#f5e7c2",
              "image": "assets/produits/routeur-wifi6.jpg",
              "featured": false,
              "description": "Un réseau rapide et stable pour la maison ou le petit bureau.",
              "details": [
                  "Wi-Fi 6 double bande",
                  "Quatre ports Ethernet gigabit",
                  "Configuration guidée par application"
              ]
          },
          {
              "id": "ecouteurs-bt",
              "name": "Écouteurs sans fil",
              "category": "accessoires",
              "kind": "produit",
              "price": 79.99,
              "stock": 26,
              "emoji": "🎶",
              "color": "#f5e7c2",
              "image": "assets/produits/ecouteurs-bt.jpg",
              "featured": false,
              "description": "Légers et confortables, avec un boîtier de recharge pour toute la journée.",
              "details": [
                  "Bluetooth 5.3, micro intégré",
                  "Jusqu'à 24 heures avec le boîtier",
                  "Embouts de trois tailles"
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
              "image": "assets/produits/srv-installation.jpg",
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
              "image": "assets/produits/srv-depannage.jpg",
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
              "image": "assets/produits/srv-site-vitrine.jpg",
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
              "image": "assets/produits/srv-formation.jpg",
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
