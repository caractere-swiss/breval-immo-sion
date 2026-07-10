# DESIGN.md — Bréval Sàrl

> Design system du site WordPress (location 2 appartements — Sion).
> Dérivé du brouillon Eleventy validé (`caractere-swiss.github.io/breval-immo-sion`).
> Sert de cahier des charges à Claude Code (thème) et, si besoin, à Claude Design (maquette).
> Version : 2026-07-07 · Statut : formalisation de l'existant, prêt pour Phase 0 → construction.

---

## 1. Analyse client

**Secteur** : société immobilière — location de 2 logements à Sion (Valais).
**Cible** : deux publics distincts selon le lot.
- Lot 1 (courte durée) : touristes, voyageurs d'affaires, familles de passage en Valais. Réservation autonome attendue.
- Lot 2 (colocation) : étudiants (proximité HES-SO Valais-Wallis) et jeunes actifs cherchant une chambre meublée charges comprises.

**Proposition de valeur** : site propriétaire (donnée maîtrisée) plutôt que dépendance aux plateformes type Airbnb. Réservation + paiement autonomes 24/7 pour le Lot 1 ; contact direct pour le Lot 2.

**Concurrents visuels de référence** : plateformes de location (Airbnb, Interhome), sites de conciergerie haut de gamme. À éviter : le rendu « portail immobilier » froid et dense (Homegate, ImmoScout) qui va à l'encontre du ton hospitalité voulu.

**Ton visuel validé** : clair, accueillant, concret, orienté confiance et praticité (hospitalité). À éviter : jargon, sur-promesse, rendu « corporate » ou « portail immo ».

---

## 2. Couleurs

Palette dérivée directement des variables CSS du brouillon (`:root`). Le **vert forêt est la couleur de marque dominante** ; le terracotta est un accent employé avec parcimonie (boutons d'action, dates sélectionnées, puces d'éveil).

| Rôle | Nom | Hex |
|---|---|---|
| Marque, titres, fonds foncés | `green-900` | `#0f4c3a` |
| Vert secondaire, liens, accents ✓ | `green-700` | `#1b6b50` |
| Vert clair, fonds de survol, callout | `green-100` | `#e7f1ec` |
| Accent principal (boutons, dates) | `terracotta` | `#c8714e` |
| Accent survol / eyebrow | `terracotta-dark` | `#a85a3c` |
| Fond de section alterné | `sand` | `#f6f1e9` |
| Fond de page | `cream` | `#fbf8f3` |
| Texte courant | `ink` | `#20251f` |
| Texte secondaire | `muted` | `#5d6b5f` |
| Filets, bordures | `line` | `#e3ddd2` |
| Blanc pur (cartes) | `white` | `#ffffff` |

**Règle d'usage** : le terracotta ne sert jamais de fond de grande surface. Il signale l'action (CTA) et l'état actif. Tout le reste vit dans la gamme verte + neutres chauds.

---

## 3. Typographie

| Rôle | Police | Usage |
|---|---|---|
| Display | **Fraunces** (600) | h1, h2, h3, prix, marque. Serif chaleureux, opsz variable. |
| Corps | **Inter** (400/500/600) | texte courant, navigation, méta, boutons. |

Échelle (déjà posée) :
- h1 : `clamp(2.2rem, 5vw, 3.4rem)`
- h2 : `clamp(1.6rem, 3vw, 2.2rem)`
- h3 : `1.2rem`
- corps : `line-height: 1.6`
- lead : `clamp(1.05rem, 1.6vw, 1.25rem)`, couleur `muted`, `max-width: 52ch`

**Eyebrow** (sur-titre) : Inter 600, majuscules, `letter-spacing: 0.14em`, couleur `terracotta-dark`. Encode la nature de la page (ex. « APPARTEMENT · COURTE DURÉE · SION »).

Chargement : Google Fonts (Fraunces + Inter) avec `preconnect`. En WordPress : héberger les polices en local (RGPD/FADP — pas d'appel Google côté visiteur) via le thème.

---

## 4. Espacements & primitives

- Largeur max contenu : `--maxw: 1140px`
- Gouttière fluide : `--gap: clamp(1.5rem, 4vw, 3rem)`
- Padding de section : `clamp(3rem, 7vw, 5.5rem)`
- Rayons : `--radius: 16px` (cartes) · `--radius-sm: 10px` · boutons `999px` (pill)
- Ombres : `--shadow` (cartes) · `--shadow-sm` (boutons, badges)
- Boutons : pill, `--terracotta` plein (primaire) / fantôme bordé vert (secondaire), micro-lift au survol (`translateY(-1px)`)
- Lien fléché (`.link-arrow`) : flèche `→` qui glisse de 4px au survol

**Accessibilité (plancher, déjà en place — à préserver)** : skip-link, `.sr-only`, focus clavier visible, `prefers-reduced-motion` à respecter sur les animations (pulse du badge, lift des cartes).

---

## 5. Élément signature

Le **badge « bientôt disponible »** à point pulsant (`.soon-badge`) sur le Lot 2 : il transforme une contrainte (photos indisponibles avant fin juillet, cuisine en rénovation) en signal vivant et honnête plutôt qu'en page vide. C'est l'élément mémorable du site — à conserver tel quel et à réutiliser comme motif si d'autres contenus arrivent par étapes.

---

## 6. Structure des pages

### Accueil (`/`)
1. **Hero** — image d'ambiance Sion/Valais + eyebrow + h1 + lead + 2 CTA (vers les 2 lots). *(Image hero encore à fournir — placeholder dégradé vert en attendant.)*
2. **Présentation Sion** (`section--muted`) — texte fourni par Luc (2 paragraphes, définitif).
3. **Les deux lots** — grille de 2 cartes (`.lot-card`) : tag, méta (surface, capacité, prix), description courte, lien fléché.
4. **Piliers** (`.pillars`) — 3-4 arguments (réservation autonome, présentation soignée, gestion de proximité).

### Lot 1 — Location courte durée (`/lot-1/`)
1. **Hero** — photo `lot1-balcon-vue-alpes.jpg` + eyebrow + h1 (« Location courte durée — Sion ») + lead.
2. **Layout 2 colonnes** : colonne large = prose (description, En bref, équipements, quartier, galerie 13 photos) ; colonne étroite = **widget de réservation** (`.booking`, sticky).
   - Brouillon : maquette non fonctionnelle (calendrier visuel + bouton désactivé).
   - WordPress : **MotoPress Hotel Booking + Stripe** (à valider avec Luc).

### Lot 2 — Colocation 4 chambres (`/lot-2/`)
1. **Hero** mode « bientôt » (`hero__media--soon` + `soon-badge`) jusqu'aux photos de fin juillet.
2. **Intro colocation** — 128 m², 250 m gare, dispo 1er septembre, en travaux visitable sur demande, cuisine équipée.
3. **4 cartes chambres** — surface + loyer charges comprises par chambre (9,15 m²/650 · 10,5 m²/720 · 17,20 m²/950 · 25,8 m²+terrasse/1 180 CHF).
4. **Parties communes** — hall, couloir, salle de bain, WC, salon, cuisine.
5. **Formulaire de contact** — pas de paiement en ligne. Champ « durée souhaitée » (annuel / mensuel) **à confirmer avec Luc** (bail annuel par défaut, mensuel possible si demande étudiante insuffisante).

### Global
- **Header** sticky translucide (blur), marque + sous-titre, nav pill (Accueil / Courte durée / Longue durée), burger mobile fonctionnel.
- **Footer** mono-source (coordonnées centralisées). **Pas de numéro de téléphone** (décision Luc — formulaire uniquement).
- Contact final : formulaire réel (backend à câbler en WordPress ; le brouillon pointe vers `preview@caractere.swiss`).

---

## 7. Conventions ACF (ce client)

Stack : ACF Pro + Flexible Content, templates PHP classiques (pas de Gutenberg, pas de builder). Préfixe **`cc_`** + `snake_case`. Groupes synchronisés via `acf-json/` (versionné Git).

**Groupe `cc_accueil`**
- `cc_hero_eyebrow` · `cc_hero_titre` · `cc_hero_lead` · `cc_hero_image`
- `cc_presentation_sion` (WYSIWYG)
- `cc_piliers` (repeater : `cc_pilier_titre`, `cc_pilier_texte`)

**Groupe `cc_lot` (commun aux 2 lots via Flexible Content ou template dédié)**
- `cc_lot_eyebrow` · `cc_lot_titre` · `cc_lot_lead` · `cc_lot_hero_image`
- `cc_lot_description` (WYSIWYG)
- `cc_lot_en_bref` (repeater : `cc_bref_valeur`) — surface, capacité, couchages, distance gare
- `cc_lot_equipements` (repeater : `cc_equipement`)
- `cc_lot_quartier` (WYSIWYG)
- `cc_lot_galerie` (galerie)

**Spécifique Lot 1**
- `cc_lot1_prix_nuit` (number)
- `cc_lot1_reservation_active` (true/false) — bascule maquette ↔ MotoPress

**Spécifique Lot 2**
- `cc_lot2_mode_bientot` (true/false) — pilote le badge « bientôt » + hero soon
- `cc_lot2_chambres` (repeater : `cc_chambre_surface`, `cc_chambre_loyer`, `cc_chambre_terrasse`, `cc_chambre_photo`)
- `cc_lot2_parties_communes` (repeater : `cc_partie_commune`)
- `cc_lot2_dispo_date` (date) — 2026-09-01

---

## 8. À traiter avant / pendant la construction

- [ ] **`src/_data/site.json`** (brouillon) : `description` + `tagline` périmés (décrivent encore le Lot 2 en « grand appartement familial en bail annuel »). À réaligner sur la colocation 4 chambres. *(Action Claude Code sur le brouillon — cohérence, même si le WordPress ne reprend pas ce fichier tel quel.)*
- [ ] **Polices en local** dans le thème WordPress (pas d'appel Google côté visiteur — FADP).
- [ ] **Image hero accueil** à fournir (client) — placeholder en attendant.
- [ ] **Photos Lot 2** (fin juillet) — lèvent le mode « bientôt ».
- [ ] **MotoPress + Stripe** (Lot 1) — validation Luc + compte Stripe Bréval.
- [ ] **Champ « durée souhaitée »** formulaire Lot 2 — validation Luc.

---

_Ce document formalise le design system du brouillon existant pour le porter en WordPress. Il ne rouvre aucune décision validée (palette, typo, terminologie, structure des lots). Toute évolution de fond se décide avec Ilias et se reporte au MASTER depuis le chat Master._
