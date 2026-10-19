import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  MONTHS_FR,
  MONTHS_SHORT_FR,
  WEEKDAYS_FR,
  addToISO,
  buildMonthGrid,
  capitalize,
  formatFR,
  formatLongFR,
  fromISO,
  maskDateInput,
  parseDateInput,
  parsePartialDate,
  toISO,
  todayISO,
} from '../lib/utils'

const YEARS_PER_PAGE = 12
const MONTH_COLUMNS = 4
const YEAR_COLUMNS = 4

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/** État interne du calendrier, recalculé à chaque ouverture. */
function buildNav(iso) {
  const parts = fromISO(iso) || fromISO(todayISO())
  const year = parts.year
  const month = parts.month
  return {
    view: 'days',
    focused: toISO(year, month, parts.day),
    year,
    month,
    focusMonth: month,
    focusYear: year,
    yearStart: Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE,
  }
}

/**
 * Champ de saisie de date avec calendrier.
 * La navigation se fait au clavier dans l'en-tête (mois / année) puis dans la grille.
 */
export default function DatePicker({
  id,
  label,
  value,
  onChange,
  min,
  max,
  disableFuture = false,
  futureMessage = 'Cette date n’est pas encore arrivée : elle ne peut pas être sélectionnée.',
  invalidMessage = 'Date invalide. Utilisez le format jj/mm/aaaa.',
  placeholder = 'jj/mm/aaaa',
  disabled = false,
  hint,
  required = false,
  allowClear = true,
}) {
  const generatedId = useId()
  const inputId = id || `date-${generatedId}`
  const calendarId = `${inputId}-calendar`
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = `${inputId}-error`

  const [open, setOpen] = useState(false)
  const [nav, setNav] = useState(() => buildNav(value))
  const [text, setText] = useState(() => formatFR(value))
  const [error, setError] = useState(null)

  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  const today = todayISO()

  // Les dates à venir sont refusées : aujourd'hui devient la borne haute.
  const upperBound = disableFuture && (!max || max > today) ? today : max

  // Synchronisation quand la valeur change depuis l'extérieur.
  useEffect(() => {
    setText(formatFR(value))
  }, [value])

  const openCalendar = () => {
    if (disabled) return
    setNav(buildNav(value))
    setOpen(true)
  }

  const closeCalendar = () => {
    setOpen(false)
    setText(formatFR(value))
    setError(null)
  }

  const isOutOfRange = (iso) => Boolean((min && iso < min) || (upperBound && iso > upperBound))

  /** Motif du refus, ou null si la date est acceptée. */
  const rangeErrorFor = (iso) => {
    if (!iso) return null
    if (min && iso < min) return `Date antérieure au ${formatFR(min)} : non autorisée.`
    if (upperBound && iso > upperBound) {
      if (disableFuture && iso > today) return futureMessage
      return `Date postérieure au ${formatFR(upperBound)} : non autorisée.`
    }
    return null
  }

  /**
   * Fait suivre le calendrier à la frappe : le mois puis l'année défilent et
   * le jour saisi est mis en évidence, sans exiger une date complète.
   */
  const followText = (raw) => {
    const partial = parsePartialDate(raw)
    if (partial.day === null && partial.month === null && partial.year === null) return

    setNav((current) => {
      const year = partial.year ?? current.year
      const month = partial.month ?? current.month
      const maxDay = new Date(year, month + 1, 0).getDate()
      const day = partial.day ? Math.min(partial.day, maxDay) : 1
      return {
        ...current,
        view: 'days',
        year,
        month,
        focusMonth: month,
        focusYear: year,
        yearStart: Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE,
        focused: toISO(year, month, day),
      }
    })
  }

  const selectDay = (iso) => {
    if (isOutOfRange(iso)) return
    setError(null)
    onChange?.(iso)
    setText(formatFR(iso))
    setOpen(false)
    inputRef.current?.focus()
  }

  /** Analyse la saisie clavier : vide, invalide, hors bornes ou acceptée. */
  const validateText = () => {
    const trimmed = text.trim()
    if (!trimmed) return { status: 'empty', iso: null }
    const parsed = parseDateInput(trimmed)
    if (!parsed) return { status: 'invalid', iso: null }
    const rangeError = rangeErrorFor(parsed)
    if (rangeError) return { status: 'range', iso: parsed, message: rangeError }
    return { status: 'ok', iso: parsed }
  }

  /**
   * Valide la saisie clavier.
   * Une date refusée reste affichée mais n'est pas retenue : un message l'explique.
   * Retourne true si la saisie a été acceptée.
   */
  const commitText = () => {
    const result = validateText()

    if (result.status === 'ok') {
      setError(null)
      if (result.iso !== value) onChange?.(result.iso)
      setText(formatFR(result.iso))
      return true
    }

    if (result.status === 'empty') {
      setError(null)
      if (!allowClear) {
        setText(formatFR(value))
        return false
      }
      if (value !== null) onChange?.(null)
      setText('')
      return true
    }

    setError(result.status === 'invalid' ? invalidMessage : result.message)
    return false
  }

  /** Valide la saisie puis ouvre le calendrier sur la date saisie. */
  const openWithText = () => {
    if (disabled) return
    const result = validateText()

    if (result.status === 'ok' || result.status === 'empty') {
      const nextValue = result.status === 'ok' ? result.iso : null
      setError(null)
      if (result.status === 'ok') {
        if (nextValue !== value) onChange?.(nextValue)
        setText(formatFR(nextValue))
      } else if (allowClear && value !== null) {
        onChange?.(null)
        setText('')
      } else if (!allowClear) {
        setText(formatFR(value))
      }
      setNav(buildNav(nextValue))
      setOpen(true)
      return
    }

    // Saisie refusée : on informe et le calendrier ne s'ouvre pas.
    setError(result.status === 'invalid' ? invalidMessage : result.message)
    setOpen(false)
  }

  /* ------------------------------------------------------- navigation */

  const moveFocus = ({ days = 0, months = 0, years = 0 }) => {
    setNav((current) => {
      const iso = addToISO(current.focused, { days, months, years })
      const parts = fromISO(iso) || fromISO(today)
      return { ...current, focused: iso, year: parts.year, month: parts.month }
    })
  }

  const startOfWeek = (iso) => {
    const parts = fromISO(iso)
    if (!parts) return iso
    const day = new Date(parts.year, parts.month, parts.day).getDay()
    const offset = (day + 6) % 7
    return addToISO(iso, { days: -offset })
  }

  const goToMonthView = () => {
    setNav((current) => ({ ...current, view: 'months', focusMonth: current.month }))
  }

  const goToYearView = () => {
    setNav((current) => ({
      ...current,
      view: 'years',
      focusYear: current.year,
      yearStart: Math.floor(current.year / YEARS_PER_PAGE) * YEARS_PER_PAGE,
    }))
  }

  const chooseMonth = (month) => {
    setNav((current) => {
      const focusedParts = fromISO(current.focused) || fromISO(today)
      const maxDay = new Date(current.year, month + 1, 0).getDate()
      return {
        ...current,
        view: 'days',
        month,
        focusMonth: month,
        focused: toISO(current.year, month, Math.min(focusedParts.day, maxDay)),
      }
    })
  }

  const chooseYear = (year) => {
    setNav((current) => {
      const focusedParts = fromISO(current.focused) || fromISO(today)
      const maxDay = new Date(year, current.focusMonth + 1, 0).getDate()
      return {
        ...current,
        view: 'months',
        year,
        focusYear: year,
        focused: toISO(year, current.focusMonth, Math.min(focusedParts.day, maxDay)),
      }
    })
  }

  const step = (direction) => {
    setNav((current) => {
      if (current.view === 'days') {
        const date = new Date(current.year, current.month + direction, 1)
        const month = date.getMonth()
        const year = date.getFullYear()
        const focusedParts = fromISO(current.focused) || fromISO(today)
        const maxDay = new Date(year, month + 1, 0).getDate()
        return {
          ...current,
          year,
          month,
          focusMonth: month,
          focused: toISO(year, month, Math.min(focusedParts.day, maxDay)),
        }
      }
      if (current.view === 'months') {
        const year = current.year + direction
        return { ...current, year, focusYear: year }
      }
      const yearStart = current.yearStart + direction * YEARS_PER_PAGE
      return { ...current, yearStart, focusYear: yearStart }
    })
  }

  const handleKeyDown = (event) => {
    const { key } = event

    if (key === 'Escape') {
      if (open) {
        event.preventDefault()
        closeCalendar()
      } else if (error) {
        // Annule une saisie refusée : on revient à la date validée.
        event.preventDefault()
        setText(formatFR(value))
        setError(null)
      }
      return
    }

    if (key === 'Tab') {
      if (open) {
        commitText()
        setOpen(false)
      }
      return
    }

    if (!open) {
      if (key === 'ArrowDown') {
        event.preventDefault()
        openCalendar()
      } else if (key === 'Enter') {
        event.preventDefault()
        openWithText()
      }
      return
    }

    if (nav.view === 'days') {
      switch (key) {
        case 'ArrowLeft':
          event.preventDefault()
          moveFocus({ days: -1 })
          return
        case 'ArrowRight':
          event.preventDefault()
          moveFocus({ days: 1 })
          return
        case 'ArrowUp':
          event.preventDefault()
          moveFocus({ days: -7 })
          return
        case 'ArrowDown':
          event.preventDefault()
          moveFocus({ days: 7 })
          return
        case 'PageUp':
          event.preventDefault()
          moveFocus(event.shiftKey ? { years: -1 } : { months: -1 })
          return
        case 'PageDown':
          event.preventDefault()
          moveFocus(event.shiftKey ? { years: 1 } : { months: 1 })
          return
        case 'Home':
          event.preventDefault()
          setNav((current) => {
            const iso = startOfWeek(current.focused)
            const parts = fromISO(iso)
            return { ...current, focused: iso, year: parts.year, month: parts.month }
          })
          return
        case 'End':
          event.preventDefault()
          setNav((current) => {
            const iso = addToISO(startOfWeek(current.focused), { days: 6 })
            const parts = fromISO(iso)
            return { ...current, focused: iso, year: parts.year, month: parts.month }
          })
          return
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (isOutOfRange(nav.focused)) setError(rangeErrorFor(nav.focused))
          else selectDay(nav.focused)
          return
        default:
          break
      }
      return
    }

    if (nav.view === 'months') {
      switch (key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          event.preventDefault()
          setNav((current) => ({
            ...current,
            focusMonth: clamp(current.focusMonth + (key === 'ArrowRight' ? 1 : -1), 0, 11),
          }))
          return
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault()
          setNav((current) => ({
            ...current,
            focusMonth: clamp(
              current.focusMonth + (key === 'ArrowDown' ? MONTH_COLUMNS : -MONTH_COLUMNS),
              0,
              11,
            ),
          }))
          return
        case 'Enter':
        case ' ':
          event.preventDefault()
          chooseMonth(nav.focusMonth)
          return
        default:
          break
      }
      return
    }

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault()
        setNav((current) => ({
          ...current,
          focusYear: clamp(
            current.focusYear + (key === 'ArrowRight' ? 1 : -1),
            current.yearStart,
            current.yearStart + YEARS_PER_PAGE - 1,
          ),
        }))
        return
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault()
        setNav((current) => ({
          ...current,
          focusYear: clamp(
            current.focusYear + (key === 'ArrowDown' ? YEAR_COLUMNS : -YEAR_COLUMNS),
            current.yearStart,
            current.yearStart + YEARS_PER_PAGE - 1,
          ),
        }))
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        chooseYear(nav.focusYear)
        return
      default:
        break
    }
  }

  // Fermeture au clic extérieur / perte du focus.
  useEffect(() => {
    if (!open) return
    const handleOutside = (event) => {
      if (!wrapRef.current?.contains(event.target)) closeCalendar()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value, text])

  const grid = useMemo(() => buildMonthGrid(nav.year, nav.month), [nav.year, nav.month])

  const title =
    nav.view === 'days'
      ? capitalize(`${MONTHS_FR[nav.month]} ${nav.year}`)
      : nav.view === 'months'
        ? String(nav.year)
        : `${nav.yearStart} – ${nav.yearStart + YEARS_PER_PAGE - 1}`

  return (
    <div
      className={[
        'field',
        open && 'field--open',
        disabled && 'field--disabled',
        value && 'field--filled',
        error && 'field--error',
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
          className="control__input control__input--date"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck="false"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-controls={calendarId}
          aria-required={required || undefined}
          aria-describedby={
            [hintId, error ? errorId : null].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={error ? 'true' : undefined}
          placeholder={placeholder}
          value={text}
          onChange={(event) => {
            // Masque jj/mm/aaaa : les « / » s'ajoutent au fil de la frappe.
            const next = maskDateInput(event.target.value)
            setText(next)
            // Contrôle immédiat, mais seulement sur une date complète : pendant
            // la frappe (« 05/03/20 »), aucun message d'erreur intempestif.
            const annee = next.split(/[^\d]+/)[2]
            const parsed = annee?.length === 4 ? parseDateInput(next.trim()) : null
            setError(parsed ? rangeErrorFor(parsed) : null)
            // Le calendrier suit la saisie du jour, du mois puis de l'année.
            followText(next)
            if (next) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onBlur={commitText}
          onClick={() => {
            if (!open) openCalendar()
          }}
        />

        {allowClear && value && !disabled && (
          <button
            type="button"
            className="control__icon"
            aria-label="Effacer la date"
            title="Effacer"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setError(null)
              onChange?.(null)
              setText('')
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
          className="control__icon control__icon--calendar"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? 'Fermer le calendrier' : 'Ouvrir le calendrier'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (open ? closeCalendar() : openWithText())}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
            <path d="M3.5 10h17M8 3.5V7M16 3.5V7" />
          </svg>
        </button>
      </div>

      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="field__error" id={errorId} role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v6M12 16.5h.01" />
          </svg>
          {error}
        </p>
      )}

      {open && (
        <div
          className="popover popover--calendar"
          id={calendarId}
          role="dialog"
          aria-label="Calendrier"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div className="calendar__header">
            <button
              type="button"
              className="calendar__nav"
              aria-label="Précédent"
              onClick={() => step(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>

            <button
              type="button"
              className="calendar__title"
              aria-label={`Changer de vue (${title})`}
              onClick={() => {
                if (nav.view === 'days') goToMonthView()
                else if (nav.view === 'months') goToYearView()
              }}
            >
              {title}
              {nav.view !== 'years' && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="calendar__title-icon">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="calendar__nav"
              aria-label="Suivant"
              onClick={() => step(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {nav.view === 'days' && (
            <>
              <div className="calendar__weekdays" aria-hidden="true">
                {WEEKDAYS_FR.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar__grid">
                {grid.map((cell) => {
                  const isDisabled = isOutOfRange(cell.iso)
                  const isFuture = disableFuture && cell.iso > today
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      className={[
                        'calendar__day',
                        !cell.inMonth && 'is-outside',
                        cell.weekend && 'is-weekend',
                        isDisabled && 'is-disabled',
                        cell.iso === today && 'is-today',
                        cell.iso === value && 'is-selected',
                        cell.iso === nav.focused && 'is-focused',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={isDisabled}
                      aria-disabled={isDisabled || undefined}
                      aria-label={
                        isDisabled
                          ? `${formatLongFR(cell.iso)} — ${
                              isFuture ? 'date non encore arrivée' : 'date non disponible'
                            }`
                          : formatLongFR(cell.iso)
                      }
                      title={
                        isDisabled
                          ? isFuture
                            ? 'Date non encore arrivée'
                            : 'Date non disponible'
                          : undefined
                      }
                      aria-current={cell.iso === today ? 'date' : undefined}
                      onClick={() => selectDay(cell.iso)}
                      onMouseEnter={() =>
                        !isDisabled &&
                        setNav((current) =>
                          current.focused === cell.iso ? current : { ...current, focused: cell.iso },
                        )
                      }
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {nav.view === 'months' && (
            <div className="calendar__grid calendar__grid--tiles">
              {MONTHS_SHORT_FR.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  className={[
                    'calendar__tile',
                    index === nav.month && 'is-selected',
                    index === nav.focusMonth && 'is-focused',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => chooseMonth(index)}
                  onMouseEnter={() =>
                    setNav((current) =>
                      current.focusMonth === index ? current : { ...current, focusMonth: index },
                    )
                  }
                >
                  {month}
                </button>
              ))}
            </div>
          )}

          {nav.view === 'years' && (
            <div className="calendar__grid calendar__grid--tiles">
              {Array.from({ length: YEARS_PER_PAGE }, (_, index) => nav.yearStart + index).map(
                (year) => (
                  <button
                    key={year}
                    type="button"
                    className={[
                      'calendar__tile',
                      year === nav.year && 'is-selected',
                      year === nav.focusYear && 'is-focused',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => chooseYear(year)}
                    onMouseEnter={() =>
                      setNav((current) =>
                        current.focusYear === year ? current : { ...current, focusYear: year },
                      )
                    }
                  >
                    {year}
                  </button>
                ),
              )}
            </div>
          )}

          <div className="calendar__footer">
            <button
              type="button"
              className="calendar__action"
              onClick={() => {
                if (isOutOfRange(today)) return
                setNav(buildNav(today))
                selectDay(today)
              }}
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              className="calendar__action calendar__action--muted"
              onClick={() => {
                setOpen(false)
                setText('')
                setError(null)
                onChange?.(null)
              }}
            >
              Effacer
            </button>
          </div>

          {disableFuture && (
            <p className="calendar__note">
              Les dates à venir sont grisées : elles ne sont pas encore arrivées.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
