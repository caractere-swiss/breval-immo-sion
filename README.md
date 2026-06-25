# Bréval Sàrl — brouillon de présentation

Brouillon visuel **statique** du site de location de **Bréval Sàrl** (société immobilière valaisanne,
2 appartements à Sion). Réalisé par l'agence **Caractère Communication**.

> ⚠️ Ce n'est **pas** le site final. Aucun back-office, aucun paiement, aucune réservation réelle.
> Le bloc réservation (Lot 1) et le formulaire de contact (Lot 2) sont **maquettés / non connectés**.
> Le site final sera reconstruit sous WordPress (ACF Pro, et MotoPress + Stripe pour la réservation).

## Stack

- [Eleventy (11ty)](https://www.11ty.dev/) — générateur de site statique.
- Header / footer **mutualisés** dans `src/_includes/` (préfigure les futurs `header.php` / `footer.php`).
- Contenu de navigation et coordonnées centralisés dans `src/_data/site.json`.
- Hébergement preview : **GitHub Pages** (déploiement automatique à chaque push sur `main`).

## Pages

| Page        | Fichier            | Contenu |
|-------------|--------------------|---------|
| Accueil     | `src/index.njk`    | Présentation Bréval + accès aux deux lots |
| Lot 1       | `src/lot-1.njk`    | Studio courte durée (type Airbnb) + **bloc réservation maquetté** |
| Lot 2       | `src/lot-2.njk`    | 4–5,5 pièces, bail annuel — **« bientôt disponible »** + formulaire contact |

## Développement local

```bash
npm install
npm run dev        # http://localhost:8080
```

Build de production :

```bash
npm run build      # génère _site/
```

## Déploiement

Le repo déploie sur **GitHub Pages** via `.github/workflows/deploy.yml`. Chaque push sur `main`
déclenche un build Eleventy et publie `_site/` automatiquement.

URL live : https://caractere-swiss.github.io/breval-immo-sion/
