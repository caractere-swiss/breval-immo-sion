# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié).

## 1. Brief en cours
> Les consignes arrivent ici. Statut : à faire / en cours / fait.

(vide — en attente du contenu réel de Luc)

## 2. Journal Claude Code
> Chronologique inverse (le plus récent en haut).

- 2026-07-11 — **🟢 B. SMTP RÉSOLU — root cause + fix idempotent (49b7db6).**
  Root cause trouvée via chat Web en lisant la config réelle en wp-admin :
  **`WPMS_SMTP_ENCRYPTION` n'est pas un nom de constante reconnu par WP Mail
  SMTP** (le bon nom = `WPMS_SSL`) — jamais appliqué, encryption restée
  « None » en DB malgré port 465 (SSL implicite) → PHPMailer ouvrait un
  socket en clair sur un port attendant un handshake TLS → hang indéfini.
  L'auth SMTP brute (openssl s_client, testée par moi) réussissait car
  effectuée dans le bon mode — d'où la fausse piste qui a masqué longtemps
  le vrai problème.
  **Fix corrigé côté Ilias en wp-admin** (Encryption None→SSL) : `Email
  Test` → succès, **réception confirmée dans agence@caractere.swiss** (boîte
  de réception, pas spam, vérifié côté Gmail). Délivrabilité bout-en-bout OK.
  **Fix figé côté script** (`configure-smtp.sh`) pour survivre à un futur
  reinstall : `WPMS_SSL` (nom correct) + **suppression de l'early-exit**
  « skip si WPMS_ON déjà présent » qui masquait justement le bug (empêchait
  toute correction sur un env déjà « configuré »). `wp config set` est déjà
  idempotent par constante — pas besoin d'un check global fragile.
  **Vérifié après fix** : `WPMS_SSL` bien défini, `wp_mail()` → `true` en
  **0,7s** (vs hang >45s avant) — non-régression confirmée.
  Expéditeur = `contact@breval.net` (boîte cPanel ex2, SPF/DKIM déjà
  alignés) ; destinataire inchangé = `BREVAL_CONTACT_EMAIL`
  (`agence@caractere.swiss`, provisoire).

- 2026-07-11 — **GO-LIVE Lot 1 — parties A/C/D faites et testées (4fef8d2, déployé).**
  Mandat GO-LIVE en 5 volets (A formulaires, B SMTP, C QA/QC, D image, E go-live
  gated). **A/C/D codés, déployés sur staging, testés en conditions réelles**
  (requêtes HTTP effectives, pas de simulation) :
  - **A. Formulaires** (`inc/forms.php`) : Lot 1 — maquette inerte remplacée
    par un vrai formulaire « Demande de réservation » (arrivée/départ/
    personnes/nom/email/tel/message), nonce + honeypot, envoi `wp_mail()`.
    Lot 2 — formulaire « être prévenu·e » câblé (était mailto/démo).
    Adresse destination centralisée dans **une seule constante**
    `BREVAL_CONTACT_EMAIL` (= `agence@caractere.swiss` provisoire — switch
    Luc = un seul endroit à changer). Objets mail conformes à la consigne.
    **Testé en direct** (requêtes POST réelles vers `admin-post.php` avec
    nonce extrait dynamiquement) : Lot 1 → `breval_form=success` + message
    affiché ✓ ; Lot 2 → `success` ✓ ; honeypot rempli → `error` (rejeté) ✓.
  - **C. QA/QC** : galerie Lot 1 — 26 vignettes `-400w`/`-800w` générées
    (sips), `srcset`+`sizes` sur repli statique ET branche ACF
    (`wp_get_attachment_image_srcset`), original 1600px réservé au lightbox,
    fond `--sand` anti-flash-blanc. `inc/performance.php` : HSTS
    (`max-age=31536000; includeSubDomains`, pas de preload) + dequeue complet
    wp-emoji. **Vérifié en direct** : header HSTS présent, srcset présent
    dans le HTML servi, `wp-emoji-release` absent du head (0 occurrence).
  - **D. Hero accueil** : repli provisoire = photo Lot 1 (balcon) au lieu du
    placeholder gris. **Vérifié** : présente dans le HTML servi.
  - Déployé via le pipeline établi (`gh workflow run deploy.yml`, pas de SSH
    manuel pour le déploiement — refusé à raison par le classifieur auto-mode
    la première fois, corrigé). PHP linté (7 fichiers, `php -l` via serveur)
    avant push, build webpack OK.

  **⏸️ B. SMTP — BLOQUÉ, credentials manquants.** WP Mail SMTP (plugin déjà
  dans la stack réf.) nécessite les identifiants du compte
  `agence@caractere.swiss` (Infomaniak) que je n'ai pas et ne dois pas
  deviner. `wp_mail()` fonctionne techniquement dès maintenant (testé,
  retourne `true`) via le mail() PHP local du serveur — mais la
  délivrabilité réelle (anti-spam) n'est PAS garantie sans SMTP configuré.
  **Action Ilias** : fournir user/mdp SMTP Infomaniak (→ Keeper/ACCES.md),
  je configure WP Mail SMTP ensuite.

  **⏸️ E. Go-live — GATED, pas d'action engagée.** Étapes 8–11 (Phase D
  checklist complète, déploiement racine breval.net, retrait noindex +
  Basic Auth) sont explicitement conditionnées à « Phase D validée » dans
  la consigne, et constituent des actions à fort impact (bascule domaine
  public, suppression de la protection d'accès) — je ne les engage pas sans
  confirmation explicite, conformément aux garde-fous.

- 2026-07-10 — **QA #1 : front page non assignée — corrigé (3b2f369).**
  Racine `/staging/` servait l'article WP par défaut au lieu de la page
  Accueil (`/staging/accueil/` rendait bien). **Cause** : `wp post meta
  update` imprime son propre `Success: …` sur **STDOUT** à l'intérieur de
  `ensure_page()`, contaminant la valeur capturée par
  `ID_ACCUEIL=$(ensure_page ...)` en plus de l'ID final → `page_on_front`
  recevait une chaîne multi-lignes invalide, rejetée, retombant à `0`.
  **Fix** : stdout de `wp post meta update` redirigé vers `/dev/null`.
  Ajout purge idempotente du contenu de démo (`post 1` Hello world, `page 2`
  Page d'exemple). Appliqué en direct sur le serveur (SSH) + vérifié :
  racine sert désormais Accueil (« Deux logements à louer à Sion »).

- 2026-07-10 — **🟢 Basic Auth réparé — accès staging fonctionnel (a562dd2).**
  Ilias signalait un 401 persistant avec `breval`/identifiants du Job Summary.
  **Diagnostic en SSH direct** (clé `~/.ssh/breval-ci-deploy`, déjà présente
  localement) : hash APR1 stocké **mathématiquement correct** (reproduit à
  l'identique via `openssl passwd -apr1 -salt`), `.htaccess`/`AuthUserFile`
  syntaxiquement propres, aucun conflit (`.htpasswds/` cPanel natif vide,
  aucun autre `.htaccess` avec directive Auth en amont) — pourtant 401
  systématique, y compris avec le bon mot de passe.
  **Cause réelle** : `.htpasswd_staging` en **600** — illisible par le
  process d'authentification LiteSpeed, qui tourne sous un utilisateur
  système différent du compte cPanel `vwfewhpb`. Confirmé par test direct :
  600 → 401 quoi qu'il arrive ; **644 → 200** avec les bons identifiants,
  401 sinon/mauvais mdp/mauvais user (4 cas testés).
  **Fix appliqué en direct sur le serveur** (même mot de passe, rien à
  changer côté Ilias) **+ script mis à jour** pour les runs futurs : format
  `{SHA}` (SHA1+base64) + `chmod 644` (norme `.htpasswd` en mutualisé).
  **Vérifié** : `curl -u breval:… https://breval.net/staging/` → `200`,
  `<title>Bréval — staging</title>` chargé.

- 2026-07-10 — **🟢 STAGING INSTALLÉ — install-staging.yml au vert (d63b8e7).**
  Mandat autonome : boucle complète pilotée seul via `gh` (déclenchement,
  watch, diagnostic, fix, push, relance) sans relais humain, jusqu'au run vert.
  **[Run final #29120292868](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29120292868)**
  — 16/16 étapes ✓. 3 itérations de correctifs en cours de route :
  1. Permaliens : `--hard` échouait (détection Apache indisponible en contexte
     CLI/SSH) → retiré, bloc de réécriture WordPress standard (`/staging/`)
     injecté manuellement dans `.htaccess`.
  2. `wp rewrite structure` (même sans `--hard`) invoquait en interne un
     sous-processus (`proc_open`/`proc_close`), **désactivé côté PHP sur
     ex2** → bypass total : écriture directe des options DB
     (`permalink_structure` + suppression `rewrite_rules` pour régénération
     au premier hit).
  3. Basic Auth : `htpasswd` (binaire) absent du serveur → hash APR1-MD5 via
     `openssl passwd -apr1` (déjà utilisé ailleurs sur ex2), vérifié
     localement avant push.
  **Vérification finale** : `curl -I -L https://breval.net/staging` → `401`,
  `WWW-Authenticate: Basic realm="Bréval — accès restreint"` — staging en
  ligne, protégé, noindex actif (thème), aucune mise en ligne racine.
  **Identifiants** (admin WP + Basic Auth) dans le **Job Summary** du run
  (non récupérable via `gh`/API — UI web uniquement) : à copier dans
  `ACCES.md`/Keeper par Ilias.

- 2026-07-10 — **Fix run #10 : pages, gabarit non reconnu par wp-cli (366d5ac).**
  WordPress + ACF Pro + thème + plugins tous OK. Échec : `--page_template=
  "templates/pages/page-accueil.php"` → « Modèle de page non valide » (wp-cli
  valide contre `wp_get_theme()->get_page_templates()`, qui ne détecte pas les
  gabarits imbriqués sous `templates/pages/`). Page « Accueil » créée mais
  gabarit non assigné. **Fix** : page créée SANS `--page_template`, puis
  `wp post meta update <id> _wp_page_template "<valeur>"` en écriture directe
  (bypasse la validation CLI — WordPress lit cette meta telle quelle au
  rendu via `get_page_template_slug()`). Échec de l'assignation = warning
  non bloquant. Idempotent : la page « accueil » déjà créée au run précédent
  sera retrouvée (pas de doublon), seul le gabarit sera (re)assigné.

- 2026-07-10 — **Fix run #9 : slug SEOPress + tolérance d'échec plugins (c8bb405).**
  Gros progrès : WordPress ✓, ACF Pro (zip) ✓, thème Bréval activé ✓. Échec à
  l'installation des plugins réf. : `seopress` introuvable — vrai slug
  WordPress.org = `wp-seopress`. **Fix** : slug corrigé + chaque plugin
  (`wp-seopress`, `wp-mail-smtp`, `wordfence`, `complianz-gdpr`) tenté
  isolément, un échec individuel n'émet plus qu'un warning et ne bloque plus
  le reste du staging (plugins secondaires pour la preview).

- 2026-07-10 — **ACF Pro depuis zip commité (e98e549) — API définitivement abandonnée.**
  L'endpoint direct (fix précédent) échouait aussi. Ilias a committé
  `advanced-custom-fields-pro.zip` (v6.8.5, ~7,4 Mo) à la racine du repo
  (`617d55d`, via GitHub web). **Fix** : nouvelle étape workflow « Transfère
  le zip ACF Pro » (tar-over-ssh, même méthode éprouvée que le thème) → dépose
  le zip dans `/tmp` sur ex2 ; `install-acf.sh` réécrit pour installer depuis
  ce zip transféré (validation zip conservée) au lieu de télécharger via API.
  **Secret `ACF_PRO_KEY` n'est plus requis.** `.gitattributes` ajouté
  (`*.zip`/`*.woff2`/`*.jpg`/`*.png` en binary). YAML + bash revalidés,
  transfert tar simulé en local avant push.

- 2026-07-10 — **Fix run #7 : mauvais endpoint ACF Pro (a6bb397).**
  WordPress installé OK. Échec ACF Pro : `{"code":"invalid_token"}` — l'endpoint
  `v2/plugins/download?token=` attend un download token distinct de la license
  key. **Fix** : endpoint officiel direct `index.php?p=pro&a=download&k=<KEY>`,
  via `curl -G --data-urlencode` pour encoder proprement la clé (peut contenir
  `+/=/&`). Encodage vérifié empiriquement (round-trip via httpbin.org).
  Validation zip existante conservée. Fallback documenté : zip ACF Pro commité
  dans le repo privé si l'intermittence 403 connue de cet endpoint persiste.

- 2026-07-10 — **Fix run #6 : préfixe cPanel manquant dans les appels UAPI (0c9bbe7).**
  tar OK, WP 7.0.1 fr téléchargé, wp-config généré — mais **création MySQL
  réellement échouée** : `create_database`/`create_user`/
  `set_privileges_on_database` recevaient le suffixe nu (`stgbreval`/
  `stguser`) au lieu du nom préfixé `vwfewhpb_…` exigé par cPanel, alors que
  `wp config create` utilisait déjà (correctement) le nom préfixé →
  `wp-config.php` pointait vers une base jamais créée. L'échec UAPI ne
  stoppait pas le script (`if` exempte du `set -e`).
  **Fix** : les 3 appels UAPI utilisent maintenant `$DB_NAME`/`$DB_USER`
  (préfixés), cohérents partout. **Idempotence** : si `reset_credentials=true`,
  un `wp-config.php` existant (potentiellement invalide, issu du run cassé)
  est supprimé avant la vérification d'existence → régénéré au lieu d'être
  sauté. `bash -n` + YAML revalidés.
  Ilias relance en cochant « Régénérer DB/admin/Basic Auth » pour repartir propre.

- 2026-07-10 — **Fix run #5 : bascule rsync → tar-over-ssh (9e6ed31).**
  `--rsync-path=/usr/bin/rsync` (fix précédent) insuffisant — exit 12 persiste,
  rsync réellement absent/inaccessible sur ex2. Remplacé par transfert
  **tar-over-ssh** (ne dépend que de tar) dans les deux workflows : `rm -rf +
  mkdir` distant émule `--delete`, `tar czf - --exclude=… . | ssh … tar xzf -`
  reproduit le transfert. Exclusions **vérifiées empiriquement en local**
  (tar réel, pas supposé) : node_modules/scss/ts/src/.git/.github/.env/
  package*/webpack/tsconfig/README/CLAUDE bien exclus ; dist/, style.css,
  functions.php, templates, fonts bien présents dans l'archive. YAML revalidé.

- 2026-07-10 — **Fix run #4 : rsync introuvable côté ex2 (31ebd40).**
  SSH OK (clé chargée, mkdir distant OK) mais échec à l'étape rsync :
  `bash: rsync: command not found`, exit 12 — le PATH SSH non-interactif
  d'ex2 n'expose pas rsync. **Fix** : `--rsync-path=/usr/bin/rsync`
  (emplacement standard cPanel) ajouté aux deux occurrences (`deploy.yml` +
  `install-staging.yml`). Fallback tar-over-ssh documenté en commentaire si
  ce chemin diffère sur ex2. YAML revalidé.

- 2026-07-10 — **Fix run #2 install-staging : clé SSH « error in libcrypto » (42d2007).**
  Run #2 échouait dès la 1re étape SSH (`Load key: error in libcrypto` →
  `Permission denied (publickey)`, exit 255). Clé valide localement — cause =
  écriture manuelle du secret dans un fichier sur le runner (newline/encodage).
  **Fix** : remplacé par `webfactory/ssh-agent@v0.9.1` (charge la clé via
  `ssh-add`, tolérant) dans `deploy.yml` ET `install-staging.yml`. Tous les
  `-i ~/.ssh/id_deploy` retirés (ssh + rsync) ; `known_hosts` conservé via
  `ssh-keyscan`. YAML revalidé (parseur), aucun résidu.

- 2026-07-10 — **Fix run #1 install-staging : lockfile manquant (d732fb2).**
  `install-staging.yml` #1 échouait à l'étape npm : « Dependencies lock file
  is not found » (`setup-node cache: npm` + `npm ci` exigent `package-lock.json`,
  jamais committé). Généré via `npm install` (168 paquets, `package.json`
  inchangé), vérifié en local : `npm ci` propre (rm -rf node_modules + ci) +
  `npm run build` OK. Committé et poussé. **`deploy.yml` en bénéficie aussi**
  (même lockfile partagé à la racine, même `npm ci`).

- 2026-07-10 — **Install staging en un bouton (df1d821).**
  `install-staging.yml` (workflow_dispatch manuel) exécute tout le runbook
  INSTALL-STAGING.md : base MySQL via UAPI cPanel (échec clair si UAPI absent),
  core WP fr_FR, config, install (`cc-admin`), ACF Pro (via `ACF_PRO_KEY`, zip
  validé avant install), thème (build+rsync réutilisant `deploy.yml`), plugins
  réf. (seopress, wp-mail-smtp, wordfence, complianz-gdpr), pages+permaliens,
  Basic Auth. **Idempotent** : identifiants (DB/admin/Basic Auth) générés une
  fois puis persistés côté serveur (`~/.breval_staging_creds`, chmod 600,
  hors webroot) — un re-run les réutilise ; option `reset_credentials` pour
  rotation volontaire. Résumé du run affiche URL + identifiants en clair
  (à copier immédiatement dans `ACCES.md`/Keeper).
  **Bug corrigé en cours de route** : scripts distants d'abord écrits en
  heredoc dans le YAML → un heredoc indenté casse le parsing YAML du bloc
  `run: |` (le scalaire se termine dès qu'une ligne est moins indentée).
  Refait en fichiers `.github/scripts/*.sh` exécutés via `bash -s -- <args> <
  fichier.sh` (redirection stdin, pas de heredoc). YAML + 5 scripts revalidés
  (`bash -n` + parseur YAML) avant push.
  **Toujours pas exécuté par moi** (pas d'accès SSH/secrets d'ici) — à lancer
  depuis Actions → *Install staging (one-shot)* → Run, une fois les 2 secrets
  posés (`SSH_PRIVATE_KEY`, `ACF_PRO_KEY`).

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
