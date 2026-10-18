# Budget 2026 — sélection d'une ligne budgétaire

Petite application React (Vite) pour saisir une opération budgétaire :
**Église Évangélique des Assemblées de Dieu du Bénin** — exercice 2026.

Trois zones de saisie :

1. **Catégorie budgétaire** — liste déroulante avec recherche intégrée, regroupée par
   **Recettes** et **Dépenses**.
2. **Sous-catégorie** — liste déroulante avec recherche, **dépendante** de la catégorie
   (vidée automatiquement quand on change de catégorie).
3. **Date de l'opération** — champ avec calendrier : sélection des jours, puis des
   **mois** et des **années** en cliquant sur le titre du calendrier.

Chaque catégorie et chaque ligne porte un **détail** qui décrit ce qu'elle couvre :
il s'affiche sous le libellé pendant la recherche, dans l'aide du champ et dans le
récapitulatif. **Aucun montant n'est repris dans l'application** : le fichier source sert
uniquement à établir le plan budgétaire (catégories, lignes, codes et libellés).

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

Tout est dans `src/data/budget.js`, transcrit depuis
`budget-Budget-2026-2026.xlsx` (feuille « Budget », statut DRAFT) :

| Niveau | Contenu | Exemple |
| --- | --- | --- |
| Section | Recettes / Dépenses | — |
| Catégorie | grand poste budgétaire + détail | `REC-01` · Dîmes et offrandes régulières — *Collectes régulières des cultes* |
| Sous-catégorie | ligne budgétaire + détail | `REC-01-01` · Dîmes — *Dîmes mensuelles des membres* |

Les lignes marquées `suggested: true` sont des **compléments cohérents avec le contexte**
(assurances, frais bancaires, entretien de la salle de culte, impôts et taxes, etc.),
absents du fichier d'origine.

Pour ajouter une ligne :

```js
{
  value: 'dep-personnel-05',        // identifiant unique
  code: 'DEP-01-05',                // code budgétaire affiché
  label: 'Frais médicaux du personnel',
  detail: 'Soins et couverture médicale',   // détail affiché sous le libellé
  keywords: 'sante soins',          // mots-clés pour la recherche (facultatif)
  suggested: true,                  // complément proposé (facultatif)
}
```

Helpers exposés par le module : `getSubCategories(category)`, `getCategory(value)` et
`sectionCounts()` (nombre de catégories et de lignes par section).

## Règles de saisie de la date

- **Dates à venir** : grisées et non cliquables dans le calendrier ; une saisie directe
  est refusée avec le message « Cette date n'est pas encore arrivée… ».
- **Hors exercice** : refusé avec « Date antérieure au 01/01/2026 : non autorisée. »
  (borne `min` calculée depuis `BUDGET.exercice` dans `App.jsx`).
- Une date refusée n'est pas transmise : le champ reste modifiable, `Échap` annule la
  saisie et revient à la dernière date validée.

## Utilisation au clavier

| Contexte | Touches |
| --- | --- |
| Listes déroulantes | `↓` / `↑` (ouverture + navigation), `Entrée` (valider), `Échap` (fermer), `Début` / `Fin`, saisie libre pour filtrer (libellé, mot-clé ou code : `DEP-05`) |
| Calendrier (jours) | `→` `←` `↑` `↓` (jour / semaine), `Page↑` `Page↓` (mois), `Maj` + `Page↑` (année), `Début` / `Fin` (semaine), `Entrée` (valider) |
| Calendrier (mois / années) | flèches pour se déplacer, `Entrée` pour descendre d'un niveau |
| Saisie directe | `12/03/2026` puis `Entrée` ou `Tab` (formats : `jj/mm/aaaa`, `jj-mm-aaaa`, `aaaa-mm-jj`) |

La recherche des listes ignore la casse et les accents (« evangelisation » trouve
« Évangélisation »), porte aussi sur les codes budgétaires, et le résultat est surligné.

## Structure

```
src/
  App.jsx                        page : plan budgétaire, formulaire, récapitulatif, historique
  main.jsx                       point d'entrée React
  styles.css                     styles (thème clair/sombre automatique)
  data/budget.js                 catégories et lignes budgétaires 2026 + helpers
  lib/utils.js                   recherche sans accents, utilitaires de dates
  components/
    SearchableSelect.jsx         liste déroulante avec recherche
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

`group` crée les rubriques « Recettes » / « Dépenses » ; `description` reçoit le code et
le détail de la ligne ; `keywords` ne sert qu'à la recherche et n'est jamais affiché.

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
