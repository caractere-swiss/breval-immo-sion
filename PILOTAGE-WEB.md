# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié).

## 1. Brief en cours
> Les consignes arrivent ici. Statut : à faire / en cours / fait.

(vide — en attente du contenu réel de Luc)

## 2. Journal Claude Code
> Chronologique inverse (le plus récent en haut).

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

Aucun blocage technique. `main` = `c07d669`, propre, déployé (GitHub Pages).
En attente de Luc (3 points seulement) :
- **Wi-Fi / Télévision Lot 1** : 1 ligne `.draft` restante dans `lot-1.njk`
  (équipements). À confirmer/infirmer.
- **Config couchages Lot 1** : mention « chambre simple » retirée par prudence
  (5 pers. = 2 lits doubles + lit escamotable). À valider si config exacte diffère.
- **Photos Lot 2** : attendues fin juillet (placeholders + badge en place).

Tout le reste du contenu Lot 1 et de la homepage est rédigé et en ligne.

---

## Format de consigne confortable (rappel pour le chat Web)
Idéal : **chemin explicite + clé/placeholder + valeur exacte**.
Ex. : `src/_data/site.json` → `phone` = "+41 27 …".
Pour du texte long : bloc délimité, en indiquant fichier + emplacement.
