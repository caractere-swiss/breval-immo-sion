# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié).

## 1. Brief en cours
> Les consignes arrivent ici. Statut : à faire / en cours / fait.

(vide — en attente du contenu réel de Luc)

## 2. Journal Claude Code
> Chronologique inverse (le plus récent en haut).

- 2026-06-25 — Setup coordination terminé : `CLAUDE.md` (contexte projet
  consolidé) + `PILOTAGE-WEB.md` créés et committés à la racine.
  **Vérifications demandées (étape 3) :**
  - ✓ **Emplacement** : racine hors `src/`. `.eleventy.js` a `input: "src"`,
    donc `CLAUDE.md` et `PILOTAGE-WEB.md` sont ignorés par le build → jamais
    dans `_site/` ni sur le brouillon en ligne.
  - ✓ **Convention commits** : `docs(pilotage):` pour les mises à jour de
    `PILOTAGE-WEB.md`, repérables en log.
  - ⚠️ **Déploiement** : le déclenchement « push sur `main` → redéploiement »
    est exact (workflow `.github/workflows/deploy.yml`, déploie sur push
    `main`), MAIS c'est **GitHub Pages, pas Vercel** (cf. §3). Je travaille
    actuellement sur la branche `claude/lucid-cray-exfjaj`, pas `main` :
    ces fichiers ne sont donc PAS encore sur `main` (cf. §3, point bloquant).
- 2026-06-25 — Initialisation du fichier de pilotage.

## 3. Blocages & questions
> Ce que Claude Code remonte au chat Web.

1. **Branche de travail vs `main` (à arbitrer).** Cette session Claude Code
   est contrainte de développer/pousser sur la branche `claude/lucid-cray-exfjaj`,
   pas sur `main`. Conséquences :
   - GitHub Pages ne se redéploie PAS (le workflow ne déclenche que sur `main`).
   - Le chat Web qui clone la branche **par défaut (`main`)** ne verra ni
     `CLAUDE.md` ni `PILOTAGE-WEB.md`.
   - **Décision attendue (via Ilias) :** soit (a) on fusionne
     `claude/lucid-cray-exfjaj` → `main` (j'ai besoin d'un feu vert explicite
     pour pousser/merger sur `main`), soit (b) le chat Web clone et lit la
     branche `claude/lucid-cray-exfjaj` au lieu de `main`. Je recommande (a)
     pour garder le contexte sur `main` accessible à toutes les sessions.

2. **README.md / vercel.json périmés.** Ils décrivent un déploiement **Vercel**,
   alors que la cible actée est **GitHub Pages** (`deploy.yml`). Source de
   confusion potentielle. Je propose de corriger le README (section
   Déploiement) et de supprimer `vercel.json` — **j'attends un OK** avant d'y
   toucher.

3. **Pas d'autre blocage technique.** Site preview complet, en attente du
   contenu de Luc (textes, chiffres, photos fin juillet, coordonnées agence)
   pour remplir les placeholders `.fill` / `.draft` et `src/_data/site.json`.

---

## Format de consigne confortable (rappel pour le chat Web)
Idéal : **chemin explicite + clé/placeholder + valeur exacte**.
Ex. : `src/_data/site.json` → `phone` = "+41 27 …".
Pour du texte long : bloc délimité, en indiquant fichier + emplacement.
