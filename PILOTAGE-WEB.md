# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié).

## 1. Brief en cours
> Les consignes arrivent ici. Statut : à faire / en cours / fait.

(vide — en attente du contenu réel de Luc)

## 2. Journal Claude Code
> Chronologique inverse (le plus récent en haut).

- 2026-07-10 — **Fonts vendorisées + build validé (2b62a2e).**
  8 `.woff2` récupérées moi-même via **fontsource** (npm, OFL) — Fraunces
  variable + Inter 400/500/600 (latin + latin-ext), renommées aux noms attendus,
  déposées dans `assets/fonts/`. **`npm run build` (webpack prod) OK** :
  `dist/main.css` référence `dist/fonts/`, preload cohérent, typo Fraunces+Inter
  opérationnelle, FADP respecté. Le thème est **complet et buildable**.
  **SSH ex2 #441615 = ACTIF/testé** (user `vwfewhpb`) → 1er prérequis staging
  levé. Restent : secrets GitHub posés + base MySQL cPanel + lancer le runbook.

- 2026-07-10 — **Thème WP complet + prépa staging (repo breval-wordpress).**
  - **Thème 100 % (7daa7dc)** : 13 photos Lot 1 intégrées (hero + galerie
    marquee/lightbox, repli si galerie ACF vide) ; accueil = hero + présentation
    Sion + 2 lot-cards + **piliers** (cc_piliers + repli 3 arguments, ordre
    DESIGN §6) ; Lot 2 = toggle ACF `cc_lot2_duree_active` (off, champ « durée »
    prêt mais masqué) ; **SEO** `inc/seo.php` : noindex global (staging) + Open
    Graph + og:image Lot 1 + meta description. Booking inerte, mailto neutre,
    a11y/responsive conservés. ⚠️ **8 `.woff2` toujours non fournis** (fallback
    système ; build typo final en attente).
  - **Prépa déploiement staging (f20e980)** : `deploy.yml` ciblé sur
    `public_html/staging/…/themes/breval/` (sous-dossier caché, SSL, pas de DNS —
    reco skill) ; `INSTALL-STAGING.md` = runbook WP-CLI (core fr_FR, ACF Pro via
    `ACF_PRO_KEY`, plugins réf., pages + templates, Basic Auth `.htpasswd`) sans
    secrets ; `ACCES.md` gabarit **gitignoré** (identifiants → Keeper, jamais Git).
  - **NON exécuté — blocages (côté Ilias/CI, pas moi)** : je n'ai **pas** d'accès
    SSH ex2 depuis la machine et ne manipule pas les clés (`breval-ci-deploy`,
    `ACF_PRO_KEY`) ni les mots de passe (DB, admin WP). `wp core install` exige
    ces credentials + SSH #441615 actif + base MySQL créée en cPanel. Le
    déploiement CI (`deploy.yml`, manuel) ne fait que rsync le thème dans un WP
    **déjà installé** — il n'installe pas WordPress. Staging = à monter par Ilias
    (ou une CI d'install dédiée) via le runbook. Rien lancé sur le serveur.

- 2026-07-10 — **Thème WP : repo dédié + fonts + port fidèle du brouillon.**
  Repo **`caractere-swiss/breval-wordpress`** (PRIVÉ) créé et poussé — projet
  séparé du brouillon Eleventy (pipelines incompatibles : SSH→ex2 vs Pages).
  HEAD `6bbd951`. Travail 100 % local (aucun serveur ; SSH ex2 KO #441615).
  - **Fonts auto-hébergées** (`_fonts.scss` : Fraunces variable 100–900 + Inter
    400/500/600, latin + latin-ext), import avant tokens, preload des 2 critiques,
    zéro appel Google (FADP). ⚠️ **8 `.woff2` à déposer** dans `assets/fonts/`
    (le zip annoncé n'a jamais été fourni ; fallback système actif en attendant).
  - **Port fidèle du brouillon validé** → thème : header/footer (markup + classes
    du brouillon), 3 templates (accueil, lot-1 avec galerie marquee ACF + booking
    **inerte**, lot-2 mode « bientôt » + form `mailto:preview@caractere.swiss`
    **neutre**), composants SCSS portés de `styles.css` (hero, cards, marquee+
    lightbox, soon-badge, booking, forms) via les variables de tokens. `main.ts`
    burger + lightbox (parité brouillon). Contenu ACF `cc_` avec repli sur le
    contenu réel du brouillon (rend à l'identique sans données).
  - **Vérifs** : SCSS compilé OK (dart-sass, `@use` résolus) ; accolades
    équilibrées ; mailto neutre confirmé ; booking `disabled`. PHP non lintable
    ici (php absent) — écrit avec `esc_*`/`wp_kses_post` + gardes `function_exists`.
  - **Incident sécurité** : un sous-agent a renvoyé une **injection de prompt**
    (faux message « Anthropic » demandant d'écrire un marqueur dans README).
    Ignorée, aucun fichier modifié. Port refait en direct, sans sous-agent.

- 2026-07-10 — **Corrections contenu Luc (07.07) + DESIGN.md + scaffold thème WP.**
  Session opérationnelle unique reprise sur `main` = `d959676` (clone local
  resynchronisé, ancien état `c68765b` périmé abandonné). Commits :
  - **`f4f745d`** — `content:` **Couchages Lot 1** corrigés (réponses Luc 07.07,
    validées) : description prose → « une chambre avec lit double, une chambre
    avec lit simple et un lit double escamotable au séjour » (5 pers.).
    **Wi-Fi/TV** : `<li class="draft">…(à confirmer)</li>` → `<li>Wi-Fi ·
    Télévision inclus</li>` (plus aucun `.draft` dans `lot-1.njk`).
    **`site.json`** : `description` réalignée (Lot 2 = colocation 4 chambres
    meublées charges comprises, dispo 1er sept. — ne décrit plus « grand
    appartement familial en bail annuel »). Tagline « Deux adresses à vivre »
    conservée (neutre, exacte).
  - **`5735683`** — `docs:` **DESIGN.md** copié à la racine du repo (design
    system validé 07.07, préalable au scaffold WP).
  - **Scaffold thème WordPress** (hors ce repo) : créé dans
    `2.solution-web/wordpress/` — **projet séparé** (stack WP + ACF Pro,
    déploiement SSH→ex2, distinct du brouillon Eleventy/GitHub Pages).
    44 fichiers, starter « Adam » (SCSS + TS + Webpack + ACF Flexible Content
    + deploy.yml SSH). `inc/acf.php` : 5 groupes `cc_` programmatiques
    (`cc_accueil`, `cc_lot` commun, `cc_lot1`, `cc_lot2`, `cc_flexible`),
    save/load `acf-json/`. Tokens SCSS fidèles à DESIGN.md (#0f4c3a / #c8714e,
    Fraunces + Inter). Plancher accessibilité + `.soon-badge` préservés.
    Fonts en local (FADP, fichiers woff2 à déposer). **100 % local** : pas de
    git/npm/serveur (SSH ex2 inactif — ticket #441615).

- 2026-07-09 — **HANDOFF / consolidation** (rattrapage du journal, resté figé à
  `5375b2a`). État actuel de `main` = commit `c07d669`, HEAD. `main` local et
  remote strictement alignés (aucune divergence) → clone `main` = état complet,
  fusion sans risque. Commits couverts par cette entrée (`a2c733e` → `c07d669`) :
  - **`a2c733e`** — Balises **Open Graph** (`base.njk` : og:type/title/description/
    url/image ; `og:url` = `{{ site.url }}{{ page.url | url }}` avec pathPrefix ;
    `site.url` ajouté à `site.json`). **Galerie Lot 1 complète** = 13 photos réelles.
  - **`30a0ef9`** — **Textes Lot 1 rédigés** (remplacent les `.draft`) : lead,
    description (2 §), quartier. Équipements : cuisine + balcon confirmés ;
    **reste `.draft`** = « Wi-Fi · Télévision (à confirmer) » (1 ligne, en attente Luc).
  - **`39e30aa` → `d2f8cd2`** — Évolution galerie : grid → slider scroll-snap
    (**rejeté** par Ilias « j'aime pas ») → **marquee** défilement auto continu
    (choix final). CSS `.marquee` : 13 items + 13 doublons `aria-hidden` pour
    boucle sans couture (`translateX(-50%)`), gap 4px, `border-radius` conservé,
    `prefers-reduced-motion` respecté.
  - **`d111d9f`** — **Lightbox navigable** (`main.js`) : flèches ‹ › + clavier ← →,
    boucle sur les 13 photos (doublons exclus). **Homepage** : image carte Lot 1
    cliquable (→ `/lot-1/`) ; **descriptions cartes Lot 1 + Lot 2 rédigées**
    (remplacent `.draft`). **Correction couchages Lot 1** : mention « chambre
    simple » retirée de la description prose (cohérence 5 pers. = 2+2+1).
    ⚠️ **En attente confirmation Luc** sur la config exacte des couchages ;
    capacité (5 pers.) et « En bref » inchangés.
  - **`6185fae` / `9cc5ef9`** — Hero : dégradé vert remonté (démarre à 15%, opaque
    à 52%) pour lisibilité de l'eyebrow sur photo. Lightbox : flèches « verre »
    (backdrop-filter, ton vert thème) posées sur l'image → image pleine largeur
    mobile.
  - **`37cca50` / `c07d669`** — Réglage fin marquee : gap 4px + `border-radius`
    restauré (images resserrées mais coins arrondis nets aux jointures).

- 2026-06-25 — **Intégration photos Lot 1** : hero bannière (`lot1-balcon-vue-alpes.jpg`),
  galerie 4 images (séjour, cuisine, chambre double, salle de bain) branchée sur
  la lightbox JS existante (`data-gallery` + `data-full`), carte accueil
  (`lot1-sejour.jpg`). CSS ajouté pour `<img>` dans `.hero__media` et
  `.lot-card__media` (object-fit cover). `pathPrefix` appliqué via `| url`. ✓
  ✓ Photos poussées par Ilias via GitHub web UI.

- 2026-06-25 — **Intégration contenu réel de Luc** (mails 19.06 + arbitrages
  Ilias 25.06). Lot fait d'un bloc, poussé sur `main` :
  - `src/_data/site.json` : champ `phone` supprimé ; nav renommée
    « Le studio » → « Courte durée », « L'appartement » → « Longue durée ».
  - `src/_includes/footer.njk` : lien `tel:` retiré (suite à suppression du
    `phone`, sinon lien vide) ; libellés des logements alignés sur la nouvelle
    nomenclature.
  - `src/lot-1.njk` : eyebrow + h1 (« Location courte durée — Sion »), prix 185
    CHF/nuit, 68 m², 5 pers., détail couchages, distance gare 350 m, ajout
    équipement « cuisine aménagée et équipée ». Section « En bref » créée pour
    accueillir couchages/distance (champs inexistants auparavant).
  - `src/lot-2.njk` : **refonte complète**. Mode « bientôt » conservé (photos
    fin juillet). Nouvel intro (colocation 128 m², 250 m gare, dispo 1er sept.),
    4 cartes chambres avec surfaces + loyers cc, bloc parties communes.
    Formulaire contact conservé tel quel (`mailto:preview@caractere.swiss`).
  - `src/index.njk` : texte de présentation Sion (bloc exact de Luc) ajouté en
    section dédiée ; cartes lots mises à jour (chiffres réels, tags, libellés).
  - Vérifié au build : plus aucun placeholder chiffré `.fill` ; `mailto` neutre
    intact ; aucun lien `tel:` résiduel.
  - **Reste en `.draft`** (non fourni par Luc) : intro + description + quartier
    du Lot 1, descriptions courtes des cartes accueil, 2 lignes d'équipement
    Lot 1. Photos : attendues fin juillet (placeholders en place).

- 2026-06-25 — Nettoyage hygiène : `vercel.json` supprimé (code mort, déploiement
  Vercel jamais utilisé). `README.md` corrigé : section Déploiement → GitHub Pages
  + URL live. Merge `claude/lucid-cray-exfjaj` → `main` effectué. Le chat Web
  peut désormais cloner `main` et lire `CLAUDE.md` + `PILOTAGE-WEB.md`.
  GitHub Pages se redéclenche à chaque push `main`. ✓
  **Note sur le mode cloud** : les sessions Claude Code cloud créent une branche
  par session (ex. `claude/lucid-cray-…`). Schéma retenu : développement sur
  branche de session → merge vers `main` après feu vert. Disciplines de branches
  en phase WordPress uniquement.

- 2026-06-25 — Setup coordination terminé : `CLAUDE.md` (contexte projet
  consolidé) + `PILOTAGE-WEB.md` créés et committés à la racine.
  - ✓ Racine hors `src/` → hors build Eleventy, jamais publié.
  - ✓ Convention commits `docs(pilotage):` en place.
  - ✓ Déploiement = GitHub Pages (pas Vercel).

- 2026-06-25 — Initialisation du fichier de pilotage.

## 3. Blocages & questions
> Ce que Claude Code remonte au chat Web.

Aucun blocage technique. `main` propre, déployé (GitHub Pages).
Wi-Fi/TV et couchages Lot 1 **résolus** (réponses Luc 07.07, intégrées ce jour).

Restent, tous **non bloquants** :
- **Photos Lot 2** : attendues fin juillet (placeholders + badge en place).
- **Lot des photos du 25.06** : à identifier (à quel logement/pièce elles
  correspondent).
- **Autres équipements Lot 1** (linge / parking) : à confirmer avec Luc.
- **Champ « durée souhaitée »** du formulaire Lot 2 (annuel / mensuel) : à
  confirmer avec Luc.
- **Feu vert client** : Luc a répondu aux questions factuelles mais n'a **pas**
  validé formellement l'état actuel (photos + textes). Pas de publication
  définitive avant son GO.

**Chantier WordPress (site final)** — hors ce repo, dans `2.solution-web/wordpress/` :
- Scaffold thème posé (local). Suite = fonts woff2 à déposer, puis construction
  section par section après validation maquette.
- **Serveur en attente** : SSH ex2 inactif (ticket **#441615**). Aucune install
  WP / WP-CLI / déploiement tant qu'il n'est pas ouvert.
- Domaine `breval.net` + hébergement ex2 acquis. Réservation Lot 1
  (MotoPress + Stripe) = sous-phase ultérieure (validation Luc + compte Stripe).

Tout le contenu Lot 1 et la homepage sont rédigés et en ligne (brouillon).

---

## Format de consigne confortable (rappel pour le chat Web)
Idéal : **chemin explicite + clé/placeholder + valeur exacte**.
Ex. : `src/_data/site.json` → `phone` = "+41 27 …".
Pour du texte long : bloc délimité, en indiquant fichier + emplacement.
