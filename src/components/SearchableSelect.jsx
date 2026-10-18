import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { matches, splitHighlight } from '../lib/utils'

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
}) {
  const generatedId = useId()
  const inputId = id || `select-${generatedId}`
  const listId = `${inputId}-listbox`
  const hintId = hint ? `${inputId}-hint` : undefined

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    return options.filter(
      (option) =>
        matches(option.label, query) ||
        matches(option.description, query) ||
        matches(option.keywords, query),
    )
  }, [options, query])

  const hasGroups = useMemo(() => options.some((option) => option.group), [options])

  // Liste aplatie : rubriques + options, afin de gérer la navigation clavier.
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
    return result
  }, [filtered, hasGroups])

  const selectableIndexes = useMemo(() => {
    const indexes = []
    items.forEach((item, index) => {
      if (item.kind === 'option') indexes.push(index)
    })
    return indexes
  }, [items])

  const activeItem = items[activeIndex]?.kind === 'option' ? items[activeIndex] : null

  const openList = () => {
    if (disabled) return
    setQuery('')
    setOpen(true)
  }

  const closeList = () => {
    setOpen(false)
    setQuery('')
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
    if (!open || selectableIndexes.includes(activeIndex)) return
    setActiveIndex(selectableIndexes[0] ?? -1)
  }, [open, selectableIndexes, activeIndex])

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

  const commit = (option) => {
    if (!option) return
    onChange?.(option.value)
    closeList()
    inputRef.current?.focus()
  }

  const handleKeyDown = (event) => {
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
        if (activeItem) commit(activeItem.option)
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
          aria-activedescendant={
            activeItem ? `${listId}-option-${activeItem.option.value}` : undefined
          }
          placeholder={open ? searchPlaceholder : placeholder}
          value={displayValue}
          onChange={(event) => {
            setQuery(event.target.value)
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
          <ul className="options" role="listbox" id={listId} ref={listRef} aria-label={label}>
            {items.length === 0 && (
              <li className="options__empty">
                <strong>{emptyMessage}</strong>
                <span>Aucune correspondance pour « {query} »</span>
              </li>
            )}

            {items.map((item, index) =>
              item.kind === 'group' ? (
                <li key={item.key} className="options__group" role="presentation">
                  {item.label ?? 'Autres'}
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
        </div>
      )}
    </div>
  )
}
