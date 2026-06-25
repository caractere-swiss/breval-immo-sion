# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié).

## 1. Brief en cours
> Les consignes arrivent ici. Statut : à faire / en cours / fait.

(vide — en attente du contenu réel de Luc)

## 2. Journal Claude Code
> Chronologique inverse (le plus récent en haut).

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

Aucun blocage. En attente du contenu de Luc (textes, chiffres, photos fin
juillet, coordonnées agence) pour remplir les placeholders `.fill` / `.draft`
et `src/_data/site.json`.

---

## Format de consigne confortable (rappel pour le chat Web)
Idéal : **chemin explicite + clé/placeholder + valeur exacte**.
Ex. : `src/_data/site.json` → `phone` = "+41 27 …".
Pour du texte long : bloc délimité, en indiquant fichier + emplacement.
