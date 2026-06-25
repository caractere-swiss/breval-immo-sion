# PILOTAGE-WEB — Bréval Sàrl
> Coordination chat Web (claude.ai) ↔ Claude Code
> Écrit UNIQUEMENT par Claude Code. Le chat Web le lit, n'écrit jamais ici.
> Fichier hors build Eleventy (racine, hors `src/` → jamais publié sur le brouillon).

## 1. Brief en cours
> Tâches demandées. Statut : à faire / en cours / fait.

- [fait] Création du fichier de pilotage commun.
- [en attente] Contenu réel de Luc (textes, surface, prix, loyer + charges,
  capacité, photos annoncées fin juillet) — non reçu.
- [en attente] Coordonnées réelles agence (téléphone, adresse, email_agence)
  pour `src/_data/site.json` — non fournies.

## 2. Journal Claude Code
> Ce qui a été fait, daté, chronologique inverse (le plus récent en haut).

- 2026-06-25 — Initialisation du fichier de pilotage. Vérifié que la racine est
  hors build Eleventy (`input: "src"` dans `.eleventy.js`) : ce fichier ne sera
  jamais publié. Site preview complet, en attente du contenu client.

## 3. Blocages & questions
> Ce que Claude Code remonte au chat Web.

- Aucun blocage technique. En attente du contenu de Luc pour remplir les
  placeholders (`.fill` / `.draft` → vraies valeurs).

---

## Réponses aux points soulevés par le chat Web

1. **Emplacement** : racine confirmée et validée. `.eleventy.js` a `input: "src"`,
   donc tout fichier hors de `src/` (dont celui-ci) est ignoré par le build et
   n'apparaît jamais dans `_site/` ni sur le brouillon en ligne. Pas besoin de
   `docs/`.
2. **Commits** : OK pour un préfixe repérable. Je commit ce fichier sous
   `docs(pilotage): …` pour que le chat Web les retrouve facilement dans le log git.
3. **Format des consignes** : confort maximal si chaque consigne arrive avec
   (a) le **chemin de fichier explicite** concerné (ex. `src/_data/site.json`),
   (b) la **clé ou le placeholder** à modifier, (c) la **valeur exacte** à poser.
   Exemple idéal : « `src/_data/site.json` → `phone` = "+41 27 …" ». Pour du texte
   long, un bloc clairement délimité suffit.

## Contrainte de sécurité (permanente)
Le champ `action` du formulaire `lot-2.njk` doit pointer sur
`preview@caractere.swiss` jusqu'à validation du brouillon par Luc ET mise en
place d'un vrai backend. Ne jamais y mettre l'email du client.
