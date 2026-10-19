import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { matches, sameLabel, splitHighlight } from '../lib/utils'

/** Affiche un texte en surlignant la partie qui correspond à la recherche. */
function Highlight({ text, query }) {
  return splitHighlight(text, query).map((segment, index) =>
    segment.match ? (
      <mark key={index}>{segment.text}</mark>
    ) : (
      <span key={index}>{segment.text}</span>
    ),
  )
}

/**
 * Liste déroulante avec recherche intégrée.
 *
 * options : [{ value, label, description?, keywords?, group? }]
 * - `keywords` : synonymes utilisés pour la recherche uniquement
 * - `group` : permet de créer des rubriques dans la liste
 *
 * En mode `creatable`, l'utilisateur écrit lui-même le libellé : les options
 * déjà enregistrées n'apparaissent qu'à partir de `minChars` lettres, et un
 * libellé inconnu déclenche une demande de création (`onCreate`).
 */
export default function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner…',
  searchPlaceholder = 'Rechercher…',
  emptyMessage = 'Aucun résultat',
  disabled = false,
  hint,
  required = false,
  allowClear = true,
  creatable = false,
  minChars = 2,
  onCreate,
  onCreated,
  createHint,
  createPrompt,
  createActionLabel = 'Créer',
  createNote,
}) {
  const generatedId = useId()
  const inputId = id || `select-${generatedId}`
  const listId = `${inputId}-listbox`
  const hintId = hint ? `${inputId}-hint` : undefined

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [confirming, setConfirming] = useState(null)

  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const trimmedQuery = query.trim()

  // En mode libre, on ne propose rien tant que la saisie est trop courte.
  const showSuggestions = !creatable || trimmedQuery.length >= minChars

  const filtered = useMemo(() => {
    if (!showSuggestions) return []
    if (!trimmedQuery) return options
    return options.filter(
      (option) =>
        matches(option.label, query) ||
        matches(option.description, query) ||
        matches(option.keywords, query),
    )
  }, [options, query, trimmedQuery, showSuggestions])

  // Un libellé inconnu peut être créé (jamais en double : casse/accents ignorés).
  const canCreate = useMemo(
    () =>
      Boolean(
        creatable &&
          showSuggestions &&
          trimmedQuery &&
          onCreate &&
          !options.some((option) => sameLabel(option.label, trimmedQuery)),
      ),
    [creatable, showSuggestions, trimmedQuery, onCreate, options],
  )

  const hasGroups = useMemo(() => options.some((option) => option.group), [options])

  // Liste aplatie : rubriques, options puis « créer », afin de gérer le clavier.
  const items = useMemo(() => {
    const result = []
    let currentGroup
    for (const option of filtered) {
      const group = option.group ?? null
      if (hasGroups && group !== currentGroup) {
        result.push({ kind: 'group', key: `group-${group ?? 'autres'}-${result.length}`, label: group })
        currentGroup = group
      }
      result.push({ kind: 'option', key: option.value, option })
    }
    if (canCreate) result.push({ kind: 'create', key: '__create__', label: trimmedQuery })
    return result
  }, [filtered, hasGroups, canCreate, trimmedQuery])

  const isSelectable = (item) => item?.kind === 'option' || item?.kind === 'create'

  const selectableIndexes = useMemo(() => {
    const indexes = []
    items.forEach((item, index) => {
      if (isSelectable(item)) indexes.push(index)
    })
    return indexes
  }, [items])

  const activeItem = isSelectable(items[activeIndex]) ? items[activeIndex] : null

  const openList = () => {
    if (disabled) return
    setQuery('')
    setConfirming(null)
    setOpen(true)
  }

  const closeList = () => {
    setOpen(false)
    setQuery('')
    setConfirming(null)
    setActiveIndex(-1)
  }

  // À l'ouverture : positionner la sélection sur la valeur courante.
  useEffect(() => {
    if (!open) return
    const selectedIndex = items.findIndex(
      (item) => item.kind === 'option' && item.option.value === value,
    )
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : (selectableIndexes[0] ?? -1))
    inputRef.current?.focus()
    // Uniquement à l'ouverture de la liste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Après un filtrage, garder un index actif valide.
  useEffect(() => {
    if (!open || confirming || selectableIndexes.includes(activeIndex)) return
    setActiveIndex(selectableIndexes[0] ?? -1)
  }, [open, confirming, selectableIndexes, activeIndex])

  // Garder l'option active visible.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  // Fermeture au clic extérieur / perte du focus.
  useEffect(() => {
    if (!open) return
    const handleOutside = (event) => {
      if (!wrapRef.current?.contains(event.target)) closeList()
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('focusin', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('focusin', handleOutside)
    }
  }, [open])

  const moveActive = (delta) => {
    if (!selectableIndexes.length) return
    const position = selectableIndexes.indexOf(activeIndex)
    const nextPosition =
      position === -1
        ? delta > 0
          ? 0
          : selectableIndexes.length - 1
        : (position + delta + selectableIndexes.length) % selectableIndexes.length
    setActiveIndex(selectableIndexes[nextPosition])
  }

  /** Demande confirmation avant de créer une sous-catégorie inconnue. */
  const askCreate = (rawLabel) => {
    const label = String(rawLabel ?? '').trim()
    if (!label) return
    setActiveIndex(-1)
    setConfirming(label)
  }

  const confirmCreate = () => {
    const label = confirming
    if (!label) return
    const created = onCreate?.(label)
    setConfirming(null)
    if (!created) return
    onChange?.(created.value ?? created.label ?? label)
    closeList()
    // Prévenu après la sélection : le message n'est pas écrasé par la mise à jour.
    onCreated?.(created)
    inputRef.current?.focus()
  }

  const commit = (option) => {
    if (!option) return
    onChange?.(option.value)
    closeList()
    inputRef.current?.focus()
  }

  const activate = (item) => {
    if (item.kind === 'create') askCreate(item.label)
    else if (item.kind === 'option') commit(item.option)
  }

  const handleKeyDown = (event) => {
    if (confirming) {
      if (event.key === 'Enter') {
        event.preventDefault()
        confirmCreate()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setConfirming(null)
        inputRef.current?.focus()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (open) moveActive(1)
        else openList()
        break
      case 'ArrowUp':
        event.preventDefault()
        if (open) moveActive(-1)
        else openList()
        break
      case 'Home':
        if (open) {
          event.preventDefault()
          setActiveIndex(selectableIndexes[0] ?? -1)
        }
        break
      case 'End':
        if (open) {
          event.preventDefault()
          setActiveIndex(selectableIndexes[selectableIndexes.length - 1] ?? -1)
        }
        break
      case 'Enter':
        event.preventDefault()
        if (!open) {
          openList()
          break
        }
        if (activeItem) activate(activeItem)
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          closeList()
        }
        break
      case 'Tab':
        if (open) closeList()
        break
      default:
        break
    }
  }

  const displayValue = open ? query : (selected?.label ?? '')

  const activeDescendant = activeItem
    ? activeItem.kind === 'create'
      ? `${listId}-create`
      : `${listId}-option-${activeItem.option.value}`
    : undefined

  return (
    <div
      className={[
        'field',
        open && 'field--open',
        disabled && 'field--disabled',
        selected && 'field--filled',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={wrapRef}
    >
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="control">
        <input
          id={inputId}
          ref={inputRef}
          className="control__input control__input--select"
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck="false"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-required={required || undefined}
          aria-describedby={hintId}
          aria-activedescendant={activeDescendant}
          placeholder={open ? searchPlaceholder : placeholder}
          value={displayValue}
          onChange={(event) => {
            setQuery(event.target.value)
            setConfirming(null)
            if (!open) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onClick={() => {
            if (!open) openList()
          }}
        />

        {allowClear && selected && !disabled && (
          <button
            type="button"
            className="control__icon"
            aria-label="Effacer la sélection"
            title="Effacer"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange?.(null)
              closeList()
              inputRef.current?.focus()
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}

        <button
          type="button"
          className="control__icon control__icon--chevron"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? 'Fermer la liste' : 'Ouvrir la liste'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (open ? closeList() : openList())}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {open && (
        <div className="popover" onMouseDown={(event) => event.preventDefault()}>
          {confirming ? (
            <div className="options__confirm" role="group" aria-label="Confirmer la création">
              <p className="options__confirm-text">
                {createPrompt
                  ? createPrompt(confirming)
                  : (
                      <>
                        <strong>« {confirming} »</strong> n’existe pas encore.
                      </>
                    )}
              </p>
              <p className="options__confirm-sub">
                {createNote ??
                  `Elle sera créée maintenant, puis proposée les prochaines fois dès ${minChars} lettres.`}
              </p>
              <div className="options__confirm-actions">
                <button
                  type="button"
                  className="options__btn options__btn--primary"
                  onClick={confirmCreate}
                >
                  {createActionLabel}
                </button>
                <button
                  type="button"
                  className="options__btn"
                  onClick={() => {
                    setConfirming(null)
                    inputRef.current?.focus()
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <ul className="options" role="listbox" id={listId} ref={listRef} aria-label={label}>
              {items.length === 0 && (
                <li className="options__empty">
                  {creatable && !showSuggestions ? (
                    <>
                      <strong>{minChars} lettres minimum</strong>
                      <span>
                        {createHint ??
                          `Saisissez au moins ${minChars} lettres pour revoir les sous-catégories déjà enregistrées.`}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>{emptyMessage}</strong>
                      <span>Aucune correspondance pour « {query} »</span>
                    </>
                  )}
                </li>
              )}

              {items.map((item, index) =>
                item.kind === 'group' ? (
                  <li key={item.key} className="options__group" role="presentation">
                    {item.label ?? 'Autres'}
                  </li>
                ) : item.kind === 'create' ? (
                  <li
                    key={item.key}
                    id={`${listId}-create`}
                    role="option"
                    data-index={index}
                    aria-selected={false}
                    className={['options__item', 'options__create', index === activeIndex && 'is-active']
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => askCreate(item.label)}
                  >
                    <span className="options__label">
                      <span className="options__create-icon" aria-hidden="true">
                        +
                      </span>
                      Créer « {item.label} »
                    </span>
                    <span className="options__desc">Ce libellé n’existe pas encore.</span>
                  </li>
                ) : (
                  <li
                    key={item.key}
                    id={`${listId}-option-${item.option.value}`}
                    role="option"
                    data-index={index}
                    aria-selected={item.option.value === value}
                    className={[
                      'options__item',
                      index === activeIndex && 'is-active',
                      item.option.value === value && 'is-selected',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(item.option)}
                  >
                    <span className="options__label">
                      <Highlight text={item.option.label} query={query} />
                    </span>
                    {item.option.description && (
                      <span className="options__desc">
                        <Highlight text={item.option.description} query={query} />
                      </span>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
