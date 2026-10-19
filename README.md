# Budget 2026 — saisie d'une opération budgétaire

Petite application React (Vite) pour saisir une opération budgétaire :
**Église Évangélique des Assemblées de Dieu du Bénin** — exercice 2026.

Trois zones de saisie :

1. **Catégorie budgétaire** — liste déroulante avec recherche intégrée, regroupée par
   **Recettes** et **Dépenses**.
2. **Sous-catégorie** — champ **libre** : rien n'est pré-enregistré, chaque utilisateur écrit
   la sienne. Les sous-catégories déjà saisies pour la catégorie choisie réapparaissent dès
   **2 lettres**, et un libellé inconnu est **proposé à la création**.
3. **Date de l'opération** — champ avec calendrier : saisie directe `jj/mm/aaaa` (les `/` sont
   ajoutés automatiquement) ; le calendrier **suit la frappe** (jour, mois puis année), et les
   **mois** / **années** se choisissent aussi en cliquant sur le titre du calendrier.

Chaque catégorie porte un **détail** qui décrit ce qu'elle couvre : il s'affiche sous le
libellé pendant la recherche, dans l'aide du champ et dans le récapitulatif. **Aucun montant
n'est repris dans l'application** : le fichier source sert uniquement à établir le plan
budgétaire (catégories, codes et libellés).

## Démonstration en ligne

L'application est publiée par GitHub Pages :
**https://daviekue-png.github.io/appli-test/**

Chaque push sur `main` déclenche la reconstruction et le redéploiement par le workflow
`.github/workflows/deploy.yml` (build Vite puis publication du dossier `dist/`).

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
```

Autres commandes :

```bash
npm run build    # build de production dans dist/
npm run preview  # sert le build localement
```

Le build utilise des chemins relatifs : `dist/index.html` peut aussi être ouvert
directement par double-clic, sans serveur.

## Données budgétaires

`src/data/budget.js` transcrit `budget-Budget-2026-2026.xlsx` (feuille « Budget », statut
DRAFT) :

| Niveau | Contenu | Exemple |
| --- | --- | --- |
| Section | Recettes / Dépenses | — |
| Catégorie | grand poste budgétaire + détail | `REC-01` · Dîmes et offrandes régulières — *Collectes régulières des cultes* |

**Les sous-catégories ne sont plus préparées à l'avance.** Le fichier conserve les lignes du
plan budgétaire d'origine (codes, libellés, détails, y compris les compléments marqués
`suggested: true`) à titre de référence, mais elles **ne sont plus proposées dans le
formulaire** : chaque utilisateur écrit lui-même ses sous-catégories (voir ci-dessous).

Helpers exposés par le module : `getCategory(value)`, `getSubCategories(category)` (plus
utilisé par l'interface) et `sectionCounts()` (nombre de catégories par section).

## Sous-catégories écrites par les utilisateurs

- Le champ « Sous-catégorie » est **libre** et reste désactivé tant que la catégorie n'a pas
  été choisie ; changer de catégorie remet le champ à zéro.
- Dès **2 lettres**, les sous-catégories **déjà enregistrées pour cette catégorie**
  apparaissent dans la liste déroulante (recherche insensible à la casse et aux accents).
- Si le libellé ne correspond à aucune existante, une entrée **« Créer "…" »** apparaît :
  l'application **demande confirmation** avant de l'enregistrer, puis la sélectionne.
- La comparaison ignore la casse et les accents : taper `dimes` ne recrée pas `Dîmes`.
- Un code est attribué automatiquement (`REC-01-01`, `REC-01-02`, …).

Les sous-catégories créées sont conservées **dans le navigateur**
(`localStorage`, clé `budget-2026:sous-categories`), séparément pour chaque catégorie. Elles
sont donc propres au poste et au navigateur utilisé : l'application n'a pas de serveur. Pour
les partager entre utilisateurs, il suffit de remplacer `readStore` et `writeStore` dans
`src/lib/subCategories.js` par des appels à une API.

## Règles de saisie de la date

- **Clavier** : le champ accepte un clavier **alphanumérique** (le `/` reste disponible) ;
  les `/` sont ajoutés automatiquement pendant la frappe — `12032026` devient
  `12/03/2026`, et un jour/mois à un chiffre reste possible (`5/3/2026`).
- **Le calendrier suit la frappe** : le jour saisi est mis en évidence, puis le mois et
  l'année tapés recalent l'affichage du calendrier, sans attendre la validation.
- **Dates à venir** : grisées et non cliquables dans le calendrier ; une saisie directe
  est refusée avec le message « Cette date n'est pas encore arrivée… ».
- **Hors exercice** : refusé avec « Date antérieure au 01/01/2026 : non autorisée. »
  (borne `min` calculée depuis `BUDGET.exercice` dans `App.jsx`).
- Le message d'erreur n'apparaît que sur une date **complète** : `05/03/20` en cours de
  frappe n'affiche rien.
- Une date refusée n'est pas transmise : le champ reste modifiable, `Échap` annule la
  saisie et revient à la dernière date validée.

## Utilisation au clavier

| Contexte | Touches |
| --- | --- |
| Listes déroulantes | `↓` / `↑` (ouverture + navigation), `Entrée` (valider), `Échap` (fermer), `Début` / `Fin`, saisie libre pour filtrer (libellé, mot-clé ou code : `DEP-05`) |
| Sous-catégorie | taper **au moins 2 lettres**, `↑` / `↓` pour choisir, `Entrée` : le libellé inconnu est créé après confirmation |
| Calendrier (jours) | `→` `←` `↑` `↓` (jour / semaine), `Page↑` `Page↓` (mois), `Maj` + `Page↑` (année), `Début` / `Fin` (semaine), `Entrée` (valider) |
| Calendrier (mois / années) | flèches pour se déplacer, `Entrée` pour descendre d'un niveau |
| Saisie directe de la date | `12/03/2026` ou `12032026` puis `Entrée` ou `Tab` (le calendrier se recale pendant la frappe) |

La recherche des listes ignore la casse et les accents (« evangelisation » trouve
« Évangélisation »), porte aussi sur les codes budgétaires, et le résultat est surligné.

## Structure

```
.github/workflows/deploy.yml     publication automatique sur GitHub Pages
src/
  App.jsx                        page : plan budgétaire, formulaire, récapitulatif, historique
  main.jsx                       point d'entrée React
  styles.css                     styles (thème clair/sombre automatique)
  data/budget.js                 catégories budgétaires 2026 (plan de référence) + helpers
  lib/utils.js                   recherche sans accents, utilitaires de dates
  lib/subCategories.js           sous-catégories écrites par les utilisateurs (localStorage)
  components/
    SearchableSelect.jsx         liste déroulante avec recherche (+ mode « saisie libre »)
    DatePicker.jsx               champ de date + calendrier
```

## API des composants

### `<SearchableSelect />`

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | string | intitulé du champ |
| `options` | array | `{ value, label, description?, keywords?, group? }` |
| `value` / `onChange` | string / `(value) => void` | valeur contrôlée (`null` pour vider) |
| `placeholder`, `searchPlaceholder`, `emptyMessage` | string | textes affichés |
| `disabled`, `required`, `hint`, `allowClear` | bool / string | état et aide |
| `creatable` | bool | active la **saisie libre** : les options n'apparaissent qu'à partir de `minChars` lettres |
| `minChars` | number | nombre de lettres avant affichage des suggestions (2 par défaut) |
| `onCreate` / `onCreated` | `(label) => option` / `(option) => void` | création du libellé inconnu, puis notification (message de confirmation) |
| `createHint`, `createPrompt`, `createNote`, `createActionLabel` | string / fonction | textes de l'aide, de la demande de création et du bouton |

`group` crée les rubriques « Recettes » / « Dépenses » ; `description` reçoit le code et
le détail de la ligne ; `keywords` ne sert qu'à la recherche et n'est jamais affiché.

En mode `creatable`, un libellé sans correspondance (casse et accents ignorés) propose
« Créer "…" » : un clic ouvre une **demande de confirmation** avant d'appeler `onCreate`.

### `<DatePicker />`

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | string | intitulé du champ |
| `value` / `onChange` | `'aaaa-mm-jj'` / `(iso) => void` | date contrôlée (`null` pour vider) |
| `min` / `max` | `'aaaa-mm-jj'` | bornes : les jours hors plage sont grisés et désactivés |
| `disableFuture` | bool | grise et refuse toutes les dates postérieures à aujourd'hui |
| `futureMessage` | string | message affiché quand une date à venir est saisie |
| `invalidMessage` | string | message affiché quand la saisie n'est pas une date valide |
| `placeholder`, `hint` | string | textes affichés |
| `disabled`, `required`, `allowClear` | bool | état et comportement |

```jsx
<DatePicker
  label="Date de l'opération"
  value={date}
  onChange={setDate}
  min="2026-01-01"
  disableFuture
/>
```
