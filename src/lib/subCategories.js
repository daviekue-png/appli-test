/**
 * Lignes budgétaires saisies par les utilisateurs.
 *
 * Aucune ligne budgétaire n'est fournie d'avance : c'est l'utilisateur qui les
 * écrit. La première fois qu'un libellé apparaît, l'application propose de le
 * créer ; ensuite il est proposé dans la liste dès les premières lettres.
 *
 * L'application n'a pas de serveur : les lignes budgétaires créées sont conservées
 * dans le navigateur (localStorage), séparément pour chaque catégorie
 * budgétaire. Pour les partager entre utilisateurs, il suffira de remplacer
 * `readStore` et `writeStore` par des appels à une API.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { sameLabel, slugify } from './utils'

export const SUB_CATEGORIES_STORAGE_KEY = 'budget-2026:sous-categories'

/** Nombre de lettres à saisir avant que les suggestions apparaissent. */
export const MIN_QUERY_LENGTH = 2

/** Ligne budgétaire déjà créée dont le libellé correspond (casse/accents ignorés). */
export function findSubCategory(list, label) {
  if (!label) return null
  return list.find((item) => sameLabel(item.label, label)) ?? null
}

/** Nettoie un libellé saisi : espaces multiples réduits, bords retirés. */
export function cleanLabel(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function readStore() {
  try {
    const raw = globalThis.localStorage?.getItem(SUB_CATEGORIES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  try {
    globalThis.localStorage?.setItem(SUB_CATEGORIES_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Stockage indisponible (navigation privée, quota) : la session reste utilisable.
  }
}

/**
 * Accès aux lignes budgétaires créées.
 *
 * - `listFor(categoryValue)` : lignes budgétaires d'une catégorie ;
 * - `create(category, label)` : crée la ligne budgétaire si besoin et la renvoie ;
 * - `counts` : nombre de lignes budgétaires par catégorie ;
 * - `total` : nombre total de lignes budgétaires créées.
 */
export function useSubCategories() {
  const [store, setStore] = useState(readStore)

  useEffect(() => {
    writeStore(store)
  }, [store])

  const listFor = useCallback(
    (categoryValue) => (categoryValue ? (store[categoryValue] ?? []) : []),
    [store],
  )

  const create = useCallback(
    (category, rawLabel) => {
      const label = cleanLabel(rawLabel)
      if (!category || !label) return null

      const current = store[category.value] ?? []
      const existing = findSubCategory(current, label)
      if (existing) return existing

      const entry = {
        value: slugify(label) || `ligne-budgetaire-${Date.now()}`,
        label,
        code: `${category.code}-${String(current.length + 1).padStart(2, '0')}`,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setStore((previous) => ({
        ...previous,
        [category.value]: [...(previous[category.value] ?? []), entry],
      }))
      return entry
    },
    [store],
  )

  const counts = useMemo(() => {
    const result = {}
    for (const [key, list] of Object.entries(store)) result[key] = list.length
    return result
  }, [store])

  const total = useMemo(
    () => Object.values(store).reduce((sum, list) => sum + list.length, 0),
    [store],
  )

  return { store, listFor, create, counts, total }
}
