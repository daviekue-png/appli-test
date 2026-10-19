import { useMemo, useState } from 'react'
import SearchableSelect from './components/SearchableSelect'
import DatePicker from './components/DatePicker'
import { BUDGET, CATEGORIES, SECTIONS, getCategory, sectionCounts } from './data/budget'
import { MIN_QUERY_LENGTH, useSubCategories } from './lib/subCategories'
import { formatFR, formatLongFR } from './lib/utils'

const emptySelection = { category: null, subCategory: null, date: null }

const sectionLabel = (sectionValue) =>
  SECTIONS.find((section) => section.value === sectionValue)?.label ?? ''

/** Choisit la forme singulière ou plurielle d'un libellé. */
const accord = (count, singulier, pluriel) => (count > 1 ? pluriel : singulier)

export default function App() {
  const [selection, setSelection] = useState(emptySelection)
  const [history, setHistory] = useState([])
  const [flash, setFlash] = useState(null)

  const { category, subCategory, date } = selection

  const counts = useMemo(() => sectionCounts(), [])

  // Lignes budgétaires saisies par l'utilisateur (conservées dans le navigateur).
  const { listFor, create, counts: subCategoryCounts } = useSubCategories()

  const createdBySection = useMemo(() => {
    const result = { recettes: 0, depenses: 0 }
    for (const item of CATEGORIES) result[item.section] += subCategoryCounts[item.value] ?? 0
    return result
  }, [subCategoryCounts])

  const categoryOptions = useMemo(
    () =>
      CATEGORIES.map((item) => ({
        value: item.value,
        label: item.label,
        group: sectionLabel(item.section),
        description: `${item.code} · ${item.detail}`,
        keywords: `${item.code} ${item.keywords ?? ''}`,
      })),
    [],
  )

  // Rien n'est proposé d'avance : seules les lignes budgétaires déjà saisies
  // pour la catégorie choisie apparaissent (dès MIN_QUERY_LENGTH lettres).
  const storedSubCategories = useMemo(() => listFor(category), [listFor, category])

  const subCategoryOptions = useMemo(
    () =>
      storedSubCategories.map((line) => ({
        value: line.value,
        label: line.label,
        description: `${line.code} · saisie le ${formatFR(line.createdAt)}`,
        keywords: line.code,
      })),
    [storedSubCategories],
  )

  const selectedCategory = getCategory(category)
  const selectedSubCategory =
    subCategoryOptions.find((item) => item.value === subCategory) ?? null
  const selectedLine = storedSubCategories.find((item) => item.value === subCategory) ?? null

  const isComplete = Boolean(category && subCategory && date)

  const update = (patch) => {
    setSelection((current) => ({ ...current, ...patch }))
    setFlash(null)
  }

  const handleCategoryChange = (nextCategory) => {
    // La liste des lignes budgétaires dépend de la catégorie : on la réinitialise.
    update({ category: nextCategory, subCategory: null })
  }

  /** Crée (si besoin) la ligne budgétaire saisie et la renvoie à la liste déroulante. */
  const handleCreateSubCategory = (rawLabel) => {
    if (!selectedCategory) return null
    return create(selectedCategory, rawLabel)
  }

  const handleSubmit = () => {
    if (!isComplete) return
    setHistory((current) =>
      [
        {
          id: `${Date.now()}`,
          section: sectionLabel(selectedCategory.section),
          category: selectedCategory.label,
          subCategory: selectedSubCategory.label,
          code: selectedLine?.code ?? '',
          date,
        },
        ...current,
      ].slice(0, 4),
    )
    setFlash('Opération enregistrée.')
  }

  const handleReset = () => {
    setSelection(emptySelection)
    setFlash(null)
  }

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__eyebrow">
          Budget {BUDGET.exercice} · {BUDGET.devise} · {BUDGET.statut}
        </p>
        <h1 className="app__title">{BUDGET.organisation}</h1>
        <p className="app__subtitle">
          {BUDGET.entite} — {BUDGET.identification}. Sélectionnez une catégorie budgétaire, sa
          ligne budgétaire puis la date de l’opération.
        </p>
      </header>

      <section className="stats" aria-label="Plan budgétaire">
        <article className="stat stat--recette">
          <p className="stat__label">Recettes</p>
          <p className="stat__value">{counts.recettes.categories} catégories</p>
          <p className="stat__meta">
            {createdBySection.recettes}{' '}
            {accord(createdBySection.recettes, 'ligne budgétaire saisie', 'lignes budgétaires saisies')}
          </p>
        </article>
        <article className="stat stat--depense">
          <p className="stat__label">Dépenses</p>
          <p className="stat__value">{counts.depenses.categories} catégories</p>
          <p className="stat__meta">
            {createdBySection.depenses}{' '}
            {accord(createdBySection.depenses, 'ligne budgétaire saisie', 'lignes budgétaires saisies')}
          </p>
        </article>
        <article className="stat">
          <p className="stat__label">Exercice budgétaire</p>
          <p className="stat__value">{BUDGET.exercice}</p>
          <p className="stat__meta">
            {BUDGET.statut} · {BUDGET.devise} · {BUDGET.source}
          </p>
        </article>
      </section>

      <main className="card">
        <div className="form">
          <SearchableSelect
            id="categorie"
            label="1. Catégorie budgétaire"
            required
            placeholder="Sélectionner une catégorie"
            searchPlaceholder="Rechercher (libellé, code, mot-clé…)"
            emptyMessage="Catégorie introuvable"
            options={categoryOptions}
            value={category}
            onChange={handleCategoryChange}
            hint="Les catégories sont regroupées par recettes et dépenses."
          />

          <SearchableSelect
            id="sous-categorie"
            label="2. Lignes budgétaires"
            required
            creatable
            minChars={MIN_QUERY_LENGTH}
            onCreate={handleCreateSubCategory}
            onCreated={(entry) => setFlash(`Ligne budgétaire « ${entry.label} » enregistrée.`)}
            placeholder={category ? 'Saisir la ligne budgétaire' : 'Choisissez une catégorie'}
            searchPlaceholder={`Saisir au moins ${MIN_QUERY_LENGTH} lettres…`}
            emptyMessage="Aucune ligne budgétaire"
            options={subCategoryOptions}
            value={subCategory}
            onChange={(next) => update({ subCategory: next })}
            disabled={!category}
            hint={
              selectedCategory
                ? subCategoryOptions.length > 0
                  ? `${subCategoryOptions.length} ${accord(subCategoryOptions.length, 'ligne budgétaire déjà saisie', 'lignes budgétaires déjà saisies')} pour « ${selectedCategory.label} » — suggestions dès ${MIN_QUERY_LENGTH} lettres.`
                  : `Aucune ligne budgétaire pour « ${selectedCategory.label} » : saisissez-la, elle sera créée.`
                : 'Choisissez d’abord une catégorie.'
            }
          />

          <DatePicker
            id="date"
            label="3. Date de l’opération"
            required
            value={date}
            onChange={(next) => update({ date: next })}
            disableFuture
            hint="Toutes les dates passées sont acceptées (saisie jj/mm/aaaa : le calendrier suit la frappe). Les dates à venir sont refusées."
          />
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={!isComplete}
          >
            Enregistrer l’opération
          </button>
          <button type="button" className="btn" onClick={handleReset}>
            Réinitialiser
          </button>
          {!isComplete && <span className="actions__hint">Complétez les trois champs.</span>}
        </div>

        <p className="flash" role="status" aria-live="polite">
          {flash ?? ''}
        </p>
      </main>

      <section className="recap" aria-label="Récapitulatif de la sélection">
        <h2 className="recap__title">Récapitulatif</h2>
        <dl className="recap__list">
          <div className="recap__row">
            <dt>Section</dt>
            <dd>
              {selectedCategory ? (
                <span className={`badge badge--${selectedCategory.section}`}>
                  {sectionLabel(selectedCategory.section)}
                </span>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="recap__row">
            <dt>Catégorie</dt>
            <dd>
              {selectedCategory ? (
                <>
                  <span className="recap__value">
                    {selectedCategory.label}
                    <span className="recap__muted"> · {selectedCategory.code}</span>
                  </span>
                  <span className="recap__detail">{selectedCategory.detail}</span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="recap__row">
            <dt>Lignes budgétaires</dt>
            <dd>
              {selectedSubCategory ? (
                <>
                  <span className="recap__value">
                    {selectedSubCategory.label}
                    <span className="recap__muted"> · {selectedLine?.code}</span>
                  </span>
                  <span className="recap__detail">
                    {selectedLine?.createdAt
                      ? `Ligne budgétaire saisie par vous le ${formatFR(selectedLine.createdAt)}`
                      : selectedLine?.detail}
                  </span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="recap__row">
            <dt>Date</dt>
            <dd>
              {date ? (
                <>
                  <span className="recap__value">{formatFR(date)}</span>
                  <span className="recap__detail">{formatLongFR(date)}</span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>

        {history.length > 0 && (
          <div className="history">
            <h3 className="history__title">Dernières opérations</h3>
            <ul className="history__list">
              {history.map((entry) => (
                <li key={entry.id}>
                  <span
                    className={`badge badge--${
                      entry.section === 'Recettes' ? 'recettes' : 'depenses'
                    }`}
                  >
                    {entry.section}
                  </span>{' '}
                  <strong>{entry.category}</strong> › {entry.subCategory}
                  <span className="recap__muted">
                    {' '}
                    · {entry.code} · {formatFR(entry.date)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
