# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié).

## 1. Brief en cours
> Les consignes arrivent ici. Statut : à faire / en cours / fait.

⚠️ **Ce repo (brouillon Eleventy) est OBSOLÈTE depuis le go-live du 11.07.**
Le site réel est **WordPress, en production sur https://breval.net/**, dans le
repo privé `caractere-swiss/breval-wordpress`. Ce fichier reste le canal de
coordination Claude Code → chat Web, mais tout le travail consigné au journal
ci-dessous porte sur le site WordPress, pas sur ce brouillon.

**Briefs ouverts — action Ilias, pas Claude Code :**
- **ACF Pro 6.8.6** : mise à jour bloquée, l'endpoint de téléchargement ACF est
  mort (404). Ilias télécharge le zip depuis son compte ACF et le committe à la
  racine de `breval-wordpress` (UI web GitHub, comme pour la 6.8.5) ; le
  workflow `update-acf-pro.yml` prend le relais ensuite.
- **Wizards wp-admin** : Wordfence (brute-force / limite de connexion) et
  Complianz (RGPD) — non scriptables, à lancer en interface.
- **Réception `contact@breval.net`** : 2 mails de test envoyés le 21.07,
  livraison inbox jamais confirmée (Claude Code n'a pas accès à la boîte).

## 2. Journal Claude Code
> Chronologique inverse (le plus récent en haut).

> ⚠️ **Restitution du 2026-08-12** — les 4 entrées du 12.07 marquées
> « [restituée] » ci-dessous avaient été écrites dans une copie locale kDrive
> (`2.solution-web/_to_delete/claude-code/PILOTAGE-WEB.md`) **jamais commitée**,
> puis perdues au vidage de `_to_delete/`. Restituées ici depuis le contexte de
> la session qui les avait produites. Le fichier canonique est **celui de ce
> repo** — toute écriture passe désormais par un commit `docs(pilotage):`,
> jamais par un fichier kDrive isolé.

- 2026-08-27 — **Régression de langue — mécanisme réel introuvable malgré recherche honnête, RIEN corrigé (51fac27 → 6c08399).**
  Question directe du chat stratégie : « WPLANG absent le 12.08 » était-il
  mesuré ou déduit ? **Mesuré** — log archivé du 12.08, même message d'erreur
  "Could not get 'WPLANG' option" ce jour-là. Mais la question logique
  derrière est juste et reste sans réponse : WPLANG absent + site en fr_FR
  ce jour-là = autre chose portait la locale. Recherché sans rien exécuter :
  - **mu-plugins** : un seul fichier actif (`imunify-security-bots.php`,
    lié à l'hébergeur), aucune mention de "locale" dedans.
  - **Drop-ins racine `wp-content/`** : seulement `maintenance.php` et
    `index.php`, standards, sans rapport.
  - **Filtre `locale`** : 2 callbacks réellement accrochés —
    `WP_Locale_Switcher::filter_locale` (cœur WP, passe-plat hors bascule
    active) et **`cmplz_set_plugin_language`** (Complianz). **Écarté après
    lecture du code réel installé** (Complianz est premium, pas sur
    wordpress.org — lu directement sur le serveur,
    `wp-content/plugins/complianz-gdpr-premium/functions.php:1432`) : cette
    fonction ne force `en_US` que si `$_GET['clang'] === 'en'` est présent
    dans l'URL — jamais le cas dans mes tests (`?qa=270826`, etc.). Aucun
    des deux callbacks n'explique le en_US observé.
  - **Filtre `pre_determine_locale`** : aucun callback accroché.
  - **Override direct de `$GLOBALS['locale']`** (technique fréquente,
    invisible depuis l'inspection des filtres) : recherché dans tout
    plugins/thèmes/mu-plugins actifs, **aucune occurrence trouvée**.
  - **Chargement de traduction propre à Hotel Booking Lite** : vérifié dans
    son code (`plugin.php::loadTextDomain()`) — utilise `determine_locale()`
    standard + le filtre `plugin_locale`, déjà mesuré à `en_US` en amont
    (aucun mécanisme distinct côté plugin).
  - **Conclusion honnête** : après ce passage en revue de tous les
    mécanismes standards de résolution de locale WordPress, **la cause
    réelle de ce qui portait fr_FR le 12.08 reste non identifiée.** Le
    correctif proposé (`wp option update WPLANG fr_FR`) ne restaurerait donc
    pas un mécanisme retrouvé — il en établirait un nouveau, standard et
    explicite, en l'absence d'explication pour l'ancien. Toujours **PAS
    exécuté**, GO d'Ilias attendu.

- 2026-08-27 — **Régression de langue — diagnostic lecture seule fait, RIEN corrigé (db7af7b, run #33050597436).**
  Demande explicite du chat stratégie : mesurer et rapporter brut, ne rien
  corriger sans GO dédié. Script `investigate-site-locale.sh` — aucune
  mutation (audité : uniquement `option get`, `core version`, `plugin
  list`, `language plugin list`, `eval` en lecture, `find`/`ls`/`stat`).
  - **WPLANG** : absent en base (`wp option get` échoue), comme au 12.08 —
    inchangé, jamais eu de valeur explicite.
  - **wp-config.php** : aucune constante WP_LANG/WPLANG, mtime 2026-07-12
    (antérieur à tout ceci, sans rapport).
  - **wp-content/languages/** : tous les fichiers fr_FR (core, admin,
    plugins, thèmes) **toujours présents sur disque** — pas de fichier
    manquant, le rsync --delete du thème (`deploy.yml`, scopé à
    `wp-content/themes/breval/` uniquement) n'a jamais pu les toucher, et
    de fait ne les a pas touchés. Le dossier `languages/` lui-même et de
    nombreux fichiers fr_FR portent la date **21.08.2026 19:03** (rafraîchi,
    pas supprimé).
  - **Historique de versions** : `wp core version` = **7.1**.
    `wp-includes/version.php` daté **20.08.2026 09:05** — une mise à jour
    core a eu lieu ce jour-là (version antérieure non connue, jamais
    mesurée explicitement avant). `wp-content/upgrade/` (dossier de
    transit des mises à jour) daté **21.08.2026 19:03** — même horodatage
    que le rafraîchissement des fichiers de langue, cohérent avec une tâche
    cron de rafraîchissement des traductions le lendemain de la mise à jour
    core. Plugins : ACF (6.8.7→6.8.8 disponible), Complianz (7.5.7.2→7.6.4
    disponible), SEOPress (10.0.2→10.1 disponible), UpdraftPlus
    (1.26.5→1.26.7 disponible), Wordfence (8.2.2→**9.0.0** disponible,
    changement de version majeure) — **aucun installé**, tous encore sur
    leur version du 12.08. Seule exception : **imunify-security 4.0.2 →
    4.1.0**, déjà auto-mis à jour (plugin lié à l'hébergeur, hors du
    contrôle WP core/site).
  - **Locale spécifique Hotel Booking Lite** : `apply_filters(
    'plugin_locale', get_locale(), 'motopress-hotel-booking' )` = `en_US`
    (pas de filtre tiers qui la changerait — aucun plugin multilingue actif,
    confirmé). `wp language plugin list` pour ce plugin **ne liste PAS
    fr_FR du tout** (seulement cs_CZ/da_DK/en_US actif/es_CL/es_ES/it_IT/
    ru_RU/sk_SK/uk) — le fr_FR qui s'affichait le 12.08 vient exclusivement
    du fichier **embarqué dans le zip du plugin lui-même**
    (`languages/motopress-hotel-booking-fr_FR.mo`, jamais installé comme
    "language pack" séparé via wp-cli/WP.org). `is_textdomain_loaded(
    'motopress-hotel-booking' )` = **false** — cohérent avec une locale
    en_US : WordPress ne cherche/charge un .mo QUE si la locale differe de
    la langue source (anglais), donc ce "false" est une CONSÉQUENCE de
    la locale, pas un problème séparé.
  - **Corrélation constatée, PAS de causalité affirmée** : la valeur
    WPLANG est vide (→ défaut en_US) au moment de ce diagnostic ; une mise
    à jour du cœur WordPress (vers 7.1) a eu lieu le 20.08 ; un
    rafraîchissement des fichiers de traduction a suivi le 21.08. Ces trois
    faits sont datés dans la même fenêtre que la régression (fr_FR
    confirmé le 12.08, en_US confirmé le 27.08). Aucune preuve directe que
    la mise à jour core est la cause du changement de langue — seulement
    une coïncidence temporelle documentée.
  - **Correctif, chiffré, PAS exécuté** : `wp option update WPLANG fr_FR`
    (ou `wp site switch-language fr_FR`) — tous les fichiers fr_FR
    nécessaires sont déjà sur disque et à jour (21.08), aucune réinstallation
    de pack de langue requise. Effort : quelques secondes, une seule valeur
    d'option modifiée, réversible trivialement. Ne répond pas à la question
    de la cause récurrente si un processus automatisé en est responsable.
    **GO dédié requis avant exécution.**

- 2026-08-27 — **🟢 Deploy BS-T5 27.08 — 4 lots en production, QA brute faite (4602f92 → efdc9b6).**
  GO explicite Ilias. Sauvegarde UpdraftPlus confirmée avant intervention
  (`success:1`, nouveau `backup_time`). Thème déployé, page conditions +
  réglages MPHB créés (run
  [#33049399756](https://github.com/caractere-swiss/breval-wordpress/actions/runs/33049399756)).
  - **QA section 6 du brief, résultats bruts, `?qa=270826`** : `/` → 302 non
    suivi vers `/courte-duree/` (code vérifié, pas juste l'atterrissage) ;
    `/courte-duree/` un seul h1, 10 conditions présentes, résidu D1 absent,
    zéro mention colocation/longue durée ; `/longue-duree/` un seul h1,
    zéro mention courte durée, plus aucune trace de septembre (thème ET
    meta description), 1er janvier 2027 affiché, badge photos absent ;
    `/conditions-de-reservation/` 200, un seul h1, zéro placeholder, aucune
    mention paiement en ligne ; `/reservation/` noindex retiré (`meta
    robots` = `index, follow`), lien conditions présent, tunnel testé
    réellement de bout en bout (réservation #41, 555 CHF, statut pending,
    case conditions obligatoire fonctionnelle, liée à la bonne page) —
    supprimée après coup (`--force`).
  - **2 bugs trouvés et corrigés EN COURS DE QA** (pas après coup) :
    1. `/reservation/` affichait encore "Départ : 10h00" en dur, alors que
       `mphb_check_out_time` venait de passer à 11:00 dans le même
       déploiement — divergence silencieuse. Corrigé en lisant les réglages
       réels en direct (mêmes fonctions que le plugin lui-même), ne peut
       plus diverger. Lien vers les conditions ajouté au passage (QA §5).
    2. **`cleanup-test-booking.sh` donnait un faux résultat depuis le
       12.08** : `wp post list --include=X` n'est pas un filtre WP_Query
       valide (silencieusement ignoré, le bon est `--post__in`) — la
       vérification "plus aucune trace" retombait sur tout le post_type
       sans filtrer par ID. Passé inaperçu le 12.08 par pure coïncidence
       (une seule réservation existait alors). Découvert en nettoyant la
       #41 : le script a rapporté un échec alors que la suppression avait
       réellement réussi (`wp post delete` avait renvoyé "Success"). Corrigé
       (`wp post get`, qui échoue franchement sur un ID absent).
  - ⚠️ **Découverte majeure, HORS PÉRIMÈTRE de ce brief, signalée sans
    y toucher** : `get_locale()` renvoie **`en_US`**, `<html lang="en-US">`
    — le site entier a basculé en anglais pour tout ce qui dépend de la
    locale WP (widgets Hotel Booking Lite : "Check-in", "Adults", "Book"...).
    Le contenu du thème reste en français (les chaînes `breval` ont le
    français comme texte SOURCE, pas une traduction — donc insensibles à la
    locale). **Confirmé fr_FR le 12.08** (tout le tunnel s'affichait alors
    en français) — le changement s'est donc produit ENTRE le 12.08 et le
    27.08, cause inconnue, aucun de mes scripts ne touche WPLANG/locale.
    **Pas corrigé** — décision hors du périmètre de ce brief, à trancher
    par Ilias/chat stratégie avant toute action.
  - ⚠️ **Réservation #38 découverte, non touchée** : `pending` depuis le
    19.08, dates déjà passées (21→23.08), client « Luc Luc
    <fhjj@gdfh.fr> » — signature typique d'un test de Luc lui-même sur le
    tunnel, jamais confirmée ni nettoyée. Signalée, pas supprimée (pas la
    mienne, hors périmètre).
  - E-mails du test #41 déclenchés côté code (admin + client, tous deux
    `contact@breval.net`) — réception non vérifiée, comme toujours.

- 2026-08-27 — **Retour chat stratégie sur la prep BS-T5 27.08 — 2 points traités, toujours PAS déployé.**
  1. Badge « Photos disponibles dès fin juillet » sur `/longue-duree/` :
     **retrait pur**, aucune date de remplacement inventée — décision
     tranchée côté stratégie. Réapparaîtra seul dès réception des vraies
     photos de Luc (`$hero_image` alors renseigné, ce placeholder ne
     s'affiche plus). Nettoyage associé : `$mode_bientot`
     (`cc_lot2_mode_bientot`) devenu mort dans le gabarit — variable
     retirée, **champ ACF lui-même non touché** (garde-fou).
  2. **Le noindex de `/reservation/` a TOUJOURS vécu côté SEOPress**
     (`_seopress_robots_index`, posé par moi-même le 12.08) — jamais de
     piste « logique thème » explorée de mon côté, contrairement à ce que
     supposait le texte du brief original. Le chat stratégie signale que sa
     propre mesure du 20.08 (« aucune empreinte SEOPress/Yoast/RankMath/
     AIOSEO ») est donc caduque : elle précède la pose du noindex (12.08),
     ce n'est pas une mesure ratée, juste antérieure au fait. Mon script
     (`setup-conditions-reservation.sh`) ciblait déjà correctement le bon
     mécanisme dès l'écriture — rien à corriger sur ce point.

- 2026-08-27 — **BS-T5 27.08 — cloisonnement + conditions Lot 1 + date Lot 2 : diff prêt, PAS déployé (attente GO Ilias).**
  Brief reçu du chat stratégie (2.solution-web), même ticket BS--T5, un seul
  déploiement pour 4 lots. Garde-fous rappelés : GO uniquement dans ce chat,
  aucun paiement en ligne réintroduit, ne pas toucher politique de
  confidentialité / mentions légales / SMTP / ACF / UpdraftPlus.
  - **Lot A — cloisonnement** : accueil → 302 (jamais 301) vers
    `/courte-duree/` via `template_redirect` committé (`inc/redirects.php`),
    page/gabarit accueil conservés (rien supprimé). Nav réduite à une seule
    entrée contextuelle (plus « Accueil »), lien logo contextuel (ne pointe
    plus jamais vers l'autre lot). Footer : colonne « Nos logements »
    (les deux liens) supprimée, tagline de marque devenue contextuelle.
    Vérifié : aucun renvoi croisé déjà présent dans le corps des pages
    Lot 1/Lot 2 elles-mêmes (seuls nav/footer partagés portaient le
    croisement).
  - **Lot B — conditions Lot 1** : les 10 conditions tranchées par Luc
    (séance du 20.08) ajoutées en dur sur `/courte-duree/` (bloc dédié, pas
    de champ ACF — ce sont des règles de politique, pas des données
    variables). Page `/conditions-de-reservation/` créée depuis la source
    validée fournie (`breval-conditions-reservation.html`), système de
    classes pp-* **dédié** (vocabulaire différent du système partagé
    mentions-légales/confidentialité — pas de renommage de la source
    validée). Correctif `|| true` (bug latent wp-cli connu) appliqué dès
    l'écriture du script, pas après coup.
    **Réglage natif Hotel Booking Lite trouvé et câblé** (vérifié dans le
    code, pas supposé) : `mphb_terms_and_conditions_page` +
    `mphb_open_terms_in_new_window=1` — les DEUX nécessaires
    (`checkout-view.php::renderTermsAndConditions()` ignore tout le bloc,
    case à cocher comprise, si le second n'est pas activé et qu'aucun texte
    inline n'est configuré). Produit une case à cocher **obligatoire**
    "J'ai lu et j'accepte les conditions" au checkout, liée à la page.
  - **Correction live découverte** : heure de départ. Posée provisoire à
    10:00 le 12.08 (`[À CONFIRMER LUC]`), tranchée à **11h00** par Luc —
    `mphb_check_out_time` sera mis à jour en conséquence (arrivée 16h00 et
    séjour minimum 2 nuits inchangés, déjà corrects).
  - **Lot C — date Lot 2** : balayage du dépôt ET de la base (pas que le
    code) pour "1er septembre" — trouvé et corrigé dans le thème
    (`page-lot-2.php`, 2 occurrences dont une invisible au grep car coupée
    par une balise `<sup>`) **et une 3e occurrence trouvée UNIQUEMENT en
    base** via diagnostic live : la meta description SEOPress de
    `/longue-duree/` disait encore "Disponible dès septembre" — invisible
    depuis un grep du repo, corrigée (`update-lot2-meta.sh`). `page-accueil.
    php` porte aussi la mention mais devient inatteignable via le 302 —
    laissé tel quel, conforme au raisonnement du brief lui-même.
    ⚠️ **Non corrigé, signalé plutôt que deviné** : le badge « Photos
    disponibles dès fin juillet » sur `/longue-duree/` est également
    obsolète mais ne correspond à aucune date explicitement visée par le
    brief, et je n'ai aucune nouvelle date de référence pour les photos
    sous le nouveau calendrier (rénovation cuisine → 01.01.2027) — pas
    inventé, à trancher par Ilias/Luc.
  - **Lot D** : phrase résiduelle « Demande de réservation manuelle — nous
    confirmons... » retirée de `/courte-duree/` (gabarit PHP, confirmé
    exactement où le brief l'indiquait). `noindex` sur `/reservation/` :
    mécanisme **déjà connu** (c'est moi qui l'ai posé le 12.08 —
    `_seopress_robots_index` SEOPress, pas une logique thème comme le brief
    le supposait) — retrait câblé dans le même script que la création de
    la page conditions, séquencé après.
  - **Diff prêt, non pushé** (sauf l'extension du diagnostic lecture seule,
    déjà poussée et exécutée pour ce repérage — aucune mutation) : 12
    fichiers, page conditions + SCSS dédiée, redirections, nav/footer
    cloisonnés, conditions Lot 1, dates Lot 2, réglages MPHB. **GO explicite
    d'Ilias requis avant tout déploiement** (garde-fou permanent) — demandé,
    en attente au moment de cette entrée.

- 2026-08-12 — **🟢 UpdraftPlus — nouvelle doctrine appliquée : capture ponctuelle, plus de sauvegarde régulière (df8dc10 → 2994b1f).**
  Décision Ilias : l'hébergeur assure déjà le régulier (ex2 : 1er/14 du mois +
  7 derniers jours, JetBackup/cPanel ; Infomaniak sur le reste du parc).
  UpdraftPlus devient un outil de capture ponctuelle avant grosse
  intervention, téléchargée en zip côté agence. Toutes les clés vérifiées
  dans le code réel du plugin (1.26.5, wordpress.org) avant tout changement.
  - **Planifications -> `manual`** (fichiers + base) — valeur native
    confirmée dans le code (`admin.php`, `class-updraftplus.php`).
  - **Rétention -> 4** (fichiers + base), au lieu de 1.
  - **Aucune destination distante, rapports e-mail désactivés** — déjà vrai
    avant intervention (`updraft_service` et `updraft_email` déjà vides),
    rien à changer, juste vérifié.
  - **`updraft_delete_local` tranché par le code, pas par supposition** :
    reste à sa valeur (1, défaut du plugin), **volontairement pas touché**.
    `delete_local()` n'est appelée que depuis `uploaded_file()`, qui elle-même
    ne l'invoque QUE si un service de stockage distant non vide est
    configuré (le plugin l'affirme lui-même en commentaire : "Where we are
    only backing up locally, only the "prune" function should do deleting").
    Avec zéro destination distante ici, ce chemin ne s'exécute **jamais** —
    **verdict : cas (a), inerte, sans effet.** Pas de risque que les
    captures ponctuelles s'auto-effacent.
  - **Test réel exécuté deux fois** (1er run a servi à vérifier la doctrine
    idempotente, format ci-dessous = run final
    [#31606744030](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31606744030)) :
    sauvegarde déclenchée → statut `success:1` confirmé → **les 6 fichiers du
    set (plugins/thèmes/uploads/mu-plugins/others/db) vérifiés PHYSIQUEMENT
    présents sur disque, lisibles, tailles conformes** à ce que
    `updraft_last_backup` annonçait — precondition exacte du téléchargement
    (`readfile()` sur ce chemin). **Non vérifié : le clic réel du bouton
    "Télécharger" en wp-admin** (hors périmètre, pas de session wp-admin
    depuis ce script — signalé explicitement, pas présumé).
  - **Export des réglages** : le bouton wp-admin est 100% client-side (JS
    pur, aucun endpoint serveur — vérifié dans le JS source) : impossible à
    déclencher en headless. JSON reconstruit à la place depuis les valeurs
    DB réelles des **champs exacts du formulaire Réglages** (liste extraite
    de `templates/wp-admin/settings/form-contents.php`, pas un dump
    générique de toutes les options — celui-ci aurait à tort inclus
    l'historique des sauvegardes). Deux défauts corrigés en cours de route
    après vérification contre le gabarit (pas devinés) :
    `updraft_delete_local` défaut réel = 1 (coché), et `updraft_auto_updates`
    n'a pas sa propre option — lu en direct via
    `$updraftplus->is_automatic_updating_enabled()`. Fichier envoyé à
    Ilias : `updraftplus-settings-breval-modele.json` — à transmettre au
    skill `2-1-solution-web` pour remplacer le modèle laforetdescissy.ch
    (31.08.2025, rétention 1 + planifications automatiques, obsolète).

- 2026-08-12 — **🟢 ACF Pro 6.8.5 → 6.8.7 déployé — vulnérabilité Wordfence du 16.07 fermée (e08751f → e53feec).**
  Feu vert technique du chat stratégie, avec correction de la règle : « 6.8.6
  OU PLUS RÉCENT », pas « exactement 6.8.6 ». Zip 6.8.7 fourni par Ilias
  depuis son poste (chemin kDrive local, jamais commité par lui sur GitHub —
  vérifié : `git log` sur `advanced-custom-fields-pro.zip` ne montrait que
  l'upload d'origine 6.8.5 avant mon intervention).
  - **Contrôle avant tout commit** (piège rappelé par le chat stratégie : un
    nom de fichier n'est pas un numéro de version) : `acf.php` et
    `readme.txt` annoncent 6.8.7 dans les deux cas, 715 entrées, `testzip`
    propre, md5 `fb68c758ddc1be19a279b004fb3cf332` (9 699 419 octets) —
    **identique avant et après copie**, transport intègre. Commit `e08751f`.
  - **`update-acf-pro.yml` corrigé avant de le lancer** (`e53feec`) :
    tel quel, il aurait échoué dès la 1ère étape — retente
    `connect.advancedcustomfields.com`, confirmé mort (404) depuis le
    21.07.2026, 2 tentatives déjà enregistrées. Ajout d'une vérification qui
    saute le téléchargement quand un zip valide ≥ 6.8.6 est déjà commité
    (logique testée localement contre le vrai fichier avant push).
  - **Séquence exécutée** : sauvegarde UpdraftPlus (run
    [#31602667960](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31602667960),
    `success:1`, nouveau `backup_time`) → `update-acf-pro.yml` (run
    [#31602817944](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31602817944),
    téléchargement sauté comme prévu) → **version confirmée par WordPress
    lui-même** (pas le zip) : `wp plugin get` rapporte
    **« Version avant : 6.8.5 -> après : 6.8.7 »** → `/`, `/courte-duree/`,
    `/longue-duree/` revérifiées en direct : contenu ACF identique à avant
    (descriptions, "En bref", chambres et loyers de la colocation, etc.),
    aucune régression.

- 2026-08-12 — **🟢 QA publique BS-T5 (chat stratégie) — 3 suites traitées (510d86b).**
  QA externe verte : `/reservation/` 200, un seul h1, noindex actif, tunnel FR,
  zéro placeholder ; `/courte-duree/` un seul h1, bouton principal clair.
  3 demandes :
  1. **Réservation de test #36 supprimée définitivement** (`wp post delete
     --force`, pas de corbeille) — vérifié dans le code avant d'agir
     (`booking-cpt.php::removeReservedRooms()`, accroché à `delete_post`,
     jamais à `wp_trash_post()` : une simple mise à la corbeille aurait pu
     laisser les dates bloquées). Confirmé après coup par une recherche
     réelle sur les mêmes dates (20→23.08.2026) : la chambre réapparaît
     disponible. Run
     [#31596058270](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31596058270)
     — 0 entrée `mphb_reserved_room` restante.
  2. **Libellés du repli manuel sur `/courte-duree/`** — "Préférer une
     demande manuelle par e-mail" → **"Une question avant de réserver ?"** ;
     "Envoyer la demande" → **"Envoyer le message"**. Vocabulaire interne
     exposé au visiteur, corrigé. Vérifié live après déploiement.
  3. **Bug latent de `setup-mentions-legales.sh` corrigé** — même correctif
     que le fix `fdec6e1` de ce chantier (tolérance sur "Modèle de page non
     valide" au rerun de `wp post update`). Jamais exercé sur ce script faute
     de second run, mais aurait cassé le prochain. À reporter par Ilias au
     skill `2-1-solution-web` comme leçon réutilisable (le pattern est copié
     sur d'autres clients).
  - Script un-shot dédié conservé au repo :
    `.github/scripts/cleanup-test-booking.sh` +
    `.github/workflows/cleanup-test-booking.yml` (réutilisable si un futur
    test laisse une réservation à nettoyer).
  - Hors scope, géré par Ilias : publication `/conditions-de-reservation/` et
    retrait du noindex — en attente des réponses du client.

- 2026-08-12 — **🟢 Deploy BS-T5 — Hotel Booking Lite en production, tunnel testé de bout en bout (afde26a → f1845bc).**
  GO explicite Ilias (« C'est moi, Ilias, qui te le confirme directement. »),
  après contradiction réglée avec le chat stratégie sur qui donnait le go
  (le chat stratégie avait refusé de le faire à la place d'Ilias pour une
  action sur site public — signalé, clarifié, confirmé par Ilias en direct).
  - **Sauvegarde UpdraftPlus déclenchée avant intervention**
    (`backup-updraftplus.yml`, run
    [#31593742107](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31593742107)) :
    déclenchement via `global $updraftplus->backup_all()` (code réel du
    bouton "Backup Now", pas de commande wp-cli officielle côté plugin).
    Statut brut confirmé : `success:1`, 6 composants (plugins/thèmes/
    uploads/mu-plugins/others/db), nonce `fba3b8694812`.
  - **Déploiement thème** (`deploy.yml`, run
    [#31593835713](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31593835713)) :
    page `/reservation/`, lien principal depuis `/courte-duree/`, formulaire
    manuel relégué sous `<details>`. 5 pages existantes + `/reservation/`
    revérifiées 200 après coup.
  - **Config wp-cli** (`setup-hotel-booking.yml`) — **2 bugs trouvés et
    corrigés en direct pendant le déploiement**, tous deux via
    `investigate-hotel-booking.yml` (lecture seule) + repro sur la page
    live :
    1. **`mphb_season_prices` mal formaté** — le wrapper
       `items`/`last_index`/`default` est le format du **formulaire admin**
       (`complex-vertical-field.php`), pas celui lu en base :
       `rate-repository.php::mapPostToEntity()` itère la valeur meta
       directement comme un tableau plat de lignes `{season, price}`.
       Symptôme repro live : `Undefined array key` visibles sur
       `/reservation/`, tarif non affiché. Fix commit `084d2f5` — testé
       ensuite en vrai (voir plus bas, CHF 555 affiché correctement).
    2. **`wp post update` sur rerun** — émet "Modèle de page non valide" et
       retourne un exit code non nul sur cette instance wp-cli quand le
       meta `_wp_page_template` (imbriqué sous `templates/pages/`) existe
       déjà sur le post. `set -e` tuait le script avant la réécriture du
       gabarit (qui, elle, fonctionne toujours par écriture directe en
       meta). **Même quirk que `setup-mentions-legales.sh`, jamais exercée
       là-bas faute de 2e run — à surveiller si ce script est un jour
       relancé.** Fix commit `fdec6e1` (`|| true` explicite, commenté).
  - **Tunnel testé en réel, de bout en bout** (navigateur, dates
    20→23.08.2026, 3 nuits) : recherche → résultats (**CHF 555 = 185×3,
    correct**) → checkout (formulaire 100% en français, traduction FR
    embarquée dans le plugin) → soumission → **réservation #36 créée,
    statut `pending`** (confirmation manuelle conforme au réglage) — vérifié
    via `MPHB()->getBookingRepository()`, pas juste supposé. Client de test :
    « Test Deploy Ilias » `<contact@breval.net>` (customer ET admin sur la
    même boîte, pour vérifier les deux gabarits en un seul endroit).
    ⚠️ **Réception réelle en boîte NON vérifiée** — comme pour le test du
    21.07, `wp_mail()` n'a pas été ré-instrumenté pour capturer son retour
    booléen sur cette réservation précise (pas de log SMTP actif côté free
    WP Mail SMTP). Le code confirmé déclenché : action
    `mphb_booking_status_changed` → e-mails `admin_pending_booking` +
    `customer_pending_booking` (2 e-mails attendus dans
    `contact@breval.net`). **Vérification webmail = Ilias**, ne pas
    présumer la réception.
  - **Réservation de test #36 laissée en l'état** (statut `pending`) —
    contrainte « aucune suppression de contenu » du brief. **Ilias : à
    trasher/confirmer/ignorer selon préférence**, elle n'affecte rien
    d'autre.
  - Reste des réglages appliqués tels quels : voir entrée de prep
    ci-dessous pour le détail complet (réglages, hébergement, écarts
    tranchés, ajouts du chat stratégie).

- 2026-08-12 — **BS-T5 Hotel Booking Lite — prep + diff complet, PAS déployé (attente GO Ilias).**
  Brief reçu du chat stratégie (2.solution-web), ticket Zoho BS--T5. Recherche
  effectuée sur le **code source réel** de `motopress-hotel-booking-lite`
  6.2.3 (téléchargé depuis wordpress.org, pas de supposition sur les clés
  d'options/meta) + diagnostic **lecture seule** sur le serveur prod
  (`investigate-hotel-booking.yml`, run
  [#31588547384](https://github.com/caractere-swiss/breval-wordpress/actions/runs/31588547384)
  vert, aucune mutation).
  - **3 écarts trouvés vs brief, tranchés par le chat stratégie (échange du
    même jour) :**
    1. **Médiathèque vide (0 attachments)** — les 13 photos Lot 1 ne sont que
       des fichiers statiques du thème (`assets/images/lot-1/`), jamais en
       médiathèque. Solution retenue : import via `wp media import` depuis les
       fichiers déjà déployés sur le serveur (pas de re-upload). **Le thème
       reste la source de vérité** — `/courte-duree/` continue de pointer sur
       les fichiers statiques, la médiathèque n'est qu'une copie au service de
       la galerie Hotel Booking. ⚠️ **Conséquence à retenir** : au prochain
       remplacement d'une photo Lot 1, **les deux emplacements** (fichiers
       thème + médiathèque) devront être mis à jour, sinon divergence.
    2. **`wp user list` = 1 seul compte** (cc-admin), alors que le brief
       (§4.1) citait `contact@devecom.ch` et `muller@breval.net` comme
       « non tranchés ». **CLOS** — le chat stratégie confirme : ces comptes
       appartenaient au WordPress "starter" auto-provisionné par ex2 (base
       `vwfewhpb_10u9oNU`), supprimé par Ilias le 07.07.2026 avant la Phase A.
       Le brief reprenait un fait daté du 07.07 sans revérification. **§4.1 du
       brief BS-T5 caduc, ne pas ré-instruire ce point dans un futur chat.**
    3. **Hotel Booking Lite n'a pas de champ structuré** pour lits
       multiples/chambres/salles de bain (vérifié dans le code — un seul champ
       texte "bed type"). Formulation exacte imposée par le chat stratégie,
       mise dans la description de l'hébergement (pas de champ inventé) :
       « Le logement accueille jusqu'à 5 personnes : une chambre avec un lit
       double, une chambre avec un lit simple, et un lit double escamotable
       dans le salon. » — **sans** surface ni nb de salles de bain (déjà
       affichés sur `/courte-duree/`, doublon proscrit).
  - **3 ajouts demandés par le chat stratégie avant tout push :**
    a. `/reservation/` en **noindex** (`_seopress_robots_index=yes`) tant que
       `/conditions-de-reservation/` n'est pas publiée (7 valeurs encore en
       attente du client, dont l'annulation). **À retirer manuellement** dès
       publication de la page de conditions — le script ne le fait jamais
       tout seul.
    b. Coexistence des deux parcours sur `/courte-duree/` : bouton principal
       vers `/reservation/`, formulaire de demande manuelle relégué sous
       `<details>` (repli, pas de second CTA pleine largeur concurrent).
    c. E-mails de test : rapporter le retour brut de `wp_mail()` sans
       l'interpréter comme une réception confirmée — vérification réelle en
       webmail = Ilias.
  - **ACF Pro** : reconfirmé 6.8.5 (zip du repo ET diagnostic serveur
    concordants) — toujours **BLOQUÉ**, `update-acf-pro.yml` non relancé (la
    6.8.5 déjà en place n'est pas la vulnérabilité corrigée).
  - **Diff prêt, non pushé** : `templates/pages/page-reservation.php` (gabarit
    pp-*), lien vers `/reservation/` sur `/courte-duree/`,
    `.github/scripts/install-hotel-booking.sh` + `setup-hotel-booking.sh` +
    `.github/workflows/setup-hotel-booking.yml` (idempotents). **GO explicite
    d'Ilias requis avant tout déploiement** (garde-fou permanent du chat
    BS-T1) — demandé, en attente au moment de cette entrée.

- 2026-07-21 — **🟢 Deploy bascule formulaires → `contact@breval.net` (eb25b99)
  · ⛔ ACF Pro 6.8.6 BLOQUÉ (endpoint mort).**
  GO explicite Ilias sur les deux points.
  - **Bascule formulaires** : `BREVAL_CONTACT_EMAIL` passe de
    `agence@caractere.swiss` (adresse de test) à **`contact@breval.net`**
    (confirmée par Luc). Point unique dans `inc/forms.php` → les **deux**
    formulaires (Lot 1 « demande de réservation », Lot 2 « être prévenu·e ») en
    bénéficient sans autre modification. Commentaire périmé corrigé au passage
    dans `page-lot-2.php`. Commit `eb25b99`, run `deploy.yml`
    [#29813470703](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29813470703)
    vert.
    **Testé en direct après déploiement** (POST réels vers `admin-post.php`,
    nonces extraits des pages live) : Lot 1 → `302
    /courte-duree/?breval_form=success` ; Lot 2 → `302
    /longue-duree/?breval_form=success` — `wp_mail()` renvoie `true` côté
    serveur dans les deux cas.
    ⚠️ **Réception inbox NON vérifiée** : aucun accès à `contact@breval.net`
    depuis Claude Code. Les 2 mails de test portent les objets « [Bréval]
    Demande réservation Lot 1 — Test Deploy Ilias » et « [Bréval] Être
    prévenu·e — Lot 2 — Test Deploy Ilias ». **À confirmer par Ilias/Luc** — la
    chaîne n'est prouvée que jusqu'à la sortie du serveur.
  - **ACF Pro 6.8.5 → 6.8.6** (alerte Wordfence du 16.07, sévérité moyenne) :
    **BLOQUÉ**. ACF Pro n'est pas sur wp.org (propriétaire) ; l'installation
    passe historiquement par le zip licencié committé à la racine du repo.
    Ilias a demandé de retenter l'endpoint officiel avec le secret
    `ACF_PRO_KEY` (toujours présent). Workflow un-shot créé et committé
    (`update-acf-pro.yml` + `.github/scripts/update-acf-pro.sh`, commit
    `c8cda55`, même pattern que `harden-wp-config.yml` : téléchargement +
    validation du zip, commit du zip dans le repo pour garder
    `install-staging.yml` en phase, puis `wp plugin install --force --activate`
    via tar-over-ssh).
    **Run [#29813994099](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29813994099)
    rouge, exit 4.** Réponse de
    `connect.advancedcustomfields.com/index.php?p=pro&a=download&k=…` =
    **`404 Not Found` (nginx)**. Échec **distinct** de celui de juillet (403
    intermittent / `invalid_token`) : cette fois l'endpoint lui-même a disparu,
    ce n'est plus une intermittence — inutile de réessayer tel quel. Aucune
    autre URL tentée (pas de devinette sur une API non documentée).
    **Action Ilias** : télécharger `advanced-custom-fields-pro.zip` (6.8.6)
    depuis son compte ACF et le committer à la racine de `breval-wordpress` via
    l'UI web GitHub, comme pour la 6.8.5 — le workflow reste committé et
    resservira si l'API revient.

- 2026-07-12 — **🟢 Deploy — page Mentions légales + fix hover underline (b43efee, d051110).**
  GO explicite Ilias sur les deux, déployés à la suite.
  - **Hover underline** : règle globale `a:hover, a:focus-visible
    {text-decoration:underline}` retirée de `_reset.scss` (préparée le même
    jour, voir entrée plus bas) — commit `b43efee`.
  - **Page `/mentions-legales/`** : gabarit `page-mentions-legales.php` créé,
    réutilise les composants `pp-*` de la page confidentialité (scope partagé
    `.legal-notice-doc` dans `_politique-confidentialite.scss`, zéro
    duplication CSS). Contenu = source complète fournie par Ilias
    (`breval-mentions-legales.html`, hébergeur Ex2 Inc. rempli), publication
    directe. Lien ajouté au footer à côté de « Politique de confidentialité »
    (séparateur ` · `) — commit `d051110`.
  - **Mécanisme de création de page** : la page elle-même (titre / slug /
    gabarit / publication) n'existait pas en base — wp-cli ne valide pas les
    gabarits imbriqués sous `templates/pages/` (même limite que pour accueil /
    lot-1 / lot-2, cf. journal du 10.07). Un premier essai d'écriture d'un
    script SSH ad-hoc a été **refusé par le classifieur auto-mode** (mécanisme
    jamais nommé ni autorisé), comme pour `DISALLOW_FILE_EDIT` plus tôt le même
    jour. Question posée à Ilias, tranchée : **nouveau workflow committé**
    `create-mentions-legales.yml` + script
    `.github/scripts/setup-mentions-legales.sh` (même pattern que
    `harden-wp-config.yml` : `workflow_dispatch`, idempotent, écriture directe
    en meta `_wp_page_template`).
  - **Runs** : `deploy.yml` [#29195086951](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29195086951)
    puis `create-mentions-legales.yml` [#29195118679](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29195118679)
    — les deux verts.
  - **Vérifié en direct** : `/mentions-legales/` → 200, un seul `<h1>Mentions
    légales</h1>` ; lien footer présent sur la page et sur l'accueil ; CSS live
    (`dist/main.css`) confirmé sans la règle globale `a:hover,
    a:focus-visible{text-decoration:underline}`.

- 2026-07-12 — **Brief mentions légales reçu — pas démarré.** _[restituée]_
  Fichier source `2.solution-web/breval-mentions-legales.html` fourni par
  Ilias, **complet** (hébergeur Ex2 Inc. rempli, plus aucun placeholder).
  Consigne : page `/mentions-legales/` réutilisant les styles `pp-*` déjà en
  place (même thème que la page confidentialité), `<h1>` déjà présent dans la
  source à garder, **publication directe** (pas de brouillon — contrairement
  au P1.2 initial qui prévoyait un placeholder hébergeur), lien footer à côté
  de « Politique de confidentialité », deploy sous GO. **Interrompu avant
  démarrage** (demande de clôture/relais de chat) — prochaine étape du
  prochain chat.
  > ✅ **Soldé** — voir l'entrée « Deploy — page Mentions légales » ci-dessus.

- 2026-07-12 — **Fix préparé, PAS commité — retrait `:hover` underline global.** _[restituée]_
  Demande Ilias : soulignement au survol « bizarre » sur les boutons et le nom
  du site dans le menu. Cause : règle globale `a:hover, a:focus-visible
  {text-decoration:underline}` dans `assets/scss/base/_reset.scss` —
  s'applique à TOUS les liens, y compris `.brand` (nom du site,
  `templates/parts/site-header.php:21`) et `.site-nav__link`. Retirée
  (les 2 sélecteurs + la règle, rien remplacé — chaque composant gère déjà sa
  propre couleur au hover). Vérifié : ne casse pas les règles dédiées
  `.site-footer a:hover` et `.pp-contact-line a:hover` (underline volontaire,
  scoped, indépendantes du reset global) — non touchées. `npm run build` OK.
  **Modifié uniquement en local kDrive** (`_to_delete/wordpress/assets/scss/
  base/_reset.scss`), jamais commité ni poussé sur aucun repo/clone. En
  attente de GO pour commit + push + deploy.
  > ✅ **Soldé** — commité `b43efee` et déployé le même jour, voir ci-dessus.

- 2026-07-12 — **QA/QC P2 (lecture seule, mandat chat Web) — résultats.** _[restituée]_
  Mandat : www→non-www, `WP_DEBUG`, Wordfence (édition fichiers + limite
  connexion), `ACCES.md` gitignoré, Imagify/WebP. Aucun deploy à ce stade
  (contrôle uniquement) :
  - **PASS** — www→non-www : redirection 301 déjà vérifiée en place.
  - **PASS** — `WP_DEBUG` : `false` confirmé en prod (`wp config get
    --format=json`, la sortie brute était ambiguë sans `--format`).
  - **GAP réel** — Wordfence : table `wp_wfConfig` **inexistante** en base
    (`SHOW TABLES LIKE '%wf%'` = vide) → le wizard de sécurité n'a jamais été
    lancé, aucune limite de tentative de connexion ni configuration
    brute-force active. Distinct de `DISALLOW_FILE_EDIT` (celui-ci corrigé le
    même jour, voir entrée suivante) — ce gap-ci reste ouvert, nécessite le
    wizard Wordfence en wp-admin.
  - **PASS** — `ACCES.md` : gitignoré (`.gitignore:13`, `git check-ignore`
    confirmé), aucun fichier `ACCES*` tracké dans l'historique du repo
    `breval-wordpress`.
  - **GAP réel** — Imagify/WebP : aucun plugin de compression/WebP installé
    (liste complète des 9 plugins actifs vérifiée — ACF Pro, Complianz,
    Imunify Security, SEOPress, UpdraftPlus, Wordfence, WP Mail SMTP ; ni
    Imagify ni WP Rocket).

- 2026-07-12 — **🟢 Deploy P0 — h1 sémantique + hardening `DISALLOW_FILE_EDIT` (1e7c36f).** _[restituée]_
  GO explicite Ilias sur les deux points, même deploy.
  - **h1** : `<div class="pp-hero-title">` → `<h1 class="pp-hero-title">`
    (`page-politique-confidentialite.php`) — une seule balise `h1`/page.
    Overrides SCSS explicites ajoutés (`margin: 0 0 16px`, `text-wrap:
    initial`) pour neutraliser les règles globales `h1{text-wrap:balance}` du
    thème (`_typography.scss`) — la spécificité de classe gagnait déjà sur
    les autres propriétés, mais explicite plutôt que de compter dessus.
  - **`DISALLOW_FILE_EDIT`** : absent de `wp-config.php` en prod (confirmé
    avant fix — `wp config get` → « constant is not defined »). Ajout direct
    en SSH ad-hoc **refusé par le classifieur auto-mode** (bypass du
    pipeline commit/push/deploy.yml explicitement demandé) — corrigé en
    créant un **nouveau workflow committé** `harden-wp-config.yml` + script
    `.github/scripts/harden-wp-config.sh` (même pattern que
    `configure-smtp.yml` : `wp config set` idempotent, cible la racine
    production `/home/vwfewhpb/public_html`).
  - **Runs** : `deploy.yml` [#29194229824](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29194229824)
    + `harden-wp-config.yml` [#29194230506](https://github.com/caractere-swiss/breval-wordpress/actions/runs/29194230506)
    — les deux verts.
  - **Vérifié en direct** : `curl` sur `/politique-de-confidentialite/` → 1
    seul `<h1>`, texte exact. CSS live téléchargé (`dist/main.css`) :
    `.pp-hero-title{font-size:34px;...text-wrap:initial}` desktop,
    `font-size:24px` en media mobile — rendu inchangé. `wp config get
    DISALLOW_FILE_EDIT --format=json` → `true` côté serveur.

- 2026-07-12 — **Fix collision CSS réelle — politique de confidentialité (45919aa).**
  QA (chat Web, `getComputedStyle` confirmé) : titre du hero affiché à la
  verticale (1 lettre/ligne). **Le « zéro collision » annoncé n'était pas
  tenu** : le scoping par ancestor selector (`.privacy-policy-doc .hero`)
  augmente la spécificité mais ne bloque QUE les propriétés redéclarées
  explicitement — `.hero{display:flex}` du thème global continuait de
  s'appliquer (jamais redéclaré dans mon scope), écrasant `.hero-title` à
  une largeur minuscule dans le flex row à 4 enfants.
  **Fix robuste (recommandé par le chat Web)** : toutes les classes
  génériques du document préfixées `pp-` (`pp-hero`, `pp-hero-title`,
  `pp-section-title`, `pp-card-label`, etc.) — élimine le risque à la racine
  pour toutes les classes, pas seulement `.hero`. Vérifié : aucune classe
  non préfixée résiduelle dans le template (grep), `.hero` global du thème
  confirmé intact et séparé dans le CSS compilé.
  **Vérifié en production après déploiement** : markup sert les classes
  `pp-*`, `.privacy-policy-doc .pp-hero{display:block;...}` bien le CSS
  appliqué, `.hero{display:flex;...}` global toujours présent séparément.
  **Leçon retenue** : scoping par ancêtre seul ≠ isolement complet — un
  scoping fiable exige soit des noms de classes garantis uniques (préfixe),
  soit de redéclarer explicitement TOUTES les propriétés susceptibles
  d'entrer en collision (fragile, facile d'en oublier une — exactement ce
  qui s'est passé ici).

- 2026-07-12 — **Page Politique de confidentialité + QA post-launch (2b76008 + fixes CSS).**
  Document HTML validé fourni par Ilias (autonome, sans Google Fonts,
  couleurs Bréval) → gabarit de page dédié
  (`templates/pages/page-politique-confidentialite.php`) + SCSS scopé sous
  `.privacy-policy-doc` (`assets/scss/pages/_politique-confidentialite.scss`)
  pour zéro collision avec les classes globales du thème (le document utilise
  `.hero`, `section`, etc. — déjà utilisées ailleurs). Vérifié : `.hero`
  global du site (accueil/lots) intact, séparé du `.hero` scopé du document.
  Page #3 (déjà existante en brouillon depuis le scaffold) : gabarit assigné,
  publiée. `wp_page_for_privacy_policy` → 3. Lien ajouté au footer.
  Email contact = `l.faudeil@asdr.ch` (déjà dans le document source).
  **Vérifié en direct** : 200, template rendu, email correct (×4), lien
  footer présent, CSS scopé confirmé (`.privacy-policy-doc .hero` distinct
  du `.hero` global).
  ⚠️ **Complianz non pointé** : `cmplz_options` quasi vide (assistant/wizard
  jamais lancé, pas de post type `cmplz_document`) — aucune option WP-CLI
  simple pour lier la page. Nécessite l'assistant Complianz en wp-admin
  (interface, pas scriptable en l'état). Réglages > Confidentialité (core WP)
  fait, seul Complianz reste en attente d'une action manuelle wp-admin.

  **QA post-launch (même session, plusieurs allers-retours utilisateur)** :
  - Doublon puce+coche + espacement inégal `.features` → `columns` CSS au
    lieu de `grid` (piège row-height sync) + `list-style-type:none` redondant
    (quirk Safari).
  - Débordement horizontal mobile réel → cause racine `.booking__fields
    { grid-template-columns: 1fr 1fr }` (piste `1fr` seule a un minimum
    implicite = contenu, pas 0 — un `<input type="date">` natif refusait de
    rétrécir). Fix `minmax(0, 1fr)` partout où le même piège existait
    (`.booking__fields`, `.cal__grid`, `.layout-2col`) + `min-width:0` sur
    les grid items eux-mêmes (`.field`) — les deux niveaux (piste ET item)
    doivent être corrigés. `overflow-x:hidden` posé en premier (filet de
    sécurité, insuffisant seul) conservé en complément.
  - Champs Arrivée/Départ visuellement pas homogènes → icône native du
    date-picker standardisée (padding fixe).
  - Espace blanc entre dernière section et footer → `margin-top:2rem`
    orphelin retiré de `.site-footer`.
  - Skip-link "Aller au contenu" visible en permanence (régression a11y) →
    masquage par défaut restauré (autonome, sans dépendre de `.sr-only`),
    feature conservée (visible seulement au focus clavier).
  - Meta descriptions SEOPress ajoutées sur les 3 pages (textes validés) ;
    doublon `<meta name="description">` + Open Graph (thème vs SEOPress)
    trouvé et corrigé en vérifiant — thème ne sort plus que `og:image`.
  - Footer "Site propriétaire" remplacé par le crédit agence standard (logo
    Caractère). Promesse de délai "24 à 48h" retirée (pas d'engagement non
    garanti).
  Tous vérifiés en direct sur production après chaque déploiement, aucun
  élément gated retouché (noindex/Basic Auth toujours retirés, racine
  intacte).

  **⚠️ Note infrastructure** : Ilias a déplacé les dossiers de travail locaux
  (`claude-code/`, `wordpress/`) dans `2.solution-web/_to_delete/` en cours
  de session — repéré, rien perdu (tout le travail non commité était déjà
  sur disque au nouveau chemin, poursuivi normalement). Signalé à Ilias.

- 2026-07-12 — **QA post-launch : meta descriptions ajoutées + doublon corrigé (46b500f).**
  Les 3 pages live n'avaient pas de meta description SEOPress. Ajoutées via
  `_seopress_titles_desc` (wp-cli), textes validés par Ilias. Un premier essai
  a perdu une apostrophe (« jusqu'à » → « jusquà », échappement shell) —
  détecté en relisant, corrigé immédiatement.
  **Bug trouvé en vérifiant** : DOUBLON de balises — `<meta name="description">`
  + tout le jeu Open Graph (type/site_name/title/description/url) apparaissaient
  deux fois : une copie correcte de SEOPress, une copie vide/redondante du
  thème (`inc/seo.php`, actif depuis avant que SEOPress ne gère tout ça).
  **Fix** : le thème ne sort plus que `og:image` (repli photo Lot 1 — seule
  contribution non couverte par SEOPress, qui n'a pas d'image par défaut sans
  featured image). Tout le reste retiré du thème, laissé à SEOPress seul.
  **Vérifié en direct après déploiement** sur les 3 pages : une seule
  `<meta name="description">`, un seul jeu Open Graph complet
  (url/site_name/locale/type/title/description/image), textes exacts,
  apostrophe correcte.

- 2026-07-11 — **🟢🚀 GO-LIVE — Lot 1 en production sur breval.net (5af798c).**
  Feu vert Ilias explicite et confirmé directement (deux demandes de
  confirmation par le classifieur auto-mode — relais « Chat Web » jugé
  insuffisant pour une action de cette ampleur, puis « go » seul jugé
  insuffisant — confirmation finale nommant précisément les actions
  obtenue avant tout geste destructif). Exécuté étape par étape avec
  vérification après chacune, comme demandé :
  1. **Sauvegarde complète UpdraftPlus** (DB + plugins + thèmes + uploads)
     avant tout geste — confirmée « succeeded and is now complete ». Note :
     local uniquement (aucune destination distante configurée).
  2. **Migration staging → racine** : fusion `wp-content/` + déplacement du
     cœur WP (fichiers/dossiers, pas de dump/import — même base MySQL,
     changement de chemin uniquement) ; `siteurl`/`home` mis à jour ;
     `wp search-replace` (12 remplacements, dry-run vérifié avant exécution
     réelle) ; bloc de réécriture WordPress ajouté au `.htaccess` racine
     (`RewriteBase /`) ; titre du site corrigé (« — staging » retiré).
     **Vérifié** : 3 pages 200, assets/images chargent, zéro résidu
     `/staging` en sortie HTML, 2 formulaires testés (succès).
  3. **Redirection `/staging` → racine** (301, chemin préservé) — vérifiée.
  4. **Basic Auth retiré** : n'existait en réalité que sur `staging/.htaccess`
     (jamais copié à la racine) — confirmé absent partout, fichier
     `.htpasswd_staging` orphelin nettoyé.
  5. **Noindex retiré** : `inc/seo.php` (forçage codé en dur supprimé,
     commit `d270eeb`, déployé), `blog_public=1`, `robots.txt` production
     (`Allow: /` + `Sitemap: https://breval.net/sitemaps.xml`). SEOPress
     vérifié : ses noindex restants ne concernent que les archives
     auteur/date/recherche (défauts sains, ne touchent pas nos pages).
  6. **Vérification finale (9 points)** : home ✓, HTTP→HTTPS forcé ✓, HSTS
     ✓, sitemap.xml ✓, robots.txt Allow+Sitemap ✓, favicon ✓, noindex
     absent du HTML ✓, Basic Auth absent (200 public) ✓, `/staging` redirige
     ✓. Pages Lot 1/Lot 2 + formulaire Lot 1 retestés après le redéploiement
     du thème vers la racine — tout fonctionnel.
  `deploy.yml` retargeté sur la racine production (`5af798c`) pour tout
  déploiement futur.

  **URLs finales** : https://breval.net/ · https://breval.net/courte-duree/
  · https://breval.net/longue-duree/ — prêtes pour QA public par Ilias.

- 2026-07-11 — **🟢 Favicon provisoire intégré + déployé (f4b5eda).**
  SVG monogramme « B » fourni par Ilias (vert #0F4C3A / crème #FBF8F3).
  Fallbacks générés par dessin direct haute-résolution + sous-échantillonnage
  LANCZOS (plus net qu'un rendu `qlmanage` brut, qui ne remplissait pas le
  canevas demandé — détecté et écarté avant de committer) : `favicon.ico`
  multi-tailles (16/32/48), PNG 32/192/512 arrondis transparents,
  `apple-touch-icon.png` 180×180 **plein bord à bord sans transparence**
  (recommandation Apple — iOS applique son propre masque d'arrondi), SVG
  source conservé et servi directement.
  `inc/favicon.php` : balises `<link>` injectées via `wp_head`, **gardées**
  derrière `! get_option('site_icon')` — cède automatiquement la place au
  Site Icon natif WP le jour où le vrai logo est fourni, zéro conflit.
  **Vérifié après déploiement** : 6 balises `<link>` présentes, `favicon.ico`
  → 200/image-x-icon. Basic Auth + noindex intacts (401 sans creds, meta
  noindex toujours présente).

  **Rappel Chat Web** : (2) WP Rocket **non installé** — différé post-launch
  (décision Ilias, gain marginal sur petit site + risque de cache à
  re-tester juste avant go-live). (3) Test mobile réel — outils indisponibles
  pour reflow/viewport variable ; structure vérifiée (meta viewport + burger
  `.nav-toggle` présents) ; Ilias fera un test visuel au moment du go-live.

- 2026-07-11 — **🟢 robots.txt corrigé + déployé (34b77da).**
  Root cause vérifiée dans le code source WP core installé
  (`wp-includes/class-wp-rewrite.php`) : « robots.txt -- only if installed
  at the root » — le mécanisme virtuel n'est ajouté QUE si le site est
  installé à la racine du domaine. Volontaire côté WordPress pour toute
  install en sous-dossier, **pas un effet de bord** de mon bypass
  `proc_open` précédent (vérifié : `rewrite_rules` régénéré, 91 règles,
  aucune concernant robots — ce tableau n'était de toute façon pas le bon
  mécanisme, fausse piste écartée avant de conclure).
  **Fix** : fichier physique `robots.txt` à la racine du site (servi
  directement par le serveur, avant WordPress). Contenu `Disallow: /`
  tant qu'en staging — **renforce** le noindex déjà forcé, aucun changement
  du gate go-live. À mettre à jour (Allow + Sitemap) lors du passage en
  prod racine, en même temps que le retrait du noindex — geste gated, hors
  périmètre de ce script.
  **Vérifié après déploiement** : `robots.txt` → 200/text-plain/Disallow ;
  Basic Auth intact (401 sans creds, 200 avec) ; noindex toujours forcé.
  Rien de gated touché.

- 2026-07-11 — **Préparation Phase D pré-lancement (statut, rien de gated exécuté).**
  Consigne : préparer Phase D, ne rien exécuter des étapes gated (noindex,
  Basic Auth, bascule racine). État vérifié point par point :
  - ✅ **SEO de base** : ACF Pro, SEOPress actifs. Sitemap déjà activé par
    défaut (`seopress_xml_sitemap_general_enable=1`), résout correctement
    (`/sitemap.xml` → 301 → `/sitemaps.xml`, XML valide, index + pages).
  - ⚠️ **robots.txt — BUG trouvé** : renvoie la page 404 du thème au lieu du
    fichier virtuel natif WordPress (`do_robots()`). Cause probable : le
    bypass `wp rewrite structure` (fix proc_open, voir plus haut) n'a pas
    correctement réenregistré la reconnaissance de `is_robots()` par le
    parseur de requête WP. **À corriger avant le go-live** — sinon les
    moteurs de recherche ne peuvent pas lire les directives d'indexation à
    l'ouverture publique.
  - ✅ **404** : template thème fonctionnel, renvoie bien un vrai statut
    HTTP 404 (vérifié), design cohérent (nav + footer + CTA retour accueil).
  - ⚠️ **Favicon** : absent (`site_icon=0`). Aucun asset logo fourni par le
    client à ce jour (`has_custom_logo()` → faux partout). Même situation
    que le hero — **nécessite un asset réel côté Luc/Ilias**, pas de repli
    raisonnable comme pour la photo Lot 1.
  - ✅ **RGPD/Complianz** : plugin actif, config initiale présente (13
    options `cmplz_*` en base).
  - ✅ **UpdraftPlus (sauvegarde)** : ajouté à `activate-theme-plugins.sh`
    (gratuit, pas de licence requise) et installé/activé via un rerun
    d'`install-staging.yml` — **vérifié idempotent** : front page, permaliens
    et permissions Basic Auth (644) intacts après le rerun complet.
  - ⏸️ **WP Rocket (cache)** : BLOQUÉ — payant, nécessite un zip licencié
    comme ACF Pro (même procédure : commit le zip, script de transfert
    tar-over-ssh + `wp plugin install`). **Action Ilias** : fournir le zip.
  - ✅ **Wordfence** : actif (option `wordfence_wafStatus` non lisible via
    `wp option get` — normal, stockée différemment ; activation confirmée
    via `wp plugin is-active`).
  - ✅ **2 formulaires** : déjà testés en conditions réelles (voir entrées
    précédentes) — succès + réception confirmée.
  - ⏸️ **Responsive mobile réel** : non testable en headless (pas d'accès
    navigateur dans ce contexte). Les règles CSS (burger nav à 760px, clamp
    des tailles marquee/hero) sont en place et vérifiées au niveau du code,
    mais un test visuel réel sur device/émulateur reste à faire par un
    humain avant le go-live.

  **Rien de gated touché** : noindex intact (thème), Basic Auth intacte
  (vérifiée après chaque déploiement), aucune bascule vers `breval.net`
  racine.

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

🟢 **Site WordPress en production sur https://breval.net/ depuis le 11.07.**
Aucun blocage technique côté code. 5 pages live et vérifiées : accueil,
`/courte-duree/`, `/longue-duree/`, `/politique-de-confidentialite/`,
`/mentions-legales/`. Les deux formulaires envoient à `contact@breval.net`.

**Bloqué — nécessite une action d'Ilias :**
- **ACF Pro 6.8.6** (alerte Wordfence 16.07, sévérité moyenne) : l'endpoint de
  téléchargement ACF renvoie 404, la mise à jour automatisée est impossible.
  Ilias committe le zip depuis son compte ACF → `update-acf-pro.yml` fait le
  reste.
- **Wizard Wordfence** : jamais lancé (table `wp_wfConfig` inexistante) → zéro
  protection brute-force, zéro limite de tentatives de connexion. wp-admin,
  non scriptable.
- **Wizard Complianz (RGPD)** : jamais lancé (`cmplz_options` quasi vide, pas
  de post type `cmplz_document`) → bannière cookies non configurée. wp-admin,
  non scriptable.

**À vérifier — hors de portée de Claude Code :**
- **Réception réelle sur `contact@breval.net`** : 2 mails de test envoyés le
  21.07, `wp_mail()` OK côté serveur, mais la livraison en boîte n'a jamais
  été confirmée (aucun accès à cette boîte).

**Parqués — attente décision ou identifiants d'Ilias, aucune action requise :**
- WebP / Imagify : aucun plugin de compression installé (srcset seul).
- reCAPTCHA sur les formulaires (actuel : honeypot + nonce) — clés Google.
- Site Kit / Analytics — compte Google. ⚠️ si Analytics arrive, revoir Complianz.
- Backup UpdraftPlus hors-site (actuel : local serveur uniquement).
- ManageWP · Freshping · URL prod dans Keeper.
- Réservation Lot 1 (MotoPress + Stripe) : créneau **BS--T5 du 12.08**,
  checklist préparée par le chat Web (`breval-checklist-stripe.md`).

**Contenu, côté Luc :** photos Lot 2 · lot des photos du 25.06 à identifier ·
linge / parking Lot 1 · durée minimale Lot 2. (Wi-Fi/TV et couchages Lot 1 :
**résolus**, réponses Luc du 07.07.)

**Brouillon Eleventy de ce repo :** figé, plus maintenu depuis le go-live. Ses
`.draft` (Wi-Fi/TV, couchages) sont périmés par rapport à la production — non
prioritaire, aucune action prévue.

---

## Format de consigne confortable (rappel pour le chat Web)
Idéal : **chemin explicite + clé/placeholder + valeur exacte**.
Ex. : `src/_data/site.json` → `phone` = "+41 27 …".
Pour du texte long : bloc délimité, en indiquant fichier + emplacement.
