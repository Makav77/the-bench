# next-door-buddy

Projet annuel ESGI 2025

**Requirement**

1) git clone https://github.com/Makav77/the-bench.git
2) cd frontend && npm install && npm run dev (http://localhost:5173/)
3) cd ../backend && npm init -y && node server.js (http://localhost:5000/)

**Présentation de l'application**

**The Bench** est une application dédiée aux habitants d'un quartier, leur permettant de se connecter, d'organiser des événements, d'échanger des services et de renforcer le lien social local. L'objectif est de favoriser la convivialité et l'entraide entre voisins à travers un ensemble de fonctionnalités interactives et engageantes.

**Fonctionnalités :**

1) Marketplace

   - Espace d'échange et de vente d'objets entre voisin
   - Possibilité d'ajouter, supprimer, modifier des annonces avec photos et description.
2) Services entre voisins

   - Demande et proposition de services (bricolage, baby-sitting, aide aux courses surveillance, garde d’animaux ou de plantes, etc.).
3) Activités communautaires

   - Création, modification, suppression d’événements avec un nombre de places défini.
   - Inscription en ligne et gestion des participants.
   - Notifications automatiques pour rappeler les événements à venir.
4) Messagerie instantanée

   - Chat en temps réel entre voisins.
   - Groupes de discussions thématiques (activités, sécurité, bons plans, etc.).
   - Possibilité de créer des discussions privées.
5) Evènements communautaires

   - Organisation d’événements à l’échelle du quartier (exemples : fêtes des voisins, vide-greniers, ateliers collaboratifs)
   - Interface de gestion des inscriptions et des contributions.
6) Journal de quartier

   - Fil d’actualité sur les événements et initiatives locales.
   - Articles partagés par les habitants.
   - Modération communautaire pour assurer la qualité des publications.
7) Sondages communautaires

   - Création de sondages pour recueillir l’opinion des habitants.
   - Consultation des résultats en temps réel.
   - Fonctionnalité utile pour les décisions de quartier.
8) Annonces flash

   - Annonces visibles pendant 24h pour des besoins urgents (perte d’objet, demande de service express, etc.).
   - Affichage prioritaire dans l’application.
9) Galeries communautaires

   - Partage de photos et vidéos des événements passés.
10) Collaboration avec les artisans du coin

    - Mise en avant des artisans locaux.
    - Référencement et contact direct via l’application.
    - Offres exclusives pour les habitants du quartier.
11) Calendrier de quartier

    - Vision globale des événements et activités.
    - Rappels et synchronisation avec les calendriers personnels.
12) Système de badge et de récompenses

    - Attribution de badges pour les utilisateurs actifs.
    - Récompenses sous forme de points échangeables contre des avantages locaux.
13) Défis communautaires

    - Challenges organisés entre voisins (ex : collecte de déchets, décoration de quartier, etc.).
    - Classement et récompenses pour les participants.
14) Systèmes de liste d’amis

    - Ajout et gestion des contacts.
    - Notifications sur les activités des amis.
15) Personnalisation du profil

    - Ajout d’avatar et description personnelle.
    - Réglages de confidentialité pour contrôler les informations visibles.
16) Thèmes personnalisables

    - Choix entre plusieurs thèmes d’affichage pour l’interface utilisateur.
    - Mode clair/sombre pour le confort visuel.
17) Systèmes de suggestions intelligentes

    - Proposition de mise en relation entre voisins partageant des centres d’intérêt communs.
    - Recommandation de participants pour les activités en fonction des relations existantes.
18) Système de plugins

    - Export de fichier (calendrier, etc.)
    - Outils d’analyse statistiques (sondages, etc.)

**Idées de traitement**

**Backend (NodeJS & SGBD évolutif)**

* API RESTful pour gérer les interactions avec les services de l'application.
* Base de données NoSQL (MongoDB) ou SQL (PostgreSQL) selon les besoins.
* Sécurité avec authentification JWT et chiffrement des données sensibles.

**Frontend Web (React - Utilisateurs & Back Office)**

* Interface intuitive et responsive.
* Gestion des rôles (utilisateurs, modérateurs, administrateurs).
* Intégration des notifications en temps réel.

**Client lourd (Java & JavaFX - Webscraping & Interface)**

* Scraping d’annonces locales et d’événements pour enrichir la plateforme.
* Interface JavaFX permettant une consultation hors-ligne des informations collectées.

**SQL + yacc et lex**

* Conception d’une base de données relationnelle structurée.
* Optimisation des requêtes pour garantir la rapidité des échanges.
* Sauvegarde et récupération des données critiques.
