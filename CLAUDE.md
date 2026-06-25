# CLAUDE.md — Bréval Sàrl / breval-immo-sion

Contexte projet pour toute session Claude Code (y compris cloud).
Ce fichier voyage avec le repo. **Aucun identifiant sensible ici** (accès,
tokens, emails clients — jamais dans Git).

---

## 1. Client & projet

- **Client** : Bréval Sàrl — société immobilière valaisanne. Loue **2 logements
  à Sion** (Valais, CH).
- **Agence réalisatrice** : Caractère Communication (org GitHub `caractere-swiss`).
- **Interlocuteur client** : Luc (Bréval).
- **Objet de ce repo** : **brouillon visuel statique** à transmettre à Luc pour
  collecte du vrai contenu (textes, chiffres, photos). **Ce n'est pas le site
  final.** Aucun back-office, aucun paiement, aucune réservation réelle.

### Les deux lots
| Page  | Fichier         | Contenu |
|-------|-----------------|---------|
| Accueil | `src/index.njk` | Présentation Bréval + accès aux deux lots |
| Lot 1 | `src/lot-1.njk` | Studio courte durée (type Airbnb) + **bloc réservation maquetté** (non connecté) |
| Lot 2 | `src/lot-2.njk` | Appartement, bail annuel, « bientôt disponible » + **formulaire contact non connecté** |

---

## 2. Stack

### Brouillon (ce repo, maintenant)
- **Eleventy v3** (11ty) + **Nunjucks** (`.njk`).
- `input: "src"`, `output: "_site"` (voir `.eleventy.js`).
- `pathPrefix: "/breval-immo-sion/"` → tous les liens passés par `| url` sont
  préfixés. Indispensable car servi dans un sous-chemin GitHub Pages.
- Header/footer mutualisés dans `src/_includes/` (préfigure les futurs
  `header.php` / `footer.php` WordPress).
- Données centralisées dans `src/_data/site.json` (nav, coordonnées, textes).

### Déploiement réel : **GitHub Pages** (pas Vercel)
- Workflow `.github/workflows/deploy.yml` : build Eleventy + déploiement Pages
  **à chaque push sur `main`**.
- URL live : https://caractere-swiss.github.io/breval-immo-sion/
- ⚠️ **`README.md` et `vercel.json` sont des reliquats périmés** : ils décrivent
  un déploiement Vercel qui n'est **plus** la cible. La décision actée est
  GitHub Pages. À nettoyer quand on en aura le feu vert (voir PILOTAGE-WEB §3).

### Site final (plus tard, hors de ce repo)
- **WordPress + ACF Pro**, reconstruit à partir de cette maquette.
- Réservation Lot 1 : **MotoPress + Stripe**.

---

## 3. État du contenu — placeholders

Le brouillon est **complet visuellement** mais volontairement vide de données
réelles. Conventions de marquage (voir `src/assets/css/styles.css`) :

- **`.fill`** → chiffre/valeur à fournir par le client. Affiché entre crochets :
  `[surface] m²`, `[prix] CHF`, `[loyer] CHF`, `[charges] CHF`, `[nb] pièces`,
  `[capacité] pers.`, `[distance]`, `[nb] chambres`.
- **`.draft`** → texte à rédiger (« Description à définir », « Équipement à
  lister », etc.). Affiché en italique gris.
- **`data-placeholder="…"`** → emplacement photo (hero, galerie, cartes lots).
  Lot 2 affiche un badge « Photos disponibles dès fin juillet ».

### En attente de Luc (non reçu)
- Textes (intro, descriptions, quartier, équipements).
- Chiffres : surface, prix/nuit (Lot 1), loyer + charges (Lot 2), nb pièces,
  nb chambres, capacité, distance gare.
- Photos (annoncées **fin juillet**).
- Coordonnées réelles agence pour `src/_data/site.json` : `phone`
  (actuellement `+41 27 000 00 00`), `address` (placeholder), `email_agence`.

**Procédure d'intégration** : remplacer le contenu des `.fill` / `.draft` par
les vraies valeurs, et `site.json` pour les coordonnées.

---

## 4. Contrainte de sécurité (permanente)

Le formulaire de `src/lot-2.njk` a `action="mailto:{{ site.email_agence }}"`,
résolu sur **`preview@caractere.swiss`** (adresse neutre agence) via
`src/_data/site.json`.

➡️ **Ne JAMAIS y mettre l'email de Luc / Bréval** avant : (a) validation du
brouillon par Luc, ET (b) mise en place d'un vrai backend. Aucun mail de test
ne doit atterrir chez le client avant validation.

---

## 5. Schéma de coordination (chat Web ↔ Claude Code)

- **Chat Web (claude.ai)** = stratégie, mémoire, arbitrages.
- **Claude Code** = tout le travail technique (code, repo, déploiement).

Flux :
- **Chat Web → Claude Code** : Ilias relaie des consignes courtes.
- **Claude Code → Chat Web** : je logue dans `PILOTAGE-WEB.md` §2. Le chat Web
  clone le repo et lit, sans relais manuel.

Règles :
- Je suis le **SEUL** à écrire dans `PILOTAGE-WEB.md`.
- Je **ne touche pas** à `JOURNAL-2-WEB.md` (géré par le chat Web).
- `CLAUDE.md` et `PILOTAGE-WEB.md` sont à la **racine** (hors `src/`) → **hors
  build Eleventy**, jamais publiés sur le brouillon en ligne.

### Conventions de commit
- Mises à jour de `PILOTAGE-WEB.md` → préfixe **`docs(pilotage):`** (repérables
  en log par le chat Web).
- Reste : `feat:`, `fix:`, `docs:`, `chore:`, `style:` selon la nature.

---

## 6. Commandes utiles

```bash
npm install
npm run dev      # http://localhost:8080 (eleventy --serve)
npm run build    # génère _site/
npm run clean    # rm -rf _site
```
